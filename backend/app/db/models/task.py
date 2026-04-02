"""
Task — a guest service request dispatched by Selam AI to OpsFlow.
Lifecycle: NEW → IN_PROGRESS → COMPLETED | ESCALATED
SLA timers: 5 min URGENT, 15 min NORMAL (auto-escalate via BullMQ job).
"""

import enum
from datetime import datetime
from typing import TYPE_CHECKING

from sqlalchemy import DateTime, ForeignKey, Integer, Text
from sqlalchemy import Enum as SAEnum
from sqlalchemy.orm import Mapped, mapped_column, relationship
from sqlalchemy.sql import func

from app.core.database import Base

if TYPE_CHECKING:
    from .reservation import Reservation
    from .staff import Staff


class TaskCategory(str, enum.Enum):
    HOUSEKEEPING = "HOUSEKEEPING"
    ROOM_SERVICE = "ROOM_SERVICE"
    MAINTENANCE = "MAINTENANCE"
    CONCIERGE = "CONCIERGE"
    SPA = "SPA"


class TaskPriority(str, enum.Enum):
    URGENT = "URGENT"
    HIGH = "HIGH"
    NORMAL = "NORMAL"
    LOW = "LOW"


class TaskStatus(str, enum.Enum):
    NEW = "NEW"
    IN_PROGRESS = "IN_PROGRESS"
    COMPLETED = "COMPLETED"
    ESCALATED = "ESCALATED"


class Task(Base):
    __tablename__ = "tasks"

    id: Mapped[int] = mapped_column(primary_key=True)
    reservation_id: Mapped[int] = mapped_column(
        ForeignKey("reservations.id"), index=True
    )
    category: Mapped[TaskCategory] = mapped_column(SAEnum(TaskCategory))
    description: Mapped[str] = mapped_column(Text)
    priority: Mapped[TaskPriority] = mapped_column(
        SAEnum(TaskPriority), default=TaskPriority.NORMAL
    )
    status: Mapped[TaskStatus] = mapped_column(
        SAEnum(TaskStatus), default=TaskStatus.NEW
    )
    assigned_to: Mapped[int | None] = mapped_column(
        ForeignKey("staff.id"), nullable=True, index=True
    )
    property_id: Mapped[int] = mapped_column(Integer, default=1)
    created_at: Mapped[datetime] = mapped_column(DateTime, server_default=func.now())
    resolved_at: Mapped[datetime | None] = mapped_column(DateTime, nullable=True)

    # Relationships
    reservation: Mapped["Reservation"] = relationship(
        "Reservation", back_populates="tasks"
    )
    assignee: Mapped["Staff | None"] = relationship(
        "Staff", back_populates="assigned_tasks", foreign_keys=[assigned_to]
    )
