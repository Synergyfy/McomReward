// data/demo/customerDemoData.ts
import { Campaign, DemoReward, DemoWishlist, DemoTransaction, DemoPointsTransaction } from "@/app/(customer)/type";





export const DEMO_REWARDS: DemoReward[] = [
  {
    id: 1,
    title: "₦5,000 Shopping Voucher",
    type: "Voucher",
    requiredPoints: 300,
    badgeLevel: "Silver",
    description: "Get a ₦5,000 voucher to spend at select stores.",
    expiry: "2025-12-31",
  },
  {
    id: 2,
    title: "Spa Day Experience",
    type: "Product",
    requiredPoints: 450,
    badgeLevel: "Gold",
    description: "Indulge in a luxurious spa day with this exclusive experience.",
    expiry: "2025-11-15",
  },
  {
    id: 3,
    title: "10% Discount Coupon",
    type: "Discount",
    requiredPoints: 100,
      badgeLevel: "Bronze",
    description: "Enjoy a 10% discount on your next purchase at participating outlets.",
    expiry: "2025-10-31",
  },

  {
    id: 4,
    title: "Free Product Sample Box",
    type: "Product",
    requiredPoints: 300,
    badgeLevel: "Bronze",
      description: "Receive a curated sample box of trending products.",
    expiry: "2025-12-15",
    
  },
];


// app/(customer)/data/demoClaimedRewards.ts
export const DEMO_CLAIMED_REWARDS = [
  {
    id: 1,
    title: "₦5,000 Gift Card",
    code: "GFT-9321-XYQ",
    type: "Gift Card",
    claimedDate: "Oct 12, 2025",
    expiryDate: "Dec 12, 2025",
  },
  {
    id: 2,
    title: "Spa Day Voucher",
    code: "SPA-8888-GLD",
    type: "Voucher",
    claimedDate: "Oct 20, 2025",
    expiryDate: "Jan 20, 2026",
  },
];


export const DEMO_WISHLIST: DemoWishlist[] = [
  {
    id: 1,
    name: "Luxury Spa Day",
    category: "Health & Beauty",
    occasion: "Birthday",
    targetDate: "2025-11-10",
    priority: "High",
  },
  {
    id: 2,
    name: "Dinner for Two",
    category: "Hospitality",
    occasion: "Anniversary",
    targetDate: "2025-12-01",
    priority: "Medium",
  },
];

export const DEMO_POINTS_TRANSACTIONS: DemoPointsTransaction[] = [
  {
    id: 1,
    type: "Earned",
    source: "Summer Sale Campaign",
    date: "2025-09-15",
    points: 150,
  },
  {
    id: 2,
    type: "Redeemed",
    source: "Coffee Club Reward",
    date: "2025-10-01",
    points: -50,
  },
  {
    id: 3,
    type: "Bonus (Matching)",
    source: "Referral Campaign",
    date: "2025-10-10",
    points: 100,
  },
  {
    id: 4,
    type: "Earned",
    source: "Holiday Giveaway",
    date: "2025-10-20",
    points: 200,
  },
];

export const DEMO_TRANSACTIONS: DemoTransaction[] = [
  {
    id: 1,
    description: "Joined Weekend Brunch Rewards",
    type: "Earned",
    amount: 150,
    date: "2025-10-10",
  },
  {
    id: 2,
    description: "Redeemed ₦5,000 Voucher",
    type: "Redeemed",
    amount: -300,
    date: "2025-10-15",
  },
  {
    id: 3,
    description: "Referral Bonus",
    type: "Earned",
    amount: 200,
    date: "2025-09-20",
  },
];



// const demoCampaigns: Campaign[] = [
//   {
//     id: 101,
//     title: "Wellness Weekend",
//     category: "Health & Wellness",
//     occasion: "Birthday",
//     reward: "Free Spa Treatment",
//   },
//   {
//     id: 102,
//     title: "Couples Dinner Delight",
//     category: "Food & Dining",
//     occasion: "Anniversary",
//     reward: "2-for-1 Meal Voucher",
//   },
//   {
//     id: 103,
//     title: "Gadget Fiesta",
//     category: "Electronics",
//     occasion: "Holiday",
//     reward: "Discounted Smartwatch",
//   },
// ];

