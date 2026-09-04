const API_BASE = "http://localhost:8000/api";

export async function fetchScanList() {
  const res = await fetch(`${API_BASE}/scan/list`);
  if (!res.ok) throw new Error("Failed to fetch scan list");
  return res.json();
}

export async function fetchScanDetails(scanId) {
  const res = await fetch(`${API_BASE}/scan/${scanId}`);
  if (!res.ok) throw new Error("Failed to fetch scan details");
  return res.json();
}

export async function triggerDemoScan() {
  const res = await fetch(`${API_BASE}/scan/demo`);
  if (!res.ok) throw new Error("Failed to run demo scan");
  return res.json();
}

export async function uploadZipScan(formData) {
  const res = await fetch(`${API_BASE}/scan/upload`, {
    method: "POST",
    body: formData,
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: "Upload failed" }));
    throw new Error(err.detail || "Upload scan failed");
  }
  return res.json();
}

export async function gitRepoScan(repoUrl, scanName) {
  const formData = new FormData();
  formData.append("repo_url", repoUrl);
  if (scanName) formData.append("scan_name", scanName);

  const res = await fetch(`${API_BASE}/scan/github`, {
    method: "POST",
    body: formData,
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: "Git clone failed" }));
    throw new Error(err.detail || "Git scan failed");
  }
  return res.json();
}

export async function queryAiAssistant(scanId, query) {
  const res = await fetch(`${API_BASE}/ai/chat`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ scan_id: scanId, query }),
  });
  if (!res.ok) throw new Error("Failed to query AI assistant");
  return res.json();
}

export function getReportDownloadUrl(scanId, format = "pdf") {
  return `${API_BASE}/scan/${scanId}/report/${format}`;
}
