"""
UpsellPackage  — configurable add-on packages offered via Selam AI.
UpsellConversion — records every accepted upsell for RevSense ROI tracking.
"""

import enum
from datetime import datetime
from typing import TYPE_CHECKING

from sqlalchemy import (
    Boolean,
    DateTime,
    ForeignKey,
    Integer,
    Numeric,
    String,
    Text,
)
from sqlalchemy import (
    Enum as SAEnum,
)
from sqlalchemy.orm import Mapped, mapped_column, relationship
from sqlalchemy.sql import func

from app.core.database import Base

if TYPE_CHECKING:
    from .guest import Guest
    from .reservation import Reservation


class UpsellCategory(str, enum.Enum):
    SPA = "SPA"
    DINING = "DINING"
    ACTIVITY = "ACTIVITY"
    TRANSPORT = "TRANSPORT"
    CELEBRATION = "CELEBRATION"


class UpsellPackage(Base):
    __tablename__ = "upsell_packages"

    id: Mapped[int] = mapped_column(primary_key=True)
    name: Mapped[str] = mapped_column(String(128))
    description: Mapped[str] = mapped_column(Text)
    price_etb: Mapped[float] = mapped_column(Numeric(10, 2))
    category: Mapped[UpsellCategory] = mapped_column(SAEnum(UpsellCategory))
    is_active: Mapped[bool] = mapped_column(Boolean, default=True)
    # Comma-separated time tags: "morning,afternoon,evening"
    best_for_times: Mapped[str] = mapped_column(
        String(64), default="morning,afternoon,evening"
    )
    property_id: Mapped[int] = mapped_column(Integer, default=0)  # 0 = all properties

    # Relationships
    conversions: Mapped[list["UpsellConversion"]] = relationship(
        "UpsellConversion", back_populates="package"
    )


class UpsellConversion(Base):
    __tablename__ = "upsell_conversions"

    id: Mapped[int] = mapped_column(primary_key=True)
    guest_id: Mapped[int] = mapped_column(ForeignKey("guests.id"), index=True)
    reservation_id: Mapped[int] = mapped_column(
        ForeignKey("reservations.id"), index=True
    )
    package_id: Mapped[int] = mapped_column(ForeignKey("upsell_packages.id"))
    revenue_etb: Mapped[float] = mapped_column(Numeric(10, 2))
    converted_at: Mapped[datetime] = mapped_column(DateTime, server_default=func.now())

    # Relationships
    guest: Mapped["Guest"] = relationship("Guest", back_populates="upsell_conversions")
    reservation: Mapped["Reservation"] = relationship(
        "Reservation", back_populates="upsell_conversions"
    )
    package: Mapped["UpsellPackage"] = relationship(
        "UpsellPackage", back_populates="conversions"
    )
