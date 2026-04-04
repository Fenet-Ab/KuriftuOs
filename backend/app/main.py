from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from app.services.websocket_manager import manager
from fastapi.middleware.cors import CORSMiddleware
import logging
from sqlalchemy import text

# Import core and API
from app.db.session import engine
from app.api.v1.api import api_router
from app.core.config import settings
from app.middleware.auth import AuthMiddleware

logger = logging.getLogger("kuriftuos")

app = FastAPI(title="KuriftuOS Backend")

# 🔐 Register custom middleware (executes last to first for requests)
# AuthMiddleware will run, then CORSMiddleware. 
# Actually, CORSMiddleware should be the FIRST one to catch the request.
# So CORSMiddleware should be added LAST.

app.add_middleware(AuthMiddleware)

# 🌐 CORS Configuration (Added last = Executed first on requests)
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "http://127.0.0.1:3000",
        "http://0.0.0.0:3000",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(api_router, prefix="/api/v1")


@app.on_event("startup")
async def _startup_db_check() -> None:
    try:
        async with engine.connect() as conn:
            await conn.execute(text("SELECT 1"))
        logger.info("DB CONNECTED: Successfully ran SELECT 1")
    except Exception as e:
        msg = repr(e)
        is_pooler_url = ("pooler" in settings.DATABASE_URL.lower()) or (":6543" in settings.DATABASE_URL)
        if "DuplicatePreparedStatementError" in msg and is_pooler_url:
            logger.error(
                "DB CONNECTION FAILED (pgbouncer/pooler). "
                "Your DATABASE_URL looks like a pooler URL (often port 6543). "
                "Use Supabase's DIRECT connection string (port 5432, host like db.<ref>.supabase.co) "
                "or switch pool_mode to 'session'. Error: %s",
                msg,
            )
        else:
            logger.exception("DB CONNECTION FAILED: %r", e)


@app.get("/health/db")
async def health_db():
    try:
        async with engine.connect() as conn:
            await conn.execute(text("SELECT 1"))
        return {"status": "ok", "db": "connected"}
    except Exception as e:
        return {"status": "error", "db": "disconnected", "error": str(e)}


@app.get("/")
async def root():
    return {"message": "KuriftuOS is running"}