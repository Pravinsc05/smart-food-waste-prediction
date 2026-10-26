import React from 'react';
import { HelpCircle } from 'lucide-react';

export default function StatCard({ 
  title, 
  value, 
  unit = '', 
  subtitle, 
  icon: Icon, 
  color = 'emerald', 
  trend,
  tooltip
}) {
  const colorMap = {
    emerald: {
      border: 'border-emerald-500/20 hover:border-emerald-500/40',
      iconBg: 'bg-emerald-500/15 text-emerald-400',
      glow: 'shadow-emerald-950/20'
    },
    amber: {
      border: 'border-amber-500/20 hover:border-amber-500/40',
      iconBg: 'bg-amber-500/15 text-amber-400',
      glow: 'shadow-amber-950/20'
    },
    rose: {
      border: 'border-rose-500/20 hover:border-rose-500/40',
      iconBg: 'bg-rose-500/15 text-rose-400',
      glow: 'shadow-rose-950/20'
    },
    blue: {
      border: 'border-blue-500/20 hover:border-blue-500/40',
      iconBg: 'bg-blue-500/15 text-blue-400',
      glow: 'shadow-blue-950/20'
    },
    purple: {
      border: 'border-purple-500/20 hover:border-purple-500/40',
      iconBg: 'bg-purple-500/15 text-purple-400',
      glow: 'shadow-purple-950/20'
    }
  };

  const scheme = colorMap[color] || colorMap.emerald;

  return (
    <div className={`glass-card p-5 rounded-2xl border transition-all duration-300 hover:shadow-xl ${scheme.border} ${scheme.glow} relative group`}>
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center gap-1.5 text-slate-400 text-xs font-semibold uppercase tracking-wider mb-1">
            <span>{title}</span>
            {tooltip && (
              <div className="relative group/tooltip inline-block cursor-help">
                <HelpCircle className="w-3.5 h-3.5 text-slate-500 hover:text-slate-300" />
                <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 hidden group-hover/tooltip:block z-30 w-48 p-2 text-xs font-normal text-slate-200 bg-slate-900 border border-slate-700 rounded-lg shadow-xl pointer-events-none">
                  {tooltip}
                </div>
              </div>
            )}
          </div>
          
          <div className="flex items-baseline gap-1 mt-2">
            <span className="text-3xl font-extrabold text-white tracking-tight">
              {value}
            </span>
            {unit && <span className="text-sm font-medium text-slate-400">{unit}</span>}
          </div>
        </div>

        {Icon && (
          <div className={`p-3 rounded-xl ${scheme.iconBg} ring-1 ring-white/10 shrink-0`}>
            <Icon className="w-6 h-6" />
          </div>
        )}
      </div>

      {(subtitle || trend) && (
        <div className="mt-3 pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-400">
          <span>{subtitle}</span>
          {trend && (
            <span className={`font-semibold ${trend.positive ? 'text-emerald-400' : 'text-rose-400'}`}>
              {trend.text}
            </span>
          )}
        </div>
      )}
    </div>
  );
}
