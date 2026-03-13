/* ═══════════════════════════════════════════
   Company API
   ═══════════════════════════════════════════ */

import { api } from '../api';
import type { Company } from '../types';

export const companyApi = {
  getById: (id: string) =>
    api.get<Company>(`/company/findById/${id}`),

  update: (id: string, data: Partial<Company>) =>
    api.patch<Company>(`/company/updateById/${id}`, data),

  inviteDriver: (driverIdOrEmail: string) =>
    api.post(`/company/inviteDriverToJoin/${encodeURIComponent(driverIdOrEmail)}`),
};
