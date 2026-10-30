export interface SectorTemplate {
  id: string;
  name: string;
  description: string;
  sectorKey: string;
  rewards: TemplateReward[];
  campaigns: TemplateCampaign[];
  tierConfig?: TierConfig | null;
  benefits?: string[];
  isBuiltIn?: boolean;
}

export interface TemplateReward {
  id: string;
  key: string;
  name: string;
  description: string;
  rewardType: string;
  pointsRequired: number;
  stampsRequired: number;
  image: string;
  quantity?: number;
  expiryDatetime?: string;
  isCustomized?: boolean;
}

export interface TemplateCampaign {
  id: string;
  key: string;
  name: string;
  description: string;
  includedRewardKeys: string[];
}

export interface RewardCustomization {
  name: string;
  description: string;
  pointsRequired: number;
  stampsRequired: number;
  rewardType: string;
  image: string;
  quantity?: number;
  expiryDatetime?: string;
}

// ─── STEP 3: REWARD ENGINE TOGGLES ────────────────────────────────────────

export interface RewardEngineConfig {
  points: { enabled: boolean; spendAmount: number; pointsAwarded: number };
  stamps: { enabled: boolean; purchasesRequired: number; rewardEarned: string };
  visitRewards: { enabled: boolean; visitsRequired: number; rewardValue: string };
  spendRewards: { enabled: boolean; spendTarget: string; rewardValue: string };
  referralRewards: { enabled: boolean; referralReward: string; friendReward: string };
  birthdayRewards: { enabled: boolean; rewardType: string; expiryPeriod: string };
  anniversaryRewards: { enabled: boolean; rewardType: string };
}

export function defaultEngineConfig(): RewardEngineConfig {
  return {
    points: { enabled: true, spendAmount: 1, pointsAwarded: 10 },
    stamps: { enabled: false, purchasesRequired: 10, rewardEarned: "Free item" },
    visitRewards: { enabled: false, visitsRequired: 5, rewardValue: "10% off" },
    spendRewards: { enabled: false, spendTarget: "100", rewardValue: "10" },
    referralRewards: { enabled: true, referralReward: "500 points", friendReward: "10% off first visit" },
    birthdayRewards: { enabled: true, rewardType: "Free item", expiryPeriod: "30 days" },
    anniversaryRewards: { enabled: false, rewardType: "10% off" },
  };
}

// ─── STEP 4: TIER CONFIG ──────────────────────────────────────────────────

export interface TierDefinition {
  name: string;
  requirementType: "spend" | "purchases" | "points";
  requirementValue: number;
  benefits: string[];
}

export interface TierConfig {
  enabled: boolean;
  tiers: TierDefinition[];
}

// ─── PROGRESS ──────────────────────────────────────────────────────────────

export interface LoyaltySetupProgress {
  selectedCampaigns: TemplateCampaign[];
  hasSeenWelcome: boolean;
  hasSeenEcosystemIntro: boolean;
  selectedTemplateId: string | null;
  rewardCustomizations: Record<string, RewardCustomization>;
  campaignDescriptions: Record<string, string>;
  enabledEngines: RewardEngineConfig | null;
  tierConfig: TierConfig | null;
  hasCompletedSetup: boolean;
  hasSkippedOnboarding: boolean;
}

export interface SaveSetupRequest {
  selectedCampaigns: TemplateCampaign[];
  hasSeenWelcome: boolean;
  hasSeenEcosystemIntro: boolean;
  selectedTemplateId: string | null;
  rewardCustomizations: Record<string, RewardCustomization>;
  campaignDescriptions: Record<string, string>;
  enabledEngines: RewardEngineConfig | null;
  tierConfig: TierConfig | null;
}
