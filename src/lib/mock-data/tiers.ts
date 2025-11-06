export interface TierRequirement {
  id: string;
  description: string;
  current: number;
  target: number;
}

export interface Tier {
  name: 'Starter' | 'Active' | 'Trusted' | 'Partner';
  benefits: string[];
  requirements: TierRequirement[];
}

export const tierData: Tier[] = [
  {
    name: 'Starter',
    benefits: ['Basic Dashboard Access', 'Create 1 Campaign'],
    requirements: [],
  },
  {
    name: 'Active',
    benefits: ['Advanced Campaign Analytics', 'Create up to 5 Campaigns'],
    requirements: [
      { id: 'req1', description: 'Run 5 campaigns', current: 3, target: 5 },
      { id: 'req2', description: 'Get 20 redemptions', current: 15, target: 20 },
    ],
  },
  {
    name: 'Trusted',
    benefits: ['B2B Exchange Access', 'Co-Brand Eligibility'],
    requirements: [
      { id: 'req3', description: 'Run 15 campaigns', current: 10, target: 15 },
      { id: 'req4', description: 'Maintain a 4-star rating', current: 4.5, target: 4 },
    ],
  },
  {
    name: 'Partner',
    benefits: ['White-Label Eligibility', 'Commission Tier'],
    requirements: [
      { id: 'req5', description: 'Complete 5 B2B trades', current: 2, target: 5 },
      { id: 'req6', description: 'Refer 10 new businesses', current: 8, target: 10 },
    ],
  },
];

export const userTierStatus = {
  currentTier: 'Active',
  nextTier: 'Trusted',
  progress: 66, // Example progress percentage
};
