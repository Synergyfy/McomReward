
export interface Coupon {
  id: string;
  code: string;
  discountType: 'percentage' | 'fixed';
  discountValue: number;
  expiresAt: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CouponCreateInput {
  code: string;
  discount_type: 'percentage' | 'fixed';
  discount_value: number;
  expires_at: string;
}

export interface CouponUpdateInput {
  code?: string;
  discount_type?: 'percentage' | 'fixed';
  discount_value?: number;
  expires_at?: string;
  isActive?: boolean;
}
