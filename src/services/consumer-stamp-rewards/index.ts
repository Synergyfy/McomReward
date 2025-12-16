/**
 * Consumer Stamp Rewards Mock Service
 * Provides mock API functions for customer stamp card operations
 */

import {
    ConsumerStampCard,
    ConsumerStampStats,
    DiscoverableStampReward,
    GetConsumerStampCardsResponse,
    StampCardRedemptionQR,
} from './types';

// Simulate network delay
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// Mock customer ID
const MOCK_CUSTOMER_ID = 'customer-123';

// Mock stamp cards for the customer
let mockConsumerStampCards: ConsumerStampCard[] = [
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
    {
        id: 'csc-102',
        customerId: MOCK_CUSTOMER_ID,
        businessId: 'business-2',
        business: {
            id: 'business-2',
            name: 'Pizza Palace',
            logo: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?w=100',
            address: '456 Oak Avenue',
        },
        template: {
            id: 'template-2',
            title: 'Pizza Lovers Reward',
            description: 'Order 8 pizzas and get your 9th pizza completely free!',
            stampsRequired: 8,
            rewardBenefitType: 'free_item',
            rewardBenefitValue: 'Free Large Pizza',
            triggerMethod: 'purchase',
            stampIcon: '🍕',
            image: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=400',
            termsAndConditions: 'Cannot be combined with other offers.',
            expirationRules: { stampValidityDays: 60, rewardClaimDays: 14 },
            hybridSettings: { enabled: false, pointsPerStamp: 0, completionBonusPoints: 0, pointsFallbackEnabled: false },
            isRepeatable: true,
        },
        stampsCollected: 8,
        stampsRequired: 8,
        status: 'completed',
        stampHistory: Array.from({ length: 8 }, (_, i) => ({
            id: `sh-pizza-${i + 1}`,
            stampNumber: i + 1,
            awardedAt: new Date(Date.now() - (15 - i * 2) * 24 * 60 * 60 * 1000).toISOString(),
            businessName: 'Pizza Palace',
        })),
        pointsEarned: 0,
        completedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
        expiresAt: new Date(Date.now() + 13 * 24 * 60 * 60 * 1000).toISOString(),
        createdAt: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString(),
        updatedAt: new Date().toISOString(),
    },
    {
        id: 'csc-103',
        customerId: MOCK_CUSTOMER_ID,
        businessId: 'business-3',
        business: {
            id: 'business-3',
            name: 'Flex Gym',
            logo: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=100',
            address: '789 Fitness Blvd',
        },
        template: {
            id: 'template-3',
            title: 'Fitness Milestone',
            description: 'Show up for 12 workouts and earn a 20% discount on your next monthly membership!',
            stampsRequired: 12,
            rewardBenefitType: 'discount',
            rewardBenefitValue: '20% Off Next Month',
            triggerMethod: 'check_in',
            stampIcon: '💪',
            image: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=400',
            termsAndConditions: 'Discount applies to monthly membership only.',
            expirationRules: { stampValidityDays: null, rewardClaimDays: 14 },
            hybridSettings: { enabled: true, pointsPerStamp: 15, completionBonusPoints: 200, pointsFallbackEnabled: true },
            isRepeatable: true,
        },
        stampsCollected: 7,
        stampsRequired: 12,
        status: 'in_progress',
        stampHistory: Array.from({ length: 7 }, (_, i) => ({
            id: `sh-gym-${i + 1}`,
            stampNumber: i + 1,
            awardedAt: new Date(Date.now() - (14 - i * 2) * 24 * 60 * 60 * 1000).toISOString(),
            businessName: 'Flex Gym',
            pointsAwarded: 15,
        })),
        pointsEarned: 105,
        createdAt: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString(),
        updatedAt: new Date().toISOString(),
    },
    {
        id: 'csc-104',
        customerId: MOCK_CUSTOMER_ID,
        businessId: 'business-4',
        business: {
            id: 'business-4',
            name: 'Style Studio',
            logo: 'https://images.unsplash.com/photo-1503951914875-452162b0f3f1?w=100',
            address: '321 Fashion Lane',
        },
        template: {
            id: 'template-4',
            title: 'Haircut Loyalty Card',
            description: 'Get 6 haircuts and receive your 7th haircut absolutely free!',
            stampsRequired: 6,
            rewardBenefitType: 'free_service',
            rewardBenefitValue: 'Free Haircut',
            triggerMethod: 'qr_scan',
            stampIcon: '✂️',
            image: 'https://images.unsplash.com/photo-1503951914875-452162b0f3f1?w=400',
            termsAndConditions: 'Valid for standard haircut only.',
            expirationRules: { stampValidityDays: 120, rewardClaimDays: 30 },
            hybridSettings: { enabled: false, pointsPerStamp: 0, completionBonusPoints: 0, pointsFallbackEnabled: false },
            isRepeatable: true,
        },
        stampsCollected: 6,
        stampsRequired: 6,
        status: 'redeemed',
        stampHistory: Array.from({ length: 6 }, (_, i) => ({
            id: `sh-hair-${i + 1}`,
            stampNumber: i + 1,
            awardedAt: new Date(Date.now() - (60 - i * 10) * 24 * 60 * 60 * 1000).toISOString(),
            businessName: 'Style Studio',
        })),
        pointsEarned: 0,
        completedAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
        redeemedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
        createdAt: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000).toISOString(),
        updatedAt: new Date().toISOString(),
    },
];

