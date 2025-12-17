/**
 * Consumer Stamp Rewards Types
 * Types for customer-side stamp card operations
 */

import {
    StampTriggerMethod,
    RewardBenefitType,
    HybridSettings,
    StampRewardTemplateDto
} from '@/services/stamp-rewards/types';

// DTO from Business types (can be reused if exported, or redefined)
import { BusinessStampRewardDto, StampCardDto } from '@/services/business-stamp-rewards/types';

export interface StartStampCardDto {
    businessStampRewardId: string;
}

// Status of customer's stamp card
export type ConsumerStampCardStatus = 'in_progress' | 'completed' | 'redeemed' | 'expired';

// Summary info about the business offering the stamp reward
export interface StampRewardBusinessInfo {
    id: string;
    name: string;
    logo?: string;
    address?: string;
}

// The template info that the customer sees
export interface ConsumerStampRewardTemplate {
    id: string;
    title: string;
    description: string;
    stampsRequired: number;
    rewardBenefitType: RewardBenefitType;
    rewardBenefitValue: string;
    triggerMethod: StampTriggerMethod;
    stampIcon: string;
    image?: string;
    termsAndConditions?: string;
    expirationRules: {
        stampValidityDays: number | null;
        rewardClaimDays: number | null;
    };
    hybridSettings: HybridSettings;
    isRepeatable: boolean;
}

// Customer's stamp card data (Frontend View)
export interface ConsumerStampCard {
    id: string;
    customerId: string;
    businessId: string;
    business: StampRewardBusinessInfo;
    template: ConsumerStampRewardTemplate;
    stampsCollected: number;
    stampsRequired: number;
    status: ConsumerStampCardStatus;
    stampHistory: ConsumerStampHistoryItem[];
    pointsEarned: number;
    completedAt?: string;
    redeemedAt?: string;
    expiresAt?: string;
    createdAt: string;
    updatedAt: string;
}

// Individual stamp in history
export interface ConsumerStampHistoryItem {
    id: string;
    stampNumber: number;
    awardedAt: string;
    businessName: string;
    pointsAwarded?: number;
}

// Paginated response for stamp cards
export interface GetConsumerStampCardsResponse {
    data: ConsumerStampCard[];
    totalPages: number;
    currentPage: number;
    count: number;
}

// Available stamp rewards for a customer to discover
export interface DiscoverableStampReward {
    id: string;
    template: ConsumerStampRewardTemplate;
    business: StampRewardBusinessInfo;
    businessStampRewardId: string;
    hasStarted: boolean;
    currentProgress?: number;
}

// Stats for customer's stamp rewards
export interface ConsumerStampStats {
    activeCards: number;
    completedCards: number;
    redeemedRewards: number;
    totalStampsCollected: number;
    totalPointsEarned: number;
    // Missing in backend?
}

// QR code data for redemption
export interface StampCardRedemptionQR {
    stampCardId: string;
    customerId: string;
    businessId: string;
    rewardTitle: string;
    rewardValue: string;
    expiresAt: string;
    qrCode: string; // The data string to generate QR
}
