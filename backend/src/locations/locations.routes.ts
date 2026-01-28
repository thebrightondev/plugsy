import { Hono } from 'hono';
import { LocationQuerySchema } from './locations.schema.js';
import { getLocations } from './locations.service.js';

const locations = new Hono();

// Returns chargers + weather
locations.get('/', async (c) => {
  const query = c.req.query();
  const { lat, lng, radius, maxResults } = LocationQuerySchema.parse(query);

  const result = await getLocations(lat, lng, radius, maxResults);

  return c.json(result);
});

export default locations;
