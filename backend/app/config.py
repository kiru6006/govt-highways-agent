import os
from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    PROJECT_NAME: str = "TN-HDOS | Tamil Nadu Highways Digital Operating System"
    API_V1_STR: str = "/api/v1"
    SECRET_KEY: str = os.getenv("SECRET_KEY", "tn-hdos-master-insecure-secret-key-change-in-production-2026")
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24  # 24 hours
    
    # Defaults to local SQLite for immediate zero-config execution, but configurable to PostgreSQL / PostGIS
    DATABASE_URL: str = os.getenv("DATABASE_URL", "sqlite:///./tn_hdos.db")
    
    # Environment
    ENVIRONMENT: str = os.getenv("ENVIRONMENT", "development")
    IS_DEMO_MODE: bool = True
    CORS_ORIGINS: list[str] = [
        "http://localhost:3000",
        "http://127.0.0.1:3000",
        "http://localhost:5173",
        "https://kiru6006.github.io",
    ]

    class Config:
        env_file = ".env"
        extra = "allow"

settings = Settings()

