import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  X, 
  ChevronRight, 
  ChevronLeft, 
  Server, 
  Terminal as TermIcon, 
  Database, 
  Cpu, 
  Users, 
  HelpCircle, 
  CheckCircle2, 
  ArrowRight,
  ExternalLink,
  Sparkles,
  BookOpen
} from 'lucide-react';

interface GuidedTourModalProps {
  isOpen: boolean;
  onClose: () => void;
  lang: 'fa' | 'en' | 'es' | 'ar' | 'de' | 'ru';
  isLightMode: boolean;
  onNavigateView: (view: string) => void;
}

export const GuidedTourModal: React.FC<GuidedTourModalProps> = ({
  isOpen,
  onClose,
  lang,
  isLightMode,
  onNavigateView
}) => {
  const [currentStep, setCurrentStep] = useState<number>(0);

  if (!isOpen) return null;

  const isRtl = lang === 'fa' || lang === 'ar';

  const translations = {
    fa: {
      tourTitle: 'راهنمای جامع پنل مدیریت ماتریکس',
      tourSub: 'گام‌های اصلی راه‌اندازی، اتصال سرور و مدیریت کامل ماتریکس',
      stepOf: (current: number, total: number) => `مرحله ${current} از ${total}`,
      btnNext: 'بعدی',
      btnPrev: 'قبلی',
      btnFinish: 'متوجه شدم (پایان راهنما)',
      btnSkip: 'بستن راهنما',
      btnJump: 'رفتن به این بخش',
      steps: [
        {
          title: '۱. ایجاد و پیکربندی ارتباط با سرور (Server Connections)',
          sub: 'نخستین گام: ثبت مشخصات سرور، SSH و دیتابیس',
          desc: 'برای شروع کار، ابتدا باید یک سرور به پنل معرفی کنید. در بخش «ارتباط با سرور» مشخصات IP، نام کاربری و رمزعبور/کلید SSH سرور را وارد نمایید. همچنین در صورت نصب بودن دیتابیس، مشخصات PostgreSQL را در این قسمت وارد و ذخیره می‌کنید.',
          view: 'connections',
          viewLabel: 'مشاهده ارتباط با سرور',
          icon: Server,
          color: 'from-blue-500 to-cyan-500'
        },
        {
          title: '۲. نصب پکیج ماتریکس و دستیار نصب (Web Console & Install Wizard)',
          sub: 'نصب آسان ماتریکس از طریق کنسول وب و مودال هوشمند نصب',
          desc: 'اگر ماتریکس یا Synapse هنوز روی سرور شما نصب نشده است، به قسمت «کنسول وب» رفته و روی «نصب مخزن استاندارد ماتریکس» کلیک کنید و از مودال بازشده موارد درخواستی را کامل کنید. پیش از شروع نصب، موارد زیر را آماده داشته باشید: مشخصات سرور (آدرس IP یا دامنه، نام کاربری و رمزعبور/کلید SSH)، اطلاعات دیتابیس PostgreSQL و ایمیل مدیرکل.',
          view: 'terminal',
          viewLabel: 'باز کردن کنسول وب و مودال نصب',
          icon: TermIcon,
          color: 'from-purple-500 to-indigo-500'
        },
        {
          title: '۳. اتصال دیتابیس و ثبت توکن ادمین ماتریکس (Database & Admin Token)',
          sub: 'اتصال کامل پنل به PostgreSQL و APIهای ماتریکس',
          desc: 'پس از پایان نصب، رمز دیتابیس را کپی کنید. ابتدا به «ارتباط با سرور» رفته و اطلاعات اتصال PostgreSQL را وارد کنید. سپس به «مدیریت کاربران» رفته، یک کاربر با دسترسی مدیرکل Synapse ثبت کنید. در نهایت به «ارتباط با سرور» بازگشته و توکن این کاربر را در قسمت Show Admin Token Settings ذخیره نمایید.',
          view: 'connections',
          viewLabel: 'تنظیم ارتباط با سرور و توکن',
          icon: Database,
          color: 'from-emerald-500 to-teal-500'
        },
        {
          title: '۴. تنظیمات هوم‌سرور (Homeserver Configuration)',
          sub: 'مدیریت حجم رسانه‌ها، ورکرها و قوانین امنیت',
          desc: 'در بخش «تنظیمات هوم‌سرور» می‌توانید حجم مجاز آپلود فایل‌ها، قوانین ثبت‌نام کاربران جدید، محدودیت نرخ درخواست‌ها (Rate Limiting)، تنظیمات فدراسیون و ورکرها را مدیریت و ذخیره کنید.',
          view: 'config',
          viewLabel: 'مشاهده تنظیمات هوم‌سرور',
          icon: Cpu,
          color: 'from-amber-500 to-orange-500'
        },
        {
          title: '۵. مدیریت کاربران، اتاق‌ها و گزارش‌ها (User & Room Management)',
          sub: 'کنترل اکانت‌ها، بررسی اتاق‌های ماتریکس و لاگ‌ها',
          desc: 'از طریق بخش «مدیریت کاربران» می‌توانید کاربران جدید بسازید، رمز عبور تغییر دهید، دسترسی ادمین اعطا یا لغو کنید، لیست تمام اتاق‌های عمومی و خصوصی ماتریکس را مشاهده کنید و گزارش‌های امنیتی سیستم را بررسی نمایید.',
          view: 'admin',
          viewLabel: 'مدیریت کاربران و اتاق‌ها',
          icon: Users,
          color: 'from-rose-500 to-pink-500'
        }
      ]
    },
    en: {
      tourTitle: 'Matrix Admin Panel Guided Tour',
      tourSub: 'Essential steps for server connection, stack installation, and management',
      stepOf: (current: number, total: number) => `Step ${current} of ${total}`,
      btnNext: 'Next',
      btnPrev: 'Previous',
      btnFinish: 'Got It (Finish Tour)',
      btnSkip: 'Close Tour',
      btnJump: 'Go to Section',
      steps: [
        {
          title: '1. Create & Manage Server Connections',
          sub: 'First Step: Add SSH & Server Profile Credentials',
          desc: 'To get started, first register or select a server connection profile under "Server Connections". Fill in your server IP, SSH port/credentials, and PostgreSQL connection parameters here.',
          view: 'connections',
          viewLabel: 'Open Server Connections',
          icon: Server,
          color: 'from-blue-500 to-cyan-500'
        },
        {
          title: '2. Matrix Stack Installation & Setup Wizard',
          sub: 'Easy Matrix Setup via Web Console & Smart Wizard Modal',
          desc: 'If Matrix/Synapse is not yet installed on your server, go to "Web Console", click "Install Standard Matrix Repository", and fill in the requested fields in the modal. Before starting, prepare the following: Server credentials (IP/Domain, SSH user & password/key), PostgreSQL DB info, and admin email.',
          view: 'terminal',
          viewLabel: 'Open Web Console & Install Wizard',
          icon: TermIcon,
          color: 'from-purple-500 to-indigo-500'
        },
        {
          title: '3. PostgreSQL Database Connection & Admin Token',
          sub: 'Connect Panel to Database and Matrix APIs',
          desc: 'After installation completes, copy the DB password. Go to "Server Connections" to enter PostgreSQL details. Then go to "User Management", register a Synapse Admin user, and return to Server Connections to save the token under "Show Admin Token Settings".',
          view: 'connections',
          viewLabel: 'Configure Connections & Tokens',
          icon: Database,
          color: 'from-emerald-500 to-teal-500'
        },
        {
          title: '4. Homeserver Configurations & Optimization',
          sub: 'Manage Media Upload Limits, Workers & Security Rules',
          desc: 'Under "Homeserver Configuration", easily set media upload limits, registration restrictions, rate limiting, federation rules, and worker processes.',
          view: 'config',
          viewLabel: 'Open Homeserver Settings',
          icon: Cpu,
          color: 'from-amber-500 to-orange-500'
        },
        {
          title: '5. User Management, Matrix Rooms & Audit Logs',
          sub: 'Control Accounts, Rooms, Aliases & Security Logs',
          desc: 'Use "User Management" to register new users, reset passwords, assign admin roles, inspect public/private Matrix rooms, and review system audit logs.',
          view: 'admin',
          viewLabel: 'Open User & Room Management',
          icon: Users,
          color: 'from-rose-500 to-pink-500'
        }
      ]
    },
    es: {
      tourTitle: 'Guía del Panel de Administración de Matrix',
      tourSub: 'Pasos esenciales para la conexión del servidor, instalación y gestión',
      stepOf: (current: number, total: number) => `Paso ${current} de ${total}`,
      btnNext: 'Siguiente',
      btnPrev: 'Anterior',
      btnFinish: 'Entendido (Finalizar)',
      btnSkip: 'Cerrar Guía',
      btnJump: 'Ir a esta Sección',
      steps: [
        {
          title: '1. Crear y gestionar conexiones del servidor',
          sub: 'Primer paso: agregar perfil de servidor y credenciales SSH',
          desc: 'Para comenzar, registre o seleccione un perfil de servidor en "Conexiones del Servidor". Ingrese la IP de su servidor, puerto/credenciales SSH y parámetros de conexión PostgreSQL.',
          view: 'connections',
          viewLabel: 'Abrir Conexiones del Servidor',
          icon: Server,
          color: 'from-blue-500 to-cyan-500'
        },
        {
          title: '2. Instalación del paquete Matrix y Asistente',
          sub: 'Configuración automatizada de Synapse, PostgreSQL y Element',
          desc: 'Si Matrix/Synapse aún no está instalado, vaya a "Terminal" o haga clic en el Asistente de Instalación. Ejecute la Opción 8 -> Opción 2 para instalar todo automáticamente.',
          view: 'terminal',
          viewLabel: 'Abrir Terminal y Asistente',
          icon: TermIcon,
          color: 'from-purple-500 to-indigo-500'
        },
        {
          title: '3. Conexión de PostgreSQL y Token de Administración',
          sub: 'Conecte el panel a la base de datos y a las API de Matrix',
          desc: 'Tras la instalación, copie la contraseña de la BD. Vaya a "Conexiones del Servidor" para ingresar los datos de PostgreSQL. Luego cree un usuario admin en "Gestión de Usuarios" y guarde su token.',
          view: 'connections',
          viewLabel: 'Configurar Conexiones y Token',
          icon: Database,
          color: 'from-emerald-500 to-teal-500'
        },
        {
          title: '4. Configuraciones y Optimización de Homeserver',
          sub: 'Administre límites de carga de archivos, trabajadores y reglas',
          desc: 'En "Configuración de Homeserver", configure límites de carga de archivos, restricciones de registro, límites de velocidad y reglas de federación.',
          view: 'config',
          viewLabel: 'Abrir Configuración de Homeserver',
          icon: Cpu,
          color: 'from-amber-500 to-orange-500'
        },
        {
          title: '5. Gestión de Usuarios, Salas y Registros',
          sub: 'Controle cuentas, salas de Matrix y registros de seguridad',
          desc: 'Use "Gestión de Usuarios" para registrar usuarios, restablecer contraseñas, asignar roles de administrador e inspeccionar salas de Matrix.',
          view: 'admin',
          viewLabel: 'Abrir Gestión de Usuarios y Salas',
          icon: Users,
          color: 'from-rose-500 to-pink-500'
        }
      ]
    },
    ar: {
      tourTitle: 'دليل استخدام لوحة تحكم ماتركس',
      tourSub: 'الخطوات الأساسية للاتصال بالخادم وتثبيت الحزمة والإدارة',
      stepOf: (current: number, total: number) => `الخطوة ${current} من ${total}`,
      btnNext: 'التالي',
      btnPrev: 'السابق',
      btnFinish: 'فهمت (إنهاء الدليل)',
      btnSkip: 'إغلاق الدليل',
      btnJump: 'الانتقال إلى هذا القسم',
      steps: [
        {
          title: '1. إنشاء وإدارة اتصالات الخادم',
          sub: 'الخطوة الأولى: إضافة ملف تعريف الخادم وبيانات SSH',
          desc: 'للبدء، قم بتسجيل أو تحديد ملف تعريف الخادم ضمن "اتصالات الخادم". أدخل عنوان IP ومنفذ SSH وبيانات الاعتماد ومعلمات PostgreSQL.',
          view: 'connections',
          viewLabel: 'فتح اتصالات الخادم',
          icon: Server,
          color: 'from-blue-500 to-cyan-500'
        },
        {
          title: '2. تثبيت حزمة ماتركس ومعالج المحطة',
          sub: 'إعداد تلقائي لـ Synapse و PostgreSQL و Element',
          desc: 'إذا لم يكن Matrix مثبتًا بعد، انتقل إلى "المحطة" أو انقر على معالج التثبيت. شغل الخيار 8 -> الخيار 2 للتثبيت التلقائي الكامل.',
          view: 'terminal',
          viewLabel: 'فتح المحطة ومعالج التثبيت',
          icon: TermIcon,
          color: 'from-purple-500 to-indigo-500'
        },
        {
          title: '3. ربط قاعدة البيانات وتوريد توكن المسؤول',
          sub: 'ربط اللوحة بقاعدة البيانات وواجهات ماتركس',
          desc: 'بعد اكتمال التثبيت، انسخ كلمة مرور قاعدة البيانات. أدخل بيانات PostgreSQL في "اتصالات الخادم"، ثم قم بإنشاء مسؤول في "إدارة المستخدمين" واحفظ التوكن الخاص به.',
          view: 'connections',
          viewLabel: 'تكوين الاتصالات والتوكن',
          icon: Database,
          color: 'from-emerald-500 to-teal-500'
        },
        {
          title: '4. إعدادات الخادم الرئيسي وتحسينه',
          sub: 'إدارة حدود تحميل الوسائط والعمال وقواعد الأمان',
          desc: 'ضمن "تكوين الخادم الرئيسي"، يمكنك ضبط حدود التحميل وقيود التسجيل وتقييد المعدل والاتحاد.',
          view: 'config',
          viewLabel: 'فتح إعدادات الخادم الرئيسي',
          icon: Cpu,
          color: 'from-amber-500 to-orange-500'
        },
        {
          title: '5. إدارة المستخدمين والغرف وسجلات التدقيق',
          sub: 'التحكم بالحسابات وغرف ماتركس وسجلات الأمان',
          desc: 'استخدم "إدارة المستخدمين" لإنشاء حسابات جديدة وإعادة تعيين كلمات المرور وتعيين أدوار المسؤول وفحص غرف ماتركس.',
          view: 'admin',
          viewLabel: 'فتح إدارة المستخدمين والغرف',
          icon: Users,
          color: 'from-rose-500 to-pink-500'
        }
      ]
    },
    de: {
      tourTitle: 'Anleitung für das Matrix Admin Panel',
      tourSub: 'Wichtige Schritte für Serververbindung, Installation und Verwaltung',
      stepOf: (current: number, total: number) => `Schritt ${current} von ${total}`,
      btnNext: 'Weiter',
      btnPrev: 'Zurück',
      btnFinish: 'Verstanden (Anleitung beenden)',
      btnSkip: 'Schließen',
      btnJump: 'Zu diesem Bereich',
      steps: [
        {
          title: '1. Serververbindungen erstellen & verwalten',
          sub: 'Erster Schritt: Serverprofil & SSH-Zugangsdaten hinzufügen',
          desc: 'Registrieren oder wählen Sie unter „Serververbindungen“ ein Serverprofil aus. Tragen Sie IP, SSH-Zugangsdaten und PostgreSQL-Parameter ein.',
          view: 'connections',
          viewLabel: 'Serververbindungen öffnen',
          icon: Server,
          color: 'from-blue-500 to-cyan-500'
        },
        {
          title: '2. Matrix-Installation & Terminal-Assistent',
          sub: 'Automatische Einrichtung von Synapse, PostgreSQL & Element',
          desc: 'Wenn Matrix/Synapse noch nicht installiert ist, öffnen Sie das „Terminal“ oder klicken Sie auf den Installationsassistenten (Option 8 -> Option 2).',
          view: 'terminal',
          viewLabel: 'Terminal & Assistent öffnen',
          icon: TermIcon,
          color: 'from-purple-500 to-indigo-500'
        },
        {
          title: '3. PostgreSQL-Verbindung & Admin-Token',
          sub: 'Panel mit Datenbank und Matrix-APIs verbinden',
          desc: 'Kopieren Sie das Passwort, tragen Sie PostgreSQL in „Serververbindungen“ ein, erstellen Sie einen Admin in „Benutzerverwaltung“ und speichern Sie das Token.',
          view: 'connections',
          viewLabel: 'Verbindungen & Token konfigurieren',
          icon: Database,
          color: 'from-emerald-500 to-teal-500'
        },
        {
          title: '4. Homeserver-Konfiguration & Optimierung',
          sub: 'Medienlimits, Worker & Sicherheitsregeln verwalten',
          desc: 'Unter „Homeserver-Konfiguration“ verwalten Sie Medien-Upload-Limits, Registrierungsregeln, Rate-Limiting und Worker.',
          view: 'config',
          viewLabel: 'Homeserver-Einstellungen öffnen',
          icon: Cpu,
          color: 'from-amber-500 to-orange-500'
        },
        {
          title: '5. Benutzerverwaltung, Räume & Audit-Logs',
          sub: 'Konten, Matrix-Räume & Sicherheits-Logs steuern',
          desc: 'Nutzen Sie die „Benutzerverwaltung“, um Konten zu erstellen, Passwörter zurückzusetzen, Admin-Rollen zuzuweisen und Räume zu überprüfen.',
          view: 'admin',
          viewLabel: 'Benutzer & Räume verwalten',
          icon: Users,
          color: 'from-rose-500 to-pink-500'
        }
      ]
    },
    ru: {
      tourTitle: 'Инструкция по панели управления Matrix',
      tourSub: 'Основные шаги по подключению сервера, установке и управлению',
      stepOf: (current: number, total: number) => `Шаг ${current} из ${total}`,
      btnNext: 'Далее',
      btnPrev: 'Назад',
      btnFinish: 'Понятно (Завершить)',
      btnSkip: 'Закрыть',
      btnJump: 'Перейти в раздел',
      steps: [
        {
          title: '1. Создание и управление подключениями к серверу',
          sub: 'Первый шаг: добавление профиля сервера и SSH',
          desc: 'Зарегистрируйте или выберите профиль сервера в «Подключениях к серверу». Укажите IP-адрес сервера, SSH и данные подключения к PostgreSQL.',
          view: 'connections',
          viewLabel: 'Открыть Подключения к серверу',
          icon: Server,
          color: 'from-blue-500 to-cyan-500'
        },
        {
          title: '2. Установка пакета Matrix и терминал',
          sub: 'Автоматическая настройка Synapse, PostgreSQL и Element',
          desc: 'Если Matrix еще не установлен, откройте «Терминал» или нажмите Мастер установки. Запустите Опцию 8 -> Опцию 2 для автоматической установки.',
          view: 'terminal',
          viewLabel: 'Открыть Терминал и Мастер',
          icon: TermIcon,
          color: 'from-purple-500 to-indigo-500'
        },
        {
          title: '3. Подключение PostgreSQL и токен администратора',
          sub: 'Подключение панели к базе данных и API Matrix',
          desc: 'После установки скопируйте пароль БД, внесите данные в «Подключения к серверу», зарегистрируйте админа в «Управлении пользователями» и сохраните его токен.',
          view: 'connections',
          viewLabel: 'Настроить подключения и токен',
          icon: Database,
          color: 'from-emerald-500 to-teal-500'
        },
        {
          title: '4. Конфигурация и оптимизация Homeserver',
          sub: 'Управление лимитами файлов, воркерами и правилами',
          desc: 'В «Конфигурации Homeserver» настраивайте лимиты загрузки медиа, ограничения регистрации, лимиты частоты и воркеры.',
          view: 'config',
          viewLabel: 'Открыть настройки Homeserver',
          icon: Cpu,
          color: 'from-amber-500 to-orange-500'
        },
        {
          title: '5. Управление пользователями, комнатами и логами',
          sub: 'Контроль аккаунтов, комнат Matrix и логов',
          desc: 'Используйте «Управление пользователями» для создания аккаунтов, сброса паролей, назначения админов и проверки комнат Matrix.',
          view: 'admin',
          viewLabel: 'Открыть Управление пользователями',
          icon: Users,
          color: 'from-rose-500 to-pink-500'
        }
      ]
    }
  };

  const t = translations[lang] || translations.en;
  const totalSteps = t.steps.length;
  const stepData = t.steps[currentStep];
  const StepIcon = stepData.icon;

  const handleNext = () => {
    if (currentStep < totalSteps - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      onClose();
    }
  };

  const handlePrev = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleJump = () => {
    onNavigateView(stepData.view);
    onClose();
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md animate-in fade-in duration-200">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          dir={isRtl ? "rtl" : "ltr"}
          className={`relative w-full max-w-2xl rounded-3xl shadow-2xl border overflow-hidden transition-all ${
            isLightMode 
              ? 'bg-white border-slate-200 text-slate-800' 
              : 'bg-slate-950 border-white/10 text-white'
          } ${isRtl ? 'dir-rtl text-right' : 'dir-ltr text-left'}`}
        >
          {/* Header Banner */}
          <div className="relative p-6 bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 border-b border-white/10 text-white" dir={isRtl ? "rtl" : "ltr"}>
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-2xl bg-indigo-500/20 border border-indigo-500/30 text-indigo-400 shrink-0">
                  <BookOpen className="w-6 h-6" />
                </div>
                <div className={isRtl ? 'text-right' : 'text-left'}>
                  <h3 className="text-lg font-bold flex items-center gap-2">
                    <span>{t.tourTitle}</span>
                    <Sparkles className="w-4 h-4 text-amber-400 animate-pulse shrink-0" />
                  </h3>
                  <p className="text-xs text-slate-300 mt-0.5">{t.tourSub}</p>
                </div>
              </div>

              <button
                type="button"
                onClick={onClose}
                className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-slate-300 hover:text-white transition-all cursor-pointer shrink-0"
                title={t.btnSkip}
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Step Progress Bar */}
            <div className="mt-5 flex items-center justify-between gap-2" dir={isRtl ? "rtl" : "ltr"}>
              <span className="text-[11px] font-mono text-indigo-300">
                {t.stepOf(currentStep + 1, totalSteps)}
              </span>
              <div className="flex-1 max-w-xs h-1.5 rounded-full bg-white/10 overflow-hidden">
                <div 
                  className="h-full bg-gradient-to-r from-indigo-500 to-rose-500 transition-all duration-300" 
                  style={{ width: `${((currentStep + 1) / totalSteps) * 100}%` }}
                />
              </div>
            </div>
          </div>

          {/* Main Body Card */}
          <div className="p-6 md:p-8 space-y-6" dir={isRtl ? "rtl" : "ltr"}>
            <div className="flex items-start gap-4">
              <div className={`p-3.5 rounded-2xl bg-gradient-to-br ${stepData.color} text-white shadow-lg shrink-0`}>
                <StepIcon className="w-7 h-7" />
              </div>
              <div className={`space-y-1.5 w-full ${isRtl ? 'text-right' : 'text-left'}`}>
                <span className="inline-block text-[10px] font-mono font-bold tracking-wider uppercase px-2.5 py-0.5 rounded-full bg-indigo-500/10 text-indigo-500 border border-indigo-500/20">
                  {stepData.sub}
                </span>
                <h4 className={`text-base md:text-lg font-bold leading-snug ${isLightMode ? 'text-slate-900' : 'text-white'} ${isRtl ? 'text-right' : 'text-left'}`}>
                  <bdi>{stepData.title}</bdi>
                </h4>
                <p className={`text-xs md:text-sm leading-relaxed ${isLightMode ? 'text-slate-600' : 'text-slate-300'} ${isRtl ? 'text-right' : 'text-left'}`}>
                  <bdi>{stepData.desc}</bdi>
                </p>
              </div>
            </div>

            {/* Quick Action Link Button */}
            <div className={`p-4 rounded-2xl border flex items-center justify-between gap-4 ${
              isLightMode ? 'bg-slate-50 border-slate-200' : 'bg-white/5 border-white/5'
            }`} dir={isRtl ? "rtl" : "ltr"}>
              <div className="flex items-center gap-2 text-xs font-semibold">
                <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                <span className={isLightMode ? 'text-slate-700' : 'text-slate-300'}>
                  {stepData.viewLabel}
                </span>
              </div>
              <button
                type="button"
                onClick={handleJump}
                className="py-1.5 px-3.5 rounded-xl bg-indigo-500 hover:bg-indigo-600 text-white font-bold text-xs transition-all flex items-center gap-1.5 shadow-md hover:shadow-indigo-500/20 cursor-pointer shrink-0"
              >
                <span>{t.btnJump}</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Steps Dots */}
            <div className="flex items-center justify-center gap-2 pt-2" dir={isRtl ? "rtl" : "ltr"}>
              {t.steps.map((_, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => setCurrentStep(idx)}
                  className={`h-2.5 rounded-full transition-all cursor-pointer ${
                    currentStep === idx 
                      ? 'w-7 bg-indigo-500' 
                      : 'w-2.5 bg-slate-400/30 hover:bg-slate-400/50'
                  }`}
                />
              ))}
            </div>
          </div>

          {/* Footer Controls */}
          <div className={`p-4 md:px-8 border-t flex items-center justify-between gap-3 ${
            isLightMode ? 'bg-slate-50 border-slate-200' : 'bg-slate-900/50 border-white/5'
          }`} dir={isRtl ? "rtl" : "ltr"}>
            <button
              type="button"
              onClick={onClose}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                isLightMode 
                  ? 'text-slate-500 hover:text-slate-800 hover:bg-slate-200/50' 
                  : 'text-slate-400 hover:text-white hover:bg-white/10'
              }`}
            >
              {t.btnSkip}
            </button>

            <div className="flex items-center gap-2">
              {currentStep > 0 && (
                <button
                  type="button"
                  onClick={handlePrev}
                  className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer border ${
                    isLightMode 
                      ? 'bg-white border-slate-200 text-slate-700 hover:bg-slate-100' 
                      : 'bg-white/5 border-white/10 text-slate-200 hover:bg-white/10'
                  }`}
                >
                  {isRtl ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
                  <span>{t.btnPrev}</span>
                </button>
              )}

              <button
                type="button"
                onClick={handleNext}
                className="px-5 py-2 rounded-xl bg-gradient-to-r from-indigo-500 to-rose-500 hover:from-indigo-600 hover:to-rose-600 text-white font-bold text-xs transition-all shadow-md flex items-center gap-1.5 cursor-pointer"
              >
                <span>{currentStep === totalSteps - 1 ? t.btnFinish : t.btnNext}</span>
                {currentStep < totalSteps - 1 && (
                  isRtl ? <ChevronLeft className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />
                )}
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
export default GuidedTourModal;
