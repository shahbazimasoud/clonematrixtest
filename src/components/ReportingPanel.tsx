/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { 
  BarChart3, 
  ShieldCheck, 
  Trash2, 
  Download, 
  History, 
  Plus, 
  Cpu, 
  Users, 
  UserX, 
  ShieldAlert,
  FolderSync,
  Settings,
  UploadCloud,
  Calendar,
  RotateCcw,
  FileJson,
  FolderOpen,
  AlertTriangle,
  CheckSquare,
  Square,
  Save,
  RefreshCw,
  Play
} from 'lucide-react';
import { 
  LineChart, 
  Line, 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer 
} from 'recharts';
import { SystemStats, PanelUser, AuditLog, BackupItem, UndoItem } from '../types';

interface ReportingPanelProps {
  stats: SystemStats | null;
  panelUsers: PanelUser[];
  auditLogs: AuditLog[];
  backups: BackupItem[];
  undoHistory: UndoItem[];
  onCreatePanelUser: (username: string, email: string, pass: string, role: string) => void;
  onChangeUserRole: (id: string, role: string) => void;
  onDeletePanelUser: (id: string) => void;
  onDeleteBackup: (id: string) => void;
  onCreateBackup: (includeSSL: boolean) => void;
  userRole: string;
  authToken: string;
  showToast: (type: 'success' | 'error' | 'info', message: string) => void;
  isLightMode?: boolean;
}

