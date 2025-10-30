'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Gift, Ticket, ShoppingBag, Star } from "lucide-react";
import Image from 'next/image';

const allRewards = [
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
    title: 'Gift Card ($50)',
    description: 'A gift card to spend on anything you like in our store.',
    points: 500,
    image: 'https://images.unsplash.com/photo-1579621970795-87f943b9e7a6?q=80&w=2670&auto=format&fit=crop&ixlib=rb-4.0.3',
    icon: Gift,
  },
  {
    id: '5',
    title: 'Premium Membership (1 Month)',
    description: 'Unlock exclusive features and benefits for one month.',
    points: 750,
    image: 'https://images.unsplash.com/photo-1590283149002-3f5a70f0b1f2?q=80&w=2670&auto=format&fit=crop&ixlib=rb-4.0.3',
    icon: Star,
  },
  {
    id: '6',
    title: 'Dinner for Two',
    description: 'Enjoy a romantic dinner at our partner restaurant.',
    points: 1200,
    image: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?q=80&w=2670&auto=format&fit=crop&ixlib=rb-4.0.3',
    icon: Gift,
  },
  {
    id: '7',
    title: 'Electronics Voucher ($100)',
    description: 'Get a $100 voucher for your next electronics purchase.',
    points: 1500,
    image: 'https://images.unsplash.com/photo-1526178613552-2b45c6c302f0?q=80&w=2670&auto=format&fit=crop&ixlib=rb-4.0.3',
    icon: ShoppingBag,
  },
  {
    id: '8',
    title: 'Luxury Watch',
    description: 'A high-end luxury watch for our most loyal customers.',
    points: 5000,
    image: 'https://images.unsplash.com/photo-1523275335684-c62162fe2115?q=80&w=2670&auto=format&fit=crop&ixlib=rb-4.0.3',
    icon: Gift,
  },
];

export default function RedeemPointsPage() {
  const [userPoints, setUserPoints] = useState(300); // Mock user's current points

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8 text-center">
          <h1 className="text-4xl font-extrabold text-gray-800">Redeem Your Points</h1>
          <p className="mt-2 text-lg text-gray-600">Current Points: <span className="font-bold text-orange-600">{userPoints}</span></p>
        </div>

        {/* Rewards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {allRewards.map((reward) => {
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
                  <CardDescription className="text-lg text-gray-700 mb-4 h-20">
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
