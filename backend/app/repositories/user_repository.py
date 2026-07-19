"""
User Repository

All database operations for the 'users' collection.
Supports Create, Read, Update (profile, password, last_login), Delete.
"""

from bson import ObjectId
from datetime import datetime
from typing import Optional, List

from app.db.database import db
from app.core.logger import app_logger


users_collection = db["users"]


# ---------------------------------------------------------------------------
# Index / Collection initialization
# ---------------------------------------------------------------------------

async def initialize_indexes() -> None:
    """Create required indexes for the users collection."""
    try:
        # Unique index on email — prevents duplicate registrations
        await users_collection.create_index("email", unique=True)
        # Supports fast lookup by role
        await users_collection.create_index("role")
        # Supports active-user queries
        await users_collection.create_index("is_active")
        app_logger.info("User collection indexes created successfully")
    except Exception as exc:
        app_logger.warning(f"User index creation skipped or failed: {exc}")


# ---------------------------------------------------------------------------
# Create
# ---------------------------------------------------------------------------

async def create_user(user_data: dict) -> str:
    """
    Insert a new user document.

    Args:
        user_data: Full user document (built via UserModel.create_document)

    Returns:
        Inserted document _id as string
    """
    result = await users_collection.insert_one(user_data)
    app_logger.info(f"User created: {user_data.get('email')}")
    return str(result.inserted_id)


# ---------------------------------------------------------------------------
# Read
# ---------------------------------------------------------------------------

async def get_user_by_email(email: str) -> Optional[dict]:
    """Fetch a user document by email address."""
    try:
        user = await users_collection.find_one({"email": email})
        return user
    except Exception as exc:
        app_logger.error(f"Error fetching user by email '{email}': {exc}")
        return None


async def get_user_by_id(user_id: str) -> Optional[dict]:
    """Fetch a user document by ObjectId string."""
    try:
        user = await users_collection.find_one({"_id": ObjectId(user_id)})
        return user
    except Exception as exc:
        app_logger.error(f"Error fetching user by id '{user_id}': {exc}")
        return None


async def get_all_users(skip: int = 0, limit: int = 100) -> List[dict]:
    """Paginated list of all users (admin use)."""
    try:
        cursor = users_collection.find({}).skip(skip).limit(limit)
        return await cursor.to_list(length=limit)
    except Exception as exc:
        app_logger.error(f"Error fetching user list: {exc}")
        return []


async def count_users() -> int:
    """Return total count of user documents."""
    return await users_collection.count_documents({})


# ---------------------------------------------------------------------------
# Update
# ---------------------------------------------------------------------------

async def update_user_profile(user_id: str, full_name: str) -> bool:
    """Update the user's display name."""
    try:
        result = await users_collection.update_one(
            {"_id": ObjectId(user_id)},
            {"$set": {"full_name": full_name, "updated_at": datetime.utcnow()}},
        )
        return result.modified_count > 0
    except Exception as exc:
        app_logger.error(f"Error updating profile for user '{user_id}': {exc}")
        return False


async def update_full_profile(user_id: str, fields: dict) -> bool:
    """Update multiple profile fields on the user document at once."""
    try:
        fields["updated_at"] = datetime.utcnow()
        result = await users_collection.update_one(
            {"_id": ObjectId(user_id)},
            {"$set": fields},
        )
        return result.acknowledged
    except Exception as exc:
        app_logger.error(f"Error updating full profile for user '{user_id}': {exc}")
        return False


async def update_user_password(user_id: str, hashed_password: str) -> bool:
    """Replace the stored bcrypt password hash."""
    try:
        result = await users_collection.update_one(
            {"_id": ObjectId(user_id)},
            {"$set": {"password": hashed_password, "updated_at": datetime.utcnow()}},
        )
        return result.modified_count > 0
    except Exception as exc:
        app_logger.error(f"Error updating password for user '{user_id}': {exc}")
        return False


async def update_last_login(user_id: str) -> bool:
    """Stamp last_login timestamp on successful authentication."""
    try:
        result = await users_collection.update_one(
            {"_id": ObjectId(user_id)},
            {"$set": {"last_login": datetime.utcnow()}},
        )
        return result.modified_count > 0
    except Exception as exc:
        app_logger.error(f"Error updating last_login for user '{user_id}': {exc}")
        return False


async def update_user_language(user_id: str, language: str) -> bool:
    """Update preferred language for a user."""
    try:
        result = await users_collection.update_one(
            {"_id": ObjectId(user_id)},
            {"$set": {"language": language, "updated_at": datetime.utcnow()}},
        )
        return result.modified_count > 0
    except Exception as exc:
        app_logger.error(f"Error updating language for user '{user_id}': {exc}")
        return False


async def deactivate_user(user_id: str) -> bool:
    """Soft-delete: set is_active = False."""
    try:
        result = await users_collection.update_one(
            {"_id": ObjectId(user_id)},
            {"$set": {"is_active": False, "updated_at": datetime.utcnow()}},
        )
        return result.modified_count > 0
    except Exception as exc:
        app_logger.error(f"Error deactivating user '{user_id}': {exc}")
        return False


# ---------------------------------------------------------------------------
# Delete
# ---------------------------------------------------------------------------

async def delete_user(user_id: str) -> bool:
    """Permanently remove a user document."""
    try:
        result = await users_collection.delete_one({"_id": ObjectId(user_id)})
        return result.deleted_count > 0
    except Exception as exc:
        app_logger.error(f"Error deleting user '{user_id}': {exc}")
        return False
