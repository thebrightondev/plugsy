# EV Charging Stations Map - Challenge

An interactive map application displaying EV charging stations using ArcGIS SDK and React.

## Tech Stack

| Layer | Technology |
|-------|------------|
| Build | Vite (rolldown-vite) |
| UI Framework | React 19 |
| Language | TypeScript (strict mode) |
| Styling | Tailwind CSS 4.1 |
| Map | ArcGIS JavaScript SDK |
| Data Fetching | TanStack Query v5 |
| Validation | Zod |
| Testing | Vitest + React Testing Library |

## Quick Start

```bash
# Install dependencies
npm install

# Start development server
npm run dev
```

The frontend runs on http://localhost:5173 (or 5174 if 5173 is in use).

## Environment Variables

Create a `.env` file in this directory:

```env
VITE_API_URL=http://localhost:3001
VITE_ARCGIS_API_KEY=your_arcgis_api_key
```

### Getting an ArcGIS API Key

1. Create a free account at https://location.arcgis.com
2. Go to **API Keys** in the dashboard
3. Create a new key with **Basemaps** privilege
4. Add referrer restrictions: `http://localhost:5173`, `http://localhost:5174`

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server |
| `npm run build` | Build for production |
| `npm run test` | Run tests in watch mode |
| `npm run test:run` | Run tests once |
| `npm run lint` | Lint the codebase |

## Architecture

```
src/
├── components/
│   ├── Map/            # ArcGIS MapView + markers
│   ├── LocationPanel/  # Station detail panel
│   ├── WeatherPanel/   # Weather info display
│   ├── LoadingOverlay/ # Loading indicator
│   ├── ErrorMessage/   # Error display with retry
│   └── ui/             # Shared UI components (shadcn)
├── hooks/
│   └── useLocations    # TanStack Query hook
├── services/
│   └── api             # API client with error handling
├── types/
│   └── index           # TypeScript interfaces
└── test/
    └── setup           # Test configuration
```

## Key Features

- **Interactive Map**: Pan and zoom to explore charging stations
- **Color-Coded Markers**: Green (available), Red (unavailable), Blue (selected)
- **Weather Panel**: Current weather displayed for map center
- **Detail Panel**: Click a marker to see station details
- **Debounced Loading**: 500ms debounce on map movement
- **Location Accumulation**: Markers persist across pans with memory cleanup
- **Error Handling**: RFC 7807 Problem Details with graceful degradation and retry
- **Lazy Loading**: Map and panel components are lazy-loaded for performance
