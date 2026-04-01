// Local type definitions replacing @prisma/client imports.
// These match the shapes returned by the backend API.

// ===== Enums =====

export const UserStatus = {
  PENDING: "PENDING",
  ACTIVE: "ACTIVE",
  ONHOLD: "ONHOLD",
  SUSPEND: "SUSPEND",
} as const;
export type UserStatus = (typeof UserStatus)[keyof typeof UserStatus];

export const CarStatus = {
  ACTIVE: "ACTIVE",
  INACTIVE: "INACTIVE",
} as const;
export type CarStatus = (typeof CarStatus)[keyof typeof CarStatus];

export const Subscription = {
  DIAMOND: "DIAMOND",
  GOLD: "GOLD",
  SILVER: "SILVER",
  NONE: "NONE",
} as const;
export type Subscription = (typeof Subscription)[keyof typeof Subscription];

export const Payment = {
  CASH: "CASH",
  WALLET: "WALLET",
  CASHANDWALLET: "CASHANDWALLET",
} as const;
export type Payment = (typeof Payment)[keyof typeof Payment];

export const RideRequestStatus = {
  PENDING: "PENDING",
  CANCELLED: "CANCELLED",
  ACCEPTED: "ACCEPTED",
} as const;
export type RideRequestStatus =
  (typeof RideRequestStatus)[keyof typeof RideRequestStatus];

export const BidStatus = {
  PENDING: "PENDING",
  REJECTED: "REJECTED",
  ACCEPTED: "ACCEPTED",
} as const;
export type BidStatus = (typeof BidStatus)[keyof typeof BidStatus];

export const RequestType = {
  ADJUSTABLE: "ADJUSTABLE",
  FIXED: "FIXED",
} as const;
export type RequestType = (typeof RequestType)[keyof typeof RequestType];

export const UserMode = {
  DRIVER: "DRIVER",
  PASSENGER: "PASSENGER",
} as const;
export type UserMode = (typeof UserMode)[keyof typeof UserMode];

export const ContentType = {
  aboutUs: "aboutUs",
  termsAndCondition: "termsAndCondition",
  privacyPolicy: "privacyPolicy",
} as const;
export type ContentType = (typeof ContentType)[keyof typeof ContentType];

export const BookingStatus = {
  ACCEPTED: "ACCEPTED",
  REJECTED: "REJECTED",
  CANCELLED: "CANCELLED",
  WAY_TO_PICKUP: "WAY_TO_PICKUP",
  ARRIVED: "ARRIVED",
  PICKED_UP: "PICKED_UP",
  WAY_TO_DESTINATION: "WAY_TO_DESTINATION",
  COMPLETED: "COMPLETED",
} as const;
export type BookingStatus =
  (typeof BookingStatus)[keyof typeof BookingStatus];

export const ContactUsStatus = {
  PENDING: "PENDING",
  RESOLVED: "RESOLVED",
  CLOSED: "CLOSED",
} as const;
export type ContactUsStatus =
  (typeof ContactUsStatus)[keyof typeof ContactUsStatus];

export const SocialProvider = {
  facebook: "facebook",
  twitter: "twitter",
  instagram: "instagram",
  linkedin: "linkedin",
  youtube: "youtube",
  pinterest: "pinterest",
  snapchat: "snapchat",
  tiktok: "tiktok",
  whatsapp: "whatsapp",
} as const;
export type SocialProvider =
  (typeof SocialProvider)[keyof typeof SocialProvider];

export const AccountStatus = {
  PENDING: "PENDING",
  APPROVED: "APPROVED",
  REJECTED: "REJECTED",
} as const;
export type AccountStatus =
  (typeof AccountStatus)[keyof typeof AccountStatus];

export const RequestStatus = {
  PENDING: "PENDING",
  ACCEPTED: "ACCEPTED",
  REJECTED: "REJECTED",
  COMPLETED: "COMPLETED",
  CANCELLED: "CANCELLED",
} as const;
export type RequestStatus =
  (typeof RequestStatus)[keyof typeof RequestStatus];

