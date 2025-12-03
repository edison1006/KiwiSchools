from __future__ import annotations

from typing import Optional

from pydantic import BaseModel


class SchoolBase(BaseModel):
    name: str
    school_type: str
    description: Optional[str] = None
    owner: Optional[str] = None
    education_systems: Optional[str] = None
    tuition_min: Optional[float] = None
    tuition_max: Optional[float] = None
    tuition_currency: str = "NZD"

    region: Optional[str] = None
    city: Optional[str] = None
    suburb: Optional[str] = None
    address: Optional[str] = None
    latitude: Optional[float] = None
    longitude: Optional[float] = None

    website: Optional[str] = None
    phone: Optional[str] = None
    email: Optional[str] = None

    sector: Optional[str] = None
    level: Optional[str] = None
    curriculum: Optional[str] = None

    progression_rate: Optional[float] = None
    national_ranking: Optional[int] = None

    institution_type: Optional[str] = None
    qs_world_rank: Optional[int] = None
    strong_programs: Optional[str] = None

    zone_id: Optional[int] = None


class SchoolCreate(SchoolBase):
    pass


class SchoolUpdate(SchoolBase):
    name: Optional[str] = None
    school_type: Optional[str] = None


class SchoolRead(SchoolBase):
    id: int

    class Config:
        orm_mode = True


