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
  ShieldAlert,
  FolderSync,
  X,
  Check,
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
  Cpu
} from 'lucide-react';
import { MatrixUser, MatrixRoom, MatrixMedia, RegistrationToken, UserRole } from '../types';

interface KetesaAdminProps {
  lang: 'fa' | 'en';
  authToken: string | null;
  currentUser: { role: UserRole; username: string } | null;
  showToast: (type: 'success' | 'error', text: string) => void;
  isLightMode?: boolean;
}

const faTranslations = {
  tabUsers: "مدیریت کاربران",
  tabRooms: "مدیریت اتاق‌ها",
  tabMedia: "پاکسازی رسانه (Media Cache)",
  tabTokens: "توکن‌های ثبت‌نام",
  tabInstaller: "نصب و مدیریت پشته",
  
  // Users
  searchUsers: "جستجوی کاربر (MXID)...",
  allUsers: "همه کاربران",
  adminUsers: "مدیران",
  activeUsers: "فعال",
  deactivatedUsers: "غیرفعال",
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
  powerLevel: "سطح دسترسی (Power Level)"
};

const enTranslations = {
  tabUsers: "User Management",
  tabRooms: "Room Management",
  tabMedia: "Media Cache Cleanup",
  tabTokens: "Registration Tokens",
  tabInstaller: "Stack Installer & Manager",
  
  // Users
  searchUsers: "Search users by MXID...",
  allUsers: "All Users",
  adminUsers: "Synapse Admins",
  activeUsers: "Active",
  deactivatedUsers: "Deactivated",
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
  loading: "Syncing Ketesa engine...",
  save: "Save Changes",
  cancel: "Cancel",
  delete: "Delete",
  successAction: "Operation completed successfully on homeserver core.",
  errorAction: "Failed to communicate with Synapse homeserver.",
  viewMembers: "View Members",
  memberList: "Room Members List",
  powerLevel: "Power Level"
};

