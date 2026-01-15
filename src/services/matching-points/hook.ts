import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../api';
import {
  AwardMatchingPointsRequest,
  AwardMatchingPointsResponse,
  GetMatchingPointBalanceResponse,
  GetMatchingPointsHistoryParams,
  GetMatchingPointsHistoryResponse,
  ToggleMatchingPointsRequest,
  ToggleMatchingPointsResponse,
  EarningAction,
  CreateEarningActionDto,
  UpdateEarningActionDto,
  ParticipantBadge,
  CreateParticipantBadgeDto,
  UpdateParticipantBadgeDto,
  PaginatedRewardsResponse,
  CreateMatchingRewardDto,
  MatchingPointReward,
  PaginatedRedemptionsResponse
} from './types';

// --- Matching Points Management ---

export const useAwardMatchingPoints = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (data: AwardMatchingPointsRequest) => {
            const response = await api.post<AwardMatchingPointsResponse>('/matching-points/award', data);
            return response.data;
        },
        onSuccess: () => {
             queryClient.invalidateQueries({ queryKey: ['matchingPointBalance'] });
             queryClient.invalidateQueries({ queryKey: ['matchingPointsHistory'] });
        }
    });
};

export const useGetMatchingPointBalance = (businessId?: string) => {
    return useQuery({
        queryKey: ['matchingPointBalance', businessId],
        queryFn: async () => {
            const config = businessId ? { headers: { 'x-business-id': businessId } } : {};
            const { data } = await api.get<GetMatchingPointBalanceResponse>('/matching-points/balance', config);
            return data;
        },
    });
};

export const useGetMatchingPointsHistory = (params: GetMatchingPointsHistoryParams) => {
     return useQuery({
        queryKey: ['matchingPointsHistory', params],
        queryFn: async () => {
            const { data } = await api.get<GetMatchingPointsHistoryResponse>('/matching-points/history', { params });
            return data;
        },
    });
};

export const useToggleMatchingPoints = () => {
    return useMutation({
        mutationFn: async (data: ToggleMatchingPointsRequest) => {
            const response = await api.post<ToggleMatchingPointsResponse>('/matching-points/toggle', data);
            return response.data;
        }
    });
};


// --- Earning Actions Hooks ---

export const useGetEarningActions = () => {
    return useQuery({
        queryKey: ['earningActions'],
        queryFn: async () => {
            const { data } = await api.get<EarningAction[]>('/earning-actions');
            return data;
        }
    });
};

export const useCreateEarningAction = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (data: CreateEarningActionDto) => {
            const response = await api.post<EarningAction>('/earning-actions', data);
            return response.data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['earningActions'] });
        }
    });
};

export const useUpdateEarningAction = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async ({ id, ...data }: UpdateEarningActionDto & { id: string }) => {
            const response = await api.patch<EarningAction>(`/earning-actions/${id}`, data);
            return response.data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['earningActions'] });
        }
    });
};

export const useDeleteEarningAction = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (id: string) => {
            await api.delete(`/earning-actions/${id}`);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['earningActions'] });
        }
    });
};

// --- Participant Badges Hooks ---

export const useGetParticipantBadges = () => {
    return useQuery({
        queryKey: ['participantBadges'],
        queryFn: async () => {
            const { data } = await api.get<ParticipantBadge[]>('/participant-badges');
            return data;
        }
    });
};

export const useCreateParticipantBadge = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (data: CreateParticipantBadgeDto) => {
            const response = await api.post<ParticipantBadge>('/participant-badges', data);
            return response.data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['participantBadges'] });
        }
    });
};

export const useUpdateParticipantBadge = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async ({ id, ...data }: UpdateParticipantBadgeDto & { id: string }) => {
            const response = await api.patch<ParticipantBadge>(`/participant-badges/${id}`, data);
            return response.data;
        },
        onSuccess: () => {
             queryClient.invalidateQueries({ queryKey: ['participantBadges'] });
        }
    });
};

export const useDeleteParticipantBadge = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (id: string) => {
            await api.delete(`/participant-badges/${id}`);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['participantBadges'] });
        }
    });
};

// --- Matching Points Rewards (Super Business & Redemption) ---

// New Hook for Redemptions
export const useGetRedeemedMatchingRewards = (params: { page?: number; limit?: number } = {}) => {
  return useQuery({
    queryKey: ['matchingPointRewards', 'redeemed', params],
    queryFn: async () => {
      const { data } = await api.get<PaginatedRedemptionsResponse>('/matching-points/rewards/redeemed', { params });
      return data;
    }
  });
};

export const useCreateMatchingReward = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: CreateMatchingRewardDto) => {
      const response = await api.post('/matching-points/rewards', data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['matchingPointRewards'] });
    }
  });
};

export const useGetCreatedMatchingRewards = (params: { page?: number; limit?: number } = {}) => {
  return useQuery({
    queryKey: ['matchingPointRewards', 'created', params],
    queryFn: async () => {
      const { data } = await api.get<PaginatedRewardsResponse>('/matching-points/rewards/created', { params });
      return data;
    }
  });
};

export const useDeleteMatchingReward = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      await api.delete(`/matching-points/rewards/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['matchingPointRewards'] });
    }
  });
};

export const useSuspendMatchingReward = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      await api.patch(`/matching-points/rewards/${id}/suspend`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['matchingPointRewards'] });
    }
  });
};

export const useGetPublicMatchingRewards = (params: { target_audience?: string, page?: number, limit?: number } = {}) => {
  return useQuery({
    queryKey: ['matchingPointRewards', 'public', params],
    queryFn: async () => {
      const { data } = await api.get<PaginatedRewardsResponse>('/matching-points/rewards/public', { params });
      return data;
    }
  });
};

export const useRedeemMatchingReward = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (id: string) => {
            const { data } = await api.post(`/matching-points/rewards/${id}/redeem`);
            return data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['matchingPointRewards'] });
            queryClient.invalidateQueries({ queryKey: ['matchingPointsHistory'] });
            queryClient.invalidateQueries({ queryKey: ['matchingPointBalance'] });
        }
    });
};
