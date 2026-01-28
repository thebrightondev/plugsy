import type { LocationsApiResponse } from './locations.schema.js';
import { fetchChargingStations } from '../clients/open-charge-map.client.js';
import { fetchWeather } from '../clients/open-weather.client.js';

export async function getLocations(
	lat: number,
	lng: number,
	radius: number,
	maxResults: number,
): Promise<LocationsApiResponse> {
	const [transport, weather] = await Promise.all([
		fetchChargingStations(lat, lng, radius, maxResults),
		fetchWeather(lat, lng).catch(() => null),
	]);

	const data = transport;

	return {
		data,
		meta: {
			count: data.length,
			radius,
			center: { lat, lng },
			sources: {
				transport: transport.length,
			},
		},
		weather,
	};
}
