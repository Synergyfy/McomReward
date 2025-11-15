
export interface Tier {
  id: string;
  name: string;
  monthlyPrice: string;
  annualPrice: string;
  features: string[];
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
}

export interface TierCreateInput {
  name: string;
  monthly_price: number;
  annual_price: number;
  features: string[];
}

export interface TierUpdateInput {
  name?: string;
  monthly_price?: number;
  annual_price?: number;
  features?: string[];
}
