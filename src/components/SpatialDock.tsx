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
  GripVertical,
  ChevronDown,
  ChevronUp,
  Maximize2,
  Minimize2
} from 'lucide-react';

import { CustomPermissions } from '../types';

interface SpatialDockProps {
  activeView: string;
  onViewChange: (view: string) => void;
  onLogout: () => void;
  userRole: string;
  currentUser?: { role: string; username: string; permissions?: CustomPermissions } | null;
  lang: string;
  isLightMode?: boolean;
}

const dockTranslations: Record<string, Record<string, string>> = {
  fa: {
    dashboard: 'داشبورد',
    config: 'تنظیمات سرور',
    admin: 'مدیریت ماتریکس',
    terminal: 'کنسول خط فرمان',
    reporting: 'Panel Settings & Analysis',
    connections: 'مدیریت اتصالات',
    logout: 'خروج از حساب',
    dragHint: 'برای جابجایی بکشید'
  },
  en: {
    dashboard: 'Dashboard',
    config: 'Homeserver',
    admin: 'Matrix Admin',
    terminal: 'Web Console',
    reporting: 'Panel Settings & Analysis',
    connections: 'Connections',
    logout: 'Sign Out',
    dragHint: 'Drag to reorder'
  },
  es: {
    dashboard: 'Dashboard',
    config: 'Homeserver',
    admin: 'Admin Matrix',
    terminal: 'Consola Web',
    reporting: 'Panel Settings & Analysis',
    connections: 'Conexiones',
    logout: 'Cerrar Sesión',
    dragHint: 'Arrastrar para reordenar'
  },
  ar: {
    dashboard: 'لوحة التحكم',
    config: 'إعدادات الخادم',
    admin: 'إدارة ماتریکس',
    terminal: 'كواجهة وب',
    reporting: 'Panel Settings & Analysis',
    connections: 'الاتصالات',
    logout: 'تسجيل الخروج',
    dragHint: 'اسحب لإعادة الترتيب'
  },
  de: {
    dashboard: 'Dashboard',
    config: 'Homeserver',
    admin: 'Matrix Admin',
    terminal: 'Web-Konsole',
    reporting: 'Panel Settings & Analysis',
    connections: 'Verbindungen',
    logout: 'Abmelden',
    dragHint: 'Zum Umordnen ziehen'
  },
  ru: {
    dashboard: 'Панель',
    config: 'Конфигурация',
    admin: 'Админ Matrix',
    terminal: 'Веб-консоль',
    reporting: 'Panel Settings & Analysis',
    connections: 'Подключения',
    logout: 'Выйти',
    dragHint: 'Перетащите для изменения порядка'
  }
};

