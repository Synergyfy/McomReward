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

// Simulate network delay
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

const MOCK_CUSTOMER_ID = 'customer-123';

// --- Helpers ---

// We need to map the backend response to the frontend ConsumerStampCard structure.
// This assumes the backend response includes deeply nested relations:
// StampCard -. BusinessStampReward -. Template
// StampCard -. BusinessStampReward -. Business

const mapTemplateDtoToConsumerTemplate = (dto: StampRewardTemplateDto): ConsumerStampRewardTemplate => {
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

const mapDtoToConsumerCard = (dto: any): ConsumerStampCard => {
    // Note: The input 'dto' is typed as 'any' because strict typing of the nested 
    // Participant/Business relations isn't fully defined in types.ts yet 
    // and depends on actual backend response shape. 

    // Fallback Mock Data if relations missing (for resilience during dev)
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
        customerId: MOCK_CUSTOMER_ID, // Or from auth context
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
        stampHistory: [], // History not in StampCardDto shallow, maybe need fetch?
        pointsEarned: 0, // Not in DTO
        completedAt: dto.completed_at,
        redeemedAt: dto.redeemed_at,
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
    try {
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
    } catch (error) {
        console.error('Failed to fetch consumer stamp cards', error);
        return getMockConsumerStampCardsWithPagination(status, page, limit);
    }
};

/**
 * Get a single stamp card by ID
 * Backend: GET /participant/stamps/card/:id
 */
export const getConsumerStampCardById = async (id: string): Promise<ConsumerStampCard> => {
    try {
        const { data } = await apiClient.get<StampCardDto>(`/participant/stamps/card/${id}`);
        return mapDtoToConsumerCard(data);
    } catch (error) {
        console.error('Failed to fetch stamp card', error);
        throw error;
    }
};

// --- MOCK IMPLEMENTATIONS (Missing Endpoints) ---

// Mock data setup
const mockConsumerStampCards: ConsumerStampCard[] = [
    {
        id: 'csc-101',
        customerId: MOCK_CUSTOMER_ID,
        businessId: 'business-1',
        business: {
            id: 'business-1',
            name: 'Sunset Cafe',
            logo: 'https://images.unsplash.com/photo-1559925393-8be0ec4767c8?w=100',
            address: '123 Main Street',
        },
        template: {
            id: 'template-1',
            title: 'Buy 5 Coffees, Get 1 Free',
            description: 'Collect 5 stamps with every coffee purchase and enjoy your 6th coffee absolutely free!',
            stampsRequired: 5,
            rewardBenefitType: 'free_item',
            rewardBenefitValue: 'Free Coffee of Your Choice',
            triggerMethod: 'qr_scan',
            stampIcon: '☕',
            image: 'https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=400',
            termsAndConditions: 'Valid at participating locations only.',
            expirationRules: { stampValidityDays: 30, rewardClaimDays: 7 },
            hybridSettings: { enabled: true, pointsPerStamp: 10, completionBonusPoints: 50, pointsFallbackEnabled: true },
            isRepeatable: true,
        },
        stampsCollected: 3,
        stampsRequired: 5,
        status: 'in_progress',
        stampHistory: [
            { id: 'sh-1', stampNumber: 1, awardedAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(), businessName: 'Sunset Cafe', pointsAwarded: 10 },
            { id: 'sh-2', stampNumber: 2, awardedAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString(), businessName: 'Sunset Cafe', pointsAwarded: 10 },
            { id: 'sh-3', stampNumber: 3, awardedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(), businessName: 'Sunset Cafe', pointsAwarded: 10 },
        ],
        pointsEarned: 30,
        expiresAt: new Date(Date.now() + 23 * 24 * 60 * 60 * 1000).toISOString(),
        createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
        updatedAt: new Date().toISOString(),
    },
];

const getMockConsumerStampCardsWithPagination = async (status: string | undefined, page: number, limit: number) => {
    await delay(500);
    let filtered = [...mockConsumerStampCards];
    if (status && status !== 'all') {
        filtered = filtered.filter(c => c.status === status);
    }
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    const paginatedData = filtered.slice(startIndex, endIndex);
    return {
        data: paginatedData,
        totalPages: Math.ceil(filtered.length / limit),
        currentPage: page,
        count: filtered.length,
    };
}


const mapDtoToDiscoverableReward = (dto: BusinessStampRewardDto): DiscoverableStampReward => {
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
        hasStarted: false, // Backend might calculate this, otherwise logic needed
        currentProgress: 0
    };
};

