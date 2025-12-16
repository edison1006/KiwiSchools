#!/usr/bin/env python3
"""
Import official New Zealand schools directory CSV into database.

Usage:
    python scripts/import_official_schools.py /path/to/directory.csv
"""

import sys
import csv
from pathlib import Path
from typing import Optional, Dict, Any
from sqlalchemy.orm import Session
from sqlmodel import select

# Add parent directory to path
sys.path.insert(0, str(Path(__file__).parent.parent))

from app.db.session import SessionLocal, init_db
from app.models.school import School


def normalize_school_type(school_type: str, definition: str) -> str:
    """Convert CSV school type to database school_type."""
    if not school_type:
        return "primary"  # default
    
    school_type_lower = school_type.lower()
    definition_lower = definition.lower() if definition else ""
    
    # Map based on School Type and Definition columns
    if "composite" in school_type_lower:
        return "composite"
    elif "secondary" in school_type_lower:
        if "year 7" in definition_lower or "year 9" in definition_lower:
            return "secondary"
        return "secondary"
    elif "primary" in school_type_lower or "full primary" in school_type_lower:
        return "primary"
    elif "intermediate" in school_type_lower:
        return "intermediate"
    elif "university" in school_type_lower:
        return "university"
    elif "institute" in school_type_lower or "technology" in school_type_lower:
        return "institute_of_technology"
    elif "private tertiary" in school_type_lower:
        return "private_tertiary"
    elif "kindergarten" in school_type_lower or "early childhood" in school_type_lower:
        return "kindergarten"
    else:
        # Default based on definition
        if "secondary" in definition_lower:
            return "secondary"
        elif "primary" in definition_lower:
            return "primary"
        return "primary"


def normalize_sector(authority: str) -> Optional[str]:
    """Convert Authority column to sector."""
    if not authority:
        return None
    
    authority_lower = authority.lower()
    if "state" in authority_lower and "integrated" in authority_lower:
        return "state_integrated"
    elif "state" in authority_lower:
        return "public"
    elif "private" in authority_lower:
        return "private"
    else:
        return "other"


def parse_float(value: str) -> Optional[float]:
    """Safely parse float from string."""
    if not value or value.strip() == "":
        return None
    try:
        return float(value.strip())
    except (ValueError, AttributeError):
        return None


def parse_int(value: str) -> Optional[int]:
    """Safely parse int from string."""
    if not value or value.strip() == "":
        return None
    try:
        return int(value.strip())
    except (ValueError, AttributeError):
        return None


def build_address(street: str, suburb: str, city: str) -> Optional[str]:
    """Build full address from components."""
    parts = []
    if street and street.strip():
        parts.append(street.strip())
    if suburb and suburb.strip():
        parts.append(suburb.strip())
    if city and city.strip():
        parts.append(city.strip())
    
    if parts:
        return ", ".join(parts)
    return None


def create_school_from_row(row: Dict[str, str]) -> Optional[School]:
    """Create School object from CSV row."""
    try:
        # Required fields
        name = row.get("School Name", "").strip()
        if not name:
            return None
        
        # School type
        school_type = normalize_school_type(
            row.get("School Type", ""),
            row.get("Definition", "")
        )
        
        # Level (from Definition)
        level = row.get("Definition", "").strip() or None
        
        # Sector (from Authority)
        sector = normalize_sector(row.get("Authority", ""))
        
        # Location
        region = row.get("Regional Council", "").strip() or None
        city = row.get("Town / City", "").strip() or None
        suburb = row.get("Suburb", "").strip() or None
        address = build_address(
            row.get("Street", ""),
            row.get("Suburb", ""),
            row.get("Town / City", "")
        )
        
        # Coordinates
        latitude = parse_float(row.get("Latitude", ""))
        longitude = parse_float(row.get("Longitude", ""))
        
        # Contact
        phone = row.get("Telephone", "").strip() or None
        email = row.get("Email^", "").strip() or None
        website = row.get("School Website", "").strip() or None
        
        # Principal (store in owner field for now)
        principal = row.get("Principal*", "").strip() or None
        
        # Create school object
        school = School(
            name=name,
            school_type=school_type,
            level=level,
            sector=sector,
            region=region,
            city=city,
            suburb=suburb,
            address=address,
            latitude=latitude,
            longitude=longitude,
            phone=phone,
            email=email,
            website=website,
            owner=principal,
        )
        
        return school
        
    except Exception as e:
        print(f"Error creating school from row: {e}")
        return None


def import_schools_from_csv(csv_path: str, db: Session, update_existing: bool = True) -> Dict[str, int]:
    """Import schools from CSV file."""
    created = 0
    updated = 0
    skipped = 0
    errors = 0
    
    print(f"Reading CSV file: {csv_path}")
    
    with open(csv_path, 'r', encoding='utf-8') as f:
        # Read all lines
        lines = f.readlines()
        
        # Line 17 (index 16) is the header row
        # Line 18 (index 17) is an empty row
        # Line 19 (index 18) onwards are data rows
        header_line = lines[16].strip()
        fieldnames = [field.strip() for field in header_line.split(',')]
        
        # Skip first 18 lines (metadata + header + empty row)
        data_lines = lines[18:]
        
        # Read CSV from data lines
        reader = csv.DictReader(data_lines, fieldnames=fieldnames)
        
        for row_num, row in enumerate(reader, start=19):
            try:
                # Skip empty rows
                if not row or not any(v.strip() if v else False for v in row.values()):
                    skipped += 1
                    continue
                
                school = create_school_from_row(row)
                if not school:
                    skipped += 1
                    continue
                
                # Check if school already exists (by name and school_type)
                statement = select(School).where(
                    School.name == school.name,
                    School.school_type == school.school_type
                )
                existing = db.execute(statement).scalar_one_or_none()
                
                if existing:
                    if update_existing:
                        # Update existing record
                        for field, value in school.dict(exclude={'id'}).items():
                            if value is not None:
                                setattr(existing, field, value)
                        db.add(existing)
                        updated += 1
                    else:
                        skipped += 1
                else:
                    # Create new record
                    db.add(school)
                    created += 1
                
                # Commit every 100 records
                if (created + updated) % 100 == 0:
                    db.commit()
                    print(f"Processed {created + updated} schools...")
                    
            except Exception as e:
                print(f"Error processing row {row_num}: {e}")
                errors += 1
                continue
    
    # Final commit
    db.commit()
    
    return {
        "created": created,
        "updated": updated,
        "skipped": skipped,
        "errors": errors,
        "total": created + updated + skipped + errors
    }


def main():
    """Main function."""
    if len(sys.argv) < 2:
        print("Usage: python scripts/import_official_schools.py /path/to/directory.csv")
        sys.exit(1)
    
    csv_path = sys.argv[1]
    
    if not Path(csv_path).exists():
        print(f"Error: CSV file not found: {csv_path}")
        sys.exit(1)
    
    # Initialize database
    print("Initializing database...")
    init_db()
    
    # Import schools
    db = SessionLocal()
    try:
        print(f"\nStarting import from: {csv_path}")
        result = import_schools_from_csv(csv_path, db, update_existing=True)
        
        print("\n" + "="*50)
        print("Import Summary:")
        print("="*50)
        print(f"Created: {result['created']}")
        print(f"Updated: {result['updated']}")
        print(f"Skipped: {result['skipped']}")
        print(f"Errors: {result['errors']}")
        print(f"Total processed: {result['total']}")
        print("="*50)
        
    except Exception as e:
        print(f"Error during import: {e}")
        db.rollback()
        sys.exit(1)
    finally:
        db.close()


if __name__ == "__main__":
    main()

