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
  Clock,
  Server,
  Copy,
  FileText,
  Bell,
  Loader2,
  History,
  RotateCcw,
  FileJson,
  UploadCloud,
  CheckSquare,
  Square,
  FolderOpen,
  Trash2,
  Download,
  Calendar,
  Play,
  Save,
  Send,
  AlertTriangle,
  Lock,
  Upload,
  Award,
  KeyRound,
  Eye
} from 'lucide-react';
import { MatrixConfig, LDAPConfig, MatrixUser, BackupItem } from '../types';

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
  backups?: BackupItem[];
  onDeleteBackup?: (id: string) => void;
  onCreateBackup?: (includeSSL?: boolean) => void;
  onSaveConfig: (data: { config?: Partial<MatrixConfig>; ldap?: Partial<LDAPConfig>; workers?: any }) => any;
  onRegisterUser: (username: string, pass: string, isAdmin: boolean) => void;
  onDeactivateUser: (mxid: string) => void;
  onReactivateUser: (mxid: string, pass: string, isAdmin: boolean) => void;
  userRole: string;
  authToken: string;
  showToast?: (type: 'success' | 'error' | 'warning' | 'info', text: string) => void;
  isExecuting?: boolean;
  onExecuteCommand?: (cmd: string, args?: any) => void;
  isLightMode?: boolean;
  lang?: 'fa' | 'en' | 'es' | 'ar' | 'de' | 'ru';
  activeConnectionId?: string;
}

const configFormTranslations = {
  fa: {
    controlHub: "هاب کنترل",
    serverParams: "پارامترهای سرور",
    activeDirectory: "اکتیو دایرکتوری",
    workersScaling: "ورکرها و مقیاس‌پذیری",
    limitsPolicies: "محدودیت‌ها و خط‌مشی‌ها",
    smtpServer: "سرور ایمیل (SMTP)",
    clientDefaults: "پیش‌فرض‌های کلاینت",
    mediaCalling: "رسانه و تماس",
    securityAuth: "امنیت و احراز هویت",
    matrixUsers: "کاربران ماتریکس",
    matrixApis: "ای‌پی‌آی‌های ماتریکس و ساینپس",
    hsTitle: "پیکربندی سرور خانگی (Homeserver)",
    hsSubtitle: "مدیریت آدرس‌های اصلی، دامنه‌ها، دیتابیس پستگرس و گواهی‌های امنیتی.",
    hsDomainLabel: "دامنه سرور ماتریکس",
    elDomainLabel: "دامنه کلاینت المنت",
    baseDomainLabel: "دامنه پایه فدراسیون",
    publicIpLabel: "آدرس IP عمومی نود",
    leEmailLabel: "ایمیل لِتس‌انکریپت (Let's Encrypt)",
    dbTitle: "تنظیمات دیتابیس پست‌گرس (PostgreSQL)",
    dbHost: "میزبان دیتابیس",
    dbPort: "پورت",
    dbName: "نام دیتابیس",
    dbUser: "نام کاربری",
    dbPass: "رمز عبور",
    saveConfigBtn: "ذخیره و اعمال پیکربندی",
    savingConfigBtn: "در حال ذخیره و اعمال..."
  },
  en: {
    controlHub: "Control Hub",
    serverParams: "Server Parameters",
    activeDirectory: "Active Directory",
    workersScaling: "Workers & Scaling",
    limitsPolicies: "Limits & Policies",
    smtpServer: "Email Server (SMTP)",
    clientDefaults: "Client Defaults",
    mediaCalling: "Media & Calling",
    securityAuth: "Security & Auth",
    matrixUsers: "Matrix Users",
    matrixApis: "Matrix & Synapse APIs",
    hsTitle: "Homeserver Configuration",
    hsSubtitle: "Manage base URLs, domains, Postgres coordinates, and security certs.",
    hsDomainLabel: "Matrix server domain",
    elDomainLabel: "Element client domain",
    baseDomainLabel: "Base Federation Domain",
    publicIpLabel: "Node Public IP",
    leEmailLabel: "Let's Encrypt Email",
    dbTitle: "PostgreSQL Relational DB Settings",
    dbHost: "Database Host",
    dbPort: "Port",
    dbName: "DB Name",
    dbUser: "Username",
    dbPass: "Password",
    saveConfigBtn: "Save & Apply Config",
    savingConfigBtn: "Saving & Applying Config..."
  },
  es: {
    controlHub: "Centro de Control",
    serverParams: "Parámetros del Servidor",
    activeDirectory: "Directorio Activo",
    workersScaling: "Trabajadores y Escalado",
    limitsPolicies: "Límites y Políticas",
    smtpServer: "Servidor de Correo (SMTP)",
    clientDefaults: "Valores por Defecto del Cliente",
    mediaCalling: "Medios y Llamadas",
    securityAuth: "Seguridad y Autenticación",
    matrixUsers: "Usuarios de Matrix",
    matrixApis: "APIs de Matrix y Synapse",
    hsTitle: "Configuración del Homeserver",
    hsSubtitle: "Administre URLs base, dominios, coordenadas de Postgres y certificados de seguridad.",
    hsDomainLabel: "Dominio del servidor Matrix",
    elDomainLabel: "Dominio del cliente Element",
    baseDomainLabel: "Dominio Base de Federación",
    publicIpLabel: "IP Pública del Nodo",
    leEmailLabel: "Correo de Let's Encrypt",
    dbTitle: "Configuración de Base de Datos Relacional PostgreSQL",
    dbHost: "Host de la Base de Datos",
    dbPort: "Puerto",
    dbName: "Nombre de la BD",
    dbUser: "Nombre de usuario",
    dbPass: "Contraseña",
    saveConfigBtn: "Guardar y Aplicar Configuración",
    savingConfigBtn: "Guardando y Aplicando Configuración..."
  },
  ar: {
    controlHub: "مركز التحكم",
    serverParams: "معلمات الخادم",
    activeDirectory: "الدليل النشط",
    workersScaling: "العمال والمقاييس",
    limitsPolicies: "الحدود والسياسات",
    smtpServer: "خادم البريد (SMTP)",
    clientDefaults: "افتراضيات العميل",
    mediaCalling: "الوسائط والمكالمات",
    securityAuth: "الأمان والمصادقة",
    matrixUsers: "مستخدمو ماتريكس",
    matrixApis: "واجهات برمجة تطبيقات ماتريكس وساينابس",
    hsTitle: "تكوين خادم هوم سيرفر (Homeserver)",
    hsSubtitle: "إدارة عناوين URL الأساسية والنطاقات وإحداثيات بوستجرس وشهادات الأمان.",
    hsDomainLabel: "نطاق خادم ماتريكس",
    elDomainLabel: "نطاق عميل المنت",
    baseDomainLabel: "نطاق الاتحاد الأساسي",
    publicIpLabel: "عنوان IP العام للعقدة",
    leEmailLabel: "البريد الإلكتروني لـ Let's Encrypt",
    dbTitle: "إعدادات قاعدة بيانات بوستجرس (PostgreSQL)",
    dbHost: "مضيف قاعدة البيانات",
    dbPort: "المنفذ",
    dbName: "اسم قاعدة البيانات",
    dbUser: "اسم المستخدم",
    dbPass: "كلمة المرور",
    saveConfigBtn: "حفظ وتطبيق التكوين",
    savingConfigBtn: "جاري حفظ وتطبيق التكوين..."
  },
  de: {
    controlHub: "Kontrollzentrum",
    serverParams: "Server-Parameter",
    activeDirectory: "Active Directory",
    workersScaling: "Worker & Skalierung",
    limitsPolicies: "Limits & Richtlinien",
    smtpServer: "E-Mail-Server (SMTP)",
    clientDefaults: "Client-Standardwerte",
    mediaCalling: "Medien & Anrufe",
    securityAuth: "Sicherheit & Authentifizierung",
    matrixUsers: "Matrix-Benutzer",
    matrixApis: "Matrix- & Synapse-APIs",
    hsTitle: "Homeserver-Konfiguration",
    hsSubtitle: "Basis-URLs, Domains, Postgres-Koordinaten und Sicherheitszertifikate verwalten.",
    hsDomainLabel: "Matrix-Server-Domain",
    elDomainLabel: "Element-Client-Domain",
    baseDomainLabel: "Basis-Föderationsdomain",
    publicIpLabel: "Öffentliche Node-IP",
    leEmailLabel: "Let's Encrypt E-Mail",
    dbTitle: "PostgreSQL-Datenbankeinstellungen",
    dbHost: "Datenbank-Host",
    dbPort: "Port",
    dbName: "Datenbankname",
    dbUser: "Benutzername",
    dbPass: "Passwort",
    saveConfigBtn: "Konfiguration speichern & anwenden",
    savingConfigBtn: "Konfiguration wird gespeichert & angewendet..."
  },
  ru: {
    controlHub: "Центр управления",
    serverParams: "Параметры сервера",
    activeDirectory: "Active Directory",
    workersScaling: "Воркеры и масштабирование",
    limitsPolicies: "Лимиты и политики",
    smtpServer: "Почтовый сервер (SMTP)",
    clientDefaults: "Настройки клиента",
    mediaCalling: "Медиа и звонки",
    securityAuth: "Безопасность и авторизация",
    matrixUsers: "Пользователи Matrix",
    matrixApis: "API Matrix и Synapse",
    hsTitle: "Конфигурация Homeserver",
    hsSubtitle: "Управление базовыми URL, доменами, базой данных Postgres и сертификатами безопасности.",
    hsDomainLabel: "Домен сервера Matrix",
    elDomainLabel: "Домен клиента Element",
    baseDomainLabel: "Базовый домен федерации",
    publicIpLabel: "Публичный IP узла",
    leEmailLabel: "Электронная почта Let's Encrypt",
    dbTitle: "Настройки базы данных PostgreSQL",
    dbHost: "Хост базы данных",
    dbPort: "Порт",
    dbName: "Имя БД",
    dbUser: "Имя пользователя",
    dbPass: "Пароль",
    saveConfigBtn: "Сохранить и применить",
    savingConfigBtn: "Сохранение и применение..."
  }
};

type TabType = 'homeserver' | 'network' | 'serverNotices' | 'ldap' | 'workers' | 'policies' | 'smtp' | 'client' | 'backups' | 'video' | 'security' | 'api' | 'certificates';

