import sqlite3
import json
import os
from typing import List, Dict, Any, Optional

DB_PATH = os.path.join(os.path.dirname(__file__), "data", "cryptoscope.db")

def init_db():
    os.makedirs(os.path.dirname(DB_PATH), exist_ok=True)
    conn = sqlite3.connect(DB_PATH)
    cur = conn.cursor()
    
    cur.execute("""
    CREATE TABLE IF NOT EXISTS scans (
        scan_id TEXT PRIMARY KEY,
        scan_name TEXT,
        scanned_at TEXT,
        target_type TEXT,
        target_path_or_url TEXT,
        summary_json TEXT,
        graph_json TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
    """)
    
    cur.execute("""
    CREATE TABLE IF NOT EXISTS findings (
        asset_id TEXT PRIMARY KEY,
        scan_id TEXT,
        type TEXT,
        algorithm TEXT,
        key_size INTEGER,
        criticality TEXT,
        risk_score REAL,
        finding_json TEXT,
        FOREIGN KEY (scan_id) REFERENCES scans (scan_id)
    )
    """)
    
    conn.commit()
    conn.close()

def save_scan_result(scan_id: str, scan_name: str, scanned_at: str, target_type: str, 
                     target_path_or_url: str, summary: Dict[str, Any], 
                     findings: List[Dict[str, Any]], graph: Dict[str, Any]):
    init_db()
    conn = sqlite3.connect(DB_PATH)
    cur = conn.cursor()
    
    cur.execute("""
    INSERT OR REPLACE INTO scans 
    (scan_id, scan_name, scanned_at, target_type, target_path_or_url, summary_json, graph_json)
    VALUES (?, ?, ?, ?, ?, ?, ?)
    """, (
        scan_id, scan_name, scanned_at, target_type, target_path_or_url,
        json.dumps(summary), json.dumps(graph)
    ))
    
    cur.execute("DELETE FROM findings WHERE scan_id = ?", (scan_id,))
    
    for f in findings:
        cur.execute("""
        INSERT INTO findings 
        (asset_id, scan_id, type, algorithm, key_size, criticality, risk_score, finding_json)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        """, (
            f.get("asset_id"),
            scan_id,
            f.get("type"),
            f.get("algorithm"),
            f.get("key_size"),
            f.get("criticality"),
            f.get("risk_score", 0.0),
            json.dumps(f)
        ))
        
    conn.commit()
    conn.close()

def get_scan(scan_id: str) -> Optional[Dict[str, Any]]:
    init_db()
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    cur = conn.cursor()
    
    cur.execute("SELECT * FROM scans WHERE scan_id = ?", (scan_id,))
    row = cur.fetchone()
    if not row:
        conn.close()
        return None
        
    summary = json.loads(row["summary_json"])
    graph = json.loads(row["graph_json"])
    
    cur.execute("SELECT finding_json FROM findings WHERE scan_id = ?", (scan_id,))
    findings = [json.loads(f_row["finding_json"]) for f_row in cur.fetchall()]
    
    conn.close()
    return {
        "summary": summary,
        "findings": findings,
        "graph": graph
    }

def list_all_scans() -> List[Dict[str, Any]]:
    init_db()
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    cur = conn.cursor()
    
    cur.execute("SELECT scan_id, scan_name, scanned_at, target_type, target_path_or_url, summary_json FROM scans ORDER BY created_at DESC")
    rows = cur.fetchall()
    conn.close()
    
    results = []
    for r in rows:
        summary = json.loads(r["summary_json"])
        results.append(summary)
    return results
