from typing import Optional
from datetime import date
from sqlmodel import Field, SQLModel


class SchoolZone(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    name: str
    school_id: Optional[int] = Field(default=None, foreign_key="school.id")
    median_house_price: Optional[float] = None
    last_updated: Optional[date] = None
