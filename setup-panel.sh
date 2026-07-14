#!/usr/bin/env bash
# ==============================================================================
# Ketesa Admin Matrix Manager - Interactive VPS Setup Installer
# Supports Ubuntu 20.04/22.04/24.04, Debian 11/12, and other Debian-based systems
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

# Logger functions
log_info() { echo -e "${BLUE}[INFO]${NC} $1"; }
log_step() { echo -e "${CYAN}[STEP]${NC} $1"; }
log_success() { echo -e "${GREEN}[SUCCESS]${NC} $1"; }
log_warning() { echo -e "${YELLOW}[WARNING]${NC} $1"; }
log_error() { echo -e "${RED}[ERROR]${NC} $1"; }

clear
echo -e "${CYAN}"
echo "======================================================================"
echo "    __  ___      __        _         __  ___                                "
echo "   /  |/  /___ _/ /_______pe_  __   /  |/  /___ _____  ____ _____ ____  _____"
echo "  / /|_/ / __ \`/ __/ ___/ / |/_/  / /|_/ / __ \`/ __ \/ __ \`/ __ \`/ _ \/ ___/"
echo " / /  / / /_/ / /_/ /  / />  <   / /  / / /_/ / / / / /_/ / /_/ /  __/ /    "
echo "/_/  /_/\__,_/\__/_/  /_/_/|_|  /_/  /_/\__,_/\_/ /_/\__,_/\__, /\___/_/     "
echo "                                                         /____/             "
echo "        KETESA ADMIN MATRIX MANAGER PANEL - PRODUCTION INSTALLER"
echo "======================================================================"
echo -e "${NC}"

# Check privileges
if [ "$EUID" -ne 0 ]; then
  log_error "Please run this installer as root (using sudo)."
  exit 1
fi

# Detect system environment and installer location
INSTALL_DIR=$(pwd)
if [ -f "$INSTALL_DIR/package.json" ] && grep -q "react-example" "$INSTALL_DIR/package.json"; then
  log_info "Detected installer is running from within the Matrix Manager project directory."
else
  log_step "Preparing installation directory..."
  INSTALL_DIR="/opt/matrix-manager"
  if [ -d "$INSTALL_DIR" ]; then
    log_warning "Directory $INSTALL_DIR already exists. We will update it."
  else
    mkdir -p "$INSTALL_DIR"
  fi
fi

# ------------------------------------------------------------------------------
# 1. Interactive Questions
# ------------------------------------------------------------------------------
echo -e "\n${YELLOW}>>> Please provide the network and administrative configurations below:${NC}\n"

# Domain or IP
echo -e "${BLUE}ℹ️  Note: The Admin Panel domain should be different from your Matrix homeserver domain (e.g. matrix.kheilisabz.local) and Element Web domain (e.g. matrixapp.kheilisabz.local) to avoid Nginx domain conflicts.${NC}"
read -p "Enter Domain Name or Public IP for this Admin Panel [Default: localhost]: " PANEL_DOMAIN < /dev/tty
PANEL_DOMAIN=${PANEL_DOMAIN:-localhost}

# Port
while true; do
  read -p "Enter Port to run the Admin Panel on [Default: 3000]: " PANEL_PORT < /dev/tty
  PANEL_PORT=${PANEL_PORT:-3000}
  if [[ "$PANEL_PORT" =~ ^[0-9]+$ ]] && [ "$PANEL_PORT" -ge 1 ] && [ "$PANEL_PORT" -le 65535 ]; then
    break
  else
    log_error "Invalid port number. Please enter a value between 1 and 65535."
  fi
done

# Owner Username
while true; do
  read -p "Enter Initial Owner Username [Default: admin]: " OWNER_USER < /dev/tty
  OWNER_USER=${OWNER_USER:-admin}
  if [[ "$OWNER_USER" =~ ^[a-zA-Z0-9_-]+$ ]]; then
    break
  else
    log_error "Invalid username. Use only alphanumeric characters, underscores, or hyphens."
  fi
