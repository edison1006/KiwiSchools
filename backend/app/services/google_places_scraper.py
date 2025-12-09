"""
Google Places API scraper for kindergarten data.
Uses Google Places API to find early childhood education centers in New Zealand.
"""
from typing import List, Dict, Any, Optional
import asyncio

import httpx
from sqlalchemy.orm import Session

from app.core.config import get_settings
from app.services.scraper import KindergartenScraper


class GooglePlacesScraper:
    """Scraper using Google Places API to find kindergartens."""
    
    def __init__(self, db: Session):
        self.db = db
        self.client = httpx.AsyncClient(timeout=30.0)
        self.settings = get_settings()
        self.api_key = self.settings.google_maps_api_key
    
    async def __aenter__(self):
        return self
    
    async def __aexit__(self, exc_type, exc_val, exc_tb):
        await self.client.aclose()
    
    async def search_places(self, query: str, location: str = "New Zealand") -> List[Dict[str, Any]]:
        """
        Search for places using Google Places API Text Search.
        
        Args:
            query: Search query (e.g., "kindergarten", "early childhood education")
            location: Location bias (default: "New Zealand")
        """
        if not self.api_key:
            print("⚠ Google Maps API key not configured. Skipping Google Places search.")
            return []
        
        items = []
        try:
            # Google Places API Text Search
            url = "https://maps.googleapis.com/maps/api/place/textsearch/json"
            
            params = {
                "query": f"{query} in {location}",
                "key": self.api_key,
                "type": "school",  # or "establishment"
            }
            
            print(f"Searching Google Places for: {query} in {location}")
            response = await self.client.get(url, params=params)
            response.raise_for_status()
            
            data = response.json()
            
            if data.get("status") == "OK":
                results = data.get("results", [])
                print(f"Found {len(results)} places")
                
                # Fetch detailed information for each place
                for result in results[:20]:  # Limit to first 20
                    place_id = result.get("place_id")
                    if place_id:
                        details = await self.get_place_details(place_id)
                        if details:
                            items.append(details)
                    
                    # Rate limiting
                    await asyncio.sleep(0.1)
            else:
                print(f"Google Places API error: {data.get('status')} - {data.get('error_message', 'Unknown error')}")
        
        except Exception as e:
            print(f"Error searching Google Places: {e}")
        
        return items
    
    async def get_place_details(self, place_id: str) -> Optional[Dict[str, Any]]:
        """Get detailed information about a place."""
        try:
            url = "https://maps.googleapis.com/maps/api/place/details/json"
            
            params = {
                "place_id": place_id,
                "key": self.api_key,
                "fields": "name,formatted_address,geometry,formatted_phone_number,website,types,business_status"
            }
            
            response = await self.client.get(url, params=params)
            response.raise_for_status()
            
            data = response.json()
            
            if data.get("status") == "OK":
                result = data.get("result", {})
                
                # Extract location info
                geometry = result.get("geometry", {})
                location = geometry.get("location", {})
                
                # Parse address to extract city/region
                address = result.get("formatted_address", "")
                city, region = self.parse_address(address)
                
                # Check if it's a kindergarten/early childhood center
                types = result.get("types", [])
                if not any(t in types for t in ["school", "establishment", "point_of_interest"]):
                    return None
                
                # Extract name and check keywords
                name = result.get("name", "")
                if not any(kw in name.lower() for kw in ["kindergarten", "early", "childcare", "preschool", "nursery"]):
                    # Still include it, but mark it
                    pass
                
                return {
                    "name": name,
                    "address": address,
                    "city": city,
                    "region": region,
                    "latitude": location.get("lat"),
                    "longitude": location.get("lng"),
                    "phone": result.get("formatted_phone_number"),
                    "website": result.get("website"),
                    "types": ", ".join(types),
                }
        
        except Exception as e:
            print(f"Error getting place details: {e}")
        
        return None
    
    def parse_address(self, address: str) -> tuple[str, str]:
        """Parse address to extract city and region."""
        # Simple parsing - can be improved
        parts = address.split(",")
        city = ""
        region = ""
        
        if len(parts) >= 2:
            city = parts[-2].strip()
            region = parts[-1].strip()
        
        # Common NZ city names
        nz_cities = [
            "Auckland", "Wellington", "Christchurch", "Hamilton", "Tauranga",
            "Napier", "Palmerston North", "Dunedin", "Nelson", "Invercargill"
        ]
        
        for nz_city in nz_cities:
            if nz_city.lower() in address.lower():
                city = nz_city
                break
        
        return city, region
    
    async def search_nz_cities(self, query: str, max_results: int = 20) -> List[Dict[str, Any]]:
        """Search in major NZ cities."""
        all_items = []
        cities = [
            "Auckland", "Wellington", "Christchurch", "Hamilton", "Tauranga"
        ]
        
        for city in cities:
            items = await self.search_places(query, city)
            all_items.extend(items[:max_results])
            await asyncio.sleep(0.5)
        
        return all_items
    
    async def search_all_nz_kindergartens(self) -> List[Dict[str, Any]]:
        """Search for kindergartens across New Zealand."""
        all_items = []
        
        # Search queries
        queries = [
            "kindergarten",
            "early childhood education",
            "preschool",
            "childcare center",
            "daycare",
        ]
        
        # Major cities in NZ
        cities = [
            "Auckland", "Wellington", "Christchurch", "Hamilton", "Tauranga",
            "Napier", "Palmerston North", "Dunedin", "Nelson", "Invercargill",
            "Rotorua", "New Plymouth", "Whangarei", "Gisborne", "Timaru"
        ]
        
        for query in queries:
            print(f"\nSearching for: {query}")
            
            # Search in each city
            for city in cities[:5]:  # Limit to first 5 cities for testing
                items = await self.search_places(query, city)
                all_items.extend(items)
                
                # Rate limiting
                await asyncio.sleep(0.5)
            
            # Also search nationwide
            items = await self.search_places(query, "New Zealand")
            all_items.extend(items)
            
            await asyncio.sleep(1)
        
        # Remove duplicates based on name and address
        seen = set()
        unique_items = []
        for item in all_items:
            key = (item.get("name", ""), item.get("address", ""))
            if key not in seen:
                seen.add(key)
                unique_items.append(item)
        
        print(f"\nTotal unique places found: {len(unique_items)}")
        return unique_items


