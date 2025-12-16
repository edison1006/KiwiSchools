"""
New Zealand Education Data Sources
Lists and manages data sources for kindergarten data.
"""
from typing import List, Dict, Any

# Known data sources for New Zealand kindergarten/early childhood education data
NZ_DATA_SOURCES = [
    {
        "name": "Education Counts - Early Childhood Education",
        "url": "https://www.educationcounts.govt.nz/data",
        "type": "web",
        "description": "Official education statistics website",
        "status": "available",
    },
    {
        "name": "Ministry of Education - Find a School",
        "url": "https://www.education.govt.nz/our-work/contact-us/find-a-school/",
        "type": "web",
        "description": "Official school finder",
        "status": "available",
    },
    {
        "name": "Education Counts CSV Downloads",
        "url": "https://www.educationcounts.govt.nz/__data/assets/excel_doc/",
        "type": "csv",
        "description": "CSV data downloads (need to find actual file URLs)",
        "status": "needs_inspection",
    },
]

# Common CSV download patterns (these need to be discovered)
CSV_DOWNLOAD_PATTERNS = [
    # These are examples - actual URLs need to be discovered
    # "https://www.educationcounts.govt.nz/__data/assets/excel_doc/0001/.../early-childhood-services.xlsx",
    # "https://www.education.govt.nz/assets/Documents/.../kindergartens.csv",
]

def get_available_sources() -> List[Dict[str, Any]]:
    """Get list of available data sources."""
    return NZ_DATA_SOURCES



