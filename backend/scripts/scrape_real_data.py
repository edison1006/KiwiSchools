"""
Script to scrape real kindergarten data from NZ education sources.
Usage: python scripts/scrape_real_data.py
"""
import sys
import asyncio
from pathlib import Path

# Add parent directory to path
sys.path.insert(0, str(Path(__file__).parent.parent))

try:
    from app.db.session import SessionLocal, init_db
    from app.services.scraper import scrape_kindergartens
    
    async def main():
        """Main function to scrape real data."""
        print("=" * 60)
        print("Scraping Real Kindergarten Data from NZ Sources")
        print("=" * 60)
        
        init_db()
        db = SessionLocal()
        
        try:
            # Scrape with real sources enabled
            result = await scrape_kindergartens(
                db,
                sources=None,  # Will use default sources
                use_real_sources=True
            )
            
            print("\n" + "=" * 60)
            print("Scraping Results:")
            print("=" * 60)
            print(f"Status: {result['status']}")
            print(f"Sources attempted: {result.get('sources_scraped', 0)}")
            print(f"Items found: {result.get('items_found', 0)}")
            print(f"\nImport Results:")
            print(f"  - Created: {result['import_result']['created']}")
            print(f"  - Updated: {result['import_result']['updated']}")
            print(f"  - Skipped: {result['import_result']['skipped']}")
            print(f"  - Errors: {result['import_result']['errors']}")
            print(f"  - Total: {result['import_result']['total']}")
            print(f"\nTimestamp: {result['timestamp']}")
            print("=" * 60)
            
        except Exception as e:
            print(f"\nError: {e}")
            import traceback
            traceback.print_exc()
        finally:
            db.close()
    
    if __name__ == "__main__":
        asyncio.run(main())
        
except ModuleNotFoundError as e:
    print("=" * 60)
    print("ERROR: Missing required dependencies!")
    print("=" * 60)
    print(f"\nMissing module: {e.name}")
    print("\nPlease install dependencies:")
    print("  cd backend")
    print("  source .venv/bin/activate")
    print("  pip install -r requirements.txt")
    print("=" * 60)
    sys.exit(1)

