import { useQuery } from '@tanstack/react-query';
import api from '@/services/api';
import { Paginated, Voucher, VoucherQueryDto } from './types';

const VOUCHERS_QUERY_KEY = 'vouchers';

// Fetch Vouchers
const fetchVouchers = async (params: VoucherQueryDto): Promise<Paginated<Voucher>> => {
  const { data } = await api.get<Paginated<Voucher>>('/vouchers', { params });
  return data;
};

export const useGetVouchers = (params: VoucherQueryDto) => {
  return useQuery({
    queryKey: [VOUCHERS_QUERY_KEY, params],
    queryFn: () => fetchVouchers(params),
    // Keep data fresh, but not too often for analytics-like views
    staleTime: 5 * 60 * 1000, // 5 minutes
    keepPreviousData: true,
  });
};