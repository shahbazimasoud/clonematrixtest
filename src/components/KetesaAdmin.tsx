/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Users, 
  Trash2, 
  Plus, 
  Search, 
  MessageSquare, 
  Key, 
  Calendar, 
  Layers, 
  Globe, 
  RefreshCw, 
  UserMinus, 
  UserPlus, 
  HardDrive, 
  Filter, 
  Edit,
  ShieldAlert,
  FolderSync,
  X,
  Check,
  Ban,
  Server,
  CheckCircle,
  AlertCircle,
  Hash,
  Sliders,
  Sparkles,
  Shield,
  Mail,
  Phone,
  Laptop,
  History,
  FileText,
  Lock,
  Unlock,
  UserCheck,
  ToggleLeft,
  Activity,
  HardDriveUpload,
  Zap,
  Network,
  Cpu,
  Settings,
  Download,
  Save,
  MoreVertical,
  Image as ImageIcon,
  Video,
  Music,
  Archive,
  FileSpreadsheet,
  FileCode,
  File
} from 'lucide-react';
import { MatrixUser, MatrixRoom, MatrixMedia, RegistrationToken, UserRole } from '../types';

interface KetesaAdminProps {
  lang: 'fa' | 'en' | 'es' | 'ar' | 'de' | 'ru';
  authToken: string | null;
  currentUser: { role: UserRole; username: string } | null;
  showToast: (type: 'success' | 'error', text: string) => void;
  isLightMode?: boolean;
  activeConnectionId?: string;
  onExecuteCommand?: (command: string, args?: any) => void;
  isExecuting?: boolean;
  logs?: string[];
  initialTab?: 'users' | 'rooms' | 'media' | 'tokens' | 'installer';
}

const faTranslations = {
  tabUsers: "مدیریت کاربران",
  tabRooms: "مدیریت اتاق‌ها",
  tabMedia: "پاکسازی رسانه (Media Cache)",
  tabTokens: "توکن‌های ثبت‌نام",
  tabInstaller: "نصب و مدیریت پشته",
  tabUpdates: "بروزرسانی پنل",
  
  // Users
  searchUsers: "جستجوی کاربر (MXID)...",
  allUsers: "همه کاربران",
  adminUsers: "مدیران",
  activeUsers: "فعال",
  deactivatedUsers: "غیرفعال",
  lockedUsers: "قفل شده",
  suspendedUsers: "معلق",
  shadowBannedUsers: "مسدود سایه",
  addUserBtn: "ثبت‌نام کاربر جدید",
  username: "نام کاربری",
  mxidLabel: "شناسه ماتریکس (MXID)",
  displayNameLabel: "نام نمایشی",
  passwordLabel: "رمز عبور",
  makeAdminLabel: "دسترسی مدیریت سرور (Synapse Admin)",
  userRoleNormal: "کاربر عادی",
  userRoleAdmin: "مدیر سرور",
  userStatusActive: "فعال",
  userStatusDeactivated: "غیرفعال",
  deactivateBtn: "غیرفعال‌سازی",
  reactivateBtn: "فعال‌سازی و بازنشانی رمز",
  resetPasswordTitle: "رمز عبور جدید",
  
  // Rooms
  searchRooms: "جستجوی اتاق (نام، شناسه، مستعار)...",
  allRooms: "همه اتاق‌ها",
  publicRooms: "عمومی",
  privateRooms: "خصوصی",
  federatedRooms: "فدریتد (خارجی)",
  localRooms: "داخلی",
  createRoomBtn: "ایجاد اتاق جدید",
  roomNameLabel: "نام اتاق",
  roomAliasLabel: "آدرس مستعار (Alias)",
  roomTopicLabel: "موضوع / Topic",
  roomVisibilityLabel: "قابل رویت در دایرکتوری عمومی",
  roomFederationLabel: "اجازه ارتباط با سرورهای خارجی (Federation)",
  roomCreator: "ایجاد کننده",
  roomMembers: "اعضا",
  roomVersion: "نسخه اتاق",
  kickBtn: "اخراج کاربر",
  shutdownRoomBtn: "غیرفعال‌سازی و حذف اتاق",
  purgeRoomLabel: "پاکسازی کامل از دیتابیس (Purge)",
  sendMessageLabel: "ارسال پیام خداحافظی به اعضا قبل از حذف",
  sendMessagePlaceholder: "این اتاق به دلیل عدم رعایت قوانین سرور مسدود گردید.",
  leaveRoomLabel: "خروج تمامی اعضا از اتاق (Leave)",
  addPrivilegedUserBtn: "افزودن کاربر ویژه",
  addMemberBtn: "افزودن عضو جدید",
  addPrivilegedUserTitle: "ارتقای سطح دسترسی کاربر ویژه",
  addMemberTitle: "افزودن عضو جدید به اتاق",
  powerLevelLabel: "سطح دسترسی (Power Level)",
  adminPower: "مدیر کامل (سطح ۱۰۰)",
  modPower: "ناظر (سطح ۵۰)",
  customPower: "سفارشی",
  addBtn: "افزودن",
  
  // Media
  mediaStatsTitle: "آمار ذخیره‌سازی رسانه‌های ماتریکس",
  totalFiles: "تعداد کل فایل‌ها",
  remoteCacheSize: "حجم فایل‌های کش خارج",
  localFilesSize: "حجم رسانه‌های محلی",
  cleanupCacheBtn: "پاکسازی کش فایل‌های خارجی",
  cleanupAgeBtn: "حذف رسانه‌های قدیمی‌تر از",
  cleanupAgeDays: "روز",
  cleanupDomainBtn: "پاکسازی رسانه‌های دامنه خاص",
  domainPlaceholder: "مثلا matrix.org",
  mediaTableTitle: "فایل‌های رسانه‌ای ذخیره شده",
  searchMedia: "جستجوی فایل یا بارگذاری‌کننده...",
  fileName: "نام فایل",
  fileSize: "حجم",
  uploadedBy: "بارگذاری شده توسط",
  uploadedAt: "تاریخ بارگذاری",
  fileType: "نوع فایل",
  origin: "منشا",
  originLocal: "محلی",
  originRemote: "کش خارجی",
  purgeFileBtn: "حذف دائم فایل",
  
  // Tokens
  tokensTitle: "توکن‌های ثبت‌نام فعال و اختصاصی",
  tokensSubtitle: "استفاده از توکن، محدودیت‌های ثبت‌نام پیش‌فرض را لغو کرده و اجازه ثبت‌نام اختصاصی را می‌دهد.",
  createTokenBtn: "ایجاد توکن ثبت‌نام جدید",
  tokenStringLabel: "کد توکن (اختیاری - خالی برای تولید خودکار)",
  usesAllowedLabel: "تعداد دفعات مجاز استفاده (خالی برای نامحدود)",
  expiryLabel: "تاریخ انقضا (خالی برای بدون انقضا)",
  tokenLabel: "توکن",
  usesAllowed: "مجاز",
  usesCount: "استفاده شده",
  expiryTime: "تاریخ انقضا",
  tokenStatus: "وضعیت",
  revokeBtn: "ابطال توکن",
  unlimited: "نامحدود",
  neverExpired: "بدون انقضا",
  active: "فعال",
  expired: "منقضی شده / پر شده",
  
  // General Buttons & Alerts
  unauthorizedMsg: "دسترسی رد شد: نقش شما به عنوان 'مشاهده‌گر' اجازه مدیریت ماتریکس را نمی‌دهد.",
  loading: "در حال بارگذاری اطلاعات...",
  save: "ذخیره تغییرات",
  cancel: "انصراف",
  delete: "حذف",
  successAction: "عملیات با موفقیت در هسته ماتریکس ثبت گردید.",
  errorAction: "خطا در برقراری ارتباط با هسته Synapse.",
  viewMembers: "مشاهده اعضا",
  memberList: "لیست اعضای اتاق",
  powerLevel: "سطح دسترسی (Power Level)",
  syncUsersBtn: "همگام‌سازی کاربران",
  syncingUsers: "در حال همگام‌سازی کاربران با سرور...",
  syncSuccess: "کاربران ماتریکس با موفقیت همگام‌سازی شدند."
};

const enTranslations = {
  tabUsers: "User Management",
  tabRooms: "Room Management",
  tabMedia: "Media Cache Cleanup",
  tabTokens: "Registration Tokens",
  tabInstaller: "Stack Installer & Manager",
  tabUpdates: "Panel Updates",
  
  // Users
  searchUsers: "Search users by MXID...",
  allUsers: "All Users",
  adminUsers: "Synapse Admins",
  activeUsers: "Active",
  deactivatedUsers: "Deactivated",
  lockedUsers: "Locked",
  suspendedUsers: "Suspended",
  shadowBannedUsers: "Shadow Banned",
  addUserBtn: "Register New User",
  username: "Username",
  mxidLabel: "Matrix ID (MXID)",
  displayNameLabel: "Display Name",
  passwordLabel: "Password",
  makeAdminLabel: "Server Administrator Access (Synapse Admin)",
  userRoleNormal: "Normal User",
  userRoleAdmin: "Server Admin",
  userStatusActive: "Active",
  userStatusDeactivated: "Deactivated",
  deactivateBtn: "Deactivate",
  reactivateBtn: "Reactivate & Reset",
  resetPasswordTitle: "New Password",
  
  // Rooms
  searchRooms: "Search rooms (Name, ID, Alias)...",
  allRooms: "All Rooms",
  publicRooms: "Public",
  privateRooms: "Private",
  federatedRooms: "Federated",
  localRooms: "Local",
  createRoomBtn: "Create New Room",
  roomNameLabel: "Room Name",
  roomAliasLabel: "Room Alias",
  roomTopicLabel: "Room Topic",
  roomVisibilityLabel: "List in server public directory",
  roomFederationLabel: "Allow federation with external servers",
  roomCreator: "Creator",
  roomMembers: "Members",
  roomVersion: "Room Version",
  kickBtn: "Kick User",
  shutdownRoomBtn: "Shutdown & Delete Room",
  purgeRoomLabel: "Permanently purge from server DB",
  sendMessageLabel: "Send farewell block message to room members first",
  sendMessagePlaceholder: "This room has been shut down due to violation of server policy.",
  leaveRoomLabel: "Force all members to leave / kick them first (Leave)",
  addPrivilegedUserBtn: "Add Privileged User",
  addMemberBtn: "Add Member",
  addPrivilegedUserTitle: "Assign Privileged Power Level",
  addMemberTitle: "Add New Member to Room",
  powerLevelLabel: "Power Level",
  adminPower: "Administrator (Level 100)",
  modPower: "Moderator (Level 50)",
  customPower: "Custom Power Level",
  addBtn: "Add",
  
  // Media
  mediaStatsTitle: "Matrix Media Storage Analytics",
  totalFiles: "Total File Count",
  remoteCacheSize: "Remote Cached Size",
  localFilesSize: "Local Files Size",
  cleanupCacheBtn: "Purge Remote Cached Media",
  cleanupAgeBtn: "Purge Media Older Than",
  cleanupAgeDays: "days",
  cleanupDomainBtn: "Purge Media of Specific Domain",
  domainPlaceholder: "e.g. matrix.org",
  mediaTableTitle: "Stored Media Files",
  searchMedia: "Search media by name or uploader...",
  fileName: "File Name",
  fileSize: "Size",
  uploadedBy: "Uploaded By",
  uploadedAt: "Uploaded At",
  fileType: "MIME Type",
  origin: "Origin",
  originLocal: "Local Media",
  originRemote: "Remote Cache",
  purgeFileBtn: "Purge File",
  
  // Tokens
  tokensTitle: "Active Registration Tokens",
  tokensSubtitle: "Tokens allow controlled registration bypass matching pre-defined scopes and constraints.",
  createTokenBtn: "Generate Registration Token",
  tokenStringLabel: "Token String (Optional - leave blank for auto-generate)",
  usesAllowedLabel: "Max Uses (Leave blank for unlimited)",
  expiryLabel: "Expiry Date (Leave blank for no expiry)",
  tokenLabel: "Token",
  usesAllowed: "Allowed Uses",
  usesCount: "Uses Count",
  expiryTime: "Expiry Time",
  tokenStatus: "Status",
  revokeBtn: "Revoke Token",
  unlimited: "Unlimited",
  neverExpired: "Never Expired",
  active: "Active",
  expired: "Expired / Full",
  
  // General Buttons & Alerts
  unauthorizedMsg: "Access Denied: Your panel role as 'Viewer' does not permit Matrix server write access.",
  loading: "Syncing Matrix engine...",
  save: "Save Changes",
  cancel: "Cancel",
  delete: "Delete",
  successAction: "Operation completed successfully on homeserver core.",
  errorAction: "Failed to communicate with Synapse homeserver.",
  viewMembers: "View Members",
  memberList: "Room Members List",
  powerLevel: "Power Level",
  syncUsersBtn: "Sync Users",
  syncingUsers: "Syncing users with server...",
  syncSuccess: "Users synced successfully with homeserver."
};

const esTranslations = {
  tabUsers: "Gestión de Usuarios",
  tabRooms: "Gestión de Salas",
  tabMedia: "Limpieza de Caché de Medios",
  tabTokens: "Tokens de Registro",
  tabInstaller: "Instalador y Gestor de Pila",
  tabUpdates: "Actualizaciones del Panel",
  
  // Users
  searchUsers: "Buscar usuarios por MXID...",
  allUsers: "Todos los usuarios",
  adminUsers: "Administradores de Synapse",
  activeUsers: "Activos",
  deactivatedUsers: "Desactivados",
  lockedUsers: "Bloqueados",
  suspendedUsers: "Suspendidos",
  shadowBannedUsers: "Baneados en la Sombra",
  addUserBtn: "Registrar Nuevo Usuario",
  username: "Nombre de usuario",
  mxidLabel: "ID de Matrix (MXID)",
  displayNameLabel: "Nombre para Mostrar",
  passwordLabel: "Contraseña",
  makeAdminLabel: "Acceso de Administrador de Servidor (Synapse Admin)",
  userRoleNormal: "Usuario Normal",
  userRoleAdmin: "Administrador de Servidor",
  userStatusActive: "Activo",
  userStatusDeactivated: "Desactivado",
  deactivateBtn: "Desactivar",
  reactivateBtn: "Reactivar y Restablecer",
  resetPasswordTitle: "Nueva Contraseña",
  
  // Rooms
  searchRooms: "Buscar salas (Nombre, ID, Alias)...",
  allRooms: "Todas las salas",
  publicRooms: "Públicas",
  privateRooms: "Privadas",
  federatedRooms: "Federadas",
  localRooms: "Locales",
  createRoomBtn: "Crear Nueva Sala",
  roomNameLabel: "Nombre de la Sala",
  roomAliasLabel: "Alias de la Sala",
  roomTopicLabel: "Tema de la Sala",
  roomVisibilityLabel: "Listar en el directorio público del servidor",
  roomFederationLabel: "Permitir federación con servidores externos",
  roomCreator: "Creador",
  roomMembers: "Miembros",
  roomVersion: "Versión de la Sala",
  kickBtn: "Expulsar Usuario",
  shutdownRoomBtn: "Cerrar y Eliminar Sala",
  purgeRoomLabel: "Purgar permanentemente de la Base de Datos del servidor",
  sendMessageLabel: "Enviar mensaje de despedida antes de eliminar",
  sendMessagePlaceholder: "Esta sala ha sido cerrada debido a una violación de la política del servidor.",
  leaveRoomLabel: "Forzar a todos los miembros a salir (Leave)",
  addPrivilegedUserBtn: "Añadir Usuario Privilegiado",
  addMemberBtn: "Añadir Miembro",
  addPrivilegedUserTitle: "Asignar Nivel de Poder Privilegiado",
  addMemberTitle: "Añadir Nuevo Miembro a la Sala",
  powerLevelLabel: "Nivel de Poder",
  adminPower: "Administrador (Nivel 100)",
  modPower: "Moderador (Nivel 50)",
  customPower: "Nivel de Poder Personalizado",
  addBtn: "Añadir",
  
  // Media
  mediaStatsTitle: "Análisis de Almacenamiento de Medios de Matrix",
  totalFiles: "Cantidad Total de Archivos",
  remoteCacheSize: "Tamaño de Caché Remota",
  localFilesSize: "Tamaño de Archivos Locales",
  cleanupCacheBtn: "Purgar Medios de Caché Remota",
  cleanupAgeBtn: "Purgar Medios de Más de",
  cleanupAgeDays: "días",
  cleanupDomainBtn: "Purgar Medios de un Dominio Específico",
  domainPlaceholder: "ej. matrix.org",
  mediaTableTitle: "Archivos de Medios Almacenados",
  searchMedia: "Buscar medios por nombre o cargador...",
  fileName: "Nombre del Archivo",
  fileSize: "Tamaño",
  uploadedBy: "Cargado Por",
  uploadedAt: "Cargado El",
  fileType: "Tipo MIME",
  origin: "Origen",
  originLocal: "Medios Locales",
  originRemote: "Caché Remota",
  purgeFileBtn: "Purgar Archivo",
  
  // Tokens
  tokensTitle: "Tokens de Registro Activos",
  tokensSubtitle: "Los tokens permiten omitir el registro controlado según ámbitos y restricciones predefinidas.",
  createTokenBtn: "Generar Token de Registro",
  tokenStringLabel: "Cadena de Token (Opcional - dejar en blanco para autogenerar)",
  usesAllowedLabel: "Usos Máximos (Dejar en blanco para ilimitado)",
  expiryLabel: "Fecha de Vencimiento (Dejar en blanco para sin vencimiento)",
  tokenLabel: "Token",
  usesAllowed: "Usos Permitidos",
  usesCount: "Cantidad de Usos",
  expiryTime: "Fecha de Vencimiento",
  tokenStatus: "Estado",
  revokeBtn: "Revocar Token",
  unlimited: "Ilimitado",
  neverExpired: "Nunca Vence",
  active: "Activo",
  expired: "Vencido / Lleno",
  
  // General Buttons & Alerts
  unauthorizedMsg: "Acceso denegado: Su rol como 'Viewer' no permite acceso de escritura al servidor Matrix.",
  loading: "Sincronizando motor de Matrix...",
  save: "Guardar Cambios",
  cancel: "Cancelar",
  delete: "Eliminar",
  successAction: "Operación completada con éxito en el núcleo de homeserver.",
  errorAction: "Error al comunicarse con homeserver Synapse.",
  viewMembers: "Ver Miembros",
  memberList: "Lista de Miembros de la Sala",
  powerLevel: "Nivel de Poder",
  syncUsersBtn: "Sincronizar Usuarios",
  syncingUsers: "Sincronizando usuarios con el servidor...",
  syncSuccess: "Usuarios sincronizados con éxito con homeserver."
};

const arTranslations = {
  tabUsers: "إدارة المستخدمين",
  tabRooms: "إدارة الغرف",
  tabMedia: "تنظيف ذاكرة التخزين المؤقت للوسائط",
  tabTokens: "رموز التسجيل",
  tabInstaller: "تثبيت وإدارة الحزمة",
  tabUpdates: "تحديثات اللوحة",
  
  // Users
  searchUsers: "البحث عن المستخدمين بواسطة MXID...",
  allUsers: "كافة المستخدمين",
  adminUsers: "مشرفو سينابس",
  activeUsers: "نشط",
  deactivatedUsers: "ملغى التنشيط",
  lockedUsers: "مقفل",
  suspendedUsers: "معلق",
  shadowBannedUsers: "محظور ظلّيًا",
  addUserBtn: "تسجيل مستخدم جديد",
  username: "اسم المستخدم",
  mxidLabel: "معرف ماتريكس (MXID)",
  displayNameLabel: "الاسم المعروض",
  passwordLabel: "كلمة المرور",
  makeAdminLabel: "صلاحية مسؤول الخادم (Synapse Admin)",
  userRoleNormal: "مستخدم عادي",
  userRoleAdmin: "مسؤول الخادم",
  userStatusActive: "نشط",
  userStatusDeactivated: "ملغى التنشيط",
  deactivateBtn: "إلغاء التنشيط",
  reactivateBtn: "إعادة التنشيط وإعادة التعيين",
  resetPasswordTitle: "كلمة مرور جديدة",
  
  // Rooms
  searchRooms: "البحث عن الغرف (الاسم، المعرف، الاسم المستعار)...",
  allRooms: "كافة الغرف",
  publicRooms: "عامة",
  privateRooms: "خاصة",
  federatedRooms: "اتحادية",
  localRooms: "محلية",
  createRoomBtn: "إنشاء غرفة جديدة",
  roomNameLabel: "اسم الغرفة",
  roomAliasLabel: "الاسم المستعار للغرفة",
  roomTopicLabel: "موضوع الغرفة",
  roomVisibilityLabel: "إدراج في الدليل العام للخادم",
  roomFederationLabel: "السماح بالاتحاد مع الخوادم الخارجية",
  roomCreator: "المنشئ",
  roomMembers: "الأعضاء",
  roomVersion: "إصدار الغرفة",
  kickBtn: "طرد المستخدم",
  shutdownRoomBtn: "إغلاق وحذف الغرفة",
  purgeRoomLabel: "تطهير نهائي من قاعدة بيانات الخادم",
  sendMessageLabel: "إرسال رسالة وداع لأعضاء الغرفة أولاً",
  sendMessagePlaceholder: "تم إغلاق هذه الغرفة بسبب انتهاك سياسة الخادم.",
  leaveRoomLabel: "إجبار كافة الأعضاء على المغادرة (Leave)",
  addPrivilegedUserBtn: "إضافة مستخدم متميز",
  addMemberBtn: "إضافة عضو",
  addPrivilegedUserTitle: "تعيين مستوى صلاحيات متميز",
  addMemberTitle: "إضافة عضو جديد للغرفة",
  powerLevelLabel: "مستوى الصلاحيات",
  adminPower: "مسؤول (مستوى 100)",
  modPower: "مشرف (مستوى 50)",
  customPower: "مستوى صلاحيات مخصص",
  addBtn: "إضافة",
  
  // Media
  mediaStatsTitle: "تحليل تخزين وسائط ماتريكس",
  totalFiles: "إجمالي عدد الملفات",
  remoteCacheSize: "حجم ذاكرة التخزين المؤقت الخارجية",
  localFilesSize: "حجم الملفات المحلية",
  cleanupCacheBtn: "تطهير وسائط ذاكرة التخزين المؤقت الخارجية",
  cleanupAgeBtn: "تطهير الوسائط الأقدم من",
  cleanupAgeDays: "أيام",
  cleanupDomainBtn: "تطهير وسائط مجال معين",
  domainPlaceholder: "مثال matrix.org",
  mediaTableTitle: "ملفات الوسائط المخزنة",
  searchMedia: "البحث عن الوسائط بالاسم أو القائم بالرفع...",
  fileName: "اسم الملف",
  fileSize: "الحجم",
  uploadedBy: "تم الرفع بواسطة",
  uploadedAt: "تاريخ الرفع",
  fileType: "نوع MIME",
  origin: "الأصل",
  originLocal: "وسائط محلية",
  originRemote: "ذاكرة مؤقتة خارجية",
  purgeFileBtn: "تطهير الملف",
  
  // Tokens
  tokensTitle: "رموز التسجيل النشطة",
  tokensSubtitle: "تسمح الرموز بتجاوز التسجيل الخاضع للرقابة بمطابقة نطاقات وقيود محددة مسبقًا.",
  createTokenBtn: "إنشاء رمز تسجيل",
  tokenStringLabel: "سلسلة الرموز (اختياري - اتركه فارغاً للتوليد التلقائي)",
  usesAllowedLabel: "الحد الأقصى للاستخدامات (اتركه فارغاً لغير محدود)",
  expiryLabel: "تاريخ الانتهاء (اتركه فارغاً لعدم وجود انتهاء)",
  tokenLabel: "الرمز",
  usesAllowed: "الاستخدامات المسموح بها",
  usesCount: "عدد الاستخدامات",
  expiryTime: "تاريخ الانتهاء",
  tokenStatus: "الحالة",
  revokeBtn: "إبطال الرمز",
  unlimited: "غير محدود",
  neverExpired: "لا تنتهي صلاحيته",
  active: "نشط",
  expired: "منتهي الصلاحية / ممتلئ",
  
  // General Buttons & Alerts
  unauthorizedMsg: "تم رفض الوصول: دورك كـ 'Viewer' لا يسمح بالوصول المكتوب لخادم ماتريكس.",
  loading: "مزامنة محرك ماتريكس...",
  save: "حفظ التغييرات",
  cancel: "إلغاء",
  delete: "حذف",
  successAction: "تمت العملية بنجاح على خادم النواة.",
  errorAction: "فشل الاتصال بخادم سينابس.",
  viewMembers: "عرض الأعضاء",
  memberList: "قائمة أعضاء الغرفة",
  powerLevel: "مستوى الصلاحيات",
  syncUsersBtn: "مزامنة المستخدمين",
  syncingUsers: "مزامنة المستخدمين مع الخادم...",
  syncSuccess: "تمت مزامنة المستخدمين بنجاح مع الخادم الرئيسي."
};

const deTranslations = {
  tabUsers: "Benutzerverwaltung",
  tabRooms: "Raumverwaltung",
  tabMedia: "Medien-Cache-Bereinigung",
  tabTokens: "Registrierungs-Token",
  tabInstaller: "Stack-Installer & Manager",
  tabUpdates: "Panel-Updates",
  
  // Users
  searchUsers: "Benutzer nach MXID suchen...",
  allUsers: "Alle Benutzer",
  adminUsers: "Synapse-Admins",
  activeUsers: "Aktiv",
  deactivatedUsers: "Deaktiviert",
  lockedUsers: "Gesperrt",
  suspendedUsers: "Suspendiert",
  shadowBannedUsers: "Shadow-Banned",
  addUserBtn: "Neuen Benutzer registrieren",
  username: "Benutzername",
  mxidLabel: "Matrix-ID (MXID)",
  displayNameLabel: "Anzeigename",
  passwordLabel: "Passwort",
  makeAdminLabel: "Server-Administrator-Zugriff (Synapse Admin)",
  userRoleNormal: "Normaler Benutzer",
  userRoleAdmin: "Server-Admin",
  userStatusActive: "Aktiv",
  userStatusDeactivated: "Deaktiviert",
  deactivateBtn: "Deaktivieren",
  reactivateBtn: "Reaktivieren & Zurücksetzen",
  resetPasswordTitle: "Neues Passwort",
  
  // Rooms
  searchRooms: "Räume suchen (Name, ID, Alias)...",
  allRooms: "Alle Räume",
  publicRooms: "Öffentlich",
  privateRooms: "Privat",
  federatedRooms: "Föderiert",
  localRooms: "Lokal",
  createRoomBtn: "Neuen Raum erstellen",
  roomNameLabel: "Raumname",
  roomAliasLabel: "Raum-Alias",
  roomTopicLabel: "Raumthema",
  roomVisibilityLabel: "Im öffentlichen Serververzeichnis auflisten",
  roomFederationLabel: "Föderation mit externen Servern erlauben",
  roomCreator: "Ersteller",
  roomMembers: "Mitglieder",
  roomVersion: "Raumversion",
  kickBtn: "Benutzer kicken",
  shutdownRoomBtn: "Raum schließen & löschen",
  purgeRoomLabel: "Dauerhaft aus der Server-Datenbank löschen (Purge)",
  sendMessageLabel: "Zuerst Abschiedsnachricht an Raummitglieder senden",
  sendMessagePlaceholder: "Dieser Raum wurde aufgrund eines Verstoßes gegen die Serverrichtlinien geschlossen.",
  leaveRoomLabel: "Alle Mitglieder zum Verlassen zwingen (Leave)",
  addPrivilegedUserBtn: "Privilegierten Benutzer hinzufügen",
  addMemberBtn: "Mitglied hinzufügen",
  addPrivilegedUserTitle: "Privilegiertes Power-Level zuweisen",
  addMemberTitle: "Neues Mitglied zum Raum hinzufügen",
  powerLevelLabel: "Power-Level",
  adminPower: "Administrator (Level 100)",
  modPower: "Moderator (Level 50)",
  customPower: "Benutzerdefiniertes Power-Level",
  addBtn: "Hinzufügen",
  
  // Media
  mediaStatsTitle: "Matrix Medienspeicher-Analyse",
  totalFiles: "Gesamtzahl der Dateien",
  remoteCacheSize: "Größe des remote-Caches",
  localFilesSize: "Größe der lokalen Dateien",
  cleanupCacheBtn: "Remote gecachte Medien löschen",
  cleanupAgeBtn: "Medien löschen, die älter sind als",
  cleanupAgeDays: "Tage",
  cleanupDomainBtn: "Medien einer bestimmten Domain löschen",
  domainPlaceholder: "z.B. matrix.org",
  mediaTableTitle: "Gespeicherte Mediendateien",
  searchMedia: "Medien nach Name oder Uploader suchen...",
  fileName: "Dateiname",
  fileSize: "Größe",
  uploadedBy: "Hochgeladen von",
  uploadedAt: "Hochgeladen am",
  fileType: "MIME-Typ",
  origin: "Herkunft",
  originLocal: "Lokale Medien",
  originRemote: "Remote-Cache",
  purgeFileBtn: "Datei löschen",
  
  // Tokens
  tokensTitle: "Aktive Registrierungs-Token",
  tokensSubtitle: "Token ermöglichen die kontrollierte Umgehung der Registrierung gemäß vordefinierten Bereichen und Einschränkungen.",
  createTokenBtn: "Registrierungs-Token generieren",
  tokenStringLabel: "Token-String (Optional - für automatische Erstellung leer lassen)",
  usesAllowedLabel: "Maximale Nutzung (Für unbegrenzt leer lassen)",
  expiryLabel: "Ablaufdatum (Für kein Ablaufdatum leer lassen)",
  tokenLabel: "Token",
  usesAllowed: "Erlaubte Nutzungen",
  usesCount: "Nutzungszähler",
  expiryTime: "Ablaufzeit",
  tokenStatus: "Status",
  revokeBtn: "Token widerrufen",
  unlimited: "Unbegrenzt",
  neverExpired: "Niemals abgelaufen",
  active: "Aktiv",
  expired: "Abgelaufen / Voll",
  
  // General Buttons & Alerts
  unauthorizedMsg: "Zugriff verweigert: Ihre Rolle als 'Viewer' erlaubt keinen Schreibzugriff auf den Matrix-Server.",
  loading: "Matrix-Engine wird synchronisiert...",
  save: "Änderungen speichern",
  cancel: "Abbrechen",
  delete: "Löschen",
  successAction: "Aktion erfolgreich auf dem Homeserver-Core abgeschlossen.",
  errorAction: "Kommunikation mit dem Synapse-Homeserver fehlgeschlagen.",
  viewMembers: "Mitglieder anzeigen",
  memberList: "Raummitgliederliste",
  powerLevel: "Power-Level",
  syncUsersBtn: "Benutzer synchronisieren",
  syncingUsers: "Benutzer werden mit dem Server synchronisiert...",
  syncSuccess: "Benutzer erfolgreich mit dem Homeserver synchronisiert."
};

