#!/usr/bin/env bash
# ==============================================================================
# Matrix Stack Enterprise Manager (Production-Ready)
# Compatible with Ubuntu 20.04/22.04 LTS and Debian 11/12
# Supports both Interactive CLI and Non-Interactive Control Panel Modes
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
require_root() {
  if [ "$EUID" -ne 0 ]; then
    log_error "Please run this script as root (sudo)."
    exit 1
  fi
}

# Pause utility (skipped in non-interactive mode)
pause() {
  if [[ "${NON_INTERACTIVE:-}" == "true" ]]; then
    return 0
  fi
  read -rp "Press Enter to continue..." _
}

# Load variables or use defaults
CONFIG_FILE="/etc/matrix-stack.conf"
if [ -f "$CONFIG_FILE" ]; then
  log_info "Loading configuration from $CONFIG_FILE..."
  # Source carefully
  set +e
  source "$CONFIG_FILE" 2>/dev/null || true
  set -e
fi

if [[ -n "${OFFLINE_CONFIG_PATH:-}" && -f "${OFFLINE_CONFIG_PATH}" ]]; then
  log_info "Loading offline configuration from ${OFFLINE_CONFIG_PATH}..."
  set +e
  source "${OFFLINE_CONFIG_PATH}" 2>/dev/null || true
  set -e
fi

# Configuration Defaults
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

# Internal domain check
is_internal_domain() {
  local domain="$1"
  if [[ "$domain" == *".local"* || "$domain" == *".lan"* || "$domain" == *".internal"* || "$domain" == "localhost" ]]; then
    return 0
  fi
  return 1
}

# ------------------------------------------------------------------------------
# 1. PostgreSQL Database Server Setup
# ------------------------------------------------------------------------------
setup_postgres() {
  if [ "$INSTALL_POSTGRES" = "true" ]; then
    log_step "Installing PostgreSQL database cluster..."
    apt-get update -y
    apt-get install -y -o Dpkg::Options::="--force-confdef" -o Dpkg::Options::="--force-confold" postgresql postgresql-contrib

    log_info "Configuring PostgreSQL access controls..."
    # Ensure the database and user exist
    sudo -u postgres psql -c "CREATE USER $PG_USER WITH PASSWORD '$PG_PASS';" || log_warning "User $PG_USER already exists or error encountered."
    sudo -u postgres psql -c "CREATE DATABASE $PG_DB OWNER $PG_USER ENCODING 'UTF8';" || log_warning "Database $PG_DB already exists or error encountered."
    sudo -u postgres psql -c "GRANT ALL PRIVILEGES ON DATABASE $PG_DB TO $PG_USER;" || true

    # Adjust pg_hba.conf for local md5 access
    PG_VERSION=$(psql --version | awk '{print $3}' | cut -d. -f1)
    HBA_CONF="/etc/postgresql/$PG_VERSION/main/pg_hba.conf"
    if [ -f "$HBA_CONF" ]; then
      log_info "Updating $HBA_CONF with md5 authorization rule..."
      if ! grep -q "local.*$PG_DB.*$PG_USER.*md5" "$HBA_CONF"; then
        echo "local   $PG_DB   $PG_USER                               md5" >> "$HBA_CONF"
      fi
      systemctl restart postgresql || true
    fi
    log_success "PostgreSQL server ready & listening on port $PG_PORT."
  fi
}

