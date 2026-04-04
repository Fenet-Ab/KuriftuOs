from pydantic import BaseModel
from datetime import datetime
from typing import Optional
from app.db.models.task import TaskStatus, TaskPriority, TaskCategory


class TaskCreate(BaseModel):
    reservation_id: int
    category: TaskCategory
    description: str
    priority: TaskPriority = TaskPriority.NORMAL


class TaskUpdate(BaseModel):
    status: Optional[TaskStatus] = None
    assinged_to: Optional[int] = None


class TaskOut(BaseModel):
    id: int
    reservation_id: int
    category: TaskCategory
    description: str
    priority: TaskPriority
    status: TaskStatus
    assinged_to: Optional[int] = None
    property_id: int
    created_at: datetime
    resolved_at: Optional[datetime]

    class Config:
        from_attributes = True


class TaskAnalytics(BaseModel):
    total_active: int
    total_today: int
    completed_today: int
    escalated_today: int
    avg_resolution_time_today: Optional[float]
    by_category: dict[str, int]
    by_status: dict[str, int]