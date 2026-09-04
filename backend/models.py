from pydantic import BaseModel, Field
from typing import List, Dict, Any, Optional
from datetime import datetime

class LocationInfo(BaseModel):
    file: str
    line: int
    column: Optional[int] = 1
    snippet: Optional[str] = ""

class CryptoAsset(BaseModel):
    asset_id: str
    type: str  # algorithm, key, certificate, library, protocol
    algorithm: str
    key_size: Optional[int] = None
    mode_padding: Optional[str] = None
    location: LocationInfo
    library: str
    confidence: float = 1.0
    criticality: str = "medium"  # critical, high, medium, low, safe
    risk_score: float = 0.0
    risk_reasons: List[str] = []
    pqc_classification: str = "quantum-vulnerable"  # quantum-vulnerable, quantum-safe, hybrid-recommended
    mosca_status: str = "URGENT"  # URGENT, MONITOR, READY
    migration_recommendation: Optional[Dict[str, Any]] = None
    blast_radius: Optional[Dict[str, Any]] = None

class ScanSummary(BaseModel):
    scan_id: str
    scan_name: str
    scanned_at: str
    target_type: str  # upload, github, demo
    target_path_or_url: str
    total_files_scanned: int
    total_crypto_assets: int
    critical_count: int
    high_count: int
    medium_count: int
    low_count: int
    safe_count: int
    pqc_readiness_score: float  # percentage 0-100
    pqc_breakdown: Dict[str, int]
    top_vulnerable_algorithms: List[Dict[str, Any]]

class GraphNode(BaseModel):
    id: str
    label: str
    type: str  # algorithm, library, file, service, app, risk
    criticality: Optional[str] = "medium"
    data: Optional[Dict[str, Any]] = {}

class GraphEdge(BaseModel):
    id: str
    source: str
    target: str
    label: Optional[str] = "uses"

class DependencyGraphData(BaseModel):
    nodes: List[GraphNode]
    edges: List[GraphEdge]

class ScanResultResponse(BaseModel):
    summary: ScanSummary
    findings: List[CryptoAsset]
    graph: DependencyGraphData

class MigrationPlanItem(BaseModel):
    asset_id: str
    algorithm: str
    category: str
    current_risk: str
    recommended_pqc: str
    hybrid_alternative: str
    rationale: str
    security_gain: str
    latency_tradeoff: str
    cost_impact: str
    nist_status: str
    phased_steps: List[str]

class ChatRequest(BaseModel):
    scan_id: str
    query: str
    history: Optional[List[Dict[str, str]]] = []

class ChatResponse(BaseModel):
    answer: str
    grounding_findings: List[str] = []
    suggested_questions: List[str] = []
