# ReadyMD Developer Guide

Welcome to the ReadyMD developer documentation! This guide maps out how the application is structured, including frontend routing and backend API endpoints, to help you understand the architecture at a glance.

---

## 1. Application Architecture

ReadyMD is a full-stack platform connecting healthcare professionals (Employees) with healthcare facilities (Recruiters).

- **Frontend (`/frontend`)**: React 19 application built with Vite, utilizing React Router DOM v7 for client-side routing and Tailwind CSS for styling.
- **Backend (`/backend`)**: Node.js Express server acting as a REST API. It handles authentication and database interactions via the Firebase Admin SDK.
- **Database**: Firebase Firestore (NoSQL).
- **Authentication**: Firebase Authentication (handled primarily on the frontend, with JWT tokens verified on the backend via the `verifyToken` middleware).

---

## 2. Frontend Structure (`/frontend/src`)

The client side is divided into three main role-based layout wrappers defined in `App.jsx`:

### Public & Authentication Routes
- `/` - **HomePage**: Landing page for the application.
- `/login` - **LoginPage**: User login (Google/Email).
- `/signup` - **SignupPage**: New user registration.
- `/otp-verify` - **OTPVerifyPage**: Phone or email verification steps.

### Employee (Healthcare Professional) Routes
- `/dashboard` - **Employee Dashboard**: Main landing area for an employee.
- `/profile-setup` - **Profile Setup**: Where employees create/update their professional resumes and details.
- `/jobs` - **Job Feed**: Browse available active jobs.
- `/jobs/:id` - **Job Detail**: View specific job information and apply.

### Recruiter (Hospital/Clinic) Routes
- `/recruiter/dashboard` - **Recruiter Dashboard**: Overview of posted jobs and candidate metrics.
- `/recruiter/company-setup` - **Company Setup**: Defining hospital/clinic details.
- `/recruiter/post-job` - **Post a Job**: Form to create a new job listing.
- `/recruiter/candidates` - **Candidate Search**: Browse registered employee profiles.
- `/recruiter/applications` - **Manage Applications**: View all applications across all jobs.
- `/recruiter/applications/:jobId` - **Job Candidates**: View applications for one specific job.

---

## 3. Backend API Endpoints (`/backend/routes`)

All endpoints expect an `Authorization: Bearer <Firebase_ID_Token>` header unless marked as public.

### Users (`/api/users`)
- `POST /profile` - Create or update an employee professional profile.
- `GET /profile` - Fetch the logged-in user's profile.
- `GET /` - Fetch all users/candidates (used by recruiters to browse candidates).
- `GET /:uid/profile` - Fetch the public profile of a specific user.

### Jobs (`/api/jobs`)
- `POST /` - Create a new job listing.
- `GET /` - Fetch all non-draft active jobs (Public/Employee job feed). *(Public)*
- `GET /mine` - Fetch all jobs posted by the logged-in recruiter.
- `PUT /:id` - Update an existing job.
- `GET /:id` - Fetch details for a single job. *(Public)*
- `POST /:id/apply` - Employee applies for a specific job.
- `PATCH /:id/status` - Pause or activate a job.
- `DELETE /:id` - Delete a job posted by the recruiter.

### Companies (`/api/companies`)
*(Contains endpoints for recruiters to manage their clinic/hospital profiles).*

### Applications (`/api/applications`)
*(Contains endpoints for recruiters to view applications and manage application statuses like Accepted/Rejected).*

---

## 4. How Frontend & Backend Communicate

1. **Auth Flow**: The frontend uses the Firebase Web SDK to log the user in. Firebase returns an ID token.
2. **API Requests**: The frontend attaches this token to the `Authorization: Bearer <token>` header for protected backend requests.
3. **Validation**: The Express backend intercepts requests using the `verifyToken` middleware, which uses `admin.auth().verifyIdToken(token)` to ensure the user is valid before processing the request or accessing Firestore.

---

## 5. Next Steps for New Developers

1. Review `README.md` to get your local environment running.
2. Read through `/frontend/src/context/AppContext.jsx` to understand global state management.
3. Inspect `/backend/firebase-admin.js` to understand how the backend connects securely to the Firestore database.
