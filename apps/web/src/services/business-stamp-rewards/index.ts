/**
 * Business Stamp Rewards Service
 * 
 * API functions for Business Stamp Reward Operations.
 * Integrates with the backend API.
 */

import apiClient from '@/services/api';
import { StampRewardResponse, StampRewardTemplateDto, StampTriggerMethod, RewardBenefitType } from '@/services/stamp-rewards/types';
import {
    BusinessStampReward,
    CustomerStampCard,
    ActivateStampRewardRequest,
    AwardStampRequest,
    RedeemStampCardRequest,
    GetBusinessStampRewardsResponse,
    GetCustomerStampCardsResponse,
    StampRewardStats,
    ActivateStampRewardDto,
    BusinessStampRewardDto,
    BusinessStampStatsDto,
    RedeemStampCardDto,
    StampCardDto
} from './types';

// --- Helpers ---

// Map Backend Template DTO to Frontend Response (reused logic)
const mapTemplateDtoToResponse = (dto: StampRewardTemplateDto): StampRewardResponse => {
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
        audience: 'all_businesses',
        sectorIds: [],
        tierIds: [],
        status: dto.isPublished ? 'active' : (dto.isArchived ? 'archived' : 'draft'),
        image: dto.defaultImage || '',
        stampIcon: '⭐',
        isRepeatable: true,
        hybridSettings: {
            enabled: dto.isHybrid,
            pointsPerStamp: dto.hybridPointsPerStamp || 0,
            completionBonusPoints: dto.hybridCompletionBonusPoints || 0,
            pointsFallbackEnabled: false,
        },
        termsAndConditions: '',
        createdAt: dto.createdAt,
        updatedAt: dto.updatedAt,
        createdBy: 'admin',
        businessesActivated: 0,
        customersEnrolled: 0,
        totalCompletions: 0,
        totalRedemptions: 0,
    };
};

const mapBusinessRewardDtoToResponse = (dto: BusinessStampRewardDto): BusinessStampReward => {
    return {
        id: dto.id,
        templateId: dto.template.id,
        businessId: dto.business?.id || 'current-business',
        template: dto.template ? mapTemplateDtoToResponse(dto.template) : ({
            id: 'unknown-template',
            title: 'Unknown Reward',
            image: '',
            stampsRequired: 0,
            status: 'draft',
            rewardBenefitValue: '',
        } as StampRewardResponse),
        customImage: dto.custom_image,
        operatingHours: dto.operating_hours,
        status: dto.is_active ? 'active' : 'paused',
        activatedAt: dto.created_at || new Date().toISOString(),
        customersEnrolled: dto.total_enrolled,
        customersCompleted: dto.total_completions,
        totalRedemptions: dto.total_redemptions,
        stampsAwarded: 0,
    };
};

const mapStampCardDtoToCustomerCard = (dto: StampCardDto): CustomerStampCard => {
    const participant = (dto as any).participant || {};
    return {
        id: dto.id,
        customerId: participant.id || 'unknown',
        customerName: participant.name || 'Unknown Customer',
        customerEmail: participant.email || '',
        customerAvatar: participant.avatar,
        businessStampRewardId: (dto as any).business_stamp_reward_id || '',
        stampsCollected: dto.current_stamps,
        stampsRequired: (dto as any).stamps_required || 0,
        status: (dto.status?.toLowerCase() as any) || 'in_progress',
        stampHistory: [],
        createdAt: dto.created_at || new Date().toISOString(),
        updatedAt: dto.updated_at || new Date().toISOString(),
        completedAt: dto.completed_at || undefined,
        redeemedAt: dto.redeemed_at || undefined,
    };
};

// --- Real API Implementations ---

/**
 * Get available stamp reward templates for business to activate
 * Backend: GET /business/stamps/templates
 */
export const getAvailableTemplates = async (): Promise<StampRewardResponse[]> => {
    const { data } = await apiClient.get<StampRewardTemplateDto[]>('/business/stamps/templates');
    return data.map(mapTemplateDtoToResponse);
};

/**
 * Get business's activated stamp rewards
 * Backend: GET /business/stamps/active
 */
export const getBusinessStampRewards = async (
    page: number = 1,
    limit: number = 10
): Promise<GetBusinessStampRewardsResponse> => {
    const { data } = await apiClient.get<BusinessStampRewardDto[]>('/business/stamps/active');
    const mappedData = data.map(mapBusinessRewardDtoToResponse);

    // Client-side pagination
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    const paginatedData = mappedData.slice(startIndex, endIndex);

    return {
        data: paginatedData,
        totalPages: Math.ceil(mappedData.length / limit),
        currentPage: page,
        count: mappedData.length,
    };
};

