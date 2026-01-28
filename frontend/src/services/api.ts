import type { ApiResponse, MapBounds } from '../types';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

const ENDPOINTS = {
  locations: '/api/locations',
  health: '/health',
} as const;

/**
 * RFC 7807 Problem Details response shape.
 * @see https://datatracker.ietf.org/doc/html/rfc7807
 */
export interface ProblemDetails {
  type: string;
  title: string;
  status: number;
  detail?: string;
  instance?: string;
}

export class ApiError extends Error {
  public problem: ProblemDetails;

  constructor(problem: ProblemDetails) {
    super(problem.detail ?? problem.title);
    this.name = 'ApiError';
    this.problem = problem;
  }

  get status(): number {
    return this.problem.status;
  }

  get title(): string {
    return this.problem.title;
  }

  get detail(): string | undefined {
    return this.problem.detail;
  }

  get type(): string {
    return this.problem.type;
  }
}

function isProblemDetails(value: unknown): value is ProblemDetails {
  return (
    typeof value === 'object' &&
    value !== null &&
    typeof (value as ProblemDetails).type === 'string' &&
    typeof (value as ProblemDetails).title === 'string' &&
    typeof (value as ProblemDetails).status === 'number'
  );
}

async function fetchApi<T>(url: string): Promise<T> {
  const response = await fetch(url);

  if (!response.ok) {
    const contentType = response.headers.get('content-type') ?? '';

    if (contentType.includes('application/problem+json') || contentType.includes('application/json')) {
      try {
        const body: unknown = await response.json();
        if (isProblemDetails(body)) {
          throw new ApiError(body);
        }
      } catch (parseError: unknown) {
        if (parseError instanceof ApiError) throw parseError;
        console.warn('Failed to parse error response:', parseError);
      }
    }

    throw new ApiError({
      type: 'about:blank',
      title: response.statusText || 'Request Failed',
      status: response.status,
    });
  }

  const contentType = response.headers.get('content-type') ?? '';
  if (!contentType.includes('application/json')) {
    throw new ApiError({
      type: 'about:blank',
      title: 'Invalid Response',
      status: response.status,
      detail: 'Expected JSON response from server',
    });
  }

  return (await response.json()) as T;
}

export async function getLocations(bounds: MapBounds): Promise<ApiResponse> {
  const params = new URLSearchParams({
    lat: String(bounds.lat),
    lng: String(bounds.lng),
    radius: String(bounds.radius),
  });

  return fetchApi<ApiResponse>(
    `${API_URL}${ENDPOINTS.locations}?${params.toString()}`,
  );
}

export async function healthCheck(): Promise<{ status: string }> {
  const result = await fetchApi<{
    data: { status: string; timestamp: string };
    meta: unknown;
  }>(`${API_URL}${ENDPOINTS.health}`);

  return { status: result.data.status };
}

