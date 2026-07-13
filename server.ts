/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import express from "express";
import http from "http";
import { WebSocketServer, WebSocket } from "ws";
import path from "path";
import fs from "fs";
import { createServer as createViteServer } from "vite";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";

declare global {
  namespace Express {
    interface Request {
      user?: any;
    }
  }
}

const app = express();
const server = http.createServer(app);
const wss = new WebSocketServer({ noServer: true });

const PORT = 3000;
const JWT_SECRET = process.env.JWT_SECRET || "spatial-matrix-secret-key-9988";
const SANDBOX_DIR = path.join(process.cwd(), "sandbox");

// -------------------------------------------------------------
// Virtual Sandbox Filesystem Helpers
// -------------------------------------------------------------
function getRealPath(targetPath: string): string {
  const relative = targetPath.startsWith("/") ? targetPath.slice(1) : targetPath;
  return path.join(SANDBOX_DIR, relative);
}

function ensureDirExists(filePath: string) {
  const dir = path.dirname(filePath);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
}

function writeSandboxFile(filePath: string, content: string) {
  const realPath = getRealPath(filePath);
  ensureDirExists(realPath);
  fs.writeFileSync(realPath, content, "utf8");
}

function readSandboxFile(filePath: string, defaultContent: string = ""): string {
  const realPath = getRealPath(filePath);
  if (!fs.existsSync(realPath)) {
    writeSandboxFile(filePath, defaultContent);
    return defaultContent;
  }
  return fs.readFileSync(realPath, "utf8");
}

