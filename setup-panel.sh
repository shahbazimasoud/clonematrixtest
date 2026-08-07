#!/usr/bin/env bash
# ==============================================================================
# Raven — Intelligent Matrix Stack Manager VPS Setup Installer
# Supports Ubuntu 20.04/22.04/24.04, Debian 11/12, and other Debian-based systems
# ==============================================================================

set -eo pipefail

# Make script completely non-interactive for package managers
export DEBIAN_FRONTEND=noninteractive
export APT_LISTCHANGES_FRONTEND=none
export NEEDRESTART_MODE=a
export UCF_FORCE_CONFFOLD=1

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

PANEL_VERSION="2.6.5"
detect_panel_version() {
  local target_dir="${1:-.}"
  if [ -f "$target_dir/src/version.ts" ]; then
    local EXTRACTED_VER
    EXTRACTED_VER=$(grep -oP 'export const PANEL_VERSION = ["\x27]\K[^"\x27]+' "$target_dir/src/version.ts" 2>/dev/null || true)
    if [ -n "$EXTRACTED_VER" ]; then
      PANEL_VERSION="$EXTRACTED_VER"
      return 0
    fi
  fi
  if [ -f "$target_dir/package.json" ]; then
    local EXTRACTED_VER
    EXTRACTED_VER=$(grep -oP '"version":\s*"\K[^"]+' "$target_dir/package.json" 2>/dev/null || true)
    if [ -n "$EXTRACTED_VER" ] && [ "$EXTRACTED_VER" != "0.0.0" ]; then
      PANEL_VERSION="$EXTRACTED_VER"
      return 0
    fi
  fi
}

detect_panel_version "."
[ -n "${INSTALL_DIR:-}" ] && detect_panel_version "$INSTALL_DIR"

