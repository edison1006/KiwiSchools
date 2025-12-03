from __future__ import annotations

from typing import Optional

from sqlmodel import SQLModel, Field, Relationship


class SchoolType(str):
    KINDERGARTEN = "kindergarten"
    PRIMARY = "primary"
    INTERMEDIATE = "intermediate"
    SECONDARY = "secondary"
    COMPOSITE = "composite"
    UNIVERSITY = "university"
    INSTITUTE = "institute_of_technology"
    PRIVATE_TERTIARY = "private_tertiary"


class School(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)

    name: str
    school_type: str = Field(index=True)

    # General info
    description: Optional[str] = None
    owner: Optional[str] = None  # for kindergartens / groups

    # Education systems or curricula (comma separated for now)
    education_systems: Optional[str] = None

    # Tuition fee range (per year or indicative)
    tuition_min: Optional[float] = None
    tuition_max: Optional[float] = None
    tuition_currency: str = "NZD"

    # Location
    region: Optional[str] = Field(default=None, index=True)
    city: Optional[str] = Field(default=None, index=True)
    suburb: Optional[str] = Field(default=None, index=True)
    address: Optional[str] = None
    latitude: Optional[float] = None
    longitude: Optional[float] = None

    # Contact
    website: Optional[str] = None
    phone: Optional[str] = None
    email: Optional[str] = None

    # School-level specific fields
    sector: Optional[str] = Field(
        default=None, description="public / private / state_integrated / other"
    )
    level: Optional[str] = Field(
        default=None,
        description="Primary / Intermediate / Secondary / Composite for schools",
    )
    curriculum: Optional[str] = Field(
        default=None,
        description="NZ Curriculum / IB / Cambridge / NCEA / mixed",
    )

    # Progression / ranking
    progression_rate: Optional[float] = Field(
        default=None, description="0-100 representing percentage progression"
    )
    national_ranking: Optional[int] = None

    # University / tertiary specific
    institution_type: Optional[str] = Field(
        default=None, description="University / Institute of Technology / Private"
    )
    qs_world_rank: Optional[int] = None
    strong_programs: Optional[str] = Field(
        default=None,
        description="JSON string or comma separated strong programmes list",
    )

    # Zone relationship
    zone_id: Optional[int] = Field(default=None, foreign_key="schoolzone.id")
    zone: Optional["SchoolZone"] = Relationship(back_populates="schools")