export const TransactionType = {
  TOPUP: "TOPUP",
  TRANSFER: "TRANSFER",
  WITHDRAW: "WITHDRAW",
  BOOKING: "BOOKING",
  REFUND: "REFUND",
} as const;
export type TransactionType =
  (typeof TransactionType)[keyof typeof TransactionType];

export const AdminTransactionType = {
  CREDIT: "CREDIT",
  DEBIT: "DEBIT",
} as const;
export type AdminTransactionType =
  (typeof AdminTransactionType)[keyof typeof AdminTransactionType];

// ===== Model Interfaces =====

export interface User {
  id: string;
  uniqueId?: string | null;
  createdAt: Date | string;
  updatedAt: Date | string;
  firstName: string | null;
  lastName: string | null;
  emailAddress: string | null;
  password: string | null;
  phone_number: string | null;
  address: string | null;
  profileImageUrl: string | null;
  lastLogin: Date | string | null;
  coverImage: string | null;
  ratings: number | null;
  mode: UserMode | null;
  googleId: string | null;
  appleId: string | null;
  socketId: string | null;
  isEmailConfirm: boolean;
  isDeleted: boolean;
  emailVerificationOtp: string | null;
  emailVerificationExpiry: Date | string | null;
  resetToken: string | null;
  resetTokenExpiry: Date | string | null;
  currentLocation: any;
  lastLocation: any;
  status: UserStatus;
  cognitoId?: string | null;
  cognitoUserName?: string | null;
  [key: string]: any;
}

export interface Driver {
  id: string;
  createdAt: Date | string;
  updatedAt: Date | string;
  driverRecognitionNumber: string | null;
  nationalInsuranceNumber: string | null;
  selfAssessmentTaxId: string | null;
  dateOfBirth: string | null;
  ratings: number;
  totalJobComplete: number;
  currentLocation: any;
  bio: string | null;
  hobby: string | null;
  address: string | null;
  city: string | null;
  postcode: string | null;
  driverUserId: string;
  depositPaid: boolean;
  depositAmount: number;
  commissionPercentage: number;
  subscription: Subscription;
  status: UserStatus;
  isDeleted: boolean;
  isOnline: boolean;
  packageIDs: string[];
  companyId: string | null;
  profileImage?: string | null;
  depositeAmount?: number;
  depositePaid?: boolean;
  commision?: number;
  currentBalance?: number;
  userId?: string;
  [key: string]: any;
}

export interface Document {
  id: string;
  createdAt: Date | string;
  updatedAt: Date | string;
  drivingLicense: any;
  bankDocuments: any;
  pcoDocuments: any;
  passport: any;
  workPermitCode: any;
  addressProfDocs: any;
  driverId: string;
  [key: string]: any;
}

export interface Car {
  id: string;
  createdAt: Date | string;
  updatedAt: Date | string;
  color: string;
  carImage: string | null;
  engine: string;
  make: string;
  model: string;
  year: string;
  numberPlate: string;
  seats: number | null;
  status: CarStatus;
  driverId: string;
  [key: string]: any;
}

export interface CarDocument {
  id: string;
  createdAt: Date | string;
  updatedAt: Date | string;
  motDocument: any;
  insuranceDocument: any;
  pCOVehicleLicense: any;
  vehicleLogBook: any;
  carId: string;
  [key: string]: any;
}

export interface Address {
  id: string;
  createdAt: Date | string;
  updatedAt: Date | string;
  name: string | null;
  description: string | null;
  houseNumber: string | null;
  postCode: string | null;
  city: string | null;
  streetName: string | null;
  notes: string | null;
  latitude: number | null;
  longitude: number | null;
  requestId: string | null;
  bookingId: string | null;
  userId: string | null;
  [key: string]: any;
}

