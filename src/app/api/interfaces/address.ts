interface Address {
  id: string;
  createdAt: Date;
  updatedAt: Date;
  name?: string | null;
  houseNumber?: string | null;
  postCode?: string | null;
  city: string;
  notes?: string | null;
  latitude: string;
  longitude: string;
  userId: string;
  userInfo: User;
  startAddress?: Request | null;
  destinationAddress?: Request | null;
  stoppages?: Request | null;
  requestId?: string | null;
}