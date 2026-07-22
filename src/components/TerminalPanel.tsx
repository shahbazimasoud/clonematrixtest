/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useRef, useState } from 'react';
import { 
  Terminal, Play, ShieldAlert, Circle, RefreshCw, Trash2, ArrowUpRight, 
  Download, Eye, FileText, Database, UserCheck, ShieldCheck, Globe, Key, 
  Folder, Copy, Check, Info, Lock
} from 'lucide-react';
import { MatrixConfig } from '../types';

interface TerminalPanelProps {
  logs: string[];
  isExecuting: boolean;
  onExecuteCommand: (command: string) => void;
  userRole: string;
  authToken: string | null;
  lang: 'en' | 'fa' | 'es' | 'ar' | 'de' | 'ru';
  isLightMode?: boolean;
  showToast: (type: 'success' | 'error', text: string) => void;
  initialTab?: 'console' | 'install' | 'updates';
  onTabChange?: (tab: 'console' | 'install' | 'updates') => void;
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
    inputPlaceholder: 'Type custom action (install, backup, workers, e2ee_disable) and press Enter...',
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
    inputPlaceholder: 'دستور مورد نظر را تایپ کنید (install, backup, workers, e2ee_disable)...',
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
    inputPlaceholder: 'Escriba una acción personalizada (install, backup, workers, e2ee_disable) y presione Enter...',
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
    inputPlaceholder: 'اكتب الأمر المخصص (install, backup, workers, e2ee_disable) واضغط Enter...',
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
    inputPlaceholder: 'Geben Sie eine benutzerdefinierte Aktion ein (install, backup, workers, e2ee_disable) und drücken Sie Enter...',
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
    inputPlaceholder: 'Введите команду (install, backup, workers, e2ee_disable) и нажмите Enter...',
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
  const terminalEndRef = useRef<HTMLDivElement>(null);
  const [activeTab, setActiveTab] = useState<'console' | 'install' | 'updates'>('console');
  const [showDbPass, setShowDbPass] = useState<boolean>(false);

  // Derive connection & config values matching option 8 -> 2 in matrix-installer.sh
  const hsDomain = config?.HS_DOMAIN || (activeConnection?.id !== 'local' && activeConnection?.host ? `matrix.${activeConnection?.host}` : 'matrix.company.local');
  const elementDomain = config?.ELEMENT_DOMAIN || (activeConnection?.id !== 'local' && activeConnection?.host ? `chat.${activeConnection?.host}` : 'chat.company.local');
  const baseDomain = config?.BASE_DOMAIN || (activeConnection?.id !== 'local' && activeConnection?.host ? activeConnection?.host : 'company.local');
  const publicIp = config?.PUBLIC_IP || (activeConnection?.id !== 'local' && activeConnection?.host ? activeConnection?.host : '127.0.0.1');
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

