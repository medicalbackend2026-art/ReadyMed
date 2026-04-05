# ReadyMD

ReadyMD is a full-stack healthcare application designed to connect patients and healthcare providers. It features secure user authentication, responsive design, and a robust API backend.

## 🚀 Quick Start Commands

To get the project running immediately on your machine, open two separate terminal tabs and run:

**Tab 1 (Frontend):**
```bash
cd frontend
npm install  # Creates an isolated 'node_modules' folder and installs exact dependencies
npm run dev
```

**Tab 2 (Backend):**
```bash
cd backend
  cd d:\ReadyMed\backend
   .\venv\Scripts\activate
   uvicorn main:app --reload --port 5000
```

---

## 🚀 Tech Stack

### Frontend
- **Framework**: React 19 + Vite
- **Styling**: Tailwind CSS
- **Routing**: React Router DOM v7
- **Authentication**: Firebase (Google)
- **Deployment**: Netlify (`https://readymed.netlify.app`)

### Backend
- **Environment**: Node.js
- **Framework**: Express.js
- **Authentication & Database**: Firebase Admin SDK
- **Deployment**: Render

---

## 🛠️ Project Structure

The project is structured as a monorepo containing two main directories:

- `/frontend` - The React application
- `/backend` - The Node.js Express server

---

## 💻 Getting Started

### Prerequisites
Make sure you have the following installed on your machine:
- Node.js (v18 or higher recommended)
- npm or yarn
- A Firebase Project (for authentication and database)

### Installation

1. **Clone the repository:**
   ```bash
   git clone <your-repository-url>
   cd ReadyMed
   ```

2. **Frontend Setup:**
   ```bash
   cd frontend
   npm install  # Automatically creates an isolated 'node_modules' folder (Node's equivalent of a virtual environment)
   ```
   *Create a `.env` file in the `frontend` directory (you can use `.env.example` as a template) and add your Firebase configuration keys.*

3. **Backend Setup:**
   Open a new terminal window:
   ```bash
   cd d:\ReadyMed\backend
   .\venv\Scripts\activate
   uvicorn main:app --reload --port 5000
   ```
   *Create a `.env` file in the `backend` directory. You will also need to configure your `firebase-admin.js` / Firebase service account key to allow the backend to verify Firebase auth tokens securely.*

### Running locally for Development

**Start the Backend Server:**
```bash
cd backend
npm run dev
```
*(Runs on `http://localhost:4000` or port configured in your env)*

**Start the Frontend Development Server:**
```bash
cd frontend
npm run dev
```
*(Runs on `http://localhost:5173`)*

---

## 🔒 Environment Variables Reference

To run this project, you will need to add the following environment variables. 

**Frontend (`frontend/.env`):**
- `VITE_FIREBASE_API_KEY`
- `VITE_FIREBASE_AUTH_DOMAIN`
- `VITE_FIREBASE_PROJECT_ID`
- `VITE_FIREBASE_STORAGE_BUCKET`
- `VITE_FIREBASE_MESSAGING_SENDER_ID`
- `VITE_FIREBASE_APP_ID`

**Backend (`backend/.env`):**
- `PORT` (e.g., 4000)
- `FIREBASE_PROJECT_ID`
- `FIREBASE_CLIENT_EMAIL`
- `FIREBASE_PRIVATE_KEY` (Ensure line breaks are handled correctly)
- Allowed CORS Origins (e.g., your local frontend URL and production Netlify URL)

---

## 🚢 Deployment

- **Frontend**: Continuously deployed via Netlify using `netlify.toml` configurations.
- **Backend**: Deployed to a Render web service. Ensure that the Render service environment variables match the expected production keys, and the `CORS` origins in the Express app include the Netlify URL to prevent Cross-Origin Resource Sharing errors.
