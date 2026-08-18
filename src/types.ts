/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type UserRole = 'Owner' | 'Super Admin' | 'Moderator' | 'Viewer' | 'Custom';

export interface CustomPermissions {
  send_messages?: boolean;             // ارسال پیام مستقیم و گروهی به یوزرها و روم‌ها
  view_matrix_rooms?: boolean;         // دیدن لیست روم‌ها
  manage_matrix_rooms?: boolean;       // دسترسی به آیتم‌های منوی روم‌ها و عملیات آن
  reported_messages?: boolean;         // دیدن و کار با Reported Messages Moderation
  matrix_user_tabs?: boolean;          // تب‌های قسمت ماتریکس یوزر (ثبت‌نام، پسورد، بن، غیرفعالسازی)
  control_hub_overview?: boolean;      // دیدن صفحه اصلی Control Hub و گره‌های کلاستر
  manage_connections?: boolean;        // کانکشن‌ها اضافه، ویرایش یا حذف
  interactive_cleanup?: boolean;       // کار با Interactive Cleanup Controls و تغییرات
  manage_stored_media?: boolean;       // دانلود، حذف و مدیریت فایل‌ها در Stored Media Files
  manage_backups?: boolean;            // مدیریت پشتیبان‌گیری، ایجاد، دانلود و حذف فایل‌های بکاپ
  view_undo_history?: boolean;         // دیدن تایم‌لاین بازیابی تغییرات (Undo History Timeline)
  matrix_stack_settings?: boolean;     // دیدن و کار با Matrix Stack Initial Settings
  manage_rbac?: boolean;               // تعریف و تغییر در Role-Based Access Control (RBAC)
  view_audit_logs?: boolean;           // لاگ‌های Security Audit و Server Configuration & File Audit Log
  view_performance_analysis?: boolean; // دیدن پنل تنظیمات و آنالیز (Panel Settings & Analysis)
  quick_tasks?: boolean;               // دیدن و اجرا هر کدوم از موارد داخل Quick Tasks
  session_panel?: boolean;             // پیکربندی و دیدن سشن پنل (Session Panel & Inactivity Timeout)
}

export interface PanelUser {
  id: string;
  username: string;
  email: string;
  role: UserRole;
  avatar?: string;
  isActive: boolean;
  permissions?: CustomPermissions;
}

export interface MetricTrend {
  time: string;
  cpu: number;
  memory: number;
  activeUsers: number;
  disk: number;
  networkIn?: number;
  networkOut?: number;
  diskIops?: number;
  diskLatencyMs?: number;
}

export interface SystemStats {
  cpuUsage: number;
  memoryUsage: number;
  memoryTotal: number;
  memoryFree: number;
  diskUsage: number;
  diskTotal: number;
  diskFree: number;
  networkIn: number;
  networkOut: number;
  activeUsers: number;
  federationServers: number;
  messageVolume24h: number;
  uptime: string;
  trends: MetricTrend[];
  publicRoomsCount?: number;
  privateRoomsCount?: number;
  totalMediaSizeMB?: number;
  reportsCount?: number;
  diskIops?: number;
  diskLatencyMs?: number;
  services?: ServiceState[];
  elementVersion?: string;
  elementLatestVersion?: string;
  elementHasUpdate?: boolean;
  synapseVersion?: string;
  synapseLatestVersion?: string;
  synapseHasUpdate?: boolean;
  isDbConnected?: boolean;
}

export interface ServiceState {
  id: string;
  name: string;
  displayName: string;
  status: 'active' | 'inactive' | 'error';
  port?: number;
  version?: string;
}

export interface MatrixUser {
  mxid: string;
  isAdmin: boolean;
  isDeactivated: boolean;
  displayName?: string;
  avatarUrl?: string;
  disableClientPasswordChange?: boolean;
  disableClientAccountDeactivation?: boolean;
  disableClientAvatarChange?: boolean;
  isLocked?: boolean;
  isSuspended?: boolean;
  isShadowBanned?: boolean;
  isErased?: boolean;
}

export interface RoomMember {
  mxid: string;
  role: 'Creator' | 'Admin' | 'Moderator' | 'Default';
  powerLevel: number;
}

export interface MatrixRoom {
  id: string;
  name: string;
  alias?: string;
  canonical_alias?: string;
  aliases?: string[];
  topic?: string;
  creator: string;
  membersCount: number;
  joinedMembers: RoomMember[];
  bannedMembers?: string[];
  bannedHistory?: any[];
  adGroups?: string[];
  version: string;
  isFederated: boolean;
  isPublic: boolean;
  createdAt: string;
}

export interface MatrixMedia {
  id: string;
  mediaId?: string;
  fileName?: string;
  fileExtension?: string;
  fileSize: number;
  mimeType: string;
  uploadedBy: string;
  uploadedAt: string;
  isCached: boolean;
  filePath?: string;
  serverPath?: string;
  fileExists?: boolean;
  isOrphan?: boolean;
  status?: 'Exists' | 'Missing' | 'Orphan Media';
}

export interface RegistrationToken {
  token: string;
  usesAllowed?: number;
  usesCount: number;
  expiryTime?: string;
  isActive: boolean;
}

