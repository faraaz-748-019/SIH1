from typing import Dict, Any, List, Tuple

def score_crypto_finding(finding: Dict[str, Any], file_occurrence_counts: Dict[str, int] = None) -> Tuple[float, str, List[str], str]:
    """
    Returns (risk_score, criticality, risk_reasons, one_line_summary)
    """
    algo = finding.get("algorithm", "").upper()
    asset_type = finding.get("type", "").lower()
    key_size = finding.get("key_size")
    mode = finding.get("mode_padding")
    file_path = finding.get("location", {}).get("file", "")

    reasons: List[str] = []

    # 1. Algorithm Weakness (0 to 40)
    weakness_pts = 0
    if "DES" in algo and "3DES" not in algo and "DESEDE" not in algo:
        weakness_pts = 40
        reasons.append("DES is cryptographically broken with 56-bit effective keysize.")
    elif "MD5" in algo:
        weakness_pts = 38
        reasons.append("MD5 has severe collision vulnerabilities and is disallowed for security.")
    elif "RC4" in algo:
        weakness_pts = 40
        reasons.append("RC4 stream cipher is completely broken (RFC 7465 prohibited).")
    elif "SHA1" in algo or "SHA-1" in algo:
        weakness_pts = 35
        reasons.append("SHA-1 is deprecated due to practical collision attacks (SHAttered).")
    elif "1024" in algo or (key_size and key_size <= 1024):
        weakness_pts = 38
        reasons.append("1024-bit RSA key length is insecure and easily factorable.")
    elif mode == "ECB" or "ECB" in algo:
        weakness_pts = 35
        reasons.append("ECB mode lacks semantic security and leaks data structural patterns.")
    elif "3DES" in algo or "DESEDE" in algo:
        weakness_pts = 30
        reasons.append("Triple-DES is retired by NIST due to Sweet32 64-bit block collisions.")
    elif "DEPRECATED" in algo:
        weakness_pts = 32
        reasons.append("Deprecated cryptographic API usage vulnerable to weak key derivation.")
    elif "2048" in algo or (key_size and key_size == 2048):
        weakness_pts = 15
        reasons.append("RSA-2048 meets classical minimums but is fully vulnerable to Shor's quantum algorithm.")
    elif "AES-128" in algo or (algo == "AES" and key_size == 128):
        weakness_pts = 10
        reasons.append("AES-128 security reduced to 64 bits under Grover's quantum search.")
    elif "ML-KEM" in algo or "ML-DSA" in algo or "KYBER" in algo or "DILITHIUM" in algo:
        weakness_pts = 0
    elif "AES-256" in algo or "SHA3" in algo or "CHACHA20" in algo:
        weakness_pts = 0
    else:
        weakness_pts = 12

    # 2. Exposure Score (0 to 20)
    exposure_pts = 0
    if asset_type == "key" or "HARDCODED" in algo:
        exposure_pts = 20
        reasons.append("Hardcoded private key/secret found directly embedded in source code.")
    elif "INSECURESPIPOVERIFY" in algo or "INSECURE" in algo:
        exposure_pts = 20
        reasons.append("TLS peer verification is explicitly disabled, allowing active MITM attacks.")
    elif "EXPIRED" in str(mode):
        exposure_pts = 18
        reasons.append("X.509 certificate is expired or invalid.")
    elif "VULNERABLE-DEP" in algo:
        exposure_pts = 16
        reasons.append("Dependency manifest references known vulnerable library release.")
    elif "auth" in file_path.lower() or "payment" in file_path.lower():
        exposure_pts = 15
        reasons.append("Located in high-value mission-critical domain (Authentication/Payment).")
    else:
        exposure_pts = 5

    # 3. Dependency / Centrality (0 to 20)
    centrality_pts = 5
    if file_occurrence_counts:
        count = file_occurrence_counts.get(file_path, 1)
        if count >= 4:
            centrality_pts = 20
            reasons.append(f"High blast radius: file contains {count} dependent cryptographic assets.")
        elif count >= 2:
            centrality_pts = 12
        else:
            centrality_pts = 6
    else:
        if "auth" in file_path.lower() or "crypto" in file_path.lower() or "service" in file_path.lower():
            centrality_pts = 15
        else:
            centrality_pts = 8

    # 4. Quantum Vulnerability (0 to 20)
    quantum_pts = 0
    if any(q in algo for q in ["RSA", "ECDSA", "ECDH", "DH", "DIFFIE", "DSA", "ED25519"]):
        quantum_pts = 20
        reasons.append("Asymmetric primitive broken in polynomial time by Shor's quantum algorithm.")
    elif "AES-128" in algo or "128" in algo:
        quantum_pts = 10
        reasons.append("Grover's algorithm halves effective symmetric key length to 64 bits.")
    elif any(safe in algo for safe in ["ML-KEM", "ML-DSA", "KYBER", "DILITHIUM", "FALCON", "SPHINCS", "AES-256", "SHA3"]):
        quantum_pts = 0
    else:
        quantum_pts = 8

    total_score = min(100.0, float(weakness_pts + exposure_pts + centrality_pts + quantum_pts))

    # Criticality tier
    if weakness_pts == 0 and exposure_pts <= 5 and quantum_pts == 0:
        criticality = "safe"
        one_line_summary = "Quantum-safe cryptographic primitive adhering to modern standards."
    elif total_score >= 70:
        criticality = "critical"
        one_line_summary = f"CRITICAL: {reasons[0] if reasons else 'High-risk security exposure'}"
    elif total_score >= 50:
        criticality = "high"
        one_line_summary = f"HIGH: {reasons[0] if reasons else 'Elevated cryptographic weakness'}"
    elif total_score >= 30:
        criticality = "medium"
        one_line_summary = f"MEDIUM: {reasons[0] if reasons else 'Moderate quantum/classical risk'}"
    else:
        criticality = "low"
        one_line_summary = f"LOW: Minor deprecation or isolated low-impact finding."

    return total_score, criticality, reasons, one_line_summary
