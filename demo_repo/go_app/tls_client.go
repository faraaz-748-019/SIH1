package main

import (
	"crypto/des"
	"crypto/md5"
	"crypto/tls"
	"fmt"
	"net/http"
)

func createInsecureClient() *http.Client {
	// VULNERABILITY: InsecureSkipVerify: true + VersionTLS10 + Legacy RSA cipher suite
	tlsConfig := &tls.Config{
		InsecureSkipVerify: true,
		MinVersion:         tls.VersionTLS10,
		CipherSuites: []uint16{
			tls.TLS_RSA_WITH_RC4_128_SHA,
			tls.TLS_RSA_WITH_AES_128_CBC_SHA,
		},
	}

	transport := &http.Transport{
		TLSClientConfig: tlsConfig,
	}

	return &http.Client{Transport: transport}
}

func legacyGoHash(data []byte) [16]byte {
	// VULNERABILITY: MD5 usage
	return md5.Sum(data)
}

func legacyGoDES(key []byte) {
	// VULNERABILITY: DES usage
	_, _ = des.NewCipher(key)
}

func main() {
	fmt.Println("TLS Insecure Client Initialized")
}