// Discoverable stamp rewards (available but not yet started)
const mockDiscoverableRewards: DiscoverableStampReward[] = [
    {
        id: 'discover-1',
        businessStampRewardId: 'bsr-new-1',
        template: {
            id: 'template-spa',
            title: 'Spa Day Rewards',
            description: 'Collect stamps with every spa visit and unlock a complimentary treatment!',
            stampsRequired: 10,
            rewardBenefitType: 'free_service',
            rewardBenefitValue: 'Free 1-Hour Massage',
            triggerMethod: 'check_in',
            stampIcon: '✨',
            image: 'https://images.unsplash.com/photo-1544161515-4ab6ce6db874?w=400',
            termsAndConditions: 'Valid for Gold and Platinum members only.',
            expirationRules: { stampValidityDays: 90, rewardClaimDays: 30 },
            hybridSettings: { enabled: true, pointsPerStamp: 25, completionBonusPoints: 100, pointsFallbackEnabled: false },
            isRepeatable: true,
        },
        business: {
            id: 'business-5',
            name: 'Zen Spa & Wellness',
            logo: 'https://images.unsplash.com/photo-1544161515-4ab6ce6db874?w=100',
            address: '555 Relaxation Way',
        },
        hasStarted: false,
    },
    {
        id: 'discover-2',
        businessStampRewardId: 'bsr-new-2',
        template: {
            id: 'template-smoothie',
            title: 'Smoothie Lover',
            description: 'Buy 4 smoothies and get your 5th one free!',
            stampsRequired: 4,
            rewardBenefitType: 'free_item',
            rewardBenefitValue: 'Free Smoothie',
            triggerMethod: 'qr_scan',
            stampIcon: '🥤',
            image: 'https://images.unsplash.com/photo-1505252585461-04db1eb84625?w=400',
            expirationRules: { stampValidityDays: 21, rewardClaimDays: 7 },
            hybridSettings: { enabled: false, pointsPerStamp: 0, completionBonusPoints: 0, pointsFallbackEnabled: false },
            isRepeatable: true,
        },
        business: {
            id: 'business-6',
            name: 'Fresh Blends',
            logo: 'https://images.unsplash.com/photo-1505252585461-04db1eb84625?w=100',
            address: '100 Healthy Street',
        },
        hasStarted: false,
    },
];

/**
 * Get customer's stamp cards
 */
export const getConsumerStampCards = async (
    status?: 'in_progress' | 'completed' | 'redeemed' | 'all',
    page: number = 1,
    limit: number = 10
): Promise<GetConsumerStampCardsResponse> => {
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
};

/**
 * Get a single stamp card by ID
 */
export const getConsumerStampCardById = async (id: string): Promise<ConsumerStampCard> => {
    await delay(300);

    const card = mockConsumerStampCards.find(c => c.id === id);
    if (!card) {
        throw new Error('Stamp card not found');
    }
    return card;
};

/**
 * Get discoverable stamp rewards (available to start)
 */
export const getDiscoverableStampRewards = async (): Promise<DiscoverableStampReward[]> => {
    await delay(400);
    return mockDiscoverableRewards;
};

/**
 * Start a new stamp card (enroll in a stamp reward)
 */
export const startStampCard = async (businessStampRewardId: string): Promise<ConsumerStampCard> => {
    await delay(500);

    const discoverable = mockDiscoverableRewards.find(d => d.businessStampRewardId === businessStampRewardId);
    if (!discoverable) {
        throw new Error('Stamp reward not found');
    }

    const newCard: ConsumerStampCard = {
        id: `csc-${Date.now()}`,
        customerId: MOCK_CUSTOMER_ID,
        businessId: discoverable.business.id,
        business: discoverable.business,
        template: discoverable.template,
        stampsCollected: 0,
        stampsRequired: discoverable.template.stampsRequired,
        status: 'in_progress',
        stampHistory: [],
        pointsEarned: 0,
        expiresAt: discoverable.template.expirationRules.stampValidityDays
            ? new Date(Date.now() + discoverable.template.expirationRules.stampValidityDays * 24 * 60 * 60 * 1000).toISOString()
            : undefined,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
    };

    mockConsumerStampCards.unshift(newCard);
    return newCard;
};

/**
 * Get redemption QR code for a completed stamp card
 */
export const getRedemptionQR = async (stampCardId: string): Promise<StampCardRedemptionQR> => {
    await delay(400);

    const card = mockConsumerStampCards.find(c => c.id === stampCardId);
    if (!card) {
        throw new Error('Stamp card not found');
    }

    if (card.status !== 'completed') {
        throw new Error('Card is not ready for redemption');
    }

    // Generate mock QR code data
    const qrData = {
        stampCardId: card.id,
        customerId: card.customerId,
        businessId: card.businessId,
        rewardTitle: card.template.title,
        rewardValue: card.template.rewardBenefitValue,
        expiresAt: card.expiresAt || new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
        qrCode: `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(JSON.stringify({
            type: 'stamp_redemption',
            cardId: card.id,
            customerId: card.customerId,
            timestamp: Date.now(),
        }))}`,
    };

    return qrData;
};

/**
 * Get customer's stamp reward stats
 */
export const getConsumerStampStats = async (): Promise<ConsumerStampStats> => {
    await delay(300);

    const activeCards = mockConsumerStampCards.filter(c => c.status === 'in_progress').length;
    const completedCards = mockConsumerStampCards.filter(c => c.status === 'completed').length;
    const redeemedRewards = mockConsumerStampCards.filter(c => c.status === 'redeemed').length;
    const totalStampsCollected = mockConsumerStampCards.reduce((sum, c) => sum + c.stampsCollected, 0);
    const totalPointsEarned = mockConsumerStampCards.reduce((sum, c) => sum + c.pointsEarned, 0);

    return {
        activeCards,
        completedCards,
        redeemedRewards,
        totalStampsCollected,
        totalPointsEarned,
    };
};

// Export mock data for direct access
export const getMockConsumerStampCards = () => [...mockConsumerStampCards];
export const getMockDiscoverableRewards = () => [...mockDiscoverableRewards];
