import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../api';
import {
  HelpCenterArticle,
  CreateHelpCenterArticleDto,
  UpdateHelpCenterArticleDto,
  GetHelpCenterArticlesParams,
  HelpCenterArticleResponse,
} from './types';

const HELP_CENTER_ARTICLES_QUERY_KEY = 'helpCenterArticles';

const getHelpCenterArticles = async (params: GetHelpCenterArticlesParams): Promise<HelpCenterArticleResponse> => {
  const { data } = await api.get('/help-center-articles', { params });

  if (Array.isArray(data)) {
    return {
      data: mapItems(data),
      total: data.length,
      page: params.page || 1,
      limit: params.limit || 10,
      totalPages: 1,
    };
  }

  return {
    data: mapItems(data.data ?? []),
    total: data.total ?? data.data?.length ?? 0,
    page: data.page ?? params.page ?? 1,
    limit: data.limit ?? params.limit ?? 10,
    totalPages: data.totalPages ?? 1,
  };
};

const mapItems = (items: any[]): HelpCenterArticle[] =>
  items.map((item: any) => ({
    id: item.id,
    title: item.title,
    category: item.category,
    content: item.content,
    short_description: item.short_description ?? item.shortDescription ?? '',
    target_audience: item.target_audience ?? item.targetAudience ?? 'all',
    targetTiers: item.targetTiers ?? item.target_tiers ?? [],
    createdAt: item.created_at ?? item.createdAt ?? '',
  }));

export const useGetHelpCenterArticles = (params: GetHelpCenterArticlesParams) => {
  return useQuery({
    queryKey: [HELP_CENTER_ARTICLES_QUERY_KEY, params],
    queryFn: () => getHelpCenterArticles(params),
  });
};

export const useCreateHelpCenterArticle = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (payload: CreateHelpCenterArticleDto) => {
      const { data } = await api.post<HelpCenterArticle>('/help-center-articles', payload);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [HELP_CENTER_ARTICLES_QUERY_KEY] });
    },
  });
};

export const useUpdateHelpCenterArticle = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...payload }: UpdateHelpCenterArticleDto & { id: string }) => {
      const { data } = await api.patch<HelpCenterArticle>(`/help-center-articles/${id}`, payload);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [HELP_CENTER_ARTICLES_QUERY_KEY] });
    },
  });
};

export const useDeleteHelpCenterArticle = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      await api.delete(`/help-center-articles/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [HELP_CENTER_ARTICLES_QUERY_KEY] });
    },
  });
};