export default function KetesaAdmin({ lang, authToken, currentUser, showToast, isLightMode = false }: KetesaAdminProps) {
  const t = lang === 'fa' ? faTranslations : enTranslations;
  const isRtl = lang === 'fa';
  const hasWriteAccess = currentUser?.role !== 'Viewer';

  const [activeTab, setActiveTab] = useState<'users' | 'rooms' | 'media' | 'tokens' | 'installer'>('users');
  const [loading, setLoading] = useState(true);

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
    '# Matrix Custom Installer console ready.',
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
    if (isInstalling) return;
    setIsInstalling(true);
    setInstallLogs([`[EXEC] Starting command: ${command}...`]);

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
  const [userFilter, setUserFilter] = useState<'all' | 'admins' | 'active' | 'deactivated'>('all');

  const [roomSearch, setRoomSearch] = useState('');
  const [roomFilter, setRoomFilter] = useState<'all' | 'public' | 'private' | 'federated' | 'local'>('all');

  const [mediaSearch, setMediaSearch] = useState('');

  // Modals
  const [showAddUserModal, setShowAddUserModal] = useState(false);
  const [newUser, setNewUser] = useState({ username: '', display_name: '', password: '', isAdmin: false });

  const [showReactivateModal, setShowReactivateModal] = useState<string | null>(null); // mxid
  const [reactivatePass, setReactivatePass] = useState('');
  const [reactivateAdmin, setReactivateAdmin] = useState(false);

  const [showCreateRoomModal, setShowCreateRoomModal] = useState(false);
  const [newRoom, setNewRoom] = useState({ name: '', alias: '', topic: '', isPublic: true, isFederated: true });

  const [showRoomMembersModal, setShowRoomMembersModal] = useState<MatrixRoom | null>(null);

  const [showShutdownRoomModal, setShowShutdownRoomModal] = useState<MatrixRoom | null>(null);
  const [shutdownRoomConfig, setShutdownRoomConfig] = useState({ purge: true, sendMessage: true, messageText: '' });

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
  const [userRateLimits, setUserRateLimits] = useState({ perSecond: '2', burstCount: '10' });
  const [userAccountDataText, setUserAccountDataText] = useState('{}');

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
        fetchUserDetails(selectedUserMxid, false, true);
        fetchAll();
      } else {
        showToast('error', t.errorAction);
      }
    } catch (e) {
      showToast('error', t.errorAction);
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
      }
    } catch (e) {
      showToast('error', t.errorAction);
    }
  };

  const handleRemoveEmail = async (email: string) => {
    if (!hasWriteAccess) return showToast('error', t.unauthorizedMsg);
    if (!selectedUserMxid) return;

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
      }
    } catch (e) {
      showToast('error', t.errorAction);
    }
  };

  const handleAddPhone = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!hasWriteAccess) return showToast('error', t.unauthorizedMsg);
    if (!selectedUserMxid || !newPhone) return;

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
      }
    } catch (e) {
      showToast('error', t.errorAction);
    }
  };

  const handleRemovePhone = async (phone: string) => {
    if (!hasWriteAccess) return showToast('error', t.unauthorizedMsg);
    if (!selectedUserMxid) return;

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
      }
    } catch (e) {
      showToast('error', t.errorAction);
    }
  };

  const handleTerminateDevice = async (deviceId: string) => {
    if (!hasWriteAccess) return showToast('error', t.unauthorizedMsg);
    if (!selectedUserMxid) return;

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
      }
    } catch (e) {
      showToast('error', t.errorAction);
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
  }, [authToken]);

  const fetchAll = async () => {
    setLoading(true);
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
      setLoading(false);
    }
  };

  // User Actions
  const handleRegisterUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!hasWriteAccess) return showToast('error', t.unauthorizedMsg);
    if (!newUser.username || !newUser.password) return;

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
    }
  };

  const handleDeactivateUser = async (mxid: string) => {
    if (!hasWriteAccess) return showToast('error', t.unauthorizedMsg);
    if (!confirm(`Are you sure you want to deactivate ${mxid}?`)) return;

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
          messageText: shutdownRoomConfig.messageText || t.sendMessagePlaceholder
        })
      });

      if (res.ok) {
        showToast('success', t.successAction);
        setShowShutdownRoomModal(null);
        setShutdownRoomConfig({ purge: true, sendMessage: true, messageText: '' });
        // Refresh rooms
        const roomsRes = await fetch('/api/matrix/rooms', { headers: { 'Authorization': `Bearer ${authToken}` } });
        if (roomsRes.ok) setRooms(await roomsRes.json());
      } else {
        showToast('error', t.errorAction);
      }
    } catch (e) {
      showToast('error', t.errorAction);
    }
  };

  const handleKickMember = async (roomId: string, mxid: string) => {
    if (!hasWriteAccess) return showToast('error', t.unauthorizedMsg);
    if (!confirm(`Are you sure you want to kick ${mxid}?`)) return;

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
    if (!confirm(`Are you sure you want to permanently delete media ${mediaId}?`)) return;

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

    if (!confirm(confirmMsg)) return;

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
    if (!confirm(`Are you sure you want to revoke token ${tokenStr}?`)) return;

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
    return true;
  });

  const filteredRooms = rooms.filter(r => {
    const matchesSearch = r.name.toLowerCase().includes(roomSearch.toLowerCase()) || 
                          r.id.toLowerCase().includes(roomSearch.toLowerCase()) ||
                          (r.alias && r.alias.toLowerCase().includes(roomSearch.toLowerCase()));
    if (!matchesSearch) return false;
    if (roomFilter === 'public') return r.isPublic;
    if (roomFilter === 'private') return !r.isPublic;
    if (roomFilter === 'federated') return r.isFederated;
    if (roomFilter === 'local') return !r.isFederated;
    return true;
  });

  const filteredMedia = media.filter(m => {
    return (m.fileName && m.fileName.toLowerCase().includes(mediaSearch.toLowerCase())) ||
           m.id.toLowerCase().includes(mediaSearch.toLowerCase()) ||
           m.uploadedBy.toLowerCase().includes(mediaSearch.toLowerCase()) ||
           m.mimeType.toLowerCase().includes(mediaSearch.toLowerCase());
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
      {/* Tab Navigation Dock */}
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

                <div className={`flex p-0.5 rounded-lg border text-xs font-medium transition-all duration-300 ${
                  isLightMode ? 'bg-slate-100 border-slate-200' : 'bg-black/40 border-white/5'
                }`}>
                  {(['all', 'admins', 'active', 'deactivated'] as const).map(f => (
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
                    </button>
                  ))}
                </div>
              </div>

              {hasWriteAccess && (
                <button
                  onClick={() => setShowAddUserModal(true)}
                  className="flex items-center justify-center gap-2 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-medium text-sm rounded-lg transition-all duration-300 shadow-md"
                  id="add-user-btn"
                >
                  <UserPlus className="h-4 w-4" />
                  <span>{t.addUserBtn}</span>
                </button>
              )}
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
                        <tr key={u.mxid} className={`transition-all duration-200 ${
                          isLightMode ? 'hover:bg-slate-50/50' : 'hover:bg-white/5'
                        }`}>
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
                              <button
                                onClick={() => fetchUserDetails(u.mxid, true)}
                                className={`px-2.5 py-1 text-xs border rounded font-medium transition-all duration-200 ${
                                  isLightMode
                                    ? 'bg-indigo-50 hover:bg-indigo-100 text-indigo-600 border-indigo-200'
                                    : 'bg-indigo-600/20 hover:bg-indigo-600/30 text-indigo-300 border border-indigo-500/30'
                                }`}
                              >
                                {isRtl ? 'جزئیات' : 'Details'}
                              </button>
                              {hasWriteAccess ? (
                                u.isDeactivated ? (
                                  <button
                                    onClick={() => {
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
                                    onClick={() => handleDeactivateUser(u.mxid)}
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
            <div className="flex flex-col md:flex-row gap-3 justify-between items-stretch md:items-center bg-black/25 p-4 rounded-xl border border-white/5">
              <div className="flex flex-1 flex-wrap items-center gap-3">
                <div className="relative flex-1 min-w-[240px]">
                  <Search className={`absolute top-3 ${isRtl ? 'left-3' : 'right-3'} h-4 w-4 text-gray-500`} />
                  <input
                    type="text"
                    value={roomSearch}
                    onChange={(e) => setRoomSearch(e.target.value)}
                    placeholder={t.searchRooms}
                    className="w-full bg-black/40 border border-white/5 hover:border-purple-500/30 focus:border-purple-500/80 rounded-lg py-2 px-4 text-sm font-mono text-gray-200 outline-none transition-all duration-300"
                  />
                </div>

                <div className="flex p-0.5 bg-black/40 rounded-lg border border-white/5 text-xs font-medium flex-wrap gap-1">
                  {(['all', 'public', 'private', 'federated', 'local'] as const).map(f => (
                    <button
                      key={f}
                      onClick={() => setRoomFilter(f)}
                      className={`px-2.5 py-1.5 rounded transition-all duration-300 ${
                        roomFilter === f 
                          ? 'bg-purple-500/10 text-purple-300 border border-purple-500/20' 
                          : 'text-gray-400 hover:text-gray-200'
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
                <div className="col-span-full bg-black/20 border border-white/5 rounded-xl py-12 text-center text-gray-500 font-mono">
                  No rooms matched your parameters.
                </div>
              ) : (
                filteredRooms.map(r => (
                  <div
                    key={r.id}
                    className="relative flex flex-col justify-between p-5 bg-gradient-to-b from-slate-900/40 to-slate-950/40 border border-white/5 rounded-xl hover:border-purple-500/30 hover:shadow-lg hover:shadow-purple-500/5 transition-all duration-300 group"
                  >
                    <div>
                      {/* Name & ID row */}
                      <div className="flex justify-between items-start mb-2 gap-2">
                        <div className="flex items-center gap-2">
                          <Hash className="h-4 w-4 text-purple-400 flex-shrink-0" />
                          <h4 className="font-semibold text-gray-200 leading-tight tracking-tight group-hover:text-purple-300 transition-colors duration-200">
                            {r.name}
                          </h4>
                        </div>
                        <div className="flex gap-1 flex-wrap">
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
                      </div>

                      {/* Alias */}
                      {r.alias && (
                        <p className="text-xs text-purple-400 font-mono select-all mb-2">{r.alias}</p>
                      )}

                      {/* Topic */}
                      <p className="text-xs text-gray-400 line-clamp-2 min-h-[32px] mb-4">
                        {r.topic || <span className="italic opacity-60">No topic assigned for this room.</span>}
                      </p>

                      {/* Meta stats */}
                      <div className="grid grid-cols-3 gap-2 border-t border-b border-white/5 py-2.5 mb-4 text-xs font-mono text-gray-400">
                        <div>
                          <span className="block text-[10px] text-gray-500 uppercase">{t.roomCreator}</span>
                          <span className="truncate block font-medium max-w-full text-gray-300 select-all">{r.creator}</span>
                        </div>
                        <div className="text-center border-l border-r border-white/5">
                          <span className="block text-[10px] text-gray-500 uppercase">{t.roomMembers}</span>
                          <span className="block text-indigo-300 font-bold">{r.membersCount}</span>
                        </div>
                        <div className="text-right">
                          <span className="block text-[10px] text-gray-500 uppercase">{t.roomVersion}</span>
                          <span className="block text-gray-300 font-medium">{r.version}</span>
                        </div>
                      </div>
                    </div>

                    {/* Room actions footer */}
                    <div className="flex justify-between items-center gap-2">
                      <div className="flex gap-2">
                        <button
                          onClick={() => setShowRoomMembersModal(r)}
                          className="flex items-center gap-1.5 px-3 py-1.5 text-xs bg-slate-850 hover:bg-slate-800 text-gray-300 border border-white/5 rounded-lg transition-colors duration-200"
                        >
                          <Users className="h-3.5 w-3.5" />
                          <span>{t.viewMembers}</span>
                        </button>

                        <button
                          onClick={() => handleOpenRoomChat(r.id, r.name)}
                          className="flex items-center gap-1.5 px-3 py-1.5 text-xs bg-indigo-600/15 hover:bg-indigo-600/25 text-indigo-300 border border-indigo-500/20 rounded-lg transition-colors duration-200"
                        >
                          <MessageSquare className="h-3.5 w-3.5" />
                          <span>{isRtl ? 'پایش گفتگو' : 'Inspect Chat'}</span>
                        </button>
                      </div>

                      {hasWriteAccess && (
                        <button
                          onClick={() => setShowShutdownRoomModal(r)}
                          className="flex items-center gap-1.5 px-3 py-1.5 text-xs bg-red-600/10 hover:bg-red-600/20 text-red-400 border border-red-500/25 rounded-lg transition-colors duration-200"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                          <span>{t.shutdownRoomBtn.split(' ')[0]}</span>
                        </button>
                      )}
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
            <div className="space-y-3">
              <div className="flex flex-col md:flex-row gap-3 justify-between items-stretch md:items-center">
                <h4 className="font-semibold text-gray-200 text-sm font-sans">{t.mediaTableTitle}</h4>
                <div className="relative min-w-[280px]">
                  <Search className={`absolute top-2.5 ${isRtl ? 'left-3' : 'right-3'} h-4 w-4 text-gray-500`} />
                  <input
                    type="text"
                    value={mediaSearch}
                    onChange={(e) => setMediaSearch(e.target.value)}
                    placeholder={t.searchMedia}
                    className="w-full bg-black/40 border border-white/5 hover:border-amber-500/30 focus:border-amber-500/80 rounded-lg py-2 px-4 text-sm font-sans text-gray-200 outline-none transition-all duration-300"
                  />
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
                        <th className="py-3 px-4 text-center w-28">Action</th>
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
                              <span className="block font-sans max-w-[160px] truncate" title={m.fileName || 'unnamed'}>
                                {m.fileName || <span className="italic text-gray-500 text-xs">unnamed</span>}
                              </span>
                              <span className="block text-[10px] text-gray-500 font-mono truncate">{m.mimeType}</span>
                            </td>
                            <td className={`py-3 px-4 text-purple-400 font-mono select-all text-xs max-w-[160px] truncate ${isRtl ? 'text-right' : 'text-left'}`} title={m.id}>
                              {m.id}
                            </td>
                            <td className="py-3 px-4 text-center font-mono text-gray-300">
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
                              {hasWriteAccess ? (
                                <button
                                  onClick={() => handlePurgeMediaFile(m.id)}
                                  className="p-1 text-red-400 hover:text-red-300 hover:bg-red-500/10 border border-transparent hover:border-red-500/15 rounded transition-all duration-200"
                                  title={t.purgeFileBtn}
                                >
                                  <Trash2 className="h-4 w-4" />
                                </button>
                              ) : (
                                <span className="text-gray-600 font-mono">-</span>
                              )}
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

                  {/* SSL Mode */}
                  <div className="space-y-1">
                    <label className={`block font-semibold ${isLightMode ? 'text-slate-600' : 'text-gray-300'}`}>
                      {isRtl ? 'حالت رمزگذاری SSL/TLS' : 'SSL/TLS Encryption Mode'}
                    </label>
                    <select
                      value={installerConfig.SSL_MODE || 'selfsigned'}
                      onChange={(e) => setInstallerConfig((prev: any) => ({ ...prev, SSL_MODE: e.target.value }))}
                      className={`w-full border rounded-lg p-2.5 outline-none transition-colors duration-200 ${
                        isLightMode 
                          ? 'bg-white border-slate-300 text-slate-800 focus:border-indigo-500' 
                          : 'bg-black/40 border-white/5 text-gray-200 focus:border-indigo-500'
                      }`}
                    >
                      <option value="selfsigned">{isRtl ? 'گواهی داخلی خودامضا (پیش‌فرض)' : 'Self-Signed Certificate (Default)'}</option>
                      <option value="letsencrypt">{isRtl ? 'دریافت گواهی معتبر Let\'s Encrypt' : 'Let\'s Encrypt Certificate'}</option>
                      <option value="custom">{isRtl ? 'استفاده از گواهی‌های سفارشی (PEM)' : 'Use Custom PEM Certificates'}</option>
                    </select>
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
                  {installLogs.map((log, index) => {
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
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
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
                    className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs transition-colors duration-200 shadow-md"
                  >
                    {t.addUserBtn.split(' ')[0]}
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
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
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
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
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
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="w-full max-w-lg p-6 rounded-2xl relative space-y-4 spatial-glass"
              id="room-members-modal"
            >
              <button
                onClick={() => setShowRoomMembersModal(null)}
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

              <p className={`text-xs font-mono ${isLightMode ? 'text-purple-600 font-semibold' : 'text-purple-400'}`}>
                {showRoomMembersModal.name}
              </p>

              <div className="max-h-64 overflow-y-auto space-y-2 pr-1.5 scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent">
                {showRoomMembersModal.joinedMembers.map((m) => (
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
                        <span className={`block font-mono text-xs truncate max-w-[180px] md:max-w-[240px] ${
                          isLightMode ? 'text-slate-700' : 'text-gray-200'
                        }`} title={m.mxid}>
                          {m.mxid}
                        </span>
                        <span className="block text-[10px] text-gray-500 font-mono">
                          PL: <span className={`font-bold ${isLightMode ? 'text-indigo-600' : 'text-indigo-400'}`}>{m.powerLevel}</span> ({m.role})
                        </span>
                      </div>
                    </div>

                    {hasWriteAccess && m.mxid !== showRoomMembersModal.creator ? (
                      <button
                        onClick={() => handleKickMember(showRoomMembersModal.id, m.mxid)}
                        className="flex items-center gap-1 px-2 py-1 text-[11px] bg-red-600/15 hover:bg-red-600/25 text-red-400 border border-red-500/20 hover:border-red-500/40 rounded transition-colors duration-200"
                      >
                        <UserMinus className="h-3 w-3" />
                        <span>{t.kickBtn.split(' ')[0]}</span>
                      </button>
                    ) : m.mxid === showRoomMembersModal.creator ? (
                      <span className="text-[10px] font-mono font-medium uppercase px-2 py-0.5 bg-purple-500/10 text-purple-400 border border-purple-500/25 rounded">
                        Creator
                      </span>
                    ) : null}
                  </div>
                ))}
              </div>

              <div className={`flex justify-end border-t pt-4 ${isLightMode ? 'border-slate-200' : 'border-white/5'}`}>
                <button
                  onClick={() => setShowRoomMembersModal(null)}
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
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
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
                      onChange={(e) => setShutdownRoomConfig(prev => ({ ...prev, purge: e.target.checked }))}
                      className={`h-4 w-4 rounded focus:ring-0 ${
                        isLightMode ? 'border-slate-300 bg-white text-red-600' : 'border-white/10 bg-slate-900 text-red-600'
                      }`}
                    />
                    <label htmlFor="sd-purge-cb" className={`text-xs leading-tight select-none ${
                      isLightMode ? 'text-slate-700' : 'text-gray-300'
                    }`}>
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
                      onChange={(e) => setShutdownRoomConfig(prev => ({ ...prev, sendMessage: e.target.checked }))}
                      className={`h-4 w-4 rounded focus:ring-0 ${
                        isLightMode ? 'border-slate-300 bg-white text-red-600' : 'border-white/10 bg-slate-900 text-red-600'
                      }`}
                    />
                    <label htmlFor="sd-sendmsg-cb" className={`text-xs leading-tight select-none ${
                      isLightMode ? 'text-slate-700' : 'text-gray-300'
                    }`}>
                      {t.sendMessageLabel}
                    </label>
                  </div>
                </div>

                {shutdownRoomConfig.sendMessage && (
                  <div className="space-y-1">
                    <textarea
                      value={shutdownRoomConfig.messageText}
                      onChange={(e) => setShutdownRoomConfig(prev => ({ ...prev, messageText: e.target.value }))}
                      placeholder={t.sendMessagePlaceholder}
                      rows={2}
                      className={`w-full border focus:border-red-500 rounded-lg p-2.5 outline-none text-xs transition-colors duration-200 resize-none ${
                        isLightMode 
                          ? 'bg-white border-slate-300 text-slate-800' 
                          : 'bg-black/40 border-white/5 text-gray-200'
                      }`}
                    />
                  </div>
                )}

                <div className={`flex justify-end gap-2 border-t pt-4 ${
                  isLightMode ? 'border-slate-200' : 'border-white/5'
                }`}>
                  <button
                    type="button"
                    onClick={() => setShowShutdownRoomModal(null)}
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
                    className="px-4 py-2 bg-red-600 hover:bg-red-500 text-white rounded-lg text-xs transition-colors duration-200 shadow-md"
                  >
                    Shutdown Room
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ========================================== */}
      {/* MODAL 6: CREATE REGISTRATION TOKEN */}
      {/* ========================================== */}
      <AnimatePresence>
        {showCreateTokenModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
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
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
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
                      {isRtl ? 'پیکربندی و نظارت پیشرفته کاربر ماتریکس (Ketesa Admin)' : 'Advanced Matrix User Configuration & Monitoring (Ketesa Admin)'}
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
                              <span className="text-indigo-500 font-semibold uppercase">{selectedUserDetails.userType || 'ketesa'}</span>
                            </div>
                            <div className={`flex justify-between border-b ${isLightMode ? 'border-slate-100' : 'border-white/5'} pb-2`}>
                              <span className={isLightMode ? 'text-slate-500' : 'text-gray-500'}>Display name:</span>
                              <span className={`font-semibold ${isLightMode ? 'text-slate-800' : 'text-gray-300'}`}>{selectedUserDetails.displayName || 'N/A'}</span>
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
                                checked={!!selectedUserDetails.isSuspended}
                                onChange={(e) => handleUpdateUserParams({ isSuspended: e.target.checked })}
                                className="h-4 w-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 mt-1 cursor-pointer"
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
                                checked={!!selectedUserDetails.isShadowBanned}
                                onChange={(e) => handleUpdateUserParams({ isShadowBanned: e.target.checked })}
                                className="h-4 w-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 mt-1 cursor-pointer"
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
                                checked={!!selectedUserDetails.isLocked}
                                onChange={(e) => handleUpdateUserParams({ isLocked: e.target.checked })}
                                className="h-4 w-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 mt-1 cursor-pointer"
                              />
                              <div>
                                <span className={`block font-semibold ${isLightMode ? 'text-slate-800' : 'text-gray-200'}`}>Locked</span>
                                <span className={`block text-xs mt-0.5 leading-relaxed ${isLightMode ? 'text-slate-500' : 'text-gray-400'}`}>
                                  Prevent the user from usefully using their account. Reversible and non-destructive.
                                </span>
                              </div>
                            </div>

                            {/* Server Administrator flag */}
                            <div className={`p-4 border rounded-xl flex items-start gap-3 ${
                              isLightMode ? 'bg-white border-slate-200 shadow-sm' : 'bg-black/20 border-white/5'
                            }`}>
                              <input
                                type="checkbox"
                                checked={!!selectedUserDetails.isAdmin}
                                onChange={(e) => handleUpdateUserParams({ isAdmin: e.target.checked })}
                                className="h-4 w-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 mt-1 cursor-pointer"
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
                                checked={!!selectedUserDetails.isErased}
                                onChange={(e) => handleUpdateUserParams({ isErased: e.target.checked })}
                                className="h-4 w-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 mt-1 cursor-pointer"
                              />
                              <div>
                                <span className={`block font-semibold ${isLightMode ? 'text-red-600' : 'text-red-400'}`}>Erased</span>
                                <span className={`block text-xs mt-0.5 leading-relaxed ${isLightMode ? 'text-slate-500' : 'text-gray-400'}`}>
                                  Marks the user as permanently deleted to comply with GDPR/deletion requests.
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Password resets */}
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
                                    <td className="p-3 font-sans">{dev.displayName || 'Unnamed Device'}</td>
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
          <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
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

              {/* Chat bottom bar input form */}
              <form onSubmit={handleSendChatMessage} className={`p-4 border-t flex gap-2 ${
                isLightMode ? 'border-slate-200 bg-slate-50' : 'border-white/5 bg-black/20'
              }`}>
                <input
                  type="text"
                  value={newRoomChatMessageText}
                  onChange={(e) => setNewRoomChatMessageText(e.target.value)}
                  placeholder={isRtl ? 'پیامی بنویسید...' : 'Type a simulation response message...'}
                  className={`flex-1 border rounded-xl p-3 outline-none text-xs focus:border-indigo-500 transition-colors ${
                    isLightMode ? 'bg-white border-slate-300 text-slate-800' : 'bg-black/40 border-white/10 text-gray-200'
                  }`}
                />
                <button
                  type="submit"
                  disabled={!newRoomChatMessageText.trim()}
                  className="px-5 py-3 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white font-semibold text-xs rounded-xl transition-all shadow-md flex items-center gap-1.5"
                >
                  <span>{isRtl ? 'ارسال' : 'Send'}</span>
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
