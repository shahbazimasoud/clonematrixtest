#!/usr/bin/env bash
# ==============================================================================
# Ketesa Admin Matrix Stack Installer Script (Production-Ready)
# Compatible with Ubuntu 20.04/22.04 LTS and Debian 11/12
# ==============================================================================

set -eo pipefail

# Make script completely non-interactive for package managers
export DEBIAN_FRONTEND=noninteractive
export APT_LISTCHANGES_FRONTEND=none

# Colors for terminal output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# Helper functions for logging
log_info() { echo -e "${BLUE}[INFO]${NC} $1"; }
log_step() { echo -e "${CYAN}[STEP]${NC} $1"; }
log_success() { echo -e "${GREEN}[SUCCESS]${NC} $1"; }
log_warning() { echo -e "${YELLOW}[WARNING]${NC} $1"; }
log_error() { echo -e "${RED}[ERROR]${NC} $1"; }

# Check privileges
if [ "$EUID" -ne 0 ]; then
  log_error "Please run this script as root (sudo)."
  exit 1
fi

# Load variables or use defaults
CONFIG_FILE="/etc/matrix-stack.conf"
if [ -f "$CONFIG_FILE" ]; then
  log_info "Loading configuration from $CONFIG_FILE..."
  source "$CONFIG_FILE"
fi

HS_DOMAIN="${HS_DOMAIN:-matrix.company.local}"
ELEMENT_DOMAIN="${ELEMENT_DOMAIN:-chat.company.local}"
BASE_DOMAIN="${BASE_DOMAIN:-company.local}"
PUBLIC_IP="${PUBLIC_IP:-$(hostname -I | awk '{print $1}')}"
LE_EMAIL="${LE_EMAIL:-admin@$BASE_DOMAIN}"
SSL_MODE="${SSL_MODE:-selfsigned}"
PG_DB="${PG_DB:-synapse}"
PG_USER="${PG_USER:-synapse_user}"
PG_PASS="${PG_PASS:-synapse_pass}"
PG_HOST="${PG_HOST:-localhost}"
PG_PORT="${PG_PORT:-5432}"

# Active components to install (defaults)
INSTALL_SYNAPSE="${INSTALL_SYNAPSE:-true}"
INSTALL_ELEMENT="${INSTALL_ELEMENT:-true}"
INSTALL_POSTGRES="${INSTALL_POSTGRES:-true}"
INSTALL_COTURN="${INSTALL_COTURN:-true}"
INSTALL_NGINX="${INSTALL_NGINX:-true}"

# Ensure system package index is updated
log_step "Updating local package catalogs..."
apt-get update -y

# ------------------------------------------------------------------------------
# 1. PostgreSQL Database Server Setup
# ------------------------------------------------------------------------------
if [ "$INSTALL_POSTGRES" = "true" ]; then
  log_step "Installing PostgreSQL database cluster..."
  apt-get install -y -o Dpkg::Options::="--force-confdef" -o Dpkg::Options::="--force-confold" postgresql postgresql-contrib

  log_info "Configuring PostgreSQL access controls..."
  # Ensure the database and user exist
  sudo -u postgres psql -c "CREATE USER $PG_USER WITH PASSWORD '$PG_PASS';" || log_warning "User $PG_USER already exists or error encountered."
  sudo -u postgres psql -c "CREATE DATABASE $PG_DB OWNER $PG_USER ENCODING 'UTF8';" || log_warning "Database $PG_DB already exists or error encountered."
  sudo -u postgres psql -c "GRANT ALL PRIVILEGES ON DATABASE $PG_DB TO $PG_USER;"

  # Adjust pg_hba.conf for local md5 access
  PG_VERSION=$(psql --version | awk '{print $3}' | cut -d. -f1)
  HBA_CONF="/etc/postgresql/$PG_VERSION/main/pg_hba.conf"
  if [ -f "$HBA_CONF" ]; then
    log_info "Updating $HBA_CONF with md5 authorization rule..."
    echo "local   $PG_DB   $PG_USER                               md5" >> "$HBA_CONF"
    systemctl restart postgresql
  fi
  log_success "PostgreSQL server ready & listening on port $PG_PORT."
