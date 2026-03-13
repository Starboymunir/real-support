interface User {
  id?: string;
  createdAt?: Date;
  updatedAt?: Date;
  firstName: string;
  lastName: string;
  emailAddress: string;
  phone_number?: string | null;
  lastLogin: Date | null;
  role: string;
  cognitoId: string;
  isEmailConfirm?: Date | null;
}

interface UpdateUser {
  createdAt?: Date;
  updatedAt?: Date;
  firstName?: string;
  lastName?: string;
  emailAddress?: string;
  phone_number?: string | null;
  role?: string;
  cognitoId?: string;
  isEmailConfirm?: Date | null;
}
