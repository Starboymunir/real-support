interface Passenger {
    id: string;
    createdAt: Date;
    updatedAt: Date;
    profileImage?: string | null;
    ratings: number;
    totalBookings: number;
    userId: string;
    status: PassengerStatus;
    isDeleted: boolean;
    userInfo: User;
    bookings: Booking[];
    Request: Request[];
    Bidplace: Bidplace[];
  }
  