import * as z from "zod";
import { onboardingFullSchema } from "@/lib/validators/signupSchemas";

export type businessOnboardDto = z.infer<typeof onboardingFullSchema>;



export interface BusinessSignUpDto {
    password: string;
    email: string;
}
export interface CreateBusinessDto {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
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
  password: string;
}

export interface BusinessLoginResponse {
  accessToken: string;
  refreshToken: string;
  user: {
    role: string;
  };
}

export interface Sector {
  id: string;
  name: string;
  imageUrl: string;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
}
