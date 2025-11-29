import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import api from '../api';
import { AwardMatchingPointsRequest, AwardMatchingPointsResponse, ToggleMatchingPointsRequest, ToggleMatchingPointsResponse, MatchingPointsOverview, MatchingPointsHistoryResponse, MatchingPointsQueryDto } from './types';
// import { LoginResponse } from '@/services/auth/types'; // Not used in this file

// const STAFF_QUERY_KEY = 'staff'; // Incorrect, removing or commenting out
const MATCHING_POINTS_QUERY_KEY = 'matchingPoints'; // Corrected

// Create Staff
const awardMatchingPoints = async (data: AwardMatchingPointsRequest): Promise<AwardMatchingPointsResponse> => {
  const response = await api.post<AwardMatchingPointsResponse>('/admin/award-matching-points', data);
  return response;
};

export const useAwardMatchingPoints = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: awardMatchingPoints,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [MATCHING_POINTS_QUERY_KEY] });
    },
  });
};

const toggleMatchingPoints = async (data: ToggleMatchingPointsRequest): Promise<ToggleMatchingPointsResponse> => {
  const response = await api.post<ToggleMatchingPointsResponse>('/admin/toggle-matching-points', data);
  return response;
};

export const useToggleMatchingPoints = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: toggleMatchingPoints,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [MATCHING_POINTS_QUERY_KEY] });
    },
  });
};

// Get Matching Points Overview
const fetchMatchingPointsOverview = async (params: MatchingPointsQueryDto): Promise<MatchingPointsOverview> => {
  const { data } = await api.get<MatchingPointsOverview>('/business/matching-points/overview', { params });
  return data;
};

export const useGetMatchingPointsOverview = (params: MatchingPointsQueryDto = {}) => {
  return useQuery({
    queryKey: [MATCHING_POINTS_QUERY_KEY, 'overview', params.businessId],
    queryFn: () => fetchMatchingPointsOverview(params),
  });
};

// Get Matching Points History
const fetchMatchingPointsHistory = async (params: MatchingPointsQueryDto): Promise<MatchingPointsHistoryResponse> => {
  const { data } = await api.get<MatchingPointsHistoryResponse>('/business/matching-points/history', { params });
  return data;
};

export const useGetMatchingPointsHistory = (params: MatchingPointsQueryDto = {}) => {
  return useQuery({
    queryKey: [MATCHING_POINTS_QUERY_KEY, 'history', params.businessId],
    queryFn: () => fetchMatchingPointsHistory(params),
  });
};
