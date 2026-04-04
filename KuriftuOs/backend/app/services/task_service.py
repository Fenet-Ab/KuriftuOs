"""
Task service — create tasks, run SLA checks, compute analytics.
SLA thresholds: URGENT=5min, HIGH=10min, NORMAL=15min, LOW=30min.
"""

from datetime import datetime, timedelta
from typing import Optional

from app.db.models.task import Task, TaskPriority, TaskStatus
from app.schemas.task import TaskAnalytics
from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession

SLA_MINUTES = {
    TaskPriority.URGENT: 5,
    TaskPriority.HIGH: 10,
    TaskPriority.NORMAL: 15,
    TaskPriority.LOW: 30,
}


class TaskService:
    def __init__(self, db: AsyncSession):
        self.db = db

    async def get_analytics(self, property_id: Optional[int] = None) -> TaskAnalytics:
        now = datetime.utcnow()
        today_start = now.replace(hour=0, minute=0, second=0, microsecond=0)

        base = select(Task)
        if property_id:
            base = base.where(Task.property_id == property_id)

        # Active tasks (not completed/escalated)
        active_q = await self.db.execute(
            base.where(
                Task.status.in_([TaskStatus.NEW, TaskStatus.IN_PROGRESS])
            ).with_only_columns(func.count())
        )
        total_active = active_q.scalar_one()

        # Today's tasks
        today_q = await self.db.execute(
            base.where(Task.created_at >= today_start).with_only_columns(func.count())
        )
        total_today = today_q.scalar_one()

        # Completed today
        comp_q = await self.db.execute(
            base.where(
                Task.status == TaskStatus.COMPLETED,
                Task.resolved_at >= today_start,
            ).with_only_columns(func.count())
        )
        completed_today = comp_q.scalar_one()

        # Escalated today
        esc_q = await self.db.execute(
            base.where(
                Task.status == TaskStatus.ESCALATED,
                Task.created_at >= today_start,
            ).with_only_columns(func.count())
        )
        escalated_today = esc_q.scalar_one()

        # Average resolution time (minutes) for tasks completed today
        avg_q = await self.db.execute(
            select(
                func.avg(
                    func.extract("epoch", Task.resolved_at)
                    - func.extract("epoch", Task.created_at)
                )
            ).where(
                Task.status == TaskStatus.COMPLETED,
                Task.resolved_at >= today_start,
                Task.resolved_at.isnot(None),
            )
        )
        avg_seconds = avg_q.scalar_one()
        avg_minutes = round(avg_seconds / 60, 1) if avg_seconds else None

        # By category
        cat_q = await self.db.execute(
            select(Task.category, func.count()).group_by(Task.category)
        )
        by_category = {row[0].value: row[1] for row in cat_q.all()}

        # By status
        stat_q = await self.db.execute(
            select(Task.status, func.count()).group_by(Task.status)
        )
        by_status = {row[0].value: row[1] for row in stat_q.all()}

        return TaskAnalytics(
            total_active=total_active,
            total_today=total_today,
            completed_today=completed_today,
            escalated_today=escalated_today,
            avg_resolution_minutes=avg_minutes,
            by_category=by_category,
            by_status=by_status,
        )

    async def escalate_overdue(self) -> int:
        """
        Called by the SLA worker (BullMQ job).
        Escalates any NEW task past its SLA window.
        Returns count of escalated tasks.
        """
        now = datetime.utcnow()
        escalated = 0

        result = await self.db.execute(
            select(Task).where(Task.status == TaskStatus.NEW)
        )
        tasks = result.scalars().all()

        for task in tasks:
            sla_mins = SLA_MINUTES.get(task.priority, 15)
            deadline = task.created_at + timedelta(minutes=sla_mins)
            if now > deadline:
                task.status = TaskStatus.ESCALATED
                escalated += 1

        if escalated:
            await self.db.commit()
        return escalated