/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { 
  Settings, 
  Database, 
  Users, 
  Key, 
  Globe, 
  Plus, 
  UserMinus, 
  Check, 
  UserCheck, 
  ShieldAlert, 
  Search, 
  Network,
  Cpu,
  Sliders,
  Mail,
  Layout,
  ShieldCheck,
  Video,
  Activity,
  Terminal,
  RefreshCw,
  CheckCircle,
  XCircle,
  AlertCircle,
  Clock
} from 'lucide-react';
import { MatrixConfig, LDAPConfig, MatrixUser } from '../types';

interface ConfigFormsProps {
  config: MatrixConfig;
  ldap: LDAPConfig;
  workers: {
    enabled: boolean;
    count: number;
    federationSender: boolean;
    basePort: number;
  };
  matrixUsers: MatrixUser[];
  onSaveConfig: (data: { config?: Partial<MatrixConfig>; ldap?: Partial<LDAPConfig>; workers?: any }) => void;
  onRegisterUser: (username: string, pass: string, isAdmin: boolean) => void;
  onDeactivateUser: (mxid: string) => void;
  onReactivateUser: (mxid: string, pass: string, isAdmin: boolean) => void;
  userRole: string;
  authToken: string;
  showToast?: (type: 'success' | 'error', text: string) => void;
  isExecuting?: boolean;
  onExecuteCommand?: (cmd: string) => void;
}

type TabType = 'homeserver' | 'ldap' | 'workers' | 'policies' | 'smtp' | 'client' | 'users' | 'video' | 'security' | 'api';