/**
 * Get discoverable stamp rewards
 * Backend: GET /participant/stamps/discover
 */
export const getDiscoverableStampRewards = async (): Promise<DiscoverableStampReward[]> => {
    try {
        const { data } = await apiClient.get<BusinessStampRewardDto[]>('/participant/stamps/discover');
        return data.map(mapDtoToDiscoverableReward);
    } catch (error) {
        console.error('Failed to fetch discoverable rewards', error);
        // Fallback to empty
        return [];
    }
};

/**
 * Start a new stamp card
 * Backend: POST /participant/stamps/start
 */
export const startStampCard = async (businessStampRewardId: string): Promise<ConsumerStampCard> => {
    try {
        const dto: StartStampCardDto = { businessStampRewardId };
        const { data } = await apiClient.post<StampCardDto>('/participant/stamps/start', dto);
        return mapDtoToConsumerCard(data);
    } catch (error) {
        console.error('Failed to start stamp card', error);
        throw error;
    }
};

/**
 * Get redemption QR code (Mock)
 * Note: Should use a util to generate QR from participant unique code + card ID.
 */
export const getRedemptionQR = async (stampCardId: string): Promise<StampCardRedemptionQR> => {
    console.warn('getRedemptionQR is using MOCK');
    await delay(400);

    // Mock for demo
    const card = mockConsumerStampCards.find(c => c.id === stampCardId) ||
        (await getConsumerStampCardById(stampCardId)); // Logic might loop if API also fails.

    const qrData = {
        stampCardId: stampCardId,
        customerId: MOCK_CUSTOMER_ID,
        businessId: card?.businessId || '',
        rewardTitle: card?.template?.title || 'Reward',
        rewardValue: card?.template?.rewardBenefitValue || '',
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
        qrCode: `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(JSON.stringify({
            type: 'stamp_redemption',
            cardId: stampCardId,
            timestamp: Date.now(),
        }))}`,
    };
    return qrData;
};

/**
 * Get consumer stamp stats
 * Backend: GET /participant/stamps/stats
 */
export const getConsumerStampStats = async (): Promise<ConsumerStampStats> => {
    try {
        const { data } = await apiClient.get<any>('/participant/stamps/stats'); // Unknown DTO yet
        return {
            activeCards: data.activeCards || data.active_cards || 0,
            completedCards: data.completedCards || data.completed_cards || 0,
            redeemedRewards: data.redeemedRewards || data.redeemed_rewards || 0,
            totalStampsCollected: data.totalStampsCollected || data.total_stamps_collected || 0,
            totalPointsEarned: data.totalPointsEarned || data.total_points_earned || 0,
        };
    } catch (error) {
        console.error('Failed to fetch stats', error);
        return {
            activeCards: 0,
            completedCards: 0,
            redeemedRewards: 0,
            totalStampsCollected: 0,
            totalPointsEarned: 0
        };
    }
};

/**
 * Get available stamp rewards for a specific business
 * Backend: GET /participant/stamps/business/:businessId
 */
export const getRewardsByBusiness = async (businessId: string): Promise<DiscoverableStampReward[]> => {
    try {
        const { data } = await apiClient.get<BusinessStampRewardDto[]>(`/participant/stamps/business/${businessId}`);
        return data.map(mapDtoToDiscoverableReward);
    } catch (error) {
        console.error(`Failed to fetch rewards for business ${businessId}`, error);
        return [];
    }
};

// Export mock data
export const getMockConsumerStampCards = () => [...mockConsumerStampCards];
export const getMockDiscoverableRewards = () => [];
