'use client';

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Gift, Ticket, ShoppingBag, Star } from "lucide-react";
import Image from 'next/image';
import { CampaignResponse } from "@/services/campaigns/types"; // Import CampaignResponse

interface RedeemPointsPagePreviewProps {
  campaign: CampaignResponse; // Changed from campaignData: CampaignFormData
}

// Helper to get Lucide icon based on reward type or just use a default
const getRewardIcon = (type?: string) => {
    switch(type) {
        case 'discount': return Ticket;
        case 'physical': return ShoppingBag;
        case 'gift_card': return Gift;
        default: return Star; // Default icon
    }
};

export default function RedeemPointsPagePreview({ campaign }: RedeemPointsPagePreviewProps) {
  // Mock user's current points are not relevant in admin preview, buttons will be disabled
  const userPoints = 0; // Not actually used for redemption logic

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8 text-center">
          <h1 className="text-4xl font-extrabold text-gray-800">{campaign.redeemRewardPageTitle || 'Redeem Your Points'}</h1>
          <div className="mt-2 text-lg text-gray-600">
            <span dangerouslySetInnerHTML={{ __html: campaign.redeemRewardPageDescription || 'Use your points to claim exclusive rewards and discounts.' }} />
            {' '}
            {/* Current Points display is not relevant for admin preview */}
            {/* Current Points: <span className="font-bold text-orange-600">{userPoints}</span> */}
          </div>
        </div>

        {/* Rewards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {campaign.rewards?.map((reward) => { // Use campaign.rewards instead of mockRewards
            const Icon = getRewardIcon(reward.type); // Dynamically get icon
            // const canRedeem = userPoints >= reward.points_required; // Not relevant for admin preview
            return (
              <Card key={reward.id} className="overflow-hidden shadow-lg hover:shadow-xl transition-shadow duration-300 flex flex-col">
                <div className="relative h-48 w-full">
                  <Image
                    src={reward.image || 'https://via.placeholder.com/400x300?text=No+Image'}
                    alt={reward.title}
                    layout="fill"
                    objectFit="cover"
                  />
                </div>
                <CardHeader>
                  <CardTitle className="text-2xl font-bold text-gray-800">{reward.title}</CardTitle>
                </CardHeader>
                <CardContent className="flex-grow flex flex-col justify-between">
                  <CardDescription className="text-lg text-gray-700 mb-4 h-20 line-clamp-3">
                    {reward.description}
                  </CardDescription>
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-xl font-bold text-orange-600">{reward.points_required} pts</span>
                    <Icon className="h-8 w-8 text-gray-400" />
                  </div>
                  <Button
                    className="w-full bg-orange-600 hover:bg-orange-700 text-white font-bold py-3 px-4 rounded-lg transition-all duration-300 transform hover:scale-105"
                    disabled={true} // Always disabled for admin preview
                  >
                    View Reward Details {/* Changed text for preview */}
                  </Button>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </div>
  );
}
