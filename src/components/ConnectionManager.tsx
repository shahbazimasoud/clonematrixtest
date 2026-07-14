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
  Lock
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
  
  isActive: boolean;
}

interface ConnectionManagerProps {
  authToken: string;
  onProfileChanged: () => void;
  showToast: (type: 'success' | 'error', text: string) => void;
}

export default function ConnectionManager({ authToken, onProfileChanged, showToast }: ConnectionManagerProps) {
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
      homeserverLogPath
    };

    fetch('/api/connections', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${authToken}`
      },
      body: JSON.stringify(payload)
    })
    .then(res => {
      if (!res.ok) throw new Error("Failed to create connection profile");
      return res.json();
    })
    .then(() => {
      showToast('success', 'Remote Connection Profile created successfully!');
      setShowForm(false);
      resetForm();
      fetchProfiles();
    })
    .catch(err => {
      showToast('error', err.message);
    });
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
                className="w-full bg-slate-900/60 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-teal-500 transition-colors"
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
                  className="w-full bg-slate-900/60 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-teal-500 transition-colors"
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
                  className="w-full bg-slate-900/60 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-teal-500 transition-colors"
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
                className="w-full bg-slate-900/60 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-teal-500 transition-colors"
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
                    className="w-full bg-slate-900/60 border border-white/10 rounded-xl pl-10 pr-4 py-3 text-sm text-white focus:outline-none focus:border-teal-500 transition-colors"
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
                  className="w-full h-32 bg-slate-900/60 border border-white/10 rounded-xl p-4 text-xs font-mono text-emerald-400 focus:outline-none focus:border-teal-500 transition-colors"
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
              <div className="space-y-6 mt-4 p-4 rounded-2xl bg-white/5 border border-white/5">
                {/* Remote PostgreSQL Database parameters */}
                <div>
                  <h4 className="text-sm font-bold text-white flex items-center gap-2 mb-3">
                    <Database className="w-4 h-4 text-indigo-400" />
                    Remote PostgreSQL Parameters
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-[11px] text-slate-400 mb-1.5">DB Host (Local to Remote VPS)</label>
                      <input
                        type="text"
                        value={dbHost}
                        onChange={e => setDbHost(e.target.value)}
                        className="w-full bg-slate-900 border border-white/5 rounded-lg px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-teal-500"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] text-slate-400 mb-1.5">DB Port</label>
                      <input
                        type="number"
                        value={dbPort}
                        onChange={e => setDbPort(parseInt(e.target.value) || 5432)}
                        className="w-full bg-slate-900 border border-white/5 rounded-lg px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-teal-500"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] text-slate-400 mb-1.5">DB Name</label>
                      <input
                        type="text"
                        value={dbName}
                        onChange={e => setDbName(e.target.value)}
                        className="w-full bg-slate-900 border border-white/5 rounded-lg px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-teal-500"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] text-slate-400 mb-1.5">DB Username</label>
                      <input
                        type="text"
                        value={dbUser}
                        onChange={e => setDbUser(e.target.value)}
                        className="w-full bg-slate-900 border border-white/5 rounded-lg px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-teal-500"
                      />
                    </div>
                    <div className="md:col-span-2">
                      <label className="block text-[11px] text-slate-400 mb-1.5">DB Password</label>
                      <input
                        type="password"
                        placeholder="••••••••••••"
                        value={dbPass}
                        onChange={e => setDbPass(e.target.value)}
                        className="w-full bg-slate-900 border border-white/5 rounded-lg px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-teal-500"
                      />
                    </div>
                  </div>
                </div>

                {/* Custom system files paths */}
                <div className="border-t border-white/5 pt-4">
                  <h4 className="text-sm font-bold text-white flex items-center gap-2 mb-3">
                    <Terminal className="w-4 h-4 text-emerald-400" />
                    Configuration File Paths (On Remote)
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[11px] text-slate-400 mb-1.5">Matrix Stack Config Path</label>
                      <input
                        type="text"
                        value={configPath}
                        onChange={e => setConfigPath(e.target.value)}
                        className="w-full bg-slate-900 border border-white/5 rounded-lg px-3 py-2 text-xs text-slate-200 focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] text-slate-400 mb-1.5">Homeserver YAML Path</label>
                      <input
                        type="text"
                        value={homeserverYamlPath}
                        onChange={e => setHomeserverYamlPath(e.target.value)}
                        className="w-full bg-slate-900 border border-white/5 rounded-lg px-3 py-2 text-xs text-slate-200 focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] text-slate-400 mb-1.5">Element Client Config Path</label>
                      <input
                        type="text"
                        value={elementConfigPath}
                        onChange={e => setElementConfigPath(e.target.value)}
                        className="w-full bg-slate-900 border border-white/5 rounded-lg px-3 py-2 text-xs text-slate-200 focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] text-slate-400 mb-1.5">Synapse Log File Path</label>
                      <input
                        type="text"
                        value={homeserverLogPath}
                        onChange={e => setHomeserverLogPath(e.target.value)}
                        className="w-full bg-slate-900 border border-white/5 rounded-lg px-3 py-2 text-xs text-slate-200 focus:outline-none"
                      />
                    </div>
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
                  className={`spatial-glass rounded-3xl border p-6 transition-all relative flex flex-col justify-between cursor-pointer group hover:scale-[1.01] ${
                    isActive
                      ? 'border-teal-500 bg-teal-500/5 shadow-[0_0_30px_rgba(20,184,166,0.15)]'
                      : 'border-white/5 hover:border-white/10 bg-white/5'
                  }`}
                >
                  {/* Selected / Active Badge */}
                  {isActive && (
                    <div className="absolute top-4 right-4 bg-teal-500/10 text-teal-400 border border-teal-500/20 rounded-full px-2.5 py-0.5 text-[10px] font-bold flex items-center gap-1.5 animate-pulse">
                      <Sparkles className="w-3 h-3" />
                      Active Context
                    </div>
                  )}

                  <div>
                    {/* Header */}
                    <div className="flex items-start gap-4 mb-4">
                      <div className={`p-3 rounded-2xl border ${
                        isActive 
                          ? 'bg-teal-500/10 text-teal-400 border-teal-500/20' 
                          : 'bg-white/5 text-slate-400 border-white/5'
                      }`}>
                        {isLocal ? <Server className="w-6 h-6" /> : <Globe className="w-6 h-6" />}
                      </div>
                      <div>
                        <h3 className="text-lg font-bold text-white group-hover:text-teal-400 transition-colors">
                          {profile.name}
                        </h3>
                        <p className="text-xs font-mono text-slate-400 mt-1">
                          {isLocal ? 'local-loopback' : `${profile.username}@${profile.host}:${profile.port}`}
                        </p>
                      </div>
                    </div>

                    {/* Status Meta */}
                    <div className="space-y-2.5 border-t border-white/5 pt-4">
                      <div className="flex items-center justify-between text-xs text-slate-400">
                        <span>Connection Type:</span>
                        <span className="font-semibold text-slate-300 uppercase">{isLocal ? 'Internal Sandbox' : 'Remote SSH'}</span>
                      </div>
                      
                      {!isLocal && (
                        <>
                          <div className="flex items-center justify-between text-xs text-slate-400">
                            <span>Auth Method:</span>
                            <span className="text-slate-300 font-mono flex items-center gap-1">
                              <Lock className="w-3 h-3 text-slate-500" />
                              {profile.authType === 'key' ? 'SSH Private Key' : 'Password Credentials'}
                            </span>
                          </div>
                          <div className="flex items-center justify-between text-xs text-slate-400">
                            <span>Synapse Postgres:</span>
                            <span className="text-slate-300 font-mono">{profile.dbUser}@{profile.dbHost}:{profile.dbPort}</span>
                          </div>
                        </>
                      )}
                    </div>
                  </div>

                  {/* Footer Actions */}
                  <div className="mt-6 pt-4 border-t border-white/5 flex items-center justify-between gap-2">
                    <div className="flex gap-2">
                      {!isLocal && (
                        <button
                          onClick={(e) => handleTestProfile(profile, e)}
                          disabled={isTesting}
                          className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-white/5 border border-white/5 hover:bg-white/10 hover:border-white/10 text-xs font-bold text-slate-300 transition-colors"
                        >
                          <RefreshCw className={`w-3.5 h-3.5 ${isTesting ? 'animate-spin text-teal-400' : ''}`} />
                          {isTesting ? 'Testing...' : 'Test Sync'}
                        </button>
                      )}

                      {!isLocal && (
                        <button
                          onClick={(e) => handleDeleteProfile(profile.id, e)}
                          className="p-1.5 rounded-lg hover:bg-red-500/10 text-slate-400 hover:text-red-400 transition-colors"
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
                            <span className="text-emerald-400 flex items-center gap-0.5"><CheckCircle2 className="w-3 h-3" /> SSH</span>
                          ) : (
                            <span className="text-red-400 flex items-center gap-0.5"><AlertCircle className="w-3 h-3" /> SSH</span>
                          )}
                          <span className="text-slate-500">|</span>
                          {testResult.db ? (
                            <span className="text-emerald-400 flex items-center gap-0.5"><CheckCircle2 className="w-3 h-3" /> Postgres</span>
                          ) : (
                            <span className="text-red-400 flex items-center gap-0.5"><AlertCircle className="w-3 h-3" /> Postgres</span>
                          )}
                        </div>
                      </div>
                    )}

                    {isActive && (
                      <span className="text-[11px] font-bold text-teal-400 flex items-center gap-1.5">
                        Connected
                        <span className="w-2 h-2 rounded-full bg-teal-400 animate-ping" />
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
