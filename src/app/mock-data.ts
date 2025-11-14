
type Season = "Summer" | "Winter" | "Autumn" | "Spring";

export const seasonalMockData = {
  businessName: "Cafe Delights",
  Summer: {
    totalCustomers: 15000,
    totalRewardsRedeemed: 4500,
    totalCampaigns: 15,
    topDeal: "Summer Sale",
    redemptionRate: 30,
    tier: {
      name: "Gold",
      progress: 50,
    },
    pointsSummary: {
      earned: 750000,
      spent: 600000,
      matchingAvailable: 150000,
    },
    activeCampaigns: [
      { id: "cmp001", name: "Summer Loyalty Campaign 2025", status: "Active", customers: 2000 },
      { id: "cmp002", name: "Summer Cool Down Deals", status: "Active", customers: 1500 },
    ],
    performanceData: {
      "7d": [
        { name: "Day 1", earned: 220, redeemed: 85 },
        { name: "Day 2", earned: 250, redeemed: 90 },
        { name: "Day 3", earned: 280, redeemed: 100 },
        { name: "Day 4", earned: 230, redeemed: 80 },
        { name: "Day 5", earned: 300, redeemed: 110 },
        { name: "Day 6", earned: 320, redeemed: 120 },
        { name: "Day 7", earned: 350, redeemed: 130 },
      ],
      "30d": [
        { name: "Week 1", earned: 1800, redeemed: 800 },
        { name: "Week 2", earned: 1950, redeemed: 900 },
        { name: "Week 3", earned: 2100, redeemed: 1000 },
        { name: "Week 4", earned: 2000, redeemed: 950 },
      ],
      "3m": [
        { name: "Month 1", earned: 8000, redeemed: 3500 },
        { name: "Month 2", earned: 8500, redeemed: 3800 },
        { name: "Month 3", earned: 9000, redeemed: 4000 },
      ],
       "6m": [
        { name: "Month 1", earned: 8000, redeemed: 3500 },
        { name: "Month 2", earned: 8500, redeemed: 3800 },
        { name: "Month 3", earned: 9000, redeemed: 4000 },
        { name: "Month 4", earned: 9500, redeemed: 4200 },
        { name: "Month 5", earned: 10000, redeemed: 4500 },
        { name: "Month 6", earned: 10500, redeemed: 4800 },
      ],
      "1y": [
        { name: "Q1", earned: 25000, redeemed: 11000 },
        { name: "Q2", earned: 28000, redeemed: 12500 },
        { name: "Q3", earned: 30000, redeemed: 13500 },
        { name: "Q4", earned: 35000, redeemed: 15000 },
      ],
    },
    recentActivity: [
      { id: 1, type: "Reward Redeemed", customer: "John Doe", points: 600 },
      { id: 2, type: "New Signup", customer: "Jane Smith", points: 250 },
      { id: 3, type: "Reward Redeemed", customer: "Peter Jones", points: 900 },
    ],
  },
  Winter: {
    totalCustomers: 10000,
    totalRewardsRedeemed: 2500,
    totalCampaigns: 10,
    topDeal: "Winter Wonderland",
    redemptionRate: 25,
     tier: {
      name: "Silver",
      progress: 30,
    },
    pointsSummary: {
      earned: 500000,
      spent: 400000,
      matchingAvailable: 100000,
    },
    activeCampaigns: [
      { id: "cmp003", name: "Winter Loyalty Campaign 2025", status: "Active", customers: 1000 },
      { id: "cmp004", name: "Winter Warm Up Deals", status: "Active", customers: 800 },
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
        { id: 1, type: "Reward Redeemed", customer: "Alice", points: 500 },
        { id: 2, type: "New Signup", customer: "Bob", points: 200 },
        { id: 3, type: "Reward Redeemed", customer: "Charlie", points: 800 },
    ]
  },
  Autumn: {
    totalCustomers: 12000,
    totalRewardsRedeemed: 3500,
    totalCampaigns: 12,
    topDeal: "Autumn Harvest",
    redemptionRate: 29,
    tier: {
      name: "Bronze",
      progress: 80,
    },
    pointsSummary: {
      earned: 600000,
      spent: 500000,
      matchingAvailable: 100000,
    },
    activeCampaigns: [
      { id: "cmp005", name: "Autumn Loyalty Campaign 2025", status: "Active", customers: 1200 },
      { id: "cmp006", name: "Autumn Savings Deals", status: "Active", customers: 1000 },
    ],
     performanceData: {
      "7d": [
        { name: "Day 1", earned: 180, redeemed: 70 },
        { name: "Day 2", earned: 210, redeemed: 80 },
        { name: "Day 3", earned: 240, redeemed: 90 },
        { name: "Day 4", earned: 190, redeemed: 70 },
        { name: "Day 5", earned: 260, redeemed: 100 },
        { name: "Day 6", earned: 280, redeemed: 110 },
        { name: "Day 7", earned: 310, redeemed: 120 },
      ],
      "30d": [
        { name: "Week 1", earned: 1200, redeemed: 600 },
        { name: "Week 2", earned: 1350, redeemed: 700 },
        { name: "Week 3", earned: 1500, redeemed: 800 },
        { name: "Week 4", earned: 1400, redeemed: 750 },
      ],
      "3m": [
        { name: "Month 1", earned: 6000, redeemed: 2500 },
        { name: "Month 2", earned: 6500, redeemed: 2800 },
        { name: "Month 3", earned: 7000, redeemed: 3000 },
      ],
       "6m": [
        { name: "Month 1", earned: 6000, redeemed: 2500 },
        { name: "Month 2", earned: 6500, redeemed: 2800 },
        { name: "Month 3", earned: 7000, redeemed: 3000 },
        { name: "Month 4", earned: 7500, redeemed: 3200 },
        { name: "Month 5", earned: 8000, redeemed: 3500 },
        { name: "Month 6", earned: 8500, redeemed: 3800 },
      ],
        "1y": [
        { name: "Q1", earned: 20000, redeemed: 8000 },
        { name: "Q2", earned: 23000, redeemed: 9500 },
        { name: "Q3", earned: 25000, redeemed: 10500 },
        { name: "Q4", earned: 28000, redeemed: 12000 },
      ],
    },
    recentActivity: [
        { id: 1, type: "Reward Redeemed", customer: "David", points: 550 },
        { id: 2, type: "New Signup", customer: "Eve", points: 220 },
        { id: 3, type: "Reward Redeemed", customer: "Frank", points: 850 },
    ]
  },
  Spring: {
    totalCustomers: 13000,
    totalRewardsRedeemed: 4000,
    totalCampaigns: 14,
    topDeal: "Spring Fling",
    redemptionRate: 31,
    tier: {
      name: "Platinum",
      progress: 20,
    },
    pointsSummary: {
      earned: 700000,
      spent: 550000,
      matchingAvailable: 150000,
    },
    activeCampaigns: [
      { id: "cmp007", name: "Spring Loyalty Campaign 2025", status: "Active", customers: 1500 },
      { id: "cmp008", name: "Spring Fresh Deals", status: "Active", customers: 1200 },
    ],
     performanceData: {
      "7d": [
        { name: "Day 1", earned: 200, redeemed: 80 },
        { name: "Day 2", earned: 230, redeemed: 90 },
        { name: "Day 3", earned: 260, redeemed: 100 },
        { name: "Day 4", earned: 210, redeemed: 80 },
        { name: "Day 5", earned: 280, redeemed: 110 },
        { name: "Day 6", earned: 300, redeemed: 120 },
        { name: "Day 7", earned: 330, redeemed: 130 },
      ],
      "30d": [
        { name: "Week 1", earned: 1500, redeemed: 700 },
        { name: "Week 2", earned: 1650, redeemed: 800 },
        { name: "Week 3", earned: 1800, redeemed: 900 },
        { name: "Week 4", earned: 1700, redeemed: 850 },
      ],
      "3m": [
        { name: "Month 1", earned: 7000, redeemed: 3000 },
        { name: "Month 2", earned: 7500, redeemed: 3300 },
        { name: "Month 3", earned: 8000, redeemed: 3500 },
      ],
       "6m": [
        { name: "Month 1", earned: 7000, redeemed: 3000 },
        { name: "Month 2", earned: 7500, redeemed: 3300 },
        { name: "Month 3", earned: 8000, redeemed: 3500 },
        { name: "Month 4", earned: 8500, redeemed: 3800 },
        { name: "Month 5", earned: 9000, redeemed: 4000 },
        { name: "Month 6", earned: 9500, redeemed: 4300 },
      ],
      "1y": [
        { name: "Q1", earned: 22000, redeemed: 9000 },
        { name: "Q2", earned: 25000, redeemed: 10500 },
        { name: "Q3", earned: 27000, redeemed: 11500 },
        { name: "Q4", earned: 30000, redeemed: 13000 },
      ],
    },
    recentActivity: [
        { id: 1, type: "Reward Redeemed", customer: "Grace", points: 580 },
        { id: 2, type: "New Signup", customer: "Heidi", points: 240 },
        { id: 3, type: "Reward Redeemed", customer: "Ivan", points: 880 },
    ]
  },
};

