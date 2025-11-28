// --- Reconstructed from hook.ts usage ---

export interface BusinessLoginDto {
  email: string;
  password: string;
}

export interface User {
    role: string;
    name: string;
    isOnboarded: boolean;
}

export interface BusinessLoginResponse {
    user: User;
    accessToken: string;
    refreshToken: string;
}

export interface BusinessSignUpDto {
  name: string;
  email: string;
  password: string;
  confirmPassword?: string;
  inviteCode?: string;
}

export interface CreateBusinessDto {
  sectorId: string;
  categoryId: string;
  subCategoryId?: string | null;
  phone: string;
  address: string;
  website?: string;
  socialMedia?: { name: string; link: string; }[];
  referralCapacity: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
}

export interface Category {
  id: string;
  name: string;
  imageUrl?: string;
}

export interface Subcategory {
  id: string;
  name: string;
  imageUrl?: string;
}

export interface Business {
  id: string;
  name: string;
}


// --- New Type for Business Profile ---

export interface BusinessProfile {
  id: string;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
  name: string;
  email: string;
  phone: string;
  address: string;
  website: string;
  logoUrl?: string;
  bannerUrl?: string;
  description?: string;
  category?: {
    id: string;
    name: string;
  };
  socialMedia: { name: string; link: string; }[];
  uniqueCode: string;
  role: string;
  referralCapacity: number;
  affiliateCode: string;
  referralPoints: string;
  reputationPoints: string;
  isDisabled: boolean;
  stripeCustomerId: string | null;
  totalPointsEarned: number;
  totalPointsRedeemed: number;
}