clear
echo -e "${CYAN}"
cat << EOF
======================================================================
  ██████╗  █████╗  ██╗   ██╗███████╗███╗   ██╗
  ██╔══██╗██╔══██╗ ██║   ██║██╔════╝████╗  ██║
  ██████╔╝███████║ ██║   ██║█████╗  ██╔██╗ ██║
  ██╔══██╗██╔══██║ ╚██╗ ██╔╝██╔══╝  ██║╚██╗██║
  ██║  ██║██║  ██║  ╚████╔╝ ███████╗██║ ╚████║
  ╚═╝  ╚═╝╚═╝  ╚═╝   ╚═══╝  ╚══════╝╚═╝  ╚═══╝

    RAVEN — INTELLIGENT MATRIX STACK MANAGEMENT PANEL
    Developer: Masoud Shahbazi (https://www.linkedin.com/in/masoudshahbazi/)

    Version: v${PANEL_VERSION}

======================================================================
EOF
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
# 1. Interactive Questions (Safe for curl | bash execution on all Ubuntu versions)
# ------------------------------------------------------------------------------
prompt_read() {
  local prompt_msg="$1"
  local var_name="$2"
  local default_val="$3"
  local is_secret="${4:-false}"
  local user_input=""

  # Use existing env var if pre-configured
  eval "local existing_val=\"\${$var_name:-}\""
  if [ -n "$existing_val" ]; then
    log_info "Using pre-configured value for $var_name: $existing_val"
    return 0
  fi

  # Determine TTY output device so prompt is NEVER hidden when piped via curl | bash
  local tty_out="&2"
  if [ -c /dev/tty ] && [ -w /dev/tty ]; then
    tty_out="/dev/tty"
  fi

  if [ "$tty_out" = "/dev/tty" ]; then
    printf "%s" "$prompt_msg" > /dev/tty
  else
    printf "%s" "$prompt_msg" >&2
  fi

  if [ -t 0 ]; then
    if [ "$is_secret" = "true" ]; then
      read -r -s user_input
      echo "" >&2
    else
      read -r user_input
    fi
  elif [ -c /dev/tty ] && [ -r /dev/tty ]; then
    if [ "$is_secret" = "true" ]; then
      read -r -s user_input < /dev/tty 2>/dev/null || user_input="$default_val"
      echo "" > /dev/tty 2>/dev/null || true
    else
      read -r user_input < /dev/tty 2>/dev/null || user_input="$default_val"
    fi
  else
    user_input="$default_val"
    echo " [Non-interactive mode, using default: $default_val]" >&2
  fi

  eval "$var_name=\"\${user_input:-\$default_val}\""
}

echo -e "\n${YELLOW}>>> Please provide the network and administrative configurations below:${NC}\n"

# Domain or Private IP
DETECTED_PRIVATE_IP=$(ip route get 1.1.1.1 2>/dev/null | grep -oP 'src \K\S+' || hostname -I | awk '{print $1}')
[ -z "$DETECTED_PRIVATE_IP" ] && DETECTED_PRIVATE_IP="localhost"

echo -e "${BLUE}ℹ️  Note: The Admin Panel domain should be different from your Matrix homeserver domain (e.g. matrix.domain.local) and Element Web domain (e.g. matrixapp.domain.local) to avoid Nginx domain conflicts.${NC}"
prompt_read "Enter Domain Name or Private IP for this Admin Panel [Default: ${DETECTED_PRIVATE_IP}]: " PANEL_DOMAIN "${DETECTED_PRIVATE_IP}"

# SSL / HTTPS Port
while true; do
  prompt_read "Enter SSL/HTTPS Port to run the Admin Panel on [Default: 8443]: " PANEL_PORT "8443"
  if [[ "$PANEL_PORT" =~ ^[0-9]+$ ]] && [ "$PANEL_PORT" -ge 1 ] && [ "$PANEL_PORT" -le 65535 ]; then
    break
  else
    log_error "Invalid port number. Please enter a value between 1 and 65535."
    PANEL_PORT="8443"
  fi
done

# Owner Username
while true; do
  prompt_read "Enter Initial Owner Username [Default: admin]: " OWNER_USER "admin"
  if [[ "$OWNER_USER" =~ ^[a-zA-Z0-9_-]+$ ]]; then
    break
  else
    log_error "Invalid username. Use only alphanumeric characters, underscores, or hyphens."
    OWNER_USER="admin"
  fi
done

# Owner Email
while true; do
  prompt_read "Enter Initial Owner Email Address [Default: admin@company.local]: " OWNER_EMAIL "admin@company.local"
  if [[ "$OWNER_EMAIL" =~ ^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$ ]]; then
    break
  else
    log_error "Invalid email address format. Please try again."
    OWNER_EMAIL="admin@company.local"
  fi
done

# Owner Password
while true; do
  prompt_read "Enter Secure Password for Owner ($OWNER_USER) [default: admin]: " OWNER_PASS "" "true"
  if [ -z "$OWNER_PASS" ]; then
    OWNER_PASS="admin"
    OWNER_PASS_CONFIRM="admin"
    log_info "No password provided. Defaulting to: admin"
    break
  fi

  if [ "$OWNER_PASS" = "admin" ]; then
    OWNER_PASS_CONFIRM="admin"
    break
  fi

  prompt_read "Confirm Secure Password: " OWNER_PASS_CONFIRM "$OWNER_PASS" "true"
  
  if [ ${#OWNER_PASS} -lt 4 ]; then
    log_error "Password is too short. It must be at least 4 characters."
    OWNER_PASS="admin"
  elif [ "$OWNER_PASS" != "$OWNER_PASS_CONFIRM" ]; then
    log_error "Passwords do not match. Please try again."
    OWNER_PASS="admin"
  else
    break
  fi
done

# ------------------------------------------------------------------------------
# 2. System Dependency Installation (Compatible with all Ubuntu versions)
# ------------------------------------------------------------------------------
log_step "Checking and repairing package database state (if interrupted)..."
DEBIAN_FRONTEND=noninteractive dpkg --configure -a < /dev/null 2>/dev/null || true
DEBIAN_FRONTEND=noninteractive apt-get install -f -y -o Dpkg::Options::="--force-confdef" -o Dpkg::Options::="--force-confold" < /dev/null 2>/dev/null || true

log_step "Updating local package list..."
DEBIAN_FRONTEND=noninteractive apt-get update -y < /dev/null || log_warning "Some package repositories could not be updated (e.g. offline or forbidden). Continuing with remaining catalogs..."

log_step "Installing general system tools (git, curl, build-essential, python3, pip, venv, ca-certificates)..."
DEBIAN_FRONTEND=noninteractive apt-get install -y -o Dpkg::Options::="--force-confdef" -o Dpkg::Options::="--force-confold" git curl build-essential python3 python3-pip python3-venv python3-dev ca-certificates gnupg lsb-release xz-utils < /dev/null

# Node.js and NPM detection and multi-method installation
install_nodejs_22() {
  local NODE_VER
  NODE_VER=$(node -v 2>/dev/null | cut -d. -f1 | tr -d 'v' || echo "0")
  NODE_VER=${NODE_VER:-0}
  if command -v node &>/dev/null && [ "$NODE_VER" -ge 20 ]; then
    log_info "Node.js $(node -v) is already installed."
    return 0
  fi

  log_step "Installing Node.js 22 LTS..."
  
  # Method 1: NodeSource setup script
  log_info "Attempting NodeSource Node.js 22 repository installation..."
  curl -fsSL https://deb.nodesource.com/setup_22.x | DEBIAN_FRONTEND=noninteractive bash - < /dev/null 2>/dev/null || true
  DEBIAN_FRONTEND=noninteractive apt-get install -y -o Dpkg::Options::="--force-confdef" -o Dpkg::Options::="--force-confold" nodejs < /dev/null 2>/dev/null || true

  NODE_VER=$(node -v 2>/dev/null | cut -d. -f1 | tr -d 'v' || echo "0")
  NODE_VER=${NODE_VER:-0}

  # Method 2: Fallback to direct official Node.js pre-built binary tarball (Works on ALL Ubuntu versions: 18.04, 20.04, 22.04, 24.04, Debian 10/11/12)
  if [ "$NODE_VER" -lt 20 ]; then
    log_warning "NodeSource repository setup failed or unavailable. Downloading Node.js 22 LTS prebuilt binary tarball..."
    local ARCH
    ARCH=$(uname -m)
    local NODE_ARCH="x64"
    case "$ARCH" in
      x86_64) NODE_ARCH="x64" ;;
      aarch64|arm64) NODE_ARCH="arm64" ;;
      *) NODE_ARCH="x64" ;;
    esac

    local NODE_DIST="node-v22.14.0-linux-${NODE_ARCH}"
    rm -rf "/tmp/${NODE_DIST}*"
    if curl -fsSL --connect-timeout 20 --max-time 120 "https://nodejs.org/dist/v22.14.0/${NODE_DIST}.tar.xz" -o "/tmp/${NODE_DIST}.tar.xz" || \
       curl -fsSL --connect-timeout 20 --max-time 120 "https://mirror.ghproxy.com/https://nodejs.org/dist/v22.14.0/${NODE_DIST}.tar.xz" -o "/tmp/${NODE_DIST}.tar.xz"; then
      tar -xJf "/tmp/${NODE_DIST}.tar.xz" -C /usr/local --strip-components=1 || true
      rm -f "/tmp/${NODE_DIST}.tar.xz"
    fi
  fi

  NODE_VER=$(node -v 2>/dev/null | cut -d. -f1 | tr -d 'v' || echo "0")
  NODE_VER=${NODE_VER:-0}
  if [ "$NODE_VER" -ge 20 ]; then
    log_success "Node.js successfully installed: $(node -v)"
  else
    log_error "Failed to install Node.js 20+. Please install Node.js manually."
    exit 1
  fi
}

