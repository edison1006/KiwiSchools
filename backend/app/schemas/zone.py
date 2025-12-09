from __future__ import annotations

from datetime import date
from typing import Optional

from pydantic import BaseModel


class ZoneBase(BaseModel):
    name: str
    region: Optional[str] = None
    city: Optional[str] = None
    suburb: Optional[str] = None
    median_house_price: Optional[float] = None
    median_house_price_currency: str = "NZD"
    last_updated: Optional[date] = None


class ZoneCreate(ZoneBase):
    pass


class ZoneUpdate(ZoneBase):
    name: Optional[str] = None


class ZoneRead(ZoneBase):
    id: int

    class Config:
        orm_mode = True





