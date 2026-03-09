

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
  motDoc?: string | null;
  motPassDate?: Date | null;
  insurenceDoc?: string | null;
  insurenceExpiryDate?: Date | null;
  pcoVehicleLicenseDoc?: string | null;
  pcoVehicleLicenseExpiryDate?: Date | null;
  vehicleLogBookDoc?: string | null;
  otherDoc?: string | null;
  carInfo: Car;
  carId: string;
}
