"""
Data scraper service for fetching kindergarten data from various sources.
"""
import re
from typing import List, Optional, Dict, Any
from datetime import datetime

import httpx
from bs4 import BeautifulSoup
from sqlalchemy.orm import Session
from sqlmodel import select

from app.core.config import get_settings
from app.models.school import School


class KindergartenScraper:
    """Scraper for kindergarten data from New Zealand sources."""
    
    def __init__(self, db: Session):
        self.db = db
        self.client = httpx.AsyncClient(timeout=30.0, follow_redirects=True)
    
    async def __aenter__(self):
        return self
    
    async def __aexit__(self, exc_type, exc_val, exc_tb):
        await self.client.aclose()
    
    def normalize_location(self, location_str: Optional[str]) -> Dict[str, Optional[str]]:
        """Parse location string into region, city, suburb."""
        if not location_str:
            return {"region": None, "city": None, "suburb": None}
        
        location_str = location_str.strip()
        
        # Common New Zealand regions
        regions = [
            "Auckland", "Wellington", "Canterbury", "Waikato", "Bay of Plenty",
            "Otago", "Manawatu-Wanganui", "Northland", "Taranaki", "Southland",
            "Hawke's Bay", "Gisborne", "Marlborough", "Tasman", "West Coast"
        ]
        
        # Common cities
        cities = [
            "Auckland", "Wellington", "Christchurch", "Hamilton", "Tauranga",
            "Napier", "Palmerston North", "Dunedin", "Rotorua", "New Plymouth",
            "Whangarei", "Invercargill", "Nelson", "Hastings", "Gisborne"
        ]
        
        parts = [p.strip() for p in re.split(r'[,;]', location_str)]
        
        region = None
        city = None
        suburb = None
        
        for part in parts:
            part_lower = part.lower()
            # Check for region
            for r in regions:
                if r.lower() in part_lower:
                    region = r
                    break
            
            # Check for city
            for c in cities:
                if c.lower() == part_lower or c.lower() in part_lower:
                    city = c
                    break
        
        # If no city found but region found, use region as city hint
        if not city and region:
            city = region if region in cities else None
        
        # Remaining parts might be suburb
        if len(parts) > 1:
            suburb = parts[-1] if parts[-1] not in [region, city] else None
        
        return {"region": region, "city": city, "suburb": suburb}
    
    def parse_education_system(self, text: Optional[str]) -> Optional[str]:
        """Extract education system from text."""
        if not text:
            return None
        
        text_lower = text.lower()
        systems = []
        
        if "montessori" in text_lower:
            systems.append("Montessori")
        if "reggio" in text_lower or "reggio emilia" in text_lower:
            systems.append("Reggio Emilia")
        if "play-based" in text_lower or "play based" in text_lower:
            systems.append("Play-based")
        if "bilingual" in text_lower:
            systems.append("Bilingual")
        if "waldorf" in text_lower or "steiner" in text_lower:
            systems.append("Waldorf/Steiner")
        
        return ", ".join(systems) if systems else None
    
    def parse_phone(self, text: Optional[str]) -> Optional[str]:
        """Extract phone number from text."""
        if not text:
            return None
        
        # Remove common prefixes and clean
        text = re.sub(r'[^\d\+\-\(\)\s]', '', text)
        text = re.sub(r'\s+', ' ', text).strip()
        
        # New Zealand phone patterns
        patterns = [
            r'\+64\s*\d{1,2}\s*\d{3,4}\s*\d{4}',
            r'0\d{1,2}\s*\d{3,4}\s*\d{4}',
            r'\d{3,4}\s*\d{3,4}',
        ]
        
        for pattern in patterns:
            match = re.search(pattern, text)
            if match:
                return match.group(0).strip()
        
        return text if len(text) >= 7 else None
    
    def parse_email(self, text: Optional[str]) -> Optional[str]:
        """Extract email from text."""
        if not text:
            return None
        
        email_pattern = r'\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b'
        match = re.search(email_pattern, text)
        return match.group(0) if match else None
    
    def parse_website(self, text: Optional[str]) -> Optional[str]:
        """Extract website URL from text."""
        if not text:
            return None
        
        # Clean and normalize URL
        text = text.strip()
        if not text.startswith(('http://', 'https://')):
            text = 'https://' + text
        
        # Basic URL validation
        url_pattern = r'https?://[^\s<>"{}|\\^`\[\]]+'
        match = re.search(url_pattern, text)
        return match.group(0) if match else None
    
    async def scrape_from_api(self, api_url: str) -> List[Dict[str, Any]]:
        """Scrape data from a JSON API endpoint."""
        try:
            settings = get_settings()
            headers = {
                "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36",
                "Accept": "application/json",
            }
            
            # Add API key if available
            if settings.education_api_key:
                headers["Authorization"] = f"Bearer {settings.education_api_key}"
                headers["X-API-Key"] = settings.education_api_key
            
            print(f"Fetching from API: {api_url}")
            response = await self.client.get(api_url, headers=headers, timeout=30.0)
            response.raise_for_status()
            data = response.json()
            
            # Handle different API response formats
            if isinstance(data, list):
                return data
            elif isinstance(data, dict):
                # Common keys for data arrays
                for key in ['data', 'items', 'results', 'kindergartens']:
                    if key in data and isinstance(data[key], list):
                        return data[key]
            
            return []
        except Exception as e:
            print(f"Error scraping from API {api_url}: {e}")
            return []
    
    async def scrape_from_web(self, url: str, selectors: Optional[Dict[str, str]] = None) -> List[Dict[str, Any]]:
        """Scrape data from a web page using CSS selectors."""
        try:
            headers = {
                "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36"
            }
            response = await self.client.get(url, headers=headers)
            response.raise_for_status()
            soup = BeautifulSoup(response.text, 'lxml')
            
            items = []
            # This is a placeholder - actual implementation depends on the website structure
            # You would need to inspect the target website and create appropriate selectors
            # Example:
            # if selectors and 'item' in selectors:
            #     for item in soup.select(selectors['item']):
            #         data = {}
            #         # Extract data using selectors
            #         items.append(data)
            
            return items
        except Exception as e:
            print(f"Error scraping from web {url}: {e}")
            return []
    
    async def scrape_from_education_counts(self) -> List[Dict[str, Any]]:
        """Scrape kindergarten data from Education Counts website."""
        items = []
        try:
            # Education Counts website for early childhood education
            base_url = "https://www.educationcounts.govt.nz"
            
            # Try to find data download links or API endpoints
            # This is a placeholder - actual implementation needs to inspect the website
            print("Attempting to scrape from Education Counts...")
            
            # Common patterns for education data sites:
            # 1. CSV downloads
            # 2. JSON API endpoints
            # 3. HTML tables with data
            
            # For now, return empty list - needs actual website inspection
            return items
            
        except Exception as e:
            print(f"Error scraping from Education Counts: {e}")
            return []
    
    async def scrape_from_findmyschool(self) -> List[Dict[str, Any]]:
        """Scrape kindergarten data from findmy.school.nz or similar sites."""
        items = []
        try:
            # This would require inspecting the actual website structure
            print("Attempting to scrape from Find My School...")
            return items
        except Exception as e:
            print(f"Error scraping from Find My School: {e}")
            return []
    
    async def scrape_from_csv_url(self, csv_url: str) -> List[Dict[str, Any]]:
        """Scrape data from a CSV file URL."""
        try:
            import pandas as pd
            import io
            
            print(f"Downloading CSV from: {csv_url}")
            response = await self.client.get(csv_url, timeout=60.0)
            response.raise_for_status()
            
            # Try different encodings
            try:
                df = pd.read_csv(io.StringIO(response.text))
            except UnicodeDecodeError:
                df = pd.read_csv(io.BytesIO(response.content))
            
            items = []
            for _, row in df.iterrows():
                # Convert row to dictionary
                item = row.to_dict()
                items.append(item)
            
            print(f"Loaded {len(items)} items from CSV")
            return items
        except Exception as e:
            print(f"Error scraping from CSV {csv_url}: {e}")
            return []
    
    def create_kindergarten_from_data(self, data: Dict[str, Any]) -> Optional[School]:
        """Create a School object from scraped data."""
        try:
            # Extract name
            name = data.get('name') or data.get('title') or data.get('kindergarten_name')
            if not name:
                return None
            
            # Extract location
            location_str = (
                data.get('location') or 
                data.get('address') or 
                data.get('region') or
                f"{data.get('city', '')}, {data.get('region', '')}".strip(', ')
            )
            location = self.normalize_location(location_str)
            
            # Extract education system
            education_system = (
                self.parse_education_system(data.get('description') or data.get('education_system')) or
                data.get('education_systems')
            )
            
            # Extract fees
            tuition_min = data.get('tuition_min') or data.get('fee_min') or data.get('fees_min')
            tuition_max = data.get('tuition_max') or data.get('fee_max') or data.get('fees_max')
            
            # Extract contact info
            phone = self.parse_phone(data.get('phone') or data.get('contact_phone') or data.get('telephone'))
            email = self.parse_email(data.get('email') or data.get('contact_email'))
            website = self.parse_website(data.get('website') or data.get('url') or data.get('website_url'))
            
            # Create School object
            kindergarten = School(
                name=name,
                school_type="kindergarten",
                description=data.get('description'),
                owner=data.get('owner') or data.get('owner_group') or data.get('brand_name'),
                education_systems=education_system,
                tuition_min=float(tuition_min) if tuition_min else None,
                tuition_max=float(tuition_max) if tuition_max else None,
                tuition_currency=data.get('currency') or "NZD",
                region=location['region'] or data.get('region'),
                city=location['city'] or data.get('city'),
                suburb=location['suburb'] or data.get('suburb'),
                address=data.get('address') or data.get('full_address'),
                latitude=float(data['latitude']) if data.get('latitude') else None,
                longitude=float(data['longitude']) if data.get('longitude') else None,
                website=website,
                phone=phone,
                email=email,
            )
            
            return kindergarten
        except Exception as e:
            print(f"Error creating kindergarten from data: {e}")
            return None
    
    async def import_kindergartens(self, kindergartens_data: List[Dict[str, Any]], update_existing: bool = True) -> Dict[str, int]:
        """Import kindergartens into database."""
        created = 0
        updated = 0
        skipped = 0
        errors = 0
        
        for data in kindergartens_data:
            try:
                kindergarten = self.create_kindergarten_from_data(data)
                if not kindergarten:
                    skipped += 1
                    continue
                
                # Check if exists
                statement = select(School).where(
                    School.name == kindergarten.name,
                    School.school_type == "kindergarten"
                )
                existing = self.db.execute(statement).scalar_one_or_none()
                
                if existing:
                    if update_existing:
                        # Update existing record
                        for field, value in kindergarten.dict(exclude={'id'}).items():
                            if value is not None:
                                setattr(existing, field, value)
                        self.db.add(existing)
                        updated += 1
                    else:
                        skipped += 1
                else:
                    # Create new record
                    self.db.add(kindergarten)
                    created += 1
                
            except Exception as e:
                print(f"Error importing kindergarten: {e}")
                errors += 1
                continue
        
        self.db.commit()
        
        return {
            "created": created,
            "updated": updated,
            "skipped": skipped,
            "errors": errors,
            "total": len(kindergartens_data)
        }
    
    async def fetch_sample_data(self) -> List[Dict[str, Any]]:
        """Fetch sample kindergarten data for testing.
        
        In production, this would fetch from real data sources.
        For now, returns sample data structure.
        """
        # This is a placeholder - replace with actual data source
        sample_data = [
            {
                "name": "Auckland Central Kindergarten",
                "description": "Montessori-based early childhood education",
                "owner": "Auckland Kindergarten Association",
                "education_system": "Montessori",
                "region": "Auckland",
                "city": "Auckland",
                "suburb": "CBD",
                "address": "123 Queen Street, Auckland",
                "phone": "+64 9 123 4567",
                "email": "info@aucklandkindergarten.co.nz",
                "website": "https://example.com",
                "fee_min": 1000,
                "fee_max": 2000,
            }
        ]
        
        return sample_data


