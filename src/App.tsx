/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useState, useRef } from 'react';
import { 
  ShieldCheck, 
  Cpu, 
  Database, 
  Terminal as TermIcon, 
  BarChart3, 
  Lock, 
  User, 
  Users,
  CheckCircle2, 
  AlertTriangle, 
  Server, 
  HardDrive, 
  Activity, 
  Network, 
  FileText, 
  Undo2, 
  Globe, 
  Play, 
  RefreshCw, 
  UserPlus, 
  ShieldCheck as Shield,
  Languages,
  Video,
  ShieldAlert,
  Sun,
  Moon,
  ArrowRight
} from 'lucide-react';
import SpatialDock from './components/SpatialDock';
import MetricCard from './components/MetricCard';
import TerminalPanel from './components/TerminalPanel';
import ConfigForms from './components/ConfigForms';
import ReportingPanel from './components/ReportingPanel';
import KetesaAdmin from './components/KetesaAdmin';
import ConnectionManager from './components/ConnectionManager';
import { SystemStats, ServiceState, PanelUser, AuditLog, BackupItem, UndoItem, MatrixConfig, LDAPConfig, MatrixUser } from './types';

// Translation Dictionary for Persian (Default) & English
const translations = {
  fa: {
    title: "پنل مدیریت پیشرفته ماتریکس",
    subtitle: "رابط کاربری فضایی (Spatial UI) - مدیریت آنی سرور ماتریکس، المنت و کانال‌های ارتباطی",
    loginTitle: "پنل مدیریت یکپارچه ماتریکس",
    loginSubtitle: "درگاه امن ورود به پنل مدیریت ماتریکس (Synapse)، کلاینت المنت و سرور TURN",
    username: "نام کاربری",
    password: "رمز عبور",
    loginBtn: "لاگین",
    logoutBtn: "خروج",
    liveStatus: "وضعیت سرور: متصل",
    checkingStatus: "در حال به روز رسانی...",
    cpuLoad: "بار پردازنده",
    ramUsage: "رم مصرفی",
    diskUsage: "فضای دیسک",
    activeSessions: "نشست‌های ماتریکس",
    servicesState: "وضعیت سرویس‌های لینوکس",
    logsTitle: "گزارشات آنی سرور (WebSockets)",
    terminalTitle: "کنسول خط فرمان لینوکس",
    saveSuccess: "تغییرات با موفقیت در دیتابیس نود جی‌اس ذخیره و همگام‌سازی شد.",
    testLdapBtn: "تست اتصال اکتیو دایرکتوری",
    e2eeLock: "قفل و غیرفعال‌سازی رمزگذاری سرتاسری (E2EE) در کل سازمان",
    e2eeUnlock: "فعال‌سازی رمزگذاری سرتاسری (E2EE)",
    autoReporting: "تحلیل بلادرنگ و گزارش‌گیری خودکار عملکرد",
    roleManage: "سیستم مدیریت دسترسی و نقش‌ها (RBAC)",
    unauthorized: "دسترسی غیرمجاز: نقش شما اجازه انجام این کار را نمی‌دهد.",
    runningTask: "در حال اجرای دستور روی سرور...",
    backupCreated: "پشتیبان‌گیری جدید با موفقیت ایجاد شد.",
    undoSuccess: "آخرین تغییر پیکربندی با موفقیت بازگردانی شد.",
    themeToggle: "تغییر تم (روشن/تاریک)"
  },
  en: {
    title: "Matrix Stack Manager",
    subtitle: "Spatial UI Design - Real-time Management Panel for Matrix Synapse, Element & TURN",
    loginTitle: "Matrix Stack Manager",
    loginSubtitle: "Secure access gateway for Matrix Synapse core, Element Client, and TURN server",
    username: "Username",
    password: "Password",
    loginBtn: "Login",
    logoutBtn: "Logout",
    liveStatus: "Server State: Connected",
    checkingStatus: "Syncing data...",
    cpuLoad: "CPU Usage",
    ramUsage: "Memory Usage",
    diskUsage: "Disk Occupied",
    activeSessions: "Active Users",
    servicesState: "Linux Service Statuses",
    logsTitle: "Live Server Logs (WebSockets)",
    terminalTitle: "Linux Secure Shell Console",
    saveSuccess: "Configurations saved and synced with Node.js in real-time.",
    testLdapBtn: "Test Active Directory Bind",
    e2eeLock: "Lock & Disable End-to-End Encryption (E2EE) Org-Wide",
    e2eeUnlock: "Enable End-to-End Encryption (E2EE)",
    autoReporting: "Real-time Analysis & Automated Reporting",
    roleManage: "Role-Based Access Control System (RBAC)",
    unauthorized: "Unauthorized: Your role does not have privileges for this action.",
    runningTask: "Executing server-side scripts...",
    backupCreated: "New full-archive backup created successfully.",
    undoSuccess: "Last configuration change reverted successfully.",
    themeToggle: "Toggle Theme (Light/Dark)"
  }
};

