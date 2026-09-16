/**
 * Consumer Stamp Rewards Service
 * 
 * Customer-side stamp operations.
 */

import apiClient from '@/services/api';
import {
    ConsumerStampCard,
    ConsumerStampStats,
    DiscoverableStampReward,
    GetConsumerStampCardsResponse,
    StampCardRedemptionQR,
    StampRewardBusinessInfo,
    ConsumerStampRewardTemplate,
    StartStampCardDto,
} from './types';
import { StampCardDto, BusinessStampRewardDto } from '@/services/business-stamp-rewards/types';
import { StampRewardTemplateDto, StampTriggerMethod, RewardBenefitType } from '@/services/stamp-rewards/types';

// --- Helpers ---

// We need to map the backend response to the frontend ConsumerStampCard structure.
// This assumes the backend response includes deeply nested relations:
// StampCard -. BusinessStampReward -. Template
// StampCard -. BusinessStampReward -. Business

export const mapTemplateDtoToConsumerTemplate = (dto: StampRewardTemplateDto): ConsumerStampRewardTemplate => {
    return {
        id: dto.id,
        title: dto.title,
        description: dto.description,
        stampsRequired: dto.requiredStamps,
        rewardBenefitType: dto.rewardBenefit?.toLowerCase() as RewardBenefitType || 'free_item',
        rewardBenefitValue: dto.rewardBenefitValue,
        triggerMethod: dto.triggerMethod?.toLowerCase() as StampTriggerMethod || 'qr_scan',
        stampIcon: '⭐', // Default
        image: dto.defaultImage,
        expirationRules: {
            stampValidityDays: dto.stampValidityDays || null,
            rewardClaimDays: dto.rewardClaimDeadlineDays || null,
        },
        hybridSettings: {
            enabled: dto.isHybrid,
            pointsPerStamp: dto.hybridPointsPerStamp || 0,
            completionBonusPoints: dto.hybridCompletionBonusPoints || 0,
            pointsFallbackEnabled: false,
        },
        isRepeatable: true,
    };
};

export const mapDtoToConsumerCard = (dto: StampCardDto): ConsumerStampCard => {
    // Fallback if relations missing
    const businessName = dto.businessStampReward?.business?.name || 'Partner Business';
    const businessId = dto.businessStampReward?.business?.id || 'unknown-business';

    // Safely map template
    const templateDto = dto.businessStampReward?.template;
    const template = templateDto
        ? mapTemplateDtoToConsumerTemplate(templateDto)
        : {
            id: 'unknown',
            title: 'Unknown Reward',
            description: '',
            stampsRequired: 10,
            rewardBenefitType: 'discount' as RewardBenefitType,
            rewardBenefitValue: '',
            triggerMethod: 'qr_scan' as StampTriggerMethod,
            stampIcon: '⭐',
            expirationRules: { stampValidityDays: null, rewardClaimDays: null },
            hybridSettings: { enabled: false, pointsPerStamp: 0, completionBonusPoints: 0, pointsFallbackEnabled: false },
            isRepeatable: true
        };

    return {
        id: dto.id,
        customerId: dto.participant?.id || '',
        businessId: businessId,
        business: {
            id: businessId,
            name: businessName,
            logo: dto.businessStampReward?.business?.logo || '',
            address: dto.businessStampReward?.business?.address || '',
        },
        template: template,
        stampsCollected: dto.current_stamps,
        stampsRequired: template.stampsRequired,
        status: dto.status?.toLowerCase() as any || 'in_progress',
        stampHistory: [],
        pointsEarned: 0,
        completedAt: dto.completed_at || undefined,
        redeemedAt: dto.redeemed_at || undefined,
        createdAt: dto.created_at || new Date().toISOString(),
        updatedAt: dto.updated_at || new Date().toISOString(),
    };
};

// --- Real API ---

/**
 * Get customer's stamp cards
 * Backend: GET /participant/stamps/my-cards
 */
