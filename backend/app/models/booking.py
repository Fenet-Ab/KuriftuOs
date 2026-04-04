from sqlalchemy import Column, Integer, ForeignKey, DateTime, String
from datetime import datetime
from app.db.base import Base

class Booking(Base):
    __tablename__ = "bookings"

    id = Column(Integer, primary_key=True, index=True)

    guest_id = Column(Integer, ForeignKey("guests.id"))
    room_type = Column(String)   # standard, deluxe, suite

    check_in = Column(DateTime)
    check_out = Column(DateTime)

    status = Column(String, default="pending")  # pending, confirmed, cancelled
    total_price = Column(Integer, nullable=True) # Final price paid
    transaction_id = Column(String, nullable=True) # For Chapa

    created_at = Column(DateTime, default=datetime.utcnow)