"""
api/routes/companies.py
-----------------------
Endpoints for recruiter/company profile management.

Routes:
  POST /api/companies/profile — save/update company profile
  GET  /api/companies/profile — fetch own company profile
"""
from fastapi import APIRouter, Depends

from core.firebase import firebase_db
from core.security import get_current_user

router = APIRouter(prefix="/companies", tags=["Companies"])


@router.post("/profile", summary="Save or update company profile")
async def save_company_profile(body: dict, user: dict = Depends(get_current_user)):
    """Saves the authenticated recruiter's company profile to Firestore.

    Note: The 'logo' field (base64) is excluded to stay under Firestore's 1MB limit.
    """
    db = firebase_db()
    # Exclude logo (base64) to stay under Firestore 1MB doc limit
    body.pop("logo", None)

    data = {
        **body,
        "uid": user["uid"],
        "email": user["email"],
        "updatedAt": firebase_db.SERVER_TIMESTAMP,
    }
    db.collection("companies").document(user["uid"]).set(data, merge=True)
    return {"success": True, "message": "Company profile saved"}


@router.get("/profile", summary="Get own company profile")
async def get_company_profile(user: dict = Depends(get_current_user)):
    """Fetches the authenticated recruiter's company profile from Firestore."""
    db = firebase_db()
    doc = db.collection("companies").document(user["uid"]).get()
    if not doc.exists:
        return {"profile": None}
    return {"profile": doc.to_dict()}
