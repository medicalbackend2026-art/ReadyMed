"""src/api/v1/router.py

Aggregates all v1 endpoints under the /api prefix.
"""

from fastapi import APIRouter

from src.api.v1.endpoints import applications, companies, jobs, users

api_router = APIRouter(prefix="/api")

api_router.include_router(users.router)
api_router.include_router(companies.router)
api_router.include_router(jobs.router)
api_router.include_router(applications.router)
