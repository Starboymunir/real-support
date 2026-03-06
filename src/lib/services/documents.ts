/* ═══════════════════════════════════════════
   Documents API (S3 upload, driver/car docs)
   ═══════════════════════════════════════════ */

import { api } from '../api';
import type { Document } from '../types';

export const documentsApi = {
  /** Generic file upload → returns S3 URL */
  uploadFile: (file: File, metadata?: Record<string, string>) => {
    const fd = new FormData();
    fd.append('file', file);
    if (metadata) {
      Object.entries(metadata).forEach(([k, v]) => fd.append(k, v));
    }
    return api.upload<{ fileUrl: string }>('/documents/upload_file', fd);
  },

  // ── Driver document uploads ──

  uploadBankDocuments: (data: Record<string, unknown>) =>
    api.post('/documents/bank-account', data),

  uploadWorkPermitCode: (data: { driverId: string; workPermitCode: string }) =>
    api.post('/documents/work-permit-code', data),

  uploadDrivingLicense: (data: Record<string, unknown>) =>
    api.post('/documents/driving-license', data),

  uploadPassport: (data: Record<string, unknown>) =>
    api.post('/documents/passport', data),

  uploadAddress: (data: Record<string, unknown>) =>
    api.post('/documents/address', data),

  uploadPCO: (data: Record<string, unknown>) =>
    api.post('/documents/pco', data),

  // ── Car document uploads ──

  uploadInsurance: (data: Record<string, unknown>) =>
    api.post('/documents/driver/car/insurance', data),

  uploadMot: (data: Record<string, unknown>) =>
    api.post('/documents/driver/car/mot', data),

  uploadCarPCO: (data: Record<string, unknown>) =>
    api.post('/documents/driver/car/car_pco_document', data),

  uploadCarLogBook: (data: Record<string, unknown>) =>
    api.post('/documents/driver/car/vehicleLogBook', data),

  // ── Fetch ──

  getDriverDocuments: (driverId: string) =>
    api.get<Document>(`/documents/driver/${driverId}`),

  getCarDocuments: (carId: string) =>
    api.get<Document>(`/documents/car/${carId}`),
};
