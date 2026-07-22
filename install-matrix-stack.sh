#!/usr/bin/env bash
set -euo pipefail

if [[ $EUID -ne 0 ]]; then
  if command -v sudo >/dev/null 2>&1; then
    echo "⚠️  Root privileges are required. Re-running with sudo..."
    exec sudo bash "$0" "$@"
  fi
  echo "❌ Please run this script as root: sudo bash \"$0\""
  exit 1
fi

LOG_FILE="/var/log/matrix_stack_install.log"
exec > >(tee -a "$LOG_FILE") 2>&1

#############################################

# Matrix Stack Manager - v2.2 (Enterprise)
# Telegram: https://t.me/ShahbaziMasoud
#
# v2.0 changes:
#   - PostgreSQL is now mandatory for new installs (SQLite removed)
#   - Full LDAP authentication management (configure/enable/disable/test)
#   - Security hardening: fail2ban, Nginx + Synapse rate limiting, audit log
#   - Synapse workers/scaling via Redis-based replication
#   - Prometheus + node_exporter monitoring
#
# v2.1 changes:
#   - Updates menu: safely update Matrix Synapse (server) with automatic
#     pre-update backup (config + PostgreSQL dump) so data is never lost
#   - Updates menu: update Element Web with an automatic rollback copy
#   - "Check for updates" version comparison for both components
#
# v3.0 changes:
#   - Complete configuration management refactor:
#     All Synapse settings now managed directly in homeserver.yaml via yq.
#     Eliminated unreliable conf.d file creation and sed/awk/grep YAML editing.
#     Added YAML management layer (yaml_get/set/delete/exists/append/backup/restore).
#     Added yaml_transaction() for safe config changes with auto-rollback.
#     Automatic migration of existing conf.d settings into homeserver.yaml.
#     Worker configs, log configs, and appservice registrations remain separate.
#
# v2.2 changes:
#   - SSL certificate setup: auto-detect local/internal domains and use
#     self-signed certificates instead of Let's Encrypt (avoids errors
#     for .local / internal hostnames that can't be validated publicly)
#   - SSL management menu: generate self-signed, renew Let's Encrypt,
#     view certificate info, and fix missing cert errors automatically
#   - New menu option "Show Connection Info": displays all domains,
#     database credentials, secrets, and important paths at a glance
#
# v3.1 changes (bugfix):
#   - Fixed a script-wide bug caused by `set -e`: every menu action was
#     invoked as a bare "N) some_function ;;" case entry. Any non-zero
#     return from that function (including a normal "not configured
#     yet" / "test failed" message) silently KILLED THE ENTIRE SCRIPT
#     instead of just returning to the menu. This was most noticeable
#     under Authentication & Security -> LDAP Management, where opening
#     "Enable/Disable" or "Test LDAP connection" before LDAP was
#     configured (or a failed connection test) would exit the whole
#     program back to the shell.
#   - Fix: every such menu dispatch line across the entire script now
#     safely absorbs a non-zero return (`|| true`), so failures/aborts
#     inside a menu action always return control to that menu instead
#     of terminating the process. No feature behavior was changed --
#     only the "return to menu on failure" behavior was restored.
#############################################

LOG_FILE="/var/log/matrix_stack_install.log"
exec > >(tee -a "$LOG_FILE") 2>&1

CONFIG_FILE="/etc/matrix-stack.conf"
LDAP_CONF_FILE="/etc/matrix-stack-ldap.conf"
WORKERS_CONF_FILE="/etc/matrix-stack-workers.conf"
PGADMIN_CONF_FILE="/etc/matrix-pgadmin.conf"
DEPLOYMENT_CONF_FILE="/etc/matrix-stack-deployment.conf"
AUDIT_LOG="/var/log/matrix-stack-audit.log"
VERSION="3.1"

# NOTE: script runs with `set -u`, so every LDAP_* variable must exist
# BEFORE it's ever referenced -- including inside ldap_menu's status
# display, which runs even when LDAP hasn't been configured yet (or when
# an older/partial ${LDAP_CONF_FILE} on disk is missing one of these
# keys, e.g. LDAP_BASE). Without these defaults, sourcing an incomplete
# config file (via load_ldap_config) leaves the missing variable unset
# and the very next "${LDAP_BASE}" reference kills the whole script with
# "unbound variable". Declaring empty defaults here makes every later
# reference safe regardless of what load_ldap_config actually finds.
LDAP_URI="${LDAP_URI:-}"
LDAP_BASE="${LDAP_BASE:-}"
LDAP_MODE="${LDAP_MODE:-}"
LDAP_START_TLS="${LDAP_START_TLS:-}"
LDAP_BIND_DN="${LDAP_BIND_DN:-}"
LDAP_BIND_PASSWORD="${LDAP_BIND_PASSWORD:-}"
LDAP_UID_ATTR="${LDAP_UID_ATTR:-}"
LDAP_MAIL_ATTR="${LDAP_MAIL_ATTR:-}"
LDAP_NAME_ATTR="${LDAP_NAME_ATTR:-}"

# Local package cache folder ("matrix_package"), created next to this script.
# Used to store/reuse downloaded install packages (Element Web, Ketesa, ...)
# so re-installs don't have to re-download from the internet every time.
SCRIPT_DIR="$(cd "$(dirname "$(readlink -f "$0" 2>/dev/null || echo "$0")")" && pwd)"
PACKAGE_CACHE_DIR="${SCRIPT_DIR}/matrix_package"

# NOTE: `read -d ''` always returns a non-zero exit status when it hits EOF
# without finding the NUL delimiter (which happens with a normal heredoc).
# Under `set -e` that non-zero status kills the whole script silently,
# right here, before main_menu is ever reached. Appending `|| true` makes
# this a safe, well-known idiom for slurping a heredoc into a variable.
IFS= read -r -d '' ASCII_BANNER <<'BANNER' || true

╔══════════════════════════════════════════════════════════════╗
║                                                              ║
║ ███╗   ███╗ █████╗ ████████╗██████╗ ██╗██╗  ██╗              ║
║ ████╗ ████║██╔══██╗╚══██╔══╝██╔══██╗██║╚██╗██╔╝              ║
║ ██╔████╔██║███████║   ██║   ██████╔╝██║ ╚███╔╝               ║
║ ██║╚██╔╝██║██╔══██║   ██║   ██╔══██╗██║ ██╔██╗               ║
║ ██║ ╚═╝ ██║██║  ██║   ██║   ██║  ██║██║██╔╝ ██╗              ║
║ ╚═╝     ╚═╝╚═╝  ╚═╝   ╚═╝   ╚═╝  ╚═╝╚═╝╚═╝  ╚═╝              ║
║                                                              ║
║            ELEMENT • MATRIX • SYNAPSE INSTALLER              ║
║                                                              ║
╚══════════════════════════════════════════════════════════════╝


BANNER


#############################################
# Helpers
#############################################

require_root() {
  if [[ $EUID -ne 0 ]]; then
    echo "❌ Please run this script as ROOT (sudo -i)."
    exit 1
  fi
}

print_header() {
  clear || true
  echo ""

  echo ""
  echo "$ASCII_BANNER"
 

  echo "🚀 Matrix Stack Manager v${VERSION} (Enterprise)"
  echo "🔗 Telegram: https://t.me/shahbazimasoud"
  echo "📝 Log file: ${LOG_FILE}"
  echo
  echo ""

}

pause() {
  if [[ "${NON_INTERACTIVE:-}" == "true" ]]; then
    return 0
  fi
  read -rp "Press Enter to continue..." _
}

#############################################
# Local package cache ("matrix_package" folder)
#
# Goal: avoid re-downloading the same install package (Element Web,
# Ketesa, ...) every time, while still letting the user force a fresh
# download when they want one.
#
#   pkgcache_resolve_online <label> <filename>
#     - Creates matrix_package/ (next to this script) if missing.
#     - If <filename> already exists there, asks the user whether to
#       install from that existing file, or download a fresh copy.
#       If a fresh copy is requested, a new filename with a timestamp
#       suffix is picked (same folder) so the old file is kept intact.
#     - Sets:
#         PKGCACHE_SOURCE_PATH     -> non-empty if an existing cached
#                                     file should be used as-is (no
#                                     download needed)
#         PKGCACHE_DOWNLOAD_TARGET -> path the caller should download a
#                                     fresh copy to, when
#                                     PKGCACHE_SOURCE_PATH is empty
#
#   pkgcache_resolve_offline <label> [allow_skip=yes]
#     - Only CHECKS matrix_package/ (never creates it).
#     - If it exists and has files, lists them and lets the user pick
#       one by number.
#     - If it doesn't exist (or user wants a different file), asks for
#       a manual path.
#     - Sets PKGCACHE_SOURCE_PATH to the chosen file (empty on skip or
#       invalid input).
#############################################

ensure_package_cache_dir() {
  mkdir -p "${PACKAGE_CACHE_DIR}" 2>/dev/null || true
}

pkgcache_resolve_online() {
  local label="$1" filename="$2"
  ensure_package_cache_dir
  PKGCACHE_SOURCE_PATH=""
  PKGCACHE_DOWNLOAD_TARGET="${PACKAGE_CACHE_DIR}/${filename}"

  # Build the base name pattern to find ALL previously downloaded copies,
  # of ANY version (not just the version about to be installed) — e.g.
  # both element-v1.12.7.tar.gz and element-v1.12.9.tar.gz should show up
  # when about to install v1.12.9, plus any timestamped variants like
  # element-v1.12.7_20240501120000.tar.gz.
  local _name_noext
  if [[ "${filename}" == *.tar.gz ]]; then
    _name_noext="${filename%.tar.gz}"
  else
    _name_noext="${filename%.*}"
  fi
  # Strip a trailing version number (e.g. "-v1.12.7" or "v1.12.7") so the
  # pattern matches any cached version, not only this exact one.
  local _base_pattern
  _base_pattern="$(printf '%s' "${_name_noext}" | sed -E 's/-?v?[0-9]+(\.[0-9]+)*$//')"
  [[ -z "${_base_pattern}" ]] && _base_pattern="${_name_noext}"

  # Collect all matching files from the cache folder
  local _cached_files=()
  local _f
  while IFS= read -r -d '' _f; do
    _cached_files+=("${_f}")
  done < <(find "${PACKAGE_CACHE_DIR}" -maxdepth 1 -type f \
    -name "${_base_pattern}*.tar.gz" -print0 2>/dev/null | sort -z)

  if [[ "${#_cached_files[@]}" -gt 0 ]]; then
    echo
    echo "╔══════════════════════════════════════════════════════════════╗"
    echo "║  📦  Cached versions of ${label}"
    echo "╠══════════════════════════════════════════════════════════════╣"
    echo "║  The following files exist in the matrix_package folder:    ║"
    echo "╚══════════════════════════════════════════════════════════════╝"
    echo
    local _i=1
    for _f in "${_cached_files[@]}"; do
      local _sz=""
      _sz="$(du -sh "${_f}" 2>/dev/null | cut -f1)"
      printf "   %2d)  📁  %-52s  [%s]\n" "${_i}" "$(basename "${_f}")" "${_sz}"
      _i=$((_i + 1))
    done
    echo
    echo "   0)  ⬇️   Download a new version from the internet"
    echo
    echo "──────────────────────────────────────────────────────────────"
    local _choice
    read -rp "   Enter the number of the desired file [1]: " _choice
    _choice="${_choice:-1}"

    if [[ "${_choice}" =~ ^[0-9]+$ ]] && (( _choice >= 1 && _choice <= ${#_cached_files[@]} )); then
      PKGCACHE_SOURCE_PATH="${_cached_files[$((_choice - 1))]}"
      echo
      echo "✅ Using the existing file (no re-download):"
      echo "   ${PKGCACHE_SOURCE_PATH}"
      return 0
    fi

    # User chose 0 (fresh download) — pick a timestamped target filename
    local _suffix _base
    _suffix="$(date +%Y%m%d%H%M%S)"
    if [[ "${filename}" == *.tar.gz ]]; then
      _base="${filename%.tar.gz}"
      PKGCACHE_DOWNLOAD_TARGET="${PACKAGE_CACHE_DIR}/${_base}_${_suffix}.tar.gz"
    else
      PKGCACHE_DOWNLOAD_TARGET="${PACKAGE_CACHE_DIR}/${filename%.*}_${_suffix}.${filename##*.}"
    fi
    echo
    echo "⬇️  A new version will be downloaded and saved in the matrix_package folder:"
    echo "   $(basename "${PKGCACHE_DOWNLOAD_TARGET}")"
  fi
}

pkgcache_resolve_offline() {
  local label="$1" allow_skip="${2:-yes}"
  PKGCACHE_SOURCE_PATH=""

  if [[ -d "${PACKAGE_CACHE_DIR}" ]] && find "${PACKAGE_CACHE_DIR}" -maxdepth 1 -type f -print -quit 2>/dev/null | grep -q .; then
    echo
    echo "📂 Files available in the matrix_package folder:"
    echo "   ${PACKAGE_CACHE_DIR}"
    echo
    local files=() i=1 f
    while IFS= read -r -d '' f; do
      files+=("${f}")
      echo "   ${i}) $(basename "${f}")"
      i=$((i + 1))
    done < <(find "${PACKAGE_CACHE_DIR}" -maxdepth 1 -type f -print0 | sort -z)
    echo "   0) Enter a different file path"
    echo
    local _choice
    read -rp "Choose the ${label} file number: " _choice
    if [[ "${_choice}" =~ ^[0-9]+$ ]] && (( _choice >= 1 && _choice <= ${#files[@]} )); then
      PKGCACHE_SOURCE_PATH="${files[$((_choice - 1))]}"
      echo "✅ Selected: ${PKGCACHE_SOURCE_PATH}"
      return 0
    fi
  fi

  echo
  local _prompt="Enter the full path to the ${label} file"
  [[ "${allow_skip}" == "yes" ]] && _prompt+=" (or press Enter to skip and download online)"
  read -rp "${_prompt}: " PKGCACHE_SOURCE_PATH
  if [[ -z "${PKGCACHE_SOURCE_PATH}" ]]; then
    [[ "${allow_skip}" != "yes" ]] && echo "❌ Path cannot be empty."
    PKGCACHE_SOURCE_PATH=""
    return 1
  fi
  if [[ -f "${PKGCACHE_SOURCE_PATH}" ]]; then
    return 0
  fi
  echo "❌ No file found at this path: ${PKGCACHE_SOURCE_PATH}"
  PKGCACHE_SOURCE_PATH=""
  return 1
}

#############################################
# Progress bar / spinner engine for install steps
#
# Wrap any long-running install action with:
#   run_step "Human readable label" some_function arg1 arg2
#
# - Shows an animated spinner + a filling progress bar for that step.
# - The wrapped action's own stdout/stderr goes ONLY to the log file
#   (never to the screen), so the screen stays clean and just shows
#   the progress bar.
# - If the action fails, run_step NEVER aborts the script (this is
#   critical, since the script runs under `set -e`). It records the
#   failure and moves on to the next step. All failures are reported
#   together at the end via print_install_summary.
#############################################

FAILED_STEPS=()
TOTAL_STEPS=0
CURRENT_STEP=0
LAST_STEP_STATUS=0

C_RESET='\033[0m'
C_DIM='\033[2m'
C_GREEN='\033[0;32m'
C_RED='\033[0;31m'
C_CYAN='\033[0;36m'

# Build a filled/empty block bar string, e.g. "██████░░░░░░░░"
_progress_bar_str() {
  local current="$1" total="$2" width=30
  local filled=0
  if (( total > 0 )); then
    filled=$(( current * width / total ))
  fi
  (( filled > width )) && filled=$width
  local empty=$(( width - filled ))
  local bar="" i
  for ((i = 0; i < filled; i++)); do bar+="█"; done
  for ((i = 0; i < empty; i++)); do bar+="░"; done
  printf '%s' "${bar}"
}

# Render one progress line in place (uses \r + clear-to-end-of-line).
# $1 = icon, $2 = label, $3 = state (run|ok|fail), $4 = elapsed seconds (optional)
_render_step_line() {
  local icon="$1" label="$2" state="$3" elapsed="${4:-}"
  local bar percent color suffix=""
  bar="$(_progress_bar_str "${CURRENT_STEP}" "${TOTAL_STEPS}")"
  percent=0
  (( TOTAL_STEPS > 0 )) && percent=$(( CURRENT_STEP * 100 / TOTAL_STEPS ))
  case "${state}" in
    ok)   color="${C_GREEN}" ;;
    fail) color="${C_RED}" ;;
    *)    color="${C_CYAN}" ;;
  esac
  if [[ -n "${elapsed}" && "${state}" == "run" ]]; then
    suffix=" ${C_DIM}(${elapsed}s)${C_RESET}"
  fi
  printf "\r\033[K  ${color}%s${C_RESET} ${C_CYAN}[%s]${C_RESET} %3d%% ${C_DIM}(%d/%d)${C_RESET}  %-48s%b" \
    "${icon}" "${bar}" "${percent}" "${CURRENT_STEP}" "${TOTAL_STEPS}" "${label}" "${suffix}"
}

# run_step "Label" function_or_command [args...]
run_step() {
  local label="$1"; shift
  CURRENT_STEP=$((CURRENT_STEP + 1))
  local spin='⠋⠙⠹⠸⠼⠴⠦⠧⠇⠏'
  local start_ts
  start_ts=$(date +%s)

  {
    echo ""
    echo "───── [STEP ${CURRENT_STEP}/${TOTAL_STEPS}] ${label} ─────"
  } >> "${LOG_FILE}" 2>&1

  if [[ "${NON_INTERACTIVE:-}" == "true" ]]; then
    echo "───── [STEP ${CURRENT_STEP}/${TOTAL_STEPS}] ${label} ─────"
    local status=0
    "$@" 2>&1 | tee -a "${LOG_FILE}" || status=${PIPESTATUS[0]}
    LAST_STEP_STATUS="${status}"
    if [[ ${status} -eq 0 ]]; then
      echo "✔ [STEP ${CURRENT_STEP}/${TOTAL_STEPS}] ${label} completed successfully."
    else
      echo "✘ [STEP ${CURRENT_STEP}/${TOTAL_STEPS}] ${label} failed with exit code ${status}."
      FAILED_STEPS+=("${label} (exit code: ${status} — see ${LOG_FILE})")
    fi
    echo
    return 0
  fi

  # Cosmetic spinner running in the background — it does NOT run the
  # actual install command, so failures/variables from the real step
  # are never lost to a subshell.
  (
    local i=0 ch elapsed
    while :; do
      ch="${spin:$(( i % ${#spin} )):1}"
      i=$((i + 1))
      elapsed=$(( $(date +%s) - start_ts ))
      _render_step_line "${ch}" "${label}" "run" "${elapsed}"
      sleep 0.1
    done
  ) &
  local spin_pid=$!
  disown "${spin_pid}" 2>/dev/null || true

  local status=0
  "$@" >> "${LOG_FILE}" 2>&1 || status=$?

  kill "${spin_pid}" 2>/dev/null || true
  wait "${spin_pid}" 2>/dev/null || true

  LAST_STEP_STATUS="${status}"

  if [[ ${status} -eq 0 ]]; then
    _render_step_line "✔" "${label}" "ok"
  else
    _render_step_line "✘" "${label}" "fail"
    FAILED_STEPS+=("${label} (exit code: ${status} — see ${LOG_FILE})")
  fi
  echo
  return 0
}

# Prints a final, single summary of everything that went wrong during
# install (if anything). Never stops the script — just informs.
print_install_summary() {
  echo
  echo "════════════════════════════════════════════════════════════"
  if [[ "${#FAILED_STEPS[@]}" -eq 0 ]]; then
    echo -e "  ${C_GREEN}✅ All installation steps completed successfully.${C_RESET}"
  else
    echo -e "  ${C_RED}⚠️  Installation finished, but ${#FAILED_STEPS[@]} item(s) ran into problems:${C_RESET}"
    echo
    local f
    for f in "${FAILED_STEPS[@]}"; do
      echo -e "     ${C_RED}✘${C_RESET} ${f}"
    done
    echo
    echo "  For full error details, check the log file:"
    echo "     ${LOG_FILE}"
  fi
  echo "════════════════════════════════════════════════════════════"
}

log_audit() {
  mkdir -p "$(dirname "${AUDIT_LOG}")"
  echo "$(date '+%Y-%m-%d %H:%M:%S') | $(whoami) | $*" >> "${AUDIT_LOG}"
}

view_audit_log() {
  print_header
  echo "📜 === Audit Log (last 100 entries) ==="
  echo
  if [[ -f "${AUDIT_LOG}" ]]; then
    tail -n 100 "${AUDIT_LOG}"
  else
    echo "No audit log entries yet."
  fi
  pause
}

save_config() {
  local HS_DOMAIN="$1"
  local ELEMENT_DOMAIN="$2"
  local BASE_DOMAIN="$3"
  local PUBLIC_IP="$4"
  local LE_EMAIL="$5"
  local PG_DB="$6"
  local PG_USER="$7"
  local PG_PASS="$8"
  local PG_HOST="$9"
  local PG_PORT="${10}"
  local SSL_MODE="${11:-letsencrypt}"

  mkdir -p "$(dirname "${CONFIG_FILE}")"
  snap_backup "Update main config (${CONFIG_FILE})" "${CONFIG_FILE}"
  cat > "${CONFIG_FILE}" <<EOF
HS_DOMAIN=${HS_DOMAIN}
ELEMENT_DOMAIN=${ELEMENT_DOMAIN}
BASE_DOMAIN=${BASE_DOMAIN}
PUBLIC_IP=${PUBLIC_IP}
LE_EMAIL=${LE_EMAIL}
PG_DB=${PG_DB}
PG_USER=${PG_USER}
PG_PASS=${PG_PASS}
PG_HOST=${PG_HOST}
PG_PORT=${PG_PORT}
SSL_MODE=${SSL_MODE}
EOF
  chmod 600 "${CONFIG_FILE}"
}

load_config() {
  if [[ -f "${CONFIG_FILE}" ]]; then
    # shellcheck disable=SC1090
    source "${CONFIG_FILE}"
    return 0
  fi
  return 1
}

save_ldap_config() {
  mkdir -p "$(dirname "${LDAP_CONF_FILE}")"
  snap_backup "Update LDAP config (${LDAP_CONF_FILE})" "${LDAP_CONF_FILE}"
  cat > "${LDAP_CONF_FILE}" <<EOF
LDAP_URI=${LDAP_URI}
LDAP_BASE=${LDAP_BASE}
LDAP_MODE=${LDAP_MODE}
LDAP_START_TLS=${LDAP_START_TLS}
LDAP_BIND_DN=${LDAP_BIND_DN}
LDAP_BIND_PASSWORD=${LDAP_BIND_PASSWORD}
LDAP_UID_ATTR=${LDAP_UID_ATTR}
LDAP_MAIL_ATTR=${LDAP_MAIL_ATTR}
LDAP_NAME_ATTR=${LDAP_NAME_ATTR}
EOF
  chmod 600 "${LDAP_CONF_FILE}"
}

load_ldap_config() {
  if [[ -f "${LDAP_CONF_FILE}" ]]; then
    # shellcheck disable=SC1090
    source "${LDAP_CONF_FILE}"
    # Guard against an old/partial config file on disk (e.g. one saved
    # before LDAP_BASE existed, or truncated by a failed write) that is
    # missing required fields. Treat that as "not configured" rather
    # than silently proceeding with an empty Base DN / URI.
    if [[ -z "${LDAP_URI}" || -z "${LDAP_BASE}" ]]; then
      return 1
    fi
    return 0
  fi
  return 1
}

save_workers_config() {
  mkdir -p "$(dirname "${WORKERS_CONF_FILE}")"
  snap_backup "Update workers config (${WORKERS_CONF_FILE})" "${WORKERS_CONF_FILE}"
  cat > "${WORKERS_CONF_FILE}" <<EOF
NUM_GENERIC_WORKERS=${NUM_GENERIC_WORKERS}
FED_SENDER_ENABLED=${FED_SENDER_ENABLED}
WORKER_REPL_SECRET=${WORKER_REPL_SECRET}
WORKER_BASE_PORT=${WORKER_BASE_PORT}
EOF
  chmod 600 "${WORKERS_CONF_FILE}"
}

load_workers_config() {
  if [[ -f "${WORKERS_CONF_FILE}" ]]; then
    # shellcheck disable=SC1090
    source "${WORKERS_CONF_FILE}"
    return 0
  fi
  return 1
}

#############################################
# Advanced Deployment (multi-server) config
#############################################
#
# Optional layer, OFF by default. When DEPLOYMENT_CONF_FILE does not exist
# (the normal, single-server case) every deploy_host() lookup below falls
# back to "localhost", so nothing about the existing Standard Installation
# flow changes for existing users.
#
# ROLE_KEYS is the extensibility point: adding a future role (Redis, MinIO,
# LDAP, Monitoring, Worker Nodes, Bridges, ...) means adding one entry here
# and one HOST var below — no other part of the installer has to change.
ROLE_KEYS=(synapse postgres element turn nginx)

save_deployment_config() {
  mkdir -p "$(dirname "${DEPLOYMENT_CONF_FILE}")"
  snap_backup "Update deployment config (${DEPLOYMENT_CONF_FILE})" "${DEPLOYMENT_CONF_FILE}"
  cat > "${DEPLOYMENT_CONF_FILE}" <<EOF
DEPLOYMENT_MODE=${DEPLOYMENT_MODE:-standard}
SERVER_ROLES=${SERVER_ROLES:-}
SYNAPSE_HOST=${SYNAPSE_HOST:-localhost}
POSTGRES_HOST=${POSTGRES_HOST:-localhost}
ELEMENT_HOST=${ELEMENT_HOST:-localhost}
TURN_HOST=${TURN_HOST:-localhost}
NGINX_HOST=${NGINX_HOST:-localhost}
DEPLOY_HS_DOMAIN=${DEPLOY_HS_DOMAIN:-}
DEPLOY_ELEMENT_DOMAIN=${DEPLOY_ELEMENT_DOMAIN:-}
DEPLOY_BASE_DOMAIN=${DEPLOY_BASE_DOMAIN:-}
DEPLOY_TURN_REALM=${DEPLOY_TURN_REALM:-}
DEPLOY_PG_DB=${DEPLOY_PG_DB:-}
DEPLOY_PG_USER=${DEPLOY_PG_USER:-}
DEPLOY_PG_PASS=${DEPLOY_PG_PASS:-}
DEPLOY_PG_PORT=${DEPLOY_PG_PORT:-}
EOF
  chmod 600 "${DEPLOYMENT_CONF_FILE}"
}

load_deployment_config() {
  if [[ -f "${DEPLOYMENT_CONF_FILE}" ]]; then
    # shellcheck disable=SC1090
    source "${DEPLOYMENT_CONF_FILE}"
    return 0
  fi
  return 1
}

# deploy_host <role_key>
# Resolves the host for a given role (synapse|postgres|element|turn|nginx).
# Returns "localhost" whenever Advanced Deployment hasn't been configured,
# or whenever DEPLOYMENT_MODE isn't "advanced" — this is what preserves
# the existing single-server behavior everywhere this helper is used.
deploy_host() {
  local role="$1"
  local var="" val=""
  if ! load_deployment_config; then
    echo "localhost"
    return 0
  fi
  if [[ "${DEPLOYMENT_MODE:-standard}" != "advanced" ]]; then
    echo "localhost"
    return 0
  fi
  case "${role}" in
    synapse)  var="SYNAPSE_HOST" ;;
    postgres) var="POSTGRES_HOST" ;;
    element)  var="ELEMENT_HOST" ;;
    turn)     var="TURN_HOST" ;;
    nginx)    var="NGINX_HOST" ;;
    *)        echo "localhost"; return 0 ;;
  esac
  val="${!var:-}"
  echo "${val:-localhost}"
}

# pkg_is_installed / deploy_ensure_pkg: used only by the Advanced
# Deployment role installers below (the original ensure_pkg() elsewhere
# in this script is left untouched). A plain `dpkg -s <pkg>` still exits
# 0 for a package that was removed with `apt remove` (not `apt purge`) —
# its dpkg entry says "deinstall ok config-files", which `dpkg -s`
# doesn't distinguish from "install ok installed". That made a role
# report "already installed" (and skip reinstalling) right after an
# uninstall that only removed the app-level package, not this one, or
# after a manual `apt remove` elsewhere. These two helpers check the
# actual Status field instead, so re-running a role after any kind of
# removal correctly reinstalls rather than silently skipping.
pkg_is_installed() {
  dpkg-query -W -f='${Status}' "$1" 2>/dev/null | grep -q "^install ok installed"
}

deploy_ensure_pkg() {
  local pkg="$1"
  if ! pkg_is_installed "${pkg}"; then
    apt update
    apt install -y "${pkg}"
  fi
}

# prompt_remote_host <label> <default> <outvar>
# Validates hostname/IP format, then live-pings it and asks for
# confirmation if it doesn't answer (ICMP can be legitimately blocked by
# a firewall, so this warns rather than hard-blocks). Loops until the
# admin either gives a well-formed host or explicitly accepts an
# unreachable one. This is what a new admin needs when connecting one
# role to another across servers — it catches typos immediately instead
# of failing silently later inside homeserver.yaml / nginx config.
prompt_remote_host() {
  local label="$1" default="$2"
  local -n _out="$3"
  local host ans
  while true; do
    read -rp "${label} [${default}]: " host
    host="${host:-${default}}"
    if [[ "${host}" == "localhost" || "${host}" == "127.0.0.1" ]]; then
      _out="${host}"; return 0
    fi
    if ! [[ "${host}" =~ ^[a-zA-Z0-9]([a-zA-Z0-9.-]*[a-zA-Z0-9])?$ ]]; then
      echo "  ⚠️  '${host}' doesn't look like a valid hostname or IP — try again."
      continue
    fi
    echo "  🔌 Checking if ${host} is reachable..."
    if ping -c1 -W2 "${host}" >/dev/null 2>&1; then
      echo "  ✅ ${host} answered — good."
    else
      echo "  ❌ ${host} did not answer ping (this can be normal if ICMP is firewalled off)."
      read -rp "  Use '${host}' anyway? [y = yes / anything else = re-enter]: " ans
      [[ "${ans}" == "y" || "${ans}" == "Y" ]] || continue
    fi
    _out="${host}"
    return 0
  done
}

# prompt_domain <label> <outvar>
# Basic domain-format validation (chat.example.com style) so a role
# doesn't get silently misconfigured with an empty or malformed value.
prompt_domain() {
  local label="$1"
  local -n _out="$2"
  local d
  while true; do
    read -rp "${label}: " d
    if [[ -z "${d}" ]]; then
      echo "  ⚠️  This field can't be empty."
      continue
    fi
    if ! [[ "${d}" =~ ^([a-zA-Z0-9]([a-zA-Z0-9-]*[a-zA-Z0-9])?\.)+[a-zA-Z]{2,}$ ]]; then
      echo "  ⚠️  '${d}' doesn't look like a valid domain (e.g. chat.example.com) — try again."
      continue
    fi
    _out="${d}"
    return 0
  done
}

ensure_pkg() {
  local pkg="$1"
  if ! dpkg -s "$pkg" >/dev/null 2>&1; then
    apt update
    apt install -y "$pkg"
  fi
}

ensure_pg_client() {
  if ! command -v psql >/dev/null 2>&1; then
    apt update
    apt install -y postgresql-client
  fi
}

ensure_ldap_utils() {
  ensure_pkg ldap-utils
}

restart_services() {
  systemctl restart matrix-synapse || true
  systemctl restart coturn || true
  systemctl reload nginx || true
}

detect_arch() {
  uname -m
}

# Detect whether a domain is internal/local (not publicly reachable)
# Returns 0 if internal (should use self-signed), 1 if public (can use Let's Encrypt)
is_internal_domain() {
  local domain="$1"
  # .local, .internal, .lan, .corp, .home, .test, .example, .invalid
  if echo "${domain}" | grep -qiE '\.(local|internal|lan|corp|home|test|example|invalid|intranet|private|localdomain)$'; then
    return 0
  fi
  # Plain hostnames with no dots (e.g. "matrix")
  if ! echo "${domain}" | grep -q '\.'; then
    return 0
  fi
  # RFC-1918 IP addresses used as domain
  if echo "${domain}" | grep -qE '^(10\.|172\.(1[6-9]|2[0-9]|3[01])\.|192\.168\.)'; then
    return 0
  fi
  return 1
}

# --------------------------------------------------------------------------
# .local / .internal / .lan / RFC1918-style domains have no real public DNS
# -- client devices reach them only because *they* were given a hosts-file
# entry or a split-horizon internal DNS record pointing at this server's IP.
# The server itself was never told about its own name, though, so any
# self-check that curls "https://<its own .local domain>/..." from ON the
# server (health_check, nginx config tests, etc.) fails to resolve the name
# and reports "Cannot reach ..." even though the service is completely
# healthy and reachable from every real client. This keeps a managed block
# in /etc/hosts so the server can always resolve its own internal domains to
# itself, without touching anything else in the file.
# --------------------------------------------------------------------------
# --------------------------------------------------------------------------
# .local / .internal / .lan / RFC1918-style domains have no real public DNS
# -- client devices reach them only because *they* were given a hosts-file
# entry or a split-horizon internal DNS record pointing at this server's IP.
# The server itself was never told about its own name, though, so any
# self-check that curls "https://<its own .local domain>/..." from ON the
# server (health_check, nginx config tests, etc.) fails to resolve the name
# and reports "Cannot reach ..." even though the service is completely
# healthy and reachable from every real client.
#
# This keeps a managed block in /etc/hosts for exactly that purpose, but it
# is a free-form list the user fully controls (any domain, any target IP --
# not just this install's own domains, and not just 127.0.0.1). Automatic
# calls from install/health-check only ever ADD an entry that's missing;
# they never touch, reorder, or overwrite an entry that's already there --
# so anything added or edited by hand stays exactly as-is, forever, no
# matter how many times install/health-check run afterwards.
# --------------------------------------------------------------------------
HOSTS_BLOCK_BEGIN="# BEGIN matrix-stack-hosts -- managed by 12element.sh (edit freely; see Maintenance -> Local Hosts Resolution)"
HOSTS_BLOCK_END="# END matrix-stack-hosts"

# Print "ip domain" pairs currently in the managed block, one per line.
_hosts_block_lines() {
  [[ -f /etc/hosts ]] || return 0
  sed -n "/${HOSTS_BLOCK_BEGIN//\//\\/}/,/${HOSTS_BLOCK_END}/p" /etc/hosts 2>/dev/null \
    | grep -vE '^\s*#' | grep -vE '^\s*$'
}

# Rewrite the managed block from scratch using the given "ip domain" lines
# (one per array element). Backs up /etc/hosts first. Removing the block
# entirely is done by passing zero lines.
_hosts_block_write() {
  local lines=("$@")
  snap_backup "Update /etc/hosts (matrix-stack-hosts block)" /etc/hosts
  if grep -qF "${HOSTS_BLOCK_BEGIN}" /etc/hosts 2>/dev/null; then
    sed -i "/${HOSTS_BLOCK_BEGIN//\//\\/}/,/${HOSTS_BLOCK_END}/d" /etc/hosts
  fi
  if [[ ${#lines[@]} -gt 0 ]]; then
    {
      echo "${HOSTS_BLOCK_BEGIN}"
      printf '%s\n' "${lines[@]}"
      echo "${HOSTS_BLOCK_END}"
    } >> /etc/hosts
  fi
  log_audit "Updated /etc/hosts matrix-stack-hosts block (${#lines[@]} entr$([[ ${#lines[@]} -eq 1 ]] && echo y || echo ies))"
}

# Add or update one domain -> IP mapping. If the domain is already in the
# block, its IP is updated in place; otherwise a new line is appended.
# Everything else in the block is left completely untouched.
hosts_entry_upsert() {
  local domain="$1" ip="${2:-127.0.0.1}"
  local existing_lines=() out=() found=0 l l_domain
  while IFS= read -r l; do [[ -n "${l}" ]] && existing_lines+=("${l}"); done < <(_hosts_block_lines)
  for l in "${existing_lines[@]}"; do
    l_domain="$(awk '{print $2}' <<<"${l}")"
    if [[ "${l_domain}" == "${domain}" ]]; then
      out+=("${ip} ${domain}")
      found=1
    else
      out+=("${l}")
    fi
  done
  [[ ${found} -eq 0 ]] && out+=("${ip} ${domain}")
  _hosts_block_write "${out[@]}"
}

# Add a domain only if it isn't already present -- never overwrites an
# existing (possibly hand-edited) entry. This is what automatic calls use.
hosts_entry_add_if_missing() {
  local domain="$1" ip="${2:-127.0.0.1}"
  if _hosts_block_lines | awk '{print $2}' | grep -qxF "${domain}"; then
    return 0
  fi
  hosts_entry_upsert "${domain}" "${ip}"
}

# Remove one domain's entry, leaving every other entry untouched.
hosts_entry_remove() {
  local domain="$1"
  local existing_lines=() out=() l l_domain
  while IFS= read -r l; do [[ -n "${l}" ]] && existing_lines+=("${l}"); done < <(_hosts_block_lines)
  for l in "${existing_lines[@]}"; do
    l_domain="$(awk '{print $2}' <<<"${l}")"
    [[ "${l_domain}" == "${domain}" ]] && continue
    out+=("${l}")
  done
  _hosts_block_write "${out[@]}"
}

# Called automatically after install/Ketesa-install/health-check with this
# install's own domains. Only ever ADDS missing internal/.local-style
# domains at 127.0.0.1 -- never removes or overwrites anything, so any
# custom entries (different domains, different target IPs, added for other
# purposes) added via the menu below survive untouched across every run.
ensure_local_hosts_entries() {
  local domains=("$@")
  local d
  for d in "${domains[@]}"; do
    [[ -z "${d}" ]] && continue
    is_internal_domain "${d}" && hosts_entry_add_if_missing "${d}" "127.0.0.1"
  done
}

# Interactive manager: view / add / update / remove entries freely. Fully
# user-controlled -- any domain, any target IP, kept exactly as entered
# across every re-run of install/health-check.
local_hosts_menu() {
  while true; do
    print_header
    echo "🌐 === Local Hosts Resolution (/etc/hosts) ==="
    echo
    echo "Lets THIS server resolve domains that only exist on internal/split-horizon"
    echo "DNS or on client hosts-files (typical for .local setups) -- and anything"
    echo "else you want this server to resolve to any IP, for any reason."
    echo
    local lines=() l i=1
    while IFS= read -r l; do [[ -n "${l}" ]] && lines+=("${l}"); done < <(_hosts_block_lines)
    if [[ ${#lines[@]} -eq 0 ]]; then
      echo "(no entries yet)"
    else
      for l in "${lines[@]}"; do
        printf '   %2d) %s\n' "${i}" "${l}"
        i=$((i+1))
      done
    fi
    echo
    echo "1) ➕ Add / update an entry"
    echo "2) ➖ Remove an entry"
    echo "3) 🔎 Auto-add this install's domains (HS/Element/Base/Ketesa) if missing"
    echo "4) 🔙 Back"
    read -rp "Choose [1-4]: " opt
    case "${opt}" in
      1)
        read -rp "Domain (e.g. matrix.example.local): " in_domain
        [[ -z "${in_domain}" ]] && { echo "❌ Domain required."; pause; continue; }
        read -rp "Target IP [127.0.0.1]: " in_ip
        hosts_entry_upsert "${in_domain}" "${in_ip:-127.0.0.1}"
        echo "✅ Saved."
        pause
        ;;
      2)
        read -rp "Domain to remove: " in_domain
        [[ -z "${in_domain}" ]] && { echo "❌ Domain required."; pause; continue; }
        hosts_entry_remove "${in_domain}"
        echo "✅ Removed (if it existed)."
        pause
        ;;
      3)
        load_config 2>/dev/null || true
        load_ketesa_config 2>/dev/null || true
        ensure_local_hosts_entries "${HS_DOMAIN:-}" "${ELEMENT_DOMAIN:-}" "${BASE_DOMAIN:-}" "${KETESA_DOMAIN:-}"
        echo "✅ Done -- any of this install's internal domains that were missing got"
        echo "   added at 127.0.0.1. Anything already there (including custom entries)"
        echo "   was left exactly as it was."
        pause
        ;;
      4) return 0 ;;
      *) echo "Invalid option."; sleep 1 ;;
    esac
  done
}

#############################################
# SSL Certificate Management
#############################################

# Generate a self-signed certificate for a given primary domain
# and a list of SANs (space-separated additional domains)
# Local internal Certificate Authority.
# Created once and reused for every self-signed certificate this script
# issues. Admins import ONLY this CA certificate (not each leaf cert) into
# their organization's trusted root store once (e.g. Active Directory Group
# Policy, MDM, or manually per device) -- after that, every certificate
# signed by this CA (now and in the future) is automatically trusted, with
# no more browser "not trusted" / "Cannot reach homeserver" warnings.
LOCAL_CA_DIR="/etc/matrix-ca"
LOCAL_CA_KEY="${LOCAL_CA_DIR}/ca.key"
LOCAL_CA_CERT="${LOCAL_CA_DIR}/ca.crt"

ensure_local_ca() {
  if [[ -f "${LOCAL_CA_KEY}" && -f "${LOCAL_CA_CERT}" ]]; then
    return 0
  fi
  mkdir -p "${LOCAL_CA_DIR}"
  echo "🏛️  No internal CA found yet — creating one (used to sign all internal certs)..."
  openssl genrsa -out "${LOCAL_CA_KEY}" 4096 2>/dev/null
  openssl req -x509 -new -nodes -key "${LOCAL_CA_KEY}" -sha256 -days 3650 \
    -subj "/C=IR/ST=Local/L=Local/O=Matrix Internal CA/CN=Matrix Internal Root CA" \
    -out "${LOCAL_CA_CERT}" 2>/dev/null
  chmod 600 "${LOCAL_CA_KEY}"
  chmod 644 "${LOCAL_CA_CERT}"
  echo "✅ Internal CA created at ${LOCAL_CA_DIR}"
}

generate_self_signed_cert() {
  local primary_domain="$1"
  shift
  local extra_domains=("$@")

  local cert_dir="/etc/letsencrypt/live/${primary_domain}"
  snap_backup "Regenerate self-signed cert for ${primary_domain}" "${cert_dir}"
  mkdir -p "${cert_dir}"

  # Build SAN list
  local san="DNS:${primary_domain}"
  for d in "${extra_domains[@]}"; do
    [[ -n "${d}" ]] && san="${san},DNS:${d}"
  done

  ensure_local_ca

  echo "🔐 Issuing certificate for: ${primary_domain} (signed by internal CA)"
  echo "   SAN: ${san}"

  # 1) Fresh key + CSR for this specific host
  openssl req -new -nodes -newkey rsa:2048 \
    -keyout "${cert_dir}/privkey.pem" \
    -out    "${cert_dir}/req.csr" \
    -subj   "/C=IR/ST=Local/L=Local/O=Matrix/CN=${primary_domain}" 2>/dev/null

  # 2) SAN / usage extensions (must be passed via an extfile for `openssl x509 -req`)
  local ext_file
  ext_file="$(mktemp)"
  cat > "${ext_file}" <<EOF
subjectAltName=${san}
basicConstraints=CA:FALSE
keyUsage=digitalSignature,keyEncipherment
extendedKeyUsage=serverAuth
EOF

  # 3) Sign the CSR with our internal CA (instead of self-signing the leaf)
  openssl x509 -req -in "${cert_dir}/req.csr" \
    -CA "${LOCAL_CA_CERT}" -CAkey "${LOCAL_CA_KEY}" -CAcreateserial \
    -out "${cert_dir}/leaf.pem" \
    -days 3650 -sha256 -extfile "${ext_file}" 2>/dev/null

  rm -f "${ext_file}" "${cert_dir}/req.csr"

  # 4) fullchain.pem = leaf + CA cert (standard practice, and keeps every
  #    other function in this script that already reads fullchain.pem working
  #    unchanged). chain.pem = just the CA, for anything that wants it alone.
  cat "${cert_dir}/leaf.pem" "${LOCAL_CA_CERT}" > "${cert_dir}/fullchain.pem"
  rm -f "${cert_dir}/leaf.pem"
  cp "${LOCAL_CA_CERT}" "${cert_dir}/chain.pem"

  chmod 600 "${cert_dir}/privkey.pem"
  chmod 644 "${cert_dir}/fullchain.pem" "${cert_dir}/chain.pem"

  echo "✅ Certificate issued at ${cert_dir}"
  echo "   Valid for 10 years, signed by your internal CA."
  echo
  echo "ℹ️  ONE-TIME step to remove the browser warning organization-wide:"
  echo "   Import ONLY the CA certificate (not this leaf cert) into your"
  echo "   trusted root store:"
  echo "   ${LOCAL_CA_CERT}"
  echo "   • AD domain: Group Policy → Computer Config → Windows Settings →"
  echo "     Security Settings → Public Key Policies → Trusted Root"
  echo "     Certification Authorities → Import ${LOCAL_CA_CERT}"
  echo "   • Single device (Windows): certutil -addstore -f ROOT \"${LOCAL_CA_CERT}\""
  echo "   Once the CA is trusted, this certificate — and every future one"
  echo "   this script issues — will be trusted automatically, with no"
  echo "   per-device or per-certificate import needed again."
}

# Request a Let's Encrypt certificate (public domains only)
request_letsencrypt_cert() {
  local hs_domain="$1"
  local element_domain="$2"
  local base_domain="$3"
  local email="$4"

  echo "🔒 Requesting Let's Encrypt SSL certificates..."
  systemctl stop nginx || true

  certbot certonly --standalone \
    --non-interactive --agree-tos \
    -m "${email}" \
    -d "${hs_domain}" \
    -d "${element_domain}" \
    -d "${base_domain}"

  systemctl start nginx
}

# Auto-decide SSL mode and obtain/generate certificate
setup_ssl_auto() {
  local hs_domain="$1"
  local element_domain="$2"
  local base_domain="$3"
  local email="$4"

  if is_internal_domain "${hs_domain}" || is_internal_domain "${element_domain}" || is_internal_domain "${base_domain}"; then
    echo
    echo "🔍 Internal/local domain detected."
    echo "   Let's Encrypt does NOT work for internal domains (.local, .lan, etc.)"
    echo "   → Automatically switching to self-signed certificate."
    echo
    generate_self_signed_cert "${hs_domain}" "${element_domain}" "${base_domain}"
    SSL_MODE="selfsigned"
  else
    echo
    echo "🔍 Public domain detected → using Let's Encrypt."
    echo
    request_letsencrypt_cert "${hs_domain}" "${element_domain}" "${base_domain}" "${email}"
    SSL_MODE="letsencrypt"
  fi
}

ssl_menu() {
  while true; do
    print_header
    echo "🔐 === SSL Certificate Management (Unified) ==="
    echo
    echo "All certificate operations in one place:"
    echo "  • Generate self-signed, install your own PEM, or use Let's Encrypt"
    echo "  • Renew / regenerate / fix broken certificates"
    echo "  • View certificate details & expiry"
    echo

    if load_config; then
      local cert_dir="/etc/letsencrypt/live/${HS_DOMAIN}"
      local ssl_mode="${SSL_MODE:-unknown}"
      echo "─── Current Status ────────────────────────────"
      printf "  %-18s %s\n" "Domain:"       "${HS_DOMAIN}"
      printf "  %-18s %s\n" "Element:"      "${ELEMENT_DOMAIN}"
      printf "  %-18s %s\n" "SSL mode:"     "${ssl_mode}"
      if [[ -f "${cert_dir}/fullchain.pem" ]]; then
        local expiry
        expiry="$(openssl x509 -enddate -noout -in "${cert_dir}/fullchain.pem" 2>/dev/null | cut -d= -f2 || echo 'unknown')"
        printf "  %-18s %s\n" "Certificate:" "✅ present"
        printf "  %-18s %s\n" "Expires:"      "${expiry}"
        # Show issuer to help identify self-signed vs official
        local issuer
        issuer="$(openssl x509 -issuer -noout -in "${cert_dir}/fullchain.pem" 2>/dev/null | sed 's/^issuer=//' | cut -d'/' -f2-)"
        printf "  %-18s %s\n" "Issuer:"       "${issuer}"
      else
        printf "  %-18s %s\n" "Certificate:" "❌ MISSING"
      fi
      echo "────────────────────────────────────────────────"
    else
      echo "⚠️  Config not loaded. Run Install first."
    fi

    echo
    echo "─── Install / Replace ─────────────────────────"
    echo "  1) Self-signed certificate (internal/private networks)"
    echo "  2) Install my OWN / OFFICIAL certificate (PEM files)"
    echo "  3) Request / Renew Let's Encrypt (public domains only)"
    echo "─── Maintenance ───────────────────────────────"
    echo "  4) Fix missing/broken SSL (auto-detect best mode)"
    echo "  5) View certificate details (subject, issuer, SAN, dates)"
    echo "  0) Back to main menu"
    read -rp "Choose [0-5]: " opt

    case "${opt}" in
      1)
        ssl_install_selfsigned
        ;;
      2)
        ssl_install_official
        ;;
      3)
        ssl_renew_letsencrypt
        ;;
      4)
        ssl_fix_auto
        ;;
      5)
        ssl_view_cert
        ;;
      0) return 0 ;;
      *) echo "Invalid option."; sleep 1 ;;
    esac
  done
}

ssl_fix_auto() {
  print_header
  echo "🔧 === Fix SSL (auto-detect) ==="

  if ! load_config; then
    echo "⚠️  Config not found. Run Install first."
    pause
    return 1
  fi

  local cert_dir="/etc/letsencrypt/live/${HS_DOMAIN}"

  if [[ -f "${cert_dir}/fullchain.pem" ]] && openssl x509 -checkend 86400 -noout -in "${cert_dir}/fullchain.pem" >/dev/null 2>&1; then
    echo "✅ Certificate exists and is valid. Nothing to fix."
    pause
    return 0
  fi

  echo "⚠️  Certificate missing or expired. Re-generating..."
  echo

  setup_ssl_auto "${HS_DOMAIN}" "${ELEMENT_DOMAIN}" "${BASE_DOMAIN}" "${LE_EMAIL}"
  save_config "${HS_DOMAIN}" "${ELEMENT_DOMAIN}" "${BASE_DOMAIN}" "${PUBLIC_IP}" \
    "${LE_EMAIL}" "${PG_DB}" "${PG_USER}" "${PG_PASS}" "${PG_HOST}" "${PG_PORT}" "${SSL_MODE}"

  nginx -t && systemctl reload nginx || true
  log_audit "SSL fix applied (mode=${SSL_MODE})"
  echo
  echo "✅ SSL fixed. Nginx reloaded."
  pause
}

ssl_install_selfsigned() {
  print_header
  echo "🔐 === Install / Regenerate Self-Signed Certificate ==="
  echo

  if ! load_config; then
    echo "⚠️  Config not found. Run Install first."
    pause
    return 1
  fi

  echo "This will issue an internal-CA-signed certificate for:"
  echo "  Primary: ${HS_DOMAIN}"
  echo "  SANs:    ${ELEMENT_DOMAIN}, ${BASE_DOMAIN}"
  echo
  echo "⚠️  IMPORTANT — Browsers won't trust this until your internal CA is"
  echo "   trusted. That's a ONE-TIME step per organization (not per cert):"
  echo "   import /etc/matrix-ca/ca.crt into your trusted root store (AD"
  echo "   Group Policy / MDM / OS keychain). After that, this certificate"
  echo "   AND every future one this script issues is trusted automatically."
  echo
  read -rp "Continue? (y/n): " confirm
  if [[ "${confirm}" != "y" && "${confirm}" != "Y" ]]; then
    echo "Cancelled."
    pause
    return 0
  fi

  generate_self_signed_cert "${HS_DOMAIN}" "${ELEMENT_DOMAIN}" "${BASE_DOMAIN}"
  save_config "${HS_DOMAIN}" "${ELEMENT_DOMAIN}" "${BASE_DOMAIN}" "${PUBLIC_IP}" \
    "${LE_EMAIL}" "${PG_DB}" "${PG_USER}" "${PG_PASS}" "${PG_HOST}" "${PG_PORT}" "selfsigned"

  nginx -t && systemctl reload nginx || true
  # coturn uses the same cert files
  systemctl restart coturn 2>/dev/null || true
  log_audit "Self-signed (CA-signed) certificate (re)generated for ${HS_DOMAIN}"
  echo
  echo "✅ Certificate installed. Nginx + coturn reloaded."
  echo
  echo "📥 One-time step so ALL devices trust this (and future certs):"
  echo "   Import just the CA cert — not this leaf cert — org-wide:"
  echo "   /etc/matrix-ca/ca.crt"
  pause
}

ssl_renew_letsencrypt() {
  print_header
  echo "🔄 === Renew Let's Encrypt Certificate ==="

  if ! load_config; then
    echo "⚠️  Config not found. Run Install first."
    pause
    return 1
  fi

  if is_internal_domain "${HS_DOMAIN}"; then
    echo "❌ Your domain (${HS_DOMAIN}) is an internal/local domain."
    echo "   Let's Encrypt does not work for internal domains."
    echo "   Use 'Generate self-signed certificate' instead."
    pause
    return 1
  fi

  echo "Running: certbot renew --force-renewal"
  systemctl stop nginx || true
  certbot renew --force-renewal || true
  systemctl start nginx || true
  nginx -t && systemctl reload nginx || true
  log_audit "Let's Encrypt renewal attempted for ${HS_DOMAIN}"
  echo "✅ Renewal attempt complete."
  pause
}

# Install a user-supplied official/PEM certificate (gated behind the unified
# SSL menu). Wraps install_official_cert() with a clean interactive prompt.
ssl_install_official() {
  print_header
  echo "🔑 === Install Official / Custom Certificate (PEM) ==="
  echo

  if ! load_config; then
    echo "⚠️  Config not found. Run Install first."
    pause; return 1
  fi

  local cert_dir="/etc/letsencrypt/live/${HS_DOMAIN}"
  echo "Domain:  ${HS_DOMAIN}"
  if [[ -f "${cert_dir}/fullchain.pem" ]]; then
    echo "Current mode: ${SSL_MODE:-unknown}"
  else
    echo "Current cert: ❌ MISSING"
  fi
  echo
  echo "Provide paths to your official certificate files (all must be PEM):"
  echo "  • fullchain/cert = your domain certificate (+ intermediate if bundled)"
  echo "  • privkey         = the private key that matches it"
  echo "  • chain (optional)= separate intermediate CA bundle, if not bundled"
  echo
  echo "This is the BEST option for production — browsers will trust it"
  echo "without any manual import, and 'Can't connect to homeserver' errors"
  echo "will disappear."
  echo

  read -rp "Path to certificate / fullchain (PEM): " fullchain
  read -rp "Path to private key (PEM):            " privkey
  read -rp "Path to CA chain (PEM) [optional]:     " chain

  if [[ -z "${fullchain}" || -z "${privkey}" ]]; then
    echo "❌ Certificate and private key paths are required."
    pause; return 1
  fi

  install_official_cert "${fullchain}" "${privkey}" "${chain:-}"
  pause
}

ssl_view_cert() {
  print_header
  echo "📜 === Certificate Details ==="

  if ! load_config; then
    echo "⚠️  Config not found."
    pause
    return 1
  fi

  local cert_dir="/etc/letsencrypt/live/${HS_DOMAIN}"
  if [[ ! -f "${cert_dir}/fullchain.pem" ]]; then
    echo "❌ Certificate not found at ${cert_dir}/fullchain.pem"
    pause
    return 1
  fi

  openssl x509 -in "${cert_dir}/fullchain.pem" -text -noout | grep -E \
    '(Subject:|Issuer:|Not Before|Not After|DNS:|Subject Alternative Name)' || \
    openssl x509 -in "${cert_dir}/fullchain.pem" -text -noout

  pause
}

#############################################
# Show Connection Info
#############################################

show_connection_info() {
  print_header
  echo "📋 === Connection & Configuration Info ==="
  echo

  if ! load_config; then
    echo "⚠️  Config not found at ${CONFIG_FILE}. Run Install first."
    pause
    return 1
  fi

  local cert_dir="/etc/letsencrypt/live/${HS_DOMAIN}"
  local ssl_status="❌ MISSING"
  local ssl_expiry="N/A"
  if [[ -f "${cert_dir}/fullchain.pem" ]]; then
    ssl_status="✅ present (${SSL_MODE:-unknown})"
    ssl_expiry="$(openssl x509 -enddate -noout -in "${cert_dir}/fullchain.pem" 2>/dev/null | cut -d= -f2 || echo 'unknown')"
  fi

  _ensure_migrated

  local reg_secret=""
  reg_secret="$(yaml_get "registration_shared_secret" 2>/dev/null)" || reg_secret=""

  local turn_secret=""
  turn_secret="$(yaml_get "turn_shared_secret" 2>/dev/null)" || turn_secret=""

  local reg_status="unknown"
  reg_status="$(yaml_get "enable_registration" 2>/dev/null)" || reg_status="unknown"

  echo "╔══════════════════════════════════════════════════════════════╗"
  echo "║                  🌐  DOMAINS & URLs                         ║"
  echo "╠══════════════════════════════════════════════════════════════╣"
  printf "║  %-22s %-37s║\n" "Matrix Server:"     "https://${HS_DOMAIN}"
  printf "║  %-22s %-37s║\n" "Element Web:"       "https://${ELEMENT_DOMAIN}"
  printf "║  %-22s %-37s║\n" "Well-known:"        "https://${BASE_DOMAIN}"
  printf "║  %-22s %-37s║\n" "Public IP:"         "${PUBLIC_IP}"
  echo "╠══════════════════════════════════════════════════════════════╣"
  echo "║                  🔐  SSL CERTIFICATE                        ║"
  echo "╠══════════════════════════════════════════════════════════════╣"
  printf "║  %-22s %-37s║\n" "Status:"     "${ssl_status}"
  printf "║  %-22s %-37s║\n" "Expires:"    "${ssl_expiry}"
  printf "║  %-22s %-37s║\n" "Cert path:"  "${cert_dir}/"
  echo "╠══════════════════════════════════════════════════════════════╣"
  echo "║                  🐘  DATABASE (PostgreSQL)                   ║"
  echo "╠══════════════════════════════════════════════════════════════╣"
  printf "║  %-22s %-37s║\n" "Host:"      "${PG_HOST}:${PG_PORT}"
  printf "║  %-22s %-37s║\n" "Database:"  "${PG_DB}"
  printf "║  %-22s %-37s║\n" "User:"      "${PG_USER}"
  printf "║  %-22s %-37s║\n" "Password:"  "${PG_PASS}"
  echo "╠══════════════════════════════════════════════════════════════╣"
  echo "║                  🔑  SECRETS (keep safe!)                   ║"
  echo "╠══════════════════════════════════════════════════════════════╣"
  printf "║  %-22s %-37s║\n" "Reg. Secret:"   "${reg_secret:-not found}"
  printf "║  %-22s %-37s║\n" "TURN Secret:"   "${turn_secret:-not found}"
  printf "║  %-22s %-37s║\n" "Registration:"  "${reg_status}"
  echo "╠══════════════════════════════════════════════════════════════╣"
  echo "║                  🔐  LDAP                                   ║"
  echo "╠══════════════════════════════════════════════════════════════╣"
  if load_ldap_config; then
    printf "║  %-22s %-37s║\n" "URI:"       "${LDAP_URI}"
    printf "║  %-22s %-37s║\n" "Base DN:"   "${LDAP_BASE}"
    printf "║  %-22s %-37s║\n" "Mode:"      "${LDAP_MODE}"
    printf "║  %-22s %-37s║\n" "UID Attr:"  "${LDAP_UID_ATTR:-uid}"
    printf "║  %-22s %-37s║\n" "Mail Attr:" "${LDAP_MAIL_ATTR:-mail}"
    printf "║  %-22s %-37s║\n" "Name Attr:" "${LDAP_NAME_ATTR:-cn}"
  else
    printf "║  %-60s║\n" "  Not configured"
  fi
  echo "╠══════════════════════════════════════════════════════════════╣"
  echo "║                  ✉️   LET'S ENCRYPT / EMAIL                  ║"
  echo "╠══════════════════════════════════════════════════════════════╣"
  printf "║  %-22s %-37s║\n" "Email:" "${LE_EMAIL}"
  echo "╠══════════════════════════════════════════════════════════════╣"
  echo "║                  📁  IMPORTANT FILE PATHS                   ║"
  echo "╠══════════════════════════════════════════════════════════════╣"
  printf "║  %-22s %-37s║\n" "Stack config:"   "${CONFIG_FILE}"
  printf "║  %-22s %-37s║\n" "Synapse conf:"   "/etc/matrix-synapse/"
  printf "║  %-22s %-37s║\n" "Nginx conf:"     "/etc/nginx/sites-available/"
  printf "║  %-22s %-37s║\n" "Element Web:"    "/var/www/element/"
  printf "║  %-22s %-37s║\n" "Log file:"       "${LOG_FILE}"
  printf "║  %-22s %-37s║\n" "Audit log:"      "${AUDIT_LOG}"
  printf "║  %-22s %-37s║\n" "Backups:"        "/root/matrix-backups/"
  echo "╠══════════════════════════════════════════════════════════════╣"
  echo "║                  🧠  SERVICE STATUS                         ║"
  echo "╠══════════════════════════════════════════════════════════════╣"
  local svc
  for svc in matrix-synapse nginx coturn postgresql redis-server prometheus fail2ban; do
    local status_icon="❌"
    systemctl is-active --quiet "${svc}" 2>/dev/null && status_icon="✅"
    printf "║  %-22s %-37s║\n" "${svc}:" "${status_icon}"
  done
  echo "╚══════════════════════════════════════════════════════════════╝"
  echo
  echo "📌 Config file is chmod 600 — only root can read it."
  if [[ "${SSL_MODE:-}" == "selfsigned" ]]; then
    echo "📌 To trust the internal CA org-wide (one-time, covers all future certs):"
    echo "   Import /etc/matrix-ca/ca.crt into your trusted root store."
  fi

  pause
}

#############################################
# Show Editable Configuration Paths (admin reference)
#############################################

# Print a single file/directory row with existence status + size/mtime.
#   $1 = label, $2 = path
_show_path() {
  local label="$1" path="$2"
  if [[ -d "${path}" ]]; then
    printf "   📁 %-26s %s  (directory)\n" "${label}" "${path}"
  elif [[ -f "${path}" ]]; then
    local info
    info="$(stat -c '%s B,  modified %y' "${path}" 2>/dev/null | sed -E 's/\.[0-9]+ \+[0-9]+$//')"
    printf "   ✅ %-26s %s\n" "${label}" "${path}"
    printf "      %-26s %s\n" "" "${info}"
  else
    printf "   ⬜ %-26s %s  (not present)\n" "${label}" "${path}"
  fi
}

# Expand a wildcard path and print each existing match as a row.
# Shows a "not present" row if nothing matches.
#   $1 = label, $2 = glob pattern (e.g. /etc/matrix-synapse/*.signing.key)
_show_glob() {
  local label="$1" pattern="$2"
  local first=1 found=0 m
  while IFS= read -r m; do
    [[ -z "${m}" ]] && continue
    found=1
    if [[ ${first} -eq 1 ]]; then
      printf "   ✅ %-26s %s\n" "${label}" "$(basename "${m}")"
      printf "      %-26s %s\n" "" "${m}"
      first=0
    else
      printf "      %-26s %s\n" "" "${m}"
    fi
  done < <(ls -1d ${pattern} 2>/dev/null)
  if [[ ${found} -eq 0 ]]; then
    printf "   ⬜ %-26s %s  (none)\n" "${label}" "${pattern}"
  fi
}

show_editable_paths() {
  print_header
  echo "📂 === Editable Configuration Paths (Admin Reference) ==="
  echo "Every Matrix / Element file an admin may need to change."
  echo "Legend:  ✅ present   ⬜ not present   📁 directory"
  echo

  if ! load_config; then
    echo "⚠️  Stack config (${CONFIG_FILE}) not found — install may not be done yet."
    echo "    Paths are listed anyway; files marked ⬜ do not exist yet."
    echo
  fi

  echo "── 🧩 Synapse (Matrix homeserver) ─────────────────────────"
  _show_path "Main config (all settings)" "/etc/matrix-synapse/homeserver.yaml"
  _show_path "  • App services"           "/etc/matrix-synapse/conf.d/appservices.yaml"
  _show_glob "  • Worker configs"         "/etc/matrix-synapse/workers/*.yaml"
  _show_glob "  • Worker log configs"     "/etc/matrix-synapse/conf.d/*-log.yaml"
  _show_glob "  • Signing keys"           "/etc/matrix-synapse/*.signing.key"
  _show_path "Data / media store"         "/var/lib/matrix-synapse"
  _show_path "Service defaults"           "/etc/default/matrix-synapse"
  echo

  echo "── 🧬 Element Web ─────────────────────────────────────────"
  _show_path "Element config.json"     "/var/www/element/config.json"
  _show_path "Web root"                "/var/www/element"
  _show_path "Rollback copy"           "/var/www/element.previous"
  echo

  echo "── 🌐 Nginx ───────────────────────────────────────────────"
  _show_path "Matrix vhost"            "/etc/nginx/sites-available/matrix.conf"
  _show_path "Element vhost"           "/etc/nginx/sites-available/element.conf"
  _show_path "well-known vhost"        "/etc/nginx/sites-available/wellknown.conf"
  _show_path "Login rate limit"        "/etc/nginx/conf.d/matrix-ratelimit.conf"
  _show_path "Workers upstream"        "/etc/nginx/conf.d/matrix-workers-upstream.conf"
  _show_path "Global nginx.conf"       "/etc/nginx/nginx.conf"
  echo

  echo "── 📞 TURN (coturn) ───────────────────────────────────────"
  _show_path "coturn config"           "/etc/turnserver.conf"
  _show_path "Service defaults"        "/etc/default/coturn"
  echo

  echo "── 🔐 SSL certificates ────────────────────────────────────"
  if [[ -n "${HS_DOMAIN:-}" ]]; then
    _show_path "fullchain.pem"          "/etc/letsencrypt/live/${HS_DOMAIN}/fullchain.pem"
    _show_path "privkey.pem"            "/etc/letsencrypt/live/${HS_DOMAIN}/privkey.pem"
    _show_path "chain.pem"              "/etc/letsencrypt/live/${HS_DOMAIN}/chain.pem"
  else
    printf "   ⬜ %-26s %s\n" "SSL certs" "/etc/letsencrypt/live/<HS_DOMAIN>/  (HS_DOMAIN unknown)"
  fi
  echo

  echo "── 🐘 PostgreSQL ──────────────────────────────────────────"
  _show_glob "postgresql.conf"         "/etc/postgresql/*/main/postgresql.conf"
  _show_glob "pg_hba.conf"             "/etc/postgresql/*/main/pg_hba.conf"
  echo

  echo "── ⚙️  Workers ────────────────────────────────────────────"
  _show_path "systemd template"        "/etc/systemd/system/matrix-synapse-worker@.service"
  _show_glob "worker configs"          "/etc/matrix-synapse/workers/*.yaml"
  echo

  echo "── 🛡️  Security ───────────────────────────────────────────"
  _show_path "fail2ban jail"           "/etc/fail2ban/jail.d/matrix-synapse.conf"
  _show_path "fail2ban filter"         "/etc/fail2ban/filter.d/matrix-synapse.conf"
  echo

  echo "── 📈 Monitoring ──────────────────────────────────────────"
  _show_path "Prometheus config"       "/etc/prometheus/prometheus.yml"
  echo

  echo "── 🧾 This script ─────────────────────────────────────────"
  _show_path "Stack config"            "${CONFIG_FILE}"
  _show_path "LDAP config"             "${LDAP_CONF_FILE}"
  _show_path "Workers config"          "${WORKERS_CONF_FILE}"
  _show_path "Audit log"               "${AUDIT_LOG}"
  _show_path "Install log"             "${LOG_FILE}"
  echo
  echo "──────────────────────────────────────────────────────────"
  echo
  read -rp "Open a file in an editor? Enter its full path (or 'n' to skip): " editpath

  if [[ -n "${editpath}" && "${editpath}" != "n" && "${editpath}" != "N" ]]; then
    if [[ ! -e "${editpath}" ]]; then
      echo "❌ That path does not exist: ${editpath}"
    else
      # Pick an editor: $EDITOR first, then first available of nano/vim/vi
      local editor="${EDITOR:-}"
      if [[ -z "${editor}" ]]; then
        local cand
        for cand in nano vim vi; do
          if command -v "${cand}" >/dev/null 2>&1; then editor="${cand}"; break; fi
        done
      fi
      if [[ -z "${editor}" ]]; then
        echo "❌ No editor found (set \$EDITOR or install nano/vim)."
      else
        echo "📝 Opening: ${editpath}   (editor: ${editor})"
        "${editor}" "${editpath}"
        log_audit "Edited ${editpath} via ${editor}"
        echo
        echo "ℹ️  If you changed a SERVICE config, restart it afterwards:"
        echo "    • Synapse / Nginx / coturn → option 16 (Fix Wizard)"
        echo "    • Element config.json      → just hard-refresh the browser"
      fi
    fi
  fi

  pause
}

#############################################
# Shared helpers for the feature toggles
#############################################

# Fix ownership/permissions on Synapse config dir (matches installer behavior)
fix_synapse_perms() {
  local group
  group="$(id -gn matrix-synapse 2>/dev/null || echo nogroup)"
  chown -R matrix-synapse:"${group}" /etc/matrix-synapse 2>/dev/null || true
  find /etc/matrix-synapse -type d -exec chmod 750 {} \; 2>/dev/null || true
  find /etc/matrix-synapse -type f -exec chmod 640 {} \; 2>/dev/null || true
}

# Echo Synapse venv site-packages dir (empty if venv not found)
synapse_site_packages() {
  local py="/opt/venvs/matrix-synapse/bin/python"
  [[ -x "${py}" ]] || return 0
  "${py}" -c 'import site; print(site.getsitepackages()[0])' 2>/dev/null
}

# Ensure /var/www/element/config.json has a valid default_server_config.
# Element refuses to load at all -- "Invalid configuration: no default
# server specified" -- without this key, regardless of what else in the
# config is fine. Repairs in three escalating steps:
#   1. If config.json is valid JSON but missing default_server_config,
#      merge it in (keeps every other setting: Jitsi, E2EE, branding...).
#   2. If config.json is NOT even valid JSON (step 1 can't merge into
#      broken JSON), look for the newest element_jq backup
#      (config.json.bak.<timestamp>) that IS valid and has
#      default_server_config, and restore that.
#   3. If no usable backup exists either, rebuild a fresh minimal
#      config.json from scratch using the saved HS_DOMAIN. This loses any
#      custom Jitsi/screen-share/integration-manager settings, but gets
#      Element loading again instead of stuck on a blank error screen.
# Called both proactively (by config-changing menu options) and reactively
# (by element_jq itself).
_ensure_element_default_server() {
  local cfg="/var/www/element/config.json"

  if [[ ! -f "${cfg}" ]]; then
    echo "⚠️  ${cfg} does not exist at all -- Element cannot load without it,"
    echo "   and this is the other common cause of 'Invalid configuration:"
    echo "   no default server specified' (not just a broken existing file)."
    load_config 2>/dev/null || true
    if [[ -z "${HS_DOMAIN:-}" ]]; then
      echo "❌ Cannot create it: HS_DOMAIN is unknown (${CONFIG_FILE} missing"
      echo "   or unreadable). Run option 25 (Health Check) or reinstall"
      echo "   (option 1) to recover."
      return 1
    fi
    mkdir -p "$(dirname "${cfg}")"
    echo "   Creating a fresh minimal config.json using saved domain: ${HS_DOMAIN}"
    cat > "${cfg}" <<EOF
{
  "default_server_config": {
    "m.homeserver": {
      "base_url": "https://${HS_DOMAIN}",
      "server_name": "${HS_DOMAIN}"
    }
  },
  "disable_custom_urls": false,
  "disable_guests": true,
  "brand": "Element",
  "settingDefaults": {
    "features": {
      "feature_e2ee": false
    }
  }
}
EOF
    chmod 644 "${cfg}"
    echo "   ✅ Created ${cfg}."
    return 0
  fi

  ensure_pkg jq

  if jq -e '.default_server_config."m.homeserver".base_url' "${cfg}" >/dev/null 2>&1; then
    # Content is valid, but this script runs as root, so the jq check above
    # would pass even if the file itself is unreadable by Nginx's worker
    # process (e.g. www-data). A mode-600 config.json is a silent way to
    # get the exact same "Invalid configuration: no default server
    # specified" error in the browser while every internal check here looks
    # fine -- this happens whenever a temp file created by mktemp (mode 600)
    # gets mv'd on top of config.json, which does NOT inherit the old
    # file's permissions. Guard against that every time this is called.
    local perm; perm="$(stat -c '%a' "${cfg}" 2>/dev/null || echo 644)"
    local other_bit="${perm: -1}"
    if (( (other_bit & 4) == 0 )); then
      echo "⚠️  config.json content is valid, but the file is not world-readable"
      echo "   (mode ${perm}) -- Nginx cannot serve it to the browser, which shows"
      echo "   as 'Invalid configuration: no default server specified' too."
      chmod 644 "${cfg}"
      echo "✅ Fixed permissions: chmod 644 ${cfg}"
    fi
    return 0
  fi

  echo "⚠️  config.json is missing (or has invalid) default_server_config --"
  echo "   this alone makes Element show 'Invalid configuration: no default"
  echo "   server specified', regardless of whatever setting you're changing."
  load_config 2>/dev/null || true

  # Step 1: is the file valid JSON at all? If so, a simple merge fixes it
  # while preserving every other existing setting.
  if jq empty "${cfg}" >/dev/null 2>&1; then
    if [[ -n "${HS_DOMAIN:-}" ]]; then
      echo "   Repairing (merge) using saved domain: ${HS_DOMAIN}"
      local tmp; tmp="$(mktemp)"
      if jq --arg u "https://${HS_DOMAIN}" --arg s "${HS_DOMAIN}" \
          '.default_server_config."m.homeserver".base_url = $u |
           .default_server_config."m.homeserver".server_name = $s' \
          "${cfg}" > "${tmp}" 2>/dev/null && [[ -s "${tmp}" ]]; then
        mv "${tmp}" "${cfg}"
        chmod 644 "${cfg}"
        echo "   ✅ Repaired (existing settings preserved)."
        return 0
      fi
      rm -f "${tmp}"
    fi
  else
    echo "   config.json is not even valid JSON (syntax error) -- a simple"
    echo "   merge can't fix that. Looking for a good backup instead..."
  fi

  # Step 2: config.json itself is unusable (invalid JSON, or no HS_DOMAIN
  # to merge with) -- look for the newest backup that IS good.
  local bak
  for bak in $(ls -t "${cfg}".bak.* 2>/dev/null); do
    if jq -e '.default_server_config."m.homeserver".base_url' "${bak}" >/dev/null 2>&1; then
      cp -a "${cfg}" "${cfg}.broken.$(date +%Y%m%d%H%M%S)" 2>/dev/null || true
      cp -a "${bak}" "${cfg}"
      chmod 644 "${cfg}"
      echo "   ✅ Restored from backup: $(basename "${bak}")"
      echo "      (broken copy kept alongside as config.json.broken.<timestamp>)"
      return 0
    fi
  done

  # Step 3: last resort -- rebuild a fresh minimal config.json.
  if [[ -n "${HS_DOMAIN:-}" ]]; then
    echo "   No usable backup found either. Rebuilding a minimal config.json"
    echo "   from scratch using saved domain: ${HS_DOMAIN}"
    cp -a "${cfg}" "${cfg}.broken.$(date +%Y%m%d%H%M%S)" 2>/dev/null || true
    cat > "${cfg}" <<EOF
{
  "default_server_config": {
    "m.homeserver": {
      "base_url": "https://${HS_DOMAIN}",
      "server_name": "${HS_DOMAIN}"
    }
  },
  "disable_custom_urls": false,
  "disable_guests": true,
  "brand": "Element",
  "settingDefaults": {
    "features": {
      "feature_e2ee": false
    }
  }
}
EOF
    chmod 644 "${cfg}"
    echo "   ✅ Rebuilt. ⚠️  Any custom Jitsi/Screen-share/Integration-manager"
    echo "      settings were lost and need to be re-applied from their menus."
    return 0
  fi

  echo "❌ Could not repair config.json: it isn't valid JSON, no good backup"
  echo "   exists, and HS_DOMAIN is unknown. Run option 25 (Health Check) or"
  echo "   reinstall (option 1) to recover."
  return 1
}

# Run jq on Element config.json with a timestamped backup.
# All "$@" are forwarded to jq (filter first, then --arg etc.)
# Includes a post-write sanity check: if the result is missing
# default_server_config (required by Element at startup), the backup
# is restored immediately so the UI never shows the dreaded
# "Invalid configuration: no default server specified" error.
element_jq() {
  local cfg="/var/www/element/config.json"
  if [[ ! -f "${cfg}" ]]; then
    echo "❌ ${cfg} not found. Is Element installed?"
    return 1
  fi
  ensure_pkg jq
  # Self-heal first: if a PRIOR change already dropped default_server_config,
  # every element_jq call from here on would keep failing its own sanity
  # check below (silently or with a hard-to-notice message), and Element
  # would show "Invalid configuration: no default server specified" no
  # matter what setting is being touched right now. Repair it before
  # applying the requested filter, not just after.
  _ensure_element_default_server || true
  local bak="${cfg}.bak.$(date +%Y%m%d%H%M%S)"
  cp -a "${cfg}" "${bak}"
  snap_backup "Update Element config.json" "${cfg}" >/dev/null 2>&1 || true
  local tmp; tmp="$(mktemp)"
  if jq "$@" "${cfg}" > "${tmp}"; then
    # Sanity check: result must still contain default_server_config,
    # otherwise Element will show "Invalid configuration: no default
    # server specified" on next page load.
    if ! jq -e '.default_server_config."m.homeserver".base_url' "${tmp}" >/dev/null 2>&1; then
      rm -f "${tmp}"
      cp -a "${bak}" "${cfg}"
      echo "❌ jq filter produced a config.json without default_server_config."
      echo "   Backup restored. Element config is unchanged."
      return 1
    fi
    mv "${tmp}" "${cfg}"
    chmod 644 "${cfg}"
    return 0
  fi
  rm -f "${tmp}"
  echo "❌ jq failed to update ${cfg}."
  return 1
}

#############################################
# YAML Configuration Management Layer (yq-based)
# All Synapse configuration changes MUST go through these functions.
# Direct editing of homeserver.yaml is FORBIDDEN outside this layer.
#############################################

HOMESERVER_YAML="/etc/matrix-synapse/homeserver.yaml"
YQ_BIN=""

# Ensure yq (mikefarah/yq v4+) is available. Installs it if missing.
_ensure_yq() {
  if [[ -n "${YQ_BIN}" ]] && [[ -x "${YQ_BIN}" ]]; then
    return 0
  fi
  if command -v yq >/dev/null 2>&1; then
    YQ_BIN="$(command -v yq)"
    # Verify it's mikefarah/yq v4+ (not the Python yaml wrapper)
    if "${YQ_BIN}" --version 2>/dev/null | grep -qi 'mikefarah'; then
      return 0
    fi
    # If it's the python 'yq', we still try to use it with different syntax
    if "${YQ_BIN}" --version 2>/dev/null | grep -qi 'python'; then
      YQ_BIN=""
    fi
  fi
  # Install mikefarah/yq
  echo "📦 Installing yq (YAML processor)..."
  local yq_version="v4.44.3"
  local arch
  arch="$(dpkg --print-architecture 2>/dev/null || uname -m)"
  case "${arch}" in
    amd64|x86_64)  arch="amd64" ;;
    arm64|aarch64) arch="arm64" ;;
    *)
      echo "❌ Unsupported architecture for yq: ${arch}"
      echo "   Install yq manually: https://github.com/mikefarah/yq"
      return 1
      ;;
  esac
  wget -qO /usr/local/bin/yq "https://github.com/mikefarah/yq/releases/download/${yq_version}/yq_linux_${arch}" || {
    echo "❌ Failed to download yq."
    return 1
  }
  chmod +x /usr/local/bin/yq
  YQ_BIN="/usr/local/bin/yq"
  echo "✅ yq installed: $(${YQ_BIN} --version 2>/dev/null | head -1)"
  return 0
}

# Get a value from homeserver.yaml.
# Usage: val="$(yaml_get "rc_message.per_second")"
# Returns empty string if key does not exist.
yaml_get() {
  local key="$1"
  _ensure_yq || return 1
  local result
  if ! result="$("${YQ_BIN}" e ".${key}" "${HOMESERVER_YAML}")"; then
    echo "❌ yq failed to read key ${key} from ${HOMESERVER_YAML}" >&2
    return 1
  fi
  # yq prints "null" for missing keys
  if [[ "${result}" == "null" || -z "${result}" ]]; then
    return 1
  fi
  echo "${result}"
}

# Set a value in homeserver.yaml. Creates intermediate keys as needed.
# For string values, wrap in quotes: yaml_set "email.smtp_host" '"smtp.example.com"'
# For numbers/booleans, pass raw:   yaml_set "rc_message.per_second" "0.2"
# Usage: yaml_set "rc_message.per_second" "0.2"
yaml_set() {
  local key="$1" value="$2"
  _ensure_yq || return 1
  if ! "${YQ_BIN}" e ".${key} = ${value}" -i "${HOMESERVER_YAML}"; then
    echo "❌ Failed to set YAML key ${key} in ${HOMESERVER_YAML}" >&2
    return 1
  fi
}

# Set a string value (auto-quotes the value).
# Usage: yaml_set_str "email.smtp_host" "smtp.example.com"
yaml_set_str() {
  local key="$1" value="$2"
  _ensure_yq || return 1
  # NOTE: `--arg` is a jq flag and does not exist in mikefarah/yq v4 (which
  # is what YQ_BIN points to) -- it fails with "Error: unknown flag: --arg"
  # and aborts the whole install. The correct way to safely inject an
  # arbitrary string value in mikefarah/yq v4 is via an environment
  # variable read back with strenv(), which avoids both shell-quoting and
  # YAML-injection problems.
  if ! YQ_SET_STR_VALUE="${value}" "${YQ_BIN}" e ".${key} = strenv(YQ_SET_STR_VALUE)" -i "${HOMESERVER_YAML}"; then
    echo "❌ Failed to set YAML string key ${key} in ${HOMESERVER_YAML}" >&2
    return 1
  fi
}

# Delete a key (and all its children) from homeserver.yaml.
# Usage: yaml_delete "retention"
yaml_delete() {
  local key="$1"
  _ensure_yq || return 1
  if ! "${YQ_BIN}" e "del(.${key})" -i "${HOMESERVER_YAML}"; then
    echo "❌ Failed to delete YAML key ${key} from ${HOMESERVER_YAML}" >&2
    return 1
  fi
}

# Check if a key exists and is not null.
# Usage: if yaml_exists "rc_message"; then ...
yaml_exists() {
  local key="$1"
  _ensure_yq || return 1
  local result
  if ! result="$("${YQ_BIN}" e ".${key}" "${HOMESERVER_YAML}")"; then
    echo "❌ yq failed to check key ${key} in ${HOMESERVER_YAML}" >&2
    return 1
  fi
  [[ "${result}" != "null" && -n "${result}" ]]
}

# Append a value to a YAML list.
# Usage: yaml_append "app_service_config_files" '"/path/to/registration.yaml"'
# For complex objects, pass valid yq expression for the value.
yaml_append() {
  local key="$1" value="$2"
  _ensure_yq || return 1
  if ! "${YQ_BIN}" e ".${key} += ${value}" -i "${HOMESERVER_YAML}"; then
    echo "❌ Failed to append YAML key ${key} in ${HOMESERVER_YAML}" >&2
    return 1
  fi
}

# Remove an item from a YAML list by value.
# Usage: yaml_list_remove "app_service_config_files" '"/path/to/registration.yaml"'
yaml_list_remove() {
  local key="$1" value="$2"
  _ensure_yq || return 1
  if ! "${YQ_BIN}" e ".${key} -= [${value}]" -i "${HOMESERVER_YAML}"; then
    echo "❌ Failed to remove YAML value from ${key} in ${HOMESERVER_YAML}" >&2
    return 1
  fi
}

# Create a timestamped backup of homeserver.yaml.
# Returns the backup file path.
# Usage: bak="$(yaml_backup)"
yaml_backup() {
  if [[ ! -f "${HOMESERVER_YAML}" ]]; then
    echo "❌ ${HOMESERVER_YAML} not found." >&2
    return 1
  fi
  local bak="${HOMESERVER_YAML}.bak.$(date +%Y%m%d%H%M%S)"
  cp -a "${HOMESERVER_YAML}" "${bak}"
  echo "${bak}"
}

# Restore homeserver.yaml from a backup.
# If no backup path is given, uses the most recent one.
# Usage: yaml_restore                    # auto-pick latest
#        yaml_restore "/path/to/bak"    # specific backup
yaml_restore() {
  local bak="${1:-}"
  if [[ -z "${bak}" ]]; then
    bak="$(ls -t "${HOMESERVER_YAML}.bak."* 2>/dev/null | head -1)"
  fi
  if [[ -z "${bak}" || ! -f "${bak}" ]]; then
    echo "❌ No backup found to restore." >&2
    return 1
  fi
  cp -a "${bak}" "${HOMESERVER_YAML}"
  echo "✅ Restored from: ${bak}"
}

#############################################
# Universal pre-change backup / undo system
#
# Every menu action that writes to a file on disk should call
# snap_backup() with a short description and the list of files it is
# about to touch, BEFORE making the change. This stores a timestamped
# copy of each file's pre-change content, and records an entry in the
# snapshot index. The "Restore Last Change" menu (undo_menu) lets the
# admin browse these snapshots and roll a specific change back,
# independent of the full server backup/restore feature.
#############################################

SNAP_BACKUP_ROOT="/var/backups/matrix-stack/snapshots"
SNAP_BACKUP_INDEX="/var/backups/matrix-stack/snapshots.index"

# Usage: snap_backup "Human readable description" /path/file1 [/path/file2 ...]
# Silently skips files that do not exist yet (nothing to preserve).
# Safe to call even if none of the files exist (no-op).
snap_backup() {
  local description="$1"; shift
  local files=("$@")
  [[ ${#files[@]} -eq 0 ]] && return 0

  local ts snap_dir f captured=0
  ts="$(date +%Y%m%d%H%M%S)-$$-${RANDOM}"
  snap_dir="${SNAP_BACKUP_ROOT}/${ts}"

  for f in "${files[@]}"; do
    [[ -z "${f}" ]] && continue
    if [[ -e "${f}" ]]; then
      mkdir -p "${snap_dir}$(dirname "${f}")" 2>/dev/null
      if cp -a "${f}" "${snap_dir}${f}" 2>/dev/null; then
        echo "${f}" >> "${snap_dir}/.manifest" 2>/dev/null
        captured=$((captured+1))
      fi
    fi
  done

  if [[ ${captured} -eq 0 ]]; then
    rm -rf "${snap_dir}" 2>/dev/null
    return 0
  fi

  mkdir -p "$(dirname "${SNAP_BACKUP_INDEX}")" 2>/dev/null
  local files_csv
  files_csv="$(IFS=,; echo "${files[*]}")"
  echo "${ts}|${description}|${files_csv}" >> "${SNAP_BACKUP_INDEX}"
  return 0
}

# Interactive menu: list recent snapshots and restore a chosen one.
undo_menu() {
  print_header
  echo "🕘 === Restore Last Change (Undo) ==="
  echo
  echo "This lists every change made through the menu that touched a file"
  echo "on this server. Pick one to restore its file(s) to how they were"
  echo "right before that specific change (independent of full server backups)."
  echo

  if [[ ! -f "${SNAP_BACKUP_INDEX}" ]]; then
    echo "No changes recorded yet."
    pause
    return
  fi

  mapfile -t entries < <(tac "${SNAP_BACKUP_INDEX}")
  if [[ ${#entries[@]} -eq 0 ]]; then
    echo "No changes recorded yet."
    pause
    return
  fi

  local shown=()
  local i=0
  echo "  #) Date/Time              | Change"
  echo "-------------------------------------------------------------"
  local entry ts desc human_ts
  for entry in "${entries[@]}"; do
    ts="$(cut -d'|' -f1 <<<"${entry}" | cut -d'-' -f1)"
    desc="$(cut -d'|' -f2 <<<"${entry}")"
    human_ts="$(date -d "${ts:0:4}-${ts:4:2}-${ts:6:2} ${ts:8:2}:${ts:10:2}:${ts:12:2}" '+%Y-%m-%d %H:%M:%S' 2>/dev/null || echo "${ts}")"
    printf "%3d) %-24s | %s\n" "$((i+1))" "${human_ts}" "${desc}"
    shown+=("${entry}")
    i=$((i+1))
  done
  echo
  echo "  0) Back"
  echo
  read -rp "Enter the number of the change to restore: " sel

  if [[ -z "${sel}" || "${sel}" == "0" ]]; then
    return
  fi
  if ! [[ "${sel}" =~ ^[0-9]+$ ]] || (( sel < 1 || sel > ${#shown[@]} )); then
    echo "❌ Invalid selection."
    pause
    return
  fi

  local chosen="${shown[$((sel-1))]}"
  local snap_id snap_dir files_csv
  snap_id="$(cut -d'|' -f1 <<<"${chosen}")"
  desc="$(cut -d'|' -f2 <<<"${chosen}")"
  files_csv="$(cut -d'|' -f3- <<<"${chosen}")"
  snap_dir="${SNAP_BACKUP_ROOT}/${snap_id}"

  if [[ ! -d "${snap_dir}" ]]; then
    echo "❌ Backup files for this change could not be found (may have been deleted)."
    pause
    return
  fi

  echo
  echo "This change (\"${desc}\") touched the following file(s):"
  local -a flist
  IFS=',' read -ra flist <<< "${files_csv}"
  local f
  for f in "${flist[@]}"; do
    echo "  - ${f}"
  done
  echo
  read -rp "⚠️  Restore these file(s) to their state before this change? (y/N): " conf
  if [[ "${conf,,}" != "y" ]]; then
    echo "Cancelled."
    pause
    return
  fi

  local restored=0
  # Safety net: snapshot the CURRENT (about-to-be-overwritten) state first,
  # so if this restore itself causes a problem, it can be undone too.
  snap_backup "Pre-undo safety snapshot (before restoring: ${desc})" "${flist[@]}" >/dev/null 2>&1 || true

  for f in "${flist[@]}"; do
    if [[ -f "${snap_dir}${f}" ]]; then
      mkdir -p "$(dirname "${f}")" 2>/dev/null
      cp -a "${snap_dir}${f}" "${f}"
      restored=$((restored+1))
      echo "✅ Restored: ${f}"
    else
      echo "⚠️  No backup copy found for ${f}."
    fi
  done

  if [[ ${restored} -gt 0 ]]; then
    echo
    echo "🔄 Restarting related services..."
    fix_synapse_perms 2>/dev/null || true

    local synapse_ok=1
    if systemctl list-unit-files matrix-synapse.service >/dev/null 2>&1; then
      if ! systemctl restart matrix-synapse 2>/dev/null; then
        synapse_ok=0
      else
        sleep 3
        if ! systemctl is-active --quiet matrix-synapse; then
          synapse_ok=0
        fi
      fi
    fi

    local nginx_ok=1
    if ! nginx -t >/dev/null 2>&1; then
      nginx_ok=0
    else
      systemctl reload nginx 2>/dev/null || nginx_ok=0
    fi

    log_audit "Undo applied: ${desc} (snapshot ${snap_id})"

    if [[ ${synapse_ok} -eq 1 && ${nginx_ok} -eq 1 ]]; then
      echo "✅ Restore completed successfully. Synapse and Nginx are both up."
    else
      echo
      echo "❌ Restore applied, but something did NOT come back up cleanly:"
      [[ ${synapse_ok} -eq 0 ]] && echo "   - matrix-synapse is NOT active after restart."
      [[ ${nginx_ok} -eq 0 ]]   && echo "   - Nginx config test/reload failed."
      if [[ ${synapse_ok} -eq 0 ]]; then
        echo
        echo "   Last 30 lines of the Synapse journal:"
        echo "   ────────────────────────────────────────────"
        journalctl -u matrix-synapse -n 30 --no-pager 2>/dev/null | sed 's/^/   /'
        echo "   ────────────────────────────────────────────"
      fi
      if [[ ${nginx_ok} -eq 0 ]]; then
        echo
        echo "   nginx -t output:"
        echo "   ────────────────────────────────────────────"
        nginx -t 2>&1 | sed 's/^/   /'
        echo "   ────────────────────────────────────────────"
      fi
      echo
      echo "   A safety snapshot of the state right before this restore was"
      echo "   just saved. Run this menu again and pick the entry timestamped"
      echo "   just now (\"Pre-undo safety snapshot...\") to undo THIS restore"
      echo "   and go back to how things were a moment ago."
    fi
  else
    echo "❌ No files were restored."
  fi
  pause
}

# Validate YAML syntax of a file using yq.
_validate_yaml() {
  local file="$1"
  _ensure_yq || return 1
  "${YQ_BIN}" e '.' "${file}" >/dev/null 2>&1
}

# Ensure Synapse config directory and homeserver.yaml exist.
_ensure_homeserver_yaml() {
  if [[ ! -f "${HOMESERVER_YAML}" ]]; then
    echo "❌ ${HOMESERVER_YAML} not found. Is Synapse installed?" >&2
    return 1
  fi
  return 0
}

#############################################
# Safe Configuration Transaction
# Applies a config change with backup, validation, restart, and auto-rollback.
#
# Usage:
#   yaml_transaction "Enable message rate limiting" _apply_ratelimit
#
# The callback function should use yaml_set/yaml_delete to make changes.
# If validation or restart fails, the previous config is automatically restored.
#############################################

yaml_transaction() {
  local description="$1"
  local callback="$2"
  shift 2

  _ensure_homeserver_yaml || return 1

  # 1. Backup
  local backup_file
  backup_file="$(yaml_backup)" || {
    echo "❌ Failed to create backup. Aborting: ${description}"
    return 1
  }
  # Also record in the unified undo index so this shows up in the
  # "Restore Last Change" menu alongside every other config change.
  snap_backup "${description}" "${HOMESERVER_YAML}" >/dev/null 2>&1 || true

  # 2. Apply changes via callback
  if ! "${callback}" "$@"; then
    echo "❌ Callback failed for: ${description}"
    return 1
  fi

  # 3. Validate YAML syntax
  if ! _validate_yaml "${HOMESERVER_YAML}"; then
    echo "❌ YAML validation failed after: ${description}"
    echo "   Restoring backup..."
    yaml_restore "${backup_file}"
    return 1
  fi

  # 4. Fix permissions and restart Synapse
  fix_synapse_perms
  systemctl restart matrix-synapse
  sleep 2

  # 5. Verify Synapse started
  if systemctl is-active --quiet matrix-synapse; then
    echo "✅ ${description} applied successfully."
    return 0
  fi

  # 6. Rollback on failure
  echo "❌ Synapse failed to start after: ${description}"
  echo "   Restoring previous configuration..."
  yaml_restore "${backup_file}"
  fix_synapse_perms
  systemctl restart matrix-synapse
  sleep 2

  if systemctl is-active --quiet matrix-synapse; then
    echo "✅ Rolled back successfully. Your change was NOT applied."
    log_audit "Config change rolled back: ${description}"
  else
    echo "❌ Synapse still down after rollback. Inspect: journalctl -u matrix-synapse -n 50"
    log_audit "Config change AND rollback failed: ${description}"
  fi
  return 1
}

#############################################
# One-time migration: merge all conf.d YAML into homeserver.yaml
# This converts existing installations from the old conf.d architecture
# to the new centralized homeserver.yaml approach.
#############################################

_migrate_conf_d_to_homeserver() {
  local conf_d="/etc/matrix-synapse/conf.d"
  local marker="${HOMESERVER_YAML}.migrated_v3"

  # Skip if already migrated
  if [[ -f "${marker}" ]]; then
    return 0
  fi

  # Skip if no conf.d directory or no yaml files to migrate
  if [[ ! -d "${conf_d}" ]]; then
    touch "${marker}"
    return 0
  fi

  _ensure_yq || return 1
  _ensure_homeserver_yaml || return 1

  local yaml_files=()
  # Files to migrate (standard Synapse config - NOT workers, log configs, or appservices)
  local migrate_files=(
    "database.yaml"
    "registration.yaml"
    "turn.yaml"
    "media.yaml"
    "ldap.yaml"
    "ratelimit.yaml"
    "rc_message.yaml"
    "retention.yaml"
    "media_retention.yaml"
    "email.yaml"
    "captcha.yaml"
    "directory.yaml"
    "room_policy.yaml"
    "redis.yaml"
    "federation.yaml"
    "metrics.yaml"
  )

  local migrated=0
  local f
  for f in "${migrate_files[@]}"; do
    if [[ -f "${conf_d}/${f}" ]]; then
      echo "  📦 Migrating ${f} into homeserver.yaml..."
      # Merge: read the conf.d file and overlay its keys onto homeserver.yaml
      "${YQ_BIN}" ea 'select(fileIndex == 0) * select(fileIndex == 1)' \
        "${HOMESERVER_YAML}" "${conf_d}/${f}" > "${HOMESERVER_YAML}.tmp" 2>/dev/null && \
        mv "${HOMESERVER_YAML}.tmp" "${HOMESERVER_YAML}" && \
        rm -f "${conf_d}/${f}" && \
        migrated=$((migrated + 1))
    fi
  done

  # Handle room_policy_state.json — keep it in place (runtime state, not Synapse config)
  # Handle appservices.yaml — keep it in place (app_service_config_files managed separately)
  # Handle worker log configs — keep them (worker-specific, loaded via --config-path)
  # Handle worker YAML files in /etc/matrix-synapse/workers/ — keep them

  if [[ ${migrated} -gt 0 ]]; then
    echo "✅ Migrated ${migrated} configuration file(s) from conf.d/ into homeserver.yaml."
    log_audit "Migrated ${migrated} conf.d files into homeserver.yaml"
  fi

  touch "${marker}"
  return 0
}

# Call migration early (before any config operation).
# This is idempotent — safe to call multiple times.
_ensure_migrated() {
  _migrate_conf_d_to_homeserver
}


# After editing a conf.d file: fix perms, restart Synapse, and roll back the
# file if Synapse refuses to start (so a bad key never bricks the server).
# $1 = conf.d filename (relative, e.g. retention.yaml)
# DEPRECATED: Kept as a thin wrapper for backward compatibility.
# All new code should use yaml_transaction() instead.
# $1 = description string (was conf.d filename)
apply_conf_d_with_rollback() {
  echo "⚠️  apply_conf_d_with_rollback is deprecated. Use yaml_transaction instead."
  return 1
}

#############################################
# User & Room Search Directory
#############################################

configure_directory_search() {
  print_header
  echo "🔍 === User & Room Search Directory ==="
  echo
  echo "Controls whether users can search for other users and public rooms"
  echo "from within Element Web / Element Desktop."
  echo
  echo "  • User search  : lets users find each other in 'Start chat' dialog."
  echo "  • Room directory: lets users discover and browse public rooms."
  echo "  • Federation    : allow/discover rooms from other Matrix servers."
  echo
  echo "⚠️  If LDAP is configured, the LDAP module must be installed first."
  echo

  _ensure_migrated

  local cur="unknown"
  if yaml_exists "user_directory.search_all_users"; then
    local val
    val="$(yaml_get "user_directory.search_all_users" 2>/dev/null)"
    if [[ "${val}" == "true" ]]; then
      cur="ENABLED"
    else
      cur="DISABLED (user_directory.search_all_users is not true)"
    fi
  else
    cur="DISABLED (not configured)"
  fi
  echo "Current state: ${cur}"
  echo
  echo "1) Enable — user search + room directory + federation discovery"
  echo "2) Disable — remove all directory/search settings"
  echo "3) Back"
  read -rp "Choose [1-3]: " opt
  case "${opt}" in
    1|2) ;;
    3) return 0 ;;
    *) echo "Invalid option."; sleep 1; return 0 ;;
  esac

  echo

  # --- Enable LDAP module if needed ---
  if [[ "${opt}" == "1" ]]; then
    if [[ -x /opt/venvs/matrix-synapse/bin/python ]]; then
      if ! /opt/venvs/matrix-synapse/bin/python -c "import ldap3" >/dev/null 2>&1; then
        echo "📦 Installing matrix-synapse-ldap3 (required for user directory)..."
        /opt/venvs/matrix-synapse/bin/pip install matrix-synapse-ldap3
      fi
    fi
  fi

  if [[ "${opt}" == "1" ]]; then
    _apply_directory_enable() {
      yaml_set "user_directory.enabled" "true"
      yaml_set "user_directory.search_all_users" "true"
      yaml_set "enable_room_list_search" "true"
      yaml_set "allow_public_rooms_over_federation" "true"
      yaml_set "allow_public_rooms_without_auth" "true"
    }
    echo "🔄 Applying directory search settings (with auto-rollback if rejected)..."
    if yaml_transaction "Enable directory search" _apply_directory_enable; then
      echo
      echo "✅ Search directory ENABLED:"
      echo "   • Users can search for each other (Start Chat → search)"
      echo "   • Room directory is visible and browsable"
      echo "   • Federation room discovery is enabled"
      echo
      echo "ℹ️  Note: user search only finds users who have already logged in"
      echo "   at least once (Synapse indexes its own local user DB, it does"
      echo "   not query LDAP live). A user must sign in once before others"
      echo "   can find them by search."
      log_audit "Directory search enabled (users + rooms + federation)"
    fi
  else
    _apply_directory_disable() {
      yaml_delete "user_directory.enabled"
      yaml_delete "user_directory.search_all_users"
      yaml_delete "enable_room_list_search"
      yaml_delete "allow_public_rooms_over_federation"
      yaml_delete "allow_public_rooms_without_auth"
    }
    yaml_transaction "Disable directory search" _apply_directory_disable
    echo "✅ Search directory DISABLED."
    log_audit "Directory search disabled"
  fi

  pause
}

#############################################
# Room creation policy (allow / block)
#############################################

# Installs the small third-party-rules module into Synapse's venv so the
# homeserver can import it. Returns 0 on success.
write_room_policy_module() {
  local sp
  sp="$(synapse_site_packages)"
  if [[ -z "${sp}" ]]; then
    echo "⚠️  Synapse venv not found at /opt/venvs/matrix-synapse. Aborting."
    return 1
  fi

  snap_backup "Update room creation policy module" "${sp}/room_policy.py" "/etc/matrix-synapse/room_policy_state.json"
  cat > "${sp}/room_policy.py" <<'PYEOF'
# Managed by Matrix Stack Manager - do not edit manually.
# Legacy third-party-event-rules module: reads allow/deny state from a JSON
# file at runtime, so toggling does not require editing YAML.
#
# Enforces three independent policies:
#   1) "allow"              -- gate room *creation* (m.room.create) globally.
#   2) "block_encryption"   -- unconditionally reject any m.room.encryption
#      state event, in ANY room (new or existing), regardless of who sends
#      it or what power level they hold. This is what makes "Enable room
#      encryption" impossible for a room admin to turn on: even a user with
#      power level 100 (or higher) has their m.room.encryption event
#      rejected here, at the server, before it is ever accepted.
#   3) "restrict_public_rooms" + "public_room_creators" -- when enabled,
#      only the listed full user IDs (and server admins) are permitted to
#      create a PUBLIC room (visibility: "public" or preset: "public_chat").
#      Private/invite-only room creation is NOT affected by this policy --
#      it is governed independently by "allow" above.
import json

STATE_FILE = "/etc/matrix-synapse/room_policy_state.json"

try:
    from synapse.api.errors import Codes, SynapseError
except Exception:  # pragma: no cover - Synapse always provides this
    SynapseError = None
    Codes = None


class RoomPolicy:
    def __init__(self, config):
        config = config or {}
        self._default_allow = bool(config.get("allow", True))
        self._default_block_encryption = bool(config.get("block_encryption", False))

    @staticmethod
    def parse_config(config):
        return config or {}

    def _state(self):
        try:
            with open(STATE_FILE) as f:
                return json.load(f)
        except Exception:
            return {}

    def _allow_create_now(self):
        return bool(self._state().get("allow", self._default_allow))

    def _encryption_blocked_now(self):
        return bool(self._state().get("block_encryption", self._default_block_encryption))

    def check_event_allowed(self, event, state_events):
        etype = getattr(event, "type", None)

        if etype == "m.room.create" and not self._allow_create_now():
            return False

        if etype == "m.room.encryption" and self._encryption_blocked_now():
            return False

        return True

    # Called by Synapse when processing a room-creation request, BEFORE the
    # room is created. `config` here is the client's JSON request body
    # (visibility, preset, name, ...), not this module's own config.
    # Raising SynapseError blocks the request with that error returned to
    # the client. Returning normally allows it through.
    def on_create_room(self, requester, config, is_requester_admin):
        if is_requester_admin:
            return

        state = self._state()
        if not bool(state.get("restrict_public_rooms", False)):
            return

        config = config or {}
        visibility = config.get("visibility", "private")
        preset = config.get("preset", "")
        is_public = visibility == "public" or preset == "public_chat"
        if not is_public:
            return

        allowed = state.get("public_room_creators") or []
        try:
            user_id = requester.user.to_string()
        except Exception:
            user_id = None

        if user_id is not None and user_id in allowed:
            return

        if SynapseError is not None:
            raise SynapseError(
                403,
                "You are not permitted to create PUBLIC rooms on this "
                "server. Contact your administrator.",
                Codes.FORBIDDEN,
            )
        # Fallback if the import above ever fails: deny by raising a
        # generic exception (Synapse treats any raised exception from this
        # callback as a rejection of the request).
        raise Exception("Public room creation is restricted on this server.")
PYEOF

  if ! /opt/venvs/matrix-synapse/bin/python -c "import room_policy" 2>/dev/null; then
    echo "❌ Module failed to import. Aborting (nothing changed in Synapse)."
    rm -f "${sp}/room_policy.py"
    return 1
  fi
  return 0
}

# Safely update a single boolean key in room_policy_state.json without
# clobbering other keys already set there by a different feature (room
# creation policy vs. E2EE policy share this same state file).
# Usage: _room_policy_set_state "allow" "true"
_room_policy_set_state() {
  local key="$1" value="$2"
  local state_file="/etc/matrix-synapse/room_policy_state.json"
  ensure_pkg jq
  mkdir -p "$(dirname "${state_file}")"
  local cur="{}"
  if [[ -f "${state_file}" ]] && jq empty "${state_file}" >/dev/null 2>&1; then
    cur="$(cat "${state_file}")"
  fi
  local tmp
  tmp="$(mktemp)"
  if echo "${cur}" | jq --arg k "${key}" --argjson v "${value}" '.[$k] = $v' > "${tmp}" 2>/dev/null && [[ -s "${tmp}" ]]; then
    snap_backup "Update room policy state (${key}=${value})" "${state_file}"
    mv "${tmp}" "${state_file}"
  else
    rm -f "${tmp}"
    echo "❌ Failed to update room_policy_state.json" >&2
    return 1
  fi
}

manage_room_creation() {
  print_header
  echo "🚪 === Room Creation Policy ==="
  echo
  echo "Controls whether users can create new rooms from Element."
  echo
  echo "  • ALLOW : everyone can create rooms (default Matrix behavior)."
  echo "  • BLOCK : no rooms can be created via clients. Existing rooms"
  echo "            keep working. Temporarily switch to ALLOW to create a"
  echo "            room, then switch back."
  echo

  local state_file="/etc/matrix-synapse/room_policy_state.json"
  local cur="ALLOW (default)"
  if [[ -f "${state_file}" ]]; then
    if grep -q '"allow": false' "${state_file}" 2>/dev/null; then
      cur="BLOCK"
    fi
  fi
  echo "Current state: ${cur}"
  echo
  echo "1) Allow room creation"
  echo "2) Block room creation"
  echo "3) Back"
  read -rp "Choose [1-3]: " opt
  case "${opt}" in
    1|2) ;;
    3) return 0 ;;
    *) echo "Invalid option."; sleep 1; return 0 ;;
  esac

  local allow="true"
  [[ "${opt}" == "2" ]] && allow="false"

  echo
  echo "🧩 Installing/updating the room-policy module..."
  if ! write_room_policy_module; then
    pause; return 1
  fi

  # Update the state file (runtime state, kept separately). Use the merge
  # helper so this doesn't wipe out an unrelated "block_encryption" flag
  # that the E2EE menu may have set in the same file.
  if ! _room_policy_set_state "allow" "${allow}"; then
    pause; return 1
  fi

  _apply_room_policy() {
    yaml_set 'third_party_event_rules.module' '"room_policy.RoomPolicy"'
    yaml_set "third_party_event_rules.config.allow" "${allow}"
  }
  echo "🔄 Restarting Synapse (with auto-rollback if unsupported)..."
  if yaml_transaction "Room creation policy (allow=${allow})" _apply_room_policy; then
    [[ "${allow}" == "true" ]] && echo "✅ Room creation is now ALLOWED." || echo "✅ Room creation is now BLOCKED."
    log_audit "Room creation policy set to ${allow}"
  else
    echo "⚠️  Your Synapse version may not support third_party_event_rules."
  fi
  pause
}

#############################################
# Public Room Creation Permission (whitelist)
#############################################

# Read the current restrict_public_rooms + public_room_creators state and
# print a human-readable summary. Sets the globals CUR_RESTRICT and
# CUR_CREATORS (space-joined) for the caller to use.
_read_public_room_acl_state() {
  CUR_RESTRICT="false"
  CUR_CREATORS=""
  local state_file="/etc/matrix-synapse/room_policy_state.json"
  if [[ -f "${state_file}" ]]; then
    ensure_pkg jq
    CUR_RESTRICT="$(jq -r '.restrict_public_rooms // false' "${state_file}" 2>/dev/null || echo false)"
    CUR_CREATORS="$(jq -r '(.public_room_creators // []) | join(", ")' "${state_file}" 2>/dev/null || true)"
  fi
}

manage_public_room_creators() {
  load_config || true
  print_header
  echo "🏛️  === Public Room Creation Permission ==="
  echo
  echo "Controls WHO is allowed to create PUBLIC rooms (visibility: public /"
  echo "preset: public_chat). This is independent from the general 'Room"
  echo "Creation Policy' menu (allow/block ALL room creation)."
  echo
  echo "  • PRIVATE rooms: anyone permitted to create rooms at all can still"
  echo "    create them (governed by 'Room Creation Policy')."
  echo "  • PUBLIC rooms : when this restriction is ON, only the users listed"
  echo "    below (plus server admins) may create a public room. Everyone"
  echo "    else gets a clear 'not permitted' error from the server."
  echo
  echo "Enforced server-side (Synapse on_create_room hook) -- not just hidden"
  echo "in the UI, so it cannot be bypassed via a different client or the API."
  echo

  _read_public_room_acl_state
  local state_label="DISABLED (everyone can create public rooms)"
  [[ "${CUR_RESTRICT}" == "true" ]] && state_label="ENABLED (restricted to whitelist below)"
  echo "── Current state ─────────────────────────────"
  printf "  %-22s %s\n" "Restriction:" "${state_label}"
  printf "  %-22s %s\n" "Allowed users:" "${CUR_CREATORS:-(none)}"
  echo "───────────────────────────────────────────────"
  echo
  echo "1) ✅ Enable restriction (only whitelisted users can create public rooms)"
  echo "2) ⛔ Disable restriction (everyone can create public rooms)"
  echo "3) ➕ Add user to whitelist"
  echo "4) ➖ Remove user from whitelist"
  echo "5) 📋 Show current whitelist"
  echo "6) 🔙 Back"
  read -rp "Choose [1-6]: " opt

  case "${opt}" in
    1|2)
      local restrict="true"
      [[ "${opt}" == "2" ]] && restrict="false"
      echo
      echo "🧩 Installing/updating the room-policy module..."
      if ! write_room_policy_module; then
        pause; return 1
      fi
      _room_policy_set_state "restrict_public_rooms" "${restrict}" || { pause; return 1; }

      _apply_public_room_acl() {
        yaml_set 'third_party_event_rules.module' '"room_policy.RoomPolicy"'
        yaml_set 'third_party_event_rules.config.restrict_public_rooms' "${restrict}"
      }
      echo "🔄 Restarting Synapse (with auto-rollback if unsupported)..."
      if yaml_transaction "Public room creation restriction (restrict=${restrict})" _apply_public_room_acl; then
        if [[ "${restrict}" == "true" ]]; then
          echo "✅ Only whitelisted users (and admins) can now create PUBLIC rooms."
        else
          echo "✅ Public room creation restriction DISABLED — everyone can create public rooms again."
        fi
        log_audit "Public room creation restriction set to ${restrict}"
      else
        echo "⚠️  Your Synapse version may not support third_party_event_rules / on_create_room."
      fi
      ;;
    3)
      echo
      read -rp "Enter username (localpart, e.g. 'alice', or full ID '@alice:${HS_DOMAIN:-domain}'): " uinput
      [[ -z "${uinput}" ]] && { echo "No input given."; pause; return 0; }
      local full_id="${uinput}"
      if [[ "${uinput}" != @*:* ]]; then
        if [[ -z "${HS_DOMAIN:-}" ]]; then
          echo "❌ Could not determine server domain. Enter the full user ID (@user:domain)."
          pause; return 0
        fi
        full_id="@${uinput}:${HS_DOMAIN}"
      fi
      ensure_pkg jq
      local state_file="/etc/matrix-synapse/room_policy_state.json"
      local cur="[]"
      [[ -f "${state_file}" ]] && cur="$(jq -c '.public_room_creators // []' "${state_file}" 2>/dev/null || echo '[]')"
      local new_list
      new_list="$(echo "${cur}" | jq -c --arg u "${full_id}" '. as $l | if any($l[]; . == $u) then $l else $l + [$u] end')"
      if _room_policy_set_state "public_room_creators" "${new_list}"; then
        # Keep Synapse's in-process config aligned too (best-effort; the
        # module always re-reads STATE_FILE at call time regardless).
        yaml_set 'third_party_event_rules.config.public_room_creators' "${new_list}" 2>/dev/null || true
        echo "✅ ${full_id} added to the public-room-creators whitelist."
        log_audit "Added ${full_id} to public room creators whitelist"
      fi
      ;;
    4)
      echo
      _read_public_room_acl_state
      if [[ -z "${CUR_CREATORS}" ]]; then
        echo "Whitelist is currently empty."
        pause; return 0
      fi
      echo "Current whitelist: ${CUR_CREATORS}"
      read -rp "Enter the exact user ID to remove (@user:domain): " full_id
      [[ -z "${full_id}" ]] && { echo "No input given."; pause; return 0; }
      ensure_pkg jq
      local state_file="/etc/matrix-synapse/room_policy_state.json"
      local cur="[]"
      [[ -f "${state_file}" ]] && cur="$(jq -c '.public_room_creators // []' "${state_file}" 2>/dev/null || echo '[]')"
      local new_list
      new_list="$(echo "${cur}" | jq -c --arg u "${full_id}" '[.[] | select(. != $u)]')"
      if _room_policy_set_state "public_room_creators" "${new_list}"; then
        yaml_set 'third_party_event_rules.config.public_room_creators' "${new_list}" 2>/dev/null || true
        echo "✅ ${full_id} removed from the whitelist (if it was present)."
        log_audit "Removed ${full_id} from public room creators whitelist"
      fi
      ;;
    5)
      _read_public_room_acl_state
      echo
      echo "Whitelisted users: ${CUR_CREATORS:-(none)}"
      ;;
    6) return 0 ;;
    *) echo "Invalid option." ;;
  esac
  pause
}

#############################################
# Auto-join room (single-sign-on style "default group")
#############################################

manage_auto_join_room() {
  _ensure_migrated
  print_header
  echo "🚪➡️  === Auto-Join Room ==="
  echo
  echo "When a user's account is first created on this server (their FIRST"
  echo "successful login/registration -- including the first LDAP login,"
  echo "which auto-provisions the local account), Synapse automatically"
  echo "joins them to the room(s) listed below."
  echo
  echo "⚠️  Important: this fires ONCE, at account creation time only -- NOT"
  echo "   on every subsequent login. Existing users who already have an"
  echo "   account here will NOT be retroactively joined; use Ketesa (Admin"
  echo "   Panel) or the admin API to add them to the room manually if"
  echo "   needed."
  echo "   The target room must already exist (created by an admin). This"
  echo "   menu will NOT auto-create a room for you."
  echo

  local cur_list
  cur_list="$(yaml_get 'auto_join_rooms' 2>/dev/null || true)"
  echo "── Current auto-join rooms ───────────────────"
  if [[ -n "${cur_list}" && "${cur_list}" != "[]" ]]; then
    echo "${cur_list}"
  else
    echo "  (none configured)"
  fi
  echo "───────────────────────────────────────────────"
  echo
  echo "1) ➕ Add a room (by room ID, e.g. !abcdefgh:domain)"
  echo "2) ➖ Remove a room"
  echo "3) 📋 Show current list"
  echo "4) ⛔ Clear all auto-join rooms"
  echo "5) 🔙 Back"
  read -rp "Choose [1-5]: " opt

  case "${opt}" in
    1)
      echo
      echo "ℹ️  Use the internal room ID (starts with '!'), NOT a room alias."
      echo "   You can find it in Element: Room Settings → Advanced →"
      echo "   'Internal room ID', or via Ketesa (Admin Panel → Rooms)."
      read -rp "Room ID (e.g. !abcd1234:${HS_DOMAIN:-domain}): " room_id
      if [[ -z "${room_id}" || "${room_id}" != !* ]]; then
        echo "❌ That doesn't look like a room ID (must start with '!')."
        pause; return 0
      fi
      _apply_auto_join_add() {
        yaml_exists 'auto_join_rooms' || yaml_set 'auto_join_rooms' '[]'
        yaml_append 'auto_join_rooms' "\"${room_id}\""
        # The room already exists -- do NOT let Synapse try to create it
        # under this alias if it can't find it; that would silently make a
        # brand-new empty room instead of joining the intended one.
        yaml_set 'autocreate_auto_join_rooms' 'false'
      }
      if yaml_transaction "Add auto-join room (${room_id})" _apply_auto_join_add; then
        echo "✅ New accounts will now be auto-joined to ${room_id}."
        log_audit "Added auto-join room ${room_id}"
      fi
      ;;
    2)
      echo
      read -rp "Room ID to remove (!abcd1234:domain): " room_id
      [[ -z "${room_id}" ]] && { echo "No input given."; pause; return 0; }
      _apply_auto_join_remove() {
        yaml_list_remove 'auto_join_rooms' "\"${room_id}\""
      }
      if yaml_transaction "Remove auto-join room (${room_id})" _apply_auto_join_remove; then
        echo "✅ ${room_id} removed from the auto-join list."
        log_audit "Removed auto-join room ${room_id}"
      fi
      ;;
    3)
      echo
      echo "Current auto-join rooms:"
      yaml_get 'auto_join_rooms' 2>/dev/null || echo "  (none configured)"
      ;;
    4)
      read -rp "Clear the ENTIRE auto-join list? (yes/no): " confirm
      if [[ "${confirm}" == "yes" ]]; then
        _apply_auto_join_clear() {
          yaml_set 'auto_join_rooms' '[]'
        }
        if yaml_transaction "Clear auto-join room list" _apply_auto_join_clear; then
          echo "✅ Auto-join list cleared."
          log_audit "Cleared auto-join room list"
        fi
      else
        echo "Cancelled."
      fi
      ;;
    5) return 0 ;;
    *) echo "Invalid option." ;;
  esac
  pause
}

#############################################
# Presence (Online / Away / Offline)
#############################################

manage_presence() {
  load_config || true
  _ensure_migrated
  print_header
  echo "🟢 === Presence (Online / Away / Offline) ==="
  echo
  echo "Controls whether Synapse tracks and shares user presence state"
  echo "(online / away / offline, and 'last active' timestamps) with"
  echo "clients and (if federation is on) with other servers."
  echo
  echo "Disabling presence:"
  echo "  ✅ Reduces server load slightly (fewer EDUs to process/broadcast)"
  echo "  ✅ Hides online/away indicators and 'last seen' in Element"
  echo "  ✅ Prevents leaking when staff are active, useful for privacy"
  echo "  ❌ Users can no longer see who is currently online"
  echo

  local cur="unknown"
  if yaml_exists 'presence.enabled'; then
    local val
    val="$(yaml_get 'presence.enabled' 2>/dev/null)"
    case "${val}" in
      true)  cur="ENABLED" ;;
      false) cur="DISABLED" ;;
      untracked) cur="UNTRACKED (ignores client/federation updates)" ;;
      *) cur="${val}" ;;
    esac
  else
    cur="ENABLED (default)"
  fi
  echo "Current state: ${cur}"
  echo
  echo "1) Enable presence (default Matrix behavior)"
  echo "2) Disable presence completely"
  echo "3) Back"
  read -rp "Choose [1-3]: " opt

  local enabled=""
  case "${opt}" in
    1) enabled="true" ;;
    2) enabled="false" ;;
    3) return 0 ;;
    *) echo "Invalid option."; pause; return 0 ;;
  esac

  _apply_presence() {
    yaml_set 'presence.enabled' "${enabled}"
  }
  echo "🔄 Restarting Synapse (with auto-rollback if unsupported)..."
  if yaml_transaction "Presence tracking (enabled=${enabled})" _apply_presence; then
    echo "✅ Presence tracking is now: $([[ ${enabled} == true ]] && echo ENABLED || echo DISABLED)"
    log_audit "Presence tracking set to ${enabled}"

    # Best-effort: also tell Element Web to hide the presence UI for THIS
    # homeserver when presence is disabled server-side, so users don't see
    # a permanently-offline indicator for everyone.
    if [[ -f /var/www/element/config.json ]] && [[ -n "${HS_DOMAIN:-}" ]]; then
      ensure_pkg jq
      if [[ "${enabled}" == "false" ]]; then
        element_jq --arg hs "https://${HS_DOMAIN}" \
          '.enable_presence_by_hs_url[$hs] = false' \
          && echo "   • Element Web presence UI hidden for this homeserver."
      else
        element_jq --arg hs "https://${HS_DOMAIN}" \
          'del(.enable_presence_by_hs_url[$hs])' \
          && echo "   • Element Web presence UI restored to default."
      fi
    fi
  else
    echo "⚠️  Could not update presence settings."
  fi
  pause
}

#############################################
# Typing notifications & Read receipts
# (Element Web client-level DEFAULTS. Synapse has no server-side switch to
# suppress these EDUs; this sets the initial value in config.json. Because
# these are ACCOUNT-level settings in Element, a user can still override
# them for themselves in Settings → Preferences unless your organization's
# policy relies on users simply not doing so.)
#############################################

manage_typing_notifications() {
  print_header
  echo "⌨️  === Typing Notifications (Element Web default) ==="
  echo
  echo "Sets the DEFAULT for whether Element Web sends/shows typing"
  echo "indicators ('X is typing...'). This is a client-side default only:"
  echo "Synapse itself has no server-side switch for typing EDUs, and users"
  echo "can still change this for themselves in Settings → Preferences."
  echo

  local cur_send="unknown" cur_show="unknown"
  if [[ -f /var/www/element/config.json ]]; then
    cur_send="$(jq -r '.settingDefaults.sendTypingNotifications // "not set (default: on)"' /var/www/element/config.json 2>/dev/null)"
    cur_show="$(jq -r '.settingDefaults.showTypingNotifications // "not set (default: on)"' /var/www/element/config.json 2>/dev/null)"
  fi
  echo "── Current defaults ──────────────────────────"
  printf "  %-22s %s\n" "Send typing:" "${cur_send}"
  printf "  %-22s %s\n" "Show typing:" "${cur_show}"
  echo "───────────────────────────────────────────────"
  echo
  echo "1) Enable typing notifications (send + show) — default"
  echo "2) Disable typing notifications (send + show)"
  echo "3) Back"
  read -rp "Choose [1-3]: " opt

  local val=""
  case "${opt}" in
    1) val="true" ;;
    2) val="false" ;;
    3) return 0 ;;
    *) echo "Invalid option."; pause; return 0 ;;
  esac

  if element_jq --argjson v "${val}" \
    '.settingDefaults.sendTypingNotifications = $v | .settingDefaults.showTypingNotifications = $v'; then
    echo "✅ Typing notifications default set to: $([[ ${val} == true ]] && echo ENABLED || echo DISABLED)"
    echo "   Hard-refresh Element Web (Ctrl+Shift+R) to see the new default."
    log_audit "Element typing notifications default set to ${val}"
  else
    echo "❌ Failed to update Element config.json."
  fi
  pause
}

manage_read_receipts() {
  print_header
  echo "👁️  === Read Receipts (Element Web default) ==="
  echo
  echo "Sets the DEFAULT for whether Element Web sends read receipts (the"
  echo "small avatar/checkmark showing you've read up to a message). This"
  echo "is a client-side default only: users can still change it for"
  echo "themselves in Settings → Preferences → 'Send read receipts'."
  echo

  local cur="unknown"
  if [[ -f /var/www/element/config.json ]]; then
    cur="$(jq -r '.settingDefaults.sendReadReceipts // "not set (default: on)"' /var/www/element/config.json 2>/dev/null)"
  fi
  echo "Current default: ${cur}"
  echo
  echo "1) Enable read receipts — default"
  echo "2) Disable read receipts"
  echo "3) Back"
  read -rp "Choose [1-3]: " opt

  local val=""
  case "${opt}" in
    1) val="true" ;;
    2) val="false" ;;
    3) return 0 ;;
    *) echo "Invalid option."; pause; return 0 ;;
  esac

  if element_jq --argjson v "${val}" '.settingDefaults.sendReadReceipts = $v'; then
    echo "✅ Read receipts default set to: $([[ ${val} == true ]] && echo ENABLED || echo DISABLED)"
    echo "   Hard-refresh Element Web (Ctrl+Shift+R) to see the new default."
    log_audit "Element read receipts default set to ${val}"
  else
    echo "❌ Failed to update Element config.json."
  fi
  pause
}

#############################################
# Profile editing permission (display name / avatar)
#############################################

manage_profile_editing() {
  _ensure_migrated
  print_header
  echo "🪪 === Profile Editing Permission ==="
  echo
  echo "Controls whether regular users are allowed to change their OWN"
  echo "display name and/or avatar after it was first set (e.g. by LDAP"
  echo "sync or at account creation). Enforced server-side by Synapse --"
  echo "server admins are never affected by this restriction."
  echo
  echo "Useful when display names should stay in sync with your directory"
  echo "(e.g. LDAP/Active Directory 'cn' / 'displayName') and should not be"
  echo "freely editable by end users."
  echo

  local cur_name="true" cur_avatar="true"
  yaml_exists 'enable_set_displayname' && cur_name="$(yaml_get 'enable_set_displayname' 2>/dev/null || echo true)"
  yaml_exists 'enable_set_avatar_url' && cur_avatar="$(yaml_get 'enable_set_avatar_url' 2>/dev/null || echo true)"
  echo "── Current state ─────────────────────────────"
  printf "  %-28s %s\n" "Users can change display name:" "${cur_name}"
  printf "  %-28s %s\n" "Users can change avatar:"        "${cur_avatar}"
  echo "───────────────────────────────────────────────"
  echo
  echo "1) ✅ Allow users to edit BOTH display name and avatar (default)"
  echo "2) ⛔ Block users from editing BOTH display name and avatar"
  echo "3) ⚙️  Custom (choose each independently)"
  echo "4) 🔙 Back"
  read -rp "Choose [1-4]: " opt

  local set_name="" set_avatar=""
  case "${opt}" in
    1) set_name="true"; set_avatar="true" ;;
    2) set_name="false"; set_avatar="false" ;;
    3)
      read -rp "Allow display name changes? (y/n): " a
      [[ "${a}" =~ ^[Yy]$ ]] && set_name="true" || set_name="false"
      read -rp "Allow avatar changes? (y/n): " b
      [[ "${b}" =~ ^[Yy]$ ]] && set_avatar="true" || set_avatar="false"
      ;;
    4) return 0 ;;
    *) echo "Invalid option."; pause; return 0 ;;
  esac

  _apply_profile_edit_policy() {
    yaml_set 'enable_set_displayname' "${set_name}"
    yaml_set 'enable_set_avatar_url' "${set_avatar}"
  }
  echo "🔄 Restarting Synapse (with auto-rollback if unsupported)..."
  if yaml_transaction "Profile editing permission (displayname=${set_name}, avatar=${set_avatar})" _apply_profile_edit_policy; then
    echo "✅ Display name editing: $([[ ${set_name} == true ]] && echo ALLOWED || echo BLOCKED) (server admins unaffected)"
    echo "✅ Avatar editing:       $([[ ${set_avatar} == true ]] && echo ALLOWED || echo BLOCKED) (server admins unaffected)"
    log_audit "Profile editing policy set (displayname=${set_name}, avatar=${set_avatar})"
  else
    echo "⚠️  Could not update profile editing policy."
  fi
  pause
}

#############################################
# Rooms, Presence & Privacy menu
#############################################

rooms_presence_privacy_menu() {
  while true; do
    print_header
    echo "👥 === Rooms, Presence & Privacy ==="
    echo "1) 🏛️  Public Room Creation Permission (whitelist)"
    echo "2) 🚪➡️  Auto-Join Room (default group for new accounts)"
    echo "3) 🟢 Presence (Online / Away / Offline)"
    echo "4) ⌨️  Typing Notifications (Element default)"
    echo "5) 👁️  Read Receipts (Element default)"
    echo "6) 🪪 Profile Editing Permission (display name / avatar)"
    echo "7) 🔙 Back"
    read -rp "Choose [1-7]: " opt
    case "${opt}" in
      1) manage_public_room_creators  || true ;;
      2) manage_auto_join_room  || true ;;
      3) manage_presence  || true ;;
      4) manage_typing_notifications  || true ;;
      5) manage_read_receipts  || true ;;
      6) manage_profile_editing  || true ;;
      7) return 0 ;;
      *) echo "Invalid option."; sleep 1 ;;
    esac
  done
}

#############################################
# Screen sharing (Element Web)
#############################################

configure_screenshare() {
  print_header
  echo "🖥️  === Screen Sharing (Element Web) ==="
  echo
  _ensure_element_default_server || true
  echo "Screen sharing in Element goes through the call backend:"
  echo "  • Multi-person calls & screen share → Jitsi  (see 'Jitsi Integration')"
  echo "  • Native Matrix group calls          → Element Call (see 'Element Call')"
  echo
  echo "This toggle enables/disables Element Web's experimental group-call"
  echo "(screen-share) feature flag. Clients must hard-refresh (Ctrl+Shift+R)."
  echo

  local cur="default"
  if [[ -f /var/www/element/config.json ]]; then
    cur="$(jq -r '.features.feature_video_rooms // "default"' /var/www/element/config.json 2>/dev/null)" || true
  fi
  echo "Current feature_video_rooms: ${cur}"
  echo
  echo "1) Enable screen share / group calls"
  echo "2) Disable"
  echo "3) Back"
  read -rp "Choose [1-3]: " opt

  case "${opt}" in
    1)
      element_jq '.features.feature_video_rooms = "enable"' \
        && echo "✅ Enabled. Hard-refresh Element Web (Ctrl+Shift+R)." \
        && log_audit "Element screen-share feature enabled"
      ;;
    2)
      element_jq '.features.feature_video_rooms = "disable"' \
        && echo "✅ Disabled. Hard-refresh Element Web (Ctrl+Shift+R)." \
        && log_audit "Element screen-share feature disabled"
      ;;
    3) return 0 ;;
    *) echo "Invalid option."; sleep 1 ;;
  esac
  pause
}

#############################################
# Element Call integration
#############################################

configure_element_call() {
  print_header
  echo "📞 === Element Call Integration ==="
  echo
  _ensure_element_default_server || true
  echo "Element Call is the native group-call application for Matrix."
  echo "Point Element Web at a public or self-hosted Element Call instance."
  echo

  local cur="not set"
  if [[ -f /var/www/element/config.json ]]; then
    cur="$(jq -r '.element_call_url // "not set"' /var/www/element/config.json 2>/dev/null)" || true
  fi
  echo "Current element_call_url: ${cur}"
  echo
  echo "1) Enable / set Element Call URL"
  echo "2) Disable Element Call"
  echo "3) Back"
  read -rp "Choose [1-3]: " opt

  case "${opt}" in
    1)
      read -rp "Element Call URL [https://call.element.io]: " url
      url="${url:-https://call.element.io}"
      element_jq --arg u "${url}" '.element_call_url = $u' \
        && echo "✅ Element Call set to: ${url}" \
        && echo "   Hard-refresh Element Web (Ctrl+Shift+R)." \
        && log_audit "Element Call URL set to ${url}"
      ;;
    2)
      element_jq 'del(.element_call_url)' \
        && echo "✅ Element Call disabled." \
        && log_audit "Element Call disabled"
      ;;
    3) return 0 ;;
    *) echo "Invalid option."; sleep 1 ;;
  esac
  pause
}

#############################################
# Jitsi integration
#############################################

configure_jitsi() {
  print_header
  echo "🔗 === Jitsi Video Conference Integration ==="
  echo
  _ensure_element_default_server || true
  echo "Element uses Jitsi for multi-person calls (audio, video, screen share)."
  echo "Use the public 'meet.jit.si' or your own self-hosted Jitsi domain."
  echo
  echo "⚠️  IMPORTANT — how Jitsi actually gets used in Element:"
  echo "   • 1-on-1 (DM) calls do NOT use Jitsi at all -- they use plain"
  echo "     WebRTC + your TURN server (see option 20, Call Diagnostics)."
  echo "     If a DM call button does nothing, that's a TURN problem, not Jitsi."
  echo "   • Jitsi is only used for GROUP calls: click the video/voice icon"
  echo "     in a room with 3+ members, or add it manually via room"
  echo "     Settings → Widgets → Add widget → Jitsi Conference."
  echo "   • The Jitsi domain must be reachable by the CLIENT'S BROWSER, not"
  echo "     by this server. If your users' machines have no route to the"
  echo "     public internet, 'meet.jit.si' will silently do nothing when"
  echo "     clicked (blank tile, no error) -- you need a domain reachable"
  echo "     from inside your network (your own self-hosted Jitsi Meet, or"
  echo "     any Jitsi instance your clients can actually reach)."
  echo

  local cur="not set"
  if [[ -f /var/www/element/config.json ]]; then
    cur="$(jq -r '.jitsi.preferredDomain // "not set"' /var/www/element/config.json 2>/dev/null)" || true
  fi
  echo "Current Jitsi domain: ${cur}"
  echo
  echo "1) Set / change Jitsi domain"
  echo "2) Disable Jitsi (remove config)"
  echo "3) Test if a Jitsi domain is reachable from THIS server"
  echo "4) Back"
  read -rp "Choose [1-4]: " opt

  case "${opt}" in
    1)
      read -rp "Jitsi domain [meet.jit.si]: " domain
      domain="${domain:-meet.jit.si}"
      element_jq --arg d "${domain}" \
        '.jitsi = {"preferredDomain":$d,"desktopSharingFrameRate":{"min":5,"max":30}}' \
        && echo "✅ Jitsi set to: ${domain}" \
        && echo "   Hard-refresh Element Web (Ctrl+Shift+R) on the CLIENT." \
        && echo "   Then test: open a room with 3+ members and click the call icon" \
        && echo "   (or Settings → Widgets → Add widget → Jitsi Conference)." \
        && log_audit "Jitsi domain set to ${domain}"
      ;;
    2)
      element_jq 'del(.jitsi)' \
        && echo "✅ Jitsi disabled." \
        && log_audit "Jitsi integration removed"
      ;;
    3)
      read -rp "Domain to test [${cur}]: " test_domain
      test_domain="${test_domain:-${cur}}"
      if [[ -z "${test_domain}" || "${test_domain}" == "not set" ]]; then
        echo "❌ No domain given."
      else
        echo "🔎 Checking https://${test_domain} from THIS server..."
        if curl -sS -o /dev/null -w "   HTTP %{http_code}\n" --max-time 8 "https://${test_domain}"; then
          echo "✅ Reachable from the server."
          echo "   ⚠️  This does NOT guarantee your users' browsers can reach it"
          echo "   too -- test the same URL from a normal user's machine/browser"
          echo "   on your internal network to be sure."
        else
          echo "❌ Not reachable from this server either (timeout/DNS/connection"
          echo "   error). If this is meant to be an internal Jitsi instance,"
          echo "   double-check DNS and that it's actually running."
        fi
      fi
      ;;
    4) return 0 ;;
    *) echo "Invalid option."; sleep 1 ;;
  esac
  pause
}

#############################################
# Integration/Extension Manager (widgets, bridges & bots picker)
#############################################
# Element's "Add widgets, bridges & bots" screen inside room settings loads
# an external "integration manager" app in an iframe. If config.json does
# NOT set integrations_ui_url/integrations_rest_url explicitly, Element
# falls back to its own COMPILED-IN default: the public
# https://scalar.vector.im -- which requires the CLIENT'S browser to reach
# the public internet. On an intranet-only / air-gapped deployment, this is
# exactly why clicking it "brings up nothing": the iframe is trying (and
# silently failing) to load a public URL nobody can reach, with no error
# shown to the user.
configure_integration_manager() {
  print_header
  echo "🧩 === Integration/Extension Manager (Widgets, Bridges & Bots) ==="
  echo
  echo "This is the picker Element shows under room Settings → Widgets →"
  echo "'Add widgets, bridges & bots'. It loads an external app (an"
  echo "'integration manager') in an iframe."
  echo
  echo "⚠️  If config.json doesn't set this explicitly, Element silently"
  echo "   falls back to the PUBLIC https://scalar.vector.im -- which needs"
  echo "   internet access from the user's browser. On an internal-only"
  echo "   network, clicking it just shows a blank panel with no error."
  echo "   This is almost certainly why it 'brings up nothing' for you."
  echo

  local cur_ui cur_rest
  cur_ui="not set (defaults to public scalar.vector.im)"
  cur_rest="not set (defaults to public scalar.vector.im)"
  if [[ -f /var/www/element/config.json ]]; then
    local v
    v="$(jq -r '.integrations_ui_url // "unset"' /var/www/element/config.json 2>/dev/null)" || true
    [[ "${v}" != "unset" ]] && cur_ui="${v}"
    v="$(jq -r '.integrations_rest_url // "unset"' /var/www/element/config.json 2>/dev/null)" || true
    [[ "${v}" != "unset" ]] && cur_rest="${v}"
  fi
  echo "Current integrations_ui_url:   ${cur_ui}"
  echo "Current integrations_rest_url: ${cur_rest}"
  echo
  echo "1) 🚫 Disable it cleanly (recommended for a closed/internal org --"
  echo "      no self-hosted alternative is set up)"
  echo "2) 🌍 Use the public scalar.vector.im (only works if your USERS'"
  echo "      browsers have internet access)"
  echo "3) 🏠 Use a self-hosted integration manager (e.g. Dimension --"
  echo "      https://github.com/turt2live/matrix-dimension -- if you"
  echo "      already run one on your network)"
  echo "4) Back"
  read -rp "Choose [1-4]: " opt

  case "${opt}" in
    1)
      element_jq '.integrations_ui_url = null | .integrations_rest_url = null | .integrations_widgets_urls = []' \
        && echo "✅ Integration manager disabled." \
        && echo "   'Add widgets, bridges & bots' will now show a clear" \
        && echo "   'not configured' message instead of a blank panel." \
        && echo "   Hard-refresh Element Web (Ctrl+Shift+R)." \
        && log_audit "Element integration manager disabled"
      ;;
    2)
      element_jq \
        '.integrations_ui_url = "https://scalar.vector.im/" |
         .integrations_rest_url = "https://scalar.vector.im/api" |
         .integrations_widgets_urls = ["https://scalar.vector.im/_matrix/integrations/v1","https://scalar.vector.im/api"]' \
        && echo "✅ Set to public scalar.vector.im." \
        && echo "   ⚠️  Only works if end-user browsers can reach the public" \
        && echo "   internet -- not just this server." \
        && echo "   Hard-refresh Element Web (Ctrl+Shift+R)." \
        && log_audit "Element integration manager set to public scalar.vector.im"
      ;;
    3)
      read -rp "Integration manager base URL (e.g. https://dimension.${BASE_DOMAIN:-example.local}): " base
      if [[ -z "${base}" ]]; then
        echo "❌ URL cannot be empty."
      else
        base="${base%/}"
        element_jq --arg ui "${base}/riot" --arg rest "${base}/api/v1/scalar" \
          '.integrations_ui_url = $ui | .integrations_rest_url = $rest | .integrations_widgets_urls = [$rest]' \
          && echo "✅ Set to self-hosted integration manager: ${base}" \
          && echo "   (assumed Dimension's default UI/API paths -- adjust with" \
          && echo "   option 34, Show Editable Config Paths, if yours differ)" \
          && echo "   Hard-refresh Element Web (Ctrl+Shift+R)." \
          && log_audit "Element integration manager set to ${base}"
      fi
      ;;
    4) return 0 ;;
    *) echo "Invalid option."; sleep 1 ;;
  esac
  pause
}

#############################################
# Show installed versions (Synapse + Element)
#############################################

show_versions() {
  print_header
  echo "🏷️  === Installed Versions ==="
  echo

  local syn_ver el_ver
  syn_ver="$(dpkg-query -W -f='${Version}' matrix-synapse-py3 2>/dev/null || echo 'not installed')"
  el_ver="unknown"
  [[ -f /var/www/element/version ]] && el_ver="$(cat /var/www/element/version 2>/dev/null)"

  echo "Matrix Synapse (server): ${syn_ver}"
  echo "Element Web:             ${el_ver}"
  echo

  if command -v curl >/dev/null 2>&1; then
    ensure_pkg jq
    echo "Checking latest Element release on GitHub..."
    local latest
    latest="$(curl -fsS https://api.github.com/repos/element-hq/element-web/releases/latest 2>/dev/null \
      | jq -r '.tag_name // empty' 2>/dev/null)"
    latest="${latest#v}"
    if [[ -n "${latest}" ]]; then
      echo "Element latest on GitHub: ${latest}"
      if [[ "${el_ver}" != "unknown" && "${el_ver}" != "${latest}" ]]; then
        echo "🔔 An Element update is available."
      fi
    else
      echo "(could not reach GitHub API)"
    fi
  fi

  echo
  echo "💡 Use the 'Updates' menu to upgrade either component."
  pause
}

#############################################
# Message rate limiting (rc_message) with guidance
#############################################

manage_message_ratelimit() {
  print_header
  echo "⚡ === Message Rate Limiting (rc_message) ==="
  echo
  echo "Limits how fast a single user can send messages. Two knobs:"
  echo
  echo "   per_second  : sustained messages/second allowed per user"
  echo "   burst_count : max messages allowed in a sudden burst"
  echo
  echo "How it behaves:"
  echo "   • A user may send up to 'burst_count' messages instantly."
  echo "   • Then the bucket refills at 'per_second' messages/second."
  echo "   • Once empty, further messages are rejected with M_LIMIT_EXCEEDED"
  echo "     and the client retries after a short delay."
  echo
  echo "Presets:"
  echo "   Strict   : 0.1 / 5     — strong anti-spam (test carefully!)"
  echo "   Moderate : 0.2 / 10    — balanced (close to Synapse defaults)"
  echo "   Lax      : 5   / 50    — nearly unrestricted"
  echo

  _ensure_migrated

  local cur_per="-" cur_burst="-"
  if yaml_exists "rc_message"; then
    cur_per="$(yaml_get "rc_message.per_second" 2>/dev/null)" || cur_per="-"
    cur_burst="$(yaml_get "rc_message.burst_count" 2>/dev/null)" || cur_burst="-"
  fi
  echo "Current: per_second=${cur_per}, burst_count=${cur_burst}"
  echo
  echo "1) Strict   (0.1 / 5)"
  echo "2) Moderate (0.2 / 10)"
  echo "3) Lax      (5 / 50)"
  echo "4) Custom values"
  echo "5) Back"
  read -rp "Choose [1-5]: " opt

  local per burst
  case "${opt}" in
    1) per="0.1";  burst="5"  ;;
    2) per="0.2";  burst="10" ;;
    3) per="5";    burst="50" ;;
    4)
      read -rp "per_second (e.g. 0.2): " per
      read -rp "burst_count (e.g. 10): " burst
      ;;
    5) return 0 ;;
    *) echo "Invalid option."; sleep 1; return 0 ;;
  esac

  if [[ -z "${per}" || -z "${burst}" ]] \
     || ! [[ "${per}" =~ ^[0-9]+(\.[0-9]+)?$ ]] \
     || ! [[ "${burst}" =~ ^[0-9]+$ ]]; then
    echo "❌ Invalid values. per_second must be a number, burst_count an integer."
    pause; return 1
  fi

  _apply_rc_message() {
    yaml_set "rc_message.per_second" "${per}"
    yaml_set "rc_message.burst_count" "${burst}"
  }
  echo "🔄 Restarting Synapse (with auto-rollback if rejected)..."
  if yaml_transaction "Message rate limit (per_second=${per}, burst_count=${burst})" _apply_rc_message; then
    log_audit "rc_message set to per_second=${per} burst_count=${burst}"
  fi
  pause
}

#############################################
# Change SSL certificate
#############################################

# Install a user-supplied OFFICIAL certificate (PEM) over the current one,
# taking nginx out of self-signed mode. Performs full validation: PEM parsing,
# key/cert modulus match, and domain (CN/SAN) match against HS_DOMAIN.
#   $1 = path to cert/fullchain PEM (leaf [+ intermediate chain])
#   $2 = path to private key PEM
#   $3 = optional path to CA/intermediate chain PEM (merged into fullchain)
# Returns 0 on success.
install_official_cert() {
  local cert_file="$1" key_file="$2" chain_file="${3:-}"
  local cert_dir="/etc/letsencrypt/live/${HS_DOMAIN}"

  # --- 1) Existence checks ---------------------------------------------------
  if [[ ! -f "${cert_file}" ]]; then
    echo "❌ Certificate file not found: ${cert_file}"
    return 1
  fi
  if [[ ! -f "${key_file}" ]]; then
    echo "❌ Private key file not found: ${key_file}"
    return 1
  fi
  if [[ -n "${chain_file}" && ! -f "${chain_file}" ]]; then
    echo "❌ Chain file not found: ${chain_file}"
    return 1
  fi

  # --- 2) PEM validity checks ------------------------------------------------
  if ! openssl x509 -in "${cert_file}" -noout >/dev/null 2>&1; then
    echo "❌ Not a valid certificate PEM: ${cert_file}"
    echo "   (expected a file starting with '-----BEGIN CERTIFICATE-----')"
    return 1
  fi
  # Key may be RSA or EC; try RSA then EC.
  if openssl rsa -in "${key_file}" -noout >/dev/null 2>&1; then
    :
  elif openssl ec -in "${key_file}" -noout >/dev/null 2>&1; then
    :
  else
    echo "❌ Not a valid RSA/EC private key PEM: ${key_file}"
    return 1
  fi

  # --- 3) Key/cert modulus match --------------------------------------------
  local cert_mod key_mod
  cert_mod="$(openssl x509 -noout -modulus -in "${cert_file}" 2>/dev/null | openssl md5)"
  if openssl rsa -in "${key_file}" -noout >/dev/null 2>&1; then
    key_mod="$(openssl rsa  -noout -modulus -in "${key_file}" 2>/dev/null | openssl md5)"
  else
    key_mod="$(openssl ec   -noout -modulus -in "${key_file}" 2>/dev/null | openssl md5 || true)"
    cert_mod="$(openssl x509 -noout -pubkey  -in "${cert_file}" 2>/dev/null | openssl md5)"
    key_mod="$(openssl pkey -noout -pubout   -in "${key_file}" 2>/dev/null | openssl md5)"
  fi
  if [[ -z "${cert_mod}" || -z "${key_mod}" || "${cert_mod}" != "${key_mod}" ]]; then
    echo "❌ The private key does NOT match the certificate."
    echo "   cert md5: ${cert_mod:-<unreadable>}"
    echo "   key  md5: ${key_mod:-<unreadable>}"
    echo "   Make sure you supplied the key that generated this certificate."
    return 1
  fi

  # --- 4) Domain (CN/SAN) match ---------------------------------------------
  local san_match="no"
  if openssl x509 -in "${cert_file}" -noout -text 2>/dev/null \
       | grep -A1 'Subject Alternative Name' \
       | grep -qiE "DNS:${HS_DOMAIN//./\\.}( |,|$)"; then
    san_match="yes"
  fi
  if [[ "${san_match}" != "yes" ]]; then
    echo "⚠️  WARNING: '${HS_DOMAIN}' was NOT found in the certificate's"
    echo "   Subject Alternative Name (SAN). Browsers/clients will reject it."
    read -rp "Continue anyway? (y/n): " force
    [[ "${force}" == "y" || "${force}" == "Y" ]] || { echo "Cancelled."; return 1; }
  fi

  # --- 5) Show what we parsed (sanity preview) ------------------------------
  echo
  echo "── Certificate summary ──────────────────────────────"
  openssl x509 -in "${cert_file}" -noout -subject -issuer -dates 2>/dev/null
  echo "─────────────────────────────────────────────────────"
  echo

  # --- 6) Build the fullchain (leaf + optional chain) -----------------------
  local tmp_chain; tmp_chain="$(mktemp)"
  cp -f "${cert_file}" "${tmp_chain}"
  if [[ -n "${chain_file}" ]]; then
    # Append the intermediate(s), skipping any BEGIN/END markers already present.
    echo "" >> "${tmp_chain}"
    cat "${chain_file}" >> "${tmp_chain}"
  fi

  # --- 7) Backup the current cert directory, then install -------------------
  if [[ -d "${cert_dir}" ]]; then
    local bak="${cert_dir}.bak.$(date +%Y%m%d%H%M%S)"
    cp -a "${cert_dir}" "${bak}"
    echo "🗂️  Previous certificate backed up to: ${bak}"
  else
    mkdir -p "${cert_dir}"
  fi

  cp -f "${tmp_chain}" "${cert_dir}/fullchain.pem"
  cp -f "${key_file}"  "${cert_dir}/privkey.pem"
  # chain.pem = everything after the leaf (for coturn / clients that want it)
  if openssl x509 -in "${cert_file}" -noout >/dev/null 2>&1; then
    # Extract chain portion if a separate chain was given; otherwise reuse fullchain.
    if [[ -n "${chain_file}" ]]; then
      cp -f "${chain_file}" "${cert_dir}/chain.pem"
    else
      cp -f "${cert_file}" "${cert_dir}/chain.pem"
    fi
  fi
  rm -f "${tmp_chain}"

  chmod 600 "${cert_dir}/privkey.pem"
  chmod 644 "${cert_dir}/fullchain.pem" "${cert_dir}/chain.pem"

  # --- 8) Test nginx with the new cert BEFORE reloading ---------------------
  if ! nginx -t >/dev/null 2>&1; then
    echo "❌ nginx rejected the new certificate:"
    nginx -t || true
    echo "⚠️  The new cert was written but NOT applied. Fix the files and retry,"
    echo "   or restore the backup in ${cert_dir}.bak.*"
    return 1
  fi

  # --- 9) Apply: reload nginx, restart coturn (it uses the same files) ------
  systemctl reload nginx || true
  if [[ -f /etc/turnserver.conf ]]; then
    systemctl restart coturn || true
  fi

  # --- 10) Record the new SSL mode ------------------------------------------
  SSL_MODE="custom"
  save_config "${HS_DOMAIN}" "${ELEMENT_DOMAIN}" "${BASE_DOMAIN}" "${PUBLIC_IP}" \
    "${LE_EMAIL}" "${PG_DB}" "${PG_USER}" "${PG_PASS}" "${PG_HOST}" "${PG_PORT}" "${SSL_MODE}"

  echo "✅ Official certificate installed and nginx/coturn reloaded."
  echo "   SSL mode is now: ${SSL_MODE} (no longer self-signed)."
  log_audit "Official/custom certificate installed for ${HS_DOMAIN}"
  return 0
}

#############################################
# Message retention policy (auto-delete old messages)
#############################################

manage_retention() {
  print_header
  echo "🗑️  === Message Retention Policy (auto-delete old messages) ==="
  echo
  echo "Synapse can purge messages older than a maximum age."
  echo
  echo "Notes:"
  echo "  • Applies server-wide as a default policy. Individual rooms may"
  echo "    set their own retention that overrides this."
  echo "  • Purging runs in the background; large rooms take time."
  echo "  • Enter 0 to DISABLE retention (keep messages forever)."
  echo

  _ensure_migrated

  local cur="disabled"
  if yaml_exists "retention" && yaml_exists "retention.enabled"; then
    local enabled_val
    enabled_val="$(yaml_get "retention.enabled" 2>/dev/null)"
    if [[ "${enabled_val}" == "true" ]]; then
      cur="$(yaml_get "retention.default_policy.max_lifetime" 2>/dev/null)" || cur="enabled (unknown lifetime)"
    fi
  fi
  echo "Current max_lifetime: ${cur}"
  echo
  read -rp "Maximum message age in DAYS (0 = disable): " days
  if ! [[ "${days}" =~ ^[0-9]+$ ]]; then
    echo "❌ Enter a non-negative integer."
    pause; return 1
  fi

  if [[ "${days}" == "0" ]]; then
    _apply_retention_disable() {
      yaml_delete "retention"
    }
    yaml_transaction "Disable message retention" _apply_retention_disable
    echo "✅ Retention disabled (messages kept forever)."
    log_audit "Message retention disabled"
  else
    _apply_retention_enable() {
      yaml_set "retention.enabled" "true"
      yaml_set_str "retention.default_policy.max_lifetime" "${days}d"
    }
    echo "🔄 Restarting Synapse (with auto-rollback if rejected)..."
    if yaml_transaction "Message retention (${days}d)" _apply_retention_enable; then
      echo "✅ Messages older than ${days} days will be purged automatically."
      log_audit "Message retention set to ${days}d"
    fi
  fi
  pause
}

#############################################
# Automatic media deletion (media_retention)
#############################################

manage_media_retention() {
  print_header
  echo "🧹 === Automatic Media Deletion (media_retention) ==="
  echo
  echo "Synapse can delete stored media older than a lifetime:"
  echo "  • local_media_lifetime  : media uploaded by YOUR users"
  echo "  • remote_media_lifetime : media fetched from federated servers"
  echo
  echo "Requires Synapse 1.78 or newer. Enter 0 to disable a rule."
  echo

  _ensure_migrated

  local cur_l="-" cur_r="-"
  if yaml_exists "media_retention"; then
    cur_l="$(yaml_get "media_retention.local_media_lifetime" 2>/dev/null)" || cur_l="-"
    cur_r="$(yaml_get "media_retention.remote_media_lifetime" 2>/dev/null)" || cur_r="-"
  fi
  echo "Current: local=${cur_l}, remote=${cur_r}"
  echo
  read -rp "Local media lifetime in DAYS  [0 = keep]: " local_days
  read -rp "Remote media lifetime in DAYS [0 = keep]: " remote_days
  if ! [[ "${local_days}" =~ ^[0-9]+$ && "${remote_days}" =~ ^[0-9]+$ ]]; then
    echo "❌ Enter non-negative integers."
    pause; return 1
  fi

  if [[ "${local_days}" == "0" && "${remote_days}" == "0" ]]; then
    _apply_media_retention_disable() {
      yaml_delete "media_retention"
    }
    yaml_transaction "Disable media retention" _apply_media_retention_disable
    echo "✅ Media auto-deletion disabled."
    log_audit "Media retention disabled"
  else
    _apply_media_retention_enable() {
      yaml_set_str "media_retention.local_media_lifetime" "${local_days}d"
      yaml_set_str "media_retention.remote_media_lifetime" "${remote_days}d"
    }
    echo "🔄 Restarting Synapse (with auto-rollback if rejected)..."
    if yaml_transaction "Media retention (local=${local_days}d, remote=${remote_days}d)" _apply_media_retention_enable; then
      echo "✅ Media retention set: local=${local_days}d, remote=${remote_days}d"
      log_audit "Media retention set local=${local_days}d remote=${remote_days}d"
    fi
  fi
  pause
}

#############################################
# Email / SMTP server (notifications)
#############################################

configure_email() {
  print_header
  echo "📧 === Email / SMTP Server (notifications) ==="
  echo
  echo "Used for email verification, password-reset and notification mails."
  echo "Common ports: 587 (STARTTLS) or 465 (implicit TLS)."
  echo

  _ensure_migrated

  local cur_host="not set"
  if yaml_exists "email.smtp_host"; then
    cur_host="$(yaml_get "email.smtp_host" 2>/dev/null)" || cur_host="not set"
  fi
  echo "Current SMTP host: ${cur_host}"
  echo
  echo "1) Configure / update SMTP"
  echo "2) Disable email notifications"
  echo "3) Back"
  read -rp "Choose [1-3]: " opt

  case "${opt}" in
    1)
      read -rp "SMTP host (e.g. smtp.example.com): " smtp_host
      read -rp "SMTP port [587]: " smtp_port
      smtp_port="${smtp_port:-587}"
      read -rp "SMTP username: " smtp_user
      read -rsp "SMTP password: " smtp_pass; echo
      if ! load_config; then
        read -rp "notif_from (e.g. Matrix <noreply@example.com>): " notif_from
      else
        read -rp "notif_from [Matrix <noreply@${HS_DOMAIN}>]: " notif_from
        notif_from="${notif_from:-Matrix <noreply@${HS_DOMAIN}>}"
      fi
      read -rp "App name shown in mails [Matrix]: " app_name
      app_name="${app_name:-Matrix}"

      if [[ -z "${smtp_host}" || -z "${smtp_user}" || -z "${notif_from}" ]]; then
        echo "❌ Host, username and notif_from are required."
        pause; return 1
      fi

      local force_tls="false"
      [[ "${smtp_port}" == "465" ]] && force_tls="true"

      _apply_email() {
        yaml_set "email.enable_notifs" "true"
        yaml_set_str "email.smtp_host" "${smtp_host}"
        yaml_set "email.smtp_port" "${smtp_port}"
        yaml_set_str "email.smtp_user" "${smtp_user}"
        yaml_set_str "email.smtp_pass" "${smtp_pass}"
        yaml_set "email.force_tls" "${force_tls}"
        yaml_set "email.require_transport_security" "true"
        yaml_set_str "email.notif_from" "${notif_from}"
        yaml_set_str "email.app_name" "${app_name}"
        if load_config 2>/dev/null; then
          yaml_set_str "email.client_base_url" "https://${ELEMENT_DOMAIN}"
        fi
      }
      echo "🔄 Restarting Synapse (with auto-rollback if rejected)..."
      if yaml_transaction "SMTP configured: ${smtp_host}:${smtp_port}" _apply_email; then
        echo "✅ SMTP configured: ${smtp_host}:${smtp_port} (force_tls=${force_tls})"
        log_audit "SMTP configured: ${smtp_host}:${smtp_port} (force_tls=${force_tls})"
      fi
      ;;
    2)
      _apply_email_disable() {
        yaml_delete "email"
      }
      yaml_transaction "Disable email notifications" _apply_email_disable
      echo "✅ Email notifications disabled."
      log_audit "SMTP/email notifications disabled"
      ;;
    3) return 0 ;;
    *) echo "Invalid option."; sleep 1 ;;
  esac
  pause
}

#############################################
# Media Repository → NAS migration
#############################################

# Read the currently-configured media_store_path, falling back to Synapse's
# default of <data_dir>/media_store (=/var/lib/matrix-synapse/media_store).
get_current_media_path() {
  _ensure_migrated
  local p
  p="$(yaml_get "media_store_path" 2>/dev/null)" || true
  if [[ -n "${p}" && "${p}" != "null" ]]; then
    echo "${p}"
    return 0
  fi
  echo "/var/lib/matrix-synapse/media_store"
}

manage_media_repository() {
  print_header
  echo "📁 === Media Repository → NAS Migration ==="
  echo

  if ! load_config; then
    echo "⚠️  Config not found. Run Install first."
    pause; return 1
  fi

  _ensure_migrated

  local cur_path
  cur_path="$(get_current_media_path)"
  echo "Current media store path: ${cur_path}"
  if [[ -d "${cur_path}" ]]; then
    local size
    size="$(du -sh "${cur_path}" 2>/dev/null | awk '{print $1}')"
    echo "Current size:            ${size:-unknown}"
  fi
  echo
  echo "Move Synapse's media store to network storage (NAS)?"
  echo "This will MOUNT the share, STOP Synapse, COPY existing media,"
  echo "and point Synapse at the new location."
  echo
  echo "1) CIFS/SMB share (Windows NAS, SMB NAS — most common)"
  echo "2) NFS share (Linux NAS)"
  echo "3) Just set the media_store_path (share already mounted by you)"
  echo "4) Back"
  read -rp "Choose [1-4]: " opt

  local mount_type="" share="" mountpoint="/mnt/matrix-nas" nas_user="" nas_pass=""
  case "${opt}" in
    1) mount_type="cifs" ;;
    2) mount_type="nfs"  ;;
    3) mount_type="path" ;;
    4) return 0 ;;
    *) echo "Invalid option."; sleep 1; return 0 ;;
  esac

  # Collect connection details
  if [[ "${mount_type}" == "cifs" ]]; then
    read -rp "SMB share (e.g. //nas.local/matrix or \\\\nas\\matrix): " share
    read -rp "Mount point [${mountpoint}]: " mp; mountpoint="${mp:-${mountpoint}}"
    read -rp "SMB username: " nas_user
    read -rsp "SMB password: " nas_pass; echo
    if [[ -z "${share}" || -z "${nas_user}" ]]; then
      echo "❌ Share and username are required."; pause; return 1
    fi
  elif [[ "${mount_type}" == "nfs" ]]; then
    read -rp "NFS export (e.g. nas.local:/mnt/vol1/matrix): " share
    read -rp "Mount point [${mountpoint}]: " mp; mountpoint="${mp:-${mountpoint}}"
    if [[ -z "${share}" ]]; then
      echo "❌ NFS export is required."; pause; return 1
    fi
  else
    read -rp "Target media path (already mounted, e.g. /mnt/matrix-nas/media): " share
    if [[ -z "${share}" ]]; then
      echo "❌ Target path is required."; pause; return 1
    fi
    mountpoint="${share}"
  fi

  echo
  echo "=== Summary ==="
  [[ "${mount_type}" != "path" ]] && echo "Share:      ${share}"
  [[ "${mount_type}" != "path" ]] && echo "Mount:      ${mountpoint}"
  echo "Target:     ${mountpoint}/media  (new media_store_path)"
  echo "Synapse will be STOPPED during migration."
  echo "================"
  read -rp "Proceed? (y/n): " confirm
  [[ "${confirm}" == "y" || "${confirm}" == "Y" ]] || { echo "Cancelled."; pause; return 0; }

  # --- 1) Install prerequisites & mount ------------------------------------
  if [[ "${mount_type}" == "cifs" ]]; then
    ensure_pkg cifs-utils
    snap_backup "Configure NAS media repository (CIFS)" /etc/matrix-nas-credentials /etc/fstab
    cat > /etc/matrix-nas-credentials <<EOF
username=${nas_user}
password=${nas_pass}
EOF
    chmod 600 /etc/matrix-nas-credentials
    mkdir -p "${mountpoint}"
    if ! grep -q " ${mountpoint} " /etc/fstab; then
      echo "${share} ${mountpoint} cifs credentials=/etc/matrix-nas-credentials,uid=matrix-synapse,gid=$(id -gn matrix-synapse 2>/dev/null || echo nogroup),iocharset=utf8,nofail,_netdev,x-systemd.automount,x-systemd.idle-timeout=60,x-systemd.device-timeout=5s,x-systemd.mount-timeout=5s 0 0" >> /etc/fstab
    fi
    mount "${mountpoint}" 2>/dev/null || mount -a 2>/dev/null || true
  elif [[ "${mount_type}" == "nfs" ]]; then
    ensure_pkg nfs-common
    mkdir -p "${mountpoint}"
    if ! grep -q " ${mountpoint} " /etc/fstab; then
      echo "${share} ${mountpoint} nfs rw,soft,timeo=30,retrans=2,nofail,_netdev,x-systemd.automount 0 0" >> /etc/fstab
    fi
    mount "${mountpoint}" 2>/dev/null || mount -a 2>/dev/null || true
  fi

  # --- 2) Verify the target is writable ------------------------------------
  local target="${mountpoint}/media"
  mkdir -p "${target}" 2>/dev/null || true
  if ! touch "${target}/.nas_write_test" 2>/dev/null; then
    echo "❌ Cannot write to ${target}. Check mount/permissions/share."
    echo "   (Synapse was NOT changed — your data is safe.)"
    pause; return 1
  fi
  rm -f "${target}/.nas_write_test"

  # --- 3) Stop Synapse, copy data, fix ownership ---------------------------
  echo "🛑 Stopping Synapse..."
  systemctl stop matrix-synapse 2>/dev/null || true

  echo "📦 Copying existing media to NAS (this may take a while)..."
  ensure_pkg rsync
  if [[ -d "${cur_path}" ]]; then
    rsync -a --info=progress2 "${cur_path}/" "${target}/" || \
      rsync -a "${cur_path}/" "${target}/"
  fi

  local syn_group
  syn_group="$(id -gn matrix-synapse 2>/dev/null || echo nogroup)"
  chown -R matrix-synapse:"${syn_group}" "${target}" 2>/dev/null || true

  # --- 4) Update media_store_path in homeserver.yaml via yq ---------------
  echo "📍 Updating media_store_path in homeserver.yaml..."
  local backup_file
  backup_file="$(yaml_backup)"

  yaml_set_str "media_store_path" "${target}"

  # --- 5) Start Synapse; rollback if it fails ------------------------------
  echo "🚀 Starting Synapse with new media path..."
  fix_synapse_perms
  systemctl start matrix-synapse
  sleep 3

  if systemctl is-active --quiet matrix-synapse; then
    echo "✅ Media store now at: ${target}"
    echo "ℹ️  Keep the OLD copy (${cur_path}) until you confirm uploads work,"
    echo "    then you may delete it to reclaim space."
    log_audit "Media repository migrated to ${target} (was ${cur_path})"
  else
    echo "❌ Synapse failed to start with the NAS path. Rolling back..."
    yaml_restore "${backup_file}"
    fix_synapse_perms
    systemctl start matrix-synapse
    sleep 3
    if systemctl is-active --quiet matrix-synapse; then
      echo "✅ Rolled back — Synapse is up on the OLD media path."
      echo "   Keep the mount, fix permissions/availability, then retry."
    else
      echo "❌ Synapse still down. Inspect: journalctl -u matrix-synapse -n 50"
    fi
  fi

  echo
  echo "⚠️  NAS-dependent notes:"
  echo "   • If the NAS goes offline, uploads will FAIL (not crash) until it returns."
  echo "   • fstab uses nofail/_netdev so a missing NAS won't block boot."
  echo "   • To revert fully: edit homeserver.yaml, or use Fix Wizard."
  pause
}

#############################################
# Categorized log viewer
#############################################

# Display a category of logs. $1 = label, $2 = grep pattern, $3 = lines count,
# $4 = which files ("synapse" | "nginx" | "both")
_show_log_category() {
  local label="$1" pattern="$2" lines="$3" where="$4"
  print_header
  echo "📜 === ${label} (last ${lines} matches) ==="
  echo
  local found=0

  if [[ "${where}" == "synapse" || "${where}" == "both" ]]; then
    local syn_log="/var/log/matrix-synapse/homeserver.log"
    if [[ -f "${syn_log}" ]]; then
      echo "── Synapse (${syn_log}) ──────────────────"
      if command grep -iE "${pattern}" "${syn_log}" 2>/dev/null | tail -n "${lines}" | cat; then
        command grep -qc -iE "${pattern}" "${syn_log}" 2>/dev/null && found=1
      fi
      echo
    else
      echo "⚠️  ${syn_log} not found."
      echo
    fi
  fi

  if [[ "${where}" == "nginx" || "${where}" == "both" ]]; then
    local nx_log="/var/log/nginx/access.log"
    if [[ "${where}" == "nginx" ]] && [[ -f "/var/log/nginx/error.log" ]]; then
      nx_log="/var/log/nginx/error.log"
    fi
    if [[ -f "${nx_log}" ]]; then
      echo "── Nginx (${nx_log}) ─────────────────────"
      command grep -iE "${pattern}" "${nx_log}" 2>/dev/null | tail -n "${lines}" | cat || true
      echo
    fi
  fi

  [[ ${found} -eq 0 ]] && echo "(no matching lines)"
  pause
}

view_logs_menu() {
  print_header
  echo "📜 === View Logs ==="
  echo "How many lines per category do you want to see?"
  echo "1) 50    2) 100    3) 200    4) 500"
  read -rp "Choose [1-4, default 1]: " lopt
  local lines
  case "${lopt:-1}" in
    1) lines=50  ;;
    2) lines=100 ;;
    3) lines=200 ;;
    4) lines=500 ;;
    *) lines=50 ;;
  esac

  while true; do
    print_header
    echo "📜 === View Logs (showing last ${lines} matches) ==="
    echo
    echo "1) 🔑 Login"
    echo "2) 🚪 Logout"
    echo "3) ❌ Errors / Exceptions"
    echo "4) 🌐 Federation"
    echo "5) 🔌 API requests (Nginx access)"
    echo "6) ⬆️  Upload / Media"
    echo "7) 🧾 Registration"
    echo "8) ✉️  Invites"
    echo "9) 📞 Calls / TURN / WebRTC"
    echo "0) 🔙 Back"
    read -rp "Choose [0-9]: " opt

    case "${opt}" in
      1) _show_log_category "Logins"         'login|sso|password|token'      "${lines}" synapse  || true ;;
      2) _show_log_category "Logouts"        'logout'                        "${lines}" synapse  || true ;;
      3) _show_log_category "Errors"         'error|exception|traceback|critical|failed' "${lines}" synapse  || true ;;
      4) _show_log_category "Federation"     'federation'                    "${lines}" synapse  || true ;;
      5) _show_log_category "API requests"   '/_matrix/'                     "${lines}" nginx   || true ;;
      6) _show_log_category "Upload / Media" 'upload|media|m\.video|m\.image|m\.file|local_download' "${lines}" synapse  || true ;;
      7) _show_log_category "Registration"   'register|registration'         "${lines}" synapse  || true ;;
      8) _show_log_category "Invites"        'invite'                        "${lines}" synapse  || true ;;
      9) _show_log_category "Calls / TURN"   'call|turn|voip|webrtc|stun'    "${lines}" synapse  || true ;;
      0) return 0 ;;
      *) echo "Invalid option."; sleep 1 ;;
    esac
  done
}

#############################################
# Bots management (Mjolnir + hookshot auto, others guides)
#############################################

BOT_BASE="/opt/matrix-bots"

# Is a given systemd service present?
bot_service_exists() { systemctl list-unit-files 2>/dev/null | grep -q "^$1\.service"; }

# Write a systemd unit for a bot. $1=name $2=execdir $3=execmd (the command line)
bot_write_systemd() {
  local name="$1" execdir="$2" execmd="$3"
  snap_backup "Update systemd unit for bot ${name}" "/etc/systemd/system/${name}.service"
  cat > "/etc/systemd/system/${name}.service" <<EOF
[Unit]
Description=Matrix bot: ${name}
After=network-online.target matrix-synapse.service
Wants=network-online.target

[Service]
Type=simple
User=matrix-bots
Group=matrix-bots
WorkingDirectory=${execdir}
ExecStart=${execmd}
Restart=on-failure
RestartSec=5

[Install]
WantedBy=multi-user.target
EOF
  systemctl daemon-reload
}

# Add/remove a registration.yaml to Synapse's app_service_config_files list,
# stored in /etc/matrix-synapse/conf.d/appservices.yaml (idempotent + safe).
_add_appservice() {
  local reg="$1"
  _ensure_yq || return 1
  _ensure_homeserver_yaml || return 1
  yaml_backup >/dev/null
  yaml_append "app_service_config_files" "\"${reg}\""
  fix_synapse_perms
  systemctl restart matrix-synapse 2>/dev/null || true
}

_remove_appservice() {
  local reg="$1"
  _ensure_yq || return 1
  _ensure_homeserver_yaml || return 1
  yaml_list_remove "app_service_config_files" "\"${reg}\""
  fix_synapse_perms
  systemctl restart matrix-synapse 2>/dev/null || true
}

_ensure_bot_user() {
  if ! id matrix-bots >/dev/null 2>&1; then
    useradd --system --create-home --home-dir "${BOT_BASE}" --shell /usr/sbin/nologin matrix-bots
  fi
  mkdir -p "${BOT_BASE}"
}

_install_mjolnir() {
  print_header
  echo "🤖 === Install Mjolnir (Moderation Bot) ==="
  echo
  if ! load_config; then
    echo "⚠️  Config not found. Run Install first."; pause; return 1
  fi

  # Collect configuration up front — run_step sends the wrapped step's
  # stdout/stderr only to the log file, so a `read -rp` inside a step
  # would show no visible prompt and appear to hang.
  echo
  echo "Mjolnir needs a DEDICATED bot account and a management room."
  echo "Create an admin user for the bot first (e.g. @mjolnir:${HS_DOMAIN})"
  echo "via main menu option 2, then come back here."
  echo
  read -rp "Bot MXID (e.g. @mjolnir:${HS_DOMAIN}): " bot_mxid
  read -rp "Bot access token (from Element: Settings → Help → Access Token): " bot_token
  read -rp "Management room ID (e.g. !abc...:${HS_DOMAIN}): " mgmt_room
  if [[ -z "${bot_mxid}" || -z "${bot_token}" || -z "${mgmt_room}" ]]; then
    echo "❌ All three values are required."; pause; return 1
  fi

  _ensure_bot_user
  local dir="${BOT_BASE}/mjolnir"
  snap_backup "Reinstall Mjolnir bot (config)" "${dir}/production.yaml" "${dir}/registration.yaml"

  # Reset the progress-bar engine for this run.
  TOTAL_STEPS=5
  CURRENT_STEP=0
  FAILED_STEPS=()

  echo
  echo "🚀 Installing Mjolnir — ${TOTAL_STEPS} steps ahead. Full details in ${LOG_FILE}"
  echo

  _step_mjolnir_deps() {
    ensure_pkg git
    if ! command -v node >/dev/null 2>&1; then
      curl -fsSL https://deb.nodesource.com/setup_lts.x | bash -
      apt install -y nodejs
    fi
  }
  run_step "📦 Installing Node.js / git prerequisites" _step_mjolnir_deps

  _step_mjolnir_clone() {
    rm -rf "${dir}"
    sudo -u matrix-bots git clone --depth 1 https://github.com/matrix-org/mjolnir.git "${dir}"
  }
  run_step "⬇️  Cloning Mjolnir" _step_mjolnir_clone

  _step_mjolnir_build() {
    sudo -u matrix-bots bash -c "cd '${dir}' && npm ci && npm run build"
  }
  run_step "🔨 Building (npm ci + build)" _step_mjolnir_build

  _step_mjolnir_config() {
    cat > "${dir}/production.yaml" <<EOF
# Managed by Matrix Stack Manager
homeserverUrl: "https://${HS_DOMAIN}"
rawHomeserverUrl: "https://${HS_DOMAIN}"
domain: "${HS_DOMAIN}"
username: "${bot_mxid#@}"
password: ""
accessToken: "${bot_token}"
managementRoom: "${mgmt_room}"
protectedRooms: []
autoJoinOnly: false
automaticallyRedactForWaldo: false
recordIgnoredInvites: false
protections: []
verbose: false
EOF
    chown -R matrix-bots:matrix-bots "${dir}"

    # Application service registration (optional but recommended)
    local as_id="mjolnir-bot"
    local as_token; as_token="$(openssl rand -hex 32)"
    local hs_token; hs_token="$(openssl rand -hex 32)"
    cat > "${dir}/registration.yaml" <<EOF
id: ${as_id}
url: "http://127.0.0.1:29999"
as_token: "${as_token}"
hs_token: "${hs_token}"
sender_localpart: "mjolnir-bot"
rate_limited: false
namespaces:
  users:
    - exclusive: false
      regex: "@_mjolnir_.*"
EOF
    chown matrix-bots:matrix-bots "${dir}/registration.yaml"
    _add_appservice "${dir}/registration.yaml"
  }
  run_step "🛠️  Writing bot config & application service registration" _step_mjolnir_config

  _step_mjolnir_start() {
    bot_write_systemd "matrix-bot-mjolnir" "${dir}" \
      "/usr/bin/node ${dir}/lib/index.js"
    systemctl enable --now matrix-bot-mjolnir 2>/dev/null || true
    sleep 2
  }
  run_step "🚀 Enabling & starting the bot service" _step_mjolnir_start

  echo
  print_install_summary

  if [[ "${#FAILED_STEPS[@]}" -eq 0 ]]; then
    echo "✅ Mjolnir installed at ${dir}"
  else
    echo "⚠️  Mjolnir was partially installed — check the failed step(s) above."
  fi
  echo
  echo "📋 NEXT STEPS (do these in Element):"
  echo "  1. Invite the bot to the management room (${mgmt_room})."
  echo "  2. Give it Admin / power level 100 in that room."
  echo "  3. With the bot, run: !mjolnir"
  echo "  4. To protect a room: invite the bot, then '!mjolnir status'."
  echo "  Logs: journalctl -u matrix-bot-mjolnir -f"
  log_audit "Mjolnir bot installed (${bot_mxid})"
  pause
}

_install_hookshot() {
  print_header
  echo "🤖 === Install matrix-hookshot (GitHub/GitLab/Jenkins) ==="
  echo
  if ! load_config; then
    echo "⚠️  Config not found. Run Install first."; pause; return 1
  fi

  # Collect configuration up front — run_step sends the wrapped step's
  # stdout/stderr only to the log file, so a `read -rp` inside a step
  # would show no visible prompt and appear to hang.
  echo
  echo "hookshot needs a dedicated bot account. Create one first (e.g."
  echo "@hookshot:${HS_DOMAIN}) via main menu option 2."
  read -rp "Bot MXID (e.g. @hookshot:${HS_DOMAIN}): " bot_mxid
  read -rp "Bot access token: " bot_token
  if [[ -z "${bot_mxid}" || -z "${bot_token}" ]]; then
    echo "❌ Both values are required."; pause; return 1
  fi

  _ensure_bot_user
  local dir="${BOT_BASE}/hookshot"
  local port=9993 webhook_port=9000
  snap_backup "Reinstall hookshot bot (config)" "${dir}/config.yml" "${dir}/registration.yml"

  # Reset the progress-bar engine for this run.
  TOTAL_STEPS=5
  CURRENT_STEP=0
  FAILED_STEPS=()

  echo
  echo "🚀 Installing matrix-hookshot — ${TOTAL_STEPS} steps ahead. Full details in ${LOG_FILE}"
  echo

  _step_hookshot_deps() {
    ensure_pkg git
    if ! command -v node >/dev/null 2>&1; then
      curl -fsSL https://deb.nodesource.com/setup_lts.x | bash -
      apt install -y nodejs
    fi
  }
  run_step "📦 Installing Node.js / git prerequisites" _step_hookshot_deps

  _step_hookshot_clone() {
    rm -rf "${dir}"
    sudo -u matrix-bots git clone --depth 1 https://github.com/matrix-org/matrix-hookshot.git "${dir}"
  }
  run_step "⬇️  Cloning matrix-hookshot" _step_hookshot_clone

  _step_hookshot_build() {
    sudo -u matrix-bots bash -c "cd '${dir}' && npm ci && npm run build"
  }
  run_step "🔨 Building" _step_hookshot_build

  _step_hookshot_config() {
    # Minimal config.yml (GitHub enabled by default; others via editor later)
    cat > "${dir}/config.yml" <<EOF
# Managed by Matrix Stack Manager — edit to enable GitLab/Jenkins/etc.
bridge:
  domain: "${HS_DOMAIN}"
  url: "https://${HS_DOMAIN}"
  mediaUrl: "https://${HS_DOMAIN}"
  port: ${port}
  bindAddress: "127.0.0.1"
  clientId: "hookshot"
  publicUrl: "https://${HS_DOMAIN}/hookshot/"
  queue:
    monolithic: true
    port: ${webhook_port}
passFile: "./passkey.yml"
bot:
  localpart: "${bot_mxid#@}"
  avatar: "mxc://half-shot.uk/CDhBSkSBXpxbbbUUZUSwXXOG"
  displayname: "Hookshot"
  accessToken: "${bot_token}"
logging:
  level: info
  colorize: true
  json: false
  filename: "./logs/hookshot.log"
  maxSize: 50
  maxFiles: 5
listeners:
  - port: ${webhook_port}
    bindAddress: "127.0.0.1"
    resources:
      - webhooks
      - metrics
      - provisioning
      - widgets
EOF
    chown -R matrix-bots:matrix-bots "${dir}"
    # Generate the passfile
    sudo -u matrix-bots bash -c "cd '${dir}' && [ -f passkey.yml ] || node lib/Shared/Passkey.js"

    # AS registration
    local as_id="hookshot"
    local as_token; as_token="$(openssl rand -hex 32)"
    local hs_token; hs_token="$(openssl rand -hex 32)"
    cat > "${dir}/registration.yml" <<EOF
id: ${as_id}
url: "http://127.0.0.1:${port}"
as_token: "${as_token}"
hs_token: "${hs_token}"
sender_localpart: "hookshot"
rate_limited: true
namespaces:
  rooms: []
  users:
    - exclusive: true
      regex: "@_github_.*:${HS_DOMAIN//./\\.}"
    - exclusive: true
      regex: "@_gitlab_.*:${HS_DOMAIN//./\\.}"
EOF
    chown matrix-bots:matrix-bots "${dir}/registration.yml"
    _add_appservice "${dir}/registration.yml"
  }
  run_step "🛠️  Writing bot config & application service registration" _step_hookshot_config

  _step_hookshot_start() {
    bot_write_systemd "matrix-bot-hookshot" "${dir}" \
      "/usr/bin/node ${dir}/lib/App.js"
    systemctl enable --now matrix-bot-hookshot 2>/dev/null || true
    sleep 2
  }
  run_step "🚀 Enabling & starting the bot service" _step_hookshot_start

  echo
  print_install_summary

  if [[ "${#FAILED_STEPS[@]}" -eq 0 ]]; then
    echo "✅ matrix-hookshot installed at ${dir}"
  else
    echo "⚠️  matrix-hookshot was partially installed — check the failed step(s) above."
  fi
  echo
  echo "📋 NEXT STEPS:"
  echo "  1. Open the hookshot widgets UI: https://${HS_DOMAIN}/hookshot/"
  echo "  2. GitHub: Settings → Developer settings → OAuth Apps, callback:"
  echo "     https://${HS_DOMAIN}/hookshot/v3/oauth/"
  echo "  3. Edit ${dir}/config.yml to enable GitLab/Jenkins (add their tokens)."
  echo "  4. Create a GitHub webhook → http(s)://<this-server>:${webhook_port}..."
  echo "     (you may need a reverse-proxy rule for the webhook port)."
  echo "  Logs: journalctl -u matrix-bot-hookshot -f"
  log_audit "matrix-hookshot bot installed (${bot_mxid})"
  pause
}

_bot_install_submenus() {
  local name="$1" svc="$2" dir="$3" reg="$4" configfile="$5"
  while true; do
    print_header
    echo "🤖 === ${name} ==="
    bot_service_exists "${svc}" && echo "Status: $(systemctl is-active "${svc}")" || echo "Status: not installed"
    echo
    echo "1) (Re)install"
    echo "2) Edit config"
    echo "3) Status"
    echo "4) Restart"
    echo "5) Uninstall"
    echo "0) Back"
    read -rp "Choose [0-5]: " o
    case "${o}" in
      1) [[ "${name}" == "Mjolnir" ]] && _install_mjolnir || _install_hookshot ;;
      2)
        local editor="${EDITOR:-nano}"
        command -v "${editor}" >/dev/null 2>&1 || editor=vi
        "${editor}" "${dir}/${configfile}"
        systemctl restart "${svc}" 2>/dev/null || true
        ;;
      3) systemctl status "${svc}" --no-pager 2>/dev/null || echo "not installed" ;;
      4) systemctl restart "${svc}" 2>/dev/null && echo "restarted" || echo "not installed" ;;
      5)
        read -rp "Remove ${name} completely (service + files)? (y/n): " c
        if [[ "${c}" == "y" || "${c}" == "Y" ]]; then
          systemctl disable --now "${svc}" 2>/dev/null || true
          rm -f "/etc/systemd/system/${svc}.service"
          systemctl daemon-reload
          _remove_appservice "${reg}"
          rm -rf "${dir}"
          log_audit "${name} bot uninstalled"
          echo "✅ Removed."
        fi
        ;;
      0) return 0 ;;
      *) echo "Invalid option."; sleep 1 ;;
    esac
    [[ "${o}" != "3" && "${o}" != "4" ]] && break
  done
}

_show_bot_guide() {
  local title="$1" body="$2"
  print_header
  echo "🤖 === ${title} ==="
  echo
  echo "${body}"
  pause
}

bots_menu() {
  while true; do
    print_header
    echo "🤖 === Bots Management ==="
    echo
    echo "Auto-installable:"
    echo "  1) Mjolnir — moderation bot"
    echo "  2) matrix-hookshot — GitHub / GitLab / Jenkins"
    echo
    echo "Guides (manual install):"
    echo "  3) Welcome Bot"
    echo "  4) Alert Bot (Alertmanager)"
    echo "  5) Monitoring Bot"
    echo "  0) Back"
    read -rp "Choose [0-5]: " opt
    case "${opt}" in
      1) _bot_install_submenus "Mjolnir" "matrix-bot-mjolnir" "${BOT_BASE}/mjolnir" "${BOT_BASE}/mjolnir/registration.yaml" "production.yaml"  || true ;;
      2) _bot_install_submenus "hookshot" "matrix-bot-hookshot" "${BOT_BASE}/hookshot" "${BOT_BASE}/hookshot/registration.yml" "config.yml"  || true ;;
      3) _show_bot_guide "Welcome Bot" \
"Greets new users when they register.

Project: https://github.com/Sorunome/matrix-welcome-bot

Prerequisites:
  • Python 3 + pip + virtualenv
  • A dedicated bot account (e.g. @welcome:\${HS_DOMAIN})

Install steps:
  1. git clone https://github.com/Sorunome/matrix-welcome-bot.git /opt/matrix-bots/welcome
  2. python3 -m venv venv && source venv/bin/activate
  3. pip install -r requirements.txt
  4. Copy config.example.yaml → config.yaml, fill in:
       - homeserver URL
       - bot user + access token
       - welcome message
  5. Run: python3 bot.py
  6. Make a systemd service so it survives reboot.

The bot listens to registration events and posts a configurable message
to the new user in a DM." ;;
      4) _show_bot_guide "Alert Bot (Prometheus Alertmanager)" \
"Forwards Prometheus alerts into a Matrix room.

Project: https://github.com/wetfloo/matrix-alertmanager
(or the popular fork: matrix-alertmanager by jaywink)

Prerequisites:
  • Prometheus + Alertmanager already running (menu option 13)
  • A dedicated bot account + a room to receive alerts

Install steps:
  1. Download the latest release from the GitHub Releases page.
  2. Create config.yaml:
       homeserverUrl, bot user + access token, alert room ID.
  3. Run the binary: ./matrix-alertmanager -config config.yaml
  4. In Alertmanager, add a webhook receiver pointing at the bot:
       http://127.0.0.1:3000/alerts

This bridges Alertmanager → Matrix so firing alerts appear as messages." ;;
      5) _show_bot_guide "Monitoring Bot" \
"Sends server/synapse metrics summaries to a Matrix room.

Common choices:
  • matrix-webhook / matrix-notifier — posts JSON to a room.
  • A small custom bot using matrix-nio (Python) that periodically
    scrapes the Prometheus API (:9090) and posts a summary.

Prerequisites:
  • Monitoring enabled (menu option 13)
  • A bot account + a 'monitoring' room

Suggested approach:
  1. pip install matrix-nio requests
  2. Write a loop that queries http://127.0.0.1:9090/api/v1/query
     for jobs you care about (cpu, memory, synapse active users).
  3. Post a formatted summary to the room every N minutes.
  4. Wrap it in a systemd service.

There is no single canonical project; pick the one matching your stack." ;;
      0) return 0 ;;
      *) echo "Invalid option."; sleep 1 ;;
    esac
  done
}

#############################################
# Bridges (guides only)
#############################################

_show_bridge_guide() {
  local title="$1" body="$2"
  print_header
  echo "🌉 === ${title} Bridge — Guide ==="
  echo
  echo "${body}"
  pause
}

bridges_menu() {
  while true; do
    print_header
    echo "🌉 === Bridges (guides) ==="
    echo "Step-by-step guides for connecting external networks."
    echo
    echo "1) Telegram   (mautrix-telegram)"
    echo "2) WhatsApp   (mautrix-whatsapp)"
    echo "3) Discord    (mautrix-discord)"
    echo "4) Slack      (matrix-appservice-slack)"
    echo "5) MS Teams   (experimental)"
    echo "0) Back"
    read -rp "Choose [0-5]: " opt
    case "${opt}" in
      1) _show_bridge_guide "Telegram" \
"Project: https://github.com/mautrix/telegram

REQUIREMENTS (get these FIRST):
  • Bot token from \@BotFather  → /newbot
  • Your own api_id + api_hash from https://my.telegram.org → API development tools
  • Chat ID of the bridge control room (\@userinfobot gives your ID)

INSTALL (native):
  1. mkdir -p /opt/mautrix-telegram && cd /opt/mautrix-telegram
  2. python3 -m venv venv && source venv/bin/activate
  3. pip install 'mautrix-telegram[all]'
  4. cp example-config.yaml config.yaml && python -m mautrix_telegram -g -c config.yaml -r registration.yaml
  5. Edit config.yaml:
       homeserver → https://\${HS_DOMAIN}
       api_id / api_hash / bot token
       bridge permissions: '*': 'relaybot' or your user → 'full'
  6. Copy registration.yaml into Synapse's app_service_config_files
     (this script's Bots → appservice handling, or manually in homeserver.yaml)
  7. Restart Synapse, then start the bridge.
  8. In Element, message the bridge bot and run 'login' (or /login for the bot account).

WARNING: relaybot/login modes have different Telegram ToS implications; read
the mautrix-telegram README carefully before production use." ;;
      2) _show_bridge_guide "WhatsApp" \
"Project: https://github.com/mautrix/whatsapp

HOW IT WORKS: scans a QR code with your phone's WhatsApp (like WhatsApp Web).

REQUIREMENTS:
  • An active WhatsApp account on a phone (multi-device must be enabled)
  • A bot account for the bridge (or piggyback on your user)

INSTALL (native):
  1. mkdir -p /opt/mautrix-whatsapp && cd /opt/mautrix-whatsapp
  2. wget the latest binary from the Releases page (Go-based, no venv needed)
  3. ./mautrix-whatsapp -g -c config.yaml -r registration.yaml
  4. Edit config.yaml: homeserver, bridge permissions, your user → 'admin'
  5. Register the appservice with Synapse (copy registration.yaml path into
     app_service_config_files and restart Synapse).
  6. Start the bridge, then message the bridge bot in Element and type 'login'.
  7. Scan the QR code from WhatsApp → Settings → Linked Devices.

WARNINGS:
  • WhatsApp may BAN accounts that abuse the bridge (mass spam, automation).
  • Use a secondary/dedicated number if unsure. Not officially endorsed by Meta." ;;
      3) _show_bridge_guide "Discord" \
"Project: https://github.com/mautrix/discord

REQUIREMENTS:
  • Discord Application + Bot from https://discord.com/developers/applications
  • Bot token (Bot section)
  • Enable PRIVILEGED GATEWAY INTENTS → Server Members + Message Content
  • Invite the bot to your Discord server with the OAuth2 URL generator

INSTALL (native):
  1. mkdir -p /opt/mautrix-discord && cd /opt/mautrix-discord
  2. python3 -m venv venv && source venv/bin/activate
  3. pip install 'mautrix-discord[all]'
  4. python -m mautrix_discord -g -c config.yaml -r registration.yaml
  5. Edit config.yaml: homeserver, Discord bot token, bridge permissions
  6. Add registration.yaml to Synapse app_service_config_files; restart Synapse
  7. Start the bridge, DM the bridge bot in Element, type 'login <token-or-oauth>'.

NOTE: 1:1 bridging is stable; full portal/guild bridging needs careful
permission setup on both Discord and Matrix sides." ;;
      4) _show_bridge_guide "Slack" \
"Project: https://github.com/matrix-org/matrix-appservice-slack

REQUIREMENTS:
  • A Slack workspace where you can install apps
  • Slack App (api.slack.com → Create New App): Bot Token, Signing Secret,
    App-Level Tokens (connections:write) for Socket Mode
  • OAuth scopes: chat:write, channels:history, groups:history, im:history

INSTALL (native):
  1. git clone https://github.com/matrix-org/matrix-appservice-slack /opt/slack-bridge
  2. cd /opt/slack-bridge && npm install && npm run build
  3. cp config/config.sample.yaml config/config.yaml
  4. Edit: homeserver URL, bot name, Slack credentials, enable Socket Mode
  5. node app.js -r -u https://\${HS_DOMAIN} -o registration.yaml  (generate AS)
  6. Add registration.yaml to Synapse app_service_config_files; restart Synapse
  7. Start the bridge, invite the bot, use '!slack link <channel>' in Element.

NOTE: Slack bridges work best with Socket Mode (no public ingress needed)." ;;
      5) _show_bridge_guide "Microsoft Teams" \
"STATUS: EXPERIMENTAL — no mature production-grade Matrix↔Teams bridge.

Reference projects (both require significant effort):
  • matrix-teams: https://github.com/foreverxml/matrix-teams (limited)
  • mauteams (community, incomplete)

WHY IT'S HARD:
  • Microsoft Graph API + Teams permissions are restrictive for bots.
  • Tenant admin consent is usually required.
  • E2EE and threading models differ significantly.

RECOMMENDATION: Do NOT use Teams bridging in production yet.
  • If you must integrate, consider the Microsoft 365 side exporting
    to a webhook that a custom Matrix bot reads.
  • Watch the mautrix project for a future official Teams bridge." ;;
      0) return 0 ;;
      *) echo "Invalid option."; sleep 1 ;;
    esac
  done
}

#############################################
# Captcha (Synapse-side, shown in Element registration form)
#############################################

configure_captcha() {
  print_header
  echo "🛡️  === Captcha for Registration (Element) ==="
  echo
  echo "Element itself has no client-side captcha. The captcha is enforced by"
  echo "SYNAPSE during registration and rendered in Element's Sign-Up form."
  echo "Two options are supported by Synapse natively / via modules:"
  echo
  echo "  • reCAPTCHA v2 (Google) — natively supported by Synapse."
  echo "  • Cloudflare Turnstile — via a third-party Synapse module."
  echo

  _ensure_migrated

  local cur="disabled"
  if yaml_exists "enable_registration_captcha"; then
    local cap_val
    cap_val="$(yaml_get "enable_registration_captcha" 2>/dev/null)"
    if [[ "${cap_val}" == "true" ]]; then
      if yaml_exists "recaptcha_public_key"; then
        cur="enabled (reCAPTCHA)"
      elif yaml_exists "modules" ; then
        cur="enabled (Turnstile)"
      else
        cur="enabled"
      fi
    fi
  fi
  echo "Current captcha: ${cur}"
  echo
  echo "1) Enable Google reCAPTCHA v2"
  echo "2) Enable Cloudflare Turnstile (module)"
  echo "3) Disable captcha"
  echo "4) Help: how to get keys"
  echo "0) Back"
  read -rp "Choose [0-4]: " opt

  case "${opt}" in
    1)
      echo
      echo "Get keys at https://www.google.com/recaptcha/admin (choose reCAPTCHA v2,"
      echo "'I'm not a robot' checkbox). Add your domain(s) to the allowed list."
      read -rp "reCAPTCHA public (site) key: " pub
      read -rp "reCAPTCHA private (secret) key: " priv
      if [[ -z "${pub}" || -z "${priv}" ]]; then
        echo "❌ Both keys are required."; pause; return 1
      fi
      _apply_recaptcha() {
        # Remove any existing Turnstile module config
        yaml_delete "modules"
        yaml_set "enable_registration_captcha" "true"
        yaml_set_str "recaptcha_public_key" "${pub}"
        yaml_set_str "recaptcha_private_key" "${priv}"
      }
      echo "🔄 Restarting Synapse (with auto-rollback if rejected)..."
      if yaml_transaction "Enable reCAPTCHA v2" _apply_recaptcha; then
        echo "✅ reCAPTCHA v2 enabled. Element's Sign-Up form will show the checkbox."
        echo "   Remember: add your domain in the Google reCAPTCHA admin console."
        log_audit "Captcha enabled: Google reCAPTCHA v2"
      fi
      ;;
    2)
      echo
      echo "Cloudflare Turnstile requires a third-party module. This will install"
      echo "'synapse-turnstile' into Synapse's Python environment."
      echo "Get your site/secret keys at https://dash.cloudflare.com → Turnstile."
      read -rp "Turnstile site key: " pub
      read -rp "Turnstile secret key: " priv
      if [[ -z "${pub}" || -z "${priv}" ]]; then
        echo "❌ Both keys are required."; pause; return 1
      fi

      local venv_py="/opt/venvs/matrix-synapse/bin/python"
      if [[ -x "${venv_py}" ]]; then
        echo "📦 Installing synapse-turnstile module..."
        if ! /opt/venvs/matrix-synapse/bin/pip install synapse-turnstile 2>/dev/null; then
          echo "⚠️  Could not install module from PyPI."
          echo "   You may need to install it manually or use reCAPTCHA instead."
          pause; return 1
        fi
      else
        echo "⚠️  Synapse venv not found at ${venv_py}. Install the module manually:"
        echo "   pip install synapse-turnstile"
      fi

      _apply_turnstile() {
        # Remove any existing reCAPTCHA keys
        yaml_delete "recaptcha_public_key"
        yaml_delete "recaptcha_private_key"
        yaml_set "enable_registration_captcha" "false"
        # Use yq to set the modules list with Turnstile
        _ensure_yq
        "${YQ_BIN}" e '.modules = [{"module": "synapse_turnstile.Turnstile", "config": {"enabled": true, "sitekey": "'"${pub}"'", "secret": "'"${priv}"'"}}]' -i "${HOMESERVER_YAML}" 2>/dev/null
      }
      echo "🔄 Restarting Synapse (with auto-rollback if rejected)..."
      if yaml_transaction "Enable Cloudflare Turnstile" _apply_turnstile; then
        echo "✅ Turnstile enabled."
        log_audit "Captcha enabled: Cloudflare Turnstile"
      fi
      ;;
    3)
      _apply_captcha_disable() {
        yaml_delete "enable_registration_captcha"
        yaml_delete "recaptcha_public_key"
        yaml_delete "recaptcha_private_key"
        yaml_delete "modules"
      }
      yaml_transaction "Disable captcha" _apply_captcha_disable
      echo "✅ Captcha disabled."
      log_audit "Captcha disabled"
      ;;
    4)
      print_header
      echo "🛟 === How to get captcha keys ==="
      echo
      echo "── Google reCAPTCHA v2 ──"
      echo "  1. Go to https://www.google.com/recaptcha/admin"
      echo "  2. Create a reCAPTCHA v2 site ('I'm not a robot' checkbox)."
      echo "  3. Add your domain (e.g. ${HS_DOMAIN:-your-domain}) to the allowed list."
      echo "  4. Copy the SITE KEY (public) and SECRET KEY (private)."
      echo
      echo "── Cloudflare Turnstile ──"
      echo "  1. Go to https://dash.cloudflare.com → Turnstile"
      echo "  2. Add a site, choose Managed or Invisible widget."
      echo "  3. Copy the Site Key and Secret Key."
      echo
      pause
      return 0
      ;;
    0) return 0 ;;
    *) echo "Invalid option."; sleep 1 ;;
  esac
  pause
}

# Safely add/replace a listener entry inside homeserver.yaml's "listeners" list
# Safely add/replace a listener entry in homeserver.yaml using yq.
# $1 = port, $2 = type, $3 = comma-separated resources, $4 = bind_address (default 127.0.0.1)
ensure_listener_yaml() {
  local port="$1" ltype="$2" resources_csv="$3" bind="${4:-127.0.0.1}"
  _ensure_yq || return 1
  _ensure_homeserver_yaml || return 1

  # Build resources JSON array from comma-separated list
  local resources_json="[]"
  if [[ -n "${resources_csv}" ]]; then
    resources_json="["
    local first=1
    IFS=',' read -ra res_array <<< "${resources_csv}"
    for r in "${res_array[@]}"; do
      [[ -z "${r}" ]] && continue
      [[ ${first} -eq 1 ]] && first=0 || resources_json+=","
      resources_json+="\"${r}\""
    done
    resources_json+="]"
  fi

  # Build the listener JSON entry
  local listener_json="{\"port\": ${port}, \"bind_addresses\": [\"${bind}\"], \"type\": \"${ltype}\", \"tls\": false"
  if [[ -n "${resources_csv}" ]]; then
    listener_json+=", \"resources\": [{\"names\": ${resources_json}}]"
  fi
  listener_json+="}"

  # Remove any existing listener on the same port, then append the new one
  "${YQ_BIN}" e "del(.listeners[] | select(.port == ${port})) | .listeners += ${listener_json}" -i "${HOMESERVER_YAML}" 2>/dev/null

  echo "✅ Listener on port ${port} (${ltype}) ensured in homeserver.yaml"
}

# Safely add/replace a Prometheus scrape job
ensure_prometheus_job() {
  local job_name="$1" target="$2"
  local path="/etc/prometheus/prometheus.yml"

  if [[ ! -f "${path}" ]]; then
    echo "❌ ${path} not found."
    return 1
  fi

  ensure_pkg python3-yaml
  cp -a "${path}" "${path}.bak.$(date +%Y%m%d%H%M%S)"

  python3 - "$job_name" "$target" "$path" <<'PYEOF'
import sys
import yaml

job_name, target, path = sys.argv[1], sys.argv[2], sys.argv[3]

with open(path) as f:
    data = yaml.safe_load(f) or {}

scrape_configs = [c for c in data.get("scrape_configs", []) if c.get("job_name") != job_name]
scrape_configs.append({"job_name": job_name, "static_configs": [{"targets": [target]}]})
data["scrape_configs"] = scrape_configs

with open(path, "w") as f:
    yaml.safe_dump(data, f, default_flow_style=False, sort_keys=False)

print(f"[yaml] Prometheus job '{job_name}' -> {target} ensured")
PYEOF
}

#############################################
# PostgreSQL setup (mandatory for new installs)
#############################################

# Scans the Matrix backup folder (the same folder used by the Backup &
# Recovery menu) for existing PostgreSQL dumps and lets the user pick one
# to restore into the freshly created database, instead of starting from
# an empty database. Sets PG_RESTORE_FILE (empty string = build fresh).
#
# Must be called BEFORE the run_step-wrapped setup_postgres_db, since
# run_step sends the wrapped step's stdout/stderr only to the log file --
# a `read` inside it would show no visible prompt and appear to hang.
_pg_offer_restore_from_backup() {
  PG_RESTORE_FILE=""
  if [[ "${NON_INTERACTIVE:-}" == "true" ]]; then
    return 0
  fi
  local backup_dir="/root/matrix-backups"
  [[ -d "${backup_dir}" ]] || return 0

  local files=() f
  while IFS= read -r -d '' f; do
    files+=("${f}")
  done < <(find "${backup_dir}" -maxdepth 1 -type f -name 'synapse-db-*.dump' -print0 2>/dev/null | sort -z -r)

  [[ "${#files[@]}" -eq 0 ]] && return 0

  echo
  echo "╔══════════════════════════════════════════════════════════════╗"
  echo "║  🗄️   Existing database backup(s) found                      ║"
  echo "╠══════════════════════════════════════════════════════════════╣"
  echo "║  Previous PostgreSQL dump(s) exist in the Matrix backup folder ║"
  echo "║  You can restore one into the new database instead of         ║"
  echo "║  starting empty.                                               ║"
  echo "╚══════════════════════════════════════════════════════════════╝"
  echo "   Folder: ${backup_dir}"
  echo
  local i=1
  for f in "${files[@]}"; do
    local sz mtime
    sz="$(du -sh "${f}" 2>/dev/null | cut -f1)"
    mtime="$(date -r "${f}" '+%Y-%m-%d %H:%M:%S' 2>/dev/null)"
    printf "   %2d)  📦  %-42s  [%s, %s]\n" "${i}" "$(basename "${f}")" "${sz}" "${mtime}"
    i=$((i + 1))
  done
  echo "    0)  🆕  Build a fresh, empty database"
  echo
  local choice
  read -rp "   Restore which backup into the new database? [0]: " choice
  choice="${choice:-0}"

  if [[ "${choice}" =~ ^[0-9]+$ ]] && (( choice >= 1 && choice <= ${#files[@]} )); then
    PG_RESTORE_FILE="${files[$((choice - 1))]}"
    echo "✅ Will restore: $(basename "${PG_RESTORE_FILE}")"
  else
    PG_RESTORE_FILE=""
    echo "🆕 Building a fresh, empty database."
  fi
}

setup_postgres_db() {
  echo "🐘 Installing PostgreSQL..."
  ensure_pkg postgresql
  ensure_pkg postgresql-contrib
  systemctl enable --now postgresql

  PG_DB="synapse"
  PG_USER="synapse_user"
  PG_HOST="localhost"
  PG_PORT="5432"
  PG_PASS="$(openssl rand -hex 24)"

  echo "🐘 Creating PostgreSQL role for Synapse..."
  # cd to /tmp first so sudo -u postgres doesn't print the harmless but
  # confusing "could not change directory to /root/...: Permission denied" warning.
  if ! (cd /tmp && sudo -u postgres psql -tAc "SELECT 1 FROM pg_roles WHERE rolname='${PG_USER}'") | grep -q 1; then
    (cd /tmp && sudo -u postgres psql -c "CREATE ROLE ${PG_USER} WITH LOGIN PASSWORD '${PG_PASS}';")
  else
    (cd /tmp && sudo -u postgres psql -c "ALTER ROLE ${PG_USER} WITH LOGIN PASSWORD '${PG_PASS}';")
  fi

  echo "🐘 Creating PostgreSQL database for Synapse..."
  if ! (cd /tmp && sudo -u postgres psql -tAc "SELECT 1 FROM pg_database WHERE datname='${PG_DB}'") | grep -q 1; then
    (cd /tmp && sudo -u postgres psql -c "CREATE DATABASE ${PG_DB} ENCODING 'UTF8' LC_COLLATE='C' LC_CTYPE='C' TEMPLATE=template0 OWNER ${PG_USER};")
  else
    echo "ℹ️  Database ${PG_DB} already exists — checking collation..."
    local existing_collate
    existing_collate="$(cd /tmp && sudo -u postgres psql -tAc "SELECT datcollate FROM pg_database WHERE datname='${PG_DB}';" | tr -d '[:space:]')"

    if [[ "${existing_collate}" != "C" ]]; then
      # Synapse REQUIRES the 'C' collation. A DB left over from a previous
      # install/uninstall usually has the OS default (e.g. en_US.UTF-8),
      # which makes Synapse fail at startup with IncorrectDatabaseSetup.
      # Rebuild the DB with the correct collation, preserving any data
      # that's already in it (unless the user already chose an explicit
      # backup to restore, in which case that backup wins).
      echo "⚠️  Existing '${PG_DB}' database has collation '${existing_collate}', but Synapse requires 'C'."
      echo "🔧 Rebuilding database with the correct collation (existing data will be preserved)..."

      local fix_dump="/tmp/${PG_DB}-collation-fix-$(date +%Y%m%d-%H%M%S).dump"
      if (cd /tmp && sudo -u postgres pg_dump -F c -f "${fix_dump}" "${PG_DB}"); then
        (cd /tmp && sudo -u postgres psql -c "DROP DATABASE ${PG_DB};")
        (cd /tmp && sudo -u postgres psql -c "CREATE DATABASE ${PG_DB} ENCODING 'UTF8' LC_COLLATE='C' LC_CTYPE='C' TEMPLATE=template0 OWNER ${PG_USER};")

        if [[ -z "${PG_RESTORE_FILE:-}" ]]; then
          # No explicit backup was picked earlier in the flow, so restore
          # the data we just dumped out of the old (wrong-collation) DB.
          PG_RESTORE_FILE="${fix_dump}"
        else
          echo "ℹ️  A backup was already selected for restore; the collation-fix dump (${fix_dump}) is kept as a spare copy."
        fi
        echo "✅ Database rebuilt with 'C' collation."
      else
        echo "❌ Could not dump the existing '${PG_DB}' database to fix its collation automatically."
        echo "   Fix it manually, e.g.:"
        echo "     sudo -u postgres psql -c \"DROP DATABASE ${PG_DB};\""
        echo "     sudo -u postgres psql -c \"CREATE DATABASE ${PG_DB} ENCODING 'UTF8' LC_COLLATE='C' LC_CTYPE='C' TEMPLATE=template0 OWNER ${PG_USER};\""
        return 1
      fi
    else
      echo "ℹ️  Database ${PG_DB} already exists with the correct collation ('C'), skipping creation."
    fi
  fi

  # If the user picked an existing dump from the Matrix backup folder
  # earlier (see _pg_offer_restore_from_backup, called before this
  # run_step), load it into the freshly created database now instead of
  # leaving it empty. --clean --if-exists lets pg_restore run safely even
  # though the database was just created (nothing to drop yet).
  if [[ -n "${PG_RESTORE_FILE:-}" && -f "${PG_RESTORE_FILE}" ]]; then
    echo "♻️  Restoring database dump: ${PG_RESTORE_FILE}"
    ensure_pg_client
    if PGPASSWORD="${PG_PASS}" pg_restore -h "${PG_HOST}" -p "${PG_PORT}" -U "${PG_USER}" \
      -d "${PG_DB}" --clean --if-exists --no-owner "${PG_RESTORE_FILE}"; then
      echo "✅ Database restored from backup."
    else
      echo "⚠️  Restore reported errors — database may be partially restored. Check the log."
    fi
  fi

  echo "🔌 Writing Synapse database config (PostgreSQL)..."
  _ensure_yq || { echo "❌ yq not available."; return 1; }
  _ensure_homeserver_yaml || return 1

  yaml_set_str "database.name" "psycopg2"
  yaml_set_str "database.args.user" "${PG_USER}"
  yaml_set_str "database.args.password" "${PG_PASS}"
  yaml_set_str "database.args.database" "${PG_DB}"
  yaml_set_str "database.args.host" "${PG_HOST}"
  yaml_set "database.args.port" "${PG_PORT}"
  yaml_set "database.args.cp_min" "5"
  yaml_set "database.args.cp_max" "10"

  echo "🐍 Verifying psycopg2 is available to Synapse's Python environment..."
  if [[ -x /opt/venvs/matrix-synapse/bin/python ]]; then
    if ! /opt/venvs/matrix-synapse/bin/python -c "import psycopg2" >/dev/null 2>&1; then
      echo "📦 psycopg2 not found in Synapse venv, installing psycopg2-binary..."
      /opt/venvs/matrix-synapse/bin/pip install psycopg2-binary
    else
      echo "✅ psycopg2 already available."
    fi
  else
    echo "⚠️  /opt/venvs/matrix-synapse/bin/python not found. If Synapse fails to start, install psycopg2 manually."
  fi

  echo "✅ PostgreSQL configured. DB: ${PG_DB} | User: ${PG_USER} | Host: ${PG_HOST}:${PG_PORT}"
}

#############################################
# Remote PostgreSQL Access (open DB to a specific IP/CIDR)
#############################################
# Lets an admin allow a single external IP (or a CIDR range) to connect
# to the Synapse PostgreSQL database, doing everything needed in one go:
#   1) listen_addresses = '*' in postgresql.conf (only if not already open)
#   2) a pg_hba.conf line scoped to exactly that IP/range (never 0.0.0.0/0
#      automatically -- the admin must type that explicitly if they really
#      want it)
#   3) a UFW rule opening 5432/tcp FROM that IP/range only (not globally)
#   4) restarts PostgreSQL and verifies it came back up
# Everything touched is snap_backup'd first, so it also shows up in the
# "Restore Last Change" (undo_menu) list.

_pg_conf_path() {
  local p
  p="$(find /etc/postgresql -maxdepth 3 -name postgresql.conf 2>/dev/null | sort -V | tail -1)"
  echo "${p}"
  return 0
}

_pg_hba_path() {
  local p
  p="$(find /etc/postgresql -maxdepth 3 -name pg_hba.conf 2>/dev/null | sort -V | tail -1)"
  echo "${p}"
  return 0
}

# Validate a bare IPv4 address or an IPv4 CIDR (e.g. 1.2.3.4 or 1.2.3.0/24)
_valid_ipv4_or_cidr() {
  local input="$1"
  local ip_re='^([0-9]{1,3})\.([0-9]{1,3})\.([0-9]{1,3})\.([0-9]{1,3})$'
  local cidr_re='^([0-9]{1,3})\.([0-9]{1,3})\.([0-9]{1,3})\.([0-9]{1,3})/([0-9]{1,2})$'
  local ip="${input%/*}"
  [[ "${input}" =~ ${ip_re} || "${input}" =~ ${cidr_re} ]] || return 1
  local IFS=.
  local -a octets=(${ip})
  local o
  for o in "${octets[@]}"; do
    (( o >= 0 && o <= 255 )) || return 1
  done
  if [[ "${input}" == */* ]]; then
    local mask="${input#*/}"
    (( mask >= 0 && mask <= 32 )) || return 1
  fi
  return 0
}

manage_remote_db_access() {
  print_header
  echo "🌍 === Allow Remote PostgreSQL Access ==="
  echo

  # Try to load config; never abort if it is missing
  load_config 2>/dev/null || true

  local pg_conf pg_hba
  pg_conf="$(_pg_conf_path)"
  pg_hba="$(_pg_hba_path)"
  if [[ -z "${pg_conf}" || -z "${pg_hba}" ]]; then
    echo "❌ Could not find postgresql.conf / pg_hba.conf."
    echo "   Make sure PostgreSQL is installed (run Install first)."
    pause
    return 1
  fi

  # Fall back to querying the live cluster when config vars are absent
  if [[ -z "${PG_DB:-}" ]]; then
    PG_DB="$(sudo -u postgres psql -tAc \
      "SELECT datname FROM pg_database WHERE datname NOT IN ('postgres','template0','template1') LIMIT 1;" \
      2>/dev/null || echo "synapse")"
  fi
  if [[ -z "${PG_USER:-}" ]]; then
    PG_USER="$(sudo -u postgres psql -tAc \
      "SELECT usename FROM pg_user WHERE usename != 'postgres' LIMIT 1;" \
      2>/dev/null || echo "synapse_user")"
  fi
  PG_PORT="${PG_PORT:-5432}"
  PG_PASS="${PG_PASS:-<see /etc/matrix-stack.conf>}"

  echo "── Current status ─────────────────────────────"
  printf "  %-18s %s\n" "DB:"   "${PG_DB} (user: ${PG_USER})"
  printf "  %-18s %s\n" "Port:" "${PG_PORT}"
  local cur_listen
  cur_listen="$(grep -E '^\s*listen_addresses\s*=' "${pg_conf}" 2>/dev/null | tail -1 || true)"
  printf "  %-18s %s\n" "listen_addresses:" "${cur_listen:-(commented out / default: localhost)}"
  echo "─────────────────────────────────────────────────"
  echo
  echo "1) ➕ Allow a new IP / CIDR range"
  echo "2) 📋 Show currently-allowed remote IPs (managed by this menu)"
  echo "3) ➖ Remove a previously-allowed IP / CIDR"
  echo "4) 🔙 Back"
  read -rp "Choose [1-4]: " ropt

  local marker="# matrix-stack-remote-db"

  case "${ropt}" in
    1)
      echo
      echo "Who should be allowed to connect?"
      echo
      echo "  1) 🎯 A single IP address        (e.g. one office/home/server IP)"
      echo "  2) 📡 A specific IP range (CIDR) (e.g. a whole office network)"
      echo "  3) 🌐 Everyone (0.0.0.0/0)        (⚠️  DANGEROUS — not recommended)"
      echo "  4) 🔙 Cancel"
      read -rp "  Choose [1-4]: " scope_choice

      local remote_ip=""
      case "${scope_choice}" in
        1)
          read -rp "  Enter the single IP address (e.g. 203.0.113.10): " remote_ip
          ;;
        2)
          echo
          echo "  ℹ️  CIDR examples: 203.0.113.0/24 (256 addresses),"
          echo "     203.0.113.0/28 (16 addresses), 10.0.0.0/8 (a whole private range)"
          read -rp "  Enter the CIDR range (e.g. 203.0.113.0/24): " remote_ip
          if [[ -n "${remote_ip}" && "${remote_ip}" != */* ]]; then
            echo "  ❌ That's a single IP, not a range. Use option 1 for a single IP,"
            echo "     or include a /prefix here (e.g. ${remote_ip}/24)."
            pause; return 0
          fi
          ;;
        3)
          remote_ip="0.0.0.0/0"
          ;;
        4|"")
          echo "Cancelled."; pause; return 0
          ;;
        *)
          echo "Invalid option."; pause; return 0
          ;;
      esac

      if [[ -z "${remote_ip}" ]]; then
        echo "❌ No input given."; pause; return 0
      fi
      if ! _valid_ipv4_or_cidr "${remote_ip}"; then
        echo "❌ '${remote_ip}' doesn't look like a valid IPv4 address or CIDR (e.g. 1.2.3.4 or 1.2.3.0/24)."
        pause; return 0
      fi
      # Normalize a bare IP to /32 for pg_hba.conf
      local cidr="${remote_ip}"
      [[ "${cidr}" != */* ]] && cidr="${cidr}/32"

      if [[ "${remote_ip}" == "0.0.0.0/0" ]]; then
        echo
        echo "⚠️  WARNING: 0.0.0.0/0 opens this database to the ENTIRE internet."
        echo "   Anyone who guesses/finds the password can reach it directly."
        read -rp "   Type YES (all caps) to confirm, anything else to cancel: " sure
        [[ "${sure}" == "YES" ]] || { echo "Cancelled."; pause; return 0; }
      fi

      echo
      echo "📦 Backing up config files before making changes..."
      snap_backup "Allow remote DB access for ${cidr}" "${pg_conf}" "${pg_hba}"

      # 1) listen_addresses
      if ! grep -qE "^\s*listen_addresses\s*=\s*'\*'" "${pg_conf}"; then
        if grep -qE "^\s*#?\s*listen_addresses\s*=" "${pg_conf}"; then
          sed -i -E "s/^\s*#?\s*listen_addresses\s*=.*/listen_addresses = '*'/" "${pg_conf}"
        else
          echo "listen_addresses = '*'" >> "${pg_conf}"
        fi
        echo "✅ listen_addresses set to '*' in $(basename "${pg_conf}")"
      else
        echo "ℹ️  listen_addresses already set to '*' — no change needed."
      fi

      # 2) pg_hba.conf entry (idempotent — skip if this exact line exists)
      local hba_line="host    ${PG_DB}    ${PG_USER}    ${cidr}    md5    ${marker}"
      if grep -qF "${cidr}    md5    ${marker}" "${pg_hba}" 2>/dev/null || \
         grep -qE "^host\s+${PG_DB}\s+${PG_USER}\s+${cidr//\//\\/}\s+md5" "${pg_hba}" 2>/dev/null; then
        echo "ℹ️  pg_hba.conf already has a rule for ${cidr} — no change needed."
      else
        echo "${hba_line}" >> "${pg_hba}"
        echo "✅ Added pg_hba.conf rule for ${cidr}"
      fi

      # 3) Firewall (UFW), scoped to this IP/range only
      if command -v ufw >/dev/null 2>&1; then
        ufw allow from "${cidr}" to any port "${PG_PORT}" proto tcp comment "matrix-stack remote DB" >/dev/null 2>&1 \
          && echo "✅ UFW: opened ${PG_PORT}/tcp from ${cidr}" \
          || echo "⚠️  UFW rule may already exist or UFW is inactive — check manually with: ufw status"
      else
        echo "ℹ️  UFW not found — make sure port ${PG_PORT}/tcp is reachable from ${cidr}"
        echo "   in whatever firewall you use (iptables / cloud provider security group)."
      fi

      # 4) Restart PostgreSQL and verify
      echo
      echo "🔄 Restarting PostgreSQL..."
      systemctl restart postgresql || true
      sleep 2
      if systemctl is-active --quiet postgresql; then
        echo "✅ PostgreSQL restarted successfully."
        echo
        echo "📋 Test the connection from the remote machine with:"
        echo "   psql -h <this-server-ip> -p ${PG_PORT} -U ${PG_USER} -d ${PG_DB}"
        echo "   Password: ${PG_PASS}"
        log_audit "Remote DB access allowed for ${cidr}"
      else
        echo "❌ PostgreSQL failed to start after the change."
        echo "   Use the 'Restore Last Change' menu to roll back this exact change,"
        echo "   or inspect: journalctl -u postgresql -n 50"
      fi
      ;;
    2)
      echo
      echo "── Rules added by this menu (marker: ${marker}) ──"
      grep -F "${marker}" "${pg_hba}" 2>/dev/null || echo "(none found)"
      echo
      if command -v ufw >/dev/null 2>&1; then
        echo "── Matching UFW rules ──"
        ufw status numbered 2>/dev/null | grep "${PG_PORT}" || echo "(none found)"
      fi
      ;;
    3)
      echo
      grep -nF "${marker}" "${pg_hba}" 2>/dev/null || { echo "No entries to remove."; pause; return 0; }
      echo
      read -rp "Enter the exact IP/CIDR to remove (as shown above): " rm_cidr
      [[ -z "${rm_cidr}" ]] && { echo "No input given."; pause; return 0; }
      snap_backup "Remove remote DB access for ${rm_cidr}" "${pg_hba}"
      sed -i "\|host\s\+${PG_DB}\s\+${PG_USER}\s\+${rm_cidr//\//\\/}\s\+md5\s\+${marker}|d" "${pg_hba}"
      if command -v ufw >/dev/null 2>&1; then
        ufw delete allow from "${rm_cidr}" to any port "${PG_PORT}" proto tcp >/dev/null 2>&1 || true
      fi
      systemctl restart postgresql || true
      sleep 2
      if systemctl is-active --quiet postgresql; then
        echo "✅ Removed access for ${rm_cidr}. PostgreSQL restarted successfully."
        log_audit "Removed remote DB access for ${rm_cidr}"
      else
        echo "❌ PostgreSQL failed to restart. Check: journalctl -u postgresql -n 50"
      fi
      ;;
    4) return 0 ;;
    *) echo "Invalid option."; sleep 1 ;;
  esac
  pause
}

#############################################
# Install / Reinstall
#############################################

# ─────────────────────────────────────────────────────────────────────────────
# Offline installation wizard
# Guides the user to provide locally-available script / package files and
# pre-fills configuration variables so the main install_stack flow can
# continue with minimal internet access.
# ─────────────────────────────────────────────────────────────────────────────
_install_stack_offline_wizard() {
  print_header
  echo "╔══════════════════════════════════════════════════════════╗"
  echo "║           📂  Offline Installation Wizard               ║"
  echo "╚══════════════════════════════════════════════════════════╝"
  echo
  echo "This wizard helps you install from local files."
  echo "You can provide some or all of the following:"
  echo
  echo "  ┌─────────────────────────────────────────────────────┐"
  echo "  │  A)  matrix-stack.conf  — saved config from a       │"
  echo "  │      previous installation (pre-fills all fields)   │"
  echo "  ├─────────────────────────────────────────────────────┤"
  echo "  │  B)  Element Web .tar.gz — offline Element package  │"
  echo "  │      (skips GitHub download)                        │"
  echo "  ├─────────────────────────────────────────────────────┤"
  echo "  │  C)  Synapse .deb packages — local apt .deb files   │"
  echo "  │      (skips matrix.org repo download)               │"
  echo "  └─────────────────────────────────────────────────────┘"
  echo

  # ── A) Existing config file ────────────────────────────────────────────────
  echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
  echo "📄  A) Do you have a saved matrix-stack.conf file?"
  echo "   (usually at /etc/matrix-stack.conf or exported from"
  echo "    a previous server)"
  echo
  read -rp "   Path to config file (or press Enter to skip): " _offline_conf

  if [[ -n "${_offline_conf}" ]]; then
    if [[ -f "${_offline_conf}" ]]; then
      # shellcheck disable=SC1090
      source "${_offline_conf}"
      echo
      echo "   ✅ Config loaded. Pre-filled values:"
      echo "      🌐 HS domain:      ${HS_DOMAIN:-<empty>}"
      echo "      🧭 Element domain: ${ELEMENT_DOMAIN:-<empty>}"
      echo "      🏠 Base domain:    ${BASE_DOMAIN:-<empty>}"
      echo "      📌 Public IP:      ${PUBLIC_IP:-<empty>}"
      echo "      ✉️  LE email:       ${LE_EMAIL:-<empty>}"
      echo "      🐘 PG database:    ${PG_DB:-<empty>}  host: ${PG_HOST:-localhost}:${PG_PORT:-5432}"
      echo
      echo "   You can change any of these in the next step."
    else
      echo "   ⚠️  File not found: ${_offline_conf} — skipping."
    fi
  else
    echo "   ⏩  Skipped."
  fi
  echo

  # ── B) Element Web offline package ────────────────────────────────────────
  echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
  echo "📦  B) Do you have an Element Web .tar.gz package locally?"
  echo "   (checks the local 'matrix_package' folder next to this script"
  echo "    first, and lets you pick a file from it, or enter a path)"
  echo

  pkgcache_resolve_offline "Element Web (.tar.gz)"

  if [[ -n "${PKGCACHE_SOURCE_PATH}" ]]; then
    export OFFLINE_ELEMENT_PKG="${PKGCACHE_SOURCE_PATH}"
    # Try to detect version from filename
    local _el_ver
    _el_ver="$(basename "${OFFLINE_ELEMENT_PKG}" | grep -oP 'v?[\d]+\.[\d]+\.[\d]+' | head -1 | tr -d 'v')"
    echo
    echo "   ✅ Element package registered: ${OFFLINE_ELEMENT_PKG}"
    [[ -n "${_el_ver}" ]] && echo "      Detected version: v${_el_ver}"
    echo "      This package will be used instead of downloading from GitHub."
  else
    echo "   ⏩  Skipped — Element will be downloaded from GitHub."
    unset OFFLINE_ELEMENT_PKG
  fi
  echo

  # ── C) Synapse .deb packages ───────────────────────────────────────────────
  echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
  echo "📦  C) Do you have Synapse .deb package(s) locally?"
  echo "   (download from https://packages.matrix.org/debian/pool/main/m/"
  echo "    place all .deb files in a single directory)"
  echo
  read -rp "   Path to directory containing .deb files (or Enter to skip): " _offline_deb_dir

  if [[ -n "${_offline_deb_dir}" ]]; then
    if [[ -d "${_offline_deb_dir}" ]]; then
      local _deb_count
      _deb_count="$(find "${_offline_deb_dir}" -maxdepth 1 -name '*.deb' | wc -l)"
      if [[ "${_deb_count}" -gt 0 ]]; then
        export OFFLINE_SYNAPSE_DEB_DIR="${_offline_deb_dir}"
        echo
        echo "   ✅ Found ${_deb_count} .deb file(s) in ${_offline_deb_dir}."
        echo "      Synapse will be installed from these local packages."
        find "${_offline_deb_dir}" -maxdepth 1 -name '*.deb' | while read -r _d; do
          echo "        • $(basename "${_d}")"
        done
      else
        echo "   ⚠️  No .deb files found in ${_offline_deb_dir} — will use online repo."
        unset OFFLINE_SYNAPSE_DEB_DIR
      fi
    else
      echo "   ⚠️  Directory not found: ${_offline_deb_dir} — will use online repo."
      unset OFFLINE_SYNAPSE_DEB_DIR
    fi
  else
    echo "   ⏩  Skipped — Synapse will be installed from matrix.org repository."
    unset OFFLINE_SYNAPSE_DEB_DIR
  fi
  echo

  # ── Summary ────────────────────────────────────────────────────────────────
  echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
  echo "📋  Offline wizard summary:"
  echo
  printf "   %-28s %s\n" "Config pre-fill:" "${_offline_conf:-(none — enter manually)}"
  printf "   %-28s %s\n" "Element Web package:" "${OFFLINE_ELEMENT_PKG:-(download from GitHub)}"
  printf "   %-28s %s\n" "Synapse .deb directory:" "${OFFLINE_SYNAPSE_DEB_DIR:-(install from matrix.org repo)}"
  echo
  echo "   Continuing to configuration…"
  echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
  echo
}

install_stack() {
  print_header
  echo "🧩 === Matrix + Element + TURN Installer (Install Mode) ==="
  echo "ℹ️  This installer uses PostgreSQL as the mandatory database backend."
  echo "ℹ️  SSL: public domains → Let's Encrypt | internal/local domains → self-signed (auto-detected)"
  echo

  # ─── Installation source wizard ──────────────────────────────────────────────
  echo "╔══════════════════════════════════════════════════════════╗"
  echo "║         📦  Installation Source Wizard                  ║"
  echo "╠══════════════════════════════════════════════════════════╣"
  echo "║  How would you like to provide installation packages?   ║"
  echo "║                                                          ║"
  echo "║  1) 🌐  Online  — download everything from internet     ║"
  echo "║         (requires internet access on this server)       ║"
  echo "║                                                          ║"
  echo "║  2) 📂  Offline — I have the script/packages locally    ║"
  echo "║         (copy files from a local path or USB drive)     ║"
  echo "╚══════════════════════════════════════════════════════════╝"
  echo
  local _install_mode="1"
  if [[ "${NON_INTERACTIVE:-}" != "true" ]]; then
    read -rp "Choose installation mode [1-2]: " _install_mode
  fi

  case "${_install_mode}" in
    2)
      _install_stack_offline_wizard
      ;;
    1|*)
      [[ "${_install_mode}" != "1" ]] && echo "⚠️  Invalid choice — defaulting to Online mode."
      echo
      echo "🌐 Online mode selected. Packages will be fetched from the internet."
      echo
      ;;
  esac

  # ─── Interactive configuration inputs ────────────────────────────────────────
  echo "╔══════════════════════════════════════════════════════════╗"
  echo "║              🔧  Server Configuration                   ║"
  echo "╚══════════════════════════════════════════════════════════╝"
  echo

  # Helper: prompt with a default value already filled in (from offline config)
  _prompt_field() {
    local prompt_text="$1"
    local var_name="$2"
    local current_val="${!var_name:-}"
    if [[ "${NON_INTERACTIVE:-}" == "true" ]]; then
      if [[ -z "${current_val}" ]]; then
        echo "❌ Error: Variable ${var_name} is empty in non-interactive mode." >&2
        exit 1
      fi
      return 0
    fi
    if [[ -n "${current_val}" ]]; then
      local user_input
      read -rp "${prompt_text} [${current_val}]: " user_input
      if [[ -n "${user_input}" ]]; then
        eval "${var_name}='${user_input}'"
      fi
      # else keep current_val
    else
      read -rp "${prompt_text}: " "${var_name?}"
    fi
  }

  _prompt_field "🌐 Matrix homeserver domain (e.g. chat.example.com)"  HS_DOMAIN
  _prompt_field "🧭 Element Web domain (e.g. app.example.com)"         ELEMENT_DOMAIN
  _prompt_field "🏠 Base domain for .well-known (e.g. example.com)"    BASE_DOMAIN
  _prompt_field "📌 Server public IP (e.g. 1.2.3.4)"                   PUBLIC_IP
  _prompt_field "✉️  Email for Let's Encrypt / notifications"           LE_EMAIL

  if [[ -z "${HS_DOMAIN}" || -z "${ELEMENT_DOMAIN}" || -z "${BASE_DOMAIN}" || -z "${PUBLIC_IP}" || -z "${LE_EMAIL}" ]]; then
    echo "❌ All fields are required. Aborting install."
    pause
    return 1
  fi

  # Detect SSL mode early so we can show it in summary
  local ssl_mode_display="Let's Encrypt (public domain)"
  if is_internal_domain "${HS_DOMAIN}" || is_internal_domain "${ELEMENT_DOMAIN}" || is_internal_domain "${BASE_DOMAIN}"; then
    ssl_mode_display="Self-signed (internal/local domain detected)"
  fi

  echo
  echo "===== INSTALL CONFIGURATION SUMMARY ====="
  echo "Matrix Homeserver:    ${HS_DOMAIN}"
  echo "Element Web:          ${ELEMENT_DOMAIN}"
  echo "Base Domain:          ${BASE_DOMAIN}"
  echo "Public IP:            ${PUBLIC_IP}"
  echo "Let's Encrypt Email:  ${LE_EMAIL}"
  echo "Database:             PostgreSQL (mandatory)"
  echo "SSL Mode:             ${ssl_mode_display}"
  echo "========================================="
  echo
  local CONFIRM="y"
  if [[ "${NON_INTERACTIVE:-}" != "true" ]]; then
    read -rp "✅ Continue with installation? (y/n): " CONFIRM
  fi
  if [[ "${CONFIRM}" != "y" && "${CONFIRM}" != "Y" ]]; then
    echo "❎ Install aborted."
    pause
    return 1
  fi

  # Snapshot anything this (re)install is about to overwrite, so it can be
  # undone from the "Restore Last Change" menu if something goes wrong.
  snap_backup "Install/Reinstall Matrix stack (${HS_DOMAIN})" \
    "${CONFIG_FILE}" "${HOMESERVER_YAML}" \
    /etc/turnserver.conf /etc/default/coturn \
    /var/www/element/config.json \
    /etc/nginx/sites-available/matrix.conf \
    /etc/nginx/sites-available/element.conf \
    /etc/nginx/sites-available/wellknown.conf

  export DEBIAN_FRONTEND=noninteractive

  # Reset the progress-bar engine for this install run.
  TOTAL_STEPS=17
  CURRENT_STEP=0
  FAILED_STEPS=()

  echo
  echo "🚀 Starting installation — ${TOTAL_STEPS} steps ahead. Full details in ${LOG_FILE}"
  echo

  # Preflight: if an existing Nginx vhost references an SSL certificate
  # file that no longer exists (e.g. left over from a previous
  # uninstall/reinstall cycle), installing/starting nginx below would
  # fail with "cannot load certificate ... No such file or directory" --
  # and that failure blocks dpkg from configuring nginx-core/nginx at
  # all, which then blocks every apt operation after it. Disable (not
  # delete) any such vhost before nginx is touched.
  _step_preflight_and_deps() {
    if [[ -d /etc/nginx/sites-enabled ]]; then
      local _vf _cert_path
      for _vf in /etc/nginx/sites-enabled/*; do
        [[ -f "${_vf}" ]] || continue
        _cert_path="$(grep -oP 'ssl_certificate\s+\K[^;]+' "${_vf}" 2>/dev/null | head -1 | tr -d ' ')" || _cert_path=""
        if [[ -n "${_cert_path}" && ! -f "${_cert_path}" ]]; then
          echo "⚠️  $(basename "${_vf}") references a missing certificate (${_cert_path})."
          echo "   Disabling it so Nginx can start; it will be recreated below once a"
          echo "   valid certificate exists."
          mv "${_vf}" "${_vf}.disabled-missing-cert" 2>/dev/null || rm -f "${_vf}"
        fi
      done
    fi

    apt update
    apt install -y \
      ca-certificates curl wget gnupg lsb-release \
      nginx certbot python3-certbot-nginx \
      coturn debconf-utils jq python3-yaml \
      postgresql postgresql-contrib openssl
  }
  run_step "📦 Updating repositories & installing prerequisites (apt)" _step_preflight_and_deps

  _step_add_synapse_repo() {
    if [[ ! -f /usr/share/keyrings/matrix-org-archive-keyring.gpg ]]; then
      wget -qO /usr/share/keyrings/matrix-org-archive-keyring.gpg \
        https://packages.matrix.org/debian/matrix-org-archive-keyring.gpg
    fi

    echo "deb [signed-by=/usr/share/keyrings/matrix-org-archive-keyring.gpg] https://packages.matrix.org/debian/ $(lsb_release -cs) main" \
      > /etc/apt/sources.list.d/matrix-org.list

    apt update
  }
  run_step "➕ Adding Matrix Synapse repository" _step_add_synapse_repo

  echo
  echo "⬇️  Checking latest versions..."

  # --- Fetch latest Element Web version from GitHub ---
  local LATEST_ELEMENT="unknown"
  if [[ -n "${OFFLINE_ELEMENT_PKG:-}" && -f "${OFFLINE_ELEMENT_PKG}" ]]; then
    LATEST_ELEMENT="$(basename "${OFFLINE_ELEMENT_PKG}" | grep -oP '[\d]+\.[\d]+\.[\d]+' | head -1)"
    echo "   📂 Offline Element package detected — version: v${LATEST_ELEMENT:-unknown}"
  else
    echo -n "   Fetching latest Element Web version... "
    if command -v curl >/dev/null 2>&1; then
      LATEST_ELEMENT="$(curl -fsS https://api.github.com/repos/element-hq/element-web/releases/latest 2>/dev/null | jq -r '.tag_name // empty' 2>/dev/null | tr -d 'v')" || LATEST_ELEMENT=""
      if [[ -n "${LATEST_ELEMENT}" && "${LATEST_ELEMENT}" != "null" ]]; then
        echo "v${LATEST_ELEMENT}"
      else
        echo "unavailable (will use default)"
        LATEST_ELEMENT="unknown"
      fi
    else
      echo "curl not available yet (will install in next step)"
    fi
  fi

  # --- Show latest Synapse version from apt ---
  if [[ -n "${OFFLINE_SYNAPSE_DEB_DIR:-}" ]]; then
    local LATEST_SYNAPSE="(local .deb — offline)"
    echo "   📂 Offline Synapse .deb directory detected — skipping apt version check."
  else
    echo -n "   Checking latest Synapse version from matrix.org repo... "
    apt update >/dev/null 2>&1
    local LATEST_SYNAPSE
    LATEST_SYNAPSE="$(apt-cache policy matrix-synapse-py3 2>/dev/null | awk '/Candidate:/{print $2}')"
    if [[ -n "${LATEST_SYNAPSE}" ]]; then
      echo "${LATEST_SYNAPSE}"
    else
      echo "unknown (will install whatever is in the repo)"
    fi
  fi

  echo
  echo "╔══════════════════════════════════════════════════════════════╗"
  echo "║  📦  Version Summary                                         ║"
  echo "╠══════════════════════════════════════════════════════════════╣"
  printf  "║   🧩 Element Web:  %-42s║\n" "v${LATEST_ELEMENT:-unknown}${OFFLINE_ELEMENT_PKG:+  (offline)}"
  printf  "║   🏠 Synapse:      %-42s║\n" "${LATEST_SYNAPSE:-unknown (from apt)}${OFFLINE_SYNAPSE_DEB_DIR:+  (offline)}"
  printf  "║   📦 Default El:   %-42s║\n" "v1.12.7 (fallback)"
  echo "╚══════════════════════════════════════════════════════════════╝"
  echo

  _step_debconf_preseed() {
    echo "matrix-synapse matrix-synapse/server-name string ${HS_DOMAIN}" | debconf-set-selections
    echo "matrix-synapse matrix-synapse/report-stats boolean false"      | debconf-set-selections
  }
  run_step "⚙️  Pre-configuring Synapse (debconf)" _step_debconf_preseed

  _step_install_synapse() {
    if [[ -n "${OFFLINE_SYNAPSE_DEB_DIR:-}" ]]; then
      echo "📂 Installing Synapse from local .deb packages in: ${OFFLINE_SYNAPSE_DEB_DIR}"
      dpkg -i "${OFFLINE_SYNAPSE_DEB_DIR}"/*.deb 2>/dev/null || true
      apt install -f -y   # fix any missing dependencies
    else
      apt install -y matrix-synapse-py3
    fi
  }
  run_step "⬇️  Installing Matrix Synapse" _step_install_synapse

  run_step "🧹 Cleaning up legacy conf.d settings" _ensure_migrated

  _pg_offer_restore_from_backup
  run_step "🐘 Setting up PostgreSQL database" setup_postgres_db

  echo "🔒 Setting up SSL certificate..."
  echo
  local ssl_choice="1"
  if [[ "${NON_INTERACTIVE:-}" == "true" ]]; then
    if [[ "${SSL_MODE:-}" == "selfsigned" ]]; then
      ssl_choice="2"
    elif [[ "${SSL_MODE:-}" == "custom" ]]; then
      ssl_choice="3"
    else
      ssl_choice="1"
    fi
  else
    read -rp "Choose [1-3]: " ssl_choice
  fi

  case "${ssl_choice}" in
    1)
      run_step "🔑 Configuring SSL (auto-detect)" setup_ssl_auto "${HS_DOMAIN}" "${ELEMENT_DOMAIN}" "${BASE_DOMAIN}" "${LE_EMAIL}"
      ;;
    2)
      run_step "🔑 Generating self-signed certificate" generate_self_signed_cert "${HS_DOMAIN}" "${ELEMENT_DOMAIN}" "${BASE_DOMAIN}"
      SSL_MODE="selfsigned"
      ;;
    3)
      echo
      echo "Provide your PEM certificate files:"
      local user_cert="${USER_CERT:-}"
      local user_key="${USER_KEY:-}"
      local user_chain="${USER_CHAIN:-}"
      if [[ "${NON_INTERACTIVE:-}" != "true" ]]; then
        read -rp "  Path to certificate / fullchain PEM: " user_cert
        read -rp "  Path to private key PEM:            " user_key
        read -rp "  Path to CA chain PEM (optional):     " user_chain
      fi
      if [[ -z "${user_cert}" || -z "${user_key}" ]]; then
        echo "❌ Certificate and key paths are required. Falling back to auto-detect..."
        run_step "🔑 Configuring SSL (auto-detect)" setup_ssl_auto "${HS_DOMAIN}" "${ELEMENT_DOMAIN}" "${BASE_DOMAIN}" "${LE_EMAIL}"
      else
        HS_DOMAIN_BAK="${HS_DOMAIN}"
        ELEMENT_DOMAIN_BAK="${ELEMENT_DOMAIN}"
        BASE_DOMAIN_BAK="${BASE_DOMAIN}"
        PUBLIC_IP_BAK="${PUBLIC_IP}"
        LE_EMAIL_BAK="${LE_EMAIL}"
        run_step "🔑 Installing custom SSL certificate" install_official_cert "${user_cert}" "${user_key}" "${user_chain:-}"
        if [[ ${LAST_STEP_STATUS} -eq 0 ]]; then
          SSL_MODE="custom"
        else
          echo "⚠️  Official cert install failed. Falling back to self-signed..."
          run_step "🔑 Generating self-signed certificate (fallback)" generate_self_signed_cert "${HS_DOMAIN}" "${ELEMENT_DOMAIN}" "${BASE_DOMAIN}"
          SSL_MODE="selfsigned"
        fi
      fi
      ;;
    *)
      echo "Invalid option. Using auto-detect..."
      run_step "🔑 Configuring SSL (auto-detect)" setup_ssl_auto "${HS_DOMAIN}" "${ELEMENT_DOMAIN}" "${BASE_DOMAIN}" "${LE_EMAIL}"
      ;;
  esac

  run_step "💾 Saving installation config" save_config "${HS_DOMAIN}" "${ELEMENT_DOMAIN}" "${BASE_DOMAIN}" "${PUBLIC_IP}" "${LE_EMAIL}" \
    "${PG_DB}" "${PG_USER}" "${PG_PASS}" "${PG_HOST}" "${PG_PORT}" "${SSL_MODE}"

  _step_configure_registration_media() {
    REG_SECRET=$(openssl rand -hex 32)
    _ensure_yq || { echo "❌ yq not available."; return 1; }
    yaml_set "enable_registration" "true"
    yaml_set "enable_registration_without_verification" "true"
    yaml_set_str "registration_shared_secret" "${REG_SECRET}"
    yaml_set_str "max_upload_size" "50M"
  }
  run_step "🧾 Configuring Synapse registration & uploads" _step_configure_registration_media

  _step_configure_turn_yaml() {
    TURN_SECRET=$(openssl rand -hex 32)
    yaml_set 'turn_uris' '["turn:'"${HS_DOMAIN}"':3478?transport=udp", "turns:'"${HS_DOMAIN}"':5349?transport=tcp"]'
    yaml_set_str "turn_shared_secret" "${TURN_SECRET}"
    yaml_set "turn_user_lifetime" "86400000"
    yaml_set "turn_allow_guests" "true"
  }
  run_step "📞 Configuring TURN for Synapse" _step_configure_turn_yaml

  _step_configure_coturn_file() {
    if grep -q "^TURNSERVER_ENABLED" /etc/default/coturn 2>/dev/null; then
      sed -i 's/^TURNSERVER_ENABLED=.*/TURNSERVER_ENABLED=1/' /etc/default/coturn
    else
      echo "TURNSERVER_ENABLED=1" >> /etc/default/coturn
    fi

  cat > /etc/turnserver.conf <<EOF
syslog
no-rfc5780
no-stun-backward-compatibility
response-origin-only-with-rfc5780

listening-port=3478
tls-listening-port=5349

listening-ip=${PUBLIC_IP}
relay-ip=${PUBLIC_IP}
external-ip=${PUBLIC_IP}

realm=${HS_DOMAIN}
server-name=${HS_DOMAIN}
fingerprint

cert=/etc/letsencrypt/live/${HS_DOMAIN}/fullchain.pem
pkey=/etc/letsencrypt/live/${HS_DOMAIN}/privkey.pem

use-auth-secret
static-auth-secret=${TURN_SECRET}

min-port=49160
max-port=49200

total-quota=100
bps-capacity=0

no-loopback-peers
no-multicast-peers

verbose
EOF

    if command -v ufw >/dev/null 2>&1; then
      echo "🔥 Opening firewall ports (UFW)..."
      ufw allow 80/tcp || true
      ufw allow 443/tcp || true
      ufw allow 3478/udp || true
      ufw allow 3478/tcp || true
      ufw allow 5349/tcp || true
      ufw allow 49160:49200/udp || true
    fi
  }
  run_step "🛰️  Configuring coturn & firewall" _step_configure_coturn_file

  _step_restart_turn_and_synapse() {
    systemctl restart coturn

    # sudo chown -R matrix-synapse:matrix-synapse /etc/matrix-synapse
    local SYNAPSE_GROUP
    SYNAPSE_GROUP=$(id -gn matrix-synapse 2>/dev/null || echo nogroup)
    chown -R matrix-synapse:"${SYNAPSE_GROUP}" /etc/matrix-synapse /var/lib/matrix-synapse

    find /etc/matrix-synapse -type d -exec chmod 750 {} \;
    find /etc/matrix-synapse -type f -exec chmod 640 {} \;

    systemctl restart matrix-synapse
    sleep 2
  }
  run_step "🔄 Restarting TURN & Synapse (permissions)" _step_restart_turn_and_synapse

  if systemctl is-active --quiet matrix-synapse; then
    echo "✅ matrix-synapse is running."
  else
    echo "❌ matrix-synapse FAILED to start after install!"
    echo "   Most common cause: file/permission problems on /etc/matrix-synapse"
    echo "   or /var/lib/matrix-synapse, or a config error introduced above."
    echo
    echo "── Last 30 log lines (journalctl -u matrix-synapse) ──────────"
    journalctl -u matrix-synapse -n 30 --no-pager 2>/dev/null | sed 's/^/   /'
    echo "────────────────────────────────────────────────────────────"
    echo
    echo "   Element Web will show 'Cannot reach homeserver' until this is"
    echo "   fixed. Try: menu option 27 (Fix Synapse permissions), then"
    echo "   option 25 (Health Check). The install will continue below so"
    echo "   Element Web still gets set up, but Synapse itself is DOWN."
    FAILED_STEPS+=("Starting matrix-synapse (service failed to come up — check the log)")
    pause
  fi

  mkdir -p /var/www
  cd /var/www

  # ── Determine which Element version to install (interactive) ─────────────
  ELEMENT_SOURCE_PATH=""
  ELEMENT_NEEDS_DOWNLOAD="yes"
  ELEMENT_DOWNLOAD_TARGET=""

  echo
  echo "╔══════════════════════════════════════════════════════════════╗"
  echo "║  📥  Choose how to install Element Web                       ║"
  echo "╠══════════════════════════════════════════════════════════════╣"
  echo "║   1)  🌐  Online   — automatic download from GitHub          ║"
  echo "║   2)  📁  Offline  — use an element-web tar.gz file          ║"
  echo "║                       you have already copied to the server  ║"
  echo "╚══════════════════════════════════════════════════════════════╝"
  echo

  local element_install_mode=""
  if [[ -n "${OFFLINE_ELEMENT_PKG:-}" && -f "${OFFLINE_ELEMENT_PKG:-}" ]]; then
    echo "📂 An offline Element Web package was already selected earlier:"
    echo "   ${OFFLINE_ELEMENT_PKG}"
    if [[ "${NON_INTERACTIVE:-}" != "true" ]]; then
      read -rp "   Use this file? (y/n) [y]: " use_prev_offline
      if [[ "${use_prev_offline:-y}" == "y" || "${use_prev_offline:-y}" == "Y" ]]; then
        element_install_mode="offline"
        ELEMENT_SOURCE_PATH="${OFFLINE_ELEMENT_PKG}"
      fi
    else
      element_install_mode="offline"
      ELEMENT_SOURCE_PATH="${OFFLINE_ELEMENT_PKG}"
    fi
    echo
  fi

  if [[ -z "${element_install_mode}" ]]; then
    if [[ "${NON_INTERACTIVE:-}" == "true" ]]; then
      element_install_mode="online"
    else
      while true; do
        read -rp "   Choose [1]: " element_install_mode
        element_install_mode="${element_install_mode:-1}"
        case "${element_install_mode}" in
          1|online|Online) element_install_mode="online"; break ;;
          2|offline|Offline) element_install_mode="offline"; break ;;
          *) echo "❌ Invalid option. Please enter 1 or 2." ;;
        esac
      done
    fi
  fi

  if [[ "${element_install_mode}" == "offline" && -z "${ELEMENT_SOURCE_PATH}" ]]; then
    echo
    echo "📁 === Offline install ==="
    echo "   Checks the local 'matrix_package' folder next to this script first"
    echo "   and lets you pick a file from it. If that folder doesn't exist,"
    echo "   you'll be asked for the full path to an element-web tar.gz you"
    echo "   already transferred to this server (via scp / sftp / WinSCP)."
    echo "   Get it from: https://github.com/element-hq/element-web/releases"
    echo

    while true; do
      pkgcache_resolve_offline "Element Web (.tar.gz)" "no"
      if [[ -z "${PKGCACHE_SOURCE_PATH}" ]]; then
        continue
      fi
      ELEMENT_SOURCE_PATH="${PKGCACHE_SOURCE_PATH/#\~/$HOME}"

      if [[ -d "${ELEMENT_SOURCE_PATH}" ]]; then
        echo "❌ That path is a directory, not a file. Enter the path to the element-web tar.gz file."
        ELEMENT_SOURCE_PATH=""
        continue
      fi
      if [[ ! -r "${ELEMENT_SOURCE_PATH}" ]]; then
        echo "❌ The file is not readable (permission issue). Fix it with 'chmod +r'."
        ELEMENT_SOURCE_PATH=""
        continue
      fi
      if ! tar -tzf "${ELEMENT_SOURCE_PATH}" >/dev/null 2>&1; then
        echo "❌ That file is not a valid tar.gz archive, or it's corrupted."
        echo "   Re-download the file from the release page and try again."
        ELEMENT_SOURCE_PATH=""
        continue
      fi
      break
    done
  fi

  if [[ -n "${ELEMENT_SOURCE_PATH}" ]]; then
    # Offline path: local file already selected above (either reused from
    # the earlier global offline wizard, or picked from matrix_package /
    # a manual path just now).
    ELEMENT_NEEDS_DOWNLOAD="no"
    local _detected_ver
    _detected_ver="$(basename "${ELEMENT_SOURCE_PATH}" | grep -oP '[\d]+\.[\d]+\.[\d]+' | head -1)"
    local default_ver="${_detected_ver:-${ELEMENT_VERSION:-manual}}"
    echo
    if [[ "${NON_INTERACTIVE:-}" != "true" ]]; then
      read -rp "Version label to store in the config (optional) [${default_ver}]: " in_el_ver
      ELEMENT_VERSION="${in_el_ver:-${default_ver}}"
    else
      ELEMENT_VERSION="${default_ver}"
    fi
  else
    # Online path: pick a version, then check the local matrix_package
    # cache before downloading anything (reuse an existing file, or
    # download a fresh one).
    ELEMENT_VERSION="1.12.7"
    [[ -n "${LATEST_ELEMENT:-}" && "${LATEST_ELEMENT}" != "unknown" ]] && ELEMENT_VERSION="${LATEST_ELEMENT}"
    echo
    echo "🔎 Checking latest Element Web release..."
    echo "   Latest available: v${LATEST_ELEMENT:-unknown}"
    if [[ "${NON_INTERACTIVE:-}" != "true" ]]; then
      read -rp "Version to install [${ELEMENT_VERSION}]: " custom_ver
      ELEMENT_VERSION="${custom_ver:-${ELEMENT_VERSION}}"
    fi

    echo
    echo "╔══════════════════════════════════════════════════════════════╗"
    echo "║  🔍  Checking local cache for Element Web v${ELEMENT_VERSION}     "
    echo "╚══════════════════════════════════════════════════════════════╝"
    pkgcache_resolve_online "Element Web v${ELEMENT_VERSION}" "element-v${ELEMENT_VERSION}.tar.gz"
    if [[ -n "${PKGCACHE_SOURCE_PATH}" ]]; then
      ELEMENT_SOURCE_PATH="${PKGCACHE_SOURCE_PATH}"
      ELEMENT_NEEDS_DOWNLOAD="no"
    else
      ELEMENT_NEEDS_DOWNLOAD="yes"
      ELEMENT_DOWNLOAD_TARGET="${PKGCACHE_DOWNLOAD_TARGET}"
    fi
  fi

  _step_install_element() {
    # ── Local package (offline choice, or reused from matrix_package cache) ──
    if [[ "${ELEMENT_NEEDS_DOWNLOAD}" == "no" ]]; then
      echo "📂 Using local Element Web package: ${ELEMENT_SOURCE_PATH}"
      cp "${ELEMENT_SOURCE_PATH}" /var/www/element.tar.gz
      # detect version from filename
      local _detected_ver
      _detected_ver="$(basename "${ELEMENT_SOURCE_PATH}" | grep -oP '[\d]+\.[\d]+\.[\d]+' | head -1)"
      [[ -n "${_detected_ver}" ]] && ELEMENT_VERSION="${_detected_ver}"
      [[ -z "${ELEMENT_VERSION:-}" ]] && ELEMENT_VERSION="offline"
      rm -rf element || true
      tar -xvf element.tar.gz
      # handle both element-vX.Y.Z/ and element/ directory names
      if [[ -d "element-v${ELEMENT_VERSION}" ]]; then
        mv "element-v${ELEMENT_VERSION}" element
      elif [[ ! -d "element" ]]; then
        mv element-v* element 2>/dev/null || true
      fi
      rm -f element.tar.gz
      echo "✅ Element Web v${ELEMENT_VERSION} installed from local package."
    else
      # ── Online Element download (saved into matrix_package for reuse) ──
      echo "⬇️  Downloading Element Web v${ELEMENT_VERSION} into matrix_package cache..."
      echo "   Target: ${ELEMENT_DOWNLOAD_TARGET}"
      if wget -O "${ELEMENT_DOWNLOAD_TARGET}" "https://github.com/element-hq/element-web/releases/download/v${ELEMENT_VERSION}/element-v${ELEMENT_VERSION}.tar.gz"; then
        cp "${ELEMENT_DOWNLOAD_TARGET}" element.tar.gz
        rm -rf element || true
        tar -xvf element.tar.gz
        mv "element-v${ELEMENT_VERSION}" element
        rm element.tar.gz
        echo "✅ Downloaded and cached at: ${ELEMENT_DOWNLOAD_TARGET}"
      else
        rm -f "${ELEMENT_DOWNLOAD_TARGET}"
        echo "❌ Failed to download Element Web v${ELEMENT_VERSION}."
        echo "   Trying fallback: v1.12.7..."
        ELEMENT_VERSION="1.12.7"
        ELEMENT_DOWNLOAD_TARGET="${PACKAGE_CACHE_DIR}/element-v${ELEMENT_VERSION}.tar.gz"
        if wget -O "${ELEMENT_DOWNLOAD_TARGET}" "https://github.com/element-hq/element-web/releases/download/v${ELEMENT_VERSION}/element-v${ELEMENT_VERSION}.tar.gz"; then
          cp "${ELEMENT_DOWNLOAD_TARGET}" element.tar.gz
          rm -rf element || true
          tar -xvf element.tar.gz
          mv "element-v${ELEMENT_VERSION}" element
          rm element.tar.gz
          echo "✅ Downloaded and cached at: ${ELEMENT_DOWNLOAD_TARGET}"
        else
          rm -f "${ELEMENT_DOWNLOAD_TARGET}"
          echo "❌ Fallback download also failed. Element Web installation skipped."
          echo "   You can install it later from the Updates menu (option 14)."
          return 1
        fi
      fi
    fi
  }
  run_step "🧩 Installing Element Web (download/extract)" _step_install_element

  _step_element_config() {
    cat > /var/www/element/config.json <<EOF
{
  "default_server_config": {
    "m.homeserver": {
      "base_url": "https://${HS_DOMAIN}",
      "server_name": "${HS_DOMAIN}"
    }
  },
  "disable_custom_urls": false,
  "disable_guests": true,
  "brand": "Element",
  "settingDefaults": {
    "features": {
      "feature_e2ee": false
    }
  }
}
EOF
    chmod 644 /var/www/element/config.json
  }
  run_step "🛠️  Creating Element config (config.json)" _step_element_config

  _step_nginx_vhosts() {
    cat > /etc/nginx/sites-available/matrix.conf <<EOF
server {
    listen 80;
    server_name ${HS_DOMAIN};
    return 301 https://\$host\$request_uri;
}
server {
    listen 443 ssl http2;
    server_name ${HS_DOMAIN};

    ssl_certificate /etc/letsencrypt/live/${HS_DOMAIN}/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/${HS_DOMAIN}/privkey.pem;

    client_max_body_size 50M;

    location / {
        proxy_pass http://127.0.0.1:8008;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        proxy_set_header Host \$host;
    }
}
EOF

  ln -sf /etc/nginx/sites-available/matrix.conf /etc/nginx/sites-enabled/matrix.conf

  cat > /etc/nginx/sites-available/element.conf <<EOF
server {
    listen 80;
    server_name ${ELEMENT_DOMAIN};
    return 301 https://\$host\$request_uri;
}
server {
    listen 443 ssl http2;
    server_name ${ELEMENT_DOMAIN};

    ssl_certificate /etc/letsencrypt/live/${HS_DOMAIN}/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/${HS_DOMAIN}/privkey.pem;

    root /var/www/element;
    index index.html;

    location / {
        try_files \$uri \$uri/ =404;
    }
}
EOF

  ln -sf /etc/nginx/sites-available/element.conf /etc/nginx/sites-enabled/element.conf

  cat > /etc/nginx/sites-available/wellknown.conf <<EOF
server {
    listen 80;
    server_name ${BASE_DOMAIN};
    return 301 https://\$host\$request_uri;
}
server {
    listen 443 ssl http2;
    server_name ${BASE_DOMAIN};

    ssl_certificate /etc/letsencrypt/live/${HS_DOMAIN}/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/${HS_DOMAIN}/privkey.pem;

    location = /.well-known/matrix/client {
        add_header Access-Control-Allow-Origin *;
        add_header Content-Type application/json;
        # E2EE state (io.element.e2ee.force_disable) is managed at runtime
        # by option 35 (E2EE Management) -- not hardcoded here at install time.
        return 200 '{"m.homeserver":{"base_url":"https://${HS_DOMAIN}"}}';
    }

    location = /.well-known/matrix/server {
        add_header Content-Type application/json;
        return 200 '{"m.server":"${HS_DOMAIN}:443"}';
    }

    location / {
        return 404;
    }
}
EOF

  ln -sf /etc/nginx/sites-available/wellknown.conf /etc/nginx/sites-enabled/wellknown.conf

  rm -f /etc/nginx/sites-enabled/default || true
  }
  run_step "🌍 Creating Nginx virtual hosts" _step_nginx_vhosts

  run_step "🌍 Testing & reloading Nginx" bash -c 'nginx -t && systemctl reload nginx'

  # Let the server resolve its own internal/.local-style domains -- otherwise
  # self-checks like Health Check falsely report "Cannot reach ..." even
  # though the service is fine and reachable from every real client.
  run_step "🌐 Setting up internal domain resolution (/etc/hosts)" ensure_local_hosts_entries "${HS_DOMAIN}" "${ELEMENT_DOMAIN}" "${BASE_DOMAIN}"

  log_audit "Install completed for ${HS_DOMAIN} (PostgreSQL DB: ${PG_DB}, SSL: ${SSL_MODE})"

  print_install_summary

  if [[ "${NON_INTERACTIVE:-}" == "true" ]]; then
    if [[ "${LDAP_NOW}" == "y" || "${LDAP_NOW}" == "Y" || -n "${LDAP_URI}" ]]; then
      configure_ldap_noninteractive
    fi
  else
    echo
    echo "🔐 Optional: LDAP Authentication"
    read -rp "Do you want to configure LDAP authentication now? (y/n): " LDAP_NOW
    if [[ "${LDAP_NOW}" == "y" || "${LDAP_NOW}" == "Y" ]]; then
      configure_ldap_interactive
    else
      echo "ℹ️  You can configure LDAP later from the main menu (LDAP Management)."
    fi
  fi

  echo
  echo "========================================="
  if [[ "${#FAILED_STEPS[@]}" -eq 0 ]]; then
    echo "✅ INSTALLATION COMPLETE"
  else
    echo "⚠️  INSTALLATION FINISHED WITH ${#FAILED_STEPS[@]} ISSUE(S) — see summary above"
  fi
  echo "-----------------------------------------"
  echo "Matrix Server: https://${HS_DOMAIN}"
  echo "Element Web:   https://${ELEMENT_DOMAIN}"
  echo "Well-known:    https://${BASE_DOMAIN}"
  echo
  echo "SSL Mode:           ${SSL_MODE}"
  if [[ "${SSL_MODE}" == "selfsigned" ]]; then
    echo "⚠️  One-time step to remove the browser warning org-wide:"
    echo "   Import /etc/matrix-ca/ca.crt into your trusted root store"
    echo "   (AD Group Policy / MDM / OS keychain). This also covers every"
    echo "   certificate this script issues in the future."
  fi
  echo
  echo "Registration Secret: ${REG_SECRET}"
  echo "TURN Secret:        ${TURN_SECRET}"
  echo
  echo "PostgreSQL DB:       ${PG_DB}"
  echo "PostgreSQL User:     ${PG_USER}"
  echo "PostgreSQL Password: ${PG_PASS}"
  echo "(Saved with chmod 600 in ${CONFIG_FILE})"
  echo
  echo "Log file:           ${LOG_FILE}"
  echo "Arch:               $(detect_arch)"
  echo
  echo "💡 Next steps available from the main menu:"
  echo "   - LDAP Management (configure/enable/disable/test)"
  echo "   - Security Hardening (fail2ban, rate limiting, audit log)"
  echo "   - Workers / Scaling (Redis-based replication)"
  echo "   - Monitoring (Prometheus + node_exporter)"
  echo "   - SSL Management (view cert, fix, regenerate)"
  echo "   - Show Connection Info (all details at a glance)"
  echo "========================================="
  echo

  pause
}

#############################################
# User Management
#############################################

create_admin_user() {
  print_header
  echo "👑 === Create ADMIN user ==="
  echo "Command:"
  echo "  register_new_matrix_user -c /etc/matrix-synapse/homeserver.yaml -a http://localhost:8008"
  echo
  register_new_matrix_user \
    -c /etc/matrix-synapse/homeserver.yaml \
    -a \
    http://localhost:8008
  log_audit "Admin user creation invoked (interactive)"
  pause
}

create_normal_user() {
  print_header
  echo "👤 === Create NORMAL user ==="
  echo "Command:"
  echo "  register_new_matrix_user -c /etc/matrix-synapse/homeserver.yaml --no-admin http://localhost:8008"
  echo
  register_new_matrix_user \
    -c /etc/matrix-synapse/homeserver.yaml \
    --no-admin \
    http://localhost:8008
  log_audit "Normal user creation invoked (interactive)"
  pause
}

create_user_random_password() {
  print_header
  echo "🎲 === Create user with RANDOM password ==="
  echo "This will generate a strong password and print it at the end."
  echo
  if ! load_config; then
    echo "⚠️  Config not found at ${CONFIG_FILE}. Run Install first."
    pause
    return 1
  fi

  read -rp "Enter username (localpart, e.g. vahid): " LOCALPART
  if [[ -z "${LOCALPART}" ]]; then
    echo "❌ Username is required."
    pause
    return 1
  fi

  echo "Choose role:"
  echo "1) Normal user"
  echo "2) Admin user"
  read -rp "Choose [1-2]: " ROLE

  local PASS
  PASS="$(openssl rand -base64 18 | tr -d '\n' | tr -d '=' | tr '/+' 'Aa')"

  local TMPPASS
  TMPPASS="$(mktemp)"
  printf "%s" "${PASS}" > "${TMPPASS}"

  if [[ "${ROLE}" == "2" ]]; then
    register_new_matrix_user \
      -u "${LOCALPART}" \
      --password-file "${TMPPASS}" \
      -a \
      -c /etc/matrix-synapse/homeserver.yaml \
      http://localhost:8008
    echo
    echo "✅ Created ADMIN user:"
  else
    register_new_matrix_user \
      -u "${LOCALPART}" \
      --password-file "${TMPPASS}" \
      --no-admin \
      -c /etc/matrix-synapse/homeserver.yaml \
      http://localhost:8008
    echo
    echo "✅ Created NORMAL user:"
  fi

  rm -f "${TMPPASS}" || true

  echo "MXID:     @${LOCALPART}:${HS_DOMAIN}"
  echo "Password: ${PASS}"
  echo
  echo "Tip: Save this password now."
  log_audit "Created user @${LOCALPART}:${HS_DOMAIN} (role=${ROLE})"
  pause
}

reactivate_user() {
  print_header
  echo "♻️  === Reactivate existing user (set new password) ==="
  echo "Tip: If the user was deactivated, this will re-enable it."
  echo "Command uses --exists-ok."
  echo
  echo "Choose reactivation type:"
  echo "1) Reactivate as NORMAL user"
  echo "2) Reactivate as ADMIN user"
  echo "3) Back"
  read -rp "Choose [1-3]: " ROPT

  case "${ROPT}" in
    1)
      register_new_matrix_user \
        --exists-ok \
        -c /etc/matrix-synapse/homeserver.yaml \
        --no-admin \
        http://localhost:8008
      log_audit "Reactivated user as NORMAL (interactive)"
      ;;
    2)
      register_new_matrix_user \
        --exists-ok \
        -c /etc/matrix-synapse/homeserver.yaml \
        -a \
        http://localhost:8008
      log_audit "Reactivated user as ADMIN (interactive)"
      ;;
    3) ;;
    *) echo "Invalid option." ;;
  esac

  pause
}

#############################################
# User Listing / Deactivation (PostgreSQL)
#############################################

list_users() {
  print_header
  echo "📋 === List users (PostgreSQL) ==="

  if ! load_config; then
    echo "⚠️  Config not found at ${CONFIG_FILE}. Run Install first."
    pause
    return 1
  fi

  ensure_pg_client

  echo "Format: MXID | admin(1/0) | deactivated(1/0)"
  echo "-------------------------------------------"
  PGPASSWORD="${PG_PASS}" psql -h "${PG_HOST}" -p "${PG_PORT}" -U "${PG_USER}" -d "${PG_DB}" -t -c \
    "SELECT name || ' | ' || admin || ' | ' || deactivated FROM users ORDER BY name;"

  pause
}

deactivate_user() {
  print_header
  echo "🚫 === Deactivate user (safe) ==="
  echo "This will:"
  echo " - Set deactivated=1"
  echo " - Clear password_hash"
  echo "It does NOT hard-delete messages/rooms (recommended)."
  echo
  read -rp "Enter full MXID (e.g. @user:example.com): " MXID

  if [[ ! "${MXID}" =~ ^@[a-zA-Z0-9._=/-]+:[a-zA-Z0-9.-]+$ ]]; then
    echo "❌ Invalid MXID format. Expected: @user:domain"
    pause
    return 1
  fi

  if ! load_config; then
    echo "⚠️  Config not found at ${CONFIG_FILE}. Run Install first."
    pause
    return 1
  fi

  ensure_pg_client

  read -rp "Are you sure you want to deactivate ${MXID}? (y/n): " CONFIRM
  if [[ "${CONFIRM}" != "y" && "${CONFIRM}" != "Y" ]]; then
    echo "Cancelled."
    pause
    return 0
  fi

  PGPASSWORD="${PG_PASS}" psql -h "${PG_HOST}" -p "${PG_PORT}" -U "${PG_USER}" -d "${PG_DB}" -c \
    "UPDATE users SET deactivated=1, password_hash=NULL WHERE name='${MXID}';"

  echo "✅ User ${MXID} has been deactivated."
  echo "Tip: Use Reactivate to enable it again and set a new password."
  log_audit "Deactivated user ${MXID}"
  pause
}

#############################################
# Upload limits management
#############################################

set_upload_limits() {
  print_header
  echo "📦 === Upload Limits Manager ==="
  echo "This option will set BOTH:"
  echo " - Nginx client_max_body_size (Matrix vhost)"
  echo " - Synapse max_upload_size"
  echo
  echo "Enter size in MB (e.g. 500, 2000, 5000)."
  read -rp "Upload limit (MB): " LIMIT_MB

  if [[ -z "${LIMIT_MB}" || ! "${LIMIT_MB}" =~ ^[0-9]+$ ]]; then
    echo "❌ Please enter a numeric value (MB)."
    pause
    return 1
  fi

  local LIMIT_NGINX="${LIMIT_MB}M"
  local LIMIT_SYNAPSE="${LIMIT_MB}M"

  if ! load_config; then
    echo "⚠️  Config not found at ${CONFIG_FILE}."
    echo "Run Install first so domains are known."
    pause
    return 1
  fi

  echo "✅ Setting Nginx upload limit to: ${LIMIT_NGINX}"
  if [[ -f /etc/nginx/sites-available/matrix.conf ]]; then
    snap_backup "Set upload limit to ${LIMIT_MB}MB" /etc/nginx/sites-available/matrix.conf
    if grep -q "client_max_body_size" /etc/nginx/sites-available/matrix.conf; then
      sed -i "s/client_max_body_size.*/client_max_body_size ${LIMIT_NGINX};/g" /etc/nginx/sites-available/matrix.conf
    else
      sed -i "/ssl_certificate_key/a\\
\\
    client_max_body_size ${LIMIT_NGINX};\\
" /etc/nginx/sites-available/matrix.conf
    fi
  else
    echo "❌ /etc/nginx/sites-available/matrix.conf not found."
    pause
    return 1
  fi

  echo "✅ Setting Synapse upload limit to: ${LIMIT_SYNAPSE}"
  _apply_upload_limit() {
    yaml_set_str "max_upload_size" "${LIMIT_SYNAPSE}"
  }
  yaml_transaction "Set upload limit to ${LIMIT_SYNAPSE}" _apply_upload_limit
  log_audit "Upload limit set to ${LIMIT_MB}MB (Nginx + Synapse)"
  pause
}

#############################################
# Toggle registration ON/OFF
#############################################

toggle_registration() {
  print_header
  echo "🧾 === Toggle Registration (ON/OFF) ==="
  echo "If OFF: users cannot sign up in Element (web/mobile)."
  echo "You can still create users via this script."
  echo

  _ensure_migrated

  local current="unknown"
  if yaml_exists "enable_registration"; then
    current="$(yaml_get "enable_registration" 2>/dev/null)" || current="unknown"
  fi

  echo "Current enable_registration: ${current}"
  echo
  echo "1) Turn ON registration"
  echo "2) Turn OFF registration"
  echo "3) Back"
  read -rp "Choose [1-3]: " opt

  case "${opt}" in
    1)
      yaml_set "enable_registration" "true"
      log_audit "Registration turned ON"
      ;;
    2)
      yaml_set "enable_registration" "false"
      log_audit "Registration turned OFF"
      ;;
    3) ;;
    *) echo "Invalid option." ;;
  esac

  systemctl restart matrix-synapse || true
  echo "✅ Updated. Synapse restarted."
  pause
}

#############################################
# LDAP Authentication Management
#############################################

write_ldap_yaml() {
  local enabled="$1"
  _ensure_migrated

  # Set LDAP module configuration
  yaml_set 'modules[0].module' '"ldap_auth_provider.LdapAuthProviderModule"'
  yaml_set "modules[0].config.enabled" "${enabled}"
  yaml_set_str "modules[0].config.mode" "${LDAP_MODE}"
  yaml_set_str "modules[0].config.uri" "${LDAP_URI}"
  yaml_set "modules[0].config.start_tls" "${LDAP_START_TLS}"
  yaml_set_str "modules[0].config.base" "${LDAP_BASE}"

  # Attributes
  yaml_set_str "modules[0].config.attributes.uid" "${LDAP_UID_ATTR}"
  yaml_set_str "modules[0].config.attributes.mail" "${LDAP_MAIL_ATTR}"
  yaml_set_str "modules[0].config.attributes.name" "${LDAP_NAME_ATTR}"

  if [[ -n "${LDAP_BIND_DN}" ]]; then
    yaml_set_str "modules[0].config.bind_dn" "${LDAP_BIND_DN}"
    yaml_set_str "modules[0].config.bind_password" "${LDAP_BIND_PASSWORD}"
  else
    # Remove bind credentials if not needed
    _ensure_yq
    "${YQ_BIN}" e 'del(.modules[0].config.bind_dn) | del(.modules[0].config.bind_password)' -i "${HOMESERVER_YAML}" 2>/dev/null
  fi

  # User directory: make LDAP-authenticated users searchable in Element's
  # "Start Chat" dialog once they've logged in at least once. (Synapse's
  # user_directory only supports "enabled" and "search_all_users" -- it
  # indexes its own local user DB, it does not query LDAP live. There is
  # no such thing as user_directory.search_base_dn/search_filter/
  # search_attributes in Synapse; those keys did nothing and are removed.)
  if [[ "${enabled}" == "true" ]]; then
    yaml_set "user_directory.enabled" "true"
    yaml_set "user_directory.search_all_users" "true"
  fi

  fix_synapse_perms
}

configure_ldap_noninteractive() {
  echo "🔐 === Configuring LDAP / Active Directory Authentication ==="
  LDAP_URI="${LDAP_URI:-}"
  LDAP_BASE="${LDAP_BASE:-${LDAP_BASE_DC:-}}"
  LDAP_BIND_DN="${LDAP_BIND_DN:-}"
  LDAP_BIND_PASSWORD="${LDAP_BIND_PASSWORD:-${LDAP_BIND_PASS:-}}"
  LDAP_MODE="${LDAP_MODE:-search}"
  LDAP_START_TLS="${LDAP_START_TLS:-false}"
  LDAP_UID_ATTR="${LDAP_UID_ATTR:-sAMAccountName}"
  LDAP_MAIL_ATTR="${LDAP_MAIL_ATTR:-mail}"
  LDAP_NAME_ATTR="${LDAP_NAME_ATTR:-displayName}"

  if [[ -n "${LDAP_URI}" && -n "${LDAP_BASE}" ]]; then
    save_ldap_config
    write_ldap_yaml "true"
    echo "🐍 Verifying matrix-synapse-ldap3 is available to Synapse..."
    if [[ -x /opt/venvs/matrix-synapse/bin/python ]]; then
      if ! /opt/venvs/matrix-synapse/bin/python -c "import ldap3" >/dev/null 2>&1; then
        echo "   Installing matrix-synapse-ldap3..."
        /opt/venvs/matrix-synapse/bin/pip install matrix-synapse-ldap3 || true
      fi
    fi
    echo "✅ LDAP configuration successfully applied."
    systemctl restart matrix-synapse || true
  else
    echo "ℹ️ LDAP_URI or LDAP_BASE missing. Skipping non-interactive LDAP configuration."
  fi
}

configure_ldap_interactive() {
  print_header
  echo "🔐 === Configure LDAP Authentication ==="
  echo "This lets users log into Matrix using their existing LDAP/Active Directory credentials."
  echo

  read -rp "LDAP server URI (e.g. ldap://ldap.example.com:389 or ldaps://...): " LDAP_URI
  read -rp "Base DN (e.g. ou=users,dc=example,dc=com): " LDAP_BASE

  if [[ -z "${LDAP_URI}" || -z "${LDAP_BASE}" ]]; then
    echo "❌ URI and Base DN are required."
    pause
    return 1
  fi

  read -rp "Use STARTTLS? (y/n): " STARTTLS_ANS
  if [[ "${STARTTLS_ANS}" == "y" || "${STARTTLS_ANS}" == "Y" ]]; then
    ensure_ldap_utils
    echo "🧪 Testing StartTLS against ${LDAP_URI}..."
    if ldapsearch -x -H "${LDAP_URI}" -ZZ -b "" -s base >/dev/null 2>&1; then
      echo "✅ StartTLS works."
      LDAP_START_TLS="true"
    else
      echo "❌ StartTLS FAILED against this server (it likely has no valid TLS"
      echo "   certificate bound to its LDAP service -- common on AD domain"
      echo "   controllers that were never set up for LDAPS)."
      echo "   If you save start_tls=true anyway, EVERY login will silently"
      echo "   fail with a generic 'Invalid username or password' error and"
      echo "   nothing useful will appear in Synapse's logs -- this exact"
      echo "   failure mode is very hard to diagnose after the fact."
      read -rp "   Fall back to plain (unencrypted) LDAP instead? (y/n): " FALLBACK_ANS
      if [[ "${FALLBACK_ANS}" == "y" || "${FALLBACK_ANS}" == "Y" ]]; then
        LDAP_START_TLS="false"
      else
        LDAP_START_TLS="true"
        echo "⚠️  Keeping start_tls=true as requested -- logins will fail until"
        echo "   your LDAP server's TLS is fixed or you disable start_tls."
      fi
    fi
  else
    LDAP_START_TLS="false"
  fi

  echo
  echo "Does your LDAP server require a service/bind account to search for users? (recommended)"
  read -rp "Use a bind/service account? (y/n): " BIND_ANS
  if [[ "${BIND_ANS}" == "y" || "${BIND_ANS}" == "Y" ]]; then
    LDAP_MODE="search"
    read -rp "Bind DN (e.g. cn=svc-matrix,dc=example,dc=com): " LDAP_BIND_DN
    read -rsp "Bind password: " LDAP_BIND_PASSWORD
    echo
  else
    LDAP_MODE="simple"
    LDAP_BIND_DN=""
    LDAP_BIND_PASSWORD=""
  fi

  echo
  echo "Is this an Active Directory server?"
  echo "(AD entries usually do NOT have a 'uid' attribute populated -- if you"
  echo " pick 'uid' on AD, every login will fail with a generic wrong"
  echo " username/password error no matter what credentials you try, because"
  echo " the search simply finds no matching user. sAMAccountName is the"
  echo " correct attribute for AD in almost all cases.)"
  read -rp "Active Directory? (y/n): " IS_AD
  local uid_default="uid"
  if [[ "${IS_AD}" == "y" || "${IS_AD}" == "Y" ]]; then
    uid_default="sAMAccountName"
  fi

  read -rp "LDAP attribute for username [default: ${uid_default}]: " LDAP_UID_ATTR
  LDAP_UID_ATTR="${LDAP_UID_ATTR:-${uid_default}}"
  read -rp "LDAP attribute for email [default: mail]: " LDAP_MAIL_ATTR
  LDAP_MAIL_ATTR="${LDAP_MAIL_ATTR:-mail}"
  read -rp "LDAP attribute for display name [default: cn]: " LDAP_NAME_ATTR
  LDAP_NAME_ATTR="${LDAP_NAME_ATTR:-cn}"

  save_ldap_config
  write_ldap_yaml "true"

  echo "🐍 Verifying matrix-synapse-ldap3 is available to Synapse..."
  if [[ -x /opt/venvs/matrix-synapse/bin/python ]]; then
    if ! /opt/venvs/matrix-synapse/bin/python -c "import ldap3" >/dev/null 2>&1; then
      echo "   matrix-synapse-ldap3 not found in Synapse venv, installing..."
      /opt/venvs/matrix-synapse/bin/pip install matrix-synapse-ldap3
    else
      echo "✅ matrix-synapse-ldap3 already available."
    fi
  else
    echo "⚠️  Synapse venv not found. Install matrix-synapse-ldap3 manually."
  fi

  echo
  echo "🧪 Testing LDAP connectivity..."
  test_ldap_connection_silent

  echo "🔄 Restarting Synapse..."
  systemctl restart matrix-synapse

  log_audit "LDAP configured/updated (uri=${LDAP_URI}, mode=${LDAP_MODE})"
  echo "✅ LDAP configuration saved and enabled."
  pause
}

toggle_ldap() {
  print_header
  echo "🔁 === Enable / Disable LDAP ==="
  if ! load_ldap_config; then
    echo "⚠️  LDAP is not configured yet. Use 'Configure LDAP' first."
    pause
    return 1
  fi

  echo "1) Enable LDAP"
  echo "2) Disable LDAP"
  echo "3) Back"
  read -rp "Choose [1-3]: " opt
  case "${opt}" in
    1)
      write_ldap_yaml "true"
      systemctl restart matrix-synapse
      log_audit "LDAP enabled"
      echo "✅ LDAP enabled."
      ;;
    2)
      write_ldap_yaml "false"
      systemctl restart matrix-synapse
      log_audit "LDAP disabled"
      echo "✅ LDAP disabled."
      ;;
    3) ;;
    *) echo "Invalid option." ;;
  esac
  pause
}

# Bulk-import all LDAP/AD users into Matrix as pre-registered accounts
# so they appear in the user directory and can receive messages.
ldap_bulk_import() {
  print_header
  echo "📋 === Bulk Import LDAP Users into Matrix ==="
  echo
  echo "This will search LDAP/Active Directory for all users, create them"
  echo "in Matrix ( deactivated ), and set a random password so they can"
  echo "log in immediately with their LDAP credentials."
  echo
  echo "NOTE: LDAP authentication must be enabled first (option 10 → 1)."
  echo

  if ! load_ldap_config; then
    echo "❌ LDAP not configured yet. Configure LDAP first (menu option 10)."
    pause; return 1
  fi

  if ! load_config; then
    echo "❌ Matrix stack config not found."
    pause; return 1
  fi

  ensure_ldap_utils
  ensure_pg_client

  echo "🔍 LDAP Settings:"
  echo "   URI:        ${LDAP_URI}"
  echo "   Base DN:    ${LDAP_BASE}"
  echo "   UID attr:   ${LDAP_UID_ATTR}"
  echo "   Name attr:  ${LDAP_NAME_ATTR:-cn}"
  echo "   Mail attr:  ${LDAP_MAIL_ATTR:-mail}"
  echo

  echo "Search filter (default: objectClass=*  → fetch all users)"
  read -rp "Custom LDAP search filter [Enter for default]: " custom_filter
  local search_filter="${custom_filter:-(objectClass=*)}"

  echo
  echo "🧪 Searching LDAP for users..."
  local extra=(-x -LLL)
  if [[ -n "${LDAP_BIND_DN}" ]]; then
    extra+=(-D "${LDAP_BIND_DN}" -w "${LDAP_BIND_PASSWORD}")
  fi

  local uid_attr="${LDAP_UID_ATTR:-uid}"
  # For Active Directory, sAMAccountName is more common
  local uid_candidates=("${uid_attr}" "sAMAccountName" "uid" "cn")
  local found_uid_attr=""

  # Try to determine the correct UID attribute by testing a search
  for test_attr in "${uid_candidates[@]}"; do
    if ldapsearch -H "${LDAP_URI}" -b "${LDAP_BASE}" "${extra[@]}" \
         -s sub "(${search_filter})" "${test_attr}" 2>/dev/null | grep -q "^${test_attr}:"; then
      found_uid_attr="${test_attr}"
      break
    fi
  done

  if [[ -z "${found_uid_attr}" ]]; then
    echo "❌ Could not find any UID attribute in LDAP results."
    echo "   Tried: ${uid_candidates[*]}"
    pause; return 1
  fi

  echo "   Detected UID attribute: ${found_uid_attr}"

  # Fetch all users
  local ldap_results
  ldap_results="$(ldapsearch -H "${LDAP_URI}" -b "${LDAP_BASE}" "${extra[@]}" \
    -s sub "(${search_filter})" "${found_uid_attr}" "${LDAP_NAME_ATTR:-cn}" "${LDAP_MAIL_ATTR:-mail}" 2>/dev/null)"

  if [[ -z "${ldap_results}" ]]; then
    echo "❌ No users found in LDAP."
    pause; return 1
  fi

  # Extract unique UIDs
  local users=()
  while IFS= read -r line; do
    local val
    val="$(echo "${line}" | sed 's/^.*: //' | tr -d '[:space:]')"
    [[ -n "${val}" ]] && users+=("${val}")
  done < <(echo "${ldap_results}" | grep -iE "^${found_uid_attr}:" | awk -F': ' '{print $2}' | tr -d '[:space:]' | sort -u)

  if [[ ${#users[@]} -eq 0 ]]; then
    echo "❌ No users found in LDAP (empty results)."
    pause; return 1
  fi

  echo "   Found ${#users[@]} users in LDAP."
  echo
  echo "─── Sample users (first 10) ───────────────────"
  local i=0
  for u in "${users[@]}"; do
    [[ ${i} -ge 10 ]] && break
    echo "   @${u}:${HS_DOMAIN}"
    ((i++))
  done
  echo "────────────────────────────────────────────────"
  echo
  echo "⚠️  This will register ALL ${#users[@]} users in Matrix."
  read -rp "Proceed? (y/n): " confirm
  if [[ "${confirm}" != "y" && "${confirm}" != "Y" ]]; then
    echo "Cancelled."
    pause; return 0
  fi

  # Register users one by one via Synapse admin API
  local registered=0 skipped=0 failed=0
  local reg_secret=""
  _ensure_migrated
  reg_secret="$(yaml_get "registration_shared_secret" 2>/dev/null)" || reg_secret=""

  if [[ -z "${reg_secret}" ]]; then
    echo "❌ No registration_shared_secret found. Cannot register users."
    pause; return 1
  fi

  for u in "${users[@]}"; do
    local mxid="@${u}:${HS_DOMAIN}"

    # Skip if user already exists in PostgreSQL
    local exists
    exists="$(PGPASSWORD="${PG_PASS}" psql -h "${PG_HOST}" -p "${PG_PORT}" -U "${PG_USER}" -d "${PG_DB}" -tAc \
      "SELECT COUNT(*) FROM users WHERE name='${mxid}';" 2>/dev/null | tr -d '[:space:]')"

    if [[ "${exists}" == "1" ]]; then
      skipped=$((skipped + 1))
      continue
    fi

    # Register via Synapse's own register_new_matrix_user helper.
    # (The previous approach called the admin API's /register endpoint by hand,
    # but sent the literal string "shared_secret" as the bearer token instead
    # of the real ${reg_secret}, put ${HS_DOMAIN} inside single quotes so it
    # was never expanded, and never checked whether the call succeeded -- so
    # every user was silently counted as "registered" even when nothing
    # actually happened. register_new_matrix_user is the supported, reliable
    # way to do this and needs no manual HTTP call at all.)
    if ! command -v register_new_matrix_user >/dev/null 2>&1; then
      echo "❌ register_new_matrix_user not found. Is matrix-synapse installed correctly?"
      failed=$((failed + 1))
      continue
    fi

    local rand_pass
    rand_pass="$(openssl rand -base64 16 | tr -d '/+=' | head -c 24)"
    if register_new_matrix_user \
      -c /etc/matrix-synapse/homeserver.yaml \
      -u "${u}" \
      -p "${rand_pass}" \
      -a 0 \
      --no-admin 2>/dev/null; then
      registered=$((registered + 1))
    else
      failed=$((failed + 1))
      echo "   ❌ Failed: ${u}"
    fi

    # Small delay to avoid rate limiting
    sleep 0.1
  done

  echo
  echo "─── Import Results ────────────────────────────"
  echo "   ✅ Registered: ${registered}"
  echo "   ⏭️  Skipped (already exist): ${skipped}"
  echo "   ❌ Failed:     ${failed}"
  echo "   📊 Total found in LDAP:     ${#users[@]}"
  echo "────────────────────────────────────────────────"
  echo
  echo "💡 Users can now log in with their LDAP credentials."
  echo "💡 They can be found in Element via Start Chat → search username."

  log_audit "LDAP bulk import: registered=${registered} skipped=${skipped} failed=${failed}"
  pause
}

test_ldap_connection_silent() {
  ensure_ldap_utils
  local extra=(-x)
  if [[ -n "${LDAP_BIND_DN}" ]]; then
    extra+=(-D "${LDAP_BIND_DN}" -w "${LDAP_BIND_PASSWORD}")
  fi
  if ldapsearch -H "${LDAP_URI}" -b "${LDAP_BASE}" "${extra[@]}" -s base >/dev/null 2>&1; then
    echo "✅ LDAP connection OK."
    return 0
  else
    echo "❌ LDAP connection FAILED. Check URI/Base DN/credentials/firewall."
    return 1
  fi
}

test_ldap_connection() {
  print_header
  echo "🧪 === Test LDAP Connection ==="
  if ! load_ldap_config; then
    echo "⚠️  LDAP not configured yet."
    pause
    return 1
  fi
  test_ldap_connection_silent
  log_audit "LDAP connection test run"
  pause
}

ldap_menu() {
  while true; do
    print_header
    echo "🔐 === LDAP Management ==="
    if load_ldap_config; then
      echo "Current URI:  ${LDAP_URI}"
      echo "Current Base: ${LDAP_BASE}"
      echo "Current Mode: ${LDAP_MODE}"
    else
      echo "LDAP is not configured yet."
    fi
    echo
    echo "1) Configure / Reconfigure LDAP"
    echo "2) Enable / Disable LDAP"
    echo "3) Test LDAP connection"
    echo "4) Back to main menu"
    read -rp "Choose [1-4]: " opt
    case "${opt}" in
      1) configure_ldap_interactive  || true ;;
      2) toggle_ldap  || true ;;
      3) test_ldap_connection  || true ;;
      4) return 0 ;;
      *) echo "Invalid option."; sleep 1 ;;
    esac
  done
}

#############################################
# Security Hardening (Enterprise)
#############################################

setup_fail2ban() {
  print_header
  echo "🛡️  === Fail2ban: Matrix login brute-force protection ==="
  ensure_pkg fail2ban

  mkdir -p /etc/fail2ban/filter.d
  snap_backup "Configure fail2ban for Matrix/Nginx" /etc/fail2ban/filter.d/matrix-synapse.conf /etc/fail2ban/jail.d/matrix-synapse.conf
  cat > /etc/fail2ban/filter.d/matrix-synapse.conf <<'EOF'
[Init]
maxlines = 3

[Definition]
failregex = ^.*::ffff:<HOST> - \d+ - Received request: POST.*\n.*Got login request.*\n.*Failed password login.*
            ^.*<HOST> - \d+ - Received request: POST.*\n.*Got login request.*\n.*Failed password login.*
ignoreregex =
EOF

  mkdir -p /etc/fail2ban/jail.d
  cat > /etc/fail2ban/jail.d/matrix-synapse.conf <<EOF
[matrix-synapse]
enabled = true
filter = matrix-synapse
logpath = /var/log/matrix-synapse/homeserver.log
maxretry = 5
findtime = 600
bantime = 3600

[nginx-http-auth]
enabled = true
filter = nginx-http-auth
logpath = /var/log/nginx/error.log
maxretry = 5
findtime = 600
bantime = 3600
EOF

  systemctl restart fail2ban
  log_audit "fail2ban jails for Synapse/Nginx configured"
  echo "✅ fail2ban configured. Check status with: fail2ban-client status matrix-synapse"
  pause
}

setup_nginx_ratelimit() {
  print_header
  echo "🚦 === Nginx Rate Limiting for Login Endpoint ==="
  if ! load_config; then
    echo "⚠️  Config not found. Run Install first."
    pause
    return 1
  fi

  mkdir -p /etc/nginx/conf.d
  snap_backup "Configure Nginx login rate limiting" /etc/nginx/conf.d/matrix-ratelimit.conf /etc/nginx/sites-available/matrix.conf
  cat > /etc/nginx/conf.d/matrix-ratelimit.conf <<'EOF'
limit_req_zone $binary_remote_addr zone=matrix_login:10m rate=5r/m;
EOF

  if [[ -f /etc/nginx/sites-available/matrix.conf ]] && ! grep -q "matrix_login" /etc/nginx/sites-available/matrix.conf; then
    sed -i "/location \/ {/i\\
    location ~ ^/_matrix/client/(api/v1|r0|v3|unstable)/login {\\
        limit_req zone=matrix_login burst=5 nodelay;\\
        proxy_pass http://127.0.0.1:8008;\\
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;\\
        proxy_set_header X-Forwarded-Proto \$scheme;\\
        proxy_set_header Host \$host;\\
    }\\
" /etc/nginx/sites-available/matrix.conf
  fi

  nginx -t && systemctl reload nginx
  log_audit "Nginx rate limiting for /login configured"
  echo "✅ Rate limiting applied to login endpoint (5 requests/min per IP)."
  pause
}

setup_synapse_ratelimit() {
  print_header
  echo "🚦 === Synapse Built-in Rate Limiting (rc_login / rc_message) ==="

  _apply_synapse_ratelimit() {
    yaml_set "rc_login.address.per_second" "0.17"
    yaml_set "rc_login.address.burst_count" "3"
    yaml_set "rc_login.account.per_second" "0.17"
    yaml_set "rc_login.account.burst_count" "3"
    yaml_set "rc_login.failed_attempts.per_second" "0.17"
    yaml_set "rc_login.failed_attempts.burst_count" "3"
    yaml_set "rc_message.per_second" "0.2"
    yaml_set "rc_message.burst_count" "10"
    yaml_set "rc_registration.per_second" "0.17"
    yaml_set "rc_registration.burst_count" "3"
  }
  yaml_transaction "Synapse rate limits hardened" _apply_synapse_ratelimit
  log_audit "Synapse rc_login/rc_message rate limits hardened"
  echo "✅ Synapse rate-limit config applied."
  pause
}

security_menu() {
  while true; do
    print_header
    echo "🛡️  === Security Hardening (Enterprise) ==="
    echo "1) Setup fail2ban (brute-force protection)"
    echo "2) Setup Nginx rate limiting (login endpoint)"
    echo "3) Setup Synapse rate limiting (rc_login/rc_message)"
    echo "4) View audit log"
    echo "5) Back to main menu"
    read -rp "Choose [1-5]: " opt
    case "${opt}" in
      1) setup_fail2ban  || true ;;
      2) setup_nginx_ratelimit  || true ;;
      3) setup_synapse_ratelimit  || true ;;
      4) view_audit_log  || true ;;
      5) return 0 ;;
      *) echo "Invalid option."; sleep 1 ;;
    esac
  done
}

#############################################
# Workers / Scaling (Enterprise)
#############################################

# Pin the two cross-signing endpoints that are unreliable on generic
# workers to the Synapse main process, bypassing the matrix_workers
# upstream entirely.
#
# Background: Synapse's docs list ^/_matrix/client/.../keys/device_signing/upload$
# and ^/_matrix/client/.../keys/signatures/upload$ as endpoints a generic
# worker *can* handle, but in practice several Synapse releases have shipped
# with this route only registered on the main process (see e.g.
# element-hq/synapse#18146 for the sibling /keys/upload bug). The script's
# worker setup previously did a blanket find-and-replace of
# "proxy_pass http://127.0.0.1:8008;" -> "proxy_pass http://matrix_workers;"
# which sends literally every request -- including these two -- to the
# generic worker pool. If the running Synapse version doesn't register
# these routes on generic workers, they 404 with M_UNRECOGNIZED, which is
# exactly what breaks Element's "Verify this device" / cross-signing reset
# flow. Routing them straight to the main process sidesteps the bug
# entirely, since the main process always handles every endpoint.
_pin_master_only_endpoints_nginx() {
  local conf="/etc/nginx/sites-available/matrix.conf"
  [[ -f "${conf}" ]] || return 0
  grep -q "master_only_pin" "${conf}" 2>/dev/null && return 0
  local pyscript; pyscript="$(mktemp /tmp/nginx_patch_XXXXXX.py)"
  cat > "${pyscript}" <<'PYEOF'
import sys, re
path = sys.argv[1]
with open(path) as f:
    c = f.read()
block = (
    "\n    # BEGIN master_only_pin -- managed by 12element.sh\n"
    "    # These two cross-signing endpoints are unreliable on generic\n"
    "    # workers on some Synapse versions (404 M_UNRECOGNIZED); always\n"
    "    # route them to the main process instead of matrix_workers.\n"
    "    location ~ ^/_matrix/client/(api/v1|r0|v3|unstable)/keys/device_signing/upload$ {\n"
    "        proxy_pass http://127.0.0.1:8008;\n"
    "        proxy_set_header X-Forwarded-For $remote_addr;\n"
    "        proxy_set_header X-Forwarded-Proto $scheme;\n"
    "        proxy_set_header Host $host;\n"
    "        client_max_body_size 50M;\n"
    "    }\n"
    "    location ~ ^/_matrix/client/(api/v1|r0|v3|unstable)/keys/signatures/upload$ {\n"
    "        proxy_pass http://127.0.0.1:8008;\n"
    "        proxy_set_header X-Forwarded-For $remote_addr;\n"
    "        proxy_set_header X-Forwarded-Proto $scheme;\n"
    "        proxy_set_header Host $host;\n"
    "        client_max_body_size 50M;\n"
    "    }\n"
    "    # END master_only_pin"
)
c = re.sub(r"(\n([ \t]*)location / \{)", block + r"\n\2location / {", c, count=1)
with open(path, "w") as f:
    f.write(c)
PYEOF
  python3 "${pyscript}" "${conf}"
  rm -f "${pyscript}"
}

# Undo _pin_master_only_endpoints_nginx (called when workers are disabled).
_unpin_master_only_endpoints_nginx() {
  local conf="/etc/nginx/sites-available/matrix.conf"
  [[ -f "${conf}" ]] || return 0
  grep -q "master_only_pin" "${conf}" 2>/dev/null || return 0
  local pyscript; pyscript="$(mktemp /tmp/nginx_unpatch_XXXXXX.py)"
  cat > "${pyscript}" <<'PYEOF'
import sys, re
path = sys.argv[1]
with open(path) as f:
    c = f.read()
c = re.sub(r"\n[ \t]*# BEGIN master_only_pin.*?# END master_only_pin", "", c, flags=re.DOTALL)
with open(path, "w") as f:
    f.write(c)
PYEOF
  python3 "${pyscript}" "${conf}"
  rm -f "${pyscript}"
}

# --------------------------------------------------------------------------
# Same class of bug as the cross-signing one above, but for the Synapse
# Admin API (used by Ketesa / synapse-admin). generic_worker only implements
# a subset of /_synapse/admin/* routes -- which routes those are has changed
# across Synapse releases. When the blanket find-and-replace above sends
# "location /" (and therefore /_synapse/admin/...) to matrix_workers, any
# admin endpoint the running worker doesn't implement comes back
# 404 M_UNRECOGNIZED -- which is exactly what Ketesa shows as an empty list
# with "Unrecognized request" right after login. The admin API is always
# safe on the main process, so pin the whole /_synapse/admin/ tree to
# 127.0.0.1:8008 whenever workers are enabled.
# --------------------------------------------------------------------------
_pin_admin_api_nginx() {
  local conf="/etc/nginx/sites-available/matrix.conf"
  [[ -f "${conf}" ]] || return 0
  grep -q "admin_api_pin" "${conf}" 2>/dev/null && return 0
  local pyscript; pyscript="$(mktemp /tmp/nginx_patch_XXXXXX.py)"
  cat > "${pyscript}" <<'PYEOF'
import sys, re
path = sys.argv[1]
with open(path) as f:
    c = f.read()
block = (
    "\n    # BEGIN admin_api_pin -- managed by 12element.sh\n"
    "    # The Synapse Admin API (used by Ketesa) isn't fully implemented on\n"
    "    # generic workers on every Synapse version (404 M_UNRECOGNIZED);\n"
    "    # always route it to the main process instead of matrix_workers.\n"
    "    location ~ ^/_synapse/admin/ {\n"
    "        proxy_pass http://127.0.0.1:8008;\n"
    "        proxy_set_header X-Forwarded-For $remote_addr;\n"
    "        proxy_set_header X-Forwarded-Proto $scheme;\n"
    "        proxy_set_header Host $host;\n"
    "        client_max_body_size 50M;\n"
    "    }\n"
    "    # END admin_api_pin"
)
c = re.sub(r"(\n([ \t]*)location / \{)", block + r"\n\2location / {", c, count=1)
with open(path, "w") as f:
    f.write(c)
PYEOF
  python3 "${pyscript}" "${conf}"
  rm -f "${pyscript}"
}

# Undo _pin_admin_api_nginx (called when workers are disabled).
_unpin_admin_api_nginx() {
  local conf="/etc/nginx/sites-available/matrix.conf"
  [[ -f "${conf}" ]] || return 0
  grep -q "admin_api_pin" "${conf}" 2>/dev/null || return 0
  local pyscript; pyscript="$(mktemp /tmp/nginx_unpatch_XXXXXX.py)"
  cat > "${pyscript}" <<'PYEOF'
import sys, re
path = sys.argv[1]
with open(path) as f:
    c = f.read()
c = re.sub(r"\n[ \t]*# BEGIN admin_api_pin.*?# END admin_api_pin", "", c, flags=re.DOTALL)
with open(path, "w") as f:
    f.write(c)
PYEOF
  python3 "${pyscript}" "${conf}"
  rm -f "${pyscript}"
}

# Standalone repair entry point: fixes Ketesa/Admin API 404s on an
# already-broken install (workers already enabled) without touching
# anything else. Safe to run repeatedly.
fix_ketesa_admin_api_routing() {
  print_header
  echo "🛠️  === Fix Ketesa / Synapse Admin API 404 (M_UNRECOGNIZED) ==="
  echo
  if [[ ! -f /etc/nginx/sites-available/matrix.conf ]]; then
    echo "❌ /etc/nginx/sites-available/matrix.conf not found. Is Matrix installed?"
    pause
    return 1
  fi
  if ! grep -q "matrix_workers" /etc/nginx/sites-available/matrix.conf; then
    echo "ℹ️  Workers don't look enabled on this install (no matrix_workers upstream in use)."
    echo "   This fix is only needed when Synapse workers are active -- if Ketesa"
    echo "   is still failing with M_UNRECOGNIZED, the problem is elsewhere (check"
    echo "   that the admin user has 'admin' set on the homeserver, and that"
    echo "   Ketesa's restrictBaseUrl / login homeserver URL points at this domain)."
    pause
    return 0
  fi

  snap_backup "Pin Synapse Admin API to main process" \
    /etc/nginx/sites-available/matrix.conf

  _pin_admin_api_nginx

  local out; out="$(mktemp)"
  if nginx -t >"${out}" 2>&1; then
    systemctl reload nginx
    log_audit "Pinned /_synapse/admin/ to main process (nginx) -- Ketesa fix"
    echo "✅ Done. /_synapse/admin/* now bypasses matrix_workers and goes straight to"
    echo "   the main process. Reload Ketesa and log in again."
  else
    echo "❌ nginx -t failed after the change:"
    sed 's/^/   /' "${out}"
    echo
    echo "⚠️  Nginx was NOT reloaded. The config file was already changed on disk -- fix the"
    echo "    error above, then run:  nginx -t && systemctl reload nginx"
    echo "    Or restore from the backup just taken via the Restore menu."
  fi
  rm -f "${out}"
  pause
}

# Standalone repair entry point: fixes an already-broken install (workers
# already enabled, endpoints already 404ing) without touching anything
# else. Safe to run repeatedly.
fix_master_only_endpoints() {
  print_header
  echo "🛠️  === Fix cross-signing endpoint routing (device_signing / signatures upload) ==="
  echo
  if [[ ! -f /etc/nginx/sites-available/matrix.conf ]]; then
    echo "❌ /etc/nginx/sites-available/matrix.conf not found. Is Matrix installed?"
    pause
    return 1
  fi
  if ! grep -q "matrix_workers" /etc/nginx/sites-available/matrix.conf; then
    echo "ℹ️  Workers don't look enabled on this install (no matrix_workers upstream in use)."
    echo "   This fix is only needed when Synapse workers are active."
    pause
    return 0
  fi

  snap_backup "Pin cross-signing endpoints to Synapse main process" \
    /etc/nginx/sites-available/matrix.conf

  _pin_master_only_endpoints_nginx

  local out; out="$(mktemp)"
  if nginx -t >"${out}" 2>&1; then
    systemctl reload nginx
    log_audit "Pinned keys/device_signing/upload and keys/signatures/upload to main process (nginx)"
    echo "✅ Done. Those two endpoints now bypass matrix_workers and go straight to the main process."
    echo "   Reload Element and retry 'Verify this device' / cross-signing reset."
  else
    echo "❌ nginx -t failed after the change:"
    sed 's/^/   /' "${out}"
    echo
    echo "⚠️  Nginx was NOT reloaded. The config file was already changed on disk -- fix the"
    echo "    error above, then run:  nginx -t && systemctl reload nginx"
    echo "    Or restore from the backup just taken via the Restore menu."
  fi
  rm -f "${out}"
  pause
}

setup_workers() {
  print_header
  echo "⚙️  === Enable Synapse Workers (Scaling) ==="
  echo "⚠️  This is an advanced feature. Test in staging before production use."
  echo

  if ! load_config; then
    echo "⚠️  Config not found. Run Install first."
    pause
    return 1
  fi

  local num_workers="${NUM_GENERIC_WORKERS:-}"
  if [[ "${NON_INTERACTIVE:-}" == "true" ]]; then
    NUM_GENERIC_WORKERS="${num_workers:-2}"
  else
    read -rp "How many generic workers do you want? [1-4, default 2]: " NUM_GENERIC_WORKERS
    NUM_GENERIC_WORKERS="${NUM_GENERIC_WORKERS:-2}"
  fi
  if ! [[ "${NUM_GENERIC_WORKERS}" =~ ^[1-4]$ ]]; then
    echo "❌ Please enter a number between 1 and 4."
    pause
    return 1
  fi

  local fed_sender="${FED_SENDER_ENABLED:-}"
  if [[ "${NON_INTERACTIVE:-}" == "true" ]]; then
    if [[ "${fed_sender}" == "true" ]]; then
      FED_SENDER_ENABLED="true"
    else
      FED_SENDER_ENABLED="false"
    fi
  else
    read -rp "Enable a dedicated federation_sender worker? (y/n): " FED_ANS
    if [[ "${FED_ANS}" == "y" || "${FED_ANS}" == "Y" ]]; then
      FED_SENDER_ENABLED="true"
    else
      FED_SENDER_ENABLED="false"
    fi
  fi

  WORKER_BASE_PORT=8083
  WORKER_REPL_SECRET="$(openssl rand -hex 24)"

  local nginx_upstream="/etc/nginx/conf.d/matrix-workers-upstream.conf"
  snap_backup "Enable Synapse workers (${NUM_GENERIC_WORKERS} generic, fed_sender=${FED_SENDER_ENABLED})" \
    "${nginx_upstream}" /etc/nginx/sites-available/matrix.conf \
    /etc/systemd/system/matrix-synapse-worker@.service \
    /etc/matrix-synapse/workers /etc/matrix-synapse/conf.d

  # Reset the progress-bar engine for this run.
  TOTAL_STEPS=6
  CURRENT_STEP=0
  FAILED_STEPS=()

  echo
  echo "🚀 Enabling workers — ${TOTAL_STEPS} steps ahead. Full details in ${LOG_FILE}"
  echo

  _step_workers_redis() {
    ensure_pkg redis-server
    systemctl enable --now redis-server
  }
  run_step "📦 Installing Redis" _step_workers_redis

  _step_workers_pyyaml() {
    ensure_pkg python3-yaml
  }
  run_step "📦 Installing PyYAML helper (for safe config edits)" _step_workers_pyyaml

  _step_workers_listener() {
    ensure_listener_yaml 9093 http replication 127.0.0.1
  }
  run_step "🔌 Enabling HTTP replication listener on main process" _step_workers_listener

  _step_workers_replication() {
    _ensure_yq || return 1
    yaml_set "redis.enabled" "true"
    yaml_set_str "worker_replication_secret" "${WORKER_REPL_SECRET}"
    yaml_set_str "instance_map.main.host" "127.0.0.1"
    yaml_set "instance_map.main.port" "9093"
  }
  run_step "🔁 Enabling Redis-based replication" _step_workers_replication

  _step_workers_write_configs() {
    mkdir -p /etc/matrix-synapse/workers
    mkdir -p /var/log/matrix-synapse

    echo "upstream matrix_workers {" > "${nginx_upstream}"

    local port i
    for i in $(seq 1 "${NUM_GENERIC_WORKERS}"); do
      port=$((WORKER_BASE_PORT + i - 1))
      cat > "/etc/matrix-synapse/workers/generic_worker${i}.yaml" <<EOF
worker_app: synapse.app.generic_worker
worker_name: generic_worker${i}
worker_listeners:
  - type: http
    port: ${port}
    x_forwarded: true
    resources:
      - names: [client, federation]
worker_log_config: /etc/matrix-synapse/conf.d/generic_worker${i}-log.yaml
EOF

      cat > "/etc/matrix-synapse/conf.d/generic_worker${i}-log.yaml" <<EOF
version: 1
formatters:
  precise:
    format: '%(asctime)s - %(name)s - %(lineno)s - %(levelname)s - %(message)s'
handlers:
  file:
    class: logging.handlers.TimedRotatingFileHandler
    formatter: precise
    filename: /var/log/matrix-synapse/generic_worker${i}.log
    when: midnight
    backupCount: 6
  console:
    class: logging.StreamHandler
    formatter: precise
root:
  level: INFO
  handlers: [file, console]
disable_existing_loggers: false
EOF

      echo "    server 127.0.0.1:${port};" >> "${nginx_upstream}"
    done
    echo "}" >> "${nginx_upstream}"

    if [[ "${FED_SENDER_ENABLED}" == "true" ]]; then
      cat > /etc/matrix-synapse/workers/federation_sender1.yaml <<EOF
worker_app: synapse.app.federation_sender
worker_name: federation_sender1
worker_log_config: /etc/matrix-synapse/conf.d/federation_sender1-log.yaml
EOF

      cat > /etc/matrix-synapse/conf.d/federation_sender1-log.yaml <<EOF
version: 1
formatters:
  precise:
    format: '%(asctime)s - %(name)s - %(lineno)s - %(levelname)s - %(message)s'
handlers:
  file:
    class: logging.handlers.TimedRotatingFileHandler
    formatter: precise
    filename: /var/log/matrix-synapse/federation_sender1.log
    when: midnight
    backupCount: 6
root:
  level: INFO
  handlers: [file]
disable_existing_loggers: false
EOF

      yaml_set 'federation_sender_instances' '["federation_sender1"]'
    fi
  }
  run_step "👷 Writing worker config files" _step_workers_write_configs

  _step_workers_systemd_nginx() {
    cat > /etc/systemd/system/matrix-synapse-worker@.service <<'UNITEOF'
[Unit]
Description=Synapse Matrix worker %i
After=matrix-synapse.service network.target
PartOf=matrix-synapse.service

[Service]
Type=notify
NotifyAccess=main
User=matrix-synapse
WorkingDirectory=/var/lib/matrix-synapse
ExecStart=/opt/venvs/matrix-synapse/bin/python -m synapse.app.generic_worker --config-path=/etc/matrix-synapse/homeserver.yaml --config-path=/etc/matrix-synapse/conf.d/ --config-path=/etc/matrix-synapse/workers/%i.yaml
ExecReload=/bin/kill -HUP $MAINPID
Restart=always
RestartSec=3
SyslogIdentifier=matrix-synapse-%i

[Install]
WantedBy=multi-user.target
UNITEOF

    systemctl daemon-reload

    local i
    for i in $(seq 1 "${NUM_GENERIC_WORKERS}"); do
      systemctl enable --now "matrix-synapse-worker@generic_worker${i}.service"
    done

    if [[ "${FED_SENDER_ENABLED}" == "true" ]]; then
      systemctl enable --now "matrix-synapse-worker@federation_sender1.service"
    fi

    if [[ -f /etc/nginx/sites-available/matrix.conf ]] && ! grep -q "matrix_workers" /etc/nginx/sites-available/matrix.conf; then
      sed -i "s#proxy_pass http://127.0.0.1:8008;#proxy_pass http://matrix_workers;#" /etc/nginx/sites-available/matrix.conf
    fi

    # Cross-signing (device_signing/signatures upload) is unreliable on
    # generic workers on some Synapse versions -- always pin those two
    # endpoints to the main process instead of matrix_workers. See
    # _pin_master_only_endpoints_nginx() above for details.
    _pin_master_only_endpoints_nginx

    # Same reasoning as above, but for the Synapse Admin API (Ketesa /
    # synapse-admin) -- generic workers don't implement every admin route on
    # every Synapse version, so always keep /_synapse/admin/ on the main
    # process. See _pin_admin_api_nginx() above for details.
    _pin_admin_api_nginx

    systemctl restart matrix-synapse
    nginx -t && systemctl reload nginx
  }
  run_step "🧩 Setting up systemd worker template and Nginx routing" _step_workers_systemd_nginx

  save_workers_config
  log_audit "Workers enabled: ${NUM_GENERIC_WORKERS} generic worker(s), federation_sender=${FED_SENDER_ENABLED}"

  echo
  print_install_summary

  if [[ "${#FAILED_STEPS[@]}" -eq 0 ]]; then
    echo "✅ Workers configured:"
    echo "   Generic workers: ${NUM_GENERIC_WORKERS} (ports ${WORKER_BASE_PORT}-$((WORKER_BASE_PORT + NUM_GENERIC_WORKERS - 1)))"
    echo "   Federation sender: ${FED_SENDER_ENABLED}"
  else
    echo "⚠️  Workers were partially configured — check the failed step(s) above."
  fi
  pause
}

workers_status() {
  print_header
  echo "📊 === Workers Status ==="
  if load_workers_config; then
    echo "Configured generic workers: ${NUM_GENERIC_WORKERS}"
    echo "Federation sender enabled:  ${FED_SENDER_ENABLED}"
    echo
    systemctl status 'matrix-synapse-worker@*' --no-pager 2>/dev/null || echo "No worker services found."
  else
    echo "Workers are not configured."
  fi
  pause
}

disable_workers() {
  print_header
  echo "🧹 === Disable Workers (revert to single-process) ==="
  local CONFIRM="y"
  if [[ "${NON_INTERACTIVE:-}" != "true" ]]; then
    read -rp "Are you sure you want to disable all workers? (y/n): " CONFIRM
  fi
  if [[ "${CONFIRM}" != "y" && "${CONFIRM}" != "Y" ]]; then
    echo "Cancelled."
    pause
    return 0
  fi

  local i
  if load_workers_config; then
    for i in $(seq 1 "${NUM_GENERIC_WORKERS:-0}"); do
      systemctl disable --now "matrix-synapse-worker@generic_worker${i}.service" 2>/dev/null || true
    done
    if [[ "${FED_SENDER_ENABLED:-false}" == "true" ]]; then
      systemctl disable --now "matrix-synapse-worker@federation_sender1.service" 2>/dev/null || true
    fi
  fi

  snap_backup "Disable Synapse workers" \
    "${HOMESERVER_YAML}" "${WORKERS_CONF_FILE}" \
    /etc/matrix-synapse/workers /etc/matrix-synapse/conf.d \
    /etc/nginx/conf.d/matrix-workers-upstream.conf /etc/nginx/sites-available/matrix.conf

  rm -f /etc/matrix-synapse/workers/*.yaml
  # Remove replication config from homeserver.yaml
  _ensure_yq 2>/dev/null || true
  yaml_delete "redis" 2>/dev/null || true
  yaml_delete "worker_replication_secret" 2>/dev/null || true
  yaml_delete "instance_map" 2>/dev/null || true
  yaml_delete "federation_sender_instances" 2>/dev/null || true
  # Remove worker log configs and worker files
  rm -f /etc/matrix-synapse/conf.d/generic_worker*-log.yaml /etc/matrix-synapse/conf.d/federation_sender1-log.yaml
  rm -f /etc/nginx/conf.d/matrix-workers-upstream.conf
  rm -f "${WORKERS_CONF_FILE}"

  if [[ -f /etc/nginx/sites-available/matrix.conf ]]; then
    sed -i "s#proxy_pass http://matrix_workers;#proxy_pass http://127.0.0.1:8008;#" /etc/nginx/sites-available/matrix.conf
  fi
  _unpin_master_only_endpoints_nginx
  _unpin_admin_api_nginx

  nginx -t && systemctl reload nginx
  systemctl restart matrix-synapse

  log_audit "Workers disabled, reverted to single-process mode"
  echo "✅ Workers disabled."
  pause
}

workers_menu() {
  while true; do
    print_header
    echo "⚙️  === Workers / Scaling (Enterprise) ==="
    echo "1) Enable / Reconfigure workers"
    echo "2) Workers status"
    echo "3) Disable workers"
    echo "4) Back"
    read -rp "Choose [1-4]: " opt
    case "${opt}" in
      1) setup_workers  || true ;;
      2) workers_status  || true ;;
      3) disable_workers  || true ;;
      4) return 0 ;;
      *) echo "Invalid option."; sleep 1 ;;
    esac
  done
}

#############################################
# Monitoring (Enterprise) - Prometheus
#############################################

setup_monitoring() {
  print_header
  echo "📈 === Monitoring Setup (Prometheus) ==="
  if ! load_config; then
    echo "⚠️  Config not found. Run Install first."
    pause
    return 1
  fi

  echo "📦 [1/5] Installing Prometheus and Node Exporter..."
  ensure_pkg prometheus
  ensure_pkg prometheus-node-exporter
  ensure_pkg python3-yaml

  echo "🔌 [2/5] Enabling Synapse metrics listener (port 9000, localhost only)..."
  ensure_listener_yaml 9000 metrics metrics 127.0.0.1

  _ensure_yq || { echo "❌ yq not available."; return 1; }
  yaml_set "enable_metrics" "true"

  echo "🗺️  [3/5] Adding scrape targets to Prometheus..."
  ensure_prometheus_job "synapse" "127.0.0.1:9000"
  ensure_prometheus_job "node" "127.0.0.1:9100"

  echo "🔄 [4/5] Restarting services..."
  systemctl restart matrix-synapse
  systemctl enable --now prometheus
  systemctl enable --now prometheus-node-exporter

  echo "🔥 [5/5] Prometheus UI available on http://localhost:9090 (SSH tunnel or VPN recommended)."

  log_audit "Monitoring (Prometheus + node_exporter) enabled"
  echo
  echo "✅ Monitoring enabled."
  pause
}

monitoring_status() {
  print_header
  echo "📊 === Monitoring Status ==="
  systemctl is-active --quiet prometheus && echo "✅ prometheus: active" || echo "❌ prometheus: NOT active"
  systemctl is-active --quiet prometheus-node-exporter && echo "✅ node_exporter: active" || echo "❌ node_exporter: NOT active"
  _ensure_migrated
  if yaml_exists "enable_metrics"; then
    echo "✅ Synapse metrics: enabled"
  else
    echo "❌ Synapse metrics: not enabled"
  fi
  if curl -fsS http://127.0.0.1:9000/metrics >/dev/null 2>&1; then
    echo "✅ Synapse metrics endpoint reachable on :9000"
  else
    echo "❌ Cannot reach Synapse metrics endpoint on :9000"
  fi
  pause
}

disable_monitoring() {
  print_header
  echo "🧹 === Disable Monitoring ==="
  read -rp "Are you sure? (y/n): " CONFIRM
  if [[ "${CONFIRM}" != "y" && "${CONFIRM}" != "Y" ]]; then
    echo "Cancelled."
    pause
    return 0
  fi

  _ensure_yq 2>/dev/null || true
  yaml_delete "enable_metrics" 2>/dev/null || true
  systemctl disable --now prometheus 2>/dev/null || true
  systemctl disable --now prometheus-node-exporter 2>/dev/null || true
  systemctl restart matrix-synapse

  log_audit "Monitoring disabled"
  echo "✅ Monitoring disabled."
  pause
}

monitoring_menu() {
  while true; do
    print_header
    echo "📈 === Monitoring (Enterprise) ==="
    echo "1) Enable / Reconfigure monitoring"
    echo "2) Monitoring status"
    echo "3) Disable monitoring"
    echo "4) Back to main menu"
    read -rp "Choose [1-4]: " opt
    case "${opt}" in
      1) setup_monitoring  || true ;;
      2) monitoring_status  || true ;;
      3) disable_monitoring  || true ;;
      4) return 0 ;;
      *) echo "Invalid option."; sleep 1 ;;
    esac
  done
}

#############################################
# Call Diagnostics (TURN/WebRTC troubleshooting)
#############################################

call_diagnostics() {
  print_header
  echo "📞 === Call Diagnostics (TURN/WebRTC) ==="
  echo

  if ! load_config; then
    echo "⚠️  Config not found at ${CONFIG_FILE}. Some checks will be limited."
  fi

  ensure_pkg coturn
  ensure_pkg curl
  ensure_pkg iproute2

  echo "🧠 Services:"
  systemctl is-active --quiet coturn && echo "✅ coturn: active" || echo "❌ coturn: NOT active"
  systemctl is-active --quiet matrix-synapse && echo "✅ matrix-synapse: active" || echo "❌ matrix-synapse: NOT active"
  echo

  echo "   TURN ports listening (server-side):"
  ss -lunpt | grep -E ':(3478|5349)\b' || echo "❌ Not listening on 3478/5349 (check coturn config/service)."
  echo

  echo "🧾 TURN configuration summary:"
  if [[ -f /etc/turnserver.conf ]]; then
    echo "----- /etc/turnserver.conf (important lines) -----"
    grep -E '^(listening-port|tls-listening-port|listening-ip|relay-ip|external-ip|realm|server-name|min-port|max-port|use-auth-secret|static-auth-secret|cert=|pkey=)' /etc/turnserver.conf || true
    echo "--------------------------------------------------"
  else
    echo "❌ /etc/turnserver.conf not found."
  fi
  echo

  echo "🔥 Firewall quick check (UFW if available):"
  if command -v ufw >/dev/null 2>&1; then
    ufw status verbose || true
  else
    echo "⚠️  UFW not installed."
    echo "Required ports: UDP 3478, TCP 3478, TCP 5349, UDP 49160-49200"
  fi
  echo

  echo "🧪 Synapse TURN config (from homeserver.yaml):"
  _ensure_migrated
  if yaml_exists "turn_uris" || yaml_exists "turn_shared_secret"; then
    echo "  turn_uris:          $(yaml_get 'turn_uris' 2>/dev/null || echo '-')"
    echo "  turn_shared_secret: $(if yaml_exists 'turn_shared_secret'; then echo '(set)'; else echo '-'; fi)"
    echo "  turn_user_lifetime: $(yaml_get 'turn_user_lifetime' 2>/dev/null || echo '-')"
    echo "  turn_allow_guests:  $(yaml_get 'turn_allow_guests' 2>/dev/null || echo '-')"
  else
    echo "  ❌ No TURN configuration found in homeserver.yaml."
  fi
  echo

  echo "🧪 Matrix client endpoint (if domain known):"
  if [[ -n "${HS_DOMAIN:-}" ]]; then
    if curl -fsS "https://${HS_DOMAIN}/_matrix/client/versions" >/dev/null 2>&1; then
      echo "✅ https://${HS_DOMAIN}/_matrix/client/versions OK"
    else
      echo "❌ Cannot reach https://${HS_DOMAIN}/_matrix/client/versions"
    fi
  fi
  echo

  echo "📜 Recent coturn logs (last 80 lines):"
  journalctl -u coturn -n 80 --no-pager || true
  echo

  pause
}

#############################################
# Health Check
#############################################

health_check() {
  print_header
  echo "🔎 === Health Check ==="
  echo

  if ! load_config; then
    echo "⚠️  Config not found at ${CONFIG_FILE}. Some URL checks will be skipped."
  fi

  # Make sure the server can resolve its own internal/.local-style domains
  # before testing them below -- otherwise "Cannot reach ..." here can be a
  # false alarm caused by DNS/hosts, not an actual service problem.
  load_ketesa_config 2>/dev/null || true
  ensure_local_hosts_entries "${HS_DOMAIN:-}" "${ELEMENT_DOMAIN:-}" "${BASE_DOMAIN:-}" "${KETESA_DOMAIN:-}"

  echo "🧠 Services:"
  systemctl is-active --quiet matrix-synapse && echo "✅ matrix-synapse: active" || echo "❌ matrix-synapse: NOT active"
  systemctl is-active --quiet nginx && echo "✅ nginx: active" || echo "❌ nginx: NOT active"
  systemctl is-active --quiet coturn && echo "✅ coturn: active" || echo "❌ coturn: NOT active"
  echo

  echo "🔐 SSL Certificate:"
  if [[ -n "${HS_DOMAIN:-}" ]]; then
    local cert_dir="/etc/letsencrypt/live/${HS_DOMAIN}"
    local ssl_mode="${SSL_MODE:-unknown}"
    if [[ -f "${cert_dir}/fullchain.pem" ]]; then
      local expiry
      expiry="$(openssl x509 -enddate -noout -in "${cert_dir}/fullchain.pem" 2>/dev/null | cut -d= -f2 || echo unknown)"
      echo "✅ Certificate present (mode: ${ssl_mode})"
      echo "   Expires: ${expiry}"
      if ! openssl x509 -checkend 86400 -noout -in "${cert_dir}/fullchain.pem" >/dev/null 2>&1; then
        echo "⚠️  Certificate expires within 24 hours! Use SSL Management → Fix SSL."
      fi
    else
      echo "❌ Certificate MISSING at ${cert_dir}/fullchain.pem"
      echo "   → Use menu option: SSL Management → Fix missing/broken SSL"
    fi
  fi
  echo

  echo "🐘 PostgreSQL:"
  systemctl is-active --quiet postgresql && echo "✅ postgresql: active" || echo "❌ postgresql: NOT active"
  if [[ -n "${PG_DB:-}" ]]; then
    ensure_pg_client
    if PGPASSWORD="${PG_PASS}" psql -h "${PG_HOST}" -p "${PG_PORT}" -U "${PG_USER}" -d "${PG_DB}" -c '\q' >/dev/null 2>&1; then
      echo "✅ Synapse can connect to PostgreSQL database '${PG_DB}'"
    else
      echo "❌ Cannot connect to PostgreSQL database '${PG_DB}'"
    fi
  fi
  echo

  echo "🔐 LDAP:"
  if load_ldap_config; then
    echo "Configured: ${LDAP_URI}"
  else
    echo "Not configured."
  fi
  echo

  echo "🧰 Redis / Workers:"
  systemctl is-active --quiet redis-server && echo "✅ redis-server: active" || echo "ℹ️  redis-server: not active (only needed if workers are enabled)"
  if load_workers_config; then
    echo "Workers configured: ${NUM_GENERIC_WORKERS} generic, federation_sender=${FED_SENDER_ENABLED}"
  else
    echo "Workers: not configured (single-process mode)"
  fi
  echo

  echo "📈 Monitoring:"
  systemctl is-active --quiet prometheus && echo "✅ prometheus: active" || echo "ℹ️  prometheus: not active"
  echo

  echo "🌐 Nginx config test:"
  if nginx -t >/dev/null 2>&1; then
    echo "✅ nginx -t OK"
  else
    echo "❌ nginx -t FAILED"
    nginx -t || true
    echo
    echo "💡 Quick fix: run 'SSL Management → Fix missing/broken SSL' from the main menu."
  fi
  echo

  if [[ -n "${HS_DOMAIN:-}" ]]; then
    echo "🧪 Matrix client API:"
    if curl -fsS --insecure "https://${HS_DOMAIN}/_matrix/client/versions" >/dev/null 2>&1; then
      echo "✅ https://${HS_DOMAIN}/_matrix/client/versions OK"
    else
      echo "❌ Cannot reach https://${HS_DOMAIN}/_matrix/client/versions"
    fi
    echo
  fi

  if [[ -n "${BASE_DOMAIN:-}" ]]; then
    echo "🧪 .well-known:"
    if curl -fsS --insecure "https://${BASE_DOMAIN}/.well-known/matrix/client" >/dev/null 2>&1; then
      echo "✅ https://${BASE_DOMAIN}/.well-known/matrix/client OK"
    else
      echo "❌ Cannot reach https://${BASE_DOMAIN}/.well-known/matrix/client"
    fi
    echo
  fi

  echo "🧷 Listening ports (quick view):"
  ss -lntup | grep -E '(:80|:443|:8008|:3478|:5349)\b' || echo "⚠️  No expected ports found."
  echo

  echo "🔐 Certificate info (if present):"
  if [[ -n "${HS_DOMAIN:-}" && -f "/etc/letsencrypt/live/${HS_DOMAIN}/fullchain.pem" ]]; then
    openssl x509 -in "/etc/letsencrypt/live/${HS_DOMAIN}/fullchain.pem" -noout \
      -subject -issuer -dates 2>/dev/null || true
  fi

  pause
}

#############################################
# Fix Wizard (common issues)
#############################################

#############################################
# Fix Wizard — individual fixers + status detection
#############################################

# Show current status of each fixable problem (used as the menu legend).
# Each line: number, icon (✅ ok / ⚠️ problem / ❌ broken), label.
_fix_wizard_status_line() {
  local num="$1" label="$2" ok="$3"
  if [[ "${ok}" == "1" ]]; then
    printf "  %s) ✅ %s\n" "${num}" "${label}"
  elif [[ "${ok}" == "0" ]]; then
    printf "  %s) ⚠️  %s  ← needs fixing\n" "${num}" "${label}"
  else
    printf "  %s) ❌ %s  ← broken / missing\n" "${num}" "${label}"
  fi
}

# Individual fix actions (each safe, idempotent, self-contained) -------------

fix_ssl_missing() {
  print_header
  echo "🔐 === Fix: Missing SSL Certificate ==="
  if ! load_config; then
    echo "⚠️  Config not found. Run Install first."; pause; return 1
  fi
  local cert_dir="/etc/letsencrypt/live/${HS_DOMAIN}"
  if [[ -f "${cert_dir}/fullchain.pem" ]] && openssl x509 -checkend 86400 -noout -in "${cert_dir}/fullchain.pem" >/dev/null 2>&1; then
    echo "✅ Certificate already present and valid. Nothing to do."
    pause; return 0
  fi
  echo "⚠️  Certificate missing or expired. Generating..."
  setup_ssl_auto "${HS_DOMAIN}" "${ELEMENT_DOMAIN}" "${BASE_DOMAIN}" "${LE_EMAIL}"
  save_config "${HS_DOMAIN}" "${ELEMENT_DOMAIN}" "${BASE_DOMAIN}" "${PUBLIC_IP}" \
    "${LE_EMAIL}" "${PG_DB}" "${PG_USER}" "${PG_PASS}" "${PG_HOST}" "${PG_PORT}" "${SSL_MODE}"
  nginx -t && systemctl reload nginx || true
  log_audit "Fix Wizard: SSL regenerated"
  echo "✅ SSL fixed."
  pause
}

# Serve config.json with no-cache headers so a repaired file is picked up
# by browsers immediately instead of waiting out any HTTP cache -- one of
# the most common reasons "I fixed it but the error is still there" happens
# with Element specifically.
_fix_element_config_nocache() {
  local conf="/etc/nginx/sites-available/element.conf"
  [[ -f "${conf}" ]] || return 0
  if grep -q "location = /config.json" "${conf}"; then
    return 0
  fi
  echo "🌍 Adding no-cache headers for config.json in nginx (element.conf)..."
  local pyf; pyf="$(mktemp /tmp/element_nocache_XXXXXX.py)"
  cat > "${pyf}" <<'PYEOF'
import re, sys
path = sys.argv[1]
with open(path) as f:
    c = f.read()
block = (
    "\n    location = /config.json {\n"
    "        add_header Cache-Control \"no-cache, must-revalidate\";\n"
    "        try_files $uri =404;\n"
    "    }\n"
)
# "location =" (exact match) takes priority over "location /" (prefix
# match) in nginx regardless of source order, but inserting it right
# before "location /" keeps the file readable top-to-bottom too.
c2 = re.sub(r"(\n[ \t]*location / \{)", block + r"\1", c, count=1)
with open(path, "w") as f:
    f.write(c2)
PYEOF
  snap_backup "Add no-cache headers for config.json (element.conf)" "${conf}"
  python3 "${pyf}" "${conf}"
  rm -f "${pyf}"
  _nginx_safe_test_reload
}

# Fix: Element config.json broken / missing default_server_config, causing
# "Invalid configuration: no default server specified" in the browser no
# matter what else was just changed (Screen Sharing, Jitsi, E2EE, ...).
# Shows the raw file first (so the actual problem is visible, not guessed
# at), then runs the same escalating repair as _ensure_element_default_server,
# and finally fixes nginx caching so a repaired file isn't masked by a
# stale cached copy in the browser.
fix_element_config() {
  print_header
  echo "🧰 === Fix: Element config.json ('no default server' error) ==="
  echo
  local cfg="/var/www/element/config.json"
  if [[ ! -f "${cfg}" ]]; then
    echo "❌ ${cfg} does not exist. Is Element installed? (option 1)"
    pause
    return 1
  fi

  echo "📄 Current file:"
  echo "──────────────────────────────────────────"
  cat "${cfg}"
  echo "──────────────────────────────────────────"
  echo

  ensure_pkg jq
  if jq -e '.default_server_config."m.homeserver".base_url' "${cfg}" >/dev/null 2>&1; then
    echo "✅ default_server_config is present and looks valid:"
    jq '.default_server_config' "${cfg}" 2>/dev/null
    echo
    echo "If the browser is STILL showing the error, this is almost"
    echo "certainly either (a) a stale, browser-cached copy of an older,"
    echo "broken config.json, or (b) a file-permission problem where Nginx"
    echo "can't read the file even though the content is fine. Checking..."
  fi
  _ensure_element_default_server || true

  _fix_element_config_nocache

  echo
  echo "➡️  On the affected browser: hard-refresh with Ctrl+Shift+R, or open"
  echo "   the site in a private/incognito window to rule out caching"
  echo "   entirely."
  log_audit "Fix Wizard: Element config.json checked/repaired"
  pause
}

fix_nginx_symlinks() {
  print_header
  echo "🔗 === Fix: Nginx Site Symlinks ==="
  local changed=0 c
  local -a sites=(matrix element wellknown)
  for c in "${sites[@]}"; do
    if [[ -f /etc/nginx/sites-available/${c}.conf ]]; then
      if [[ ! -L /etc/nginx/sites-enabled/${c}.conf ]]; then
        ln -sf /etc/nginx/sites-available/${c}.conf /etc/nginx/sites-enabled/${c}.conf
        echo "✅ Enabled: ${c}.conf"
        changed=1
      else
        echo "✅ Already enabled: ${c}.conf"
      fi
    else
      echo "⬜ No site file: ${c}.conf (run Install first)"
    fi
  done
  # Remove the default landing page if it hijacks the base domain
  if [[ -L /etc/nginx/sites-enabled/default ]]; then
    rm -f /etc/nginx/sites-enabled/default
    echo "🗑️  Removed default site (was hijacking requests)."
    changed=1
  fi
  if [[ ${changed} -eq 1 ]]; then
    nginx -t && systemctl reload nginx || true
    log_audit "Fix Wizard: nginx symlinks repaired"
    echo "✅ Nginx reloaded."
  else
    echo "ℹ️  Nothing needed fixing."
  fi
  pause
}

fix_coturn_disabled() {
  print_header
  echo "📞 === Fix: coturn disabled in /etc/default ==="
  if [[ ! -f /etc/default/coturn ]]; then
    echo "❌ /etc/default/coturn not found. Is coturn installed?"; pause; return 1
  fi
  if grep -q "^TURNSERVER_ENABLED=1" /etc/default/coturn; then
    echo "✅ coturn already enabled. Restarting it anyway..."
  else
    if grep -q "^TURNSERVER_ENABLED" /etc/default/coturn 2>/dev/null; then
      sed -i 's/^TURNSERVER_ENABLED=.*/TURNSERVER_ENABLED=1/' /etc/default/coturn
    else
      echo "TURNSERVER_ENABLED=1" >> /etc/default/coturn
    fi
    echo "✅ Enabled coturn in /etc/default/coturn."
  fi
  systemctl restart coturn || true
  log_audit "Fix Wizard: coturn enabled"
  pause
}

fix_synapse_perms_wizard() {
  print_header
  echo "🔧 === Fix: Synapse config/data permissions ==="
  local group
  group="$(id -gn matrix-synapse 2>/dev/null || echo nogroup)"
  chown -R matrix-synapse:"${group}" /etc/matrix-synapse /var/lib/matrix-synapse 2>/dev/null || true
  find /etc/matrix-synapse -type d -exec chmod 750 {} \; 2>/dev/null || true
  find /etc/matrix-synapse -type f -exec chmod 640 {} \; 2>/dev/null || true
  echo "✅ Permissions fixed (owner matrix-synapse:${group}, dir 750, file 640)."
  log_audit "Fix Wizard: synapse permissions fixed"
  pause
}

# Relax the login rate limit that can cause M_LIMIT_EXCEEDED during LDAP login.
fix_login_ratelimit() {
  print_header
  echo "🚪 === Fix: Relax Login Rate Limit (M_LIMIT_EXCEEDED) ==="
  echo "If Element shows 'M_LIMIT_EXCEEDED' on login (common with LDAP), the"
  echo "rc_login.failed_attempts burst is too small (set to 3 by Security menu)."
  echo "This raises it to a sane 10 and keeps anti-abuse in place."
  echo

  _ensure_migrated

  _apply_relaxed_ratelimit() {
    yaml_set "rc_login.address.per_second" "0.17"
    yaml_set "rc_login.address.burst_count" "10"
    yaml_set "rc_login.account.per_second" "0.17"
    yaml_set "rc_login.account.burst_count" "10"
    yaml_set "rc_login.failed_attempts.per_second" "0.17"
    yaml_set "rc_login.failed_attempts.burst_count" "10"
    yaml_set "rc_message.per_second" "0.2"
    yaml_set "rc_message.burst_count" "10"
  }
  yaml_transaction "Relax login rate limit" _apply_relaxed_ratelimit

  # Also relax the Nginx login rate limit if present (5r/m is too tight)
  if [[ -f /etc/nginx/conf.d/matrix-ratelimit.conf ]]; then
    cp -a /etc/nginx/conf.d/matrix-ratelimit.conf \
          /etc/nginx/conf.d/matrix-ratelimit.conf.bak.$(date +%Y%m%d%H%M%S) 2>/dev/null || true
    cat > /etc/nginx/conf.d/matrix-ratelimit.conf <<'EOF'
limit_req_zone $binary_remote_addr zone=matrix_login:10m rate=30r/m;
EOF
    nginx -t && systemctl reload nginx || true
    echo "✅ Nginx login rate limit raised to 30r/m."
  fi

  log_audit "Fix Wizard: login rate limit relaxed (burst_count=10)"
  pause
}

# Diagnose & fix LDAP-related M_LIMIT_EXCEEDED: show the real login error,
# reactivate a locked user, and clear Synapse's account rate-limit counter.
fix_ldap_login() {
  print_header
  echo "🔐 === Fix: LDAP login failing (M_LIMIT_EXCEEDED) ==="
  echo

  if ! load_config; then
    echo "⚠️  Config not found. Run Install first."; pause; return 1
  fi

  _ensure_migrated
  local ldap_enabled=false
  if yaml_exists "modules[0].module" \
     && [[ "$(yaml_get 'modules[0].module' 2>/dev/null)" == *"LdapAuthProviderModule"* ]]; then
    local mod_enabled
    mod_enabled="$(yaml_get 'modules[0].config.enabled' 2>/dev/null || echo false)"
    [[ "${mod_enabled}" == "true" ]] && ldap_enabled=true
  fi

  if ! load_ldap_config && [[ "${ldap_enabled}" != "true" ]]; then
    echo "ℹ️  LDAP is not configured."
    echo "    This fix only applies when AD/LDAP is in use."
    pause; return 0
  fi

  # --- 1) Show the REAL error Synapse is emitting on login ---------------
  local log="/var/log/matrix-synapse/homeserver.log"
  echo "📄 Last login-related log entries (the real reason login fails):"
  echo "──────────────────────────────────────────────────────────"
  if [[ -f "${log}" ]]; then
    # Grab the most recent login / ldap / password lines
    command grep -iE 'ldap|login|password|invalid|denied|unauthor|M_LIMIT' "${log}" 2>/dev/null \
      | tail -n 40 | cat || echo "(no matching log lines yet)"
  else
    echo "❌ ${log} not found."
  fi
  echo "──────────────────────────────────────────────────────────"
  echo

  # --- 2) Show current LDAP mode (common mis-config root cause) ---------
  echo "── Current LDAP config ──"
  if load_ldap_config; then
    echo "  URI:        ${LDAP_URI}"
    echo "  Base DN:    ${LDAP_BASE}"
    echo "  Mode:       ${LDAP_MODE}   (simple=direct bind, search=bind account)"
    echo "  UID attr:   ${LDAP_UID_ATTR}   (AD usually needs sAMAccountName)"
    echo "  STARTTLS:   ${LDAP_START_TLS}"
    [[ -n "${LDAP_BIND_DN}" ]] && echo "  Bind DN:    ${LDAP_BIND_DN}"
  else
    echo "  (LDAP config could not be loaded)"
  fi
  echo

  # --- 3) Run a live connectivity + bind test ---------------------------
  echo "🧪 Live LDAP connectivity test..."
  if load_ldap_config; then
    test_ldap_connection_silent
  else
    echo "❌ Cannot test — LDAP config missing."
  fi
  echo

  # --- 4) Offer to reactivate a locked user -----------------------------
  echo "Often the culprit is an account that Synapse marked deactivated"
  echo "after repeated failed logins. Reactivating clears its password_hash"
  echo "requirement and lets the user log in fresh."
  echo
  read -rp "Reactivate a specific user? Enter MXID (e.g. @user:${HS_DOMAIN}) or blank to skip: " mxid
  if [[ -n "${mxid}" ]]; then
    if [[ ! "${mxid}" =~ ^@[a-zA-Z0-9._=/-]+:[a-zA-Z0-9.-]+$ ]]; then
      echo "❌ Invalid MXID format (expected @user:domain)."
    else
      ensure_pg_client
      echo "🐘 Clearing deactivated flag for ${mxid}..."
      PGPASSWORD="${PG_PASS}" psql -h "${PG_HOST}" -p "${PG_PORT}" -U "${PG_USER}" -d "${PG_DB}" -c \
        "UPDATE users SET deactivated=0 WHERE name='${mxid}';" 2>/dev/null \
        && echo "✅ User ${mxid} reactivated." \
        || echo "⚠️  DB update failed (check PG credentials)."
    fi
  fi
  echo

  # --- 5) Clear account-level login rate limit --------------------------
  # Synapse stores per-account lockout in the DB (access_tokens/login tokens)
  # but the rc_login.failed_attempts counter is in-memory and clears on
  # restart. Restarting Synapse here clears the in-memory limiter.
  echo "🔄 Restarting Synapse to clear in-memory login limiter..."
  fix_synapse_perms
  systemctl restart matrix-synapse
  sleep 2

  if systemctl is-active --quiet matrix-synapse; then
    echo "✅ Synapse restarted — in-memory rate limit cleared."
  else
    echo "❌ Synapse did not come back. Inspect: journalctl -u matrix-synapse -n 50"
    pause; return 1
  fi
  echo

  # --- 6) Triage guidance based on what we found ------------------------
  echo "📋 Triage — if login STILL fails, the most likely causes are:"
  echo
  echo "  A) Mode mismatch  — AD almost always needs mode: search with a"
  echo "     bind/service account. 'simple' only works on very permissive LDAP."
  echo
  echo "  B) UID attribute  — Active Directory uses sAMAccountName, NOT 'uid'."
  echo "     Reconfigure via main menu → 10) LDAP Management → Configure."
  echo
  echo "  C) STARTTLS / port — for ldaps://  set STARTTLS=false (TLS is implicit);"
  echo "     for  ldap://   set STARTTLS=true  (upgrade to TLS)."
  echo
  echo "  D) Bind account   — the bind DN/password must have search rights on"
  echo "     the Base DN. Use 'Test LDAP connection' (menu 10 → 3) to verify."
  echo
  echo "To reconfigure LDAP: main menu → 10) LDAP Management → Configure LDAP."
  log_audit "Fix Wizard: LDAP login diagnosed + user reactivation attempted (${mxid:-none})"
  pause
}

# Restart all the expected services, in dependency order.
fix_restart_services() {
  print_header
  echo "🔄 === Fix: Restart All Services ==="
  local svc
  for svc in postgresql redis-server coturn matrix-synapse nginx fail2ban prometheus prometheus-node-exporter; do
    if systemctl list-unit-files 2>/dev/null | grep -q "^${svc}\.service"; then
      printf "  %-26s " "${svc}:"
      systemctl restart "${svc}" 2>/dev/null && echo "✅ restarted" || echo "⚠️  failed"
    fi
  done
  log_audit "Fix Wizard: services restarted"
  echo
  echo "✅ Restart cycle complete."
  pause
}

# Diagnose & fix "Can't connect to homeserver" — the error Element shows when
# it cannot reach Synapse through nginx at all (SSL, DNS, port, service down).
fix_homeserver_connectivity() {
  print_header
  echo "🌐 === Fix: Can't connect to homeserver (Element) ==="
  echo
  echo "Element shows this when it CANNOT reach Synapse at all."
  echo "Running 10 automated checks to find the root cause..."
  echo

  if ! load_config; then
    echo "❌ Config not found. Was Install (option 1) completed?"
    pause; return 1
  fi

  local cert_dir="/etc/letsencrypt/live/${HS_DOMAIN}"
  local issues=0 fixed=0

  # ---- Check 1: Synapse running? -------------------------------------------
  printf "  1) Synapse service .................... "
  if systemctl is-active --quiet matrix-synapse 2>/dev/null; then
    echo "✅ running"
  else
    echo "❌ NOT running"
    issues=$((issues + 1))
    echo "     → Attempting to start..."
    fix_synapse_perms
    systemctl start matrix-synapse 2>/dev/null
    sleep 3
    if systemctl is-active --quiet matrix-synapse; then
      echo "     ✅ Started successfully"; fixed=$((fixed + 1))
    else
      echo "     ❌ Still failing. Last log lines:"
      journalctl -u matrix-synapse -n 10 --no-pager 2>/dev/null | sed 's/^/        /'
    fi
  fi

  # ---- Check 2: Synapse responding on port 8008? --------------------------
  printf "  2) Synapse on :8008 .................... "
  if curl -fsS "http://127.0.0.1:8008/_matrix/client/versions" >/dev/null 2>&1; then
    echo "✅ responding"
  else
    echo "❌ not responding"
    issues=$((issues + 1))
    echo "     → Synapse is running but not answering. Check:"
    echo "       • journalctl -u matrix-synapse -n 50"
    echo "       • Are workers intercepting the port?"
  fi

  # ---- Check 3: Nginx running? --------------------------------------------
  printf "  3) Nginx service ....................... "
  if systemctl is-active --quiet nginx 2>/dev/null; then
    echo "✅ running"
  else
    echo "❌ NOT running"
    issues=$((issues + 1))
    echo "     → Starting nginx..."
    systemctl start nginx 2>/dev/null
    sleep 1
    if systemctl is-active --quiet nginx; then
      echo "     ✅ Started"; fixed=$((fixed + 1))
    else
      echo "     ❌ nginx won't start (config broken?)."
    fi
  fi

  # ---- Check 4: Nginx config test ------------------------------------------
  printf "  4) Nginx config (nginx -t) ............. "
  if nginx -t >/dev/null 2>&1; then
    echo "✅ OK"
  else
    echo "❌ FAILING"
    issues=$((issues + 1))
    echo "     → Output:"
    nginx -t 2>&1 | sed 's/^/        /'
  fi

  # ---- Check 5: SSL cert exists? -------------------------------------------
  printf "  5) SSL certificate ..................... "
  if [[ -f "${cert_dir}/fullchain.pem" ]]; then
    echo "✅ present"
  else
    echo "❌ MISSING"
    issues=$((issues + 1))
    echo "     → Generating certificate..."
    setup_ssl_auto "${HS_DOMAIN}" "${ELEMENT_DOMAIN}" "${BASE_DOMAIN}" "${LE_EMAIL}"
    save_config "${HS_DOMAIN}" "${ELEMENT_DOMAIN}" "${BASE_DOMAIN}" "${PUBLIC_IP}" \
      "${LE_EMAIL}" "${PG_DB}" "${PG_USER}" "${PG_PASS}" "${PG_HOST}" "${PG_PORT}" "${SSL_MODE}"
    fixed=$((fixed + 1))
  fi

  # ---- Check 6: SSL cert not expired? -------------------------------------
  printf "  6) SSL not expired .................... "
  if [[ -f "${cert_dir}/fullchain.pem" ]]; then
    if openssl x509 -checkend 86400 -noout -in "${cert_dir}/fullchain.pem" >/dev/null 2>&1; then
      echo "✅ valid"
    else
      echo "❌ expired or < 24h remaining"
      issues=$((issues + 1))
      echo "     → Regenerating..."
      setup_ssl_auto "${HS_DOMAIN}" "${ELEMENT_DOMAIN}" "${BASE_DOMAIN}" "${LE_EMAIL}"
      save_config "${HS_DOMAIN}" "${ELEMENT_DOMAIN}" "${BASE_DOMAIN}" "${PUBLIC_IP}" \
        "${LE_EMAIL}" "${PG_DB}" "${PG_USER}" "${PG_PASS}" "${PG_HOST}" "${PG_PORT}" "${SSL_MODE}"
      fixed=$((fixed + 1))
    fi
  else
    echo "⬜ skipped (no cert)"
  fi

  # ---- Check 7: Nginx site symlinks? --------------------------------------
  printf "  7) Nginx site symlinks ................. "
  local sym_ok=1
  local c
  for c in matrix element wellknown; do
    [[ ! -L /etc/nginx/sites-enabled/${c}.conf ]] && sym_ok=0
  done
  if [[ ${sym_ok} -eq 1 ]]; then
    echo "✅ all present"
  else
    echo "❌ missing"
    issues=$((issues + 1))
    [[ -f /etc/nginx/sites-available/matrix.conf ]]    && ln -sf /etc/nginx/sites-available/matrix.conf    /etc/nginx/sites-enabled/matrix.conf    || true
    [[ -f /etc/nginx/sites-available/element.conf ]]   && ln -sf /etc/nginx/sites-available/element.conf   /etc/nginx/sites-enabled/element.conf   || true
    [[ -f /etc/nginx/sites-available/wellknown.conf ]] && ln -sf /etc/nginx/sites-available/wellknown.conf /etc/nginx/sites-enabled/wellknown.conf || true
    rm -f /etc/nginx/sites-enabled/default
    echo "     ✅ Fixed"; fixed=$((fixed + 1))
  fi

  # ---- Check 8: DNS resolution? -------------------------------------------
  printf "  8) DNS for ${HS_DOMAIN} ............... "
  local resolved_ip
  resolved_ip="$(getent hosts "${HS_DOMAIN}" 2>/dev/null | awk '{print $1; exit}')"
  if [[ -n "${resolved_ip}" ]]; then
    echo "✅ ${resolved_ip}"
    if [[ "${resolved_ip}" != "${PUBLIC_IP}" && "${PUBLIC_IP}" != "0.0.0.0" ]]; then
      echo "     ⚠️  Resolved IP (${resolved_ip}) differs from PUBLIC_IP (${PUBLIC_IP})."
      echo "        This is OK if behind NAT/proxy, otherwise check DNS."
    fi
  else
    echo "❌ does not resolve!"
    issues=$((issues + 1))
    echo "     → The domain '${HS_DOMAIN}' does not resolve in DNS."
    echo "        If this is an internal domain (.local), add it to your"
    echo "        /etc/hosts or local DNS server."
    echo "        For public domains, check your DNS A record."
  fi

  # ---- Check 9: Port 443/80 reachable? -------------------------------------
  printf "  9) Port 443 listening ................. "
  if ss -lntp 2>/dev/null | grep -q ':443 '; then
    echo "✅ open"
  else
    echo "❌ NOT listening"
    issues=$((issues + 1))
    echo "     → nginx may not be binding to 443. Check the vhost files."
  fi

  printf "     Port 80 listening .................. "
  if ss -lntp 2>/dev/null | grep -q ':80 '; then
    echo "✅ open"
  else
    echo "⚠️  not listening (redirect port — non-critical)"
  fi

  # ---- Check 10: Element config.json pointing right? ----------------------
  printf " 10) Element config.json ................ "
  if [[ -f /var/www/element/config.json ]]; then
    local cfg_hs
    cfg_hs="$(command grep -oP '"base_url"\s*:\s*"\K[^"]+' /var/www/element/config.json 2>/dev/null)" || cfg_hs=""
    if [[ "https://${HS_DOMAIN}" == "${cfg_hs}" ]]; then
      echo "✅ points to https://${HS_DOMAIN}"
    else
      echo "❌ points to ${cfg_hs:-unknown} (expected https://${HS_DOMAIN})"
      issues=$((issues + 1))
      echo "     → Fixing..."
      ensure_pkg jq
      jq --arg u "https://${HS_DOMAIN}" --arg s "${HS_DOMAIN}" \
        '.default_server_config."m.homeserver".base_url = $u | .default_server_config."m.homeserver".server_name = $s' \
        /var/www/element/config.json > /tmp/element-config-fix.json \
        && mv /tmp/element-config-fix.json /var/www/element/config.json
      echo "     ✅ Fixed"; fixed=$((fixed + 1))
    fi
  else
    echo "❌ /var/www/element/config.json missing!"
    issues=$((issues + 1))
  fi

  # ---- Final reload -------------------------------------------------------
  echo
  echo "🔄 Reloading nginx..."
  nginx -t >/dev/null 2>&1 && systemctl reload nginx 2>/dev/null || true

  # ---- Verdict -------------------------------------------------------------
  echo
  echo "═════════════════════════════════════════════"
  if [[ ${issues} -eq 0 ]]; then
    echo "✅ All 10 checks passed — everything looks good!"
    echo
    echo "If Element still shows the error, the problem is likely:"
    echo "  • Browser blocking the request (try another browser / incognito)"
    echo "  • Corporate firewall / proxy intercepting HTTPS"
    echo "  • Browser extension (adblock / privacy) blocking the request"
    echo "  • The Element URL you opened does not match ELEMENT_DOMAIN"
    echo "    (you should open: https://${ELEMENT_DOMAIN})"
  elif [[ ${fixed} -gt 0 ]]; then
    echo "🔧 Found ${issues} issue(s), auto-fixed ${fixed} of them."
    echo
    echo "Try refreshing Element now (Ctrl+Shift+R)."
    echo "If it still fails, run option 16 → 10 again to re-check."
  else
    echo "❌ Found ${issues} issue(s) but could NOT auto-fix."
    echo
    echo "Manual steps needed — see the details above."
    echo "Most common next steps:"
    echo "  • Re-run Install (option 1) to regenerate everything"
    echo "  • Check journalctl -u matrix-synapse -n 50"
    echo "  • Check journalctl -u nginx -n 20"
  fi
  echo "═════════════════════════════════════════════"

  log_audit "Fix Wizard: homeserver connectivity check (issues=${issues}, fixed=${fixed})"
  pause
}

# The interactive menu — replaces the old "do everything at once" wizard.
fix_wizard() {
  while true; do
    print_header
    echo "🧰 === Fix Wizard (choose what to fix) ==="
    echo "Each item shows its current status (✅ ok / ⚠️ needs fixing / ❌ broken)."
    echo "Pick the one matching your problem — nothing runs automatically."
    echo
    echo "── Detected problems ──────────────────────────────────"

    local s_ssl=1 s_symlinks=1 s_default=1 s_coturn=1 s_perms=1 s_rl=1 s_syn=1 s_nginx=1 s_ldap=1 s_connect=1 s_element_cfg=1

    # SSL present?
    load_config || true
    if [[ -n "${HS_DOMAIN:-}" ]]; then
      local cert_dir="/etc/letsencrypt/live/${HS_DOMAIN}"
      if [[ ! -f "${cert_dir}/fullchain.pem" ]]; then
        s_ssl=2
      elif ! openssl x509 -checkend 86400 -noout -in "${cert_dir}/fullchain.pem" >/dev/null 2>&1; then
        s_ssl=2
      fi
    else
      s_ssl=2
    fi

    # Symlinks all present?
    local c
    for c in matrix element wellknown; do
      if [[ ! -L /etc/nginx/sites-enabled/${c}.conf ]]; then s_symlinks=0; fi
    done
    # Default site hijacking?
    [[ -L /etc/nginx/sites-enabled/default ]] && s_default=0

    # coturn enabled?
    if ! grep -q "^TURNSERVER_ENABLED=1" /etc/default/coturn 2>/dev/null; then s_coturn=0; fi

    # Synapse perms sane? (spot check: conf.d readable by owner)
    if [[ -d /etc/matrix-synapse/conf.d ]] && ! sudo -u matrix-synapse test -r /etc/matrix-synapse/homeserver.yaml 2>/dev/null; then
      s_perms=0
    fi

    # Login rate limit too strict? (burst <= 3)
    if yaml_exists "rc_login.failed_attempts.burst_count" 2>/dev/null; then
      local b
      b="$(yaml_get "rc_login.failed_attempts.burst_count" 2>/dev/null)" || b="10"
      [[ "${b}" =~ ^[0-9]+$ ]] && [[ "${b}" -le 3 ]] && s_rl=0
    fi

    # LDAP login failing? — LDAP configured AND recent login errors in log
    if yaml_exists "modules" 2>/dev/null; then
      local log="/var/log/matrix-synapse/homeserver.log"
      if [[ -f "${log}" ]] && command grep -qiE 'ldap|M_LIMIT_EXCEEDED|invalid_grant|invalid password' "${log}" 2>/dev/null; then
        # only flag if there were errors in the last 24h
        if command grep -iE 'ldap|M_LIMIT_EXCEEDED' "${log}" 2>/dev/null \
             | tail -n 50 | command grep -q "$(date +%Y-%m-%d)"; then
          s_ldap=0
        fi
      fi
    fi

    # Services running?
    systemctl is-active --quiet matrix-synapse || s_syn=0
    if ! nginx -t >/dev/null 2>&1; then s_nginx=0; fi

    # Homeserver reachable? quick heuristic
    if [[ ${s_syn} -ne 1 ]] || [[ ${s_nginx} -ne 1 ]]; then
      s_connect=0
    elif ! curl -fsS --insecure "http://127.0.0.1:8008/_matrix/client/versions" >/dev/null 2>&1; then
      s_connect=2
    fi

    # Element config.json has a valid default_server_config?
    if [[ -f /var/www/element/config.json ]]; then
      ensure_pkg jq
      if ! jq -e '.default_server_config."m.homeserver".base_url' /var/www/element/config.json >/dev/null 2>&1; then
        s_element_cfg=2
      else
        # Content can be perfectly valid yet still unreadable by Nginx's
        # worker process (e.g. mode 600 root:root) -- since this whole
        # script runs as root, a plain "jq -e" above would never notice
        # that. Check the actual permission bit too.
        local _cfg_perm; _cfg_perm="$(stat -c '%a' /var/www/element/config.json 2>/dev/null || echo 644)"
        [[ "${_cfg_perm: -1}" -lt 4 ]] && s_element_cfg=2
      fi
    fi

    # Render status legend
    _fix_wizard_status_line 1 "Missing/expired SSL certificate"            "${s_ssl}"
    _fix_wizard_status_line 2 "Nginx site symlinks (matrix/element/wk)"    "${s_symlinks}"
    _fix_wizard_status_line 3 "Default Nginx site hijacking requests"      "${s_default}"
    _fix_wizard_status_line 4 "coturn disabled in /etc/default"            "${s_coturn}"
    _fix_wizard_status_line 5 "Synapse config/data permissions"            "${s_perms}"
    _fix_wizard_status_line 6 "Login rate limit too strict (M_LIMIT_EXCEEDED)" "${s_rl}"
    _fix_wizard_status_line 7 "Synapse service not running"                "${s_syn}"
    _fix_wizard_status_line 8 "Nginx config test failing"                  "${s_nginx}"
    _fix_wizard_status_line 9 "LDAP login failing (M_LIMIT_EXCEEDED)"      "${s_ldap}"
    _fix_wizard_status_line 10 "Can't connect to homeserver (Element)"      "${s_connect}"
    _fix_wizard_status_line 11 "Element config.json (no default server error)" "${s_element_cfg}"
    echo
    echo "  a) 🔧 Fix ALL of the above (run every fixer in order)"
    echo "  r) 🔄 Restart all services"
    echo "  0) 🔙 Back to main menu"
    echo "──────────────────────────────────────────────────────"
    read -rp "Choose [1-11 / a / r / 0]: " opt

    case "${opt}" in
      1) fix_ssl_missing  || true ;;
      2) fix_nginx_symlinks  || true ;;
      3) rm -f /etc/nginx/sites-enabled/default; nginx -t && systemctl reload nginx || true;
         echo "✅ Default site removed."; log_audit "Fix Wizard: default site removed"; pause ;;
      4) fix_coturn_disabled  || true ;;
      5) fix_synapse_perms_wizard  || true ;;
      6) fix_login_ratelimit  || true ;;
      7) print_header; echo "🔄 Restarting Synapse..."; systemctl restart matrix-synapse; sleep 2;
         systemctl is-active --quiet matrix-synapse && echo "✅ Synapse is running." || echo "❌ Still failing — see journalctl -u matrix-synapse -n 50";
         pause ;;
      8) print_header; echo "🧪 nginx -t output:"; nginx -t;
         echo; echo "💡 If it fails on SSL, run fix #1 first."; pause ;;
      9) fix_ldap_login  || true ;;
      10) fix_homeserver_connectivity  || true ;;
      11) fix_element_config  || true ;;
      a|A)
        echo; echo "🔧 Running ALL fixers..."
        fix_ssl_missing; fix_nginx_symlinks
        rm -f /etc/nginx/sites-enabled/default; nginx -t >/dev/null 2>&1 && systemctl reload nginx || true
        fix_coturn_disabled; fix_synapse_perms_wizard; fix_login_ratelimit
        fix_ldap_login 2>/dev/null || true
        fix_homeserver_connectivity 2>/dev/null || true
        fix_element_config 2>/dev/null || true
        systemctl restart matrix-synapse 2>/dev/null || true
        log_audit "Fix Wizard: full auto-fix-all run"
        echo; echo "✅ All fixes applied. Services restarted."
        pause ;;
      r|R) fix_restart_services ;;
      0) return 0 ;;
      *) echo "Invalid option."; sleep 1 ;;
    esac
  done
}

#############################################
# Well-known E2EE helper
# Adds or removes io.element.e2ee.force_disable from wellknown.conf
# so Element Web completely disables E2EE (not just the default toggle).
#
# $1 = "true"  → inject force_disable (E2EE OFF)
#      "false" → remove force_disable (E2EE ON / default)
#############################################

_update_wellknown_e2ee() {
  local force_disable="$1"  # "true" or "false"
  local wk="/etc/nginx/sites-available/wellknown.conf"

  if [[ ! -f "${wk}" ]]; then
    echo "⚠️  wellknown.conf not found — skipping well-known E2EE update."
    return 0
  fi

  snap_backup "Update well-known E2EE force_disable=${force_disable}" "${wk}"

  if [[ "${force_disable}" == "true" ]]; then
    # Inject io.element.e2ee force_disable if not already present (idempotent).
    # Match any base_url value -- the sed pattern must NOT contain the literal
    # string '${HS_DOMAIN}' because on a real server the nginx config already
    # has the actual domain name (e.g. matrix.kheilisabz.local) expanded there.
    if ! grep -q 'io.element.e2ee' "${wk}"; then
      sed -i \
        's|"m\.homeserver":{"base_url":"[^"]*"}|&,"io.element.e2ee":{"force_disable":true}|g' \
        "${wk}"
    fi
  else
    # Remove io.element.e2ee block from the well-known return line.
    if grep -q 'io.element.e2ee' "${wk}"; then
      sed -i 's/,"io\.element\.e2ee":{"force_disable":[^}]*}//g' "${wk}"
    fi
  fi
}

#############################################
# E2EE Management (disable/enable for organization)
#############################################

# Detect and quarantine known-bad legacy nginx snippet files under conf.d/.
# Older revisions of this script (e.g. 12element.sh) wrote a standalone file
# such as /etc/nginx/conf.d/matrix-no-key-backup.conf containing a bare
# "location" block. Files under conf.d/ are included at the nginx "http"
# level, where a "location" directive is always invalid ("location" directive
# is not allowed here). If such a leftover file exists on the server, EVERY
# future "nginx -t" will fail -- even for changes unrelated to it (like this
# E2EE menu). This function finds and safely disables (renames, never
# deletes) any such stray file so nginx -t can succeed again.
_quarantine_bad_confd_snippets() {
  local d="/etc/nginx/conf.d"
  [[ -d "${d}" ]] || return 0
  local f found=0
  for f in "${d}"/*.conf; do
    [[ -f "${f}" ]] || continue
    # A "location" block directly in a conf.d file (not nested inside its
    # own "server { ... }") is invalid at the http-level include context.
    if grep -qE '^[[:space:]]*location[[:space:]]' "${f}" \
       && ! grep -qE '^[[:space:]]*server[[:space:]]*\{' "${f}"; then
      found=1
      local bak="${f}.disabled.$(date +%Y%m%d%H%M%S)"
      echo "⚠️  Invalid legacy nginx snippet found: ${f}"
      echo "   (a bare 'location' block cannot live directly under conf.d/)"
      mv "${f}" "${bak}"
      echo "   → disabled and moved to: ${bak}"
      echo "     (kept as backup — delete it manually once you confirm things work)"
    fi
  done
  [[ "${found}" == "1" ]]
}

# Remove dangling "include ...;" directives that point at files which no
# longer exist. This happens when a legacy snippet (like the one handled by
# _quarantine_bad_confd_snippets above, or one already missing for other
# reasons) is referenced via an "include /etc/nginx/conf.d/whatever.conf;"
# line inside matrix.conf (or any other active vhost), but the file itself
# is gone. nginx then fails with:
#   open() ".../whatever.conf" failed (2: No such file or directory)
# This scans sites-enabled/ and conf.d/ (following symlinks, de-duplicated
# by real path) and comments out/removes any include line whose target does
# not exist. Wildcard includes (containing "*") are left alone since nginx
# tolerates those matching zero files.
_remove_dangling_nginx_includes() {
  local scan_dirs=(/etc/nginx/sites-enabled /etc/nginx/conf.d)
  declare -A seen=()
  local d f real inc found=0
  for d in "${scan_dirs[@]}"; do
    [[ -d "${d}" ]] || continue
    for f in "${d}"/*; do
      [[ -e "${f}" ]] || continue
      real="$(readlink -f "${f}" 2>/dev/null)" || continue
      [[ -f "${real}" ]] || continue
      [[ -n "${seen[${real}]:-}" ]] && continue
      seen[${real}]=1
      while IFS= read -r inc; do
        [[ -n "${inc}" ]] || continue
        [[ "${inc}" == *'*'* ]] && continue
        if [[ ! -f "${inc}" ]]; then
          found=1
          echo "⚠️  Dangling nginx include in ${real}: ${inc} (file missing)"
          local bak="${real}.bak.$(date +%Y%m%d%H%M%S)"
          cp -a "${real}" "${bak}"
          local pyf; pyf="$(mktemp /tmp/nginx_incfix_XXXXXX.py)"
          cat > "${pyf}" <<'PYEOF'
import re, sys
path, target = sys.argv[1], sys.argv[2]
with open(path) as fh:
    c = fh.read()
pattern = re.compile(r"^[ \t]*include[ \t]+" + re.escape(target) + r"[ \t]*;[ \t]*\n?", re.MULTILINE)
c2 = pattern.sub("", c)
with open(path, "w") as fh:
    fh.write(c2)
PYEOF
          python3 "${pyf}" "${real}" "${inc}"
          rm -f "${pyf}"
          echo "   → removed dangling include line from ${real} (backup: ${bak})"
        fi
      done < <(grep -oE '^[[:space:]]*include[[:space:]]+[^;]+;' "${real}" \
                | sed -E 's/^[[:space:]]*include[[:space:]]+//; s/;[[:space:]]*$//')
    done
  done
  [[ "${found}" == "1" ]]
}

# Safe wrapper around "nginx -t && systemctl reload nginx".
# - Never blindly reloads on a broken config (would take the site down).
# - If the failure matches the known "location directive is not allowed
#   here" legacy-snippet bug, or a dangling "include" pointing at a missing
#   file, auto-repairs via _quarantine_bad_confd_snippets /
#   _remove_dangling_nginx_includes and retries once.
# - Always prints a clear final status instead of silently aborting.
_nginx_safe_test_reload() {
  local out; out="$(mktemp)"
  if nginx -t >"${out}" 2>&1; then
    systemctl reload nginx
    rm -f "${out}"
    return 0
  fi

  echo "❌ nginx -t failed:"
  sed 's/^/   /' "${out}"

  if grep -qi 'location.*directive is not allowed here' "${out}" \
     || grep -qi 'open().*failed.*no such file or directory' "${out}"; then
    echo
    echo "🔧 This matches a known legacy-config bug. Attempting auto-repair..."
    local repaired=0
    _quarantine_bad_confd_snippets && repaired=1 || true
    _remove_dangling_nginx_includes && repaired=1 || true
    if [[ "${repaired}" == "1" ]] && nginx -t >"${out}" 2>&1; then
      echo "✅ nginx -t OK after auto-repair."
      systemctl reload nginx
      rm -f "${out}"
      return 0
    else
      echo "❌ nginx -t still failing after auto-repair attempt:"
      sed 's/^/   /' "${out}"
    fi
  fi

  echo
  echo "⚠️  Nginx was NOT reloaded, to avoid taking the site down with a broken config."
  echo "   Any E2EE-related file changes made just now were already written to disk."
  echo "   Fix the error above, then run:  nginx -t && systemctl reload nginx"
  echo "   ...or just re-enter this menu option once nginx -t passes."
  rm -f "${out}"
  return 1
}

# Block the Matrix key backup API endpoints in Nginx.
# When these endpoints return 404, Element Web stops showing the
# "Set up recovery" prompt because the server advertises no backup support.
_block_key_backup_nginx() {
  local conf="/etc/nginx/sites-available/matrix.conf"
  grep -q "room_keys_block" "${conf}" 2>/dev/null && return 0
  # Write a temporary Python script to avoid shell quoting nightmares
  local pyscript; pyscript="$(mktemp /tmp/nginx_patch_XXXXXX.py)"
  cat > "${pyscript}" <<'PYEOF'
import sys, re
path = sys.argv[1]
with open(path) as f:
    c = f.read()
block = (
    "\n    # BEGIN room_keys_block -- managed by 12element.sh\n"
    "    location ~ ^/_matrix/client/(r0|v3|unstable)/room_keys/ {\n"
    "        default_type application/json;\n"
    "        return 404 '{\"errcode\":\"M_NOT_FOUND\",\"error\":\"Key backup disabled\"}';\n"
    "    }\n"
    "    # END room_keys_block"
)
c = re.sub(r"(\n([ \t]*)location / \{)", block + r"\n\2location / {", c, count=1)
with open(path, "w") as f:
    f.write(c)
PYEOF
  python3 "${pyscript}" "${conf}"
  rm -f "${pyscript}"
}

# Re-enable key backup API (undo _block_key_backup_nginx).
_unblock_key_backup_nginx() {
  local conf="/etc/nginx/sites-available/matrix.conf"
  grep -q "room_keys_block" "${conf}" 2>/dev/null || return 0
  local pyscript; pyscript="$(mktemp /tmp/nginx_unpatch_XXXXXX.py)"
  cat > "${pyscript}" <<'PYEOF'
import sys, re
path = sys.argv[1]
with open(path) as f:
    c = f.read()
c = re.sub(r"\n[ \t]*# BEGIN room_keys_block.*?# END room_keys_block", "", c, flags=re.DOTALL)
with open(path, "w") as f:
    f.write(c)
PYEOF
  python3 "${pyscript}" "${conf}"
  rm -f "${pyscript}"
}


manage_e2ee() {
  print_header
  echo "🔐 === E2EE Management (Organization Mode) ==="
  echo

  # Pre-flight: verify config.json has default_server_config.
  # If it's missing, Element shows "Invalid configuration: no default server
  # specified" on every page load, completely unrelated to E2EE state.
  if ! _ensure_element_default_server; then
    pause
    return 1
  fi

  # Pre-flight: quarantine any leftover legacy conf.d snippet with a bare
  # "location" block (e.g. matrix-no-key-backup.conf from older script
  # versions), AND remove any dangling "include ...;" line still pointing
  # at such a (now-missing) file. Left in place, either breaks "nginx -t"
  # for ANY future change, not just E2EE ones.
  _quarantine_bad_confd_snippets || true
  _remove_dangling_nginx_includes || true

  echo "In an organization where the server is self-hosted and trusted,"
  echo "E2EE (End-to-End Encryption) can cause issues:"
  echo
  echo "  ❌ Messages encrypted on one device cannot be read on another"
  echo "  ❌ If the device is lost, all encrypted messages are lost"
  echo "  ❌ Key recovery is complex for non-technical users"
  echo "  ❌ 'Back up your chats' notification appears constantly"
  echo
  echo "Disabling E2EE completely means:"
  echo "  ✅ Messages stored on server (PostgreSQL) — accessible from any device"
  echo "  ✅ No encryption key management needed"
  echo "  ✅ Admin can take backups of all conversations"
  echo "  ✅ Server is already controlled by the organization"
  echo "  ✅ 'Back up your chats' notification disappears"
  echo "  ✅ Users CANNOT enable E2EE per room (enforced server-side)"
  echo
  echo "This script disables E2EE at four levels:"
  echo "  1) Element Web config.json  (feature_e2ee = false)"
  echo "  2) /.well-known/matrix/client  (io.element.e2ee.force_disable = true)"
  echo "  3) Synapse default_power_level_content_override  (m.room.encryption → 999)"
  echo "  4) room_policy third-party-rules module  (rejects m.room.encryption server-side)"
  echo
  echo "⚠️  Known limitation: force_disable (item 2) works correctly on Element"
  echo "   Web but may NOT be fully respected by Element Android/iOS apps"
  echo "   (upstream bug — https://github.com/element-hq/element-web/issues)."
  echo "   Items 3 and 4 are enforced by Synapse itself, so they apply no"
  echo "   matter which client (Web, Android, iOS, curl/API) is used."
  echo

  local cur_feat="unknown"
  local cur_wk="unknown"
  local cur_pl="unknown"
  local cur_block="unknown"
  if [[ -f /var/www/element/config.json ]]; then
    cur_feat="$(jq -r '.settingDefaults.features.feature_e2ee // "not set"' /var/www/element/config.json 2>/dev/null)" || true
  fi
  if [[ -f /etc/nginx/sites-available/wellknown.conf ]] && grep -q 'io.element.e2ee.*force_disable.*true' /etc/nginx/sites-available/wellknown.conf; then
    cur_wk="FORCE DISABLED"
  else
    cur_wk="not set"
  fi
  if yaml_exists 'default_power_level_content_override.private_chat.events."m.room.encryption"' 2>/dev/null; then
    cur_pl="$(yaml_get 'default_power_level_content_override.private_chat.events."m.room.encryption"' 2>/dev/null)"
  else
    cur_pl="not set (default 100)"
  fi
  if [[ -f /etc/matrix-synapse/room_policy_state.json ]] && jq -e '.block_encryption == true' /etc/matrix-synapse/room_policy_state.json >/dev/null 2>&1; then
    cur_block="BLOCKED (server-side)"
  else
    cur_block="not blocked"
  fi
  echo "── Current state ─────────────────────────"
  printf "  %-30s %s\n" "config.json feature_e2ee:"    "${cur_feat}"
  printf "  %-30s %s\n" "well-known force_disable:"    "${cur_wk}"
  printf "  %-30s %s\n" "encryption power level req:"  "${cur_pl}"
  printf "  %-30s %s\n" "room_policy encryption block:" "${cur_block}"
  echo "─────────────────────────────────────────────"
  echo
  echo "1) ⛔  DISABLE E2EE completely (recommended for organizations)"
  echo "2) 🔓  ENABLE  E2EE (default Matrix behavior)"
  echo "3) Back"
  read -rp "Choose [1-3]: " opt

  case "${opt}" in
    1)
      echo
      echo "🧩 Installing/updating the room-policy module (server-side enforcement)..."
      local module_ok=1
      if ! write_room_policy_module; then
        module_ok=0
        echo "⚠️  Could not install room_policy module — client-side E2EE"
        echo "   restrictions (config.json + well-known) will still be applied,"
        echo "   but a room admin using a raw API call could still turn"
        echo "   encryption on for their own room. Proceeding without it."
      else
        _room_policy_set_state "block_encryption" "true" || true
      fi

      _apply_e2ee_room_lockdown() {
        if [[ ${module_ok} -eq 1 ]]; then
          yaml_set 'third_party_event_rules.module' '"room_policy.RoomPolicy"'
          yaml_set 'third_party_event_rules.config.block_encryption' "true"
        fi
        local preset
        for preset in private_chat trusted_private_chat public_chat; do
          yaml_set "default_power_level_content_override.${preset}.events.\"m.room.encryption\"" "999"
        done
      }
      yaml_transaction "Lock down room encryption (PL 999 + server-side block)" _apply_e2ee_room_lockdown \
        || echo "⚠️  Could not update homeserver.yaml (Synapse may not support this config on your version)."

      element_jq '.settingDefaults.features.feature_e2ee = false | del(.settingDefaults["UIFeature.SecureBackup"]) | .settingDefaults["UIFeature.BulkUnverifiedSessionsReminder"] = false' \
        && _update_wellknown_e2ee "true" \
        && _unblock_key_backup_nginx \
        && _nginx_safe_test_reload \
        && echo \
        && echo "✅ E2EE DISABLED completely." \
        && echo "   • Element Web config.json: feature_e2ee = false" \
        && echo "   • well-known/matrix/client: io.element.e2ee.force_disable = true" \
        && echo "   • Encryption toggle is removed from room creation dialog" \
        && echo "   • Room encryption now requires power level 999 (new rooms)" \
        && echo "   • Synapse itself now rejects any m.room.encryption event," \
        && echo "     in ANY room (new or existing), no matter who sends it or" \
        && echo "     what client they use — a room admin cannot enable it." \
        && echo "   • 'Verify this device' / unverified-session reminder banner hidden" \
        && echo "     (UIFeature.BulkUnverifiedSessionsReminder = false)" \
        && echo "   • Key backup API left unblocked -- with no encrypted rooms there is" \
        && echo "     nothing to back up, and blocking it was interfering with Element's" \
        && echo "     own cross-signing identity/reset flow." \
        && echo "   • Nginx reloaded." \
        && echo "   Hard-refresh Element Web (Ctrl+Shift+R)." \
        && log_audit "E2EE completely disabled (config.json + well-known + PL999 + room_policy block; key backup API left unblocked)"
      ;;
    2)
      _apply_e2ee_room_unlock() {
        yaml_delete 'default_power_level_content_override.private_chat.events."m.room.encryption"' 2>/dev/null || true
        yaml_delete 'default_power_level_content_override.trusted_private_chat.events."m.room.encryption"' 2>/dev/null || true
        yaml_delete 'default_power_level_content_override.public_chat.events."m.room.encryption"' 2>/dev/null || true
        yaml_set 'third_party_event_rules.config.block_encryption' "false"
      }
      yaml_transaction "Remove room encryption lockdown (PL 999 + server-side block)" _apply_e2ee_room_unlock \
        || echo "⚠️  Could not update homeserver.yaml."
      if [[ -f /etc/matrix-synapse/room_policy_state.json ]]; then
        _room_policy_set_state "block_encryption" "false" || true
      fi

      element_jq 'del(.settingDefaults.features.feature_e2ee) | .settingDefaults.features.feature_e2ee = true | del(.settingDefaults["UIFeature.BulkUnverifiedSessionsReminder"])' \
        && _unblock_key_backup_nginx \
        && _update_wellknown_e2ee "false" \
        && _nginx_safe_test_reload \
        && echo \
        && echo "✅ E2EE ENABLED." \
        && echo "   • well-known force_disable removed." \
        && echo "   • Room encryption power-level requirement removed." \
        && echo "   • Synapse-side encryption block removed." \
        && echo "   • Key backup API unblocked." \
        && echo "   • Unverified-session reminder banner restored to default." \
        && echo "   • Nginx reloaded." \
        && echo "   Hard-refresh Element Web (Ctrl+Shift+R)." \
        && log_audit "E2EE enabled (config.json + well-known + PL override + room_policy block all reverted)"
      ;;
    3) return 0 ;;
    *) echo "Invalid option."; sleep 1 ;;
  esac
  pause
}

#############################################
# Ketesa — Matrix/Synapse Admin Panel
# (formerly Synapse Admin: https://github.com/etkecc/ketesa)
#############################################
# Ketesa is a static single-page web app. It has NO backend service of its
# own -- the browser talks directly to Synapse's admin API
# (/_synapse/admin/...). So "installing" it just means serving its static
# files somewhere your browser can reach, exactly like Element Web already
# is. This installs it on THIS server, behind the same nginx, on its own
# domain, and reuses the same internal CA / cert flow the rest of this
# script already uses for Element Web.

KETESA_CONF_FILE="/etc/matrix-ketesa.conf"

save_ketesa_config() {
  mkdir -p "$(dirname "${KETESA_CONF_FILE}")"
  snap_backup "Update Ketesa config (${KETESA_CONF_FILE})" "${KETESA_CONF_FILE}"
  cat > "${KETESA_CONF_FILE}" <<EOF
KETESA_DOMAIN=${KETESA_DOMAIN}
KETESA_VERSION=${KETESA_VERSION}
KETESA_MODE=${KETESA_MODE:-local}
KETESA_REMOTE_HS=${KETESA_REMOTE_HS:-}
EOF
  chmod 600 "${KETESA_CONF_FILE}"
}

load_ketesa_config() {
  if [[ -f "${KETESA_CONF_FILE}" ]]; then
    # shellcheck disable=SC1090
    source "${KETESA_CONF_FILE}"
    return 0
  fi
  return 1
}

# Latest Ketesa release tag from GitHub (e.g. "v1.3.0"); "unknown" on failure.
_ketesa_latest_version() {
  local v
  v="$(curl -fsS https://api.github.com/repos/etkecc/ketesa/releases/latest 2>/dev/null \
       | jq -r '.tag_name // empty' 2>/dev/null)"
  if [[ -n "${v}" && "${v}" != "null" ]]; then
    echo "${v}"
  else
    echo "unknown"
  fi
}

install_ketesa_admin() {
  print_header
  echo "🧭 === Ketesa — Matrix/Synapse Admin Panel ==="
  echo
  echo "Ketesa (formerly 'Synapse Admin') manages users, rooms, media, and"
  echo "federation on a homeserver from a web UI. It is a static site -- the"
  echo "browser talks directly to Synapse's admin API, so there's no separate"
  echo "backend/service to run or keep alive."
  echo

  local KETESA_MODE="local"
  local KETESA_REMOTE_HS=""

  load_config 2>/dev/null || true
  if [[ -z "${HS_DOMAIN:-}" ]]; then
    echo "ℹ️  No local Matrix install detected on this server (HS_DOMAIN unknown)."
    echo "   You can still install Ketesa here as a STANDALONE panel that talks to a"
    echo "   homeserver hosted on a *different* server."
    echo
    read -rp "Install Ketesa in standalone mode, pointing at a remote homeserver? (y/n) [y]: " go_remote
    if [[ "${go_remote:-y}" != "y" && "${go_remote:-y}" != "Y" ]]; then
      echo "❌ Cancelled. Run option 1 (Install Matrix stack) on this server first if you"
      echo "   wanted a locally-hosted Ketesa instead."
      pause
      return 1
    fi
    KETESA_MODE="remote"

    echo
    echo "Enter the homeserver's public client-facing domain -- the same domain your"
    echo "Element clients connect to (e.g. matrix.example.com). It must already have"
    echo "valid HTTPS and a reachable Synapse Admin API; this script does not touch"
    echo "that remote server at all."
    load_ketesa_config 2>/dev/null || true
    read -rp "Remote homeserver domain [${KETESA_REMOTE_HS:-}]: " in_remote_hs
    KETESA_REMOTE_HS="${in_remote_hs:-${KETESA_REMOTE_HS:-}}"
    if [[ -z "${KETESA_REMOTE_HS}" ]]; then
      echo "❌ A remote homeserver domain is required."
      pause
      return 1
    fi

    ensure_pkg nginx
  fi

  load_ketesa_config 2>/dev/null || true
  # The two load_ketesa_config calls above may have just sourced a stale
  # KETESA_MODE from a previous run -- re-assert it based on what's actually
  # true on THIS run (HS_DOMAIN present == local install detected above).
  if [[ -n "${HS_DOMAIN:-}" ]]; then
    KETESA_MODE="local"
  else
    KETESA_MODE="remote"
  fi
  local default_domain="${KETESA_DOMAIN:-admin.${BASE_DOMAIN:-${KETESA_REMOTE_HS:-${HS_DOMAIN:-}}}}"
  read -rp "Domain for Ketesa on THIS server [${default_domain}]: " in_domain
  KETESA_DOMAIN="${in_domain:-${default_domain}}"

  echo
  echo "╔══════════════════════════════════════════════════════════════╗"
  echo "║  📥  Choose how to install Ketesa                           ║"
  echo "╠══════════════════════════════════════════════════════════════╣"
  echo "║   1)  🌐  Online   — automatic download from GitHub         ║"
  echo "║   2)  📁  Offline  — use a ketesa.tar.gz file               ║"
  echo "║                       you have already copied to the server ║"
  echo "╚══════════════════════════════════════════════════════════════╝"
  echo
  local install_mode=""
  while true; do
    read -rp "   Choose [1]: " install_mode
    install_mode="${install_mode:-1}"
    case "${install_mode}" in
      1|online|Online) install_mode="online"; break ;;
      2|offline|Offline) install_mode="offline"; break ;;
      *) echo "❌ Invalid option. Please enter 1 or 2." ;;
    esac
  done

  mkdir -p /var/www
  cd /var/www || return 1

  # All interactive prompts (version, offline path, TLS email) are gathered
  # up front, BEFORE the progress bar starts. run_step sends the wrapped
  # command's stdout/stderr only to the log file, so a `read -rp` inside a
  # step would show no visible prompt and appear to hang.
  local ketesa_src=""
  local KETESA_NEEDS_DOWNLOAD="no"
  local KETESA_DOWNLOAD_TARGET=""
  if [[ "${install_mode}" == "online" ]]; then
    echo
    echo "🔎 Checking latest Ketesa release..."
    local latest; latest="$(_ketesa_latest_version)"
    echo "   Latest available: ${latest}"
    local default_ver="${latest}"
    [[ "${default_ver}" == "unknown" ]] && default_ver="${KETESA_VERSION:-v1.3.0}"
    read -rp "Version to install [${default_ver}]: " in_ver
    KETESA_VERSION="${in_ver:-${default_ver}}"

    # Check the local matrix_package cache (created if missing) before
    # downloading — reuse an existing file, or download a fresh one
    # (kept in the same folder, with a timestamp suffix if a copy of
    # this version already exists and the user wants a new download).
    echo
    echo "╔══════════════════════════════════════════════════════════════╗"
    echo "║  🔍  Checking local cache for Ketesa ${KETESA_VERSION}            "
    echo "╚══════════════════════════════════════════════════════════════╝"
    pkgcache_resolve_online "Ketesa ${KETESA_VERSION}" "ketesa-${KETESA_VERSION}.tar.gz"
    if [[ -n "${PKGCACHE_SOURCE_PATH}" ]]; then
      ketesa_src="${PKGCACHE_SOURCE_PATH}"
      KETESA_NEEDS_DOWNLOAD="no"
    else
      KETESA_NEEDS_DOWNLOAD="yes"
      KETESA_DOWNLOAD_TARGET="${PKGCACHE_DOWNLOAD_TARGET}"
    fi
  else
    echo
    echo "📁 === Offline install ==="
    echo "   Checks the local 'matrix_package' folder next to this script first"
    echo "   and lets you pick a file from it. If that folder doesn't exist,"
    echo "   you'll be asked for the full path to a ketesa.tar.gz you already"
    echo "   transferred to this server (via scp / sftp / WinSCP)."
    echo "   Get it from: https://github.com/etkecc/ketesa/releases"
    echo

    while true; do
      pkgcache_resolve_offline "ketesa.tar.gz" "no"
      if [[ -z "${PKGCACHE_SOURCE_PATH}" ]]; then
        continue
      fi
      ketesa_src="${PKGCACHE_SOURCE_PATH/#\~/$HOME}"

      if [[ -d "${ketesa_src}" ]]; then
        echo "❌ That path is a directory, not a file. Enter the path to the ketesa.tar.gz file."
        continue
      fi
      if [[ ! -r "${ketesa_src}" ]]; then
        echo "❌ The file is not readable (permission issue). Fix it with 'chmod +r'."
        continue
      fi
      if ! tar -tzf "${ketesa_src}" >/dev/null 2>&1; then
        echo "❌ That file is not a valid tar.gz archive, or it's corrupted."
        echo "   Re-download the file from the release page and try again."
        continue
      fi
      break
    done
    KETESA_NEEDS_DOWNLOAD="no"

    local guessed_ver
    guessed_ver="$(basename "${ketesa_src}" | grep -oE 'v?[0-9]+\.[0-9]+\.[0-9]+' | head -n1 || true)"
    local default_ver="${guessed_ver:-${KETESA_VERSION:-manual}}"
    echo
    read -rp "Version label to store in the config (optional) [${default_ver}]: " in_ver
    KETESA_VERSION="${in_ver:-${default_ver}}"
  fi

  local KETESA_TARGET_HS="${HS_DOMAIN:-${KETESA_REMOTE_HS}}"

  # If this is a remote/standalone install pointed at a public domain, the
  # Let's Encrypt notice email also has to be collected now, up front.
  local remote_le_email=""
  if [[ "${KETESA_MODE}" == "remote" ]] && ! is_internal_domain "${KETESA_DOMAIN}"; then
    read -rp "Email for Let's Encrypt notices [admin@${KETESA_DOMAIN}]: " in_le_email
    remote_le_email="${in_le_email:-admin@${KETESA_DOMAIN}}"
  fi

  # Reset the progress-bar engine for this install run.
  TOTAL_STEPS=6
  CURRENT_STEP=0
  FAILED_STEPS=()

  echo
  echo "🚀 Installing Ketesa — ${TOTAL_STEPS} steps ahead. Full details in ${LOG_FILE}"
  echo

  _step_ketesa_fetch_archive() {
    if [[ "${install_mode}" == "online" && "${KETESA_NEEDS_DOWNLOAD}" == "yes" ]]; then
      local url="https://github.com/etkecc/ketesa/releases/download/${KETESA_VERSION}/ketesa.tar.gz"
      if ! wget -O "${KETESA_DOWNLOAD_TARGET}" "${url}"; then
        rm -f "${KETESA_DOWNLOAD_TARGET}"
        return 1
      fi
      cp -f "${KETESA_DOWNLOAD_TARGET}" ketesa.tar.gz
    else
      # Reused from matrix_package cache (online, no download needed) or offline file.
      cp -f "${ketesa_src}" ketesa.tar.gz
    fi
  }
  run_step "⬇️  Fetching Ketesa ${KETESA_VERSION} archive" _step_ketesa_fetch_archive
  if [[ ${LAST_STEP_STATUS} -ne 0 ]]; then
    rm -f ketesa.tar.gz
    echo "❌ Could not obtain the Ketesa archive. See ${LOG_FILE} for details."
    print_install_summary
    pause
    return 1
  fi

  _step_ketesa_extract() {
    rm -rf ketesa.extract ketesa.new
    mkdir -p ketesa.extract
    tar -xzf ketesa.tar.gz -C ketesa.extract || return 1
    rm -f ketesa.tar.gz

    # Some release tarballs contain one top-level folder, others drop files
    # directly at the root. Handle both so /var/www/ketesa always ends up
    # holding index.html directly.
    local entries=(ketesa.extract/*)
    if [[ ${#entries[@]} -eq 1 && -d "${entries[0]}" ]]; then
      mv "${entries[0]}" ketesa.new
      rmdir ketesa.extract 2>/dev/null || true
    else
      mv ketesa.extract ketesa.new
    fi

    [[ -f ketesa.new/index.html ]] || return 1

    if [[ -d /var/www/ketesa ]]; then
      mv /var/www/ketesa "/var/www/ketesa.previous.$(date +%Y%m%d%H%M%S)"
    fi
    mv ketesa.new /var/www/ketesa
    echo "${KETESA_VERSION}" > /var/www/ketesa/version
  }
  run_step "📦 Extracting Ketesa archive" _step_ketesa_extract
  if [[ ${LAST_STEP_STATUS} -ne 0 ]]; then
    rm -rf ketesa.extract ketesa.new ketesa.tar.gz
    echo "❌ Extraction failed, or this isn't a valid Ketesa archive (no index.html)."
    echo "   (Make sure you picked the right file, not e.g. Element Web or something else)"
    print_install_summary
    pause
    return 1
  fi

  _step_ketesa_write_config() {
    cat > /var/www/ketesa/config.json <<EOF
{
  "restrictBaseUrl": "https://${KETESA_TARGET_HS}"
}
EOF
    chmod 644 /var/www/ketesa/config.json
  }
  run_step "🛠️  Writing config.json (restricted to ${KETESA_TARGET_HS})" _step_ketesa_write_config

  local ketesa_cert ketesa_key
  _step_ketesa_tls() {
    if [[ "${KETESA_MODE}" == "local" ]]; then
      if [[ "${SSL_MODE:-selfsigned}" == "selfsigned" ]]; then
        # Issue Ketesa its OWN leaf certificate under its own domain,
        # signed by the same internal CA. Do NOT reissue HS_DOMAIN's
        # certificate here: generate_self_signed_cert always creates a
        # fresh private key, so calling it with HS_DOMAIN as the primary
        # domain would silently rotate the key/cert Matrix, Element and
        # federation are already serving -- forcing an nginx reload of
        # the live homeserver cert on every Ketesa (re)install, and
        # breaking any client that pinned/cached the old leaf cert or
        # fingerprint instead of trusting the CA. Ketesa lives on its own
        # domain/vhost, so it only ever needs its own cert.
        generate_self_signed_cert "${KETESA_DOMAIN}"
        ketesa_cert="/etc/letsencrypt/live/${KETESA_DOMAIN}/fullchain.pem"
        ketesa_key="/etc/letsencrypt/live/${KETESA_DOMAIN}/privkey.pem"
      else
        systemctl stop nginx || true
        certbot certonly --standalone --non-interactive --agree-tos \
          -m "${LE_EMAIL:-admin@${BASE_DOMAIN}}" -d "${KETESA_DOMAIN}" || true
        systemctl start nginx || true
        ketesa_cert="/etc/letsencrypt/live/${KETESA_DOMAIN}/fullchain.pem"
        ketesa_key="/etc/letsencrypt/live/${KETESA_DOMAIN}/privkey.pem"
      fi
    else
      # Standalone/remote mode: this server has no matrix stack of its own, so
      # there's no HS_DOMAIN/ELEMENT_DOMAIN/BASE_DOMAIN cert to piggyback on --
      # issue a certificate for KETESA_DOMAIN by itself.
      if is_internal_domain "${KETESA_DOMAIN}"; then
        generate_self_signed_cert "${KETESA_DOMAIN}"
        ketesa_cert="/etc/letsencrypt/live/${KETESA_DOMAIN}/fullchain.pem"
        ketesa_key="/etc/letsencrypt/live/${KETESA_DOMAIN}/privkey.pem"
      else
        systemctl stop nginx || true
        certbot certonly --standalone --non-interactive --agree-tos \
          -m "${remote_le_email}" -d "${KETESA_DOMAIN}" || true
        systemctl start nginx || true
        ketesa_cert="/etc/letsencrypt/live/${KETESA_DOMAIN}/fullchain.pem"
        ketesa_key="/etc/letsencrypt/live/${KETESA_DOMAIN}/privkey.pem"
      fi
    fi
  }
  run_step "🔐 Preparing TLS certificate for ${KETESA_DOMAIN}" _step_ketesa_tls

  _step_ketesa_nginx_vhost() {
    snap_backup "Create/update Nginx vhost for Ketesa (${KETESA_DOMAIN})" /etc/nginx/sites-available/ketesa.conf
    cat > /etc/nginx/sites-available/ketesa.conf <<EOF
server {
    listen 80;
    server_name ${KETESA_DOMAIN};
    return 301 https://\$host\$request_uri;
}
server {
    listen 443 ssl http2;
    server_name ${KETESA_DOMAIN};

    ssl_certificate ${ketesa_cert};
    ssl_certificate_key ${ketesa_key};

    root /var/www/ketesa;
    index index.html;

    location / {
        try_files \$uri \$uri/ /index.html;
    }
}
EOF
    ln -sf /etc/nginx/sites-available/ketesa.conf /etc/nginx/sites-enabled/ketesa.conf
  }
  run_step "🌍 Creating Nginx vhost for Ketesa" _step_ketesa_nginx_vhost

  save_ketesa_config
  ensure_local_hosts_entries "${KETESA_DOMAIN}"

  run_step "🔄 Testing & reloading Nginx" bash -c 'nginx -t && systemctl reload nginx'
  local reload_status=${LAST_STEP_STATUS}

  echo
  print_install_summary

  if [[ ${reload_status} -eq 0 && "${#FAILED_STEPS[@]}" -eq 0 ]]; then
    echo "✅ Ketesa ${KETESA_VERSION} installed."
    echo "   URL:         https://${KETESA_DOMAIN}"
    echo "   Homeserver:  https://${KETESA_TARGET_HS}  (log in with an admin user)"
    if [[ "${KETESA_MODE}" == "local" ]]; then
      echo "   If the browser warns about the certificate, import the internal"
      echo "   CA once (option 10 → SSL Certificate Management)."
    else
      echo "   ⚠️  Standalone mode: this server does not manage ${KETESA_TARGET_HS}."
      echo "      If that homeserver uses Synapse workers, its own reverse proxy must"
      echo "      route /_synapse/admin/* to the Synapse main process (same fix as"
      echo "      Maintenance → Fix Ketesa / Admin API 404), or admin calls will 404"
      echo "      with M_UNRECOGNIZED even though Ketesa itself loads fine here."
    fi
    log_audit "Ketesa (Synapse Admin Panel) ${KETESA_VERSION} installed at https://${KETESA_DOMAIN} (mode=${KETESA_MODE}, target=${KETESA_TARGET_HS})"
  else
    echo "⚠️  Ketesa files were installed, but check the failed step(s) above."
    echo "   If it was the nginx reload, fix the error in the log, then run:"
    echo "     nginx -t && systemctl reload nginx"
  fi
  pause
}

update_ketesa_admin() {
  if ! load_ketesa_config 2>/dev/null; then
    print_header
    echo "❌ Ketesa is not installed yet — use 'Install / Reinstall' first."
    pause
    return 1
  fi
  install_ketesa_admin
}

uninstall_ketesa_admin() {
  print_header
  echo "🗑️  === Remove Ketesa ==="
  echo
  if ! load_ketesa_config 2>/dev/null; then
    echo "ℹ️  Ketesa is not installed."
    pause
    return 0
  fi
  read -rp "Really remove Ketesa at https://${KETESA_DOMAIN}? (y/n) [n]: " confirm
  if [[ "${confirm}" == "y" || "${confirm}" == "Y" ]]; then
    rm -f /etc/nginx/sites-enabled/ketesa.conf /etc/nginx/sites-available/ketesa.conf
    rm -rf /var/www/ketesa
    rm -f "${KETESA_CONF_FILE}"
    _nginx_safe_test_reload
    echo "✅ Ketesa removed."
    log_audit "Ketesa (Synapse Admin Panel) removed"
  else
    echo "Cancelled."
  fi
  pause
}

#############################################
# pgAdmin — PostgreSQL Web UI (manages the Matrix/Element database)
#############################################

save_pgadmin_config() {
  mkdir -p "$(dirname "${PGADMIN_CONF_FILE}")"
  snap_backup "Update pgAdmin config (${PGADMIN_CONF_FILE})" "${PGADMIN_CONF_FILE}"
  cat > "${PGADMIN_CONF_FILE}" <<EOF
PGADMIN_DOMAIN=${PGADMIN_DOMAIN}
PGADMIN_PORT=${PGADMIN_PORT}
PGADMIN_EMAIL=${PGADMIN_EMAIL}
EOF
  chmod 600 "${PGADMIN_CONF_FILE}"
}

load_pgadmin_config() {
  if [[ -f "${PGADMIN_CONF_FILE}" ]]; then
    # shellcheck disable=SC1090
    source "${PGADMIN_CONF_FILE}"
    return 0
  fi
  return 1
}

PGADMIN_VENV_DIR="/opt/pgadmin4-venv"
PGADMIN_DATA_DIR="/var/lib/pgadmin4"
PGADMIN_LOG_DIR="/var/log/pgadmin4"
PGADMIN_SYSTEM_USER="pgadmin4"

# Try official PyPI first, then fall back to Iranian PyPI mirrors (in
# order) if it fails/times out -- Docker Hub is blocked by CloudFront
# geo-restrictions for some countries, but plain pip/PyPI usually still
# works there; these mirrors are an extra safety net for cases where
# pypi.org itself is slow/unreachable.
_PGADMIN_PIP_MIRRORS=(
  ""  # empty = official PyPI, tried first
  "https://mirror-pypi.runflare.com/simple"
  "https://package-mirror.liara.ir/repository/pypi/simple"
)

# pip install $* with automatic mirror fallback. Returns 0 on first
# mirror that succeeds, 1 if all of them fail.
_pip_install_with_fallback() {
  local pip_bin="${PGADMIN_VENV_DIR}/bin/pip"
  local mirror host
  for mirror in "${_PGADMIN_PIP_MIRRORS[@]}"; do
    if [[ -z "${mirror}" ]]; then
      echo "🌐 pip: trying official PyPI..."
      if "${pip_bin}" install -q "$@"; then
        return 0
      fi
    else
      host="$(printf '%s' "${mirror}" | awk -F/ '{print $3}')"
      echo "🌐 pip: trying Iranian mirror ${host}..."
      if "${pip_bin}" install -q --index-url "${mirror}" --trusted-host "${host}" "$@"; then
        return 0
      fi
    fi
  done
  return 1
}

# Installs (or verifies) the pgAdmin4 Python venv. Uses PyPI (pip), NOT
# Docker Hub -- Docker Hub's blob storage is served via AWS CloudFront,
# which geo-blocks some countries (403 "blocked access from your
# country"); PyPI/pip has no such restriction, so this is the reliable
# path for those servers. If pypi.org itself is unreachable, falls back
# to Iranian PyPI mirrors automatically (see _PGADMIN_PIP_MIRRORS above).
ensure_pgadmin_venv() {
  ensure_pkg python3-venv
  ensure_pkg python3-pip

  if [[ ! -x "${PGADMIN_VENV_DIR}/bin/python3" ]]; then
    python3 -m venv "${PGADMIN_VENV_DIR}"
  fi

  _pip_install_with_fallback --upgrade pip wheel || true
  _pip_install_with_fallback pgadmin4 gunicorn || return 1

  if ! id "${PGADMIN_SYSTEM_USER}" >/dev/null 2>&1; then
    useradd --system --no-create-home --shell /usr/sbin/nologin "${PGADMIN_SYSTEM_USER}"
  fi
}

# Resolves the directory the pgAdmin4 wheel was installed into inside the
# venv's site-packages. NOTE: the pgadmin4 wheel is a flat file/asset dump
# (no __init__.py), so it is NOT an importable Python package -- `import
# pgadmin4` fails with ModuleNotFoundError even though the files are right
# there. We locate it via sysconfig + a plain directory check instead.
_pgadmin_app_dir() {
  local site_packages dir
  site_packages="$("${PGADMIN_VENV_DIR}/bin/python3" -c \
    "import sysconfig; print(sysconfig.get_paths()['purelib'])")"
  dir="${site_packages}/pgadmin4"
  if [[ -f "${dir}/setup.py" ]]; then
    echo "${dir}"
    return 0
  fi
  # Fallback: search for it, in case the wheel ever changes its layout.
  find "${site_packages}" -maxdepth 2 -name "setup.py" -path "*pgadmin4*" -exec dirname {} \; | head -n1
}

install_pgadmin() {
  print_header
  echo "🐘 === pgAdmin — PostgreSQL Web UI ==="
  echo
  echo "pgAdmin gives you a web UI to browse/query the PostgreSQL database used"
  echo "by Matrix Synapse / Element (rooms, users, media metadata, etc). It runs"
  echo "natively as a Gunicorn service (installed via pip, no Docker/Docker Hub"
  echo "involved) and is reverse-proxied by Nginx with TLS, just like Ketesa."
  echo

  load_config 2>/dev/null || true
  if [[ -z "${PG_DB:-}" ]]; then
    echo "⚠️  No PostgreSQL database found in ${CONFIG_FILE} yet."
    echo "   Run option 1 (Install / Reinstall Matrix stack) first, or continue"
    echo "   anyway if you plan to add the connection manually inside pgAdmin."
    read -rp "Continue installing pgAdmin without a known DB? (y/n) [y]: " go_anyway
    if [[ "${go_anyway:-y}" != "y" && "${go_anyway:-y}" != "Y" ]]; then
      return 1
    fi
  fi

  load_pgadmin_config 2>/dev/null || true

  local default_domain="${PGADMIN_DOMAIN:-pgadmin.${BASE_DOMAIN:-${HS_DOMAIN:-localhost}}}"
  read -rp "Domain for pgAdmin [${default_domain}]: " in_domain
  PGADMIN_DOMAIN="${in_domain:-${default_domain}}"

  # Interactive: which port pgAdmin should come up on (localhost only —
  # Nginx is what's actually exposed publicly, on 443).
  local default_port="${PGADMIN_PORT:-5050}"
  while true; do
    read -rp "Local port for pgAdmin to listen on (127.0.0.1) [${default_port}]: " in_port
    PGADMIN_PORT="${in_port:-${default_port}}"
    if [[ "${PGADMIN_PORT}" =~ ^[0-9]+$ ]] && (( PGADMIN_PORT >= 1 && PGADMIN_PORT <= 65535 )); then
      break
    fi
    echo "❌ Enter a valid port number (1-65535)."
  done

  local is_first_install="yes"
  [[ -f "${PGADMIN_DATA_DIR}/pgadmin4.db" ]] && is_first_install="no"

  local default_email="${PGADMIN_EMAIL:-admin@${PGADMIN_DOMAIN}}"
  local pgadmin_password=""
  if [[ "${is_first_install}" == "yes" ]]; then
    read -rp "Admin login email for pgAdmin [${default_email}]: " in_email
    PGADMIN_EMAIL="${in_email:-${default_email}}"

    while [[ -z "${pgadmin_password}" ]]; do
      read -rsp "Admin login password for pgAdmin: " pgadmin_password
      echo
      if [[ ${#pgadmin_password} -lt 8 ]]; then
        echo "❌ Password must be at least 8 characters."
        pgadmin_password=""
      fi
    done
  else
    echo "ℹ️  pgAdmin login already configured (${PGADMIN_EMAIL:-unknown}) — keeping it."
    echo "   (Delete ${PGADMIN_DATA_DIR}/pgadmin4.db first if you want to reset the login.)"
  fi

  local le_email=""
  if ! is_internal_domain "${PGADMIN_DOMAIN}"; then
    read -rp "Email for Let's Encrypt notices [admin@${PGADMIN_DOMAIN}]: " in_le_email
    le_email="${in_le_email:-admin@${PGADMIN_DOMAIN}}"
  fi

  TOTAL_STEPS=8
  CURRENT_STEP=0
  FAILED_STEPS=()

  run_step "🐍 Installing pgAdmin4 (pip/PyPI) into a Python venv" ensure_pgadmin_venv
  if [[ ${LAST_STEP_STATUS} -ne 0 ]]; then
    echo "❌ Could not set up the pgAdmin Python environment. See ${LOG_FILE} for details."
    print_install_summary
    pause
    return 1
  fi

  local PGADMIN_APP_DIR
  PGADMIN_APP_DIR="$(_pgadmin_app_dir)"
  if [[ -z "${PGADMIN_APP_DIR}" || ! -d "${PGADMIN_APP_DIR}" ]]; then
    echo "❌ Could not locate the installed pgadmin4 package inside the venv."
    echo "   See ${LOG_FILE} for details."
    print_install_summary
    pause
    return 1
  fi

  _step_pgadmin_datadirs() {
    mkdir -p "${PGADMIN_DATA_DIR}/sessions" "${PGADMIN_DATA_DIR}/storage" \
      "${PGADMIN_DATA_DIR}/azurecredentialcache" "${PGADMIN_DATA_DIR}/kerberoscache" \
      "${PGADMIN_LOG_DIR}"
    chown -R "${PGADMIN_SYSTEM_USER}:${PGADMIN_SYSTEM_USER}" "${PGADMIN_DATA_DIR}" "${PGADMIN_LOG_DIR}"
  }
  run_step "📁 Preparing data/log directories" _step_pgadmin_datadirs

  _step_pgadmin_config_local() {
    cat > "${PGADMIN_APP_DIR}/config_local.py" <<EOF
LOG_FILE = '${PGADMIN_LOG_DIR}/pgadmin4.log'
SQLITE_PATH = '${PGADMIN_DATA_DIR}/pgadmin4.db'
SESSION_DB_PATH = '${PGADMIN_DATA_DIR}/sessions'
STORAGE_DIR = '${PGADMIN_DATA_DIR}/storage'
AZURE_CREDENTIAL_CACHE_DIR = '${PGADMIN_DATA_DIR}/azurecredentialcache'
KERBEROS_CCACHE_DIR = '${PGADMIN_DATA_DIR}/kerberoscache'
SERVER_MODE = True
EOF
    chmod 644 "${PGADMIN_APP_DIR}/config_local.py"
  }
  run_step "🛠️  Writing config_local.py" _step_pgadmin_config_local

  if [[ "${is_first_install}" == "yes" ]]; then
    _step_pgadmin_setup_user() {
      sudo -u "${PGADMIN_SYSTEM_USER}" -H env "PATH=${PGADMIN_VENV_DIR}/bin:${PATH}" \
        PGADMIN_SETUP_EMAIL="${PGADMIN_EMAIL}" PGADMIN_SETUP_PASSWORD="${pgadmin_password}" \
        "${PGADMIN_VENV_DIR}/bin/python3" "${PGADMIN_APP_DIR}/setup.py"
    }
    run_step "👤 Creating the initial pgAdmin admin account" _step_pgadmin_setup_user
    if [[ ${LAST_STEP_STATUS} -ne 0 ]]; then
      echo "❌ Could not create the pgAdmin admin account. See ${LOG_FILE} for details."
      print_install_summary
      pause
      return 1
    fi
  else
    run_step "👤 Admin account already exists, skipping" true
  fi

  _step_pgadmin_servers_json() {
    mkdir -p /etc/matrix-pgadmin
    if [[ -n "${PG_DB:-}" ]]; then
      cat > /etc/matrix-pgadmin/servers.json <<EOF
{
  "Servers": {
    "1": {
      "Name": "Matrix Synapse DB",
      "Group": "Servers",
      "Host": "${PG_HOST:-127.0.0.1}",
      "Port": ${PG_PORT:-5432},
      "MaintenanceDB": "${PG_DB}",
      "Username": "${PG_USER}",
      "SSLMode": "prefer"
    }
  }
}
EOF
      sudo -u "${PGADMIN_SYSTEM_USER}" -H "${PGADMIN_VENV_DIR}/bin/python3" "${PGADMIN_APP_DIR}/setup.py" \
        --load-servers /etc/matrix-pgadmin/servers.json --user "${PGADMIN_EMAIL}" --replace
    fi
  }
  run_step "🧾 Registering the Matrix DB server entry" _step_pgadmin_servers_json

  _step_pgadmin_systemd() {
    cat > /etc/systemd/system/pgadmin4.service <<EOF
[Unit]
Description=pgAdmin4 Web UI (matrix-stack managed)
After=network.target postgresql.service

[Service]
Type=simple
User=${PGADMIN_SYSTEM_USER}
Group=${PGADMIN_SYSTEM_USER}
Environment=PYTHONPATH=${PGADMIN_APP_DIR}
WorkingDirectory=${PGADMIN_APP_DIR}
ExecStart=${PGADMIN_VENV_DIR}/bin/gunicorn --bind 127.0.0.1:${PGADMIN_PORT} --workers=1 --threads=25 --chdir ${PGADMIN_APP_DIR} pgAdmin4:app
Restart=always
RestartSec=3

[Install]
WantedBy=multi-user.target
EOF
    systemctl daemon-reload
    systemctl enable --now pgadmin4
    systemctl restart pgadmin4
  }
  run_step "⚙️  Creating/starting the pgadmin4 systemd service (port ${PGADMIN_PORT})" _step_pgadmin_systemd
  if [[ ${LAST_STEP_STATUS} -ne 0 ]]; then
    echo "❌ Could not start the pgAdmin service. See ${LOG_FILE} for details."
    print_install_summary
    pause
    return 1
  fi

  local pgadmin_cert pgadmin_key
  _step_pgadmin_tls() {
    if is_internal_domain "${PGADMIN_DOMAIN}"; then
      generate_self_signed_cert "${PGADMIN_DOMAIN}"
    else
      systemctl stop nginx || true
      certbot certonly --standalone --non-interactive --agree-tos \
        -m "${le_email}" -d "${PGADMIN_DOMAIN}" || true
      systemctl start nginx || true
    fi
    pgadmin_cert="/etc/letsencrypt/live/${PGADMIN_DOMAIN}/fullchain.pem"
    pgadmin_key="/etc/letsencrypt/live/${PGADMIN_DOMAIN}/privkey.pem"
  }
  run_step "🔐 Preparing TLS certificate for ${PGADMIN_DOMAIN}" _step_pgadmin_tls
  pgadmin_cert="/etc/letsencrypt/live/${PGADMIN_DOMAIN}/fullchain.pem"
  pgadmin_key="/etc/letsencrypt/live/${PGADMIN_DOMAIN}/privkey.pem"

  _step_pgadmin_nginx_vhost() {
    snap_backup "Create/update Nginx vhost for pgAdmin (${PGADMIN_DOMAIN})" /etc/nginx/sites-available/pgadmin.conf
    cat > /etc/nginx/sites-available/pgadmin.conf <<EOF
server {
    listen 80;
    server_name ${PGADMIN_DOMAIN};
    return 301 https://\$host\$request_uri;
}
server {
    listen 443 ssl http2;
    server_name ${PGADMIN_DOMAIN};

    ssl_certificate ${pgadmin_cert};
    ssl_certificate_key ${pgadmin_key};

    client_max_body_size 50m;

    location / {
        proxy_pass http://127.0.0.1:${PGADMIN_PORT};
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        proxy_read_timeout 300s;
    }
}
EOF
    ln -sf /etc/nginx/sites-available/pgadmin.conf /etc/nginx/sites-enabled/pgadmin.conf
  }
  run_step "🌍 Creating Nginx vhost for pgAdmin" _step_pgadmin_nginx_vhost

  save_pgadmin_config
  ensure_local_hosts_entries "${PGADMIN_DOMAIN}"

  run_step "🔄 Testing & reloading Nginx" bash -c 'nginx -t && systemctl reload nginx'
  local reload_status=${LAST_STEP_STATUS}

  echo
  print_install_summary

  if [[ ${reload_status} -eq 0 && "${#FAILED_STEPS[@]}" -eq 0 ]]; then
    echo "✅ pgAdmin installed."
    echo "   URL:      https://${PGADMIN_DOMAIN}"
    echo "   Login:    ${PGADMIN_EMAIL}"
    if [[ -n "${PG_DB:-}" ]]; then
      echo "   The Matrix Synapse database ('${PG_DB}') is pre-registered under"
      echo "   'Servers' -- open it and enter the PostgreSQL password once:"
      echo "     ${PG_PASS:-<see Information -> Show Connection Info>}"
    fi
    if is_internal_domain "${PGADMIN_DOMAIN}"; then
      echo "   If the browser warns about the certificate, import the internal"
      echo "   CA once (Authentication & Security -> SSL Certificate Management)."
    fi
    log_audit "pgAdmin installed at https://${PGADMIN_DOMAIN} (local port ${PGADMIN_PORT})"
  else
    echo "⚠️  pgAdmin was installed, but check the failed step(s) above."
    echo "   If it was the nginx reload, fix the error in the log, then run:"
    echo "     nginx -t && systemctl reload nginx"
  fi
  pause
}

uninstall_pgadmin() {
  print_header
  echo "🗑️  === Remove pgAdmin ==="
  echo
  if ! load_pgadmin_config 2>/dev/null; then
    echo "ℹ️  pgAdmin is not installed."
    pause
    return 0
  fi
  read -rp "Really remove pgAdmin at https://${PGADMIN_DOMAIN}? (y/n) [n]: " confirm
  if [[ "${confirm}" == "y" || "${confirm}" == "Y" ]]; then
    read -rp "Also delete pgAdmin's data (login, saved queries/preferences)? (y/n) [n]: " rm_data
    systemctl disable --now pgadmin4 >/dev/null 2>&1 || true
    rm -f /etc/systemd/system/pgadmin4.service
    systemctl daemon-reload
    if [[ "${rm_data}" == "y" || "${rm_data}" == "Y" ]]; then
      rm -rf "${PGADMIN_DATA_DIR}" "${PGADMIN_LOG_DIR}" "${PGADMIN_VENV_DIR}"
      userdel "${PGADMIN_SYSTEM_USER}" >/dev/null 2>&1 || true
    fi
    rm -f /etc/nginx/sites-enabled/pgadmin.conf /etc/nginx/sites-available/pgadmin.conf
    rm -rf /etc/matrix-pgadmin
    rm -f "${PGADMIN_CONF_FILE}"
    _nginx_safe_test_reload
    echo "✅ pgAdmin removed."
    log_audit "pgAdmin removed"
  else
    echo "Cancelled."
  fi
  pause
}

pgadmin_menu() {
  while true; do
    print_header
    load_pgadmin_config 2>/dev/null || true
    echo "🐘 === pgAdmin — PostgreSQL Web UI ==="
    echo "    (manage the PostgreSQL database behind Matrix/Element)"
    echo
    if [[ -n "${PGADMIN_DOMAIN:-}" ]]; then
      echo "── Current state ─────────────────────────"
      printf "  %-12s https://%s\n" "URL:" "${PGADMIN_DOMAIN}"
      printf "  %-12s %s\n" "Login:" "${PGADMIN_EMAIL:-unknown}"
      printf "  %-12s 127.0.0.1:%s\n" "Port:" "${PGADMIN_PORT:-unknown}"
      printf "  %-12s %s\n" "Service:" "$(systemctl is-active pgadmin4 2>/dev/null || echo 'not found')"
      echo "─────────────────────────────────────────────"
    else
      echo "Not installed yet."
    fi
    echo
    echo "1) 📥 Install / Reinstall"
    echo "2) 🗑️  Remove"
    echo "3) 🔙 Back"
    read -rp "Choose [1-3]: " opt
    case "${opt}" in
      1) install_pgadmin  || true ;;
      2) uninstall_pgadmin  || true ;;
      3) return 0 ;;
      *) echo "Invalid option."; sleep 1 ;;
    esac
  done
}

# Build the curl TLS options needed to reach a self-signed-CA-issued
# homeserver (used by both the token helper and the login-flows checker).
_ketesa_curl_tls_opts() {
  if [[ "${SSL_MODE:-selfsigned}" == "selfsigned" && -f "${LOCAL_CA_CERT}" ]]; then
    echo "--cacert" "${LOCAL_CA_CERT}"
  fi
}

# Ask for a homeserver + username/password, log in via the Matrix Client-
# Server API, and print the resulting access_token -- ready to paste into
# Ketesa's "Token" tab. This is the same request Ketesa itself makes; doing
# it here just skips typing the password into a browser field.
get_ketesa_access_token() {
  print_header
  echo "🔑 === Get a Matrix Access Token (for Ketesa's Token tab) ==="
  echo
  load_config 2>/dev/null || true
  load_ketesa_config 2>/dev/null || true
  local default_hs="${HS_DOMAIN:-}"
  read -rp "Homeserver domain [${default_hs}]: " in_hs
  local hs="${in_hs:-${default_hs}}"
  if [[ -z "${hs}" ]]; then
    echo "❌ No homeserver domain given (and none saved yet)."
    pause
    return 1
  fi

  read -rp "Username (local part, e.g. admin — not @admin:${hs}): " user
  if [[ -z "${user}" ]]; then
    echo "❌ Username cannot be empty."
    pause
    return 1
  fi
  read -rsp "Password: " pass
  echo
  if [[ -z "${pass}" ]]; then
    echo "❌ Password cannot be empty."
    pause
    return 1
  fi

  local -a tls_opts=()
  mapfile -t tls_opts < <(_ketesa_curl_tls_opts)

  echo
  echo "🔎 Logging in to https://${hs}..."
  local resp
  resp="$(curl -sS "${tls_opts[@]}" -X POST "https://${hs}/_matrix/client/v3/login" \
    -H "Content-Type: application/json" \
    -d "{\"type\":\"m.login.password\",\"identifier\":{\"type\":\"m.id.user\",\"user\":\"${user}\"},\"password\":\"${pass}\"}" \
    2>&1)"
  local curl_rc=$?
  unset pass

  if [[ ${curl_rc} -ne 0 ]]; then
    echo
    echo "❌ curl itself failed (network/TLS issue, exit code ${curl_rc}):"
    echo "${resp}" | sed 's/^/   /'
    echo
    echo "   If this mentions the certificate, your homeserver is using the"
    echo "   internal self-signed CA and curl needs to trust it explicitly --"
    echo "   already handled above via --cacert, unless SSL_MODE isn't"
    echo "   'selfsigned' in ${CONFIG_FILE}. You can also test manually with:"
    echo "     curl -k https://${hs}/_matrix/client/v3/login"
    pause
    return 1
  fi

  local token
  token="$(echo "${resp}" | jq -r '.access_token // empty' 2>/dev/null)"

  if [[ -n "${token}" ]]; then
    echo
    echo "✅ Logged in. Paste these into Ketesa's 'Token' tab:"
    echo
    echo "   Homeserver URL: https://${hs}"
    echo "   Access token:   ${token}"
    echo
    log_audit "Ketesa: access token issued for user '${user}' on ${hs}"
  else
    echo
    echo "❌ Login failed. Server response:"
    echo "${resp}" | (jq . 2>/dev/null || cat) | sed 's/^/   /'
    echo
    echo "   Common causes: wrong username/password, or the server isn't"
    echo "   advertising the login type this used (m.login.password)."
    echo "   Check option 3 below (\"Check server login flows\") to see what"
    echo "   https://${hs} actually advertises."
  fi
  pause
}

# Show exactly what /_matrix/client/v3/login advertises -- this is the same
# endpoint Ketesa's login page reads to decide which tabs/flows to show.
# Useful when Ketesa says "This server advertises sign-in methods Ketesa
# doesn't support": the raw JSON here shows precisely which flow types are
# present, so the mismatch can be diagnosed instead of guessed at.
check_ketesa_login_flows() {
  print_header
  echo "🔍 === Check Server Login Flows ==="
  echo
  load_config 2>/dev/null || true
  local default_hs="${HS_DOMAIN:-}"
  read -rp "Homeserver domain [${default_hs}]: " in_hs
  local hs="${in_hs:-${default_hs}}"
  if [[ -z "${hs}" ]]; then
    echo "❌ No homeserver domain given (and none saved yet)."
    pause
    return 1
  fi

  local -a tls_opts=()
  mapfile -t tls_opts < <(_ketesa_curl_tls_opts)

  echo
  echo "🔎 GET https://${hs}/_matrix/client/v3/login"
  local resp
  resp="$(curl -sS "${tls_opts[@]}" "https://${hs}/_matrix/client/v3/login" 2>&1)"
  local curl_rc=$?

  if [[ ${curl_rc} -ne 0 ]]; then
    echo
    echo "❌ curl failed (exit code ${curl_rc}):"
    echo "${resp}" | sed 's/^/   /'
    pause
    return 1
  fi

  echo
  echo "${resp}" | (jq . 2>/dev/null || cat)
  echo
  echo "ℹ️  Ketesa's login page understands: m.login.password, m.login.sso,"
  echo "   m.login.token, and MAS (via the org.matrix.msc3824... SSO flag or"
  echo "   /_matrix/client/v1/auth_metadata). If \"flows\" above only lists"
  echo "   something else (or is empty), that's the mismatch Ketesa is"
  echo "   complaining about -- worth checking homeserver.yaml's"
  echo "   password_config / sso / oidc_providers sections."
  pause
}

ketesa_menu() {
  while true; do
    print_header
    load_ketesa_config 2>/dev/null || true
    echo "🧭 === Ketesa — Matrix/Synapse Admin Panel ==="
    echo "    (manage rooms, channels, users, media — https://github.com/etkecc/ketesa)"
    echo
    if [[ -n "${KETESA_DOMAIN:-}" ]]; then
      echo "── Current state ─────────────────────────"
      printf "  %-12s https://%s\n" "URL:" "${KETESA_DOMAIN}"
      printf "  %-12s %s\n" "Version:" "${KETESA_VERSION:-unknown}"
      echo "─────────────────────────────────────────────"
    else
      echo "Not installed yet."
    fi
    echo
    echo "1) 📥 Install / Reinstall"
    echo "2) 🔑 Get access token (homeserver + user/pass → token for the Token tab)"
    echo "3) 🔍 Check server login flows (diagnose 'sign-in methods' errors)"
    echo "4) ⬆️  Update (install a different/latest version)"
    echo "5) 🗑️  Remove"
    echo "6) Back"
    read -rp "Choose [1-6]: " opt
    case "${opt}" in
      1) install_ketesa_admin  || true ;;
      2) get_ketesa_access_token  || true ;;
      3) check_ketesa_login_flows  || true ;;
      4) update_ketesa_admin  || true ;;
      5) uninstall_ketesa_admin  || true ;;
      6) return 0 ;;
      *) echo "Invalid option."; sleep 1 ;;
    esac
  done
}

#############################################
# Scheduled / Automatic Backups
#############################################

SCHEDULED_BACKUP_CRON="/etc/cron.d/matrix-scheduled-backup"

# Show current scheduled backup status
show_scheduled_backup_status() {
  print_header
  echo "⏰ === Scheduled Backup Status ==="
  echo

  if [[ -f "${SCHEDULED_BACKUP_CRON}" ]]; then
    echo "✅ Scheduled backup is ACTIVE"
    echo
    echo "Cron file: ${SCHEDULED_BACKUP_CRON}"
    echo "Contents:"
    cat "${SCHEDULED_BACKUP_CRON}"
    echo
    echo "── Backup history ──────────────────────────────"
    local backup_dir="/root/matrix-backups"
    if [[ -d "${backup_dir}" ]]; then
      echo "Total backups: $(ls -1 "${backup_dir}"/*.tar.gz 2>/dev/null | wc -l)"
      echo "Total size:    $(du -sh "${backup_dir}" 2>/dev/null | awk '{print $1}')"
      echo
      echo "Last 5 backups:"
      ls -lht "${backup_dir}"/*.tar.gz 2>/dev/null | head -5 || echo "  (none)"
    else
      echo "❌ Backup directory not found."
    fi
  else
    echo "❌ No scheduled backup configured."
    echo "   Use 'Setup scheduled backup' to enable automatic daily backups."
  fi

  echo
  echo "── Cron daemon status ────────────────────────────"
  systemctl is-active --quiet cron 2>/dev/null && echo "cron: ✅ running" || echo "cron: ❌ not running"
  pause
}

# Setup automatic scheduled backup with cron
setup_scheduled_backup() {
  print_header
  echo "⏰ === Setup Scheduled / Automatic Backup ==="
  echo
  echo "This will create a cron job that automatically backs up:"
  echo "  🐘 PostgreSQL database (full dump)"
  echo "  🧩 Synapse config & data (keys, media, signing keys)"
  echo "  🌐 Nginx configs"
  echo "  📞 TURN config"
  echo "  🔐 SSL certificates"
  echo
  echo "Schedules:"
  echo "1) Daily   (every day at 02:00 AM) — recommended"
  echo "2) Weekly  (every Sunday at 02:00 AM)"
  echo "3) Daily + Weekly (daily at 02:00, weekly full on Sunday)"
  echo "4) Custom (specify your own cron expression)"
  echo "5) Back"
  read -rp "Choose [1-5]: " opt

  local cron_expr="" label=""
  case "${opt}" in
    1)
      cron_expr="0 2 * * *"
      label="Daily at 02:00 AM"
      ;;
    2)
      cron_expr="0 2 * * 0"
      label="Weekly on Sunday at 02:00 AM"
      ;;
    3)
      cron_expr="0 2 * * *"
      label="Daily at 02:00 AM"
      ;;
    4)
      echo
      echo "Enter cron expression (e.g. '0 3 * * *' for daily at 3AM):"
      read -rp "Cron expression: " cron_expr
      label="Custom: ${cron_expr}"
      ;;
    5) return 0 ;;
    *) echo "Invalid option."; sleep 1; return 0 ;;
  esac

  if [[ -z "${cron_expr}" ]]; then
    echo "❌ No cron expression provided."
    pause; return 1
  fi

  # Create the backup script that cron will call
  local backup_script="/usr/local/bin/matrix-auto-backup.sh"
  echo
  echo "Creating backup script: ${backup_script}"

  mkdir -p /root/matrix-backups

  snap_backup "Regenerate scheduled backup script" "${backup_script}"
  cat > "${backup_script}" <<'BSCRIPT'
#!/usr/bin/env bash
# Auto-backup script for Matrix Stack
# Generated by Matrix Stack Manager — do not edit manually.
# This script is called by cron.

set -euo pipefail

LOG_FILE="/var/log/matrix-stack-install.log"
CONFIG_FILE="/etc/matrix-stack.conf"
BACKUP_DIR="/root/matrix-backups"
TIMESTAMP="$(date +%Y%m%d-%H%M%S)"

echo "[$(date '+%Y-%m-%d %H:%M:%S')] ⏰ Scheduled backup starting..." >> "${LOG_FILE}"

# Load config
if [[ -f "${CONFIG_FILE}" ]]; then
  # shellcheck disable=SC1090
  source "${CONFIG_FILE}"
else
  echo "[$(date '+%Y-%m-%d %H:%M:%S')] ❌ Config file not found. Backup aborted." >> "${LOG_FILE}"
  exit 1
fi

mkdir -p "${BACKUP_DIR}"

# --- 1) PostgreSQL dump ---
PG_DUMP_FILE="${BACKUP_DIR}/synapse-db-${TIMESTAMP}.dump"
if command -v pg_dump >/dev/null 2>&1; then
  if PGPASSWORD="${PG_PASS}" pg_dump -h "${PG_HOST}" -p "${PG_PORT}" -U "${PG_USER}" -F c -f "${PG_DUMP_FILE}" "${PG_DB}" 2>>"${LOG_FILE}"; then
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] ✅ DB dump: ${PG_DUMP_FILE}" >> "${LOG_FILE}"
  else
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] ⚠️  DB dump failed." >> "${LOG_FILE}"
    rm -f "${PG_DUMP_FILE}"
    PG_DUMP_FILE=""
  fi
else
  echo "[$(date '+%Y-%m-%d %H:%M:%S')] ⚠️  pg_dump not found. Skipping DB dump." >> "${LOG_FILE}"
  PG_DUMP_FILE=""
fi

# --- 2) Collect paths ---
PATHS=(
  "/etc/matrix-synapse"
  "/etc/nginx/sites-available"
  "/etc/nginx/sites-enabled"
  "/etc/nginx/conf.d"
  "/etc/turnserver.conf"
  "/var/lib/matrix-synapse"
  "/var/www/element"
  "${CONFIG_FILE}"
)
[[ -f "/etc/matrix-stack-ldap.conf" ]] && PATHS+=("/etc/matrix-stack-ldap.conf")
[[ -f "/etc/matrix-stack-workers.conf" ]] && PATHS+=("/etc/matrix-stack-workers.conf")
[[ -n "${PG_DUMP_FILE}" && -f "${PG_DUMP_FILE}" ]] && PATHS+=("${PG_DUMP_FILE}")
PATHS+=("/etc/letsencrypt")

# --- 3) Create tar.gz ---
BACKUP_FILE="${BACKUP_DIR}/matrix-backup-${TIMESTAMP}.tar.gz"
tar -czf "${BACKUP_FILE}" "${PATHS[@]}" 2>>"${LOG_FILE}" || \
  tar -czf "${BACKUP_FILE}" "${PATHS[@]}" 2>>"${LOG_FILE}"

# Clean up temp dump
[[ -n "${PG_DUMP_FILE}" ]] && rm -f "${PG_DUMP_FILE}"

# --- 4) Rotate old backups (keep last 30) ---
cd "${BACKUP_DIR}"
ls -1t matrix-backup-*.tar.gz 2>/dev/null | tail -n +31 | xargs -r rm -f

echo "[$(date '+%Y-%m-%d %H:%M:%S')] ✅ Backup complete: ${BACKUP_FILE}" >> "${LOG_FILE}"

# Audit log
AUDIT_LOG="/var/log/matrix-stack-audit.log"
echo "$(date '+%Y-%m-%d %H:%M:%S') | root | SCHEDULED_BACKUP ${BACKUP_FILE}" >> "${AUDIT_LOG}"
BSCRIPT

  chmod +x "${backup_script}"

  # Install cron job
  mkdir -p "$(dirname "${SCHEDULED_BACKUP_CRON}")"
  snap_backup "Update scheduled backup cron (${label})" "${SCHEDULED_BACKUP_CRON}"
  cat > "${SCHEDULED_BACKUP_CRON}" <<CRON
# Matrix Stack Manager — Scheduled Backup
# Schedule: ${label}
# Backup script: ${backup_script}
# Backup dir: /root/matrix-backups/
# Logs: /var/log/matrix-stack-install.log

SHELL=/bin/bash
PATH=/usr/local/sbin:/usr/local/bin:/usr/sbin:/usr/bin:/sbin:/bin

${cron_expr} root ${backup_script} >> /var/log/matrix-stack-install.log 2>&1
CRON

  chmod 644 "${SCHEDULED_BACKUP_CRON}"

  # Ensure cron is running
  systemctl enable cron 2>/dev/null || true
  systemctl start cron 2>/dev/null || true

  # If option 3 (Daily + Weekly), add second cron for weekly full backup
  if [[ "${opt}" == "3" ]]; then
    local weekly_script="/usr/local/bin/matrix-auto-backup-weekly.sh"
    cp -a "${backup_script}" "${weekly_script}"
    sed -i 's/matrix-backup-/matrix-weekly-backup-/g' "${weekly_script}"
    chmod +x "${weekly_script}"

    echo "" >> "${SCHEDULED_BACKUP_CRON}"
    echo "# Weekly full backup (Sunday 02:00)" >> "${SCHEDULED_BACKUP_CRON}"
    echo "0 2 * * 0 root ${weekly_script} >> /var/log/matrix-stack-install.log 2>&1" >> "${SCHEDULED_BACKUP_CRON}"
  fi

  echo
  echo "✅ Scheduled backup configured!"
  echo "   Schedule:    ${label}"
  echo "   Cron file:  ${SCHEDULED_BACKUP_CRON}"
  echo "   Script:     ${backup_script}"
  echo "   Backup dir: /root/matrix-backups/"
  echo "   Log file:   ${LOG_FILE}"
  echo
  echo "🔄 Running an immediate test backup..."
  "${backup_script}"
  echo
  echo "💡 To view backups: ls -lht /root/matrix-backups/"
  echo "💡 To restore:     use menu option 30 (Restore backup)"

  log_audit "Scheduled backup configured: ${label}"
  pause
}

# Remove scheduled backup cron job
remove_scheduled_backup() {
  print_header
  echo "🗑️  === Remove Scheduled Backup ==="
  echo

  if [[ ! -f "${SCHEDULED_BACKUP_CRON}" ]]; then
    echo "No scheduled backup is currently active."
    pause; return 0
  fi

  echo "Current cron file: ${SCHEDULED_BACKUP_CRON}"
  cat "${SCHEDULED_BACKUP_CRON}"
  echo
  read -rp "Remove scheduled backup? (y/n): " confirm
  if [[ "${confirm}" != "y" && "${confirm}" != "Y" ]]; then
    echo "Cancelled."
    pause; return 0
  fi

  rm -f "${SCHEDULED_BACKUP_CRON}"
  rm -f /usr/local/bin/matrix-auto-backup.sh
  rm -f /usr/local/bin/matrix-auto-backup-weekly.sh

  echo "✅ Scheduled backup removed."
  echo "   ⚠️  Existing backups in /root/matrix-backups/ are NOT deleted."
  echo "   To delete them: rm -rf /root/matrix-backups/"
  log_audit "Scheduled backup removed"
  pause
}

# Menu for scheduled backups
scheduled_backup_menu() {
  while true; do
    print_header
    echo "⏰ === Scheduled / Automatic Backups ==="
    echo

    local status="❌ not configured"
    [[ -f "${SCHEDULED_BACKUP_CRON}" ]] && status="✅ active"

    echo "Status: ${status}"
    echo
    echo "1) Setup scheduled backup (daily / weekly / custom)"
    echo "2) View backup status & history"
    echo "3) Remove scheduled backup"
    echo "4) Back to main menu"
    read -rp "Choose [1-4]: " opt

    case "${opt}" in
      1) setup_scheduled_backup  || true ;;
      2) show_scheduled_backup_status  || true ;;
      3) remove_scheduled_backup  || true ;;
      4) return 0 ;;
      *) echo "Invalid option."; sleep 1 ;;
    esac
  done
}

#############################################
# Backup / Restore
#############################################

do_backup() {
  local include_le="${1:-no}"
  local backup_dir="/root/matrix-backups"
  mkdir -p "${backup_dir}"
  local ts
  ts="$(date +%Y%m%d-%H%M%S)"
  local out="${backup_dir}/matrix-backup-${ts}.tar.gz"

  local pg_dump_file=""
  if load_config; then
    ensure_pg_client
    pg_dump_file="${backup_dir}/synapse-db-${ts}.dump"
    echo "🐘 Dumping PostgreSQL database '${PG_DB}'..."
    if PGPASSWORD="${PG_PASS}" pg_dump -h "${PG_HOST}" -p "${PG_PORT}" -U "${PG_USER}" -F c -f "${pg_dump_file}" "${PG_DB}" 2>/dev/null; then
      echo "✅ DB dump created: ${pg_dump_file}"
    else
      echo "⚠️  DB dump failed (continuing with file backup only)."
      pg_dump_file=""
    fi
  fi

  local paths=(
    "/etc/matrix-synapse"
    "/etc/nginx/sites-available"
    "/etc/nginx/sites-enabled"
    "/etc/nginx/conf.d"
    "/etc/turnserver.conf"
    "/var/lib/matrix-synapse"
    "${CONFIG_FILE}"
  )
  [[ -f "${LDAP_CONF_FILE}" ]] && paths+=("${LDAP_CONF_FILE}")
  [[ -f "${WORKERS_CONF_FILE}" ]] && paths+=("${WORKERS_CONF_FILE}")
  [[ -n "${pg_dump_file}" && -f "${pg_dump_file}" ]] && paths+=("${pg_dump_file}")

  if [[ "${include_le}" == "yes" ]]; then
    paths+=("/etc/letsencrypt")
  fi

  echo "Creating backup: ${out}"
  tar -czf "${out}" "${paths[@]}" 2>/dev/null || tar -czf "${out}" "${paths[@]}"

  [[ -n "${pg_dump_file}" ]] && rm -f "${pg_dump_file}"

  echo "✅ Backup created: ${out}"
  log_audit "Backup created: ${out}"
  LAST_BACKUP_PATH="${out}"
}

backup_server() {
  print_header
  echo "💾 === Backup Server ==="
  echo

  echo "Include /etc/letsencrypt (SSL certs) in backup?"
  echo "1) Yes"
  echo "2) No"
  read -rp "Choose [1-2]: " inc

  if [[ "${inc}" == "1" ]]; then
    do_backup "yes"
  else
    do_backup "no"
  fi

  pause
}

restore_backup() {
  print_header
  echo "♻️  === Restore Backup ==="
  echo

  local backup_dir="/root/matrix-backups"
  if [[ ! -d "${backup_dir}" ]]; then
    echo "❌ Backup directory not found: ${backup_dir}"
    pause
    return 1
  fi

  echo "Available backups:"
  ls -1 "${backup_dir}"/*.tar.gz 2>/dev/null || { echo "❌ No backups found."; pause; return 1; }
  echo
  read -rp "Enter full path to backup file: " file

  if [[ -z "${file}" || ! -f "${file}" ]]; then
    echo "❌ Backup file not found."
    pause
    return 1
  fi

  echo "⚠️  This will overwrite current config/files."
  read -rp "Are you sure you want to restore? (y/n): " CONFIRM
  if [[ "${CONFIRM}" != "y" && "${CONFIRM}" != "Y" ]]; then
    echo "Cancelled."
    pause
    return 0
  fi

  echo
  echo "📦 Taking a safety backup of the CURRENT state first, in case this"
  echo "   restore causes a problem and you need to go back..."
  do_backup "no"
  local safety_backup="${LAST_BACKUP_PATH:-}"
  [[ -n "${safety_backup}" ]] && echo "   Safety backup: ${safety_backup}"

  echo "Stopping services..."
  systemctl stop matrix-synapse || true
  systemctl stop coturn || true
  systemctl stop nginx || true

  echo "Extracting backup..."
  tar -xzf "${file}" -C /

  echo "Checking for a PostgreSQL dump inside the backup..."
  local dump_file
  dump_file="$(tar -tzf "${file}" 2>/dev/null | grep -E 'synapse-db-.*\.dump$' | head -n1 || true)"
  if [[ -n "${dump_file}" && -f "/${dump_file}" ]] && load_config; then
    read -rp "Restore PostgreSQL database from dump found in backup? (y/n): " PGRESTORE
    if [[ "${PGRESTORE}" == "y" || "${PGRESTORE}" == "Y" ]]; then
      ensure_pg_client
      echo "⚠️  This will overwrite the current database '${PG_DB}'."
      if PGPASSWORD="${PG_PASS}" pg_restore -h "${PG_HOST}" -p "${PG_PORT}" -U "${PG_USER}" -d "${PG_DB}" --clean --if-exists "/${dump_file}"; then
        echo "✅ Database restored."
      else
        echo "⚠️  Database restore reported errors (review output above)."
      fi
    fi
  fi

  fix_synapse_perms 2>/dev/null || true

  local nginx_ok=1
  echo "Testing nginx config..."
  if ! nginx -t; then
    nginx_ok=0
  fi

  echo "Starting services..."
  systemctl start nginx 2>/dev/null || nginx_ok=0
  systemctl restart coturn 2>/dev/null || true

  local synapse_ok=1
  if ! systemctl restart matrix-synapse 2>/dev/null; then
    synapse_ok=0
  else
    sleep 3
    systemctl is-active --quiet matrix-synapse || synapse_ok=0
  fi

  log_audit "Restore performed from ${file}"

  if [[ ${synapse_ok} -eq 1 && ${nginx_ok} -eq 1 ]]; then
    echo "✅ Restore complete. Synapse and Nginx are both up."
  else
    echo
    echo "❌ Restore was applied, but something did NOT come back up cleanly:"
    [[ ${synapse_ok} -eq 0 ]] && echo "   - matrix-synapse is NOT active."
    [[ ${nginx_ok} -eq 0 ]]   && echo "   - Nginx failed its config test or failed to start."
    if [[ ${synapse_ok} -eq 0 ]]; then
      echo
      echo "   Last 30 lines of the Synapse journal:"
      echo "   ────────────────────────────────────────────"
      journalctl -u matrix-synapse -n 30 --no-pager 2>/dev/null | sed 's/^/   /'
      echo "   ────────────────────────────────────────────"
    fi
    if [[ ${nginx_ok} -eq 0 ]]; then
      echo
      echo "   nginx -t output:"
      echo "   ────────────────────────────────────────────"
      nginx -t 2>&1 | sed 's/^/   /'
      echo "   ────────────────────────────────────────────"
    fi
    if [[ -n "${safety_backup}" ]]; then
      echo
      echo "   A safety backup of the state right before this restore was"
      echo "   saved at: ${safety_backup}"
      echo "   Run this menu again and restore that file to undo this restore."
    fi
  fi
  pause
}

#############################################
# Update Element Web
#############################################

update_element_web() {
  print_header
  echo "⬆️  === Update Element Web ==="
  echo

  if ! load_config; then
    echo "⚠️  Config not found at ${CONFIG_FILE}. You can still update Element files."
  fi

  ensure_pkg jq
  ensure_pkg curl
  ensure_pkg wget

  echo "Choose Element version:"
  echo "1) Enter version manually (recommended)"
  echo "2) Use latest (GitHub API)"
  echo "3) Back"
  read -rp "Choose [1-3]: " opt

  local ver=""
  case "${opt}" in
    1)
      read -rp "Enter version (example: 1.12.7): " ver
      ;;
    2)
      echo "Fetching latest version..."
      local tag
      tag="$(curl -fsS https://api.github.com/repos/element-hq/element-web/releases/latest | jq -r '.tag_name')" || tag=""
      if [[ -z "${tag}" || "${tag}" == "null" ]]; then
        echo "❌ Could not fetch latest version."
        pause
        return 1
      fi
      ver="${tag#v}"
      echo "Latest: ${ver}"
      ;;
    3) return 0 ;;
    *) echo "Invalid option."; pause; return 1 ;;
  esac

  if [[ -z "${ver}" ]]; then
    echo "❌ Version is required."
    pause
    return 1
  fi

  local url="https://github.com/element-hq/element-web/releases/download/v${ver}/element-v${ver}.tar.gz"
  local tmp
  tmp="$(mktemp -d)"
  local extracted="${tmp}/element-v${ver}"

  # Reset the progress-bar engine for this run.
  TOTAL_STEPS=4
  CURRENT_STEP=0
  FAILED_STEPS=()

  echo
  echo "🚀 Updating Element Web to v${ver} — ${TOTAL_STEPS} steps ahead. Full details in ${LOG_FILE}"
  echo

  _step_update_el_download() {
    wget -O "${tmp}/element.tar.gz" "${url}"
  }
  run_step "⬇️  Downloading Element Web v${ver}" _step_update_el_download
  if [[ ${LAST_STEP_STATUS} -ne 0 ]]; then
    rm -rf "${tmp}" || true
    echo "❌ Could not download Element Web v${ver}. See ${LOG_FILE} for details."
    print_install_summary
    pause
    return 1
  fi

  _step_update_el_extract() {
    tar -xvf "${tmp}/element.tar.gz" -C "${tmp}" >/dev/null
    [[ -d "${extracted}" ]] || return 1
  }
  run_step "📦 Extracting archive" _step_update_el_extract
  if [[ ${LAST_STEP_STATUS} -ne 0 ]]; then
    rm -rf "${tmp}" || true
    echo "❌ Extraction failed, or unexpected archive content. See ${LOG_FILE} for details."
    print_install_summary
    pause
    return 1
  fi

  _step_update_el_backup() {
    if [[ -f /var/www/element/config.json ]]; then
      cp -a /var/www/element/config.json "${tmp}/config.json.backup"
    fi
    # Keep a rollback copy at /var/www/element.previous
    if [[ -d /var/www/element ]]; then
      rm -rf /var/www/element.previous
      mv /var/www/element /var/www/element.previous
    fi
  }
  run_step "💾 Backing up config.json & previous version" _step_update_el_backup

  _step_update_el_deploy() {
    mv "${extracted}" /var/www/element

    # Restore the backed-up config.json (overwrite the new version's default) --
    # it has the correct homeserver URL, E2EE settings, LDAP/Jitsi/branding, etc.
    if [[ -f "${tmp}/config.json.backup" ]]; then
      cp -a "${tmp}/config.json.backup" /var/www/element/config.json
    fi

    # Verify that the config.json has a valid default_server_config
    _ensure_element_default_server || true

    systemctl reload nginx || true
  }
  run_step "🚀 Deploying new version" _step_update_el_deploy

  rm -rf "${tmp}" || true

  echo
  print_install_summary

  if [[ "${#FAILED_STEPS[@]}" -eq 0 ]]; then
    log_audit "Element Web updated to v${ver}"
    echo "✅ Element updated to v${ver}."
    echo "💡 Hard-refresh your browser (Ctrl+Shift+R) to see the new version."
  else
    echo "⚠️  Element Web update ran into problems — check the failed step(s) above."
  fi
  pause
}

rollback_element_web() {
  print_header
  echo "↩️  === Rollback Element Web to previous version ==="
  echo

  if [[ ! -d /var/www/element.previous ]]; then
    echo "❌ No previous version found to roll back to."
    pause
    return 1
  fi

  read -rp "Are you sure you want to rollback Element Web? (y/n): " CONFIRM
  if [[ "${CONFIRM}" != "y" && "${CONFIRM}" != "Y" ]]; then
    echo "Cancelled."
    pause
    return 0
  fi

  rm -rf /var/www/element.rolledback
  mv /var/www/element /var/www/element.rolledback
  mv /var/www/element.previous /var/www/element

  systemctl reload nginx || true
  log_audit "Element Web rolled back to previous version"
  echo "✅ Rolled back."
  pause
}

#############################################
# Updates (Matrix Synapse server + Element Web)
#############################################

update_matrix_synapse() {
  print_header
  echo "🔄 === Update Matrix Synapse (Server) ==="
  echo

  if ! load_config; then
    echo "⚠️  Config not found. Run Install first."
    pause
    return 1
  fi

  local current_version candidate_version
  current_version="$(dpkg-query -W -f='${Version}' matrix-synapse-py3 2>/dev/null || echo unknown)"
  echo "📦 Current installed version: ${current_version}"

  echo "🔍 Checking matrix.org repository for updates..."
  apt update

  candidate_version="$(apt-cache policy matrix-synapse-py3 2>/dev/null | awk '/Candidate:/{print $2}')"
  echo "📦 Candidate version available: ${candidate_version:-unknown}"

  if [[ -n "${candidate_version}" && "${current_version}" == "${candidate_version}" ]]; then
    echo "✅ Already up to date (${current_version}). Nothing to do."
    pause
    return 0
  fi

  echo
  read -rp "Continue with update from ${current_version} to ${candidate_version:-latest}? (y/n): " CONFIRM
  if [[ "${CONFIRM}" != "y" && "${CONFIRM}" != "Y" ]]; then
    echo "Cancelled."
    pause
    return 0
  fi

  export DEBIAN_FRONTEND=noninteractive

  # Reset the progress-bar engine for this run.
  TOTAL_STEPS=5
  CURRENT_STEP=0
  FAILED_STEPS=()

  echo
  echo "🚀 Updating Synapse — ${TOTAL_STEPS} steps ahead. Full details in ${LOG_FILE}"
  echo

  run_step "💾 Taking a safety backup before updating" do_backup "no"

  _step_synapse_upd_stop() {
    systemctl stop 'matrix-synapse-worker@*' 2>/dev/null || true
    systemctl stop matrix-synapse || true
  }
  run_step "⏸️  Stopping Synapse and any workers gracefully" _step_synapse_upd_stop

  _step_synapse_upd_upgrade() {
    apt install --only-upgrade -y matrix-synapse-py3
  }
  run_step "⬆️  Upgrading matrix-synapse-py3 package" _step_synapse_upd_upgrade
  if [[ ${LAST_STEP_STATUS} -ne 0 ]]; then
    systemctl start matrix-synapse || true
    log_audit "Synapse update FAILED (was ${current_version})"
    echo "❌ Upgrade failed. See ${LOG_FILE} for details. Synapse was restarted on the old version."
    print_install_summary
    pause
    return 1
  fi

  _step_synapse_upd_start() {
    systemctl start matrix-synapse
    local tries=0
    until curl -fsS "http://127.0.0.1:8008/_matrix/client/versions" >/dev/null 2>&1; do
      tries=$((tries + 1))
      if [[ ${tries} -ge 30 ]]; then
        echo "Synapse did not respond after ~60s. Check: journalctl -u matrix-synapse -n 100"
        break
      fi
      sleep 2
    done
  }
  run_step "🔄 Starting Synapse & waiting for it to come online" _step_synapse_upd_start

  _step_synapse_upd_workers() {
    if load_workers_config; then
      local i
      for i in $(seq 1 "${NUM_GENERIC_WORKERS:-0}"); do
        systemctl start "matrix-synapse-worker@generic_worker${i}.service" 2>/dev/null || true
      done
      if [[ "${FED_SENDER_ENABLED:-false}" == "true" ]]; then
        systemctl start "matrix-synapse-worker@federation_sender1.service" 2>/dev/null || true
      fi
    fi
  }
  run_step "👷 Starting workers again (if configured)" _step_synapse_upd_workers

  local new_version
  new_version="$(dpkg-query -W -f='${Version}' matrix-synapse-py3 2>/dev/null || echo unknown)"

  echo
  print_install_summary

  if [[ "${#FAILED_STEPS[@]}" -eq 0 ]]; then
    echo "✅ Synapse updated: ${current_version} -> ${new_version}"
    log_audit "Synapse updated: ${current_version} -> ${new_version}"
  else
    echo "⚠️  Synapse update ran into problems — check the failed step(s) above."
    log_audit "Synapse update finished with errors: ${current_version} -> ${new_version}"
  fi
  pause
}

check_updates_status() {
  print_header
  echo "🔍 === Check for Updates ==="
  echo

  echo "📦 Matrix Synapse:"
  local cur cand
  cur="$(dpkg-query -W -f='${Version}' matrix-synapse-py3 2>/dev/null || echo 'not installed')"
  echo "   Installed: ${cur}"
  apt update >/dev/null 2>&1 || apt update
  cand="$(apt-cache policy matrix-synapse-py3 2>/dev/null | awk '/Candidate:/{print $2}')"
  echo "   Candidate: ${cand:-unknown}"
  if [[ -n "${cand}" && "${cur}" != "${cand}" ]]; then
    echo "   🔔 Update available!"
  else
    echo "   ✅ Up to date."
  fi
  echo

  echo "🧩 Element Web:"
  ensure_pkg jq
  ensure_pkg curl
  local installed_ver latest_ver
  installed_ver="unknown"
  if [[ -f /var/www/element/version ]]; then
    installed_ver="$(cat /var/www/element/version 2>/dev/null)"
  fi
  echo "   Installed (reported): ${installed_ver}"
  latest_ver="$(curl -fsS https://api.github.com/repos/element-hq/element-web/releases/latest 2>/dev/null | jq -r '.tag_name' 2>/dev/null || echo unknown)"
  latest_ver="${latest_ver#v}"
  echo "   Latest on GitHub:     ${latest_ver}"
  if [[ "${installed_ver}" != "unknown" && "${latest_ver}" != "unknown" && "${installed_ver}" != "${latest_ver}" ]]; then
    echo "   🔔 Update available!"
  fi

  pause
}

updates_menu() {
  while true; do
    print_header
    echo "⬆️  === Updates (Matrix Synapse & Element Web) ==="
    echo "1) Check for updates (version comparison)"
    echo "2) Update Matrix Synapse (server) — auto-backup, DB/media untouched"
    echo "3) Update Element Web — keeps a rollback copy"
    echo "4) Rollback Element Web to previous version"
    echo "5) Back to main menu"
    read -rp "Choose [1-5]: " opt
    case "${opt}" in
      1) check_updates_status  || true ;;
      2) update_matrix_synapse  || true ;;
      3) update_element_web  || true ;;
      4) rollback_element_web  || true ;;
      5) return 0 ;;
      *) echo "Invalid option."; sleep 1 ;;
    esac
  done
}

#############################################
# Full Uninstall / Purge
#############################################

full_uninstall() {
  local mode="1"
  local confirm="DELETE"
  if [[ "${NON_INTERACTIVE:-}" != "true" ]]; then
    print_header
    echo "🧨 === FULL UNINSTALL / PURGE ==="
    echo
    echo "Choose a mode:"
    echo "  1) 🔥 QUICK — purge EVERYTHING and reset to a clean server"
    echo "     (packages, files, DB, SSL, logs, bots, NAS mount, configs)"
    echo "  2) 🎛️  INTERACTIVE — pick what to remove, category by category"
    echo "  0) Cancel"
    read -rp "Choose [0-2]: " mode
    case "${mode}" in
      0) return 0 ;;
      1|2) ;;
      *) echo "Invalid option."; sleep 1; return 0 ;;
    esac

    echo
    read -rp "⚠️  This is DESTRUCTIVE. Type DELETE to continue: " confirm
  fi

  if [[ "${confirm}" != "DELETE" ]]; then
    echo "Cancelled."
    pause
    return 0
  fi

  load_config || true

  # Decision flags (y/n). Default everything to 'y' for QUICK mode.
  local rm_pkgs="y" rm_files="y" rm_db="y" rm_ssl="y"
  local rm_logs="y" rm_bots="y" rm_nas="y" rm_node="y"
  # PostgreSQL SERVER package itself (not just the DB/role) — only ever
  # removed if explicitly requested in INTERACTIVE mode. QUICK mode never
  # touches it, matching the documented "keeps the server itself" behavior.
  local rm_pg_server="n"

  if [[ "${mode}" == "2" ]]; then
    print_header
    echo "🎛️  === Interactive Uninstall ==="
    echo "For each item, choose: y = remove, n = keep."
    echo "(detected state shown in brackets)"
    echo

    ask_yn() {  # $1=label  $2=detected-state-text  -> sets global R
      local ans
      while true; do
        read -rp "  $1 [$2] remove? (y/n): " ans
        case "${ans}" in
          y|Y) R="y"; return ;;
          n|N) R="n"; return ;;
          *) echo "     please answer y or n" ;;
        esac
      done
    }

    ask_yn "1) Packages (synapse, nginx, coturn, redis, prometheus, fail2ban)" \
      "$(dpkg -s matrix-synapse-py3 >/dev/null 2>&1 && echo 'installed' || echo 'absent')"; rm_pkgs="${R}"
    ask_yn "2) Matrix/Element files & configs" \
      "$([[ -d /etc/matrix-synapse || -d /var/www/element ]] && echo 'present' || echo 'absent')"; rm_files="${R}"
    ask_yn "3) PostgreSQL database & role (keeps the server itself)" \
      "$([[ -n ${PG_DB:-} ]] && echo \"db=${PG_DB}\" || echo 'none')"; rm_db="${R}"
    if [[ "${rm_db}" == "y" ]]; then
      ask_yn "   3b) Also remove the PostgreSQL SERVER itself (package + all data)" \
        "$(pkg_is_installed postgresql && echo 'installed' || echo 'absent')"; rm_pg_server="${R}"
    fi
    ask_yn "4) SSL certificates (/etc/letsencrypt)" \
      "$([[ -d /etc/letsencrypt ]] && echo 'present' || echo 'absent')"; rm_ssl="${R}"
    ask_yn "5) Matrix logs (synapse/nginx/audit/install)" \
      "$([[ -d /var/log/matrix-synapse || -f ${AUDIT_LOG} ]] && echo 'present' || echo 'absent')"; rm_logs="${R}"
    ask_yn "6) Bots (Mjolnir/hookshot, services, matrix-bots user)" \
      "$([[ -d ${BOT_BASE:-/opt/matrix-bots} ]] && echo 'present' || echo 'absent')"; rm_bots="${R}"
    ask_yn "7) NAS media mount (fstab entry, credentials, /mnt/matrix-nas)" \
      "$(mount | grep -q /mnt/matrix-nas && echo 'mounted' || echo 'absent')"; rm_nas="${R}"
    ask_yn "8) Node.js (installed by this script for bots)" \
      "$(command -v node >/dev/null 2>&1 && echo \"node $(node -v 2>/dev/null)\" || echo 'absent')"; rm_node="${R}"

    echo
    echo "Summary: pkgs=${rm_pkgs} files=${rm_files} db=${rm_db} pg_server=${rm_pg_server} ssl=${rm_ssl}"
    echo "         logs=${rm_logs} bots=${rm_bots} nas=${rm_nas} node=${rm_node}"
    read -rp "Proceed with these choices? (y/n): " go
    [[ "${go}" == "y" || "${go}" == "Y" ]] || { echo "Cancelled."; pause; return 0; }
  fi

  # ---- STOP everything first -------------------------------------------------
  echo
  echo "🛑 Stopping services..."
  systemctl stop 'matrix-synapse-worker@*' 2>/dev/null || true
  systemctl stop matrix-synapse 2>/dev/null || true
  systemctl stop coturn 2>/dev/null || true
  systemctl stop nginx 2>/dev/null || true
  # Stop any installed bots
  systemctl stop matrix-bot-mjolnir 2>/dev/null || true
  systemctl stop matrix-bot-hookshot 2>/dev/null || true

  # ---- 1) NAS mount ----------------------------------------------------------
  if [[ "${rm_nas}" == "y" ]]; then
    echo "📤 Removing NAS media mount..."
    if mount | grep -q '/mnt/matrix-nas'; then
      umount /mnt/matrix-nas 2>/dev/null || umount -l /mnt/matrix-nas 2>/dev/null || true
    fi
    sed -i '/ \/mnt\/matrix-nas /d' /etc/fstab 2>/dev/null || true
    rm -f /etc/matrix-nas-credentials 2>/dev/null || true
    rmdir /mnt/matrix-nas 2>/dev/null || true
  fi

  # ---- 2) Packages -----------------------------------------------------------
  if [[ "${rm_pkgs}" == "y" ]]; then
    echo "📦 Purging packages..."
    apt purge -y matrix-synapse-py3 coturn nginx certbot python3-certbot-nginx \
      redis-server prometheus prometheus-node-exporter fail2ban 2>/dev/null || true
    apt autoremove -y 2>/dev/null || true
  fi

  # ---- 3) Files & configs ----------------------------------------------------
  if [[ "${rm_files}" == "y" ]]; then
    echo "🗂️  Removing Matrix/Element files..."
    rm -rf /etc/matrix-synapse /var/lib/matrix-synapse 2>/dev/null || true
    rm -f /etc/turnserver.conf /etc/default/coturn 2>/dev/null || true
    rm -rf /var/www/element /var/www/element.previous /var/www/element.rolledback 2>/dev/null || true
    rm -rf /var/www/ketesa /var/www/ketesa.previous 2>/dev/null || true
    rm -f /etc/nginx/sites-available/matrix.conf /etc/nginx/sites-available/element.conf /etc/nginx/sites-available/wellknown.conf /etc/nginx/sites-available/ketesa.conf /etc/nginx/sites-available/pgadmin.conf 2>/dev/null || true
    rm -f /etc/nginx/sites-enabled/matrix.conf /etc/nginx/sites-enabled/element.conf /etc/nginx/sites-enabled/wellknown.conf /etc/nginx/sites-enabled/ketesa.conf /etc/nginx/sites-enabled/pgadmin.conf 2>/dev/null || true
    rm -f /etc/nginx/conf.d/matrix-ratelimit.conf /etc/nginx/conf.d/matrix-workers-upstream.conf 2>/dev/null || true
    rm -f /etc/fail2ban/filter.d/matrix-synapse.conf /etc/fail2ban/jail.d/matrix-synapse.conf 2>/dev/null || true
    rm -f /etc/systemd/system/matrix-synapse-worker@.service 2>/dev/null || true
    systemctl disable --now pgadmin4 >/dev/null 2>&1 || true
    rm -f /etc/systemd/system/pgadmin4.service
    rm -rf /var/lib/pgadmin4 /var/log/pgadmin4 /opt/pgadmin4-venv
    userdel pgadmin4 >/dev/null 2>&1 || true
    rm -rf /etc/matrix-pgadmin 2>/dev/null || true
    rm -f "${CONFIG_FILE}" "${LDAP_CONF_FILE}" "${WORKERS_CONF_FILE}" "${KETESA_CONF_FILE:-/etc/matrix-ketesa.conf}" "${PGADMIN_CONF_FILE:-/etc/matrix-pgadmin.conf}" 2>/dev/null || true
    systemctl daemon-reload 2>/dev/null || true
  fi

  # ---- 4) Database -------------------------------------------------------
  if [[ "${rm_db}" == "y" && -n "${PG_DB:-}" ]]; then
    echo "💾 Backing up database '${PG_DB}' and settings before removal..."
    local backup_dir="/root/matrix-backups"
    mkdir -p "${backup_dir}"
    local ts; ts="$(date +%Y%m%d-%H%M%S)"
    local dump_file="${backup_dir}/synapse-db-${ts}-before-uninstall.dump"
    local conf_backup="${backup_dir}/matrix-stack-conf-${ts}-before-uninstall.conf"

    if command -v pg_dump >/dev/null 2>&1 && [[ -n "${PG_USER:-}" ]]; then
      if PGPASSWORD="${PG_PASS:-}" pg_dump -h "${PG_HOST:-127.0.0.1}" -p "${PG_PORT:-5432}" \
          -U "${PG_USER}" -F c -f "${dump_file}" "${PG_DB}" 2>>"${LOG_FILE}"; then
        echo "   ✅ DB dump saved: ${dump_file}"
      else
        echo "   ⚠️  pg_dump failed — check ${LOG_FILE}. Continuing anyway (DROP DATABASE will still run)."
        rm -f "${dump_file}" 2>/dev/null || true
      fi
    else
      echo "   ⚠️  pg_dump not available or no DB user recorded — skipping DB dump."
    fi

    if [[ -f "${CONFIG_FILE}" ]]; then
      cp -a "${CONFIG_FILE}" "${conf_backup}" 2>/dev/null \
        && echo "   ✅ Settings backed up: ${conf_backup}"
    fi

    echo "🐘 Dropping PostgreSQL database '${PG_DB}' and role '${PG_USER}'..."
    if command -v psql >/dev/null 2>&1 || dpkg -s postgresql >/dev/null 2>&1; then
      sudo -u postgres psql -c "DROP DATABASE IF EXISTS ${PG_DB};" 2>/dev/null || true
      sudo -u postgres psql -c "DROP ROLE IF EXISTS ${PG_USER};" 2>/dev/null || true
    else
      echo "   (postgresql not present — nothing to drop)"
    fi
  fi

  # ---- 4b) PostgreSQL SERVER itself (package + all data) -----------------
  # Only reached if explicitly requested in INTERACTIVE mode (rm_pg_server
  # defaults to "n" and QUICK mode never sets it). This purges the actual
  # server, unlike step 4 above which only drops the Matrix DB/role.
  if [[ "${rm_pg_server}" == "y" ]]; then
    echo "🐘 Purging PostgreSQL SERVER package and data directories..."
    systemctl stop postgresql 2>/dev/null || true
    apt purge -y 'postgresql*' 2>/dev/null || true
    apt autoremove -y 2>/dev/null || true
    rm -rf /etc/postgresql /var/lib/postgresql /var/log/postgresql 2>/dev/null || true
    echo "   ✅ PostgreSQL server removed."
  fi

  # ---- 5) SSL certificates ---------------------------------------------------
  if [[ "${rm_ssl}" == "y" ]]; then
    echo "🔐 Removing SSL certificates..."
    # If "Matrix/Element files & configs" was kept (rm_files=n), a vhost
    # referencing these certs may still be enabled. Deleting the certs out
    # from under it would leave Nginx unable to start -- which then also
    # blocks any future "apt install nginx" (dpkg gets stuck in a
    # not-configured state). Disable (don't delete) any such vhost first.
    local vf
    for vf in matrix.conf element.conf wellknown.conf ketesa.conf; do
      if [[ -e "/etc/nginx/sites-enabled/${vf}" ]]; then
        echo "   Disabling /etc/nginx/sites-enabled/${vf} (still referenced these certs)"
        mv "/etc/nginx/sites-enabled/${vf}" "/etc/nginx/sites-enabled/${vf}.disabled-by-uninstall" 2>/dev/null \
          || rm -f "/etc/nginx/sites-enabled/${vf}"
      fi
    done
    rm -rf /etc/letsencrypt 2>/dev/null || true
    if command -v nginx >/dev/null 2>&1; then
      nginx -t >/dev/null 2>&1 && systemctl reload nginx 2>/dev/null || true
    fi
  fi

  # ---- 6) Logs ---------------------------------------------------------------
  if [[ "${rm_logs}" == "y" ]]; then
    echo "📝 Removing logs..."
    rm -rf /var/log/matrix-synapse 2>/dev/null || true
    # Nginx logs only if nginx was purged (rm_pkgs=y); else keep for other sites
    if [[ "${rm_pkgs}" == "y" ]]; then
      rm -f /var/log/nginx/access.log* /var/log/nginx/error.log* 2>/dev/null || true
    fi
    rm -f "${AUDIT_LOG}" "${LOG_FILE}" 2>/dev/null || true
  fi

  # ---- 7) Bots ---------------------------------------------------------------
  if [[ "${rm_bots}" == "y" ]]; then
    echo "🤖 Removing bots..."
    for b in matrix-bot-mjolnir matrix-bot-hookshot; do
      systemctl disable --now "${b}" 2>/dev/null || true
      rm -f "/etc/systemd/system/${b}.service" 2>/dev/null || true
    done
    rm -rf "${BOT_BASE:-/opt/matrix-bots}" 2>/dev/null || true
    if id matrix-bots >/dev/null 2>&1; then
      userdel matrix-bots 2>/dev/null || true
    fi
    systemctl daemon-reload 2>/dev/null || true
  fi

  # ---- 8) Node.js ------------------------------------------------------------
  if [[ "${rm_node}" == "y" ]]; then
    # Only remove if installed via nodesource (this script's path)
    if dpkg -l 2>/dev/null | grep -q 'nodesource'; then
      echo "🟢 Removing Node.js (nodesource)..."
      apt purge -y nodejs 2>/dev/null || true
      rm -f /etc/apt/sources.list.d/nodesource.list 2>/dev/null || true
      rm -f /etc/apt/keyrings/nodesource.gpg 2>/dev/null || true
      apt update 2>/dev/null || true
    else
      echo "🟢 Node.js not from nodesource — left untouched."
    fi
  fi

  log_audit "Uninstall performed (mode=${mode})"

  echo
  echo "✅ Uninstall complete."
  echo "   Server is now clean. Re-run the script and choose option 1 to reinstall."
  pause
}

# Drop the Synapse PostgreSQL database + role and clear the DB settings
# saved in CONFIG_FILE, WITHOUT touching packages, files, SSL, or bots.
# Always takes a fresh pg_dump into the shared Matrix backup folder first
# (the same folder used by the Backup & Recovery menu), and only proceeds
# with the actual drop after an explicit confirmation once that backup is
# safely on disk.
remove_database_and_settings() {
  print_header
  echo "🐘 === Remove Database & DB-related Settings ==="
  echo

  if ! load_config || [[ -z "${PG_DB:-}" ]]; then
    echo "⚠️  No database configuration found (config missing or empty)."
    echo "   Nothing to remove."
    pause
    return 1
  fi

  echo "This will:"
  echo "  1) Back up the current database into the Matrix backup folder"
  echo "  2) Ask for a final confirmation"
  echo "  3) Drop the database + role, and clear the saved DB settings"
  echo
  echo "   Database: ${PG_DB}"
  echo "   Role:     ${PG_USER}"
  echo "   Host:     ${PG_HOST}:${PG_PORT}"
  echo "   Backup folder: /root/matrix-backups"
  echo

  ensure_pg_client

  local backup_dir="/root/matrix-backups"
  mkdir -p "${backup_dir}"
  local ts; ts="$(date +%Y%m%d-%H%M%S)"
  local dump_file="${backup_dir}/synapse-db-${ts}-before-removal.dump"

  # Reset the progress-bar engine for the backup phase.
  TOTAL_STEPS=2
  CURRENT_STEP=0
  FAILED_STEPS=()

  echo
  echo "🚀 Backing up before removal — ${TOTAL_STEPS} steps ahead. Full details in ${LOG_FILE}"
  echo

  _step_dbrm_stop_services() {
    systemctl stop 'matrix-synapse-worker@*' 2>/dev/null || true
    systemctl stop matrix-synapse 2>/dev/null || true
  }
  run_step "⏸️  Stopping Synapse & workers (release DB connections)" _step_dbrm_stop_services

  _step_dbrm_backup() {
    PGPASSWORD="${PG_PASS}" pg_dump -h "${PG_HOST}" -p "${PG_PORT}" -U "${PG_USER}" \
      -F c -f "${dump_file}" "${PG_DB}"
  }
  run_step "💾 Backing up database '${PG_DB}'" _step_dbrm_backup

  echo
  print_install_summary

  if [[ ${LAST_STEP_STATUS} -ne 0 || ! -s "${dump_file}" ]]; then
    echo "❌ Backup failed — the database will NOT be removed."
    echo "   Check ${LOG_FILE} for details, then try again."
    rm -f "${dump_file}" 2>/dev/null || true
    systemctl start matrix-synapse 2>/dev/null || true
    if load_workers_config; then
      local i
      for i in $(seq 1 "${NUM_GENERIC_WORKERS:-0}"); do
        systemctl start "matrix-synapse-worker@generic_worker${i}.service" 2>/dev/null || true
      done
      if [[ "${FED_SENDER_ENABLED:-false}" == "true" ]]; then
        systemctl start "matrix-synapse-worker@federation_sender1.service" 2>/dev/null || true
      fi
    fi
    pause
    return 1
  fi

  echo "✅ Backup saved: ${dump_file}"
  echo
  echo "⚠️  This is DESTRUCTIVE and cannot be undone, other than by restoring"
  echo "   the backup above (e.g. via option 1 → PostgreSQL restore picker,"
  echo "   or the Backup & Recovery → Restore menu)."
  local confirm="y"
  if [[ "${NON_INTERACTIVE:-}" != "true" ]]; then
    read -rp "Are you sure you want to delete the database now? (y/n): " confirm
  fi
  if [[ "${confirm}" != "y" && "${confirm}" != "Y" ]]; then
    echo "Cancelled. The backup above was kept; the database was NOT touched."
    echo "Restarting Synapse..."
    systemctl start matrix-synapse 2>/dev/null || true
    if load_workers_config; then
      local i
      for i in $(seq 1 "${NUM_GENERIC_WORKERS:-0}"); do
        systemctl start "matrix-synapse-worker@generic_worker${i}.service" 2>/dev/null || true
      done
      if [[ "${FED_SENDER_ENABLED:-false}" == "true" ]]; then
        systemctl start "matrix-synapse-worker@federation_sender1.service" 2>/dev/null || true
      fi
    fi
    pause
    return 0
  fi

  snap_backup "Remove database settings (${PG_DB})" "${CONFIG_FILE}"

  # Reset the progress-bar engine for the removal phase.
  TOTAL_STEPS=2
  CURRENT_STEP=0
  FAILED_STEPS=()

  echo
  echo "🚀 Removing database — ${TOTAL_STEPS} steps ahead. Full details in ${LOG_FILE}"
  echo

  _step_dbrm_drop() {
    # Terminate any leftover connections first, or DROP DATABASE will fail.
    (cd /tmp && sudo -u postgres psql -tAc \
      "SELECT pg_terminate_backend(pid) FROM pg_stat_activity WHERE datname='${PG_DB}' AND pid <> pg_backend_pid();") >/dev/null 2>&1 || true
    (cd /tmp && sudo -u postgres psql -c "DROP DATABASE IF EXISTS ${PG_DB};")
    (cd /tmp && sudo -u postgres psql -c "DROP ROLE IF EXISTS ${PG_USER};")
  }
  run_step "🗑️  Dropping database '${PG_DB}' and role '${PG_USER}'" _step_dbrm_drop

  _step_dbrm_clear_settings() {
    if [[ -f "${CONFIG_FILE}" ]]; then
      sed -i \
        -e "s/^PG_DB=.*/PG_DB=/" \
        -e "s/^PG_USER=.*/PG_USER=/" \
        -e "s/^PG_PASS=.*/PG_PASS=/" \
        -e "s/^PG_HOST=.*/PG_HOST=/" \
        -e "s/^PG_PORT=.*/PG_PORT=/" \
        "${CONFIG_FILE}"
    fi
  }
  run_step "🧹 Clearing saved database settings from ${CONFIG_FILE}" _step_dbrm_clear_settings

  echo
  print_install_summary
  log_audit "Database '${PG_DB}' and role '${PG_USER}' removed (backup: ${dump_file})"

  if [[ "${#FAILED_STEPS[@]}" -eq 0 ]]; then
    echo "✅ Database and related settings removed."
  else
    echo "⚠️  Database removal ran into problems — check the failed step(s) above."
  fi
  echo
  echo "ℹ️  Synapse is stopped and no longer has a database configured."
  echo "   Reinstall via option 1 (the backup above will show up there as a"
  echo "   restore option), or restore it manually with pg_restore."
  echo "   Backup kept at: ${dump_file}"
  pause
}

# Submenu for item 12 -- full stack purge, or just the database.
uninstall_menu() {
  while true; do
    print_header
    echo "🧨 === Uninstall ==="
    echo
    echo "1) 🔥 Full uninstall / purge (quick or interactive)"
    echo "2) 🐘 Remove Database & DB-related Settings (backup first)"
    echo "3) 🐘 Remove pgAdmin (PostgreSQL Web UI)"
    echo "0) Back to main menu"
    read -rp "Choose [0-3]: " opt
    case "${opt}" in
      1) full_uninstall  || true ;;
      2) remove_database_and_settings  || true ;;
      3) uninstall_pgadmin  || true ;;
      0) return 0 ;;
      *) echo "Invalid option."; sleep 1 ;;
    esac
  done
}
fix_synaps(){
    echo "ℹ️  Starting permission fix for matrix-synapse..."
    
    SYNAPSE_GROUP=$(id -gn matrix-synapse 2>/dev/null || echo nogroup)
    
    echo "🔧 Setting ownership to matrix-synapse:${SYNAPSE_GROUP}..."
    chown -R matrix-synapse:"${SYNAPSE_GROUP}" /etc/matrix-synapse /var/lib/matrix-synapse
    
    echo "🔧 Applying directory permissions (750)..."
    chmod 750 /etc/matrix-synapse /var/lib/matrix-synapse
    [[ -d /etc/matrix-synapse/conf.d ]] && chmod 750 /etc/matrix-synapse/conf.d

    echo "🔧 Applying config file permissions (640)..."
    chmod 640 /etc/matrix-synapse/*.yaml 2>/dev/null || true
    [[ -d /etc/matrix-synapse/conf.d ]] && chmod 640 /etc/matrix-synapse/conf.d/*.yaml 2>/dev/null || true
    
    echo "✅ Permissions updated successfully"
    
    echo "🔄 Restarting matrix-synapse service..."
    systemctl restart matrix-synapse
    
    sleep 2
    
    if systemctl is-active --quiet matrix-synapse; then
        echo "✅ matrix-synapse service is running successfully"
    else
        echo "❌ Error: matrix-synapse failed to start"
        echo "⚠️  Check logs with: systemctl status matrix-synapse"
        return 1
    fi
}
#############################################
# Main menu
#############################################

#############################################
# Main menu category submenus
#############################################

user_management_menu() {
  while true; do
    print_header
    echo "👤 === User Management ==="
    echo "1) 👑 Create admin user (interactive)"
    echo "2) 👤 Create normal user (interactive)"
    echo "3) 🎲 Create user with RANDOM password (auto)"
    echo "4) ♻️  Reactivate user (exists-ok)"
    echo "5) 📋 List users"
    echo "6) 🚫 Deactivate user (safe)"
    echo "7) 🔙 Back"
    read -rp "Choose [1-7]: " opt
    case "${opt}" in
      1) create_admin_user  || true ;;
      2) create_normal_user  || true ;;
      3) create_user_random_password  || true ;;
      4) reactivate_user  || true ;;
      5) list_users  || true ;;
      6) deactivate_user  || true ;;
      7) return 0 ;;
      *) echo "Invalid option."; sleep 1 ;;
    esac
  done
}

auth_security_menu() {
  while true; do
    print_header
    echo "🔐 === Authentication & Security ==="
    echo "1) 🔐 LDAP Management (AD integration + bulk import)"
    echo "2) 🛡️  Security Hardening (fail2ban, rate limits, audit log)"
    echo "3) 🔑 SSL Certificate Management (self-signed / Let's Encrypt / custom PEM)"
    echo "4) 🔐 E2EE Management (disable/enable for organization)"
    echo "5) 🔙 Back"
    read -rp "Choose [1-5]: " opt
    case "${opt}" in
      1) ldap_menu  || true ;;
      2) security_menu  || true ;;
      3) ssl_menu  || true ;;
      4) manage_e2ee  || true ;;
      5) return 0 ;;
      *) echo "Invalid option."; sleep 1 ;;
    esac
  done
}

server_config_menu() {
  while true; do
    print_header
    echo "⚙️  === Server Configuration ==="
    echo "1) ⚙️  Workers / Scaling (Redis-based replication)"
    echo "2) 📈 Monitoring (Prometheus + node_exporter)"
    echo "3) ⚡ Message rate limiting (rc_message)"
    echo "4) 🗑️  Message retention policy (auto-delete old messages)"
    echo "5) 🧹 Automatic media deletion (media_retention)"
    echo "6) 📦 Set upload limits (Nginx + Synapse)"
    echo "7) 🧾 Toggle registration ON/OFF"
    echo "8) 🚪 Room Creation Policy (allow / block)"
    echo "9) 🔍 User & Room Search Directory (enable/disable)"
    echo "10) 📧 Email / SMTP server (notifications)"
    echo "11) 🔙 Back"
    read -rp "Choose [1-11]: " opt
    case "${opt}" in
      1) workers_menu  || true ;;
      2) monitoring_menu  || true ;;
      3) manage_message_ratelimit  || true ;;
      4) manage_retention  || true ;;
      5) manage_media_retention  || true ;;
      6) set_upload_limits  || true ;;
      7) toggle_registration  || true ;;
      8) manage_room_creation  || true ;;
      9) configure_directory_search  || true ;;
      10) configure_email  || true ;;
      11) return 0 ;;
      *) echo "Invalid option."; sleep 1 ;;
    esac
  done
}

calls_video_menu() {
  while true; do
    print_header
    echo "📞 === Calls & Video ==="
    echo "1) 📞 Call Diagnostics (TURN/WebRTC)"
    echo "2) 🖥️  Screen Sharing (Element Web feature flag)"
    echo "3) 📞 Element Call integration"
    echo "4) 🔗 Jitsi video conference integration"
    echo "5) 🔙 Back"
    read -rp "Choose [1-5]: " opt
    case "${opt}" in
      1) call_diagnostics  || true ;;
      2) configure_screenshare  || true ;;
      3) configure_element_call  || true ;;
      4) configure_jitsi  || true ;;
      5) return 0 ;;
      *) echo "Invalid option."; sleep 1 ;;
    esac
  done
}

maintenance_menu() {
  while true; do
    print_header
    echo "🔧 === Maintenance & Updates ==="
    echo "1) ⬆️  Updates (Matrix Synapse & Element Web)"
    echo "2) 🔎 Health Check"
    echo "3) 🧰 Fix Wizard (interactive: pick what to fix)"
    echo "4) 🧰 Fix Synapse permissions"
    echo "5) 🛠️  Fix cross-signing endpoints (404 on device_signing/signatures upload)"
    echo "6) 🛠️  Fix Ketesa / Admin API 404 (M_UNRECOGNIZED, needed if workers are on)"
    echo "7) 🌐 Local Hosts Resolution (/etc/hosts) for .local domains"
    echo "8) 🔙 Back"
    read -rp "Choose [1-8]: " opt
    case "${opt}" in
      1) updates_menu  || true ;;
      2) health_check  || true ;;
      3) fix_wizard  || true ;;
      4) fix_synaps  || true ;;
      5) fix_master_only_endpoints  || true ;;
      6) fix_ketesa_admin_api_routing  || true ;;
      7) local_hosts_menu  || true ;;
      8) return 0 ;;
      *) echo "Invalid option."; sleep 1 ;;
    esac
  done
}

backup_menu_top() {
  while true; do
    print_header
    echo "💾 === Backup & Recovery ==="
    echo "1) 💾 Backup server"
    echo "2) ♻️  Restore backup"
    echo "3) ⏰ Scheduled / Automatic Backups (cron)"
    echo "4) 🕘 Restore Last Change (Undo a single menu action)"
    echo "5) 🔙 Back"
    read -rp "Choose [1-5]: " opt
    case "${opt}" in
      1) backup_server  || true ;;
      2) restore_backup  || true ;;
      3) scheduled_backup_menu  || true ;;
      4) undo_menu  || true ;;
      5) return 0 ;;
      *) echo "Invalid option."; sleep 1 ;;
    esac
  done
}

information_menu() {
  while true; do
    print_header
    echo "📋 === Information ==="
    echo "1) 🏷️  Show installed versions (Synapse + Element)"
    echo "2) 📋 Show Connection & Config Info"
    echo "3) 📂 Show Editable Config Paths (with file editor)"
    echo "4) 🔙 Back"
    read -rp "Choose [1-4]: " opt
    case "${opt}" in
      1) show_versions  || true ;;
      2) show_connection_info  || true ;;
      3) show_editable_paths  || true ;;
      4) return 0 ;;
      *) echo "Invalid option."; sleep 1 ;;
    esac
  done
}

#############################################
# Help & Guides
#############################################
# Read-only, informational screens. No config is touched. Meant to answer
# "what do I need before I click this?" and "what does this actually do?"
# for the parts of the menu people ask about most.

_help_header() {
  print_header
  echo "❓ ═══ Help: $1 ═══"
  echo
}

help_dns_records() {
  _help_header "DNS / hosts records needed before installing"
  echo "This stack uses FOUR domain names. Whether you need real DNS records"
  echo "or just hosts-file entries depends on whether the domains are internal"
  echo "(.local/.lan/.corp/.internal/RFC1918-style) or public."
  echo
  echo "  • HS_DOMAIN       -- the Matrix homeserver (e.g. matrix.company.local)"
  echo "  • ELEMENT_DOMAIN  -- Element Web (e.g. chat.company.local)"
  echo "  • BASE_DOMAIN     -- serves /.well-known/matrix/* (e.g. company.local)"
  echo "  • KETESA_DOMAIN   -- the admin panel, set up later (e.g. admin.company.local)"
  echo
  echo "── If the domains are INTERNAL (.local, .lan, .corp, .internal, plain"
  echo "   RFC1918 IPs, or a hostname with no dot) ──────────────────────────"
  echo "  This script detects this automatically and switches to a self-signed"
  echo "  certificate (its own internal CA) instead of Let's Encrypt, because"
  echo "  Let's Encrypt cannot issue certificates for non-public names."
  echo
  echo "  Every device that needs to reach the server (admin PCs, employee"
  echo "  laptops/phones running Element) must be able to resolve these names"
  echo "  to the server's LAN IP. This script CANNOT push that to client"
  echo "  machines -- one of the following must be done BEFORE install:"
  echo "    1) Add an A record for each domain on your internal DNS server"
  echo "       (e.g. Active Directory DNS) pointing at the server's LAN IP."
  echo "       This is the recommended option for an 800-employee network."
  echo "    2) Or, on each client machine, add a line to its hosts file"
  echo "       (Windows: C:\\Windows\\System32\\drivers\\etc\\hosts) mapping"
  echo "       each domain to the server's LAN IP."
  echo
  echo "  The server ALSO needs to resolve its own domains (for internal"
  echo "  health checks) -- that part IS handled automatically, and can be"
  echo "  redone any time from: Maintenance & Updates → Local Hosts Resolution."
  echo
  echo "── If the domains are PUBLIC (e.g. matrix.company.com) ────────────"
  echo "  You need real DNS A records at your DNS provider for HS_DOMAIN,"
  echo "  ELEMENT_DOMAIN and BASE_DOMAIN, all pointing at the server's public"
  echo "  IP. Ports 80 and 443 must be reachable from the internet so"
  echo "  Let's Encrypt can validate ownership and issue a certificate."
  echo
  echo "── Later, for Ketesa ───────────────────────────────────────────────"
  echo "  KETESA_DOMAIN needs the same treatment (internal A record/hosts"
  echo "  entry, or public A record) before you install it. See the"
  echo "  'Ketesa Admin Panel' help topic for the full picture."
  pause
}

help_install_flow() {
  _help_header "What 'Install / Reinstall' sets up"
  echo "Option 1 on the main menu runs the full stack installer. It asks for"
  echo "5 things up front -- homeserver domain, Element domain, base domain,"
  echo "public IP, and a notification email -- then runs unattended through"
  echo "17 steps, shown with a live progress bar. Full output of every step"
  echo "goes to the log file (shown at the top of the screen) so nothing is"
  echo "lost even though the screen only shows a one-line status per step."
  echo
  echo "In order, it: installs prerequisites (nginx, certbot, coturn, jq,"
  echo "PostgreSQL...), adds the official Matrix Synapse APT repo, installs"
  echo "Synapse, sets up the PostgreSQL database, obtains/generates the SSL"
  echo "certificate (Let's Encrypt or self-signed, auto-detected from the"
  echo "domains you gave), saves the config, turns on registration + media"
  echo "uploads, configures TURN (coturn) for calls, installs Element Web,"
  echo "writes its config.json, creates the three Nginx vhosts (Matrix,"
  echo "Element, well-known), and finally sets up /etc/hosts resolution for"
  echo "any internal domains."
  echo
  echo "Before running it, make sure the DNS/hosts records from the first"
  echo "help topic are already in place -- the installer doesn't create"
  echo "those for you (only the server's OWN /etc/hosts self-resolution)."
  echo
  echo "After it finishes, the very next steps are usually:"
  echo "  1) User Management → Create admin user"
  echo "  2) Log into Element Web with that admin account"
  echo "  3) (Optional) Authentication & Security → E2EE Management, if this"
  echo "     is an internal/organizational deployment"
  pause
}

help_users_tokens() {
  _help_header "Users, tokens & login"
  echo "User Management (main menu → 2) creates and manages Matrix accounts"
  echo "using Synapse's own register_new_matrix_user helper -- the supported,"
  echo "reliable way to create accounts directly on the server (no signup"
  echo "form, no email verification needed)."
  echo
  echo "  1) 👑 Create admin user  -- full admin rights (needed for Ketesa,"
  echo "     for the access-token helper below, and for managing the server)"
  echo "  2) 👤 Create normal user -- an ordinary employee account"
  echo "  3) 🎲 Random password    -- same as (2) but generates the password"
  echo "     for you (useful for bulk-creating accounts)"
  echo "  4) ♻️  Reactivate / 5) 📋 List / 6) 🚫 Deactivate"
  echo
  echo "── Access tokens (needed for Ketesa's 'Token' login tab) ───────────"
  echo "Ketesa (the admin panel) can log in two ways: username+password, or"
  echo "pasting a raw access token. Ketesa → option 2 ('Get access token')"
  echo "does the login for you (asks for homeserver + username + password)"
  echo "and prints the token to paste into Ketesa -- so the admin password"
  echo "never has to be typed into a browser field. The account used here"
  echo "must be an ADMIN account (create one first if you haven't)."
  pause
}

help_ldap() {
  _help_header "LDAP / Active Directory integration"
  echo "Authentication & Security → 1) LDAP Management lets employees log"
  echo "into Matrix/Element with their existing AD/LDAP domain credentials,"
  echo "instead of a separate Matrix password."
  echo
  echo "  1) Configure / Reconfigure LDAP -- asks for the LDAP URI, base DN,"
  echo "     bind DN/password, and the attribute AD uses for usernames."
  echo "     ⚠️  Active Directory uses 'sAMAccountName', NOT 'uid' -- using"
  echo "     'uid' is the most common reason AD logins fail to bind."
  echo "  2) Enable / Disable LDAP -- toggles it on/off without losing the"
  echo "     saved configuration."
  echo "  3) Test LDAP connection -- binds and confirms the search base/"
  echo "     credentials work BEFORE you roll it out to employees."
  echo
  echo "Before configuring this, have ready: the LDAP/AD server address,"
  echo "a service/bind account with read access to the directory, and the"
  echo "base DN (e.g. DC=company,DC=local) that contains your user accounts."
  pause
}

help_security() {
  _help_header "Security Hardening"
  echo "Authentication & Security → 2) Security Hardening applies three"
  echo "independent protections -- each can be turned on separately:"
  echo
  echo "  1) 🛡️  fail2ban -- watches the Synapse and Nginx logs for repeated"
  echo "     failed logins from the same IP and temporarily bans it (default:"
  echo "     5 failures / 10 minutes → 1 hour ban). Protects against"
  echo "     brute-force password guessing."
  echo "  2) 🚦 Nginx rate limiting -- caps requests to the /login endpoint"
  echo "     at the reverse-proxy level (5 requests/min per IP), before they"
  echo "     even reach Synapse."
  echo "  3) 🚦 Synapse rate limiting (rc_login / rc_message / rc_registration)"
  echo "     -- the same kind of protection, enforced inside Synapse itself,"
  echo "     so it still applies even for requests that bypass Nginx."
  echo "  4) 📜 View audit log -- every change any menu option here makes to"
  echo "     the server is recorded with a timestamp and username; this just"
  echo "     shows that history."
  echo
  echo "These are independent of SSL/TLS and of LDAP -- they only address"
  echo "brute-force / abuse protection, and are safe to enable together."
  pause
}

help_ssl() {
  _help_header "SSL Certificates"
  echo "Authentication & Security → 3) SSL Certificate Management, and the"
  echo "same logic runs automatically during install:"
  echo
  echo "  • Public domain     → a real Let's Encrypt certificate is requested"
  echo "    automatically (needs ports 80/443 reachable from the internet)."
  echo "  • Internal domain    → a self-signed certificate is issued instead,"
  echo "    signed by an internal CA this script creates once and reuses for"
  echo "    every certificate it issues afterwards."
  echo "  • Custom PEM          → you can also supply your own certificate +"
  echo "    private key files directly."
  echo
  echo "── The one-time step that removes browser warnings org-wide ───────"
  echo "Import ONLY the internal CA certificate (never a per-domain leaf"
  echo "cert) into your organization's trusted root store ONCE:"
  echo "    /etc/matrix-ca/ca.crt"
  echo "  • AD/Group Policy: Computer Config → Windows Settings → Security"
  echo "    Settings → Public Key Policies → Trusted Root Certification"
  echo "    Authorities → Import ca.crt"
  echo "  • Single device: certutil -addstore -f ROOT \"/etc/matrix-ca/ca.crt\""
  echo
  echo "Once the CA itself is trusted, every certificate this script issues"
  echo "now or in the future (Matrix, Element, well-known, or later Ketesa)"
  echo "is automatically trusted -- no per-device, per-domain import needed."
  pause
}

help_e2ee() {
  _help_header "E2EE Management (encryption on/off)"
  echo "Authentication & Security → 4) E2EE Management. For a self-hosted,"
  echo "organization-controlled server, end-to-end encryption often causes"
  echo "more problems than it solves: messages become unreadable across"
  echo "devices, lost devices mean lost history, and non-technical users"
  echo "struggle with key backup -- while the server itself is already"
  echo "trusted and controlled by the organization."
  echo
  echo "Option 1 (Disable E2EE) applies FOUR layers, so it can't be bypassed"
  echo "by simply using a different client:"
  echo "  1) Element Web config.json  → feature_e2ee = false (hides the UI)"
  echo "  2) /.well-known/matrix/client → io.element.e2ee.force_disable = true"
  echo "  3) Synapse power-level override → enabling encryption in a room"
  echo "     requires power level 999 (effectively nobody can turn it on)"
  echo "  4) A server-side room_policy module → Synapse itself REJECTS any"
  echo "     attempt to enable encryption, even via a raw API call, in any"
  echo "     room, old or new -- this is the layer that can't be bypassed by"
  echo "     switching clients (Android/iOS/curl all hit the same wall)."
  echo
  echo "⚠️  Known limitation: layer 2 (force_disable) isn't always fully"
  echo "   respected by the Element mobile apps (upstream bug) -- but layers"
  echo "   3 and 4 are enforced by Synapse itself regardless of client."
  echo
  echo "Option 2 (Enable E2EE) reverts all four layers back to normal"
  echo "Matrix behavior. Current state of all four is always shown at the"
  echo "top of this menu before you choose."
  pause
}

help_calls_turn() {
  _help_header "Calls & Video (TURN/coturn)"
  echo "Calls & Video → 1) Call Diagnostics checks the TURN server (coturn),"
  echo "which is what makes voice/video calls work when both sides are"
  echo "behind NAT/firewalls (almost always true on an office network)."
  echo
  echo "Required open ports (set up automatically during install, but worth"
  echo "confirming on the firewall if calls fail):"
  echo "    UDP 3478, TCP 3478, TCP 5349, UDP 49160-49200 (relay range)"
  echo
  echo "coturn is configured with 'external-ip' set to the server's public"
  echo "IP given during install -- if that IP ever changes, TURN must be"
  echo "reconfigured (reinstall, or edit /etc/turnserver.conf directly)."
  echo
  echo "  2) Screen Sharing -- Element Web feature flag, no server prereqs."
  echo "  3) Element Call    -- newer group-call widget integration."
  echo "  4) Jitsi           -- alternative video-conferencing integration,"
  echo "     for organizations that already run/prefer a Jitsi server."
  pause
}

help_ketesa() {
  _help_header "Ketesa Admin Panel — records, install steps, getting a token"
  echo "Ketesa (formerly 'Synapse Admin') is a static web page -- the browser"
  echo "talks directly to Synapse's admin API. It has no backend of its own,"
  echo "so 'installing' it just means serving its files on their own domain."
  echo
  echo "── Before installing ───────────────────────────────────────────────"
  echo "  1) Decide KETESA_DOMAIN (e.g. admin.company.local) -- it must be"
  echo "     DIFFERENT from HS_DOMAIN/ELEMENT_DOMAIN/BASE_DOMAIN."
  echo "  2) Same DNS/hosts requirement as any other domain here (see the"
  echo "     first help topic): internal domains need an internal DNS A"
  echo "     record or client hosts-file entries; public domains need a"
  echo "     real DNS A record before Let's Encrypt can issue a cert."
  echo "  3) An ADMIN Matrix account must already exist to log INTO Ketesa"
  echo "     (User Management → Create admin user, if you haven't yet)."
  echo
  echo "── Install steps (Ketesa menu → 1) Install / Reinstall) ───────────"
  echo "  It asks: local vs remote homeserver, the domain for Ketesa, and"
  echo "  online (GitHub download) vs offline (a ketesa.tar.gz you already"
  echo "  copied to the server) -- then runs with its own 6-step progress"
  echo "  bar: fetch archive → extract → write config.json → TLS cert →"
  echo "  Nginx vhost → test & reload Nginx."
  echo
  echo "  Ketesa gets its OWN certificate on its OWN domain -- it does NOT"
  echo "  reuse or regenerate the Matrix/Element certificate, so installing"
  echo "  or reinstalling Ketesa never disrupts existing Element logins."
  echo
  echo "── After installing: logging in ────────────────────────────────────"
  echo "  Open https://\${KETESA_DOMAIN} and either:"
  echo "    a) Log in with username + password directly (if the homeserver"
  echo "       advertises m.login.password -- the normal case), or"
  echo "    b) Use Ketesa menu → 2) Get access token: enter the homeserver +"
  echo "       admin username/password once, and paste the printed token"
  echo "       into Ketesa's 'Token' tab instead."
  echo "  If login fails with 'sign-in methods not supported', use Ketesa"
  echo "  menu → 3) Check server login flows to see exactly what the"
  echo "  homeserver advertises."
  echo
  echo "── If Ketesa shows blank lists / 'Unrecognized request' (404) ─────"
  echo "  This happens when Synapse workers are enabled and the worker pool"
  echo "  doesn't implement every admin-API route. Fix from: Maintenance &"
  echo "  Updates → Fix Ketesa / Admin API 404."
  pause
}

help_maintenance() {
  _help_header "Maintenance & common fixes"
  echo "Maintenance & Updates (main menu → 6):"
  echo
  echo "  1) ⬆️  Updates          -- update Synapse and/or Element Web versions"
  echo "  2) 🔎 Health Check      -- checks services, ports, certs, DNS/hosts,"
  echo "     and .well-known -- run this FIRST whenever something 'just"
  echo "     stopped working'."
  echo "  3) 🧰 Fix Wizard        -- interactive picker for common problems"
  echo "  4) 🧰 Fix Synapse permissions -- re-applies correct ownership on"
  echo "     config files under /etc/matrix-synapse/conf.d/ (a stale root:root"
  echo "     600 file here silently breaks Synapse startup)"
  echo "  5) 🛠️  Fix cross-signing endpoints -- 404s on 'Verify this device' /"
  echo "     device_signing/signatures upload, caused by workers"
  echo "  6) 🛠️  Fix Ketesa / Admin API 404 -- same root cause as (5), but for"
  echo "     the /_synapse/admin/* routes Ketesa depends on"
  echo "  7) 🌐 Local Hosts Resolution -- manage the server's OWN /etc/hosts"
  echo "     entries for internal domains (see the DNS help topic)"
  echo
  echo "Items 5 and 6 are only relevant if Server Configuration → Workers /"
  echo "Scaling is turned ON -- a single, non-worker Synapse process never"
  echo "hits either bug, since it always handles every endpoint itself."
  pause
}

help_backup() {
  _help_header "Backup & Recovery"
  echo "Backup & Recovery (main menu → 7):"
  echo
  echo "  1) 💾 Backup server       -- full backup (config, database, certs)"
  echo "  2) ♻️  Restore backup      -- restore from a previous full backup"
  echo "  3) ⏰ Scheduled backups    -- sets up a cron job for automatic,"
  echo "     recurring backups without needing to remember to run (1)"
  echo "  4) 🕘 Restore Last Change  -- a lighter-weight undo: every menu"
  echo "     action that edits a file snapshots it first, so a single bad"
  echo "     change (e.g. from E2EE Management or a Nginx vhost edit) can be"
  echo "     rolled back on its own, without restoring an entire full backup."
  echo
  echo "Use (4) for 'I just changed one thing and now something's broken';"
  echo "use (1)/(2) for disaster recovery or moving to new hardware."
  pause
}

help_menu() {
  while true; do
    print_header
    echo "❓ === Help & Guides ==="
    echo "    What you need before each step, and what each option actually does"
    echo
    echo "1)  🌐 DNS / hosts records needed before installing"
    echo "2)  🧩 What 'Install / Reinstall' sets up"
    echo "3)  👤 Users, tokens & login"
    echo "4)  🔐 LDAP / Active Directory integration"
    echo "5)  🛡️  Security Hardening"
    echo "6)  🔑 SSL Certificates (self-signed CA vs Let's Encrypt)"
    echo "7)  🔒 E2EE Management (what disabling encryption changes)"
    echo "8)  📞 Calls & Video (TURN/coturn requirements)"
    echo "9)  🧭 Ketesa Admin Panel (records, install steps, tokens)"
    echo "10) 🔧 Maintenance & common fixes"
    echo "11) 💾 Backup & Recovery"
    echo "12) 🔙 Back"
    read -rp "Choose [1-12]: " opt
    case "${opt}" in
      1) help_dns_records  || true ;;
      2) help_install_flow  || true ;;
      3) help_users_tokens  || true ;;
      4) help_ldap  || true ;;
      5) help_security  || true ;;
      6) help_ssl  || true ;;
      7) help_e2ee  || true ;;
      8) help_calls_turn  || true ;;
      9) help_ketesa  || true ;;
      10) help_maintenance  || true ;;
      11) help_backup  || true ;;
      12) return 0 ;;
      *) echo "Invalid option."; sleep 1 ;;
    esac
  done
}

#############################################
# Advanced Deployment (multi-server) — role installers
#############################################
#
# Each role installer is intentionally self-contained and only touches the
# packages/config relevant to that one role. None of these replace or call
# install_stack(); the Standard Installation path above is untouched.
#
# There is no SSH/orchestration layer in this script — each role is
# installed by running this same script ON that server and picking the
# matching role. Credentials generated on one role (e.g. PostgreSQL) are
# printed once so the admin can enter them when installing a dependent
# role (e.g. Synapse) on another server.

role_install_postgres() {
  print_header
  echo "🐘 === Advanced Deployment: PostgreSQL Role ==="
  echo "ℹ️  This installs a real PostgreSQL SERVER on THIS machine (not just a"
  echo "   connection to one elsewhere). Whichever server you point Synapse at"
  echo "   (via the PostgreSQL host field on the Synapse role) is the one that"
  echo "   needs to have gone through this role first."
  echo

  if pkg_is_installed postgresql; then
    echo "✅ PostgreSQL is already installed on this server — skipping install, will"
    echo "   just (re)configure the role/database below."
  else
    echo "📦 PostgreSQL is not installed on this server yet — installing now..."
    deploy_ensure_pkg postgresql
    deploy_ensure_pkg postgresql-contrib
    echo "✅ PostgreSQL installed."
  fi
  systemctl enable --now postgresql

  local db user pass pass2 port=5432 synapse_ip pgconf hbafile
  read -rp "Database name [synapse]: " db; db="${db:-synapse}"
  read -rp "Database user [synapse_user]: " user; user="${user:-synapse_user}"

  echo
  echo "🔑 Set the password for this database user, or leave blank to auto-generate"
  echo "   a random one (shown once, and always re-viewable via Show connection info)."
  while true; do
    read -rsp "Password (blank = auto-generate): " pass; echo
    if [[ -z "${pass}" ]]; then
      pass="$(openssl rand -hex 24)"
      echo "🎲 Generated a random password."
      break
    fi
    read -rsp "Confirm password: " pass2; echo
    if [[ "${pass}" == "${pass2}" ]]; then
      break
    fi
    echo "  ⚠️  Passwords didn't match — try again."
  done

  echo "🐘 Creating role/database..."
  if ! (cd /tmp && sudo -u postgres psql -tAc "SELECT 1 FROM pg_roles WHERE rolname='${user}'") | grep -q 1; then
    (cd /tmp && sudo -u postgres psql -c "CREATE ROLE ${user} WITH LOGIN PASSWORD '${pass}';")
  else
    (cd /tmp && sudo -u postgres psql -c "ALTER ROLE ${user} WITH LOGIN PASSWORD '${pass}';")
  fi
  if ! (cd /tmp && sudo -u postgres psql -tAc "SELECT 1 FROM pg_database WHERE datname='${db}'") | grep -q 1; then
    (cd /tmp && sudo -u postgres psql -c "CREATE DATABASE ${db} ENCODING 'UTF8' LC_COLLATE='C' LC_CTYPE='C' TEMPLATE=template0 OWNER ${user};")
  else
    echo "ℹ️  Database ${db} already exists — checking collation..."
    local existing_collate
    existing_collate="$(cd /tmp && sudo -u postgres psql -tAc "SELECT datcollate FROM pg_database WHERE datname='${db}';" | tr -d '[:space:]')"

    if [[ "${existing_collate}" != "C" ]]; then
      # Synapse REQUIRES the 'C' collation, or it fails at startup with
      # IncorrectDatabaseSetup. Rebuild the DB with 'C', preserving data.
      echo "⚠️  Existing '${db}' database has collation '${existing_collate}', but Synapse requires 'C'."
      echo "🔧 Rebuilding database with the correct collation (existing data will be preserved)..."

      local fix_dump="/tmp/${db}-collation-fix-$(date +%Y%m%d-%H%M%S).dump"
      if (cd /tmp && sudo -u postgres pg_dump -F c -f "${fix_dump}" "${db}"); then
        (cd /tmp && sudo -u postgres psql -c "DROP DATABASE ${db};")
        (cd /tmp && sudo -u postgres psql -c "CREATE DATABASE ${db} ENCODING 'UTF8' LC_COLLATE='C' LC_CTYPE='C' TEMPLATE=template0 OWNER ${user};")
        if PGPASSWORD="${pass}" pg_restore -h localhost -p "${port}" -U "${user}" -d "${db}" --clean --if-exists --no-owner "${fix_dump}"; then
          echo "✅ Database rebuilt with 'C' collation and data restored."
        else
          echo "⚠️  Database rebuilt with 'C' collation, but restoring the data reported errors — check the log."
          echo "   The dump is kept at: ${fix_dump}"
        fi
      else
        echo "❌ Could not dump the existing '${db}' database to fix its collation automatically."
        echo "   Fix it manually, e.g.:"
        echo "     sudo -u postgres psql -c \"DROP DATABASE ${db};\""
        echo "     sudo -u postgres psql -c \"CREATE DATABASE ${db} ENCODING 'UTF8' LC_COLLATE='C' LC_CTYPE='C' TEMPLATE=template0 OWNER ${user};\""
        return 1
      fi
    else
      echo "ℹ️  Database ${db} already exists with the correct collation ('C'), skipping creation."
    fi
  fi

  while true; do
    read -rp "IP/CIDR of the Synapse server allowed to connect remotely (blank = skip, configure manually later): " synapse_ip
    if [[ -z "${synapse_ip}" ]]; then
      echo "  ⚠️  Skipping remote-access rule — you'll need to add it to pg_hba.conf yourself before Synapse can connect."
      break
    fi
    if [[ "${synapse_ip}" =~ ^[0-9]{1,3}(\.[0-9]{1,3}){3}(/[0-9]{1,2})?$ ]]; then
      break
    fi
    echo "  ⚠️  '${synapse_ip}' isn't a valid IP or CIDR (e.g. 10.0.0.5 or 10.0.0.5/32) — try again."
  done
  pgconf="$(cd /tmp && sudo -u postgres psql -tAc "SHOW config_file;" | tr -d '[:space:]')"
  hbafile="$(cd /tmp && sudo -u postgres psql -tAc "SHOW hba_file;" | tr -d '[:space:]')"
  [[ -n "${pgconf}" && -f "${pgconf}" ]] && sed -i "s/^#*listen_addresses.*/listen_addresses = '*'/" "${pgconf}"
  if [[ -n "${hbafile}" && -f "${hbafile}" && -n "${synapse_ip}" ]]; then
    grep -q "${synapse_ip}" "${hbafile}" 2>/dev/null || \
      echo "host    ${db}    ${user}    ${synapse_ip}    md5" >> "${hbafile}"
  fi
  systemctl restart postgresql

  POSTGRES_HOST="$(hostname -I | awk '{print $1}')"
  DEPLOY_PG_DB="${db}"
  DEPLOY_PG_USER="${user}"
  DEPLOY_PG_PASS="${pass}"
  DEPLOY_PG_PORT="${port}"
  save_deployment_config

  echo
  echo "✅ PostgreSQL role installed on ${POSTGRES_HOST}:${port}"
  echo "   DB: ${db}   User: ${user}   Password: ${pass}"
  echo "   ℹ️  You can re-view this anytime: Deployment Management → \"Show connection info\"."
  pause
}

role_install_synapse() {
  print_header
  echo "🧩 === Advanced Deployment: Matrix Synapse Role ==="
  load_deployment_config || true

  if [[ -z "${POSTGRES_HOST:-}" || "${POSTGRES_HOST}" == "localhost" ]]; then
    echo "⚠️  ═══════════════════════════════════════════════════════════"
    echo "⚠️   Before installing Synapse, make sure PostgreSQL is ready:"
    echo "⚠️  ═══════════════════════════════════════════════════════════"
    echo "   1. Install the PostgreSQL role first — on this server or another one."
    echo "   2. Have these on hand (from that install's output, or from"
    echo "      Deployment Management → \"Show connection info\" on that server):"
    echo "        • PostgreSQL host"
    echo "        • Port (default 5432)"
    echo "        • Database name"
    echo "        • User"
    echo "        • Password"
    echo
    echo "   If you continue without this, Synapse will install but fail to"
    echo "   start until you fix the database connection afterward."
    echo
    local _confirm
    read -rp "Have you read this and are ready to continue? [y/N]: " _confirm
    if [[ "${_confirm}" != "y" && "${_confirm}" != "Y" ]]; then
      echo "Okay — install the PostgreSQL role first, then come back here."
      pause
      return 0
    fi
    echo
  fi

  echo "ℹ️  Synapse only needs to know where your PostgreSQL database is running."
  echo "   It does NOT need to know about Element, TURN, or Nginx to work."
  echo

  local hs_domain pg_host pg_port pg_db pg_user pg_pass
  prompt_domain "🌐 Matrix homeserver domain (e.g. chat.example.com)" hs_domain
  echo "   Don't know the PostgreSQL details? On the PostgreSQL server run:"
  echo "   Deployment Management → \"Show connection info\" and copy Host/DB/User/Password from there."
  prompt_remote_host "🐘 PostgreSQL host" "${POSTGRES_HOST:-localhost}" pg_host
  read -rp "🐘 PostgreSQL port [${DEPLOY_PG_PORT:-5432}]: " pg_port; pg_port="${pg_port:-${DEPLOY_PG_PORT:-5432}}"
  read -rp "🐘 PostgreSQL database [${DEPLOY_PG_DB:-synapse}]: " pg_db; pg_db="${pg_db:-${DEPLOY_PG_DB:-synapse}}"
  read -rp "🐘 PostgreSQL user [${DEPLOY_PG_USER:-synapse_user}]: " pg_user; pg_user="${pg_user:-${DEPLOY_PG_USER:-synapse_user}}"
  read -rsp "🐘 PostgreSQL password (from the PostgreSQL role install): " pg_pass; echo

  if ! pkg_is_installed matrix-synapse-py3; then
    echo
    echo "ℹ️  Matrix Synapse can be installed from the online matrix.org apt repo, or"
    echo "   from local .deb files you've already copied to this server."
    local deb_dir deb_count=0
    read -rp "📁 Path to a directory of matrix-synapse .deb files (blank = use online repo): " deb_dir
    if [[ -n "${deb_dir}" && -d "${deb_dir}" ]]; then
      deb_count="$(find "${deb_dir}" -maxdepth 1 -name '*.deb' 2>/dev/null | wc -l)"
    fi
    if [[ "${deb_count}" -gt 0 ]]; then
      echo "📂 Installing Synapse from ${deb_count} local .deb file(s) in ${deb_dir}..."
      dpkg -i "${deb_dir}"/*.deb 2>/dev/null || true
      apt-get install -f -y || true
    else
      [[ -n "${deb_dir}" ]] && echo "⚠️  No .deb files found in ${deb_dir} — falling back to the online repo."
      apt update
      DEBIAN_FRONTEND=noninteractive apt install -y matrix-synapse-py3 || {
        echo "❌ matrix-synapse-py3 install failed — see ${LOG_FILE}."
        pause; return 1
      }
    fi
    pkg_is_installed matrix-synapse-py3 || {
      echo "❌ matrix-synapse-py3 is still not installed — check ${LOG_FILE} and retry."
      pause; return 1
    }
  fi

  _ensure_yq || { echo "❌ yq not available."; pause; return 1; }
  _ensure_homeserver_yaml || { pause; return 1; }

  yaml_set_str "server_name" "${hs_domain}"
  yaml_set_str "database.name" "psycopg2"
  yaml_set_str "database.args.user" "${pg_user}"
  yaml_set_str "database.args.password" "${pg_pass}"
  yaml_set_str "database.args.database" "${pg_db}"
  yaml_set_str "database.args.host" "${pg_host}"
  yaml_set "database.args.port" "${pg_port}"

  if [[ -x /opt/venvs/matrix-synapse/bin/python ]] && \
     ! /opt/venvs/matrix-synapse/bin/python -c "import psycopg2" >/dev/null 2>&1; then
    /opt/venvs/matrix-synapse/bin/pip install psycopg2-binary >/dev/null 2>&1 || true
  fi

  SYNAPSE_HOST="$(hostname -I | awk '{print $1}')"
  HS_DOMAIN="${hs_domain}"
  DEPLOY_HS_DOMAIN="${hs_domain}"
  save_deployment_config

  systemctl enable --now matrix-synapse 2>/dev/null || true
  echo "✅ Synapse role installed on ${SYNAPSE_HOST}, using PostgreSQL at ${pg_host}:${pg_port}."
  pause
}

role_install_element() {
  print_header
  echo "🧭 === Advanced Deployment: Element Web Role ==="
  load_deployment_config || true
  echo "ℹ️  Element Web only needs to know where Synapse (the homeserver) is running."
  echo "   It does NOT talk to PostgreSQL directly."
  echo

  local synapse_host element_domain
  echo "   Don't know the Synapse host? On the Synapse server run:"
  echo "   Deployment Management → \"Show connection info\" and copy the Host shown there."
  prompt_remote_host "🧩 Synapse host/domain this Element Web should point to" "${SYNAPSE_HOST:-localhost}" synapse_host
  prompt_domain "🧭 Element Web domain (e.g. app.example.com)" element_domain

  deploy_ensure_pkg nginx
  mkdir -p /var/www

  # ── Get the Element Web package: offline cache first, download only if
  # needed. Same matrix_package cache and helper functions the Standard
  # Installation uses, so a package downloaded/copied once is reused by
  # every server and every install mode. ──
  local element_source="" element_version="" element_needs_download="yes" element_download_target=""
  echo
  echo "📦 Checking the local matrix_package cache for an Element Web build..."
  pkgcache_resolve_online "Element Web" "element-v1.12.7.tar.gz"
  if [[ -n "${PKGCACHE_SOURCE_PATH}" ]]; then
    element_source="${PKGCACHE_SOURCE_PATH}"
    element_needs_download="no"
    element_version="$(basename "${element_source}" | grep -oP '[\d]+\.[\d]+\.[\d]+' | head -1)"
  else
    element_download_target="${PKGCACHE_DOWNLOAD_TARGET}"
    element_version="1.12.7"
    read -rp "Element Web version to download [${element_version}]: " _v
    element_version="${_v:-${element_version}}"
  fi

  rm -rf /var/www/element.tar.gz /var/www/element_new
  if [[ "${element_needs_download}" == "no" ]]; then
    echo "📂 Using cached package: ${element_source}"
    cp "${element_source}" /var/www/element.tar.gz
  else
    echo "⬇️  Downloading Element Web v${element_version} into the matrix_package cache..."
    if ! wget -O "${element_download_target}" \
      "https://github.com/element-hq/element-web/releases/download/v${element_version}/element-v${element_version}.tar.gz"; then
      echo "❌ Download failed — see ${LOG_FILE}. You can retry, or copy an element-web"
      echo "   tar.gz into ${PACKAGE_CACHE_DIR} and re-run this role to use it offline."
      pause; return 1
    fi
    cp "${element_download_target}" /var/www/element.tar.gz
  fi

  ( cd /var/www && rm -rf element_new && mkdir element_new && \
    tar -xzf element.tar.gz -C element_new --strip-components=1 && \
    rm -rf element && mv element_new element && rm -f element.tar.gz )

  cat > /var/www/element/config.json <<EOF
{
  "default_server_config": {
    "m.homeserver": {
      "base_url": "http://${synapse_host}:8008",
      "server_name": "${synapse_host}"
    }
  }
}
EOF
  echo "ℹ️  base_url is plain http:// on port 8008 because the Synapse role has no TLS"
  echo "   of its own. Once you put a Reverse Proxy (with SSL) in front of Synapse,"
  echo "   edit /var/www/element/config.json here to point at https://<that domain>."

  ELEMENT_HOST="$(hostname -I | awk '{print $1}')"
  DEPLOY_ELEMENT_DOMAIN="${element_domain}"
  save_deployment_config
  echo "✅ Element Web role configured on ${ELEMENT_HOST}, pointed at Synapse ${synapse_host}."
  echo "   ℹ️  Re-view this anytime: Deployment Management → \"Show connection info\"."
  pause
}

role_install_turn() {
  print_header
  echo "📞 === Advanced Deployment: TURN Server Role ==="
  echo "ℹ️  TURN is standalone — it doesn't need to know about any other role."
  echo "   Afterward, add its public IP as turn_uris on the Synapse role."
  echo
  local public_ip realm
  read -rp "📌 Public IP of this TURN server: " public_ip
  read -rp "🏠 TURN realm (usually your base domain): " realm

  deploy_ensure_pkg coturn
  cat > /etc/turnserver.conf <<EOF
listening-port=3478
tls-listening-port=5349
external-ip=${public_ip}
realm=${realm}
fingerprint
lt-cred-mech
use-auth-secret
static-auth-secret=$(openssl rand -hex 32)
EOF
  grep -q '^TURNSERVER_ENABLED=1' /etc/default/coturn 2>/dev/null || \
    echo 'TURNSERVER_ENABLED=1' >> /etc/default/coturn
  systemctl restart coturn

  TURN_HOST="${public_ip}"
  DEPLOY_TURN_REALM="${realm}"
  save_deployment_config
  echo "✅ TURN role installed on ${public_ip}. Add this as turn_uris on the Synapse role."
  pause
}

role_install_nginx() {
  print_header
  echo "🔀 === Advanced Deployment: Reverse Proxy Role ==="
  load_deployment_config || true
  echo "ℹ️  The reverse proxy needs to know where BOTH Synapse and Element Web are running"
  echo "   (they can be the same server or two different ones)."
  echo

  local synapse_host element_host base_domain
  echo "   Don't know these hosts? On the Synapse / Element servers run:"
  echo "   Deployment Management → \"Show connection info\" and copy the Host shown there."
  prompt_remote_host "🧩 Synapse host" "${SYNAPSE_HOST:-localhost}" synapse_host
  prompt_remote_host "🧭 Element Web host" "${ELEMENT_HOST:-localhost}" element_host

  deploy_ensure_pkg nginx
  cat > /etc/nginx/sites-available/matrix.conf <<EOF
server {
    listen 80;
    server_name _;
    location /_matrix {
        proxy_pass http://${synapse_host}:8008;
        proxy_set_header X-Forwarded-For \$remote_addr;
        proxy_set_header X-Forwarded-Proto \$scheme;
    }
    location / {
        proxy_pass http://${element_host}:80;
    }
}
EOF
  ln -sf /etc/nginx/sites-available/matrix.conf /etc/nginx/sites-enabled/matrix.conf

  # This is the THIRD domain the Standard Installation also asks for
  # (base/.well-known domain, separate from the Synapse and Element
  # domains) — it's optional here because federation delegation only
  # matters if you want short user IDs (@user:example.com instead of
  # @user:matrix.example.com). Skip it if you don't need that.
  echo
  echo "ℹ️  Optional: the Standard Installation also asks for a THIRD, bare domain"
  echo "   (e.g. example.com, as opposed to matrix.example.com) used only for"
  echo "   /.well-known/matrix delegation, so user IDs can be @user:example.com"
  echo "   while Synapse itself runs on a subdomain. Leave blank to skip this."
  read -rp "🏠 Base domain for .well-known (blank = skip): " base_domain
  if [[ -n "${base_domain}" ]]; then
    cat > /etc/nginx/sites-available/wellknown.conf <<EOF
server {
    listen 80;
    server_name ${base_domain};

    location = /.well-known/matrix/client {
        add_header Access-Control-Allow-Origin *;
        add_header Content-Type application/json;
        return 200 '{"m.homeserver":{"base_url":"http://${synapse_host}:8008"}}';
    }

    location = /.well-known/matrix/server {
        add_header Content-Type application/json;
        return 200 '{"m.server":"${synapse_host}:8008"}';
    }

    location / {
        return 404;
    }
}
EOF
    ln -sf /etc/nginx/sites-available/wellknown.conf /etc/nginx/sites-enabled/wellknown.conf
    echo "✅ .well-known vhost created for ${base_domain} (HTTP only for now)."
    echo "   ℹ️  Once you add HTTPS (Server Configuration → SSL), re-point these"
    echo "   base_url/m.server values at https://${synapse_host} or your public HS domain."
  fi

  nginx -t && systemctl reload nginx

  NGINX_HOST="$(hostname -I | awk '{print $1}')"
  DEPLOY_BASE_DOMAIN="${base_domain}"
  save_deployment_config
  echo "✅ Reverse proxy role installed, forwarding to Synapse=${synapse_host} Element=${element_host}."
  echo "ℹ️  Use Server Configuration → SSL on this host to add HTTPS afterward."
  pause
}

role_install_custom() {
  print_header
  echo "🧩 === Advanced Deployment: Custom Role ==="
  echo "Pick any combination of components to install on THIS server:"
  echo "1) PostgreSQL   2) Matrix Synapse   3) Element Web   4) TURN   5) Reverse Proxy"
  read -rp "Enter numbers separated by spaces (e.g. '2 5'): " picks
  local p
  for p in ${picks}; do
    case "${p}" in
      1) role_install_postgres  || true ;;
      2) role_install_synapse  || true ;;
      3) role_install_element  || true ;;
      4) role_install_turn  || true ;;
      5) role_install_nginx  || true ;;
      *) echo "Skipping unknown option: ${p}" ;;
    esac
  done
}

# advanced_deployment_wizard: the "New Feature" entry point from the spec.
# Adding a FUTURE role (Redis, MinIO, LDAP, Monitoring, Worker Nodes,
# Bridges...) means: add one line here, one role_install_<name>() function,
# and one entry in ROLE_KEYS/deploy_host() if it needs a HOST variable.
# Nothing else in the installer needs to change.
advanced_deployment_wizard() {
  print_header
  echo "╔══════════════════════════════════════════════════════════╗"
  echo "║           🌐  Advanced Deployment Wizard                 ║"
  echo "╠══════════════════════════════════════════════════════════╣"
  echo "║  Installs ONLY the component(s) for the role you pick.   ║"
  echo "║  Run this script on each server with the role that       ║"
  echo "║  belongs there.                                           ║"
  echo "╚══════════════════════════════════════════════════════════╝"
  echo
  echo "Select this server's role:"
  echo "1) Matrix Synapse"
  echo "2) PostgreSQL"
  echo "3) Element Web"
  echo "4) TURN Server"
  echo "5) Reverse Proxy"
  echo "6) Custom Role"
  echo "0) Back"
  read -rp "Choose a role [0-6]: " role_choice

  DEPLOYMENT_MODE="advanced"

  case "${role_choice}" in
    1) SERVER_ROLES="synapse";  save_deployment_config; role_install_synapse  || true ;;
    2) SERVER_ROLES="postgres"; save_deployment_config; role_install_postgres  || true ;;
    3) SERVER_ROLES="element";  save_deployment_config; role_install_element  || true ;;
    4) SERVER_ROLES="turn";     save_deployment_config; role_install_turn  || true ;;
    5) SERVER_ROLES="nginx";    save_deployment_config; role_install_nginx  || true ;;
    6) SERVER_ROLES="custom";   save_deployment_config; role_install_custom  || true ;;
    0) return 0 ;;
    *) echo "Invalid option."; sleep 1 ;;
  esac
}

# install_entry: thin wrapper behind main_menu option 1. Standard
# Installation still calls install_stack() exactly as before — nothing
# about that path changed. Advanced Deployment is purely additive.
install_entry() {
  print_header
  echo "Installation"
  echo "1) Standard Installation (Recommended)"
  echo "2) Advanced Deployment"
  read -rp "Choose [1-2]: " _mode
  case "${_mode}" in
    2) advanced_deployment_wizard  || true ;;
    1|*) install_stack ;;
  esac
}

#############################################
# Deployment Management menu
#############################################

# detect_local_roles: looks at what's ACTUALLY installed on this server
# (not just what the wizard recorded) so "Configure remote hosts" and
# "Show connection info" stay correct even if the deployment config file
# is missing, stale, or this server was set up before this feature
# existed. Each check targets a marker specific to that role so it
# doesn't collide with shared dependencies (e.g. both Element and the
# Reverse Proxy role install the `nginx` package, so nginx-the-package is
# not used as the signal — the reverse-proxy vhost file is).
detect_local_roles() {
  local roles=()
  pkg_is_installed postgresql && roles+=("postgres")
  pkg_is_installed matrix-synapse-py3 && roles+=("synapse")
  [[ -f /var/www/element/config.json ]] && roles+=("element")
  pkg_is_installed coturn && roles+=("turn")
  [[ -f /etc/nginx/sites-enabled/matrix.conf ]] && roles+=("nginx")
  echo "${roles[*]}"
}

# deployment_show_connection_info: for every role detected on THIS
# server, prints exactly what a dependent server's admin needs to type
# into ITS wizard prompts — this is the answer to "I forgot/don't have
# the connection details, where do I get them again?".
deployment_show_connection_info() {
  print_header
  echo "📋 === Connection Info For Other Servers ==="
  load_deployment_config || true
  local roles; roles="$(detect_local_roles)"
  if [[ -z "${roles}" ]]; then
    echo "No known roles (PostgreSQL/Synapse/Element/TURN/Reverse Proxy) detected on this"
    echo "server yet. Run the Advanced Deployment wizard first: main menu → 1 → Advanced Deployment."
    pause
    return 0
  fi
  local my_ip; my_ip="$(hostname -I | awk '{print $1}')"
  echo "Detected role(s) on this server: ${roles}"
  echo
  local r
  for r in ${roles}; do
    case "${r}" in
      postgres)
        echo "🐘 PostgreSQL — enter these when installing the Synapse role elsewhere:"
        echo "   Host:     ${POSTGRES_HOST:-${my_ip}}"
        echo "   Port:     ${DEPLOY_PG_PORT:-5432}"
        echo "   Database: ${DEPLOY_PG_DB:-<not recorded — re-run the PostgreSQL role, or check psql manually>}"
        echo "   User:     ${DEPLOY_PG_USER:-<not recorded>}"
        echo "   Password: ${DEPLOY_PG_PASS:-<not recorded, only shown once at install time>}"
        ;;
      synapse)
        echo "🧩 Matrix Synapse — enter this when installing Element Web or the Reverse Proxy role:"
        echo "   Host:   ${SYNAPSE_HOST:-${my_ip}}"
        echo "   Domain: ${DEPLOY_HS_DOMAIN:-<not recorded>}"
        ;;
      element)
        echo "🧭 Element Web — enter this when installing the Reverse Proxy role:"
        echo "   Host:   ${ELEMENT_HOST:-${my_ip}}"
        echo "   Domain: ${DEPLOY_ELEMENT_DOMAIN:-<not recorded>}"
        ;;
      turn)
        echo "📞 TURN — add this to the Synapse role's turn_uris manually (no wizard field for it yet):"
        echo "   Host:  ${TURN_HOST:-${my_ip}}"
        echo "   Realm: ${DEPLOY_TURN_REALM:-<not recorded>}"
        ;;
      nginx)
        echo "🔀 Reverse Proxy — this is usually your public entry point; point DNS at it:"
        echo "   Host: ${NGINX_HOST:-${my_ip}}"
        [[ -n "${DEPLOY_BASE_DOMAIN:-}" ]] && echo "   Base domain (.well-known): ${DEPLOY_BASE_DOMAIN}"
        ;;
    esac
    echo
  done
  pause
}

deployment_guide() {
  print_header
  cat <<'EOF'
📘 === How Multi-Server Deployment Works ===

There is no auto-orchestration here — you run THIS SAME SCRIPT on each
server you own, and pick ONE role per server from the wizard
(main menu → 1 → Advanced Deployment, or Deployment Management → Update
deployment configuration).

WHICH ROLE NEEDS TO KNOW ABOUT WHICH OTHER ROLE:

  PostgreSQL  → needs nothing. Install it first, anywhere.
  Synapse     → needs the PostgreSQL host + the DB name/user/password
                you created on that PostgreSQL role.
  Element Web → needs the Synapse host only. Does not talk to PostgreSQL.
  TURN        → needs nothing. Its public IP gets added to Synapse's
                turn_uris manually afterward.
  Reverse
  Proxy       → needs BOTH the Synapse host and the Element host.

ABOUT THE 3 DOMAINS:
  The Standard Installation asks for 3 domains up front (HS domain,
  Element domain, base/.well-known domain). In Advanced Deployment
  they're just split across the role that actually uses each one:
    - Matrix homeserver domain  → asked on the Synapse role
    - Element Web domain        → asked on the Element Web role
    - Base/.well-known domain   → asked (optional) on the Reverse Proxy
                                   role, since that's what serves it
  If a role's prompt shows "[localhost]" as the default, that just means
  no value has been configured yet for that field — it does NOT mean the
  role is actually bound to localhost only; enter the real host/IP and it
  will be used and remembered from then on.

INSTALL ORDER (this order avoids "waiting on a password you don't have
yet"):

  1. PostgreSQL role  → note the DB name/user/password it prints once.
  2. Synapse role     → enter the PostgreSQL host + those credentials.
  3. Element Web role  → enter the Synapse host.
  4. TURN role (optional) → note its public IP, add to Synapse afterward.
  5. Reverse Proxy role (optional) → enter the Synapse + Element hosts.

EXAMPLE — 2 servers:
  Server A: PostgreSQL + Synapse (pick "Custom Role" → 1 and 2)
  Server B: Element Web, pointed at Server A's IP/domain

EXAMPLE — 3 servers:
  Server A: PostgreSQL role only
  Server B: Synapse role, pointed at Server A
  Server C: Element Web + Reverse Proxy (Custom Role → 3 and 5),
            pointed at Server B for Synapse and at itself (localhost)
            for Element

Every host field in the wizard is validated (format check + live ping)
before it's saved, and "Verify connectivity" / "Test service
communication" in this menu re-check reachability at any time. If a
server sits behind a firewall, make sure the relevant port is open
between the two servers before installing the dependent role:
  PostgreSQL: 5432    Synapse: 8008    TURN: 3478/5349
EOF
  pause
}

deployment_menu() {
  while true; do
    print_header
    echo "🌐 === Deployment Management ==="
    load_deployment_config || true
    echo "1) 📘 Guide: how multi-server deployment works (start here)"
    echo "2) 📊 Show deployment status"
    echo "3) 🧩 Show current role(s)"
    echo "4) 📋 Show connection info to give to OTHER servers"
    echo "5) ⚙️  Configure remote hosts (role-aware, guided)"
    echo "6) 🔌 Verify connectivity"
    echo "7) 🧪 Test service communication"
    echo "8) ✏️  Update deployment configuration (re-run role wizard)"
    echo "9) 🔙 Back"
    read -rp "Choose [1-9]: " opt
    case "${opt}" in
      1) deployment_guide  || true ;;
      2)
        print_header
        if load_deployment_config; then
          echo "Deployment mode:   ${DEPLOYMENT_MODE:-standard}"
          echo "Role(s) recorded:  ${SERVER_ROLES:-none}"
          echo "Role(s) detected:  $(detect_local_roles)"
          echo "Synapse host:      ${SYNAPSE_HOST:-localhost}"
          echo "PostgreSQL host:   ${POSTGRES_HOST:-localhost}"
          echo "Element host:      ${ELEMENT_HOST:-localhost}"
          echo "TURN host:         ${TURN_HOST:-localhost}"
          echo "Nginx host:        ${NGINX_HOST:-localhost}"
        else
          echo "No deployment config found — this server is running Standard (single-server) mode."
          echo "Role(s) detected:  $(detect_local_roles)"
        fi
        pause
        ;;
      3)
        print_header
        load_deployment_config || true
        echo "Role(s) recorded by the wizard:  ${SERVER_ROLES:-none (standard install)}"
        echo "Role(s) actually detected here:  $(detect_local_roles)"
        pause
        ;;
      4) deployment_show_connection_info  || true ;;
      5)
        print_header
        echo "⚙️  === Configure Remote Hosts ==="
        load_deployment_config || true
        local roles; roles="$(detect_local_roles)"
        [[ -n "${SERVER_ROLES:-}" ]] && echo "Role(s) recorded for this server: ${SERVER_ROLES}"
        if [[ -z "${roles}" ]]; then
          echo "No roles detected as installed on this server yet."
          echo "Run the Advanced Deployment wizard first (main menu → 1 → Advanced Deployment),"
          echo "then come back here to point this server's role(s) at other servers."
          pause
          continue
        fi
        echo "Role(s) detected on this server: ${roles}"
        echo
        local r changed=false
        for r in ${roles}; do
          case "${r}" in
            postgres)
              echo "🐘 PostgreSQL role: doesn't connect out to anything else — nothing to configure."
              echo
              ;;
            turn)
              echo "📞 TURN role: doesn't connect out to anything else — nothing to configure."
              echo
              ;;
            synapse)
              echo "🧩 Synapse needs to know where PostgreSQL is running."
              echo "   Example: 10.0.0.5  or  db.internal.example.com"
              echo "   Don't know it? On the PostgreSQL server run:"
              echo "   Deployment Management → \"Show connection info\" and copy the Host shown there."
              prompt_remote_host "   PostgreSQL host" "${POSTGRES_HOST:-localhost}" POSTGRES_HOST
              changed=true
              echo
              ;;
            element)
              echo "🧭 Element Web needs to know where Synapse (the homeserver) is running."
              echo "   Example: matrix.example.com  or  10.0.0.6"
              echo "   Don't know it? On the Synapse server run:"
              echo "   Deployment Management → \"Show connection info\" and copy the Host shown there."
              prompt_remote_host "   Synapse host" "${SYNAPSE_HOST:-localhost}" SYNAPSE_HOST
              changed=true
              echo
              ;;
            nginx)
              echo "🔀 Reverse Proxy needs to know where BOTH Synapse and Element Web are running."
              echo "   Don't know them? Run \"Show connection info\" on each of those servers."
              prompt_remote_host "   Synapse host" "${SYNAPSE_HOST:-localhost}" SYNAPSE_HOST
              prompt_remote_host "   Element Web host" "${ELEMENT_HOST:-localhost}" ELEMENT_HOST
              changed=true
              echo
              ;;
          esac
        done
        if [[ "${changed}" == true ]]; then
          DEPLOYMENT_MODE="advanced"
          save_deployment_config
          echo "✅ Remote hosts saved."
        else
          echo "Nothing needed saving for the role(s) on this server."
        fi
        pause
        ;;
      6)
        print_header
        load_deployment_config || true
        echo "🔌 Checking reachability..."
        local role h
        for role in "${ROLE_KEYS[@]}"; do
          h="$(deploy_host "${role}")"
          if [[ "${h}" == "localhost" ]]; then
            echo "  ${role}: localhost (skipped)"
          elif ping -c1 -W2 "${h}" >/dev/null 2>&1; then
            echo "  ✅ ${role} (${h}) — reachable"
          else
            echo "  ❌ ${role} (${h}) — unreachable"
          fi
        done
        pause
        ;;
      7)
        print_header
        load_deployment_config || true
        echo "🧪 Testing service ports..."
        local s_host p_host e_host
        s_host="$(deploy_host synapse)"; p_host="$(deploy_host postgres)"; e_host="$(deploy_host element)"
        if [[ "${s_host}" != "localhost" ]]; then
          curl -fsS -m5 "http://${s_host}:8008/_matrix/client/versions" >/dev/null 2>&1 \
            && echo "  ✅ Synapse (${s_host}:8008) responding" \
            || echo "  ❌ Synapse (${s_host}:8008) not responding"
        fi
        if [[ "${p_host}" != "localhost" ]]; then
          if command -v nc >/dev/null 2>&1 && nc -z -w3 "${p_host}" 5432; then
            echo "  ✅ PostgreSQL (${p_host}:5432) reachable"
          else
            echo "  ❌ PostgreSQL (${p_host}:5432) unreachable"
          fi
        fi
        if [[ "${e_host}" != "localhost" ]]; then
          curl -fsS -m5 "http://${e_host}/" >/dev/null 2>&1 \
            && echo "  ✅ Element Web (${e_host}) responding" \
            || echo "  ❌ Element Web (${e_host}) not responding"
        fi
        pause
        ;;
      8) advanced_deployment_wizard  || true ;;
      9) return 0 ;;
      *) echo "Invalid option."; sleep 1 ;;
    esac
  done
}

main_menu() {
  while true; do
    print_header
    echo "════════ Matrix Stack Manager v${VERSION} ════════"
echo
    echo "1)  🧩 Install / Reinstall Matrix + Element + TURN (PostgreSQL)"
    echo "2)  👤 User Management"
    echo "3)  🔐 Authentication & Security"
    echo "4)  ⚙️  Server Configuration"
    echo "5)  📞 Calls & Video"
    echo "6)  🔧 Maintenance & Updates"
    echo "7)  💾 Backup & Recovery"
    echo "8)  📋 Information"
    echo "9)  🧩 Integration/Extension Manager (widgets, bridges & bots)"
    echo "10) 🧭 Ketesa — Synapse Admin Panel (users, rooms, media)"
    echo "11) 👥 Rooms, Presence & Privacy (public rooms, auto-join, presence...)"
    echo "12) 🧨 Uninstall (full purge, or just the database)"
    echo "13) ❓ Help / Guides (DNS records, E2EE, security, Ketesa steps...)"
    echo "14) 🐘 pgAdmin — PostgreSQL Web UI (manage the Matrix/Element DB)"
    echo "15) 🌐 Deployment Management (Advanced / multi-server)"
    echo "16) 🌍 Allow Remote PostgreSQL Access (open DB to an IP/CIDR)"
    echo
     echo "══════════════════════════════════════════"
    echo "0)  🚪 Exit"
    echo "══════════════════════════════════════════"
    read -rp "Choose an option [0-16]: " CHOICE

    case "${CHOICE}" in
      1)  install_entry  || true ;;
      2)  user_management_menu  || true ;;
      3)  auth_security_menu  || true ;;
      4)  server_config_menu  || true ;;
      5)  calls_video_menu  || true ;;
      6)  maintenance_menu  || true ;;
      7)  backup_menu_top  || true ;;
      8)  information_menu  || true ;;
      9)  configure_integration_manager  || true ;;
      10) ketesa_menu  || true ;;
      11) rooms_presence_privacy_menu  || true ;;
      12) uninstall_menu  || true ;;
      13) help_menu  || true ;;
      14) pgadmin_menu  || true ;;
      15) deployment_menu  || true ;;
      16) manage_remote_db_access  || true ;;
      0) echo "Bye."; exit 0 ;;
      *)  echo "Invalid option."; sleep 1 ;;
    esac
  done
}

require_root

if [[ "${NON_INTERACTIVE:-}" == "true" ]]; then
  export DEBIAN_FRONTEND=noninteractive
  echo "🚀 Running in Non-Interactive Mode..."
  # Determine which action/command to run. Default to install_stack if empty.
  ACTION="${ACTION:-install}"
  
  if [[ "${ACTION}" == "install" || "${ACTION}" == "custom_install" ]]; then
    install_stack
  elif [[ "${ACTION}" == "uninstall" || "${ACTION}" == "uninstall_stack" ]]; then
    full_uninstall
  elif [[ "${ACTION}" == "remove_database" || "${ACTION}" == "remove_database_and_settings" ]]; then
    remove_database_and_settings
  elif [[ "${ACTION}" == "workers_enable" || "${ACTION}" == "setup_workers" ]]; then
    setup_workers
  elif [[ "${ACTION}" == "workers_disable" || "${ACTION}" == "disable_workers" ]]; then
    disable_workers
  else
    echo "⚠️ Unknown non-interactive action: ${ACTION}. Defaulting to install_stack."
    install_stack
  fi
  exit 0
else
  main_menu
fi