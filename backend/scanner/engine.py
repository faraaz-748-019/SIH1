import os
import glob
from typing import List, Dict, Any, Tuple

from .parser_python import parse_python_file
from .parser_java import parse_java_file
from .parser_javascript import parse_javascript_file
from .parser_go import parse_go_file
from .parser_deps import parse_dependency_manifest
from .parser_certs import parse_cert_file

IGNORED_DIRS = {
    ".git", ".svn", "node_modules", "vendor", "venv", ".venv", "env",
    "__pycache__", ".pytest_cache", "build", "dist", ".idea", ".vscode",
    "target", ".next", "bin", "obj"
}

IGNORED_EXTENSIONS = {
    ".png", ".jpg", ".jpeg", ".gif", ".ico", ".svg", ".woff", ".woff2",
    ".ttf", ".eot", ".mp4", ".zip", ".tar", ".gz", ".exe", ".dll", ".so",
    ".dylib", ".class", ".pyc", ".db", ".sqlite", ".bin"
}

def scan_directory(root_path: str) -> Tuple[List[Dict[str, Any]], int]:
    """
    Scans a directory tree and returns (raw_findings, total_files_scanned)
    """
    all_findings: List[Dict[str, Any]] = []
    total_files_scanned = 0

    for root, dirs, files in os.walk(root_path):
        # Filter directories in-place
        dirs[:] = [d for d in dirs if d not in IGNORED_DIRS and not d.startswith(".")]

        for filename in files:
            ext = os.path.splitext(filename)[1].lower()
            if ext in IGNORED_EXTENSIONS:
                continue

            full_path = os.path.join(root, filename)
            rel_path = os.path.relpath(full_path, root_path).replace("\\", "/")

            try:
                with open(full_path, "r", encoding="utf-8", errors="ignore") as f:
                    content = f.read()
            except Exception:
                continue

            total_files_scanned += 1
            file_findings: List[Dict[str, Any]] = []

            # Route based on extension or manifest name
            lower_name = filename.lower()
            if lower_name in ["requirements.txt", "package.json", "pom.xml", "go.mod"]:
                file_findings.extend(parse_dependency_manifest(rel_path, content))
            
            if ext in [".py"]:
                file_findings.extend(parse_python_file(rel_path, content))
            elif ext in [".java"]:
                file_findings.extend(parse_java_file(rel_path, content))
            elif ext in [".js", ".jsx", ".ts", ".tsx", ".mjs"]:
                file_findings.extend(parse_javascript_file(rel_path, content))
            elif ext in [".go"]:
                file_findings.extend(parse_go_file(rel_path, content))
            elif ext in [".pem", ".crt", ".cer", ".key"]:
                file_findings.extend(parse_cert_file(rel_path, content))

            all_findings.extend(file_findings)

    return all_findings, total_files_scanned