export default function ConfigForms({ 
  config, 
  ldap, 
  workers,
  matrixUsers, 
  onSaveConfig, 
  onRegisterUser, 
  onDeactivateUser, 
  onReactivateUser,
  userRole,
  authToken,
  showToast,
  isExecuting = false,
  onExecuteCommand
}: ConfigFormsProps) {
  const [activeTab, setActiveTab] = useState<TabType>('homeserver');
  
  // 1. Homeserver Config State
  const [hsDomain, setHsDomain] = useState('');
  const [elDomain, setElDomain] = useState('');
  const [baseDomain, setBaseDomain] = useState('');
  const [publicIp, setPublicIp] = useState('');
  const [leEmail, setLeEmail] = useState('');
  const [sslMode, setSslMode] = useState<'letsencrypt' | 'selfsigned' | 'custom' | 'none'>('selfsigned');
  
  // Database fields
  const [pgDb, setPgDb] = useState('');
  const [pgUser, setPgUser] = useState('');
  const [pgHost, setPgHost] = useState('');
  const [pgPort, setPgPort] = useState('');
  const [pgPass, setPgPass] = useState('');

  // 2. LDAP Config State
  const [ldapEnabled, setLdapEnabled] = useState(false);
  const [ldapUri, setLdapUri] = useState('');
  const [ldapBase, setLdapBase] = useState('');
  const [ldapMode, setLdapMode] = useState<'search' | 'simple'>('search');
  const [ldapStartTls, setLdapStartTls] = useState(false);
  const [ldapBindDn, setLdapBindDn] = useState('');
  const [ldapBindPassword, setLdapBindPassword] = useState('');
  const [ldapActiveDirectory, setLdapActiveDirectory] = useState(false);
  const [ldapUidAttr, setLdapUidAttr] = useState('sAMAccountName');
  const [ldapMailAttr, setLdapMailAttr] = useState('mail');
  const [ldapNameAttr, setLdapNameAttr] = useState('cn');
  
  const [ldapTesting, setLdapTesting] = useState(false);
  const [ldapTestResult, setLdapTestResult] = useState<{ success: boolean; msg: string } | null>(null);

  const [ldapStatus, setLdapStatus] = useState<{
    ldapEnabled: boolean;
    serviceStatus: string;
    ldapStatus: string;
    configStatus: string;
  } | null>(null);
  const [loadingStatus, setLoadingStatus] = useState<boolean>(false);

  const fetchLdapStatus = () => {
    if (!authToken) return;
    setLoadingStatus(true);
    fetch('/api/matrix/ldap/status', {
      headers: {
        'Authorization': `Bearer ${authToken}`
      }
    })
      .then(res => res.json())
      .then(data => {
        setLdapStatus(data);
        setLoadingStatus(false);
      })
      .catch(err => {
        console.error("Failed to fetch LDAP status", err);
        setLoadingStatus(false);
      });
  };

  // 3. Workers Config State
  const [workersEnabled, setWorkersEnabled] = useState(false);
  const [workersCount, setWorkersCount] = useState(2);
  const [workersFedSender, setWorkersFedSender] = useState(false);
  const [workersBasePort, setWorkersBasePort] = useState(8083);

  // 4. Limits & Policies State
  const [limitMb, setLimitMb] = useState('50');
  const [regEnabled, setRegEnabled] = useState(true);
  const [messageRetentionDays, setMessageRetentionDays] = useState('0');
  const [mediaRetentionLocalDays, setMediaRetentionLocalDays] = useState('0');
  const [mediaRetentionRemoteDays, setMediaRetentionRemoteDays] = useState('0');
  const [presenceEnabled, setPresenceEnabled] = useState(true);
  const [roomCreationAllow, setRoomCreationAllow] = useState(true);
  const [directorySearchEnabled, setDirectorySearchEnabled] = useState(true);
  const [rateLimitPerSec, setRateLimitPerSec] = useState('0.2');
  const [rateLimitBurst, setRateLimitBurst] = useState('10');

  // 5. SMTP States
  const [smtpHost, setSmtpHost] = useState('smtp.company.local');
  const [smtpPort, setSmtpPort] = useState('587');
  const [smtpUser, setSmtpUser] = useState('smtp_user');
  const [smtpPass, setSmtpPass] = useState('smtp_pass');
  const [notifFrom, setNotifFrom] = useState('Matrix <noreply@company.local>');
  const [appName, setAppName] = useState('Matrix');

  // 6. Element Defaults States
  const [typingNotifs, setTypingNotifs] = useState(true);
  const [readReceipts, setReadReceipts] = useState(true);
  const [profileEditName, setProfileEditName] = useState(true);
  const [profileEditAvatar, setProfileEditAvatar] = useState(true);
  const [integrationsUiUrl, setIntegrationsUiUrl] = useState('https://scalar.vector.im');
  const [integrationsRestUrl, setIntegrationsRestUrl] = useState('https://scalar.vector.im/api');
  const [elementCallUrl, setElementCallUrl] = useState('https://call.element.io');

  // 7. User Register State
  const [regUser, setRegUser] = useState('');
  const [regPass, setRegPass] = useState('');
  const [regIsAdmin, setRegIsAdmin] = useState(false);
  const [userSearch, setUserSearch] = useState('');

  // 8. Reactivate state overlay
  const [reactivateMxid, setReactivateMxid] = useState<string | null>(null);
  const [reactivatePass, setReactivatePass] = useState('');
  const [reactivateIsAdmin, setReactivateIsAdmin] = useState(false);

  // 9. API test status
  const [apiReport, setApiReport] = useState<any>(null);
  const [loadingApi, setLoadingApi] = useState<boolean>(false);
  const [selectedEndpoint, setSelectedEndpoint] = useState<any>(null);

  const [customApiPort, setCustomApiPort] = useState<string>('8008');
  const [customApiBaseUrl, setCustomApiBaseUrl] = useState<string>('http://localhost:8008');
  const [customApiToken, setCustomApiToken] = useState<string>('');
  const [showApiSettings, setShowApiSettings] = useState<boolean>(false);
  const [savingApiConfig, setSavingApiConfig] = useState<boolean>(false);

  const fetchApiReport = async () => {
    setLoadingApi(true);
    try {
      const res = await fetch('/api/matrix/api-status', {
        headers: {
          'Authorization': `Bearer ${authToken}`
        }
      });
      if (res.ok) {
        const data = await res.json();
        setApiReport(data);
        if (data.endpoints && data.endpoints.length > 0) {
          setSelectedEndpoint(data.endpoints[0]);
        }
        if (data.apiPort) setCustomApiPort(String(data.apiPort));
        if (data.apiBaseUrl) setCustomApiBaseUrl(data.apiBaseUrl);
        if (data.apiAdminTokenOverride) setCustomApiToken(data.apiAdminTokenOverride);
      } else {
        if (showToast) showToast('error', 'Failed to retrieve API status.');
      }
    } catch (err) {
      if (showToast) showToast('error', 'Error reaching backend API checker.');
    } finally {
      setLoadingApi(false);
    }
  };

  const handleSaveApiConfig = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingApiConfig(true);
    try {
      const res = await fetch('/api/matrix/api-config', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authToken}`
        },
        body: JSON.stringify({
          apiPort: parseInt(customApiPort) || 8008,
          apiBaseUrl: customApiBaseUrl,
          apiAdminTokenOverride: customApiToken
        })
      });
      if (res.ok) {
        if (showToast) showToast('success', 'API configuration updated and saved successfully!');
        fetchApiReport();
      } else {
        if (showToast) showToast('error', 'Failed to save API configuration.');
      }
    } catch (err) {
      if (showToast) showToast('error', 'Error sending configuration update.');
    } finally {
      setSavingApiConfig(false);
    }
  };

  useEffect(() => {
    if (activeTab === 'api') {
      fetchApiReport();
    }
  }, [activeTab]);

  // Synchronize component state with props
  useEffect(() => {
    if (config) {
      setHsDomain(config.HS_DOMAIN || '');
      setElDomain(config.ELEMENT_DOMAIN || '');
      setBaseDomain(config.BASE_DOMAIN || '');
      setPublicIp(config.PUBLIC_IP || '');
      setLeEmail(config.LE_EMAIL || '');
      setSslMode(config.SSL_MODE || 'selfsigned');
      setPgDb(config.PG_DB || 'synapse');
      setPgUser(config.PG_USER || 'synapse_user');
      setPgHost(config.PG_HOST || 'localhost');
      setPgPort(config.PG_PORT || '5432');
      setPgPass(config.PG_PASS || '');
      
      setLimitMb(config.LIMIT_MB || '50');
      setRegEnabled(config.REGISTRATION_ENABLED !== false);
      setMessageRetentionDays(config.MESSAGE_RETENTION_DAYS || '0');
      setMediaRetentionLocalDays(config.MEDIA_RETENTION_LOCAL_DAYS || '0');
      setMediaRetentionRemoteDays(config.MEDIA_RETENTION_REMOTE_DAYS || '0');
      setPresenceEnabled(config.PRESENCE_ENABLED !== false);
      setRoomCreationAllow(config.ROOM_CREATION_ALLOW !== false);
      setDirectorySearchEnabled(config.DIRECTORY_SEARCH_ENABLED !== false);
      setRateLimitPerSec(config.RATE_LIMIT_PER_SEC || '0.2');
      setRateLimitBurst(config.RATE_LIMIT_BURST || '10');
      
      setSmtpHost(config.SMTP_HOST || 'smtp.company.local');
      setSmtpPort(config.SMTP_PORT || '587');
      setSmtpUser(config.SMTP_USER || 'smtp_user');
      setSmtpPass(config.SMTP_PASS || 'smtp_pass');
      setNotifFrom(config.NOTIF_FROM || 'Matrix <noreply@company.local>');
      setAppName(config.APP_NAME || 'Matrix');
      
      setTypingNotifs(config.TYPING_NOTIFS_ENABLED !== false);
      setReadReceipts(config.READ_RECEIPTS_ENABLED !== false);
      setProfileEditName(config.PROFILE_EDIT_NAME_ENABLED !== false);
      setProfileEditAvatar(config.PROFILE_EDIT_AVATAR_ENABLED !== false);
      setIntegrationsUiUrl(config.INTEGRATIONS_UI_URL || 'https://scalar.vector.im');
      setIntegrationsRestUrl(config.INTEGRATIONS_REST_URL || 'https://scalar.vector.im/api');
      setElementCallUrl(config.ELEMENT_CALL_URL || 'https://call.element.io');
    }
  }, [config]);

  useEffect(() => {
    if (ldap) {
      setLdapEnabled(ldap.enabled || false);
      setLdapUri(ldap.uri || '');
      setLdapBase(ldap.base || '');
      setLdapMode(ldap.mode || 'search');
      setLdapStartTls(ldap.start_tls || false);
      setLdapBindDn(ldap.bind_dn || '');
      setLdapBindPassword(ldap.bind_password || '');
      setLdapActiveDirectory(ldap.active_directory || false);
      setLdapUidAttr(ldap.uid_attr || 'sAMAccountName');
      setLdapMailAttr(ldap.mail_attr || 'mail');
      setLdapNameAttr(ldap.name_attr || 'cn');
    }
  }, [ldap]);

  useEffect(() => {
    if (workers) {
      setWorkersEnabled(workers.enabled || false);
      setWorkersCount(workers.count || 2);
      setWorkersFedSender(workers.federationSender || false);
      setWorkersBasePort(workers.basePort || 8083);
    }
  }, [workers]);

  useEffect(() => {
    if (activeTab === 'ldap' && authToken) {
      fetchLdapStatus();
    }
  }, [ldap, activeTab, authToken]);

  const isReadOnly = userRole === 'Viewer';
  const isModerator = userRole === 'Moderator';

  // Handle saving Homeserver Config
  const handleSaveHomeserver = (e: React.FormEvent) => {
    e.preventDefault();
    if (isReadOnly) return;
    onSaveConfig({
      config: {
        HS_DOMAIN: hsDomain,
        ELEMENT_DOMAIN: elDomain,
        BASE_DOMAIN: baseDomain,
        PUBLIC_IP: publicIp,
        LE_EMAIL: leEmail,
        SSL_MODE: sslMode,
        PG_DB: pgDb,
        PG_USER: pgUser,
        PG_HOST: pgHost,
        PG_PORT: pgPort,
        PG_PASS: pgPass
      }
    });
  };

  // Handle saving LDAP configuration
  const handleSaveLdap = (e: React.FormEvent) => {
    e.preventDefault();
    if (isReadOnly || isModerator) return;
    onSaveConfig({
      ldap: {
        enabled: ldapEnabled,
        uri: ldapUri,
        base: ldapBase,
        mode: ldapMode,
        start_tls: ldapStartTls,
        bind_dn: ldapBindDn,
        bind_password: ldapBindPassword,
        active_directory: ldapActiveDirectory,
        uid_attr: ldapUidAttr,
        mail_attr: ldapMailAttr,
        name_attr: ldapNameAttr
      }
    });
  };

  // Handle saving Workers config
  const handleSaveWorkers = (e: React.FormEvent) => {
    e.preventDefault();
    if (isReadOnly || isModerator) return;
    onSaveConfig({
      workers: {
        enabled: workersEnabled,
        count: Number(workersCount),
        federationSender: workersFedSender,
        basePort: Number(workersBasePort)
      }
    });
  };

  // Handle saving Limits & Policies config
  const handleSavePolicies = (e: React.FormEvent) => {
    e.preventDefault();
    if (isReadOnly) return;
    onSaveConfig({
      config: {
        LIMIT_MB: limitMb,
        REGISTRATION_ENABLED: regEnabled,
        MESSAGE_RETENTION_DAYS: messageRetentionDays,
        MEDIA_RETENTION_LOCAL_DAYS: mediaRetentionLocalDays,
        MEDIA_RETENTION_REMOTE_DAYS: mediaRetentionRemoteDays,
        PRESENCE_ENABLED: presenceEnabled,
        ROOM_CREATION_ALLOW: roomCreationAllow,
        DIRECTORY_SEARCH_ENABLED: directorySearchEnabled,
        RATE_LIMIT_PER_SEC: rateLimitPerSec,
        RATE_LIMIT_BURST: rateLimitBurst
      }
    });
  };

  // Handle saving SMTP Mail config
  const handleSaveSmtp = (e: React.FormEvent) => {
    e.preventDefault();
    if (isReadOnly) return;
    onSaveConfig({
      config: {
        SMTP_HOST: smtpHost,
        SMTP_PORT: smtpPort,
        SMTP_USER: smtpUser,
        SMTP_PASS: smtpPass,
        NOTIF_FROM: notifFrom,
        APP_NAME: appName
      }
    });
  };

  // Handle saving Client Defaults config
  const handleSaveClient = (e: React.FormEvent) => {
    e.preventDefault();
    if (isReadOnly) return;
    onSaveConfig({
      config: {
        TYPING_NOTIFS_ENABLED: typingNotifs,
        READ_RECEIPTS_ENABLED: readReceipts,
        PROFILE_EDIT_NAME_ENABLED: profileEditName,
        PROFILE_EDIT_AVATAR_ENABLED: profileEditAvatar,
        INTEGRATIONS_UI_URL: integrationsUiUrl,
        INTEGRATIONS_REST_URL: integrationsRestUrl,
        ELEMENT_CALL_URL: elementCallUrl
      }
    });
  };

  // LDAP Connection tester
  const handleTestLdap = () => {
    if (isReadOnly || isModerator) return;
    setLdapTesting(true);
    setLdapTestResult(null);

    fetch('/api/matrix/ldap/test', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${authToken}`
      },
      body: JSON.stringify({
        uri: ldapUri,
        base: ldapBase,
        mode: ldapMode,
        start_tls: ldapStartTls,
        bind_dn: ldapBindDn,
        bind_password: ldapBindPassword,
        active_directory: ldapActiveDirectory,
        uid_attr: ldapUidAttr
      })
    })
      .then(res => res.json())
      .then(data => {
        setLdapTesting(false);
        if (data.success) {
          setLdapTestResult({ success: true, msg: data.msg });
        } else {
          setLdapTestResult({ success: false, msg: data.msg || "❌ Unknown connection failure." });
        }
        fetchLdapStatus();
      })
      .catch(err => {
        setLdapTesting(false);
        setLdapTestResult({
          success: false,
          msg: "❌ Connection Error: " + err.message
        });
        fetchLdapStatus();
      });
  };

  // Handle register user
  const handleRegisterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isReadOnly) return;
    if (!regUser.trim() || !regPass.trim()) return;
    onRegisterUser(regUser.trim(), regPass, regIsAdmin);
    setRegUser('');
    setRegPass('');
    setRegIsAdmin(false);
  };

  // Handle reactivation trigger
  const handleReactivateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isReadOnly || !reactivateMxid || !reactivatePass) return;
    onReactivateUser(reactivateMxid, reactivatePass, reactivateIsAdmin);
    setReactivateMxid(null);
    setReactivatePass('');
    setReactivateIsAdmin(false);
  };

  // Filtering users
  const filteredUsers = matrixUsers.filter((u) => 
    u.mxid.toLowerCase().includes(userSearch.toLowerCase())
  );

  return (
    <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 h-[calc(100vh-180px)] overflow-hidden">
      {/* Left Column: Sub Tabs */}
      <div className="spatial-glass rounded-3xl p-5 border border-white/5 flex flex-col gap-2 h-full overflow-y-auto">
        <h3 className="text-sm font-display font-semibold text-slate-400 mb-3 px-3 uppercase tracking-wider">Control Hub</h3>
        
        <button
          onClick={() => setActiveTab('homeserver')}
          className={`flex items-center gap-3 px-4 py-3 rounded-2xl text-sm font-semibold transition-all text-left ${
            activeTab === 'homeserver' 
              ? 'bg-white/10 text-white border border-white/10 shadow-[0_0_12px_rgba(99,102,241,0.15)]' 
              : 'text-gray-400 hover:text-white hover:bg-white/5'
          }`}
          id="tab-homeserver"
        >
          <Settings className="w-5 h-5 text-indigo-400" />
          <span>Server Parameters</span>
        </button>

        <button
          onClick={() => setActiveTab('ldap')}
          className={`flex items-center gap-3 px-4 py-3 rounded-2xl text-sm font-semibold transition-all text-left ${
            activeTab === 'ldap' 
              ? 'bg-white/10 text-white border border-white/10 shadow-[0_0_12px_rgba(168,85,247,0.15)]' 
              : 'text-gray-400 hover:text-white hover:bg-white/5'
          }`}
          id="tab-ldap"
        >
          <Network className="w-5 h-5 text-purple-400" />
          <span>Active Directory</span>
        </button>

        <button
          onClick={() => setActiveTab('workers')}
          className={`flex items-center gap-3 px-4 py-3 rounded-2xl text-sm font-semibold transition-all text-left ${
            activeTab === 'workers' 
              ? 'bg-white/10 text-white border border-white/10 shadow-[0_0_12px_rgba(244,63,94,0.15)]' 
              : 'text-gray-400 hover:text-white hover:bg-white/5'
          }`}
          id="tab-workers"
        >
          <Cpu className="w-5 h-5 text-rose-400" />
          <span>Workers & Scaling</span>
        </button>

        <button
          onClick={() => setActiveTab('policies')}
          className={`flex items-center gap-3 px-4 py-3 rounded-2xl text-sm font-semibold transition-all text-left ${
            activeTab === 'policies' 
              ? 'bg-white/10 text-white border border-white/10 shadow-[0_0_12px_rgba(14,165,233,0.15)]' 
              : 'text-gray-400 hover:text-white hover:bg-white/5'
          }`}
          id="tab-policies"
        >
          <Sliders className="w-5 h-5 text-cyan-400" />
          <span>Limits & Policies</span>
        </button>

        <button
          onClick={() => setActiveTab('smtp')}
          className={`flex items-center gap-3 px-4 py-3 rounded-2xl text-sm font-semibold transition-all text-left ${
            activeTab === 'smtp' 
              ? 'bg-white/10 text-white border border-white/10 shadow-[0_0_12px_rgba(245,158,11,0.15)]' 
              : 'text-gray-400 hover:text-white hover:bg-white/5'
          }`}
          id="tab-smtp"
        >
          <Mail className="w-5 h-5 text-amber-400" />
          <span>Email Server (SMTP)</span>
        </button>

        <button
          onClick={() => setActiveTab('client')}
          className={`flex items-center gap-3 px-4 py-3 rounded-2xl text-sm font-semibold transition-all text-left ${
            activeTab === 'client' 
              ? 'bg-white/10 text-white border border-white/10 shadow-[0_0_12px_rgba(99,102,241,0.15)]' 
              : 'text-gray-400 hover:text-white hover:bg-white/5'
          }`}
          id="tab-client"
        >
          <Layout className="w-5 h-5 text-sky-400" />
          <span>Client Defaults</span>
        </button>

        <button
          onClick={() => setActiveTab('video')}
          className={`flex items-center gap-3 px-4 py-3 rounded-2xl text-sm font-semibold transition-all text-left ${
            activeTab === 'video' 
              ? 'bg-white/10 text-white border border-white/10 shadow-[0_0_12px_rgba(245,158,11,0.15)]' 
              : 'text-gray-400 hover:text-white hover:bg-white/5'
          }`}
          id="tab-video"
        >
          <Video className="w-5 h-5 text-amber-400" />
          <span>Media & Calling</span>
        </button>

        <button
          onClick={() => setActiveTab('security')}
          className={`flex items-center gap-3 px-4 py-3 rounded-2xl text-sm font-semibold transition-all text-left ${
            activeTab === 'security' 
              ? 'bg-white/10 text-white border border-white/10 shadow-[0_0_12px_rgba(16,185,129,0.15)]' 
              : 'text-gray-400 hover:text-white hover:bg-white/5'
          }`}
          id="tab-security"
        >
          <ShieldCheck className="w-5 h-5 text-emerald-400" />
          <span>Security & Auth</span>
        </button>

        <button
          onClick={() => setActiveTab('users')}
          className={`flex items-center gap-3 px-4 py-3 rounded-2xl text-sm font-semibold transition-all text-left ${
            activeTab === 'users' 
              ? 'bg-white/10 text-white border border-white/10 shadow-[0_0_12px_rgba(16,185,129,0.15)]' 
              : 'text-gray-400 hover:text-white hover:bg-white/5'
          }`}
          id="tab-users"
        >
          <Users className="w-5 h-5 text-emerald-400" />
          <span>Matrix Users</span>
        </button>

        <button
          onClick={() => setActiveTab('api')}
          className={`flex items-center gap-3 px-4 py-3 rounded-2xl text-sm font-semibold transition-all text-left ${
            activeTab === 'api' 
              ? 'bg-white/10 text-white border border-white/10 shadow-[0_0_12px_rgba(59,130,246,0.15)]' 
              : 'text-gray-400 hover:text-white hover:bg-white/5'
          }`}
          id="tab-api"
        >
          <Activity className="w-5 h-5 text-blue-400" />
          <span>Matrix & Synapse APIs</span>
        </button>
      </div>

      {/* Right Column: Dynamic Form Space */}
      <div className="lg:col-span-3 spatial-glass rounded-3xl p-6 border border-white/5 flex flex-col h-full overflow-y-auto">
        
        {/* VIEW 1: HOMESERVER PARAMETERS */}
        {activeTab === 'homeserver' && (
          <form onSubmit={handleSaveHomeserver} className="space-y-6" id="form-homeserver">
            <div className="flex items-center gap-3 pb-4 border-b border-white/5">
              <Globe className="w-6 h-6 text-indigo-400" />
              <div>
                <h2 className="text-xl font-display font-bold text-white">Homeserver Configuration</h2>
                <p className="text-xs text-slate-400">Manage base URLs, domains, Postgres coordinates, and security certs.</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider block mb-1.5">Matrix server domain</label>
                <input
                  type="text"
                  value={hsDomain}
                  onChange={(e) => setHsDomain(e.target.value)}
                  disabled={isReadOnly}
                  className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-slate-200 focus:outline-none focus:border-indigo-500/50"
                  placeholder="e.g. matrix.company.local"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider block mb-1.5">Element client domain</label>
                <input
                  type="text"
                  value={elDomain}
                  onChange={(e) => setElDomain(e.target.value)}
                  disabled={isReadOnly}
                  className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-slate-200 focus:outline-none focus:border-indigo-500/50"
                  placeholder="e.g. chat.company.local"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider block mb-1.5">Base Federation Domain</label>
                <input
                  type="text"
                  value={baseDomain}
                  onChange={(e) => setBaseDomain(e.target.value)}
                  disabled={isReadOnly}
                  className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-slate-200 focus:outline-none focus:border-indigo-500/50"
                  placeholder="e.g. company.local"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider block mb-1.5">Node Public IP</label>
                <input
                  type="text"
                  value={publicIp}
                  onChange={(e) => setPublicIp(e.target.value)}
                  disabled={isReadOnly}
                  className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-slate-200 focus:outline-none focus:border-indigo-500/50"
                  placeholder="e.g. 192.168.1.100"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider block mb-1.5">Let's Encrypt Email</label>
                <input
                  type="email"
                  value={leEmail}
                  onChange={(e) => setLeEmail(e.target.value)}
                  disabled={isReadOnly}
                  className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-slate-200 focus:outline-none focus:border-indigo-500/50"
                  placeholder="e.g. admin@company.local"
                />
              </div>
            </div>

            {/* Database coordination */}
            <div className="pt-4 border-t border-white/5 space-y-4">
              <h3 className="text-md font-display font-semibold text-white flex items-center gap-2">
                <Database className="w-5 h-5 text-purple-400" />
                PostgreSQL Relational DB Settings
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                <div>
                  <label className="text-xs font-semibold text-slate-400 block mb-1">Database Host</label>
                  <input
                    type="text"
                    value={pgHost}
                    onChange={(e) => setPgHost(e.target.value)}
                    disabled={isReadOnly}
                    className="w-full bg-black/40 border border-white/10 rounded-xl px-3 py-2 text-sm text-slate-200 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-400 block mb-1">Port</label>
                  <input
                    type="text"
                    value={pgPort}
                    onChange={(e) => setPgPort(e.target.value)}
                    disabled={isReadOnly}
                    className="w-full bg-black/40 border border-white/10 rounded-xl px-3 py-2 text-sm text-slate-200 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-400 block mb-1">DB Name</label>
                  <input
                    type="text"
                    value={pgDb}
                    onChange={(e) => setPgDb(e.target.value)}
                    disabled={isReadOnly}
                    className="w-full bg-black/40 border border-white/10 rounded-xl px-3 py-2 text-sm text-slate-200 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-400 block mb-1">Username</label>
                  <input
                    type="text"
                    value={pgUser}
                    onChange={(e) => setPgUser(e.target.value)}
                    disabled={isReadOnly}
                    className="w-full bg-black/40 border border-white/10 rounded-xl px-3 py-2 text-sm text-slate-200 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-400 block mb-1">Password</label>
                  <input
                    type="password"
                    value={pgPass}
                    onChange={(e) => setPgPass(e.target.value)}
                    disabled={isReadOnly}
                    placeholder="••••••••"
                    className="w-full bg-black/40 border border-white/10 rounded-xl px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-purple-500/50 transition-colors"
                  />
                </div>
              </div>
            </div>

            {!isReadOnly && (
              <div className="flex justify-end pt-4">
                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 text-white font-bold text-sm shadow-[0_4px_20px_rgba(99,102,241,0.25)] hover:scale-[1.03] active:scale-[0.98] transition-all"
                >
                  Save & Apply Config
                </button>
              </div>
            )}
          </form>
        )}

        {/* VIEW 2: LDAP AUTH AD CONNECTOR */}
        {activeTab === 'ldap' && (
          <form onSubmit={handleSaveLdap} className="space-y-6" id="form-ldap">
            <div className="flex items-center justify-between pb-4 border-b border-white/5">
              <div className="flex items-center gap-3">
                <Network className="w-6 h-6 text-purple-400" />
                <div>
                  <h2 className="text-xl font-display font-bold text-white">Active Directory / LDAP</h2>
                  <p className="text-xs text-slate-400">Bridge local user accounts with LDAP corporate directories.</p>
                </div>
              </div>

              {/* Enabled toggle */}
              <div className="flex items-center gap-3">
                <span className="text-xs text-slate-400 uppercase tracking-wider font-semibold">Status:</span>
                <button
                  type="button"
                  onClick={() => !isReadOnly && !isModerator && setLdapEnabled(!ldapEnabled)}
                  disabled={isReadOnly || isModerator}
                  className={`w-12 h-6 rounded-full p-1 transition-colors duration-200 focus:outline-none ${
                    ldapEnabled ? 'bg-purple-500' : 'bg-slate-700'
                  }`}
                >
                  <div className={`w-4 h-4 rounded-full bg-white transition-transform duration-200 ${
                    ldapEnabled ? 'translate-x-6' : 'translate-x-0'
                  }`} />
                </button>
              </div>
            </div>

            {/* Live Remote Server LDAP & Active Directory Status Dashboard */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
              <div className="p-3.5 rounded-2xl bg-slate-900/40 border border-white/5 flex flex-col justify-between min-h-[90px]">
                <span className="text-slate-400 text-xs font-semibold tracking-wider uppercase">LDAP Module</span>
                <div className="flex items-center justify-between mt-2">
                  <span className={`text-sm font-bold ${ldapStatus?.ldapEnabled ? 'text-purple-400' : 'text-slate-500'}`}>
                    {loadingStatus ? 'Checking...' : (ldapStatus?.ldapEnabled ? 'ENABLED' : 'DISABLED')}
                  </span>
                  <div className={`w-2 h-2 rounded-full ${ldapStatus?.ldapEnabled ? 'bg-purple-500 animate-pulse' : 'bg-slate-600'}`} />
                </div>
              </div>

              <div className="p-3.5 rounded-2xl bg-slate-900/40 border border-white/5 flex flex-col justify-between min-h-[90px]">
                <span className="text-slate-400 text-xs font-semibold tracking-wider uppercase">Service Status</span>
                <div className="flex items-center justify-between mt-2">
                  <span className={`text-sm font-bold ${
                    ldapStatus?.serviceStatus === 'active' ? 'text-emerald-400' : 
                    ldapStatus?.serviceStatus === 'failed' ? 'text-red-400' : 'text-amber-400'
                  }`}>
                    {loadingStatus ? 'Checking...' : (ldapStatus ? ldapStatus.serviceStatus.toUpperCase() : 'UNKNOWN')}
                  </span>
                  <div className={`w-2 h-2 rounded-full ${
                    ldapStatus?.serviceStatus === 'active' ? 'bg-emerald-500 animate-pulse' : 
                    ldapStatus?.serviceStatus === 'failed' ? 'bg-red-500' : 'bg-amber-500'
                  }`} />
                </div>
              </div>

              <div className="p-3.5 rounded-2xl bg-slate-900/40 border border-white/5 flex flex-col justify-between min-h-[90px]">
                <span className="text-slate-400 text-xs font-semibold tracking-wider uppercase">LDAP Connection</span>
                <div className="flex items-center justify-between mt-2">
                  <span className={`text-sm font-bold ${
                    ldapStatus?.ldapStatus === 'Connected' ? 'text-indigo-400' : 
                    ldapStatus?.ldapStatus === 'Unreachable' ? 'text-red-400' : 'text-slate-500'
                  }`}>
                    {loadingStatus ? 'Checking...' : (ldapStatus ? ldapStatus.ldapStatus.toUpperCase() : 'OFFLINE')}
                  </span>
                  <div className={`w-2 h-2 rounded-full ${
                    ldapStatus?.ldapStatus === 'Connected' ? 'bg-indigo-500 animate-pulse' : 
                    ldapStatus?.ldapStatus === 'Unreachable' ? 'bg-red-500' : 'bg-slate-600'
                  }`} />
                </div>
              </div>

              <div className="p-3.5 rounded-2xl bg-slate-900/40 border border-white/5 flex flex-col justify-between min-h-[90px]">
                <span className="text-slate-400 text-xs font-semibold tracking-wider uppercase">Config Integrity</span>
                <div className="flex items-center justify-between mt-2">
                  <span className={`text-sm font-bold ${
                    ldapStatus?.configStatus === 'Valid' ? 'text-emerald-400' : 
                    ldapStatus?.configStatus === 'Invalid' ? 'text-red-400' : 'text-slate-500'
                  }`}>
                    {loadingStatus ? 'Checking...' : (ldapStatus ? ldapStatus.configStatus.toUpperCase() : 'UNKNOWN')}
                  </span>
                  <div className={`w-2 h-2 rounded-full ${
                    ldapStatus?.configStatus === 'Valid' ? 'bg-emerald-500 animate-pulse' : 
                    ldapStatus?.configStatus === 'Invalid' ? 'bg-red-500' : 'bg-slate-600'
                  }`} />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider block mb-1.5">LDAP Server URI</label>
                <input
                  type="text"
                  value={ldapUri}
                  onChange={(e) => setLdapUri(e.target.value)}
                  disabled={isReadOnly || isModerator}
                  className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-slate-200 focus:outline-none"
                  placeholder="ldap://ldap.company.local:389"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider block mb-1.5">Search Base DN</label>
                <input
                  type="text"
                  value={ldapBase}
                  onChange={(e) => setLdapBase(e.target.value)}
                  disabled={isReadOnly || isModerator}
                  className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-slate-200 focus:outline-none"
                  placeholder="ou=users,dc=company,dc=local"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider block mb-1.5">Bind Mode</label>
                <select
                  value={ldapMode}
                  onChange={(e) => setLdapMode(e.target.value as any)}
                  disabled={isReadOnly || isModerator}
                  className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-slate-200 focus:outline-none focus:border-purple-500/50"
                >
                  <option value="search">Search Bind Account (Recommended)</option>
                  <option value="simple">Direct Bind / Simple User Verification</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider block mb-1.5">Active Directory (AD)?</label>
                <select
                  value={ldapActiveDirectory ? "true" : "false"}
                  onChange={(e) => {
                    const isAd = e.target.value === "true";
                    setLdapActiveDirectory(isAd);
                    if (isAd) {
                      setLdapUidAttr('sAMAccountName');
                    }
                  }}
                  disabled={isReadOnly || isModerator}
                  className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-slate-200 focus:outline-none focus:border-purple-500/50"
                >
                  <option value="false">No (Standard LDAP Server)</option>
                  <option value="true">Yes (Active Directory Domain Controller)</option>
                </select>
              </div>

              {ldapMode === 'search' && (
                <>
                  <div>
                    <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider block mb-1.5">Bind Account DN (Service Account)</label>
                    <input
                      type="text"
                      value={ldapBindDn}
                      onChange={(e) => setLdapBindDn(e.target.value)}
                      disabled={isReadOnly || isModerator}
                      className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-slate-200 focus:outline-none focus:border-purple-500/50"
                      placeholder="CN=Administrator,CN=Users,DC=test,DC=lab"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider block mb-1.5">Bind Password</label>
                    <input
                      type="password"
                      value={ldapBindPassword}
                      onChange={(e) => setLdapBindPassword(e.target.value)}
                      disabled={isReadOnly || isModerator}
                      className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-slate-200 focus:outline-none focus:border-purple-500/50"
                      placeholder="••••••••••••"
                    />
                  </div>
                </>
              )}

              <div>
                <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider block mb-1.5">STARTTLS Integration</label>
                <select
                  value={ldapStartTls ? "true" : "false"}
                  onChange={(e) => setLdapStartTls(e.target.value === "true")}
                  disabled={isReadOnly || isModerator}
                  className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-slate-200 focus:outline-none focus:border-purple-500/50"
                >
                  <option value="false">Implicit/None Plain</option>
                  <option value="true">Enable STARTTLS (Encrypt Communication Channel)</option>
                </select>
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="text-xs font-semibold text-slate-400 block mb-1">UID Attr</label>
                  <input
                    type="text"
                    value={ldapUidAttr}
                    onChange={(e) => setLdapUidAttr(e.target.value)}
                    disabled={isReadOnly || isModerator}
                    className="w-full bg-black/40 border border-white/10 rounded-xl px-2.5 py-2.5 text-xs text-slate-200 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-400 block mb-1">Mail Attr</label>
                  <input
                    type="text"
                    value={ldapMailAttr}
                    onChange={(e) => setLdapMailAttr(e.target.value)}
                    disabled={isReadOnly || isModerator}
                    className="w-full bg-black/40 border border-white/10 rounded-xl px-2.5 py-2.5 text-xs text-slate-200 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-400 block mb-1">Name Attr</label>
                  <input
                    type="text"
                    value={ldapNameAttr}
                    onChange={(e) => setLdapNameAttr(e.target.value)}
                    disabled={isReadOnly || isModerator}
                    className="w-full bg-black/40 border border-white/10 rounded-xl px-2.5 py-2.5 text-xs text-slate-200 focus:outline-none"
                  />
                </div>
              </div>
            </div>

            {/* Test LDAP Integration */}
            <div className="p-4 rounded-2xl bg-black/25 border border-white/5 space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="text-sm font-semibold text-white">Verify LDAP Credentials</h4>
                <button
                  type="button"
                  onClick={handleTestLdap}
                  disabled={ldapTesting || isReadOnly || isModerator}
                  className="px-4 py-1.5 rounded-lg bg-purple-500/10 hover:bg-purple-500/20 text-purple-400 border border-purple-500/20 text-xs font-bold transition-all disabled:opacity-40"
                >
                  {ldapTesting ? "Connecting..." : "Test LDAP Bind"}
                </button>
              </div>

              {ldapTestResult && (
                <div className={`p-3 rounded-xl border text-xs leading-relaxed font-mono ${
                  ldapTestResult.success 
                    ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' 
                    : 'bg-red-500/10 border-red-500/20 text-red-400'
                }`}>
                  {ldapTestResult.msg}
                </div>
              )}
            </div>

            {!isReadOnly && !isModerator && (
              <div className="flex justify-end pt-4">
                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-xl bg-purple-500 text-white font-bold text-sm shadow-[0_0_15px_rgba(168,85,247,0.3)] hover:scale-105 transition-transform"
                >
                  Save LDAP Configurations
                </button>
              </div>
            )}
          </form>
        )}

        {/* VIEW 3: WORKERS & SCALING */}
        {activeTab === 'workers' && (
          <form onSubmit={handleSaveWorkers} className="space-y-6" id="form-workers">
            <div className="flex items-center justify-between pb-4 border-b border-white/5">
              <div className="flex items-center gap-3">
                <Cpu className="w-6 h-6 text-rose-400" />
                <div>
                  <h2 className="text-xl font-display font-bold text-white">Workers & Performance Scaling</h2>
                  <p className="text-xs text-slate-400">Scale the homeserver using multi-process Redis workers.</p>
                </div>
              </div>

              {/* Workers Status */}
              <div className="flex items-center gap-3">
                <span className="text-xs text-slate-400 uppercase tracking-wider font-semibold">Active:</span>
                <button
                  type="button"
                  onClick={() => !isReadOnly && !isModerator && setWorkersEnabled(!workersEnabled)}
                  disabled={isReadOnly || isModerator}
                  className={`w-12 h-6 rounded-full p-1 transition-colors duration-200 focus:outline-none ${
                    workersEnabled ? 'bg-rose-500' : 'bg-slate-700'
                  }`}
                >
                  <div className={`w-4 h-4 rounded-full bg-white transition-transform duration-200 ${
                    workersEnabled ? 'translate-x-6' : 'translate-x-0'
                  }`} />
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider block mb-1.5">Generic Workers Count</label>
                <select
                  value={workersCount}
                  onChange={(e) => setWorkersCount(Number(e.target.value))}
                  disabled={isReadOnly || isModerator || !workersEnabled}
                  className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-slate-200 focus:outline-none focus:border-rose-500/50 disabled:opacity-40"
                >
                  <option value={1}>1 Worker (Low Traffic / VPS)</option>
                  <option value={2}>2 Workers (Standard Balanced - Recommended)</option>
                  <option value={3}>3 Workers (Enterprise Dedicated)</option>
                  <option value={4}>4 Workers (High Volume Federation Load)</option>
                </select>
                <p className="text-[10px] text-slate-400 mt-1">Number of generic worker processes spawned on host port interfaces.</p>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider block mb-1.5">Worker Base TCP Port</label>
                <input
                  type="number"
                  value={workersBasePort}
                  onChange={(e) => setWorkersBasePort(Number(e.target.value))}
                  disabled={isReadOnly || isModerator || !workersEnabled}
                  className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-slate-200 focus:outline-none focus:border-rose-500/50 disabled:opacity-40"
                  min={1024}
                  max={65535}
                />
                <p className="text-[10px] text-slate-400 mt-1">Starting port for allocating generic worker thread bindings (Redis queues).</p>
              </div>

              <div className="md:col-span-2">
                <div className="flex items-start gap-3 p-4 rounded-2xl bg-black/25 border border-white/5">
                  <input
                    type="checkbox"
                    id="workers-fed-sender"
                    checked={workersFedSender}
                    onChange={(e) => setWorkersFedSender(e.target.checked)}
                    disabled={isReadOnly || isModerator || !workersEnabled}
                    className="rounded border-white/10 bg-black/40 text-rose-500 focus:ring-0 mt-0.5 disabled:opacity-40"
                  />
                  <div className={!workersEnabled ? 'opacity-40' : ''}>
                    <label htmlFor="workers-fed-sender" className="text-xs font-bold text-white block">
                      Isolate Federation Senders
                    </label>
                    <p className="text-[11px] text-slate-400 mt-0.5">
                      Spawns a dedicated worker exclusively handling outbound federation traffic and room syncs, ensuring local chat latency remains untouched.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-rose-500/5 border border-rose-500/10 flex gap-3 text-rose-400">
              <ShieldAlert className="w-5 h-5 shrink-0 mt-0.5" />
              <div>
                <h5 className="text-xs font-bold uppercase tracking-wider">Redis Server Dependency</h5>
                <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                  Enabling workers transforms Synapse into a multi-process matrix stack. This requires a background Redis daemon to route cross-worker communications. If disabled or port 6379 is blocked, services will fail to authenticate.
                </p>
              </div>
            </div>

            {!isReadOnly && !isModerator && (
              <div className="flex justify-end pt-4">
                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-xl bg-rose-500 text-white font-bold text-sm shadow-[0_0_15px_rgba(244,63,94,0.3)] hover:scale-105 transition-transform"
                >
                  Save & Apply Workers
                </button>
              </div>
            )}
          </form>
        )}

        {/* VIEW 4: LIMITS & POLICIES */}
        {activeTab === 'policies' && (
          <form onSubmit={handleSavePolicies} className="space-y-6" id="form-policies">
            <div className="flex items-center gap-3 pb-4 border-b border-white/5">
              <Sliders className="w-6 h-6 text-cyan-400" />
              <div>
                <h2 className="text-xl font-display font-bold text-white">Limits, Rates & Retention Policies</h2>
                <p className="text-xs text-slate-400">Configure message rate limiting, media retention thresholds, and registration switches.</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider block mb-1.5">Max Media Upload Size (MB)</label>
                <input
                  type="number"
                  value={limitMb}
                  onChange={(e) => setLimitMb(e.target.value)}
                  disabled={isReadOnly}
                  className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-slate-200 focus:outline-none focus:border-cyan-500/50"
                  placeholder="50"
                  min={1}
                />
                <p className="text-[10px] text-slate-400 mt-1">Limits max file size attachments transmitted inside chats (images, pdfs, audio).</p>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider block mb-1.5">Public Account Registration</label>
                <select
                  value={regEnabled ? "true" : "false"}
                  onChange={(e) => setRegEnabled(e.target.value === "true")}
                  disabled={isReadOnly}
                  className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-slate-200 focus:outline-none focus:border-cyan-500/50"
                >
                  <option value="true">Allowed (Closed Invitation / LDAP override)</option>
                  <option value="false">Locked (Admin Registration Only)</option>
                </select>
                <p className="text-[10px] text-slate-400 mt-1">Permit users to sign up using standard client register buttons.</p>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider block mb-1.5">Message Retention Period (Days)</label>
                <input
                  type="number"
                  value={messageRetentionDays}
                  onChange={(e) => setMessageRetentionDays(e.target.value)}
                  disabled={isReadOnly}
                  className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-slate-200 focus:outline-none focus:border-cyan-500/50"
                  placeholder="0"
                  min={0}
                />
                <p className="text-[10px] text-slate-400 mt-1">Delete all server-side logs & messages older than this. Set to 0 to preserve infinitely.</p>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider block mb-1.5">Presence System Tracking</label>
                <select
                  value={presenceEnabled ? "true" : "false"}
                  onChange={(e) => setPresenceEnabled(e.target.value === "true")}
                  disabled={isReadOnly}
                  className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-slate-200 focus:outline-none focus:border-cyan-500/50"
                >
                  <option value="true">Enable Online/Offline Status Tracking</option>
                  <option value="false">Untracked (Improves Server Scaling & CPU Usage)</option>
                </select>
                <p className="text-[10px] text-slate-400 mt-1">Disabling presence prevents high frequency status messages between federation nodes.</p>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider block mb-1.5">Local Media Retention (Days)</label>
                <input
                  type="number"
                  value={mediaRetentionLocalDays}
                  onChange={(e) => setMediaRetentionLocalDays(e.target.value)}
                  disabled={isReadOnly}
                  className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-slate-200 focus:outline-none"
                  placeholder="0"
                  min={0}
                />
                <p className="text-[10px] text-slate-400 mt-1">Prune files and media uploaded by local users after this period. 0 = disabled.</p>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider block mb-1.5">Remote Cached Media Retention (Days)</label>
                <input
                  type="number"
                  value={mediaRetentionRemoteDays}
                  onChange={(e) => setMediaRetentionRemoteDays(e.target.value)}
                  disabled={isReadOnly}
                  className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-slate-200 focus:outline-none"
                  placeholder="0"
                  min={0}
                />
                <p className="text-[10px] text-slate-400 mt-1">Prune cached media files mirrored from federated remote servers. 0 = disabled.</p>
              </div>

              <div className="p-4 rounded-2xl bg-black/25 border border-white/5 space-y-3 md:col-span-2">
                <h4 className="text-xs font-bold text-white uppercase tracking-wider">Message Sending Rate Limits</h4>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-[10px] uppercase tracking-wider font-semibold text-slate-400 block mb-1">Messages Per Second</label>
                    <input
                      type="text"
                      value={rateLimitPerSec}
                      onChange={(e) => setRateLimitPerSec(e.target.value)}
                      disabled={isReadOnly}
                      className="w-full bg-black/40 border border-white/10 rounded-xl px-3 py-2 text-xs text-slate-200"
                      placeholder="0.2"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] uppercase tracking-wider font-semibold text-slate-400 block mb-1">Burst Message Count</label>
                    <input
                      type="number"
                      value={rateLimitBurst}
                      onChange={(e) => setRateLimitBurst(e.target.value)}
                      disabled={isReadOnly}
                      className="w-full bg-black/40 border border-white/10 rounded-xl px-3 py-2 text-xs text-slate-200"
                      placeholder="10"
                      min={1}
                    />
                  </div>
                </div>
                <p className="text-[10px] text-slate-400">
                  Controls spam levels organization-wide. If exceeded, users receive "You are sending messages too fast" errors.
                </p>
              </div>

              <div className="md:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-start gap-3 p-4 rounded-2xl bg-black/25 border border-white/5">
                  <input
                    type="checkbox"
                    id="policy-room-creation"
                    checked={roomCreationAllow}
                    onChange={(e) => setRoomCreationAllow(e.target.checked)}
                    disabled={isReadOnly}
                    className="rounded border-white/10 bg-black/40 text-cyan-500 focus:ring-0 mt-0.5"
                  />
                  <div>
                    <label htmlFor="policy-room-creation" className="text-xs font-bold text-white block">
                      Permit Room Creation
                    </label>
                    <p className="text-[10px] text-slate-400 mt-0.5">
                      Allow non-admin users to create public and private rooms. If unchecked, room creation is restricted.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-4 rounded-2xl bg-black/25 border border-white/5">
                  <input
                    type="checkbox"
                    id="policy-directory-search"
                    checked={directorySearchEnabled}
                    onChange={(e) => setDirectorySearchEnabled(e.target.checked)}
                    disabled={isReadOnly}
                    className="rounded border-white/10 bg-black/40 text-cyan-500 focus:ring-0 mt-0.5"
                  />
                  <div>
                    <label htmlFor="policy-directory-search" className="text-xs font-bold text-white block">
                      Enable User Directory Search
                    </label>
                    <p className="text-[10px] text-slate-400 mt-0.5">
                      Allows users to search for others on the local homeserver by email or username part.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {!isReadOnly && (
              <div className="flex justify-end pt-4">
                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-xl bg-cyan-500 text-slate-950 font-bold text-sm shadow-[0_0_15px_rgba(14,165,233,0.3)] hover:scale-105 transition-transform"
                >
                  Save & Apply Policies
                </button>
              </div>
            )}
          </form>
        )}

        {/* VIEW 5: SMTP MAIL SERVER */}
        {activeTab === 'smtp' && (
          <form onSubmit={handleSaveSmtp} className="space-y-6" id="form-smtp">
            <div className="flex items-center gap-3 pb-4 border-b border-white/5">
              <Mail className="w-6 h-6 text-amber-400" />
              <div>
                <h2 className="text-xl font-display font-bold text-white">SMTP Email Gateway</h2>
                <p className="text-xs text-slate-400">Configure email alerts, push notification digests, and user registration verification messages.</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider block mb-1.5">SMTP Host Server</label>
                <input
                  type="text"
                  value={smtpHost}
                  onChange={(e) => setSmtpHost(e.target.value)}
                  disabled={isReadOnly}
                  className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-slate-200 focus:outline-none focus:border-amber-500/50"
                  placeholder="smtp.company.local"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider block mb-1.5">SMTP Server Port</label>
                <input
                  type="text"
                  value={smtpPort}
                  onChange={(e) => setSmtpPort(e.target.value)}
                  disabled={isReadOnly}
                  className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-slate-200 focus:outline-none focus:border-amber-500/50"
                  placeholder="587"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider block mb-1.5">SMTP Username / Login</label>
                <input
                  type="text"
                  value={smtpUser}
                  onChange={(e) => setSmtpUser(e.target.value)}
                  disabled={isReadOnly}
                  className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-slate-200 focus:outline-none focus:border-amber-500/50"
                  placeholder="smtp_user"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider block mb-1.5">SMTP Password</label>
                <input
                  type="password"
                  value={smtpPass}
                  onChange={(e) => setSmtpPass(e.target.value)}
                  disabled={isReadOnly}
                  className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-slate-200 focus:outline-none focus:border-amber-500/50"
                  placeholder="••••••••"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider block mb-1.5">Sender From Header (`From` Address)</label>
                <input
                  type="text"
                  value={notifFrom}
                  onChange={(e) => setNotifFrom(e.target.value)}
                  disabled={isReadOnly}
                  className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-slate-200 focus:outline-none focus:border-amber-500/50"
                  placeholder="Matrix <noreply@company.local>"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider block mb-1.5">Application Brand Name</label>
                <input
                  type="text"
                  value={appName}
                  onChange={(e) => setAppName(e.target.value)}
                  disabled={isReadOnly}
                  className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-slate-200 focus:outline-none focus:border-amber-500/50"
                  placeholder="Matrix"
                />
              </div>
            </div>

            {!isReadOnly && (
              <div className="flex justify-end pt-4">
                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-xl bg-amber-500 text-slate-950 font-bold text-sm shadow-[0_0_15px_rgba(245,158,11,0.3)] hover:scale-105 transition-transform"
                >
                  Save SMTP Credentials
                </button>
              </div>
            )}
          </form>
        )}

        {/* VIEW 6: CLIENT DEFAULTS */}
        {activeTab === 'client' && (
          <form onSubmit={handleSaveClient} className="space-y-6" id="form-client">
            <div className="flex items-center gap-3 pb-4 border-b border-white/5">
              <Layout className="w-6 h-6 text-sky-400" />
              <div>
                <h2 className="text-xl font-display font-bold text-white">Element Client Defaults</h2>
                <p className="text-xs text-slate-400">Configure pre-loaded defaults inside `config.json` parsed by the web client.</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider block mb-1.5">Integration Manager UI URL</label>
                <input
                  type="text"
                  value={integrationsUiUrl}
                  onChange={(e) => setIntegrationsUiUrl(e.target.value)}
                  disabled={isReadOnly}
                  className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-slate-200 focus:outline-none focus:border-sky-500/50"
                  placeholder="https://scalar.vector.im"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider block mb-1.5">Integration Manager REST API URL</label>
                <input
                  type="text"
                  value={integrationsRestUrl}
                  onChange={(e) => setIntegrationsRestUrl(e.target.value)}
                  disabled={isReadOnly}
                  className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-slate-200 focus:outline-none"
                  placeholder="https://scalar.vector.im/api"
                />
              </div>

              <div className="md:col-span-2">
                <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider block mb-1.5">Element Call Video Server URL</label>
                <input
                  type="text"
                  value={elementCallUrl}
                  onChange={(e) => setElementCallUrl(e.target.value)}
                  disabled={isReadOnly}
                  className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-slate-200 focus:outline-none"
                  placeholder="https://call.element.io"
                />
              </div>

              <div className="md:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                <div className="flex items-start gap-3 p-4 rounded-2xl bg-black/25 border border-white/5">
                  <input
                    type="checkbox"
                    id="client-typing-notif"
                    checked={typingNotifs}
                    onChange={(e) => setTypingNotifs(e.target.checked)}
                    disabled={isReadOnly}
                    className="rounded border-white/10 bg-black/40 text-sky-500 focus:ring-0 mt-0.5"
                  />
                  <div>
                    <label htmlFor="client-typing-notif" className="text-xs font-bold text-white block">
                      Send Typing Notifications
                    </label>
                    <p className="text-[10px] text-slate-400 mt-0.5">
                      Show "alice is typing..." bubbles when editing message drafts.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-4 rounded-2xl bg-black/25 border border-white/5">
                  <input
                    type="checkbox"
                    id="client-read-receipt"
                    checked={readReceipts}
                    onChange={(e) => setReadReceipts(e.target.checked)}
                    disabled={isReadOnly}
                    className="rounded border-white/10 bg-black/40 text-sky-500 focus:ring-0 mt-0.5"
                  />
                  <div>
                    <label htmlFor="client-read-receipt" className="text-xs font-bold text-white block">
                      Transmit Read Receipts
                    </label>
                    <p className="text-[10px] text-slate-400 mt-0.5">
                      Update avatar markers on read bounds, tracking exact unread indexes.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-4 rounded-2xl bg-black/25 border border-white/5">
                  <input
                    type="checkbox"
                    id="client-profile-name"
                    checked={profileEditName}
                    onChange={(e) => setProfileEditName(e.target.checked)}
                    disabled={isReadOnly}
                    className="rounded border-white/10 bg-black/40 text-sky-500 focus:ring-0 mt-0.5"
                  />
                  <div>
                    <label htmlFor="client-profile-name" className="text-xs font-bold text-white block">
                      Allow Display Name Changes
                    </label>
                    <p className="text-[10px] text-slate-400 mt-0.5">
                      Permit users to modify their global display name attribute from client side.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-4 rounded-2xl bg-black/25 border border-white/5">
                  <input
                    type="checkbox"
                    id="client-profile-avatar"
                    checked={profileEditAvatar}
                    onChange={(e) => setProfileEditAvatar(e.target.checked)}
                    disabled={isReadOnly}
                    className="rounded border-white/10 bg-black/40 text-sky-500 focus:ring-0 mt-0.5"
                  />
                  <div>
                    <label htmlFor="client-profile-avatar" className="text-xs font-bold text-white block">
                      Allow Avatar Picture Changes
                    </label>
                    <p className="text-[10px] text-slate-400 mt-0.5">
                      Permit users to upload display avatar icons into server repository.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {!isReadOnly && (
              <div className="flex justify-end pt-4">
                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-xl bg-sky-500 text-slate-950 font-bold text-sm shadow-[0_0_15px_rgba(14,165,233,0.3)] hover:scale-105 transition-transform"
                >
                  Save Client Options
                </button>
              </div>
            )}
          </form>
        )}

        {/* VIEW 7: MATRIX USERS REGISTRY */}
        {activeTab === 'users' && (
          <div className="space-y-6" id="view-users">
            <div className="flex flex-col md:flex-row md:items-center justify-between pb-4 border-b border-white/5 gap-4">
              <div className="flex items-center gap-3">
                <Users className="w-6 h-6 text-emerald-400" />
                <div>
                  <h2 className="text-xl font-display font-bold text-white">Registered Matrix Accounts</h2>
                  <p className="text-xs text-slate-400">Add, deactivate, or reset user passwords on the local homeserver.</p>
                </div>
              </div>

              {/* Search Bar */}
              <div className="relative">
                <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={userSearch}
                  onChange={(e) => setUserSearch(e.target.value)}
                  placeholder="Search user accounts..."
                  className="bg-black/35 border border-white/10 rounded-full pl-10 pr-4 py-1.5 text-xs text-slate-200 focus:outline-none w-52 focus:w-64 transition-all"
                  id="user-search-input"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Register Form */}
              <div className="spatial-glass rounded-2xl p-5 border border-white/5 h-fit">
                <h4 className="text-sm font-semibold text-white mb-4 flex items-center gap-2">
                  <Plus className="w-4 h-4 text-emerald-400" />
                  Register Account
                </h4>

                <form onSubmit={handleRegisterSubmit} className="space-y-4">
                  <div>
                    <label className="text-[10px] uppercase tracking-wider font-semibold text-slate-400 block mb-1">Localpart / Username</label>
                    <input
                      type="text"
                      value={regUser}
                      onChange={(e) => setRegUser(e.target.value)}
                      disabled={isReadOnly}
                      className="w-full bg-black/40 border border-white/10 rounded-xl px-3 py-2 text-xs text-slate-200 outline-none"
                      placeholder="e.g. alice"
                      id="register-username-input"
                    />
                  </div>

                  <div>
                    <label className="text-[10px] uppercase tracking-wider font-semibold text-slate-400 block mb-1">Initial Password</label>
                    <input
                      type="password"
                      value={regPass}
                      onChange={(e) => setRegPass(e.target.value)}
                      disabled={isReadOnly}
                      className="w-full bg-black/40 border border-white/10 rounded-xl px-3 py-2 text-xs text-slate-200 outline-none"
                      placeholder="••••••••"
                      id="register-password-input"
                    />
                  </div>

                  <div className="flex items-center gap-2.5">
                    <input
                      type="checkbox"
                      id="reg-is-admin"
                      checked={regIsAdmin}
                      onChange={(e) => setRegIsAdmin(e.target.checked)}
                      disabled={isReadOnly}
                      className="rounded border-white/10 bg-black/40 text-emerald-500 focus:ring-0"
                    />
                    <label htmlFor="reg-is-admin" className="text-xs font-semibold text-slate-400">
                      Grant Synapse Admin privileges
                    </label>
                  </div>

                  <button
                    type="submit"
                    disabled={isReadOnly || !regUser.trim() || !regPass.trim()}
                    className="w-full py-2 rounded-xl bg-emerald-500 text-slate-950 font-bold text-xs shadow-lg hover:scale-[1.02] transition-transform disabled:opacity-50"
                  >
                    Register User
                  </button>
                </form>
              </div>

              {/* Users table */}
              <div className="md:col-span-2 space-y-3 max-h-[380px] overflow-y-auto pr-1">
                {reactivateMxid && (
                  <div className="spatial-glass rounded-2xl p-4 border border-emerald-500/20 bg-emerald-500/5 mb-4 space-y-3">
                    <h5 className="text-xs font-bold text-emerald-400 flex items-center gap-1.5 uppercase tracking-wider">
                      <UserCheck className="w-4 h-4" />
                      Reactivate {reactivateMxid}
                    </h5>
                    <form onSubmit={handleReactivateSubmit} className="flex flex-col md:flex-row md:items-end gap-3">
                      <div className="flex-1">
                        <label className="text-[10px] text-slate-400 block mb-1">Set New Password</label>
                        <input
                          type="password"
                          value={reactivatePass}
                          onChange={(e) => setReactivatePass(e.target.value)}
                          className="w-full bg-black/40 border border-white/10 rounded-xl px-3 py-1.5 text-xs text-slate-200"
                          placeholder="••••••••"
                        />
                      </div>
                      <div className="flex items-center gap-2 pb-2">
                        <input
                          type="checkbox"
                          id="reactivate-is-admin"
                          checked={reactivateIsAdmin}
                          onChange={(e) => setReactivateIsAdmin(e.target.checked)}
                        />
                        <label htmlFor="reactivate-is-admin" className="text-xs text-slate-400">Admin</label>
                      </div>
                      <div className="flex gap-2">
                        <button
                          type="submit"
                          className="px-4 py-1.5 rounded-lg bg-emerald-500 text-slate-950 font-bold text-xs"
                        >
                          Unlock User
                        </button>
                        <button
                          type="button"
                          onClick={() => setReactivateMxid(null)}
                          className="px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 text-xs"
                        >
                          Cancel
                        </button>
                      </div>
                    </form>
                  </div>
                )}

                {filteredUsers.length === 0 ? (
                  <div className="text-center py-12 text-slate-500 text-xs">
                    No Matrix users match "{userSearch}" on this homeserver.
                  </div>
                ) : (
                  filteredUsers.map((u) => (
                    <div 
                      key={u.mxid} 
                      className={`spatial-glass rounded-2xl p-4 border transition-all flex items-center justify-between ${
                        u.isDeactivated 
                          ? 'border-red-500/10 bg-red-500/5 opacity-70' 
                          : 'border-white/5 bg-white/5 hover:border-white/10'
                      }`}
                      id={`user-row-${u.mxid.replace(/[@:]/g, '-')}`}
                    >
                      <div className="flex items-center gap-3">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs ${
                          u.isDeactivated ? 'bg-red-500/10 text-red-400' : 'bg-emerald-500/10 text-emerald-400'
                        }`}>
                          {(u.mxid?.charAt(1) || 'U').toUpperCase()}
                        </div>
                        <div>
                          <h4 className="text-xs font-semibold text-white">{u.mxid}</h4>
                          <div className="flex items-center gap-2 mt-1">
                            {u.isAdmin && (
                              <span className="text-[10px] bg-red-500/10 text-red-400 px-1.5 py-0.5 rounded font-mono font-medium">Server Admin</span>
                            )}
                            <span className={`text-[10px] px-1.5 py-0.5 rounded font-mono font-medium ${
                              u.isDeactivated ? 'bg-red-500/10 text-red-400' : 'bg-emerald-500/10 text-emerald-400'
                            }`}>
                              {u.isDeactivated ? "Deactivated" : "Active"}
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        {u.isDeactivated ? (
                          <button
                            onClick={() => !isReadOnly && setReactivateMxid(u.mxid)}
                            disabled={isReadOnly}
                            className="p-2 rounded-xl bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/20 transition-all"
                            title="Reactivate Account"
                          >
                            <UserCheck className="w-4 h-4" />
                          </button>
                        ) : (
                          <button
                            onClick={() => !isReadOnly && onDeactivateUser(u.mxid)}
                            disabled={isReadOnly}
                            className="p-2 rounded-xl bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/10 transition-all"
                            title="Deactivate Account"
                          >
                            <UserMinus className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        )}

        {/* VIEW 8: MEDIA & VIDEO CALLING CONFS */}
        {activeTab === 'video' && (
          <div className="space-y-6">
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
                  onClick={() => showToast ? showToast('success', "Updated group call rooms toggle.") : console.log("Updated group call rooms toggle.")}
                  className="px-4 py-1.5 rounded-lg bg-amber-500 text-slate-950 font-bold text-xs shadow-md"
                >
                  Enable Feature
                </button>
              </div>
            </div>
          </div>
        )}

        {/* VIEW 9: SECURITY & AUTH LOCKDOWNS */}
        {activeTab === 'security' && (
          <div className="space-y-6">
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
                  onClick={() => onExecuteCommand && onExecuteCommand('e2ee_disable')}
                  disabled={isExecuting || userRole === 'Viewer' || userRole === 'Moderator'}
                  className="px-4 py-2 rounded-xl bg-red-500 text-white font-bold text-xs shadow-lg hover:bg-red-600 disabled:opacity-50"
                >
                  {isExecuting ? 'Executing...' : 'Disable Encryption Org-Wide'}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* VIEW 10: MATRIX & SYNAPSE APIS TESTING */}
        {activeTab === 'api' && (
          <div className="space-y-6 h-full flex flex-col">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-white/5 shrink-0">
              <div className="flex items-center gap-3">
                <Activity className="w-6 h-6 text-blue-400 animate-pulse" />
                <div>
                  <h2 className="text-xl font-display font-bold text-white font-display">Matrix & Synapse API Control Hub</h2>
                  <p className="text-xs text-slate-400 font-sans">Inspect, debug, and monitor client and admin specification APIs on the connected server.</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setShowApiSettings(!showApiSettings)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all border ${
                    showApiSettings 
                      ? 'bg-blue-500/20 text-blue-300 border-blue-500/30' 
                      : 'bg-white/5 text-slate-300 border-white/10 hover:bg-white/10'
                  }`}
                >
                  <Terminal className="w-3.5 h-3.5" />
                  <span>{showApiSettings ? 'Hide Custom API Settings' : 'Edit API Settings / Token Override'}</span>
                </button>
                <button
                  onClick={fetchApiReport}
                  disabled={loadingApi}
                  className="flex items-center gap-2 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-lg transition-all disabled:opacity-50"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${loadingApi ? 'animate-spin' : ''}`} />
                  <span>{loadingApi ? 'Checking APIs...' : 'Refresh API Status'}</span>
                </button>
              </div>
            </div>

            {/* Target Server Indicator */}
            {apiReport && (
              <div className="p-4 rounded-2xl bg-white/5 border border-white/5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shrink-0">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-xl bg-blue-500/10 text-blue-400 font-mono text-xs font-bold uppercase">
                    SSH TARGET
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold text-white">Active Server Profile: <span className="text-blue-400">{apiReport.serverName || 'Local Machine'}</span></h3>
                    <p className="text-xs text-slate-400 font-mono">Host Endpoint: {apiReport.host || 'localhost'} | Configured Port: {customApiPort || '8008'}</p>
                  </div>
                </div>
                <div className="text-right text-xs text-slate-500 font-mono">
                  Last verified: {new Date(apiReport.timestamp).toLocaleTimeString()}
                </div>
              </div>
            )}

            {/* Collapsible API Settings / Manual Override Panel */}
            {showApiSettings && (
              <form onSubmit={handleSaveApiConfig} className="p-5 rounded-2xl bg-slate-900/50 border border-blue-500/20 space-y-4 shrink-0">
                <div className="flex items-center gap-2.5 text-blue-400 pb-2 border-b border-white/5">
                  <Terminal className="w-4 h-4" />
                  <span className="text-xs font-bold uppercase tracking-wider">Manual API Configuration & Port Override</span>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="text-xs font-semibold text-slate-400 block mb-1">Matrix / Synapse Listener Port</label>
                    <input
                      type="number"
                      placeholder="8008"
                      value={customApiPort}
                      onChange={(e) => setCustomApiPort(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-white/10 text-white font-mono text-sm focus:border-blue-500 focus:outline-none"
                    />
                    <span className="text-[10px] text-slate-500 mt-1 block">Default Port for Synapse is 8008 or 8448</span>
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-slate-400 block mb-1">Custom API Base URL Override</label>
                    <input
                      type="text"
                      placeholder="http://localhost:8008"
                      value={customApiBaseUrl}
                      onChange={(e) => setCustomApiBaseUrl(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-white/10 text-white font-mono text-sm focus:border-blue-500 focus:outline-none"
                    />
                    <span className="text-[10px] text-slate-500 mt-1 block">Path used by SSH curl requests</span>
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-slate-400 block mb-1">Admin Access Token Override (Optional)</label>
                    <input
                      type="password"
                      placeholder="syt_..."
                      value={customApiToken}
                      onChange={(e) => setCustomApiToken(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-white/10 text-white font-mono text-sm focus:border-blue-500 focus:outline-none"
                    />
                    <span className="text-[10px] text-slate-500 mt-1 block">Bypasses DB/Postgres automatic lookup</span>
                  </div>
                </div>
                <div className="flex justify-end gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowApiSettings(false)}
                    className="px-4 py-2 rounded-xl text-xs font-bold text-slate-400 hover:text-white transition-all"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={savingApiConfig}
                    className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-lg transition-all disabled:opacity-50"
                  >
                    {savingApiConfig ? 'Saving Configuration...' : 'Save & Re-Verify API Connection'}
                  </button>
                </div>
              </form>
            )}

            {loadingApi && !apiReport ? (
              <div className="flex-1 flex flex-col items-center justify-center py-12">
                <RefreshCw className="w-10 h-10 text-blue-400 animate-spin mb-4" />
                <p className="text-sm text-slate-400 font-sans font-medium">Querying homeserver endpoints on connected server...</p>
              </div>
            ) : (
              <div className="flex-1 grid grid-cols-1 lg:grid-cols-5 gap-6 min-h-0 overflow-hidden">
                {/* Endpoints List */}
                <div className="lg:col-span-3 flex flex-col gap-3 overflow-y-auto pr-2">
                  <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1 font-sans">Endpoints Verified</div>
                  {apiReport?.endpoints?.map((ep: any, index: number) => {
                    const isSelected = selectedEndpoint?.path === ep.path;
                    return (
                      <div
                        key={index}
                        onClick={() => setSelectedEndpoint(ep)}
                        className={`p-4 rounded-2xl border transition-all cursor-pointer flex items-center justify-between ${
                          isSelected 
                            ? 'bg-blue-500/10 border-blue-500/30 shadow-md' 
                            : 'bg-white/5 border-white/5 hover:bg-white/10'
                        }`}
                      >
                        <div className="flex items-start gap-3 min-w-0">
                          <div className={`p-2 rounded-xl shrink-0 ${
                            ep.status === 'active' 
                              ? 'bg-emerald-500/10 text-emerald-400' 
                              : ep.status === 'unauthorized'
                              ? 'bg-amber-500/10 text-amber-400'
                              : 'bg-red-500/10 text-red-400'
                          }`}>
                            {ep.status === 'active' ? (
                              <CheckCircle className="w-5 h-5" />
                            ) : ep.status === 'unauthorized' ? (
                              <AlertCircle className="w-5 h-5" />
                            ) : (
                              <XCircle className="w-5 h-5" />
                            )}
                          </div>
                          <div className="min-w-0">
                            <h4 className="text-sm font-semibold text-white truncate font-sans">{ep.name}</h4>
                            <div className="flex items-center gap-2 mt-1">
                              <span className="font-mono text-[10px] bg-slate-800 text-slate-300 px-1.5 py-0.5 rounded uppercase font-bold shrink-0">
                                {ep.method}
                              </span>
                              <span className="font-mono text-xs text-slate-400 truncate">
                                {ep.path}
                              </span>
                            </div>
                          </div>
                        </div>

                        <div className="flex flex-col items-end gap-1.5 shrink-0 ml-3">
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider font-sans ${
                            ep.status === 'active' 
                              ? 'bg-emerald-500/20 text-emerald-300' 
                              : ep.status === 'unauthorized'
                              ? 'bg-amber-500/20 text-amber-300'
                              : 'bg-red-500/20 text-red-300'
                          }`}>
                            {ep.status}
                          </span>
                          <div className="flex items-center gap-1 text-[11px] text-slate-400 font-mono">
                            <Clock className="w-3 h-3" />
                            <span>{ep.latency}ms</span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Response / JSON Inspector */}
                <div className="lg:col-span-2 flex flex-col bg-slate-950/40 rounded-2xl border border-white/5 overflow-hidden h-full">
                  <div className="p-4 border-b border-white/5 bg-slate-900/50 shrink-0">
                    <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2 font-sans">Endpoint Specifications</div>
                    {selectedEndpoint ? (
                      <div>
                        <h4 className="text-sm font-bold text-white mb-1 font-sans">{selectedEndpoint.name}</h4>
                        <p className="text-xs text-slate-400 font-sans leading-relaxed">{selectedEndpoint.description}</p>
                      </div>
                    ) : (
                      <p className="text-xs text-slate-500 font-sans">Select an API endpoint on the left to inspect detailed specifications.</p>
                    )}
                  </div>

                  <div className="flex-1 p-4 overflow-y-auto flex flex-col min-h-0">
                    <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2 flex items-center justify-between shrink-0 font-sans">
                      <span>Live Response Payload</span>
                      <span className="font-mono text-slate-500">HTTP {selectedEndpoint?.statusCode || 200}</span>
                    </div>
                    {selectedEndpoint ? (
                      <pre className="flex-1 font-mono text-[11px] text-blue-300 bg-slate-950 p-4 rounded-xl overflow-auto leading-relaxed border border-white/5">
                        {JSON.stringify(selectedEndpoint.payload, null, 2)}
                      </pre>
                    ) : (
                      <div className="flex-1 flex items-center justify-center border border-dashed border-white/5 rounded-xl text-xs text-slate-600 font-sans">
                        No payload loaded
                      </div>
                    )}
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
