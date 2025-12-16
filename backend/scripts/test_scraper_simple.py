"""
Simple test script for kindergarten scraper (without database dependencies).
Usage: python scripts/test_scraper_simple.py
"""
import sys
import asyncio
from pathlib import Path

# Add parent directory to path
sys.path.insert(0, str(Path(__file__).parent.parent))

try:
    from app.core.config import get_settings
    from app.services.scraper import scrape_kindergartens
    from app.db.session import SessionLocal, init_db
    
    async def test_scraper():
        """Test the kindergarten scraper."""
        print("Initializing database...")
        init_db()
        
        db = SessionLocal()
        try:
            print("Starting kindergarten data scraping...")
            print("-" * 50)
            
            # Test with sample data (no sources provided)
            result = await scrape_kindergartens(db, sources=None)
            
            print("Scraping completed!")
            print("-" * 50)
            print(f"Status: {result['status']}")
            print(f"Sources scraped: {result['sources_scraped']}")
            print(f"Import result:")
            print(f"  - Created: {result['import_result']['created']}")
            print(f"  - Updated: {result['import_result']['updated']}")
            print(f"  - Skipped: {result['import_result']['skipped']}")
            print(f"  - Errors: {result['import_result']['errors']}")
            print(f"  - Total: {result['import_result']['total']}")
            print(f"Timestamp: {result['timestamp']}")
            
        except Exception as e:
            print(f"Error: {e}")
            import traceback
            traceback.print_exc()
        finally:
            db.close()
    
    if __name__ == "__main__":
        asyncio.run(test_scraper())
        
except ModuleNotFoundError as e:
    print("=" * 60)
    print("ERROR: Missing required dependencies!")
    print("=" * 60)
    print(f"\nMissing module: {e.name}")
    print("\nPlease install dependencies first:")
    print("\n1. Create and activate virtual environment:")
    print("   cd backend")
    print("   python -m venv .venv")
    print("   source .venv/bin/activate  # On Windows: .venv\\Scripts\\activate")
    print("\n2. Install dependencies:")
    print("   pip install -r requirements.txt")
    print("\n3. Then run the script again:")
    print("   python scripts/test_scraper.py")
    print("\n" + "=" * 60)
    sys.exit(1)