// -------------------------------------------------------------
// Pre-populate Sandbox with Realistic Matrix Configurations
// -------------------------------------------------------------
function initializeSandbox() {
  if (!fs.existsSync(SANDBOX_DIR)) {
    fs.mkdirSync(SANDBOX_DIR, { recursive: true });
  }

  // 1. matrix-stack.conf
  readSandboxFile("/etc/matrix-stack.conf", [
    "HS_DOMAIN=matrix.company.local",
    "ELEMENT_DOMAIN=chat.company.local",
    "BASE_DOMAIN=company.local",
    "PUBLIC_IP=192.168.1.100",
    "LE_EMAIL=admin@company.local",
    "PG_DB=synapse",
    "PG_USER=synapse_user",
    "PG_PASS=a3f8b09d2e1c4f5a6b7c8d9e",
    "PG_HOST=localhost",
    "PG_PORT=5432",
    "SSL_MODE=selfsigned",
    "LIMIT_MB=50",
    "REGISTRATION_ENABLED=true",
    "MESSAGE_RETENTION_DAYS=0",
    "MEDIA_RETENTION_LOCAL_DAYS=0",
    "MEDIA_RETENTION_REMOTE_DAYS=0",
    "PRESENCE_ENABLED=true",
    "ROOM_CREATION_ALLOW=true",
    "DIRECTORY_SEARCH_ENABLED=true",
    "SMTP_HOST=smtp.company.local",
    "SMTP_PORT=587",
    "SMTP_USER=smtp_user",
    "SMTP_PASS=smtp_pass",
    "NOTIF_FROM=Matrix <noreply@company.local>",
    "APP_NAME=Matrix",
    "ELEMENT_CALL_URL=https://call.element.io",
    "INTEGRATIONS_UI_URL=https://scalar.vector.im",
    "INTEGRATIONS_REST_URL=https://scalar.vector.im/api",
    "TYPING_NOTIFS_ENABLED=true",
    "READ_RECEIPTS_ENABLED=true",
    "PROFILE_EDIT_NAME_ENABLED=true",
    "PROFILE_EDIT_AVATAR_ENABLED=true"
  ].join("\n"));

  // 2. homeserver.yaml
  readSandboxFile("/etc/matrix-synapse/homeserver.yaml", [
    "# Matrix Synapse Homeserver Configuration",
    "server_name: \"matrix.company.local\"",
    "public_baseurl: \"https://matrix.company.local/\"",
    "registration_shared_secret: \"99f8c0b2d3e4f5a6a7b8c9d0e1f2a3b4\"",
    "turn_shared_secret: \"a8b9c1d2e3f4a5b6c7d8e9f0a1b2c3d4\"",
    "enable_registration: true",
    "enable_registration_without_verification: true",
    "max_upload_size: \"50M\"",
    "database:",
    "  name: \"psycopg2\"",
    "  args:",
    "    user: \"synapse_user\"",
    "    password: \"a3f8b09d2e1c4f5a6b7c8d9e\"",
    "    database: \"synapse\"",
    "    host: \"localhost\"",
    "    port: 5432",
    "    cp_min: 5",
    "    cp_max: 10",
    "turn_uris:",
    "  - \"turn:matrix.company.local:3478?transport=udp\"",
    "  - \"turns:matrix.company.local:5349?transport=tcp\"",
    "presence:",
    "  enabled: true",
    "rc_message:",
    "  per_second: 0.2",
    "  burst_count: 10",
    "rc_login:",
    "  address:",
    "    per_second: 0.17",
    "    burst_count: 5",
    "  failed_attempts:",
    "    per_second: 0.17",
    "    burst_count: 5",
    "modules: []"
  ].join("\n"));

  // 3. Element Web config.json
  readSandboxFile("/var/www/element/config.json", JSON.stringify({
    "default_server_config": {
      "m.homeserver": {
        "base_url": "https://matrix.company.local",
        "server_name": "matrix.company.local"
      }
    },
    "disable_custom_urls": false,
    "disable_guests": true,
    "brand": "Element",
    "settingDefaults": {
      "features": {
        "feature_e2ee": false,
        "feature_video_rooms": "enable"
      },
      "sendTypingNotifications": true,
      "showTypingNotifications": true,
      "sendReadReceipts": true
    },
    "jitsi": {
      "preferredDomain": "meet.jit.si"
    }
  }, null, 2));

  // 4. pgAdmin Servers configuration
  readSandboxFile("/etc/matrix-pgadmin/servers.json", JSON.stringify({
    "Servers": {
      "1": {
        "Name": "Matrix Synapse DB",
        "Group": "Servers",
        "Host": "localhost",
        "Port": 5432,
        "MaintenanceDB": "synapse",
        "Username": "synapse_user",
        "SSLMode": "prefer"
      }
    }
  }, null, 2));

  // 5. Nginx Sites Config
  readSandboxFile("/etc/nginx/sites-available/matrix.conf", [
    "server {",
    "    listen 443 ssl http2;",
    "    server_name matrix.company.local;",
    "    ssl_certificate /etc/letsencrypt/live/matrix.company.local/fullchain.pem;",
    "    ssl_certificate_key /etc/letsencrypt/live/matrix.company.local/privkey.pem;",
    "    location / {",
    "        proxy_pass http://127.0.0.1:8008;",
    "    }",
    "}"
  ].join("\n"));

  // 6. DB files for Panel Database (local persistent mock DB)
  readSandboxFile("/db/panel_data.json", JSON.stringify({
    users: [
      {
        id: "usr-1",
        username: "admin",
        email: "admin@company.local",
        // Bcrypt hash for "admin1234"
        passwordHash: "$2b$10$oX6HHsc3BDS.vH9aE/vzOek0uXuYFV22mSTl9OMk0QroZlkGqRIae",
        role: "Owner",
        isActive: true,
        avatar: "https://api.dicebear.com/7.x/bottts/svg?seed=admin"
      },
      {
        id: "usr-2",
        username: "masoud",
        email: "masoud.shahbazii@gmail.com",
        // Bcrypt hash for "masoud1234"
        passwordHash: "$2b$10$QPE6t1v41RcL0A9LA5pGsu56Ti2he3s.k8AJWI8vOeJy.Or9iafBS",
        role: "Super Admin",
        isActive: true,
        avatar: "https://api.dicebear.com/7.x/bottts/svg?seed=masoud"
      },
      {
        id: "usr-3",
        username: "moderator",
        email: "mod@company.local",
        // Bcrypt hash for "mod1234"
        passwordHash: "$2b$10$TBrHPNVEOqZnBxTknN0MeO.6/DX864MJ8.2iFyuIV5M4Uw07Hackm",
        role: "Moderator",
        isActive: true,
        avatar: "https://api.dicebear.com/7.x/bottts/svg?seed=moderator"
      },
      {
        id: "usr-4",
        username: "viewer",
        email: "viewer@company.local",
        // Bcrypt hash for "viewer1234"
        passwordHash: "$2b$10$kK4vi/4n6y0I3SLkVphmeuMbd3o7sY0TgSS8apm8SDXeI7U62Xwly",
        role: "Viewer",
        isActive: true,
        avatar: "https://api.dicebear.com/7.x/bottts/svg?seed=viewer"
      }
    ],
    matrixUsers: [
      { mxid: "@masoud:matrix.company.local", isAdmin: true, isDeactivated: false },
      { mxid: "@alice:matrix.company.local", isAdmin: false, isDeactivated: false },
      { mxid: "@bob:matrix.company.local", isAdmin: false, isDeactivated: false },
      { mxid: "@welcome:matrix.company.local", isAdmin: false, isDeactivated: true }
    ],
    auditLogs: [
      { id: "log-1", timestamp: new Date(Date.now() - 3600000 * 2).toISOString(), username: "system", action: "Server Booted", target: "Server", status: "success", details: "Matrix Stack Manager Web Panel initiated successfully." },
      { id: "log-2", timestamp: new Date(Date.now() - 3600000).toISOString(), username: "admin", action: "Configure LDAP", target: "LDAP Auth", status: "success", details: "Tested LDAP connection and saved changes." }
    ],
    backups: [
      { id: "bak-1", filename: "matrix-backup-20260710-120000.tar.gz", size: "142.8 MB", timestamp: "2026-07-10T12:00:00.000Z", hasSSL: true },
      { id: "bak-2", filename: "matrix-backup-20260711-120000.tar.gz", size: "143.2 MB", timestamp: "2026-07-11T12:00:00.000Z", hasSSL: true }
    ],
    undoHistory: [
      { id: "undo-1", timestamp: new Date(Date.now() - 3600000).toISOString(), description: "Update LDAP Settings", files: ["/etc/matrix-stack-ldap.conf", "/etc/matrix-synapse/homeserver.yaml"] }
    ],
    ldapConfig: {
      enabled: false,
      uri: "ldap://ldap.company.local:389",
      base: "ou=users,dc=company,dc=local",
      mode: "search",
      start_tls: false,
      bind_dn: "cn=svc-matrix,dc=company,dc=local",
      uid_attr: "sAMAccountName",
      mail_attr: "mail",
      name_attr: "cn"
    },
    workersConfig: {
      enabled: false,
      count: 2,
      federationSender: false,
      basePort: 8083
    }
  }, null, 2));

  // Logs
  readSandboxFile("/var/log/matrix_stack_install.log", [
    "[2026-07-12 10:00:00] Starting Matrix Synapse Installer v3.0...",
    "[2026-07-12 10:00:05] [STEP 1/17] Updating repositories & installing prerequisites (apt)... success.",
    "[2026-07-12 10:00:20] [STEP 2/17] Adding Matrix Synapse repository... success.",
    "[2026-07-12 10:00:30] [STEP 3/17] Pre-configuring Synapse (debconf)... success.",
    "[2026-07-12 10:00:45] [STEP 4/17] Installing Matrix Synapse... success.",
    "[2026-07-12 10:01:10] [STEP 5/17] Centralizing YAML settings into homeserver.yaml... success.",
    "[2026-07-12 10:01:25] [STEP 6/17] Setting up PostgreSQL database... success.",
    "[2026-07-12 10:01:30] [STEP 7/17] Configuring SSL certificates... success. Self-signed certificate generated.",
    "[2026-07-12 10:01:35] [STEP 8/17] Saving configuration... success.",
    "[2026-07-12 10:01:40] [STEP 9/17] Configuring Synapse registration & uploads... success.",
    "[2026-07-12 10:01:45] [STEP 10/17] Configuring TURN for Synapse... success.",
    "[2026-07-12 10:01:50] [STEP 11/17] Configuring coturn & firewall... success.",
    "[2026-07-12 10:01:55] [STEP 12/17] Starting TURN & Synapse... success.",
    "[2026-07-12 10:02:10] [STEP 13/17] Installing Element Web... success.",
    "[2026-07-12 10:02:15] [STEP 14/17] Creating Element config.json... success.",
    "[2026-07-12 10:02:20] [STEP 15/17] Creating Nginx virtual hosts... success.",
    "[2026-07-12 10:02:25] [STEP 16/17] Testing & reloading Nginx... success.",
    "[2026-07-12 10:02:30] [STEP 17/17] Setting up internal domain resolution (/etc/hosts)... success.",
    "[2026-07-12 10:02:35] INSTALLATION COMPLETE. Matrix Synapse & Element Web fully operational."
  ].join("\n"));

  readSandboxFile("/var/log/matrix-synapse/homeserver.log", [
    "2026-07-12 22:30:15,312 - synapse.app.homeserver - 355 - INFO - - Synapse version 1.98.0 starting...",
    "2026-07-12 22:30:16,110 - synapse.storage.SQL - 88 - INFO - - Checking database schema...",
    "2026-07-12 22:30:17,450 - synapse.app.homeserver - 410 - INFO - - Database schema is up to date.",
    "2026-07-12 22:30:18,912 - synapse.handlers.auth - 102 - INFO - - Loaded LDAP Authentication Module successfully.",
    "2026-07-12 22:30:19,102 - synapse.app.homeserver - 501 - INFO - - Listening on port 8008 (HTTP)...",
    "2026-07-12 22:31:00,459 - synapse.access.http.8008 - 210 - INFO - - 127.0.0.1 - - POST /_matrix/client/v3/login - 200 - OK",
    "2026-07-12 22:32:45,112 - synapse.access.http.8008 - 210 - INFO - - 192.168.1.150 - - GET /_matrix/client/v3/sync - 200 - OK"
  ].join("\n"));
}

