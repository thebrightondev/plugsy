import { useState } from 'react';
import type { Weather } from '../../types';

interface WeatherPanelProps {
  weather: Weather;
}

const getWeatherIconUrl = (icon: string): string => {
  return `https://openweathermap.org/img/wn/${icon}@2x.png`;
};

export default function WeatherPanel({ weather }: WeatherPanelProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <div
      className="absolute left-4 top-4 z-10 cursor-pointer rounded-xl bg-white/90 shadow-lg backdrop-blur-sm transition-all duration-200"
      onClick={() => setIsExpanded(!isExpanded)}
      role="button"
      aria-expanded={isExpanded}
      aria-label="Toggle weather details"
    >
      {/* Header: temp + icon + chevron */}
      <div className="flex items-center justify-between gap-1 px-3 py-2">
        <div className="flex items-center gap-1">
          <img
            src={getWeatherIconUrl(weather.icon)}
            alt={weather.description}
            className="h-6 w-6"
          />
          <div className="text-xl font-medium text-gray-800">{weather.temperature}°</div>
        </div>
        <svg
          className={`h-4 w-4 text-gray-500 transition-transform ${isExpanded ? 'rotate-180' : ''}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </div>

      {/* Expanded details */}
      {isExpanded && (
        <div className="border-t border-gray-200 px-4 pb-4 pt-3">
          <div className="mb-2 text-sm font-medium text-gray-700">{weather.location}</div>
          <div className="mb-3 text-sm capitalize text-gray-600">{weather.description}</div>

          <div className="grid grid-cols-2 gap-3 text-sm">
            <div>
              <div className="text-gray-500">Feels like</div>
              <div className="font-medium text-gray-800">{weather.feelsLike}°</div>
            </div>
            <div>
              <div className="text-gray-500">Humidity</div>
              <div className="font-medium text-gray-800">{weather.humidity}%</div>
            </div>
            <div>
              <div className="text-gray-500">Wind</div>
              <div className="font-medium text-gray-800">{weather.windSpeed} km/h</div>
            </div>
            <div>
              <div className="text-gray-500">Pressure</div>
              <div className="font-medium text-gray-800">{weather.pressure} hPa</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

