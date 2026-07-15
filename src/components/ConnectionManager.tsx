/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { 
  Globe, 
  Server, 
  Plus, 
  Trash2, 
  RefreshCw, 
  CheckCircle2, 
  AlertCircle, 
  Database, 
  Terminal, 
  Key, 
  Settings, 
  Activity,
  ArrowRight,
  Sparkles,
  Lock,
  Edit
} from 'lucide-react';

export interface ConnectionProfile {
  id: string;
  name: string;
  host: string;
  port: number;
  username: string;
  password?: string;
  privateKey?: string;
  authType: 'password' | 'key';
  
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

  // Admin credentials
  adminUsername?: string;
  adminPassword?: string;
  adminAccessToken?: string;
  
  isActive: boolean;
}

interface ConnectionManagerProps {
  authToken: string;
  onProfileChanged: () => void;
  showToast: (type: 'success' | 'error', text: string) => void;
  isLightMode?: boolean;
}

export default function ConnectionManager({ authToken, onProfileChanged, showToast, isLightMode = false }: ConnectionManagerProps) {
  const [profiles, setProfiles] = useState<ConnectionProfile[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [testingId, setTestingId] = useState<string | null>(null);
  const [testResults, setTestResults] = useState<Record<string, { success: boolean; ssh: boolean; db: boolean; error?: string }>>({});

  // Form State
  const [name, setName] = useState('');
  const [host, setHost] = useState('');
  const [port, setPort] = useState(22);
  const [username, setUsername] = useState('root');
  const [authType, setAuthType] = useState<'password' | 'key'>('password');
  const [password, setPassword] = useState('');
  const [privateKey, setPrivateKey] = useState('');
  
  // Advanced DB Paths Form State
  const [dbHost, setDbHost] = useState('localhost');
  const [dbPort, setDbPort] = useState(5432);
  const [dbName, setDbName] = useState('synapse');
  const [dbUser, setDbUser] = useState('synapse_user');
  const [dbPass, setDbPass] = useState('');

  // Paths
  const [configPath, setConfigPath] = useState('/etc/matrix-stack.conf');
  const [homeserverYamlPath, setHomeserverYamlPath] = useState('/etc/matrix-synapse/homeserver.yaml');
  const [elementConfigPath, setElementConfigPath] = useState('/var/www/element/config.json');
  const [homeserverLogPath, setHomeserverLogPath] = useState('/var/log/matrix-synapse/homeserver.log');

  const [showAdvanced, setShowAdvanced] = useState(false);
  const [showAdminSettings, setShowAdminSettings] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  // Admin Credentials Form State
  const [adminUsername, setAdminUsername] = useState('');
  const [adminPassword, setAdminPassword] = useState('');
  const [adminAccessToken, setAdminAccessToken] = useState('');

  const fetchProfiles = () => {
    if (!authToken || authToken === 'null' || authToken === 'undefined') return;
    setIsLoading(true);
    fetch('/api/connections', {
      headers: { 'Authorization': `Bearer ${authToken}` }
    })
    .then(res => {
      if (!res.ok) throw new Error("Failed to fetch connection profiles");
      return res.json();
    })
    .then(data => {
      setProfiles(data);
      setIsLoading(false);
    })
    .catch(err => {
      showToast('error', err.message);
      setIsLoading(false);
    });
  };

  useEffect(() => {
    if (authToken && authToken !== 'null' && authToken !== 'undefined') {
      fetchProfiles();
    }
  }, [authToken]);

  const handleCreateProfile = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !host || !username) {
      showToast('error', 'Please fill in all required fields.');
      return;
    }

    const payload = {
      name,
      host,
      port,
      username,
      authType,
      password: authType === 'password' ? password : '',
      privateKey: authType === 'key' ? privateKey : '',
      dbHost,
      dbPort,
      dbName,
      dbUser,
      dbPass,
      configPath,
      homeserverYamlPath,
      elementConfigPath,
      homeserverLogPath,
      adminUsername,
      adminPassword,
      adminAccessToken
    };

    const url = editingId ? `/api/connections/${editingId}` : '/api/connections';
    const method = editingId ? 'PUT' : 'POST';

    fetch(url, {
      method: method,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${authToken}`
      },
      body: JSON.stringify(payload)
    })
    .then(res => {
      if (!res.ok) throw new Error(editingId ? "Failed to update connection profile" : "Failed to create connection profile");
      return res.json();
    })
    .then(() => {
      showToast('success', editingId ? 'Remote Connection Profile updated successfully!' : 'Remote Connection Profile created successfully!');
      setShowForm(false);
      resetForm();
      fetchProfiles();
      onProfileChanged();
    })
    .catch(err => {
      showToast('error', err.message);
    });
  };

  const handleEditProfile = (profile: ConnectionProfile, e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingId(profile.id);
    setName(profile.name || '');
    setHost(profile.host || '');
    setPort(profile.port || 22);
    setUsername(profile.username || 'root');
    setAuthType(profile.authType || 'password');
    setPassword(profile.password || '');
    setPrivateKey(profile.privateKey || '');
    setDbHost(profile.dbHost || 'localhost');
    setDbPort(profile.dbPort || 5432);
    setDbName(profile.dbName || 'synapse');
    setDbUser(profile.dbUser || 'synapse_user');
    setDbPass(profile.dbPass || '');
    setConfigPath(profile.configPath || '/etc/matrix-stack.conf');
    setHomeserverYamlPath(profile.homeserverYamlPath || '/etc/matrix-synapse/homeserver.yaml');
    setElementConfigPath(profile.elementConfigPath || '/var/www/element/config.json');
    setHomeserverLogPath(profile.homeserverLogPath || '/var/log/matrix-synapse/homeserver.log');
    setAdminUsername(profile.adminUsername || '');
    setAdminPassword(profile.adminPassword || '');
    setAdminAccessToken(profile.adminAccessToken || '');
    setShowForm(true);
  };

  const handleSelectProfile = (id: string) => {
    fetch('/api/connections/select', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${authToken}`
      },
      body: JSON.stringify({ id })
    })
    .then(res => {
      if (!res.ok) throw new Error("Failed to activate connection profile");
      return res.json();
    })
    .then(() => {
      showToast('success', `Active connection switched successfully! Reloading panel data...`);
      fetchProfiles();
      onProfileChanged();
    })
    .catch(err => {
      showToast('error', err.message);
    });
  };

  const handleDeleteProfile = (id: string, e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent selection
    if (id === 'local') {
      showToast('error', 'Cannot delete the local system profile.');
      return;
    }

    if (!window.confirm('Are you sure you want to delete this connection profile?')) return;

    fetch(`/api/connections/${id}`, {
      method: 'DELETE',
      headers: { 'Authorization': `Bearer ${authToken}` }
    })
    .then(res => {
      if (!res.ok) throw new Error("Failed to delete connection profile");
      return res.json();
    })
    .then(() => {
      showToast('success', 'Profile deleted successfully.');
      fetchProfiles();
    })
    .catch(err => {
      showToast('error', err.message);
    });
  };

  const handleTestProfile = (profile: ConnectionProfile, e: React.MouseEvent) => {
    e.stopPropagation();
    setTestingId(profile.id);
    setTestResults(prev => ({ ...prev, [profile.id]: undefined as any }));

    fetch('/api/connections/test', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${authToken}`
      },
      body: JSON.stringify(profile)
    })
    .then(res => {
      if (!res.ok) throw new Error("Connection test failed");
      return res.json();
    })
    .then(data => {
      setTestResults(prev => ({
        ...prev,
        [profile.id]: {
          success: data.ssh && data.db,
          ssh: data.ssh,
          db: data.db,
          error: data.dbError
        }
      }));
      setTestingId(null);
      if (data.ssh && data.db) {
        showToast('success', `SSH and Database connection to ${profile.name} are fully healthy!`);
      } else if (data.ssh) {
        showToast('error', `SSH is active, but Database connection failed: ${data.dbError}`);
      } else {
        showToast('error', `Failed to connect over SSH to ${profile.name}`);
      }
    })
    .catch(err => {
      setTestResults(prev => ({
        ...prev,
        [profile.id]: {
          success: false,
          ssh: false,
          db: false,
          error: err.message
        }
      }));
      setTestingId(null);
      showToast('error', `Connection handshake failed: ${err.message}`);
    });
  };

  const resetForm = () => {
    setName('');
    setHost('');
    setPort(22);
    setUsername('root');
    setAuthType('password');
    setPassword('');
    setPrivateKey('');
    setDbHost('localhost');
    setDbPort(5432);
    setDbName('synapse');
    setDbUser('synapse_user');
    setDbPass('');
    setConfigPath('/etc/matrix-stack.conf');
    setHomeserverYamlPath('/etc/matrix-synapse/homeserver.yaml');
    setElementConfigPath('/var/www/element/config.json');
    setHomeserverLogPath('/var/log/matrix-synapse/homeserver.log');
    setAdminUsername('');
    setAdminPassword('');
    setAdminAccessToken('');
    setShowAdminSettings(false);
    setEditingId(null);
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="spatial-glass rounded-3xl p-6 border border-white/5 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-teal-500/10 text-teal-400 border border-teal-500/10">
              <Globe className="w-6 h-6 animate-pulse" />
            </div>
            <div>
              <h1 className="text-2xl font-display font-bold text-white tracking-tight">Server Connections</h1>
              <p className="text-xs text-slate-400 mt-1">
                Manage and switch between local and remote server environments securely over SSH.
              </p>
            </div>
          </div>
        </div>

        <button
          onClick={() => setShowForm(!showForm)}
          className="flex items-center gap-2 px-5 py-3 rounded-2xl bg-teal-500 hover:bg-teal-600 text-white font-bold text-sm transition-all duration-300 self-start md:self-auto hover:shadow-[0_0_20px_rgba(20,184,166,0.3)] hover:scale-[1.02]"
        >
          <Plus className="w-4 h-4" />
          {showForm ? 'View Profiles' : 'Add Remote Server'}
        </button>
      </div>

      {showForm ? (
        /* Create Connection Form */
        <form onSubmit={handleCreateProfile} className="spatial-glass rounded-3xl p-6 border border-white/5 space-y-6 max-w-3xl mx-auto">
          <div className="border-b border-white/5 pb-4">
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <Plus className="w-5 h-5 text-teal-400" />
              Configure Remote Server connection
            </h3>
            <p className="text-xs text-slate-400 mt-1">
              Provide target VPS details. The system uses secure SSH channels to pull stats and execute queries.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-2">Profile Name *</label>
              <input
                type="text"
                placeholder="e.g. Tehran Matrix Cluster"
                value={name}
                onChange={e => setName(e.target.value)}
                required
                className="w-full bg-white border border-slate-300 rounded-xl px-4 py-3 text-sm text-slate-900 focus:outline-none focus:border-teal-500 transition-colors placeholder-slate-400"
              />
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div className="col-span-2">
                <label className="block text-xs font-semibold text-slate-300 mb-2">Host / IP *</label>
                <input
                  type="text"
                  placeholder="e.g. 192.168.1.50"
                  value={host}
                  onChange={e => setHost(e.target.value)}
                  required
                  className="w-full bg-white border border-slate-300 rounded-xl px-4 py-3 text-sm text-slate-900 focus:outline-none focus:border-teal-500 transition-colors placeholder-slate-400"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-2">Port</label>
                <input
                  type="number"
                  placeholder="22"
                  value={port}
                  onChange={e => setPort(parseInt(e.target.value) || 22)}
                  required
                  className="w-full bg-white border border-slate-300 rounded-xl px-4 py-3 text-sm text-slate-900 focus:outline-none focus:border-teal-500 transition-colors placeholder-slate-400"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-2">SSH Username *</label>
              <input
                type="text"
                placeholder="root"
                value={username}
                onChange={e => setUsername(e.target.value)}
                required
                className="w-full bg-white border border-slate-300 rounded-xl px-4 py-3 text-sm text-slate-900 focus:outline-none focus:border-teal-500 transition-colors placeholder-slate-400"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-2">Authentication Type</label>
              <div className="grid grid-cols-2 gap-2 mt-1">
                <button
                  type="button"
                  onClick={() => setAuthType('password')}
                  className={`py-2 px-3 rounded-lg border text-xs font-bold transition-all ${
                    authType === 'password'
                      ? 'bg-teal-500/10 border-teal-500 text-teal-400'
                      : 'bg-white/5 border-white/5 text-slate-400 hover:bg-white/10'
                  }`}
                >
                  Password
                </button>
                <button
                  type="button"
                  onClick={() => setAuthType('key')}
                  className={`py-2 px-3 rounded-lg border text-xs font-bold transition-all ${
                    authType === 'key'
                      ? 'bg-teal-500/10 border-teal-500 text-teal-400'
                      : 'bg-white/5 border-white/5 text-slate-400 hover:bg-white/10'
                  }`}
                >
                  SSH Private Key
                </button>
              </div>
            </div>

            {authType === 'password' ? (
              <div className="md:col-span-2">
                <label className="block text-xs font-semibold text-slate-300 mb-2">SSH Password</label>
                <div className="relative">
                  <input
                    type="password"
                    placeholder="••••••••••••"
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    className="w-full bg-white border border-slate-300 rounded-xl pl-10 pr-4 py-3 text-sm text-slate-900 focus:outline-none focus:border-teal-500 transition-colors placeholder-slate-400"
                  />
                  <Key className="w-4 h-4 text-slate-500 absolute left-3.5 top-3.5" />
                </div>
              </div>
            ) : (
              <div className="md:col-span-2">
                <label className="block text-xs font-semibold text-slate-300 mb-2">SSH Private Key Content</label>
                <textarea
                  placeholder="-----BEGIN OPENSSH PRIVATE KEY-----\n...\n-----END OPENSSH PRIVATE KEY-----"
                  value={privateKey}
                  onChange={e => setPrivateKey(e.target.value)}
                  className="w-full h-32 bg-white border border-slate-300 rounded-xl p-4 text-xs font-mono text-slate-900 focus:outline-none focus:border-teal-500 transition-colors placeholder-slate-400"
                />
              </div>
            )}
          </div>

          {/* Collapsible Advanced Settings (Postgres Connection details & File Paths) */}
          <div className="border-t border-white/5 pt-4">
            <button
              type="button"
              onClick={() => setShowAdvanced(!showAdvanced)}
              className="flex items-center gap-2 text-xs font-bold text-teal-400 hover:text-teal-300 transition-colors"
            >
              <Settings className={`w-4 h-4 transform transition-transform ${showAdvanced ? 'rotate-90' : ''}`} />
              {showAdvanced ? 'Hide Advanced Settings (PostgreSQL & Paths)' : 'Show Advanced Settings (PostgreSQL & Paths)'}
            </button>

            {showAdvanced && (
              <div className="space-y-6 mt-4 p-5 rounded-2xl bg-white/[0.03] border border-white/10 shadow-2xl backdrop-blur-md">
                {/* Remote PostgreSQL Database parameters */}
                <div>
                  <h4 className="text-sm font-bold text-teal-400 flex items-center gap-2 mb-4">
                    <Database className="w-4 h-4 text-teal-400" />
                    Remote PostgreSQL Parameters
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-xs font-medium text-slate-300 mb-1.5">DB Host (Local to Remote VPS)</label>
                      <input
                        type="text"
                        value={dbHost}
                        onChange={e => setDbHost(e.target.value)}
                        className="w-full bg-white border border-slate-300 rounded-xl px-4 py-3 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:border-teal-500 transition-all shadow-inner"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-slate-300 mb-1.5">DB Port</label>
                      <input
                        type="number"
                        value={dbPort}
                        onChange={e => setDbPort(parseInt(e.target.value) || 5432)}
                        className="w-full bg-white border border-slate-300 rounded-xl px-4 py-3 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:border-teal-500 transition-all shadow-inner"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-slate-300 mb-1.5">DB Name</label>
                      <input
                        type="text"
                        value={dbName}
                        onChange={e => setDbName(e.target.value)}
                        className="w-full bg-white border border-slate-300 rounded-xl px-4 py-3 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:border-teal-500 transition-all shadow-inner"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-slate-300 mb-1.5">DB Username</label>
                      <input
                        type="text"
                        value={dbUser}
                        onChange={e => setDbUser(e.target.value)}
                        className="w-full bg-white border border-slate-300 rounded-xl px-4 py-3 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:border-teal-500 transition-all shadow-inner"
                      />
                    </div>
                    <div className="md:col-span-2">
                      <label className="block text-xs font-medium text-slate-300 mb-1.5">DB Password</label>
                      <input
                        type="password"
                        placeholder="••••••••••••"
                        value={dbPass}
                        onChange={e => setDbPass(e.target.value)}
                        className="w-full bg-white border border-slate-300 rounded-xl px-4 py-3 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:border-teal-500 transition-all shadow-inner"
                      />
                    </div>
                  </div>
                </div>

                {/* Custom system files paths */}
                <div className="border-t border-white/10 pt-5">
                  <h4 className="text-sm font-bold text-teal-400 flex items-center gap-2 mb-4">
                    <Terminal className="w-4 h-4 text-teal-400" />
                    Configuration File Paths (On Remote)
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-medium text-slate-300 mb-1.5">Matrix Stack Config Path</label>
                      <input
                        type="text"
                        value={configPath}
                        onChange={e => setConfigPath(e.target.value)}
                        className="w-full bg-white border border-slate-300 rounded-xl px-4 py-3 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:border-teal-500 transition-all shadow-inner"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-slate-300 mb-1.5">Homeserver YAML Path</label>
                      <input
                        type="text"
                        value={homeserverYamlPath}
                        onChange={e => setHomeserverYamlPath(e.target.value)}
                        className="w-full bg-white border border-slate-300 rounded-xl px-4 py-3 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:border-teal-500 transition-all shadow-inner"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-slate-300 mb-1.5">Element Client Config Path</label>
                      <input
                        type="text"
                        value={elementConfigPath}
                        onChange={e => setElementConfigPath(e.target.value)}
                        className="w-full bg-white border border-slate-300 rounded-xl px-4 py-3 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:border-teal-500 transition-all shadow-inner"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-slate-300 mb-1.5">Synapse Log File Path</label>
                      <input
                        type="text"
                        value={homeserverLogPath}
                        onChange={e => setHomeserverLogPath(e.target.value)}
                        className="w-full bg-white border border-slate-300 rounded-xl px-4 py-3 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:border-teal-500 transition-all shadow-inner"
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Collapsible Admin Token Settings */}
          <div className="border-t border-white/5 pt-4">
            <button
              type="button"
              onClick={() => setShowAdminSettings(!showAdminSettings)}
              className="flex items-center gap-2 text-xs font-bold text-teal-400 hover:text-teal-300 transition-colors"
            >
              <Key className={`w-4 h-4 transform transition-transform ${showAdminSettings ? 'rotate-90' : ''}`} />
              {showAdminSettings ? 'Hide Admin Token Settings' : 'Show Admin Token Settings'}
            </button>

            {showAdminSettings && (
              <div className="space-y-6 mt-4 p-5 rounded-2xl bg-white/[0.03] border border-white/10 shadow-2xl backdrop-blur-md">
                <div>
                  <h4 className="text-sm font-bold text-teal-400 flex items-center gap-2 mb-4">
                    <Key className="w-4 h-4 text-teal-400" />
                    Admin Token & Matrix Credentials
                  </h4>
                  <p className="text-xs text-slate-400 mb-4">
                    Enter the admin username and password for Matrix Element Chat or provide an Admin Access Token to use for the Synapse Admin APIs.
                  </p>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-xs font-medium text-slate-300 mb-1.5">Admin Username</label>
                      <input
                        type="text"
                        placeholder="@admin:domain.com"
                        value={adminUsername}
                        onChange={e => setAdminUsername(e.target.value)}
                        className="w-full bg-white border border-slate-300 rounded-xl px-4 py-3 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:border-teal-500 transition-all shadow-inner"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-slate-300 mb-1.5">Admin Password</label>
                      <input
                        type="password"
                        placeholder="••••••••••••"
                        value={adminPassword}
                        onChange={e => setAdminPassword(e.target.value)}
                        className="w-full bg-white border border-slate-300 rounded-xl px-4 py-3 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:border-teal-500 transition-all shadow-inner"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-slate-300 mb-1.5">Admin Access Token (Optional)</label>
                      <input
                        type="password"
                        placeholder="syt_..."
                        value={adminAccessToken}
                        onChange={e => setAdminAccessToken(e.target.value)}
                        className="w-full bg-white border border-slate-300 rounded-xl px-4 py-3 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:border-teal-500 transition-all shadow-inner"
                      />
                    </div>
                  </div>

                  <div className="text-xs text-slate-300 mt-5 leading-relaxed bg-teal-500/10 p-4 rounded-xl border border-teal-500/20 space-y-1.5">
                    <p className="font-semibold text-teal-400 flex items-center gap-1.5">
                      <span>💡</span> Admin Username Format Guide
                    </p>
                    <p className="text-slate-300">
                      You can enter the raw username (e.g., <code className="bg-slate-800 text-teal-300 px-1.5 py-0.5 rounded font-mono text-[11px]">admin</code>) or the full Matrix ID (e.g., <code className="bg-slate-800 text-teal-300 px-1.5 py-0.5 rounded font-mono text-[11px]">@admin:domain.com</code>).
                    </p>
                    <p className="text-slate-400 text-[11px]">
                      The specified user must have administrator rights on the target Synapse home server to enable real-time user management, rooms administration, and custom metrics collection.
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-white/5">
            <button
              type="button"
              onClick={() => { setShowForm(false); resetForm(); }}
              className="px-5 py-3 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 font-bold text-sm transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-3 rounded-xl bg-teal-500 hover:bg-teal-600 text-white font-bold text-sm transition-all shadow-lg hover:shadow-[0_0_20px_rgba(20,184,166,0.3)]"
            >
              Save Profile
            </button>
          </div>
        </form>
      ) : (
        /* Profiles Cards List grid */
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {isLoading ? (
            <div className="col-span-2 text-center py-12">
              <RefreshCw className="w-8 h-8 text-teal-400 animate-spin mx-auto mb-3" />
              <p className="text-sm text-slate-400">Loading Connection Profiles...</p>
            </div>
          ) : profiles.length === 0 ? (
            <div className="col-span-2 text-center py-12 spatial-glass rounded-3xl border border-white/5">
              <Server className="w-12 h-12 text-slate-500 mx-auto mb-4" />
              <h3 className="text-lg font-bold text-white">No Profiles Found</h3>
              <p className="text-xs text-slate-400 max-w-sm mx-auto mt-1">
                You haven't defined any connection profiles. Click the Add Remote Server button to link a remote node.
              </p>
            </div>
          ) : (
            profiles.map(profile => {
              const isActive = profile.isActive;
              const isLocal = profile.id === 'local';
              const testResult = testResults[profile.id];
              const isTesting = testingId === profile.id;

              return (
                <div
                  key={profile.id}
                  onClick={() => handleSelectProfile(profile.id)}
                  className={`spatial-glass rounded-3xl border p-6 transition-all duration-300 relative flex flex-col justify-between cursor-pointer group hover:scale-[1.01] ${
                    isActive
                      ? isLightMode
                        ? 'border-teal-500 bg-teal-50/60 shadow-[0_10px_30px_rgba(20,184,166,0.18)] ring-2 ring-teal-500/20'
                        : 'border-teal-400 bg-teal-950/20 shadow-[0_0_35px_rgba(20,184,166,0.25)] ring-2 ring-teal-400/20'
                      : isLightMode
                        ? 'border-slate-200/80 hover:border-slate-300 bg-white hover:bg-slate-50/50 shadow-sm'
                        : 'border-white/5 hover:border-white/10 bg-white/5'
                  }`}
                >
                  {/* Left Accent Indicator Bar for Active Profile */}
                  {isActive && (
                    <div className="absolute left-0 top-8 bottom-8 w-1.5 bg-gradient-to-b from-teal-400 to-teal-600 rounded-r-lg" />
                  )}

                  {/* Selected / Active Badge */}
                  {isActive && (
                    <div className={`absolute top-4 right-4 rounded-full px-2.5 py-0.5 text-[10px] font-bold flex items-center gap-1.5 shadow-sm border animate-pulse ${
                      isLightMode
                        ? 'bg-teal-600 text-white border-teal-600/20'
                        : 'bg-teal-500/25 text-teal-300 border-teal-500/30'
                    }`}>
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      Active Server
                    </div>
                  )}

                  <div>
                    {/* Header */}
                    <div className="flex items-start gap-4 mb-4">
                      <div className={`p-3 rounded-2xl border transition-colors duration-300 ${
                        isActive 
                          ? 'bg-teal-500/10 text-teal-500 border-teal-500/20' 
                          : isLightMode
                            ? 'bg-slate-100 text-slate-500 border-slate-200'
                            : 'bg-white/5 text-slate-400 border-white/5'
                      }`}>
                        {isLocal ? <Server className="w-6 h-6" /> : <Globe className="w-6 h-6" />}
                      </div>
                      <div>
                        <h3 className={`text-lg font-bold transition-colors duration-300 flex items-center gap-2 ${
                          isActive
                            ? isLightMode ? 'text-teal-700' : 'text-teal-400'
                            : isLightMode ? 'text-slate-800 group-hover:text-teal-600' : 'text-white group-hover:text-teal-400'
                        }`}>
                          {profile.name}
                        </h3>
                        <p className={`text-xs font-mono mt-1 ${isLightMode ? 'text-slate-500' : 'text-slate-400'}`}>
                          {isLocal ? 'local-loopback' : `${profile.username}@${profile.host}:${profile.port}`}
                        </p>
                      </div>
                    </div>

                    {/* Status Meta */}
                    <div className={`space-y-2.5 border-t pt-4 transition-colors duration-300 ${isLightMode ? 'border-slate-100' : 'border-white/5'}`}>
                      <div className="flex items-center justify-between text-xs">
                        <span className={isLightMode ? 'text-slate-500' : 'text-slate-400'}>Connection Type:</span>
                        <span className={`font-semibold uppercase ${isLightMode ? 'text-slate-700' : 'text-slate-300'}`}>{isLocal ? 'Internal Sandbox' : 'Remote SSH'}</span>
                      </div>
                      
                      {!isLocal && (
                        <>
                          <div className="flex items-center justify-between text-xs">
                            <span className={isLightMode ? 'text-slate-500' : 'text-slate-400'}>Auth Method:</span>
                            <span className={`font-mono flex items-center gap-1 ${isLightMode ? 'text-slate-700' : 'text-slate-300'}`}>
                              <Lock className="w-3 h-3 text-slate-400" />
                              {profile.authType === 'key' ? 'SSH Private Key' : 'Password Credentials'}
                            </span>
                          </div>
                          <div className="flex items-center justify-between text-xs">
                            <span className={isLightMode ? 'text-slate-500' : 'text-slate-400'}>Synapse Postgres:</span>
                            <span className={`font-mono ${isLightMode ? 'text-slate-700' : 'text-slate-300'}`}>{profile.dbUser}@{profile.dbHost}:{profile.dbPort}</span>
                          </div>
                        </>
                      )}
                    </div>
                  </div>

                  {/* Footer Actions */}
                  <div className={`mt-6 pt-4 border-t flex items-center justify-between gap-2 transition-colors duration-300 ${isLightMode ? 'border-slate-100' : 'border-white/5'}`}>
                    <div className="flex gap-2">
                      {!isLocal && (
                        <button
                          type="button"
                          onClick={(e) => handleTestProfile(profile, e)}
                          disabled={isTesting}
                          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-bold transition-all ${
                            isLightMode
                              ? 'bg-slate-100 hover:bg-slate-200/80 border-slate-200 text-slate-700'
                              : 'bg-white/5 border-white/5 hover:bg-white/10 hover:border-white/10 text-slate-300'
                          }`}
                        >
                          <RefreshCw className={`w-3.5 h-3.5 ${isTesting ? 'animate-spin text-teal-400' : ''}`} />
                          {isTesting ? 'Testing...' : 'Test Sync'}
                        </button>
                      )}

                       {!isLocal && (
                        <button
                          type="button"
                          onClick={(e) => handleEditProfile(profile, e)}
                          className={`p-1.5 rounded-lg transition-colors ${
                            isLightMode
                              ? 'hover:bg-slate-100 text-slate-500 hover:text-teal-600'
                              : 'hover:bg-teal-500/10 text-slate-400 hover:text-teal-400'
                          }`}
                          title="Edit Connection"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                      )}

                      {!isLocal && (
                        <button
                          type="button"
                          onClick={(e) => handleDeleteProfile(profile.id, e)}
                          className={`p-1.5 rounded-lg transition-colors ${
                            isLightMode
                              ? 'hover:bg-red-50 text-slate-500 hover:text-red-600 hover:bg-red-500/10'
                              : 'hover:bg-red-500/10 text-slate-400 hover:text-red-400'
                          }`}
                          title="Delete Connection"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>

                    {/* Test feedback */}
                    {testResult && (
                      <div className="flex flex-col items-end text-[10px]">
                        <div className="flex items-center gap-1 font-bold">
                          {testResult.ssh ? (
                            <span className={`${isLightMode ? 'text-emerald-600' : 'text-emerald-400'} flex items-center gap-0.5`}><CheckCircle2 className="w-3 h-3" /> SSH</span>
                          ) : (
                            <span className={`${isLightMode ? 'text-rose-600' : 'text-rose-400'} flex items-center gap-0.5`}><AlertCircle className="w-3 h-3" /> SSH</span>
                          )}
                          <span className={isLightMode ? 'text-slate-300' : 'text-slate-500'}>|</span>
                          {testResult.db ? (
                            <span className={`${isLightMode ? 'text-emerald-600' : 'text-emerald-400'} flex items-center gap-0.5`}><CheckCircle2 className="w-3 h-3" /> Postgres</span>
                          ) : (
                            <span className={`${isLightMode ? 'text-rose-600' : 'text-rose-400'} flex items-center gap-0.5`}><AlertCircle className="w-3 h-3" /> Postgres</span>
                          )}
                        </div>
                      </div>
                    )}

                    {isActive && (
                      <span className={`text-[11px] font-bold flex items-center gap-1.5 ${isLightMode ? 'text-teal-600' : 'text-teal-400'}`}>
                        Connected
                        <span className={`w-2 h-2 rounded-full animate-ping ${isLightMode ? 'bg-teal-600' : 'bg-teal-400'}`} />
                      </span>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>
      )}
    </div>
  );
}
