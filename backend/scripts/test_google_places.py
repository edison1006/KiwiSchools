"""
Test Google Places API scraper.
Usage: python scripts/test_google_places.py
"""
import sys
import asyncio
from pathlib import Path

sys.path.insert(0, str(Path(__file__).parent.parent))

from app.db.session import SessionLocal, init_db
from app.services.google_places_scraper import scrape_from_google_places


async def main():
    """Test Google Places scraper."""
    print("=" * 60)
    print("Testing Google Places API Scraper")
    print("=" * 60)
    
    init_db()
    db = SessionLocal()
    
    try:
        result = await scrape_from_google_places(db)
        
        print("\n" + "=" * 60)
        print("Results:")
        print("=" * 60)
        print(f"Status: {result['status']}")
        print(f"Items found: {result.get('items_found', 0)}")
        if 'import_result' in result:
            print(f"\nImport Results:")
            print(f"  - Created: {result['import_result']['created']}")
            print(f"  - Updated: {result['import_result']['updated']}")
            print(f"  - Skipped: {result['import_result']['skipped']}")
            print(f"  - Errors: {result['import_result']['errors']}")
            print(f"  - Total: {result['import_result']['total']}")
        print("=" * 60)
        
    except Exception as e:
        print(f"\nError: {e}")
        import traceback
        traceback.print_exc()
    finally:
        db.close()


if __name__ == "__main__":
    asyncio.run(main())



