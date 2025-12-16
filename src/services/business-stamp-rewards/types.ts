/**
 * Business Stamp Rewards Types
 * Types specific to business-side stamp reward operations
 */

import {
    StampRewardResponse,
    StampTriggerMethod,
    // DTOs from shared types if we want to reuse, but defining specific ones here is safer
    StampRewardTemplateDto
} from '@/services/stamp-rewards/types';

// Status of a business's activated stamp reward
export type BusinessStampRewardStatus = 'active' | 'paused' | 'expired';

// Customer stamp card status
export type CustomerStampCardStatus = 'in_progress' | 'completed' | 'redeemed' | 'expired';

// --- DTOs matching Backend API structure ---

export interface ActivateStampRewardDto {
    templateId: string;
    custom_image?: string;
    operating_hours?: string; // Backend expects string e.g. "Mon-Fri 9-5"
}

export interface BusinessStampRewardDto {
    id: string;
    template: StampRewardTemplateDto;
    // business: Business; // Define if needed, usually just ID
    custom_image: string;
    operating_hours: string;
    is_active: boolean;
    total_enrolled: number;
    total_completions: number;
    total_redemptions: number;
}

export interface ScanParticipantQrDto {
    participantUniqueCode?: string;
    customerId?: string;
    businessStampRewardId: string;
}

export interface RedeemStampCardDto {
    participantUniqueCode?: string;
    stampCardId?: string;
}

// Backend StampCard Response
export interface StampCardDto {
    id: string;
    // participant: Participant;
    // businessStampReward: BusinessStampReward; 
    current_stamps: number;
    status: 'IN_PROGRESS' | 'COMPLETED' | 'REDEEMED';
    completed_at?: string;
    redeemed_at?: string;
    created_at?: string;
    updated_at?: string;
}

export interface BusinessStampStatsDto {
    id: string;
    title: string;
    total_enrolled: number;
    total_completions: number;
    total_redemptions: number;
}

// --- Frontend Types ---

// Business specific activation settings (Frontend View)
export interface BusinessActivationSettings {
    customImage?: string;
    operatingHours?: OperatingHours;
    availabilityStart?: string;
    availabilityEnd?: string;
}

// Complex object for frontend UI handling
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
    operatingHours?: string;
    // availabilityStart/End not in backend DTO? mock support?
    availabilityStart?: string;
    availabilityEnd?: string;
}

// Business's activated stamp reward instance (Frontend View)
export interface BusinessStampReward {
    id: string;
    templateId: string;
    businessId: string;
    template: StampRewardResponse;
    customImage?: string;
    operatingHours?: string;
    status: BusinessStampRewardStatus;
    activatedAt: string;
    pausedAt?: string;
    // Analytics
    customersEnrolled: number;
    customersCompleted: number;
    totalRedemptions: number;
    stampsAwarded: number;
}

// Customer's individual stamp card (Frontend View)
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
    customerId?: string;
    participantUniqueCode?: string;
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
