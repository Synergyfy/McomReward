// src/lib/mock-data/dashboard.ts

// 1. Top Summary Cards
export const summaryCardData = {
  totalBusinesses: 57,
  activeCampaigns: 23,
  totalConsumers: 1250,
  totalRewardsClaimed: 620,
  totalMatchingPointsIssued: 25000,
};

// 2. Business Tier Breakdown
export const businessTierBreakdownData = {
  starter: 30,
  active: 20,
  trusted: 10,
  partner: 5,
};

// 3. Notifications
export const notificationsData = [
  {
    id: 1,
    type: 'approval',
    message: 'New campaign "Summer Sale" from "Cafe Delight" requires approval.',
    time: '10 mins ago',
  },
  {
    id: 2,
    type: 'announcement',
    message: 'Scheduled maintenance this Sunday at 2 AM.',
    time: '1 hour ago',
  },
  {
    id: 3,
    type: 'flag',
    message: 'Unusual activity detected on "Tech Gadgets" account.',
    time: '3 hours ago',
  },
  {
    id: 4,
    type: 'new_user',
    message: 'A new business "Local Artisans" has signed up.',
    time: '5 hours ago',
  },
];

// 4. Main Chart Data (e.g., Consumer Growth)
export const mainChartData = [
  { month: "Jan", newRegistrations: 50, activityCount: 200 },
  { month: "Feb", newRegistrations: 60, activityCount: 220 },
  { month: "Mar", newRegistrations: 75, activityCount: 250 },
  { month: "Apr", newRegistrations: 90, activityCount: 300 },
  { month: "May", newRegistrations: 110, activityCount: 350 },
  { month: "Jun", newRegistrations: 130, activityCount: 400 },
];

// 5. Secondary Data Table (e.g., Top Performing Businesses)
export const secondaryTableData = [
  { name: "The Coffee Spot", redemptions: 500, pointsIssued: 15000 },
  { name: "Local Threads", redemptions: 450, pointsIssued: 12000 },
  { name: "Quick Bites", redemptions: 300, pointsIssued: 9000 },
  { name: "Tech Innovators", redemptions: 250, pointsIssued: 8000 },
  { name: "Fashion Forward", redemptions: 200, pointsIssued: 7000 },
];
