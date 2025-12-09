# Kindergarten Data Scraping Guide

## Overview

This system provides functionality to scrape real-time kindergarten information nationwide. The scraping service supports fetching data from multiple sources and automatically importing it into the database.

## Features

- ✅ Support for scraping from multiple data sources (API, web pages)
- ✅ Automatic data cleaning and standardization
- ✅ Intelligent location parsing (region, city, suburb)
- ✅ Contact information extraction (phone, email, website)
- ✅ Education system identification
- ✅ Batch import and update
- ✅ Background task support
- ✅ Task status tracking

## API Endpoints

### 1. Trigger Async Scraping

**POST** `/api/v1/scraper/kindergartens`

Start a background task to scrape kindergarten data.

**Request Body:**
```json
{
  "sources": [
    "https://api.example.com/kindergartens",
    "https://www.education.govt.nz/data"
  ],
  "update_existing": true
}
```

**Response:**
```json
{
  "status": "started",
  "message": "Kindergarten scraping task started",
  "task_id": "scrape_1_0"
}
```

### 2. Synchronous Scraping (Returns Results Immediately)

**POST** `/api/v1/scraper/kindergartens/sync`

Scrape data synchronously and wait for completion before returning results.

**Request Body:** Same as above

**Response:**
```json
{
  "status": "success",
  "message": "Kindergarten data scraped successfully",
  "sources_scraped": 2,
  "import_result": {
    "created": 150,
    "updated": 20,
    "skipped": 5,
    "errors": 0,
    "total": 175
  },
  "timestamp": "2024-01-01T12:00:00"
}
```

### 3. Query Task Status

**GET** `/api/v1/scraper/kindergartens/status/{task_id}`

Query the execution status of a background task.

**Response:**
```json
{
  "status": "completed",
  "result": {
    "sources_scraped": 2,
    "import_result": {
      "created": 150,
      "updated": 20,
      "skipped": 5,
      "errors": 0
    }
  }
}
```

### 4. Get Available Data Sources

**GET** `/api/v1/scraper/kindergartens/sources`

Get a list of available data sources.

**Response:**
```json
{
  "sources": [
    {
      "name": "Ministry of Education API",
      "url": "https://api.education.govt.nz/kindergartens",
      "type": "api",
      "status": "available"
    }
  ],
  "total": 1
}
```

## Usage Examples

### Python Example

```python
import requests

# Login to get token
login_response = requests.post(
    "http://localhost:8000/api/v1/auth/login/json",
    json={
        "email": "admin@kiwischools.com",
        "password": "admin123"
    }
)
token = login_response.json()["access_token"]

headers = {"Authorization": f"Bearer {token}"}

# Trigger synchronous scraping
response = requests.post(
    "http://localhost:8000/api/v1/scraper/kindergartens/sync",
    json={
        "sources": [
            # Add actual data source URLs
        ],
        "update_existing": True
    },
    headers=headers
)

print(response.json())
```

### cURL Example

```bash
# 1. Login to get token
TOKEN=$(curl -X POST "http://localhost:8000/api/v1/auth/login/json" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@kiwischools.com",
    "password": "admin123"
  }' | jq -r '.access_token')

# 2. Trigger synchronous scraping
curl -X POST "http://localhost:8000/api/v1/scraper/kindergartens/sync" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "sources": [],
    "update_existing": true
  }'
```

## Data Source Configuration

### Adding New Data Sources

1. **API Data Sources**:
   - Ensure the API returns JSON format data
   - Data should include the following fields (or similar):
     - `name`: Kindergarten name
     - `location` or `address`: Location information
     - `phone`, `email`, `website`: Contact information
     - `description`: Description information
     - `education_system`: Education system

2. **Web Page Data Sources**:
   - Need to implement specific CSS selectors in `scraper.py`
   - Modify the `scrape_from_web` method to adapt to target website structure

### Example: Adding a New API Data Source

When calling the scraping API, add the data source URL to the `sources` array:

```json
{
  "sources": [
    "https://your-api.com/kindergartens",
    "https://another-api.com/data/kindergartens.json"
  ]
}
```

## Data Cleaning Features

The scraping service automatically performs the following data cleaning operations:

1. **Location Parsing**:
   - Automatically identify region
   - Automatically identify city
   - Automatically identify suburb

2. **Contact Information Extraction**:
   - Phone number format standardization
   - Email address validation
   - Website URL normalization

3. **Education System Identification**:
   - Identify education system from description text
   - Supports: Montessori, Reggio Emilia, Play-based, Bilingual, Waldorf/Steiner

## Scheduled Tasks (Optional)

You can set up scheduled tasks to automatically scrape data. Example using APScheduler:

```python
from apscheduler.schedulers.background import BackgroundScheduler
from app.services.scraper import scrape_kindergartens
from app.db.session import SessionLocal

scheduler = BackgroundScheduler()

@scheduler.scheduled_job('cron', hour=2, minute=0)  # Daily at 2 AM
def scheduled_scrape():
    db = SessionLocal()
    try:
        result = await scrape_kindergartens(db)
        print(f"Scraping completed: {result}")
    finally:
        db.close()

scheduler.start()
```

## Notes

1. **Permission Requirements**: Only superusers can trigger data scraping
2. **Data Sources**: Need to configure actual data source URLs
3. **Rate Limits**: Pay attention to data source terms of service and rate limits
4. **Error Handling**: Errors during scraping will be recorded but will not interrupt the entire process
5. **Data Updates**: By default, existing records will be updated, can be disabled with `update_existing: false`

## Troubleshooting

### Scraping Failed

1. Check if data source URLs are accessible
2. Check network connection
3. View backend logs for detailed error information
4. Verify data source return data format

### Incomplete Data

1. Check if data sources contain required fields
2. May need to adjust data parsing logic
3. Check if data cleaning rules are correct

## Next Steps

- [ ] Configure actual New Zealand education department data sources
- [ ] Implement scraping logic for more data sources
- [ ] Add data validation rules
- [ ] Implement incremental update mechanism
- [ ] Add data quality reports