fi

# ------------------------------------------------------------------------------
# 2. Matrix Synapse Homeserver Setup
# ------------------------------------------------------------------------------
if [ "$INSTALL_SYNAPSE" = "true" ]; then
  log_step "Setting up Synapse GPG key and official repositories..."
  apt-get install -y -o Dpkg::Options::="--force-confdef" -o Dpkg::Options::="--force-confold" lsb-release wget apt-transport-https
  
  wget -O /usr/share/keyrings/matrix-org-archive-keyring.gpg https://packages.matrix.org/debian/matrix-org-archive-keyring.gpg || true
  echo "deb [signed-by=/usr/share/keyrings/matrix-org-archive-keyring.gpg] https://packages.matrix.org/debian/ $(lsb_release -cs) main" > /etc/apt/sources.list.d/matrix-org.list
  
  apt-get update -y
  
  log_info "Installing Matrix Synapse packages..."
  # Preseed Synapse domain answers to skip interactive prompts
  echo "matrix-synapse-py3 matrix-synapse/server-name string $HS_DOMAIN" | debconf-set-selections
  echo "matrix-synapse-py3 matrix-synapse/report-stats boolean false" | debconf-set-selections
  
  apt-get install -y -o Dpkg::Options::="--force-confdef" -o Dpkg::Options::="--force-confold" matrix-synapse-py3

  log_info "Configuring Synapse homeserver.yaml..."
  YAML_FILE="/etc/matrix-synapse/homeserver.yaml"
  if [ -f "$YAML_FILE" ]; then
    # Inject PostgreSQL configuration overrides cleanly
    log_info "Injecting PostgreSQL adapter settings into $YAML_FILE..."
    
    # Comment out default SQLite database section if present
    if grep -q "^database:" "$YAML_FILE"; then
      log_info "Commenting out default SQLite configuration block..."
      sed -i '/^database:/,/homeserver\.db/s/^/#/' "$YAML_FILE" || true
    fi
    
    # Idempotently add or update PostgreSQL config
    if ! grep -q "name: psycopg2" "$YAML_FILE"; then
      log_info "Appending PostgreSQL connection settings..."
      cat <<EOF >> "$YAML_FILE"

# PostgreSQL connection pool configured by Ketesa Installer
database:
  name: psycopg2
  args:
    user: $PG_USER
    password: $PG_PASS
    database: $PG_DB
    host: $PG_HOST
    port: $PG_PORT
    cp_min: 5
    cp_max: 10

# Security settings
enable_registration: false
allow_guest_access: false
EOF
    else
      log_info "PostgreSQL settings already present. Updating existing parameters..."
      # Use python inline to cleanly update existing yaml fields if python3 is available
      if python3 -c "import yaml" 2>/dev/null; then
        python3 -c "
import yaml
with open('$YAML_FILE', 'r') as f:
    data = yaml.safe_load(f) or {}
if 'database' in data:
    data['database']['name'] = 'psycopg2'
    if 'args' not in data['database']:
        data['database']['args'] = {}
    data['database']['args']['user'] = '$PG_USER'
    data['database']['args']['password'] = '$PG_PASS'
    data['database']['args']['database'] = '$PG_DB'
    data['database']['args']['host'] = '$PG_HOST'
    data['database']['args']['port'] = int('$PG_PORT')
    data['database']['args']['cp_min'] = 5
    data['database']['args']['cp_max'] = 10
data['enable_registration'] = False
data['allow_guest_access'] = False
with open('$YAML_FILE', 'w') as f:
    yaml.safe_dump(data, f)
" || true
      else
        # Fallback to direct replacement
        sed -i "s/user: .*/user: $PG_USER/" "$YAML_FILE" || true
        sed -i "s/password: .*/password: $PG_PASS/" "$YAML_FILE" || true
        sed -i "s/database: .*/database: $PG_DB/" "$YAML_FILE" || true
        sed -i "s/host: .*/host: $PG_HOST/" "$YAML_FILE" || true
        sed -i "s/port: .*/port: $PG_PORT/" "$YAML_FILE" || true
      fi
    fi
  fi

  systemctl enable matrix-synapse
  systemctl restart matrix-synapse || log_warning "Failed to restart matrix-synapse (container environment?)."
  log_success "Matrix Synapse core server configured successfully."
