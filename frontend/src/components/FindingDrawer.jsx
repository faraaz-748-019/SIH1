import React from 'react';
import { 
  X, 
  ShieldAlert, 
  Code2, 
  Cpu, 
  FileCode, 
  ArrowRight, 
  Clock, 
  KeyRound, 
  CheckCircle2, 
  Layers, 
  Network,
  Share2
} from 'lucide-react';
import RiskBadge from './RiskBadge';

export default function FindingDrawer({ finding, onClose, onOpenBlastRadius, onOpenGraph }) {
  if (!finding) return null;

  const mig = finding.migration_recommendation || {};
  const mosca = finding.mosca_details || {};
  const loc = finding.location || {};

  return (
    <div className="fixed inset-0 z-50 overflow-hidden flex justify-end bg-black/60 backdrop-blur-sm transition-all duration-300">
      <div className="w-full max-w-2xl bg-dark-800 border-l border-slate-700/80 h-full overflow-y-auto flex flex-col justify-between shadow-2xl animate-in slide-in-from-right duration-300">
        
        {/* Top Header */}
        <div className="p-6 border-b border-slate-700/60 sticky top-0 bg-dark-800/95 backdrop-blur-md z-10">
          <div className="flex items-start justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <RiskBadge level={finding.criticality} size="md" />
                <span className="text-xs font-mono text-slate-400 bg-slate-800 px-2 py-0.5 rounded border border-slate-700">
                  {finding.type.toUpperCase()}
                </span>
                <span className="text-xs font-mono text-cyan-400 bg-cyan-950/40 px-2 py-0.5 rounded border border-cyan-800/50">
                  Score: {finding.risk_score}/100
                </span>
              </div>
              <h3 className="text-xl font-bold text-white tracking-wide font-mono">
                {finding.algorithm}
              </h3>
              <p className="text-xs text-slate-400 mt-1 flex items-center gap-1.5 font-mono">
                <FileCode className="w-3.5 h-3.5 text-slate-500" />
                {loc.file}:{loc.line}
              </p>
            </div>
            <button
              onClick={onClose}
              className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-700/60 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content Body */}
        <div className="p-6 space-y-6">
          
          {/* Quick Action Buttons */}
          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={() => onOpenBlastRadius(finding)}
              className="flex items-center justify-center gap-2 py-2.5 px-4 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/30 text-rose-300 text-xs font-semibold transition-all"
            >
              <Share2 className="w-4 h-4" />
              <span>Inspect Blast Radius</span>
            </button>
            <button
              onClick={() => onOpenGraph(finding)}
              className="flex items-center justify-center gap-2 py-2.5 px-4 rounded-lg bg-cyan-500/10 hover:bg-cyan-500/20 border border-cyan-500/30 text-cyan-300 text-xs font-semibold transition-all"
            >
              <Network className="w-4 h-4" />
              <span>Locate in Dependency Graph</span>
            </button>
          </div>

          {/* Code Snippet Evidence */}
          <div className="space-y-2">
            <label className="text-xs font-semibold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
              <Code2 className="w-3.5 h-3.5 text-cyan-400" />
              Code Evidence & Location
            </label>
            <div className="p-4 rounded-lg bg-dark-900 border border-slate-800 font-mono text-xs text-cyan-200 overflow-x-auto leading-relaxed">
              <div className="text-[10px] text-slate-500 mb-1">// {loc.file} (Line {loc.line})</div>
              <code>{loc.snippet || finding.algorithm}</code>
            </div>
          </div>

          {/* Risk Factors */}
          <div className="space-y-2">
            <label className="text-xs font-semibold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
              <ShieldAlert className="w-3.5 h-3.5 text-rose-400" />
              Risk Factors & Explanations
            </label>
            <div className="space-y-2">
              {finding.risk_reasons?.map((reason, idx) => (
                <div key={idx} className="p-3 rounded-lg bg-dark-700/40 border border-slate-700/50 text-xs text-slate-300 flex items-start gap-2.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-rose-400 mt-1.5 shrink-0"></span>
                  <span>{reason}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Mosca's Theorem Status */}
          <div className="p-4 rounded-xl bg-gradient-to-br from-dark-700/80 to-dark-800 border border-slate-700/70 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-wider text-purple-300 flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-purple-400" />
                Mosca's Theorem Timeline (PQC)
              </span>
              <span className={`text-xs font-mono font-bold px-2 py-0.5 rounded ${
                finding.mosca_status === 'URGENT' ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40' : 'bg-emerald-500/20 text-emerald-300'
              }`}>
                {finding.mosca_status}
              </span>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed">
              {mosca.message || finding.pqc_reason}
            </p>

            <div className="grid grid-cols-3 gap-2 pt-2 border-t border-slate-700/50 text-center">
              <div className="p-2 rounded bg-dark-900/60">
                <p className="text-[10px] text-slate-400">Data Life (X)</p>
                <p className="text-sm font-bold text-white">{mosca.data_shelf_life_years || 10} yrs</p>
              </div>
              <div className="p-2 rounded bg-dark-900/60">
                <p className="text-[10px] text-slate-400">Migration (Y)</p>
                <p className="text-sm font-bold text-white">{mosca.migration_time_years || 4} yrs</p>
              </div>
              <div className="p-2 rounded bg-dark-900/60">
                <p className="text-[10px] text-slate-400">Q-Day (Z)</p>
                <p className="text-sm font-bold text-cyan-400">~{mosca.quantum_threat_years || 7} yrs</p>
              </div>
            </div>
          </div>

          {/* Recommended PQC Migration */}
          {mig.recommended_pqc && (
            <div className="p-4 rounded-xl bg-gradient-to-br from-cyan-950/30 to-indigo-950/30 border border-cyan-500/30 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold uppercase tracking-wider text-cyan-400 flex items-center gap-1.5">
                  <KeyRound className="w-3.5 h-3.5 text-cyan-400" />
                  Recommended PQC Replacement
                </span>
                <span className="text-[11px] font-mono text-cyan-300 bg-cyan-900/40 px-2 py-0.5 rounded">
                  {mig.nist_status}
                </span>
              </div>

              <div className="flex items-center gap-2 text-sm font-mono font-bold text-white bg-dark-900/80 p-3 rounded-lg border border-slate-700">
                <span className="text-rose-400 line-through">{finding.algorithm}</span>
                <ArrowRight className="w-4 h-4 text-cyan-400" />
                <span className="text-emerald-400">{mig.recommended_pqc}</span>
              </div>

              <p className="text-xs text-slate-300">{mig.rationale}</p>

              <div className="grid grid-cols-2 gap-2 text-xs pt-2">
                <div className="p-2 rounded bg-dark-900/50 border border-slate-800">
                  <span className="text-[10px] text-slate-400 block">Security Gain:</span>
                  <span className="text-slate-200 font-medium">{mig.security_gain}</span>
                </div>
                <div className="p-2 rounded bg-dark-900/50 border border-slate-800">
                  <span className="text-[10px] text-slate-400 block">Latency Tradeoff:</span>
                  <span className="text-slate-200 font-medium">{mig.latency_tradeoff}</span>
                </div>
              </div>

              {/* Phased Migration Checklist */}
              {mig.phased_steps && (
                <div className="pt-2 space-y-1.5">
                  <span className="text-[11px] font-semibold text-slate-400 block">Phased Migration Checklist:</span>
                  {mig.phased_steps.map((step, sIdx) => (
                    <div key={sIdx} className="flex items-start gap-2 text-xs text-slate-300">
                      <CheckCircle2 className="w-3.5 h-3.5 text-cyan-400 shrink-0 mt-0.5" />
                      <span>{step}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

        </div>

        {/* Drawer Footer */}
        <div className="p-4 border-t border-slate-700/60 bg-dark-900/80 text-right">
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-lg bg-slate-700 hover:bg-slate-600 text-white text-xs font-semibold transition-all"
          >
            Close Details
          </button>
        </div>

      </div>
    </div>
  );
}
