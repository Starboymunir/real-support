/* ═══════════════════════════════════════════════════════════
   RS CAB — Shared TypeScript types (mirrors Prisma schema)
   ═══════════════════════════════════════════════════════════ */

// ── Enums ──

export type UserStatus = 'PENDING' | 'ACTIVE' | 'ONHOLD' | 'SUSPEND';
export type CarStatus = 'ACTIVE' | 'INACTIVE';
export type Subscription = 'DIAMOND' | 'GOLD' | 'SILVER' | 'NONE';
export type PaymentType = 'CASH' | 'WALLET' | 'CASHANDWALLET';
export type RideRequestStatus = 'PENDING' | 'CANCELLED' | 'ACCEPTED';
export type BidStatus = 'PENDING' | 'REJECTED' | 'ACCEPTED';
export type RequestType = 'ADJUSTABLE' | 'FIXED';
export type UserMode = 'DRIVER' | 'PASSENGER';
export type BookingStatus =
  | 'ACCEPTED' | 'REJECTED' | 'CANCELLED'
  | 'WAY_TO_PICKUP' | 'ARRIVED' | 'PICKED_UP'
  | 'WAY_TO_DESTINATION' | 'COMPLETED';
export type ContactUsStatus = 'PENDING' | 'PROCESSING' | 'COMPLETED';
export type TransactionType =
  | 'TOPUP' | 'EXPENSE' | 'WITHDRAW' | 'P2P_WALLET'
  | 'COMMISSION' | 'REQUEST' | 'DEPOSIT' | 'REFUND'
  | 'CANCELLATION_FEE' | 'BOOKING_INCOME' | 'ADMIN_COMMISSION'
  | 'ADMIN_CHARGE' | 'ADMIN_FUND';
export type AdminTransactionType = 'INCOME' | 'EXPENSE' | 'COMMISSION';
export type Role = 'SUPER_ADMIN' | 'ADMIN' | 'STAFF' | 'ACCOUNTANT';
export type PaymentOption = 'CASH_BALANCE' | 'BANK_TRANSFER' | 'CARD' | 'OTHER_OPTION';
export type CompanyStatus = 'ACTIVE' | 'SUSPEND' | 'PENDING' | 'ONHOLD';
export type AdminRole = 'ADMIN' | 'STAFF';
export type DriverRequestStatus = 'ACTIVE' | 'SUSPEND' | 'PENDING' | 'ONHOLD' | 'DECLINE';
export type RequestStatus = 'REJECTED' | 'PENDING' | 'PROCESSED';
export type AccountStatus = 'REJECTED' | 'PENDING' | 'ACTIVE';
export type MessageSender = 'CLIENT' | 'ADMIN';

// ── Embedded types ──

export interface Location {
  latitude: number;
  longitude: number;
  accuracy: number;
  timestamp: number;
}

export interface DocumentVerification {
  isVerified: boolean;
  isSubmitted: boolean;
  status: string;
  isReturned: boolean;
}

// ── Core models ──

export interface User {
  id: string;
  uniqueId: string;
  firstName: string;
  lastName: string;
  emailAddress: string;
  phone_number?: string;
  profileImageUrl?: string;
  lastLogin?: string;
  coverImage?: string;
  ratings: number;
  mode: UserMode;
  socketId?: string;
  isEmailConfirm?: string;
  isDeleted: boolean;
  currentLocation?: Location;
  lastLocation?: Location;
  wallet?: Wallet;
  status: UserStatus;
  driver?: Driver;
  Admin?: Admin;
  bankAccounts?: BankAccount[];
  createdAt: string;
  updatedAt: string;
}

export interface Driver {
  id: string;
  driverRecognitionNumber?: string;
  nationalInsuranceNumber?: string;
  selfAssessmentTaxId?: string;
  dateOfBirth?: string;
  ratings: number;
  totalJobComplete: number;
  currentLocation?: Location;
  bio?: string;
  hobby?: string;
  driverUserId?: string;
  userInfo?: User;
  depositPaid: boolean;
  depositAmount: number;
  commissionPercentage: number;
  subscription: Subscription;
  status: UserStatus;
  isDeleted: boolean;
  isOnline: boolean;
  car?: Car;
  document?: Document;
  packageIDs: string[];
  createdAt: string;
  updatedAt: string;
}

export interface Wallet {
  id: string;
  userId: string;
  balance: number;
  transactions?: Transaction[];
  createdAt: string;
  updatedAt: string;
}

export interface Transaction {
  id: string;
  userId: string;
  bookingId?: string;
  walletId?: string;
  senderId?: string;
  receiverId?: string;
  amount: number;
  balanceBefore: number;
  balanceAfter: number;
  narration?: string;
  type: TransactionType;
  stripeId?: string;
  withdrawRequestId?: string;
  paymentRequestId?: string;
  senderInfo?: User;
  receiverInfo?: User;
  createdAt: string;
  updatedAt: string;
}

