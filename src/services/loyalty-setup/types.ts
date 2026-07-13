export interface SectorTemplate {
  id: string;
  name: string;
  description: string;
  sectorKey: string;
  rewards: TemplateReward[];
  campaigns: TemplateCampaign[];
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

export function defaultTierConfig(): TierConfig {
  return {
    enabled: false,
    tiers: [
      { name: "Bronze", requirementType: "points", requirementValue: 0, benefits: ["Earn 1x points", "Birthday reward"] },
      { name: "Silver", requirementType: "points", requirementValue: 500, benefits: ["Earn 1.5x points", "Early access to offers"] },
      { name: "Gold", requirementType: "points", requirementValue: 1500, benefits: ["Earn 2x points", "VIP offers", "Free delivery"] },
      { name: "Platinum", requirementType: "points", requirementValue: 5000, benefits: ["Earn 3x points", "Personal manager", "Exclusive events"] },
    ],
  };
}

// ─── PROGRESS ──────────────────────────────────────────────────────────────

export interface LoyaltySetupProgress {
  hasSeenWelcome: boolean;
  hasSeenEcosystemIntro: boolean;
  selectedTemplateId: string | null;
  rewardCustomizations: Record<string, RewardCustomization>;
  campaignDescriptions: Record<string, string>;
  enabledEngines: RewardEngineConfig | null;
  tierConfig: TierConfig | null;
  hasCompletedSetup: boolean;
}

export interface SaveSetupRequest {
  hasSeenWelcome: boolean;
  hasSeenEcosystemIntro: boolean;
  selectedTemplateId: string | null;
  rewardCustomizations: Record<string, RewardCustomization>;
  campaignDescriptions: Record<string, string>;
  enabledEngines: RewardEngineConfig | null;
  tierConfig: TierConfig | null;
}
