# Matrix Stack Manager

A highly polished, powerful, full-featured corporate Matrix + Element Web deployment manager. Inspired by enterprise shell-based scripts but with a modern, elegant, dark glass responsive web dashboard.

## Features
- **Server Parameters**: Domain configuration, SSL modes, and PostgreSQL details.
- **Active Directory/LDAP**: Seamless authentication integration with query testing.
- **Performance Scaling**: Workers count control and Redis-based thread isolation.
- **Limits & Retention Policies**: Advanced parameters for attachments, message lifespans, and rate limits.
- **Email Server (SMTP)**: SMTP configurations for notifications and confirmation emails.
- **Client Defaults**: Set custom brand-wide presets for Element Web users.
- **User Management**: Simple account additions, deactivations, and reactivations.
- **Integrated Terminal**: Directly run commands or manage background configurations securely.

---

## 🚀 Easy VPS Installation

Deploy the Matrix Manager Admin Panel on a fresh, clean Ubuntu or Debian VPS using a single command:

```bash
curl -sSL https://raw.githubusercontent.com/shahbazimasoud/matrix-manager/master/setup-panel.sh | sudo bash
```

### 📋 What the Installer Does:
1. **Interactive Inputs**: Prompts you for the desired domain/IP, access port, and your initial administrator account credentials (**Username**, **Email**, **Password**).
2. **Auto-Dependency Resolution**: Verifies and installs Node.js LTS (18+), npm, git, and other essential system compiling tools.
3. **Secure Hashing**: Automatically hashes your designated owner password using cryptographic `bcrypt` before writing it to the local system database.
4. **Production Build Compilation**: Automatically runs `npm install` and packages the full-stack system using a high-performance esbuild CJS server bundle and Vite production frontend assets.
5. **Systemd Service Integration**: Deploys a persistent service named `matrix-manager.service` that operates in the background, starts automatically on boot, and guarantees maximum panel uptime.

---

## 🛠️ Service Management

Once installed, you can manage the panel daemon using standard system commands:

- **Check Service Status**:
  ```bash
  sudo systemctl status matrix-manager
  ```
- **Inspect Live Application Logs**:
  ```bash
  sudo journalctl -u matrix-manager -f -n 100
  ```
- **Restart the Admin Panel**:
  ```bash
  sudo systemctl restart matrix-manager
  ```
- **Stop the Admin Panel**:
  ```bash
  sudo systemctl stop matrix-manager
  ```

---

## 🔒 Configuration Directory Structure
- Project Installation Path: `/opt/matrix-manager`
- Virtual Sandbox Directory (holds mock/staged config files): `/opt/matrix-manager/sandbox`
- Panel Local Database: `/opt/matrix-manager/sandbox/db/panel_data.json`
- Application Environment File: `/opt/matrix-manager/.env`

