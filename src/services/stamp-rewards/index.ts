/**
 * Stamp Rewards Service (Mock Implementation)
 * 
 * Mock API service functions for demonstrating stamp reward templates.
 * This provides simulated backend responses for frontend development.
 */

import {
    CreateStampRewardRequest,
    UpdateStampRewardRequest,
    StampRewardResponse,
    GetStampRewardsResponse
} from './types';

// Simulate network delay
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// Generate a random ID
const generateId = () => Math.random().toString(36).substring(2, 15);

// Mock database
let mockStampRewards: StampRewardResponse[] = [
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
    {
        id: '3',
        title: 'Spa Day Rewards',
        description: 'Collect stamps with every spa visit and unlock a complimentary treatment after 10 visits.',
        stampsRequired: 10,
        rewardBenefitType: 'free_service',
        rewardBenefitValue: 'Free 1-Hour Massage',
        triggerMethod: 'check_in',
        expirationRules: { stampValidityDays: 90, rewardClaimDays: 30 },
        audience: 'all_businesses',
        sectorIds: [],
        tierIds: ['gold', 'platinum'],
        status: 'draft',
        image: 'https://images.unsplash.com/photo-1544161515-4ab6ce6db874?w=400',
        stampIcon: '✨',
        isRepeatable: true,
        hybridSettings: { enabled: true, pointsPerStamp: 25, completionBonusPoints: 100, pointsFallbackEnabled: false },
        termsAndConditions: 'Valid for Gold and Platinum members only.',
        createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
        updatedAt: new Date().toISOString(),
        createdBy: 'admin',
        businessesActivated: 0,
        customersEnrolled: 0,
        totalCompletions: 0,
        totalRedemptions: 0,
    },
    {
        id: '4',
        title: 'Fitness Milestone',
        description: 'Show up for 12 workouts and earn a 20% discount on your next monthly membership!',
        stampsRequired: 12,
        rewardBenefitType: 'discount',
        rewardBenefitValue: '20% Off Next Month',
        triggerMethod: 'check_in',
        expirationRules: { stampValidityDays: null, rewardClaimDays: 14 },
        audience: 'specific_sectors',
        sectorIds: ['fitness'],
        tierIds: [],
        status: 'active',
        image: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=400',
        stampIcon: '💪',
        isRepeatable: true,
        hybridSettings: { enabled: true, pointsPerStamp: 15, completionBonusPoints: 200, pointsFallbackEnabled: true },
        termsAndConditions: 'Discount applies to monthly membership only.',
        createdAt: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString(),
        updatedAt: new Date().toISOString(),
        createdBy: 'admin',
        businessesActivated: 15,
        customersEnrolled: 456,
        totalCompletions: 123,
        totalRedemptions: 98,
    },
    {
        id: '5',
        title: 'Haircut Loyalty Card',
        description: 'Get 6 haircuts and receive your 7th haircut absolutely free! A great way to save on your grooming.',
        stampsRequired: 6,
        rewardBenefitType: 'free_service',
        rewardBenefitValue: 'Free Haircut',
        triggerMethod: 'qr_scan',
        expirationRules: { stampValidityDays: 120, rewardClaimDays: 30 },
        audience: 'specific_sectors',
        sectorIds: ['beauty', 'salon'],
        tierIds: [],
        status: 'active',
        image: 'https://images.unsplash.com/photo-1503951914875-452162b0f3f1?w=400',
        stampIcon: '✂️',
        isRepeatable: true,
        hybridSettings: { enabled: false, pointsPerStamp: 0, completionBonusPoints: 0, pointsFallbackEnabled: false },
        termsAndConditions: 'Valid for standard haircut only.',
        createdAt: new Date(Date.now() - 21 * 24 * 60 * 60 * 1000).toISOString(),
        updatedAt: new Date().toISOString(),
        createdBy: 'admin',
        businessesActivated: 67,
        customersEnrolled: 2340,
        totalCompletions: 890,
        totalRedemptions: 823,
    },
];

/**
 * Create a new stamp reward template (Mock)
 */
export const createStampReward = async (
    payload: CreateStampRewardRequest
): Promise<StampRewardResponse> => {
    await delay(800); // Simulate network delay

    const newReward: StampRewardResponse = {
        id: generateId(),
        ...payload,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        createdBy: 'admin',
        businessesActivated: 0,
        customersEnrolled: 0,
        totalCompletions: 0,
        totalRedemptions: 0,
    };

    mockStampRewards.unshift(newReward);
    return newReward;
};

/**
 * Get all stamp reward templates with pagination (Mock)
 */
export const getStampRewards = async (
    page: number = 1,
    limit: number = 10
): Promise<GetStampRewardsResponse> => {
    await delay(500); // Simulate network delay

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
 * Get a single stamp reward template by ID (Mock)
 */
export const getStampRewardById = async (
    id: string
): Promise<StampRewardResponse> => {
    await delay(300);

    const reward = mockStampRewards.find(r => r.id === id);
    if (!reward) {
        throw new Error('Stamp reward not found');
    }
    return reward;
};

/**
 * Update an existing stamp reward template (Mock)
 */
export const updateStampReward = async (
    id: string,
    payload: Partial<UpdateStampRewardRequest>
): Promise<StampRewardResponse> => {
    await delay(600);

    const index = mockStampRewards.findIndex(r => r.id === id);
    if (index === -1) {
        throw new Error('Stamp reward not found');
    }

    mockStampRewards[index] = {
        ...mockStampRewards[index],
        ...payload,
        updatedAt: new Date().toISOString(),
    };

    return mockStampRewards[index];
};

/**
 * Delete a stamp reward template (Mock)
 */
export const deleteStampReward = async (id: string): Promise<void> => {
    await delay(500);

    const index = mockStampRewards.findIndex(r => r.id === id);
    if (index === -1) {
        throw new Error('Stamp reward not found');
    }

    mockStampRewards.splice(index, 1);
};

/**
 * Publish a draft stamp reward template (Mock)
 */
export const publishStampReward = async (
    id: string
): Promise<StampRewardResponse> => {
    await delay(400);

    const index = mockStampRewards.findIndex(r => r.id === id);
    if (index === -1) {
        throw new Error('Stamp reward not found');
    }

    mockStampRewards[index] = {
        ...mockStampRewards[index],
        status: 'active',
        updatedAt: new Date().toISOString(),
    };

    return mockStampRewards[index];
};

/**
 * Archive an active stamp reward template (Mock)
 */
export const archiveStampReward = async (
    id: string
): Promise<StampRewardResponse> => {
    await delay(400);

    const index = mockStampRewards.findIndex(r => r.id === id);
    if (index === -1) {
        throw new Error('Stamp reward not found');
    }

    mockStampRewards[index] = {
        ...mockStampRewards[index],
        status: 'archived',
        updatedAt: new Date().toISOString(),
    };

    return mockStampRewards[index];
};

/**
 * Duplicate an existing stamp reward template (Mock)
 */
export const duplicateStampReward = async (
    id: string
): Promise<StampRewardResponse> => {
    await delay(600);

    const original = mockStampRewards.find(r => r.id === id);
    if (!original) {
        throw new Error('Stamp reward not found');
    }

    const duplicated: StampRewardResponse = {
        ...original,
        id: generateId(),
        title: `Copy of ${original.title}`,
        status: 'draft',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        businessesActivated: 0,
        customersEnrolled: 0,
        totalCompletions: 0,
        totalRedemptions: 0,
    };

    mockStampRewards.unshift(duplicated);
    return duplicated;
};

// Export the mock data for direct access if needed
export const getMockStampRewards = () => [...mockStampRewards];
