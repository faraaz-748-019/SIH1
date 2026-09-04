import re
import ast
import uuid
from typing import List, Dict, Any

PYTHON_CRYPTO_PATTERNS = [
    # RSA 1024 or RSA key generation
    {
        "pattern": r"(?:RSA\.generate\s*\(\s*(\d+)|generate_private_key\s*\(.*?key_size\s*=\s*(\d+))",
        "type": "algorithm",
        "algorithm_extractor": lambda m: f"RSA-{m.group(1) or m.group(2)}",
        "default_algo": "RSA",
        "library": "PyCryptodome/cryptography",
        "confidence": 0.98
    },
    # Hashlib algorithms: md5, sha1, sha224, sha256, sha384, sha512, sha3
    {
        "pattern": r"hashlib\.(md5|sha1|sha224|sha256|sha384|sha512|sha3_256|sha3_384|sha3_512|shake_\d+)\s*\(",
        "type": "algorithm",
        "algorithm_extractor": lambda m: m.group(1).upper().replace("_", "-"),
        "default_algo": "Hash",
        "library": "hashlib",
        "confidence": 0.99
    },
    # DES / 3DES
    {
        "pattern": r"(?:DES|DES3|TripleDES)\.(?:new|generate)\s*\(",
        "type": "algorithm",
        "algorithm_extractor": lambda m: "DES" if "DES." in m.group(0) else "3DES",
        "default_algo": "DES",
        "library": "PyCryptodome",
        "confidence": 0.99
    },
    # AES with modes
    {
        "pattern": r"AES\.new\s*\([^,]+,\s*(?:AES\.)?(MODE_ECB|MODE_CBC|MODE_GCM|MODE_CTR|MODE_CFB|MODE_OFB)",
        "type": "algorithm",
        "algorithm_extractor": lambda m: f"AES-{m.group(1).replace('MODE_', '')}",
        "default_algo": "AES",
        "library": "PyCryptodome",
        "confidence": 0.98
    },
    # Cryptography AESGCM / ciphers
    {
        "pattern": r"(AESGCM|ChaCha20Poly1305|AESCCM)\s*\(",
        "type": "algorithm",
        "algorithm_extractor": lambda m: f"{m.group(1)}",
        "default_algo": "AESGCM",
        "library": "cryptography.hazmat",
        "confidence": 0.98
    },
    # Hardcoded Private Keys / Secrets
    {
        "pattern": r"(?:-----BEGIN\s+(?:RSA\s+)?PRIVATE\s+KEY-----|[a-zA-Z0-9_]*(?:SECRET|KEY|PASSWORD|TOKEN)\s*=\s*['\"][a-zA-Z0-9_\-+/=]{16,}['\"])",
        "type": "key",
        "algorithm_extractor": lambda m: "Hardcoded-Key/Secret",
        "default_algo": "Hardcoded-Key",
        "library": "Built-in / Static Constant",
        "confidence": 0.95
    },
    # PQC references / ML-KEM / ML-DSA / Kyber / Dilithium
    {
        "pattern": r"(ML-KEM-\d+|ML-DSA-\d+|Kyber\d*|Dilithium\d*|Falcon\d*|SPHINCS\+?)",
        "type": "algorithm",
        "algorithm_extractor": lambda m: m.group(1),
        "default_algo": "PQC-Post-Quantum",
        "library": "liboqs / PQC Standard",
        "confidence": 0.95
    },
    # Crypto imports
    {
        "pattern": r"(?:import\s+(?:Crypto|cryptography|hashlib|ssl|OpenSSL|jwt)|from\s+(?:Crypto|cryptography|hashlib|ssl|OpenSSL|jwt))",
        "type": "library",
        "algorithm_extractor": lambda m: "Crypto-Library-Import",
        "default_algo": "Library-Import",
        "library": "External",
        "confidence": 0.90
    }
]

def parse_python_file(filepath: str, content: str) -> List[Dict[str, Any]]:
    findings = []
    lines = content.splitlines()

    for line_idx, line in enumerate(lines, start=1):
        for rule in PYTHON_CRYPTO_PATTERNS:
            matches = list(re.finditer(rule["pattern"], line, re.IGNORECASE))
            for m in matches:
                try:
                    algo = rule["algorithm_extractor"](m)
                except Exception:
                    algo = rule["default_algo"]

                key_size = None
                if "1024" in algo or "1024" in line:
                    key_size = 1024
                elif "2048" in algo or "2048" in line:
                    key_size = 2048
                elif "4096" in algo or "4096" in line:
                    key_size = 4096
                elif "128" in algo:
                    key_size = 128
                elif "256" in algo:
                    key_size = 256
                elif "512" in algo:
                    key_size = 512
                elif "56" in algo or "DES" in algo and "3DES" not in algo:
                    key_size = 56

                mode = None
                if "ECB" in line:
                    mode = "ECB"
                elif "CBC" in line:
                    mode = "CBC"
                elif "GCM" in line:
                    mode = "GCM"
                elif "CTR" in line:
                    mode = "CTR"

                findings.append({
                    "raw_id": str(uuid.uuid4()),
                    "type": rule["type"],
                    "algorithm": algo,
                    "key_size": key_size,
                    "mode_padding": mode,
                    "file": filepath,
                    "line": line_idx,
                    "column": m.start() + 1,
                    "snippet": line.strip(),
                    "library": rule["library"],
                    "confidence": rule["confidence"],
                    "language": "Python"
                })

    return findings
