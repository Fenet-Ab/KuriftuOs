from sqlalchemy import Column, Integer, String, ForeignKey, DateTime
from datetime import datetime
from app.db.base import Base

class Feedback(Base):
    __tablename__ = "feedbacks"

    id = Column(Integer, primary_key=True, index=True)

    guest_id = Column(Integer, ForeignKey("guests.id"))
    booking_id = Column(Integer, ForeignKey("bookings.id"))

    comment = Column(String, nullable=False)
    sentiment = Column(String, default="neutral")  # positive, negative, neutral

    created_at = Column(DateTime, default=datetime.utcnow)