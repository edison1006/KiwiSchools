from functools import lru_cache
from typing import Optional, Union

try:
    from pydantic_settings import BaseSettings
except ImportError:
    # Fallback for older pydantic versions
    from pydantic import BaseSettings

from pydantic import AnyUrl


class Settings(BaseSettings):
    app_name: str = "KiwiSchools API"
    environment: str = "development"

    database_url: Union[AnyUrl, str] = "postgresql://postgres:postgres@localhost:5432/kiwischools"
    
    # JWT Settings
    secret_key: str = "your-secret-key-change-in-production-use-env-variable"
    algorithm: str = "HS256"
    access_token_expire_minutes: int = 30
    
    # Admin endpoint (disable in production)
    enable_admin_endpoint: bool = True
    
    # External API Keys (for data scraping)
    education_api_key: Optional[str] = None
    education_api_url: Optional[str] = None
    google_maps_api_key: Optional[str] = None
    # Add more API keys as needed
    # example_api_key: Optional[str] = None

    class Config:
        env_file = ".env"
        env_file_encoding = "utf-8"


@lru_cache
def get_settings() -> Settings:
    return Settings()





