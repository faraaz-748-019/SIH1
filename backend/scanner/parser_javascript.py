import re
import uuid
from typing import List, Dict, Any

JS_CRYPTO_PATTERNS = [
    # crypto.createCipher (deprecated)
    {
        "pattern": r'crypto\.createCipher\s*\(\s*["\']([^"\']+)["\']',
        "type": "algorithm",
        "algorithm_extractor": lambda m: f"Deprecated-{m.group(1).upper()}",
        "library": "node:crypto (deprecated)",
        "confidence": 0.99
    },
    # crypto.createCipheriv(...)
    {
        "pattern": r'crypto\.createCipheriv\s*\(\s*["\']([^"\']+)["\']',
        "type": "algorithm",
        "algorithm_extractor": lambda m: m.group(1).upper(),
        "library": "node:crypto",
        "confidence": 0.99
    },
    # crypto.createHash('sha1' / 'md5' / 'sha256')
    {
        "pattern": r'crypto\.createHash\s*\(\s*["\']([^"\']+)["\']',
        "type": "algorithm",
        "algorithm_extractor": lambda m: m.group(1).upper(),
        "library": "node:crypto",
        "confidence": 0.99
    },
    # CryptoJS.DES / CryptoJS.MD5 / CryptoJS.AES / CryptoJS.SHA1
    {
        "pattern": r'CryptoJS\.(DES|TripleDES|AES|MD5|SHA1|SHA256|RC4|Rabbit)',
        "type": "algorithm",
        "algorithm_extractor": lambda m: f"CryptoJS-{m.group(1)}",
        "library": "crypto-js",
        "confidence": 0.98
    },
    # WebCrypto subtle.generateKey / encrypt / sign
    {
        "pattern": r'crypto\.subtle\.(?:generateKey|encrypt|sign|digest)\s*\(\s*(?:{\s*name:\s*["\']([^"\']+)["\']|["\']([^"\']+)["\'])',
        "type": "algorithm",
        "algorithm_extractor": lambda m: (m.group(1) or m.group(2)).upper(),
        "library": "WebCrypto SubtleCrypto",
        "confidence": 0.97
    },
    # JWT signing
    {
        "pattern": r'jwt\.sign\s*\([^,]+,[^,]+(?:,\s*{\s*algorithm:\s*["\']([^"\']+)["\'])?',
        "type": "protocol",
        "algorithm_extractor": lambda m: f"JWT-{m.group(1) or 'HS256'}",
        "library": "jsonwebtoken",
        "confidence": 0.95
    },
    # Hardcoded secrets / keys
    {
        "pattern": r'(?:(?:const|let|var)\s+[a-zA-Z0-9_]*(?:SECRET|KEY|PASSWORD|TOKEN)\s*=\s*["\'][^"\']{10,}["\'])',
        "type": "key",
        "algorithm_extractor": lambda m: "Hardcoded-Key/Secret",
        "library": "Built-in / Static Variable",
        "confidence": 0.95
    }
]

def parse_javascript_file(filepath: str, content: str) -> List[Dict[str, Any]]:
    findings = []
    lines = content.splitlines()

    for line_idx, line in enumerate(lines, start=1):
        for rule in JS_CRYPTO_PATTERNS:
            for m in re.finditer(rule["pattern"], line, re.IGNORECASE):
                try:
                    algo = rule["algorithm_extractor"](m)
                except Exception:
                    algo = "Unknown-JS-Crypto"

                key_size = None
                if "1024" in algo or "1024" in line:
                    key_size = 1024
                elif "2048" in algo or "2048" in line:
                    key_size = 2048
                elif "128" in algo or "128" in line:
                    key_size = 128
                elif "256" in algo or "256" in line:
                    key_size = 256
                elif "DES" in algo:
                    key_size = 56
                elif "RC4" in algo:
                    key_size = 128

                findings.append({
                    "raw_id": str(uuid.uuid4()),
                    "type": rule["type"],
                    "algorithm": algo,
                    "key_size": key_size,
                    "mode_padding": "CBC" if "CBC" in algo or "cbc" in line else ("ECB" if "ECB" in algo or "ecb" in line else None),
                    "file": filepath,
                    "line": line_idx,
                    "column": m.start() + 1,
                    "snippet": line.strip(),
                    "library": rule["library"],
                    "confidence": rule["confidence"],
                    "language": "JavaScript/TypeScript"
                })

    return findings
