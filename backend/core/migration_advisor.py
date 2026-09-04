from typing import Dict, Any, List

MIGRATION_PLAYBOOK: Dict[str, Dict[str, Any]] = {
    "RSA": {
        "recommended_pqc": "ML-KEM-768 (FIPS 203 / Kyber)",
        "hybrid_alternative": "X25519 + ML-KEM-768 Hybrid Key Exchange",
        "category": "Asymmetric Key Encapsulation / Signing",
        "rationale": "RSA relies on integer factorization broken by Shor's algorithm. ML-KEM offers lattice-based quantum resistance with negligible latency overhead.",
        "security_gain": "Immune to Shor's quantum cryptanalysis (NIST Security Level 3)",
        "latency_tradeoff": "+0.4ms keygen/encapsulation, +1.2 KB public key size",
        "cost_impact": "Low (software library drop-in update)",
        "nist_status": "NIST FIPS 203 Finalized Standard",
        "phased_steps": [
            "Phase 1 (Audit): Catalog all callers and public key certificates relying on this RSA key/cipher.",
            "Phase 2 (Dual-Stack): Introduce composite/hybrid X25519 + ML-KEM-768 encapsulation.",
            "Phase 3 (Enforce): Deprecate RSA fallback and require quantum-safe handshake cipher suites.",
            "Phase 4 (Validation): Perform penetration tests and automated regression benchmarks."
        ]
    },
    "ECDSA": {
        "recommended_pqc": "ML-DSA-65 (FIPS 204 / Dilithium)",
        "hybrid_alternative": "ECDSA-P256 + ML-DSA-65 Dual Signature",
        "category": "Digital Signatures",
        "rationale": "Elliptic curve discrete logarithm is fully broken by quantum computers. ML-DSA provides strong lattice-based digital signatures.",
        "security_gain": "Post-quantum unforgeability against quantum and classical adversaries",
        "latency_tradeoff": "+2.4 KB signature size overhead, minimal CPU overhead",
        "cost_impact": "Medium (requires token & cert format updates)",
        "nist_status": "NIST FIPS 204 Finalized Standard",
        "phased_steps": [
            "Phase 1: Update identity provider and token issuers with ML-DSA key generation.",
            "Phase 2: Deploy hybrid composite tokens to maintain backward compatibility.",
            "Phase 3: Update verifiers and microservice middleware to validate ML-DSA signatures.",
            "Phase 4: Remove legacy ECDSA verification logic."
        ]
    },
    "DES": {
        "recommended_pqc": "AES-256-GCM (Authenticated Encryption)",
        "hybrid_alternative": "ChaCha20-Poly1305 (AEAD)",
        "category": "Symmetric Encryption",
        "rationale": "DES is obsolete with 56-bit keys crackable in hours classically. AES-256-GCM provides AEAD authenticated encryption and 128-bit quantum security against Grover's algorithm.",
        "security_gain": "Eliminates immediate brute-force vulnerability + provides quantum confidentiality",
        "latency_tradeoff": "5x faster throughput via hardware AES-NI instructions",
        "cost_impact": "Low (code refactor and database re-encryption script)",
        "nist_status": "FIPS 197 / NIST SP 800-38D",
        "phased_steps": [
            "Phase 1: Stop writing new records with DES; generate new AES-256-GCM master key.",
            "Phase 2: Build background data migration job to decrypt with DES and re-encrypt with AES-256-GCM.",
            "Phase 3: Update decryption helper to handle both legacy and new formats.",
            "Phase 4: Purge DES routines and old key material."
        ]
    },
    "3DES": {
        "recommended_pqc": "AES-256-GCM",
        "hybrid_alternative": "AES-256-CTR + HMAC-SHA384",
        "category": "Symmetric Encryption",
        "rationale": "Triple-DES is officially retired by NIST due to Sweet32 64-bit block collision vulnerabilities.",
        "security_gain": "Immune to Sweet32 collision attacks and provides quantum strength",
        "latency_tradeoff": "6x faster with hardware acceleration",
        "cost_impact": "Low-to-Medium",
        "nist_status": "NIST SP 800-131A Rev 2 (Disallowed)",
        "phased_steps": [
            "Phase 1: Configure payment gateway or database wrapper with AES-256-GCM key.",
            "Phase 2: Perform zero-downtime double-write and re-encryption.",
            "Phase 3: Retire 3DES cipher suites."
        ]
    },
    "AES-ECB": {
        "recommended_pqc": "AES-256-GCM",
        "hybrid_alternative": "AES-256-CBC with HMAC-SHA256",
        "category": "Cipher Block Mode",
        "rationale": "ECB mode leaks identical plaintext block patterns (Penguin leak) and lacks integrity protection.",
        "security_gain": "Cryptographic IND-CPA and IND-CCA2 confidentiality + authenticity",
        "latency_tradeoff": "Zero perceptible latency impact",
        "cost_impact": "Low (replace cipher initialization parameter and store 12-byte IV)",
        "nist_status": "ECB mode deprecated for general data encryption",
        "phased_steps": [
            "Phase 1: Add 12-byte random nonce generator for each encryption operation.",
            "Phase 2: Refactor caller to use AESGCM(key).encrypt(nonce, data).",
            "Phase 3: Add unit tests validating unique ciphertexts for identical inputs."
        ]
    },
    "MD5": {
        "recommended_pqc": "SHA3-384 / SHA-512 / BLAKE3",
        "hybrid_alternative": "Argon2id (for passwords) or SHA-256 (for checksums)",
        "category": "Cryptographic Hash / Password Hashing",
        "rationale": "MD5 suffers practical collision attacks (<1 second to forge collisions).",
        "security_gain": "Full collision resistance + preimage security",
        "latency_tradeoff": "Configurable (Argon2id memory-hardened for password protection)",
        "cost_impact": "Low",
        "nist_status": "NIST SP 800-107 Rev 1 (Strictly Disallowed)",
        "phased_steps": [
            "Phase 1: If used for passwords, deploy Argon2id hash-on-login migration pattern.",
            "Phase 2: If used for data integrity/dedup, swap to SHA3-256 or BLAKE3.",
            "Phase 3: Clean up deprecated hashlib.md5 calls."
        ]
    },
    "SHA1": {
        "recommended_pqc": "SHA3-384 or SHA-512",
        "hybrid_alternative": "SHA-256",
        "category": "Cryptographic Hash",
        "rationale": "SHA-1 collision attacks (SHAttered) are well proven and banned by major standards.",
        "security_gain": "Preimage and collision resistance guaranteed",
        "latency_tradeoff": "Negligible",
        "cost_impact": "Low",
        "nist_status": "NIST Disallowed (FIPS 180-4 sunset)",
        "phased_steps": [
            "Phase 1: Identify all token, certificate, and checksum consumers.",
            "Phase 2: Upgrade hash digest length to 256 or 384 bits.",
            "Phase 3: Enforce SHA-256 / SHA3-384 minimum in API headers."
        ]
    },
    "HARDCODED-KEY": {
        "recommended_pqc": "Enterprise Secrets Manager (HashiCorp Vault / AWS KMS) + AES-256-GCM Envelope Encryption",
        "hybrid_alternative": "Environment Variable + Automated Key Rotation",
        "category": "Key Management & Storage",
        "rationale": "Hardcoded secrets in source code lead to immediate credential compromise via repository leakage.",
        "security_gain": "Zero static secret exposure in code + automated audit trails and rotation",
        "latency_tradeoff": "~1-2ms cacheable secret retrieval",
        "cost_impact": "Low-to-Medium",
        "nist_status": "NIST SP 800-57 Key Management Guidelines",
        "phased_steps": [
            "Phase 1: IMMEDIATELY revoke and rotate the exposed secret key in production.",
            "Phase 2: Migrate secret retrieval to environment variables or KMS SDK (e.g. Vault/KMS).",
            "Phase 3: Add pre-commit git hooks (gitleaks) to block hardcoded keys from being committed."
        ]
    },
    "TLS-INSECURE": {
        "recommended_pqc": "TLS 1.3 with Hybrid Post-Quantum Key Exchange (X25519MLKEM768)",
        "hybrid_alternative": "TLS 1.3 strict mode with ECDHE-RSA/ECDSA",
        "category": "Transport Layer Security",
        "rationale": "InsecureSkipVerify or TLS 1.0 enables Man-In-The-Middle (MITM) and downgrade attacks.",
        "security_gain": "Enforces strict peer authentication and forward secrecy",
        "latency_tradeoff": "Faster handshake (TLS 1.3 1-RTT / 0-RTT)",
        "cost_impact": "Zero cost (configuration change)",
        "nist_status": "NIST SP 800-52 Rev 2 (Mandatory TLS 1.3)",
        "phased_steps": [
            "Phase 1: Remove InsecureSkipVerify: true and configure custom CA cert pool.",
            "Phase 2: Set MinVersion: tls.VersionTLS13.",
            "Phase 3: Enable hybrid PQC cipher suites."
        ]
    }
}

