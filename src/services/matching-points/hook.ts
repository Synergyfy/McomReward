import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import api from '../api';
import {
  AwardMatchingPointsRequest, AwardMatchingPointsResponse, ToggleMatchingPointsRequest, ToggleMatchingPointsResponse,
  GetMatchingPointBalanceResponse, GetMatchingPointsHistoryParams, GetMatchingPointsHistoryResponse,
  EarningAction, CreateEarningActionDto, UpdateEarningActionDto, ParticipantBadge, CreateParticipantBadgeDto, UpdateParticipantBadgeDto
} from './types';
// import { LoginResponse } from '@/services/auth/types'; // Not used in this file

// const STAFF_QUERY_KEY = 'staff'; // Incorrect, removing or commenting out
const MATCHING_POINTS_QUERY_KEY = 'matchingPoints'; // Corrected

// Create Staff
const awardMatchingPoints = async (data: AwardMatchingPointsRequest): Promise<AwardMatchingPointsResponse> => {
  const response = await api.post<AwardMatchingPointsResponse>('/admin/award-matching-points', data);
  return response.data;
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
  return response.data;
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

// Get Matching Point Balance
const fetchMatchingPointBalance = async (): Promise<GetMatchingPointBalanceResponse> => {
  const { data } = await api.get<GetMatchingPointBalanceResponse>('/matching-points/balance');
  return data;
};

export const useGetMatchingPointBalance = () => {
  return useQuery({
    queryKey: [MATCHING_POINTS_QUERY_KEY, 'balance'],
    queryFn: fetchMatchingPointBalance,
  });
};

// Get Matching Points History
const fetchMatchingPointsHistory = async (params: GetMatchingPointsHistoryParams): Promise<GetMatchingPointsHistoryResponse> => {
  const { data } = await api.get<GetMatchingPointsHistoryResponse>('/matching-points/history', { params });
  return data;
};

export const useGetMatchingPointsHistory = (params: GetMatchingPointsHistoryParams = {}) => {
  return useQuery({
    queryKey: [MATCHING_POINTS_QUERY_KEY, 'history', params],
    queryFn: () => fetchMatchingPointsHistory(params),
  });
};

// Get Earning Actions
const fetchEarningActions = async (): Promise<EarningAction[]> => {
  const { data } = await api.get<EarningAction[]>('/participant-progression/earning-actions');
  return data;
};

export const useGetEarningActions = () => {
  return useQuery({
    queryKey: ['earning-actions'],
    queryFn: fetchEarningActions,
  });
};

// Create Earning Action
const createEarningAction = async (data: CreateEarningActionDto): Promise<EarningAction> => {
  const response = await api.post<EarningAction>('/participant-progression/earning-actions', data);
  return response.data;
};

export const useCreateEarningAction = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createEarningAction,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['earning-actions'] });
    }
  });
};

// Update Earning Action
const updateEarningAction = async ({ id, payload }: { id: string, payload: UpdateEarningActionDto }): Promise<EarningAction> => {
  const response = await api.patch<EarningAction>(`/participant-progression/earning-actions/${id}`, payload);
  return response.data;
};

export const useUpdateEarningAction = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: updateEarningAction,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['earning-actions'] });
    }
  });
};

// Get Participant Badges
const fetchParticipantBadges = async (): Promise<ParticipantBadge[]> => {
  const { data } = await api.get<ParticipantBadge[]>('/participant-progression/badges');
  return data;
};

export const useGetParticipantBadges = () => {
  return useQuery({
    queryKey: ['participant-badges'],
    queryFn: fetchParticipantBadges,
  });
};

// Create Participant Badge
const createParticipantBadge = async (data: CreateParticipantBadgeDto): Promise<ParticipantBadge> => {
  const response = await api.post<ParticipantBadge>('/participant-progression/badges', data);
  return response.data;
};

export const useCreateParticipantBadge = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createParticipantBadge,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['participant-badges'] });
    }
  });
};

// Update Participant Badge
const updateParticipantBadge = async ({ id, payload }: { id: string, payload: UpdateParticipantBadgeDto }): Promise<ParticipantBadge> => {
  const response = await api.patch<ParticipantBadge>(`/participant-progression/badges/${id}`, payload);
  return response.data;
};

export const useUpdateParticipantBadge = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: updateParticipantBadge,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['participant-badges'] });
    }
  });
};