export default function SpatialDock({ activeView, onViewChange, onLogout, userRole, currentUser, lang, isLightMode = false }: SpatialDockProps) {
  const t = dockTranslations[lang] || dockTranslations.en;
  
  const allDefaultItems = [
    { id: 'dashboard', label: t.dashboard, icon: LayoutDashboard, color: isLightMode ? 'text-indigo-600' : 'text-indigo-400' },
    { id: 'config', label: t.config, icon: Settings, color: isLightMode ? 'text-purple-600' : 'text-purple-400' },
    { id: 'admin', label: t.admin, icon: Users, color: isLightMode ? 'text-pink-600' : 'text-pink-400' },
    { id: 'terminal', label: t.terminal, icon: Terminal, color: isLightMode ? 'text-rose-600' : 'text-rose-400' },
    { id: 'reporting', label: t.reporting, icon: BarChart3, color: isLightMode ? 'text-indigo-600' : 'text-indigo-400' },
    { id: 'connections', label: t.connections, icon: Globe, color: isLightMode ? 'text-teal-600' : 'text-teal-400' },
  ];

  const defaultItems = allDefaultItems.filter(item => {
    const role = currentUser?.role || userRole;
    if (!role || role === 'Owner' || role === 'Super Admin' || role === 'Admin' || role === 'Moderator') return true;
    if (role === 'Viewer') {
      return ['dashboard', 'reporting'].includes(item.id);
    }
    if (role === 'Custom') {
      const perms = currentUser?.permissions || {};
      if (item.id === 'dashboard') return true;
      if (item.id === 'config') return perms.matrix_stack_settings ?? false;
      if (item.id === 'admin') {
        return !!(perms.send_messages || perms.view_matrix_rooms || perms.matrix_user_tabs || perms.reported_messages || perms.manage_stored_media || perms.manage_matrix_rooms);
      }
      if (item.id === 'terminal') return !!(perms.quick_tasks || perms.control_hub_overview);
      if (item.id === 'reporting') return !!(perms.view_performance_analysis || perms.manage_rbac || perms.view_audit_logs || perms.manage_backups || perms.view_undo_history);
      if (item.id === 'connections') return perms.manage_connections ?? false;
    }
    return true;
  });

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
  const [isCollapsed, setIsCollapsed] = useState<boolean>(() => {
    try {
      return localStorage.getItem('dock_collapsed') === 'true';
    } catch (e) {
      return false;
    }
  });

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

  const toggleCollapse = (state: boolean) => {
    setIsCollapsed(state);
    try {
      localStorage.setItem('dock_collapsed', String(state));
    } catch (e) {
      // ignore
    }
  };

  const availableIds = defaultItems.map(i => i.id);
  const orderedIds = order.filter(id => availableIds.includes(id));
  availableIds.forEach(id => {
    if (!orderedIds.includes(id)) {
      orderedIds.push(id);
    }
  });

  const orderedNavItems = orderedIds
    .map(id => defaultItems.find(item => item.id === id))
    .filter(Boolean) as typeof defaultItems;

  if (isCollapsed) {
    const activeItem = defaultItems.find(i => i.id === activeView) || defaultItems[0];
    const ActiveIcon = activeItem.icon;
    return (
      <div className="fixed bottom-6 right-6 z-50 select-none animate-in fade-in zoom-in-95 duration-200">
        <button
          onClick={() => toggleCollapse(false)}
          className={`spatial-glass px-4 py-2.5 rounded-full flex items-center gap-2.5 transition-all duration-300 group cursor-pointer ${
            isLightMode 
              ? 'bg-white/95 text-slate-800 border-slate-300 shadow-lg hover:bg-slate-50 hover:border-slate-400' 
              : 'text-white border-white/10 hover:border-indigo-500/50 hover:bg-white/10 shadow-[0_15px_40px_rgba(0,0,0,0.5)]'
          }`}
          title={t.expandDock || 'Expand Dock'}
          id="expand-dock-btn"
        >
          <ActiveIcon className={`w-4 h-4 ${activeItem.color}`} />
          <span className={`text-xs font-semibold transition-colors ${
            isLightMode ? 'text-slate-800 group-hover:text-black' : 'text-slate-200 group-hover:text-white'
          }`}>
            {activeItem.label}
          </span>
          <div className={`w-[1px] h-4 my-auto ${isLightMode ? 'bg-slate-300' : 'bg-white/10'}`} />
          <ChevronUp className={`w-4 h-4 group-hover:scale-110 transition-transform ${isLightMode ? 'text-indigo-600' : 'text-indigo-400'}`} />
        </button>
      </div>
    );
  }

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
              className={`relative p-3 rounded-full transition-all duration-200 group flex flex-col items-center cursor-pointer active:cursor-grabbing hover:scale-110 ${
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
              <span className="dock-tooltip absolute bottom-14 opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none bg-slate-950 text-white font-bold text-xs px-3 py-1.5 rounded-lg border border-white/20 whitespace-nowrap shadow-2xl flex items-center gap-1.5 z-50">
                <span className="font-bold text-white">{item.label}</span>
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

        {/* Collapse Dock Button */}
        <button
          onClick={() => toggleCollapse(true)}
          className="p-3 rounded-full text-slate-400 hover:text-white hover:bg-white/10 transition-all duration-300 group relative hover:scale-110 cursor-pointer"
          title={t.collapseDock || 'Minimize Dock'}
          id="collapse-dock-btn"
        >
          <ChevronDown className="w-5 h-5 transition-transform duration-300 group-hover:translate-y-0.5 text-indigo-400" />
          <span className="dock-tooltip absolute bottom-14 opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none bg-slate-950 text-white font-bold text-xs px-3 py-1.5 rounded-lg border border-white/20 whitespace-nowrap shadow-2xl z-50">
            {t.collapseDock || 'Minimize Dock'}
          </span>
        </button>

        {/* Logout Button */}
        <button
          onClick={onLogout}
          className="p-3 rounded-full text-red-400 hover:text-red-300 hover:bg-red-500/10 transition-all duration-300 group relative hover:scale-110 cursor-pointer"
          title="Exit Panel"
          id="logout-btn"
        >
          <LogOut className="w-5 h-5 transition-transform duration-300 group-hover:translate-x-0.5" />
          <span className="dock-tooltip absolute bottom-14 opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none bg-slate-950 text-white font-bold text-xs px-3 py-1.5 rounded-lg border border-white/20 whitespace-nowrap shadow-2xl z-50">
            {t.logout} ({userRole})
          </span>
        </button>
      </div>
    </div>
  );
}
