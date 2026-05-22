// Dev-only location spoofing.
//
// The app is UK-based but we are testing from Nigeria. When this is on AND the
// signed-in user is in the allowlist, every call that would normally read the
// browser's real GPS uses these coordinates instead, so our test rider/driver
// appear in London. The client's own accounts are untouched.
//
// HOW TO TURN OFF: set SPOOF_LOCATION to false, or empty the two allowlists.
// Both the rider booking page and the driver availability card honour this.

export const SPOOF_LOCATION = true;

// London (Trafalgar Square area).
export const SPOOF_COORDS = { lat: 51.5074, lng: -0.1276 };

// Spoof only when the signed-in user's first name OR email matches one of
// these (case-insensitive). Add the client's emails here ONLY if you want
// their accounts spoofed too — leave empty to keep their accounts real.
const SPOOF_USER_NAMES = ['phase2'];
const SPOOF_USER_EMAILS: string[] = [];

type UserLike =
  | {
      firstName?: string | null;
      emailAddress?: string | null;
      email?: string | null;
    }
  | null
  | undefined;

export function maybeSpoofedCoords(user: UserLike): { lat: number; lng: number } | null {
  if (!SPOOF_LOCATION || !user) return null;
  const name = (user.firstName || '').trim().toLowerCase();
  const email = (user.emailAddress || user.email || '').trim().toLowerCase();
  if (name && SPOOF_USER_NAMES.includes(name)) return SPOOF_COORDS;
  if (email && SPOOF_USER_EMAILS.includes(email)) return SPOOF_COORDS;
  return null;
}
