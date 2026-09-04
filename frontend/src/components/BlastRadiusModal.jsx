import React from 'react';
import { X, AlertTriangle, Layers, FileCode, Server, Share2, ArrowRight } from 'lucide-react';
import RiskBadge from './RiskBadge';

export default function BlastRadiusModal({ finding, onClose, onNavigateGraph }) {
  if (!finding) return null;

  const br = finding.blast_radius || {};
  const affectedFiles = br.affected_files || [finding.location.file];
  const affectedServices = br.affected_services || ['Core Enterprise Service'];

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-4 bg-black/70 backdrop-blur-md animate-in fade-in duration-200">
      <div className="w-full max-w-2xl bg-dark-800 border border-slate-700/80 rounded-2xl shadow-2xl overflow-hidden">
        
        {/* Header */}
        <div className="p-6 bg-gradient-to-r from-rose-950/40 via-dark-800 to-dark-800 border-b border-slate-700/60 flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-rose-500/20 border border-rose-500/40 flex items-center justify-center text-rose-400">
              <Share2 className="w-6 h-6 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-mono uppercase tracking-widest text-rose-400 font-semibold">Blast Radius Analysis</span>
                <RiskBadge level={finding.criticality} size="sm" />
              </div>
              <h3 className="text-xl font-black text-white font-mono">{finding.algorithm}</h3>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-700 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-6">

          {/* Impact Summary Alert Box */}
          <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/30 flex items-start gap-3.5">
            <AlertTriangle className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-rose-300 mb-1">Plain-English Impact Assessment</h4>
              <p className="text-xs text-slate-200 leading-relaxed font-sans">
                {br.impact_summary || `Modifying or sunsetting ${finding.algorithm} will impact downstream consumers across services.`}
              </p>
            </div>
          </div>

          {/* Impact Metric Counters */}
          <div className="grid grid-cols-3 gap-3">
            <div className="p-4 rounded-xl bg-dark-900 border border-slate-800 text-center">
              <Server className="w-5 h-5 text-purple-400 mx-auto mb-1.5" />
              <p className="text-2xl font-black text-white">{br.affected_service_count || affectedServices.length}</p>
              <p className="text-[11px] uppercase tracking-wider text-slate-400">Services Affected</p>
            </div>

            <div className="p-4 rounded-xl bg-dark-900 border border-slate-800 text-center">
              <FileCode className="w-5 h-5 text-cyan-400 mx-auto mb-1.5" />
              <p className="text-2xl font-black text-white">{br.affected_file_count || affectedFiles.length}</p>
              <p className="text-[11px] uppercase tracking-wider text-slate-400">Files Impacted</p>
            </div>

            <div className="p-4 rounded-xl bg-dark-900 border border-slate-800 text-center">
              <Layers className="w-5 h-5 text-amber-400 mx-auto mb-1.5" />
              <p className="text-2xl font-black text-white">{br.affected_library_count || 1}</p>
              <p className="text-[11px] uppercase tracking-wider text-slate-400">Libraries Bound</p>
            </div>
          </div>

          {/* Affected Services List */}
          <div className="space-y-2">
            <label className="text-xs font-semibold uppercase tracking-wider text-slate-400 block">
              Directly Impacted Microservices / Modules:
            </label>
            <div className="flex flex-wrap gap-2">
              {affectedServices.map((svc, i) => (
                <span key={i} className="px-3 py-1 rounded-lg bg-dark-700/80 border border-slate-600 text-xs font-medium text-purple-200">
                  {svc}
                </span>
              ))}
            </div>
          </div>

          {/* Affected Files List */}
          <div className="space-y-2">
            <label className="text-xs font-semibold uppercase tracking-wider text-slate-400 block">
              Dependent Source Files:
            </label>
            <div className="max-h-40 overflow-y-auto rounded-lg bg-dark-900 border border-slate-800 p-2 space-y-1">
              {affectedFiles.map((file, idx) => (
                <div key={idx} className="flex items-center gap-2 p-1.5 rounded text-xs font-mono text-cyan-300 hover:bg-slate-800">
                  <FileCode className="w-3.5 h-3.5 text-slate-500" />
                  <span>{file}</span>
                </div>
              ))}
            </div>
          </div>

        </div>

        {/* Footer */}
        <div className="p-4 bg-dark-900/90 border-t border-slate-700/60 flex items-center justify-between">
          <button
            onClick={() => {
              onClose();
              if (onNavigateGraph) onNavigateGraph(finding);
            }}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-semibold transition-all shadow-glow-cyan/20"
          >
            <span>View Cascading Path in Graph</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg bg-slate-700 hover:bg-slate-600 text-slate-200 text-xs font-semibold transition-all"
          >
            Close
          </button>
        </div>

      </div>
    </div>
  );
}
