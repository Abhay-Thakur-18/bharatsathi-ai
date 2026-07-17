from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.core.config import settings
from app.core.logger import app_logger
from app.db.database import client
from app.repositories.user_repository import initialize_indexes
from app.repositories.chat_repository import initialize_chat_indexes
from app.repositories.scheme_repository import initialize_scheme_indexes, seed_sample_schemes

from app.api.health.router import router as health_router
from app.api.auth.router import router as auth_router
from app.api.chat.router import router as chat_router
from app.api.schemes.router import router as schemes_router
from app.api.healthcare.router import router as healthcare_router
from app.api.agriculture.router import router as agriculture_router
from app.api.career.router import router as career_router


app_logger.info("BharatSathi AI Backend Started")


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Application lifespan events"""
    # Startup
    app_logger.info("Initializing database indexes...")
    await initialize_indexes()
    await initialize_chat_indexes()
    await initialize_scheme_indexes()
    
    app_logger.info("Seeding sample data...")
    await seed_sample_schemes()
    
    app_logger.info("Application startup complete")
    
    yield
    
    # Shutdown
    app_logger.info("Application shutting down...")


app = FastAPI(
    title=settings.APP_NAME,
    description="AI-powered multilingual citizen assistant for India",
    version=settings.APP_VERSION,
    docs_url="/docs" if settings.DEBUG else None,
    redoc_url="/redoc" if settings.DEBUG else None,
    lifespan=lifespan
)


# CORS Middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins_list,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# Routers
app.include_router(health_router)
app.include_router(auth_router)
app.include_router(chat_router)
app.include_router(schemes_router)
app.include_router(healthcare_router)
app.include_router(agriculture_router)
app.include_router(career_router)


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
            "Career Guidance"
        ]
    }


@app.get("/health")
async def health_check():
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
                "career": "active"
            }
        }

    except Exception as e:
        app_logger.error(f"Health check failed: {str(e)}")
        return {
            "status": "error",
            "message": str(e)
        }