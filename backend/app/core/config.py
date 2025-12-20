from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    database_url: str = "postgresql://postgres:postgres@localhost:5432/kiwischools"
    
    class Config:
        env_file = ".env"
        case_sensitive = False


settings = Settings()
