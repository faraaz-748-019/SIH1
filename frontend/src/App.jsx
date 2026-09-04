import React, { useState, useEffect } from 'react';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import FindingDrawer from './components/FindingDrawer';
import BlastRadiusModal from './components/BlastRadiusModal';
import AiChatDrawer from './components/AiChatDrawer';

import Dashboard from './pages/Dashboard';
import ScanUpload from './pages/ScanUpload';
import FindingsView from './pages/FindingsView';
import DependencyGraphView from './pages/DependencyGraphView';
import PQCReadinessView from './pages/PQCReadinessView';
import MigrationRoadmapView from './pages/MigrationRoadmapView';

import { triggerDemoScan, fetchScanList, fetchScanDetails } from './services/api';

export default function App() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [scanData, setScanData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Modal and Drawer States
  const [selectedFinding, setSelectedFinding] = useState(null);
  const [blastFinding, setBlastFinding] = useState(null);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [graphFocusFinding, setGraphFocusFinding] = useState(null);

  // Pre-load demo scan on initial mount if available
  useEffect(() => {
    initApp();
  }, []);

  const initApp = async () => {
    setLoading(true);
    try {
      // Check if existing scans in DB
      const list = await fetchScanList();
      if (list && list.length > 0) {
        const firstScan = await fetchScanDetails(list[0].scan_id);
        setScanData(firstScan);
      } else {
        // Run demo scan automatically
        const demoRes = await triggerDemoScan();
        setScanData(demoRes);
      }
    } catch (e) {
      console.warn("Initial load fallback:", e);
    } finally {
      setLoading(false);
    }
  };

  const handleRunDemo = async () => {
    setLoading(true);
    setError(null);
    try {
      const demoRes = await triggerDemoScan();
      setScanData(demoRes);
      setActiveTab('dashboard');
    } catch (err) {
      setError("Failed to run demo scan: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleScanComplete = (newScanData) => {
    setScanData(newScanData);
    setActiveTab('dashboard');
  };

  const handleOpenGraphWithFinding = (finding) => {
    setGraphFocusFinding(finding);
    setActiveTab('graph');
  };

  const findings = scanData?.findings || [];
  const summary = scanData?.summary || null;
  const graph = scanData?.graph || { nodes: [], edges: [] };

  return (
    <div className="flex h-screen bg-dark-900 text-slate-100 overflow-hidden font-sans">
      
      {/* Sidebar Navigation */}
      <Sidebar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        setIsChatOpen={setIsChatOpen}
        scanSummary={summary}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 h-screen overflow-y-auto">
        
        <Header
          scanSummary={summary}
          onRefreshDemo={handleRunDemo}
          loading={loading}
          setIsChatOpen={setIsChatOpen}
          activeTab={activeTab}
        />

        {error && (
          <div className="mx-8 mt-4 p-3 rounded-xl bg-rose-500/20 border border-rose-500/40 text-rose-300 text-xs">
            {error}
          </div>
        )}

        <main className="flex-1">
          {activeTab === 'dashboard' && (
            <Dashboard
              scanSummary={summary}
              findings={findings}
              onSelectFinding={setSelectedFinding}
              onSelectBlastFinding={setBlastFinding}
              setActiveTab={setActiveTab}
              onRunDemo={handleRunDemo}
              loading={loading}
            />
          )}

          {activeTab === 'scan' && (
            <ScanUpload
              onScanComplete={handleScanComplete}
              onRunDemo={handleRunDemo}
              loading={loading}
              scanSummary={summary}
            />
          )}

          {activeTab === 'findings' && (
            <FindingsView
              findings={findings}
              onSelectFinding={setSelectedFinding}
              onSelectBlastFinding={setBlastFinding}
              onOpenGraphWithFinding={handleOpenGraphWithFinding}
            />
          )}

          {activeTab === 'graph' && (
            <DependencyGraphView
              graphData={graph}
              findings={findings}
              selectedFindingFromOtherPage={graphFocusFinding}
              onOpenFindingDetails={setSelectedFinding}
              onOpenBlastRadius={setBlastFinding}
            />
          )}

          {activeTab === 'pqc' && (
            <PQCReadinessView
              scanSummary={summary}
              findings={findings}
              onSelectFinding={setSelectedFinding}
            />
          )}

          {activeTab === 'migration' && (
            <MigrationRoadmapView
              findings={findings}
              onSelectFinding={setSelectedFinding}
              onOpenGraphWithFinding={handleOpenGraphWithFinding}
            />
          )}
        </main>
      </div>

      {/* Slide-out Finding Drawer */}
      <FindingDrawer
        finding={selectedFinding}
        onClose={() => setSelectedFinding(null)}
        onOpenBlastRadius={(f) => {
          setSelectedFinding(null);
          setBlastFinding(f);
        }}
        onOpenGraph={(f) => {
          setSelectedFinding(null);
          handleOpenGraphWithFinding(f);
        }}
      />

      {/* Blast Radius Visual Modal */}
      <BlastRadiusModal
        finding={blastFinding}
        onClose={() => setBlastFinding(null)}
        onNavigateGraph={(f) => {
          setBlastFinding(null);
          handleOpenGraphWithFinding(f);
        }}
      />

      {/* Grounded AI Assistant Drawer */}
      <AiChatDrawer
        isOpen={isChatOpen}
        onClose={() => setIsChatOpen(false)}
        scanSummary={summary}
      />

    </div>
  );
}
