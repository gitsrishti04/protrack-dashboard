# ProTrack AI

AI-Based Project Progress Tracking and Resource Prediction System.

A full-stack web application that allows organisations to monitor project development, predict completion timelines, allocate resources intelligently, and query project data through an AI chatbot.

---

## Table of Contents

- [Project Overview](#project-overview)
- [Tech Stack](#tech-stack)
- [Prerequisites](#prerequisites)
- [Project Structure](#project-structure)
- [Backend Setup](#backend-setup)
- [Frontend Setup](#frontend-setup)
- [ML Models Setup](#ml-models-setup)
- [Environment Variables](#environment-variables)
- [Running the Application](#running-the-application)
- [Default Login Credentials](#default-login-credentials)
- [API Endpoints](#api-endpoints)
- [Features](#features)

---

## Project Overview

ProTrack AI provides:
- Real-time project and task tracking
- ML-based completion time and delay risk prediction
- Resource allocation prediction for new projects
- Role-based access for Team Lead, Admin, and Super Admin
- AI chatbot for Super Admin powered by Gemini + LangChain + LangGraph + RAG
- Analytics dashboard with live charts

---

## Tech Stack

**Frontend**
- React 18 + TypeScript
- Tailwind CSS + shadcn/ui
- Axios (HTTP client)
- React Hook Form (form validation)
- Recharts (data visualisation)
- React Router v6
- JWT (js-cookie + jwt-decode)

**Backend**
- Python 3.11+
- FastAPI
- SQLAlchemy (ORM)
- PostgreSQL
- JWT Authentication (python-jose)
- bcrypt password hashing (passlib)

**Machine Learning**
- scikit-learn (RandomForest, GradientBoosting)
- XGBoost
- pandas, numpy, joblib

**AI Chatbot**
- LangChain
- LangGraph
- Google Gemini API (gemini-2.5-flash)
- RAG (live database context injection)

---

## Prerequisites

Make sure you have the following installed:

- **Node.js** v18+ — https://nodejs.org
- **Python** 3.11+ — https://python.org
- **PostgreSQL** — https://postgresql.org
- **Homebrew** (macOS) — https://brew.sh

---

## Project Structure

```
protrackAI/
├── protrack-dashboard/        # React frontend
│   ├── src/
│   │   ├── components/        # UI components
│   │   ├── pages/             # Page components
│   │   ├── hooks/             # Custom hooks
│   │   ├── services/api.ts    # Axios API client
│   │   ├── context/           # Auth context
│   │   ├── lib/               # Utilities
│   │   └── types/             # TypeScript types
│   └── package.json
│
└── protrack_backend/          # FastAPI backend
    └── app/
        ├── models/            # SQLAlchemy models
        ├── routes/            # API endpoints
        ├── schemas/           # Pydantic schemas
        ├── utils/             # JWT, security helpers
        ├── ml/                # ML models and scripts
        └── main.py            # FastAPI app entry point
```

---

## Backend Setup

### 1. Create and activate a virtual environment

```bash
cd protrack_backend
python3 -m venv venv
source venv/bin/activate
```

### 2. Install dependencies

```bash
pip install fastapi==0.135.2 uvicorn==0.42.0 sqlalchemy psycopg2-binary \
  pydantic==2.12.5 passlib[bcrypt]==1.7.4 python-jose==3.5.0 \
  pandas==3.0.2 numpy==2.4.4 scikit-learn==1.8.0 xgboost==3.2.0 \
  joblib==1.5.3 langchain==1.3.4 langchain-google-genai==4.2.4 \
  langgraph==1.2.4 google-genai==2.7.0 python-dotenv==1.2.2
```

> **macOS only** — XGBoost requires OpenMP:
> ```bash
> brew install libomp
> ```

### 3. Create the PostgreSQL database

```bash
psql -U postgres
```
```sql
CREATE DATABASE protrack_db;
CREATE USER srishti WITH PASSWORD '';
GRANT ALL PRIVILEGES ON DATABASE protrack_db TO srishti;
\q
```

> If your PostgreSQL user is different, update `DATABASE_URL` in `app/database.py`.

### 4. Create the `.env` file

```bash
# protrack_backend/.env
GEMINI_API_KEY=your_gemini_api_key_here
JWT_SECRET_KEY=protrack-dev-secret-change-in-prod
```

Get a free Gemini API key at: https://aistudio.google.com/app/apikey

### 5. Create all database tables

Tables are auto-created when the server starts via `Base.metadata.create_all()`.

### 6. Train the ML models

```bash
# Generate training data
python -m app.ml.generate_data
python -m app.ml.generate_resource_data

# Train models
python -m app.ml.train
python -m app.ml.train_resource_model
```

This creates 5 model files in `app/ml/`:
- `delay_model.pkl`
- `completion_model.pkl`
- `resource_devs_model.pkl`
- `resource_days_model.pkl`

---

## Frontend Setup

```bash
cd protrack-dashboard
npm install
```

---

## Environment Variables

### Backend — `protrack_backend/.env`

| Variable | Description | Example |
|----------|-------------|---------|
| `GEMINI_API_KEY` | Google Gemini API key for the AI chatbot | `AIzaSy...` |
| `JWT_SECRET_KEY` | Secret key for JWT signing | `protrack-dev-secret` |

> `JWT_SECRET_KEY` defaults to `protrack-dev-secret-change-in-prod` if not set. Change this in production.

### Frontend — `protrack-dashboard/src/services/api.ts`

The base URL is set to `http://127.0.0.1:8000`. Change this if your backend runs on a different port.

---

## Running the Application

### Start the backend

```bash
cd protrack_backend
source venv/bin/activate
python -m uvicorn app.main:app --reload
```

Backend runs at: **http://127.0.0.1:8000**

Interactive API docs: **http://127.0.0.1:8000/docs**

### Start the frontend

```bash
cd protrack-dashboard
npm run dev
```

Frontend runs at: **http://localhost:5173** (or whichever port Vite assigns)

---

## Default Login Credentials

After running the backend for the first time, create users via the `/register` endpoint or use the following if you have already seeded the database:

| Email | Password | Role |
|-------|----------|------|
| `superadmin@protrack.com` | `password123` | Super Admin |
| `admin@test.com` | `password123` | Admin |
| `teamlead@protrack.com` | `password123` | Team Lead |

To create a Super Admin manually:

```bash
curl -X POST http://127.0.0.1:8000/register \
  -H "Content-Type: application/json" \
  -d '{"name": "Super Admin", "email": "superadmin@protrack.com", "password": "password123", "role": "super_admin"}'
```

To reset all passwords (if forgotten):

```bash
cd protrack_backend
source venv/bin/activate
python -c "
from app.database import SessionLocal
from app.models.user import User
from app.utils.security import hash_password
db = SessionLocal()
for u in db.query(User).all():
    u.password = hash_password('password123')
    print(f'Reset: {u.email}')
db.commit()
db.close()
"
```

---

## API Endpoints

### Authentication
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/register` | Register a new user |
| POST | `/login` | Login and get JWT token |
| GET | `/users/me` | Get current user profile |

### Projects
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/projects` | List all projects (paginated, searchable) |
| POST | `/projects` | Create a project (admin only) |
| GET | `/projects/{id}` | Get project details |
| PUT | `/projects/{id}/progress` | Update project progress |
| GET | `/projects/{id}/tasks` | Get tasks for a project |
| POST | `/projects/{id}/tasks` | Create a task |
| GET | `/projects/{id}/members` | Get project members |
| POST | `/projects/{id}/members` | Add a member |
| GET | `/projects/{id}/history` | Get progress history |

### Dashboard
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/dashboard` | Get KPI summary |
| GET | `/workload` | Get team workload data |
| GET | `/resource-utilization` | Get per-project resource data |
| GET | `/progress-over-time` | Get progress trend data |

### ML Predictions
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/predictions/delay-risk` | Predict delay risk |
| POST | `/api/predictions/completion-time` | Predict completion time |
| POST | `/api/predictions/full-prediction` | Both predictions combined |
| POST | `/api/predictions/resource-allocation` | Predict resources for new project |

### AI Chatbot (Super Admin only)
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/chat` | Ask the AI chatbot about project data |

---

## Features

### Role-Based Access

| Feature | Team Lead | Admin | Super Admin |
|---------|-----------|-------|-------------|
| View own projects | ✅ | ✅ | ✅ |
| View all projects | ❌ | ✅ | ✅ |
| Update project progress | ✅ | ✅ | ✅ |
| Manage tasks | ✅ | ✅ | ✅ |
| Create/delete projects | ❌ | ✅ | ✅ |
| Manage users | ❌ | ✅ | ✅ |
| View analytics dashboard | ❌ | ✅ | ✅ |
| AI Chatbot | ❌ | ❌ | ✅ |

### ML Models

**Completion Time Prediction**
- Model: GradientBoostingRegressor (scikit-learn)
- Input: total tasks, completed tasks, delayed tasks, team size, completion %, task completion rate, delayed task rate
- Output: estimated days remaining

**Delay Risk Prediction**
- Model: RandomForestClassifier (scikit-learn)
- Input: same as above
- Output: is_delayed (0/1), probability on track, probability delayed

**Resource Allocation Prediction**
- Model: XGBoost Regressor (two models)
- Input: project type, complexity, total tasks, deadline days, skill flags
- Output: required developers, estimated timeline, required skill sets

### AI Chatbot

The Super Admin chatbot uses a LangGraph workflow:
1. **fetch_context** — queries live PostgreSQL data (RAG)
2. **generate_response** — passes context + question to Gemini 2.5 Flash

Example queries:
- "Which projects are delayed?"
- "What is the progress of the Mobile Banking App?"
- "How many developers are assigned to each project?"
- "Which team has the highest workload?"

---

## Notes

- The `.env` file is gitignored — never commit your API keys
- ML model `.pkl` files are generated locally — run the training scripts before starting the backend
- The progress-over-time chart populates as team leads submit progress updates
- The AI chatbot requires a valid Gemini API key with available quota
