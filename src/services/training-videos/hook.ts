import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../api';
import { TrainingVideo, CreateTrainingVideoDto, GetTrainingVideosParams, TrainingVideoResponse } from './types';

const TRAINING_VIDEOS_QUERY_KEY = 'trainingVideos';

// Get Training Videos (List)
const getTrainingVideos = async (params: GetTrainingVideosParams): Promise<TrainingVideoResponse> => {
  const { data } = await api.get('/training-videos', { params });

  // Robust handling for various response structures
  let rawItems: any[] = [];
  let meta = {
    itemCount: 0,
    totalItems: 0,
    itemsPerPage: params.limit || 100,
    totalPages: 1,
    currentPage: params.page || 1,
  };

  if (Array.isArray(data)) {
    // Case 1: Direct array response
    rawItems = data;
    meta.totalItems = rawItems.length;
    meta.itemCount = rawItems.length;
  } else if (data && Array.isArray(data.items)) {
    // Case 2: { items: [...], meta: ... } (My initial assumption)
    rawItems = data.items;
    if (data.meta) meta = { ...meta, ...data.meta };
  } else if (data && Array.isArray(data.data)) {
    // Case 3: { data: [...], total: ..., page: ... } (Standard project pattern)
    rawItems = data.data;
    meta.totalItems = data.total || rawItems.length;
    meta.itemCount = rawItems.length;
    meta.totalPages = data.totalPages || 1;
    meta.currentPage = data.page || 1;
  }

  // Manual mapping to ensure frontend camelCase matches backend snake_case
  const mappedItems = rawItems.map((item: any) => ({
    id: item.id,
    title: item.title,
    description: item.description,
    videoUrl: item.video_url || item.videoUrl, // Handle both just in case
    coverImage: item.cover_image || item.coverImage,
    targetAudience: item.target_audience || item.targetAudience,
    targetTierIds: item.target_tier_ids || item.targetTierIds,
    createdAt: item.created_at || item.createdAt,
  }));

  return {
    items: mappedItems,
    meta,
  };
};

export const useGetTrainingVideos = (params: GetTrainingVideosParams) => {
  return useQuery({
    queryKey: [TRAINING_VIDEOS_QUERY_KEY, params],
    queryFn: () => getTrainingVideos(params),
  });
};

// Get Single Training Video
const getTrainingVideo = async (id: string): Promise<TrainingVideo> => {
  const { data } = await api.get(`/training-videos/${id}`);
  // Map single item
  return {
    id: data.id,
    title: data.title,
    description: data.description,
    videoUrl: data.video_url || data.videoUrl,
    coverImage: data.cover_image || data.coverImage,
    targetAudience: data.target_audience || data.targetAudience,
    targetTierIds: data.target_tier_ids || data.targetTierIds,
    createdAt: data.created_at || data.createdAt,
  };
};

export const useGetTrainingVideo = (id: string, enabled: boolean = true) => {
  return useQuery({
    queryKey: [TRAINING_VIDEOS_QUERY_KEY, id],
    queryFn: () => getTrainingVideo(id),
    enabled: enabled && !!id,
  });
};

// Create Training Video
const createTrainingVideo = async (payload: CreateTrainingVideoDto): Promise<TrainingVideo> => {
  const { data } = await api.post('/training-videos', payload);
  return data;
};

export const useCreateTrainingVideo = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createTrainingVideo,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [TRAINING_VIDEOS_QUERY_KEY] });
    },
  });
};

// Delete Training Video
const deleteTrainingVideo = async (id: string): Promise<void> => {
  await api.delete(`/training-videos/${id}`);
};

export const useDeleteTrainingVideo = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: deleteTrainingVideo,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [TRAINING_VIDEOS_QUERY_KEY] });
    },
  });
};
