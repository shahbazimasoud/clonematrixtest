/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
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
  FolderSync,
  Settings,
  UploadCloud,
  Calendar,
  RotateCcw,
  FileJson,
  FolderOpen,
  AlertTriangle,
  CheckSquare,
  Square,
  Save,
  RefreshCw,
  Play,
  Network,
  HardDrive,
  Wifi,
  ArrowDownLeft,
  ArrowUpRight,
  Gauge,
  Sliders,
  FileCode,
  Search,
  Filter,
  Eye,
  CheckCircle,
  CheckCircle2,
  XCircle,
  Clock,
  Timer,
  UserCheck,
  Shield,
  AlertCircle,
  Key,
  Lock,
  LogOut,
  MoreVertical,
  Globe,
  Server,
  Terminal,
  Radio,
  Zap
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
import { SystemStats, PanelUser, AuditLog, BackupItem, UndoItem, ConfigLogItem, CustomPermissions } from '../types';

export const DEFAULT_CUSTOM_PERMISSIONS: CustomPermissions = {
  send_messages: true,
  view_matrix_rooms: true,
  manage_matrix_rooms: true,
  reported_messages: true,
  matrix_user_tabs: true,
  control_hub_overview: true,
  manage_connections: false,
  interactive_cleanup: false,
  manage_stored_media: true,
  manage_backups: false,
  view_undo_history: false,
  matrix_stack_settings: false,
  manage_rbac: false,
  view_audit_logs: true,
  view_performance_analysis: true,
  quick_tasks: true,
  session_panel: true
};

export const ROLE_PRESET_PERMISSIONS: Record<string, CustomPermissions> = {
  Owner: {
    send_messages: true,
    view_matrix_rooms: true,
    manage_matrix_rooms: true,
    reported_messages: true,
    matrix_user_tabs: true,
    control_hub_overview: true,
    manage_connections: true,
    interactive_cleanup: true,
    manage_stored_media: true,
    manage_backups: true,
    view_undo_history: true,
    matrix_stack_settings: true,
    manage_rbac: true,
    view_audit_logs: true,
    view_performance_analysis: true,
    quick_tasks: true,
    session_panel: true
  },
  'Super Admin': {
    send_messages: true,
    view_matrix_rooms: true,
    manage_matrix_rooms: true,
    reported_messages: true,
    matrix_user_tabs: true,
    control_hub_overview: true,
    manage_connections: true,
    interactive_cleanup: true,
    manage_stored_media: true,
    manage_backups: true,
    view_undo_history: true,
    matrix_stack_settings: true,
    manage_rbac: true,
    view_audit_logs: true,
    view_performance_analysis: true,
    quick_tasks: true,
    session_panel: true
  },
  Moderator: {
    send_messages: true,
    view_matrix_rooms: true,
    manage_matrix_rooms: true,
    reported_messages: true,
    matrix_user_tabs: true,
    control_hub_overview: true,
    manage_connections: false,
    interactive_cleanup: false,
    manage_stored_media: true,
    manage_backups: false,
    view_undo_history: false,
    matrix_stack_settings: false,
    manage_rbac: false,
    view_audit_logs: true,
    view_performance_analysis: false,
    quick_tasks: true,
    session_panel: false
  },
  Viewer: {
    send_messages: false,
    view_matrix_rooms: true,
    manage_matrix_rooms: false,
    reported_messages: true,
    matrix_user_tabs: true,
    control_hub_overview: true,
    manage_connections: false,
    interactive_cleanup: false,
    manage_stored_media: false,
    manage_backups: false,
    view_undo_history: false,
    matrix_stack_settings: false,
    manage_rbac: false,
    view_audit_logs: true,
    view_performance_analysis: true,
    quick_tasks: false,
    session_panel: false
  }
};

export const ALL_CUSTOM_PERMISSIONS_LIST: {
  key: keyof CustomPermissions;
  labelFa: string;
  labelEn: string;
  descFa: string;
  descEn: string;
  categoryFa: string;
  categoryEn: string;
  moduleGroup: 'MESSAGING' | 'USERS' | 'INFRA' | 'SECURITY';
}[] = [
  {
    key: 'send_messages',
    labelFa: 'ارسال پیام به یوزرها و روم‌ها',
    labelEn: 'Send Direct & Room Messages',
    descFa: 'اجازه ارسال پیام مستقیم یا گروهی به کاربران و روم‌های سیستم ماتریکس',
    descEn: 'Permission to broadcast or send direct messages to Matrix users and room channels.',
    categoryFa: 'ارتباطات و پیام‌ها',
    categoryEn: 'Messaging & Communications',
    moduleGroup: 'MESSAGING'
  },
  {
    key: 'view_matrix_rooms',
    labelFa: 'دیدن لیست روم‌ها',
    labelEn: 'View Matrix Rooms List',
    descFa: 'مشاهده لیست کامل روم‌های عمومی، خصوصی و اعضای آن',
    descEn: 'Access to browse public and private Matrix rooms and active membership directory.',
    categoryFa: 'مدیریت روم‌ها',
    categoryEn: 'Room Management',
    moduleGroup: 'MESSAGING'
  },
  {
    key: 'manage_matrix_rooms',
    labelFa: 'دسترسی به آیتم‌های منو روم‌ها و عملیات آن',
    labelEn: 'Manage Rooms & Context Menu Actions',
    descFa: 'اجرا و مدیریت بن، آن‌بن، اخراج کاربران، پاکسازی پیام‌ها و تغییرات روم',
    descEn: 'Authority to ban, kick, unban users, purge message history, and modify room settings.',
    categoryFa: 'مدیریت روم‌ها',
    categoryEn: 'Room Management',
    moduleGroup: 'MESSAGING'
  },
  {
    key: 'reported_messages',
    labelFa: 'دیدن و کار با Reported Messages Moderation',
    labelEn: 'Reported Messages Moderation',
    descFa: 'مشاهده پیام‌های گزارش‌شده کاربران، لغو یا اعمال نظارت بر محتوا',
    descEn: 'Access to inspect, dismiss, or censor user-flagged reported chat messages.',
    categoryFa: 'مدیریت روم‌ها',
    categoryEn: 'Room Management',
    moduleGroup: 'MESSAGING'
  },
  {
    key: 'matrix_user_tabs',
    labelFa: 'تب‌های قسمت ماتریکس یوزر',
    labelEn: 'Matrix User Management Tabs',
    descFa: 'دسترسی به تب‌های ثبت‌نام، غیرفعالسازی، رمزعبور، ایمیل و پروفایل کاربران',
    descEn: 'Full access to user registration, deactivation, password reset, email & profile tabs.',
    categoryFa: 'مدیریت کاربران',
    categoryEn: 'User Management',
    moduleGroup: 'USERS'
  },
  {
    key: 'control_hub_overview',
    labelFa: 'صفحه اصلی Control Hub و گره‌های کلاستر',
    labelEn: 'Control Hub Overview & Cluster Nodes',
    descFa: 'مشاهده وضعیت کلاستر، معماری گره‌ها و داشبورد اصلی کنترل هاب',
    descEn: 'Access to primary Control Hub status overview and infrastructure cluster nodes.',
    categoryFa: 'کنترل هاب و زیرساخت',
    categoryEn: 'Control Hub Infrastructure',
    moduleGroup: 'INFRA'
  },
  {
    key: 'manage_connections',
    labelFa: 'افزودن، ویرایش و مدیریت کانکشن‌ها',
    labelEn: 'Add / Edit Server Connections',
    descFa: 'تعریف، ویرایش یا حذف سرورها و کانکشن‌های متصل به کنترل هاب',
    descEn: 'Ability to create, update, or detach remote server connection profiles in Control Hub.',
    categoryFa: 'کنترل هاب و زیرساخت',
    categoryEn: 'Control Hub Infrastructure',
    moduleGroup: 'INFRA'
  },
  {
    key: 'interactive_cleanup',
    labelFa: 'کار با Interactive Cleanup Controls و تغییرات',
    labelEn: 'Interactive Cleanup Controls (RAM & Disk)',
    descFa: 'اجرا و تغییر ابزارهای پاکسازی حافظه رم، کش دیسک و لاگ‌ها در کنترل هاب',
    descEn: 'Permission to execute RAM purge, disk cache cleanup, and temp file removal tools.',
    categoryFa: 'کنترل هاب و زیرساخت',
    categoryEn: 'Control Hub Infrastructure',
    moduleGroup: 'INFRA'
  },
  {
    key: 'manage_stored_media',
    labelFa: 'دانلود، حذف و مدیریت فایل‌ها در Stored Media Files',
    labelEn: 'Manage Stored Media Files',
    descFa: 'دانلود، قرنطینه و حذف رسانه‌ها و فایل‌های آپلودشده ماتریکس',
    descEn: 'Ability to download, inspect, quarantine, or delete stored media repository files.',
    categoryFa: 'کنترل هاب و زیرساخت',
    categoryEn: 'Control Hub Infrastructure',
    moduleGroup: 'INFRA'
  },
  {
    key: 'manage_backups',
    labelFa: 'مدیریت پشتیبان‌گیری و بکاپ (Create/Delete/Restore)',
    labelEn: 'Backups & Disaster Recovery Management',
    descFa: 'ایجاد نسخه پشتیبان جدید، دانلود، بازیابی یا حذف فایل‌های بکاپ دیتابیس و کانفیگ',
    descEn: 'Authority to trigger snapshot backups, download zip archives, restore, or delete backups.',
    categoryFa: 'کنترل هاب و زیرساخت',
    categoryEn: 'Control Hub Infrastructure',
    moduleGroup: 'INFRA'
  },
  {
    key: 'view_undo_history',
    labelFa: 'تایم‌لاین بازیابی تغییرات سیستم (Undo History Timeline)',
    labelEn: 'System Recovery & Undo Timeline',
    descFa: 'مشاهده تاریخچه تغییرات برگشت‌پذیر و اجرای بازگردانی فایل‌ها',
    descEn: 'Access to inspect and execute system restoration from step-by-step undo timeline.',
    categoryFa: 'کنترل هاب و زیرساخت',
    categoryEn: 'Control Hub Infrastructure',
    moduleGroup: 'INFRA'
  },
  {
    key: 'matrix_stack_settings',
    labelFa: 'دیدن و کار با Matrix Stack Initial Settings',
    labelEn: 'Matrix Stack Initial Settings',
    descFa: 'مشاهده و تغییر فایل‌های پیکربندی اولیه و تنظیمات ماتریکس استک',
    descEn: 'Permission to view and update core Synapse/Matrix initialization settings files.',
    categoryFa: 'کنترل هاب و زیرساخت',
    categoryEn: 'Control Hub Infrastructure',
    moduleGroup: 'INFRA'
  },
  {
    key: 'manage_rbac',
    labelFa: 'تعریف و تغییر در Role-Based Access Control (RBAC)',
    labelEn: 'Role-Based Access Control (RBAC)',
    descFa: 'تعریف اپراتور جدید، تغییر نقش‌ها و تنظیم دقیق تاگل‌های دسترسی سفارشی',
    descEn: 'Authority to assign operator roles, edit permissions matrix, and configure custom access.',
    categoryFa: 'امنیت و سطوح دسترسی',
    categoryEn: 'Security & Access Control',
    moduleGroup: 'SECURITY'
  },
  {
    key: 'view_audit_logs',
    labelFa: 'لاگ‌های Security Audit و Server Config Audit Log',
    labelEn: 'Security & Server Config Audit Logs',
    descFa: 'مشاهده لاگ‌های امنیتی، تاریخچه تغییرات فایل کانفیگ و دانلود خروجی گزارش‌ها',
    descEn: 'Access to read, filter, and export security audit trail logs and configuration audit history.',
    categoryFa: 'امنیت و سطوح دسترسی',
    categoryEn: 'Security & Access Control',
    moduleGroup: 'SECURITY'
  },
  {
    key: 'view_performance_analysis',
    labelFa: 'دیدن پنل تنظیمات و آنالیز (Panel Settings & Analysis)',
    labelEn: 'Panel Settings & Analysis',
    descFa: 'مشاهده بنچمارک‌ها، نمودارهای پایش منابع پردازنده/رم و پیکربندی‌های کلی پنل',
    descEn: 'Access to view system performance metrics, hardware analytics, and panel configuration settings.',
    categoryFa: 'تنظیمات و آنالیز',
    categoryEn: 'Analytics & Settings',
    moduleGroup: 'SECURITY'
  },
  {
    key: 'quick_tasks',
    labelFa: 'دیدن و اجرای موارد Quick Tasks',
    labelEn: 'Quick Tasks Access & Execution',
    descFa: 'مشاهده و اجرای مستقیم دستورات سریع در پنل مدیریت',
    descEn: 'Permission to view and launch pre-configured quick tasks and maintenance actions.',
    categoryFa: 'تنظیمات و آنالیز',
    categoryEn: 'Analytics & Settings',
    moduleGroup: 'SECURITY'
  },
  {
    key: 'session_panel',
    labelFa: 'تنظیمات و مدیریت سشن پنل (Session Panel)',
    labelEn: 'Session Panel Configuration & Timeout',
    descFa: 'تعریف زمان‌بندی خروج خودکار، مدت زمان غیرفعالی نشست و مدیریت تایم‌اوت کاربران',
    descEn: 'Configure auto-logout duration, idle session timeouts, and role-based session limits.',
    categoryFa: 'امنیت و سطوح دسترسی',
    categoryEn: 'Security & Access Control',
    moduleGroup: 'SECURITY'
  }
];

interface ReportingPanelProps {
  stats: SystemStats | null;
  panelUsers: PanelUser[];
  auditLogs: AuditLog[];
  backups?: BackupItem[];
  undoHistory: UndoItem[];
  onCreatePanelUser: (username: string, email: string, pass: string, role: string, permissions?: CustomPermissions) => void;
  onChangeUserRole: (id: string, role: string, permissions?: CustomPermissions) => void;
  onUpdateUserPermissions?: (id: string, permissions: CustomPermissions) => void;
  onChangeUserPassword?: (id: string, pass: string) => Promise<any>;
  onDeletePanelUser: (id: string) => void;
  onDeleteBackup?: (id: string) => void;
  onCreateBackup?: (includeSSL: boolean) => void;
  userRole: string;
  authToken: string;
  showToast: (type: 'success' | 'error' | 'info', message: string) => void;
  isLightMode?: boolean;
  lang?: 'fa' | 'en' | 'es' | 'ar' | 'de' | 'ru';
  currentUser?: { role: string; username: string; permissions?: CustomPermissions } | null;
}

const faTranslations = {
  tabAnalytics: "تنظیمات پنل و آنالیز",
  tabRbac: "مدیریت نقش‌ها (RBAC)",
  tabBackups: "پشتیبان‌گیری و Snapshot",
  tabAudit: "لاگ‌های امنیتی سیستم",
  tabConfigLogs: "لاگ کانفیگ",
  titleReports: "گزارشات و مدیریت",
  analyticsTitle: "تنظیمات پنل و آنالیز عملکرد سیستم",
  analyticsSub: "نظارت زنده بر منابع مصرفی پردازنده، حافظه رم، ترد‌های ماتریکس و پهنای باند شبکه.",
  cpuUsage: "مصرف پردازنده (%)",
  live: "زنده",
  memoryUsage: "حافظه رم اختصاص یافته (GB)",
  threadsTitle: "تردها و نشست‌های فعال ماتریکس",
  networkTitle: "سرعت و پهنای باند شبکه (دانلود / آپلود)",
  diskIopsTitle: "عملکرد دیسک (IOPS و لیتنسی)",
  downloadSpeed: "دریافت (دانلود)",
  uploadSpeed: "ارسال (آپلود)",
  iopsLabel: "تعداد عملیات دیسک (IOPS)",
  latencyLabel: "تاخیر پاسخ‌دهی دیسک (ms)",
  syncing: "در حال همگام‌سازی",
  loadingStream: "در حال اتصال به جریان وب‌سوکت برای تحلیل عملکرد...",
  rbacTitle: "سیستم کنترل دسترسی نقش‌محور (RBAC)",
  rbacSub: "تعیین سطوح دسترسی، ایجاد اپراتورهای جدید و مدیریت مدیران پورتال ماتریکس.",
  grantAccess: "اعطای دسترسی به پورتال",
  username: "نام کاربری",
  email: "آدرس ایمیل",
  password: "رمز عبور موقت",
  authRole: "نقش پورتال",
  createBtn: "ایجاد اپراتور جدید",
  activeOps: "اپراتورهای فعال سیستم",
  actionCol: "عملیات",
  auditTitle: "لاگ‌های حسابرسی و امنیت سیستم",
  auditSub: "گزارش و ردیابی کامل ورودها، خروجی‌ها و تغییرات پیکربندی پورتال مدیریت.",
  configLogTitle: "لاگ تغییرات پیکربندی و فایل‌های سرور",
  configLogSub: "ردیابی دقیق فایل‌های تغییریافته، پارامترهای کم و زیاد شده، مقدار قبلی/جدید و مسیر فایل‌ها در سرور مقصد.",
  exportCsv: "خروجی CSV (اکسل)",
  exportHtml: "دانلود گزارش HTML",
  timeCol: "زمان ثبت",
  userCol: "نام کاربری",
  actionTypeCol: "نوع عملیات",
  targetCol: "هدف / ماژول",
  statusCol: "وضعیت",
  detailsCol: "توضیحات و جزئیات",
  backupsTitle: "مدیریت نسخه‌های پشتیبان ماتریکس",
  backupsSub: "تهیه فایل‌های پشتیبان رمزگذاری شده از پایگاه داده و فایل‌های تنظیمات ماتریکس.",
  backupListTab: "لیست فایل‌های پشتیبان",
  backupSettingsTab: "تنظیمات زمان‌بندی",
  backupNow: "تهیه نسخه پشتیبان سریع",
  includeSsl: "شامل فایل‌های گواهینامه SSL در فایل پشتیبان",
  uploadBackup: "بارگذاری فایل بک‌آپ موجود",
  tableFilename: "نام فایل پشتیبان",
  tableSize: "حجم",
  tableType: "نوع پشتیبان",
  tableDate: "تاریخ تولید",
  downloadBtn: "دانلود",
  restoreBtn: "بازنشانی / Restore",
  deleteBtn: "حذف بک‌آپ",
  noBackups: "هیچ فایل پشتیبانی یافت نشد.",
  backupConfig: "پیکربندی هوشمند زمان‌بندی نسخه‌های پشتیبان",
  backupPath: "مسیر پیش‌فرض ذخیره‌سازی نسخه‌ها روی سرور",
  retention: "مدت زمان نگهداری فایل‌ها (روز)",
  autoDbBackup: "پشتیبان‌گیری خودکار دیتابیس (Cron Job)",
  cronExpr: "عبارت زمان‌بندی کرون (Cron Expression)",
  autoConfigBackup: "پشتیبان‌گیری خودکار تنظیمات",
  saveSettings: "ذخیره تنظیمات زمان‌بندی",
  warningTitle: "هشدار جدی: بازگردانی وضعیت سرور",
  warningSub: "عملیات بازیابی و ریکاوری سرور ماتریکس",
  warningDesc: "آیا مطمئن هستید که می‌خواهید وضعیت سیستم را به فایل پشتیبان بازگردانید؟ این فرآیند غیرقابل بازگشت است.",
  warningEffects: "اثرات جانبی و غیرقابل برگشت این بازگردانی:",
  dbEffect: "تمام اطلاعات فعلی شامل نشست‌ها، کاربران و دسترسی‌ها با فایل قدیمی جایگزین خواهند شد.",
  configEffect: "تنظیمات اصلی سرور، کلاینت المنت و پروکسی بازنویسی شده و سرویس‌ها ریستارت خواهند شد.",
  cancel: "انصراف",
  confirmRestore: "تایید نهایی و بازنشانی سیستم",
  noLogsMsg: "هیچ لاگی برای نمایش وجود ندارد."
};

const enTranslations = {
  tabAnalytics: "Panel Settings & Analysis",
  tabRbac: "Role Management",
  tabBackups: "Backups & Snapshots",
  tabAudit: "Security Audit Logs",
  tabConfigLogs: "Config Change Logs",
  titleReports: "Reports & Admin",
  analyticsTitle: "Panel Settings & Analysis",
  analyticsSub: "Monitor CPU usage, memory levels, active Synapse threads, and network trends.",
  cpuUsage: "CPU Usage Over Time (%)",
  live: "Live",
  memoryUsage: "Memory Committed (GB)",
  threadsTitle: "Active Synapse Threads & Sessions",
  networkTitle: "Network Bandwidth & Speed (Download / Upload)",
  diskIopsTitle: "Disk Performance (IOPS & Latency)",
  downloadSpeed: "Download",
  uploadSpeed: "Upload",
  iopsLabel: "Disk IOPS (ops/s)",
  latencyLabel: "Disk Latency (ms)",
  syncing: "Syncing",
  loadingStream: "Establishing WebSocket performance analysis stream...",
  rbacTitle: "Role-Based Access Control (RBAC)",
  rbacSub: "Configure management access levels for security. Assign fine access parameters.",
  grantAccess: "Grant Panel Access",
  username: "Username",
  email: "Email",
  password: "Password",
  authRole: "Authorization Role",
  createBtn: "Create Operator",
  activeOps: "Active System Operators",
  actionCol: "Actions",
  auditTitle: "Security Audit & Operations Logs",
  auditSub: "Track and trace administrator logins, credential resets, configuration updates, and VM health events.",
  exportCsv: "Export CSV/Excel",
  exportHtml: "Download HTML Report",
  timeCol: "Timestamp",
  userCol: "Portal User",
  actionTypeCol: "Action Type",
  targetCol: "Target / Module",
  statusCol: "Status",
  detailsCol: "Details & Context",
  backupsTitle: "Matrix Backup & Snapshots Management",
  backupsSub: "Configure automated local/cloud backup tasks. Download or roll back Synapse DB and config units.",
  backupListTab: "Backups Repository",
  backupSettingsTab: "Scheduler Config",
  backupNow: "Trigger On-Demand Backup",
  includeSsl: "Include Active Directory SSL credentials in export",
  uploadBackup: "Upload Existing Backup File",
  tableFilename: "Backup File Name",
  tableSize: "Size",
  tableType: "Backup Type",
  tableDate: "Created At",
  downloadBtn: "Download",
  restoreBtn: "Rollback System",
  deleteBtn: "Purge",
  noBackups: "No system backups found in repository.",
  backupConfig: "Automated Backup Daemon Configuration",
  backupPath: "Default Backup Path",
  retention: "Retention Limit (Days)",
  autoDbBackup: "Automated Database Backup Schedule (Cron Job)",
  cronExpr: "Cron Expression",
  autoConfigBackup: "Automated Configuration Backup Schedule",
  saveSettings: "Save Scheduler Settings",
  warningTitle: "Critical Warning: Restore System",
  warningSub: "Matrix Server Backup Recovery Operations",
  warningDesc: "Are you absolutely sure you want to restore the server state to backup file?",
  warningEffects: "Irreversible side-effects of this rollback:",
  dbEffect: "The current database state including user rosters, active sessions, and access permissions will be entirely replaced.",
  configEffect: "Critical system configuration files, Element client options, and reverse proxy properties will be rewritten. Sync processes and server units will restart to reload newly written configurations.",
  cancel: "Cancel",
  confirmRestore: "Confirm Restoration",
  noLogsMsg: "No audit logs available."
};

const esTranslations = {
  tabAnalytics: "Análisis de Rendimiento",
  tabRbac: "Gestión de Roles (RBAC)",
  tabBackups: "Copias de Seguridad",
  tabAudit: "Registros de Auditoría",
  titleReports: "Informes y Gestión",
  analyticsTitle: "Análisis de Rendimiento del Sistema",
  analyticsSub: "Monitoree el uso de CPU, memoria, hilos activos de Synapse y red.",
  cpuUsage: "Uso de CPU en el tiempo (%)",
  live: "En vivo",
  memoryUsage: "Memoria Cometida (GB)",
  threadsTitle: "Hilos y Sesiones Activas de Synapse",
  networkTitle: "Ancho de Banda y Velocidad de Red (Descarga / Carga)",
  diskIopsTitle: "Rendimiento de Disco (IOPS y Latencia)",
  downloadSpeed: "Descarga",
  uploadSpeed: "Carga",
  iopsLabel: "Operaciones de Disco (IOPS)",
  latencyLabel: "Latencia de Disco (ms)",
  syncing: "Sincronizando",
  loadingStream: "Estableciendo conexión para análisis de rendimiento en tiempo real...",
  rbacTitle: "Control de Acceso Basado en Roles (RBAC)",
  rbacSub: "Configure niveles de acceso administrativo y asigne parámetros de seguridad.",
  grantAccess: "Conceder Acceso al Panel",
  username: "Nombre de usuario",
  email: "Correo electrónico",
  password: "Contraseña temporal",
  authRole: "Rol de Autorización",
  createBtn: "Crear Operador",
  activeOps: "Operadores de Sistema Activos",
  actionCol: "Acciones",
  auditTitle: "Registros de Auditoría y Seguridad",
  auditSub: "Rastree los inicios de sesión de administradores, cambios de configuración y salud del VM.",
  exportCsv: "Exportar CSV/Excel",
  exportHtml: "Descargar Informe HTML",
  timeCol: "Marca de Tiempo",
  userCol: "Usuario del Portal",
  actionTypeCol: "Tipo de Acción",
  targetCol: "Módulo Objetivo",
  statusCol: "Estado",
  detailsCol: "Detalles y Contexto",
  backupsTitle: "Gestión de Copias de Seguridad de Matrix",
  backupsSub: "Configure tareas de copia automatizadas. Descargue o restaure bases de datos y configuraciones.",
  backupListTab: "Repositorio de Copias",
  backupSettingsTab: "Configurar Programador",
  backupNow: "Generar Copia de Seguridad",
  includeSsl: "Incluir certificados SSL activos en la exportación",
  uploadBackup: "Cargar Archivo de Copia Existente",
  tableFilename: "Nombre del Archivo",
  tableSize: "Tamaño",
  tableType: "Tipo de Copia",
  tableDate: "Creado En",
  downloadBtn: "Descargar",
  restoreBtn: "Restaurar Sistema",
  deleteBtn: "Purgar",
  noBackups: "No se encontraron copias de seguridad en el repositorio.",
  backupConfig: "Configuración del Demonio de Copias de Seguridad",
  backupPath: "Ruta de Almacenamiento",
  retention: "Límite de Retención (Días)",
  autoDbBackup: "Programación de Copias de Base de Datos (Cron Job)",
  cronExpr: "Expresión Cron",
  autoConfigBackup: "Programación de Copias de Configuración",
  saveSettings: "Guardar Programación",
  warningTitle: "Advertencia Crítica: Restaurar Sistema",
  warningSub: "Operaciones de Recuperación del Servidor Matrix",
  warningDesc: "¿Está completamente seguro de que desea restaurar el sistema al archivo de copia?",
  warningEffects: "Efectos secundarios irreversibles de esta acción:",
  dbEffect: "Se reemplazará completamente el estado de la base de datos actual, incluyendo usuarios y permisos.",
  configEffect: "Se reescribirán archivos de configuración críticos del sistema y del cliente Element. Los servicios se reiniciarán.",
  cancel: "Cancelar",
  confirmRestore: "Confirmar Restauración",
  noLogsMsg: "No hay registros de auditoría disponibles."
};

const arTranslations = {
  tabAnalytics: "التحليلات الفورية",
  tabRbac: "إدارة الأدوار (RBAC)",
  tabBackups: "النسخ الاحتياطي",
  tabAudit: "سجلات التدقيق",
  titleReports: "التقارير والإدارة",
  analyticsTitle: "تحليل أداء النظام",
  analyticsSub: "مراقبة استخدام المعالج والذاكرة والنشاط النشط لخيوط ماتریکس والشبكة.",
  cpuUsage: "استخدام المعالج بمرور الوقت (%)",
  live: "مباشر",
  memoryUsage: "الذاكرة المستخدمة (جيجابايت)",
  threadsTitle: "خيوط وجلسات ماتریکس النشطة",
  networkTitle: "سرعة ونطاق التردد للشبكة (تنزيل / رفع)",
  diskIopsTitle: "أداء القرص (عمليات IOPS والتأخير)",
  downloadSpeed: "تنزيل",
  uploadSpeed: "رفع",
  iopsLabel: "عمليات القرص (IOPS)",
  latencyLabel: "تأخير القرص (ms)",
  syncing: "مزامنة",
  loadingStream: "جاري الاتصال بقناة وب‌سوکت لتحليل الأداء...",
  rbacTitle: "التحكم بالوصول المستند إلى الأدوار (RBAC)",
  rbacSub: "تكوين مستويات الوصول الإداري وتعيين معلمات الأمان للمشغلين.",
  grantAccess: "منح حق الوصول للوحة",
  username: "اسم المستخدم",
  email: "البريد الإلكتروني",
  password: "كلمة المرور المؤقتة",
  authRole: "الدور المصرح به",
  createBtn: "إنشاء مشغل",
  activeOps: "مشغلو النظام النشطون",
  actionCol: "الإجراءات",
  auditTitle: "سجلات التدقيق الأمني والعمليات",
  auditSub: "تتبع عمليات تسجيل دخول المسؤولين وتغييرات التكوين وحالة الخادم الافتراضي.",
  exportCsv: "تصدير CSV (إكسل)",
  exportHtml: "تحميل تقرير HTML",
  timeCol: "طابع زمني",
  userCol: "مستخدم البوابة",
  actionTypeCol: "نوع الإجراء",
  targetCol: "المستهدف / الوحدة",
  statusCol: "الحالة",
  detailsCol: "التفاصيل والسياق",
  backupsTitle: "إدارة النسخ الاحتياطي واللقطات لخادم ماتریکس",
  backupsSub: "تكوين مهام النسخ الاحتياطي التلقائي. تنزيل أو استعادة قواعد البيانات والتكوينات.",
  backupListTab: "مستودع النسخ الاحتياطية",
  backupSettingsTab: "إعدادات المجدول",
  backupNow: "بدء نسخ احتياطي فوري",
  includeSsl: "تضمين بيانات اعتماد SSL النشطة في التصدير",
  uploadBackup: "رفع ملف نسخ احتياطي موجود",
  tableFilename: "اسم ملف النسخ الاحتياطي",
  tableSize: "الحجم",
  tableType: "نوع النسخة",
  tableDate: "تاريخ الإنشاء",
  downloadBtn: "تنزيل",
  restoreBtn: "استعادة النظام",
  deleteBtn: "تطهير",
  noBackups: "لم يتم العثور على نسخ احتياطية للنظام في المستودع.",
  backupConfig: "تكوين خدمة النسخ الاحتياطي التلقائي",
  backupPath: "مسار النسخ الاحتياطي الافتراضي",
  retention: "فترة الاحتفاظ بالملفات (أيام)",
  autoDbBackup: "جدولة النسخ الاحتياطي لقاعدة البيانات (كرون)",
  cronExpr: "تعبير كرون",
  autoConfigBackup: "جدولة النسخ الاحتياطي للتكوينات",
  saveSettings: "حفظ إعدادات المجدول",
  warningTitle: "تحذير حرج: استعادة النظام",
  warningSub: "عمليات استرداد النسخ الاحتياطي لخادم ماتریکس",
  warningDesc: "هل أنت متأكد تمامًا من رغبتك في استعادة حالة الخادم إلى ملف النسخ الاحتياطي؟",
  warningEffects: "الآثار الجانبية غير القابلة للإلغاء لهذه العملية:",
  dbEffect: "سيتم استبدال قاعدة البيانات الحالية بالكامل بما في ذلك قائمة المستخدمين والأعضاء والصلاحيات.",
  configEffect: "ستتم إعادة كتابة ملفات التكوين الهامة للنظام وإعدادات العميل ووكيل الخادم وإعادة تشغيل الخدمات.",
  cancel: "إلغاء",
  confirmRestore: "تأكيد الاستعادة",
  noLogsMsg: "لا توجد سجلات تدقيق متاحة."
};

const deTranslations = {
  tabAnalytics: "Echtzeit-Analyse",
  tabRbac: "Rollenverwaltung (RBAC)",
  tabBackups: "Backups & Snapshots",
  tabAudit: "Sicherheits-Audit-Logs",
  titleReports: "Berichte & Admin",
  analyticsTitle: "Systemleistungsanalyse",
  analyticsSub: "Überwachen Sie CPU-Auslastung, Speicherpegel, aktive Synapse-Threads und Netzwerktrends.",
  cpuUsage: "CPU-Auslastung im Zeitverlauf (%)",
  live: "Live",
  memoryUsage: "Speicher committed (GB)",
  threadsTitle: "Aktive Synapse-Threads & Sessions",
  networkTitle: "Netzwerkbandbreite & Geschwindigkeit (Download / Upload)",
  diskIopsTitle: "Datenträgerleistung (IOPS & Latenz)",
  downloadSpeed: "Download",
  uploadSpeed: "Upload",
  iopsLabel: "Datenträger-IOPS (ops/s)",
  latencyLabel: "Datenträgerlatenz (ms)",
  syncing: "Synchronisierung",
  loadingStream: "Verbindung mit dem WebSocket-Leistungsanalysestream wird hergestellt...",
  rbacTitle: "Rollenbasierte Zugriffskontrolle (RBAC)",
  rbacSub: "Verwalten Sie Administrationszugriffsrechte und weisen Sie Sicherheitsparameter zu.",
  grantAccess: "Panel-Zugriff gewähren",
  username: "Benutzername",
  email: "E-Mail-Adresse",
  password: "Temporäres Passwort",
  authRole: "Autorisierungsrolle",
  createBtn: "Operator erstellen",
  activeOps: "Aktive System-Operatoren",
  actionCol: "Aktionen",
  auditTitle: "Sicherheits-Audit & Operations-Logs",
  auditSub: "Verfolgen Sie Administrator-Anmeldungen, Konfigurationsänderungen und VM-Statusereignisse.",
  exportCsv: "CSV/Excel exportieren",
  exportHtml: "HTML-Bericht herunterladen",
  timeCol: "Zeitstempel",
  userCol: "Portal-Benutzer",
  actionTypeCol: "Aktionstyp",
  targetCol: "Zielmodul",
  statusCol: "Status",
  detailsCol: "Details & Kontext",
  backupsTitle: "Matrix Backup & Snapshots-Verwaltung",
  backupsSub: "Konfigurieren Sie automatische Backups. Laden Sie Datenbanken und Systemkonfigurationen herunter oder stellen Sie sie wieder her.",
  backupListTab: "Backup-Repository",
  backupSettingsTab: "Zeitplaner-Konfiguration",
  backupNow: "Direktes Backup starten",
  includeSsl: "Aktive SSL-Zertifikate in Export einschließen",
  uploadBackup: "Vorhandenes Backup hochladen",
  tableFilename: "Backup-Dateiname",
  tableSize: "Größe",
  tableType: "Backup-Typ",
  tableDate: "Erstellt am",
  downloadBtn: "Herunterladen",
  restoreBtn: "System wiederherstellen",
  deleteBtn: "Löschen",
  noBackups: "Keine System-Backups im Repository gefunden.",
  backupConfig: "Automatische Backup-Dämon-Konfiguration",
  backupPath: "Standardmäßiger Backup-Pfad",
  retention: "Aufbewahrungszeitlimit (Tage)",
  autoDbBackup: "Automatisiertes Datenbank-Backup (Cron-Job)",
  cronExpr: "Cron-Ausdruck",
  autoConfigBackup: "Automatisiertes Konfigurations-Backup",
  saveSettings: "Zeitplaner-Einstellungen speichern",
  warningTitle: "Kritische Warnung: System wiederherstellen",
  warningSub: "Matrix Server Backup-Wiederherstellungsvorgänge",
  warningDesc: "Sind Sie absolut sicher, dass Sie den Server auf die ausgewählte Backup-Datei zurücksetzen möchten?",
  warningEffects: "Unumkehrbare Nebenwirkungen dieser Wiederherstellung:",
  dbEffect: "Der aktuelle Datenbankstatus einschließlich Benutzer, Sitzungen und Berechtigungen wird vollständig ersetzt.",
  configEffect: "Kritische Systemkonfigurationsdateien, Element-Client-Optionen und Proxy-Einstellungen werden überschrieben. Dienste werden neu gestartet.",
  cancel: "Abbrechen",
  confirmRestore: "Wiederherstellung bestätigen",
  noLogsMsg: "Keine Audit-Logs verfügbar."
};

