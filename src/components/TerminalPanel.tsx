/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useRef, useState } from 'react';
import { 
  Terminal, Play, ShieldAlert, Circle, RefreshCw, Trash2, ArrowUpRight, 
  Download, Upload, Eye, FileText, Database, UserCheck, ShieldCheck, Globe, Key, 
  Folder, Copy, Check, Info, Lock, Tag, X, Server
} from 'lucide-react';
import { MatrixConfig } from '../types';
import { PANEL_VERSION, PANEL_BUILD_DATE, VERSION_HISTORY } from '../version';

interface TerminalPanelProps {
  logs: string[];
  isExecuting: boolean;
  onExecuteCommand: (command: string) => void;
  userRole: string;
  authToken: string | null;
  lang: 'en' | 'fa' | 'es' | 'ar' | 'de' | 'ru';
  isLightMode?: boolean;
  showToast: (type: 'success' | 'error', text: string) => void;
  initialTab?: 'console' | 'install' | 'updates' | 'element-synapse';
  onTabChange?: (tab: 'console' | 'install' | 'updates' | 'element-synapse') => void;
  config?: MatrixConfig;
  activeConnection?: any;
}

const terminalTranslations: Record<string, any> = {
  en: {
    quickTasks: 'Quick Tasks',
    quickTasksSub: 'Execute high-privilege shell routines on the virtual Matrix node. Changes reflect in real-time.',
    standardInstall: 'Standard Install Stack',
    standardInstallSub: 'Nginx, Synapse, Element, TURN, Postgres',
    enableWorkers: 'Enable Redis Workers',
    enableWorkersSub: 'Deploy 2 generic workers and a proxy',
    disableE2ee: 'Disable E2EE Org-Wide',
    disableE2eeSub: '4-layer enforcement to lock room encryption',
    triggerBackup: 'Trigger Full Backup',
    triggerBackupSub: 'Database, Keys, Elements Web archive',
    updatePanel: 'Update Matrix Panel',
    updatePanelSub: 'Check status and pull latest commits from git',
    activeSsh: 'Active SSH Terminal',
    activeSshSub: 'Interact with live service CLI terminal',
    checkLogs: 'Show Configuration & Log',
    checkLogsSub: 'View database credentials, post-install guidance & /var/log/matrix_stack_install.log',
    accessRestricted: 'Access Restricted',
    accessRestrictedDesc: (role: string) => `Your role is ${role}. Some commands require Super Admin or Owner privileges.`,
    consoleModeActive: 'Console Mode Active',
    consoleModeActiveDesc: 'You have full Write/Execute capability. Take precautions when configuring the Homeserver.',
    unauthorizedViewer: 'Unauthorized: Viewer role cannot input console commands',
    inputPlaceholder: 'Type custom action (install, backup, workers) and press Enter...',
    checking: 'Checking...',
    currentInstalled: 'Currently Installed Version:',
    updateControl: 'Panel Update Control Center',
    checkUpdates: 'Check Updates',
    installUpdate: 'Install Update',
    newUpdateAvailable: 'New Update Available!',
    updateAvailableDesc: (commits: number) => `You are currently ${commits} commits behind the main branch. Please update to get the latest features.`,
    latestChanges: 'Latest available update description:',
    systemUpToDate: 'System Up to Date',
    systemUpToDateDesc: 'Your Matrix Admin panel is running the latest code from the remote repository.',
    readyMsg: '# Update Manager ready.',
    clickToQuery: '# Click "Check for Updates" to query the repository status.',

    // Post-Install & Config Info
    installInfoTitle: 'Installation & System Configuration Summary (Option 8 -> Option 2)',
    postInstallGuideTitle: 'Mandatory Post-Installation Guidance (Database & Admin Setup)',
    postInstallGuideSub: 'To enable complete panel capabilities (reading user lists, room statistics, and executing Matrix APIs), complete these two essential steps:',
    stepDbTitle: '1. Configure PostgreSQL Credentials in Server Connection Settings',
    stepDbDesc: "Copy the password from the 'PostgreSQL Database Connection Info' card below. Then navigate to 'Server Connections' in the side menu, edit your active server profile, and fill in the database credentials (Host: 127.0.0.1, Port: 5432, DB: synapse, User: synapse_user, and Password). This allows the panel to query users and rooms directly from PostgreSQL.",
    stepAdminTitle: '2. Register Synapse Admin User & Save Admin Token in Panel',
    stepAdminDesc: "Go to 'User Management' (or Matrix Admin) in the panel menu and use 'Register New User' to create an account with Synapse Admin privileges enabled. Next, return to 'Server Connections', edit your active server profile, expand 'Show Admin Token Settings', and save this admin account's credentials or access token to enable all Matrix API operations.",
    dbDetailsTitle: 'PostgreSQL Database Connection Info',
    dbHost: 'Database Host:',
    dbPort: 'Database Port:',
    dbName: 'Database Name:',
    dbUser: 'Database User:',
    dbPass: 'Database Password:',
    pathsTitle: 'Important System File & Config Paths',
    copySuccess: 'Copied to clipboard!',
    showPass: 'Show password',
    hidePass: 'Hide password'
  },
  fa: {
    quickTasks: 'عملیات سریع سیستمی',
    quickTasksSub: 'رابط اجرای اسکریپت‌های سیستمی با سطح دسترسی روت روی سرور مجازی ماتریکس.',
    standardInstall: 'نصب مخزن استاندارد ماتریکس',
    standardInstallSub: 'نصب و کانفیگ خودکار Nginx, Synapse, Element, TURN, Postgres',
    enableWorkers: 'فعال‌سازی ورکر‌های Redis',
    enableWorkersSub: 'راه‌اندازی ۲ ورکر عمومی و پروکسی ماتریکس جهت افزایش پایداری و بازدهی',
    disableE2ee: 'غیرفعال‌سازی سرتاسری رمزنگاری E2EE',
    disableE2eeSub: 'اعمال قفل غیرفعال‌سازی اجباری رمزگذاری پیام‌ها در تمامی اتاق‌ها',
    triggerBackup: 'تهیه نسخه پشتیبان کامل',
    triggerBackupSub: 'بک‌آپ کامل از دیتابیس، کلیدهای رمزنگاری و فایل‌های المنت',
    updatePanel: 'بروزرسانی پنل ماتریکس',
    updatePanelSub: 'بررسی وضعیت و دریافت جدیدترین کامیت‌ها از مخزن گیت‌هاب',
    activeSsh: 'ترمینال تعاملی SSH روت',
    activeSshSub: 'تعامل زنده با خط فرمان سرور مجازی ماتریکس',
    checkLogs: 'نمایش پیکربندی و راهنما',
    checkLogsSub: 'مشاهده اطلاعات دیتابیس، راهنمای راه‌اندازی و لوگ‌های نصب /var/log/matrix_stack_install.log',
    accessRestricted: 'محدودیت دسترسی امنیتی',
    accessRestrictedDesc: (role: string) => `نقش شما ${role} است. برخی دستورات نیاز به دسترسی Super Admin یا مالک دارند.`,
    consoleModeActive: 'حالت کنسول فعال است',
    consoleModeActiveDesc: 'شما دسترسی کامل برای اجرا و تغییرات دارید. در هنگام ویرایش پیکربندی‌ها مراقب باشید.',
    unauthorizedViewer: 'عدم دسترسی: نقش ناظر امکان وارد کردن دستورات خط فرمان را ندارد',
    inputPlaceholder: 'دستور مورد نظر را تایپ کنید (install, backup, workers)...',
    checking: 'در حال بررسی...',
    currentInstalled: 'نسخه فعلی نصب شده:',
    updateControl: 'مرکز کنترل بروزرسانی پنل',
    checkUpdates: 'بررسی بروزرسانی',
    installUpdate: 'نصب بروزرسانی',
    newUpdateAvailable: 'بروزرسانی جدید در دسترس است!',
    updateAvailableDesc: (commits: number) => `نسخه شما به تعداد ${commits} کامیت از نسخه اصلی گیت عقب‌تر است. جهت بروزرسانی دکمه نصب را بزنید.`,
    latestChanges: 'توضیحات آخرین تغییرات در این بروزرسانی:',
    systemUpToDate: 'سیستم کاملاً بروز است',
    systemUpToDateDesc: 'پنل مدیریت ماتریکس شما در حال حاضر از آخرین کد‌های مخزن اصلی استفاده می‌کند.',
    readyMsg: '# مدیر بروزرسانی آماده است.',
    clickToQuery: '# جهت دریافت آخرین وضعیت سرور روی "بررسی بروزرسانی" کلیک کنید.',

    // Post-Install & Config Info
    installInfoTitle: 'اطلاعات کامل نصب و پیکربندی سیستم (از طریق مودال نصب ماتریکس)',
    postInstallGuideTitle: 'راهنمای اقدام‌های ضروری پس از اتمام نصب (اتصال دیتابیس و ساخت ادمین)',
    postInstallGuideSub: 'جهت کارکرد صحیح تمام بخش‌های پنل (مانند لیست کاربران، اتاق‌ها و ای‌پی‌آی‌های ماتریکس)، حتماً دو مرحله زیر را انجام دهید:',
    stepDbTitle: '۱. ثبت مشخصات دیتابیس در بخش «ارتباط با سرور» (Server Connections)',
    stepDbDesc: 'رمز عبور دیتابیس را از کارت «مشخصات اتصال به دیتابیس PostgreSQL» در همین صفحه کپی کنید. سپس به صفحه «ارتباط با سرور» در منوی کناری رفته، این سرور را ویرایش کنید و اطلاعات اتصال PostgreSQL (میزبان: 127.0.0.1 / آی‌پی سرور، پورت: 5432، نام دیتابیس: synapse، نام کاربری: synapse_user و رمز عبور کپی‌شده) را وارد و ذخیره کنید تا پنل بتواند لیست کاربران و اتاق‌ها را مستقیم از PostgreSQL بخواند.',
    stepAdminTitle: '۲. ساخت کاربر ادمین و ثبت توکن دسترسی در «ارتباط با سرور»',
    stepAdminDesc: 'به بخش «مدیریت کاربران» (User Management) در منوی پنل مراجعه کرده و در بخش «ایجاد کاربر جدید» (Register New User) یک کاربر با دسترسی مدیرکل Synapse بسازید. سپس به بخش «ارتباط با سرور» بازگشته، سرور فعال را ویرایش کرده، بخش «Show Admin Token Settings» را باز کنید و مشخصات یا توکن دسترسی همین کاربر ادمین را وارد نمایید تا امکان اجرای APIهای ماتریکس فراهم شود.',
    dbDetailsTitle: 'مشخصات اتصال به دیتابیس PostgreSQL',
    dbHost: 'میزبان دیتابیس:',
    dbPort: 'پورت دیتابیس:',
    dbName: 'نام دیتابیس:',
    dbUser: 'نام کاربری دیتابیس:',
    dbPass: 'رمز عبور دیتابیس:',
    pathsTitle: 'مسیرهای مهم فایل‌ها و پیکربندی‌های سیستم',
    copySuccess: 'در حافظه کپی شد!',
    showPass: 'نمایش رمز عبور',
    hidePass: 'مخفی کردن رمز عبور'
  },
  es: {
    quickTasks: 'Tareas Rápidas',
    quickTasksSub: 'Ejecute rutinas de shell de alto privilegio en el nodo Matrix virtual. Los cambios se reflejan en tiempo real.',
    standardInstall: 'Pila de Instalación Estándar',
    standardInstallSub: 'Nginx, Synapse, Element, TURN, Postgres',
    enableWorkers: 'Habilitar Workers de Redis',
    enableWorkersSub: 'Implementar 2 workers genéricos y un proxy',
    disableE2ee: 'Deshabilitar E2EE en toda la Org',
    disableE2eeSub: 'Aplicación de 4 capas para bloquear el cifrado de salas',
    triggerBackup: 'Ejecutar Respaldo Completo',
    triggerBackupSub: 'Base de datos, Claves, archivo Web de Element',
    updatePanel: 'Actualizar Panel Matrix',
    updatePanelSub: 'Comprobar estado y descargar últimos commits de git',
    activeSsh: 'Terminal SSH Activa',
    activeSshSub: 'Interactuar con la CLI del servicio en vivo',
    checkLogs: 'Mostrar Configuración y Registro',
    checkLogsSub: 'Ver credenciales de BD, guía posterior y /var/log/matrix_stack_install.log',
    accessRestricted: 'Acceso Restringido',
    accessRestrictedDesc: (role: string) => `Su rol es ${role}. Algunos comandos requieren privilegios de Super Admin o Propietario.`,
    consoleModeActive: 'Modo Consola Activo',
    consoleModeActiveDesc: 'Tiene capacidad completa de Escritura/Ejecución. Tome precauciones al configurar el Homeserver.',
    unauthorizedViewer: 'No autorizado: El rol de Visor no puede introducir comandos de consola',
    inputPlaceholder: 'Escriba una acción personalizada (install, backup, workers) y presione Enter...',
    checking: 'Comprobando...',
    currentInstalled: 'Versión Instalada Actualmente:',
    updateControl: 'Centro de Control de Actualizaciones',
    checkUpdates: 'Buscar Actualizaciones',
    installUpdate: 'Instalar Actualización',
    newUpdateAvailable: '¡Nueva Actualización Disponible!',
    updateAvailableDesc: (commits: number) => `Actualmente está ${commits} commits por detrás de la rama principal. Por favor, actualice.`,
    latestChanges: 'Última descripción de actualización disponible:',
    systemUpToDate: 'Sistema Actualizado',
    systemUpToDateDesc: 'Su panel de administración de Matrix está ejecutando el código más reciente del repositorio remoto.',
    readyMsg: '# Administrador de actualizaciones listo.',
    clickToQuery: '# Haga clic en "Buscar actualizaciones" para consultar el estado del repositorio.',

    // Post-Install & Config Info
    installInfoTitle: 'Resumen de Instalación y Configuración del Sistema (Opción 8 -> Opción 2)',
    postInstallGuideTitle: 'Guía Obligatoria Posterior a la Instalación (Base de Datos y Administrador)',
    postInstallGuideSub: 'Para habilitar todas las funciones del panel (consultar lista de usuarios, estadísticas de salas y ejecutar API de Matrix), complete estos dos pasos fundamentales:',
    stepDbTitle: '1. Configurar credenciales de PostgreSQL en Conexiones del Servidor',
    stepDbDesc: "Copie la contraseña de la tarjeta 'Información de Conexión a la Base de Datos PostgreSQL' a continuación. Luego vaya a 'Conexiones del Servidor' en el menú lateral, edite su perfil de servidor activo e ingrese las credenciales de la base de datos (Host: 127.0.0.1, Puerto: 5432, BD: synapse, Usuario: synapse_user y Contraseña). Esto permite que el panel consulte usuarios y salas directamente desde PostgreSQL.",
    stepAdminTitle: '2. Registrar usuario administrador de Synapse y guardar el token',
    stepAdminDesc: "Vaya a 'Gestión de Usuarios' (o Matrix Admin) en el menú del panel y use 'Registrar Nuevo Usuario' para crear una cuenta con privilegios de Administrador de Synapse. Luego, regrese a 'Conexiones del Servidor', edite su perfil activo, despliegue 'Mostrar Configuración de Token de Admin' y guarde las credenciales o el token de acceso de este usuario.",
    dbDetailsTitle: 'Información de Conexión a la Base de Datos PostgreSQL',
    dbHost: 'Host de Base de Datos:',
    dbPort: 'Puerto de Base de Datos:',
    dbName: 'Nombre de Base de Datos:',
    dbUser: 'Usuario de Base de Datos:',
    dbPass: 'Contraseña de Base de Datos:',
    pathsTitle: 'Rutas Importantes de Archivos y Configuración del Sistema',
    copySuccess: '¡Copiado al portapapeles!',
    showPass: 'Mostrar contraseña',
    hidePass: 'Ocultar contraseña'
  },
  ar: {
    quickTasks: 'المهام السريعة',
    quickTasksSub: 'تنفيذ أوامر شل ذات الامتيازات العالية على خادم ماتركس الافتراضي. تظهر التغييرات في الوقت الفعلي.',
    standardInstall: 'حزمة التثبيت القياسية',
    standardInstallSub: 'Nginx, Synapse, Element, TURN, Postgres',
    enableWorkers: 'تفعيل عمال Redis',
    enableWorkersSub: 'نشر 2 عمال عامين ووكيل',
    disableE2ee: 'تعطيل التشفير E2EE على مستوى المؤسسة',
    disableE2eeSub: 'فرض 4 طبقات لقفل تشفير الغرف',
    triggerBackup: 'تشغيل النسخ الاحتياطي الكامل',
    triggerBackupSub: 'قاعدة البيانات، المفاتيح، أرشيف Element ويب',
    updatePanel: 'تحديث لوحة ماتركس',
    updatePanelSub: 'التحقق من الحالة وجلب آخر التغييرات من غيت',
    activeSsh: 'محطة SSH نشطة',
    activeSshSub: 'التفاعل مع واجهة أوامر الخدمة الحية',
    checkLogs: 'عرض التكوين والسجل',
    checkLogsSub: 'عرض بيانات قاعدة البيانات وإرشادات ما بعد التثبيت و /var/log/matrix_stack_install.log',
    accessRestricted: 'الوصول مقيد',
    accessRestrictedDesc: (role: string) => `دورك هو ${role}. تتطلب بعض الأوامر امتيازات Super Admin أو المالك.`,
    consoleModeActive: 'وضع وحدة التحكم نشط',
    consoleModeActiveDesc: 'لديك صلاحية الكتابة والتنفيذ الكاملة. اتخذ الاحتياطات اللازمة عند إعداد الخادم.',
    unauthorizedViewer: 'غير مصرح: لا يمكن لدور المشاهد إدخال أوامر وحدة التحكم',
    inputPlaceholder: 'اكتب الأمر المخصص (install, backup, workers) واضغط Enter...',
    checking: 'جاري التحقق...',
    currentInstalled: 'الإصدار المثبت حاليًا:',
    updateControl: 'مركز التحكم في تحديثات اللوحة',
    checkUpdates: 'التحقق من التحديثات',
    installUpdate: 'تثبيت التحديث',
    newUpdateAvailable: 'تحديث جديد متاح!',
    updateAvailableDesc: (commits: number) => `أنت متأخر حاليًا بـ ${commits} من الالتزامات عن الفرع الرئيسي. يرجى التحديث.`,
    latestChanges: 'وصف آخر تحديث متاح:',
    systemUpToDate: 'النظام محدث بالكامل',
    systemUpToDateDesc: 'لوحة تحكم ماتركس تعمل بأحدث كود من المستودع البعيد.',
    readyMsg: '# مدير التحديثات جاهز.',
    clickToQuery: '# انقر على "التحقق من التحديثات" للاستعلام عن حالة المستودع.',

    // Post-Install & Config Info
    installInfoTitle: 'ملخص التثبيت وتكوين النظام (الخيار 8 -> الخيار 2)',
    postInstallGuideTitle: 'إرشادات إلزامية بعد التثبيت (إعداد قاعدة البيانات والمسؤول)',
    postInstallGuideSub: 'لتمكين جميع قدرات اللوحة (قراءة قائمة المستخدمين وإحصائيات الغرف وتنفيذ واجهات برمجة تطبيقات ماتركس)، أكمل الخُطوتين التاليتين:',
    stepDbTitle: '1. تكوين بيانات اعتماد PostgreSQL في إعدادات الاتصال بالخادم',
    stepDbDesc: "انسخ كلمة المرور من بطاقة 'معلومات الاتصال بقاعدة بيانات PostgreSQL' أدناه. ثم انتقل إلى 'اتصالات الخادم' في القائمة الجانبية، وحرر ملف الخادم النشط، واملأ بيانات قاعدة البيانات (المضيف: 127.0.0.1، المنفذ: 5432، قاعدة البيانات: synapse، المستخدم: synapse_user وكلمة المرور). يتيح ذلك للوحة الاستعلام عن المستخدمين والغرف مباشرة من PostgreSQL.",
    stepAdminTitle: '2. تسجيل مستخدم مسؤول Synapse وحفظ توكن المسؤول في اللوحة',
    stepAdminDesc: "انتقل إلى 'إدارة المستخدمين' (أو مسؤول ماتركس) في قائمة اللوحة واستخدم 'تسجيل مستخدم جديد' لإنشاء حساب مع تفعيل صلاحيات مسؤول Synapse. بعد ذلك، ارجع إلى 'اتصالات الخادم'، وحرر ملف الخادم النشط، ووسع 'عرض إعدادات توكن المسؤول'، واحفظ بيانات الاعتماد أو توكن الوصول لهذا الحساب.",
    dbDetailsTitle: 'معلومات الاتصال بقاعدة بيانات PostgreSQL',
    dbHost: 'مضيف قاعدة البيانات:',
    dbPort: 'منفذ قاعدة البيانات:',
    dbName: 'اسم قاعدة البيانات:',
    dbUser: 'مستخدم قاعدة البيانات:',
    dbPass: 'كلمة مرور قاعدة البيانات:',
    pathsTitle: 'مسارات الملفات والتكوين الهامة للنظام',
    copySuccess: 'تم النسخ إلى الحافظة!',
    showPass: 'إظهار كلمة المرور',
    hidePass: 'إخفاء كلمة المرور'
  },
  de: {
    quickTasks: 'Schnelle Aufgaben',
    quickTasksSub: 'Führen Sie Shell-Routinen mit hohen Privilegien auf dem virtuellen Matrix-Knoten aus. Änderungen werden in Echtzeit übernommen.',
    standardInstall: 'Standard-Installationsstack',
    standardInstallSub: 'Nginx, Synapse, Element, TURN, Postgres',
    enableWorkers: 'Redis-Worker aktivieren',
    enableWorkersSub: '2 generische Worker und einen Proxy bereitstellen',
    disableE2ee: 'E2EE organisationsweit deaktivieren',
    disableE2eeSub: '4-Schichten-Erzwingung zum Sperren der Raumverschlüsselung',
    triggerBackup: 'Vollständiges Backup auslösen',
    triggerBackupSub: 'Datenbank, Schlüssel, Element-Webarchiv',
    updatePanel: 'Matrix-Panel aktualisieren',
    updatePanelSub: 'Status prüfen und neueste Commits von Git abrufen',
    activeSsh: 'Aktives SSH-Terminal',
    activeSshSub: 'Interagieren Sie mit der Live-Dienst-CLI',
    checkLogs: 'Konfiguration & Protokoll anzeigen',
    checkLogsSub: 'DB-Zugangsdaten, Setup-Anleitung & /var/log/matrix_stack_install.log anzeigen',
    accessRestricted: 'Zugriff eingeschränkt',
    accessRestrictedDesc: (role: string) => `Ihre Rolle ist ${role}. Einige Befehle erfordern Super-Admin- oder Besitzerrechte.`,
    consoleModeActive: 'Konsolenmodus aktiv',
    consoleModeActiveDesc: 'Sie haben volle Schreib- und Ausführungsrechte. Lassen Sie bei der Konfiguration des Homeservers Vorsicht walten.',
    unauthorizedViewer: 'Nicht autorisiert: Die Rolle „Viewer“ kann keine Konsolenbefehle eingeben',
    inputPlaceholder: 'Geben Sie eine benutzerdefinierte Aktion ein (install, backup, workers) und drücken Sie Enter...',
    checking: 'Prüfen...',
    currentInstalled: 'Aktuell installierte Version:',
    updateControl: 'Panel-Update-Kontrollzentrum',
    checkUpdates: 'Updates prüfen',
    installUpdate: 'Update installieren',
    newUpdateAvailable: 'Neues Update verfügbar!',
    updateAvailableDesc: (commits: number) => `Sie sind derzeit um ${commits} Commits hinter dem Hauptzweig. Bitte aktualisieren Sie.`,
    latestChanges: 'Beschreibung des neuesten verfügbaren Updates:',
    systemUpToDate: 'System auf dem neuesten Stand',
    systemUpToDateDesc: 'Ihr Matrix-Admin-Panel läuft mit dem neuesten Code aus dem Remote-Repository.',
    readyMsg: '# Update-Manager bereit.',
    clickToQuery: '# Klicken Sie auf „Updates prüfen“, um den Repository-Status abzufragen.',

    // Post-Install & Config Info
    installInfoTitle: 'Zusammenfassung der Installation & Systemkonfiguration (Option 8 -> Option 2)',
    postInstallGuideTitle: 'Obligatorische Anleitung nach der Installation (Datenbank & Admin-Einrichtung)',
    postInstallGuideSub: 'Um die vollständigen Funktionen des Panels zu aktivieren (Benutzerlisten lesen, Raumstatistiken und Matrix-APIs ausführen), führen Sie diese zwei Schritte aus:',
    stepDbTitle: '1. PostgreSQL-Zugangsdaten in den Serververbindungseinstellungen konfigurieren',
    stepDbDesc: "Kopieren Sie das Passwort aus der Karte 'PostgreSQL-Datenbankverbindungsinformationen' unten. Navigieren Sie dann im Seitenmenü zu 'Serververbindungen', bearbeiten Sie Ihr aktives Serverprofil und tragen Sie die Datenbankzugangsdaten ein (Host: 127.0.0.1, Port: 5432, DB: synapse, Benutzer: synapse_user und Passwort). Dadurch kann das Panel Benutzer und Räume direkt aus PostgreSQL abfragen.",
    stepAdminTitle: '2. Synapse-Admin-Benutzer registrieren & Admin-Token im Panel speichern',
    stepAdminDesc: "Gehen Sie im Panel-Menü zu 'Benutzerverwaltung' (oder Matrix Admin) und nutzen Sie 'Neuen Benutzer registrieren', um ein Konto mit Synapse-Admin-Rechten zu erstellen. Kehren Sie dann zu 'Serververbindungen' zurück, bearbeiten Sie das Serverprofil, klappen Sie 'Admin-Token-Einstellungen anzeigen' auf und speichern Sie die Zugangsdaten oder das Zugriffs-Token dieses Admin-Kontos.",
    dbDetailsTitle: 'PostgreSQL-Datenbankverbindungsinformationen',
    dbHost: 'Datenbank-Host:',
    dbPort: 'Datenbank-Port:',
    dbName: 'Datenbank-Name:',
    dbUser: 'Datenbank-Benutzer:',
    dbPass: 'Datenbank-Passwort:',
    pathsTitle: 'Wichtige Systemdatei- & Konfigurationspfade',
    copySuccess: 'In die Zwischenablage kopiert!',
    showPass: 'Passwort anzeigen',
    hidePass: 'Passwort verbergen'
  },
  ru: {
    quickTasks: 'Быстрые задачи',
    quickTasksSub: 'Выполняйте консольные скрипты с высокими правами доступа на виртуальном узле Matrix. Изменения вступают в силу мгновенно.',
    standardInstall: 'Стандартный стек установки',
    standardInstallSub: 'Nginx, Synapse, Element, TURN, Postgres',
    enableWorkers: 'Включить воркеры Redis',
    enableWorkersSub: 'Развернуть 2 стандартных воркера и прокси',
    disableE2ee: 'Отключить E2EE по всей организации',
    disableE2eeSub: '4-уровневое принудительное отключение шифрования комнат',
    triggerBackup: 'Запустить резервное копирование',
    triggerBackupSub: 'База данных, Ключи, веб-архив Element',
    updatePanel: 'Обновить панель Matrix',
    updatePanelSub: 'Проверить статус и загрузить последние коммиты из git',
    activeSsh: 'Активный SSH-терминал',
    activeSshSub: 'Прямое взаимодействие с консолью CLI',
    checkLogs: 'Показать конфигурацию и лог',
    checkLogsSub: 'Просмотр данных БД, инструкций و /var/log/matrix_stack_install.log',
    accessRestricted: 'Доступ ограничен',
    accessRestrictedDesc: (role: string) => `Ваша роль — ${role}. Некоторые команды требуют прав Super Admin или Владельца.`,
    consoleModeActive: 'Режим консоли активен',
    consoleModeActiveDesc: 'У вас есть полные права на запись и выполнение. Соблюдайте осторожность при изменении конфигурации.',
    unauthorizedViewer: 'Недостаточно прав: роль Наблюдателя не может вводить команды в консоль',
    inputPlaceholder: 'Введите команду (install, backup, workers) и нажмите Enter...',
    checking: 'Проверка...',
    currentInstalled: 'Текущая установленная версия:',
    updateControl: 'Центр управления обновлениями',
    checkUpdates: 'Проверить обновления',
    installUpdate: 'Установить обновление',
    newUpdateAvailable: 'Доступно новое обновление!',
    updateAvailableDesc: (commits: number) => `Вы отстаете от основной ветки на ${commits} коммитов. Пожалуйста, обновитесь.`,
    latestChanges: 'Описание последних изменений в обновлении:',
    systemUpToDate: 'Система обновлена',
    systemUpToDateDesc: 'Ваша панель управления Matrix работает на последней версии кода из удаленного репозитория.',
    readyMsg: '# Менеджер обновлений готов к работе.',
    clickToQuery: '# Нажмите «Проверить обновления», чтобы запросить статус репозитория.',

    // Post-Install & Config Info
    installInfoTitle: 'Сводка об установке и конфигурации системы (Опция 8 -> Опция 2)',
    postInstallGuideTitle: 'Обязательное руководство после установки (База данных и Админ)',
    postInstallGuideSub: 'Чтобы включить все возможности панели (чтение списка пользователей, статистики комнат и выполнение API Matrix), выполните следующие два шага:',
    stepDbTitle: '1. Настройка учетных данных PostgreSQL в подключениях к серверу',
    stepDbDesc: "Скопируйте пароль из карточки 'Информация о подключении к БД PostgreSQL' ниже. Затем перейдите в 'Подключения к серверу' в боковом меню, отредактируйте активный профиль сервера и заполните данные БД (Хост: 127.0.0.1, Порт: 5432, БД: synapse, Пользователь: synapse_user и Пароль). Это позволит панели запрашивать пользователей и комнаты напрямую из PostgreSQL.",
    stepAdminTitle: '2. Регистрация администратора Synapse и сохранение токена в панели',
    stepAdminDesc: "Перейдите в 'Управление пользователями' (или Администрирование Matrix) в меню панели и используйте 'Зарегистрировать нового пользователя', чтобы создать аккаунт с правами администратора Synapse. Затем вернитесь в 'Подключения к серверу', отредактируйте профиль сервера, раскройте 'Показать настройки токена администратора' и сохраните данные или токен доступа.",
    dbDetailsTitle: 'Информация о подключении к базе данных PostgreSQL',
    dbHost: 'Хост базы данных:',
    dbPort: 'Порт базы данных:',
    dbName: 'Имя базы данных:',
    dbUser: 'Пользователь базы данных:',
    dbPass: 'Пароль базы данных:',
    pathsTitle: 'Важные пути к системным файлам и конфигурациям',
    copySuccess: 'Скопировано в буфер обмена!',
    showPass: 'Показать пароль',
    hidePass: 'Скрыть пароль'
  }
};

