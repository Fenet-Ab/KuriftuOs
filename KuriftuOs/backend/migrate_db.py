import asyncio
from sqlalchemy import text
from app.db.session import engine

async def migrate():
    async with engine.connect() as conn:
        print("Checking for avatar_url column...")
        try:
            await conn.execute(text("ALTER TABLE staff ADD COLUMN avatar_url VARCHAR;"))
            await conn.commit()
            print("Successfully added avatar_url column to staff table.")
        except Exception as e:
            print(f"Error (maybe column already exists): {e}")

if __name__ == "__main__":
    asyncio.run(migrate())