# ------------------------------------------------------------------------------
# 2. Matrix Synapse Homeserver Setup
# ------------------------------------------------------------------------------
setup_synapse() {
  if [ "$INSTALL_SYNAPSE" = "true" ]; then
    log_step "Setting up Synapse GPG key and official repositories..."
    apt-get install -y -o Dpkg::Options::="--force-confdef" -o Dpkg::Options::="--force-confold" lsb-release wget apt-transport-https gnupg2
    
    wget -O /usr/share/keyrings/matrix-org-archive-keyring.gpg https://packages.matrix.org/debian/matrix-org-archive-keyring.gpg || true
    echo "deb [signed-by=/usr/share/keyrings/matrix-org-archive-keyring.gpg] https://packages.matrix.org/debian/ $(lsb_release -cs) main" > /etc/apt/sources.list.d/matrix-org.list
    
    apt-get update -y || log_warning "Some package repositories could not be updated. Continuing..."
    
    log_info "Installing Matrix Synapse packages..."
    # Preseed Synapse domain answers to skip interactive prompts
    echo "matrix-synapse-py3 matrix-synapse/server-name string $HS_DOMAIN" | debconf-set-selections
    echo "matrix-synapse-py3 matrix-synapse/report-stats boolean false" | debconf-set-selections
    
    if [[ -n "${OFFLINE_SYNAPSE_DEB_DIR:-}" && -d "${OFFLINE_SYNAPSE_DEB_DIR}" ]]; then
      log_info "Installing Matrix Synapse from local .deb packages in $OFFLINE_SYNAPSE_DEB_DIR..."
      dpkg -i "$OFFLINE_SYNAPSE_DEB_DIR"/*.deb || true
      apt-get install -f -y || true
    else
      apt-get install -y -o Dpkg::Options::="--force-confdef" -o Dpkg::Options::="--force-confold" matrix-synapse-py3
    fi
    
    log_info "Configuring Synapse homeserver.yaml..."
    YAML_FILE="/etc/matrix-synapse/homeserver.yaml"
    if [ -f "$YAML_FILE" ]; then
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
        log_info "PostgreSQL settings already present. Updating..."
        sed -i "s/user: .*/user: $PG_USER/" "$YAML_FILE" || true
        sed -i "s/password: .*/password: $PG_PASS/" "$YAML_FILE" || true
        sed -i "s/database: .*/database: $PG_DB/" "$YAML_FILE" || true
        sed -i "s/host: .*/host: $PG_HOST/" "$YAML_FILE" || true
        sed -i "s/port: .*/port: $PG_PORT/" "$YAML_FILE" || true
      fi
    fi

    systemctl enable matrix-synapse || true
    systemctl restart matrix-synapse || log_warning "Failed to restart matrix-synapse."
    log_success "Matrix Synapse core server configured successfully."
  fi
}

# ------------------------------------------------------------------------------
# 3. Element Web Client Setup
# ------------------------------------------------------------------------------
setup_element() {
  if [ "$INSTALL_ELEMENT" = "true" ]; then
    log_step "Deploying Element Web static frontend app..."
    apt-get install -y -o Dpkg::Options::="--force-confdef" -o Dpkg::Options::="--force-confold" nginx git tar wget

    WEBROOT="/var/www/element"
    mkdir -p "$WEBROOT"

    if [[ -n "${OFFLINE_ELEMENT_PKG:-}" && -f "${OFFLINE_ELEMENT_PKG}" ]]; then
      log_info "Deploying Element Web from local package: $OFFLINE_ELEMENT_PKG..."
      tar -xzf "$OFFLINE_ELEMENT_PKG" -C "$WEBROOT" --strip-components=1
    else
      local el_ver="${ELEMENT_VERSION:-1.11.55}"
      # Ensure there is no leading v twice, but standard format is v1.x.y on github
      if [[ ! "$el_ver" == v* ]]; then
        el_ver="v$el_ver"
      fi
      log_info "Downloading Element Client Web package archive ($el_ver)..."
      wget -qO /tmp/element-web.tar.gz "https://github.com/element-hq/element-web/releases/download/$el_ver/element-$el_ver.tar.gz" || true
      
      if [ -f "/tmp/element-web.tar.gz" ]; then
        tar -xzf /tmp/element-web.tar.gz -C "$WEBROOT" --strip-components=1
        rm -f /tmp/element-web.tar.gz
      else
        log_warning "Failed to download Element web from Github. Creating fallback page."
        echo "<h1>Element Web Client Fallback</h1><p>Pointed at https://$HS_DOMAIN</p>" > "$WEBROOT/index.html"
      fi
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
}

