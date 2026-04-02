"""
Reservation — links a Guest to a Room for a date range.
This is the central join table; Tasks and FeedbackRatings hang off it.
"""

import enum
from datetime import date, datetime
from typing import TYPE_CHECKING

from sqlalchemy import Date, DateTime, ForeignKey, Text
from sqlalchemy import Enum as SAEnum
from sqlalchemy.orm import Mapped, mapped_column, relationship
from sqlalchemy.sql import func

from app.core.database import Base

if TYPE_CHECKING:
    from .feedback_rating import FeedbackRating
    from .guest import Guest
    from .property import Property
    from .room import Room
    from .task import Task
    from .upsell_conversion import UpsellConversion


class ReservationStatus(str, enum.Enum):
    CONFIRMED = "CONFIRMED"
    CHECKED_IN = "CHECKED_IN"
    CHECKED_OUT = "CHECKED_OUT"
    CANCELLED = "CANCELLED"
    NO_SHOW = "NO_SHOW"


class Reservation(Base):
    __tablename__ = "reservations"

    id: Mapped[int] = mapped_column(primary_key=True)
    guest_id: Mapped[int] = mapped_column(ForeignKey("guests.id"), index=True)
    room_id: Mapped[int] = mapped_column(ForeignKey("rooms.id"))
    property_id: Mapped[int] = mapped_column(ForeignKey("properties.id"))

    check_in: Mapped[date] = mapped_column(Date)
    check_out: Mapped[date] = mapped_column(Date)
    status: Mapped[ReservationStatus] = mapped_column(
        SAEnum(ReservationStatus), default=ReservationStatus.CONFIRMED
    )
    special_requests: Mapped[str | None] = mapped_column(Text, nullable=True)
    total_amount_etb: Mapped[float] = mapped_column(default=0.0)
    created_at: Mapped[datetime] = mapped_column(DateTime, server_default=func.now())

    # Relationships
    guest: Mapped["Guest"] = relationship("Guest", back_populates="reservations")
    room: Mapped["Room"] = relationship("Room", back_populates="reservations")
    property: Mapped["Property"] = relationship(
        "Property", back_populates="reservations"
    )
    tasks: Mapped[list["Task"]] = relationship(
        "Task", back_populates="reservation", cascade="all, delete-orphan"
    )
    upsell_conversions: Mapped[list["UpsellConversion"]] = relationship(
        "UpsellConversion", back_populates="reservation", cascade="all, delete-orphan"
    )
    feedback_rating: Mapped["FeedbackRating | None"] = relationship(
        "FeedbackRating", back_populates="reservation", uselist=False
    )
