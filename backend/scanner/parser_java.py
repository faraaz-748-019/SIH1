import re
import uuid
from typing import List, Dict, Any

JAVA_CRYPTO_PATTERNS = [
    # Cipher.getInstance("DES/...") or Cipher.getInstance("AES/...")
    {
        "pattern": r'Cipher\.getInstance\s*\(\s*["\']([^"\']+)["\']\s*\)',
        "type": "algorithm",
        "algorithm_extractor": lambda m: m.group(1),
        "library": "javax.crypto.Cipher",
        "confidence": 0.99
    },
    # MessageDigest.getInstance("MD5" / "SHA-1" / "SHA-256")
    {
        "pattern": r'MessageDigest\.getInstance\s*\(\s*["\']([^"\']+)["\']\s*\)',
        "type": "algorithm",
        "algorithm_extractor": lambda m: m.group(1).upper(),
        "library": "java.security.MessageDigest",
        "confidence": 0.99
    },
    # KeyPairGenerator.getInstance("RSA" / "EC" / "DiffieHellman")
    {
        "pattern": r'KeyPairGenerator\.getInstance\s*\(\s*["\']([^"\']+)["\']\s*\)',
        "type": "algorithm",
        "algorithm_extractor": lambda m: m.group(1).upper(),
        "library": "java.security.KeyPairGenerator",
        "confidence": 0.98
    },
    # KeyGenerator.getInstance(...)
    {
        "pattern": r'KeyGenerator\.getInstance\s*\(\s*["\']([^"\']+)["\']\s*\)',
        "type": "algorithm",
        "algorithm_extractor": lambda m: m.group(1).upper(),
        "library": "javax.crypto.KeyGenerator",
        "confidence": 0.98
    },
    # SecretKeySpec(..., "DES" / "AES" / "Blowfish" / "DESede")
    {
        "pattern": r'new\s+SecretKeySpec\s*\([^,]+,\s*["\']([^"\']+)["\']\s*\)',
        "type": "algorithm",
        "algorithm_extractor": lambda m: m.group(1).upper(),
        "library": "javax.crypto.spec.SecretKeySpec",
        "confidence": 0.97
    },
    # Key size initialization e.g. initialize(1024)
    {
        "pattern": r'\.initialize\s*\(\s*(\d{3,4})\s*\)',
        "type": "key",
        "algorithm_extractor": lambda m: f"KeySize-{m.group(1)}",
        "library": "java.security",
        "confidence": 0.95
    },
    # BouncyCastle Provider usage
    {
        "pattern": r'(?:BouncyCastleProvider|new\s+BouncyCastleProvider)',
        "type": "library",
        "algorithm_extractor": lambda m: "BouncyCastle-Provider",
        "library": "org.bouncycastle",
        "confidence": 0.96
    },
    # Hardcoded secrets
    {
        "pattern": r'(?:String\s+[a-zA-Z0-9_]*(?:SECRET|KEY|PASSWORD|TOKEN)\s*=\s*["\'][^"\']{8,}["\'])',
        "type": "key",
        "algorithm_extractor": lambda m: "Hardcoded-Key/Secret",
        "library": "Built-in / Static Field",
        "confidence": 0.95
    }
]

def parse_java_file(filepath: str, content: str) -> List[Dict[str, Any]]:
    findings = []
    lines = content.splitlines()

    for line_idx, line in enumerate(lines, start=1):
        for rule in JAVA_CRYPTO_PATTERNS:
            for m in re.finditer(rule["pattern"], line, re.IGNORECASE):
                try:
                    algo = rule["algorithm_extractor"](m)
                except Exception:
                    algo = "Unknown"

                key_size = None
                if "1024" in algo or "1024" in line:
                    key_size = 1024
                elif "2048" in algo or "2048" in line:
                    key_size = 2048
                elif "4096" in algo or "4096" in line:
                    key_size = 4096
                elif "128" in algo or "128" in line:
                    key_size = 128
                elif "256" in algo or "256" in line:
                    key_size = 256
                elif "DESede" in algo or "3DES" in algo or "TripleDES" in algo:
                    key_size = 168
                elif "DES" in algo:
                    key_size = 56
                elif "Blowfish" in algo:
                    key_size = 128

                mode = None
                if "ECB" in line or "ECB" in algo:
                    mode = "ECB"
                elif "CBC" in line or "CBC" in algo:
                    mode = "CBC"
                elif "GCM" in line or "GCM" in algo:
                    mode = "GCM"
                elif "CTR" in line or "CTR" in algo:
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
                    "language": "Java"
                })

    return findings
