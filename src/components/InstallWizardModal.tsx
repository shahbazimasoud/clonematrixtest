import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  X, Server, Globe, ShieldAlert, Key, Settings, 
  CheckCircle, Check, Loader2, ChevronLeft, ChevronRight, 
  AlertCircle, FileText, CloudDownload, Folder, BookOpen, ArrowRight, Activity
} from 'lucide-react';

interface InstallWizardModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (config: any) => void;
  lang: string;
  isLightMode: boolean;
  defaultHost?: string;
  defaultDomain?: string;
}

const translations = {
  en: {
    title: "Configure Matrix Enterprise Stack",
    subtitle: "Complete the step-by-step wizard to configure and deploy a fully production-ready, non-interactive Matrix cluster.",
    step: "Step",
    next: "Next",
    back: "Back",
    cancel: "Cancel",
    confirmInstall: "Confirm & Start Installation",
    
    // Step 1: Installation Source
    sourceTitle: "Installation Source",
    sourceDesc: "Specify how you want to retrieve the required packages for the installation.",
    sourceOnline: "Online Installation",
    sourceOnlineDesc: "Download all components dynamically from the official repositories and GitHub during the install process.",
    sourceOffline: "Offline / Local Installation",
    sourceOfflineDesc: "Use local package files, pre-downloaded Debian packages, and static assets from the server.",
    offlineConfigLabel: "Offline Config File Path (Optional)",
    offlineConfigPlaceholder: "e.g., /etc/matrix-stack.conf",
    offlineConfigHelp: "If specified, values from this file will be loaded as defaults.",
    offlineElementLabel: "Offline Element Web Tarball Path (Optional)",
    offlineElementPlaceholder: "e.g., /tmp/element-web.tar.gz",
    offlineSynapseDebLabel: "Synapse .deb Package Folder (Optional)",
    offlineSynapseDebPlaceholder: "e.g., /tmp/synapse_debs",

    // Step 2: Server Settings
    serverTitle: "Server & Domains",
    serverDesc: "Specify your core networking, domain routing, and certificate delivery settings.",
    hsDomainLabel: "Matrix Homeserver Domain",
    hsDomainPlaceholder: "matrix.company.local",
    elementDomainLabel: "Element Web Frontend Domain",
    elementDomainPlaceholder: "chat.company.local",
    baseDomainLabel: "Base Domain (for Well-Known pointers)",
    baseDomainPlaceholder: "company.local",
    publicIpLabel: "Server Public IP Address",
    publicIpPlaceholder: "e.g., 198.51.100.42",
    leEmailLabel: "Notification / SSL Let's Encrypt Email",
    leEmailPlaceholder: "admin@company.local",
    dbNotice: "Database Notice: The PostgreSQL database cluster is automatically configured with dedicated names and secure random passwords. No manual database inputs are required.",

    // Step 3: SSL Certificate
    sslTitle: "SSL/TLS Security Layer",
    sslDesc: "Select the encryption method for secure HTTPS connections between clients, servers, and homeservers.",
    sslAuto: "Automatic Resolution",
    sslAutoDesc: "Automatically detects domain: Internal domains (.local, .lan) resolve to Self-Signed; Public domains request Let's Encrypt certificates.",
    sslSelfSigned: "Force Self-Signed Certificates",
    sslSelfSignedDesc: "Create a safe, local 10-year 4096-bit self-signed certificate. Perfect for private VPNs, development, or closed networks.",
    sslCustom: "Custom PEM Certificates",
    sslCustomDesc: "Upload or specify paths to your own pre-generated, trusted SSL certificate files.",
    customCertLabel: "Fullchain PEM File Path",
    customCertPlaceholder: "e.g., /etc/ssl/certs/matrix.crt",
    customKeyLabel: "Private Key PEM File Path",
    customKeyPlaceholder: "e.g., /etc/ssl/private/matrix.key",
    customChainLabel: "CA Chain Certificate PEM File Path (Optional)",
    customChainPlaceholder: "e.g., /etc/ssl/certs/ca-bundle.crt",

    // Step 4: Element Web
    elementTitle: "Element Web Frontend",
    elementDesc: "Configure the deployment strategy for the Element Web chat client.",
    elementOnline: "Online GitHub Distribution",
    elementOnlineDesc: "Download and deploy standard Element release packages directly from GitHub.",
    elementVersionLabel: "Custom Element Version (Optional)",
    elementVersionPlaceholder: "e.g., 1.11.55 (defaults to latest supported stable)",
    elementOffline: "Local Distribution Tarball",
    elementOfflineDesc: "Decompress and host a static .tar.gz archive of Element Web pre-uploaded to the server.",
    elementOfflinePathLabel: "Local Element Tarball File Path",
    elementOfflinePathPlaceholder: "e.g., /tmp/element-web.tar.gz",
    elementOfflineLabelLabel: "Offline Version Tag (Optional)",
    elementOfflineLabelPlaceholder: "e.g., v1.11.55",

    // Step 5: LDAP Addons
    ldapTitle: "Enterprise Directory (LDAP)",
    ldapDesc: "Enable LDAP integration to allow your users to log in using their enterprise directory accounts.",
    ldapCheckbox: "Configure LDAP Authentication right after installation completes?",
    ldapNotice: "If checked, the system will prompt you with the LDAP Wizard immediately after the core installation finishes successfully.",

    // Step 6: Summary & Confirm
    summaryTitle: "Installation Summary",
    summaryDesc: "Please review all your installation parameters carefully. Clicking confirm will trigger a non-interactive verbose deployment.",
    confirmReady: "System Ready for Non-Interactive Deployment",
    confirmReadyDesc: "All mandatory fields have been validated. The server will execute the installation script and pipe the real-time verbose logs directly into your web console.",
    source: "Source",
    domains: "Domains",
    ssl: "SSL Mode",
    element: "Element Web",
    ldap: "LDAP Auth",
    yes: "Yes",
    no: "No",
    online: "Online",
    offline: "Offline",

    // Validations
    errDomain: "Please enter a valid domain format.",
    errIp: "Please enter a valid IPv4 address.",
    errEmail: "Please enter a valid email address.",
    errRequired: "This field is required."
  },
  fa: {
    title: "پیکربندی هوشمند پکیج ماتریکس (Stack)",
    subtitle: "این ویزارد چندمرحله‌ای به شما امکان می‌دهد اطلاعات نصب را تنظیم کرده تا فرآیند نصب بدون هیچ پرسش تعاملی (Non-interactive) انجام شود.",
    step: "مرحله",
    next: "مرحله بعدی",
    back: "مرحله قبلی",
    cancel: "انصراف",
    confirmInstall: "تایید و شروع نصب پکیج",
    
    // Step 1: Installation Source
    sourceTitle: "منبع تامین پکیج‌های نصب",
    sourceDesc: "نحوه دریافت فایل‌های نصب ماتریکس و کلاینت آن را مشخص کنید.",
    sourceOnline: "دانلود آنلاین (Online)",
    sourceOnlineDesc: "تمام پکیج‌ها و کدهای کلاینت به صورت پویا در حین نصب از اینترنت و ریپازیتوری‌های رسمی دریافت می‌شوند.",
    sourceOffline: "فایل‌های محلی و آفلاین (Offline)",
    sourceOfflineDesc: "استفاده از فایل‌های کلاینت دانلود شده، پکیج‌های deb محلی و کانفیگ‌های قبلی روی سرور.",
    offlineConfigLabel: "مسیر فایل کانفیگ ذخیره‌شده از نصب قبلی (اختیاری)",
    offlineConfigPlaceholder: "مثال: /etc/matrix-stack.conf",
    offlineConfigHelp: "در صورت وجود، مقادیر پیش‌فرض بقیه فرم از روی این فایل پر خواهند شد.",
    offlineElementLabel: "مسیر فایل Element Web به صورت tar.gz (اختیاری)",
    offlineElementPlaceholder: "مثال: /tmp/element-web.tar.gz",
    offlineSynapseDebLabel: "مسیر پوشه حاوی فایل‌های .deb پکیج Synapse (اختیاری)",
    offlineSynapseDebPlaceholder: "مثال: /tmp/synapse_debs",

    // Step 2: Server Settings
    serverTitle: "تنظیمات دامنه و سرور",
    serverDesc: "آدرس دامنه‌ها و آی‌پی سرور جهت مسیریابی صحیح وب و چت را وارد نمایید.",
    hsDomainLabel: "دامنه Matrix Homeserver (اجباری)",
    hsDomainPlaceholder: "matrix.company.local",
    elementDomainLabel: "دامنه Element Web (اجباری)",
    elementDomainPlaceholder: "chat.company.local",
    baseDomainLabel: "دامنه پایه برای well-known (اجباری)",
    baseDomainPlaceholder: "company.local",
    publicIpLabel: "آی‌پی پابلیک سرور (اجباری)",
    publicIpPlaceholder: "مثال: 198.51.100.42",
    leEmailLabel: "ایمیل Let's Encrypt و اعلان‌ها (اجباری)",
    leEmailPlaceholder: "admin@company.local",
    dbNotice: "توضیح پایگاه‌داده: پایگاه‌داده PostgreSQL است و به صورت خودکار با نام دیتابیس، یوزر، و پسورد تصادفی توسط خود اسکریپت ساخته می‌شود و نیازی به پرسیدن از کاربر نیست.",

    // Step 3: SSL Certificate
    sslTitle: "تنظیمات گواهی امنیتی SSL/TLS",
    sslDesc: "روش رمزنگاری و تامین گواهی‌های SSL برای دامنه‌ها را تعیین کنید.",
    sslAuto: "تشخیص هوشمند و خودکار (Auto)",
    sslAutoDesc: "تشخیص خودکار بر اساس دامنه: دامنه‌های داخلی (.local/.lan) مجهز به Self-signed و دامنه‌های عمومی مجهز به Let's Encrypt خواهند شد.",
    sslSelfSigned: "گواهی امضا شده شخصی اجباری (Self-Signed)",
    sslSelfSignedDesc: "ساخت گواهی امنیتی بومی ۱۰ ساله و ۴۰۹۶ بیتی. مناسب شبکه‌های داخلی، VPN و اهداف توسعه.",
    sslCustom: "گواهی شخصی سفارشی (PEM Certificate)",
    sslCustomDesc: "در صورت داشتن گواهی معتبر خریداری شده، مسیر فایل‌های PEM را در سرور مشخص کنید.",
    customCertLabel: "مسیر فایل گواهی اصلی (Cert / Fullchain PEM)",
    customCertPlaceholder: "مثال: /etc/ssl/certs/matrix.crt",
    customKeyLabel: "مسیر فایل کلید خصوصی (Private Key PEM)",
    customKeyPlaceholder: "مثال: /etc/ssl/private/matrix.key",
    customChainLabel: "مسیر فایل زنجیره گواهی (CA Chain PEM - اختیاری)",
    customChainPlaceholder: "مثال: /etc/ssl/certs/ca-bundle.crt",

    // Step 4: Element Web
    elementTitle: "تنظیمات وب کلاینت Element Web",
    elementDesc: "روش استقرار و نسخه مورد استفاده کلاینت چت Element را مشخص کنید.",
    elementOnline: "دانلود خودکار آنلاین از گیت‌هاب",
    elementOnlineDesc: "دانلود مستقیم پکیج رسمی وب کلاینت از مخازن گیت‌هاب المنت.",
    elementVersionLabel: "ورژن دلخواه المنت (اختیاری)",
    elementVersionPlaceholder: "مثال: 1.11.55 (در صورت خالی بودن آخرین نسخه پایدار نصب می‌شود)",
    elementOffline: "استفاده از فایل فشرده محلی (tar.gz)",
    elementOfflineDesc: "استفاده از پکیج از پیش دانلود شده المنت وب که در سرور قرار دارد.",
    elementOfflinePathLabel: "مسیر فایل tar.gz المنت کلاینت روی سرور",
    elementOfflinePathPlaceholder: "مثال: /tmp/element-web.tar.gz",
    elementOfflineLabelLabel: "برچسب ورژن کلاینت آفلاین (اختیاری)",
    elementOfflineLabelPlaceholder: "مثال: v1.11.55",

    // Step 5: LDAP Addons
    ldapTitle: "یکپارچه‌سازی سرویس LDAP (اختیاری)",
    ldapDesc: "امکان احراز هویت کاربران سازمانی از طریق سرویس دایرکتوری سنترال (LDAP).",
    ldapCheckbox: "آیا می‌خواهید همین الان احراز هویت LDAP را پیکربندی کنید؟",
    ldapNotice: "در صورت انتخاب، بلافاصله پس از اتمام موفق نصب اصلی ماتریکس، ویزارد تنظیمات سرور LDAP به شما نمایش داده می‌شود.",

    // Step 6: Summary & Confirm
    summaryTitle: "خلاصه پیکربندی و شروع نصب",
    summaryDesc: "لطفاً مقادیر واردشده را با دقت مرور کنید. با کلیک بر روی دکمه شروع، عملیات نصب به صورت غیرتعاملی در پس‌زمینه آغاز خواهد شد.",
    confirmReady: "آماده‌سازی نهایی برای استقرار بدون وقفه",
    confirmReadyDesc: "تمامی مقادیر اجباری تایید شدند. ترمینال کنسول وب را باز نگه دارید تا جزئیات و ورباس نصب را به صورت زنده تماشا کنید.",
    source: "منبع فایل‌ها",
    domains: "دامنه‌ها",
    ssl: "حالت گواهی SSL",
    element: "پکیج کلاینت",
    ldap: "پیکربندی LDAP",
    yes: "بله",
    no: "خیر",
    online: "آنلاین (اینترنتی)",
    offline: "آفلاین (محلی)",

    // Validations
    errDomain: "فرمت دامنه نامعتبر است.",
    errIp: "آی‌پی وارد شده نامعتبر است (فرمت IPv4).",
    errEmail: "ایمیل وارد شده نامعتبر است.",
    errRequired: "پر کردن این فیلد اجباری است."
  }
};

