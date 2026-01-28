import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { createElement } from 'react';
import { useLocations } from './useLocations';
import * as api from '../services/api';

vi.mock('../services/api');

const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      },
    },
  });
  return ({ children }: { children: React.ReactNode }) =>
    createElement(QueryClientProvider, { client: queryClient }, children);
};

describe('useLocations', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should not fetch when bounds is null', () => {
    const { result } = renderHook(() => useLocations(null), {
      wrapper: createWrapper(),
    });

    expect(result.current.data).toBeUndefined();
    expect(api.getLocations).not.toHaveBeenCalled();
  });

  it('should fetch locations when bounds are provided', async () => {
    const mockResponse = {
      data: [
        {
          id: '1',
          name: 'Test Station',
          latitude: 50.8,
          longitude: -1.1,
          source: 'transport' as const,
          address: 'Test Address',
          operator: 'Test Op',
          connectionTypes: ['Type 2'],
          powerKW: 22,
          available: true,
          numberOfPoints: 2,
        },
      ],
      meta: {
        count: 1,
        radius: 10,
        center: { lat: 50.8, lng: -1.1 },
      },
      weather: null,
    };

    vi.mocked(api.getLocations).mockResolvedValueOnce(mockResponse);

    const bounds = { lat: 50.8, lng: -1.1, radius: 10 };
    const { result } = renderHook(() => useLocations(bounds), {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(result.current.data).toEqual(mockResponse);
    expect(api.getLocations).toHaveBeenCalledWith(bounds);
  });

  it('should handle API errors', async () => {
    vi.mocked(api.getLocations).mockRejectedValueOnce(new Error('API Error'));

    const bounds = { lat: 50.8, lng: -1.1, radius: 10 };
    const { result } = renderHook(() => useLocations(bounds), {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(result.current.isError).toBe(true);
    });

    expect(result.current.error).toBeInstanceOf(Error);
  });
});

