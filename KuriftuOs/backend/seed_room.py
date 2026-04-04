import asyncio
from app.db.session import SessionLocal
from app.models.room import RoomCategory

async def seed():
    async with SessionLocal() as db:
        cat = RoomCategory(
            name="Deluxe Lakeside",
            total_rooms=10,
            available_rooms=5,
            price_per_night=5500.0,
            image_url="https://example.com/deluxe.jpg"
        )
        db.add(cat)
        await db.commit()
        print("Seeded Deluxe Lakeside")

if __name__ == "__main__":
    asyncio.run(seed())
