from collections.abc import Generator

from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlmodel import SQLModel

from app.core.config import get_settings

settings = get_settings()

engine = create_engine(str(settings.database_url), pool_pre_ping=True)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)


def get_db() -> Generator:
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


def init_db() -> None:
    # Import models so SQLModel metadata is populated
    from app.models import school, zone  # noqa: F401

    SQLModel.metadata.create_all(bind=engine)


