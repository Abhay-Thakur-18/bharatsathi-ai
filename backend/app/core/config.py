from pathlib import Path
from pydantic_settings import BaseSettings, SettingsConfigDict

# Resolve .env relative to this file, not the working directory
ENV_FILE = Path(__file__).parent.parent.parent / ".env"


class Settings(BaseSettings):

    APP_NAME: str
    APP_VERSION: str

    HOST: str
    PORT: int
    DEBUG: bool

    MONGODB_URI: str
    DATABASE_NAME: str

    SECRET_KEY: str
    ALGORITHM: str
    ACCESS_TOKEN_EXPIRE_MINUTES: int

    GEMINI_API_KEY: str = ""  # Kept for backwards compatibility — no longer used

    GROQ_API_KEY: str = ""

    CORS_ORIGINS: str = "http://localhost:5173,http://localhost:3000,http://localhost:3001"
    ENVIRONMENT: str = "development"

    model_config = SettingsConfigDict(
        env_file=str(ENV_FILE),
        case_sensitive=True
    )

    @property
    def cors_origins_list(self) -> list[str]:
        """Convert comma-separated CORS origins to list"""
        return [origin.strip() for origin in self.CORS_ORIGINS.split(",")]


settings = Settings()