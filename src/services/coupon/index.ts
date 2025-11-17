
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import api from '../api';
import { Coupon, CouponCreateInput, CouponUpdateInput } from './types';

const COUPON_QUERY_KEY = 'coupons';

// Fetch all coupons
const getCoupons = async (): Promise<Coupon[]> => {
  const { data } = await api.get('/coupon');
  return data;
};

export const useGetCoupons = () => {
  return useQuery<Coupon[], Error>({
    queryKey: [COUPON_QUERY_KEY],
    queryFn: getCoupons,
  });
};

// Create a new coupon
const createCoupon = async (couponData: CouponCreateInput): Promise<Coupon> => {
  const { data } = await api.post('/coupon', couponData);
  return data;
};

export const useCreateCoupon = () => {
  const queryClient = useQueryClient();
  return useMutation<Coupon, Error, CouponCreateInput>({
    mutationFn: createCoupon,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [COUPON_QUERY_KEY] });
    },
  });
};

// Update an existing coupon
const updateCoupon = async ({ id, ...couponData }: CouponUpdateInput & { id: string }): Promise<Coupon> => {
  const { data } = await api.patch(`/coupon/${id}`, couponData);
  return data;
};

export const useUpdateCoupon = () => {
  const queryClient = useQueryClient();
  return useMutation<Coupon, Error, CouponUpdateInput & { id: string }>({
    mutationFn: updateCoupon,
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: [COUPON_QUERY_KEY] });
      queryClient.invalidateQueries({ queryKey: [COUPON_QUERY_KEY, variables.id] });
    },
  });
};
