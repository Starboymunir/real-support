interface User {
  id: string;
  createdAt?: Date | undefined;
  updatedAt?: Date | undefined;
  firstName: string;
  lastName: string;
  emailAddress: string;
  phone_number?: string | null;
  lastLogin?: Date | null;
  role: string;
  cognitoId: string;
  isEmailConfirm?: Date | null;
  driver?: Driver | null;
}

interface Driver {
  id: string;
  createdAt: Date;
  updatedAt: Date;
  cognitoId: string;
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
  isDeleted: boolean;
  document?: Document | null;
  car?: Car | null;
}

interface Document {
  id: string;
  createdAt: Date;
  updatedAt: Date;
  drivingLicense?: drivingLicense | null;
  bankDocuments?: BankDocument | null;
  pcoDocuments?: PCODocument | null;
  passport?: Passport | null;
  workPermitCode?: string | null;
  addressProfDocs?: AddressProfDocument | null;
  driverInfo?: Driver | null;
  driverId: string;
}

interface BankDocument {
  sortCode?: string;
  accountNumber?: string;
  bankName?: string;
  accProfDoc?: string;
  details: DocumentVerification;
}

interface Car {
  id: string;
  createdAt: Date;
  updatedAt: Date;
  color: string;
  carImage?: string | null;
  engine: string;
  make: string;
  model: string;
  year: string;
  numberPlate: string;
  status: CarStatus;
  driverInfo: Driver;
  carDocument?: CarDocument | null;
}

interface CarDocument {
  id: string;
  createdAt: Date;
  updatedAt: Date;
  motDocument?: MOTDocument | null;
  insuranceDocument?: InsuranceDocument | null;
  pCOVehicleLicense?: PCOVehicleLicense | null;
  vehicleLogBook?: VehicleLogBook | null;
  carInfo: Car;
  carId: string;
}

interface DocumentVerification {
  isVerified: boolean;
  isSubmitted: boolean;
  status: string;
  isReturned: boolean;
}

interface PCODocument {
  pcoBadgeDocFront: string | null;
  pcoBadgeDocBack: string | null;
  pcoBadgeNumber: string | null;
  pcoBadgeExpiryDate: Date | null;
  pcoPaperDoc: string | null;
  details: DocumentVerification;
}

interface drivingLicense {
  licenseDocFront?: string;
  licenseDocBack?: string;
  licenseNumber?: string;
  licenseExpiryDate?: Date;
  details: DocumentVerification;
}

interface Passport {
  passportNumber?: string;
  passportDocFront?: string;
  passportDocBack?: string;
  passportExpiryDate?: Date;
  details: DocumentVerification;
}

interface AddressProfDocument {
  addressProfDoc?: string;
  houseNumber?: string;
  state?: string;
  addressCode?: string;
  streetAddress?: string;
  city?: string;
  details: DocumentVerification;
}

interface MOTDocument {
  motDoc: string;
  motPassDate: Date;
  details: DocumentVerification;
}

interface InsuranceDocument {
  insuranceDoc: string;
  insuranceExpiryDate: Date;
  details: DocumentVerification;
}

interface PCOVehicleLicense {
  pcoVehicleLicenseDoc: string;
  pcoVehicleLicenseExpiryDate: Date;
  details: DocumentVerification;
}

interface VehicleLogBook {
  vehicleLogBookDoc: string;
  details: DocumentVerification;
}

export type {
  User,
  Driver,
  Document,
  BankDocument,
  Car,
  CarDocument,
  DocumentVerification,
  PCODocument,
  drivingLicense,
  Passport,
  AddressProfDocument,
  MOTDocument,
  InsuranceDocument,
  PCOVehicleLicense,
  VehicleLogBook,
};
