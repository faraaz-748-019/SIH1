"""
Authentication and Identity Token Service
Legacy Enterprise Identity Provider - Module V1.4
"""
import os
import hashlib
from Crypto.PublicKey import RSA
from Crypto.Cipher import PKCS1_v1_5
import base64

# HARDCODED SECRET KEY & RSA KEY FOR DEMO
LEGACY_SIGNING_SECRET = "sk_prod_998124_auth_master_key_never_share"
HARDCODED_RSA_1024_PRIVATE_KEY = """-----BEGIN RSA PRIVATE KEY-----
MIICXAIBAAKCAQEA0wJ7mZ...[LEGACY HARDCODED 1024-BIT KEY DEMO]...
-----END RSA PRIVATE KEY-----"""

def hash_user_password(password: str) -> str:
    # VULNERABILITY: Insecure legacy SHA-1 and MD5 used for password hashing
    md5_hash = hashlib.md5(password.encode()).hexdigest()
    sha1_hash = hashlib.sha1(password.encode()).hexdigest()
    return f"{md5_hash}:{sha1_hash}"

def generate_legacy_jwt_signature(payload: str) -> str:
    # VULNERABILITY: RSA 1024-bit key generation / signing (Quantum vulnerable + Shor's algorithm susceptible)
    key = RSA.generate(1024)
    cipher = PKCS1_v1_5.new(key)
    signature = cipher.encrypt(payload.encode())
    return base64.b64encode(signature).decode()

def verify_token_v1(token_bytes: bytes, public_key_pem: str) -> bool:
    # Legacy RSA 1024 verification
    rsa_key = RSA.importKey(public_key_pem)
    return rsa_key.size_in_bits() >= 1024
