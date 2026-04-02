from datetime import datetime
from typing import Optional

from pydantic import BaseModel

from app.db.models import PricingConfidence, PricingDecision


class PricingRecommendation(BaseModel):
    id: int
    room_category: str
    current_rate_etb: float
    suggested_rate_etb: float
    pct_change: float
    confidence: PricingConfidence
    rationale: str
    holiday_context: Optional[str] = None
    decision: Optional[PricingDecision] = None
    generated_at: datetime

    class Config:
        from_attributes = True


class PricingDecision(BaseModel):
    decision: PricingDecision
    modified_rate_etb: Optional[float] = None
