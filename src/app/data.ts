
export const mockBusinessData = {
  businessName: "Cafe Delights",
  totalCustomers: 12840,
  totalPointsAwarded: 542300,
  totalRewardsRedeemed: 3120,
  redemptionRate: 24.3,
  totalCampaigns: 12,
  topDeal: "2-for-1 Coffee Mornings",
  pointsSummary: {
    earned: 542300,
    spent: 489000,
    matchingAvailable: 53300,
  },
  tier: {
    name: "Partner",
    progress: 75, // Percentage to next tier
  },
  activeCampaigns: [
    { id: "cmp001", name: "Summer Loyalty Campaign 2025", status: "Active", customers: 1284 },
    { id: "cmp004", name: "Tech Fest 2025 Loyalty Program", status: "Active", customers: 760 },
    { id: "cmp005", name: "Fitness Rewards Challenge", status: "Active", customers: 560 },
  ],
  performanceData: {
    "7d": [
      { name: "Day 1", earned: 120, redeemed: 45 },
      { name: "Day 2", earned: 150, redeemed: 60 },
      { name: "Day 3", earned: 180, redeemed: 70 },
      { name: "Day 4", earned: 130, redeemed: 50 },
      { name: "Day 5", earned: 200, redeemed: 80 },
      { name: "Day 6", earned: 220, redeemed: 90 },
      { name: "Day 7", earned: 250, redeemed: 100 },
    ],
    "30d": [
      { name: "Week 1", earned: 800, redeemed: 300 },
      { name: "Week 2", earned: 950, redeemed: 400 },
      { name: "Week 3", earned: 1100, redeemed: 500 },
      { name: "Week 4", earned: 1000, redeemed: 450 },
    ],
    "3m": [
      { name: "Month 1", earned: 4000, redeemed: 1500 },
      { name: "Month 2", earned: 4500, redeemed: 1800 },
      { name: "Month 3", earned: 5000, redeemed: 2000 },
    ],
    "6m": [
      { name: "Month 1", earned: 4000, redeemed: 1500 },
      { name: "Month 2", earned: 4500, redeemed: 1800 },
      { name: "Month 3", earned: 5000, redeemed: 2000 },
      { name: "Month 4", earned: 5500, redeemed: 2200 },
      { name: "Month 5", earned: 6000, redeemed: 2500 },
      { name: "Month 6", earned: 6500, redeemed: 2800 },
    ],
    "1y": [
      { name: "Q1", earned: 15000, redeemed: 6000 },
      { name: "Q2", earned: 18000, redeemed: 7500 },
      { name: "Q3", earned: 20000, redeemed: 8500 },
      { name: "Q4", earned: 25000, redeemed: 10000 },
    ],
  },
  recentActivity: [
    { id: 1, type: "Reward Redeemed", customer: "Sarah Johnson", points: 500 },
    { id: 2, type: "New Signup", customer: "Kwame Mensah", points: 200 },
    { id: 3, type: "Reward Redeemed", customer: "Linda Ofori", points: 800 },
  ],
};
