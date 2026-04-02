"""
PricingRecommendation — AI-generated pricing suggestions for room categories.
Manager accept/reject decisions are logged for future model improvement.
"""

import enum
from datetime import datetime
from typing import TYPE_CHECKING

from app.core.database import Base
from sqlalchemy import DateTime, ForeignKey, Integer, Numeric, String, Text
from sqlalchemy import Enum as SAEnum
from sqlalchemy.orm import Mapped, mapped_column, relationship
from sqlalchemy.sql import func

if TYPE_CHECKING:
    from .room import Room


class PricingConfidence(str, enum.Enum):
    LOW = "LOW"
    MEDIUM = "MEDIUM"
    HIGH = "HIGH"


class PricingDecision(str, enum.Enum):
    PENDING = "PENDING"
    ACCEPTED = "ACCEPTED"
    REJECTED = "REJECTED"
    MODIFIED = "MODIFIED"


class PricingRecommendation(Base):
    __tablename__ = "pricing_recommendations"

    id: Mapped[int] = mapped_column(primary_key=True)
    room_id: Mapped[int | None] = mapped_column(
        ForeignKey("rooms.id"), nullable=True, index=True
    )
    # Denormalised for display even if room is deleted
    room_category: Mapped[str] = mapped_column(String(64))
    current_rate_etb: Mapped[float] = mapped_column(Numeric(10, 2))
    suggested_rate_etb: Mapped[float] = mapped_column(Numeric(10, 2))
    pct_change: Mapped[float] = mapped_column(Numeric(6, 2))
    confidence: Mapped[PricingConfidence] = mapped_column(SAEnum(PricingConfidence))
    rationale: Mapped[str] = mapped_column(Text)  # LLM-generated explanation
    holiday_context: Mapped[str | None] = mapped_column(String(128), nullable=True)
    decision: Mapped[PricingDecision] = mapped_column(
        SAEnum(PricingDecision), default=PricingDecision.PENDING
    )
    decided_by: Mapped[int | None] = mapped_column(
        ForeignKey("staff.id"), nullable=True
    )  # Manager who acted on it
    decided_at: Mapped[datetime | None] = mapped_column(DateTime, nullable=True)
    generated_at: Mapped[datetime] = mapped_column(DateTime, server_default=func.now())
    property_id: Mapped[int] = mapped_column(Integer, default=1)

    # Relationships
    room: Mapped["Room | None"] = relationship(
        "Room", back_populates="pricing_recommendations"
    )
