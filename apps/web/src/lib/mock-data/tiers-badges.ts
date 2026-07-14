// src/lib/mock-data/tiers-badges.ts

export interface BusinessTier {
  id: string;
  name: string;
  description: string;
  criteria: string[];
  privileges: string[];
  icon: string; // Lucide icon name
  color: string; // Hex code or Tailwind color class
}

export interface ConsumerBadge {
  id: string;
  name: string;
  description: string;
  criteria: string[];
  privileges: string[];
  icon: string; // Lucide icon name
  color: string; // Hex code or Tailwind color class
}

export const mockBusinessTiers: BusinessTier[] = [
  {
    id: 'tier-starter',
    name: 'Starter',
    description: 'Basic tier for new businesses.',
    criteria: ['0-1000 Points', '0-5 Campaigns Created'],
    privileges: ['Basic Analytics', 'Standard Support'],
    icon: 'Star',
    color: '#a8a29e', // Stone 400
  },
  {
    id: 'tier-active',
    name: 'Active',
    description: 'For businesses actively running campaigns.',
    criteria: ['1001-5000 Points', '6-20 Campaigns Created'],
    privileges: ['Advanced Analytics', 'Priority Support', 'Early Access to Features'],
    icon: 'Activity',
    color: '#fcd34d', // Amber 300
  },
  {
    id: 'tier-trusted',
    name: 'Trusted',
    description: 'Established businesses with high engagement.',
    criteria: ['5001-10000 Points', '21-50 Campaigns Created'],
    privileges: ['Dedicated Account Manager', 'Custom Branding Options'],
    icon: 'ShieldCheck',
    color: '#34d399', // Emerald 400
  },
  {
    id: 'tier-partner',
    name: 'Partner',
    description: 'Top-tier businesses with significant contributions.',
    criteria: ['10000+ Points', '50+ Campaigns Created'],
    privileges: ['Co-marketing Opportunities', 'Exclusive Beta Access'],
    icon: 'Handshake',
    color: '#60a5fa', // Blue 400
  },
];

export const mockConsumerBadges: ConsumerBadge[] = [
  {
    id: 'badge-bronze',
    name: 'Bronze',
    description: 'Entry-level badge for new consumers.',
    criteria: ['0-500 Points', '0-2 Campaigns Joined'],
    privileges: ['Standard Rewards Access'],
    icon: 'Award',
    color: '#b45309', // Amber 800
  },
  {
    id: 'badge-silver',
    name: 'Silver',
    description: 'For consumers showing consistent engagement.',
    criteria: ['501-2000 Points', '3-10 Campaigns Joined'],
    privileges: ['Exclusive Discounts', 'Birthday Bonus'],
    icon: 'Award',
    color: '#94a3b8', // Slate 400
  },
  {
    id: 'badge-gold',
    name: 'Gold',
    description: 'High-value consumers with significant activity.',
    criteria: ['2001-5000 Points', '11-25 Campaigns Joined'],
    privileges: ['Priority Customer Service', 'Early Access to Deals'],
    icon: 'Award',
    color: '#fbbf24', // Amber 400
  },
  {
    id: 'badge-platinum',
    name: 'Platinum',
    description: 'Our most loyal and active consumers.',
    criteria: ['5000+ Points', '25+ Campaigns Joined'],
    privileges: ['Personalized Offers', 'VIP Event Invitations'],
    icon: 'Award',
    color: '#67e8f9', // Cyan 300
  },
];
