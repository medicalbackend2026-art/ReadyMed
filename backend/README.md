# ReadyMed FastAPI Backend

This is the Python/FastAPI backend for ReadyMed. It replaces the original Node.js/Express backend.

---

## Project Structure

```
backend_py/
├── main.py                  # ← Entry point. Run: uvicorn main:app --reload
│
├── core/                    # Shared utilities — config, auth, Firebase
│   ├── config.py            # All env variables loaded from .env
│   ├── firebase.py          # Firebase Admin SDK singleton
│   └── security.py          # get_current_user() dependency (verifies Firebase token)
│
├── api/
│   ├── router.py            # Aggregates all feature routers under /api
│   └── routes/
│       ├── users.py         # /api/users — candidate profiles
│       ├── companies.py     # /api/companies — recruiter/company profiles
│       ├── jobs.py          # /api/jobs — job listings + apply
│       └── applications.py  # /api/applications — view & update applications
│
├── requirements.txt
└── .env.example             # Copy to .env and fill in Firebase credentials
```

---

## Setup

### 1. Create and activate a virtual environment

```powershell
# Windows (PowerShell)
cd d:\ReadyMed\backend_py
python -m venv venv
.\venv\Scripts\Activate.ps1
```

### 2. Install dependencies

```powershell
pip install -r requirements.txt
```

### 3. Configure environment variables

```powershell
Copy-Item .env.example .env
# Then open .env and fill in your Firebase credentials
```

### 4. Run the development server

```powershell
uvicorn main:app --reload --port 5000
```

Visit **http://localhost:5000/docs** for interactive API documentation (Swagger UI).

---

## Authentication

All protected endpoints require a Firebase ID token in the `Authorization` header:

```
Authorization: Bearer <FIREBASE_ID_TOKEN>
```

The `get_current_user` dependency in `core/security.py` handles token verification for every protected route. To protect a new endpoint, simply add `user: dict = Depends(get_current_user)` to its parameters.

---

## Adding a New Feature

1. Create `api/routes/your_feature.py` with a FastAPI `APIRouter`
2. Import it in `api/router.py` and call `api_router.include_router(your_feature.router)`
3. That's it — the endpoint will appear in `/docs` automatically.

---

## API Reference

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/api/health` | ❌ | Health check |
| POST | `/api/users/profile` | ✅ | Save own profile |
| GET | `/api/users/profile` | ✅ | Get own profile |
| GET | `/api/users` | ✅ | List all candidates |
| GET | `/api/users/{uid}/profile` | ✅ | Get candidate public profile |
| POST | `/api/companies/profile` | ✅ | Save company profile |
| GET | `/api/companies/profile` | ✅ | Get company profile |
| POST | `/api/jobs` | ✅ | Create job listing |
| GET | `/api/jobs` | ❌ | List all jobs (public) |
| GET | `/api/jobs/mine` | ✅ | List own jobs (recruiter) |
| GET | `/api/jobs/{id}` | ❌ | Get a single job |
| PUT | `/api/jobs/{id}` | ✅ | Update a job |
| PATCH | `/api/jobs/{id}/status` | ✅ | Pause/activate a job |
| DELETE | `/api/jobs/{id}` | ✅ | Delete a job |
| POST | `/api/jobs/{id}/apply` | ✅ | Apply for a job |
| GET | `/api/applications/mine` | ✅ | Get own applications |
| GET | `/api/applications/for-recruiter` | ✅ | Get all applications for recruiter |
| GET | `/api/applications/job/{id}` | ✅ | Get applications for a job |
| PATCH | `/api/applications/{id}/status` | ✅ | Update application status |
