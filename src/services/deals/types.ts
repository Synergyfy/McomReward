export interface CreateDealDto {
  title: string;
  description: string;
  shortDescription: string;
  imageUrl: string;
  images: string[];
  categoryId: string;
  value: number;
  originalPrice?: number;
  dealPrice: number;
  startDate: string;
  endDate: string;
  termsAndConditions: string;
  type: 'DISCOUNT' | 'BUNDLE' | 'BOGO' | 'FLASH_SALE' | 'GIFT_CARD' | 'SERVICE_PACKAGE' | 'INTRO_OFFER' | 'SEASONAL' | 'EARLY_BIRD' | 'REFERRAL_DEAL';
  maxQuantity?: number;
  perCustomerLimit?: number;
  redemptionMethod: 'QR_SCAN' | 'VOUCHER_CODE' | 'E_CARD' | 'APPOINTMENT' | 'ONLINE_CHECKOUT';
  location?: string;
  visibility: 'PUBLIC' | 'PRIVATE';
  isReward: boolean;
  pointsCost?: number;
  pointsEarned?: number;
}

export interface UpdateDealDto {
  title?: string;
  description?: string;
  shortDescription?: string;
  imageUrl?: string;
  images?: string[];
  categoryId?: string;
  value?: number;
  originalPrice?: number;
  dealPrice?: number;
  startDate?: string;
  endDate?: string;
  termsAndConditions?: string;
  type?: 'DISCOUNT' | 'BUNDLE' | 'BOGO' | 'FLASH_SALE' | 'GIFT_CARD' | 'SERVICE_PACKAGE' | 'INTRO_OFFER' | 'SEASONAL' | 'EARLY_BIRD' | 'REFERRAL_DEAL';
  maxQuantity?: number;
  perCustomerLimit?: number;
  redemptionMethod?: 'QR_SCAN' | 'VOUCHER_CODE' | 'E_CARD' | 'APPOINTMENT' | 'ONLINE_CHECKOUT';
  location?: string;
  visibility?: 'PUBLIC' | 'PRIVATE';
  isReward?: boolean;
  pointsCost?: number;
  pointsEarned?: number;
}

export interface DeactivateDealDto {
  isActive: boolean;
}

export interface FilterDealDto {
  status?: 'pending' | 'approved' | 'declined' | 'flagged';
  search?: string;
  categoryId?: string;
  location?: string;
  minPrice?: number;
  maxPrice?: number;
  type?: string;
  limit?: number;
  page?: number;
}

export interface Deal {
  id: string;
  title: string;
  description: string;
  shortDescription: string | null;
  imageUrl: string | null;
  images: string[];
  value: number;
  originalPrice: number | null;
  dealPrice: number;
  startDate: string;
  endDate: string;
  termsAndConditions: string;
  status: 'pending' | 'approved' | 'declined' | 'flagged';
  isApproved: boolean;
  isActive: boolean;
  isFeatured: boolean;
  visibility: 'PUBLIC' | 'PRIVATE';
  type: string;
  maxQuantity: number | null;
  soldQuantity: number;
  perCustomerLimit: number | null;
  redemptionMethod: string;
  location: string | null;
  isReward: boolean;
  pointsCost: number | null;
  pointsEarned: number;
  category?: {
    id: string;
    name: string;
  };
  business: {
    id: string;
    name: string;
    email?: string;
    phone?: string;
    address?: string;
    website?: string;
    sector?: {
      id: string;
      name: string;
    };
  };
  createdAt: string;
  updatedAt: string;
}

export interface UpdateDealStatusDto {
  status: 'approved' | 'declined' | 'pending' | 'flagged';
}

export interface PaginatedDealsResponse {
  data: Deal[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  nextPage: number | null;
  prevPage: number | null;
}