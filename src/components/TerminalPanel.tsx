/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useRef, useState } from 'react';
import { Terminal, Play, ShieldAlert, Circle, RefreshCw, Trash2, ArrowUpRight, Download } from 'lucide-react';

interface TerminalPanelProps {
  logs: string[];
  isExecuting: boolean;
  onExecuteCommand: (command: string) => void;
  userRole: string;
  authToken: string | null;
  lang: 'fa' | 'en';
  isLightMode?: boolean;
  showToast: (type: 'success' | 'error', text: string) => void;
}

export default function TerminalPanel({ 
  logs, 
  isExecuting, 
  onExecuteCommand, 
  userRole, 
  authToken, 
  lang, 
  isLightMode = false,
  showToast 
}: TerminalPanelProps) {
  const terminalEndRef = useRef<HTMLDivElement>(null);
  const [activeTab, setActiveTab] = useState<'console' | 'install'>('console');
  const [customInput, setCustomInput] = useState('');

  // System Updates & Maintenance States
  const [updateAvailable, setUpdateAvailable] = useState<boolean>(false);
  const [commitsBehind, setCommitsBehind] = useState<number>(0);
  const [latestCommits, setLatestCommits] = useState<any[]>([]);
  const [currentVersion, setCurrentVersion] = useState<string>('');
  const [updateLogs, setUpdateLogs] = useState<string[]>([
    '# Update Manager ready.',
    '# Click "Check for Updates" to query the repository status.'
  ]);
  const [isCheckingUpdate, setIsCheckingUpdate] = useState<boolean>(false);
  const [isApplyingUpdate, setIsApplyingUpdate] = useState<boolean>(false);

  const isRtl = lang === 'fa';
  const hasWriteAccess = userRole !== 'Viewer';

  const safeConfirm = (msg: string): boolean => {
    try {
      return window.confirm(msg);
    } catch (_) {
      return true;
    }
  };

  const checkSystemUpdates = async () => {
    setIsCheckingUpdate(true);
    setUpdateLogs((prev) => [...prev, '# querying remote repository status...', '> git fetch origin master && git status']);
    try {
      const res = await fetch('/api/system/update/check', {
        headers: { 'Authorization': `Bearer ${authToken}` }
      });
      if (res.ok) {
        const data = await res.json();
        setUpdateAvailable(data.updateAvailable);
        setCommitsBehind(data.commitsBehind);
        setLatestCommits(data.latestCommits || []);
        setCurrentVersion(data.currentVersion || '');
        
        const newLogs = [
          `# Query completed successfully!`,
          `# Current installed commit: ${data.currentVersion || 'Unknown'}`,
          data.updateAvailable 
            ? `[!] UPDATE AVAILABLE: You are behind by ${data.commitsBehind} commit(s).` 
            : `[✓] UP TO DATE: Your admin panel is running the latest version.`
        ];
        if (data.latestCommits && data.latestCommits.length > 0) {
          newLogs.push('# New commits available:');
          data.latestCommits.forEach((c: string) => {
            newLogs.push(`  * ${c}`);
          });
        }
        setUpdateLogs((prev) => [...prev, ...newLogs]);
      } else {
        const errData = await res.json();
        setUpdateLogs((prev) => [...prev, `[ERR] failed to check for updates: ${errData.error || 'Server error'}`]);
      }
    } catch (e: any) {
      setUpdateLogs((prev) => [...prev, `[ERR] failed to check for updates: ${e.message || 'Network error'}`]);
    } finally {
      setIsCheckingUpdate(false);
    }
  };

  const applySystemUpdates = async () => {
    if (!hasWriteAccess) return showToast('error', isRtl ? 'دسترسی غیرمجاز: نقش شما اجازه انجام این کار را نمی‌دهد.' : 'Unauthorized: Your role does not have privileges for this action.');
    if (!safeConfirm(isRtl ? 'آیا از بروزرسانی پنل به آخرین نسخه مطمئن هستید؟ این فرآیند ممکن است چند لحظه طول بکشد.' : 'Are you sure you want to update the panel to the latest version? This process may take a few moments.')) return;

    setIsApplyingUpdate(true);
    setUpdateLogs((prev) => [...prev, '# launching system update...', '> git pull && npm run build']);
    try {
      const res = await fetch('/api/system/update/apply', {
        method: 'POST',
        headers: { 
          'Authorization': `Bearer ${authToken}`,
          'Content-Type': 'application/json'
        }
      });
      if (res.ok) {
        const data = await res.json();
        if (data.logs && Array.isArray(data.logs)) {
          setUpdateLogs((prev) => [...prev, ...data.logs]);
        }
        setUpdateAvailable(false);
        setCommitsBehind(0);
        setLatestCommits([]);
        showToast('success', isRtl ? 'پنل با موفقیت بروزرسانی شد!' : 'Panel updated successfully!');
      } else {
        const errData = await res.json();
        setUpdateLogs((prev) => [...prev, `[ERR] update failed: ${errData.error || 'Server error'}`]);
        showToast('error', isRtl ? 'بروزرسانی با خطا مواجه شد' : 'Update failed');
      }
    } catch (e: any) {
      setUpdateLogs((prev) => [...prev, `[ERR] update failed: ${e.message || 'Network error'}`]);
      showToast('error', isRtl ? 'بروزرسانی با خطا مواجه شد' : 'Update failed');
    } finally {
      setIsApplyingUpdate(false);
    }
  };

  useEffect(() => {
    if (!currentVersion) {
      checkSystemUpdates();
    }
  }, []);

  const scrollToBottom = () => {
    terminalEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [logs]);

  const handleRunCommand = (cmd: string) => {
    if (isExecuting) return;
    onExecuteCommand(cmd);
  };

  const handleCustomSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customInput.trim() || isExecuting) return;
    
    // Support typing standard actions
    const inputLower = customInput.toLowerCase().trim();
    if (inputLower === 'install') {
      onExecuteCommand('install');
    } else if (inputLower === 'backup') {
      onExecuteCommand('backup');
    } else if (inputLower === 'workers') {
      onExecuteCommand('workers_enable');
    } else if (inputLower === 'e2ee_disable') {
      onExecuteCommand('e2ee_disable');
    } else {
      onExecuteCommand('help_general');
    }
    setCustomInput('');
  };

  const isViewer = userRole === 'Viewer';
  const isModerator = userRole === 'Moderator';

  // Highlight syntax helpers for log streams
  const formatLogLine = (line: string) => {
    if (line.includes('✔') || line.includes('✅') || line.includes('SUCCESS')) {
      return <span className="text-emerald-400 font-semibold">{line}</span>;
    }
    if (line.includes('✘') || line.includes('❌') || line.includes('FAILED') || line.includes('Error')) {
      return <span className="text-red-400 font-semibold">{line}</span>;
    }
    if (line.includes('⚠️') || line.includes('WARNING') || line.includes('[INFO]')) {
      return <span className="text-amber-400">{line}</span>;
    }
    if (line.includes('[STEP') || line.includes('STEP')) {
      return <span className="text-cyan-400 font-medium glow-text-cyan">{line}</span>;
    }
    return <span className="text-slate-300">{line}</span>;
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[calc(100vh-180px)] overflow-hidden">
      {/* Sidebar: Preset Quick Actions */}
      <div className="spatial-glass rounded-3xl p-5 border border-white/5 flex flex-col justify-between h-full overflow-y-auto">
        <div>
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 rounded-xl bg-rose-500/10 text-rose-400 border border-rose-500/10">
              <Terminal className="w-5 h-5" />
            </div>
            <h2 className="text-xl font-display font-bold text-white">Quick Tasks</h2>
          </div>
          <p className="text-xs text-slate-400 mb-6">
            Execute high-privilege shell routines on the virtual Matrix node. Changes reflect in real-time.
          </p>

          <div className="space-y-3">
            {/* Standard Installation */}
            <button
              onClick={() => handleRunCommand('install')}
              disabled={isExecuting || isViewer || isModerator}
              className={`w-full text-left p-3.5 rounded-2xl border transition-all flex items-center justify-between group ${
                isExecuting 
                  ? 'bg-white/5 border-white/5 text-gray-500' 
                  : isViewer || isModerator
                    ? 'border-red-500/10 bg-red-500/5 text-gray-400 cursor-not-allowed'
                    : 'border-white/5 bg-white/5 hover:bg-rose-500/10 hover:border-rose-500/20 text-slate-200'
              }`}
            >
              <div>
                <h4 className="text-sm font-semibold flex items-center gap-2">
                  Standard Install Stack 
                  {isModerator && <span className="text-[10px] bg-red-500/10 text-red-400 px-1.5 py-0.5 rounded font-mono font-normal">SuperAdmin+</span>}
                </h4>
                <p className="text-[11px] text-slate-400 mt-1">Nginx, Synapse, Element, TURN, Postgres</p>
              </div>
              <Play className="w-4 h-4 text-rose-400 transition-transform group-hover:scale-125" />
            </button>

            {/* Turn on Workers Scaling */}
            <button
              onClick={() => handleRunCommand('workers_enable')}
              disabled={isExecuting || isViewer || isModerator}
              className={`w-full text-left p-3.5 rounded-2xl border transition-all flex items-center justify-between group ${
                isExecuting 
                  ? 'bg-white/5 border-white/5 text-gray-500' 
                  : isViewer || isModerator
                    ? 'border-red-500/10 bg-red-500/5 text-gray-400 cursor-not-allowed'
                    : 'border-white/5 bg-white/5 hover:bg-indigo-500/10 hover:border-indigo-500/20 text-slate-200'
              }`}
            >
              <div>
                <h4 className="text-sm font-semibold flex items-center gap-2">
                  Enable Redis Workers 
                  {isModerator && <span className="text-[10px] bg-red-500/10 text-red-400 px-1.5 py-0.5 rounded font-mono font-normal">SuperAdmin+</span>}
                </h4>
                <p className="text-[11px] text-slate-400 mt-1">Deploy 2 generic workers and a proxy</p>
              </div>
              <Play className="w-4 h-4 text-indigo-400 transition-transform group-hover:scale-125" />
            </button>

            {/* Trigger E2EE Lockdown */}
            <button
              onClick={() => handleRunCommand('e2ee_disable')}
              disabled={isExecuting || isViewer || isModerator}
              className={`w-full text-left p-3.5 rounded-2xl border transition-all flex items-center justify-between group ${
                isExecuting 
                  ? 'bg-white/5 border-white/5 text-gray-500' 
                  : isViewer || isModerator
                    ? 'border-red-500/10 bg-red-500/5 text-gray-400 cursor-not-allowed'
                    : 'border-white/5 bg-white/5 hover:bg-purple-500/10 hover:border-purple-500/20 text-slate-200'
              }`}
            >
              <div>
                <h4 className="text-sm font-semibold flex items-center gap-2">
                  Disable E2EE Org-Wide 
                  {isModerator && <span className="text-[10px] bg-red-500/10 text-red-400 px-1.5 py-0.5 rounded font-mono font-normal">SuperAdmin+</span>}
                </h4>
                <p className="text-[11px] text-slate-400 mt-1">4-layer enforcement to lock room encryption</p>
              </div>
              <Play className="w-4 h-4 text-purple-400 transition-transform group-hover:scale-125" />
            </button>

            {/* Execute System Backup */}
            <button
              onClick={() => handleRunCommand('backup')}
              disabled={isExecuting || isViewer}
              className={`w-full text-left p-3.5 rounded-2xl border transition-all flex items-center justify-between group ${
                isExecuting 
                  ? 'bg-white/5 border-white/5 text-gray-500' 
                  : isViewer
                    ? 'border-red-500/10 bg-red-500/5 text-gray-400 cursor-not-allowed'
                    : 'border-white/5 bg-white/5 hover:bg-emerald-500/10 hover:border-emerald-500/20 text-slate-200'
              }`}
            >
              <div>
                <h4 className="text-sm font-semibold flex items-center gap-2">
                  Trigger Full Backup 
                  {isViewer && <span className="text-[10px] bg-red-500/10 text-red-400 px-1.5 py-0.5 rounded font-mono font-normal">Admin+</span>}
                </h4>
                <p className="text-[11px] text-slate-400 mt-1">Database, Keys, Elements Web archive</p>
              </div>
              <Play className="w-4 h-4 text-emerald-400 transition-transform group-hover:scale-125" />
            </button>
          </div>

          {/* Update Panel inside Quick Tasks Sidebar */}
          <div className="mt-5 pt-5 border-t border-white/5 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <RefreshCw className={`h-4 w-4 text-rose-400 ${isCheckingUpdate ? 'animate-spin' : ''}`} />
                <h3 className="font-display font-semibold text-sm text-white">
                  {isRtl ? 'بروزرسانی پنل' : 'Panel Update'}
                </h3>
              </div>
              <span className="font-mono text-[10px] text-indigo-400 font-semibold">{currentVersion || (isRtl ? '...' : 'Checking...')}</span>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <button
                disabled={isCheckingUpdate || isApplyingUpdate}
                onClick={checkSystemUpdates}
                className="flex items-center justify-center gap-1.5 py-1.5 px-2 rounded-xl text-[11px] font-bold border border-white/10 bg-white/5 hover:bg-white/10 text-gray-200 cursor-pointer active:scale-[0.99] transition-all"
              >
                <RefreshCw className={`h-3 w-3 ${isCheckingUpdate ? 'animate-spin' : ''}`} />
                <span>{isRtl ? 'بررسی' : 'Check'}</span>
              </button>

              <button
                disabled={isCheckingUpdate || isApplyingUpdate || isViewer}
                onClick={applySystemUpdates}
                className={`flex items-center justify-center gap-1.5 py-1.5 px-2 rounded-xl text-[11px] font-bold border transition-all duration-200 ${
                  isApplyingUpdate 
                    ? 'bg-slate-800 text-slate-500 cursor-not-allowed border-transparent'
                    : isViewer
                      ? 'border-red-500/10 text-red-400 bg-red-500/5 cursor-not-allowed'
                      : updateAvailable
                        ? 'bg-gradient-to-r from-rose-500 to-pink-600 text-white border-transparent hover:brightness-110 active:scale-[0.99]'
                        : 'border-white/5 bg-white/5 text-gray-500 cursor-not-allowed'
                }`}
              >
                <Download className="h-3 w-3" />
                <span>{isRtl ? 'بروزرسانی' : 'Update'}</span>
              </button>
            </div>

            {/* Status Banner */}
            {updateAvailable ? (
              <div className="p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-500">
                <span className="font-bold text-[11px] block">{isRtl ? 'بروزرسانی جدید موجود است!' : 'Update Available!'}</span>
                <p className="text-[10px] text-slate-400 mt-0.5">
                  {isRtl ? `شما ${commitsBehind} کامیت عقب هستید.` : `Behind by ${commitsBehind} commit(s).`}
                </p>
              </div>
            ) : (
              <div className="p-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-500">
                <span className="font-bold text-[11px] block">{isRtl ? 'سیستم بروز است' : 'System Up to Date'}</span>
              </div>
            )}

            {/* Compact Console Logs */}
            <div className="flex flex-col h-[130px] rounded-xl border border-white/5 bg-black/40 overflow-hidden">
              <div className="flex items-center justify-between border-b border-white/5 px-2.5 py-1 bg-black/20">
                <span className="font-mono text-[9px] text-gray-400">git-updater@matrix-panel</span>
                <button 
                  onClick={() => {
                    setUpdateLogs([
                      '# Console logs cleared.',
                      '# Click "Check" to query.'
                    ]);
                  }}
                  className="text-[9px] text-gray-500 hover:text-gray-300 font-semibold font-mono"
                >
                  Clear
                </button>
              </div>
              <div className="flex-1 p-2 overflow-y-auto font-mono text-[9px] leading-relaxed space-y-1 select-text scrollbar-thin">
                {updateLogs.map((log, idx) => (
                  <div 
                    key={idx} 
                    className={`${
                      log.startsWith('[ERR]') 
                        ? 'text-red-400 font-bold' 
                        : log.startsWith('[✓]') 
                          ? 'text-emerald-400 font-bold'
                          : log.startsWith('[!]')
                            ? 'text-amber-400 font-bold'
                            : log.startsWith('#') 
                              ? 'text-cyan-400 font-bold' 
                              : 'text-gray-300'
                    }`}
                  >
                    {log}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Security / RBAC Banner */}
        {isViewer || isModerator ? (
          <div className="mt-4 p-4 rounded-2xl bg-red-500/10 border border-red-500/10 text-red-400 flex items-start gap-3">
            <ShieldAlert className="w-5 h-5 mt-0.5 shrink-0" />
            <div>
              <h5 className="text-xs font-bold font-display uppercase tracking-wider">Access Restricted</h5>
              <p className="text-[11px] text-slate-400 mt-1">
                Your role is <strong className="text-white">{userRole}</strong>. Some commands require Super Admin or Owner privileges.
              </p>
            </div>
          </div>
        ) : (
          <div className="mt-4 p-4 rounded-2xl bg-indigo-500/10 border border-indigo-500/10 text-indigo-400 flex items-start gap-3">
            <ShieldAlert className="w-5 h-5 mt-0.5 shrink-0" />
            <div>
              <h5 className="text-xs font-bold font-display uppercase tracking-wider">Console Mode Active</h5>
              <p className="text-[11px] text-slate-400 mt-1">
                You have full <strong className="text-white">Write/Execute</strong> capability. Take precautions when configuring the Homeserver.
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Main Panel: Interactive Terminal */}
      <div className="lg:col-span-2 spatial-glass rounded-3xl border border-white/5 flex flex-col h-full overflow-hidden">
        {/* Terminal Header */}
        <div className="px-5 py-3 bg-black/30 border-b border-white/5 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Circle className="w-3.5 h-3.5 text-red-500 fill-red-500" />
            <Circle className="w-3.5 h-3.5 text-yellow-500 fill-yellow-500" />
            <Circle className="w-3.5 h-3.5 text-green-500 fill-green-500" />
            <span className="text-xs font-mono text-slate-400 ml-2">ssh root@matrix-virtual-node:~</span>
          </div>

          <div className="flex items-center gap-2">
            <button 
              onClick={() => setActiveTab('console')} 
              className={`text-xs px-3 py-1 rounded-md font-mono ${activeTab === 'console' ? 'bg-white/10 text-white' : 'text-slate-400 hover:text-white'}`}
            >
              active-terminal
            </button>
            <button 
              onClick={() => setActiveTab('install')} 
              className={`text-xs px-3 py-1 rounded-md font-mono ${activeTab === 'install' ? 'bg-white/10 text-white' : 'text-slate-400 hover:text-white'}`}
            >
              install.log
            </button>
          </div>
        </div>

        {/* Terminal screen */}
        <div className="flex-1 p-5 bg-black/60 font-mono text-xs overflow-y-auto leading-relaxed select-text min-h-[300px]">
          {activeTab === 'console' ? (
            <div className="space-y-1">
              <p className="text-slate-500 font-semibold mb-2">
                # Matrix Stack Manager CLI Terminal - Connected to secure Node WebSocket
              </p>
              
              {logs.map((log, index) => (
                <div key={index} className="whitespace-pre-wrap">
                  {formatLogLine(log)}
                </div>
              ))}

              {isExecuting && (
                <div className="flex items-center gap-2 text-indigo-400 mt-2">
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  <span>Streaming stdout/stderr from backend process...</span>
                </div>
              )}

              <div ref={terminalEndRef} />
            </div>
          ) : (
            <div className="space-y-1 text-slate-400">
              <p className="text-slate-500 mb-2"># Reading /var/log/matrix_stack_install.log (Last 50 entries)</p>
              <p className="text-slate-300">Initial preflight checks successfully completed.</p>
              <p className="text-slate-300">Database setup finalized with Postgres user role.</p>
              <p className="text-emerald-400">✅ Synapse package v1.98.0 initialized and launched on port 8008.</p>
              <p className="text-emerald-400">✅ Element Web client configured with self-signed TLS profiles.</p>
            </div>
          )}
        </div>

        {/* Terminal Input Bar */}
        <form onSubmit={handleCustomSubmit} className="p-3 bg-black/40 border-t border-white/5 flex items-center gap-3">
          <span className="text-indigo-400 font-mono text-xs pl-2 select-none">root@matrix-node:~#</span>
          <input
            type="text"
            value={customInput}
            onChange={(e) => setCustomInput(e.target.value)}
            disabled={isExecuting || isViewer}
            placeholder={
              isViewer 
                ? "Unauthorized: Viewer role can't input console commands"
                : "Type custom action (install, backup, workers, e2ee_disable) and press Enter..."
            }
            className="flex-1 bg-transparent text-slate-100 font-mono text-xs outline-none border-none focus:ring-0 placeholder:text-slate-600 disabled:opacity-50"
            id="terminal-input"
          />
          <button 
            type="submit" 
            disabled={isExecuting || isViewer || !customInput.trim()}
            className="p-1.5 rounded-lg bg-rose-500/10 text-rose-400 border border-rose-500/10 hover:bg-rose-500/20 disabled:opacity-40"
          >
            <ArrowUpRight className="w-4 h-4" />
          </button>
        </form>
      </div>
    </div>
  );
}
