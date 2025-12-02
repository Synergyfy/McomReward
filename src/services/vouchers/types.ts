export interface Voucher {
  id: string;
  title: string;
  type: 'item' | 'discount' | 'ecard' | 'ticket' | 'bundle';
  value: string;
  expiry: string;
  status: 'Active' | 'Redeemed' | 'Expired' | 'Revoked';
  issuer: string; // Could be 'Admin' or specific business name/ID
  // Add any other fields that might be relevant from the backend API
  // e.g., createdAt, updatedAt, campaignId, businessId, etc.
}

export interface Paginated<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages?: number;
}

export interface VoucherQueryDto {
  page?: number;
  limit?: number;
  search?: string;
  status?: 'All' | 'Active' | 'Redeemed' | 'Expired' | 'Revoked';
  businessId?: string; // For admin impersonation
}