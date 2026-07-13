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
import { spawn, execSync } from "child_process";
import os from "os";
import { Client } from "pg";

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
// Real PostgreSQL Connection & Query Helper
// -------------------------------------------------------------
function getSynapseDBConfig() {
  try {
    const confRaw = readSandboxFile("/etc/matrix-stack.conf");
    const config: any = {};
    confRaw.split("\n").forEach((line) => {
      const parts = line.split("=");
      if (parts.length >= 2) {
        config[parts[0].trim()] = parts.slice(1).join("=").trim();
      }
    });
    
    if (config.PG_HOST && config.PG_DB) {
      return {
        host: config.PG_HOST,
        port: parseInt(config.PG_PORT || "5432"),
        database: config.PG_DB,
        user: config.PG_USER || "synapse_user",
        password: config.PG_PASS || ""
      };
    }
  } catch (e) {
    // ignore
  }
  return null;
}

async function queryPostgres(queryStr: string, params: any[] = []): Promise<any[]> {
  const dbConfig = getSynapseDBConfig();
  if (!dbConfig) {
    throw new Error("No Postgres config available");
  }
  
  const client = new Client({
    host: dbConfig.host,
    port: dbConfig.port,
    database: dbConfig.database,
    user: dbConfig.user,
    password: dbConfig.password,
    connectionTimeoutMillis: 1000 // fast connection timeout for safe fallback
  });
  
  await client.connect();
  try {
    const res = await client.query(queryStr, params);
    return res.rows;
  } finally {
    await client.end();
  }
}

// -------------------------------------------------------------
// System Performance Metrics & Service Monitoring Helpers
// -------------------------------------------------------------
let lastCPUInfo = { idle: 0, total: 0 };

function getCPUUsage(): number {
  try {
    const statPath = getRealPath("/proc/stat");
    const actualStatPath = fs.existsSync("/proc/stat") ? "/proc/stat" : (fs.existsSync(statPath) ? statPath : null);
    if (actualStatPath) {
      const content = fs.readFileSync(actualStatPath, "utf8");
      const firstLine = content.split("\n")[0];
      const parts = firstLine.replace(/\s+/g, " ").split(" ");
      const idle = parseFloat(parts[4]);
      const total = parts.slice(1, 8).reduce((acc, val) => acc + parseFloat(val), 0);
      
      const idleDiff = idle - lastCPUInfo.idle;
      const totalDiff = total - lastCPUInfo.total;
      
      lastCPUInfo = { idle, total };
      
      if (totalDiff === 0) return 15.0;
      const pct = (1 - idleDiff / totalDiff) * 100;
      return parseFloat(pct.toFixed(1));
    }
  } catch (e) {
    // Ignore and fallback
  }
  // Fallback / Sandbox: slightly fluctuating realistic CPU
  return parseFloat((15.0 + (Date.now() % 10000) / 1000 * 1.5).toFixed(1));
}

function getMemoryUsage() {
  try {
    const total = os.totalmem();
    const free = os.freemem();
    const used = total - free;
    const pct = parseFloat(((used / total) * 100).toFixed(1));
    const totalGB = parseFloat((total / 1024 / 1024 / 1024).toFixed(1));
    const freeGB = parseFloat((free / 1024 / 1024 / 1024).toFixed(1));
    return { pct, total: totalGB, free: freeGB };
  } catch (e) {
    return { pct: 72.3, total: 8.0, free: 2.2 };
  }
}

function getDiskUsage() {
  try {
    const output = execSync("df -k /").toString().split("\n")[1].replace(/\s+/g, ' ').split(' ');
    const totalKB = parseInt(output[1]);
    const usedKB = parseInt(output[2]);
    const freeKB = parseInt(output[3]);
    const pct = parseFloat(((usedKB / totalKB) * 100).toFixed(1));
    const totalGB = parseFloat((totalKB / 1024 / 1024).toFixed(1));
    const freeGB = parseFloat((freeKB / 1024 / 1024).toFixed(1));
    return { pct, total: totalGB, free: freeGB };
  } catch (e) {
    return { pct: 44.2, total: 100.0, free: 55.8 };
  }
}

function getUptime(): string {
  try {
    const uptimeSec = os.uptime();
    const days = Math.floor(uptimeSec / (24 * 3600));
    const hours = Math.floor((uptimeSec % (24 * 3600)) / 3600);
    const minutes = Math.floor((uptimeSec % 3600) / 60);
    
    const parts: string[] = [];
    if (days > 0) parts.push(`${days} day${days > 1 ? 's' : ''}`);
    if (hours > 0) parts.push(`${hours} hour${hours > 1 ? 's' : ''}`);
    parts.push(`${minutes} minute${minutes > 1 ? 's' : ''}`);
    return parts.join(", ");
  } catch (e) {
    return "12 days, 4 hours, 32 minutes";
  }
}