export const DEMO_CAMPAIGNS: Campaign[] = [
  {
    id: 1,
    title: "Summer Bonus Points",
    business: "Café Bliss",
    category: "Electronics",
    occasion: "Holiday",
    rewardType: "Free Drink",
    points: 120,
    status: "Active",
    expiryDate: "Dec 10, 2025",
  },
  {
    id: 2,
    title: "Spa Loyalty Offer",
    business: "Zen Spa",
    category: "Health & Beauty",
    occasion: "Relaxation",
    rewardType: "10% Discount",
    points: 200,
    status: "Completed",
    expiryDate: "Nov 30, 2025",
  },
  {
    id: 3,
    title: "Weekend Shopping Rush",
    business: "UrbanMart",
    category: "Health & Wellness",
    occasion: "Shopping",
    rewardType: "₦1000 Voucher",
    points: 300,
    status: "Expired",
    expiryDate: "Oct 5, 2025",
  },
];


export const DEMO_AVAILABLE_CAMPAIGNS: Campaign[] =
    [
  {
    id: 4,
    title: "Holiday Giveaway",
    business: "Blossom Boutique",
    category: "Fashion",
    occasion: "Holiday",
    rewardType: "Gift Voucher",
    points: 150,
    status: "Available",
    expiryDate: "Dec 24, 2025",
    joined: false,
  },
  {
    id: 5,
    title: "Refer & Earn",
      business: "UrbanTech Gadgets",
    category: "Electronics",
    rewardType: "Bonus Points",
    points: 100,
    status: "Available",
    expiryDate: "Jan 5, 2026",
    joined: false,
  },
  {
    id: 6,
    title: "Festive Fitness Drive",
      business: "Peak Gym",
      category: "Health & Wellness",
      occasion: "New Year",
    
    rewardType: "Free Session",
    points: 80,
    status: "Available",
    expiryDate: "Dec 31, 2025",
    joined: false,
  },
  {
    id: 7,
    title: "Birthday Beauty Perks",
      business: "Glow Studio",
      category: "Health & Beauty",
        occasion: "Birthday",
    rewardType: "Discount",
    points: 120,
    status: "Available",
    expiryDate: "Feb 1, 2026",
    joined: false,
  },
  {
    id: 8,
    title: "Coffee Club Reward",
    business: "Café Bliss",
    category: "Food & Dining",
    occasion: "Coffee Break",
    rewardType: "Free Drink",
    points: 50,
    status: "Available",
    expiryDate: "Mar 10, 2026",
    joined: false,
  },
];

// Simulated wishlist (user preferences)
export const DEMO_WISHLIST_PREFERENCES = {
  categories: ["Spa", "Fashion", "Café"],
  rewardPreferences: ["Discount", "Free Drink", "Gift Voucher"],
};

export const DEMO_POINTS = {
  totalPoints: 1250,
  matchingPoints: 400,
  expiryDate: "2026-01-30",
};


// app/(customer)/data/demoNotifications.ts
export const DEMO_NOTIFICATIONS = [
  {
    id: 1,
    type: "campaign",
    title: "New Campaign Available!",
    message: "Join 'Summer Treats 2025' and earn double points 🎉",
    timestamp: "2025-10-22T14:00:00Z",
    read: false,
  },
  {
    id: 2,
    type: "reward",
    title: "Reward Expiring Soon",
    message: "Your ₦5,000 Gift Card will expire in 3 days. Redeem now!",
    timestamp: "2025-10-20T08:00:00Z",
    read: false,
  },
  {
    id: 3,
    type: "wishlist",
    title: "We Found a Match 🎁",
    message: "A 'Spa Day' campaign matches your wishlist!",
    timestamp: "2025-10-19T09:30:00Z",
    read: true,
  },
  {
    id: 4,
    type: "activity",
    title: "Points Earned",
    message: "You earned 150 points for completing 'Refer a Friend'.",
    timestamp: "2025-10-18T11:00:00Z",
    read: true,
  },
];
