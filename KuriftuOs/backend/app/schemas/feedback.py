from pydantic import BaseModel
from typing import Optional

class FeedbackCreate(BaseModel):
    guest_id: Optional[int] = None
    booking_id: int
    comment: str

class FeedbackResponse(BaseModel):
    id: int
    guest_id: int
    booking_id: int
    comment: str
    sentiment: str

    class Config:
        from_attributes = True


class FeedbackAnalytics(BaseModel):
    total_feedbacks: int
    sentiment_distribution: dict[str, int]