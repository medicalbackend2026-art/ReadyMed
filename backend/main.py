"""main.py

Legacy wrapper entrypoint.

The backend code has moved to the scalable src/ layout.
Keep running locally with:
    uvicorn main:app --reload --port 5000

Or run directly:
    uvicorn src.main:app --reload --port 5000
"""

from src.main import app