install_nodejs_22

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
    detect_panel_version "."
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

log_step "Generating password hashes and seeding database with Owner credentials..."

export ENV_OWNER_USER="$OWNER_USER"
export ENV_OWNER_EMAIL="$OWNER_EMAIL"
export ENV_OWNER_PASS="$OWNER_PASS"
export ENV_INSTALL_DIR="$INSTALL_DIR"

node -e "
const fs = require('fs');
const path = require('path');
const bcrypt = require('bcryptjs');

const installDir = process.env.ENV_INSTALL_DIR || process.cwd();
const ownerUser = process.env.ENV_OWNER_USER || 'admin';
const ownerEmail = process.env.ENV_OWNER_EMAIL || 'admin@company.local';
const ownerPass = process.env.ENV_OWNER_PASS || 'admin';

const passwordHash = bcrypt.hashSync(ownerPass, 10);

const targetPaths = [
  path.join(installDir, 'sandbox', 'db', 'panel_data.json'),
  path.join(installDir, 'db', 'panel_data.json')
];

for (const targetPath of targetPaths) {
  const dir = path.dirname(targetPath);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });

  let dbData = {
    users: [],
    matrixUsers: [],
    matrixRooms: [],
    matrixMedia: [],
    registrationTokens: [
      { token: 'ORG-STAFF-PROMO-2026', usesAllowed: 50, usesCount: 0, expiryTime: '2026-12-31T23:59:59.000Z', isActive: true }
    ],
    auditLogs: [],
    backups: [],
    undoHistory: [],
    ldapConfig: { enabled: false, uri: 'ldap://ldap.company.local:389', baseDn: 'ou=users,dc=company,dc=local', searchAttr: 'uid', bindDn: 'cn=admin,dc=company,dc=local', bindPassword: '', tls: false },
    redisConfig: { enabled: false, host: 'localhost', port: '6379', db: '0', password: '' },
    smtpConfig: { enabled: false, host: 'smtp.company.local', port: '587', user: '', pass: '', from: 'Matrix Server <noreply@company.local>', requireTls: true }
  };

  // 1. Check persistent backup location first (/etc/matrix-manager-backup/panel_data.json)
  const persistentBackupPath = '/etc/matrix-manager-backup/panel_data.json';
  if (fs.existsSync(persistentBackupPath)) {
    try {
      const rawBackup = fs.readFileSync(persistentBackupPath, 'utf8');
      if (rawBackup && rawBackup.trim()) {
        const parsedBackup = JSON.parse(rawBackup);
        if (parsedBackup && typeof parsedBackup === 'object') {
          dbData = parsedBackup;
          console.log('Restored base panel data from persistent backup at ' + persistentBackupPath);
        }
      }
    } catch (e) {
      console.error('Error reading persistent backup at ' + persistentBackupPath + ':', e);
    }
  }

  // 2. Check target path if existing
  if (fs.existsSync(targetPath)) {
    try {
      const raw = fs.readFileSync(targetPath, 'utf8');
      if (raw && raw.trim()) {
        const parsed = JSON.parse(raw);
        if (parsed && typeof parsed === 'object') {
          // Merge users and connections from targetPath if richer
          if (Array.isArray(parsed.users) && parsed.users.length > 0) {
            dbData.users = parsed.users;
          }
          if (Array.isArray(parsed.connections) && parsed.connections.length > 0) {
            dbData.connections = parsed.connections;
          }
        }
      }
    } catch (e) {
      console.error('Error reading existing database at ' + targetPath + ':', e);
    }
  }

  if (!Array.isArray(dbData.users)) dbData.users = [];

  // Remove any default hardcoded admin user if custom ownerUser is specified and not 'admin'
  if (ownerUser !== 'admin') {
    dbData.users = dbData.users.filter(u => u.username !== 'admin');
  }

  // Find or insert the Owner user
  let ownerIdx = dbData.users.findIndex(u => u.role === 'Owner' || u.username === ownerUser);
  if (ownerIdx !== -1) {
    dbData.users[ownerIdx].username = ownerUser;
    dbData.users[ownerIdx].email = ownerEmail;
    dbData.users[ownerIdx].passwordHash = passwordHash;
    dbData.users[ownerIdx].role = 'Owner';
    dbData.users[ownerIdx].isActive = true;
    dbData.users[ownerIdx].avatar = 'https://api.dicebear.com/7.x/bottts/svg?seed=' + encodeURIComponent(ownerUser);
  } else {
    dbData.users.unshift({
      id: 'usr-owner-' + Date.now(),
      username: ownerUser,
      email: ownerEmail,
      passwordHash: passwordHash,
      role: 'Owner',
      isActive: true,
      avatar: 'https://api.dicebear.com/7.x/bottts/svg?seed=' + encodeURIComponent(ownerUser)
    });
  }

  // Maintain matrixUsers
  if (!Array.isArray(dbData.matrixUsers)) dbData.matrixUsers = [];
  const mxid = '@' + ownerUser + ':matrix.company.local';
  if (!dbData.matrixUsers.some(m => m.mxid === mxid)) {
    dbData.matrixUsers.unshift({ mxid, isAdmin: true, isDeactivated: false });
  }

  // Log audit log entry
  if (!Array.isArray(dbData.auditLogs)) dbData.auditLogs = [];
  dbData.auditLogs.unshift({
    id: 'log-' + Date.now(),
    timestamp: new Date().toISOString(),
    username: 'system',
    action: 'Owner Account Setup',
    target: 'Database',
    status: 'success',
    details: 'Configured Owner account (' + ownerUser + ') with custom credentials.'
  });

  fs.writeFileSync(targetPath, JSON.stringify(dbData, null, 2), 'utf8');
  console.log('Successfully configured Owner user ' + ownerUser + ' in ' + targetPath);
}
"

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
PORT=3000
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
Environment=PORT=3000
Environment=NODE_ENV=production

