"""
Guest — a resort guest identified by their WhatsApp phone number.
PII stored as: hash (for lookup) + encrypted field (for display).
Long-term preferences stored as a pgvector embedding.
"""

import enum
from typing import TYPE_CHECKING

from pgvector.sqlalchemy import Vector
from sqlalchemy import Enum as SAEnum
from sqlalchemy import String
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.core.database import Base

if TYPE_CHECKING:
    from .feedback_rating import FeedbackRating
    from .reservation import Reservation
    from .upsell_conversion import UpsellConversion


class LoyaltyTier(str, enum.Enum):
    STANDARD = "STANDARD"
    SILVER = "SILVER"
    GOLD = "GOLD"
    VIP = "VIP"


class Guest(Base):
    __tablename__ = "guests"

    id: Mapped[int] = mapped_column(primary_key=True)
    # Phone stored as SHA-256 hash for O(1) lookup; encrypted for display
    phone_number_hash: Mapped[str] = mapped_column(String(64), unique=True, index=True)
    phone_number_encrypted: Mapped[str] = mapped_column(String(256))
    name: Mapped[str | None] = mapped_column(String(128), nullable=True)
    language_pref: Mapped[str] = mapped_column(String(8), default="en")
    loyalty_tier: Mapped[LoyaltyTier] = mapped_column(
        SAEnum(LoyaltyTier), default=LoyaltyTier.STANDARD
    )
    # 768-dim embedding from text-embedding-004 — used for semantic preference retrieval
    embedding: Mapped[list[float] | None] = mapped_column(Vector(768), nullable=True)

    # Relationships
    reservations: Mapped[list["Reservation"]] = relationship(
        "Reservation", back_populates="guest"
    )
    upsell_conversions: Mapped[list["UpsellConversion"]] = relationship(
        "UpsellConversion", back_populates="guest"
    )
    feedback_ratings: Mapped[list["FeedbackRating"]] = relationship(
        "FeedbackRating", back_populates="guest"
    )
