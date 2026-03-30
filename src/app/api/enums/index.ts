enum DriverStatus {
  PENDING = 'PENDING',
  ACTIVE = 'ACTIVE',
  ONHOLD = 'ONHOLD',
  SUSPEND = 'SUSPEND',
}

enum PassengerStatus {
  ACTIVE = 'ACTIVE',
  SUSPEND = 'SUSPEND',
}

enum CarStatus {
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE',
}

enum Subscription {
  DIAMOND = 'DIAMOND',
  GOLD = 'GOLD',
  SILVER = 'SILVER',
  NONE = 'NONE',
}

enum BookingStatus {
  PENDING = 'PENDING',
  ACCEPTED = 'ACCEPTED',
  CANCELLED = 'CANCELLED',
  REJECTED = 'REJECTED',
  COMPLETED = 'COMPLETED',
}

enum Payment {
  CASH = 'CASH',
  CARD = 'CARD',
  BANK_TRANSFER = 'BANK_TRANSFER',
  INVOICE = 'INVOICE',
}

enum RideRequestStatus {
  PENDING = 'PENDING',
  CANCELLED = 'CANCELLED',
  ACCEPTED = 'ACCEPTED',
}

enum BidStatus {
  PENDING = 'PENDING',
  REJECTED = 'REJECTED',
  ACCEPTED = 'ACCEPTED',
}

enum Role {
  SUPER_ADMIN = 'SUPER_ADMIN',
  ADMIN = 'ADMIN',
}

enum PaymentOption {
  CASH_BALANCE = 'CASH_BALANCE',
  BANK_TRANSFER = 'BANK_TRANSFER',
  CARD = 'CARD',
  OTHER_OPTION = 'OTHER_OPTION',
}
