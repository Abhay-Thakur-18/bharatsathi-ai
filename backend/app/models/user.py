"""
User Data Model

MongoDB document structure for users collection.

Required fields:
  _id, full_name, email, password, phone, language, role,
  profile_image, is_active, created_at, updated_at, last_login
"""

from datetime import datetime
from typing import Optional


class UserModel:
    """Factory for user MongoDB documents."""

    # Default values
    DEFAULT_LANGUAGE = "en"
    DEFAULT_ROLE = "user"

    @staticmethod
    def create_document(
        full_name: str,
        email: str,
        password: str,
        phone: Optional[str] = None,
        language: str = "en",
        role: str = "user",
        profile_image: Optional[str] = None,
    ) -> dict:
        """
        Build a user document for insertion into MongoDB.

        Args:
            full_name: User's display name
            email: Unique email address (will be indexed)
            password: bcrypt-hashed password string
            phone: Optional phone number
            language: Preferred language code (default 'en')
            role: User role — 'user' | 'admin' (default 'user')
            profile_image: Optional URL/path to profile picture

        Returns:
            Dictionary ready for ``users_collection.insert_one()``
        """
        now = datetime.utcnow()
        return {
            "full_name": full_name,
            "email": email,
            "password": password,
            "phone": phone,
            "language": language,
            "role": role,
            "profile_image": profile_image,
            "is_active": True,
            "created_at": now,
            "updated_at": now,
            "last_login": None,
        }
