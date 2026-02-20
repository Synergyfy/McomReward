import {
    CreditsRule,
    CreditsBalance,
    CreditsHistoryItem,
    CreditsLevel
} from '@/services/cashback/types';

export const mockCreditsLevels: CreditsLevel[] = [
    { level: 1, creditsNeeded: 50, matchingContribution: 25, totalCashback: 50 },
    { level: 2, creditsNeeded: 100, matchingContribution: 100, totalCashback: 200 },
    { level: 3, creditsNeeded: 200, matchingContribution: 200, totalCashback: 400 },
];

export const mockCreditsRules: CreditsRule[] = [
    {
        id: 'rule-1',
        platform: 'MCOM_LOYALTY',
        eventType: 'SERVICE_BOOKING',
        rewardType: 'PERCENTAGE',
        rewardValue: 10,
        isActive: true,
        createdAt: new Date().toISOString()
    },
    {
        id: 'rule-2',
        platform: 'MCOM_LOYALTY',
        eventType: 'PRODUCT_PURCHASE',
        rewardType: 'FIXED',
        rewardValue: 5,
        isActive: true,
        createdAt: new Date().toISOString()
    },
    {
        id: 'rule-3',
        platform: 'MCOM_MALL',
        eventType: 'CAMPAIGN_JOIN',
        rewardType: 'PERCENTAGE',
        rewardValue: 15,
        isActive: true,
        createdAt: new Date().toISOString()
    }
];

export const mockCreditsBalance: CreditsBalance = {
    credits: 60, // Almost at Level 1
    availableCashback: 50, // Existing balance from previous claims or other sources
    pendingAmount: 50,
    expiringSoon: 5.00,
    progression: {
        currentCredits: 60,
        currentLevel: 0,
        nextLevel: mockCreditsLevels[0],
        allLevels: mockCreditsLevels
    }
};

export const mockCreditsEvents: string[] = [
    'SERVICE_BOOKING',
    'PRODUCT_PURCHASE',
    'CAMPAIGN_JOIN',
    'WALLET_TOPUP',
    'REFERRAL'
];

export const mockCreditsHistory: CreditsHistoryItem[] = [
    {
        id: 'hist-1',
        amount: 15,
        type: 'CREDIT',
        unit: 'CREDITS',
        sourcePlatform: 'MCOM_LOYALTY',
        eventType: 'SERVICE_BOOKING',
        description: 'Credits earned from Booking #BK-9921',
        createdAt: new Date(Date.now() - 86400000 * 2).toISOString(),
        status: 'AVAILABLE'
    },
    {
        id: 'hist-2',
        amount: 5,
        type: 'CREDIT',
        unit: 'CREDITS',
        sourcePlatform: 'MCOM_LOYALTY',
        eventType: 'PRODUCT_PURCHASE',
        description: 'Credits earned for item purchase',
        createdAt: new Date(Date.now() - 86400000 * 5).toISOString(),
        status: 'AVAILABLE'
    },
    {
        id: 'hist-3',
        amount: -25.50,
        type: 'DEBIT',
        unit: 'GBP',
        sourcePlatform: 'MCOM_LOYALTY',
        description: 'Applied to Service Booking #BK-1002',
        createdAt: new Date(Date.now() - 86400000 * 1).toISOString(),
        status: 'REDEEMED'
    }
];

export const mockMerchantAnalytics = {
    totalIssued: 12500,
    totalRedeemed: 8400,
    redemptionRate: 67.2,
    conversionUplift: 12.5,
    monthlyIssuance: [
        { month: 'Jan', amount: 1200 },
        { month: 'Feb', amount: 1500 },
        { month: 'Mar', amount: 1300 },
        { month: 'Apr', amount: 1800 },
        { month: 'May', amount: 2100 },
    ],
    monthlyRedemption: [
        { month: 'Jan', amount: 800 },
        { month: 'Feb', amount: 950 },
        { month: 'Mar', amount: 1100 },
        { month: 'Apr', amount: 1200 },
        { month: 'May', amount: 1500 },
    ]
};
