from typing import List, Optional

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from sqlmodel import select

from app.api.deps import get_db
from app.models.school import School
from app.schemas.school import SchoolRead

router = APIRouter(prefix="/schools", tags=["schools"])


@router.get("/", response_model=List[SchoolRead])
def list_schools(
    *,
    db: Session = Depends(get_db),
    school_type: Optional[str] = Query(default=None),
    region: Optional[str] = Query(default=None),
    city: Optional[str] = Query(default=None),
    suburb: Optional[str] = Query(default=None),
    name: Optional[str] = Query(default=None, description="Search by school name keyword"),
) -> List[School]:
    query = select(School)

    if school_type:
        query = query.where(School.school_type == school_type)
    if region:
        query = query.where(School.region == region)
    if city:
        query = query.where(School.city == city)
    if suburb:
        query = query.where(School.suburb == suburb)
    if name:
        like_pattern = f"%{name}%"
        query = query.where(School.name.ilike(like_pattern))

    result = db.execute(query).scalars().all()
    return result


@router.get("/top", response_model=List[SchoolRead])
def list_top_schools(
    *,
    db: Session = Depends(get_db),
    limit: int = Query(default=10, ge=1, le=50),
    school_type: Optional[str] = Query(default=None, description="Filter by school type, e.g. secondary"),
) -> List[School]:
    """
    List schools ordered by pass rate (highest first).
    Only includes schools with a non-null pass_rate.
    """
    query = select(School).where(School.pass_rate.isnot(None)).order_by(School.pass_rate.desc())
    if school_type:
        query = query.where(School.school_type == school_type)
    result = db.execute(query).limit(limit).scalars().all()
    return result


@router.get("/{school_id}", response_model=SchoolRead)
def get_school(
    *, db: Session = Depends(get_db), school_id: int
) -> School:
    school = db.get(School, school_id)
    if not school:
        raise HTTPException(status_code=404, detail="School not found")
    return school













