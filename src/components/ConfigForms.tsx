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
  onSaveConfig: (data: { config?: Partial<MatrixConfig>; ldap?: Partial<LDAPConfig>; workers?: any }) => any;
  onRegisterUser: (username: string, pass: string, isAdmin: boolean) => void;
  onDeactivateUser: (mxid: string) => void;
  onReactivateUser: (mxid: string, pass: string, isAdmin: boolean) => void;
  userRole: string;
  authToken: string;
  showToast?: (type: 'success' | 'error', text: string) => void;
  isExecuting?: boolean;
  onExecuteCommand?: (cmd: string, args?: any) => void;
  isLightMode?: boolean;
  lang?: 'fa' | 'en' | 'es' | 'ar' | 'de' | 'ru';
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

type TabType = 'homeserver' | 'network' | 'ldap' | 'workers' | 'policies' | 'smtp' | 'client' | 'users' | 'video' | 'security' | 'api';

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
  onExecuteCommand,
  isLightMode = false,
  lang = 'en'
}: ConfigFormsProps) {
  const t = configFormTranslations[lang] || configFormTranslations.en;
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

  // Network & Backups State
  const [listenMode, setListenMode] = useState<'localhost' | 'all' | 'custom'>('all');
  const [listenCustomIp, setListenCustomIp] = useState<string>('');
  const [backupsList, setBackupsList] = useState<any[]>([]);
  const [loadingBackups, setLoadingBackups] = useState<boolean>(false);
  const [rollingBack, setRollingBack] = useState<boolean>(false);

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
      setListenMode(config.LISTEN_MODE || 'all');
      setListenCustomIp(config.LISTEN_CUSTOM_IP || '');
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
    }
  }, [activeTab, authToken]);

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
    runAsyncSave(() => onSaveConfig({
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
        APP_NAME: appName
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
          <span>{lang === 'fa' ? 'شبکه و پشتیبان‌گیری' : 'Network & Backups'}</span>
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
          onClick={() => setActiveTab('users')}
          className={`flex items-center gap-3 px-4 py-3 rounded-2xl text-sm font-semibold transition-all text-left ${
            activeTab === 'users' 
              ? 'bg-white/10 text-white border border-white/10 shadow-[0_0_12px_rgba(16,185,129,0.15)]' 
              : 'text-gray-400 hover:text-white hover:bg-white/5'
          }`}
          id="tab-users"
        >
          <Users className="w-5 h-5 text-emerald-400" />
          <span>{t.matrixUsers}</span>
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
                onClick={fetchBackups}
                disabled={loadingBackups}
                className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-medium text-slate-300 transition-all"
              >
                <RefreshCw className={`w-3.5 h-3.5 text-teal-400 ${loadingBackups ? 'animate-spin' : ''}`} />
                <span>{lang === 'fa' ? 'بروزرسانی لیست پشتیبان‌ها' : 'Refresh Backups'}</span>
              </button>
            </div>

            {/* Listener Configuration */}
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
                <div className="pt-2">
                  <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider block mb-1.5">
                    {lang === 'fa' ? 'آدرس IP اختصاصی' : 'Custom IP Address'}
                  </label>
                  <input
                    type="text"
                    value={listenCustomIp}
                    onChange={(e) => setListenCustomIp(e.target.value)}
                    placeholder="e.g. 172.16.50.216"
                    className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-2 text-sm text-slate-200 focus:outline-none focus:border-teal-500/50"
                  />
                </div>
              )}

              <div className="pt-3 flex justify-end">
                <button
                  type="submit"
                  disabled={isSaving || isReadOnly}
                  className="px-5 py-2.5 rounded-xl bg-teal-500 hover:bg-teal-600 text-white font-semibold text-sm transition-all shadow-[0_0_15px_rgba(20,184,166,0.3)] disabled:opacity-50 flex items-center gap-2"
                >
                  {isSaving ? <RefreshCw className="w-4 h-4 animate-spin" /> : <CheckCircle className="w-4 h-4" />}
                  <span>{lang === 'fa' ? 'ذخیره تنظیمات شبکه' : 'Save Network Settings'}</span>
                </button>
              </div>
            </form>

            {/* Backups & Rollback Section */}
            <div className="space-y-4 bg-black/30 border border-white/5 p-5 rounded-2xl">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-display font-semibold text-white flex items-center gap-2">
                  <Clock className="w-4 h-4 text-indigo-400" />
                  <span>{lang === 'fa' ? 'نسخه‌های پشتیبان کانفیگ (Configuration Backups)' : 'Configuration Backups & Rollback'}</span>
                </h3>

                <button
                  type="button"
                  onClick={() => handleRollback()}
                  disabled={rollingBack || backupsList.length === 0}
                  className="px-3 py-1.5 rounded-xl bg-rose-500/20 border border-rose-500/30 text-rose-300 hover:bg-rose-500/30 text-xs font-semibold transition-all flex items-center gap-1.5 disabled:opacity-50"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${rollingBack ? 'animate-spin' : ''}`} />
                  <span>{lang === 'fa' ? 'بازگردانی به آخرین پشتیبان' : 'Rollback to Latest'}</span>
                </button>
              </div>

              <p className="text-xs text-slate-400">
                {lang === 'fa' 
                  ? 'قبل از هر تغییر در تنظیمات، یک نسخه پشتیبان ایمن ساخته می‌شود. در صورت بروز هرگونه مشکل می‌توانید کانفیگ قبلی را بازیابی کنید.'
                  : 'An automatic backup is generated before every configuration update. Restore any previous configuration safely below.'}
              </p>

              {loadingBackups ? (
                <div className="p-6 text-center text-slate-400 text-xs">
                  <RefreshCw className="w-5 h-5 animate-spin mx-auto mb-2 text-teal-400" />
                  <span>{lang === 'fa' ? 'در حال بارگذاری لیست پشتیبان‌ها...' : 'Loading backup files...'}</span>
                </div>
              ) : backupsList.length === 0 ? (
                <div className="p-6 text-center text-slate-500 text-xs bg-black/20 rounded-xl border border-white/5">
                  {lang === 'fa' ? 'هیچ نسخه پشتیبانی یافت نشد. پس از اولین تغییر، بک‌آپ‌ها در اینجا نمایش داده می‌شوند.' : 'No configuration backups found.'}
                </div>
              ) : (
                <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
                  {backupsList.map((bak: any, idx: number) => (
                    <div 
                      key={bak.filename || idx}
                      className="flex items-center justify-between p-3 rounded-xl bg-black/20 border border-white/5 hover:border-white/10 transition-all"
                    >
                      <div className="flex items-center gap-3">
                        <div className="p-2 rounded-lg bg-indigo-500/10 text-indigo-400">
                          <Clock className="w-4 h-4" />
                        </div>
                        <div>
                          <div className="text-xs font-mono font-medium text-slate-200">
                            {bak.filename}
                          </div>
                          <div className="text-[11px] text-slate-400">
                            {bak.dateStr || new Date(bak.timestamp).toLocaleString()}
                          </div>
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={() => handleRollback(bak.filename)}
                        disabled={rollingBack || isReadOnly}
                        className="px-3 py-1.5 rounded-lg bg-indigo-500/20 hover:bg-indigo-500/30 border border-indigo-500/30 text-indigo-300 text-xs font-semibold transition-all disabled:opacity-50 flex items-center gap-1"
                      >
                        <span>{lang === 'fa' ? 'بازگردانی' : 'Rollback'}</span>
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
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
                  disabled={isSaving}
                  className="px-6 py-2.5 rounded-xl bg-amber-500 text-slate-950 font-bold text-sm shadow-[0_0_15px_rgba(245,158,11,0.3)] hover:scale-105 transition-transform disabled:opacity-50 disabled:pointer-events-none flex items-center gap-2"
                >
                  {isSaving ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin text-slate-950" />
                      Saving SMTP...
                    </>
                  ) : (
                    "Save SMTP Credentials"
                  )}
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
    </div>
  );
}
