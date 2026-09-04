import os
import shutil
import tempfile
import zipfile
import uuid
import datetime
import subprocess
from typing import Optional
from fastapi import APIRouter, UploadFile, File, Form, HTTPException, Response

from ..models import ScanResultResponse, ScanSummary, DependencyGraphData, CryptoAsset
from ..scanner.engine import scan_directory
from ..core.normalizer import normalize_findings
from ..core.risk_engine import score_crypto_finding
from ..core.pqc_classifier import classify_pqc_readiness
from ..core.migration_advisor import get_migration_recommendation
from ..core.graph_builder import build_dependency_graph
from ..core.report_generator import generate_json_report, generate_pdf_report
from ..db import save_scan_result, get_scan, list_all_scans

router = APIRouter(prefix="/api/scan", tags=["Scanning & Analysis"])

def process_scan_directory(target_dir: str, scan_name: str, target_type: str, target_ref: str) -> dict:
    scan_id = f"scan-{uuid.uuid4().hex[:8]}"
    scanned_at = datetime.datetime.utcnow().isoformat() + "Z"

    # 1. Crawl & parse raw findings
    raw_findings, total_files = scan_directory(target_dir)

    # 2. Normalize findings
    normalized = normalize_findings(raw_findings)

    # Count occurrences per file for centrality calculation
    file_counts = {}
    for item in normalized:
        f = item["location"]["file"]
        file_counts[f] = file_counts.get(f, 0) + 1

    # 3. Score Risk, Classify PQC, and Attach Migration recommendations
    critical_count = 0
    high_count = 0
    medium_count = 0
    low_count = 0
    safe_count = 0
    pqc_breakdown = {"quantum-vulnerable": 0, "quantum-safe": 0, "hybrid-recommended": 0}

    for item in normalized:
        # Score risk
        risk_score, criticality, reasons, one_line = score_crypto_finding(item, file_counts)
        item["risk_score"] = round(risk_score, 1)
        item["criticality"] = criticality
        item["risk_reasons"] = reasons
        item["risk_summary"] = one_line

        if criticality == "critical":
            critical_count += 1
        elif criticality == "high":
            high_count += 1
        elif criticality == "medium":
            medium_count += 1
        elif criticality == "low":
            low_count += 1
        elif criticality == "safe":
            safe_count += 1

        # Classify PQC
        pqc_info = classify_pqc_readiness(item)
        item["pqc_classification"] = pqc_info["pqc_classification"]
        item["mosca_status"] = pqc_info["mosca_status"]
        item["mosca_details"] = pqc_info["mosca_details"]
        item["pqc_reason"] = pqc_info["pqc_reason"]

        pqc_breakdown[pqc_info["pqc_classification"]] = pqc_breakdown.get(pqc_info["pqc_classification"], 0) + 1

        # Migration recommendation
        item["migration_recommendation"] = get_migration_recommendation(item)

    # 4. Build Dependency Graph and Blast Radius
    graph_payload, blast_radius_lookup = build_dependency_graph(normalized, scan_name)

    # Attach blast radius to findings
    for item in normalized:
        item["blast_radius"] = blast_radius_lookup.get(item["asset_id"], {})

    # Calculate overall PQC readiness score
    total_assets = len(normalized)
    if total_assets > 0:
        safe_weight = (pqc_breakdown.get("quantum-safe", 0) * 1.0) + (pqc_breakdown.get("hybrid-recommended", 0) * 0.5)
        pqc_readiness_score = round((safe_weight / total_assets) * 100, 1)
    else:
        pqc_readiness_score = 100.0

    # Top vulnerable algorithms summary
    algo_freq = {}
    for item in normalized:
        if item.get("criticality") in ["critical", "high", "medium"]:
            a = item.get("algorithm", "UNKNOWN")
            algo_freq[a] = algo_freq.get(a, 0) + 1
    top_vuln = [{"algorithm": k, "count": v} for k, v in sorted(algo_freq.items(), key=lambda x: x[1], reverse=True)[:5]]

    summary = {
        "scan_id": scan_id,
        "scan_name": scan_name,
        "scanned_at": scanned_at,
        "target_type": target_type,
        "target_path_or_url": target_ref,
        "total_files_scanned": total_files,
        "total_crypto_assets": total_assets,
        "critical_count": critical_count,
        "high_count": high_count,
        "medium_count": medium_count,
        "low_count": low_count,
        "safe_count": safe_count,
        "pqc_readiness_score": pqc_readiness_score,
        "pqc_breakdown": pqc_breakdown,
        "top_vulnerable_algorithms": top_vuln
    }

    # Save to SQLite
    save_scan_result(
        scan_id=scan_id,
        scan_name=scan_name,
        scanned_at=scanned_at,
        target_type=target_type,
        target_path_or_url=target_ref,
        summary=summary,
        findings=normalized,
        graph=graph_payload
    )

    return {
        "summary": summary,
        "findings": normalized,
        "graph": graph_payload
    }

