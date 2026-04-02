"""
FeedbackRating — post-checkout guest satisfaction score collected via Selam AI.
One rating per reservation (uselist=False on the Reservation side).
Scores 1-3 trigger manager escalation; 4-5 trigger TripAdvisor nudge.
"""

from datetime import datetime
from typing import TYPE_CHECKING

from sqlalchemy import Boolean, DateTime, ForeignKey, Integer, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship
from sqlalchemy.sql import func

from app.core.database import Base

if TYPE_CHECKING:
    from .guest import Guest
    from .reservation import Reservation


class FeedbackRating(Base):
    __tablename__ = "feedback_ratings"

    id: Mapped[int] = mapped_column(primary_key=True)
    guest_id: Mapped[int] = mapped_column(ForeignKey("guests.id"), index=True)
    reservation_id: Mapped[int] = mapped_column(
        ForeignKey("reservations.id"), unique=True, index=True
    )
    score: Mapped[int] = mapped_column(Integer)  # 1 – 5
    comment: Mapped[str | None] = mapped_column(Text, nullable=True)
    tripadvisor_nudge_sent: Mapped[bool] = mapped_column(Boolean, default=False)
    escalated_to_manager: Mapped[bool] = mapped_column(Boolean, default=False)
    submitted_at: Mapped[datetime] = mapped_column(DateTime, server_default=func.now())

    # Relationships
    guest: Mapped["Guest"] = relationship("Guest", back_populates="feedback_ratings")
    reservation: Mapped["Reservation"] = relationship(
        "Reservation", back_populates="feedback_rating"
    )
