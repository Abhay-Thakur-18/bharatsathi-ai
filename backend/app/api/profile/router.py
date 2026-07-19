"""
Profile API Router

Comprehensive profile management endpoints:
  GET  /profile/          — full profile (users + user_profiles merged)
  PUT  /profile/          — update personal info fields
  PUT  /profile/preferences — update AI preferences
  GET  /profile/statistics  — real usage counts from all collections
  GET  /profile/activity    — recent activity across all modules
  POST /profile/avatar      — upload/set profile image (base64)
  PUT  /profile/change-password — change password (proxied here for profile page)
  POST /profile/logout-all  — invalidate all sessions (clears server-side flag)
  DELETE /profile/          — soft-delete (deactivate) account
"""

import base64
import re
from datetime import datetime, timezone
from typing import Optional

from fastapi import APIRouter, HTTPException, status, Depends, UploadFile, File

from app.schemas.user import (
    ProfileUpdateRequest,
    PreferencesUpdateRequest,
    FullProfileResponse,
    ProfileStatsResponse,
    ProfileActivityResponse,
    UserChangePassword,
)
from app.repositories.user_repository import (
    get_user_by_id,
    update_full_profile,
    update_user_password,
    deactivate_user,
)
from app.repositories.analytics_repository import (
    get_user_profile as get_extended_profile,
    upsert_user_profile,
)
from app.repositories import chat_repository
from app.repositories.healthcare_repository import (
    count_user_healthcare_queries,
    get_user_healthcare_history,
)
from app.repositories.agriculture_repository import (
    count_user_agriculture_queries,
    get_user_agriculture_history,
)
from app.repositories.career_repository import (
    count_user_career_queries,
    get_user_career_history,
)
from app.repositories.scheme_repository import count_user_scheme_searches
from app.api.auth.service import hash_password, verify_password
from app.dependencies.auth import get_current_user, get_current_user_id
from app.core.logger import app_logger


router = APIRouter(prefix="/profile", tags=["Profile"])


# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------

def _isoformat(dt: Optional[datetime]) -> Optional[str]:
    """Convert a datetime to an ISO-8601 string, handling None gracefully."""
    if dt is None:
        return None
    if dt.tzinfo is None:
        dt = dt.replace(tzinfo=timezone.utc)
    return dt.isoformat()


def _calculate_completion(user: dict, extended: Optional[dict]) -> int:
    """
    Profile completion percentage.
    Fields: full_name, email, phone, language, profile_image,
            gender, date_of_birth, state, occupation, address  → each 10 %
    """
    fields = [
        user.get("full_name"),
        user.get("email"),
        user.get("phone"),
        user.get("language"),
        user.get("profile_image"),
        (extended or {}).get("gender"),
        (extended or {}).get("date_of_birth"),
        (extended or {}).get("state"),
        (extended or {}).get("occupation"),
        (extended or {}).get("address"),
    ]
    filled = sum(1 for f in fields if f)
    return int((filled / len(fields)) * 100)


def _merge_profile(user: dict, extended: Optional[dict]) -> dict:
    """Merge the users doc and user_profiles doc into one response dict."""
    ext = extended or {}
    return {
        "id": str(user["_id"]),
        "full_name": user.get("full_name", ""),
        "email": user.get("email", ""),
        "phone": user.get("phone") or ext.get("phone"),
        "gender": ext.get("gender"),
        "date_of_birth": ext.get("date_of_birth"),
        "state": ext.get("state"),
        "district": ext.get("district"),
        "occupation": ext.get("occupation"),
        "language": user.get("language", "en"),
        "address": ext.get("address"),
        "bio": ext.get("bio"),
        "profile_image": user.get("profile_image") or ext.get("profile_image"),
        "role": user.get("role", "user"),
        "is_active": user.get("is_active", True),
        "created_at": _isoformat(user.get("created_at")),
        "updated_at": _isoformat(user.get("updated_at")),
        "last_login": _isoformat(user.get("last_login")),
        # Preferences (stored in user_profiles)
        "default_language": ext.get("default_language", user.get("language", "en")),
        "response_style": ext.get("response_style", "medium"),
        "theme": ext.get("theme", "system"),
        "notifications_enabled": ext.get("notifications_enabled", True),
        "voice_output": ext.get("voice_output", False),
        "auto_save_chats": ext.get("auto_save_chats", True),
        "profile_completion": _calculate_completion(user, ext),
    }


