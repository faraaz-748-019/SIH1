package com.enterprise.payment;

import javax.crypto.Cipher;
import javax.crypto.spec.SecretKeySpec;

public class PaymentGateway {
    // VULNERABILITY: Hardcoded static symmetric key for payment tokens
    private static final String HARDCODED_PAYMENT_KEY = "3DES_SECRET_TOKEN_991823";

    public byte[] encryptCreditCard(byte[] panData) throws Exception {
        // VULNERABILITY: TripleDES (3DES) is deprecated and phase-out mandated by NIST
        SecretKeySpec key = new SecretKeySpec(HARDCODED_PAYMENT_KEY.getBytes(), "DESede");
        Cipher cipher = Cipher.getInstance("DESede/CBC/PKCS5Padding");
        cipher.init(Cipher.ENCRYPT_MODE, key);
        return cipher.doFinal(panData);
    }
}
