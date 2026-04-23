"""
Pydantic schemas for request/response validation.
"""

from typing import List, Optional
from pydantic import BaseModel


# ── Request schema ──────────────────────────────────────────────────────────

class RequirementRequest(BaseModel):
    """Payload sent by the client to generate test artifacts."""
    requirement: str


# ── Individual test-case schema ──────────────────────────────────────────────

class TestCase(BaseModel):
    id: str
    title: str
    preconditions: List[str]
    steps: List[str]
    test_data: str
    expected_result: str


# ── Response schema ──────────────────────────────────────────────────────────

class GenerationResponse(BaseModel):
    """Full response returned by POST /generate."""
    test_cases: List[TestCase]
    edge_cases: List[str]
    checklist: List[str]


# ── History record schema ────────────────────────────────────────────────────

class HistoryRecord(BaseModel):
    id: int
    requirement: str
    created_at: str
    output: GenerationResponse

    class Config:
        from_attributes = True
