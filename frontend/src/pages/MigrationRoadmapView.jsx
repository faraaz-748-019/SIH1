import React, { useState } from 'react';
import { 
  GitPullRequestDraft, 
  ArrowRight, 
  CheckSquare, 
  Square, 
  ShieldCheck, 
  Clock, 
  DollarSign, 
  Zap, 
  FileCode, 
  Layers,
  Sparkles,
  CheckCircle2
} from 'lucide-react';
import RiskBadge from '../components/RiskBadge';

export default function MigrationRoadmapView({ findings = [], onSelectFinding, onOpenGraphWithFinding }) {
  // State for interactive checklist checkboxes
  const [completedSteps, setCompletedSteps] = useState({});

  const toggleStep = (key) => {
    setCompletedSteps(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  const riskyFindings = findings.filter(f => 
    ['critical', 'high', 'medium'].includes(f.criticality) && f.migration_recommendation
  );

  return (
    <div className="p-8 space-y-8 max-w-7xl mx-auto">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black text-white tracking-wide flex items-center gap-2.5">
            <GitPullRequestDraft className="w-7 h-7 text-cyan-400" />
            <span>PQC Migration Playbook & Remediation Roadmap</span>
          </h2>
          <p className="text-sm text-slate-400 mt-1">
            Engineered transition roadmaps for vulnerable ciphers replacing legacy algorithms with NIST Post-Quantum standards.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <span className="text-xs font-mono px-3 py-1.5 rounded-lg bg-dark-800 border border-slate-700 text-slate-300">
            <strong>{riskyFindings.length}</strong> Migration Items
          </span>
        </div>
      </div>

      {/* Migration Cards List */}
      <div className="space-y-6">
        {riskyFindings.map((item, idx) => {
          const mig = item.migration_recommendation || {};
          const loc = item.location || {};

          return (
            <div 
              key={item.asset_id}
              className="p-6 rounded-2xl bg-dark-800/90 border border-slate-700/70 glass-panel space-y-5 transition-all hover:border-cyan-500/40"
            >
              {/* Card Header */}
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 border-b border-slate-700/60 pb-4">
                <div className="flex items-center gap-3">
                  <span className="w-8 h-8 rounded-lg bg-cyan-500/20 border border-cyan-500/40 text-cyan-300 font-mono font-bold flex items-center justify-center text-xs">
                    #{idx + 1}
                  </span>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-mono uppercase text-slate-400">{mig.category}</span>
                      <RiskBadge level={item.criticality} size="sm" />
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-dark-900 text-purple-300 border border-purple-800/40">
                        {mig.nist_status}
                      </span>
                    </div>
                    <h3 className="text-lg font-bold text-white font-mono mt-0.5">
                      {item.algorithm} in {loc.file}:{loc.line}
                    </h3>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => onSelectFinding(item)}
                    className="px-3 py-1.5 rounded-lg bg-dark-700 hover:bg-dark-600 border border-slate-600 text-xs text-slate-200 font-medium transition-all"
                  >
                    View Code Evidence
                  </button>
                  <button
                    onClick={() => onOpenGraphWithFinding(item)}
                    className="px-3 py-1.5 rounded-lg bg-cyan-600/20 hover:bg-cyan-600/30 border border-cyan-500/40 text-cyan-300 text-xs font-semibold transition-all"
                  >
                    Locate in Graph
                  </button>
                </div>
              </div>

              {/* Before vs After Swap Visual */}
              <div className="p-4 rounded-xl bg-dark-900/90 border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4 font-mono">
                <div className="flex items-center gap-2">
                  <span className="text-xs text-slate-400">Current Primitive:</span>
                  <span className="px-2.5 py-1 rounded bg-rose-500/20 border border-rose-500/40 text-rose-300 text-xs font-bold line-through">
                    {item.algorithm}
                  </span>
                </div>

                <ArrowRight className="w-5 h-5 text-cyan-400 hidden sm:block shrink-0" />

                <div className="flex items-center gap-2">
                  <span className="text-xs text-slate-400">Recommended PQC:</span>
                  <span className="px-3 py-1 rounded bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-xs font-bold glow-text-emerald">
                    {mig.recommended_pqc}
                  </span>
                </div>

                {mig.hybrid_alternative && (
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-slate-400">Hybrid Transition:</span>
                    <span className="px-2 py-0.5 rounded bg-amber-500/20 border border-amber-500/30 text-amber-300 text-xs">
                      {mig.hybrid_alternative}
                    </span>
                  </div>
                )}
              </div>

              {/* Technical Rationale & Tradeoffs */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
                <div className="p-3 rounded-xl bg-dark-700/40 border border-slate-700/50">
                  <div className="flex items-center gap-1.5 font-semibold text-cyan-400 mb-1">
                    <ShieldCheck className="w-4 h-4" />
                    <span>Security Gain</span>
                  </div>
                  <p className="text-slate-300 text-[11px]">{mig.security_gain}</p>
                </div>

                <div className="p-3 rounded-xl bg-dark-700/40 border border-slate-700/50">
                  <div className="flex items-center gap-1.5 font-semibold text-purple-400 mb-1">
                    <Zap className="w-4 h-4" />
                    <span>Latency Overhead</span>
                  </div>
                  <p className="text-slate-300 text-[11px]">{mig.latency_tradeoff}</p>
                </div>

                <div className="p-3 rounded-xl bg-dark-700/40 border border-slate-700/50">
                  <div className="flex items-center gap-1.5 font-semibold text-emerald-400 mb-1">
                    <DollarSign className="w-4 h-4" />
                    <span>Cost Impact</span>
                  </div>
                  <p className="text-slate-300 text-[11px]">{mig.cost_impact}</p>
                </div>
              </div>

              {/* Phased Migration Interactive Checklist */}
              {mig.phased_steps && (
                <div className="space-y-2 pt-1">
                  <span className="text-xs font-semibold uppercase tracking-wider text-slate-400 block">
                    Execution Steps & Verification Checklist:
                  </span>
                  <div className="space-y-1.5">
                    {mig.phased_steps.map((step, sIdx) => {
                      const stepKey = `${item.asset_id}-${sIdx}`;
                      const isDone = !!completedSteps[stepKey];

                      return (
                        <div 
                          key={sIdx}
                          onClick={() => toggleStep(stepKey)}
                          className={`p-2.5 rounded-lg border text-xs flex items-start gap-3 cursor-pointer transition-all ${
                            isDone 
                              ? 'bg-emerald-950/20 border-emerald-500/30 text-slate-400 line-through' 
                              : 'bg-dark-900/60 border-slate-800 text-slate-200 hover:border-slate-600'
                          }`}
                        >
                          {isDone ? (
                            <CheckSquare className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                          ) : (
                            <Square className="w-4 h-4 text-slate-500 shrink-0 mt-0.5" />
                          )}
                          <span className="leading-relaxed">{step}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

            </div>
          );
        })}
      </div>

    </div>
  );
}