[Install]
WantedBy=multi-user.target
EOF

log_info "Enabling and booting Matrix Manager Panel daemon..."
systemctl daemon-reload
systemctl enable matrix-manager
systemctl restart matrix-manager

# ------------------------------------------------------------------------------
# 5.5 Nginx Routing Integration & Self-Signed SSL Certificate Setup
# ------------------------------------------------------------------------------
log_step "Configuring Self-Signed SSL Certificate and Nginx Reverse Proxy on port $PANEL_PORT..."

# Ensure Nginx & OpenSSL are installed
if ! command -v nginx &>/dev/null || ! command -v openssl &>/dev/null; then
  log_info "Installing Nginx & OpenSSL..."
  DEBIAN_FRONTEND=noninteractive apt-get install -y -o Dpkg::Options::="--force-confdef" -o Dpkg::Options::="--force-confold" nginx openssl < /dev/null || true
fi

# Generate self-signed SSL cert for Admin Panel if not present
mkdir -p /etc/nginx/ssl
SSL_CERT_PATH="/etc/nginx/ssl/matrix-panel.crt"
SSL_KEY_PATH="/etc/nginx/ssl/matrix-panel.key"

if [ ! -f "$SSL_CERT_PATH" ] || [ ! -f "$SSL_KEY_PATH" ]; then
  log_info "Generating 10-year Self-Signed TLS Certificate for Admin Panel..."
  openssl req -x509 -nodes -days 3650 -newkey rsa:2048 \
    -keyout "$SSL_KEY_PATH" \
    -out "$SSL_CERT_PATH" \
    -subj "/CN=$PANEL_DOMAIN/O=Raven Matrix/OU=Admin Panel" 2>/dev/null || true
  chmod 600 "$SSL_KEY_PATH"