export default function TerminalPanel({ 
  logs, 
  isExecuting, 
  onExecuteCommand, 
  userRole, 
  authToken, 
  lang, 
  isLightMode = false,
  showToast,
  initialTab,
  onTabChange,
  config,
  activeConnection
}: TerminalPanelProps) {
  const isRtl = ['fa', 'ar'].includes(lang);
  const hasWriteAccess = userRole !== 'Viewer';

  const safeConfirm = (msg: string): boolean => {
    try {
      return window.confirm(msg);
    } catch (_) {
      return true;
    }
  };

  const terminalEndRef = useRef<HTMLDivElement>(null);
  const consoleContainerRef = useRef<HTMLDivElement>(null);
  const installContainerRef = useRef<HTMLDivElement>(null);
  const [activeTab, setActiveTab] = useState<'console' | 'install' | 'updates' | 'element-synapse'>('console');
  const [showDbPass, setShowDbPass] = useState<boolean>(false);

  // Derive connection & config values matching option 8 -> 2 in matrix-installer.sh
  const hsDomain = config?.HS_DOMAIN || (activeConnection?.id !== 'local' && activeConnection?.host ? `matrix.${activeConnection?.host}` : 'matrix.company.local');
  const elementDomain = config?.ELEMENT_DOMAIN || (activeConnection?.id !== 'local' && activeConnection?.host ? `chat.${activeConnection?.host}` : 'chat.company.local');
  const baseDomain = config?.BASE_DOMAIN || (activeConnection?.id !== 'local' && activeConnection?.host ? activeConnection?.host : 'company.local');
  const publicIp = (activeConnection?.id !== 'local' && activeConnection?.host) ? activeConnection.host : (config?.PUBLIC_IP || '127.0.0.1');
  const sslMode = (config?.SSL_MODE || 'selfsigned').toUpperCase();

  const pgHost = config?.PG_HOST || activeConnection?.dbHost || '127.0.0.1';
  const pgPort = config?.PG_PORT || activeConnection?.dbPort || '5432';
  const pgDb = config?.PG_DB || activeConnection?.dbName || 'synapse';
  const pgUser = config?.PG_USER || activeConnection?.dbUser || 'synapse_user';
  const pgPass = config?.PG_PASS || activeConnection?.dbPassword || '••••••••';

  useEffect(() => {
    if (initialTab) {
      setActiveTab(initialTab);
    }
  }, [initialTab]);

  const handleTabChange = (tab: 'console' | 'install' | 'updates' | 'element-synapse') => {
    setActiveTab(tab);
    if (onTabChange) {
      onTabChange(tab);
    }
  };
  const [customInput, setCustomInput] = useState('');

  const t = terminalTranslations[lang] || terminalTranslations.en;

  // System Updates & Maintenance States
  const [updateAvailable, setUpdateAvailable] = useState<boolean>(false);
  const [commitsBehind, setCommitsBehind] = useState<number>(0);
  const [latestCommits, setLatestCommits] = useState<any[]>([]);
  const [currentVersion, setCurrentVersion] = useState<string>('');
  const [updateLogs, setUpdateLogs] = useState<string[]>([
    t.readyMsg,
    t.clickToQuery
  ]);
  const [isCheckingUpdate, setIsCheckingUpdate] = useState<boolean>(false);
  const [isApplyingUpdate, setIsApplyingUpdate] = useState<boolean>(false);
  const [showUpdateModal, setShowUpdateModal] = useState<boolean>(false);
  const [isExportingBackup, setIsExportingBackup] = useState<boolean>(false);
  const [isImportingBackup, setIsImportingBackup] = useState<boolean>(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Element Update Suite States
  const [esTarget, setEsTarget] = useState<'element'>('element');
  const [esVersions, setEsVersions] = useState<{
    elementVersion: string;
    elementLatestVersion: string;
    elementHasUpdate: boolean;
    synapseVersion: string;
    synapseLatestVersion: string;
    synapseHasUpdate: boolean;
  }>({
    elementVersion: '',
    elementLatestVersion: '',
    elementHasUpdate: false,
    synapseVersion: '',
    synapseLatestVersion: '',
    synapseHasUpdate: false
  });
  const [isEsUpdating, setIsEsUpdating] = useState<boolean>(false);
  const [esLogs, setEsLogs] = useState<string[]>([]);

  // Manual Element Package States
  const [elementUpdateMode, setElementUpdateMode] = useState<'auto' | 'manual'>('auto');
  const [manualPackages, setManualPackages] = useState<Array<{
    filename: string;
    path: string;
    sizeBytes: number;
    sizeFormatted: string;
    modifiedAt: string;
  }>>([]);
  const [selectedManualPackage, setSelectedManualPackage] = useState<string>('');
  const [manualPackageDir, setManualPackageDir] = useState<string>('');
  const [isFetchingPackages, setIsFetchingPackages] = useState<boolean>(false);
  const [isUploadingPackage, setIsUploadingPackage] = useState<boolean>(false);
  const [uploadProgress, setUploadProgress] = useState<number>(0);

  const activeRepoDir = manualPackageDir || (
    activeConnection && activeConnection.id !== 'local'
      ? (activeConnection.username === 'root' ? '/root/matrix/matrix_package' : `/home/${activeConnection.username || 'user'}/matrix/matrix_package`)
      : '~/matrix/matrix_package'
  );

  useEffect(() => {
    if (isRtl) {
      setEsLogs([
        '# سیستم مدیریت بروزرسانی المنت وب (Update Element Web) آماده است.',
        '# روش آپدیت (آنلاین یا حالت manual) را انتخاب کنید و کلید «شروع بروزرسانی» را بزنید.'
      ]);
    } else {
      setEsLogs([
        '# Update Element Web Suite ready.',
        '# Select deployment mode (Online or Manual Mode) and click "Start Element Update".'
      ]);
    }
  }, [lang, isRtl]);

  const fetchEsVersions = async () => {
    try {
      const res = await fetch('/api/matrix/element-synapse/versions', {
        headers: { 'Authorization': `Bearer ${authToken}` }
      });
      if (res.ok) {
        const data = await res.json();
        setEsVersions({
          elementVersion: data.elementVersion,
          elementLatestVersion: data.elementLatestVersion,
          elementHasUpdate: data.elementHasUpdate,
          synapseVersion: data.synapseVersion,
          synapseLatestVersion: data.synapseLatestVersion,
          synapseHasUpdate: data.synapseHasUpdate
        });
      }
    } catch (e) {}
  };

  const fetchManualPackages = async () => {
    setIsFetchingPackages(true);
    try {
      const res = await fetch('/api/matrix/element-synapse/manual-packages', {
        headers: { 'Authorization': `Bearer ${authToken}` }
      });
      if (res.ok) {
        const data = await res.json();
        if (data.directory) {
          setManualPackageDir(data.directory);
        }
        if (Array.isArray(data.packages)) {
          setManualPackages(data.packages);
          if (data.packages.length > 0) {
            setSelectedManualPackage((prev) => {
              if (!prev || !data.packages.some((p: any) => p.path === prev)) {
                return data.packages[0].path;
              }
              return prev;
            });
          } else {
            setSelectedManualPackage('');
          }
        }
      }
    } catch (e) {
    } finally {
      setIsFetchingPackages(false);
    }
  };

  useEffect(() => {
    if (elementUpdateMode === 'manual') {
      fetchManualPackages();
    }
  }, [elementUpdateMode, activeConnection?.id]);

  const handleUploadElementPackage = async (file: File) => {
    if (!file) return;
    if (!file.name.endsWith('.tar.gz') && !file.name.endsWith('.tgz') && !file.name.endsWith('.zip')) {
      showToast('error', isRtl ? 'فرمت فایل نامعتبر است. فقط .tar.gz و .zip مجاز است' : 'Invalid format. Only .tar.gz and .zip are supported');
      return;
    }

    setIsUploadingPackage(true);
    setUploadProgress(0);

    try {
      const chunkSize = 2 * 1024 * 1024; // 2MB chunk
      const totalChunks = Math.ceil(file.size / chunkSize);
      let uploadedPackagePath = '';

      for (let i = 0; i < totalChunks; i++) {
        const start = i * chunkSize;
        const end = Math.min(file.size, start + chunkSize);
        const chunkBlob = file.slice(start, end);

        const base64Chunk = await new Promise<string>((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = () => {
            const resStr = reader.result as string;
            resolve(resStr.includes(';base64,') ? resStr.split(';base64,')[1] : resStr);
          };
          reader.onerror = reject;
          reader.readAsDataURL(chunkBlob);
        });

        const res = await fetch('/api/matrix/element-synapse/upload-element', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${authToken}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            fileName: file.name,
            fileData: base64Chunk,
            chunkIndex: i,
            totalChunks
          })
        });

        if (!res.ok) {
          const errData = await res.json();
          throw new Error(errData.error || 'Upload failed');
        }

        const data = await res.json();
        if (data.packagePath) {
          uploadedPackagePath = data.packagePath;
        }

        const pct = Math.round(((i + 1) / totalChunks) * 100);
        setUploadProgress(pct);
      }

      showToast('success', isRtl ? `پکیج ${file.name} با موفقیت در سرور ذخیره شد` : `Package ${file.name} uploaded successfully to server`);
      await fetchManualPackages();
      if (uploadedPackagePath) {
        setSelectedManualPackage(uploadedPackagePath);
      }
    } catch (err: any) {
      showToast('error', err.message || (isRtl ? 'خطا در آپلود پکیج' : 'Failed to upload package'));
    } finally {
      setIsUploadingPackage(false);
      setUploadProgress(0);
    }
  };

  useEffect(() => {
    fetchEsVersions();
  }, [authToken]);

  const handleRunEsUpdate = async () => {
    if (isEsUpdating) return;
    if (userRole === 'Viewer') {
      showToast('error', ['fa', 'ar'].includes(lang) ? 'دسترسی غیرمجاز: نقش شما اجازه این عملیات را ندارد' : 'Unauthorized');
      return;
    }

    let activePkgPath = selectedManualPackage;
    if (elementUpdateMode === 'manual') {
      if (!activePkgPath && manualPackages.length > 0) {
        activePkgPath = manualPackages[0].path;
        setSelectedManualPackage(activePkgPath);
      }
      if (!activePkgPath) {
        showToast('error', isRtl ? 'لطفاً ابتدا یک پکیج فایل المنت انتخاب یا آپلود کنید' : 'Please select or upload an Element release package first');
        return;
      }
    }

    setIsEsUpdating(true);
    setEsLogs((prev) => [
      ...prev,
      `--------------------------------------------------`,
      isRtl 
        ? `[TASK] شروع فرآیند بروزرسانی المنت وب (${elementUpdateMode === 'manual' ? 'حالت manual / آفلاین' : 'دانلود آنلاین از گیت‌هاب'})`
        : `[TASK] Initiating Element Web update (${elementUpdateMode === 'manual' ? 'Manual Package Mode' : 'Online GitHub Release'})`
    ]);

    try {
      const res = await fetch('/api/matrix/element-synapse/update', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${authToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          target: 'element',
          elementMode: elementUpdateMode,
          manualPackagePath: activePkgPath,
          connectionId: activeConnection?.id
        })
      });

      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data.logs)) {
          setEsLogs((prev) => [...prev, ...data.logs]);
        }
        setEsVersions({
          elementVersion: data.elementVersion,
          elementLatestVersion: data.elementLatestVersion,
          elementHasUpdate: data.elementHasUpdate,
          synapseVersion: data.synapseVersion,
          synapseLatestVersion: data.synapseLatestVersion,
          synapseHasUpdate: data.synapseHasUpdate
        });
        showToast('success', ['fa', 'ar'].includes(lang) ? 'بروزرسانی با موفقیت انجام شد' : 'Update completed successfully!');
      } else {
        const err = await res.json();
        if (Array.isArray(err.logs)) {
          setEsLogs((prev) => [...prev, ...err.logs]);
        }
        setEsLogs((prev) => [...prev, `[ERR] ${err.error || 'Update failed'}`]);
        showToast('error', ['fa', 'ar'].includes(lang) ? 'خطا در انجام بروزرسانی' : 'Update failed');
      }
    } catch (e: any) {
      setEsLogs((prev) => [...prev, `[ERR] ${e.message || 'Network error'}`]);
      showToast('error', ['fa', 'ar'].includes(lang) ? 'خطا در ارتباط با سرور' : 'Network error');
    } finally {
      setIsEsUpdating(false);
    }
  };

  const downloadBackupExport = async () => {
    try {
      setIsExportingBackup(true);
      const res = await fetch('/api/system/update/backup-export', {
        headers: { 'Authorization': `Bearer ${authToken}` }
      });
      if (!res.ok) throw new Error('Failed to generate export file');
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `matrix-panel-backup-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      showToast('success', isRtl ? 'نسخه پشتیبان با موفقیت دانلود شد' : 'Panel backup exported successfully.');
    } catch (e: any) {
      showToast('error', e.message || 'Error exporting backup');
    } finally {
      setIsExportingBackup(false);
    }
  };

  const handleImportBackup = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setIsImportingBackup(true);
      const text = await file.text();
      let jsonData;
      try {
        jsonData = JSON.parse(text);
      } catch (pErr) {
        throw new Error(isRtl ? 'فایل بک‌آپ نامعتبر است (ساختار JSON ناصحیح)' : 'Invalid JSON file format.');
      }

      const res = await fetch('/api/system/update/backup-import', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${authToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(jsonData)
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.error || 'Failed to import backup');
      }

      const data = await res.json();
      showToast(
        'success',
        isRtl 
          ? `نسخه پشتیبان با موفقیت بازیابی و اعمال شد (${data.restoredUsersCount} کاربر، ${data.restoredConnectionsCount} سرور).`
          : `Backup imported successfully (${data.restoredUsersCount} users, ${data.restoredConnectionsCount} servers).`
      );
      setTimeout(() => {
        try {
          window.location.reload();
        } catch (_) {}
      }, 1200);
    } catch (err: any) {
      showToast('error', err.message || 'Error importing backup');
    } finally {
      setIsImportingBackup(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
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

  const applySystemUpdates = () => {
    if (!updateAvailable) {
      showToast('error', isRtl ? 'هیچ بروزرسانی جدیدی برای نصب وجود ندارد.' : 'No new update available.');
      return;
    }
    if (!hasWriteAccess) return showToast('error', isRtl ? 'دسترسی غیرمجاز: نقش شما اجازه انجام این کار را نمی‌دهد.' : 'Unauthorized: Your role does not have privileges for this action.');
    setShowUpdateModal(true);
  };

  const executeUpdateFlow = async () => {
    setShowUpdateModal(false);
    setIsApplyingUpdate(true);
    setUpdateLogs((prev) => [...prev, '# launching full system update flow...', '> git pull && setup-panel.sh refresh && npm run build']);
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
        showToast('success', isRtl ? 'پنل با موفقیت بروزرسانی شد! در حال بارگذاری مجدد...' : 'Panel updated successfully! Reloading...');
        setTimeout(() => {
          try {
            window.location.reload();
          } catch (e) {
            window.location.href = window.location.origin + window.location.pathname + window.location.search;
          }
        }, 2000);
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
    if (activeTab === 'console' && consoleContainerRef.current) {
      consoleContainerRef.current.scrollTop = consoleContainerRef.current.scrollHeight;
    } else if (activeTab === 'install' && installContainerRef.current) {
      installContainerRef.current.scrollTop = installContainerRef.current.scrollHeight;
    }
  };

  useEffect(() => {
    scrollToBottom();
  }, [logs, activeTab]);

  const handleRunCommand = (cmd: string) => {
    if (isExecuting) return;
    handleTabChange('console');
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
    } else if (['update', 'updates', 'update_panel', 'panel-updates', 'update-panel'].includes(inputLower)) {
      handleTabChange('updates');
      checkSystemUpdates();
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
      return <span className={isLightMode ? "text-emerald-700 font-semibold" : "text-emerald-400 font-semibold"}>{line}</span>;
    }
    if (line.includes('✘') || line.includes('❌') || line.includes('FAILED') || line.includes('Error')) {
      return <span className={isLightMode ? "text-rose-700 font-semibold" : "text-red-400 font-semibold"}>{line}</span>;
    }
    if (line.includes('⚠️') || line.includes('WARNING') || line.includes('[INFO]')) {
      return <span className={isLightMode ? "text-amber-700 font-medium" : "text-amber-400"}>{line}</span>;
    }
    if (line.includes('[STEP') || line.includes('STEP')) {
      return <span className={isLightMode ? "text-blue-700 font-semibold" : "text-cyan-400 font-medium glow-text-cyan"}>{line}</span>;
    }
    return <span className={isLightMode ? "text-slate-800" : "text-slate-300"}>{line}</span>;
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[calc(100vh-180px)] overflow-hidden" dir={isRtl ? "rtl" : "ltr"}>
      {/* Sidebar: Preset Quick Actions */}
      <div className={`spatial-glass rounded-3xl p-5 border border-white/5 flex flex-col justify-between h-full overflow-y-auto ${isRtl ? 'text-right' : 'text-left'}`}>
        <div>
          <div className={`flex items-center gap-3 mb-4 ${isRtl ? 'flex-row-reverse' : ''}`}>
            <div className="p-2 rounded-xl bg-rose-500/10 text-rose-400 border border-rose-500/10">
              <Terminal className="w-5 h-5" />
            </div>
            <h2 className="text-xl font-display font-bold text-white">{t.quickTasks}</h2>
          </div>
          <p className="text-xs text-slate-400 mb-6">
            {t.quickTasksSub}
          </p>

          <div className="space-y-3">
            {/* Standard Installation */}
            <button
              onClick={() => handleRunCommand('install')}
              disabled={isExecuting || isViewer || isModerator}
              className={`w-full text-left p-3.5 rounded-2xl border transition-all flex items-center justify-between group cursor-pointer ${
                isExecuting 
                  ? 'bg-white/5 border-white/5 text-gray-500' 
                  : isViewer || isModerator
                    ? 'border-red-500/10 bg-red-500/5 text-gray-400 cursor-not-allowed'
                    : 'border-white/5 bg-white/5 hover:bg-rose-500/10 hover:border-rose-500/20 text-slate-200'
              } ${isRtl ? 'flex-row-reverse text-right' : 'text-left'}`}
            >
              <div>
                <h4 className={`text-sm font-semibold flex items-center gap-2 ${isRtl ? 'flex-row-reverse' : ''}`}>
                  {t.standardInstall}
                  {isModerator && <span className="text-[10px] bg-red-500/10 text-red-400 px-1.5 py-0.5 rounded font-mono font-normal">SuperAdmin+</span>}
                </h4>
                <p className="text-[11px] text-slate-400 mt-1">{t.standardInstallSub}</p>
              </div>
              <Play className="w-4 h-4 text-rose-400 transition-transform group-hover:scale-125 shrink-0" />
            </button>

            {/* Update Matrix Panel */}
            <button
              type="button"
              onClick={() => {
                handleTabChange('updates');
                checkSystemUpdates();
              }}
              disabled={isCheckingUpdate || isApplyingUpdate}
              className={`w-full text-left p-3.5 rounded-2xl border transition-all flex items-center justify-between group cursor-pointer ${
                activeTab === 'updates'
                  ? 'bg-purple-600/20 border-purple-500/40 text-white ring-1 ring-purple-500/30'
                  : isCheckingUpdate || isApplyingUpdate
                    ? 'bg-white/5 border-white/5 text-gray-500' 
                    : 'border-white/5 bg-white/5 hover:bg-rose-500/10 hover:border-rose-500/20 text-slate-200'
              } ${isRtl ? 'flex-row-reverse text-right' : 'text-left'}`}
            >
              <div>
                <h4 className={`text-sm font-semibold flex items-center gap-2 ${isRtl ? 'flex-row-reverse' : ''}`}>
                  {t.updatePanel}
                  {updateAvailable && (
                    <span className="h-2 w-2 rounded-full bg-rose-500 animate-pulse" />
                  )}
                </h4>
                <p className="text-[11px] text-slate-400 mt-1">
                  {t.updatePanelSub}
                </p>
              </div>
              <Play className="w-4 h-4 text-rose-400 transition-transform group-hover:scale-125 shrink-0" />
            </button>

            {/* Task: Update Element Web */}
            <button
              type="button"
              onClick={() => {
                handleTabChange('element-synapse');
              }}
              disabled={isExecuting}
              className={`w-full text-left p-3.5 rounded-2xl border transition-all flex items-center justify-between group cursor-pointer ${
                activeTab === 'element-synapse'
                  ? 'bg-emerald-600/20 border-emerald-500/40 text-white ring-1 ring-emerald-500/30'
                  : 'border-white/5 bg-white/5 hover:bg-emerald-500/10 hover:border-emerald-500/20 text-slate-200'
              } ${isRtl ? 'flex-row-reverse text-right' : 'text-left'}`}
            >
              <div>
                <h4 className={`text-sm font-semibold flex items-center gap-2 ${isRtl ? 'flex-row-reverse' : ''}`}>
                  {isRtl ? 'آپدیت المنت وب (Update Element Web)' : 'Update Element Web'}
                  {(esVersions.elementHasUpdate || esVersions.synapseHasUpdate) && (
                    <span className="h-2 w-2 rounded-full bg-amber-400 animate-pulse" />
                  )}
                </h4>
                <p className="text-[11px] text-slate-400 mt-1">
                  {isRtl 
                    ? 'بروزرسانی کلاینت المنت وب به روش خودکار (گیت‌هاب) یا پکیج آفلاین (حالت manual)' 
                    : 'Update Element Web client via GitHub releases or manual offline packages'}
                </p>
              </div>
              <Play className="w-4 h-4 text-emerald-400 transition-transform group-hover:scale-125 shrink-0" />
            </button>

            {/* Active SSH Terminal Navigation Shortcut */}
            <button
              type="button"
              onClick={() => handleTabChange('console')}
              className={`w-full text-left p-3.5 rounded-2xl border border-white/5 bg-white/5 hover:bg-indigo-500/10 hover:border-indigo-500/20 text-slate-200 transition-all flex items-center justify-between group cursor-pointer ${isRtl ? 'flex-row-reverse text-right' : 'text-left'}`}
            >
              <div>
                <h4 className={`text-sm font-semibold flex items-center gap-2 ${isRtl ? 'flex-row-reverse' : ''}`}>
                  {t.activeSsh}
                </h4>
                <p className="text-[11px] text-slate-400 mt-1">
                  {t.activeSshSub}
                </p>
              </div>
              <Play className="w-4 h-4 text-indigo-400 transition-transform group-hover:scale-125 shrink-0" />
            </button>

            {/* Check Installation Logs Navigation Shortcut */}
            <button
              type="button"
              onClick={() => handleTabChange('install')}
              className={`w-full text-left p-3.5 rounded-2xl border border-white/5 bg-white/5 hover:bg-emerald-500/10 hover:border-emerald-500/20 text-slate-200 transition-all flex items-center justify-between group cursor-pointer ${isRtl ? 'flex-row-reverse text-right' : 'text-left'}`}
            >
              <div>
                <h4 className={`text-sm font-semibold flex items-center gap-2 ${isRtl ? 'flex-row-reverse' : ''}`}>
                  {t.checkLogs}
                </h4>
                <p className="text-[11px] text-slate-400 mt-1">
                  {t.checkLogsSub}
                </p>
              </div>
              <Play className="w-4 h-4 text-emerald-400 transition-transform group-hover:scale-125 shrink-0" />
            </button>
          </div>
        </div>

        {/* Security / RBAC Banner */}
        {isViewer || isModerator ? (
          <div className={`mt-4 p-4 rounded-2xl bg-red-500/10 border border-red-500/10 text-red-400 flex items-start gap-3 ${isRtl ? 'flex-row-reverse text-right' : 'text-left'}`}>
            <ShieldAlert className="w-5 h-5 mt-0.5 shrink-0" />
            <div>
              <h5 className="text-xs font-bold font-display uppercase tracking-wider">{t.accessRestricted}</h5>
              <p className="text-[11px] text-slate-400 mt-1">
                {t.accessRestrictedDesc(userRole)}
              </p>
            </div>
          </div>
        ) : (
          <div className={`mt-4 p-4 rounded-2xl bg-indigo-500/10 border border-indigo-500/10 text-indigo-400 flex items-start gap-3 ${isRtl ? 'flex-row-reverse text-right' : 'text-left'}`}>
            <ShieldAlert className="w-5 h-5 mt-0.5 shrink-0" />
            <div>
              <h5 className="text-xs font-bold font-display uppercase tracking-wider">{t.consoleModeActive}</h5>
              <p className="text-[11px] text-slate-400 mt-1">
                {t.consoleModeActiveDesc}
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Main Panel: Interactive Terminal */}
      <div className={`lg:col-span-2 rounded-3xl border flex flex-col h-full overflow-hidden transition-colors ${
        isLightMode ? 'bg-white border-slate-200 shadow-sm' : 'spatial-glass border-white/5'
      }`} dir="ltr">
        {/* Terminal Header */}
        <div className={`px-5 py-3 border-b flex items-center justify-between transition-colors ${
          isLightMode ? 'bg-slate-100/90 border-slate-200' : 'bg-black/30 border-white/5'
        }`}>
          <div className="flex items-center gap-2">
            <Circle className="w-3.5 h-3.5 text-red-500 fill-red-500" />
            <Circle className="w-3.5 h-3.5 text-yellow-500 fill-yellow-500" />
            <Circle className="w-3.5 h-3.5 text-green-500 fill-green-500" />
            <span className={`text-xs font-mono ml-2 ${isLightMode ? 'text-slate-600' : 'text-slate-400'}`}>ssh root@matrix-virtual-node:~</span>
          </div>

          <div className="flex items-center gap-2">
            <button 
              type="button"
              onClick={() => handleTabChange('console')} 
              className={`text-xs px-3 py-1.5 rounded-lg font-mono cursor-pointer transition-all duration-200 ${
                activeTab === 'console' 
                  ? 'bg-indigo-600 text-white font-bold shadow-md ring-1 ring-indigo-400/50' 
                  : isLightMode 
                    ? 'bg-slate-200/80 text-slate-600 hover:text-slate-900 hover:bg-slate-300'
                    : 'bg-white/5 text-slate-400 hover:text-white hover:bg-white/10'
              }`}
            >
              active-terminal
            </button>
            <button 
              type="button"
              onClick={() => handleTabChange('install')} 
              className={`text-xs px-3 py-1.5 rounded-lg font-mono cursor-pointer transition-all duration-200 ${
                activeTab === 'install' 
                  ? 'bg-indigo-600 text-white font-bold shadow-md ring-1 ring-indigo-400/50' 
                  : isLightMode 
                    ? 'bg-slate-200/80 text-slate-600 hover:text-slate-900 hover:bg-slate-300'
                    : 'bg-white/5 text-slate-400 hover:text-white hover:bg-white/10'
              }`}
            >
              install.log
            </button>
            <button 
              type="button"
              onClick={() => handleTabChange('updates')} 
              className={`text-xs px-3 py-1.5 rounded-lg font-mono flex items-center gap-1.5 cursor-pointer transition-all duration-200 ${
                activeTab === 'updates' 
                  ? 'bg-indigo-600 text-white font-bold shadow-md ring-1 ring-indigo-400/50' 
                  : isLightMode 
                    ? 'bg-slate-200/80 text-slate-600 hover:text-slate-900 hover:bg-slate-300'
                    : 'bg-white/5 text-slate-400 hover:text-white hover:bg-white/10'
              }`}
            >
              <RefreshCw className={`h-3 w-3 ${isCheckingUpdate ? 'animate-spin' : ''}`} />
              <span>panel-updates</span>
              {updateAvailable && (
                <span className="h-2 w-2 rounded-full bg-rose-500 animate-pulse" />
              )}
            </button>
            <button 
              type="button"
              onClick={() => handleTabChange('element-synapse')} 
              className={`text-xs px-3 py-1.5 rounded-lg font-mono flex items-center gap-1.5 cursor-pointer transition-all duration-200 ${
                activeTab === 'element-synapse' 
                  ? 'bg-emerald-600 text-white font-bold shadow-md ring-1 ring-emerald-400/50' 
                  : isLightMode 
                    ? 'bg-slate-200/80 text-slate-600 hover:text-slate-900 hover:bg-slate-300'
                    : 'bg-white/5 text-slate-400 hover:text-white hover:bg-white/10'
              }`}
            >
              <RefreshCw className={`h-3 w-3 ${isEsUpdating ? 'animate-spin' : ''}`} />
              <span>update-element-web</span>
              {esVersions.elementHasUpdate && (
                <span className="h-2 w-2 rounded-full bg-amber-400 animate-pulse" />
              )}
            </button>
          </div>
        </div>

        {/* Terminal screen */}
        <div ref={consoleContainerRef} className={`flex-1 p-5 font-mono text-xs overflow-y-auto leading-relaxed select-text min-h-[300px] transition-colors ${
          isLightMode ? 'bg-slate-100/50 text-slate-800' : 'bg-black/60 text-slate-200'
        }`}>
          {activeTab === 'console' ? (
            <div className="space-y-1">
              <p className={`font-semibold mb-2 ${isLightMode ? 'text-slate-500' : 'text-slate-400'}`}>
                # Raven Matrix Stack Manager CLI Terminal - Connected to secure Node WebSocket
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
          ) : activeTab === 'install' ? (
            <div className={`space-y-6 font-sans ${isLightMode ? 'text-slate-800' : 'text-slate-300'}`}>
              {/* Terminal / Log Output Header */}
              <div className={`p-4 rounded-2xl border font-mono text-xs shadow-inner transition-colors ${
                isLightMode ? 'bg-slate-50 border-slate-300 text-slate-800 shadow-sm' : 'bg-slate-950/90 border-white/10 text-slate-200'
              }`}>
                <div className={`flex items-center justify-between border-b pb-2 mb-3 ${
                  isLightMode ? 'text-slate-600 border-slate-200' : 'text-slate-400 border-white/10'
                }`}>
                  <span className={`flex items-center gap-2 font-semibold ${
                    isLightMode ? 'text-emerald-700' : 'text-emerald-400'
                  }`}>
                    <FileText className="w-4 h-4" />
                    # Reading live installer log: /var/log/matrix_stack_install.log
                  </span>
                  <span className={`text-[10px] ${isLightMode ? 'text-slate-500 font-bold' : 'text-slate-400'}`}>Matrix Installer Stack</span>
                </div>

                <div ref={installContainerRef} className="space-y-1 max-h-96 overflow-y-auto pr-2 scrollbar-thin">
                  {logs.length > 1 ? (
                    <>
                      {logs.map((log, index) => (
                        <div key={index} className="whitespace-pre-wrap font-mono">
                          {formatLogLine(log)}
                        </div>
                      ))}
                      {isExecuting && (
                        <div className={`flex items-center gap-2 mt-2 ${isLightMode ? 'text-rose-600' : 'text-rose-400'}`}>
                          <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                          <span>Streaming installation stdout/stderr in real-time...</span>
                        </div>
                      )}
                    </>
                  ) : (
                    <div className={`space-y-1 ${isLightMode ? 'text-slate-700' : 'text-slate-300'}`}>
                      <p>Initial preflight checks successfully completed.</p>
                      <p>Database setup finalized with Postgres user role.</p>
                      <p className={isLightMode ? 'text-emerald-700 font-semibold' : 'text-emerald-400 font-semibold'}>✅ Synapse package initialized and launched on port 8008.</p>
                      <p className={isLightMode ? 'text-emerald-700 font-semibold' : 'text-emerald-400 font-semibold'}>✅ Element Web client configured with SSL profiles.</p>
                      <p className={`mt-2 text-[11px] italic ${isLightMode ? 'text-slate-500' : 'text-slate-400'}`}>💡 Tip: Run installation from wizard to view step-by-step live output here.</p>
                    </div>
                  )}
                </div>
              </div>

              {/* MANDATORY POST-INSTALLATION GUIDANCE BOX */}
              <div className={`p-5 rounded-2xl border shadow-xl space-y-4 transition-all ${
                isLightMode 
                  ? 'bg-indigo-50/90 border-indigo-200 text-slate-800' 
                  : 'bg-gradient-to-br from-indigo-950/60 via-slate-900/90 to-purple-950/40 border-indigo-500/30 text-slate-100'
              }`}>
                <div className="flex items-start gap-3">
                  <div className={`p-2.5 rounded-xl border shrink-0 ${
                    isLightMode 
                      ? 'bg-indigo-100 border-indigo-300 text-indigo-700' 
                      : 'bg-indigo-500/20 border-indigo-500/30 text-indigo-400'
                  }`}>
                    <ShieldCheck className="w-6 h-6 animate-pulse" />
                  </div>
                  <div>
                    <h3 className={`text-sm font-bold font-display uppercase tracking-wider ${isLightMode ? 'text-indigo-950' : 'text-indigo-300'}`}>
                      {t.postInstallGuideTitle}
                    </h3>
                    <p className={`text-xs mt-1 leading-relaxed ${isLightMode ? 'text-slate-600' : 'text-slate-300'}`}>
                      {t.postInstallGuideSub}
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-1">
                  {/* Step 1: Database Setup */}
                  <div className={`p-4 rounded-xl border space-y-2 ${
                    isLightMode ? 'bg-white border-indigo-200/80 shadow-sm' : 'bg-slate-950/60 border-indigo-500/20'
                  }`}>
                    <div className={`flex items-center gap-2 font-bold text-xs ${isLightMode ? 'text-emerald-700' : 'text-emerald-400'}`}>
                      <Database className="w-4 h-4 shrink-0" />
                      <span>{t.stepDbTitle}</span>
                    </div>
                    <p className={`text-[11px] leading-relaxed ${isLightMode ? 'text-slate-600' : 'text-slate-300'}`}>
                      {t.stepDbDesc}
                    </p>
                  </div>

                  {/* Step 2: Admin Creation */}
                  <div className={`p-4 rounded-xl border space-y-2 ${
                    isLightMode ? 'bg-white border-indigo-200/80 shadow-sm' : 'bg-slate-950/60 border-indigo-500/20'
                  }`}>
                    <div className={`flex items-center gap-2 font-bold text-xs ${isLightMode ? 'text-indigo-700' : 'text-indigo-400'}`}>
                      <UserCheck className="w-4 h-4 shrink-0" />
                      <span>{t.stepAdminTitle}</span>
                    </div>
                    <p className={`text-[11px] leading-relaxed ${isLightMode ? 'text-slate-600' : 'text-slate-300'}`}>
                      {t.stepAdminDesc}
                    </p>
                  </div>
                </div>
              </div>

              {/* INSTALLATION & CONFIGURATION INFO (MIRRORED FROM OPTION 8 -> OPTION 2) */}
              <div className={`p-5 rounded-2xl border space-y-5 transition-all ${
                isLightMode 
                  ? 'bg-white border-slate-200 shadow-md text-slate-800' 
                  : 'bg-slate-900/90 border-white/10 shadow-xl text-slate-200'
              }`}>
                <div className={`flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b pb-3 ${
                  isLightMode ? 'border-slate-200' : 'border-white/10'
                }`}>
                  <div className={`flex items-center gap-2 font-bold text-sm ${isLightMode ? 'text-indigo-800' : 'text-indigo-400'}`}>
                    <Info className="w-5 h-5 shrink-0" />
                    <span>{t.installInfoTitle}</span>
                  </div>
                  <span className={`text-[10px] uppercase font-mono px-2.5 py-1 rounded-full border shrink-0 self-start sm:self-auto ${
                    isLightMode ? 'bg-indigo-50 text-indigo-700 border-indigo-200' : 'bg-indigo-500/10 text-indigo-300 border-indigo-500/20'
                  }`}>
                    matrix-installer.sh Option 8 → 2
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Domains & URLs */}
                  <div className={`p-4 rounded-xl border space-y-2.5 ${
                    isLightMode ? 'bg-slate-50 border-slate-200' : 'bg-slate-950/50 border-white/5'
                  }`}>
                    <span className={`text-[11px] uppercase font-bold tracking-wider flex items-center gap-1.5 ${
                      isLightMode ? 'text-slate-600' : 'text-slate-400'
                    }`}>
                      <Globe className="w-3.5 h-3.5 text-indigo-500" />
                      Domains & Network URLs
                    </span>
                    <div className="space-y-1.5 text-xs font-mono">
                      <div className={`flex justify-between border-b pb-1 ${isLightMode ? 'border-slate-200' : 'border-white/5'}`}>
                        <span className={isLightMode ? 'text-slate-500' : 'text-slate-400'}>Matrix Server:</span>
                        <span className="text-indigo-600 dark:text-indigo-400 font-semibold truncate max-w-[170px]">https://{hsDomain}</span>
                      </div>
                      <div className={`flex justify-between border-b pb-1 ${isLightMode ? 'border-slate-200' : 'border-white/5'}`}>
                        <span className={isLightMode ? 'text-slate-500' : 'text-slate-400'}>Element Web:</span>
                        <span className="text-purple-600 dark:text-purple-400 font-semibold truncate max-w-[170px]">https://{elementDomain}</span>
                      </div>
                      <div className={`flex justify-between border-b pb-1 ${isLightMode ? 'border-slate-200' : 'border-white/5'}`}>
                        <span className={isLightMode ? 'text-slate-500' : 'text-slate-400'}>Well-Known Base:</span>
                        <span className={isLightMode ? 'text-slate-800' : 'text-slate-200'}>https://{baseDomain}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className={isLightMode ? 'text-slate-500' : 'text-slate-400'}>Public IP:</span>
                        <span className="text-emerald-600 dark:text-emerald-400 font-semibold">{publicIp}</span>
                      </div>
                    </div>
                  </div>

                  {/* Database Info */}
                  <div className={`p-4 rounded-xl border space-y-2.5 ${
                    isLightMode ? 'bg-slate-50 border-emerald-200/80' : 'bg-slate-950/50 border-emerald-500/20'
                  }`}>
                    <div className="flex items-center justify-between">
                      <span className={`text-[11px] uppercase font-bold tracking-wider flex items-center gap-1.5 ${
                        isLightMode ? 'text-emerald-800' : 'text-emerald-400'
                      }`}>
                        <Database className="w-3.5 h-3.5 text-emerald-500" />
                        {t.dbDetailsTitle}
                      </span>
                      <button
                        type="button"
                        onClick={() => setShowDbPass(!showDbPass)}
                        className={`text-[10px] flex items-center gap-1 cursor-pointer px-2 py-0.5 rounded border ${
                          isLightMode 
                            ? 'bg-white text-slate-600 border-slate-300 hover:text-slate-900' 
                            : 'bg-white/5 text-slate-400 hover:text-white border-white/10'
                        }`}
                      >
                        <Eye className="w-3 h-3" />
                        <span>{showDbPass ? t.hidePass : t.showPass}</span>
                      </button>
                    </div>

                    <div className="space-y-1.5 text-xs font-mono">
                      <div className={`flex justify-between border-b pb-1 ${isLightMode ? 'border-slate-200' : 'border-white/5'}`}>
                        <span className={isLightMode ? 'text-slate-500' : 'text-slate-400'}>{t.dbHost}</span>
                        <span className={`font-bold ${isLightMode ? 'text-slate-900' : 'text-slate-200'}`}>{pgHost}</span>
                      </div>
                      <div className={`flex justify-between border-b pb-1 ${isLightMode ? 'border-slate-200' : 'border-white/5'}`}>
                        <span className={isLightMode ? 'text-slate-500' : 'text-slate-400'}>{t.dbPort}</span>
                        <span className={isLightMode ? 'text-slate-800' : 'text-slate-200'}>{pgPort}</span>
                      </div>
                      <div className={`flex justify-between border-b pb-1 ${isLightMode ? 'border-slate-200' : 'border-white/5'}`}>
                        <span className={isLightMode ? 'text-slate-500' : 'text-slate-400'}>{t.dbName}</span>
                        <span className="text-emerald-700 dark:text-emerald-300 font-bold">{pgDb}</span>
                      </div>
                      <div className={`flex justify-between border-b pb-1 ${isLightMode ? 'border-slate-200' : 'border-white/5'}`}>
                        <span className={isLightMode ? 'text-slate-500' : 'text-slate-400'}>{t.dbUser}</span>
                        <span className="text-emerald-700 dark:text-emerald-300 font-bold">{pgUser}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className={isLightMode ? 'text-slate-500' : 'text-slate-400'}>{t.dbPass}</span>
                        <div className="flex items-center gap-2">
                          <span className={`font-bold font-mono ${isLightMode ? 'text-indigo-700' : 'text-indigo-300'}`}>
                            {showDbPass ? pgPass : '••••••••••••'}
                          </span>
                          <button
                            type="button"
                            onClick={() => {
                              navigator.clipboard.writeText(pgPass);
                              showToast('success', t.copySuccess);
                            }}
                            className={`p-1 rounded cursor-pointer ${
                              isLightMode ? 'text-slate-500 hover:text-slate-900 hover:bg-slate-200' : 'text-slate-400 hover:text-white hover:bg-white/10'
                            }`}
                            title="Copy password"
                          >
                            <Copy className="w-3 h-3" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* SSL & Security */}
                  <div className={`p-4 rounded-xl border space-y-2.5 ${
                    isLightMode ? 'bg-slate-50 border-slate-200' : 'bg-slate-950/50 border-white/5'
                  }`}>
                    <span className={`text-[11px] uppercase font-bold tracking-wider flex items-center gap-1.5 ${
                      isLightMode ? 'text-slate-600' : 'text-slate-400'
                    }`}>
                      <Key className="w-3.5 h-3.5 text-amber-500" />
                      SSL Certificate & Security
                    </span>
                    <div className="space-y-1.5 text-xs font-mono">
                      <div className={`flex justify-between border-b pb-1 ${isLightMode ? 'border-slate-200' : 'border-white/5'}`}>
                        <span className={isLightMode ? 'text-slate-500' : 'text-slate-400'}>SSL Profile:</span>
                        <span className="text-amber-600 dark:text-amber-400 font-bold uppercase">{sslMode}</span>
                      </div>
                      <div className={`flex justify-between border-b pb-1 ${isLightMode ? 'border-slate-200' : 'border-white/5'}`}>
                        <span className={isLightMode ? 'text-slate-500' : 'text-slate-400'}>Cert Path:</span>
                        <span className={`truncate max-w-[170px] ${isLightMode ? 'text-slate-700' : 'text-slate-300'}`}>/etc/letsencrypt/live/{hsDomain}/</span>
                      </div>
                      <div className={`flex justify-between border-b pb-1 ${isLightMode ? 'border-slate-200' : 'border-white/5'}`}>
                        <span className={isLightMode ? 'text-slate-500' : 'text-slate-400'}>Reg Secret:</span>
                        <span className="text-slate-500 text-[10px]">In /etc/matrix-synapse/homeserver.yaml</span>
                      </div>
                      <div className="flex justify-between">
                        <span className={isLightMode ? 'text-slate-500' : 'text-slate-400'}>TURN Secret:</span>
                        <span className="text-slate-500 text-[10px]">In /etc/coturn/turnserver.conf</span>
                      </div>
                    </div>
                  </div>

                  {/* File & Config Paths */}
                  <div className={`p-4 rounded-xl border space-y-2.5 ${
                    isLightMode ? 'bg-slate-50 border-slate-200' : 'bg-slate-950/50 border-white/5'
                  }`}>
                    <span className={`text-[11px] uppercase font-bold tracking-wider flex items-center gap-1.5 ${
                      isLightMode ? 'text-slate-600' : 'text-slate-400'
                    }`}>
                      <Folder className="w-3.5 h-3.5 text-indigo-500" />
                      {t.pathsTitle}
                    </span>
                    <div className="space-y-1 text-[11px] font-mono">
                      <div className={`flex justify-between border-b pb-1 ${isLightMode ? 'border-slate-200' : 'border-white/5'}`}>
                        <span className={isLightMode ? 'text-slate-500' : 'text-slate-400'}>Stack Config:</span>
                        <span className="text-indigo-600 dark:text-indigo-300">/etc/matrix_stack_config.env</span>
                      </div>
                      <div className={`flex justify-between border-b pb-1 ${isLightMode ? 'border-slate-200' : 'border-white/5'}`}>
                        <span className={isLightMode ? 'text-slate-500' : 'text-slate-400'}>Install Log:</span>
                        <span className="text-indigo-600 dark:text-indigo-300">/var/log/matrix_stack_install.log</span>
                      </div>
                      <div className={`flex justify-between border-b pb-1 ${isLightMode ? 'border-slate-200' : 'border-white/5'}`}>
                        <span className={isLightMode ? 'text-slate-500' : 'text-slate-400'}>Synapse Config:</span>
                        <span className="text-indigo-600 dark:text-indigo-300">/etc/matrix-synapse/</span>
                      </div>
                      <div className={`flex justify-between border-b pb-1 ${isLightMode ? 'border-slate-200' : 'border-white/5'}`}>
                        <span className={isLightMode ? 'text-slate-500' : 'text-slate-400'}>Element Client:</span>
                        <span className="text-indigo-600 dark:text-indigo-300">/var/www/element/</span>
                      </div>
                      <div className="flex justify-between">
                        <span className={isLightMode ? 'text-slate-500' : 'text-slate-400'}>Backups Dir:</span>
                        <span className="text-indigo-600 dark:text-indigo-300">/root/matrix-backups/</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div ref={terminalEndRef} />
            </div>
          ) : activeTab === 'updates' ? (
            <div className="space-y-4 font-sans text-xs">
              {/* Header inside console */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-2xl bg-white/5 border border-white/5">
                <div>
                  <h3 className="font-bold text-sm text-gray-100 flex items-center gap-2">
                    <RefreshCw className={`h-4 w-4 text-indigo-400 ${isCheckingUpdate ? 'animate-spin' : ''}`} />
                    <span>{t.updateControl}</span>
                    <span className="px-2.5 py-0.5 rounded-full text-[11px] font-mono font-bold bg-purple-500/20 text-purple-300 border border-purple-500/30 flex items-center gap-1">
                      <Tag className="h-3 w-3" />
                      <span>v{PANEL_VERSION}</span>
                    </span>
                  </h3>
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    {isRtl ? 'نسخه فعال پنل:' : 'Current Panel Version:'}{' '}
                    <span className="font-mono text-indigo-400 font-semibold">v{PANEL_VERSION} ({PANEL_BUILD_DATE})</span>
                    {currentVersion && <span className="ml-2 text-slate-500 font-mono">[{currentVersion.substring(0, 7)}]</span>}
                  </p>
                </div>

                <div className="flex flex-wrap items-center gap-2 shrink-0">
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleImportBackup}
                    accept=".json"
                    className="hidden"
                  />
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={isImportingBackup}
                    className="flex items-center justify-center gap-1.5 py-2 px-3.5 rounded-xl text-xs font-bold border border-teal-500/30 bg-teal-500/10 hover:bg-teal-500/20 text-teal-300 transition-all cursor-pointer"
                    title={isRtl ? 'ایمپورت و بازیابی بک‌آپ JSON' : 'Import JSON Backup'}
                  >
                    {isImportingBackup ? <RefreshCw className="h-3.5 w-3.5 animate-spin" /> : <Upload className="h-3.5 w-3.5" />}
                    <span>{isRtl ? 'ایمپورت بک‌آپ' : 'Import Backup'}</span>
                  </button>

                  <button
                    type="button"
                    disabled={isCheckingUpdate || isApplyingUpdate}
                    onClick={checkSystemUpdates}
                    className={`flex items-center justify-center gap-1.5 py-2 px-3.5 rounded-xl text-xs font-bold border transition-all duration-200 ${
                      isCheckingUpdate 
                        ? isLightMode
                          ? 'bg-purple-100 text-purple-700 border-purple-300 cursor-wait shadow-sm'
                          : 'bg-purple-600/25 text-purple-300 border-purple-500/40 cursor-wait'
                        : isLightMode
                          ? 'border-slate-300 bg-slate-100 hover:bg-slate-200 text-slate-800 active:scale-[0.99] cursor-pointer shadow-sm'
                          : 'border-white/10 bg-white/5 hover:bg-white/10 text-gray-200 active:scale-[0.99] cursor-pointer'
                    }`}
                  >
                    <RefreshCw className={`h-3.5 w-3.5 ${isCheckingUpdate ? 'animate-spin' : ''}`} />
                    <span>{t.checkUpdates}</span>
                  </button>

                  <button
                    type="button"
                    disabled={isCheckingUpdate || isApplyingUpdate || isViewer || !updateAvailable}
                    onClick={applySystemUpdates}
                    className={`flex items-center justify-center gap-1.5 py-2 px-3.5 rounded-xl text-xs font-bold border transition-all duration-200 ${
                      isApplyingUpdate 
                        ? 'bg-gradient-to-r from-purple-600 via-indigo-600 to-purple-700 text-white border-purple-400 opacity-90 cursor-wait shadow-lg shadow-purple-500/30 animate-pulse font-extrabold'
                        : isViewer || !updateAvailable
                          ? isLightMode
                            ? 'border-slate-200 bg-slate-100 text-slate-400 cursor-not-allowed'
                            : 'border-white/5 bg-white/5 text-gray-500 cursor-not-allowed'
                          : 'bg-gradient-to-r from-purple-600 via-indigo-600 to-purple-700 text-white border-purple-400 hover:brightness-110 active:scale-[0.99] shadow-lg shadow-purple-500/30 cursor-pointer font-extrabold'
                    }`}
                  >
                    {isApplyingUpdate ? (
                      <RefreshCw className="h-3.5 w-3.5 animate-spin" />
                    ) : (
                      <Download className="h-3.5 w-3.5" />
                    )}
                    <span>{t.installUpdate}</span>
                  </button>
                </div>
              </div>

              {/* Status Banner */}
              {updateAvailable ? (
                <div className={`p-4 rounded-2xl border flex flex-col gap-2.5 shadow-lg ${
                  isLightMode
                    ? 'bg-slate-100 border-slate-300 text-slate-800 shadow-slate-200'
                    : 'bg-gradient-to-r from-purple-700 via-indigo-700 to-purple-800 border-purple-400 text-white shadow-purple-500/20'
                }`}>
                  <div className="flex items-start gap-2.5">
                    <span className="relative flex h-2.5 w-2.5 mt-1 shrink-0">
                      <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${
                        isLightMode ? 'bg-indigo-600' : 'bg-white'
                      }`}></span>
                      <span className={`relative inline-flex rounded-full h-2.5 w-2.5 ${
                        isLightMode ? 'bg-indigo-600' : 'bg-white'
                      }`}></span>
                    </span>
                    <div>
                      <span className={`font-extrabold text-sm block tracking-wide ${
                        isLightMode ? 'text-slate-900' : 'text-white'
                      }`}>
                        {t.newUpdateAvailable}
                      </span>
                      <p className={`text-xs leading-relaxed mt-0.5 font-medium ${
                        isLightMode ? 'text-slate-700' : 'text-purple-100'
                      }`}>
                        {t.updateAvailableDesc(commitsBehind)}
                      </p>
                    </div>
                  </div>

                  {latestCommits && latestCommits.length > 0 && (
                    <div className={`mt-1 p-3 rounded-xl font-mono text-[11px] whitespace-pre-wrap leading-normal text-left ltr border ${
                      isLightMode
                        ? 'bg-slate-200/90 border-slate-300 text-slate-900 font-semibold'
                        : 'bg-black/40 border-white/20 text-white'
                    }`}>
                      <span className={`font-sans font-extrabold block mb-1 text-[10px] uppercase tracking-wider ${
                        isLightMode ? 'text-indigo-800' : 'text-purple-200'
                      }`}>
                        {t.latestChanges}
                      </span>
                      <span className={isLightMode ? 'text-slate-900' : 'text-white'}>
                        {latestCommits[0]}
                      </span>
                    </div>
                  )}
                </div>
              ) : (
                <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 flex items-start gap-2.5">
                  <span className="h-2 w-2 rounded-full bg-emerald-500 mt-1 shrink-0"></span>
                  <div>
                    <span className="font-bold text-xs block">
                      {t.systemUpToDate}
                    </span>
                    <p className="text-[11px] leading-relaxed mt-0.5 text-slate-400">
                      {t.systemUpToDateDesc}
                    </p>
                  </div>
                </div>
              )}

              {/* Console log box (Moved ABOVE Version History Catalog) */}
              <div className="flex flex-col h-[260px] rounded-xl border border-white/5 bg-black/40 overflow-hidden shadow-sm">
                <div className="flex items-center justify-between border-b border-white/5 px-4 py-2 bg-black/20">
                  <span className="font-mono text-[10px] text-gray-400 font-bold">git-updater@matrix-panel:~</span>
                  <button 
                    type="button"
                    onClick={() => {
                      setUpdateLogs([
                        '# Console logs cleared.',
                        '# Click "Check for Updates" to retrieve current status.'
                      ]);
                    }}
                    className="text-[9px] text-gray-500 hover:text-gray-300 font-semibold uppercase px-1.5 py-0.5 rounded border border-white/5 hover:border-white/10 transition-all font-mono cursor-pointer"
                  >
                    Clear
                  </button>
                </div>

                <div className="flex-1 p-4 overflow-y-auto font-mono text-[11px] leading-relaxed space-y-1 select-text text-left ltr scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent">
                  {updateLogs.map((log, idx) => (
                    <div 
                      key={idx} 
                      className={`${
                        log.startsWith('[ERR]') 
                          ? 'text-red-400 font-bold' 
                          : log.startsWith('[✓]') 
                            ? 'text-emerald-400 font-bold'
                            : log.startsWith('[!]')
                              ? 'text-amber-400 font-bold animate-pulse'
                              : log.startsWith('#') 
                                ? 'text-cyan-400 font-bold' 
                                : log.startsWith('>') 
                                  ? 'text-indigo-300 font-semibold' 
                                  : 'text-gray-300'
                      }`}
                    >
                      {log}
                    </div>
                  ))}
                </div>
              </div>

              {/* Version History & Release Notes Panel (Now BELOW Console Log Box) */}
              <div className={`p-4 rounded-xl border shadow-md space-y-3 ${
                isLightMode ? 'bg-slate-900 border-slate-800 text-white' : 'bg-black/30 border-white/5 text-white'
              }`}>
                <div className="flex items-center justify-between border-b border-white/10 pb-2.5">
                  <span className="font-extrabold text-xs text-white flex items-center gap-1.5 font-mono">
                    <Tag className="h-3.5 w-3.5 text-purple-400" />
                    <span className="text-white font-extrabold tracking-wide">{isRtl ? 'تاریخچه نسخه و بروزرسانی‌های پنل' : 'Panel Version Changelog & Release History'}</span>
                  </span>
                  <span className="text-xs text-white font-mono font-extrabold tracking-wide">
                    Build Date: {PANEL_BUILD_DATE}
                  </span>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  {VERSION_HISTORY.map((vh, idx) => (
                    <div 
                      key={idx}
                      className={`p-3 rounded-xl border flex flex-col justify-between ${
                        vh.version === PANEL_VERSION 
                          ? 'bg-gradient-to-r from-purple-800 to-indigo-800 border-purple-400 text-white shadow-md' 
                          : 'bg-white/5 border-white/5 text-gray-300'
                      }`}
                    >
                      <div>
                        <div className="flex items-center justify-between mb-1">
                          <span className={`font-mono font-bold text-xs ${vh.version === PANEL_VERSION ? 'text-white' : 'text-indigo-300'}`}>v{vh.version}</span>
                          <span className={`text-[10px] font-mono ${vh.version === PANEL_VERSION ? 'text-purple-200' : 'text-gray-400'}`}>{vh.date}</span>
                        </div>
                        <span className={`font-semibold text-xs block mb-1 ${vh.version === PANEL_VERSION ? 'text-white' : 'text-gray-200'}`}>{vh.title}</span>
                        <ul className={`text-[11px] space-y-1 list-disc list-inside ${vh.version === PANEL_VERSION ? 'text-purple-100' : 'text-gray-400'}`}>
                          {vh.changes.map((c, i) => (
                            <li key={i} className="truncate">{c}</li>
                          ))}
                        </ul>
                      </div>
                      {vh.version === PANEL_VERSION && (
                        <span className="mt-2 text-[10px] font-mono font-bold text-emerald-300 flex items-center gap-1">
                          <Check className="h-3 w-3" />
                          <span>{isRtl ? 'نسخه فعلی' : 'Current Active'}</span>
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-4 font-sans text-xs">
              {/* Top Banner Header */}
              <div className={`flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-2xl border transition-colors ${
                isLightMode ? 'bg-white border-slate-200 shadow-sm' : 'bg-white/5 border-white/5'
              }`}>
                <div>
                  <h3 className={`font-bold text-sm flex items-center gap-2 ${
                    isLightMode ? 'text-slate-900' : 'text-gray-100'
                  }`}>
                    <RefreshCw className={`h-4 w-4 text-emerald-500 ${isEsUpdating ? 'animate-spin' : ''}`} />
                    <span>{isRtl ? 'مدیریت بروزرسانی المنت وب (Update Element Web)' : 'Update Element Web'}</span>
                    <span className="px-2.5 py-0.5 rounded-full text-[11px] font-mono font-bold bg-emerald-500/20 text-emerald-600 dark:text-emerald-300 border border-emerald-500/30 flex items-center gap-1">
                      <Globe className="h-3 w-3" />
                      <span>Element Web</span>
                    </span>
                  </h3>
                  <p className={`text-[11px] mt-0.5 ${
                    isLightMode ? 'text-slate-500' : 'text-slate-400'
                  }`}>
                    {isRtl 
                      ? 'بروزرسانی آنلاین کلاینت المنت از گیت‌هاب رسمی یا نصب دستی پکیج آفلاین' 
                      : 'Update Element Web client from official GitHub releases or deploy manual offline packages'}
                  </p>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <button
                    type="button"
                    onClick={() => {
                      fetchEsVersions();
                      showToast('success', isRtl ? 'وضعیت نسخه‌ها بروزرسانی شد' : 'Versions refreshed');
                    }}
                    className={`flex items-center justify-center gap-1.5 py-2 px-3.5 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                      isLightMode
                        ? 'border-slate-300 bg-slate-100 hover:bg-slate-200 text-slate-800 shadow-sm'
                        : 'border-white/10 bg-white/5 hover:bg-white/10 text-gray-200'
                    }`}
                  >
                    <RefreshCw className="h-3.5 w-3.5" />
                    <span>{isRtl ? 'بررسی مجدد نسخه' : 'Check Version'}</span>
                  </button>
                </div>
              </div>

              {/* Version Comparison Card */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Element Card */}
                <div className={`p-4 rounded-2xl border flex flex-col justify-between space-y-3 transition-colors ${
                  isLightMode ? 'bg-white border-slate-200 shadow-sm' : 'bg-white/5 border-white/10'
                }`}>
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-2.5">
                      <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-500 dark:text-emerald-400 border border-emerald-500/20">
                        <Globe className="w-5 h-5" />
                      </div>
                      <div>
                        <h4 className={`font-bold text-xs ${isLightMode ? 'text-slate-900' : 'text-white'}`}>Element Web</h4>
                        <p className={`text-[11px] ${isLightMode ? 'text-slate-500' : 'text-slate-400'}`}>Matrix Web Client Interface</p>
                      </div>
                    </div>
                    {esVersions.elementHasUpdate ? (
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/20 text-amber-600 dark:text-amber-300 border border-amber-500/30 animate-pulse">
                        {isRtl ? `آپدیت موجود: ${esVersions.elementLatestVersion}` : `Update: ${esVersions.elementLatestVersion}`}
                      </span>
                    ) : (
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                        {isRtl ? 'بروز است' : 'Up to date'}
                      </span>
                    )}
                  </div>

                  <div className={`flex items-center justify-between font-mono p-2.5 rounded-xl border ${
                    isLightMode ? 'bg-slate-100 border-slate-200' : 'bg-black/40 border-white/5'
                  }`}>
                    <span className={isLightMode ? 'text-slate-600' : 'text-slate-400'}>{isRtl ? 'نسخه سرور فعلی:' : 'Installed:'}</span>
                    <span className={`font-bold text-sm ${isLightMode ? 'text-slate-900' : 'text-white'}`}>{esVersions.elementVersion || '—'}</span>
                  </div>
                </div>

                {/* Synapse Info Card */}
                <div className={`p-4 rounded-2xl border flex flex-col justify-between space-y-3 transition-colors ${
                  isLightMode ? 'bg-white border-slate-200 shadow-sm' : 'bg-white/5 border-white/10'
                }`}>
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-2.5">
                      <div className="p-2 rounded-xl bg-purple-500/10 text-purple-500 dark:text-purple-400 border border-purple-500/20">
                        <Server className="w-5 h-5" />
                      </div>
                      <div>
                        <h4 className={`font-bold text-xs ${isLightMode ? 'text-slate-900' : 'text-white'}`}>Synapse Server</h4>
                        <p className={`text-[11px] ${isLightMode ? 'text-slate-500' : 'text-slate-400'}`}>Matrix Core Homeserver Engine</p>
                      </div>
                    </div>
                    {esVersions.synapseHasUpdate ? (
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-purple-500/20 text-purple-600 dark:text-purple-300 border border-purple-500/30">
                        {isRtl ? `نسخه جدید: ${esVersions.synapseLatestVersion}` : `Latest: ${esVersions.synapseLatestVersion}`}
                      </span>
                    ) : (
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                        {isRtl ? 'بروز است' : 'Up to date'}
                      </span>
                    )}
                  </div>

                  <div className={`flex items-center justify-between font-mono p-2.5 rounded-xl border ${
                    isLightMode ? 'bg-slate-100 border-slate-200' : 'bg-black/40 border-white/5'
                  }`}>
                    <span className={isLightMode ? 'text-slate-600' : 'text-slate-400'}>{isRtl ? 'نسخه سرور فعلی:' : 'Installed:'}</span>
                    <span className={`font-bold text-sm ${isLightMode ? 'text-slate-900' : 'text-white'}`}>{esVersions.synapseVersion || '—'}</span>
                  </div>
                </div>
              </div>

              {/* Update Configuration & Execution Panel */}
              <div className={`p-4 rounded-2xl border space-y-4 transition-colors ${
                isLightMode ? 'bg-white border-slate-200 shadow-sm' : 'bg-white/5 border-white/10'
              }`}>
                {/* Element Web Update Method */}
                <div className={`p-4 rounded-xl border space-y-3.5 ${
                  isLightMode ? 'bg-slate-50 border-slate-200' : 'bg-black/40 border-white/10'
                }`}>
                  <div className={`flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b pb-3 ${
                    isLightMode ? 'border-slate-200' : 'border-white/5'
                  }`}>
                    <div>
                      <h5 className={`font-bold text-xs flex items-center gap-2 ${
                        isLightMode ? 'text-slate-900' : 'text-white'
                      }`}>
                        <Globe className="w-4 h-4 text-emerald-500 dark:text-emerald-400" />
                        <span>{isRtl ? 'روش بروزرسانی المنت وب (Element Web)' : 'Element Web Deployment Method'}</span>
                      </h5>
                      <p className={`text-[11px] mt-0.5 ${
                        isLightMode ? 'text-slate-500' : 'text-slate-400'
                      }`}>
                        {isRtl ? 'انتخاب بروزرسانی خودکار و آنلاین از گیت‌هاب یا آپلود و نصب پکیج آفلاین (حالت manual)' : 'Select online download from GitHub releases or manual package upload & deployment'}
                      </p>
                    </div>

                    {/* Mode Toggle Tabs */}
                    <div className={`flex items-center p-1 rounded-xl border shrink-0 ${
                      isLightMode ? 'bg-slate-200/80 border-slate-300' : 'bg-black/60 border-white/10'
                    }`}>
                      <button
                        type="button"
                        onClick={() => setElementUpdateMode('auto')}
                        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                          elementUpdateMode === 'auto'
                            ? 'bg-emerald-500 text-white shadow'
                            : isLightMode ? 'text-slate-600 hover:text-slate-900' : 'text-slate-400 hover:text-white'
                        }`}
                      >
                        <Download className="w-3.5 h-3.5" />
                        <span>{isRtl ? 'آنلاین (GitHub Release)' : 'Auto (GitHub Release)'}</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => setElementUpdateMode('manual')}
                        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                          elementUpdateMode === 'manual'
                            ? 'bg-emerald-500 text-white shadow'
                            : isLightMode ? 'text-slate-600 hover:text-slate-900' : 'text-slate-400 hover:text-white'
                        }`}
                      >
                        <Upload className="w-3.5 h-3.5" />
                        <span>{isRtl ? 'حالت manual (آپلود پکیج)' : 'Manual Mode (Package Upload)'}</span>
                      </button>
                    </div>
                  </div>

                  {/* Manual Mode Sub-Panel */}
                  {elementUpdateMode === 'manual' && (
                    <div className="space-y-3 pt-1">
                      {/* Server Storage Info Header */}
                      <div className={`flex flex-wrap items-center justify-between gap-2 p-2.5 rounded-xl border ${
                        isLightMode 
                          ? 'bg-emerald-50 border-emerald-200 text-emerald-800' 
                          : 'bg-emerald-500/10 border-emerald-500/20 text-emerald-200'
                      }`}>
                        <div className="flex items-center gap-2 text-xs font-mono">
                          <Folder className="w-4 h-4 text-emerald-500 dark:text-emerald-400 shrink-0" />
                          <span>{isRtl ? 'مسیر ذخیره‌سازی پکیج‌ها در سرور:' : 'Server Package Path:'}</span>
                          <span className={`font-bold px-2 py-0.5 rounded border font-mono ${
                            isLightMode ? 'bg-white text-emerald-900 border-emerald-300' : 'text-white bg-black/50 border-white/10'
                          }`}>{activeRepoDir}</span>
                        </div>
                        <button
                          type="button"
                          onClick={fetchManualPackages}
                          disabled={isFetchingPackages}
                          className={`flex items-center gap-1 text-[11px] font-bold px-2.5 py-1 rounded-lg border transition-all cursor-pointer ${
                            isLightMode 
                              ? 'bg-emerald-100 hover:bg-emerald-200 text-emerald-800 border-emerald-300' 
                              : 'bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border-emerald-500/30'
                          }`}
                        >
                          <RefreshCw className={`w-3 h-3 ${isFetchingPackages ? 'animate-spin' : ''}`} />
                          <span>{isRtl ? 'اسکن مجدد سرور' : 'Rescan Packages'}</span>
                        </button>
                      </div>

                      {/* Existing Server Packages Detected */}
                      {manualPackages.length > 0 ? (
                        <div className="space-y-2">
                          <label className={`text-[11px] font-bold block ${
                            isLightMode ? 'text-slate-700' : 'text-slate-300'
                          }`}>
                            {isRtl 
                              ? 'پکیج‌های موجود شناسایی‌شده در سرور (انتخاب جهت نصب):' 
                              : 'Detected existing Element packages on server (Select one to deploy):'}
                          </label>
                          <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
                            {manualPackages.map((pkg) => (
                              <div
                                key={pkg.path}
                                onClick={() => setSelectedManualPackage(pkg.path)}
                                className={`p-2.5 rounded-xl border cursor-pointer transition-all flex items-center justify-between gap-3 ${
                                  selectedManualPackage === pkg.path
                                    ? isLightMode
                                      ? 'bg-emerald-100 border-emerald-500 ring-1 ring-emerald-500/40 text-emerald-950'
                                      : 'bg-emerald-500/20 border-emerald-500/60 ring-1 ring-emerald-500/40 text-white'
                                    : isLightMode
                                      ? 'bg-white border-slate-200 text-slate-700 hover:bg-slate-100'
                                      : 'bg-black/40 border-white/5 text-slate-300 hover:bg-white/5'
                                }`}
                              >
                                <div className="flex items-center gap-2.5 min-w-0">
                                  <input
                                    type="radio"
                                    name="manualPkg"
                                    checked={selectedManualPackage === pkg.path}
                                    onChange={() => setSelectedManualPackage(pkg.path)}
                                    className="accent-emerald-500 cursor-pointer shrink-0"
                                  />
                                  <div className="truncate">
                                    <span className={`font-mono font-bold text-xs block truncate ${
                                      isLightMode ? 'text-slate-900' : 'text-white'
                                    }`}>{pkg.filename}</span>
                                    <span className={`text-[10px] font-mono block mt-0.5 ${
                                      isLightMode ? 'text-slate-500' : 'text-slate-400'
                                    }`}>{pkg.path}</span>
                                  </div>
                                </div>
                                <div className="text-right shrink-0">
                                  <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold border block ${
                                    isLightMode 
                                      ? 'bg-emerald-50 text-emerald-800 border-emerald-200' 
                                      : 'bg-white/10 text-emerald-300 border-white/10'
                                  }`}>
                                    {pkg.sizeFormatted}
                                  </span>
                                  <span className={`text-[10px] block mt-0.5 ${
                                    isLightMode ? 'text-slate-500' : 'text-slate-400'
                                  }`}>{pkg.modifiedAt}</span>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      ) : (
                        <div className={`p-3 rounded-xl border text-xs flex items-center gap-2 ${
                          isLightMode ? 'bg-slate-100 border-slate-200 text-slate-600' : 'bg-white/5 border-white/5 text-slate-400'
                        }`}>
                          <Info className="w-4 h-4 shrink-0" />
                          <span>
                            {isRtl 
                              ? `هیچ پکیج قبلی در مسیر ${activeRepoDir} یافت نشد. می‌توانید پکیج جدید خود را آپلود کنید.` 
                              : `No existing Element packages found in ${activeRepoDir}. Upload a new release package below.`}
                          </span>
                        </div>
                      )}

                      {/* File Upload Dropzone / Box */}
                      <div className={`border-2 border-dashed rounded-xl p-4 transition-all text-center space-y-2 ${
                        isLightMode
                          ? 'border-slate-300 hover:border-emerald-500 bg-white'
                          : 'border-white/15 hover:border-emerald-500/50 bg-black/20'
                      }`}>
                        <Upload className="w-6 h-6 text-emerald-500 dark:text-emerald-400 mx-auto" />
                        <div>
                          <p className={`text-xs font-bold ${
                            isLightMode ? 'text-slate-800' : 'text-slate-200'
                          }`}>
                            {isRtl ? 'آپلود فایل جدید Element Web (.tar.gz یا .zip)' : 'Upload New Element Web Package (.tar.gz or .zip)'}
                          </p>
                          <p className={`text-[10px] mt-0.5 ${
                            isLightMode ? 'text-slate-500' : 'text-slate-400'
                          }`}>
                            {isRtl ? `فایل را اینجا بکشید یا انتخاب کنید تا در مسیر ${activeRepoDir} قرار گیرد` : `Drag file here or click to browse and store in ${activeRepoDir}`}
                          </p>
                        </div>
                        <input
                          type="file"
                          accept=".tar.gz,.tgz,.zip"
                          id="manual-element-upload-input"
                          className="hidden"
                          onChange={(e) => {
                            if (e.target.files && e.target.files[0]) {
                              handleUploadElementPackage(e.target.files[0]);
                            }
                          }}
                        />
                        <button
                          type="button"
                          onClick={() => document.getElementById('manual-element-upload-input')?.click()}
                          disabled={isUploadingPackage}
                          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-xs transition-all cursor-pointer shadow disabled:opacity-50"
                        >
                          <Upload className={`w-3.5 h-3.5 ${isUploadingPackage ? 'animate-bounce' : ''}`} />
                          <span>
                            {isUploadingPackage 
                              ? (isRtl ? `در حال آپلود... (${uploadProgress}%)` : `Uploading... (${uploadProgress}%)`)
                              : (isRtl ? 'انتخاب و آپلود پکیج' : 'Select & Upload Package')}
                          </span>
                        </button>

                        {/* Progress Bar */}
                        {isUploadingPackage && (
                          <div className={`w-full rounded-full h-2 overflow-hidden border mt-2 ${
                            isLightMode ? 'bg-slate-200 border-slate-300' : 'bg-black/60 border-white/10'
                          }`}>
                            <div
                              className="bg-emerald-500 h-full transition-all duration-300"
                              style={{ width: `${uploadProgress}%` }}
                            />
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>

                {/* Submit Update Button */}
                <div className="flex justify-end pt-1">
                  <button
                    type="button"
                    disabled={isEsUpdating || userRole === 'Viewer'}
                    onClick={handleRunEsUpdate}
                    className="flex items-center justify-center gap-2 py-2.5 px-6 rounded-xl text-xs font-bold bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-700 hover:brightness-110 text-white shadow-lg shadow-emerald-500/25 transition-all cursor-pointer disabled:opacity-50"
                  >
                    {isEsUpdating ? (
                      <RefreshCw className="w-4 h-4 animate-spin" />
                    ) : (
                      <Play className="w-4 h-4 fill-white" />
                    )}
                    <span>
                      {isEsUpdating 
                        ? (isRtl ? 'در حال بروزرسانی...' : 'Updating...') 
                        : (isRtl ? 'شروع بروزرسانی المنت وب' : 'Start Element Update')}
                    </span>
                  </button>
                </div>
              </div>

              {/* Execution Log Stream */}
              <div className={`flex flex-col h-[230px] rounded-xl border overflow-hidden shadow-md transition-colors ${
                isLightMode 
                  ? 'border-slate-300 bg-white shadow-sm' 
                  : 'border-slate-800 bg-slate-950'
              }`}>
                <div className={`flex items-center justify-between border-b px-4 py-2 transition-colors ${
                  isLightMode 
                    ? 'border-slate-200 bg-slate-100' 
                    : 'border-slate-800/80 bg-slate-900'
                }`}>
                  <span className={`font-mono text-[11px] font-bold ${
                    isLightMode ? 'text-emerald-700' : 'text-emerald-400'
                  }`}>element-updater@matrix:~</span>
                  <button 
                    type="button"
                    onClick={() => setEsLogs([isRtl ? '# تاریخچه لاگ‌ها پاکسازی شد.' : '# Console logs cleared.'])}
                    className={`text-[9px] font-semibold uppercase px-2 py-0.5 rounded border transition-all font-mono cursor-pointer ${
                      isLightMode
                        ? 'text-slate-600 hover:text-slate-900 border-slate-300 hover:border-slate-400 bg-white hover:bg-slate-50'
                        : 'text-emerald-400 hover:text-emerald-200 border-emerald-500/30 hover:border-emerald-500/60 bg-emerald-500/10 hover:bg-emerald-500/20'
                    }`}
                  >
                    {isRtl ? 'پاکسازی' : 'Clear'}
                  </button>
                </div>
                <div className={`flex-1 p-3 overflow-y-auto font-mono text-[11px] leading-relaxed space-y-1 select-text text-left ltr transition-colors ${
                  isLightMode ? 'bg-slate-50 text-slate-800' : 'bg-slate-950 text-slate-100'
                }`}>
                  {esLogs.map((log, idx) => (
                    <div 
                      key={idx}
                      className={
                        log.startsWith('[ERR]') 
                          ? isLightMode ? 'text-rose-700 font-bold' : 'text-red-400 font-bold' 
                          : log.startsWith('[SUCCESS]') 
                            ? isLightMode ? 'text-emerald-700 font-bold' : 'text-emerald-400 font-bold'
                            : log.startsWith('[BACKUP]')
                              ? isLightMode ? 'text-amber-800 font-semibold' : 'text-amber-300 font-semibold'
                              : log.startsWith('[ELEMENT]') || log.startsWith('[SYNAPSE]')
                                ? isLightMode ? 'text-blue-700 font-medium' : 'text-cyan-300 font-medium'
                                : log.startsWith('[TASK]') || log.startsWith('[INIT]') || log.startsWith('[ROLLBACK]')
                                  ? isLightMode ? 'text-indigo-700 font-semibold' : 'text-indigo-300 font-semibold'
                                  : log.startsWith('#')
                                    ? isLightMode ? 'text-slate-500 font-medium' : 'text-emerald-500 font-medium'
                                    : isLightMode ? 'text-slate-700 font-medium' : 'text-emerald-300 font-medium'
                      }
                    >
                      {log}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Terminal Input Bar */}
        <form onSubmit={handleCustomSubmit} className={`p-3 border-t flex items-center gap-3 transition-colors ${
          isLightMode ? 'bg-slate-100/90 border-slate-200' : 'bg-black/40 border-white/5'
        }`}>
          <span className={`font-mono text-xs pl-2 select-none ${
            isLightMode ? 'text-indigo-700 font-bold' : 'text-indigo-400'
          }`}>root@matrix-node:~#</span>
          <input
            type="text"
            value={customInput}
            onChange={(e) => setCustomInput(e.target.value)}
            disabled={isExecuting || isViewer}
            placeholder={
              isViewer 
                ? t.unauthorizedViewer
                : t.inputPlaceholder
            }
            className={`flex-1 bg-transparent font-mono text-xs outline-none border-none focus:ring-0 disabled:opacity-50 ${
              isLightMode ? 'text-slate-900 placeholder:text-slate-400' : 'text-slate-100 placeholder:text-slate-600'
            }`}
            id="terminal-input"
          />
          <button 
            type="submit" 
            disabled={isExecuting || isViewer || !customInput.trim()}
            className={`p-1.5 rounded-lg border disabled:opacity-40 cursor-pointer transition-colors ${
              isLightMode
                ? 'bg-rose-100 text-rose-700 border-rose-200 hover:bg-rose-200'
                : 'bg-rose-500/10 text-rose-400 border-rose-500/10 hover:bg-rose-500/20'
            }`}
          >
            <ArrowUpRight className="w-4 h-4" />
          </button>
        </form>
      </div>

      {/* Panel Update & Data Protection Confirmation Modal */}
      {showUpdateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
          <div className={`border rounded-3xl p-6 max-w-xl w-full shadow-2xl space-y-5 relative ltr text-left ${
            isLightMode ? 'bg-white border-purple-200 text-slate-800' : 'bg-slate-900 border-purple-500/30 text-white'
          }`}>
            <div className={`flex items-center justify-between border-b pb-4 ${
              isLightMode ? 'border-slate-200' : 'border-white/10'
            }`}>
              <div className="flex items-center gap-3">
                <div className={`p-3 rounded-2xl ${
                  isLightMode ? 'bg-purple-100 text-purple-700 border border-purple-200' : 'bg-purple-500/20 text-purple-400 border border-purple-500/30'
                }`}>
                  <RefreshCw className="w-6 h-6 animate-spin-slow" />
                </div>
                <div>
                  <h3 className={`text-base font-bold ${isLightMode ? 'text-slate-900' : 'text-white'}`}>
                    {isRtl ? 'مرکز بروزرسانی و صیانت از اطلاعات پنل' : 'Panel Update & Data Protection Center'}
                  </h3>
                  <p className={`text-xs ${isLightMode ? 'text-slate-500' : 'text-slate-400'}`}>
                    {isRtl ? 'بروزرسانی کامل پنل با حفظ تمامی حساب‌های کاربری و پروفایل‌های اتصال' : 'Full system update with guaranteed preservation of accounts and server profiles'}
                  </p>
                </div>
              </div>
              <button 
                onClick={() => setShowUpdateModal(false)}
                className={`p-1 rounded-lg transition-colors cursor-pointer ${
                  isLightMode ? 'text-slate-400 hover:text-slate-800 hover:bg-slate-100' : 'text-slate-400 hover:text-white hover:bg-white/10'
                }`}
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className={`p-3.5 rounded-2xl border space-y-2 ${
                isLightMode ? 'bg-indigo-50/80 border-indigo-200' : 'bg-indigo-500/10 border-indigo-500/20'
              }`}>
                <div className={`flex items-center gap-2 font-bold ${isLightMode ? 'text-indigo-900' : 'text-indigo-300'}`}>
                  <ShieldCheck className="w-4 h-4 text-emerald-500" />
                  <span>{isRtl ? 'تضمین عدم حذف اطلاعات و اکانت‌ها:' : 'Guaranteed Persistent Data Preservation:'}</span>
                </div>
                <ul className={`space-y-1.5 text-[11px] list-disc list-inside leading-relaxed ${
                  isLightMode ? 'text-slate-700' : 'text-slate-300'
                }`}>
                  <li>
                    <strong className={isLightMode ? 'text-purple-800' : 'text-purple-300'}>{isRtl ? 'حساب‌های کاربری و دسترسی‌ها:' : 'User Accounts & Roles:'}</strong> {isRtl ? 'تمامی یوزرها، پسوردها (هش bcrypt)، سطح دسترسی‌ها (مالک، سوپرادمین و ...) پیش از پاکسازی به /etc/matrix-manager-backup/panel_data.json منتقل و مجدداً بازیابی می‌شوند.' : 'All users, passwords (bcrypt hashes), and role permissions are automatically backed up to /etc/matrix-manager-backup/panel_data.json and restored.'}
                  </li>
                  <li>
                    <strong className={isLightMode ? 'text-purple-800' : 'text-purple-300'}>{isRtl ? 'پروفایل‌های اتصال سرورها:' : 'Server Connection Profiles:'}</strong> {isRtl ? 'کانکشن‌های تعریف شده سرورهای remote/vps در مسیر /etc/matrix-manager-backup/server_connections_backup.json ذخیره و صیانت می‌شوند.' : 'All configured remote VPS/SSH server profiles are preserved in /etc/matrix-manager-backup/server_connections_backup.json.'}
                  </li>
                  <li>
                    <strong className={isLightMode ? 'text-purple-800' : 'text-purple-300'}>{isRtl ? 'روش بروزرسانی:' : 'Execution Method:'}</strong> {isRtl ? 'اجرای کامل اسکریپت setup-panel.sh، دریافت آخرین کامیت‌های گیت، به‌روزرسانی وابستگی‌ها و کامپایل مجدد وب‌کنسول.' : 'Runs setup-panel.sh installer refresh, pulls latest commits, updates dependencies, and rebuilds web console.'}
                  </li>
                </ul>
              </div>

              {/* Backup Export / Import Card */}
              <div className={`p-3.5 rounded-2xl border flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                isLightMode ? 'bg-slate-50 border-slate-200' : 'bg-white/5 border-white/5'
              }`}>
                <div className="flex items-center gap-2.5">
                  <Download className="w-5 h-5 text-teal-500 shrink-0" />
                  <div>
                    <span className={`font-bold block text-xs ${isLightMode ? 'text-slate-900' : 'text-white'}`}>{isRtl ? 'مدیریت بک‌آپ پنل (دانلود / بازیابی JSON)' : 'Panel Backup Manager (Export / Restore JSON)'}</span>
                    <span className={`text-[10px] ${isLightMode ? 'text-slate-500' : 'text-slate-400'}`}>{isRtl ? 'دانلود یا بارگذاری نسخه پشتیبان کانکشن‌ها و حساب‌ها' : 'Export or upload/restore server profiles & user database'}</span>
                  </div>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <button
                    type="button"
                    onClick={downloadBackupExport}
                    disabled={isExportingBackup}
                    className={`px-3 py-1.5 rounded-xl border font-bold text-xs transition-all flex items-center gap-1.5 cursor-pointer ${
                      isLightMode 
                        ? 'bg-teal-50 hover:bg-teal-100 text-teal-800 border-teal-300' 
                        : 'bg-teal-500/20 hover:bg-teal-500/30 text-teal-300 border-teal-500/30'
                    }`}
                  >
                    {isExportingBackup ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Download className="w-3.5 h-3.5" />}
                    <span>{isRtl ? 'دانلود بک‌آپ' : 'Export JSON'}</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={isImportingBackup}
                    className={`px-3 py-1.5 rounded-xl border font-bold text-xs transition-all flex items-center gap-1.5 cursor-pointer ${
                      isLightMode
                        ? 'bg-purple-50 hover:bg-purple-100 text-purple-800 border-purple-300'
                        : 'bg-purple-500/20 hover:bg-purple-500/30 text-purple-300 border-purple-500/30'
                    }`}
                  >
                    {isImportingBackup ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Upload className="w-3.5 h-3.5" />}
                    <span>{isRtl ? 'ایمپورت بک‌آپ' : 'Import JSON'}</span>
                  </button>
                </div>
              </div>
            </div>

            <div className={`flex items-center justify-end gap-3 border-t pt-4 ${
              isLightMode ? 'border-slate-200' : 'border-white/10'
            }`}>
              <button
                type="button"
                onClick={() => setShowUpdateModal(false)}
                className={`px-4 py-2 rounded-xl font-bold text-xs transition-all cursor-pointer ${
                  isLightMode
                    ? 'text-slate-700 bg-slate-100 hover:bg-slate-200'
                    : 'text-slate-300 bg-white/5 hover:bg-white/10'
                }`}
              >
                {isRtl ? 'انصراف' : 'Cancel'}
              </button>
              <button
                type="button"
                onClick={executeUpdateFlow}
                disabled={isApplyingUpdate}
                className="px-5 py-2 rounded-xl bg-gradient-to-r from-purple-600 via-indigo-600 to-purple-700 hover:brightness-110 text-white font-extrabold text-xs shadow-lg shadow-purple-500/30 transition-all flex items-center gap-2 cursor-pointer"
              >
                {isApplyingUpdate ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
                <span>{isRtl ? 'تایید و شروع بروزرسانی کامل' : 'Confirm & Start Full Update'}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
