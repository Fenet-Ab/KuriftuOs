from datetime import datetime
from typing import Optional

from pydantic import BaseModel, Field


class FeedBackRatingCreate(BaseModel):
    guest_id: int
    reservation_id: int
    score: int = Field(..., ge=1, le=5)
    comment: Optional[str] = None


class FeedbackRatingOut(BaseModel):
    id: int
    guest_id: int
    reservation_id: int
    score: int
    comment: Optional[str] = None
    tripadvisor_nudge_sent: bool
    escalated_to_manager: bool
    submitted_at: datetime

    class Config:
        from_attributes = True
