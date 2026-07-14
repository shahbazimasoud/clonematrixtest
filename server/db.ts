/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import fs from "fs";
import path from "path";
import { Client } from "pg";
import { Client as SSHClient } from "ssh2";

export const SANDBOX_DIR = path.join(process.cwd(), "sandbox");

export interface ConnectionProfile {
  id: string;
  name: string;
  host: string;
  port: number;
  username: string;
  password?: string;
  privateKey?: string;
  authType: 'password' | 'key' | 'agent'; // Added 'agent' for Agent-based architecture
  
  // Agent-based fields
  status?: 'online' | 'offline' | 'pending';
  token?: string;
  apiKey?: string;
  lastSeen?: string;
  domain?: string;
  systemInfo?: any;
  services?: any[];
  description?: string;

  // Database configuration
  dbHost?: string;
  dbPort?: number;
  dbName?: string;
  dbUser?: string;
  dbPass?: string;
  
  // Config paths
  configPath?: string;
  homeserverYamlPath?: string;
  elementConfigPath?: string;
  homeserverLogPath?: string;
  
  isActive: boolean;
}

export function getRealPath(targetPath: string): string {
  const relative = targetPath.startsWith("/") ? targetPath.slice(1) : targetPath;
  return path.join(SANDBOX_DIR, relative);
}

export function ensureDirExists(filePath: string) {
  const dir = path.dirname(filePath);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
}

export function writeSandboxFile(filePath: string, content: string) {
  const realPath = getRealPath(filePath);
  ensureDirExists(realPath);
  fs.writeFileSync(realPath, content, "utf8");
}

export function readSandboxFile(filePath: string, defaultContent: string = ""): string {
  const realPath = getRealPath(filePath);
  if (!fs.existsSync(realPath)) {
    writeSandboxFile(filePath, defaultContent);
    return defaultContent;
  }
  return fs.readFileSync(realPath, "utf8");
}

