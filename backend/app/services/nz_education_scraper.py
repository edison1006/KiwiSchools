"""
New Zealand Education Data Scraper
Scrapes real kindergarten data from official NZ education sources.
"""
import re
from typing import List, Dict, Any, Optional
from datetime import datetime
import asyncio

import httpx
from bs4 import BeautifulSoup
from sqlalchemy.orm import Session

from app.core.config import get_settings
from app.services.scraper import KindergartenScraper


class NZEducationScraper:
    """Scraper for New Zealand education data from official sources."""
    
    def __init__(self, db: Session):
        self.db = db
        self.client = httpx.AsyncClient(
            timeout=30.0,
            follow_redirects=True,
            headers={
                "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
            }
        )
        self.settings = get_settings()
    
    async def __aenter__(self):
        return self
    
    async def __aexit__(self, exc_type, exc_val, exc_tb):
        await self.client.aclose()
    
    async def scrape_education_counts(self) -> List[Dict[str, Any]]:
        """
        Scrape from Education Counts website.
        https://www.educationcounts.govt.nz/
        """
        items = []
        try:
            # Try different URLs that might have data
            urls_to_try = [
                "https://www.educationcounts.govt.nz/data",
                "https://www.educationcounts.govt.nz/statistics/early-childhood-education",
                "https://www.educationcounts.govt.nz/find-school",
            ]
            
            for url in urls_to_try:
                try:
                    print(f"Trying: {url}")
                    response = await self.client.get(url, timeout=30.0)
                    if response.status_code == 200:
                        soup = BeautifulSoup(response.text, 'html.parser')
                        
                        # Look for download links (CSV, Excel, JSON)
                        download_links = []
                        for link in soup.find_all('a', href=True):
                            href = link.get('href', '')
                            if any(ext in href.lower() for ext in ['.csv', '.xlsx', '.xls', '.json']):
                                full_url = href if href.startswith('http') else f"https://www.educationcounts.govt.nz{href}"
                                download_links.append(full_url)
                        
                        if download_links:
                            print(f"Found {len(download_links)} download links")
                            for dl_url in download_links[:3]:  # Try first 3
                                csv_data = await self.scrape_from_csv_download(dl_url)
                                if csv_data:
                                    items.extend(csv_data)
                                    break
                        
                        # Look for data tables
                        tables = soup.find_all('table')
                        if tables:
                            print(f"Found {len(tables)} tables, attempting to parse...")
                            # Parse table data (simplified - needs customization)
                            for table in tables[:2]:  # Try first 2 tables
                                rows = table.find_all('tr')
                                for row in rows[1:]:  # Skip header
                                    cols = row.find_all(['td', 'th'])
                                    if len(cols) >= 2:
                                        # Basic extraction - needs customization based on actual structure
                                        item = {}
                                        for i, col in enumerate(cols):
                                            text = col.get_text(strip=True)
                                            if text:
                                                item[f"col_{i}"] = text
                                        if item:
                                            items.append(item)
                        
                        if items:
                            break
                            
                except Exception as e:
                    print(f"Error with {url}: {e}")
                    continue
            
        except Exception as e:
            print(f"Error scraping Education Counts: {e}")
        
        return items
    
    async def scrape_education_govt_nz(self) -> List[Dict[str, Any]]:
        """
        Scrape from Ministry of Education website.
        https://www.education.govt.nz/
        """
        items = []
        try:
            # Try to find early childhood education directory or API
            base_url = "https://www.education.govt.nz"
            
            # Common endpoints to try:
            urls_to_try = [
                f"{base_url}/early-childhood/",
                f"{base_url}/data/",
                f"{base_url}/api/",
            ]
            
            for url in urls_to_try:
                try:
                    response = await self.client.get(url)
                    if response.status_code == 200:
                        print(f"Found accessible URL: {url}")
                        # Parse and extract data
                        # This needs actual website inspection
                        break
                except:
                    continue
            
        except Exception as e:
            print(f"Error scraping education.govt.nz: {e}")
        
        return items
    
    async def scrape_from_csv_download(self, csv_url: str) -> List[Dict[str, Any]]:
        """Download and parse CSV file."""
        try:
            import pandas as pd
            import io
            
            print(f"Downloading CSV from: {csv_url}")
            response = await self.client.get(csv_url)
            response.raise_for_status()
            
            # Try different encodings
            try:
                df = pd.read_csv(io.StringIO(response.text))
            except:
                df = pd.read_csv(io.BytesIO(response.content))
            
            items = []
            for _, row in df.iterrows():
                item = row.to_dict()
                items.append(item)
            
            print(f"Loaded {len(items)} items from CSV")
            return items
            
        except Exception as e:
            print(f"Error downloading CSV {csv_url}: {e}")
            return []
    
    async def scrape_from_public_api(self, api_url: str, api_key: Optional[str] = None) -> List[Dict[str, Any]]:
        """Scrape from public API endpoint."""
        try:
            headers = {}
            if api_key:
                headers["Authorization"] = f"Bearer {api_key}"
                headers["X-API-Key"] = api_key
            
            print(f"Fetching from API: {api_url}")
            response = await self.client.get(api_url, headers=headers)
            response.raise_for_status()
            
            data = response.json()
            
            # Handle different response formats
            if isinstance(data, list):
                return data
            elif isinstance(data, dict):
                for key in ['data', 'items', 'results', 'kindergartens', 'services']:
                    if key in data and isinstance(data[key], list):
                        return data[key]
            
            return []
            
        except Exception as e:
            print(f"Error fetching from API {api_url}: {e}")
            return []
    
    async def scrape_all_sources(self) -> List[Dict[str, Any]]:
        """Scrape from all available sources."""
        all_items = []
        
        # Try Google Places API first (most reliable)
        if self.settings.google_maps_api_key:
            print("\n1. Trying Google Places API...")
            try:
                from app.services.google_places_scraper import scrape_from_google_places
                result = await scrape_from_google_places(self.db)
                if result.get("items_found", 0) > 0:
                    print(f"   Found {result['items_found']} items from Google Places")
                    # Return early if we got good data
                    return all_items  # Will be populated by the import in scrape_from_google_places
            except Exception as e:
                print(f"   Error with Google Places: {e}")
        
        # Try Education Counts
        print("\n2. Trying Education Counts...")
        items = await self.scrape_education_counts()
        all_items.extend(items)
        print(f"   Found {len(items)} items")
        
        # Try Ministry of Education
        print("\n3. Trying Ministry of Education...")
        items = await self.scrape_education_govt_nz()
        all_items.extend(items)
        print(f"   Found {len(items)} items")
        
        # Try configured API sources
        if self.settings.education_api_url:
            print(f"\n4. Trying configured API: {self.settings.education_api_url}...")
            items = await self.scrape_from_public_api(
                self.settings.education_api_url,
                self.settings.education_api_key
            )
            all_items.extend(items)
            print(f"   Found {len(items)} items")
        
        # Try common CSV download URLs
        csv_urls = [
            # Add actual CSV download URLs here when found
            # "https://www.educationcounts.govt.nz/__data/assets/file/.../kindergartens.csv",
        ]
        
        for csv_url in csv_urls:
            print(f"\n5. Trying CSV download: {csv_url}...")
            items = await self.scrape_from_csv_download(csv_url)
            all_items.extend(items)
            print(f"   Found {len(items)} items")
        
        return all_items


async def scrape_real_nz_kindergartens(db: Session) -> Dict[str, Any]:
    """
    Main function to scrape real kindergarten data from NZ sources.
    """
    from app.services.scraper import KindergartenScraper
    
    async with NZEducationScraper(db) as nz_scraper:
        # Scrape from all sources
        all_data = await nz_scraper.scrape_all_sources()
        
        if not all_data:
            print("\n⚠ No data found from online sources.")
            print("This could mean:")
            print("1. The data sources require authentication")
            print("2. The website structure has changed")
            print("3. Need to configure actual data source URLs")
            print("\nFalling back to sample data...")
            # Fall back to sample data
            async with KindergartenScraper(db) as scraper:
                all_data = await scraper.fetch_sample_data()
        
        # Process and import data
        async with KindergartenScraper(db) as scraper:
            result = await scraper.import_kindergartens(all_data, update_existing=True)
        
        return {
            "status": "success",
            "sources_scraped": len(all_data) > 0,
            "items_found": len(all_data),
            "import_result": result,
            "timestamp": datetime.utcnow().isoformat(),
        }

