from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from app.models.guest import Guest

async def create_guest(db: AsyncSession, guest_data):
    guest = Guest(**guest_data.dict())
    db.add(guest)
    await db.commit()
    await db.refresh(guest)
    return guest

async def get_guest(db: AsyncSession, guest_id: int):
    result = await db.execute(select(Guest).where(Guest.id == guest_id))
    return result.scalar_one_or_none()