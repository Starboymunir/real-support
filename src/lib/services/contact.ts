/* ═══════════════════════════════════════════
   Contact Us API
   ═══════════════════════════════════════════ */

import { api } from '../api';
import type { ContactUs } from '../types';

export interface CreateContactUsDto {
  name: string;
  email: string;
  phone_number: string;
  reason: string;
}

export const contactApi = {
  create: (dto: CreateContactUsDto) =>
    api.post<ContactUs>('/contact-us', dto),

  getUserContactUs: () =>
    api.get<ContactUs[]>('/contact-us/user'),

  getById: (id: string) =>
    api.get<ContactUs>(`/contact-us/${id}`),

  update: (id: string, data: Partial<ContactUs>) =>
    api.patch<ContactUs>(`/contact-us/${id}`, data),
};
