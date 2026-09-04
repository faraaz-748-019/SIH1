import React from 'react';
import { AlertOctagon, AlertTriangle, AlertCircle, CheckCircle2, ShieldAlert } from 'lucide-react';

export default function RiskBadge({ level = 'medium', size = 'md' }) {
  const norm = level ? level.toLowerCase() : 'low';

  const styles = {
    critical: {
      bg: 'bg-rose-500/15 border-rose-500/40 text-rose-300',
      icon: AlertOctagon,
      label: 'CRITICAL'
    },
    high: {
      bg: 'bg-amber-500/15 border-amber-500/40 text-amber-300',
      icon: AlertTriangle,
      label: 'HIGH'
    },
    medium: {
      bg: 'bg-yellow-500/15 border-yellow-500/40 text-yellow-300',
      icon: AlertCircle,
      label: 'MEDIUM'
    },
    low: {
      bg: 'bg-cyan-500/15 border-cyan-500/40 text-cyan-300',
      icon: ShieldAlert,
      label: 'LOW'
    },
    safe: {
      bg: 'bg-emerald-500/15 border-emerald-500/40 text-emerald-300',
      icon: CheckCircle2,
      label: 'QUANTUM-SAFE'
    }
  }[norm] || {
    bg: 'bg-slate-500/15 border-slate-500/40 text-slate-300',
    icon: ShieldAlert,
    label: norm.toUpperCase()
  };

  const Icon = styles.icon;
  const sizeClasses = size === 'sm' 
    ? 'px-2 py-0.5 text-xs gap-1' 
    : size === 'lg' 
    ? 'px-3.5 py-1.5 text-sm gap-2 font-semibold' 
    : 'px-2.5 py-1 text-xs gap-1.5 font-medium';

  return (
    <span className={`inline-flex items-center rounded-full border backdrop-blur-sm ${styles.bg} ${sizeClasses}`}>
      <Icon className={size === 'sm' ? 'w-3 h-3' : 'w-3.5 h-3.5'} />
      <span>{styles.label}</span>
    </span>
  );
}
