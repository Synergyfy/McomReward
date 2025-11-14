import * as z from "zod";
import { businessSignUpSchema, createBusinessSchema} from "@/lib/validators/signupSchemas";
import { Sector, Category, SubCategory } from '@/services/sectors/types'; // Import from unified types

export type CreateBusinessDto = z.infer<typeof createBusinessSchema>;
export type BusinessSignUpDto = z.infer<typeof businessSignUpSchema>;




// export interface CreateBusinessDto {
//   name: string;
//   email: string;
//   password: string;
//   confirmPassword: string;
//   phone: string;
//   address: string;
//   sectorId: string;
//   website?: string;
//   socialMedia?: {
//     [key: string]: string;
//   };
//   referralCapacity: number;
// }

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
