export interface CreateBusinessDto {
  name: string;
  email: string;
  password?: string;
  phone: string;
  address: string;
  sectorId: string;
  website?: string;
  socialMedia?: {
    [key: string]: string;
  };
}

export interface Business {
  id: string;
  name: string;
  email: string;
  phone: string;
  address: string;
  website?: string;
  socialMedia?: {
    [key: string]: string;
  };
  uniqueCode: string;
  createdAt: string;
  updatedAt: string;
}

export interface BusinessLoginDto {
  email: string;
  password?: string;
}

export interface BusinessLoginResponse {
  access_token: string;
  refresh_token: string;
}