initializeSandbox();

// -------------------------------------------------------------
// Read / Write Database Helpers
// -------------------------------------------------------------
function readDb() {
  const content = readSandboxFile("/db/panel_data.json", "{}");
  return JSON.parse(content);
}

function writeDb(data: any) {
  writeSandboxFile("/db/panel_data.json", JSON.stringify(data, null, 2));
}

// -------------------------------------------------------------
// Authentication Middleware
// -------------------------------------------------------------
function authenticateToken(req: any, res: any, next: any) {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];

  if (!token) return res.status(401).json({ error: "Access token required" });

  jwt.verify(token, JWT_SECRET, (err: any, user: any) => {
    if (err) return res.status(403).json({ error: "Invalid or expired token" });
    req.user = user;
    next();
  });
}

function checkPermission(requiredRoles: string[]) {
  return (req: any, res: any, next: any) => {
    if (!req.user || !requiredRoles.includes(req.user.role)) {
      return res.status(403).json({ error: "Unauthorized access: insufficient privileges" });
    }
    next();
  };
}

// -------------------------------------------------------------
// REST API Endpoints
// -------------------------------------------------------------
app.use(express.json());

// Auth routes
app.post("/api/auth/login", (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) {
    return res.status(400).json({ error: "Username and password are required" });
  }

  const db = readDb();
  const user = db.users.find((u: any) => u.username === username && u.isActive);

  if (!user) {
    return res.status(401).json({ error: "Invalid username or password" });
  }

  const isPasswordValid = bcrypt.compareSync(password, user.passwordHash);
  if (!isPasswordValid) {
    return res.status(401).json({ error: "Invalid username or password" });
  }

  const token = jwt.sign(
    { id: user.id, username: user.username, role: user.role, email: user.email },
    JWT_SECRET,
    { expiresIn: "8h" }
  );

  res.json({
    token,
    user: { id: user.id, username: user.username, email: user.email, role: user.role, avatar: user.avatar }
  });
});

app.get("/api/auth/verify", authenticateToken, (req, res) => {
  res.json({ valid: true, user: req.user });
});

// Panel Users management
app.get("/api/users", authenticateToken, (req, res) => {
  const db = readDb();
  res.json(db.users.map(({ passwordHash, ...u }: any) => u));
});

app.post("/api/users", authenticateToken, checkPermission(["Owner", "Super Admin"]), (req, res) => {
  const { username, email, password, role } = req.body;
  if (!username || !email || !password || !role) {
    return res.status(400).json({ error: "All fields are required" });
  }

  const db = readDb();
  if (db.users.find((u: any) => u.username === username)) {
    return res.status(400).json({ error: "Username already exists" });
  }

  const newUser = {
    id: `usr-${Date.now()}`,
    username,
    email,
    passwordHash: bcrypt.hashSync(password, 10),
    role,
    isActive: true,
    avatar: `https://api.dicebear.com/7.x/bottts/svg?seed=${username}`
  };

  db.users.push(newUser);
  writeDb(db);

  // Add audit log
  db.auditLogs.unshift({
    id: `log-${Date.now()}`,
    timestamp: new Date().toISOString(),
    username: req.user.username,
    action: "Create User",
    target: `@${username}`,
    status: "success",
    details: `Created panel user with role ${role}`
  });
  writeDb(db);

  const { passwordHash, ...userResponse } = newUser;
  res.status(201).json(userResponse);
});

app.put("/api/users/:id/role", authenticateToken, checkPermission(["Owner"]), (req, res) => {
  const { role } = req.body;
  const { id } = req.params;

  if (!role) return res.status(400).json({ error: "Role is required" });

  const db = readDb();
  const user = db.users.find((u: any) => u.id === id);
  if (!user) return res.status(404).json({ error: "User not found" });

  if (user.username === "admin" && role !== "Owner") {
    return res.status(400).json({ error: "The default Owner role cannot be changed" });
  }

  const oldRole = user.role;
  user.role = role;
  writeDb(db);

  // Log audit
  db.auditLogs.unshift({
    id: `log-${Date.now()}`,
    timestamp: new Date().toISOString(),
    username: req.user.username,
    action: "Change Role",
    target: `@${user.username}`,
    status: "success",
    details: `Changed role from ${oldRole} to ${role}`
  });
  writeDb(db);

  const { passwordHash, ...userResponse } = user;
  res.json(userResponse);
});

