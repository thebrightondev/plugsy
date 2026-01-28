import { useQuery, keepPreviousData } from '@tanstack/react-query';
import { getLocations } from '../services/api';
import type { ApiResponse, MapBounds } from '../types';

const QUERY_CONFIG = {
  COORDINATE_PRECISION: 1000,
  STALE_TIME_MS: 5 * 60 * 1000,
  GC_TIME_MS: 30 * 60 * 1000,
} as const;

const EMPTY_RESPONSE: ApiResponse = {
  data: [],
  meta: { count: 0, radius: 0, center: { lat: 0, lng: 0 } },
  weather: null,
};

export function useLocations(bounds: MapBounds | null) {
  const roundedLat = bounds
    ? Math.round(bounds.lat * QUERY_CONFIG.COORDINATE_PRECISION) / QUERY_CONFIG.COORDINATE_PRECISION
    : null;
  const roundedLng = bounds
    ? Math.round(bounds.lng * QUERY_CONFIG.COORDINATE_PRECISION) / QUERY_CONFIG.COORDINATE_PRECISION
    : null;
  const roundedRadius = bounds ? Math.round(bounds.radius) : null;

  return useQuery({
    queryKey: ['locations', roundedLat, roundedLng, roundedRadius],
    queryFn: () => (bounds ? getLocations(bounds) : EMPTY_RESPONSE),
    enabled: !!bounds,
    staleTime: QUERY_CONFIG.STALE_TIME_MS,
    gcTime: QUERY_CONFIG.GC_TIME_MS,
    refetchOnWindowFocus: false,
    placeholderData: keepPreviousData,
  });
}

