'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Medal, Trophy, Star, Crown, X } from 'lucide-react';
import { Progress } from '@/components/ui/progress';

interface Tier {
  level: number;
  name: string;
  icon: React.ReactNode;
  color: string;
  benefits: string[];
}

export default function TierProgressPage() {
  const [hoveredTier, setHoveredTier] = useState<string | null>(null);
  const [selectedTier, setSelectedTier] = useState<Tier | null>(null);

  // 🏅 Tier Data
  const tierData = [
    {
      level: 1,
      name: 'Bronze',
      icon: <Medal className="text-amber-700" size={28} />,
      color: 'from-amber-400 to-amber-600',
      benefits: [
        'Access to basic reward templates',
        'Up to 3 active campaigns',
        'Standard support response time',
      ],
    },
    {
      level: 2,
      name: 'Silver',
      icon: <Trophy className="text-gray-500" size={28} />,
      color: 'from-gray-400 to-gray-600',
      benefits: [
        'Access to premium templates',
        'Up to 5 active campaigns',
        'Early access to new features',
      ],
    },
    {
      level: 3,
      name: 'Gold',
      icon: <Star className="text-yellow-500" size={28} />,
      color: 'from-yellow-400 to-yellow-600',
      benefits: [
        'Priority support & onboarding',
        'Unlimited active campaigns',
        'Custom poster branding',
      ],
    },
    {
      level: 4,
      name: 'Platinum',
      icon: <Crown className="text-blue-500" size={28} />,
      color: 'from-blue-400 to-blue-600',
      benefits: [
        'Dedicated account manager',
        'Co-branding with Loyalty CardX',
        'Exclusive partner rewards & invites',
      ],
    },
  ];

  const currentTier = 'Gold'; // example — replace with real user data
  const currentTierData = tierData.find((t) => t.name === currentTier);
  const currentIndex = tierData.findIndex((t) => t.name === currentTier);
  const progressPercent = ((currentIndex + 1) / tierData.length) * 100;

  return (
    <div className="min-h-screen bg-gray-50 py-10 px-4 sm:px-8 md:px-12">
      <div className="max-w-5xl mx-auto bg-white rounded-2xl shadow-lg p-8 md:p-10 relative overflow-hidden">
        {/* Header */}
        <h1 className="text-3xl font-bold text-gray-800 mb-2">
          Your Tier Progress
        </h1>
        <p className="text-gray-500 mb-10">
          Track your growth and unlock exclusive Loyalty CardX benefits as you move up each tier.
        </p>

        {/* 🪜 Tier Progress Visualization */}
        <div className="relative flex justify-between items-center mb-12">
          {tierData.map((tier, index) => (
            <div
              key={tier.name}
              className="relative flex flex-col items-center cursor-pointer"
              onMouseEnter={() => setHoveredTier(tier.name)}
              onMouseLeave={() => setHoveredTier(null)}
              onClick={() => setSelectedTier(tier)}
            >
              <motion.div
                className={`w-14 h-14 rounded-full bg-gradient-to-br ${tier.color} flex items-center justify-center border-4 ${
                  index <= currentIndex ? 'border-green-500' : 'border-gray-200'
                } shadow-md`}
                whileHover={{ scale: 1.1 }}
                transition={{ type: 'spring', stiffness: 300 }}
              >
                {tier.icon}
              </motion.div>

              <p
                className={`mt-3 text-sm md:text-base font-semibold ${
                  index === currentIndex ? 'text-orange-600' : 'text-gray-600'
                }`}
              >
                {tier.name}
              </p>

              {/* Hover Tooltip */}
              <AnimatePresence>
                {hoveredTier === tier.name && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 10 }}
                    transition={{ duration: 0.2 }}
                    className={`absolute ${
                      index === 0
                        ? 'left-0 translate-x-0'
                        : index === tierData.length - 1
                        ? 'right-0 translate-x-0'
                        : '-translate-x-1/2 left-1/2'
                    } top-20 bg-white border border-gray-200 shadow-xl rounded-xl p-4 w-64 text-sm z-10`}
                  >
                    <h3 className="font-semibold text-gray-800 mb-2">
                      {tier.name} Benefits
                    </h3>
                    <ul className="list-disc list-inside text-gray-600 space-y-1">
                      {tier.benefits.map((b, i) => (
                        <li key={i}>{b}</li>
                      ))}
                    </ul>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ))}

          {/* Progress Line */}
          <div className="absolute top-7 left-0 w-full h-2 bg-gray-200 rounded-full -z-10">
            <motion.div
              className="h-2 bg-gradient-to-r from-orange-400 to-orange-600 rounded-full"
              initial={{ width: 0 }}
              animate={{ width: `${progressPercent}%` }}
              transition={{ duration: 1 }}
            />
          </div>
        </div>

        {/* 🎯 Current Tier Summary */}
        <div className="bg-orange-50 border border-orange-100 p-6 rounded-xl">
          <h2 className="text-xl font-semibold text-orange-600">
            Current Tier: {currentTier}
          </h2>
          <p className="text-gray-700 mt-2">
            Keep growing! You’re on your way to unlocking the{' '}
            {tierData[currentIndex + 1]?.name || 'top'} tier.
          </p>

          <div className="mt-5">
            <Progress value={progressPercent} />
          </div>
          <p className="text-sm text-gray-500 mt-2">
            {Math.round(progressPercent)}% complete —{' '}
            {tierData[currentIndex + 1]
              ? `Next tier: ${tierData[currentIndex + 1].name}`
              : 'You’ve reached Platinum! 🎉'}
          </p>
        </div>
      </div>

      {/* 🪟 Tier Modal */}
      <AnimatePresence>
        {selectedTier && (
          <motion.div
            className="fixed inset-0 bg-black/50 flex justify-center items-center z-50"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="bg-white rounded-2xl shadow-xl p-8 w-11/12 max-w-md relative"
            >
              <button
                onClick={() => setSelectedTier(null)}
                className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
              >
                <X size={22} />
              </button>
              <div className="flex flex-col items-center text-center">
                <div
                  className={`w-16 h-16 flex items-center justify-center rounded-full bg-gradient-to-br ${selectedTier.color} shadow-lg mb-4`}
                >
                  {selectedTier.icon}
                </div>
                <h2 className="text-2xl font-bold mb-2">
                  {selectedTier.name} Tier
                </h2>
                <p className="text-gray-600 mb-4">
                  Unlock these exclusive benefits when you reach this tier:
                </p>
                <ul className="list-disc list-inside text-gray-700 text-left space-y-2 mb-6">
                  {selectedTier.benefits.map((b: string, i: number) => (
                    <li key={i}>{b}</li>
                  ))}
                </ul>
                <button className="bg-orange-500 hover:bg-orange-600 text-white font-semibold px-6 py-3 rounded-full transition">
                  {selectedTier.level === currentTierData!.level
                    ? 'Current Tier'
                    : selectedTier.level > currentTierData!.level
                    ? 'Upgrade to this Tier'
                    : 'Max Tier Reached'}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
