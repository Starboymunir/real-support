// Dev-only location spoofing.
//
// The app is UK-based but we are testing from Nigeria. When this flag is on,
// every call that would normally read the browser's real GPS uses these
// coordinates instead, so riders and drivers appear in London regardless of
// where the device actually is.
//
// HOW TO TURN OFF: set SPOOF_LOCATION to false (or change SPOOF_COORDS).
// Both the rider booking page and the driver availability card honour this.

export const SPOOF_LOCATION = true;

// London (Trafalgar Square area).
export const SPOOF_COORDS = { lat: 51.5074, lng: -0.1276 };

export function maybeSpoofedCoords(): { lat: number; lng: number } | null {
  return SPOOF_LOCATION ? SPOOF_COORDS : null;
}
