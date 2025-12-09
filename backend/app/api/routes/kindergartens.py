from typing import List, Optional

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy import func
from sqlalchemy.orm import Session
from sqlmodel import select

from app.api.deps import get_db, get_current_active_user
from app.models.school import School
from app.models.user import User
from app.schemas.school import SchoolRead, SchoolCreate, SchoolUpdate

router = APIRouter(prefix="/kindergartens", tags=["kindergartens"])


@router.get("/", response_model=List[SchoolRead])
def list_kindergartens(
    *,
    db: Session = Depends(get_db),
    region: Optional[str] = Query(default=None, description="Filter by region"),
    city: Optional[str] = Query(default=None, description="Filter by city"),
    suburb: Optional[str] = Query(default=None, description="Filter by suburb"),
    name: Optional[str] = Query(default=None, description="Search by kindergarten name keyword"),
    education_system: Optional[str] = Query(default=None, description="Filter by education system (Montessori, Reggio Emilia, etc.)"),
    skip: int = Query(default=0, ge=0, description="Number of records to skip"),
    limit: int = Query(default=100, ge=1, le=1000, description="Maximum number of records to return"),
) -> List[School]:
    """
    List all kindergartens with optional filtering.
    
    Supports filtering by:
    - Region
    - City
    - Suburb
    - Name (keyword search)
    - Education system
    
    Returns paginated results.
    """
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

    # Apply pagination
    query = query.offset(skip).limit(limit)
    
    result = db.execute(query).scalars().all()
    return result


@router.get("/stats", response_model=dict)
def get_kindergarten_stats(
    *,
    db: Session = Depends(get_db),
    region: Optional[str] = Query(default=None),
    city: Optional[str] = Query(default=None),
) -> dict:
    """
    Get statistics about kindergartens.
    
    Returns:
    - Total count
    - Count by region
    - Count by city
    - Count by education system
    """
    base_query = select(School).where(School.school_type == "kindergarten")
    
    if region:
        base_query = base_query.where(School.region == region)
    if city:
        base_query = base_query.where(School.city == city)
    
    # Total count
    total_count_query = select(func.count(School.id)).where(School.school_type == "kindergarten")
    if region:
        total_count_query = total_count_query.where(School.region == region)
    if city:
        total_count_query = total_count_query.where(School.city == city)
    
    total = db.execute(total_count_query).scalar_one()
    
    # Count by region
    region_query = select(
        School.region,
        func.count(School.id)
    ).where(School.school_type == "kindergarten")
    if city:
        region_query = region_query.where(School.city == city)
    region_query = region_query.group_by(School.region)
    regions = db.execute(region_query).all()
    
    # Count by city
    city_query = select(
        School.city,
        func.count(School.id)
    ).where(School.school_type == "kindergarten")
    if region:
        city_query = city_query.where(School.region == region)
    city_query = city_query.group_by(School.city)
    cities = db.execute(city_query).all()
    
    # Count by education system (simplified - counts kindergartens with each system)
    education_systems_query = select(School.education_systems).where(
        School.school_type == "kindergarten",
        School.education_systems.isnot(None)
    )
    if region:
        education_systems_query = education_systems_query.where(School.region == region)
    if city:
        education_systems_query = education_systems_query.where(School.city == city)
    
    education_systems = db.execute(education_systems_query).scalars().all()
    education_system_counts = {}
    for system_str in education_systems:
        if system_str:
            # Split comma-separated systems
            systems = [s.strip() for s in system_str.split(",")]
            for system in systems:
                education_system_counts[system] = education_system_counts.get(system, 0) + 1
    
    return {
        "total": total,
        "by_region": [{"region": r[0], "count": r[1]} for r in regions if r[0]],
        "by_city": [{"city": c[0], "count": c[1]} for c in cities if c[0]],
        "by_education_system": education_system_counts,
    }


