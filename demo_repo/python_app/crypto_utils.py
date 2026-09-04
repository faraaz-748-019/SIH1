"""
Cryptographic Utilities Module - Internal Data Storage
"""
from Crypto.Cipher import DES, AES
import base64

# VULNERABILITY: Hardcoded static IV and DES 56-bit symmetric key
STATIC_DES_KEY = b"8bytekey"  # 56-bit effective DES key
STATIC_AES_IV = b"0123456789abcdef"

def encrypt_legacy_field(data: str) -> str:
    # VULNERABILITY: Single DES is completely broken (brute-forceable)
    cipher = DES.new(STATIC_DES_KEY, DES.MODE_ECB)
    padded = data.ljust(8 * ((len(data) + 7) // 8))
    encrypted = cipher.encrypt(padded.encode())
    return base64.b64encode(encrypted).decode()

def encrypt_sensitive_record(data: str, key_128: bytes) -> str:
    # VULNERABILITY: AES-128 in ECB mode leaks structural patterns and is Grover vulnerable (64-bit quantum security)
    cipher = AES.new(key_128, AES.MODE_ECB)
    padded = data.ljust(16 * ((len(data) + 15) // 16))
    encrypted = cipher.encrypt(padded.encode())
    return base64.b64encode(encrypted).decode()
