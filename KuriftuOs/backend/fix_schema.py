import asyncio
from app.db.session import engine
from sqlalchemy import text

async def fix_db():
    async with engine.begin() as conn:
        print("Starting DB fix...")
        await conn.execute(text("ALTER TABLE bookings ADD COLUMN IF NOT EXISTS total_price FLOAT;"))
        await conn.execute(text("ALTER TABLE tasks ADD COLUMN IF NOT EXISTS sentiment VARCHAR DEFAULT 'neutral';"))
        await conn.execute(text("ALTER TABLE tasks ADD COLUMN IF NOT EXISTS sentiment_score INTEGER DEFAULT 0;"))
        print("Columns sentiment and sentiment_score added to tasks successfully.")

if __name__ == "__main__":
    asyncio.run(fix_db())
