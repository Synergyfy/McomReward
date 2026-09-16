'use client';

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Gift, Ticket, ShoppingBag, Star } from "lucide-react";
import Image from 'next/image';
import { CampaignFormData } from "@/context/CampaignFormContext";
import { useGetRewards } from "@/services/rewards/hook";

interface RedeemPointsPagePreviewProps {
  campaignData: CampaignFormData;
}

export default function RedeemPointsPagePreview({ campaignData }: RedeemPointsPagePreviewProps) {
  const { data: rewardsData } = useGetRewards(1, 100);
  const rewards = (rewardsData?.data ?? []).map((reward) => ({
    id: reward.id,
    title: reward.title,
    description: reward.description,
    points: reward.pointRequired ?? reward.maxPoints ?? 0,
    image: reward.image || '/placeholder-qr.svg',
    icon: Gift,
  }));
  const userPoints = 300; // Preview user's current points

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8 text-center">
          <h1 className="text-4xl font-extrabold text-gray-800">{campaignData.redeemTitle || 'Redeem Your Points'}</h1>
          <div className="mt-2 text-lg text-gray-600">
            <span dangerouslySetInnerHTML={{ __html: campaignData.redeemText || 'Use your points to claim exclusive rewards and discounts.' }} />
            {' '}
            Current Points: <span className="font-bold text-orange-600">{userPoints}</span>
          </div>
        </div>

        {/* Rewards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {rewards.length === 0 && (
            <p className="col-span-full text-center text-gray-500">No rewards available for this campaign.</p>
          )}
          {rewards.map((reward) => {
            const canRedeem = userPoints >= reward.points;
            return (
              <Card key={reward.id} className="overflow-hidden shadow-lg hover:shadow-xl transition-shadow duration-300 flex flex-col">
                <div className="relative h-48 w-full">
                  <Image
                    src={reward.image}
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
                    <span className="text-xl font-bold text-orange-600">{reward.points} pts</span>
                    <reward.icon className="h-8 w-8 text-gray-400" />
                  </div>
                  <Button 
                    className="w-full bg-orange-600 hover:bg-orange-700 text-white font-bold py-3 px-4 rounded-lg transition-all duration-300 transform hover:scale-105"
                    disabled={!canRedeem}
                  >
                    {canRedeem ? 'Redeem' : `Requires ${reward.points} points`}
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
