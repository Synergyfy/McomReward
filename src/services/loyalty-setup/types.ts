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

export interface LoyaltySetupProgress {
  hasSeenWelcome: boolean;
  hasSeenEcosystemIntro: boolean;
  selectedTemplateId: string | null;
  rewardCustomizations: Record<string, RewardCustomization>;
  campaignDescriptions: Record<string, string>;
  hasCompletedSetup: boolean;
}

export interface SaveSetupRequest {
  hasSeenWelcome: boolean;
  hasSeenEcosystemIntro: boolean;
  selectedTemplateId: string | null;
  rewardCustomizations: Record<string, RewardCustomization>;
  campaignDescriptions: Record<string, string>;
}
