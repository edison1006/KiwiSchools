from __future__ import annotations

from datetime import date
from typing import Optional, TYPE_CHECKING

from sqlmodel import SQLModel, Field, Relationship

if TYPE_CHECKING:
    from app.models.school import School


class SchoolZone(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)

    name: str = Field(index=True)
    region: Optional[str] = Field(default=None, index=True)
    city: Optional[str] = Field(default=None, index=True)
    suburb: Optional[str] = Field(default=None, index=True)

    median_house_price: Optional[float] = None
    median_house_price_currency: str = "NZD"
    last_updated: Optional[date] = None

    # Note: Relationship is defined but may need to be configured after both classes are loaded
    # schools: list["School"] = Relationship(back_populates="zone")





