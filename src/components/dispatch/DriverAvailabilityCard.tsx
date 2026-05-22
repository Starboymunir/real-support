'use client';

/* ═══════════════════════════════════════════════════════════
   Driver Availability Card — the driver's "Go Online" control.

   The dispatch engine only offers rides to drivers who are
   `isOnline` AND have a recent GPS location. This card lets a
   driver toggle online/offline and, while online, streams their
   location to the backend so they can be matched to nearby riders.
   ═══════════════════════════════════════════════════════════ */

import { useState, useEffect, useRef, useCallback } from 'react';
import { Loader2, Power, MapPin, AlertTriangle } from 'lucide-react';
import { useAuth } from '@/lib/auth-context';
import { driverApi } from '@/lib/services/driver';
import { othersApi } from '@/lib/services/others';
import { toast } from '@/lib/toast';
import type { Driver } from '@/lib/types';
import { maybeSpoofedCoords } from '@/lib/dev-location';

/** Don't hammer the backend — at most one location push per this interval. */
const LOCATION_MIN_INTERVAL_MS = 12_000;

export default function DriverAvailabilityCard() {
  const { user } = useAuth();
  const driverId =
    user?.driver?.id ||
    (typeof window !== 'undefined' ? localStorage.getItem('rs_driver_id') : '') ||
    '';
  const userId = user?.id || '';

  const [driver, setDriver] = useState<Driver | null>(null);
  const [online, setOnline] = useState(false);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [geoError, setGeoError] = useState<string | null>(null);
  const [located, setLocated] = useState(false);

  const watchIdRef = useRef<number | null>(null);
  const lastSentRef = useRef(0);

  // ── location streaming ──
  const pushLocation = useCallback(
    (pos: GeolocationPosition, force = false) => {
      if (!userId) return;
      const now = Date.now();
      if (!force && now - lastSentRef.current < LOCATION_MIN_INTERVAL_MS) return;
      lastSentRef.current = now;
      const spoof = maybeSpoofedCoords();
      othersApi
        .updateLocation(userId, {
          latitude: spoof ? spoof.lat : pos.coords.latitude,
          longitude: spoof ? spoof.lng : pos.coords.longitude,
          accuracy: pos.coords.accuracy ?? 0,
          timestamp: pos.timestamp ?? now,
        })
        .then(() => setLocated(true))
        .catch(() => {});
    },
    [userId],
  );

  const stopWatch = useCallback(() => {
    if (watchIdRef.current !== null && typeof navigator !== 'undefined') {
      navigator.geolocation.clearWatch(watchIdRef.current);
      watchIdRef.current = null;
    }
  }, []);

  const startWatch = useCallback(() => {
    if (typeof navigator === 'undefined' || !navigator.geolocation) return;
    stopWatch();
    watchIdRef.current = navigator.geolocation.watchPosition(
      (pos) => {
        setGeoError(null);
        pushLocation(pos);
      },
      (err) => {
        setGeoError(
          err.code === err.PERMISSION_DENIED
            ? 'Location permission is off — turn it on so riders can be matched to you.'
            : 'Could not read your location.',
        );
      },
      { enableHighAccuracy: true, maximumAge: 10_000, timeout: 20_000 },
    );
  }, [pushLocation, stopWatch]);

  // ── load current driver state; resume streaming if already online ──
  useEffect(() => {
    if (!driverId) {
      setLoading(false);
      return;
    }
    driverApi
      .getById(driverId)
      .then((d) => {
        setDriver(d);
        setOnline(!!d?.isOnline);
        if (d?.isOnline) startWatch();
      })
      .catch(() => {})
      .finally(() => setLoading(false));
    return () => stopWatch();
  }, [driverId, startWatch, stopWatch]);

  const getFix = () =>
    new Promise<GeolocationPosition>((resolve, reject) => {
      navigator.geolocation.getCurrentPosition(resolve, reject, {
        enableHighAccuracy: true,
        timeout: 15_000,
      });
    });

  const toggle = async () => {
    if (busy || !driverId) return;
    const next = !online;
    setBusy(true);
    try {
      if (next) {
        if (typeof navigator === 'undefined' || !navigator.geolocation) {
          toast.error('Location unavailable', 'This device cannot share its location.');
          return;
        }
        // A driver must have a location fix to be dispatchable — require it up front.
        let pos: GeolocationPosition;
        try {
          pos = await getFix();
        } catch {
          setGeoError('Location permission is required to go online.');
          toast.error('Location needed', 'Allow location access to start receiving ride offers.');
          return;
        }
        await driverApi.update(driverId, { isOnline: true });
        setOnline(true);
        setGeoError(null);
        pushLocation(pos, true);
        startWatch();
        toast.success("You're online", 'You can now receive ride offers nearby.');
      } else {
        await driverApi.update(driverId, { isOnline: false });
        setOnline(false);
        setLocated(false);
        stopWatch();
        toast.info("You're offline", "You won't receive new ride offers.");
      }
    } catch (err) {
      toast.error(
        'Could not update status',
        err instanceof Error ? err.message : 'Please try again.',
      );
    } finally {
      setBusy(false);
    }
  };

  if (!driverId) return null;

  const blocked = !!driver && driver.status !== 'ACTIVE';

  if (loading) {
    return (
      <div className="bg-white/[0.02] rounded-2xl border border-white/[0.06] p-6 flex items-center justify-center">
        <Loader2 size={20} className="animate-spin text-secondary" />
      </div>
    );
  }

  return (
    <div
      className={`rounded-2xl border p-6 transition-colors ${
        online
          ? 'border-emerald-500/30 bg-emerald-500/[0.06]'
          : 'border-white/[0.06] bg-white/[0.02]'
      }`}
    >
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-3 min-w-0">
          <div
            className={`relative flex h-11 w-11 shrink-0 items-center justify-center rounded-full ${
              online ? 'bg-emerald-500/20' : 'bg-white/[0.06]'
            }`}
          >
            <Power size={20} className={online ? 'text-emerald-400' : 'text-white/50'} />
            {online && (
              <span className="absolute -right-0.5 -top-0.5 flex h-3 w-3">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex h-3 w-3 rounded-full bg-emerald-400" />
              </span>
            )}
          </div>
          <div className="min-w-0">
            <p className="font-semibold text-white">
              {online ? "You're online" : "You're offline"}
            </p>
            <p className="text-sm text-white/50 truncate">
              {online
                ? 'Receiving ride offers from nearby riders'
                : 'Go online to receive ride offers'}
            </p>
          </div>
        </div>

        {/* Toggle switch */}
        <button
          type="button"
          role="switch"
          aria-checked={online}
          aria-label={online ? 'Go offline' : 'Go online'}
          onClick={toggle}
          disabled={busy || blocked}
          className={`relative h-8 w-14 shrink-0 rounded-full transition-colors disabled:opacity-50 ${
            online ? 'bg-emerald-500' : 'bg-white/15'
          }`}
        >
          <span
            className={`absolute top-1 flex h-6 w-6 items-center justify-center rounded-full bg-white transition-all ${
              online ? 'left-7' : 'left-1'
            }`}
          >
            {busy && <Loader2 size={13} className="animate-spin text-slate-600" />}
          </span>
        </button>
      </div>

      {/* Account not yet approved */}
      {blocked && (
        <div className="mt-4 flex items-start gap-2 rounded-xl bg-amber-500/10 p-3 text-sm text-amber-300">
          <AlertTriangle size={16} className="mt-0.5 shrink-0" />
          <span>
            Your driver account is{' '}
            <span className="font-semibold lowercase">{driver?.status}</span> — you can go
            online once it&apos;s approved.
          </span>
        </div>
      )}

      {/* Location status */}
      {!blocked && online && (
        <div className="mt-4 flex items-center gap-2 text-sm">
          {geoError ? (
            <span className="flex items-start gap-2 text-amber-300">
              <AlertTriangle size={15} className="mt-0.5 shrink-0" />
              {geoError}
            </span>
          ) : (
            <span className="flex items-center gap-2 text-emerald-400">
              <MapPin size={15} />
              {located ? 'Sharing your live location' : 'Getting your location…'}
            </span>
          )}
        </div>
      )}
    </div>
  );
}
