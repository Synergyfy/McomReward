export type PayoutStatus = 'Pending' | 'Paid' | 'Cancelled';
export type SaleStatus = 'Completed' | 'Canceled';

export interface PlaqueSale {
  id: string;
  plaqueId: string;
  plaqueName: string;
  sellerId: string;
  sellerName: string;
  buyerId: string;
  buyerName: string;
  saleDate: string;
  salePrice: number;
  commissionPercentage: number;
  commissionAmount: number;
  payoutStatus: PayoutStatus;
  status: SaleStatus;
}

export interface CreatePlaqueSaleDto {
  plaqueId: string;
  sellerId: string;
  sellerName: string;
  buyerId: string;
  buyerName: string;
  salePrice: number;
  commissionPercentage: number;
}

export interface GetSalesParams {
  page?: number;
  limit?: number;
  search?: string;
  sellerId?: string;
  buyerId?: string;
  payoutStatus?: PayoutStatus;
  status?: SaleStatus;
}

export interface PaginatedSalesResponse {
  data: PlaqueSale[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface SalesAnalytics {
  totalPlaquesSold: number;
  totalCommissionEarned: number;
  pendingPayouts: number;
}