fi

if [ -d "/etc/nginx" ]; then
  log_info "Creating Nginx HTTPS reverse proxy config listening on port $PANEL_PORT..."
  NGINX_CONF_PATH="/etc/nginx/sites-available/matrix-manager.conf"
  cat <<'EOF' > "$NGINX_CONF_PATH"
server {
    listen $PANEL_PORT ssl http2;
    listen [::]:$PANEL_PORT ssl http2;
    server_name $PANEL_DOMAIN _;

    ssl_certificate /etc/nginx/ssl/matrix-panel.crt;
    ssl_certificate_key /etc/nginx/ssl/matrix-panel.key;
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers HIGH:!aNULL:!MD5;

    client_max_body_size 100M;

    location / {
        proxy_pass http://127.0.0.1:3000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto https;

        # WebSocket / WSS Handshake and Tunnel Proxying
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_read_timeout 86400s;
        proxy_send_timeout 86400s;
    }
}
EOF
  # Inject variables dynamically into the template
  sed -i "s/\$PANEL_DOMAIN/$PANEL_DOMAIN/g" "$NGINX_CONF_PATH"
  sed -i "s/\$PANEL_PORT/$PANEL_PORT/g" "$NGINX_CONF_PATH"

  ln -sf "$NGINX_CONF_PATH" "/etc/nginx/sites-enabled/matrix-manager.conf"

  # Validate and reload Nginx
  log_info "Validating and reloading Nginx service..."
  if command -v nginx &>/dev/null; then
    if nginx -t &>/dev/null; then
      systemctl reload nginx || systemctl restart nginx || log_warning "Failed to restart Nginx."
      log_success "Nginx successfully configured with Self-Signed SSL on port $PANEL_PORT!"
    else
      log_warning "Nginx configuration test failed. Please check /etc/nginx/sites-available/matrix-manager.conf"
    fi
  fi
fi

# Ensure firewall allows the custom SSL port if ufw or firewalld is active
if command -v ufw &>/dev/null && ufw status | grep -q "active"; then
  log_info "UFW firewall is active. Allowing TCP traffic on HTTPS port $PANEL_PORT..."
  ufw allow "$PANEL_PORT/tcp" || log_warning "Failed to configure UFW rule for port $PANEL_PORT."
fi

if command -v firewall-cmd &>/dev/null && systemctl is-active --quiet firewalld; then
  log_info "Firewalld is active. Allowing TCP traffic on HTTPS port $PANEL_PORT..."
  firewall-cmd --permanent --add-port="$PANEL_PORT/tcp" || true
  firewall-cmd --reload || true
fi

# ------------------------------------------------------------------------------
# 6. Installation Report Summary
# ------------------------------------------------------------------------------
# Resolve final Private IP / Access Domain
PRIVATE_IP=$(ip route get 1.1.1.1 2>/dev/null | grep -oP 'src \K\S+' || hostname -I | awk '{print $1}')
[ -z "$PRIVATE_IP" ] && PRIVATE_IP="127.0.0.1"

ACCESS_URL="https://$PANEL_DOMAIN:$PANEL_PORT"
if [ "$PANEL_DOMAIN" == "localhost" ] || [ "$PANEL_DOMAIN" == "127.0.0.1" ] || [ "$PANEL_DOMAIN" == "$PRIVATE_IP" ]; then
  ACCESS_URL="https://$PRIVATE_IP:$PANEL_PORT"
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
