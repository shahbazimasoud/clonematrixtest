/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Request, Response } from "express";
import { readDb, writeDb, ConnectionProfile } from "./db";

// Global job queue for remote agent-based command execution
export interface AgentJob {
  id: string;
  nodeId: string;
  action: string;
  params?: any;
  status: 'pending' | 'running' | 'success' | 'failed';
  result?: any;
  error?: string;
  timestamp: string;
}

export const agentJobs: Map<string, AgentJob> = new Map();

/**
 * Serves the bash agent installer script
 */
export function serveInstallerScript(req: Request, res: Response) {
  const host = req.get('host') || 'localhost:3000';
  const protocol = req.protocol || 'http';
  const serverUrl = `${protocol}://${host}`;

  const script = `#!/bin/bash
# ==============================================================================
# Matrix Stack Manager - Native Linux Remote Node Agent Installer
# ==============================================================================
set -e

# Defaults
TOKEN=""
SERVER_URL="${serverUrl}"

# Parse Arguments
while [[ $# -gt 0 ]]; do
  case $1 in
    --token)
      TOKEN="$2"
      shift 2
      ;;
    --server-url)
      SERVER_URL="$2"
      shift 2
      ;;
    *)
      echo "Unknown argument: $1"
      exit 1
      ;;
  esac
done

if [ -z "$TOKEN" ]; then
  echo "❌ Error: --token is required"
  echo "Usage: curl -fsSL $SERVER_URL/install-agent.sh | sudo bash -s -- --token <ONETIME_TOKEN>"
  exit 1
fi

echo "=========================================================="
echo "🚀 Installing Matrix Stack Manager Agent..."
echo "=========================================================="
echo "🔗 Central Panel URL: $SERVER_URL"
echo "🎟️  One-time Token:   $TOKEN"
echo "=========================================================="

# Check for Python 3
if ! command -v python3 &> /dev/null; then
  echo "📦 Installing python3..."
  apt-get update -y && apt-get install -y python3 python3-pip
fi

# Create directory structure
mkdir -p /etc/matrix-agent
mkdir -p /var/log/matrix-agent

echo "📡 Registering agent with Central Panel..."
# Perform registration check in python to avoid curl dependency issues on some minimal setups
REGISTRATION_JSON=$(python3 -c "
import urllib.request, json, platform
try:
    data = json.dumps({
        'token': '$TOKEN',
        'host': '$(hostname -I | awk \"{print \$1}\")',
        'systemInfo': {
            'os': platform.system(),
            'release': platform.release(),
            'machine': platform.machine(),
            'node': platform.node()
        }
    }).encode('utf-8')
    req = urllib.request.Request('$SERVER_URL/api/agent/register', data=data, headers={'Content-Type': 'application/json'})
    with urllib.request.urlopen(req, timeout=10) as response:
        res = response.read().decode('utf-8')
        print(res)
except Exception as e:
    print(json.dumps({'error': str(e)}))
")

ERROR_MSG=$(echo "$REGISTRATION_JSON" | python3 -c "import sys, json; data=json.load(sys.stdin); print(data.get('error', ''))")
if [ ! -z "$ERROR_MSG" ]; then
  echo "❌ Handshake registration failed: $ERROR_MSG"
  exit 1
fi

NODE_ID=$(echo "$REGISTRATION_JSON" | python3 -c "import sys, json; data=json.load(sys.stdin); print(data.get('nodeId', ''))")
API_KEY=$(echo "$REGISTRATION_JSON" | python3 -c "import sys, json; data=json.load(sys.stdin); print(data.get('apiKey', ''))")

if [ -z "$NODE_ID" ] || [ -z "$API_KEY" ]; then
  echo "❌ Server response was missing critical keys. Registration failed."
  exit 1
fi

echo "✅ Registration Successful! Node ID assigned: $NODE_ID"

# Save configuration
echo "💾 Writing configuration to /etc/matrix-agent/agent.conf..."
cat << EOF > /etc/matrix-agent/agent.conf
# Matrix Stack Manager Agent Configuration
server_url=$SERVER_URL
node_id=$NODE_ID
api_key=$API_KEY
EOF
chmod 600 /etc/matrix-agent/agent.conf

# Download / Write Python Agent Script
echo "📝 Writing agent script to /usr/local/bin/matrix-agent.py..."
cat << 'EOF' > /usr/local/bin/matrix-agent.py
import os
import sys
import time
import json
import urllib.request
import subprocess
import platform

# Read Configuration
CONFIG_PATH = '/etc/matrix-agent/agent.conf'
if not os.path.exists(CONFIG_PATH):
    print("Error: Configuration file not found at " + CONFIG_PATH)
    sys.exit(1)

config = {}
with open(CONFIG_PATH, 'r') as f:
    for line in f:
        line = line.strip()
        if '=' in line and not line.startswith('#'):
            k, v = line.split('=', 1)
            config[k.strip()] = v.strip()

SERVER_URL = config.get('server_url')
NODE_ID = config.get('node_id')
API_KEY = config.get('api_key')

if not SERVER_URL or not NODE_ID or not API_KEY:
    print("Error: Incomplete configuration.")
    sys.exit(1)

def get_system_telemetry():
    """Gathers OS, cpu, memory, disk info"""
    # Simple CPU
    cpu = 10.0
    try:
        if os.path.exists('/proc/stat'):
            with open('/proc/stat', 'r') as f:
                fields = [float(col) for col in f.readline().strip().split()[1:]]
            idle, total = fields[3], sum(fields)
            time.sleep(0.5)
            with open('/proc/stat', 'r') as f:
                fields2 = [float(col) for col in f.readline().strip().split()[1:]]
            idle2, total2 = fields2[3], sum(fields2)
            diff_idle = idle2 - idle
            diff_total = total2 - total
            if diff_total > 0:
                cpu = round((1.0 - diff_idle / diff_total) * 100.0, 1)
    except Exception:
        pass

    # Simple Memory
    mem_pct, mem_total_gb, mem_free_gb = 50.0, 8.0, 4.0
    try:
        if os.path.exists('/proc/meminfo'):
            meminfo = {}
            with open('/proc/meminfo', 'r') as f:
                for line in f:
                    parts = line.split(':')
                    if len(parts) == 2:
                        meminfo[parts[0].strip()] = int(parts[1].split()[0])
            total_kb = meminfo.get('MemTotal', 8000000)
            free_kb = meminfo.get('MemFree', 4000000) + meminfo.get('Buffers', 0) + meminfo.get('Cached', 0)
            mem_pct = round(((total_kb - free_kb) / total_kb) * 100.0, 1)
            mem_total_gb = round(total_kb / 1024.0 / 1024.0, 1)
            mem_free_gb = round(free_kb / 1024.0 / 1024.0, 1)
    except Exception:
        pass

    # Simple Disk
    disk_pct, disk_total_gb, disk_free_gb = 30.0, 100.0, 70.0
    try:
        usage = os.statvfs('/')
        total_b = usage.f_blocks * usage.f_frsize
        free_b = usage.f_bavail * usage.f_frsize
        used_b = total_b - free_b
        disk_pct = round((used_b / total_b) * 100.0, 1)
        disk_total_gb = round(total_b / (1024.0**3), 1)
        disk_free_gb = round(free_b / (1024.0**3), 1)
    except Exception:
        pass

    # Uptime
    uptime_str = "unknown"
    try:
        with open('/proc/uptime', 'r') as f:
            uptime_seconds = float(f.readline().split()[0])
        days = int(uptime_seconds // (24 * 3600))
        uptime_seconds %= (24 * 3600)
        hours = int(uptime_seconds // 3600)
        uptime_seconds %= 3600
        minutes = int(uptime_seconds // 60)
        uptime_str = f"{days}d, {hours}h, {minutes}m"
    except Exception:
        pass

    return {
        'cpu': cpu,
        'memory': mem_pct,
        'memTotal': mem_total_gb,
        'memFree': mem_free_gb,
        'disk': disk_pct,
        'diskTotal': disk_total_gb,
        'diskFree': disk_free_gb,
        'uptime': uptime_str,
        'os': platform.system() + " " + platform.release()
    }

def get_services_status():
    """Checks matrix-related systemd services"""
    services = ['matrix-synapse', 'nginx', 'postgresql', 'coturn', 'redis-server', 'fail2ban']
    results = []
    for s in services:
        status = 'inactive'
        try:
            res = subprocess.run(['systemctl', 'is-active', s], capture_output=True, text=True)
            out = res.stdout.strip()
            if out == 'active':
                status = 'active'
            elif out == 'failed':
                status = 'failed'
        except Exception:
            # Fallback if no systemctl
            status = 'active' if s in ['matrix-synapse', 'nginx', 'postgresql'] else 'inactive'
        results.append({'id': s.replace('matrix-', '').replace('-server', ''), 'status': status})
    return results

def execute_local_command(action, params):
    """Executes a command locally on the node"""
    try:
        if action == 'restart_service':
            svc_name = params.get('serviceId')
            # map back to real systemd
            if svc_name == 'synapse': svc_name = 'matrix-synapse'
            elif svc_name == 'element' or svc_name == 'nginx': svc_name = 'nginx'
            elif svc_name == 'postgres': svc_name = 'postgresql'
            elif svc_name == 'redis': svc_name = 'redis-server'
            
            subprocess.run(['sudo', 'systemctl', 'restart', svc_name], check=True)
            return {'success': True, 'output': f"Service {svc_name} restarted successfully."}

        elif action == 'read_file':
            path = params.get('path')
            if not os.path.exists(path):
                return {'success': False, 'error': f"File not found: {path}"}
            with open(path, 'r', encoding='utf-8') as f:
                content = f.read()
            return {'success': True, 'output': content}

        elif action == 'write_file':
            path = params.get('path')
            content = params.get('content', '')
            os.makedirs(os.path.dirname(path), exist_ok=True)
            with open(path, 'w', encoding='utf-8') as f:
                f.write(content)
            return {'success': True, 'output': f"File written successfully to {path}"}

        elif action == 'read_logs':
            path = params.get('path')
            lines_count = int(params.get('lines', 150))
            if not os.path.exists(path):
                return {'success': False, 'error': f"Log file not found: {path}"}
            with open(path, 'r', encoding='utf-8') as f:
                lines = f.readlines()
            last_lines = lines[-lines_count:] if len(lines) > lines_count else lines
            return {'success': True, 'output': ''.join(last_lines)}

        elif action == 'postgres_query':
            sql = params.get('query')
            db_user = params.get('dbUser', 'synapse_user')
            db_name = params.get('dbName', 'synapse')
            # Execute locally via psql command
            cmd = ['psql', '-U', db_user, '-d', db_name, '-t', '-A', '-c', sql]
            res = subprocess.run(cmd, capture_output=True, text=True)
            if res.returncode != 0:
                return {'success': False, 'error': res.stderr}
            return {'success': True, 'output': res.stdout.strip()}

        else:
            return {'success': False, 'error': f"Unknown agent action: {action}"}
    except Exception as ex:
        return {'success': False, 'error': str(ex)}

def report_results(job_id, result):
    try:
        data = json.dumps({
            'nodeId': NODE_ID,
            'jobId': job_id,
            'success': result.get('success', False),
            'output': result.get('output', ''),
            'error': result.get('error', '')
        }).encode('utf-8')
        req = urllib.request.Request(
            SERVER_URL + '/api/agent/results',
            data=data,
            headers={'Content-Type': 'application/json', 'X-Agent-API-Key': API_KEY}
        )
        with urllib.request.urlopen(req, timeout=10) as response:
            response.read()
    except Exception as ex:
        print("Failed to report results: " + str(ex))

# Main loop
print("Matrix Stack Manager Agent running. Connecting to " + SERVER_URL)
while True:
    try:
        telemetry = get_system_telemetry()
        services = get_services_status()
        
        # Ping Server
        data = json.dumps({
            'nodeId': NODE_ID,
            'systemInfo': telemetry,
            'services': services
        }).encode('utf-8')
        
        req = urllib.request.Request(
            SERVER_URL + '/api/agent/ping',
            data=data,
            headers={'Content-Type': 'application/json', 'X-Agent-API-Key': API_KEY}
        )
        
        with urllib.request.urlopen(req, timeout=10) as response:
            res_data = json.loads(response.read().decode('utf-8'))
            
        pending_jobs = res_data.get('pendingJobs', [])
        for job in pending_jobs:
            job_id = job.get('id')
            action = job.get('action')
            params = job.get('params', {})
            
            print(f"Executing pending job {job_id} ({action})...")
            result = execute_local_command(action, params)
            report_results(job_id, result)
            
    except Exception as e:
        print("Agent communication error: " + str(e))
        
    time.sleep(8)
EOF

# Create systemd unit file
echo "⚙️  Setting up systemd service unit..."
cat << EOF > /etc/systemd/system/matrix-agent.service
[Unit]
Description=Matrix Stack Manager Remote Agent
After=network.target

[Service]
Type=simple
User=root
ExecStart=/usr/bin/python3 /usr/local/bin/matrix-agent.py
Restart=always
RestartSec=5
StandardOutput=journal
StandardError=journal

[Install]
WantedBy=multi-user.target
EOF

# Reload and Start Agent
echo "🔄 Reloading systemd and starting service..."
systemctl daemon-reload
systemctl enable matrix-agent
systemctl start matrix-agent

echo "=========================================================="
echo "✅ Matrix Stack Manager Agent started successfully!"
echo "📡 Monitoring and synchronization active."
echo "=========================================================="
`;

  res.setHeader("Content-Type", "application/x-sh");
  res.send(script);
}

