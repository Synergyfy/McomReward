import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/services/api';
import { CreateWishlistDto, WishlistItem, Paginated, PaginationDto, WishlistAggregate } from './types';

const WISHLIST_QUERY_KEY = 'wishlist';
const WISHLIST_INSIGHTS_QUERY_KEY = 'wishlistInsights';

// --- API Functions ---

const fetchMyWishlist = async (params: PaginationDto) => {
  const { data } = await api.get<Paginated<WishlistItem>>('/wishlist/my-wishlist', {
    params,
  });
  return data;
};

const createWishlistItemFn = async (data: CreateWishlistDto) => {
  const { data: response } = await api.post<WishlistItem>('/wishlist', data);
  return response;
};

const fetchWishlistInsights = async (params: PaginationDto) => {
  const { data } = await api.get<Paginated<WishlistAggregate>>('/wishlist/business/wishlist-insights', {
    params,
  });
  return data;
};

// Placeholder for future campaign targeting (conceptual)
const createTargetedCampaignFn = async (data: any) => {
    // This is a conceptual endpoint as per documentation
    const { data: response } = await api.post('/wishlist/campaign/target-wishlist', data);
    return response;
}

// --- Hooks ---

export const useGetMyWishlist = (params: PaginationDto = { page: 1, limit: 10 }) => {
  return useQuery({
    queryKey: [WISHLIST_QUERY_KEY, params],
    queryFn: () => fetchMyWishlist(params),
  });
};

export const useCreateWishlistItem = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createWishlistItemFn,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [WISHLIST_QUERY_KEY] });
    },
  });
};

export const useGetWishlistInsights = (params: PaginationDto = { page: 1, limit: 10 }) => {
  return useQuery({
    queryKey: [WISHLIST_INSIGHTS_QUERY_KEY, params],
    queryFn: () => fetchWishlistInsights(params),
  });
};