  const handleTabChange = (tab: 'console' | 'install' | 'updates') => {
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

  const isRtl = ['fa', 'ar'].includes(lang);
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
    terminalEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [logs]);

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
                isCheckingUpdate || isApplyingUpdate
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
      <div className="lg:col-span-2 spatial-glass rounded-3xl border border-white/5 flex flex-col h-full overflow-hidden" dir="ltr">
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
              type="button"
              onClick={() => handleTabChange('console')} 
              className={`text-xs px-3 py-1 rounded-md font-mono cursor-pointer ${activeTab === 'console' ? 'bg-white/10 text-white' : 'text-slate-400 hover:text-white'}`}
            >
              active-terminal
            </button>
            <button 
              type="button"
              onClick={() => handleTabChange('install')} 
              className={`text-xs px-3 py-1 rounded-md font-mono cursor-pointer ${activeTab === 'install' ? 'bg-white/10 text-white' : 'text-slate-400 hover:text-white'}`}
            >
              install.log
            </button>
            <button 
              type="button"
              onClick={() => handleTabChange('updates')} 
              className={`text-xs px-3 py-1 rounded-md font-mono flex items-center gap-1.5 cursor-pointer ${activeTab === 'updates' ? 'bg-white/10 text-white' : 'text-slate-400 hover:text-white'}`}
            >
              <RefreshCw className={`h-3 w-3 ${isCheckingUpdate ? 'animate-spin' : ''}`} />
              <span>panel-updates</span>
              {updateAvailable && (
                <span className="h-2 w-2 rounded-full bg-rose-500 animate-pulse" />
              )}
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
          ) : activeTab === 'install' ? (
            <div className={`space-y-6 font-sans ${isLightMode ? 'text-slate-800' : 'text-slate-300'}`}>
              {/* Terminal / Log Output Header */}
              <div className={`p-4 rounded-2xl border font-mono text-xs shadow-inner ${
                isLightMode ? 'bg-slate-900 border-slate-800 text-slate-100' : 'bg-slate-950/90 border-white/10 text-slate-200'
              }`}>
                <div className="flex items-center justify-between text-slate-400 border-b border-white/10 pb-2 mb-3">
                  <span className="flex items-center gap-2 text-emerald-400 font-semibold">
                    <FileText className="w-4 h-4" />
                    # Reading live installer log: /var/log/matrix_stack_install.log
                  </span>
                  <span className="text-[10px] text-slate-400">Matrix Installer Stack</span>
                </div>

                <div className="space-y-1 max-h-60 overflow-y-auto pr-2 scrollbar-thin">
                  {logs.length > 1 ? (
                    <>
                      {logs.map((log, index) => (
                        <div key={index} className="whitespace-pre-wrap font-mono">
                          {formatLogLine(log)}
                        </div>
                      ))}
                      {isExecuting && (
                        <div className="flex items-center gap-2 text-rose-400 mt-2">
                          <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                          <span>Streaming installation stdout/stderr in real-time...</span>
                        </div>
                      )}
                    </>
                  ) : (
                    <div className="space-y-1 text-slate-300">
                      <p>Initial preflight checks successfully completed.</p>
                      <p>Database setup finalized with Postgres user role.</p>
                      <p className="text-emerald-400">✅ Synapse package initialized and launched on port 8008.</p>
                      <p className="text-emerald-400">✅ Element Web client configured with SSL profiles.</p>
                      <p className="text-slate-500 mt-2 text-[11px] italic">💡 Tip: Run installation from wizard to view step-by-step live output here.</p>
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
          ) : (
            <div className="space-y-4 font-sans text-xs">
              {/* Header inside console */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-2xl bg-white/5 border border-white/5">
                <div>
                  <h3 className="font-bold text-sm text-gray-100 flex items-center gap-2">
                    <RefreshCw className={`h-4 w-4 text-indigo-400 ${isCheckingUpdate ? 'animate-spin' : ''}`} />
                    <span>{t.updateControl}</span>
                  </h3>
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    {t.currentInstalled}{' '}
                    <span className="font-mono text-indigo-400 font-semibold">{currentVersion || t.checking}</span>
                  </p>
                </div>

                <div className="flex gap-2 shrink-0">
                  <button
                    type="button"
                    disabled={isCheckingUpdate || isApplyingUpdate}
                    onClick={checkSystemUpdates}
                    className={`flex items-center justify-center gap-1.5 py-2 px-3.5 rounded-xl text-xs font-bold border transition-all duration-200 cursor-pointer ${
                      isCheckingUpdate 
                        ? 'bg-slate-800 text-slate-500 cursor-not-allowed border-transparent'
                        : 'border-white/10 bg-white/5 hover:bg-white/10 text-gray-200 active:scale-[0.99]'
                    }`}
                  >
                    <RefreshCw className={`h-3.5 w-3.5 ${isCheckingUpdate ? 'animate-spin' : ''}`} />
                    <span>{t.checkUpdates}</span>
                  </button>

                  <button
                    type="button"
                    disabled={isCheckingUpdate || isApplyingUpdate || isViewer}
                    onClick={applySystemUpdates}
                    className={`flex items-center justify-center gap-1.5 py-2 px-3.5 rounded-xl text-xs font-bold border transition-all duration-200 ${
                      isApplyingUpdate 
                        ? 'bg-slate-800 text-slate-500 cursor-not-allowed border-transparent'
                        : isViewer
                          ? 'border-red-500/10 text-red-400 bg-red-500/5 cursor-not-allowed'
                          : updateAvailable
                            ? 'bg-gradient-to-r from-rose-500 to-rose-600 text-white border-transparent hover:brightness-110 active:scale-[0.99] shadow-lg shadow-rose-500/20 cursor-pointer'
                            : 'border-white/5 bg-white/5 text-gray-500 cursor-not-allowed'
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
                <div className="p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-500 flex flex-col gap-2">
                  <div className="flex items-start gap-2.5">
                    <span className="relative flex h-2 w-2 mt-1 shrink-0">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-500"></span>
                    </span>
                    <div>
                      <span className="font-bold text-xs block text-amber-400">
                        {t.newUpdateAvailable}
                      </span>
                      <p className="text-[11px] leading-relaxed mt-0.5 text-slate-300">
                        {t.updateAvailableDesc(commitsBehind)}
                      </p>
                    </div>
                  </div>

                  {latestCommits && latestCommits.length > 0 && (
                    <div className="mt-1 p-2.5 rounded-lg bg-amber-500/5 border border-amber-500/10 font-mono text-[10px] text-amber-300/90 whitespace-pre-wrap leading-normal text-left ltr">
                      <span className="font-sans font-bold block text-amber-400 mb-1">
                        {t.latestChanges}
                      </span>
                      {latestCommits[0]}
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

              {/* Console log box */}
              <div className="flex flex-col h-[260px] rounded-xl border border-white/5 bg-black/40 overflow-hidden">
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
                ? t.unauthorizedViewer
                : t.inputPlaceholder
            }
            className="flex-1 bg-transparent text-slate-100 font-mono text-xs outline-none border-none focus:ring-0 placeholder:text-slate-600 disabled:opacity-50"
            id="terminal-input"
          />
          <button 
            type="submit" 
            disabled={isExecuting || isViewer || !customInput.trim()}
            className="p-1.5 rounded-lg bg-rose-500/10 text-rose-400 border border-rose-500/10 hover:bg-rose-500/20 disabled:opacity-40 cursor-pointer"
          >
            <ArrowUpRight className="w-4 h-4" />
          </button>
        </form>
      </div>
    </div>
  );
}
