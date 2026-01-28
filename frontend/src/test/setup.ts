import '@testing-library/jest-dom';
import { vi } from 'vitest';

// Mock ArcGIS modules
vi.mock('@arcgis/core/config', () => ({
  default: { apiKey: '' },
}));

vi.mock('@arcgis/core/Map', () => ({
  default: vi.fn().mockImplementation(() => ({})),
}));

vi.mock('@arcgis/core/views/MapView', () => ({
  default: vi.fn().mockImplementation(() => ({
    when: vi.fn((cb) => cb()),
    watch: vi.fn(),
    on: vi.fn(() => ({ remove: vi.fn() })),
    destroy: vi.fn(),
    center: { latitude: 50.8, longitude: -1.1 },
    extent: { width: 10000, height: 10000 },
  })),
}));

vi.mock('@arcgis/core/layers/GraphicsLayer', () => ({
  default: vi.fn().mockImplementation(() => ({
    removeAll: vi.fn(),
    add: vi.fn(),
  })),
}));

vi.mock('@arcgis/core/Graphic', () => ({
  default: vi.fn(),
}));

vi.mock('@arcgis/core/geometry/Point', () => ({
  default: vi.fn(),
}));

vi.mock('@arcgis/core/symbols/SimpleMarkerSymbol', () => ({
  default: vi.fn(),
}));

// Mock ResizeObserver
global.ResizeObserver = vi.fn().mockImplementation(() => ({
  observe: vi.fn(),
  unobserve: vi.fn(),
  disconnect: vi.fn(),
}));

