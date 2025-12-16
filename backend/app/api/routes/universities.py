from typing import List, Optional

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from sqlmodel import select

from app.api.deps import get_db
from app.models.school import School
from app.schemas.school import SchoolRead

router = APIRouter(prefix="/universities", tags=["universities"])


@router.get("/", response_model=List[SchoolRead])
def list_universities(
    *,
    db: Session = Depends(get_db),
    city: Optional[str] = Query(default=None),
    university_type: Optional[str] = Query(default=None, description="university | institute_of_technology | private"),
    name: Optional[str] = Query(default=None, description="Search by university name keyword"),
) -> List[School]:
    # Filter by university-related school types
    university_types = ["university", "institute_of_technology", "private_tertiary"]
    query = select(School).where(School.school_type.in_(university_types))

    if university_type:
        # Map frontend types to backend school_type values
        type_mapping = {
            "university": "university",
            "institute_of_technology": "institute_of_technology",
            "private": "private_tertiary"
        }
        mapped_type = type_mapping.get(university_type, university_type)
        query = query.where(School.school_type == mapped_type)
    
    if city:
        query = query.where(School.city == city)
    if name:
        like_pattern = f"%{name}%"
        query = query.where(School.name.ilike(like_pattern))

    result = db.execute(query).scalars().all()
    return result


@router.get("/{university_id}", response_model=SchoolRead)
def get_university(
    *, db: Session = Depends(get_db), university_id: int
) -> School:
    university = db.get(School, university_id)
    if not university or university.school_type not in ["university", "institute_of_technology", "private_tertiary"]:
        raise HTTPException(status_code=404, detail="University not found")
    return university


