"""
main.py
-------
ReadyMed FastAPI Application — Entry Point

Run locally with:
    uvicorn main:app --reload --port 5000

The interactive API docs are automatically available at:
    http://localhost:5000/docs      (Swagger UI)
    http://localhost:5000/redoc     (ReDoc)
"""
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from api.router import api_router
from core.config import ALLOWED_ORIGINS

app = FastAPI(
    title="ReadyMed API",
    description="Backend API for the ReadyMed healthcare recruitment platform.",
    version="2.0.0",
)

# ---------------------------------------------------------------------------
# CORS Middleware
# Allows the frontend (Vite dev server + Netlify) to call this backend.
# ---------------------------------------------------------------------------
app.add_middleware(
    CORSMiddleware,
    allow_origins=ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ---------------------------------------------------------------------------
# Routers
# ---------------------------------------------------------------------------
app.include_router(api_router)


# ---------------------------------------------------------------------------
# Health Check
# ---------------------------------------------------------------------------
@app.get("/api/health", tags=["Health"])
async def health_check():
    """Returns a simple OK response. Used by deployment platforms (e.g. Render)
    to verify the service is alive."""
    return {"status": "ok", "message": "ReadyMed API is running"}
