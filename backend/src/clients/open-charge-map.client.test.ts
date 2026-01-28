import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { fetchChargingStations } from './open-charge-map.client.js';

const mockFetch = vi.fn();
vi.stubGlobal('fetch', mockFetch);

describe('openChargeMap service', () => {
  const originalEnv = { ...process.env };

  beforeEach(() => {
    mockFetch.mockReset();
    process.env.OCM_API_KEY = 'test-key';
  });

  afterEach(() => {
    process.env = { ...originalEnv };
  });

  it('throws when OCM_API_KEY is not set', async () => {
    delete process.env.OCM_API_KEY;

    await expect(fetchChargingStations(50.8, -1.1)).rejects.toThrow(
      'OCM_API_KEY environment variable is not set'
    );
  });

  it('fetches and transforms charging stations from Open Charge Map', async () => {
    const mockApiResponse = [
      {
        ID: 123,
        AddressInfo: {
          Title: 'Test Station',
          AddressLine1: '123 Main St',
          Town: 'Portsmouth',
          StateOrProvince: 'Hampshire',
          Postcode: 'PO1 1AA',
          Latitude: 50.8,
          Longitude: -1.1,
        },
        OperatorInfo: { Title: 'Test Operator' },
        Connections: [
          {
            ConnectionType: { Title: 'Type 2' },
            PowerKW: 22,
            StatusType: { IsOperational: true },
          },
        ],
        NumberOfPoints: 2,
        StatusType: { IsOperational: true },
      },
    ];

    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve(mockApiResponse),
    });

    const result = await fetchChargingStations(50.8, -1.1, 10, 50);

    expect(mockFetch).toHaveBeenCalledTimes(1);
    expect(result).toHaveLength(1);
	    expect(result[0]).toEqual({
	      id: '123',
	      name: 'Test Station',
	      latitude: 50.8,
	      longitude: -1.1,
	      address: '123 Main St, Portsmouth, Hampshire, PO1 1AA',
	      operator: 'Test Operator',
	      connectionTypes: ['Type 2'],
	      powerKW: 22,
	      available: true,
	      numberOfPoints: 2,
	      source: 'transport',
	    });
  });

  it('throws on Open Charge Map API error', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: false,
      status: 500,
      statusText: 'Internal Server Error',
    });

    await expect(fetchChargingStations(50.8, -1.1)).rejects.toThrow(
      'Open Charge Map API returned 500 Internal Server Error'
    );
  });
});

