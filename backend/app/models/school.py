from typing import Optional
from sqlmodel import Field, SQLModel


class School(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    name: str
    school_type: Optional[str] = None  # kindergarten, primary, intermediate, secondary, composite, university, etc.
    
    # Location fields
    region: Optional[str] = None
    city: Optional[str] = None
    suburb: Optional[str] = None
    address: Optional[str] = None
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    
    # Kindergarten-specific fields
    brand_name: Optional[str] = None
    education_system: Optional[str] = None  # Montessori, Reggio Emilia, play-based, bilingual, etc.
    owner_or_group: Optional[str] = None
    description: Optional[str] = None
    
    # Contact information
    phone: Optional[str] = None
    email: Optional[str] = None
    website_url: Optional[str] = None
    
    # Fee/tuition information
    fee_min: Optional[float] = None
    fee_max: Optional[float] = None
    fee_currency: Optional[str] = None  # Default: NZD
    fee_unit: Optional[str] = None  # per_week, per_month, per_term, per_year, etc.
    
    # University-specific fields (for future use)
    qs_world_rank: Optional[int] = None
    strong_subjects: Optional[str] = None
    university_type: Optional[str] = None
