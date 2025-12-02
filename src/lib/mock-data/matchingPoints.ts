export interface MatchingPointActivity {
  id: string;
  date: string;
  type: 'Earned' | 'Redeemed' | 'Adjusted';
  description: string;
  points: number;
  balance: number;
}

export const matchingPointsOverview = {
  totalMatchingPoints: 1250,
  totalRegularPoints: 3500,
  earningRules: [
    'Matching points are automatically awarded when a campaign runs out of regular rewards.',
    'Earn 1 matching point for every 10 regular points spent by customers.',
    'Bonus matching points for high-performing campaigns.',
  ],
  redemptionRules: [
    'Matching points can be used to fund new campaigns or purchase premium features.',
    '100 matching points = £1.00 credit.',
    'Minimum redemption: 500 matching points.',
  ],
  adminNotices: [
    'Current matching point conversion rate is subject to change with 30 days notice.',
    'Abuse of matching points system may result in account suspension.',
  ],
};

export const matchingPointsHistory: MatchingPointActivity[] = [
  {
    id: 'mp-1',
    date: '2025-11-05',
    type: 'Earned',
    description: 'Campaign #123 completed',
    points: 150,
    balance: 1250,
  },
  {
    id: 'mp-2',
    date: '2025-11-01',
    type: 'Redeemed',
    description: 'Used for campaign boost',
    points: -200,
    balance: 1100,
  },
  {
    id: 'mp-3',
    date: '2025-10-28',
    type: 'Earned',
    description: 'Customer redemption bonus',
    points: 50,
    balance: 1300,
  },
  {
    id: 'mp-4',
    date: '2025-10-20',
    type: 'Earned',
    description: 'Campaign #118 completed',
    points: 300,
    balance: 1250,
  },
  {
    id: 'mp-5',
    date: '2025-10-15',
    type: 'Adjusted',
    description: 'Admin adjustment',
    points: -50,
    balance: 950,
  },
];