# ---------------------------------------------------------------------------
# GET /profile/
# ---------------------------------------------------------------------------

@router.get("/", response_model=FullProfileResponse)
async def get_profile(
    current_user: dict = Depends(get_current_user),
    user_id: str = Depends(get_current_user_id),
):
    """Return full merged profile (users + user_profiles)."""
    extended = await get_extended_profile(user_id)
    return _merge_profile(current_user, extended)


# ---------------------------------------------------------------------------
# PUT /profile/
# ---------------------------------------------------------------------------

@router.put("/", response_model=FullProfileResponse)
async def update_profile(
    data: ProfileUpdateRequest,
    current_user: dict = Depends(get_current_user),
    user_id: str = Depends(get_current_user_id),
):
    """Update personal information fields."""
    app_logger.info(f"Profile update for user: {user_id}")

    # Fields that live directly on the users document
    user_fields: dict = {}
    if data.full_name is not None:
        user_fields["full_name"] = data.full_name
    if data.phone is not None:
        user_fields["phone"] = data.phone
    if data.language is not None:
        user_fields["language"] = data.language

    if user_fields:
        await update_full_profile(user_id, user_fields)

    # Fields that live in user_profiles (extended)
    ext_fields: dict = {}
    for field in ("gender", "date_of_birth", "state", "district",
                  "occupation", "address", "bio"):
        val = getattr(data, field, None)
        if val is not None:
            ext_fields[field] = val

    if ext_fields:
        await upsert_user_profile(user_id, ext_fields)

    # Re-fetch updated user
    updated_user = await get_user_by_id(user_id)
    extended = await get_extended_profile(user_id)
    return _merge_profile(updated_user, extended)


# ---------------------------------------------------------------------------
# PUT /profile/preferences
# ---------------------------------------------------------------------------

@router.put("/preferences", response_model=FullProfileResponse)
async def update_preferences(
    data: PreferencesUpdateRequest,
    current_user: dict = Depends(get_current_user),
    user_id: str = Depends(get_current_user_id),
):
    """Update AI and UI preferences stored in user_profiles."""
    pref_fields: dict = {}
    for field in ("default_language", "response_style", "theme",
                  "notifications_enabled", "voice_output", "auto_save_chats"):
        val = getattr(data, field, None)
        if val is not None:
            pref_fields[field] = val

    if pref_fields:
        await upsert_user_profile(user_id, pref_fields)

    updated_user = await get_user_by_id(user_id)
    extended = await get_extended_profile(user_id)
    return _merge_profile(updated_user, extended)


# ---------------------------------------------------------------------------
# POST /profile/avatar
# ---------------------------------------------------------------------------

@router.post("/avatar", response_model=FullProfileResponse)
async def upload_avatar(
    file: UploadFile = File(...),
    current_user: dict = Depends(get_current_user),
    user_id: str = Depends(get_current_user_id),
):
    """
    Store profile image as a base64 data-URL in MongoDB.
    Max file size: 2 MB. Accepted: image/jpeg, image/png, image/webp.
    """
    ALLOWED = {"image/jpeg", "image/png", "image/webp"}
    MAX_SIZE = 2 * 1024 * 1024  # 2 MB

    content_type = file.content_type or ""
    if content_type not in ALLOWED:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Only JPEG, PNG, and WebP images are allowed.",
        )

    raw = await file.read()
    if len(raw) > MAX_SIZE:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Image must be smaller than 2 MB.",
        )

    b64 = base64.b64encode(raw).decode("utf-8")
    data_url = f"data:{content_type};base64,{b64}"

    await update_full_profile(user_id, {"profile_image": data_url})

    updated_user = await get_user_by_id(user_id)
    extended = await get_extended_profile(user_id)
    return _merge_profile(updated_user, extended)


# ---------------------------------------------------------------------------
# GET /profile/statistics
# ---------------------------------------------------------------------------

@router.get("/statistics", response_model=ProfileStatsResponse)
async def get_statistics(
    current_user: dict = Depends(get_current_user),
    user_id: str = Depends(get_current_user_id),
):
    """Return real usage counts from every activity collection."""
    chats = await chat_repository.count_user_conversations(user_id)
    health = await count_user_healthcare_queries(user_id)
    agri = await count_user_agriculture_queries(user_id)
    career = await count_user_career_queries(user_id)
    schemes = await count_user_scheme_searches(user_id)

    created_at: Optional[datetime] = current_user.get("created_at")
    last_login: Optional[datetime] = current_user.get("last_login")

    account_age = 0
    if created_at:
        account_age = (datetime.utcnow() - created_at).days

    return {
        "total_chats": chats,
        "healthcare_queries": health,
        "agriculture_queries": agri,
        "career_sessions": career,
        "scheme_searches": schemes,
        "account_age_days": account_age,
        "last_active": _isoformat(last_login),
    }


