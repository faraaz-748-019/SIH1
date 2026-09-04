const crypto = require('crypto');

// VULNERABILITY: Hardcoded secret and legacy cipher API
const MASTER_SECRET = 'super_secret_corporate_aes_key_123';
const STATIC_IV = '0000000000000000';

function encryptPayload(text) {
    // VULNERABILITY: crypto.createCipher is deprecated (uses EVP_BytesToKey with MD5)
    const cipher = crypto.createCipher('aes-128-cbc', MASTER_SECRET);
    let encrypted = cipher.update(text, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    return encrypted;
}

function calculateLegacyChecksum(data) {
    // VULNERABILITY: SHA-1 for checksum/integrity is deprecated
    const hash = crypto.createHash('sha1');
    hash.update(data);
    return hash.digest('hex');
}

function rc4StreamEncrypt(text, key) {
    // VULNERABILITY: RC4 stream cipher is broken and forbidden
    const cipher = crypto.createCipheriv('rc4', key, '');
    let crypted = cipher.update(text, 'utf8', 'hex');
    crypted += cipher.final('hex');
    return crypted;
}

module.exports = { encryptPayload, calculateLegacyChecksum, rc4StreamEncrypt };
