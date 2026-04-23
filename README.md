# AI Test Case Generator

A full-stack web application that generates detailed **Test Cases**, **Edge Cases**, and a **QA Checklist** from a plain-English software requirement.

---

## 🧱 Tech Stack

| Layer    | Technology             |
|----------|------------------------|
| Frontend | React + Tailwind CSS   |
| Backend  | Python FastAPI         |
| Database | SQLite (via SQLAlchemy)|

---

## 📂 Project Structure

```
qahelper/
├── backend/               # FastAPI application
│   ├── main.py            # App entry point & API routes
│   ├── generator.py       # AI / rule-based generation logic
│   ├── models.py          # SQLAlchemy ORM models
│   ├── schemas.py         # Pydantic request/response schemas
│   ├── database.py        # DB engine & session factory
│   └── requirements.txt   # Python dependencies
├── frontend/              # React application
│   ├── src/
│   │   ├── App.js         # Root component
│   │   ├── components/    # UI components
│   │   │   ├── RequirementInput.jsx
│   │   │   ├── OutputTabs.jsx
│   │   │   ├── TestCasesTab.jsx
│   │   │   ├── EdgeCasesTab.jsx
│   │   │   └── ChecklistTab.jsx
│   │   └── services/
│   │       └── api.js     # API communication layer
│   └── package.json
└── database/              # SQLite DB file (auto-created at runtime)
```

---

## 🚀 Setup & Running Locally

### Prerequisites

- Python 3.9+
- Node.js 16+ and npm

---

### 1. Start the Backend

```bash
cd backend
pip install -r requirements.txt
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

The API will be available at **http://localhost:8000**
Interactive API docs: **http://localhost:8000/docs**

---

### 2. Start the Frontend

```bash
cd frontend
npm install
npm start
```

The React app will open at **http://localhost:3000**

---

## ▲ Vercel Deployment (Frontend + Backend)

### Why you see `405 (after retry without /api)`

In production, frontend uses `/api` by default when `REACT_APP_API_URL` is not set.
If frontend and backend are in separate Vercel projects, `/api` points to the frontend host (not your backend), which can cause 404/405.

### Recommended setup: two Vercel projects

This repository includes ready-to-use deployment files:

- `backend/vercel.json` (FastAPI serverless routing)
- `backend/.env.example`
- `frontend/.env.example`

#### 1) Deploy backend project

1. Create a new Vercel project from this repo.
2. Set **Root Directory** to `backend`.
3. Add environment variable:
   - `CORS_ALLOW_ORIGINS=https://<your-frontend-domain>.vercel.app`
4. Deploy.

Verify backend directly:

- `GET https://<your-backend-domain>.vercel.app/`
- `POST https://<your-backend-domain>.vercel.app/generate`
- `GET https://<your-backend-domain>.vercel.app/history`

#### 2) Deploy frontend project

1. Create another Vercel project from the same repo.
2. Set **Root Directory** to `frontend`.
3. Add environment variable:
   - `REACT_APP_API_URL=https://<your-backend-domain>.vercel.app`
4. Redeploy frontend.

This resolves the `/api` fallback issue by calling backend directly.

### Optional: same-domain `/api` setup

Only use `/api` if you intentionally configure a rewrite/proxy from frontend domain to backend domain.
Example `frontend/vercel.json` rewrite:

```json
{
  "rewrites": [
    { "source": "/api/:path*", "destination": "https://<your-backend-domain>.vercel.app/:path*" }
  ]
}
```

### Production database note

Current backend uses SQLite (`database/qahelper.db`), which is not durable on serverless runtime.
For reliable history persistence in production, migrate to a hosted database (such as Neon, Supabase, or Railway PostgreSQL).

⚠️ `CORS_ALLOW_ORIGINS=*` allows requests from any origin and is not recommended for production.

---

## 🖥️ Features

### Input
- Text area where you paste/type a software requirement
- "Use Sample" button to auto-fill an example requirement

### Output (3 tabs)

#### 🧪 Test Cases
Structured table with:
- Test Case ID
- Title (`Verify that...`)
- Preconditions
- Steps (numbered)
- Test Data
- Expected Result (`User/System should...`)
- **Export to CSV** button

#### ⚠️ Edge Cases
- Numbered bullet list
- Includes boundary, negative, security, performance, and domain-specific cases

#### ✅ Checklist
- Interactive checkbox list with progress bar
- Categories: UI, Functional, API, Security, Performance, Accessibility
- Click items to mark them as done

---

## 📡 API Reference

### POST `/generate`

**Request:**
```json
{ "requirement": "User should be able to login using email and password" }
```

**Response:**
```json
{
  "test_cases": [
    {
      "id": "TC001",
      "title": "Verify that...",
      "preconditions": ["..."],
      "steps": ["..."],
      "test_data": "...",
      "expected_result": "..."
    }
  ],
  "edge_cases": ["..."],
  "checklist": ["..."]
}
```

### GET `/history`
Returns all previous generation records.

### GET `/history/{id}`
Returns a specific generation record by ID.
