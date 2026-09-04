# 🛡️ CRYPTOSCOPE — Enterprise Cryptographic Discovery & PQC Analysis Engine
> **Smart India Hackathon (SIH) Problem Statement 26164**  
> *Next-Generation Cryptographic Bill of Materials (CBOM), Quantum Threat Scoring & Dependency Graph Analysis*

---

## 🌟 Overview & Key Differentiator

**CRYPTOSCOPE** is a modern, enterprise-grade cryptographic discovery and analysis platform. While conventional scanners merely output a static list of ciphers, CRYPTOSCOPE maps the **entire multi-tier dependency topology** (`Algorithm → Library → File → Service → App`) and evaluates:
1. **What breaks if a cryptographic asset is modified or sunset?** (Cascading blast radius calculation).
2. **When will quantum computers compromise existing ciphertexts?** (Mosca's Theorem mathematical timeline analysis).
3. **How to migrate to NIST Post-Quantum Cryptography (FIPS 203 ML-KEM, FIPS 204 ML-DSA, FIPS 205 SLH-DSA)?** (Interactive phased playbooks with latency/cost tradeoffs).

---

## 🚀 Key Features

| Feature | Description |
| :--- | :--- |
| **🔍 Multi-Language Scanner** | Parses Python, Java, JavaScript/TypeScript, Go, X.509 certs, and package manifests (`requirements.txt`, `package.json`, `pom.xml`, `go.mod`) via AST and pattern matching. |
| **📋 Unified CBOM Schema** | Normalizes all findings into a standardized Cryptographic Bill of Materials JSON structure. |
| **🕸️ Interactive Dependency Graph** | Cytoscape.js visual graph detailing the full chain of cryptographic custody across microservices. |
| **💥 Blast Radius Engine** | 1-click impact calculator showing affected files, libraries, services, and plain-English operational summaries. |
| **⚖️ 4-Factor Risk Engine** | Weighted scoring formula factoring in Algorithm Weakness (40 pts) + Exposure/Hardcoding (20 pts) + Centrality (20 pts) + Quantum Vulnerability (20 pts). |
| **⚛️ Mosca's Theorem PQC Calculator** | Dynamic simulator evaluating data shelf-life ($X$) + migration duration ($Y$) against time-to-Q-Day ($Z$). |
| **🗺️ NIST PQC Migration Playbook** | Prescriptive transition pathways from RSA/ECDSA/DES to ML-KEM-768, ML-DSA-65, and AES-256-GCM. |
| **📄 Exportable CBOM Reports** | 1-click downloads for standardized audit reports in **PDF** (via ReportLab) and **JSON** formats. |
| **🤖 Grounded AI Copilot** | Context-grounded conversational assistant that explains findings, risk factors, and remediation steps without hallucinations. |

---

## 🛠️ Technology Stack (100% Free & Open-Source)

- **Frontend:** React, Tailwind CSS v3, Cytoscape.js, Cytoscape-Dagre, Recharts, Lucide Icons, Vite
- **Backend:** Python, FastAPI, Uvicorn, SQLite, NetworkX, Cryptography, ReportLab
- **Runtimes:** Python 3.10+, Node.js 18+

---

## ⚡ Quick Start (Single Command)

### 1. Launch Frontend & Backend
Run the launcher from the project root:
```bash
# Windows
start.bat
# Or using Python:
python run_app.py
```

### 2. Access the Application
- **Frontend Dashboard:** [http://localhost:5173](http://localhost:5173)
- **FastAPI Backend:** [http://localhost:8000](http://localhost:8000)
- **Interactive Swagger Docs:** [http://localhost:8000/docs](http://localhost:8000/docs)

---

## 🧪 Demo Dataset Included

The application is pre-seeded with a synthetic enterprise codebase (`demo_repo/`) showcasing:
- **Critical Risks:** RSA-1024 signing (`auth.py`), Single-DES 56-bit encryption (`crypto_utils.py`), Hardcoded private keys, Insecure TLS 1.0 & `InsecureSkipVerify: true` (`tls_client.go`), Expired X.509 certs.
- **Medium/High Risks:** AES-128 in ECB mode, MD5/SHA-1 hashing, Deprecated crypto APIs, Vulnerable dependencies (`pycryptodome 3.9.0`, `bcprov-jdk15on 1.50`).
- **Quantum-Safe:** AES-256-GCM, SHA-384, Hybrid ML-KEM-768 (`pqc_ready_service.py`).

---

## 📐 Mosca's Theorem Risk Logic

$$\text{If } X + Y > Z \implies \text{Harvest Now, Decrypt Later (HNDL) Threat}$$
- **$X$ (Data Lifetime):** 10 Years (duration confidential financial/identity records must remain secure)
- **$Y$ (Migration Time):** 4 Years (time required to re-engineer, test, and deploy PQC across enterprise services)
- **$Z$ (Quantum Horizon):** 7 Years (estimated arrival of Cryptanalytically Relevant Quantum Computers)
- **Condition:** $10 + 4 = 14 \text{ years} > 7 \text{ years} \implies$ **Urgent Migration Mandate**.
