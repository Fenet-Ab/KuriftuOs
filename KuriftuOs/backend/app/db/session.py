from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession
from sqlalchemy.orm import sessionmaker
from app.core.config import settings

connect_args = {}

# asyncpg + pgbouncer/pooler can fail on prepared statements.
# Only apply these asyncpg-specific args when using asyncpg URLs.
if "+asyncpg" in settings.DATABASE_URL:
    connect_args = {
        "statement_cache_size": 0,
        "prepared_statement_cache_size": 0,
    }

engine = create_async_engine(settings.DATABASE_URL, echo=True, connect_args=connect_args)

SessionLocal = sessionmaker(
    bind=engine,
    class_=AsyncSession,
    expire_on_commit=False
)

async def get_db():
    async with SessionLocal() as session:
        yield session