export default function ReportingPanel({
  stats,
  panelUsers,
  auditLogs,
  backups,
  undoHistory,
  onCreatePanelUser,
  onChangeUserRole,
  onDeletePanelUser,
  onDeleteBackup,
  onCreateBackup,
  userRole,
  authToken,
  showToast,
  isLightMode = false
}: ReportingPanelProps) {
  const [activeSubTab, setActiveTab] = useState<'analytics' | 'rbac' | 'audit' | 'backups'>('analytics');

  // New Panel User inputs
  const [newUsername, setNewUsername] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [newPass, setNewPass] = useState('');
  const [newRole, setNewPassRole] = useState('Viewer');
  const [includeSSL, setIncludeSSL] = useState(false);

  // Advanced Backups States
  const [backupSettings, setBackupSettings] = useState<{
    backupPath: string;
    retentionDays: number;
    dbSchedule: { enabled: boolean, cron: string };
    configSchedule: { enabled: boolean, cron: string };
  }>({
    backupPath: '/sandbox/backups',
    retentionDays: 30,
    dbSchedule: { enabled: false, cron: '0 2 * * *' },
    configSchedule: { enabled: false, cron: '0 3 * * *' }
  });

  const [selectedBackupIds, setSelectedBackupIds] = useState<string[]>([]);
  const [isTriggeringBackup, setIsTriggeringBackup] = useState<boolean>(false);
  const [showRestoreModal, setShowRestoreModal] = useState<BackupItem | null>(null);
  const [isRestoring, setIsRestoring] = useState(false);
  const [activeBackupSubTab, setActiveBackupSubTab] = useState<'list' | 'settings'>('list');

  const fetchBackupSettings = async () => {
    try {
      const res = await fetch('/api/backups/settings', {
        headers: { 'Authorization': `Bearer ${authToken}` }
      });
      if (res.ok) {
        const data = await res.json();
        setBackupSettings(data);
      }
    } catch (err) {
      console.error('Error fetching backup settings', err);
    }
  };

  useEffect(() => {
    if (activeSubTab === 'backups') {
      fetchBackupSettings();
    }
  }, [activeSubTab]);

  const saveBackupSettings = async () => {
    try {
      const res = await fetch('/api/backups/settings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authToken}`
        },
        body: JSON.stringify(backupSettings)
      });
      if (res.ok) {
        showToast('success', 'Backup settings saved successfully');
        fetchBackupSettings();
      } else {
        showToast('error', 'Error saving backup settings');
      }
    } catch (err) {
      showToast('error', 'Server connection error');
    }
  };

  const triggerAdvancedBackup = async (type: 'config' | 'database') => {
    setIsTriggeringBackup(true);
    try {
      const res = await fetch('/api/backups/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authToken}`
        },
        body: JSON.stringify({ type, includeSSL })
      });
      if (res.ok) {
        showToast('success', `${type === 'config' ? 'Configuration' : 'Database'} backup created successfully`);
        onCreateBackup(includeSSL); // Trigger refresh in parent
      } else {
        showToast('error', 'Error creating backup');
      }
    } catch (err) {
      showToast('error', 'Server connection error');
    } finally {
      setIsTriggeringBackup(false);
    }
  };

  const downloadSingleBackup = (backup: BackupItem) => {
    fetch(`/api/backups/download/${backup.id}`, {
      headers: { 'Authorization': `Bearer ${authToken}` }
    })
    .then(res => {
      if (!res.ok) throw new Error();
      return res.blob();
    })
    .then(blob => {
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = backup.filename;
      document.body.appendChild(a);
      a.click();
      a.remove();
      showToast('success', 'Backup file downloaded successfully');
    })
    .catch(() => showToast('error', 'Error downloading backup file'));
  };

  const downloadBulkBackups = () => {
    if (selectedBackupIds.length === 0) return;
    fetch(`/api/backups/download-bulk`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${authToken}`
      },
      body: JSON.stringify({ ids: selectedBackupIds })
    })
    .then(res => {
      if (!res.ok) throw new Error();
      return res.blob();
    })
    .then(blob => {
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'matrix-bulk-backups.json';
      document.body.appendChild(a);
      a.click();
      a.remove();
      showToast('success', 'Bulk backups downloaded successfully');
    })
    .catch(() => showToast('error', 'Error downloading bulk backups'));
  };

  const restoreBackup = async (backup: BackupItem) => {
    setIsRestoring(true);
    try {
      const res = await fetch(`/api/backups/restore/${backup.id}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authToken}`
        }
      });
      if (res.ok) {
        showToast('success', `Backup ${backup.filename} restored successfully. System recovered.`);
        setShowRestoreModal(null);
      } else {
        const err = await res.json();
        showToast('error', `Error restoring backup: ${err.error || 'Unknown error'}`);
      }
    } catch (err) {
      showToast('error', 'Connection error during backup restoration');
    } finally {
      setIsRestoring(false);
    }
  };

  const handleUploadBackupFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (event) => {
      const content = event.target?.result as string;
      try {
        const res = await fetch('/api/backups/upload', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${authToken}`
          },
          body: JSON.stringify({
            filename: file.name,
            content: content,
            type: file.name.includes('database') || file.name.includes('db-backup') ? 'database' : 'config'
          })
        });
        if (res.ok) {
          showToast('success', 'Backup file uploaded and saved successfully');
          onCreateBackup(false); // Reload backups list from parent
        } else {
          showToast('error', 'Error uploading backup file');
        }
      } catch (err) {
        showToast('error', 'Error uploading backup file');
      }
    };
    reader.readAsText(file);
  };

  const handleToggleSelectBackup = (id: string) => {
    setSelectedBackupIds(prev => 
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
    );
  };

  const handleToggleSelectAll = () => {
    if (selectedBackupIds.length === backups.length) {
      setSelectedBackupIds([]);
    } else {
      setSelectedBackupIds(backups.map(b => b.id));
    }
  };

  const isOwner = userRole === 'Owner';
  const isSuperAdmin = userRole === 'Super Admin';
  const isReadOnly = userRole === 'Viewer';

  const handleCreateUserSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newUsername.trim() || !newEmail.trim() || !newPass.trim()) return;
    onCreatePanelUser(newUsername.trim(), newEmail.trim(), newPass, newRole);
    setNewUsername('');
    setNewEmail('');
    setNewPass('');
    setNewPassRole('Viewer');
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 h-[calc(100vh-180px)] overflow-hidden">
      {/* Side selection */}
      <div className="spatial-glass rounded-3xl p-5 border border-white/5 flex flex-col gap-2 h-full overflow-y-auto">
        <h3 className="text-sm font-display font-semibold text-slate-400 mb-3 px-3 uppercase tracking-wider">Reports & Admin</h3>

        <button
          onClick={() => setActiveTab('analytics')}
          className={`flex items-center gap-3 px-4 py-3 rounded-2xl text-sm font-semibold transition-all text-left ${
            activeSubTab === 'analytics' 
              ? 'bg-white/10 text-white border border-white/10 shadow-[0_0_12px_rgba(99,102,241,0.15)]' 
              : 'text-gray-400 hover:text-white hover:bg-white/5'
          }`}
        >
          <BarChart3 className="w-5 h-5 text-indigo-400" />
          <span>Real-time Analytics</span>
        </button>

        <button
          onClick={() => setActiveTab('rbac')}
          className={`flex items-center gap-3 px-4 py-3 rounded-2xl text-sm font-semibold transition-all text-left ${
            activeSubTab === 'rbac' 
              ? 'bg-white/10 text-white border border-white/10 shadow-[0_0_12px_rgba(168,85,247,0.15)]' 
              : 'text-gray-400 hover:text-white hover:bg-white/5'
          }`}
        >
          <ShieldCheck className="w-5 h-5 text-purple-400" />
          <span>Role Management</span>
        </button>

        <button
          onClick={() => setActiveTab('backups')}
          className={`flex items-center gap-3 px-4 py-3 rounded-2xl text-sm font-semibold transition-all text-left ${
            activeSubTab === 'backups' 
              ? 'bg-white/10 text-white border border-white/10 shadow-[0_0_12px_rgba(245,158,11,0.15)]' 
              : 'text-gray-400 hover:text-white hover:bg-white/5'
          }`}
        >
          <History className="w-5 h-5 text-amber-400" />
          <span>Backups & Snapshots</span>
        </button>

        <button
          onClick={() => setActiveTab('audit')}
          className={`flex items-center gap-3 px-4 py-3 rounded-2xl text-sm font-semibold transition-all text-left ${
            activeSubTab === 'audit' 
              ? 'bg-white/10 text-white border border-white/10 shadow-[0_0_12px_rgba(16,185,129,0.15)]' 
              : 'text-gray-400 hover:text-white hover:bg-white/5'
          }`}
        >
          <History className="w-5 h-5 text-emerald-400" />
          <span>Security Audit Logs</span>
        </button>
      </div>

      {/* Main Tab View */}
      <div className="lg:col-span-3 spatial-glass rounded-3xl p-6 border border-white/5 flex flex-col h-full overflow-y-auto">
        
        {/* VIEW 1: PERFORMANCE ANALYTICS */}
        {activeSubTab === 'analytics' && (
          <div className="space-y-6">
            <div className="flex items-center gap-3 pb-4 border-b border-white/5">
              <BarChart3 className="w-6 h-6 text-indigo-400" />
              <div>
                <h2 className="text-xl font-display font-bold text-white">System Performance Analysis</h2>
                <p className="text-xs text-slate-400">Monitor CPU usage, memory levels, active Synapse threads, and network trends.</p>
              </div>
            </div>

            {stats ? (
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* CPU Trend Line Chart */}
                  <div className="p-5 rounded-2xl bg-black/25 border border-white/5">
                    <div className="flex items-center justify-between mb-4">
                      <h4 className="text-xs font-bold font-display uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                        <Cpu className="w-4 h-4 text-indigo-400" />
                        CPU Usage Over Time (%)
                      </h4>
                      <span className="text-xs font-semibold text-indigo-400">{stats.cpuUsage}% Live</span>
                    </div>
                    <div className="h-48 w-full font-mono text-[10px]">
                      <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={stats.trends}>
                          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                          <XAxis dataKey="time" stroke="#64748b" />
                          <YAxis domain={[0, 100]} stroke="#64748b" />
                          <Tooltip contentStyle={{ backgroundColor: '#090a16', borderColor: 'rgba(255,255,255,0.1)', color: '#fff' }} />
                          <Line type="monotone" dataKey="cpu" stroke="#6366f1" strokeWidth={2.5} dot={false} activeDot={{ r: 6 }} />
                        </LineChart>
                      </ResponsiveContainer>
                    </div>
                  </div>

                  {/* Memory Area Chart */}
                  <div className="p-5 rounded-2xl bg-black/25 border border-white/5">
                    <div className="flex items-center justify-between mb-4">
                      <h4 className="text-xs font-bold font-display uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                        <History className="w-4 h-4 text-purple-400" />
                        Memory Commited (GB)
                      </h4>
                      <span className="text-xs font-semibold text-purple-400">{(stats.memoryTotal * (stats.memoryUsage / 100)).toFixed(1)} GB / {stats.memoryTotal} GB</span>
                    </div>
                    <div className="h-48 w-full font-mono text-[10px]">
                      <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={stats.trends}>
                          <defs>
                            <linearGradient id="colorMem" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="5%" stopColor="#a855f7" stopOpacity={0.4}/>
                              <stop offset="95%" stopColor="#a855f7" stopOpacity={0}/>
                            </linearGradient>
                          </defs>
                          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                          <XAxis dataKey="time" stroke="#64748b" />
                          <YAxis domain={[0, 100]} stroke="#64748b" />
                          <Tooltip contentStyle={{ backgroundColor: '#090a16', borderColor: 'rgba(255,255,255,0.1)', color: '#fff' }} />
                          <Area type="monotone" dataKey="memory" stroke="#a855f7" fillOpacity={1} fill="url(#colorMem)" strokeWidth={2.5} />
                        </AreaChart>
                      </ResponsiveContainer>
                    </div>
                  </div>
                </div>

                {/* Active Users Area Chart */}
                <div className="p-5 rounded-2xl bg-black/25 border border-white/5">
                  <div className="flex items-center justify-between mb-4">
                    <h4 className="text-xs font-bold font-display uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                      <Users className="w-4 h-4 text-emerald-400" />
                      Active Synapse Threads & Sessions
                    </h4>
                    <span className="text-xs font-semibold text-emerald-400">{stats.activeUsers} Syncing</span>
                  </div>
                  <div className="h-48 w-full font-mono text-[10px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={stats.trends}>
                        <defs>
                          <linearGradient id="colorUsers" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#10b981" stopOpacity={0.4}/>
                            <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                        <XAxis dataKey="time" stroke="#64748b" />
                        <YAxis stroke="#64748b" />
                        <Tooltip contentStyle={{ backgroundColor: '#090a16', borderColor: 'rgba(255,255,255,0.1)', color: '#fff' }} />
                        <Area type="monotone" dataKey="activeUsers" stroke="#10b981" fillOpacity={1} fill="url(#colorUsers)" strokeWidth={2.5} />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center py-16 text-slate-500 font-mono text-xs">
                Establishing WebSocket performance analysis stream...
              </div>
            )}
          </div>
        )}

        {/* VIEW 2: ROLE-BASED ACCESS CONTROL (RBAC) */}
        {activeSubTab === 'rbac' && (
          <div className="space-y-6">
            <div className="flex items-center gap-3 pb-4 border-b border-white/5">
              <ShieldCheck className="w-6 h-6 text-purple-400" />
              <div>
                <h2 className="text-xl font-display font-bold text-white">Role-Based Access Control (RBAC)</h2>
                <p className="text-xs text-slate-400">Configure management access levels for security. Assign fine access parameters.</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Left Form: Add Panel user */}
              <div className="spatial-glass rounded-2xl p-5 border border-white/5 h-fit">
                <h4 className="text-sm font-semibold text-white mb-4 flex items-center gap-2">
                  <Plus className="w-4 h-4 text-purple-400" />
                  Grant Panel Access
                </h4>

                <form onSubmit={handleCreateUserSubmit} className="space-y-4">
                  <div>
                    <label className="text-[10px] uppercase tracking-wider font-semibold text-slate-400 block mb-1">Username</label>
                    <input
                      type="text"
                      value={newUsername}
                      onChange={(e) => setNewUsername(e.target.value)}
                      disabled={isReadOnly || !isOwner}
                      className="w-full bg-black/40 border border-white/10 rounded-xl px-3 py-2 text-xs text-slate-200 outline-none"
                      placeholder="e.g. admin_ali"
                    />
                  </div>

                  <div>
                    <label className="text-[10px] uppercase tracking-wider font-semibold text-slate-400 block mb-1">Email</label>
                    <input
                      type="email"
                      value={newEmail}
                      onChange={(e) => setNewEmail(e.target.value)}
                      disabled={isReadOnly || !isOwner}
                      className="w-full bg-black/40 border border-white/10 rounded-xl px-3 py-2 text-xs text-slate-200 outline-none"
                      placeholder="e.g. ali@company.local"
                    />
                  </div>

                  <div>
                    <label className="text-[10px] uppercase tracking-wider font-semibold text-slate-400 block mb-1">Password</label>
                    <input
                      type="password"
                      value={newPass}
                      onChange={(e) => setNewPass(e.target.value)}
                      disabled={isReadOnly || !isOwner}
                      className="w-full bg-black/40 border border-white/10 rounded-xl px-3 py-2 text-xs text-slate-200 outline-none"
                      placeholder="••••••••"
                    />
                  </div>

                  <div>
                    <label className="text-[10px] uppercase tracking-wider font-semibold text-slate-400 block mb-1">Authorization Role</label>
                    <select
                      value={newRole}
                      onChange={(e) => setNewPassRole(e.target.value)}
                      disabled={isReadOnly || !isOwner}
                      className="w-full bg-black/40 border border-white/10 rounded-xl px-3 py-2 text-xs text-slate-200 outline-none"
                    >
                      <option value="Viewer">Viewer (Read-only status monitoring)</option>
                      <option value="Moderator">Moderator (Manage users & DMs)</option>
                      <option value="Super Admin">Super Admin (Change configurations)</option>
                      <option value="Owner">Owner (Full system control)</option>
                    </select>
                  </div>

                  <button
                    type="submit"
                    disabled={isReadOnly || !isOwner || !newUsername.trim() || !newEmail.trim() || !newPass.trim()}
                    className="w-full py-2.5 rounded-xl bg-purple-500 text-white font-bold text-xs shadow-lg hover:scale-[1.02] transition-transform disabled:opacity-50"
                  >
                    Authorize User
                  </button>
                </form>
              </div>

              {/* Right Table: Administrators */}
              <div className="md:col-span-2 space-y-3">
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider px-1">Authorized Administrators</h4>

                {panelUsers.map((u) => {
                  const isMainAdmin = u.username === 'admin';
                  return (
                    <div 
                      key={u.id} 
                      className="spatial-glass rounded-2xl p-4 border border-white/5 bg-white/5 hover:border-white/10 flex items-center justify-between"
                    >
                      <div className="flex items-center gap-3">
                        <img 
                          src={u.avatar || `https://api.dicebear.com/7.x/bottts/svg?seed=${u.username}`} 
                          alt={u.username} 
                          className="w-10 h-10 rounded-xl bg-slate-800 p-0.5 border border-white/10" 
                        />
                        <div>
                          <h4 className="text-sm font-semibold text-white flex items-center gap-2">
                            {u.username}
                            {isMainAdmin && <span className="text-[9px] bg-red-500/10 text-red-400 px-1.5 py-0.5 rounded uppercase font-bold tracking-wider">Root</span>}
                          </h4>
                          <span className="text-xs text-slate-400">{u.email}</span>
                        </div>
                      </div>

                      <div className="flex items-center gap-4">
                        {/* Role selector dropdown */}
                        <select
                          value={u.role}
                          onChange={(e) => onChangeUserRole(u.id, e.target.value)}
                          disabled={isReadOnly || !isOwner || isMainAdmin}
                          className="bg-black/30 border border-white/10 rounded-xl px-2.5 py-1 text-xs text-slate-300 focus:outline-none disabled:opacity-70"
                        >
                          <option value="Viewer">Viewer</option>
                          <option value="Moderator">Moderator</option>
                          <option value="Super Admin">Super Admin</option>
                          <option value="Owner">Owner</option>
                        </select>

                        {!isMainAdmin && (isOwner || isSuperAdmin) && (
                          <button
                            onClick={() => onDeletePanelUser(u.id)}
                            className="p-2 rounded-xl bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/10 transition-all"
                            title="Revoke Access"
                          >
                            <UserX className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* VIEW 3: SECURITY AUDIT LOGS */}
        {activeSubTab === 'audit' && (
          <div className="space-y-6 flex-1 flex flex-col h-full overflow-hidden">
            <div className="flex items-center gap-3 pb-4 border-b border-white/5">
              <History className="w-6 h-6 text-emerald-400" />
              <div>
                <h2 className="text-xl font-display font-bold text-white">Security Audit Log</h2>
                <p className="text-xs text-slate-400">Strict chronological registry tracking all management panel transactions.</p>
              </div>
            </div>

            <div className="flex-1 bg-black/30 rounded-2xl border border-white/5 overflow-y-auto pr-1">
              <table className="w-full text-left border-collapse font-mono text-xs">
                <thead>
                  <tr className="border-b border-white/10 text-slate-400 bg-black/20 text-[10px] tracking-wider uppercase font-semibold">
                    <th className="p-4">Timestamp</th>
                    <th className="p-4">User</th>
                    <th className="p-4">Action</th>
                    <th className="p-4">Target</th>
                    <th className="p-4">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5 text-slate-300">
                  {auditLogs.map((log) => (
                    <tr key={log.id} className="hover:bg-white/5 transition-colors">
                      <td className="p-4 text-slate-400 whitespace-nowrap">
                        {new Date(log.timestamp).toLocaleString()}
                      </td>
                      <td className="p-4 font-semibold text-white">
                        @{log.username}
                      </td>
                      <td className="p-4">
                        {log.action}
                      </td>
                      <td className="p-4 text-cyan-400">
                        {log.target || '-'}
                      </td>
                      <td className="p-4">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold font-sans uppercase ${
                          log.status === 'success' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-red-500/10 text-red-400'
                        }`}>
                          {log.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* VIEW 4: BACKUPS & SNAPSHOT UNDO */}
        {activeSubTab === 'backups' && (
          <div className="space-y-6 flex flex-col h-full" dir="ltr">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-white/5">
              <div className="flex items-center gap-3">
                <History className="w-6 h-6 text-amber-400" />
                <div className="text-left">
                  <h2 className="text-xl font-display font-bold text-white">Advanced Backup & Restore</h2>
                  <p className="text-xs text-slate-400 mt-0.5">Manage database backups, core configuration, schedules, and server restoration.</p>
                </div>
              </div>

              <div className="flex items-center gap-1.5 bg-black/40 p-1 rounded-xl border border-white/5 self-start sm:self-auto">
                <button
                  onClick={() => setActiveBackupSubTab('list')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    activeBackupSubTab === 'list' 
                      ? 'bg-amber-500 text-slate-950 shadow-[0_0_12px_rgba(245,158,11,0.3)]' 
                      : 'text-gray-400 hover:text-white'
                  }`}
                >
                  Backups & Restoration
                </button>
                <button
                  onClick={() => setActiveBackupSubTab('settings')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    activeBackupSubTab === 'settings' 
                      ? 'bg-amber-500 text-slate-950 shadow-[0_0_12px_rgba(245,158,11,0.3)]' 
                      : 'text-gray-400 hover:text-white'
                  }`}
                >
                  Settings & Schedules
                </button>
              </div>
            </div>

            {activeBackupSubTab === 'list' && (
              <div className="space-y-6 flex-1 overflow-y-auto pr-1">
                {/* Upper Action Row: Trigger Manual Backups & Upload */}
                {!isReadOnly && (
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Config Backup Box */}
                    <div className="spatial-glass rounded-2xl p-5 border border-white/5 bg-white/5 text-left flex flex-col justify-between">
                      <div>
                        <h4 className="text-sm font-bold text-white flex items-center gap-2 justify-start mb-1">
                          <Settings className="w-4 h-4 text-amber-400" />
                          <span>Configuration Backup (Config)</span>
                        </h4>
                        <p className="text-xs text-slate-400 mb-4 leading-relaxed">
                          Creates a compressed backup archive of Synapse configs, Element web client profiles, Nginx proxies, and LDAP connection details.
                        </p>
                      </div>
                      <div className="flex items-center justify-between pt-3 border-t border-white/5">
                        <div className="flex items-center gap-2">
                          <input 
                            type="checkbox" 
                            id="inc-ssl-adv" 
                            checked={includeSSL} 
                            onChange={(e) => setIncludeSSL(e.target.checked)} 
                            className="rounded bg-black/40 border-white/10 text-amber-500 focus:ring-0 focus:ring-offset-0 w-4 h-4 cursor-pointer"
                          />
                          <label htmlFor="inc-ssl-adv" className="text-xs font-semibold text-slate-300 cursor-pointer">Backup SSL Certificates</label>
                        </div>
                        <button
                          disabled={isTriggeringBackup}
                          onClick={() => triggerAdvancedBackup('config')}
                          className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs shadow-md transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                        >
                          {isTriggeringBackup ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Play className="w-3.5 h-3.5" />}
                          <span>Create Config Backup</span>
                        </button>
                      </div>
                    </div>

                    {/* DB Backup Box */}
                    <div className="spatial-glass rounded-2xl p-5 border border-white/5 bg-white/5 text-left flex flex-col justify-between">
                      <div>
                        <h4 className="text-sm font-bold text-white flex items-center gap-2 justify-start mb-1">
                          <FileJson className="w-4 h-4 text-cyan-400" />
                          <span>Database Backup (Database)</span>
                        </h4>
                        <p className="text-xs text-slate-400 mb-4 leading-relaxed">
                          Exports a complete database snapshot containing registered users, groups, RBAC permissions, audit log history, and configuration details.
                        </p>
                      </div>
                      <div className="flex justify-end pt-3 border-t border-white/5">
                        <button
                          disabled={isTriggeringBackup}
                          onClick={() => triggerAdvancedBackup('database')}
                          className="px-4 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs shadow-md transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                        >
                          {isTriggeringBackup ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Play className="w-3.5 h-3.5" />}
                          <span>Create Database Backup</span>
                        </button>
                      </div>
                    </div>

                    {/* File Upload zone */}
                    <div className="spatial-glass rounded-2xl p-5 border border-white/5 bg-white/5 text-left flex flex-col justify-between">
                      <div>
                        <h4 className="text-sm font-bold text-white flex items-center gap-2 justify-start mb-1">
                          <UploadCloud className="w-4 h-4 text-emerald-400" />
                          <span>Upload Backup File</span>
                        </h4>
                        <p className="text-xs text-slate-400 mb-3 leading-relaxed">
                          Directly upload a previous JSON backup file into the server's dedicated backups catalog to prepare for restoration.
                        </p>
                      </div>
                      <div className="relative border border-dashed border-white/10 hover:border-emerald-500/50 rounded-xl p-3 text-center transition-all bg-black/20">
                        <input
                          type="file"
                          accept=".json"
                          onChange={handleUploadBackupFile}
                          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                        />
                        <div className="flex flex-col items-center gap-1">
                          <UploadCloud className="w-6 h-6 text-emerald-400 animate-pulse" />
                          <span className="text-[10px] text-slate-400">Click or drag backup file here</span>
                          <span className="text-[9px] text-slate-500 font-mono">Format allowed: JSON Backups</span>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Backups List & Bulk Actions */}
                <div className="space-y-3">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-black/30 p-4 rounded-2xl border border-white/5">
                    <div className="flex items-center gap-3">
                      <button
                        onClick={handleToggleSelectAll}
                        className="flex items-center gap-2 text-xs font-semibold text-slate-300 hover:text-white transition-colors cursor-pointer"
                      >
                        {selectedBackupIds.length === backups.length && backups.length > 0 ? (
                          <CheckSquare className="w-4.5 h-4.5 text-amber-500" />
                        ) : (
                          <Square className="w-4.5 h-4.5 text-slate-500" />
                        )}
                        <span>Select All ({backups.length})</span>
                      </button>

                      {selectedBackupIds.length > 0 && (
                        <div className="h-4 w-px bg-white/10" />
                      )}

                      {selectedBackupIds.length > 0 && (
                        <button
                          onClick={downloadBulkBackups}
                          className="px-3 py-1 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-[10px] flex items-center gap-1 transition-all cursor-pointer shadow-md"
                        >
                          <Download className="w-3 h-3" />
                          <span>Bulk Download ({selectedBackupIds.length})</span>
                        </button>
                      )}
                    </div>

                    <div className="text-left sm:text-right">
                      <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Archived Backups Catalog</h4>
                    </div>
                  </div>

                  {backups.length === 0 ? (
                    <div className="text-center py-10 spatial-glass rounded-2xl border border-white/5">
                      <FolderOpen className="w-12 h-12 text-slate-600 mx-auto mb-2" />
                      <p className="text-sm text-slate-400">No backup archives found on disk.</p>
                      <p className="text-xs text-slate-500 mt-1">Trigger your first manual backup using the buttons above.</p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {backups.map((b) => (
                        <div 
                          key={b.id} 
                          className={`spatial-glass rounded-2xl p-4 border transition-all flex items-center justify-between ${
                            selectedBackupIds.includes(b.id) 
                              ? 'border-amber-500/40 bg-amber-500/[0.03]' 
                              : 'border-white/5 hover:border-white/10'
                          }`}
                        >
                          <div className="flex items-start gap-3">
                            <button
                              onClick={() => handleToggleSelectBackup(b.id)}
                              className="mt-0.5 text-slate-500 hover:text-white transition-colors cursor-pointer"
                            >
                              {selectedBackupIds.includes(b.id) ? (
                                <CheckSquare className="w-4.5 h-4.5 text-amber-500" />
                              ) : (
                                <Square className="w-4.5 h-4.5" />
                              )}
                            </button>
                            <div className="text-left">
                              <h5 className="text-xs font-bold text-white font-mono break-all select-all">{b.filename}</h5>
                              <div className="flex items-center gap-3 mt-2 font-mono text-[10px] text-slate-400 flex-wrap">
                                <span className={`px-2 py-0.5 rounded-full text-[9px] font-sans font-bold uppercase ${
                                  b.type === 'database' ? 'bg-cyan-500/10 text-cyan-400' : 'bg-amber-500/10 text-amber-400'
                                }`}>
                                  {b.type === 'database' ? 'Database' : 'Config'}
                                </span>
                                <span>Size: <strong className="text-white">{b.size}</strong></span>
                                <span>{new Date(b.timestamp).toLocaleString()}</span>
                              </div>
                            </div>
                          </div>

                          <div className="flex items-center gap-1.5 ml-2">
                            <button
                              onClick={() => downloadSingleBackup(b)}
                              className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 border border-white/5 transition-all cursor-pointer"
                              title="Download backup"
                            >
                              <Download className="w-4 h-4" />
                            </button>
                            {!isReadOnly && (
                              <>
                                <button
                                  onClick={() => setShowRestoreModal(b)}
                                  className="p-2 rounded-xl bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/10 transition-all cursor-pointer font-semibold text-xs flex items-center gap-1"
                                  title="Restore and rollback server"
                                >
                                  <RotateCcw className="w-4 h-4" />
                                  <span className="hidden lg:inline text-[10px]">Restore</span>
                                </button>
                                <button
                                  onClick={() => onDeleteBackup(b.id)}
                                  className="p-2 rounded-xl bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/10 transition-all cursor-pointer"
                                  title="Delete backup"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              </>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}

            {activeBackupSubTab === 'settings' && (
              <div className="space-y-6 flex-1 overflow-y-auto pr-1">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Left Column: Path & Retention */}
                  <div className="spatial-glass rounded-2xl p-6 border border-white/5 bg-white/5 text-left space-y-5">
                    <h4 className="text-sm font-bold text-white pb-3 border-b border-white/5">Disk Storage Settings</h4>

                    {/* Storage Path on server */}
                    <div className="space-y-1.5">
                      <label className="block text-xs font-semibold text-slate-300">Server Backup Directory Path</label>
                      <div className="flex gap-2">
                        <input
                          type="text"
                          value={backupSettings.backupPath}
                          onChange={(e) => setBackupSettings(prev => ({ ...prev, backupPath: e.target.value }))}
                          disabled={isReadOnly}
                          className="flex-1 bg-black/40 border border-white/10 rounded-xl px-3 py-2 text-xs font-mono text-slate-300 focus:outline-none focus:border-amber-500/50 text-left"
                          placeholder="/sandbox/backups"
                        />
                        <span className="px-2.5 py-1 bg-amber-500/10 text-amber-400 border border-amber-500/10 rounded-xl text-[10px] font-bold flex items-center">Writable</span>
                      </div>
                      <p className="text-[10px] text-slate-500 leading-relaxed">
                        Absolute path on the host system where backup archives are persisted. The application creates this directory dynamically if it does not exist.
                      </p>
                    </div>

                    {/* Retention policy */}
                    <div className="space-y-1.5">
                      <label className="block text-xs font-semibold text-slate-300">Backup Retention Policy (Days)</label>
                      <input
                        type="number"
                        min="1"
                        max="365"
                        value={backupSettings.retentionDays}
                        onChange={(e) => setBackupSettings(prev => ({ ...prev, retentionDays: parseInt(e.target.value) || 30 }))}
                        disabled={isReadOnly}
                        className="w-full bg-black/40 border border-white/10 rounded-xl px-3 py-2 text-xs text-slate-300 focus:outline-none focus:border-amber-500/50"
                        placeholder="30"
                      />
                      <p className="text-[10px] text-slate-500 leading-relaxed">
                        Retention window for backup archives. Items older than this duration will be automatically pruned by the server background worker.
                      </p>
                    </div>
                  </div>

                  {/* Right Column: Schedulers */}
                  <div className="spatial-glass rounded-2xl p-6 border border-white/5 bg-white/5 text-left space-y-6">
                    <h4 className="text-sm font-bold text-white pb-3 border-b border-white/5">Automated Cron Job Schedules</h4>

                    {/* Database Cron */}
                    <div className="space-y-3 bg-black/20 p-4 rounded-xl border border-white/5">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <input
                            type="checkbox"
                            id="db-sched-toggle"
                            checked={backupSettings.dbSchedule?.enabled || false}
                            onChange={(e) => setBackupSettings(prev => ({
                              ...prev,
                              dbSchedule: { ...prev.dbSchedule, enabled: e.target.checked }
                            }))}
                            disabled={isReadOnly}
                            className="rounded bg-black/40 border-white/10 text-amber-500 focus:ring-0 focus:ring-offset-0 w-4 h-4 cursor-pointer"
                          />
                          <label htmlFor="db-sched-toggle" className="text-xs font-bold text-white cursor-pointer">Enable Scheduled Database Backup</label>
                        </div>
                        <Calendar className="w-4 h-4 text-cyan-400" />
                      </div>
                      <div className="space-y-1.5">
                        <label className="block text-[10px] text-slate-400">Linux Cron Expression</label>
                        <input
                          type="text"
                          value={backupSettings.dbSchedule?.cron || '0 2 * * *'}
                          onChange={(e) => setBackupSettings(prev => ({
                            ...prev,
                            dbSchedule: { ...prev.dbSchedule, cron: e.target.value }
                          }))}
                          disabled={isReadOnly || !backupSettings.dbSchedule?.enabled}
                          className="w-full bg-black/40 border border-white/10 rounded-xl px-3 py-2 text-xs font-mono text-slate-300 focus:outline-none focus:border-amber-500/50 text-left disabled:opacity-50"
                        />
                        <span className="text-[9px] text-slate-500 block">Example: <code className="text-slate-400">0 2 * * *</code> (Every day at 2:00 AM)</span>
                      </div>
                    </div>

                    {/* Config Cron */}
                    <div className="space-y-3 bg-black/20 p-4 rounded-xl border border-white/5">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <input
                            type="checkbox"
                            id="cfg-sched-toggle"
                            checked={backupSettings.configSchedule?.enabled || false}
                            onChange={(e) => setBackupSettings(prev => ({
                              ...prev,
                              configSchedule: { ...prev.configSchedule, enabled: e.target.checked }
                            }))}
                            disabled={isReadOnly}
                            className="rounded bg-black/40 border-white/10 text-amber-500 focus:ring-0 focus:ring-offset-0 w-4 h-4 cursor-pointer"
                          />
                          <label htmlFor="cfg-sched-toggle" className="text-xs font-bold text-white cursor-pointer">Enable Scheduled Config Backup</label>
                        </div>
                        <Calendar className="w-4 h-4 text-amber-400" />
                      </div>
                      <div className="space-y-1.5">
                        <label className="block text-[10px] text-slate-400">Linux Cron Expression</label>
                        <input
                          type="text"
                          value={backupSettings.configSchedule?.cron || '0 3 * * *'}
                          onChange={(e) => setBackupSettings(prev => ({
                            ...prev,
                            configSchedule: { ...prev.configSchedule, cron: e.target.value }
                          }))}
                          disabled={isReadOnly || !backupSettings.configSchedule?.enabled}
                          className="w-full bg-black/40 border border-white/10 rounded-xl px-3 py-2 text-xs font-mono text-slate-300 focus:outline-none focus:border-amber-500/50 text-left disabled:opacity-50"
                        />
                        <span className="text-[9px] text-slate-500 block">Example: <code className="text-slate-400">0 3 * * *</code> (Every day at 3:00 AM)</span>
                      </div>
                    </div>
                  </div>
                </div>

                {!isReadOnly && (
                  <div className="flex justify-end pt-4 border-t border-white/5">
                    <button
                      onClick={saveBackupSettings}
                      className="px-6 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs shadow-lg transition-all flex items-center gap-2 cursor-pointer hover:shadow-amber-500/10"
                    >
                      <Save className="w-4 h-4" />
                      <span>Save Policy & Configuration</span>
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* Restore Confirmation Modal Overlay */}
            {showRestoreModal && (
              <div className="fixed inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 z-50 animate-fade-in" dir="ltr">
                <div className={`max-w-lg w-full rounded-3xl p-6 text-left space-y-5 animate-scale-up transition-colors ${
                  isLightMode 
                    ? 'bg-white border border-red-100 text-slate-900 shadow-[0_10px_40px_rgba(0,0,0,0.1)]' 
                    : 'bg-slate-900 border border-red-500/20 text-white shadow-[0_0_50px_rgba(239,68,68,0.15)]'
                }`}>
                  <div className="flex items-center gap-3 text-red-500 pb-3 border-b border-white/5">
                    <AlertTriangle className="w-6 h-6" />
                    <div>
                      <h3 className={`text-lg font-bold ${isLightMode ? 'text-slate-900' : 'text-white'}`}>Critical Warning: Restore System</h3>
                      <p className={`text-[10px] ${isLightMode ? 'text-red-600/80' : 'text-red-400/80'}`}>Matrix Server Backup Recovery Operations</p>
                    </div>
                  </div>

                  <p className={`text-xs leading-relaxed ${isLightMode ? 'text-slate-600' : 'text-slate-300'}`}>
                    Are you absolutely sure you want to restore the server state to backup file <strong className="text-amber-500 font-mono select-all break-all">{showRestoreModal.filename}</strong>?
                  </p>

                  <div className={`rounded-2xl p-4 text-[11px] space-y-2 border ${
                    isLightMode 
                      ? 'bg-red-50/50 border-red-100 text-slate-700' 
                      : 'bg-red-500/5 border-red-500/10 text-slate-300'
                  }`}>
                    <p className="font-bold text-red-500 flex items-center gap-1">
                      <span>Irreversible side-effects of this rollback:</span>
                    </p>
                    {showRestoreModal.type === 'database' ? (
                      <ul className={`list-disc list-inside space-y-1 pl-1 ${isLightMode ? 'text-slate-600' : 'text-slate-400'}`}>
                        <li>The current database state including user rosters, active sessions, and access permissions will be entirely replaced.</li>
                        <li>Any adjustments committed after the backup creation date ({new Date(showRestoreModal.timestamp).toLocaleString()}) will be permanently erased.</li>
                      </ul>
                    ) : (
                      <ul className={`list-disc list-inside space-y-1 pl-1 ${isLightMode ? 'text-slate-600' : 'text-slate-400'}`}>
                        <li>Critical system configuration files, Element client options, and reverse proxy properties will be rewritten.</li>
                        <li>Sync processes and server units will restart to reload newly written configurations.</li>
                      </ul>
                    )}
                  </div>

                  <div className="flex items-center justify-end gap-3 pt-3 border-t border-white/5">
                    <button
                      disabled={isRestoring}
                      onClick={() => setShowRestoreModal(null)}
                      className={`px-4 py-2 rounded-xl font-bold text-xs transition-colors cursor-pointer ${
                        isLightMode 
                          ? 'bg-slate-100 hover:bg-slate-200 text-slate-700' 
                          : 'bg-white/5 hover:bg-white/10 text-slate-300'
                      }`}
                    >
                      Cancel
                    </button>
                    <button
                      disabled={isRestoring}
                      onClick={() => restoreBackup(showRestoreModal)}
                      className="px-5 py-2.5 rounded-xl bg-red-500 hover:bg-red-600 text-white font-bold text-xs shadow-lg transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50"
                    >
                      {isRestoring ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <RotateCcw className="w-3.5 h-3.5" />}
                      <span>Confirm Restoration</span>
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
