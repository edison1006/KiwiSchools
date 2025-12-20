from sqlalchemy.orm import Session

from app.db.session import get_session

def get_db() -> Session:
    return next(get_session())