app.delete("/api/users/:id", authenticateToken, checkPermission(["Owner", "Super Admin"]), (req, res) => {
  const { id } = req.params;
  const db = readDb();
  const userIndex = db.users.findIndex((u: any) => u.id === id);

  if (userIndex === -1) return res.status(404).json({ error: "User not found" });
  const user = db.users[userIndex];

  if (user.username === "admin") {
    return res.status(400).json({ error: "Default admin user cannot be deleted" });
  }

  db.users.splice(userIndex, 1);
  writeDb(db);

  // Log audit
  db.auditLogs.unshift({
    id: `log-${Date.now()}`,
    timestamp: new Date().toISOString(),
    username: req.user.username,
    action: "Delete Panel User",
    target: `@${user.username}`,
    status: "success",
    details: `Deleted panel user account`
  });
  writeDb(db);

  res.json({ message: "User deleted successfully" });
});

// Matrix Users (the server-managed users)
app.get("/api/matrix/users", authenticateToken, (req, res) => {
  const db = readDb();
  res.json(db.matrixUsers);
});

app.post("/api/matrix/users/register", authenticateToken, checkPermission(["Owner", "Super Admin", "Moderator"]), (req, res) => {
  const { username, password, isAdmin } = req.body;
  if (!username || !password) return res.status(400).json({ error: "Username and password are required" });

  const db = readDb();
  const confRaw = readSandboxFile("/etc/matrix-stack.conf", "HS_DOMAIN=matrix.company.local");
  const hsDomainMatch = confRaw.match(/^HS_DOMAIN=(.+)$/m);
  const hsDomain = hsDomainMatch ? hsDomainMatch[1] : "matrix.company.local";
  const mxid = `@${username}:${hsDomain}`;

  if (db.matrixUsers.find((u: any) => u.mxid === mxid)) {
    return res.status(400).json({ error: "User already exists on homeserver" });
  }

  const newUser = { mxid, isAdmin: !!isAdmin, isDeactivated: false };
  db.matrixUsers.push(newUser);
  writeDb(db);

  db.auditLogs.unshift({
    id: `log-${Date.now()}`,
    timestamp: new Date().toISOString(),
    username: req.user.username,
    action: "Register Matrix User",
    target: mxid,
    status: "success",
    details: `Registered Matrix user on local Synapse server (Role: ${isAdmin ? "Admin" : "Normal"})`
  });
  writeDb(db);

  // Append entry to homeserver.log to simulate action
  const logPath = "/var/log/matrix-synapse/homeserver.log";
  const logContent = readSandboxFile(logPath) + `\n${new Date().toISOString()} - synapse.handlers.auth - INFO - Registered new user ${mxid} with password`;
  writeSandboxFile(logPath, logContent);

  res.status(201).json(newUser);
});

app.post("/api/matrix/users/deactivate", authenticateToken, checkPermission(["Owner", "Super Admin", "Moderator"]), (req, res) => {
  const { mxid } = req.body;
  if (!mxid) return res.status(400).json({ error: "MXID is required" });

  const db = readDb();
  const user = db.matrixUsers.find((u: any) => u.mxid === mxid);
  if (!user) return res.status(404).json({ error: "Matrix user not found" });

  user.isDeactivated = true;
  writeDb(db);

  db.auditLogs.unshift({
    id: `log-${Date.now()}`,
    timestamp: new Date().toISOString(),
    username: req.user.username,
    action: "Deactivate Matrix User",
    target: mxid,
    status: "success",
    details: `Deactivated user and cleared password hash on Homeserver`
  });
  writeDb(db);

  res.json(user);
});

app.post("/api/matrix/users/reactivate", authenticateToken, checkPermission(["Owner", "Super Admin", "Moderator"]), (req, res) => {
  const { mxid, password, isAdmin } = req.body;
  if (!mxid || !password) return res.status(400).json({ error: "MXID and new password are required" });

  const db = readDb();
  const user = db.matrixUsers.find((u: any) => u.mxid === mxid);
  if (!user) return res.status(404).json({ error: "Matrix user not found" });

  user.isDeactivated = false;
  if (isAdmin !== undefined) user.isAdmin = !!isAdmin;
  writeDb(db);

  db.auditLogs.unshift({
    id: `log-${Date.now()}`,
    timestamp: new Date().toISOString(),
    username: req.user.username,
    action: "Reactivate Matrix User",
    target: mxid,
    status: "success",
    details: `Reactivated Matrix account and reset password`
  });
  writeDb(db);

  res.json(user);
});

// Configurations API
app.get("/api/matrix/config", authenticateToken, (req, res) => {
  const confRaw = readSandboxFile("/etc/matrix-stack.conf");
  const config: any = {};
  confRaw.split("\n").forEach((line) => {
    const parts = line.split("=");
    if (parts.length >= 2) {
      config[parts[0].trim()] = parts.slice(1).join("=").trim();
    }
  });

  const db = readDb();
  res.json({
    config,
    ldap: db.ldapConfig,
    workers: db.workersConfig
  });
});

