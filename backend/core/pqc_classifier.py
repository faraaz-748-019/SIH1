from typing import Dict, Any, Tuple

# Quantum threat model constants (in years from current date)
DEFAULT_DATA_LIFETIME = 10  # X years data must stay confidential (financial, health, secrets)
DEFAULT_MIGRATION_TIME = 4   # Y years to migrate enterprise crypto architecture
QUANTUM_THREAT_TIMELINE = 7 # Z years until CRQC (Q-Day ~ 2033)

QUANTUM_VULNERABLE_ALGORITHMS = {
    "RSA", "RSA-1024", "RSA-2048", "RSA-4096", "ECDSA", "ECDSA-P256", "ECDSA-P384",
    "ECDH", "DH", "DIFFIE-HELLMAN", "DSA", "ED25519", "X25519", "BLOWFISH", "DES", "3DES"
}

QUANTUM_SAFE_ALGORITHMS = {
    "AES-256", "AES-256-GCM", "AES-256-CTR", "AES-256-CBC", "AESGCM", "CHACHA20-POLY1305",
    "SHA-384", "SHA-512", "SHA3-256", "SHA3-384", "SHA3-512", "SHAKE-256",
    "ML-KEM-768", "ML-KEM-1024", "ML-DSA-65", "ML-DSA-87", "KYBER768", "KYBER1024",
    "DILITHIUM3", "DILITHIUM5", "FALCON-512", "FALCON-1024", "SPHINCS+"
}

HYBRID_RECOMMENDED_ALGORITHMS = {
    "AES-128", "AES-128-GCM", "AES-128-CBC", "AES-128-ECB", "SHA-256", "JWT-HS256"
}

def classify_pqc_readiness(finding: Dict[str, Any], data_shelf_life: int = DEFAULT_DATA_LIFETIME) -> Dict[str, Any]:
    algo = finding.get("algorithm", "").upper()
    key_size = finding.get("key_size")

    # Determine PQC category
    pqc_class = "quantum-vulnerable"
    reason = "Asymmetric encryption or small key length broken by Shor's/Grover's algorithm"
    
    # Check if explicitly quantum safe
    is_safe = False
    for safe_algo in QUANTUM_SAFE_ALGORITHMS:
        if safe_algo in algo or (algo == "AES" and key_size == 256):
            pqc_class = "quantum-safe"
            reason = "Quantum-resistant primitive meeting NIST PQC standards or 256-bit symmetric security"
            is_safe = True
            break

    if not is_safe:
        for hybrid_algo in HYBRID_RECOMMENDED_ALGORITHMS:
            if hybrid_algo in algo or (algo == "AES" and key_size == 128):
                pqc_class = "hybrid-recommended"
                reason = "Symmetric 128-bit key strength reduced by Grover's algorithm (64-bit effective quantum security)"
                break

    if "DES" in algo or "MD5" in algo or "SHA1" in algo or "1024" in algo:
        pqc_class = "quantum-vulnerable"
        reason = "Legacy primitive already classically broken and instantly defeated in quantum era"

    # Mosca's Theorem evaluation
    x = data_shelf_life
    y = DEFAULT_MIGRATION_TIME
    z = QUANTUM_THREAT_TIMELINE

    if pqc_class == "quantum-safe":
        mosca_status = "READY"
        mosca_msg = f"Compliant: Asset safe against quantum attacks (X={x}y + Y={y}y vs Z={z}y)."
    elif x + y > z:
        mosca_status = "URGENT"
        mosca_msg = f"CRITICAL MOSCA BREACH: Data lifetime ({x}y) + Migration ({y}y) = {x+y}y > Q-Day ({z}y). Subject to Harvest-Now-Decrypt-Later (HNDL)."
    else:
        mosca_status = "MONITOR"
        mosca_msg = f"Monitoring required: Transition timeline within buffer window."

    return {
        "pqc_classification": pqc_class,
        "mosca_status": mosca_status,
        "mosca_details": {
            "data_shelf_life_years": x,
            "migration_time_years": y,
            "quantum_threat_years": z,
            "condition_violated": (x + y > z) and (pqc_class != "quantum-safe"),
            "message": mosca_msg
        },
        "pqc_reason": reason
    }
