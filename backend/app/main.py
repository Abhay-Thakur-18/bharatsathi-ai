from fastapi import FastAPI

from app.core.config import settings
from app.core.logger import app_logger
from app.db.database import client
from app.api.health.router import router as health_router


app_logger.info("BharatSathi AI Backend Started")


app = FastAPI(
    title=settings.APP_NAME,
    description="AI-powered multilingual citizen assistant for India",
    version=settings.APP_VERSION,
)

app.include_router(health_router)


@app.get("/")
def root():
    return {
        "message": "Welcome to BharatSathi AI 🚀",
        "app_name": settings.APP_NAME,
        "version": settings.APP_VERSION
    }


@app.get("/health")
async def health_check():
    try:
        await client.admin.command("ping")

        return {
            "status": "healthy",
            "database": "connected"
        }

    except Exception as e:
        return {
            "status": "error",
            "message": str(e)
        }