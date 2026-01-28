# EV Charging Stations API - Backend

Node.js backend that composes data from Open Charge Map and OpenWeatherMap APIs.

## Tech Stack

| Layer | Technology |
|-------|------------|
| Framework | Hono |
| Runtime | Node.js |
| Language | TypeScript |
| Validation | Zod |
| Testing | Vitest |

## Quick Start

```bash
# Install dependencies
npm install

# Start development server (with hot reload)
npm run dev
```

The server runs on http://localhost:3001.

## Environment Variables

Create a `.env` file in this directory:

```env
PORT=3001

# Open Charge Map API Key (required)
OCM_API_KEY=your_ocm_api_key

# OpenWeatherMap API Key (optional - weather panel)
OPENWEATHER_API_KEY=your_openweather_api_key
```

### Getting API Keys

**Open Charge Map (Required)**
1. Create an account at https://openchargemap.org
2. Go to **My Profile** > **My Apps**
3. Click **Register an Application**
4. Copy the API key

**OpenWeatherMap (Optional)**
1. Create an account at https://openweathermap.org
2. Go to **API Keys** in your account
3. Copy the default key or create a new one

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start dev server with hot reload |
| `npm run build` | Compile TypeScript |
| `npm run start` | Run compiled JavaScript |
| `npm run test` | Run tests in watch mode |
| `npm run test:run` | Run tests once |

## API Endpoints

### Health Check

```
GET /health
```

Response:
```json
{
  "status": "ok",
  "timestamp": "2026-01-28T12:00:00.000Z"
}
```

### Get Locations

```
GET /api/locations?lat=50.8&lng=-1.1&radius=10
```

Query Parameters:

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| lat | number | Yes | Latitude (-90 to 90) |
| lng | number | Yes | Longitude (-180 to 180) |
| radius | number | No | Search radius in km (default: 10, max: 100) |
| maxResults | number | No | Max results (default: 50, max: 100) |

Response:
```json
{
  "data": [
    {
      "id": "ocm-12345",
      "name": "Pod Point - Station 1",
      "latitude": 50.82,
      "longitude": -1.09,
      "address": "100 High Street, Portsmouth, PO1 1AA",
      "operator": "Pod Point",
      "connectionTypes": ["Type 2", "CCS"],
      "powerKW": 50,
      "available": true,
      "numberOfPoints": 4,
      "source": "transport"
    }
  ],
  "meta": {
    "count": 1,
    "radius": 10,
    "center": { "lat": 50.8, "lng": -1.1 }
  },
  "weather": {
    "location": "Brighton",
    "temperature": 12,
    "feelsLike": 10,
    "humidity": 75,
    "description": "Partly cloudy",
    "icon": "03d",
    "windSpeed": 5.2,
    "pressure": 1015
  }
}
```

## Architecture

```
src/
├── app.ts                # Hono app configuration
├── server.ts             # Server entry point
├── locations/
│   ├── locations.routes.ts   # API endpoints
│   ├── locations.service.ts  # Business logic
│   └── locations.schema.ts   # Zod schemas & types
├── clients/
	│   ├── open-charge-map.client.ts   # EV charging API
	│   └── open-weather.client.ts      # Weather API
└── middleware/
    └── error-handler.ts  # Global error handler
```

## Error Handling

All errors follow [RFC 7807 Problem Details](https://datatracker.ietf.org/doc/html/rfc7807) format with `Content-Type: application/problem+json`:

```json
{
  "type": "https://api.example.com/problems/validation-error",
  "title": "Validation Error",
  "status": 400,
  "detail": "lat: Required; lng: Required",
  "instance": "/api/locations"
}
```

Problem types:
- `validation-error` - Invalid request parameters
- `config-missing-api-key` - Server misconfiguration
- `upstream-service-error` - External API failure
- `not-found` - Resource not found
- `internal-error` - Unexpected server error

