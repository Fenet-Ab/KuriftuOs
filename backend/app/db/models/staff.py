"""
Staff — internal resort employees who log in to OpsFlow dashboard.
Each staff member belongs to one property and one department.
"""

import enum
from datetime import datetime
from typing import TYPE_CHECKING

from sqlalchemy import Boolean, DateTime, Integer, String
from sqlalchemy import Enum as SAEnum
from sqlalchemy.orm import Mapped, mapped_column, relationship
from sqlalchemy.sql import func

from app.core.database import Base

if TYPE_CHECKING:
    from .auth import RefreshToken
    from .task import Task


class StaffRole(str, enum.Enum):
    FRONT_DESK = "FRONT_DESK"
    HOUSEKEEPING = "HOUSEKEEPING"
    FB = "FB"  # Food & Beverage
    SPA = "SPA"
    MANAGER = "MANAGER"
    ADMIN = "ADMIN"


class Staff(Base):
    __tablename__ = "staff"

    id: Mapped[int] = mapped_column(primary_key=True)
    name: Mapped[str] = mapped_column(String(128))
    email: Mapped[str] = mapped_column(String(256), unique=True, index=True)
    hashed_password: Mapped[str] = mapped_column(String(256))
    role: Mapped[StaffRole] = mapped_column(SAEnum(StaffRole))
    is_active: Mapped[bool] = mapped_column(Boolean, default=True)
    property_id: Mapped[int] = mapped_column(Integer, default=1)
    created_at: Mapped[datetime] = mapped_column(DateTime, server_default=func.now())
    last_login_at: Mapped[datetime | None] = mapped_column(DateTime, nullable=True)

    # Failed login tracking for account lockout (NFR-S-06)
    failed_login_count: Mapped[int] = mapped_column(Integer, default=0)
    locked_until: Mapped[datetime | None] = mapped_column(DateTime, nullable=True)

    # Relationships
    assigned_tasks: Mapped[list["Task"]] = relationship(
        "Task", back_populates="assignee", foreign_keys="Task.assigned_to"
    )
    refresh_tokens: Mapped[list["RefreshToken"]] = relationship(
        "RefreshToken", back_populates="staff", cascade="all, delete-orphan"
    )
