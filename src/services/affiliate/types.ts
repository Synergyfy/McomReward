export interface AffiliateCodeResponse {
  code: string;
}

export enum NetworkLocationTag {
  NEARBY = "nearby",
  HYPERLOCAL = "hyperlocal",
  NATIONAL = "national",
}

export enum NetworkRelationshipTag {
  PARTNER = "partner",
  CUSTOMER = "customer",
  SUPPLIER = "supplier",
  AFFILIATE = "affiliate",
}

export interface TagNetworkDto {
  locationTag?: NetworkLocationTag;
  relationshipTag?: NetworkRelationshipTag;
}

export interface ReferredBusiness {
  businessId: string;
  name: string;
  email: string;
  referredAt: string;
  status: 'PENDING' | 'SUCCESS' | 'completed'; // Added SUCCESS and completed based on common usage
  pointsEarned: number;
  locationTag: NetworkLocationTag | null;
  relationshipTag: NetworkRelationshipTag | null;
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