"""
Import all models here so SQLAlchemy's mapper registry is fully populated
before Alembic autogenerates migrations. Order matters — parents first.
"""

from app.db.models.auth import RefreshToken  # FK: staff
from app.db.models.feedback import FeedbackRating  # FK: guest, reservation
from app.db.models.guest import Guest, LoyaltyTier  # no FK deps
from app.db.models.pricing import (  # FK: room
    PricingConfidence,
    PricingDecision,
    PricingRecommendation,
)
from app.db.models.property import Property  # no FK deps
from app.db.models.reservation import (  # FK: guest, room, property
    Reservation,
    ReservationStatus,
)
from app.db.models.room import Room, RoomCategory, RoomStatus  # FK: property
from app.db.models.staff import Staff, StaffRole  # no FK deps
from app.db.models.task import (  # FK: reservation, staff
    Task,
    TaskCategory,
    TaskPriority,
    TaskStatus,
)
from app.db.models.upsell import (  # FK: guest, reservation
    UpsellCategory,
    UpsellConversion,
    UpsellPackage,
)

__all__ = [
    "Property",
    "Guest",
    "LoyaltyTier",
    "Staff",
    "StaffRole",
    "RefreshToken",
    "Room",
    "RoomCategory",
    "RoomStatus",
    "Reservation",
    "ReservationStatus",
    "Task",
    "TaskCategory",
    "TaskPriority",
    "TaskStatus",
    "UpsellPackage",
    "UpsellConversion",
    "UpsellCategory",
    "PricingRecommendation",
    "PricingConfidence",
    "PricingDecision",
    "FeedbackRating",
]