app.post("/api/matrix/config/save", authenticateToken, checkPermission(["Owner", "Super Admin"]), (req, res) => {
  const { config, ldap, workers } = req.body;
  const db = readDb();

  if (config) {
    let confContent = "";
    Object.entries(config).forEach(([key, val]) => {
      confContent += `${key}=${val}\n`;
    });
    writeSandboxFile("/etc/matrix-stack.conf", confContent);

    // Update homeserver.yaml values dynamically
    let yaml = readSandboxFile("/etc/matrix-synapse/homeserver.yaml");
    if (config.HS_DOMAIN) {
      yaml = yaml.replace(/^server_name:.*$/m, `server_name: "${config.HS_DOMAIN}"`);
      yaml = yaml.replace(/^public_baseurl:.*$/m, `public_baseurl: "https://${config.HS_DOMAIN}/"`);
    }
    if (config.PG_USER) {
      yaml = yaml.replace(/user:.*$/m, `user: "${config.PG_USER}"`);
    }
    if (config.PG_DB) {
      yaml = yaml.replace(/database:.*$/m, `database: "${config.PG_DB}"`);
    }
    writeSandboxFile("/etc/matrix-synapse/homeserver.yaml", yaml);

    // Update element config.json
    if (config.HS_DOMAIN) {
      const elConfig = JSON.parse(readSandboxFile("/var/www/element/config.json", "{}"));
      if (elConfig.default_server_config && elConfig.default_server_config["m.homeserver"]) {
        elConfig.default_server_config["m.homeserver"].base_url = `https://${config.HS_DOMAIN}`;
        elConfig.default_server_config["m.homeserver"].server_name = config.HS_DOMAIN;
        writeSandboxFile("/var/www/element/config.json", JSON.stringify(elConfig, null, 2));
      }
    }
  }

  if (ldap) {
    db.ldapConfig = { ...db.ldapConfig, ...ldap };
    // Simulate writing to synapse ldap structure
    let yaml = readSandboxFile("/etc/matrix-synapse/homeserver.yaml");
    if (ldap.enabled) {
      yaml = yaml.replace("modules: []", [
        "modules:",
        "  - module: \"ldap_auth_provider.LdapAuthProviderModule\"",
        "    config:",
        `      enabled: true`,
        `      uri: "${ldap.uri}"`,
        `      mode: "${ldap.mode}"`,
        `      start_tls: ${ldap.start_tls}`,
        `      base: "${ldap.base}"`,
        `      attributes:`,
        `        uid: "${ldap.uid_attr}"`,
        `        mail: "${ldap.mail_attr}"`,
        `        name: "${ldap.name_attr}"`
      ].join("\n"));
    } else {
      yaml = yaml.replace(/modules:[\s\S]+?(?=turn_uris|presence|$)/, "modules: []\n");
    }
    writeSandboxFile("/etc/matrix-synapse/homeserver.yaml", yaml);
  }

  if (workers) {
    db.workersConfig = { ...db.workersConfig, ...workers };
  }

  writeDb(db);

  db.auditLogs.unshift({
    id: `log-${Date.now()}`,
    timestamp: new Date().toISOString(),
    username: req.user.username,
    action: "Save Configuration",
    target: "System",
    status: "success",
    details: "Modified server stack and Synapse homeserver parameters."
  });
  writeDb(db);

  res.json({ message: "Configurations saved and synchronized successfully." });
});

// Logs API
app.get("/api/logs/synapse", authenticateToken, (req, res) => {
  const content = readSandboxFile("/var/log/matrix-synapse/homeserver.log");
  res.json({ logs: content.split("\n").slice(-150) });
});

app.get("/api/logs/install", authenticateToken, (req, res) => {
  const content = readSandboxFile("/var/log/matrix_stack_install.log");
  res.json({ logs: content.split("\n") });
});

app.get("/api/logs/audit", authenticateToken, (req, res) => {
  const db = readDb();
  res.json(db.auditLogs);
});

// Backups API
app.get("/api/backups", authenticateToken, (req, res) => {
  const db = readDb();
  res.json(db.backups);
});

app.post("/api/backups/create", authenticateToken, checkPermission(["Owner", "Super Admin"]), (req, res) => {
  const { includeSSL } = req.body;
  const db = readDb();

  const timestamp = new Date().toISOString();
  const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, "");
  const timeStr = new Date().toTimeString().slice(0, 8).replace(/:/g, "");
  const filename = `matrix-backup-${dateStr}-${timeStr}.tar.gz`;

  const newBackup = {
    id: `bak-${Date.now()}`,
    filename,
    size: `${(Math.random() * 5 + 140).toFixed(1)} MB`,
    timestamp,
    hasSSL: !!includeSSL
  };

  db.backups.unshift(newBackup);
  writeDb(db);

  db.auditLogs.unshift({
    id: `log-${Date.now()}`,
    timestamp,
    username: req.user.username,
    action: "Create Backup",
    target: filename,
    status: "success",
    details: `Initiated manual backup. Included SSL: ${includeSSL ? "Yes" : "No"}`
  });
  writeDb(db);

  res.status(201).json(newBackup);
});

app.delete("/api/backups/:id", authenticateToken, checkPermission(["Owner", "Super Admin"]), (req, res) => {
  const { id } = req.params;
  const db = readDb();
  const idx = db.backups.findIndex((b: any) => b.id === id);
  if (idx === -1) return res.status(404).json({ error: "Backup not found" });

  const backup = db.backups[idx];
  db.backups.splice(idx, 1);
  writeDb(db);

  db.auditLogs.unshift({
    id: `log-${Date.now()}`,
    timestamp: new Date().toISOString(),
    username: req.user.username,
    action: "Delete Backup",
    target: backup.filename,
    status: "success",
    details: "Deleted archived backup from disk storage."
  });
  writeDb(db);

  res.json({ message: "Backup deleted" });
});

// Jitsi / Video Conferencing
app.get("/api/matrix/video", authenticateToken, (req, res) => {
  const elConfig = JSON.parse(readSandboxFile("/var/www/element/config.json", "{}"));
  res.json({
    jitsiDomain: elConfig.jitsi?.preferredDomain || "meet.jit.si",
    screenshare: elConfig.settingDefaults?.features?.feature_video_rooms === "enable"
  });
});