export interface Car {
  id: string;
  color: string;
  carImage?: string;
  engine: string;
  make: string;
  model: string;
  year: string;
  numberPlate: string;
  status: CarStatus;
  driverId: string;
  createdAt: string;
  updatedAt: string;
}

export interface Address {
  id: string;
  name?: string;
  description?: string;
  houseNumber?: string;
  postCode?: string;
  city: string;
  streetName?: string;
  notes?: string;
  latitude: string;
  longitude: string;
}

export interface Package {
  id: string;
  name: string;
  summary: string;
  description: string;
  sortIndex: number;
  status: boolean;
  freeWaiting: number;
  cancellationFee: number;
  serviceFee: number;
  maxServiceFee: number;
  pricePerMilage: number;
  drivingProMin: number;
  waitingProMin: number;
  vat: number;
  minBill: number;
  coverImage?: string;
  createdAt: string;
  updatedAt: string;
}

export interface RideRequest {
  id: string;
  startFrom: Address;
  startFromId: string;
  destination: Address;
  destinationId: string;
  stoppages: Address[];
  bookingDate?: string;
  bookingTime?: string;
  totalDuration: number;
  totalBill?: number;
  totalPersons?: number;
  totalLuggage?: number;
  totalDistance: number;
  notes?: string;
  cashCollected?: number;
  walletCollected?: number;
  couponCode?: string;
  couponExpiryDate?: string;
  couponPercentage?: number;
  discountAmount?: number;
  paymentType: PaymentType;
  status: RideRequestStatus;
  isRefunded: boolean;
  refundAmount?: number;
  packageId: string;
  packageInfo?: Package;
  serviceCharge: number;
  passengerId: string;
  riderInfo?: User;
  clientName: string;
  clientEmail: string;
  clientPhone?: string;
  requestType: RequestType;
  budget?: number;
  bids?: Bid[];
  booking?: Booking;
  rejectedByIds: string[];
  createdAt: string;
  updatedAt: string;
}

export interface Bid {
  id: string;
  requestId: string;
  requestInfo?: RideRequest;
  bidAmount: number;
  driverId: string;
  driverInfo?: Driver;
  passengerId: string;
  riderInfo?: User;
  status: BidStatus;
  createdAt: string;
  updatedAt: string;
}

