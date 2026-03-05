/* ═══════════════════════════════════════════
   Driver Cars API
   ═══════════════════════════════════════════ */

import { api } from '../api';
import type { Car } from '../types';

export interface CreateCarDto {
  color: string;
  engine: string;
  make: string;
  model: string;
  year: string;
  numberPlate: string;
  driverId: string;
}

export const driverCarsApi = {
  create: (dto: CreateCarDto) =>
    api.post<Car>('/driver-cars', dto),

  getAll: () =>
    api.get<Car[]>('/driver-cars'),

  getById: (id: string) =>
    api.get<Car>(`/driver-cars/${id}`),

  update: (id: string, data: Partial<Car>) =>
    api.patch<Car>(`/driver-cars/${id}`, data),

  remove: (id: string) =>
    api.del(`/driver-cars/${id}`),
};
