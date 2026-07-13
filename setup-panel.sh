#!/usr/bin/env bash
# ==============================================================================
# Ketesa Admin Matrix Manager - Interactive VPS Setup Installer
# Supports Ubuntu 20.04/22.04/24.04, Debian 11/12, and other Debian-based systems
# ==============================================================================

set -eo pipefail

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
read -p "Enter Domain Name or Public IP for this Admin Panel [Default: localhost]: " PANEL_DOMAIN
PANEL_DOMAIN=${PANEL_DOMAIN:-localhost}

# Port
while true; do
  read -p "Enter Port to run the Admin Panel on [Default: 3000]: " PANEL_PORT
  PANEL_PORT=${PANEL_PORT:-3000}
  if [[ "$PANEL_PORT" =~ ^[0-9]+$ ]] && [ "$PANEL_PORT" -ge 1 ] && [ "$PANEL_PORT" -le 65535 ]; then
    break
  else
    log_error "Invalid port number. Please enter a value between 1 and 65535."
  fi
done

# Owner Username
while true; do
  read -p "Enter Initial Owner Username [Default: admin]: " OWNER_USER
  OWNER_USER=${OWNER_USER:-admin}
  if [[ "$OWNER_USER" =~ ^[a-zA-Z0-9_-]+$ ]]; then
    break
  else
    log_error "Invalid username. Use only alphanumeric characters, underscores, or hyphens."
  fi
done

# Owner Email
while true; do
  read -p "Enter Initial Owner Email Address [Default: admin@company.local]: " OWNER_EMAIL
  OWNER_EMAIL=${OWNER_EMAIL:-admin@company.local}
  if [[ "$OWNER_EMAIL" =~ ^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$ ]]; then
    break
  else
    log_error "Invalid email address format. Please try again."
  fi
done

# Owner Password
while true; do
  read -s -p "Enter Secure Password for Owner ($OWNER_USER) [min 6 chars]: " OWNER_PASS
  echo ""
  read -s -p "Confirm Secure Password: " OWNER_PASS_CONFIRM
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

log_step "Installing general system tools (git, curl, build-essential)..."
apt-get install -y git curl build-essential

# Node.js and NPM detection and installation
if ! command -v node &> /dev/null || [ $(node -v | cut -d. -f1 | tr -d 'v') -lt 18 ]; then
  log_step "Installing Node.js 18 LTS repository..."
  curl -fsSL https://deb.nodesource.com/setup_18.x | bash -
  apt-get install -y nodejs
else
  log_info "Node.js is already installed ($(node -v)). Skipping installation."
fi

# ------------------------------------------------------------------------------
# 3. Code Checkout & Directory Setup
# ------------------------------------------------------------------------------
if [ "$(pwd)" != "$INSTALL_DIR" ]; then
  log_step "Cloning Matrix Manager repository into $INSTALL_DIR..."
  if [ -d "$INSTALL_DIR/.git" ]; then
    log_info "Git repository found. Pulling latest code changes..."
    cd "$INSTALL_DIR"
    git fetch --all
    git reset --hard origin/master || git reset --hard origin/main
  else
    rm -rf "$INSTALL_DIR"/*
    git clone https://github.com/shahbazimasoud/matrix-manager.git "$INSTALL_DIR"
    cd "$INSTALL_DIR"
  fi
fi

# ------------------------------------------------------------------------------
# 4. Dependency installation & Build
# ------------------------------------------------------------------------------
log_step "Installing NPM dependencies..."
npm install

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
EOF

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
NODE_ENV=production
EOF

log_step "Compiling Panel assets (Vite frontend + esbuild server production bundle)..."
npm run build

# ------------------------------------------------------------------------------
# 5. Systemd Service Deployment
# ------------------------------------------------------------------------------
log_step "Creating persistent Systemd Service..."
SERVICE_FILE="/etc/systemd/system/matrix-manager.service"

cat <<EOF > "$SERVICE_FILE"
[Unit]
Description=Ketesa Admin Matrix Manager Panel Service
After=network.target

[Service]
Type=simple
User=root
WorkingDirectory=$INSTALL_DIR
ExecStart=/usr/bin/node dist/server.cjs
Restart=on-failure
Environment=NODE_ENV=production PORT=$PANEL_PORT

[Install]
WantedBy=multi-user.target
EOF

log_info "Enabling and booting Matrix Manager Panel daemon..."
systemctl daemon-reload
systemctl enable matrix-manager
systemctl restart matrix-manager

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
echo -e "${CYAN}======================================================================${NC}"
