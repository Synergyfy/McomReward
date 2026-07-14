export interface CampaignPerformance {
  id: string;
  name: string;
  stats: {
    totalCustomers: number;
    totalPointsAwarded: number;
    totalRewardsRedeemed: number;
    redemptionRate: number;
  };
  trend: { date: string; signups: number; redemptions: number; pointsAwarded: number }[];
  rewardsPerformance: {
    rewardId: string;
    title: string;
    pointsRequired: number;
    redeemed: number;
  }[];
  topCustomers: {
    name: string;
    email: string;
    points: number;
    redemptions: number;
  }[];
} 

// ✅ Mock Campaign Data (same structure as before)
export const mockCampaignDetails : Record<string, CampaignPerformance> = {
  cmp001: {
    id: "cmp001",
    name: "Summer Loyalty Campaign 2025",
    stats: {
      totalCustomers: 1284,
      totalPointsAwarded: 542300,
      totalRewardsRedeemed: 312,
      redemptionRate: 24.3,
    },
    trend: [
      { date: "Oct 1", signups: 34, redemptions: 12, pointsAwarded: 8400 },
      { date: "Oct 2", signups: 28, redemptions: 10, pointsAwarded: 7200 },
      { date: "Oct 3", signups: 45, redemptions: 20, pointsAwarded: 11000 },
      { date: "Oct 4", signups: 52, redemptions: 15, pointsAwarded: 9700 },
      { date: "Oct 5", signups: 40, redemptions: 18, pointsAwarded: 8600 },
      { date: "Oct 6", signups: 37, redemptions: 14, pointsAwarded: 9100 },
      { date: "Oct 7", signups: 50, redemptions: 19, pointsAwarded: 10200 },
    ],
    topCustomers: [
      { name: "Sarah Johnson", email: "sarah@example.com", points: 1200, redemptions: 5 },
      { name: "Kwame Mensah", email: "kwame@example.com", points: 1050, redemptions: 3 },
      { name: "Linda Ofori", email: "linda@example.com", points: 950, redemptions: 4 },
      { name: "James Boateng", email: "james@example.com", points: 880, redemptions: 2 },
    ],
    rewardsPerformance: [
      { rewardId: "rw1", title: "Free Coffee", pointsRequired: 500, redeemed: 128 },
      { rewardId: "rw2", title: "10% Off Voucher", pointsRequired: 800, redeemed: 96 },
      { rewardId: "rw3", title: "Movie Ticket", pointsRequired: 1500, redeemed: 54 },
      { rewardId: "rw4", title: "Gift Hamper", pointsRequired: 2500, redeemed: 34 },
    ],
  },

  cmp002: {
    id: "cmp002",
    name: "Holiday Rewards Blast",
    stats: {
      totalCustomers: 1840,
      totalPointsAwarded: 732000,
      totalRewardsRedeemed: 490,
      redemptionRate: 26.6,
    },
    trend: [
      { date: "Dec 20", signups: 60, redemptions: 22, pointsAwarded: 16000 },
      { date: "Dec 21", signups: 75, redemptions: 26, pointsAwarded: 18500 },
      { date: "Dec 22", signups: 90, redemptions: 30, pointsAwarded: 20000 },
      { date: "Dec 23", signups: 100, redemptions: 40, pointsAwarded: 22000 },
      { date: "Dec 24", signups: 140, redemptions: 50, pointsAwarded: 25000 },
      { date: "Dec 25", signups: 180, redemptions: 60, pointsAwarded: 28000 },
      { date: "Dec 26", signups: 160, redemptions: 55, pointsAwarded: 26000 },
    ],
    topCustomers: [
      { name: "Michael Owusu", email: "michael@example.com", points: 2500, redemptions: 6 },
      { name: "Nana Ama", email: "nana@example.com", points: 2100, redemptions: 5 },
      { name: "John Doe", email: "john@example.com", points: 1800, redemptions: 4 },
      { name: "Akua Danso", email: "akua@example.com", points: 1600, redemptions: 3 },
    ],
    rewardsPerformance: [
      { rewardId: "rw5", title: "Gift Card (₵50)", pointsRequired: 1000, redeemed: 200 },
      { rewardId: "rw6", title: "Holiday Hamper", pointsRequired: 2500, redeemed: 140 },
      { rewardId: "rw7", title: "Free Delivery Coupon", pointsRequired: 800, redeemed: 100 },
      { rewardId: "rw8", title: "Limited Edition T-Shirt", pointsRequired: 1500, redeemed: 50 },
    ],
  },

  cmp003: {
    id: "cmp003",
    name: "Weekend Shopper Rewards",
    stats: {
      totalCustomers: 940,
      totalPointsAwarded: 305000,
      totalRewardsRedeemed: 218,
      redemptionRate: 23.2,
    },
    trend: [
      { date: "Mar 1", signups: 15, redemptions: 5, pointsAwarded: 4200 },
      { date: "Mar 8", signups: 25, redemptions: 9, pointsAwarded: 5600 },
      { date: "Mar 15", signups: 30, redemptions: 11, pointsAwarded: 6300 },
      { date: "Mar 22", signups: 45, redemptions: 13, pointsAwarded: 7200 },
      { date: "Mar 29", signups: 38, redemptions: 12, pointsAwarded: 7000 },
    ],
    topCustomers: [
      { name: "Esi Appiah", email: "esi@example.com", points: 900, redemptions: 3 },
      { name: "Joseph Aidoo", email: "joseph@example.com", points: 850, redemptions: 2 },
      { name: "Anita Owusu", email: "anita@example.com", points: 780, redemptions: 3 },
      { name: "Kojo Asante", email: "kojo@example.com", points: 750, redemptions: 2 },
    ],
    rewardsPerformance: [
      { rewardId: "rw9", title: "Discount Coupon (₵20)", pointsRequired: 400, redeemed: 80 },
      { rewardId: "rw10", title: "Free Tote Bag", pointsRequired: 700, redeemed: 60 },
      { rewardId: "rw11", title: "Shopping Voucher", pointsRequired: 1000, redeemed: 48 },
      { rewardId: "rw12", title: "Weekend Gift Box", pointsRequired: 2000, redeemed: 30 },
    ],
  },

  cmp004: {
    id: "cmp004",
    name: "Tech Fest 2025 Loyalty Program",
    stats: {
      totalCustomers: 760,
      totalPointsAwarded: 189000,
      totalRewardsRedeemed: 134,
      redemptionRate: 17.6,
    },
    trend: [
      { date: "Oct 10", signups: 20, redemptions: 8, pointsAwarded: 4200 },
      { date: "Oct 11", signups: 25, redemptions: 9, pointsAwarded: 4600 },
      { date: "Oct 12", signups: 28, redemptions: 10, pointsAwarded: 4800 },
      { date: "Oct 13", signups: 30, redemptions: 11, pointsAwarded: 5000 },
      { date: "Oct 14", signups: 34, redemptions: 12, pointsAwarded: 5400 },
      { date: "Oct 15", signups: 40, redemptions: 14, pointsAwarded: 5900 },
      { date: "Oct 16", signups: 42, redemptions: 15, pointsAwarded: 6200 },
    ],
    topCustomers: [
      { name: "David Mensah", email: "david@example.com", points: 1500, redemptions: 4 },
      { name: "Selina Tetteh", email: "selina@example.com", points: 1300, redemptions: 3 },
      { name: "Yaw Owusu", email: "yaw@example.com", points: 1150, redemptions: 2 },
      { name: "Afia Darko", email: "afia@example.com", points: 980, redemptions: 2 },
    ],
    rewardsPerformance: [
      { rewardId: "rw13", title: "USB Flash Drive", pointsRequired: 400, redeemed: 60 },
      { rewardId: "rw14", title: "Wireless Mouse", pointsRequired: 700, redeemed: 45 },
      { rewardId: "rw15", title: "Bluetooth Speaker", pointsRequired: 1500, redeemed: 20 },
      { rewardId: "rw16", title: "Tech Hoodie", pointsRequired: 2000, redeemed: 9 },
    ],
  },

  cmp005: {
    id: "cmp005",
    name: "Fitness Rewards Challenge",
    stats: {
      totalCustomers: 560,
      totalPointsAwarded: 145800,
      totalRewardsRedeemed: 95,
      redemptionRate: 16.9,
    },
    trend: [
      { date: "Oct 1", signups: 12, redemptions: 4, pointsAwarded: 2800 },
      { date: "Oct 2", signups: 15, redemptions: 5, pointsAwarded: 3100 },
      { date: "Oct 3", signups: 18, redemptions: 6, pointsAwarded: 3300 },
      { date: "Oct 4", signups: 20, redemptions: 7, pointsAwarded: 3500 },
      { date: "Oct 5", signups: 22, redemptions: 8, pointsAwarded: 3700 },
      { date: "Oct 6", signups: 25, redemptions: 9, pointsAwarded: 3900 },
      { date: "Oct 7", signups: 28, redemptions: 10, pointsAwarded: 4200 },
    ],
    topCustomers: [
      { name: "Kofi Osei", email: "kofi@example.com", points: 800, redemptions: 3 },
      { name: "Ama Boateng", email: "ama@example.com", points: 750, redemptions: 2 },
      { name: "Yaw Asare", email: "yaw@example.com", points: 700, redemptions: 2 },
      { name: "Diana Owusu", email: "diana@example.com", points: 650, redemptions: 1 },
    ],
    rewardsPerformance: [
      { rewardId: "rw17", title: "Gym Towel", pointsRequired: 300, redeemed: 40 },
      { rewardId: "rw18", title: "Water Bottle", pointsRequired: 500, redeemed: 30 },
      { rewardId: "rw19", title: "Protein Shake Pack", pointsRequired: 800, redeemed: 15 },
      { rewardId: "rw20", title: "Fitness Watch", pointsRequired: 2000, redeemed: 10 },
    ],
  },
};
