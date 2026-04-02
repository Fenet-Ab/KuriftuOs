"""
Room — a physical room or suite at a resort property.
Status is updated by OpsFlow when housekeeping tasks complete.
"""

import enum
from typing import TYPE_CHECKING

from sqlalchemy import Enum as SAEnum
from sqlalchemy import ForeignKey, Integer, Numeric, String
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.core.database import Base

if TYPE_CHECKING:
    from .pricing import PricingRecommendation
    from .property import Property
    from .reservation import Reservation


class RoomCategory(str, enum.Enum):
    STANDARD = "STANDARD"
    DELUXE = "DELUXE"
    LAKE_VIEW = "LAKE_VIEW"
    GARDEN_VIEW = "GARDEN_VIEW"
    SUITE = "SUITE"
    PRESIDENTIAL = "PRESIDENTIAL"


class RoomStatus(str, enum.Enum):
    AVAILABLE = "AVAILABLE"
    OCCUPIED = "OCCUPIED"
    MAINTENANCE = "MAINTENANCE"
    CLEANING = "CLEANING"


class Room(Base):
    __tablename__ = "rooms"

    id: Mapped[int] = mapped_column(primary_key=True)
    number: Mapped[str] = mapped_column(String(16))  # e.g. "101", "SUITE-A"
    category: Mapped[RoomCategory] = mapped_column(SAEnum(RoomCategory))
    floor: Mapped[int] = mapped_column(Integer, default=1)
    status: Mapped[RoomStatus] = mapped_column(
        SAEnum(RoomStatus), default=RoomStatus.AVAILABLE
    )
    base_rate_etb: Mapped[float] = mapped_column(Numeric(10, 2), default=0.0)
    property_id: Mapped[int] = mapped_column(ForeignKey("properties.id"))

    # Relationships
    property: Mapped["Property"] = relationship("Property", back_populates="rooms")
    reservations: Mapped[list["Reservation"]] = relationship(
        "Reservation", back_populates="room"
    )
    pricing_recommendations: Mapped[list["PricingRecommendation"]] = relationship(
        "PricingRecommendation", back_populates="room"
    )
