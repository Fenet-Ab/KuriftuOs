import asyncio
import sys
from logging.config import fileConfig
from pathlib import Path

from alembic import context
from sqlalchemy import pool
from sqlalchemy.ext.asyncio import async_engine_from_config

# Add the project root to Python path
sys.path.insert(0, str(Path(__file__).parents[3]))

# ------------------- Logging -------------------
if context.config.config_file_name is not None:
    fileConfig(context.config.config_file_name)

# ------------------- Import your Base -------------------
from app.core.database import Base  # Make sure this imports your declarative Base

target_metadata = Base.metadata


# ------------------- Offline Mode -------------------
def run_migrations_offline() -> None:
    """Run migrations in 'offline' mode."""
    url = context.config.get_main_option("sqlalchemy.url")
    context.configure(
        url=url,
        target_metadata=target_metadata,
        literal_binds=True,
        dialect_opts={"paramstyle": "named"},
    )

    with context.begin_transaction():
        context.run_migrations()


# ------------------- Online Mode (Async) -------------------
async def run_async_migrations() -> None:
    """In this scenario we need to create an async engine and run migrations."""
    connectable = async_engine_from_config(
        context.config.get_section(context.config.config_ini_section),
        prefix="sqlalchemy.",
        poolclass=pool.NullPool,
    )

    async with connectable.connect() as connection:
        await connection.run_sync(do_run_migrations)

    await connectable.dispose()


def do_run_migrations(connection):
    """This function is run synchronously inside the async connection."""
    context.configure(
        connection=connection,
        target_metadata=target_metadata,
    )

    with context.begin_transaction():
        context.run_migrations()


def run_migrations_online() -> None:
    """Run migrations in 'online' mode."""
    asyncio.run(run_async_migrations())


# ------------------- Choose mode -------------------
if context.is_offline_mode():
    run_migrations_offline()
else:
    run_migrations_online()
