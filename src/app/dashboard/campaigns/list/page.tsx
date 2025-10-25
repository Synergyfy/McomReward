'use client';

import React, { useState, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import Image from 'next/image';
import Link from 'next/link';

// Mock data for prototype - consistent with campaign builder preview
const mockCampaigns = [
  {
    id: '1',
    campaignName: 'Summer Sale Spectacular',
    campaignMessage: 'Get ready for our biggest sale of the season! Earn double points on all purchases.',
    reward: { id: '1', title: 'Summer Voucher ($50)' },
    rewardsAvailable: 100,
    ctaButtonText: 'Claim Reward',
    imageUrl: 'https://via.placeholder.com/300x150',
    status: 'active',
  },
  {
    id: '2',
    campaignName: 'Refer a Friend, Get $100',
    campaignMessage: 'Invite your friends to join and you both get a $100 gift card on us!',
    reward: { id: '2', title: 'Gift Card ($100)' },
    rewardsAvailable: 50,
    ctaButtonText: 'Refer & Earn',
    imageUrl: 'https://via.placeholder.com/300x150',
    status: 'active',
  },
  {
    id: '3',
    campaignName: 'Holiday Joy Campaign',
    campaignMessage: 'Spread the holiday cheer with 20% off your next purchase.',
    reward: { id: '3', title: 'Discount Coupon (20% off)' },
    rewardsAvailable: 200,
    ctaButtonText: 'Join Now',
    imageUrl: 'https://via.placeholder.com/300x150',
    status: 'expired',
  },
];

export default function CampaignsListPage() {
  const [searchTerm, setSearchTerm] = useState('');

  const filteredCampaigns = useMemo(() => {
    return mockCampaigns.filter((campaign) => {
      const matchesSearch = campaign.campaignName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            campaign.campaignMessage.toLowerCase().includes(searchTerm.toLowerCase());
      return matchesSearch;
    });
  }, [searchTerm]);

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">My Campaigns</h1>
            <p className="text-gray-600">Manage and create your loyalty campaigns.</p>
          </div>
          <Link href="/dashboard/campaigns/create">
            <Button>Create New Campaign</Button>
          </Link>
        </div>

        <div className="mb-8">
          <Input
            placeholder="Search campaigns..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full max-w-sm"
          />
        </div>

        {filteredCampaigns.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500 text-lg">No campaigns found. Create your first campaign!</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredCampaigns.map((campaign) => (
              <Card key={campaign.id} className="hover:shadow-lg transition-shadow duration-200 bg-white rounded-lg shadow-md">
                {campaign.imageUrl && (
                  <div className="relative h-40 w-full rounded-t-lg overflow-hidden">
                    <Image src={campaign.imageUrl} alt={campaign.campaignName} layout="fill" objectFit="cover" />
                  </div>
                )}
                <CardContent className="p-4">
                  <h5 className="font-bold text-xl mb-1">{campaign.campaignName}</h5>
                  <p className="text-gray-600 text-sm mb-2">{campaign.campaignMessage}</p>
                  <div className="flex justify-between items-center text-sm text-gray-500 mb-3">
                    <span>Reward: {campaign.reward.title}</span>
                    <span>Available: {campaign.rewardsAvailable}</span>
                  </div>
                  <Button className="w-full" disabled>{campaign.ctaButtonText}</Button>
                  <Badge variant={campaign.status === 'active' ? 'default' : 'secondary'} className="absolute top-2 right-2">
                    {campaign.status === 'active' ? 'Active' : 'Expired'}
                  </Badge>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
