from pydantic import BaseModel
from datetime import datetime
from typing import Optional
from app.models.task import TaskStatus, TaskPriority, TaskCategory


class TaskCreate(BaseModel):
    reservation_id: int
    category: TaskCategory
    description: str
    priority: TaskPriority = TaskPriority.NORMAL


class TaskUpdate(BaseModel):
    status: Optional[TaskStatus] = None
    assigned_to: Optional[int] = None


class TaskOut(BaseModel):
    id: int
    reservation_id: Optional[int]
    category: TaskCategory
    description: str
    priority: TaskPriority
    status: TaskStatus
    assigned_to: Optional[int] = None
    property_id: int
    created_at: datetime
    resolved_at: Optional[datetime]
    sentiment: str = "neutral"
    sentiment_score: int = 0

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
    sentiment_distribution: dict[str, int] = {"positive": 0, "negative": 0, "neutral": 0}