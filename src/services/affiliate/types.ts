export interface AffiliateCodeResponse {
  code: string;
}

export interface ReferredBusiness {
  name: string;
  referredAt: string;
  status: 'pending' | 'completed';
}

export interface AffiliateStats {
  totalInvites: number;
  totalSuccessfulReferrals: number;
  totalPointsEarned: number;
  referredBusinesses: ReferredBusiness[];
}

export interface RewardTier {
  level: number;
  referralsNeeded: number;
  description: string;
  reward: string;
}