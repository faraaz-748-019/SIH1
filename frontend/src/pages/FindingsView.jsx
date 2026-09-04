import React, { useState, useMemo } from 'react';
import { 
  Search, 
  Filter, 
  Share2, 
  Code2, 
  FileCode, 
  ShieldAlert, 
  KeyRound, 
  ArrowUpDown, 
  ExternalLink,
  Download
} from 'lucide-react';
import RiskBadge from '../components/RiskBadge';

export default function FindingsView({ 
  findings = [], 
  onSelectFinding, 
  onSelectBlastFinding,
  onOpenGraphWithFinding 
}) {
  const [search, setSearch] = useState('');
  const [criticalityFilter, setCriticalityFilter] = useState('all');
  const [pqcFilter, setPqcFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');
  const [sortField, setSortField] = useState('risk_score');
  const [sortAsc, setSortAsc] = useState(false);

  const filteredFindings = useMemo(() => {
    return findings.filter((f) => {
      // Search matches algo, file, library, snippet
      const q = search.toLowerCase();
      const matchSearch = !q || 
        f.algorithm.toLowerCase().includes(q) ||
        f.location.file.toLowerCase().includes(q) ||
        f.library.toLowerCase().includes(q) ||
        (f.location.snippet && f.location.snippet.toLowerCase().includes(q));

      // Criticality filter
      const matchCrit = criticalityFilter === 'all' || f.criticality.toLowerCase() === criticalityFilter.toLowerCase();

      // PQC filter
      const matchPqc = pqcFilter === 'all' || f.pqc_classification.toLowerCase() === pqcFilter.toLowerCase();

      // Type filter
      const matchType = typeFilter === 'all' || f.type.toLowerCase() === typeFilter.toLowerCase();

      return matchSearch && matchCrit && matchPqc && matchType;
    }).sort((a, b) => {
      let valA = a[sortField];
      let valB = b[sortField];

      if (sortField === 'file') {
        valA = a.location.file;
        valB = b.location.file;
      }

      if (valA < valB) return sortAsc ? -1 : 1;
      if (valA > valB) return sortAsc ? 1 : -1;
      return 0;
    });
  }, [findings, search, criticalityFilter, pqcFilter, typeFilter, sortField, sortAsc]);

  const toggleSort = (field) => {
    if (sortField === field) {
      setSortAsc(!sortAsc);
    } else {
      setSortField(field);
      setSortAsc(false);
    }
  };

  return (
    <div className="p-8 space-y-6 max-w-7xl mx-auto">
      
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black text-white tracking-wide">Cryptographic Bill of Materials (CBOM)</h2>
          <p className="text-sm text-slate-400 mt-1">
            Normalized catalog of all discovered algorithms, keys, certificates, and dependencies with risk scores.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs font-mono px-3 py-1.5 rounded-lg bg-dark-800 border border-slate-700 text-cyan-400">
            Showing <strong>{filteredFindings.length}</strong> / {findings.length} assets
          </span>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="p-4 rounded-xl bg-dark-800/80 border border-slate-700/60 glass-panel flex flex-wrap items-center gap-3">
        
        {/* Search input */}
        <div className="relative flex-1 min-w-[220px]">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search algorithm, file path, or library..."
            className="w-full bg-dark-900 border border-slate-700 rounded-lg pl-9 pr-4 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500"
          />
        </div>

        {/* Criticality Filter */}
        <select
          value={criticalityFilter}
          onChange={(e) => setCriticalityFilter(e.target.value)}
          className="bg-dark-900 border border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-300 focus:outline-none focus:border-cyan-500"
        >
          <option value="all">All Risk Tiers</option>
          <option value="critical">Critical</option>
          <option value="high">High</option>
          <option value="medium">Medium</option>
          <option value="low">Low</option>
          <option value="safe">Quantum-Safe</option>
        </select>

        {/* PQC Filter */}
        <select
          value={pqcFilter}
          onChange={(e) => setPqcFilter(e.target.value)}
          className="bg-dark-900 border border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-300 focus:outline-none focus:border-cyan-500"
        >
          <option value="all">All PQC Statuses</option>
          <option value="quantum-vulnerable">Quantum-Vulnerable</option>
          <option value="hybrid-recommended">Hybrid-Recommended</option>
          <option value="quantum-safe">Quantum-Safe</option>
        </select>

        {/* Type Filter */}
        <select
          value={typeFilter}
          onChange={(e) => setTypeFilter(e.target.value)}
          className="bg-dark-900 border border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-300 focus:outline-none focus:border-cyan-500"
        >
          <option value="all">All Asset Types</option>
          <option value="algorithm">Algorithm</option>
          <option value="key">Hardcoded Key/Secret</option>
          <option value="certificate">X.509 Certificate</option>
          <option value="library">Vulnerable Library</option>
          <option value="protocol">Protocol/TLS</option>
        </select>

        {(search || criticalityFilter !== 'all' || pqcFilter !== 'all' || typeFilter !== 'all') && (
          <button
            onClick={() => {
              setSearch('');
              setCriticalityFilter('all');
              setPqcFilter('all');
              setTypeFilter('all');
            }}
            className="text-xs text-cyan-400 hover:text-cyan-300 underline"
          >
            Reset Filters
          </button>
        )}

      </div>

      {/* Findings Table */}
      <div className="rounded-2xl bg-dark-800/80 border border-slate-700/60 glass-panel overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-slate-700/80 bg-dark-900/60 text-slate-400 uppercase text-[10px] tracking-wider">
                <th 
                  className="py-3.5 px-4 cursor-pointer hover:text-white"
                  onClick={() => toggleSort('algorithm')}
                >
                  <div className="flex items-center gap-1.5">
                    <span>Algorithm / Asset</span>
                    <ArrowUpDown className="w-3 h-3 text-slate-500" />
                  </div>
                </th>
                <th 
                  className="py-3.5 px-4 cursor-pointer hover:text-white"
                  onClick={() => toggleSort('risk_score')}
                >
                  <div className="flex items-center gap-1.5">
                    <span>Risk Tier & Score</span>
                    <ArrowUpDown className="w-3 h-3 text-slate-500" />
                  </div>
                </th>
                <th 
                  className="py-3.5 px-4 cursor-pointer hover:text-white"
                  onClick={() => toggleSort('pqc_classification')}
                >
                  <div className="flex items-center gap-1.5">
                    <span>PQC Classification</span>
                    <ArrowUpDown className="w-3 h-3 text-slate-500" />
                  </div>
                </th>
                <th 
                  className="py-3.5 px-4 cursor-pointer hover:text-white"
                  onClick={() => toggleSort('file')}
                >
                  <div className="flex items-center gap-1.5">
                    <span>File Location</span>
                    <ArrowUpDown className="w-3 h-3 text-slate-500" />
                  </div>
                </th>
                <th className="py-3.5 px-4">Library / Binding</th>
                <th className="py-3.5 px-4">Recommended Replacement</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-700/40 font-sans">
              {filteredFindings.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-400">
                    No cryptographic assets match the selected filter criteria.
                  </td>
                </tr>
              ) : (
                filteredFindings.map((item) => (
                  <tr
                    key={item.asset_id}
                    className="hover:bg-slate-800/60 transition-colors group cursor-pointer"
                    onClick={() => onSelectFinding(item)}
                  >
                    <td className="py-3.5 px-4">
                      <div className="font-mono font-bold text-white group-hover:text-cyan-300 transition-colors">
                        {item.algorithm}
                      </div>
                      <div className="flex items-center gap-1.5 mt-0.5">
                        <span className="text-[10px] font-mono text-slate-400 uppercase">
                          {item.type}
                        </span>
                        {item.key_size && (
                          <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-dark-900 text-slate-400 border border-slate-700">
                            {item.key_size}-bit
                          </span>
                        )}
                        {item.mode_padding && (
                          <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-dark-900 text-slate-400 border border-slate-700">
                            {item.mode_padding}
                          </span>
                        )}
                      </div>
                    </td>

                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-2">
                        <RiskBadge level={item.criticality} size="sm" />
                        <span className="text-[11px] font-mono font-bold text-slate-400">
                          {item.risk_score}
                        </span>
                      </div>
                    </td>

                    <td className="py-3.5 px-4">
                      <span className={`text-[11px] font-mono px-2 py-0.5 rounded border ${
                        item.pqc_classification === 'quantum-safe'
                          ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                          : item.pqc_classification === 'hybrid-recommended'
                          ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                          : 'bg-purple-950/30 text-purple-300 border-purple-800/40'
                      }`}>
                        {item.pqc_classification}
                      </span>
                    </td>

                    <td className="py-3.5 px-4 font-mono text-slate-300">
                      <div className="flex items-center gap-1">
                        <FileCode className="w-3 h-3 text-slate-500 shrink-0" />
                        <span className="truncate max-w-[160px]">{item.location.file}</span>
                        <span className="text-slate-500">:{item.location.line}</span>
                      </div>
                    </td>

                    <td className="py-3.5 px-4 text-slate-400 text-xs">
                      {item.library}
                    </td>

                    <td className="py-3.5 px-4 font-mono text-xs text-emerald-300">
                      {item.migration_recommendation?.recommended_pqc || 'AES-256-GCM'}
                    </td>

                    <td className="py-3.5 px-4 text-right" onClick={(e) => e.stopPropagation()}>
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => onSelectBlastFinding(item)}
                          className="p-1.5 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/30 text-rose-300 text-xs transition-colors"
                          title="View Blast Radius"
                        >
                          <Share2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => onOpenGraphWithFinding(item)}
                          className="p-1.5 rounded-lg bg-cyan-500/10 hover:bg-cyan-500/20 border border-cyan-500/30 text-cyan-300 text-xs transition-colors"
                          title="Locate in Dependency Graph"
                        >
                          <ExternalLink className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
}
