"""
OpsFlow task endpoints — complete implementation.
GET    /tasks              → list tasks (filterable)
POST   /tasks              → create task (called by Selam AI tool)
GET    /tasks/analytics    → aggregated stats for manager dashboard
GET    /tasks/{id}         → single task detail
PATCH  /tasks/{id}/status  → update status (staff action)
PATCH  /tasks/{id}/assign  → assign to staff member
"""

from datetime import datetime

from app.core.database import get_db
from app.core.deps import get_current_staff, require_manager
from app.db.models.staff import Staff
from app.db.models.task import Task, TaskCategory, TaskPriority, TaskStatus
from app.schemas.task import TaskAnalytics, TaskCreate, TaskOut, TaskUpdate
from app.services.task_service import TaskService
from app.services.websocket_manager import manager
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

router = APIRouter(prefix="/tasks", tags=["tasks"])


@router.get("/analytics", response_model=TaskAnalytics)
async def get_analytics(
    property_id: int | None = Query(None),
    db: AsyncSession = Depends(get_db),
    _staff: Staff = Depends(require_manager),
):
    svc = TaskService(db)
    return await svc.get_analytics(property_id)


@router.get("", response_model=list[TaskOut])
async def list_tasks(
    status: TaskStatus | None = Query(None),
    category: TaskCategory | None = Query(None),
    priority: TaskPriority | None = Query(None),
    property_id: int | None = Query(None),
    assigned_to: int | None = Query(None),
    limit: int = Query(50, le=200),
    offset: int = Query(0),
    db: AsyncSession = Depends(get_db),
    _staff: Staff = Depends(get_current_staff),
):
    query = select(Task)
    if status:
        query = query.where(Task.status == status)
    if category:
        query = query.where(Task.category == category)
    if priority:
        query = query.where(Task.priority == priority)
    if property_id:
        query = query.where(Task.property_id == property_id)
    if assigned_to:
        query = query.where(Task.assigned_to == assigned_to)

    query = query.order_by(Task.created_at.desc()).limit(limit).offset(offset)
    result = await db.execute(query)
    return result.scalars().all()


@router.post("", response_model=TaskOut, status_code=201)
async def create_task(
    payload: TaskCreate,
    db: AsyncSession = Depends(get_db),
):
    """
    Called by Selam AI create_task() tool via internal HTTP.
    No JWT required — protected by X-Internal-Token header check (handled in middleware).
    """
    task = Task(**payload.model_dump())
    db.add(task)
    await db.commit()
    await db.refresh(task)

    await manager.broadcast(
        {
            "event": "task_created",
            "task": TaskOut.model_validate(task).model_dump(mode="json"),
        }
    )
    return task


@router.get("/{task_id}", response_model=TaskOut)
async def get_task(
    task_id: int,
    db: AsyncSession = Depends(get_db),
    _staff: Staff = Depends(get_current_staff),
):
    result = await db.execute(select(Task).where(Task.id == task_id))
    task = result.scalar_one_or_none()
    if not task:
        raise HTTPException(status_code=404, detail="Task not found")
    return task


@router.patch("/{task_id}/status", response_model=TaskOut)
async def update_task_status(
    task_id: int,
    payload: TaskUpdate,
    db: AsyncSession = Depends(get_db),
    _staff: Staff = Depends(get_current_staff),
):
    result = await db.execute(select(Task).where(Task.id == task_id))
    task = result.scalar_one_or_none()
    if not task:
        raise HTTPException(status_code=404, detail="Task not found")

    if payload.status:
        task.status = payload.status
        if payload.status == TaskStatus.COMPLETED:
            task.resolved_at = datetime.utcnow()
    if payload.assigned_to is not None:
        task.assigned_to = payload.assigned_to

    await db.commit()
    await db.refresh(task)

    await manager.broadcast(
        {
            "event": "task_updated",
            "task": TaskOut.model_validate(task).model_dump(mode="json"),
        }
    )
    return task


@router.patch("/{task_id}/assign", response_model=TaskOut)
async def assign_task(
    task_id: int,
    staff_id: int,
    db: AsyncSession = Depends(get_db),
    current_staff: Staff = Depends(get_current_staff),
):
    result = await db.execute(select(Task).where(Task.id == task_id))
    task = result.scalar_one_or_none()
    if not task:
        raise HTTPException(status_code=404, detail="Task not found")

    task.assigned_to = staff_id
    if task.status == TaskStatus.NEW:
        task.status = TaskStatus.IN_PROGRESS

    await db.commit()
    await db.refresh(task)

    await manager.broadcast(
        {
            "event": "task_assigned",
            "task": TaskOut.model_validate(task).model_dump(mode="json"),
        }
    )
    return task