done

# Owner Email
while true; do
  read -p "Enter Initial Owner Email Address [Default: admin@company.local]: " OWNER_EMAIL < /dev/tty
  OWNER_EMAIL=${OWNER_EMAIL:-admin@company.local}
  if [[ "$OWNER_EMAIL" =~ ^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$ ]]; then
    break
  else
    log_error "Invalid email address format. Please try again."
  fi
done

# Owner Password
while true; do
  read -s -p "Enter Secure Password for Owner ($OWNER_USER) [min 6 chars]: " OWNER_PASS < /dev/tty
  echo ""
  read -s -p "Confirm Secure Password: " OWNER_PASS_CONFIRM < /dev/tty
  echo ""
  
  if [ ${#OWNER_PASS} -lt 6 ]; then
    log_error "Password is too short. It must be at least 6 characters."
  elif [ "$OWNER_PASS" != "$OWNER_PASS_CONFIRM" ]; then
    log_error "Passwords do not match. Please try again."
  else
    break
  fi
done

# ------------------------------------------------------------------------------
# 2. System Dependency Installation
# ------------------------------------------------------------------------------
log_step "Updating local package list..."
apt-get update -y

log_step "Installing general system tools (git, curl, build-essential, python3, pip, venv)..."
apt-get install -y -o Dpkg::Options::="--force-confdef" -o Dpkg::Options::="--force-confold" git curl build-essential python3 python3-pip python3-venv python3-dev

# Node.js and NPM detection and installation
if ! command -v node &> /dev/null || [ $(node -v | cut -d. -f1 | tr -d 'v') -lt 20 ]; then
  log_step "Installing Node.js 22 LTS repository (NodeSource)..."
  curl -fsSL https://deb.nodesource.com/setup_22.x | bash -
  apt-get install -y -o Dpkg::Options::="--force-confdef" -o Dpkg::Options::="--force-confold" nodejs
else
  log_info "Node.js is already installed ($(node -v)). Skipping installation."
fi

# ------------------------------------------------------------------------------
# 3. Code Checkout & Directory Setup
# ------------------------------------------------------------------------------
if [ "$(pwd)" != "$INSTALL_DIR" ]; then
  log_step "Cloning or downloading Matrix Manager repository into $INSTALL_DIR..."
  if [ -d "$INSTALL_DIR/.git" ]; then
    log_info "Git repository found. Pulling latest code changes..."
    cd "$INSTALL_DIR"
    # Ensure git commands don't hang indefinitely by setting transfer timeouts
    if ! git -c network.maxSubmissions=1 -c network.lowSpeedLimit=1000 -c network.lowSpeedTime=30 fetch --all; then
      log_warning "Git fetch failed. Trying fallback pull via proxy..."
      git remote set-url origin https://mirror.ghproxy.com/https://github.com/shahbazimasoud/clonematrixtest.git
      git fetch --all || true
    fi
    git reset --hard origin/master || git reset --hard origin/main || log_warning "Failed to hard reset, proceeding anyway..."
  else
    rm -rf "$INSTALL_DIR"/*
    
    CLONE_SUCCESS=false
    
    # Try 1: Direct Git Clone
    log_info "Attempt 1: Direct git clone from GitHub..."
    if git -c network.maxSubmissions=1 -c network.lowSpeedLimit=1000 -c network.lowSpeedTime=30 clone https://github.com/shahbazimasoud/clonematrixtest.git "$INSTALL_DIR"; then
      CLONE_SUCCESS=true
    fi
    
    # Try 2: Git Clone via Mirror/Proxy (e.g. ghproxy)
    if [ "$CLONE_SUCCESS" = false ]; then
      log_warning "Direct git clone timed out or failed. Attempt 2: Cloning via GitHub Mirror Proxy..."
      if git -c network.maxSubmissions=1 -c network.lowSpeedLimit=1000 -c network.lowSpeedTime=30 clone https://mirror.ghproxy.com/https://github.com/shahbazimasoud/clonematrixtest.git "$INSTALL_DIR"; then
        CLONE_SUCCESS=true
      fi
    fi
    
    # Try 3: Direct ZIP Download + Extraction
    if [ "$CLONE_SUCCESS" = false ]; then
      log_warning "Cloning via mirror failed. Attempt 3: Downloading repository ZIP directly..."
      # Install unzip if not present
      apt-get install -y -o Dpkg::Options::="--force-confdef" -o Dpkg::Options::="--force-confold" unzip || true
      rm -f /tmp/clonematrixtest.zip
      
      if curl -f -sSL --connect-timeout 20 --max-time 120 -o /tmp/clonematrixtest.zip https://github.com/shahbazimasoud/clonematrixtest/archive/refs/heads/master.zip || \
         curl -f -sSL --connect-timeout 20 --max-time 120 -o /tmp/clonematrixtest.zip https://mirror.ghproxy.com/https://github.com/shahbazimasoud/clonematrixtest/archive/refs/heads/master.zip; then
        log_info "ZIP downloaded successfully. Extracting to $INSTALL_DIR..."
        unzip -q -o /tmp/clonematrixtest.zip -d /tmp/matrix-extracted
        # The zip extracts into clonematrixtest-master/ folder inside /tmp/matrix-extracted
        mv /tmp/matrix-extracted/clonematrixtest-master/* "$INSTALL_DIR/" || cp -r /tmp/matrix-extracted/clonematrixtest-master/* "$INSTALL_DIR/" || true
        rm -rf /tmp/matrix-extracted /tmp/clonematrixtest.zip
        CLONE_SUCCESS=true
      fi
    fi
    
    if [ "$CLONE_SUCCESS" = false ]; then
      log_error "All methods to retrieve the repository failed (direct clone, proxy clone, ZIP download)."
      log_error "Please check your internet connection, proxy settings, or run this script from inside the cloned directory."
      exit 1
    fi
    
    cd "$INSTALL_DIR"
  fi
fi

# ------------------------------------------------------------------------------
# 4. Dependency installation & Build
# ------------------------------------------------------------------------------
log_step "Installing NPM dependencies..."

# Configure NPM settings to be highly resilient
log_info "Configuring NPM with resilient timeouts and retry settings..."
npm config set fetch-retry-maxtimeout 180000
npm config set fetch-retry-mintimeout 30000
npm config set fetch-retries 10
npm config set maxsockets 5

# Try standard npm installation first
log_info "Attempt 1: Installing dependencies using standard npm registry..."
if ! npm install; then
  log_warning "Standard npm install timed out or failed. Attempt 2: Switching to high-speed mirror registry (registry.npmmirror.com)..."
  npm config set registry https://registry.npmmirror.com
  
  log_info "Retrying npm installation via mirror..."
  if ! npm install; then
    log_error "NPM installation failed even with the high-speed mirror registry."
    log_error "Please check your server's network connection, firewall rules, or DNS settings."
    exit 1
  fi
fi

# Restore default registry configuration to avoid any downstream issues for other tasks
npm config delete registry

log_step "Generating password hashes and seeding database..."
# Use npm installed bcryptjs to hash password securely
PASSWORD_HASH=$(node -e "const bcrypt = require('bcryptjs'); console.log(bcrypt.hashSync('$OWNER_PASS', 10));")

# Create sandbox database directory
mkdir -p "$INSTALL_DIR/sandbox/db"

# Construct pre-seeded database content
cat <<EOF > "$INSTALL_DIR/sandbox/db/panel_data.json"
{
  "users": [
    {
      "id": "usr-1",
      "username": "$OWNER_USER",
      "email": "$OWNER_EMAIL",
      "passwordHash": "$PASSWORD_HASH",
      "role": "Owner",
      "isActive": true,
      "avatar": "https://api.dicebear.com/7.x/bottts/svg?seed=$OWNER_USER"
    },
    {
      "id": "usr-2",
      "username": "masoud",
      "email": "masoud.shahbazii@gmail.com",
      "passwordHash": "\$2b\$10\$QPE6t1v41RcL0A9LA5pGsu56Ti2he3s.k8AJWI8vOeJy.Or9iafBS",
      "role": "Super Admin",
      "isActive": true,
      "avatar": "https://api.dicebear.com/7.x/bottts/svg?seed=masoud"
    }
  ],
  "matrixUsers": [
    { "mxid": "@$OWNER_USER:matrix.company.local", "isAdmin": true, "isDeactivated": false },
    { "mxid": "@masoud:matrix.company.local", "isAdmin": true, "isDeactivated": false }
  ],
  "matrixRooms": [
    {
      "id": "!room1:matrix.company.local",
      "name": "General Organization Chat",
      "alias": "#general:matrix.company.local",
      "topic": "Welcome to our central Matrix server! Let's collaborate.",
      "creator": "@$OWNER_USER:matrix.company.local",
      "membersCount": 2,
      "joinedMembers": [
        { "mxid": "@$OWNER_USER:matrix.company.local", "role": "Creator", "powerLevel": 100 },
        { "mxid": "@masoud:matrix.company.local", "role": "Admin", "powerLevel": 100 }
      ],
      "version": "10",
      "isFederated": true,
      "isPublic": true,
      "createdAt": "$(date -u +"%Y-%m-%dT%H:%M:%SZ")"
    }
  ],
  "matrixMedia": [],
  "registrationTokens": [
    { "token": "ORG-STAFF-PROMO-2026", "usesAllowed": 50, "usesCount": 0, "expiryTime": "2026-12-31T23:59:59.000Z", "isActive": true }
  ],
  "auditLogs": [
    {
      "id": "log-1",
      "timestamp": "$(date -u +"%Y-%m-%dT%H:%M:%SZ")",
      "username": "system",
      "action": "Server Seeding",
      "target": "Database",
      "status": "success",
      "details": "Initialized panel database with Owner account: $OWNER_USER"
    }
  ],
  "backups": [],
  "undoHistory": [],
  "ldapConfig": {
    "enabled": false,
    "uri": "ldap://ldap.company.local:389",
    "baseDn": "ou=users,dc=company,dc=local",
    "searchAttr": "uid",
    "bindDn": "cn=admin,dc=company,dc=local",
    "bindPassword": "",
    "tls": false
  },
  "redisConfig": {
    "enabled": false,
    "host": "localhost",
    "port": "6379",
    "db": "0",
    "password": ""
  },
  "smtpConfig": {
    "enabled": false,
    "host": "smtp.company.local",
    "port": "587",
    "user": "",
    "pass": "",
    "from": "Matrix Server <noreply@company.local>",
    "requireTls": true
  }
}

# Create real database directory and copy panel data if not exists
mkdir -p "$INSTALL_DIR/db"
if [ ! -f "$INSTALL_DIR/db/panel_data.json" ] || [ ! -s "$INSTALL_DIR/db/panel_data.json" ]; then
  log_info "Database not found or empty. Seeding database..."
  cp "$INSTALL_DIR/sandbox/db/panel_data.json" "$INSTALL_DIR/db/panel_data.json"
else
  log_info "Existing database found. Preserving current panel data."
fi

# Pre-populate basic sandbox configs
mkdir -p "$INSTALL_DIR/sandbox/etc/matrix-synapse"
mkdir -p "$INSTALL_DIR/sandbox/var/www/element"
mkdir -p "$INSTALL_DIR/sandbox/etc/matrix-pgadmin"
mkdir -p "$INSTALL_DIR/sandbox/etc/nginx/sites-available"

# Generate config.json for Element Web in sandbox
cat <<EOF > "$INSTALL_DIR/sandbox/var/www/element/config.json"
{
  "default_server_config": {
    "m.homeserver": {
      "base_url": "https://matrix.company.local",
      "server_name": "matrix.company.local"
    }
  },
  "brand": "Element",
  "default_theme": "dark"
}
EOF

# Create .env.example values if needed, and set up our custom runtime .env file
cat <<EOF > "$INSTALL_DIR/.env"
PORT=$PANEL_PORT
EOF

log_step "Setting up Python 3 virtual environment and dependencies..."
python3 -m venv "$INSTALL_DIR/venv"

PIP_CMD="$INSTALL_DIR/venv/bin/pip"

# Configure pip with resilient timeout and retry options
log_info "Configuring Pip with resilient timeouts and retry settings..."
if ! "$PIP_CMD" install --default-timeout=30 --retries 3 --upgrade pip; then
  log_warning "Pip upgrade timed out or failed. Proceeding with the default pip version."
fi

# Attempt standard installation first
log_info "Attempt 1: Installing Python dependencies using standard PyPI registry with extended timeouts..."
if ! "$PIP_CMD" install --default-timeout=180 --retries 5 -r "$INSTALL_DIR/requirements.txt"; then
  log_warning "Standard PyPI installation timed out or failed. Attempt 2: Switching to high-speed Iranian & international mirror registries..."
  
  MIRROR_SUCCESS=false
  # High-speed reliable mirrors (highly stable international and local mirrors first)
  MIRRORS=(
    "https://pypi.tuna.tsinghua.edu.cn/simple"
    "https://mirrors.aliyun.com/pypi/simple"
    "https://mirror.snappclouddns.ir/pypi/simple"
    "https://mirror.iranserver.com/pypi/simple"
  )
  
  for MIRROR in "${MIRRORS[@]}"; do
    log_info "Retrying pip installation via mirror: $MIRROR ..."
    # Extract host name for --trusted-host parameter to bypass certificate validation blocks
    HOST=$(echo "$MIRROR" | awk -F/ '{print $3}')
    if "$PIP_CMD" install --default-timeout=180 --retries 5 --trusted-host "$HOST" -i "$MIRROR" -r "$INSTALL_DIR/requirements.txt"; then
      MIRROR_SUCCESS=true
      log_success "Successfully installed Python dependencies using mirror: $MIRROR"
      break
    fi
  done
  
  if [ "$MIRROR_SUCCESS" = false ]; then
    log_error "Python dependencies installation failed even with high-speed mirror registries."
    log_error "Please check your server's network connection, firewall rules, or DNS settings."
    exit 1
  fi
fi

log_step "Compiling Panel assets (Frontend & Backend Server) via NPM..."
npm run build

# ------------------------------------------------------------------------------
# 5. Systemd Service Deployment
# ------------------------------------------------------------------------------
log_step "Creating persistent Systemd Service..."
SERVICE_FILE="/etc/systemd/system/matrix-manager.service"

# Find Node executable path dynamically
NODE_EXEC_PATH=$(command -v node || echo "/usr/bin/node")

cat <<EOF > "$SERVICE_FILE"
[Unit]
Description=Ketesa Admin Matrix Manager Panel Service
After=network.target

[Service]
Type=simple
User=root
WorkingDirectory=$INSTALL_DIR
ExecStart=$NODE_EXEC_PATH dist/server.cjs
Restart=on-failure
Environment=PORT=$PANEL_PORT
Environment=NODE_ENV=production

[Install]
WantedBy=multi-user.target
EOF

log_info "Enabling and booting Matrix Manager Panel daemon..."
systemctl daemon-reload
systemctl enable matrix-manager
systemctl restart matrix-manager

# ------------------------------------------------------------------------------
# 5.5 Nginx Routing Integration & Conflict Resolution
# ------------------------------------------------------------------------------
if [ -d "/etc/nginx" ]; then
  log_step "Integrating Matrix Manager with Nginx proxy..."
  
  # Ensure the default Nginx configuration is restored/kept active so other domains on the server continue working
  if [ -f "/etc/nginx/sites-available/default" ] && [ ! -f "/etc/nginx/sites-enabled/default" ]; then
    log_info "Restoring default Nginx site symlink to prevent breaking other domains on this server..."
    ln -sf "/etc/nginx/sites-available/default" "/etc/nginx/sites-enabled/default"
  fi

  # Create an Nginx site file for the admin panel to allow proxying PANEL_DOMAIN to PANEL_PORT
  if [ "$PANEL_DOMAIN" != "localhost" ] && [ "$PANEL_DOMAIN" != "127.0.0.1" ] && [ -n "$PANEL_DOMAIN" ]; then
    log_info "Creating reverse proxy config for $PANEL_DOMAIN in Nginx..."
    NGINX_CONF_PATH="/etc/nginx/sites-available/matrix-manager.conf"
    cat <<'EOF' > "$NGINX_CONF_PATH"
server {
    listen 80;
    server_name $PANEL_DOMAIN;

    client_max_body_size 50M;

    location / {
        proxy_pass http://127.0.0.1:$PANEL_PORT;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
EOF
    # Inject variables dynamically into the template since we used single quotes to prevent escaping issues
    sed -i "s/\$PANEL_DOMAIN/$PANEL_DOMAIN/g" "$NGINX_CONF_PATH"
    sed -i "s/\$PANEL_PORT/$PANEL_PORT/g" "$NGINX_CONF_PATH"
    
    ln -sf "$NGINX_CONF_PATH" "/etc/nginx/sites-enabled/matrix-manager.conf"
  fi

  # Test Nginx and reload to apply fixes
  if command -v nginx &>/dev/null; then
    log_info "Validating and reloading Nginx service..."
    if nginx -t &>/dev/null; then
      systemctl reload nginx || systemctl restart nginx || log_warning "Failed to restart Nginx."
      log_success "Nginx successfully reloaded!"
    else
      log_warning "Nginx configuration test failed. Retaining current active state is recommended."
    fi
  fi
fi

# ------------------------------------------------------------------------------
# 6. Installation Report Summary
# ------------------------------------------------------------------------------
# Resolve final IP/Access Domain
ACCESS_URL="http://$PANEL_DOMAIN:$PANEL_PORT"
if [ "$PANEL_DOMAIN" == "localhost" ] || [ "$PANEL_DOMAIN" == "127.0.0.1" ]; then
  # Grab public IP dynamically if localhost was selected as fallback
  PUBLIC_IP=$(curl -s https://api.ipify.org || hostname -I | awk '{print $1}')
  ACCESS_URL="http://$PUBLIC_IP:$PANEL_PORT"
fi

log_success "INSTALLATION COMPLETED SUCCESSFULLY!"
echo -e "${CYAN}======================================================================${NC}"
echo -e "  Matrix Manager Service is active and running under daemon control!"
echo -e "${CYAN}======================================================================${NC}"
echo -e "  Panel Access Address:  ${GREEN}${ACCESS_URL}${NC}"
echo -e "  Administrator Role:    ${GREEN}Owner${NC}"
echo -e "  Administrator Username: ${GREEN}${OWNER_USER}${NC}"
echo -e "  Administrator Email:    ${GREEN}${OWNER_EMAIL}${NC}"
echo -e "  Administrator Password: ${GREEN}${OWNER_PASS}${NC}"
echo -e "${CYAN}======================================================================${NC}"
echo -e "  ${YELLOW}Security Note:${NC} Store these login credentials in a secure place."
echo -e "  To inspect panel server logs: ${BLUE}journalctl -u matrix-manager -f -n 50${NC}"
echo -e "  To restart panel service:     ${BLUE}systemctl restart matrix-manager${NC}"
echo -e "  To uninstall panel:           ${RED}curl -sSL https://raw.githubusercontent.com/shahbazimasoud/clonematrixtest/master/uninstall-panel.sh | sudo bash${NC}"
echo -e "${CYAN}======================================================================${NC}"
