'use client';

import { useRef, useEffect, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';

const MAPBOX_TOKEN = process.env.NEXT_PUBLIC_MAPBOX_TOKEN || '';

interface MapViewProps {
  center?: [number, number]; // [lng, lat]
  zoom?: number;
  markers?: { lng: number; lat: number; color?: string; label?: string }[];
  driverCars?: { id: string; lng: number; lat: number; label?: string }[];
  route?: [number, number][]; // array of [lng, lat]
  onMapClick?: (lng: number, lat: number) => void;
  className?: string;
  interactive?: boolean;
}

export default function MapView({
  center = [-0.1276, 51.5074], // London
  zoom = 12,
  markers = [],
  driverCars = [],
  route,
  onMapClick,
  className = 'w-full h-[400px]',
  interactive = true,
}: MapViewProps) {
  const mapContainer = useRef<HTMLDivElement>(null);
  const mapRef = useRef<mapboxgl.Map | null>(null);
  const markersRef = useRef<mapboxgl.Marker[]>([]);
  const carsRef = useRef<Map<string, mapboxgl.Marker>>(new Map());
  const [loaded, setLoaded] = useState(false);

  // Initialize map
  useEffect(() => {
    if (!mapContainer.current || !MAPBOX_TOKEN) return;

    mapboxgl.accessToken = MAPBOX_TOKEN;

    const map = new mapboxgl.Map({
      container: mapContainer.current,
      style: 'mapbox://styles/mapbox/dark-v11',
      center,
      zoom,
      interactive,
      attributionControl: false,
    });

    map.addControl(new mapboxgl.NavigationControl({ showCompass: false }), 'top-right');

    map.on('load', () => setLoaded(true));

    if (onMapClick) {
      map.on('click', (e) => {
        onMapClick(e.lngLat.lng, e.lngLat.lat);
      });
    }

    mapRef.current = map;

    return () => {
      map.remove();
      mapRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Update center
  useEffect(() => {
    if (mapRef.current && center) {
      mapRef.current.flyTo({ center, duration: 1000 });
    }
  }, [center]);

  // Update markers
  useEffect(() => {
    if (!mapRef.current) return;

    // Remove existing markers
    markersRef.current.forEach((m) => m.remove());
    markersRef.current = [];

    markers.forEach((m) => {
      const el = document.createElement('div');
      el.className = 'map-marker';
      el.style.width = '24px';
      el.style.height = '24px';
      el.style.borderRadius = '50%';
      el.style.backgroundColor = m.color || '#00E676';
      el.style.border = '3px solid white';
      el.style.boxShadow = '0 2px 10px rgba(0,0,0,0.4)';

      const marker = new mapboxgl.Marker({ element: el })
        .setLngLat([m.lng, m.lat])
        .addTo(mapRef.current!);

      if (m.label) {
        marker.setPopup(new mapboxgl.Popup({ offset: 25 }).setText(m.label));
      }

      markersRef.current.push(marker);
    });
  }, [markers]);

  // Render / update driver car markers. Unlike the pickup/dropoff markers we
  // diff by id so existing cars just move smoothly instead of flickering.
  useEffect(() => {
    if (!mapRef.current) return;
    const map = mapRef.current;
    const seen = new Set<string>();

    driverCars.forEach((d) => {
      seen.add(d.id);
      const existing = carsRef.current.get(d.id);
      if (existing) {
        existing.setLngLat([d.lng, d.lat]);
        return;
      }
      const el = document.createElement('div');
      el.className = 'driver-car-marker';
      // Smaller pill so the map doesn't get crowded. Mapbox HTML markers
      // keep a constant pixel size across zoom levels by default, so cars
      // look the same whether the user is zoomed in or out.
      el.style.width = '22px';
      el.style.height = '22px';
      el.style.display = 'flex';
      el.style.alignItems = 'center';
      el.style.justifyContent = 'center';
      el.style.borderRadius = '50%';
      el.style.background = 'rgba(0, 0, 0, 0.78)';
      el.style.border = '1.5px solid #00E676';
      el.style.boxShadow = '0 1px 4px rgba(0, 230, 118, 0.4)';
      el.innerHTML =
        '<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#00E676" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 16H9m10 0h3v-3.15a1 1 0 0 0-.84-.99L16 11l-2.7-3.6a1 1 0 0 0-.8-.4H5.24a2 2 0 0 0-1.8 1.1l-.8 1.63A6 6 0 0 0 2 12.42V16h2"/><circle cx="6.5" cy="16.5" r="2.5"/><circle cx="16.5" cy="16.5" r="2.5"/></svg>';

      const marker = new mapboxgl.Marker({ element: el })
        .setLngLat([d.lng, d.lat])
        .addTo(map);
      if (d.label) {
        marker.setPopup(new mapboxgl.Popup({ offset: 25 }).setText(d.label));
      }
      carsRef.current.set(d.id, marker);
    });

    // Remove cars that are no longer in the list.
    Array.from(carsRef.current.entries()).forEach(([id, marker]) => {
      if (!seen.has(id)) {
        marker.remove();
        carsRef.current.delete(id);
      }
    });
  }, [driverCars]);

  // Draw route
  useEffect(() => {
    if (!mapRef.current || !loaded) return;
    const map = mapRef.current;

    // Remove existing route layer
    if (map.getSource('route')) {
      map.removeLayer('route-line');
      map.removeSource('route');
    }

    if (route && route.length >= 2) {
      map.addSource('route', {
        type: 'geojson',
        data: {
          type: 'Feature',
          properties: {},
          geometry: {
            type: 'LineString',
            coordinates: route,
          },
        },
      });

      map.addLayer({
        id: 'route-line',
        type: 'line',
        source: 'route',
        layout: { 'line-join': 'round', 'line-cap': 'round' },
        paint: {
          'line-color': '#00E676',
          'line-width': 4,
          'line-opacity': 0.8,
        },
      });

      // Fit bounds to route
      const bounds = new mapboxgl.LngLatBounds();
      route.forEach((coord) => bounds.extend(coord as [number, number]));
      map.fitBounds(bounds, { padding: 60, duration: 1000 });
    }
  }, [route, loaded]);

  if (!MAPBOX_TOKEN) {
    return (
      <div className={`${className} rounded-2xl bg-white/[0.02] border border-white/[0.06] flex items-center justify-center`}>
        <div className="text-center p-6">
          <div className="w-16 h-16 rounded-full bg-white/[0.06] flex items-center justify-center mx-auto mb-3">
            <svg className="w-8 h-8 text-white/30" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          </div>
          <p className="text-white/40 text-sm">Map requires a Mapbox API token</p>
          <p className="text-white/20 text-xs mt-1">Set NEXT_PUBLIC_MAPBOX_TOKEN in .env.local</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`${className} rounded-2xl overflow-hidden border border-white/[0.06]`}>
      <div ref={mapContainer} className="w-full h-full" />
    </div>
  );
}