@router.get("/{kindergarten_id}", response_model=SchoolRead)
def get_kindergarten(
    *, db: Session = Depends(get_db), kindergarten_id: int
) -> School:
    """
    Get a specific kindergarten by ID.
    """
    kindergarten = db.get(School, kindergarten_id)
    if not kindergarten or kindergarten.school_type != "kindergarten":
        raise HTTPException(status_code=404, detail="Kindergarten not found")
    return kindergarten


@router.post("/", response_model=SchoolRead, status_code=status.HTTP_201_CREATED)
def create_kindergarten(
    *,
    db: Session = Depends(get_db),
    kindergarten_data: SchoolCreate,
    current_user: User = Depends(get_current_active_user),
) -> School:
    """
    Create a new kindergarten.
    Requires authentication.
    """
    # Ensure school_type is set to kindergarten
    if kindergarten_data.school_type != "kindergarten":
        kindergarten_data.school_type = "kindergarten"
    
    # Check if kindergarten with same name already exists
    existing = db.execute(
        select(School).where(
            School.name == kindergarten_data.name,
            School.school_type == "kindergarten"
        )
    ).scalar_one_or_none()
    
    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Kindergarten with this name already exists"
        )
    
    new_kindergarten = School(**kindergarten_data.dict())
    db.add(new_kindergarten)
    db.commit()
    db.refresh(new_kindergarten)
    
    return new_kindergarten


@router.put("/{kindergarten_id}", response_model=SchoolRead)
def update_kindergarten(
    *,
    db: Session = Depends(get_db),
    kindergarten_id: int,
    kindergarten_data: SchoolUpdate,
    current_user: User = Depends(get_current_active_user),
) -> School:
    """
    Update an existing kindergarten.
    Requires authentication.
    """
    kindergarten = db.get(School, kindergarten_id)
    if not kindergarten or kindergarten.school_type != "kindergarten":
        raise HTTPException(status_code=404, detail="Kindergarten not found")
    
    # Update fields
    update_data = kindergarten_data.dict(exclude_unset=True)
    for field, value in update_data.items():
        setattr(kindergarten, field, value)
    
    # Ensure school_type remains kindergarten
    kindergarten.school_type = "kindergarten"
    
    db.add(kindergarten)
    db.commit()
    db.refresh(kindergarten)
    
    return kindergarten


@router.delete("/{kindergarten_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_kindergarten(
    *,
    db: Session = Depends(get_db),
    kindergarten_id: int,
    current_user: User = Depends(get_current_active_user),
) -> None:
    """
    Delete a kindergarten.
    Requires authentication.
    """
    kindergarten = db.get(School, kindergarten_id)
    if not kindergarten or kindergarten.school_type != "kindergarten":
        raise HTTPException(status_code=404, detail="Kindergarten not found")
    
    db.delete(kindergarten)
    db.commit()
    
    return None


@router.get("/search/locations", response_model=dict)
def search_locations(
    *,
    db: Session = Depends(get_db),
    query: str = Query(..., description="Search term for region, city, or suburb"),
) -> dict:
    """
    Search for locations (regions, cities, suburbs) that have kindergartens.
    Useful for autocomplete/search suggestions.
    """
    search_pattern = f"%{query}%"
    
    # Get unique regions
    regions_query = select(School.region).where(
        School.school_type == "kindergarten",
        School.region.ilike(search_pattern),
        School.region.isnot(None)
    ).distinct()
    regions = [r for r in db.execute(regions_query).scalars().all() if r]
    
    # Get unique cities
    cities_query = select(School.city).where(
        School.school_type == "kindergarten",
        School.city.ilike(search_pattern),
        School.city.isnot(None)
    ).distinct()
    cities = [c for c in db.execute(cities_query).scalars().all() if c]
    
    # Get unique suburbs
    suburbs_query = select(School.suburb).where(
        School.school_type == "kindergarten",
        School.suburb.ilike(search_pattern),
        School.suburb.isnot(None)
    ).distinct()
    suburbs = [s for s in db.execute(suburbs_query).scalars().all() if s]
    
    return {
        "regions": regions,
        "cities": cities,
        "suburbs": suburbs,
    }
