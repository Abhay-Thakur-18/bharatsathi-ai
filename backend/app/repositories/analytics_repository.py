"""
Analytics, Feedback & Logs Repository

Collections:
  - analytics      : aggregated usage metrics
  - feedback       : user feedback submissions
  - logs           : application-level event log
"""

from datetime import datetime
from typing import Optional, List

from app.db.database import db
from app.core.logger import app_logger


analytics_collection  = db["analytics"]
feedback_collection   = db["feedback"]
logs_collection       = db["logs"]
user_profiles_collection = db["user_profiles"]


# ---------------------------------------------------------------------------
# Initialization
# ---------------------------------------------------------------------------

async def initialize_analytics_indexes() -> None:
    """Create indexes for analytics, feedback, logs, and user_profiles."""
    try:
        # Analytics
        await analytics_collection.create_index("event_type")
        await analytics_collection.create_index([("user_id", 1), ("created_at", -1)])

        # Feedback
        await feedback_collection.create_index("user_id")
        await feedback_collection.create_index("category")
        await feedback_collection.create_index("created_at")

        # Logs
        await logs_collection.create_index("level")
        await logs_collection.create_index("created_at")

        # User profiles (extended user preferences)
        await user_profiles_collection.create_index("user_id", unique=True)

        app_logger.info(
            "Analytics / feedback / logs / user_profiles indexes created successfully"
        )
    except Exception as exc:
        app_logger.warning(f"Analytics index creation skipped or failed: {exc}")


# ---------------------------------------------------------------------------
# Analytics
# ---------------------------------------------------------------------------

async def record_event(user_id: Optional[str], event_type: str, metadata: dict = None) -> str:
    """Record a usage analytics event."""
    doc = {
        "user_id": user_id,
        "event_type": event_type,
        "metadata": metadata or {},
        "created_at": datetime.utcnow(),
    }
    result = await analytics_collection.insert_one(doc)
    return str(result.inserted_id)


async def get_events(event_type: Optional[str] = None, limit: int = 100) -> List[dict]:
    """Fetch recent analytics events, optionally filtered by type."""
    try:
        filt = {"event_type": event_type} if event_type else {}
        cursor = analytics_collection.find(filt).sort("created_at", -1).limit(limit)
        return await cursor.to_list(length=limit)
    except Exception as exc:
        app_logger.error(f"Error fetching analytics events: {exc}")
        return []


# ---------------------------------------------------------------------------
# Feedback
# ---------------------------------------------------------------------------

async def submit_feedback(
    user_id: str, category: str, message: str, rating: Optional[int] = None
) -> str:
    """Save a feedback submission from a user."""
    doc = {
        "user_id": user_id,
        "category": category,
        "message": message,
        "rating": rating,
        "created_at": datetime.utcnow(),
    }
    result = await feedback_collection.insert_one(doc)
    return str(result.inserted_id)


async def get_feedback(skip: int = 0, limit: int = 50) -> List[dict]:
    """Paginated list of all feedback submissions."""
    try:
        cursor = feedback_collection.find({}).sort("created_at", -1).skip(skip).limit(limit)
        return await cursor.to_list(length=limit)
    except Exception as exc:
        app_logger.error(f"Error fetching feedback: {exc}")
        return []


# ---------------------------------------------------------------------------
# Logs
# ---------------------------------------------------------------------------

async def write_log(level: str, message: str, context: dict = None) -> None:
    """Persist a log entry to MongoDB (supplement to file/stdout logging)."""
    try:
        doc = {
            "level": level.upper(),
            "message": message,
            "context": context or {},
            "created_at": datetime.utcnow(),
        }
        await logs_collection.insert_one(doc)
    except Exception as exc:
        # Never let a log write crash the app
        app_logger.warning(f"Failed to write log to MongoDB: {exc}")


# ---------------------------------------------------------------------------
# User Profiles (extended preferences)
# ---------------------------------------------------------------------------

async def get_user_profile(user_id: str) -> Optional[dict]:
    """Fetch extended user profile document."""
    try:
        return await user_profiles_collection.find_one({"user_id": user_id})
    except Exception as exc:
        app_logger.error(f"Error fetching user profile '{user_id}': {exc}")
        return None


async def upsert_user_profile(user_id: str, profile_data: dict) -> bool:
    """Create or update an extended user profile."""
    try:
        profile_data["user_id"] = user_id
        profile_data["updated_at"] = datetime.utcnow()
        result = await user_profiles_collection.update_one(
            {"user_id": user_id},
            {"$set": profile_data, "$setOnInsert": {"created_at": datetime.utcnow()}},
            upsert=True,
        )
        return result.acknowledged
    except Exception as exc:
        app_logger.error(f"Error upserting user profile '{user_id}': {exc}")
        return False
