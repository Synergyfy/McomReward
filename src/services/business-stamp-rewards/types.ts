/**
 * Business Stamp Rewards Types
 * Types specific to business-side stamp reward operations
 */

import {
    StampRewardResponse,
    StampTriggerMethod,
    RewardBenefitType,
    HybridSettings,
    ExpirationRules
} from '@/services/stamp-rewards/types';

// Status of a business's activated stamp reward
export type BusinessStampRewardStatus = 'active' | 'paused' | 'expired';

// Customer stamp card status
export type CustomerStampCardStatus = 'in_progress' | 'completed' | 'redeemed' | 'expired';

// Business-specific activation settings
export interface BusinessActivationSettings {
    customImage?: string;
    operatingHours?: OperatingHours;
    availabilityStart?: string;
    availabilityEnd?: string;
}

export interface OperatingHours {
    monday: DayHours | null;
    tuesday: DayHours | null;
    wednesday: DayHours | null;
    thursday: DayHours | null;
    friday: DayHours | null;
    saturday: DayHours | null;
    sunday: DayHours | null;
}

export interface DayHours {
    open: string;
    close: string;
}

// Request to activate a stamp reward template
export interface ActivateStampRewardRequest {
    templateId: string;
    customImage?: string;
    operatingHours?: OperatingHours;
    availabilityStart?: string;
    availabilityEnd?: string;
}

// Business's activated stamp reward instance
export interface BusinessStampReward {
    id: string;
    templateId: string;
    businessId: string;
    template: StampRewardResponse;
    customImage?: string;
    operatingHours?: OperatingHours;
    status: BusinessStampRewardStatus;
    activatedAt: string;
    pausedAt?: string;
    // Analytics
    customersEnrolled: number;
    customersCompleted: number;
    totalRedemptions: number;
    stampsAwarded: number;
}

// Customer's individual stamp card
export interface CustomerStampCard {
    id: string;
    customerId: string;
    customerName: string;
    customerEmail: string;
    customerAvatar?: string;
    businessStampRewardId: string;
    stampsCollected: number;
    stampsRequired: number;
    status: CustomerStampCardStatus;
    stampHistory: StampHistoryItem[];
    completedAt?: string;
    redeemedAt?: string;
    createdAt: string;
    updatedAt: string;
}

// Individual stamp history item
export interface StampHistoryItem {
    id: string;
    awardedAt: string;
    triggerMethod: StampTriggerMethod;
    staffId?: string;
    staffName?: string;
    pointsAwarded?: number;
}

// Request to award a stamp to a customer
export interface AwardStampRequest {
    businessStampRewardId: string;
    customerId: string;
    triggerMethod: StampTriggerMethod;
}

// Request to redeem a completed stamp card
export interface RedeemStampCardRequest {
    stampCardId: string;
    staffId?: string;
}

// Paginated response for customer stamp cards
export interface GetCustomerStampCardsResponse {
    data: CustomerStampCard[];
    totalPages: number;
    currentPage: number;
    count: number;
}

// Paginated response for business stamp rewards
export interface GetBusinessStampRewardsResponse {
    data: BusinessStampReward[];
    totalPages: number;
    currentPage: number;
    count: number;
}

// Stats for business stamp reward dashboard
export interface StampRewardStats {
    totalActivated: number;
    totalCustomersEnrolled: number;
    totalStampsAwarded: number;
    totalCompletions: number;
    totalRedemptions: number;
    redemptionRate: number;
}
