/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { LucideIcon, TrendingUp, TrendingDown } from 'lucide-react';

interface MetricCardProps {
  title: string;
  value?: string | number | null;
  subtext?: string;
  icon: LucideIcon;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  glowColor?: 'cyan' | 'purple' | 'amber' | 'emerald';
  id?: string;
  onClick?: () => void;
  isLoading?: boolean;
}

export default function MetricCard({ 
  title, 
  value, 
  subtext, 
  icon: Icon, 
  trend, 
  glowColor = 'cyan',
  id,
  onClick,
  isLoading
}: MetricCardProps) {
  
  const glowClasses = {
    cyan: 'shadow-[0_0_15px_rgba(99,102,241,0.12)] border-indigo-500/25 hover:border-indigo-500/45 text-indigo-400',
    purple: 'shadow-[0_0_15px_rgba(139,92,246,0.12)] border-purple-500/25 hover:border-purple-500/45 text-purple-400',
    amber: 'shadow-[0_0_15px_rgba(245,158,11,0.12)] border-amber-500/25 hover:border-amber-500/45 text-amber-400',
    emerald: 'shadow-[0_0_15px_rgba(16,185,129,0.12)] border-emerald-500/25 hover:border-emerald-500/45 text-emerald-400',
  };

  const ambientGlowBg = {
    cyan: 'bg-indigo-500/5',
    purple: 'bg-purple-500/5',
    amber: 'bg-amber-500/5',
    emerald: 'bg-emerald-500/5'
  };

  if (isLoading || value === undefined || value === null) {
    return (
      <div 
        id={id || `metric-card-${title.toLowerCase().replace(/\s+/g, '-')}`}
        className={`spatial-glass rounded-2xl p-5 flex flex-col justify-between border ${glowClasses[glowColor]} relative overflow-hidden`}
      >
        <div className="flex items-start justify-between">
          <div className="space-y-3 w-full">
            <span className="text-xs font-medium text-slate-400 uppercase tracking-wider block">{title}</span>
            {/* Value Shimmer Box */}
            <div className="h-8 w-28 rounded-lg bg-slate-800/15 relative overflow-hidden backdrop-blur-xs border border-white/[0.03]">
              <div className="shimmer-light-beam" />
            </div>
          </div>
          <div className={`p-3 rounded-xl ${ambientGlowBg[glowColor]} border border-white/5 shrink-0`}>
            <Icon className="w-6 h-6 text-slate-500/40 animate-pulse" />
          </div>
        </div>

        <div className="mt-4 pt-4 border-t border-white/5">
          {/* Subtext Shimmer Box */}
          <div className="h-3.5 w-36 rounded bg-slate-800/15 relative overflow-hidden backdrop-blur-xs border border-white/[0.03]">
            <div className="shimmer-light-beam" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div 
      id={id || `metric-card-${title.toLowerCase().replace(/\s+/g, '-')}`}
      onClick={onClick}
      className={`spatial-glass spatial-glass-hover spatial-depth-card rounded-2xl p-5 flex flex-col justify-between transition-all duration-300 border ${glowClasses[glowColor]} ${
        onClick ? 'cursor-pointer hover:scale-[1.02] active:scale-[0.98]' : ''
      }`}
    >
      <div className="flex items-start justify-between">
        <div>
          <span className="text-xs font-medium text-slate-400 uppercase tracking-wider">{title}</span>
          <h3 className="text-3xl font-display font-bold text-white mt-2 tracking-tight glow-text-cyan">{value}</h3>
        </div>
        <div className={`p-3 rounded-xl ${ambientGlowBg[glowColor]} border border-white/5`}>
          <Icon className="w-6 h-6" />
        </div>
      </div>

      <div className="flex items-center justify-between mt-4 pt-4 border-t border-white/5">
        <span className="text-xs text-slate-400">{subtext}</span>
        {trend && (
          <div className={`flex items-center gap-1 text-xs px-2 py-0.5 rounded-full ${
            trend.isPositive ? 'text-emerald-400 bg-emerald-500/10' : 'text-red-400 bg-red-500/10'
          }`}>
            {trend.isPositive ? <TrendingUp className="w-3.5 h-3.5" /> : <TrendingDown className="w-3.5 h-3.5" />}
            <span>{trend.value}%</span>
          </div>
        )}
      </div>
    </div>
  );
}