fi

# ------------------------------------------------------------------------------
# 3. Element Web Instant Messaging Client Setup
# ------------------------------------------------------------------------------
if [ "$INSTALL_ELEMENT" = "true" ]; then
  log_step "Deploying Element Web static frontend app..."
  apt-get install -y -o Dpkg::Options::="--force-confdef" -o Dpkg::Options::="--force-confold" nginx git tar

  WEBROOT="/var/www/element"
  mkdir -p "$WEBROOT"

  # Fetch the latest element-web release tarball
  log_info "Downloading Element Client Web package archive..."
  ELEMENT_VERSION="v1.11.55"
  wget -qO /tmp/element-web.tar.gz "https://github.com/element-hq/element-web/releases/download/$ELEMENT_VERSION/element-$ELEMENT_VERSION.tar.gz" || true
  
  if [ -f "/tmp/element-web.tar.gz" ]; then
    tar -xzf /tmp/element-web.tar.gz -C "$WEBROOT" --strip-components=1
  else
    log_warning "Failed to download Element web from Github. Creating simple fallback placeholder page."
    echo "<h1>Element Web Client Fallback</h1><p>Pointed at https://$HS_DOMAIN</p>" > "$WEBROOT/index.html"
  fi

  # Create config.json
  log_info "Configuring default_server_config in Element config.json..."
  cat <<EOF > "$WEBROOT/config.json"
{
    "default_server_config": {
        "m.homeserver": {
            "base_url": "https://$HS_DOMAIN",
            "server_name": "$HS_DOMAIN"
        },
        "m.identity_server": {
            "base_url": "https://vector.im"
        }
    },
    "brand": "Element",
    "integrations_ui_url": "https://scalar.vector.im/",
    "integrations_rest_url": "https://scalar.vector.im/api",
    "integrations_widgets_dial_in_url": "https://scalar.vector.im/api/widgets/dial_in",
    "bug_report_endpoint_url": "https://element.io/bugreports/submit",
    "default_theme": "dark",
    "show_labs_settings": true
}
EOF
  log_success "Element Client deployed successfully at $WEBROOT."
fi

# ------------------------------------------------------------------------------
# 4. Coturn TURN Media Relay Setup
# ------------------------------------------------------------------------------
if [ "$INSTALL_COTURN" = "true" ]; then
  log_step "Installing & configuring Coturn voice/video STUN/TURN server..."
  apt-get install -y -o Dpkg::Options::="--force-confdef" -o Dpkg::Options::="--force-confold" coturn

  log_info "Configuring turnserver.conf..."
  COTURN_CONF="/etc/turnserver.conf"
  # Backup existing config
  [ -f "$COTURN_CONF" ] && mv "$COTURN_CONF" "$COTURN_CONF.bak"

  # Generate a random 32-character hex secret for TURN auth
  TURN_SECRET=$(openssl rand -hex 16)

  cat <<EOF > "$COTURN_CONF"
# Configured by Ketesa Administrator
listening-port=3478
tls-listening-port=5349
alt-listening-port=3479
alt-tls-listening-port=5350

listening-ip=$PUBLIC_IP
external-ip=$PUBLIC_IP

realm=$HS_DOMAIN
use-auth-secret
static-auth-secret=$TURN_SECRET

# Media routing
min-port=49152
max-port=65535
verbose
fingerprint
lt-cred-mech
EOF

  # Enable coturn daemon in systemd
  sed -i 's/#TURNSERVER_ENABLED=1/TURNSERVER_ENABLED=1/' /etc/default/coturn || true
  
  systemctl enable coturn
  systemctl restart coturn || log_warning "Failed to start coturn daemon (is port 3478 already bound?)."
  log_success "Coturn TURN/STUN media relay configured (secret: $TURN_SECRET)."
fi

