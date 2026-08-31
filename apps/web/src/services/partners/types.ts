export type PartnerType = 'Co-Brand' | 'White-Label';
export type PartnerStatus = 'active' | 'inactive';

export interface BrandingPermissions {
  logo: boolean;
  colors: boolean;
  textLock: boolean;
}

export interface PerformanceMetrics {
  totalUsers: number;
  totalRewardsClaimed: number;
  revenueGenerated: number;
}

export interface Partner {
  id: string;
  name: string;
  type: PartnerType;
  status: PartnerStatus;
  brandingPermissions: BrandingPermissions;
  subdomain: string;
  domainRouting?: string;
  revenueSharing: string;
  performanceMetrics?: PerformanceMetrics;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreatePartnerDto {
  name: string;
  type: PartnerType;
  status?: PartnerStatus;
  brandingPermissions?: BrandingPermissions;
  subdomain: string;
  domainRouting?: string;
  revenueSharing: string;
  performanceMetrics?: PerformanceMetrics;
}

export type UpdatePartnerDto = Partial<CreatePartnerDto>;

export interface GetPartnersParams {
  page?: number;
  limit?: number;
  search?: string;
  type?: PartnerType;
  status?: PartnerStatus;
}

export interface PartnersResponse {
  data: Partner[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}