export default function App() {
  const [lang, setLang] = useState<'fa' | 'en'>((localStorage.getItem('lang_pref') as 'fa' | 'en') || 'en');
  const t = translations[lang];

  // Theme State
  const [isLightMode, setIsLightMode] = useState<boolean>(localStorage.getItem('theme_mode') === 'light');

  const toggleTheme = () => {
    setIsLightMode(prev => {
      const next = !prev;
      localStorage.setItem('theme_mode', next ? 'light' : 'dark');
      return next;
    });
  };

  // Auth States
  const [authToken, setAuthToken] = useState<string | null>(localStorage.getItem('admin_token'));
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [loginUser, setLoginUser] = useState('');
  const [loginPass, setLoginPass] = useState('');
  const [loginError, setLoginError] = useState('');

  // Live Metric and VFS state
  const [stats, setStats] = useState<SystemStats | null>(null);
  const [services, setServices] = useState<ServiceState[]>([
    { id: 'synapse', name: 'matrix-synapse', displayName: 'Matrix Synapse Server', status: 'active', port: 8008, version: '1.98.0' },
    { id: 'element', name: 'nginx-element', displayName: 'Element Web client', status: 'active', port: 443 },
    { id: 'postgres', name: 'postgresql', displayName: 'PostgreSQL Database', status: 'active', port: 5432 },
    { id: 'coturn', name: 'coturn', displayName: 'coturn TURN Server', status: 'active', port: 3478 },
    { id: 'redis', name: 'redis-server', displayName: 'Redis Worker Queue', status: 'inactive' },
    { id: 'nginx', name: 'nginx', displayName: 'Nginx Web Proxy', status: 'active', port: 80 },
    { id: 'fail2ban', name: 'fail2ban', displayName: 'fail2ban Brute Protection', status: 'active' },
    { id: 'prometheus', name: 'prometheus', displayName: 'Prometheus Monitoring', status: 'inactive', port: 9090 }
  ]);
  const [loadingServices, setLoadingServices] = useState<Record<string, 'start' | 'stop' | 'restart' | null>>({});

  // Configurations, user accounts, audit and backup states
  const [config, setConfig] = useState<MatrixConfig>({
    HS_DOMAIN: 'matrix.company.local',
    ELEMENT_DOMAIN: 'chat.company.local',
    BASE_DOMAIN: 'company.local',
    PUBLIC_IP: '192.168.1.100',
    LE_EMAIL: 'admin@company.local',
    SSL_MODE: 'selfsigned',
    PG_DB: 'synapse',
    PG_USER: 'synapse_user',
    PG_HOST: 'localhost',
    PG_PORT: '5432',
    PG_PASS: ''
  });
  const [ldap, setLdap] = useState<LDAPConfig>({
    enabled: false,
    uri: 'ldap://ldap.company.local:389',
    base: 'ou=users,dc=company,dc=local',
    mode: 'search',
    start_tls: false,
    bind_dn: 'cn=svc-matrix,dc=company,dc=local',
    uid_attr: 'sAMAccountName',
    mail_attr: 'mail',
    name_attr: 'cn'
  });
  const [workers, setWorkers] = useState<any>({
    enabled: false,
    count: 2,
    federationSender: false,
    basePort: 8083
  });
  const [matrixUsers, setMatrixUsers] = useState<MatrixUser[]>([]);
  const [panelUsers, setPanelUsers] = useState<PanelUser[]>([]);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const [backups, setBackups] = useState<BackupItem[]>([]);
  const [undoHistory, setUndoHistory] = useState<UndoItem[]>([]);

  // Connection Profile states
  const [connections, setConnections] = useState<any[]>([]);
  const [activeConnection, setActiveConnection] = useState<any>({ id: 'local', name: 'Local Server (This Machine)', host: 'localhost', isActive: true });
  const [isRefreshingStats, setIsRefreshingStats] = useState(false);

  const handleRefreshStats = () => {
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      setIsRefreshingStats(true);
      wsRef.current.send(JSON.stringify({ type: 'request_metrics' }));
      fetchMatrixUsers();
      fetchLogs();
      fetchConfig();
      setTimeout(() => {
        setIsRefreshingStats(false);
        showToast('success', 'Dashboard stats and connection telemetry refreshed successfully!');
      }, 1000);
    } else {
      showToast('error', 'WebSocket is currently disconnected. Please wait.');
    }
  };

  // Navigation and terminal/command execution states
  const [activeView, setActiveView] = useState('dashboard');
  const [terminalLogs, setTerminalLogs] = useState<string[]>([
    "System Shell Monitor Initialized. Welcome to Matrix Stack Manager."
  ]);
  const [isExecuting, setIsExecuting] = useState(false);
  const [toastMessage, setToastMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

  // WebSocket reference
  const wsRef = useRef<WebSocket | null>(null);

  // Fetch Panel Database on boot and check token verification
  useEffect(() => {
    if (authToken) {
      // Check auth token validity
      fetch('/api/auth/verify', {
        headers: { 'Authorization': `Bearer ${authToken}` }
      })
      .then(res => {
        if (!res.ok) throw new Error("Invalid token");
        return res.json();
      })
      .then(data => {
        setCurrentUser(data.user);
        fetchConfig(authToken);
        fetchLogs(authToken);
        fetchPanelUsers(authToken);
        fetchMatrixUsers(authToken);
        fetchBackups(authToken);
        setupWebSocket(authToken);
        fetchConnections(authToken);
      })
      .catch(() => {
        handleLogout();
      });
    }
  }, [authToken]);

  // Set up WebSocket connection for real-time telemetry and CLI stream
  const setupWebSocket = (token: string) => {
    if (wsRef.current) wsRef.current.close();

    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const wsUrl = `${protocol}//${window.location.host}/ws?token=${token}`;
    const ws = new WebSocket(wsUrl);

    ws.onopen = () => {
      console.log("WebSocket connection established successfully.");
    };

    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);

      if (data.type === 'metrics') {
        setStats(data.stats);
        if (data.stats && data.stats.services) {
          setServices(prev => prev.map(s => {
            const updated = data.stats.services.find((us: any) => us.id === s.id);
            return updated ? { ...s, status: updated.status } : s;
          }));
        }
      } else if (data.type === 'cmd_stdout') {
        setTerminalLogs(prev => [...prev, data.text]);
      } else if (data.type === 'cmd_start') {
        setIsExecuting(true);
        setTerminalLogs(prev => [...prev, `\nroot@matrix-node:~# executing ${data.command}...`]);
      } else if (data.type === 'cmd_end') {
        setIsExecuting(false);
        setTerminalLogs(prev => [...prev, `\nCommand executed successfully. Exit code: ${data.code}`]);
        // Re-sync all configurations
        fetchConfig();
        fetchLogs();
        fetchBackups();
      } else if (data.type === 'cmd_err') {
        setIsExecuting(false);
        setTerminalLogs(prev => [...prev, `\n❌ ERROR: ${data.text}`]);
      } else if (data.type === 'error') {
        showToast('error', data.message);
      }
    };

    ws.onclose = () => {
      console.log("WebSocket connection closed. Reconnecting in 5s...");
      setTimeout(() => {
        if (localStorage.getItem('admin_token')) {
          setupWebSocket(token);
        }
      }, 5000);
    };

    wsRef.current = ws;
  };

  // Fetch functions for panel REST API
  const fetchConfig = (token = authToken) => {
    if (!token) return;
    fetch('/api/matrix/config', { headers: { 'Authorization': `Bearer ${token}` } })
      .then(res => res.json())
      .then(data => {
        setConfig(data.config);
        setLdap(data.ldap);
        if (data.workers) {
          setWorkers(data.workers);
        }
        // Sync workers on UI from config
        setServices(prev => prev.map(s => {
          if (s.id === 'redis') {
            return { ...s, status: data.workers?.enabled ? 'active' : 'inactive' };
          }
          return s;
        }));
      });
  };

  const fetchLogs = (token = authToken) => {
    if (!token) return;
    fetch('/api/logs/audit', { headers: { 'Authorization': `Bearer ${token}` } })
      .then(res => res.json())
      .then(data => setAuditLogs(data));
  };

  const fetchPanelUsers = (token = authToken) => {
    if (!token) return;
    fetch('/api/users', { headers: { 'Authorization': `Bearer ${token}` } })
      .then(res => res.json())
      .then(data => setPanelUsers(data));
  };

  const fetchConnections = (token = authToken) => {
    if (!token) return;
    fetch('/api/connections', { headers: { 'Authorization': `Bearer ${token}` } })
      .then(res => res.json())
      .then(data => {
        setConnections(data);
        const active = data.find((c: any) => c.isActive);
        setActiveConnection(active || { id: 'local', name: 'Local Server (This Machine)', host: 'localhost', isActive: true });
      })
      .catch(err => console.error("Error fetching connections:", err));
  };

  const fetchMatrixUsers = (token = authToken) => {
    if (!token) return;
    fetch('/api/matrix/users', { headers: { 'Authorization': `Bearer ${token}` } })
      .then(res => res.json())
      .then(data => setMatrixUsers(data));
  };

  const fetchBackups = (token = authToken) => {
    if (!token) return;
    fetch('/api/backups', { headers: { 'Authorization': `Bearer ${token}` } })
      .then(res => res.json())
      .then(data => setBackups(data));
  };

  // Login handler
  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError('');

    fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username: loginUser.trim(), password: loginPass })
    })
    .then(async res => {
      if (!res.ok) {
        let errMsg = "Invalid username or password";
        try {
          const errData = await res.json();
          errMsg = errData.error || errData.detail || errMsg;
        } catch (_) {}
        throw new Error(errMsg);
      }
      return res.json();
    })
    .then(data => {
      localStorage.setItem('admin_token', data.token);
      setCurrentUser(data.user);
      setAuthToken(data.token);
      setLoginUser('');
      setLoginPass('');
      
      // Instantly load data using the freshly acquired token
      fetchConfig(data.token);
      fetchLogs(data.token);
      fetchPanelUsers(data.token);
      fetchMatrixUsers(data.token);
      fetchBackups(data.token);
      setupWebSocket(data.token);
    })
    .catch(err => {
      setLoginError(err.message);
    });
  };

  // Logout handler
  const handleLogout = () => {
    localStorage.removeItem('admin_token');
    setAuthToken(null);
    setCurrentUser(null);
    if (wsRef.current) wsRef.current.close();
    setActiveView('dashboard');
  };

  const showToast = (type: 'success' | 'error', text: string) => {
    setToastMessage({ type, text });
    setTimeout(() => setToastMessage(null), 4000);
  };

  // REST mutations
  const handleSaveConfig = (data: { config?: Partial<MatrixConfig>; ldap?: Partial<LDAPConfig>; workers?: any }) => {
    fetch('/api/matrix/config/save', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${authToken}`
      },
      body: JSON.stringify(data)
    })
    .then(res => {
      if (!res.ok) throw new Error("Could not save configuration settings.");
      return res.json();
    })
    .then(() => {
      showToast('success', t.saveSuccess);
      fetchConfig();
      fetchLogs();
    })
    .catch(err => showToast('error', err.message));
  };

  const handleRegisterMatrixUser = (username: string, pass: string, isAdmin: boolean) => {
    fetch('/api/matrix/users/register', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${authToken}`
      },
      body: JSON.stringify({ username, password: pass, isAdmin })
    })
    .then(res => {
      if (!res.ok) throw new Error("User already exists or registration failed.");
      return res.json();
    })
    .then(() => {
      showToast('success', "Matrix user registered successfully on local Homeserver.");
      fetchMatrixUsers();
      fetchLogs();
    })
    .catch(err => showToast('error', err.message));
  };

  const handleDeactivateMatrixUser = (mxid: string) => {
    fetch('/api/matrix/users/deactivate', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${authToken}`
      },
      body: JSON.stringify({ mxid })
    })
    .then(res => res.json())
    .then(() => {
      showToast('success', "Matrix user deactivated successfully.");
      fetchMatrixUsers();
      fetchLogs();
    });
  };

  const handleReactivateMatrixUser = (mxid: string, pass: string, isAdmin: boolean) => {
    fetch('/api/matrix/users/reactivate', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${authToken}`
      },
      body: JSON.stringify({ mxid, password: pass, isAdmin })
    })
    .then(res => res.json())
    .then(() => {
      showToast('success', "Matrix user reactivated with new credentials.");
      fetchMatrixUsers();
      fetchLogs();
    });
  };

  const handleCreatePanelUser = (username: string, email: string, pass: string, role: string) => {
    fetch('/api/users', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${authToken}`
      },
      body: JSON.stringify({ username, email, password: pass, role })
    })
    .then(res => {
      if (!res.ok) throw new Error("Failed to create panel administrator.");
      return res.json();
    })
    .then(() => {
      showToast('success', "Panel Administrator authorized successfully.");
      fetchPanelUsers();
      fetchLogs();
    })
    .catch(err => showToast('error', err.message));
  };

  const handleChangeUserRole = (id: string, role: string) => {
    fetch(`/api/users/${id}/role`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${authToken}`
      },
      body: JSON.stringify({ role })
    })
    .then(res => {
      if (!res.ok) throw new Error("Failed to modify panel role.");
      return res.json();
    })
    .then(() => {
      showToast('success', "Administrator role updated successfully.");
      fetchPanelUsers();
      fetchLogs();
    })
    .catch(err => showToast('error', err.message));
  };

  const handleDeletePanelUser = (id: string) => {
    fetch(`/api/users/${id}`, {
      method: 'DELETE',
      headers: { 'Authorization': `Bearer ${authToken}` }
    })
    .then(res => {
      if (!res.ok) throw new Error("Failed to delete user.");
      return res.json();
    })
    .then(() => {
      showToast('success', "Administrator access revoked.");
      fetchPanelUsers();
      fetchLogs();
    })
    .catch(err => showToast('error', err.message));
  };

  const handleCreateBackup = (includeSSL: boolean) => {
    fetch('/api/backups/create', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${authToken}`
      },
      body: JSON.stringify({ includeSSL })
    })
    .then(res => res.json())
    .then(() => {
      showToast('success', t.backupCreated);
      fetchBackups();
      fetchLogs();
    });
  };

  const handleDeleteBackup = (id: string) => {
    fetch(`/api/backups/${id}`, {
      method: 'DELETE',
      headers: { 'Authorization': `Bearer ${authToken}` }
    })
    .then(res => res.json())
    .then(() => {
      showToast('success', "Archived backup purged from disk storage.");
      fetchBackups();
      fetchLogs();
    });
  };

  const handleExecuteCommand = (command: string) => {
    if (!wsRef.current || isExecuting) return;
    wsRef.current.send(JSON.stringify({ type: 'execute_command', command }));
    setActiveView('terminal');
  };

  // Linux service controls (Start/Stop/Restart)
  const handleServiceAction = (serviceId: string, action: 'start' | 'stop' | 'restart') => {
    if (currentUser?.role === 'Viewer') {
      showToast('error', t.unauthorized);
      return;
    }

    setLoadingServices(prev => ({ ...prev, [serviceId]: action }));

    fetch('/api/services/action', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${authToken}`
      },
      body: JSON.stringify({ serviceId, action })
    })
    .then(res => {
      if (!res.ok) {
        return res.json().then(err => {
          throw new Error(err.error || err.detail || 'Service control failed');
        });
      }
      return res.json();
    })
    .then(data => {
      if (data.success) {
        showToast('success', `Service ${serviceId} successfully executed ${action}.`);
        setServices(prev => prev.map(s => {
          if (s.id === serviceId) {
            return { 
              ...s, 
              status: action === 'start' || action === 'restart' ? 'active' : 'inactive' 
            };
          }
          return s;
        }));
        fetchLogs();
      }
    })
    .catch(err => {
      showToast('error', `Failed to execute ${action} on ${serviceId}: ${err.message}`);
    })
    .finally(() => {
      setLoadingServices(prev => ({ ...prev, [serviceId]: null }));
    });
  };

  return (
    <div className={`min-h-screen relative flex flex-col justify-between ${isLightMode ? 'theme-light' : ''} ${lang === 'fa' ? 'rtl font-sans' : 'ltr font-sans'}`}>
      {/* Background neon visual noise */}
      <div className="ambient-glow-background" />

      {/* Global Notifications Toast */}
      {toastMessage && (
        <div className="fixed top-6 right-6 z-50 animate-bounce">
          <div className={`px-5 py-3.5 rounded-2xl border text-sm font-semibold flex items-center gap-3 shadow-2xl backdrop-blur-md ${
            toastMessage.type === 'success' 
              ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' 
              : 'bg-red-500/10 border-red-500/20 text-red-400'
          }`}>
            <Shield className="w-5 h-5 shrink-0" />
            <span>{toastMessage.text}</span>
          </div>
        </div>
      )}

      {/* VIEW: UNAUTHENTICATED LOGIN CARD */}
      {!authToken ? (
        <div className="flex-1 flex items-center justify-center p-6 min-h-[80vh]">
          <div className="spatial-glass max-w-md w-full rounded-3xl p-8 border border-white/10 shadow-[0_30px_70px_rgba(0,0,0,0.6)] spatial-depth-card relative overflow-hidden">
            {/* Upper Right Quick Controls */}
            <div className="absolute top-6 right-6 flex items-center gap-2 z-10">
              <button
                onClick={() => {
                  const nextLang = lang === 'fa' ? 'en' : 'fa';
                  setLang(nextLang);
                  localStorage.setItem('lang_pref', nextLang);
                }}
                title={lang === 'fa' ? 'Change language to English' : 'تغییر زبان به فارسی'}
                className="p-1.5 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition-all text-slate-400 hover:text-white flex items-center gap-1.5 text-xs font-semibold cursor-pointer"
              >
                <Languages className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
                <span>{lang === 'fa' ? 'EN' : 'FA'}</span>
              </button>
              <button
                onClick={toggleTheme}
                title={t.themeToggle}
                className="p-1.5 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition-all text-slate-400 hover:text-white cursor-pointer"
              >
                {isLightMode ? <Moon className="w-3.5 h-3.5 text-purple-400" /> : <Sun className="w-3.5 h-3.5 text-amber-400" />}
              </button>
            </div>

            {/* Premium Aesthetic Glowing backdrops inside card */}
            <div className="absolute -top-16 -left-16 w-36 h-36 bg-gradient-to-br from-indigo-500/20 to-cyan-500/20 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute -bottom-16 -right-16 w-36 h-36 bg-gradient-to-br from-purple-500/20 to-pink-500/20 rounded-full blur-3xl pointer-events-none" />

            {/* Matrix Decorative Grid Background overlay inside card */}
            <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.01)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.01)_1px,transparent_1px)] bg-[size:16px_16px] [mask-image:radial-gradient(ellipse_at_center,black_60%,transparent_100%)] pointer-events-none" />

            <div className="flex flex-col items-center text-center mb-8 relative">
              <div className="w-16 h-16 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400 shadow-[0_0_20px_rgba(99,102,241,0.2)] pulse-glow-cyan mb-4 animate-float">
                <ShieldCheck className="w-8 h-8" />
              </div>
              <h2 className="text-2xl font-display font-bold text-white tracking-tight glow-text-cyan">{t.loginTitle}</h2>
              <p className="text-xs text-slate-400 mt-2 leading-relaxed max-w-sm">{t.loginSubtitle}</p>
            </div>

            {loginError && (
              <div className="p-3.5 rounded-2xl bg-red-500/10 border border-red-500/20 text-red-400 text-xs font-semibold text-center mb-6 flex items-center justify-center gap-2 animate-pulse">
                <AlertTriangle className="w-4 h-4 shrink-0" />
                <span>{loginError}</span>
              </div>
            )}

            <form onSubmit={handleLoginSubmit} className="space-y-5 relative">
              <div>
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1.5">{t.username}</label>
                <div className="relative group">
                  <User className="w-4 h-4 text-slate-500 group-focus-within:text-indigo-400 absolute left-4 top-1/2 -translate-y-1/2 transition-colors" />
                  <input
                    type="text"
                    value={loginUser}
                    onChange={(e) => setLoginUser(e.target.value)}
                    required
                    className="w-full bg-black/40 border border-white/10 focus:border-indigo-500/50 rounded-xl pl-11 pr-4 py-3 text-sm text-slate-100 outline-none transition-all focus:ring-2 focus:ring-indigo-500/15"
                    placeholder={lang === 'fa' ? "مثال: admin" : "e.g. admin"}
                    id="username-input"
                  />
                </div>
              </div>

              <div>
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1.5">{t.password}</label>
                <div className="relative group">
                  <Lock className="w-4 h-4 text-slate-500 group-focus-within:text-indigo-400 absolute left-4 top-1/2 -translate-y-1/2 transition-colors" />
                  <input
                    type="password"
                    value={loginPass}
                    onChange={(e) => setLoginPass(e.target.value)}
                    required
                    className="w-full bg-black/40 border border-white/10 focus:border-indigo-500/50 rounded-xl pl-11 pr-4 py-3 text-sm text-slate-100 outline-none transition-all focus:ring-2 focus:ring-indigo-500/15"
                    placeholder="••••••••"
                    id="password-input"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-3.5 rounded-xl bg-gradient-to-br from-indigo-500 via-indigo-600 to-purple-600 text-white font-bold text-sm tracking-wide shadow-[0_4px_25px_rgba(99,102,241,0.3)] hover:scale-[1.02] active:scale-[0.98] hover:shadow-[0_4px_30px_rgba(99,102,241,0.45)] transition-all mt-6 cursor-pointer"
              >
                {t.loginBtn}
              </button>
            </form>

            {/* Quick Demo Credentials Panel */}
            <div className="mt-6 pt-5 border-t border-white/5 relative">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-3 text-center">
                {lang === 'fa' ? "اکانت‌های دمو (ورود سریع با یک کلیک):" : "Quick Demo Accounts (1-Click Fill):"}
              </span>
              <div className="grid grid-cols-2 gap-2.5">
                <button
                  type="button"
                  onClick={() => {
                    setLoginUser("admin");
                    setLoginPass("admin1234");
                  }}
                  className="px-3 py-2.5 rounded-xl bg-indigo-500/5 hover:bg-indigo-500/10 border border-indigo-500/10 hover:border-indigo-500/20 text-[11px] font-mono font-semibold text-indigo-400 hover:text-indigo-300 transition-all text-center flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <ShieldCheck className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
                  <span>admin (Owner)</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setLoginUser("masoud");
                    setLoginPass("masoud1234");
                  }}
                  className="px-3 py-2.5 rounded-xl bg-purple-500/5 hover:bg-purple-500/10 border border-purple-500/10 hover:border-purple-500/20 text-[11px] font-mono font-semibold text-purple-400 hover:text-purple-300 transition-all text-center flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <User className="w-3.5 h-3.5 text-purple-400 shrink-0" />
                  <span>masoud (Super)</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      ) : (
        /* MAIN PANEL DASHBOARD LAYOUT */
        <div className="flex-1 flex flex-col pb-28">
          
          {/* Top Spatial Header bar */}
          <header className="px-6 py-4 bg-black/20 backdrop-blur-sm border-b border-white/5 flex items-center justify-between sticky top-0 z-40">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400 shadow-[0_0_10px_rgba(99,102,241,0.1)]">
                <Server className="w-5 h-5" />
              </div>
              <div>
                <h1 className="text-lg font-display font-bold text-white flex items-center gap-2">
                  {t.title}
                  <span className={`inline-block w-2 h-2 rounded-full ${activeConnection?.id !== 'local' ? 'bg-emerald-500 shadow-[0_0_8px_#10b981]' : 'bg-indigo-500 shadow-[0_0_8px_#6366f1]'} animate-ping`} />
                </h1>
                <p className="text-[10px] text-slate-400 uppercase tracking-wider">
                  {activeConnection?.id !== 'local' ? `Connected: ${activeConnection?.name}` : t.liveStatus}
                </p>
              </div>
            </div>

            {/* Middle: Theme Switcher & User Indicator */}
            <div className="flex items-center gap-4">
              {/* Theme Switcher */}
              <button
                onClick={toggleTheme}
                title={t.themeToggle}
                className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 text-xs transition-all"
              >
                {isLightMode ? (
                  <>
                    <Moon className="w-4 h-4 text-purple-400" />
                    <span className="font-semibold">Dark Theme</span>
                  </>
                ) : (
                  <>
                    <Sun className="w-4 h-4 text-amber-400" />
                    <span className="font-semibold">Light Theme</span>
                  </>
                )}
              </button>

              {/* User Avatar */}
              {currentUser && (
                <div className="flex items-center gap-3 border-l border-white/10 pl-4">
                  <div className="text-right">
                    <span className="text-xs font-semibold text-white block">@{currentUser.username}</span>
                    <span className="text-[10px] text-slate-400 block font-mono">{currentUser.role}</span>
                  </div>
                  <img 
                    src={currentUser.avatar || `https://api.dicebear.com/7.x/bottts/svg?seed=${currentUser.username}`} 
                    alt={currentUser.username}
                    className="w-9 h-9 rounded-xl bg-slate-800 border border-white/10 p-0.5"
                  />
                </div>
              )}
            </div>
          </header>

          {/* Dynamic Dashboard Section View Container */}
          <main className="flex-1 p-6 max-w-7xl mx-auto w-full">
            
            {/* VIEW 1: CENTRAL METRICS DASHBOARD */}
            {activeView === 'dashboard' && (
              <div className="space-y-6">
                
                {/* Active Connection Banner / Onboarding */}
                {activeConnection?.id === 'local' ? (
                  <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-indigo-950/40 via-purple-950/20 to-slate-900/40 border border-indigo-500/20 p-6 md:p-8 shadow-[0_10px_30px_rgba(99,102,241,0.05)]">
                    <div className="absolute top-0 right-0 w-80 h-80 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
                    <div className="absolute bottom-0 left-0 w-40 h-40 bg-purple-500/5 rounded-full blur-2xl pointer-events-none" />
                    
                    <div className="relative flex flex-col md:flex-row md:items-center md:justify-between gap-6">
                      <div className="space-y-2">
                        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-xs font-semibold text-indigo-300">
                          <Globe className="w-3.5 h-3.5 animate-spin" style={{ animationDuration: '6s' }} />
                          <span>Local Sandbox Mode</span>
                        </div>
                        <h2 className="text-xl md:text-2xl font-display font-extrabold text-white tracking-tight">
                          Connect Your Remote Matrix/Element Server
                        </h2>
                        <p className="text-sm text-slate-400 max-w-2xl leading-relaxed">
                          This control panel is currently running in fallback Sandbox mode. Establish a secure SSH and Database connection profile to start managing your active Matrix homeserver services, config files, user registration, rooms, and live telemetry on your production VPS.
                        </p>
                      </div>
                      
                      <button
                        onClick={() => setActiveView('connections')}
                        className="px-6 py-3.5 rounded-2xl bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white text-sm font-bold shadow-[0_4px_20px_rgba(99,102,241,0.25)] hover:scale-[1.02] active:scale-[0.98] transition-all shrink-0 cursor-pointer flex items-center justify-center gap-2"
                      >
                        <span>Connect Remote Server</span>
                        <ArrowRight className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-emerald-950/10 to-teal-950/10 border border-emerald-500/20 p-5 md:p-6 shadow-[0_10px_30px_rgba(16,185,129,0.03)]">
                    <div className="relative flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 shrink-0">
                          <Server className="w-6 h-6 animate-pulse" />
                        </div>
                        <div>
                          <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2">
                            <span>Connected Server Profile</span>
                            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                          </h3>
                          <p className="text-md font-bold text-emerald-400 font-mono mt-0.5">
                            {activeConnection?.name} ({activeConnection?.host}:{activeConnection?.port})
                          </p>
                          <p className="text-xs text-slate-400 mt-1">
                            Matrix homeserver, Element client, and Postgres Database are actively being managed over SSH tunnel.
                          </p>
                        </div>
                      </div>
                      
                      <div className="flex flex-col sm:flex-row gap-2 shrink-0">
                        <button
                          onClick={handleRefreshStats}
                          disabled={isRefreshingStats}
                          className="px-4 py-2.5 rounded-xl bg-teal-500/10 border border-teal-500/20 hover:bg-teal-500/20 text-xs font-semibold text-teal-300 hover:text-white transition-all cursor-pointer flex items-center justify-center gap-1.5 disabled:opacity-50"
                        >
                          <RefreshCw className={`w-3.5 h-3.5 ${isRefreshingStats ? 'animate-spin' : ''}`} />
                          <span>{isRefreshingStats ? 'Refreshing...' : 'Refresh Stats'}</span>
                        </button>
                        
                        <button
                          onClick={() => setActiveView('connections')}
                          className="px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 text-xs font-semibold text-slate-300 hover:text-white transition-all cursor-pointer flex items-center justify-center gap-1.5"
                        >
                          <span>Switch Profile</span>
                          <ArrowRight className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                )}
                
                {/* Real-time stats bento grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                  <MetricCard
                    title={t.cpuLoad}
                    value={`${stats ? stats.cpuUsage : 0}%`}
                    subtext="Real-time Node execution load"
                    icon={Cpu}
                    trend={{ value: 2.4, isPositive: false }}
                    glowColor="cyan"
                  />
                  <MetricCard
                    title={t.ramUsage}
                    value={`${stats ? stats.memoryUsage : 0}%`}
                    subtext={`Allocated: ${stats ? (stats.memoryTotal * (stats.memoryUsage / 100)).toFixed(1) : 0} GB`}
                    icon={Activity}
                    trend={{ value: 0.8, isPositive: true }}
                    glowColor="purple"
                  />
                  <MetricCard
                    title={t.diskUsage}
                    value={`${stats ? stats.diskUsage : 0}%`}
                    subtext={`Available: ${stats ? stats.diskFree.toFixed(1) : 0} GB`}
                    icon={HardDrive}
                    glowColor="amber"
                  />
                  <MetricCard
                    title={t.activeSessions}
                    value={stats ? stats.activeUsers : 0}
                    subtext="Connected matrix threads"
                    icon={Users}
                    trend={{ value: 12.5, isPositive: true }}
                    glowColor="emerald"
                  />
                </div>

                {/* Services status and bento components */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  
                  {/* Service status management card */}
                  <div className="lg:col-span-2 spatial-glass rounded-3xl p-6 border border-white/5 flex flex-col justify-between">
                    <div>
                      <h3 className="text-md font-display font-semibold text-white mb-4 flex items-center gap-2">
                        <Server className="w-5 h-5 text-indigo-400" />
                        {t.servicesState}
                      </h3>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {services.map((svc) => (
                          <div key={svc.id} className="p-4 rounded-2xl bg-black/25 border border-white/5 flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <span className={`w-2.5 h-2.5 rounded-full ${
                                svc.status === 'active' 
                                  ? 'bg-emerald-500 shadow-[0_0_8px_#10b981]' 
                                  : 'bg-red-500 shadow-[0_0_8px_#ef4444]'
                              }`} />
                              <div>
                                <h4 className="text-xs font-semibold text-white">{svc.displayName}</h4>
                                <span className="text-[10px] text-slate-400 font-mono">
                                  {svc.name} {svc.port ? `:${svc.port}` : ''}
                                </span>
                              </div>
                            </div>

                            <div className="flex gap-2">
                              {svc.status === 'active' ? (
                                <button
                                  disabled={!!loadingServices[svc.id]}
                                  onClick={() => handleServiceAction(svc.id, 'stop')}
                                  className="text-[10px] bg-red-500/10 hover:bg-red-500/20 border border-red-500/15 text-red-400 px-2 py-1 rounded-lg font-bold flex items-center gap-1 disabled:opacity-50 transition-all duration-200"
                                >
                                  {loadingServices[svc.id] === 'stop' && (
                                    <svg className="animate-spin h-3 w-3 text-red-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3"></circle>
                                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                    </svg>
                                  )}
                                  {loadingServices[svc.id] === 'stop' ? 'Stopping...' : 'Stop'}
                                </button>
                              ) : (
                                <button
                                  disabled={!!loadingServices[svc.id]}
                                  onClick={() => handleServiceAction(svc.id, 'start')}
                                  className="text-[10px] bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/15 text-emerald-400 px-2 py-1 rounded-lg font-bold flex items-center gap-1 disabled:opacity-50 transition-all duration-200"
                                >
                                  {loadingServices[svc.id] === 'start' && (
                                    <svg className="animate-spin h-3 w-3 text-emerald-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3"></circle>
                                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                    </svg>
                                  )}
                                  {loadingServices[svc.id] === 'start' ? 'Starting...' : 'Start'}
                                </button>
                              )}
                              <button
                                disabled={!!loadingServices[svc.id]}
                                onClick={() => handleServiceAction(svc.id, 'restart')}
                                className="text-[10px] bg-white/5 hover:bg-white/10 border border-white/10 text-slate-300 px-2 py-1 rounded-lg flex items-center gap-1 disabled:opacity-50 transition-all duration-200"
                              >
                                {loadingServices[svc.id] === 'restart' && (
                                  <svg className="animate-spin h-3 w-3 text-slate-300" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3"></circle>
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                  </svg>
                                )}
                                {loadingServices[svc.id] === 'restart' ? 'Restarting...' : 'Restart'}
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Right side: Information and logs */}
                  <div className="spatial-glass rounded-3xl p-6 border border-white/5 flex flex-col justify-between">
                    <div>
                      <h3 className="text-md font-display font-semibold text-white mb-4 flex items-center gap-2">
                        <Activity className="w-5 h-5 text-purple-400" />
                        Matrix Connection Details
                      </h3>

                      <div className="space-y-4 text-xs font-mono">
                        <div className="flex justify-between border-b border-white/5 pb-2">
                          <span className="text-slate-400">Homeserver URL:</span>
                          <span className="text-indigo-400 font-semibold">https://{config?.HS_DOMAIN || (activeConnection?.id !== 'local' ? `matrix.${activeConnection?.host}` : 'matrix.company.local')}</span>
                        </div>
                        <div className="flex justify-between border-b border-white/5 pb-2">
                          <span className="text-slate-400">Element App:</span>
                          <span className="text-purple-400 font-semibold">https://{config?.ELEMENT_DOMAIN || (activeConnection?.id !== 'local' ? `chat.${activeConnection?.host}` : 'chat.company.local')}</span>
                        </div>
                        <div className="flex justify-between border-b border-white/5 pb-2">
                          <span className="text-slate-400">Base Domain:</span>
                          <span className="text-slate-200">{config?.BASE_DOMAIN || (activeConnection?.id !== 'local' ? activeConnection?.host : 'company.local')}</span>
                        </div>
                        <div className="flex justify-between border-b border-white/5 pb-2">
                          <span className="text-slate-400">Server Public IP:</span>
                          <span className="text-slate-200">{config?.PUBLIC_IP || (activeConnection?.id !== 'local' ? activeConnection?.host : '127.0.0.1')}</span>
                        </div>
                        <div className="flex justify-between border-b border-white/5 pb-2">
                          <span className="text-slate-400">SSL Profile:</span>
                          <span className="text-amber-400 font-semibold">{(config?.SSL_MODE || 'selfsigned').toUpperCase()}</span>
                        </div>
                        {activeConnection?.id !== 'local' && (
                          <>
                            <div className="flex justify-between border-b border-white/5 pb-2">
                              <span className="text-slate-400">SSH Tunnel:</span>
                              <span className="text-teal-400 font-semibold">{activeConnection?.username}@{activeConnection?.host}:{activeConnection?.port}</span>
                            </div>
                            <div className="flex justify-between border-b border-white/5 pb-2">
                              <span className="text-slate-400">Postgres Target:</span>
                              <span className="text-emerald-400 font-semibold">{activeConnection?.dbUser}@{activeConnection?.dbHost}:{activeConnection?.dbPort}/{activeConnection?.dbName}</span>
                            </div>
                          </>
                        )}
                        <div className="flex justify-between">
                          <span className="text-slate-400">LDAP Bridging:</span>
                          <span className={ldap?.enabled ? "text-emerald-400 font-semibold" : "text-slate-500"}>
                            {ldap?.enabled ? "ENABLED" : "DISABLED"}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="pt-6 mt-6 border-t border-white/5">
                      <div className="flex items-center justify-between">
                        <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Health Diagnostic Test</h4>
                        <button
                          onClick={() => handleExecuteCommand('health_check')}
                          className="px-3 py-1.5 rounded-lg bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-400 border border-indigo-500/20 text-xs font-bold transition-all"
                        >
                          Launch HealthCheck
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* VIEW 2: HOMESERVER CONFIGURATION */}
            {activeView === 'config' && (
              <ConfigForms
                config={config}
                ldap={ldap}
                workers={workers}
                matrixUsers={matrixUsers}
                onSaveConfig={handleSaveConfig}
                onRegisterUser={handleRegisterMatrixUser}
                onDeactivateUser={handleDeactivateMatrixUser}
                onReactivateUser={handleReactivateMatrixUser}
                userRole={currentUser?.role || 'Viewer'}
                authToken={authToken || ''}
              />
            )}

            {/* VIEW - KETESA ADMIN PANEL */}
            {activeView === 'admin' && (
              <KetesaAdmin
                lang={lang}
                authToken={authToken}
                currentUser={currentUser}
                showToast={showToast}
                isLightMode={isLightMode}
              />
            )}

            {/* VIEW 3: MEDIA & VIDEO CALLING CONFS */}
            {activeView === 'video' && (
              <div className="spatial-glass rounded-3xl p-6 border border-white/5 max-w-2xl mx-auto space-y-6">
                <div className="flex items-center gap-3 pb-4 border-b border-white/5">
                  <Video className="w-6 h-6 text-amber-400" />
                  <div>
                    <h2 className="text-xl font-display font-bold text-white">Media & Video Conferencing</h2>
                    <p className="text-xs text-slate-400 font-sans">Point Element Web at self-hosted Jitsi or Element Call instances.</p>
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider block mb-1.5">Preferred Jitsi Domain</label>
                    <input
                      type="text"
                      className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-slate-200 outline-none"
                      defaultValue="meet.jit.si"
                      placeholder="e.g. meet.jit.si"
                      id="jitsi-input"
                    />
                  </div>

                  <div className="p-4 rounded-2xl bg-black/25 border border-white/5 flex items-center justify-between">
                    <div>
                      <h4 className="text-xs font-semibold text-white">Allow Group Video Rooms / Screenshare</h4>
                      <p className="text-[11px] text-slate-400 mt-1">Configures experimental Element Web video rooms capability flag.</p>
                    </div>
                    <button
                      onClick={() => showToast('success', "Updated group call rooms toggle.")}
                      className="px-4 py-1.5 rounded-lg bg-amber-500 text-slate-950 font-bold text-xs shadow-md"
                    >
                      Enable Feature
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* VIEW 4: SECURITY & AUTH LOCKDOWNS */}
            {activeView === 'security' && (
              <div className="spatial-glass rounded-3xl p-6 border border-white/5 max-w-2xl mx-auto space-y-6">
                <div className="flex items-center gap-3 pb-4 border-b border-white/5">
                  <ShieldCheck className="w-6 h-6 text-emerald-400" />
                  <div>
                    <h2 className="text-xl font-display font-bold text-white">Security Controls & E2EE</h2>
                    <p className="text-xs text-slate-400 font-sans">Disable End-to-End Encryption org-wide or setup rate limiting filters.</p>
                  </div>
                </div>

                <div className="p-5 rounded-2xl bg-red-500/5 border border-red-500/10 space-y-4">
                  <div className="flex items-start gap-3 text-red-400">
                    <ShieldAlert className="w-6 h-6 shrink-0 mt-0.5 animate-pulse" />
                    <div>
                      <h3 className="text-sm font-bold font-display uppercase tracking-wider">E2EE Organization Lockdown</h3>
                      <p className="text-xs text-slate-400 mt-2 leading-relaxed font-sans">
                        Locking down homeserver encryption ensures all messages are stored in plain SQL text on the server (accessible via pgAdmin).
                        This disables local client keys backup requests, prevents lost key messages warnings, and enhances enterprise auditing.
                      </p>
                    </div>
                  </div>

                  <div className="flex justify-between items-center pt-2">
                    <span className="text-xs text-slate-400 font-sans font-semibold">Four-layer strict enforcement:</span>
                    <button
                      onClick={() => handleExecuteCommand('e2ee_disable')}
                      disabled={isExecuting || currentUser?.role === 'Viewer' || currentUser?.role === 'Moderator'}
                      className="px-4 py-2 rounded-xl bg-red-500 text-white font-bold text-xs shadow-lg hover:bg-red-600 disabled:opacity-50"
                    >
                      Disable Encryption Org-Wide
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* VIEW 5: BACKUP & ARCHIVING */}
            {activeView === 'backups' && (
              <ReportingPanel
                stats={stats}
                panelUsers={panelUsers}
                auditLogs={auditLogs}
                backups={backups}
                undoHistory={undoHistory}
                onCreatePanelUser={handleCreatePanelUser}
                onChangeUserRole={handleChangeUserRole}
                onDeletePanelUser={handleDeletePanelUser}
                onDeleteBackup={handleDeleteBackup}
                onCreateBackup={handleCreateBackup}
                userRole={currentUser?.role || 'Viewer'}
              />
            )}

            {/* VIEW 6: SHELL TERMINAL CONSOLE */}
            {activeView === 'terminal' && (
              <TerminalPanel
                logs={terminalLogs}
                isExecuting={isExecuting}
                onExecuteCommand={handleExecuteCommand}
                userRole={currentUser?.role || 'Viewer'}
              />
            )}

            {/* VIEW 7: ANALYTICS & REPORTS */}
            {activeView === 'reporting' && (
              <ReportingPanel
                stats={stats}
                panelUsers={panelUsers}
                auditLogs={auditLogs}
                backups={backups}
                undoHistory={undoHistory}
                onCreatePanelUser={handleCreatePanelUser}
                onChangeUserRole={handleChangeUserRole}
                onDeletePanelUser={handleDeletePanelUser}
                onDeleteBackup={handleDeleteBackup}
                onCreateBackup={handleCreateBackup}
                userRole={currentUser?.role || 'Viewer'}
              />
            )}

            {/* VIEW 8: MULTI-SERVER CONNECTION MANAGEMENT */}
            {activeView === 'connections' && (
              <ConnectionManager
                authToken={authToken || ''}
                onProfileChanged={() => {
                  fetchConfig();
                  fetchLogs();
                  fetchPanelUsers();
                  fetchMatrixUsers();
                  fetchBackups();
                  fetchConnections();
                }}
                showToast={showToast}
              />
            )}
          </main>

          {/* Floating Spatial Navigation Control Dock */}
          <SpatialDock 
            activeView={activeView} 
            onViewChange={setActiveView} 
            onLogout={handleLogout}
            userRole={currentUser?.role || 'Viewer'}
          />
        </div>
      )}
    </div>
  );
}