export function initializeSandbox() {
  if (!fs.existsSync(SANDBOX_DIR)) {
    fs.mkdirSync(SANDBOX_DIR, { recursive: true });
  }

  // matrix-stack.conf
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

  // homeserver.yaml
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

  // Element Web config.json
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

  // pgAdmin Servers configuration
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

  // Nginx Sites Config
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

  // Seed DB panel_data.json
  readSandboxFile("/db/panel_data.json", JSON.stringify({
    users: [
      {
        id: "usr-1",
        username: "admin",
        email: "admin@company.local",
        passwordHash: "$2b$10$oX6HHsc3BDS.vH9aE/vzOek0uXuYFV22mSTl9OMk0QroZlkGqRIae",
        role: "Owner",
        isActive: true,
        avatar: "https://api.dicebear.com/7.x/bottts/svg?seed=admin"
      },
      {
        id: "usr-2",
        username: "masoud",
        email: "masoud.shahbazii@gmail.com",
        passwordHash: "$2b$10$QPE6t1v41RcL0A9LA5pGsu56Ti2he3s.k8AJWI8vOeJy.Or9iafBS",
        role: "Super Admin",
        isActive: true,
        avatar: "https://api.dicebear.com/7.x/bottts/svg?seed=masoud"
      },
      {
        id: "usr-3",
        username: "moderator",
        email: "mod@company.local",
        passwordHash: "$2b$10$TBrHPNVEOqZnBxTknN0MeO.6/DX864MJ8.2iFyuIV5M4Uw07Hackm",
        role: "Moderator",
        isActive: true,
        avatar: "https://api.dicebear.com/7.x/bottts/svg?seed=moderator"
      },
      {
        id: "usr-4",
        username: "viewer",
        email: "viewer@company.local",
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

  // Logs seeding
  readSandboxFile("/var/log/matrix_stack_install.log", [
    "[2026-07-12 10:00:00] Starting Matrix Synapse Installer v3.0...",
    "[2026-07-12 10:00:05] [STEP 1/17] Updating repositories & installing prerequisites (apt)... success.",
    "[2026-07-12 10:01:25] [STEP 6/17] Setting up PostgreSQL database... success.",
    "[2026-07-12 10:02:35] INSTALLATION COMPLETE. Matrix Synapse & Element Web fully operational."
  ].join("\n"));

  readSandboxFile("/var/log/matrix-synapse/homeserver.log", [
    "2026-07-12 22:30:15,312 - synapse.app.homeserver - INFO - Synapse version 1.98.0 starting...",
    "2026-07-12 22:30:17,450 - synapse.app.homeserver - INFO - Database schema is up to date."
  ].join("\n"));
}

export function readDb(): any {
  let content = "{}";
  try {
    content = readSandboxFile("/db/panel_data.json", "{}");
    if (!content || !content.trim()) {
      content = "{}";
    }
  } catch (err) {
    console.error("Failed to read panel_data.json, using default seed template:", err);
    content = "{}";
  }

  let data: any;
  try {
    data = JSON.parse(content);
  } catch (err) {
    console.error("Failed to parse panel_data.json JSON, resetting to empty state:", err);
    data = {};
  }
  
  let updated = false;

  if (!data.users || !Array.isArray(data.users)) {
    data.users = [
      {
        id: "usr-1",
        username: "admin",
        email: "admin@company.local",
        passwordHash: "$2b$10$oX6HHsc3BDS.vH9aE/vzOek0uXuYFV22mSTl9OMk0QroZlkGqRIae",
        role: "Owner",
        isActive: true,
        avatar: "https://api.dicebear.com/7.x/bottts/svg?seed=admin"
      },
      {
        id: "usr-2",
        username: "masoud",
        email: "masoud.shahbazii@gmail.com",
        passwordHash: "$2b$10$QPE6t1v41RcL0A9LA5pGsu56Ti2he3s.k8AJWI8vOeJy.Or9iafBS",
        role: "Super Admin",
        isActive: true,
        avatar: "https://api.dicebear.com/7.x/bottts/svg?seed=masoud"
      },
      {
        id: "usr-3",
        username: "moderator",
        email: "mod@company.local",
        passwordHash: "$2b$10$TBrHPNVEOqZnBxTknN0MeO.6/DX864MJ8.2iFyuIV5M4Uw07Hackm",
        role: "Moderator",
        isActive: true,
        avatar: "https://api.dicebear.com/7.x/bottts/svg?seed=moderator"
      },
      {
        id: "usr-4",
        username: "viewer",
        email: "viewer@company.local",
        passwordHash: "$2b$10$kK4vi/4n6y0I3SLkVphmeuMbd3o7sY0TgSS8apm8SDXeI7U62Xwly",
        role: "Viewer",
        isActive: true,
        avatar: "https://api.dicebear.com/7.x/bottts/svg?seed=viewer"
      }
    ];
    updated = true;
  }

  if (!data.matrixUsers || !Array.isArray(data.matrixUsers)) {
    data.matrixUsers = [
      { mxid: "@masoud:matrix.company.local", isAdmin: true, isDeactivated: false },
      { mxid: "@alice:matrix.company.local", isAdmin: false, isDeactivated: false },
      { mxid: "@bob:matrix.company.local", isAdmin: false, isDeactivated: false },
      { mxid: "@welcome:matrix.company.local", isAdmin: false, isDeactivated: true }
    ];
    updated = true;
  }

  if (!data.matrixRooms || !Array.isArray(data.matrixRooms)) {
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
      }
    ];
    updated = true;
  }
  
  if (!data.matrixMedia || !Array.isArray(data.matrixMedia)) {
    data.matrixMedia = [
      { id: "mxc://matrix.company.local/img9988ff", fileName: "corporate_logo.png", fileSize: 1542000, mimeType: "image/png", uploadedBy: "@masoud:matrix.company.local", uploadedAt: "2026-07-12T12:10:00.000Z", isCached: false }
    ];
    updated = true;
  }
  
  if (!data.registrationTokens || !Array.isArray(data.registrationTokens)) {
    data.registrationTokens = [
      { token: "ORG-STAFF-PROMO-2026", usesAllowed: 50, usesCount: 12, expiryTime: "2026-12-31T23:59:59.000Z", isActive: true }
    ];
    updated = true;
  }

  if (!data.connections || !Array.isArray(data.connections)) {
    data.connections = [
      {
        id: "local",
        name: "Local Server (This Machine)",
        host: "localhost",
        port: 22,
        username: "",
        authType: "key",
        isActive: true
      }
    ];
    updated = true;
  }

  if (!data.auditLogs || !Array.isArray(data.auditLogs)) {
    data.auditLogs = [
      { id: "log-1", timestamp: new Date(Date.now() - 3600000 * 2).toISOString(), username: "system", action: "Server Booted", target: "Server", status: "success", details: "Matrix Stack Manager Web Panel initiated successfully." },
      { id: "log-2", timestamp: new Date(Date.now() - 3600000).toISOString(), username: "admin", action: "Configure LDAP", target: "LDAP Auth", status: "success", details: "Tested LDAP connection and saved changes." }
    ];
    updated = true;
  }

  if (!data.backups || !Array.isArray(data.backups)) {
    data.backups = [
      { id: "bak-1", filename: "matrix-backup-20260710-120000.tar.gz", size: "142.8 MB", timestamp: "2026-07-10T12:00:00.000Z", hasSSL: true },
      { id: "bak-2", filename: "matrix-backup-20260711-120000.tar.gz", size: "143.2 MB", timestamp: "2026-07-11T12:00:00.000Z", hasSSL: true }
    ];
    updated = true;
  }

  if (!data.undoHistory || !Array.isArray(data.undoHistory)) {
    data.undoHistory = [
      { id: "undo-1", timestamp: new Date(Date.now() - 3600000).toISOString(), description: "Update LDAP Settings", files: ["/etc/matrix-stack-ldap.conf", "/etc/matrix-synapse/homeserver.yaml"] }
    ];
    updated = true;
  }

  if (!data.ldapConfig || typeof data.ldapConfig !== "object") {
    data.ldapConfig = {
      enabled: false,
      uri: "ldap://ldap.company.local:389",
      base: "ou=users,dc=company,dc=local",
      mode: "search",
      start_tls: false,
      bind_dn: "cn=svc-matrix,dc=company,dc=local",
      uid_attr: "sAMAccountName",
      mail_attr: "mail",
      name_attr: "cn"
    };
    updated = true;
  }

  if (!data.workersConfig || typeof data.workersConfig !== "object") {
    data.workersConfig = {
      enabled: false,
      count: 2,
      federationSender: false,
      basePort: 8083
    };
    updated = true;
  }

  if (updated) {
    try {
      writeSandboxFile("/db/panel_data.json", JSON.stringify(data, null, 2));
    } catch (err) {
      console.error("Failed to persist updated db schema state:", err);
    }
  }

  return data;
}

export function writeDb(data: any) {
  writeSandboxFile("/db/panel_data.json", JSON.stringify(data, null, 2));
}

export function getActiveConnection(): ConnectionProfile {
  try {
    const db = readDb();
    if (!db.connections) {
      return {
        id: "local",
        name: "Local Server (This Machine)",
        host: "localhost",
        port: 22,
        username: "",
        authType: "key",
        isActive: true
      };
    }
    return db.connections.find((c: any) => c.isActive) || db.connections[0];
  } catch (e) {
    return {
      id: "local",
      name: "Local Server (This Machine)",
      host: "localhost",
      port: 22,
      username: "",
      authType: "key",
      isActive: true
    };
  }
}

export function executeSSHCommand(config: ConnectionProfile, cmd: string): Promise<string> {
  return new Promise((resolve, reject) => {
    const conn = new SSHClient();
    conn.on("ready", () => {
      conn.exec(cmd, (err, stream) => {
        if (err) {
          conn.end();
          return reject(err);
        }
        let stdout = "";
        let stderr = "";
        stream.on("close", (code) => {
          conn.end();
          if (code !== 0 && code !== null) {
            reject(new Error(stderr || `Command failed with exit code ${code}`));
          } else {
            resolve(stdout);
          }
        }).on("data", (data: any) => {
          stdout += data.toString();
        }).stderr.on("data", (data: any) => {
          stderr += data.toString();
        });
      });
    }).on("error", (err) => {
      reject(err);
    });

    const connOpts: any = {
      host: config.host,
      port: config.port || 22,
      username: config.username,
      readyTimeout: 10000
    };
    if (config.authType === "password") {
      connOpts.password = config.password;
    } else {
      connOpts.privateKey = config.privateKey;
    }
    conn.connect(connOpts);
  });
}

export function interpolateQueryParams(queryStr: string, params: any[]): string {
  if (!params || params.length === 0) return queryStr;
  
  let interpolated = queryStr;
  params.forEach((param, i) => {
    const placeholder = `$${i + 1}`;
    let formattedParam = "";
    if (typeof param === "string") {
      formattedParam = `'${param.replace(/'/g, "''")}'`;
    } else if (param === null || param === undefined) {
      formattedParam = "NULL";
    } else if (param instanceof Date) {
      formattedParam = `'${param.toISOString()}'`;
    } else {
      formattedParam = String(param);
    }
    interpolated = interpolated.split(placeholder).join(formattedParam);
  });
  return interpolated;
}

export async function queryRemotePostgres(config: ConnectionProfile, sqlQuery: string, params: any[] = []): Promise<any[]> {
  const interpolatedSql = interpolateQueryParams(sqlQuery, params);
  const wrappedQuery = `SELECT coalesce(json_agg(row_to_json(t)), '[]'::json) FROM (${interpolatedSql.replace(/"/g, '\\"')}) t;`;
  
  const dbUser = config.dbUser || "synapse_user";
  const dbPass = config.dbPass || "";
  const dbName = config.dbName || "synapse";
  const dbHost = config.dbHost || "localhost";
  const dbPort = config.dbPort || 5432;
  
  const cmd = `PGPASSWORD='${dbPass.replace(/'/g, "'\\''")}' psql -h '${dbHost}' -p '${dbPort}' -U '${dbUser}' -d '${dbName}' -t -A -c "${wrappedQuery}"`;
  
  const jsonStr = await executeSSHCommand(config, cmd);
  return JSON.parse(jsonStr.trim() || "[]");
}
