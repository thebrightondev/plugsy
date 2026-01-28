import type { Location } from '../locations/locations.schema.js';
import { QUERY_LIMITS } from '../locations/locations.schema.js';
import { ApiError } from '../middleware/error-handler.js';

const OPEN_CHARGE_MAP_API_URL = 'https://api.openchargemap.io/v3/poi';

interface OpenChargeMapPOI {
  ID: number;
  AddressInfo: {
    Title: string;
    AddressLine1?: string;
    Town?: string;
    StateOrProvince?: string;
    Postcode?: string;
    Country?: {
      Title: string;
    };
    Latitude: number;
    Longitude: number;
  };
  OperatorInfo?: {
    Title: string;
  };
  Connections?: Array<{
    ConnectionType?: {
      Title: string;
    };
    PowerKW?: number;
    StatusType?: {
      IsOperational: boolean;
    };
  }>;
  NumberOfPoints?: number;
  StatusType?: {
    IsOperational: boolean;
  };
}

function transformPOI(poi: OpenChargeMapPOI): Location {
  const connections = poi.Connections || [];
  const connectionTypes = [
    ...new Set(
      connections
        .map((c) => c.ConnectionType?.Title)
        .filter((t): t is string => !!t),
    ),
  ];

  const maxPower = Math.max(
    ...connections.map((c) => c.PowerKW || 0),
    0,
  );

  const isOperational =
    poi.StatusType?.IsOperational ??
    connections.some((c) => c.StatusType?.IsOperational !== false);

  const address = [
    poi.AddressInfo.AddressLine1,
    poi.AddressInfo.Town,
    poi.AddressInfo.StateOrProvince,
    poi.AddressInfo.Postcode,
  ]
    .filter(Boolean)
    .join(', ');

  return {
    id: String(poi.ID),
    name: poi.AddressInfo.Title || 'Unknown Station',
    latitude: poi.AddressInfo.Latitude,
    longitude: poi.AddressInfo.Longitude,
    address: address || 'Address not available',
    operator: poi.OperatorInfo?.Title || null,
    connectionTypes,
    powerKW: maxPower > 0 ? maxPower : null,
    available: isOperational,
    numberOfPoints: poi.NumberOfPoints || 1,
    source: 'transport',
  };
}

export async function fetchChargingStations(
  lat: number,
  lng: number,
  radiusKm: number = QUERY_LIMITS.RADIUS_DEFAULT_KM,
  maxResults: number = QUERY_LIMITS.MAX_RESULTS_DEFAULT,
): Promise<Location[]> {
  const apiKey = process.env.OCM_API_KEY;

  if (!apiKey) {
    throw new ApiError(
      500,
      'config-missing-api-key',
      'Configuration Error',
      'OCM_API_KEY environment variable is not set',
    );
  }

  const url = new URL(OPEN_CHARGE_MAP_API_URL);
  url.searchParams.set('latitude', String(lat));
  url.searchParams.set('longitude', String(lng));
  url.searchParams.set('distance', String(radiusKm));
  url.searchParams.set('distanceunit', 'km');
  url.searchParams.set('maxresults', String(maxResults));
  url.searchParams.set('compact', 'true');
  url.searchParams.set('verbose', 'false');
  url.searchParams.set('key', apiKey);

  const response = await fetch(url.toString(), {
    headers: { Accept: 'application/json' },
  });

  if (!response.ok) {
    throw new ApiError(
      502,
      'upstream-service-error',
      'Upstream Service Error',
      `Open Charge Map API returned ${response.status} ${response.statusText}`,
    );
  }

  const data = (await response.json()) as OpenChargeMapPOI[];
  return data.map(transformPOI);
}
