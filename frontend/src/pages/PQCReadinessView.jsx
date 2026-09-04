import React, { useState } from 'react';
import { 
  Atom, 
  Clock, 
  ShieldAlert, 
  CheckCircle2, 
  AlertTriangle, 
  ArrowRight, 
  Cpu, 
  Sliders, 
  Sparkles,
  Layers,
  HelpCircle
} from 'lucide-react';
import { 
  ResponsiveContainer, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  Tooltip, 
  Cell,
  PieChart,
  Pie
} from 'recharts';
import RiskBadge from '../components/RiskBadge';

export default function PQCReadinessView({ scanSummary, findings = [], onSelectFinding }) {
  // Interactive Mosca's Theorem Simulator Sliders
  const [dataLifeX, setDataLifeX] = useState(10); // X: Data shelf life (years)
  const [migrationY, setMigrationY] = useState(4);  // Y: Migration duration (years)
  const [threatZ, setThreatZ] = useState(7);       // Z: Q-Day timeline (years)

  const isConditionViolated = (dataLifeX + migrationY) > threatZ;
  const threatDelta = (dataLifeX + migrationY) - threatZ;

  const pqcBreakdown = scanSummary?.pqc_breakdown || {
    'quantum-vulnerable': 0,
    'hybrid-recommended': 0,
    'quantum-safe': 0
  };

  const chartData = [
    { name: 'Quantum Vulnerable', count: pqcBreakdown['quantum-vulnerable'] || 0, color: '#F43F5E' },
    { name: 'Hybrid Recommended', count: pqcBreakdown['hybrid-recommended'] || 0, color: '#F59E0B' },
    { name: 'Quantum Safe', count: pqcBreakdown['quantum-safe'] || 0, color: '#10B981' }
  ];

  return (
    <div className="p-8 space-y-8 max-w-7xl mx-auto">
      
      {/* Page Title */}
      <div>
        <h2 className="text-2xl font-black text-white tracking-wide flex items-center gap-2.5">
          <Atom className="w-7 h-7 text-purple-400" />
          <span>Post-Quantum Cryptography (PQC) Readiness</span>
        </h2>
        <p className="text-sm text-slate-400 mt-1">
          Evaluation of enterprise cryptographic posture against Shor's and Grover's quantum algorithms using Mosca's Theorem and NIST FIPS 203/204/205 standards.
        </p>
      </div>

      {/* Top Gauge & Posture Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Score Ring / Card */}
        <div className="p-6 rounded-2xl bg-gradient-to-b from-dark-800 to-dark-900 border border-slate-700/60 glass-panel flex flex-col justify-between items-center text-center">
          <span className="text-xs uppercase font-mono tracking-widest text-slate-400">Org PQC Readiness Index</span>
          
          <div className="relative my-4 flex items-center justify-center">
            <div className="w-36 h-36 rounded-full border-8 border-slate-800 flex items-center justify-center">
              <div 
                className="w-36 h-36 rounded-full border-8 border-cyan-400 border-t-purple-500 absolute animate-spin-slow"
                style={{ clipPath: 'polygon(0 0, 100% 0, 100% 100%, 0 100%)' }}
              />
              <div className="text-center">
                <span className="text-4xl font-black text-white glow-text-cyan">{scanSummary?.pqc_readiness_score || 0}%</span>
                <span className="block text-[10px] uppercase font-mono text-slate-400 mt-0.5">NIST Standard</span>
              </div>
            </div>
          </div>

          <p className="text-xs text-slate-300">
            {scanSummary?.pqc_readiness_score > 70 
              ? "Strong quantum resiliency. Most primitives use 256-bit keys or PQC algorithms."
              : "High quantum exposure. Codebase relies heavily on RSA/ECC vulnerable to Shor's algorithm."
            }
          </p>
        </div>

        {/* Breakdown Chart */}
        <div className="p-6 rounded-2xl bg-dark-800/80 border border-slate-700/60 glass-panel lg:col-span-2 flex flex-col justify-between">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider">Cryptographic Quantum Classification</h3>
            <span className="text-xs font-mono text-slate-400">{scanSummary?.total_crypto_assets || 0} Total Assets</span>
          </div>

          <div className="h-44">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} layout="vertical">
                <XAxis type="number" stroke="#64748B" fontSize={11} />
                <YAxis dataKey="name" type="category" stroke="#CBD5E1" fontSize={11} width={130} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#0D1424', borderColor: '#334155', borderRadius: '8px', fontSize: '12px' }}
                />
                <Bar dataKey="count" radius={[0, 6, 6, 0]}>
                  {chartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="grid grid-cols-3 gap-2 pt-3 border-t border-slate-700/50 text-center text-xs">
            <div className="p-2 rounded bg-rose-500/10 border border-rose-500/20 text-rose-300">
              <span className="block text-[10px] uppercase font-mono">Quantum Broken</span>
              <strong className="text-base font-mono">{pqcBreakdown['quantum-vulnerable']}</strong>
            </div>
            <div className="p-2 rounded bg-amber-500/10 border border-amber-500/20 text-amber-300">
              <span className="block text-[10px] uppercase font-mono">Hybrid Target</span>
              <strong className="text-base font-mono">{pqcBreakdown['hybrid-recommended']}</strong>
            </div>
            <div className="p-2 rounded bg-emerald-500/10 border border-emerald-500/20 text-emerald-300">
              <span className="block text-[10px] uppercase font-mono">Quantum Compliant</span>
              <strong className="text-base font-mono">{pqcBreakdown['quantum-safe']}</strong>
            </div>
          </div>
        </div>

      </div>

      {/* Interactive Mosca's Theorem Simulator */}
      <div className="p-6 rounded-2xl bg-gradient-to-br from-dark-800 to-dark-900 border border-slate-700/80 glass-panel space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-700/60 pb-4">
          <div>
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <Sliders className="w-5 h-5 text-cyan-400" />
              <span>Mosca's Theorem Risk Calculator (Interactive)</span>
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Mosca's Condition: If <strong className="text-white font-mono">X (Data Life) + Y (Migration Time) &gt; Z (Q-Day)</strong>, you are in immediate breach.
            </p>
          </div>
          
          <div className={`px-3 py-1.5 rounded-lg border text-xs font-mono font-bold flex items-center gap-2 ${
            isConditionViolated 
              ? 'bg-rose-500/20 text-rose-300 border-rose-500/40 animate-pulse' 
              : 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
          }`}>
            {isConditionViolated ? <AlertTriangle className="w-4 h-4" /> : <CheckCircle2 className="w-4 h-4" />}
            <span>{isConditionViolated ? `CRITICAL VIOLATION (+${threatDelta} yrs exposure)` : 'SAFE BUFFER'}</span>
          </div>
        </div>

        {/* Sliders Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          
          {/* X Slider */}
          <div className="p-4 rounded-xl bg-dark-900/80 border border-slate-800 space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="font-semibold text-slate-300">Data Shelf-Life (X)</span>
              <span className="font-mono text-cyan-400 font-bold">{dataLifeX} Years</span>
            </div>
            <input
              type="range"
              min={1}
              max={25}
              value={dataLifeX}
              onChange={(e) => setDataLifeX(Number(e.target.value))}
              className="w-full accent-cyan-400 cursor-pointer"
            />
            <p className="text-[10px] text-slate-500">Years sensitive data/PII/secrets must remain confidential.</p>
          </div>

          {/* Y Slider */}
          <div className="p-4 rounded-xl bg-dark-900/80 border border-slate-800 space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="font-semibold text-slate-300">Migration Time (Y)</span>
              <span className="font-mono text-purple-400 font-bold">{migrationY} Years</span>
            </div>
            <input
              type="range"
              min={1}
              max={10}
              value={migrationY}
              onChange={(e) => setMigrationY(Number(e.target.value))}
              className="w-full accent-purple-400 cursor-pointer"
            />
            <p className="text-[10px] text-slate-500">Duration required to recode, test, and deploy PQC across services.</p>
          </div>

          {/* Z Slider */}
          <div className="p-4 rounded-xl bg-dark-900/80 border border-slate-800 space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="font-semibold text-slate-300">Time to Q-Day (Z)</span>
              <span className="font-mono text-rose-400 font-bold">{threatZ} Years</span>
            </div>
            <input
              type="range"
              min={2}
              max={15}
              value={threatZ}
              onChange={(e) => setThreatZ(Number(e.target.value))}
              className="w-full accent-rose-400 cursor-pointer"
            />
            <p className="text-[10px] text-slate-500">Estimated years until Cryptanalytically Relevant Quantum Computer.</p>
          </div>

        </div>

        {/* Live Mosca Mathematical Analysis Box */}
        <div className={`p-4 rounded-xl border text-xs leading-relaxed ${
          isConditionViolated 
            ? 'bg-rose-950/30 border-rose-500/40 text-rose-200' 
            : 'bg-emerald-950/30 border-emerald-500/40 text-emerald-200'
        }`}>
          <div className="font-mono font-bold text-sm mb-1">
            Calculation: X ({dataLifeX}y) + Y ({migrationY}y) = {dataLifeX + migrationY}y vs Z ({threatZ}y)
          </div>
          <p>
            {isConditionViolated
              ? `Adversaries executing "Harvest Now, Decrypt Later" (HNDL) can record encrypted traffic today and decrypt it in ${threatZ} years when quantum computers arrive, compromising your data ${threatDelta} years before its required secrecy expires.`
              : `Your migration window is within the estimated quantum security threshold. Maintain proactive PQC migration timelines to avoid future deadline compression.`
            }
          </p>
        </div>

      </div>

      {/* NIST Post-Quantum Standard Algorithms Reference Box */}
      <div className="p-6 rounded-2xl bg-dark-800/80 border border-slate-700/60 glass-panel space-y-4">
        <h3 className="text-base font-bold text-white flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-cyan-400" />
          NIST Post-Quantum Cryptography Standard Targets (August 2024 Release)
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          
          <div className="p-4 rounded-xl bg-dark-900/90 border border-cyan-500/30 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono font-bold text-cyan-400">ML-KEM (Kyber)</span>
              <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-cyan-500/20 text-cyan-300">FIPS 203</span>
            </div>
            <p className="text-xs text-slate-300">General key encapsulation mechanism (KEM) replacing RSA key exchange and ECDH.</p>
            <div className="text-[10px] font-mono text-slate-400 pt-1">
              Primary Parameter: ML-KEM-768
            </div>
          </div>

          <div className="p-4 rounded-xl bg-dark-900/90 border border-purple-500/30 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono font-bold text-purple-400">ML-DSA (Dilithium)</span>
              <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-purple-500/20 text-purple-300">FIPS 204</span>
            </div>
            <p className="text-xs text-slate-300">Lattice-based digital signature algorithm replacing RSA and ECDSA signatures.</p>
            <div className="text-[10px] font-mono text-slate-400 pt-1">
              Primary Parameter: ML-DSA-65
            </div>
          </div>

          <div className="p-4 rounded-xl bg-dark-900/90 border border-emerald-500/30 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono font-bold text-emerald-400">SLH-DSA (SPHINCS+)</span>
              <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-300">FIPS 205</span>
            </div>
            <p className="text-xs text-slate-300">Stateless hash-based digital signature fallback scheme immune to lattice attacks.</p>
            <div className="text-[10px] font-mono text-slate-400 pt-1">
              Primary Parameter: SLH-DSA-SHAKE-128f
            </div>
          </div>

        </div>
      </div>

    </div>
  );
}