const ruTranslations = {
  tabAnalytics: "Аналитика",
  tabRbac: "Управление ролями (RBAC)",
  tabBackups: "Резервные копии",
  tabAudit: "Журналы аудита",
  titleReports: "Отчеты и администрирование",
  analyticsTitle: "Анализ производительности системы",
  analyticsSub: "Мониторинг процессора, памяти, активных потоков Synapse и сетевого трафика.",
  cpuUsage: "Использование процессора с течением времени (%)",
  live: "В эфире",
  memoryUsage: "Выделенная память (ГБ)",
  threadsTitle: "Активные потоки и сессии Synapse",
  networkTitle: "Сетевая пропускная способность и скорость (Загрузка / Отправка)",
  diskIopsTitle: "Производительность диска (IOPS и задержка)",
  downloadSpeed: "Загрузка",
  uploadSpeed: "Отправка",
  iopsLabel: "Операции с диском (IOPS)",
  latencyLabel: "Задержка диска (мс)",
  syncing: "Синхронизация",
  loadingStream: "Установка подключения для анализа производительности...",
  rbacTitle: "Управление доступом на основе ролей (RBAC)",
  rbacSub: "Настройка уровней доступа для операторов и управление администраторами портала.",
  grantAccess: "Предоставить доступ к панели",
  username: "Имя пользователя",
  email: "Электронная почта",
  password: "Временный пароль",
  authRole: "Роль в системе",
  createBtn: "Создать оператора",
  activeOps: "Активные операторы системы",
  actionCol: "Действия",
  auditTitle: "Журналы безопасности и аудита",
  auditSub: "Отслеживание входов администраторов, изменений конфигурации и состояния виртуальной машины.",
  exportCsv: "Экспорт в CSV/Excel",
  exportHtml: "Скачать отчет HTML",
  timeCol: "Время записи",
  userCol: "Пользователь",
  actionTypeCol: "Тип операции",
  targetCol: "Целевой модуль",
  statusCol: "Статус",
  detailsCol: "Подробности и контекст",
  backupsTitle: "Резервное копирование и снимки Matrix",
  backupsSub: "Настройка автоматических резервных копий БД и файлов конфигурации Synapse.",
  backupListTab: "Репозиторий копий",
  backupSettingsTab: "Настройка планировщика",
  backupNow: "Создать копию сейчас",
  includeSsl: "Включить активные SSL-сертификаты в резервную копию",
  uploadBackup: "Загрузить готовый файл копии",
  tableFilename: "Имя файла резервной копии",
  tableSize: "Размер",
  tableType: "Тип копии",
  tableDate: "Создана в",
  downloadBtn: "Скачать",
  restoreBtn: "Восстановить систему",
  deleteBtn: "Удалить",
  noBackups: "Резервные копии системы не найдены.",
  backupConfig: "Настройка службы автоматического копирования",
  backupPath: "Путь сохранения по умолчанию",
  retention: "Срок хранения копий (дней)",
  autoDbBackup: "Автоматическое копирование БД (Cron-Job)",
  cronExpr: "Выражение Cron",
  autoConfigBackup: "Автоматическое копирование конфигурации",
  saveSettings: "Сохранить настройки",
  warningTitle: "Критическое предупреждение: восстановление системы",
  warningSub: "Восстановление сервера Matrix из резервной копии",
  warningDesc: "Вы абсолютно уверены, что хотите восстановить состояние системы из выбранного файла?",
  warningEffects: "Необратимые последствия этого восстановления:",
  dbEffect: "Текущее состояние базы данных (пользователи, сессии, права) будет полностью заменено старыми данными.",
  configEffect: "Критические файлы конфигурации, настройки Element и прокси будут перезаписаны. Службы будут перезапущены.",
  cancel: "Отмена",
  confirmRestore: "Подтвердить восстановление",
  noLogsMsg: "Журналы аудита безопасности отсутствуют."
};

const CustomChartTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="p-3.5 rounded-xl bg-slate-900/95 border border-slate-700/80 shadow-2xl backdrop-blur-md text-left dir-ltr min-w-[150px] pointer-events-none z-50">
        {label && (
          <p className="text-[11px] font-extrabold text-cyan-300 mb-1.5 border-b border-slate-700/80 pb-1 font-mono tracking-wide">
            {label}
          </p>
        )}
        <div className="space-y-1.5">
          {payload.map((entry: any, index: number) => {
            const color = entry.color || entry.stroke || entry.fill || '#38bdf8';
            let unit = entry.unit || '';
            if (!unit) {
              if (entry.dataKey === 'cpu') unit = '%';
              else if (entry.dataKey === 'memory') unit = '%';
              else if (entry.dataKey === 'networkIn' || entry.dataKey === 'networkOut') unit = 'KB/s';
              else if (entry.dataKey === 'diskIops') unit = 'op/s';
              else if (entry.dataKey === 'diskLatencyMs') unit = 'ms';
            }
            return (
              <div key={`item-${index}`} className="flex items-center justify-between gap-4 text-xs font-bold font-mono">
                <span className="flex items-center gap-1.5 text-slate-100 font-bold">
                  <span className="w-2.5 h-2.5 rounded-full shrink-0 shadow-sm" style={{ backgroundColor: color }} />
                  <span className="text-white font-bold">{entry.name || entry.dataKey}:</span>
                </span>
                <span className="font-extrabold text-white text-xs tracking-tight" style={{ color: color }}>
                  {entry.value} {unit}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    );
  }
  return null;
};

export default function ReportingPanel({
  stats,
  panelUsers,
  auditLogs,
  backups,
  undoHistory,
  onCreatePanelUser,
  onChangeUserRole,
  onUpdateUserPermissions,
  onChangeUserPassword,
  onDeletePanelUser,
  onDeleteBackup,
  onCreateBackup,
  userRole,
  authToken,
  showToast,
  isLightMode = false,
  lang = 'en',
  currentUser
}: ReportingPanelProps) {
  const translationsMap = {
    fa: faTranslations,
    en: enTranslations,
    es: esTranslations,
    ar: arTranslations,
    de: deTranslations,
    ru: ruTranslations
  };
  const t = translationsMap[lang] || enTranslations;
  const isRtl = ['fa', 'ar'].includes(lang);

  const isCustomRole = userRole === 'Custom' || currentUser?.role === 'Custom';
  const perms = currentUser?.permissions;

  const canViewAnalytics = !isCustomRole || !!perms?.view_performance_analysis;
  const canViewRbac = !isCustomRole || !!perms?.manage_rbac;
  const canViewAudit = !isCustomRole || !!perms?.view_audit_logs;
  const canViewConfigLog = !isCustomRole || !!perms?.view_audit_logs;
  const canViewSessionPanel = !isCustomRole || !!perms?.session_panel || !!perms?.manage_rbac || !!perms?.view_performance_analysis;

  const getInitialSubTab = (): 'analytics' | 'rbac' | 'audit' | 'configLog' | 'sessionPanel' | 'securityRules' => {
    if (!isCustomRole) return 'analytics';
    if (canViewAnalytics) return 'analytics';
    if (canViewRbac) return 'rbac';
    if (canViewAudit) return 'audit';
    if (canViewConfigLog) return 'configLog';
    if (canViewSessionPanel) return 'sessionPanel';
    return 'analytics';
  };

  const [activeSubTab, setActiveTab] = useState<'analytics' | 'rbac' | 'audit' | 'configLog' | 'sessionPanel' | 'securityRules' | 'vpnProxy'>(getInitialSubTab);

  // VPN & Proxy Management State
  const [vpnProxySettings, setVpnProxySettings] = useState<any>(null);
  const [vpnProxyUsers, setVpnProxyUsers] = useState<any[]>([]);
  const [isLoadingVpnProxy, setIsLoadingVpnProxy] = useState<boolean>(false);
  const [isDeployingPackages, setIsDeployingPackages] = useState<boolean>(false);
  const [deployLogs, setDeployLogs] = useState<string[]>([]);
  const [showDeployLogsModal, setShowDeployLogsModal] = useState<boolean>(false);
  const [routeTestResult, setRouteTestResult] = useState<any>(null);
  const [isTestingRoute, setIsTestingRoute] = useState<boolean>(false);

  // Windows-like VPN / Proxy Client Connections State
  const [vpnClientConnections, setVpnClientConnections] = useState<any[]>([]);
  const [isLoadingConnections, setIsLoadingConnections] = useState<boolean>(false);
  const [isConnectingId, setIsConnectingId] = useState<string | null>(null);
  const [showConnModal, setShowConnModal] = useState<boolean>(false);
  const [showModalPassword, setShowModalPassword] = useState<boolean>(false);

  // Target Remote Server Connections State
  const [targetConnections, setTargetConnections] = useState<any[]>([]);
  const [selectedTargetId, setSelectedTargetId] = useState<string>('local');
  const [selectedVpnClientType, setSelectedVpnClientType] = useState<string>('wireguard');

  const [connForm, setConnForm] = useState<{
    id: string;
    name: string;
    protocol: string;
    serverHost: string;
    port: number | string;
    username: string;
    password: string;
    presharedKey: string;
    ignoreCertErrors: boolean;
    autoConnect: boolean;
  }>({
    id: '',
    name: '',
    protocol: 'sstp',
    serverHost: '',
    port: 443,
    username: '',
    password: '',
    presharedKey: '',
    ignoreCertErrors: true,
    autoConnect: true
  });

  // New VPN User state
  const [newVpnUser, setNewVpnUser] = useState<string>('');
  const [newVpnPass, setNewVpnPass] = useState<string>('');
  const [newVpnProtocols, setNewVpnProtocols] = useState<string[]>(['pptp', 'l2tp', 'sstp', 'socks5']);
  const [newVpnAssignedIp, setNewVpnAssignedIp] = useState<string>('');
  const [isSavingVpnUser, setIsSavingVpnUser] = useState<boolean>(false);

  // OS & VPN Client Packages state
  const [osInfo, setOsInfo] = useState<{
    distro: string;
    distroName: string;
    version: string;
    pkgManager: string;
    arch: string;
    kernel: string;
    isLinux: boolean;
  } | null>(null);
  const [vpnClientPackages, setVpnClientPackages] = useState<any[]>([]);
  const [isLoadingOsInfo, setIsLoadingOsInfo] = useState<boolean>(false);
  const [vpnConnFilter, setVpnConnFilter] = useState<string>('all');
  
  // Package Log Modal
  const [showPkgLogModal, setShowPkgLogModal] = useState<boolean>(false);
  const [pkgLogTitle, setPkgLogTitle] = useState<string>('');
  const [pkgLogContent, setPkgLogContent] = useState<string>('');
  const [isPkgOpLoading, setIsPkgOpLoading] = useState<string | null>(null);

  // Import Config Modal
  const [showImportConfigModal, setShowImportConfigModal] = useState<boolean>(false);
  const [importConfigName, setImportConfigName] = useState<string>('');
  const [importConfigText, setImportConfigText] = useState<string>('');
  const [isImportingConfig, setIsImportingConfig] = useState<boolean>(false);

  const fetchTargetConnections = async () => {
    try {
      const res = await fetch('/api/connections', {
        headers: { 'Authorization': `Bearer ${authToken}` }
      });
      if (res.ok) {
        const conns = await res.json();
        if (Array.isArray(conns)) {
          setTargetConnections(conns);
        }
      }
    } catch (err) {
      console.error('Error fetching target connections:', err);
    }
  };

  const fetchVpnClientsAndOsInfo = async (targetIdOverride?: string) => {
    setIsLoadingOsInfo(true);
    const targetId = targetIdOverride !== undefined ? targetIdOverride : selectedTargetId;
    try {
      const res = await fetch(`/api/vpn-clients/packages?targetId=${encodeURIComponent(targetId)}`, {
        headers: { 'Authorization': `Bearer ${authToken}` }
      });
      if (res.ok) {
        const data = await res.json();
        if (data.osInfo) setOsInfo(data.osInfo);
        if (Array.isArray(data.packages)) setVpnClientPackages(data.packages);
      }
    } catch (e) {
      console.error('Error fetching VPN client packages & OS info:', e);
    } finally {
      setIsLoadingOsInfo(false);
    }
  };

  const fetchVpnProxyData = async () => {
    setIsLoadingVpnProxy(true);
    try {
      fetchTargetConnections();
      fetchVpnClientsAndOsInfo(selectedTargetId);
      const [resSettings, resUsers, resConns] = await Promise.all([
        fetch('/api/vpn-proxy/status', { headers: { 'Authorization': `Bearer ${authToken}` } }),
        fetch('/api/vpn-proxy/users', { headers: { 'Authorization': `Bearer ${authToken}` } }),
        fetch('/api/vpn-proxy/client-connections', { headers: { 'Authorization': `Bearer ${authToken}` } })
      ]);
      if (resSettings.ok) {
        const data = await resSettings.json();
        setVpnProxySettings(data);
      }
      if (resUsers.ok) {
        const data = await resUsers.json();
        setVpnProxyUsers(data);
      }
      if (resConns.ok) {
        const data = await resConns.json();
        setVpnClientConnections(data);
      }
    } catch (err) {
      console.error('Error fetching VPN Proxy data:', err);
    } finally {
      setIsLoadingVpnProxy(false);
    }
  };

  const handleInstallVpnClientPackage = async (type: string) => {
    setIsPkgOpLoading(type);
    try {
      const res = await fetch('/api/vpn-clients/package/install', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authToken}`
        },
        body: JSON.stringify({ type, targetId: selectedTargetId })
      });
      if (res.ok) {
        const data = await res.json();
        showToast('success', data.message);
        if (data.log) {
          setPkgLogTitle(`خروجی نصب پکیج ${type.toUpperCase()}`);
          setPkgLogContent(data.log);
          setShowPkgLogModal(true);
        }
        fetchVpnClientsAndOsInfo(selectedTargetId);
      } else {
        showToast('error', isRtl ? 'خطا در اجرای نصب پکیج' : 'Package install failed');
      }
    } catch (err) {
      showToast('error', isRtl ? 'خطا در ارتباط با سرور' : 'Connection error');
    } finally {
      setIsPkgOpLoading(null);
    }
  };

  const handleUninstallVpnClientPackage = async (type: string) => {
    if (!window.confirm(isRtl ? `آیا از حذف پکیج ${type.toUpperCase()} اطمینان دارید؟` : `Uninstall ${type}?`)) return;
    setIsPkgOpLoading(type);
    try {
      const res = await fetch('/api/vpn-clients/package/uninstall', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authToken}`
        },
        body: JSON.stringify({ type, targetId: selectedTargetId })
      });
      if (res.ok) {
        const data = await res.json();
        showToast('success', data.message);
        fetchVpnClientsAndOsInfo(selectedTargetId);
      }
    } catch (err) {
      showToast('error', isRtl ? 'خطا در حذف پکیج' : 'Uninstall failed');
    } finally {
      setIsPkgOpLoading(null);
    }
  };

  const handleVpnClientServiceControl = async (type: string, action: 'start' | 'stop' | 'restart' | 'enable-boot' | 'disable-boot') => {
    setIsPkgOpLoading(`${type}_${action}`);
    try {
      const res = await fetch('/api/vpn-clients/package/service-control', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authToken}`
        },
        body: JSON.stringify({ type, action, targetId: selectedTargetId })
      });
      if (res.ok) {
        const data = await res.json();
        showToast('success', data.message);
        fetchVpnClientsAndOsInfo(selectedTargetId);
      }
    } catch (err) {
      showToast('error', isRtl ? 'خطا در کنترل سرویس' : 'Service action failed');
    } finally {
      setIsPkgOpLoading(null);
    }
  };

  const handleViewVpnClientLogs = async (type: string, name: string) => {
    setIsPkgOpLoading(`${type}_logs`);
    try {
      const res = await fetch('/api/vpn-clients/package/logs', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authToken}`
        },
        body: JSON.stringify({ type, targetId: selectedTargetId })
      });
      if (res.ok) {
        const data = await res.json();
        setPkgLogTitle(`لاگ‌های سیستم: ${name}`);
        setPkgLogContent(data.logs || 'لاگی ثبت نشده است.');
        setShowPkgLogModal(true);
      }
    } catch (err) {
      showToast('error', isRtl ? 'خطا در دریافت لاگ' : 'Failed to fetch logs');
    } finally {
      setIsPkgOpLoading(null);
    }
  };

  const handleImportConfigSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!importConfigText.trim()) return;
    setIsImportingConfig(true);
    try {
      const res = await fetch('/api/vpn-clients/import-config', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authToken}`
        },
        body: JSON.stringify({
          name: importConfigName.trim(),
          rawConfig: importConfigText.trim()
        })
      });
      if (res.ok) {
        const data = await res.json();
        showToast('success', data.message);
        setShowImportConfigModal(false);
        setImportConfigName('');
        setImportConfigText('');
        fetchVpnProxyData();
      } else {
        showToast('error', isRtl ? 'خطا در تحلیل کانفیگ' : 'Import failed');
      }
    } catch (err) {
      showToast('error', isRtl ? 'خطا در ارتباط با سرور' : 'Connection error');
    } finally {
      setIsImportingConfig(false);
    }
  };

  const handleExportConfig = (conn: any) => {
    const text = conn.rawConfig || `# VPN Connection Export: ${conn.name}
protocol = ${conn.protocol}
server = ${conn.serverHost}:${conn.port}
username = ${conn.username}
password = ${conn.password}
assigned_ip = ${conn.assignedIp || '10.10.0.1'}
created_at = ${conn.createdAt || new Date().toISOString()}
`;
    const ext = conn.protocol === 'wireguard' ? 'conf' : conn.protocol === 'openvpn' ? 'ovpn' : 'txt';
    const blob = new Blob([text], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${conn.name.replace(/\s+/g, '_')}_${conn.protocol}.${ext}`;
    a.click();
    URL.revokeObjectURL(url);
    showToast('success', isRtl ? 'فایل کانفیگ با موفقیت دانلود شد' : 'Config exported successfully');
  };

  useEffect(() => {
    if (activeSubTab === 'vpnProxy') {
      fetchVpnProxyData();
    }
  }, [activeSubTab]);

  const handleOpenAddConnModal = () => {
    setConnForm({
      id: '',
      name: '',
      protocol: 'sstp',
      serverHost: '',
      port: 443,
      username: '',
      password: '',
      presharedKey: '',
      ignoreCertErrors: true,
      autoConnect: true
    });
    setShowModalPassword(false);
    setShowConnModal(true);
  };

  const handleOpenEditConnModal = (conn: any) => {
    setConnForm({
      id: conn.id || '',
      name: conn.name || '',
      protocol: conn.protocol || 'sstp',
      serverHost: conn.serverHost || '',
      port: conn.port || (conn.protocol === 'sstp' ? 443 : conn.protocol === 'l2tp' ? 1701 : conn.protocol === 'pptp' ? 1723 : 1080),
      username: conn.username || '',
      password: conn.password || '',
      presharedKey: conn.presharedKey || '',
      ignoreCertErrors: conn.ignoreCertErrors !== undefined ? conn.ignoreCertErrors : true,
      autoConnect: !!conn.autoConnect
    });
    setShowModalPassword(false);
    setShowConnModal(true);
  };

  const handleSaveConnProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!connForm.name.trim() || !connForm.serverHost.trim() || !connForm.username.trim() || !connForm.password.trim()) {
      showToast('error', isRtl ? 'لطفا تمام فیلدهای الزامی را تکمیل کنید' : 'Please complete required fields');
      return;
    }

    try {
      const res = await fetch('/api/vpn-proxy/client-connections', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authToken}`
        },
        body: JSON.stringify(connForm)
      });
      if (res.ok) {
        const data = await res.json();
        showToast('success', data.message || (isRtl ? 'کانکشن با موفقیت ذخیره گردید' : 'Connection saved successfully'));
        setShowConnModal(false);
        fetchVpnProxyData();
      } else {
        const errData = await res.json();
        showToast('error', errData.error || (isRtl ? 'خطا در ذخیره کانکشن' : 'Failed to save connection'));
      }
    } catch (err) {
      showToast('error', isRtl ? 'خطا در ارتباط با سرور' : 'Connection error');
    }
  };

  const handleDeleteConnProfile = async (id: string) => {
    if (!window.confirm(isRtl ? 'آیا از حذف این کانکشن اطمینان دارید؟' : 'Delete this connection profile?')) return;
    try {
      const res = await fetch(`/api/vpn-proxy/client-connections/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${authToken}` }
      });
      if (res.ok) {
        showToast('success', isRtl ? 'کانکشن حذف گردید' : 'Connection deleted');
        fetchVpnProxyData();
      }
    } catch (err) {
      showToast('error', isRtl ? 'خطا در حذف کانکشن' : 'Delete failed');
    }
  };

  const handleConnectTunnel = async (id: string) => {
    setIsConnectingId(id);
    try {
      const res = await fetch(`/api/vpn-proxy/client-connections/${id}/connect`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${authToken}` }
      });
      if (res.ok) {
        const data = await res.json();
        showToast('success', data.message);
        fetchVpnProxyData();
      } else {
        showToast('error', isRtl ? 'خطا در برقرار اتصال' : 'Connect failed');
      }
    } catch (err) {
      showToast('error', isRtl ? 'خطا در ارتباط با سرور' : 'Server connection error');
    } finally {
      setIsConnectingId(null);
    }
  };

  const handleDisconnectTunnel = async (id: string) => {
    setIsConnectingId(id);
    try {
      const res = await fetch(`/api/vpn-proxy/client-connections/${id}/disconnect`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${authToken}` }
      });
      if (res.ok) {
        const data = await res.json();
        showToast('success', data.message);
        fetchVpnProxyData();
      } else {
        showToast('error', isRtl ? 'خطا در قطع اتصال' : 'Disconnect failed');
      }
    } catch (err) {
      showToast('error', isRtl ? 'خطا در ارتباط با سرور' : 'Server connection error');
    } finally {
      setIsConnectingId(null);
    }
  };

  const handleInstallVpnPackages = async (targetProtos?: string[]) => {
    setIsDeployingPackages(true);
    setShowDeployLogsModal(true);
    setDeployLogs(['[INIT] Connecting to remote target host via SSH / local daemon...']);
    
    try {
      const res = await fetch('/api/vpn-proxy/install-packages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authToken}`
        },
        body: JSON.stringify({ protocols: targetProtos || ['pptp', 'l2tp', 'sstp', 'socks5', 'httpProxy'] })
      });
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data.logs)) {
          setDeployLogs(prev => [...prev, ...data.logs]);
        }
        if (data.settings) setVpnProxySettings(data.settings);
        showToast('success', isRtl ? 'پکیج‌های VPN و پروکسی با موفقیت روی سرور مقصد نصب شدند' : 'VPN/Proxy packages installed successfully on target server');
      } else {
        showToast('error', isRtl ? 'خطا در نصب پکیج‌های سرور مقصد' : 'Error installing packages on target server');
      }
    } catch (err) {
      showToast('error', isRtl ? 'خطا در برقراری ارتباط با سرور' : 'Server connection error');
    } finally {
      setIsDeployingPackages(false);
    }
  };

  const handleVpnServiceAction = async (protocol: string, action: 'start' | 'stop' | 'restart') => {
    try {
      const res = await fetch('/api/vpn-proxy/service-action', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authToken}`
        },
        body: JSON.stringify({ protocol, action })
      });
      if (res.ok) {
        const data = await res.json();
        showToast('success', data.message || `Service ${action}ed`);
        fetchVpnProxyData();
      } else {
        showToast('error', isRtl ? 'خطا در اجرای دستور سرویس' : 'Failed service action');
      }
    } catch (err) {
      showToast('error', isRtl ? 'خطا در ارتباط با سرور' : 'Connection error');
    }
  };

  const handleToggleRouteProtection = async (enabled: boolean) => {
    try {
      const res = await fetch('/api/vpn-proxy/route-protection', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authToken}`
        },
        body: JSON.stringify({ enabled })
      });
      if (res.ok) {
        const data = await res.json();
        if (data.settings) setVpnProxySettings(data.settings);
        showToast('success', data.message);
      }
    } catch (err) {
      showToast('error', isRtl ? 'خطا در تغییر وضعیت روت' : 'Failed to update route protection');
    }
  };

  const handleTestPanelRoute = async () => {
    setIsTestingRoute(true);
    try {
      const res = await fetch('/api/vpn-proxy/test-panel-route', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${authToken}` }
      });
      if (res.ok) {
        const data = await res.json();
        setRouteTestResult(data);
        showToast('success', isRtl ? 'تست پایداری ارتباط پنل با موفقیت انجام شد' : 'Panel route test passed');
      }
    } catch (err) {
      showToast('error', isRtl ? 'خطا در تست مسیر پنل' : 'Route test failed');
    } finally {
      setIsTestingRoute(false);
    }
  };

  const handleCreateVpnUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newVpnUser.trim() || !newVpnPass.trim()) return;
    setIsSavingVpnUser(true);
    try {
      const res = await fetch('/api/vpn-proxy/users', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authToken}`
        },
        body: JSON.stringify({
          username: newVpnUser.trim(),
          password: newVpnPass.trim(),
          protocols: newVpnProtocols,
          assignedIp: newVpnAssignedIp.trim() || 'Dynamic'
        })
      });
      if (res.ok) {
        showToast('success', isRtl ? 'کاربر VPN / پروکسی با موفقیت ایجاد گردید' : 'VPN user created successfully');
        setNewVpnUser('');
        setNewVpnPass('');
        setNewVpnAssignedIp('');
        fetchVpnProxyData();
      } else {
        showToast('error', isRtl ? 'خطا در ایجاد کاربر' : 'Failed to create user');
      }
    } catch (err) {
      showToast('error', isRtl ? 'خطا در ارتباط با سرور' : 'Connection error');
    } finally {
      setIsSavingVpnUser(false);
    }
  };

  const handleDeleteVpnUser = async (id: string) => {
    try {
      const res = await fetch(`/api/vpn-proxy/users/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${authToken}` }
      });
      if (res.ok) {
        showToast('success', isRtl ? 'کاربر با موفقیت حذف گردید' : 'User deleted successfully');
        fetchVpnProxyData();
      }
    } catch (err) {
      showToast('error', isRtl ? 'خطا در حذف کاربر' : 'Delete user failed');
    }
  };

  useEffect(() => {
    if (isCustomRole) {
      if (
        (activeSubTab === 'analytics' && !canViewAnalytics) ||
        (activeSubTab === 'rbac' && !canViewRbac) ||
        (activeSubTab === 'audit' && !canViewAudit) ||
        (activeSubTab === 'configLog' && !canViewConfigLog) ||
        (activeSubTab === 'sessionPanel' && !canViewSessionPanel)
      ) {
        if (canViewAnalytics) setActiveTab('analytics');
        else if (canViewRbac) setActiveTab('rbac');
        else if (canViewAudit) setActiveTab('audit');
        else if (canViewConfigLog) setActiveTab('configLog');
        else if (canViewSessionPanel) setActiveTab('sessionPanel');
      }
    }
  }, [isCustomRole, perms, activeSubTab, canViewAnalytics, canViewRbac, canViewAudit, canViewConfigLog, canViewSessionPanel]);

  // Security Rules State
  const [secLockoutEnabled, setSecLockoutEnabled] = useState<boolean>(true);
  const [secMaxFailedAttempts, setSecMaxFailedAttempts] = useState<number>(3);
  const [secLockoutDurationMinutes, setSecLockoutDurationMinutes] = useState<number>(15);
  const [secCaptchaEnabled, setSecCaptchaEnabled] = useState<boolean>(true);
  const [secCaptchaMode, setSecCaptchaMode] = useState<'always' | 'on_failed'>('on_failed');
  const [secCaptchaTriggerAttempts, setSecCaptchaTriggerAttempts] = useState<number>(2);
  const [lockedAccountsList, setLockedAccountsList] = useState<any[]>([]);
  const [isSavingSecurity, setIsSavingSecurity] = useState<boolean>(false);
  const [isLoadingSecurity, setIsLoadingSecurity] = useState<boolean>(false);

  const fetchSecuritySettings = async () => {
    setIsLoadingSecurity(true);
    try {
      const res = await fetch('/api/security/settings', {
        headers: { 'Authorization': `Bearer ${authToken}` }
      });
      if (res.ok) {
        const data = await res.json();
        if (typeof data.lockoutEnabled === 'boolean') setSecLockoutEnabled(data.lockoutEnabled);
        if (typeof data.maxFailedAttempts === 'number') setSecMaxFailedAttempts(data.maxFailedAttempts);
        if (typeof data.lockoutDurationMinutes === 'number') setSecLockoutDurationMinutes(data.lockoutDurationMinutes);
        if (typeof data.captchaEnabled === 'boolean') setSecCaptchaEnabled(data.captchaEnabled);
        if (data.captchaMode) setSecCaptchaMode(data.captchaMode);
        if (typeof data.captchaTriggerAttempts === 'number') setSecCaptchaTriggerAttempts(data.captchaTriggerAttempts);
        if (Array.isArray(data.lockedAccounts)) setLockedAccountsList(data.lockedAccounts);
      }
    } catch (e) {
      console.error('Error fetching security settings:', e);
    } finally {
      setIsLoadingSecurity(false);
    }
  };

  useEffect(() => {
    if (activeSubTab === 'securityRules') {
      fetchSecuritySettings();
    }
  }, [activeSubTab]);

  const handleSaveSecuritySettings = async () => {
    setIsSavingSecurity(true);
    try {
      const res = await fetch('/api/security/settings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authToken}`
        },
        body: JSON.stringify({
          lockoutEnabled: secLockoutEnabled,
          maxFailedAttempts: secMaxFailedAttempts,
          lockoutDurationMinutes: secLockoutDurationMinutes,
          captchaEnabled: secCaptchaEnabled,
          captchaMode: secCaptchaMode,
          captchaTriggerAttempts: secCaptchaTriggerAttempts
        })
      });
      if (res.ok) {
        showToast('success', isRtl ? 'تنظیمات امنیتی پنل با موفقیت ذخیره شد' : 'Panel security settings saved successfully');
        fetchSecuritySettings();
      } else {
        const err = await res.json();
        showToast('error', err.error || 'Failed to save security settings');
      }
    } catch (e: any) {
      showToast('error', e.message || 'Error saving security settings');
    } finally {
      setIsSavingSecurity(false);
    }
  };

  const handleUnlockUser = async (username: string) => {
    try {
      const res = await fetch('/api/security/unlock', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authToken}`
        },
        body: JSON.stringify({ username })
      });
      if (res.ok) {
        showToast('success', isRtl ? `قفل کاربر ${username} با موفقیت باز شد` : `Unlocked user ${username} successfully`);
        fetchSecuritySettings();
      } else {
        showToast('error', 'Failed to unlock user');
      }
    } catch (e) {
      showToast('error', 'Error unlocking user');
    }
  };

  // Session Panel State
  const [sessionTimeoutMinutes, setSessionTimeoutMinutesState] = useState<number>(() => {
    const saved = localStorage.getItem('panel_session_timeout_minutes');
    return saved !== null ? parseInt(saved, 10) : 15;
  });
  const [sessionWarningSeconds, setSessionWarningSeconds] = useState<number>(60);
  const [resetOnActivity, setResetOnActivity] = useState<boolean>(true);
  const [roleTimeouts, setRoleTimeouts] = useState<Record<string, number>>({
    Owner: 0,
    'Super Admin': 0,
    Moderator: 30,
    Viewer: 15,
    Custom: 15
  });
  const [isSavingSession, setIsSavingSession] = useState<boolean>(false);
  const [sessionElapsedSeconds, setSessionElapsedSeconds] = useState<number>(0);

  const fetchSessionSettings = async () => {
    try {
      const res = await fetch('/api/settings/session', {
        headers: { 'Authorization': `Bearer ${authToken}` }
      });
      if (res.ok) {
        const data = await res.json();
        if (typeof data.sessionTimeoutMinutes === 'number') {
          setSessionTimeoutMinutesState(data.sessionTimeoutMinutes);
          localStorage.setItem('panel_session_timeout_minutes', String(data.sessionTimeoutMinutes));
        }
        if (data.roleTimeouts) {
          setRoleTimeouts(data.roleTimeouts);
        }
      }
    } catch (err) {
      console.warn('Could not fetch server session settings', err);
    }
  };

  useEffect(() => {
    fetchSessionSettings();
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setSessionElapsedSeconds(prev => prev + 1);
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const handleSaveSessionSettings = async () => {
    setIsSavingSession(true);
    try {
      const res = await fetch('/api/settings/session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authToken}`
        },
        body: JSON.stringify({
          sessionTimeoutMinutes,
          warningTimeSeconds: sessionWarningSeconds,
          resetOnActivity,
          roleTimeouts
        })
      });

      localStorage.setItem('panel_session_timeout_minutes', String(sessionTimeoutMinutes));
      window.dispatchEvent(new CustomEvent('sessionSettingsUpdated', { detail: { sessionTimeoutMinutes } }));

      if (res.ok) {
        showToast('success', isRtl ? 'تنظیمات سشن پنل با موفقیت ذخیره شد' : 'Session Panel settings saved successfully');
      } else {
        showToast('success', isRtl ? 'تنظیمات سشن پنل به صورت محلی اعمال شد' : 'Session timeout updated locally');
      }
    } catch (err) {
      localStorage.setItem('panel_session_timeout_minutes', String(sessionTimeoutMinutes));
      window.dispatchEvent(new CustomEvent('sessionSettingsUpdated', { detail: { sessionTimeoutMinutes } }));
      showToast('success', isRtl ? 'تنظیمات سشن پنل ذخیره شد' : 'Session settings updated');
    } finally {
      setIsSavingSession(false);
    }
  };

  // Password Change Modal State
  const [changePasswordUser, setChangePasswordUser] = useState<PanelUser | null>(null);
  const [newPasswordInput, setNewPasswordInput] = useState<string>('');
  const [confirmPasswordInput, setConfirmPasswordInput] = useState<string>('');
  const [showPasswordText, setShowPasswordText] = useState<boolean>(false);
  const [isSavingPassword, setIsSavingPassword] = useState<boolean>(false);

  const handleGenerateRandomPassword = () => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*';
    let rand = '';
    for (let i = 0; i < 12; i++) {
      rand += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setNewPasswordInput(rand);
    setConfirmPasswordInput(rand);
    setShowPasswordText(true);
  };

  const handleSavePassword = async () => {
    if (!changePasswordUser) return;
    if (!newPasswordInput || newPasswordInput.length < 4) {
      showToast('error', isRtl ? 'کلمه عبور باید حداقل ۴ کاراکتر باشد' : 'Password must be at least 4 characters long');
      return;
    }
    if (newPasswordInput !== confirmPasswordInput) {
      showToast('error', isRtl ? 'تکرار کلمه عبور مطابقت ندارد' : 'Passwords do not match');
      return;
    }

    setIsSavingPassword(true);
    try {
      if (onChangeUserPassword) {
        await onChangeUserPassword(changePasswordUser.id, newPasswordInput);
      } else {
        const res = await fetch(`/api/users/${changePasswordUser.id}/password`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${authToken}`
          },
          body: JSON.stringify({ password: newPasswordInput })
        });
        if (!res.ok) {
          const data = await res.json();
          throw new Error(data.error || 'Failed to update password');
        }
        showToast('success', isRtl ? `رمز عبور کاربر @${changePasswordUser.username} با موفقیت تغییر یافت` : `Password updated for @${changePasswordUser.username}`);
      }
      setChangePasswordUser(null);
      setNewPasswordInput('');
      setConfirmPasswordInput('');
    } catch (err: any) {
      showToast('error', err?.message || (isRtl ? 'خطا در تغییر کلمه عبور' : 'Error updating password'));
    } finally {
      setIsSavingPassword(false);
    }
  };

  // Active User Sessions State & Actions
  const [activeSessionsList, setActiveSessionsList] = useState<any[]>([]);
  const [isLoadingActiveSessions, setIsLoadingActiveSessions] = useState(false);
  const [activeUserMenuId, setActiveUserMenuId] = useState<string | null>(null);
  const [activeSessionMenuId, setActiveSessionMenuId] = useState<string | null>(null);

  const fetchActiveSessions = async () => {
    setIsLoadingActiveSessions(true);
    try {
      const res = await fetch('/api/sessions/active', {
        headers: {
          'Authorization': `Bearer ${authToken}`
        }
      });
      if (res.ok) {
        const data = await res.json();
        if (data.sessions && Array.isArray(data.sessions)) {
          setActiveSessionsList(data.sessions);
        }
      }
    } catch (_) {
    } finally {
      setIsLoadingActiveSessions(false);
    }
  };

  useEffect(() => {
    if (activeSubTab === 'sessionPanel') {
      fetchActiveSessions();
    }
  }, [activeSubTab]);

  const handleKickSession = async (sessionId: string, targetUsername: string) => {
    if (!confirm(isRtl ? `آیا از اخراج و قطع نشست کاربر @${targetUsername} اطمینان دارید؟` : `Are you sure you want to terminate active session for @${targetUsername}?`)) {
      return;
    }
    try {
      const res = await fetch('/api/sessions/kick', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authToken}`
        },
        body: JSON.stringify({ sessionId, username: targetUsername })
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to terminate session');
      }
      showToast('success', isRtl ? `نشست کاربر @${targetUsername} با موفقیت قطع شد` : `Session for @${targetUsername} terminated`);
      fetchActiveSessions();
    } catch (err: any) {
      showToast('error', err.message || (isRtl ? 'خطا در قطع نشست کاربر' : 'Failed to terminate session'));
    }
  };

  // Config Audit Log States
  const [configLogs, setConfigLogs] = useState<ConfigLogItem[]>([]);
  const [configSearch, setConfigSearch] = useState('');
  const [selectedActionFilter, setSelectedActionFilter] = useState('ALL');
  const [selectedFileFilter, setSelectedFileFilter] = useState('ALL');
  const [selectedConfigLog, setSelectedConfigLog] = useState<ConfigLogItem | null>(null);
  const [isLoadingConfigLogs, setIsLoadingConfigLogs] = useState(false);

  const fetchConfigLogs = async (isManualRefresh = false) => {
    setIsLoadingConfigLogs(true);
    const startTime = Date.now();
    try {
      const res = await fetch('/api/logs/config', {
        headers: { 'Authorization': `Bearer ${authToken}` }
      });
      if (res.ok) {
        const data = await res.json();
        setConfigLogs(data);
        if (isManualRefresh) {
          showToast('success', isRtl ? 'لاگ‌های تغییرات کانفیگ به روزرسانی شد' : 'Config change logs updated successfully');
        }
      } else {
        if (isManualRefresh) {
          showToast('error', isRtl ? 'خطا در دریافت لاگ‌های کانفیگ' : 'Failed to fetch config logs');
        }
      }
    } catch (err) {
      console.error('Error fetching config logs:', err);
      if (isManualRefresh) {
        showToast('error', isRtl ? 'خطا در شبکه هنگام به‌روزرسانی' : 'Network error during refresh');
      }
    } finally {
      const elapsed = Date.now() - startTime;
      if (elapsed < 400) {
        await new Promise(resolve => setTimeout(resolve, 400 - elapsed));
      }
      setIsLoadingConfigLogs(false);
    }
  };

  useEffect(() => {
    if (activeSubTab === 'configLog') {
      fetchConfigLogs();
    }
  }, [activeSubTab]);

  const filteredConfigLogs = configLogs.filter(log => {
    const matchesSearch = 
      !configSearch ||
      log.filePath.toLowerCase().includes(configSearch.toLowerCase()) ||
      log.component.toLowerCase().includes(configSearch.toLowerCase()) ||
      log.diffSummary.toLowerCase().includes(configSearch.toLowerCase()) ||
      (log.fieldOrParam && log.fieldOrParam.toLowerCase().includes(configSearch.toLowerCase())) ||
      (log.username && log.username.toLowerCase().includes(configSearch.toLowerCase()));

    const matchesAction = selectedActionFilter === 'ALL' || log.action === selectedActionFilter;
    const matchesFile = selectedFileFilter === 'ALL' || log.filePath.includes(selectedFileFilter);

    return matchesSearch && matchesAction && matchesFile;
  });

  const exportConfigLogsToCsv = () => {
    if (!configLogs || configLogs.length === 0) {
      showToast('error', isRtl ? 'هیچ لاگ کانفیگی برای خروجی گرفتن وجود ندارد' : 'No config logs available to export');
      return;
    }

    const headers = isRtl
      ? ['زمان ثبت', 'اپراتور', 'نوع تغییر', 'مسیر فایل', 'ماژول', 'پارامتر', 'مقدار قبلی', 'مقدار جدید', 'خلاصه تغییرات', 'وضعیت']
      : ['Timestamp', 'Operator', 'Action', 'File Path', 'Component', 'Parameter', 'Old Value', 'New Value', 'Diff Summary', 'Status'];

    const rows = configLogs.map(log => [
      new Date(log.timestamp).toLocaleString(isRtl ? 'fa-IR' : 'en-US'),
      `@${log.username}`,
      log.action,
      log.filePath,
      log.component,
      log.fieldOrParam || '-',
      log.oldValue || '-',
      log.newValue || '-',
      log.diffSummary || '-',
      log.status
    ]);

    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.map(val => {
        const escaped = String(val).replace(/"/g, '""');
        return `"${escaped}"`;
      }).join(','))
    ].join('\n');

    const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `server_config_change_logs_${new Date().toISOString().slice(0,10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast('success', isRtl ? 'خروجی اکسل لاگ کانفیگ با موفقیت دانلود شد' : 'Config audit CSV export downloaded successfully');
  };

  const exportConfigLogsToHtml = () => {
    if (!configLogs || configLogs.length === 0) {
      showToast('error', isRtl ? 'هیچ لاگی برای خروجی گرفتن وجود ندارد' : 'No logs available to export');
      return;
    }

    const title = isRtl ? 'گزارش لاگ‌های تغییرات پیکربندی سرور (Config Audit)' : 'Server Configuration Change Audit Log';
    const generatedAt = isRtl ? 'تاریخ تولید گزارش' : 'Report Generated At';
    const totalLogsLabel = isRtl ? 'تعداد کل لاگ‌های کانفیگ' : 'Total Config Logs';
    
    const headers = isRtl 
      ? ['زمان ثبت', 'اپراتور', 'نوع تغییر', 'فایل مقصد در سرور', 'ماژول / پارامتر', 'تغییرات دقیق (اضافه/کم/ویرایش)', 'وضعیت']
      : ['Timestamp', 'Operator', 'Action', 'Target Server File', 'Module / Parameter', 'Exact Changes (Added/Removed/Updated)', 'Status'];

    const rowsHtml = configLogs.map(log => {
      const dateStr = new Date(log.timestamp).toLocaleString(isRtl ? 'fa-IR' : 'en-US');
      const statusClass = log.status === 'success' ? 'status-success' : 'status-failed';

      return `
        <tr>
          <td style="white-space: nowrap; color: #888;">${dateStr}</td>
          <td style="font-weight: bold; color: #fbbf24;">@${log.username}</td>
          <td><span style="padding: 2px 6px; background: rgba(245,158,11,0.2); color: #fbbf24; border-radius: 4px; font-weight: bold;">${log.action}</span></td>
          <td style="color: #38bdf8; font-family: monospace;">${log.filePath}</td>
          <td style="color: #e2e8f0;"><strong>${log.component}</strong><br><small style="color: #fbbf24;">${log.fieldOrParam || ''}</small></td>
          <td style="color: #cbd5e1;">${log.diffSummary}</td>
          <td><span class="status-badge ${statusClass}">${log.status}</span></td>
        </tr>
      `;
    }).join('');

    const htmlContent = `
      <!DOCTYPE html>
      <html lang="${isRtl ? 'fa' : 'en'}" dir="${isRtl ? 'rtl' : 'ltr'}">
      <head>
        <meta charset="UTF-8">
        <title>${title}</title>
        <style>
          body { background-color: #0b0f19; color: #e2e8f0; font-family: ${isRtl ? 'Tahoma, Arial, sans-serif' : 'sans-serif'}; margin: 0; padding: 40px 20px; line-height: 1.6; }
          .container { max-width: 1200px; margin: 0 auto; background: #111827; border-radius: 16px; padding: 30px; border: 1px solid rgba(255,255,255,0.1); }
          .header { display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid rgba(255,255,255,0.1); padding-bottom: 20px; margin-bottom: 25px; }
          h1 { margin: 0; color: #f59e0b; font-size: 22px; }
          table { width: 100%; border-collapse: collapse; font-size: 12px; }
          th { background: #1f2937; color: #9ca3af; text-align: ${isRtl ? 'right' : 'left'}; padding: 12px; font-weight: 600; text-transform: uppercase; }
          td { padding: 12px; border-bottom: 1px solid rgba(255,255,255,0.05); }
          .status-badge { padding: 3px 8px; border-radius: 12px; font-size: 10px; font-weight: bold; text-transform: uppercase; }
          .status-success { background: rgba(16, 185, 129, 0.2); color: #34d399; }
          .status-failed { background: rgba(239, 68, 68, 0.2); color: #f87171; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <div>
              <h1>${title}</h1>
              <p style="margin: 5px 0 0; color: #94a3b8; font-size: 14px;">
                ${isRtl ? 'کلون‌ماتریکس - ردیابی تغییرات فایل‌های سرور و پیکربندی هاست مقصد' : 'CloneMatrix - Destination Host File & Configuration Audit'}
              </p>
            </div>
            <div>
              <div><strong>${generatedAt}:</strong> ${new Date().toLocaleString(isRtl ? 'fa-IR' : 'en-US')}</div>
              <div><strong>${totalLogsLabel}:</strong> ${configLogs.length}</div>
            </div>
          </div>
          <table>
            <thead><tr>${headers.map(h => `<th>${h}</th>`).join('')}</tr></thead>
            <tbody>${rowsHtml}</tbody>
          </table>
        </div>
      </body>
      </html>
    `;

    const blob = new Blob([htmlContent], { type: 'text/html;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `server_config_change_logs_${new Date().toISOString().slice(0,10)}.html`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast('success', isRtl ? 'گزارش HTML لاگ کانفیگ با موفقیت دانلود شد' : 'HTML config log report downloaded successfully');
  };

  // New Panel User inputs
  const [newUsername, setNewUsername] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [newPass, setNewPass] = useState('');
  const [newRole, setNewPassRole] = useState('Viewer');
  const [newCustomPermissions, setNewCustomPermissions] = useState<CustomPermissions>(DEFAULT_CUSTOM_PERMISSIONS);
  const [includeSSL, setIncludeSSL] = useState(false);

  // Custom Permissions Modal States
  const [showPermissionsModalForUser, setShowPermissionsModalForUser] = useState<PanelUser | null>(null);
  const [showNewUserPermissionsModal, setShowNewUserPermissionsModal] = useState(false);
  const [modalPermissionsState, setModalPermissionsState] = useState<CustomPermissions>(DEFAULT_CUSTOM_PERMISSIONS);
  const [modalSearchQuery, setModalSearchQuery] = useState('');
  const [modalCategoryFilter, setModalCategoryFilter] = useState<'ALL' | 'MESSAGING' | 'USERS' | 'INFRA' | 'SECURITY'>('ALL');
  const [isSavingUserPermissions, setIsSavingUserPermissions] = useState(false);

  const handleToggleNewPermission = (key: keyof CustomPermissions) => {
    setNewCustomPermissions(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  const handleSelectAllNewPermissions = (enable: boolean) => {
    const updated = { ...newCustomPermissions };
    ALL_CUSTOM_PERMISSIONS_LIST.forEach(item => {
      updated[item.key] = enable;
    });
    setNewCustomPermissions(updated);
  };

  const handleToggleModalPermission = (key: keyof CustomPermissions) => {
    setModalPermissionsState(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  const handleSelectAllModalPermissions = (enable: boolean) => {
    const updated = { ...modalPermissionsState };
    ALL_CUSTOM_PERMISSIONS_LIST.forEach(item => {
      updated[item.key] = enable;
    });
    setModalPermissionsState(updated);
  };

  const handleClosePermissionsModal = () => {
    if (showNewUserPermissionsModal && newRole === 'Custom') {
      setNewPassRole('Viewer');
    }
    setShowPermissionsModalForUser(null);
    setShowNewUserPermissionsModal(false);
  };

  const handleOpenPermissionsModal = (user: PanelUser) => {
    setShowPermissionsModalForUser(user);
    setShowNewUserPermissionsModal(false);
    let initialPerms = user.permissions;
    if (!initialPerms || Object.keys(initialPerms).length === 0) {
      if (user.role && ROLE_PRESET_PERMISSIONS[user.role]) {
        initialPerms = ROLE_PRESET_PERMISSIONS[user.role];
      } else {
        initialPerms = DEFAULT_CUSTOM_PERMISSIONS;
      }
    }
    setModalPermissionsState(initialPerms);
    setModalSearchQuery('');
    setModalCategoryFilter('ALL');
  };

  const handleOpenNewUserPermissionsModal = () => {
    setShowNewUserPermissionsModal(true);
    setShowPermissionsModalForUser(null);
    setModalPermissionsState(newCustomPermissions);
    setModalSearchQuery('');
    setModalCategoryFilter('ALL');
  };

  // Advanced Backups States
  const [backupSettings, setBackupSettings] = useState<{
    backupPath: string;
    retentionDays: number;
    dbSchedule: { enabled: boolean, cron: string };
    configSchedule: { enabled: boolean, cron: string };
  }>({
    backupPath: '/sandbox/backups',
    retentionDays: 30,
    dbSchedule: { enabled: false, cron: '0 2 * * *' },
    configSchedule: { enabled: false, cron: '0 3 * * *' }
  });

  const [selectedBackupIds, setSelectedBackupIds] = useState<string[]>([]);
  const [isTriggeringBackup, setIsTriggeringBackup] = useState<boolean>(false);
  const [showRestoreModal, setShowRestoreModal] = useState<BackupItem | null>(null);
  const [isRestoring, setIsRestoring] = useState(false);
  const [activeBackupSubTab, setActiveBackupSubTab] = useState<'list' | 'settings'>('list');

  const exportToExcel = () => {
    if (!auditLogs || auditLogs.length === 0) {
      showToast('error', lang === 'fa' ? 'هیچ لاگی برای خروجی گرفتن وجود ندارد' : 'No logs available to export');
      return;
    }

    const headers = lang === 'fa' 
      ? ['زمان', 'کاربر', 'عملیات', 'بخش هدف', 'وضعیت', 'جزئیات']
      : ['Timestamp', 'User', 'Action', 'Target', 'Status', 'Details'];

    const rows = auditLogs.map(log => [
      new Date(log.timestamp).toLocaleString(lang === 'fa' ? 'fa-IR' : 'en-US'),
      `@${log.username}`,
      log.action,
      log.target || '-',
      log.status,
      log.details || '-'
    ]);

    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.map(val => {
        const escaped = String(val).replace(/"/g, '""');
        return `"${escaped}"`;
      }).join(','))
    ].join('\n');

    const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `security_audit_logs_${new Date().toISOString().slice(0,10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast('success', lang === 'fa' ? 'خروجی اکسل با موفقیت دانلود شد' : 'Excel/CSV export downloaded successfully');
  };

  const exportToHtml = () => {
    if (!auditLogs || auditLogs.length === 0) {
      showToast('error', lang === 'fa' ? 'هیچ لاگی برای خروجی گرفتن وجود ندارد' : 'No logs available to export');
      return;
    }

    const isFa = lang === 'fa';
    const title = isFa ? 'گزارش لاگ‌های امنیتی سیستم' : 'System Security Audit Logs Report';
    const generatedAt = isFa ? 'تاریخ تولید گزارش' : 'Report Generated At';
    const totalLogsLabel = isFa ? 'تعداد کل لاگ‌ها' : 'Total Log Entries';
    
    const headers = isFa 
      ? ['زمان ثبت', 'کاربر پرتال', 'نوع عملیات', 'هدف / ماژول', 'وضعیت', 'توضیحات و جزئیات']
      : ['Timestamp', 'Portal User', 'Action Type', 'Target / Module', 'Status', 'Details & Context'];

    const rowsHtml = auditLogs.map(log => {
      const dateStr = new Date(log.timestamp).toLocaleString(isFa ? 'fa-IR' : 'en-US');
      const statusClass = log.status === 'success' ? 'status-success' : 'status-failed';
      const statusText = isFa 
        ? (log.status === 'success' ? 'موفق' : 'ناموفق') 
        : log.status;

      return `
        <tr>
          <td style="white-space: nowrap; color: #888;">${dateStr}</td>
          <td style="font-weight: bold; color: #fff;">@${log.username}</td>
          <td>${log.action}</td>
          <td style="color: #38bdf8;">${log.target || '-'}</td>
          <td>
            <span class="status-badge ${statusClass}">${statusText}</span>
          </td>
          <td style="max-width: 300px; word-break: break-all; color: #cbd5e1;">${log.details || '-'}</td>
        </tr>
      `;
    }).join('');

    const htmlContent = `
      <!DOCTYPE html>
      <html lang="${isFa ? 'fa' : 'en'}" dir="${isFa ? 'rtl' : 'ltr'}">
      <head>
        <meta charset="UTF-8">
        <title>${title}</title>
        <style>
          body {
            background-color: #0b0f19;
            color: #e2e8f0;
            font-family: ${isFa ? 'Tahoma, Arial, sans-serif' : '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'};
            margin: 0;
            padding: 40px 20px;
            line-height: 1.6;
          }
          .container {
            max-width: 1200px;
            margin: 0 auto;
          }
          .header {
            border-bottom: 2px solid #1e293b;
            padding-bottom: 20px;
            margin-bottom: 30px;
            display: flex;
            justify-content: space-between;
            align-items: center;
            flex-wrap: wrap;
            gap: 15px;
          }
          h1 {
            margin: 0;
            font-size: 24px;
            color: #38bdf8;
          }
          .meta {
            font-size: 13px;
            color: #94a3b8;
            text-align: ${isFa ? 'left' : 'right'};
          }
          table {
            width: 100%;
            border-collapse: collapse;
            margin-top: 20px;
            box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
            border-radius: 8px;
            overflow: hidden;
            font-size: 13px;
          }
          th, td {
            padding: 14px 16px;
            text-align: ${isFa ? 'right' : 'left'};
            border-bottom: 1px solid #1e293b;
          }
          th {
            background-color: #0f172a;
            color: #94a3b8;
            font-weight: 600;
            text-transform: uppercase;
            font-size: 11px;
            letter-spacing: 0.05em;
          }
          tr:hover {
            background-color: #131b2e;
          }
          .status-badge {
            display: inline-block;
            padding: 4px 10px;
            border-radius: 9999px;
            font-size: 11px;
            font-weight: bold;
          }
          .status-success {
            background-color: rgba(16, 185, 129, 0.15);
            color: #34d399;
          }
          .status-failed {
            background-color: rgba(239, 68, 68, 0.15);
            color: #f87171;
          }
          @media print {
            body {
              background-color: #fff;
              color: #000;
              padding: 0;
            }
            th {
              background-color: #f1f5f9;
              color: #000;
            }
            tr:hover {
              background-color: transparent;
            }
            td, th {
              border-bottom: 1px solid #cbd5e1;
            }
            h1 {
              color: #000;
            }
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <div>
              <h1>${title}</h1>
              <p style="margin: 5px 0 0; color: #94a3b8; font-size: 14px;">
                ${isFa ? 'کلون‌ماتریکس - پنل نظارت و مانیتورینگ امنیتی' : 'CloneMatrix - Security Auditing & Operations Panel'}
              </p>
            </div>
            <div class="meta">
              <div><strong>${generatedAt}:</strong> ${new Date().toLocaleString(isFa ? 'fa-IR' : 'en-US')}</div>
              <div style="margin-top: 5px;"><strong>${totalLogsLabel}:</strong> ${auditLogs.length}</div>
            </div>
          </div>
          <table>
            <thead>
              <tr>
                ${headers.map(h => `<th>${h}</th>`).join('')}
              </tr>
            </thead>
            <tbody>
              ${rowsHtml}
            </tbody>
          </table>
        </div>
      </body>
      </html>
    `;

    const blob = new Blob([htmlContent], { type: 'text/html;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `security_audit_logs_${new Date().toISOString().slice(0,10)}.html`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast('success', lang === 'fa' ? 'گزارش HTML با موفقیت دانلود شد' : 'HTML log report downloaded successfully');
  };

  const fetchBackupSettings = async () => {
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
    if (activeSubTab === 'backups') {
      fetchBackupSettings();
    }
  }, [activeSubTab]);

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
        showToast('success', 'Backup settings saved successfully');
        fetchBackupSettings();
      } else {
        showToast('error', 'Error saving backup settings');
      }
    } catch (err) {
      showToast('error', 'Server connection error');
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
        showToast('success', `${type === 'config' ? 'Configuration' : 'Database'} backup created successfully`);
        onCreateBackup(includeSSL); // Trigger refresh in parent
      } else {
        showToast('error', 'Error creating backup');
      }
    } catch (err) {
      showToast('error', 'Server connection error');
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
      showToast('success', 'Backup file downloaded successfully');
    })
    .catch(() => showToast('error', 'Error downloading backup file'));
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
      showToast('success', 'Bulk backups downloaded successfully');
    })
    .catch(() => showToast('error', 'Error downloading bulk backups'));
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
        showToast('success', `Backup ${backup.filename} restored successfully. System recovered.`);
        setShowRestoreModal(null);
      } else {
        const err = await res.json();
        showToast('error', `Error restoring backup: ${err.error || 'Unknown error'}`);
      }
    } catch (err) {
      showToast('error', 'Connection error during backup restoration');
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
          showToast('success', 'Backup file uploaded and saved successfully');
          onCreateBackup(false); // Reload backups list from parent
        } else {
          showToast('error', 'Error uploading backup file');
        }
      } catch (err) {
        showToast('error', 'Error uploading backup file');
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
    if (selectedBackupIds.length === backups.length) {
      setSelectedBackupIds([]);
    } else {
      setSelectedBackupIds(backups.map(b => b.id));
    }
  };

  const isOwner = userRole === 'Owner';
  const isSuperAdmin = userRole === 'Super Admin';
  const isReadOnly = userRole === 'Viewer';

  const handleCreateUserSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newUsername.trim() || !newEmail.trim() || !newPass.trim()) return;
    onCreatePanelUser(
      newUsername.trim(), 
      newEmail.trim(), 
      newPass, 
      newRole, 
      newRole === 'Custom' ? newCustomPermissions : undefined
    );
    setNewUsername('');
    setNewEmail('');
    setNewPass('');
    setNewPassRole('Viewer');
    setNewCustomPermissions(DEFAULT_CUSTOM_PERMISSIONS);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 h-[calc(100vh-180px)] overflow-hidden" dir={isRtl ? "rtl" : "ltr"}>
      {/* Side selection */}
      <div className="spatial-glass rounded-3xl p-5 border border-white/5 flex flex-col gap-2 h-full overflow-y-auto">
        <h3 className={`text-sm font-display font-semibold text-slate-400 mb-3 px-3 uppercase tracking-wider ${isRtl ? 'text-right' : 'text-left'}`}>{t.titleReports}</h3>

        <button
          onClick={() => setActiveTab('analytics')}
          className={`flex items-center gap-3 px-4 py-3 rounded-2xl text-sm font-semibold transition-all ${isRtl ? 'flex-row-reverse text-right' : 'text-left'} ${
            activeSubTab === 'analytics' 
              ? 'bg-white/10 text-white border border-white/10 shadow-[0_0_12px_rgba(99,102,241,0.15)]' 
              : 'text-gray-400 hover:text-white hover:bg-white/5'
          }`}
        >
          <BarChart3 className="w-5 h-5 text-indigo-400" />
          <span>{t.tabAnalytics}</span>
        </button>

        <button
          onClick={() => setActiveTab('rbac')}
          className={`flex items-center gap-3 px-4 py-3 rounded-2xl text-sm font-semibold transition-all ${isRtl ? 'flex-row-reverse text-right' : 'text-left'} ${
            activeSubTab === 'rbac' 
              ? 'bg-white/10 text-white border border-white/10 shadow-[0_0_12px_rgba(168,85,247,0.15)]' 
              : 'text-gray-400 hover:text-white hover:bg-white/5'
          }`}
        >
          <ShieldCheck className="w-5 h-5 text-purple-400" />
          <span>{t.tabRbac}</span>
        </button>

        <button
          onClick={() => setActiveTab('audit')}
          className={`flex items-center gap-3 px-4 py-3 rounded-2xl text-sm font-semibold transition-all ${isRtl ? 'flex-row-reverse text-right' : 'text-left'} ${
            activeSubTab === 'audit' 
              ? 'bg-white/10 text-white border border-white/10 shadow-[0_0_12px_rgba(16,185,129,0.15)]' 
              : 'text-gray-400 hover:text-white hover:bg-white/5'
          }`}
        >
          <History className="w-5 h-5 text-emerald-400" />
          <span>{t.tabAudit}</span>
        </button>

        <button
          onClick={() => setActiveTab('configLog')}
          id="btn-tab-config-logs"
          className={`flex items-center gap-3 px-4 py-3 rounded-2xl text-sm font-semibold transition-all ${isRtl ? 'flex-row-reverse text-right' : 'text-left'} ${
            activeSubTab === 'configLog' 
              ? 'bg-white/10 text-white border border-white/10 shadow-[0_0_12px_rgba(245,158,11,0.15)]' 
              : 'text-gray-400 hover:text-white hover:bg-white/5'
          }`}
        >
          <Sliders className="w-5 h-5 text-amber-400" />
          <span>{(t as any).tabConfigLogs || (isRtl ? 'لاگ کانفیگ' : 'Config Logs')}</span>
        </button>

        {canViewSessionPanel && (
          <button
            onClick={() => setActiveTab('sessionPanel')}
            id="btn-tab-session-panel"
            className={`flex items-center gap-3 px-4 py-3 rounded-2xl text-sm font-semibold transition-all ${isRtl ? 'flex-row-reverse text-right' : 'text-left'} ${
              activeSubTab === 'sessionPanel' 
                ? 'bg-white/10 text-white border border-white/10 shadow-[0_0_12px_rgba(59,130,246,0.15)]' 
                : 'text-gray-400 hover:text-white hover:bg-white/5'
            }`}
          >
            <Clock className="w-5 h-5 text-blue-400" />
            <span>{isRtl ? 'سشن پنل (Session Panel)' : 'Session Panel'}</span>
          </button>
        )}

        {canViewRbac && (
          <button
            onClick={() => setActiveTab('securityRules')}
            id="btn-tab-security-rules"
            className={`flex items-center gap-3 px-4 py-3 rounded-2xl text-sm font-semibold transition-all ${isRtl ? 'flex-row-reverse text-right' : 'text-left'} ${
              activeSubTab === 'securityRules' 
                ? 'bg-white/10 text-white border border-white/10 shadow-[0_0_12px_rgba(244,63,94,0.15)]' 
                : 'text-gray-400 hover:text-white hover:bg-white/5'
            }`}
          >
            <Lock className="w-5 h-5 text-rose-400" />
            <span>{isRtl ? 'امنیت و قفل پنل (Panel Security)' : 'Panel Security & Lockout'}</span>
          </button>
        )}

        <button
          onClick={() => setActiveTab('vpnProxy')}
          id="btn-tab-vpn-proxy"
          className={`flex items-center gap-3 px-4 py-3 rounded-2xl text-sm font-semibold transition-all ${isRtl ? 'flex-row-reverse text-right' : 'text-left'} ${
            activeSubTab === 'vpnProxy' 
              ? 'bg-white/10 text-white border border-white/10 shadow-[0_0_12px_rgba(6,182,212,0.15)]' 
              : 'text-gray-400 hover:text-white hover:bg-white/5'
          }`}
        >
          <Network className="w-5 h-5 text-cyan-400" />
          <span>{isRtl ? 'راه‌اندازی VPN و پروکسی سرور' : 'VPN & Proxy Services'}</span>
        </button>
      </div>

      {/* Main Tab View */}
      <div className="lg:col-span-3 spatial-glass rounded-3xl p-6 border border-white/5 flex flex-col h-full overflow-y-auto">
        
        {/* VIEW 1: PERFORMANCE ANALYTICS */}
        {activeSubTab === 'analytics' && (
          <div className="space-y-6">
            <div className={`flex items-center gap-3 pb-4 border-b border-white/5 ${isRtl ? 'flex-row-reverse text-right' : 'text-left'}`}>
              <BarChart3 className="w-6 h-6 text-indigo-400" />
              <div>
                <h2 className="text-xl font-display font-bold text-white">{t.analyticsTitle}</h2>
                <p className="text-xs text-slate-400">{t.analyticsSub}</p>
              </div>
            </div>

            {stats ? (
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* CPU Trend Line Chart */}
                  <div className={`p-5 rounded-2xl border ${isLightMode ? 'bg-white border-slate-200 shadow-sm' : 'bg-black/25 border-white/5'}`}>
                    <div className={`flex items-center justify-between mb-4 ${isRtl ? 'flex-row-reverse' : ''}`}>
                      <h4 className={`text-xs font-bold font-display uppercase tracking-wider ${isLightMode ? 'text-slate-700' : 'text-slate-400'} flex items-center gap-1.5 ${isRtl ? 'flex-row-reverse' : ''}`}>
                        <Cpu className="w-4 h-4 text-indigo-500" />
                        {t.cpuUsage}
                      </h4>
                      <span className="text-xs font-semibold text-indigo-500">{stats.cpuUsage}% {t.live}</span>
                    </div>
                    <div className="h-48 w-full font-mono text-[10px]" dir="ltr">
                      <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={stats.trends}>
                          <CartesianGrid strokeDasharray="3 3" stroke={isLightMode ? '#e2e8f0' : 'rgba(255,255,255,0.05)'} />
                          <XAxis dataKey="time" stroke={isLightMode ? '#64748b' : '#64748b'} />
                          <YAxis domain={[0, 100]} stroke={isLightMode ? '#64748b' : '#64748b'} />
                          <Tooltip content={<CustomChartTooltip />} />
                          <Line type="monotone" dataKey="cpu" stroke="#6366f1" strokeWidth={2.5} dot={false} activeDot={{ r: 6 }} />
                        </LineChart>
                      </ResponsiveContainer>
                    </div>
                  </div>

                  {/* Memory Area Chart */}
                  <div className={`p-5 rounded-2xl border ${isLightMode ? 'bg-white border-slate-200 shadow-sm' : 'bg-black/25 border-white/5'}`}>
                    <div className={`flex items-center justify-between mb-4 ${isRtl ? 'flex-row-reverse' : ''}`}>
                      <h4 className={`text-xs font-bold font-display uppercase tracking-wider ${isLightMode ? 'text-slate-700' : 'text-slate-400'} flex items-center gap-1.5 ${isRtl ? 'flex-row-reverse' : ''}`}>
                        <History className="w-4 h-4 text-purple-500" />
                        {t.memoryUsage}
                      </h4>
                      <span className="text-xs font-semibold text-purple-500">{(stats.memoryTotal * (stats.memoryUsage / 100)).toFixed(1)} GB / {stats.memoryTotal} GB</span>
                    </div>
                    <div className="h-48 w-full font-mono text-[10px]" dir="ltr">
                      <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={stats.trends}>
                          <defs>
                            <linearGradient id="colorMem" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="5%" stopColor="#a855f7" stopOpacity={0.4}/>
                              <stop offset="95%" stopColor="#a855f7" stopOpacity={0}/>
                            </linearGradient>
                          </defs>
                          <CartesianGrid strokeDasharray="3 3" stroke={isLightMode ? '#e2e8f0' : 'rgba(255,255,255,0.05)'} />
                          <XAxis dataKey="time" stroke="#64748b" />
                          <YAxis domain={[0, 100]} stroke="#64748b" />
                          <Tooltip content={<CustomChartTooltip />} />
                          <Area type="monotone" dataKey="memory" stroke="#a855f7" fillOpacity={1} fill="url(#colorMem)" strokeWidth={2.5} />
                        </AreaChart>
                      </ResponsiveContainer>
                    </div>
                  </div>
                </div>

                {/* Active Users Area Chart */}
                <div className={`p-5 rounded-2xl border ${isLightMode ? 'bg-white border-slate-200 shadow-sm' : 'bg-black/25 border-white/5'}`}>
                  <div className={`flex items-center justify-between mb-4 ${isRtl ? 'flex-row-reverse' : ''}`}>
                    <h4 className={`text-xs font-bold font-display uppercase tracking-wider ${isLightMode ? 'text-slate-700' : 'text-slate-400'} flex items-center gap-1.5 ${isRtl ? 'flex-row-reverse' : ''}`}>
                      <Users className="w-4 h-4 text-emerald-500" />
                      {t.threadsTitle}
                    </h4>
                    <span className="text-xs font-semibold text-emerald-500">{stats.activeUsers} {t.syncing}</span>
                  </div>
                  <div className="h-48 w-full font-mono text-[10px]" dir="ltr">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={stats.trends}>
                        <defs>
                          <linearGradient id="colorUsers" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#10b981" stopOpacity={0.4}/>
                            <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke={isLightMode ? '#e2e8f0' : 'rgba(255,255,255,0.05)'} />
                        <XAxis dataKey="time" stroke="#64748b" />
                        <YAxis stroke="#64748b" />
                        <Tooltip content={<CustomChartTooltip />} />
                        <Area type="monotone" dataKey="activeUsers" stroke="#10b981" fillOpacity={1} fill="url(#colorUsers)" strokeWidth={2.5} />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                {/* Network Traffic & Disk IOPS Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Network Speed Chart */}
                  <div className={`p-5 rounded-2xl border ${isLightMode ? 'bg-white border-slate-200 shadow-sm' : 'bg-black/25 border-white/5'}`}>
                    <div className={`flex items-center justify-between mb-4 ${isRtl ? 'flex-row-reverse' : ''}`}>
                      <h4 className={`text-xs font-bold font-display uppercase tracking-wider ${isLightMode ? 'text-slate-700' : 'text-slate-400'} flex items-center gap-1.5 ${isRtl ? 'flex-row-reverse' : ''}`}>
                        <Wifi className="w-4 h-4 text-cyan-500" />
                        {t.networkTitle}
                      </h4>
                      <div className={`flex items-center gap-2 text-[11px] font-semibold font-mono ${isRtl ? 'flex-row-reverse' : ''}`}>
                        <span className="text-teal-500 flex items-center gap-0.5">
                          <ArrowDownLeft className="w-3 h-3" /> ↓ {stats.networkIn || 280} KB/s
                        </span>
                        <span className="text-indigo-500 flex items-center gap-0.5">
                          <ArrowUpRight className="w-3 h-3" /> ↑ {stats.networkOut || 540} KB/s
                        </span>
                      </div>
                    </div>
                    <div className="h-48 w-full font-mono text-[10px]" dir="ltr">
                      <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={stats.trends}>
                          <CartesianGrid strokeDasharray="3 3" stroke={isLightMode ? '#e2e8f0' : 'rgba(255,255,255,0.05)'} />
                          <XAxis dataKey="time" stroke="#64748b" />
                          <YAxis stroke="#64748b" />
                          <Tooltip content={<CustomChartTooltip />} />
                          <Line type="monotone" name={t.downloadSpeed} dataKey="networkIn" stroke="#14b8a6" strokeWidth={2} dot={false} />
                          <Line type="monotone" name={t.uploadSpeed} dataKey="networkOut" stroke="#6366f1" strokeWidth={2} dot={false} />
                        </LineChart>
                      </ResponsiveContainer>
                    </div>
                  </div>

                  {/* Disk IOPS and Latency Chart */}
                  <div className={`p-5 rounded-2xl border ${isLightMode ? 'bg-white border-slate-200 shadow-sm' : 'bg-black/25 border-white/5'}`}>
                    <div className={`flex items-center justify-between mb-4 ${isRtl ? 'flex-row-reverse' : ''}`}>
                      <h4 className={`text-xs font-bold font-display uppercase tracking-wider ${isLightMode ? 'text-slate-700' : 'text-slate-400'} flex items-center gap-1.5 ${isRtl ? 'flex-row-reverse' : ''}`}>
                        <Gauge className="w-4 h-4 text-amber-500" />
                        {t.diskIopsTitle}
                      </h4>
                      <div className={`flex items-center gap-2 text-[11px] font-semibold font-mono ${isRtl ? 'flex-row-reverse' : ''}`}>
                        <span className="text-amber-500">
                          IOPS: {stats.diskIops || 240} op/s
                        </span>
                        <span className="text-rose-500">
                          Latency: {stats.diskLatencyMs || 1.1} ms
                        </span>
                      </div>
                    </div>
                    <div className="h-48 w-full font-mono text-[10px]" dir="ltr">
                      <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={stats.trends}>
                          <defs>
                            <linearGradient id="colorIops" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.3}/>
                              <stop offset="95%" stopColor="#f59e0b" stopOpacity={0}/>
                            </linearGradient>
                          </defs>
                          <CartesianGrid strokeDasharray="3 3" stroke={isLightMode ? '#e2e8f0' : 'rgba(255,255,255,0.05)'} />
                          <XAxis dataKey="time" stroke="#64748b" />
                          <YAxis yAxisId="left" stroke="#f59e0b" />
                          <YAxis yAxisId="right" orientation="right" stroke="#f43f5e" domain={[0, 10]} />
                          <Tooltip content={<CustomChartTooltip />} />
                          <Area yAxisId="left" type="monotone" name={t.iopsLabel} dataKey="diskIops" stroke="#f59e0b" fillOpacity={1} fill="url(#colorIops)" strokeWidth={2} />
                          <Line yAxisId="right" type="monotone" name={t.latencyLabel} dataKey="diskLatencyMs" stroke="#f43f5e" strokeWidth={2} dot={false} />
                        </AreaChart>
                      </ResponsiveContainer>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="p-5 rounded-2xl bg-black/25 border border-white/5 space-y-4">
                    <div className="flex justify-between items-center">
                      <div className="h-4 w-32 bg-slate-800/20 rounded border border-white/[0.03] relative overflow-hidden">
                        <div className="shimmer-light-beam" />
                      </div>
                      <div className="h-4 w-16 bg-slate-800/20 rounded border border-white/[0.03] relative overflow-hidden">
                        <div className="shimmer-light-beam" />
                      </div>
                    </div>
                    <div className="h-48 w-full bg-slate-900/20 rounded-xl relative overflow-hidden border border-white/[0.03] flex items-center justify-center">
                      <div className="shimmer-light-beam" />
                      <span className="text-xs font-mono text-slate-500/70 z-10">{t.loadingStream}</span>
                    </div>
                  </div>

                  <div className="p-5 rounded-2xl bg-black/25 border border-white/5 space-y-4">
                    <div className="flex justify-between items-center">
                      <div className="h-4 w-32 bg-slate-800/20 rounded border border-white/[0.03] relative overflow-hidden">
                        <div className="shimmer-light-beam" />
                      </div>
                      <div className="h-4 w-20 bg-slate-800/20 rounded border border-white/[0.03] relative overflow-hidden">
                        <div className="shimmer-light-beam" />
                      </div>
                    </div>
                    <div className="h-48 w-full bg-slate-900/20 rounded-xl relative overflow-hidden border border-white/[0.03] flex items-center justify-center">
                      <div className="shimmer-light-beam" />
                      <span className="text-xs font-mono text-slate-500/70 z-10">{t.loadingStream}</span>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* VIEW 2: ROLE-BASED ACCESS CONTROL (RBAC) */}
        {activeSubTab === 'rbac' && (
          <div className="space-y-6">
            <div className={`flex items-center gap-3 pb-4 border-b border-white/5 ${isRtl ? 'flex-row-reverse text-right' : 'text-left'}`}>
              <ShieldCheck className="w-6 h-6 text-purple-400" />
              <div>
                <h2 className="text-xl font-display font-bold text-white">{t.rbacTitle}</h2>
                <p className="text-xs text-slate-400">{t.rbacSub}</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Left Form: Add Panel user */}
              <div className="spatial-glass rounded-2xl p-5 border border-white/5 h-fit">
                <h4 className={`text-sm font-semibold text-white mb-4 flex items-center gap-2 ${isRtl ? 'flex-row-reverse' : ''}`}>
                  <Plus className="w-4 h-4 text-purple-400" />
                  {t.grantAccess}
                </h4>

                <form onSubmit={handleCreateUserSubmit} className="space-y-4">
                  <div className={isRtl ? 'text-right' : 'text-left'}>
                    <label className="text-[10px] uppercase tracking-wider font-semibold text-slate-400 block mb-1">{t.username}</label>
                    <input
                      type="text"
                      value={newUsername}
                      onChange={(e) => setNewUsername(e.target.value)}
                      disabled={isReadOnly || !isOwner}
                      className="w-full bg-black/40 border border-white/10 rounded-xl px-3 py-2 text-xs text-slate-200 outline-none"
                      placeholder="e.g. admin_ali"
                    />
                  </div>

                  <div className={isRtl ? 'text-right' : 'text-left'}>
                    <label className="text-[10px] uppercase tracking-wider font-semibold text-slate-400 block mb-1">{t.email}</label>
                    <input
                      type="email"
                      value={newEmail}
                      onChange={(e) => setNewEmail(e.target.value)}
                      disabled={isReadOnly || !isOwner}
                      className="w-full bg-black/40 border border-white/10 rounded-xl px-3 py-2 text-xs text-slate-200 outline-none"
                      placeholder="e.g. ali@company.local"
                    />
                  </div>

                  <div className={isRtl ? 'text-right' : 'text-left'}>
                    <label className="text-[10px] uppercase tracking-wider font-semibold text-slate-400 block mb-1">{t.password}</label>
                    <input
                      type="password"
                      value={newPass}
                      onChange={(e) => setNewPass(e.target.value)}
                      disabled={isReadOnly || !isOwner}
                      className="w-full bg-black/40 border border-white/10 rounded-xl px-3 py-2 text-xs text-slate-200 outline-none"
                      placeholder="••••••••"
                    />
                  </div>

                  <div className={isRtl ? 'text-right' : 'text-left'}>
                    <label className="text-[10px] uppercase tracking-wider font-semibold text-slate-400 block mb-1">{t.authRole}</label>
                    <select
                      value={newRole}
                      onChange={(e) => {
                        const roleVal = e.target.value as any;
                        setNewPassRole(roleVal);
                        if (roleVal === 'Custom') {
                          handleOpenNewUserPermissionsModal();
                        }
                      }}
                      disabled={isReadOnly || !isOwner}
                      className="w-full bg-black/40 border border-white/10 rounded-xl px-3 py-2 text-xs text-slate-200 outline-none"
                    >
                      <option value="Viewer">Viewer {isRtl ? '(مانیتورینگ فقط خواندنی)' : '(Read-only status monitoring)'}</option>
                      <option value="Moderator">Moderator {isRtl ? '(مدیریت کاربران و چت‌ها)' : '(Manage users & DMs)'}</option>
                      <option value="Super Admin">Super Admin {isRtl ? '(تغییر تنظیمات سیستم)' : '(Change configurations)'}</option>
                      <option value="Owner">Owner {isRtl ? '(کنترل کامل سیستم)' : '(Full system control)'}</option>
                      <option value="Custom">Custom {isRtl ? '(سفارشی - تنظیم دقیق تاگل‌ها)' : '(Custom Granular Toggles)'}</option>
                    </select>
                  </div>

                  <button
                    type="submit"
                    disabled={isReadOnly || !isOwner || !newUsername.trim() || !newEmail.trim() || !newPass.trim()}
                    className="w-full py-2.5 rounded-xl bg-purple-500 text-white font-bold text-xs shadow-lg hover:scale-[1.02] transition-transform disabled:opacity-50 cursor-pointer"
                  >
                    {t.createBtn}
                  </button>
                </form>
              </div>

              {/* Right Table: Administrators */}
              <div className="md:col-span-2 space-y-3">
                <h4 className={`text-xs font-bold text-slate-400 uppercase tracking-wider px-1 ${isRtl ? 'text-right' : 'text-left'}`}>{t.activeOps}</h4>

                {panelUsers.map((u) => {
                  const isMainAdmin = u.username === 'admin';
                  const activePermCount = u.permissions 
                    ? Object.values(u.permissions).filter(Boolean).length 
                    : (u.role === 'Owner' || u.role === 'Super Admin' ? 14 : 4);
                  const isMenuOpen = activeUserMenuId === u.id;

                  return (
                    <div 
                      key={u.id} 
                      className={`spatial-glass rounded-2xl p-4 border flex flex-wrap items-center justify-between gap-3 w-full transition-all ${
                        isMenuOpen ? 'relative z-30 overflow-visible' : 'relative z-10'
                      } ${
                        isLightMode 
                          ? (isMenuOpen ? 'bg-white border-blue-400/60 shadow-md' : 'bg-slate-50/90 border-slate-200/80 hover:bg-white hover:border-slate-300') 
                          : (isMenuOpen ? 'bg-slate-900/90 border-blue-500/40 shadow-xl' : 'bg-white/5 border-white/5 hover:border-white/10')
                      } ${isRtl ? 'flex-row-reverse' : ''}`}
                    >
                      <div className={`flex items-center gap-3 min-w-0 flex-1 ${isRtl ? 'flex-row-reverse text-right' : 'text-left'}`}>
                        <img 
                          src={u.avatar || `https://api.dicebear.com/7.x/bottts/svg?seed=${u.username}`} 
                          alt={u.username} 
                          className={`w-10 h-10 rounded-xl p-0.5 border shrink-0 object-cover ${
                            isLightMode ? 'bg-slate-100 border-slate-200' : 'bg-slate-800 border-white/10'
                          }`} 
                        />
                        <div className="min-w-0 flex-1">
                          <h4 className={`text-sm font-semibold flex items-center gap-2 flex-wrap min-w-0 ${
                            isLightMode ? 'text-slate-900' : 'text-white'
                          } ${isRtl ? 'flex-row-reverse' : ''}`}>
                            <span className="truncate max-w-[130px] sm:max-w-[200px]">{u.username}</span>
                            {isMainAdmin && <span className="text-[9px] bg-red-500/10 text-red-500 px-1.5 py-0.5 rounded uppercase font-bold tracking-wider shrink-0">Root</span>}
                            {u.role === 'Custom' && (
                              <span className={`text-[9px] border px-1.5 py-0.5 rounded font-mono shrink-0 ${
                                isLightMode ? 'bg-purple-50 text-purple-700 border-purple-200' : 'bg-purple-500/15 text-purple-300 border-purple-500/30'
                              }`}>
                                {isRtl ? `سفارشی (${activePermCount}/14)` : `Custom (${activePermCount}/14)`}
                              </span>
                            )}
                          </h4>
                          <span className={`text-xs truncate block max-w-[160px] sm:max-w-[240px] ${
                            isLightMode ? 'text-slate-500' : 'text-slate-400'
                          }`}>{u.email}</span>
                        </div>
                      </div>

                      <div className={`flex items-center gap-2.5 shrink-0 ${isRtl ? 'flex-row-reverse' : ''}`}>
                        {/* Role selector dropdown */}
                        <select
                          value={u.role}
                          onChange={(e) => {
                            const selectedRole = e.target.value;
                            if (selectedRole === 'Custom') {
                              const existingPerms = u.permissions || DEFAULT_CUSTOM_PERMISSIONS;
                              onChangeUserRole(u.id, 'Custom', existingPerms);
                              handleOpenPermissionsModal({ ...u, role: 'Custom', permissions: existingPerms });
                            } else {
                              onChangeUserRole(u.id, selectedRole);
                            }
                          }}
                          disabled={isReadOnly || !isOwner || isMainAdmin}
                          className={`border rounded-xl px-2.5 py-1.5 text-xs focus:outline-none disabled:opacity-70 font-semibold cursor-pointer transition-colors ${
                            isLightMode 
                              ? 'bg-slate-100 border-slate-300 text-slate-800 hover:bg-slate-200/70' 
                              : 'bg-black/40 border-white/10 text-slate-200 hover:bg-black/60'
                          }`}
                        >
                          <option value="Viewer" className={isLightMode ? 'bg-white text-slate-900' : 'bg-slate-900 text-slate-100'}>Viewer</option>
                          <option value="Moderator" className={isLightMode ? 'bg-white text-slate-900' : 'bg-slate-900 text-slate-100'}>Moderator</option>
                          <option value="Super Admin" className={isLightMode ? 'bg-white text-slate-900' : 'bg-slate-900 text-slate-100'}>Super Admin</option>
                          <option value="Owner" className={isLightMode ? 'bg-white text-slate-900' : 'bg-slate-900 text-slate-100'}>Owner</option>
                          <option value="Custom" className={isLightMode ? 'bg-white text-slate-900' : 'bg-slate-900 text-slate-100'}>{isRtl ? 'سفارشی (Custom)' : 'Custom'}</option>
                        </select>

                        {/* 3-Dots Menu Button & Popup Dropdown */}
                        <div className="relative">
                          <button
                            type="button"
                            onClick={() => setActiveUserMenuId(isMenuOpen ? null : u.id)}
                            className={`p-1.5 rounded-xl border transition-all cursor-pointer flex items-center justify-center ${
                              isLightMode 
                                ? (isMenuOpen ? 'bg-blue-50 border-blue-300 text-blue-600' : 'bg-slate-100 hover:bg-slate-200 text-slate-700 border-slate-200') 
                                : (isMenuOpen ? 'bg-blue-500/20 border-blue-400/50 text-blue-300' : 'bg-white/5 hover:bg-white/10 text-slate-300 border-white/10')
                            }`}
                            title={isRtl ? 'منوی عملیات کاربر' : 'User Actions Menu'}
                          >
                            <MoreVertical className="w-4 h-4" />
                          </button>

                          {isMenuOpen && (
                            <>
                              <div 
                                className="fixed inset-0 z-40" 
                                onClick={() => setActiveUserMenuId(null)} 
                              />
                              <div className={`absolute ${isRtl ? 'left-0' : 'right-0'} top-full mt-1.5 w-48 rounded-2xl shadow-2xl p-1.5 z-50 space-y-1 backdrop-blur-xl border animate-in fade-in zoom-in-95 ${
                                isLightMode 
                                  ? 'bg-white/95 border-slate-200 text-slate-800 shadow-slate-300/40' 
                                  : 'bg-slate-900/95 border-white/15 text-slate-100 shadow-black/80'
                              }`}>
                                {(isOwner || isSuperAdmin) && (
                                  <button
                                    type="button"
                                    onClick={() => {
                                      setActiveUserMenuId(null);
                                      setChangePasswordUser(u);
                                      setNewPasswordInput('');
                                      setConfirmPasswordInput('');
                                      setShowPasswordText(false);
                                    }}
                                    className={`w-full px-3 py-2 rounded-xl text-xs font-semibold flex items-center gap-2.5 transition-all cursor-pointer ${
                                      isRtl ? 'flex-row-reverse text-right' : 'text-left'
                                    } ${
                                      isLightMode 
                                        ? 'hover:bg-amber-50 text-amber-800' 
                                        : 'hover:bg-amber-500/15 text-amber-300'
                                    }`}
                                  >
                                    <Key className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                                    <span>{isRtl ? 'تغییر پسورد' : 'Change Password'}</span>
                                  </button>
                                )}

                                {(u.role === 'Custom' || isOwner || isSuperAdmin) && !isMainAdmin && (
                                  <button
                                    type="button"
                                    onClick={() => {
                                      setActiveUserMenuId(null);
                                      handleOpenPermissionsModal(u);
                                    }}
                                    className={`w-full px-3 py-2 rounded-xl text-xs font-semibold flex items-center gap-2.5 transition-all cursor-pointer ${
                                      isRtl ? 'flex-row-reverse text-right' : 'text-left'
                                    } ${
                                      isLightMode 
                                        ? 'hover:bg-purple-50 text-purple-800' 
                                        : 'hover:bg-purple-500/15 text-purple-300'
                                    }`}
                                  >
                                    <ShieldCheck className="w-3.5 h-3.5 text-purple-500 shrink-0" />
                                    <span>{isRtl ? 'ویرایش دسترسی' : 'Edit Permissions'}</span>
                                  </button>
                                )}

                                {!isMainAdmin && (isOwner || isSuperAdmin) && (
                                  <button
                                    type="button"
                                    onClick={() => {
                                      setActiveUserMenuId(null);
                                      onDeletePanelUser(u.id);
                                    }}
                                    className={`w-full px-3 py-2 rounded-xl text-xs font-semibold flex items-center gap-2.5 transition-all cursor-pointer ${
                                      isRtl ? 'flex-row-reverse text-right' : 'text-left'
                                    } ${
                                      isLightMode 
                                        ? 'hover:bg-rose-50 text-rose-700' 
                                        : 'hover:bg-red-500/15 text-red-400'
                                    }`}
                                  >
                                    <UserX className="w-3.5 h-3.5 text-red-500 shrink-0" />
                                    <span>{isRtl ? 'حذف کاربر' : 'Delete User'}</span>
                                  </button>
                                )}
                              </div>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* CUSTOM PERMISSIONS HIGH-STYLE TABLE MODAL */}
        {(showPermissionsModalForUser || showNewUserPermissionsModal) && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-900/60 backdrop-blur-md animate-fadeIn">
            <div 
              className={`max-w-4xl w-full rounded-3xl p-6 border shadow-2xl space-y-4 max-h-[92vh] flex flex-col transition-all ${
                isLightMode 
                  ? 'bg-white border-purple-200 text-slate-800 shadow-purple-500/10' 
                  : 'bg-slate-950 border-purple-500/30 text-white shadow-purple-900/40'
              }`} 
              dir={isRtl ? "rtl" : "ltr"}
            >
              {/* Modal Header */}
              <div className={`flex items-center justify-between pb-4 border-b ${isLightMode ? 'border-slate-200' : 'border-white/10'}`}>
                <div className="flex items-center gap-3">
                  <div className={`p-2.5 rounded-2xl border ${isLightMode ? 'bg-purple-50 border-purple-200 text-purple-600' : 'bg-purple-500/20 border-purple-500/30 text-purple-400'}`}>
                    <Sliders className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className={`text-base font-extrabold flex items-center gap-2 ${isLightMode ? 'text-slate-900' : 'text-white'}`}>
                      {isRtl ? 'ماتریس تاگل‌های دسترسی سفارشی (Custom RBAC Matrix)' : 'Custom Role Permissions Matrix Table'}
                      {showPermissionsModalForUser ? (
                        <span className={`text-xs font-mono px-2.5 py-0.5 rounded-lg border ${
                          isLightMode ? 'bg-purple-100 text-purple-700 border-purple-200' : 'bg-purple-500/20 text-purple-300 border-purple-500/30'
                        }`}>
                          @{showPermissionsModalForUser.username}
                        </span>
                      ) : (
                        <span className={`text-xs font-mono px-2 py-0.5 rounded-lg border ${
                          isLightMode ? 'bg-blue-100 text-blue-700 border-blue-200' : 'bg-blue-500/20 text-blue-300 border-blue-500/30'
                        }`}>
                          {isRtl ? 'اپراتور جدید' : 'New Operator'}
                        </span>
                      )}
                    </h3>
                    <p className={`text-xs ${isLightMode ? 'text-slate-500' : 'text-slate-400'}`}>
                      {isRtl 
                        ? 'مشخص کنید این اپراتور به کدام بخش‌ها و قابلیت‌ها دسترسی دیدن یا تغییرات داشته باشد.' 
                        : 'Configure granular permission toggles and module access rights for this operator.'}
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handleClosePermissionsModal}
                  className={`p-2 rounded-xl transition-all cursor-pointer ${
                    isLightMode ? 'bg-slate-100 hover:bg-slate-200 text-slate-500 hover:text-slate-900' : 'bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white'
                  }`}
                >
                  <XCircle className="w-5 h-5" />
                </button>
              </div>

              {/* Controls Header: Search + Category Filter Tabs + Quick Actions */}
              <div className="space-y-3">
                <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
                  {/* Category Filter Pills */}
                  <div className={`flex items-center gap-1.5 p-1 rounded-2xl border w-full sm:w-auto overflow-x-auto ${
                    isLightMode ? 'bg-slate-100 border-slate-200' : 'bg-white/5 border-white/10'
                  }`}>
                    {[
                      { id: 'ALL', labelFa: 'همه', labelEn: 'All Modules' },
                      { id: 'MESSAGING', labelFa: 'پیام‌ها و روم‌ها', labelEn: 'Messaging & Rooms' },
                      { id: 'USERS', labelFa: 'مدیریت کاربران', labelEn: 'User Management' },
                      { id: 'INFRA', labelFa: 'کنترل هاب و زیرساخت', labelEn: 'Control Hub & Infra' },
                      { id: 'SECURITY', labelFa: 'امنیت و آنالیز', labelEn: 'Security & Settings' }
                    ].map((cat) => (
                      <button
                        key={cat.id}
                        type="button"
                        onClick={() => setModalCategoryFilter(cat.id as any)}
                        className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                          modalCategoryFilter === cat.id
                            ? 'bg-purple-600 text-white shadow-md shadow-purple-500/20'
                            : isLightMode ? 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60' : 'text-slate-400 hover:text-white hover:bg-white/5'
                        }`}
                      >
                        {isRtl ? cat.labelFa : cat.labelEn}
                      </button>
                    ))}
                  </div>

                  {/* Search Input */}
                  <div className="relative w-full sm:w-64">
                    <input
                      type="text"
                      value={modalSearchQuery}
                      onChange={(e) => setModalSearchQuery(e.target.value)}
                      placeholder={isRtl ? 'جستجو در دسترسی‌ها...' : 'Search permissions...'}
                      className={`w-full pl-9 pr-3 py-1.5 rounded-xl text-xs outline-none border transition-all ${
                        isLightMode 
                          ? 'bg-slate-50 border-slate-200 text-slate-800 focus:border-purple-500 focus:bg-white' 
                          : 'bg-black/40 border-white/10 text-white focus:border-purple-500'
                      }`}
                    />
                    <Filter className="w-3.5 h-3.5 absolute left-3 top-2.5 text-slate-400" />
                  </div>
                </div>

                {/* Select All / Preset Quick Template Bar */}
                <div className={`flex flex-col sm:flex-row items-center justify-between p-2.5 rounded-2xl border gap-2.5 ${
                  isLightMode ? 'bg-purple-50/50 border-purple-100' : 'bg-purple-500/5 border-purple-500/20'
                }`}>
                  <div className="flex items-center gap-2">
                    <span className={`text-xs font-bold ${isLightMode ? 'text-purple-900' : 'text-purple-200'}`}>
                      {isRtl ? 'وضعیت دسترسی‌ها:' : 'Matrix Status:'}
                    </span>
                    <span className={`text-xs font-mono font-bold px-2 py-0.5 rounded-lg border ${
                      isLightMode ? 'bg-white text-purple-700 border-purple-200' : 'bg-purple-500/20 text-purple-300 border-purple-500/30'
                    }`}>
                      {Object.values(modalPermissionsState).filter(Boolean).length} / {ALL_CUSTOM_PERMISSIONS_LIST.length} {isRtl ? 'فعال' : 'Active'}
                    </span>
                  </div>

                  <div className="flex flex-wrap items-center gap-1.5">
                    <span className={`text-[11px] font-semibold me-1 ${isLightMode ? 'text-slate-500' : 'text-slate-400'}`}>
                      {isRtl ? 'قالب‌های سریع:' : 'Quick Presets:'}
                    </span>
                    <button
                      type="button"
                      onClick={() => setModalPermissionsState(ROLE_PRESET_PERMISSIONS['Owner'])}
                      className="px-2.5 py-1 rounded-lg bg-emerald-500/15 hover:bg-emerald-500/25 border border-emerald-500/30 text-emerald-300 text-xs font-semibold transition-all cursor-pointer"
                      title={isRtl ? 'اعمال قالب کامل مالکین و ادمین‌ها' : 'Apply Full Owner/Admin Preset'}
                    >
                      {isRtl ? '👑 کامل (Admin/Owner)' : '👑 Full Admin'}
                    </button>
                    <button
                      type="button"
                      onClick={() => setModalPermissionsState(ROLE_PRESET_PERMISSIONS['Moderator'])}
                      className="px-2.5 py-1 rounded-lg bg-blue-500/15 hover:bg-blue-500/25 border border-blue-500/30 text-blue-300 text-xs font-semibold transition-all cursor-pointer"
                      title={isRtl ? 'اعمال قالب ناظرین' : 'Apply Moderator Preset'}
                    >
                      {isRtl ? '🛡️ ناظر' : '🛡️ Moderator'}
                    </button>
                    <button
                      type="button"
                      onClick={() => setModalPermissionsState(ROLE_PRESET_PERMISSIONS['Viewer'])}
                      className="px-2.5 py-1 rounded-lg bg-slate-500/15 hover:bg-slate-500/25 border border-slate-500/30 text-slate-300 text-xs font-semibold transition-all cursor-pointer"
                      title={isRtl ? 'اعمال قالب بیننده' : 'Apply Viewer Preset'}
                    >
                      {isRtl ? '👁️ بیننده' : '👁️ Viewer'}
                    </button>

                    <div className="h-4 w-px bg-white/10 mx-1 hidden sm:block" />

                    <button
                      type="button"
                      onClick={() => handleSelectAllModalPermissions(true)}
                      className="px-2.5 py-1 rounded-lg bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold shadow-sm transition-all cursor-pointer"
                    >
                      {isRtl ? 'فعال‌سازی همه' : 'Enable All'}
                    </button>
                    <button
                      type="button"
                      onClick={() => handleSelectAllModalPermissions(false)}
                      className={`px-2.5 py-1 rounded-lg text-xs font-medium border transition-all cursor-pointer ${
                        isLightMode ? 'bg-white border-slate-200 text-slate-600 hover:bg-slate-100' : 'bg-white/5 border-white/10 text-slate-300 hover:bg-white/10'
                      }`}
                    >
                      {isRtl ? 'غیرفعال‌سازی همه' : 'Disable All'}
                    </button>
                  </div>
                </div>
              </div>

              {/* SLEEK PERMISSIONS TABLE */}
              <div className={`flex-1 overflow-y-auto rounded-2xl border ${isLightMode ? 'border-slate-200 bg-white' : 'border-white/10 bg-black/20'}`}>
                <table className="w-full text-right border-collapse text-xs" dir={isRtl ? 'rtl' : 'ltr'}>
                  <thead>
                    <tr className={`text-[11px] font-bold uppercase tracking-wider ${
                      isLightMode ? 'bg-slate-100 text-slate-600 border-b border-slate-200' : 'bg-white/5 text-slate-400 border-b border-white/10'
                    }`}>
                      <th className="p-3 text-center w-16">{isRtl ? 'وضعیت' : 'Status'}</th>
                      <th className="p-3 text-start">{isRtl ? 'عنوان ویژگی / دسترسی' : 'Permission Name'}</th>
                      <th className="p-3 text-start">{isRtl ? 'ماژول' : 'Module'}</th>
                      <th className="p-3 text-start">{isRtl ? 'توضیحات و دامنه دسترسی' : 'Description & Scope'}</th>
                      <th className="p-3 text-center w-24">{isRtl ? 'تاگل کلید' : 'Toggle'}</th>
                    </tr>
                  </thead>
                  <tbody className={`divide-y ${isLightMode ? 'divide-slate-100' : 'divide-white/5'}`}>
                    {ALL_CUSTOM_PERMISSIONS_LIST
                      .filter((perm) => {
                        const matchesCat = modalCategoryFilter === 'ALL' || perm.moduleGroup === modalCategoryFilter;
                        if (!matchesCat) return false;
                        if (!modalSearchQuery.trim()) return true;
                        const query = modalSearchQuery.toLowerCase();
                        const title = isRtl ? perm.labelFa : perm.labelEn;
                        const desc = isRtl ? perm.descFa : perm.descEn;
                        const cat = isRtl ? perm.categoryFa : perm.categoryEn;
                        return title.toLowerCase().includes(query) || desc.toLowerCase().includes(query) || cat.toLowerCase().includes(query);
                      })
                      .map((perm) => {
                        const isEnabled = modalPermissionsState[perm.key] ?? false;
                        return (
                          <tr
                            key={perm.key}
                            onClick={() => handleToggleModalPermission(perm.key)}
                            className={`cursor-pointer transition-colors ${
                              isEnabled 
                                ? (isLightMode ? 'bg-purple-50/60 hover:bg-purple-100/60' : 'bg-purple-500/10 hover:bg-purple-500/15') 
                                : (isLightMode ? 'hover:bg-slate-50' : 'hover:bg-white/5')
                            }`}
                          >
                            <td className="p-3 text-center">
                              <div className={`w-5 h-5 rounded-md mx-auto flex items-center justify-center border transition-all ${
                                isEnabled 
                                  ? 'bg-purple-600 border-purple-600 text-white' 
                                  : (isLightMode ? 'border-slate-300 bg-slate-100' : 'border-white/20 bg-black/40')
                              }`}>
                                {isEnabled && <CheckSquare className="w-3.5 h-3.5 text-white" />}
                              </div>
                            </td>

                            <td className="p-3 font-semibold">
                              <span className={isEnabled ? (isLightMode ? 'text-purple-950 font-bold' : 'text-purple-100 font-bold') : (isLightMode ? 'text-slate-800' : 'text-slate-200')}>
                                {isRtl ? perm.labelFa : perm.labelEn}
                              </span>
                            </td>

                            <td className="p-3 whitespace-nowrap">
                              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md border ${
                                isLightMode 
                                  ? 'bg-slate-100 text-slate-700 border-slate-200' 
                                  : 'bg-white/5 text-purple-300 border-white/10'
                              }`}>
                                {isRtl ? perm.categoryFa : perm.categoryEn}
                              </span>
                            </td>

                            <td className="p-3">
                              <span className={`text-xs ${isLightMode ? 'text-slate-500' : 'text-slate-400'}`}>
                                {isRtl ? perm.descFa : perm.descEn}
                              </span>
                            </td>

                            <td className="p-3 text-center">
                              <div className={`w-11 h-6 rounded-full p-1 transition-colors relative flex items-center shrink-0 mx-auto ${
                                isEnabled ? 'bg-purple-600' : (isLightMode ? 'bg-slate-300' : 'bg-slate-700')
                              }`}>
                                <div className={`w-4 h-4 rounded-full bg-white shadow-md transform transition-transform ${
                                  isEnabled ? (isRtl ? '-translate-x-5' : 'translate-x-5') : 'translate-x-0'
                                }`} />
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                  </tbody>
                </table>
              </div>

              {/* Action Footer */}
              <div className={`pt-3 border-t flex items-center justify-between gap-3 ${isLightMode ? 'border-slate-200' : 'border-white/10'}`}>
                <div className="text-xs text-slate-400">
                  {isRtl ? 'تعداد کل آیتم‌ها:' : 'Total Permissions:'} <strong className={isLightMode ? 'text-slate-800' : 'text-white'}>{ALL_CUSTOM_PERMISSIONS_LIST.length}</strong>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={handleClosePermissionsModal}
                    className={`px-4 py-2 rounded-xl text-xs font-semibold cursor-pointer border transition-all ${
                      isLightMode 
                        ? 'bg-slate-100 border-slate-200 text-slate-700 hover:bg-slate-200' 
                        : 'bg-white/5 border-white/10 text-slate-300 hover:bg-white/10'
                    }`}
                  >
                    {isRtl ? 'انصراف' : 'Cancel'}
                  </button>
                  <button
                    type="button"
                    onClick={async () => {
                      setIsSavingUserPermissions(true);
                      try {
                        if (showNewUserPermissionsModal) {
                          setNewCustomPermissions(modalPermissionsState);
                          setNewPassRole('Custom');
                          showToast('success', isRtl ? 'ماتریس دسترسی‌ها برای اپراتور جدید تنظیم شد' : 'Permission matrix set for new operator');
                          setShowNewUserPermissionsModal(false);
                        } else if (showPermissionsModalForUser) {
                          const targetId = showPermissionsModalForUser.id || showPermissionsModalForUser.username;
                          const isOwnerOrAdmin = showPermissionsModalForUser.username === 'admin' || showPermissionsModalForUser.role === 'Owner';
                          if (onUpdateUserPermissions) {
                            await onUpdateUserPermissions(targetId, modalPermissionsState);
                          } else {
                            const targetRole = isOwnerOrAdmin ? 'Owner' : 'Custom';
                            await onChangeUserRole(targetId, targetRole, modalPermissionsState);
                          }
                          showToast('success', isRtl ? `دسترسی‌های یوزر @${showPermissionsModalForUser.username} با موفقیت ذخیره شد` : `Custom permissions saved for @${showPermissionsModalForUser.username}`);
                          setShowPermissionsModalForUser(null);
                        }
                      } catch (err: any) {
                        showToast('error', err?.message || (isRtl ? 'خطا در ذخیره دسترسی‌ها' : 'Error saving permissions'));
                      } finally {
                        setIsSavingUserPermissions(false);
                      }
                    }}
                    disabled={isSavingUserPermissions}
                    className="px-5 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold shadow-lg shadow-purple-500/25 transition-all cursor-pointer flex items-center gap-1.5 disabled:opacity-50"
                  >
                    {isSavingUserPermissions ? (
                      <RefreshCw className="w-4 h-4 animate-spin text-white" />
                    ) : (
                      <CheckSquare className="w-4 h-4 text-white" />
                    )}
                    <span>{isRtl ? 'ثبت و اعمال ماتریس دسترسی‌ها' : 'Save Permissions Matrix'}</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* VIEW 3: SECURITY AUDIT LOGS */}
        {activeSubTab === 'audit' && (
          <div className="space-y-6 flex-1 flex flex-col h-full overflow-hidden">
            <div className={`flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4 border-b border-white/5 ${isRtl ? 'flex-row-reverse text-right' : 'text-left'}`}>
              <div className={`flex items-center gap-3 ${isRtl ? 'flex-row-reverse text-right' : 'text-left'}`}>
                <History className={`w-6 h-6 ${isLightMode ? 'text-emerald-600' : 'text-emerald-400'}`} />
                <div>
                  <h2 className={`text-xl font-display font-bold ${isLightMode ? 'text-slate-800' : 'text-white'}`}>
                    {t.auditTitle}
                  </h2>
                  <p className={`text-xs ${isLightMode ? 'text-slate-500' : 'text-slate-400'}`}>
                    {t.auditSub}
                  </p>
                </div>
              </div>

              {/* Export Buttons */}
              <div className={`flex items-center gap-2 ${isRtl ? 'flex-row-reverse' : ''}`}>
                <button
                  onClick={exportToExcel}
                  id="btn-export-excel"
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all cursor-pointer ${
                    isLightMode 
                      ? 'bg-emerald-50 border-emerald-200 text-emerald-700 hover:bg-emerald-100 shadow-sm' 
                      : 'bg-emerald-600/10 border-emerald-500/20 text-emerald-400 hover:bg-emerald-500/20'
                  }`}
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>{t.exportCsv}</span>
                </button>

                <button
                  onClick={exportToHtml}
                  id="btn-export-html"
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all cursor-pointer ${
                    isLightMode 
                      ? 'bg-blue-50 border-blue-200 text-blue-700 hover:bg-blue-100 shadow-sm' 
                      : 'bg-blue-600/10 border-blue-500/20 text-blue-400 hover:bg-blue-500/20'
                  }`}
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>{t.exportHtml}</span>
                </button>
              </div>
            </div>

            <div className={`flex-1 rounded-2xl border overflow-y-auto pr-1 ${
              isLightMode 
                ? 'bg-slate-50 border-slate-200 shadow-inner' 
                : 'bg-black/30 border-white/5'
            }`}>
              <table className={`w-full border-collapse font-mono text-xs ${isRtl ? 'text-right' : 'text-left'}`}>
                <thead>
                  <tr className={`border-b text-[10px] tracking-wider uppercase font-semibold ${
                    isLightMode 
                      ? 'border-slate-200 text-slate-500 bg-slate-100/80' 
                      : 'border-white/10 text-slate-400 bg-black/20'
                  }`}>
                    <th className="p-4">{t.timeCol}</th>
                    <th className="p-4">{t.userCol}</th>
                    <th className="p-4">{t.actionTypeCol}</th>
                    <th className="p-4">{t.targetCol}</th>
                    <th className="p-4">{t.statusCol}</th>
                  </tr>
                </thead>
                <tbody className={`divide-y ${
                  isLightMode 
                    ? 'divide-slate-200 text-slate-700' 
                    : 'divide-white/5 text-slate-300'
                }`}>
                  {auditLogs.map((log) => {
                    const getStatusText = (status: string) => {
                      if (status === 'success') {
                        if (lang === 'fa') return 'موفق';
                        if (lang === 'ar') return 'ناجح';
                        if (lang === 'es') return 'Éxito';
                        if (lang === 'de') return 'Erfolgreich';
                        if (lang === 'ru') return 'Успешно';
                        return 'Success';
                      } else {
                        if (lang === 'fa') return 'ناموفق';
                        if (lang === 'ar') return 'فشل';
                        if (lang === 'es') return 'Fallido';
                        if (lang === 'de') return 'Fehlgeschlagen';
                        if (lang === 'ru') return 'Ошибка';
                        return 'Failed';
                      }
                    };
                    return (
                      <tr key={log.id} className={`transition-colors ${
                        isLightMode ? 'hover:bg-slate-100/50' : 'hover:bg-white/5'
                      }`}>
                        <td className={`p-4 whitespace-nowrap ${isLightMode ? 'text-slate-500' : 'text-slate-400'}`}>
                          {new Date(log.timestamp).toLocaleString(['fa', 'ar'].includes(lang) ? 'fa-IR' : 'en-US')}
                        </td>
                        <td className={`p-4 font-semibold ${isLightMode ? 'text-slate-800' : 'text-white'}`}>
                          @{log.username}
                        </td>
                        <td className="p-4">
                          {log.action}
                        </td>
                        <td className={`p-4 font-medium ${isLightMode ? 'text-sky-600' : 'text-cyan-400'}`}>
                          {log.target || '-'}
                        </td>
                        <td className="p-4">
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold font-sans uppercase ${
                            log.status === 'success' 
                              ? (isLightMode ? 'bg-emerald-100 text-emerald-800' : 'bg-emerald-500/10 text-emerald-400') 
                              : (isLightMode ? 'bg-red-100 text-red-800' : 'bg-red-500/10 text-red-400')
                          }`}>
                            {getStatusText(log.status)}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* VIEW 5: CONFIG AUDIT LOGS (لاگ کانفیگ) */}
        {activeSubTab === 'configLog' && (
          <div className="space-y-6 flex-1 flex flex-col h-full overflow-hidden">
            {/* Header section with Title, Subtitle, and Actions */}
            <div className={`flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4 border-b border-white/5 ${isRtl ? 'flex-row-reverse text-right' : 'text-left'}`}>
              <div className={`flex items-center gap-3 ${isRtl ? 'flex-row-reverse text-right' : 'text-left'}`}>
                <Sliders className={`w-6 h-6 ${isLightMode ? 'text-amber-600' : 'text-amber-400'}`} />
                <div>
                  <h2 className={`text-xl font-display font-bold ${isLightMode ? 'text-slate-800' : 'text-white'}`}>
                    {(t as any).configLogTitle || (isRtl ? 'لاگ تغییرات پیکربندی و فایل‌های سرور' : 'Server Configuration & File Audit Log')}
                  </h2>
                  <p className={`text-xs ${isLightMode ? 'text-slate-500' : 'text-slate-400'}`}>
                    {(t as any).configLogSub || (isRtl ? 'ردیابی دقیق فایل‌های تغییریافته، پارامترهای کم و زیاد شده، مقدار قبلی/جدید و مسیر فایل‌ها در سرور مقصد.' : 'Detailed tracking of server file modifications, added/removed parameters, configuration deltas, and exact file paths on target host.')}
                  </p>
                </div>
              </div>

              {/* Action Buttons: Export & Refresh */}
              <div className={`flex items-center gap-2 ${isRtl ? 'flex-row-reverse' : ''}`}>
                <button
                  onClick={() => fetchConfigLogs(true)}
                  disabled={isLoadingConfigLogs}
                  id="btn-refresh-config-logs"
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all cursor-pointer ${
                    isLoadingConfigLogs ? 'opacity-70 cursor-not-allowed bg-amber-500/20 text-amber-300 border-amber-500/30' : ''
                  } ${
                    isLightMode 
                      ? 'bg-slate-100 border-slate-300 text-slate-700 hover:bg-slate-200 shadow-sm' 
                      : 'bg-white/5 border-white/10 text-slate-300 hover:bg-white/10'
                  }`}
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${isLoadingConfigLogs ? 'animate-spin text-amber-400' : ''}`} />
                  <span>
                    {isLoadingConfigLogs 
                      ? (isRtl ? 'در حال به‌روزرسانی...' : 'Refreshing...') 
                      : (isRtl ? 'به‌روزرسانی' : 'Refresh')}
                  </span>
                </button>

                <button
                  onClick={exportConfigLogsToCsv}
                  id="btn-export-config-csv"
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all cursor-pointer ${
                    isLightMode 
                      ? 'bg-amber-50 border-amber-200 text-amber-800 hover:bg-amber-100 shadow-sm' 
                      : 'bg-amber-500/10 border-amber-500/20 text-amber-400 hover:bg-amber-500/20'
                  }`}
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>{t.exportCsv}</span>
                </button>

                <button
                  onClick={exportConfigLogsToHtml}
                  id="btn-export-config-html"
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all cursor-pointer ${
                    isLightMode 
                      ? 'bg-blue-50 border-blue-200 text-blue-700 hover:bg-blue-100 shadow-sm' 
                      : 'bg-blue-600/10 border-blue-500/20 text-blue-400 hover:bg-blue-500/20'
                  }`}
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>{t.exportHtml}</span>
                </button>
              </div>
            </div>

            {/* Config Audit Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className={`p-4 rounded-2xl border ${isLightMode ? 'bg-white border-slate-200 shadow-sm' : 'bg-black/25 border-white/5'}`}>
                <div className="text-xs text-slate-400 font-medium mb-1">{isRtl ? 'کل لاگ‌های تغییر کانفیگ' : 'Total Config Change Logs'}</div>
                <div className="text-2xl font-bold font-mono text-amber-400">{configLogs.length}</div>
              </div>
              <div className={`p-4 rounded-2xl border ${isLightMode ? 'bg-white border-slate-200 shadow-sm' : 'bg-black/25 border-white/5'}`}>
                <div className="text-xs text-slate-400 font-medium mb-1">{isRtl ? 'فایل‌های مقصد اصلاح‌شده' : 'Modified Server Files'}</div>
                <div className="text-2xl font-bold font-mono text-cyan-400">
                  {Array.from(new Set(configLogs.map(l => l.filePath))).length}
                </div>
              </div>
              <div className={`p-4 rounded-2xl border ${isLightMode ? 'bg-white border-slate-200 shadow-sm' : 'bg-black/25 border-white/5'}`}>
                <div className="text-xs text-slate-400 font-medium mb-1">{isRtl ? 'آخرین تغییر ثبت‌شده' : 'Last Change Recorded'}</div>
                <div className="text-xs font-bold font-mono text-emerald-400 truncate">
                  {configLogs[0] ? new Date(configLogs[0].timestamp).toLocaleString(isRtl ? 'fa-IR' : 'en-US') : '-'}
                </div>
              </div>
            </div>

            {/* Filter & Search Bar */}
            <div className={`flex flex-col sm:flex-row gap-3 ${isRtl ? 'flex-row-reverse' : ''}`}>
              <div className="relative flex-1">
                <Search className={`w-4 h-4 absolute ${isRtl ? 'right-3' : 'left-3'} top-1/2 -translate-y-1/2 text-slate-400`} />
                <input
                  type="text"
                  value={configSearch}
                  onChange={(e) => setConfigSearch(e.target.value)}
                  placeholder={isRtl ? "جستجو در لاگ‌ها (نام فایل، پارامتر، کاربر، تغییرات...)" : "Search config logs (file path, parameter, user, changes...)"}
                  className={`w-full ${isRtl ? 'pr-9 pl-3' : 'pl-9 pr-3'} py-2 rounded-xl text-xs font-mono border transition-all focus:outline-none ${
                    isLightMode 
                      ? 'bg-white border-slate-200 text-slate-800 focus:border-indigo-500' 
                      : 'bg-black/30 border-white/10 text-slate-200 focus:border-amber-500'
                  }`}
                />
              </div>

              {/* Action Filter */}
              <select
                value={selectedActionFilter}
                onChange={(e) => setSelectedActionFilter(e.target.value)}
                className={`px-3 py-2 rounded-xl text-xs border font-mono transition-all focus:outline-none ${
                  isLightMode ? 'bg-white border-slate-200 text-slate-800' : 'bg-black/30 border-white/10 text-slate-200'
                }`}
              >
                <option value="ALL">{isRtl ? 'همه نوع تغییرات' : 'All Actions'}</option>
                <option value="UPDATE">{isRtl ? 'ویرایش / تغییر (UPDATE)' : 'UPDATE'}</option>
                <option value="ADD">{isRtl ? 'افزودن پارامتر (ADD)' : 'ADD'}</option>
                <option value="DELETE">{isRtl ? 'حذف / کاهش (DELETE)' : 'DELETE'}</option>
                <option value="POLICY">{isRtl ? 'تغییر خط‌مشی (POLICY)' : 'POLICY'}</option>
                <option value="RESTORE">{isRtl ? 'بازنشانی بک‌آپ (RESTORE)' : 'RESTORE'}</option>
              </select>

              {/* File Filter */}
              <select
                value={selectedFileFilter}
                onChange={(e) => setSelectedFileFilter(e.target.value)}
                className={`px-3 py-2 rounded-xl text-xs border font-mono transition-all focus:outline-none ${
                  isLightMode ? 'bg-white border-slate-200 text-slate-800' : 'bg-black/30 border-white/10 text-slate-200'
                }`}
              >
                <option value="ALL">{isRtl ? 'همه فایل‌های سرور' : 'All Files'}</option>
                <option value="homeserver.yaml">homeserver.yaml</option>
                <option value="config.json">config.json (Element)</option>
                <option value="matrix-stack.conf">matrix-stack.conf</option>
                <option value="auto_join_rooms.yaml">auto_join_rooms.yaml</option>
              </select>
            </div>

            {/* Table of Config Logs */}
            <div className={`flex-1 rounded-2xl border overflow-y-auto pr-1 ${
              isLightMode 
                ? 'bg-slate-50 border-slate-200 shadow-inner' 
                : 'bg-black/25 border-white/5'
            }`}>
              <table className={`w-full border-collapse font-mono text-xs ${isRtl ? 'text-right' : 'text-left'}`}>
                <thead>
                  <tr className={`border-b text-[10px] tracking-wider uppercase font-semibold ${
                    isLightMode 
                      ? 'border-slate-200 text-slate-500 bg-slate-100/80' 
                      : 'border-white/10 text-slate-400 bg-black/20'
                  }`}>
                    <th className="p-4">{t.timeCol}</th>
                    <th className="p-4">{t.userCol}</th>
                    <th className="p-4">{isRtl ? 'نوع تغییر' : 'Action'}</th>
                    <th className="p-4">{isRtl ? 'فایل مقصد در سرور' : 'Target Server File'}</th>
                    <th className="p-4">{isRtl ? 'بخش / پارامتر' : 'Parameter / Module'}</th>
                    <th className="p-4">{isRtl ? 'تغییرات دقیق (اضافه/کم/ویرایش)' : 'Exact Changes (Added/Removed)'}</th>
                    <th className="p-4 text-center">{t.statusCol}</th>
                    <th className="p-4 text-center">{isRtl ? 'جزئیات' : 'Details'}</th>
                  </tr>
                </thead>
                <tbody className={`divide-y ${
                  isLightMode 
                    ? 'divide-slate-200 text-slate-700' 
                    : 'divide-white/5 text-slate-300'
                }`}>
                  {isLoadingConfigLogs ? (
                    <tr>
                      <td colSpan={8} className="p-8 text-center text-amber-400 font-sans">
                        <div className="flex items-center justify-center gap-2">
                          <RefreshCw className="w-5 h-5 animate-spin text-amber-400" />
                          <span>{isRtl ? 'در حال دریافت لاگ‌های تغییرات کانفیگ از سرور...' : 'Fetching server config audit logs...'}</span>
                        </div>
                      </td>
                    </tr>
                  ) : filteredConfigLogs.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="p-8 text-center text-slate-400 font-sans">
                        {isRtl ? 'هیچ لاگ تغییرات کانفیگی با مشخصات جستجویافته یافت نشد.' : 'No configuration logs match your search filters.'}
                      </td>
                    </tr>
                  ) : (
                    filteredConfigLogs.map((log) => {
                      const getActionBadge = (act: string) => {
                        switch (act) {
                          case 'ADD':
                            return <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">{isRtl ? '+ افزودن' : '+ ADD'}</span>;
                          case 'DELETE':
                            return <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-500/10 text-rose-400 border border-rose-500/20">{isRtl ? '- حذف' : '- DELETE'}</span>;
                          case 'POLICY':
                            return <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-purple-500/10 text-purple-400 border border-purple-500/20">{isRtl ? 'خط‌مشی' : 'POLICY'}</span>;
                          case 'RESTORE':
                            return <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-500/10 text-blue-400 border border-blue-500/20">{isRtl ? 'بازنشانی' : 'RESTORE'}</span>;
                          default:
                            return <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/10 text-amber-400 border border-amber-500/20">{isRtl ? 'ویرایش' : 'UPDATE'}</span>;
                        }
                      };

                      return (
                        <tr key={log.id} className={`transition-colors ${
                          isLightMode ? 'hover:bg-slate-100/50' : 'hover:bg-white/5'
                        }`}>
                          <td className={`p-4 whitespace-nowrap ${isLightMode ? 'text-slate-500' : 'text-slate-400'}`}>
                            {new Date(log.timestamp).toLocaleString(isRtl ? 'fa-IR' : 'en-US')}
                          </td>
                          <td className={`p-4 font-semibold ${isLightMode ? 'text-slate-800' : 'text-white'}`}>
                            @{log.username}
                          </td>
                          <td className="p-4">
                            {getActionBadge(log.action)}
                          </td>
                          <td className="p-4">
                            <span className="px-2 py-1 rounded-md bg-cyan-950/40 text-cyan-400 border border-cyan-500/20 font-mono text-[11px] dir-ltr inline-block">
                              {log.filePath}
                            </span>
                          </td>
                          <td className={`p-4 font-semibold ${isLightMode ? 'text-slate-800' : 'text-slate-200'}`}>
                            {log.component}
                            {log.fieldOrParam && (
                              <div className="text-[10px] text-amber-400 font-mono mt-0.5 dir-ltr">
                                {log.fieldOrParam}
                              </div>
                            )}
                          </td>
                          <td className="p-4 max-w-xs truncate" title={log.diffSummary}>
                            <div className="text-slate-300 font-sans text-xs">
                              {log.diffSummary}
                            </div>
                            {(log.oldValue || log.newValue) && (
                              <div className="text-[10px] text-slate-400 font-mono mt-0.5 flex items-center gap-1 dir-ltr">
                                {log.oldValue && <span className="text-rose-400/80 line-through">{log.oldValue}</span>}
                                {log.oldValue && log.newValue && <span className="text-slate-500">➔</span>}
                                {log.newValue && <span className="text-emerald-400 font-semibold">{log.newValue}</span>}
                              </div>
                            )}
                          </td>
                          <td className="p-4 text-center">
                            <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                              log.status === 'success' 
                                ? (isLightMode ? 'bg-emerald-100 text-emerald-800' : 'bg-emerald-500/10 text-emerald-400') 
                                : (isLightMode ? 'bg-red-100 text-red-800' : 'bg-red-500/10 text-red-400')
                            }`}>
                              {log.status === 'success' ? (isRtl ? 'موفق' : 'SUCCESS') : (isRtl ? 'خطا' : 'FAILED')}
                            </span>
                          </td>
                          <td className="p-4 text-center">
                            <button
                              onClick={() => setSelectedConfigLog(log)}
                              className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-slate-300 transition-colors cursor-pointer"
                              title={isRtl ? 'مشاهده جزئیات لاگ کانفیگ' : 'View Config Log Details'}
                            >
                              <Eye className="w-4 h-4 text-cyan-400" />
                            </button>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>

            {/* Config Log Details Modal */}
            {selectedConfigLog && (
              <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4" dir={isRtl ? "rtl" : "ltr"}>
                <div className={`w-full max-w-2xl rounded-3xl p-6 border shadow-2xl space-y-5 ${
                  isLightMode ? 'bg-white border-slate-200 text-slate-800' : 'bg-slate-900 border-white/10 text-white'
                }`}>
                  <div className="flex items-center justify-between border-b border-white/10 pb-4">
                    <div className="flex items-center gap-3">
                      <Sliders className="w-6 h-6 text-amber-400" />
                      <div>
                        <h3 className="text-lg font-bold font-display">{isRtl ? 'جزئیات تغییرات لاگ کانفیگ' : 'Config Change Audit Details'}</h3>
                        <p className="text-xs text-slate-400 font-mono">ID: {selectedConfigLog.id}</p>
                      </div>
                    </div>
                    <button
                      onClick={() => setSelectedConfigLog(null)}
                      className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white transition-colors cursor-pointer"
                    >
                      ✕
                    </button>
                  </div>

                  <div className="space-y-4 text-xs font-sans">
                    <div className="grid grid-cols-2 gap-4 p-4 rounded-2xl bg-black/20 border border-white/5">
                      <div>
                        <span className="text-slate-400 block mb-0.5">{isRtl ? 'زمان دقیق تغییر:' : 'Exact Timestamp:'}</span>
                        <span className="font-mono font-bold text-slate-200">
                          {new Date(selectedConfigLog.timestamp).toLocaleString(isRtl ? 'fa-IR' : 'en-US')}
                        </span>
                      </div>
                      <div>
                        <span className="text-slate-400 block mb-0.5">{isRtl ? 'اپراتور / کاربر:' : 'Operator User:'}</span>
                        <span className="font-mono font-bold text-amber-400">@{selectedConfigLog.username}</span>
                      </div>
                      <div>
                        <span className="text-slate-400 block mb-0.5">{isRtl ? 'مسیر فایل در سرور مقصد:' : 'Destination File Path:'}</span>
                        <span className="font-mono font-bold text-cyan-400 dir-ltr block">{selectedConfigLog.filePath}</span>
                      </div>
                      <div>
                        <span className="text-slate-400 block mb-0.5">{isRtl ? 'نوع عملیات:' : 'Action Type:'}</span>
                        <span className="font-bold text-emerald-400">{selectedConfigLog.action}</span>
                      </div>
                    </div>

                    <div className="p-4 rounded-2xl bg-black/30 border border-white/5 space-y-2">
                      <span className="text-slate-400 font-semibold block">{isRtl ? 'ماژول و پارامترهای تغییر یافته:' : 'Component & Parameters:'}</span>
                      <div className="text-sm font-bold text-white">{selectedConfigLog.component}</div>
                      {selectedConfigLog.fieldOrParam && (
                        <div className="font-mono text-amber-300 dir-ltr bg-black/40 p-2 rounded-xl border border-amber-500/20">
                          {selectedConfigLog.fieldOrParam}
                        </div>
                      )}
                    </div>

                    {(selectedConfigLog.oldValue || selectedConfigLog.newValue) && (
                      <div className="grid grid-cols-2 gap-4">
                        <div className="p-3 rounded-2xl bg-rose-950/30 border border-rose-500/20">
                          <span className="text-rose-400 font-bold block mb-1">{isRtl ? 'مقدار قبلی (Old Value):' : 'Old Value:'}</span>
                          <pre className="font-mono text-xs text-rose-200 whitespace-pre-wrap dir-ltr">{selectedConfigLog.oldValue || '-'}</pre>
                        </div>
                        <div className="p-3 rounded-2xl bg-emerald-950/30 border border-emerald-500/20">
                          <span className="text-emerald-400 font-bold block mb-1">{isRtl ? 'مقدار جدید (New Value):' : 'New Value:'}</span>
                          <pre className="font-mono text-xs text-emerald-200 whitespace-pre-wrap dir-ltr">{selectedConfigLog.newValue || '-'}</pre>
                        </div>
                      </div>
                    )}

                    <div className="p-4 rounded-2xl bg-black/20 border border-white/5 space-y-1">
                      <span className="text-slate-400 font-semibold block">{isRtl ? 'خلاصه تغییرات اعمال‌شده:' : 'Delta Summary:'}</span>
                      <p className="text-slate-200 font-mono text-xs leading-relaxed">{selectedConfigLog.diffSummary}</p>
                    </div>

                    {selectedConfigLog.details && (
                      <div className="p-4 rounded-2xl bg-black/40 border border-white/5 space-y-1">
                        <span className="text-slate-400 font-semibold block">{isRtl ? 'توضیحات و لاگ اجرای سرور:' : 'Execution Log & Server Context:'}</span>
                        <p className="text-slate-300 font-mono text-xs">{selectedConfigLog.details}</p>
                      </div>
                    )}
                  </div>

                  <div className="flex justify-end pt-2">
                    <button
                      onClick={() => setSelectedConfigLog(null)}
                      className="px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs transition-colors cursor-pointer"
                    >
                      {isRtl ? 'بستن' : 'Close'}
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* VIEW 4: BACKUPS MOVED TO CONTROL HUB */}
        {false && (
          <div className="space-y-6 flex flex-col h-full" dir={isRtl ? "rtl" : "ltr"}>
            <div className={`flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-white/5 ${isRtl ? 'flex-row-reverse text-right' : 'text-left'}`}>
              <div className={`flex items-center gap-3 ${isRtl ? 'flex-row-reverse text-right' : 'text-left'}`}>
                <History className="w-6 h-6 text-amber-400" />
                <div>
                  <h2 className="text-xl font-display font-bold text-white">{t.backupsTitle}</h2>
                  <p className="text-xs text-slate-400 mt-0.5">{t.backupsSub}</p>
                </div>
              </div>

              <div className={`flex items-center gap-1.5 bg-black/40 p-1 rounded-xl border border-white/5 self-start sm:self-auto ${isRtl ? 'flex-row-reverse' : ''}`}>
                <button
                  onClick={() => setActiveBackupSubTab('list')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    activeBackupSubTab === 'list' 
                      ? 'bg-amber-500 text-slate-950 shadow-[0_0_12px_rgba(245,158,11,0.3)]' 
                      : 'text-gray-400 hover:text-white'
                  }`}
                >
                  {t.backupListTab}
                </button>
                <button
                  onClick={() => setActiveBackupSubTab('settings')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    activeBackupSubTab === 'settings' 
                      ? 'bg-amber-500 text-slate-950 shadow-[0_0_12px_rgba(245,158,11,0.3)]' 
                      : 'text-gray-400 hover:text-white'
                  }`}
                >
                  {t.backupSettingsTab}
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
                          <label htmlFor="inc-ssl-adv" className="text-xs font-semibold text-slate-300 cursor-pointer">{t.includeSsl}</label>
                        </div>
                        <button
                          disabled={isTriggeringBackup}
                          onClick={() => triggerAdvancedBackup('config')}
                          className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs shadow-md transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                        >
                          {isTriggeringBackup ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Play className="w-3.5 h-3.5" />}
                          <span>{t.backupNow}</span>
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
                          <span>{t.uploadBackup}</span>
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

                {/* Backups List & Bulk Actions */}
                <div className="space-y-3">
                  <div className={`flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-black/30 p-4 rounded-2xl border border-white/5 ${isRtl ? 'flex-row-reverse text-right' : 'text-left'}`}>
                    <div className={`flex items-center gap-3 ${isRtl ? 'flex-row-reverse' : ''}`}>
                      <button
                        onClick={handleToggleSelectAll}
                        className="flex items-center gap-2 text-xs font-semibold text-slate-300 hover:text-white transition-colors cursor-pointer"
                      >
                        {selectedBackupIds.length === backups.length && backups.length > 0 ? (
                          <CheckSquare className="w-4.5 h-4.5 text-amber-500" />
                        ) : (
                          <Square className="w-4.5 h-4.5 text-slate-500" />
                        )}
                        <span>{lang === 'fa' ? `انتخاب همه (${backups.length})` : `Select All (${backups.length})`}</span>
                      </button>

                      {selectedBackupIds.length > 0 && (
                        <div className="h-4 w-px bg-white/10" />
                      )}

                      {selectedBackupIds.length > 0 && (
                        <button
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

                  {backups.length === 0 ? (
                    <div className="text-center py-10 spatial-glass rounded-2xl border border-white/5">
                      <FolderOpen className="w-12 h-12 text-slate-600 mx-auto mb-2" />
                      <p className="text-sm text-slate-400">{t.noBackups}</p>
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
                              onClick={() => downloadSingleBackup(b)}
                              className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 border border-white/5 transition-all cursor-pointer"
                              title={t.downloadBtn}
                            >
                              <Download className="w-4 h-4" />
                            </button>
                            {!isReadOnly && (
                              <>
                                <button
                                  onClick={() => setShowRestoreModal(b)}
                                  className="p-2 rounded-xl bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/10 transition-all cursor-pointer font-semibold text-xs flex items-center gap-1"
                                  title={t.restoreBtn}
                                >
                                  <RotateCcw className="w-4 h-4" />
                                  <span className="hidden lg:inline text-[10px]">{lang === 'fa' ? 'بازنشانی' : 'Restore'}</span>
                                </button>
                                <button
                                  onClick={() => onDeleteBackup(b.id)}
                                  className="p-2 rounded-xl bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/10 transition-all cursor-pointer"
                                  title={t.deleteBtn}
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
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
                      <label className="block text-xs font-semibold text-slate-300">{t.backupPath}</label>
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
                      <label className="block text-xs font-semibold text-slate-300">{t.retention}</label>
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
                    <h4 className="text-sm font-bold text-white pb-3 border-b border-white/5">{t.backupConfig}</h4>

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
                          <label htmlFor="db-sched-toggle" className="text-xs font-bold text-white cursor-pointer">{t.autoDbBackup}</label>
                        </div>
                        <Calendar className="w-4 h-4 text-cyan-400" />
                      </div>
                      <div className="space-y-1.5">
                        <label className="block text-[10px] text-slate-400">{t.cronExpr}</label>
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
                          <label htmlFor="cfg-sched-toggle" className="text-xs font-bold text-white cursor-pointer">{t.autoConfigBackup}</label>
                        </div>
                        <Calendar className="w-4 h-4 text-amber-400" />
                      </div>
                      <div className="space-y-1.5">
                        <label className="block text-[10px] text-slate-400">{t.cronExpr}</label>
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
                      onClick={saveBackupSettings}
                      className="px-6 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs shadow-lg transition-all flex items-center gap-2 cursor-pointer hover:shadow-amber-500/10"
                    >
                      <Save className="w-4 h-4" />
                      <span>{t.saveSettings}</span>
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
                      <h3 className={`text-lg font-bold ${isLightMode ? 'text-slate-900' : 'text-white'}`}>{t.warningTitle}</h3>
                      <p className={`text-[10px] ${isLightMode ? 'text-red-600/80' : 'text-red-400/80'}`}>{t.warningSub}</p>
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
                      <span>{t.warningEffects}</span>
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
                      disabled={isRestoring}
                      onClick={() => setShowRestoreModal(null)}
                      className={`px-4 py-2 rounded-xl font-bold text-xs transition-colors cursor-pointer ${
                        isLightMode 
                          ? 'bg-slate-100 hover:bg-slate-200 text-slate-700' 
                          : 'bg-white/5 hover:bg-white/10 text-slate-300'
                      }`}
                    >
                      {t.cancel}
                    </button>
                    <button
                      disabled={isRestoring}
                      onClick={() => restoreBackup(showRestoreModal)}
                      className="px-5 py-2.5 rounded-xl bg-red-500 hover:bg-red-600 text-white font-bold text-xs shadow-lg transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50"
                    >
                      {isRestoring ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <RotateCcw className="w-3.5 h-3.5" />}
                      <span>{t.confirmRestore}</span>
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* VIEW 5: SESSION PANEL */}
        {activeSubTab === 'sessionPanel' && (
          <div className="space-y-6 animate-fade-in">
            <div className={`flex items-center justify-between pb-4 border-b border-white/5 ${isRtl ? 'flex-row-reverse text-right' : 'text-left'}`}>
              <div className={`flex items-center gap-3 ${isRtl ? 'flex-row-reverse' : ''}`}>
                <div className="p-2.5 rounded-2xl bg-blue-500/10 border border-blue-500/20 text-blue-400">
                  <Clock className="w-6 h-6" />
                </div>
                <div>
                  <h2 className="text-xl font-display font-bold text-white flex items-center gap-2">
                    <span>{isRtl ? 'سشن پنل (تنظیمات سشن و خروج خودکار)' : 'Session Panel & Idle Timeout'}</span>
                    <span className="px-2.5 py-0.5 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-mono font-bold">
                      {sessionTimeoutMinutes === 0 ? (isRtl ? 'نامحدود (0)' : 'Unlimited (0)') : `${sessionTimeoutMinutes}m`}
                    </span>
                  </h2>
                  <p className="text-xs text-slate-400">
                    {isRtl 
                      ? 'تعریف زمان‌بندی خروج خودکار کاربران به علت عدم فعالیت (Session Timeout) و مدیریت نشست‌های فعال سیستم.'
                      : 'Configure auto-logout inactivity timeouts, RBAC session overrides, and active session duration.'}
                  </p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Main Configuration Card */}
              <div className="lg:col-span-2 p-6 rounded-3xl bg-black/25 border border-white/5 space-y-6">
                <div className={`flex items-center gap-3 pb-3 border-b border-white/5 ${isRtl ? 'flex-row-reverse' : ''}`}>
                  <Sliders className="w-5 h-5 text-blue-400" />
                  <h3 className="text-base font-bold text-white">
                    {isRtl ? 'تنظیمات زمان انقضای نشست (Inactivity Timeout)' : 'Global Inactivity Timeout'}
                  </h3>
                </div>

                {/* Duration Input & Info */}
                <div className="space-y-4">
                  <label className={`block text-xs font-semibold text-slate-300 ${isRtl ? 'text-right' : 'text-left'}`}>
                    {isRtl ? 'مدت زمان عدم فعالیت تا خروج خودکار (بر حسب دقیقه):' : 'Idle Duration Before Auto-Logout (Minutes):'}
                  </label>

                  <div className={`flex items-center gap-4 ${isRtl ? 'flex-row-reverse' : ''}`}>
                    <div className="relative flex-1">
                      <input
                        type="number"
                        min="0"
                        max="1440"
                        value={sessionTimeoutMinutes}
                        onChange={(e) => setSessionTimeoutMinutesState(Math.max(0, parseInt(e.target.value) || 0))}
                        className={`w-full bg-black/40 border border-white/10 rounded-2xl px-4 py-3 text-white font-mono text-lg font-bold focus:outline-none focus:border-blue-500/50 transition-all ${isRtl ? 'text-right' : 'text-left'}`}
                      />
                      <span className={`absolute top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400 ${isRtl ? 'left-4' : 'right-4'}`}>
                        {sessionTimeoutMinutes === 0 ? (isRtl ? 'نامحدود' : 'Unlimited') : (isRtl ? 'دقیقه' : 'Minutes')}
                      </span>
                    </div>

                    <button
                      onClick={handleSaveSessionSettings}
                      disabled={isSavingSession}
                      className="px-6 py-3 rounded-2xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-sm shadow-lg shadow-blue-500/20 transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50 shrink-0"
                    >
                      {isSavingSession ? <RefreshCw className="w-4 h-4 animate-spin text-white" /> : <Save className="w-4 h-4 text-white" />}
                      <span className="text-white font-bold">{isRtl ? 'ذخیره تنظیمات سشن' : 'Save Session Settings'}</span>
                    </button>
                  </div>

                  {/* Informational Note Box */}
                  <div className={`p-4 rounded-2xl bg-blue-500/10 border border-blue-500/20 text-xs text-blue-300 space-y-1.5 ${isRtl ? 'text-right' : 'text-left'}`}>
                    <div className={`flex items-center gap-2 font-bold text-blue-400 ${isRtl ? 'flex-row-reverse' : ''}`}>
                      <AlertCircle className="w-4 h-4 shrink-0" />
                      <span>{isRtl ? 'قوانین و نکات سشن پنل:' : 'Session Rules & Constraints:'}</span>
                    </div>
                    <p>• {isRtl ? 'عدد صفر (0) به معنای نامحدود است (عدم لاگ‌اوت خودکار کاربر).' : 'Value 0 represents Unlimited (auto-logout disabled).'}</p>
                    <p>• {isRtl ? 'مقدار پیش‌فرض سیستم ۱۵ دقیقه عدم فعالیت می‌باشد.' : 'Default system value is 15 minutes of inactivity.'}</p>
                    <p>• {isRtl ? 'در صورت تنظیم زمان، ۶۰ ثانیه قبل از انقضا به کاربر هشدار داده می‌شود.' : 'A 60-second notification warning appears prior to session termination.'}</p>
                  </div>

                  {/* Quick Presets */}
                  <div className="space-y-2 pt-2">
                    <span className={`block text-xs font-semibold text-slate-400 ${isRtl ? 'text-right' : 'text-left'}`}>
                      {isRtl ? 'میانبرهای زمان پیش‌فرض:' : 'Quick Timeout Presets:'}
                    </span>
                    <div className={`flex flex-wrap gap-2 ${isRtl ? 'flex-row-reverse' : ''}`}>
                      {[
                        { label: isRtl ? '۰ (نامحدود)' : '0 (Unlimited)', val: 0 },
                        { label: isRtl ? '۵ دقیقه' : '5 Min', val: 5 },
                        { label: isRtl ? '۱۵ دقیقه (پیش‌فرض)' : '15 Min (Default)', val: 15 },
                        { label: isRtl ? '۳۰ دقیقه' : '30 Min', val: 30 },
                        { label: isRtl ? '۶۰ دقیقه' : '60 Min', val: 60 }
                      ].map(preset => (
                        <button
                          key={preset.val}
                          onClick={() => setSessionTimeoutMinutesState(preset.val)}
                          className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all border cursor-pointer ${
                            sessionTimeoutMinutes === preset.val
                              ? 'bg-blue-500 text-white border-blue-400 shadow-md shadow-blue-500/20'
                              : 'bg-white/5 text-slate-300 border-white/10 hover:bg-white/10'
                          }`}
                        >
                          {preset.label}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Active User Sessions List Card */}
              <div className="p-6 rounded-3xl bg-black/25 border border-white/5 space-y-5 flex flex-col justify-between overflow-hidden">
                <div className="space-y-4">
                  <div className={`flex items-center justify-between pb-3 border-b border-white/5 ${isRtl ? 'flex-row-reverse text-right' : 'text-left'}`}>
                    <div className={`flex items-center gap-2.5 ${isRtl ? 'flex-row-reverse' : ''}`}>
                      <UserCheck className="w-5 h-5 text-emerald-400 shrink-0" />
                      <h3 className="text-base font-bold text-white truncate">
                        {isRtl ? 'کاربران متصل و نشست‌های آنلاین پنل' : 'Active Logged-In User Sessions'}
                      </h3>
                    </div>
                    <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-mono font-bold shrink-0">
                      {(activeSessionsList.length > 0 ? activeSessionsList.length : 1)} {isRtl ? 'نشست آنلاین' : 'Active'}
                    </span>
                  </div>

                  {/* List of CURRENTLY LOGGED IN active sessions */}
                  <div className="space-y-3 max-h-[380px] overflow-y-auto pr-1">
                    {(activeSessionsList.length > 0 ? activeSessionsList : [
                      {
                        id: 'sess-current',
                        username: currentUser?.username || 'admin',
                        email: (currentUser as any)?.email || 'admin@matrix.local',
                        role: currentUser?.role || userRole || 'Super Admin',
                        avatar: (currentUser as any)?.avatar || `https://api.dicebear.com/7.x/bottts/svg?seed=${currentUser?.username || 'admin'}`,
                        loginTime: new Date().toISOString()
                      }
                    ]).map((sess) => {
                      const isSelf = sess.username === currentUser?.username;
                      const userObj = panelUsers.find(u => u.username === sess.username) || {
                        id: sess.userId || sess.id,
                        username: sess.username,
                        email: sess.email,
                        role: sess.role,
                        avatar: sess.avatar
                      };
                      const isSessMenuOpen = activeSessionMenuId === (sess.id || sess.username);

                      return (
                        <div 
                          key={sess.id || sess.username}
                          className={`p-3.5 rounded-2xl border transition-all w-full min-w-0 ${
                            isSessMenuOpen ? 'relative z-30 overflow-visible' : 'relative z-10'
                          } ${
                            isLightMode
                              ? (isSelf 
                                  ? 'bg-emerald-500/10 border-emerald-400/40 text-slate-900 shadow-sm' 
                                  : (isSessMenuOpen ? 'bg-white border-blue-400/60 shadow-md' : 'bg-slate-50/90 border-slate-200/80 hover:bg-white hover:border-slate-300 text-slate-800'))
                              : (isSelf 
                                  ? 'bg-emerald-500/10 border-emerald-500/25 text-white' 
                                  : (isSessMenuOpen ? 'bg-slate-900/90 border-blue-500/40 shadow-xl' : 'bg-white/5 border-white/5 hover:border-white/10 text-slate-200'))
                          }`}
                        >
                          <div className={`flex flex-wrap items-center justify-between gap-2 ${isRtl ? 'flex-row-reverse' : ''}`}>
                            {/* User Header Info */}
                            <div className={`flex items-center gap-2.5 min-w-0 flex-1 ${isRtl ? 'flex-row-reverse text-right' : 'text-left'}`}>
                              <div className="relative shrink-0">
                                <img
                                  src={sess.avatar || `https://api.dicebear.com/7.x/bottts/svg?seed=${sess.username}`}
                                  alt={sess.username}
                                  className={`w-8 h-8 rounded-lg border p-0.5 object-cover ${
                                    isLightMode ? 'bg-slate-100 border-slate-200' : 'bg-slate-800 border-white/10'
                                  }`}
                                />
                                <span className={`absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full border-2 ${
                                  isLightMode ? 'border-white' : 'border-slate-900'
                                } ${isSelf ? 'bg-emerald-400 animate-pulse' : 'bg-emerald-500'}`}></span>
                              </div>
                              <div className="min-w-0 flex-1">
                                <div className={`flex items-center gap-1.5 min-w-0 ${isRtl ? 'flex-row-reverse' : ''}`}>
                                  <h4 className={`text-xs font-bold truncate max-w-[120px] sm:max-w-[160px] ${
                                    isLightMode ? 'text-slate-900' : 'text-white'
                                  }`}>
                                    @{sess.username}
                                  </h4>
                                  {isSelf && (
                                    <span className="shrink-0 text-[9px] bg-emerald-500/20 text-emerald-500 border border-emerald-500/30 px-1.5 py-0.2 rounded font-bold">
                                      {isRtl ? 'نشست شما' : 'You'}
                                    </span>
                                  )}
                                </div>
                                <span className={`text-[11px] truncate block max-w-[140px] sm:max-w-[180px] ${
                                  isLightMode ? 'text-slate-500' : 'text-slate-400'
                                }`}>
                                  {sess.email || `${sess.username}@matrix.local`}
                                </span>
                              </div>
                            </div>

                            {/* Tags, Role Badge & 3-Dots Dropdown */}
                            <div className={`flex items-center gap-2 shrink-0 flex-wrap justify-end ${isRtl ? 'flex-row-reverse' : ''}`}>
                              <span className={`px-2 py-0.5 rounded-full border text-[10px] font-bold shrink-0 ${
                                isLightMode 
                                  ? 'bg-purple-50 text-purple-700 border-purple-200' 
                                  : 'bg-purple-500/10 border-purple-500/20 text-purple-300'
                              }`}>
                                {sess.role || 'User'}
                              </span>

                              {/* 3-Dots Menu Button & Popup Dropdown */}
                              <div className="relative">
                                <button
                                  type="button"
                                  onClick={() => setActiveSessionMenuId(isSessMenuOpen ? null : (sess.id || sess.username))}
                                  className={`p-1.5 rounded-xl border transition-all cursor-pointer flex items-center justify-center ${
                                    isLightMode 
                                      ? (isSessMenuOpen ? 'bg-blue-50 border-blue-300 text-blue-600' : 'bg-slate-100 hover:bg-slate-200 text-slate-700 border-slate-200') 
                                      : (isSessMenuOpen ? 'bg-blue-500/20 border-blue-400/50 text-blue-300' : 'bg-white/5 hover:bg-white/10 text-slate-300 border-white/10')
                                  }`}
                                  title={isRtl ? 'منوی عملیات نشست' : 'Session Actions Menu'}
                                >
                                  <MoreVertical className="w-4 h-4" />
                                </button>

                                {isSessMenuOpen && (
                                  <>
                                    <div 
                                      className="fixed inset-0 z-40" 
                                      onClick={() => setActiveSessionMenuId(null)} 
                                    />
                                    <div className={`absolute ${isRtl ? 'left-0' : 'right-0'} top-full mt-1.5 w-48 rounded-2xl shadow-2xl p-1.5 z-50 space-y-1 backdrop-blur-xl border animate-in fade-in zoom-in-95 ${
                                      isLightMode 
                                        ? 'bg-white/95 border-slate-200 text-slate-800 shadow-slate-300/40' 
                                        : 'bg-slate-900/95 border-white/15 text-slate-100 shadow-black/80'
                                    }`}>
                                      {(isOwner || isSuperAdmin) && (
                                        <button
                                          type="button"
                                          onClick={() => {
                                            setActiveSessionMenuId(null);
                                            setChangePasswordUser(userObj);
                                            setNewPasswordInput('');
                                            setConfirmPasswordInput('');
                                            setShowPasswordText(false);
                                          }}
                                          className={`w-full px-3 py-2 rounded-xl text-xs font-semibold flex items-center gap-2.5 transition-all cursor-pointer ${
                                            isRtl ? 'flex-row-reverse text-right' : 'text-left'
                                          } ${
                                            isLightMode 
                                              ? 'hover:bg-amber-50 text-amber-800' 
                                              : 'hover:bg-amber-500/15 text-amber-300'
                                          }`}
                                        >
                                          <Key className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                                          <span>{isRtl ? 'تغییر پسورد' : 'Change Password'}</span>
                                        </button>
                                      )}

                                      {(isOwner || isSuperAdmin) && !isSelf && (
                                        <button
                                          type="button"
                                          onClick={() => {
                                            setActiveSessionMenuId(null);
                                            handleKickSession(sess.id, sess.username);
                                          }}
                                          className={`w-full px-3 py-2 rounded-xl text-xs font-semibold flex items-center gap-2.5 transition-all cursor-pointer ${
                                            isRtl ? 'flex-row-reverse text-right' : 'text-left'
                                          } ${
                                            isLightMode 
                                              ? 'hover:bg-rose-50 text-rose-700' 
                                              : 'hover:bg-red-500/15 text-red-400'
                                          }`}
                                        >
                                          <LogOut className="w-3.5 h-3.5 text-red-500 shrink-0" />
                                          <span>{isRtl ? 'اخراج و لاگ‌اوت نشست' : 'Kick / Terminate Session'}</span>
                                        </button>
                                      )}
                                    </div>
                                  </>
                                )}
                              </div>
                            </div>
                          </div>

                          <div className={`mt-2.5 pt-2 border-t border-white/5 flex flex-wrap items-center justify-between gap-2 text-[11px] ${isRtl ? 'flex-row-reverse' : ''}`}>
                            <span className="text-slate-400 flex items-center gap-1 truncate max-w-[200px]">
                              <Clock className="w-3 h-3 text-slate-400 shrink-0" />
                              <span>
                                {isRtl ? 'زمان ورود:' : 'Logged In:'} {sess.loginTime ? new Date(sess.loginTime).toLocaleTimeString(isRtl ? 'fa-IR' : 'en-US', { hour: '2-digit', minute: '2-digit' }) : (isRtl ? 'اکنون' : 'Now')}
                              </span>
                            </span>
                            <span className="font-mono font-bold text-emerald-400 flex items-center gap-1 text-[10px] bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20 shrink-0">
                              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                              {isSelf 
                                ? (sessionTimeoutMinutes === 0 ? (isRtl ? 'آنلاین (بدون انقضا)' : 'Online (No Timeout)') : (isRtl ? `آنلاین (${sessionTimeoutMinutes} دقیقه)` : `Online (${sessionTimeoutMinutes}m)`))
                                : (isRtl ? 'آنلاین در پنل' : 'Active Online')}
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                <div className="pt-4 border-t border-white/5 space-y-2">
                  <button
                    onClick={() => {
                      fetchActiveSessions();
                      window.dispatchEvent(new Event('mousemove'));
                      showToast('success', isRtl ? 'نشست‌های آنلاین به‌روزرسانی و تمدید شد' : 'Active sessions refreshed and extended');
                    }}
                    className="w-full py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-slate-200 border border-white/10 font-bold text-xs transition-all flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <RefreshCw className="w-3.5 h-3.5 text-blue-400" />
                    <span>{isRtl ? 'تمدید و به‌روزرسانی نشست‌های آنلاین' : 'Refresh Active Sessions'}</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Role-Based Access Control Session Overrides */}
            <div className="p-6 rounded-3xl bg-black/25 border border-white/5 space-y-5">
              <div className={`flex items-center justify-between pb-3 border-b border-white/5 ${isRtl ? 'flex-row-reverse text-right' : 'text-left'}`}>
                <div className={`flex items-center gap-3 ${isRtl ? 'flex-row-reverse' : ''}`}>
                  <Shield className="w-5 h-5 text-purple-400" />
                  <div>
                    <h3 className="text-base font-bold text-white">
                      {isRtl ? 'تنظیمات سشن برای سطوح مختلف دسترسی (RBAC Session Overrides)' : 'Role-Based Session Timeouts'}
                    </h3>
                    <p className="text-xs text-slate-400">
                      {isRtl
                        ? 'ادمین می‌تواند برای هر سطح دسترسی (Owner, Super Admin, Moderator, Viewer) زمان‌بندی متفاوتی تعریف کند. عدد ۰ به معنای نامحدود است.'
                        : 'Configure explicit inactivity timeout limits per role level. 0 denotes Unlimited.'}
                    </p>
                  </div>
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-xs text-slate-300">
                  <thead>
                    <tr className={`border-b border-white/10 text-slate-400 font-bold ${isRtl ? 'text-right' : 'text-left'}`}>
                      <th className="py-3 px-4">{isRtl ? 'نقش کاربری (Role)' : 'User Role'}</th>
                      <th className="py-3 px-4">{isRtl ? 'توضیحات سطح دسترسی' : 'Permission Scope'}</th>
                      <th className="py-3 px-4">{isRtl ? 'زمان انقضای نشست (دقیقه)' : 'Session Timeout (Minutes)'}</th>
                      <th className="py-3 px-4">{isRtl ? 'وضعیت خروج خودکار' : 'Auto-Logout Status'}</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {[
                      { role: 'Owner', descFa: 'مالک اصلی سیستم و مدیریت ارشد کلاستر', descEn: 'System Owner & Full Cluster Admin', defaultMin: 0 },
                      { role: 'Super Admin', descFa: 'مدیر ارشد با کلیه دسترسی‌های عملیاتی', descEn: 'Super Administrator with Full Access', defaultMin: 0 },
                      { role: 'Moderator', descFa: 'ناظر و ناظم روم‌ها، گزارش‌ها و کاربران', descEn: 'Moderator & Content Inspector', defaultMin: 30 },
                      { role: 'Viewer', descFa: 'کاربر مانیتورینگ بدون امکان ارسال تغییرات', descEn: 'Read-only Auditor & Monitor', defaultMin: 15 },
                      { role: 'Custom', descFa: 'نقش سفارشی با تاگل‌های دسترسی مشخص', descEn: 'Custom Role with Granular Matrix Toggles', defaultMin: 15 }
                    ].map(r => {
                      const currentVal = roleTimeouts[r.role] !== undefined ? roleTimeouts[r.role] : r.defaultMin;
                      return (
                        <tr key={r.role} className="hover:bg-white/5 transition-colors">
                          <td className="py-3.5 px-4 font-bold text-white flex items-center gap-2">
                            <span className="w-2 h-2 rounded-full bg-blue-400"></span>
                            {r.role}
                          </td>
                          <td className="py-3.5 px-4 text-slate-400">
                            {isRtl ? r.descFa : r.descEn}
                          </td>
                          <td className="py-3.5 px-4">
                            <input
                              type="number"
                              min="0"
                              max="1440"
                              value={currentVal}
                              onChange={(e) => {
                                const val = Math.max(0, parseInt(e.target.value) || 0);
                                setRoleTimeouts(prev => ({ ...prev, [r.role]: val }));
                              }}
                              className="w-28 bg-black/40 border border-white/10 rounded-xl px-3 py-1.5 text-white font-mono font-bold text-xs focus:outline-none focus:border-blue-500/50"
                            />
                          </td>
                          <td className="py-3.5 px-4">
                            <span className={`px-2.5 py-1 rounded-full font-bold text-[11px] ${
                              currentVal === 0
                                ? 'bg-amber-500/10 text-amber-300 border border-amber-500/20'
                                : 'bg-blue-500/10 text-blue-300 border border-blue-500/20'
                            }`}>
                              {currentVal === 0
                                ? (isRtl ? 'نامحدود (بدون لاگ‌اوت)' : 'Unlimited (No Logout)')
                                : `${currentVal} ${isRtl ? 'دقیقه' : 'Min'}`}
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              <div className={`flex justify-end pt-3 border-t border-white/5 ${isRtl ? 'flex-row-reverse' : ''}`}>
                <button
                  onClick={handleSaveSessionSettings}
                  disabled={isSavingSession}
                  className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs shadow-lg shadow-blue-500/20 transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  {isSavingSession ? <RefreshCw className="w-3.5 h-3.5 animate-spin text-white" /> : <Save className="w-3.5 h-3.5 text-white" />}
                  <span className="text-white font-bold">{isRtl ? 'ذخیره تمام تنظیمات نقش‌ها' : 'Save Role Timeout Matrix'}</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* VIEW 6: PANEL SECURITY & LOCKOUT RULES */}
        {activeSubTab === 'securityRules' && (
          <div className="space-y-6 animate-in fade-in duration-200">
            {/* Header */}
            <div className={`flex items-center justify-between pb-4 border-b border-white/5 ${isRtl ? 'flex-row-reverse text-right' : 'text-left'}`}>
              <div className={`flex items-center gap-3 ${isRtl ? 'flex-row-reverse' : ''}`}>
                <div className="p-2.5 rounded-2xl bg-rose-500/10 border border-rose-500/20">
                  <Lock className="w-6 h-6 text-rose-400" />
                </div>
                <div>
                  <h2 className="text-xl font-display font-bold text-white">
                    {isRtl ? 'قوانین امنیت و قفل پنل' : 'Panel Security & Lockout Rules'}
                  </h2>
                  <p className="text-xs text-slate-400">
                    {isRtl ? 'پیکربندی قفل خودکار اکانت، تعداد دفعات اشتباه مجاز، مدت زمان مسدودی و سیستم کپچا' : 'Configure automated login lockout, attempt thresholds, lockout durations, and CAPTCHA protection'}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={fetchSecuritySettings}
                className="p-2 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 text-slate-300 transition-all flex items-center gap-1.5 text-xs font-semibold cursor-pointer"
                title={isRtl ? 'بروزرسانی' : 'Refresh'}
              >
                <RefreshCw className={`w-4 h-4 ${isLoadingSecurity ? 'animate-spin' : ''}`} />
                <span>{isRtl ? 'بروزرسانی' : 'Refresh'}</span>
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Account Lockout Rules Card */}
              <div className={`p-5 rounded-2xl border ${isLightMode ? 'bg-white border-slate-200 shadow-sm' : 'bg-black/25 border-white/5'} space-y-5`}>
                <div className={`flex items-center justify-between pb-3 border-b border-white/5 ${isRtl ? 'flex-row-reverse' : ''}`}>
                  <div className={`flex items-center gap-2 ${isRtl ? 'flex-row-reverse' : ''}`}>
                    <ShieldAlert className="w-5 h-5 text-rose-400" />
                    <h3 className="text-sm font-bold text-white">
                      {isRtl ? 'قفل خودکار اکانت (Account Lockout)' : 'Automated Account Lockout'}
                    </h3>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={secLockoutEnabled}
                      onChange={(e) => setSecLockoutEnabled(e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-slate-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-rose-600"></div>
                  </label>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="text-xs font-semibold text-slate-300 block mb-1.5">
                      {isRtl ? 'حداکثر تعداد ورود اشتباه مجاز (Max Failed Attempts):' : 'Max Failed Login Attempts:'}
                    </label>
                    <div className="flex items-center gap-2">
                      <input
                        type="number"
                        min="1"
                        max="20"
                        value={secMaxFailedAttempts}
                        onChange={(e) => setSecMaxFailedAttempts(parseInt(e.target.value, 10) || 3)}
                        disabled={!secLockoutEnabled}
                        className="w-full bg-black/40 border border-white/10 rounded-xl px-3 py-2 text-sm text-white outline-none focus:border-rose-500/50 disabled:opacity-40"
                      />
                      <span className="text-xs text-slate-400 shrink-0">
                        {isRtl ? 'بار تلاش' : 'attempts'}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-500 mt-1">
                      {isRtl ? 'پس از این تعداد رمز اشتباه، کاربر موقتاً مسدود می‌شود.' : 'User will be locked out after this number of incorrect passwords.'}
                    </p>
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-slate-300 block mb-1.5">
                      {isRtl ? 'مدت زمان قفل بودن (Lockout Duration):' : 'Lockout Duration:'}
                    </label>
                    <div className="flex items-center gap-2">
                      <input
                        type="number"
                        min="1"
                        max="1440"
                        value={secLockoutDurationMinutes}
                        onChange={(e) => setSecLockoutDurationMinutes(parseInt(e.target.value, 10) || 15)}
                        disabled={!secLockoutEnabled}
                        className="w-full bg-black/40 border border-white/10 rounded-xl px-3 py-2 text-sm text-white outline-none focus:border-rose-500/50 disabled:opacity-40"
                      />
                      <span className="text-xs text-slate-400 shrink-0">
                        {isRtl ? 'دقیقه' : 'minutes'}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-500 mt-1">
                      {isRtl ? 'مدت زمانی که کاربر نتواند وارد پنل شود.' : 'Time duration the user must wait before attempting login again.'}
                    </p>
                  </div>
                </div>
              </div>

              {/* CAPTCHA Protection Rules Card */}
              <div className={`p-5 rounded-2xl border ${isLightMode ? 'bg-white border-slate-200 shadow-sm' : 'bg-black/25 border-white/5'} space-y-5`}>
                <div className={`flex items-center justify-between pb-3 border-b border-white/5 ${isRtl ? 'flex-row-reverse' : ''}`}>
                  <div className={`flex items-center gap-2 ${isRtl ? 'flex-row-reverse' : ''}`}>
                    <ShieldCheck className="w-5 h-5 text-indigo-400" />
                    <h3 className="text-sm font-bold text-white">
                      {isRtl ? 'سیستم امنیتی کپچا (CAPTCHA System)' : 'CAPTCHA Protection'}
                    </h3>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={secCaptchaEnabled}
                      onChange={(e) => setSecCaptchaEnabled(e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-slate-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
                  </label>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="text-xs font-semibold text-slate-300 block mb-2">
                      {isRtl ? 'حالت نمایش کپچا در لاگین:' : 'CAPTCHA Trigger Condition:'}
                    </label>
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        type="button"
                        disabled={!secCaptchaEnabled}
                        onClick={() => setSecCaptchaMode('on_failed')}
                        className={`p-2.5 rounded-xl border text-xs font-semibold transition-all cursor-pointer ${
                          secCaptchaMode === 'on_failed'
                            ? 'bg-indigo-500/20 border-indigo-500 text-indigo-300'
                            : 'bg-black/30 border-white/10 text-slate-400 hover:text-white'
                        } disabled:opacity-40`}
                      >
                        {isRtl ? 'پس از ورود اشتباه' : 'On Failed Attempt'}
                      </button>
                      <button
                        type="button"
                        disabled={!secCaptchaEnabled}
                        onClick={() => setSecCaptchaMode('always')}
                        className={`p-2.5 rounded-xl border text-xs font-semibold transition-all cursor-pointer ${
                          secCaptchaMode === 'always'
                            ? 'bg-indigo-500/20 border-indigo-500 text-indigo-300'
                            : 'bg-black/30 border-white/10 text-slate-400 hover:text-white'
                        } disabled:opacity-40`}
                      >
                        {isRtl ? 'همیشه اجباری' : 'Always Required'}
                      </button>
                    </div>
                  </div>

                  {secCaptchaMode === 'on_failed' && (
                    <div>
                      <label className="text-xs font-semibold text-slate-300 block mb-1.5">
                        {isRtl ? 'نمایش کپچا پس از چند بار تلاش ناموفق:' : 'Trigger CAPTCHA after N failed attempts:'}
                      </label>
                      <div className="flex items-center gap-2">
                        <input
                          type="number"
                          min="1"
                          max="10"
                          value={secCaptchaTriggerAttempts}
                          onChange={(e) => setSecCaptchaTriggerAttempts(parseInt(e.target.value, 10) || 2)}
                          disabled={!secCaptchaEnabled}
                          className="w-full bg-black/40 border border-white/10 rounded-xl px-3 py-2 text-sm text-white outline-none focus:border-indigo-500/50 disabled:opacity-40"
                        />
                        <span className="text-xs text-slate-400 shrink-0">
                          {isRtl ? 'بار تلاش' : 'attempts'}
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Save Button */}
            <div className={`flex ${isRtl ? 'justify-start' : 'justify-end'}`}>
              <button
                type="button"
                onClick={handleSaveSecuritySettings}
                disabled={isSavingSecurity}
                className="px-6 py-3 rounded-2xl bg-gradient-to-r from-rose-500 via-indigo-600 to-purple-600 text-white font-bold text-xs tracking-wider shadow-lg hover:shadow-indigo-500/25 transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50"
              >
                <Save className="w-4 h-4 text-white" />
                <span className="text-white font-bold">{isSavingSecurity ? (isRtl ? 'در حال ذخیره‌سازی...' : 'Saving...') : (isRtl ? 'ذخیره تنظیمات امنیتی' : 'Save Security Settings')}</span>
              </button>
            </div>

            {/* Locked Accounts Table */}
            <div className={`p-5 rounded-2xl border ${isLightMode ? 'bg-white border-slate-200 shadow-sm' : 'bg-black/25 border-white/5'} space-y-4`}>
              <div className={`flex items-center justify-between pb-3 border-b border-white/5 ${isRtl ? 'flex-row-reverse' : ''}`}>
                <div className={`flex items-center gap-2 ${isRtl ? 'flex-row-reverse' : ''}`}>
                  <UserX className="w-5 h-5 text-amber-400" />
                  <h3 className="text-sm font-bold text-white">
                    {isRtl ? 'وضعیت حساب‌های قفل‌شده و تلاش‌های ناموفق فعال' : 'Currently Locked Accounts & Failed Login Status'}
                  </h3>
                </div>
                <span className="px-2.5 py-1 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/20 text-xs font-bold">
                  {lockedAccountsList.length} {isRtl ? 'مورد' : 'entries'}
                </span>
              </div>

              {lockedAccountsList.length === 0 ? (
                <div className="p-8 text-center text-slate-400 text-xs flex flex-col items-center gap-2">
                  <ShieldCheck className="w-8 h-8 text-emerald-400/60" />
                  <p>{isRtl ? 'هیچ اکانت یا آی‌پی قفل شده‌ای در حال حاضر وجود ندارد.' : 'No locked accounts or failed attempt restrictions at this time.'}</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-xs text-left rtl:text-right text-slate-300">
                    <thead className="bg-white/5 text-slate-400 uppercase text-[10px] tracking-wider">
                      <tr>
                        <th className="p-3 rounded-s-xl">{isRtl ? 'نام کاربری' : 'Username'}</th>
                        <th className="p-3">{isRtl ? 'تعداد اشتباه' : 'Failed Count'}</th>
                        <th className="p-3">{isRtl ? 'وضعیت قفل' : 'Status'}</th>
                        <th className="p-3">{isRtl ? 'زمان آخرین تلاش' : 'Last Attempt'}</th>
                        <th className="p-3 text-center rounded-e-xl">{isRtl ? 'عملیات' : 'Actions'}</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                      {lockedAccountsList.map((acc, idx) => (
                        <tr key={idx} className="hover:bg-white/5 transition-colors">
                          <td className="p-3 font-bold text-white">{acc.username}</td>
                          <td className="p-3 font-mono text-amber-400">{acc.failedCount}</td>
                          <td className="p-3">
                            {acc.isLocked ? (
                              <span className="px-2 py-0.5 rounded-md bg-rose-500/20 text-rose-400 border border-rose-500/30 text-[10px] font-bold inline-flex items-center gap-1">
                                <Lock className="w-3 h-3" />
                                <span>{isRtl ? `قفل (${Math.ceil(acc.remainingSeconds / 60)} دقیقه)` : `Locked (${Math.ceil(acc.remainingSeconds / 60)}m)`}</span>
                              </span>
                            ) : (
                              <span className="px-2 py-0.5 rounded-md bg-amber-500/20 text-amber-400 border border-amber-500/30 text-[10px] font-bold">
                                {isRtl ? 'هشدار تلاش ناموفق' : 'Warning Level'}
                              </span>
                            )}
                          </td>
                          <td className="p-3 text-slate-400 dir-ltr text-right rtl:text-left">{acc.lastAttempt ? new Date(acc.lastAttempt).toLocaleString() : '-'}</td>
                          <td className="p-3 text-center">
                            <button
                              type="button"
                              onClick={() => handleUnlockUser(acc.username)}
                              className="px-3 py-1 rounded-xl bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-xs font-semibold transition-all cursor-pointer"
                            >
                              {isRtl ? 'باز کردن قفل' : 'Unlock Account'}
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        )}

        {/* VPN & PROXY MANAGEMENT TAB */}
        {activeSubTab === 'vpnProxy' && (
          <div className="space-y-6 animate-fadeIn" dir={isRtl ? "rtl" : "ltr"}>
            {/* Top Overview Header */}
            <div className={`p-6 rounded-3xl border shadow-xl flex flex-col lg:flex-row lg:items-center justify-between gap-6 transition-colors ${
              isLightMode ? 'bg-white border-cyan-200 shadow-cyan-500/5 text-slate-800' : 'bg-slate-900/80 border-cyan-500/20 shadow-cyan-950/20 text-white'
            }`}>
              <div className="flex items-center gap-4">
                <div className={`p-3.5 rounded-2xl border ${
                  isLightMode ? 'bg-cyan-50 border-cyan-200 text-cyan-600' : 'bg-cyan-500/10 border-cyan-500/20 text-cyan-400'
                }`}>
                  <Network className="w-8 h-8 animate-pulse" />
                </div>
                <div>
                  <h2 className="text-xl font-bold flex items-center gap-2">
                    <span>{isRtl ? 'مدیریت پکیج‌ها و کانکشن‌های VPN سرور مقصد' : 'VPN Clients & Connection Profile Manager'}</span>
                    <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold border ${
                      isLightMode ? 'bg-cyan-100 text-cyan-800 border-cyan-300' : 'bg-cyan-500/20 text-cyan-300 border-cyan-500/30'
                    }`}>
                      WireGuard / OpenVPN / Tailscale / SSTP
                    </span>
                  </h2>
                  <p className={`text-xs mt-1 ${isLightMode ? 'text-slate-600' : 'text-slate-400'}`}>
                    {isRtl 
                      ? 'مدیریت و نصب خودکار کلاینت‌های VPN لینوکس، اتصال سریع کانکشن‌ها بدون نیاز به دستور متنی و محافظت از روت پنل مدیریت' 
                      : 'Automated Linux VPN client package installer, connection profile runner, and anti-lockout protection.'}
                  </p>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-3">
                <button
                  type="button"
                  onClick={handleOpenAddConnModal}
                  className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white text-xs font-bold shadow-lg shadow-cyan-500/20 transition-all flex items-center gap-2 cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                  <span>{isRtl ? 'ایجاد کانکشن جدید (New Connection)' : 'New Connection Profile'}</span>
                </button>

                <button
                  type="button"
                  onClick={() => setShowImportConfigModal(true)}
                  className={`px-4 py-2.5 rounded-xl border text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
                    isLightMode ? 'bg-purple-50 hover:bg-purple-100 border-purple-200 text-purple-700' : 'bg-purple-500/10 hover:bg-purple-500/20 border-purple-500/30 text-purple-300'
                  }`}
                >
                  <Download className="w-4 h-4 text-purple-500" />
                  <span>{isRtl ? 'وارد کردن فایل کانفیگ' : 'Import Config File'}</span>
                </button>

                <button
                  type="button"
                  onClick={handleTestPanelRoute}
                  disabled={isTestingRoute}
                  className={`px-4 py-2.5 rounded-xl border text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
                    isLightMode ? 'bg-slate-100 hover:bg-slate-200 border-slate-300 text-slate-700' : 'bg-white/10 hover:bg-white/20 border-white/10 text-white'
                  }`}
                >
                  {isTestingRoute ? <RefreshCw className="w-4 h-4 animate-spin text-cyan-500" /> : <Zap className="w-4 h-4 text-cyan-500" />}
                  <span>{isRtl ? 'تست پایداری مسیر پنل' : 'Test Direct Panel Route'}</span>
                </button>
              </div>
            </div>

            {/* Linux OS & Package Manager Detection Bar */}
            <div className={`p-5 rounded-3xl border shadow-lg flex flex-col md:flex-row md:items-center justify-between gap-4 transition-colors ${
              isLightMode ? 'bg-gradient-to-r from-blue-50 via-slate-50 to-indigo-50 border-blue-200 text-slate-800' : 'bg-slate-900/90 border-blue-500/20 text-white'
            }`}>
              <div className="flex items-center gap-3">
                <div className={`p-3 rounded-2xl border ${
                  isLightMode ? 'bg-blue-100 border-blue-300 text-blue-700' : 'bg-blue-500/20 border-blue-500/30 text-blue-400'
                }`}>
                  <Terminal className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-sm font-bold flex items-center gap-2">
                    <span>{isRtl ? 'سیستم‌عامل و مدیر پکیج سرور مقصد' : 'Target Linux Distribution & Package Manager'}</span>
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-mono font-bold ${
                      isLightMode ? 'bg-blue-200 text-blue-900' : 'bg-blue-500/20 text-blue-300 border border-blue-500/30'
                    }`}>
                      {osInfo?.distroName || 'Linux Host'}
                    </span>
                  </h3>
                  <div className="flex flex-wrap items-center gap-2 text-xs mt-1 font-mono">
                    <span className="px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                      Pkg Manager: {osInfo?.pkgManager || 'apt/dnf/yum/pacman'}
                    </span>
                    <span className="px-2 py-0.5 rounded bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 border border-cyan-500/20">
                      Arch: {osInfo?.arch || 'x86_64'}
                    </span>
                    {osInfo?.kernel && (
                      <span className="px-2 py-0.5 rounded bg-purple-500/10 text-purple-600 dark:text-purple-400 border border-purple-500/20">
                        Kernel: {osInfo.kernel}
                      </span>
                    )}
                  </div>
                </div>
              </div>

              <button
                type="button"
                onClick={fetchVpnClientsAndOsInfo}
                disabled={isLoadingOsInfo}
                className={`px-3.5 py-2 rounded-xl border text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
                  isLightMode ? 'bg-white hover:bg-slate-100 border-slate-300 text-slate-700' : 'bg-white/10 hover:bg-white/20 border-white/10 text-white'
                }`}
              >
                <RefreshCw className={`w-3.5 h-3.5 text-blue-500 ${isLoadingOsInfo ? 'animate-spin' : ''}`} />
                <span>{isRtl ? 'شناسایی مجدد سیستم' : 'Re-detect System'}</span>
              </button>
            </div>

            {/* SECTION: VPN CLIENTS (PACKAGES & SERVICES MANAGEMENT) */}
            <div className={`p-6 rounded-3xl border space-y-6 transition-colors ${
              isLightMode ? 'bg-white border-slate-200 shadow-sm text-slate-800' : 'bg-slate-900/60 border-white/10 text-white'
            }`}>
              <div className={`flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b pb-4 ${
                isLightMode ? 'border-slate-200' : 'border-white/10'
              }`}>
                <div className="flex items-center gap-3">
                  <div className={`p-2.5 rounded-2xl border ${
                    isLightMode ? 'bg-purple-50 border-purple-200 text-purple-600' : 'bg-purple-500/20 border-purple-500/30 text-purple-400'
                  }`}>
                    <Cpu className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold flex items-center gap-2">
                      <span>{isRtl ? 'پکیج‌ها و کلاینت‌های VPN (VPN Clients)' : 'VPN Clients & Daemon Services'}</span>
                      <span className={`px-2 py-0.5 rounded-md text-[11px] font-mono font-bold ${
                        isLightMode ? 'bg-purple-100 text-purple-800' : 'bg-purple-500/20 text-purple-300'
                      }`}>
                        {vpnClientPackages.filter(p => p.isInstalled).length} / {vpnClientPackages.length} {isRtl ? 'نصب شده' : 'Installed'}
                      </span>
                    </h3>
                    <p className={`text-xs ${isLightMode ? 'text-slate-500' : 'text-slate-400'}`}>
                      {isRtl ? 'نصب، بروزرسانی، مدیریت سرویس‌ها و مشاهده لاگ تمام کلاینت‌های VPN لینوکس به صورت خودکار' : 'Install, remove, start/stop services, and audit logs for target VPN packages.'}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setShowImportConfigModal(true)}
                    className="px-3.5 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold transition-all shadow-md flex items-center gap-1.5 cursor-pointer"
                  >
                    <Download className="w-4 h-4" />
                    <span>{isRtl ? 'وارد کردن کانفیگ (.conf / .ovpn)' : 'Import Config File'}</span>
                  </button>
                </div>
              </div>

              {/* TOP CONTROLS: TARGET SERVER & IMPORT CONFIG */}
              <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4 p-4 rounded-2xl bg-slate-50 dark:bg-black/30 border border-slate-200 dark:border-white/10">
                {/* Target Connection Server Dropdown */}
                <div className="flex flex-col sm:flex-row sm:items-center gap-3 flex-1">
                  <div className="flex items-center gap-2 shrink-0 text-xs font-bold text-slate-700 dark:text-slate-300">
                    <Server className="w-4 h-4 text-cyan-500" />
                    <span>{isRtl ? 'سرور مقصد اجرا (Target Server):' : 'Execution Target:'}</span>
                  </div>

                  <select
                    value={selectedTargetId}
                    onChange={(e) => {
                      const newId = e.target.value;
                      setSelectedTargetId(newId);
                      fetchVpnClientsAndOsInfo(newId);
                    }}
                    className={`flex-1 max-w-md rounded-xl px-3 py-2 text-xs font-semibold outline-none transition-all ${
                      isLightMode
                        ? 'bg-white border border-slate-300 text-slate-900 focus:border-cyan-600 shadow-sm'
                        : 'bg-slate-900 border border-white/10 text-white focus:border-cyan-500/50'
                    }`}
                  >
                    <option value="local">
                      🖥️ {isRtl ? 'سرور لوکال پنل (Local Panel Server)' : 'Local Panel Server'}
                    </option>
                    {targetConnections.map((conn) => (
                      <option key={conn.id} value={conn.id}>
                        🌐 {conn.name || conn.host} ({conn.authType === 'agent' ? 'WebSocket Agent' : 'SSH'} - {conn.host})
                      </option>
                    ))}
                  </select>

                  <button
                    type="button"
                    onClick={() => fetchVpnClientsAndOsInfo(selectedTargetId)}
                    disabled={isLoadingOsInfo}
                    className={`px-3 py-2 rounded-xl border text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shrink-0 ${
                      isLightMode ? 'bg-white hover:bg-slate-100 border-slate-300 text-slate-700' : 'bg-white/10 hover:bg-white/20 border-white/10 text-white'
                    }`}
                  >
                    <RefreshCw className={`w-3.5 h-3.5 text-cyan-500 ${isLoadingOsInfo ? 'animate-spin' : ''}`} />
                    <span>{isRtl ? 'بروزرسانی وضعیت' : 'Refresh Target'}</span>
                  </button>
                </div>

                <button
                  type="button"
                  onClick={() => setShowImportConfigModal(true)}
                  className="px-3.5 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold transition-all shadow-md flex items-center justify-center gap-1.5 cursor-pointer shrink-0"
                >
                  <Download className="w-4 h-4" />
                  <span>{isRtl ? 'وارد کردن کانفیگ (.conf / .ovpn)' : 'Import Config File'}</span>
                </button>
              </div>

              {/* DROPDOWN SELECTOR FOR VPN CLIENTS */}
              <div className="space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-2">
                    <Sliders className="w-4 h-4 text-purple-500" />
                    <span>{isRtl ? 'انتخاب کلاینت VPN جهت مدیریت:' : 'Select VPN Client:'}</span>
                  </label>

                  {/* VPN Client Select Dropdown */}
                  <select
                    value={selectedVpnClientType}
                    onChange={(e) => setSelectedVpnClientType(e.target.value)}
                    className={`w-full sm:w-80 rounded-xl px-4 py-2.5 text-xs font-bold outline-none transition-all ${
                      isLightMode
                        ? 'bg-white border border-purple-300 text-slate-900 focus:border-purple-600 shadow-sm'
                        : 'bg-slate-900 border border-purple-500/40 text-white focus:border-purple-500/80 shadow-lg'
                    }`}
                  >
                    {vpnClientPackages.map((pkg) => (
                      <option key={pkg.type} value={pkg.type}>
                        {pkg.isInstalled ? '✅ ' : '❌ '} {pkg.name} ({pkg.isInstalled ? (isRtl ? 'نصب شده' : 'Installed') : (isRtl ? 'نصب نشده' : 'Not Installed')})
                      </option>
                    ))}
                  </select>
                </div>

                {/* Quick Selection Pills */}
                <div className="flex flex-wrap items-center gap-1.5 pt-1">
                  {vpnClientPackages.map((pkg) => {
                    const isSelected = selectedVpnClientType === pkg.type;
                    return (
                      <button
                        key={pkg.type}
                        type="button"
                        onClick={() => setSelectedVpnClientType(pkg.type)}
                        className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                          isSelected
                            ? 'bg-purple-600 text-white shadow-md shadow-purple-500/20 scale-105'
                            : pkg.isInstalled
                            ? (isLightMode ? 'bg-emerald-50 text-emerald-800 border border-emerald-200 hover:bg-emerald-100' : 'bg-emerald-500/10 text-emerald-300 border border-emerald-500/20 hover:bg-emerald-500/20')
                            : (isLightMode ? 'bg-slate-100 text-slate-600 border border-slate-200 hover:bg-slate-200' : 'bg-black/30 text-slate-400 border border-white/5 hover:bg-white/10')
                        }`}
                      >
                        <span className={`w-2 h-2 rounded-full ${pkg.isInstalled ? 'bg-emerald-400' : 'bg-slate-400'}`} />
                        <span>{pkg.name}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* ACTIVE SELECTED VPN CLIENT DETAILS CARD */}
              {(() => {
                const pkg = vpnClientPackages.find(p => p.type === selectedVpnClientType) || vpnClientPackages[0];
                if (!pkg) {
                  return (
                    <div className="p-8 text-center text-xs text-slate-400">
                      {isRtl ? 'درحال بارگذاری اطلاعات کلاینت‌های VPN...' : 'Loading VPN clients status...'}
                    </div>
                  );
                }

                const isLoadingThis = isPkgOpLoading === pkg.type || isPkgOpLoading?.startsWith(pkg.type);

                return (
                  <div
                    className={`p-6 rounded-2xl border transition-all space-y-6 ${
                      pkg.isInstalled
                        ? (isLightMode ? 'bg-slate-50/90 border-purple-200 shadow-md' : 'bg-black/40 border-purple-500/30 shadow-xl')
                        : (isLightMode ? 'bg-slate-100/50 border-slate-200' : 'bg-slate-950/40 border-white/5')
                    }`}
                  >
                    {/* Header */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b pb-4 border-slate-200 dark:border-white/10">
                      <div>
                        <h4 className="text-lg font-extrabold flex items-center gap-2">
                          <Wifi className="w-5 h-5 text-purple-500" />
                          <span>{pkg.name}</span>
                        </h4>
                        <p className="text-xs font-mono text-slate-500 dark:text-slate-400 mt-1">
                          {pkg.serviceName ? `Systemd Service: ${pkg.serviceName}` : `Binary Executable: ${pkg.type}`}
                        </p>
                      </div>

                      <div className="flex items-center gap-3">
                        {pkg.isInstalled ? (
                          <span className="px-3 py-1 rounded-xl text-xs font-bold bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30 flex items-center gap-1.5 shadow-sm">
                            <CheckCircle className="w-4 h-4" />
                            <span>{isRtl ? 'نصب شده روی سرور' : 'Installed on Target'}</span>
                          </span>
                        ) : (
                          <span className="px-3 py-1 rounded-xl text-xs font-bold bg-amber-500/20 text-amber-600 dark:text-amber-400 border border-amber-500/30 flex items-center gap-1.5 shadow-sm">
                            <AlertTriangle className="w-4 h-4" />
                            <span>{isRtl ? 'نصب نشده' : 'Not Installed'}</span>
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Metadata Specs Grid */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      <div className={`p-4 rounded-xl border space-y-1 ${isLightMode ? 'bg-white border-slate-200' : 'bg-slate-900/80 border-white/5'}`}>
                        <span className={`text-[11px] block font-semibold ${isLightMode ? 'text-slate-500' : 'text-slate-400'}`}>
                          {isRtl ? 'نسخه پکیج:' : 'Version:'}
                        </span>
                        <span className="font-mono font-bold text-sm text-purple-600 dark:text-purple-300 block truncate">
                          {pkg.version || 'N/A'}
                        </span>
                      </div>

                      <div className={`p-4 rounded-xl border space-y-1 ${isLightMode ? 'bg-white border-slate-200' : 'bg-slate-900/80 border-white/5'}`}>
                        <span className={`text-[11px] block font-semibold ${isLightMode ? 'text-slate-500' : 'text-slate-400'}`}>
                          {isRtl ? 'وضعیت سرویس:' : 'Service Status:'}
                        </span>
                        <span className={`font-mono font-bold text-sm block ${pkg.isRunning ? 'text-emerald-500' : 'text-slate-400'}`}>
                          {pkg.isRunning ? (isRtl ? 'درحال اجرا (Active)' : 'Running') : (isRtl ? 'متوقف (Inactive)' : 'Stopped')}
                        </span>
                      </div>

                      <div className={`p-4 rounded-xl border space-y-1 ${isLightMode ? 'bg-white border-slate-200' : 'bg-slate-900/80 border-white/5'}`}>
                        <span className={`text-[11px] block font-semibold ${isLightMode ? 'text-slate-500' : 'text-slate-400'}`}>
                          {isRtl ? 'اجرا در بوت سرور:' : 'Boot Auto-Start:'}
                        </span>
                        <span className={`font-mono font-bold text-sm block ${pkg.isEnabledAtBoot ? 'text-cyan-500' : 'text-slate-400'}`}>
                          {pkg.isEnabledAtBoot ? (isRtl ? 'فعال (Enabled)' : 'Enabled') : (isRtl ? 'غیرفعال (Disabled)' : 'Disabled')}
                        </span>
                      </div>
                    </div>

                    {/* Actions Panel */}
                    <div className="pt-2">
                      {!pkg.isInstalled ? (
                        <div className="flex flex-col sm:flex-row items-center gap-4">
                          <button
                            type="button"
                            onClick={() => handleInstallVpnClientPackage(pkg.type)}
                            disabled={isLoadingThis}
                            className="w-full sm:w-auto px-6 py-3 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold transition-all shadow-lg shadow-purple-500/20 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                          >
                            {isLoadingThis ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
                            <span>{isRtl ? `نصب پکیج ${pkg.name} روی سرور انتخاب‌شده` : `Install ${pkg.name} on Target Server`}</span>
                          </button>
                          <p className="text-xs text-slate-500 dark:text-slate-400">
                            {isRtl ? 'پکیج‌مدیریت سرور مقصد به طور خودکار شناسایی و نصب را انجام می‌دهد.' : 'Package manager on target server will automatically fetch and install missing binaries.'}
                          </p>
                        </div>
                      ) : (
                        <div className="space-y-4">
                          <div className="flex flex-wrap items-center gap-2.5">
                            {pkg.isRunning ? (
                              <button
                                type="button"
                                onClick={() => handleVpnClientServiceControl(pkg.type, 'stop')}
                                disabled={isLoadingThis}
                                className="px-4 py-2.5 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/30 text-rose-600 dark:text-rose-400 text-xs font-bold transition-all cursor-pointer disabled:opacity-50 flex items-center gap-1.5"
                              >
                                {isLoadingThis ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <XCircle className="w-3.5 h-3.5" />}
                                <span>{isRtl ? 'توقف سرویس' : 'Stop Service'}</span>
                              </button>
                            ) : (
                              <button
                                type="button"
                                onClick={() => handleVpnClientServiceControl(pkg.type, 'start')}
                                disabled={isLoadingThis}
                                className="px-4 py-2.5 rounded-xl bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400 text-xs font-bold transition-all cursor-pointer disabled:opacity-50 flex items-center gap-1.5"
                              >
                                {isLoadingThis ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Play className="w-3.5 h-3.5" />}
                                <span>{isRtl ? 'شروع سرویس' : 'Start Service'}</span>
                              </button>
                            )}

                            <button
                              type="button"
                              onClick={() => handleVpnClientServiceControl(pkg.type, 'restart')}
                              disabled={isLoadingThis}
                              className="px-4 py-2.5 rounded-xl bg-blue-500/10 hover:bg-blue-500/20 border border-blue-500/30 text-blue-600 dark:text-blue-400 text-xs font-bold transition-all cursor-pointer disabled:opacity-50 flex items-center gap-1.5"
                            >
                              {isLoadingThis ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <RotateCcw className="w-3.5 h-3.5" />}
                              <span>{isRtl ? 'ریستارت سرویس' : 'Restart Service'}</span>
                            </button>

                            <button
                              type="button"
                              onClick={() => handleVpnClientServiceControl(pkg.type, pkg.isEnabledAtBoot ? 'disable-boot' : 'enable-boot')}
                              disabled={isLoadingThis}
                              className={`px-4 py-2.5 rounded-xl border text-xs font-bold transition-all cursor-pointer disabled:opacity-50 flex items-center gap-1.5 ${
                                pkg.isEnabledAtBoot
                                  ? 'bg-amber-500/10 hover:bg-amber-500/20 border-amber-500/30 text-amber-600 dark:text-amber-400'
                                  : 'bg-cyan-500/10 hover:bg-cyan-500/20 border-cyan-500/30 text-cyan-600 dark:text-cyan-400'
                              }`}
                            >
                              {pkg.isEnabledAtBoot ? (isRtl ? 'غیرفعال‌سازی در بوت' : 'Disable Boot') : (isRtl ? 'فعال‌سازی در بوت' : 'Enable Boot')}
                            </button>

                            <button
                              type="button"
                              onClick={() => handleViewVpnClientLogs(pkg.type, pkg.name)}
                              disabled={isLoadingThis}
                              className="px-4 py-2.5 rounded-xl bg-slate-500/10 hover:bg-slate-500/20 border border-slate-500/30 text-slate-700 dark:text-slate-300 text-xs font-bold transition-all cursor-pointer disabled:opacity-50 flex items-center gap-1.5"
                            >
                              <FileCode className="w-3.5 h-3.5" />
                              <span>{isRtl ? 'مشاهده لاگ‌ها' : 'View Logs'}</span>
                            </button>

                            <button
                              type="button"
                              onClick={() => handleUninstallVpnClientPackage(pkg.type)}
                              disabled={isLoadingThis}
                              className="px-4 py-2.5 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/30 text-rose-600 dark:text-rose-400 text-xs font-bold transition-all cursor-pointer disabled:opacity-50 flex items-center gap-1.5 ml-auto"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                              <span>{isRtl ? 'حذف پکیج' : 'Uninstall Package'}</span>
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })()}
            </div>

            {/* Anti-Lockout / Route Protection Banner */}
            <div className={`p-5 rounded-3xl border shadow-lg flex flex-col md:flex-row md:items-center justify-between gap-4 transition-colors ${
              isLightMode ? 'bg-emerald-50/90 border-emerald-300 text-emerald-950 shadow-emerald-500/5' : 'bg-slate-950/60 border-emerald-500/30 text-white shadow-lg'
            }`}>
              <div className="flex items-center gap-3">
                <div className={`p-2.5 rounded-xl border ${
                  isLightMode ? 'bg-emerald-100 border-emerald-300 text-emerald-700' : 'bg-emerald-500/20 border-emerald-500/30 text-emerald-400'
                }`}>
                  <Radio className="w-6 h-6 animate-pulse" />
                </div>
                <div>
                  <h3 className={`text-sm font-bold flex items-center gap-2 ${isLightMode ? 'text-emerald-900' : 'text-emerald-300'}`}>
                    <span>{isRtl ? 'محافظت از روت پنل مدیریت (Anti-Lockout Protection)' : 'Panel Route Anti-Lockout Protection'}</span>
                    <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold ${
                      vpnProxySettings?.routeProtectionEnabled 
                        ? (isLightMode ? 'bg-emerald-200 text-emerald-900 border border-emerald-400' : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30')
                        : (isLightMode ? 'bg-slate-200 text-slate-700' : 'bg-slate-800 text-slate-400')
                    }`}>
                      {vpnProxySettings?.routeProtectionEnabled ? (isRtl ? 'فعال' : 'ACTIVE') : (isRtl ? 'غیرفعال' : 'INACTIVE')}
                    </span>
                  </h3>
                  <p className={`text-xs mt-0.5 ${isLightMode ? 'text-emerald-800' : 'text-slate-400'}`}>
                    {isRtl 
                      ? 'با فعال بودن این گزینه، استثنای روت پنل مدیریت به جدول مسیربندی اضافه می‌شود تا هنگام اتصال/قطع تونل‌های VPN، ارتباط شما با این پنل هرگز قطعی پیدا نکند.' 
                      : 'Ensures direct static bypass routes are added so your connection to this admin panel stays active when VPN tunnels connect.'}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3 self-end md:self-center">
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={vpnProxySettings?.routeProtectionEnabled ?? true}
                    onChange={(e) => handleToggleRouteProtection(e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-slate-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-500"></div>
                </label>
              </div>
            </div>

            {/* Test Route Result Alert */}
            {routeTestResult && (
              <div className={`p-4 rounded-2xl border text-xs flex items-center justify-between transition-colors ${
                isLightMode ? 'bg-cyan-50 border-cyan-300 text-cyan-900' : 'bg-cyan-950/40 border-cyan-500/30 text-cyan-200'
              }`}>
                <div className="flex items-center gap-2">
                  <Zap className="w-4 h-4 text-cyan-600" />
                  <span>{routeTestResult.message} (Latency: {routeTestResult.latencyMs}ms)</span>
                </div>
                <button onClick={() => setRouteTestResult(null)} className="text-slate-400 hover:text-slate-700 dark:hover:text-white">✕</button>
              </div>
            )}

            {/* SECTION 1: WINDOWS-LIKE CONFIGURED CLIENT CONNECTIONS */}
            <div className={`p-6 rounded-3xl border space-y-6 transition-colors ${
              isLightMode ? 'bg-white border-slate-200 shadow-sm text-slate-800' : 'bg-slate-900/60 border-white/10 text-white'
            }`}>
              <div className={`flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b pb-4 ${
                isLightMode ? 'border-slate-200' : 'border-white/10'
              }`}>
                <div className="flex items-center gap-3">
                  <div className={`p-2.5 rounded-2xl border ${
                    isLightMode ? 'bg-blue-50 border-blue-200 text-blue-600' : 'bg-blue-500/20 border-blue-500/30 text-blue-400'
                  }`}>
                    <Wifi className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold flex items-center gap-2">
                      <span>{isRtl ? 'کانکشن‌های VPN و پروکسی (Windows VPN Profiles)' : 'Configured VPN & Proxy Profiles'}</span>
                      <span className={`px-2 py-0.5 rounded-md text-[11px] font-mono font-bold ${
                        isLightMode ? 'bg-slate-100 text-slate-700 border border-slate-300' : 'bg-white/10 text-slate-300'
                      }`}>
                        {vpnClientConnections.length} {isRtl ? 'کانکشن' : 'Profiles'}
                      </span>
                    </h3>
                    <p className={`text-xs ${isLightMode ? 'text-slate-500' : 'text-slate-400'}`}>
                      {isRtl ? 'مشاهده، ویرایش، اتصال یا قطع اتصال مستقیم کانکشن‌های SSTP, L2TP, PPTP, SOCKS5' : 'Connect, disconnect, or edit client connections in one click.'}
                    </p>
                  </div>
                </div>

                <button
                  onClick={handleOpenAddConnModal}
                  className="px-3.5 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-bold transition-all shadow-md flex items-center gap-1.5 self-start sm:self-auto cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                  <span>{isRtl ? 'افزودن کانکشن' : 'Add Connection'}</span>
                </button>
              </div>

              {/* Connections Grid */}
              {vpnClientConnections.length === 0 ? (
                <div className={`text-center py-12 rounded-2xl border ${
                  isLightMode ? 'bg-slate-50 border-slate-200 text-slate-500' : 'bg-black/30 border-white/5 text-slate-400'
                }`}>
                  <Network className="w-10 h-10 mx-auto mb-2 opacity-50" />
                  <p className="text-sm font-semibold">{isRtl ? 'هیچ کانکشنی تعریف نشده است.' : 'No VPN or Proxy connection profiles created yet.'}</p>
                  <p className="text-xs mt-1">{isRtl ? 'برای ایجاد کانکشن جدید مانند ویندوز، روی دکمه افزودن کانکشن کلیک کنید.' : 'Click "Add Connection" to setup SSTP, L2TP, or Proxy profile.'}</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                  {vpnClientConnections.map((conn) => {
                    const isConnected = conn.status === 'connected';
                    const isConnecting = isConnectingId === conn.id;

                    return (
                      <div
                        key={conn.id}
                        className={`p-5 rounded-2xl border transition-all space-y-4 flex flex-col justify-between ${
                          isConnected
                            ? (isLightMode ? 'bg-emerald-50/80 border-emerald-300 shadow-md shadow-emerald-500/5' : 'bg-slate-900/90 border-emerald-500/40 shadow-lg shadow-emerald-950/20')
                            : (isLightMode ? 'bg-slate-50/80 border-slate-200 hover:border-slate-300' : 'bg-black/40 border-white/10 hover:border-white/20')
                        }`}
                      >
                        {/* Header info */}
                        <div className="space-y-3 min-w-0">
                          <div className="flex flex-wrap items-start justify-between gap-2">
                            <div className="min-w-0 flex-1">
                              <h4 className={`text-sm font-bold flex items-center gap-2 ${
                                isLightMode ? 'text-slate-900' : 'text-white'
                              }`}>
                                <span className="truncate block" title={conn.name}>{conn.name}</span>
                              </h4>
                              <p className={`text-[11px] font-mono mt-0.5 dir-ltr text-right rtl:text-left truncate block ${
                                isLightMode ? 'text-slate-600' : 'text-slate-400'
                              }`}>
                                {conn.serverHost}:{conn.port}
                              </p>
                            </div>

                            <div className="flex flex-wrap items-center justify-end gap-1.5 shrink-0 max-w-full">
                              <span className={`px-2 py-0.5 rounded text-[10px] font-extrabold font-mono uppercase whitespace-nowrap ${
                                conn.protocol === 'sstp'
                                  ? (isLightMode ? 'bg-cyan-100 text-cyan-800 border border-cyan-300' : 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30')
                                  : conn.protocol === 'l2tp'
                                  ? (isLightMode ? 'bg-indigo-100 text-indigo-800 border border-indigo-300' : 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/30')
                                  : conn.protocol === 'pptp'
                                  ? (isLightMode ? 'bg-blue-100 text-blue-800 border border-blue-300' : 'bg-blue-500/20 text-blue-300 border border-blue-500/30')
                                  : (isLightMode ? 'bg-amber-100 text-amber-800 border border-amber-300' : 'bg-amber-500/20 text-amber-300 border border-amber-500/30')
                              }`}>
                                {conn.protocol}
                              </span>

                              <span className={`px-2 py-0.5 rounded text-[10px] font-bold whitespace-nowrap ${
                                isConnected
                                  ? 'bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30'
                                  : (isLightMode ? 'bg-slate-200 text-slate-600' : 'bg-slate-800 text-slate-400')
                              }`}>
                                {isConnected ? (isRtl ? 'متصل' : 'Connected') : (isRtl ? 'قطع' : 'Disconnected')}
                              </span>
                            </div>
                          </div>

                          {/* Detail Badges */}
                          <div className={`p-3 rounded-xl border text-xs space-y-1.5 min-w-0 ${
                            isLightMode ? 'bg-white border-slate-200 text-slate-700' : 'bg-slate-950/60 border-white/5 text-slate-300'
                          }`}>
                            <div className="flex justify-between items-center gap-2">
                              <span className={`text-[11px] shrink-0 ${isLightMode ? 'text-slate-500' : 'text-slate-400'}`}>{isRtl ? 'نام کاربری:' : 'User:'}</span>
                              <span className="font-mono font-semibold text-cyan-600 dark:text-cyan-300 truncate">{conn.username}</span>
                            </div>

                            {conn.protocol === 'sstp' && conn.ignoreCertErrors && (
                              <div className="flex items-center text-[10px] pt-1 border-t border-slate-200 dark:border-white/5">
                                <span className="text-emerald-600 dark:text-emerald-400 font-semibold flex items-center gap-1 flex-wrap">
                                  <ShieldCheck className="w-3 h-3 shrink-0" />
                                  <span className="break-words leading-tight">{isRtl ? 'بدون نیاز به SSL (مشابه ویندوز)' : 'Windows SSTP No Cert Required'}</span>
                                </span>
                              </div>
                            )}

                            {conn.protocol === 'l2tp' && conn.presharedKey && (
                              <div className="flex justify-between items-center gap-2 text-[10px] pt-1 border-t border-slate-200 dark:border-white/5">
                                <span className={`shrink-0 ${isLightMode ? 'text-slate-500' : 'text-slate-400'}`}>PSK Key:</span>
                                <span className="font-mono text-indigo-600 dark:text-indigo-300">••••••••</span>
                              </div>
                            )}

                            {isConnected && (
                              <div className="pt-1.5 border-t border-slate-200 dark:border-white/5 space-y-1 text-[11px]">
                                <div className="flex justify-between items-center gap-2">
                                  <span className={`shrink-0 ${isLightMode ? 'text-slate-500' : 'text-slate-400'}`}>{isRtl ? 'IP اختصاصی تونل:' : 'Tunnel IP:'}</span>
                                  <span className="font-mono font-bold text-emerald-600 dark:text-emerald-400 truncate">{conn.assignedIp || '10.10.0.12'}</span>
                                </div>
                                <div className="flex justify-between items-center gap-2">
                                  <span className={`shrink-0 ${isLightMode ? 'text-slate-500' : 'text-slate-400'}`}>{isRtl ? 'پینگ تا سرور:' : 'Latency:'}</span>
                                  <span className="font-mono text-cyan-600 dark:text-cyan-300">{conn.latencyMs} ms</span>
                                </div>
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Action Buttons */}
                        <div className="flex items-center gap-2 pt-2 border-t border-slate-200 dark:border-white/5">
                          {isConnected ? (
                            <button
                              type="button"
                              onClick={() => handleDisconnectTunnel(conn.id)}
                              disabled={isConnecting}
                              className="flex-1 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold transition-all shadow-md shadow-rose-500/20 flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
                            >
                              {isConnecting ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <XCircle className="w-3.5 h-3.5" />}
                              <span>{isRtl ? 'قطع اتصال' : 'Disconnect'}</span>
                            </button>
                          ) : (
                            <button
                              type="button"
                              onClick={() => handleConnectTunnel(conn.id)}
                              disabled={isConnecting}
                              className="flex-1 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition-all shadow-md shadow-emerald-500/20 flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
                            >
                              {isConnecting ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Play className="w-3.5 h-3.5 fill-current" />}
                              <span>{isRtl ? 'اتصال (Connect)' : 'Connect'}</span>
                            </button>
                          )}

                          <button
                            type="button"
                            onClick={() => handleOpenEditConnModal(conn)}
                            className={`p-2 rounded-xl border text-xs font-semibold transition-all cursor-pointer ${
                              isLightMode ? 'bg-slate-100 hover:bg-slate-200 border-slate-300 text-slate-700' : 'bg-white/10 hover:bg-white/20 border-white/10 text-white'
                            }`}
                            title={isRtl ? 'ویرایش کانکشن' : 'Edit Profile'}
                          >
                            <Settings className="w-4 h-4" />
                          </button>

                          <button
                            type="button"
                            onClick={() => handleDeleteConnProfile(conn.id)}
                            className="p-2 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-500 border border-rose-500/30 text-xs font-semibold transition-all cursor-pointer"
                            title={isRtl ? 'حذف کانکشن' : 'Delete Profile'}
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* SECTION 2: TARGET SERVER VPN DAEMONS STATUS */}
            <div className={`p-6 rounded-3xl border space-y-6 transition-colors ${
              isLightMode ? 'bg-white border-slate-200 shadow-sm text-slate-800' : 'bg-slate-900/60 border-white/10 text-white'
            }`}>
              <h3 className="text-base font-bold flex items-center gap-2">
                <Server className="w-5 h-5 text-cyan-500" />
                <span>{isRtl ? 'سرویس‌های دیمون VPN سرور مقصد (Destination Server Services)' : 'Destination Server Daemon Services'}</span>
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* PPTP Daemon */}
                <div className={`p-5 rounded-3xl border transition-all space-y-4 ${
                  isLightMode ? 'bg-slate-50 border-slate-200' : 'bg-slate-900/60 border-white/10'
                }`}>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <div className="p-2 rounded-xl bg-blue-500/20 text-blue-500 font-bold text-xs">PPTP</div>
                      <div>
                        <h4 className={`text-sm font-bold ${isLightMode ? 'text-slate-900' : 'text-white'}`}>PPTP Service</h4>
                        <p className={`text-[11px] ${isLightMode ? 'text-slate-500' : 'text-slate-400'}`}>Point-to-Point Tunneling</p>
                      </div>
                    </div>
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                      vpnProxySettings?.protocols?.pptp?.status === 'running' 
                        ? 'bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30' 
                        : 'bg-rose-500/20 text-rose-600 dark:text-rose-400 border border-rose-500/30'
                    }`}>
                      {vpnProxySettings?.protocols?.pptp?.status || 'stopped'}
                    </span>
                  </div>

                  <div className={`space-y-2 text-xs p-3 rounded-2xl border ${
                    isLightMode ? 'bg-white border-slate-200 text-slate-700' : 'bg-black/30 border-white/5 text-slate-300'
                  }`}>
                    <div className="flex justify-between"><span className={isLightMode ? 'text-slate-500' : 'text-slate-500'}>Port:</span><span className="font-mono text-cyan-600 dark:text-cyan-300">{vpnProxySettings?.protocols?.pptp?.port || 1723}</span></div>
                    <div className="flex justify-between"><span className={isLightMode ? 'text-slate-500' : 'text-slate-500'}>Subnet:</span><span className="font-mono text-cyan-600 dark:text-cyan-300">{vpnProxySettings?.protocols?.pptp?.subnet || '10.8.0.0/24'}</span></div>
                    <div className="flex justify-between"><span className={isLightMode ? 'text-slate-500' : 'text-slate-500'}>Package:</span><span className="font-mono text-emerald-600 dark:text-emerald-400">pptpd</span></div>
                  </div>

                  <div className="flex items-center gap-2 pt-2">
                    <button
                      onClick={() => handleVpnServiceAction('pptp', 'restart')}
                      className={`flex-1 py-1.5 rounded-xl border text-xs font-semibold transition-all ${
                        isLightMode ? 'bg-white border-slate-300 hover:bg-slate-100 text-slate-800' : 'bg-white/5 hover:bg-white/10 border-white/10 text-slate-200'
                      }`}
                    >
                      {isRtl ? 'راه‌اندازی مجدد' : 'Restart'}
                    </button>
                    <button
                      onClick={() => handleVpnServiceAction('pptp', vpnProxySettings?.protocols?.pptp?.status === 'running' ? 'stop' : 'start')}
                      className={`flex-1 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                        vpnProxySettings?.protocols?.pptp?.status === 'running'
                          ? 'bg-rose-500/20 hover:bg-rose-500/30 text-rose-600 dark:text-rose-300 border border-rose-500/30'
                          : 'bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-600 dark:text-emerald-300 border border-emerald-500/30'
                      }`}
                    >
                      {vpnProxySettings?.protocols?.pptp?.status === 'running' ? (isRtl ? 'توقف' : 'Stop') : (isRtl ? 'شروع' : 'Start')}
                    </button>
                  </div>
                </div>

                {/* L2TP / IPsec Daemon */}
                <div className={`p-5 rounded-3xl border transition-all space-y-4 ${
                  isLightMode ? 'bg-slate-50 border-slate-200' : 'bg-slate-900/60 border-white/10'
                }`}>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <div className="p-2 rounded-xl bg-indigo-500/20 text-indigo-500 font-bold text-xs">L2TP</div>
                      <div>
                        <h4 className={`text-sm font-bold ${isLightMode ? 'text-slate-900' : 'text-white'}`}>L2TP / IPsec</h4>
                        <p className={`text-[11px] ${isLightMode ? 'text-slate-500' : 'text-slate-400'}`}>Layer 2 + PSK</p>
                      </div>
                    </div>
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                      vpnProxySettings?.protocols?.l2tp?.status === 'running' 
                        ? 'bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30' 
                        : 'bg-rose-500/20 text-rose-600 dark:text-rose-400 border border-rose-500/30'
                    }`}>
                      {vpnProxySettings?.protocols?.l2tp?.status || 'stopped'}
                    </span>
                  </div>

                  <div className={`space-y-2 text-xs p-3 rounded-2xl border ${
                    isLightMode ? 'bg-white border-slate-200 text-slate-700' : 'bg-black/30 border-white/5 text-slate-300'
                  }`}>
                    <div className="flex justify-between"><span className={isLightMode ? 'text-slate-500' : 'text-slate-500'}>Port:</span><span className="font-mono text-cyan-600 dark:text-cyan-300">{vpnProxySettings?.protocols?.l2tp?.port || 1701}</span></div>
                    <div className="flex justify-between"><span className={isLightMode ? 'text-slate-500' : 'text-slate-500'}>IPsec Key:</span><span className="font-mono text-cyan-600 dark:text-cyan-300">{vpnProxySettings?.protocols?.l2tp?.ipsecKey || 'MatrixPsk2026!'}</span></div>
                    <div className="flex justify-between"><span className={isLightMode ? 'text-slate-500' : 'text-slate-500'}>Package:</span><span className="font-mono text-emerald-600 dark:text-emerald-400">xl2tpd</span></div>
                  </div>

                  <div className="flex items-center gap-2 pt-2">
                    <button
                      onClick={() => handleVpnServiceAction('l2tp', 'restart')}
                      className={`flex-1 py-1.5 rounded-xl border text-xs font-semibold transition-all ${
                        isLightMode ? 'bg-white border-slate-300 hover:bg-slate-100 text-slate-800' : 'bg-white/5 hover:bg-white/10 border-white/10 text-slate-200'
                      }`}
                    >
                      {isRtl ? 'راه‌اندازی مجدد' : 'Restart'}
                    </button>
                    <button
                      onClick={() => handleVpnServiceAction('l2tp', vpnProxySettings?.protocols?.l2tp?.status === 'running' ? 'stop' : 'start')}
                      className={`flex-1 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                        vpnProxySettings?.protocols?.l2tp?.status === 'running'
                          ? 'bg-rose-500/20 hover:bg-rose-500/30 text-rose-600 dark:text-rose-300 border border-rose-500/30'
                          : 'bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-600 dark:text-emerald-300 border border-emerald-500/30'
                      }`}
                    >
                      {vpnProxySettings?.protocols?.l2tp?.status === 'running' ? (isRtl ? 'توقف' : 'Stop') : (isRtl ? 'شروع' : 'Start')}
                    </button>
                  </div>
                </div>

                {/* SSTP Daemon */}
                <div className={`p-5 rounded-3xl border transition-all space-y-4 ${
                  isLightMode ? 'bg-slate-50 border-slate-200' : 'bg-slate-900/60 border-white/10'
                }`}>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <div className="p-2 rounded-xl bg-cyan-500/20 text-cyan-600 dark:text-cyan-400 font-bold text-xs">SSTP</div>
                      <div>
                        <h4 className={`text-sm font-bold ${isLightMode ? 'text-slate-900' : 'text-white'}`}>SSTP Server</h4>
                        <p className={`text-[11px] ${isLightMode ? 'text-slate-500' : 'text-slate-400'}`}>SSL / HTTPS Tunneling</p>
                      </div>
                    </div>
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                      vpnProxySettings?.protocols?.sstp?.status === 'running' 
                        ? 'bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30' 
                        : 'bg-rose-500/20 text-rose-600 dark:text-rose-400 border border-rose-500/30'
                    }`}>
                      {vpnProxySettings?.protocols?.sstp?.status || 'stopped'}
                    </span>
                  </div>

                  <div className={`space-y-2 text-xs p-3 rounded-2xl border ${
                    isLightMode ? 'bg-white border-slate-200 text-slate-700' : 'bg-black/30 border-white/5 text-slate-300'
                  }`}>
                    <div className="flex justify-between"><span className={isLightMode ? 'text-slate-500' : 'text-slate-500'}>Port:</span><span className="font-mono text-cyan-600 dark:text-cyan-300">{vpnProxySettings?.protocols?.sstp?.port || 443}</span></div>
                    <div className="flex justify-between"><span className={isLightMode ? 'text-slate-500' : 'text-slate-500'}>Mode:</span><span className="font-mono text-emerald-600 dark:text-emerald-400">{isRtl ? 'کلاینت و سرور ویندوزی' : 'Windows Compat'}</span></div>
                    <div className="flex justify-between"><span className={isLightMode ? 'text-slate-500' : 'text-slate-500'}>Package:</span><span className="font-mono text-emerald-600 dark:text-emerald-400">sstp-server</span></div>
                  </div>

                  <div className="flex items-center gap-2 pt-2">
                    <button
                      onClick={() => handleVpnServiceAction('sstp', 'restart')}
                      className={`flex-1 py-1.5 rounded-xl border text-xs font-semibold transition-all ${
                        isLightMode ? 'bg-white border-slate-300 hover:bg-slate-100 text-slate-800' : 'bg-white/5 hover:bg-white/10 border-white/10 text-slate-200'
                      }`}
                    >
                      {isRtl ? 'راه‌اندازی مجدد' : 'Restart'}
                    </button>
                    <button
                      onClick={() => handleVpnServiceAction('sstp', vpnProxySettings?.protocols?.sstp?.status === 'running' ? 'stop' : 'start')}
                      className={`flex-1 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                        vpnProxySettings?.protocols?.sstp?.status === 'running'
                          ? 'bg-rose-500/20 hover:bg-rose-500/30 text-rose-600 dark:text-rose-300 border border-rose-500/30'
                          : 'bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-600 dark:text-emerald-300 border border-emerald-500/30'
                      }`}
                    >
                      {vpnProxySettings?.protocols?.sstp?.status === 'running' ? (isRtl ? 'توقف' : 'Stop') : (isRtl ? 'شروع' : 'Start')}
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* SECTION 3: PROXY SERVICES */}
            <div className={`p-6 rounded-3xl border space-y-6 transition-colors ${
              isLightMode ? 'bg-white border-slate-200 shadow-sm text-slate-800' : 'bg-slate-900/60 border-white/10 text-white'
            }`}>
              <div className={`flex items-center justify-between border-b pb-4 ${
                isLightMode ? 'border-slate-200' : 'border-white/10'
              }`}>
                <div className="flex items-center gap-3">
                  <div className={`p-2.5 rounded-2xl border ${
                    isLightMode ? 'bg-amber-50 border-amber-200 text-amber-600' : 'bg-amber-500/20 border-amber-500/30 text-amber-400'
                  }`}>
                    <Globe className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold">{isRtl ? 'مدیریت پروکسی سرور (SOCKS5 & HTTP Proxy)' : 'Proxy Services (SOCKS5 & HTTP Proxy)'}</h3>
                    <p className={`text-xs ${isLightMode ? 'text-slate-500' : 'text-slate-400'}`}>
                      {isRtl ? 'تنظیم پروکسی با احراز هویت و پورت اختصاصی روی سرور مقصد' : 'Configure SOCKS5 and HTTP proxy instances with user auth'}
                    </p>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* SOCKS5 */}
                <div className={`p-5 rounded-2xl border space-y-3 ${
                  isLightMode ? 'bg-slate-50 border-slate-200' : 'bg-black/40 border-white/10'
                }`}>
                  <div className="flex justify-between items-center">
                    <span className={`font-bold text-sm flex items-center gap-2 ${isLightMode ? 'text-slate-900' : 'text-white'}`}>
                      <Terminal className="w-4 h-4 text-amber-500" />
                      <span>SOCKS5 Proxy</span>
                    </span>
                    <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-[10px] font-bold">Active</span>
                  </div>
                  <div className={`text-xs space-y-1 ${isLightMode ? 'text-slate-600' : 'text-slate-400'}`}>
                    <p>{isRtl ? 'پورت ارتباطی:' : 'Port:'} <span className="font-mono font-bold text-amber-600 dark:text-amber-300">1080</span></p>
                    <p>{isRtl ? 'احراز هویت:' : 'Authentication:'} <span className="text-emerald-600 dark:text-emerald-400 font-semibold">{isRtl ? 'فعال' : 'Required'}</span></p>
                  </div>
                  <button
                    onClick={() => handleVpnServiceAction('socks5', 'restart')}
                    className="w-full py-2 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 text-amber-600 dark:text-amber-300 text-xs font-bold transition-all cursor-pointer"
                  >
                    {isRtl ? 'راه‌اندازی مجدد پروکسی SOCKS5' : 'Restart SOCKS5 Proxy'}
                  </button>
                </div>

                {/* HTTP Proxy */}
                <div className={`p-5 rounded-2xl border space-y-3 ${
                  isLightMode ? 'bg-slate-50 border-slate-200' : 'bg-black/40 border-white/10'
                }`}>
                  <div className="flex justify-between items-center">
                    <span className={`font-bold text-sm flex items-center gap-2 ${isLightMode ? 'text-slate-900' : 'text-white'}`}>
                      <Globe className="w-4 h-4 text-cyan-500" />
                      <span>HTTP / HTTPS Proxy</span>
                    </span>
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                      isLightMode ? 'bg-slate-200 text-slate-600' : 'bg-slate-800 text-slate-400'
                    }`}>
                      Stopped
                    </span>
                  </div>
                  <div className={`text-xs space-y-1 ${isLightMode ? 'text-slate-600' : 'text-slate-400'}`}>
                    <p>{isRtl ? 'پورت ارتباطی:' : 'Port:'} <span className="font-mono text-cyan-600 dark:text-cyan-300">8080</span></p>
                    <p>{isRtl ? 'موتور پروکسی:' : 'Proxy Engine:'} <span className={isLightMode ? 'text-slate-800' : 'text-slate-300'}>3proxy</span></p>
                  </div>
                  <button
                    onClick={() => handleVpnServiceAction('httpProxy', 'start')}
                    className="w-full py-2 rounded-xl bg-cyan-500/10 hover:bg-cyan-500/20 border border-cyan-500/30 text-cyan-600 dark:text-cyan-300 text-xs font-bold transition-all cursor-pointer"
                  >
                    {isRtl ? 'شروع سرویس HTTP Proxy' : 'Start HTTP Proxy'}
                  </button>
                </div>
              </div>
            </div>

            {/* SECTION 4: VPN & PROXY USER ACCOUNTS */}
            <div className={`p-6 rounded-3xl border space-y-6 transition-colors ${
              isLightMode ? 'bg-white border-slate-200 shadow-sm text-slate-800' : 'bg-slate-900/60 border-white/10 text-white'
            }`}>
              <h3 className="text-base font-bold flex items-center gap-2">
                <Users className="w-5 h-5 text-indigo-500" />
                <span>{isRtl ? 'تعریف و مدیریت کاربران VPN و پروکسی' : 'VPN & Proxy User Credentials'}</span>
              </h3>

              {/* Create User Form */}
              <form onSubmit={handleCreateVpnUser} className={`p-4 rounded-2xl border grid grid-cols-1 md:grid-cols-4 gap-4 items-end ${
                isLightMode ? 'bg-slate-50 border-slate-200' : 'bg-black/40 border-white/10'
              }`}>
                <div>
                  <label className={`block text-xs font-semibold mb-1 ${isLightMode ? 'text-slate-700' : 'text-slate-300'}`}>{isRtl ? 'نام کاربری:' : 'Username:'}</label>
                  <input
                    type="text"
                    value={newVpnUser}
                    onChange={(e) => setNewVpnUser(e.target.value)}
                    placeholder="e.g. client_vpn_1"
                    required
                    className={`w-full rounded-xl px-3 py-2 text-xs outline-none transition-colors ${
                      isLightMode ? 'bg-white border border-slate-300 text-slate-900 focus:border-indigo-500' : 'bg-slate-900 border border-white/10 text-white focus:border-indigo-500/50'
                    }`}
                  />
                </div>

                <div>
                  <label className={`block text-xs font-semibold mb-1 ${isLightMode ? 'text-slate-700' : 'text-slate-300'}`}>{isRtl ? 'کلمه عبور:' : 'Password:'}</label>
                  <input
                    type="text"
                    value={newVpnPass}
                    onChange={(e) => setNewVpnPass(e.target.value)}
                    placeholder="Secret Password"
                    required
                    className={`w-full rounded-xl px-3 py-2 text-xs outline-none transition-colors ${
                      isLightMode ? 'bg-white border border-slate-300 text-slate-900 focus:border-indigo-500' : 'bg-slate-900 border border-white/10 text-white focus:border-indigo-500/50'
                    }`}
                  />
                </div>

                <div>
                  <label className={`block text-xs font-semibold mb-1 ${isLightMode ? 'text-slate-700' : 'text-slate-300'}`}>{isRtl ? 'IP اختصاصی (اختیاری):' : 'Assigned Static IP:'}</label>
                  <input
                    type="text"
                    value={newVpnAssignedIp}
                    onChange={(e) => setNewVpnAssignedIp(e.target.value)}
                    placeholder="e.g. 10.8.0.50"
                    className={`w-full rounded-xl px-3 py-2 text-xs outline-none transition-colors ${
                      isLightMode ? 'bg-white border border-slate-300 text-slate-900 focus:border-indigo-500' : 'bg-slate-900 border border-white/10 text-white focus:border-indigo-500/50'
                    }`}
                  />
                </div>

                <button
                  type="submit"
                  disabled={isSavingVpnUser}
                  className="w-full py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold transition-all shadow-lg shadow-indigo-500/20 cursor-pointer disabled:opacity-50"
                >
                  {isSavingVpnUser ? <RefreshCw className="w-4 h-4 animate-spin mx-auto" /> : (isRtl ? 'ذخیره / تعریف کاربر' : 'Add User')}
                </button>
              </form>

              {/* Users Table */}
              <div className="overflow-x-auto">
                <table className={`w-full text-xs text-right rtl:text-right ${isLightMode ? 'text-slate-700' : 'text-slate-300'}`}>
                  <thead className={`font-bold uppercase ${isLightMode ? 'bg-slate-100 text-slate-600' : 'bg-white/5 text-slate-400'}`}>
                    <tr>
                      <th className="p-3 rounded-s-xl">{isRtl ? 'نام کاربر' : 'Username'}</th>
                      <th className="p-3">{isRtl ? 'رمز عبور' : 'Password'}</th>
                      <th className="p-3">{isRtl ? 'پروتکل‌های مجاز' : 'Allowed Protocols'}</th>
                      <th className="p-3">{isRtl ? 'IP اختصاصی' : 'Assigned IP'}</th>
                      <th className="p-3">{isRtl ? 'میزان مصرف' : 'Usage'}</th>
                      <th className="p-3 text-center rounded-e-xl">{isRtl ? 'عملیات' : 'Actions'}</th>
                    </tr>
                  </thead>
                  <tbody className={`divide-y ${isLightMode ? 'divide-slate-200' : 'divide-white/5'}`}>
                    {vpnProxyUsers.map((u, idx) => (
                      <tr key={idx} className={isLightMode ? 'hover:bg-slate-50' : 'hover:bg-white/5'}>
                        <td className={`p-3 font-bold ${isLightMode ? 'text-slate-900' : 'text-white'}`}>{u.username}</td>
                        <td className="p-3 font-mono text-cyan-600 dark:text-cyan-300">{u.password}</td>
                        <td className="p-3">
                          <div className="flex flex-wrap gap-1">
                            {u.protocols?.map((p: string, pIdx: number) => (
                              <span key={pIdx} className="px-1.5 py-0.5 rounded bg-indigo-500/20 text-indigo-700 dark:text-indigo-300 text-[10px] uppercase font-mono">
                                {p}
                              </span>
                            ))}
                          </div>
                        </td>
                        <td className={`p-3 font-mono ${isLightMode ? 'text-slate-600' : 'text-slate-400'}`}>{u.assignedIp || 'Dynamic'}</td>
                        <td className="p-3 font-mono text-amber-600 dark:text-amber-400">{u.usage || '0 B'}</td>
                        <td className="p-3 text-center">
                          <button
                            onClick={() => handleDeleteVpnUser(u.id)}
                            className="px-2.5 py-1 rounded-lg bg-rose-500/20 hover:bg-rose-500/30 text-rose-600 dark:text-rose-300 border border-rose-500/30 text-[11px] font-bold transition-all cursor-pointer"
                          >
                            {isRtl ? 'حذف' : 'Delete'}
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* MODAL: WINDOWS-LIKE VPN CONNECTION CREATOR */}
            {showConnModal && (
              <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md animate-fadeIn">
                <div className={`max-w-xl w-full rounded-3xl p-6 border shadow-2xl space-y-5 transition-all ${
                  isLightMode ? 'bg-white border-slate-300 text-slate-800 shadow-2xl' : 'bg-slate-950 border-cyan-500/30 text-white shadow-2xl'
                }`}>
                  {/* Modal Header */}
                  <div className={`flex items-center justify-between pb-4 border-b ${
                    isLightMode ? 'border-slate-200' : 'border-white/10'
                  }`}>
                    <div className="flex items-center gap-3">
                      <div className="p-2.5 rounded-2xl bg-cyan-500/20 text-cyan-500 border border-cyan-500/30">
                        <Network className="w-6 h-6" />
                      </div>
                      <div>
                        <h3 className="text-base font-bold">
                          {connForm.id ? (isRtl ? 'ویرایش کانکشن VPN' : 'Edit VPN Connection') : (isRtl ? 'ایجاد کانکشن VPN جدید (Windows-Like)' : 'New Windows-Like VPN Profile')}
                        </h3>
                        <p className={`text-xs ${isLightMode ? 'text-slate-500' : 'text-slate-400'}`}>
                          {isRtl ? 'پیکربندی مشخصات اتصال به سرور مقصد مشابه کانکشن‌های ویندوز' : 'Specify destination host, protocol, and login credentials'}
                        </p>
                      </div>
                    </div>
                    <button onClick={() => setShowConnModal(false)} className="text-slate-400 hover:text-slate-700 dark:hover:text-white">
                      <XCircle className="w-5 h-5" />
                    </button>
                  </div>

                  {/* Modal Form */}
                  <form onSubmit={handleSaveConnProfile} className="space-y-4">
                    <div>
                      <label className={`block text-xs font-semibold mb-1 ${isLightMode ? 'text-slate-700' : 'text-slate-300'}`}>
                        {isRtl ? 'نام کانکشن / عنوان:' : 'Connection Name:'}
                      </label>
                      <input
                        type="text"
                        value={connForm.name}
                        onChange={(e) => setConnForm({ ...connForm, name: e.target.value })}
                        placeholder="e.g. Windows SSTP Gateway 1"
                        required
                        className={`w-full rounded-xl px-3.5 py-2.5 text-xs outline-none transition-colors ${
                          isLightMode ? 'bg-slate-50 border border-slate-300 text-slate-900 focus:border-cyan-600 focus:bg-white' : 'bg-slate-900 border border-white/10 text-white focus:border-cyan-500/50'
                        }`}
                      />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className={`block text-xs font-semibold mb-1 ${isLightMode ? 'text-slate-700' : 'text-slate-300'}`}>
                          {isRtl ? 'پروتکل ارتباطی:' : 'Protocol:'}
                        </label>
                        <select
                          value={connForm.protocol}
                          onChange={(e) => {
                            const p = e.target.value;
                            const defPort = p === 'sstp' ? 443 : p === 'wireguard' ? 51820 : p === 'openvpn' ? 1194 : p === 'l2tp' ? 1701 : p === 'pptp' ? 1723 : p === 'socks5' ? 1080 : 443;
                            setConnForm({ ...connForm, protocol: p, port: defPort });
                          }}
                          className={`w-full rounded-xl px-3.5 py-2.5 text-xs outline-none transition-colors ${
                            isLightMode ? 'bg-slate-50 border border-slate-300 text-slate-900 focus:border-cyan-600' : 'bg-slate-900 border border-white/10 text-white focus:border-cyan-500/50'
                          }`}
                        >
                          <option value="wireguard">WireGuard VPN</option>
                          <option value="openvpn">OpenVPN Client</option>
                          <option value="tailscale">Tailscale Mesh VPN</option>
                          <option value="zerotier">ZeroTier One Client</option>
                          <option value="openconnect">OpenConnect (Cisco AnyConnect)</option>
                          <option value="strongswan">StrongSwan (IPsec / IKEv2)</option>
                          <option value="softether">SoftEther VPN Client</option>
                          <option value="sstp">SSTP (SSL VPN - Windows Compatible)</option>
                          <option value="l2tp">L2TP / IPsec (With Pre-Shared Key)</option>
                          <option value="pptp">PPTP VPN</option>
                          <option value="socks5">SOCKS5 Proxy</option>
                          <option value="httpProxy">HTTP / HTTPS Proxy</option>
                        </select>
                      </div>

                      <div>
                        <label className={`block text-xs font-semibold mb-1 ${isLightMode ? 'text-slate-700' : 'text-slate-300'}`}>
                          {isRtl ? 'پورت سرور:' : 'Server Port:'}
                        </label>
                        <input
                          type="number"
                          value={connForm.port}
                          onChange={(e) => setConnForm({ ...connForm, port: e.target.value })}
                          required
                          className={`w-full rounded-xl px-3.5 py-2.5 text-xs font-mono outline-none transition-colors ${
                            isLightMode ? 'bg-slate-50 border border-slate-300 text-slate-900 focus:border-cyan-600' : 'bg-slate-900 border border-white/10 text-white focus:border-cyan-500/50'
                          }`}
                        />
                      </div>
                    </div>

                    <div>
                      <label className={`block text-xs font-semibold mb-1 ${isLightMode ? 'text-slate-700' : 'text-slate-300'}`}>
                        {isRtl ? 'آدرس سرور مقصد (Domain or IP):' : 'Destination Server Host / IP:'}
                      </label>
                      <input
                        type="text"
                        value={connForm.serverHost}
                        onChange={(e) => setConnForm({ ...connForm, serverHost: e.target.value })}
                        placeholder="185.220.101.5 or vpn.mydomain.com"
                        required
                        className={`w-full rounded-xl px-3.5 py-2.5 text-xs font-mono outline-none transition-colors ${
                          isLightMode ? 'bg-slate-50 border border-slate-300 text-slate-900 focus:border-cyan-600 focus:bg-white' : 'bg-slate-900 border border-white/10 text-white focus:border-cyan-500/50'
                        }`}
                      />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className={`block text-xs font-semibold mb-1 ${isLightMode ? 'text-slate-700' : 'text-slate-300'}`}>
                          {isRtl ? 'نام کاربری (Username):' : 'Username:'}
                        </label>
                        <input
                          type="text"
                          value={connForm.username}
                          onChange={(e) => setConnForm({ ...connForm, username: e.target.value })}
                          placeholder="vpn_user_1"
                          required
                          className={`w-full rounded-xl px-3.5 py-2.5 text-xs outline-none transition-colors ${
                            isLightMode ? 'bg-slate-50 border border-slate-300 text-slate-900 focus:border-cyan-600' : 'bg-slate-900 border border-white/10 text-white focus:border-cyan-500/50'
                          }`}
                        />
                      </div>

                      <div>
                        <label className={`block text-xs font-semibold mb-1 ${isLightMode ? 'text-slate-700' : 'text-slate-300'}`}>
                          {isRtl ? 'کلمه عبور (Password):' : 'Password:'}
                        </label>
                        <div className="relative">
                          <input
                            type={showModalPassword ? "text" : "password"}
                            value={connForm.password}
                            onChange={(e) => setConnForm({ ...connForm, password: e.target.value })}
                            placeholder="Secret Password"
                            required
                            className={`w-full rounded-xl px-3.5 py-2.5 text-xs outline-none transition-colors ${
                              isLightMode ? 'bg-slate-50 border border-slate-300 text-slate-900 focus:border-cyan-600' : 'bg-slate-900 border border-white/10 text-white focus:border-cyan-500/50'
                            }`}
                          />
                          <button
                            type="button"
                            onClick={() => setShowModalPassword(!showModalPassword)}
                            className="absolute top-1/2 -translate-y-1/2 left-3 rtl:right-auto rtl:left-3 text-slate-400 hover:text-slate-700 dark:hover:text-white"
                          >
                            {showModalPassword ? <Eye className="w-4 h-4 text-cyan-500" /> : <Eye className="w-4 h-4" />}
                          </button>
                        </div>
                      </div>
                    </div>

                    {connForm.protocol === 'l2tp' && (
                      <div>
                        <label className={`block text-xs font-semibold mb-1 ${isLightMode ? 'text-slate-700' : 'text-slate-300'}`}>
                          {isRtl ? 'کلید اشتراکی IPsec Pre-Shared Key (PSK):' : 'IPsec Pre-Shared Key (PSK):'}
                        </label>
                        <input
                          type="text"
                          value={connForm.presharedKey}
                          onChange={(e) => setConnForm({ ...connForm, presharedKey: e.target.value })}
                          placeholder="e.g. MatrixPsk2026!"
                          className={`w-full rounded-xl px-3.5 py-2.5 text-xs font-mono outline-none transition-colors ${
                            isLightMode ? 'bg-slate-50 border border-slate-300 text-slate-900 focus:border-indigo-600' : 'bg-slate-900 border border-white/10 text-white focus:border-indigo-500/50'
                          }`}
                        />
                      </div>
                    )}

                    {/* SSTP SSL Certification Requirement Bypass checkbox (Like Windows) */}
                    {connForm.protocol === 'sstp' && (
                      <div className={`p-3 rounded-2xl border flex items-center justify-between transition-colors ${
                        isLightMode ? 'bg-cyan-50/80 border-cyan-200' : 'bg-cyan-950/30 border-cyan-500/30'
                      }`}>
                        <div className="space-y-0.5">
                          <label htmlFor="ignoreCertErrors" className={`text-xs font-bold flex items-center gap-1.5 cursor-pointer ${
                            isLightMode ? 'text-cyan-900' : 'text-cyan-200'
                          }`}>
                            <ShieldCheck className="w-4 h-4 text-cyan-600" />
                            <span>{isRtl ? 'عدم نیاز به گواهی SSL (SSTP Certificate Bypass - مشابه ویندوز)' : 'Windows SSTP Certificate Bypass'}</span>
                          </label>
                          <p className={`text-[11px] ${isLightMode ? 'text-cyan-800' : 'text-slate-400'}`}>
                            {isRtl 
                              ? 'نیازی به اپلود یا وارد کردن فایل SSL Certificate نیست؛ متصل شدن صرفاً با نام کاربری و رمز انجام می‌شود.' 
                              : 'Connects directly with username and password without forcing manual SSL certificate installation.'}
                          </p>
                        </div>
                        <input
                          type="checkbox"
                          id="ignoreCertErrors"
                          checked={connForm.ignoreCertErrors}
                          onChange={(e) => setConnForm({ ...connForm, ignoreCertErrors: e.target.checked })}
                          className="w-4 h-4 rounded text-cyan-600 focus:ring-cyan-500 cursor-pointer"
                        />
                      </div>
                    )}

                    <div className="flex items-center gap-2 pt-2">
                      <input
                        type="checkbox"
                        id="autoConnect"
                        checked={connForm.autoConnect}
                        onChange={(e) => setConnForm({ ...connForm, autoConnect: e.target.checked })}
                        className="w-4 h-4 rounded text-cyan-600 focus:ring-cyan-500 cursor-pointer"
                      />
                      <label htmlFor="autoConnect" className={`text-xs font-medium cursor-pointer ${isLightMode ? 'text-slate-700' : 'text-slate-300'}`}>
                        {isRtl ? 'اتصال خودکار هنگام بوت شدن پنل' : 'Auto-connect when panel boots'}
                      </label>
                    </div>

                    <div className={`flex items-center justify-end gap-3 pt-4 border-t ${isLightMode ? 'border-slate-200' : 'border-white/10'}`}>
                      <button
                        type="button"
                        onClick={() => setShowConnModal(false)}
                        className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                          isLightMode ? 'bg-slate-100 hover:bg-slate-200 text-slate-700' : 'bg-white/5 hover:bg-white/10 text-slate-300'
                        }`}
                      >
                        {isRtl ? 'انصراف' : 'Cancel'}
                      </button>
                      <button
                        type="submit"
                        className="px-5 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-bold shadow-lg shadow-cyan-500/20 transition-all flex items-center gap-2 cursor-pointer"
                      >
                        <Save className="w-4 h-4" />
                        <span>{isRtl ? 'ذخیره کانکشن' : 'Save Profile'}</span>
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            )}

            {/* PACKAGE LOGS MODAL */}
            {showPkgLogModal && (
              <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md animate-fadeIn">
                <div className={`max-w-2xl w-full border rounded-3xl p-6 shadow-2xl space-y-4 ${
                  isLightMode ? 'bg-white border-slate-300 text-slate-800' : 'bg-slate-950 border-purple-500/30 text-white'
                }`}>
                  <div className={`flex items-center justify-between pb-3 border-b ${
                    isLightMode ? 'border-slate-200' : 'border-white/10'
                  }`}>
                    <h3 className="text-base font-bold flex items-center gap-2">
                      <Terminal className="w-5 h-5 text-purple-500" />
                      <span>{pkgLogTitle || (isRtl ? 'خروجی سیستم و لاگ سرویس' : 'System & Service Logs')}</span>
                    </h3>
                    <button onClick={() => setShowPkgLogModal(false)} className="text-slate-400 hover:text-slate-700 dark:hover:text-white">✕</button>
                  </div>

                  <div className="bg-slate-950 p-4 rounded-2xl border border-white/10 font-mono text-xs text-purple-300 max-h-96 overflow-y-auto space-y-1 whitespace-pre-wrap dir-ltr text-left">
                    {pkgLogContent || 'No output recorded.'}
                  </div>

                  <div className="flex justify-end pt-2">
                    <button
                      onClick={() => setShowPkgLogModal(false)}
                      className={`px-5 py-2 rounded-xl text-xs font-bold cursor-pointer ${
                        isLightMode ? 'bg-slate-100 hover:bg-slate-200 text-slate-800' : 'bg-white/10 hover:bg-white/20 text-white'
                      }`}
                    >
                      {isRtl ? 'بستن' : 'Close'}
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* IMPORT CONFIG FILE MODAL */}
            {showImportConfigModal && (
              <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md animate-fadeIn">
                <div className={`max-w-lg w-full rounded-3xl p-6 border shadow-2xl space-y-5 ${
                  isLightMode ? 'bg-white border-slate-300 text-slate-800' : 'bg-slate-950 border-purple-500/30 text-white'
                }`}>
                  <div className={`flex items-center justify-between pb-4 border-b ${
                    isLightMode ? 'border-slate-200' : 'border-white/10'
                  }`}>
                    <div className="flex items-center gap-3">
                      <div className="p-2.5 rounded-2xl bg-purple-500/20 text-purple-400 border border-purple-500/30">
                        <Download className="w-6 h-6" />
                      </div>
                      <div>
                        <h3 className="text-base font-bold">
                          {isRtl ? 'وارد کردن کانفیگ VPN' : 'Import VPN Configuration File'}
                        </h3>
                        <p className={`text-xs ${isLightMode ? 'text-slate-500' : 'text-slate-400'}`}>
                          {isRtl ? 'بارگذاری یا چسباندن محتوای کانفیگ WireGuard (.conf) یا OpenVPN (.ovpn)' : 'Upload or paste WireGuard (.conf) or OpenVPN (.ovpn) text'}
                        </p>
                      </div>
                    </div>
                    <button onClick={() => setShowImportConfigModal(false)} className="text-slate-400 hover:text-slate-700 dark:hover:text-white">✕</button>
                  </div>

                  <form onSubmit={handleImportConfigSubmit} className="space-y-4">
                    <div>
                      <label className={`block text-xs font-semibold mb-1 ${isLightMode ? 'text-slate-700' : 'text-slate-300'}`}>
                        {isRtl ? 'نام پروفایل:' : 'Profile Name:'}
                      </label>
                      <input
                        type="text"
                        value={importConfigName}
                        onChange={(e) => setImportConfigName(e.target.value)}
                        placeholder="e.g. My Germany WireGuard Peer"
                        required
                        className={`w-full rounded-xl px-3.5 py-2.5 text-xs outline-none transition-colors ${
                          isLightMode ? 'bg-slate-50 border border-slate-300 text-slate-900 focus:border-purple-600' : 'bg-slate-900 border border-white/10 text-white focus:border-purple-500/50'
                        }`}
                      />
                    </div>

                    <div>
                      <label className={`block text-xs font-semibold mb-1 ${isLightMode ? 'text-slate-700' : 'text-slate-300'}`}>
                        {isRtl ? 'آپلود فایل کانفیگ:' : 'Upload .conf / .ovpn file:'}
                      </label>
                      <input
                        type="file"
                        accept=".conf,.ovpn,.txt"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) {
                            if (!importConfigName) setImportConfigName(file.name.replace(/\.[^/.]+$/, ""));
                            const reader = new FileReader();
                            reader.onload = (evt) => {
                              if (evt.target?.result) {
                                setImportConfigText(evt.target.result as string);
                              }
                            };
                            reader.readAsText(file);
                          }
                        }}
                        className="text-xs text-slate-400 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-purple-600 file:text-white hover:file:bg-purple-500 cursor-pointer"
                      />
                    </div>

                    <div>
                      <label className={`block text-xs font-semibold mb-1 ${isLightMode ? 'text-slate-700' : 'text-slate-300'}`}>
                        {isRtl ? 'یا چسباندن کد کانفیگ:' : 'Or paste Raw Config Content:'}
                      </label>
                      <textarea
                        rows={6}
                        value={importConfigText}
                        onChange={(e) => setImportConfigText(e.target.value)}
                        placeholder="[Interface]&#10;PrivateKey = ...&#10;Address = ...&#10;[Peer]&#10;PublicKey = ...&#10;Endpoint = ..."
                        required
                        className={`w-full rounded-xl p-3 text-xs font-mono outline-none transition-colors dir-ltr text-left ${
                          isLightMode ? 'bg-slate-50 border border-slate-300 text-slate-900 focus:border-purple-600' : 'bg-slate-900 border border-white/10 text-white focus:border-purple-500/50'
                        }`}
                      />
                    </div>

                    <div className="flex justify-end gap-2 pt-2">
                      <button
                        type="button"
                        onClick={() => setShowImportConfigModal(false)}
                        className={`px-4 py-2 rounded-xl text-xs font-semibold cursor-pointer ${
                          isLightMode ? 'bg-slate-100 text-slate-700 hover:bg-slate-200' : 'bg-white/10 text-slate-300 hover:bg-white/20'
                        }`}
                      >
                        {isRtl ? 'انصراف' : 'Cancel'}
                      </button>
                      <button
                        type="submit"
                        disabled={isImportingConfig}
                        className="px-5 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold transition-all shadow-md flex items-center gap-2 cursor-pointer disabled:opacity-50"
                      >
                        {isImportingConfig ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                        <span>{isRtl ? 'ذخیره و وارد کردن' : 'Import Config'}</span>
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            )}
          </div>
        )}

        {/* PASSWORD CHANGE MODAL */}
        {changePasswordUser && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-900/60 backdrop-blur-md animate-fadeIn">
            <div 
              className={`max-w-md w-full rounded-3xl p-6 border shadow-2xl space-y-5 transition-all ${
                isLightMode 
                  ? 'bg-white border-amber-200 text-slate-800 shadow-amber-500/10' 
                  : 'bg-slate-950 border-amber-500/30 text-white shadow-amber-900/40'
              }`} 
              dir={isRtl ? "rtl" : "ltr"}
            >
              {/* Header */}
              <div className={`flex items-center justify-between pb-4 border-b ${isLightMode ? 'border-slate-200' : 'border-white/10'}`}>
                <div className="flex items-center gap-3">
                  <div className={`p-2.5 rounded-2xl border ${isLightMode ? 'bg-amber-50 border-amber-200 text-amber-600' : 'bg-amber-500/20 border-amber-500/30 text-amber-400'}`}>
                    <Key className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold">
                      {isRtl ? `تغییر کلمه عبور کاربر @${changePasswordUser.username}` : `Change Password for @${changePasswordUser.username}`}
                    </h3>
                    <p className="text-xs text-slate-400">{changePasswordUser.email}</p>
                  </div>
                </div>
                <button 
                  onClick={() => setChangePasswordUser(null)}
                  className="p-1.5 rounded-xl hover:bg-white/10 text-slate-400 hover:text-white transition-colors"
                >
                  <XCircle className="w-5 h-5" />
                </button>
              </div>

              {/* Form Body */}
              <div className="space-y-4">
                <div className="space-y-1.5">
                  <label className="block text-xs font-semibold text-slate-300">
                    {isRtl ? 'کلمه عبور جدید:' : 'New Password:'}
                  </label>
                  <div className="relative">
                    <input
                      type={showPasswordText ? "text" : "password"}
                      value={newPasswordInput}
                      onChange={(e) => setNewPasswordInput(e.target.value)}
                      placeholder={isRtl ? 'حداقل ۴ کاراکتر...' : 'Min 4 characters...'}
                      className={`w-full bg-black/40 border border-white/10 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-amber-500/50 ${isRtl ? 'pl-10' : 'pr-10'}`}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPasswordText(!showPasswordText)}
                      className={`absolute top-1/2 -translate-y-1/2 text-slate-400 hover:text-white text-xs font-bold ${isRtl ? 'left-3' : 'right-3'}`}
                    >
                      {showPasswordText ? (isRtl ? 'مخفی' : 'Hide') : (isRtl ? 'نمایش' : 'Show')}
                    </button>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="block text-xs font-semibold text-slate-300">
                    {isRtl ? 'تکرار کلمه عبور جدید:' : 'Confirm New Password:'}
                  </label>
                  <input
                    type={showPasswordText ? "text" : "password"}
                    value={confirmPasswordInput}
                    onChange={(e) => setConfirmPasswordInput(e.target.value)}
                    placeholder={isRtl ? 'تکرار پسورد فوق...' : 'Repeat password above...'}
                    className="w-full bg-black/40 border border-white/10 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-amber-500/50"
                  />
                </div>

                <button
                  type="button"
                  onClick={handleGenerateRandomPassword}
                  className="w-full py-2 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/20 text-amber-300 text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  <RefreshCw className="w-3.5 h-3.5 text-amber-400" />
                  <span>{isRtl ? 'تولید کلمه عبور تصادفی قوی' : 'Generate Strong Random Password'}</span>
                </button>
              </div>

              {/* Actions */}
              <div className={`flex items-center justify-end gap-3 pt-4 border-t ${isLightMode ? 'border-slate-200' : 'border-white/10'} ${isRtl ? 'flex-row-reverse' : ''}`}>
                <button
                  type="button"
                  onClick={() => setChangePasswordUser(null)}
                  className="px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 text-xs font-bold transition-all cursor-pointer"
                >
                  {isRtl ? 'انصراف' : 'Cancel'}
                </button>
                <button
                  type="button"
                  onClick={handleSavePassword}
                  disabled={isSavingPassword || !newPasswordInput}
                  className="px-5 py-2 rounded-xl bg-amber-600 hover:bg-amber-500 disabled:opacity-50 text-white text-xs font-bold shadow-lg shadow-amber-500/20 transition-all flex items-center gap-2 cursor-pointer"
                >
                  {isSavingPassword ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                  <span>{isRtl ? 'ذخیره کلمه عبور جدید' : 'Save New Password'}</span>
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
