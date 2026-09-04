import React from 'react';
import { 
  LayoutDashboard, 
  SearchCode, 
  Network, 
  Atom, 
  GitPullRequestDraft, 
  FileSpreadsheet, 
  Bot, 
  ShieldCheck,
  FolderGit2
} from 'lucide-react';

export default function Sidebar({ activeTab, setActiveTab, setIsChatOpen, scanSummary }) {
  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'scan', label: 'Scanner & Upload', icon: FolderGit2 },
    { id: 'findings', label: 'Crypto Findings', icon: SearchCode, count: scanSummary?.total_crypto_assets },
    { id: 'graph', label: 'Dependency Graph', icon: Network },
    { id: 'pqc', label: 'PQC Readiness', icon: Atom, badge: scanSummary ? `${scanSummary.pqc_readiness_score}%` : null },
    { id: 'migration', label: 'Migration Playbook', icon: GitPullRequestDraft },
  ];

  return (
    <aside className="w-64 bg-dark-800/95 border-r border-slate-700/60 flex flex-col justify-between shrink-0 h-screen sticky top-0 z-30">
      <div>
        {/* Brand Header */}
        <div className="p-5 border-b border-slate-700/60 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-cyan-500 to-indigo-600 flex items-center justify-center shadow-glow-cyan/40">
            <ShieldCheck className="w-6 h-6 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <h1 className="text-lg font-black tracking-wider text-white">CRYPTO<span className="text-cyan-400">SCOPE</span></h1>
            </div>
            <p className="text-[10px] uppercase font-mono tracking-widest text-slate-400">PQC Discovery & CBOM</p>
          </div>
        </div>

        {/* Scan Status Pill */}
        {scanSummary && (
          <div className="px-4 py-3 mx-3 my-3 rounded-lg bg-dark-700/60 border border-slate-700/70">
            <div className="flex items-center justify-between text-xs mb-1">
              <span className="text-slate-400 font-medium">Active Target</span>
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            </div>
            <p className="text-xs font-mono font-semibold text-slate-200 truncate">{scanSummary.scan_name}</p>
            <div className="flex items-center justify-between mt-2 pt-2 border-t border-slate-700/40 text-[11px] text-slate-400">
              <span>Assets: <strong className="text-cyan-400">{scanSummary.total_crypto_assets}</strong></span>
              <span>Crit: <strong className="text-rose-400">{scanSummary.critical_count}</strong></span>
            </div>
          </div>
        )}

        {/* Navigation Menu */}
        <nav className="p-3 space-y-1.5">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 ${
                  isActive
                    ? 'bg-gradient-to-r from-cyan-500/20 to-indigo-500/10 text-cyan-300 border border-cyan-500/40 shadow-glow-cyan/10'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon className={`w-4 h-4 ${isActive ? 'text-cyan-400' : 'text-slate-400'}`} />
                  <span>{item.label}</span>
                </div>
                {item.count !== undefined && (
                  <span className={`text-xs px-2 py-0.5 rounded-full font-mono font-semibold ${
                    isActive ? 'bg-cyan-500/20 text-cyan-300' : 'bg-slate-800 text-slate-400'
                  }`}>
                    {item.count}
                  </span>
                )}
                {item.badge && (
                  <span className="text-[11px] px-2 py-0.5 rounded-full font-mono font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Footer & AI Assistant Trigger */}
      <div className="p-4 border-t border-slate-700/60 space-y-3">
        <button
          onClick={() => setIsChatOpen(true)}
          className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white text-xs font-bold uppercase tracking-wider shadow-glow-purple/30 transition-all duration-200 active:scale-95"
        >
          <Bot className="w-4 h-4" />
          <span>Ask Crypto AI</span>
        </button>

        <div className="text-[10px] text-slate-500 text-center font-mono">
          SIH Problem 26164 • v2.4
        </div>
      </div>
    </aside>
  );
}