# ------------------------------------------------------------------------------
# 5. SSL/TLS Certificate Setup
# ------------------------------------------------------------------------------
log_step "Initializing SSL/TLS certificates layer..."
CERT_DIR="/etc/letsencrypt/live/$HS_DOMAIN"
mkdir -p "$CERT_DIR"

if [ "$SSL_MODE" = "letsencrypt" ]; then
  log_info "Requesting genuine Let's Encrypt certificates..."
  apt-get install -y -o Dpkg::Options::="--force-confdef" -o Dpkg::Options::="--force-confold" certbot python3-certbot-nginx
  
  certbot certonly --nginx \
    --non-interactive \
    --agree-tos \
    --email "$LE_EMAIL" \
    -d "$HS_DOMAIN" \
    -d "$ELEMENT_DOMAIN" || log_warning "Let's Encrypt registration failed (no public DNS/IP route?). Falling back to self-signed certificates."
fi

# Fallback/Default: Self-Signed Certificate Generation
if [ ! -f "$CERT_DIR/fullchain.pem" ]; then
  log_info "Generating safe, 10-year 4096-bit self-signed certificates..."
  openssl req -x509 -nodes -days 3650 -newkey rsa:4096 \
    -keyout "$CERT_DIR/privkey.pem" \
    -out "$CERT_DIR/fullchain.pem" \
    -subj "/C=US/ST=State/L=City/O=Matrix/CN=$HS_DOMAIN" \
    -addext "subjectAltName = DNS:$HS_DOMAIN, DNS:$ELEMENT_DOMAIN"
fi
log_success "SSL/TLS keys generated successfully in $CERT_DIR."

# ------------------------------------------------------------------------------
# 6. Nginx Reverse Proxy Setup
# ------------------------------------------------------------------------------
if [ "$INSTALL_NGINX" = "true" ]; then
  log_step "Constructing Nginx virtual routing server configurations..."
  apt-get install -y -o Dpkg::Options::="--force-confdef" -o Dpkg::Options::="--force-confold" nginx

  NGINX_CONF="/etc/nginx/sites-available/matrix-stack"

  cat <<EOF > "$NGINX_CONF"
# Matrix Stack Configuration - Autogenerated by Ketesa
# 1. Element Web Routing
server {
    listen 80;
    listen 443 ssl http2;
    server_name $ELEMENT_DOMAIN;

    ssl_certificate $CERT_DIR/fullchain.pem;
    ssl_certificate_key $CERT_DIR/privkey.pem;

    root /var/www/element;
    index index.html;

    location / {
        try_files \$uri \$uri/ =404;
    }
}

# 2. Matrix Federation & Client API Routing
server {
    listen 80;
    listen 443 ssl http2;
    listen 8448 ssl http2;
    server_name $HS_DOMAIN;

    ssl_certificate $CERT_DIR/fullchain.pem;
    ssl_certificate_key $CERT_DIR/privkey.pem;

    location / {
        proxy_pass http://localhost:8008;
        proxy_set_header X-Forwarded-For \$remote_addr;
        proxy_set_header X-Forwarded-Proto \$scheme;
        proxy_set_header Host \$host;
        client_max_body_size 50M;
    }

    # Federation delegation redirects
    location /.well-known/matrix/server {
        default_type application/json;
        return 200 '{"m.server": "$HS_DOMAIN:8448"}';
        add_header Access-Control-Allow-Origin *;
    }

    location /.well-known/matrix/client {
        default_type application/json;
        return 200 '{"m.homeserver": {"base_url": "https://$HS_DOMAIN"}}';
        add_header Access-Control-Allow-Origin *;
    }
}
EOF

  ln -sf "$NGINX_CONF" "/etc/nginx/sites-enabled/matrix-stack" || true
  
  # Restore and ensure default server block exists to prevent hijacking other domains
  if [ ! -f "/etc/nginx/sites-available/default" ]; then
    log_info "Recreating default server block at /etc/nginx/sites-available/default..."
    cat <<EOF > "/etc/nginx/sites-available/default"
