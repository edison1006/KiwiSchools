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
    region: Optional[str] = Query(default=None),
    city: Optional[str] = Query(default=None),
    suburb: Optional[str] = Query(default=None),
    name: Optional[str] = Query(default=None, description="Search by kindergarten name keyword"),
    education_system: Optional[str] = Query(default=None, description="Filter by education system"),
) -> List[School]:
    query = select(School).where(School.school_type == "kindergarten")

    if region:
        query = query.where(School.region == region)
    if city:
        query = query.where(School.city == city)
    if suburb:
        query = query.where(School.suburb == suburb)
    if name:
        like_pattern = f"%{name}%"
        query = query.where(School.name.ilike(like_pattern))
    if education_system:
        query = query.where(School.education_systems.ilike(f"%{education_system}%"))

    result = db.execute(query).scalars().all()
    return result


@router.get("/{kindergarten_id}", response_model=SchoolRead)
def get_kindergarten(
    *, db: Session = Depends(get_db), kindergarten_id: int
) -> School:
    kindergarten = db.get(School, kindergarten_id)
    if not kindergarten or kindergarten.school_type != "kindergarten":
        raise HTTPException(status_code=404, detail="Kindergarten not found")
    return kindergarten

