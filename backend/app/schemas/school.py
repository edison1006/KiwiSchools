from typing import Optional
from pydantic import BaseModel


class SchoolRead(BaseModel):
    id: int
    name: str
    school_type: Optional[str] = None
    
    # Location fields
    region: Optional[str] = None
    city: Optional[str] = None
    suburb: Optional[str] = None
    address: Optional[str] = None
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    
    # Kindergarten-specific fields
    brand_name: Optional[str] = None
    education_system: Optional[str] = None
    owner_or_group: Optional[str] = None
    description: Optional[str] = None
    
    # Contact information
    phone: Optional[str] = None
    email: Optional[str] = None
    website_url: Optional[str] = None
    
    # Fee/tuition information
    fee_min: Optional[float] = None
    fee_max: Optional[float] = None
    fee_currency: Optional[str] = None
    fee_unit: Optional[str] = None
    
    # University-specific fields
    qs_world_rank: Optional[int] = None
    strong_subjects: Optional[str] = None
    university_type: Optional[str] = None
    
    class Config:
        from_attributes = True
