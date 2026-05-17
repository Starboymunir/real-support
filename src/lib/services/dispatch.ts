/* ═══════════════════════════════════════════
   Dispatch API — Uber/Bolt-style ride dispatch
   ═══════════════════════════════════════════ */

import { api } from '../api';
import type { RideRequest } from '../types';

export const dispatchApi = {
  /** Manually trigger dispatch for a request (auto-triggered on create when FIXED w/o budget). */
  start: (requestId: string) =>
    api.post<{ ok: true }>(`/dispatch/start/${requestId}`, {}),

  /** Driver accepts or rejects an active offer. */
  respond: (requestId: string, accept: boolean) =>
    api.post<{ ok: true }>(`/dispatch/respond/${requestId}`, { accept }),

  /** Public job board — list of requests open for bidding. */
  board: (driverId?: string) =>
    api.get<RideRequest[]>(`/dispatch/board${driverId ? `?driverId=${driverId}` : ''}`),
};
