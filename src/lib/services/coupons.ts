/* ═══════════════════════════════════════════
   Discount Coupons API
   ═══════════════════════════════════════════ */

import { api } from '../api';
import type { DiscountCoupon } from '../types';

export const couponsApi = {
  apply: (coupon: string) =>
    api.post<DiscountCoupon>('/coupons/apply', { coupon }),
};
