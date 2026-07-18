"""
Health Router

Endpoints:
  GET /health/          — basic liveness probe
  GET /health/database  — full MongoDB Atlas health check
"""

import time
from fastapi import APIRouter
from app.db.database import client, db
from app.core.config import settings
from app.core.logger import app_logger


router = APIRouter(
    prefix="/health",
    tags=["Health"],
)


@router.get("/")
async def health_check():
    """Quick liveness probe — no DB call."""
    return {
        "status": "ok",
        "service": "BharatSathi AI Backend",
        "version": settings.APP_VERSION,
        "environment": settings.ENVIRONMENT,
    }


@router.get("/database")
async def database_health():
    """
    Full MongoDB Atlas health check.

    Verifies:
    - Ping round-trip and latency
    - Collections present in the database
    - Index counts per collection

    Returns a structured JSON report.
    """
    # ----- Ping -----
    try:
        start = time.monotonic()
        await client.admin.command("ping")
        latency_ms = round((time.monotonic() - start) * 1000, 2)
        ping_status = "success"
        connection_status = "connected"
    except Exception as exc:
        app_logger.error(f"DB health ping failed: {exc}")
        return {
            "status": "unhealthy",
            "database": "MongoDB Atlas",
            "connection": "disconnected",
            "ping": "failed",
            "error": str(exc),
        }

    # ----- Collections -----
    try:
        collection_names = await db.list_collection_names()
    except Exception as exc:
        collection_names = []
        app_logger.error(f"Could not list collections: {exc}")

    # Expected collections
    expected = {
        "users",
        "conversations",
        "messages",
        "schemes",
        "scheme_searches",
        "healthcare_queries",
        "agriculture_queries",
        "career_queries",
        "user_profiles",
        "feedback",
        "analytics",
        "logs",
    }
    missing = sorted(expected - set(collection_names))

    # ----- Index verification -----
    index_summary: dict = {}
    for col_name in collection_names:
        try:
            col = db[col_name]
            index_info = await col.index_information()
            index_summary[col_name] = len(index_info)
        except Exception:
            index_summary[col_name] = "error"

    # ----- Server info -----
    try:
        server_info = await client.server_info()
        db_version = server_info.get("version", "unknown")
    except Exception:
        db_version = "unknown"

    overall_status = "healthy" if not missing else "degraded"

    return {
        "status": overall_status,
        "database": "MongoDB Atlas",
        "database_name": settings.DATABASE_NAME,
        "connection": connection_status,
        "ping": ping_status,
        "latency_ms": latency_ms,
        "server_version": db_version,
        "collections_present": sorted(collection_names),
        "collections_missing": missing,
        "index_counts_per_collection": index_summary,
        "indexes": "verified" if not missing else "partial",
    }