export interface Package {
  id: string;
  createdAt: Date | string;
  updatedAt: Date | string;
  name: string;
  summary: string | null;
  description: string | null;
  sortIndex: number;
  status: boolean;
  freeWaiting: number | null;
  cancellationFee: number | null;
  serviceFee: number;
  maxServiceFee: number | null;
  pricePerMilage: number;
  drivingProMin: number;
  waitingProMin: number;
  vat: number;
  minBill: number;
  coverImage: string | null;
  [key: string]: any;
}

export interface StaticContent {
  id: string;
  createdAt: Date | string;
  updatedAt: Date | string;
  contentType: ContentType;
  title: string | null;
  content: string | null;
  [key: string]: any;
}

export interface Request {
  id: string;
  createdAt: Date | string;
  updatedAt: Date | string;
  startFromId: string | null;
  destinationId: string | null;
  bookingDate: Date | string | null;
  bookingTime: string | null;
  totalDuration: number | null;
  totalBill: number | null;
  totalPersons: number | null;
  totalLuggage: number | null;
  totalDistance: number | null;
  notes: string | null;
  cashCollected: number | null;
  walletCollected: number | null;
  couponCode: string | null;
  couponExpiryDate: Date | string | null;
  couponPercentage: number | null;
  discountAmount: number | null;
  paymentType: Payment | null;
  status: RideRequestStatus;
  isRefunded: boolean;
  refundAmount: number | null;
  packageId: string | null;
  serviceCharge: number | null;
  passengerId: string | null;
  clientName: string | null;
  clientEmail: string | null;
  clientPhone: string | null;
  requestType: RequestType | null;
  budget: number | null;
  rejectedByIds: string[];
  [key: string]: any;
}

export interface Booking {
  id: string;
  uniqueId: string | null;
  createdAt: Date | string;
  updatedAt: Date | string;
  startFromId: string | null;
  destinationId: string | null;
  driverId: string | null;
  driverName: string | null;
  driverEmail: string | null;
  driverPhone: string | null;
  NINumber: string | null;
  selfAssessmentTaxId: string | null;
  driverRating: number | null;
  driverReview: string | null;
  commission: number | null;
  vehicleNumberPlate: string | null;
  riderId: string | null;
  riderName: string | null;
  riderPhone: string | null;
  riderEmail: string | null;
  riderRating: number | null;
  riderReview: string | null;
  commissionPercentage: number | null;
  paymentType: Payment | null;
  paymentStatus: string | null;
  couponCode: string | null;
  couponExpiryDate: Date | string | null;
  couponPercentage: number | null;
  discountAmount: number | null;
  cashCollected: number | null;
  walletCollected: number | null;
  finalBill: number | null;
  totalBill: number | null;
  requestId: string | null;
  requestType: RequestType | null;
  packageId: string | null;
  packageName: string | null;
  serviceCharge: number | null;
  status: BookingStatus;
  acceptedAt: Date | string | null;
  totalPersons: number | null;
  totalLuggage: number | null;
  notes: string | null;
  bookingDate: Date | string | null;
  bookingTime: string | null;
  totalDistance: number | null;
  totalDuration: number | null;
  cancelledById: string | null;
  cancelReason: string | null;
  cancelTime: Date | string | null;
  isRefunded: boolean;
  refundAmount: number | null;
  cancellationFee: number | null;
  cancellationFeeCollected: number | null;
  totalWaitingTime: number | null;
  wayToPickupAt: Date | string | null;
  arrivedAt: Date | string | null;
  pickedUpAt: Date | string | null;
  completedAt: Date | string | null;
  isAllowGenerateInvoice: boolean;
  [key: string]: any;
}

export interface Wallet {
  id: string;
  createdAt: Date | string;
  updatedAt: Date | string;
  userId: string;
  balance: number;
  [key: string]: any;
}

export interface PaymentRequests {
  id: string;
  createdAt: Date | string;
  updatedAt: Date | string;
  recipientId: string;
  payeeId: string;
  amount: number;
  onAccountOf: string | null;
  remarks: string | null;
  status: RequestStatus;
  [key: string]: any;
}

