"""src/api/v1/endpoints/applications.py

Endpoints for viewing and managing job applications.

Routes:
  GET   /api/applications/mine          — candidate's own submitted applications
  GET   /api/applications/for-recruiter — all applications for this recruiter's jobs
  GET   /api/applications/job/{job_id}  — all applications for a specific job (recruiter)
  GET   /api/applications/debug         — DEBUG: show application counts and info
  PATCH /api/applications/{id}/status   — recruiter updates application status
"""

from fastapi import APIRouter, Depends, HTTPException, status
from google.cloud.firestore_v1 import SERVER_TIMESTAMP

from src.core.firebase import firebase_db
from src.core.security import get_current_user

router = APIRouter(prefix="/applications", tags=["Applications"])


def _serialize_application(doc) -> dict:
    d = doc.to_dict()
    applied_at = d.get("appliedAt")
    return {
        "id": doc.id,
        **d,
        "appliedAt": applied_at.isoformat() if hasattr(applied_at, "isoformat") else None,
    }


@router.get("/mine", summary="Get candidate's own submitted applications")
async def get_my_applications(user: dict = Depends(get_current_user)):
    db = firebase_db()
    snap = db.collection("applications").where("applicantUid", "==", user["uid"]).stream()
    apps = [_serialize_application(doc) for doc in snap]
    apps.sort(key=lambda a: a.get("appliedAt") or "", reverse=True)
    return {"applications": apps}


@router.get("/for-recruiter", summary="Get all applications for a recruiter's jobs")
async def get_recruiter_applications(user: dict = Depends(get_current_user)):
    db = firebase_db()
    snap = db.collection("applications").where("recruiterUid", "==", user["uid"]).stream()
    apps = [_serialize_application(doc) for doc in snap]
    apps.sort(key=lambda a: a.get("appliedAt") or "", reverse=True)
    return {"applications": apps}


@router.get("/job/{job_id}", summary="Get all applications for a specific job")
async def get_applications_for_job(job_id: str, user: dict = Depends(get_current_user)):
    db = firebase_db()
    snap = db.collection("applications").where("jobId", "==", job_id).stream()
    apps = [_serialize_application(doc) for doc in snap]
    apps.sort(key=lambda a: a.get("appliedAt") or "", reverse=True)
    return {"applications": apps}


@router.patch("/{application_id}/status", summary="Update application status")
async def update_application_status(
    application_id: str,
    body: dict,
    user: dict = Depends(get_current_user),
):
    db = firebase_db()
    ref = db.collection("applications").document(application_id)
    doc = ref.get()
    if not doc.exists:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Application not found")
    if doc.to_dict().get("recruiterUid") != user["uid"]:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Forbidden")
    ref.update({"status": body.get("status"), "updatedAt": SERVER_TIMESTAMP})
    return {"success": True}


@router.get("/debug", summary="DEBUG: Get diagnostic info about applications")
async def debug_applications(user: dict = Depends(get_current_user)):
    """For debugging - shows application counts and info"""
    db = firebase_db()
    
    # Count all applications with this recruiter UID
    recruiter_apps = list(
        db.collection("applications").where("recruiterUid", "==", user["uid"]).stream()
    )
    
    # Count all applications that belong to this recruiter's jobs
    recruiter_jobs = list(
        db.collection("jobs").where("recruiterUid", "==", user["uid"]).stream()
    )
    job_ids = [doc.id for doc in recruiter_jobs]
    
    # Count applications for these jobs
    job_apps = []
    for job_id in job_ids:
        job_apps.extend(list(
            db.collection("applications").where("jobId", "==", job_id).stream()
        ))
    
    return {
        "recruiter_uid": user["uid"],
        "recruiter_email": user["email"],
        "recruiter_jobs_count": len(recruiter_jobs),
        "recruiter_apps_direct_count": len(recruiter_apps),
        "job_apps_count": len(job_apps),
        "jobs": [{"id": j.id, "title": j.to_dict().get("title"), "status": j.to_dict().get("status")} for j in recruiter_jobs],
        "app_statuses": {
            "by_recruiter_uid": {s: len([a for a in recruiter_apps if a.to_dict().get("status") == s]) for s in ["New", "Interviewing", "Offer sent", "Rejected"]},
            "by_job_id": {s: len([a for a in job_apps if a.to_dict().get("status") == s]) for s in ["New", "Interviewing", "Offer sent", "Rejected"]},
        }
    }