app.post("/api/matrix/video", authenticateToken, checkPermission(["Owner", "Super Admin"]), (req, res) => {
  const { jitsiDomain, screenshare } = req.body;
  const elConfig = JSON.parse(readSandboxFile("/var/www/element/config.json", "{}"));

  if (jitsiDomain) {
    elConfig.jitsi = {
      preferredDomain: jitsiDomain,
      desktopSharingFrameRate: { min: 5, max: 30 }
    };
  }

  if (screenshare !== undefined) {
    elConfig.settingDefaults.features.feature_video_rooms = screenshare ? "enable" : "disable";
  }

  writeSandboxFile("/var/www/element/config.json", JSON.stringify(elConfig, null, 2));

  const db = readDb();
  db.auditLogs.unshift({
    id: `log-${Date.now()}`,
    timestamp: new Date().toISOString(),
    username: req.user.username,
    action: "Modify Jitsi & Video Rooms Settings",
    target: "Element Web",
    status: "success",
    details: `Updated Preferred Jitsi Domain: ${jitsiDomain}. Screenshare rooms: ${screenshare}`
  });
  writeDb(db);

  res.json({ success: true });
});

// E2EE Management
app.get("/api/matrix/e2ee", authenticateToken, (req, res) => {
  const elConfig = JSON.parse(readSandboxFile("/var/www/element/config.json", "{}"));
  const wkConfig = readSandboxFile("/etc/nginx/sites-available/wellknown.conf");
  const hsConfig = readSandboxFile("/etc/matrix-synapse/homeserver.yaml");

  res.json({
    configEnabled: elConfig.settingDefaults?.features?.feature_e2ee !== false,
    wellKnownForceDisable: wkConfig.includes("force_disable"),
    roomLockdownPowerLevel: hsConfig.includes("m.room.encryption") ? 999 : 100,
    serverSideBlock: hsConfig.includes("RoomPolicy")
  });
});

app.post("/api/matrix/e2ee", authenticateToken, checkPermission(["Owner", "Super Admin"]), (req, res) => {
  const { disableE2EE } = req.body;
  const elConfig = JSON.parse(readSandboxFile("/var/www/element/config.json", "{}"));

  // 1. Element Web config.json
  elConfig.settingDefaults.features.feature_e2ee = !disableE2EE;
  if (disableE2EE) {
    elConfig.settingDefaults["UIFeature.BulkUnverifiedSessionsReminder"] = false;
  } else {
    delete elConfig.settingDefaults["UIFeature.BulkUnverifiedSessionsReminder"];
  }
  writeSandboxFile("/var/www/element/config.json", JSON.stringify(elConfig, null, 2));

  // 2. Nginx /.well-known force_disable
  let wk = readSandboxFile("/etc/nginx/sites-available/wellknown.conf");
  if (disableE2EE) {
    if (!wk.includes("force_disable")) {
      wk = wk.replace(
        /"m\.homeserver":\{"base_url":"[^"]*"\}/,
        `$&,"io.element.e2ee":{"force_disable":true}`
      );
    }
  } else {
    wk = wk.replace(/,"io\.element\.e2ee":\{"force_disable":true\}/, "");
  }
  writeSandboxFile("/etc/nginx/sites-available/wellknown.conf", wk);

  // 3 & 4. Homeserver power levels + server-side blocker rules
  let hs = readSandboxFile("/etc/matrix-synapse/homeserver.yaml");
  if (disableE2EE) {
    if (!hs.includes("default_power_level_content_override")) {
      hs += [
        "\ndefault_power_level_content_override:",
        "  private_chat:",
        "    events:",
        "      \"m.room.encryption\": 999",
        "  trusted_private_chat:",
        "    events:",
        "      \"m.room.encryption\": 999",
        "  public_chat:",
        "    events:",
        "      \"m.room.encryption\": 999",
        "third_party_event_rules:",
        "  module: \"room_policy.RoomPolicy\"",
        "  config:",
        "    block_encryption: true"
      ].join("\n");
    }
  } else {
    hs = hs.replace(/default_power_level_content_override:[\s\S]+?(?=turn_uris|presence|$)/, "");
    hs = hs.replace(/third_party_event_rules:[\s\S]+?(?=turn_uris|presence|$)/, "");
  }
  writeSandboxFile("/etc/matrix-synapse/homeserver.yaml", hs);

  const db = readDb();
  db.auditLogs.unshift({
    id: `log-${Date.now()}`,
    timestamp: new Date().toISOString(),
    username: req.user.username,
    action: disableE2EE ? "Disable E2EE Org-Wide" : "Enable E2EE",
    target: "Synapse & Element Stack",
    status: "success",
    details: disableE2EE
      ? "Turned off E2EE, set encryption power requirements to 999, and injected Homeserver event filters."
      : "Restored default end-to-end encryption features."
  });
  writeDb(db);

  res.json({ success: true });
});

// Service Actions API (Start, Stop, Restart)
app.post("/api/services/action", authenticateToken, checkPermission(["Owner", "Super Admin"]), (req, res) => {
  const { serviceId, action } = req.body;
  if (!serviceId || !action) return res.status(400).json({ error: "Service ID and action are required" });

  const db = readDb();
  db.auditLogs.unshift({
    id: `log-${Date.now()}`,
    timestamp: new Date().toISOString(),
    username: req.user.username,
    action: `${action.toUpperCase()} Service`,
    target: serviceId,
    status: "success",
    details: `Triggered service action ${action} on ${serviceId}.`
  });
  writeDb(db);

  // Return success simulating service command completion
  res.json({ success: true, message: `Service ${serviceId} executed ${action} successfully.` });
});

