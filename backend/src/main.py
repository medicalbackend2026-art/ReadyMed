"""src/main.py

ReadyMed FastAPI Application — Entry Point (new structure)

Run locally with either:
  - uvicorn main:app --reload --port 5000        (legacy wrapper)
  - uvicorn src.main:app --reload --port 5000    (direct)

Docs:
  http://localhost:5000/docs
"""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from src.api.v1.router import api_router
from src.core.config import ALLOWED_ORIGINS

app = FastAPI(
    title="ReadyMed API",
    description="Backend API for the ReadyMed healthcare recruitment platform.",
    version="2.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(api_router)


@app.get("/api/health", tags=["Health"])
async def health_check():
    return {"status": "ok", "message": "ReadyMed API is running"}
