export interface Referral {
  id: string;
  businessName: string;
  joinDate: string;
  status: 'Completed' | 'Pending';
  reward: number; // Points earned
}

export interface AffiliateStats {
  totalInvites: number;
  successfulReferrals: number;
  pointsEarned: number;
}

export interface RewardTier {
  level: number;
  referralsNeeded: number;
  description: string;
  reward: string;
}

export const affiliateData = {
  referralLink: 'https://mcom.loyal/signup?ref=BIZ-XYZ123',
  qrCodeUrl: '/placeholder-qr.svg', // We will need a placeholder QR code image
  stats: {
    totalInvites: 28,
    successfulReferrals: 12,
    pointsEarned: 1200,
  },
  referrals: [
    { id: '1', businessName: 'The Coffee Spot', joinDate: '2025-10-15', status: 'Completed', reward: 100 },
    { id: '2', businessName: 'Local Threads', joinDate: '2025-10-12', status: 'Completed', reward: 100 },
    { id: '3', businessName: 'Quick Bites', joinDate: '2025-10-10', status: 'Pending', reward: 0 },
    { id: '4', businessName: 'Gourmet Grocer', joinDate: '2025-09-28', status: 'Completed', reward: 100 },
  ] as Referral[],
  rewardsLadder: [
    { level: 1, referralsNeeded: 5, description: 'Reach 5 successful referrals', reward: '500 Bonus Points' },
    { level: 2, referralsNeeded: 10, description: 'Reach 10 successful referrals', reward: '1000 Bonus Points' },
    { level: 3, referralsNeeded: 25, description: 'Reach 25 successful referrals', reward: '2500 Bonus Points + Gold Partner Badge' },
  ]
};
