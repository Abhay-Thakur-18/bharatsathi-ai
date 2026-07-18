"""
MongoDB Database Connection

Async Motor client with:
- Connection pooling
- Proper timeouts
- Ping on startup
- Graceful shutdown
- Logging
"""

from motor.motor_asyncio import AsyncIOMotorClient, AsyncIOMotorDatabase
from pymongo.errors import (
    ConnectionFailure,
    ConfigurationError,
    ServerSelectionTimeoutError,
    OperationFailure
)
from app.core.config import settings
from app.core.logger import app_logger

# ---------------------------------------------------------------------------
# Client configuration
# ---------------------------------------------------------------------------
_CLIENT_OPTIONS = {
    # Connection pool
    "maxPoolSize": 50,
    "minPoolSize": 5,
    # Timeouts (ms)
    "connectTimeoutMS": 10_000,
    "socketTimeoutMS": 30_000,
    "serverSelectionTimeoutMS": 10_000,
    # Heartbeat / keep-alive
    "heartbeatFrequencyMS": 10_000,
    # Automatic retries (built-in Motor/PyMongo)
    "retryWrites": True,
    "retryReads": True,
    # App tag visible in Atlas
    "appName": "BharatSathi-AI",
}


def _create_client() -> AsyncIOMotorClient:
    """Construct the Motor client from settings."""
    try:
        c = AsyncIOMotorClient(settings.MONGODB_URI, **_CLIENT_OPTIONS)
        app_logger.info("MongoDB Motor client created (lazy — not yet connected)")
        return c
    except ConfigurationError as exc:
        app_logger.error(f"Invalid MongoDB URI: {exc}")
        raise


client: AsyncIOMotorClient = _create_client()
database: AsyncIOMotorDatabase = client[settings.DATABASE_NAME]

# Convenience alias used throughout the codebase
db: AsyncIOMotorDatabase = database


# ---------------------------------------------------------------------------
# Startup helpers
# ---------------------------------------------------------------------------

async def connect_to_mongo() -> None:
    """
    Ping MongoDB to verify the connection is live.
    Called during application startup (lifespan).

    Raises:
        RuntimeError: if the Atlas cluster is unreachable.
    """
    try:
        app_logger.info(
            f"Connecting to MongoDB Atlas — database: '{settings.DATABASE_NAME}'"
        )
        await client.admin.command("ping")
        server_info = await client.server_info()
        app_logger.info(
            f"MongoDB connected — version: {server_info.get('version', 'unknown')}"
        )
    except ServerSelectionTimeoutError as exc:
        app_logger.error(
            f"MongoDB Atlas unreachable (timeout): {exc}. "
            "Check MONGODB_URI and network/firewall settings."
        )
        raise RuntimeError(f"Cannot connect to MongoDB Atlas: {exc}") from exc
    except OperationFailure as exc:
        app_logger.error(
            f"MongoDB authentication failed: {exc}. "
            "Check username/password in MONGODB_URI."
        )
        raise RuntimeError(f"MongoDB authentication error: {exc}") from exc
    except ConnectionFailure as exc:
        app_logger.error(f"MongoDB connection failure: {exc}")
        raise RuntimeError(f"MongoDB connection failure: {exc}") from exc
    except Exception as exc:
        app_logger.error(f"Unexpected MongoDB error during connect: {exc}")
        raise RuntimeError(f"MongoDB connect error: {exc}") from exc


async def disconnect_from_mongo() -> None:
    """
    Gracefully close the Motor connection pool.
    Called during application shutdown (lifespan).
    """
    try:
        client.close()
        app_logger.info("MongoDB connection pool closed gracefully")
    except Exception as exc:
        app_logger.warning(f"Error while closing MongoDB connection: {exc}")


async def ping_database() -> dict:
    """
    Ping the database and return status info (used by health endpoint).

    Returns:
        dict with keys: status, latency_ms, version
    """
    import time
    try:
        start = time.monotonic()
        await client.admin.command("ping")
        latency_ms = round((time.monotonic() - start) * 1000, 2)
        server_info = await client.server_info()
        return {
            "status": "connected",
            "latency_ms": latency_ms,
            "version": server_info.get("version", "unknown"),
        }
    except Exception as exc:
        app_logger.error(f"MongoDB ping failed: {exc}")
        return {"status": "disconnected", "error": str(exc)}
