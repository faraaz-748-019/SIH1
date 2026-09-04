import React, { useState, useEffect } from 'react';
import { 
  UploadCloud, 
  GitBranch, 
  Sparkles, 
  FolderCheck, 
  History, 
  ArrowRight, 
  FileArchive, 
  CheckCircle2, 
  AlertCircle,
  Loader2
} from 'lucide-react';
import { uploadZipScan, gitRepoScan, fetchScanList, fetchScanDetails } from '../services/api';
import RiskBadge from '../components/RiskBadge';

export default function ScanUpload({ onScanComplete, onRunDemo, loading, scanSummary }) {
  const [gitUrl, setGitUrl] = useState('');
  const [gitScanName, setGitScanName] = useState('');
  const [uploadFile, setUploadFile] = useState(null);
  const [uploadScanName, setUploadScanName] = useState('');
  const [dragActive, setDragActive] = useState(false);
  const [scanHistory, setScanHistory] = useState([]);
  const [actionLoading, setActionLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    loadHistory();
  }, [scanSummary]);

  const loadHistory = async () => {
    try {
      const history = await fetchScanList();
      setScanHistory(history);
    } catch (e) {
      console.error(e);
    }
  };

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      setUploadFile(e.dataTransfer.files[0]);
    }
  };

  const handleUploadSubmit = async (e) => {
    e.preventDefault();
    if (!uploadFile) return;
    setActionLoading(true);
    setErrorMsg('');

    try {
      const formData = new FormData();
      formData.append('file', uploadFile);
      if (uploadScanName) formData.append('scan_name', uploadScanName);

      const result = await uploadZipScan(formData);
      onScanComplete(result);
      loadHistory();
    } catch (err) {
      setErrorMsg(err.message || 'Failed to scan uploaded archive.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleGitSubmit = async (e) => {
    e.preventDefault();
    if (!gitUrl) return;
    setActionLoading(true);
    setErrorMsg('');

    try {
      const result = await gitRepoScan(gitUrl, gitScanName);
      onScanComplete(result);
      loadHistory();
    } catch (err) {
      setErrorMsg(err.message || 'Failed to clone and scan GitHub repository.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleSelectHistoryScan = async (scanId) => {
    setActionLoading(true);
    try {
      const data = await fetchScanDetails(scanId);
      onScanComplete(data);
    } catch (e) {
      setErrorMsg('Failed to load scan from history.');
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <div className="p-8 space-y-8 max-w-6xl mx-auto">
      
      {/* Header */}
      <div>
        <h2 className="text-2xl font-black text-white tracking-wide">Cryptographic Discovery Scanner</h2>
        <p className="text-sm text-slate-400 mt-1">
          Scan any codebase (Python, Java, JS/TS, Go, X.509 certs & dependency manifests) for cryptographic usage, broken ciphers, and PQC migration readiness.
        </p>
      </div>

      {errorMsg && (
        <div className="p-4 rounded-xl bg-rose-500/15 border border-rose-500/40 text-rose-300 text-xs flex items-center gap-3">
          <AlertCircle className="w-5 h-5 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* 3 Main Ingestion Channels */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* 1. Quick Demo Repository Ingestion (Judges favorite) */}
        <div className="p-6 rounded-2xl bg-gradient-to-b from-cyan-950/40 to-dark-800 border border-cyan-500/40 glass-panel flex flex-col justify-between shadow-glow-cyan/20">
          <div className="space-y-3">
            <div className="w-12 h-12 rounded-xl bg-cyan-500/20 text-cyan-300 flex items-center justify-center">
              <Sparkles className="w-6 h-6 animate-pulse" />
            </div>
            <h3 className="text-lg font-bold text-white">Instant Demo Dataset</h3>
            <p className="text-xs text-slate-300 leading-relaxed">
              Instantly run discovery against the seeded synthetic multi-language enterprise repo (RSA-1024, DES, ECB mode, SHA-1, hardcoded keys, expired certs & PQC hybrids).
            </p>
            <div className="text-[11px] font-mono text-cyan-300 bg-dark-900/60 p-2.5 rounded-lg border border-cyan-500/20">
              • Python Auth & Token Service<br/>
              • Java Payment Gateway & BouncyCastle<br/>
              • Node.js Web Gateway & JWT<br/>
              • Go TLS Client & Insecure TLS
            </div>
          </div>

          <button
            onClick={onRunDemo}
            disabled={loading || actionLoading}
            className="mt-6 w-full py-3 rounded-xl bg-gradient-to-r from-cyan-500 to-indigo-600 hover:from-cyan-400 hover:to-indigo-500 text-white font-bold text-xs uppercase tracking-wider shadow-glow-cyan/30 flex items-center justify-center gap-2 transition-all active:scale-95 disabled:opacity-50"
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <FolderCheck className="w-4 h-4" />}
            <span>{loading ? "Analyzing Repo..." : "Load Demo Repo (5s)"}</span>
          </button>
        </div>

        {/* 2. Upload ZIP Archive */}
        <div className="p-6 rounded-2xl bg-dark-800/80 border border-slate-700/60 glass-panel flex flex-col justify-between">
          <div>
            <div className="w-12 h-12 rounded-xl bg-purple-500/20 text-purple-300 flex items-center justify-center mb-3">
              <UploadCloud className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-white">Upload Codebase (.zip)</h3>
            <p className="text-xs text-slate-400 mt-1 mb-4">
              Upload a zipped folder of your enterprise repository for offline AST & regex crypto analysis.
            </p>

            <form onSubmit={handleUploadSubmit} className="space-y-3">
              <div 
                onDragEnter={handleDrag}
                onDragLeave={handleDrag}
                onDragOver={handleDrag}
                onDrop={handleDrop}
                className={`border-2 border-dashed rounded-xl p-4 text-center cursor-pointer transition-colors ${
                  dragActive ? 'border-cyan-400 bg-cyan-500/10' : 'border-slate-700 hover:border-slate-500'
                }`}
              >
                <input
                  type="file"
                  accept=".zip,.tar,.gz"
                  onChange={(e) => setUploadFile(e.target.files[0])}
                  className="hidden"
                  id="zip-upload"
                />
                <label htmlFor="zip-upload" className="cursor-pointer block">
                  <FileArchive className="w-8 h-8 text-slate-400 mx-auto mb-1.5" />
                  <span className="text-xs font-medium text-slate-300 block truncate">
                    {uploadFile ? uploadFile.name : "Drag & drop ZIP or click to browse"}
                  </span>
                </label>
              </div>

              <input
                type="text"
                value={uploadScanName}
                onChange={(e) => setUploadScanName(e.target.value)}
                placeholder="Scan Label (optional)"
                className="w-full bg-dark-900 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500"
              />

              <button
                type="submit"
                disabled={!uploadFile || actionLoading}
                className="w-full py-2.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 text-white font-semibold text-xs transition-all shadow-glow-purple/20 flex items-center justify-center gap-2"
              >
                {actionLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <UploadCloud className="w-4 h-4" />}
                <span>Scan Uploaded ZIP</span>
              </button>
            </form>
          </div>
        </div>

        {/* 3. GitHub Repo URL Clone */}
        <div className="p-6 rounded-2xl bg-dark-800/80 border border-slate-700/60 glass-panel flex flex-col justify-between">
          <div>
            <div className="w-12 h-12 rounded-xl bg-amber-500/20 text-amber-300 flex items-center justify-center mb-3">
              <GitBranch className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-white">Public Git Repository</h3>
            <p className="text-xs text-slate-400 mt-1 mb-4">
              Enter any public Git URL to clone and perform multi-tier cryptographic discovery.
            </p>

            <form onSubmit={handleGitSubmit} className="space-y-3">
              <input
                type="text"
                value={gitUrl}
                onChange={(e) => setGitUrl(e.target.value)}
                placeholder="https://github.com/org/repo.git"
                className="w-full bg-dark-900 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500 font-mono"
              />

              <input
                type="text"
                value={gitScanName}
                onChange={(e) => setGitScanName(e.target.value)}
                placeholder="Scan Label (optional)"
                className="w-full bg-dark-900 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500"
              />

              <button
                type="submit"
                disabled={!gitUrl.trim() || actionLoading}
                className="w-full py-2.5 rounded-lg bg-amber-600 hover:bg-amber-500 disabled:opacity-40 text-white font-semibold text-xs transition-all shadow-glow-amber flex items-center justify-center gap-2"
              >
                {actionLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <GitBranch className="w-4 h-4" />}
                <span>Clone & Scan Repo</span>
              </button>
            </form>
          </div>
        </div>

      </div>

      {/* Previous Scans History Table */}
      <div className="p-6 rounded-2xl bg-dark-800/80 border border-slate-700/60 glass-panel space-y-4">
        <h3 className="text-base font-bold text-white flex items-center gap-2">
          <History className="w-4 h-4 text-cyan-400" />
          Recent Scans & Stored CBOMs
        </h3>

        {scanHistory.length === 0 ? (
          <p className="text-xs text-slate-400">No previous scans found in local SQLite database.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-700 text-slate-400 uppercase text-[10px]">
                  <th className="py-2.5 px-3">Scan Name / Target</th>
                  <th className="py-2.5 px-3">Type</th>
                  <th className="py-2.5 px-3">Crypto Assets</th>
                  <th className="py-2.5 px-3">Critical Risks</th>
                  <th className="py-2.5 px-3">PQC Readiness</th>
                  <th className="py-2.5 px-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-700/40">
                {scanHistory.map((s) => (
                  <tr key={s.scan_id} className="hover:bg-slate-800/50 transition-colors">
                    <td className="py-3 px-3 font-semibold text-white">
                      {s.scan_name}
                      <span className="block text-[10px] text-slate-400 font-mono">{s.scanned_at}</span>
                    </td>
                    <td className="py-3 px-3 uppercase text-[11px] font-mono text-cyan-400">
                      {s.target_type}
                    </td>
                    <td className="py-3 px-3 font-mono font-bold text-slate-200">
                      {s.total_crypto_assets}
                    </td>
                    <td className="py-3 px-3">
                      <span className={`font-mono font-bold ${s.critical_count > 0 ? 'text-rose-400' : 'text-emerald-400'}`}>
                        {s.critical_count}
                      </span>
                    </td>
                    <td className="py-3 px-3 font-mono text-purple-300">
                      {s.pqc_readiness_score}%
                    </td>
                    <td className="py-3 px-3 text-right">
                      <button
                        onClick={() => handleSelectHistoryScan(s.scan_id)}
                        className="px-3 py-1 rounded bg-slate-700 hover:bg-cyan-600 text-white text-[11px] font-semibold transition-all inline-flex items-center gap-1"
                      >
                        <span>Load</span>
                        <ArrowRight className="w-3 h-3" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

    </div>
  );
}
