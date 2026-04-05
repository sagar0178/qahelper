"""
ORM models for the AI Test Case Generator application.
"""

import json
from datetime import datetime
from sqlalchemy import Column, Integer, String, Text, DateTime
from database import Base


class GenerationRecord(Base):
    """Stores each requirement submitted and the generated output."""

    __tablename__ = "generation_records"

    id = Column(Integer, primary_key=True, index=True)
    requirement = Column(Text, nullable=False)
    # Store the full JSON response as a text field
    generated_output = Column(Text, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)

    def get_output(self) -> dict:
        """Deserialize the stored JSON output."""
        return json.loads(self.generated_output)
