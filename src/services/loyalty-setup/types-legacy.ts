export interface LoyaltyModule {
  id: string;
  key: string;
  name: string;
  description: string;
  icon: string;
  isEnabled: boolean;
  isLocked: boolean;
}

export interface RecommendedCampaign {
  id: string;
  key: string;
  name: string;
  description: string;
  type: "birthday" | "anniversary" | "seasonal" | "referral";
  icon: string;
  isEnabled: boolean;
}

export interface RecommendedSetup {
  sector: string;
  sectorDisplayName: string;
  category: string;
  modules: LoyaltyModule[];
  campaigns: RecommendedCampaign[];
}
