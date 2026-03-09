export interface CompanyData {
    id: string;
    createdAt: string;
    updatedAt: string;
    companyName: string;
    phone_number: string;
    companyEmail: string;
    description: string;
    status: string;
    [key: string]: any;
  }
  
  export interface Driver {
    id: string;
    name: string;
    phoneNumber: string;
    email: string;
    status: string;
  }