
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
  weeklyTrend: [
    { week: "Oct 1", earned: 8400, redeemed: 3200 },
    { week: "Oct 2", earned: 7200, redeemed: 2900 },
    { week: "Oct 3", earned: 11000, redeemed: 4300 },
    { week: "Oct 4", earned: 9700, redeemed: 3800 },
    { week: "Oct 5", earned: 8600, redeemed: 3100 },
    { week: "Oct 6", earned: 9100, redeemed: 3500 },
    { week: "Oct 7", earned: 10200, redeemed: 3900 },
  ],
  recentActivity: [
    { id: 1, type: "Reward Redeemed", customer: "Sarah Johnson", points: 500 },
    { id: 2, type: "New Signup", customer: "Kwame Mensah", points: 200 },
    { id: 3, type: "Reward Redeemed", customer: "Linda Ofori", points: 800 },
  ],
};
