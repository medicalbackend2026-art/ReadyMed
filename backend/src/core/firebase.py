"""
core/firebase.py
----------------
Firebase Admin SDK initialization.
Importable as a singleton — only initialized once at startup.
"""

import firebase_admin
from firebase_admin import auth, credentials, firestore

from src.core.config import FIREBASE_CLIENT_EMAIL, FIREBASE_PRIVATE_KEY, FIREBASE_PROJECT_ID


# Initialize Firebase Admin only once (singleton pattern)
if not firebase_admin._apps:
    cred = credentials.Certificate(
        {
            "type": "service_account",
            "project_id": FIREBASE_PROJECT_ID,
            "private_key": FIREBASE_PRIVATE_KEY,
            "client_email": FIREBASE_CLIENT_EMAIL,
            "token_uri": "https://oauth2.googleapis.com/token",
        }
    )
    firebase_admin.initialize_app(cred)


# Expose the auth and firestore clients for use across routes
firebase_auth = auth
firebase_db = firestore.client
