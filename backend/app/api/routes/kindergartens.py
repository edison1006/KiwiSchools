from typing import List, Optional

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from sqlmodel import select

from app.api.deps import get_db
from app.models.school import School
from app.schemas.school import SchoolRead

router = APIRouter(prefix="/kindergartens", tags=["kindergartens"])


@router.get("/", response_model=List[SchoolRead])
def list_kindergartens(
    *,
    db: Session = Depends(get_db),
    name: Optional[str] = Query(default=None, description="Search by kindergarten name keyword"),
    city: Optional[str] = Query(default=None, description="Filter by city"),
    region: Optional[str] = Query(default=None, description="Filter by region"),
    education_system: Optional[str] = Query(default=None, description="Filter by education system (e.g., Montessori, Reggio Emilia)"),
) -> List[School]:
    """
    List all kindergartens with optional filtering.
    
    - **name**: Search by kindergarten name (partial match, case-insensitive)
    - **city**: Filter by city
    - **region**: Filter by region
    - **education_system**: Filter by education system
    """
    query = select(School).where(School.school_type == "kindergarten")

    if name:
        like_pattern = f"%{name}%"
        query = query.where(School.name.ilike(like_pattern))
    if city:
        query = query.where(School.city == city)
    if region:
        query = query.where(School.region == region)
    if education_system:
        query = query.where(School.education_system == education_system)

    result = db.execute(query).scalars().all()
    return result


@router.get("/{kindergarten_id}", response_model=SchoolRead)
def get_kindergarten(
    *, db: Session = Depends(get_db), kindergarten_id: int
) -> School:
    """
    Get a specific kindergarten by ID.
    """
    kindergarten = db.get(School, kindergarten_id)
    if not kindergarten:
        raise HTTPException(status_code=404, detail="Kindergarten not found")
    if kindergarten.school_type != "kindergarten":
        raise HTTPException(status_code=404, detail="Kindergarten not found")
    return kindergarten


