import json
import re
import uuid
import xml.etree.ElementTree as ET
from typing import List, Dict, Any

KNOWN_VULNERABLE_PACKAGES = {
    # Python
    "pycryptodome": {
        "vulnerable_before": "3.10.0",
        "reason": "Outdated PyCryptodome release with known timing and side-channel vulnerabilities",
        "criticality": "high"
    },
    "cryptography": {
        "vulnerable_before": "3.3.0",
        "reason": "Legacy version susceptible to buffer overflows and missing modern PQC primitives",
        "criticality": "critical"
    },
    "pyjwt": {
        "vulnerable_before": "2.0.0",
        "reason": "Vulnerable to algorithm confusion and key confusion attacks (CVE-2022-29217)",
        "criticality": "high"
    },
    # Java
    "bcprov-jdk15on": {
        "vulnerable_before": "1.70",
        "reason": "Bouncy Castle legacy provider vulnerable to EC timing attacks and padding oracle",
        "criticality": "critical"
    },
    "commons-codec": {
        "vulnerable_before": "1.15",
        "reason": "Old Apache Commons Codec with weak digest helpers and deprecated SHA-1/MD5 usage",
        "criticality": "medium"
    },
    # JS
    "crypto-js": {
        "vulnerable_before": "4.0.0",
        "reason": "Client-side crypto-js with weak PRNG seeding in older versions and insecure defaults",
        "criticality": "high"
    },
    "node-forge": {
        "vulnerable_before": "1.3.0",
        "reason": "Vulnerable to RSA PKCS#1 v1.5 signature verification bypass (CVE-2022-0122)",
        "criticality": "critical"
    },
    "jsonwebtoken": {
        "vulnerable_before": "9.0.0",
        "reason": "Insecure key verification flaw in historic releases",
        "criticality": "high"
    },
    # Go
    "golang.org/x/crypto": {
        "vulnerable_before": "v0.17.0",
        "reason": "Vulnerabilities in SSH, ChaCha20, and OpenPGP implementations prior to v0.17.0",
        "criticality": "medium"
    }
}

def parse_dependency_manifest(filepath: str, content: str) -> List[Dict[str, Any]]:
    findings = []
    filename = filepath.replace("\\", "/").split("/")[-1].lower()

    if filename == "requirements.txt":
        for line_idx, line in enumerate(content.splitlines(), start=1):
            line_clean = line.strip()
            if not line_clean or line_clean.startswith("#"):
                continue
            match = re.match(r'^([a-zA-Z0-9_\-]+)\s*(?:==|>=|<=|~=)\s*([0-9a-zA-Z\.\-]+)', line_clean)
            if match:
                pkg, ver = match.group(1).lower(), match.group(2)
                if pkg in KNOWN_VULNERABLE_PACKAGES:
                    meta = KNOWN_VULNERABLE_PACKAGES[pkg]
                    findings.append({
                        "raw_id": str(uuid.uuid4()),
                        "type": "library",
                        "algorithm": f"Vulnerable-Dep: {pkg}@{ver}",
                        "key_size": None,
                        "mode_padding": None,
                        "file": filepath,
                        "line": line_idx,
                        "column": 1,
                        "snippet": line_clean,
                        "library": f"{pkg} ({ver})",
                        "confidence": 0.95,
                        "language": "Python Manifest",
                        "extra": meta
                    })

    elif filename == "package.json":
        try:
            data = json.loads(content)
            deps = {**data.get("dependencies", {}), **data.get("devDependencies", {})}
            for pkg, ver in deps.items():
                pkg_lower = pkg.lower()
                if pkg_lower in KNOWN_VULNERABLE_PACKAGES:
                    meta = KNOWN_VULNERABLE_PACKAGES[pkg_lower]
                    findings.append({
                        "raw_id": str(uuid.uuid4()),
                        "type": "library",
                        "algorithm": f"Vulnerable-Dep: {pkg}@{ver}",
                        "key_size": None,
                        "mode_padding": None,
                        "file": filepath,
                        "line": 1,
                        "column": 1,
                        "snippet": f'"{pkg}": "{ver}"',
                        "library": f"{pkg} ({ver})",
                        "confidence": 0.95,
                        "language": "Node.js Manifest",
                        "extra": meta
                    })
        except Exception:
            pass

    elif filename == "pom.xml":
        try:
            root = ET.fromstring(content)
            # Find dependencies ignoring namespaces
            for dep in root.findall(".//{*}dependency"):
                group_id_el = dep.find("{*}groupId")
                art_id_el = dep.find("{*}artifactId")
                ver_el = dep.find("{*}version")
                
                art_id = art_id_el.text if art_id_el is not None and art_id_el.text else ""
                ver = ver_el.text if ver_el is not None and ver_el.text else "unknown"
                
                if art_id.lower() in KNOWN_VULNERABLE_PACKAGES:
                    meta = KNOWN_VULNERABLE_PACKAGES[art_id.lower()]
                    findings.append({
                        "raw_id": str(uuid.uuid4()),
                        "type": "library",
                        "algorithm": f"Vulnerable-Dep: {art_id}@{ver}",
                        "key_size": None,
                        "mode_padding": None,
                        "file": filepath,
                        "line": 1,
                        "column": 1,
                        "snippet": f"<artifactId>{art_id}</artifactId><version>{ver}</version>",
                        "library": f"{art_id} ({ver})",
                        "confidence": 0.95,
                        "language": "Maven Manifest",
                        "extra": meta
                    })
        except Exception:
            pass

    elif filename == "go.mod":
        for line_idx, line in enumerate(content.splitlines(), start=1):
            for pkg in KNOWN_VULNERABLE_PACKAGES:
                if pkg in line:
                    meta = KNOWN_VULNERABLE_PACKAGES[pkg]
                    findings.append({
                        "raw_id": str(uuid.uuid4()),
                        "type": "library",
                        "algorithm": f"Vulnerable-Dep: {pkg}",
                        "key_size": None,
                        "mode_padding": None,
                        "file": filepath,
                        "line": line_idx,
                        "column": 1,
                        "snippet": line.strip(),
                        "library": pkg,
                        "confidence": 0.90,
                        "language": "Go Manifest",
                        "extra": meta
                    })

    return findings