export default function ConfigForms({ 
  config, 
  ldap, 
  workers,
  matrixUsers, 
  backups = [],
  onDeleteBackup,
  onCreateBackup,
  onSaveConfig, 
  onRegisterUser, 
  onDeactivateUser, 
  onReactivateUser,
  userRole,
  authToken,
  showToast,
  isExecuting = false,
  onExecuteCommand,
  isLightMode = false,
  lang = 'en',
  activeConnectionId
}: ConfigFormsProps) {
  const t = configFormTranslations[lang] || configFormTranslations.en;
  const isRtl = lang === 'fa' || lang === 'ar';
  const [activeTab, setActiveTab] = useState<TabType>('homeserver');
  const [isSaving, setIsSaving] = useState(false);
  
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

  const [workersStatus, setWorkersStatus] = useState<{
    enabled: boolean;
    hasWorkersTemplate: boolean;
    configuredWorkersCount: number;
    workerBasePort: number;
    federationSenderEnabled: boolean;
    redisInstalled: boolean;
    redisRunning: boolean;
    redisPort: string;
    synapseWorkersActiveCount: number;
    workersDetails: string[];
    errors?: string[];
  } | null>(null);
  const [loadingWorkers, setLoadingWorkers] = useState<boolean>(false);

  const fetchWorkersStatus = () => {
    if (!authToken) return;
    setLoadingWorkers(true);
    fetch('/api/matrix/workers/status', {
      headers: {
        'Authorization': `Bearer ${authToken}`
      }
    })
      .then(res => res.json())
      .then(data => {
        setWorkersStatus(data);
        if (data.enabled !== undefined) {
          setWorkersEnabled(data.enabled);
        }
        if (data.configuredWorkersCount !== undefined && data.configuredWorkersCount > 0) {
          setWorkersCount(data.configuredWorkersCount);
        }
        if (data.workerBasePort !== undefined && data.workerBasePort > 0) {
          setWorkersBasePort(data.workerBasePort);
        }
        if (data.federationSenderEnabled !== undefined) {
          setWorkersFedSender(data.federationSenderEnabled);
        }
        setLoadingWorkers(false);
      })
      .catch(err => {
        console.error("Failed to fetch workers status", err);
        setLoadingWorkers(false);
      });
  };

  // 3. Workers Config State
  const [workersEnabled, setWorkersEnabled] = useState(false);
  const [workersCount, setWorkersCount] = useState(2);
  const [workersFedSender, setWorkersFedSender] = useState(false);
  const [workersBasePort, setWorkersBasePort] = useState(8083);
  const [showConfirmInstall, setShowConfirmInstall] = useState(false);

  // Synapse Server Notices Configuration State
  const [snLocalpart, setSnLocalpart] = useState('server');
  const [snDisplayName, setSnDisplayName] = useState('🚨 Administrator 🚨');
  const [snAvatarUrl, setSnAvatarUrl] = useState('');
  const [snRoomName, setSnRoomName] = useState('System ℹ️');
  const [snAutoJoin, setSnAutoJoin] = useState(true);
  const [isSavingSN, setIsSavingSN] = useState(false);
  const [loadingSN, setLoadingSN] = useState(false);

  const fetchServerNoticesConfig = async () => {
    if (!authToken) return;
    setLoadingSN(true);
    try {
      const res = await fetch('/api/matrix/server-notices/config', {
        headers: { 'Authorization': `Bearer ${authToken}` }
      });
      if (res.ok) {
        const data = await res.json();
        setSnLocalpart(data.system_mxid_localpart || 'server');
        setSnDisplayName(data.system_mxid_display_name || '🚨 Administrator 🚨');
        setSnAvatarUrl(data.system_mxid_avatar_url || '');
        setSnRoomName(data.room_name || 'System ℹ️');
        setSnAutoJoin(data.auto_join !== false);
      }
    } catch (e) {
      console.error('Fetch server notices config error:', e);
    } finally {
      setLoadingSN(false);
    }
  };

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

  // Display Name, Avatar & Room Creation Policy States
  const [displayNamePolicyEnabled, setDisplayNamePolicyEnabled] = useState<boolean>(true);
  const [displayNamePolicyInitialState, setDisplayNamePolicyInitialState] = useState<boolean>(true);
  const [avatarPolicyEnabled, setAvatarPolicyEnabled] = useState<boolean>(true);
  const [avatarPolicyInitialState, setAvatarPolicyInitialState] = useState<boolean>(true);
  const [roomCreationPolicyEnabled, setRoomCreationPolicyEnabled] = useState<boolean>(true);
  const [roomCreationPolicyInitialState, setRoomCreationPolicyInitialState] = useState<boolean>(true);
  const [displayNamePolicySourceFile, setDisplayNamePolicySourceFile] = useState<string>('/etc/synapse/conf.d/display_name.yaml');
  const [loadingDisplayNamePolicy, setLoadingDisplayNamePolicy] = useState<boolean>(false);
  const [updatingDisplayNamePolicy, setUpdatingDisplayNamePolicy] = useState<boolean>(false);
  const [showDisplayNameConfirmModal, setShowDisplayNameConfirmModal] = useState<boolean>(false);

  const fetchDisplayNamePolicy = async () => {
    setLoadingDisplayNamePolicy(true);
    try {
      const res = await fetch('/api/matrix/config/display-name-policy', {
        headers: {
          'Authorization': `Bearer ${authToken}`
        }
      });
      if (res.ok) {
        const contentType = res.headers.get("content-type");
        if (contentType && contentType.includes("application/json")) {
          const data = await res.json();
          const dnVal = data.displayNameEnabled ?? data.enabled ?? true;
          const avVal = data.avatarEnabled ?? true;
          const rcVal = data.roomCreationEnabled ?? true;
          setDisplayNamePolicyEnabled(dnVal);
          setDisplayNamePolicyInitialState(dnVal);
          setProfileEditName(dnVal);
          setAvatarPolicyEnabled(avVal);
          setAvatarPolicyInitialState(avVal);
          setProfileEditAvatar(avVal);
          setRoomCreationPolicyEnabled(rcVal);
          setRoomCreationPolicyInitialState(rcVal);
          setRoomCreationAllow(rcVal);
          if (data.sourceFile) setDisplayNamePolicySourceFile(data.sourceFile);
        }
      }
    } catch (err) {
      console.error('Failed to fetch profile policy:', err);
    } finally {
      setLoadingDisplayNamePolicy(false);
    }
  };

  useEffect(() => {
    if (activeTab === 'policies') {
      fetchDisplayNamePolicy();
    }
  }, [activeConnectionId, authToken, activeTab]);

  const handleDisplayNameToggleClick = () => {
    if (isReadOnly || isModerator || updatingDisplayNamePolicy || loadingDisplayNamePolicy) return;
    setDisplayNamePolicyEnabled(prev => !prev);
  };

  const handleAvatarToggleClick = () => {
    if (isReadOnly || isModerator || updatingDisplayNamePolicy || loadingDisplayNamePolicy) return;
    setAvatarPolicyEnabled(prev => !prev);
  };

  const handleRoomCreationToggleClick = () => {
    if (isReadOnly || isModerator || updatingDisplayNamePolicy || loadingDisplayNamePolicy) return;
    setRoomCreationPolicyEnabled(prev => {
      const next = !prev;
      setRoomCreationAllow(next);
      return next;
    });
  };

  const confirmDisplayNamePolicyChange = async () => {
    setShowDisplayNameConfirmModal(false);
    setUpdatingDisplayNamePolicy(true);
    try {
      await onSaveConfig({
        config: {
          LIMIT_MB: limitMb,
          REGISTRATION_ENABLED: regEnabled,
          MESSAGE_RETENTION_DAYS: messageRetentionDays,
          MEDIA_RETENTION_LOCAL_DAYS: mediaRetentionLocalDays,
          MEDIA_RETENTION_REMOTE_DAYS: mediaRetentionRemoteDays,
          PRESENCE_ENABLED: presenceEnabled,
          DIRECTORY_SEARCH_ENABLED: directorySearchEnabled,
          RATE_LIMIT_PER_SEC: rateLimitPerSec,
          RATE_LIMIT_BURST: rateLimitBurst,
          DISABLE_CUSTOM_URLS: !allowCustomUrls,
          TYPING_NOTIFS_ENABLED: typingNotifs,
          READ_RECEIPTS_ENABLED: readReceipts,
          PROFILE_EDIT_NAME_ENABLED: profileEditName,
          PROFILE_EDIT_AVATAR_ENABLED: profileEditAvatar
        }
      });

      const policyPayload: any = {};
      if (displayNamePolicyEnabled !== displayNamePolicyInitialState) {
        policyPayload.displayNameEnabled = displayNamePolicyEnabled;
      }
      if (avatarPolicyEnabled !== avatarPolicyInitialState) {
        policyPayload.avatarEnabled = avatarPolicyEnabled;
      }
      if (roomCreationPolicyEnabled !== roomCreationPolicyInitialState) {
        policyPayload.roomCreationEnabled = roomCreationPolicyEnabled;
      }
      if (Object.keys(policyPayload).length === 0) {
        policyPayload.displayNameEnabled = displayNamePolicyEnabled;
        policyPayload.avatarEnabled = avatarPolicyEnabled;
        policyPayload.roomCreationEnabled = roomCreationPolicyEnabled;
      }

      const res = await fetch('/api/matrix/config/display-name-policy', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authToken}`
        },
        body: JSON.stringify(policyPayload)
      });

      const contentType = res.headers.get("content-type");
      let data: any = {};
      if (contentType && contentType.includes("application/json")) {
        data = await res.json();
      } else {
        const rawText = await res.text();
        throw new Error(`Server response error (${res.status}): ${rawText.slice(0, 80)}`);
      }

      if (res.ok && data.success) {
        setDisplayNamePolicyInitialState(displayNamePolicyEnabled);
        setAvatarPolicyInitialState(avatarPolicyEnabled);
        setRoomCreationPolicyInitialState(roomCreationPolicyEnabled);
        if (data.sourceFile) setDisplayNamePolicySourceFile(data.sourceFile);
        if (showToast) showToast('success', 'Configuration policies updated and Synapse service restarted successfully.');
      } else {
        const errMsg = data.message || data.error || 'Failed to update Configuration Policies';
        if (showToast) showToast('error', errMsg);
      }
    } catch (err: any) {
      if (showToast) showToast('error', err.message || 'Network error while updating policy');
    } finally {
      setUpdatingDisplayNamePolicy(false);
      fetchDisplayNamePolicy();
    }
  };

  // 5. SMTP States
  const [smtpHost, setSmtpHost] = useState('smtp.company.local');
  const [smtpPort, setSmtpPort] = useState('587');
  const [smtpUser, setSmtpUser] = useState('');
  const [smtpPass, setSmtpPass] = useState('');
  const [notifFrom, setNotifFrom] = useState('Matrix <noreply@company.local>');
  const [appName, setAppName] = useState('Matrix');
  const [smtpEnableNotifs, setSmtpEnableNotifs] = useState<boolean>(true);
  const [smtpRequireTls, setSmtpRequireTls] = useState<boolean>(true);
  const [smtpEnableTls, setSmtpEnableTls] = useState<boolean>(true);
  const [smtpClientBaseUrl, setSmtpClientBaseUrl] = useState<string>('');
  const [testEmailAddress, setTestEmailAddress] = useState('');
  const [testingSmtp, setTestingSmtp] = useState(false);
  const [smtpTestResult, setSmtpTestResult] = useState<{ success: boolean; msg: string } | null>(null);

  const handleTestSmtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!testEmailAddress || !testEmailAddress.trim()) {
      if (showToast) showToast('error', lang === 'fa' ? 'لطفاً آدرس ایمیل گیرنده آزمایشی را وارد کنید.' : 'Please enter a target recipient email address.');
      return;
    }
    setTestingSmtp(true);
    setSmtpTestResult(null);

    try {
      const token = authToken || localStorage.getItem('admin_token') || localStorage.getItem('token') || localStorage.getItem('matrix_auth_token') || '';
      const res = await fetch('/api/matrix/smtp/test', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': token ? `Bearer ${token}` : '',
          'Accept-Language': lang || 'en'
        },
        body: JSON.stringify({
          smtpHost,
          smtpPort,
          smtpUser,
          smtpPass,
          smtpRequireTls,
          smtpEnableTls,
          notifFrom,
          appName,
          testEmail: testEmailAddress,
          lang: lang || 'en'
        })
      });

      const contentType = res.headers.get('content-type');
      let data: any = {};
      if (contentType && contentType.includes('application/json')) {
        data = await res.json();
      } else {
        const rawText = await res.text();
        data = {
          success: false,
          msg: res.status === 401
            ? (lang === 'fa' ? '❌ عدم احراز هویت (401 Unauthorized). لطفاً مجدداً وارد سیستم شوید.' : '❌ Unauthorized (401). Please re-login.')
            : res.status === 404 
              ? (lang === 'fa' ? '❌ مسیر API ارسال تست ایمیل روی سرور یافت نشد.' : '❌ SMTP test API endpoint not found on server.')
              : `❌ Error (${res.status}): ${rawText.slice(0, 150)}`
        };
      }

      if (data.success) {
        setSmtpTestResult({ success: true, msg: data.msg });
        if (showToast) showToast('success', data.msg);
      } else {
        setSmtpTestResult({ success: false, msg: data.msg });
        if (showToast) showToast('error', data.msg);
      }
    } catch (err: any) {
      const errText = err.message || (lang === 'fa' ? 'خطا در ارتباط با سرور' : 'Server connection error');
      setSmtpTestResult({ success: false, msg: errText });
      if (showToast) showToast('error', errText);
    } finally {
      setTestingSmtp(false);
    }
  };

  // 6. Element Defaults States
  const [typingNotifs, setTypingNotifs] = useState(true);
  const [readReceipts, setReadReceipts] = useState(true);
  const [profileEditName, setProfileEditName] = useState(true);
  const [profileEditAvatar, setProfileEditAvatar] = useState(true);
  const [integrationsUiUrl, setIntegrationsUiUrl] = useState('https://scalar.vector.im');
  const [integrationsRestUrl, setIntegrationsRestUrl] = useState('https://scalar.vector.im/api');
  const [elementCallUrl, setElementCallUrl] = useState('https://call.element.io');

  // Web Client Homeserver Lock Policy State
  const [allowCustomUrls, setAllowCustomUrls] = useState<boolean>(true);

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
  const [customAdminUsername, setCustomAdminUsername] = useState<string>('');
  const [customAdminPassword, setCustomAdminPassword] = useState<string>('');
  const [copiedLogs, setCopiedLogs] = useState<boolean>(false);
  const [showApiSettings, setShowApiSettings] = useState<boolean>(false);
  const [savingApiConfig, setSavingApiConfig] = useState<boolean>(false);

  // Advanced Backups States & Functions
  const [backupSettings, setBackupSettings] = useState<{
    backupPath: string;
    retentionDays: number;
    dbSchedule: { enabled: boolean; cron: string };
    configSchedule: { enabled: boolean; cron: string };
  }>({
    backupPath: '/sandbox/backups',
    retentionDays: 30,
    dbSchedule: { enabled: false, cron: '0 2 * * *' },
    configSchedule: { enabled: false, cron: '0 3 * * *' }
  });

  const [includeSSL, setIncludeSSL] = useState(false);
  const [selectedBackupIds, setSelectedBackupIds] = useState<string[]>([]);
  const [isTriggeringBackup, setIsTriggeringBackup] = useState<boolean>(false);
  const [showRestoreModal, setShowRestoreModal] = useState<BackupItem | null>(null);
  const [isRestoring, setIsRestoring] = useState(false);
  const [activeBackupSubTab, setActiveBackupSubTab] = useState<'list' | 'settings'>('list');

  const fetchBackupSettings = async () => {
    if (!authToken) return;
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
    if (activeTab === 'backups') {
      fetchBackupSettings();
    }
  }, [activeTab, authToken]);

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
        if (showToast) showToast('success', lang === 'fa' ? 'تنظیمات زمان‌بندی با موفقیت ذخیره شد' : 'Backup settings saved successfully');
        fetchBackupSettings();
      } else {
        if (showToast) showToast('error', lang === 'fa' ? 'خطا در ذخیره‌سازی تنظیمات' : 'Error saving backup settings');
      }
    } catch (err) {
      if (showToast) showToast('error', lang === 'fa' ? 'خطا در ارتباط با سرور' : 'Server connection error');
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
        if (showToast) showToast('success', `${type === 'config' ? (lang === 'fa' ? 'نسخه پشتیبان تنظیمات' : 'Configuration') : (lang === 'fa' ? 'نسخه پشتیبان دیتابیس' : 'Database')} ${lang === 'fa' ? 'با موفقیت ایجاد شد' : 'backup created successfully'}`);
        if (onCreateBackup) onCreateBackup(includeSSL);
      } else {
        if (showToast) showToast('error', lang === 'fa' ? 'خطا در ایجاد نسخه پشتیبان' : 'Error creating backup');
      }
    } catch (err) {
      if (showToast) showToast('error', lang === 'fa' ? 'خطا در ارتباط با سرور' : 'Server connection error');
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
      if (showToast) showToast('success', lang === 'fa' ? 'فایل پشتیبان با موفقیت دانلود شد' : 'Backup file downloaded successfully');
    })
    .catch(() => { if (showToast) showToast('error', lang === 'fa' ? 'خطا در دانلود فایل پشتیبان' : 'Error downloading backup file'); });
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
      if (showToast) showToast('success', lang === 'fa' ? 'فایل‌های پشتیبان گروهی با موفقیت دانلود شدند' : 'Bulk backups downloaded successfully');
    })
    .catch(() => { if (showToast) showToast('error', lang === 'fa' ? 'خطا در دانلود گروهی فایل‌های پشتیبان' : 'Error downloading bulk backups'); });
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
        if (showToast) showToast('success', `Backup ${backup.filename} ${lang === 'fa' ? 'با موفقیت بازیابی شد' : 'restored successfully. System recovered.'}`);
        setShowRestoreModal(null);
      } else {
        const err = await res.json();
        if (showToast) showToast('error', `${lang === 'fa' ? 'خطا در بازیابی نسخه پشتیبان:' : 'Error restoring backup:'} ${err.error || 'Unknown error'}`);
      }
    } catch (err) {
      if (showToast) showToast('error', lang === 'fa' ? 'خطا در ارتباط حین بازیابی نسخه پشتیبان' : 'Connection error during backup restoration');
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
          if (showToast) showToast('success', lang === 'fa' ? 'فایل پشتیبان با موفقیت بارگذاری شد' : 'Backup file uploaded and saved successfully');
          if (onCreateBackup) onCreateBackup(false);
        } else {
          if (showToast) showToast('error', lang === 'fa' ? 'خطا در بارگذاری فایل پشتیبان' : 'Error uploading backup file');
        }
      } catch (err) {
        if (showToast) showToast('error', lang === 'fa' ? 'خطا در بارگذاری فایل پشتیبان' : 'Error uploading backup file');
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
    const allBackups = backups || [];
    if (selectedBackupIds.length === allBackups.length) {
      setSelectedBackupIds([]);
    } else {
      setSelectedBackupIds(allBackups.map(b => b.id));
    }
  };

  // Network & Backups State
  const [listenMode, setListenMode] = useState<'localhost' | 'all' | 'custom'>('all');
  const [listenCustomIp, setListenCustomIp] = useState<string>('');
  const [backupsList, setBackupsList] = useState<any[]>([]);
  const [loadingBackups, setLoadingBackups] = useState<boolean>(false);
  const [rollingBack, setRollingBack] = useState<boolean>(false);
  const [networkStatus, setNetworkStatus] = useState<any>(null);
  const [loadingNetworkStatus, setLoadingNetworkStatus] = useState<boolean>(false);

  const fetchNetworkStatus = async () => {
    if (!authToken) return;
    setLoadingNetworkStatus(true);
    try {
      const res = await fetch('/api/matrix/config/network-status', {
        headers: { 'Authorization': `Bearer ${authToken}` }
      });
      if (res.ok) {
        const data = await res.json();
        setNetworkStatus(data);
        if (data.listenMode) {
          setListenMode(data.listenMode);
        }
        if (data.customIp) {
          setListenCustomIp(data.customIp);
        }
      }
    } catch (e) {
      console.error("Failed to load network status", e);
    } finally {
      setLoadingNetworkStatus(false);
    }
  };

  const fetchBackups = async () => {
    if (!authToken) return;
    setLoadingBackups(true);
    try {
      const res = await fetch('/api/matrix/config/backups', {
        headers: { 'Authorization': `Bearer ${authToken}` }
      });
      if (res.ok) {
        const data = await res.json();
        setBackupsList(data.backups || []);
      }
    } catch (e) {
      console.error("Failed to load backups", e);
    } finally {
      setLoadingBackups(false);
    }
  };

  const handleSaveNetworkSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    runAsyncSave(async () => {
      await onSaveConfig({
        config: {
          LISTEN_MODE: listenMode,
          LISTEN_CUSTOM_IP: listenCustomIp
        }
      });
      fetchBackups();
      fetchNetworkStatus();
    });
  };

  const handleRollback = async (backupFilename?: string) => {
    if (!window.confirm(lang === 'fa' ? "آیا از بازگردانی این نسخه پشتیبان مطمئن هستید؟ این کار تنظیمات و سرویس Matrix Synapse را ریستارت می‌کند." : "Are you sure you want to rollback to this configuration backup?")) return;
    setRollingBack(true);
    try {
      const res = await fetch('/api/matrix/config/rollback', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authToken}`
        },
        body: JSON.stringify({ backupFilename })
      });
      const data = await res.json();
      if (res.ok) {
        if (showToast) showToast('success', lang === 'fa' ? 'پیکربندی با موفقیت بازگردانی شد!' : 'Configuration rolled back successfully!');
        fetchBackups();
        setTimeout(() => window.location.reload(), 1500);
      } else {
        if (showToast) showToast('error', data.message || (lang === 'fa' ? 'بازگردانی با خطا مواجه شد.' : 'Rollback failed'));
      }
    } catch (e) {
      if (showToast) showToast('error', lang === 'fa' ? 'خطا در ارتباط با سرور.' : 'Server communication error.');
    } finally {
      setRollingBack(false);
    }
  };

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
        if (data.adminUsername) setCustomAdminUsername(data.adminUsername);
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
          apiAdminTokenOverride: customApiToken,
          adminUsername: customAdminUsername,
          adminPassword: customAdminPassword
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
  }, [activeTab, activeConnectionId]);

  // 13. Certificate Management State
  const [certDomains, setCertDomains] = useState<string[]>([]);
  const [certStatuses, setCertStatuses] = useState<any[]>([]);
  const [loadingCerts, setLoadingCerts] = useState(false);
  const [selectedCertDomain, setSelectedCertDomain] = useState<string>('');
  const [certPemInput, setCertPemInput] = useState('');
  const [keyPemInput, setKeyPemInput] = useState('');
  const [uploadingCert, setUploadingCert] = useState(false);
  const [certWarnings, setCertWarnings] = useState<string[]>([]);
  const [certError, setCertError] = useState<string | null>(null);
  const [certSuccessMsg, setCertSuccessMsg] = useState<string | null>(null);

  // Multi-Domain & Wildcard SSL States
  const [selectedTargetDomains, setSelectedTargetDomains] = useState<string[]>([]);
  const [configurePanelSsl, setConfigurePanelSsl] = useState<boolean>(true);
  const [panelDomainInput, setPanelDomainInput] = useState<string>('');
  const [panelUpstreamInput, setPanelUpstreamInput] = useState<string>('http://127.0.0.1:3000');
  const [inspectingCert, setInspectingCert] = useState(false);
  const [certInspectionInfo, setCertInspectionInfo] = useState<any>(null);
  const [uploadMode, setUploadMode] = useState<'combined' | 'separate'>('combined');
  const [userConfirmedWarnings, setUserConfirmedWarnings] = useState<boolean>(false);

  const [selfSignedDomain, setSelfSignedDomain] = useState('');
  const [validityDaysInput, setValidityDaysInput] = useState('825');
  const [generatingSelfSigned, setGeneratingSelfSigned] = useState(false);
  const [customDomainInput, setCustomDomainInput] = useState('');

  const fetchCertificatesData = async () => {
    setLoadingCerts(true);
    try {
      const [domRes, statusRes] = await Promise.all([
        fetch('/api/certificates/domains', { headers: { Authorization: `Bearer ${authToken}` } }),
        fetch('/api/certificates/status', { headers: { Authorization: `Bearer ${authToken}` } })
      ]);
      const domData = await domRes.json();
      const statusData = await statusRes.json();

      if (domData.success && Array.isArray(domData.domains)) {
        setCertDomains(domData.domains);
        setSelectedTargetDomains(prev => prev.length > 0 ? prev : domData.domains);
        if (domData.domains.length > 0) {
          setSelectedCertDomain(prev => prev || domData.domains[0]);
          setSelfSignedDomain(prev => prev || domData.domains[0]);
          const foundPanelDom = domData.domains.find((d: string) => d.startsWith('panel') || d.startsWith('admin')) || `panel.${domData.domains[0].replace(/^(matrix|element|chat)\./, '')}`;
          setPanelDomainInput(prev => prev || foundPanelDom);
        }
      }
      if (statusData.success && Array.isArray(statusData.certificates)) {
        setCertStatuses(statusData.certificates);
      }
    } catch (err) {
      console.error("Error fetching certificates:", err);
    } finally {
      setLoadingCerts(false);
    }
  };

  useEffect(() => {
    if (activeTab === 'certificates' && authToken) {
      fetchCertificatesData();
    }
  }, [activeTab, authToken, activeConnectionId]);

  const handleInspectCert = async () => {
    if (!certPemInput.trim()) {
      if (showToast) showToast('warning', lang === 'fa' ? 'لطفاً گواهی PEM را وارد کنید.' : 'Please enter PEM certificate text.');
      return;
    }
    setInspectingCert(true);
    setCertError(null);
    try {
      const res = await fetch('/api/certificates/inspect-pem', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${authToken}`
        },
        body: JSON.stringify({
          certContent: certPemInput,
          keyContent: keyPemInput
        })
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        setCertError(data.error || 'خطا در آنالیز فایل گواهی');
        if (showToast) showToast('error', data.error || 'PEM Analysis failed');
      } else {
        setCertInspectionInfo(data);
        if (data.extractedCert) setCertPemInput(data.extractedCert);
        if (data.extractedKey) setKeyPemInput(data.extractedKey);
        if (Array.isArray(data.matchedDomains) && data.matchedDomains.length > 0) {
          setSelectedTargetDomains(data.matchedDomains);
        }
        if (showToast) showToast('success', lang === 'fa' ? 'اطلاعات گواهی استخراج گردید' : 'Certificate inspected');
      }
    } catch (err: any) {
      setCertError(err.message || 'خطا در ارتباط با سرور');
    } finally {
      setInspectingCert(false);
    }
  };

  const handleApplyMultiDomainSsl = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!certPemInput.trim()) {
      if (showToast) showToast('warning', lang === 'fa' ? 'لطفاً گواهی PEM را وارد کنید.' : 'PEM certificate is required.');
      return;
    }
    if (uploadMode === 'separate' && !keyPemInput.trim()) {
      if (showToast) showToast('warning', lang === 'fa' ? 'لطفاً فایل کلید خصوصی (.key) را وارد کنید.' : 'Private key is required.');
      return;
    }
    if (selectedTargetDomains.length === 0 && !configurePanelSsl) {
      if (showToast) showToast('warning', lang === 'fa' ? 'لطفاً حداقل یک دامنه جهت نصب گواهی انتخاب کنید.' : 'Please select at least one domain.');
      return;
    }

    setUploadingCert(true);
    setCertError(null);
    setCertSuccessMsg(null);
    setCertWarnings([]);

    try {
      const res = await fetch('/api/certificates/apply-multi-domain', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${authToken}`
        },
        body: JSON.stringify({
          certContent: certPemInput,
          keyContent: keyPemInput,
          targetDomains: selectedTargetDomains,
          configurePanelSsl,
          panelDomain: panelDomainInput,
          panelUpstream: panelUpstreamInput,
          userConfirmedWarnings
        })
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        if (data.requiresConfirmation && data.warnings) {
          setCertWarnings(data.warnings);
          setCertError(data.error || 'هشدارهایی در بررسی گواهی وجود دارد. جهت ادامه تاییدیه را تیک بزنید.');
        } else {
          setCertError(data.error || 'خطا در اعمال گواهی روی دامنه‌ها');
        }
        if (showToast) showToast('error', data.error || 'Failed to apply multi-domain SSL');
      } else {
        setCertSuccessMsg(data.msg || 'گواهی SSL با موفقیت به تمامی دامنه‌ها و پنل مدیریت اعمال شد.');
        setCertPemInput('');
        setKeyPemInput('');
        setCertInspectionInfo(null);
        setUserConfirmedWarnings(false);
        if (showToast) showToast('success', lang === 'fa' ? 'گواهی SSL روی تمامی دامنه‌ها فعال شد' : 'SSL certificate applied to all domains');
        fetchCertificatesData();
      }
    } catch (err: any) {
      setCertError(err.message || 'خطا در ارتباط با سرور');
    } finally {
      setUploadingCert(false);
    }
  };

  const handleUploadCert = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCertDomain || !certPemInput.trim() || !keyPemInput.trim()) {
      if (showToast) showToast('warning', lang === 'fa' ? 'لطفاً تمام فیلدها را تکمیل کنید.' : 'Please fill all required fields.');
      return;
    }
    setUploadingCert(true);
    setCertError(null);
    setCertSuccessMsg(null);
    setCertWarnings([]);

    try {
      const res = await fetch('/api/certificates/validate-and-upload', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${authToken}`
        },
        body: JSON.stringify({
          domain: selectedCertDomain,
          certContent: certPemInput,
          keyContent: keyPemInput
        })
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        setCertError(data.error || 'خطا در اعتبارسنجی یا اعمال گواهی');
        if (showToast) showToast('error', data.error || 'Failed to apply certificate');
      } else {
        setCertSuccessMsg(data.msg || 'گواهی با موفقیت اعمال گردید.');
        if (data.warnings && data.warnings.length > 0) {
          setCertWarnings(data.warnings);
        }
        setCertPemInput('');
        setKeyPemInput('');
        if (showToast) showToast('success', lang === 'fa' ? 'گواهی با موفقیت اعمال شد' : 'Certificate applied successfully');
        fetchCertificatesData();
      }
    } catch (err: any) {
      setCertError(err.message || 'خطا در ارتباط با سرور');
    } finally {
      setUploadingCert(false);
    }
  };

  const handleGenerateSelfSigned = async (e: React.FormEvent) => {
    e.preventDefault();
    const targetDomain = selfSignedDomain.trim() || selectedCertDomain || (certDomains.length > 0 ? certDomains[0] : '');
    if (!targetDomain) {
      if (showToast) showToast('warning', lang === 'fa' ? 'لطفاً نام دامنه را وارد یا انتخاب کنید.' : 'Please enter or select a domain.');
      return;
    }
    setGeneratingSelfSigned(true);
    setCertError(null);
    setCertSuccessMsg(null);
    setCertWarnings([]);

    try {
      const res = await fetch('/api/certificates/generate-self-signed', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${authToken}`
        },
        body: JSON.stringify({
          domain: targetDomain,
          validityDays: parseInt(validityDaysInput, 10) || 825
        })
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        setCertError(data.error || 'خطا در تولید گواهی Self-Signed');
        if (showToast) showToast('error', data.error || 'Failed to generate self-signed cert');
      } else {
        setCertSuccessMsg(data.msg || `گواهی Self-Signed با موفقیت برای دامنه ${targetDomain} تولید و فعال گردید.`);
        if (showToast) showToast('success', lang === 'fa' ? 'گواهی Self-Signed تولید و نصب شد' : 'Self-signed certificate generated');
        fetchCertificatesData();
      }
    } catch (err: any) {
      setCertError(err.message || 'خطا در ارتباط با سرور');
    } finally {
      setGeneratingSelfSigned(false);
    }
  };

  const handleDownloadCrt = async (domain: string) => {
    if (!domain) return;
    try {
      const res = await fetch(`/api/certificates/${encodeURIComponent(domain)}/download`, {
        headers: {
          Authorization: `Bearer ${authToken}`
        }
      });
      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.error || (lang === 'fa' ? 'فایل گواهی عمومی (.crt) یافت نشد.' : 'CRT file not found'));
      }
      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${domain}.crt`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      if (showToast) showToast('success', lang === 'fa' ? `فایل ${domain}.crt دانلود شد` : `Downloaded ${domain}.crt`);
    } catch (err: any) {
      if (showToast) showToast('error', err.message || 'خطا در دانلود فایل گواهی');
    }
  };

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
      setSmtpPort(config.SMTP_PORT ? String(config.SMTP_PORT) : '587');
      setSmtpUser(config.SMTP_USER || '');
      setSmtpPass(config.SMTP_PASS || '');
      setNotifFrom(config.NOTIF_FROM || 'Matrix <noreply@company.local>');
      setAppName(config.APP_NAME || 'Matrix');
      setSmtpEnableNotifs(config.SMTP_ENABLE_NOTIFS !== false);
      setSmtpRequireTls(config.SMTP_REQUIRE_TLS !== false);
      setSmtpEnableTls(config.SMTP_ENABLE_TLS !== false);
      setSmtpClientBaseUrl(config.SMTP_CLIENT_BASE_URL || '');
      
      setTypingNotifs(config.TYPING_NOTIFS_ENABLED !== false);
      setReadReceipts(config.READ_RECEIPTS_ENABLED !== false);
      setProfileEditName(config.PROFILE_EDIT_NAME_ENABLED !== false);
      setProfileEditAvatar(config.PROFILE_EDIT_AVATAR_ENABLED !== false);
      setIntegrationsUiUrl(config.INTEGRATIONS_UI_URL || 'https://scalar.vector.im');
      setIntegrationsRestUrl(config.INTEGRATIONS_REST_URL || 'https://scalar.vector.im/api');
      setElementCallUrl(config.ELEMENT_CALL_URL || 'https://call.element.io');
      setListenMode(config.LISTEN_MODE || 'all');
      setListenCustomIp(config.LISTEN_CUSTOM_IP || '');
      setAllowCustomUrls(config.DISABLE_CUSTOM_URLS !== true && (config.DISABLE_CUSTOM_URLS as any) !== 'true');
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

  useEffect(() => {
    if (activeTab === 'workers' && authToken) {
      fetchWorkersStatus();
    }
  }, [activeTab, authToken]);

  useEffect(() => {
    if ((activeTab === 'network' || activeTab === 'homeserver') && authToken) {
      fetchBackups();
      fetchNetworkStatus();
    }
    if ((activeTab === 'serverNotices' || activeTab === 'homeserver') && authToken) {
      fetchServerNoticesConfig();
    }
  }, [activeTab, authToken]);

  const handleSaveServerNoticesConfig = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!snDisplayName.trim() || !snRoomName.trim()) {
      showToast('error', lang === 'fa' ? 'نام نمایش و نام اتاق الزامی است.' : 'System display name and room name are required.');
      return;
    }
    setIsSavingSN(true);
    try {
      const res = await fetch('/api/matrix/server-notices/config', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authToken}`
        },
        body: JSON.stringify({
          system_mxid_localpart: snLocalpart,
          system_mxid_display_name: snDisplayName,
          system_mxid_avatar_url: snAvatarUrl,
          room_name: snRoomName,
          auto_join: snAutoJoin
        })
      });
      if (res.ok) {
        showToast('success', lang === 'fa' ? 'تنظیمات اطلاعیه سیستمی با موفقیت در Synapse ذخیره شد.' : 'Server notices configuration saved successfully.');
      } else {
        const err = await res.json().catch(() => ({}));
        showToast('error', err.error || err.message || 'Failed to save server notices config');
      }
    } catch (e: any) {
      showToast('error', e.message || 'Failed to save server notices config');
    } finally {
      setIsSavingSN(false);
    }
  };

  const isReadOnly = userRole === 'Viewer';
  const isModerator = userRole === 'Moderator';

  const runAsyncSave = async (saveFn: () => any) => {
    setIsSaving(true);
    try {
      await saveFn();
    } catch (err) {
      console.error(err);
    } finally {
      setIsSaving(false);
    }
  };

  // Handle saving Homeserver Config
  const handleSaveHomeserver = (e: React.FormEvent) => {
    e.preventDefault();
    if (isReadOnly) return;
    runAsyncSave(() => onSaveConfig({
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
    }));
  };

  // Handle saving LDAP configuration
  const handleSaveLdap = (e: React.FormEvent) => {
    e.preventDefault();
    if (isReadOnly || isModerator) return;
    runAsyncSave(() => onSaveConfig({
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
    }));
  };

  // Handle saving Workers config
  const handleSaveWorkers = (e: React.FormEvent) => {
    e.preventDefault();
    if (isReadOnly || isModerator) return;
    runAsyncSave(() => onSaveConfig({
      workers: {
        enabled: workersEnabled,
        count: Number(workersCount),
        federationSender: workersFedSender,
        basePort: Number(workersBasePort)
      }
    }));
  };

  // Handle saving Limits & Policies config
  const handleSavePolicies = (e: React.FormEvent) => {
    e.preventDefault();
    if (isReadOnly) return;

    // If Display Name, Avatar, or Room Creation policy was modified, open restart confirmation modal
    if (displayNamePolicyEnabled !== displayNamePolicyInitialState || avatarPolicyEnabled !== avatarPolicyInitialState || roomCreationPolicyEnabled !== roomCreationPolicyInitialState) {
      setShowDisplayNameConfirmModal(true);
      return;
    }

    runAsyncSave(() => onSaveConfig({
      config: {
        LIMIT_MB: limitMb,
        REGISTRATION_ENABLED: regEnabled,
        MESSAGE_RETENTION_DAYS: messageRetentionDays,
        MEDIA_RETENTION_LOCAL_DAYS: mediaRetentionLocalDays,
        MEDIA_RETENTION_REMOTE_DAYS: mediaRetentionRemoteDays,
        PRESENCE_ENABLED: presenceEnabled,
        DIRECTORY_SEARCH_ENABLED: directorySearchEnabled,
        RATE_LIMIT_PER_SEC: rateLimitPerSec,
        RATE_LIMIT_BURST: rateLimitBurst,
        DISABLE_CUSTOM_URLS: !allowCustomUrls,
        TYPING_NOTIFS_ENABLED: typingNotifs,
        READ_RECEIPTS_ENABLED: readReceipts,
        PROFILE_EDIT_NAME_ENABLED: profileEditName,
        PROFILE_EDIT_AVATAR_ENABLED: profileEditAvatar
      }
    }));
  };

  // Handle saving SMTP Mail config
  const handleSaveSmtp = (e: React.FormEvent) => {
    e.preventDefault();
    if (isReadOnly) return;
    runAsyncSave(() => onSaveConfig({
      config: {
        SMTP_HOST: smtpHost,
        SMTP_PORT: smtpPort,
        SMTP_USER: smtpUser,
        SMTP_PASS: smtpPass,
        NOTIF_FROM: notifFrom,
        APP_NAME: appName,
        SMTP_ENABLE_NOTIFS: smtpEnableNotifs,
        SMTP_REQUIRE_TLS: smtpRequireTls,
        SMTP_ENABLE_TLS: smtpEnableTls,
        SMTP_CLIENT_BASE_URL: smtpClientBaseUrl
      }
    }));
  };

  // Handle saving Client Defaults config
  const handleSaveClient = (e: React.FormEvent) => {
    e.preventDefault();
    if (isReadOnly) return;
    runAsyncSave(() => onSaveConfig({
      config: {
        TYPING_NOTIFS_ENABLED: typingNotifs,
        READ_RECEIPTS_ENABLED: readReceipts,
        PROFILE_EDIT_NAME_ENABLED: profileEditName,
        PROFILE_EDIT_AVATAR_ENABLED: profileEditAvatar,
        INTEGRATIONS_UI_URL: integrationsUiUrl,
        INTEGRATIONS_REST_URL: integrationsRestUrl,
        ELEMENT_CALL_URL: elementCallUrl
      }
    }));
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
        <h3 className="text-sm font-display font-semibold text-slate-400 mb-3 px-3 uppercase tracking-wider">{t.controlHub}</h3>
        
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
          <span>{t.serverParams}</span>
        </button>

        <button
          onClick={() => setActiveTab('network')}
          className={`flex items-center gap-3 px-4 py-3 rounded-2xl text-sm font-semibold transition-all text-left ${
            activeTab === 'network' 
              ? 'bg-white/10 text-white border border-white/10 shadow-[0_0_12px_rgba(20,184,166,0.15)]' 
              : 'text-gray-400 hover:text-white hover:bg-white/5'
          }`}
          id="tab-network"
        >
          <Globe className="w-5 h-5 text-teal-400" />
          <span>{lang === 'fa' ? 'شبکه و Listenerها' : 'Network Listener'}</span>
        </button>

        <button
          onClick={() => setActiveTab('serverNotices')}
          className={`flex items-center gap-3 px-4 py-3 rounded-2xl text-sm font-semibold transition-all text-left ${
            activeTab === 'serverNotices' 
              ? 'bg-white/10 text-white border border-white/10 shadow-[0_0_12px_rgba(168,85,247,0.15)]' 
              : 'text-gray-400 hover:text-white hover:bg-white/5'
          }`}
          id="tab-server-notices"
        >
          <Bell className="w-5 h-5 text-purple-400" />
          <span>{lang === 'fa' ? 'اطلاعیه سیستمی (Server Notices)' : 'Synapse Server Notices'}</span>
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
          <span>{t.activeDirectory}</span>
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
          <span>{t.workersScaling}</span>
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
          <span>{t.limitsPolicies}</span>
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
          <span>{t.smtpServer}</span>
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
          <span>{t.clientDefaults}</span>
        </button>

        <button
          onClick={() => setActiveTab('backups')}
          className={`flex items-center gap-3 px-4 py-3 rounded-2xl text-sm font-semibold transition-all text-left ${
            activeTab === 'backups' 
              ? 'bg-white/10 text-white border border-white/10 shadow-[0_0_12px_rgba(245,158,11,0.15)]' 
              : 'text-gray-400 hover:text-white hover:bg-white/5'
          }`}
          id="tab-backups"
        >
          <History className="w-5 h-5 text-amber-400" />
          <span>{lang === 'fa' ? 'پشتیبان‌گیری و اسنپ‌شات' : 'Backup & Snapshots'}</span>
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
          <span>{t.mediaCalling}</span>
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
          <span>{t.securityAuth}</span>
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
          <span>{t.matrixApis}</span>
        </button>

        <button
          onClick={() => setActiveTab('certificates')}
          className={`flex items-center gap-3 px-4 py-3 rounded-2xl text-sm font-semibold transition-all text-left ${
            activeTab === 'certificates' 
              ? 'bg-white/10 text-white border border-white/10 shadow-[0_0_12px_rgba(16,185,129,0.15)]' 
              : 'text-gray-400 hover:text-white hover:bg-white/5'
          }`}
          id="tab-certificates"
        >
          <Lock className="w-5 h-5 text-emerald-400" />
          <span>{lang === 'fa' ? 'مدیریت گواهی SSL/TLS' : 'SSL Certificates'}</span>
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
                <h2 className="text-xl font-display font-bold text-white">{t.hsTitle}</h2>
                <p className="text-xs text-slate-400">{t.hsSubtitle}</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider block mb-1.5">{t.hsDomainLabel}</label>
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
                <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider block mb-1.5">{t.elDomainLabel}</label>
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
                <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider block mb-1.5">{t.baseDomainLabel}</label>
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
                <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider block mb-1.5">{t.publicIpLabel}</label>
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
                <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider block mb-1.5">{t.leEmailLabel}</label>
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
                {t.dbTitle}
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                <div>
                  <label className="text-xs font-semibold text-slate-400 block mb-1">{t.dbHost}</label>
                  <input
                    type="text"
                    value={pgHost}
                    onChange={(e) => setPgHost(e.target.value)}
                    disabled={isReadOnly}
                    className="w-full bg-black/40 border border-white/10 rounded-xl px-3 py-2 text-sm text-slate-200 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-400 block mb-1">{t.dbPort}</label>
                  <input
                    type="text"
                    value={pgPort}
                    onChange={(e) => setPgPort(e.target.value)}
                    disabled={isReadOnly}
                    className="w-full bg-black/40 border border-white/10 rounded-xl px-3 py-2 text-sm text-slate-200 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-400 block mb-1">{t.dbName}</label>
                  <input
                    type="text"
                    value={pgDb}
                    onChange={(e) => setPgDb(e.target.value)}
                    disabled={isReadOnly}
                    className="w-full bg-black/40 border border-white/10 rounded-xl px-3 py-2 text-sm text-slate-200 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-400 block mb-1">{t.dbUser}</label>
                  <input
                    type="text"
                    value={pgUser}
                    onChange={(e) => setPgUser(e.target.value)}
                    disabled={isReadOnly}
                    className="w-full bg-black/40 border border-white/10 rounded-xl px-3 py-2 text-sm text-slate-200 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-400 block mb-1">{t.dbPass}</label>
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
                  disabled={isSaving}
                  className="px-6 py-2.5 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 text-white font-bold text-sm shadow-[0_4px_20px_rgba(99,102,241,0.25)] hover:scale-[1.03] active:scale-[0.98] transition-all disabled:opacity-50 disabled:pointer-events-none flex items-center gap-2"
                >
                  {isSaving ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      {t.savingConfigBtn}
                    </>
                  ) : (
                    t.saveConfigBtn
                  )}
                </button>
              </div>
            )}
          </form>
        )}

        {/* VIEW 1.5: NETWORK LISTENERS & BACKUPS */}
        {activeTab === 'network' && (
          <div className="space-y-6" id="form-network">
            <div className="flex items-center justify-between pb-4 border-b border-white/5">
              <div className="flex items-center gap-3">
                <Globe className="w-6 h-6 text-teal-400" />
                <div>
                  <h2 className="text-xl font-display font-bold text-white">
                    {lang === 'fa' ? 'تنظیمات شبکه و Listenerها' : 'Network Listener Settings'}
                  </h2>
                  <p className="text-xs text-slate-400">
                    {lang === 'fa' ? 'مدیریت آدرس‌های Bind سرویس Synapse و فایل‌های پشتیبان کانفیگ' : 'Configure Synapse listener interfaces and manage config rollback backups.'}
                  </p>
                </div>
              </div>
              
              <button
                type="button"
                onClick={() => { fetchBackups(); fetchNetworkStatus(); }}
                disabled={loadingBackups || loadingNetworkStatus}
                className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-medium text-slate-300 transition-all"
              >
                <RefreshCw className={`w-3.5 h-3.5 text-teal-400 ${loadingBackups || loadingNetworkStatus ? 'animate-spin' : ''}`} />
                <span>{lang === 'fa' ? 'بروزرسانی وضعیت' : 'Refresh Status'}</span>
              </button>
            </div>

            {/* Live Synapse Listener Status Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              {/* Card 1: Current Bind Address */}
              <div className="bg-black/30 border border-white/5 p-4 rounded-2xl flex flex-col justify-between">
                <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
                  <span>{lang === 'fa' ? 'آدرس Bind فعلی' : 'Current Bind Address'}</span>
                  <Globe className="w-4 h-4 text-teal-400" />
                </div>
                <div className="text-base font-mono font-bold text-white tracking-wide">
                  {networkStatus?.bindAddresses ? networkStatus.bindAddresses.join(', ') : (listenMode === 'all' ? '0.0.0.0' : listenMode === 'localhost' ? '127.0.0.1' : listenCustomIp || '0.0.0.0')}
                </div>
                <div className="text-[11px] text-slate-400 mt-1 flex items-center gap-1">
                  <span>Port: {networkStatus?.listenPort || 8008} (HTTP Matrix API)</span>
                </div>
              </div>

              {/* Card 2: Service Status */}
              <div className="bg-black/30 border border-white/5 p-4 rounded-2xl flex flex-col justify-between">
                <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
                  <span>{lang === 'fa' ? 'وضعیت سرویس Synapse' : 'Synapse Service Status'}</span>
                  <Activity className="w-4 h-4 text-indigo-400" />
                </div>
                <div className="flex items-center gap-2">
                  <span className={`w-2.5 h-2.5 rounded-full ${
                    networkStatus?.synapseStatus === 'active' ? 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.8)]' :
                    networkStatus?.synapseStatus === 'inactive' ? 'bg-rose-500' : 'bg-amber-500 animate-pulse'
                  }`} />
                  <span className="text-sm font-bold text-white uppercase tracking-wider">
                    {networkStatus?.synapseStatus === 'active' ? (lang === 'fa' ? 'فعال (Running)' : 'Active (Running)') :
                     networkStatus?.synapseStatus === 'inactive' ? (lang === 'fa' ? 'غیرفعال (Inactive)' : 'Inactive') : (lang === 'fa' ? 'در حال بررسی...' : 'Checking...')}
                  </span>
                </div>
                <div className="text-[11px] text-slate-400 mt-1">
                  Systemd service daemon
                </div>
              </div>

              {/* Card 3: Listener Health */}
              <div className="bg-black/30 border border-white/5 p-4 rounded-2xl flex flex-col justify-between">
                <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
                  <span>{lang === 'fa' ? 'وضعیت Listener پورت' : 'Listener Port Status'}</span>
                  <Server className="w-4 h-4 text-emerald-400" />
                </div>
                <div className="flex items-center gap-2">
                  <span className={`w-2.5 h-2.5 rounded-full ${
                    networkStatus?.listenerStatus === 'listening' ? 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.8)]' : 'bg-rose-500'
                  }`} />
                  <span className="text-sm font-bold text-white">
                    {networkStatus?.listenerStatus === 'listening' ? (lang === 'fa' ? 'درحال شنود (Listening)' : 'Listening') : (lang === 'fa' ? 'غیرقابل دسترس' : 'Unreachable')}
                  </span>
                </div>
                <div className="text-[11px] text-slate-400 mt-1">
                  {lang === 'fa' ? 'بررسی پورت 8008' : 'Port 8008 health check'}
                </div>
              </div>

              {/* Card 4: Config Syntax Status */}
              <div className="bg-black/30 border border-white/5 p-4 rounded-2xl flex flex-col justify-between">
                <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
                  <span>{lang === 'fa' ? 'اعتبار کانفیگ Synapse' : 'Config Validation'}</span>
                  <ShieldCheck className="w-4 h-4 text-amber-400" />
                </div>
                <div className="flex items-center gap-2">
                  <span className={`w-2.5 h-2.5 rounded-full ${
                    networkStatus?.configStatus === 'valid' ? 'bg-emerald-500' : 'bg-rose-500'
                  }`} />
                  <span className="text-sm font-bold text-white">
                    {networkStatus?.configStatus === 'valid' ? (lang === 'fa' ? 'معتبر (Valid YAML)' : 'Valid Syntax') : (lang === 'fa' ? 'خطای ساختار YAML' : 'Syntax Error')}
                  </span>
                </div>
                <div className="text-[11px] text-slate-400 mt-1 truncate">
                  {networkStatus?.latestBackup?.filename ? `${lang === 'fa' ? 'آخرین بک‌آپ:' : 'Backup:'} ${networkStatus.latestBackup.filename}` : 'homeserver.yaml'}
                </div>
              </div>
            </div>

            {/* Listener Configuration Form */}
            <form onSubmit={handleSaveNetworkSettings} className="space-y-4 bg-black/30 border border-white/5 p-5 rounded-2xl">
              <h3 className="text-sm font-display font-semibold text-white flex items-center gap-2">
                <Globe className="w-4 h-4 text-teal-400" />
                <span>{lang === 'fa' ? 'رابط شبکه شنیداری (Bind Address)' : 'Network Binding Mode'}</span>
              </h3>
              
              <p className="text-xs text-slate-400">
                {lang === 'fa' ? 'تعیین کنید Synapse روی چه IP ای درخواست‌های ورودی Matrix API و پورت 8008 را دریافت کند:' : 'Choose which IP addresses Synapse listens on for port 8008 Matrix API traffic:'}
              </p>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-2">
                <label className={`p-4 rounded-xl border cursor-pointer transition-all flex flex-col justify-between ${
                  listenMode === 'all'
                    ? 'bg-teal-500/10 border-teal-500/40 text-white'
                    : 'bg-black/20 border-white/5 text-slate-400 hover:border-white/20'
                }`}>
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-bold text-sm text-slate-200">0.0.0.0 (All Interfaces)</span>
                    <input
                      type="radio"
                      name="listenMode"
                      value="all"
                      checked={listenMode === 'all'}
                      onChange={() => setListenMode('all')}
                      className="accent-teal-500"
                    />
                  </div>
                  <span className="text-xs text-slate-400">
                    {lang === 'fa' ? 'قبول ترافیک ورودی از تمام کارت‌های شبکه (توصیه شده برای دسترسی از راه دور)' : 'Listen on all network interfaces (Recommended for public access)'}
                  </span>
                </label>

                <label className={`p-4 rounded-xl border cursor-pointer transition-all flex flex-col justify-between ${
                  listenMode === 'localhost'
                    ? 'bg-teal-500/10 border-teal-500/40 text-white'
                    : 'bg-black/20 border-white/5 text-slate-400 hover:border-white/20'
                }`}>
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-bold text-sm text-slate-200">127.0.0.1 (Localhost Only)</span>
                    <input
                      type="radio"
                      name="listenMode"
                      value="localhost"
                      checked={listenMode === 'localhost'}
                      onChange={() => setListenMode('localhost')}
                      className="accent-teal-500"
                    />
                  </div>
                  <span className="text-xs text-slate-400">
                    {lang === 'fa' ? 'محدودسازی دسترسی فقط به سرویس‌های محلی سرور' : 'Restrict access strictly to server local internal requests'}
                  </span>
                </label>

                <label className={`p-4 rounded-xl border cursor-pointer transition-all flex flex-col justify-between ${
                  listenMode === 'custom'
                    ? 'bg-teal-500/10 border-teal-500/40 text-white'
                    : 'bg-black/20 border-white/5 text-slate-400 hover:border-white/20'
                }`}>
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-bold text-sm text-slate-200">Custom IP Address</span>
                    <input
                      type="radio"
                      name="listenMode"
                      value="custom"
                      checked={listenMode === 'custom'}
                      onChange={() => setListenMode('custom')}
                      className="accent-teal-500"
                    />
                  </div>
                  <span className="text-xs text-slate-400">
                    {lang === 'fa' ? 'تنظیم روی یک IP اختصاصی خاص (مثلا کارت شبکه داخلی)' : 'Bind exclusively to a specific IP interface'}
                  </span>
                </label>
              </div>

              {listenMode === 'custom' && (
                <div className="pt-2 space-y-3">
                  <div>
                    <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider block mb-1.5">
                      {lang === 'fa' ? 'آدرس IP اختصاصی' : 'Custom IP Address'}
                    </label>
                    <input
                      type="text"
                      value={listenCustomIp}
                      onChange={(e) => setListenCustomIp(e.target.value)}
                      placeholder="e.g. 172.16.50.216"
                      className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-2 text-sm text-slate-200 focus:outline-none focus:border-teal-500/50 font-mono"
                    />
                  </div>

                  {/* Detected Server Network Interfaces */}
                  {networkStatus?.availableInterfaces && networkStatus.availableInterfaces.length > 0 && (
                    <div className="p-3 bg-black/20 border border-white/5 rounded-xl space-y-2">
                      <div className="text-[11px] font-medium text-slate-400 flex items-center justify-between">
                        <span>{lang === 'fa' ? 'کارت‌های شبکه شناسایی‌شده روی سرور:' : 'Detected Server Network Interfaces:'}</span>
                        <span className="text-[10px] text-teal-400 font-normal">{lang === 'fa' ? 'برای انتخاب روی IP کلیک کنید' : 'Click to select'}</span>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {networkStatus.availableInterfaces.map((ip: string) => (
                          <button
                            key={ip}
                            type="button"
                            onClick={() => { setListenMode('custom'); setListenCustomIp(ip); }}
                            className={`px-2.5 py-1 rounded-lg text-xs font-mono transition-all border ${
                              listenCustomIp === ip
                                ? 'bg-teal-500/20 border-teal-500/50 text-teal-300 font-bold'
                                : 'bg-white/5 hover:bg-white/10 border-white/10 text-slate-300'
                            }`}
                          >
                            {ip}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

              <div className="pt-3 flex items-center justify-between border-t border-white/5">
                <div className="text-[11px] text-slate-400">
                  {lang === 'fa'
                    ? '🔒 تغییرات ابتدا اعتبارسنجی شده و تنها پس از تایید سلامت سرویس اعمال خواهند شد.'
                    : '🔒 Changes are safely validated AST-first with automatic rollback if service health checks fail.'}
                </div>

                <button
                  type="submit"
                  disabled={isSaving || isReadOnly}
                  className="px-5 py-2.5 rounded-xl bg-teal-500 hover:bg-teal-600 text-white font-semibold text-sm transition-all shadow-[0_0_15px_rgba(20,184,166,0.3)] disabled:opacity-50 flex items-center gap-2"
                >
                  {isSaving ? <RefreshCw className="w-4 h-4 animate-spin" /> : <CheckCircle className="w-4 h-4" />}
                  <span>{lang === 'fa' ? 'ذخیره ایمن تنظیمات شبکه' : 'Save Network Settings'}</span>
                </button>
              </div>
            </form>

            {/* Redirect Notice Card for Backups & Rollback */}
            <div className={`bg-gradient-to-r from-amber-500/10 via-indigo-500/10 to-teal-500/10 border border-amber-500/20 p-5 rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 ${isRtl ? 'flex-row-reverse text-right' : 'text-left'}`}>
              <div className={`flex items-center gap-3 ${isRtl ? 'flex-row-reverse' : ''}`}>
                <div className="p-3 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20 shrink-0">
                  <RotateCcw className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white">
                    {lang === 'fa' ? 'نسخه‌های پشتیبان و بازگردانی تنظیمات شبکه' : 'Configuration Backups & Rollback'}
                  </h3>
                  <p className="text-xs text-slate-300 mt-0.5 leading-relaxed">
                    {lang === 'fa' 
                      ? 'اگر هنگام تغییر تنظیمات مشکلی پیش آمد یا اتصال سرور قطع شد، می‌توانید به بخش «پشتیبان‌گیری و اسنپ‌شات‌ها» مراجعه کرده و کانفیگ قبلی را بازگردانی کنید.'
                      : 'If your configuration breaks or server connectivity fails, click below to access the Rollback & Backup tools.'}
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setActiveTab('backups')}
                className="px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs shadow-[0_0_15px_rgba(245,158,11,0.3)] transition-all flex items-center gap-2 shrink-0 cursor-pointer self-start sm:self-auto"
              >
                <History className="w-4 h-4" />
                <span>{lang === 'fa' ? 'ورود به بخش رول‌بک و اسنپ‌شات‌ها' : 'Go to Rollback & Snapshots'}</span>
              </button>
            </div>

            {/* Synapse Server Notices Quick Card */}
            <div className="space-y-4 bg-black/30 border border-white/5 p-5 rounded-2xl">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-display font-semibold text-white flex items-center gap-2">
                  <Bell className="w-4 h-4 text-purple-400" />
                  <span>{lang === 'fa' ? 'پیکربندی اطلاعیه سیستمی (Synapse Server Notices)' : 'Synapse Server Notices Configuration'}</span>
                </h3>
                <button
                  type="button"
                  onClick={() => setActiveTab('serverNotices')}
                  className="text-xs font-semibold text-purple-400 hover:text-purple-300 transition-colors flex items-center gap-1"
                >
                  <span>{lang === 'fa' ? 'ویرایش کامل تنظیمات →' : 'Full Configuration →'}</span>
                </button>
              </div>
              <div className="p-4 rounded-xl bg-purple-500/10 border border-purple-500/20 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2 text-xs font-mono text-purple-300 font-semibold">
                    <span>/etc/matrix-synapse/conf.d/server_notices.yaml</span>
                  </div>
                  <p className="text-xs text-slate-300">
                    {lang === 'fa'
                      ? `فرستنده: ${snDisplayName} (@${snLocalpart}) | اتاق: ${snRoomName}`
                      : `Sender: ${snDisplayName} (@${snLocalpart}) | Room: ${snRoomName}`}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setActiveTab('serverNotices')}
                  className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs shadow-md transition-all shrink-0"
                >
                  {lang === 'fa' ? 'مدیریت کانفیگ اعلانات' : 'Manage Server Notices Config'}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* VIEW 1.8: SYNAPSE SERVER NOTICES CONFIGURATION */}
        {activeTab === 'serverNotices' && (
          <form onSubmit={handleSaveServerNoticesConfig} className="space-y-6" id="form-server-notices">
            <div className="flex items-center justify-between pb-4 border-b border-white/5">
              <div className="flex items-center gap-3">
                <Bell className="w-6 h-6 text-purple-400" />
                <div>
                  <h2 className="text-xl font-display font-bold text-white">
                    {lang === 'fa' ? 'پیکربندی اطلاعیه سیستمی (Synapse Server Notices)' : 'Synapse Server Notices Configuration'}
                  </h2>
                  <p className="text-xs text-slate-400">
                    {lang === 'fa' ? 'تنظیمات ربات فرستنده اعلانات سیستمی، نام نمایش، آواتار و عضویت خودکار در Synapse' : 'Configure system alert bot user, display name, MXC avatar, and auto-join room name.'}
                  </p>
                </div>
              </div>
              
              <button
                type="button"
                onClick={fetchServerNoticesConfig}
                disabled={loadingSN}
                className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-medium text-slate-300 transition-all"
              >
                <RefreshCw className={`w-3.5 h-3.5 text-purple-400 ${loadingSN ? 'animate-spin' : ''}`} />
                <span>{lang === 'fa' ? 'بروزرسانی' : 'Refresh'}</span>
              </button>
            </div>

            {/* Config File Path Badge */}
            <div className="p-4 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center gap-3 text-purple-200">
              <Bell className="w-5 h-5 text-purple-400 shrink-0" />
              <div className="text-xs leading-relaxed">
                <p className="font-semibold">{lang === 'fa' ? 'مسیر فایل تنظیمات Synapse:' : 'Synapse Config File Location:'}</p>
                <code className="text-xs font-mono opacity-90 text-purple-300">/etc/matrix-synapse/conf.d/server_notices.yaml</code>
              </div>
            </div>

            <div className="space-y-4 bg-black/30 border border-white/5 p-5 rounded-2xl">
              {/* System Sender Display Name */}
              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1.5">
                  {lang === 'fa' ? 'نام نمایش ربات فرستنده (System Sender Display Name):' : 'System Sender Display Name:'}
                </label>
                <input
                  type="text"
                  required
                  value={snDisplayName}
                  onChange={(e) => setSnDisplayName(e.target.value)}
                  placeholder="🚨 Administrator 🚨"
                  className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-slate-200 focus:outline-none focus:border-purple-500/50"
                />
              </div>

              {/* System Sender Localpart */}
              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1.5">
                  {lang === 'fa' ? 'نام کاربری ربات فرستنده (System Sender Localpart):' : 'System Sender Localpart:'}
                </label>
                <div className="relative">
                  <span className="absolute left-3.5 top-2.5 text-slate-400 font-mono text-sm">@</span>
                  <input
                    type="text"
                    required
                    value={snLocalpart}
                    onChange={(e) => setSnLocalpart(e.target.value.toLowerCase().replace(/[^a-z0-9_.-]/g, ''))}
                    placeholder="server"
                    className="w-full bg-black/40 border border-white/10 rounded-xl pl-8 pr-4 py-2.5 text-sm font-mono text-slate-200 focus:outline-none focus:border-purple-500/50"
                  />
                </div>
                <p className="text-[11px] text-slate-400 mt-1">
                  {lang === 'fa' ? 'نام کاربری ربات فرستنده پیام‌های سیستمی ماتریکس (Localpart for the Matrix system notice bot MXID).' : 'Localpart for the Matrix system notice bot MXID.'}
                </p>
              </div>

              {/* Notice Room Name */}
              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1.5">
                  {lang === 'fa' ? 'نام اتاق اعلانات خودکار (Notice Room Name):' : 'Notice Room Name:'}
                </label>
                <input
                  type="text"
                  required
                  value={snRoomName}
                  onChange={(e) => setSnRoomName(e.target.value)}
                  placeholder="System ℹ️"
                  className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-slate-200 focus:outline-none focus:border-purple-500/50"
                />
              </div>

              {/* Avatar MXC URL */}
              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1.5">
                  {lang === 'fa' ? 'آدرس آواتار MXC (Avatar MXC URL - اختیاری):' : 'Avatar MXC URL (Optional):'}
                </label>
                <input
                  type="text"
                  value={snAvatarUrl}
                  onChange={(e) => setSnAvatarUrl(e.target.value)}
                  placeholder="mxc://subdomain.company.com/media_id..."
                  className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-2.5 text-sm font-mono text-slate-200 focus:outline-none focus:border-purple-500/50"
                />
                <p className="text-[11px] text-slate-400 mt-1">
                  {lang === 'fa' ? 'آدرس اختیاری URI تصویر آواتار برای ربات سیستمی (Optional MXC URI for the system bot avatar).' : 'Optional MXC URI for the system bot avatar.'}
                </p>
              </div>

              {/* Auto Join Checkbox */}
              <div className="p-4 rounded-xl bg-black/20 border border-white/5 flex items-center justify-between">
                <div>
                  <label className="text-sm font-semibold text-slate-200 cursor-pointer block">
                    {lang === 'fa' ? 'عضویت خودکار در اتاق اعلانات (Auto-Join Notice Room)' : 'Auto-Join Notice Room'}
                  </label>
                  <p className="text-xs text-slate-400 mt-0.5">
                    {lang === 'fa' ? 'عضویت خودکار تمامی کاربران در زمان ثبت‌نام در اتاق اعلانات سیستمی (Automatically join all users to the notices room upon registration).' : 'Automatically join all users to the notices room upon registration.'}
                  </p>
                </div>
                <input
                  type="checkbox"
                  checked={snAutoJoin}
                  onChange={(e) => setSnAutoJoin(e.target.checked)}
                  className="rounded border-slate-700 text-purple-600 focus:ring-purple-500 h-5 w-5 cursor-pointer"
                />
              </div>
            </div>

            {!isReadOnly && (
              <div className="flex justify-end pt-2">
                <button
                  type="submit"
                  disabled={isSavingSN}
                  className="px-6 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-sm shadow-lg transition-all disabled:opacity-50 flex items-center gap-2"
                >
                  {isSavingSN ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      <span>{lang === 'fa' ? 'در حال ذخیره و ریستارت Synapse...' : 'Saving & Restarting Synapse...'}</span>
                    </>
                  ) : (
                    <span>{lang === 'fa' ? 'ذخیره تنظیمات Synapse' : 'Save Synapse Config'}</span>
                  )}
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
                  disabled={isSaving}
                  className="px-6 py-2.5 rounded-xl bg-purple-500 text-white font-bold text-sm shadow-[0_0_15px_rgba(168,85,247,0.3)] hover:scale-105 transition-transform disabled:opacity-50 disabled:pointer-events-none flex items-center gap-2"
                >
                  {isSaving ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      Saving LDAP...
                    </>
                  ) : (
                    "Save LDAP Configurations"
                  )}
                </button>
              </div>
            )}
          </form>
        )}

        {/* VIEW 3: WORKERS & SCALING */}
        {activeTab === 'workers' && (() => {
          const isWorkersProvisioned = !!(workersStatus?.hasWorkersTemplate && workersStatus?.redisInstalled && workersStatus?.redisRunning);
          return (
            <div className="space-y-6">
              <div className="flex items-center justify-between pb-4 border-b border-white/5">
                <div className="flex items-center gap-3">
                  <Cpu className="w-6 h-6 text-rose-400" />
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <h2 className="text-xl font-display font-bold text-white">Workers & Performance Scaling</h2>
                      {loadingWorkers ? (
                        <span className="text-[10px] bg-slate-500/10 text-slate-400 border border-slate-500/20 px-2 py-0.5 rounded-full font-bold animate-pulse font-sans">CHECKING SERVER...</span>
                      ) : isWorkersProvisioned ? (
                        <span className="text-[10px] bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 px-2.5 py-0.5 rounded-full font-bold font-sans flex items-center gap-1">
                          <Check className="w-3 h-3" /> ACTIVE & SCALED
                        </span>
                      ) : (
                        <span className="text-[10px] bg-rose-500/15 text-rose-400 border border-rose-500/30 px-2.5 py-0.5 rounded-full font-bold font-sans animate-pulse">
                          NOT PROVISIONED
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-slate-400">Scale the homeserver using multi-process Redis workers.</p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={fetchWorkersStatus}
                  disabled={loadingWorkers}
                  className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 hover:bg-white/10 text-xs text-slate-300 font-medium transition"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${loadingWorkers ? 'animate-spin' : ''}`} />
                  Refresh Status
                </button>
              </div>

              {workersStatus?.error && (
                <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-400 flex gap-3 text-xs font-sans">
                  <ShieldAlert className="w-5 h-5 shrink-0" />
                  <div>
                    <h5 className="font-bold uppercase tracking-wider mb-1">Server Status Connection Issue</h5>
                    <p className="opacity-90 leading-relaxed">
                      {workersStatus.message || "Failed to parse system configurations. Please ensure the target machine is accessible and active connection is configured correctly."}
                    </p>
                  </div>
                </div>
              )}

              {/* Diagnostic Grid */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-4 rounded-2xl bg-black/35 border border-white/5 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-slate-400 font-semibold tracking-wider uppercase font-sans">Redis Service</span>
                    {loadingWorkers ? (
                      <span className="w-2.5 h-2.5 rounded-full bg-slate-500 animate-pulse" />
                    ) : workersStatus?.redisRunning ? (
                      <span className="flex items-center gap-1.5 text-[10px] text-emerald-400 font-bold font-mono">
                        <span className="w-2 h-2 rounded-full bg-emerald-500" />
                        RUNNING
                      </span>
                    ) : (
                      <span className="flex items-center gap-1.5 text-[10px] text-rose-400 font-bold font-mono">
                        <span className="w-2 h-2 rounded-full bg-rose-500" />
                        STOPPED
                      </span>
                    )}
                  </div>
                  <div className="space-y-1">
                    <p className="text-xs text-slate-300 font-medium font-sans">
                      Installed: <span className="font-mono text-white">{workersStatus?.redisInstalled ? "Yes" : "No"}</span>
                    </p>
                    <p className="text-xs text-slate-300 font-medium font-sans">
                      Port Binding: <span className="font-mono text-white">{workersStatus?.redisPort || "N/A"}</span>
                    </p>
                  </div>
                </div>

                <div className="p-4 rounded-2xl bg-black/35 border border-white/5 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-slate-400 font-semibold tracking-wider uppercase font-sans">Systemd Template</span>
                    {loadingWorkers ? (
                      <span className="w-2.5 h-2.5 rounded-full bg-slate-500 animate-pulse" />
                    ) : workersStatus?.hasWorkersTemplate ? (
                      <span className="flex items-center gap-1.5 text-[10px] text-emerald-400 font-bold font-mono">
                        <Check className="w-3.5 h-3.5" />
                        ACTIVE
                      </span>
                    ) : (
                      <span className="flex items-center gap-1.5 text-[10px] text-slate-500 font-bold font-mono">
                        ABSENT
                      </span>
                    )}
                  </div>
                  <div className="space-y-1 font-sans">
                    <p className="text-[11px] text-slate-400 leading-normal">
                      Template: <span className="font-mono text-slate-300">matrix-synapse-worker@.service</span>
                    </p>
                    <p className="text-[11px] text-slate-400 leading-normal">
                      Directories: <span className="font-mono text-slate-300">/workers/</span>, <span className="font-mono text-slate-300">/conf.d/</span>
                    </p>
                  </div>
                </div>

                <div className="p-4 rounded-2xl bg-black/35 border border-white/5 space-y-3">
                  <div className="flex items-center justify-between font-sans">
                    <span className="text-xs text-slate-400 font-semibold tracking-wider uppercase">Active Workers</span>
                    <span className="font-mono text-xs text-rose-400 font-bold bg-rose-500/10 px-2 py-0.5 rounded">
                      {loadingWorkers ? "..." : (workersStatus?.synapseWorkersActiveCount || 0)} Spawned
                    </span>
                  </div>
                  <div className="space-y-1 font-sans">
                    <p className="text-xs text-slate-300 font-medium">
                      Configured count: <span className="font-mono text-white">{workersStatus?.configuredWorkersCount || 0}</span>
                    </p>
                    <p className="text-xs text-slate-300 font-medium">
                      Federation Sender: <span className="font-mono text-white">{workersStatus?.federationSenderEnabled ? "Yes" : "No"}</span>
                    </p>
                  </div>
                </div>
              </div>

              {/* Active Workers List */}
              {Array.isArray(workersStatus?.workersDetails) && workersStatus.workersDetails.length > 0 && (
                <div className="p-4 rounded-2xl bg-black/20 border border-white/5">
                  <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2.5 font-sans">Detected Systemd Worker Instances</h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5">
                    {workersStatus.workersDetails.map((w, index) => {
                      const isFed = w.includes("federation_sender");
                      const isActive = w.includes("active") || w.includes("running");
                      return (
                        <div key={index} className="flex items-center justify-between p-2 rounded-xl bg-white/5 border border-white/5">
                          <div className="flex items-center gap-2">
                            <span className={`w-1.5 h-1.5 rounded-full ${isActive ? 'bg-emerald-500' : 'bg-rose-500'}`} />
                            <span className="font-mono text-xs text-slate-200">{w.split(':')[0]}</span>
                          </div>
                          <span className="text-[10px] text-slate-400 uppercase tracking-wider font-mono">
                            {isFed ? "FED SENDER" : "GENERIC"}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Form */}
              <form onSubmit={handleSaveWorkers} className="space-y-6" id="form-workers">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider block mb-1.5">Generic Workers Count</label>
                    <select
                      value={workersCount}
                      onChange={(e) => setWorkersCount(Number(e.target.value))}
                      disabled={isReadOnly || isModerator}
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
                      disabled={isReadOnly || isModerator}
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
                        disabled={isReadOnly || isModerator}
                        className="rounded border-white/10 bg-black/40 text-rose-500 focus:ring-0 mt-0.5 disabled:opacity-40"
                      />
                      <div>
                        <label htmlFor="workers-fed-sender" className="text-xs font-bold text-white block">
                          Isolate Federation Senders
                        </label>
                        <p className="text-[11px] text-slate-400 mt-0.5 font-sans leading-normal">
                          Spawns a dedicated worker exclusively handling outbound federation traffic and room syncs, ensuring local chat latency remains untouched.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="p-4 rounded-2xl bg-rose-500/5 border border-rose-500/10 flex gap-3 text-rose-400">
                  <ShieldAlert className="w-5 h-5 shrink-0 mt-0.5" />
                  <div>
                    <h5 className="text-xs font-bold uppercase tracking-wider">Redis Server & Upstream Reverse Proxy Routing</h5>
                    <p className="text-xs text-slate-400 mt-1 leading-relaxed font-sans">
                      Enabling multi-process workers routes high-load matrix traffic channels (such as `/sync` and room state send actions) directly to separate thread pools. Clicking the button below runs the complete live remote provisioning sequence over your established SSH connection.
                    </p>
                  </div>
                </div>

                {!isReadOnly && !isModerator && (
                  <div className="flex gap-3 justify-end pt-4 font-sans">
                    <button
                      type="submit"
                      disabled={isSaving}
                      className="px-5 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white font-bold text-sm hover:bg-white/10 transition disabled:opacity-50 disabled:pointer-events-none flex items-center gap-2"
                    >
                      {isSaving ? (
                        <>
                          <RefreshCw className="w-4 h-4 animate-spin" />
                          Saving...
                        </>
                      ) : (
                        "Save Config Only"
                      )}
                    </button>
                    <button
                      type="button"
                      onClick={() => setShowConfirmInstall(true)}
                      disabled={isExecuting}
                      className={`px-6 py-2.5 rounded-xl text-white font-bold text-sm shadow-lg transition-all duration-200 ${
                        isExecuting 
                          ? 'bg-rose-500/50 cursor-not-allowed opacity-70' 
                          : isWorkersProvisioned
                            ? 'bg-emerald-600 hover:bg-emerald-500 shadow-[0_0_15px_rgba(16,185,129,0.2)] hover:scale-105 active:scale-95'
                            : 'bg-rose-500 hover:bg-rose-400 shadow-[0_0_15px_rgba(244,63,94,0.3)] hover:scale-105 active:scale-95 animate-pulse hover:animate-none'
                      }`}
                    >
                      {isExecuting ? (
                        <span className="flex items-center gap-2">
                          <RefreshCw className="w-4 h-4 animate-spin" />
                          Scaling matrix workers stack...
                        </span>
                      ) : isWorkersProvisioned ? (
                        <span className="flex items-center gap-2">
                          🔄 Update & Re-Scale Workers
                        </span>
                      ) : (
                        <span className="flex items-center gap-2">
                          🚀 Install & Scale Workers Stack
                        </span>
                      )}
                    </button>
                  </div>
                )}
              </form>
            </div>
          );
        })()}

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
                <h4 className="text-xs font-bold text-white uppercase tracking-wider">{isRtl ? 'محدودیت تعداد پیام' : 'Message Sending Rate Limits'}</h4>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-[10px] uppercase tracking-wider font-semibold text-slate-400 block mb-1">{isRtl ? 'تعداد پیام در ثانیه' : 'Messages Per Second'}</label>
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
                    <label className="text-[10px] uppercase tracking-wider font-semibold text-slate-400 block mb-1">{isRtl ? 'حداکثر سقف لحظه‌ای (Burst)' : 'Burst Message Count'}</label>
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
                  {isRtl
                    ? 'کنترل سطح اسپام در سطح سازمان. در صورت تجاوز، خطای "ارسال بیش از حد سریع پیام" نمایش داده می‌شود.'
                    : 'Controls spam levels organization-wide. If exceeded, users receive "You are sending messages too fast" errors.'}
                </p>
              </div>

              {/* Policy & Feature Switches Header */}
              <div className="md:col-span-2 pt-2 pb-1 border-t border-white/5 flex items-center justify-between">
                <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                  {isRtl ? 'سیاست‌ها و کلید‌های دسترسی سیستم' : 'Policy & Access Controls'}
                </h3>
              </div>

              {/* Grid of Policy Toggle Switches */}
              <div className="md:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-4">

                {/* Card 1: Allow Public Account Registration */}
                <div className="p-4 rounded-2xl bg-black/25 border border-white/5 hover:border-white/10 transition-all flex flex-col justify-between space-y-3">
                  <div className="flex items-start justify-between gap-3">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-sm font-semibold text-white">
                          {isRtl ? 'اجازه ثبت‌نام عمومی حساب کاربری' : 'Allow Public Account Registration'}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-400 leading-relaxed">
                        {isRtl
                          ? 'در صورت فعال بودن (Allow)، کاربران جدید می‌توانند مستقیماً از فرم ثبت‌نام کلاینت المنت حساب ساخت و وارد شوند. در صورت غیرفعال بودن، امکان ثبت‌نام روی کلاینت المنت قفل می‌شود.'
                          : 'When allowed, new users can create accounts directly from the Element web client register interface. When disabled, public registration on Element is locked.'}
                      </p>
                    </div>
                    <div className="flex-shrink-0 pt-0.5">
                      <button
                        type="button"
                        onClick={() => setRegEnabled(!regEnabled)}
                        disabled={isReadOnly}
                        className={`w-12 h-6 rounded-full p-1 transition-colors duration-200 focus:outline-none relative ${
                          regEnabled ? 'bg-cyan-500' : 'bg-slate-700'
                        } ${isReadOnly ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
                      >
                        <div
                          className={`w-4 h-4 rounded-full bg-white transition-transform duration-200 ${
                            regEnabled ? 'translate-x-6' : 'translate-x-0'
                          }`}
                        />
                      </button>
                    </div>
                  </div>
                </div>

                {/* Card 2: Presence System Tracking */}
                <div className="p-4 rounded-2xl bg-black/25 border border-white/5 hover:border-white/10 transition-all flex flex-col justify-between space-y-3">
                  <div className="flex items-start justify-between gap-3">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-sm font-semibold text-white">
                          {isRtl ? 'ردیابی وضعیت آنلاین سیستم (Presence)' : 'Presence System Tracking'}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-400 leading-relaxed">
                        {isRtl
                          ? 'ردیابی وضعیت آنلاین/آفلاین کاربران. غیرفعال‌سازی آن بار پردازشی سرور را کاهش می‌دهد.'
                          : 'Enable online/offline status tracking. Disabling improves server scaling & CPU usage.'}
                      </p>
                    </div>
                    <div className="flex-shrink-0 pt-0.5">
                      <button
                        type="button"
                        onClick={() => setPresenceEnabled(!presenceEnabled)}
                        disabled={isReadOnly}
                        className={`w-12 h-6 rounded-full p-1 transition-colors duration-200 focus:outline-none relative ${
                          presenceEnabled ? 'bg-cyan-500' : 'bg-slate-700'
                        } ${isReadOnly ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
                      >
                        <div
                          className={`w-4 h-4 rounded-full bg-white transition-transform duration-200 ${
                            presenceEnabled ? 'translate-x-6' : 'translate-x-0'
                          }`}
                        />
                      </button>
                    </div>
                  </div>
                </div>

                {/* Card 3: Send Typing Notifications */}
                <div className="p-4 rounded-2xl bg-black/25 border border-white/5 hover:border-white/10 transition-all flex flex-col justify-between space-y-3">
                  <div className="flex items-start justify-between gap-3">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-sm font-semibold text-white">
                          {isRtl ? 'ارسال اعلان در حال تایپ' : 'Send Typing Notifications'}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-400 leading-relaxed">
                        {isRtl
                          ? 'نمایش حباب "در حال تایپ..." هنگام نوشتن پیام.'
                          : 'Show "alice is typing..." bubbles when editing message drafts.'}
                      </p>
                    </div>
                    <div className="flex-shrink-0 pt-0.5">
                      <button
                        type="button"
                        onClick={() => setTypingNotifs(!typingNotifs)}
                        disabled={isReadOnly}
                        className={`w-12 h-6 rounded-full p-1 transition-colors duration-200 focus:outline-none relative ${
                          typingNotifs ? 'bg-cyan-500' : 'bg-slate-700'
                        } ${isReadOnly ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
                      >
                        <div
                          className={`w-4 h-4 rounded-full bg-white transition-transform duration-200 ${
                            typingNotifs ? 'translate-x-6' : 'translate-x-0'
                          }`}
                        />
                      </button>
                    </div>
                  </div>
                </div>

                {/* Card 4: Transmit Read Receipts */}
                <div className="p-4 rounded-2xl bg-black/25 border border-white/5 hover:border-white/10 transition-all flex flex-col justify-between space-y-3">
                  <div className="flex items-start justify-between gap-3">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-sm font-semibold text-white">
                          {isRtl ? 'ارسال رسید خوانده شدن' : 'Transmit Read Receipts'}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-400 leading-relaxed">
                        {isRtl
                          ? 'به‌روزرسانی علامت‌های خوانده شدن پیام‌ها و پیگیری وضعیت خوانده شدن.'
                          : 'Update avatar markers on read bounds, tracking exact unread indexes.'}
                      </p>
                    </div>
                    <div className="flex-shrink-0 pt-0.5">
                      <button
                        type="button"
                        onClick={() => setReadReceipts(!readReceipts)}
                        disabled={isReadOnly}
                        className={`w-12 h-6 rounded-full p-1 transition-colors duration-200 focus:outline-none relative ${
                          readReceipts ? 'bg-cyan-500' : 'bg-slate-700'
                        } ${isReadOnly ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
                      >
                        <div
                          className={`w-4 h-4 rounded-full bg-white transition-transform duration-200 ${
                            readReceipts ? 'translate-x-6' : 'translate-x-0'
                          }`}
                        />
                      </button>
                    </div>
                  </div>
                </div>

                {/* Card 5: Allow Display Name Changes */}
                <div className="p-4 rounded-2xl bg-black/25 border border-white/5 hover:border-white/10 transition-all flex flex-col justify-between space-y-3">
                  <div className="flex items-start justify-between gap-3">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-sm font-semibold text-white">
                          {isRtl ? 'اجازه تغییر نام نمایشی به کاربران' : 'Allow Display Name Changes'}
                        </span>
                        {loadingDisplayNamePolicy && <Loader2 className="w-3.5 h-3.5 text-cyan-400 animate-spin" />}
                        {displayNamePolicyEnabled !== displayNamePolicyInitialState && (
                          <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30 font-medium">
                            {isRtl ? 'نیازمند ذخیره' : 'Modified (Requires save)'}
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] text-slate-400 leading-relaxed">
                        {isRtl
                          ? 'امکان ویرایش نام نمایشی توسط کاربران از سمت کلاینت و سرور.'
                          : 'Permit users to modify their global display name attribute from client side.'}
                      </p>
                    </div>
                    <div className="flex-shrink-0 pt-0.5">
                      {updatingDisplayNamePolicy ? (
                        <div className="flex items-center gap-1.5 bg-cyan-950/60 border border-cyan-500/30 px-2 py-1 rounded-full text-cyan-300 text-[10px] font-semibold animate-pulse">
                          <Loader2 className="w-3 h-3 animate-spin" />
                        </div>
                      ) : (
                        <button
                          type="button"
                          onClick={() => {
                            handleDisplayNameToggleClick();
                            setProfileEditName(!displayNamePolicyEnabled);
                          }}
                          disabled={isReadOnly || isModerator || updatingDisplayNamePolicy || loadingDisplayNamePolicy}
                          className={`w-12 h-6 rounded-full p-1 transition-colors duration-200 focus:outline-none relative ${
                            displayNamePolicyEnabled ? 'bg-cyan-500' : 'bg-slate-700'
                          } ${(isReadOnly || isModerator || updatingDisplayNamePolicy || loadingDisplayNamePolicy) ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
                        >
                          <div
                            className={`w-4 h-4 rounded-full bg-white transition-transform duration-200 ${
                              displayNamePolicyEnabled ? 'translate-x-6' : 'translate-x-0'
                            }`}
                          />
                        </button>
                      )}
                    </div>
                  </div>
                </div>

                {/* Card 6: Allow Avatar Picture Changes */}
                <div className="p-4 rounded-2xl bg-black/25 border border-white/5 hover:border-white/10 transition-all flex flex-col justify-between space-y-3">
                  <div className="flex items-start justify-between gap-3">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-sm font-semibold text-white">
                          {isRtl ? 'اجازه تغییر تصویر پروفایل به کاربران' : 'Allow Avatar Picture Changes'}
                        </span>
                        {loadingDisplayNamePolicy && <Loader2 className="w-3.5 h-3.5 text-cyan-400 animate-spin" />}
                        {avatarPolicyEnabled !== avatarPolicyInitialState && (
                          <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30 font-medium">
                            {isRtl ? 'نیازمند ذخیره' : 'Modified (Requires save)'}
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] text-slate-400 leading-relaxed">
                        {isRtl
                          ? 'امکان آپلود و تغییر تصویر پروفایل در مخزن سرور.'
                          : 'Permit users to upload display avatar icons into server repository.'}
                      </p>
                    </div>
                    <div className="flex-shrink-0 pt-0.5">
                      {updatingDisplayNamePolicy ? (
                        <div className="flex items-center gap-1.5 bg-cyan-950/60 border border-cyan-500/30 px-2 py-1 rounded-full text-cyan-300 text-[10px] font-semibold animate-pulse">
                          <Loader2 className="w-3 h-3 animate-spin" />
                        </div>
                      ) : (
                        <button
                          type="button"
                          onClick={() => {
                            handleAvatarToggleClick();
                            setProfileEditAvatar(!avatarPolicyEnabled);
                          }}
                          disabled={isReadOnly || isModerator || updatingDisplayNamePolicy || loadingDisplayNamePolicy}
                          className={`w-12 h-6 rounded-full p-1 transition-colors duration-200 focus:outline-none relative ${
                            avatarPolicyEnabled ? 'bg-cyan-500' : 'bg-slate-700'
                          } ${(isReadOnly || isModerator || updatingDisplayNamePolicy || loadingDisplayNamePolicy) ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
                        >
                          <div
                            className={`w-4 h-4 rounded-full bg-white transition-transform duration-200 ${
                              avatarPolicyEnabled ? 'translate-x-6' : 'translate-x-0'
                            }`}
                          />
                        </button>
                      )}
                    </div>
                  </div>
                </div>

                {/* Card 7: Permit Room Creation */}
                <div className="p-4 rounded-2xl bg-black/25 border border-white/5 hover:border-white/10 transition-all flex flex-col justify-between space-y-3">
                  <div className="flex items-start justify-between gap-3">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-sm font-semibold text-white">
                          {isRtl ? 'اجازه ساخت اتاق جدید به کاربران' : 'Permit Room Creation'}
                        </span>
                        {loadingDisplayNamePolicy && <Loader2 className="w-3.5 h-3.5 text-cyan-400 animate-spin" />}
                        {roomCreationPolicyEnabled !== roomCreationPolicyInitialState && (
                          <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30 font-medium">
                            {isRtl ? 'نیازمند ذخیره' : 'Modified (Requires save)'}
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] text-slate-400 leading-relaxed">
                        {isRtl
                          ? 'اجازه ساخت اتاق‌ها و فضاهای جدید به کاربران غیرادمین (room_creation_blocker).'
                          : 'Allow non-admin users to create public and private rooms and spaces via Synapse RoomCreationBlocker module.'}
                      </p>
                    </div>
                    <div className="flex-shrink-0 pt-0.5">
                      {updatingDisplayNamePolicy ? (
                        <div className="flex items-center gap-1.5 bg-cyan-950/60 border border-cyan-500/30 px-2 py-1 rounded-full text-cyan-300 text-[10px] font-semibold animate-pulse">
                          <Loader2 className="w-3 h-3 animate-spin" />
                        </div>
                      ) : (
                        <button
                          type="button"
                          onClick={handleRoomCreationToggleClick}
                          disabled={isReadOnly || isModerator || updatingDisplayNamePolicy || loadingDisplayNamePolicy}
                          className={`w-12 h-6 rounded-full p-1 transition-colors duration-200 focus:outline-none relative ${
                            roomCreationPolicyEnabled ? 'bg-cyan-500' : 'bg-slate-700'
                          } ${(isReadOnly || isModerator || updatingDisplayNamePolicy || loadingDisplayNamePolicy) ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
                        >
                          <div
                            className={`w-4 h-4 rounded-full bg-white transition-transform duration-200 ${
                              roomCreationPolicyEnabled ? 'translate-x-6' : 'translate-x-0'
                            }`}
                          />
                        </button>
                      )}
                    </div>
                  </div>
                </div>

                {/* Card 8: Enable User Directory Search */}
                <div className="p-4 rounded-2xl bg-black/25 border border-white/5 hover:border-white/10 transition-all flex flex-col justify-between space-y-3">
                  <div className="flex items-start justify-between gap-3">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-sm font-semibold text-white">
                          {isRtl ? 'فعال‌سازی جستجوی فهرست کاربران' : 'Enable User Directory Search'}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-400 leading-relaxed">
                        {isRtl
                          ? 'امکان جستجوی سایر کاربران در هوم‌سرور محلی بر اساس بخش‌هایی از ایمیل یا نام کاربری.'
                          : 'Allows users to search for others on the local homeserver by email or username part.'}
                      </p>
                    </div>
                    <div className="flex-shrink-0 pt-0.5">
                      <button
                        type="button"
                        onClick={() => setDirectorySearchEnabled(!directorySearchEnabled)}
                        disabled={isReadOnly}
                        className={`w-12 h-6 rounded-full p-1 transition-colors duration-200 focus:outline-none relative ${
                          directorySearchEnabled ? 'bg-cyan-500' : 'bg-slate-700'
                        } ${isReadOnly ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
                      >
                        <div
                          className={`w-4 h-4 rounded-full bg-white transition-transform duration-200 ${
                            directorySearchEnabled ? 'translate-x-6' : 'translate-x-0'
                          }`}
                        />
                      </button>
                    </div>
                  </div>
                </div>

                {/* Card 9: Allow Custom Homeserver URL in Element Web (disable_custom_urls) */}
                <div className="p-4 rounded-2xl bg-black/25 border border-white/5 hover:border-white/10 transition-all flex flex-col justify-between space-y-3 md:col-span-2">
                  <div className="flex items-start justify-between gap-3">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-sm font-semibold text-white">
                          {isRtl
                            ? 'اجازه تغییر آدرس هوم‌سرور در کلاینت وب (disable_custom_urls)'
                            : 'Allow Custom Homeserver URL in Element Web (disable_custom_urls)'}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-400 leading-relaxed">
                        {isRtl
                          ? 'در صورت فعال بودن (Allow)، کاربران در کلاینت Element Web می‌توانند آدرس هوم‌سرور دلخواه دیگری وارد کنند. در صورت غیرفعال بودن، فیلد ورود به آدرس سرور تنظیم‌شده شما قفل می‌شود.'
                          : 'When allowed, users in Element Web can specify custom Matrix homeserver URLs. When disabled, the homeserver URL field is locked to your server.'}
                      </p>
                    </div>
                    <div className="flex-shrink-0 pt-0.5">
                      <button
                        type="button"
                        onClick={() => setAllowCustomUrls(!allowCustomUrls)}
                        disabled={isReadOnly}
                        className={`w-12 h-6 rounded-full p-1 transition-colors duration-200 focus:outline-none relative ${
                          allowCustomUrls ? 'bg-cyan-500' : 'bg-slate-700'
                        } ${isReadOnly ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
                      >
                        <div
                          className={`w-4 h-4 rounded-full bg-white transition-transform duration-200 ${
                            allowCustomUrls ? 'translate-x-6' : 'translate-x-0'
                          }`}
                        />
                      </button>
                    </div>
                  </div>
                </div>

              </div>
            </div>

            {!isReadOnly && (
              <div className="flex justify-end pt-4">
                <button
                  type="submit"
                  disabled={isSaving}
                  className="px-6 py-2.5 rounded-xl bg-cyan-500 text-slate-950 font-bold text-sm shadow-[0_0_15px_rgba(14,165,233,0.3)] hover:scale-105 transition-transform disabled:opacity-50 disabled:pointer-events-none flex items-center gap-2"
                >
                  {isSaving ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin text-slate-950" />
                      Saving Policies...
                    </>
                  ) : (
                    "Save & Apply Policies"
                  )}
                </button>
              </div>
            )}
          </form>
        )}

        {/* VIEW 5: SMTP MAIL SERVER */}
        {activeTab === 'smtp' && (
          <>
            <form onSubmit={handleSaveSmtp} className="space-y-6" id="form-smtp">
              <div className="flex items-center justify-between pb-4 border-b border-white/5 flex-wrap gap-3">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20">
                    <Mail className="w-6 h-6" />
                  </div>
                  <div>
                    <h2 className="text-xl font-display font-bold text-white">
                      {isRtl ? 'درگاه ارسال ایمیل (SMTP Email Gateway)' : 'SMTP Email Gateway'}
                    </h2>
                    <p className="text-xs text-slate-400 mt-0.5">
                      {isRtl 
                        ? 'تنظیمات درگاه SMTP جهت ارسال ایمیل‌های تایید ثبت‌نام، بازنشانی کلمه عبور و اعلانات سیناپس'
                        : 'Configure email alerts, push notification digests, and user registration verification messages.'}
                    </p>
                  </div>
                </div>

                {/* Enable Email Notifications Switch */}
                <div className="flex items-center gap-3 bg-black/40 border border-white/10 px-3.5 py-2 rounded-xl">
                  <span className="text-xs font-semibold text-slate-300">
                    {isRtl ? 'ارسال اعلانات ایمیلی' : 'Enable Email Notifications'}
                  </span>
                  <button
                    type="button"
                    onClick={() => setSmtpEnableNotifs(!smtpEnableNotifs)}
                    disabled={isReadOnly}
                    className={`w-11 h-6 rounded-full p-1 transition-colors duration-200 focus:outline-none relative ${
                      smtpEnableNotifs ? 'bg-amber-500' : 'bg-slate-700'
                    } ${isReadOnly ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
                  >
                    <div
                      className={`w-4 h-4 rounded-full bg-slate-950 transition-transform duration-200 ${
                        smtpEnableNotifs ? (isRtl ? '-translate-x-5' : 'translate-x-5') : 'translate-x-0'
                      }`}
                    />
                  </button>
                </div>
              </div>

              {/* Server Connection Parameters */}
              <div className="space-y-4">
                <h3 className="text-xs font-bold uppercase tracking-wider text-amber-400/90 flex items-center gap-2">
                  <span>1. {isRtl ? 'پیکربندی سرور و پورت SMTP' : 'Server Connection & Port'}</span>
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider block mb-1.5">
                      {isRtl ? 'آدرس سرور SMTP (Host)' : 'SMTP Host Server'}
                    </label>
                    <input
                      type="text"
                      value={smtpHost}
                      onChange={(e) => setSmtpHost(e.target.value)}
                      disabled={isReadOnly}
                      className={`w-full bg-black/40 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-slate-200 focus:outline-none focus:border-amber-500/50 ${isRtl ? 'text-right' : 'text-left'}`}
                      placeholder="smtp.company.com or smtp.gmail.com"
                    />
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                        {isRtl ? 'پورت سرور (Port)' : 'SMTP Server Port'}
                      </label>
                      <div className="flex gap-1.5 text-[10px]">
                        {['587', '465', '25', '2525'].map((p) => (
                          <button
                            key={p}
                            type="button"
                            onClick={() => setSmtpPort(p)}
                            disabled={isReadOnly}
                            className={`px-1.5 py-0.5 rounded border transition-colors ${
                              smtpPort === p 
                                ? 'bg-amber-500/20 border-amber-500/50 text-amber-300 font-bold' 
                                : 'bg-black/30 border-white/10 text-slate-400 hover:text-white'
                            }`}
                          >
                            {p}
                          </button>
                        ))}
                      </div>
                    </div>
                    <input
                      type="text"
                      value={smtpPort}
                      onChange={(e) => setSmtpPort(e.target.value)}
                      disabled={isReadOnly}
                      className={`w-full bg-black/40 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-slate-200 focus:outline-none focus:border-amber-500/50 ${isRtl ? 'text-right' : 'text-left'}`}
                      placeholder="587"
                    />
                  </div>
                </div>
              </div>

              {/* Authentication Credentials */}
              <div className="space-y-4 pt-2 border-t border-white/5">
                <h3 className="text-xs font-bold uppercase tracking-wider text-amber-400/90 flex items-center gap-2">
                  <span>2. {isRtl ? 'اطلاعات احراز هویت (Authentication Credentials)' : 'Authentication Credentials'}</span>
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider block mb-1.5">
                      {isRtl ? 'نام کاربری / ایمیل ارسال‌کننده (SMTP Username)' : 'SMTP Username / Login'}
                    </label>
                    <input
                      type="text"
                      value={smtpUser}
                      onChange={(e) => setSmtpUser(e.target.value)}
                      disabled={isReadOnly}
                      className={`w-full bg-black/40 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-slate-200 focus:outline-none focus:border-amber-500/50 ${isRtl ? 'text-right' : 'text-left'}`}
                      placeholder="user@company.com"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider block mb-1.5">
                      {isRtl ? 'رمز عبور / App Password' : 'SMTP Password'}
                    </label>
                    <input
                      type="password"
                      value={smtpPass}
                      onChange={(e) => setSmtpPass(e.target.value)}
                      disabled={isReadOnly}
                      className={`w-full bg-black/40 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-slate-200 focus:outline-none focus:border-amber-500/50 ${isRtl ? 'text-right' : 'text-left'}`}
                      placeholder="••••••••"
                    />
                  </div>
                </div>
              </div>

              {/* Security & Protocol Settings */}
              <div className="space-y-4 pt-2 border-t border-white/5">
                <h3 className="text-xs font-bold uppercase tracking-wider text-amber-400/90 flex items-center gap-2">
                  <span>3. {isRtl ? 'تنظیمات امنیت و رمزنگاری (Security & TLS/SSL)' : 'Security & TLS Protocols'}</span>
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-4 rounded-xl bg-black/30 border border-white/5 flex items-center justify-between gap-3">
                    <div>
                      <span className="text-xs font-semibold text-white block">
                        {isRtl ? 'اجبار پروتکل امنیتی TLS/SSL (require_transport_security)' : 'Require Transport Security (TLS/SSL)'}
                      </span>
                      <span className="text-[11px] text-slate-400 block mt-0.5">
                        {isRtl ? 'تضمین اتصال رمزنگاری‌شده قبل از تبادل داده' : 'Enforce secure encrypted connection to SMTP server'}
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={() => setSmtpRequireTls(!smtpRequireTls)}
                      disabled={isReadOnly}
                      className={`w-11 h-6 rounded-full p-1 transition-colors duration-200 focus:outline-none relative shrink-0 ${
                        smtpRequireTls ? 'bg-amber-500' : 'bg-slate-700'
                      } ${isReadOnly ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
                    >
                      <div
                        className={`w-4 h-4 rounded-full bg-slate-950 transition-transform duration-200 ${
                          smtpRequireTls ? (isRtl ? '-translate-x-5' : 'translate-x-5') : 'translate-x-0'
                        }`}
                      />
                    </button>
                  </div>

                  <div className="p-4 rounded-xl bg-black/30 border border-white/5 flex items-center justify-between gap-3">
                    <div>
                      <span className="text-xs font-semibold text-white block">
                        {isRtl ? 'فعال‌سازی پروتکل STARTTLS (enable_tls)' : 'Enable STARTTLS Protocol'}
                      </span>
                      <span className="text-[11px] text-slate-400 block mt-0.5">
                        {isRtl ? 'ارتقای اتصال عادی به اتصال رمزنگاری‌شده روی پورت ۵۸۷' : 'Upgrade cleartext connections to TLS on port 587'}
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={() => setSmtpEnableTls(!smtpEnableTls)}
                      disabled={isReadOnly}
                      className={`w-11 h-6 rounded-full p-1 transition-colors duration-200 focus:outline-none relative shrink-0 ${
                        smtpEnableTls ? 'bg-amber-500' : 'bg-slate-700'
                      } ${isReadOnly ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
                    >
                      <div
                        className={`w-4 h-4 rounded-full bg-slate-950 transition-transform duration-200 ${
                          smtpEnableTls ? (isRtl ? '-translate-x-5' : 'translate-x-5') : 'translate-x-0'
                        }`}
                      />
                    </button>
                  </div>
                </div>
              </div>

              {/* Sender & Branding Settings */}
              <div className="space-y-4 pt-2 border-t border-white/5">
                <h3 className="text-xs font-bold uppercase tracking-wider text-amber-400/90 flex items-center gap-2">
                  <span>4. {isRtl ? 'تنظیمات هدر و برندینگ ایمیل (Header & Branding)' : 'Header & Branding Settings'}</span>
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider block mb-1.5">
                      {isRtl ? 'عنوان و آدرس فرستنده (From Header)' : 'Sender From Header (`From` Address)'}
                    </label>
                    <input
                      type="text"
                      value={notifFrom}
                      onChange={(e) => setNotifFrom(e.target.value)}
                      disabled={isReadOnly}
                      className={`w-full bg-black/40 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-slate-200 focus:outline-none focus:border-amber-500/50 ${isRtl ? 'text-right' : 'text-left'}`}
                      placeholder="Matrix <noreply@company.local>"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider block mb-1.5">
                      {isRtl ? 'نام برند سامانه (App Name)' : 'Application Brand Name'}
                    </label>
                    <input
                      type="text"
                      value={appName}
                      onChange={(e) => setAppName(e.target.value)}
                      disabled={isReadOnly}
                      className={`w-full bg-black/40 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-slate-200 focus:outline-none focus:border-amber-500/50 ${isRtl ? 'text-right' : 'text-left'}`}
                      placeholder="Matrix"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider block mb-1.5">
                      {isRtl ? 'آدرس کلاینت وب (Client Base URL)' : 'Client Base URL'}
                    </label>
                    <input
                      type="text"
                      value={smtpClientBaseUrl}
                      onChange={(e) => setSmtpClientBaseUrl(e.target.value)}
                      disabled={isReadOnly}
                      className={`w-full bg-black/40 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-slate-200 focus:outline-none focus:border-amber-500/50 ${isRtl ? 'text-right' : 'text-left'}`}
                      placeholder="https://matrix.company.com"
                    />
                  </div>
                </div>
              </div>

              {!isReadOnly && (
                <div className="flex justify-end pt-4">
                  <button
                    type="submit"
                    disabled={isSaving}
                    className="px-6 py-2.5 rounded-xl bg-amber-500 text-slate-950 font-bold text-sm shadow-[0_0_15px_rgba(245,158,11,0.3)] hover:scale-105 transition-transform disabled:opacity-50 disabled:pointer-events-none flex items-center gap-2 cursor-pointer"
                  >
                    {isSaving ? (
                      <>
                        <RefreshCw className="w-4 h-4 animate-spin text-slate-950" />
                        <span>{isRtl ? 'در حال ذخیره‌سازی...' : 'Saving SMTP Credentials...'}</span>
                      </>
                    ) : (
                      <span>{isRtl ? 'ذخیره تنظیمات SMTP' : 'Save SMTP Credentials'}</span>
                    )}
                  </button>
                </div>
              )}
            </form>

          {/* SMTP Test Email Card */}
          <div className="mt-8 pt-6 border-t border-white/10 space-y-4">
            <div className={`flex items-center gap-3 ${isRtl ? 'flex-row-reverse text-right' : 'text-left'}`}>
              <div className="p-2.5 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20 shrink-0">
                <Send className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-display font-bold text-white">
                  {lang === 'fa' ? 'تست ارسال ایمیل آزمایشی (Test SMTP Gateway)' : 'Test Email Gateway Dispatch'}
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  {lang === 'fa' 
                    ? 'جهت بررسی صحت عملکرد درگاه SMTP، آدرس ایمیل گیرنده را وارد کرده و یک ایمیل آزمایشی ارسال کنید.'
                    : 'Enter a recipient email address to send a test message and verify your SMTP server connectivity.'}
                </p>
              </div>
            </div>

            <form onSubmit={handleTestSmtp} className={`bg-black/30 border border-white/5 p-5 rounded-2xl space-y-4 ${isRtl ? 'text-right' : 'text-left'}`}>
              <div className="flex flex-col sm:flex-row items-stretch sm:items-end gap-3">
                <div className="flex-1">
                  <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider block mb-1.5">
                    {lang === 'fa' ? 'آدرس ایمیل گیرنده تست' : 'Target Recipient Email'}
                  </label>
                  <input
                    type="email"
                    required
                    value={testEmailAddress}
                    onChange={(e) => setTestEmailAddress(e.target.value)}
                    disabled={testingSmtp}
                    placeholder={lang === 'fa' ? 'مثال: admin@company.com' : 'e.g., admin@company.com'}
                    className={`w-full bg-black/40 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-slate-200 focus:outline-none focus:border-amber-500/50 ${isRtl ? 'text-right' : 'text-left'}`}
                  />
                </div>

                <button
                  type="submit"
                  disabled={testingSmtp || !testEmailAddress.trim()}
                  className="px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs shadow-[0_0_15px_rgba(245,158,11,0.25)] transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:pointer-events-none shrink-0 cursor-pointer self-stretch sm:self-auto"
                >
                  {testingSmtp ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      <span>{lang === 'fa' ? 'در حال ارسال ایمیل...' : 'Sending Test Email...'}</span>
                    </>
                  ) : (
                    <>
                      <Send className="w-4 h-4" />
                      <span>{lang === 'fa' ? 'ارسال ایمیل آزمایشی' : 'Send Test Email'}</span>
                    </>
                  )}
                </button>
              </div>

              {smtpTestResult && (
                <div className={`p-4 rounded-xl border text-xs leading-relaxed flex items-start gap-3 ${
                  smtpTestResult.success 
                    ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300' 
                    : 'bg-rose-500/10 border-rose-500/30 text-rose-300'
                } ${isRtl ? 'flex-row-reverse text-right' : 'text-left'}`}>
                  {smtpTestResult.success ? (
                    <CheckCircle className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
                  ) : (
                    <XCircle className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
                  )}
                  <div className="whitespace-pre-line font-mono">
                    {smtpTestResult.msg}
                  </div>
                </div>
              )}
            </form>
          </div>
        </>
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
            </div>

            {!isReadOnly && (
              <div className="flex justify-end pt-4">
                <button
                  type="submit"
                  disabled={isSaving}
                  className="px-6 py-2.5 rounded-xl bg-sky-500 text-slate-950 font-bold text-sm shadow-[0_0_15px_rgba(14,165,233,0.3)] hover:scale-105 transition-transform disabled:opacity-50 disabled:pointer-events-none flex items-center gap-2"
                >
                  {isSaving ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin text-slate-950" />
                      Saving Client Options...
                    </>
                  ) : (
                    "Save Client Options"
                  )}
                </button>
              </div>
            )}
          </form>
        )}

        {/* VIEW: BACKUPS & SNAPSHOTS */}
        {activeTab === 'backups' && (
          <div className="space-y-6 flex flex-col h-full" dir={isRtl ? "rtl" : "ltr"}>
            <div className={`flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-white/5 ${isRtl ? 'flex-row-reverse text-right' : 'text-left'}`}>
              <div className={`flex items-center gap-3 ${isRtl ? 'flex-row-reverse text-right' : 'text-left'}`}>
                <History className="w-6 h-6 text-amber-400" />
                <div>
                  <h2 className="text-xl font-display font-bold text-white">
                    {lang === 'fa' ? 'مدیریت نسخه‌های پشتیبان و اسنپ‌شات ماتریکس' : ((t as any).backupsTitle || 'Matrix Backup & Snapshots Management')}
                  </h2>
                  <p className="text-xs text-slate-400 mt-0.5">
                    {lang === 'fa' ? 'تهیه فایل‌های پشتیبان رمزگذاری شده از پایگاه داده و فایل‌های تنظیمات ماتریکس.' : ((t as any).backupsSub || 'Configure automated local/cloud backup tasks. Download or roll back Synapse DB and config units.')}
                  </p>
                </div>
              </div>

              <div className={`flex items-center gap-1.5 bg-black/40 p-1 rounded-xl border border-white/5 self-start sm:self-auto ${isRtl ? 'flex-row-reverse' : ''}`}>
                <button
                  type="button"
                  onClick={() => setActiveBackupSubTab('list')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    activeBackupSubTab === 'list' 
                      ? 'bg-amber-500 text-slate-950 shadow-[0_0_12px_rgba(245,158,11,0.3)]' 
                      : 'text-gray-400 hover:text-white'
                  }`}
                >
                  {lang === 'fa' ? 'لیست فایل‌های پشتیبان' : 'Backups Repository'}
                </button>
                <button
                  type="button"
                  onClick={() => setActiveBackupSubTab('settings')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    activeBackupSubTab === 'settings' 
                      ? 'bg-amber-500 text-slate-950 shadow-[0_0_12px_rgba(245,158,11,0.3)]' 
                      : 'text-gray-400 hover:text-white'
                  }`}
                >
                  {lang === 'fa' ? 'تنظیمات زمان‌بندی' : 'Scheduler Config'}
                </button>
              </div>
            </div>

            {activeBackupSubTab === 'list' && (
              <div className="space-y-6 flex-1 overflow-y-auto pr-1">
                {/* Upper Action Row: Trigger Manual Backups & Upload */}
                {!isReadOnly && (
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Config Backup Box */}
                    <div className={`spatial-glass rounded-2xl p-5 border border-white/5 bg-white/5 flex flex-col justify-between ${isRtl ? 'text-right' : 'text-left'}`}>
                      <div>
                        <h4 className={`text-sm font-bold text-white flex items-center gap-2 mb-1 ${isRtl ? 'flex-row-reverse justify-start' : 'justify-start'}`}>
                          <Settings className="w-4 h-4 text-amber-400" />
                          <span>{lang === 'fa' ? 'نسخه پشتیبان تنظیمات (Config)' : 'Configuration Backup (Config)'}</span>
                        </h4>
                        <p className="text-xs text-slate-400 mb-4 leading-relaxed">
                          {lang === 'fa' 
                            ? 'یک فایل فشرده بک‌آپ از تنظیمات اصلی ماتریکس سیناپس، پروفایل‌های المنت، پروکسی‌ها و تنظیمات امنیتی ایجاد می‌کند.' 
                            : 'Creates a compressed backup archive of Synapse configs, Element web client profiles, Nginx proxies, and LDAP connection details.'}
                        </p>
                      </div>
                      <div className={`flex items-center justify-between pt-3 border-t border-white/5 ${isRtl ? 'flex-row-reverse' : ''}`}>
                        <div className={`flex items-center gap-2 ${isRtl ? 'flex-row-reverse' : ''}`}>
                          <input 
                            type="checkbox" 
                            id="inc-ssl-adv" 
                            checked={includeSSL} 
                            onChange={(e) => setIncludeSSL(e.target.checked)} 
                            className="rounded bg-black/40 border-white/10 text-amber-500 focus:ring-0 focus:ring-offset-0 w-4 h-4 cursor-pointer"
                          />
                          <label htmlFor="inc-ssl-adv" className="text-xs font-semibold text-slate-300 cursor-pointer">
                            {lang === 'fa' ? 'شامل گواهینامه SSL' : 'Include SSL certs'}
                          </label>
                        </div>
                        <button
                          type="button"
                          disabled={isTriggeringBackup}
                          onClick={() => triggerAdvancedBackup('config')}
                          className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs shadow-md transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                        >
                          {isTriggeringBackup ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Play className="w-3.5 h-3.5" />}
                          <span>{lang === 'fa' ? 'تهیه بک‌آپ تنظیمات' : 'Trigger Config Backup'}</span>
                        </button>
                      </div>
                    </div>

                    {/* DB Backup Box */}
                    <div className={`spatial-glass rounded-2xl p-5 border border-white/5 bg-white/5 flex flex-col justify-between ${isRtl ? 'text-right' : 'text-left'}`}>
                      <div>
                        <h4 className={`text-sm font-bold text-white flex items-center gap-2 mb-1 ${isRtl ? 'flex-row-reverse justify-start' : 'justify-start'}`}>
                          <FileJson className="w-4 h-4 text-cyan-400" />
                          <span>{lang === 'fa' ? 'نسخه پشتیبان پایگاه داده (Database)' : 'Database Backup (Database)'}</span>
                        </h4>
                        <p className="text-xs text-slate-400 mb-4 leading-relaxed">
                          {lang === 'fa' 
                            ? 'یک نسخه پشتیبان کامل از دیتابیس شامل لیست کاربران، اتاق‌ها، مجوزهای دسترسی، چت‌ها و لاگ‌های سیستمی ماتریکس ایجاد می‌کند.' 
                            : 'Exports a complete database snapshot containing registered users, groups, RBAC permissions, audit log history, and configuration details.'}
                        </p>
                      </div>
                      <div className={`flex justify-end pt-3 border-t border-white/5 ${isRtl ? 'justify-start' : 'justify-end'}`}>
                        <button
                          type="button"
                          disabled={isTriggeringBackup}
                          onClick={() => triggerAdvancedBackup('database')}
                          className="px-4 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs shadow-md transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                        >
                          {isTriggeringBackup ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Play className="w-3.5 h-3.5" />}
                          <span>{lang === 'fa' ? 'تهیه نسخه پشتیبان دیتابیس' : 'Create Database Backup'}</span>
                        </button>
                      </div>
                    </div>

                    {/* File Upload zone */}
                    <div className={`spatial-glass rounded-2xl p-5 border border-white/5 bg-white/5 flex flex-col justify-between ${isRtl ? 'text-right' : 'text-left'}`}>
                      <div>
                        <h4 className={`text-sm font-bold text-white flex items-center gap-2 mb-1 ${isRtl ? 'flex-row-reverse justify-start' : 'justify-start'}`}>
                          <UploadCloud className="w-4 h-4 text-emerald-400" />
                          <span>{lang === 'fa' ? 'بارگذاری فایل بک‌آپ موجود' : 'Upload Existing Backup File'}</span>
                        </h4>
                        <p className="text-xs text-slate-400 mb-3 leading-relaxed">
                          {lang === 'fa' 
                            ? 'فایل‌های پشتیبان با پسوند JSON را مستقیماً بارگذاری کنید تا در لیست ذخیره شده و آماده بازگردانی شوند.' 
                            : 'Directly upload a previous JSON backup file into the server\'s dedicated backups catalog to prepare for restoration.'}
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
                          <span className="text-[10px] text-slate-400">{lang === 'fa' ? 'کلیک کنید یا فایل بک‌آپ را به اینجا بکشید' : 'Click or drag backup file here'}</span>
                          <span className="text-[9px] text-slate-500 font-mono">Format allowed: JSON Backups</span>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Configuration Snapshots & Instant Rollback Section */}
                <div className="space-y-4 bg-black/30 border border-white/5 p-5 rounded-2xl">
                  <div className={`flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${isRtl ? 'flex-row-reverse text-right' : 'text-left'}`}>
                    <h3 className={`text-sm font-display font-semibold text-white flex items-center gap-2 ${isRtl ? 'flex-row-reverse' : ''}`}>
                      <Clock className="w-4 h-4 text-indigo-400" />
                      <span>{lang === 'fa' ? 'اسنپ‌شات‌ها و بازگردانی سریع کانفیگ ماتریکس (Configuration Snapshots & Rollback)' : 'Configuration Snapshots & Rollback'}</span>
                    </h3>

                    <button
                      type="button"
                      onClick={() => handleRollback()}
                      disabled={rollingBack || backupsList.length === 0}
                      className="px-3.5 py-1.5 rounded-xl bg-rose-500/20 border border-rose-500/30 text-rose-300 hover:bg-rose-500/30 text-xs font-semibold transition-all flex items-center gap-1.5 disabled:opacity-50 cursor-pointer self-start sm:self-auto"
                    >
                      <RefreshCw className={`w-3.5 h-3.5 ${rollingBack ? 'animate-spin' : ''}`} />
                      <span>{lang === 'fa' ? 'بازگردانی به آخرین اسنپ‌شات' : 'Rollback to Latest'}</span>
                    </button>
                  </div>

                  <p className="text-xs text-slate-400">
                    {lang === 'fa' 
                      ? 'قبل از هر تغییر در تنظیمات شبکه یا سرور ماتریکس، یک اسنپ‌شات ایمن از فایل تنظیمات ذخیره می‌شود. می‌توانید هر زمان به تنظیمات قبلی رول‌بک کنید.'
                      : 'An automatic snapshot is saved before every configuration update. Restore any previous configuration safely below.'}
                  </p>

                  {loadingBackups ? (
                    <div className="p-6 text-center text-slate-400 text-xs">
                      <RefreshCw className="w-5 h-5 animate-spin mx-auto mb-2 text-teal-400" />
                      <span>{lang === 'fa' ? 'در حال بارگذاری اسنپ‌شات‌ها...' : 'Loading config snapshots...'}</span>
                    </div>
                  ) : backupsList.length === 0 ? (
                    <div className="p-6 text-center text-slate-500 text-xs bg-black/20 rounded-xl border border-white/5">
                      {lang === 'fa' ? 'هیچ اسنپ‌شات کانفیگی یافت نشد. پس از اولین تغییر در تنظیمات، اسنپ‌شات‌ها در اینجا ایجاد می‌شوند.' : 'No configuration snapshots found.'}
                    </div>
                  ) : (
                    <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
                      {backupsList.map((bak: any, idx: number) => (
                        <div 
                          key={bak.filename || idx}
                          className={`flex items-center justify-between p-3 rounded-xl bg-black/20 border border-white/5 hover:border-white/10 transition-all ${isRtl ? 'flex-row-reverse' : ''}`}
                        >
                          <div className={`flex items-center gap-3 ${isRtl ? 'flex-row-reverse text-right' : 'text-left'}`}>
                            <div className="p-2 rounded-lg bg-indigo-500/10 text-indigo-400">
                              <Clock className="w-4 h-4" />
                            </div>
                            <div>
                              <div className="text-xs font-mono font-medium text-slate-200">
                                {bak.filename}
                              </div>
                              <div className="text-[11px] text-slate-400">
                                {bak.dateStr || new Date(bak.timestamp).toLocaleString(['fa', 'ar'].includes(lang) ? 'fa-IR' : 'en-US')}
                              </div>
                            </div>
                          </div>

                          <button
                            type="button"
                            onClick={() => handleRollback(bak.filename)}
                            disabled={rollingBack || isReadOnly}
                            className="px-3 py-1.5 rounded-lg bg-indigo-500/20 hover:bg-indigo-500/30 border border-indigo-500/30 text-indigo-300 text-xs font-semibold transition-all disabled:opacity-50 flex items-center gap-1 cursor-pointer"
                          >
                            <RotateCcw className="w-3.5 h-3.5" />
                            <span>{lang === 'fa' ? 'بازگردانی' : 'Rollback'}</span>
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Backups List & Bulk Actions */}
                <div className="space-y-3">
                  <div className={`flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-black/30 p-4 rounded-2xl border border-white/5 ${isRtl ? 'flex-row-reverse text-right' : 'text-left'}`}>
                    <div className={`flex items-center gap-3 ${isRtl ? 'flex-row-reverse' : ''}`}>
                      <button
                        type="button"
                        onClick={handleToggleSelectAll}
                        className="flex items-center gap-2 text-xs font-semibold text-slate-300 hover:text-white transition-colors cursor-pointer"
                      >
                        {selectedBackupIds.length === (backups?.length || 0) && (backups?.length || 0) > 0 ? (
                          <CheckSquare className="w-4.5 h-4.5 text-amber-500" />
                        ) : (
                          <Square className="w-4.5 h-4.5 text-slate-500" />
                        )}
                        <span>{lang === 'fa' ? `انتخاب همه (${backups?.length || 0})` : `Select All (${backups?.length || 0})`}</span>
                      </button>

                      {selectedBackupIds.length > 0 && (
                        <div className="h-4 w-px bg-white/10" />
                      )}

                      {selectedBackupIds.length > 0 && (
                        <button
                          type="button"
                          onClick={downloadBulkBackups}
                          className="px-3 py-1 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-[10px] flex items-center gap-1 transition-all cursor-pointer shadow-md"
                        >
                          <Download className="w-3 h-3" />
                          <span>{lang === 'fa' ? `دانلود گروهی (${selectedBackupIds.length})` : `Bulk Download (${selectedBackupIds.length})`}</span>
                        </button>
                      )}
                    </div>

                    <div>
                      <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">{lang === 'fa' ? 'آرشیو نسخه‌های پشتیبان موجود' : 'Archived Backups Catalog'}</h4>
                    </div>
                  </div>

                  {(!backups || backups.length === 0) ? (
                    <div className="text-center py-10 spatial-glass rounded-2xl border border-white/5">
                      <FolderOpen className="w-12 h-12 text-slate-600 mx-auto mb-2" />
                      <p className="text-sm text-slate-400">{lang === 'fa' ? 'هیچ فایل پشتیبانی یافت نشد.' : 'No system backups found in repository.'}</p>
                      <p className="text-xs text-slate-500 mt-1">{lang === 'fa' ? 'با دکمه‌های بالا اولین نسخه پشتیبان خود را ایجاد کنید.' : 'Trigger your first manual backup using the buttons above.'}</p>
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
                          } ${isRtl ? 'flex-row-reverse text-right' : 'text-left'}`}
                        >
                          <div className={`flex items-start gap-3 ${isRtl ? 'flex-row-reverse' : ''}`}>
                            <button
                              type="button"
                              onClick={() => handleToggleSelectBackup(b.id)}
                              className="mt-0.5 text-slate-500 hover:text-white transition-colors cursor-pointer"
                            >
                              {selectedBackupIds.includes(b.id) ? (
                                <CheckSquare className="w-4.5 h-4.5 text-amber-500" />
                              ) : (
                                <Square className="w-4.5 h-4.5" />
                              )}
                            </button>
                            <div className={isRtl ? 'text-right' : 'text-left'}>
                              <h5 className="text-xs font-bold text-white font-mono break-all select-all">{b.filename}</h5>
                              <div className={`flex items-center gap-3 mt-2 font-mono text-[10px] text-slate-400 flex-wrap ${isRtl ? 'flex-row-reverse' : ''}`}>
                                <span className={`px-2 py-0.5 rounded-full text-[9px] font-sans font-bold uppercase ${
                                  b.type === 'database' ? 'bg-cyan-500/10 text-cyan-400' : 'bg-amber-500/10 text-amber-400'
                                }`}>
                                  {b.type === 'database' ? (lang === 'fa' ? 'دیتابیس' : 'Database') : (lang === 'fa' ? 'تنظیمات' : 'Config')}
                                </span>
                                <span>{lang === 'fa' ? 'حجم:' : 'Size:'} <strong className="text-white">{b.size}</strong></span>
                                <span>{new Date(b.timestamp).toLocaleString(['fa', 'ar'].includes(lang) ? 'fa-IR' : 'en-US')}</span>
                              </div>
                            </div>
                          </div>

                          <div className={`flex items-center gap-1.5 ml-2 ${isRtl ? 'flex-row-reverse mr-2' : ''}`}>
                            <button
                              type="button"
                              onClick={() => downloadSingleBackup(b)}
                              className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 border border-white/5 transition-all cursor-pointer"
                              title={lang === 'fa' ? 'دانلود' : 'Download'}
                            >
                              <Download className="w-4 h-4" />
                            </button>
                            {!isReadOnly && (
                              <>
                                <button
                                  type="button"
                                  onClick={() => setShowRestoreModal(b)}
                                  className="p-2 rounded-xl bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/10 transition-all cursor-pointer font-semibold text-xs flex items-center gap-1"
                                  title={lang === 'fa' ? 'بازنشانی / Restore' : 'Restore'}
                                >
                                  <RotateCcw className="w-4 h-4" />
                                  <span className="hidden lg:inline text-[10px]">{lang === 'fa' ? 'بازنشانی' : 'Restore'}</span>
                                </button>
                                {onDeleteBackup && (
                                  <button
                                    type="button"
                                    onClick={() => onDeleteBackup(b.id)}
                                    className="p-2 rounded-xl bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/10 transition-all cursor-pointer"
                                    title={lang === 'fa' ? 'حذف بک‌آپ' : 'Purge'}
                                  >
                                    <Trash2 className="w-4 h-4" />
                                  </button>
                                )}
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
                  <div className={`spatial-glass rounded-2xl p-6 border border-white/5 bg-white/5 space-y-5 ${isRtl ? 'text-right' : 'text-left'}`}>
                    <h4 className="text-sm font-bold text-white pb-3 border-b border-white/5">{lang === 'fa' ? 'تنظیمات ذخیره‌سازی دیسک' : 'Disk Storage Settings'}</h4>

                    {/* Storage Path on server */}
                    <div className="space-y-1.5">
                      <label className="block text-xs font-semibold text-slate-300">{lang === 'fa' ? 'مسیر پیش‌فرض ذخیره‌سازی نسخه‌ها روی سرور' : 'Default Backup Path'}</label>
                      <div className={`flex gap-2 ${isRtl ? 'flex-row-reverse' : ''}`}>
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
                        {lang === 'fa' 
                          ? 'مسیر مطلق روی سرور برای نگهداری آرشیوها. در صورت عدم وجود، برنامه آن را به صورت خودکار می‌سازد.' 
                          : 'Absolute path on the host system where backup archives are persisted. The application creates this directory dynamically if it does not exist.'}
                      </p>
                    </div>

                    {/* Retention policy */}
                    <div className="space-y-1.5">
                      <label className="block text-xs font-semibold text-slate-300">{lang === 'fa' ? 'مدت زمان نگهداری فایل‌ها (روز)' : 'Retention Limit (Days)'}</label>
                      <input
                        type="number"
                        min="1"
                        max="365"
                        value={backupSettings.retentionDays}
                        onChange={(e) => setBackupSettings(prev => ({ ...prev, retentionDays: parseInt(e.target.value) || 30 }))}
                        disabled={isReadOnly}
                        className={`w-full bg-black/40 border border-white/10 rounded-xl px-3 py-2 text-xs text-slate-300 focus:outline-none focus:border-amber-500/50 ${isRtl ? 'text-right' : 'text-left'}`}
                        placeholder="30"
                      />
                      <p className="text-[10px] text-slate-500 leading-relaxed">
                        {lang === 'fa' 
                          ? 'مدت زمان نگهداری فایل‌ها. نسخه‌های قدیمی‌تر به صورت خودکار توسط پردازش‌گر پس‌زمینه حذف خواهند شد.' 
                          : 'Retention window for backup archives. Items older than this duration will be automatically pruned by the server background worker.'}
                      </p>
                    </div>
                  </div>

                  {/* Right Column: Schedulers */}
                  <div className={`spatial-glass rounded-2xl p-6 border border-white/5 bg-white/5 space-y-6 ${isRtl ? 'text-right' : 'text-left'}`}>
                    <h4 className="text-sm font-bold text-white pb-3 border-b border-white/5">{lang === 'fa' ? 'پیکربندی هوشمند زمان‌بندی نسخه‌های پشتیبان' : 'Automated Backup Daemon Configuration'}</h4>

                    {/* Database Cron */}
                    <div className="space-y-3 bg-black/20 p-4 rounded-xl border border-white/5">
                      <div className={`flex items-center justify-between ${isRtl ? 'flex-row-reverse' : ''}`}>
                        <div className={`flex items-center gap-2 ${isRtl ? 'flex-row-reverse' : ''}`}>
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
                          <label htmlFor="db-sched-toggle" className="text-xs font-bold text-white cursor-pointer">{lang === 'fa' ? 'پشتیبان‌گیری خودکار دیتابیس (Cron Job)' : 'Automated Database Backup Schedule (Cron Job)'}</label>
                        </div>
                        <Calendar className="w-4 h-4 text-cyan-400" />
                      </div>
                      <div className="space-y-1.5">
                        <label className="block text-[10px] text-slate-400">{lang === 'fa' ? 'عبارت زمان‌بندی کرون (Cron Expression)' : 'Cron Expression'}</label>
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
                        <span className={`text-[9px] text-slate-500 block ${isRtl ? 'text-right' : 'text-left'}`}>{lang === 'fa' ? 'مثال: 0 2 * * * (هر روز ساعت ۲:۰۰ بامداد)' : 'Example: 0 2 * * * (Every day at 2:00 AM)'}</span>
                      </div>
                    </div>

                    {/* Config Cron */}
                    <div className="space-y-3 bg-black/20 p-4 rounded-xl border border-white/5">
                      <div className={`flex items-center justify-between ${isRtl ? 'flex-row-reverse' : ''}`}>
                        <div className={`flex items-center gap-2 ${isRtl ? 'flex-row-reverse' : ''}`}>
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
                          <label htmlFor="cfg-sched-toggle" className="text-xs font-bold text-white cursor-pointer">{lang === 'fa' ? 'پشتیبان‌گیری خودکار تنظیمات' : 'Automated Configuration Backup Schedule'}</label>
                        </div>
                        <Calendar className="w-4 h-4 text-amber-400" />
                      </div>
                      <div className="space-y-1.5">
                        <label className="block text-[10px] text-slate-400">{lang === 'fa' ? 'عبارت زمان‌بندی کرون (Cron Expression)' : 'Cron Expression'}</label>
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
                        <span className={`text-[9px] text-slate-500 block ${isRtl ? 'text-right' : 'text-left'}`}>{lang === 'fa' ? 'مثال: 0 3 * * * (هر روز ساعت ۳:۰۰ بامداد)' : 'Example: 0 3 * * * (Every day at 3:00 AM)'}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {!isReadOnly && (
                  <div className={`flex pt-4 border-t border-white/5 ${isRtl ? 'justify-start' : 'justify-end'}`}>
                    <button
                      type="button"
                      onClick={saveBackupSettings}
                      className="px-6 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs shadow-lg transition-all flex items-center gap-2 cursor-pointer hover:shadow-amber-500/10"
                    >
                      <Save className="w-4 h-4" />
                      <span>{lang === 'fa' ? 'ذخیره تنظیمات زمان‌بندی' : 'Save Scheduler Settings'}</span>
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* Restore Confirmation Modal Overlay */}
            {showRestoreModal && (
              <div className="fixed inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 z-50 animate-fade-in" dir={isRtl ? "rtl" : "ltr"}>
                <div className={`max-w-lg w-full rounded-3xl p-6 space-y-5 animate-scale-up transition-colors ${isRtl ? 'text-right' : 'text-left'} ${
                  isLightMode 
                    ? 'bg-white border border-red-100 text-slate-900 shadow-[0_10px_40px_rgba(0,0,0,0.1)]' 
                    : 'bg-slate-900 border border-red-500/20 text-white shadow-[0_0_50px_rgba(239,68,68,0.15)]'
                }`}>
                  <div className={`flex items-center gap-3 text-red-500 pb-3 border-b border-white/5 ${isRtl ? 'flex-row-reverse' : ''}`}>
                    <AlertTriangle className="w-6 h-6" />
                    <div>
                      <h3 className={`text-lg font-bold ${isLightMode ? 'text-slate-900' : 'text-white'}`}>{lang === 'fa' ? 'هشدار جدی: بازگردانی وضعیت سرور' : 'Critical Warning: Restore System'}</h3>
                      <p className={`text-[10px] ${isLightMode ? 'text-red-600/80' : 'text-red-400/80'}`}>{lang === 'fa' ? 'عملیات بازیابی و ریکاوری سرور ماتریکس' : 'Matrix Server Backup Recovery Operations'}</p>
                    </div>
                  </div>

                  <p className={`text-xs leading-relaxed ${isLightMode ? 'text-slate-600' : 'text-slate-300'}`}>
                    {lang === 'fa' ? (
                      <span>آیا از بازگردانی وضعیت سرور به فایل پشتیبان <strong className="text-amber-500 font-mono select-all break-all">{showRestoreModal.filename}</strong> اطمینان کامل دارید؟</span>
                    ) : (
                      <span>Are you absolutely sure you want to restore the server state to backup file <strong className="text-amber-500 font-mono select-all break-all">{showRestoreModal.filename}</strong>?</span>
                    )}
                  </p>

                  <div className={`rounded-2xl p-4 text-[11px] space-y-2 border ${
                    isLightMode 
                      ? 'bg-red-50/50 border-red-100 text-slate-700' 
                      : 'bg-red-500/5 border-red-500/10 text-slate-300'
                  }`}>
                    <p className={`font-bold text-red-500 flex items-center gap-1 ${isRtl ? 'flex-row-reverse' : ''}`}>
                      <span>{lang === 'fa' ? 'اثرات جانبی و غیرقابل برگشت این بازگردانی:' : 'Irreversible side-effects of this rollback:'}</span>
                    </p>
                    {showRestoreModal.type === 'database' ? (
                      <ul className={`list-disc list-inside space-y-1 ${isLightMode ? 'text-slate-600' : 'text-slate-400'} ${isRtl ? 'pr-1 list-none' : 'pl-1'}`}>
                        {lang === 'fa' ? (
                          <>
                            <li>• وضعیت فعلی پایگاه داده شامل لیست کل کاربران، نشست‌های فعال و مجوزهای دسترسی به طور کامل با نسخه پشتیبان جایگزین خواهد شد.</li>
                            <li>• کلیه تغییرات ثبت شده بعد از تاریخ تهیه این نسخه پشتیبان ({new Date(showRestoreModal.timestamp).toLocaleString('fa-IR')}) به طور دائمی پاک می‌شوند.</li>
                          </>
                        ) : (
                          <>
                            <li>The current database state including user rosters, active sessions, and access permissions will be entirely replaced.</li>
                            <li>Any adjustments committed after the backup creation date ({new Date(showRestoreModal.timestamp).toLocaleString()}) will be permanently erased.</li>
                          </>
                        )}
                      </ul>
                    ) : (
                      <ul className={`list-disc list-inside space-y-1 ${isLightMode ? 'text-slate-600' : 'text-slate-400'} ${isRtl ? 'pr-1 list-none' : 'pl-1'}`}>
                        {lang === 'fa' ? (
                          <>
                            <li>• فایل‌های تنظیمات سیستمی، تنظیمات پنل المنت و ویژگی‌های پروکسی معکوس بازنویسی خواهند شد.</li>
                            <li>• فرآیندهای همگام‌سازی و واحدهای سرور برای بارگذاری اطلاعات جدید ریستارت خواهند شد.</li>
                          </>
                        ) : (
                          <>
                            <li>Critical system configuration files, Element client options, and reverse proxy properties will be rewritten.</li>
                            <li>Sync processes and server units will restart to reload newly written configurations.</li>
                          </>
                        )}
                      </ul>
                    )}
                  </div>

                  <div className={`flex items-center justify-end gap-3 pt-3 border-t border-white/5 ${isRtl ? 'flex-row-reverse' : ''}`}>
                    <button
                      type="button"
                      disabled={isRestoring}
                      onClick={() => setShowRestoreModal(null)}
                      className={`px-4 py-2 rounded-xl font-bold text-xs transition-colors cursor-pointer ${
                        isLightMode 
                          ? 'bg-slate-100 hover:bg-slate-200 text-slate-700' 
                          : 'bg-white/5 hover:bg-white/10 text-slate-300'
                      }`}
                    >
                      {lang === 'fa' ? 'انصراف' : 'Cancel'}
                    </button>
                    <button
                      type="button"
                      disabled={isRestoring}
                      onClick={() => restoreBackup(showRestoreModal)}
                      className="px-5 py-2.5 rounded-xl bg-red-500 hover:bg-red-600 text-white font-bold text-xs shadow-lg transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50"
                    >
                      {isRestoring ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <RotateCcw className="w-3.5 h-3.5" />}
                      <span>{lang === 'fa' ? 'تایید نهایی و بازنشانی سیستم' : 'Confirm Rollback'}</span>
                    </button>
                  </div>
                </div>
              </div>
            )}
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
                    <p className="text-xs text-slate-400 font-mono">Host Endpoint: {apiReport.host || 'localhost'} | Configured Port: {customApiPort || '8008'} | Admin User: <span className="text-emerald-400 font-semibold">{apiReport.adminUsername || 'Auto-detected'}</span></p>
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
                  <span className="text-xs font-bold uppercase tracking-wider">Manual API Configuration & Admin Credentials Override</span>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  <div>
                    <label className="text-xs font-semibold text-slate-400 block mb-1">Synapse Admin Username</label>
                    <input
                      type="text"
                      placeholder="admin or @admin:domain.local"
                      value={customAdminUsername}
                      onChange={(e) => setCustomAdminUsername(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-white/10 text-white font-mono text-sm focus:border-blue-500 focus:outline-none"
                    />
                    <span className="text-[10px] text-slate-500 mt-1 block">Homeserver admin user for dynamic login</span>
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-slate-400 block mb-1">Synapse Admin Password</label>
                    <input
                      type="password"
                      placeholder="••••••••••••"
                      value={customAdminPassword}
                      onChange={(e) => setCustomAdminPassword(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-white/10 text-white font-mono text-sm focus:border-blue-500 focus:outline-none"
                    />
                    <span className="text-[10px] text-slate-500 mt-1 block">Password associated with admin username</span>
                  </div>
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
                  <div className="md:col-span-2 lg:col-span-2">
                    <label className="text-xs font-semibold text-slate-400 block mb-1">Static Admin Token Override (Optional)</label>
                    <input
                      type="password"
                      placeholder="syt_..."
                      value={customApiToken}
                      onChange={(e) => setCustomApiToken(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-white/10 text-white font-mono text-sm focus:border-blue-500 focus:outline-none"
                    />
                    <span className="text-[10px] text-slate-500 mt-1 block">Manual static access token (bypasses dynamic login & Postgres lookup)</span>
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
              <div className="space-y-6 overflow-y-auto pr-1">
                <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 min-h-[380px]">
                  {/* Endpoints List */}
                  <div className="lg:col-span-3 flex flex-col gap-3 overflow-y-auto pr-2 max-h-[420px]">
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
                  <div className="lg:col-span-2 flex flex-col bg-slate-950/40 rounded-2xl border border-white/5 overflow-hidden max-h-[420px]">
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

                {/* Diagnostic Logs & Authentication Debugger Section */}
                {apiReport?.authLogs && apiReport.authLogs.length > 0 && (
                  <div className="p-5 rounded-2xl bg-slate-950 border border-white/10 space-y-3">
                    <div className="flex items-center justify-between pb-2 border-b border-white/5">
                      <div className="flex items-center gap-2.5 text-emerald-400">
                        <Terminal className="w-4 h-4" />
                        <span className="text-xs font-bold uppercase tracking-wider">System Diagnostic & Auth Logs</span>
                      </div>
                      <button
                        onClick={() => {
                          const logText = apiReport.authLogs.join('\n');
                          navigator.clipboard.writeText(logText);
                          setCopiedLogs(true);
                          setTimeout(() => setCopiedLogs(false), 2000);
                          if (showToast) showToast('success', 'Diagnostic logs copied to clipboard.');
                        }}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-slate-300 text-xs font-bold transition-all border border-white/10"
                      >
                        {copiedLogs ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                        <span>{copiedLogs ? 'Copied!' : 'Copy Logs'}</span>
                      </button>
                    </div>
                    <div className="font-mono text-[11px] leading-relaxed text-slate-300 max-h-56 overflow-y-auto space-y-1 p-3 bg-black/40 rounded-xl border border-white/5 selection:bg-blue-500 selection:text-white">
                      {apiReport.authLogs.map((log: string, idx: number) => (
                        <div key={idx} className={
                          log.includes('❌') || log.includes('[FAIL]')
                            ? 'text-rose-400 font-semibold'
                            : log.includes('✅') || log.includes('[SUCCESS]') || log.includes('🟢')
                            ? 'text-emerald-400 font-semibold'
                            : log.includes('⚠️')
                            ? 'text-amber-300'
                            : log.includes('🔑') || log.includes('📡')
                            ? 'text-cyan-300'
                            : 'text-slate-300'
                        }>
                          {log}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* VIEW 13: CERTIFICATE MANAGEMENT */}
        {activeTab === 'certificates' && (
          <div className="space-y-6" id="view-certificates">
            {/* Header Section */}
            <div className={`p-5 rounded-2xl border transition-all ${
              isLightMode
                ? 'bg-gradient-to-r from-slate-50 via-white to-indigo-50/30 border-slate-200/80 shadow-sm'
                : 'bg-gradient-to-r from-slate-900/90 via-slate-900/50 to-indigo-950/20 border-white/10'
            }`}>
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center gap-3.5">
                  <div className={`p-3 rounded-xl ${
                    isLightMode ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/20' : 'bg-indigo-500/20 text-indigo-400 border border-indigo-500/30'
                  }`}>
                    <ShieldCheck className="w-6 h-6" />
                  </div>
                  <div>
                    <h2 className={`text-lg font-bold font-display ${isLightMode ? 'text-slate-900' : 'text-white'}`}>
                      {lang === 'fa' ? 'مدیریت گواهی‌های SSL / TLS' : 'SSL / TLS Certificate Management'}
                    </h2>
                    <p className={`text-xs ${isLightMode ? 'text-slate-500' : 'text-slate-400'}`}>
                      {lang === 'fa' 
                        ? 'کشف خودکار سرویس‌های Nginx و Synapse، آنالیز جفت‌کلید، نصب یکپارچه Wildcard و پشتیبان‌گیری خودکار' 
                        : 'Auto-discover Nginx & Synapse TLS, inspect PEM pairs, batch deploy Wildcard certs & auto-rollback protection'}
                    </p>
                  </div>
                </div>
                <button
                  onClick={fetchCertificatesData}
                  disabled={loadingCerts}
                  className={`px-4 py-2 text-xs font-bold rounded-xl border flex items-center justify-center gap-2 transition cursor-pointer shrink-0 shadow-sm active:scale-95 disabled:opacity-50 ${
                    isLightMode
                      ? 'bg-indigo-600 hover:bg-indigo-700 text-white border-indigo-600 shadow-indigo-500/20'
                      : 'bg-indigo-500/20 hover:bg-indigo-500/30 text-indigo-200 border-indigo-500/30'
                  }`}
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${loadingCerts ? 'animate-spin text-white' : isLightMode ? 'text-white' : 'text-indigo-400'}`} />
                  <span>{lang === 'fa' ? 'بروزرسانی وضعیت' : 'Refresh Discovery'}</span>
                </button>
              </div>
            </div>

            {/* Section 1: Discovered Certificates & Nginx/Synapse Services */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className={`text-sm font-bold flex items-center gap-2 ${isLightMode ? 'text-slate-800' : 'text-slate-200'}`}>
                  <Globe className="w-4 h-4 text-cyan-500" />
                  <span>{lang === 'fa' ? 'سرویس‌ها و دامنه‌های شناسایی‌شده (Nginx & Synapse TLS)' : 'Discovered Services & TLS Status'}</span>
                </h3>
                <span className={`text-[11px] font-mono px-2.5 py-0.5 rounded-lg border font-semibold ${
                  isLightMode ? 'bg-slate-100 text-slate-700 border-slate-200' : 'bg-black/40 text-slate-300 border-white/10'
                }`}>
                  {certStatuses.length} {lang === 'fa' ? 'سرویس فعال' : 'discovered services'}
                </span>
              </div>

              {loadingCerts ? (
                <div className={`p-8 text-center rounded-2xl border flex items-center justify-center gap-3 ${
                  isLightMode ? 'bg-slate-50 border-slate-200 text-slate-500' : 'bg-white/5 border-white/5 text-slate-400'
                }`}>
                  <Loader2 className="w-5 h-5 animate-spin text-indigo-500" />
                  <span className="text-xs font-semibold">{lang === 'fa' ? 'در حال اسکن کانفیگ‌های Nginx و Synapse...' : 'Scanning Nginx server blocks & Synapse TLS configs...'}</span>
                </div>
              ) : certStatuses.length === 0 ? (
                <div className={`p-6 rounded-2xl border text-xs text-center ${
                  isLightMode ? 'bg-slate-50 border-slate-200 text-slate-500' : 'bg-white/5 border-white/5 text-slate-400'
                }`}>
                  {lang === 'fa' ? 'هیچ کانفیگ Nginx یا Synapse فعالی روی سرور پیدا نشد.' : 'No active Nginx or Synapse TLS configurations discovered.'}
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {certStatuses.map((item, idx) => (
                    <div 
                      key={idx}
                      className={`p-4 rounded-2xl border transition-all flex flex-col justify-between space-y-3 ${
                        isLightMode
                          ? item.status === 'green'
                            ? 'bg-emerald-50/50 border-emerald-200 shadow-sm'
                            : item.status === 'yellow'
                            ? 'bg-amber-50/50 border-amber-200 shadow-sm'
                            : 'bg-rose-50/50 border-rose-200 shadow-sm'
                          : item.status === 'green'
                          ? 'bg-emerald-950/20 border-emerald-500/30'
                          : item.status === 'yellow'
                          ? 'bg-amber-950/20 border-amber-500/30'
                          : 'bg-rose-950/20 border-rose-500/30'
                      }`}
                    >
                      <div className="space-y-2">
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex items-center gap-2 min-w-0">
                            <Lock className={`w-4 h-4 shrink-0 ${
                              item.status === 'green' ? 'text-emerald-500' : item.status === 'yellow' ? 'text-amber-500' : 'text-rose-500'
                            }`} />
                            <div className="min-w-0">
                              <span className={`font-bold font-mono text-xs truncate block ${
                                isLightMode ? 'text-slate-900' : 'text-white'
                              }`}>{item.domain}</span>
                              <div className="flex items-center gap-1.5 mt-0.5 text-[10px]">
                                <span className={`px-1.5 py-0.2 rounded font-mono font-bold uppercase ${
                                  isLightMode ? 'bg-slate-200 text-indigo-700' : 'bg-slate-800 text-cyan-300'
                                }`}>
                                  {item.serviceType || 'nginx'}
                                </span>
                                <span className={isLightMode ? 'text-slate-500' : 'text-slate-400'}>Port: {item.listenPort || item.port || '443'}</span>
                              </div>
                            </div>
                          </div>
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border shrink-0 ${
                            item.status === 'green'
                              ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/30'
                              : item.status === 'yellow'
                              ? 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/30'
                              : 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/30'
                          }`}>
                            {item.status === 'green'
                              ? (lang === 'fa' ? `معتبر (${item.daysRemaining} روز)` : `Valid (${item.daysRemaining}d)`)
                              : item.status === 'yellow'
                              ? (lang === 'fa' ? `انقضا نزدیک (${item.daysRemaining} روز)` : `Expiring (${item.daysRemaining}d)`)
                              : (lang === 'fa' ? 'منقضی شده / فاقد گواهی' : 'Missing / Expired')}
                          </span>
                        </div>

                        <div className={`p-2.5 rounded-xl border text-[11px] font-mono space-y-1 ${
                          isLightMode ? 'bg-white border-slate-200/80 text-slate-700' : 'bg-black/40 border-white/5 text-slate-300'
                        }`}>
                          <div className="flex justify-between items-center text-[10px]">
                            <span className="text-slate-400">Cert (.crt):</span>
                            <span className="text-emerald-600 dark:text-emerald-300 truncate max-w-[140px]" title={item.certPath}>{item.certPath ? item.certPath.split('/').pop() : 'N/A'}</span>
                          </div>
                          <div className="flex justify-between items-center text-[10px]">
                            <span className="text-slate-400">Key (.key):</span>
                            <span className="text-amber-600 dark:text-amber-300 truncate max-w-[140px]" title={item.keyPath}>{item.keyPath ? item.keyPath.split('/').pop() : 'N/A'}</span>
                          </div>
                          {item.issuer && (
                            <div className="flex justify-between items-center text-[10px]">
                              <span className="text-slate-400">Issuer:</span>
                              <span className="truncate max-w-[140px] text-slate-500 dark:text-slate-300">{item.issuer}</span>
                            </div>
                          )}
                          {item.endDate && (
                            <div className="flex justify-between items-center text-[10px]">
                              <span className="text-slate-400">{lang === 'fa' ? 'انقضا:' : 'Expires:'}</span>
                              <span className="text-slate-600 dark:text-slate-300">{item.endDate}</span>
                            </div>
                          )}
                        </div>
                      </div>

                      {item.exists && (
                        <button
                          type="button"
                          onClick={() => handleDownloadCrt(item.domain)}
                          className={`w-full py-1.5 px-3 rounded-xl border text-xs font-semibold flex items-center justify-center gap-2 transition cursor-pointer mt-2 ${
                            isLightMode
                              ? 'bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border-emerald-300'
                              : 'bg-emerald-950/40 hover:bg-emerald-900/60 text-emerald-300 border-emerald-500/30'
                          }`}
                        >
                          <Download className="w-3.5 h-3.5" />
                          <span>{lang === 'fa' ? `دانلود فایل اعتمادسازی (.crt)` : `Download Trust File (.crt)`}</span>
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Alert & Result Status Messages */}
            {certError && (
              <div className={`p-4 rounded-2xl border text-xs space-y-2 ${
                isLightMode ? 'bg-rose-50 border-rose-200 text-rose-800' : 'bg-rose-950/40 border-rose-500/30 text-rose-300'
              }`}>
                <div className="flex items-center gap-2 font-bold text-rose-600 dark:text-rose-400">
                  <XCircle className="w-4.5 h-4.5 shrink-0" />
                  <span>{lang === 'fa' ? 'خطا در نصب گواهی (تغییرات به نسخه سالم قبلی بازگردانده شد)' : 'Installation Failed (Rolled back to previous working state)'}</span>
                </div>
                <pre className={`whitespace-pre-wrap font-mono text-[11px] p-3 rounded-xl border max-h-40 overflow-y-auto leading-relaxed ${
                  isLightMode ? 'bg-white border-rose-200 text-rose-900' : 'bg-black/50 border-rose-500/20 text-rose-200'
                }`}>
                  {certError}
                </pre>
              </div>
            )}

            {certSuccessMsg && (
              <div className={`p-4 rounded-2xl border text-xs space-y-2 ${
                isLightMode ? 'bg-emerald-50 border-emerald-200 text-emerald-800' : 'bg-emerald-950/40 border-emerald-500/30 text-emerald-300'
              }`}>
                <div className="flex items-center gap-2 font-bold text-emerald-600 dark:text-emerald-400">
                  <CheckCircle className="w-4.5 h-4.5 shrink-0" />
                  <span>{certSuccessMsg}</span>
                </div>
              </div>
            )}

            {certWarnings.length > 0 && (
              <div className={`p-4 rounded-2xl border text-xs space-y-2.5 ${
                isLightMode ? 'bg-amber-50 border-amber-200 text-amber-900' : 'bg-amber-950/40 border-amber-500/30 text-amber-300'
              }`}>
                <div className="flex items-center gap-2 font-bold text-amber-700 dark:text-amber-400">
                  <AlertCircle className="w-4.5 h-4.5 shrink-0" />
                  <span>{lang === 'fa' ? 'هشدارهای اعتبارسنجی گواهی:' : 'Validation Warnings:'}</span>
                </div>
                <div className="space-y-1 pl-2">
                  {certWarnings.map((w, idx) => (
                    <div key={idx} className="flex items-start gap-1.5 text-[11px]">
                      <span className="text-amber-500">•</span>
                      <span>{w}</span>
                    </div>
                  ))}
                </div>
                <label className="flex items-center gap-2 pt-2 border-t border-amber-300/40 dark:border-amber-500/20 text-xs font-bold cursor-pointer">
                  <input
                    type="checkbox"
                    checked={userConfirmedWarnings}
                    onChange={(e) => setUserConfirmedWarnings(e.target.checked)}
                    className="rounded bg-slate-900 border-amber-500/40 text-amber-600 focus:ring-0"
                  />
                  <span>{lang === 'fa' ? 'این هشدارها را مطالعه کردم و می‌خواهم نصب گواهی را تایید و ادامه دهم.' : 'I acknowledge these warnings and want to proceed with installation.'}</span>
                </label>
              </div>
            )}

            {/* Main SSL Installation Form */}
            <form onSubmit={handleApplyMultiDomainSsl} className={`p-6 rounded-2xl border space-y-5 ${
              isLightMode ? 'bg-white border-slate-200/90 shadow-md' : 'bg-slate-900/80 border-white/10 shadow-xl'
            }`}>
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200/80 dark:border-white/10 pb-4">
                <div className="flex items-center gap-2.5">
                  <Upload className="w-5 h-5 text-indigo-500" />
                  <span className={`font-bold text-sm ${isLightMode ? 'text-slate-900' : 'text-white'}`}>
                    {lang === 'fa' ? 'نصب و اعمال گواهی SSL PEM (تک‌دامنه / Wildcard / دسته‌ای)' : 'Install SSL Certificate (Single / Wildcard)'}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={handleInspectCert}
                  disabled={inspectingCert || !certPemInput.trim()}
                  className={`px-3 py-1.5 text-xs font-bold rounded-xl border flex items-center justify-center gap-1.5 transition disabled:opacity-40 cursor-pointer shrink-0 ${
                    isLightMode
                      ? 'bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border-indigo-200'
                      : 'bg-indigo-500/20 hover:bg-indigo-500/30 text-indigo-300 border-indigo-500/30'
                  }`}
                >
                  {inspectingCert ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Eye className="w-3.5 h-3.5" />}
                  <span>{lang === 'fa' ? 'آنالیز و مطابقت کلید' : 'Inspect PEM & Keys'}</span>
                </button>
              </div>

              {/* Mode Selector Tabs */}
              <div className={`flex p-1 rounded-xl border text-xs font-semibold ${
                isLightMode ? 'bg-slate-100 border-slate-200' : 'bg-black/40 border-white/10'
              }`}>
                <button
                  type="button"
                  onClick={() => setUploadMode('combined')}
                  className={`flex-1 py-2 rounded-lg transition cursor-pointer text-center font-bold ${
                    uploadMode === 'combined'
                      ? 'bg-indigo-600 text-white shadow-md'
                      : isLightMode ? 'text-slate-600 hover:text-slate-900' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  {lang === 'fa' ? 'فایل یکپارچه PEM (گواهی + کلید خصوصی)' : 'Combined PEM (Cert + Key in one file)'}
                </button>
                <button
                  type="button"
                  onClick={() => setUploadMode('separate')}
                  className={`flex-1 py-2 rounded-lg transition cursor-pointer text-center font-bold ${
                    uploadMode === 'separate'
                      ? 'bg-indigo-600 text-white shadow-md'
                      : isLightMode ? 'text-slate-600 hover:text-slate-900' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  {lang === 'fa' ? 'فایل‌های مجزا (.crt / .pem و .key)' : 'Separate Files (.crt & .key)'}
                </button>
              </div>

              {/* Certificate Input Textarea */}
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <label className={`text-xs font-bold ${isLightMode ? 'text-slate-800' : 'text-slate-200'}`}>
                    {uploadMode === 'combined'
                      ? (lang === 'fa' ? 'محتوای کامل فایل یکپارچه PEM:' : 'Full Combined PEM Content (Cert + Private Key):')
                      : (lang === 'fa' ? 'محتوای گواهی عمومی (.crt / .pem):' : 'Certificate PEM (.crt / .pem):')}
                  </label>
                  <input
                    type="file"
                    accept=".pem,.crt,.cer"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        const reader = new FileReader();
                        reader.onload = (ev) => {
                          const val = (ev.target?.result as string) || '';
                          setCertPemInput(val);
                        };
                        reader.readAsText(file);
                      }
                    }}
                    className="hidden"
                    id="upload-crt-file"
                  />
                  <label 
                    htmlFor="upload-crt-file"
                    className="text-[11px] font-semibold text-indigo-600 dark:text-indigo-400 hover:underline cursor-pointer flex items-center gap-1"
                  >
                    <FolderOpen className="w-3.5 h-3.5" />
                    <span>{lang === 'fa' ? 'انتخاب فایل' : 'Choose File'}</span>
                  </label>
                </div>
                <textarea
                  rows={uploadMode === 'combined' ? 6 : 4}
                  value={certPemInput}
                  onChange={(e) => setCertPemInput(e.target.value)}
                  placeholder={
                    uploadMode === 'combined'
                      ? "-----BEGIN CERTIFICATE-----\n...\n-----END CERTIFICATE-----\n-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----"
                      : "-----BEGIN CERTIFICATE-----\n...\n-----END CERTIFICATE-----"
                  }
                  className={`w-full p-3 rounded-xl border font-mono text-[11px] focus:outline-none leading-relaxed transition ${
                    isLightMode 
                      ? 'bg-slate-50 border-slate-300 text-slate-900 focus:border-indigo-500 focus:bg-white' 
                      : 'bg-slate-950/80 border-slate-700 text-emerald-400 focus:border-indigo-400'
                  }`}
                />
              </div>

              {/* Private Key Textarea (Shown when separate mode active) */}
              {uploadMode === 'separate' && (
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <label className={`text-xs font-bold ${isLightMode ? 'text-slate-800' : 'text-slate-200'}`}>
                      {lang === 'fa' ? 'محتوای کلید خصوصی (.key / Private Key PEM):' : 'Private Key PEM (.key):'}
                    </label>
                    <input
                      type="file"
                      accept=".key,.pem"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          const reader = new FileReader();
                          reader.onload = (ev) => setKeyPemInput((ev.target?.result as string) || '');
                          reader.readAsText(file);
                        }
                      }}
                      className="hidden"
                      id="upload-key-file"
                    />
                    <label 
                      htmlFor="upload-key-file"
                      className="text-[11px] font-semibold text-indigo-600 dark:text-indigo-400 hover:underline cursor-pointer flex items-center gap-1"
                    >
                      <FolderOpen className="w-3.5 h-3.5" />
                      <span>{lang === 'fa' ? 'انتخاب فایل .key' : 'Choose Key File'}</span>
                    </label>
                  </div>
                  <textarea
                    rows={4}
                    value={keyPemInput}
                    onChange={(e) => setKeyPemInput(e.target.value)}
                    placeholder="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----"
                    className={`w-full p-3 rounded-xl border font-mono text-[11px] focus:outline-none leading-relaxed transition ${
                      isLightMode 
                        ? 'bg-slate-50 border-slate-300 text-slate-900 focus:border-indigo-500 focus:bg-white' 
                        : 'bg-slate-950/80 border-slate-700 text-amber-400 focus:border-indigo-400'
                    }`}
                  />
                </div>
              )}

              {/* PEM Inspection Card Output */}
              {certInspectionInfo && (
                <div className={`p-4 rounded-xl border space-y-2 text-xs transition-all ${
                  isLightMode
                    ? 'bg-indigo-50/80 border-indigo-200 text-indigo-950'
                    : 'bg-indigo-950/40 border-indigo-500/30 text-indigo-200'
                }`}>
                  <div className="flex justify-between items-center font-bold">
                    <span className="flex items-center gap-1.5">
                      <ShieldCheck className="w-4 h-4 text-indigo-500" />
                      <span>{lang === 'fa' ? 'نتیجه مطابقت کلید عمومی و کلید خصوصی:' : 'Certificate & Key Inspection Result:'}</span>
                    </span>
                    <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                      certInspectionInfo.keyMatched
                        ? 'bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 border border-emerald-500/30'
                        : 'bg-rose-500/20 text-rose-700 dark:text-rose-300 border border-rose-500/30'
                    }`}>
                      {certInspectionInfo.keyMatched ? (lang === 'fa' ? '✓ کلید خصوصی مطابقت دارد' : '✓ Key Matched') : (lang === 'fa' ? '✕ عدم تطابق کلید' : '✕ Key Mismatch')}
                    </span>
                  </div>
                  {certInspectionInfo.keyMatchError && (
                    <div className="text-xs text-rose-600 dark:text-rose-300 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-500/30 p-2.5 rounded-lg font-sans leading-relaxed">
                      ⚠️ {certInspectionInfo.keyMatchError}
                    </div>
                  )}
                  <div className="text-[11px] space-y-1 font-mono pt-1">
                    <div>Subject: <span className="font-bold">{certInspectionInfo.certInfo?.subject}</span></div>
                    <div>Issuer: <span>{certInspectionInfo.certInfo?.issuer}</span></div>
                    <div>SANs: <span className="text-cyan-600 dark:text-cyan-300 font-bold">{certInspectionInfo.certInfo?.sans?.join(', ') || 'N/A'}</span></div>
                    {certInspectionInfo.certInfo?.isWildcard && (
                      <div className="text-amber-600 dark:text-amber-300 font-bold flex items-center gap-1 pt-0.5">
                        <Award className="w-3.5 h-3.5 shrink-0" />
                        <span>★ Wildcard Certificate Recognized (*.domain)</span>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Target Subdomains Selector */}
              <div className="space-y-3 pt-2 border-t border-slate-200/80 dark:border-white/10">
                <div className="flex justify-between items-center">
                  <label className={`text-xs font-bold ${isLightMode ? 'text-slate-800' : 'text-slate-200'}`}>
                    {lang === 'fa' ? 'انتخاب ساب‌دامنه‌ها جهت اعمال گواهی:' : 'Select Subdomains to Apply Certificate:'}
                  </label>
                  <button
                    type="button"
                    onClick={() => {
                      if (selectedTargetDomains.length === certDomains.length) {
                        setSelectedTargetDomains([]);
                      } else {
                        setSelectedTargetDomains(certDomains);
                      }
                    }}
                    className="text-[11px] font-bold text-indigo-600 dark:text-indigo-400 hover:underline cursor-pointer"
                  >
                    {selectedTargetDomains.length === certDomains.length ? (lang === 'fa' ? 'لغو انتخاب همه' : 'Deselect All') : (lang === 'fa' ? 'انتخاب همه' : 'Select All')}
                  </button>
                </div>

                <div className={`grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-44 overflow-y-auto p-3 rounded-xl border ${
                  isLightMode ? 'bg-slate-50 border-slate-200' : 'bg-slate-950/80 border-slate-700'
                }`}>
                  {certDomains.length === 0 ? (
                    <div className="col-span-2 text-xs text-slate-400 p-2 text-center">
                      {lang === 'fa' ? 'هیچ دامنه‌ای یافت نشد. می‌توانید با کادر زیر دامنه جدید بیافزایید.' : 'No domains found. Add custom domain below.'}
                    </div>
                  ) : (
                    certDomains.map((dom, idx) => (
                      <label key={idx} className={`flex items-center gap-2.5 text-xs font-mono cursor-pointer p-2 rounded-lg border transition ${
                        selectedTargetDomains.includes(dom)
                          ? isLightMode
                            ? 'bg-indigo-50/80 border-indigo-200 text-indigo-900 font-bold'
                            : 'bg-indigo-950/40 border-indigo-500/40 text-white font-bold'
                          : isLightMode
                          ? 'bg-white border-slate-200 text-slate-700 hover:bg-slate-100'
                          : 'bg-slate-900 border-slate-800 text-slate-300 hover:text-white hover:bg-slate-800'
                      }`}>
                        <input
                          type="checkbox"
                          checked={selectedTargetDomains.includes(dom)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setSelectedTargetDomains(prev => [...prev, dom]);
                            } else {
                              setSelectedTargetDomains(prev => prev.filter(d => d !== dom));
                            }
                          }}
                          className="rounded bg-slate-900 border-slate-600 text-indigo-600 focus:ring-0"
                        />
                        <span className="truncate">{dom}</span>
                      </label>
                    ))
                  )}
                </div>

                {/* Inline Add Custom Domain */}
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={customDomainInput}
                    onChange={(e) => setCustomDomainInput(e.target.value)}
                    placeholder={lang === 'fa' ? 'افزودن ساب‌دامنه جدید (مانند chat.domain.com)...' : 'Add custom domain...'}
                    className={`flex-1 px-3.5 py-2 rounded-xl border text-xs font-mono focus:outline-none ${
                      isLightMode ? 'bg-white border-slate-300 text-slate-900 focus:border-indigo-500' : 'bg-slate-950 border-slate-700 text-white focus:border-indigo-400'
                    }`}
                  />
                  <button
                    type="button"
                    onClick={() => {
                      const dom = customDomainInput.trim().toLowerCase();
                      if (dom && !certDomains.includes(dom)) {
                        setCertDomains(prev => [...prev, dom]);
                        setSelectedTargetDomains(prev => [...prev, dom]);
                        if (!selfSignedDomain) setSelfSignedDomain(dom);
                        setCustomDomainInput('');
                      }
                    }}
                    className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold cursor-pointer transition shrink-0 shadow-md shadow-indigo-600/20"
                  >
                    {lang === 'fa' ? '+ افزودن' : '+ Add'}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={uploadingCert}
                className="w-full py-3 px-5 rounded-xl bg-indigo-600 hover:bg-indigo-500 active:scale-[0.99] text-white font-bold text-xs flex items-center justify-center gap-2 transition shadow-lg shadow-indigo-600/25 disabled:opacity-50 cursor-pointer"
              >
                {uploadingCert ? <Loader2 className="w-4 h-4 animate-spin" /> : <ShieldCheck className="w-4 h-4" />}
                <span>{lang === 'fa' ? 'تست، اعتبارسنجی و اعمال گواهی SSL (با پشتیبان‌گیری اتوماتیک)' : 'Validate & Apply SSL Certificate (With Auto-Backup & Rollback)'}</span>
              </button>
            </form>
          </div>
        )}
      </div>

      {showConfirmInstall && (
        <div className={`fixed inset-0 z-[100] flex items-center justify-center p-4 transition-all duration-300 ${
          isLightMode ? 'bg-slate-900/40 backdrop-blur-md' : 'bg-black/75 backdrop-blur-md'
        }`}>
          <div className={`w-full max-w-md rounded-2xl shadow-2xl p-6 space-y-4 border transition-all duration-300 ${
            isLightMode ? 'bg-white border-slate-200/80 text-slate-800' : 'bg-slate-900 border-white/10 text-white'
          }`}>
            <div className="flex items-center gap-3 text-rose-500">
              <ShieldAlert className="w-8 h-8 animate-bounce" />
              <h3 className={`text-lg font-bold font-display ${
                isLightMode ? 'text-slate-900' : 'text-white'
              }`}>Scale Workers Confirmation</h3>
            </div>
            
            <div className={`space-y-3 text-sm font-sans leading-relaxed ${
              isLightMode ? 'text-slate-600' : 'text-slate-300'
            }`}>
              <p>
                Are you sure you want to trigger the automatic installation and configuration sequence of <strong>{workersCount} matrix generic workers</strong> on the remote server?
              </p>
              
              <div className={`p-4 rounded-xl border space-y-2 text-xs font-mono transition-colors duration-300 ${
                isLightMode 
                  ? 'bg-slate-50 border-slate-100 text-slate-500' 
                  : 'bg-slate-950/60 border-white/5 text-slate-400'
              }`}>
                <div className="flex justify-between items-center">
                  <span>Generic Workers:</span>
                  <span className={`font-bold text-sm ${isLightMode ? 'text-slate-900' : 'text-white'}`}>
                    {workersCount}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span>Base Port Binding:</span>
                  <span className={`font-bold ${isLightMode ? 'text-slate-800' : 'text-slate-200'}`}>
                    {workersBasePort}
                  </span>
                </div>
                <div className="flex justify-between items-center font-sans">
                  <span>Isolate Fed Sender:</span>
                  <span className={`font-bold ${isLightMode ? 'text-slate-800' : 'text-slate-200'}`}>
                    {workersFedSender ? "Yes" : "No"}
                  </span>
                </div>
              </div>
              
              <p className={`text-xs ${isLightMode ? 'text-slate-400' : 'text-slate-400'}`}>
                This process will configure and launch Redis queue structures, systemd services, and routing rules on your homeserver.
              </p>
            </div>

            <div className="flex justify-end gap-3 pt-2 font-sans">
              <button
                type="button"
                onClick={() => setShowConfirmInstall(false)}
                className={`px-4 py-2 text-xs font-semibold rounded-lg border transition ${
                  isLightMode
                    ? 'text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200/80 border-slate-200'
                    : 'text-slate-300 hover:text-white bg-white/5 hover:bg-white/10 border-white/10'
                }`}
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowConfirmInstall(false);
                  onExecuteCommand && onExecuteCommand('install_workers', { count: workersCount, federationSender: workersFedSender });
                }}
                className="px-4 py-2 text-xs font-bold text-white bg-rose-600 hover:bg-rose-500 rounded-lg transition shadow-md shadow-rose-600/20 active:scale-[0.98]"
              >
                Yes, Start Scaling Sequence
              </button>
            </div>
          </div>
        </div>
      )}
      {/* Confirm Display Name Policy Change Modal */}
      {showDisplayNameConfirmModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
          <div className={`border rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-5 text-left font-sans ${
            isLightMode ? 'bg-white border-slate-200 text-slate-800' : 'bg-slate-900 border-slate-700 text-slate-100'
          }`}>
            <div className="flex items-center gap-3 text-amber-500">
              <AlertCircle className="w-6 h-6 shrink-0" />
              <h3 className={`text-base font-bold ${isLightMode ? 'text-slate-900' : 'text-white'}`}>
                Confirm Synapse Service Restart
              </h3>
            </div>
            
            <p className={`text-sm leading-relaxed ${isLightMode ? 'text-slate-600' : 'text-slate-300'}`}>
              Applying these policy updates requires restarting the Matrix Synapse service, causing a brief temporary downtime. Do you want to proceed?
            </p>

            <div className={`p-3.5 rounded-xl text-xs space-y-2 ${
              isLightMode ? 'bg-slate-50 border border-slate-200 text-slate-600' : 'bg-slate-950/80 border border-slate-800 text-slate-300'
            }`}>
              <div className="flex justify-between items-center">
                <span>Display Name Policy:</span>
                <span className={`font-bold px-2 py-0.5 rounded text-[11px] ${
                  displayNamePolicyEnabled 
                    ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20' 
                    : 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20'
                }`}>
                  {displayNamePolicyEnabled ? 'Allowed (True)' : 'Disabled (False)'}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span>Avatar Policy:</span>
                <span className={`font-bold px-2 py-0.5 rounded text-[11px] ${
                  avatarPolicyEnabled 
                    ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20' 
                    : 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20'
                }`}>
                  {avatarPolicyEnabled ? 'Allowed (True)' : 'Disabled (False)'}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span>Room Creation Policy:</span>
                <span className={`font-bold px-2 py-0.5 rounded text-[11px] ${
                  roomCreationPolicyEnabled 
                    ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20' 
                    : 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20'
                }`}>
                  {roomCreationPolicyEnabled ? 'Allowed (True)' : 'Restricted (False)'}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span>Config Source Files:</span>
                <code className={`font-mono text-[10px] px-2 py-0.5 rounded border ${
                  isLightMode ? 'bg-slate-200/80 text-slate-800 border-slate-300' : 'bg-black/50 text-cyan-300 border-white/10'
                }`}>{displayNamePolicySourceFile && displayNamePolicySourceFile.includes('homeserver') ? displayNamePolicySourceFile : '/etc/synapse/conf.d/display_name.yaml'} & /etc/matrix-synapse/homeserver.yaml</code>
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setShowDisplayNameConfirmModal(false)}
                className={`px-4 py-2 text-xs font-semibold rounded-xl border transition ${
                  isLightMode
                    ? 'bg-slate-100 hover:bg-slate-200 text-slate-700 border-slate-300'
                    : 'bg-slate-800 hover:bg-slate-700 text-slate-300 border-slate-700'
                }`}
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={confirmDisplayNamePolicyChange}
                disabled={updatingDisplayNamePolicy}
                className="px-4 py-2 text-xs font-bold rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white transition shadow-lg shadow-cyan-600/20 active:scale-95 disabled:opacity-50 flex items-center gap-2 cursor-pointer"
              >
                {updatingDisplayNamePolicy && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                <span>Save & Restart Service</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
