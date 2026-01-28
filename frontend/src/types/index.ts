// Location data from backend
export type LocationSource = 'transport';

export interface Location {
  id: string;
  name: string;
  latitude: number;
  longitude: number;
  source: LocationSource;
  address: string;
  operator: string | null;
  connectionTypes: string[];
  powerKW: number | null;
  available: boolean;
  numberOfPoints: number;
}

// Weather data from backend
export interface Weather {
  location: string;
  temperature: number;
  feelsLike: number;
  humidity: number;
  description: string;
  icon: string;
  windSpeed: number;
  pressure: number;
}

// API response
export interface ApiResponse {
  data: Location[];
  meta: {
    count: number;
    radius: number;
    center: {
      lat: number;
      lng: number;
    };
    sources?: Partial<Record<LocationSource, number>>;
  };
  weather: Weather | null;
}

// Map bounds for queries
export interface MapBounds {
  lat: number;
  lng: number;
  radius: number;
}

// Map state
export interface MapState {
  center: { lat: number; lng: number };
  zoom: number;
}

