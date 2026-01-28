import { useState, useCallback, useMemo, lazy, Suspense } from 'react';
import { useLocations } from './hooks/useLocations';
import type { Location, MapBounds } from './types';
import { ApiError } from './services/api';
import LoadingOverlay from './components/LoadingOverlay/LoadingOverlay';
import ErrorMessage from './components/ErrorMessage/ErrorMessage';
import WeatherPanel from './components/WeatherPanel/WeatherPanel';

const MapComponent = lazy(() => import('./components/Map/Map'));
const LocationPanel = lazy(() => import('./components/LocationPanel/LocationPanel'));

// Module-level cache - outside React state to avoid render cycle issues
const locationsCache = new Map<string, Location>();

const CACHE_CONFIG = {
  MAX_SIZE: 500,
  CLEANUP_DISTANCE_KM: 100,
  EARTH_RADIUS_KM: 6371,
} as const;

/** Calculate distance between two points using Haversine formula */
function getDistanceKm(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLng / 2) *
      Math.sin(dLng / 2);
	return CACHE_CONFIG.EARTH_RADIUS_KM * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

function updateLocationsCache(newLocations: Location[], bounds: MapBounds | null): Location[] {
  newLocations.forEach((loc) => locationsCache.set(loc.id, loc));

  if (bounds && locationsCache.size > CACHE_CONFIG.MAX_SIZE) {
    const toRemove: string[] = [];
    locationsCache.forEach((loc, id) => {
      const distance = getDistanceKm(bounds.lat, bounds.lng, loc.latitude, loc.longitude);
      if (distance > CACHE_CONFIG.CLEANUP_DISTANCE_KM) {
        toRemove.push(id);
      }
    });
    toRemove.forEach((id) => locationsCache.delete(id));
  }

	return Array.from(locationsCache.values());
}

interface ErrorInfo {
  title: string;
  message: string;
  problemType?: string;
}

/** Extract the problem type slug from RFC 7807 type URI */
function getProblemSlug(typeUri: string): string {
  if (typeUri === 'about:blank') return '';
  const parts = typeUri.split('/');
  return parts[parts.length - 1] ?? '';
}

function getErrorInfo(error: unknown): ErrorInfo {
  if (error instanceof ApiError) {
    const slug = getProblemSlug(error.type);

    if (slug === 'config-missing-api-key') {
      return {
        title: 'Server configuration error',
        message: 'The EV charging data service is not configured correctly.',
        problemType: slug,
      };
    }

    if (slug === 'upstream-service-error') {
      return {
        title: error.title,
        message: error.detail ?? 'An upstream service is unavailable',
        problemType: slug,
      };
    }

    return {
      title: error.title,
      message: error.detail ?? error.message,
      problemType: slug || undefined,
    };
  }

  if (error instanceof Error) {
    return {
      title: 'Error loading data',
      message: error.message,
    };
  }

  return {
    title: 'Error loading data',
    message: 'Failed to load data',
  };
}

function App() {
  const [bounds, setBounds] = useState<MapBounds | null>(null);
  const [selectedLocation, setSelectedLocation] = useState<Location | null>(null);

  const { data, isFetching, isError, error, refetch } = useLocations(bounds);

  const newData = data?.data;
  const locations = useMemo(() => {
    if (newData) {
      return updateLocationsCache(newData, bounds);
    }
    return Array.from(locationsCache.values());
  }, [newData, bounds]);

  const handleBoundsChange = useCallback((newBounds: MapBounds) => {
    setBounds(newBounds);
  }, []);

  const handleLocationSelect = useCallback((location: Location | null) => {
    setSelectedLocation(location);
  }, []);

	const handleClosePanel = useCallback(() => {
		setSelectedLocation(null);
	}, []);

	const errorInfo = isError ? getErrorInfo(error) : null;

	return (
    <div className="relative h-full w-full">
      {/* Map */}
      <Suspense fallback={<div className="flex h-full items-center justify-center bg-gray-100">Loading map...</div>}>
        <MapComponent
          locations={locations}
          onBoundsChange={handleBoundsChange}
          onLocationSelect={handleLocationSelect}
          selectedLocation={selectedLocation}
        />
      </Suspense>

      {/* Weather panel - left side */}
      {data?.weather && <WeatherPanel weather={data.weather} />}

      {/* Loading state */}
      {isFetching && <LoadingOverlay message="Loading chargers..." />}

      {/* Error state */}
      {isError && errorInfo && (
        <ErrorMessage
          title={errorInfo.title}
          message={errorInfo.message}
          code={errorInfo.problemType}
          onRetry={() => refetch()}
        />
      )}

      {/* Location panel - right side */}
      {selectedLocation && (
        <Suspense fallback={null}>
          <LocationPanel location={selectedLocation} onClose={handleClosePanel} />
        </Suspense>
      )}
    </div>
  );
}

export default App;