async def scrape_kindergartens(db: Session, sources: Optional[List[str]] = None, use_real_sources: bool = True) -> Dict[str, Any]:
    """
    Main function to scrape kindergarten data from various sources.
    
    Args:
        db: Database session
        sources: List of data source URLs (optional, uses defaults if not provided)
        use_real_sources: If True, try to scrape from real NZ education sources
    
    Returns:
        Dictionary with scraping results
    """
    async with KindergartenScraper(db) as scraper:
        all_data = []
        
        # Try to scrape from real NZ sources first
        if use_real_sources:
            try:
                from app.services.nz_education_scraper import scrape_real_nz_kindergartens
                print("Attempting to scrape from real NZ education sources...")
                real_result = await scrape_real_nz_kindergartens(db)
                if real_result.get("items_found", 0) > 0:
                    return real_result
                print("Real sources returned no data, trying provided sources...")
            except Exception as e:
                print(f"Error scraping from real sources: {e}")
                print("Falling back to provided sources...")
        
        # Use provided sources or default
        if sources is None:
            # Try common NZ education data sources
            sources = [
                # Education Counts API (if available)
                "https://www.educationcounts.govt.nz/api/early-childhood",
                # Ministry of Education API (if available)
                "https://www.education.govt.nz/api/kindergartens",
                # Add more actual URLs as discovered
            ]
        
        # Scrape from each source
        for source in sources:
            if source.startswith('http'):
                try:
                    if '/api/' in source or source.endswith('.json'):
                        data = await scraper.scrape_from_api(source)
                    elif source.endswith('.csv'):
                        data = await scraper.scrape_from_csv_url(source)
                    else:
                        data = await scraper.scrape_from_web(source, {})
                    if data:
                        all_data.extend(data)
                        print(f"✓ Scraped {len(data)} items from {source}")
                except Exception as e:
                    print(f"✗ Failed to scrape {source}: {e}")
                    continue
        
        # Last resort: use sample data
        if not all_data:
            print("No data found from any sources, using sample data...")
            all_data = await scraper.fetch_sample_data()
        
        # Import into database
        result = await scraper.import_kindergartens(all_data, update_existing=True)
        
        return {
            "status": "success",
            "sources_scraped": len([s for s in sources if s.startswith('http')]) if sources else 0,
            "items_found": len(all_data),
            "import_result": result,
            "timestamp": datetime.utcnow().isoformat(),
        }

