"""
api/router.py
-------------
Main API router — aggregates all feature-specific routers.

To add a new feature, simply:
  1. Create api/routes/your_feature.py with a FastAPI APIRouter
  2. Import it here and add: api_router.include_router(your_feature.router)
"""
from fastapi import APIRouter

from api.routes import applications, companies, jobs, users

api_router = APIRouter(prefix="/api")

api_router.include_router(users.router)
api_router.include_router(companies.router)
api_router.include_router(jobs.router)
api_router.include_router(applications.router)
