export type BusinessUser = {
  id: string;
  name: string;
  email: string;
  tier: string;
  sector: string; // e.g., 'Food & Dining', 'Fashion & Beauty'
  referralCapacity: number;
  activityStatus: 'Active' | 'Disabled';
  campaignsCreated: number;
  rewardsAttached: number;
  pointsBalance: number;
  memberSince: Date;
};

export type ConsumerUser = {
  id: string;
  name: string;
  email: string;
  badgeLevel: 'BRONZE' | 'SILVER' | 'GOLD' | 'PLATINUM' | 'None';
  location: string;
  activity: 'High' | 'Medium' | 'Low';
  campaignsJoined: number;
  rewardsRedeemed: number;
  points: number;
  matchingPoints: number;
  joinedDate: Date;
};

export const mockBusinessUsers: BusinessUser[] = [
  {
    id: 'biz-001',
    name: 'The Gourmet Place',
    email: 'contact@gourmetplace.com',
    tier: 'Partner',
    sector: 'Food & Dining',
    referralCapacity: 50,
    activityStatus: 'Active',
    campaignsCreated: 12,
    rewardsAttached: 8,
    pointsBalance: 50000,
    memberSince: new Date('2023-01-15'),
  },
  {
    id: 'biz-002',
    name: 'Chic Boutique',
    email: 'style@chicboutique.com',
    tier: 'Trusted',
    sector: 'Fashion & Beauty',
    referralCapacity: 30,
    activityStatus: 'Active',
    campaignsCreated: 5,
    rewardsAttached: 10,
    pointsBalance: 25000,
    memberSince: new Date('2023-03-22'),
  },
  {
    id: 'biz-003',
    name: 'Wellness Wonders',
    email: 'support@wellness.com',
    tier: 'Active',
    sector: 'Health & Wellness',
    referralCapacity: 20,
    activityStatus: 'Disabled',
    campaignsCreated: 2,
    rewardsAttached: 1,
    pointsBalance: 1000,
    memberSince: new Date('2023-08-10'),
  },
  {
    id: 'biz-004',
    name: 'Startup Solutions',
    email: 'hello@startups.com',
    tier: 'Starter',
    sector: 'Technology',
    referralCapacity: 10,
    activityStatus: 'Disabled',
    campaignsCreated: 0,
    rewardsAttached: 0,
    pointsBalance: 0,
    memberSince: new Date('2023-11-01'),
  },
];

export const mockConsumerUsers: ConsumerUser[] = [
  {
    id: 'con-001',
    name: 'Alice Johnson',
    email: 'alice.j@example.com',
    badgeLevel: 'GOLD',
    location: 'London, UK',
    activity: 'High',
    campaignsJoined: 25,
    rewardsRedeemed: 10,
    points: 12500,
    matchingPoints: 3000,
    joinedDate: new Date('2023-02-01'),
  },
  {
    id: 'con-002',
    name: 'Bob Williams',
    email: 'bob.w@example.com',
    badgeLevel: 'SILVER',
    location: 'Manchester, UK',
    activity: 'Medium',
    campaignsJoined: 10,
    rewardsRedeemed: 3,
    points: 4500,
    matchingPoints: 500,
    joinedDate: new Date('2023-05-15'),
  },
  {
    id: 'con-003',
    name: 'Charlie Brown',
    email: 'charlie.b@example.com',
    badgeLevel: 'BRONZE',
    location: 'Bristol, UK',
    activity: 'Low',
    campaignsJoined: 2,
    rewardsRedeemed: 1,
    points: 800,
    matchingPoints: 100,
    joinedDate: new Date('2023-09-20'),
  },
  {
    id: 'con-004',
    name: 'Diana Miller',
    email: 'diana.m@example.com',
    badgeLevel: 'PLATINUM',
    location: 'Edinburgh, UK',
    activity: 'High',
    campaignsJoined: 50,
    rewardsRedeemed: 25,
    points: 50000,
    matchingPoints: 10000,
    joinedDate: new Date('2022-11-10'),
  },
];
