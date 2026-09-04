import React from 'react';
import { 
  ShieldAlert, 
  Atom, 
  FileCode2, 
  Activity, 
  ArrowUpRight, 
  AlertTriangle, 
  Zap, 
  Layers, 
  Sparkles,
  Share2,
  FolderGit2
} from 'lucide-react';
import { 
  ResponsiveContainer, 
  PieChart, 
  Pie, 
  Cell, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  Tooltip 
} from 'recharts';
import SummaryCard from '../components/SummaryCard';
import RiskBadge from '../components/RiskBadge';

export default function Dashboard({ 
  scanSummary, 
  findings = [], 
  onSelectFinding, 
  onSelectBlastFinding,
  setActiveTab,
  onRunDemo,
  loading 
}) {
  if (!scanSummary) {
    return (
      <div className="p-8 max-w-5xl mx-auto text-center space-y-6">
        <div className="p-12 rounded-2xl bg-dark-800/60 border border-slate-700/60 glass-panel">
          <ShieldAlert className="w-16 h-16 text-cyan-400 mx-auto mb-4 animate-pulse" />
          <h2 className="text-2xl font-bold text-white mb-2">No Active Cryptographic Scan</h2>
          <p className="text-slate-400 max-w-md mx-auto text-sm mb-6">
            Run an instant discovery scan on your codebase or load the seeded demo enterprise dataset to evaluate quantum risk and PQC readiness.
          </p>
          <div className="flex items-center justify-center gap-4">
            <button
              onClick={onRunDemo}
              disabled={loading}
              className="px-6 py-3 rounded-xl bg-gradient-to-r from-cyan-500 to-indigo-600 hover:from-cyan-400 hover:to-indigo-500 text-white font-bold text-sm shadow-glow-cyan/30 transition-all active:scale-95"
            >
              {loading ? "Scanning Codebase..." : "Load Demo Enterprise Repo"}
            </button>
            <button
              onClick={() => setActiveTab('scan')}
              className="px-6 py-3 rounded-xl bg-dark-700 hover:bg-dark-600 border border-slate-600 text-slate-200 font-semibold text-sm transition-all"
            >
              Upload Codebase / Git URL
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Risk Distribution Data for Pie Chart
  const riskPieData = [
    { name: 'Critical', value: scanSummary.critical_count || 0, color: '#F43F5E' },
    { name: 'High', value: scanSummary.high_count || 0, color: '#F97316' },
    { name: 'Medium', value: scanSummary.medium_count || 0, color: '#EAB308' },
    { name: 'Safe / Low', value: (scanSummary.low_count || 0) + (scanSummary.safe_count || 0), color: '#10B981' },
  ].filter(d => d.value > 0);

  // PQC Classification Data for Bar Chart
  const pqcBreakdown = scanSummary.pqc_breakdown || {};
  const pqcBarData = [
    { name: 'Vulnerable', count: pqcBreakdown['quantum-vulnerable'] || 0, fill: '#F43F5E' },
    { name: 'Hybrid', count: pqcBreakdown['hybrid-recommended'] || 0, fill: '#EAB308' },
    { name: 'Quantum Safe', count: pqcBreakdown['quantum-safe'] || 0, fill: '#10B981' },
  ];

  return (
    <div className="p-8 space-y-8 max-w-7xl mx-auto">
      
      {/* Top Banner Alert if Critical Mosca Breaches exist */}
      {scanSummary.critical_count > 0 && (
        <div className="p-4 rounded-xl bg-gradient-to-r from-rose-950/60 via-dark-800 to-dark-800 border border-rose-500/40 flex items-center justify-between shadow-glow-rose/20">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-lg bg-rose-500/20 text-rose-400">
              <AlertTriangle className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-white flex items-center gap-2">
                <span>{scanSummary.critical_count} Critical Quantum & Classical Vulnerabilities Detected</span>
                <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded bg-rose-500/30 text-rose-200 border border-rose-500/40">Mosca Threat</span>
              </h4>
              <p className="text-xs text-slate-300">
                Data shelf-life ({10} yrs) + Migration timeline ({4} yrs) exceeds estimated Q-Day timeline (~{7} yrs). Immediate PQC transition required to combat Harvest-Now-Decrypt-Later exploits.
              </p>
            </div>
          </div>
          <button
            onClick={() => setActiveTab('migration')}
            className="px-4 py-2 rounded-lg bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold shrink-0 transition-all shadow-glow-rose/20 active:scale-95"
          >
            View PQC Roadmap
          </button>
        </div>
      )}

      {/* KPI Metric Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <SummaryCard
          title="Total Crypto Assets"
          value={scanSummary.total_crypto_assets}
          subtitle={`Across ${scanSummary.total_files_scanned} analyzed files`}
          icon={FileCode2}
          color="cyan"
          badge="CBOM"
        />
        <SummaryCard
          title="Critical Risks"
          value={scanSummary.critical_count}
          subtitle="Immediate breach / quantum threat"
          icon={ShieldAlert}
          color="rose"
          badge="Action Required"
        />
        <SummaryCard
          title="PQC Readiness Score"
          value={`${scanSummary.pqc_readiness_score}%`}
          subtitle="NIST post-quantum compliance"
          icon={Atom}
          color={scanSummary.pqc_readiness_score > 60 ? "emerald" : "purple"}
          badge="NIST FIPS 203/204"
        />
        <SummaryCard
          title="Target Environment"
          value={scanSummary.target_type.toUpperCase()}
          subtitle={scanSummary.scan_name}
          icon={Activity}
          color="amber"
          badge="Active"
        />
      </div>

      {/* Interactive Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Risk Distribution Donut Chart */}
        <div className="p-6 rounded-2xl bg-dark-800/80 border border-slate-700/60 glass-panel space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
              <ShieldAlert className="w-4 h-4 text-cyan-400" />
              Cryptographic Risk Distribution
            </h3>
            <span className="text-xs text-slate-400">Total: {scanSummary.total_crypto_assets} Findings</span>
          </div>

          <div className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={riskPieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={55}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {riskPieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} stroke="#070B14" strokeWidth={2} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ backgroundColor: '#0D1424', borderColor: '#334155', borderRadius: '8px', fontSize: '12px', color: '#fff' }}
                  itemStyle={{ color: '#fff' }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2 border-t border-slate-700/50">
            {riskPieData.map((item, i) => (
              <div key={i} className="text-center p-2 rounded-lg bg-dark-900/50">
                <span className="text-[10px] text-slate-400 uppercase">{item.name}</span>
                <p className="text-sm font-bold" style={{ color: item.color }}>{item.value}</p>
              </div>
            ))}
          </div>
        </div>

        {/* PQC Quantum Posture Bar Chart */}
        <div className="p-6 rounded-2xl bg-dark-800/80 border border-slate-700/60 glass-panel space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
              <Atom className="w-4 h-4 text-purple-400" />
              Post-Quantum Classification
            </h3>
            <span className="text-xs font-mono text-cyan-400">{scanSummary.pqc_readiness_score}% Quantum-Safe</span>
          </div>

          <div className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={pqcBarData} layout="vertical">
                <XAxis type="number" stroke="#64748B" fontSize={11} />
                <YAxis dataKey="name" type="category" stroke="#94A3B8" fontSize={11} width={90} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#0D1424', borderColor: '#334155', borderRadius: '8px', fontSize: '12px' }}
                />
                <Bar dataKey="count" radius={[0, 6, 6, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="flex items-center justify-between p-3 rounded-lg bg-purple-950/20 border border-purple-500/20 text-xs text-purple-200">
            <span>Shor & Grover Attack Susceptible:</span>
            <strong className="font-mono text-rose-400">{pqcBreakdown['quantum-vulnerable'] || 0} Assets</strong>
          </div>
        </div>

      </div>

      {/* Top Risky Cryptographic Assets Table */}
      <div className="p-6 rounded-2xl bg-dark-800/80 border border-slate-700/60 glass-panel space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Zap className="w-4 h-4 text-amber-400" />
              High-Risk Cryptographic Assets Requiring Remediation
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">Click any asset to inspect code evidence or calculate blast radius</p>
          </div>
          <button
            onClick={() => setActiveTab('findings')}
            className="text-xs font-semibold text-cyan-400 hover:text-cyan-300 flex items-center gap-1"
          >
            View All ({findings.length}) <ArrowUpRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-slate-700/70 text-slate-400 uppercase tracking-wider text-[10px]">
                <th className="py-3 px-4">Algorithm / Asset</th>
                <th className="py-3 px-4">Criticality</th>
                <th className="py-3 px-4">Location</th>
                <th className="py-3 px-4">PQC Status</th>
                <th className="py-3 px-4">Recommended Migration</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-700/40">
              {findings
                .filter(f => ['critical', 'high', 'medium'].includes(f.criticality))
                .slice(0, 6)
                .map((item) => (
                  <tr 
                    key={item.asset_id}
                    className="hover:bg-slate-800/60 transition-colors group cursor-pointer"
                    onClick={() => onSelectFinding(item)}
                  >
                    <td className="py-3.5 px-4 font-mono font-bold text-white flex items-center gap-2">
                      <span className="text-cyan-300">{item.algorithm}</span>
                      {item.key_size && (
                        <span className="text-[10px] px-1.5 py-0.5 rounded bg-dark-900 text-slate-400 border border-slate-700">
                          {item.key_size}-bit
                        </span>
                      )}
                    </td>
                    <td className="py-3.5 px-4">
                      <RiskBadge level={item.criticality} size="sm" />
                    </td>
                    <td className="py-3.5 px-4 font-mono text-slate-300">
                      {item.location.file}:{item.location.line}
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="text-purple-300 font-mono text-[11px] bg-purple-950/30 px-2 py-0.5 rounded border border-purple-800/40">
                        {item.pqc_classification}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-emerald-300 font-mono">
                      {item.migration_recommendation?.recommended_pqc || 'AES-256-GCM'}
                    </td>
                    <td className="py-3.5 px-4 text-right" onClick={(e) => e.stopPropagation()}>
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => onSelectBlastFinding(item)}
                          className="px-2.5 py-1 rounded bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/30 text-rose-300 text-[11px] font-semibold flex items-center gap-1"
                          title="Calculate Blast Radius"
                        >
                          <Share2 className="w-3 h-3" />
                          <span>Blast Radius</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
}
