"""
EchoInsight AI — FastAPI Application Entry Point
"""

from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from contextlib import asynccontextmanager

from app.config import get_settings
from app.utils.logger import logger
from app.database import get_supabase

# ── Import routers ────────────────────────────────────────
from app.routers import upload, conversations, analysis, analytics, reports

settings = get_settings()


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Startup & shutdown events."""
    logger.info(f"Starting {settings.APP_NAME} on port {settings.APP_PORT}")
    # Warm up Supabase client
    get_supabase()
    logger.info("Supabase client ready")
    yield
    logger.info("Shutting down…")


app = FastAPI(
    title=settings.APP_NAME,
    description="Intelligent Call Center Communication Evaluator — Analyzes conversations and evaluates agent quality.",
    version="1.0.0",
    lifespan=lifespan,
)

# ── CORS ──────────────────────────────────────────────────
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins_list,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ── Global Exception Handler ─────────────────────────────
@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    logger.error(f"Unhandled error: {exc}")
    return JSONResponse(
        status_code=500,
        content={
            "success": False,
            "data": None,
            "error": {
                "code": "INTERNAL_SERVER_ERROR",
                "message": str(exc) if settings.DEBUG else "An unexpected error occurred.",
            },
        },
    )


# ── Register Routers ─────────────────────────────────────
app.include_router(upload.router,        prefix="/api/v1", tags=["Upload"])
app.include_router(conversations.router, prefix="/api/v1", tags=["Conversations"])
app.include_router(analysis.router,      prefix="/api/v1", tags=["Analysis"])
app.include_router(analytics.router,     prefix="/api/v1", tags=["Analytics"])
app.include_router(reports.router,       prefix="/api/v1", tags=["Reports"])


# ── Health Check ──────────────────────────────────────────
@app.get("/", tags=["Health"])
async def root():
    return {
        "success": True,
        "data": {
            "app": settings.APP_NAME,
            "version": "1.0.0",
            "status": "healthy",
        },
    }


@app.get("/health", tags=["Health"])
async def health_check():
    return {"status": "ok"}


# ── Run with uvicorn ──────────────────────────────────────
if __name__ == "__main__":
    import uvicorn
    uvicorn.run(
        "main:app",
        host=settings.APP_HOST,
        port=settings.APP_PORT,
        reload=settings.DEBUG,
    )