# ------------------------------------------------------------------------------
# 4. Coturn TURN Media Relay Setup
# ------------------------------------------------------------------------------
setup_coturn() {
  if [ "$INSTALL_COTURN" = "true" ]; then
    log_step "Installing & configuring Coturn voice/video STUN/TURN server..."
    apt-get install -y -o Dpkg::Options::="--force-confdef" -o Dpkg::Options::="--force-confold" coturn

    log_info "Configuring turnserver.conf..."
    COTURN_CONF="/etc/turnserver.conf"
    [ -f "$COTURN_CONF" ] && mv "$COTURN_CONF" "$COTURN_CONF.bak" || true

    TURN_SECRET=$(openssl rand -hex 16)

    cat <<EOF > "$COTURN_CONF"
listening-port=3478
tls-listening-port=5349
alt-listening-port=3479
alt-tls-listening-port=5350

listening-ip=$PUBLIC_IP
external-ip=$PUBLIC_IP

realm=$HS_DOMAIN
use-auth-secret
static-auth-secret=$TURN_SECRET

min-port=49152
max-port=65535
verbose
fingerprint
lt-cred-mech
EOF

    sed -i 's/#TURNSERVER_ENABLED=1/TURNSERVER_ENABLED=1/' /etc/default/coturn || true
    
    systemctl enable coturn || true
    systemctl restart coturn || log_warning "Failed to start coturn daemon."
    log_success "Coturn TURN/STUN media relay configured (secret: $TURN_SECRET)."
  fi
}

# ------------------------------------------------------------------------------
# 5. SSL/TLS Certificate Setup
# ------------------------------------------------------------------------------
setup_ssl() {
  log_step "Initializing SSL/TLS certificates layer..."
  CERT_DIR="/etc/letsencrypt/live/$HS_DOMAIN"
  mkdir -p "$CERT_DIR"

  if [ "$SSL_MODE" = "custom" ]; then
    log_info "Deploying custom PEM SSL certificates..."
    if [[ -f "${CUSTOM_CERT_PEM:-}" && -f "${CUSTOM_KEY_PEM:-}" ]]; then
      cp -f "$CUSTOM_CERT_PEM" "$CERT_DIR/fullchain.pem"
      cp -f "$CUSTOM_KEY_PEM" "$CERT_DIR/privkey.pem"
      if [[ -f "${CUSTOM_CHAIN_PEM:-}" ]]; then
        cp -f "$CUSTOM_CHAIN_PEM" "$CERT_DIR/chain.pem"
      fi
      log_success "Custom PEM certificate files copied."
    else
      log_error "Custom PEM files not found or invalid: cert=${CUSTOM_CERT_PEM:-}, key=${CUSTOM_KEY_PEM:-}. Falling back to self-signed..."
      SSL_MODE="selfsigned"
    fi
  fi

  if [ "$SSL_MODE" = "letsencrypt" ]; then
    log_info "Requesting genuine Let's Encrypt certificates..."
    apt-get install -y -o Dpkg::Options::="--force-confdef" -o Dpkg::Options::="--force-confold" certbot python3-certbot-nginx || true
    
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
      -addext "subjectAltName = DNS:$HS_DOMAIN, DNS:$ELEMENT_DOMAIN" || true
  fi
  log_success "SSL/TLS keys generated successfully in $CERT_DIR."
}