export interface Booking {
  id: string;
  uniqueId: string;
  startFrom: Address;
  destination: Address;
  stoppages: Address[];
  driverId: string;
  driverName: string;
  driverEmail: string;
  driverPhone: string;
  driverRating: number;
  driverReview?: string;
  commission: number;
  vehicleNumberPlate: string;
  riderId: string;
  riderName: string;
  riderPhone?: string;
  riderEmail: string;
  riderRating: number;
  riderReview?: string;
  commissionPercentage: number;
  paymentType: PaymentType;
  paymentStatus: boolean;
  couponCode?: string;
  discountAmount?: number;
  cashCollected?: number;
  walletCollected?: number;
  finalBill: number;
  totalBill: number;
  requestId: string;
  requestType: RequestType;
  packageId: string;
  packageName: string;
  serviceCharge: number;
  status: BookingStatus;
  acceptedAt: string;
  totalPersons?: number;
  totalLuggage?: number;
  notes?: string;
  bookingDate: string;
  bookingTime: string;
  totalDistance: number;
  totalDuration: number;
  cancelledById?: string;
  cancelReason?: string;
  cancelTime?: string;
  isRefunded: boolean;
  refundAmount?: number;
  cancellationFee?: number;
  totalWaitingTime?: number;
  wayToPickupAt?: string;
  arrivedAt?: string;
  pickedUpAt?: string;
  completedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface BankAccount {
  id: string;
  bankName: string;
  accountName: string;
  accountNumber: string;
  sortCode: string;
  document?: string;
  isDefault: boolean;
  status: AccountStatus;
  userId: string;
  createdAt: string;
  updatedAt: string;
}

export interface WithdrawRequest {
  id: string;
  userId: string;
  amount: number;
  status: RequestStatus;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface PaymentRequest {
  id: string;
  recipientId: string;
  recipient?: User;
  payeeId: string;
  payee?: User;
  amount: number;
  onAccountOf: string;
  remarks?: string;
  status: RequestStatus;
  createdAt: string;
  updatedAt: string;
}

export interface ContactUs {
  id: string;
  name: string;
  email: string;
  phone_number: string;
  reason: string;
  status: ContactUsStatus;
  userId?: string;
  messages?: ContactUsMessage[];
  createdAt: string;
  updatedAt: string;
}

export interface ContactUsMessage {
  id: string;
  contactUsId: string;
  sender: MessageSender;
  content: string;
  createdAt: string;
}

export interface Notification {
  id: string;
  ROC: string;
  remarks?: string;
  userId?: string;
  isRead: boolean;
  companyId?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Chat {
  id: string;
  isGroupChat: boolean;
  isAdminChat: boolean;
  bookingId?: string;
  participants: ChatParticipant[];
  messages: ChatMessage[];
  createdAt: string;
  updatedAt: string;
}

export interface ChatParticipant {
  id: string;
  chatId: string;
  userId: string;
  lastReadAt?: string;
  user?: User;
}

export interface ChatMessage {
  id: string;
  senderId?: string;
  sender?: User;
  content?: string;
  attachments: string[];
  chatId?: string;
  createdAt: string;
  updatedAt: string;
}

export interface DiscountCoupon {
  id: string;
  coupon: string;
  discount: number;
  expiry: string;
  isActive: boolean;
  useability: number;
  createdAt: string;
  updatedAt: string;
}

export interface Airport {
  id: string;
  name: string;
  code: string;
  dropoffFee: number;
  parkingFee: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Company {
  id: string;
  companyName?: string;
  companyEmail: string;
  phone_number?: string;
  description?: string;
  status: CompanyStatus;
  createdAt: string;
  updatedAt: string;
}

export interface Admin {
  id: string;
  role: Role;
  lastLogin?: string;
  status: boolean;
  userId: string;
  createdAt: string;
  updatedAt: string;
}

export interface UserAddress {
  id: string;
  country: string;
  state: string;
  city: string;
  houseNumber: string;
  streetName: string;
  postalCode: string;
  isDefault: boolean;
  userId: string;
  createdAt: string;
  updatedAt: string;
}

export interface Document {
  id: string;
  drivingLicense?: {
    licenseDocFront?: string;
    licenseDocBack?: string;
    licenseNumber?: string;
    licenseExpiryDate?: string;
    details?: DocumentVerification;
  };
  bankDocuments?: {
    sortCode?: string;
    accountNumber?: string;
    bankName?: string;
    accProfDoc?: string;
    details: DocumentVerification;
  };
  pcoDocuments?: {
    pcoBadgeDocFront?: string;
    pcoBadgeDocBack?: string;
    pcoBadgeNumber?: string;
    pcoBadgeExpiryDate?: string;
    pcoPaperDoc?: string;
    details: DocumentVerification;
  };
  passport?: {
    passportNumber?: string;
    passportDocFront?: string;
    passportDocBack?: string;
    passportExpiryDate?: string;
    details: DocumentVerification;
  };
  workPermitCode?: string;
  addressProfDocs?: {
    addressProfDoc?: string;
    houseNumber?: string;
    state?: string;
    addressCode?: string;
    streetAddress?: string;
    city?: string;
    details: DocumentVerification;
  };
  driverId: string;
  createdAt: string;
  updatedAt: string;
}

// ── API request DTOs ──

export interface RegisterDto {
  firstName: string;
  lastName: string;
  emailAddress: string;
  password: string;
  phone_number: string;
  mode?: UserMode;
}

export interface LoginDto {
  emailAddress: string;
  password: string;
}

export interface ConfirmOtpDto {
  emailAddress: string;
  otp: string;
}

export interface ForgotPasswordDto {
  email: string;
}

export interface ResetPasswordDto {
  email: string;
  otp: string;
  newPassword: string;
}

export interface ChangePasswordDto {
  email: string;
  oldPassword: string;
  newPassword: string;
}

export interface CreateRequestDto {
  startFrom: AddressDto;
  destination: AddressDto;
  stoppages?: AddressDto[];
  packageId: string;
  totalBill?: number;
  paymentType: PaymentType;
  bookingDate?: string;
  bookingTime?: string;
  totalDistance: number;
  totalDuration: number;
  totalPersons?: number;
  totalLuggage?: number;
  notes?: string;
  discountAmount?: number;
  couponPercentage?: number;
  couponExpiryDate?: string;
  couponCode?: string;
  clientName: string;
  clientEmail: string;
  clientPhone?: string;
  cashCollected?: number;
  walletCollected?: number;
  requestType?: RequestType;
  serviceCharge: number;
}

export interface AddressDto {
  name?: string;
  description?: string;
  houseNumber?: string;
  postCode?: string;
  city: string;
  streetName?: string;
  notes?: string;
  latitude: string;
  longitude: string;
}

export interface CreateBookingDto {
  driverId: string;
  requestId: string;
}

export interface CreatePaymentIntentDto {
  amount: number;
  email?: string;
  userId: string;
  currency?: string;
  description?: string;
}

export interface CreateTopUpDto {
  amount: number;
  userId: string;
  type: TransactionType;
  stripeId: string;
}

export interface WalletTransferDto {
  recipientId: string;
  payeeId: string;
  amount: number;
  narration?: string;
}

export interface CreatePaymentRequestDto {
  recipientId: string;
  payeeId: string;
  amount: number;
  onAccountOf: string;
  remarks?: string;
}

export interface CalculatePriceDto {
  packageId: string;
  totalDistance: number;
  totalDuration: number;
}

// ── API Response wrapper ──

export interface ApiResponse<T = unknown> {
  success: boolean;
  data: T;
  message: string;
}

export interface PaginatedResponse<T> {
  success: boolean;
  data: T[];
  total: number;
  page: number;
  limit: number;
  message: string;
}
