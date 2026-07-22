#!/usr/bin/env bash
# ==============================================================================
# Raven Matrix Stack Manager - Interactive VPS Uninstaller
# ==============================================================================

set -eo pipefail

# Colors for terminal output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

log_info() { echo -e "${BLUE}[INFO]${NC} $1"; }
log_step() { echo -e "${CYAN}[STEP]${NC} $1"; }
log_success() { echo -e "${GREEN}[SUCCESS]${NC} $1"; }
log_warning() { echo -e "${YELLOW}[WARNING]${NC} $1"; }
log_error() { echo -e "${RED}[ERROR]${NC} $1"; }

clear
echo -e "${RED}"
echo "======================================================================"
echo "        RAVEN MATRIX STACK MANAGER PANEL - VPS UNINSTALLER"
echo "======================================================================"
echo -e "${NC}"

# Check privileges
if [ "$EUID" -ne 0 ]; then
  log_error "Please run this uninstaller as root (using sudo)."
  exit 1
fi

# 1. Stop and Disable Systemd Service
log_step "Stopping Matrix Manager Service..."
if systemctl is-active --quiet matrix-manager; then
  systemctl stop matrix-manager || log_warning "Failed to stop service."
fi

log_step "Disabling Matrix Manager Service..."
if systemctl is-enabled --quiet matrix-manager 2>/dev/null; then
  systemctl disable matrix-manager || log_warning "Failed to disable service."
fi

log_step "Removing Systemd Service Unit File..."
if [ -f "/etc/systemd/system/matrix-manager.service" ]; then
  rm -f "/etc/systemd/system/matrix-manager.service"
  systemctl daemon-reload
  log_success "Systemd service removed."
fi

# 2. Remove Nginx Proxy Configuration
if [ -f "/etc/nginx/sites-enabled/matrix-manager.conf" ] || [ -f "/etc/nginx/sites-available/matrix-manager.conf" ]; then
  log_step "Removing Nginx proxy configuration..."
  rm -f "/etc/nginx/sites-enabled/matrix-manager.conf"
  rm -f "/etc/nginx/sites-available/matrix-manager.conf"
  
  if command -v nginx &>/dev/null; then
    if nginx -t &>/dev/null; then
      systemctl reload nginx || systemctl restart nginx || log_warning "Failed to reload Nginx."
      log_success "Nginx configuration updated and reloaded."
    fi
  fi
fi

# 3. Clean Installation Directory
INSTALL_DIR="/opt/matrix-manager"
if [ -d "$INSTALL_DIR" ]; then
  echo -e "\n${YELLOW}Would you like to delete the installation directory completely?${NC}"
  log_warning "This will permanently delete all panel databases, connections, and files inside $INSTALL_DIR."
  
  printf "%s" "Type 'DELETE' to confirm full deletion, or anything else to keep the files: " > /dev/tty 2>/dev/null || true
  read -r CONFIRM_DELETE < /dev/tty 2>/dev/null || CONFIRM_DELETE="KEEP"
  if [ "$CONFIRM_DELETE" = "DELETE" ]; then
    log_step "Deleting $INSTALL_DIR directory..."
    rm -rf "$INSTALL_DIR"
    log_success "Application directory deleted."
  else
    log_info "Preserving application files at $INSTALL_DIR."
  fi
fi

log_success "UNINSTALLATION COMPLETED SUCCESSFULLY!"
echo -e "Matrix Manager Panel has been removed from this server."