export const getConsumerStampCards = async (
    status?: 'in_progress' | 'completed' | 'redeemed' | 'all',
    page: number = 1,
    limit: number = 10
): Promise<GetConsumerStampCardsResponse> => {
    const { data } = await apiClient.get<StampCardDto[]>('/participant/stamps/my-cards');

    let filtered = data.map(mapDtoToConsumerCard);

    // Client-side Filter
    if (status && status !== 'all') {
        filtered = filtered.filter(c => c.status === status);
    }

    // Client-side Pagination
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    const paginatedData = filtered.slice(startIndex, endIndex);

    return {
        data: paginatedData,
        totalPages: Math.ceil(filtered.length / limit),
        currentPage: page,
        count: filtered.length,
    };
};

/**
 * Get a single stamp card by ID
 * Backend: GET /participant/stamps/card/:id
 */
export const getConsumerStampCardById = async (id: string): Promise<ConsumerStampCard> => {
    const { data } = await apiClient.get<StampCardDto>(`/participant/stamps/card/${id}`);
    return mapDtoToConsumerCard(data);
};

export const mapDtoToDiscoverableReward = (dto: BusinessStampRewardDto): DiscoverableStampReward => {
    const business = (dto as any).business || {};
    return {
        id: dto.id,
        template: mapTemplateDtoToConsumerTemplate(dto.template),
        business: {
            id: business.id || 'unknown',
            name: business.name || 'Unknown Business',
            logo: business.logo,
            address: business.address,
        },
        businessStampRewardId: dto.id,
        hasStarted: (dto as any).hasStarted ?? false,
        currentProgress: (dto as any).currentProgress ?? 0,
    };
};

/**
 * Get discoverable stamp rewards
 * Backend: GET /participant/stamps/discover
 */
export const getDiscoverableStampRewards = async (): Promise<DiscoverableStampReward[]> => {
    const { data } = await apiClient.get<BusinessStampRewardDto[]>('/participant/stamps/discover');
    return data.map(mapDtoToDiscoverableReward);
};

/**
 * Start a new stamp card
 * Backend: POST /participant/stamps/start
 */
export const startStampCard = async (businessStampRewardId: string): Promise<ConsumerStampCard> => {
    const dto: StartStampCardDto = { businessStampRewardId };
    const { data } = await apiClient.post<StampCardDto>('/participant/stamps/start', dto);
    return mapDtoToConsumerCard(data);
};

/**
 * Get redemption QR code
 * Backend: GET /participant/stamps/card/:id/redemption-qr
 */
export const getRedemptionQR = async (stampCardId: string): Promise<StampCardRedemptionQR> => {
    const { data } = await apiClient.get<StampCardRedemptionQR>(`/participant/stamps/card/${stampCardId}/redemption-qr`);
    return data;
};

/**
 * Get consumer stamp stats
 * Backend: GET /participant/stamps/stats
 */
export const getConsumerStampStats = async (): Promise<ConsumerStampStats> => {
    const { data } = await apiClient.get<any>('/participant/stamps/stats');
    return {
        activeCards: data.activeCards || data.active_cards || 0,
        completedCards: data.completedCards || data.completed_cards || 0,
        redeemedRewards: data.redeemedRewards || data.redeemed_rewards || 0,
        totalStampsCollected: data.totalStampsCollected || data.total_stamps_collected || 0,
        totalPointsEarned: data.totalPointsEarned || data.total_points_earned || 0,
    };
};

/**
 * Get available stamp rewards for a specific business
 * Backend: GET /participant/stamps/business/:businessId
 */
export const getRewardsByBusiness = async (businessId: string): Promise<DiscoverableStampReward[]> => {
    const { data } = await apiClient.get<BusinessStampRewardDto[]>(`/participant/stamps/business/${businessId}`);
    return data.map(mapDtoToDiscoverableReward);
};