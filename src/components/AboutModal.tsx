import React, { useState, useEffect } from 'react';
import { 
  Info, 
  X, 
  ShieldCheck, 
  Cpu, 
  Server, 
  GitBranch, 
  Github, 
  Code, 
  Terminal, 
  CheckCircle2, 
  ExternalLink,
  Layers,
  Calendar,
  Sparkles,
  Database,
  KeyRound,
  History,
  Copy,
  Check,
  RefreshCw
} from 'lucide-react';
import { PANEL_VERSION, PANEL_BUILD_DATE, PANEL_NAME, PANEL_CODENAME, VERSION_HISTORY, getUpdateVersionString } from '../version';
import RavenLogo from './RavenLogo';

interface AboutModalProps {
  isOpen: boolean;
  onClose: () => void;
  lang: 'fa' | 'en' | 'es' | 'ar' | 'de' | 'ru';
  isLightMode: boolean;
  activeConnection: any;
  onOpenUpdates?: () => void;
  updateAvailable?: boolean;
  commitsBehind?: number;
  latestCommitDesc?: string;
  latestVersion?: string;
}

export const AboutModal: React.FC<AboutModalProps> = ({
  isOpen,
  onClose,
  lang,
  isLightMode,
  activeConnection,
  onOpenUpdates,
  updateAvailable,
  commitsBehind = 0,
  latestCommitDesc,
  latestVersion
}) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'changelog'>('overview');
  const [copied, setCopied] = useState(false);

  const isRtl = lang === 'fa' || lang === 'ar';

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleCopySystemInfo = () => {
    const info = `${PANEL_NAME} (${PANEL_CODENAME})
Version: v${PANEL_VERSION} (${PANEL_BUILD_DATE})
Connection: ${activeConnection?.name || 'Local'} (${activeConnection?.host || 'localhost'})
Stack: React 19 + TypeScript + Vite + Tailwind CSS + Express Node.js
Repository: https://github.com/shahbazimasoud/clonematrixtest`;
    
    navigator.clipboard.writeText(info);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 animate-in fade-in duration-200">
      {/* Backdrop overlay */}
      <div 
        className="fixed inset-0 bg-black/60 backdrop-blur-md transition-opacity" 
        onClick={onClose}
      />

      {/* Modal Dialog */}
      <div 
        className={`relative w-full max-w-2xl max-h-[90vh] flex flex-col rounded-3xl shadow-2xl overflow-hidden z-10 border transition-all ${
          isLightMode 
            ? 'bg-white/95 border-slate-200 text-slate-800' 
            : 'bg-slate-950/95 border-white/10 text-white'
        }`}
        dir={isRtl ? 'rtl' : 'ltr'}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header Section */}
        <div className={`p-6 border-b relative ${
          isLightMode ? 'border-slate-100 bg-slate-50/50' : 'border-white/5 bg-white/[0.02]'
        }`}>
          <button 
            type="button"
            onClick={onClose}
            className={`absolute ${isRtl ? 'left-6' : 'right-6'} top-6 p-2 rounded-xl transition-all cursor-pointer ${
              isLightMode ? 'hover:bg-slate-200 text-slate-500' : 'hover:bg-white/10 text-slate-400'
            }`}
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-indigo-600 to-purple-600 p-0.5 shadow-lg shadow-indigo-500/20 shrink-0">
              <div className="w-full h-full bg-slate-950 rounded-[14px] flex items-center justify-center">
                <RavenLogo className="w-7 h-7 text-indigo-400" />
              </div>
            </div>

            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg sm:text-xl font-display font-extrabold tracking-tight">
                  {PANEL_NAME}
                </h2>
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                  <Sparkles className="w-3 h-3" />
                  v{PANEL_VERSION}
                </span>
              </div>
              <p className={`text-xs mt-0.5 ${isLightMode ? 'text-slate-500' : 'text-slate-400'}`}>
                {lang === 'fa' ? 'پنل پیشرفته مدیریت سرور ماتریکس سیناپس، المنت و تونل‌های امن SSH' :
                 lang === 'es' ? 'Panel avanzado de gestión de servidores Matrix Synapse, Element y SSH' :
                 lang === 'ar' ? 'لوحة إدارة خادم ماتريكس سينابس، المنت وأنفاق SSH المتقدمة' :
                 lang === 'de' ? 'Erweitertes Verwaltungs-Panel für Matrix Synapse, Element und SSH' :
                 lang === 'ru' ? 'Расширенная панель управления сервером Matrix Synapse, Element и SSH' :
                 'Advanced management panel for Matrix Synapse, Element client & SSH tunnels'}
              </p>
            </div>
          </div>

          {/* Navigation Tabs */}
          <div className="flex items-center gap-2 mt-6 border-t pt-4 border-slate-200/50 dark:border-white/5">
            <button
              type="button"
              onClick={() => setActiveTab('overview')}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                activeTab === 'overview'
                  ? 'bg-indigo-600 text-white shadow-md shadow-indigo-500/20'
                  : isLightMode 
                    ? 'text-slate-600 hover:bg-slate-100' 
                    : 'text-slate-400 hover:bg-white/5'
              }`}
            >
              <Info className="w-4 h-4" />
              <span>
                {lang === 'fa' ? 'اطلاعات سیستم' :
                 lang === 'es' ? 'Información del Sistema' :
                 lang === 'ar' ? 'معلومات النظام' :
                 lang === 'de' ? 'Systemübersicht' :
                 lang === 'ru' ? 'Обзор системы' : 'System Overview'}
              </span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('changelog')}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                activeTab === 'changelog'
                  ? 'bg-indigo-600 text-white shadow-md shadow-indigo-500/20'
                  : isLightMode 
                    ? 'text-slate-600 hover:bg-slate-100' 
                    : 'text-slate-400 hover:bg-white/5'
              }`}
            >
              <History className="w-4 h-4" />
              <span>
                {lang === 'fa' ? 'تاریخچه تغییرات' :
                 lang === 'es' ? 'Historial de cambios' :
                 lang === 'ar' ? 'سجل التغييرات' :
                 lang === 'de' ? 'Änderungsprotokoll' :
                 lang === 'ru' ? 'История изменений' : 'Changelog History'}
              </span>
              <span className="px-1.5 py-0.2 text-[10px] rounded-full bg-white/20">
                {VERSION_HISTORY.length}
              </span>
            </button>
          </div>
        </div>

        {/* Modal Body Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6 max-h-[60vh] custom-scrollbar">
          {activeTab === 'overview' ? (
            <div className="space-y-6">
              {/* Update Banner inside About Modal */}
              {updateAvailable && (
                <div className={`p-4 rounded-2xl border transition-all ${
                  isLightMode 
                    ? 'bg-slate-100 border-slate-300 text-slate-800 shadow-md' 
                    : 'bg-gradient-to-r from-purple-900/90 via-indigo-900/90 to-purple-950/90 border-purple-500/40 text-white shadow-xl shadow-purple-500/10'
                }`}>
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="flex items-start gap-3">
                      <div className={`p-2.5 rounded-xl shrink-0 ${
                        isLightMode ? 'bg-indigo-100 text-indigo-700' : 'bg-white/20 text-white'
                      }`}>
                        <RefreshCw className="w-5 h-5 animate-spin" style={{ animationDuration: '4s' }} />
                      </div>
                      <div>
                        <h3 className={`text-sm font-extrabold flex items-center justify-between gap-2 ${
                          isLightMode ? 'text-slate-900' : 'text-white'
                        }`}>
                          <span>
                            {lang === 'fa' ? 'بروزرسانی جدید در دسترس است!' :
                             lang === 'es' ? '¡Nueva actualización disponible!' :
                             lang === 'ar' ? 'يتوفر تحديث جديد!' :
                             lang === 'de' ? 'Neues Update verfügbar!' :
                             lang === 'ru' ? 'Доступно новое обновление!' : 'New Update Available!'}
                          </span>
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-purple-500/20 text-purple-300 border border-purple-500/30">
                            v{getUpdateVersionString(PANEL_VERSION, latestVersion)}
                          </span>
                        </h3>
                        <p className={`text-xs mt-1 font-medium ${
                          isLightMode ? 'text-slate-700' : 'text-purple-100'
                        }`}>
                          {lang === 'fa' ? `نسخه شما به تعداد ${commitsBehind} کامیت از نسخه اصلی عقب‌تر است.` :
                           lang === 'es' ? `Su versión está ${commitsBehind} commits atrasada.` :
                           lang === 'ar' ? `إصدارك متأخر بـ ${commitsBehind} تغييرات.` :
                           lang === 'de' ? `Ihre Version ist ${commitsBehind} Commits im Rückstand.` :
                           lang === 'ru' ? `Ваша версия отстает на ${commitsBehind} коммитов.` :
                           `Your version is ${commitsBehind} commits behind the main branch.`}
                        </p>

                        {latestCommitDesc && (
                          <div className={`mt-2.5 p-2.5 rounded-xl border font-mono text-[11px] whitespace-pre-wrap leading-normal text-left ltr ${
                            isLightMode 
                              ? 'bg-slate-200/90 border-slate-300 text-slate-900 font-semibold' 
                              : 'bg-black/40 border-white/20 text-white'
                          }`}>
                            <span className={`font-sans font-extrabold block mb-1 text-[10px] uppercase tracking-wider ${
                              isLightMode ? 'text-indigo-800' : 'text-purple-200'
                            }`}>
                              {lang === 'fa' ? 'توضیحات آخرین تغییر:' : 'Latest Change:'}
                            </span>
                            <span className={isLightMode ? 'text-slate-900' : 'text-white'}>
                              {latestCommitDesc}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>

                    {onOpenUpdates && (
                      <button
                        type="button"
                        onClick={() => {
                          onClose();
                          onOpenUpdates();
                        }}
                        className={`px-4 py-2.5 rounded-xl font-extrabold text-xs transition-all cursor-pointer shrink-0 shadow-md text-center ${
                          isLightMode
                            ? 'bg-indigo-600 text-white hover:bg-indigo-700'
                            : 'bg-white text-indigo-900 hover:bg-slate-100'
                        }`}
                      >
                        {lang === 'fa' ? 'نصب بروزرسانی' : 'Install Update'}
                      </button>
                    )}
                  </div>
                </div>
              )}

              {/* Core Metadata Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className={`p-3.5 rounded-2xl border ${
                  isLightMode ? 'bg-slate-50 border-slate-200' : 'bg-white/[0.03] border-white/5'
                }`}>
                  <div className="flex items-center gap-1.5 text-xs text-slate-400 mb-1">
                    <Code className="w-3.5 h-3.5 text-indigo-400" />
                    <span>{lang === 'fa' ? 'نسخه پنل' : 'Panel Version'}</span>
                  </div>
                  <span className="text-sm font-bold font-mono">v{PANEL_VERSION}</span>
                </div>

                <div className={`p-3.5 rounded-2xl border ${
                  isLightMode ? 'bg-slate-50 border-slate-200' : 'bg-white/[0.03] border-white/5'
                }`}>
                  <div className="flex items-center gap-1.5 text-xs text-slate-400 mb-1">
                    <Calendar className="w-3.5 h-3.5 text-purple-400" />
                    <span>{lang === 'fa' ? 'تاریخ انتشار' : 'Build Date'}</span>
                  </div>
                  <span className="text-xs font-bold font-mono">{PANEL_BUILD_DATE}</span>
                </div>

                <div className={`p-3.5 rounded-2xl border ${
                  isLightMode ? 'bg-slate-50 border-slate-200' : 'bg-white/[0.03] border-white/5'
                }`}>
                  <div className="flex items-center gap-1.5 text-xs text-slate-400 mb-1">
                    <Layers className="w-3.5 h-3.5 text-emerald-400" />
                    <span>{lang === 'fa' ? 'نام کد' : 'Codename'}</span>
                  </div>
                  <span className="text-xs font-bold">{PANEL_CODENAME}</span>
                </div>

                <div className={`p-3.5 rounded-2xl border ${
                  isLightMode ? 'bg-slate-50 border-slate-200' : 'bg-white/[0.03] border-white/5'
                }`}>
                  <div className="flex items-center gap-1.5 text-xs text-slate-400 mb-1">
                    <Server className="w-3.5 h-3.5 text-amber-400" />
                    <span>{lang === 'fa' ? 'وضعیت اتصال' : 'Connection'}</span>
                  </div>
                  <span className="text-xs font-bold truncate block">
                    {activeConnection?.id === 'local' ? (lang === 'fa' ? 'محلی (Sandbox)' : 'Local Sandbox') : activeConnection?.name || 'Remote'}
                  </span>
                </div>
              </div>

              {/* Technical Specifications */}
              <div className={`p-4 rounded-2xl border ${
                isLightMode ? 'bg-slate-50 border-slate-200' : 'bg-slate-900/50 border-white/5'
              }`}>
                <h3 className="text-xs font-bold uppercase tracking-wider mb-3 text-indigo-400 flex items-center gap-2">
                  <Cpu className="w-4 h-4" />
                  <span>{lang === 'fa' ? 'مشخصات فنی و تکنولوژی‌ها' : 'Technical Specifications & Architecture'}</span>
                </h3>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                  <div className="flex items-center gap-2 p-2 rounded-xl bg-black/10 dark:bg-white/5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                    <span><strong>Frontend:</strong> React 19 + TypeScript + Vite</span>
                  </div>
                  <div className="flex items-center gap-2 p-2 rounded-xl bg-black/10 dark:bg-white/5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                    <span><strong>Styling:</strong> Tailwind CSS v4 + Lucide Icons</span>
                  </div>
                  <div className="flex items-center gap-2 p-2 rounded-xl bg-black/10 dark:bg-white/5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                    <span><strong>Backend Core:</strong> Express Node.js + WebSocket WS</span>
                  </div>
                  <div className="flex items-center gap-2 p-2 rounded-xl bg-black/10 dark:bg-white/5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                    <span><strong>Matrix API:</strong> Synapse Admin REST API v2</span>
                  </div>
                  <div className="flex items-center gap-2 p-2 rounded-xl bg-black/10 dark:bg-white/5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                    <span><strong>Database:</strong> PostgreSQL 14+ via node-pg</span>
                  </div>
                  <div className="flex items-center gap-2 p-2 rounded-xl bg-black/10 dark:bg-white/5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                    <span><strong>Networking:</strong> SSH Tunneling & TURN Server</span>
                  </div>
                </div>
              </div>

              {/* Developer & Repository Card */}
              <div className={`p-4 rounded-2xl border ${
                isLightMode ? 'bg-indigo-50/50 border-indigo-100' : 'bg-indigo-950/20 border-indigo-500/10'
              }`}>
                <div className="flex items-center justify-between flex-wrap gap-3">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-xl bg-indigo-500/10 text-indigo-400">
                      <Github className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="text-xs font-bold">{lang === 'fa' ? 'مخزن رسمی گیت‌هاب' : 'Official GitHub Repository'}</h4>
                      <p className={`text-[11px] ${isLightMode ? 'text-slate-500' : 'text-slate-400'}`}>
                        github.com/shahbazimasoud/clonematrixtest
                      </p>
                    </div>
                  </div>

                  <a
                    href="https://github.com/shahbazimasoud/clonematrixtest"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold transition-all shadow-md shadow-indigo-500/20"
                  >
                    <span>{lang === 'fa' ? 'مشاهده در گیت‌هاب' : 'View Repo'}</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                </div>
              </div>
            </div>
          ) : (
            /* Changelog History Tab */
            <div className="space-y-4">
              {VERSION_HISTORY.map((entry, idx) => (
                <div 
                  key={entry.version}
                  className={`p-4 rounded-2xl border ${
                    idx === 0 
                      ? isLightMode 
                        ? 'bg-indigo-50/40 border-indigo-200' 
                        : 'bg-indigo-950/20 border-indigo-500/20'
                      : isLightMode 
                        ? 'bg-slate-50 border-slate-200' 
                        : 'bg-white/[0.02] border-white/5'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold font-mono ${
                        idx === 0 ? 'bg-indigo-500 text-white' : 'bg-slate-200 dark:bg-white/10 text-slate-700 dark:text-slate-300'
                      }`}>
                        v{entry.version}
                      </span>
                      <h4 className="text-xs font-bold">{entry.title}</h4>
                    </div>
                    <span className="text-[10px] text-slate-400 font-mono">{entry.date}</span>
                  </div>

                  <ul className="space-y-1 mt-2">
                    {entry.changes.map((change, cIdx) => (
                      <li key={cIdx} className="text-xs text-slate-400 flex items-start gap-2">
                        <span className="text-indigo-400 mt-1">•</span>
                        <span>{change}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Modal Footer Controls */}
        <div className={`p-4 border-t flex items-center justify-between gap-3 ${
          isLightMode ? 'border-slate-100 bg-slate-50/80' : 'border-white/5 bg-slate-900/40'
        }`}>
          <button
            type="button"
            onClick={handleCopySystemInfo}
            className={`inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer border ${
              copied
                ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
                : isLightMode
                  ? 'bg-white border-slate-200 text-slate-700 hover:bg-slate-100'
                  : 'bg-white/5 border-white/10 text-slate-300 hover:bg-white/10'
            }`}
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copied ? (lang === 'fa' ? 'کپی شد!' : 'Copied!') : (lang === 'fa' ? 'کپی اطلاعات سیستم' : 'Copy System Info')}</span>
          </button>

          <div className="flex items-center gap-2">
            {onOpenUpdates && (
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onOpenUpdates();
                }}
                className="px-3.5 py-2 rounded-xl bg-indigo-500/10 border border-indigo-500/20 hover:bg-indigo-500/20 text-indigo-400 text-xs font-bold transition-all cursor-pointer"
              >
                {lang === 'fa' ? 'مشاهده بروزرسانی‌ها' : 'Check Updates'}
              </button>
            )}

            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold transition-all cursor-pointer shadow-md shadow-indigo-500/20"
            >
              {lang === 'fa' ? 'بستن' : 'Close'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AboutModal;
