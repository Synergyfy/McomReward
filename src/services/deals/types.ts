export interface CreateDealDto {
  title: string;
  description: string;
  imageUrl?: string;
  categoryId: string;
  value: number;
  startDate: Date;
  endDate: Date;
  termsAndConditions: string;
}

export interface UpdateDealDto {
  title?: string;
  description?: string;
  imageUrl?: string;
  categoryId?: string;
  value?: number;
  startDate?: Date;
  endDate?: Date;
  termsAndConditions?: string;
}

export interface DeactivateDealDto {
  isActive: boolean;
}

export interface FilterDealDto {
  status?: 'pending' | 'approved' | 'declined';
  search?: string;
  categoryId?: string;
  limit?: number;
  page?: number;
}

export interface Deal {
  id: string;
  title: string;
  description: string;
  imageUrl: string | null;
  value: number;
  startDate: Date;
  endDate: Date;
  termsAndConditions: string;
  status: 'pending' | 'approved' | 'declined';
  isActive: boolean;
  category?: {
    id: string;
    name: string;
  };
  business: {
    id: string;
    name: string;
  };
  createdAt: Date;
  updatedAt: Date;
}

export interface PaginatedDealsResponse {
  data: Deal[];
  total: number;
  currentPage: number;
  nextPage: number | null;
}
