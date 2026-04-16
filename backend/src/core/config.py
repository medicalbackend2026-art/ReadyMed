"""
core/config.py
--------------
Loads environment variables from the .env file.
Single source of truth for backend configuration.
"""

import os

from dotenv import load_dotenv

load_dotenv()

# Firebase credentials (from .env or environment)
FIREBASE_PROJECT_ID: str = os.getenv("FIREBASE_PROJECT_ID", "")
FIREBASE_PRIVATE_KEY: str = os.getenv("FIREBASE_PRIVATE_KEY", "").replace("\\n", "\n")
FIREBASE_CLIENT_EMAIL: str = os.getenv("FIREBASE_CLIENT_EMAIL", "")

# Server config
PORT: int = int(os.getenv("PORT", "5000"))

# CORS allowed origins
ALLOWED_ORIGINS: list[str] = [
    "http://localhost:5173",
    "http://localhost:3000",
    "https://readymed.netlify.app",
]
