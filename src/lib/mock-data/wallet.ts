
export interface Transaction {
  id: string;
  type: 'regular' | 'matching';
  points: number; // positive for earning, negative for spending
  description: string;
  date: string;
}

export interface Wallet {
  regularPoints: number;
  matchingPoints: number;
  totalPoints: number;
  transactions: Transaction[];
}

export const mockWallet: Wallet = {
  regularPoints: 1250,
  matchingPoints: 400,
  totalPoints: 1650,
  transactions: [
    { id: '1', type: 'regular', points: 100, description: "Purchase at 'Coffee House'", date: "2025-10-28" },
    { id: '2', type: 'matching', points: 50, description: "MCOM Welcome Bonus", date: "2025-10-27" },
    { id: '3', type: 'regular', points: -200, description: "Redeemed '10% Off' Reward", date: "2025-10-26" },
    { id: '4', type: 'regular', points: 50, description: "Joined 'Grand Opening' Campaign", date: "2025-10-25" },
    { id: '5', type: 'regular', points: 75, description: "Purchase at Burger Queen", date: "2025-10-25" },
    { id: '6', type: 'regular', points: 100, description: "Referral bonus for inviting a friend", date: "2025-10-23" },
    { id: '7', type: 'matching', points: 20, description: "Admin bonus for loyalty", date: "2025-10-23" },
    { id: '8', type: 'regular', points: -100, description: "Deal Redemption: 50% off Pizza", date: "2025-10-20" },
  ],
};
