import asyncio
from sqlalchemy import text
from app.db.session import engine

async def migrate():
    async with engine.connect() as conn:
        print("Creating feedbacks table if it doesn't exist...")
        try:
            await conn.execute(text("""
                CREATE TABLE IF NOT EXISTS feedbacks (
                    id SERIAL PRIMARY KEY,
                    guest_id INTEGER REFERENCES guests(id),
                    booking_id INTEGER REFERENCES bookings(id),
                    comment VARCHAR NOT NULL,
                    sentiment VARCHAR DEFAULT 'neutral',
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                );
            """))
            await conn.commit()
            print("Successfully checked/created feedbacks table.")
        except Exception as e:
            print(f"Error: {e}")

if __name__ == "__main__":
    asyncio.run(migrate())
