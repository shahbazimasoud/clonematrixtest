/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type UserRole = 'Owner' | 'Super Admin' | 'Moderator' | 'Viewer';

export interface PanelUser {
  id: string;
  username: string;
  email: string;
  role: UserRole;
  avatar?: string;
  isActive: boolean;
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
  diskIops?: number;
  diskLatencyMs?: number;
  services?: ServiceState[];
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
  topic?: string;
  creator: string;
  membersCount: number;
  joinedMembers: RoomMember[];
  bannedMembers?: string[];
  adGroups?: string[];
  version: string;
  isFederated: boolean;
  isPublic: boolean;
  createdAt: string;
}

export interface MatrixMedia {
  id: string;
  fileName?: string;
  fileSize: number;
  mimeType: string;
  uploadedBy: string;
  uploadedAt: string;
  isCached: boolean;
  filePath?: string;
  serverPath?: string;
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
  ELEMENT_CALL_URL?: string;
  INTEGRATIONS_UI_URL?: string;
  INTEGRATIONS_REST_URL?: string;
  TYPING_NOTIFS_ENABLED?: boolean;
  READ_RECEIPTS_ENABLED?: boolean;
  PROFILE_EDIT_NAME_ENABLED?: boolean;
  PROFILE_EDIT_AVATAR_ENABLED?: boolean;
  RATE_LIMIT_PER_SEC?: string;
  RATE_LIMIT_BURST?: string;
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
