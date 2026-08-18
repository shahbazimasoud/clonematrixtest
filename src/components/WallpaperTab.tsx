/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef, useMemo } from 'react';
import {
  Palette,
  UploadCloud,
  Check,
  CheckCircle,
  Trash2,
  Eye,
  Download,
  ExternalLink,
  Link,
  Sparkles,
  RefreshCw,
  Grid,
  List,
  LayoutGrid,
  FolderOpen,
  ShieldCheck,
  AlertCircle,
  Save,
  Copy,
  Maximize2,
  Minimize2,
  X,
  FileImage,
  Image as ImageIcon,
  Globe,
  Sliders,
  Layers,
  ArrowUpRight,
  Info,
  CheckSquare,
  RotateCcw,
  User,
  Mail,
  Phone,
  UserCheck,
  ListFilter,
  KeyRound,
  UserPlus,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight
} from 'lucide-react';

export interface WallpaperItem {
  fileName: string;
  name: string;
  size: number;
  sizeFormatted: string;
  modifiedAt: string;
  url: string;
  mimeType: string;
  isCurrent: boolean;
  isCurrentLogo?: boolean;
}

export interface BrandingConfig {
  brandName?: string;
  activeWallpaper?: string;
  activeLogo?: string;
  welcomeBackgroundUrl?: string;
  showAuthFooter?: boolean;
  showForgotPassword?: boolean;
  showCreateAccount?: boolean;
  faviconUrl?: string;
  headerLogoUrl?: string;
  logoClickUrl?: string;
  loginFieldMxid?: boolean;
  loginFieldEmail?: boolean;
  loginFieldPhone?: boolean;
}

interface WallpaperThumbnailProps {
  src: string;
  alt: string;
  className?: string;
  containerClassName?: string;
  onImageClick?: () => void;
}

const WallpaperThumbnail: React.FC<WallpaperThumbnailProps> = ({
  src,
  alt,
  className = "w-full h-full object-cover",
  containerClassName = "w-full h-full",
  onImageClick
}) => {
  const [loaded, setLoaded] = useState(false);
  const [error, setError] = useState(false);

  useEffect(() => {
    setLoaded(false);
    setError(false);
  }, [src]);

  return (
    <div 
      className={`relative overflow-hidden bg-slate-950/70 flex items-center justify-center ${containerClassName}`}
      onClick={onImageClick}
    >
      {/* Loading Skeleton */}
      {!loaded && !error && (
        <div className="absolute inset-0 bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 animate-pulse flex items-center justify-center z-0">
          <ImageIcon className="w-5 h-5 text-slate-700 animate-pulse" />
        </div>
      )}

      {/* Fallback View on Error */}
      {error ? (
        <div className="w-full h-full min-h-[60px] bg-gradient-to-br from-indigo-950/60 via-slate-900 to-slate-950 p-3 flex flex-col items-center justify-center text-center select-none">
          <div className="w-7 h-7 rounded-lg bg-pink-500/10 border border-pink-500/20 flex items-center justify-center mb-1 text-pink-400">
            <Sparkles className="w-3.5 h-3.5" />
          </div>
          <span className="text-[11px] font-semibold text-slate-300 truncate max-w-[95%]">{alt}</span>
        </div>
      ) : (
        <img
          src={src}
          alt={alt}
          onLoad={() => setLoaded(true)}
          onError={() => setError(true)}
          className={`${className} ${loaded ? 'opacity-100' : 'opacity-0'} transition-opacity duration-300`}
          loading="lazy"
        />
      )}
    </div>
  );
};

interface WallpaperTabProps {
  authToken: string;
  activeConnectionId?: string;
  userRole?: string;
  isReadOnly?: boolean;
  lang?: 'fa' | 'en' | 'es' | 'ar' | 'de' | 'ru';
  showToast?: (type: 'success' | 'error' | 'warning' | 'info', text: string) => void;
}

