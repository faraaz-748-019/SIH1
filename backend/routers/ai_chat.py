from typing import Dict, Any, List, Tuple
from fastapi import APIRouter, HTTPException
from ..models import ChatRequest, ChatResponse
from ..db import get_scan

router = APIRouter(prefix="/api/ai", tags=["Grounded AI Assistant"])

def generate_grounded_response(query: str, scan_data: Dict[str, Any]) -> Tuple[str, List[str]]:
    q_lower = query.lower()
    summary = scan_data.get("summary", {})
    findings = scan_data.get("findings", [])
    grounding: List[str] = []

    # Check for specific asset queries
    matched_assets = []
    for f in findings:
        algo = f.get("algorithm", "").lower()
        file_p = f.get("location", {}).get("file", "").lower()
        if any(term in algo or term in file_p for term in q_lower.split() if len(term) > 2):
            matched_assets.append(f)
            grounding.append(f"{f['algorithm']} in {f['location']['file']}:{f['location']['line']} ({f['criticality'].upper()})")

    # If asking why high/critical risk
    if any(k in q_lower for k in ["why", "risk", "score", "critical", "vulnerable", "danger"]):
        if matched_assets:
            target = matched_assets[0]
            reasons = target.get("risk_reasons", [])
            reasons_formatted = "\n".join([f"• {r}" for r in reasons])
            mosca = target.get("mosca_details", {})
            ans = (
                f"**Risk Analysis for `{target['algorithm']}`** (Location: `{target['location']['file']}:{target['location']['line']}`)\n\n"
                f"**Criticality Tier:** `{target['criticality'].upper()}` (Risk Score: {target.get('risk_score', 0)}/100)\n\n"
                f"**Root Cause & Scoring Factors:**\n{reasons_formatted}\n\n"
                f"**PQC / Mosca Status:** `{target.get('mosca_status', 'N/A')}`\n"
                f"{mosca.get('message', '')}\n\n"
                f"**Suggested Remediation:** Migrate to `{target.get('migration_recommendation', {}).get('recommended_pqc', 'AES-256-GCM')}`."
            )
            return ans, grounding[:5]

    # If asking what breaks or blast radius
    if any(k in q_lower for k in ["break", "blast", "depend", "impact", "change", "replace", "migrate"]):
        if matched_assets:
            target = matched_assets[0]
            br = target.get("blast_radius", {})
            files = br.get("affected_files", [])
            services = br.get("affected_services", [])
            ans = (
                f"**Blast Radius & Dependency Analysis for `{target['algorithm']}`**\n\n"
                f"• **Affected Services ({len(services)}):** {', '.join(services) if services else 'Core Service'}\n"
                f"• **Dependent Files ({len(files)}):** {', '.join(files[:3]) if files else target['location']['file']}\n"
                f"• **Cascading Impact:** {br.get('impact_summary', 'Coordinated migration required across all dependent components.')}\n\n"
                f"**Action Plan:** Ensure compatibility wrappers or dual-stack hybrid endpoints are deployed "
                f"before deprecating this cipher to avoid service disruption."
            )
            return ans, grounding[:5]

    # If asking about Mosca's Theorem or PQC
    if any(k in q_lower for k in ["mosca", "pqc", "quantum", "readiness", "q-day", "harvest"]):
        pqc_score = summary.get("pqc_readiness_score", 0)
        crit_count = summary.get("critical_count", 0)
        vuln_count = summary.get("pqc_breakdown", {}).get("quantum-vulnerable", 0)
        ans = (
            f"**Org-Wide Post-Quantum Cryptography (PQC) Status**\n\n"
            f"• **Current PQC Readiness Score:** `{pqc_score}%`\n"
            f"• **Quantum-Vulnerable Assets:** `{vuln_count}` primitives susceptible to Shor's/Grover's algorithms.\n"
            f"• **Critical Mosca Breaches:** `{crit_count}` assets where X + Y > Z condition is violated.\n\n"
            f"**Mosca's Theorem Breakdown:**\n"
            f"• **X (Data Lifetime):** ~10 years — sensitive data must remain confidential.\n"
            f"• **Y (Migration Time):** ~4 years — time to re-engineer, test and deploy PQC.\n"
            f"• **Z (Q-Day Estimate):** ~7 years — expected CRQC arrival.\n\n"
            f"**Conclusion:** Because X + Y (14y) > Z (7y), any RSA or ECC ciphertext intercepted today "
            f"is subject to **Harvest Now, Decrypt Later (HNDL)** attacks by well-resourced adversaries. "
            f"Immediate transition to ML-KEM-768 and ML-DSA-65 (NIST FIPS 203/204) is mandated."
        )
        return ans, [f"PQC Readiness: {pqc_score}%", f"Total Assets: {summary.get('total_crypto_assets', 0)}"]

    # General summary fallback
    ans = (
        f"**CRYPTOSCOPE Scan Summary for `{summary.get('scan_name', 'Repo')}`**\n\n"
        f"• **Total Crypto Assets Found:** `{summary.get('total_crypto_assets', 0)}` across `{summary.get('total_files_scanned', 0)}` files.\n"
        f"• **Risk Breakdown:** {summary.get('critical_count', 0)} Critical, {summary.get('high_count', 0)} High, "
        f"{summary.get('medium_count', 0)} Medium, {summary.get('safe_count', 0)} Safe.\n"
        f"• **PQC Readiness Score:** `{summary.get('pqc_readiness_score', 0)}%`\n\n"
        f"**Example questions I can answer:**\n"
        f"1. *Why is RSA-1024 in auth.py a critical risk?*\n"
        f"2. *What breaks if I change DES in crypto_utils.py?*\n"
        f"3. *How does Mosca's theorem apply to our codebase?*\n"
        f"4. *What is the recommended PQC migration for ECDSA?*"
    )
    return ans, grounding[:3]


@router.post("/chat", response_model=ChatResponse)
def grounded_chat(req: ChatRequest):
    """AI Copilot: answers questions grounded only in scan findings — no hallucinations."""
    scan_data = get_scan(req.scan_id)
    if not scan_data:
        raise HTTPException(status_code=404, detail="Scan ID not found. Run or load a scan first.")

    answer, evidence = generate_grounded_response(req.query, scan_data)

    suggested = [
        "Why is RSA-1024 critical risk?",
        "What breaks if I migrate DES?",
        "Explain Mosca's theorem violation",
        "What is the recommended PQC replacement for ECDSA?"
    ]

    return ChatResponse(
        answer=answer,
        grounding_findings=evidence,
        suggested_questions=suggested
    )
