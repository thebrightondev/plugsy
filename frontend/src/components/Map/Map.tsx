import { useEffect, useRef, useCallback, useState } from 'react';
import Map from '@arcgis/core/Map';
import MapView from '@arcgis/core/views/MapView';
import esriConfig from '@arcgis/core/config';
import GraphicsLayer from '@arcgis/core/layers/GraphicsLayer';
import Graphic from '@arcgis/core/Graphic';
import Point from '@arcgis/core/geometry/Point';
import PictureMarkerSymbol from '@arcgis/core/symbols/PictureMarkerSymbol';
import * as reactiveUtils from '@arcgis/core/core/reactiveUtils';
import type { Location, MapBounds } from '../../types';

const createSvgDataUrl = (svg: string): string =>
  `data:image/svg+xml;base64,${btoa(svg)}`;

const plugPinSvg = (iconColor: string): string => `
<svg xmlns="http://www.w3.org/2000/svg" width="24" height="30" viewBox="0 0 24 30" fill="none">
  <!-- White pin shape with subtle border -->
  <path d="M12 0C5.373 0 0 5.373 0 12c0 6.627 6 12 12 18 6-6 12-11.373 12-18C24 5.373 18.627 0 12 0z"
        fill="white" stroke="${MARKER_COLORS.PIN_BORDER}" stroke-width="1"/>
  <!-- Plug icon centered - moved down to y=5 -->
  <g transform="translate(5, 5)">
    <svg width="14" height="14" viewBox="0 0 24 24"
         fill="none" stroke="${iconColor}" stroke-width="2.5"
         stroke-linecap="round" stroke-linejoin="round">
      <path d="M12 22v-5"/>
      <path d="M9 8V2"/>
      <path d="M15 8V2"/>
      <path d="M18 8v5a4 4 0 0 1-4 4h-4a4 4 0 0 1-4-4V8Z"/>
    </svg>
  </g>
</svg>`;

esriConfig.apiKey = import.meta.env.VITE_ARCGIS_API_KEY;

interface MapComponentProps {
  locations: Location[];
  onBoundsChange: (bounds: MapBounds) => void;
  onLocationSelect: (location: Location | null) => void;
  selectedLocation: Location | null;
}

const MAP_CONFIG = {
  DEFAULT_CENTER: { lat: 50.8225, lng: -0.1372 },
  DEFAULT_ZOOM: 11,
  MIN_ZOOM: 5,
  MAX_ZOOM: 18,
  MIN_RADIUS_KM: 1,
  MAX_RADIUS_KM: 50,
  DEBOUNCE_MS: 500,
  BOUNDS_CHANGE_THRESHOLD: 0.001,
  RADIUS_CHANGE_THRESHOLD_KM: 1,
} as const;

const MARKER_COLORS = {
  SELECTED: '#2563eb',
  EV_AVAILABLE: '#22c55e',
  EV_UNAVAILABLE: '#ef4444',
  PIN_BORDER: '#d1d5db',
} as const;

const MARKER_SIZE = {
	PIN_DEFAULT: 22,
	PIN_SELECTED: 28,
	HEIGHT_RATIO: 1.25,
} as const;

const getMarkerColor = (location: Location, isSelected: boolean): string => {
	if (isSelected) return MARKER_COLORS.SELECTED;
	return location.available ? MARKER_COLORS.EV_AVAILABLE : MARKER_COLORS.EV_UNAVAILABLE;
};

