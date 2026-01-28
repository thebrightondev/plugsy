import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { logger } from 'hono/logger';
import { errorHandler } from './middleware/error-handler.js';
import locations from './locations/locations.routes.js';

export const app = new Hono();

app.onError(errorHandler);

app.use('*', logger());
app.use(
  '*',
  cors({
    origin: [
      'http://localhost:5173',
      'http://localhost:5174',
      'http://127.0.0.1:5173',
      'http://127.0.0.1:5174',
    ],
    allowMethods: ['GET', 'OPTIONS'],
    allowHeaders: ['Content-Type'],
  }),
);

app.get('/health', (c) => {
  return c.json({
    data: {
      status: 'ok',
      timestamp: new Date().toISOString(),
    },
    meta: null,
  });
});

app.route('/api/locations', locations);

app.notFound((c) => {
  return c.json(
    {
      type: 'https://api.example.com/problems/not-found',
      title: 'Not Found',
      status: 404,
      detail: `The requested resource ${c.req.path} was not found`,
      instance: c.req.path,
    },
    {
      status: 404,
      headers: { 'Content-Type': 'application/problem+json' },
    },
  );
});

export default app;