export function InstallWizardModal({
  isOpen,
  onClose,
  onConfirm,
  lang,
  isLightMode,
  defaultHost = "127.0.0.1",
  defaultDomain = "company.local"
}: InstallWizardModalProps) {
  const isRtl = lang === 'fa';
  const t = translations[lang as 'fa' | 'en'] || translations.en;

  const [currentStep, setCurrentStep] = useState(1);
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  // Form states
  const [installSource, setInstallSource] = useState<'online' | 'offline'>('online');
  const [offlineConfigPath, setOfflineConfigPath] = useState('');
  const [offlineElementPath, setOfflineElementPath] = useState('');
  const [offlineSynapseDebDir, setOfflineSynapseDebDir] = useState('');

  const [hsDomain, setHsDomain] = useState(defaultDomain ? `matrix.${defaultDomain}` : 'matrix.company.local');
  const [elementDomain, setElementDomain] = useState(defaultDomain ? `chat.${defaultDomain}` : 'chat.company.local');
  const [baseDomain, setBaseDomain] = useState(defaultDomain || 'company.local');
  const [publicIp, setPublicIp] = useState(defaultHost || '127.0.0.1');
  const [leEmail, setLeEmail] = useState(`admin@${defaultDomain || 'company.local'}`);

  const [sslMode, setSslMode] = useState<'auto' | 'selfsigned' | 'custom'>('auto');
  const [customCertPem, setCustomCertPem] = useState('');
  const [customKeyPem, setCustomKeyPem] = useState('');
  const [customChainPem, setCustomChainPem] = useState('');

  const [elementInstallMode, setElementInstallMode] = useState<'online' | 'offline'>('online');
  const [elementOnlineVersion, setElementOnlineVersion] = useState('');
  const [elementOfflinePath, setElementOfflinePath] = useState('');
  const [elementOfflineVersionLabel, setElementOfflineVersionLabel] = useState('');

  const [ldapConfigureNow, setLdapConfigureNow] = useState(false);

  if (!isOpen) return null;

  const validateStep = (step: number): boolean => {
    const errors: Record<string, string> = {};
    const domainRegex = /^([a-zA-Z0-9-]+\.)*[a-zA-Z0-9-]+\.[a-zA-Z]{2,}$/;
    const ipRegex = /^(?:[0-9]{1,3}\.){3}[0-9]{1,3}$/;
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (step === 2) {
      if (!hsDomain.trim()) errors.hsDomain = t.errRequired;
      else if (!domainRegex.test(hsDomain)) errors.hsDomain = t.errDomain;

      if (!elementDomain.trim()) errors.elementDomain = t.errRequired;
      else if (!domainRegex.test(elementDomain)) errors.elementDomain = t.errDomain;

      if (!baseDomain.trim()) errors.baseDomain = t.errRequired;
      else if (!domainRegex.test(baseDomain)) errors.baseDomain = t.errDomain;

      if (!publicIp.trim()) errors.publicIp = t.errRequired;
      else if (!ipRegex.test(publicIp)) errors.publicIp = t.errIp;

      if (!leEmail.trim()) errors.leEmail = t.errRequired;
      else if (!emailRegex.test(leEmail)) errors.leEmail = t.errEmail;
    }

    if (step === 3 && sslMode === 'custom') {
      if (!customCertPem.trim()) errors.customCertPem = t.errRequired;
      if (!customKeyPem.trim()) errors.customKeyPem = t.errRequired;
    }

    if (step === 4 && elementInstallMode === 'offline') {
      if (!elementOfflinePath.trim()) errors.elementOfflinePath = t.errRequired;
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleNext = () => {
    if (validateStep(currentStep)) {
      setCurrentStep(prev => prev + 1);
    }
  };

  const handleBack = () => {
    setCurrentStep(prev => Math.max(1, prev - 1));
  };

  const handleFinalConfirm = () => {
    if (!validateStep(2) || !validateStep(3) || !validateStep(4)) {
      return;
    }

    // Prepare config object for backend installation
    const finalConfig: any = {
      HS_DOMAIN: hsDomain.trim(),
      ELEMENT_DOMAIN: elementDomain.trim(),
      BASE_DOMAIN: baseDomain.trim(),
      PUBLIC_IP: publicIp.trim(),
      LE_EMAIL: leEmail.trim(),
    };

    // Mapping SSL Mode
    if (sslMode === 'auto') {
      // Auto-detection logic passed down as SSL_MODE=letsencrypt if it has public domain, else selfsigned
      // Let script auto detect or pass direct. We will pass SSL_MODE='auto' or 'letsencrypt' based on domain format.
      const isLocal = hsDomain.includes('.local') || hsDomain.includes('.lan') || hsDomain.includes('.internal') || hsDomain.includes('localhost');
      finalConfig.SSL_MODE = isLocal ? 'selfsigned' : 'letsencrypt';
    } else if (sslMode === 'selfsigned') {
      finalConfig.SSL_MODE = 'selfsigned';
    } else if (sslMode === 'custom') {
      finalConfig.SSL_MODE = 'custom';
      finalConfig.CUSTOM_CERT_PEM = customCertPem.trim();
      finalConfig.CUSTOM_KEY_PEM = customKeyPem.trim();
      if (customChainPem.trim()) {
        finalConfig.CUSTOM_CHAIN_PEM = customChainPem.trim();
      }
    }

    // Mapping Installation Source and offline packages
    if (installSource === 'offline') {
      if (offlineConfigPath.trim()) {
        finalConfig.OFFLINE_CONFIG_PATH = offlineConfigPath.trim();
      }
      if (offlineElementPath.trim()) {
        finalConfig.OFFLINE_ELEMENT_PKG = offlineElementPath.trim();
      }
      if (offlineSynapseDebDir.trim()) {
        finalConfig.OFFLINE_SYNAPSE_DEB_DIR = offlineSynapseDebDir.trim();
      }
    }

    // Mapping Element Web Installation
    if (elementInstallMode === 'offline') {
      finalConfig.OFFLINE_ELEMENT_PKG = elementOfflinePath.trim();
      if (elementOfflineVersionLabel.trim()) {
        finalConfig.ELEMENT_VERSION = elementOfflineVersionLabel.trim();
      }
    } else {
      if (elementOnlineVersion.trim()) {
        finalConfig.ELEMENT_VERSION = elementOnlineVersion.trim();
      }
    }

    // LDAP switch
    if (ldapConfigureNow) {
      finalConfig.LDAP_NOW = 'y';
    } else {
      finalConfig.LDAP_NOW = 'n';
    }

    onConfirm(finalConfig);
  };

  const stepsList = [
    { id: 1, name: t.sourceTitle },
    { id: 2, name: t.serverTitle },
    { id: 3, name: t.sslTitle },
    { id: 4, name: t.elementTitle },
    { id: 5, name: t.ldapTitle },
    { id: 6, name: t.summaryTitle }
  ];

  return (
    <div className={`fixed inset-0 z-50 flex items-center justify-center p-4 backdrop-blur-md overflow-y-auto transition-colors duration-300 ${isLightMode ? 'bg-slate-900/40' : 'bg-slate-950/80'}`}>
      <motion.div 
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        transition={{ type: 'spring', duration: 0.5 }}
        className={`relative w-full max-w-4xl border rounded-3xl flex flex-col max-h-[90vh] overflow-hidden transition-all duration-300 ${
          isLightMode 
            ? 'bg-white border-slate-200 shadow-2xl shadow-slate-300/60' 
            : 'bg-slate-900 border-white/10 shadow-2xl shadow-rose-950/20'
        }`}
        dir={isRtl ? "rtl" : "ltr"}
      >
        {/* Header */}
        <div className={`flex items-center justify-between p-6 border-b transition-colors duration-300 ${isLightMode ? 'border-slate-100 bg-slate-50' : 'border-white/5 bg-slate-950/40'}`}>
          <div className="flex items-center gap-3">
            <div className={`p-2.5 rounded-xl border transition-all ${
              isLightMode 
                ? 'bg-gradient-to-br from-rose-50 to-amber-50 border-rose-200 text-rose-500' 
                : 'bg-gradient-to-br from-rose-500/20 to-amber-500/20 border-rose-500/20 text-rose-400'
            }`}>
              <Activity className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <h2 className={`text-xl font-display font-extrabold transition-colors duration-300 ${isLightMode ? 'text-slate-900' : 'text-white'}`}>{t.title}</h2>
              <p className={`text-xs mt-0.5 transition-colors duration-300 ${isLightMode ? 'text-slate-500' : 'text-slate-400'}`}>{t.subtitle}</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className={`p-2 rounded-xl transition-all cursor-pointer ${
              isLightMode 
                ? 'hover:bg-slate-100 text-slate-400 hover:text-slate-800' 
                : 'hover:bg-white/5 text-slate-400 hover:text-white'
            }`}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Stepper progress indicator */}
        <div className={`px-6 py-4 border-b flex items-center justify-between overflow-x-auto gap-4 scrollbar-none transition-colors duration-300 ${
          isLightMode ? 'border-slate-100 bg-slate-50/50' : 'border-white/5 bg-slate-950/20'
        }`}>
          {stepsList.map((step) => {
            const isActive = step.id === currentStep;
            const isCompleted = step.id < currentStep;
            return (
              <div key={step.id} className="flex items-center gap-2 shrink-0">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold font-mono border transition-all ${
                  isActive 
                    ? isLightMode 
                      ? 'bg-rose-50 text-rose-600 border-rose-200 ring-4 ring-rose-100 shadow-sm shadow-rose-100' 
                      : 'bg-rose-500/10 text-rose-400 border-rose-500/30 ring-4 ring-rose-500/5 shadow-md shadow-rose-500/10'
                    : isCompleted
                      ? isLightMode
                        ? 'bg-emerald-50 text-emerald-600 border-emerald-200'
                        : 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30'
                      : isLightMode
                        ? 'bg-slate-100 text-slate-400 border-slate-200'
                        : 'bg-slate-950/40 text-slate-500 border-white/5'
                }`}>
                  {isCompleted ? <Check className="w-4 h-4" /> : step.id}
                </div>
                <span className={`text-xs font-semibold transition-all ${
                  isActive 
                    ? isLightMode ? 'text-slate-900 font-bold' : 'text-white font-bold' 
                    : isCompleted 
                      ? isLightMode ? 'text-slate-600' : 'text-slate-300' 
                      : isLightMode ? 'text-slate-400' : 'text-slate-500'
                }`}>
                  {step.name}
                </span>
                {step.id < 6 && (
                  <ChevronRight className={`w-3.5 h-3.5 shrink-0 ${isRtl ? 'rotate-180' : ''} ${
                    step.id < currentStep 
                      ? 'text-emerald-500' 
                      : isLightMode ? 'text-slate-300' : 'text-slate-700'
                  }`} />
                )}
              </div>
            );
          })}
        </div>

        {/* Body content */}
        <div className={`flex-1 p-6 overflow-y-auto min-h-[350px] transition-colors duration-300 ${isLightMode ? 'bg-slate-50/20' : 'bg-slate-900/40'}`}>
          <AnimatePresence mode="wait">
            <motion.div
              key={currentStep}
              initial={{ opacity: 0, x: isRtl ? -15 : 15 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: isRtl ? 15 : -15 }}
              transition={{ duration: 0.2 }}
            >
              {/* STEP 1: Installation Source */}
              {currentStep === 1 && (
                <div className="space-y-6">
                  <div>
                    <h3 className={`text-lg font-bold mb-1 flex items-center gap-2 transition-colors duration-300 ${isLightMode ? 'text-slate-800' : 'text-white'}`}>
                      <Folder className="w-5 h-5 text-rose-400" />
                      {t.sourceTitle}
                    </h3>
                    <p className={`text-sm transition-colors duration-300 ${isLightMode ? 'text-slate-500' : 'text-slate-400'}`}>{t.sourceDesc}</p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Online Card */}
                    <div 
                      onClick={() => setInstallSource('online')}
                      className={`p-5 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between h-44 ${
                        installSource === 'online' 
                          ? isLightMode
                            ? 'bg-rose-50/50 border-rose-500/40 text-slate-800 ring-2 ring-rose-500/10 shadow-sm shadow-rose-100'
                            : 'bg-rose-500/5 border-rose-500/40 text-white ring-2 ring-rose-500/10' 
                          : isLightMode
                            ? 'bg-white border-slate-200 text-slate-600 hover:border-slate-300 hover:bg-slate-50'
                            : 'bg-slate-950/40 border-white/5 text-slate-400 hover:border-white/10 hover:bg-slate-950/60'
                      }`}
                    >
                      <div className="flex items-start justify-between">
                        <div className={`p-3 rounded-xl border transition-colors ${
                          isLightMode ? 'bg-slate-50 border-slate-200 text-rose-500' : 'bg-slate-900 border-white/10 text-rose-400'
                        }`}>
                          <CloudDownload className="w-6 h-6" />
                        </div>
                        {installSource === 'online' && (
                          <span className={`p-1 rounded-full border ${isLightMode ? 'bg-rose-100 text-rose-600 border-rose-200' : 'bg-rose-500/20 text-rose-400 border-rose-500/20'}`}>
                            <Check className="w-3.5 h-3.5" />
                          </span>
                        )}
                      </div>
                      <div className="mt-4">
                        <h4 className={`font-bold text-md transition-colors ${isLightMode ? 'text-slate-800' : 'text-white'}`}>{t.sourceOnline}</h4>
                        <p className={`text-xs mt-1 transition-colors ${isLightMode ? 'text-slate-500' : 'text-slate-400'}`}>{t.sourceOnlineDesc}</p>
                      </div>
                    </div>

                    {/* Offline Card */}
                    <div 
                      onClick={() => setInstallSource('offline')}
                      className={`p-5 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between h-44 ${
                        installSource === 'offline' 
                          ? isLightMode
                            ? 'bg-rose-50/50 border-rose-500/40 text-slate-800 ring-2 ring-rose-500/10 shadow-sm shadow-rose-100'
                            : 'bg-rose-500/5 border-rose-500/40 text-white ring-2 ring-rose-500/10' 
                          : isLightMode
                            ? 'bg-white border-slate-200 text-slate-600 hover:border-slate-300 hover:bg-slate-50'
                            : 'bg-slate-950/40 border-white/5 text-slate-400 hover:border-white/10 hover:bg-slate-950/60'
                      }`}
                    >
                      <div className="flex items-start justify-between">
                        <div className={`p-3 rounded-xl border transition-colors ${
                          isLightMode ? 'bg-slate-50 border-slate-200 text-amber-500' : 'bg-slate-900 border-white/10 text-amber-400'
                        }`}>
                          <FileText className="w-6 h-6" />
                        </div>
                        {installSource === 'offline' && (
                          <span className={`p-1 rounded-full border ${isLightMode ? 'bg-rose-100 text-rose-600 border-rose-200' : 'bg-rose-500/20 text-rose-400 border-rose-500/20'}`}>
                            <Check className="w-3.5 h-3.5" />
                          </span>
                        )}
                      </div>
                      <div className="mt-4">
                        <h4 className={`font-bold text-md transition-colors ${isLightMode ? 'text-slate-800' : 'text-white'}`}>{t.sourceOffline}</h4>
                        <p className={`text-xs mt-1 transition-colors ${isLightMode ? 'text-slate-500' : 'text-slate-400'}`}>{t.sourceOfflineDesc}</p>
                      </div>
                    </div>
                  </div>

                  {/* Offline Extra Fields */}
                  {installSource === 'offline' && (
                    <motion.div 
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className={`p-5 rounded-2xl border transition-colors ${isLightMode ? 'bg-slate-50 border-slate-200' : 'bg-slate-950/40 border-white/5'}`}
                    >
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className={`block text-xs font-bold mb-2 uppercase tracking-wider transition-colors ${isLightMode ? 'text-slate-700' : 'text-slate-300'}`}>{t.offlineConfigLabel}</label>
                          <input 
                            type="text"
                            value={offlineConfigPath}
                            onChange={(e) => setOfflineConfigPath(e.target.value)}
                            placeholder={t.offlineConfigPlaceholder}
                            className={`w-full border rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-rose-500/50 transition-all font-mono ${
                              isLightMode 
                                ? 'bg-white border-slate-200 text-slate-800' 
                                : 'bg-slate-950/60 border-white/10 text-white'
                            }`}
                          />
                          <p className={`text-[10px] mt-1 transition-colors ${isLightMode ? 'text-slate-400' : 'text-slate-500'}`}>{t.offlineConfigHelp}</p>
                        </div>

                        <div>
                          <label className={`block text-xs font-bold mb-2 uppercase tracking-wider transition-colors ${isLightMode ? 'text-slate-700' : 'text-slate-300'}`}>{t.offlineElementLabel}</label>
                          <input 
                            type="text"
                            value={offlineElementPath}
                            onChange={(e) => setOfflineElementPath(e.target.value)}
                            placeholder={t.offlineElementPlaceholder}
                            className={`w-full border rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-rose-500/50 transition-all font-mono ${
                              isLightMode 
                                ? 'bg-white border-slate-200 text-slate-800' 
                                : 'bg-slate-950/60 border-white/10 text-white'
                            }`}
                          />
                        </div>

                        <div className="md:col-span-2">
                          <label className={`block text-xs font-bold mb-2 uppercase tracking-wider transition-colors ${isLightMode ? 'text-slate-700' : 'text-slate-300'}`}>{t.offlineSynapseDebLabel}</label>
                          <input 
                            type="text"
                            value={offlineSynapseDebDir}
                            onChange={(e) => setOfflineSynapseDebDir(e.target.value)}
                            placeholder={t.offlineSynapseDebPlaceholder}
                            className={`w-full border rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-rose-500/50 transition-all font-mono ${
                              isLightMode 
                                ? 'bg-white border-slate-200 text-slate-800' 
                                : 'bg-slate-950/60 border-white/10 text-white'
                            }`}
                          />
                        </div>
                      </div>
                    </motion.div>
                  )}
                </div>
              )}

              {/* STEP 2: Server Settings */}
              {currentStep === 2 && (
                <div className="space-y-6">
                  <div>
                    <h3 className={`text-lg font-bold mb-1 flex items-center gap-2 transition-colors duration-300 ${isLightMode ? 'text-slate-800' : 'text-white'}`}>
                      <Server className="w-5 h-5 text-rose-400" />
                      {t.serverTitle}
                    </h3>
                    <p className={`text-sm transition-colors duration-300 ${isLightMode ? 'text-slate-500' : 'text-slate-400'}`}>{t.serverDesc}</p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className={`block text-xs font-bold mb-2 uppercase tracking-wider transition-colors ${isLightMode ? 'text-slate-700' : 'text-slate-300'}`}>{t.hsDomainLabel}</label>
                      <input 
                        type="text"
                        value={hsDomain}
                        onChange={(e) => setHsDomain(e.target.value)}
                        placeholder={t.hsDomainPlaceholder}
                        className={`w-full border rounded-xl px-4 py-3 text-sm focus:outline-none transition-all font-mono ${
                          formErrors.hsDomain 
                            ? isLightMode ? 'border-red-400 bg-red-50/15 text-slate-800 focus:border-red-500' : 'border-red-500/50 focus:border-red-500 text-white'
                            : isLightMode ? 'bg-slate-50 border-slate-200 focus:border-rose-500 text-slate-800 focus:bg-white' : 'bg-slate-950/40 border-white/10 focus:border-rose-500/50 text-white'
                        }`}
                      />
                      {formErrors.hsDomain && <p className="text-xs text-red-500 mt-1">{formErrors.hsDomain}</p>}
                    </div>

                    <div>
                      <label className={`block text-xs font-bold mb-2 uppercase tracking-wider transition-colors ${isLightMode ? 'text-slate-700' : 'text-slate-300'}`}>{t.elementDomainLabel}</label>
                      <input 
                        type="text"
                        value={elementDomain}
                        onChange={(e) => setElementDomain(e.target.value)}
                        placeholder={t.elementDomainPlaceholder}
                        className={`w-full border rounded-xl px-4 py-3 text-sm focus:outline-none transition-all font-mono ${
                          formErrors.elementDomain 
                            ? isLightMode ? 'border-red-400 bg-red-50/15 text-slate-800 focus:border-red-500' : 'border-red-500/50 focus:border-red-500 text-white'
                            : isLightMode ? 'bg-slate-50 border-slate-200 focus:border-rose-500 text-slate-800 focus:bg-white' : 'bg-slate-950/40 border-white/10 focus:border-rose-500/50 text-white'
                        }`}
                      />
                      {formErrors.elementDomain && <p className="text-xs text-red-500 mt-1">{formErrors.elementDomain}</p>}
                    </div>

                    <div>
                      <label className={`block text-xs font-bold mb-2 uppercase tracking-wider transition-colors ${isLightMode ? 'text-slate-700' : 'text-slate-300'}`}>{t.baseDomainLabel}</label>
                      <input 
                        type="text"
                        value={baseDomain}
                        onChange={(e) => setBaseDomain(e.target.value)}
                        placeholder={t.baseDomainPlaceholder}
                        className={`w-full border rounded-xl px-4 py-3 text-sm focus:outline-none transition-all font-mono ${
                          formErrors.baseDomain 
                            ? isLightMode ? 'border-red-400 bg-red-50/15 text-slate-800 focus:border-red-500' : 'border-red-500/50 focus:border-red-500 text-white'
                            : isLightMode ? 'bg-slate-50 border-slate-200 focus:border-rose-500 text-slate-800 focus:bg-white' : 'bg-slate-950/40 border-white/10 focus:border-rose-500/50 text-white'
                        }`}
                      />
                      {formErrors.baseDomain && <p className="text-xs text-red-500 mt-1">{formErrors.baseDomain}</p>}
                    </div>

                    <div>
                      <label className={`block text-xs font-bold mb-2 uppercase tracking-wider transition-colors ${isLightMode ? 'text-slate-700' : 'text-slate-300'}`}>{t.publicIpLabel}</label>
                      <input 
                        type="text"
                        value={publicIp}
                        onChange={(e) => setPublicIp(e.target.value)}
                        placeholder={t.publicIpPlaceholder}
                        className={`w-full border rounded-xl px-4 py-3 text-sm focus:outline-none transition-all font-mono ${
                          formErrors.publicIp 
                            ? isLightMode ? 'border-red-400 bg-red-50/15 text-slate-800 focus:border-red-500' : 'border-red-500/50 focus:border-red-500 text-white'
                            : isLightMode ? 'bg-slate-50 border-slate-200 focus:border-rose-500 text-slate-800 focus:bg-white' : 'bg-slate-950/40 border-white/10 focus:border-rose-500/50 text-white'
                        }`}
                      />
                      {formErrors.publicIp && <p className="text-xs text-red-500 mt-1">{formErrors.publicIp}</p>}
                    </div>

                    <div className="md:col-span-2">
                      <label className={`block text-xs font-bold mb-2 uppercase tracking-wider transition-colors ${isLightMode ? 'text-slate-700' : 'text-slate-300'}`}>{t.leEmailLabel}</label>
                      <input 
                        type="text"
                        value={leEmail}
                        onChange={(e) => setLeEmail(e.target.value)}
                        placeholder={t.leEmailPlaceholder}
                        className={`w-full border rounded-xl px-4 py-3 text-sm focus:outline-none transition-all font-mono ${
                          formErrors.leEmail 
                            ? isLightMode ? 'border-red-400 bg-red-50/15 text-slate-800 focus:border-red-500' : 'border-red-500/50 focus:border-red-500 text-white'
                            : isLightMode ? 'bg-slate-50 border-slate-200 focus:border-rose-500 text-slate-800 focus:bg-white' : 'bg-slate-950/40 border-white/10 focus:border-rose-500/50 text-white'
                        }`}
                      />
                      {formErrors.leEmail && <p className="text-xs text-red-500 mt-1">{formErrors.leEmail}</p>}
                    </div>
                  </div>

                  {/* Database Notice Box */}
                  <div className={`p-4 rounded-2xl border flex gap-3 transition-colors ${
                    isLightMode 
                      ? 'bg-indigo-50/50 border-indigo-100 text-slate-600 shadow-sm' 
                      : 'bg-indigo-500/5 border-indigo-500/10 text-slate-400'
                  }`}>
                    <AlertCircle className={`w-5 h-5 shrink-0 mt-0.5 ${isLightMode ? 'text-indigo-500' : 'text-indigo-400'}`} />
                    <p className="text-xs leading-relaxed">{t.dbNotice}</p>
                  </div>
                </div>
              )}

              {/* STEP 3: SSL Certificate */}
              {currentStep === 3 && (
                <div className="space-y-6">
                  <div>
                    <h3 className={`text-lg font-bold mb-1 flex items-center gap-2 transition-colors duration-300 ${isLightMode ? 'text-slate-800' : 'text-white'}`}>
                      <Globe className="w-5 h-5 text-rose-400" />
                      {t.sslTitle}
                    </h3>
                    <p className={`text-sm transition-colors duration-300 ${isLightMode ? 'text-slate-500' : 'text-slate-400'}`}>{t.sslDesc}</p>
                  </div>

                  <div className="space-y-3">
                    {/* Auto */}
                    <div 
                      onClick={() => setSslMode('auto')}
                      className={`p-4 rounded-2xl border transition-all cursor-pointer flex gap-4 items-center ${
                        sslMode === 'auto' 
                          ? isLightMode
                            ? 'bg-rose-50/50 border-rose-500/40 text-slate-800 shadow-sm shadow-rose-100 ring-2 ring-rose-500/10'
                            : 'bg-rose-500/5 border-rose-500/40 text-white' 
                          : isLightMode
                            ? 'bg-white border-slate-200 text-slate-600 hover:border-slate-300 hover:bg-slate-50'
                            : 'bg-slate-950/40 border-white/5 text-slate-400 hover:border-white/10'
                      }`}
                    >
                      <span className={`w-5 h-5 rounded-full border flex items-center justify-center shrink-0 ${
                        sslMode === 'auto' ? 'border-rose-500 text-rose-500' : 'border-slate-400'
                      }`}>
                        {sslMode === 'auto' && <span className="w-2.5 h-2.5 rounded-full bg-rose-500" />}
                      </span>
                      <div>
                        <h4 className={`font-bold text-sm ${isLightMode ? 'text-slate-800' : 'text-white'}`}>{t.sslAuto}</h4>
                        <p className={`text-xs mt-0.5 ${isLightMode ? 'text-slate-500' : 'text-slate-400'}`}>{t.sslAutoDesc}</p>
                      </div>
                    </div>

                    {/* Self-Signed */}
                    <div 
                      onClick={() => setSslMode('selfsigned')}
                      className={`p-4 rounded-2xl border transition-all cursor-pointer flex gap-4 items-center ${
                        sslMode === 'selfsigned' 
                          ? isLightMode
                            ? 'bg-rose-50/50 border-rose-500/40 text-slate-800 shadow-sm shadow-rose-100 ring-2 ring-rose-500/10'
                            : 'bg-rose-500/5 border-rose-500/40 text-white' 
                          : isLightMode
                            ? 'bg-white border-slate-200 text-slate-600 hover:border-slate-300 hover:bg-slate-50'
                            : 'bg-slate-950/40 border-white/5 text-slate-400 hover:border-white/10'
                      }`}
                    >
                      <span className={`w-5 h-5 rounded-full border flex items-center justify-center shrink-0 ${
                        sslMode === 'selfsigned' ? 'border-rose-500 text-rose-500' : 'border-slate-400'
                      }`}>
                        {sslMode === 'selfsigned' && <span className="w-2.5 h-2.5 rounded-full bg-rose-500" />}
                      </span>
                      <div>
                        <h4 className={`font-bold text-sm ${isLightMode ? 'text-slate-800' : 'text-white'}`}>{t.sslSelfSigned}</h4>
                        <p className={`text-xs mt-0.5 ${isLightMode ? 'text-slate-500' : 'text-slate-400'}`}>{t.sslSelfSignedDesc}</p>
                      </div>
                    </div>

                    {/* Custom */}
                    <div 
                      onClick={() => setSslMode('custom')}
                      className={`p-4 rounded-2xl border transition-all cursor-pointer flex gap-4 items-center ${
                        sslMode === 'custom' 
                          ? isLightMode
                            ? 'bg-rose-50/50 border-rose-500/40 text-slate-800 shadow-sm shadow-rose-100 ring-2 ring-rose-500/10'
                            : 'bg-rose-500/5 border-rose-500/40 text-white' 
                          : isLightMode
                            ? 'bg-white border-slate-200 text-slate-600 hover:border-slate-300 hover:bg-slate-50'
                            : 'bg-slate-950/40 border-white/5 text-slate-400 hover:border-white/10'
                      }`}
                    >
                      <span className={`w-5 h-5 rounded-full border flex items-center justify-center shrink-0 ${
                        sslMode === 'custom' ? 'border-rose-500 text-rose-500' : 'border-slate-400'
                      }`}>
                        {sslMode === 'custom' && <span className="w-2.5 h-2.5 rounded-full bg-rose-500" />}
                      </span>
                      <div>
                        <h4 className={`font-bold text-sm ${isLightMode ? 'text-slate-800' : 'text-white'}`}>{t.sslCustom}</h4>
                        <p className={`text-xs mt-0.5 ${isLightMode ? 'text-slate-500' : 'text-slate-400'}`}>{t.sslCustomDesc}</p>
                      </div>
                    </div>
                  </div>

                  {/* Custom PEM extra fields */}
                  {sslMode === 'custom' && (
                    <motion.div 
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className={`p-5 rounded-2xl border transition-colors ${isLightMode ? 'bg-slate-50 border-slate-200' : 'bg-slate-950/40 border-white/5'}`}
                    >
                      <div className="grid grid-cols-1 gap-4">
                        <div>
                          <label className={`block text-xs font-bold mb-2 uppercase tracking-wider transition-colors ${isLightMode ? 'text-slate-700' : 'text-slate-300'}`}>{t.customCertLabel}</label>
                          <input 
                            type="text"
                            value={customCertPem}
                            onChange={(e) => setCustomCertPem(e.target.value)}
                            placeholder={t.customCertPlaceholder}
                            className={`w-full border rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-rose-500/50 transition-all font-mono ${
                              formErrors.customCertPem 
                                ? 'border-red-500 bg-red-50/15' 
                                : isLightMode ? 'bg-white border-slate-200 text-slate-800' : 'bg-slate-950/60 border-white/10 text-white'
                            }`}
                          />
                          {formErrors.customCertPem && <p className="text-xs text-red-500 mt-1">{formErrors.customCertPem}</p>}
                        </div>

                        <div>
                          <label className={`block text-xs font-bold mb-2 uppercase tracking-wider transition-colors ${isLightMode ? 'text-slate-700' : 'text-slate-300'}`}>{t.customKeyLabel}</label>
                          <input 
                            type="text"
                            value={customKeyPem}
                            onChange={(e) => setCustomKeyPem(e.target.value)}
                            placeholder={t.customKeyPlaceholder}
                            className={`w-full border rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-rose-500/50 transition-all font-mono ${
                              formErrors.customKeyPem 
                                ? 'border-red-500 bg-red-50/15' 
                                : isLightMode ? 'bg-white border-slate-200 text-slate-800' : 'bg-slate-950/60 border-white/10 text-white'
                            }`}
                          />
                          {formErrors.customKeyPem && <p className="text-xs text-red-500 mt-1">{formErrors.customKeyPem}</p>}
                        </div>

                        <div>
                          <label className={`block text-xs font-bold mb-2 uppercase tracking-wider transition-colors ${isLightMode ? 'text-slate-700' : 'text-slate-300'}`}>{t.customChainLabel}</label>
                          <input 
                            type="text"
                            value={customChainPem}
                            onChange={(e) => setCustomChainPem(e.target.value)}
                            placeholder={t.customChainPlaceholder}
                            className={`w-full border rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-rose-500/50 transition-all font-mono ${
                              isLightMode ? 'bg-white border-slate-200 text-slate-800' : 'bg-slate-950/60 border-white/10 text-white'
                            }`}
                          />
                        </div>
                      </div>
                    </motion.div>
                  )}
                </div>
              )}

              {/* STEP 4: Element Web */}
              {currentStep === 4 && (
                <div className="space-y-6">
                  <div>
                    <h3 className={`text-lg font-bold mb-1 flex items-center gap-2 transition-colors duration-300 ${isLightMode ? 'text-slate-800' : 'text-white'}`}>
                      <Settings className="w-5 h-5 text-rose-400" />
                      {t.elementTitle}
                    </h3>
                    <p className={`text-sm transition-colors duration-300 ${isLightMode ? 'text-slate-500' : 'text-slate-400'}`}>{t.elementDesc}</p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Online GitHub */}
                    <div 
                      onClick={() => setElementInstallMode('online')}
                      className={`p-5 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between h-40 ${
                        elementInstallMode === 'online' 
                          ? isLightMode
                            ? 'bg-rose-50/50 border-rose-500/40 text-slate-800 shadow-sm shadow-rose-100 ring-2 ring-rose-500/10'
                            : 'bg-rose-500/5 border-rose-500/40 text-white ring-2 ring-rose-500/10' 
                          : isLightMode
                            ? 'bg-white border-slate-200 text-slate-600 hover:border-slate-300 hover:bg-slate-50'
                            : 'bg-slate-950/40 border-white/5 text-slate-400 hover:border-white/10'
                      }`}
                    >
                      <div className="flex items-start justify-between">
                        <div className={`p-3 rounded-xl border transition-colors ${
                          isLightMode ? 'bg-slate-50 border-slate-200 text-rose-500' : 'bg-slate-900 border-white/10 text-rose-400'
                        }`}>
                          <CloudDownload className="w-5 h-5" />
                        </div>
                        {elementInstallMode === 'online' && (
                          <span className={`p-1 rounded-full border ${isLightMode ? 'bg-rose-100 text-rose-600 border-rose-200' : 'bg-rose-500/20 text-rose-400 border-rose-500/20'}`}>
                            <Check className="w-3.5 h-3.5" />
                          </span>
                        )}
                      </div>
                      <div>
                        <h4 className={`font-bold text-sm ${isLightMode ? 'text-slate-800' : 'text-white'}`}>{t.elementOnline}</h4>
                        <p className={`text-xs mt-1 ${isLightMode ? 'text-slate-500' : 'text-slate-400'}`}>{t.elementOnlineDesc}</p>
                      </div>
                    </div>

                    {/* Offline Tarball */}
                    <div 
                      onClick={() => setElementInstallMode('offline')}
                      className={`p-5 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between h-40 ${
                        elementInstallMode === 'offline' 
                          ? isLightMode
                            ? 'bg-rose-50/50 border-rose-500/40 text-slate-800 shadow-sm shadow-rose-100 ring-2 ring-rose-500/10'
                            : 'bg-rose-500/5 border-rose-500/40 text-white ring-2 ring-rose-500/10' 
                          : isLightMode
                            ? 'bg-white border-slate-200 text-slate-600 hover:border-slate-300 hover:bg-slate-50'
                            : 'bg-slate-950/40 border-white/5 text-slate-400 hover:border-white/10'
                      }`}
                    >
                      <div className="flex items-start justify-between">
                        <div className={`p-3 rounded-xl border transition-colors ${
                          isLightMode ? 'bg-slate-50 border-slate-200 text-amber-500' : 'bg-slate-900 border-white/10 text-amber-400'
                        }`}>
                          <FileText className="w-5 h-5" />
                        </div>
                        {elementInstallMode === 'offline' && (
                          <span className={`p-1 rounded-full border ${isLightMode ? 'bg-rose-100 text-rose-600 border-rose-200' : 'bg-rose-500/20 text-rose-400 border-rose-500/20'}`}>
                            <Check className="w-3.5 h-3.5" />
                          </span>
                        )}
                      </div>
                      <div>
                        <h4 className={`font-bold text-sm ${isLightMode ? 'text-slate-800' : 'text-white'}`}>{t.elementOffline}</h4>
                        <p className={`text-xs mt-1 ${isLightMode ? 'text-slate-500' : 'text-slate-400'}`}>{t.elementOfflineDesc}</p>
                      </div>
                    </div>
                  </div>

                  {/* Online custom version input */}
                  {elementInstallMode === 'online' && (
                    <motion.div 
                      initial={{ opacity: 0, y: -5 }}
                      animate={{ opacity: 1, y: 0 }}
                      className={`p-5 rounded-2xl border transition-colors ${isLightMode ? 'bg-slate-50 border-slate-200' : 'bg-slate-950/40 border-white/5'}`}
                    >
                      <div>
                        <label className={`block text-xs font-bold mb-2 uppercase tracking-wider transition-colors ${isLightMode ? 'text-slate-700' : 'text-slate-300'}`}>{t.elementVersionLabel}</label>
                        <input 
                          type="text"
                          value={elementOnlineVersion}
                          onChange={(e) => setElementOnlineVersion(e.target.value)}
                          placeholder={t.elementVersionPlaceholder}
                          className={`w-full border rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-rose-500/50 transition-all font-mono ${
                            isLightMode ? 'bg-white border-slate-200 text-slate-800' : 'bg-slate-950/60 border-white/10 text-white'
                          }`}
                        />
                      </div>
                    </motion.div>
                  )}

                  {/* Offline elements paths */}
                  {elementInstallMode === 'offline' && (
                    <motion.div 
                      initial={{ opacity: 0, y: -5 }}
                      animate={{ opacity: 1, y: 0 }}
                      className={`p-5 rounded-2xl border transition-colors ${isLightMode ? 'bg-slate-50 border-slate-200' : 'bg-slate-950/40 border-white/5'}`}
                    >
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="md:col-span-2">
                          <label className={`block text-xs font-bold mb-2 uppercase tracking-wider transition-colors ${isLightMode ? 'text-slate-700' : 'text-slate-300'}`}>{t.elementOfflinePathLabel}</label>
                          <input 
                            type="text"
                            value={elementOfflinePath}
                            onChange={(e) => setElementOfflinePath(e.target.value)}
                            placeholder={t.elementOfflinePathPlaceholder}
                            className={`w-full border rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-rose-500/50 transition-all font-mono ${
                              formErrors.elementOfflinePath 
                                ? 'border-red-500 bg-red-50/15' 
                                : isLightMode ? 'bg-white border-slate-200 text-slate-800' : 'bg-slate-950/60 border-white/10 text-white'
                            }`}
                          />
                          {formErrors.elementOfflinePath && <p className="text-xs text-red-500 mt-1">{formErrors.elementOfflinePath}</p>}
                        </div>

                        <div className="md:col-span-2">
                          <label className={`block text-xs font-bold mb-2 uppercase tracking-wider transition-colors ${isLightMode ? 'text-slate-700' : 'text-slate-300'}`}>{t.elementOfflineLabelLabel}</label>
                          <input 
                            type="text"
                            value={elementOfflineVersionLabel}
                            onChange={(e) => setElementOfflineVersionLabel(e.target.value)}
                            placeholder={t.elementOfflineLabelPlaceholder}
                            className={`w-full border rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-rose-500/50 transition-all font-mono ${
                              isLightMode ? 'bg-white border-slate-200 text-slate-800' : 'bg-slate-950/60 border-white/10 text-white'
                            }`}
                          />
                        </div>
                      </div>
                    </motion.div>
                  )}
                </div>
              )}

              {/* STEP 5: LDAP Configuration */}
              {currentStep === 5 && (
                <div className="space-y-6">
                  <div>
                    <h3 className={`text-lg font-bold mb-1 flex items-center gap-2 transition-colors duration-300 ${isLightMode ? 'text-slate-800' : 'text-white'}`}>
                      <Key className="w-5 h-5 text-rose-400" />
                      {t.ldapTitle}
                    </h3>
                    <p className={`text-sm transition-colors duration-300 ${isLightMode ? 'text-slate-500' : 'text-slate-400'}`}>{t.ldapDesc}</p>
                  </div>

                  <div 
                    onClick={() => setLdapConfigureNow(prev => !prev)}
                    className={`p-6 rounded-2xl border transition-all cursor-pointer flex gap-4 items-start ${
                      ldapConfigureNow 
                        ? isLightMode
                          ? 'bg-rose-50/50 border-rose-500/40 text-slate-800 ring-2 ring-rose-500/10 shadow-sm shadow-rose-100'
                          : 'bg-rose-500/5 border-rose-500/40 text-white ring-2 ring-rose-500/10'
                        : isLightMode
                          ? 'bg-white border-slate-200 text-slate-600 hover:border-slate-300 hover:bg-slate-50'
                          : 'bg-slate-950/40 border-white/5 text-slate-400 hover:border-white/10 hover:bg-slate-950/60'
                    }`}
                  >
                    <div className="pt-0.5">
                      <span className={`w-5.5 h-5.5 rounded border flex items-center justify-center shrink-0 transition-all ${
                        ldapConfigureNow 
                          ? 'bg-rose-500 border-rose-500 text-white' 
                          : isLightMode ? 'border-slate-300 bg-white' : 'border-slate-600 bg-transparent'
                      }`}>
                        {ldapConfigureNow && <Check className="w-4 h-4 stroke-[3px]" />}
                      </span>
                    </div>
                    <div>
                      <h4 className={`font-bold text-md ${isLightMode ? 'text-slate-800' : 'text-white'}`}>{t.ldapCheckbox}</h4>
                      <p className={`text-xs mt-1.5 leading-relaxed ${isLightMode ? 'text-slate-500' : 'text-slate-400'}`}>{t.ldapNotice}</p>
                    </div>
                  </div>
                </div>
              )}

              {/* STEP 6: Summary & Confirm */}
              {currentStep === 6 && (
                <div className="space-y-6">
                  <div>
                    <h3 className={`text-lg font-bold mb-1 flex items-center gap-2 transition-colors duration-300 ${isLightMode ? 'text-slate-800' : 'text-white'}`}>
                      <CheckCircle className="w-5 h-5 text-emerald-500" />
                      {t.summaryTitle}
                    </h3>
                    <p className={`text-sm transition-colors duration-300 ${isLightMode ? 'text-slate-500' : 'text-slate-400'}`}>{t.summaryDesc}</p>
                  </div>

                  {/* Summary Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Source Info */}
                    <div className={`p-4 rounded-2xl border transition-colors ${isLightMode ? 'bg-slate-50 border-slate-200' : 'bg-slate-950/40 border-white/5'}`}>
                      <span className={`text-[10px] uppercase font-bold tracking-wider block mb-2 ${isLightMode ? 'text-slate-400' : 'text-slate-500'}`}>{t.source}</span>
                      <div className={`flex items-center gap-2 text-sm ${isLightMode ? 'text-slate-800' : 'text-slate-200'}`}>
                        <span className={`w-2 h-2 rounded-full ${installSource === 'online' ? 'bg-rose-500' : 'bg-amber-500'}`} />
                        <span className="font-semibold">{installSource === 'online' ? t.online : t.offline}</span>
                      </div>
                      {installSource === 'offline' && (
                        <div className={`mt-2 text-xs font-mono space-y-1 ${isLightMode ? 'text-slate-500' : 'text-slate-400'}`}>
                          {offlineConfigPath && <div>Config: {offlineConfigPath}</div>}
                          {offlineElementPath && <div>Element: {offlineElementPath}</div>}
                          {offlineSynapseDebDir && <div>Synapse deb: {offlineSynapseDebDir}</div>}
                        </div>
                      )}
                    </div>

                    {/* SSL Info */}
                    <div className={`p-4 rounded-2xl border transition-colors ${isLightMode ? 'bg-slate-50 border-slate-200' : 'bg-slate-950/40 border-white/5'}`}>
                      <span className={`text-[10px] uppercase font-bold tracking-wider block mb-2 ${isLightMode ? 'text-slate-400' : 'text-slate-500'}`}>{t.ssl}</span>
                      <div className={`flex items-center gap-2 text-sm ${isLightMode ? 'text-slate-800' : 'text-slate-200'}`}>
                        <span className="font-semibold text-rose-500 uppercase">{sslMode}</span>
                      </div>
                      {sslMode === 'custom' && (
                        <div className={`mt-2 text-xs font-mono space-y-1 ${isLightMode ? 'text-slate-500' : 'text-slate-400'}`}>
                          <div className="truncate">Cert: {customCertPem}</div>
                          <div className="truncate">Key: {customKeyPem}</div>
                        </div>
                      )}
                    </div>

                    {/* Domain Matrix Details */}
                    <div className={`p-4 rounded-2xl border transition-colors md:col-span-2 space-y-2 ${isLightMode ? 'bg-slate-50 border-slate-200' : 'bg-slate-950/40 border-white/5'}`}>
                      <span className={`text-[10px] uppercase font-bold tracking-wider block mb-1 ${isLightMode ? 'text-slate-400' : 'text-slate-500'}`}>{t.domains}</span>
                      <div className={`grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-2 text-xs font-mono ${isLightMode ? 'text-slate-600' : 'text-slate-300'}`}>
                        <div className={`flex justify-between border-b pb-1 ${isLightMode ? 'border-slate-100' : 'border-white/5'}`}>
                          <span className={isLightMode ? 'text-slate-400' : 'text-slate-500'}>Homeserver:</span>
                          <span className={`${isLightMode ? 'text-indigo-600' : 'text-indigo-400'} font-bold`}>https://{hsDomain}</span>
                        </div>
                        <div className={`flex justify-between border-b pb-1 ${isLightMode ? 'border-slate-100' : 'border-white/5'}`}>
                          <span className={isLightMode ? 'text-slate-400' : 'text-slate-500'}>Element:</span>
                          <span className={`${isLightMode ? 'text-purple-600' : 'text-purple-400'} font-bold`}>https://{elementDomain}</span>
                        </div>
                        <div className={`flex justify-between border-b pb-1 ${isLightMode ? 'border-slate-100' : 'border-white/5'}`}>
                          <span className={isLightMode ? 'text-slate-400' : 'text-slate-500'}>Base Domain:</span>
                          <span className={isLightMode ? 'text-slate-700' : 'text-slate-400'}>{baseDomain}</span>
                        </div>
                        <div className={`flex justify-between border-b pb-1 ${isLightMode ? 'border-slate-100' : 'border-white/5'}`}>
                          <span className={isLightMode ? 'text-slate-400' : 'text-slate-500'}>Public IP:</span>
                          <span className={`${isLightMode ? 'text-emerald-600' : 'text-emerald-400'} font-bold`}>{publicIp}</span>
                        </div>
                        <div className={`flex justify-between sm:col-span-2 border-b pb-1 ${isLightMode ? 'border-slate-100' : 'border-white/5'}`}>
                          <span className={isLightMode ? 'text-slate-400' : 'text-slate-500'}>Email:</span>
                          <span className={isLightMode ? 'text-slate-700' : 'text-slate-400'}>{leEmail}</span>
                        </div>
                      </div>
                    </div>

                    {/* Element App Deployment Info */}
                    <div className={`p-4 rounded-2xl border transition-colors ${isLightMode ? 'bg-slate-50 border-slate-200' : 'bg-slate-950/40 border-white/5'}`}>
                      <span className={`text-[10px] uppercase font-bold tracking-wider block mb-2 ${isLightMode ? 'text-slate-400' : 'text-slate-500'}`}>{t.element}</span>
                      <div className={`text-xs font-mono ${isLightMode ? 'text-slate-600' : 'text-slate-300'}`}>
                        <div className="flex justify-between">
                          <span className={isLightMode ? 'text-slate-400' : 'text-slate-500'}>Source:</span>
                          <span className={`font-semibold capitalize ${isLightMode ? 'text-slate-800' : 'text-slate-200'}`}>{elementInstallMode}</span>
                        </div>
                        {elementInstallMode === 'online' && elementOnlineVersion && (
                          <div className="flex justify-between mt-1">
                            <span className={isLightMode ? 'text-slate-400' : 'text-slate-500'}>Version:</span>
                            <span className="text-rose-500">{elementOnlineVersion}</span>
                          </div>
                        )}
                        {elementInstallMode === 'offline' && (
                          <div className={`mt-1 text-[11px] truncate ${isLightMode ? 'text-slate-400' : 'text-slate-500'}`}>
                            Path: {elementOfflinePath}
                          </div>
                        )}
                      </div>
                    </div>

                    {/* LDAP Info */}
                    <div className={`p-4 rounded-2xl border transition-colors ${isLightMode ? 'bg-slate-50 border-slate-200' : 'bg-slate-950/40 border-white/5'}`}>
                      <span className={`text-[10px] uppercase font-bold tracking-wider block mb-2 ${isLightMode ? 'text-slate-400' : 'text-slate-500'}`}>{t.ldap}</span>
                      <div className={`flex items-center gap-2 text-sm ${isLightMode ? 'text-slate-800' : 'text-slate-200'}`}>
                        <span className={`w-2 h-2 rounded-full ${ldapConfigureNow ? 'bg-emerald-500 animate-pulse' : 'bg-slate-400'}`} />
                        <span className="font-semibold">{ldapConfigureNow ? t.yes : t.no}</span>
                      </div>
                    </div>
                  </div>

                  {/* Ready Message */}
                  <div className={`p-4 rounded-2xl border flex gap-3 transition-colors ${
                    isLightMode 
                      ? 'bg-emerald-50/50 border-emerald-100 text-slate-600 shadow-sm' 
                      : 'bg-emerald-500/5 border-emerald-500/10 text-slate-400'
                  }`}>
                    <CheckCircle className={`w-5 h-5 shrink-0 mt-0.5 ${isLightMode ? 'text-emerald-500' : 'text-emerald-400'}`} />
                    <div>
                      <h4 className={`text-xs font-bold uppercase tracking-wider ${isLightMode ? 'text-slate-800' : 'text-white'}`}>{t.confirmReady}</h4>
                      <p className={`text-xs mt-1 leading-relaxed ${isLightMode ? 'text-slate-500' : 'text-slate-400'}`}>{t.confirmReadyDesc}</p>
                    </div>
                  </div>
                </div>
              )}
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Footer controls */}
        <div className={`p-6 border-t flex items-center justify-between gap-4 transition-colors duration-300 ${
          isLightMode ? 'border-slate-100 bg-slate-50' : 'border-white/5 bg-slate-950/40'
        }`}>
          <button 
            onClick={currentStep === 1 ? onClose : handleBack}
            className={`px-5 py-2.5 rounded-xl border text-sm font-semibold transition-all cursor-pointer flex items-center gap-2 ${
              isLightMode 
                ? 'border-slate-200 hover:bg-slate-100 text-slate-600 hover:text-slate-800' 
                : 'border-white/10 hover:bg-white/5 text-slate-300 hover:text-white'
            }`}
          >
            {currentStep > 1 && <ChevronLeft className={`w-4 h-4 ${isRtl ? 'rotate-180' : ''}`} />}
            {currentStep === 1 ? t.cancel : t.back}
          </button>

          {currentStep < 6 ? (
            <button 
              onClick={handleNext}
              className={`px-6 py-2.5 rounded-xl text-sm font-semibold transition-all cursor-pointer flex items-center gap-2 shadow-lg ${
                isLightMode 
                  ? 'bg-slate-900 hover:bg-slate-800 text-white shadow-slate-200/50' 
                  : 'bg-white/5 hover:bg-white/10 border border-white/10 text-white'
              }`}
            >
              {t.next}
              <ChevronRight className={`w-4 h-4 ${isRtl ? 'rotate-180' : ''}`} />
            </button>
          ) : (
            <button 
              onClick={handleFinalConfirm}
              className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-rose-600 to-amber-600 hover:from-rose-500 hover:to-amber-500 text-white text-sm font-bold transition-all cursor-pointer flex items-center gap-2 shadow-lg shadow-rose-950/30 ring-2 ring-rose-500/10 hover:scale-[1.02]"
            >
              {t.confirmInstall}
              <ArrowRight className={`w-4 h-4 ${isRtl ? 'rotate-180' : ''}`} />
            </button>
          )}
        </div>
      </motion.div>
    </div>
  );
}
