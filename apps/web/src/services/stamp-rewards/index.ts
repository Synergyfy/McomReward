/**
 * Stamp Rewards Service
 *
 * API functions for Admin Stamp Reward Templates.
 * Integrates with the backend API.
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
    const dto = mapRequestToDto(payload);
    const { data } = await apiClient.post<StampRewardTemplateDto>('/admin/stamps/templates', dto);
    return mapDtoToResponse(data);
};

/**
 * Get all stamp reward templates
 * Backend: GET /admin/stamps/templates
 */
export const getStampRewards = async (
    page: number = 1,
    limit: number = 10
): Promise<GetStampRewardsResponse> => {
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
};

/**
 * Get a single stamp reward template by ID
 * Backend: GET /admin/stamps/templates/:id
 */
export const getStampRewardById = async (
    id: string
): Promise<StampRewardResponse> => {
    const { data } = await apiClient.get<StampRewardTemplateDto>(`/admin/stamps/templates/${id}`);
    return mapDtoToResponse(data);
};

/**
 * Update an existing stamp reward template
 * Backend: PATCH /admin/stamps/templates/:id
 */
export const updateStampReward = async (
    id: string,
    payload: Partial<UpdateStampRewardRequest>
): Promise<StampRewardResponse> => {
    // Map partial payload to partial DTO
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
};

/**
 * Publish a draft stamp reward template
 * Backend: POST /admin/stamps/templates/:id/publish
 */
export const publishStampReward = async (
    id: string
): Promise<StampRewardResponse> => {
    const { data } = await apiClient.post<StampRewardTemplateDto>(`/admin/stamps/templates/${id}/publish`);
    return mapDtoToResponse(data);
};

/**
 * Delete a stamp reward template
 * Backend: DELETE /admin/stamps/templates/:id
 */
export const deleteStampReward = async (id: string): Promise<void> => {
    await apiClient.delete(`/admin/stamps/templates/${id}`);
};

/**
 * Archive an active stamp reward template
 * Backend: POST /admin/stamps/templates/:id/archive
 */
export const archiveStampReward = async (
    id: string
): Promise<StampRewardResponse> => {
    const { data } = await apiClient.post<StampRewardTemplateDto>(`/admin/stamps/templates/${id}/archive`);
    return mapDtoToResponse(data);
};

/**
 * Duplicate an existing stamp reward template
 * Backend: POST /admin/stamps/templates/:id/duplicate
 */
export const duplicateStampReward = async (
    id: string
): Promise<StampRewardResponse> => {
    const { data } = await apiClient.post<StampRewardTemplateDto>(`/admin/stamps/templates/${id}/duplicate`);
    return mapDtoToResponse(data);
};