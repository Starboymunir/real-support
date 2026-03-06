const MAPBOX_TOKEN = process.env.NEXT_PUBLIC_MAPBOX_TOKEN || '';

export interface RouteInfo {
  distance: number; // meters
  duration: number; // seconds
  geometry: [number, number][]; // array of [lng, lat]
}

/**
 * Get driving route between two points using Mapbox Directions API
 */
export async function getRoute(
  origin: { lng: number; lat: number },
  destination: { lng: number; lat: number },
  waypoints?: { lng: number; lat: number }[]
): Promise<RouteInfo | null> {
  if (!MAPBOX_TOKEN) return null;

  const coords = [
    `${origin.lng},${origin.lat}`,
    ...(waypoints || []).map(w => `${w.lng},${w.lat}`),
    `${destination.lng},${destination.lat}`,
  ].join(';');

  try {
    const res = await fetch(
      `https://api.mapbox.com/directions/v5/mapbox/driving/${coords}?access_token=${MAPBOX_TOKEN}&geometries=geojson&overview=full`
    );
    const data = await res.json();

    if (data.routes && data.routes.length > 0) {
      const route = data.routes[0];
      return {
        distance: route.distance,
        duration: route.duration,
        geometry: route.geometry.coordinates,
      };
    }
  } catch {
    // silently fail
  }

  return null;
}

/**
 * Format distance for display
 */
export function formatDistance(meters: number): string {
  const miles = meters / 1609.34;
  return miles < 0.1 ? `${Math.round(meters)} m` : `${miles.toFixed(1)} mi`;
}

/**
 * Format duration for display
 */
export function formatDuration(seconds: number): string {
  const mins = Math.round(seconds / 60);
  if (mins < 60) return `${mins} min`;
  const hrs = Math.floor(mins / 60);
  const remainMins = mins % 60;
  return remainMins > 0 ? `${hrs}h ${remainMins}m` : `${hrs}h`;
}

/**
 * Estimate fare based on distance and vehicle type
 */
export function estimateFare(
  distanceMeters: number,
  vehicleType: string
): { min: number; max: number } {
  const miles = distanceMeters / 1609.34;

  // Base rates per vehicle type (£/mile)
  const rates: Record<string, { base: number; perMile: number; perMin: number }> = {
    economy: { base: 3.0, perMile: 1.6, perMin: 0.15 },
    comfort: { base: 4.5, perMile: 2.2, perMin: 0.20 },
    premium: { base: 7.0, perMile: 3.5, perMin: 0.30 },
    xl: { base: 5.5, perMile: 2.8, perMin: 0.25 },
  };

  const rate = rates[vehicleType] || rates.comfort;
  const baseFare = rate.base + miles * rate.perMile;

  return {
    min: Math.max(5, Math.round(baseFare * 0.9 * 100) / 100),
    max: Math.round(baseFare * 1.2 * 100) / 100,
  };
}
