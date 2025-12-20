from typing import Optional
from datetime import date
from pydantic import BaseModel


class ZoneRead(BaseModel):
    id: int
    name: str
    school_id: Optional[int] = None
    median_house_price: Optional[float] = None
    last_updated: Optional[date] = None
    
    class Config:
        from_attributes = True
