import asyncio
from sqlalchemy import text
from app.db.session import engine

async def fix_database():
    print("Checking and fixing database columns...")
    async with engine.connect() as conn:
        # room_categories
        await conn.execute(text("ALTER TABLE room_categories ADD COLUMN IF NOT EXISTS image_url VARCHAR;"))
        
        # bookings
        await conn.execute(text("ALTER TABLE bookings ADD COLUMN IF NOT EXISTS transaction_id VARCHAR;"))
        
        # staff (accounts table)
        # Check and add guest_id to staff if missing
        try:
            await conn.execute(text("ALTER TABLE staff ADD COLUMN IF NOT EXISTS guest_id INTEGER REFERENCES guests(id);"))
            print("Successfully linked Staff to Guest records.")
        except Exception as e:
            print(f"Error updating staff: {e}")

        await conn.commit()
    print("Database fix complete.")

if __name__ == "__main__":
    asyncio.run(fix_database())
