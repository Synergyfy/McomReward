import { useQuery } from '@tanstack/react-query';
import api from '../api';

export interface AdminMallPage<T = any> {
  data: T[];
  meta?: {
    itemCount: number;
    totalItems: number;
    itemsPerPage: number;
    totalPages: number;
    currentPage: number;
  };
}

const useAdminQuery = <T>(
  key: string[],
  path: string,
  params: Record<string, any> | undefined,
  enabled: boolean,
) =>
  useQuery<T>({
    queryKey: [...key, params],
    queryFn: async () => {
      const { data } = await api.get<T>(path, { params });
      return data;
    },
    enabled,
    staleTime: 60_000,
    retry: 1,
  });

export const useAdminCentralMemberships = (enabled = true) =>
  useAdminQuery<any[]>(
    ['admin-central-memberships'],
    '/rewards/admin/central/memberships',
    undefined,
    enabled,
  );

export const useAdminCentralAccessPlans = (enabled = true) =>
  useAdminQuery<any[]>(
    ['admin-central-access-plans'],
    '/rewards/admin/central/access-plans',
    undefined,
    enabled,
  );

export const useAdminMallListings = (
  params: { query?: string; page?: number; limit?: number } = {},
  enabled = true,
) =>
  useAdminQuery<AdminMallPage>(
    ['admin-mall-listings'],
    '/rewards/admin/mall/listings',
    { page: 1, limit: 50, ...params },
    enabled,
  );

export const useAdminMallProducts = (
  params: { query?: string; page?: number; limit?: number; businessId?: string } = {},
  enabled = true,
) =>
  useAdminQuery<AdminMallPage>(
    ['admin-mall-products'],
    '/rewards/admin/mall/products',
    { page: 1, limit: 100, ...params },
    enabled,
  );

export const useAdminMallServices = (
  params: { query?: string; page?: number; limit?: number; businessId?: string } = {},
  enabled = true,
) =>
  useAdminQuery<AdminMallPage>(
    ['admin-mall-services'],
    '/rewards/admin/mall/services',
    { page: 1, limit: 100, ...params },
    enabled,
  );

export const useAdminMallTemplates = (
  kind: 'gift-cards' | 'vouchers' | 'coupons',
  businessId: string | undefined,
  enabled = true,
) =>
  useAdminQuery<{ business?: any; templates: any[] }>(
    ['admin-mall-templates', kind, businessId || ''],
    '/rewards/admin/mall/templates',
    { kind, businessId },
    enabled,
  );
