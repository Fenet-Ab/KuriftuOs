from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api.v1.endpoints.tasks import router as tasks_router

app = FastAPI(
    title="KuriftuOS API",
    description="AI-Powered Resort Intelligence Platform",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
    allow_credentials=True,
)

PREFIX = "/api/v1"

app.include_router(tasks_router, prefix=PREFIX)


@app.get("/health")
async def health_check():
    return {"status": "ok", "service": "KuriftuOS API"}
