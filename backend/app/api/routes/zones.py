from typing import List

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlmodel import select

from app.api.deps import get_db
from app.models.zone import SchoolZone
from app.schemas.zone import ZoneRead

router = APIRouter(prefix="/zones", tags=["zones"])


@router.get("/", response_model=List[ZoneRead])
def list_zones(*, db: Session = Depends(get_db)) -> List[SchoolZone]:
    result = db.execute(select(SchoolZone)).scalars().all()
    return result


@router.get("/{zone_id}", response_model=ZoneRead)
def get_zone(*, db: Session = Depends(get_db), zone_id: int) -> SchoolZone:
    zone = db.get(SchoolZone, zone_id)
    if not zone:
        raise HTTPException(status_code=404, detail="Zone not found")
    return zone





