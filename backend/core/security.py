"""
core/security.py
----------------
Authentication dependency for FastAPI.

Usage in any route:
    from core.security import get_current_user
    ...
    async def my_route(user: dict = Depends(get_current_user)):
        uid = user["uid"]
        email = user["email"]

This replaces the `verifyToken` middleware from the Express.js backend.
The Firebase ID token must be sent in the Authorization header as:
    Authorization: Bearer <token>
"""
from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer

from core.firebase import firebase_auth

# HTTPBearer automatically reads the "Authorization: Bearer <token>" header
bearer_scheme = HTTPBearer()


async def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(bearer_scheme),
) -> dict:
    """
    FastAPI dependency: verifies Firebase ID token.
    Returns a dict with 'uid' and 'email' on success.
    Raises HTTP 401 if the token is missing or invalid.
    """
    token = credentials.credentials
    try:
        decoded = firebase_auth.verify_id_token(token)
        return {"uid": decoded["uid"], "email": decoded.get("email", "")}
    except Exception:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired authentication token.",
        )
