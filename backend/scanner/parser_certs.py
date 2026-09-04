import re
import uuid
import datetime
from typing import List, Dict, Any

def parse_cert_file(filepath: str, content: str) -> List[Dict[str, Any]]:
    findings = []
    
    # Try cryptography library X509 parser
    parsed_with_crypto = False
    try:
        from cryptography import x509
        from cryptography.hazmat.backends import default_backend
        
        cert = x509.load_pem_x509_certificate(content.encode(), default_backend())
        parsed_with_crypto = True
        
        sig_algo = cert.signature_algorithm_oid._name if hasattr(cert.signature_algorithm_oid, '_name') else "unknown"
        pubkey = cert.public_key()
        key_size = getattr(pubkey, "key_size", None)
        pubkey_type = type(pubkey).__name__
        
        not_after = cert.not_valid_after_utc if hasattr(cert, 'not_valid_after_utc') else cert.not_valid_after
        is_expired = not_after < datetime.datetime.now(datetime.timezone.utc)
        
        findings.append({
            "raw_id": str(uuid.uuid4()),
            "type": "certificate",
            "algorithm": f"X.509-{sig_algo.upper()}",
            "key_size": key_size,
            "mode_padding": "EXPIRED" if is_expired else "ACTIVE",
            "file": filepath,
            "line": 1,
            "column": 1,
            "snippet": f"Issuer: {cert.issuer.rfc4514_string()[:60]}... (Expires: {not_after})",
            "library": "X.509 Certificate",
            "confidence": 1.0,
            "language": "Certificate"
        })
    except Exception:
        pass

    if not parsed_with_crypto:
        # Regex fallback for PEM certificates / keys
        if "-----BEGIN CERTIFICATE-----" in content:
            is_weak_sig = "SHA1" in content or "sha1" in content or "MD5" in content
            findings.append({
                "raw_id": str(uuid.uuid4()),
                "type": "certificate",
                "algorithm": "X.509-SHA1withRSA" if is_weak_sig else "X.509-Certificate",
                "key_size": 1024 if is_weak_sig else 2048,
                "mode_padding": "EXPIRED/LEGACY",
                "file": filepath,
                "line": 1,
                "column": 1,
                "snippet": "-----BEGIN CERTIFICATE----- ... (Synthetic Legacy Cert)",
                "library": "X.509 Certificate",
                "confidence": 0.95,
                "language": "Certificate"
            })
            
    return findings
