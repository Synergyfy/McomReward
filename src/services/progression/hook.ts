import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import api from '../api';
import {
    BusinessLevel,
    CustomerBadge,
    CreateBusinessLevelPayload,
    UpdateBusinessLevelPayload,
    CreateCustomerBadgePayload,
    UpdateCustomerBadgePayload,
    OverrideBusinessTierPayload,
    OverrideCustomerBadgePayload,
    BusinessProgression,
    CustomerProgression,
    MyProgressionResponse,
    ParticipantProgressionResponse,
} from './types';

const PROGRESSION_QUERY_KEY = 'progression';

// --- My Progression ---

const getMyProgression = async (): Promise<MyProgressionResponse> => {
    const { data } = await api.get<MyProgressionResponse>('/tier-progression/my-progression');
    return data;
};

export const useGetMyProgression = () => {
    return useQuery({
        queryKey: [PROGRESSION_QUERY_KEY, 'my-progression'],
        queryFn: getMyProgression,
    });
};

// --- Participant Progression ---

const getParticipantProgression = async (): Promise<ParticipantProgressionResponse> => {
    const { data } = await api.get<ParticipantProgressionResponse>('/participant-progression/my-progression');
    return data;
};

export const useGetParticipantProgression = () => {
    return useQuery({
        queryKey: [PROGRESSION_QUERY_KEY, 'participant-progression'],
        queryFn: getParticipantProgression,
    });
};

// --- Business Levels ---

const getBusinessLevels = async (): Promise<BusinessLevel[]> => {
    const { data } = await api.get<BusinessLevel[]>('/progression/levels');
    return data;
};

export const useGetBusinessLevels = () => {
    return useQuery({
        queryKey: [PROGRESSION_QUERY_KEY, 'levels'],
        queryFn: getBusinessLevels,
    });
};

const createBusinessLevel = async (payload: CreateBusinessLevelPayload): Promise<BusinessLevel> => {
    const { data } = await api.post<BusinessLevel>('/progression/admin/levels', payload);
    return data;
};

export const useCreateBusinessLevel = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: createBusinessLevel,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: [PROGRESSION_QUERY_KEY, 'levels'] });
        },
    });
};

const updateBusinessLevel = async ({ id, payload }: { id: string; payload: UpdateBusinessLevelPayload }): Promise<BusinessLevel> => {
    const { data } = await api.put<BusinessLevel>(`/progression/admin/levels/${id}`, payload);
    return data;
};

export const useUpdateBusinessLevel = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: updateBusinessLevel,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: [PROGRESSION_QUERY_KEY, 'levels'] });
        },
    });
};

const deleteBusinessLevel = async (id: string): Promise<void> => {
    await api.delete(`/progression/admin/levels/${id}`);
};

export const useDeleteBusinessLevel = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: deleteBusinessLevel,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: [PROGRESSION_QUERY_KEY, 'levels'] });
        },
    });
};

// --- Customer Badges ---

const getCustomerBadges = async (): Promise<CustomerBadge[]> => {
    const { data } = await api.get<CustomerBadge[]>('/participant-progression/badges');
    return data;
};

export const useGetCustomerBadges = () => {
    return useQuery({
        queryKey: [PROGRESSION_QUERY_KEY, 'badges'],
        queryFn: getCustomerBadges,
    });
};

const createCustomerBadge = async (payload: CreateCustomerBadgePayload): Promise<CustomerBadge> => {
    const { data } = await api.post<CustomerBadge>('/progression/admin/badges', payload);
    return data;
};

export const useCreateCustomerBadge = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: createCustomerBadge,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: [PROGRESSION_QUERY_KEY, 'badges'] });
        },
    });
};

const updateCustomerBadge = async ({ id, payload }: { id: string; payload: UpdateCustomerBadgePayload }): Promise<CustomerBadge> => {
    const { data } = await api.put<CustomerBadge>(`/progression/admin/badges/${id}`, payload);
    return data;
};

export const useUpdateCustomerBadge = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: updateCustomerBadge,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: [PROGRESSION_QUERY_KEY, 'badges'] });
        },
    });
};

const deleteCustomerBadge = async (id: string): Promise<void> => {
    await api.delete(`/progression/admin/badges/${id}`);
};

export const useDeleteCustomerBadge = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: deleteCustomerBadge,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: [PROGRESSION_QUERY_KEY, 'badges'] });
        },
    });
};

// --- Overrides ---

const overrideBusinessTier = async (payload: OverrideBusinessTierPayload): Promise<BusinessProgression> => {
    const { data } = await api.post<BusinessProgression>('/progression/admin/override/business', payload);
    return data;
};

export const useOverrideBusinessTier = () => {
    return useMutation({
        mutationFn: overrideBusinessTier,
    });
};

const overrideCustomerBadge = async (payload: OverrideCustomerBadgePayload): Promise<CustomerProgression> => {
    const { data } = await api.post<CustomerProgression>('/progression/admin/override/customer', payload);
    return data;
};

export const useOverrideCustomerBadge = () => {
    return useMutation({
        mutationFn: overrideCustomerBadge,
    });
};
