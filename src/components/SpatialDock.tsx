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
  LogOut 
} from 'lucide-react';

interface SpatialDockProps {
  activeView: string;
  onViewChange: (view: string) => void;
  onLogout: () => void;
  userRole: string;
}

export default function SpatialDock({ activeView, onViewChange, onLogout, userRole }: SpatialDockProps) {
  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, color: 'text-indigo-400' },
    { id: 'config', label: 'Homeserver', icon: Settings, color: 'text-purple-400' },
    { id: 'video', label: 'Media & Call', icon: Video, color: 'text-amber-400' },
    { id: 'security', label: 'Security & Auth', icon: ShieldCheck, color: 'text-emerald-400' },
    { id: 'backups', label: 'Archiving', icon: Database, color: 'text-blue-400' },
    { id: 'terminal', label: 'Web Console', icon: Terminal, color: 'text-rose-400' },
    { id: 'reporting', label: 'Analytics', icon: BarChart3, color: 'text-indigo-400' },
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
            Logout ({userRole})
          </span>
        </button>
      </div>
    </div>
  );
}
