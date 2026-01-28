import type { Weather } from '../locations/locations.schema.js';
import { ApiError } from '../middleware/error-handler.js';

const OPEN_WEATHER_API = 'https://api.openweathermap.org/data/2.5/weather';

interface OpenWeatherResponse {
  name: string;
  main: {
    temp: number;
    feels_like: number;
    humidity: number;
    pressure: number;
  };
  weather: Array<{
    description: string;
    icon: string;
  }>;
  wind: {
    speed: number;
  };
  sys?: {
    country?: string;
  };
}

export async function fetchWeather(
  lat: number,
  lng: number,
): Promise<Weather | null> {
  const apiKey = process.env.OPENWEATHER_API_KEY;

  if (!apiKey) {
    return null;
  }

  const url = new URL(OPEN_WEATHER_API);
  url.searchParams.set('lat', String(lat));
  url.searchParams.set('lon', String(lng));
  url.searchParams.set('appid', apiKey);
  url.searchParams.set('units', 'metric');

  const response = await fetch(url.toString(), {
    headers: {
      Accept: 'application/json',
    },
  });

  if (!response.ok) {
    throw new ApiError(
      response.status >= 500 ? 502 : 400,
      'upstream-service-error',
      'Weather Service Error',
      `OpenWeatherMap API returned ${response.status} ${response.statusText}`,
    );
  }

  const data = (await response.json()) as OpenWeatherResponse;
  const weatherInfo = data.weather[0];

  return {
    location: data.sys?.country ? `${data.name}, ${data.sys.country}` : data.name,
    temperature: Math.round(data.main.temp),
    feelsLike: Math.round(data.main.feels_like),
    humidity: data.main.humidity,
    description: weatherInfo?.description ?? 'Unknown',
    icon: weatherInfo?.icon ?? '01d',
    windSpeed: Math.round(data.wind.speed * 3.6), // m/s to km/h
    pressure: data.main.pressure,
  };
}
