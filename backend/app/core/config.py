from functools import lru_cache
from pydantic import BaseSettings, AnyUrl


class Settings(BaseSettings):
    app_name: str = "KiwiSchools API"
    environment: str = "development"

    database_url: AnyUrl | str = "postgresql://postgres:postgres@localhost:5432/kiwischools"

    class Config:
        env_file = ".env"
        env_file_encoding = "utf-8"


@lru_cache
def get_settings() -> Settings:
    return Settings()