const ruTranslations = {
  tabUsers: "Управление пользователями",
  tabRooms: "Управление комнатами",
  tabMedia: "Очистка медиа-кэша",
  tabTokens: "Токены регистрации",
  tabInstaller: "Установка и управление стеком",
  tabUpdates: "Обновления панели",
  
  // Users
  searchUsers: "Поиск пользователей по MXID...",
  allUsers: "Все пользователи",
  adminUsers: "Администраторы Synapse",
  activeUsers: "Активные",
  deactivatedUsers: "Деактивированные",
  lockedUsers: "Заблокированные",
  suspendedUsers: "Приостановленные",
  shadowBannedUsers: "В теневом бане",
  addUserBtn: "Зарегистрировать пользователя",
  username: "Имя пользователя",
  mxidLabel: "ID Matrix (MXID)",
  displayNameLabel: "Отображаемое имя",
  passwordLabel: "Пароль",
  makeAdminLabel: "Права администратора сервера (Synapse Admin)",
  userRoleNormal: "Обычный пользователь",
  userRoleAdmin: "Администратор сервера",
  userStatusActive: "Активен",
  userStatusDeactivated: "Деактивирован",
  deactivateBtn: "Деактивировать",
  reactivateBtn: "Реактивировать и сбросить",
  resetPasswordTitle: "Новый пароль",
  
  // Rooms
  searchRooms: "Поиск комнат (Имя, ID, Алиас)...",
  allRooms: "Все комнаты",
  publicRooms: "Публичные",
  privateRooms: "Приватные",
  federatedRooms: "Федеративные",
  localRooms: "Локальные",
  createRoomBtn: "Создать комнату",
  roomNameLabel: "Название комнаты",
  roomAliasLabel: "Алиас комнаты",
  roomTopicLabel: "Тема комнаты",
  roomVisibilityLabel: "Показывать в публичном каталоге сервера",
  roomFederationLabel: "Разрешить федерацию с внешними серверами",
  roomCreator: "Создатель",
  roomMembers: "Участники",
  roomVersion: "Версия комнаты",
  kickBtn: "Исключить",
  shutdownRoomBtn: "Закрыть и удалить комнату",
  purgeRoomLabel: "Навсегда стереть из БД сервера (Purge)",
  sendMessageLabel: "Сначала отправить прощальное сообщение участникам",
  sendMessagePlaceholder: "Эта комната была закрыта из-за нарушения политики сервера.",
  leaveRoomLabel: "Заставить всех участников выйти из комнаты (Leave)",
  addPrivilegedUserBtn: "Добавить привилегированного пользователя",
  addMemberBtn: "Добавить участника",
  addPrivilegedUserTitle: "Назначить привилегированный уровень доступа",
  addMemberTitle: "Добавить нового участника в комнату",
  powerLevelLabel: "Уровень доступа",
  adminPower: "Администратор (Уровень 100)",
  modPower: "Модератор (Уровень 50)",
  customPower: "Другой уровень",
  addBtn: "Добавить",
  
  // Media
  mediaStatsTitle: "Аналитика хранилища медиа Matrix",
  totalFiles: "Всего файлов",
  remoteCacheSize: "Размер внешнего кэша",
  localFilesSize: "Размер локальных файлов",
  cleanupCacheBtn: "Очистить внешний медиа-кэш",
  cleanupAgeBtn: "Очистить медиа старше",
  cleanupAgeDays: "дней",
  cleanupDomainBtn: "Очистить медиа определенного домена",
  domainPlaceholder: "напр. matrix.org",
  mediaTableTitle: "Сохраненные медиафайлы",
  searchMedia: "Поиск медиа по имени или автору...",
  fileName: "Имя файла",
  fileSize: "Размер",
  uploadedBy: "Загружено",
  uploadedAt: "Дата загрузки",
  fileType: "Тип MIME",
  origin: "Источник",
  originLocal: "Локальное медиа",
  originRemote: "Внешний кэш",
  purgeFileBtn: "Удалить файл",
  
  // Tokens
  tokensTitle: "Активные токены регистрации",
  tokensSubtitle: "Токены позволяют обходить стандартные ограничения регистрации в рамках заданных параметров.",
  createTokenBtn: "Создать токен регистрации",
  tokenStringLabel: "Значение токена (Необязательно - оставьте пустым для автогенерации)",
  usesAllowedLabel: "Макс. использований (Оставьте пустым для безлимита)",
  expiryLabel: "Срок действия (Оставьте пустым, если бессрочно)",
  tokenLabel: "Токен",
  usesAllowed: "Разрешено использований",
  usesCount: "Использовано",
  expiryTime: "Срок действия",
  tokenStatus: "Статус",
  revokeBtn: "Отозвать токен",
  unlimited: "Безлимитно",
  neverExpired: "Бессрочно",
  active: "Активен",
  expired: "Истек / Заполнен",
  
  // General Buttons & Alerts
  unauthorizedMsg: "Доступ запрещен: ваша роль ('Viewer') не позволяет изменять параметры сервера Matrix.",
  loading: "Синхронизация с движком Matrix...",
  save: "Сохранить изменения",
  cancel: "Отмена",
  delete: "Удалить",
  successAction: "Операция успешно завершена на стороне сервера.",
  errorAction: "Не удалось связаться с сервером Synapse.",
  viewMembers: "Посмотреть участников",
  memberList: "Список участников комнаты",
  powerLevel: "Уровень доступа",
  syncUsersBtn: "Синхронизировать пользователей",
  syncingUsers: "Синхронизация пользователей с сервером...",
  syncSuccess: "Пользователи успешно синхронизированы с основным сервером."
};