/**
 * Endpoint called by installer script to register a new agent
 */
export function registerAgent(req: Request, res: Response) {
  const { token, host, systemInfo } = req.body;
  
  if (!token) {
    return res.status(400).json({ error: "One-time registration token is required" });
  }

  const db = readDb();
  if (!db.connections) db.connections = [];

  // Find the pending node with matching token
  const nodeIndex = db.connections.findIndex((c: any) => c.token === token && c.status === 'pending');
  if (nodeIndex === -1) {
    return res.status(404).json({ error: "Invalid, expired, or already-used registration token." });
  }

  const node = db.connections[nodeIndex];
  
  // Generate credentials
  const apiKey = `api-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  
  node.status = 'online';
  node.host = host || "localhost";
  node.apiKey = apiKey;
  node.lastSeen = new Date().toISOString();
  node.systemInfo = {
    ...systemInfo,
    agentVersion: "1.0.0 (Native Linux)"
  };
  node.services = [
    { id: 'synapse', status: 'active' },
    { id: 'nginx', status: 'active' },
    { id: 'postgresql', status: 'active' },
    { id: 'coturn', status: 'active' }
  ];

  writeDb(db);

  // Add audit log
  db.auditLogs.unshift({
    id: `log-${Date.now()}`,
    timestamp: new Date().toISOString(),
    username: "System",
    action: "Register Node",
    target: node.name,
    status: "success",
    details: `Agent handshake successful. Registered remote Matrix Node '${node.name}' (${node.domain}) successfully.`
  });
  writeDb(db);

  res.json({
    success: true,
    nodeId: node.id,
    apiKey
  });
}

/**
 * Heartbeat check-in endpoint for registered agents
 */
export function pingAgent(req: Request, res: Response) {
  const apiKey = req.header("X-Agent-API-Key") || req.body.apiKey;
  const { nodeId, systemInfo, services } = req.body;

  if (!apiKey || !nodeId) {
    return res.status(401).json({ error: "Unauthorized check-in. Missing apiKey or nodeId." });
  }

  const db = readDb();
  const node = db.connections?.find((c: any) => c.id === nodeId && c.apiKey === apiKey);
  
  if (!node) {
    return res.status(401).json({ error: "Invalid credentials." });
  }

  // Update check-in timestamps and telemetry
  node.lastSeen = new Date().toISOString();
  node.status = 'online';
  if (systemInfo) node.systemInfo = systemInfo;
  if (services) node.services = services;

  writeDb(db);

  // Filter pending jobs for this specific node
  const pendingJobs = Array.from(agentJobs.values())
    .filter(job => job.nodeId === nodeId && job.status === 'pending')
    .map(job => {
      job.status = 'running';
      return {
        id: job.id,
        action: job.action,
        params: job.params
      };
    });

  res.json({
    success: true,
    pendingJobs
  });
}

/**
 * Endpoint called by agent to report task results
 */
export function receiveResults(req: Request, res: Response) {
  const apiKey = req.header("X-Agent-API-Key");
  const { nodeId, jobId, success, output, error } = req.body;

  if (!apiKey || !nodeId || !jobId) {
    return res.status(400).json({ error: "Missing required callback parameters." });
  }

  const db = readDb();
  const node = db.connections?.find((c: any) => c.id === nodeId && c.apiKey === apiKey);
  if (!node) {
    return res.status(401).json({ error: "Invalid credentials." });
  }

  const job = agentJobs.get(jobId);
  if (job) {
    job.status = success ? 'success' : 'failed';
    job.result = output;
    job.error = error;
    agentJobs.set(jobId, job);
  }

  res.json({ success: true });
}

/**
 * Triggers a task on a remote agent-based node and waits for results asynchronously
 */
export async function executeRemoteAgentTask(nodeId: string, action: string, params: any = {}): Promise<string> {
  const jobId = `job-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  const job: AgentJob = {
    id: jobId,
    nodeId,
    action,
    params,
    status: 'pending',
    timestamp: new Date().toISOString()
  };

  agentJobs.set(jobId, job);

  // Wait for agent to execute and return the results (Polling pattern with 10s timeout)
  const timeout = 12000; // 12 seconds
  const start = Date.now();

  while (Date.now() - start < timeout) {
    const currentJob = agentJobs.get(jobId);
    if (currentJob) {
      if (currentJob.status === 'success') {
        return currentJob.result;
      } else if (currentJob.status === 'failed') {
        throw new Error(currentJob.error || "Remote execution failed on managed node agent.");
      }
    }
    await new Promise(resolve => setTimeout(resolve, 300));
  }

  throw new Error("Handshake timeout waiting for remote Node Agent response.");
}
