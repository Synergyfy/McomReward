/**
 * Stamp Rewards Service
 *
 * API functions for Admin Stamp Reward Templates.
 * Integrates with the backend API while maintaining mock functions for missing endpoints.
 */

import apiClient from '@/services/api';
import {
    CreateStampRewardRequest,
    UpdateStampRewardRequest,
    StampRewardResponse,
    GetStampRewardsResponse,
    CreateStampTemplateDto,
    UpdateStampTemplateDto,
    StampRewardTemplateDto,
    StampTriggerMethod,
    RewardBenefitType
} from './types';

// Simulate network delay for mocks
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// Generate a random ID for mocks
const generateId = () => Math.random().toString(36).substring(2, 15);

// Helper: Map Backend DTO to Frontend Response
const mapDtoToResponse = (dto: StampRewardTemplateDto): StampRewardResponse => {
    return {
        id: dto.id,
        title: dto.title,
        description: dto.description,
        stampsRequired: dto.requiredStamps,
        rewardBenefitType: dto.rewardBenefit?.toLowerCase() as RewardBenefitType || 'free_item',
        rewardBenefitValue: dto.rewardBenefitValue,
        triggerMethod: dto.triggerMethod?.toLowerCase() as StampTriggerMethod || 'qr_scan',
        expirationRules: {
            stampValidityDays: dto.stampValidityDays || null,
            rewardClaimDays: dto.rewardClaimDeadlineDays || null,
        },
        // These fields are not in the provided DTO, defaulting
        audience: 'all_businesses',
        sectorIds: [],
        tierIds: [],
        status: dto.isPublished ? 'active' : (dto.isArchived ? 'archived' : 'draft'),
        image: dto.defaultImage || '',
        stampIcon: '⭐', // Default
        isRepeatable: true, // Default
        hybridSettings: {
            enabled: dto.isHybrid,
            pointsPerStamp: dto.hybridPointsPerStamp || 0,
            completionBonusPoints: dto.hybridCompletionBonusPoints || 0,
            pointsFallbackEnabled: false,
        },
        termsAndConditions: '', // Default

        createdAt: dto.createdAt,
        updatedAt: dto.updatedAt,
        createdBy: 'admin', // Default

        // Analytics - Not provided in Admin Template DTO yet
        businessesActivated: 0,
        customersEnrolled: 0,
        totalCompletions: 0,
        totalRedemptions: 0,
    };
};

// Helper: Map Frontend Request to Backend DTO
const mapRequestToDto = (payload: CreateStampRewardRequest): CreateStampTemplateDto => {
    return {
        title: payload.title,
        description: payload.description,
        required_stamps: payload.stampsRequired,
        reward_benefit: payload.rewardBenefitType.toUpperCase(),
        reward_benefit_value: payload.rewardBenefitValue,
        trigger_method: payload.triggerMethod.toUpperCase(),
        stamp_validity_days: payload.expirationRules.stampValidityDays || undefined,
        reward_claim_deadline_days: payload.expirationRules.rewardClaimDays || undefined,
        is_hybrid: payload.hybridSettings.enabled,
        hybrid_points_per_stamp: payload.hybridSettings.pointsPerStamp,
        hybrid_completion_bonus_points: payload.hybridSettings.completionBonusPoints,
        default_image: payload.image,
    };
};

/**
 * Create a new stamp reward template
 * Backend: POST /admin/stamps/templates
 */
export const createStampReward = async (
    payload: CreateStampRewardRequest
): Promise<StampRewardResponse> => {
    try {
        const dto = mapRequestToDto(payload);
        const { data } = await apiClient.post<StampRewardTemplateDto>('/admin/stamps/templates', dto);
        return mapDtoToResponse(data);
    } catch (error) {
        console.error('Failed to create stamp reward template', error);
        throw error;
    }
};

