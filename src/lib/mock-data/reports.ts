// src/lib/mock-data/reports.ts

// 1. Total Campaigns Created, Joined, Claimed
export const campaignSummaryData = {
  totalCreated: 120,
  totalJoined: 850,
  totalClaimed: 620,
};

// 2. Top Performing Businesses
export const topBusinessesData = [
  { name: "The Coffee Spot", redemptions: 500, pointsIssued: 15000 },
  { name: "Local Threads", redemptions: 450, pointsIssued: 12000 },
  { name: "Quick Bites", redemptions: 300, pointsIssued: 9000 },
  { name: "Tech Innovators", redemptions: 250, pointsIssued: 8000 },
  { name: "Fashion Forward", redemptions: 200, pointsIssued: 7000 },
];

// 3. Most Popular Rewards
export const popularRewardsData = [
  { title: "10% Off Next Purchase", redemptionCount: 300 },
  { title: "Free Coffee", redemptionCount: 250 },
  { title: "Buy One Get One Free", redemptionCount: 180 },
  { title: "Free Shipping", redemptionCount: 150 },
  { title: "$5 Gift Card", redemptionCount: 120 },
];

// 4. Points Distributed (Standard vs Matching)
export const pointsDistributionData = [
  { name: 'Standard Points', value: 50000 },
  { name: 'Matching Points', value: 25000 },
];

// 5. Consumer Growth and Activity
export const consumerGrowthData = [
  { month: "Jan", newRegistrations: 50, activityCount: 200 },
  { month: "Feb", newRegistrations: 60, activityCount: 220 },
  { month: "Mar", newRegistrations: 75, activityCount: 250 },
  { month: "Apr", newRegistrations: 90, activityCount: 300 },
  { month: "May", newRegistrations: 110, activityCount: 350 },
  { month: "Jun", newRegistrations: 130, activityCount: 400 },
];

// 6. Business Tier Distribution
export const businessTierData = [
  { name: 'Starter', value: 30 },
  { name: 'Active', value: 20 },
  { name: 'Trusted', value: 10 },
  { name: 'Partner', value: 5 },
];

// 7. Conversion and Retention Reports
export const conversionRetentionData = {
  registrationToJoinRate: "70%",
  joinToRedeemRate: "85%",
  monthlyRetentionRate: "60%",
};