# ---------------------------------------------------------------------------
# GET /profile/activity
# ---------------------------------------------------------------------------

@router.get("/activity", response_model=ProfileActivityResponse)
async def get_activity(
    current_user: dict = Depends(get_current_user),
    user_id: str = Depends(get_current_user_id),
):
    """Return recent activity items across all modules."""

    # Recent conversations
    raw_chats = await chat_repository.get_user_conversations(user_id, skip=0, limit=5)
    chats = [
        {
            "id": str(c["_id"]),
            "title": c.get("title", "Chat"),
            "category": c.get("category", "chat"),
            "date": _isoformat(c.get("updated_at") or c.get("created_at")),
            "detail": f"{c.get('message_count', 0)} messages",
        }
        for c in raw_chats
    ]

    # Recent healthcare
    raw_health = await get_user_healthcare_history(user_id, limit=5)
    healthcare = [
        {
            "id": str(h["_id"]),
            "title": h.get("query_data", {}).get("symptoms", "Health Query")[:60],
            "category": h.get("query_type", "healthcare"),
            "date": _isoformat(h.get("created_at")),
            "detail": h.get("query_type", "").replace("_", " ").title(),
        }
        for h in raw_health
    ]

    # Recent agriculture
    raw_agri = await get_user_agriculture_history(user_id, limit=5)
    agriculture = [
        {
            "id": str(a["_id"]),
            "title": a.get("query_data", {}).get("crop_name", "Agriculture Query")[:60],
            "category": a.get("query_type", "agriculture"),
            "date": _isoformat(a.get("created_at")),
            "detail": a.get("query_type", "").replace("_", " ").title(),
        }
        for a in raw_agri
    ]

    # Recent career
    raw_career = await get_user_career_history(user_id, limit=5)
    career = [
        {
            "id": str(c["_id"]),
            "title": (
                c.get("query_data", {}).get("target_role")
                or c.get("query_data", {}).get("job_role")
                or "Career Query"
            )[:60],
            "category": c.get("query_type", "career"),
            "date": _isoformat(c.get("created_at")),
            "detail": c.get("query_type", "").replace("_", " ").title(),
        }
        for c in raw_career
    ]

    return {
        "chats": chats,
        "healthcare": healthcare,
        "agriculture": agriculture,
        "career": career,
        "schemes": [],  # scheme_searches not stored per-user yet; placeholder
    }


# ---------------------------------------------------------------------------
# PUT /profile/change-password  (profile-page-friendly alias)
# ---------------------------------------------------------------------------

@router.put("/change-password")
async def change_password(
    data: UserChangePassword,
    current_user: dict = Depends(get_current_user),
    user_id: str = Depends(get_current_user_id),
):
    """Change password — same logic as /auth/change-password."""
    if not verify_password(data.current_password, current_user["password"]):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Current password is incorrect",
        )
    success = await update_user_password(user_id, hash_password(data.new_password))
    if not success:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to update password",
        )
    return {"message": "Password changed successfully"}


# ---------------------------------------------------------------------------
# POST /profile/logout-all
# ---------------------------------------------------------------------------

@router.post("/logout-all")
async def logout_all(
    current_user: dict = Depends(get_current_user),
    user_id: str = Depends(get_current_user_id),
):
    """
    Rotate the user's token-invalidation marker so all issued JWTs become stale.
    Since we use stateless JWTs, we stamp a 'sessions_invalidated_at' field.
    The client must delete its stored token.
    """
    await update_full_profile(user_id, {"sessions_invalidated_at": datetime.utcnow()})
    return {"message": "All sessions have been logged out. Please sign in again."}


# ---------------------------------------------------------------------------
# DELETE /profile/
# ---------------------------------------------------------------------------

@router.delete("/", status_code=status.HTTP_200_OK)
async def delete_account(
    current_user: dict = Depends(get_current_user),
    user_id: str = Depends(get_current_user_id),
):
    """Soft-delete: deactivate the account (is_active = False)."""
    await deactivate_user(user_id)
    return {"message": "Account deactivated successfully"}
