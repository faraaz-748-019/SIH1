"""
CRYPTOSCOPE — Single-Command Application Launcher
Starts both FastAPI backend (Port 8000) and Vite frontend (Port 5173).
"""
import os
import sys
import subprocess
import time
import webbrowser

ROOT_DIR = os.path.dirname(os.path.abspath(__file__))
PYTHON_EXE = sys.executable or "python"
NODE_PATH = r"C:\Program Files\nodejs"
if os.path.exists(NODE_PATH) and NODE_PATH not in os.environ.get("PATH", ""):
    os.environ["PATH"] = NODE_PATH + os.pathsep + os.environ.get("PATH", "")

def start_backend():
    print("[CRYPTOSCOPE] Starting FastAPI Backend on http://localhost:8000 ...")
    backend_cmd = [
        PYTHON_EXE, "-m", "uvicorn", "backend.main:app",
        "--host", "0.0.0.0", "--port", "8000"
    ]
    return subprocess.Popen(backend_cmd, cwd=ROOT_DIR)

def start_frontend():
    print("[CRYPTOSCOPE] Starting Vite Frontend on http://localhost:5173 ...")
    frontend_dir = os.path.join(ROOT_DIR, "frontend")
    npm_cmd = "npm.cmd" if sys.platform == "win32" else "npm"
    return subprocess.Popen([npm_cmd, "run", "dev"], cwd=frontend_dir, shell=(sys.platform == "win32"))

def main():
    print("=" * 60)
    print("  CRYPTOSCOPE — Enterprise Cryptographic Discovery & PQC Engine")
    print("  Smart India Hackathon (SIH) Problem 26164")
    print("=" * 60)

    backend_proc = start_backend()
    time.sleep(2)
    frontend_proc = start_frontend()

    time.sleep(2)
    print("\n[CRYPTOSCOPE] Application is live!")
    print("  --> Frontend UI: http://localhost:5173")
    print("  --> Backend API: http://localhost:8000")
    print("  --> Swagger Docs: http://localhost:8000/docs\n")

    try:
        webbrowser.open("http://localhost:5173")
    except Exception:
        pass

    try:
        while True:
            time.sleep(1)
    except KeyboardInterrupt:
        print("\n[CRYPTOSCOPE] Shutting down services...")
        backend_proc.terminate()
        frontend_proc.terminate()
        print("[CRYPTOSCOPE] Clean exit.")

if __name__ == "__main__":
    main()
