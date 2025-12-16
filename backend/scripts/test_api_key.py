"""
Test API key usage with external API.
Usage: python scripts/test_api_key.py
"""
import sys
import asyncio
from pathlib import Path

# Add parent directory to path
sys.path.insert(0, str(Path(__file__).parent.parent))

from app.core.config import get_settings
import httpx


async def test_api_key():
    """Test if API key works with external API."""
    settings = get_settings()
    
    print("Testing API Key Configuration...")
    print("=" * 50)
    
    if not settings.education_api_key:
        print("✗ Education API Key is not set in .env file")
        print("  Please add EDUCATION_API_KEY to your .env file")
        return
    
    print(f"✓ Education API Key found")
    print(f"✓ Education API URL: {settings.education_api_url or 'Not set'}")
    
    if settings.education_api_url:
        print(f"\nTesting API connection...")
        try:
            async with httpx.AsyncClient(timeout=10.0) as client:
                headers = {}
                if settings.education_api_key:
                    headers["Authorization"] = f"Bearer {settings.education_api_key}"
                    # Or use X-API-Key header if that's what the API expects
                    # headers["X-API-Key"] = settings.education_api_key
                
                response = await client.get(
                    settings.education_api_url,
                    headers=headers
                )
                
                print(f"✓ API Response Status: {response.status_code}")
                if response.status_code == 200:
                    print("✓ API connection successful!")
                elif response.status_code == 401:
                    print("✗ Authentication failed - check your API key")
                elif response.status_code == 403:
                    print("✗ Access forbidden - check API key permissions")
                else:
                    print(f"⚠ Unexpected status code: {response.status_code}")
                    
        except httpx.TimeoutException:
            print("✗ Connection timeout - check your network or API URL")
        except httpx.ConnectError:
            print("✗ Connection error - check if API URL is correct")
        except Exception as e:
            print(f"✗ Error: {e}")
    else:
        print("⚠ Education API URL not set - cannot test connection")
        print("  Add EDUCATION_API_URL to your .env file")


if __name__ == "__main__":
    asyncio.run(test_api_key())


