/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { 
  Clock, 
  Calendar, 
  Globe, 
  RefreshCw, 
  Save, 
  CheckCircle2, 
  AlertCircle, 
  Zap, 
  Terminal, 
  Radio, 
  Check, 
  Search, 
  Sliders, 
  ShieldCheck, 
  Server, 
  ChevronDown, 
  ChevronUp, 
  Laptop, 
  Cpu, 
  Sparkles,
  ArrowRight
} from 'lucide-react';

interface DateTimeConfigTabProps {
  authToken: string;
  userRole: string;
  showToast?: (type: 'success' | 'error' | 'warning' | 'info', text: string) => void;
  lang?: 'fa' | 'en' | 'es' | 'ar' | 'de' | 'ru';
  isLightMode?: boolean;
  activeConnectionId?: string;
  onExecuteCommand?: (cmd: string, args?: any) => void;
}

interface ServerDateTimeInfo {
  date: string;
  time: string;
  timezone: string;
  utcOffset?: string;
  ntpEnabled?: boolean;
  ntpSynchronized?: boolean;
  timestamp?: number;
  formatted?: string;
  isRemote?: boolean;
  serverName?: string;
}

interface TimezoneItem {
  id: string;
  label: string;
  region: string;
  offset: string;
  popular?: boolean;
}

const COMMON_TIMEZONES: TimezoneItem[] = [
  // Middle East & Iran
  { id: 'Asia/Tehran', label: 'Tehran (تهران)', region: 'Middle East', offset: '+03:30', popular: true },
  { id: 'Asia/Dubai', label: 'Dubai (دبی)', region: 'Middle East', offset: '+04:00', popular: true },
  { id: 'Asia/Riyadh', label: 'Riyadh (ریاض)', region: 'Middle East', offset: '+03:00', popular: true },
  { id: 'Asia/Baku', label: 'Baku (باکو)', region: 'Middle East', offset: '+04:00', popular: true },
  { id: 'Asia/Kabul', label: 'Kabul (کابل)', region: 'Middle East', offset: '+04:30', popular: true },
  { id: 'Asia/Baghdad', label: 'Baghdad (بغداد)', region: 'Middle East', offset: '+03:00', popular: true },
  { id: 'Asia/Kuwait', label: 'Kuwait (کویت)', region: 'Middle East', offset: '+03:00' },
  { id: 'Asia/Muscat', label: 'Muscat (مسقط)', region: 'Middle East', offset: '+04:00' },
  { id: 'Asia/Doha', label: 'Doha (دوحه)', region: 'Middle East', offset: '+03:00' },
  { id: 'Asia/Yerevan', label: 'Yerevan (ایروان)', region: 'Middle East', offset: '+04:00' },
  { id: 'Asia/Tbilisi', label: 'Tbilisi (تفلیس)', region: 'Middle East', offset: '+04:00' },

  // UTC / Universal
  { id: 'UTC', label: 'UTC (Universal Coordinated Time)', region: 'Universal', offset: '+00:00', popular: true },
  { id: 'Etc/GMT', label: 'GMT (Greenwich Mean Time)', region: 'Universal', offset: '+00:00' },

  // Europe
  { id: 'Europe/London', label: 'London (لندن)', region: 'Europe', offset: '+00:00/+01:00', popular: true },
  { id: 'Europe/Berlin', label: 'Berlin / Frankfurt (برلین)', region: 'Europe', offset: '+01:00/+02:00', popular: true },
  { id: 'Europe/Paris', label: 'Paris (پاریس)', region: 'Europe', offset: '+01:00/+02:00', popular: true },
  { id: 'Europe/Amsterdam', label: 'Amsterdam (آمستردام)', region: 'Europe', offset: '+01:00/+02:00', popular: true },
  { id: 'Europe/Istanbul', label: 'Istanbul (استانبول)', region: 'Europe', offset: '+03:00', popular: true },
  { id: 'Europe/Moscow', label: 'Moscow (مسکو)', region: 'Europe', offset: '+03:00', popular: true },
  { id: 'Europe/Rome', label: 'Rome (رم)', region: 'Europe', offset: '+01:00/+02:00' },
  { id: 'Europe/Madrid', label: 'Madrid (مادرید)', region: 'Europe', offset: '+01:00/+02:00' },
  { id: 'Europe/Vienna', label: 'Vienna (وین)', region: 'Europe', offset: '+01:00/+02:00' },
  { id: 'Europe/Stockholm', label: 'Stockholm (استکهلم)', region: 'Europe', offset: '+01:00/+02:00' },
  { id: 'Europe/Kyiv', label: 'Kyiv (کی‌یف)', region: 'Europe', offset: '+02:00/+03:00' },
  { id: 'Europe/Helsinki', label: 'Helsinki (هلسینکی)', region: 'Europe', offset: '+02:00/+03:00' },
  { id: 'Europe/Zurich', label: 'Zurich (زوریخ)', region: 'Europe', offset: '+01:00/+02:00' },

  // Americas
  { id: 'America/New_York', label: 'New York / Eastern Time', region: 'Americas', offset: '-05:00/-04:00', popular: true },
  { id: 'America/Chicago', label: 'Chicago / Central Time', region: 'Americas', offset: '-06:00/-05:00', popular: true },
  { id: 'America/Denver', label: 'Denver / Mountain Time', region: 'Americas', offset: '-07:00/-06:00' },
  { id: 'America/Los_Angeles', label: 'Los Angeles / Pacific Time', region: 'Americas', offset: '-08:00/-07:00', popular: true },
  { id: 'America/Toronto', label: 'Toronto (تورنتو)', region: 'Americas', offset: '-05:00/-04:00', popular: true },
  { id: 'America/Vancouver', label: 'Vancouver (ونکوور)', region: 'Americas', offset: '-08:00/-07:00' },
  { id: 'America/Sao_Paulo', label: 'São Paulo (سائوپائولو)', region: 'Americas', offset: '-03:00' },

  // Asia & Pacific
  { id: 'Asia/Tokyo', label: 'Tokyo (توکیو)', region: 'Asia & Pacific', offset: '+09:00', popular: true },
  { id: 'Asia/Shanghai', label: 'Shanghai / Beijing (شانگهای)', region: 'Asia & Pacific', offset: '+08:00', popular: true },
  { id: 'Asia/Singapore', label: 'Singapore (سنگاپور)', region: 'Asia & Pacific', offset: '+08:00', popular: true },
  { id: 'Asia/Hong_Kong', label: 'Hong Kong (هنگ‌کنگ)', region: 'Asia & Pacific', offset: '+08:00' },
  { id: 'Asia/Kolkata', label: 'India / New Delhi (دهلی‌نو)', region: 'Asia & Pacific', offset: '+05:30', popular: true },
  { id: 'Australia/Sydney', label: 'Sydney (سیدنی)', region: 'Asia & Pacific', offset: '+10:00/+11:00', popular: true },
  { id: 'Australia/Melbourne', label: 'Melbourne (ملبورن)', region: 'Asia & Pacific', offset: '+10:00/+11:00' }
];

