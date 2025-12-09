// --- Auth & Business DTOs ---

export interface BusinessLoginDto {
  email: string;
  password: string;
}

export interface User {
  role: string;
  name: string;
  isOnboarded: boolean;
  isEmailVerified: boolean;
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
  socialMedia?: { name: string; link: string }[];
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

// --- Business Profile ---

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
  category?: { id: string; name: string };
  socialMedia: { name: string; link: string }[];
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

export interface UpdateBusinessProfileDto {
  name?: string;
  email?: string;
  phone?: string;
  address?: string;
  website?: string;
  logoUrl?: string;
  bannerUrl?: string;
  description?: string;
  socialMedia?: { name: string; link: string }[];
}

// --- Business Balances & Feature Usage ---

export interface BusinessMonthlyBalance {
  monthlyLimit: number;
  used: number;
  remaining: number;
  extraPoints: number;
  maxBuyable: number;
}

export interface TierUsageFeature {
  limit: number;
  used: number;
  remaining: number;
}

export interface TierUsageResponse {
  tierName: string;
  features: {
    campaigns: TierUsageFeature;
    rewards: TierUsageFeature;
    teamMembers: TierUsageFeature;
    monthlyPoints: TierUsageFeature;
  };
}

// --- Business Setup Status (for onboarding guide) ---

export interface BusinessSetupStatus {
  hasReward: boolean;
  hasCampaign: boolean;
  hasStaff: boolean;
}
