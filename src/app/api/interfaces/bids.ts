interface Bidplace {
  id: string;
  createdAt: Date;
  updatedAt: Date;
  requestId: string;
  requestInfo: Request | null;
  bidAmount: number;
  driverId: string;
  driverInfo: Driver | null;
  passengerId: string;
  riderInfo: Passenger | null;
  status: BidStatus;
}
