"""src/api/v1/endpoints/jobs.py

Endpoints for job listing management and job applications.

Routes:
  POST   /api/jobs               — create a new job listing
  GET    /api/jobs               — list all non-draft jobs (public job feed)
  GET    /api/jobs/mine          — list jobs posted by this recruiter
  GET    /api/jobs/{id}          — get a single job by ID
  PUT    /api/jobs/{id}          — update a job listing (recruiter only)
  PATCH  /api/jobs/{id}/status   — pause or activate a job (recruiter only)
  DELETE /api/jobs/{id}          — delete a job listing (recruiter only)
  POST   /api/jobs/{id}/apply    — candidate applies for a job
"""

from fastapi import APIRouter, Depends, HTTPException, status
from google.cloud.firestore_v1 import SERVER_TIMESTAMP

from src.core.firebase import firebase_db
from src.core.security import get_current_user

router = APIRouter(prefix="/jobs", tags=["Jobs"])


def _serialize_job(doc) -> dict:
    d = doc.to_dict()
    created_at = d.get("createdAt")
    return {
        "id": doc.id,
        **d,
        "createdAt": created_at.isoformat() if hasattr(created_at, "isoformat") else None,
    }


@router.post("", summary="Create a new job listing")
async def create_job(body: dict, user: dict = Depends(get_current_user)):
    db = firebase_db()
    job = {
        **body,
        "recruiterUid": user["uid"],
        "recruiterEmail": user["email"],
        "status": body.get("status", "active"),
        "createdAt": SERVER_TIMESTAMP,
        "updatedAt": SERVER_TIMESTAMP,
    }
    ref = db.collection("jobs").add(job)
    return {"success": True, "jobId": ref[1].id}


@router.get("", summary="List all non-draft jobs (public job feed)")
async def list_jobs():
    db = firebase_db()
    snap = db.collection("jobs").where("status", "!=", "draft").stream()
    jobs = [_serialize_job(doc) for doc in snap]
    jobs.sort(key=lambda j: j.get("createdAt") or "", reverse=True)
    return {"jobs": jobs}


@router.get("/mine", summary="List jobs posted by this recruiter")
async def list_my_jobs(user: dict = Depends(get_current_user)):
    db = firebase_db()
    snap = db.collection("jobs").where("recruiterUid", "==", user["uid"]).stream()
    jobs = [_serialize_job(doc) for doc in snap]
    jobs.sort(key=lambda j: j.get("createdAt") or "", reverse=True)
    return {"jobs": jobs}


@router.get("/{job_id}", summary="Get a single job by ID")
async def get_job(job_id: str):
    db = firebase_db()
    doc = db.collection("jobs").document(job_id).get()
    if not doc.exists:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Job not found")
    return {"job": _serialize_job(doc)}


@router.put("/{job_id}", summary="Update a job listing")
async def update_job(job_id: str, body: dict, user: dict = Depends(get_current_user)):
    db = firebase_db()
    ref = db.collection("jobs").document(job_id)
    doc = ref.get()
    if not doc.exists:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Job not found")
    if doc.to_dict().get("recruiterUid") != user["uid"]:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Forbidden")

    for field in ("id", "recruiterUid", "recruiterEmail", "createdAt"):
        body.pop(field, None)

    ref.update({**body, "updatedAt": SERVER_TIMESTAMP})
    return {"success": True, "jobId": job_id}


@router.patch("/{job_id}/status", summary="Pause or activate a job listing")
async def update_job_status(job_id: str, body: dict, user: dict = Depends(get_current_user)):
    db = firebase_db()
    ref = db.collection("jobs").document(job_id)
    doc = ref.get()
    if not doc.exists or doc.to_dict().get("recruiterUid") != user["uid"]:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Forbidden")
    ref.update({"status": body.get("status"), "updatedAt": SERVER_TIMESTAMP})
    return {"success": True}


@router.delete("/{job_id}", summary="Delete a job listing")
async def delete_job(job_id: str, user: dict = Depends(get_current_user)):
    db = firebase_db()
    ref = db.collection("jobs").document(job_id)
    doc = ref.get()
    if not doc.exists or doc.to_dict().get("recruiterUid") != user["uid"]:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Forbidden")
    ref.delete()
    return {"success": True}


@router.post("/{job_id}/apply", summary="Apply for a job")
async def apply_for_job(job_id: str, body: dict, user: dict = Depends(get_current_user)):
    db = firebase_db()
    job_doc = db.collection("jobs").document(job_id).get()
    if not job_doc.exists:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Job not found")
    job = job_doc.to_dict()

    existing = (
        db.collection("applications")
        .where("jobId", "==", job_id)
        .where("applicantUid", "==", user["uid"])
        .get()
    )
    if existing:
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="Already applied")

    application = {
        "jobId": job_id,
        "jobTitle": job.get("title", ""),
        "hospital": job.get("hospital", job.get("companyName", "")),
        "recruiterUid": job.get("recruiterUid"),
        "recruiterEmail": job.get("recruiterEmail"),
        "applicantUid": user["uid"],
        "applicantEmail": user["email"],
        "applicantName": body.get("applicantName", ""),
        "coverNote": body.get("coverNote", ""),
        "status": "New",
        "appliedAt": SERVER_TIMESTAMP,
    }
    ref = db.collection("applications").add(application)
    return {"success": True, "applicationId": ref[1].id}
