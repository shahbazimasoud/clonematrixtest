/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
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
  FolderSync
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
  userRole
}: ReportingPanelProps) {
  const [activeSubTab, setActiveTab] = useState<'analytics' | 'rbac' | 'audit' | 'backups'>('analytics');

  // New Panel User inputs
  const [newUsername, setNewUsername] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [newPass, setNewPass] = useState('');
  const [newRole, setNewPassRole] = useState('Viewer');
  const [includeSSL, setIncludeSSL] = useState(false);

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
          <div className="space-y-6">
            <div className="flex items-center justify-between pb-4 border-b border-white/5">
              <div className="flex items-center gap-3">
                <History className="w-6 h-6 text-amber-400" />
                <div>
                  <h2 className="text-xl font-display font-bold text-white">Backups & Configurations undo</h2>
                  <p className="text-xs text-slate-400">Manage fully integrated backups and single-step action rollbacks.</p>
                </div>
              </div>

              {!isReadOnly && (
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-2">
                    <input 
                      type="checkbox" 
                      id="inc-ssl" 
                      checked={includeSSL} 
                      onChange={(e) => setIncludeSSL(e.target.checked)} 
                      className="rounded bg-black/40 border-white/10 text-amber-500"
                    />
                    <label htmlFor="inc-ssl" className="text-xs font-semibold text-slate-400">Backup SSL Certs</label>
                  </div>
                  <button
                    onClick={() => onCreateBackup(includeSSL)}
                    className="px-4 py-1.5 rounded-xl bg-amber-500 text-slate-950 font-bold text-xs shadow-md"
                  >
                    Trigger Backup
                  </button>
                </div>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Backups List */}
              <div className="space-y-3">
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Archived tar.gz Backups</h4>
                
                {backups.map((b) => (
                  <div key={b.id} className="spatial-glass rounded-2xl p-4 border border-white/5 bg-white/5 flex items-center justify-between">
                    <div>
                      <h5 className="text-xs font-semibold text-white font-mono">{b.filename}</h5>
                      <div className="flex items-center gap-3 mt-1.5 font-mono text-[10px] text-slate-400">
                        <span>Size: <strong className="text-white">{b.size}</strong></span>
                        <span>{new Date(b.timestamp).toLocaleString()}</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => {}}
                        className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 border border-white/10"
                        title="Download Backup"
                      >
                        <Download className="w-4 h-4" />
                      </button>
                      {!isReadOnly && (
                        <button
                          onClick={() => onDeleteBackup(b.id)}
                          className="p-2 rounded-xl bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/10"
                          title="Purge Backup"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              {/* Undo Snapshots History */}
              <div className="space-y-3">
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Single-Action Undo Snapshots</h4>

                {undoHistory.map((u) => (
                  <div key={u.id} className="spatial-glass rounded-2xl p-4 border border-cyan-500/10 bg-cyan-500/5 flex items-center justify-between">
                    <div>
                      <h5 className="text-xs font-bold text-cyan-400 flex items-center gap-1.5 uppercase tracking-wider">
                        <FolderSync className="w-4 h-4" />
                        {u.description}
                      </h5>
                      <span className="text-[10px] font-mono text-slate-400 block mt-1">Snapshot Date: {new Date(u.timestamp).toLocaleString()}</span>
                      <div className="flex flex-wrap gap-1 mt-2">
                        {u.files.map((f, i) => (
                          <span key={i} className="text-[9px] bg-black/40 font-mono text-slate-300 px-1.5 py-0.5 rounded border border-white/5">{f}</span>
                        ))}
                      </div>
                    </div>

                    {!isReadOnly && (
                      <button
                        onClick={() => {}}
                        className="px-3 py-1.5 rounded-xl bg-cyan-500 text-slate-950 font-bold text-xs shadow-md"
                        title="Revert configuration changes back to this exact moment"
                      >
                        Undo
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
