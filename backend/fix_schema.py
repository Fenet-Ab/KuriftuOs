import asyncio
from app.db.session import engine
from sqlalchemy import text

async def fix_db():
    async with engine.begin() as conn:
        print("Starting DB fix...")
        await conn.execute(text("ALTER TABLE bookings ADD COLUMN IF NOT EXISTS total_price FLOAT;"))
        print("Column total_price added successfully.")

if __name__ == "__main__":
    asyncio.run(fix_db())