/**
 * Get all stamp reward templates
 * Backend: GET /admin/stamps/templates
 * Note: Backend currently doesn't support server-side pagination in the DTO spec (returns array).
 * We will fake pagination on the client side if needed, or pass params if backend supports it later.
 */
export const getStampRewards = async (
    page: number = 1,
    limit: number = 10
): Promise<GetStampRewardsResponse> => {
    try {
        const { data } = await apiClient.get<StampRewardTemplateDto[]>('/admin/stamps/templates');

        // Client-side pagination since backend returns all
        const allRewards = data.map(mapDtoToResponse);
        const startIndex = (page - 1) * limit;
        const endIndex = startIndex + limit;
        const paginatedData = allRewards.slice(startIndex, endIndex);

        return {
            data: paginatedData,
            totalPages: Math.ceil(allRewards.length / limit),
            currentPage: page,
            count: allRewards.length,
        };
    } catch (error) {
        console.error('Failed to fetch stamp rewards', error);
        // Fallback to mock data if API fails (for dev resilience)
        console.warn('Falling back to mock data');
        return getMockStampRewardsWithPagination(page, limit);
    }
};

/**
 * Get a single stamp reward template by ID
 * Backend: GET /admin/stamps/templates/:id
 */
export const getStampRewardById = async (
    id: string
): Promise<StampRewardResponse> => {
    try {
        const { data } = await apiClient.get<StampRewardTemplateDto>(`/admin/stamps/templates/${id}`);
        return mapDtoToResponse(data);
    } catch (error) {
        console.error(`Failed to fetch stamp reward ${id}`, error);
        throw error;
    }
};

/**
 * Update an existing stamp reward template
 * Backend: PATCH /admin/stamps/templates/:id
 */
export const updateStampReward = async (
    id: string,
    payload: Partial<UpdateStampRewardRequest>
): Promise<StampRewardResponse> => {
    try {
        // Map partial payload to partial DTO
        // Constructing a partial DTO manually
        const dto: Partial<UpdateStampTemplateDto> = {};
        if (payload.title) dto.title = payload.title;
        if (payload.description) dto.description = payload.description;
        if (payload.stampsRequired) dto.required_stamps = payload.stampsRequired;
        if (payload.rewardBenefitType) dto.reward_benefit = payload.rewardBenefitType.toUpperCase();
        if (payload.rewardBenefitValue) dto.reward_benefit_value = payload.rewardBenefitValue;
        if (payload.triggerMethod) dto.trigger_method = payload.triggerMethod.toUpperCase();
        if (payload.expirationRules) {
            dto.stamp_validity_days = payload.expirationRules.stampValidityDays || undefined;
            dto.reward_claim_deadline_days = payload.expirationRules.rewardClaimDays || undefined;
        }
        if (payload.hybridSettings) {
            dto.is_hybrid = payload.hybridSettings.enabled;
            dto.hybrid_points_per_stamp = payload.hybridSettings.pointsPerStamp;
            dto.hybrid_completion_bonus_points = payload.hybridSettings.completionBonusPoints;
        }
        if (payload.image) dto.default_image = payload.image;

        const { data } = await apiClient.patch<StampRewardTemplateDto>(`/admin/stamps/templates/${id}`, dto);
        return mapDtoToResponse(data);
    } catch (error) {
        console.error(`Failed to update stamp reward ${id}`, error);
        throw error;
    }
};

/**
 * Publish a draft stamp reward template
 * Backend: POST /admin/stamps/templates/:id/publish
 */
export const publishStampReward = async (
    id: string
): Promise<StampRewardResponse> => {
    try {
        const { data } = await apiClient.post<StampRewardTemplateDto>(`/admin/stamps/templates/${id}/publish`);
        return mapDtoToResponse(data);
    } catch (error) {
        console.error(`Failed to publish stamp reward ${id}`, error);
        throw error;
    }
};

// --- MOCK FUNCTIONS (Endpoints not available in backend yet) ---