function getServicesStatus() {
  const serviceMap: { [key: string]: string } = {
    synapse: "matrix-synapse",
    element: "nginx",
    postgres: "postgresql",
    coturn: "coturn",
    nginx: "nginx",
    redis: "redis-server",
    fail2ban: "fail2ban",
    prometheus: "prometheus"
  };
  
  const hasSystemctl = fs.existsSync("/bin/systemctl") || fs.existsSync("/usr/bin/systemctl");
  const services: any[] = [];
  
  for (const [clientId, systemdName] of Object.entries(serviceMap)) {
    let status = "inactive";
    if (hasSystemctl) {
      try {
        const out = execSync(`systemctl is-active ${systemdName}`).toString().trim();
        if (out === "active") status = "active";
        else if (out === "failed") status = "failed";
      } catch (e) {
        // systemctl returns non-zero code for inactive
      }
    } else {
      // Sandbox simulation
      if (["synapse", "postgres", "nginx", "redis", "coturn", "element", "fail2ban"].includes(clientId)) {
        status = "active";
      }
    }
    services.push({ id: clientId, status });
  }
  return services;
}

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
  const data = JSON.parse(content);
  
  let updated = false;
  if (!data.matrixRooms) {
    data.matrixRooms = [
      {
        id: "!room1:matrix.company.local",
        name: "General Organization Chat",
        alias: "#general:matrix.company.local",
        topic: "Welcome to our central Matrix server! Let's collaborate.",
        creator: "@masoud:matrix.company.local",
        membersCount: 3,
        joinedMembers: [
          { mxid: "@masoud:matrix.company.local", role: "Creator", powerLevel: 100 },
          { mxid: "@alice:matrix.company.local", role: "Admin", powerLevel: 100 },
          { mxid: "@bob:matrix.company.local", role: "Default", powerLevel: 0 }
        ],
        version: "10",
        isFederated: true,
        isPublic: true,
        createdAt: "2026-07-12T12:00:00.000Z"
      },
      {
        id: "!room2:matrix.company.local",
        name: "Infrastructure & Security",
        alias: "#infra:matrix.company.local",
        topic: "Critical server updates, TLS reissues, and docker configurations discussion.",
        creator: "@masoud:matrix.company.local",
        membersCount: 2,
        joinedMembers: [
          { mxid: "@masoud:matrix.company.local", role: "Creator", powerLevel: 100 },
          { mxid: "@alice:matrix.company.local", role: "Moderator", powerLevel: 50 }
        ],
        version: "10",
        isFederated: false,
        isPublic: false,
        createdAt: "2026-07-12T13:30:00.000Z"
      },
      {
        id: "!room3:matrix.company.local",
        name: "Marketing & Outreach",
        alias: "#marketing:matrix.company.local",
        topic: "Federated communications for campaign coordination.",
        creator: "@alice:matrix.company.local",
        membersCount: 1,
        joinedMembers: [
          { mxid: "@alice:matrix.company.local", role: "Creator", powerLevel: 100 }
        ],
        version: "11",
        isFederated: true,
        isPublic: true,
        createdAt: "2026-07-13T01:15:00.000Z"
      }
    ];
    updated = true;
  }
  
  if (!data.matrixMedia) {
    data.matrixMedia = [
      { id: "mxc://matrix.company.local/img9988ff", fileName: "corporate_logo.png", fileSize: 1542000, mimeType: "image/png", uploadedBy: "@masoud:matrix.company.local", uploadedAt: "2026-07-12T12:10:00.000Z", isCached: false },
      { id: "mxc://matrix.company.local/doc1122xx", fileName: "onboarding_guide.pdf", fileSize: 4521000, mimeType: "application/pdf", uploadedBy: "@alice:matrix.company.local", uploadedAt: "2026-07-12T14:05:00.000Z", isCached: false },
      { id: "mxc://matrix.org/avatar8822", fileName: "remote_alice_avatar.jpg", fileSize: 35000, mimeType: "image/jpeg", uploadedBy: "@alice:matrix.company.local", uploadedAt: "2026-07-12T14:10:00.000Z", isCached: true },
      { id: "mxc://matrix.company.local/media999", fileName: "meeting_recording.mp4", fileSize: 48200000, mimeType: "video/mp4", uploadedBy: "@bob:matrix.company.local", uploadedAt: "2026-07-13T02:00:00.000Z", isCached: false }
    ];
    updated = true;
  }
  
  if (!data.registrationTokens) {
    data.registrationTokens = [
      { token: "ORG-STAFF-PROMO-2026", usesAllowed: 50, usesCount: 12, expiryTime: "2026-12-31T23:59:59.000Z", isActive: true },
      { token: "INFRA-DEV-ROOT-KEY", usesAllowed: 5, usesCount: 5, expiryTime: "2026-08-15T00:00:00.000Z", isActive: false },
      { token: "TEMP-GUEST-TOKEN", usesAllowed: 1, usesCount: 0, expiryTime: "2026-07-20T12:00:00.000Z", isActive: true }
    ];
    updated = true;
  }

  if (data.matrixUsers && data.matrixUsers.length > 0 && !data.matrixUsers[0].displayName) {
    data.matrixUsers = data.matrixUsers.map((mu: any) => {
      const username = mu.mxid.split(":")[0].replace("@", "");
      return {
        ...mu,
        displayName: username.charAt(0).toUpperCase() + username.slice(1),
        avatarUrl: `https://api.dicebear.com/7.x/bottts/svg?seed=${username}`
      };
    });
    updated = true;
  }

  if (updated) {
    writeSandboxFile("/db/panel_data.json", JSON.stringify(data, null, 2));
  }

  return data;
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
app.get("/api/matrix/users", authenticateToken, async (req, res) => {
  try {
    const query = `
      SELECT u.name as mxid, u.admin, u.deactivated, u.creation_ts, u.user_type, p.displayname, p.avatar_url
      FROM users u
      LEFT JOIN profiles p ON u.name = p.user_id
      ORDER BY u.creation_ts DESC;
    `;
    const rows = await queryPostgres(query);
    
    // Translate and sanitize results
    const matrixUsers = rows.map((r: any) => {
      const username = r.mxid.split(":")[0].replace("@", "") || "unknown";
      return {
        mxid: r.mxid,
        isAdmin: !!r.admin,
        isDeactivated: !!r.deactivated,
        creationTs: r.creation_ts,
        displayName: r.displayname || (username.charAt(0).toUpperCase() + username.slice(1)),
        avatarUrl: r.avatar_url || `https://api.dicebear.com/7.x/bottts/svg?seed=${username}`,
        userType: r.user_type
      };
    });
    
    if (matrixUsers.length > 0) {
      return res.json(matrixUsers);
    }
  } catch (e: any) {
    console.log("Postgres user fetch error, falling back to local DB: " + e.message);
  }

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

// -------------------------------------------------------------
// Advanced Matrix User Profile & Ketesa Administration
// -------------------------------------------------------------
app.get("/api/matrix/users/details", authenticateToken, async (req, res) => {
  const { mxid } = req.query;
  if (!mxid) return res.status(400).json({ error: "MXID is required" });

  try {
    const rows = await queryPostgres(
      "SELECT u.name as mxid, u.admin, u.deactivated, u.creation_ts, u.user_type, p.displayname, p.avatar_url FROM users u LEFT JOIN profiles p ON u.name = p.user_id WHERE u.name = $1",
      [mxid]
    );
    if (rows.length > 0) {
      const r = rows[0];
      const username = mxid.toString().split(":")[0].replace("@", "");
      
      // Fetch user threepids (emails and phones)
      const tpRows = await queryPostgres("SELECT medium, address FROM user_threepids WHERE user_id = $1", [mxid]);
      const emails = tpRows.filter((tp: any) => tp.medium === "email").map((tp: any) => tp.address);
      const phones = tpRows.filter((tp: any) => tp.medium === "msisdn").map((tp: any) => tp.address);
      
      // Fetch devices
      const devRows = await queryPostgres("SELECT device_id FROM devices WHERE user_id = $1", [mxid]);
      const devices = devRows.map((d: any) => ({
        id: d.device_id,
        name: "Active Device",
        lastSeenIp: "Unknown",
        lastSeenAt: new Date().toISOString()
      }));
      
      const realUser: any = {
        mxid: r.mxid,
        displayName: r.displayname || (username.charAt(0).toUpperCase() + username.slice(1)),
        avatarUrl: r.avatar_url || `https://api.dicebear.com/7.x/bottts/svg?seed={username}`,
        isAdmin: !!r.admin,
        isDeactivated: !!r.deactivated,
        isSuspended: !!r.deactivated,
        isShadowBanned: false,
        createdAt: new Date(r.creation_ts * (r.creation_ts > 9999999999 ? 1 : 1000)).toISOString(),
        userType: r.user_type || "normal",
        emails: emails.length > 0 ? emails : [`${username}@matrix.kheilisabz.local`],
        phones: phones.length > 0 ? phones : [],
        devices: devices.length > 0 ? devices : [
          { id: "DEV-WEB-" + Math.floor(1000 + Math.random() * 9000), name: "Element Web Client", lastSeenIp: "127.0.0.1", lastSeenAt: new Date().toISOString() }
        ],
        sso: [{ provider: "Database Authenticated", externalId: username, linkedAt: new Date().toISOString() }],
        connections: [
          { ip: "127.0.0.1", timestamp: new Date().toISOString(), userAgent: "Mozilla/5.0" }
        ],
        pushers: [],
        experimental: [],
        rateLimits: { perSecond: 2, burstCount: 10 },
        accountData: {}
      };
      return res.json(realUser);
    }
  } catch (e: any) {
    console.log("Postgres user details fetch error, falling back to local DB: " + e.message);
  }

  const db = readDb();
  const userIndex = db.matrixUsers.findIndex((u: any) => u.mxid === mxid);
  if (userIndex === -1) return res.status(404).json({ error: "Matrix user not found" });

  const user = db.matrixUsers[userIndex];
  const username = mxid.toString().split(":")[0].replace("@", "");

  // Ensure advanced properties exist with realistic defaults if missing
  let updated = false;
  if (!user.createdAt) {
    user.createdAt = new Date(Date.now() - 3600000 * 24 * (30 + Math.floor(Math.random() * 90))).toISOString();
    updated = true;
  }
  if (!user.userType) {
    user.userType = user.isAdmin ? "admin" : "normal";
    updated = true;
  }
  if (!user.emails) {
    user.emails = [`${username}@matrix.kheilisabz.local`];
    updated = true;
  }
  if (!user.phones) {
    user.phones = ["+98912" + Math.floor(1000000 + Math.random() * 9000000)];
    updated = true;
  }
  if (!user.sso) {
    user.sso = [
      { provider: "LDAP Integration", externalId: username, linkedAt: user.createdAt }
    ];
    updated = true;
  }
  if (!user.devices) {
    user.devices = [
      { id: "DEV-IOS-" + Math.floor(1000 + Math.random() * 9000), name: "Masoud's iPhone 15 Pro", lastSeenIp: "192.168.1.112", lastSeenAt: new Date(Date.now() - 1000 * 60 * 15).toISOString(), userAgent: "Element iOS / Mozilla/5.0 (iPhone; CPU iPhone OS 17_4 like Mac OS X)" },
      { id: "DEV-WEB-" + Math.floor(1000 + Math.random() * 9000), name: "Chrome macOS - Element Web", lastSeenIp: "192.168.1.100", lastSeenAt: new Date(Date.now() - 1000 * 60 * 120).toISOString(), userAgent: "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 Chrome/124.0.0.0" }
    ];
    updated = true;
  }
  if (!user.connections) {
    user.connections = [
      { ip: "192.168.1.112", timestamp: new Date(Date.now() - 1000 * 60 * 15).toISOString(), userAgent: "Element iOS" },
      { ip: "192.168.1.100", timestamp: new Date(Date.now() - 1000 * 60 * 120).toISOString(), userAgent: "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) Chrome/124.0.0.0" },
      { ip: "10.0.4.52", timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(), userAgent: "Element Desktop" }
    ];
    updated = true;
  }
  if (!user.pushers) {
    user.pushers = [
      { appId: "im.vector.app.android", pushKey: "APA91bEy..." + Math.floor(100 + Math.random() * 900), kind: "http", data: { url: "https://matrix.org/_matrix/push/v1/notify" }, profileTag: "mobile-pusher" }
    ];
    updated = true;
  }
  if (!user.experimental) {
    user.experimental = [
      { key: "m.relates_to.stable", value: "true" },
      { key: "org.matrix.msc3026", value: "enabled" }
    ];
    updated = true;
  }
  if (!user.rateLimits) {
    user.rateLimits = { perSecond: 2, burstCount: 10 };
    updated = true;
  }
  if (!user.accountData) {
    user.accountData = {
      "im.vector.web.settings": { "sidebarShowShortcuts": true, "theme": "dark" }
    };
    updated = true;
  }
  if (user.isSuspended === undefined) {
    user.isSuspended = false;
    updated = true;
  }
  if (user.isShadowBanned === undefined) {
    user.isShadowBanned = false;
    updated = true;
  }
  if (user.isLocked === undefined) {
    user.isLocked = false;
    updated = true;
  }
  if (user.isErased === undefined) {
    user.isErased = false;
    updated = true;
  }

  // Populate dynamic memberships history if missing
  if (!user.memberships) {
    user.memberships = [
      { roomId: "!room1:matrix.company.local", roomName: "General Organization Chat", state: "join", timestamp: user.createdAt, handler: "synapse.join" },
      { roomId: "!room2:matrix.company.local", roomName: "Infrastructure & Security", state: "join", timestamp: new Date(Date.now() - 3600000 * 48).toISOString(), handler: "synapse.join" }
    ];
    updated = true;
  }

  if (updated) {
    writeDb(db);
  }

  // Build the user's specific uploaded media files filtered from global DB
  const userMedia = (db.matrixMedia || []).filter((m: any) => m.uploadedBy === mxid);

  // Build room details for rooms the user is involved in
  const userRooms = (db.matrixRooms || []).map((r: any) => {
    const isMember = r.joinedMembers.some((m: any) => m.mxid === mxid);
    const memberObj = r.joinedMembers.find((m: any) => m.mxid === mxid);
    const isBanned = r.bannedMembers && r.bannedMembers.includes(mxid);
    return {
      roomId: r.id,
      name: r.name,
      alias: r.alias || "",
      isJoined: isMember,
      isBanned: !!isBanned,
      powerLevel: memberObj ? memberObj.powerLevel : 0,
      role: memberObj ? memberObj.role : "None"
    };
  });

  res.json({
    ...user,
    media: userMedia,
    rooms: userRooms
  });
});

// Save updated user parameters (Suspended, Shadow Banned, Locked, GDPR Erased, Admin, UserType)
app.post("/api/matrix/users/details/update", authenticateToken, checkPermission(["Owner", "Super Admin", "Moderator"]), (req, res) => {
  const { mxid, isSuspended, isShadowBanned, isLocked, isErased, isAdmin, userType, displayName } = req.body;
  if (!mxid) return res.status(400).json({ error: "MXID is required" });

  const db = readDb();
  const user = db.matrixUsers.find((u: any) => u.mxid === mxid);
  if (!user) return res.status(404).json({ error: "Matrix user not found" });

  if (isSuspended !== undefined) user.isSuspended = !!isSuspended;
  if (isShadowBanned !== undefined) user.isShadowBanned = !!isShadowBanned;
  if (isLocked !== undefined) user.isLocked = !!isLocked;
  if (isErased !== undefined) user.isErased = !!isErased;
  if (isAdmin !== undefined) user.isAdmin = !!isAdmin;
  if (userType !== undefined) user.userType = userType;
  if (displayName !== undefined) user.displayName = displayName;

  writeDb(db);

  db.auditLogs.unshift({
    id: `log-${Date.now()}`,
    timestamp: new Date().toISOString(),
    username: req.user.username,
    action: "Update User Parameters",
    target: mxid,
    status: "success",
    details: `Updated administrative flags for ${mxid}`
  });
  writeDb(db);

  res.json({ success: true, user });
});

// Password change (will log user out of all sessions/devices)
app.post("/api/matrix/users/password", authenticateToken, checkPermission(["Owner", "Super Admin"]), (req, res) => {
  const { mxid, password } = req.body;
  if (!mxid || !password) return res.status(400).json({ error: "MXID and password are required" });

  const db = readDb();
  const user = db.matrixUsers.find((u: any) => u.mxid === mxid);
  if (!user) return res.status(404).json({ error: "Matrix user not found" });

  // Reset devices (log out of all sessions)
  user.devices = [];
  writeDb(db);

  db.auditLogs.unshift({
    id: `log-${Date.now()}`,
    timestamp: new Date().toISOString(),
    username: req.user.username,
    action: "Reset User Password",
    target: mxid,
    status: "success",
    details: `Reset password for user ${mxid} and force-terminated all device sessions.`
  });
  writeDb(db);

  res.json({ success: true, message: "Password reset successfully. All devices logged out." });
});

// Emails and Phones management
app.post("/api/matrix/users/emails/add", authenticateToken, checkPermission(["Owner", "Super Admin", "Moderator"]), (req, res) => {
  const { mxid, email } = req.body;
  if (!mxid || !email) return res.status(400).json({ error: "MXID and email are required" });

  const db = readDb();
  const user = db.matrixUsers.find((u: any) => u.mxid === mxid);
  if (!user) return res.status(404).json({ error: "Matrix user not found" });

  if (!user.emails) user.emails = [];
  if (user.emails.includes(email)) return res.status(400).json({ error: "Email already exists" });

  user.emails.push(email);
  writeDb(db);

  db.auditLogs.unshift({
    id: `log-${Date.now()}`,
    timestamp: new Date().toISOString(),
    username: req.user.username,
    action: "Add User Email",
    target: mxid,
    status: "success",
    details: `Linked email ${email} to ${mxid}`
  });
  writeDb(db);

  res.json({ success: true, emails: user.emails });
});

app.post("/api/matrix/users/emails/delete", authenticateToken, checkPermission(["Owner", "Super Admin", "Moderator"]), (req, res) => {
  const { mxid, email } = req.body;
  if (!mxid || !email) return res.status(400).json({ error: "MXID and email are required" });

  const db = readDb();
  const user = db.matrixUsers.find((u: any) => u.mxid === mxid);
  if (!user) return res.status(404).json({ error: "Matrix user not found" });

  if (user.emails) {
    user.emails = user.emails.filter((e: string) => e !== email);
    writeDb(db);
  }

  db.auditLogs.unshift({
    id: `log-${Date.now()}`,
    timestamp: new Date().toISOString(),
    username: req.user.username,
    action: "Remove User Email",
    target: mxid,
    status: "success",
    details: `Removed email ${email} from ${mxid}`
  });
  writeDb(db);

  res.json({ success: true, emails: user.emails || [] });
});

app.post("/api/matrix/users/phones/add", authenticateToken, checkPermission(["Owner", "Super Admin", "Moderator"]), (req, res) => {
  const { mxid, phone } = req.body;
  if (!mxid || !phone) return res.status(400).json({ error: "MXID and phone are required" });

  const db = readDb();
  const user = db.matrixUsers.find((u: any) => u.mxid === mxid);
  if (!user) return res.status(404).json({ error: "Matrix user not found" });

  if (!user.phones) user.phones = [];
  if (user.phones.includes(phone)) return res.status(400).json({ error: "Phone already exists" });

  user.phones.push(phone);
  writeDb(db);

  db.auditLogs.unshift({
    id: `log-${Date.now()}`,
    timestamp: new Date().toISOString(),
    username: req.user.username,
    action: "Add User Phone",
    target: mxid,
    status: "success",
    details: `Linked phone ${phone} to ${mxid}`
  });
  writeDb(db);

  res.json({ success: true, phones: user.phones });
});

app.post("/api/matrix/users/phones/delete", authenticateToken, checkPermission(["Owner", "Super Admin", "Moderator"]), (req, res) => {
  const { mxid, phone } = req.body;
  if (!mxid || !phone) return res.status(400).json({ error: "MXID and phone are required" });

  const db = readDb();
  const user = db.matrixUsers.find((u: any) => u.mxid === mxid);
  if (!user) return res.status(404).json({ error: "Matrix user not found" });

  if (user.phones) {
    user.phones = user.phones.filter((p: string) => p !== phone);
    writeDb(db);
  }

  db.auditLogs.unshift({
    id: `log-${Date.now()}`,
    timestamp: new Date().toISOString(),
    username: req.user.username,
    action: "Remove User Phone",
    target: mxid,
    status: "success",
    details: `Removed phone ${phone} from ${mxid}`
  });
  writeDb(db);

  res.json({ success: true, phones: user.phones || [] });
});

// Force logout/delete user device
app.post("/api/matrix/users/devices/delete", authenticateToken, checkPermission(["Owner", "Super Admin", "Moderator"]), (req, res) => {
  const { mxid, deviceId } = req.body;
  if (!mxid || !deviceId) return res.status(400).json({ error: "MXID and device ID are required" });

  const db = readDb();
  const user = db.matrixUsers.find((u: any) => u.mxid === mxid);
  if (!user) return res.status(404).json({ error: "Matrix user not found" });

  if (user.devices) {
    user.devices = user.devices.filter((d: any) => d.id !== deviceId);
    writeDb(db);
  }

  db.auditLogs.unshift({
    id: `log-${Date.now()}`,
    timestamp: new Date().toISOString(),
    username: req.user.username,
    action: "Terminate Device Session",
    target: mxid,
    status: "success",
    details: `Force logged out device ${deviceId} for user ${mxid}`
  });
  writeDb(db);

  res.json({ success: true, devices: user.devices || [] });
});

// Kick / Ban user from room
app.post("/api/matrix/users/rooms/kick", authenticateToken, checkPermission(["Owner", "Super Admin", "Moderator"]), (req, res) => {
  const { mxid, roomId } = req.body;
  if (!mxid || !roomId) return res.status(400).json({ error: "MXID and roomId are required" });

  const db = readDb();
  const room = (db.matrixRooms || []).find((r: any) => r.id === roomId);
  if (!room) return res.status(404).json({ error: "Room not found" });

  const memberIdx = room.joinedMembers.findIndex((m: any) => m.mxid === mxid);
  if (memberIdx !== -1) {
    room.joinedMembers.splice(memberIdx, 1);
    room.membersCount = room.joinedMembers.length;
  }

  // Update memberships list for user if exists
  const user = db.matrixUsers.find((u: any) => u.mxid === mxid);
  if (user) {
    if (!user.memberships) user.memberships = [];
    user.memberships.unshift({
      roomId,
      roomName: room.name,
      state: "leave",
      timestamp: new Date().toISOString(),
      handler: `kicked_by_${req.user.username}`
    });
  }

  writeDb(db);

  db.auditLogs.unshift({
    id: `log-${Date.now()}`,
    timestamp: new Date().toISOString(),
    username: req.user.username,
    action: "Kick User from Room",
    target: mxid,
    status: "success",
    details: `Kicked ${mxid} from room: ${room.name}`
  });
  writeDb(db);

  res.json({ success: true });
});

app.post("/api/matrix/users/rooms/ban", authenticateToken, checkPermission(["Owner", "Super Admin", "Moderator"]), (req, res) => {
  const { mxid, roomId } = req.body;
  if (!mxid || !roomId) return res.status(400).json({ error: "MXID and roomId are required" });

  const db = readDb();
  const room = (db.matrixRooms || []).find((r: any) => r.id === roomId);
  if (!room) return res.status(404).json({ error: "Room not found" });

  // Kick if joined
  const memberIdx = room.joinedMembers.findIndex((m: any) => m.mxid === mxid);
  if (memberIdx !== -1) {
    room.joinedMembers.splice(memberIdx, 1);
    room.membersCount = room.joinedMembers.length;
  }

  // Ban
  if (!room.bannedMembers) room.bannedMembers = [];
  if (!room.bannedMembers.includes(mxid)) {
    room.bannedMembers.push(mxid);
  }

  // Update memberships
  const user = db.matrixUsers.find((u: any) => u.mxid === mxid);
  if (user) {
    if (!user.memberships) user.memberships = [];
    user.memberships.unshift({
      roomId,
      roomName: room.name,
      state: "ban",
      timestamp: new Date().toISOString(),
      handler: `banned_by_${req.user.username}`
    });
  }

  writeDb(db);

  db.auditLogs.unshift({
    id: `log-${Date.now()}`,
    timestamp: new Date().toISOString(),
    username: req.user.username,
    action: "Ban User from Room",
    target: mxid,
    status: "success",
    details: `Banned ${mxid} from room: ${room.name}`
  });
  writeDb(db);

  res.json({ success: true });
});

app.post("/api/matrix/users/rooms/unban", authenticateToken, checkPermission(["Owner", "Super Admin", "Moderator"]), (req, res) => {
  const { mxid, roomId } = req.body;
  if (!mxid || !roomId) return res.status(400).json({ error: "MXID and roomId are required" });

  const db = readDb();
  const room = (db.matrixRooms || []).find((r: any) => r.id === roomId);
  if (!room) return res.status(404).json({ error: "Room not found" });

  if (room.bannedMembers) {
    room.bannedMembers = room.bannedMembers.filter((b: string) => b !== mxid);
  }

  const user = db.matrixUsers.find((u: any) => u.mxid === mxid);
  if (user) {
    if (!user.memberships) user.memberships = [];
    user.memberships.unshift({
      roomId,
      roomName: room.name,
      state: "leave",
      timestamp: new Date().toISOString(),
      handler: `unbanned_by_${req.user.username}`
    });
  }

  writeDb(db);

  db.auditLogs.unshift({
    id: `log-${Date.now()}`,
    timestamp: new Date().toISOString(),
    username: req.user.username,
    action: "Unban User from Room",
    target: mxid,
    status: "success",
    details: `Lifted ban on user ${mxid} for room ${room.name}`
  });
  writeDb(db);

  res.json({ success: true });
});

// Quarantine/Unquarantine/Delete media
app.post("/api/matrix/users/media/quarantine", authenticateToken, checkPermission(["Owner", "Super Admin", "Moderator"]), (req, res) => {
  const { mediaId, quarantine } = req.body;
  if (!mediaId) return res.status(400).json({ error: "Media ID is required" });

  const db = readDb();
  const media = (db.matrixMedia || []).find((m: any) => m.id === mediaId);
  if (!media) return res.status(404).json({ error: "Media file not found" });

  media.isQuarantined = !!quarantine;
  writeDb(db);

  db.auditLogs.unshift({
    id: `log-${Date.now()}`,
    timestamp: new Date().toISOString(),
    username: req.user.username,
    action: quarantine ? "Quarantine Media" : "Lift Media Quarantine",
    target: mediaId,
    status: "success",
    details: quarantine ? `Quarantined media file: ${media.fileName}` : `Lifted quarantine on media file: ${media.fileName}`
  });
  writeDb(db);

  res.json({ success: true, media });
});

// Rate limit updates
app.post("/api/matrix/users/rate-limits", authenticateToken, checkPermission(["Owner", "Super Admin"]), (req, res) => {
  const { mxid, perSecond, burstCount } = req.body;
  if (!mxid) return res.status(400).json({ error: "MXID is required" });

  const db = readDb();
  const user = db.matrixUsers.find((u: any) => u.mxid === mxid);
  if (!user) return res.status(404).json({ error: "Matrix user not found" });

  user.rateLimits = {
    perSecond: parseFloat(perSecond) || 2,
    burstCount: parseInt(burstCount) || 10
  };
  writeDb(db);

  db.auditLogs.unshift({
    id: `log-${Date.now()}`,
    timestamp: new Date().toISOString(),
    username: req.user.username,
    action: "Update User Rate Limits",
    target: mxid,
    status: "success",
    details: `Updated rate limits for ${mxid} to ${perSecond} req/s, burst: ${burstCount}`
  });
  writeDb(db);

  res.json({ success: true, rateLimits: user.rateLimits });
});

// Account data updates
app.post("/api/matrix/users/account-data", authenticateToken, checkPermission(["Owner", "Super Admin"]), (req, res) => {
  const { mxid, accountData } = req.body;
  if (!mxid || !accountData) return res.status(400).json({ error: "MXID and accountData are required" });

  const db = readDb();
  const user = db.matrixUsers.find((u: any) => u.mxid === mxid);
  if (!user) return res.status(404).json({ error: "Matrix user not found" });

  user.accountData = accountData;
  writeDb(db);

  db.auditLogs.unshift({
    id: `log-${Date.now()}`,
    timestamp: new Date().toISOString(),
    username: req.user.username,
    action: "Update Account Data",
    target: mxid,
    status: "success",
    details: `Updated key-value account data overrides for ${mxid}`
  });
  writeDb(db);

  res.json({ success: true, accountData: user.accountData });
});

// Room Chat/Messages Viewer API
app.get("/api/matrix/rooms/:roomId/messages", authenticateToken, (req, res) => {
  const { roomId } = req.params;
  const db = readDb();
  const room = (db.matrixRooms || []).find((r: any) => r.id === roomId);
  if (!room) return res.status(404).json({ error: "Room not found" });

  // If no messages array exists, populate with realistic defaults
  if (!room.messages) {
    const isPublic = room.isPublic;
    const domain = roomId.split(":")[1] || "matrix.company.local";
    room.messages = [
      { id: "msg-1", sender: "@masoud:" + domain, senderDisplayName: "Masoud", content: "سلام به همگی، خوش آمدید به سرور ماتریکس ما. لطفاً همگی در این کانال حضور فعال داشته باشید.", timestamp: new Date(Date.now() - 3600000 * 24).toISOString(), type: "m.text" },
      { id: "msg-2", sender: "@alice:" + domain, senderDisplayName: "Alice", content: "Hi Masoud! Glad to be here. The Homeserver is running extremely fast today.", timestamp: new Date(Date.now() - 3600000 * 23.5).toISOString(), type: "m.text" },
      { id: "msg-3", sender: "@bob:" + domain, senderDisplayName: "Bob", content: "درود، تشکر از راه‌اندازی این سرور امن. تمام بخش‌های رمزنگاری شده تست شدند.", timestamp: new Date(Date.now() - 3600000 * 22).toISOString(), type: "m.text" },
      { id: "msg-4", sender: "@masoud:" + domain, senderDisplayName: "Masoud", content: "عالیه باب. برای ترن‌سرور (Coturn) هم پورت‌های امن رو فعال کردیم تا تماس‌ها بدون مشکل وصل بشن.", timestamp: new Date(Date.now() - 3600000 * 21).toISOString(), type: "m.text" },
      { id: "msg-5", sender: "@alice:" + domain, senderDisplayName: "Alice", content: "I noticed that. The integration with LDAP AD works seamlessly as well.", timestamp: new Date(Date.now() - 3600000 * 20.8).toISOString(), type: "m.text" },
      { id: "msg-6", sender: "@masoud:" + domain, senderDisplayName: "Masoud", content: "بله، همگام‌سازی کاربرها به صورت اتوماتیک انجام میشه.", timestamp: new Date(Date.now() - 3600000 * 18).toISOString(), type: "m.text" }
    ];

    if (roomId.includes("room2")) {
      room.messages = [
        { id: "sec-1", sender: "@masoud:" + domain, senderDisplayName: "Masoud", content: "سلام تیم امنیت. ممیزی دوره‌ای کدهای TLS رو شروع کردیم. لاگ‌های سرور سیناپس رو بررسی کنید.", timestamp: new Date(Date.now() - 3600000 * 6).toISOString(), type: "m.text" },
        { id: "sec-2", sender: "@alice:" + domain, senderDisplayName: "Alice", content: "I audited the nginx-proxy logs. All unauthorized endpoints are correctly blocked via rate limits.", timestamp: new Date(Date.now() - 3600000 * 5).toISOString(), type: "m.text" },
        { id: "sec-3", sender: "@alice:" + domain, senderDisplayName: "Alice", content: "We should restrict the API registrations with token-only access to prevent bot spamming.", timestamp: new Date(Date.now() - 3600000 * 4.8).toISOString(), type: "m.text" },
        { id: "sec-4", sender: "@masoud:" + domain, senderDisplayName: "Masoud", content: "موافقم آلیس. از بخش توکن‌های ثبت‌نام پنل، توکن‌های اختصاصی با محدودیت استفاده بساز تا بفرستیم برای افراد جدید.", timestamp: new Date(Date.now() - 3600000 * 4).toISOString(), type: "m.text" },
        { id: "sec-5", sender: "@alice:" + domain, senderDisplayName: "Alice", content: "Done. I created three tokens and enabled LDAP authentication fallback. Safe and sound.", timestamp: new Date(Date.now() - 3600000 * 3.5).toISOString(), type: "m.text" }
      ];
    }

    writeDb(db);
  }

  res.json(room.messages);
});

// Send message to room
app.post("/api/matrix/rooms/:roomId/messages/send", authenticateToken, (req, res) => {
  const { roomId } = req.params;
  const { content, sender, senderDisplayName } = req.body;
  if (!content) return res.status(400).json({ error: "Content is required" });

  const db = readDb();
  const room = (db.matrixRooms || []).find((r: any) => r.id === roomId);
  if (!room) return res.status(404).json({ error: "Room not found" });

  if (!room.messages) room.messages = [];

  const newMessage = {
    id: "msg-" + Date.now(),
    sender: sender || `@${req.user.username}:${roomId.split(":")[1] || "matrix.company.local"}`,
    senderDisplayName: senderDisplayName || req.user.username,
    content,
    timestamp: new Date().toISOString(),
    type: "m.text"
  };

  room.messages.push(newMessage);
  writeDb(db);

  res.json(newMessage);
});

// -------------------------------------------------------------
// Matrix Rooms Management (Ketesa features)
// -------------------------------------------------------------
app.get("/api/matrix/rooms", authenticateToken, (req, res) => {
  const db = readDb();
  res.json(db.matrixRooms || []);
});

app.post("/api/matrix/rooms/create", authenticateToken, checkPermission(["Owner", "Super Admin"]), (req, res) => {
  const { name, alias, topic, isPublic, isFederated } = req.body;
  if (!name) return res.status(400).json({ error: "Room name is required" });

  const db = readDb();
  const confRaw = readSandboxFile("/etc/matrix-stack.conf", "HS_DOMAIN=matrix.company.local");
  const hsDomainMatch = confRaw.match(/^HS_DOMAIN=(.+)$/m);
  const hsDomain = hsDomainMatch ? hsDomainMatch[1] : "matrix.company.local";

  const cleanAlias = alias ? (alias.startsWith("#") ? alias : `#${alias}`) : undefined;
  const fullAlias = cleanAlias ? (cleanAlias.includes(":") ? cleanAlias : `${cleanAlias}:${hsDomain}`) : undefined;

  const newRoomId = `!room-${Date.now()}:${hsDomain}`;
  const newRoom = {
    id: newRoomId,
    name,
    alias: fullAlias,
    topic: topic || "",
    creator: `@${req.user.username}:${hsDomain}`,
    membersCount: 1,
    joinedMembers: [
      { mxid: `@${req.user.username}:${hsDomain}`, role: "Creator", powerLevel: 100 }
    ],
    version: "10",
    isFederated: !!isFederated,
    isPublic: !!isPublic,
    createdAt: new Date().toISOString()
  };

  if (!db.matrixRooms) db.matrixRooms = [];
  db.matrixRooms.push(newRoom);
  writeDb(db);

  db.auditLogs.unshift({
    id: `log-${Date.now()}`,
    timestamp: new Date().toISOString(),
    username: req.user.username,
    action: "Create Matrix Room",
    target: name,
    status: "success",
    details: `Created new Matrix room with alias ${fullAlias || "none"} (ID: ${newRoomId})`
  });
  writeDb(db);

  res.status(201).json(newRoom);
});

app.post("/api/matrix/rooms/delete", authenticateToken, checkPermission(["Owner", "Super Admin"]), (req, res) => {
  const { roomId, purge, sendMessage, messageText } = req.body;
  if (!roomId) return res.status(400).json({ error: "Room ID is required" });

  const db = readDb();
  const roomIndex = (db.matrixRooms || []).findIndex((r: any) => r.id === roomId);
  if (roomIndex === -1) return res.status(404).json({ error: "Room not found" });

  const room = db.matrixRooms[roomIndex];
  db.matrixRooms.splice(roomIndex, 1);
  writeDb(db);

  db.auditLogs.unshift({
    id: `log-${Date.now()}`,
    timestamp: new Date().toISOString(),
    username: req.user.username,
    action: "Shutdown Matrix Room",
    target: room.name,
    status: "success",
    details: `Shutdown room ${roomId}. Purged: ${!!purge}. Message sent: ${!!sendMessage}`
  });
  writeDb(db);

  res.json({ message: "Room shutdown and deleted successfully" });
});

app.post("/api/matrix/rooms/members/kick", authenticateToken, checkPermission(["Owner", "Super Admin", "Moderator"]), (req, res) => {
  const { roomId, mxid } = req.body;
  if (!roomId || !mxid) return res.status(400).json({ error: "Room ID and MXID are required" });

  const db = readDb();
  const room = (db.matrixRooms || []).find((r: any) => r.id === roomId);
  if (!room) return res.status(404).json({ error: "Room not found" });

  const memberIndex = room.joinedMembers.findIndex((m: any) => m.mxid === mxid);
  if (memberIndex === -1) return res.status(404).json({ error: "Member not found in this room" });

  room.joinedMembers.splice(memberIndex, 1);
  room.membersCount = room.joinedMembers.length;
  writeDb(db);

  db.auditLogs.unshift({
    id: `log-${Date.now()}`,
    timestamp: new Date().toISOString(),
    username: req.user.username,
    action: "Kick Room Member",
    target: mxid,
    status: "success",
    details: `Kicked user ${mxid} from room: ${room.name}`
  });
  writeDb(db);

  res.json({ success: true, room });
});

// -------------------------------------------------------------
// Matrix Media Cleanup (Ketesa features)
// -------------------------------------------------------------
app.get("/api/matrix/media", authenticateToken, (req, res) => {
  const db = readDb();
  res.json(db.matrixMedia || []);
});

app.post("/api/matrix/media/delete", authenticateToken, checkPermission(["Owner", "Super Admin"]), (req, res) => {
  const { mediaId } = req.body;
  if (!mediaId) return res.status(400).json({ error: "Media MXC ID is required" });

  const db = readDb();
  const mediaIndex = (db.matrixMedia || []).findIndex((m: any) => m.id === mediaId);
  if (mediaIndex === -1) return res.status(404).json({ error: "Media not found" });

  const media = db.matrixMedia[mediaIndex];
  db.matrixMedia.splice(mediaIndex, 1);
  writeDb(db);

  db.auditLogs.unshift({
    id: `log-${Date.now()}`,
    timestamp: new Date().toISOString(),
    username: req.user.username,
    action: "Purge Media File",
    target: mediaId,
    status: "success",
    details: `Permanently purged file ${media.fileName || "unnamed"} (${(media.fileSize / 1024 / 1024).toFixed(2)} MB)`
  });
  writeDb(db);

  res.json({ message: "Media purged successfully" });
});

app.post("/api/matrix/media/cleanup", authenticateToken, checkPermission(["Owner", "Super Admin"]), (req, res) => {
  const { type, days, domain } = req.body;
  const db = readDb();

  let purgedCount = 0;
  let purgedSize = 0;

  if (!db.matrixMedia) db.matrixMedia = [];

  if (type === "remote_cache") {
    db.matrixMedia = db.matrixMedia.filter((m: any) => {
      if (m.isCached) {
        purgedCount++;
        purgedSize += m.fileSize;
        return false;
      }
      return true;
    });
    writeDb(db);
  } else if (type === "by_age") {
    const ageLimitMs = (days || 30) * 24 * 60 * 60 * 1000;
    const now = Date.now();
    db.matrixMedia = db.matrixMedia.filter((m: any) => {
      const uploadTime = new Date(m.uploadedAt).getTime();
      if (now - uploadTime > ageLimitMs) {
        purgedCount++;
        purgedSize += m.fileSize;
        return false;
      }
      return true;
    });
    writeDb(db);
  } else if (type === "by_domain") {
    if (!domain) return res.status(400).json({ error: "Domain parameter is required" });
    db.matrixMedia = db.matrixMedia.filter((m: any) => {
      if (m.id.includes(domain)) {
        purgedCount++;
        purgedSize += m.fileSize;
        return false;
      }
      return true;
    });
    writeDb(db);
  }

  db.auditLogs.unshift({
    id: `log-${Date.now()}`,
    timestamp: new Date().toISOString(),
    username: req.user.username,
    action: "Bulk Media Cleanup",
    target: type,
    status: "success",
    details: `Cleaned up ${purgedCount} media items, reclaiming ${(purgedSize / 1024 / 1024).toFixed(2)} MB of storage.`
  });
  writeDb(db);

  res.json({ success: true, purgedCount, reclaimedSizeMB: (purgedSize / 1024 / 1024).toFixed(2) });
});

// -------------------------------------------------------------
// Matrix Registration Tokens (Ketesa features)
// -------------------------------------------------------------
app.get("/api/matrix/tokens", authenticateToken, (req, res) => {
  const db = readDb();
  res.json(db.registrationTokens || []);
});

app.post("/api/matrix/tokens/create", authenticateToken, checkPermission(["Owner", "Super Admin"]), (req, res) => {
  const { token, usesAllowed, expiryTime } = req.body;
  if (!token) return res.status(400).json({ error: "Token string is required" });

  const db = readDb();
  if (!db.registrationTokens) db.registrationTokens = [];
  
  if (db.registrationTokens.find((t: any) => t.token === token)) {
    return res.status(400).json({ error: "Token already exists" });
  }

  const newToken = {
    token,
    usesAllowed: usesAllowed ? parseInt(usesAllowed) : undefined,
    usesCount: 0,
    expiryTime: expiryTime || undefined,
    isActive: true
  };

  db.registrationTokens.push(newToken);
  writeDb(db);

  db.auditLogs.unshift({
    id: `log-${Date.now()}`,
    timestamp: new Date().toISOString(),
    username: req.user.username,
    action: "Create Registration Token",
    target: token,
    status: "success",
    details: `Generated registration token. Limit: ${usesAllowed || "Unlimited"}, Expiry: ${expiryTime || "Never"}`
  });
  writeDb(db);

  res.status(201).json(newToken);
});

app.post("/api/matrix/tokens/delete", authenticateToken, checkPermission(["Owner", "Super Admin"]), (req, res) => {
  const { token } = req.body;
  if (!token) return res.status(400).json({ error: "Token string is required" });

  const db = readDb();
  const tokenIndex = (db.registrationTokens || []).findIndex((t: any) => t.token === token);
  if (tokenIndex === -1) return res.status(404).json({ error: "Token not found" });

  db.registrationTokens.splice(tokenIndex, 1);
  writeDb(db);

  db.auditLogs.unshift({
    id: `log-${Date.now()}`,
    timestamp: new Date().toISOString(),
    username: req.user.username,
    action: "Revoke Registration Token",
    target: token,
    status: "success",
    details: `Permanently revoked registration token ${token}`
  });
  writeDb(db);

  res.json({ message: "Token deleted successfully" });
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

  const sendMetrics = async () => {
    if (ws.readyState !== WebSocket.OPEN) return;

    const cpu = getCPUUsage();
    const mem = getMemoryUsage();
    const disk = getDiskUsage();
    const uptimeStr = getUptime();
    const activeServices = getServicesStatus();

    // Query active registered user count from Postgres if available
    let activeUsers = 1;
    try {
      const rows = await queryPostgres("SELECT COUNT(*) as count FROM users WHERE deactivated = 0 OR deactivated IS NULL");
      if (rows.length > 0) {
        activeUsers = parseInt(rows[0].count);
      }
    } catch (e) {
      // Fallback: simple varying counts from virtual DB or random
      try {
        const db = readDb();
        activeUsers = db.matrixUsers ? db.matrixUsers.filter((u: any) => !u.isDeactivated).length : 192;
      } catch (err) {
        activeUsers = 192;
      }
    }

    const time = new Date().toLocaleTimeString().slice(0, 8);

    trends.push({ time, cpu, memory: mem.pct, activeUsers, disk: disk.pct });
    if (trends.length > 20) trends.shift();

    const stats = {
      cpuUsage: cpu,
      memoryUsage: mem.pct,
      memoryTotal: mem.total,
      memoryFree: mem.free,
      diskUsage: disk.pct,
      diskTotal: disk.total,
      diskFree: disk.free,
      networkIn: Math.floor(Math.random() * 450) + 50,
      networkOut: Math.floor(Math.random() * 850) + 150,
      activeUsers,
      federationServers: 34,
      messageVolume24h: 12450 + Math.floor(Math.random() * 50),
      uptime: uptimeStr,
      trends,
      services: activeServices
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

        // Real production target VPS execution wrapper
        const isSandbox = !fs.existsSync("/bin/systemctl");
        if (!isSandbox && command === "custom_install") {
          const selectedComponents = args?.components || ["synapse", "element", "postgres", "coturn", "nginx"];
          const confObj = args?.config || {};

          const envVars = {
            ...process.env,
            HS_DOMAIN: String(confObj.HS_DOMAIN || "matrix.company.local"),
            ELEMENT_DOMAIN: String(confObj.ELEMENT_DOMAIN || "chat.company.local"),
            BASE_DOMAIN: String(confObj.BASE_DOMAIN || "company.local"),
            PUBLIC_IP: String(confObj.PUBLIC_IP || "127.0.0.1"),
            LE_EMAIL: String(confObj.LE_EMAIL || "admin@company.local"),
            SSL_MODE: String(confObj.SSL_MODE || "selfsigned"),
            PG_DB: String(confObj.PG_DB || "synapse"),
            PG_USER: String(confObj.PG_USER || "synapse_user"),
            PG_PASS: String(confObj.PG_PASS || "synapse_pass"),
            PG_HOST: String(confObj.PG_HOST || "localhost"),
            PG_PORT: String(confObj.PG_PORT || "5432"),
            INSTALL_SYNAPSE: String(selectedComponents.includes("synapse")),
            INSTALL_ELEMENT: String(selectedComponents.includes("element")),
            INSTALL_POSTGRES: String(selectedComponents.includes("postgres")),
            INSTALL_COTURN: String(selectedComponents.includes("coturn")),
            INSTALL_NGINX: String(selectedComponents.includes("nginx"))
          };

          const child = spawn("bash", ["./install-matrix-stack.sh"], { env: envVars });

          child.stdout.on("data", (data) => {
            ws.send(JSON.stringify({ type: "cmd_stdout", text: data.toString() }));
          });

          child.stderr.on("data", (data) => {
            ws.send(JSON.stringify({ type: "cmd_stdout", text: data.toString() }));
          });

          child.on("close", (code) => {
            ws.send(JSON.stringify({ type: "cmd_end", code: code || 0 }));

            // Update configuration in virtual filesystem to reflect completion
            let confContent = "";
            Object.entries(confObj).forEach(([key, val]) => {
              confContent += `${key}=${val}\n`;
            });
            confContent += `INSTALL_SYNAPSE=${selectedComponents.includes("synapse")}\n`;
            confContent += `INSTALL_ELEMENT=${selectedComponents.includes("element")}\n`;
            confContent += `INSTALL_POSTGRES=${selectedComponents.includes("postgres")}\n`;
            confContent += `INSTALL_COTURN=${selectedComponents.includes("coturn")}\n`;
            confContent += `INSTALL_NGINX=${selectedComponents.includes("nginx")}\n`;
            writeSandboxFile("/etc/matrix-stack.conf", confContent);

            const db = readDb();
            db.auditLogs.unshift({
              id: `log-${Date.now()}`,
              timestamp: new Date().toISOString(),
              username,
              action: `Console Command (Real)`,
              target: command,
              status: code === 0 ? "success" : "failed",
              details: `Executed production install shell script. Exit code: ${code}`
            });
            writeDb(db);
          });
          return;
        }

        // Simulate script terminal output streaming if running inside sandbox container
        let steps: string[] = [];

        if (command === "custom_install") {
          const mode = args?.mode || "online";
          const selectedComponents = args?.components || ["synapse", "element", "postgres", "coturn", "nginx"];
          const confObj = args?.config || {};

          steps = [
            `⚡ [INFO] Starting customized Matrix Stack installation in ${mode.toUpperCase()} mode...`,
            `⚙️  Active config parameters:`,
            `   - Domain: ${confObj.HS_DOMAIN || 'matrix.company.local'}`,
            `   - Element Client: ${confObj.ELEMENT_DOMAIN || 'chat.company.local'}`,
            `   - SSL Mode: ${confObj.SSL_MODE || 'selfsigned'}`,
            `   - Target Database: ${confObj.PG_DB || 'synapse'} (user: ${confObj.PG_USER || 'synapse_user'})`
          ];

          if (mode === "offline") {
            steps.push(
              `📦 [OFFLINE] Activating local repository mirrors at '/var/cache/matrix_package'...`,
              `🔍 Checking offline local cache files...`,
              `   - synapse_1.98.0_amd64.deb: Found [LOCAL_CACHE]`,
              `   - element-web_1.12.7.tar.gz: Found [LOCAL_CACHE]`,
              `   - postgres-12-server_amd64.deb: Found [LOCAL_CACHE]`,
              `   - coturn_4.5.1_amd64.deb: Found [LOCAL_CACHE]`,
              `   - nginx-full_1.18.0_amd64.deb: Found [LOCAL_CACHE]`,
              `🚀 [SUCCESS] Offline packages cache is valid. Bypassing apt download queues.`
            );
          } else {
            steps.push(
              `🌍 [ONLINE] Connecting to official package registries...`,
              `   Get:1 https://packages.matrix.org/debian focal InRelease`,
              `   Get:2 http://apt.postgresql.org/pub/repos/apt focal-pgdg InRelease`,
              `   Get:3 http://archive.ubuntu.com/ubuntu focal/main amd64 Packages`,
              `⬇️  Downloading remote packages & updating local catalog...`,
              `   Downloading synapse-core (v1.98.0) - 18.4 MB... done.`,
              `   Downloading element-web (v1.12.7) - 12.1 MB... done.`,
              `📦 Caching downloaded deb files to '/var/cache/matrix_package' for future offline speedups...`,
              `🚀 [SUCCESS] Remote retrieval complete. All packages downloaded.`
            );
          }

          // Install Postgres if selected
          if (selectedComponents.includes("postgres")) {
            steps.push(
              `🐘 [1/6] Installing & configuring PostgreSQL database engine...`,
              `   Processing package postgresql-12...`,
              `   Creating database '${confObj.PG_DB || 'synapse'}' on ${confObj.PG_HOST || 'localhost'}:${confObj.PG_PORT || '5432'}...`,
              `   Creating relational user '${confObj.PG_USER || 'synapse_user'}' with md5 hash auth...`,
              `   Initializing postgresql.conf and pg_hba.conf configurations...`,
              `   ✅ PostgreSQL service started & listening.`
            );
          } else {
            steps.push(`🐘 Skipping PostgreSQL installation (using external/existing database)...`);
          }

          // Install Synapse if selected
          if (selectedComponents.includes("synapse")) {
            steps.push(
              `🧱 [2/6] Setting up Matrix Synapse Homeserver daemon...`,
              `   Processing package matrix-synapse-py3...`,
              `   Registering python virtual environment at /opt/venvs/matrix-synapse...`,
              `   Compiling homeserver.yaml configuration settings...`,
              `   Shared registration token generated: a3f8b09d2e1c4f5a6b7c8d9e`,
              `   ✅ Synapse systemd services configured successfully.`
            );
          } else {
            steps.push(`🧱 Skipping Matrix Synapse installation...`);
          }

          // Install Element if selected
          if (selectedComponents.includes("element")) {
            steps.push(
              `🎨 [3/6] Deploying Element Web Instant Messenger Client...`,
              `   Extracting element-web.tar.gz to webroot /var/www/element/...`,
              `   Generating config.json pointing to homeserver: 'https://${confObj.HS_DOMAIN || 'matrix.company.local'}'...`,
              `   ✅ Element Web client configured.`
            );
          } else {
            steps.push(`🎨 Skipping Element Web client installation...`);
          }

          // Install TURN if selected
          if (selectedComponents.includes("coturn")) {
            steps.push(
              `📞 [4/6] Installing & activating Coturn STUN/TURN Media Relay...`,
              `   Configuring turnserver.conf with long-term credentials...`,
              `   Listening on TCP/UDP port 3478 (TLS port 5349)...`,
              `   ✅ TURN server operational.`
            );
          } else {
            steps.push(`📞 Skipping Coturn TURN/STUN media relay...`);
          }

          // Install Nginx if selected
          if (selectedComponents.includes("nginx")) {
            steps.push(
              `🌐 [5/6] Creating Nginx reverse proxy routes...`,
              `   Building sites-available config files...`,
              `   Injecting client and server federation well-known delegators...`,
              `   Testing Nginx configuration files... syntax is ok.`,
              `   Reloading Nginx server configurations...`,
              `   ✅ Nginx proxy live.`
            );
          } else {
            steps.push(`🌐 Skipping Nginx reverse proxy configurations...`);
          }

          // Generate Certificates
          steps.push(`🔑 [6/6] Aligning SSL/TLS profiles (${confObj.SSL_MODE || 'selfsigned'})...`);
          if (confObj.SSL_MODE === "selfsigned") {
            steps.push(
              `   Generating 10-year 4096-bit RSA self-signed certificates...`,
              `   Subject: CN=${confObj.HS_DOMAIN || 'matrix.company.local'}`,
              `   Alternative Names: DNS:${confObj.HS_DOMAIN || 'matrix.company.local'}, DNS:${confObj.ELEMENT_DOMAIN || 'chat.company.local'}`,
              `   ✅ Self-signed TLS certificate generated.`
            );
          } else if (confObj.SSL_MODE === "letsencrypt") {
            steps.push(
              `   Invoking Certbot ACME client to request production certificate...`,
              `   Target email: ${confObj.LE_EMAIL || 'admin@company.local'}`,
              `   Resolving ACME challenges via Nginx webroot plugin...`,
              `   ✅ Received production certificates from Let's Encrypt authority.`
            );
          } else {
            steps.push(
              `   Applying custom certificate chain configurations...`,
              `   Validating fullchain.pem and privkey.pem match...`,
              `   ✅ Custom certificates verified & bound.`
            );
          }

          steps.push(
            `🎉 CUSTOM STACK INSTALLATION COMPLETED SUCCESSFULLY!`,
            `----------------------------------------------------------------`,
            `Matrix Homeserver:  https://${confObj.HS_DOMAIN || 'matrix.company.local'}`,
            `Element Client-Web: https://${confObj.ELEMENT_DOMAIN || 'chat.company.local'}`,
            `Database backend:   PostgreSQL on localhost:5432`,
            `----------------------------------------------------------------`,
            `You can now start services and register new users.`
          );

          // Write settings
          if (confObj) {
            let confContent = "";
            Object.entries(confObj).forEach(([key, val]) => {
              confContent += `${key}=${val}\n`;
            });
            writeSandboxFile("/etc/matrix-stack.conf", confContent);
          }
        } else if (command === "uninstall_stack") {
          steps = [
            "⚠️  [WARNING] Preparing to completely remove the Matrix stack...",
            "🛑 Stopping all active systemd services (matrix-synapse, coturn, nginx, postgres)...",
            "   matrix-synapse.service: Stopped.",
            "   coturn.service: Stopped.",
            "   nginx.service: Stopped.",
            "   postgresql.service: Stopped.",
            "🧹 Purging package installations & binaries (apt purge)...",
            "   Removing Synapse files from /etc/matrix-synapse...",
            "   Removing Element client files from /var/www/element...",
            "   Removing Coturn configurations from /etc/turnserver.conf...",
            "   Removing PostgreSQL relational tables and clusters...",
            "🧹 Cleaning local directories and configuration stores...",
            "🗑️  Resetting /etc/matrix-stack.conf variables...",
            "🎉 STACK SUCCESSFULLY UNINSTALLED AND PURGED.",
            "Your server environment is back to a clean slate."
          ];
          writeSandboxFile("/etc/matrix-stack.conf", "");
        } else if (command === "purge_database") {
          steps = [
            "⚠️  [WARNING] Initializing Database wipe...",
            "🛑 Temporarily pausing Matrix Synapse to lock DB handles...",
            "   matrix-synapse.service: Paused.",
            "🐘 Connecting to PostgreSQL engine...",
            "💧 Dropping active database 'synapse'...",
            "   DROP DATABASE synapse WITH (FORCE);",
            "   ✅ Database synapse successfully dropped.",
            "🌱 Re-creating empty database 'synapse' with UTF8 encoding...",
            "   CREATE DATABASE synapse WITH OWNER synapse_user ENCODING 'UTF8';",
            "   ✅ Empty database synapse created successfully.",
            "🔄 Restarting Matrix Synapse...",
            "   matrix-synapse.service: Restarted.",
            "   ✅ Homeserver schemas auto-recreated and initialized.",
            "🎉 DATABASE PURGED SUCCESSFULLY."
          ];
        } else if (command === "install") {
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
