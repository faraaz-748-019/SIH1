import React from 'react';
import { Download, RefreshCw, Sparkles, FileText, FileCode2, ExternalLink } from 'lucide-react';
import { getReportDownloadUrl } from '../services/api';

export default function Header({ 
  scanSummary, 
  onRefreshDemo, 
  loading, 
  setIsChatOpen,
  activeTab
}) {
  const scanId = scanSummary?.scan_id;

  const tabTitles = {
    dashboard: 'Security & PQC Executive Dashboard',
    scan: 'Cryptographic Codebase Scanner',
    findings: 'Cryptographic Bill of Materials (CBOM)',
    graph: 'Multi-Tier Cryptographic Dependency Graph',
    pqc: 'Post-Quantum Cryptography (PQC) Readiness',
    migration: 'NIST PQC Migration Roadmap & Playbook',
  };

  return (
    <header className="h-16 px-6 bg-dark-800/80 backdrop-blur-md border-b border-slate-700/60 flex items-center justify-between sticky top-0 z-20">
      <div className="flex items-center gap-3">
        <h2 className="text-base font-bold text-white tracking-wide">
          {tabTitles[activeTab] || 'CRYPTOSCOPE'}
        </h2>
        {scanSummary && (
          <span className="hidden md:inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-mono bg-cyan-500/10 text-cyan-300 border border-cyan-500/30">
            <span className="w-1.5 h-1.5 rounded-full bg-cyan-400"></span>
            {scanSummary.scan_name}
          </span>
        )}
      </div>

      <div className="flex items-center gap-2.5">
        {/* Run Demo button */}
        <button
          onClick={onRefreshDemo}
          disabled={loading}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-dark-700/80 hover:bg-dark-600 border border-slate-600/50 text-slate-200 text-xs font-medium transition-all duration-150 disabled:opacity-50 active:scale-95"
          title="Reload synthetic sample dataset"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin text-cyan-400' : 'text-slate-400'}`} />
          <span className="hidden sm:inline">Load Demo Data</span>
        </button>

        {/* Download Reports */}
        {scanId && (
          <div className="flex items-center gap-1 bg-dark-700/60 p-1 rounded-lg border border-slate-700/60">
            <a
              href={getReportDownloadUrl(scanId, 'pdf')}
              download
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-xs text-slate-200 font-medium transition-all"
              title="Download PDF Report"
            >
              <FileText className="w-3.5 h-3.5 text-rose-400" />
              <span>PDF</span>
            </a>
            <a
              href={getReportDownloadUrl(scanId, 'json')}
              download
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-xs text-slate-200 font-medium transition-all"
              title="Download CBOM JSON Report"
            >
              <FileCode2 className="w-3.5 h-3.5 text-cyan-400" />
              <span>CBOM JSON</span>
            </a>
          </div>
        )}

        {/* AI Assistant Quick Pill */}
        <button
          onClick={() => setIsChatOpen(true)}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-600/20 hover:bg-indigo-600/30 border border-indigo-500/40 text-indigo-300 text-xs font-semibold shadow-glow-purple/20 transition-all duration-150 active:scale-95"
        >
          <Sparkles className="w-3.5 h-3.5 text-indigo-400 animate-pulse" />
          <span>AI Insight</span>
        </button>
      </div>
    </header>
  );
}
