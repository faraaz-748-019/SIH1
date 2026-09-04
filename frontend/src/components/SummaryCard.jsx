import React from 'react';

export default function SummaryCard({ title, value, subtitle, icon: Icon, color = 'cyan', badge }) {
  const colorMap = {
    cyan: {
      text: 'text-cyan-400',
      bg: 'bg-cyan-500/10 border-cyan-500/30',
      glow: 'group-hover:border-cyan-500/60 group-hover:shadow-glow-cyan',
      iconBg: 'bg-cyan-500/20 text-cyan-400',
    },
    rose: {
      text: 'text-rose-400',
      bg: 'bg-rose-500/10 border-rose-500/30',
      glow: 'group-hover:border-rose-500/60 group-hover:shadow-glow-rose',
      iconBg: 'bg-rose-500/20 text-rose-400',
    },
    purple: {
      text: 'text-purple-400',
      bg: 'bg-purple-500/10 border-purple-500/30',
      glow: 'group-hover:border-purple-500/60 group-hover:shadow-glow-purple',
      iconBg: 'bg-purple-500/20 text-purple-400',
    },
    emerald: {
      text: 'text-emerald-400',
      bg: 'bg-emerald-500/10 border-emerald-500/30',
      glow: 'group-hover:border-emerald-500/60 group-hover:shadow-glow-emerald',
      iconBg: 'bg-emerald-500/20 text-emerald-400',
    },
    amber: {
      text: 'text-amber-400',
      bg: 'bg-amber-500/10 border-amber-500/30',
      glow: 'group-hover:border-amber-500/60',
      iconBg: 'bg-amber-500/20 text-amber-400',
    }
  }[color] || {
    text: 'text-cyan-400',
    bg: 'bg-cyan-500/10 border-cyan-500/30',
    glow: 'group-hover:border-cyan-500/60',
    iconBg: 'bg-cyan-500/20 text-cyan-400',
  };

  return (
    <div className={`group relative p-5 rounded-xl bg-dark-800/80 backdrop-blur-md border border-slate-700/60 transition-all duration-300 ${colorMap.glow}`}>
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1">{title}</p>
          <div className="flex items-baseline gap-2">
            <h3 className={`text-3xl font-extrabold tracking-tight ${colorMap.text}`}>
              {value}
            </h3>
            {badge && (
              <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-slate-700/60 text-slate-300 border border-slate-600/40">
                {badge}
              </span>
            )}
          </div>
          {subtitle && <p className="text-xs text-slate-400 mt-2 flex items-center gap-1.5">{subtitle}</p>}
        </div>
        {Icon && (
          <div className={`p-3 rounded-lg border ${colorMap.bg} ${colorMap.iconBg}`}>
            <Icon className="w-6 h-6" />
          </div>
        )}
      </div>
    </div>
  );
}