export const mockClaimableCampaigns = [
  {
    id: '4',
    title: "Coffee Lover's Dream",
    business: 'The Daily Grind',
    pointsCost: 100,
    description: 'Get a free coffee of your choice!',
    heroImageUrl: 'https://images.unsplash.com/photo-1511920183359-b1b5f55c6d4b?q=80&w=2670&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
    termsAndConditions: ['Offer valid for one-time use.', 'Cannot be combined with other offers.'],
  },
  {
    id: '5',
    title: 'Bookworm Rewards',
    business: 'The Reading Nook',
    pointsCost: 150,
    description: 'Get a 20% discount on your next book purchase.',
    heroImageUrl: 'https://images.unsplash.com/photo-1532012197267-da84d127e765?q=80&w=2574&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
    termsAndConditions: ['Discount applies to books only.', 'Valid for in-store purchases.'],
  },
  {
    id: '6',
    title: 'Tech Gadget Expo',
    business: 'Tech World',
    pointsCost: 200,
    description: 'Get a free entry pass to the Tech Gadget Expo.',
    heroImageUrl: 'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?q=80&w=2670&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
    termsAndConditions: ['Pass is valid for one person.', 'Event dates are subject to change.'],
  },
  {
    id: '7',
    title: 'Free Movie Ticket',
    business: 'Cineplex',
    pointsCost: 50,
    description: 'Enjoy a movie on us!',
    heroImageUrl: 'https://images.unsplash.com/photo-1536440136628-849c177e76a1?q=80&w=2574&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
    termsAndConditions: ['Valid for standard screenings only.', 'Not valid on holidays.'],
  },
];