@router.get("/list")
def list_scans():
    """List all previous scans"""
    return list_all_scans()

@router.get("/demo")
def trigger_demo_scan():
    """Pre-runs or retrieves the demo repository scan"""
    demo_path = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "..", "demo_repo"))
    return process_scan_directory(
        target_dir=demo_path,
        scan_name="Enterprise-Demo-Repository",
        target_type="demo",
        target_ref="demo_repo/"
    )

@router.post("/upload")
async def scan_uploaded_zip(file: UploadFile = File(...), scan_name: Optional[str] = Form(None)):
    """Accepts a ZIP archive of a codebase and scans it"""
    if not file.filename.endswith((".zip", ".tar.gz", ".tar")):
        raise HTTPException(status_code=400, detail="Only .zip or .tar archive uploads supported")

    temp_dir = tempfile.mkdtemp(prefix="cryptoscope_upload_")
    try:
        zip_path = os.path.join(temp_dir, file.filename)
        with open(zip_path, "wb") as f:
            content = await file.read()
            f.write(content)

        extract_dir = os.path.join(temp_dir, "extracted")
        os.makedirs(extract_dir, exist_ok=True)
        with zipfile.ZipFile(zip_path, 'r') as zip_ref:
            zip_ref.extractall(extract_dir)

        name = scan_name or file.filename
        result = process_scan_directory(
            target_dir=extract_dir,
            scan_name=name,
            target_type="upload",
            target_ref=file.filename
        )
        return result
    finally:
        shutil.rmtree(temp_dir, ignore_errors=True)

@router.post("/github")
def scan_github_repo(repo_url: str = Form(...), scan_name: Optional[str] = Form(None)):
    """Clones a public Git repository and runs the scan"""
    if not repo_url.startswith(("http://", "https://", "git@")):
        raise HTTPException(status_code=400, detail="Invalid repository URL")

    temp_dir = tempfile.mkdtemp(prefix="cryptoscope_git_")
    try:
        name = scan_name or repo_url.split("/")[-1].replace(".git", "")
        subprocess.run(
            ["git", "clone", "--depth", "1", repo_url, temp_dir],
            check=True,
            timeout=120,
            stdout=subprocess.PIPE,
            stderr=subprocess.PIPE
        )
        result = process_scan_directory(
            target_dir=temp_dir,
            scan_name=name,
            target_type="github",
            target_ref=repo_url
        )
        return result
    except subprocess.CalledProcessError as e:
        raise HTTPException(status_code=400, detail=f"Git clone failed: {e.stderr.decode('utf-8', errors='ignore')}")
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        shutil.rmtree(temp_dir, ignore_errors=True)

@router.get("/{scan_id}")
def get_scan_details(scan_id: str):
    """Retrieve full scan details by ID"""
    res = get_scan(scan_id)
    if not res:
        raise HTTPException(status_code=404, detail="Scan not found")
    return res

@router.get("/{scan_id}/blast/{asset_id}")
def get_blast_radius(scan_id: str, asset_id: str):
    """Get blast radius breakdown for a specific asset"""
    res = get_scan(scan_id)
    if not res:
        raise HTTPException(status_code=404, detail="Scan not found")
    for f in res.get("findings", []):
        if f.get("asset_id") == asset_id:
            return f.get("blast_radius", {})
    raise HTTPException(status_code=404, detail="Asset not found")

@router.get("/{scan_id}/report/json")
def download_json_report(scan_id: str):
    """Download standardized JSON report (CBOM)"""
    res = get_scan(scan_id)
    if not res:
        raise HTTPException(status_code=404, detail="Scan not found")
    json_str = generate_json_report(res)
    return Response(
        content=json_str,
        media_type="application/json",
        headers={"Content-Disposition": f'attachment; filename="cryptoscope_report_{scan_id}.json"'}
    )

@router.get("/{scan_id}/report/pdf")
def download_pdf_report(scan_id: str):
    """Download standardized PDF report"""
    res = get_scan(scan_id)
    if not res:
        raise HTTPException(status_code=404, detail="Scan not found")
    pdf_bytes = generate_pdf_report(res)
    return Response(
        content=pdf_bytes,
        media_type="application/pdf",
        headers={"Content-Disposition": f'attachment; filename="cryptoscope_pqc_report_{scan_id}.pdf"'}
    )
