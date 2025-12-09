# Kindergartens & Early Childhood Education API

Complete backend API documentation for kindergartens.

## Endpoint List

### 1. Get Kindergarten List

**GET** `/kindergartens/`

Get a list of all kindergartens with support for multiple filters and pagination.

**Query Parameters:**
- `region` (optional): Filter by region
- `city` (optional): Filter by city
- `suburb` (optional): Filter by suburb
- `name` (optional): Search by name keyword
- `education_system` (optional): Filter by education system (e.g., Montessori, Reggio Emilia)
- `skip` (optional, default 0): Number of records to skip (pagination)
- `limit` (optional, default 100, max 1000): Maximum number of records to return

**Examples:**
```bash
# Get all kindergartens
GET /kindergartens/

# Filter by city
GET /kindergartens/?city=Auckland

# Search by name
GET /kindergartens/?name=Montessori

# Pagination
GET /kindergartens/?skip=0&limit=20
```

**Response:**
```json
[
  {
    "id": 1,
    "name": "Auckland Kindergarten",
    "school_type": "kindergarten",
    "description": "...",
    "owner": "...",
    "education_systems": "Montessori, Play-based",
    "tuition_min": 1000,
    "tuition_max": 2000,
    "tuition_currency": "NZD",
    "region": "Auckland",
    "city": "Auckland",
    "suburb": "CBD",
    "address": "123 Main St",
    "latitude": -36.8485,
    "longitude": 174.7633,
    "website": "https://example.com",
    "phone": "+64 9 123 4567",
    "email": "info@example.com"
  }
]
```

### 2. Get Kindergarten Details

**GET** `/kindergartens/{kindergarten_id}`

Get detailed information about a specific kindergarten.

**Path Parameters:**
- `kindergarten_id`: Kindergarten ID

**Example:**
```bash
GET /kindergartens/1
```

**Response:**
```json
{
  "id": 1,
  "name": "Auckland Kindergarten",
  ...
}
```

### 3. Create Kindergarten

**POST** `/kindergartens/`

Create a new kindergarten record. Requires authentication.

**Request Body:**
```json
{
  "name": "New Kindergarten",
  "school_type": "kindergarten",
  "description": "A great kindergarten",
  "owner": "Owner Name",
  "education_systems": "Montessori",
  "tuition_min": 1000,
  "tuition_max": 2000,
  "tuition_currency": "NZD",
  "region": "Auckland",
  "city": "Auckland",
  "suburb": "CBD",
  "address": "123 Main St",
  "latitude": -36.8485,
  "longitude": 174.7633,
  "website": "https://example.com",
  "phone": "+64 9 123 4567",
  "email": "info@example.com"
}
```

**Response:** 201 Created, returns the created kindergarten object

### 4. Update Kindergarten

**PUT** `/kindergartens/{kindergarten_id}`

Update existing kindergarten information. Requires authentication.

**Path Parameters:**
- `kindergarten_id`: Kindergarten ID

**Request Body:** Same as create, but all fields are optional

**Response:** Returns the updated kindergarten object

### 5. Delete Kindergarten

**DELETE** `/kindergartens/{kindergarten_id}`

Delete a kindergarten. Requires authentication.

**Path Parameters:**
- `kindergarten_id`: Kindergarten ID

**Response:** 204 No Content

### 6. Get Statistics

**GET** `/kindergartens/stats`

Get kindergarten statistics.

**Query Parameters:**
- `region` (optional): Filter statistics by region
- `city` (optional): Filter statistics by city

**Examples:**
```bash
GET /kindergartens/stats
GET /kindergartens/stats?region=Auckland
GET /kindergartens/stats?city=Wellington
```

**Response:**
```json
{
  "total": 150,
  "by_region": [
    {"region": "Auckland", "count": 50},
    {"region": "Wellington", "count": 30}
  ],
  "by_city": [
    {"city": "Auckland", "count": 40},
    {"city": "Hamilton", "count": 20}
  ],
  "by_education_system": {
    "Montessori": 30,
    "Reggio Emilia": 25,
    "Play-based": 45
  }
}
```

### 7. Search Locations

**GET** `/kindergartens/search/locations`

Search for locations (regions, cities, suburbs) that contain kindergartens. Used for autocomplete functionality.

**Query Parameters:**
- `query` (required): Search keyword

**Example:**
```bash
GET /kindergartens/search/locations?query=Auck
```

**Response:**
```json
{
  "regions": ["Auckland"],
  "cities": ["Auckland", "Auckland Central"],
  "suburbs": ["Auckland CBD", "Auckland Heights"]
}
```

## Authentication

Create, update, and delete operations require authentication. Add to request headers:

```
Authorization: Bearer <access_token>
```

For methods to obtain tokens, refer to the authentication API documentation.

## Error Responses

### 404 Not Found
```json
{
  "detail": "Kindergarten not found"
}
```

### 400 Bad Request
```json
{
  "detail": "Kindergarten with this name already exists"
}
```

### 401 Unauthorized
```json
{
  "detail": "Could not validate credentials"
}
```

## Data Model

Kindergartens use the unified `School` model, with the `school_type` field must be `"kindergarten"`.

Main fields:
- `name`: Kindergarten name
- `owner`: Owner/organization
- `education_systems`: Education system (comma-separated, e.g., "Montessori, Reggio Emilia")
- `tuition_min/max`: Tuition range
- `region/city/suburb`: Geographic location
- `address`: Detailed address
- `latitude/longitude`: Coordinates
- `website/phone/email`: Contact information
