export interface TierRequirement {
  id: string;
  description: string;
  current: number;
  target: number;
}

export interface Progression {
  name: 'Standard' | 'Pro' | 'Pro Plus';
  benefits: string[];
  requirements: TierRequirement[];
}

export const progressionData: Progression[] = [
  {
    name: 'Standard',
    benefits: ['Basic Dashboard Access', 'Standard Campaign Tools', 'Community Support'],
    requirements: [],
  },
  {
    name: 'Pro',
    benefits: ['Advanced Analytics', 'Priority Support', 'Custom Branding', 'Up to 10 active campaigns'],
    requirements: [
      { id: 'req1', description: 'Run 5 campaigns', current: 3, target: 5 },
      { id: 'req2', description: 'Get 20 redemptions', current: 15, target: 20 },
    ],
  },
  {
    name: 'Pro Plus',
    benefits: ['Expert Consultations', 'White-labeling', 'API Access', 'Unlimited Campaigns'],
    requirements: [
      { id: 'req3', description: 'Complete 15 campaigns', current: 10, target: 15 },
      { id: 'req4', description: 'Refer 5 businesses', current: 2, target: 5 },
    ],
  },
];

export const userProgressionStatus = {
  currentLevel: 'Pro',
  nextLevel: 'Pro Plus',
  progress: 65,
};