// Mock database for fallback
const mockStampRewards: StampRewardResponse[] = [
    {
        id: '1',
        title: 'Buy 5 Coffees, Get 1 Free',
        description: 'Collect 5 stamps with every coffee purchase and enjoy your 6th coffee absolutely free! Perfect for our regular customers.',
        stampsRequired: 5,
        rewardBenefitType: 'free_item',
        rewardBenefitValue: 'Free Coffee of Your Choice',
        triggerMethod: 'qr_scan',
        expirationRules: { stampValidityDays: 30, rewardClaimDays: 7 },
        audience: 'all_businesses',
        sectorIds: [],
        tierIds: [],
        status: 'active',
        image: 'https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=400',
        stampIcon: '☕',
        isRepeatable: true,
        hybridSettings: { enabled: true, pointsPerStamp: 10, completionBonusPoints: 50, pointsFallbackEnabled: true },
        termsAndConditions: 'Valid at participating locations only.',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        createdBy: 'admin',
        businessesActivated: 45,
        customersEnrolled: 1250,
        totalCompletions: 890,
        totalRedemptions: 756,
    },
    {
        id: '2',
        title: 'Pizza Lovers Reward',
        description: 'Order 8 pizzas and get your 9th pizza completely free. The more you eat, the more you save!',
        stampsRequired: 8,
        rewardBenefitType: 'free_item',
        rewardBenefitValue: 'Free Large Pizza',
        triggerMethod: 'purchase',
        expirationRules: { stampValidityDays: 60, rewardClaimDays: 14 },
        audience: 'specific_sectors',
        sectorIds: ['food-beverage'],
        tierIds: [],
        status: 'active',
        image: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=400',
        stampIcon: '🍕',
        isRepeatable: true,
        hybridSettings: { enabled: false, pointsPerStamp: 0, completionBonusPoints: 0, pointsFallbackEnabled: false },
        termsAndConditions: 'Cannot be combined with other offers.',
        createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
        updatedAt: new Date().toISOString(),
        createdBy: 'admin',
        businessesActivated: 28,
        customersEnrolled: 890,
        totalCompletions: 342,
        totalRedemptions: 298,
    },
];

const getMockStampRewardsWithPagination = async (page: number, limit: number): Promise<GetStampRewardsResponse> => {
    await delay(500);
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    const paginatedData = mockStampRewards.slice(startIndex, endIndex);
    return {
        data: paginatedData,
        totalPages: Math.ceil(mockStampRewards.length / limit),
        currentPage: page,
        count: mockStampRewards.length,
    };
};

/**
 * Delete a stamp reward template
 * Backend: DELETE /admin/stamps/templates/:id
 */
export const deleteStampReward = async (id: string): Promise<void> => {
    try {
        await apiClient.delete(`/admin/stamps/templates/${id}`);
    } catch (error) {
        console.error(`Failed to delete stamp reward ${id}`, error);
        throw error;
    }
};

/**
 * Archive an active stamp reward template
 * Backend: POST /admin/stamps/templates/:id/archive
 */
export const archiveStampReward = async (
    id: string
): Promise<StampRewardResponse> => {
    try {
        const { data } = await apiClient.post<StampRewardTemplateDto>(`/admin/stamps/templates/${id}/archive`);
        return mapDtoToResponse(data);
    } catch (error) {
        console.error(`Failed to archive stamp reward ${id}`, error);
        throw error;
    }
};

/**
 * Duplicate an existing stamp reward template
 * Backend: POST /admin/stamps/templates/:id/duplicate
 */
export const duplicateStampReward = async (
    id: string
): Promise<StampRewardResponse> => {
    try {
        const { data } = await apiClient.post<StampRewardTemplateDto>(`/admin/stamps/templates/${id}/duplicate`);
        return mapDtoToResponse(data);
    } catch (error) {
        console.error(`Failed to duplicate stamp reward ${id}`, error);
        throw error;
    }
};

// Export the mock data getter (legacy support)
export const getMockStampRewards = () => [...mockStampRewards];
