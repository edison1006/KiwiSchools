from __future__ import annotations

from datetime import date
from typing import Optional, List

from sqlmodel import SQLModel, Field, Relationship


class SchoolZone(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)

    name: str = Field(index=True)
    region: Optional[str] = Field(default=None, index=True)
    city: Optional[str] = Field(default=None, index=True)
    suburb: Optional[str] = Field(default=None, index=True)

    median_house_price: Optional[float] = None
    median_house_price_currency: str = "NZD"
    last_updated: Optional[date] = None

    schools: List["School"] = Relationship(back_populates="zone")





