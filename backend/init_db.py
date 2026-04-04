import asyncio
from app.db.session import engine
from app.db.base import Base
from app.models.room import Room, RoomCategory
from app.models.booking import Booking
from app.models.guest import Guest
from app.models.staff import Staff
from app.models.feedback import Feedback
from app.models.automation import SmartDevice, RoomMood
from app.models.chat import ChatMessage

async def init_db():
    async with engine.begin() as conn:
        # Create all tables that don't exist
        print("Checking tables...")
        await conn.run_sync(Base.metadata.create_all)
        print("Done.")

if __name__ == "__main__":
    asyncio.run(init_db())