# Dev Challenge

Real-time map for discovering EV charging stations with live weather data.

## Overview

This project demonstrates a full-stack application with:

- **Frontend**: React 19 + TypeScript + ArcGIS SDK + TanStack Query
- **Backend**: Node.js + Hono + TypeScript

## Quick Start

### 1. Start the Backend

```bash
cd backend
npm install
npm run dev
```

The backend runs on http://localhost:3001

### 2. Start the Frontend

```bash
cd frontend
npm install
npm run dev
```

The frontend runs on http://localhost:5173

### 3. Open the App

Navigate to http://localhost:5173 in your browser.

## Configuration

### Frontend (.env)

```env
VITE_API_URL=http://localhost:3001
VITE_ARCGIS_API_KEY=your_arcgis_api_key
```

### Backend (.env)

```env
PORT=3001
OCM_API_KEY=your_ocm_api_key
OPENWEATHER_API_KEY=your_openweather_api_key
```

## Features

| Feature | Description |
|---------|-------------|
| Interactive Map | ArcGIS SDK with pan/zoom controls |
| EV Chargers | Color-coded markers (green=available, red=unavailable) |
| Weather Panel | Current weather for map center location |
| Detail Panel | Click marker to view station info |
| Error Handling | Clear API errors surfaced to the UI |

## API Keys

### ArcGIS (Required for basemap tiles)

1. Create account at https://location.arcgis.com
2. Create API key with **Basemaps** privilege
3. Add referrer restrictions for localhost

### Open Charge Map (Required for EV station data)

1. Create account at https://openchargemap.org
2. Go to My Profile > My Apps > Register Application
3. Copy API key to backend `.env`

### OpenWeatherMap (Optional for weather panel)

1. Create account at https://openweathermap.org
2. Go to API Keys in your account
3. Copy API key to backend `.env`

## Testing

```bash
# Backend tests
cd backend && npm run test:run

# Frontend tests
cd frontend && npm run test:run
```

## Architecture

```
challenge/
├── backend/
│   ├── src/
│   │   ├── app.ts             # Hono app configuration
│   │   ├── server.ts          # Server entry point
│   │   ├── locations/         # Feature module
│   │   ├── clients/           # External API clients
│   │   └── middleware/        # Error handling
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── App.tsx            # Main component
│   │   ├── components/        # UI components
│   │   ├── hooks/             # TanStack Query hooks
│   │   ├── services/          # API client
│   │   └── types/             # TypeScript types
│   └── package.json
└── .env.example
```

## Performance Optimizations

- **Lazy Loading**: Map and panel components are lazy-loaded
- **Code Splitting**: Separate chunks for React, ArcGIS, TanStack Query
- **Debounced API Calls**: 500ms debounce on map movement
- **Query Caching**: 5-minute stale time, 30-minute garbage collection
- **Vector Basemap**: Lightweight gray-vector style
- **Location Accumulation**: Markers persist across pans with memory cleanup
