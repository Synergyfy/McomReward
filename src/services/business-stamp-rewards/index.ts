/**
 * Business Stamp Rewards Mock Service
 * Provides mock API functions for business stamp reward operations
 */

import { StampRewardResponse } from '@/services/stamp-rewards/types';
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
} from './types';

// Simulate network delay
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// Generate a random ID
const generateId = () => Math.random().toString(36).substring(2, 15);

// Mock database for business activated rewards
let mockBusinessStampRewards: BusinessStampReward[] = [
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

// Mock database for customer stamp cards
let mockCustomerStampCards: CustomerStampCard[] = [
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
        stampHistory: [
            { id: 'sh-1', awardedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(), triggerMethod: 'qr_scan', pointsAwarded: 10 },
            { id: 'sh-2', awardedAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString(), triggerMethod: 'qr_scan', pointsAwarded: 10 },
            { id: 'sh-3', awardedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(), triggerMethod: 'qr_scan', pointsAwarded: 10 },
            { id: 'sh-4', awardedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(), triggerMethod: 'qr_scan', pointsAwarded: 10 },
        ],
        createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
        updatedAt: new Date().toISOString(),
    },
    {
        id: 'csc-2',
        customerId: 'customer-2',
        customerName: 'Bob Smith',
        customerEmail: 'bob@example.com',
        customerAvatar: 'https://i.pravatar.cc/150?u=bob',
        businessStampRewardId: 'bsr-1',
        stampsCollected: 5,
        stampsRequired: 5,
        status: 'completed',
        stampHistory: [
            { id: 'sh-5', awardedAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(), triggerMethod: 'qr_scan', pointsAwarded: 10 },
            { id: 'sh-6', awardedAt: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000).toISOString(), triggerMethod: 'qr_scan', pointsAwarded: 10 },
            { id: 'sh-7', awardedAt: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000).toISOString(), triggerMethod: 'qr_scan', pointsAwarded: 10 },
            { id: 'sh-8', awardedAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString(), triggerMethod: 'qr_scan', pointsAwarded: 10 },
            { id: 'sh-9', awardedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(), triggerMethod: 'qr_scan', pointsAwarded: 10 },
        ],
        completedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
        createdAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
        updatedAt: new Date().toISOString(),
    },
    {
        id: 'csc-3',
        customerId: 'customer-3',
        customerName: 'Carol Davis',
        customerEmail: 'carol@example.com',
        customerAvatar: 'https://i.pravatar.cc/150?u=carol',
        businessStampRewardId: 'bsr-1',
        stampsCollected: 2,
        stampsRequired: 5,
        status: 'in_progress',
        stampHistory: [
            { id: 'sh-10', awardedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(), triggerMethod: 'qr_scan', pointsAwarded: 10 },
            { id: 'sh-11', awardedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(), triggerMethod: 'qr_scan', pointsAwarded: 10 },
        ],
        createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
        updatedAt: new Date().toISOString(),
    },
];

/**
 * Get available stamp reward templates for business to activate
 */
export const getAvailableTemplates = async (): Promise<StampRewardResponse[]> => {
    await delay(500);
    // Return only active templates that business hasn't activated yet
    const activatedTemplateIds = mockBusinessStampRewards.map(bsr => bsr.templateId);
    const allTemplates = getMockStampRewards();
    return allTemplates.filter(t =>
        t.status === 'active' && !activatedTemplateIds.includes(t.id)
    );
};

/**
 * Get business's activated stamp rewards
 */
