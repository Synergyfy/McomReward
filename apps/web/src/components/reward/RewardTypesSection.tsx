// src/components/reward/RewardTypesSection.tsx
import React from 'react';
import { CreditCard, Stamp, Star, Wallet, Share2, QrCode, Users, Calendar, Cake } from 'lucide-react';

interface RewardTypeCardProps {
  icon: React.ElementType; // Now accepts a React component
  title: string;
  bulletPoints: string[];
}

const RewardTypeCard: React.FC<RewardTypeCardProps> = ({ icon: Icon, title, bulletPoints }) => {
  return (
    <div className="flex items-start space-x-4 p-4 bg-white rounded-lg shadow-sm">
      <div className="flex-shrink-0 w-12 h-12 rounded-full bg-orange-100 flex items-center justify-center">
        <Icon className="text-2xl text-orange-600" /> {/* Render Lucide icon */}
      </div>
      <div>
        <h3 className="text-xl font-semibold text-gray-800 mb-2">{title}</h3>
        <ul className="list-disc list-inside text-gray-600 space-y-1">
          {bulletPoints.map((point, idx) => (
            <li key={idx}>{point}</li>
          ))}
        </ul>
      </div>
    </div>
  );
};

const RewardTypesSection: React.FC = () => {
  const rewardTypes = [
    {
      icon: CreditCard, // Use Lucide CreditCard icon
      title: 'Digital Gift Cards',
      bulletPoints: ['Businesses can sell or send gift cards', 'Consumers can redeem or gift them'],
    },
    {
      icon: Stamp, // Use Lucide Stamp icon
      title: 'Stamp Cards (Digital Punch Cards)',
      bulletPoints: ['"Buy 6 Haircuts, Get 1 Free"', '"Buy 4 Coffees, Get 1 Free"'],
    },
    {
      icon: Star, // Use Lucide Star icon
      title: 'Points Rewards',
      bulletPoints: ['Earn points for purchases, scans, sharing deals', 'Points unlock discounts, free items, priority access'],
    },
    {
      icon: Wallet,
      title: 'Credit Rewards',
      bulletPoints: ['Customers earn credits when they book or buy', '"Earn 3% credit on all services this week."'],
    },
    {
      icon: Share2, // Use Lucide Share2 icon
      title: 'Referral Rewards',
      bulletPoints: ['Earn rewards for bringing new customers or businesses', '"Invite a friend, you both get £5 credit."'],
    },
    {
      icon: QrCode, // Use Lucide QrCode icon
      title: 'QR-Triggered Rewards (Scan-to-Earn)',
      bulletPoints: ['Activated by scanning QR plaques or NFC cards', '"Scan to get 20 points."'],
    },
    {
      icon: Users, // Use Lucide Users icon
      title: 'Group Rewards',
      bulletPoints: ['Rewards shared across a whole business group', 'Combined offers, joint bundles, group challenges'],
    },
    {
      icon: Calendar, // Use Lucide Calendar icon
      title: 'Event Rewards',
      bulletPoints: ['Rewards linked to real events', 'Expo treasure hunts, holiday promos, festival bonuses'],
    },
    {
      icon: Cake, // Use Lucide Cake icon
      title: 'Birthday & Personal Rewards',
      bulletPoints: ['Automatic rewards sent on special days', 'Birthdays, Anniversaries, First visit'],
    },
  ];

  return (
    <section className="bg-white py-16 md:py-24">
      <div className="container mx-auto px-4">
        <h2 className="text-3xl md:text-4xl font-bold text-gray-900 text-center mb-12">Types of Rewards You Can Create (or Claim)</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {rewardTypes.map((type, index) => (
            <RewardTypeCard key={index} {...type} />
          ))}
        </div>
      </div>
    </section>
  );
};

export default RewardTypesSection;