export default function WallpaperTab({
  authToken,
  activeConnectionId,
  userRole,
  isReadOnly = false,
  lang = 'fa',
  showToast
}: WallpaperTabProps) {
  // Localization helper
  const loc = (fa: string, en: string, es?: string, ar?: string, de?: string, ru?: string) => {
    if (lang === 'fa') return fa;
    if (lang === 'es') return es || en;
    if (lang === 'ar') return ar || fa;
    if (lang === 'de') return de || en;
    if (lang === 'ru') return ru || en;
    return en;
  };

  // State
  const [wallpapers, setWallpapers] = useState<WallpaperItem[]>([]);
  
  // Staged draft states
  const [activeWallpaper, setActiveWallpaper] = useState<string>('');
  const [activeLogo, setActiveLogo] = useState<string>('');
  const [branding, setBranding] = useState<BrandingConfig>({
    brandName: 'Element',
    showAuthFooter: true,
    showForgotPassword: true,
    showCreateAccount: true,
    faviconUrl: '/favicon.ico',
    headerLogoUrl: '',
    logoClickUrl: '',
    loginFieldMxid: true,
    loginFieldEmail: true,
    loginFieldPhone: true
  });

  // Server-confirmed state (used to detect unsaved changes)
  const [serverActiveWallpaper, setServerActiveWallpaper] = useState<string>('');
  const [serverActiveLogo, setServerActiveLogo] = useState<string>('');
  const [serverBranding, setServerBranding] = useState<BrandingConfig>({
    brandName: 'Element',
    showAuthFooter: true,
    showForgotPassword: true,
    showCreateAccount: true,
    faviconUrl: '/favicon.ico',
    headerLogoUrl: '',
    logoClickUrl: '',
    loginFieldMxid: true,
    loginFieldEmail: true,
    loginFieldPhone: true
  });

  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [viewMode, setViewMode] = useState<'grid' | 'list' | 'showcase'>('grid');
  const [searchQuery, setSearchQuery] = useState('');
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [selectedForPreview, setSelectedForPreview] = useState<WallpaperItem | null>(null);
  const [copiedPath, setCopiedPath] = useState(false);

  // Pagination states
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [pageSize, setPageSize] = useState<number>(6);

  // Upload states
  const [uploadFiles, setUploadFiles] = useState<{ file: File; preview: string; name: string }[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [setAsActiveOnUpload, setSetAsActiveOnUpload] = useState(true);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Branding upload states
  const [customFaviconFile, setCustomFaviconFile] = useState<{ file: File; preview: string } | null>(null);
  const [customLogoFile, setCustomLogoFile] = useState<{ file: File; preview: string } | null>(null);
  const [faviconError, setFaviconError] = useState(false);
  const [logoError, setLogoError] = useState(false);
  const [activeLogoError, setActiveLogoError] = useState(false);
  const faviconInputRef = useRef<HTMLInputElement>(null);
  const logoInputRef = useRef<HTMLInputElement>(null);

  // Delete modal state
  const [deleteTarget, setDeleteTarget] = useState<WallpaperItem | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Reset image error states when selection or configuration changes
  useEffect(() => {
    setFaviconError(false);
  }, [branding.faviconUrl, customFaviconFile]);

  useEffect(() => {
    setLogoError(false);
    setActiveLogoError(false);
  }, [branding.headerLogoUrl, activeLogo, customLogoFile]);

  const DESTINATION_DIR = '/opt/matrix-synapse/wallpaper';

  // Detect unsaved changes compared to server state
  const hasUnsavedChanges = useMemo(() => {
    if (activeWallpaper !== serverActiveWallpaper) return true;
    if (activeLogo !== serverActiveLogo) return true;
    if (customFaviconFile !== null) return true;
    if (customLogoFile !== null) return true;
    if ((branding.brandName || 'Element') !== (serverBranding.brandName || 'Element')) return true;
    if ((branding.showAuthFooter !== false) !== (serverBranding.showAuthFooter !== false)) return true;
    if ((branding.showForgotPassword !== false) !== (serverBranding.showForgotPassword !== false)) return true;
    if ((branding.showCreateAccount !== false) !== (serverBranding.showCreateAccount !== false)) return true;
    if ((branding.logoClickUrl || '') !== (serverBranding.logoClickUrl || '')) return true;
    if ((branding.headerLogoUrl || '') !== (serverBranding.headerLogoUrl || '')) return true;
    if ((branding.faviconUrl || '/favicon.ico') !== (serverBranding.faviconUrl || '/favicon.ico')) return true;
    if ((branding.loginFieldMxid !== false) !== (serverBranding.loginFieldMxid !== false)) return true;
    if ((branding.loginFieldEmail !== false) !== (serverBranding.loginFieldEmail !== false)) return true;
    if ((branding.loginFieldPhone !== false) !== (serverBranding.loginFieldPhone !== false)) return true;
    return false;
  }, [activeWallpaper, serverActiveWallpaper, activeLogo, serverActiveLogo, customFaviconFile, customLogoFile, branding, serverBranding]);

  // Trigger system file browser directly
  const triggerFileBrowser = () => {
    setIsUploadOpen(true);
    setTimeout(() => {
      fileInputRef.current?.click();
    }, 10);
  };

  // Fetch wallpapers and branding config
  const fetchData = async () => {
    setIsLoading(true);
    setFaviconError(false);
    setLogoError(false);
    setActiveLogoError(false);
    try {
      const res = await fetch('/api/matrix/wallpaper/list', {
        headers: {
          'Authorization': `Bearer ${authToken}`
        }
      });
      if (res.ok) {
        const data = await res.json();
        const activeWp = data.activeWallpaper || '';
        const activeLg = data.activeLogo || (data.branding && data.branding.activeLogo) || '';
        const b = data.branding || {};
        const brandCfg: BrandingConfig = {
          brandName: b.brandName || data.brandName || 'Element',
          showAuthFooter: b.showAuthFooter !== false && data.showAuthFooter !== false,
          showForgotPassword: b.showForgotPassword !== false && data.showForgotPassword !== false && b.show_forgot_password !== false,
          showCreateAccount: b.showCreateAccount !== false && data.showCreateAccount !== false && b.show_create_account !== false,
          activeWallpaper: b.activeWallpaper || '',
          activeLogo: b.activeLogo || '',
          faviconUrl: b.faviconUrl || '/favicon.ico',
          headerLogoUrl: b.headerLogoUrl || '',
          logoClickUrl: b.logoClickUrl || '',
          loginFieldMxid: b.loginFieldMxid !== false && data.loginFieldMxid !== false,
          loginFieldEmail: b.loginFieldEmail !== false && data.loginFieldEmail !== false,
          loginFieldPhone: b.loginFieldPhone !== false && data.loginFieldPhone !== false
        };

        setWallpapers(data.wallpapers || []);
        setActiveWallpaper(activeWp);
        setServerActiveWallpaper(activeWp);
        setActiveLogo(activeLg);
        setServerActiveLogo(activeLg);
        setBranding(brandCfg);
        setServerBranding(brandCfg);
        setCustomFaviconFile(null);
        setCustomLogoFile(null);
      }
    } catch (err) {
      console.error('Error fetching wallpapers:', err);
      if (showToast) showToast('error', loc('خطا در دریافت لیست والپیپرها از سرور', 'Failed to fetch wallpapers from server'));
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [authToken, activeConnectionId]);

  // Reset pagination when search query, page size, or view mode changes
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, pageSize, viewMode]);

  // Handle Drag & Drop / File Selection
  const handleFileDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      processSelectedFiles(Array.from(e.dataTransfer.files));
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      processSelectedFiles(Array.from(e.target.files));
      e.target.value = '';
    }
  };

  const processSelectedFiles = (files: File[]) => {
    const validImages = files.filter(f => f.type.startsWith('image/') || f.name.endsWith('.svg') || f.name.endsWith('.ico'));
    if (validImages.length === 0) {
      if (showToast) showToast('warning', loc('لطفاً فایل تصویری معتبر (PNG, JPG, WEBP, SVG) انتخاب کنید.', 'Please select valid image files (PNG, JPG, WEBP, SVG).'));
      return;
    }

    const newEntries = validImages.map(file => ({
      file,
      preview: URL.createObjectURL(file),
      name: file.name
    }));

    setUploadFiles(prev => [...prev, ...newEntries]);
    setIsUploadOpen(true);
  };

  // Upload images to destination directory without applying them immediately to server
  const handleUploadSubmit = async () => {
    if (uploadFiles.length === 0) return;
    setIsUploading(true);

    try {
      let lastUploadedName = '';
      for (let i = 0; i < uploadFiles.length; i++) {
        const item = uploadFiles[i];
        const base64Data = await fileToBase64(item.file);
        lastUploadedName = item.name;

        const res = await fetch('/api/matrix/wallpaper/upload', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${authToken}`
          },
          body: JSON.stringify({
            fileName: item.name,
            fileData: base64Data,
            mimeType: item.file.type,
            setAsActive: false // Do NOT immediately write to server config
          })
        });

        if (!res.ok) {
          const errData = await res.json();
          throw new Error(errData.error || 'Upload failed');
        }
      }

      if (setAsActiveOnUpload && lastUploadedName) {
        setActiveWallpaper(lastUploadedName);
      }

      if (showToast) {
        showToast('success', loc(
          `${uploadFiles.length} تصویر با موفقیت در پوشه سرور آپلود شد.${setAsActiveOnUpload ? ' تصویر در پیش‌نویس انتخاب شد؛ برای اعمال روی المنت دکمه ذخیره را بزنید.' : ''}`,
          `${uploadFiles.length} image(s) uploaded to server.${setAsActiveOnUpload ? ' Image selected in draft; click Save & Apply to commit to Element.' : ''}`
        ));
      }

      setUploadFiles([]);
      setIsUploadOpen(false);
      await fetchData();
    } catch (err: any) {
      console.error('Upload error:', err);
      if (showToast) showToast('error', loc('خطا در آپلود والپیپر: ', 'Error uploading wallpaper: ') + err.message);
    } finally {
      setIsUploading(false);
    }
  };

  // Convert File to Base64
  const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => {
        const result = reader.result as string;
        const base64 = result.split(',')[1];
        resolve(base64);
      };
      reader.onerror = error => reject(error);
    });
  };

  // Select image as active wallpaper (in draft state only)
  const handleSelectWallpaper = (fileName: string) => {
    setActiveWallpaper(fileName);
    if (showToast) {
      showToast('info', fileName 
        ? loc(`والپیپر ${fileName} در پیش‌نویس انتخاب شد. برای اعمال نهایی روی سرور، دکمه "ذخیره و اعمال تنظیمات برندینگ روی سرور" را بزنید.`, `Wallpaper ${fileName} selected in draft. Click "Save & Apply Branding to Server" to commit.`)
        : loc('تصویر پس‌زمینه در پیش‌نویس به حالت پیش‌فرض بازگردانده شد. برای اعمال، دکمه ذخیره را بزنید.', 'Wallpaper reset to default in draft. Click Save & Apply to commit.')
      );
    }
  };

  // Select image as active header / login logo (in draft state only)
  const handleSelectLogo = (fileName: string) => {
    setActiveLogo(fileName);
    setBranding(prev => ({ ...prev, headerLogoUrl: fileName ? `/img/logos/${fileName}` : '' }));
    setCustomLogoFile(null);
    if (showToast) {
      showToast('info', fileName 
        ? loc(`لوگوی ${fileName} در پیش‌نویس انتخاب شد. برای اعمال نهایی روی سرور، دکمه "ذخیره و اعمال تنظیمات برندینگ روی سرور" را بزنید.`, `Header logo ${fileName} selected in draft. Click "Save & Apply Branding to Server" to commit.`)
        : loc('لوگو در پیش‌نویس به حالت پیش‌فرض بازگردانده شد. برای اعمال، دکمه ذخیره را بزنید.', 'Header logo reset to default in draft. Click Save & Apply to commit.')
      );
    }
  };

  // Discard all unsaved draft changes and revert to current server values
  const handleDiscardChanges = () => {
    setActiveWallpaper(serverActiveWallpaper);
    setActiveLogo(serverActiveLogo);
    setBranding({ ...serverBranding });
    setCustomFaviconFile(null);
    setCustomLogoFile(null);
    if (showToast) {
      showToast('info', loc('تغییرات پیش‌نویس لغو شدند و مقادیر فعلی سرور بازیابی شدند.', 'Unsaved draft changes discarded.'));
    }
  };

  // Delete wallpaper
  const handleDeleteWallpaper = async () => {
    if (!deleteTarget) return;
    setIsDeleting(true);
    try {
      const res = await fetch('/api/matrix/wallpaper/delete', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authToken}`
        },
        body: JSON.stringify({ fileName: deleteTarget.fileName })
      });

      if (res.ok) {
        if (showToast) showToast('success', loc(`فایل ${deleteTarget.fileName} از سرور حذف شد.`, `File ${deleteTarget.fileName} deleted from server.`));
        if (activeWallpaper === deleteTarget.fileName) {
          setActiveWallpaper('');
        }
        if (activeLogo === deleteTarget.fileName) {
          setActiveLogo('');
        }
        setDeleteTarget(null);
        await fetchData();
      } else {
        const err = await res.json();
        if (showToast) showToast('error', err.error || 'Failed to delete');
      }
    } catch (err: any) {
      if (showToast) showToast('error', loc('خطا در حذف والپیپر: ', 'Error deleting wallpaper: ') + err.message);
    } finally {
      setIsDeleting(false);
    }
  };

  // Save all branding settings (Wallpaper, Logo, Footer visibility, Favicon, Click URL, Login Options) to server
  const handleSaveBranding = async () => {
    // Validate at least one login field is active
    if (branding.loginFieldMxid === false && branding.loginFieldEmail === false && branding.loginFieldPhone === false) {
      if (showToast) {
        showToast('error', loc('حداقل یکی از گزینه‌های ورود (نام کاربری، ایمیل یا تلفن) باید فعال باشد.', 'At least one login identifier option (Username, Email, or Phone) must be enabled.'));
      }
      return;
    }

    setIsSaving(true);
    try {
      let faviconData: string | undefined = undefined;
      let faviconFileName: string | undefined = undefined;
      if (customFaviconFile) {
        faviconData = await fileToBase64(customFaviconFile.file);
        faviconFileName = customFaviconFile.file.name;
      }

      let headerLogoData: string | undefined = undefined;
      let headerLogoFileName: string | undefined = undefined;
      if (customLogoFile) {
        headerLogoData = await fileToBase64(customLogoFile.file);
        headerLogoFileName = customLogoFile.file.name;
      }

      const payload = {
        brandName: branding.brandName,
        showAuthFooter: branding.showAuthFooter !== false,
        showForgotPassword: branding.showForgotPassword !== false,
        showCreateAccount: branding.showCreateAccount !== false,
        activeWallpaper: activeWallpaper,
        activeLogo: activeLogo,
        logoClickUrl: branding.logoClickUrl,
        headerLogoUrl: customLogoFile ? undefined : branding.headerLogoUrl,
        faviconUrl: customFaviconFile ? undefined : branding.faviconUrl,
        faviconData,
        faviconFileName,
        headerLogoData,
        headerLogoFileName,
        loginFieldMxid: branding.loginFieldMxid !== false,
        loginFieldEmail: branding.loginFieldEmail !== false,
        loginFieldPhone: branding.loginFieldPhone !== false
      };

      const res = await fetch('/api/matrix/branding/save', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authToken}`
        },
        body: JSON.stringify(payload)
      });

      if (res.ok) {
        if (showToast) {
          showToast('success', loc(
            'تمامی تنظیمات والپیپر، لوگو، فوتر صفحه لاگین و برندینگ با موفقیت در سرور المنت ذخیره و اعمال شد.',
            'All Element wallpaper, logo, login footer, and branding settings successfully saved and applied to server.'
          ));
        }
        setCustomFaviconFile(null);
        setCustomLogoFile(null);
        await fetchData();
      } else {
        const errData = await res.json();
        throw new Error(errData.error || 'Failed to save branding');
      }
    } catch (err: any) {
      if (showToast) showToast('error', loc('خطا در ذخیره تنظیمات برندینگ: ', 'Error saving branding: ') + err.message);
    } finally {
      setIsSaving(false);
    }
  };

  // Reset Branding Form to Defaults
  const handleResetBrandingDefaults = () => {
    setBranding({
      brandName: 'Element',
      showAuthFooter: true,
      showForgotPassword: true,
      showCreateAccount: true,
      faviconUrl: '/favicon.ico',
      headerLogoUrl: '',
      logoClickUrl: '',
      loginFieldMxid: true,
      loginFieldEmail: true,
      loginFieldPhone: true
    });
    setCustomFaviconFile(null);
    setCustomLogoFile(null);
    if (showToast) {
      showToast('info', loc(
        'تنظیمات برندینگ به حالت پیش‌فرض المنت بازگردانده شد. برای اعمال روی سرور، دکمه "ذخیره و اعمال تنظیمات برندینگ روی سرور" را بزنید.',
        'Branding settings reset to Element defaults. Click "Save & Apply Branding to Server" to push changes to server.'
      ));
    }
  };

  // Copy directory path
  const copyDirectoryPath = () => {
    navigator.clipboard.writeText(DESTINATION_DIR);
    setCopiedPath(true);
    if (showToast) showToast('info', loc('مسیر در کلیپ‌بورد کپی شد.', 'Path copied to clipboard.'));
    setTimeout(() => setCopiedPath(false), 2500);
  };

  // Filtered wallpapers
  const filteredWallpapers = wallpapers.filter(w =>
    w.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    w.fileName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Pagination calculations
  const totalPages = Math.max(1, Math.ceil(filteredWallpapers.length / pageSize));
  const safeCurrentPage = Math.min(Math.max(1, currentPage), totalPages);
  const startIndex = (safeCurrentPage - 1) * pageSize;
  const endIndex = Math.min(startIndex + pageSize, filteredWallpapers.length);
  const paginatedWallpapers = filteredWallpapers.slice(startIndex, endIndex);

  // Active wallpaper item
  const activeWallpaperItem = wallpapers.find(w => w.fileName === activeWallpaper || w.isCurrent);

  return (
    <div className="space-y-6 animate-fadeIn" id="wallpaper-hub-container">
      {/* Hidden File Input always mounted */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileSelect}
        multiple
        accept="image/png,image/jpeg,image/webp,image/svg+xml"
        className="hidden"
      />

      {/* 1. Header Banner & Destination Info */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-5 border-b border-white/5">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-pink-500/20 to-indigo-500/20 border border-pink-500/30 flex items-center justify-center shadow-[0_0_20px_rgba(236,72,153,0.15)]">
            <Palette className="w-6 h-6 text-pink-400" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-display font-bold text-white tracking-tight">
                {loc('تنظیمات لاگین و والپیپر کلاینت المنت', 'Element Login Config & Wallpaper')}
              </h2>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-pink-500/10 text-pink-400 border border-pink-500/20">
                Element Web UI
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-1">
              {loc(
                'مدیریت فیلدهای ورود، تصاویر پس‌زمینه در پوشه مقصد سرور، تنظیم آیکون، فاوآیکون، پیوند لوگو و شخصی‌سازی فوتر لاگین.',
                'Manage login identifier options, wallpaper images on server, custom logo, favicon & login branding.'
              )}
            </p>
          </div>
        </div>

        {/* Server Target Folder Tag & Status */}
        <div className="flex flex-wrap items-center gap-2">
          <div 
            onClick={copyDirectoryPath}
            title={loc('کلیک برای کپی مسیر مقصد', 'Click to copy destination path')}
            className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white/5 border border-white/10 text-xs text-slate-300 hover:border-pink-500/40 cursor-pointer transition-all group"
          >
            <FolderOpen className="w-4 h-4 text-pink-400 group-hover:scale-110 transition-transform" />
            <span className="font-mono text-[11px] text-pink-300 font-semibold">{DESTINATION_DIR}</span>
            {copiedPath ? (
              <Check className="w-3.5 h-3.5 text-emerald-400" />
            ) : (
              <Copy className="w-3.5 h-3.5 text-slate-500 group-hover:text-white transition-colors" />
            )}
          </div>

          <button
            onClick={fetchData}
            disabled={isLoading}
            className="p-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-slate-300 transition-all disabled:opacity-50"
            title={loc('تازه‌سازی لیست والپیپرها', 'Refresh wallpaper list')}
            id="btn-refresh-wallpapers"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin text-pink-400' : ''}`} />
          </button>
        </div>
      </div>

      {/* 2. Top Controls & Action Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 bg-white/5 border border-white/5 rounded-2xl p-3.5">
        {/* Left: View Mode Switcher & Counter */}
        <div className="flex items-center gap-3">
          <div className="flex items-center bg-white/5 p-1 rounded-xl border border-white/10">
            <button
              onClick={() => setViewMode('grid')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                viewMode === 'grid'
                  ? 'bg-pink-500/20 text-pink-300 border border-pink-500/30 shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
              title={loc('نمای شبکه‌ای', 'Grid View')}
              id="view-grid-btn"
            >
              <Grid className="w-3.5 h-3.5" />
              <span>{loc('شبکه‌ای', 'Grid')}</span>
            </button>

            <button
              onClick={() => setViewMode('list')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                viewMode === 'list'
                  ? 'bg-pink-500/20 text-pink-300 border border-pink-500/30 shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
              title={loc('نمای فهرستی', 'List View')}
              id="view-list-btn"
            >
              <List className="w-3.5 h-3.5" />
              <span>{loc('فهرست', 'List')}</span>
            </button>

            <button
              onClick={() => setViewMode('showcase')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                viewMode === 'showcase'
                  ? 'bg-pink-500/20 text-pink-300 border border-pink-500/30 shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
              title={loc('نمای نمایشی بزرگ', 'Showcase View')}
              id="view-showcase-btn"
            >
              <LayoutGrid className="w-3.5 h-3.5" />
              <span>{loc('بزرگ', 'Showcase')}</span>
            </button>
          </div>

          <div className="text-xs text-slate-400 font-medium">
            <span className="text-white font-bold">{wallpapers.length}</span> {loc('تصویر در سرور', 'images on server')}
          </div>
        </div>

        {/* Right: Search & Upload Toggle */}
        <div className="flex items-center gap-2.5">
          <div className="relative">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={loc('جستجوی نام تصویر...', 'Search wallpaper...')}
              className="w-44 md:w-56 bg-white/5 border border-white/10 rounded-xl px-3 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-pink-500/50"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute left-2 top-2 text-slate-500 hover:text-white"
              >
                <X className="w-3 h-3" />
              </button>
            )}
          </div>

          <button
            onClick={triggerFileBrowser}
            className="flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-semibold bg-gradient-to-r from-pink-600 to-indigo-600 hover:opacity-90 text-white shadow-[0_0_15px_rgba(236,72,153,0.3)] transition-all cursor-pointer"
            id="btn-toggle-upload"
          >
            <UploadCloud className="w-4 h-4 text-white" />
            <span>{loc('آپلود تصویر جدید', 'Upload Wallpaper')}</span>
          </button>
        </div>
      </div>

      {/* 3. Collapsible Upload Dropzone Section */}
      {isUploadOpen && (
        <div className="spatial-glass rounded-2xl p-5 border border-pink-500/20 bg-pink-950/10 space-y-4 animate-slideDown">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <UploadCloud className="w-5 h-5 text-pink-400" />
              <h3 className="text-sm font-display font-semibold text-white">
                {loc('آپلود تصویر در سرور مقصد', 'Upload Images to Server Folder')}
              </h3>
              <span className="font-mono text-xs text-pink-300/80 bg-pink-500/10 px-2 py-0.5 rounded-md">
                {DESTINATION_DIR}
              </span>
            </div>
            <button
              onClick={() => setIsUploadOpen(false)}
              className="text-slate-400 hover:text-white p-1 cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Drag & Drop Area */}
          <div
            onDragOver={(e) => e.preventDefault()}
            onDrop={handleFileDrop}
            onClick={triggerFileBrowser}
            className="border-2 border-dashed border-pink-500/30 hover:border-pink-500/60 bg-white/5 hover:bg-pink-500/5 rounded-2xl p-6 text-center cursor-pointer transition-all flex flex-col items-center justify-center gap-2 group"
          >
            <div className="w-12 h-12 rounded-full bg-pink-500/10 group-hover:scale-110 transition-transform flex items-center justify-center border border-pink-500/20">
              <FileImage className="w-6 h-6 text-pink-400" />
            </div>
            <div className="text-xs text-slate-300 font-medium">
              {loc('تصاویر را به اینجا بکشید و رها کنید یا برای انتخاب یک یا چند عکس کلیک کنید', 'Drag & drop images here or click to browse files')}
            </div>
            <div className="text-[11px] text-slate-500">
              {loc('فرمت‌های مجاز: PNG, JPG, JPEG, WEBP, SVG (کیفیت پیشنهادی: Full HD 1920x1080 یا 4K)', 'Supported: PNG, JPG, JPEG, WEBP, SVG (Recommended: 1920x1080 or 4K)')}
            </div>
          </div>

          {/* Staged Upload Files Preview */}
          {uploadFiles.length > 0 && (
            <div className="space-y-3 pt-2">
              <div className="flex items-center justify-between">
                <div className="text-xs font-semibold text-slate-300">
                  {loc('فایل‌های آماده آپلود:', 'Staged files for upload:')} ({uploadFiles.length})
                </div>
                <button
                  type="button"
                  onClick={triggerFileBrowser}
                  className="text-xs text-pink-400 hover:text-pink-300 hover:underline flex items-center gap-1 cursor-pointer"
                >
                  <UploadCloud className="w-3.5 h-3.5" />
                  <span>{loc('افزودن تصاویر بیشتر...', 'Add more images...')}</span>
                </button>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-3">
                {uploadFiles.map((item, idx) => (
                  <div key={idx} className="relative group rounded-xl overflow-hidden border border-white/10 bg-white/5">
                    <img src={item.preview} alt={item.name} className="w-full h-20 object-cover" />
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setUploadFiles(uploadFiles.filter((_, i) => i !== idx));
                      }}
                      className="absolute top-1 right-1 p-1 bg-red-600/80 hover:bg-red-600 text-white rounded-md transition-opacity cursor-pointer"
                    >
                      <X className="w-3 h-3" />
                    </button>
                    <div className="p-1.5 text-[10px] text-slate-300 truncate">{item.name}</div>
                  </div>
                ))}
              </div>

              <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-white/5">
                <label className="flex items-center gap-2 cursor-pointer text-xs text-slate-300">
                  <input
                    type="checkbox"
                    checked={setAsActiveOnUpload}
                    onChange={(e) => setSetAsActiveOnUpload(e.target.checked)}
                    className="rounded border-white/20 bg-white/5 text-pink-500 focus:ring-0"
                  />
                  <span>{loc('بلافاصله پس از آپلود به عنوان والپیپر فعال المنت انتخاب شود', 'Set as active Element wallpaper immediately')}</span>
                </label>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setUploadFiles([])}
                    disabled={isUploading}
                    className="px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-xs text-slate-300 transition-all cursor-pointer"
                  >
                    {loc('انصراف', 'Cancel')}
                  </button>
                  <button
                    type="button"
                    onClick={handleUploadSubmit}
                    disabled={isUploading || isReadOnly}
                    className="flex items-center gap-1.5 px-4 py-1.5 rounded-xl bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600 text-xs font-medium text-white shadow-lg shadow-pink-500/20 transition-all disabled:opacity-50 cursor-pointer"
                  >
                    {isUploading ? (
                      <>
                        <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                        <span>{loc('در حال آپلود...', 'Uploading...')}</span>
                      </>
                    ) : (
                      <>
                        <UploadCloud className="w-3.5 h-3.5" />
                        <span>{loc('شروع آپلود در سرور', 'Start Upload to Server')}</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* 4. Unsaved Changes Sticky Notification Banner */}
      {hasUnsavedChanges && (
        <div className="spatial-glass rounded-2xl p-4 border border-amber-500/40 bg-gradient-to-r from-amber-950/40 via-amber-900/20 to-pink-950/30 flex flex-col sm:flex-row items-center justify-between gap-3 text-amber-200 shadow-[0_0_25px_rgba(245,158,11,0.15)] animate-fadeIn">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-amber-500/20 border border-amber-500/30 flex items-center justify-center shrink-0 shadow-inner">
              <Sparkles className="w-4 h-4 text-amber-400 animate-pulse" />
            </div>
            <div>
              <div className="text-xs font-bold text-amber-300 flex items-center gap-1.5">
                <span>{loc('تغییرات ذخیره‌نشده در پیش‌نویس', 'Unsaved Changes in Draft')}</span>
                <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-amber-400/20 text-amber-300 font-mono">
                  {loc('در انتظار ذخیره', 'Pending Save')}
                </span>
              </div>
              <div className="text-[11px] text-amber-200/80 mt-0.5">
                {loc('انتخاب والپیپر، لوگو یا گزینه‌های برندینگ تغییر کرده است. برای اعمال روی کلاینت المنت دکمه ذخیره را بزنید.', 'Wallpaper, logo or branding options changed. Click "Save & Apply" to apply them to Element.')}
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2 w-full sm:w-auto shrink-0">
            <button
              onClick={handleDiscardChanges}
              disabled={isSaving}
              className="px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-xs text-slate-300 hover:text-white transition-all cursor-pointer"
            >
              {loc('لغو تغییرات', 'Discard')}
            </button>
            <button
              onClick={handleSaveBranding}
              disabled={isSaving}
              className="flex-1 sm:flex-initial flex items-center justify-center gap-1.5 px-4 py-1.5 rounded-xl bg-gradient-to-r from-pink-600 to-indigo-600 hover:opacity-90 text-xs font-bold text-white shadow-md transition-all cursor-pointer"
            >
              {isSaving ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
              <span>{loc('ذخیره و اعمال روی سرور', 'Save & Apply to Server')}</span>
            </button>
          </div>
        </div>
      )}

      {/* 5. Active Wallpaper & Logo Status Banner */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Active Wallpaper Card */}
        <div className={`spatial-glass rounded-2xl p-4 border transition-all flex items-center justify-between gap-3.5 ${
          activeWallpaper !== serverActiveWallpaper
            ? 'border-amber-500/40 bg-amber-500/5'
            : 'border-white/10 bg-white/5'
        }`}>
          <div className="flex items-center gap-3.5 min-w-0">
            <div className="relative w-14 h-11 rounded-xl overflow-hidden border border-pink-500/40 shadow-[0_0_12px_rgba(236,72,153,0.2)] shrink-0">
              {activeWallpaperItem ? (
                <WallpaperThumbnail src={activeWallpaperItem.url} alt={activeWallpaperItem.name} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full bg-gradient-to-br from-indigo-900 to-slate-900 flex items-center justify-center">
                  <Palette className="w-5 h-5 text-indigo-400" />
                </div>
              )}
              <div className="absolute inset-0 ring-1 ring-inset ring-white/20 rounded-xl pointer-events-none" />
            </div>

            <div className="min-w-0">
              <div className="flex items-center gap-1.5 flex-wrap">
                <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                  {loc('والپیپر انتخابی:', 'Selected Wallpaper:')}
                </span>
                {activeWallpaper ? (
                  <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold truncate max-w-[150px] ${
                    activeWallpaper === serverActiveWallpaper
                      ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                      : 'bg-amber-500/10 text-amber-300 border border-amber-500/20'
                  }`}>
                    {activeWallpaper === serverActiveWallpaper ? (
                      <CheckCircle className="w-2.5 h-2.5 shrink-0" />
                    ) : (
                      <Sparkles className="w-2.5 h-2.5 shrink-0 text-amber-400" />
                    )}
                    <span className="truncate">{activeWallpaper}</span>
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium bg-slate-500/10 text-slate-400 border border-slate-500/20">
                    {loc('پیش‌فرض', 'Default')}
                  </span>
                )}
              </div>
              <p className="text-[11px] text-slate-500 mt-0.5 truncate">
                {activeWallpaper !== serverActiveWallpaper
                  ? loc('انتخاب شده در پیش‌نویس (برای اعمال دکمه ذخیره را بزنید)', 'Selected in draft (click Save to apply)')
                  : loc('پس‌زمینه فعال صفحه ورود و خوش‌آمدگویی سرور', 'Active login & welcome background on server')}
              </p>
            </div>
          </div>

          {activeWallpaper && (
            <button
              onClick={() => handleSelectWallpaper('')}
              disabled={isReadOnly}
              className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-[11px] text-slate-300 hover:text-white transition-all shrink-0 cursor-pointer"
              id="btn-reset-wallpaper"
              title={loc('بازنشانی والپیپر به پیش‌فرض', 'Reset wallpaper to default')}
            >
              <RotateCcw className="w-3 h-3 text-amber-400" />
              <span>{loc('پیش‌فرض', 'Reset')}</span>
            </button>
          )}
        </div>

        {/* Active Header Logo Card */}
        <div className={`spatial-glass rounded-2xl p-4 border transition-all flex items-center justify-between gap-3.5 ${
          activeLogo !== serverActiveLogo || branding.headerLogoUrl !== serverBranding.headerLogoUrl
            ? 'border-indigo-500/40 bg-indigo-500/5'
            : 'border-white/10 bg-white/5'
        }`}>
          <div className="flex items-center gap-3.5 min-w-0">
            <div className="relative w-14 h-11 rounded-xl overflow-hidden border border-indigo-500/40 shadow-[0_0_12px_rgba(99,102,241,0.2)] shrink-0 bg-black/40 flex items-center justify-center p-1">
              {!activeLogoError && (activeLogo || branding.headerLogoUrl) ? (
                <img 
                  src={activeLogo ? `/api/matrix/wallpaper/file/${encodeURIComponent(activeLogo)}` : `/api/matrix/branding/asset?path=${encodeURIComponent(branding.headerLogoUrl)}`} 
                  alt="Logo" 
                  className="w-full h-full object-contain"
                  onError={() => setActiveLogoError(true)}
                />
              ) : (
                <Layers className="w-5 h-5 text-indigo-400" />
              )}
              <div className="absolute inset-0 ring-1 ring-inset ring-white/20 rounded-xl" />
            </div>

            <div className="min-w-0">
              <div className="flex items-center gap-1.5 flex-wrap">
                <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                  {loc('لوگوی انتخابی المنت:', 'Selected Header Logo:')}
                </span>
                {activeLogo || branding.headerLogoUrl ? (
                  <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold truncate max-w-[150px] ${
                    activeLogo === serverActiveLogo && branding.headerLogoUrl === serverBranding.headerLogoUrl
                      ? 'bg-indigo-500/10 text-indigo-400 border border-indigo-500/20'
                      : 'bg-purple-500/10 text-purple-300 border border-purple-500/20'
                  }`}>
                    {activeLogo === serverActiveLogo && branding.headerLogoUrl === serverBranding.headerLogoUrl ? (
                      <CheckCircle className="w-2.5 h-2.5 shrink-0" />
                    ) : (
                      <Sparkles className="w-2.5 h-2.5 shrink-0 text-purple-400" />
                    )}
                    <span className="truncate">{activeLogo || branding.headerLogoUrl}</span>
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium bg-slate-500/10 text-slate-400 border border-slate-500/20">
                    {loc('لوگوی پیش‌فرض Element', 'Default Element Logo')}
                  </span>
                )}
              </div>
              <p className="text-[11px] text-slate-500 mt-0.5 truncate">
                {activeLogo !== serverActiveLogo || branding.headerLogoUrl !== serverBranding.headerLogoUrl
                  ? loc('انتخاب شده در پیش‌نویس (برای اعمال دکمه ذخیره را بزنید)', 'Selected in draft (click Save to apply)')
                  : loc('آیکون بالای فرم لاگین در صفحه ورود سرور', 'Active logo above authentication form on server')}
              </p>
            </div>
          </div>

          {(activeLogo || branding.headerLogoUrl) && (
            <button
              onClick={() => handleSelectLogo('')}
              disabled={isReadOnly}
              className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-[11px] text-slate-300 hover:text-white transition-all shrink-0 cursor-pointer"
              id="btn-reset-logo"
              title={loc('بازنشانی لوگو به پیش‌فرض', 'Reset logo to default')}
            >
              <RotateCcw className="w-3 h-3 text-amber-400" />
              <span>{loc('پیش‌فرض', 'Reset')}</span>
            </button>
          )}
        </div>
      </div>

      {/* 5. Wallpapers Gallery View Switcher Rendering */}
      {filteredWallpapers.length === 0 ? (
        <div className="spatial-glass rounded-2xl p-10 border border-white/5 text-center flex flex-col items-center justify-center gap-3">
          <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center border border-white/10 text-slate-400">
            <FileImage className="w-8 h-8" />
          </div>
          <div className="text-sm font-semibold text-slate-300">
            {searchQuery
              ? loc('هیچ تصویری با عبارت جستجو شده یافت نشد.', 'No wallpapers match your search query.')
              : loc('هنوز تصویری در پوشه والپیپر سرور آپلود نشده است.', 'No wallpapers uploaded to server yet.')}
          </div>
          <p className="text-xs text-slate-500 max-w-md">
            {loc(
              'می‌توانید با دکمه "آپلود تصویر جدید" عکس‌های دلخواه خود را در مسیر /opt/matrix-synapse/wallpaper آپلود کنید.',
              'Click "Upload Wallpaper" to upload background images directly to /opt/matrix-synapse/wallpaper.'
            )}
          </p>
          <button
            onClick={triggerFileBrowser}
            className="mt-2 flex items-center gap-2 px-4 py-2 rounded-xl bg-pink-600 hover:bg-pink-500 text-white text-xs font-semibold shadow-md transition-all cursor-pointer"
          >
            <UploadCloud className="w-4 h-4" />
            <span>{loc('آپلود اولین والپیپر', 'Upload First Wallpaper')}</span>
          </button>
        </div>
      ) : (
        <>
          {/* GRID VIEW */}
          {viewMode === 'grid' && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4" id="wallpapers-grid-view">
              {paginatedWallpapers.map((wp) => {
                const isSelectedWp = activeWallpaper === wp.fileName;
                const isSavedWp = serverActiveWallpaper === wp.fileName;
                const isSelectedLogo = activeLogo === wp.fileName || (branding.headerLogoUrl && branding.headerLogoUrl.endsWith(wp.fileName));
                const isSavedLogo = serverActiveLogo === wp.fileName || (serverBranding.headerLogoUrl && serverBranding.headerLogoUrl.endsWith(wp.fileName));

                return (
                  <div
                    key={wp.fileName}
                    className={`group relative rounded-2xl overflow-hidden border transition-all flex flex-col ${
                      isSelectedWp
                        ? isSavedWp
                          ? 'border-emerald-500/60 bg-emerald-950/10 shadow-[0_0_20px_rgba(16,185,129,0.15)] ring-1 ring-emerald-500/50'
                          : 'border-amber-500/60 bg-amber-950/10 shadow-[0_0_20px_rgba(245,158,11,0.15)] ring-1 ring-amber-500/50'
                        : isSelectedLogo
                        ? isSavedLogo
                          ? 'border-indigo-500/60 bg-indigo-950/10 shadow-[0_0_20px_rgba(99,102,241,0.15)] ring-1 ring-indigo-500/50'
                          : 'border-purple-500/60 bg-purple-950/10 shadow-[0_0_20px_rgba(168,85,247,0.15)] ring-1 ring-purple-500/50'
                        : 'border-white/10 bg-black/40 hover:border-pink-500/40 hover:bg-black/60'
                    }`}
                  >
                    {/* Thumbnail Image Container */}
                    <div className="relative aspect-video w-full overflow-hidden bg-black/60 cursor-pointer" onClick={() => setSelectedForPreview(wp)}>
                      <WallpaperThumbnail
                        src={wp.url}
                        alt={wp.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/20 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />

                      {/* Status Badges */}
                      <div className="absolute top-2.5 right-2.5 flex flex-col items-end gap-1.5 z-10">
                        {isSelectedWp && (
                          <div className={`flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold shadow-lg ${
                            isSavedWp ? 'bg-emerald-500 text-black' : 'bg-amber-400 text-black animate-pulse'
                          }`}>
                            {isSavedWp ? <Check className="w-3 h-3 stroke-[3]" /> : <Sparkles className="w-3 h-3 stroke-[3]" />}
                            <span>{isSavedWp ? loc('والپیپر فعال', 'Active Wallpaper') : loc('انتخاب پیش‌نویس', 'Draft Selected')}</span>
                          </div>
                        )}
                        {isSelectedLogo && (
                          <div className={`flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold shadow-lg ${
                            isSavedLogo ? 'bg-indigo-500 text-white' : 'bg-purple-500 text-white animate-pulse'
                          }`}>
                            <Layers className="w-3 h-3" />
                            <span>{isSavedLogo ? loc('لوگوی فعال المنت', 'Active Logo') : loc('لوگوی پیش‌نویس', 'Draft Logo')}</span>
                          </div>
                        )}
                      </div>

                      {/* Size Badge */}
                      <div className="absolute bottom-2 left-2 px-2 py-0.5 rounded-md text-[10px] font-mono bg-black/70 text-slate-300 border border-white/10 backdrop-blur-sm">
                        {wp.sizeFormatted}
                      </div>

                      {/* Quick Hover Action Overlay */}
                      <div className="absolute inset-0 flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity backdrop-blur-[2px] bg-black/30">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedForPreview(wp);
                          }}
                          className="p-2 rounded-xl bg-white/20 hover:bg-white/30 text-white backdrop-blur-md transition-all shadow-md"
                          title={loc('پیش‌نمایش تمام‌صفحه', 'Full Preview')}
                        >
                          <Eye className="w-4 h-4" />
                        </button>

                        <a
                          href={wp.url}
                          download={wp.fileName}
                          onClick={(e) => e.stopPropagation()}
                          className="p-2 rounded-xl bg-white/20 hover:bg-white/30 text-white backdrop-blur-md transition-all shadow-md"
                          title={loc('دانلود فایل', 'Download Image')}
                        >
                          <Download className="w-4 h-4" />
                        </a>

                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setDeleteTarget(wp);
                          }}
                          className="p-2 rounded-xl bg-rose-600/80 hover:bg-rose-600 text-white backdrop-blur-md transition-all shadow-md"
                          title={loc('حذف تصویر از سرور', 'Delete from server')}
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>

                    {/* Card Footer Details & Action Buttons */}
                    <div className="p-3.5 flex flex-col justify-between flex-1 gap-2.5">
                      <div>
                        <div className="text-xs font-semibold text-white truncate" title={wp.fileName}>
                          {wp.name || wp.fileName}
                        </div>
                        <div className="text-[11px] font-mono text-slate-400 truncate mt-0.5">
                          {wp.fileName}
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-2 pt-1">
                        {/* Select as Wallpaper Button */}
                        <button
                          onClick={() => handleSelectWallpaper(isSelectedWp ? '' : wp.fileName)}
                          disabled={isReadOnly}
                          className={`flex items-center justify-center gap-1.5 py-1.5 px-2 rounded-xl text-[11px] font-semibold transition-all cursor-pointer ${
                            isSelectedWp
                              ? isSavedWp
                                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                                : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                              : 'bg-white/10 hover:bg-pink-600 text-white border border-white/10 hover:border-pink-500/50 shadow-sm'
                          }`}
                          id={`btn-select-wp-${wp.fileName}`}
                          title={loc('انتخاب این تصویر به عنوان پس‌زمینه در پیش‌نویس', 'Select as background in draft')}
                        >
                          {isSelectedWp ? (
                            <>
                              <Check className="w-3 h-3" />
                              <span className="truncate">{isSavedWp ? loc('والپیپر فعال', 'Active BG') : loc('انتخاب شده', 'Selected')}</span>
                            </>
                          ) : (
                            <>
                              <Sparkles className="w-3 h-3 text-pink-400" />
                              <span className="truncate">{loc('والپیپر', 'Set Wallpaper')}</span>
                            </>
                          )}
                        </button>

                        {/* Select as Logo Button */}
                        <button
                          onClick={() => handleSelectLogo(isSelectedLogo ? '' : wp.fileName)}
                          disabled={isReadOnly}
                          className={`flex items-center justify-center gap-1.5 py-1.5 px-2 rounded-xl text-[11px] font-semibold transition-all cursor-pointer ${
                            isSelectedLogo
                              ? isSavedLogo
                                ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/30'
                                : 'bg-purple-500/20 text-purple-300 border border-purple-500/30'
                              : 'bg-white/10 hover:bg-indigo-600 text-white border border-white/10 hover:border-indigo-500/50 shadow-sm'
                          }`}
                          id={`btn-select-logo-${wp.fileName}`}
                          title={loc('انتخاب این تصویر به عنوان لوگوی بالای فرم لاگین در پیش‌نویس', 'Select as header logo in draft')}
                        >
                          {isSelectedLogo ? (
                            <>
                              <Check className="w-3 h-3" />
                              <span className="truncate">{isSavedLogo ? loc('لوگوی فعال', 'Active Logo') : loc('انتخاب شده', 'Selected')}</span>
                            </>
                          ) : (
                            <>
                              <Layers className="w-3 h-3 text-indigo-400" />
                              <span className="truncate">{loc('لوگو', 'Set Logo')}</span>
                            </>
                          )}
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* LIST VIEW */}
          {viewMode === 'list' && (
            <div className="spatial-glass rounded-2xl overflow-hidden border border-white/10" id="wallpapers-list-view">
              <table className="w-full text-left text-xs text-slate-300">
                <thead className="bg-black/50 text-[11px] font-semibold text-slate-400 uppercase tracking-wider border-b border-white/5">
                  <tr>
                    <th className="py-3 px-4">{loc('تصویر', 'Preview')}</th>
                    <th className="py-3 px-4">{loc('نام فایل', 'File Name')}</th>
                    <th className="py-3 px-4">{loc('حجم', 'Size')}</th>
                    <th className="py-3 px-4">{loc('وضعیت', 'Status')}</th>
                    <th className="py-3 px-4 text-right">{loc('عملیات', 'Actions')}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {paginatedWallpapers.map((wp) => {
                    const isSelectedWp = activeWallpaper === wp.fileName;
                    const isSavedWp = serverActiveWallpaper === wp.fileName;
                    const isSelectedLogo = activeLogo === wp.fileName || (branding.headerLogoUrl && branding.headerLogoUrl.endsWith(wp.fileName));
                    const isSavedLogo = serverActiveLogo === wp.fileName || (serverBranding.headerLogoUrl && serverBranding.headerLogoUrl.endsWith(wp.fileName));

                    return (
                      <tr
                        key={wp.fileName}
                        className={`hover:bg-white/5 transition-colors ${
                          isSelectedWp ? 'bg-emerald-500/5' : isSelectedLogo ? 'bg-indigo-500/5' : ''
                        }`}
                      >
                        <td className="py-2.5 px-4">
                          <div
                            onClick={() => setSelectedForPreview(wp)}
                            className="w-14 h-9 rounded-lg overflow-hidden border border-white/10 bg-black cursor-pointer group relative shrink-0"
                          >
                            <WallpaperThumbnail src={wp.url} alt={wp.name} className="w-full h-full object-cover" />
                            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity pointer-events-none">
                              <Eye className="w-3.5 h-3.5 text-white" />
                            </div>
                          </div>
                        </td>

                        <td className="py-2.5 px-4 font-mono text-xs text-white">
                          <div className="font-semibold">{wp.name}</div>
                          <div className="text-[11px] text-slate-500">{wp.fileName}</div>
                        </td>

                        <td className="py-2.5 px-4 font-mono text-xs text-slate-400">
                          {wp.sizeFormatted}
                        </td>

                        <td className="py-2.5 px-4">
                          <div className="flex flex-col gap-1">
                            {isSelectedWp && (
                              <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold border w-max ${
                                isSavedWp ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30' : 'bg-amber-500/10 text-amber-300 border-amber-500/30'
                              }`}>
                                <Check className="w-2.5 h-2.5" />
                                {isSavedWp ? loc('والپیپر فعال', 'Active BG') : loc('پیش‌نویس', 'Draft BG')}
                              </span>
                            )}
                            {isSelectedLogo && (
                              <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold border w-max ${
                                isSavedLogo ? 'bg-indigo-500/10 text-indigo-400 border-indigo-500/30' : 'bg-purple-500/10 text-purple-300 border-purple-500/30'
                              }`}>
                                <Layers className="w-2.5 h-2.5" />
                                {isSavedLogo ? loc('لوگوی فعال', 'Active Logo') : loc('پیش‌نویس لوگو', 'Draft Logo')}
                              </span>
                            )}
                            {!isSelectedWp && !isSelectedLogo && (
                              <span className="text-[11px] text-slate-500">
                                {loc('غیرفعال', 'Inactive')}
                              </span>
                            )}
                          </div>
                        </td>

                        <td className="py-2.5 px-4 text-right">
                          <div className="flex items-center justify-end gap-1.5 flex-wrap">
                            <button
                              onClick={() => handleSelectWallpaper(isSelectedWp ? '' : wp.fileName)}
                              disabled={isReadOnly}
                              className={`px-2.5 py-1 rounded-xl text-[11px] font-semibold transition-all cursor-pointer ${
                                isSelectedWp
                                  ? isSavedWp
                                    ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                                    : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                                  : 'bg-white/10 hover:bg-pink-600 text-white'
                              }`}
                              title={loc('انتخاب والپیپر در پیش‌نویس', 'Select Wallpaper in draft')}
                            >
                              {isSelectedWp ? (isSavedWp ? loc('والپیپر فعال', 'Active BG') : loc('انتخاب شده', 'Selected')) : loc('والپیپر', 'Set BG')}
                            </button>

                            <button
                              onClick={() => handleSelectLogo(isSelectedLogo ? '' : wp.fileName)}
                              disabled={isReadOnly}
                              className={`px-2.5 py-1 rounded-xl text-[11px] font-semibold transition-all cursor-pointer ${
                                isSelectedLogo
                                  ? isSavedLogo
                                    ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/30'
                                    : 'bg-purple-500/20 text-purple-300 border border-purple-500/30'
                                  : 'bg-white/10 hover:bg-indigo-600 text-white'
                              }`}
                              title={loc('انتخاب لوگو در پیش‌نویس', 'Select Header Logo in draft')}
                            >
                              {isSelectedLogo ? (isSavedLogo ? loc('لوگوی فعال', 'Active Logo') : loc('انتخاب شده', 'Selected')) : loc('لوگو', 'Set Logo')}
                            </button>

                            <a
                              href={wp.url}
                              download={wp.fileName}
                              className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white"
                              title={loc('دانلود', 'Download')}
                            >
                              <Download className="w-3.5 h-3.5" />
                            </a>

                            <button
                              onClick={() => setDeleteTarget(wp)}
                              className="p-1.5 rounded-lg bg-white/5 hover:bg-rose-600/20 text-slate-400 hover:text-rose-400"
                              title={loc('حذف', 'Delete')}
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}

          {/* SHOWCASE VIEW */}
          {viewMode === 'showcase' && (
            <div className="space-y-4" id="wallpapers-showcase-view">
              {paginatedWallpapers.map((wp) => {
                const isSelectedWp = activeWallpaper === wp.fileName;
                const isSavedWp = serverActiveWallpaper === wp.fileName;
                const isSelectedLogo = activeLogo === wp.fileName || (branding.headerLogoUrl && branding.headerLogoUrl.endsWith(wp.fileName));
                const isSavedLogo = serverActiveLogo === wp.fileName || (serverBranding.headerLogoUrl && serverBranding.headerLogoUrl.endsWith(wp.fileName));

                return (
                  <div
                    key={wp.fileName}
                    className={`spatial-glass rounded-2xl p-4 border transition-all flex flex-col md:flex-row items-center gap-5 ${
                      isSelectedWp
                        ? isSavedWp
                          ? 'border-emerald-500/50 bg-emerald-950/10 shadow-[0_0_25px_rgba(16,185,129,0.1)]'
                          : 'border-amber-500/50 bg-amber-950/10 shadow-[0_0_25px_rgba(245,158,11,0.1)]'
                        : isSelectedLogo
                        ? isSavedLogo
                          ? 'border-indigo-500/50 bg-indigo-950/10 shadow-[0_0_25px_rgba(99,102,241,0.1)]'
                          : 'border-purple-500/50 bg-purple-950/10 shadow-[0_0_25px_rgba(168,85,247,0.1)]'
                        : 'border-white/10 hover:border-pink-500/30'
                    }`}
                  >
                    <div 
                      onClick={() => setSelectedForPreview(wp)}
                      className="relative w-full md:w-80 aspect-video rounded-xl overflow-hidden border border-white/10 bg-black cursor-pointer group shrink-0"
                    >
                      <WallpaperThumbnail src={wp.url} alt={wp.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity pointer-events-none">
                        <Eye className="w-6 h-6 text-white" />
                      </div>
                      <div className="absolute top-2 right-2 flex flex-col items-end gap-1">
                        {isSelectedWp && (
                          <div className={`px-2.5 py-0.5 rounded-full text-xs font-bold shadow-md ${
                            isSavedWp ? 'bg-emerald-500 text-black' : 'bg-amber-400 text-black animate-pulse'
                          }`}>
                            {isSavedWp ? loc('والپیپر فعال', 'Active Wallpaper') : loc('پیش‌نویس والپیپر', 'Draft Wallpaper')}
                          </div>
                        )}
                        {isSelectedLogo && (
                          <div className={`px-2.5 py-0.5 rounded-full text-xs font-bold shadow-md ${
                            isSavedLogo ? 'bg-indigo-500 text-white' : 'bg-purple-500 text-white animate-pulse'
                          }`}>
                            {isSavedLogo ? loc('لوگوی فعال', 'Active Logo') : loc('پیش‌نویس لوگو', 'Draft Logo')}
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="flex-1 space-y-2 w-full">
                      <div className="flex items-center justify-between">
                        <h4 className="text-base font-semibold text-white">{wp.name}</h4>
                        <span className="font-mono text-xs text-slate-400 bg-black/40 px-2 py-0.5 rounded-md border border-white/5">
                          {wp.sizeFormatted}
                        </span>
                      </div>

                      <div className="text-xs font-mono text-pink-400/90">
                        {DESTINATION_DIR}/{wp.fileName}
                      </div>

                      <p className="text-xs text-slate-400">
                        {loc(
                          'تصویر با وضوح بالا آماده استفاده در صفحه ورود و خوش‌آمدگویی یا به عنوان لوگوی اختصاصی المنت.',
                          'High resolution image ready for Element authentication/welcome background or header brand logo.'
                        )}
                      </p>

                      <div className="flex items-center gap-2 pt-2 flex-wrap">
                        <button
                          onClick={() => handleSelectWallpaper(isSelectedWp ? '' : wp.fileName)}
                          disabled={isReadOnly}
                          className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                            isSelectedWp
                              ? isSavedWp
                                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                                : 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                              : 'bg-pink-600 hover:bg-pink-500 text-white shadow-md'
                          }`}
                        >
                          <Sparkles className="w-3.5 h-3.5" />
                          <span>{isSelectedWp ? (isSavedWp ? loc('والپیپر فعال المنت', 'Active Wallpaper') : loc('انتخاب در پیش‌نویس', 'Selected in Draft')) : loc('انتخاب به عنوان والپیپر', 'Select Wallpaper')}</span>
                        </button>

                        <button
                          onClick={() => handleSelectLogo(isSelectedLogo ? '' : wp.fileName)}
                          disabled={isReadOnly}
                          className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                            isSelectedLogo
                              ? isSavedLogo
                                ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/40'
                                : 'bg-purple-500/20 text-purple-300 border border-purple-500/40'
                              : 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-md'
                          }`}
                        >
                          <Layers className="w-3.5 h-3.5" />
                          <span>{isSelectedLogo ? (isSavedLogo ? loc('لوگوی فعال المنت', 'Active Logo') : loc('انتخاب در پیش‌نویس', 'Selected in Draft')) : loc('انتخاب به عنوان لوگو', 'Select Logo')}</span>
                        </button>

                        <button
                          onClick={() => setSelectedForPreview(wp)}
                          className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-xs text-slate-300 cursor-pointer"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          <span>{loc('پیش‌نمایش', 'Preview')}</span>
                        </button>

                        <a
                          href={wp.url}
                          download={wp.fileName}
                          className="p-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-slate-300 hover:text-white cursor-pointer"
                          title={loc('دانلود', 'Download')}
                        >
                          <Download className="w-4 h-4" />
                        </a>

                        <button
                          onClick={() => setDeleteTarget(wp)}
                          className="p-2 rounded-xl bg-white/5 hover:bg-rose-600/20 border border-white/10 text-slate-400 hover:text-rose-400 cursor-pointer"
                          title={loc('حذف', 'Delete')}
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Pagination Navigation Bar */}
          <div className="spatial-glass rounded-2xl p-3.5 border border-white/10 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs bg-white/5" id="wallpapers-pagination-bar">
            {/* Left: Summary Counter and Page Size */}
            <div className="flex flex-wrap items-center gap-3 text-slate-300">
              <span>
                {loc(
                  `نمایش ${startIndex + 1} تا ${endIndex} از مجموع ${filteredWallpapers.length} تصویر`,
                  `Showing ${startIndex + 1} to ${endIndex} of ${filteredWallpapers.length} wallpapers`
                )}
              </span>

              <div className="flex items-center gap-1.5 border-r sm:border-l sm:border-r-0 border-white/10 px-2">
                <span className="text-[11px] text-slate-400">{loc('تعداد در صفحه:', 'Per page:')}</span>
                <select
                  value={pageSize}
                  onChange={(e) => setPageSize(Number(e.target.value))}
                  className="bg-white/5 border border-white/10 rounded-lg px-2 py-0.5 text-xs text-slate-200 focus:outline-none focus:border-pink-500/50 cursor-pointer"
                  id="select-wallpaper-page-size"
                >
                  <option value={6}>6</option>
                  <option value={12}>12</option>
                  <option value={24}>24</option>
                </select>
              </div>
            </div>

            {/* Right: Page Navigation Buttons */}
            {totalPages > 1 && (
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => setCurrentPage(1)}
                  disabled={safeCurrentPage === 1}
                  className="p-1.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-slate-300 disabled:opacity-30 disabled:cursor-not-allowed transition-all cursor-pointer"
                  title={loc('صفحه اول', 'First Page')}
                  id="btn-page-first"
                >
                  <ChevronsLeft className="w-4 h-4 rtl:rotate-180" />
                </button>

                <button
                  type="button"
                  onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                  disabled={safeCurrentPage === 1}
                  className="p-1.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-slate-300 disabled:opacity-30 disabled:cursor-not-allowed transition-all cursor-pointer"
                  title={loc('صفحه قبل', 'Previous Page')}
                  id="btn-page-prev"
                >
                  <ChevronLeft className="w-4 h-4 rtl:rotate-180" />
                </button>

                <div className="flex items-center gap-1 px-1">
                  {Array.from({ length: totalPages }, (_, idx) => idx + 1)
                    .filter(p => p === 1 || p === totalPages || Math.abs(p - safeCurrentPage) <= 1)
                    .map((pageNumber, idx, arr) => {
                      const prev = arr[idx - 1];
                      return (
                        <React.Fragment key={pageNumber}>
                          {prev && pageNumber - prev > 1 && (
                            <span className="px-1 text-slate-500">...</span>
                          )}
                          <button
                            type="button"
                            onClick={() => setCurrentPage(pageNumber)}
                            className={`min-w-[30px] h-7 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                              pageNumber === safeCurrentPage
                                ? 'bg-gradient-to-r from-pink-600 to-indigo-600 text-white shadow-md'
                                : 'bg-white/5 hover:bg-white/10 text-slate-300 border border-white/5'
                            }`}
                          >
                            {pageNumber}
                          </button>
                        </React.Fragment>
                      );
                    })}
                </div>

                <button
                  type="button"
                  onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                  disabled={safeCurrentPage === totalPages}
                  className="p-1.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-slate-300 disabled:opacity-30 disabled:cursor-not-allowed transition-all cursor-pointer"
                  title={loc('صفحه بعد', 'Next Page')}
                  id="btn-page-next"
                >
                  <ChevronRight className="w-4 h-4 rtl:rotate-180" />
                </button>

                <button
                  type="button"
                  onClick={() => setCurrentPage(totalPages)}
                  disabled={safeCurrentPage === totalPages}
                  className="p-1.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-slate-300 disabled:opacity-30 disabled:cursor-not-allowed transition-all cursor-pointer"
                  title={loc('صفحه آخر', 'Last Page')}
                  id="btn-page-last"
                >
                  <ChevronsRight className="w-4 h-4 rtl:rotate-180" />
                </button>
              </div>
            )}
          </div>
        </>
      )}

      {/* 6. Element Login Page Customization & Branding Section */}
      <div className="pt-6 border-t border-white/10 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-500/20 border border-indigo-500/30 flex items-center justify-center">
              <Sliders className="w-5 h-5 text-indigo-400" />
            </div>
            <div>
              <h3 className="text-lg font-display font-bold text-white">
                {loc('شخصی‌سازی صفحه لاگین و برندینگ المنت', 'Element Login Page Branding & Footer Controls')}
              </h3>
              <p className="text-xs text-slate-400">
                {loc(
                  'تنظیمات فوتر صفحه ورود، بازیابی رمز عبور، ایجاد حساب جدید، فاوآیکون، لوگوی بالای فرم، و آدرس پیوند لوگو.',
                  'Configure login footer visibility, forgot password link, create account prompt, favicon icon, header logo, and logo click target link.'
                )}
              </p>
            </div>
          </div>

          {/* Quick Reset to Defaults button in section header */}
          <button
            type="button"
            onClick={handleResetBrandingDefaults}
            disabled={isSaving || isReadOnly}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/5 hover:bg-amber-500/10 border border-white/10 hover:border-amber-500/30 text-xs text-slate-300 hover:text-amber-300 transition-all cursor-pointer self-start sm:self-auto"
            title={loc('بازنشانی فیلدها به مقادیر پیش‌فرض', 'Reset fields to default values')}
            id="btn-header-reset-defaults"
          >
            <RotateCcw className="w-3.5 h-3.5 text-amber-400" />
            <span>{loc('بازگشت به پیش‌فرض', 'Reset to Defaults')}</span>
          </button>
        </div>

        {/* Responsive Grid of Clean Branding Configuration Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* 1. Login Page Footer Toggle */}
          <div className="spatial-glass rounded-2xl p-5 border border-white/10 bg-white/5 space-y-3 flex flex-col justify-between">
            <div className="flex items-start justify-between gap-3">
              <div>
                <label className="text-xs font-bold text-white uppercase tracking-wider block">
                  {loc('نمایش فوتر در صفحه لاگین المنت', 'Element Login Page Footer')}
                </label>
                <p className="text-[11px] text-slate-400 mt-1">
                  {loc(
                    'فعال یا غیرفعال‌سازی نمایش پیوندهای فوتر و عبارت Powered by Matrix در پایین صفحه لاگین.',
                    'Toggle visibility of footer links, Powered by Matrix and policy texts on the Element login screen.'
                  )}
                </p>
              </div>

              <label className="relative inline-flex items-center cursor-pointer shrink-0 mt-0.5">
                <input
                  type="checkbox"
                  checked={branding.showAuthFooter}
                  onChange={(e) => setBranding({ ...branding, showAuthFooter: e.target.checked })}
                  disabled={isReadOnly}
                  className="sr-only peer"
                  id="toggle-auth-footer"
                />
                <div className="w-11 h-6 bg-slate-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-pink-600"></div>
              </label>
            </div>

            <div className="flex items-center gap-2 pt-2 border-t border-white/5 text-xs">
              <span className="text-slate-400">{loc('وضعیت فعلی فوتر:', 'Footer Status:')}</span>
              {branding.showAuthFooter ? (
                <span className="text-emerald-400 font-semibold flex items-center gap-1">
                  <CheckCircle className="w-3.5 h-3.5" />
                  {loc('نمایش داده می‌شود (فعال)', 'Visible (Enabled)')}
                </span>
              ) : (
                <span className="text-rose-400 font-semibold flex items-center gap-1">
                  <X className="w-3.5 h-3.5" />
                  {loc('پنهان و غیرفعال (مخفی در لاگین)', 'Hidden (Disabled)')}
                </span>
              )}
            </div>
          </div>

          {/* 2. Forgot Password Toggle */}
          <div className="spatial-glass rounded-2xl p-5 border border-white/10 bg-white/5 space-y-3 flex flex-col justify-between">
            <div className="flex items-start justify-between gap-3">
              <div>
                <label className="text-xs font-bold text-white uppercase tracking-wider block flex items-center gap-1.5">
                  <KeyRound className="w-3.5 h-3.5 text-amber-400" />
                  {loc('نمایش پیوند بازیابی رمز عبور (Forgot Password?)', 'Forgot Password? Link Visibility')}
                </label>
                <p className="text-[11px] text-slate-400 mt-1">
                  {loc(
                    'فعال یا غیرفعال‌سازی نمایش پیوند Forget password? / بازیابی رمز عبور در صفحه لاگین المنت.',
                    'Toggle visibility of the "Forgot password?" link on the Element login screen.'
                  )}
                </p>
              </div>

              <label className="relative inline-flex items-center cursor-pointer shrink-0 mt-0.5">
                <input
                  type="checkbox"
                  checked={branding.showForgotPassword !== false}
                  onChange={(e) => setBranding({ ...branding, showForgotPassword: e.target.checked })}
                  disabled={isReadOnly}
                  className="sr-only peer"
                  id="toggle-forgot-password"
                />
                <div className="w-11 h-6 bg-slate-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-amber-500"></div>
              </label>
            </div>

            <div className="flex items-center gap-2 pt-2 border-t border-white/5 text-xs">
              <span className="text-slate-400">{loc('وضعیت بازیابی رمز:', 'Forgot Password Status:')}</span>
              {branding.showForgotPassword !== false ? (
                <span className="text-emerald-400 font-semibold flex items-center gap-1">
                  <CheckCircle className="w-3.5 h-3.5" />
                  {loc('نمایش داده می‌شود (فعال)', 'Visible (Enabled)')}
                </span>
              ) : (
                <span className="text-rose-400 font-semibold flex items-center gap-1">
                  <X className="w-3.5 h-3.5" />
                  {loc('پنهان و غیرفعال (مخفی در لاگین)', 'Hidden (Disabled)')}
                </span>
              )}
            </div>
          </div>

          {/* 3. New here? Create an account Toggle */}
          <div className="spatial-glass rounded-2xl p-5 border border-white/10 bg-white/5 space-y-3 flex flex-col justify-between">
            <div className="flex items-start justify-between gap-3">
              <div>
                <label className="text-xs font-bold text-white uppercase tracking-wider block flex items-center gap-1.5">
                  <UserPlus className="w-3.5 h-3.5 text-cyan-400" />
                  {loc('نمایش پیام ایجاد حساب جدید (Create an account)', '"New here? Create an account" Prompt')}
                </label>
                <p className="text-[11px] text-slate-400 mt-1">
                  {loc(
                    'فعال یا غیرفعال‌سازی نمایش متن و پیوند New here? Create an account / ثبت‌نام در صفحه لاگین المنت.',
                    'Toggle visibility of the "New here? Create an account" registration prompt on Element login screen.'
                  )}
                </p>
              </div>

              <label className="relative inline-flex items-center cursor-pointer shrink-0 mt-0.5">
                <input
                  type="checkbox"
                  checked={branding.showCreateAccount !== false}
                  onChange={(e) => setBranding({ ...branding, showCreateAccount: e.target.checked })}
                  disabled={isReadOnly}
                  className="sr-only peer"
                  id="toggle-create-account"
                />
                <div className="w-11 h-6 bg-slate-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-cyan-500"></div>
              </label>
            </div>

            <div className="flex items-center gap-2 pt-2 border-t border-white/5 text-xs">
              <span className="text-slate-400">{loc('وضعیت ایجاد حساب:', 'Create Account Status:')}</span>
              {branding.showCreateAccount !== false ? (
                <span className="text-emerald-400 font-semibold flex items-center gap-1">
                  <CheckCircle className="w-3.5 h-3.5" />
                  {loc('نمایش داده می‌شود (فعال)', 'Visible (Enabled)')}
                </span>
              ) : (
                <span className="text-rose-400 font-semibold flex items-center gap-1">
                  <X className="w-3.5 h-3.5" />
                  {loc('پنهان و غیرفعال (مخفی در لاگین)', 'Hidden (Disabled)')}
                </span>
              )}
            </div>
          </div>

          {/* 2. Custom Brand Title */}
          <div className="spatial-glass rounded-2xl p-5 border border-white/10 bg-white/5 space-y-3 flex flex-col justify-between">
            <div>
              <label className="text-xs font-bold text-white uppercase tracking-wider block">
                {loc('عنوان برند کلاینت (Brand Name)', 'Element Brand Title')}
              </label>
              <p className="text-[11px] text-slate-400 mt-1">
                {loc('نام یا عنوان سازمانی که در نوار بالا و صفحه ورود کلاینت نمایش داده می‌شود.', 'The brand or organization title displayed in the client header and auth pages.')}
              </p>
            </div>

            <input
              type="text"
              value={branding.brandName || ''}
              onChange={(e) => setBranding({ ...branding, brandName: e.target.value })}
              disabled={isReadOnly}
              placeholder="Element / Company Chat"
              className="w-full bg-white/5 border border-white/10 rounded-xl px-3.5 py-2 text-xs text-slate-200 focus:outline-none focus:border-pink-500/50"
              id="input-brand-name"
            />
          </div>

          {/* 3. Favicon Customization */}
          <div className="spatial-glass rounded-2xl p-5 border border-white/10 bg-white/5 space-y-3">
            <div>
              <label className="text-xs font-bold text-white uppercase tracking-wider block">
                {loc('فاوآیکون کلاینت المنت (Favicon)', 'Element Favicon')}
              </label>
              <p className="text-[11px] text-slate-400 mt-1">
                {loc('تغییر آیکون تب مرورگر کلاینت المنت (.ico, .png, .svg)', 'Change Element browser tab favicon')}
              </p>
            </div>

            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center overflow-hidden shrink-0 shadow-sm p-1">
                {customFaviconFile ? (
                  <img src={customFaviconFile.preview} alt="Favicon" className="w-7 h-7 object-contain" />
                ) : !faviconError && (branding.faviconUrl || '/favicon.ico') ? (
                  <img 
                    src={branding.faviconUrl ? (branding.faviconUrl.startsWith('/api') || branding.faviconUrl.startsWith('http') ? branding.faviconUrl : `/api/matrix/branding/asset?path=${encodeURIComponent(branding.faviconUrl)}`) : '/api/matrix/branding/asset?path=favicon.ico'} 
                    alt="Favicon" 
                    className="w-7 h-7 object-contain" 
                    onError={() => setFaviconError(true)} 
                  />
                ) : (
                  <Globe className="w-6 h-6 text-pink-400" />
                )}
              </div>

              <div className="flex-1 flex flex-wrap items-center gap-2">
                <input
                  type="file"
                  ref={faviconInputRef}
                  onChange={(e) => {
                    if (e.target.files && e.target.files[0]) {
                      const file = e.target.files[0];
                      setCustomFaviconFile({ file, preview: URL.createObjectURL(file) });
                    }
                  }}
                  accept=".ico,.png,.svg"
                  className="hidden"
                />
                <button
                  type="button"
                  onClick={() => faviconInputRef.current?.click()}
                  disabled={isReadOnly}
                  className="px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/15 text-xs text-white border border-white/10 flex items-center gap-1.5 transition-all cursor-pointer"
                  id="btn-upload-favicon"
                >
                  <UploadCloud className="w-3.5 h-3.5 text-pink-400" />
                  <span>{loc('انتخاب فاوآیکون...', 'Browse Favicon...')}</span>
                </button>

                {customFaviconFile && (
                  <button
                    type="button"
                    onClick={() => setCustomFaviconFile(null)}
                    className="text-xs text-rose-400 hover:underline cursor-pointer"
                  >
                    {loc('حذف', 'Clear')}
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* 4. Header Logo / Icon Above Login Form */}
          <div className="spatial-glass rounded-2xl p-5 border border-white/10 bg-white/5 space-y-3">
            <div>
              <label className="text-xs font-bold text-white uppercase tracking-wider block">
                {loc('لوگو و آیکون بالای فرم لاگین', 'Header Logo Above Login Form')}
              </label>
              <p className="text-[11px] text-slate-400 mt-1">
                {loc('تغییر لوگوی اصلی نمایش داده شده در بالای کادر ورود المنت.', 'Change the brand logo displayed above the Element login box.')}
              </p>
            </div>

            <div className="flex items-center gap-3">
              <div className="w-16 h-12 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center overflow-hidden shrink-0 shadow-sm p-1.5">
                {customLogoFile ? (
                  <img src={customLogoFile.preview} alt="Logo" className="w-full h-full object-contain" />
                ) : !logoError && (activeLogo || branding.headerLogoUrl) ? (
                  <img 
                    src={
                      activeLogo
                        ? `/api/matrix/wallpaper/file/${encodeURIComponent(activeLogo)}`
                        : branding.headerLogoUrl
                        ? (branding.headerLogoUrl.startsWith('/api') || branding.headerLogoUrl.startsWith('http')
                            ? branding.headerLogoUrl
                            : `/api/matrix/branding/asset?path=${encodeURIComponent(branding.headerLogoUrl)}`)
                        : '/api/matrix/branding/asset?path=logo.svg'
                    } 
                    alt="Logo" 
                    className="w-full h-full object-contain" 
                    onError={() => setLogoError(true)} 
                  />
                ) : (
                  <Layers className="w-6 h-6 text-indigo-400" />
                )}
              </div>

              <div className="flex-1 flex flex-wrap items-center gap-2">
                <input
                  type="file"
                  ref={logoInputRef}
                  onChange={(e) => {
                    if (e.target.files && e.target.files[0]) {
                      const file = e.target.files[0];
                      setCustomLogoFile({ file, preview: URL.createObjectURL(file) });
                    }
                  }}
                  accept=".png,.svg,.webp,.jpg"
                  className="hidden"
                />
                <button
                  type="button"
                  onClick={() => logoInputRef.current?.click()}
                  disabled={isReadOnly}
                  className="px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/15 text-xs text-white border border-white/10 flex items-center gap-1.5 transition-all cursor-pointer"
                  id="btn-upload-logo"
                >
                  <UploadCloud className="w-3.5 h-3.5 text-indigo-400" />
                  <span>{loc('انتخاب لوگوی جدید...', 'Browse Logo...')}</span>
                </button>

                {customLogoFile && (
                  <button
                    type="button"
                    onClick={() => setCustomLogoFile(null)}
                    className="text-xs text-rose-400 hover:underline cursor-pointer"
                  >
                    {loc('حذف', 'Clear')}
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* 5. Logo Click Target Link / URL (Spans 2 columns on medium/large) */}
          <div className="md:col-span-2 spatial-glass rounded-2xl p-5 border border-white/10 bg-white/5 space-y-2">
            <label className="text-xs font-bold text-white uppercase tracking-wider block">
              {loc('آدرس پیوند (Link) آیکون بالای لاگین', 'Logo Click Target URL / Link')}
            </label>
            <p className="text-[11px] text-slate-400">
              {loc('هنگام کلیک کاربر روی لوگوی بالای فرم لاگین المنت، این آدرس باز می‌شود.', 'When users click the logo above login form, they will be navigated to this URL.')}
            </p>
            <div className="relative">
              <input
                type="text"
                value={branding.logoClickUrl || ''}
                onChange={(e) => setBranding({ ...branding, logoClickUrl: e.target.value })}
                disabled={isReadOnly}
                placeholder="https://mycompany.com or https://chat.company.local"
                className="w-full bg-white/5 border border-white/10 rounded-xl px-3.5 py-2 text-xs font-mono text-slate-200 focus:outline-none focus:border-pink-500/50 pl-9"
                id="input-logo-click-url"
              />
              <Link className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
            </div>
          </div>

          {/* 6. Allowed Login Identifier Dropdown Options (<select id="mx_Field_1">) */}
          <div className="md:col-span-2 spatial-glass rounded-2xl p-5 border border-white/10 bg-white/5 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-white/10 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-pink-500/20 border border-pink-500/30 flex items-center justify-center text-pink-400">
                  <UserCheck className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-white uppercase tracking-wider">
                    {loc('فیلدهای مجاز در دراپ‌دان ورود (شناسه ورود کاربر)', 'Allowed Login Identifier Options in Dropdown')}
                  </h4>
                  <p className="text-[11px] text-slate-400">
                    {loc(
                      'مشخص کنید در صفحه ورود کلاینت المنت (فرم نام کاربری/رمز عبور)، کدام گزینه‌ها در دراپ‌دان شناسه ورود نمایش داده شوند.',
                      'Choose which login identifier options (Username, Email, Phone) appear in the <select id="mx_Field_1"> dropdown on Element login page.'
                    )}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2 self-start sm:self-auto">
                <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-pink-500/15 text-pink-300 border border-pink-500/30">
                  {((branding.loginFieldMxid !== false ? 1 : 0) + (branding.loginFieldEmail !== false ? 1 : 0) + (branding.loginFieldPhone !== false ? 1 : 0))} / 3 {loc('گزینه فعال', 'Active')}
                </span>
              </div>
            </div>

            {/* 3 Toggleable Identifier Options */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {/* 1. Username (login_field_mxid) */}
              <label
                className={`relative flex items-start gap-3 p-3.5 rounded-xl border transition-all cursor-pointer select-none ${
                  branding.loginFieldMxid !== false
                    ? 'bg-pink-500/10 border-pink-500/40 text-white'
                    : 'bg-white/5 border-white/10 text-slate-400 opacity-60 hover:opacity-80'
                }`}
              >
                <input
                  type="checkbox"
                  checked={branding.loginFieldMxid !== false}
                  onChange={(e) => setBranding({ ...branding, loginFieldMxid: e.target.checked })}
                  disabled={isReadOnly}
                  className="sr-only"
                  id="checkbox-login-field-mxid"
                />
                <div className={`mt-0.5 w-5 h-5 rounded-lg border flex items-center justify-center transition-all shrink-0 ${
                  branding.loginFieldMxid !== false
                    ? 'bg-pink-500 border-pink-400 text-white shadow-[0_0_10px_rgba(236,72,153,0.4)]'
                    : 'border-white/20 bg-white/5 text-transparent'
                }`}>
                  <Check className="w-3.5 h-3.5 stroke-[3]" />
                </div>
                <div className="space-y-1 flex-1">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold flex items-center gap-1.5">
                      <User className="w-3.5 h-3.5 text-pink-400" />
                      {loc('نام کاربری (Username)', 'Username')}
                    </span>
                    <span className="text-[10px] font-mono text-slate-400 bg-white/5 px-1.5 py-0.5 rounded border border-white/5">
                      mxid
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-400 leading-relaxed">
                    {loc('شناسه ماتریکس یا نام کاربری', 'Matrix ID or username field')}
                  </p>
                </div>
              </label>

              {/* 2. Email Address (login_field_email) */}
              <label
                className={`relative flex items-start gap-3 p-3.5 rounded-xl border transition-all cursor-pointer select-none ${
                  branding.loginFieldEmail !== false
                    ? 'bg-purple-500/10 border-purple-500/40 text-white'
                    : 'bg-white/5 border-white/10 text-slate-400 opacity-60 hover:opacity-80'
                }`}
              >
                <input
                  type="checkbox"
                  checked={branding.loginFieldEmail !== false}
                  onChange={(e) => setBranding({ ...branding, loginFieldEmail: e.target.checked })}
                  disabled={isReadOnly}
                  className="sr-only"
                  id="checkbox-login-field-email"
                />
                <div className={`mt-0.5 w-5 h-5 rounded-lg border flex items-center justify-center transition-all shrink-0 ${
                  branding.loginFieldEmail !== false
                    ? 'bg-purple-500 border-purple-400 text-white shadow-[0_0_10px_rgba(168,85,247,0.4)]'
                    : 'border-white/20 bg-white/5 text-transparent'
                }`}>
                  <Check className="w-3.5 h-3.5 stroke-[3]" />
                </div>
                <div className="space-y-1 flex-1">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold flex items-center gap-1.5">
                      <Mail className="w-3.5 h-3.5 text-purple-400" />
                      {loc('آدرس ایمیل (Email)', 'Email Address')}
                    </span>
                    <span className="text-[10px] font-mono text-slate-400 bg-white/5 px-1.5 py-0.5 rounded border border-white/5">
                      email
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-400 leading-relaxed">
                    {loc('ورود با ایمیل ثبت‌شده کاربر', 'Login with registered email')}
                  </p>
                </div>
              </label>

              {/* 3. Phone Number (login_field_password / phone) */}
              <label
                className={`relative flex items-start gap-3 p-3.5 rounded-xl border transition-all cursor-pointer select-none ${
                  branding.loginFieldPhone !== false
                    ? 'bg-indigo-500/10 border-indigo-500/40 text-white'
                    : 'bg-white/5 border-white/10 text-slate-400 opacity-60 hover:opacity-80'
                }`}
              >
                <input
                  type="checkbox"
                  checked={branding.loginFieldPhone !== false}
                  onChange={(e) => setBranding({ ...branding, loginFieldPhone: e.target.checked })}
                  disabled={isReadOnly}
                  className="sr-only"
                  id="checkbox-login-field-phone"
                />
                <div className={`mt-0.5 w-5 h-5 rounded-lg border flex items-center justify-center transition-all shrink-0 ${
                  branding.loginFieldPhone !== false
                    ? 'bg-indigo-500 border-indigo-400 text-white shadow-[0_0_10px_rgba(99,102,241,0.4)]'
                    : 'border-white/20 bg-white/5 text-transparent'
                }`}>
                  <Check className="w-3.5 h-3.5 stroke-[3]" />
                </div>
                <div className="space-y-1 flex-1">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold flex items-center gap-1.5">
                      <Phone className="w-3.5 h-3.5 text-indigo-400" />
                      {loc('شماره تلفن (Phone)', 'Phone')}
                    </span>
                    <span className="text-[10px] font-mono text-slate-400 bg-white/5 px-1.5 py-0.5 rounded border border-white/5">
                      phone
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-400 leading-relaxed">
                    {loc('ورود با شماره موبایل / تلفن', 'Login with mobile phone')}
                  </p>
                </div>
              </label>
            </div>

            {/* Simulated Live Preview of Element Login Dropdown */}
            <div className="rounded-xl p-3.5 bg-black/40 border border-white/10 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="space-y-1">
                <span className="text-[11px] font-semibold text-slate-300 flex items-center gap-1.5">
                  <Eye className="w-3.5 h-3.5 text-slate-400" />
                  {loc('پیش‌نمایش زنده دراپ‌دان در صفحه لاگین المنت:', 'Live Preview of Dropdown on Element Login Page:')}
                </span>
                <span className="text-[10px] font-mono text-slate-500">
                  &lt;select type="text" id="mx_Field_1"&gt;
                </span>
              </div>

              <div className="flex items-center gap-2">
                <div className="relative min-w-[200px]">
                  <select
                    className="w-full bg-[#1b2234] border border-slate-700 text-slate-200 rounded-lg px-3 py-2 text-xs font-medium focus:outline-none"
                    disabled
                    value={
                      branding.loginFieldMxid !== false
                        ? 'login_field_mxid'
                        : branding.loginFieldEmail !== false
                        ? 'login_field_email'
                        : 'login_field_password'
                    }
                  >
                    {branding.loginFieldMxid !== false && (
                      <option value="login_field_mxid">Username</option>
                    )}
                    {branding.loginFieldEmail !== false && (
                      <option value="login_field_email">Email address</option>
                    )}
                    {branding.loginFieldPhone !== false && (
                      <option value="login_field_password">Phone</option>
                    )}
                  </select>
                </div>
                {((branding.loginFieldMxid !== false ? 1 : 0) + (branding.loginFieldEmail !== false ? 1 : 0) + (branding.loginFieldPhone !== false ? 1 : 0)) === 1 && (
                  <span className="text-[10px] text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-1 rounded-md font-medium">
                    {loc('تک‌گزینه‌ای (قفل مستقیم)', 'Single field (Auto-locked)')}
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons: Reset to Defaults & Save */}
        <div className="flex flex-col sm:flex-row items-center gap-3 pt-2">
          <button
            type="button"
            onClick={handleResetBrandingDefaults}
            disabled={isSaving || isReadOnly}
            className="w-full sm:w-auto flex items-center justify-center gap-2 py-3 px-5 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/10 text-slate-300 hover:text-white text-xs font-semibold transition-all cursor-pointer"
            id="btn-reset-branding-defaults"
          >
            <RotateCcw className="w-4 h-4 text-amber-400" />
            <span>{loc('بازگشت به پیش‌فرض', 'Reset to Defaults')}</span>
          </button>

          <button
            type="button"
            onClick={handleSaveBranding}
            disabled={isSaving || isReadOnly}
            className="flex-1 w-full flex items-center justify-center gap-2 py-3 px-4 rounded-2xl bg-gradient-to-r from-pink-600 via-purple-600 to-indigo-600 text-white text-sm font-bold shadow-[0_0_25px_rgba(236,72,153,0.3)] hover:opacity-95 transition-all disabled:opacity-50 cursor-pointer"
            id="btn-save-branding-settings"
          >
            {isSaving ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                <span>{loc('در حال ذخیره و اعمال روی سرور...', 'Saving & Applying to Server...')}</span>
              </>
            ) : (
              <>
                <Save className="w-4 h-4" />
                <span>{loc('ذخیره و اعمال تنظیمات برندینگ روی سرور', 'Save & Apply Branding to Server')}</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* 7. Full-Screen Image Preview Modal */}
      {selectedForPreview && (
        <div 
          className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 animate-fadeIn"
          onClick={() => setSelectedForPreview(null)}
        >
          <div 
            className="relative max-w-5xl w-full bg-slate-900 border border-slate-700 dark:border-white/10 rounded-3xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh] text-white"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between p-4 border-b border-white/10 bg-black/40">
              <div className="flex items-center gap-3">
                <FileImage className="w-5 h-5 text-pink-400" />
                <div>
                  <h3 className="text-sm font-bold text-white">{selectedForPreview.name}</h3>
                  <p className="text-xs font-mono text-slate-400">{DESTINATION_DIR}/{selectedForPreview.fileName}</p>
                </div>
              </div>
              <button
                onClick={() => setSelectedForPreview(null)}
                className="p-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-white transition-all cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="relative flex-1 bg-black/80 flex items-center justify-center p-4 overflow-hidden">
              <WallpaperThumbnail
                src={selectedForPreview.url}
                alt={selectedForPreview.name}
                className="max-h-[60vh] max-w-full object-contain rounded-xl shadow-lg"
                containerClassName="max-h-[60vh] max-w-full flex items-center justify-center"
              />
            </div>

            {/* Modal Footer Actions */}
            <div className="flex items-center justify-between p-4 border-t border-white/10 bg-black/40">
              <div className="text-xs text-slate-400 font-mono">
                {selectedForPreview.sizeFormatted} • {selectedForPreview.mimeType}
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    handleSelectWallpaper(selectedForPreview.fileName);
                    setSelectedForPreview(null);
                  }}
                  className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-pink-600 hover:bg-pink-500 text-white text-xs font-bold shadow-md transition-all cursor-pointer"
                >
                  <Sparkles className="w-4 h-4" />
                  <span>{loc('انتخاب به عنوان والپیپر', 'Select as Wallpaper')}</span>
                </button>
                <button
                  onClick={() => {
                    handleSelectLogo(selectedForPreview.fileName);
                    setSelectedForPreview(null);
                  }}
                  className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shadow-md transition-all cursor-pointer"
                >
                  <Layers className="w-4 h-4" />
                  <span>{loc('انتخاب به عنوان لوگو', 'Select as Header Logo')}</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 8. Delete Confirmation Modal (Theme-Neutral & Fully Localized) */}
      {deleteTarget && (
        <div className="fixed inset-0 z-50 bg-black/60 dark:bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 animate-fadeIn">
          <div className="max-w-md w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 rounded-2xl p-6 space-y-4 shadow-2xl text-slate-900 dark:text-white">
            <div className="flex items-center gap-3 text-rose-600 dark:text-rose-400">
              <AlertCircle className="w-6 h-6 shrink-0" />
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                {loc(
                  'تأیید حذف والپیپر از سرور',
                  'Confirm Wallpaper Deletion',
                  'Confirmar eliminación de fondo',
                  'تأكيد حذف الخلفية من الخادم',
                  'Löschen des Hintergrundbilds bestätigen',
                  'Подтвердить удаление обоев'
                )}
              </h3>
            </div>

            <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
              {loc(
                `آیا از حذف فایل ${deleteTarget.fileName} از مسیر ${DESTINATION_DIR} مطمئن هستید؟ این عملیات قابل بازگشت نیست.`,
                `Are you sure you want to delete ${deleteTarget.fileName} from ${DESTINATION_DIR}? This action cannot be undone.`,
                `¿Está seguro de que desea eliminar ${deleteTarget.fileName} de ${DESTINATION_DIR}? Esta acción no se puede deshacer.`,
                `هل أنت متأكد أنك تريد حذف ${deleteTarget.fileName} من ${DESTINATION_DIR}؟ لا يمكن التراجع عن هذا الإجراء.`,
                `Sind Sie sicher, dass Sie ${deleteTarget.fileName} aus ${DESTINATION_DIR} löschen möchten? Dies kann nicht rückgängig gemacht werden.`,
                `Вы уверены, что хотите удалить ${deleteTarget.fileName} из ${DESTINATION_DIR}? Это действие нельзя отменить.`
              )}
            </p>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setDeleteTarget(null)}
                disabled={isDeleting}
                className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-white/10 dark:hover:bg-white/15 text-xs text-slate-700 dark:text-slate-300 font-medium transition-all cursor-pointer"
              >
                {loc('انصراف', 'Cancel', 'Cancelar', 'إلغاء', 'Abbrechen', 'Отмена')}
              </button>
              <button
                type="button"
                onClick={handleDeleteWallpaper}
                disabled={isDeleting}
                className="flex items-center gap-2 px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold shadow-md transition-all disabled:opacity-50 cursor-pointer"
              >
                {isDeleting ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Trash2 className="w-3.5 h-3.5" />}
                <span>{loc('حذف فایل', 'Delete File', 'Eliminar archivo', 'حذف الملف', 'Datei löschen', 'Удалить файл')}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
