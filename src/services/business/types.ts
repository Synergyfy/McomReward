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
  referralCapacity: "12-24" | "25-49" | "50-99" | "100+";
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
  subCategoryId: string | undefined;
  sectorId: string | undefined;
  id: string;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
  name: string;
  email: string;
  phone: string;
  address: string;
  website: string;
  profileImage?: string;
  banner?: string;
  description?: string;
  category?: { id: string; name: string };
  socialMedia: { name: string; link: string }[];
  uniqueCode: string;
  role: string;
  referralCapacity: "12-24" | "25-49" | "50-99" | "100+" | number;
  affiliateCode: string;
  referralPoints: string;
  reputationPoints: string;
  isDisabled: boolean;
  stripeCustomerId: string | null;
  totalPointsEarned: number;
  totalPointsRedeemed: number;
}

export interface UpdateBusinessProfileDto {
  category: string;
  subCategory: string;
  sector: string;
  name?: string;
  email?: string;
  phone?: string;
  address?: string;
  website?: string;
  profile_image?: string;
  banner?: string | null;
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
  extraPoints: number;
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

export interface PointPackageBalance {
  totalBalance: number;
}
