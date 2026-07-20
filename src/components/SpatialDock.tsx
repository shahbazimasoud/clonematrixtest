/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { 
  LayoutDashboard, 
  Settings, 
  Video, 
  ShieldCheck, 
  Database, 
  Terminal, 
  BarChart3, 
  LogOut,
  Users,
  Globe
} from 'lucide-react';

interface SpatialDockProps {
  activeView: string;
  onViewChange: (view: string) => void;
  onLogout: () => void;
  userRole: string;
  lang: string;
}

const dockTranslations: Record<string, Record<string, string>> = {
  fa: {
    dashboard: 'داشبورد',
    config: 'تنظیمات سرور',
    admin: 'مدیریت ماتریکس',
    terminal: 'کنسول خط فرمان',
    reporting: 'تحلیل و آمار',
    connections: 'مدیریت اتصالات',
    logout: 'خروج از حساب'
  },
  en: {
    dashboard: 'Dashboard',
    config: 'Homeserver',
    admin: 'Matrix Admin',
    terminal: 'Web Console',
    reporting: 'Analytics',
    connections: 'Connections',
    logout: 'Sign Out'
  },
  es: {
    dashboard: 'Dashboard',
    config: 'Homeserver',
    admin: 'Admin Matrix',
    terminal: 'Consola Web',
    reporting: 'Analítica',
    connections: 'Conexiones',
    logout: 'Cerrar Sesión'
  },
  ar: {
    dashboard: 'لوحة التحكم',
    config: 'إعدادات الخادم',
    admin: 'إدارة ماتریکس',
    terminal: 'كواجهة وب',
    reporting: 'التحليلات',
    connections: 'الاتصالات',
    logout: 'تسجيل الخروج'
  },
  de: {
    dashboard: 'Dashboard',
    config: 'Homeserver',
    admin: 'Matrix Admin',
    terminal: 'Web-Konsole',
    reporting: 'Analysen',
    connections: 'Verbindungen',
    logout: 'Abmelden'
  },
  ru: {
    dashboard: 'Панель',
    config: 'Конфигурация',
    admin: 'Админ Matrix',
    terminal: 'Веб-консоль',
    reporting: 'Аналитика',
    connections: 'Подключения',
    logout: 'Выйти'
  }
};

export default function SpatialDock({ activeView, onViewChange, onLogout, userRole, lang }: SpatialDockProps) {
  const t = dockTranslations[lang] || dockTranslations.en;
  
  const navItems = [
    { id: 'dashboard', label: t.dashboard, icon: LayoutDashboard, color: 'text-indigo-400' },
    { id: 'config', label: t.config, icon: Settings, color: 'text-purple-400' },
    { id: 'admin', label: t.admin, icon: Users, color: 'text-pink-400' },
    { id: 'terminal', label: t.terminal, icon: Terminal, color: 'text-rose-400' },
    { id: 'reporting', label: t.reporting, icon: BarChart3, color: 'text-indigo-400' },
    { id: 'connections', label: t.connections, icon: Globe, color: 'text-teal-400' },
  ];

  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50">
      <div className="spatial-glass px-6 py-3 rounded-full flex items-center gap-2 shadow-[0_15px_40px_rgba(0,0,0,0.5)] border-white/10 relative">
        {/* Floating Indicator Overlay */}
        <div className="absolute inset-0 rounded-full bg-gradient-to-r from-indigo-500/5 to-purple-500/5 pointer-events-none" />

        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeView === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onViewChange(item.id)}
              className={`relative p-3 rounded-full transition-all duration-300 group flex flex-col items-center hover:scale-110 ${
                isActive 
                  ? 'bg-white/10 text-white shadow-[0_0_15px_rgba(99,102,241,0.25)] border border-white/10' 
                  : 'text-gray-400 hover:text-white hover:bg-white/5'
              }`}
              id={`nav-btn-${item.id}`}
            >
              <Icon className={`w-5 h-5 ${item.color} transition-transform duration-300 group-hover:rotate-6`} />
              
              {/* Tooltip */}
              <span className="absolute bottom-14 opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none bg-slate-950/90 text-white text-xs px-2.5 py-1 rounded-md border border-white/10 whitespace-nowrap shadow-xl">
                {item.label}
              </span>

              {/* Active Indicator Glow Under Icon */}
              {isActive && (
                <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1.5 h-1.5 rounded-full bg-indigo-400 shadow-[0_0_8px_#6366f1]" />
              )}
            </button>
          );
        })}

        <div className="h-6 w-[1px] bg-white/10 mx-1" />

        {/* Logout Button */}
        <button
          onClick={onLogout}
          className="p-3 rounded-full text-red-400 hover:text-red-300 hover:bg-red-500/10 transition-all duration-300 group relative hover:scale-110"
          title="Exit Panel"
          id="logout-btn"
        >
          <LogOut className="w-5 h-5 transition-transform duration-300 group-hover:translate-x-0.5" />
          <span className="absolute bottom-14 opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none bg-slate-950/90 text-white text-xs px-2.5 py-1 rounded-md border border-white/10 whitespace-nowrap shadow-xl">
            {t.logout} ({userRole})
          </span>
        </button>
      </div>
    </div>
  );
}