server {
    listen 80 default_server;
    listen [::]:80 default_server;
    root /var/www/html;
    index index.html index.htm;
    server_name _;
    location / {
        try_files \$uri \$uri/ =404;
    }
}
EOF
  fi
  mkdir -p /var/www/html
  if [ ! -f "/var/www/html/index.html" ]; then
    echo "<h1>Welcome to nginx!</h1><p>Default server page restored by Ketesa.</p>" > /var/www/html/index.html
  fi
  ln -sf "/etc/nginx/sites-available/default" "/etc/nginx/sites-enabled/default" || true

  nginx -t && systemctl restart nginx || log_warning "Failed to fully restart nginx server process."
  log_success "Nginx proxy configurations loaded & running."
fi

# Ensure firewall allows standard Matrix and Nginx services
if command -v ufw &>/dev/null && ufw status | grep -q "active"; then
  log_info "UFW firewall is active. Allowing standard HTTP, HTTPS, coturn, and Synapse federation ports..."
  ufw allow 80/tcp || true
  ufw allow 443/tcp || true
  ufw allow 8008/tcp || true
  ufw allow 8448/tcp || true
  ufw allow 3478/tcp || true
  ufw allow 3478/udp || true
  ufw allow 5349/tcp || true
  ufw allow 5349/udp || true
  ufw allow 49152:65535/udp || true
  if [ "$PG_HOST" != "localhost" ] && [ "$PG_HOST" != "127.0.0.1" ]; then
    ufw allow "$PG_PORT/tcp" || true
  fi
fi

if command -v firewall-cmd &>/dev/null && systemctl is-active --quiet firewalld; then
  log_info "Firewalld is active. Allowing standard HTTP, HTTPS, coturn, and Synapse federation ports..."
  firewall-cmd --permanent --add-service=http || true
  firewall-cmd --permanent --add-service=https || true
  firewall-cmd --permanent --add-port=8008/tcp || true
  firewall-cmd --permanent --add-port=8448/tcp || true
  firewall-cmd --permanent --add-port=3478/tcp || true
  firewall-cmd --permanent --add-port=3478/udp || true
  firewall-cmd --permanent --add-port=5349/tcp || true
  firewall-cmd --permanent --add-port=5349/udp || true
  firewall-cmd --permanent --add-port=49152-65535/udp || true
  if [ "$PG_HOST" != "localhost" ] && [ "$PG_HOST" != "127.0.0.1" ]; then
    firewall-cmd --permanent --add-port="$PG_PORT/tcp" || true
  fi
  firewall-cmd --reload || true
fi

# ------------------------------------------------------------------------------
# 7. Complete and Save Configuration
# ------------------------------------------------------------------------------
mkdir -p "$(dirname "$CONFIG_FILE")"
cat <<EOF > "$CONFIG_FILE"
HS_DOMAIN=$HS_DOMAIN
ELEMENT_DOMAIN=$ELEMENT_DOMAIN
BASE_DOMAIN=$BASE_DOMAIN
PUBLIC_IP=$PUBLIC_IP
LE_EMAIL=$LE_EMAIL
SSL_MODE=$SSL_MODE
PG_DB=$PG_DB
PG_USER=$PG_USER
PG_PASS=$PG_PASS
PG_HOST=$PG_HOST
PG_PORT=$PG_PORT
INSTALL_SYNAPSE=$INSTALL_SYNAPSE
INSTALL_ELEMENT=$INSTALL_ELEMENT
INSTALL_POSTGRES=$INSTALL_POSTGRES
INSTALL_COTURN=$INSTALL_COTURN
INSTALL_NGINX=$INSTALL_NGINX
EOF

log_success "MATRIX STACK SETUP COMPLETED!"
echo "--------------------------------------------------------"
echo -e "Homeserver API:      ${GREEN}https://$HS_DOMAIN${NC}"
echo -e "Client Messenger:    ${GREEN}https://$ELEMENT_DOMAIN${NC}"
echo -e "STUN/TURN Service:   ${GREEN}$PUBLIC_IP:3478${NC}"
echo -e "PostgreSQL database: ${GREEN}$PG_DB on port 5432${NC}"
echo "--------------------------------------------------------"
echo "System ready. Admin commands can register users on Synapse."
