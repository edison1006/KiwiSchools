"""
Test script for kindergarten scraper.

Usage:
    # From backend directory:
    cd backend
    source .venv/bin/activate  # On Windows: .venv\Scripts\activate
    python scripts/test_scraper.py
    
    # Or use the shell script (recommended):
    cd backend
    bash scripts/run_scraper.sh
    
    # Or use virtual environment Python directly:
    cd backend
    .venv/bin/python scripts/test_scraper.py
"""
import sys
import os
import asyncio
from pathlib import Path

# Get the backend directory (where this script is located)
backend_dir = Path(__file__).parent.parent
script_dir = Path(__file__).parent

# Change to backend directory to ensure correct paths
os.chdir(backend_dir)
sys.path.insert(0, str(backend_dir))

# Check for virtual environment in backend directory
venv_python = backend_dir / ".venv" / "bin" / "python"
venv_python3 = backend_dir / ".venv" / "bin" / "python3"

# Try to use virtual environment Python if available
if venv_python.exists() or venv_python3.exists():
    venv_python_to_use = venv_python if venv_python.exists() else venv_python3
    if sys.executable != str(venv_python_to_use):
        print("=" * 60)
        print("WARNING: Not using virtual environment Python!")
        print("=" * 60)
        print(f"Current Python: {sys.executable}")
        print(f"Virtual env Python: {venv_python_to_use}")
        print(f"\nCurrent directory: {os.getcwd()}")
        print("\nPlease run from backend directory:")
        print("  cd backend")
        print("  source .venv/bin/activate")
        print("  python scripts/test_scraper.py")
        print("\nOr use:")
        print(f"  {venv_python_to_use} {Path(__file__)}")
        print("=" * 60)
        print()

try:
    from app.db.session import SessionLocal, init_db
    from app.services.scraper import scrape_kindergartens
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


async def test_scraper():
    """Test the kindergarten scraper."""
    print("Initializing database...")
    try:
        init_db()
    except Exception as e:
        print("=" * 60)
        print("ERROR: Database connection failed!")
        print("=" * 60)
        print(f"\nError: {e}")
        print("\nPlease ensure:")
        print("1. PostgreSQL is running")
        print("2. Database is created:")
        print("   CREATE DATABASE kiwischools;")
        print("3. .env file has correct DATABASE_URL")
        print("\nTo start PostgreSQL (macOS with Homebrew):")
        print("   brew services start postgresql")
        print("\nOr check your PostgreSQL installation.")
        print("=" * 60)
        return
    
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

