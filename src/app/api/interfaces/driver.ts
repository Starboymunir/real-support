interface Driver {
  id: string;
  createdAt: Date;
  updatedAt: Date;
  driverRecognitionNumber?: string | null;
  nationalInsuranceNumber?: string | null;
  selfAssessmentTaxId: string;
  dateOfBirth?: Date | null;
  profileImage?: string | null;
  ratings: number;
  totalJobComplete: number;
  bio?: string | null;
  hobby?: string | null;
  userInfo?: User | null;
  driverUserId?: string | null;
  depositPaid: boolean;
  depositAmount: number;
  commission: number;
  currentBalance: number;
  subscription: Subscription;
  status: DriverStatus;
  isDeleted: boolean;
  totalJobs: Booking[];
  document?: Document | null;
  car?: Car | null;
  Bidplace?: Bidplace[];
}