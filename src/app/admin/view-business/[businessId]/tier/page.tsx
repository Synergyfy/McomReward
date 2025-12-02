'use client';

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import TierProgressCard from '@/components/dashboard/tier/TierProgressCard';
import TierBenefits from '@/components/dashboard/tier/TierBenefits';
import { tierData } from '@/lib/mock-data/tiers'; // Still use tierData for benefits/requirements
import { Badge } from '@/components/ui/badge';
import { useParams } from 'next/navigation'; // Import useParams
import { useGetMySubscription } from '@/services/tiers/hook'; // Import the updated hook

export default function TierPage() {
  const params = useParams();
  const businessId = params.businessId as string;

  const { data: subscription, isLoading, isError } = useGetMySubscription(businessId);

  if (isLoading) {
    return <div>Loading tier data...</div>;
  }

  if (isError || !subscription) {
    return <div>Error loading tier data.</div>;
  }

  // Get current tier name from the subscription
  const currentTierName = subscription.tier.name;
  const currentTier = tierData.find(t => t.name.toLowerCase() === currentTierName.toLowerCase());

  // Determine next tier (simple logic for now, could be more complex based on backend)
  const allTierNames = tierData.map(t => t.name.toLowerCase());
  const currentIndex = allTierNames.indexOf(currentTierName.toLowerCase());
  const nextTierName = currentIndex !== -1 && currentIndex < allTierNames.length - 1
    ? allTierNames[currentIndex + 1]
    : currentTierName; // If last tier, next is current

  const nextTier = tierData.find(t => t.name.toLowerCase() === nextTierName.toLowerCase());

  // Placeholder for progress, as it's not available in TierResponse
  const progress = 0; // The original page had tierProgress = 0, keeping this for now

  if (!currentTier) {
    return <div>Current tier information not found in mock data.</div>; // Should not happen with valid data
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
      {nextTier && (
        <TierProgressCard
          currentTier={currentTier}
          nextTier={nextTier}
          progress={progress}
        />
      )}

      {/* All Tier Benefits */}
      <TierBenefits tiers={tierData} currentTierName={currentTier.name} />
    </div>
  );
}
