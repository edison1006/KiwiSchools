"""
Script to find and test actual data sources for NZ kindergarten data.
Usage: python scripts/find_data_sources.py
"""
import sys
import asyncio
from pathlib import Path

sys.path.insert(0, str(Path(__file__).parent.parent))

import httpx
from bs4 import BeautifulSoup


async def find_data_sources():
    """Find actual data sources for NZ kindergarten data."""
    client = httpx.AsyncClient(
        timeout=30.0,
        follow_redirects=True,
        headers={
            "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36"
        }
    )
    
    urls_to_check = [
        "https://www.educationcounts.govt.nz/data",
        "https://www.education.govt.nz/our-work/contact-us/find-a-school/",
        "https://www.education.govt.nz/early-childhood/",
        "https://www.findmy.school.nz/",
    ]
    
    print("=" * 60)
    print("Searching for NZ Kindergarten Data Sources")
    print("=" * 60)
    
    for url in urls_to_check:
        try:
            print(f"\nChecking: {url}")
            response = await client.get(url)
            print(f"  Status: {response.status_code}")
            
            if response.status_code == 200:
                soup = BeautifulSoup(response.text, 'html.parser')
                
                # Find download links
                downloads = []
                for link in soup.find_all('a', href=True):
                    href = link.get('href', '')
                    text = link.get_text(strip=True)
                    if any(ext in href.lower() for ext in ['.csv', '.xlsx', '.xls', '.json', 'download', 'export']):
                        full_url = href if href.startswith('http') else f"{url.rstrip('/')}/{href.lstrip('/')}"
                        downloads.append((full_url, text))
                
                if downloads:
                    print(f"  Found {len(downloads)} potential download links:")
                    for dl_url, text in downloads[:5]:
                        print(f"    - {text}: {dl_url}")
                
                # Find API endpoints
                scripts = soup.find_all('script')
                api_patterns = ['/api/', 'api.', '.json', 'endpoint']
                for script in scripts:
                    if script.string:
                        for pattern in api_patterns:
                            if pattern in script.string.lower():
                                print(f"  Found potential API reference: {pattern}")
                
        except Exception as e:
            print(f"  Error: {e}")
    
    await client.aclose()
    print("\n" + "=" * 60)
    print("Search Complete")
    print("=" * 60)


if __name__ == "__main__":
    asyncio.run(find_data_sources())