export const getBusinessStampRewards = async (
    page: number = 1,
    limit: number = 10
): Promise<GetBusinessStampRewardsResponse> => {
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

/**
 * Activate a stamp reward template
 */
export const activateStampReward = async (
    payload: ActivateStampRewardRequest
): Promise<BusinessStampReward> => {
    await delay(600);

    const template = getMockStampRewards().find(t => t.id === payload.templateId);
    if (!template) {
        throw new Error('Template not found');
    }

    const newBusinessReward: BusinessStampReward = {
        id: generateId(),
        templateId: payload.templateId,
        businessId: 'business-123',
        template,
        customImage: payload.customImage,
        operatingHours: payload.operatingHours,
        status: 'active',
        activatedAt: new Date().toISOString(),
        customersEnrolled: 0,
        customersCompleted: 0,
        totalRedemptions: 0,
        stampsAwarded: 0,
    };

    mockBusinessStampRewards.unshift(newBusinessReward);
    return newBusinessReward;
};

/**
 * Pause an active stamp reward
 */
export const pauseStampReward = async (id: string): Promise<BusinessStampReward> => {
    await delay(400);

    const index = mockBusinessStampRewards.findIndex(bsr => bsr.id === id);
    if (index === -1) {
        throw new Error('Business stamp reward not found');
    }

    mockBusinessStampRewards[index] = {
        ...mockBusinessStampRewards[index],
        status: 'paused',
        pausedAt: new Date().toISOString(),
    };

    return mockBusinessStampRewards[index];
};

/**
 * Resume a paused stamp reward
 */
export const resumeStampReward = async (id: string): Promise<BusinessStampReward> => {
    await delay(400);

    const index = mockBusinessStampRewards.findIndex(bsr => bsr.id === id);
    if (index === -1) {
        throw new Error('Business stamp reward not found');
    }

    mockBusinessStampRewards[index] = {
        ...mockBusinessStampRewards[index],
        status: 'active',
        pausedAt: undefined,
    };

    return mockBusinessStampRewards[index];
};

/**
 * Deactivate a stamp reward (remove from business)
 */
export const deactivateStampReward = async (id: string): Promise<void> => {
    await delay(500);

    const index = mockBusinessStampRewards.findIndex(bsr => bsr.id === id);
    if (index === -1) {
        throw new Error('Business stamp reward not found');
    }

    mockBusinessStampRewards.splice(index, 1);
};

/**
 * Get customer stamp cards for a specific business stamp reward
 */
export const getCustomerStampCards = async (
    businessStampRewardId: string,
    page: number = 1,
    limit: number = 10
): Promise<GetCustomerStampCardsResponse> => {
    await delay(400);

    const filtered = mockCustomerStampCards.filter(
        csc => csc.businessStampRewardId === businessStampRewardId
    );

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
 * Award a stamp to a customer
 */
export const awardStamp = async (payload: AwardStampRequest): Promise<CustomerStampCard> => {
    await delay(500);

    // Find or create customer stamp card
    let cardIndex = mockCustomerStampCards.findIndex(
        csc => csc.businessStampRewardId === payload.businessStampRewardId &&
            csc.customerId === payload.customerId
    );

    if (cardIndex === -1) {
        // Create new stamp card for customer
        const businessReward = mockBusinessStampRewards.find(
            bsr => bsr.id === payload.businessStampRewardId
        );
        if (!businessReward) {
            throw new Error('Business stamp reward not found');
        }

        const newCard: CustomerStampCard = {
            id: generateId(),
            customerId: payload.customerId,
            customerName: 'New Customer',
            customerEmail: 'customer@example.com',
            businessStampRewardId: payload.businessStampRewardId,
            stampsCollected: 0,
            stampsRequired: businessReward.template.stampsRequired,
            status: 'in_progress',
            stampHistory: [],
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
        };

        mockCustomerStampCards.push(newCard);
        cardIndex = mockCustomerStampCards.length - 1;
    }

    const card = mockCustomerStampCards[cardIndex];

    if (card.stampsCollected >= card.stampsRequired) {
        throw new Error('Customer has already collected all stamps');
    }

    // Award the stamp
    card.stampsCollected += 1;
    card.stampHistory.push({
        id: generateId(),
        awardedAt: new Date().toISOString(),
        triggerMethod: payload.triggerMethod,
        pointsAwarded: 10,
    });
    card.updatedAt = new Date().toISOString();

    // Check if completed
    if (card.stampsCollected >= card.stampsRequired) {
        card.status = 'completed';
        card.completedAt = new Date().toISOString();

        // Update business stats
        const bsrIndex = mockBusinessStampRewards.findIndex(
            bsr => bsr.id === payload.businessStampRewardId
        );
        if (bsrIndex !== -1) {
            mockBusinessStampRewards[bsrIndex].customersCompleted += 1;
        }
    }

    // Update stamps awarded count
    const bsrIndex = mockBusinessStampRewards.findIndex(
        bsr => bsr.id === payload.businessStampRewardId
    );
    if (bsrIndex !== -1) {
        mockBusinessStampRewards[bsrIndex].stampsAwarded += 1;
    }

    mockCustomerStampCards[cardIndex] = card;
    return card;
};

/**
 * Redeem a completed stamp card
 */
export const redeemStampCard = async (payload: RedeemStampCardRequest): Promise<CustomerStampCard> => {
    await delay(500);

    const cardIndex = mockCustomerStampCards.findIndex(csc => csc.id === payload.stampCardId);
    if (cardIndex === -1) {
        throw new Error('Stamp card not found');
    }

    const card = mockCustomerStampCards[cardIndex];
    if (card.status !== 'completed') {
        throw new Error('Stamp card is not completed yet');
    }

    card.status = 'redeemed';
    card.redeemedAt = new Date().toISOString();
    card.updatedAt = new Date().toISOString();

    // Update business stats
    const bsrIndex = mockBusinessStampRewards.findIndex(
        bsr => bsr.id === card.businessStampRewardId
    );
    if (bsrIndex !== -1) {
        mockBusinessStampRewards[bsrIndex].totalRedemptions += 1;
    }

    mockCustomerStampCards[cardIndex] = card;
    return card;
};

/**
 * Get stamp reward stats for the business dashboard
 */
export const getStampRewardStats = async (): Promise<StampRewardStats> => {
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

// Export mock data for direct access
export const getMockBusinessStampRewards = () => [...mockBusinessStampRewards];
export const getMockCustomerStampCards = () => [...mockCustomerStampCards];
