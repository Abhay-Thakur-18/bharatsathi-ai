"""
Career Repository

Database operations for the 'career_queries' collection.
Persists career advice, resume reviews, skill assessments, and interview prep.
"""

from bson import ObjectId
from datetime import datetime
from typing import Optional, List

from app.db.database import db
from app.core.logger import app_logger


career_collection = db["career_queries"]


async def initialize_career_indexes() -> None:
    """Create indexes for career_queries collection."""
    try:
        await career_collection.create_index("user_id")
        await career_collection.create_index("query_type")
        await career_collection.create_index([("user_id", 1), ("created_at", -1)])
        app_logger.info("Career collection indexes created successfully")
    except Exception as exc:
        app_logger.warning(f"Career index creation skipped or failed: {exc}")


async def log_career_query(
    user_id: str,
    query_type: str,
    query_data: dict,
    response_data: dict,
) -> str:
    """
    Persist a career query and its AI response.

    Args:
        user_id: Authenticated user's ID
        query_type: 'career_advice' | 'resume_review' | 'skill_assessment' | 'interview_prep'
        query_data: Original request payload
        response_data: AI-generated response

    Returns:
        Inserted document _id as string
    """
    doc = {
        "user_id": user_id,
        "query_type": query_type,
        "query_data": query_data,
        "response_data": response_data,
        "created_at": datetime.utcnow(),
    }
    result = await career_collection.insert_one(doc)
    return str(result.inserted_id)


async def get_user_career_history(
    user_id: str,
    skip: int = 0,
    limit: int = 20,
) -> List[dict]:
    """Return paginated career query history for a user."""
    try:
        cursor = career_collection.find(
            {"user_id": user_id}
        ).sort("created_at", -1).skip(skip).limit(limit)
        return await cursor.to_list(length=limit)
    except Exception as exc:
        app_logger.error(f"Error fetching career history: {exc}")
        return []


async def count_user_career_queries(user_id: str) -> int:
    """Count total career queries for a user."""
    return await career_collection.count_documents({"user_id": user_id})


async def get_query_by_id(query_id: str) -> Optional[dict]:
    """Fetch a single career query document."""
    try:
        return await career_collection.find_one({"_id": ObjectId(query_id)})
    except Exception as exc:
        app_logger.error(f"Error fetching career query '{query_id}': {exc}")
        return None
