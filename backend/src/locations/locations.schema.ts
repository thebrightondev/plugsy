import { z } from 'zod';

// Query parameter constraints
export const QUERY_LIMITS = {
  LAT_MIN: -90,
  LAT_MAX: 90,
  LNG_MIN: -180,
  LNG_MAX: 180,
  RADIUS_MIN_KM: 1,
  RADIUS_MAX_KM: 100,
  RADIUS_DEFAULT_KM: 10,
  MAX_RESULTS_MIN: 1,
  MAX_RESULTS_MAX: 100,
  MAX_RESULTS_DEFAULT: 50,
} as const;

export const LocationSourceSchema = z.literal('transport');

export type LocationSource = z.infer<typeof LocationSourceSchema>;

export const LocationSchema = z.object({
  id: z.string(),
  name: z.string(),
  latitude: z.number(),
  longitude: z.number(),
  address: z.string(),
  operator: z.string().nullable(),
  connectionTypes: z.array(z.string()),
  powerKW: z.number().nullable(),
  available: z.boolean(),
  numberOfPoints: z.number(),
  source: LocationSourceSchema,
});

export type Location = z.infer<typeof LocationSchema>;

export const WeatherSchema = z.object({
  location: z.string(),
  temperature: z.number(),
  feelsLike: z.number(),
  humidity: z.number(),
  description: z.string(),
  icon: z.string(),
  windSpeed: z.number(),
  pressure: z.number(),
});

export type Weather = z.infer<typeof WeatherSchema>;

export const LocationQuerySchema = z.object({
  lat: z.coerce.number().min(QUERY_LIMITS.LAT_MIN).max(QUERY_LIMITS.LAT_MAX),
  lng: z.coerce.number().min(QUERY_LIMITS.LNG_MIN).max(QUERY_LIMITS.LNG_MAX),
  radius: z.coerce
    .number()
    .min(QUERY_LIMITS.RADIUS_MIN_KM)
    .max(QUERY_LIMITS.RADIUS_MAX_KM)
    .default(QUERY_LIMITS.RADIUS_DEFAULT_KM),
  maxResults: z.coerce
    .number()
    .min(QUERY_LIMITS.MAX_RESULTS_MIN)
    .max(QUERY_LIMITS.MAX_RESULTS_MAX)
    .default(QUERY_LIMITS.MAX_RESULTS_DEFAULT),
});

export type LocationQuery = z.infer<typeof LocationQuerySchema>;

export const LocationsApiResponseSchema = z.object({
  data: z.array(LocationSchema),
  meta: z.object({
    count: z.number(),
    radius: z.number(),
    center: z.object({
      lat: z.number(),
      lng: z.number(),
    }),
		sources: z
			.object({
				transport: z.number().nonnegative(),
			})
			.partial()
			.optional(),
  }),
  weather: WeatherSchema.nullable(),
});

export type LocationsApiResponse = z.infer<typeof LocationsApiResponseSchema>;
