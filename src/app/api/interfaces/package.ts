interface Package {
    id: string;
    createdAt: Date;
    updatedAt: Date;
    name: string;
    summary: string;
    description: string;
    sortIndex: number;
    status: boolean;
    serviceFee: number;
    pricePerMilage: number;
    drivingProMin: number;
    waitingProMin: number;
    vat: number;
    coverImage?: string | null;
    request: Request[];
  }
  