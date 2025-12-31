/**
 * Business Stamp Rewards Service
 * 
 * API functions for Business Stamp Reward Operations.
 * Integrates with the backend API while maintaining mock functions for flows not yet fully supported (e.g. scanning without QR).
 */

import apiClient from '@/services/api';
import { StampRewardResponse, StampRewardTemplateDto, StampTriggerMethod, RewardBenefitType } from '@/services/stamp-rewards/types';
import { getMockStampRewards } from '@/services/stamp-rewards';
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
    ScanParticipantQrDto,
    RedeemStampCardDto,
    StampCardDto
} from './types';

// Simulate network delay for mocks
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));
const generateId = () => Math.random().toString(36).substring(2, 15);

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
        businessId: 'current-business', // Handled by auth context usually
        template: dto.template ? mapTemplateDtoToResponse(dto.template) : ({
            id: 'unknown-template',
            title: 'Unknown Reward',
            image: '',
            stampsRequired: 0,
            status: 'draft',
            rewardBenefitValue: '',
            // ... other required props minimally mocked to prevent crash
        } as StampRewardResponse),
        customImage: dto.custom_image,
        operatingHours: dto.operating_hours,
        status: dto.is_active ? 'active' : 'paused', // Backend is_active boolean -> status
        activatedAt: new Date().toISOString(), // Missing in DTO?
        customersEnrolled: dto.total_enrolled,
        customersCompleted: dto.total_completions,
        totalRedemptions: dto.total_redemptions,
        stampsAwarded: 0, // Missing in DTO
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
        stampsRequired: (dto as any).stamps_required || 0, // Hopefully backend sends this or we need to look it up
        status: (dto.status?.toLowerCase() as any) || 'in_progress',
        stampHistory: [],
        createdAt: dto.created_at || new Date().toISOString(),
        updatedAt: dto.updated_at || new Date().toISOString(),
        completedAt: dto.completed_at,
        redeemedAt: dto.redeemed_at,
    };
};

// --- Real API Implementations ---

/**
 * Get available stamp reward templates for business to activate
 * Backend: GET /business/stamps/templates
 */
export const getAvailableTemplates = async (): Promise<StampRewardResponse[]> => {
    try {
        const { data } = await apiClient.get<StampRewardTemplateDto[]>('/business/stamps/templates');
        return data.map(mapTemplateDtoToResponse);
    } catch (error) {
        console.error('Failed to fetch available templates', error);
        // Fallback to mock
        console.warn('Falling back to mock templates');
        const activatedTemplateIds = mockBusinessStampRewards.map(bsr => bsr.templateId);
        const allTemplates = getMockStampRewards();
        return allTemplates.filter(t => t.status === 'active' && !activatedTemplateIds.includes(t.id));
    }
};

/**
 * Get business's activated stamp rewards
 * Backend: GET /business/stamps/active
 */
export const getBusinessStampRewards = async (
    page: number = 1,
    limit: number = 10
): Promise<GetBusinessStampRewardsResponse> => {
    try {
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
    } catch (error) {
        console.error('Failed to fetch active rewards', error);
        // Fallback to mock
        return getMockBusinessStampRewardsWithPagination(page, limit);
    }
};

/**
 * Activate a stamp reward template
 * Backend: POST /business/stamps/activate
 */
export const activateStampReward = async (
    payload: ActivateStampRewardRequest
): Promise<BusinessStampReward> => {
    try {
        const dto: ActivateStampRewardDto = {
            templateId: payload.templateId,
            custom_image: payload.customImage,
            operating_hours: payload.operatingHours
        };

        const { data } = await apiClient.post<BusinessStampRewardDto>('/business/stamps/activate', dto);
        return mapBusinessRewardDtoToResponse(data);
    } catch (error) {
        console.error('Failed to activate reward', error);
        throw error;
    }
};

/**
 * Get stamp reward stats for the business dashboard
 * Backend: GET /business/stamps/stats
 */
export const getStampRewardStats = async (): Promise<StampRewardStats> => {
    try {
        const { data } = await apiClient.get<BusinessStampStatsDto[]>('/business/stamps/stats');

        const totalActivated = data.length;
        const totalCustomersEnrolled = data.reduce((sum, item) => sum + item.total_enrolled, 0);
        const totalCompletions = data.reduce((sum, item) => sum + item.total_completions, 0);
        const totalRedemptions = data.reduce((sum, item) => sum + item.total_redemptions, 0);
        const totalStampsAwarded = 0; // Not available in simple stats DTO
        const redemptionRate = totalCompletions > 0 ? (totalRedemptions / totalCompletions) * 100 : 0;

        return {
            totalActivated,
            totalCustomersEnrolled,
            totalStampsAwarded,
            totalCompletions,
            totalRedemptions,
            redemptionRate: Math.round(redemptionRate * 10) / 10,
        };
    } catch (error) {
        console.error('Failed to fetch stats', error);
        // Fallback to mock
        return getMockStats();
    }
};

// --- MOCK IMPLEMENTATIONS (For endpoints requiring Code/QR or unavailable) ---

