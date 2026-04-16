"""src/api/v1/endpoints/users.py

Endpoints for user (candidate) profile management.

Routes:
  POST /api/users/profile       — save/update professional profile
  GET  /api/users/profile       — fetch own profile
  GET  /api/users               — list all candidates (for recruiters)
  GET  /api/users/{uid}/profile — get a specific candidate's public profile
"""

from fastapi import APIRouter, Depends, Query

from google.cloud.firestore_v1 import SERVER_TIMESTAMP

from src.core.firebase import firebase_auth, firebase_db
from src.core.security import get_current_user

router = APIRouter(prefix="/users", tags=["Users"])


@router.post("/profile", summary="Save or update professional profile")
async def save_profile(body: dict, user: dict = Depends(get_current_user)):
    """Saves the authenticated user's professional profile to Firestore.

    Note: The 'photo' field (base64) is excluded to stay under Firestore's 1MB limit.
    """

    db = firebase_db()
    body.pop("photo", None)

    data = {
        **body,
        "uid": user["uid"],
        "email": user["email"],
        "updatedAt": SERVER_TIMESTAMP,
    }
    db.collection("users").document(user["uid"]).set(data, merge=True)
    return {"success": True, "message": "Profile saved"}


@router.get("/profile", summary="Get own professional profile")
async def get_profile(user: dict = Depends(get_current_user)):
    db = firebase_db()
    doc = db.collection("users").document(user["uid"]).get()
    if not doc.exists:
        return {"profile": None}
    return {"profile": doc.to_dict()}


@router.get("", summary="List all candidates (recruiter view)")
async def list_users(
    locum_only: bool = Query(False, alias="locumOnly"),
    user: dict = Depends(get_current_user),
):
    """Returns a list of all candidate profiles.

    Falls back to Firebase Auth display name if the Firestore doc has no 'name' field.
    """

    db = firebase_db()
    snap = db.collection("users").stream()

    users = []
    for doc in snap:
        d = doc.to_dict()
        name = d.get("name", "")

        if not name:
            try:
                auth_user = firebase_auth.get_user(doc.id)
                name = auth_user.display_name or ""
            except Exception:
                pass

        if not name:
            continue

        locum_days = d.get("locumDays") or []
        locum_hours = d.get("locumHoursPerDay") or d.get("locumHoursPerWeek")
        locum_shift = d.get("locumShiftPreference")
        locum_eligible = bool(d.get("locumAvailability")) or (
            isinstance(locum_days, list)
            and len(locum_days) > 0
            and bool(locum_hours)
            and bool(locum_shift)
        )

        if locum_only:
            p = str(d.get("profession", "")).lower()
            allowed = ("doctor" in p) or ("nurse" in p)
            if not allowed or not locum_eligible:
                continue

        users.append(
            {
                "uid": doc.id,
                "name": name,
                "profession": d.get("profession", ""),
                "location": d.get("preferredCity", d.get("city", "")),
                "experience": (d.get("experiences") or [{}])[0].get("jobTitle", "")
                if d.get("experiences")
                else "",
                "skills": d.get("skills", []),
                "currentSalary": d.get("currentSalary", ""),
                "expectedSalary": d.get("expectedSalary", ""),
                "noticePeriod": d.get("noticePeriod", ""),
                "preferredJobType": d.get("preferredJobType", ""),
                "openToRelocation": d.get("openToRelocation", ""),
                "resumeFilename": d.get("resumeFilename"),
                "resumeUrl": d.get("resumeUrl"),
                "experiences": d.get("experiences", []),
                "qualifications": d.get("qualifications", []),
                "locumEligible": locum_eligible,
            }
        )

    return {"users": users}


@router.get("/{uid}/profile", summary="Get a specific candidate's public profile")
async def get_public_profile(uid: str, user: dict = Depends(get_current_user)):
    """Returns public (non-sensitive) fields of a candidate."""

    db = firebase_db()
    doc = db.collection("users").document(uid).get()
    if not doc.exists:
        return {"profile": None}

    data = doc.to_dict()
    for field in ("email", "uid", "updatedAt"):
        data.pop(field, None)

    return {"profile": data}