export interface Transaction {
  id: string;
  createdAt: Date | string;
  updatedAt: Date | string;
  userId: string;
  bookingId: string | null;
  walletId: string | null;
  senderId: string | null;
  amount: number;
  balanceBefore: number;
  balanceAfter: number;
  narration: string | null;
  type: TransactionType;
  withdrawRequestId: string | null;
  receiverId: string | null;
  paymentRequestId: string | null;
  stripeId: string | null;
  [key: string]: any;
}

export interface AdminTransaction {
  id: string;
  createdAt: Date | string;
  updatedAt: Date | string;
  amount: number;
  userId: string;
  type: AdminTransactionType;
  narration: string | null;
  [key: string]: any;
}

export interface WithdrawRequests {
  id: string;
  createdAt: Date | string;
  updatedAt: Date | string;
  userId: string;
  proceededBy: string | null;
  amount: number;
  status: string;
  notes: string | null;
  [key: string]: any;
}

export interface DiscountCoupons {
  id: string;
  coupon: string;
  discount: number;
  expiry: Date | string;
  isActive: boolean;
  useability: number;
  createdAt: Date | string;
  updatedAt: Date | string;
  [key: string]: any;
}

export interface ContactUs {
  id: string;
  createdAt: Date | string;
  updatedAt: Date | string;
  name: string;
  email: string;
  phone_number: string | null;
  reason: string;
  status: ContactUsStatus;
  userId: string | null;
  [key: string]: any;
}

export interface ContactUsMessage {
  id: string;
  createdAt: Date | string;
  contactUsId: string;
  sender: string;
  content: string;
  [key: string]: any;
}

export interface SocialLink {
  id: string;
  userId: string;
  type: SocialProvider;
  link: string;
  createdAt: Date | string;
  updatedAt: Date | string;
  [key: string]: any;
}

export interface BankAccount {
  id: string;
  bankName: string;
  accountName: string;
  accountNumber: string;
  sortCode: string;
  document: string | null;
  isDefault: boolean;
  status: AccountStatus;
  userId: string;
  createdAt: Date | string;
  updatedAt: Date | string;
  [key: string]: any;
}

export interface UserAddress {
  id: string;
  country: string | null;
  state: string | null;
  city: string | null;
  houseNumber: string | null;
  streetName: string | null;
  postalCode: string | null;
  isDefault: boolean;
  userId: string;
  createdAt: Date | string;
  updatedAt: Date | string;
  [key: string]: any;
}

export interface Admin {
  id: string;
  createdAt: Date | string;
  updatedAt: Date | string;
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  phone_number: string | null;
  profileImageUrl: string | null;
  coverImage: string | null;
  role: string;
  lastLogin: Date | string | null;
  otp: string | null;
  status: string;
  isEmailConfirm: boolean;
  emailVerificationOtp: string | null;
  emailVerificationExpiry: Date | string | null;
  resetToken: string | null;
  resetTokenExpiry: Date | string | null;
  [key: string]: any;
}

export interface Company {
  id: string;
  createdAt: Date | string;
  updatedAt: Date | string;
  companyName: string;
  phone_number: string | null;
  companyEmail: string | null;
  description: string | null;
  coverImage: string | null;
  HMRC_RegistrationNumber: string | null;
  VAT_RegistrationNumber: string | null;
  PCO_OperatorLicenseNumber: string | null;
  PCO_OperatorLicenseExpiryDate: Date | string | null;
  PCO_OperatorLicenseIssueDate: Date | string | null;
  status: string;
  contactPerson: string | null;
  [key: string]: any;
}

export interface Passenger {
  id: string;
  createdAt: Date | string;
  updatedAt: Date | string;
  userId: string;
  profileImage: string | null;
  ratings: number;
  totalBookings: number;
  isDeleted: boolean;
  [key: string]: any;
}

export interface Bid {
  id: string;
  createdAt: Date | string;
  updatedAt: Date | string;
  amount: number;
  status: BidStatus;
  requestId: string;
  driverId: string;
  userId: string;
  [key: string]: any;
}

export interface Location {
  latitude: number;
  longitude: number;
  [key: string]: any;
}
