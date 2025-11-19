// src/components/reward/RewardLevelsSection.tsx
import React from 'react';
import { Globe, Flag, MapPin, Radar } from 'lucide-react';

interface RewardLevelCardProps {
  icon: React.ElementType; // Now accepts a React component
  title: string;
  description: string;
}

const RewardLevelCard: React.FC<RewardLevelCardProps> = ({ icon: Icon, title, description }) => {
  return (
    <div className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg hover:scale-105 transition-all duration-300 cursor-pointer flex flex-col items-center text-center">
      <div className="text-4xl text-orange-500 mb-4">
        <Icon className="w-10 h-10" /> {/* Render Lucide icon */}
      </div>
      <h3 className="text-xl font-semibold text-gray-800 mb-2">{title}</h3>
      <p className="text-gray-600 mb-4">{description}</p>
      
      
    </div>
  );
};

const RewardLevelsSection: React.FC = () => {
  const rewardLevels = [
    {
      icon: Globe, // Use Lucide Globe icon
      title: 'Global Rewards',
      description: 'Rewards available everywhere. Worldwide challenges, seasonal global events, international promotions, universal digital offers.',
    },
    {
      icon: Flag, // Use Lucide Flag icon
      title: 'National Rewards',
      description: 'Rewards created for a whole country. Country-wide campaigns, large brand promotions, national holiday rewards.',
    },
    {
      icon: MapPin, // Use Lucide MapPin icon
      title: 'Hyperlocal Rewards',
      description: 'Rewards for a specific town, area, or region. Town-only deals, area-specific stamp cards, local business rewards.',
    },
    {
      icon: Radar, // Use Lucide Radar icon
      title: 'Nearby (Near-Me) Rewards',
      description: 'Rewards triggered by being near a business. Scan-to-reveal deals, location-based bonuses, offers appearing when you\'re nearby.',
    },
  ];

  return (
    <section className="bg-gray-50 py-16 md:py-24">
      <div className="container mx-auto px-4">
        <h2 className="text-3xl md:text-4xl font-bold text-gray-900 text-center mb-12">Our Four Reward Levels</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {rewardLevels.map((level, index) => (
            <RewardLevelCard key={index} {...level} />
          ))}
        </div>
      </div>
    </section>
  );
};

export default RewardLevelsSection;
