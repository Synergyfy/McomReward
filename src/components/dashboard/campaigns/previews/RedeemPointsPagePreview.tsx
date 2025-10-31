'use client';

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Gift, Ticket, ShoppingBag, Star } from "lucide-react";
import Image from 'next/image';
import { CampaignFormData } from "@/context/CampaignFormContext";

interface RedeemPointsPagePreviewProps {
  campaignData: CampaignFormData;
}

const mockRewards = [
  {
    id: '1',
    title: 'Free Coffee',
    description: 'Enjoy a complimentary cup of our finest brewed coffee.',
    points: 50,
    image: 'https://images.unsplash.com/photo-1511920183359-3b1d1b4a32d6?q=80&w=2670&auto=format&fit=crop&ixlib=rb-4.0.3',
    icon: Gift,
  },
  {
    id: '2',
    title: '10% Discount Voucher',
    description: 'Get 10% off your next purchase in-store or online.',
    points: 100,
    image: 'https://images.unsplash.com/photo-1529592691919-7a6aa481f520?q=80&w=2574&auto=format&fit=crop&ixlib=rb-4.0.3',
    icon: Ticket,
  },
  {
    id: '3',
    title: 'Exclusive Tote Bag',
    description: 'A stylish and reusable tote bag, perfect for your shopping.',
    points: 250,
    image: 'https://images.unsplash.com/photo-1544441893-675d73b31985?q=80&w=2670&auto=format&fit=crop&ixlib=rb-4.0.3',
    icon: ShoppingBag,
  },
    {
    id: '4',
    title: 'Gift Card ()',
    description: 'A gift card to spend on anything you like in our store.',
    points: 500,
    image: 'https://images.unsplash.com/photo-1579621970795-87f943b9e7a6?q=80&w=2670&auto=format&fit=crop&ixlib=rb-4.0.3',
    icon: Gift,
  },
];

export default function RedeemPointsPagePreview({ campaignData }: RedeemPointsPagePreviewProps) {
  const userPoints = 300; // Mock user's current points for preview

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8 text-center">
          <h1 className="text-4xl font-extrabold text-gray-800">{campaignData.redeemTitle || 'Redeem Your Points'}</h1>
          <p className="mt-2 text-lg text-gray-600">{campaignData.redeemText || 'Use your points to claim exclusive rewards and discounts.'} Current Points: <span className="font-bold text-orange-600">{userPoints}</span></p>
        </div>

        {/* Rewards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {mockRewards.map((reward) => {
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
