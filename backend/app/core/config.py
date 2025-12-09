from functools import lru_cache
from pydantic import BaseSettings, AnyUrl


class Settings(BaseSettings):
    app_name: str = "KiwiSchools API"
    environment: str = "development"

    database_url: AnyUrl | str = "postgresql://postgres:postgres@localhost:5432/kiwischools"
    
    # JWT Settings
    secret_key: str = "your-secret-key-change-in-production-use-env-variable"
    algorithm: str = "HS256"
    access_token_expire_minutes: int = 30

    class Config:
        env_file = ".env"
        env_file_encoding = "utf-8"


@lru_cache
def get_settings() -> Settings:
    return Settings()