async def scrape_from_google_places(db: Session) -> Dict[str, Any]:
    """Main function to scrape from Google Places API."""
    from app.services.scraper import KindergartenScraper
    
    async with GooglePlacesScraper(db) as scraper:
        # Search for kindergartens in major NZ cities
        print("Searching Google Places API for kindergartens...")
        all_data = await scraper.search_nz_cities("kindergarten", max_results=10)
        
        # Also search for early childhood education
        early_childhood = await scraper.search_nz_cities("early childhood education", max_results=10)
        all_data.extend(early_childhood)
        
        # Remove duplicates
        seen = set()
        unique_data = []
        for item in all_data:
            key = (item.get("name", ""), item.get("address", ""))
            if key not in seen and key[0]:  # Ensure name is not empty
                seen.add(key)
                unique_data.append(item)
        
        print(f"Found {len(unique_data)} unique kindergartens")
        
        if not unique_data:
            print("No data found from Google Places API")
            return {
                "status": "no_data",
                "items_found": 0,
                "import_result": {"created": 0, "updated": 0, "skipped": 0, "errors": 0, "total": 0},
            }
        
        # Process and import data
        async with KindergartenScraper(db) as scraper_processor:
            result = await scraper_processor.import_kindergartens(unique_data, update_existing=True)
        
        return {
            "status": "success",
            "sources_scraped": True,
            "items_found": len(unique_data),
            "import_result": result,
            "timestamp": datetime.utcnow().isoformat(),
        }

