/**
 * Stamp Reward System Types
 * 
 * These types define the structure for the Admin Stamp Reward Builder.
 * Stamp rewards are loyalty programs where customers earn stamps for actions
 * and unlock rewards upon completion.
 */

// Stamp Trigger Methods - How customers earn stamps
export type StampTriggerMethod =
    | 'qr_scan'           // Business scans customer QR to give stamp
    | 'purchase'          // Automatic after verified purchase
    | 'check_in';         // Automatic after check-in at business

// Reward Benefit Types - What customers get after completing stamps
export type RewardBenefitType =
    | 'free_item'
    | 'discount'
    | 'free_service'
    | 'bonus_points';

// Visibility/Audience for stamp rewards
export type StampAudience =
    | 'all_businesses'
    | 'specific_sectors';

// Status of a stamp reward template
export type StampRewardStatus = 'draft' | 'active' | 'archived';

// Hybrid mode settings for combining stamps with points
export interface HybridSettings {
    enabled: boolean;
    pointsPerStamp: number;           // Points awarded per stamp (default: 0)
    completionBonusPoints: number;    // Bonus points for completing the card (default: 0)
    pointsFallbackEnabled: boolean;   // Award points if stamp cannot be earned due to error
}

// Expiration rules for stamps and rewards
export interface ExpirationRules {
    stampValidityDays: number | null;     // Days before individual stamps expire (null = never)
    rewardClaimDays: number | null;       // Days to claim reward after completion (null = forever)
}

// --- DTOs matching the Backend API structure ---

// --- DTOs matching the Backend API structure ---

export interface CreateStampTemplateDto {
    title: string;
    description: string;
    required_stamps: number;
    reward_benefit: string; // 'FREE_ITEM' | 'DISCOUNT' | 'FREE_SERVICE' | 'BONUS_POINTS'
    reward_benefit_value: string;
    trigger_method: string; // 'QR_SCAN' | 'PURCHASE' | 'CHECK_IN'
    stamp_validity_days?: number;
    reward_claim_deadline_days?: number;
    is_hybrid: boolean;
    hybrid_points_per_stamp?: number;
    hybrid_completion_bonus_points?: number;
    default_image?: string;
}

export interface UpdateStampTemplateDto extends Partial<CreateStampTemplateDto> { }

export interface StampRewardTemplateDto {
    id: string;
    createdAt: string;
    updatedAt: string;
    deletedAt?: string;
    title: string;
    description: string;
    requiredStamps: number;
    rewardBenefit: string;
    rewardBenefitValue: string;
    triggerMethod: string;
    stampValidityDays?: number | null;
    rewardClaimDeadlineDays?: number | null;
    isHybrid: boolean;
    hybridPointsPerStamp: number;
    hybridCompletionBonusPoints: number;
    isPublished: boolean;
    isArchived: boolean;
    defaultImage: string;
}

// --- Frontend Types (Kept for compatibility) ---

// Request payload for creating a new stamp reward template (Frontend View)
export interface CreateStampRewardRequest {
    title: string;
    description: string;
    stampsRequired: number;
    rewardBenefitType: RewardBenefitType;
    rewardBenefitValue: string;
    triggerMethod: StampTriggerMethod;
    expirationRules: ExpirationRules;
    audience: StampAudience;
    sectorIds: string[];
    tierIds: string[];
    status: StampRewardStatus;
    image: string;
    stampIcon: string;
    isRepeatable: boolean;
    hybridSettings: HybridSettings;
    termsAndConditions: string;
}

// Request payload for updating a stamp reward template
export interface UpdateStampRewardRequest extends Partial<CreateStampRewardRequest> {
    id: string;
}

// Response from the API for a stamp reward template (Frontend View)
export interface StampRewardResponse {
    id: string;
    title: string;
    description: string;
    stampsRequired: number;
    rewardBenefitType: RewardBenefitType;
    rewardBenefitValue: string;
    triggerMethod: StampTriggerMethod;
    expirationRules: ExpirationRules;
    audience: StampAudience;
    sectorIds: string[];
    tierIds: string[];
    status: StampRewardStatus;
    image: string;
    stampIcon: string;
    isRepeatable: boolean;
    hybridSettings: HybridSettings;
    termsAndConditions: string;

    // Metadata
    createdAt: string;
    updatedAt: string;
    createdBy: string;

    // Analytics (read-only)
    businessesActivated: number;
    customersEnrolled: number;
    totalCompletions: number;
    totalRedemptions: number;
}

// Paginated response for listing stamp rewards
export interface GetStampRewardsResponse {
    data: StampRewardResponse[];
    totalPages: number;
    currentPage: number;
    count: number;
}

// Display labels for UI
export const TRIGGER_METHOD_LABELS: Record<StampTriggerMethod, string> = {
    qr_scan: 'QR Scan',
    purchase: 'Automatic After Purchase',
    check_in: 'Automatic After Check-In',
};

export const TRIGGER_METHOD_DESCRIPTIONS: Record<StampTriggerMethod, string> = {
    qr_scan: 'Business scans customer QR code to award a stamp',
    purchase: 'Stamp is automatically awarded when a verified purchase is completed',
    check_in: 'Stamp is automatically awarded when customer checks in at the business location',
};

export const BENEFIT_TYPE_LABELS: Record<RewardBenefitType, string> = {
    free_item: 'Free Item',
    discount: 'Discount',
    free_service: 'Free Service',
    bonus_points: 'Bonus Points',
};

export const BENEFIT_TYPE_ICONS: Record<RewardBenefitType, string> = {
    free_item: '🎁',
    discount: '💰',
    free_service: '✨',
    bonus_points: '⭐',
};

export const STATUS_LABELS: Record<StampRewardStatus, string> = {
    draft: 'Draft',
    active: 'Active',
    archived: 'Archived',
};