// -------------------------------------------------------------
// WebSocket Live Status & Terminal Spawner
// -------------------------------------------------------------
wss.on("connection", (ws: WebSocket, request: any) => {
  let isAuthorized = false;
  let username = "anonymous";
  let role = "Viewer";

  // Parse token from URL if available
  const urlParams = new URLSearchParams(request.url.split("?")[1]);
  const token = urlParams.get("token");

  if (token) {
    try {
      const decoded: any = jwt.verify(token, JWT_SECRET);
      isAuthorized = true;
      username = decoded.username;
      role = decoded.role;
    } catch (e) {
      ws.send(JSON.stringify({ type: "error", message: "WebSocket auth failed: invalid token" }));
      ws.close();
      return;
    }
  }

  // 1. Send initial metrics and system information
  ws.send(JSON.stringify({ type: "auth_ok", username, role }));

  // Keep sending real-time CPU/Memory spikes
  let trends: any[] = [];
  for (let i = 0; i < 20; i++) {
    trends.push({
      time: new Date(Date.now() - (20 - i) * 5000).toLocaleTimeString().slice(0, 8),
      cpu: Math.floor(Math.random() * 25) + 15,
      memory: Math.floor(Math.random() * 5) + 68,
      activeUsers: Math.floor(Math.random() * 10) + 184,
      disk: 44.2
    });
  }

  const sendMetrics = () => {
    if (ws.readyState !== WebSocket.OPEN) return;

    const cpu = Math.floor(Math.random() * 20) + 15; // 15-35%
    const memory = Math.floor(Math.random() * 3) + 71; // 71-74%
    const activeUsers = Math.floor(Math.random() * 8) + 192;
    const time = new Date().toLocaleTimeString().slice(0, 8);

    trends.push({ time, cpu, memory, activeUsers, disk: 44.2 });
    if (trends.length > 20) trends.shift();

    const stats = {
      cpuUsage: cpu,
      memoryUsage: memory,
      memoryTotal: 8.0,
      memoryFree: 8.0 * (1 - memory / 100),
      diskUsage: 44.2,
      diskTotal: 100,
      diskFree: 55.8,
      networkIn: Math.floor(Math.random() * 450) + 50,
      networkOut: Math.floor(Math.random() * 850) + 150,
      activeUsers,
      federationServers: 34,
      messageVolume24h: 12450 + Math.floor(Math.random() * 50),
      uptime: "12 days, 4 hours, 32 minutes",
      trends
    };

    ws.send(JSON.stringify({ type: "metrics", stats }));
  };

  const metricsInterval = setInterval(sendMetrics, 3000);
  sendMetrics();

  // 2. Handle incoming client requests (e.g. running scripts)
  ws.on("message", (message: string) => {
    try {
      const data = JSON.parse(message);

      if (data.type === "auth") {
        try {
          const decoded: any = jwt.verify(data.token, JWT_SECRET);
          isAuthorized = true;
          username = decoded.username;
          role = decoded.role;
          ws.send(JSON.stringify({ type: "auth_ok", username, role }));
        } catch (e) {
          ws.send(JSON.stringify({ type: "error", message: "JWT verify failed" }));
        }
        return;
      }

      if (!isAuthorized) {
        ws.send(JSON.stringify({ type: "error", message: "Connection is unauthorized" }));
        return;
      }

      if (data.type === "execute_command") {
        const { command, args } = data;

        // Perform RBAC validation
        if (role === "Viewer") {
          ws.send(JSON.stringify({ type: "cmd_err", text: "Permission Denied: Viewer role cannot execute console tasks." }));
          return;
        }

        if (role === "Moderator" && ["install", "uninstall", "workers", "ssl_reissue"].includes(command)) {
          ws.send(JSON.stringify({ type: "cmd_err", text: "Permission Denied: Moderator role cannot execute system critical operations." }));
          return;
        }

        ws.send(JSON.stringify({ type: "cmd_start", command }));

        // Simulate script terminal output streaming
        let steps: string[] = [];

        if (command === "install") {
          steps = [
            "⚡ [INFO] Starting standard matrix server installation...",
            "⚙️  Reading requirements from platform target...",
            "📦 [1/17] Updating repositories & installing prerequisites (apt)...",
            "   Hit:1 http://archive.ubuntu.com/ubuntu focal InRelease",
            "   Get:2 http://security.ubuntu.com/ubuntu focal-security InRelease",
            "   Fetched 142 kB in 1s. Installing packages: nginx coturn certbot postgresql...",
            "   Nginx core successfully installed.",
            "➕ [2/17] Adding Matrix Synapse repository...",
            "   Importing GPG key from packages.matrix.org...",
            "   Registered repository source successfully.",
            "⚙️  [3/17] Pre-configuring Synapse (debconf)...",
            "   Preseeded homeserver domain name and registration metrics.",
            "⬇️  [4/17] Installing Matrix Synapse...",
            "   Unpacking matrix-synapse-py3 (1.98.0-1)...",
            "   Setting up Python 3 virtual environment at /opt/venvs/matrix-synapse...",
            "🧹 [5/17] Centralizing YAML settings into homeserver.yaml...",
            "   entralizing conf.d settings. Completed successfully.",
            "🐘 [6/17] Setting up PostgreSQL database...",
            "   Creating database 'synapse' on localhost:5432...",
            "   Creating user 'synapse_user' with secure token credentials...",
            "🔑 [7/17] Configuring SSL certificates...",
            "   Internal CA directory found at /etc/matrix-ca",
            "   Issuing leaf certificate for matrix.company.local (SAN: chat.company.local)...",
            "   ✅ Issued. Valid for 10 years, signed by Matrix Internal Root CA.",
            "💾 [8/17] Saving configuration...",
            "   Configs saved with chmod 600 in /etc/matrix-stack.conf",
            "🧾 [9/17] Configuring Synapse registration & uploads...",
            "   Wrote registration shared secret to homeserver.yaml. Max uploads set to 50M.",
            "📞 [10/17] Configuring TURN for Synapse...",
            "   Enabled turn_uris in Synapse properties.",
            "🛰️  [11/17] Configuring coturn & firewall...",
            "   Port bindings enabled: UDP 3478, TCP 5349.",
            "🔄 [12/17] Starting TURN & Synapse...",
            "   Systemd unit file loaded. Restarting matrix-synapse...",
            "   ✅ Service is active and running.",
            "🧩 [13/17] Installing Element Web...",
            "   Extracting Element Web client package (v1.12.7)...",
            "🛠️  [14/17] Creating Element config (config.json)...",
            "   Wrote default_server_config pointing to homeserver client API.",
            "🌍 [15/17] Creating Nginx virtual hosts...",
            "   Created matrix.conf, element.conf, and wellknown.conf virtual servers.",
            "🌍 [16/17] Testing & reloading Nginx...",
            "   nginx: configuration file /etc/nginx/nginx.conf test is successful",
            "   Reloading Nginx web server... success.",
            "🌐 [17/17] Setting up internal domain resolution (/etc/hosts)...",
            "   Appended local hosts mappings for .local resolving.",
            "🎉 INSTALLATION COMPLETED SUCCESSFULLY!",
            "----------------------------------------------------------------",
            "Matrix Server: https://matrix.company.local",
            "Element Web:   https://chat.company.local",
            "----------------------------------------------------------------"
          ];

          // Modify configuration files on virtual filesystem to mimic installation completion!
          const conf = [
            "HS_DOMAIN=matrix.company.local",
            "ELEMENT_DOMAIN=chat.company.local",
            "BASE_DOMAIN=company.local",
            "PUBLIC_IP=192.168.1.100",
            "LE_EMAIL=admin@company.local",
            "PG_DB=synapse",
            "PG_USER=synapse_user",
            "PG_PASS=a3f8b09d2e1c4f5a6b7c8d9e",
            "PG_HOST=localhost",
            "PG_PORT=5432",
            "SSL_MODE=selfsigned"
          ].join("\n");
          writeSandboxFile("/etc/matrix-stack.conf", conf);
        } else if (command === "backup") {
          steps = [
            "⚡ [INFO] Initiating system-wide server backup...",
            "🐘 Dumping PostgreSQL database 'synapse'...",
            "   pg_dump: collecting table statistics...",
            "   pg_dump: writing database objects (rooms, events, presence)...",
            "   ✅ Database dump completed successfully: /root/matrix-backups/synapse-db-temp.dump",
            "📂 Packaging directory files into archive...",
            "   Adding /etc/matrix-synapse/...",
            "   Adding /etc/nginx/sites-available/...",
            "   Adding /var/lib/matrix-synapse/...",
            "   Adding certificates from /etc/letsencrypt/...",
            "   Compiling tar.gz archive...",
            `✅ BACKUP COMPLETE: /root/matrix-backups/matrix-backup-${new Date().toISOString().slice(0, 10).replace(/-/g, "")}.tar.gz`,
            "🧹 Cleaning temporary files..."
          ];
        } else if (command === "workers_enable") {
          steps = [
            "🛠️  [INFO] Setting up Synapse Workers (Scaling)...",
            "📦 Installing redis-server requirement...",
            "   Starting redis-server.service...",
            "🔌 Enabling HTTP replication listener on main process...",
            "   homeserver.yaml: listeners updated with replication channel.",
            "🔁 Enabling Redis-based replication in config...",
            "👷 Writing worker YAML templates at /etc/matrix-synapse/workers/...",
            "   Created generic_worker1.yaml on port 8083",
            "   Created generic_worker2.yaml on port 8084",
            "⚙️  Setting up systemd templates for matrix-synapse-worker@...",
            "🔀 Adjusting Nginx reverse proxy routes with worker upstreams...",
            "   Pinning cross-signing /device_signing/upload and Admin API to Master process...",
            "🔄 Restarting master Homeserver & reloading Nginx...",
            "   ✅ Workers successfully registered and active."
          ];

          // Save to config
          const db = readDb();
          db.workersConfig.enabled = true;
          writeDb(db);
        } else if (command === "e2ee_disable") {
          steps = [
            "🔐 [INFO] Setting up E2EE Lockdown (Disable E2EE for Organization)...",
            "🧩 Element Web config.json: Setting feature_e2ee = false...",
            "   Hiding BulkUnverifiedSessionsReminder and SecureBackup widgets...",
            "🌍 Nginx wellknown.conf: Injecting 'io.element.e2ee.force_disable' = true...",
            "🐘 Synapse properties: Overriding room encryption power levels to 999...",
            "🛡️  Installing room_policy Python module into Synapse virtual environment...",
            "   Writing module at /opt/venvs/matrix-synapse/lib/python3.10/site-packages/room_policy.py...",
            "   Injecting third_party_event_rules hook into homeserver.yaml...",
            "🔄 Restarting Synapse server & reloading Nginx...",
            "   ✅ E2EE completely disabled on server and client apps."
          ];
        } else {
          steps = [
            `⚡ Spawning virtual executor for command: ${command}...`,
            "   Fetching target context...",
            "   Command executed successfully.",
            "✅ Task completed."
          ];
        }

        let i = 0;
        const streamInterval = setInterval(() => {
          if (ws.readyState !== WebSocket.OPEN) {
            clearInterval(streamInterval);
            return;
          }

          if (i < steps.length) {
            ws.send(JSON.stringify({ type: "cmd_stdout", text: steps[i] }));
            i++;
          } else {
            clearInterval(streamInterval);
            ws.send(JSON.stringify({ type: "cmd_end", code: 0 }));

            // Add audit log for command execution
            const db = readDb();
            db.auditLogs.unshift({
              id: `log-${Date.now()}`,
              timestamp: new Date().toISOString(),
              username,
              action: `Console Command`,
              target: command,
              status: "success",
              details: `Executed system command: ${command}`
            });
            writeDb(db);
          }
        }, 150);
      }
    } catch (e) {
      ws.send(JSON.stringify({ type: "error", message: "Failed to parse message" }));
    }
  });

  ws.on("close", () => {
    clearInterval(metricsInterval);
  });
});

// -------------------------------------------------------------
// Upgrade HTTP to WebSockets on '/ws' or default connection
// -------------------------------------------------------------
server.on("upgrade", (request, socket, head) => {
  const pathname = request.url ? request.url.split("?")[0] : "/";

  if (pathname === "/ws") {
    wss.handleUpgrade(request, socket, head, (ws) => {
      wss.emit("connection", ws, request);
    });
  } else {
    socket.destroy();
  }
});

// -------------------------------------------------------------
// Serve Vite frontend in dev & static build in production
// -------------------------------------------------------------
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  server.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on port ${PORT}`);
  });
}

startServer();
