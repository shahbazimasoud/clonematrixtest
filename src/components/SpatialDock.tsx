/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { 
  LayoutDashboard, 
  Settings, 
  Terminal, 
  BarChart3, 
  LogOut,
  Users,
  Globe,
  GripVertical
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
    logout: 'خروج از حساب',
    dragHint: 'برای جابجایی بکشید'
  },
  en: {
    dashboard: 'Dashboard',
    config: 'Homeserver',
    admin: 'Matrix Admin',
    terminal: 'Web Console',
    reporting: 'Analytics',
    connections: 'Connections',
    logout: 'Sign Out',
    dragHint: 'Drag to reorder'
  },
  es: {
    dashboard: 'Dashboard',
    config: 'Homeserver',
    admin: 'Admin Matrix',
    terminal: 'Consola Web',
    reporting: 'Analítica',
    connections: 'Conexiones',
    logout: 'Cerrar Sesión',
    dragHint: 'Arrastrar para reordenar'
  },
  ar: {
    dashboard: 'لوحة التحكم',
    config: 'إعدادات الخادم',
    admin: 'إدارة ماتریکس',
    terminal: 'كواجهة وب',
    reporting: 'التحليلات',
    connections: 'الاتصالات',
    logout: 'تسجيل الخروج',
    dragHint: 'اسحب لإعادة الترتيب'
  },
  de: {
    dashboard: 'Dashboard',
    config: 'Homeserver',
    admin: 'Matrix Admin',
    terminal: 'Web-Konsole',
    reporting: 'Analysen',
    connections: 'Verbindungen',
    logout: 'Abmelden',
    dragHint: 'Zum Umordnen ziehen'
  },
  ru: {
    dashboard: 'Панель',
    config: 'Конфигурация',
    admin: 'Админ Matrix',
    terminal: 'Веб-консоль',
    reporting: 'Аналитика',
    connections: 'Подключения',
    logout: 'Выйти',
    dragHint: 'Перетащите для تغییر порядка'
  }
};

export default function SpatialDock({ activeView, onViewChange, onLogout, userRole, lang }: SpatialDockProps) {
  const t = dockTranslations[lang] || dockTranslations.en;
  
  const defaultItems = [
    { id: 'dashboard', label: t.dashboard, icon: LayoutDashboard, color: 'text-indigo-400' },
    { id: 'config', label: t.config, icon: Settings, color: 'text-purple-400' },
    { id: 'admin', label: t.admin, icon: Users, color: 'text-pink-400' },
    { id: 'terminal', label: t.terminal, icon: Terminal, color: 'text-rose-400' },
    { id: 'reporting', label: t.reporting, icon: BarChart3, color: 'text-indigo-400' },
    { id: 'connections', label: t.connections, icon: Globe, color: 'text-teal-400' },
  ];

  const [order, setOrder] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('dock_items_order');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          const validIds = defaultItems.map(i => i.id);
          const filtered = parsed.filter((id: string) => validIds.includes(id));
          validIds.forEach(id => {
            if (!filtered.includes(id)) filtered.push(id);
          });
          return filtered;
        }
      }
    } catch (e) {
      // ignore
    }
    return ['dashboard', 'config', 'admin', 'terminal', 'reporting', 'connections'];
  });

  const [draggedItemId, setDraggedItemId] = useState<string | null>(null);
  const [dragOverItemId, setDragOverItemId] = useState<string | null>(null);

  const handleDragStart = (e: React.DragEvent, id: string) => {
    e.dataTransfer.setData('text/plain', id);
    e.dataTransfer.effectAllowed = 'move';
    setDraggedItemId(id);
  };

  const handleDragOver = (e: React.DragEvent, targetId: string) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    if (draggedItemId && draggedItemId !== targetId) {
      setDragOverItemId(targetId);
    }
  };

  const handleDrop = (e: React.DragEvent, targetId: string) => {
    e.preventDefault();
    if (!draggedItemId || draggedItemId === targetId) return;

    const newOrder = [...order];
    const draggedIdx = newOrder.indexOf(draggedItemId);
    const targetIdx = newOrder.indexOf(targetId);

    if (draggedIdx !== -1 && targetIdx !== -1) {
      newOrder.splice(draggedIdx, 1);
      newOrder.splice(targetIdx, 0, draggedItemId);
      setOrder(newOrder);
      try {
        localStorage.setItem('dock_items_order', JSON.stringify(newOrder));
      } catch (err) {
        // ignore
      }
    }

    setDraggedItemId(null);
    setDragOverItemId(null);
  };

  const handleDragEnd = () => {
    setDraggedItemId(null);
    setDragOverItemId(null);
  };

  const orderedNavItems = order
    .map(id => defaultItems.find(item => item.id === id))
    .filter(Boolean) as typeof defaultItems;

  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 select-none">
      <div className="spatial-glass px-5 py-2.5 rounded-full flex items-center gap-2 shadow-[0_15px_40px_rgba(0,0,0,0.5)] border-white/10 relative">
        {/* Floating Indicator Overlay */}
        <div className="absolute inset-0 rounded-full bg-gradient-to-r from-indigo-500/5 to-purple-500/5 pointer-events-none" />

        {orderedNavItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeView === item.id;
          const isDragging = draggedItemId === item.id;
          const isDragOver = dragOverItemId === item.id;

          return (
            <div
              key={item.id}
              draggable
              onDragStart={(e) => handleDragStart(e, item.id)}
              onDragOver={(e) => handleDragOver(e, item.id)}
              onDrop={(e) => handleDrop(e, item.id)}
              onDragEnd={handleDragEnd}
              onClick={() => onViewChange(item.id)}
              className={`relative p-3 rounded-full transition-all duration-200 group flex flex-col items-center cursor-grab active:cursor-grabbing hover:scale-110 ${
                isDragging ? 'opacity-30 scale-95' : ''
              } ${
                isDragOver ? 'ring-2 ring-indigo-400 bg-indigo-500/20 scale-105' : ''
              } ${
                isActive 
                  ? 'bg-white/10 text-white shadow-[0_0_15px_rgba(99,102,241,0.25)] border border-white/10' 
                  : 'text-gray-400 hover:text-white hover:bg-white/5'
              }`}
              id={`nav-btn-${item.id}`}
            >
              <Icon className={`w-5 h-5 ${item.color} transition-transform duration-300 group-hover:rotate-6`} />
              
              {/* Tooltip */}
              <span className="absolute bottom-14 opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none bg-slate-950/90 text-white text-xs px-2.5 py-1 rounded-md border border-white/10 whitespace-nowrap shadow-xl flex items-center gap-1.5">
                <span>{item.label}</span>
                <GripVertical className="w-3 h-3 text-slate-400 shrink-0" />
              </span>

              {/* Active Indicator Glow Under Icon */}
              {isActive && (
                <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1.5 h-1.5 rounded-full bg-indigo-400 shadow-[0_0_8px_#6366f1]" />
              )}
            </div>
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
