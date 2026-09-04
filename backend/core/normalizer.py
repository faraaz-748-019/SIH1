import uuid
from typing import List, Dict, Any

def normalize_findings(raw_findings: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
    """
    Standardizes findings into unified JSON schema:
    asset_id, type, algorithm, key_size, mode_padding, location, library, confidence
    """
    normalized = []
    seen_keys = set()

    for item in raw_findings:
        file_path = item.get("file", "unknown")
        line_num = item.get("line", 1)
        algo = item.get("algorithm", "UNKNOWN")
        asset_type = item.get("type", "algorithm")

        # Deduplicate identical findings on same line
        dedup_key = f"{file_path}:{line_num}:{algo}"
        if dedup_key in seen_keys:
            continue
        seen_keys.add(dedup_key)

        asset_id = f"ast-{uuid.uuid4().hex[:8]}"

        normalized.append({
            "asset_id": asset_id,
            "type": asset_type,
            "algorithm": algo,
            "key_size": item.get("key_size"),
            "mode_padding": item.get("mode_padding"),
            "location": {
                "file": file_path,
                "line": line_num,
                "column": item.get("column", 1),
                "snippet": item.get("snippet", "")
            },
            "library": item.get("library", "Unknown"),
            "confidence": item.get("confidence", 0.9),
            "language": item.get("language", "Generic"),
            "extra": item.get("extra", {})
        })

    return normalized
