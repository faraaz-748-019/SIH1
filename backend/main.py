import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager

from .db import init_db, list_all_scans
from .routers.scan import router as scan_router, process_scan_directory
from .routers.ai_chat import router as ai_router

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Initialize DB and seed demo scan if empty
    init_db()
    scans = list_all_scans()
    if not scans:
        demo_path = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "demo_repo"))
        if os.path.exists(demo_path):
            print(f"[CRYPTOSCOPE] Pre-seeding demo scan from {demo_path}...")
            process_scan_directory(
                target_dir=demo_path,
                scan_name="Enterprise-Core-Repository",
                target_type="demo",
                target_ref="demo_repo/"
            )
            print("[CRYPTOSCOPE] Demo scan seeded successfully.")
    yield

app = FastAPI(
    title="CRYPTOSCOPE API",
    description="Enterprise Cryptographic Discovery & Quantum/PQC Risk Analysis Engine",
    version="2.4.0",
    lifespan=lifespan
)

# Enable CORS for frontend Vite dev server & production
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(scan_router)
app.include_router(ai_router)

@app.get("/")
def root():
    return {
        "app": "CRYPTOSCOPE",
        "description": "Enterprise Cryptographic Discovery & Post-Quantum Analysis Tool",
        "status": "healthy",
        "endpoints": {
            "docs": "/docs",
            "demo_scan": "/api/scan/demo",
            "scans_list": "/api/scan/list"
        }
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("backend.main:app", host="0.0.0.0", port=8000, reload=True)
