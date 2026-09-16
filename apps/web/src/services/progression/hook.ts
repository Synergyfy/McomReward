import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import api from '../api';
import {
    CustomerBadge,
    CreateCustomerBadgePayload,
    UpdateCustomerBadgePayload,
    OverrideBusinessTierPayload,
    OverrideCustomerBadgePayload,
    MyProgressionResponse,
    ParticipantProgressionResponse,
} from './types';

const PROGRESSION_QUERY_KEY = 'progression';
const CUSTOMER_BADGES_QUERY_KEY = 'customer-badges';

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

// --- Customer Badges (backend: participant-progression) ---

interface ParticipantBadgeDto {
    id: string;
    createdAt: string;
    updatedAt: string;
    name: string;
    priority: number;
    multiplier: number;
    benefits: string[] | null;
    minPoints: number;
    maxPoints: number | null;
    privileges: string | null;
    color: string | null;
}

const mapBadgeDtoToCustomerBadge = (dto: ParticipantBadgeDto): CustomerBadge => ({
    id: dto.id,
    name: dto.name,
    minPoints: dto.minPoints,
    maxPoints: dto.maxPoints,
    minCampaignsJoined: 0,
    maxCampaignsJoined: null,
    privileges: dto.benefits?.length
        ? dto.benefits
        : dto.privileges
            ? dto.privileges.split(',').map((s) => s.trim()).filter(Boolean)
            : [],
    description: dto.benefits?.join(', ') || dto.privileges || '',
    priority: dto.priority,
    color: dto.color,
    created_at: dto.createdAt,
    updated_at: dto.updatedAt,
});

const getCustomerBadges = async (): Promise<CustomerBadge[]> => {
    const { data } = await api.get<ParticipantBadgeDto[]>('/participant-progression/badges');
    return data.map(mapBadgeDtoToCustomerBadge);
};

export const useGetCustomerBadges = () => {
    return useQuery({
        queryKey: [CUSTOMER_BADGES_QUERY_KEY],
        queryFn: getCustomerBadges,
    });
};

const mapCreateBadgePayload = (payload: Partial<CreateCustomerBadgePayload>): Record<string, unknown> => ({
    name: payload.name,
    description: payload.description,
    minPoints: payload.minPoints,
    maxPoints: payload.maxPoints,
    benefits: payload.privileges || [],
    privileges: (payload.privileges || []).join(', '),
    color: payload.color,
});

const createCustomerBadge = async (payload: CreateCustomerBadgePayload): Promise<CustomerBadge> => {
    const badges = await getCustomerBadges();
    const nextPriority = badges.length
        ? Math.max(...badges.map((b) => b.priority)) + 1
        : 1;

    const { data } = await api.post<ParticipantBadgeDto>('/participant-progression/badges', {
        ...mapCreateBadgePayload(payload),
        priority: nextPriority,
    });
    return mapBadgeDtoToCustomerBadge(data);
};

export const useCreateCustomerBadge = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: createCustomerBadge,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: [CUSTOMER_BADGES_QUERY_KEY] });
        },
    });
};

const updateCustomerBadge = async ({ id, payload }: { id: string; payload: UpdateCustomerBadgePayload }): Promise<CustomerBadge> => {
    const { data } = await api.patch<ParticipantBadgeDto>(`/participant-progression/badges/${id}`, mapCreateBadgePayload(payload));
    return mapBadgeDtoToCustomerBadge(data);
};

export const useUpdateCustomerBadge = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: updateCustomerBadge,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: [CUSTOMER_BADGES_QUERY_KEY] });
        },
    });
};

const deleteCustomerBadge = async (id: string): Promise<void> => {
    await api.delete(`/participant-progression/badges/${id}`);
};

export const useDeleteCustomerBadge = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: deleteCustomerBadge,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: [CUSTOMER_BADGES_QUERY_KEY] });
        },
    });
};

// --- Overrides (acting admin is derived server-side from the auth token) ---

const overrideBusinessTier = async (payload: OverrideBusinessTierPayload): Promise<unknown> => {
    const { data } = await api.post('/membership/admin/override/tier', payload);
    return data;
};

export const useOverrideBusinessTier = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: overrideBusinessTier,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: [PROGRESSION_QUERY_KEY] });
        },
    });
};

const overrideCustomerBadge = async (payload: OverrideCustomerBadgePayload): Promise<unknown> => {
    const { data } = await api.post('/participant-progression/manual-promote', payload);
    return data;
};

export const useOverrideCustomerBadge = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: overrideCustomerBadge,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: [PROGRESSION_QUERY_KEY] });
        },
    });
};