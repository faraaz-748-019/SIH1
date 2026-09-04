import re
import uuid
from typing import List, Dict, Any

GO_CRYPTO_PATTERNS = [
    # InsecureSkipVerify: true
    {
        "pattern": r'InsecureSkipVerify:\s*(true)',
        "type": "protocol",
        "algorithm_extractor": lambda m: "TLS-InsecureSkipVerify-Enabled",
        "library": "crypto/tls",
        "confidence": 0.99
    },
    # MinVersion: tls.VersionTLS10 or tls.VersionTLS11
    {
        "pattern": r'MinVersion:\s*tls\.(VersionTLS10|VersionTLS11|VersionTLS12|VersionTLS13)',
        "type": "protocol",
        "algorithm_extractor": lambda m: f"TLS-{m.group(1).replace('Version', '')}",
        "library": "crypto/tls",
        "confidence": 0.99
    },
    # Cipher suites
    {
        "pattern": r'tls\.(TLS_RSA_WITH_[A-Z0-9_]+|TLS_ECDHE_[A-Z0-9_]+)',
        "type": "algorithm",
        "algorithm_extractor": lambda m: m.group(1),
        "library": "crypto/tls",
        "confidence": 0.98
    },
    # des.NewCipher / des.NewTripleDESCipher
    {
        "pattern": r'des\.(NewCipher|NewTripleDESCipher)\s*\(',
        "type": "algorithm",
        "algorithm_extractor": lambda m: "DES" if m.group(1) == "NewCipher" else "3DES",
        "library": "crypto/des",
        "confidence": 0.99
    },
    # md5.New / md5.Sum / sha1.New
    {
        "pattern": r'(md5|sha1|sha256|sha512)\.(?:New|Sum)\s*\(',
        "type": "algorithm",
        "algorithm_extractor": lambda m: m.group(1).upper(),
        "library": f"crypto/{m.group(1) if 'm' in locals() else 'hash'}",
        "confidence": 0.99
    },
    # rsa.GenerateKey
    {
        "pattern": r'rsa\.GenerateKey\s*\([^,]+,\s*(\d+)\s*\)',
        "type": "algorithm",
        "algorithm_extractor": lambda m: f"RSA-{m.group(1)}",
        "library": "crypto/rsa",
        "confidence": 0.99
    },
    # ecdsa.GenerateKey
    {
        "pattern": r'ecdsa\.GenerateKey\s*\(\s*elliptic\.(P224|P256|P384|P521)',
        "type": "algorithm",
        "algorithm_extractor": lambda m: f"ECDSA-{m.group(1)}",
        "library": "crypto/ecdsa",
        "confidence": 0.98
    },
    # chacha20poly1305 / aes.NewCipher
    {
        "pattern": r'(chacha20poly1305\.New|aes\.NewCipher)\s*\(',
        "type": "algorithm",
        "algorithm_extractor": lambda m: "ChaCha20-Poly1305" if "chacha" in m.group(1) else "AES",
        "library": "crypto/aes or x/crypto",
        "confidence": 0.98
    }
]

def parse_go_file(filepath: str, content: str) -> List[Dict[str, Any]]:
    findings = []
    lines = content.splitlines()

    for line_idx, line in enumerate(lines, start=1):
        for rule in GO_CRYPTO_PATTERNS:
            for m in re.finditer(rule["pattern"], line, re.IGNORECASE):
                try:
                    algo = rule["algorithm_extractor"](m)
                except Exception:
                    algo = "Go-Crypto"

                key_size = None
                if "1024" in algo:
                    key_size = 1024
                elif "2048" in algo:
                    key_size = 2048
                elif "128" in algo:
                    key_size = 128
                elif "256" in algo or "P256" in algo:
                    key_size = 256
                elif "384" in algo or "P384" in algo:
                    key_size = 384
                elif "DES" in algo and "3DES" not in algo:
                    key_size = 56
                elif "3DES" in algo:
                    key_size = 168

                findings.append({
                    "raw_id": str(uuid.uuid4()),
                    "type": rule["type"],
                    "algorithm": algo,
                    "key_size": key_size,
                    "mode_padding": None,
                    "file": filepath,
                    "line": line_idx,
                    "column": m.start() + 1,
                    "snippet": line.strip(),
                    "library": rule["library"],
                    "confidence": rule["confidence"],
                    "language": "Go"
                })

    return findings
