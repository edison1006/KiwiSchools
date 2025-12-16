"""
Script to seed the database with sample kindergarten data.
Usage: python scripts/seed_kindergartens.py
"""
import sys
from pathlib import Path

# Add parent directory to path
sys.path.insert(0, str(Path(__file__).parent.parent))

from sqlalchemy.orm import Session
from sqlmodel import select

from app.db.session import SessionLocal, init_db
from app.models.school import School


def seed_kindergartens():
    """Seed database with sample kindergarten data."""
    init_db()
    
    db: Session = SessionLocal()
    try:
        # Sample kindergarten data
        kindergartens_data = [
            {
                "name": "Auckland Central Kindergarten",
                "description": "Montessori-based early childhood education in the heart of Auckland",
                "owner": "Auckland Kindergarten Association",
                "education_systems": "Montessori",
                "tuition_min": 1000.0,
                "tuition_max": 2000.0,
                "tuition_currency": "NZD",
                "region": "Auckland",
                "city": "Auckland",
                "suburb": "CBD",
                "address": "123 Queen Street, Auckland 1010",
                "latitude": -36.8485,
                "longitude": 174.7633,
                "website": "https://www.aucklandkindergarten.org.nz",
                "phone": "+64 9 123 4567",
                "email": "info@aucklandkindergarten.co.nz",
            },
            {
                "name": "Wellington Montessori Kindergarten",
                "description": "Reggio Emilia inspired learning environment",
                "owner": "Wellington Early Learning Centre",
                "education_systems": "Reggio Emilia, Montessori",
                "tuition_min": 1200.0,
                "tuition_max": 2200.0,
                "tuition_currency": "NZD",
                "region": "Wellington",
                "city": "Wellington",
                "suburb": "Te Aro",
                "address": "45 Lambton Quay, Wellington 6011",
                "latitude": -41.2865,
                "longitude": 174.7762,
                "website": "https://www.wellingtonmontessori.co.nz",
                "phone": "+64 4 567 8901",
                "email": "contact@wellingtonmontessori.co.nz",
            },
            {
                "name": "Christchurch Play-Based Learning Centre",
                "description": "Child-led play-based curriculum focusing on natural learning",
                "owner": "Canterbury Early Childhood Trust",
                "education_systems": "Play-based",
                "tuition_min": 900.0,
                "tuition_max": 1800.0,
                "tuition_currency": "NZD",
                "region": "Canterbury",
                "city": "Christchurch",
                "suburb": "Riccarton",
                "address": "78 Riccarton Road, Christchurch 8041",
                "latitude": -43.5321,
                "longitude": 172.5986,
                "website": "https://www.playbasedlearning.co.nz",
                "phone": "+64 3 234 5678",
                "email": "info@playbasedlearning.co.nz",
            },
            {
                "name": "Hamilton Bilingual Kindergarten",
                "description": "English and Te Reo Māori bilingual education",
                "owner": "Waikato Kindergarten Association",
                "education_systems": "Bilingual",
                "tuition_min": 1100.0,
                "tuition_max": 2000.0,
                "tuition_currency": "NZD",
                "region": "Waikato",
                "city": "Hamilton",
                "suburb": "Hamilton Central",
                "address": "12 Victoria Street, Hamilton 3204",
                "latitude": -37.7870,
                "longitude": 175.2793,
                "website": "https://www.hamiltonbilingual.co.nz",
                "phone": "+64 7 345 6789",
                "email": "hello@hamiltonbilingual.co.nz",
            },
            {
                "name": "Tauranga Bay of Plenty Kindergarten",
                "description": "Comprehensive early childhood education with outdoor learning",
                "owner": "Bay of Plenty Education Trust",
                "education_systems": "Play-based, Outdoor Learning",
                "tuition_min": 950.0,
                "tuition_max": 1900.0,
                "tuition_currency": "NZD",
                "region": "Bay of Plenty",
                "city": "Tauranga",
                "suburb": "Mount Maunganui",
                "address": "56 Maunganui Road, Tauranga 3116",
                "latitude": -37.6398,
                "longitude": 176.1865,
                "website": "https://www.taurangakindergarten.co.nz",
                "phone": "+64 7 456 7890",
                "email": "info@taurangakindergarten.co.nz",
            },
            {
                "name": "Dunedin Otago Kindergarten",
                "description": "Small class sizes with personalized attention",
                "owner": "Otago Early Learning Network",
                "education_systems": "Montessori",
                "tuition_min": 1000.0,
                "tuition_max": 1950.0,
                "tuition_currency": "NZD",
                "region": "Otago",
                "city": "Dunedin",
                "suburb": "Dunedin Central",
                "address": "34 George Street, Dunedin 9016",
                "latitude": -45.8741,
                "longitude": 170.5036,
                "website": "https://www.dunedinkindergarten.co.nz",
                "phone": "+64 3 567 8901",
                "email": "contact@dunedinkindergarten.co.nz",
            },
            {
                "name": "Napier Hawke's Bay Kindergarten",
                "description": "Reggio Emilia approach with focus on arts and creativity",
                "owner": "Hawke's Bay Education Foundation",
                "education_systems": "Reggio Emilia",
                "tuition_min": 1050.0,
                "tuition_max": 2100.0,
                "tuition_currency": "NZD",
                "region": "Hawke's Bay",
                "city": "Napier",
                "suburb": "Napier Central",
                "address": "89 Marine Parade, Napier 4110",
                "latitude": -39.4928,
                "longitude": 176.9120,
                "website": "https://www.napierkindergarten.co.nz",
                "phone": "+64 6 678 9012",
                "email": "info@napierkindergarten.co.nz",
            },
            {
                "name": "Palmerston North Manawatu Kindergarten",
                "description": "Inclusive early childhood education for all children",
                "owner": "Manawatu Early Learning Trust",
                "education_systems": "Play-based, Inclusive",
                "tuition_min": 980.0,
                "tuition_max": 1850.0,
                "tuition_currency": "NZD",
                "region": "Manawatu-Wanganui",
                "city": "Palmerston North",
                "suburb": "Palmerston North Central",
                "address": "23 The Square, Palmerston North 4410",
                "latitude": -40.3523,
                "longitude": 175.6082,
                "website": "https://www.pnkindergarten.co.nz",
                "phone": "+64 6 789 0123",
                "email": "hello@pnkindergarten.co.nz",
            },
            {
                "name": "Nelson Tasman Kindergarten",
                "description": "Nature-based learning in beautiful Nelson",
                "owner": "Tasman Education Collective",
                "education_systems": "Outdoor Learning, Play-based",
                "tuition_min": 1020.0,
                "tuition_max": 1980.0,
                "tuition_currency": "NZD",
                "region": "Tasman",
                "city": "Nelson",
                "suburb": "Nelson Central",
                "address": "12 Trafalgar Street, Nelson 7010",
                "latitude": -41.2706,
                "longitude": 173.2840,
                "website": "https://www.nelsonkindergarten.co.nz",
                "phone": "+64 3 678 9012",
                "email": "info@nelsonkindergarten.co.nz",
            },
            {
                "name": "Invercargill Southland Kindergarten",
                "description": "Warm and welcoming early childhood education",
                "owner": "Southland Early Learning Association",
                "education_systems": "Play-based",
                "tuition_min": 920.0,
                "tuition_max": 1750.0,
                "tuition_currency": "NZD",
                "region": "Southland",
                "city": "Invercargill",
                "suburb": "Invercargill Central",
                "address": "45 Dee Street, Invercargill 9810",
                "latitude": -46.4132,
                "longitude": 168.3538,
                "website": "https://www.invercargillkindergarten.co.nz",
                "phone": "+64 3 789 0123",
                "email": "contact@invercargillkindergarten.co.nz",
            },
        ]
        
        created = 0
        updated = 0
        
        for data in kindergartens_data:
            # Check if exists
            statement = select(School).where(
                School.name == data["name"],
                School.school_type == "kindergarten"
            )
            existing = db.execute(statement).scalar_one_or_none()
            
            if existing:
                # Update existing
                for key, value in data.items():
                    setattr(existing, key, value)
                existing.school_type = "kindergarten"
                db.add(existing)
                updated += 1
            else:
                # Create new
                kindergarten = School(**data, school_type="kindergarten")
                db.add(kindergarten)
                created += 1
        
        db.commit()
        
        print("=" * 60)
        print("Kindergarten data seeding completed!")
        print("=" * 60)
        print(f"Created: {created}")
        print(f"Updated: {updated}")
        print(f"Total: {len(kindergartens_data)}")
        print("=" * 60)
        
    except Exception as e:
        db.rollback()
        print(f"Error seeding data: {e}")
        import traceback
        traceback.print_exc()
        raise
    finally:
        db.close()


if __name__ == "__main__":
    seed_kindergartens()



