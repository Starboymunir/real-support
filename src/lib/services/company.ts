/* ═══════════════════════════════════════════
   Company API
   ═══════════════════════════════════════════ */

import { api } from '../api';
import type { Company } from '../types';

export const companyApi = {
  getById: (id: string) =>
    api.get<Company>(`/company/findById/${id}`),

  getByCognitoId: (cognitoId: string) =>
    api.get<Company>(`/company/info/${cognitoId}`),

  update: (id: string, data: Partial<Company>) =>
    api.patch<Company>(`/company/updateById/${id}`, data),

  inviteDriver: (driverId: string) =>
    api.post(`/company/inviteDriverToJoin/${driverId}`),
};