def get_migration_recommendation(finding: Dict[str, Any]) -> Dict[str, Any]:
    algo = finding.get("algorithm", "").upper()
    asset_type = finding.get("type", "").lower()

    matched_key = None
    if "HARDCODED" in algo or asset_type == "key":
        matched_key = "HARDCODED-KEY"
    elif "TLS" in algo or "INSECURE" in algo:
        matched_key = "TLS-INSECURE"
    elif "DES" in algo and "3DES" not in algo and "DESEDE" not in algo:
        matched_key = "DES"
    elif "3DES" in algo or "DESEDE" in algo or "TRIPLEDES" in algo:
        matched_key = "3DES"
    elif "ECB" in algo or finding.get("mode_padding") == "ECB":
        matched_key = "AES-ECB"
    elif "MD5" in algo:
        matched_key = "MD5"
    elif "SHA1" in algo or "SHA-1" in algo:
        matched_key = "SHA1"
    elif "RSA" in algo:
        matched_key = "RSA"
    elif "ECDSA" in algo or "EC" in algo:
        matched_key = "ECDSA"
    else:
        matched_key = "RSA"  # default fallback recommendation

    item = MIGRATION_PLAYBOOK[matched_key]
    return {
        "category": item["category"],
        "recommended_pqc": item["recommended_pqc"],
        "hybrid_alternative": item["hybrid_alternative"],
        "rationale": item["rationale"],
        "security_gain": item["security_gain"],
        "latency_tradeoff": item["latency_tradeoff"],
        "cost_impact": item["cost_impact"],
        "nist_status": item["nist_status"],
        "phased_steps": item["phased_steps"]
    }
