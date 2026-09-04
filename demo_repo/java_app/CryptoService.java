package com.enterprise.security;

import javax.crypto.Cipher;
import javax.crypto.KeyGenerator;
import javax.crypto.SecretKey;
import javax.crypto.spec.SecretKeySpec;
import java.security.KeyPair;
import java.security.KeyPairGenerator;
import java.security.MessageDigest;
import java.security.Security;
import org.bouncycastle.jce.provider.BouncyCastleProvider;

public class CryptoService {

    static {
        Security.addProvider(new BouncyCastleProvider());
    }

    public static byte[] encryptDES(byte[] data, byte[] keyBytes) throws Exception {
        // VULNERABILITY: DES with ECB mode and PKCS5Padding
        SecretKey secretKey = new SecretKeySpec(keyBytes, "DES");
        Cipher cipher = Cipher.getInstance("DES/ECB/PKCS5Padding");
        cipher.init(Cipher.ENCRYPT_MODE, secretKey);
        return cipher.doFinal(data);
    }

    public static byte[] hashMD5(String input) throws Exception {
        // VULNERABILITY: MD5 collision weakness
        MessageDigest md = MessageDigest.getInstance("MD5");
        return md.digest(input.getBytes());
    }

    public static KeyPair generateLegacyRSAKeyPair() throws Exception {
        // VULNERABILITY: RSA 1024 bit key size is insecure and quantum vulnerable
        KeyPairGenerator kpg = KeyPairGenerator.getInstance("RSA");
        kpg.initialize(1024);
        return kpg.generateKeyPair();
    }
}
