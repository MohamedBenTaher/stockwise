from pydantic_settings import BaseSettings
from pydantic import ConfigDict
from typing import Optional, List
import logging


class Settings(BaseSettings):
    # Database Configuration
    DATABASE_URL: str = "postgresql://username:password@localhost:5432/stockwise"
    # Individual DB fields (for Docker Compose)
    POSTGRES_DB: str = "stockwise"
    POSTGRES_USER: str = "stockwise_user"
    POSTGRES_PASSWORD: str = "stockwise_password"

    # UI Directory
    UI_DIRECTORY: str = "stockwise/frontend"

    # Database Pool Settings
    DB_POOL_SIZE: int = 10
    DB_MAX_OVERFLOW: int = 20
    DB_POOL_TIMEOUT: int = 30

    # Redis Configuration
    REDIS_URL: str = "redis://localhost:6379"

    # Security
    SECRET_KEY: str = "your-secret-key-here"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30

    # Application Settings
    DEBUG: bool = True
    ENVIRONMENT: str = "development"
    BACKEND_PORT: int = 8000
    API_V1_STR: str = "/api/v1"

    # CORS Settings
    ALLOWED_ORIGINS: str = (
        "http://localhost:3000,http://localhost:5173,"
        "http://127.0.0.1:3000,http://127.0.0.1:5173"
    )

    # External API Keys
    GROQ_API_KEY: Optional[str] = None  # Free Groq API for AI
    HUGGINGFACE_API_KEY: Optional[str] = None  # Free HF API fallback
    GROQ_API_KEY: Optional[str] = None
    ALPHA_VANTAGE_API_KEY: Optional[str] = None
    FINANCIAL_MODELING_PREP_API_KEY: Optional[str] = None

    # OAuth Configuration
    GOOGLE_CLIENT_ID: Optional[str] = None
    GOOGLE_CLIENT_SECRET: Optional[str] = None

    # Celery Configuration
    CELERY_BROKER_URL: str = "redis://localhost:6379/0"
    CELERY_RESULT_BACKEND: str = "redis://localhost:6379/0"

    # Logging
    LOG_LEVEL: str = "INFO"
    LOG_FILE: str = "logs/stockwise.log"

    @property
    def cors_origins(self) -> List[str]:
        """Convert comma-separated origins to list."""
        return [origin.strip() for origin in self.ALLOWED_ORIGINS.split(",")]

    @property
    def log_level_enum(self) -> int:
        """Convert log level string to logging level."""
        return getattr(logging, self.LOG_LEVEL.upper(), logging.INFO)

    model_config = ConfigDict(
        env_file=".env", extra="ignore"  # Ignore extra environment variables
    )


settings = Settings()