/**
 * Activate a stamp reward template
 * Backend: POST /business/stamps/activate
 */
export const activateStampReward = async (
    payload: ActivateStampRewardRequest
): Promise<BusinessStampReward> => {
    const dto: ActivateStampRewardDto = {
        templateId: payload.templateId,
        custom_image: payload.customImage,
        operating_hours: payload.operatingHours
    };

    const { data } = await apiClient.post<BusinessStampRewardDto>('/business/stamps/activate', dto);
    return mapBusinessRewardDtoToResponse(data);
};

/**
 * Get stamp reward stats for the business dashboard
 * Backend: GET /business/stamps/stats
 */
export const getStampRewardStats = async (): Promise<StampRewardStats> => {
    const { data } = await apiClient.get<BusinessStampStatsDto[]>('/business/stamps/stats');

    const totalActivated = data.length;
    const totalCustomersEnrolled = data.reduce((sum, item) => sum + item.total_enrolled, 0);
    const totalCompletions = data.reduce((sum, item) => sum + item.total_completions, 0);
    const totalRedemptions = data.reduce((sum, item) => sum + item.total_redemptions, 0);
    const totalStampsAwarded = 0;
    const redemptionRate = totalCompletions > 0 ? (totalRedemptions / totalCompletions) * 100 : 0;

    return {
        totalActivated,
        totalCustomersEnrolled,
        totalStampsAwarded,
        totalCompletions,
        totalRedemptions,
        redemptionRate: Math.round(redemptionRate * 10) / 10,
    };
};

/**
 * Pause stamp reward
 * Backend: POST /business/stamps/active/:id/pause
 */
export const pauseStampReward = async (id: string): Promise<BusinessStampReward> => {
    const { data } = await apiClient.post<BusinessStampRewardDto>(`/business/stamps/active/${id}/pause`);
    return mapBusinessRewardDtoToResponse(data);
};

/**
 * Resume stamp reward
 * Backend: POST /business/stamps/active/:id/resume
 */
export const resumeStampReward = async (id: string): Promise<BusinessStampReward> => {
    const { data } = await apiClient.post<BusinessStampRewardDto>(`/business/stamps/active/${id}/resume`);
    return mapBusinessRewardDtoToResponse(data);
};

/**
 * Deactivate stamp reward
 * Backend: DELETE /business/stamps/active/:id
 */
export const deactivateStampReward = async (id: string): Promise<void> => {
    await apiClient.delete(`/business/stamps/active/${id}`);
};

/**
 * Get customer stamp cards
 * Backend: GET /business/stamps/active/:id/customers
 */
export const getCustomerStampCards = async (
    businessStampRewardId: string,
    page: number = 1,
    limit: number = 10
): Promise<GetCustomerStampCardsResponse> => {
    const { data } = await apiClient.get<StampCardDto[]>(`/business/stamps/active/${businessStampRewardId}/customers`);
    const mappedData = data.map(mapStampCardDtoToCustomerCard);

    // Client side pagination
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    const paginatedData = mappedData.slice(startIndex, endIndex);

    return {
        data: paginatedData,
        totalPages: Math.ceil(mappedData.length / limit),
        currentPage: page,
        count: mappedData.length,
    };
};

/**
 * Award a stamp
 * Backend: POST /participant-campaign-balance/award-stamps
 */
export const awardStamp = async (payload: AwardStampRequest): Promise<CustomerStampCard> => {
    const dto = {
        participantUniqueCode: payload.participantUniqueCode,
        stampCardId: payload.stampCardId,
        businessStampRewardId: payload.businessStampRewardId,
        triggerMethod: payload.triggerMethod,
    };

    const { data } = await apiClient.post<StampCardDto>('/participant-campaign-balance/award-stamps', dto);
    return mapStampCardDtoToCustomerCard(data);
};

/**
 * Redeem stamp card
 * Backend: POST /business/stamps/redeem
 */
export const redeemStampCard = async (payload: RedeemStampCardRequest): Promise<CustomerStampCard> => {
    const dto: RedeemStampCardDto = {
        stampCardId: payload.stampCardId,
        staffId: payload.staffId,
    };
    const { data } = await apiClient.post<StampCardDto>('/business/stamps/redeem', dto);
    return mapStampCardDtoToCustomerCard(data);
};