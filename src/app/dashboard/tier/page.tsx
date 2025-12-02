'use client';

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import TierProgressCard from '@/components/dashboard/tier/TierProgressCard';
import TierBenefits from '@/components/dashboard/tier/TierBenefits';
import { tierData, userTierStatus } from '@/lib/mock-data/tiers';
import { Badge } from '@/components/ui/badge';

export default function TierPage() {
  const currentTier = tierData.find(t => t.name === userTierStatus.currentTier);
  const nextTier = tierData.find(t => t.name === userTierStatus.nextTier);

  if (!currentTier || !nextTier) {
    return <div>Error loading tier data.</div>; // Or a loading state
  }

  return (
    <div className="space-y-8">
      <h1 className="text-3xl font-bold text-gray-800">Your Tier Status</h1>

      {/* Current Tier Display */}
      <Card className="bg-gradient-to-r from-orange-500 to-yellow-500 text-white">
        <CardHeader>
          <CardTitle>Current Tier</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-4xl font-extrabold">{currentTier.name}</p>
          <p className="mt-2">You have unlocked the following benefits:</p>
          <ul className="list-disc list-inside mt-2">
            {currentTier.benefits.map((benefit, index) => (
              <li key={index}>{benefit}</li>
            ))}
          </ul>
        </CardContent>
      </Card>

      {/* Progress to Next Tier */}
      <TierProgressCard
        currentTier={currentTier}
        nextTier={nextTier}
        progress={userTierStatus.progress}
      />

      {/* All Tier Benefits */}
      <TierBenefits tiers={tierData} currentTierName={currentTier.name} />
    </div>
  );
}