export default function KetesaAdmin({
  lang,
  authToken,
  currentUser,
  showToast,
  isLightMode = false,
  activeConnectionId,
  onExecuteCommand,
  isExecuting = false,
  logs = [],
  initialTab
}: KetesaAdminProps) {
  const translationsMap = {
    fa: faTranslations,
    en: enTranslations,
    es: esTranslations,
    ar: arTranslations,
    de: deTranslations,
    ru: ruTranslations
  };
  const t = translationsMap[lang as keyof typeof translationsMap] || enTranslations;
  const isRtl = ['fa', 'ar'].includes(lang);
  const hasWriteAccess = currentUser?.role !== 'Viewer';

  const [activeTab, setActiveTab] = useState<'users' | 'rooms' | 'media' | 'tokens' | 'installer'>(initialTab || 'users');

  useEffect(() => {
    if (initialTab) {
      setActiveTab(initialTab);
    }
  }, [initialTab]);
  const [loading, setLoading] = useState(true);
  const [isSyncing, setIsSyncing] = useState(false);

  // Custom Installer & System Maintenance States
  const [installerConfig, setInstallerConfig] = useState<any>({
    HS_DOMAIN: 'matrix.company.local',
    ELEMENT_DOMAIN: 'chat.company.local',
    BASE_DOMAIN: 'company.local',
    PUBLIC_IP: '192.168.1.100',
    LE_EMAIL: 'admin@company.local',
    SSL_MODE: 'selfsigned',
    PG_DB: 'synapse',
    PG_USER: 'synapse_user',
    PG_HOST: 'localhost',
    PG_PORT: '5432'
  });
  const [installerMode, setInstallerMode] = useState<'online' | 'offline'>('online');
  const [selectedComponents, setSelectedComponents] = useState<string[]>(['synapse', 'element', 'postgres', 'coturn', 'nginx']);
  const [installLogs, setInstallLogs] = useState<string[]>([
    '# Raven Matrix Custom Installer console ready.',
    '# Select installation mode, toggle components and click "Launch Installation".'
  ]);
  const [isInstalling, setIsInstalling] = useState(false);
  const [installerWs, setInstallerWs] = useState<WebSocket | null>(null);

  const fetchConfig = async () => {
    try {
      const res = await fetch('/api/matrix/config', {
        headers: { 'Authorization': `Bearer ${authToken}` }
      });
      if (res.ok) {
        const data = await res.json();
        if (data.config) {
          setInstallerConfig((prev: any) => ({
            ...prev,
            ...data.config
          }));
        }
      }
    } catch (e) {
      console.error("Failed to fetch stack config", e);
    }
  };

  const runInstallerAction = (command: 'custom_install' | 'uninstall_stack' | 'purge_database') => {
    if (isExecuting || isInstalling) return;
    setIsInstalling(true);
    setInstallLogs([`[EXEC] Starting command: ${command}...`]);

    const actualCommand = command === 'custom_install' ? 'install' : command;

    if (onExecuteCommand) {
      onExecuteCommand(actualCommand, {
        mode: installerMode,
        components: selectedComponents,
        config: installerConfig
      });
      return;
    }

    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const wsUrl = `${protocol}//${window.location.host}/ws`;
    const ws = new WebSocket(wsUrl);

    ws.onopen = () => {
      ws.send(JSON.stringify({ type: 'auth', token: authToken }));
    };

    ws.onmessage = (event) => {
      try {
        const msg = JSON.parse(event.data);
        if (msg.type === 'auth_ok') {
          ws.send(JSON.stringify({
            type: 'execute_command',
            command,
            args: {
              mode: installerMode,
              components: selectedComponents,
              config: installerConfig
            }
          }));
        } else if (msg.type === 'cmd_stdout') {
          setInstallLogs(prev => [...prev, msg.text]);
        } else if (msg.type === 'cmd_err') {
          setInstallLogs(prev => [...prev, `❌ ERROR: ${msg.text}`]);
          setIsInstalling(false);
          ws.close();
        } else if (msg.type === 'cmd_end') {
          setInstallLogs(prev => [...prev, `\n✅ Process terminated with exit code: ${msg.code || 0}`]);
          setIsInstalling(false);
          ws.close();
          fetchAll();
        } else if (msg.type === 'error') {
          setInstallLogs(prev => [...prev, `❌ ERROR: ${msg.message}`]);
          setIsInstalling(false);
          ws.close();
        }
      } catch (err) {
        console.error("Failed to parse websocket message", err);
      }
    };

    ws.onerror = () => {
      setInstallLogs(prev => [...prev, '❌ ERROR: WebSocket connection failed.']);
      setIsInstalling(false);
    };

    ws.onclose = () => {
      setIsInstalling(false);
    };

    setInstallerWs(ws);
  };

  // States
  const [users, setUsers] = useState<MatrixUser[]>([]);
  const [rooms, setRooms] = useState<MatrixRoom[]>([]);
  const [media, setMedia] = useState<MatrixMedia[]>([]);
  const [tokens, setTokens] = useState<RegistrationToken[]>([]);

  // Search/Filter states
  const [userSearch, setUserSearch] = useState('');
  const [userFilter, setUserFilter] = useState<'all' | 'admins' | 'active' | 'deactivated' | 'locked' | 'suspended' | 'shadow_banned'>('all');

  const [roomSearch, setRoomSearch] = useState('');
  const [roomFilter, setRoomFilter] = useState<'all' | 'public' | 'private' | 'federated' | 'local'>('all');

  const [mediaSearch, setMediaSearch] = useState('');
  const [mediaFormatFilter, setMediaFormatFilter] = useState<'all' | 'image' | 'document' | 'audio_video' | 'archive' | 'other'>('all');
  const [mediaUserFilter, setMediaUserFilter] = useState<string>('all');
  const [mediaOriginFilter, setMediaOriginFilter] = useState<'all' | 'local' | 'remote'>('all');

  // Modals
  const [showAddUserModal, setShowAddUserModal] = useState(false);
  const [isRegisteringUser, setIsRegisteringUser] = useState(false);
  const [newUser, setNewUser] = useState({ username: '', display_name: '', password: '', isAdmin: false });

  const [showReactivateModal, setShowReactivateModal] = useState<string | null>(null); // mxid
  const [reactivatePass, setReactivatePass] = useState('');
  const [reactivateAdmin, setReactivateAdmin] = useState(false);

  const [showCreateRoomModal, setShowCreateRoomModal] = useState(false);
  const [newRoom, setNewRoom] = useState({ name: '', alias: '', topic: '', isPublic: true, isFederated: true });

  const [showRoomMembersModal, setShowRoomMembersModal] = useState<MatrixRoom | null>(null);

  const [showShutdownRoomModal, setShowShutdownRoomModal] = useState<MatrixRoom | null>(null);
  const [shutdownRoomConfig, setShutdownRoomConfig] = useState({ purge: true, sendMessage: true, messageText: '', leave: false });
  const [shutdownRoomLoading, setShutdownRoomLoading] = useState(false);

  const [showAddPrivilegedModal, setShowAddPrivilegedModal] = useState<MatrixRoom | null>(null);
  const [privilegedUserConfig, setPrivilegedUserConfig] = useState({ mxid: '', powerLevel: '50' });
  const [privilegedLoading, setPrivilegedLoading] = useState(false);

  const [showAddMemberModal, setShowAddMemberModal] = useState<MatrixRoom | null>(null);
  const [addMemberConfig, setAddMemberConfig] = useState({ mxid: '' });
  const [addMemberLoading, setAddMemberLoading] = useState(false);
  const [addingMemberMxid, setAddingMemberMxid] = useState<string | null>(null);
  const [memberActionLoading, setMemberActionLoading] = useState<string | null>(null);
  const [activeRoomDropdown, setActiveRoomDropdown] = useState<string | null>(null);

  const safeConfirm = (msg: string): boolean => {
    try {
      const isIframe = window.self !== window.top;
      if (isIframe) return true;
    } catch (e) {
      return true;
    }
    return window.confirm(msg);
  };

  // New States for Room Member Search and Active Directory Integration
  const [memberSearch, setMemberSearch] = useState('');
  const [addMemberSearch, setAddMemberSearch] = useState('');
  const [addMemberTab, setAddMemberTab] = useState<'direct' | 'ad'>('direct');
  const [adGroupInput, setAdGroupInput] = useState('');
  const [simAdUsername, setSimAdUsername] = useState('');
  const [simAdGroups, setSimAdGroups] = useState('');
  const [simAdDisplayName, setSimAdDisplayName] = useState('');
  const [simAdLoading, setSimAdLoading] = useState(false);

  const [showCreateTokenModal, setShowCreateTokenModal] = useState(false);
  const [newToken, setNewToken] = useState({ token: '', usesAllowed: '', expiryTime: '' });

  // Bulk Media parameters
  const [cleanupDays, setCleanupDays] = useState('30');
  const [cleanupDomain, setCleanupDomain] = useState('');

  // Advanced Ketesa states
  const [selectedUserMxid, setSelectedUserMxid] = useState<string | null>(null);
  const [selectedUserDetails, setSelectedUserDetails] = useState<any | null>(null);
  const [userDetailsLoading, setUserDetailsLoading] = useState(false);
  const [activeUserDetailTab, setActiveUserDetailTab] = useState<'user' | 'contact' | 'sso' | 'devices' | 'rooms' | 'media' | 'pushers' | 'limits' | 'account' | 'history'>('user');
  
  const [newEmail, setNewEmail] = useState('');
  const [newPhone, setNewPhone] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [isEditingDisplayName, setIsEditingDisplayName] = useState(false);
  const [tempDisplayName, setTempDisplayName] = useState('');
  const [userRateLimits, setUserRateLimits] = useState({ perSecond: '2', burstCount: '10' });
  const [userAccountDataText, setUserAccountDataText] = useState('{}');
  const [userPreferences, setUserPreferences] = useState<any>({});
  const [isSavingPreferences, setIsSavingPreferences] = useState(false);
  const [isSavingUserParams, setIsSavingUserParams] = useState(false);

  useEffect(() => {
    if (selectedUserDetails && selectedUserDetails.accountData) {
      setUserPreferences(selectedUserDetails.accountData["im.vector.web.settings"] || {});
    } else {
      setUserPreferences({});
    }
  }, [selectedUserDetails]);

  // Load room members dynamically on-demand when any room-related modal is opened
  useEffect(() => {
    const activeModalRoom = showRoomMembersModal || showAddPrivilegedModal || showAddMemberModal;
    if (!activeModalRoom) return;

    // If members are already loaded (i.e. joinedMembers is not empty), don't fetch again
    if (activeModalRoom.joinedMembers && activeModalRoom.joinedMembers.length > 0) return;

    const fetchRoomMembers = async () => {
      try {
        const res = await fetch(`/api/matrix/rooms/${encodeURIComponent(activeModalRoom.id)}/members`, {
          headers: { 'Authorization': `Bearer ${authToken}` }
        });
        if (res.ok) {
          const membersData = await res.json(); // returns { joinedMembers, bannedMembers }
          
          // Helper to update the room object in state
          setRooms((prevRooms: MatrixRoom[]) => {
            return prevRooms.map(r => r.id === activeModalRoom.id ? {
              ...r,
              joinedMembers: membersData.joinedMembers || [],
              bannedMembers: membersData.bannedMembers || []
            } : r);
          });

          // Also update the active modal state object so the modal re-renders with members!
          if (showRoomMembersModal && showRoomMembersModal.id === activeModalRoom.id) {
            setShowRoomMembersModal(prev => prev ? {
              ...prev,
              joinedMembers: membersData.joinedMembers || [],
              bannedMembers: membersData.bannedMembers || []
            } : null);
          }
          if (showAddPrivilegedModal && showAddPrivilegedModal.id === activeModalRoom.id) {
            setShowAddPrivilegedModal(prev => prev ? {
              ...prev,
              joinedMembers: membersData.joinedMembers || [],
              bannedMembers: membersData.bannedMembers || []
            } : null);
          }
          if (showAddMemberModal && showAddMemberModal.id === activeModalRoom.id) {
            setShowAddMemberModal(prev => prev ? {
              ...prev,
              joinedMembers: membersData.joinedMembers || [],
              bannedMembers: membersData.bannedMembers || []
            } : null);
          }
        }
      } catch (err) {
        console.error("Failed to load room members:", err);
      }
    };

    fetchRoomMembers();
  }, [showRoomMembersModal?.id, showAddPrivilegedModal?.id, showAddMemberModal?.id, authToken]);

  // Chat/Messages states
  const [activeRoomChatId, setActiveRoomChatId] = useState<string | null>(null);
  const [activeRoomChatName, setActiveRoomChatName] = useState<string>('');
  const [roomChatMessages, setRoomChatMessages] = useState<any[]>([]);
  const [newRoomChatMessageText, setNewRoomChatMessageText] = useState('');
  const [isChatLoading, setIsChatLoading] = useState(false);

  // Advanced Ketesa helper functions
  const fetchUserDetails = async (mxid: string, resetTab = false, silent = false) => {
    if (!silent) {
      setUserDetailsLoading(true);
    }
    setSelectedUserMxid(mxid);
    if (resetTab) {
      setActiveUserDetailTab('user');
    }
    try {
      const res = await fetch(`/api/matrix/users/details?mxid=${encodeURIComponent(mxid)}`, {
        headers: { 'Authorization': `Bearer ${authToken}` }
      });
      if (res.ok) {
        const data = await res.json();
        setSelectedUserDetails(data);
        setUserRateLimits({
          perSecond: data.rateLimits?.perSecond?.toString() || '2',
          burstCount: data.rateLimits?.burstCount?.toString() || '10'
        });
        setUserAccountDataText(JSON.stringify(data.accountData || {}, null, 2));
      } else {
        showToast('error', t.errorAction);
      }
    } catch (e) {
      showToast('error', t.errorAction);
    } finally {
      if (!silent) {
        setUserDetailsLoading(false);
      }
    }
  };

  const handleUpdateUserParams = async (updates: any) => {
    if (!hasWriteAccess) return showToast('error', t.unauthorizedMsg);
    if (!selectedUserMxid) return;

    setIsSavingUserParams(true);
    // Optimistically update the UI instantly
    setSelectedUserDetails((prev: any) => {
      if (!prev) return prev;
      return { ...prev, ...updates };
    });

    try {
      const res = await fetch('/api/matrix/users/details/update', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authToken}`
        },
        body: JSON.stringify({ mxid: selectedUserMxid, ...updates })
      });
      if (res.ok) {
        showToast('success', t.successAction);
        await fetchUserDetails(selectedUserMxid, false, true);
        await fetchAll(true);
      } else {
        showToast('error', t.errorAction);
        await fetchUserDetails(selectedUserMxid, false, true); // rollback
      }
    } catch (e) {
      showToast('error', t.errorAction);
      await fetchUserDetails(selectedUserMxid, false, true); // rollback
    } finally {
      setIsSavingUserParams(false);
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!hasWriteAccess) return showToast('error', t.unauthorizedMsg);
    if (!selectedUserMxid || !newPassword) return;

    try {
      const res = await fetch('/api/matrix/users/password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authToken}`
        },
        body: JSON.stringify({ mxid: selectedUserMxid, password: newPassword })
      });
      if (res.ok) {
        showToast('success', t.successAction);
        setNewPassword('');
        fetchUserDetails(selectedUserMxid, false, true);
      } else {
        showToast('error', t.errorAction);
      }
    } catch (e) {
      showToast('error', t.errorAction);
    }
  };

  const handleAddEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!hasWriteAccess) return showToast('error', t.unauthorizedMsg);
    if (!selectedUserMxid || !newEmail) return;

    // Optimistically add the email to UI list
    setSelectedUserDetails((prev: any) => {
      if (!prev) return prev;
      const emails = prev.emails || [];
      if (emails.includes(newEmail)) return prev;
      return { ...prev, emails: [...emails, newEmail] };
    });

    try {
      const res = await fetch('/api/matrix/users/emails/add', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authToken}`
        },
        body: JSON.stringify({ mxid: selectedUserMxid, email: newEmail })
      });
      if (res.ok) {
        showToast('success', t.successAction);
        setNewEmail('');
        fetchUserDetails(selectedUserMxid, false, true);
      } else {
        const err = await res.json();
        showToast('error', err.error || t.errorAction);
        fetchUserDetails(selectedUserMxid, false, true); // rollback
      }
    } catch (e) {
      showToast('error', t.errorAction);
      fetchUserDetails(selectedUserMxid, false, true); // rollback
    }
  };

  const handleRemoveEmail = async (email: string) => {
    if (!hasWriteAccess) return showToast('error', t.unauthorizedMsg);
    if (!selectedUserMxid) return;

    // Optimistically remove the email from UI list
    setSelectedUserDetails((prev: any) => {
      if (!prev) return prev;
      const emails = (prev.emails || []).filter((e: string) => e !== email);
      return { ...prev, emails };
    });

    try {
      const res = await fetch('/api/matrix/users/emails/delete', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authToken}`
        },
        body: JSON.stringify({ mxid: selectedUserMxid, email })
      });
      if (res.ok) {
        showToast('success', t.successAction);
        fetchUserDetails(selectedUserMxid, false, true);
      } else {
        showToast('error', t.errorAction);
        fetchUserDetails(selectedUserMxid, false, true); // rollback
      }
    } catch (e) {
      showToast('error', t.errorAction);
      fetchUserDetails(selectedUserMxid, false, true); // rollback
    }
  };

  const handleAddPhone = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!hasWriteAccess) return showToast('error', t.unauthorizedMsg);
    if (!selectedUserMxid || !newPhone) return;

    // Optimistically add the phone to UI list
    setSelectedUserDetails((prev: any) => {
      if (!prev) return prev;
      const phones = prev.phones || [];
      if (phones.includes(newPhone)) return prev;
      return { ...prev, phones: [...phones, newPhone] };
    });

    try {
      const res = await fetch('/api/matrix/users/phones/add', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authToken}`
        },
        body: JSON.stringify({ mxid: selectedUserMxid, phone: newPhone })
      });
      if (res.ok) {
        showToast('success', t.successAction);
        setNewPhone('');
        fetchUserDetails(selectedUserMxid, false, true);
      } else {
        const err = await res.json();
        showToast('error', err.error || t.errorAction);
        fetchUserDetails(selectedUserMxid, false, true); // rollback
      }
    } catch (e) {
      showToast('error', t.errorAction);
      fetchUserDetails(selectedUserMxid, false, true); // rollback
    }
  };

  const handleRemovePhone = async (phone: string) => {
    if (!hasWriteAccess) return showToast('error', t.unauthorizedMsg);
    if (!selectedUserMxid) return;

    // Optimistically remove phone from UI list
    setSelectedUserDetails((prev: any) => {
      if (!prev) return prev;
      const phones = (prev.phones || []).filter((p: string) => p !== phone);
      return { ...prev, phones };
    });

    try {
      const res = await fetch('/api/matrix/users/phones/delete', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authToken}`
        },
        body: JSON.stringify({ mxid: selectedUserMxid, phone })
      });
      if (res.ok) {
        showToast('success', t.successAction);
        fetchUserDetails(selectedUserMxid, false, true);
      } else {
        showToast('error', t.errorAction);
        fetchUserDetails(selectedUserMxid, false, true); // rollback
      }
    } catch (e) {
      showToast('error', t.errorAction);
      fetchUserDetails(selectedUserMxid, false, true); // rollback
    }
  };

  const handleTerminateDevice = async (deviceId: string) => {
    if (!hasWriteAccess) return showToast('error', t.unauthorizedMsg);
    if (!selectedUserMxid) return;

    const confirmMsg = isRtl
      ? `آیا از خروج کاربر از این دستگاه (${deviceId}) اطمینان دارید؟`
      : `Are you sure you want to log out the user from this device (${deviceId})?`;

    if (!safeConfirm(confirmMsg)) return;

    // Optimistically remove device from UI list
    setSelectedUserDetails((prev: any) => {
      if (!prev) return prev;
      const devices = (prev.devices || []).filter((d: any) => d.id !== deviceId);
      return { ...prev, devices };
    });

    try {
      const res = await fetch('/api/matrix/users/devices/delete', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authToken}`
        },
        body: JSON.stringify({ mxid: selectedUserMxid, deviceId })
      });
      if (res.ok) {
        showToast('success', t.successAction);
        fetchUserDetails(selectedUserMxid, false, true);
      } else {
        showToast('error', t.errorAction);
        fetchUserDetails(selectedUserMxid, false, true); // rollback
      }
    } catch (e) {
      showToast('error', t.errorAction);
      fetchUserDetails(selectedUserMxid, false, true); // rollback
    }
  };

  const handleUserRoomAction = async (roomId: string, action: 'kick' | 'ban' | 'unban') => {
    if (!hasWriteAccess) return showToast('error', t.unauthorizedMsg);
    if (!selectedUserMxid) return;

    try {
      const res = await fetch(`/api/matrix/users/rooms/${action}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authToken}`
        },
        body: JSON.stringify({ mxid: selectedUserMxid, roomId })
      });
      if (res.ok) {
        showToast('success', t.successAction);
        fetchUserDetails(selectedUserMxid, false, true);
        const roomsRes = await fetch('/api/matrix/rooms', { headers: { 'Authorization': `Bearer ${authToken}` } });
        if (roomsRes.ok) setRooms(await roomsRes.json());
      } else {
        showToast('error', t.errorAction);
      }
    } catch (e) {
      showToast('error', t.errorAction);
    }
  };

  const handleSaveRateLimits = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!hasWriteAccess) return showToast('error', t.unauthorizedMsg);
    if (!selectedUserMxid) return;

    try {
      const res = await fetch('/api/matrix/users/rate-limits', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authToken}`
        },
        body: JSON.stringify({
          mxid: selectedUserMxid,
          perSecond: parseFloat(userRateLimits.perSecond),
          burstCount: parseInt(userRateLimits.burstCount)
        })
      });
      if (res.ok) {
        showToast('success', t.successAction);
        fetchUserDetails(selectedUserMxid, false, true);
      } else {
        showToast('error', t.errorAction);
      }
    } catch (e) {
      showToast('error', t.errorAction);
    }
  };

  const handleSaveAccountData = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!hasWriteAccess) return showToast('error', t.unauthorizedMsg);
    if (!selectedUserMxid) return;

    try {
      let parsed;
      try {
        parsed = JSON.parse(userAccountDataText);
      } catch (err) {
        return showToast('error', 'Invalid JSON syntax');
      }

      const res = await fetch('/api/matrix/users/account-data', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authToken}`
        },
        body: JSON.stringify({ mxid: selectedUserMxid, accountData: parsed })
      });
      if (res.ok) {
        showToast('success', t.successAction);
        fetchUserDetails(selectedUserMxid, false, true);
      } else {
        showToast('error', t.errorAction);
      }
    } catch (e) {
      showToast('error', t.errorAction);
    }
  };

  const handleSavePreferences = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!hasWriteAccess) return showToast('error', t.unauthorizedMsg);
    if (!selectedUserMxid) return;

    setIsSavingPreferences(true);
    try {
      const currentAccountData = selectedUserDetails?.accountData || {};
      const updatedAccountData = {
        ...currentAccountData,
        "im.vector.web.settings": userPreferences
      };

      const res = await fetch('/api/matrix/users/account-data', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authToken}`
        },
        body: JSON.stringify({ mxid: selectedUserMxid, accountData: updatedAccountData })
      });

      if (res.ok) {
        showToast('success', t.successAction);
        await fetchUserDetails(selectedUserMxid, false, true);
      } else {
        showToast('error', t.errorAction);
      }
    } catch (err) {
      showToast('error', t.errorAction);
    } finally {
      setIsSavingPreferences(false);
    }
  };

  const handleOpenRoomChat = async (roomId: string, roomName: string) => {
    setIsChatLoading(true);
    setActiveRoomChatId(roomId);
    setActiveRoomChatName(roomName);
    try {
      const res = await fetch(`/api/matrix/rooms/${encodeURIComponent(roomId)}/messages`, {
        headers: { 'Authorization': `Bearer ${authToken}` }
      });
      if (res.ok) {
        setRoomChatMessages(await res.json());
      } else {
        showToast('error', t.errorAction);
      }
    } catch (e) {
      showToast('error', t.errorAction);
    } finally {
      setIsChatLoading(false);
    }
  };

  const handleExportHtml = () => {
    if (!roomChatMessages || roomChatMessages.length === 0) return;
    
    const title = activeRoomChatName || activeRoomChatId || "Chat";
    const rtlDir = isRtl ? 'rtl' : 'ltr';
    const headingText = isRtl ? `گزارش گفتگو - ${title}` : `Chat History Export - ${title}`;
    const generatedAtText = isRtl 
      ? `تاریخ خروجی: ${new Date().toLocaleString('fa-IR')}` 
      : `Exported at: ${new Date().toLocaleString()}`;
    
    let messagesHtml = '';
    roomChatMessages.forEach(msg => {
      const isSystem = msg.sender.startsWith('@admin');
      const msgDate = new Date(msg.timestamp).toLocaleString(isRtl ? 'fa-IR' : undefined);
      const msgAlign = isSystem ? 'system-msg' : 'user-msg';
      const alignClass = isSystem ? 'align-right' : 'align-left';
      
      messagesHtml += `
        <div class="message-wrapper ${alignClass}">
          <div class="message ${msgAlign}">
            <div class="meta">
              <span class="sender-name">${msg.senderDisplayName || msg.sender}</span>
              <span class="sender-id">(${msg.sender})</span>
            </div>
            <div class="content">${msg.content ? msg.content.replace(/\n/g, '<br>') : ''}</div>
            <div class="timestamp">${msgDate}</div>
          </div>
        </div>
      `;
    });

    const htmlContent = `
<!DOCTYPE html>
<html lang="${isRtl ? 'fa' : 'en'}" dir="${rtlDir}">
<head>
  <meta charset="UTF-8">
  <title>${title}</title>
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
      background-color: #f8fafc;
      color: #1e293b;
      margin: 0;
      padding: 40px 20px;
    }
    .container {
      max-width: 800px;
      margin: 0 auto;
      background: white;
      border-radius: 16px;
      box-shadow: 0 4px 20px rgba(0, 0, 0, 0.05);
      border: 1px solid #e2e8f0;
      overflow: hidden;
    }
    .header {
      background: linear-gradient(135deg, #4f46e5 0%, #3b82f6 100%);
      color: white;
      padding: 30px;
    }
    .header h1 {
      margin: 0;
      font-size: 24px;
      font-weight: 700;
    }
    .header p {
      margin: 8px 0 0 0;
      font-size: 14px;
      opacity: 0.9;
    }
    .room-id {
      font-family: monospace;
      background: rgba(255, 255, 255, 0.15);
      padding: 2px 6px;
      border-radius: 4px;
      font-size: 12px;
    }
    .chat-timeline {
      padding: 30px;
      display: flex;
      flex-direction: column;
      gap: 20px;
      background-color: #fafafa;
    }
    .message-wrapper {
      display: flex;
      width: 100%;
    }
    .align-left {
      justify-content: flex-start;
    }
    .align-right {
      justify-content: flex-end;
    }
    .message {
      max-width: 75%;
      padding: 14px 18px;
      border-radius: 12px;
      box-shadow: 0 1px 3px rgba(0,0,0,0.02);
      border: 1px solid #e2e8f0;
    }
    .user-msg {
      background-color: #ffffff;
      border-left: 4px solid #94a3b8;
      border-top-left-radius: 0;
    }
    .system-msg {
      background-color: #e0e7ff;
      border-right: 4px solid #4f46e5;
      border-top-right-radius: 0;
    }
    .meta {
      display: flex;
      align-items: baseline;
      gap: 8px;
      margin-bottom: 6px;
    }
    .sender-name {
      font-weight: 600;
      font-size: 13px;
    }
    .sender-id {
      font-size: 11px;
      color: #64748b;
      font-family: monospace;
    }
    .content {
      font-size: 14px;
      line-height: 1.5;
      word-break: break-word;
      white-space: pre-wrap;
    }
    .timestamp {
      display: block;
      text-align: right;
      font-size: 10px;
      color: #64748b;
      margin-top: 8px;
      font-family: monospace;
    }
    .footer {
      text-align: center;
      padding: 20px;
      font-size: 12px;
      color: #64748b;
      border-top: 1px solid #e2e8f0;
      background-color: #ffffff;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>${headingText}</h1>
      <p>${isRtl ? 'شناسه اتاق:' : 'Room ID:'} <span class="room-id">${activeRoomChatId}</span></p>
      <p>${generatedAtText}</p>
    </div>
    <div class="chat-timeline">
      ${messagesHtml}
    </div>
    <div class="footer">
      ${isRtl ? 'تولید شده توسط پنل مدیریت هوشمند Raven' : 'Generated by Raven Admin Dashboard'}
    </div>
  </div>
</body>
</html>
    `;

    const blob = new Blob([htmlContent], { type: 'text/html;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", `${title.replace(/[^a-zA-Z0-9آ-ی]/g, "_")}_chat_history.html`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleSendChatMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeRoomChatId || !newRoomChatMessageText.trim()) return;

    try {
      const res = await fetch(`/api/matrix/rooms/${encodeURIComponent(activeRoomChatId)}/messages/send`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authToken}`
        },
        body: JSON.stringify({
          content: newRoomChatMessageText,
          sender: currentUser ? `@${currentUser.username}:matrix.company.local` : '@admin:matrix.company.local',
          senderDisplayName: currentUser ? currentUser.username : 'Server Administrator'
        })
      });
      if (res.ok) {
        const msg = await res.json();
        setRoomChatMessages(prev => [...prev, msg]);
        setNewRoomChatMessageText('');
      } else {
        showToast('error', t.errorAction);
      }
    } catch (e) {
      showToast('error', t.errorAction);
    }
  };

  const handleQuarantineMedia = async (mediaId: string, quarantined: boolean) => {
    if (!hasWriteAccess) return showToast('error', t.unauthorizedMsg);
    try {
      const res = await fetch('/api/matrix/media/quarantine', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authToken}`
        },
        body: JSON.stringify({ mediaId, quarantined })
      });
      if (res.ok) {
        showToast('success', quarantined 
          ? (isRtl ? 'رسانه با موفقیت قرنطینه شد.' : 'Media successfully quarantined.') 
          : (isRtl ? 'رسانه با موفقیت آزاد شد.' : 'Media successfully released from quarantine.')
        );
        if (selectedUserMxid) {
          fetchUserDetails(selectedUserMxid);
        }
        // Always refresh the global media list to keep in sync
        const mediaRes = await fetch('/api/matrix/media', { headers: { 'Authorization': `Bearer ${authToken}` } });
        if (mediaRes.ok) setMedia(await mediaRes.json());
      } else {
        showToast('error', t.errorAction);
      }
    } catch (e) {
      showToast('error', t.errorAction);
    }
  };

  // Initial Fetching
  useEffect(() => {
    fetchAll();
  }, [authToken, activeConnectionId]);

  const fetchAll = async (silent = false) => {
    if (!silent) setLoading(true);
    try {
      const headers = { 'Authorization': `Bearer ${authToken}` };
      const [usersRes, roomsRes, mediaRes, tokensRes] = await Promise.all([
        fetch('/api/matrix/users', { headers }),
        fetch('/api/matrix/rooms', { headers }),
        fetch('/api/matrix/media', { headers }),
        fetch('/api/matrix/tokens', { headers })
      ]);

      if (usersRes.ok) setUsers(await usersRes.json());
      if (roomsRes.ok) setRooms(await roomsRes.json());
      if (mediaRes.ok) setMedia(await mediaRes.json());
      if (tokensRes.ok) setTokens(await tokensRes.json());
    } catch (e) {
      showToast('error', t.errorAction);
    } finally {
      if (!silent) setLoading(false);
    }
  };

  const handleSyncUsers = async () => {
    setIsSyncing(true);
    showToast('success', t.syncingUsers || "Syncing users with server...");
    try {
      const headers = { 'Authorization': `Bearer ${authToken}` };
      const res = await fetch('/api/matrix/users', { headers });
      if (res.ok) {
        setUsers(await res.json());
        showToast('success', t.syncSuccess || "Users synced successfully with homeserver.");
      } else {
        showToast('error', t.errorAction);
      }
    } catch (e) {
      showToast('error', t.errorAction);
    } finally {
      setIsSyncing(false);
    }
  };

  // User Actions
  const handleRegisterUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!hasWriteAccess) return showToast('error', t.unauthorizedMsg);
    if (!newUser.username || !newUser.password) return;

    setIsRegisteringUser(true);
    try {
      const res = await fetch('/api/matrix/users/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authToken}`
        },
        body: JSON.stringify({
          username: newUser.username,
          password: newUser.password,
          isAdmin: newUser.isAdmin
        })
      });

      if (res.ok) {
        showToast('success', t.successAction);
        setShowAddUserModal(false);
        setNewUser({ username: '', display_name: '', password: '', isAdmin: false });
        // Refresh users
        const usersData = await fetch('/api/matrix/users', { headers: { 'Authorization': `Bearer ${authToken}` } }).then(r => r.json());
        setUsers(usersData);
      } else {
        const err = await res.json();
        showToast('error', err.error || t.errorAction);
      }
    } catch (e) {
      showToast('error', t.errorAction);
    } finally {
      setIsRegisteringUser(false);
    }
  };

  const handleDeactivateUser = async (mxid: string) => {
    if (!hasWriteAccess) return showToast('error', t.unauthorizedMsg);
    if (!safeConfirm(`Are you sure you want to deactivate ${mxid}?`)) return;

    try {
      const res = await fetch('/api/matrix/users/deactivate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authToken}`
        },
        body: JSON.stringify({ mxid })
      });

      if (res.ok) {
        showToast('success', t.successAction);
        const usersData = await res.json();
        setUsers(prev => prev.map(u => u.mxid === mxid ? { ...u, isDeactivated: true } : u));
      } else {
        showToast('error', t.errorAction);
      }
    } catch (e) {
      showToast('error', t.errorAction);
    }
  };

  const handleReactivateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!hasWriteAccess) return showToast('error', t.unauthorizedMsg);
    if (!showReactivateModal || !reactivatePass) return;

    try {
      const res = await fetch('/api/matrix/users/reactivate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authToken}`
        },
        body: JSON.stringify({
          mxid: showReactivateModal,
          password: reactivatePass,
          isAdmin: reactivateAdmin
        })
      });

      if (res.ok) {
        showToast('success', t.successAction);
        setShowReactivateModal(null);
        setReactivatePass('');
        // Refresh
        const usersRes = await fetch('/api/matrix/users', { headers: { 'Authorization': `Bearer ${authToken}` } });
        if (usersRes.ok) setUsers(await usersRes.json());
      } else {
        showToast('error', t.errorAction);
      }
    } catch (e) {
      showToast('error', t.errorAction);
    }
  };

  // Room Actions
  const handleCreateRoom = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!hasWriteAccess) return showToast('error', t.unauthorizedMsg);
    if (!newRoom.name) return;

    try {
      const res = await fetch('/api/matrix/rooms/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authToken}`
        },
        body: JSON.stringify({
          name: newRoom.name,
          alias: newRoom.alias,
          topic: newRoom.topic,
          isPublic: newRoom.isPublic,
          isFederated: newRoom.isFederated
        })
      });

      if (res.ok) {
        showToast('success', t.successAction);
        setShowCreateRoomModal(false);
        setNewRoom({ name: '', alias: '', topic: '', isPublic: true, isFederated: true });
        const roomsRes = await fetch('/api/matrix/rooms', { headers: { 'Authorization': `Bearer ${authToken}` } });
        if (roomsRes.ok) setRooms(await roomsRes.json());
      } else {
        const err = await res.json();
        showToast('error', err.error || t.errorAction);
      }
    } catch (e) {
      showToast('error', t.errorAction);
    }
  };

  const handleShutdownRoom = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!hasWriteAccess) return showToast('error', t.unauthorizedMsg);
    if (!showShutdownRoomModal) return;

    setShutdownRoomLoading(true);
    try {
      const res = await fetch('/api/matrix/rooms/delete', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authToken}`
        },
        body: JSON.stringify({
          roomId: showShutdownRoomModal.id,
          purge: shutdownRoomConfig.purge,
          sendMessage: shutdownRoomConfig.sendMessage,
          messageText: shutdownRoomConfig.messageText || t.sendMessagePlaceholder,
          leave: shutdownRoomConfig.leave
        })
      });

      if (res.ok) {
        showToast('success', t.successAction);
        setShowShutdownRoomModal(null);
        setShutdownRoomConfig({ purge: true, sendMessage: true, messageText: '', leave: false });
        // Refresh rooms
        const roomsRes = await fetch('/api/matrix/rooms', { headers: { 'Authorization': `Bearer ${authToken}` } });
        if (roomsRes.ok) setRooms(await roomsRes.json());
      } else {
        showToast('error', t.errorAction);
      }
    } catch (e) {
      showToast('error', t.errorAction);
    } finally {
      setShutdownRoomLoading(false);
    }
  };

  const handleSetPrivilegedUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!hasWriteAccess) return showToast('error', t.unauthorizedMsg);
    if (!showAddPrivilegedModal) return;
    if (!privilegedUserConfig.mxid) return showToast('error', isRtl ? 'لطفا شناسه ماتریکس را وارد کنید' : 'Please enter the Matrix ID');

    setPrivilegedLoading(true);
    try {
      const res = await fetch('/api/matrix/rooms/power_levels', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authToken}`
        },
        body: JSON.stringify({
          roomId: showAddPrivilegedModal.id,
          mxid: privilegedUserConfig.mxid,
          powerLevel: parseInt(privilegedUserConfig.powerLevel, 10)
        })
      });

      if (res.ok) {
        showToast('success', t.successAction);
        setShowAddPrivilegedModal(null);
        setPrivilegedUserConfig({ mxid: '', powerLevel: '50' });
        // Refresh rooms
        const roomsRes = await fetch('/api/matrix/rooms', { headers: { 'Authorization': `Bearer ${authToken}` } });
        if (roomsRes.ok) setRooms(await roomsRes.json());
      } else {
        const err = await res.json();
        showToast('error', err.error || t.errorAction);
      }
    } catch (e) {
      showToast('error', t.errorAction);
    } finally {
      setPrivilegedLoading(false);
    }
  };

  const handleOpenAddMemberModal = async (room: any) => {
    setShowAddMemberModal({
      ...room,
      joinedMembers: room.joinedMembers || [],
      bannedMembers: room.bannedMembers || []
    });
    setAddMemberConfig({ mxid: '' });

    try {
      const res = await fetch(`/api/matrix/rooms/${encodeURIComponent(room.id)}/members`, {
        headers: { 'Authorization': `Bearer ${authToken}` }
      });
      if (res.ok) {
        const data = await res.json();
        setShowAddMemberModal(prev => prev ? {
          ...prev,
          joinedMembers: data.joinedMembers || [],
          bannedMembers: data.bannedMembers || []
        } : null);
      }
    } catch (err) {
      console.warn("Could not fetch room members:", err);
    }
  };

  const handleForceJoinMember = async (e?: React.FormEvent, customMxid?: string) => {
    if (e) e.preventDefault();
    if (!hasWriteAccess) return showToast('error', t.unauthorizedMsg);
    if (!showAddMemberModal) return;
    
    const targetMxid = customMxid || addMemberConfig.mxid;
    if (!targetMxid) return showToast('error', isRtl ? 'لطفا شناسه ماتریکس را وارد کنید' : 'Please enter the Matrix ID');

    if (customMxid) {
      setAddingMemberMxid(customMxid);
    }
    setAddMemberLoading(true);
    try {
      const res = await fetch('/api/matrix/rooms/members/join', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authToken}`
        },
        body: JSON.stringify({
          roomId: showAddMemberModal.id,
          mxid: targetMxid
        })
      });

      if (res.ok) {
        showToast('success', t.successAction);
        if (!customMxid) {
          setShowAddMemberModal(null);
          setAddMemberConfig({ mxid: '' });
        }
        // Fetch fresh members for modal
        try {
          const membersRes = await fetch(`/api/matrix/rooms/${encodeURIComponent(showAddMemberModal.id)}/members`, {
            headers: { 'Authorization': `Bearer ${authToken}` }
          });
          if (membersRes.ok) {
            const membersData = await membersRes.json();
            setShowAddMemberModal(prev => prev ? {
              ...prev,
              joinedMembers: membersData.joinedMembers || [],
              bannedMembers: membersData.bannedMembers || []
            } : null);
          }
        } catch (mErr) {
          console.warn("Failed to update room members in modal:", mErr);
        }
        // Refresh rooms list
        const roomsRes = await fetch('/api/matrix/rooms', { headers: { 'Authorization': `Bearer ${authToken}` } });
        if (roomsRes.ok) {
          const freshRooms = await roomsRes.json();
          setRooms(freshRooms);
        }
      } else {
        const err = await res.json();
        showToast('error', err.error || t.errorAction);
      }
    } catch (e) {
      showToast('error', t.errorAction);
    } finally {
      setAddMemberLoading(false);
      setAddingMemberMxid(null);
    }
  };

  const handleUpdateAdGroups = async (roomId: string, groups: string) => {
    if (!hasWriteAccess) return showToast('error', t.unauthorizedMsg);
    
    try {
      const res = await fetch(`/api/matrix/rooms/${roomId}/ad-groups`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authToken}`
        },
        body: JSON.stringify({ adGroups: groups })
      });
      if (res.ok) {
        showToast('success', t.successAction);
        // Refresh rooms
        const roomsRes = await fetch('/api/matrix/rooms', { headers: { 'Authorization': `Bearer ${authToken}` } });
        if (roomsRes.ok) {
          const freshRooms = await roomsRes.json();
          setRooms(freshRooms);
          // Update modal room
          const updatedRoom = freshRooms.find((r: any) => r.id === roomId);
          if (updatedRoom) {
            setShowAddMemberModal(updatedRoom);
          }
        }
      } else {
        showToast('error', t.errorAction);
      }
    } catch (e) {
      showToast('error', t.errorAction);
    }
  };

  const handleSimulateAdLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!simAdUsername) return showToast('error', 'Username is required');
    
    setSimAdLoading(true);
    try {
      const res = await fetch('/api/matrix/ldap/simulate-login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authToken}`
        },
        body: JSON.stringify({
          username: simAdUsername,
          adGroups: simAdGroups,
          displayName: simAdDisplayName
        })
      });
      if (res.ok) {
        const data = await res.json();
        showToast('success', isRtl 
          ? `لاگین موفق! کاربر در ${data.joinedCount} روم عضو شد.`
          : `Success! User auto-joined ${data.joinedCount} room(s).`
        );
        
        // Reset simulation fields
        setSimAdUsername('');
        setSimAdGroups('');
        setSimAdDisplayName('');
        
        // Refresh rooms and users
        const roomsRes = await fetch('/api/matrix/rooms', { headers: { 'Authorization': `Bearer ${authToken}` } });
        if (roomsRes.ok) setRooms(await roomsRes.json());
        
        const usersRes = await fetch('/api/matrix/users', { headers: { 'Authorization': `Bearer ${authToken}` } });
        if (usersRes.ok) setUsers(await usersRes.json());
      } else {
        showToast('error', t.errorAction);
      }
    } catch (e) {
      showToast('error', t.errorAction);
    } finally {
      setSimAdLoading(false);
    }
  };

  const handleRoomMemberAction = async (roomId: string, mxid: string, action: 'kick' | 'ban' | 'unban') => {
    if (!hasWriteAccess) return showToast('error', t.unauthorizedMsg);
    if (!safeConfirm(`Are you sure you want to ${action} ${mxid}?`)) return;

    setMemberActionLoading(`${mxid}-${action}`);
    try {
      const res = await fetch(`/api/matrix/users/rooms/${action}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authToken}`
        },
        body: JSON.stringify({ mxid, roomId })
      });
      if (res.ok) {
        showToast('success', t.successAction);
        
        // Refresh rooms
        const roomsRes = await fetch('/api/matrix/rooms', { headers: { 'Authorization': `Bearer ${authToken}` } });
        if (roomsRes.ok) {
          const freshRooms = await roomsRes.json();
          setRooms(freshRooms);
          
          // If the View Members modal is open, update its state too!
          if (showRoomMembersModal?.id === roomId) {
            const updatedRoom = freshRooms.find((r: any) => r.id === roomId);
            if (updatedRoom) {
              setShowRoomMembersModal(updatedRoom);
            }
          }
        }
      } else {
        showToast('error', t.errorAction);
      }
    } catch (e) {
      showToast('error', t.errorAction);
    } finally {
      setMemberActionLoading(null);
    }
  };

  const handleKickMember = async (roomId: string, mxid: string) => {
    if (!hasWriteAccess) return showToast('error', t.unauthorizedMsg);
    if (!safeConfirm(`Are you sure you want to kick ${mxid}?`)) return;

    try {
      const res = await fetch('/api/matrix/rooms/members/kick', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authToken}`
        },
        body: JSON.stringify({ roomId, mxid })
      });

      if (res.ok) {
        showToast('success', t.successAction);
        const data = await res.json();
        
        // Update local state
        setRooms(prev => prev.map(r => r.id === roomId ? data.room : r));
        if (showRoomMembersModal?.id === roomId) {
          setShowRoomMembersModal(data.room);
        }
      } else {
        showToast('error', t.errorAction);
      }
    } catch (e) {
      showToast('error', t.errorAction);
    }
  };

  // Media Actions
  const handlePurgeMediaFile = async (mediaId: string) => {
    if (!hasWriteAccess) return showToast('error', t.unauthorizedMsg);
    if (!safeConfirm(`Are you sure you want to permanently delete media ${mediaId}?`)) return;

    try {
      const res = await fetch('/api/matrix/media/delete', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authToken}`
        },
        body: JSON.stringify({ mediaId })
      });

      if (res.ok) {
        showToast('success', t.successAction);
        setMedia(prev => prev.filter(m => m.id !== mediaId));
      } else {
        showToast('error', t.errorAction);
      }
    } catch (e) {
      showToast('error', t.errorAction);
    }
  };

  const handleBulkMediaCleanup = async (type: 'remote_cache' | 'by_age' | 'by_domain') => {
    if (!hasWriteAccess) return showToast('error', t.unauthorizedMsg);
    
    let confirmMsg = '';
    let bodyData: any = { type };

    if (type === 'remote_cache') {
      confirmMsg = "Purge all cached remote media files from other homeservers? This operation is non-destructive for local content.";
    } else if (type === 'by_age') {
      const days = parseInt(cleanupDays);
      if (isNaN(days) || days <= 0) return showToast('error', 'Please enter a valid number of days.');
      confirmMsg = `Delete all media items older than ${days} days?`;
      bodyData.days = days;
    } else if (type === 'by_domain') {
      if (!cleanupDomain) return showToast('error', 'Please specify a remote homeserver domain.');
      confirmMsg = `Purge all media items originating from homeserver '${cleanupDomain}'?`;
      bodyData.domain = cleanupDomain;
    }

    if (!safeConfirm(confirmMsg)) return;

    try {
      const res = await fetch('/api/matrix/media/cleanup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authToken}`
        },
        body: JSON.stringify(bodyData)
      });

      if (res.ok) {
        const data = await res.json();
        showToast('success', `${t.successAction} Purged ${data.purgedCount} items, reclaimed ${data.reclaimedSizeMB} MB.`);
        // Refresh media list
        const mediaRes = await fetch('/api/matrix/media', { headers: { 'Authorization': `Bearer ${authToken}` } });
        if (mediaRes.ok) setMedia(await mediaRes.json());
      } else {
        showToast('error', t.errorAction);
      }
    } catch (e) {
      showToast('error', t.errorAction);
    }
  };

  // Token Actions
  const handleCreateToken = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!hasWriteAccess) return showToast('error', t.unauthorizedMsg);
    
    // Auto generate token string if not specified
    const tokenStr = newToken.token || 'MTX-' + Math.random().toString(36).substring(2, 10).toUpperCase();

    try {
      const res = await fetch('/api/matrix/tokens/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authToken}`
        },
        body: JSON.stringify({
          token: tokenStr,
          usesAllowed: newToken.usesAllowed || undefined,
          expiryTime: newToken.expiryTime || undefined
        })
      });

      if (res.ok) {
        showToast('success', t.successAction);
        setShowCreateTokenModal(false);
        setNewToken({ token: '', usesAllowed: '', expiryTime: '' });
        // Refresh tokens list
        const tokensRes = await fetch('/api/matrix/tokens', { headers: { 'Authorization': `Bearer ${authToken}` } });
        if (tokensRes.ok) setTokens(await tokensRes.json());
      } else {
        const err = await res.json();
        showToast('error', err.error || t.errorAction);
      }
    } catch (e) {
      showToast('error', t.errorAction);
    }
  };

  const handleRevokeToken = async (tokenStr: string) => {
    if (!hasWriteAccess) return showToast('error', t.unauthorizedMsg);
    if (!safeConfirm(`Are you sure you want to revoke token ${tokenStr}?`)) return;

    try {
      const res = await fetch('/api/matrix/tokens/delete', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authToken}`
        },
        body: JSON.stringify({ token: tokenStr })
      });

      if (res.ok) {
        showToast('success', t.successAction);
        setTokens(prev => prev.filter(t => t.token !== tokenStr));
      } else {
        showToast('error', t.errorAction);
      }
    } catch (e) {
      showToast('error', t.errorAction);
    }
  };

  // Filtering Logic
  const filteredUsers = users.filter(u => {
    const matchesSearch = u.mxid.toLowerCase().includes(userSearch.toLowerCase()) || 
                          (u.displayName && u.displayName.toLowerCase().includes(userSearch.toLowerCase()));
    if (!matchesSearch) return false;
    if (userFilter === 'admins') return u.isAdmin;
    if (userFilter === 'active') return !u.isDeactivated;
    if (userFilter === 'deactivated') return u.isDeactivated;
    if (userFilter === 'locked') return !!u.isLocked;
    if (userFilter === 'suspended') return !!u.isSuspended;
    if (userFilter === 'shadow_banned') return !!u.isShadowBanned;
    return true;
  });

  const filteredRooms = rooms.filter(r => {
    const rName = r.name || r.id || "";
    const rId = r.id || "";
    const rAlias = r.alias || "";
    const matchesSearch = rName.toLowerCase().includes(roomSearch.toLowerCase()) || 
                          rId.toLowerCase().includes(roomSearch.toLowerCase()) ||
                          rAlias.toLowerCase().includes(roomSearch.toLowerCase());
    if (!matchesSearch) return false;
    if (roomFilter === 'public') return r.isPublic;
    if (roomFilter === 'private') return !r.isPublic;
    if (roomFilter === 'federated') return r.isFederated;
    if (roomFilter === 'local') return !r.isFederated;
    return true;
  });

  const getMediaFormatIcon = (mimeType?: string, fileName?: string) => {
    const mime = (mimeType || '').toLowerCase();
    const name = (fileName || '').toLowerCase();

    if (mime.includes('pdf') || name.endsWith('.pdf')) {
      return <FileText className="h-4 w-4 text-rose-400 shrink-0" />;
    }
    if (mime.includes('image') || name.match(/\.(jpg|jpeg|png|gif|webp|svg|bmp)$/i)) {
      return <ImageIcon className="h-4 w-4 text-emerald-400 shrink-0" />;
    }
    if (mime.includes('video') || name.match(/\.(mp4|mkv|avi|mov|webm)$/i)) {
      return <Video className="h-4 w-4 text-purple-400 shrink-0" />;
    }
    if (mime.includes('audio') || name.match(/\.(mp3|wav|ogg|flac|m4a)$/i)) {
      return <Music className="h-4 w-4 text-amber-400 shrink-0" />;
    }
    if (mime.includes('word') || mime.includes('document') || mime.includes('excel') || mime.includes('sheet') || name.match(/\.(doc|docx|xls|xlsx|ppt|pptx|odt)$/i)) {
      return <FileSpreadsheet className="h-4 w-4 text-blue-400 shrink-0" />;
    }
    if (mime.includes('zip') || mime.includes('compressed') || mime.includes('tar') || name.match(/\.(zip|rar|7z|tar|gz)$/i)) {
      return <Archive className="h-4 w-4 text-yellow-400 shrink-0" />;
    }
    if (mime.includes('text') || mime.includes('json') || mime.includes('xml') || name.match(/\.(txt|json|js|ts|html|css|py|sh)$/i)) {
      return <FileCode className="h-4 w-4 text-cyan-400 shrink-0" />;
    }
    return <File className="h-4 w-4 text-slate-400 shrink-0" />;
  };

  const triggerBlobDownload = (blob: Blob, filename: string) => {
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  };

  const handleDownloadMediaFile = async (mediaItem: MatrixMedia) => {
    try {
      showToast('info', isRtl ? 'در حال دریافت فایل از سرور...' : 'Downloading file from server...');
      const token = localStorage.getItem('token');
      const downloadUrl = `/api/matrix/media/download?mxc=${encodeURIComponent(mediaItem.id)}&fileName=${encodeURIComponent(mediaItem.fileName || '')}&mimeType=${encodeURIComponent(mediaItem.mimeType || '')}`;
      
      const response = await fetch(downloadUrl, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error(`Server returned status ${response.status}`);
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;

      let targetName = mediaItem.fileName;
      if (!targetName) {
        const isImg = (mediaItem.mimeType || '').includes('image');
        const ext = (mediaItem.mimeType || '').includes('jpeg') ? '.jpg' : isImg ? '.png' : '.bin';
        targetName = `media_${mediaItem.id.replace(/[^a-zA-Z0-9]/g, '_')}${ext}`;
      }

      link.download = targetName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      showToast('success', isRtl ? 'دانلود فایل انجام شد' : 'Media download completed');
    } catch (err: any) {
      console.error('Media download error:', err);
      showToast('error', isRtl ? 'خطا در دریافت فایل از سرور' : 'Failed to download file from server');
    }
  };

  const filteredMedia = media.filter(m => {
    const matchesSearch = (m.fileName && m.fileName.toLowerCase().includes(mediaSearch.toLowerCase())) ||
                          m.id.toLowerCase().includes(mediaSearch.toLowerCase()) ||
                          m.uploadedBy.toLowerCase().includes(mediaSearch.toLowerCase()) ||
                          m.mimeType.toLowerCase().includes(mediaSearch.toLowerCase());
    if (!matchesSearch) return false;

    if (mediaOriginFilter === 'local' && m.isCached) return false;
    if (mediaOriginFilter === 'remote' && !m.isCached) return false;

    if (mediaUserFilter !== 'all' && m.uploadedBy !== mediaUserFilter) return false;

    if (mediaFormatFilter !== 'all') {
      const mime = (m.mimeType || '').toLowerCase();
      const name = (m.fileName || '').toLowerCase();

      if (mediaFormatFilter === 'image') {
        if (!mime.includes('image') && !name.match(/\.(jpg|jpeg|png|gif|webp|svg|bmp)$/i)) return false;
      } else if (mediaFormatFilter === 'document') {
        if (!mime.includes('pdf') && !mime.includes('word') && !mime.includes('document') && !mime.includes('excel') && !mime.includes('sheet') && !name.match(/\.(pdf|doc|docx|xls|xlsx|ppt|pptx|txt)$/i)) return false;
      } else if (mediaFormatFilter === 'audio_video') {
        if (!mime.includes('video') && !mime.includes('audio') && !name.match(/\.(mp4|mkv|avi|mov|webm|mp3|wav|ogg|flac)$/i)) return false;
      } else if (mediaFormatFilter === 'archive') {
        if (!mime.includes('zip') && !mime.includes('compressed') && !mime.includes('tar') && !name.match(/\.(zip|rar|7z|tar|gz)$/i)) return false;
      } else if (mediaFormatFilter === 'other') {
        const isKnown = mime.includes('image') || mime.includes('pdf') || mime.includes('video') || mime.includes('audio') || mime.includes('zip');
        if (isKnown) return false;
      }
    }

    return true;
  });

  // Calculate Media stats
  const totalFilesCount = media.length;
  const remoteCachedSizeB = media.filter(m => m.isCached).reduce((acc, curr) => acc + curr.fileSize, 0);
  const localSizeB = media.filter(m => !m.isCached).reduce((acc, curr) => acc + curr.fileSize, 0);
  const totalCachedSizeMB = (remoteCachedSizeB / 1024 / 1024).toFixed(2);
  const totalLocalSizeMB = (localSizeB / 1024 / 1024).toFixed(2);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-gray-400">
        <RefreshCw className="h-10 w-10 animate-spin text-indigo-400 mb-4" />
        <p className="font-mono text-sm">{t.loading}</p>
      </div>
    );
  }

  return (
    <div className={`space-y-6 ${isRtl ? 'rtl' : 'ltr'}`} id="ketesa-container">
      {/* Tab Navigation Dock & API Sync Status */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div className={`flex flex-wrap gap-2 p-1.5 rounded-xl border max-w-max transition-all duration-300 ${
          isLightMode 
            ? 'bg-slate-100 border-slate-200' 
            : 'bg-black/40 backdrop-blur-md border-white/5'
        }`}>
        <button
          onClick={() => setActiveTab('users')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-all duration-300 ${
            activeTab === 'users'
              ? isLightMode
                ? 'bg-indigo-50 border border-indigo-200 text-indigo-700 shadow-sm'
                : 'bg-gradient-to-r from-indigo-500/20 to-purple-500/20 border border-indigo-500/30 text-indigo-200 shadow-md'
              : isLightMode
                ? 'text-slate-500 hover:text-slate-800 hover:bg-slate-200/50 border border-transparent'
                : 'text-gray-400 hover:text-gray-200 hover:bg-white/5 border border-transparent'
          }`}
          id="tab-users-btn"
        >
          <Users className="h-4 w-4" />
          <span>{t.tabUsers}</span>
          <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-mono transition-colors duration-300 ${
            isLightMode 
              ? 'bg-indigo-100 text-indigo-800 font-extrabold border border-indigo-200' 
              : 'bg-indigo-500/20 text-indigo-200 font-bold border border-indigo-500/30'
          }`}>
            {users.length}
          </span>
        </button>

        <button
          onClick={() => setActiveTab('rooms')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-all duration-300 ${
            activeTab === 'rooms'
              ? isLightMode
                ? 'bg-purple-50 border border-purple-200 text-purple-700 shadow-sm'
                : 'bg-gradient-to-r from-purple-500/20 to-pink-500/20 border border-purple-500/30 text-purple-200 shadow-md'
              : isLightMode
                ? 'text-slate-500 hover:text-slate-800 hover:bg-slate-200/50 border border-transparent'
                : 'text-gray-400 hover:text-gray-200 hover:bg-white/5 border border-transparent'
          }`}
          id="tab-rooms-btn"
        >
          <Layers className="h-4 w-4" />
          <span>{t.tabRooms}</span>
          <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-mono transition-colors duration-300 ${
            isLightMode 
              ? 'bg-purple-100 text-purple-800 font-extrabold border border-purple-200' 
              : 'bg-purple-500/20 text-purple-200 font-bold border border-purple-500/30'
          }`}>
            {rooms.length}
          </span>
        </button>

        <button
          onClick={() => setActiveTab('media')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-all duration-300 ${
            activeTab === 'media'
              ? isLightMode
                ? 'bg-amber-50 border border-amber-200 text-amber-700 shadow-sm'
                : 'bg-gradient-to-r from-amber-500/20 to-orange-500/20 border border-amber-500/30 text-amber-200 shadow-md'
              : isLightMode
                ? 'text-slate-500 hover:text-slate-800 hover:bg-slate-200/50 border border-transparent'
                : 'text-gray-400 hover:text-gray-200 hover:bg-white/5 border border-transparent'
          }`}
          id="tab-media-btn"
        >
          <HardDrive className="h-4 w-4" />
          <span>{t.tabMedia}</span>
          <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-mono transition-colors duration-300 ${
            isLightMode 
              ? 'bg-amber-100 text-amber-800 font-extrabold border border-amber-200' 
              : 'bg-amber-500/20 text-amber-200 font-bold border border-amber-500/30'
          }`}>
            {totalCachedSizeMB} MB
          </span>
        </button>

        <button
          onClick={() => setActiveTab('tokens')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-all duration-300 ${
            activeTab === 'tokens'
              ? isLightMode
                ? 'bg-emerald-50 border border-emerald-200 text-emerald-700 shadow-sm'
                : 'bg-gradient-to-r from-emerald-500/20 to-teal-500/20 border border-emerald-500/30 text-emerald-200 shadow-md'
              : isLightMode
                ? 'text-slate-500 hover:text-slate-800 hover:bg-slate-200/50 border border-transparent'
                : 'text-gray-400 hover:text-gray-200 hover:bg-white/5 border border-transparent'
          }`}
          id="tab-tokens-btn"
        >
          <Key className="h-4 w-4" />
          <span>{t.tabTokens}</span>
          <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-mono transition-colors duration-300 ${
            isLightMode 
              ? 'bg-emerald-100 text-emerald-800 font-extrabold border border-emerald-200' 
              : 'bg-emerald-500/20 text-emerald-200 font-bold border border-emerald-500/30'
          }`}>
            {tokens.length}
          </span>
        </button>

        <button
          onClick={() => {
            setActiveTab('installer');
            fetchConfig();
          }}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-all duration-300 ${
            activeTab === 'installer'
              ? isLightMode
                ? 'bg-rose-50 border border-rose-200 text-rose-700 shadow-sm'
                : 'bg-gradient-to-r from-red-500/20 to-amber-500/20 border border-red-500/30 text-red-200 shadow-md'
              : isLightMode
                ? 'text-slate-500 hover:text-slate-800 hover:bg-slate-200/50 border border-transparent'
                : 'text-gray-400 hover:text-gray-200 hover:bg-white/5 border border-transparent'
          }`}
          id="tab-installer-btn"
        >
          <Cpu className="h-4 w-4" />
          <span>{t.tabInstaller || 'Stack Installer'}</span>
          <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-mono transition-colors duration-300 ${
            isLightMode 
              ? 'bg-rose-100 text-rose-700 font-bold' 
              : 'bg-slate-800 text-rose-400'
          }`}>
            v1.12
          </span>
        </button>


      </div>

      <div className="flex flex-wrap items-center gap-3">
        <button
          onClick={() => {
            fetchAll();
            showToast('success', isRtl ? 'اطلاعات با موفقیت بروزرسانی شد' : 'Data reloaded successfully');
          }}
          className={`flex items-center gap-2 px-4 py-2 rounded-2xl border text-xs font-semibold shadow-sm transition-all duration-300 ${
            isLightMode
              ? 'bg-white hover:bg-slate-50 border-slate-200 text-slate-700'
              : 'bg-white/5 hover:bg-white/10 border-white/5 text-gray-300'
          }`}
          title={isRtl ? 'بروزرسانی مجدد' : 'Reload all data'}
        >
          <RefreshCw className="h-3.5 w-3.5" />
          <span>{isRtl ? 'بروزرسانی صفحه' : 'Reload Panel'}</span>
        </button>

        <div className={`flex items-center gap-2 px-3.5 py-2 rounded-2xl border text-xs font-semibold shrink-0 shadow-sm ${
          isLightMode
            ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
            : 'bg-emerald-500/5 border-emerald-500/10 text-emerald-300'
        }`}>
          <span className="relative flex h-2.5 w-2.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
          </span>
          <span>{isRtl ? 'همگام‌سازی زنده فعال از طریق API های ماتریکس و Synapse' : 'Live Synchronization via Matrix & Synapse APIs'}</span>
        </div>
      </div>
    </div>

      {/* Dynamic Content Views */}
      <AnimatePresence mode="wait">
        {/* TAB 1: USERS */}
        {activeTab === 'users' && (
          <motion.div
            key="users-tab"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            className="space-y-4"
          >
            {/* Search, Filter & Actions rail */}
            <div className={`flex flex-col md:flex-row gap-3 justify-between items-stretch md:items-center p-4 rounded-xl border transition-all duration-300 ${
              isLightMode 
                ? 'bg-white border-slate-200 shadow-sm' 
                : 'bg-black/25 border-white/5'
            }`}>
              <div className="flex flex-1 flex-wrap items-center gap-3">
                <div className="relative flex-1 min-w-[240px]">
                  <Search className={`absolute top-3 ${isRtl ? 'left-3' : 'right-3'} h-4 w-4 text-gray-500`} />
                  <input
                    type="text"
                    value={userSearch}
                    onChange={(e) => setUserSearch(e.target.value)}
                    placeholder={t.searchUsers}
                    className={`w-full border rounded-lg py-2 px-4 text-sm font-mono outline-none transition-all duration-300 ${
                      isLightMode
                        ? 'bg-slate-50 border-slate-200 hover:border-indigo-500/50 focus:border-indigo-500 text-slate-800 placeholder-slate-400'
                        : 'bg-black/40 border-white/5 hover:border-indigo-500/30 focus:border-indigo-500/80 text-gray-200 placeholder-gray-500'
                    }`}
                  />
                </div>

                <div className={`flex flex-wrap p-0.5 rounded-lg border text-xs font-medium transition-all duration-300 ${
                  isLightMode ? 'bg-slate-100 border-slate-200' : 'bg-black/40 border-white/5'
                }`}>
                  {(['all', 'admins', 'active', 'deactivated', 'locked', 'suspended', 'shadow_banned'] as const).map(f => (
                    <button
                      key={f}
                      onClick={() => setUserFilter(f)}
                      className={`px-3 py-1.5 rounded-md transition-all duration-300 ${
                        userFilter === f 
                          ? isLightMode
                            ? 'bg-white text-indigo-600 border border-indigo-100 shadow-sm'
                            : 'bg-indigo-500/10 text-indigo-300 border border-indigo-500/20' 
                          : isLightMode
                            ? 'text-slate-500 hover:text-slate-800'
                            : 'text-gray-400 hover:text-gray-200'
                      }`}
                    >
                      {f === 'all' && t.allUsers}
                      {f === 'admins' && t.adminUsers}
                      {f === 'active' && t.activeUsers}
                      {f === 'deactivated' && t.deactivatedUsers}
                      {f === 'locked' && (t as any).lockedUsers}
                      {f === 'suspended' && (t as any).suspendedUsers}
                      {f === 'shadow_banned' && (t as any).shadowBannedUsers}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={handleSyncUsers}
                  disabled={isSyncing}
                  className={`flex items-center justify-center gap-2 px-4 py-2.5 font-medium text-sm rounded-lg transition-all duration-300 shadow-sm border ${
                    isLightMode
                      ? 'bg-slate-50 hover:bg-slate-100 border-slate-200 text-slate-700 disabled:opacity-50'
                      : 'bg-white/5 hover:bg-white/10 border-white/5 text-gray-300 disabled:opacity-50'
                  }`}
                  id="sync-users-btn"
                >
                  <RefreshCw className={`h-4 w-4 ${isSyncing ? 'animate-spin text-indigo-400' : ''}`} />
                  <span>{isSyncing ? (isRtl ? 'در حال همگام‌سازی...' : 'Syncing...') : t.syncUsersBtn}</span>
                </button>

                {hasWriteAccess && (
                  <button
                    onClick={() => setShowAddUserModal(true)}
                    className={`flex items-center justify-center gap-2 px-4 py-2.5 font-medium text-sm rounded-lg transition-all duration-300 shadow-md border ${
                      isLightMode
                        ? 'bg-indigo-50 hover:bg-indigo-100 border-indigo-200 text-indigo-700'
                        : 'bg-gradient-to-r from-indigo-500/20 to-purple-500/20 hover:from-indigo-500/30 hover:to-purple-500/30 border-indigo-500/30 text-indigo-200'
                    }`}
                    id="add-user-btn"
                  >
                    <UserPlus className="h-4 w-4" />
                    <span>{t.addUserBtn}</span>
                  </button>
                )}
              </div>
            </div>

            {/* Users Table */}
            <div className={`rounded-xl border overflow-hidden transition-all duration-300 ${
              isLightMode ? 'bg-white border-slate-200 shadow-sm' : 'bg-black/30 backdrop-blur-md border-white/5'
            }`}>
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className={`border-b text-xs uppercase tracking-wider font-mono ${
                      isLightMode 
                        ? 'border-slate-100 bg-slate-50/80 text-slate-500' 
                        : 'border-white/5 bg-black/30 text-gray-400'
                    }`}>
                      <th className="py-3 px-4 text-center w-14">#</th>
                      <th className={`py-3 px-4 ${isRtl ? 'text-right' : 'text-left'}`}>{t.mxidLabel}</th>
                      <th className={`py-3 px-4 ${isRtl ? 'text-right' : 'text-left'}`}>{t.displayNameLabel}</th>
                      <th className="py-3 px-4 text-center">{t.tokenStatus}</th>
                      <th className="py-3 px-4 text-center">{t.userRoleAdmin}</th>
                      <th className="py-3 px-4 text-center w-40">Actions</th>
                    </tr>
                  </thead>
                  <tbody className={`text-sm font-medium ${
                    isLightMode ? 'divide-y divide-slate-100 text-slate-700' : 'divide-y divide-white/5 text-gray-200'
                  }`}>
                    {filteredUsers.length === 0 ? (
                      <tr>
                        <td colSpan={6} className={`py-10 text-center font-mono ${isLightMode ? 'text-slate-400' : 'text-gray-500'}`}>
                          No Matrix users matched your filter criteria.
                        </td>
                      </tr>
                    ) : (
                      filteredUsers.map((u, i) => (
                        <tr
                          key={u.mxid}
                          onClick={() => fetchUserDetails(u.mxid, true)}
                          className={`transition-all duration-200 cursor-pointer ${
                            isLightMode ? 'hover:bg-slate-50/50' : 'hover:bg-white/5'
                          }`}
                        >
                          <td className={`py-3 px-4 text-center font-mono ${isLightMode ? 'text-slate-400' : 'text-gray-500'}`}>{i + 1}</td>
                          <td className={`py-3 px-4 font-mono ${isLightMode ? 'text-slate-700' : 'text-gray-200'} ${isRtl ? 'text-right' : 'text-left'}`}>{u.mxid}</td>
                          <td className={`py-3 px-4 ${isRtl ? 'text-right' : 'text-left'}`}>
                            <div className="flex items-center gap-2">
                              {u.avatarUrl && (
                                <img src={u.avatarUrl} alt="" className={`h-6 w-6 rounded-full border ${isLightMode ? 'border-slate-200' : 'border-white/10'}`} referrerPolicy="no-referrer" />
                              )}
                              <span className={`font-sans ${isLightMode ? 'text-slate-800' : 'text-gray-300'}`}>{u.displayName || u.mxid.split(':')[0].replace('@', '')}</span>
                            </div>
                          </td>
                          <td className="py-3 px-4 text-center">
                            <div className="flex flex-wrap items-center justify-center gap-1.5">
                              <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-mono font-medium ${
                                u.isDeactivated 
                                  ? isLightMode
                                    ? 'bg-red-50 text-red-600 border border-red-100'
                                    : 'bg-red-500/10 text-red-400 border border-red-500/20' 
                                  : isLightMode
                                    ? 'bg-emerald-50 text-emerald-600 border border-emerald-100'
                                    : 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                              }`}>
                                {u.isDeactivated ? t.userStatusDeactivated : t.userStatusActive}
                              </span>

                              {u.isLocked && (
                                <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-mono font-medium ${
                                  isLightMode
                                    ? 'bg-amber-50 text-amber-700 border border-amber-200'
                                    : 'bg-amber-500/15 text-amber-300 border border-amber-500/20'
                                }`}>
                                  {isRtl ? 'قفل شده' : 'Locked'}
                                </span>
                              )}

                              {u.isSuspended && (
                                <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-mono font-medium ${
                                  isLightMode
                                    ? 'bg-orange-50 text-orange-700 border border-orange-200'
                                    : 'bg-orange-500/15 text-orange-300 border border-orange-500/20'
                                }`}>
                                  {isRtl ? 'معلق' : 'Suspended'}
                                </span>
                              )}

                              {u.isShadowBanned && (
                                <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-mono font-medium ${
                                  isLightMode
                                    ? 'bg-purple-50 text-purple-700 border border-purple-200'
                                    : 'bg-purple-500/15 text-purple-300 border border-purple-500/20'
                                }`}>
                                  {isRtl ? 'مسدود سایه' : 'Shadow'}
                                </span>
                              )}

                              {u.isErased && (
                                <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-mono font-medium ${
                                  isLightMode
                                    ? 'bg-rose-50 text-rose-700 border border-rose-200'
                                    : 'bg-rose-500/15 text-rose-300 border border-rose-500/20'
                                }`}>
                                  {isRtl ? 'حذف شده' : 'Erased'}
                                </span>
                              )}
                            </div>
                          </td>
                          <td className="py-3 px-4 text-center">
                            <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-mono font-medium ${
                              u.isAdmin 
                                ? isLightMode
                                  ? 'bg-purple-50 text-purple-600 border border-purple-100'
                                  : 'bg-purple-500/10 text-purple-400 border border-purple-500/20' 
                                : isLightMode
                                  ? 'bg-slate-100 text-slate-500 border border-slate-200'
                                  : 'bg-slate-500/10 text-gray-400 border border-white/5'
                            }`}>
                              {u.isAdmin ? t.userRoleAdmin : t.userRoleNormal}
                            </span>
                          </td>
                          <td className="py-3 px-4">
                            <div className="flex justify-center items-center gap-2">
                              {hasWriteAccess ? (
                                u.isDeactivated ? (
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      setShowReactivateModal(u.mxid);
                                      setReactivateAdmin(u.isAdmin);
                                    }}
                                    className={`px-2.5 py-1 text-xs border rounded font-medium transition-all duration-200 ${
                                      isLightMode
                                        ? 'bg-emerald-50 hover:bg-emerald-100 text-emerald-600 border-emerald-200'
                                        : 'bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-300 border border-emerald-500/30'
                                    }`}
                                  >
                                    {t.reactivateBtn.split(' ')[0]}
                                  </button>
                                ) : (
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleDeactivateUser(u.mxid);
                                    }}
                                    className={`px-2.5 py-1 text-xs border rounded font-medium transition-all duration-200 ${
                                      isLightMode
                                        ? 'bg-red-50 hover:bg-red-100 text-red-600 border-red-200'
                                        : 'bg-red-600/10 hover:bg-red-600/20 text-red-400 border border-red-500/20'
                                    }`}
                                  >
                                    {t.deactivateBtn}
                                  </button>
                                )
                              ) : (
                                <span className={`text-xs font-mono ${isLightMode ? 'text-slate-400' : 'text-gray-500'}`}>-</span>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </motion.div>
        )}

        {/* TAB 2: ROOMS */}
        {activeTab === 'rooms' && (
          <motion.div
            key="rooms-tab"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            className="space-y-4"
          >
            {/* Search, Filter & Actions rail */}
            <div className={`flex flex-col md:flex-row gap-3 justify-between items-stretch md:items-center p-4 rounded-xl border ${
              isLightMode 
                ? 'bg-slate-50 border-slate-200' 
                : 'bg-black/25 border-white/5'
            }`}>
              <div className="flex flex-1 flex-wrap items-center gap-3">
                <div className="relative flex-1 min-w-[240px]">
                  <Search className={`absolute top-3 ${isRtl ? 'left-3' : 'right-3'} h-4 w-4 text-gray-500`} />
                  <input
                    type="text"
                    value={roomSearch}
                    onChange={(e) => setRoomSearch(e.target.value)}
                    placeholder={t.searchRooms}
                    className={`w-full border rounded-lg py-2 px-4 text-sm font-mono outline-none transition-all duration-300 ${
                      isLightMode 
                        ? 'bg-white border-slate-200 text-slate-800 focus:border-purple-500' 
                        : 'bg-black/40 border-white/5 text-gray-200 hover:border-purple-500/30 focus:border-purple-500/80'
                    }`}
                  />
                </div>

                <div className={`flex p-0.5 rounded-lg border text-xs font-medium flex-wrap gap-1 ${
                  isLightMode 
                    ? 'bg-slate-100 border-slate-200' 
                    : 'bg-black/40 border-white/5'
                }`}>
                  {(['all', 'public', 'private', 'federated', 'local'] as const).map(f => (
                    <button
                      key={f}
                      onClick={() => setRoomFilter(f)}
                      className={`px-2.5 py-1.5 rounded transition-all duration-300 cursor-pointer ${
                        roomFilter === f 
                          ? (isLightMode ? 'bg-purple-600 text-white shadow-sm' : 'bg-purple-500/10 text-purple-300 border border-purple-500/20') 
                          : (isLightMode ? 'text-slate-600 hover:text-slate-800 hover:bg-slate-200/50' : 'text-gray-400 hover:text-gray-200')
                      }`}
                    >
                      {f === 'all' && t.allRooms}
                      {f === 'public' && t.publicRooms}
                      {f === 'private' && t.privateRooms}
                      {f === 'federated' && t.federatedRooms}
                      {f === 'local' && t.localRooms}
                    </button>
                  ))}
                </div>
              </div>

              {hasWriteAccess && (
                <button
                  onClick={() => setShowCreateRoomModal(true)}
                  className="flex items-center justify-center gap-2 px-4 py-2.5 bg-purple-600 hover:bg-purple-500 text-white font-medium text-sm rounded-lg transition-all duration-300 shadow-md"
                  id="create-room-btn"
                >
                  <Plus className="h-4 w-4" />
                  <span>{t.createRoomBtn}</span>
                </button>
              )}
            </div>

            {/* Rooms Cards Grid / List */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {filteredRooms.length === 0 ? (
                <div className={`col-span-full border rounded-xl py-12 text-center font-mono text-sm ${
                  isLightMode 
                    ? 'bg-slate-50 border-slate-200 text-slate-500' 
                    : 'bg-black/20 border-white/5 text-gray-500'
                }`}>
                  No rooms matched your parameters.
                </div>
              ) : (
                filteredRooms.map(r => (
                  <div
                    key={r.id}
                    className={`relative flex flex-col justify-between p-5 border rounded-xl transition-all duration-300 group ${
                      isLightMode 
                        ? 'bg-white border-slate-200 shadow-sm hover:border-purple-500/40 hover:shadow-md hover:shadow-purple-500/5 text-slate-800' 
                        : 'bg-gradient-to-b from-slate-900/40 to-slate-950/40 border-white/5 hover:border-purple-500/30 hover:shadow-lg hover:shadow-purple-500/5 text-gray-200'
                    }`}
                  >
                    <div>
                      {/* Name & ID row */}
                      <div className="flex justify-between items-start mb-2 gap-2 relative">
                        <div className="flex flex-col max-w-[65%]">
                          <div className="flex items-center gap-1.5">
                            <Hash className={`h-4 w-4 flex-shrink-0 ${isLightMode ? 'text-purple-600' : 'text-purple-400'}`} />
                            <h4 className={`font-bold leading-tight tracking-tight transition-colors duration-200 truncate ${
                              isLightMode 
                                ? 'text-slate-800 group-hover:text-purple-600' 
                                : 'text-gray-100 group-hover:text-purple-300'
                            }`}>
                              {r.name && !r.name.startsWith('!') 
                                ? r.name 
                                : (r.alias && !r.alias.startsWith('!') 
                                    ? r.alias 
                                    : (isRtl ? `اتاق ${r.id.split(':')[0].replace('!', '')}` : `Room ${r.id.split(':')[0].replace('!', '')}`))}
                            </h4>
                          </div>
                          <span className={`text-[10px] font-mono block truncate select-all mt-1 ${
                            isLightMode ? 'text-slate-500' : 'text-slate-400'
                          }`}>
                            {r.id}
                          </span>
                        </div>
                        
                        <div className="flex items-center gap-2">
                          <div className="flex gap-1 flex-wrap justify-end">
                            <span className={`inline-flex px-1.5 py-0.5 rounded text-[10px] font-mono font-medium uppercase border ${
                              r.isPublic 
                                ? 'bg-emerald-500/5 text-emerald-400 border-emerald-500/10' 
                                : 'bg-red-500/5 text-red-400 border-red-500/10'
                            }`}>
                              {r.isPublic ? t.publicRooms : t.privateRooms}
                            </span>
                            {r.isFederated && (
                              <span className="inline-flex px-1.5 py-0.5 rounded text-[10px] font-mono font-medium uppercase bg-indigo-500/5 text-indigo-400 border border-indigo-500/10">
                                {t.federatedRooms}
                              </span>
                            )}
                          </div>

                          {/* 3-Dot Dropdown Trigger */}
                          <div className="relative">
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                setActiveRoomDropdown(activeRoomDropdown === r.id ? null : r.id);
                              }}
                              className={`p-1.5 rounded-lg transition-all cursor-pointer ${
                                isLightMode 
                                  ? 'hover:bg-slate-100 text-slate-500 hover:text-slate-800' 
                                  : 'hover:bg-white/5 text-gray-400 hover:text-white'
                              }`}
                            >
                              <MoreVertical className="h-4 w-4" />
                            </button>

                            {/* Dropdown Menu */}
                            {activeRoomDropdown === r.id && (
                              <>
                                <div 
                                  className="fixed inset-0 z-20" 
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setActiveRoomDropdown(null);
                                  }} 
                                />
                                <div className={`absolute ${isRtl ? 'left-0' : 'right-0'} mt-1 w-56 rounded-xl border p-1.5 shadow-xl z-30 animate-in fade-in slide-in-from-top-1 duration-150 ${
                                  isLightMode 
                                    ? 'bg-white border-slate-200 text-slate-700 shadow-slate-200/60' 
                                    : 'bg-slate-950 border-white/10 text-gray-200 shadow-black/80'
                                }`}>
                                  <button
                                    type="button"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      setActiveRoomDropdown(null);
                                      setShowRoomMembersModal(r);
                                    }}
                                    className={`w-full flex items-center gap-2 px-2.5 py-2 rounded-lg text-left text-xs transition-all cursor-pointer ${
                                      isLightMode ? 'hover:bg-slate-50 text-slate-800' : 'hover:bg-white/5 text-white'
                                    }`}
                                  >
                                    <Users className="h-3.5 w-3.5 text-slate-400" />
                                    <span>{t.viewMembers}</span>
                                  </button>

                                  <button
                                    type="button"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      setActiveRoomDropdown(null);
                                      handleOpenRoomChat(r.id, r.name || r.id);
                                    }}
                                    className={`w-full flex items-center gap-2 px-2.5 py-2 rounded-lg text-left text-xs transition-all cursor-pointer ${
                                      isLightMode ? 'hover:bg-slate-50 text-slate-800' : 'hover:bg-white/5 text-white'
                                    }`}
                                  >
                                    <MessageSquare className="h-3.5 w-3.5 text-indigo-400" />
                                    <span>{isRtl ? 'پایش گفتگو' : 'Inspect Chat'}</span>
                                  </button>

                                  {hasWriteAccess && (
                                    <>
                                      <div className={`h-[1px] my-1 ${isLightMode ? 'bg-slate-100' : 'bg-white/5'}`} />
                                      
                                      <button
                                        type="button"
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          setActiveRoomDropdown(null);
                                          setShowAddPrivilegedModal(r);
                                          setPrivilegedUserConfig({ mxid: '', powerLevel: '50' });
                                        }}
                                        className={`w-full flex items-center gap-2 px-2.5 py-2 rounded-lg text-left text-xs transition-all cursor-pointer ${
                                          isLightMode ? 'hover:bg-slate-50 text-slate-800' : 'hover:bg-white/5 text-white'
                                        }`}
                                      >
                                        <Shield className="h-3.5 w-3.5 text-purple-400" />
                                        <span>{t.addPrivilegedUserBtn}</span>
                                      </button>

                                      <button
                                        type="button"
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          setActiveRoomDropdown(null);
                                          setShowAddMemberModal(r);
                                          setAddMemberConfig({ mxid: '' });
                                        }}
                                        className={`w-full flex items-center gap-2 px-2.5 py-2 rounded-lg text-left text-xs transition-all cursor-pointer ${
                                          isLightMode ? 'hover:bg-slate-50 text-slate-800' : 'hover:bg-white/5 text-white'
                                        }`}
                                      >
                                        <UserPlus className="h-3.5 w-3.5 text-emerald-400" />
                                        <span>{t.addMemberBtn}</span>
                                      </button>

                                      <div className={`h-[1px] my-1 ${isLightMode ? 'bg-slate-100' : 'bg-white/5'}`} />

                                      <button
                                        type="button"
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          setActiveRoomDropdown(null);
                                          setShowShutdownRoomModal(r);
                                        }}
                                        className={`w-full flex items-center gap-2 px-2.5 py-2 rounded-lg text-left text-xs font-semibold transition-all cursor-pointer text-red-500 ${
                                          isLightMode ? 'hover:bg-red-50' : 'hover:bg-red-500/10'
                                        }`}
                                      >
                                        <Trash2 className="h-3.5 w-3.5" />
                                        <span>{t.shutdownRoomBtn}</span>
                                      </button>
                                    </>
                                  )}
                                </div>
                              </>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Alias */}
                      {r.alias && (
                        <p className={`text-xs font-mono select-all mb-2 ${isLightMode ? 'text-purple-600' : 'text-purple-400'}`}>{r.alias}</p>
                      )}

                      {/* Topic */}
                      <p className={`text-xs line-clamp-2 min-h-[32px] mb-4 ${isLightMode ? 'text-slate-600' : 'text-gray-400'}`}>
                        {r.topic || <span className="italic opacity-60">No topic assigned for this room.</span>}
                      </p>

                      {/* Meta stats */}
                      <div className={`grid grid-cols-3 gap-2 border-t border-b py-2.5 mb-2 text-xs font-mono ${
                        isLightMode 
                          ? 'border-slate-100 text-slate-600 bg-slate-50/50 rounded-xl px-2' 
                          : 'border-white/5 text-gray-400'
                      }`}>
                        <div>
                          <span className={`block text-[10px] uppercase ${isLightMode ? 'text-slate-400' : 'text-gray-500'}`}>{t.roomCreator}</span>
                          <span className={`truncate block font-medium max-w-full select-all ${isLightMode ? 'text-slate-700' : 'text-gray-300'}`}>{r.creator}</span>
                        </div>
                        <div className={`text-center border-l border-r ${isLightMode ? 'border-slate-200/60' : 'border-white/5'}`}>
                          <span className={`block text-[10px] uppercase ${isLightMode ? 'text-slate-400' : 'text-gray-500'}`}>{t.roomMembers}</span>
                          <span className="block text-indigo-600 dark:text-indigo-300 font-bold">{r.membersCount}</span>
                        </div>
                        <div className="text-right">
                          <span className={`block text-[10px] uppercase ${isLightMode ? 'text-slate-400' : 'text-gray-500'}`}>{t.roomVersion}</span>
                          <span className={`block font-medium ${isLightMode ? 'text-slate-700' : 'text-gray-300'}`}>{r.version}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </motion.div>
        )}

        {/* TAB 3: MEDIA */}
        {activeTab === 'media' && (
          <motion.div
            key="media-tab"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            className="space-y-6"
          >
            {/* Quick Analytics & Stats widgets */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-black/40 border border-white/5 rounded-xl p-5 flex items-center gap-4">
                <div className="p-3 bg-amber-500/10 rounded-lg text-amber-400 border border-amber-500/15">
                  <Sliders className="h-6 w-6" />
                </div>
                <div>
                  <span className="block text-xs font-mono text-gray-500 uppercase">{t.totalFiles}</span>
                  <span className="block text-2xl font-bold font-mono text-gray-100">{totalFilesCount}</span>
                </div>
              </div>

              <div className="bg-black/40 border border-white/5 rounded-xl p-5 flex items-center gap-4">
                <div className="p-3 bg-orange-500/10 rounded-lg text-orange-400 border border-orange-500/15">
                  <HardDrive className="h-6 w-6" />
                </div>
                <div>
                  <span className="block text-xs font-mono text-gray-500 uppercase">{t.remoteCacheSize}</span>
                  <span className="block text-2xl font-bold font-mono text-amber-300">{totalCachedSizeMB} MB</span>
                </div>
              </div>

              <div className="bg-black/40 border border-white/5 rounded-xl p-5 flex items-center gap-4">
                <div className="p-3 bg-indigo-500/10 rounded-lg text-indigo-400 border border-indigo-500/15">
                  <FolderSync className="h-6 w-6" />
                </div>
                <div>
                  <span className="block text-xs font-mono text-gray-500 uppercase">{t.localFilesSize}</span>
                  <span className="block text-2xl font-bold font-mono text-indigo-300">{totalLocalSizeMB} MB</span>
                </div>
              </div>
            </div>

            {/* Bulk actions panel */}
            {hasWriteAccess && (
              <div className="bg-black/20 border border-white/5 rounded-xl p-5 space-y-4">
                <h4 className="font-semibold text-gray-200 text-sm flex items-center gap-2 border-b border-white/5 pb-2">
                  <ShieldAlert className="h-4 w-4 text-amber-400" />
                  <span>Interactive Cleanup Controls</span>
                </h4>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 text-sm">
                  {/* Option 1: purge remote cache */}
                  <div className="bg-black/40 border border-white/5 p-4 rounded-xl flex flex-col justify-between">
                    <div>
                      <h5 className="font-medium text-amber-300 mb-1">{t.cleanupCacheBtn}</h5>
                      <p className="text-xs text-gray-400 mb-4">Cleans up remote files that haven't been accessed in a while from Synapse cache storage.</p>
                    </div>
                    <button
                      onClick={() => handleBulkMediaCleanup('remote_cache')}
                      className="w-full text-center py-2 bg-amber-600/15 hover:bg-amber-600/25 border border-amber-500/30 hover:border-amber-500/50 text-amber-300 rounded-lg font-medium transition-all duration-200"
                    >
                      Purge Remote Cache
                    </button>
                  </div>

                  {/* Option 2: Purge by Age */}
                  <div className="bg-black/40 border border-white/5 p-4 rounded-xl flex flex-col justify-between">
                    <div>
                      <h5 className="font-medium text-orange-300 mb-1">{t.cleanupAgeBtn}</h5>
                      <p className="text-xs text-gray-400 mb-3">Removes all media uploads (both local & remote cache) that are older than specified age.</p>
                      <div className="flex items-center gap-2 mb-4">
                        <input
                          type="number"
                          value={cleanupDays}
                          onChange={(e) => setCleanupDays(e.target.value)}
                          className="w-20 bg-slate-900 border border-white/5 rounded px-2.5 py-1 text-center font-mono text-gray-200 text-xs focus:outline-none focus:border-orange-500"
                        />
                        <span className="text-xs text-gray-400">{t.cleanupAgeDays}</span>
                      </div>
                    </div>
                    <button
                      onClick={() => handleBulkMediaCleanup('by_age')}
                      className="w-full text-center py-2 bg-orange-600/15 hover:bg-orange-600/25 border border-orange-500/30 hover:border-orange-500/50 text-orange-300 rounded-lg font-medium transition-all duration-200"
                    >
                      Delete Old Media
                    </button>
                  </div>

                  {/* Option 3: Purge by Domain */}
                  <div className="bg-black/40 border border-white/5 p-4 rounded-xl flex flex-col justify-between">
                    <div>
                      <h5 className="font-medium text-red-300 mb-1">{t.cleanupDomainBtn}</h5>
                      <p className="text-xs text-gray-400 mb-3">Purges all federated media cached from a specific remote Matrix homeserver domain.</p>
                      <input
                        type="text"
                        value={cleanupDomain}
                        onChange={(e) => setCleanupDomain(e.target.value)}
                        placeholder={t.domainPlaceholder}
                        className="w-full bg-slate-900 border border-white/5 rounded px-2.5 py-1.5 font-mono text-gray-200 text-xs focus:outline-none focus:border-red-500 mb-4"
                      />
                    </div>
                    <button
                      onClick={() => handleBulkMediaCleanup('by_domain')}
                      className="w-full text-center py-2 bg-red-600/15 hover:bg-red-600/25 border border-red-500/30 hover:border-red-500/50 text-red-300 rounded-lg font-medium transition-all duration-200"
                    >
                      Purge Domain Media
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Media Table */}
            <div className="space-y-4">
              <div className="flex flex-col xl:flex-row gap-4 justify-between items-stretch xl:items-center">
                <div className="flex items-center gap-2">
                  <h4 className="font-semibold text-gray-200 text-sm font-sans">{t.mediaTableTitle}</h4>
                  <span className="text-xs font-mono text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20">
                    {filteredMedia.length} / {media.length}
                  </span>
                </div>

                <div className="flex flex-wrap gap-2.5 items-center">
                  {/* Format Filter Tabs */}
                  <div className="flex bg-black/40 border border-white/5 p-1 rounded-lg text-xs font-mono">
                    <button
                      onClick={() => setMediaFormatFilter('all')}
                      className={`px-2.5 py-1 rounded transition-colors ${
                        mediaFormatFilter === 'all' ? 'bg-amber-500/20 text-amber-300 font-bold' : 'text-gray-400 hover:text-gray-200'
                      }`}
                    >
                      {isRtl ? 'همه فرمت‌ها' : 'All Formats'}
                    </button>
                    <button
                      onClick={() => setMediaFormatFilter('image')}
                      className={`px-2.5 py-1 rounded transition-colors flex items-center gap-1 ${
                        mediaFormatFilter === 'image' ? 'bg-emerald-500/20 text-emerald-300 font-bold' : 'text-gray-400 hover:text-gray-200'
                      }`}
                    >
                      <ImageIcon className="h-3 w-3" />
                      <span>{isRtl ? 'تصاویر' : 'Images'}</span>
                    </button>
                    <button
                      onClick={() => setMediaFormatFilter('document')}
                      className={`px-2.5 py-1 rounded transition-colors flex items-center gap-1 ${
                        mediaFormatFilter === 'document' ? 'bg-blue-500/20 text-blue-300 font-bold' : 'text-gray-400 hover:text-gray-200'
                      }`}
                    >
                      <FileText className="h-3 w-3" />
                      <span>{isRtl ? 'اسناد / PDF' : 'Docs & PDF'}</span>
                    </button>
                    <button
                      onClick={() => setMediaFormatFilter('audio_video')}
                      className={`px-2.5 py-1 rounded transition-colors flex items-center gap-1 ${
                        mediaFormatFilter === 'audio_video' ? 'bg-purple-500/20 text-purple-300 font-bold' : 'text-gray-400 hover:text-gray-200'
                      }`}
                    >
                      <Video className="h-3 w-3" />
                      <span>{isRtl ? 'صدا و ویدیو' : 'Media / Audio'}</span>
                    </button>
                    <button
                      onClick={() => setMediaFormatFilter('archive')}
                      className={`px-2.5 py-1 rounded transition-colors flex items-center gap-1 ${
                        mediaFormatFilter === 'archive' ? 'bg-yellow-500/20 text-yellow-300 font-bold' : 'text-gray-400 hover:text-gray-200'
                      }`}
                    >
                      <Archive className="h-3 w-3" />
                      <span>{isRtl ? 'آرشیو / زیپ' : 'Archives'}</span>
                    </button>
                  </div>

                  {/* Origin filter select */}
                  <select
                    value={mediaOriginFilter}
                    onChange={(e) => setMediaOriginFilter(e.target.value as any)}
                    className="bg-black/40 border border-white/5 rounded-lg py-1.5 px-3 text-xs font-mono text-gray-200 outline-none hover:border-amber-500/30"
                  >
                    <option value="all">{isRtl ? 'همه منبع‌ها' : 'All Origins'}</option>
                    <option value="local">{isRtl ? 'فایل‌های محلی' : 'Local Files'}</option>
                    <option value="remote">{isRtl ? 'کاش ریموت' : 'Remote Cache'}</option>
                  </select>

                  {/* Uploader filter select */}
                  <select
                    value={mediaUserFilter}
                    onChange={(e) => setMediaUserFilter(e.target.value)}
                    className="bg-black/40 border border-white/5 rounded-lg py-1.5 px-3 text-xs font-mono text-gray-200 outline-none hover:border-amber-500/30 max-w-[160px] truncate"
                  >
                    <option value="all">{isRtl ? 'همه آپلودکننده‌ها' : 'All Uploaders'}</option>
                    {Array.from(new Set(media.map(m => m.uploadedBy))).map(user => (
                      <option key={user} value={user}>{user}</option>
                    ))}
                  </select>

                  {/* Search bar */}
                  <div className="relative min-w-[200px]">
                    <Search className={`absolute top-2.5 ${isRtl ? 'left-3' : 'right-3'} h-4 w-4 text-gray-500`} />
                    <input
                      type="text"
                      value={mediaSearch}
                      onChange={(e) => setMediaSearch(e.target.value)}
                      placeholder={t.searchMedia}
                      className="w-full bg-black/40 border border-white/5 hover:border-amber-500/30 focus:border-amber-500/80 rounded-lg py-1.5 px-4 text-xs font-sans text-gray-200 outline-none transition-all duration-300"
                    />
                  </div>
                </div>
              </div>

              <div className="bg-black/30 backdrop-blur-md rounded-xl border border-white/5 overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="border-b border-white/5 bg-black/30 text-gray-400 text-xs uppercase tracking-wider font-mono">
                        <th className="py-3 px-4 text-center w-14">#</th>
                        <th className={`py-3 px-4 ${isRtl ? 'text-right' : 'text-left'}`}>{t.fileName}</th>
                        <th className={`py-3 px-4 ${isRtl ? 'text-right' : 'text-left'}`}>MXC ID</th>
                        <th className="py-3 px-4 text-center">{t.fileSize}</th>
                        <th className={`py-3 px-4 ${isRtl ? 'text-right' : 'text-left'}`}>{t.uploadedBy}</th>
                        <th className="py-3 px-4 text-center">{t.origin}</th>
                        <th className="py-3 px-4 text-center w-32">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5 text-sm font-medium">
                      {filteredMedia.length === 0 ? (
                        <tr>
                          <td colSpan={7} className="py-10 text-center text-gray-500 font-mono">
                            No stored media files matching search parameters.
                          </td>
                        </tr>
                      ) : (
                        filteredMedia.map((m, i) => (
                          <tr key={m.id} className="hover:bg-white/5 transition-all duration-200">
                            <td className="py-3 px-4 text-center font-mono text-gray-500">{i + 1}</td>
                            <td className={`py-3 px-4 text-gray-200 ${isRtl ? 'text-right' : 'text-left'}`}>
                              <div className="flex items-center gap-2">
                                {getMediaFormatIcon(m.mimeType, m.fileName)}
                                <div className="min-w-0">
                                  <span className="block font-sans max-w-[180px] truncate text-xs font-semibold text-gray-200" title={m.fileName || 'unnamed'}>
                                    {m.fileName || <span className="italic text-gray-500 text-xs">unnamed</span>}
                                  </span>
                                  <span className="block text-[10px] text-gray-500 font-mono truncate">{m.mimeType}</span>
                                </div>
                              </div>
                            </td>
                            <td className={`py-3 px-4 text-purple-400 font-mono select-all text-xs max-w-[160px] truncate ${isRtl ? 'text-right' : 'text-left'}`} title={m.id}>
                              {m.id}
                            </td>
                            <td className="py-3 px-4 text-center font-mono text-gray-300 text-xs">
                              {(m.fileSize / 1024 / 1024).toFixed(2)} MB
                            </td>
                            <td className={`py-3 px-4 text-gray-400 font-mono truncate text-xs ${isRtl ? 'text-right' : 'text-left'}`} title={m.uploadedBy}>
                              {m.uploadedBy}
                            </td>
                            <td className="py-3 px-4 text-center">
                              <span className={`inline-flex px-1.5 py-0.5 rounded text-[10px] font-mono font-medium ${
                                m.isCached 
                                  ? 'bg-orange-500/5 text-orange-400 border border-orange-500/10' 
                                  : 'bg-indigo-500/5 text-indigo-400 border border-indigo-500/10'
                              }`}>
                                {m.isCached ? t.originRemote : t.originLocal}
                              </span>
                            </td>
                            <td className="py-3 px-4 text-center">
                              <div className="flex items-center justify-center gap-1.5">
                                <button
                                  onClick={() => handleDownloadMediaFile(m)}
                                  className="p-1.5 text-emerald-400 hover:text-emerald-300 hover:bg-emerald-500/10 border border-transparent hover:border-emerald-500/20 rounded transition-all duration-200"
                                  title={isRtl ? 'دانلود فایل' : 'Download file'}
                                >
                                  <Download className="h-4 w-4" />
                                </button>
                                {hasWriteAccess && (
                                  <button
                                    onClick={() => handlePurgeMediaFile(m.id)}
                                    className="p-1.5 text-red-400 hover:text-red-300 hover:bg-red-500/10 border border-transparent hover:border-red-500/20 rounded transition-all duration-200"
                                    title={t.purgeFileBtn}
                                  >
                                    <Trash2 className="h-4 w-4" />
                                  </button>
                                )}
                              </div>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* TAB 4: TOKENS */}
        {activeTab === 'tokens' && (
          <motion.div
            key="tokens-tab"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            className="space-y-6"
          >
            {/* Header banner explaining tokens */}
            <div className="bg-gradient-to-r from-emerald-600/10 to-teal-600/10 border border-emerald-500/20 p-5 rounded-xl flex items-start gap-4">
              <div className="p-3 bg-emerald-500/10 text-emerald-400 rounded-lg flex-shrink-0 border border-emerald-500/20">
                <Sparkles className="h-6 w-6" />
              </div>
              <div className="space-y-1 flex-1">
                <h4 className="font-semibold text-gray-200 text-sm leading-none">{t.tokensTitle}</h4>
                <p className="text-xs text-gray-400 leading-relaxed max-w-4xl">{t.tokensSubtitle}</p>
              </div>

              {hasWriteAccess && (
                <button
                  onClick={() => setShowCreateTokenModal(true)}
                  className="flex items-center gap-1.5 px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-medium text-xs rounded-lg transition-colors duration-200 shadow-md flex-shrink-0"
                  id="create-token-btn"
                >
                  <Plus className="h-3.5 w-3.5" />
                  <span>{t.createTokenBtn.split(' ')[0]}</span>
                </button>
              )}
            </div>

            {/* Tokens table/list */}
            <div className="bg-black/30 backdrop-blur-md rounded-xl border border-white/5 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-white/5 bg-black/30 text-gray-400 text-xs uppercase tracking-wider font-mono">
                      <th className="py-3 px-4 text-center w-14">#</th>
                      <th className={`py-3 px-4 ${isRtl ? 'text-right' : 'text-left'}`}>{t.tokenLabel}</th>
                      <th className="py-3 px-4 text-center">{t.usesAllowed}</th>
                      <th className="py-3 px-4 text-center">{t.usesCount}</th>
                      <th className={`py-3 px-4 ${isRtl ? 'text-right' : 'text-left'}`}>{t.expiryTime}</th>
                      <th className="py-3 px-4 text-center">{t.tokenStatus}</th>
                      <th className="py-3 px-4 text-center w-28">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5 text-sm font-medium">
                    {tokens.length === 0 ? (
                      <tr>
                        <td colSpan={7} className="py-10 text-center text-gray-500 font-mono">
                          No active registration tokens found.
                        </td>
                      </tr>
                    ) : (
                      tokens.map((tk, i) => {
                        const isExpired = tk.expiryTime && new Date(tk.expiryTime).getTime() < Date.now();
                        const isFull = tk.usesAllowed && tk.usesCount >= tk.usesAllowed;
                        const isTokenActive = tk.isActive && !isExpired && !isFull;

                        return (
                          <tr key={tk.token} className="hover:bg-white/5 transition-all duration-200">
                            <td className="py-3 px-4 text-center font-mono text-gray-500">{i + 1}</td>
                            <td className={`py-3 px-4 text-emerald-400 font-mono select-all text-sm font-semibold tracking-wide ${isRtl ? 'text-right' : 'text-left'}`}>
                              {tk.token}
                            </td>
                            <td className="py-3 px-4 text-center font-mono text-gray-300">
                              {tk.usesAllowed || <span className="opacity-50">{t.unlimited}</span>}
                            </td>
                            <td className="py-3 px-4 text-center font-mono text-indigo-300">
                              {tk.usesCount}
                            </td>
                            <td className={`py-3 px-4 font-mono text-gray-400 text-xs ${isRtl ? 'text-right' : 'text-left'}`}>
                              {tk.expiryTime ? new Date(tk.expiryTime).toLocaleString() : <span className="opacity-50">{t.neverExpired}</span>}
                            </td>
                            <td className="py-3 px-4 text-center">
                              <span className={`inline-flex px-1.5 py-0.5 rounded text-[10px] font-mono font-medium ${
                                isTokenActive 
                                  ? 'bg-emerald-500/5 text-emerald-400 border border-emerald-500/10' 
                                  : 'bg-red-500/5 text-red-400 border border-red-500/10'
                              }`}>
                                {isTokenActive ? t.active : t.expired}
                              </span>
                            </td>
                            <td className="py-3 px-4 text-center">
                              {hasWriteAccess ? (
                                <button
                                  onClick={() => handleRevokeToken(tk.token)}
                                  className="px-2 py-1 text-xs bg-red-600/10 hover:bg-red-600/20 text-red-400 border border-red-500/25 rounded transition-all duration-200 font-medium"
                                >
                                  {t.revokeBtn.split(' ')[0]}
                                </button>
                              ) : (
                                <span className="text-gray-600 font-mono">-</span>
                              )}
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </motion.div>
        )}

        {/* TAB 5: INSTALLER & SYSTEM MAINTENANCE */}
        {activeTab === 'installer' && (
          <motion.div
            key="installer-tab"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            transition={{ duration: 0.25 }}
            className="grid grid-cols-1 xl:grid-cols-3 gap-6 text-xs"
          >
            {/* Left Column: Form & Component Options */}
            <div className="xl:col-span-1 space-y-6">
              {/* Configuration Panel */}
              <div className={`p-5 rounded-2xl border ${
                isLightMode ? 'bg-white border-slate-200 shadow-sm' : 'bg-slate-900/50 border-white/5'
              }`}>
                <div className="flex items-center gap-2 mb-4 border-b pb-3">
                  <Sliders className="h-5 w-5 text-indigo-400 animate-pulse" />
                  <h3 className={`font-bold text-sm ${isLightMode ? 'text-slate-800' : 'text-gray-100'}`}>
                    {isRtl ? 'تنظیمات اولیه پشته ماتریکس' : 'Matrix Stack Initial Settings'}
                  </h3>
                </div>

                <div className="space-y-4">
                  {/* HS Domain */}
                  <div className="space-y-1">
                    <label className={`block font-semibold ${isLightMode ? 'text-slate-600' : 'text-gray-300'}`}>
                      {isRtl ? 'دامنه سرور ماتریکس (HS_DOMAIN)' : 'Homeserver Domain (HS_DOMAIN)'}
                    </label>
                    <input
                      type="text"
                      value={installerConfig.HS_DOMAIN || ''}
                      onChange={(e) => setInstallerConfig((prev: any) => ({ ...prev, HS_DOMAIN: e.target.value }))}
                      placeholder="e.g. matrix.company.local"
                      className={`w-full border rounded-lg p-2.5 outline-none font-mono transition-colors duration-200 ${
                        isLightMode 
                          ? 'bg-white border-slate-300 text-slate-800 focus:border-indigo-500' 
                          : 'bg-black/40 border-white/5 text-gray-200 focus:border-indigo-500'
                      }`}
                    />
                  </div>

                  {/* Element Domain */}
                  <div className="space-y-1">
                    <label className={`block font-semibold ${isLightMode ? 'text-slate-600' : 'text-gray-300'}`}>
                      {isRtl ? 'دامنه کلاینت المنت (ELEMENT_DOMAIN)' : 'Element Client Domain (ELEMENT_DOMAIN)'}
                    </label>
                    <input
                      type="text"
                      value={installerConfig.ELEMENT_DOMAIN || ''}
                      onChange={(e) => setInstallerConfig((prev: any) => ({ ...prev, ELEMENT_DOMAIN: e.target.value }))}
                      placeholder="e.g. chat.company.local"
                      className={`w-full border rounded-lg p-2.5 outline-none font-mono transition-colors duration-200 ${
                        isLightMode 
                          ? 'bg-white border-slate-300 text-slate-800 focus:border-indigo-500' 
                          : 'bg-black/40 border-white/5 text-gray-200 focus:border-indigo-500'
                      }`}
                    />
                  </div>

                  {/* Base Domain */}
                  <div className="space-y-1">
                    <label className={`block font-semibold ${isLightMode ? 'text-slate-600' : 'text-gray-300'}`}>
                      {isRtl ? 'دامنه پایه (BASE_DOMAIN)' : 'Base Domain (BASE_DOMAIN)'}
                    </label>
                    <input
                      type="text"
                      value={installerConfig.BASE_DOMAIN || ''}
                      onChange={(e) => setInstallerConfig((prev: any) => ({ ...prev, BASE_DOMAIN: e.target.value }))}
                      placeholder="e.g. company.local"
                      className={`w-full border rounded-lg p-2.5 outline-none font-mono transition-colors duration-200 ${
                        isLightMode 
                          ? 'bg-white border-slate-300 text-slate-800 focus:border-indigo-500' 
                          : 'bg-black/40 border-white/5 text-gray-200 focus:border-indigo-500'
                      }`}
                    />
                  </div>

                  {/* Public IP */}
                  <div className="space-y-1">
                    <label className={`block font-semibold ${isLightMode ? 'text-slate-600' : 'text-gray-300'}`}>
                      {isRtl ? 'آدرس آی‌پی عمومی سرور' : 'Public IP Address'}
                    </label>
                    <input
                      type="text"
                      value={installerConfig.PUBLIC_IP || ''}
                      onChange={(e) => setInstallerConfig((prev: any) => ({ ...prev, PUBLIC_IP: e.target.value }))}
                      placeholder="e.g. 192.168.1.100"
                      className={`w-full border rounded-lg p-2.5 outline-none font-mono transition-colors duration-200 ${
                        isLightMode 
                          ? 'bg-white border-slate-300 text-slate-800 focus:border-indigo-500' 
                          : 'bg-black/40 border-white/5 text-gray-200 focus:border-indigo-500'
                      }`}
                    />
                  </div>

                  {/* Let's Encrypt Email */}
                  <div className="space-y-1">
                    <label className={`block font-semibold ${isLightMode ? 'text-slate-600' : 'text-gray-300'}`}>
                      {isRtl ? 'ایمیل مدیر برای گواهی SSL' : 'SSL Cert Admin Email (LE_EMAIL)'}
                    </label>
                    <input
                      type="email"
                      value={installerConfig.LE_EMAIL || ''}
                      onChange={(e) => setInstallerConfig((prev: any) => ({ ...prev, LE_EMAIL: e.target.value }))}
                      placeholder="e.g. admin@company.local"
                      className={`w-full border rounded-lg p-2.5 outline-none font-mono transition-colors duration-200 ${
                        isLightMode 
                          ? 'bg-white border-slate-300 text-slate-800 focus:border-indigo-500' 
                          : 'bg-black/40 border-white/5 text-gray-200 focus:border-indigo-500'
                      }`}
                    />
                  </div>
                </div>
              </div>

              {/* Component Toggles */}
              <div className={`p-5 rounded-2xl border space-y-4 ${
                isLightMode ? 'bg-white border-slate-200 shadow-sm' : 'bg-slate-900/50 border-white/5'
              }`}>
                <div className="flex items-center gap-2 border-b pb-3">
                  <Layers className="h-5 w-5 text-purple-400" />
                  <h3 className={`font-bold text-sm ${isLightMode ? 'text-slate-800' : 'text-gray-100'}`}>
                    {isRtl ? 'انتخاب اجزای پشته ماتریکس' : 'Matrix Stack Component Selection'}
                  </h3>
                </div>

                <div className="space-y-2.5">
                  {[
                    { id: 'synapse', name: 'Synapse Core Server', desc: 'Python-based Matrix main daemon' },
                    { id: 'element', name: 'Element Web Client', desc: 'HTML/JS static instant messaging web client' },
                    { id: 'postgres', name: 'PostgreSQL Database', desc: 'Secure relational database for system events' },
                    { id: 'coturn', name: 'Coturn TURN Server', desc: 'STUN/TURN voice/video calling media relay' },
                    { id: 'nginx', name: 'Nginx Reverse Proxy', desc: 'SSL termination and port 80/443 routing upstream' }
                  ].map(comp => (
                    <div 
                      key={comp.id}
                      onClick={() => {
                        if (selectedComponents.includes(comp.id)) {
                          setSelectedComponents(prev => prev.filter(c => c !== comp.id));
                        } else {
                          setSelectedComponents(prev => [...prev, comp.id]);
                        }
                      }}
                      className={`flex items-start gap-3 p-3 rounded-xl border cursor-pointer transition-all duration-200 ${
                        selectedComponents.includes(comp.id)
                          ? isLightMode 
                            ? 'bg-purple-50/50 border-purple-300/60 text-purple-900' 
                            : 'bg-purple-950/20 border-purple-500/30 text-purple-200'
                          : isLightMode 
                            ? 'bg-slate-50 border-slate-200 text-slate-500 hover:border-slate-300' 
                            : 'bg-black/20 border-white/5 text-gray-500 hover:border-white/10'
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={selectedComponents.includes(comp.id)}
                        onChange={() => {}} // handled by click-container
                        className="h-4 w-4 text-purple-600 rounded focus:ring-0 mt-0.5"
                      />
                      <div>
                        <div className="font-semibold">{comp.name}</div>
                        <div className={`text-[10px] ${isLightMode ? 'text-slate-500' : 'text-gray-500'}`}>{comp.desc}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Right Column: Execution Terminal & Information */}
            <div className="xl:col-span-2 space-y-6 flex flex-col justify-between">
              {/* Terminal View Container */}
              <div className={`p-5 rounded-2xl border flex-1 flex flex-col min-h-[480px] ${
                isLightMode ? 'bg-slate-900 border-slate-900 text-slate-100 shadow-lg' : 'bg-slate-950 border-white/5 text-slate-100'
              }`}>
                {/* Terminal Header */}
                <div className="flex items-center justify-between border-b border-white/10 pb-3 mb-4 shrink-0">
                  <div className="flex items-center gap-3">
                    <div className="flex gap-1.5">
                      <span className="w-3 h-3 rounded-full bg-red-500 block"></span>
                      <span className="w-3 h-3 rounded-full bg-yellow-500 block"></span>
                      <span className="w-3 h-3 rounded-full bg-green-500 block"></span>
                    </div>
                    <span className="text-xs font-mono text-slate-400">root@synapse-installer-panel:~</span>
                  </div>

                  <div className="flex items-center gap-2">
                    {/* Installer Mode Toggle */}
                    <div className="flex bg-slate-800 p-0.5 rounded-lg border border-white/5 text-[10px] font-mono select-none">
                      <button
                        onClick={() => setInstallerMode('online')}
                        className={`px-2.5 py-1 rounded-md transition-colors ${
                          installerMode === 'online' ? 'bg-indigo-600 text-white font-bold' : 'text-slate-400 hover:text-white'
                        }`}
                      >
                        ONLINE
                      </button>
                      <button
                        onClick={() => setInstallerMode('offline')}
                        className={`px-2.5 py-1 rounded-md transition-colors ${
                          installerMode === 'offline' ? 'bg-indigo-600 text-white font-bold' : 'text-slate-400 hover:text-white'
                        }`}
                      >
                        OFFLINE
                      </button>
                    </div>

                    <button
                      onClick={() => setInstallLogs(['# Console logs cleared.'])}
                      className="p-1 hover:bg-white/5 rounded text-slate-400 hover:text-white transition-colors"
                      title="Clear console"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>

                {/* Simulated Offline Cache Packages Box */}
                {installerMode === 'offline' && (
                  <div className="mb-4 p-3 bg-indigo-950/40 border border-indigo-500/20 rounded-xl flex items-center justify-between text-xs font-mono shrink-0">
                    <div className="flex items-center gap-2 text-indigo-300">
                      <HardDrive className="h-4 w-4 animate-pulse text-indigo-400" />
                      <span>{isRtl ? 'پکیج‌های کش شده در پوشه matrix_package معتبر است.' : 'Local packages cached in matrix_package are valid.'}</span>
                    </div>
                    <span className="text-[10px] bg-indigo-500/20 text-indigo-300 border border-indigo-500/20 px-2 py-0.5 rounded-full uppercase font-bold">Cache Active</span>
                  </div>
                )}

                {/* Terminal Logs Output */}
                <div className="flex-1 p-4 bg-black/40 rounded-xl font-mono text-[11px] leading-relaxed overflow-y-auto space-y-1.5 border border-white/5 min-h-[300px] max-h-[500px]">
                  {((logs && logs.length > 0) ? logs : installLogs).map((log, index) => {
                    let color = 'text-slate-300';
                    if (log.includes('✔') || log.includes('✅') || log.includes('SUCCESS') || log.includes('COMPLETED')) {
                      color = 'text-emerald-400 font-bold';
                    } else if (log.includes('❌') || log.includes('ERROR') || log.includes('Failed')) {
                      color = 'text-red-400 font-bold';
                    } else if (log.includes('⚠️') || log.includes('WARNING') || log.includes('[INFO]')) {
                      color = 'text-amber-400 font-semibold';
                    } else if (log.includes('[STEP') || log.includes('STEP')) {
                      color = 'text-cyan-400 font-semibold';
                    } else if (log.startsWith('#')) {
                      color = 'text-slate-500 italic';
                    }
                    return (
                      <div key={index} className={`whitespace-pre-wrap ${color}`}>
                        {log}
                      </div>
                    );
                  })}
                  {isInstalling && (
                    <div className="flex items-center gap-2 text-indigo-400 mt-2 font-semibold animate-pulse">
                      <RefreshCw className="h-3.5 w-3.5 animate-spin" />
                      <span>Streaming installation stdout...</span>
                    </div>
                  )}
                </div>

                {/* Operations Buttons */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mt-4 shrink-0">
                  <button
                    disabled={isInstalling || !hasWriteAccess}
                    onClick={() => runInstallerAction('custom_install')}
                    className={`flex items-center justify-center gap-2 py-3 px-4 rounded-xl text-xs font-bold transition-all duration-200 shadow-md ${
                      isInstalling 
                        ? 'bg-slate-800 text-slate-500 cursor-not-allowed'
                        : !hasWriteAccess
                          ? 'bg-red-500/10 text-red-400 border border-red-500/10 cursor-not-allowed'
                          : 'bg-emerald-600 hover:bg-emerald-500 text-white hover:scale-[1.01] active:scale-[0.99]'
                    }`}
                  >
                    <Zap className={`h-4 w-4 ${isInstalling ? 'animate-bounce' : ''}`} />
                    <span>{isRtl ? 'شروع نصب و پیکربندی' : 'Launch Custom Install'}</span>
                  </button>

                  <button
                    disabled={isInstalling || !hasWriteAccess}
                    onClick={() => {
                      const msg = isRtl 
                        ? 'آیا از راه اندازی مجدد دیتابیس اطمینان دارید؟ تمام جداول ماتریکس پاکسازی خواهد شد.' 
                        : 'Are you absolutely sure you want to wipe the relational database? This deletes all Matrix tables!';
                      if (window.confirm(msg)) {
                        runInstallerAction('purge_database');
                      }
                    }}
                    className={`flex items-center justify-center gap-2 py-3 px-4 rounded-xl text-xs font-bold border transition-all duration-200 ${
                      isInstalling 
                        ? 'bg-slate-800 text-slate-500 cursor-not-allowed border-transparent'
                        : !hasWriteAccess
                          ? 'border-red-500/10 text-red-400 bg-red-500/5 cursor-not-allowed'
                          : 'border-amber-500/30 bg-amber-500/10 text-amber-400 hover:bg-amber-500/20 active:scale-[0.99]'
                    }`}
                  >
                    <RefreshCw className="h-4 w-4" />
                    <span>{isRtl ? 'پاکسازی کامل دیتابیس' : 'Wipe Database Tables'}</span>
                  </button>

                  <button
                    disabled={isInstalling || !hasWriteAccess}
                    onClick={() => {
                      const msg = isRtl 
                        ? 'آیا از حذف کامل پشته ماتریکس اطمینان دارید؟ تمامی پکیج‌ها و تنظیمات حذف خواهند شد.' 
                        : 'Are you absolutely sure you want to completely uninstall the Matrix stack? This purges all configurations and packages!';
                      if (window.confirm(msg)) {
                        runInstallerAction('uninstall_stack');
                      }
                    }}
                    className={`flex items-center justify-center gap-2 py-3 px-4 rounded-xl text-xs font-bold border transition-all duration-200 ${
                      isInstalling 
                        ? 'bg-slate-800 text-slate-500 cursor-not-allowed border-transparent'
                        : !hasWriteAccess
                          ? 'border-red-500/10 text-red-400 bg-red-500/5 cursor-not-allowed'
                          : 'border-red-500/30 bg-red-500/10 text-red-400 hover:bg-red-500/20 active:scale-[0.99]'
                    }`}
                  >
                    <Trash2 className="h-4 w-4" />
                    <span>{isRtl ? 'حذف کامل کل پشته' : 'Uninstall Entire Stack'}</span>
                  </button>
                </div>
              </div>

              {/* Documentation / Guidance Card */}
              <div className={`p-5 rounded-2xl border space-y-4 ${
                isLightMode ? 'bg-white border-slate-200 shadow-sm text-slate-700' : 'bg-slate-900/50 border-white/5 text-gray-300'
              }`}>
                <div className="flex items-center gap-2 border-b pb-3">
                  <FileText className="h-5 w-5 text-indigo-400" />
                  <h4 className={`font-bold text-sm ${isLightMode ? 'text-slate-800' : 'text-gray-100'}`}>
                    {isRtl ? 'راهنمای راه‌اندازی و سیستم توزیع آفلاین' : 'DNS & Offline Installation Guild'}
                  </h4>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-[11px]">
                  <div className="space-y-2">
                    <h5 className="font-bold text-indigo-400 uppercase tracking-wider">DNS Records Layout</h5>
                    <ul className="list-disc pl-4 space-y-1 leading-relaxed">
                      <li><strong>A Record:</strong> <code className="font-mono bg-black/40 px-1.5 py-0.5 rounded text-indigo-300">chat.company.local</code> → Server IP</li>
                      <li><strong>A Record:</strong> <code className="font-mono bg-black/40 px-1.5 py-0.5 rounded text-indigo-300">matrix.company.local</code> → Server IP</li>
                      <li><strong>SRV Record:</strong> <code className="font-mono bg-black/40 px-1.5 py-0.5 rounded text-indigo-300">_matrix._tcp</code> (priority 10, weight 0, port 8448, target matrix)</li>
                    </ul>
                  </div>

                  <div className="space-y-2">
                    <h5 className="font-bold text-purple-400 uppercase tracking-wider">Port Bindings Required</h5>
                    <ul className="list-disc pl-4 space-y-1 leading-relaxed">
                      <li><strong>Port 80 & 443:</strong> HTTP/HTTPS Web Client & Reverse Proxy Routing</li>
                      <li><strong>Port 8448:</strong> Matrix Federation server communication channel</li>
                      <li><strong>Port 3478 (UDP/TCP):</strong> Coturn STUN/TURN voice/video calling media relay</li>
                      <li><strong>Port 5349 (TLS):</strong> Secure voice/video transport channel</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}


      </AnimatePresence>

      {/* ========================================== */}
      {/* MODAL 1: ADD MATRIX USER */}
      {/* ========================================== */}
      <AnimatePresence>
        {showAddUserModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="w-full max-w-md p-6 rounded-2xl relative space-y-4 spatial-glass"
              id="add-user-modal"
            >
              <button
                onClick={() => setShowAddUserModal(false)}
                className={`absolute top-4 right-4 transition-colors duration-200 ${
                  isLightMode ? 'text-slate-400 hover:text-slate-800' : 'text-gray-400 hover:text-white'
                }`}
              >
                <X className="h-5 w-5" />
              </button>

              <h3 className={`text-lg font-bold flex items-center gap-2 border-b pb-2 ${
                isLightMode ? 'text-slate-800 border-slate-200' : 'text-gray-100 border-white/5'
              }`}>
                <UserPlus className="h-5 w-5 text-indigo-500" />
                <span>{t.addUserBtn}</span>
              </h3>

              <form onSubmit={handleRegisterUser} className="space-y-4 text-sm font-medium">
                <div className="space-y-1">
                  <label className={`block text-xs ${isLightMode ? 'text-slate-500' : 'text-gray-400'}`}>{t.username}</label>
                  <input
                    type="text"
                    value={newUser.username}
                    onChange={(e) => setNewUser(prev => ({ ...prev, username: e.target.value }))}
                    placeholder="e.g. masoud"
                    required
                    className={`w-full border focus:border-indigo-500 rounded-lg p-2.5 outline-none font-mono text-xs transition-colors duration-200 ${
                      isLightMode 
                        ? 'bg-white border-slate-300 text-slate-800' 
                        : 'bg-black/40 border-white/5 text-gray-200'
                    }`}
                  />
                </div>

                <div className="space-y-1">
                  <label className={`block text-xs ${isLightMode ? 'text-slate-500' : 'text-gray-400'}`}>{t.passwordLabel}</label>
                  <input
                    type="password"
                    value={newUser.password}
                    onChange={(e) => setNewUser(prev => ({ ...prev, password: e.target.value }))}
                    required
                    className={`w-full border focus:border-indigo-500 rounded-lg p-2.5 outline-none font-mono text-xs transition-colors duration-200 ${
                      isLightMode 
                        ? 'bg-white border-slate-300 text-slate-800' 
                        : 'bg-black/40 border-white/5 text-gray-200'
                    }`}
                  />
                </div>

                <div className={`flex items-center gap-3 p-3 rounded-lg border mt-2 ${
                  isLightMode ? 'bg-slate-100 border-slate-200' : 'bg-black/30 border-white/5'
                }`}>
                  <input
                    type="checkbox"
                    id="user-is-admin-cb"
                    checked={newUser.isAdmin}
                    onChange={(e) => setNewUser(prev => ({ ...prev, isAdmin: e.target.checked }))}
                    className={`h-4 w-4 rounded focus:ring-0 ${
                      isLightMode ? 'border-slate-300 bg-white text-indigo-600' : 'border-white/10 bg-slate-900 text-indigo-600'
                    }`}
                  />
                  <label htmlFor="user-is-admin-cb" className={`text-xs leading-tight select-none ${
                    isLightMode ? 'text-slate-700' : 'text-gray-300'
                  }`}>
                    {t.makeAdminLabel}
                  </label>
                </div>

                <div className={`flex justify-end gap-2 border-t pt-4 mt-2 ${
                  isLightMode ? 'border-slate-200' : 'border-white/5'
                }`}>
                  <button
                    type="button"
                    onClick={() => setShowAddUserModal(false)}
                    className={`px-4 py-2 rounded-lg text-xs transition-colors duration-200 ${
                      isLightMode 
                        ? 'bg-slate-200 hover:bg-slate-300 text-slate-700' 
                        : 'bg-slate-800 hover:bg-slate-700 text-gray-300'
                    }`}
                  >
                    {t.cancel}
                  </button>
                  <button
                    type="submit"
                    disabled={isRegisteringUser}
                    className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white rounded-lg text-xs transition-colors duration-200 shadow-md flex items-center gap-2 font-medium"
                  >
                    {isRegisteringUser ? (
                      <>
                        <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                        <span>{isRtl ? 'در حال ثبت...' : 'Registering...'}</span>
                      </>
                    ) : (
                      <span>{t.addUserBtn}</span>
                    )}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </ AnimatePresence>

      {/* ========================================== */}
      {/* MODAL 2: REACTIVATE USER & RESET PASS */}
      {/* ========================================== */}
      <AnimatePresence>
        {showReactivateModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="w-full max-w-md p-6 rounded-2xl relative space-y-4 spatial-glass"
              id="reactivate-modal"
            >
              <button
                onClick={() => {
                  setShowReactivateModal(null);
                  setReactivatePass('');
                }}
                className={`absolute top-4 right-4 transition-colors duration-200 ${
                  isLightMode ? 'text-slate-400 hover:text-slate-800' : 'text-gray-400 hover:text-white'
                }`}
              >
                <X className="h-5 w-5" />
              </button>

              <h3 className={`text-lg font-bold flex items-center gap-2 border-b pb-2 ${
                isLightMode ? 'text-emerald-600 border-slate-200' : 'text-emerald-400 border-white/5'
              }`}>
                <RefreshCw className="h-5 w-5 animate-spin-slow text-emerald-500" />
                <span>Reactivate Matrix User</span>
              </h3>

              <p className={`text-xs font-mono ${isLightMode ? 'text-slate-500' : 'text-gray-400'}`}>
                MXID: <span className={isLightMode ? 'text-indigo-600 font-semibold' : 'text-indigo-300'}>{showReactivateModal}</span>
              </p>

              <form onSubmit={handleReactivateUser} className="space-y-4 text-sm font-medium">
                <div className="space-y-1">
                  <label className={`block text-xs ${isLightMode ? 'text-slate-500' : 'text-gray-400'}`}>{t.resetPasswordTitle}</label>
                  <input
                    type="password"
                    value={reactivatePass}
                    onChange={(e) => setReactivatePass(e.target.value)}
                    required
                    placeholder="Enter new account password"
                    className={`w-full border focus:border-emerald-500 rounded-lg p-2.5 outline-none font-mono text-xs transition-colors duration-200 ${
                      isLightMode 
                        ? 'bg-white border-slate-300 text-slate-800' 
                        : 'bg-black/40 border-white/5 text-gray-200'
                    }`}
                  />
                </div>

                <div className={`flex items-center gap-3 p-3 rounded-lg border mt-2 ${
                  isLightMode ? 'bg-slate-100 border-slate-200' : 'bg-black/30 border-white/5'
                }`}>
                  <input
                    type="checkbox"
                    id="reactivate-is-admin-cb"
                    checked={reactivateAdmin}
                    onChange={(e) => setReactivateAdmin(e.target.checked)}
                    className={`h-4 w-4 rounded focus:ring-0 ${
                      isLightMode ? 'border-slate-300 bg-white text-emerald-600' : 'border-white/10 bg-slate-900 text-emerald-600'
                    }`}
                  />
                  <label htmlFor="reactivate-is-admin-cb" className={`text-xs leading-tight select-none ${
                    isLightMode ? 'text-slate-700' : 'text-gray-300'
                  }`}>
                    {t.makeAdminLabel}
                  </label>
                </div>

                <div className={`flex justify-end gap-2 border-t pt-4 mt-2 ${
                  isLightMode ? 'border-slate-200' : 'border-white/5'
                }`}>
                  <button
                    type="button"
                    onClick={() => {
                      setShowReactivateModal(null);
                      setReactivatePass('');
                    }}
                    className={`px-4 py-2 rounded-lg text-xs transition-colors duration-200 ${
                      isLightMode 
                        ? 'bg-slate-200 hover:bg-slate-300 text-slate-700' 
                        : 'bg-slate-800 hover:bg-slate-700 text-gray-300'
                    }`}
                  >
                    {t.cancel}
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs transition-colors duration-200 shadow-md"
                  >
                    Reactivate Account
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ========================================== */}
      {/* MODAL 3: CREATE ROOM */}
      {/* ========================================== */}
      <AnimatePresence>
        {showCreateRoomModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="w-full max-w-md p-6 rounded-2xl relative space-y-4 spatial-glass"
              id="create-room-modal"
            >
              <button
                onClick={() => setShowCreateRoomModal(false)}
                className={`absolute top-4 right-4 transition-colors duration-200 ${
                  isLightMode ? 'text-slate-400 hover:text-slate-800' : 'text-gray-400 hover:text-white'
                }`}
              >
                <X className="h-5 w-5" />
              </button>

              <h3 className={`text-lg font-bold flex items-center gap-2 border-b pb-2 ${
                isLightMode ? 'text-purple-700 border-slate-200' : 'text-purple-400 border-white/5'
              }`}>
                <Plus className="h-5 w-5" />
                <span>{t.createRoomBtn}</span>
              </h3>

              <form onSubmit={handleCreateRoom} className="space-y-4 text-sm font-medium">
                <div className="space-y-1">
                  <label className={`block text-xs ${isLightMode ? 'text-slate-500' : 'text-gray-400'}`}>{t.roomNameLabel}</label>
                  <input
                    type="text"
                    value={newRoom.name}
                    onChange={(e) => setNewRoom(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="e.g. Sales Division"
                    required
                    className={`w-full border rounded-lg p-2.5 outline-none text-xs transition-colors duration-200 ${
                      isLightMode 
                        ? 'bg-white border-slate-300 text-slate-850 focus:border-purple-500' 
                        : 'bg-black/40 border-white/5 text-gray-200 focus:border-purple-500'
                    }`}
                  />
                </div>

                <div className="space-y-1">
                  <label className={`block text-xs ${isLightMode ? 'text-slate-500' : 'text-gray-400'}`}>{t.roomAliasLabel} (alias)</label>
                  <input
                    type="text"
                    value={newRoom.alias}
                    onChange={(e) => setNewRoom(prev => ({ ...prev, alias: e.target.value }))}
                    placeholder="e.g. sales (produces #sales:domain.com)"
                    className={`w-full border rounded-lg p-2.5 outline-none font-mono text-xs transition-colors duration-200 ${
                      isLightMode 
                        ? 'bg-white border-slate-300 text-slate-850 focus:border-purple-500' 
                        : 'bg-black/40 border-white/5 text-gray-200 focus:border-purple-500'
                    }`}
                  />
                </div>

                <div className="space-y-1">
                  <label className={`block text-xs ${isLightMode ? 'text-slate-500' : 'text-gray-400'}`}>{t.roomTopicLabel}</label>
                  <textarea
                    value={newRoom.topic}
                    onChange={(e) => setNewRoom(prev => ({ ...prev, topic: e.target.value }))}
                    placeholder="Optional topic statement"
                    rows={2}
                    className={`w-full border rounded-lg p-2.5 outline-none text-xs transition-colors duration-200 resize-none ${
                      isLightMode 
                        ? 'bg-white border-slate-300 text-slate-850 focus:border-purple-500' 
                        : 'bg-black/40 border-white/5 text-gray-200 focus:border-purple-500'
                    }`}
                  />
                </div>

                <div className={`flex flex-col gap-2.5 p-3 rounded-lg border text-xs ${
                  isLightMode ? 'bg-slate-100 border-slate-200' : 'bg-black/30 border-white/5'
                }`}>
                  <div className="flex items-center gap-3">
                    <input
                      type="checkbox"
                      id="room-public-cb"
                      checked={newRoom.isPublic}
                      onChange={(e) => setNewRoom(prev => ({ ...prev, isPublic: e.target.checked }))}
                      className={`h-4 w-4 rounded focus:ring-0 ${
                        isLightMode ? 'border-slate-300 text-purple-600 bg-white' : 'border-white/10 bg-slate-900 text-purple-600'
                      }`}
                    />
                    <label htmlFor="room-public-cb" className={`leading-tight select-none ${
                      isLightMode ? 'text-slate-700' : 'text-gray-300'
                    }`}>
                      {t.roomVisibilityLabel}
                    </label>
                  </div>

                  <div className={`flex items-center gap-3 border-t pt-2.5 ${
                    isLightMode ? 'border-slate-200' : 'border-white/5'
                  }`}>
                    <input
                      type="checkbox"
                      id="room-federated-cb"
                      checked={newRoom.isFederated}
                      onChange={(e) => setNewRoom(prev => ({ ...prev, isFederated: e.target.checked }))}
                      className={`h-4 w-4 rounded focus:ring-0 ${
                        isLightMode ? 'border-slate-300 text-purple-600 bg-white' : 'border-white/10 bg-slate-900 text-purple-600'
                      }`}
                    />
                    <label htmlFor="room-federated-cb" className={`leading-tight select-none ${
                      isLightMode ? 'text-slate-700' : 'text-gray-300'
                    }`}>
                      {t.roomFederationLabel}
                    </label>
                  </div>
                </div>

                <div className={`flex justify-end gap-2 border-t pt-4 mt-2 ${
                  isLightMode ? 'border-slate-200' : 'border-white/5'
                }`}>
                  <button
                    type="button"
                    onClick={() => setShowCreateRoomModal(false)}
                    className={`px-4 py-2 rounded-lg text-xs transition-colors duration-200 ${
                      isLightMode 
                        ? 'bg-slate-200 hover:bg-slate-300 text-slate-700' 
                        : 'bg-slate-800 hover:bg-slate-700 text-gray-300'
                    }`}
                  >
                    {t.cancel}
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-purple-600 hover:bg-purple-500 text-white rounded-lg text-xs transition-colors duration-200 shadow-md"
                  >
                    {t.createRoomBtn.split(' ')[0]}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ========================================== */}
      {/* MODAL 4: VIEW MEMBERS */}
      {/* ========================================== */}
      <AnimatePresence>
        {showRoomMembersModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="w-full max-w-lg p-6 rounded-2xl relative space-y-4 spatial-glass"
              id="room-members-modal"
            >
              <button
                onClick={() => {
                  setShowRoomMembersModal(null);
                  setMemberSearch('');
                }}
                className={`absolute top-4 right-4 transition-colors duration-200 ${
                  isLightMode ? 'text-slate-400 hover:text-slate-800' : 'text-gray-400 hover:text-white'
                }`}
              >
                <X className="h-5 w-5" />
              </button>

              <h3 className={`text-lg font-bold flex items-center gap-2 border-b pb-2 ${
                isLightMode ? 'text-slate-800 border-slate-200' : 'text-gray-100 border-white/5'
              }`}>
                <Users className="h-5 w-5 text-indigo-500" />
                <span>{t.memberList} ({showRoomMembersModal.joinedMembers.length})</span>
              </h3>

              <div className="flex justify-between items-center">
                <p className={`text-xs font-mono ${isLightMode ? 'text-purple-600 font-semibold' : 'text-purple-400'}`}>
                  {showRoomMembersModal.name}
                </p>
                {showRoomMembersModal.bannedMembers && showRoomMembersModal.bannedMembers.length > 0 && (
                  <span className="text-[10px] px-2 py-0.5 bg-red-500/10 text-red-400 border border-red-500/20 rounded-full font-semibold">
                    {showRoomMembersModal.bannedMembers.length} {isRtl ? 'مسدود شده' : 'Banned'}
                  </span>
                )}
              </div>

              {/* Member Search input */}
              <div className="relative">
                <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                <input
                  type="text"
                  placeholder={isRtl ? 'جستجوی عضو...' : 'Search member...'}
                  value={memberSearch}
                  onChange={(e) => setMemberSearch(e.target.value)}
                  className={`w-full pl-9 pr-3 py-2 border rounded-lg text-xs outline-none transition-colors duration-200 ${
                    isLightMode 
                      ? 'bg-white border-slate-300 text-slate-800 focus:border-indigo-500' 
                      : 'bg-black/40 border-white/5 text-gray-200 focus:border-indigo-500'
                  }`}
                />
              </div>

              <div className="max-h-72 overflow-y-auto space-y-4 pr-1.5 scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent">
                {/* Active Members Section */}
                <div className="space-y-2">
                  <h4 className={`text-xs font-bold uppercase tracking-wider ${isLightMode ? 'text-slate-400' : 'text-gray-500'}`}>
                    {isRtl ? 'اعضای فعال' : 'Active Members'}
                  </h4>
                  {showRoomMembersModal.joinedMembers.filter(m => 
                    m.mxid.toLowerCase().includes(memberSearch.toLowerCase())
                  ).length === 0 ? (
                    <p className="text-xs text-center text-gray-500 py-2">
                      {isRtl ? 'هیچ عضوی یافت نشد' : 'No members found'}
                    </p>
                  ) : (
                    showRoomMembersModal.joinedMembers
                      .filter(m => m.mxid.toLowerCase().includes(memberSearch.toLowerCase()))
                      .map((m) => (
                        <div
                          key={m.mxid}
                          className={`flex justify-between items-center p-3 border rounded-lg text-sm ${
                            isLightMode ? 'bg-white border-slate-200 shadow-sm' : 'bg-black/30 border-white/5'
                          }`}
                        >
                          <div className="flex items-center gap-2">
                            <span className={`h-7 w-7 rounded-full flex items-center justify-center text-[10px] font-mono ${
                              isLightMode ? 'bg-slate-200 text-slate-600' : 'bg-slate-800 text-gray-400'
                            }`}>
                              @
                            </span>
                            <div>
                              <span className={`block font-mono text-xs truncate max-w-[140px] md:max-w-[200px] ${
                                isLightMode ? 'text-slate-700 font-medium' : 'text-gray-200'
                              }`} title={m.mxid}>
                                {m.mxid}
                              </span>
                              <span className="block text-[10px] text-gray-500 font-mono">
                                PL: <span className={`font-bold ${isLightMode ? 'text-indigo-600' : 'text-indigo-400'}`}>{m.powerLevel}</span> ({m.role})
                              </span>
                            </div>
                          </div>

                          <div className="flex items-center gap-1.5">
                            {m.mxid === showRoomMembersModal.creator ? (
                              <span className="text-[10px] font-mono font-medium uppercase px-2 py-0.5 bg-purple-500/10 text-purple-400 border border-purple-500/25 rounded">
                                Creator
                              </span>
                            ) : hasWriteAccess ? (
                              <>
                                <button
                                  onClick={() => handleRoomMemberAction(showRoomMembersModal.id, m.mxid, 'kick')}
                                  disabled={memberActionLoading !== null}
                                  className="flex items-center gap-1 px-2.5 py-1 text-[11px] bg-amber-600/15 hover:bg-amber-600/25 text-amber-500 hover:text-amber-400 border border-amber-500/20 hover:border-amber-500/40 rounded-lg transition-colors duration-200 disabled:opacity-50"
                                  title={isRtl ? 'اخراج از روم' : 'Kick from room'}
                                >
                                  {memberActionLoading === `${m.mxid}-kick` ? (
                                    <RefreshCw className="h-3 w-3 animate-spin" />
                                  ) : (
                                    <UserMinus className="h-3 w-3" />
                                  )}
                                  <span>{isRtl ? 'اخراج' : 'Kick'}</span>
                                </button>
                                <button
                                  onClick={() => handleRoomMemberAction(showRoomMembersModal.id, m.mxid, 'ban')}
                                  disabled={memberActionLoading !== null}
                                  className="flex items-center gap-1 px-2.5 py-1 text-[11px] bg-red-600/15 hover:bg-red-600/25 text-red-500 hover:text-red-400 border border-red-500/20 hover:border-red-500/40 rounded-lg transition-colors duration-200 disabled:opacity-50"
                                  title={isRtl ? 'مسدود کردن از روم' : 'Ban from room'}
                                >
                                  {memberActionLoading === `${m.mxid}-ban` ? (
                                    <RefreshCw className="h-3 w-3 animate-spin" />
                                  ) : (
                                    <Ban className="h-3 w-3" />
                                  )}
                                  <span>{isRtl ? 'مسدود' : 'Ban'}</span>
                                </button>
                              </>
                            ) : null}
                          </div>
                        </div>
                      ))
                  )}
                </div>

                {/* Banned Members Section */}
                {showRoomMembersModal.bannedMembers && showRoomMembersModal.bannedMembers.length > 0 && (
                  <div className="space-y-2 pt-2 border-t border-white/5">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-red-500">
                      {isRtl ? 'کاربران مسدود شده' : 'Banned Members'}
                    </h4>
                    {showRoomMembersModal.bannedMembers.filter(mxid => 
                      mxid.toLowerCase().includes(memberSearch.toLowerCase())
                    ).length === 0 ? (
                      <p className="text-xs text-center text-gray-500 py-1">
                        {isRtl ? 'هیچ کاربر مسدودی یافت نشد' : 'No banned members found'}
                      </p>
                    ) : (
                      showRoomMembersModal.bannedMembers
                        .filter(mxid => mxid.toLowerCase().includes(memberSearch.toLowerCase()))
                        .map((mxid) => (
                          <div
                            key={mxid}
                            className={`flex justify-between items-center p-3 border rounded-lg text-sm ${
                              isLightMode ? 'bg-red-50/30 border-red-100 shadow-sm' : 'bg-red-500/5 border-red-500/10'
                            }`}
                          >
                            <div className="flex items-center gap-2">
                              <span className="h-7 w-7 rounded-full flex items-center justify-center text-[10px] font-mono bg-red-500/10 text-red-400">
                                @
                              </span>
                              <span className="block font-mono text-xs truncate max-w-[140px] md:max-w-[200px] text-red-400" title={mxid}>
                                {mxid}
                              </span>
                            </div>

                            {hasWriteAccess && (
                              <button
                                onClick={() => handleRoomMemberAction(showRoomMembersModal.id, mxid, 'unban')}
                                disabled={memberActionLoading !== null}
                                className="flex items-center gap-1 px-2.5 py-1 text-[11px] bg-emerald-600/15 hover:bg-emerald-600/25 text-emerald-500 hover:text-emerald-400 border border-emerald-500/20 hover:border-emerald-500/40 rounded-lg transition-colors duration-200 disabled:opacity-50"
                                title={isRtl ? 'رفع مسدودیت' : 'Unban from room'}
                              >
                                {memberActionLoading === `${mxid}-unban` ? (
                                  <RefreshCw className="h-3 w-3 animate-spin" />
                                ) : (
                                  <Check className="h-3 w-3" />
                                )}
                                <span>{isRtl ? 'رفع مسدودیت' : 'Unban'}</span>
                              </button>
                            )}
                          </div>
                        ))
                    )}
                  </div>
                )}
              </div>

              <div className={`flex justify-end border-t pt-4 ${isLightMode ? 'border-slate-200' : 'border-white/5'}`}>
                <button
                  onClick={() => {
                    setShowRoomMembersModal(null);
                    setMemberSearch('');
                  }}
                  className={`px-4 py-2 rounded-lg text-xs transition-colors duration-200 ${
                    isLightMode 
                      ? 'bg-slate-200 hover:bg-slate-300 text-slate-700 border border-slate-300' 
                      : 'bg-slate-800 hover:bg-slate-700 text-gray-300'
                  }`}
                >
                  Close
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ========================================== */}
      {/* MODAL 5: SHUTDOWN ROOM CONFIRM */}
      {/* ========================================== */}
      <AnimatePresence>
        {showShutdownRoomModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="w-full max-w-md p-6 rounded-2xl relative space-y-4 spatial-glass"
              id="shutdown-room-modal"
            >
              <button
                onClick={() => setShowShutdownRoomModal(null)}
                className={`absolute top-4 right-4 transition-colors duration-200 ${
                  isLightMode ? 'text-slate-400 hover:text-slate-800' : 'text-gray-400 hover:text-white'
                }`}
              >
                <X className="h-5 w-5" />
              </button>

              <h3 className={`text-lg font-bold flex items-center gap-2 border-b pb-2 ${
                isLightMode ? 'text-red-600 border-slate-200' : 'text-red-400 border-white/5'
              }`}>
                <ShieldAlert className="h-5 w-5 animate-pulse text-red-500" />
                <span>Shutdown & Purge Room</span>
              </h3>

              <div className={`text-xs space-y-1 p-3 rounded-lg border ${
                isLightMode ? 'bg-red-50 border-red-100 text-red-900' : 'text-gray-400 bg-black/40 border-white/5'
              }`}>
                <p>Room: <span className={`font-semibold ${isLightMode ? 'text-red-700' : 'text-red-300'}`}>{showShutdownRoomModal.name}</span></p>
                <p className="font-mono text-[10px] truncate">ID: {showShutdownRoomModal.id}</p>
              </div>

              <form onSubmit={handleShutdownRoom} className="space-y-4 text-sm font-medium">
                <div className="space-y-2.5">
                  <div className="flex items-center gap-3">
                    <input
                      type="checkbox"
                      id="sd-purge-cb"
                      checked={shutdownRoomConfig.purge}
                      disabled={shutdownRoomLoading}
                      onChange={(e) => setShutdownRoomConfig(prev => ({ ...prev, purge: e.target.checked }))}
                      className={`h-4 w-4 rounded focus:ring-0 ${
                        isLightMode ? 'border-slate-300 bg-white text-red-600' : 'border-white/10 bg-slate-900 text-red-600'
                      } ${shutdownRoomLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
                    />
                    <label htmlFor="sd-purge-cb" className={`text-xs leading-tight select-none ${
                      isLightMode ? 'text-slate-700' : 'text-gray-300'
                    } ${shutdownRoomLoading ? 'opacity-50' : ''}`}>
                      {t.purgeRoomLabel}
                    </label>
                  </div>

                  <div className={`flex items-center gap-3 border-t pt-2.5 ${
                    isLightMode ? 'border-slate-200' : 'border-white/5'
                  }`}>
                    <input
                      type="checkbox"
                      id="sd-sendmsg-cb"
                      checked={shutdownRoomConfig.sendMessage}
                      disabled={shutdownRoomLoading}
                      onChange={(e) => setShutdownRoomConfig(prev => ({ ...prev, sendMessage: e.target.checked }))}
                      className={`h-4 w-4 rounded focus:ring-0 ${
                        isLightMode ? 'border-slate-300 bg-white text-red-600' : 'border-white/10 bg-slate-900 text-red-600'
                      } ${shutdownRoomLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
                    />
                    <label htmlFor="sd-sendmsg-cb" className={`text-xs leading-tight select-none ${
                      isLightMode ? 'text-slate-700' : 'text-gray-300'
                    } ${shutdownRoomLoading ? 'opacity-50' : ''}`}>
                      {t.sendMessageLabel}
                    </label>
                  </div>

                  <div className={`flex items-center gap-3 border-t pt-2.5 ${
                    isLightMode ? 'border-slate-200' : 'border-white/5'
                  }`}>
                    <input
                      type="checkbox"
                      id="sd-leave-cb"
                      checked={shutdownRoomConfig.leave}
                      disabled={shutdownRoomLoading}
                      onChange={(e) => setShutdownRoomConfig(prev => ({ ...prev, leave: e.target.checked }))}
                      className={`h-4 w-4 rounded focus:ring-0 ${
                        isLightMode ? 'border-slate-300 bg-white text-red-600' : 'border-white/10 bg-slate-900 text-red-600'
                      } ${shutdownRoomLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
                    />
                    <label htmlFor="sd-leave-cb" className={`text-xs leading-tight select-none ${
                      isLightMode ? 'text-slate-700' : 'text-gray-300'
                    } ${shutdownRoomLoading ? 'opacity-50' : ''}`}>
                      {t.leaveRoomLabel}
                    </label>
                  </div>
                </div>

                {shutdownRoomConfig.sendMessage && (
                  <div className="space-y-1">
                    <textarea
                      value={shutdownRoomConfig.messageText}
                      disabled={shutdownRoomLoading}
                      onChange={(e) => setShutdownRoomConfig(prev => ({ ...prev, messageText: e.target.value }))}
                      placeholder={t.sendMessagePlaceholder}
                      rows={2}
                      className={`w-full border focus:border-red-500 rounded-lg p-2.5 outline-none text-xs transition-colors duration-200 resize-none ${
                        isLightMode 
                          ? 'bg-white border-slate-300 text-slate-800' 
                          : 'bg-black/40 border-white/5 text-gray-200'
                      } ${shutdownRoomLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
                    />
                  </div>
                )}

                <div className={`flex justify-end gap-2 border-t pt-4 ${
                  isLightMode ? 'border-slate-200' : 'border-white/5'
                }`}>
                  <button
                    type="button"
                    disabled={shutdownRoomLoading}
                    onClick={() => setShowShutdownRoomModal(null)}
                    className={`px-4 py-2 rounded-lg text-xs transition-colors duration-200 ${
                      isLightMode 
                        ? 'bg-slate-200 hover:bg-slate-300 text-slate-700' 
                        : 'bg-slate-800 hover:bg-slate-700 text-gray-300'
                    } ${shutdownRoomLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
                  >
                    {t.cancel}
                  </button>
                  <button
                    type="submit"
                    disabled={shutdownRoomLoading}
                    className="px-4 py-2 bg-red-600 hover:bg-red-500 text-white rounded-lg text-xs transition-colors duration-200 shadow-md flex items-center gap-1.5 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {shutdownRoomLoading ? (
                      <>
                        <RefreshCw className="h-3 w-3 animate-spin" />
                        <span>{isRtl ? 'در حال حذف...' : 'Shutting down...'}</span>
                      </>
                    ) : (
                      <span>Shutdown Room</span>
                    )}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ========================================== */}
      {/* MODAL 5A: ADD PRIVILEGED USER */}
      {/* ========================================== */}
      <AnimatePresence>
        {showAddPrivilegedModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="w-full max-w-md p-6 rounded-2xl relative space-y-4 spatial-glass"
              id="add-privileged-modal"
            >
              <button
                onClick={() => setShowAddPrivilegedModal(null)}
                className={`absolute top-4 right-4 transition-colors duration-200 ${
                  isLightMode ? 'text-slate-400 hover:text-slate-800' : 'text-gray-400 hover:text-white'
                }`}
                disabled={privilegedLoading}
              >
                <X className="h-5 w-5" />
              </button>

              <h3 className={`text-lg font-bold flex items-center gap-2 border-b pb-2 ${
                isLightMode ? 'text-purple-600 border-slate-200' : 'text-purple-400 border-white/5'
              }`}>
                <Shield className="h-5 w-5 text-purple-500 animate-pulse" />
                <span>{t.addPrivilegedUserTitle}</span>
              </h3>

              <div className={`text-xs space-y-1 p-3 rounded-lg border ${
                isLightMode ? 'bg-purple-50 border-purple-100 text-purple-900' : 'text-gray-400 bg-black/40 border-white/5'
              }`}>
                <p>Room: <span className="font-semibold">{showAddPrivilegedModal.name}</span></p>
                <p className="font-mono text-[10px] truncate">ID: {showAddPrivilegedModal.id}</p>
              </div>

              <form onSubmit={handleSetPrivilegedUser} className="space-y-4 text-sm font-medium">
                <div className="space-y-3">
                  <div>
                    <label className={`block text-xs mb-1.5 ${isLightMode ? 'text-slate-600' : 'text-gray-400'}`}>
                      {isRtl ? 'انتخاب از بین اعضای روم' : 'Select from Room Members'}
                    </label>
                    <select
                      disabled={privilegedLoading}
                      value={showAddPrivilegedModal.joinedMembers.some(m => m.mxid === privilegedUserConfig.mxid) ? privilegedUserConfig.mxid : ''}
                      onChange={(e) => setPrivilegedUserConfig(prev => ({ ...prev, mxid: e.target.value }))}
                      className={`w-full border rounded-lg p-2.5 outline-none text-xs transition-colors duration-200 ${
                        isLightMode 
                          ? 'bg-white border-slate-300 text-slate-800 focus:border-purple-500' 
                          : 'bg-black/40 border-white/5 text-gray-200 focus:border-purple-500'
                      }`}
                    >
                      <option value="">{isRtl ? '-- انتخاب کاربر عضو --' : '-- Select a Member --'}</option>
                      {showAddPrivilegedModal.joinedMembers.map(m => (
                        <option key={m.mxid} value={m.mxid}>
                          {m.mxid} (Power: {m.powerLevel})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className={`block text-xs mb-1.5 ${isLightMode ? 'text-slate-600' : 'text-gray-400'}`}>
                      {isRtl ? 'یا وارد کردن دستی شناسه ماتریکس (MXID)' : 'Or Enter Matrix ID (MXID) Manually'}
                    </label>
                    <input
                      type="text"
                      required
                      disabled={privilegedLoading}
                      value={privilegedUserConfig.mxid}
                      onChange={(e) => setPrivilegedUserConfig(prev => ({ ...prev, mxid: e.target.value }))}
                      placeholder="@username:example.com"
                      className={`w-full border rounded-lg p-2.5 outline-none text-xs transition-colors duration-200 ${
                        isLightMode 
                          ? 'bg-white border-slate-300 text-slate-800 focus:border-purple-500' 
                          : 'bg-black/40 border-white/5 text-gray-200 focus:border-purple-500'
                      }`}
                    />
                  </div>

                  <div>
                    <label className={`block text-xs mb-1.5 ${isLightMode ? 'text-slate-600' : 'text-gray-400'}`}>
                      {t.powerLevelLabel}
                    </label>
                    <select
                      disabled={privilegedLoading}
                      value={privilegedUserConfig.powerLevel}
                      onChange={(e) => setPrivilegedUserConfig(prev => ({ ...prev, powerLevel: e.target.value }))}
                      className={`w-full border rounded-lg p-2.5 outline-none text-xs transition-colors duration-200 ${
                        isLightMode 
                          ? 'bg-white border-slate-300 text-slate-800 focus:border-purple-500' 
                          : 'bg-black/40 border-white/5 text-gray-200 focus:border-purple-500'
                      }`}
                    >
                      <option value="100">{t.adminPower}</option>
                      <option value="50">{t.modPower}</option>
                      <option value="75">Custom Level 75 (Moderator+)</option>
                      <option value="25">Custom Level 25 (Helper)</option>
                    </select>
                  </div>
                </div>

                <div className={`flex justify-end gap-2 border-t pt-4 ${
                  isLightMode ? 'border-slate-200' : 'border-white/5'
                }`}>
                  <button
                    type="button"
                    disabled={privilegedLoading}
                    onClick={() => setShowAddPrivilegedModal(null)}
                    className={`px-4 py-2 rounded-lg text-xs transition-colors duration-200 ${
                      isLightMode 
                        ? 'bg-slate-200 hover:bg-slate-300 text-slate-700' 
                        : 'bg-slate-800 hover:bg-slate-700 text-gray-300'
                    }`}
                  >
                    {t.cancel}
                  </button>
                  <button
                    type="submit"
                    disabled={privilegedLoading}
                    className="px-4 py-2 bg-purple-600 hover:bg-purple-500 text-white rounded-lg text-xs transition-colors duration-200 shadow-md flex items-center gap-1.5 disabled:opacity-50"
                  >
                    {privilegedLoading ? (
                      <>
                        <RefreshCw className="h-3 w-3 animate-spin" />
                        <span>{isRtl ? 'در حال ثبت...' : 'Saving...'}</span>
                      </>
                    ) : (
                      <span>{t.addBtn}</span>
                    )}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ========================================== */}
      {/* MODAL 5B: ADD MEMBER */}
      {/* ========================================== */}
      <AnimatePresence>
        {showAddMemberModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="w-full max-w-xl p-6 rounded-2xl relative space-y-4 spatial-glass text-sm"
              id="add-member-modal"
            >
              <button
                onClick={() => {
                  setShowAddMemberModal(null);
                  setAddMemberSearch('');
                }}
                className={`absolute top-4 right-4 transition-colors duration-200 ${
                  isLightMode ? 'text-slate-400 hover:text-slate-800' : 'text-gray-400 hover:text-white'
                }`}
                disabled={addMemberLoading}
              >
                <X className="h-5 w-5" />
              </button>

              <h3 className={`text-lg font-bold flex items-center gap-2 border-b pb-2 ${
                isLightMode ? 'text-emerald-600 border-slate-200' : 'text-emerald-400 border-white/5'
              }`}>
                <UserPlus className="h-5 w-5 text-emerald-500 animate-pulse" />
                <span>{t.addMemberTitle}</span>
              </h3>

              <div className={`text-xs space-y-1 p-3 rounded-lg border ${
                isLightMode ? 'bg-emerald-50 border-emerald-100 text-emerald-900' : 'text-gray-400 bg-black/40 border-white/5'
              }`}>
                <p>Room: <span className="font-semibold">{showAddMemberModal.name}</span></p>
                <p className="font-mono text-[10px] truncate">ID: {showAddMemberModal.id}</p>
              </div>

              {/* Tab Header inside Add Member Modal */}
              <div className="flex border-b border-white/5 pb-1">
                <button
                  type="button"
                  onClick={() => setAddMemberTab('direct')}
                  className={`flex-1 pb-2 text-xs font-semibold text-center border-b-2 transition-all duration-200 ${
                    addMemberTab === 'direct'
                      ? 'border-emerald-500 text-emerald-400 font-bold'
                      : 'border-transparent text-slate-400 hover:text-slate-200'
                  }`}
                >
                  {isRtl ? 'افزودن مستقیم کاربر' : 'Direct User List'}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setAddMemberTab('ad');
                    setAdGroupInput((showAddMemberModal.adGroups || []).join(', '));
                  }}
                  className={`flex-1 pb-2 text-xs font-semibold text-center border-b-2 transition-all duration-200 ${
                    addMemberTab === 'ad'
                      ? 'border-emerald-500 text-emerald-400 font-bold'
                      : 'border-transparent text-slate-400 hover:text-slate-200'
                  }`}
                >
                  {isRtl ? 'اتصال اکتیو دایرکتوری (AD)' : 'Active Directory Groups'}
                </button>
              </div>

              {/* Tab Content 1: Direct User List */}
              {addMemberTab === 'direct' && (
                <div className="space-y-4">
                  {/* Search users input */}
                  <div className="relative">
                    <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                    <input
                      type="text"
                      placeholder={isRtl ? 'جستجوی کاربر ماتریکس برای افزودن...' : 'Search Matrix user to add...'}
                      value={addMemberSearch}
                      onChange={(e) => setAddMemberSearch(e.target.value)}
                      className={`w-full pl-9 pr-3 py-2 border rounded-lg text-xs outline-none transition-colors duration-200 ${
                        isLightMode 
                          ? 'bg-white border-slate-300 text-slate-800 focus:border-emerald-500' 
                          : 'bg-black/40 border-white/5 text-gray-200 focus:border-emerald-500'
                      }`}
                    />
                  </div>

                  {/* Users Scrollbox */}
                  <div className="max-h-48 overflow-y-auto space-y-2 pr-1.5 scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent">
                    {users
                      .filter(u => {
                        // Not already in room
                        const isAlreadyMember = showAddMemberModal.joinedMembers.some(
                          m => m.mxid.toLowerCase() === u.mxid.toLowerCase()
                        );
                        // Matches search
                        const matchesSearch = u.mxid.toLowerCase().includes(addMemberSearch.toLowerCase()) || 
                          (u.displayName && u.displayName.toLowerCase().includes(addMemberSearch.toLowerCase()));
                        
                        return !isAlreadyMember && matchesSearch;
                      })
                      .length === 0 ? (
                        <p className="text-xs text-center text-gray-500 py-4">
                          {isRtl ? 'کاربر غیرعضو دیگری یافت نشد' : 'No other non-member users found'}
                        </p>
                      ) : (
                        users
                          .filter(u => {
                            const isAlreadyMember = showAddMemberModal.joinedMembers.some(
                              m => m.mxid.toLowerCase() === u.mxid.toLowerCase()
                            );
                            const matchesSearch = u.mxid.toLowerCase().includes(addMemberSearch.toLowerCase()) || 
                              (u.displayName && u.displayName.toLowerCase().includes(addMemberSearch.toLowerCase()));
                            return !isAlreadyMember && matchesSearch;
                          })
                          .slice(0, 15) // limit display for speed
                          .map(u => (
                            <div
                              key={u.mxid}
                              className={`flex justify-between items-center p-2.5 border rounded-lg text-xs ${
                                isLightMode ? 'bg-white border-slate-200 shadow-sm' : 'bg-black/20 border-white/5'
                              }`}
                            >
                              <div className="flex items-center gap-2">
                                <span className={`h-6 w-6 rounded-full flex items-center justify-center text-[10px] font-mono ${
                                  isLightMode ? 'bg-slate-200 text-slate-600' : 'bg-slate-800 text-gray-400'
                                }`}>
                                  @
                                </span>
                                <div className="truncate max-w-[180px] md:max-w-[280px]">
                                  <span className={`block font-medium truncate ${isLightMode ? 'text-slate-800' : 'text-gray-200'}`}>
                                    {u.displayName || u.mxid.split(':')[0].substring(1)}
                                  </span>
                                  <span className="block text-[10px] text-gray-500 font-mono truncate">{u.mxid}</span>
                                </div>
                              </div>
                              <button
                                type="button"
                                disabled={addMemberLoading}
                                onClick={() => handleForceJoinMember(undefined, u.mxid)}
                                className="flex items-center gap-1 px-3 py-1 bg-emerald-600 hover:bg-emerald-500 text-white text-[11px] rounded-lg transition-colors duration-200 shadow-sm font-semibold disabled:opacity-50"
                              >
                                {addingMemberMxid === u.mxid ? (
                                  <RefreshCw className="h-3 w-3 animate-spin" />
                                ) : (
                                  <Plus className="h-3.5 w-3.5" />
                                )}
                                <span>{isRtl ? 'افزودن' : 'Add'}</span>
                              </button>
                            </div>
                          ))
                      )}
                  </div>

                  {/* Manual Input Fallback */}
                  <div className="border-t border-white/5 pt-3">
                    <form onSubmit={handleForceJoinMember} className="space-y-2">
                      <label className={`block text-[11px] font-semibold uppercase tracking-wider ${isLightMode ? 'text-slate-500' : 'text-gray-400'}`}>
                        {isRtl ? 'یا وارد کردن دستی شناسه ماتریکس (MXID)' : 'Or Enter Matrix ID (MXID) Manually'}
                      </label>
                      <div className="flex gap-2">
                        <input
                          type="text"
                          disabled={addMemberLoading}
                          value={addMemberConfig.mxid}
                          onChange={(e) => setAddMemberConfig(prev => ({ ...prev, mxid: e.target.value }))}
                          placeholder="@username:example.com"
                          className={`flex-1 border rounded-lg p-2 outline-none text-xs transition-colors duration-200 ${
                            isLightMode 
                              ? 'bg-white border-slate-300 text-slate-800 focus:border-emerald-500' 
                              : 'bg-black/40 border-white/5 text-gray-200 focus:border-emerald-500'
                          }`}
                        />
                        <button
                          type="submit"
                          disabled={addMemberLoading}
                          className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs transition-colors duration-200 shadow-md flex items-center gap-1.5 font-bold disabled:opacity-50"
                        >
                          {addMemberLoading ? (
                            <RefreshCw className="h-3 w-3 animate-spin" />
                          ) : (
                            <span>{t.addBtn}</span>
                          )}
                        </button>
                      </div>
                    </form>
                  </div>
                </div>
              )}

              {/* Tab Content 2: AD Groups Mapping & Simulation */}
              {addMemberTab === 'ad' && (
                <div className="space-y-4">
                  {/* AD Group Configuration */}
                  <div className="space-y-2">
                    <label className={`block text-xs font-semibold ${isLightMode ? 'text-slate-700' : 'text-gray-300'}`}>
                      {isRtl ? 'گروه‌های اکتیو دایرکتوری مرتبط (جدا شده با کاما)' : 'Mapped Active Directory Groups (comma-separated)'}
                    </label>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={adGroupInput}
                        onChange={(e) => setAdGroupInput(e.target.value)}
                        placeholder="e.g. Engineering, SynapseAdmins"
                        className={`flex-1 border rounded-lg p-2 outline-none text-xs transition-colors duration-200 ${
                          isLightMode 
                            ? 'bg-white border-slate-300 text-slate-800 focus:border-emerald-500' 
                            : 'bg-black/40 border-white/5 text-gray-200 focus:border-emerald-500'
                        }`}
                      />
                      <button
                        type="button"
                        onClick={() => handleUpdateAdGroups(showAddMemberModal.id, adGroupInput)}
                        className="px-4 py-2 bg-purple-600 hover:bg-purple-500 text-white rounded-lg text-xs transition-colors duration-200 shadow-md font-bold"
                      >
                        {isRtl ? 'بروزرسانی' : 'Save'}
                      </button>
                    </div>

                    {/* Current Group Tags display */}
                    <div className="flex flex-wrap gap-1.5 pt-1">
                      {(showAddMemberModal.adGroups || []).length === 0 ? (
                        <span className="text-[10px] text-gray-500 italic">
                          {isRtl ? 'هیچ گروهی متصل نشده است' : 'No AD groups currently mapped to this room'}
                        </span>
                      ) : (
                        (showAddMemberModal.adGroups || []).map(g => (
                          <span
                            key={g}
                            className="text-[10px] font-mono font-semibold px-2 py-0.5 bg-emerald-500/15 text-emerald-400 border border-emerald-500/20 rounded"
                          >
                            {g}
                          </span>
                        ))
                      )}
                    </div>
                  </div>

                  {/* AD Auto-Join Simulation Section */}
                  <div className={`p-4 rounded-xl border ${
                    isLightMode ? 'bg-slate-50 border-slate-200 text-slate-800' : 'bg-black/40 border-white/5'
                  }`}>
                    <h4 className="text-xs font-bold flex items-center gap-1.5 text-purple-400 mb-2">
                      <Server className="h-4 w-4" />
                      <span>{isRtl ? 'تست و شبیه‌سازی لاگین کاربر AD' : 'Simulate AD User First Login'}</span>
                    </h4>
                    <p className="text-[10px] text-gray-400 leading-relaxed mb-3">
                      {isRtl 
                        ? 'این فرم اولین ورود یک کاربر از طریق اکتیو دایرکتوری را شبیه‌سازی می‌کند. در صورتی که گروه AD کاربر با این روم همخوانی داشته باشد، کاربر به طور خودکار به این روم اضافه خواهد شد.'
                        : 'This form simulates an Active Directory user logging in for the first time. If the user\'s AD groups match this room\'s mapped groups, they will auto-join this room.'
                      }
                    </p>

                    <form onSubmit={handleSimulateAdLogin} className="space-y-3">
                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <label className="block text-[10px] text-gray-400 mb-1">
                            {isRtl ? 'نام کاربری' : 'Username'}
                          </label>
                          <input
                            type="text"
                            required
                            value={simAdUsername}
                            onChange={(e) => setSimAdUsername(e.target.value)}
                            placeholder="e.g. john_doe"
                            className={`w-full border rounded-lg p-2 outline-none text-[11px] transition-colors duration-200 ${
                              isLightMode 
                                ? 'bg-white border-slate-300 text-slate-800 focus:border-purple-500' 
                                : 'bg-black/30 border-white/5 text-gray-200 focus:border-purple-500'
                            }`}
                          />
                        </div>
                        <div>
                          <label className="block text-[10px] text-gray-400 mb-1">
                            {isRtl ? 'نام نمایشی (اختیاری)' : 'Display Name (optional)'}
                          </label>
                          <input
                            type="text"
                            value={simAdDisplayName}
                            onChange={(e) => setSimAdDisplayName(e.target.value)}
                            placeholder="e.g. John Doe"
                            className={`w-full border rounded-lg p-2 outline-none text-[11px] transition-colors duration-200 ${
                              isLightMode 
                                ? 'bg-white border-slate-300 text-slate-800 focus:border-purple-500' 
                                : 'bg-black/30 border-white/5 text-gray-200 focus:border-purple-500'
                            }`}
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-[10px] text-gray-400 mb-1">
                          {isRtl ? 'گروه‌های کاربر (جدا شده با کاما)' : 'User\'s AD Groups (comma-separated)'}
                        </label>
                        <input
                          type="text"
                          value={simAdGroups}
                          onChange={(e) => setSimAdGroups(e.target.value)}
                          placeholder="e.g. SynapseAdmins, Engineering"
                          className={`w-full border rounded-lg p-2 outline-none text-[11px] transition-colors duration-200 ${
                            isLightMode 
                              ? 'bg-white border-slate-300 text-slate-800 focus:border-purple-500' 
                              : 'bg-black/30 border-white/5 text-gray-200 focus:border-purple-500'
                          }`}
                        />
                      </div>

                      <div className="flex justify-end pt-1">
                        <button
                          type="submit"
                          disabled={simAdLoading}
                          className="px-3.5 py-1.5 bg-purple-600 hover:bg-purple-500 text-white rounded-lg text-xs transition-colors duration-200 shadow-md flex items-center gap-1.5 font-bold disabled:opacity-50"
                        >
                          {simAdLoading ? (
                            <>
                              <RefreshCw className="h-3 w-3 animate-spin" />
                              <span>{isRtl ? 'در حال شبیه‌سازی...' : 'Simulating...'}</span>
                            </>
                          ) : (
                            <span>{isRtl ? 'شبیه‌سازی ورود' : 'Simulate Login'}</span>
                          )}
                        </button>
                      </div>
                    </form>
                  </div>
                </div>
              )}

              {/* Close Footer Button */}
              <div className={`flex justify-end border-t pt-4 ${
                isLightMode ? 'border-slate-200' : 'border-white/5'
              }`}>
                <button
                  type="button"
                  disabled={addMemberLoading}
                  onClick={() => {
                    setShowAddMemberModal(null);
                    setAddMemberSearch('');
                  }}
                  className={`px-4 py-2 rounded-lg text-xs transition-colors duration-200 ${
                    isLightMode 
                      ? 'bg-slate-200 hover:bg-slate-300 text-slate-700' 
                      : 'bg-slate-800 hover:bg-slate-700 text-gray-300'
                  }`}
                >
                  Close
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ========================================== */}
      {/* MODAL 6: CREATE REGISTRATION TOKEN */}
      {/* ========================================== */}
      <AnimatePresence>
        {showCreateTokenModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="w-full max-w-md p-6 rounded-2xl relative space-y-4 spatial-glass"
              id="create-token-modal"
            >
              <button
                onClick={() => setShowCreateTokenModal(false)}
                className={`absolute top-4 right-4 transition-colors duration-200 ${
                  isLightMode ? 'text-slate-400 hover:text-slate-800' : 'text-gray-400 hover:text-white'
                }`}
              >
                <X className="h-5 w-5" />
              </button>

              <h3 className={`text-lg font-bold flex items-center gap-2 border-b pb-2 ${
                isLightMode ? 'text-emerald-600 border-slate-200' : 'text-emerald-400 border-white/5'
              }`}>
                <Key className="h-5 w-5 animate-pulse text-emerald-500" />
                <span>{t.createTokenBtn}</span>
              </h3>

              <form onSubmit={handleCreateToken} className="space-y-4 text-sm font-medium">
                <div className="space-y-1">
                  <label className={`block text-xs ${isLightMode ? 'text-slate-500' : 'text-gray-400'}`}>{t.tokenStringLabel}</label>
                  <input
                    type="text"
                    value={newToken.token}
                    onChange={(e) => setNewToken(prev => ({ ...prev, token: e.target.value }))}
                    placeholder="e.g. VIP-INVITE-ONLY"
                    className={`w-full border focus:border-emerald-500 rounded-lg p-2.5 outline-none font-mono text-xs transition-colors duration-200 ${
                      isLightMode 
                        ? 'bg-white border-slate-300 text-slate-800' 
                        : 'bg-black/40 border-white/5 text-gray-200'
                    }`}
                  />
                </div>

                <div className="space-y-1">
                  <label className={`block text-xs ${isLightMode ? 'text-slate-500' : 'text-gray-400'}`}>{t.usesAllowedLabel}</label>
                  <input
                    type="number"
                    value={newToken.usesAllowed}
                    onChange={(e) => setNewToken(prev => ({ ...prev, usesAllowed: e.target.value }))}
                    placeholder="e.g. 10 (Leave blank for unlimited)"
                    className={`w-full border focus:border-emerald-500 rounded-lg p-2.5 outline-none font-mono text-xs transition-colors duration-200 ${
                      isLightMode 
                        ? 'bg-white border-slate-300 text-slate-800' 
                        : 'bg-black/40 border-white/5 text-gray-200'
                    }`}
                  />
                </div>

                <div className="space-y-1">
                  <label className={`block text-xs ${isLightMode ? 'text-slate-500' : 'text-gray-400'}`}>{t.expiryLabel}</label>
                  <input
                    type="datetime-local"
                    value={newToken.expiryTime}
                    onChange={(e) => setNewToken(prev => ({ ...prev, expiryTime: e.target.value }))}
                    className={`w-full border focus:border-emerald-500 rounded-lg p-2.5 outline-none font-mono text-xs transition-colors duration-200 ${
                      isLightMode 
                        ? 'bg-white border-slate-300 text-slate-800' 
                        : 'bg-black/40 border-white/5 text-gray-200'
                    }`}
                  />
                </div>

                <div className={`flex justify-end gap-2 border-t pt-4 mt-2 ${
                  isLightMode ? 'border-slate-200' : 'border-white/5'
                }`}>
                  <button
                    type="button"
                    onClick={() => setShowCreateTokenModal(false)}
                    className={`px-4 py-2 rounded-lg text-xs transition-colors duration-200 ${
                      isLightMode 
                        ? 'bg-slate-200 hover:bg-slate-300 text-slate-700' 
                        : 'bg-slate-800 hover:bg-slate-700 text-gray-300'
                    }`}
                  >
                    {t.cancel}
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs transition-colors duration-200 shadow-md"
                  >
                    Generate
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ========================================== */}
      {/* MODAL 7: DETAILED USER VIEWER (KETESA EXTRA) */}
      {/* ========================================== */}
      <AnimatePresence>
        {selectedUserMxid && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md">
            <motion.div
              initial={{ scale: 0.96, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.96, opacity: 0 }}
              className={`w-full max-w-5xl h-[85vh] flex flex-col rounded-2xl shadow-2xl relative overflow-hidden ${
                isLightMode ? 'bg-slate-50 border border-slate-200' : 'bg-slate-900/95 backdrop-blur-2xl border border-white/10'
              }`}
            >
              {/* Header */}
              <div className={`flex items-center justify-between p-5 border-b ${
                isLightMode ? 'border-slate-200 bg-slate-100/70' : 'border-white/5 bg-black/20'
              }`}>
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-indigo-600/10 text-indigo-400 rounded-lg">
                    <Sparkles className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className={`text-base font-bold flex items-center gap-2 font-mono ${
                      isLightMode ? 'text-slate-800' : 'text-gray-100'
                    }`}>
                      <span>{selectedUserMxid}</span>
                    </h3>
                    <p className={`text-xs ${isLightMode ? 'text-slate-500' : 'text-gray-500'}`}>
                      {isRtl ? 'پیکربندی و نظارت پیشرفته کاربر ماتریکس (Matrix Admin)' : 'Advanced Matrix User Configuration & Monitoring (Matrix Admin)'}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => {
                    setSelectedUserMxid(null);
                    setSelectedUserDetails(null);
                  }}
                  className={`p-1.5 rounded-lg transition-colors duration-200 ${
                    isLightMode 
                      ? 'bg-slate-200 hover:bg-slate-300 text-slate-700' 
                      : 'bg-slate-800 hover:bg-slate-700 text-gray-400 hover:text-white'
                  }`}
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              {/* Main Content Pane */}
              {userDetailsLoading ? (
                <div className={`flex-1 flex flex-col items-center justify-center gap-3 font-mono text-sm ${
                  isLightMode ? 'text-slate-600' : 'text-gray-400'
                }`}>
                  <RefreshCw className="h-8 w-8 text-indigo-400 animate-spin" />
                  <span>Loading user homeserver profile...</span>
                </div>
              ) : selectedUserDetails ? (
                <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
                  
                  {/* Left Sidebar Tabs */}
                  <div className={`w-full md:w-56 border-r p-3 flex flex-row md:flex-col gap-1 overflow-x-auto md:overflow-x-visible md:overflow-y-auto shrink-0 select-none ${
                    isLightMode ? 'bg-slate-100/50 border-slate-200' : 'bg-black/20 border-white/5'
                  }`}>
                    <button
                      onClick={() => setActiveUserDetailTab('user')}
                      className={`flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-medium transition-all duration-200 shrink-0 ${
                        activeUserDetailTab === 'user' 
                          ? 'bg-indigo-600 text-white shadow' 
                          : isLightMode 
                            ? 'text-slate-600 hover:bg-slate-200/60 hover:text-slate-800' 
                            : 'text-gray-400 hover:bg-white/5 hover:text-gray-200'
                      }`}
                    >
                      <span>🧙‍♂️</span>
                      <span>{isRtl ? 'یوزر اصلی' : 'User profile'}</span>
                    </button>

                    <button
                      onClick={() => setActiveUserDetailTab('contact')}
                      className={`flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-medium transition-all duration-200 shrink-0 ${
                        activeUserDetailTab === 'contact' 
                          ? 'bg-indigo-600 text-white shadow' 
                          : isLightMode 
                            ? 'text-slate-600 hover:bg-slate-200/60 hover:text-slate-800' 
                            : 'text-gray-400 hover:bg-white/5 hover:text-gray-200'
                      }`}
                    >
                      <Mail className="h-3.5 w-3.5" />
                      <span>{isRtl ? 'اطلاعات تماس' : 'Contact Info'}</span>
                    </button>

                    <button
                      onClick={() => setActiveUserDetailTab('sso')}
                      className={`flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-medium transition-all duration-200 shrink-0 ${
                        activeUserDetailTab === 'sso' 
                          ? 'bg-indigo-600 text-white shadow' 
                          : isLightMode 
                            ? 'text-slate-600 hover:bg-slate-200/60 hover:text-slate-800' 
                            : 'text-gray-400 hover:bg-white/5 hover:text-gray-200'
                      }`}
                    >
                      <Network className="h-3.5 w-3.5" />
                      <span>{isRtl ? 'اتصال SSO' : 'SSO Mapping'}</span>
                    </button>

                    <button
                      onClick={() => setActiveUserDetailTab('devices')}
                      className={`flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-medium transition-all duration-200 shrink-0 ${
                        activeUserDetailTab === 'devices' 
                          ? 'bg-indigo-600 text-white shadow' 
                          : isLightMode 
                            ? 'text-slate-600 hover:bg-slate-200/60 hover:text-slate-800' 
                            : 'text-gray-400 hover:bg-white/5 hover:text-gray-200'
                      }`}
                    >
                      <Laptop className="h-3.5 w-3.5" />
                      <span>{isRtl ? 'نشست‌ها / دستگاه‌ها' : 'Devices & Sessions'}</span>
                    </button>

                    <button
                      onClick={() => setActiveUserDetailTab('rooms')}
                      className={`flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-medium transition-all duration-200 shrink-0 ${
                        activeUserDetailTab === 'rooms' 
                          ? 'bg-indigo-600 text-white shadow' 
                          : isLightMode 
                            ? 'text-slate-600 hover:bg-slate-200/60 hover:text-slate-800' 
                            : 'text-gray-400 hover:bg-white/5 hover:text-gray-200'
                      }`}
                    >
                      <Layers className="h-3.5 w-3.5" />
                      <span>{isRtl ? 'اتاق‌های عضو' : 'Rooms List'}</span>
                    </button>

                    <button
                      onClick={() => setActiveUserDetailTab('media')}
                      className={`flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-medium transition-all duration-200 shrink-0 ${
                        activeUserDetailTab === 'media' 
                          ? 'bg-indigo-600 text-white shadow' 
                          : isLightMode 
                            ? 'text-slate-600 hover:bg-slate-200/60 hover:text-slate-800' 
                            : 'text-gray-400 hover:bg-white/5 hover:text-gray-200'
                      }`}
                    >
                      <HardDrive className="h-3.5 w-3.5" />
                      <span>{isRtl ? 'فایل‌های آپلودی' : 'Media Cache'}</span>
                    </button>

                    <button
                      onClick={() => setActiveUserDetailTab('pushers')}
                      className={`flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-medium transition-all duration-200 shrink-0 ${
                        activeUserDetailTab === 'pushers' 
                          ? 'bg-indigo-600 text-white shadow' 
                          : isLightMode 
                            ? 'text-slate-600 hover:bg-slate-200/60 hover:text-slate-800' 
                            : 'text-gray-400 hover:bg-white/5 hover:text-gray-200'
                      }`}
                    >
                      <Zap className="h-3.5 w-3.5" />
                      <span>{isRtl ? 'پوشرها و اعلان‌ها' : 'Pushers & Alerts'}</span>
                    </button>

                    <button
                      onClick={() => setActiveUserDetailTab('limits')}
                      className={`flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-medium transition-all duration-200 shrink-0 ${
                        activeUserDetailTab === 'limits' 
                          ? 'bg-indigo-600 text-white shadow' 
                          : isLightMode 
                            ? 'text-slate-600 hover:bg-slate-200/60 hover:text-slate-800' 
                            : 'text-gray-400 hover:bg-white/5 hover:text-gray-200'
                      }`}
                    >
                      <Sliders className="h-3.5 w-3.5" />
                      <span>{isRtl ? 'محدودیت نرخ' : 'Rate Limits'}</span>
                    </button>

                    <button
                      onClick={() => setActiveUserDetailTab('account')}
                      className={`flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-medium transition-all duration-200 shrink-0 ${
                        activeUserDetailTab === 'account' 
                          ? 'bg-indigo-600 text-white shadow' 
                          : isLightMode 
                            ? 'text-slate-600 hover:bg-slate-200/60 hover:text-slate-800' 
                            : 'text-gray-400 hover:bg-white/5 hover:text-gray-200'
                      }`}
                    >
                      <FileText className="h-3.5 w-3.5" />
                      <span>{isRtl ? 'دیتاهای اکانت' : 'Account Data'}</span>
                    </button>

                    <button
                      onClick={() => setActiveUserDetailTab('history')}
                      className={`flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-medium transition-all duration-200 shrink-0 ${
                        activeUserDetailTab === 'history' 
                          ? 'bg-indigo-600 text-white shadow' 
                          : isLightMode 
                            ? 'text-slate-600 hover:bg-slate-200/60 hover:text-slate-800' 
                            : 'text-gray-400 hover:bg-white/5 hover:text-gray-200'
                      }`}
                    >
                      <History className="h-3.5 w-3.5" />
                      <span>{isRtl ? 'لاگ‌های گفتگو' : 'Chat & History'}</span>
                    </button>
                  </div>

                  {/* Right Tab Content area */}
                  <div className="flex-1 p-6 overflow-y-auto space-y-6 text-sm">
                    
                    {/* SUB-TAB 1: USER SUMMARY */}
                    {activeUserDetailTab === 'user' && (
                       <div className="space-y-6">
                        {/* Meta info header card */}
                        <div className={`p-5 rounded-xl border space-y-3 ${
                          isLightMode ? 'bg-white border-slate-200 shadow-sm' : 'bg-black/30 border-white/5'
                        }`}>
                          <h4 className="text-xs text-indigo-400 font-mono font-bold uppercase tracking-wider">
                            {isRtl ? 'شناسنامه کاربر ماتریکس' : 'Matrix Core Identity Card'}
                          </h4>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-mono">
                            <div className={`flex justify-between border-b ${isLightMode ? 'border-slate-100' : 'border-white/5'} pb-2`}>
                              <span className={isLightMode ? 'text-slate-500' : 'text-gray-500'}>Created at:</span>
                              <span className={`font-semibold ${isLightMode ? 'text-slate-800' : 'text-gray-300'}`}>
                                {selectedUserDetails.createdAt ? new Date(selectedUserDetails.createdAt).toLocaleString() : 'N/A'}
                              </span>
                            </div>
                            <div className={`flex justify-between border-b ${isLightMode ? 'border-slate-100' : 'border-white/5'} pb-2`}>
                              <span className={isLightMode ? 'text-slate-500' : 'text-gray-500'}>MXID:</span>
                              <span className={`font-semibold ${isLightMode ? 'text-slate-800' : 'text-gray-300'}`}>{selectedUserDetails.mxid}</span>
                            </div>
                            <div className={`flex justify-between border-b ${isLightMode ? 'border-slate-100' : 'border-white/5'} pb-2`}>
                              <span className={isLightMode ? 'text-slate-500' : 'text-gray-500'}>User type:</span>
                              <span className="text-indigo-500 font-semibold uppercase">{selectedUserDetails.userType || 'matrix'}</span>
                            </div>
                            <div className={`flex justify-between items-center border-b ${isLightMode ? 'border-slate-100' : 'border-white/5'} pb-2 min-h-[36px]`}>
                              <span className={isLightMode ? 'text-slate-500' : 'text-gray-500'}>Display name:</span>
                              {isEditingDisplayName ? (
                                <div className="flex items-center gap-1.5">
                                  <input
                                    type="text"
                                    value={tempDisplayName}
                                    onChange={(e) => setTempDisplayName(e.target.value)}
                                    className={`px-2 py-0.5 text-xs rounded border outline-none font-sans ${
                                      isLightMode
                                        ? 'bg-white border-slate-300 text-slate-800 focus:border-indigo-500'
                                        : 'bg-black/40 border-white/10 text-gray-200 focus:border-indigo-500'
                                    }`}
                                    autoFocus
                                    onKeyDown={(e) => {
                                      if (e.key === 'Enter') {
                                        handleUpdateUserParams({ displayName: tempDisplayName });
                                        setIsEditingDisplayName(false);
                                      } else if (e.key === 'Escape') {
                                        setIsEditingDisplayName(false);
                                      }
                                    }}
                                  />
                                  <button
                                    onClick={() => {
                                      handleUpdateUserParams({ displayName: tempDisplayName });
                                      setIsEditingDisplayName(false);
                                    }}
                                    className="p-1 text-emerald-500 hover:bg-emerald-500/10 rounded transition-colors"
                                    title="Save"
                                  >
                                    <Check className="h-3.5 w-3.5" />
                                  </button>
                                  <button
                                    onClick={() => setIsEditingDisplayName(false)}
                                    className="p-1 text-red-500 hover:bg-red-500/10 rounded transition-colors"
                                    title="Cancel"
                                  >
                                    <X className="h-3.5 w-3.5" />
                                  </button>
                                </div>
                              ) : (
                                <div className="flex items-center gap-1.5 group/edit">
                                  <span className={`font-semibold ${isLightMode ? 'text-slate-800' : 'text-gray-300'}`}>
                                    {selectedUserDetails.displayName || 'N/A'}
                                  </span>
                                  {hasWriteAccess && (
                                    <button
                                      onClick={() => {
                                        setTempDisplayName(selectedUserDetails.displayName || '');
                                        setIsEditingDisplayName(true);
                                      }}
                                      className={`p-1 rounded opacity-0 group-hover/edit:opacity-100 transition-all duration-200 ${
                                        isLightMode ? 'hover:bg-slate-100 text-slate-400 hover:text-slate-600' : 'hover:bg-white/5 text-gray-500 hover:text-gray-300'
                                      }`}
                                      title="Edit Display Name"
                                    >
                                      <Edit className="h-3 w-3" />
                                    </button>
                                  )}
                                </div>
                              )}
                            </div>
                          </div>
                        </div>

                        {/* Status flags */}
                        <div className="space-y-4">
                          <h4 className="text-xs text-indigo-400 font-semibold uppercase tracking-wider">
                            {isRtl ? 'محدودیت‌ها و وضعیت حساب' : 'Account Status Flags'}
                          </h4>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            {/* Suspended flag */}
                            <div className={`p-4 border rounded-xl flex items-start gap-3 ${
                              isLightMode ? 'bg-white border-slate-200 shadow-sm' : 'bg-black/20 border-white/5'
                            }`}>
                              <input
                                type="checkbox"
                                disabled={!hasWriteAccess}
                                checked={!!selectedUserDetails.isSuspended}
                                onChange={(e) => setSelectedUserDetails((prev: any) => ({ ...prev, isSuspended: e.target.checked }))}
                                className="h-4 w-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 mt-1 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                              />
                              <div>
                                <span className={`block font-semibold ${isLightMode ? 'text-slate-800' : 'text-gray-200'}`}>Suspended</span>
                                <span className={`block text-xs mt-0.5 leading-relaxed ${isLightMode ? 'text-slate-500' : 'text-gray-400'}`}>
                                  Suspending this user places them in read-only mode across all rooms.
                                </span>
                              </div>
                            </div>

                            {/* Shadow Banned flag */}
                            <div className={`p-4 border rounded-xl flex items-start gap-3 ${
                              isLightMode ? 'bg-white border-slate-200 shadow-sm' : 'bg-black/20 border-white/5'
                            }`}>
                              <input
                                type="checkbox"
                                disabled={!hasWriteAccess}
                                checked={!!selectedUserDetails.isShadowBanned}
                                onChange={(e) => setSelectedUserDetails((prev: any) => ({ ...prev, isShadowBanned: e.target.checked }))}
                                className="h-4 w-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 mt-1 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                              />
                              <div>
                                <span className={`block font-semibold ${isLightMode ? 'text-slate-800' : 'text-gray-200'}`}>Shadow banned</span>
                                <span className={`block text-xs mt-0.5 leading-relaxed ${isLightMode ? 'text-slate-500' : 'text-gray-400'}`}>
                                  A shadow-banned user receives normal responses, but their events are not propagated to other users.
                                </span>
                              </div>
                            </div>

                            {/* Locked flag */}
                            <div className={`p-4 border rounded-xl flex items-start gap-3 ${
                              isLightMode ? 'bg-white border-slate-200 shadow-sm' : 'bg-black/20 border-white/5'
                            }`}>
                              <input
                                type="checkbox"
                                disabled={!hasWriteAccess}
                                checked={!!selectedUserDetails.isLocked}
                                onChange={(e) => setSelectedUserDetails((prev: any) => ({ ...prev, isLocked: e.target.checked }))}
                                className="h-4 w-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 mt-1 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                              />
                              <div>
                                <span className={`block font-semibold ${isLightMode ? 'text-slate-800' : 'text-gray-200'}`}>Locked</span>
                                <span className={`block text-xs mt-0.5 leading-relaxed ${isLightMode ? 'text-slate-500' : 'text-gray-400'}`}>
                                  Prevent the user from usefully using their account. Reversible and non-destructive.
                                </span>
                              </div>
                            </div>

                            {/* Disable Client-Side Password Change flag */}
                            <div className={`p-4 border rounded-xl flex items-start gap-3 ${
                              isLightMode ? 'bg-white border-slate-200 shadow-sm' : 'bg-black/20 border-white/5'
                            }`}>
                              <input
                                type="checkbox"
                                disabled={!hasWriteAccess}
                                checked={!!selectedUserDetails.disableClientPasswordChange}
                                onChange={(e) => setSelectedUserDetails((prev: any) => ({ ...prev, disableClientPasswordChange: e.target.checked }))}
                                className="h-4 w-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 mt-1 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                              />
                              <div>
                                <span className={`block font-semibold ${isLightMode ? 'text-slate-800' : 'text-gray-200'}`}>
                                  {isRtl ? 'غیرفعال‌سازی تغییر رمز از کلاینت' : 'Disable Client-Side Password Change'}
                                </span>
                                <span className={`block text-xs mt-0.5 leading-relaxed ${isLightMode ? 'text-slate-500' : 'text-gray-400'}`}>
                                  {isRtl 
                                    ? 'جلوگیری از تغییر رمز عبور کاربر از طریق برنامه‌های ماتریکس (کلاینت ساید).' 
                                    : 'Prevent the user from changing their account password from Matrix clients.'}
                                </span>
                              </div>
                            </div>

                            {/* Disable Client-Side Account Deactivation flag */}
                            <div className={`p-4 border rounded-xl flex items-start gap-3 ${
                              isLightMode ? 'bg-white border-slate-200 shadow-sm' : 'bg-black/20 border-white/5'
                            }`}>
                              <input
                                type="checkbox"
                                disabled={!hasWriteAccess}
                                checked={!!selectedUserDetails.disableClientAccountDeactivation}
                                onChange={(e) => setSelectedUserDetails((prev: any) => ({ ...prev, disableClientAccountDeactivation: e.target.checked }))}
                                className="h-4 w-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 mt-1 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                              />
                              <div>
                                <span className={`block font-semibold ${isLightMode ? 'text-slate-800' : 'text-gray-200'}`}>
                                  {isRtl ? 'غیرفعال‌سازی حذف حساب از کلاینت' : 'Disable Client-Side Account Deactivation'}
                                </span>
                                <span className={`block text-xs mt-0.5 leading-relaxed ${isLightMode ? 'text-slate-500' : 'text-gray-400'}`}>
                                  {isRtl 
                                    ? 'جلوگیری از دی‌اکتیو یا غیرفعال‌سازی حساب توسط خود کاربر از داخل کلاینت.' 
                                    : 'Prevent the user from deactivating their account from Matrix clients.'}
                                </span>
                              </div>
                            </div>

                            {/* Disable Client-Side Avatar Change flag */}
                            <div className={`p-4 border rounded-xl flex items-start gap-3 ${
                              isLightMode ? 'bg-white border-slate-200 shadow-sm' : 'bg-black/20 border-white/5'
                            }`}>
                              <input
                                type="checkbox"
                                disabled={!hasWriteAccess}
                                checked={!!selectedUserDetails.disableClientAvatarChange}
                                onChange={(e) => setSelectedUserDetails((prev: any) => ({ ...prev, disableClientAvatarChange: e.target.checked }))}
                                className="h-4 w-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 mt-1 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                              />
                              <div>
                                <span className={`block font-semibold ${isLightMode ? 'text-slate-800' : 'text-gray-200'}`}>
                                  {isRtl ? 'غیرفعال‌سازی تغییر عکس پروفایل' : 'Disable Client-Side Avatar Change'}
                                </span>
                                <span className={`block text-xs mt-0.5 leading-relaxed ${isLightMode ? 'text-slate-500' : 'text-gray-400'}`}>
                                  {isRtl 
                                    ? 'جلوگیری از تغییر عکس پروفایل یا آواتار کاربر از داخل برنامه‌های ماتریکس.' 
                                    : 'Prevent the user from changing their profile picture/avatar from Matrix clients.'}
                                </span>
                              </div>
                            </div>

                            {/* Server Administrator flag */}
                            <div className={`p-4 border rounded-xl flex items-start gap-3 ${
                              isLightMode ? 'bg-white border-slate-200 shadow-sm' : 'bg-black/20 border-white/5'
                            }`}>
                              <input
                                type="checkbox"
                                disabled={!hasWriteAccess}
                                checked={!!selectedUserDetails.isAdmin}
                                onChange={(e) => setSelectedUserDetails((prev: any) => ({ ...prev, isAdmin: e.target.checked }))}
                                className="h-4 w-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 mt-1 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                              />
                              <div>
                                <span className={`block font-semibold flex items-center gap-1.5 ${isLightMode ? 'text-purple-600' : 'text-purple-400'}`}>
                                  <Shield className="h-3.5 w-3.5" />
                                  <span>Server Administrator</span>
                                </span>
                                <span className={`block text-xs mt-0.5 leading-relaxed ${isLightMode ? 'text-slate-500' : 'text-gray-400'}`}>
                                  Allows full root administrative access to the Synapse configuration APIs.
                                </span>
                              </div>
                            </div>

                            {/* Erased flag */}
                            <div className={`p-4 border rounded-xl flex items-start gap-3 ${
                              isLightMode ? 'bg-white border-slate-200 shadow-sm' : 'bg-black/20 border-white/5'
                            }`}>
                              <input
                                type="checkbox"
                                disabled={!hasWriteAccess}
                                checked={!!selectedUserDetails.isErased}
                                onChange={(e) => setSelectedUserDetails((prev: any) => ({ ...prev, isErased: e.target.checked }))}
                                className="h-4 w-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 mt-1 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                              />
                              <div>
                                <span className={`block font-semibold ${isLightMode ? 'text-red-600' : 'text-red-400'}`}>Erased</span>
                                <span className={`block text-xs mt-0.5 leading-relaxed ${isLightMode ? 'text-slate-500' : 'text-gray-400'}`}>
                                  Marks the user as permanently deleted to comply with GDPR/deletion requests.
                                </span>
                              </div>
                            </div>
                          </div>

                          {/* Save Button for status flags */}
                          {hasWriteAccess && (
                            <div className="flex justify-end pt-3">
                              <button
                                disabled={isSavingUserParams || !hasWriteAccess}
                                onClick={() => {
                                  handleUpdateUserParams({
                                    isSuspended: !!selectedUserDetails.isSuspended,
                                    isShadowBanned: !!selectedUserDetails.isShadowBanned,
                                    isLocked: !!selectedUserDetails.isLocked,
                                    disableClientPasswordChange: !!selectedUserDetails.disableClientPasswordChange,
                                    disableClientAccountDeactivation: !!selectedUserDetails.disableClientAccountDeactivation,
                                    disableClientAvatarChange: !!selectedUserDetails.disableClientAvatarChange,
                                    isAdmin: !!selectedUserDetails.isAdmin,
                                    isErased: !!selectedUserDetails.isErased,
                                  });
                                }}
                                className={`flex items-center gap-1.5 px-5 py-2.5 text-xs font-semibold rounded-lg shadow-sm transition-all duration-300 cursor-pointer ${
                                  isSavingUserParams || !hasWriteAccess
                                    ? 'opacity-50 cursor-not-allowed bg-slate-500 text-white'
                                    : isLightMode
                                      ? 'bg-indigo-600 hover:bg-indigo-700 text-white hover:shadow'
                                      : 'bg-indigo-500 hover:bg-indigo-600 text-white hover:shadow-lg'
                                }`}
                              >
                                {isSavingUserParams ? (
                                  <RefreshCw className="h-3.5 w-3.5 animate-spin" />
                                ) : (
                                  <Save className="h-3.5 w-3.5" />
                                )}
                                <span>
                                  {isSavingUserParams
                                    ? (isRtl ? 'در حال ذخیره‌سازی...' : 'Saving changes...')
                                    : (isRtl ? 'ذخیره تغییرات وضعیت حساب' : 'Save Account Status Flags')}
                                </span>
                              </button>
                            </div>
                          )}
                        </div>

                        {/* Password resets */}
                        {hasWriteAccess && (
                          <div className={`p-5 rounded-xl border space-y-4 ${
                            isLightMode ? 'bg-white border-slate-200 shadow-sm' : 'bg-black/20 border-white/5'
                          }`}>
                            <h4 className="text-xs text-red-400 font-semibold uppercase tracking-wider flex items-center gap-1.5">
                              <Lock className="h-4 w-4" />
                              <span>{isRtl ? 'تغییر رمز عبور کاربر' : 'Force Reset User Password'}</span>
                            </h4>
                            <p className={`text-xs ${isLightMode ? 'text-slate-500' : 'text-gray-400'}`}>
                              {isRtl ? 'تغییر رمز عبور باعث خروج فوری کاربر از تمام دستگاه‌ها و نشست‌ها می‌شود.' : 'Changing the password will immediately log the user out of all sessions for security compliance.'}
                            </p>
                            <form onSubmit={handleResetPassword} className="flex gap-2 max-w-md">
                              <input
                                type="password"
                                value={newPassword}
                                onChange={(e) => setNewPassword(e.target.value)}
                                placeholder="New password string"
                                className={`flex-1 border rounded-lg p-2.5 outline-none text-xs font-mono transition-colors ${
                                  isLightMode 
                                    ? 'bg-white border-slate-300 text-slate-800 focus:border-indigo-500' 
                                    : 'bg-black/40 border-white/10 text-gray-200 focus:border-indigo-500'
                                }`}
                              />
                              <button
                                type="submit"
                                className={`px-4 py-2 rounded-lg text-xs font-medium transition-colors ${
                                  isLightMode 
                                    ? 'bg-red-50 hover:bg-red-100 text-red-600 border border-red-200' 
                                    : 'bg-red-600/20 hover:bg-red-600/30 text-red-300 border border-red-500/20'
                                }`}
                              >
                                Update
                              </button>
                            </form>
                          </div>
                        )}
                      </div>
                    )}

                    {/* SUB-TAB 2: CONTACT INFO */}
                    {activeUserDetailTab === 'contact' && (
                      <div className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          
                          {/* Emails */}
                          <div className={`space-y-4 p-5 rounded-xl border ${
                            isLightMode ? 'bg-white border-slate-200 shadow-sm' : 'bg-slate-950/10 border-white/5'
                          }`}>
                            <h4 className="text-xs text-indigo-400 font-bold uppercase tracking-wider flex items-center gap-1.5">
                              <Mail className="h-4 w-4" />
                              <span>Email Addresses</span>
                            </h4>
                            <form onSubmit={handleAddEmail} className="flex gap-2">
                              <input
                                type="email"
                                value={newEmail}
                                onChange={(e) => setNewEmail(e.target.value)}
                                placeholder="Add email address"
                                className={`flex-1 border rounded-lg p-2.5 outline-none text-xs ${
                                  isLightMode ? 'bg-white border-slate-300 text-slate-800' : 'bg-black/40 border-white/10 text-gray-200'
                                }`}
                              />
                              <button
                                type="submit"
                                className="px-3 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-medium transition-colors"
                              >
                                Add
                              </button>
                            </form>
                            <div className={`divide-y max-h-48 overflow-y-auto ${isLightMode ? 'divide-slate-100' : 'divide-white/5'}`}>
                              {!selectedUserDetails.emails || selectedUserDetails.emails.length === 0 ? (
                                <p className="text-xs text-gray-500 py-3 text-center italic">No registered emails.</p>
                              ) : (
                                selectedUserDetails.emails.map((email: string) => (
                                  <div key={email} className={`flex justify-between items-center py-2 text-xs font-mono ${
                                    isLightMode ? 'text-slate-700' : 'text-gray-300'
                                  }`}>
                                    <span>{email}</span>
                                    <button
                                      onClick={() => handleRemoveEmail(email)}
                                      className="p-1 text-red-400 hover:bg-red-500/10 rounded transition-colors"
                                    >
                                      <Trash2 className="h-3.5 w-3.5" />
                                    </button>
                                  </div>
                                ))
                              )}
                            </div>
                          </div>

                          {/* Phones */}
                          <div className={`space-y-4 p-5 rounded-xl border ${
                            isLightMode ? 'bg-white border-slate-200 shadow-sm' : 'bg-slate-950/10 border-white/5'
                          }`}>
                            <h4 className="text-xs text-indigo-400 font-bold uppercase tracking-wider flex items-center gap-1.5">
                              <Phone className="h-4 w-4" />
                              <span>Phone Numbers</span>
                            </h4>
                            <form onSubmit={handleAddPhone} className="flex gap-2">
                              <input
                                type="text"
                                value={newPhone}
                                onChange={(e) => setNewPhone(e.target.value)}
                                placeholder="Add phone (e.g. +989123456789)"
                                className={`flex-1 border rounded-lg p-2.5 outline-none text-xs font-mono ${
                                  isLightMode ? 'bg-white border-slate-300 text-slate-800' : 'bg-black/40 border-white/10 text-gray-200'
                                }`}
                              />
                              <button
                                type="submit"
                                className="px-3 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-medium transition-colors"
                              >
                                Add
                              </button>
                            </form>
                            <div className={`divide-y max-h-48 overflow-y-auto ${isLightMode ? 'divide-slate-100' : 'divide-white/5'}`}>
                              {!selectedUserDetails.phones || selectedUserDetails.phones.length === 0 ? (
                                <p className="text-xs text-gray-500 py-3 text-center italic">No registered phone numbers.</p>
                              ) : (
                                selectedUserDetails.phones.map((phone: string) => (
                                  <div key={phone} className={`flex justify-between items-center py-2 text-xs font-mono ${
                                    isLightMode ? 'text-slate-700' : 'text-gray-300'
                                  }`}>
                                    <span>{phone}</span>
                                    <button
                                      onClick={() => handleRemovePhone(phone)}
                                      className="p-1 text-red-400 hover:bg-red-500/10 rounded transition-colors"
                                    >
                                      <Trash2 className="h-3.5 w-3.5" />
                                    </button>
                                  </div>
                                ))
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* SUB-TAB 3: SSO & LINKAGE */}
                    {activeUserDetailTab === 'sso' && (
                      <div className="space-y-4">
                        <div className={`p-5 rounded-xl border space-y-4 ${
                          isLightMode ? 'bg-white border-slate-200 shadow-sm' : 'bg-black/20 border-white/5'
                        }`}>
                          <h4 className="text-xs text-indigo-400 font-bold uppercase tracking-wider flex items-center gap-1.5">
                            <Network className="h-4 w-4" />
                            <span>Single Sign-On (SSO) Providers</span>
                          </h4>
                          <p className={`text-xs ${isLightMode ? 'text-slate-500' : 'text-gray-400'}`}>
                            View SSO external identifier mappings configured for federated user registration.
                          </p>
                          <div className="space-y-3 font-mono text-xs">
                            <div className={`flex justify-between border-b ${isLightMode ? 'border-slate-100' : 'border-white/5'} pb-2`}>
                              <span className={isLightMode ? 'text-slate-500' : 'text-gray-500'}>SSO Linked status:</span>
                              <span className={selectedUserDetails.sso?.linked ? 'text-emerald-500 font-bold' : 'text-gray-500'}>
                                {selectedUserDetails.sso?.linked ? 'Linked' : 'Not Linked'}
                              </span>
                            </div>
                            {selectedUserDetails.sso?.linked && (
                              <>
                                <div className={`flex justify-between border-b ${isLightMode ? 'border-slate-100' : 'border-white/5'} pb-2`}>
                                  <span className={isLightMode ? 'text-slate-500' : 'text-gray-500'}>Provider:</span>
                                  <span className={`font-semibold ${isLightMode ? 'text-slate-800' : 'text-gray-200'}`}>{selectedUserDetails.sso?.provider}</span>
                                </div>
                                <div className={`flex justify-between border-b ${isLightMode ? 'border-slate-100' : 'border-white/5'} pb-2`}>
                                  <span className={isLightMode ? 'text-slate-500' : 'text-gray-500'}>External ID:</span>
                                  <span className={`font-semibold ${isLightMode ? 'text-slate-800' : 'text-gray-200'}`}>{selectedUserDetails.sso?.externalId}</span>
                                </div>
                              </>
                            )}
                          </div>
                        </div>
                      </div>
                    )}

                    {/* SUB-TAB 4: DEVICES & SESSIONS */}
                    {activeUserDetailTab === 'devices' && (
                      <div className="space-y-4">
                        <h4 className="text-xs text-indigo-400 font-bold uppercase tracking-wider flex items-center gap-1.5">
                          <Laptop className="h-4 w-4" />
                          <span>Active Client Devices & Matrix Sessions</span>
                        </h4>
                        <div className={`border rounded-xl overflow-hidden ${
                          isLightMode ? 'border-slate-200 bg-white shadow-sm' : 'bg-black/20 border-white/5'
                        }`}>
                          <table className="w-full text-left text-xs font-mono">
                            <thead>
                              <tr className={`${
                                isLightMode ? 'bg-slate-100/80 text-slate-600 border-b border-slate-200' : 'bg-black/40 text-gray-400 border-b border-white/5'
                              }`}>
                                <th className="p-3">Device ID</th>
                                <th className="p-3">Display Name</th>
                                <th className="p-3">Last Seen IP</th>
                                <th className="p-3">User Agent</th>
                                <th className="p-3 text-center">Terminate</th>
                              </tr>
                            </thead>
                            <tbody className={`divide-y ${isLightMode ? 'divide-slate-100' : 'divide-white/5'}`}>
                              {!selectedUserDetails.devices || selectedUserDetails.devices.length === 0 ? (
                                <tr>
                                  <td colSpan={5} className="p-5 text-center text-gray-500 italic">No active devices.</td>
                                </tr>
                              ) : (
                                selectedUserDetails.devices.map((dev: any) => (
                                  <tr key={dev.id} className={`transition-colors ${
                                    isLightMode ? 'hover:bg-slate-50/50 text-slate-700' : 'hover:bg-white/5 text-gray-300'
                                  }`}>
                                    <td className={`p-3 font-bold ${isLightMode ? 'text-indigo-600' : 'text-indigo-300'}`}>{dev.id}</td>
                                    <td className="p-3 font-sans">{dev.displayName || dev.name || 'Unnamed Device'}</td>
                                    <td className="p-3">{dev.lastSeenIp || 'Unknown'}</td>
                                    <td className={`p-3 max-w-[200px] truncate font-sans ${isLightMode ? 'text-slate-400' : 'text-gray-500'}`} title={dev.userAgent}>
                                      {dev.userAgent || 'N/A'}
                                    </td>
                                    <td className="p-3 text-center">
                                      <button
                                        onClick={() => handleTerminateDevice(dev.id)}
                                        className="p-1 text-red-400 hover:bg-red-500/15 rounded transition-all duration-200"
                                      >
                                        <X className="h-4 w-4" />
                                      </button>
                                    </td>
                                  </tr>
                                ))
                              )}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    )}

                    {/* SUB-TAB 5: ROOMS MEMBERSHIPS */}
                    {activeUserDetailTab === 'rooms' && (
                      <div className="space-y-4">
                        <h4 className="text-xs text-indigo-400 font-bold uppercase tracking-wider flex items-center gap-1.5">
                          <Layers className="h-4 w-4" />
                          <span>Joined Room Memberships & Moderation</span>
                        </h4>
                        <div className={`border rounded-xl overflow-hidden ${
                          isLightMode ? 'border-slate-200 bg-white shadow-sm' : 'bg-black/20 border-white/5'
                        }`}>
                          <table className="w-full text-left text-xs font-mono">
                            <thead>
                              <tr className={`${
                                isLightMode ? 'bg-slate-100/80 text-slate-600 border-b border-slate-200' : 'bg-black/40 text-gray-400 border-b border-white/5'
                              }`}>
                                <th className="p-3">Room Name</th>
                                <th className="p-3">Room ID</th>
                                <th className="p-3 text-center">Power Level</th>
                                <th className="p-3 text-center">Actions</th>
                              </tr>
                            </thead>
                            <tbody className={`divide-y ${isLightMode ? 'divide-slate-100' : 'divide-white/5'}`}>
                              {!selectedUserDetails.memberships || selectedUserDetails.memberships.length === 0 ? (
                                <tr>
                                  <td colSpan={4} className="p-5 text-center text-gray-500 italic">This user is not currently in any rooms.</td>
                                </tr>
                              ) : (
                                selectedUserDetails.memberships.map((m: any) => (
                                  <tr key={m.roomId} className={`transition-colors ${
                                    isLightMode ? 'hover:bg-slate-50/50 text-slate-700' : 'hover:bg-white/5 text-gray-300'
                                  }`}>
                                    <td className={`p-3 font-sans font-semibold ${isLightMode ? 'text-slate-800' : 'text-gray-200'}`}>{m.roomName}</td>
                                    <td className="p-3 text-gray-500 select-all">{m.roomId}</td>
                                    <td className="p-3 text-center">
                                      <span className={`px-2 py-0.5 border rounded font-bold ${
                                        isLightMode ? 'bg-slate-100 border-slate-200 text-indigo-600' : 'bg-slate-900/60 border-white/5 text-indigo-400'
                                      }`}>
                                        {m.powerLevel ?? 100}
                                      </span>
                                    </td>
                                    <td className="p-3 text-center">
                                      <div className="flex justify-center items-center gap-2">
                                        <button
                                          onClick={() => handleUserRoomAction(m.roomId, 'kick')}
                                          className="px-2 py-1 text-[10px] bg-amber-600/10 hover:bg-amber-600/20 text-amber-500 border border-amber-500/20 rounded font-sans transition-colors"
                                        >
                                          Kick
                                        </button>
                                        <button
                                          onClick={() => handleUserRoomAction(m.roomId, 'ban')}
                                          className="px-2 py-1 text-[10px] bg-red-600/10 hover:bg-red-600/20 text-red-500 border border-red-500/20 rounded font-sans transition-colors"
                                        >
                                          Ban
                                        </button>
                                      </div>
                                    </td>
                                  </tr>
                                ))
                              )}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    )}

                    {/* SUB-TAB 6: USER MEDIA CACHE */}
                    {activeUserDetailTab === 'media' && (
                      <div className="space-y-4">
                        <h4 className="text-xs text-indigo-400 font-bold uppercase tracking-wider flex items-center gap-1.5">
                          <HardDrive className="h-4 w-4" />
                          <span>Uploaded Media Cache Assets</span>
                        </h4>
                        <div className={`border rounded-xl overflow-hidden ${
                          isLightMode ? 'border-slate-200 bg-white shadow-sm' : 'bg-black/20 border-white/5'
                        }`}>
                          <table className="w-full text-left text-xs font-mono">
                            <thead>
                              <tr className={`${
                                isLightMode ? 'bg-slate-100/80 text-slate-600 border-b border-slate-200' : 'bg-black/40 text-gray-400 border-b border-white/5'
                              }`}>
                                <th className="p-3">File Name</th>
                                <th className="p-3">Media ID</th>
                                <th className="p-3">Size</th>
                                <th className="p-3 text-center">Status</th>
                                <th className="p-3 text-center">Action</th>
                              </tr>
                            </thead>
                            <tbody className={`divide-y ${isLightMode ? 'divide-slate-100' : 'divide-white/5'}`}>
                              {!selectedUserDetails.media || selectedUserDetails.media.length === 0 ? (
                                <tr>
                                  <td colSpan={5} className="p-5 text-center text-gray-500 italic">No uploaded media recorded for this user.</td>
                                </tr>
                              ) : (
                                selectedUserDetails.media.map((med: any) => (
                                  <tr key={med.mediaId} className={`transition-colors ${
                                    isLightMode ? 'hover:bg-slate-50/50 text-slate-700' : 'hover:bg-white/5 text-gray-300'
                                  }`}>
                                    <td className={`p-3 font-sans font-semibold ${isLightMode ? 'text-slate-800' : 'text-gray-200'}`}>{med.fileName}</td>
                                    <td className="p-3 text-gray-500 select-all">{med.mediaId}</td>
                                    <td className={`p-3 font-bold ${isLightMode ? 'text-indigo-600' : 'text-indigo-300'}`}>
                                      {(med.size / (1024 * 1024)).toFixed(2)} MB
                                    </td>
                                    <td className="p-3 text-center">
                                      {med.quarantined ? (
                                        <span className="inline-flex px-1.5 py-0.5 rounded text-[10px] uppercase font-bold bg-red-600/10 text-red-500 border border-red-500/20">Quarantined</span>
                                      ) : (
                                        <span className="inline-flex px-1.5 py-0.5 rounded text-[10px] uppercase font-bold bg-emerald-600/10 text-emerald-500 border border-emerald-500/20">Normal</span>
                                      )}
                                    </td>
                                    <td className="p-3 text-center">
                                      <button
                                        onClick={() => handleQuarantineMedia(med.mediaId, !med.quarantined)}
                                        className={`px-2 py-1 text-[10px] rounded font-sans border transition-all ${
                                          med.quarantined 
                                            ? 'bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-500 border-emerald-500/30' 
                                            : 'bg-red-600/20 hover:bg-red-600/30 text-red-500 border-red-500/30'
                                        }`}
                                      >
                                        {med.quarantined ? 'Release' : 'Quarantine'}
                                      </button>
                                    </td>
                                  </tr>
                                ))
                              )}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    )}

                    {/* SUB-TAB 7: PUSHERS */}
                    {activeUserDetailTab === 'pushers' && (
                      <div className="space-y-4">
                        <div className={`p-5 rounded-xl border space-y-4 ${
                          isLightMode ? 'bg-white border-slate-200 shadow-sm' : 'bg-black/20 border-white/5'
                        }`}>
                          <h4 className="text-xs text-indigo-400 font-bold uppercase tracking-wider flex items-center gap-1.5">
                            <Zap className="h-4 w-4" />
                            <span>Registered Push Gateways (Pushers)</span>
                          </h4>
                          <p className={`text-xs ${isLightMode ? 'text-slate-500' : 'text-gray-400'}`}>
                            Listed are pushers registered by mobile or web clients to route push notifications through external gateways like FCM/UnifiedPush.
                          </p>
                          <div className={`divide-y text-xs font-mono ${isLightMode ? 'divide-slate-100' : 'divide-white/5'}`}>
                            {!selectedUserDetails.pushers || selectedUserDetails.pushers.length === 0 ? (
                              <p className="text-xs text-gray-500 py-3 text-center italic">No pushers configured for this account.</p>
                            ) : (
                              selectedUserDetails.pushers.map((push: any, i: number) => (
                                <div key={i} className="py-3 space-y-1">
                                  <div className="flex justify-between">
                                    <span className={isLightMode ? 'text-slate-400' : 'text-gray-500'}>App ID:</span>
                                    <span className={`font-bold ${isLightMode ? 'text-indigo-600' : 'text-indigo-400'}`}>{push.appId}</span>
                                  </div>
                                  <div className="flex justify-between">
                                    <span className={isLightMode ? 'text-slate-400' : 'text-gray-500'}>Push Key (Gateway):</span>
                                    <span className={`select-all ${isLightMode ? 'text-slate-800' : 'text-gray-300'}`}>{push.pushKey}</span>
                                  </div>
                                  <div className="flex justify-between">
                                    <span className={isLightMode ? 'text-slate-400' : 'text-gray-500'}>Kind:</span>
                                    <span className={`font-sans ${isLightMode ? 'text-slate-700' : 'text-gray-400'}`}>{push.kind || 'http'}</span>
                                  </div>
                                </div>
                              ))
                            )}
                          </div>
                        </div>
                      </div>
                    )}

                    {/* SUB-TAB 8: RATE LIMITS */}
                    {activeUserDetailTab === 'limits' && (
                      <div className="space-y-4">
                        <form onSubmit={handleSaveRateLimits} className={`p-5 rounded-xl border space-y-4 ${
                          isLightMode ? 'bg-white border-slate-200 shadow-sm' : 'bg-black/20 border-white/5'
                        }`}>
                          <h4 className="text-xs text-indigo-400 font-bold uppercase tracking-wider flex items-center gap-1.5">
                            <Sliders className="h-4 w-4" />
                            <span>Custom Homeserver Rate Limits</span>
                          </h4>
                          <p className={`text-xs ${isLightMode ? 'text-slate-500' : 'text-gray-400'}`}>
                            Configure explicit request rate limits for this Matrix account to bypass global homeserver constraints.
                          </p>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div className="space-y-1">
                              <label className="block text-xs text-gray-500 font-mono">Requests Per Second (`per_second`):</label>
                              <input
                                type="number"
                                step="0.1"
                                value={userRateLimits.perSecond}
                                onChange={(e) => setUserRateLimits(prev => ({ ...prev, perSecond: e.target.value }))}
                                className={`w-full border rounded-lg p-2.5 outline-none font-mono text-xs transition-colors ${
                                  isLightMode ? 'bg-white border-slate-300 text-slate-800 focus:border-indigo-500' : 'bg-black/40 border-white/5 text-gray-200 focus:border-indigo-500'
                                }`}
                              />
                            </div>
                            <div className="space-y-1">
                              <label className="block text-xs text-gray-500 font-mono">Max Burst Count (`burst_count`):</label>
                              <input
                                type="number"
                                value={userRateLimits.burstCount}
                                onChange={(e) => setUserRateLimits(prev => ({ ...prev, burstCount: e.target.value }))}
                                className={`w-full border rounded-lg p-2.5 outline-none font-mono text-xs transition-colors ${
                                  isLightMode ? 'bg-white border-slate-300 text-slate-800 focus:border-indigo-500' : 'bg-black/40 border-white/5 text-gray-200 focus:border-indigo-500'
                                }`}
                              />
                            </div>
                          </div>
                          <div className={`flex justify-end border-t pt-4 ${isLightMode ? 'border-slate-100' : 'border-white/5'}`}>
                            <button
                              type="submit"
                              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-medium transition-colors"
                            >
                              Apply Custom Rate Limits
                            </button>
                          </div>
                        </form>
                      </div>
                    )}

                    {/* SUB-TAB 9: ACCOUNT DATA (RAW JSON CLIENT STATE) */}
                    {activeUserDetailTab === 'account' && (
                      <div className="space-y-4">
                        <form onSubmit={handleSaveAccountData} className={`p-5 rounded-xl border space-y-4 ${
                          isLightMode ? 'bg-white border-slate-200 shadow-sm' : 'bg-black/20 border-white/5'
                        }`}>
                          <h4 className="text-xs text-indigo-400 font-bold uppercase tracking-wider flex items-center gap-1.5">
                            <FileText className="h-4 w-4" />
                            <span>Raw Account Data (Client State Store)</span>
                          </h4>
                          <p className={`text-xs ${isLightMode ? 'text-slate-500' : 'text-gray-400'}`}>
                            Configure globally stored client-side metadata variables. Must be a valid JSON key-value store.
                          </p>
                          <textarea
                            value={userAccountDataText}
                            onChange={(e) => setUserAccountDataText(e.target.value)}
                            rows={8}
                            className={`w-full border rounded-lg p-3 outline-none font-mono text-xs leading-relaxed transition-colors ${
                              isLightMode ? 'bg-white border-slate-300 text-slate-800 focus:border-indigo-500' : 'bg-black/40 border-white/5 text-gray-200 focus:border-indigo-500'
                            }`}
                            placeholder="{}"
                          />
                          <div className={`flex justify-end border-t pt-4 ${isLightMode ? 'border-slate-100' : 'border-white/5'}`}>
                            <button
                              type="submit"
                              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-medium transition-colors"
                            >
                              Update Client Account Data
                            </button>
                          </div>
                        </form>
                      </div>
                    )}

                    {/* SUB-TAB 10: MEMBESHIP CHAT TIMELINE (HISTORY LOGS) */}
                    {activeUserDetailTab === 'history' && (
                      <div className="space-y-4">
                        <h4 className="text-xs text-indigo-400 font-bold uppercase tracking-wider flex items-center gap-1.5">
                          <History className="h-4 w-4" />
                          <span>Direct & Group Rooms Chat History Logs</span>
                        </h4>
                        <p className={`text-xs ${isLightMode ? 'text-slate-500' : 'text-gray-400'}`}>
                          Inspect the interactive chat conversations this user is participating in. Click "Inspect Chat" to open the live discussion log safely.
                        </p>
                        <div className="space-y-2 max-h-[350px] overflow-y-auto">
                          {!selectedUserDetails.memberships || selectedUserDetails.memberships.length === 0 ? (
                            <p className="text-xs text-gray-500 text-center italic py-4">User is not a member of any conversational room.</p>
                          ) : (
                            selectedUserDetails.memberships.map((m: any) => (
                              <div key={m.roomId} className={`flex justify-between items-center p-3.5 rounded-xl border transition-all duration-200 ${
                                isLightMode ? 'bg-white border-slate-200 hover:border-indigo-500/50 shadow-sm' : 'bg-black/30 border-white/5 hover:border-indigo-500/30'
                              }`}>
                                <div>
                                  <span className={`block text-xs font-semibold font-sans ${isLightMode ? 'text-slate-800' : 'text-gray-200'}`}>{m.roomName}</span>
                                  <span className="block text-[10px] text-gray-500 font-mono mt-0.5 select-all">{m.roomId}</span>
                                </div>
                                <button
                                  onClick={() => handleOpenRoomChat(m.roomId, m.roomName)}
                                  className="flex items-center gap-1 px-3 py-1.5 bg-indigo-600/10 hover:bg-indigo-600/20 text-indigo-300 border border-indigo-500/25 rounded-lg text-xs font-medium transition-colors duration-250"
                                >
                                  <MessageSquare className="h-3.5 w-3.5" />
                                  <span>Inspect Chat</span>
                                </button>
                              </div>
                            ))
                          )}
                        </div>
                      </div>
                    )}



                  </div>
                </div>
              ) : (
                <div className={`flex-1 flex items-center justify-center italic ${isLightMode ? 'text-slate-500' : 'text-gray-500'}`}>
                  User profile details not found.
                </div>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ========================================== */}
      {/* MODAL 8: LIVE ROOM CHAT MESSAGE INSPECTOR */}
      {/* ========================================== */}
      <AnimatePresence>
        {activeRoomChatId && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/70 backdrop-blur-md">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className={`w-full max-w-2xl h-[75vh] flex flex-col rounded-2xl shadow-2xl relative overflow-hidden ${
                isLightMode ? 'bg-slate-50 border border-slate-200' : 'bg-slate-900/95 backdrop-blur-2xl border border-white/10'
              }`}
            >
              {/* Header */}
              <div className={`flex items-center justify-between p-5 border-b ${
                isLightMode ? 'border-slate-200 bg-slate-100/70' : 'border-white/5 bg-black/20'
              }`}>
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-indigo-600/10 text-indigo-400 rounded-lg">
                    <MessageSquare className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className={`text-base font-bold font-sans ${
                      isLightMode ? 'text-slate-800' : 'text-gray-100'
                    }`}>
                      {activeRoomChatName}
                    </h3>
                    <p className="text-xs text-gray-500 font-mono">
                      {activeRoomChatId}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={handleExportHtml}
                    disabled={roomChatMessages.length === 0}
                    className="flex items-center gap-1 px-3 py-1.5 bg-emerald-600/10 hover:bg-emerald-600/20 disabled:opacity-50 disabled:pointer-events-none text-emerald-400 border border-emerald-500/25 rounded-lg text-xs font-medium transition-all duration-200"
                  >
                    <Download className="h-3.5 w-3.5" />
                    <span>{isRtl ? 'خروجی HTML' : 'Export HTML'}</span>
                  </button>
                  <button
                    onClick={() => {
                      setActiveRoomChatId(null);
                      setRoomChatMessages([]);
                    }}
                    className={`p-1.5 rounded-lg transition-colors duration-200 ${
                      isLightMode 
                        ? 'bg-slate-200 hover:bg-slate-300 text-slate-700' 
                        : 'bg-slate-800 hover:bg-slate-700 text-gray-400 hover:text-white'
                    }`}
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              </div>

              {/* Chat timeline messages wrapper */}
              <div className={`flex-1 p-5 overflow-y-auto space-y-4 ${
                isLightMode ? 'bg-white' : 'bg-slate-950/10'
              }`}>
                {isChatLoading ? (
                  <div className="h-full flex flex-col items-center justify-center text-gray-500 gap-2 font-mono text-xs">
                    <RefreshCw className="h-6 w-6 text-indigo-400 animate-spin" />
                    <span>Loading timeline messages...</span>
                  </div>
                ) : roomChatMessages.length === 0 ? (
                  <div className="h-full flex flex-col items-center justify-center text-gray-500 text-xs italic">
                    No message events sent in this room timeline yet.
                  </div>
                ) : (
                  roomChatMessages.map((msg, index) => {
                    const isSystem = msg.sender.startsWith('@admin');
                    return (
                      <div key={msg.id || index} className={`flex flex-col ${isSystem ? 'items-end' : 'items-start'}`}>
                        <div className={`max-w-[85%] rounded-xl p-3.5 shadow-md border ${
                          isSystem 
                            ? isLightMode 
                              ? 'bg-indigo-50 border-indigo-200 text-indigo-900 rounded-tr-none' 
                              : 'bg-indigo-600/20 border-indigo-500/30 text-indigo-100 rounded-tr-none' 
                            : isLightMode 
                              ? 'bg-slate-100 border-slate-200 text-slate-800 rounded-tl-none' 
                              : 'bg-slate-800 border-white/5 text-gray-200 rounded-tl-none'
                        }`}>
                          <div className="flex items-baseline gap-2 mb-1.5">
                            <span className={`font-semibold text-xs font-sans ${isLightMode ? 'text-slate-700' : 'text-gray-300'}`}>
                              {msg.senderDisplayName || msg.sender}
                            </span>
                            <span className="text-[9px] text-gray-500 font-mono">
                              {msg.sender}
                            </span>
                          </div>
                          <p className="text-xs font-sans leading-relaxed break-words whitespace-pre-wrap">{msg.content}</p>
                          <span className="block text-[9px] text-gray-500 text-right mt-1.5 font-mono">
                            {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>

              {/* Chat bottom bar (Read-Only Mode) */}
              <div className={`p-4 border-t flex items-center justify-between text-xs font-medium ${
                isLightMode ? 'border-slate-200 bg-slate-50 text-slate-500' : 'border-white/5 bg-black/20 text-gray-400'
              }`}>
                <span className="flex items-center gap-1.5">
                  <Shield className="h-4 w-4 text-emerald-500 animate-pulse" />
                  <span>{isRtl ? 'حالت امنیتی پایش گفتگو (فقط خواندنی)' : 'Secure Inspection Mode (Read-Only)'}</span>
                </span>
                <button
                  onClick={() => {
                    setActiveRoomChatId(null);
                    setRoomChatMessages([]);
                  }}
                  className={`px-4 py-2 rounded-lg text-xs font-semibold transition-colors duration-200 ${
                    isLightMode 
                      ? 'bg-slate-200 hover:bg-slate-300 text-slate-700' 
                      : 'bg-slate-800 hover:bg-slate-700 text-gray-300'
                  }`}
                >
                  Close Panel
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