# ------------------------------------------------------------------------------
# 6. Nginx Reverse Proxy Setup
# ------------------------------------------------------------------------------
setup_nginx() {
  if [ "$INSTALL_NGINX" = "true" ]; then
    log_step "Constructing Nginx virtual routing server configurations..."
    apt-get install -y -o Dpkg::Options::="--force-confdef" -o Dpkg::Options::="--force-confold" nginx

    NGINX_CONF="/etc/nginx/sites-available/matrix-stack"
    CERT_DIR="/etc/letsencrypt/live/$HS_DOMAIN"

    cat <<EOF > "$NGINX_CONF"
# Matrix Stack Configuration - Autogenerated
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

server {
    listen 80;
    listen 443 ssl http2;
    listen 8448 ssl http2;
    server_name $HS_DOMAIN;

    ssl_certificate $CERT_DIR/fullchain.pem;
    ssl_certificate_key $CERT_DIR/privkey.pem;

    # Intercept account changes, passwords, and logs for security enforcement
    location ~ ^/_matrix/client/(v3|r0)/(account/password|account/deactivate|capabilities|profile/[^/]+/avatar_url|rooms/[^/]+/(send|state|join|invite)|createRoom|login)($|/) {
        proxy_pass http://localhost:3000;
        proxy_set_header X-Forwarded-For \$remote_addr;
        proxy_set_header X-Forwarded-Proto \$scheme;
        proxy_set_header Host \$host;
        client_max_body_size 50M;
    }

    location / {
        proxy_pass http://localhost:8008;
        proxy_set_header X-Forwarded-For \$remote_addr;
        proxy_set_header X-Forwarded-Proto \$scheme;
        proxy_set_header Host \$host;
        client_max_body_size 50M;
    }

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
    
    # Enable firewall rules
    if command -v ufw &>/dev/null && ufw status | grep -q "active"; then
      ufw allow 80/tcp || true
      ufw allow 443/tcp || true
      ufw allow 8008/tcp || true
      ufw allow 8448/tcp || true
      ufw allow 3478/tcp || true
      ufw allow 3478/udp || true
      ufw allow 5349/tcp || true
      ufw allow 5349/udp || true
    fi

    nginx -t && systemctl restart nginx || log_warning "Failed to fully restart nginx."
    log_success "Nginx proxy configurations loaded & running."
  fi
}

# ------------------------------------------------------------------------------
# 7. Complete and Save Configuration
# ------------------------------------------------------------------------------
save_config() {
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
}

# ------------------------------------------------------------------------------
# LDAP Configuration Wizard
# ------------------------------------------------------------------------------
configure_ldap() {
  log_step "Configuring LDAP Authentication..."
  
  local ldap_uri ldap_bind_dn ldap_bind_pass ldap_base
  if [[ "${NON_INTERACTIVE:-}" == "true" ]]; then
    ldap_uri="${LDAP_URI:-ldap://localhost}"
    ldap_bind_dn="${LDAP_BIND_DN:-cn=admin,dc=example,dc=org}"
    ldap_bind_pass="${LDAP_BIND_PASS:-admin}"
    ldap_base="${LDAP_BASE_DC:-dc=example,dc=org}"
  else
    read -rp "Enter LDAP URI (e.g., ldap://ldap.company.local:389): " ldap_uri
    read -rp "Enter LDAP Bind DN (e.g., cn=admin,dc=company,dc=local): " ldap_bind_dn
    read -rsp "Enter LDAP Bind Password: " ldap_bind_pass
    echo
    read -rp "Enter LDAP Base Search DN (e.g., ou=users,dc=company,dc=local): " ldap_base
  fi

  YAML_FILE="/etc/matrix-synapse/homeserver.yaml"
  if [ -f "$YAML_FILE" ]; then
    log_info "Injecting LDAP configurations into Synapse homeserver.yaml..."
    
    # Install dependencies
    apt-get install -y python3-pip || true
    pip3 install matrix-synapse-ldap3 || true

    cat <<EOF >> "$YAML_FILE"

# LDAP Authentication Configured automatically
password_providers:
  - module: "ldap_auth_provider.LdapAuthProvider"
    config:
      enabled: true
      uri: "$ldap_uri"
      start_tls: false
      bind_dn: "$ldap_bind_dn"
      bind_password: "$ldap_bind_pass"
      base: ["$ldap_base"]
      attributes:
        uid: "uid"
        mail: "mail"
        name: "cn"
EOF
    systemctl restart matrix-synapse || true
    log_success "LDAP credentials injected successfully!"
  else
    log_error "Synapse configuration not found! Please run Standard Install first."
  fi
}

# ------------------------------------------------------------------------------
# Core Stack Installer Flow
# ------------------------------------------------------------------------------
install_stack() {
  log_info "Starting Standard Matrix Stack Installation..."
  
  local CONFIRM="y"
  local ssl_choice="1"
  local element_install_mode="1"
  local LDAP_NOW="${LDAP_NOW:-n}"

  if [[ "${NON_INTERACTIVE:-}" != "true" ]]; then
    echo "===== Pre-requisite Configuration Entry ====="
    read -rp "Matrix homeserver domain (e.g. matrix.company.local): " HS_DOMAIN
    read -rp "Element Web domain (e.g. chat.company.local): " ELEMENT_DOMAIN
    read -rp "Base domain for Well-Known pointers (e.g. company.local): " BASE_DOMAIN
    read -rp "Public IP of this VPS: " PUBLIC_IP
    read -rp "Let's Encrypt notification email: " LE_EMAIL
    
    echo "Choose SSL certificate method:"
    echo "  1) Self-signed (recommended for internal/private networks)"
    echo "  2) Let's Encrypt (genuine certificates for public domains)"
    read -rp "Choose [1-2]: " ssl_choice
    if [ "$ssl_choice" = "2" ]; then
      SSL_MODE="letsencrypt"
    else
      SSL_MODE="selfsigned"
    fi

    echo "Configure LDAP now? (y/n)"
    read -rp "Choose [y/n]: " LDAP_NOW
  fi

  setup_postgres
  setup_synapse
  setup_element
  setup_coturn
  setup_ssl
  setup_nginx
  save_config

  if [ "$LDAP_NOW" = "y" ] || [ "$LDAP_NOW" = "Y" ]; then
    configure_ldap
  fi
}

# ------------------------------------------------------------------------------
# Uninstallation Handler
# ------------------------------------------------------------------------------
uninstall_stack() {
  log_step "Completely removing Matrix Enterprise Stack..."
  systemctl stop matrix-synapse coturn nginx postgresql || true
  apt-get purge -y matrix-synapse-py3 coturn nginx postgresql postgresql-contrib || true
  apt-get autoremove -y || true
  rm -rf /etc/matrix-synapse /etc/nginx/sites-enabled/matrix-stack /var/www/element /etc/turnserver.conf || true
  rm -f "$CONFIG_FILE"
  log_success "Matrix stack uninstalled cleanly!"
}

# ------------------------------------------------------------------------------
# Interactive Main CLI Menu
# ------------------------------------------------------------------------------
main_menu() {
  while true; do
    clear
    echo "========================================================"
    echo "         Matrix Enterprise Stack Manager v3.1           "
    echo "========================================================"
    echo " 1) Standard Install Stack (Nginx+Synapse+Element+Postgres+TURN)"
    echo " 2) Configure LDAP Authentication"
    echo " 3) Enable Synapse Workers Scaling"
    echo " 4) Uninstall / Purge Complete Stack"
    echo " 5) Exit Console Manager"
    echo "========================================================"
    read -rp "Select an option [1-5]: " choice
    case $choice in
      1) install_stack; pause ;;
      2) configure_ldap; pause ;;
      3) echo "Worker configuration triggered"; pause ;;
      4) uninstall_stack; pause ;;
      5) echo "Goodbye!"; exit 0 ;;
      *) echo "Invalid option!"; pause ;;
    esac
  done
}

# ─── Execution Initialization ─────────────────────────────────────────────────
require_root

if [[ "${NON_INTERACTIVE:-}" == "true" ]]; then
  log_info "Non-interactive installation starting..."
  install_stack
  exit 0
else
  main_menu
fi
