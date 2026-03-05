/* ═══════════════════════════════════════════
   Airports API
   ═══════════════════════════════════════════ */

import { api } from '../api';
import type { Airport } from '../types';

export const airportsApi = {
  getAll: () =>
    api.get<Airport[]>('/airports'),

  getById: (id: string) =>
    api.get<Airport>(`/airports/${id}`),
};
