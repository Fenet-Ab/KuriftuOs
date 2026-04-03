"""
SLA escalation worker - runs on a periodic schedule vai BullMQ

Every 60 seconds:
- Queries NEW tasks past their SLA deadline
- Sets them to ESCALATED
- Broadcasts WebSocket event to dashboard
- (Optional) Sends Whatsapp notification to guest

Start this worker alongside uvicorn:
python -m app.modules.opsflow.sla_worker
"""

import asyncio
import logging
from datetime import datetime, timedelta

from app.core.database import AsyncSessionLocal
from app.db.models.task import Task, TaskPriority, TaskStatus
from app.schemas.task import TaskOut
from app.services.websocket_manager import manager
from sqlalchemy import select

logger = logging.getLogger(__name__)

SLA_MINUTES = {
    TaskPriority.URGENT: 5,
    TaskPriority.HIGH: 10,
    TaskPriority.NORMAL: 15,
    TaskPriority.LOW: 30,
}


async def run_escalation_cycle() -> int:
    """Single escalation pass. Returns number of tasks escalated."""
    escalated_count = 0
    now = datetime.utcnow()

    async with AsyncSessionLocal() as db:
        result = await db.execute(
            select(Task).where(
                Task.status == TaskStatus.NEW,
            )
        )
        tasks = result.scalars().all()

        for task in tasks:
            sla_minutes = SLA_MINUTES.get(task.priority, 15)
            deadline = task.created_at + timedelta(minutes=sla_minutes)

            if now > deadline:
                task.status = TaskStatus.ESCALATED
                escalated_count += 1

                await manager.broadcast(
                    {
                        "event": "task_escalated",
                        "task": TaskOut.model_validate(task).model_dump(mode="json"),
                    }
                )

            if escalated_count:
                await db.commit()
                logger.info(f"Escalated {escalated_count} tasks")
        return escalated_count


async def sla_loop(interval_seconds: int = 60):
    """Run escalation check every interval_seconds forever."""
    logger.info("SLA worker started -checking every %ds", interval_seconds)
    while True:
        try:
            await run_escalation_cycle()
        except Exception as e:
            logger.error("Error in SLA escalation cycle: %s", str(e))
        await asyncio.sleep(interval_seconds)


if __name__ == "__main__":
    logging.basicConfig(level=logging.INFO)
    asyncio.run(sla_loop())