export interface AuditLog {
  id: string;
  timestamp: string;
  username: string;
  action: string;
  target?: string;
  status: 'success' | 'failed';
  details?: string;
}

export interface ConfigLogItem {
  id: string;
  timestamp: string;
  username: string;
  action: 'ADD' | 'UPDATE' | 'DELETE' | 'RESTORE' | 'POLICY' | 'REST' | string;
  filePath: string;
  component: string;
  fieldOrParam?: string;
  oldValue?: string;
  newValue?: string;
  diffSummary: string;
  status: 'success' | 'failed';
  details?: string;
}

export interface BackupItem {
  id: string;
  filename: string;
  size: string;
  timestamp: string;
  hasSSL: boolean;
  type?: 'config' | 'database';
  path?: string;
}

export interface UndoItem {
  id: string;
  timestamp: string;
  description: string;
  files: string[];
}

export interface MatrixConfig {
  HS_DOMAIN: string;
  ELEMENT_DOMAIN: string;
  BASE_DOMAIN: string;
  PUBLIC_IP: string;
  LE_EMAIL: string;
  SSL_MODE: 'letsencrypt' | 'selfsigned' | 'custom' | 'none';
  PG_DB?: string;
  PG_USER?: string;
  PG_HOST?: string;
  PG_PORT?: string;
  PG_PASS?: string;
  
  // New configurations matching the bash script
  LIMIT_MB?: string;
  REGISTRATION_ENABLED?: boolean;
  MESSAGE_RETENTION_DAYS?: string;
  MEDIA_RETENTION_LOCAL_DAYS?: string;
  MEDIA_RETENTION_REMOTE_DAYS?: string;
  PRESENCE_ENABLED?: boolean;
  ROOM_CREATION_ALLOW?: boolean;
  DIRECTORY_SEARCH_ENABLED?: boolean;
  SMTP_HOST?: string;
  SMTP_PORT?: string;
  SMTP_USER?: string;
  SMTP_PASS?: string;
  NOTIF_FROM?: string;
  APP_NAME?: string;
  SMTP_ENABLE_NOTIFS?: boolean;
  SMTP_REQUIRE_TLS?: boolean;
  SMTP_ENABLE_TLS?: boolean;
  SMTP_CLIENT_BASE_URL?: string;
  ELEMENT_CALL_URL?: string;
  INTEGRATIONS_UI_URL?: string;
  INTEGRATIONS_REST_URL?: string;
  TYPING_NOTIFS_ENABLED?: boolean;
  READ_RECEIPTS_ENABLED?: boolean;
  PROFILE_EDIT_NAME_ENABLED?: boolean;
  PROFILE_EDIT_AVATAR_ENABLED?: boolean;
  RATE_LIMIT_PER_SEC?: string;
  RATE_LIMIT_BURST?: string;
  LISTEN_MODE?: 'localhost' | 'all' | 'custom';
  LISTEN_CUSTOM_IP?: string;
  DISABLE_CUSTOM_URLS?: boolean;
}

export interface LDAPConfig {
  enabled: boolean;
  uri: string;
  base: string;
  mode: 'search' | 'simple';
  start_tls: boolean;
  bind_dn?: string;
  bind_password?: string;
  active_directory?: boolean;
  uid_attr: string;
  mail_attr: string;
  name_attr: string;
}

export interface WorkersConfig {
  enabled: boolean;
  count: number;
  federationSender: boolean;
  basePort: number;
}

export interface E2EEConfig {
  configEnabled: boolean;
  wellKnownForceDisable: boolean;
  roomLockdownPowerLevel: number;
  serverSideBlock: boolean;
}

export interface JitsiConfig {
  enabled: boolean;
  domain: string;
}

export interface CaptchaConfig {
  enabled: boolean;
  type: 'recaptcha' | 'turnstile' | 'none';
  siteKey: string;
}

export interface DiskMountInfo {
  device: string;
  mountpoint: string;
  totalBytes: number;
  usedBytes: number;
  freeBytes: number;
  usagePercent: number;
  fstype: string;
  sizeFormatted: string;
  usedFormatted: string;
  freeFormatted: string;
}

export interface DiskOverviewSummary {
  totalDiskFormatted: string;
  usedDiskFormatted: string;
  freeDiskFormatted: string;
  totalBytes: number;
  usedBytes: number;
  freeBytes: number;
  usagePercent: number;
}

export interface LvmPhysicalVolume {
  pvName: string;
  vgName: string;
  pvSize: string;
  pvFree: string;
}

export interface LvmVolumeGroup {
  vgName: string;
  vgSize: string;
  vgFree: string;
  pvCount: string;
  lvCount: string;
}

export interface LvmLogicalVolume {
  lvName: string;
  vgName: string;
  lvSize: string;
  lvAttr: string;
  lvPath: string;
  isSnapshot: boolean;
}

export interface LvmSnapshot {
  snapName: string;
  vgName: string;
  lvSize: string;
  lvAttr: string;
  origin: string;
  snapPercent: number;
  lvPath: string;
  alertLevel: 'none' | 'warning' | 'critical';
  alertMessage: string;
}

export interface LvmAlert {
  snapName: string;
  origin: string;
  vgName: string;
  snapPercent: number;
  level: 'warning' | 'critical';
  message: string;
  messageFa?: string;
}

