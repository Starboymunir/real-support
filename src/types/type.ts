import {
  Address,
  Request,
  Package,
  Booking,
  Driver,
  Payment,
  BookingStatus,
  RideRequestStatus,
  User,
  PaymentRequests,
  Admin,
  UserAddress,
  Wallet,
  BankAccount,
  Company,
  Transaction,
  AdminTransaction,
  WithdrawRequests,
  ContactUs,
  ContactUsMessage,
} from "@prisma/client";

export type ApiResponse<T> = {
  success: boolean;
  data: T;
  message: string;
  totalCount?: number;
};

export type IRequestType = Request & {
  packageInfo?: Package;
  riderInfo?: User;
  destination?: Address;
  startFrom?: Address;
  stoppages?: Address[];
};

export type ITransaction = Transaction & {
  userInfo?: User;
  receiverInfo?: User;
  senderInfo?: User;
};

export type IBookingType = Booking & {
  requestInfo?: IRequestType | null;
  driverInfo?: IDriver | null;
  riderInfo?: User | null;
  destination?: Address | null;
  startFrom?: Address | null;
  packageInfo?: Package | null;
  requestId: string | null;
};

export type IPaymentRequest = PaymentRequests & {
  payee?: User;
  recipient?: User;
};

export type formatedRequestCardData = {
  id: string;
  date: Date | null;
  time: string | null;
  image: string | null | undefined;
  name: string | undefined;
  status: RideRequestStatus;
  type: Payment;
  from: string | null | undefined;
  drop: string | null | undefined;
  price: number | null;
  distance: number;
};
export type formattedBookingCardData = {
  date: Date | null;
  time: string | null;
  image?: string | null | undefined;
  name: string;
  status: BookingStatus;
  type?: Payment;
  from: string | null | undefined;
  drop: string | null | undefined;
  price: number;
  distance: number;
};
export type formattedBookingTableData = {
  image?: string | null | undefined;
  name: string;
  drop: string | null | undefined;
  from: string | null | undefined;
  price: number;
};

export type IUser = User & {
  driver?: Driver;
  addressInfo?: UserAddress[];
  SocialLink?: any[];
  wallet?: Wallet;
  bookings?: Booking[];
  bankAccounts?: BankAccount[];
  role?: string;
};

export type IDriver = Driver & {
  userInfo?: User | null;
};

export type IAdmin = Admin & {
  userProfile?: User; // legacy — kept for backward compat
  password?: string;
  secretNumber?: string;
  profileImageUrl?: string;
  coverImage?: string;
};

export type ICompany = Company & {
  userInfo?: Admin;
};

export type IAdminTransaction = AdminTransaction & {
  userInfo?: IUser | null;
  narration?: string;
};

export type IWithdrawals = WithdrawRequests & {
  userInfo?: IUser | null;
  proceeder?: IAdmin | null;
  totalTopUp?: number;
  totalWithdraw?: number;
  currentBalance?: number;
};

export type IContactUs = ContactUs & {
  userInfo?: IUser;
  messages?: ContactUsMessage[];
};
