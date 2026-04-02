"""
Property — a single Kuriftu resort location (Bishoftu, Bahir Dar, Adama, etc.).
All multi-tenant records reference property_id to support future multi-branch
expansion (NFR-SC-02).
"""

from datetime import datetime
from typing import TYPE_CHECKING

from sqlalchemy import Boolean, DateTime, String
from sqlalchemy.orm import Mapped, mapped_column, relationship
from sqlalchemy.sql import func

from app.core.database import Base

if TYPE_CHECKING:
    from .reservation import Reservation
    from .room import Room


class Property(Base):
    __tablename__ = "properties"

    id: Mapped[int] = mapped_column(primary_key=True)
    name: Mapped[str] = mapped_column(String(128))  # e.g. "Kuriftu Bishoftu"
    location: Mapped[str] = mapped_column(String(256))  # city / address
    whatsapp_phone_number_id: Mapped[str | None] = mapped_column(
        String(64), nullable=True
    )
    is_active: Mapped[bool] = mapped_column(Boolean, default=True)
    created_at: Mapped[datetime] = mapped_column(DateTime, server_default=func.now())

    # Relationships
    rooms: Mapped[list["Room"]] = relationship("Room", back_populates="property")
    reservations: Mapped[list["Reservation"]] = relationship(
        "Reservation", back_populates="property"
    )
