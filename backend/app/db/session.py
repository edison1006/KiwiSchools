from sqlmodel import SQLModel, create_engine, Session

from app.core.config import settings

engine = create_engine(settings.database_url, echo=True)


def get_session():
    """Generator function for database sessions."""
    with Session(engine) as session:
        yield session


def init_db():
    """Initialize database tables."""
    SQLModel.metadata.create_all(engine)
