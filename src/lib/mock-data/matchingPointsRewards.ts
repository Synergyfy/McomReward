export interface MatchingPointReward {
  id: string;
  title: string;
  description: string;
  pointsRequired: number;
  image: string;
  quantity: number;
  createdAt: string;
  disabled: boolean;
}

export interface MatchingPointRedemption {
  id: string;
  rewardId: string;
  rewardTitle: string;
  businessId: string;
  businessName: string;
  pointsRedeemed: number;
  redeemedAt: string;
  status: 'completed' | 'pending' | 'cancelled';
}

export const mockMatchingPointRewards: MatchingPointReward[] = [
  {
    id: '1',
    title: 'Premium Marketing Consultation',
    description: 'A 1-hour session with our top marketing experts to optimize your campaigns.',
    pointsRequired: 500,
    image: 'https://images.unsplash.com/photo-1552664730-d307ca884978?auto=format&fit=crop&q=80&w=800',
    quantity: 10,
    createdAt: '2023-10-01T10:00:00Z',
    disabled: false,
  },
  {
    id: '2',
    title: 'Featured Business Spot',
    description: 'Get your business featured on the main dashboard for one week.',
    pointsRequired: 1000,
    image: 'https://images.unsplash.com/photo-1557804506-669a67965ba0?auto=format&fit=crop&q=80&w=800',
    quantity: 5,
    createdAt: '2023-10-05T10:00:00Z',
    disabled: false,
  },
  {
    id: '3',
    title: 'Email Blast to 5000 Users',
    description: 'Send a promotional email to a curated list of active local users.',
    pointsRequired: 2500,
    image: 'https://images.unsplash.com/photo-1563986768609-322da13575f3?auto=format&fit=crop&q=80&w=800',
    quantity: 3,
    createdAt: '2023-10-10T10:00:00Z',
    disabled: false,
  },
];

export const mockGlobalRedemptions: MatchingPointRedemption[] = [
  {
    id: 'r1',
    rewardId: '1',
    rewardTitle: 'Premium Marketing Consultation',
    businessId: 'b1',
    businessName: 'Acme Corp',
    pointsRedeemed: 500,
    redeemedAt: '2023-10-15T14:30:00Z',
    status: 'completed',
  },
  {
    id: 'r2',
    rewardId: '2',
    rewardTitle: 'Featured Business Spot',
    businessId: 'b2',
    businessName: 'Local Coffee Co.',
    pointsRedeemed: 1000,
    redeemedAt: '2023-10-16T09:15:00Z',
    status: 'completed',
  },
  {
    id: 'r3',
    rewardId: '1',
    rewardTitle: 'Premium Marketing Consultation',
    businessId: 'b3',
    businessName: 'Tech Startups Inc',
    pointsRedeemed: 500,
    redeemedAt: '2023-10-18T11:00:00Z',
    status: 'pending',
  },
];

export const mockMyRedemptions: MatchingPointRedemption[] = [
  {
    id: 'mr1',
    rewardId: '1',
    rewardTitle: 'Premium Marketing Consultation',
    businessId: 'my-biz',
    businessName: 'My Business',
    pointsRedeemed: 500,
    redeemedAt: '2023-10-12T10:00:00Z',
    status: 'completed',
  },
];
