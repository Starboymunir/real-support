/* ═══════════════════════════════════════════
   Driver API
   ═══════════════════════════════════════════ */

import { api } from '../api';
import type { Driver } from '../types';

export interface CreateDriverDto {
  driverRecognitionNumber?: string;
  nationalInsuranceNumber?: string;
  selfAssessmentTaxId?: string;
  dateOfBirth?: string;
  bio?: string;
  hobby?: string;
}

export const driverApi = {
  register: (dto: CreateDriverDto) =>
    api.post<Driver>('/drivers/register', dto),

  getAll: (page = 1, limit = 20, status?: string) => {
    let qs = `?page=${page}&limit=${limit}`;
    if (status) qs += `&status=${status}`;
    return api.get<Driver[]>(`/drivers${qs}`);
  },

  getOnline: (packageId?: string) => {
    const qs = packageId ? `?packageId=${packageId}` : '';
    return api.get<Driver[]>(`/drivers/online${qs}`);
  },

  getById: (id: string) =>
    api.get<Driver>(`/drivers/${id}`),

  updateCurrent: (data: Partial<Driver>) =>
    api.patch<Driver>('/drivers/update-driver', data),

  update: (id: string, data: Partial<Driver>) =>
    api.patch<Driver>(`/drivers/${id}`, data),

  assignPackages: (id: string, packageIDs: string[]) =>
    api.patch<Driver>(`/drivers/${id}/packages/add`, { packageIDs }),

  removePackages: (id: string, packageIDs: string[]) =>
    api.patch<Driver>(`/drivers/${id}/packages/remove`, { packageIDs }),

  getByCompanyId: (companyId: string, page = 1, limit = 20) =>
    api.get<Driver[]>(`/drivers/getDriverByCompanyId/${companyId}?page=${page}&limit=${limit}`),
};
