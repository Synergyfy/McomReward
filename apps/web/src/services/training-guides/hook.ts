import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../api';
import {
  TrainingGuide,
  CreateTrainingGuideDto,
  UpdateTrainingGuideDto,
  GetTrainingGuidesParams,
  TrainingGuideResponse,
} from './types';

const TRAINING_GUIDES_QUERY_KEY = 'trainingGuides';

const getTrainingGuides = async (params: GetTrainingGuidesParams): Promise<TrainingGuideResponse> => {
  const { data } = await api.get('/training-guides', { params });

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

const mapItems = (items: any[]): TrainingGuide[] =>
  items.map((item: any) => ({
    id: item.id,
    title: item.title,
    description: item.description,
    target_tier_id: item.target_tier_id ?? item.targetTier?.id,
    targetTier: item.targetTier ? { id: item.targetTier.id, name: item.targetTier.name } : undefined,
    videos: (item.videos ?? []).map((v: any) => ({ id: v.id, title: v.title })),
    articles: (item.articles ?? []).map((a: any) => ({ id: a.id, title: a.title })),
    createdAt: item.created_at ?? item.createdAt ?? '',
  }));

export const useGetTrainingGuides = (params: GetTrainingGuidesParams) => {
  return useQuery({
    queryKey: [TRAINING_GUIDES_QUERY_KEY, params],
    queryFn: () => getTrainingGuides(params),
  });
};

export const useCreateTrainingGuide = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (payload: CreateTrainingGuideDto) => {
      const { data } = await api.post<TrainingGuide>('/training-guides', payload);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [TRAINING_GUIDES_QUERY_KEY] });
    },
  });
};

export const useUpdateTrainingGuide = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...payload }: UpdateTrainingGuideDto & { id: string }) => {
      const { data } = await api.patch<TrainingGuide>(`/training-guides/${id}`, payload);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [TRAINING_GUIDES_QUERY_KEY] });
    },
  });
};

export const useDeleteTrainingGuide = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      await api.delete(`/training-guides/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [TRAINING_GUIDES_QUERY_KEY] });
    },
  });
};