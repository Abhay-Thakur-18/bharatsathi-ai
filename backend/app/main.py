from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.core.config import settings
from app.core.logger import app_logger

# Database connection helpers
from app.db.database import connect_to_mongo, disconnect_from_mongo, client

# Repository initializers
from app.repositories.user_repository import initialize_indexes
from app.repositories.chat_repository import initialize_chat_indexes
from app.repositories.scheme_repository import initialize_scheme_indexes, seed_sample_schemes
from app.repositories.healthcare_repository import initialize_healthcare_indexes
from app.repositories.agriculture_repository import initialize_agriculture_indexes
from app.repositories.career_repository import initialize_career_indexes
from app.repositories.analytics_repository import initialize_analytics_indexes

# API routers
from app.api.health.router import router as health_router
from app.api.auth.router import router as auth_router
from app.api.chat.router import router as chat_router
from app.api.schemes.router import router as schemes_router
from app.api.healthcare.router import router as healthcare_router
from app.api.agriculture.router import router as agriculture_router
from app.api.career.router import router as career_router

# Groq startup validation (replaces Gemini)
from app.services.groq_service import startup_groq_validation


app_logger.info("BharatSathi AI Backend — starting up")


@asynccontextmanager
async def lifespan(app: FastAPI):
    """
    Application lifespan handler.

    Startup:
      1. Connect & ping MongoDB Atlas
      2. Create all collection indexes
      3. Seed sample scheme data (idempotent)

    Shutdown:
      1. Close Motor connection pool gracefully
    """
    # ------------------------------------------------------------------ #
    # STARTUP
    # ------------------------------------------------------------------ #
    app_logger.info("=== STARTUP: Verifying MongoDB Atlas connection ===")
    await connect_to_mongo()

    app_logger.info("=== STARTUP: Initializing collection indexes ===")
    await initialize_indexes()           # users
    await initialize_chat_indexes()      # conversations, messages
    await initialize_scheme_indexes()    # schemes, scheme_searches
    await initialize_healthcare_indexes()  # healthcare_queries
    await initialize_agriculture_indexes() # agriculture_queries
    await initialize_career_indexes()    # career_queries
    await initialize_analytics_indexes() # analytics, feedback, logs, user_profiles
    app_logger.info("All collection indexes created/verified")

    app_logger.info("=== STARTUP: Seeding sample government schemes ===")
    await seed_sample_schemes()

    app_logger.info("=== STARTUP: Validating Groq AI API key ===")
    await startup_groq_validation()  # Logs errors but does not block startup

    app_logger.info("=== Application startup complete — ready to serve ===")

    yield

    # ------------------------------------------------------------------ #
    # SHUTDOWN
    # ------------------------------------------------------------------ #
    app_logger.info("=== SHUTDOWN: Closing MongoDB connection pool ===")
    await disconnect_from_mongo()
    app_logger.info("=== Application shutdown complete ===")


app = FastAPI(
    title=settings.APP_NAME,
    description="AI-powered multilingual citizen assistant for India",
    version=settings.APP_VERSION,
    docs_url="/docs" if settings.DEBUG else None,
    redoc_url="/redoc" if settings.DEBUG else None,
    lifespan=lifespan,
)

# ------------------------------------------------------------------ #
# Middleware
# ------------------------------------------------------------------ #
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins_list,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ------------------------------------------------------------------ #
# Routers
# ------------------------------------------------------------------ #
app.include_router(health_router)
app.include_router(auth_router)
app.include_router(chat_router)
app.include_router(schemes_router)
app.include_router(healthcare_router)
app.include_router(agriculture_router)
app.include_router(career_router)


# ------------------------------------------------------------------ #
# Root endpoint
# ------------------------------------------------------------------ #
@app.get("/")
def root():
    return {
        "message": "Welcome to BharatSathi AI 🚀",
        "app_name": settings.APP_NAME,
        "version": settings.APP_VERSION,
        "environment": settings.ENVIRONMENT,
        "modules": [
            "Authentication",
            "AI Chat",
            "Government Schemes",
            "Healthcare",
            "Agriculture",
            "Career Guidance",
        ],
        "docs": "/docs" if settings.DEBUG else "disabled in production",
    }


# ------------------------------------------------------------------ #
# Legacy /health top-level shortcut (kept for backwards compatibility)
# ------------------------------------------------------------------ #
@app.get("/health")
async def health_check():
    """Top-level liveness probe — pings MongoDB."""
    try:
        await client.admin.command("ping")
        return {
            "status": "healthy",
            "database": "connected",
            "modules": {
                "auth": "active",
                "chat": "active",
                "schemes": "active",
                "healthcare": "active",
                "agriculture": "active",
                "career": "active",
            },
        }
    except Exception as exc:
        app_logger.error(f"Health check failed: {exc}")
        return {"status": "error", "message": str(exc)}