export default function MapComponent({
  locations,
  onBoundsChange,
  onLocationSelect,
  selectedLocation,
}: MapComponentProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const viewRef = useRef<MapView | null>(null);
  const graphicsLayerRef = useRef<GraphicsLayer | null>(null);
  const [isMapReady, setIsMapReady] = useState(false);

  const calculateRadius = useCallback((view: MapView): number => {
    const extent = view.extent;
    if (!extent) return MAP_CONFIG.MIN_RADIUS_KM;

    const radiusMeters = Math.min(extent.width, extent.height) / 2;
    const radiusKm = radiusMeters / 1000;
    return Math.min(Math.max(radiusKm, MAP_CONFIG.MIN_RADIUS_KM), MAP_CONFIG.MAX_RADIUS_KM);
  }, []);

  useEffect(() => {
    if (!mapRef.current) return;

    const graphicsLayer = new GraphicsLayer();
    graphicsLayerRef.current = graphicsLayer;

    const map = new Map({
      basemap: 'gray-vector',
      layers: [graphicsLayer],
    });

    const view = new MapView({
      container: mapRef.current,
      map,
      center: [MAP_CONFIG.DEFAULT_CENTER.lng, MAP_CONFIG.DEFAULT_CENTER.lat],
      zoom: MAP_CONFIG.DEFAULT_ZOOM,
      constraints: {
        minZoom: MAP_CONFIG.MIN_ZOOM,
        maxZoom: MAP_CONFIG.MAX_ZOOM,
        snapToZoom: false,
      },
      popupEnabled: false,
    });

    viewRef.current = view;

    view.when(() => {
      setIsMapReady(true);

      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          (position) => {
            const { latitude, longitude } = position.coords;
            view.goTo({ center: [longitude, latitude], zoom: MAP_CONFIG.DEFAULT_ZOOM }, { duration: 1000 });
            onBoundsChange({
              lat: latitude,
              lng: longitude,
              radius: calculateRadius(view),
            });
          },
          () => {
            const center = view.center;
            if (center.latitude != null && center.longitude != null) {
              onBoundsChange({
                lat: center.latitude,
                lng: center.longitude,
                radius: calculateRadius(view),
              });
            }
          }
        );
      } else {
        const center = view.center;
        if (center.latitude != null && center.longitude != null) {
          onBoundsChange({
            lat: center.latitude,
            lng: center.longitude,
            radius: calculateRadius(view),
          });
        }
      }
    });

    let lastBounds: { lat: number; lng: number; radius: number } | null = null;

    const boundsChanged = (newBounds: { lat: number; lng: number; radius: number }) => {
      if (!lastBounds) return true;
      const latDiff = Math.abs(newBounds.lat - lastBounds.lat);
      const lngDiff = Math.abs(newBounds.lng - lastBounds.lng);
      const radiusDiff = Math.abs(newBounds.radius - lastBounds.radius);
      return (
        latDiff > MAP_CONFIG.BOUNDS_CHANGE_THRESHOLD ||
        lngDiff > MAP_CONFIG.BOUNDS_CHANGE_THRESHOLD ||
        radiusDiff > MAP_CONFIG.RADIUS_CHANGE_THRESHOLD_KM
      );
    };

    let debounceTimer: ReturnType<typeof setTimeout>;
    const stationaryWatcher = reactiveUtils.watch(
      () => view.stationary,
      (isStationary) => {
        clearTimeout(debounceTimer);
        if (isStationary) {
          debounceTimer = setTimeout(() => {
            const center = view.center;
            if (center.latitude != null && center.longitude != null) {
              const newBounds = {
                lat: center.latitude,
                lng: center.longitude,
                radius: calculateRadius(view),
              };
              if (boundsChanged(newBounds)) {
                lastBounds = newBounds;
                onBoundsChange(newBounds);
              }
            }
          }, MAP_CONFIG.DEBOUNCE_MS);
        }
      }
    );

    return () => {
      clearTimeout(debounceTimer);
      stationaryWatcher.remove();
      view.destroy();
    };
  }, [onBoundsChange, calculateRadius]);

  useEffect(() => {
    if (!graphicsLayerRef.current || !isMapReady) return;

    const layer = graphicsLayerRef.current;
    layer.removeAll();

    locations.forEach((location) => {
      const isSelected = selectedLocation?.id === location.id;
      const iconColor = getMarkerColor(location, isSelected);
      const pinSize = isSelected ? MARKER_SIZE.PIN_SELECTED : MARKER_SIZE.PIN_DEFAULT;

      const point = new Point({
        longitude: location.longitude,
        latitude: location.latitude,
      });

      const symbol = new PictureMarkerSymbol({
        url: createSvgDataUrl(plugPinSvg(iconColor)),
        width: pinSize,
        height: pinSize * MARKER_SIZE.HEIGHT_RATIO,
      });

      const graphic = new Graphic({
        geometry: point,
        symbol,
        attributes: location,
      });

      layer.add(graphic);
    });
  }, [locations, selectedLocation?.id, isMapReady]);

  useEffect(() => {
    if (!viewRef.current || !isMapReady) return;

    const view = viewRef.current;
    const handle = view.on('click', async (event) => {
      const response = await view.hitTest(event);
      const result = response.results.find(
        (r) => r.type === 'graphic' && r.graphic.layer === graphicsLayerRef.current
      );

      if (result && result.type === 'graphic') {
        const location = result.graphic.attributes as Location;
        onLocationSelect(location);
      } else {
        onLocationSelect(null);
      }
    });

    return () => handle.remove();
  }, [onLocationSelect, isMapReady]);

  return (
    <div
      ref={mapRef}
      className="map-container"
      role="application"
      aria-label="Map showing EV charging stations"
    />
  );
}
