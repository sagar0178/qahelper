"""
FastAPI application entry point for the AI Test Case Generator.

Endpoints:
  POST /generate  – Accept a requirement and return test cases, edge cases, checklist
  GET  /history   – Return the list of all previous generations
  GET  /history/{id} – Return a specific generation record
"""

import json
import os
from fastapi import FastAPI, HTTPException, Depends
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session

from database import engine, get_db, Base
import models
from schemas import RequirementRequest, GenerationResponse, HistoryRecord
from generator import generate_test_artifacts

# ── Ensure the /database directory exists ────────────────────────────────────
BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
os.makedirs(os.path.join(BASE_DIR, "database"), exist_ok=True)

# ── Create all DB tables on startup ──────────────────────────────────────────
Base.metadata.create_all(bind=engine)

# ── App instance ─────────────────────────────────────────────────────────────
app = FastAPI(
    title="AI Test Case Generator API",
    description="Generates test cases, edge cases, and QA checklist from software requirements.",
    version="1.0.0",
)

def _get_allowed_origins() -> list[str]:
    origins = os.getenv("CORS_ALLOW_ORIGINS", "").strip()
    if not origins:
        return ["http://localhost:3000", "http://127.0.0.1:3000"]

    parsed = [origin.strip() for origin in origins.split(",") if origin.strip()]
    return parsed or ["http://localhost:3000", "http://127.0.0.1:3000"]


allowed_origins = _get_allowed_origins()
allow_all_origins = "*" in allowed_origins

# ── CORS – allow local/dev by default, configurable for deployments ──────────
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"] if allow_all_origins else allowed_origins,
    allow_credentials=not allow_all_origins,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ── Routes ────────────────────────────────────────────────────────────────────

@app.get("/")
def root():
    """Health-check endpoint."""
    return {"status": "ok", "message": "AI Test Case Generator API is running"}


@app.post("/generate", response_model=GenerationResponse)
def generate(payload: RequirementRequest, db: Session = Depends(get_db)):
    """
    Accept a plain-English software requirement and return:
    - test_cases   : structured test case objects
    - edge_cases   : list of edge-case strings
    - checklist    : list of QA checklist items
    """
    requirement = payload.requirement.strip()
    if not requirement:
        raise HTTPException(status_code=400, detail="Requirement text cannot be empty")

    # Generate the test artifacts using the AI/rule-based engine
    output = generate_test_artifacts(requirement)

    # Persist the result to the database
    record = models.GenerationRecord(
        requirement=requirement,
        generated_output=json.dumps(output),
    )
    db.add(record)
    db.commit()
    db.refresh(record)

    return output


@app.get("/history", response_model=list[HistoryRecord])
def get_history(db: Session = Depends(get_db)):
    """Return all previous generation records, newest first."""
    records = (
        db.query(models.GenerationRecord)
        .order_by(models.GenerationRecord.created_at.desc())
        .all()
    )
    return [
        HistoryRecord(
            id=r.id,
            requirement=r.requirement,
            created_at=r.created_at.isoformat(),
            output=r.get_output(),
        )
        for r in records
    ]


@app.get("/history/{record_id}", response_model=HistoryRecord)
def get_history_record(record_id: int, db: Session = Depends(get_db)):
    """Return a single generation record by its ID."""
    record = db.query(models.GenerationRecord).filter(
        models.GenerationRecord.id == record_id
    ).first()
    if not record:
        raise HTTPException(status_code=404, detail="Record not found")
    return HistoryRecord(
        id=record.id,
        requirement=record.requirement,
        created_at=record.created_at.isoformat(),
        output=record.get_output(),
    )
