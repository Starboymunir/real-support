export interface AdminPackage {
  id: string;
  name: string;
  summary: string;
  description: string;
  sortIndex: number;
  status: boolean;
  serviceFee: number;
  pricePerMilage: number;
  drivingProMin: number;
  waitingProMin: number;
  minBill: number;
  vat: number;
  coverImage?: string | null;
  createdAt?: string | Date;
  updatedAt?: string | Date;
}
