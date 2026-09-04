import React, { useEffect, useRef, useState } from 'react';
import cytoscape from 'cytoscape';
import dagre from 'cytoscape-dagre';
import { 
  Network, 
  ZoomIn, 
  ZoomOut, 
  Maximize2, 
  Layers, 
  Share2, 
  RotateCcw, 
  Filter, 
  Search,
  FileCode,
  ShieldAlert,
  ArrowRight,
  Info
} from 'lucide-react';
import RiskBadge from '../components/RiskBadge';

// Register layout
try {
  cytoscape.use(dagre);
} catch (e) {
  // already registered
}

export default function DependencyGraphView({ 
  graphData, 
  findings = [], 
  selectedFindingFromOtherPage,
  onOpenFindingDetails,
  onOpenBlastRadius
}) {
  const containerRef = useRef(null);
  const cyRef = useRef(null);
  const [selectedNode, setSelectedNode] = useState(null);
  const [selectedAssetFinding, setSelectedAssetFinding] = useState(null);
  const [searchNode, setSearchNode] = useState('');
  const [layoutName, setLayoutName] = useState('breadthfirst');

  useEffect(() => {
    if (!containerRef.current || !graphData || !graphData.nodes) return;

    // Build elements for cytoscape
    const elements = [
      ...graphData.nodes.map(n => ({
        data: {
          id: n.id,
          label: n.label,
          type: n.type,
          criticality: n.criticality || 'medium',
          ...n.data
        }
      })),
      ...graphData.edges.map(e => ({
        data: {
          id: e.id,
          source: e.source,
          target: e.target,
          label: e.label || 'uses'
        }
      }))
    ];

    const cy = cytoscape({
      container: containerRef.current,
      elements: elements,
      style: [
        {
          selector: 'node',
          style: {
            'label': 'data(label)',
            'color': '#E2E8F0',
            'font-size': '11px',
            'font-family': 'JetBrains Mono, monospace',
            'text-valign': 'bottom',
            'text-margin-y': '6px',
            'text-background-opacity': 0.8,
            'text-background-color': '#070B14',
            'text-background-padding': '3px',
            'text-background-shape': 'roundrectangle',
            'border-width': '2px',
            'border-color': '#334155',
            'background-color': '#1E293B',
            'width': '36px',
            'height': '36px',
            'transition-property': 'background-color, border-color, width, height',
            'transition-duration': '0.2s'
          }
        },
        // Root App node
        {
          selector: 'node[type = "app"]',
          style: {
            'background-color': '#0284C7',
            'border-color': '#38BDF8',
            'width': '52px',
            'height': '52px',
            'font-size': '13px',
            'font-weight': 'bold',
            'border-width': '3px'
          }
        },
        // Service node
        {
          selector: 'node[type = "service"]',
          style: {
            'background-color': '#7C3AED',
            'border-color': '#A78BFA',
            'width': '44px',
            'height': '44px',
            'font-size': '12px'
          }
        },
        // File node
        {
          selector: 'node[type = "file"]',
          style: {
            'background-color': '#0F766E',
            'border-color': '#2DD4BF',
            'width': '34px',
            'height': '34px'
          }
        },
        // Library node
        {
          selector: 'node[type = "library"]',
          style: {
            'background-color': '#D97706',
            'border-color': '#FBBF24',
            'width': '32px',
            'height': '32px'
          }
        },
        // Critical Algorithm node
        {
          selector: 'node[criticality = "critical"]',
          style: {
            'background-color': '#E11D48',
            'border-color': '#FB7185',
            'border-width': '3px',
            'width': '38px',
            'height': '38px'
          }
        },
        // High Algorithm node
        {
          selector: 'node[criticality = "high"]',
          style: {
            'background-color': '#EA580C',
            'border-color': '#FB923C',
            'border-width': '2.5px'
          }
        },
        // Safe Algorithm node
        {
          selector: 'node[criticality = "safe"]',
          style: {
            'background-color': '#059669',
            'border-color': '#34D399',
            'border-width': '2px'
          }
        },
        // Edges styling
        {
          selector: 'edge',
          style: {
            'width': 1.5,
            'line-color': '#334155',
            'target-arrow-color': '#475569',
            'target-arrow-shape': 'triangle',
            'curve-style': 'bezier',
            'arrow-scale': 0.8,
            'opacity': 0.6
          }
        },
        // Highlighted elements on click
        {
          selector: '.highlighted',
          style: {
            'border-color': '#22D3EE',
            'border-width': '4px',
            'line-color': '#22D3EE',
            'target-arrow-color': '#22D3EE',
            'opacity': 1,
            'z-index': 999
          }
        },
        {
          selector: '.faded',
          style: {
            'opacity': 0.15
          }
        }
      ],
      layout: getLayoutConfig(layoutName)
    });

    cyRef.current = cy;

    // Node click handler
    cy.on('tap', 'node', (evt) => {
      const node = evt.target;
      handleNodeSelection(node, cy);
    });

    // Background click handler -> reset highlights
    cy.on('tap', (evt) => {
      if (evt.target === cy) {
        cy.elements().removeClass('highlighted faded');
        setSelectedNode(null);
        setSelectedAssetFinding(null);
      }
    });

    // If navigated with a selected finding, focus on that node
    if (selectedFindingFromOtherPage) {
      const targetNodeId = `node-asset-${selectedFindingFromOtherPage.asset_id}`;
      const targetNode = cy.getElementById(targetNodeId);
      if (targetNode.length > 0) {
        setTimeout(() => {
          handleNodeSelection(targetNode, cy);
          cy.animate({
            center: { eles: targetNode },
            zoom: 1.5,
            duration: 500
          });
        }, 300);
      }
    }

    return () => {
      cy.destroy();
    };
  }, [graphData, layoutName]);

  const getLayoutConfig = (name) => {
    if (name === 'breadthfirst') {
      return {
        name: 'breadthfirst',
        directed: true,
        padding: 40,
        spacingFactor: 1.25,
        animate: true
      };
    }
    if (name === 'dagre') {
      return {
        name: 'dagre',
        rankDir: 'BT', // Bottom to top (Algorithm -> App)
        nodeSep: 50,
        rankSep: 70,
        animate: true
      };
    }
    if (name === 'concentric') {
      return {
        name: 'concentric',
        concentric: (node) => {
          const type = node.data('type');
          if (type === 'app') return 4;
          if (type === 'service') return 3;
          if (type === 'file') return 2;
          return 1;
        },
        levelWidth: () => 1,
        animate: true
      };
    }
    return { name: 'cose', animate: true, padding: 40 };
  };

  const handleNodeSelection = (node, cy) => {
    cy.elements().removeClass('highlighted faded');

    // Find all connected paths
    const connectedEdges = node.connectedEdges();
    const successors = node.successors();
    const predecessors = node.predecessors();

    const activeCollection = node.union(connectedEdges).union(successors).union(predecessors);
    
    cy.elements().addClass('faded');
    activeCollection.removeClass('faded').addClass('highlighted');

    const nodeData = node.data();
    setSelectedNode(nodeData);

    // Look for matching finding
    const assetId = nodeData.assetId || (nodeData.id.startsWith('node-asset-') ? nodeData.id.replace('node-asset-', '') : null);
    if (assetId) {
      const match = findings.find(f => f.asset_id === assetId);
      setSelectedAssetFinding(match || null);
    } else {
      setSelectedAssetFinding(null);
    }
  };

  const handleSearchNode = (val) => {
    setSearchNode(val);
    if (!cyRef.current) return;
    const cy = cyRef.current;
    
    if (!val.trim()) {
      cy.elements().removeClass('highlighted faded');
      return;
    }

    const matches = cy.nodes().filter(n => n.data('label').toLowerCase().includes(val.toLowerCase()));
    if (matches.length > 0) {
      cy.elements().addClass('faded');
      matches.removeClass('faded').addClass('highlighted');
      cy.animate({
        center: { eles: matches },
        zoom: 1.2,
        duration: 400
      });
    }
  };

  const handleZoom = (delta) => {
    if (!cyRef.current) return;
    const cy = cyRef.current;
    cy.zoom(cy.zoom() * delta);
  };

  const handleFit = () => {
    if (!cyRef.current) return;
    cyRef.current.fit(null, 40);
  };

  const handleReset = () => {
    if (!cyRef.current) return;
    cyRef.current.elements().removeClass('highlighted faded');
    setSelectedNode(null);
    setSelectedAssetFinding(null);
    cyRef.current.fit(null, 40);
  };

  return (
    <div className="relative h-[calc(100vh-4rem)] flex overflow-hidden">
      
      {/* Main Canvas Area */}
      <div className="flex-1 relative flex flex-col">
        
        {/* Top Floating Controls Bar */}
        <div className="absolute top-4 left-4 right-4 z-10 flex flex-wrap items-center justify-between gap-3 pointer-events-none">
          
          {/* Legend Pill */}
          <div className="pointer-events-auto flex items-center gap-2 p-2 rounded-xl bg-dark-800/90 backdrop-blur-md border border-slate-700/80 shadow-lg text-[11px] font-mono">
            <div className="flex items-center gap-1.5 px-2 py-1 rounded bg-rose-500/20 text-rose-300 border border-rose-500/30">
              <span className="w-2 h-2 rounded-full bg-rose-400"></span>
              <span>Critical Algo</span>
            </div>
            <div className="flex items-center gap-1.5 px-2 py-1 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30">
              <span className="w-2 h-2 rounded-full bg-amber-400"></span>
              <span>Library</span>
            </div>
            <div className="flex items-center gap-1.5 px-2 py-1 rounded bg-teal-500/20 text-teal-300 border border-teal-500/30">
              <span className="w-2 h-2 rounded-full bg-teal-400"></span>
              <span>File</span>
            </div>
            <div className="flex items-center gap-1.5 px-2 py-1 rounded bg-purple-500/20 text-purple-300 border border-purple-500/30">
              <span className="w-2 h-2 rounded-full bg-purple-400"></span>
              <span>Service</span>
            </div>
            <div className="flex items-center gap-1.5 px-2 py-1 rounded bg-sky-500/20 text-sky-300 border border-sky-500/30">
              <span className="w-2 h-2 rounded-full bg-sky-400"></span>
              <span>App</span>
            </div>
          </div>

          {/* Search & Layout Controls */}
          <div className="pointer-events-auto flex items-center gap-2">
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchNode}
                onChange={(e) => handleSearchNode(e.target.value)}
                placeholder="Search graph nodes..."
                className="bg-dark-800/90 border border-slate-700 rounded-xl pl-8 pr-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500 shadow-lg"
              />
            </div>

            <select
              value={layoutName}
              onChange={(e) => setLayoutName(e.target.value)}
              className="bg-dark-800/90 border border-slate-700 rounded-xl px-3 py-1.5 text-xs text-slate-300 focus:outline-none focus:border-cyan-500 shadow-lg"
            >
              <option value="breadthfirst">Tree Hierarchy (Bottom-Up)</option>
              <option value="dagre">Dagre Directed Flow</option>
              <option value="concentric">Concentric Circles</option>
              <option value="cose">Force-Directed Physics (COSE)</option>
            </select>

            <div className="flex items-center gap-1 bg-dark-800/90 p-1 rounded-xl border border-slate-700 shadow-lg">
              <button
                onClick={() => handleZoom(1.25)}
                className="p-1.5 rounded-lg text-slate-300 hover:text-white hover:bg-slate-700"
                title="Zoom In"
              >
                <ZoomIn className="w-4 h-4" />
              </button>
              <button
                onClick={() => handleZoom(0.8)}
                className="p-1.5 rounded-lg text-slate-300 hover:text-white hover:bg-slate-700"
                title="Zoom Out"
              >
                <ZoomOut className="w-4 h-4" />
              </button>
              <button
                onClick={handleFit}
                className="p-1.5 rounded-lg text-slate-300 hover:text-white hover:bg-slate-700"
                title="Fit to Screen"
              >
                <Maximize2 className="w-4 h-4" />
              </button>
              <button
                onClick={handleReset}
                className="p-1.5 rounded-lg text-slate-300 hover:text-white hover:bg-slate-700"
                title="Reset View"
              >
                <RotateCcw className="w-4 h-4" />
              </button>
            </div>
          </div>

        </div>

        {/* Cytoscape Container */}
        <div 
          ref={containerRef} 
          className="w-full h-full bg-dark-900 cursor-grab active:cursor-grabbing"
        />

        {/* Bottom Helper Bar */}
        <div className="absolute bottom-4 left-4 z-10 pointer-events-none">
          <div className="p-2.5 rounded-xl bg-dark-800/90 backdrop-blur-md border border-slate-700 text-xs text-slate-400 flex items-center gap-2 shadow-lg pointer-events-auto">
            <Info className="w-4 h-4 text-cyan-400" />
            <span>Click any algorithm node to highlight its cascading dependency path (Library → File → Service → App).</span>
          </div>
        </div>

      </div>

      {/* Right-hand Node & Blast Radius Details Sidebar */}
      {selectedNode && (
        <div className="w-80 bg-dark-800 border-l border-slate-700/80 p-5 overflow-y-auto flex flex-col justify-between z-20 shadow-2xl animate-in slide-in-from-right duration-200">
          <div className="space-y-4">
            
            <div className="flex items-center justify-between border-b border-slate-700/60 pb-3">
              <span className="text-[10px] uppercase font-mono tracking-widest text-cyan-400 font-bold">
                Selected Graph Node
              </span>
              <span className="text-xs font-mono px-2 py-0.5 rounded bg-dark-900 text-slate-300 uppercase border border-slate-700">
                {selectedNode.type}
              </span>
            </div>

            <div>
              <h3 className="text-lg font-bold text-white font-mono">{selectedNode.label}</h3>
              {selectedNode.criticality && (
                <div className="mt-2">
                  <RiskBadge level={selectedNode.criticality} size="sm" />
                </div>
              )}
            </div>

            {selectedNode.filePath && (
              <div className="p-3 rounded-lg bg-dark-900 border border-slate-800 text-xs font-mono text-cyan-300">
                <span className="text-[10px] text-slate-500 block">File Path:</span>
                {selectedNode.filePath}
              </div>
            )}

            {selectedAssetFinding && (
              <div className="space-y-3 pt-2">
                <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-xs space-y-1">
                  <div className="font-bold text-rose-300 uppercase text-[10px]">Cascading Impact:</div>
                  <p className="text-slate-200 text-[11px] leading-relaxed">
                    {selectedAssetFinding.blast_radius?.impact_summary || "Directly binds upstream microservice architecture."}
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-2 text-center text-xs">
                  <div className="p-2 rounded bg-dark-900 border border-slate-800">
                    <span className="text-[10px] text-slate-400 block">Affected Services</span>
                    <strong className="text-white text-base">{selectedAssetFinding.blast_radius?.affected_service_count || 1}</strong>
                  </div>
                  <div className="p-2 rounded bg-dark-900 border border-slate-800">
                    <span className="text-[10px] text-slate-400 block">Impacted Files</span>
                    <strong className="text-white text-base">{selectedAssetFinding.blast_radius?.affected_file_count || 1}</strong>
                  </div>
                </div>

                <div className="space-y-2 pt-2">
                  <button
                    onClick={() => onOpenBlastRadius(selectedAssetFinding)}
                    className="w-full py-2 px-3 rounded-lg bg-rose-500/20 hover:bg-rose-500/30 border border-rose-500/40 text-rose-300 text-xs font-semibold flex items-center justify-center gap-1.5 transition-all"
                  >
                    <Share2 className="w-3.5 h-3.5" />
                    <span>Open Blast Radius Modal</span>
                  </button>
                  <button
                    onClick={() => onOpenFindingDetails(selectedAssetFinding)}
                    className="w-full py-2 px-3 rounded-lg bg-cyan-500/20 hover:bg-cyan-500/30 border border-cyan-500/40 text-cyan-300 text-xs font-semibold flex items-center justify-center gap-1.5 transition-all"
                  >
                    <FileCode className="w-3.5 h-3.5" />
                    <span>View Code & Fix Details</span>
                  </button>
                </div>
              </div>
            )}

          </div>

          <div className="pt-4 border-t border-slate-700/60 text-right">
            <button
              onClick={() => {
                setSelectedNode(null);
                setSelectedAssetFinding(null);
                if (cyRef.current) cyRef.current.elements().removeClass('highlighted faded');
              }}
              className="text-xs text-slate-400 hover:text-white"
            >
              Clear Selection
            </button>
          </div>
        </div>
      )}

    </div>
  );
}
