/* ═══════════════════════════════════════════
   Packages API (ride tiers)
   ═══════════════════════════════════════════ */

import { api } from '../api';
import type { Package } from '../types';

export const packagesApi = {
  getAll: (page = 1, count = 50) =>
    api.get<Package[]>(`/packages?page=${page}&count=${count}`),

  getById: (id: string) =>
    api.get<Package>(`/packages/${id}`),
};