// Mock database
const mockBusinessStampRewards: BusinessStampReward[] = [
    {
        id: 'bsr-1',
        templateId: '1',
        businessId: 'business-123',
        template: getMockStampRewards()[0],
        status: 'active',
        activatedAt: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString(),
        customersEnrolled: 87,
        customersCompleted: 23,
        totalRedemptions: 19,
        stampsAwarded: 356,
    },
    {
        id: 'bsr-2',
        templateId: '4',
        businessId: 'business-123',
        template: getMockStampRewards()[3],
        status: 'active',
        activatedAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
        customersEnrolled: 42,
        customersCompleted: 8,
        totalRedemptions: 6,
        stampsAwarded: 189,
    },
];

const mockCustomerStampCards: CustomerStampCard[] = [
    {
        id: 'csc-1',
        customerId: 'customer-1',
        customerName: 'Alice Johnson',
        customerEmail: 'alice@example.com',
        customerAvatar: 'https://i.pravatar.cc/150?u=alice',
        businessStampRewardId: 'bsr-1',
        stampsCollected: 4,
        stampsRequired: 5,
        status: 'in_progress',
        stampHistory: [],
        createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
        updatedAt: new Date().toISOString(),
    },
];

const getMockBusinessStampRewardsWithPagination = async (page: number, limit: number): Promise<GetBusinessStampRewardsResponse> => {
    await delay(400);
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    const paginatedData = mockBusinessStampRewards.slice(startIndex, endIndex);
    return {
        data: paginatedData,
        totalPages: Math.ceil(mockBusinessStampRewards.length / limit),
        currentPage: page,
        count: mockBusinessStampRewards.length,
    };
};

const getMockStats = async (): Promise<StampRewardStats> => {
    await delay(300);
    const totalActivated = mockBusinessStampRewards.length;
    const totalCustomersEnrolled = mockBusinessStampRewards.reduce((sum, bsr) => sum + bsr.customersEnrolled, 0);
    const totalStampsAwarded = mockBusinessStampRewards.reduce((sum, bsr) => sum + bsr.stampsAwarded, 0);
    const totalCompletions = mockBusinessStampRewards.reduce((sum, bsr) => sum + bsr.customersCompleted, 0);
    const totalRedemptions = mockBusinessStampRewards.reduce((sum, bsr) => sum + bsr.totalRedemptions, 0);
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
    try {
        const { data } = await apiClient.post<BusinessStampRewardDto>(`/business/stamps/active/${id}/pause`);
        return mapBusinessRewardDtoToResponse(data);
    } catch (error) {
        console.error('Failed to pause reward', error);
        throw error;
    }
};

/**
 * Resume stamp reward
 * Backend: POST /business/stamps/active/:id/resume
 */
export const resumeStampReward = async (id: string): Promise<BusinessStampReward> => {
    try {
        const { data } = await apiClient.post<BusinessStampRewardDto>(`/business/stamps/active/${id}/resume`);
        return mapBusinessRewardDtoToResponse(data);
    } catch (error) {
        console.error('Failed to resume reward', error);
        throw error;
    }
};

/**
 * Deactivate stamp reward
 * Backend: DELETE /business/stamps/active/:id
 */
export const deactivateStampReward = async (id: string): Promise<void> => {
    try {
        await apiClient.delete(`/business/stamps/active/${id}`);
    } catch (error) {
        console.error('Failed to deactivate reward', error);
        throw error;
    }
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
    try {
        const { data } = await apiClient.get<StampCardDto[]>(`/business/stamps/active/${businessStampRewardId}/customers`);
        const mappedData = data.map(mapStampCardDtoToCustomerCard);

        // Client side pagination if backend doesn't support it yet
        const startIndex = (page - 1) * limit;
        const endIndex = startIndex + limit;
        const paginatedData = mappedData.slice(startIndex, endIndex);

        return {
            data: paginatedData,
            totalPages: Math.ceil(mappedData.length / limit),
            currentPage: page,
            count: mappedData.length,
        };
    } catch (error) {
        console.error('Failed to fetch customer stamp cards', error);
        // Fallback to mock
        return {
            data: [],
            totalPages: 0,
            currentPage: 1,
            count: 0
        };
    }
};

/**
 * Award a stamp
 * Backend: POST /business/stamps/scan
 */
export const awardStamp = async (payload: AwardStampRequest): Promise<CustomerStampCard> => {
    try {
        const dto: ScanParticipantQrDto = {
            businessStampRewardId: payload.businessStampRewardId,
            customerId: payload.customerId,
            participantUniqueCode: payload.participantUniqueCode
        };

        const { data } = await apiClient.post<StampCardDto>('/business/stamps/scan', dto);
        return mapStampCardDtoToCustomerCard(data);
    } catch (error) {
        console.error('Failed to award stamp', error);
        throw error;
    }
};

/**
 * Redeem stamp card
 * Backend: POST /business/stamps/redeem
 */
export const redeemStampCard = async (payload: RedeemStampCardRequest): Promise<CustomerStampCard> => {
    try {
        const dto: RedeemStampCardDto = {
            stampCardId: payload.stampCardId,
        };
        const { data } = await apiClient.post<StampCardDto>('/business/stamps/redeem', dto);
        return mapStampCardDtoToCustomerCard(data);
    } catch (error) {
        console.error('Failed to redeem stamp card', error);
        throw error;
    }
};

// Export mock data
export const getMockBusinessStampRewards = () => [...mockBusinessStampRewards];
export const getMockCustomerStampCards = () => [...mockCustomerStampCards];