export default function DateTimeConfigTab({
  authToken,
  userRole,
  showToast,
  lang = 'en',
  isLightMode = false,
  activeConnectionId
}: DateTimeConfigTabProps) {
  const isRtl = lang === 'fa' || lang === 'ar';
  const isReadOnly = userRole === 'Viewer';

  const loc = (
    fa: string,
    en: string,
    es?: string,
    ar?: string,
    de?: string,
    ru?: string
  ): string => {
    if (lang === 'fa') return fa;
    if (lang === 'es') return es || en;
    if (lang === 'ar') return ar || fa;
    if (lang === 'de') return de || en;
    if (lang === 'ru') return ru || en;
    return en;
  };

  // State
  const [loading, setLoading] = useState<boolean>(true);
  const [serverInfo, setServerInfo] = useState<ServerDateTimeInfo | null>(null);
  const [liveSeconds, setLiveSeconds] = useState<number>(0);

  // Form Inputs - Manual Time
  const [inputDate, setInputDate] = useState<string>('');
  const [inputTime, setInputTime] = useState<string>('');
  const [syncHwClock, setSyncHwClock] = useState<boolean>(true);
  const [isApplyingTime, setIsApplyingTime] = useState<boolean>(false);

  // Form Inputs - Timezone
  const [selectedTimezone, setSelectedTimezone] = useState<string>('Asia/Tehran');
  const [customTimezone, setCustomTimezone] = useState<string>('');
  const [tzSearch, setTzSearch] = useState<string>('');
  const [isApplyingTz, setIsApplyingTz] = useState<boolean>(false);

  // Form Inputs - NTP Sync
  const [ntpEnabled, setNtpEnabled] = useState<boolean>(true);
  const [ntpServerInput, setNtpServerInput] = useState<string>('pool.ntp.org');
  const [isSyncingNtp, setIsSyncingNtp] = useState<boolean>(false);

  // Execution Output Logs Drawer
  const [executionLogs, setExecutionLogs] = useState<string[]>([]);
  const [showLogs, setShowLogs] = useState<boolean>(false);

  // Safe JSON response parser
  const safeParseResponse = async (res: Response) => {
    const text = await res.text();
    try {
      return JSON.parse(text);
    } catch (e) {
      if (text.includes('<!DOCTYPE') || text.includes('<html')) {
        return { success: false, error: `Server returned non-JSON response (Status ${res.status}: ${res.statusText})` };
      }
      return { success: false, error: text || `HTTP ${res.status}` };
    }
  };

  // Fetch Server Date and Time
  const fetchDateTime = async (silent = false) => {
    if (!silent) setLoading(true);
    try {
      const res = await fetch('/api/system/datetime', {
        headers: {
          'Authorization': `Bearer ${authToken}`
        }
      });
      const data = await safeParseResponse(res);
      if (data && data.success) {
        setServerInfo(data);
        if (!inputDate || !silent) {
          setInputDate(data.date || '');
          setInputTime(data.time || '');
        }
        if (data.timezone) {
          setSelectedTimezone(data.timezone);
        }
        if (typeof data.ntpEnabled === 'boolean') {
          setNtpEnabled(data.ntpEnabled);
        }
      }
    } catch (err) {
      console.error("Failed to fetch server date and time:", err);
    } finally {
      if (!silent) setLoading(false);
    }
  };

  useEffect(() => {
    if (authToken) {
      fetchDateTime();
    }
  }, [authToken, activeConnectionId]);

  // Live seconds ticker increment
  useEffect(() => {
    const timer = setInterval(() => {
      setLiveSeconds(prev => (prev + 1) % 60);
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Format Persian Shamsi date if requested
  const getFormattedPersianDate = (dateStr?: string) => {
    if (!dateStr) return '';
    try {
      const d = new Date(dateStr);
      if (isNaN(d.getTime())) return dateStr;
      return new Intl.DateTimeFormat('fa-IR', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        weekday: 'long'
      }).format(d);
    } catch (e) {
      return dateStr;
    }
  };

  // Helper: Set input to current browser time
  const handleSetToBrowserTime = () => {
    const now = new Date();
    const pad = (n: number) => n.toString().padStart(2, '0');
    const dateStr = `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`;
    const timeStr = `${pad(now.getHours())}:${pad(now.getMinutes())}:${pad(now.getSeconds())}`;
    setInputDate(dateStr);
    setInputTime(timeStr);
    if (showToast) {
      showToast('info', loc('مقادیر بر اساس ساعت و تاریخ مرورگر شما تنظیم شد.', 'Set to current browser date & time.'));
    }
  };

  // Helper: Set input to UTC Now
  const handleSetToUtcNow = () => {
    const now = new Date();
    const pad = (n: number) => n.toString().padStart(2, '0');
    const dateStr = `${now.getUTCFullYear()}-${pad(now.getUTCMonth() + 1)}-${pad(now.getUTCDate())}`;
    const timeStr = `${pad(now.getUTCHours())}:${pad(now.getUTCMinutes())}:${pad(now.getUTCSeconds())}`;
    setInputDate(dateStr);
    setInputTime(timeStr);
    if (showToast) {
      showToast('info', loc('مقادیر بر اساس ساعت جهانی UTC تنظیم شد.', 'Set to UTC current time.'));
    }
  };

  // Submit Manual Date & Time
  const handleApplyManualTime = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isReadOnly) return;
    if (!inputDate || !inputTime) {
      if (showToast) showToast('warning', loc('لطفاً هم تاریخ و هم ساعت را وارد نمایید.', 'Please specify both date and time.'));
      return;
    }

    setIsApplyingTime(true);
    setShowLogs(true);
    setExecutionLogs([
      loc(`[درخواست] تنظیم دستی ساعت سرور به: ${inputDate} ${inputTime}...`, `[REQUEST] Setting manual server time to: ${inputDate} ${inputTime}...`)
    ]);

    try {
      const res = await fetch('/api/system/datetime/set-time', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authToken}`
        },
        body: JSON.stringify({
          date: inputDate.trim(),
          time: inputTime.trim(),
          syncHardwareClock: syncHwClock
        })
      });

      const data = await safeParseResponse(res);
      if (res.ok && data.success) {
        if (Array.isArray(data.executionSteps)) {
          setExecutionLogs(data.executionSteps);
        }
        if (showToast) {
          showToast('success', loc('تاریخ و ساعت سرور با موفقیت تنظیم گردید.', 'Server date and time successfully updated.'));
        }
        fetchDateTime(true);
      } else {
        const errMsg = data.error || data.message || loc('خطا در تغییر زمان سرور', 'Failed to update server time');
        setExecutionLogs(prev => [...prev, `❌ ${errMsg}`]);
        if (showToast) showToast('error', errMsg);
      }
    } catch (err: any) {
      const errMsg = err.message || 'Connection error';
      setExecutionLogs(prev => [...prev, `❌ ${errMsg}`]);
      if (showToast) showToast('error', errMsg);
    } finally {
      setIsApplyingTime(false);
    }
  };

  // Submit Timezone Change
  const handleApplyTimezone = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isReadOnly) return;
    const targetTz = (customTimezone.trim() || selectedTimezone || '').trim();
    if (!targetTz) {
      if (showToast) showToast('warning', loc('لطفاً منطقه زمانی مورد نظر را انتخاب نمایید.', 'Please select a timezone.'));
      return;
    }

    setIsApplyingTz(true);
    setShowLogs(true);
    setExecutionLogs([
      loc(`[درخواست] تغییر منطقه زمانی سرور به: ${targetTz}...`, `[REQUEST] Changing server timezone to: ${targetTz}...`)
    ]);

    try {
      const res = await fetch('/api/system/datetime/set-timezone', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authToken}`
        },
        body: JSON.stringify({
          timezone: targetTz
        })
      });

      const data = await safeParseResponse(res);
      if (res.ok && data.success) {
        if (Array.isArray(data.executionSteps)) {
          setExecutionLogs(data.executionSteps);
        }
        if (showToast) {
          showToast('success', loc(`منطقه زمانی سرور به ${targetTz} تغییر یافت.`, `Server timezone updated to ${targetTz}.`));
        }
        setCustomTimezone('');
        fetchDateTime(true);
      } else {
        const errMsg = data.error || data.message || loc('خطا در تغییر منطقه زمانی سرور', 'Failed to update timezone');
        setExecutionLogs(prev => [...prev, `❌ ${errMsg}`]);
        if (showToast) showToast('error', errMsg);
      }
    } catch (err: any) {
      const errMsg = err.message || 'Connection error';
      setExecutionLogs(prev => [...prev, `❌ ${errMsg}`]);
      if (showToast) showToast('error', errMsg);
    } finally {
      setIsApplyingTz(false);
    }
  };

  // Submit NTP Force Sync
  const handleSyncNtp = async (enableState: boolean) => {
    if (isReadOnly) return;
    setIsSyncingNtp(true);
    setShowLogs(true);
    setExecutionLogs([
      loc(`[NTP] همگام‌سازی ساعت با سرورهای زمانی اینترنتی (${ntpServerInput})...`, `[NTP] Synchronizing server time with NTP (${ntpServerInput})...`)
    ]);

    try {
      const res = await fetch('/api/system/datetime/sync-ntp', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authToken}`
        },
        body: JSON.stringify({
          enable: enableState,
          ntpServer: ntpServerInput.trim() || 'pool.ntp.org'
        })
      });

      const data = await safeParseResponse(res);
      if (res.ok && data.success) {
        if (Array.isArray(data.executionSteps)) {
          setExecutionLogs(data.executionSteps);
        }
        if (showToast) {
          showToast('success', loc('همگام‌سازی زمان با سرور NTP با موفقیت انجام شد.', 'NTP time synchronization completed successfully.'));
        }
        setNtpEnabled(enableState);
        fetchDateTime(true);
      } else {
        const errMsg = data.error || data.message || loc('خطا در همگام‌سازی NTP', 'NTP sync failed');
        setExecutionLogs(prev => [...prev, `❌ ${errMsg}`]);
        if (showToast) showToast('error', errMsg);
      }
    } catch (err: any) {
      const errMsg = err.message || 'Connection error';
      setExecutionLogs(prev => [...prev, `❌ ${errMsg}`]);
      if (showToast) showToast('error', errMsg);
    } finally {
      setIsSyncingNtp(false);
    }
  };

  // Filtered Timezones
  const filteredTimezones = COMMON_TIMEZONES.filter(tz => 
    tz.id.toLowerCase().includes(tzSearch.toLowerCase()) ||
    tz.label.toLowerCase().includes(tzSearch.toLowerCase()) ||
    tz.region.toLowerCase().includes(tzSearch.toLowerCase())
  );

  return (
    <div className="space-y-6" id="datetime-config-tab">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-5 border-b border-white/10">
        <div className="flex items-center gap-3">
          <div className={`p-3 rounded-2xl ${isLightMode ? 'bg-cyan-100 text-cyan-700' : 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 shadow-[0_0_15px_rgba(6,182,212,0.15)]'}`}>
            <Clock className="w-7 h-7" />
          </div>
          <div>
            <h2 className="text-xl font-display font-bold text-white flex items-center gap-2">
              <span>{loc('تنظیمات زمان، تاریخ و منطقه زمانی سرور', 'Server Date, Time & Timezone', 'Fecha, Hora y Zona Horaria', 'إعدادات الوقت والتاريخ والمنطقة الزمنية', 'Server-Datum, Uhrzeit & Zeitzone', 'Дата, время и часовой пояс')}</span>
              {serverInfo?.isRemote && (
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                  {loc('سرور متصل', 'Connected Node')}
                </span>
              )}
            </h2>
            <p className="text-xs text-slate-400 mt-1">
              {loc('مدیریت دقیق ساعت سیستمی لینوکس، تاریخ تقویمی، همگام‌سازی خودکار NTP و منطقه زمانی', 'Manage system clock, calendar date, NTP network synchronization, and timezone')}
            </p>
          </div>
        </div>

        <button
          onClick={() => fetchDateTime()}
          disabled={loading}
          className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-slate-300 text-xs font-semibold transition-all hover:text-white disabled:opacity-50"
          title={loc('بروزرسانی زنده مقادیر', 'Refresh Live Values')}
          id="btn-refresh-datetime"
        >
          <RefreshCw className={`w-4 h-4 text-cyan-400 ${loading ? 'animate-spin' : ''}`} />
          <span>{loc('بروزرسانی وضعیت', 'Refresh Status', 'Actualizar', 'تحديث', 'Aktualisieren', 'Обновить')}</span>
        </button>
      </div>

      {/* Live Server Digital Clock Card */}
      <div className="spatial-glass rounded-3xl p-6 border border-cyan-500/20 relative overflow-hidden bg-gradient-to-br from-cyan-950/20 via-black/40 to-slate-900/30">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-center">
          {/* Time & Clock */}
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-cyan-400 text-xs font-bold uppercase tracking-wider">
              <Clock className="w-4 h-4 animate-pulse" />
              <span>{loc('ساعت سیستمی سرور', 'Current Server Time')}</span>
            </div>
            <div className="text-3xl sm:text-4xl font-mono font-black text-white tracking-widest flex items-baseline gap-2">
              <span className="text-cyan-300 drop-shadow-[0_0_12px_rgba(6,182,212,0.4)]">
                {serverInfo?.time || '00:00:00'}
              </span>
              <span className="text-xs font-sans font-normal text-slate-400 px-2 py-0.5 rounded bg-white/5 border border-white/5">
                {serverInfo?.utcOffset || 'UTC'}
              </span>
            </div>
            <p className="text-[11px] text-slate-400 font-mono">
              {serverInfo?.formatted || (serverInfo?.timestamp ? new Date(serverInfo.timestamp).toUTCString() : 'Syncing...')}
            </p>
          </div>

          {/* Date & Calendar */}
          <div className="space-y-1 border-y md:border-y-0 md:border-x border-white/10 py-4 md:py-0 md:px-6">
            <div className="flex items-center gap-2 text-indigo-400 text-xs font-bold uppercase tracking-wider">
              <Calendar className="w-4 h-4" />
              <span>{loc('تاریخ تقویمی سرور', 'Current Server Date')}</span>
            </div>
            <div className="text-2xl sm:text-3xl font-mono font-bold text-white tracking-wide">
              {serverInfo?.date || 'YYYY-MM-DD'}
            </div>
            {lang === 'fa' && (
              <p className="text-xs text-amber-300/90 font-medium">
                {getFormattedPersianDate(serverInfo?.date)}
              </p>
            )}
          </div>

          {/* Timezone & NTP status */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs text-slate-400">{loc('منطقه زمانی فعال:', 'Active Timezone:')}</span>
              <span className="text-xs font-mono font-bold text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-lg border border-emerald-500/20">
                {serverInfo?.timezone || 'UTC'}
              </span>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-xs text-slate-400">{loc('همگام‌سازی خودکار (NTP):', 'NTP Sync Status:')}</span>
              <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-bold ${
                serverInfo?.ntpEnabled 
                  ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                  : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
              }`}>
                <span className={`w-1.5 h-1.5 rounded-full ${serverInfo?.ntpEnabled ? 'bg-emerald-400 animate-pulse' : 'bg-amber-400'}`} />
                {serverInfo?.ntpEnabled ? loc('فعال (NTP Active)', 'Active (NTP)') : loc('غیرفعال / دستی', 'Disabled / Manual')}
              </span>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-xs text-slate-400">{loc('میزبان هدف:', 'Target Node:')}</span>
              <span className="text-xs font-mono text-slate-300">
                {serverInfo?.serverName || (serverInfo?.isRemote ? 'Remote Server' : 'Local Host')}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Grid: Form Sections */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
        
        {/* SECTION 1: Manual Date & Time Adjustment */}
        <div className="spatial-glass rounded-3xl p-6 border border-white/5 space-y-5" id="card-manual-datetime">
          <div className="flex items-center gap-3 pb-3 border-b border-white/5">
            <Sliders className="w-5 h-5 text-cyan-400" />
            <div>
              <h3 className="text-base font-bold text-white">{loc('تنظیم دستی تاریخ و ساعت', 'Manual Date & Time Setting', 'Ajuste Manual de Fecha y Hora', 'الضبط اليدوي للوقت والتاريخ', 'Manuelle Datums- & Zeiteinstellung', 'Ручная установка даты и времени')}</h3>
              <p className="text-xs text-slate-400">{loc('تعیین دقیق ساعت و تاریخ سیستمی لینوکس', 'Set custom calendar date and system clock')}</p>
            </div>
          </div>

          <form onSubmit={handleApplyManualTime} className="space-y-4">
            {/* Date Input */}
            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-1.5 flex items-center justify-between">
                <span>{loc('تاریخ سرور (YYYY-MM-DD)', 'Server Date (YYYY-MM-DD)')}</span>
                <span className="text-[11px] text-slate-400 font-mono">ISO-8601</span>
              </label>
              <div className="relative">
                <input
                  type="date"
                  value={inputDate}
                  onChange={(e) => setInputDate(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl bg-black/40 border border-white/10 text-white font-mono text-sm focus:outline-none focus:border-cyan-500 transition-all"
                  required
                  id="input-manual-date"
                />
              </div>
            </div>

            {/* Time Input */}
            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-1.5 flex items-center justify-between">
                <span>{loc('ساعت سرور (HH:MM:SS)', 'Server Time (HH:MM:SS)')}</span>
                <span className="text-[11px] text-slate-400 font-mono">24-Hour Clock</span>
              </label>
              <div className="relative">
                <input
                  type="time"
                  step="1"
                  value={inputTime}
                  onChange={(e) => setInputTime(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl bg-black/40 border border-white/10 text-white font-mono text-sm focus:outline-none focus:border-cyan-500 transition-all"
                  required
                  id="input-manual-time"
                />
              </div>
            </div>

            {/* Quick Preset Buttons */}
            <div className="flex flex-wrap gap-2 pt-1">
              <button
                type="button"
                onClick={handleSetToBrowserTime}
                className="px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-slate-300 text-xs font-medium border border-white/5 transition-all flex items-center gap-1.5"
                id="btn-preset-browser-time"
              >
                <Laptop className="w-3.5 h-3.5 text-cyan-400" />
                <span>{loc('ساعت مرورگر من', 'My Browser Time', 'Hora del Navegador', 'وقت المتصفح الحالي', 'Meine Browserzeit', 'Время браузера')}</span>
              </button>

              <button
                type="button"
                onClick={handleSetToUtcNow}
                className="px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-slate-300 text-xs font-medium border border-white/5 transition-all flex items-center gap-1.5"
                id="btn-preset-utc-now"
              >
                <Globe className="w-3.5 h-3.5 text-indigo-400" />
                <span>{loc('ساعت گرینویچ (UTC)', 'UTC Current Time', 'Hora UTC Actual', 'الوقت العالمي UTC', 'Aktuelle UTC-Zeit', 'Текущее время UTC')}</span>
              </button>
            </div>

            {/* Sync Hardware Clock Option */}
            <div className="pt-2">
              <label className="flex items-center gap-2.5 cursor-pointer text-xs text-slate-300 hover:text-white transition-colors">
                <input
                  type="checkbox"
                  checked={syncHwClock}
                  onChange={(e) => setSyncHwClock(e.target.checked)}
                  className="w-4 h-4 rounded bg-black/40 border-white/20 text-cyan-500 focus:ring-0 focus:ring-offset-0"
                  id="checkbox-sync-hwclock"
                />
                <span>{loc('همگام‌سازی با ساعت سخت‌افزاری مادربرد (hwclock --systohc)', 'Sync with hardware RTC clock (hwclock --systohc)')}</span>
              </label>
              <p className="text-[11px] text-slate-500 mt-1 mr-6">
                {loc('ذخیره زمان در بایوس سخت‌افزاری سرور تا پس از ریبوت نیز حفظ شود.', 'Saves the time to hardware BIOS clock so it persists across reboots.')}
              </p>
            </div>

            {/* Action Submit */}
            <div className="pt-3 border-t border-white/5">
              <button
                type="submit"
                disabled={isApplyingTime || isReadOnly}
                className="w-full py-3 px-4 rounded-xl bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-300 border border-cyan-500/30 font-bold text-sm flex items-center justify-center gap-2 transition-all disabled:opacity-50 shadow-[0_0_15px_rgba(6,182,212,0.15)]"
                id="btn-apply-manual-time"
              >
                {isApplyingTime ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin text-cyan-400" />
                    <span>{loc('در حال اعمال زمان بر روی سرور...', 'Applying System Time...')}</span>
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4 text-cyan-400" />
                    <span>{loc('اعمال تاریخ و ساعت بر روی سرور', 'Apply Date & Time to Server', 'Aplicar Fecha y Hora al Servidor', 'تطبيق التاريخ والوقت على الخادم', 'Datum & Uhrzeit auf Server anwenden', 'Применить дату и время')}</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </div>

        {/* SECTION 2: Timezone Setting */}
        <div className="spatial-glass rounded-3xl p-6 border border-white/5 space-y-5" id="card-timezone-setting">
          <div className="flex items-center gap-3 pb-3 border-b border-white/5">
            <Globe className="w-5 h-5 text-indigo-400" />
            <div>
              <h3 className="text-base font-bold text-white">{loc('تغییر منطقه زمانی (Timezone)', 'Timezone Configuration', 'Configuración de Zona Horaria', 'تكوين المنطقة الزمنية', 'Zeitzonen-Konfiguration', 'Настройка часового пояса')}</h3>
              <p className="text-xs text-slate-400">{loc('تنظیم منطقه زمانی جغرافیایی سیستم‌عامل (timedatectl set-timezone)', 'Set operating system timezone via timedatectl')}</p>
            </div>
          </div>

          <form onSubmit={handleApplyTimezone} className="space-y-4">
            {/* Search Box */}
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder={loc('جستجوی منطقه زمانی (مانند Tehran, UTC, Berlin, New York)...', 'Search timezone (e.g. Tehran, UTC, London, New York)...')}
                value={tzSearch}
                onChange={(e) => setTzSearch(e.target.value)}
                className="w-full pl-9 pr-4 py-2 rounded-xl bg-black/40 border border-white/10 text-white text-xs placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition-all"
                id="input-search-timezone"
              />
            </div>

            {/* Timezone Select List */}
            <div className="max-h-48 overflow-y-auto space-y-1 pr-1 border border-white/5 rounded-2xl p-2 bg-black/30">
              {filteredTimezones.map((tz) => (
                <div
                  key={tz.id}
                  onClick={() => {
                    setSelectedTimezone(tz.id);
                    setCustomTimezone('');
                  }}
                  className={`flex items-center justify-between px-3 py-2 rounded-xl cursor-pointer text-xs transition-all ${
                    selectedTimezone === tz.id && !customTimezone
                      ? 'bg-indigo-600/30 text-white border border-indigo-500/40 shadow-[0_0_10px_rgba(99,102,241,0.2)]'
                      : 'text-slate-300 hover:bg-white/5 hover:text-white'
                  }`}
                  id={`tz-item-${tz.id.replace('/', '-')}`}
                >
                  <div className="flex items-center gap-2">
                    {selectedTimezone === tz.id && !customTimezone ? (
                      <Check className="w-4 h-4 text-indigo-400 shrink-0" />
                    ) : (
                      <div className="w-4 h-4 rounded-full border border-white/10 shrink-0" />
                    )}
                    <div>
                      <span className="font-semibold">{tz.label}</span>
                      <span className="text-[10px] text-slate-400 font-mono mr-2 ml-2">({tz.id})</span>
                    </div>
                  </div>
                  <span className="text-[10px] font-mono text-indigo-300 bg-indigo-500/10 px-2 py-0.5 rounded border border-indigo-500/20 shrink-0">
                    {tz.offset}
                  </span>
                </div>
              ))}
            </div>

            {/* Custom Timezone Input */}
            <div>
              <label className="text-xs font-semibold text-slate-400 block mb-1">
                {loc('یا وارد کردن منطقه زمانی سفارشی (IANA Format)', 'Or specify custom IANA Timezone')}
              </label>
              <input
                type="text"
                placeholder="e.g. Asia/Tehran, Europe/Paris, America/Sao_Paulo"
                value={customTimezone}
                onChange={(e) => setCustomTimezone(e.target.value)}
                className="w-full px-4 py-2 rounded-xl bg-black/40 border border-white/10 text-white font-mono text-xs focus:outline-none focus:border-indigo-500 transition-all placeholder-slate-500"
                id="input-custom-timezone"
              />
            </div>

            {/* Action Submit */}
            <div className="pt-2 border-t border-white/5">
              <button
                type="submit"
                disabled={isApplyingTz || isReadOnly}
                className="w-full py-3 px-4 rounded-xl bg-indigo-500/20 hover:bg-indigo-500/30 text-indigo-300 border border-indigo-500/30 font-bold text-sm flex items-center justify-center gap-2 transition-all disabled:opacity-50 shadow-[0_0_15px_rgba(99,102,241,0.15)]"
                id="btn-apply-timezone"
              >
                {isApplyingTz ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin text-indigo-400" />
                    <span>{loc('در حال تغییر منطقه زمانی...', 'Applying Timezone...')}</span>
                  </>
                ) : (
                  <>
                    <Globe className="w-4 h-4 text-indigo-400" />
                    <span>{loc('ذخیره و اعمال منطقه زمانی', 'Save & Apply Timezone', 'Guardar y Aplicar Zona Horaria', 'حفظ وتطبيق المنطقة الزمنية', 'Zeitzone speichern & anwenden', 'Сохранить и применить часовой пояс')}</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* SECTION 3: NTP Network Synchronization */}
      <div className="spatial-glass rounded-3xl p-6 border border-white/5 space-y-4" id="card-ntp-sync">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-white/5">
          <div className="flex items-center gap-3">
            <Radio className="w-5 h-5 text-emerald-400" />
            <div>
              <h3 className="text-base font-bold text-white">{loc('همگام‌سازی خودکار با سرورهای زمانی (Network Time Protocol - NTP)', 'NTP Network Time Synchronization', 'Sincronización de Red (NTP)', 'المزامنة التلقائية مع بروتوكول NTP', 'Automatische NTP-Zeitsynchronisation', 'Сетевая синхронизация времени (NTP)')}</h3>
              <p className="text-xs text-slate-400">{loc('هماهنگی خودکار و مستمر ساعت سرور از طریق اینترنت و پورت UDP 123', 'Keep server clock in sync automatically via systemd-timesyncd or chrony')}</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              disabled={isSyncingNtp || isReadOnly}
              onClick={() => handleSyncNtp(true)}
              className="px-4 py-2 rounded-xl bg-emerald-500/20 hover:bg-emerald-500/30 border border-emerald-500/30 text-emerald-300 text-xs font-bold transition-all flex items-center gap-2 disabled:opacity-50"
              id="btn-force-ntp-sync"
            >
              {isSyncingNtp ? (
                <RefreshCw className="w-4 h-4 animate-spin text-emerald-400" />
              ) : (
                <Zap className="w-4 h-4 text-emerald-400" />
              )}
              <span>{loc('همگام‌سازی فوری با اینترنت', 'Force Resync Now', 'Sincronizar Ahora', 'مزامنة فورية الآن', 'Jetzt synchronisieren', 'Синхронизировать сейчас')}</span>
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-center">
          <div>
            <label className="text-xs font-semibold text-slate-300 block mb-1">
              {loc('آدرس سرور مرجع NTP (NTP Pool Server)', 'NTP Pool Server Hostname')}
            </label>
            <input
              type="text"
              value={ntpServerInput}
              onChange={(e) => setNtpServerInput(e.target.value)}
              placeholder="pool.ntp.org, time.google.com, ir.pool.ntp.org"
              className="w-full px-4 py-2 rounded-xl bg-black/40 border border-white/10 text-white font-mono text-xs focus:outline-none focus:border-emerald-500 transition-all"
              id="input-ntp-server"
            />
          </div>

          <div className="space-y-1 text-xs text-slate-400">
            <p className="flex items-center gap-1.5 text-slate-300 font-semibold">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>{loc('سرویس‌های تحت پوشش:', 'Supported Services:')}</span>
            </p>
            <p className="text-[11px] text-slate-400">
              `systemd-timesyncd`, `chrony`, `ntpdate`, `hwclock`
            </p>
          </div>
        </div>
      </div>

      {/* Execution Logs Drawer */}
      {showLogs && (
        <div className="spatial-glass rounded-3xl p-5 border border-white/10 space-y-3 bg-black/50" id="card-datetime-logs">
          <div className="flex items-center justify-between pb-2 border-b border-white/5">
            <div className="flex items-center gap-2 text-xs font-mono font-bold text-slate-300">
              <Terminal className="w-4 h-4 text-cyan-400" />
              <span>{loc('خروجی ترمینال عملیات زمان و منطقه زمانی', 'Execution Output Logs')}</span>
            </div>
            <button
              onClick={() => setShowLogs(false)}
              className="text-xs text-slate-400 hover:text-white transition-colors"
            >
              {loc('بستن لاگ', 'Close')}
            </button>
          </div>

          <div className="bg-black/70 rounded-xl p-3 font-mono text-xs text-emerald-400 max-h-48 overflow-y-auto space-y-1">
            {executionLogs.map((log, idx) => (
              <div key={idx} className="leading-relaxed">
                {log}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
