import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/services/api';
import { CreateWishlistDto, UpdateWishlistDto, WishlistItem, Paginated, PaginationDto, WishlistAggregate, Category } from './types';

const WISHLIST_QUERY_KEY = 'wishlist';
const WISHLIST_INSIGHTS_QUERY_KEY = 'wishlistInsights';
const CATEGORIES_QUERY_KEY = 'categories';

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

const updateWishlistItemFn = async ({ id, data }: { id: string; data: UpdateWishlistDto }) => {
    const { data: response } = await api.patch<WishlistItem>(`/wishlist/${id}`, data);
    return response;
};

const deleteWishlistItemFn = async (id: string) => {
    await api.delete(`/wishlist/${id}`);
};

const fetchWishlistInsights = async (params: PaginationDto) => {
  const { data } = await api.get<Paginated<WishlistAggregate>>('/wishlist/business/wishlist-insights', {
    params,
  });
  return data;
};

const fetchCategories = async () => {
    const { data } = await api.get<Category[]>('/categories');
    return data;
};

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

export const useUpdateWishlistItem = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: updateWishlistItemFn,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: [WISHLIST_QUERY_KEY] });
        },
    });
};

export const useDeleteWishlistItem = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: deleteWishlistItemFn,
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

export const useGetCategories = () => {
    return useQuery({
        queryKey: [CATEGORIES_QUERY_KEY],
        queryFn: fetchCategories,
    });
};
