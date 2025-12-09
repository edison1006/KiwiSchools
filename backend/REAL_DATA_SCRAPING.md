# Real Data Scraping Guide

This guide explains how to scrape real kindergarten data from online sources in New Zealand.

## Data Source Options

### 1. Google Places API (Recommended)

Google Places API is the most reliable data source for obtaining kindergarten information across New Zealand.

#### Setup Steps:

1. **Get Google Maps API Key**
   - Visit [Google Cloud Console](https://console.cloud.google.com/)
   - Create a new project or select an existing project
   - Enable "Places API" and "Geocoding API"
   - Create an API Key

2. **Configure API Key**
   - Add to `backend/.env` file:
     ```
     GOOGLE_MAPS_API_KEY=your_api_key_here
     ```

3. **Run Scraping Script**
   ```bash
   cd backend
   source .venv/bin/activate
   python scripts/test_google_places.py
   ```

#### Advantages:
- Accurate and real-time data
- Includes detailed information: address, phone, website
- Has geographic coordinates

#### Disadvantages:
- Requires API Key (may have costs)
- Has request limits

### 2. Official Education Websites

Attempt to scrape data from the following websites:
- Education Counts: https://www.educationcounts.govt.nz/
- Ministry of Education: https://www.education.govt.nz/

**Note**: These websites may require special handling or authentication.

### 3. Custom Data Sources

You can add your own data sources:

1. **CSV Files**
   - Place CSV files at an accessible URL
   - Add URL in `backend/app/services/nz_education_scraper.py`

2. **API Endpoints**
   - Configure in `.env`:
     ```
     EDUCATION_API_URL=https://your-api-url.com/kindergartens
     EDUCATION_API_KEY=your_api_key
     ```

## Usage

### Scraping via Script

```bash
cd backend
source .venv/bin/activate
python scripts/scrape_real_data.py
```

### Scraping via API

1. **Login to Get Token**
   ```bash
   curl -X POST "http://localhost:8000/api/v1/auth/login/json" \
     -H "Content-Type: application/json" \
     -d '{"email":"admin@kiwischools.com","password":"admin123"}'
   ```

2. **Trigger Scraping**
   ```bash
   curl -X POST "http://localhost:8000/api/v1/scraper/kindergartens/sync" \
     -H "Authorization: Bearer YOUR_TOKEN" \
     -H "Content-Type: application/json" \
     -d '{"sources": [], "update_existing": true}'
   ```

## Data Scraping Flow

1. **Try Google Places API** (if API Key is configured)
2. **Try Official Education Websites**
3. **Try Configured Custom APIs**
4. **Try CSV Download Links**
5. **If no data found, use sample data**

## Data Field Mapping

Scraped data will be mapped to the following fields:

- `name` → Kindergarten name
- `address` → Address
- `city` → City (parsed from address)
- `region` → Region (parsed from address)
- `latitude` / `longitude` → Geographic coordinates
- `phone` → Phone number
- `website` → Website URL
- `education_systems` → Education system (identified from description)

## Troubleshooting

### Issue: No Data Found

**Possible Causes:**
1. API Key not configured or invalid
2. Website structure has changed
3. Network connection issues

**Solutions:**
1. Check API Key in `.env` file
2. Run `python scripts/find_data_sources.py` to find available data sources
3. Check network connection

### Issue: API Returns Error

**Google Places API Errors:**
- `REQUEST_DENIED`: API Key invalid or service not enabled
- `OVER_QUERY_LIMIT`: Request limit exceeded
- `INVALID_REQUEST`: Request parameter error

**Solutions:**
1. Check if API Key is correct
2. Ensure "Places API" is enabled
3. Check API quota and limits

## Notes

1. **Comply with Terms of Service**: Ensure compliance with Google Places API and other data source terms of service
2. **Data Accuracy**: Scraped data may require manual verification
3. **Update Frequency**: Recommend regular updates to maintain accuracy
4. **Costs**: Google Places API may have usage fees, please check quota

## Next Steps

After scraping data, it will be automatically imported into the database. You can view all kindergarten lists on the frontend page.
