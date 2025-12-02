
export interface AdminPointTransaction {
  id: string;
  timestamp: string;
  description: string;
  transactionType: 'earned' | 'spent' | 'purchase' | 'referral_bonus' | 'manual_adjustment' | 'deal_redemption';
  pointType: 'regular' | 'matching'; // New field
  points: number;
  customer: { name: string, email: string };
  campaign?: { id: string, title: string };
  reward?: { id: string, title: string };
}

export const mockAdminTransactions: AdminPointTransaction[] = [
  { id: '1', timestamp: '2025-10-26T10:00:00Z', description: 'Joined Summer Bonanza', transactionType: 'earned', pointType: 'regular', points: 100, customer: { name: 'Alice Johnson', email: 'alice@example.com' }, campaign: { id: '1', title: 'Summer Bonanza' } },
  { id: '2', timestamp: '2025-10-25T14:30:00Z', description: 'Redeemed: Free Coffee', transactionType: 'spent', pointType: 'regular', points: -50, customer: { name: 'Bob Williams', email: 'bob@example.com' }, reward: { id: '1', title: 'Free Coffee' } },
  { id: '7', timestamp: '2025-10-25T11:00:00Z', description: 'Purchase at Burger Queen', transactionType: 'purchase', pointType: 'regular', points: 75, customer: { name: 'Alice Johnson', email: 'alice@example.com' } },
  { id: '3', timestamp: '2025-10-24T09:00:00Z', description: 'MCOM Welcome Bonus', transactionType: 'earned', pointType: 'matching', points: 150, customer: { name: 'Charlie Brown', email: 'charlie@example.com' } },
  { id: '8', timestamp: '2025-10-23T20:00:00Z', description: 'Referral bonus', transactionType: 'referral_bonus', pointType: 'regular', points: 100, customer: { name: 'David Davis', email: 'david@example.com' } },
  { id: '4', timestamp: '2025-10-23T18:00:00Z', description: 'Admin bonus (Matching)', transactionType: 'manual_adjustment', pointType: 'matching', points: 20, customer: { name: 'Alice Johnson', email: 'alice@example.com' } },
  { id: '5', timestamp: '2025-10-22T11:00:00Z', description: 'Joined Loyalty Exclusive', transactionType: 'earned', pointType: 'regular', points: 200, customer: { name: 'Bob Williams', email: 'bob@example.com' }, campaign: { id: '3', title: 'Loyalty Members Exclusive' } },
  { id: '6', timestamp: '2025-10-21T16:45:00Z', description: 'Redeemed: 10% Discount', transactionType: 'spent', pointType: 'regular', points: -100, customer: { name: 'Charlie Brown', email: 'charlie@example.com' } },
  { id: '9', timestamp: '2025-10-20T12:00:00Z', description: 'MCOM Promotion', transactionType: 'earned', pointType: 'matching', points: 200, customer: { name: 'David Davis', email: 'david@example.com' } },
  { id: '10', timestamp: '2025-10-19T10:00:00Z', description: 'Deal Redemption: 50% off Pizza', transactionType: 'deal_redemption', pointType: 'regular', points: -200, customer: { name: 'Alice Johnson', email: 'alice@example.com' } },
  { id: '11', timestamp: '2025-10-16T10:00:00Z', description: 'Welcome bonus', transactionType: 'earned', pointType: 'regular', points: 500, customer: { name: 'Bob Williams', email: 'bob@example.com' } },
];
