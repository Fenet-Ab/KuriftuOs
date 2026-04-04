from enum import Enum
from sqlalchemy import Column, Integer, String, Text, DateTime, ForeignKey, Enum as SqlEnum
from sqlalchemy.sql import func
from app.db.base import Base

class TaskStatus(str, Enum):
    NEW = "new"
    IN_PROGRESS = "in_progress"
    COMPLETED = "completed"
    ESCALATED = "escalated"

class TaskPriority(str, Enum):
    LOW = "low"
    NORMAL = "normal"
    HIGH = "high"
    URGENT = "urgent"

class TaskCategory(str, Enum):
    HOUSEKEEPING = "housekeeping"
    MAINTENANCE = "maintenance"
    ROOM_SERVICE = "room_service"
    CONCIERGE = "concierge"
    SPA = "spa"
    OTHER = "other"

class Task(Base):
    __tablename__ = "tasks"

    id = Column(Integer, primary_key=True, index=True)
    reservation_id = Column(Integer, ForeignKey("bookings.id"), nullable=True) # Optional link to a booking
    category = Column(SqlEnum(TaskCategory), default=TaskCategory.OTHER)
    description = Column(Text, nullable=False)
    priority = Column(SqlEnum(TaskPriority), default=TaskPriority.NORMAL)
    status = Column(SqlEnum(TaskStatus), default=TaskStatus.NEW)
    assigned_to = Column(Integer, ForeignKey("staff.id"), nullable=True)
    property_id = Column(Integer, default=1) # Default to main property
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    resolved_at = Column(DateTime(timezone=True), nullable=True)
