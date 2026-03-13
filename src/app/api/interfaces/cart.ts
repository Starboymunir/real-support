interface Request {
  id: string;
  createdAt: Date;
  updatedAt: Date;
  startFrom: Address;
  startFromId: string;
  destinationId: string;
  stoppages: Address[];
  bookingDate?: Date | null;
  bookingTime?: string | null;
  totalDistance: number;
  totalBill?: number | null;
  budget?: number | null;
  status: RideRequestStatus;
  packageInfo: Package;
  packageId: string;
  riderInfo?: Passenger | null;
  passengerId?: string | null;
  booking?: Booking | null;
  Bidplace: Bidplace[];
}
