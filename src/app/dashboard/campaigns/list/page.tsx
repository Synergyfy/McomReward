'use client';

import React, { useState, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import Image from 'next/image';
import Link from 'next/link';
import { ClaimableCampaignsTicker } from '@/components/customer/ClaimableCampaignsTicker';

// Mock data for prototype - consistent with campaign builder preview
const mockCampaigns = [
  {
    id: '1',
    campaignName: 'Summer Sale Spectacular',
    campaignMessage: 'Get ready for our biggest sale of the season! Earn double points on all purchases.',
    reward: { id: '1', title: 'Summer Voucher ($50)' },
    rewardsAvailable: 100,
    ctaButtonText: 'Claim Reward',
    imageUrl: 'https://images.unsplash.com/photo-1483985988355-763728e1935b?q=80&w=2670&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
    logoUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=2564&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
    status: 'active',
  },
  {
    id: '2',
    campaignName: 'Refer a Friend, Get $100',
    campaignMessage: 'Invite your friends to join and you both get a $100 gift card on us!',
    reward: { id: '2', title: 'Gift Card ($100)' },
    rewardsAvailable: 50,
    ctaButtonText: 'Refer & Earn',
    imageUrl: 'https://images.unsplash.com/photo-1529592691919-7a6aa481f520?q=80&w=2574&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
    logoUrl: 'https://images.unsplash.com/photo-1554151228-14d9def656e4?q=80&w=2572&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
    status: 'active',
  },
  {
    id: '3',
    campaignName: 'Holiday Joy Campaign',
    campaignMessage: 'Spread the holiday cheer with 20% off your next purchase.',
    reward: { id: '3', title: 'Discount Coupon (20% off)' },
    rewardsAvailable: 200,
    ctaButtonText: 'Join Now',
    imageUrl: 'https://images.unsplash.com/photo-1577985051167-5d8571a29a2e?q=80&w=2670&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
    logoUrl: 'https://images.unsplash.com/photo-1599566150163-29194dcaad36?q=80&w=2574&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
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

        <ClaimableCampaignsTicker />

        {filteredCampaigns.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500 text-lg">No campaigns found. Create your first campaign!</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredCampaigns.map((campaign) => (
              <Card key={campaign.id} className="bg-white rounded-lg shadow-lg overflow-hidden border border-gray-200 transform hover:-translate-y-1 transition-transform duration-300">
                <div className="relative h-48 w-full overflow-hidden bg-gray-200">
                    {campaign.imageUrl && (
                        <Image src={campaign.imageUrl} alt={campaign.campaignName} layout="fill" objectFit="cover" />
                    )}
                    <Badge variant={campaign.status === 'active' ? 'default' : 'secondary'} className="absolute top-3 right-3 text-sm px-3 py-1">
                        {campaign.status === 'active' ? 'Active' : 'Expired'}
                    </Badge>
                </div>
                <div className="relative px-5">
                    <div className="absolute -top-12 left-1/2 -translate-x-1/2">
                        <div className="relative h-24 w-24 rounded-full overflow-hidden border-4 border-white bg-gray-300 shadow-md">
                            {campaign.logoUrl ? (
                                <Image src={campaign.logoUrl} alt={`${campaign.campaignName} Logo`} layout="fill" objectFit="cover" />
                            ) : (
                                <div className="h-full w-full flex items-center justify-center text-gray-500">
                                    <span className="text-xs">Logo</span>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
                <CardContent className="pt-16 p-5 text-center">
                  <h5 className="font-extrabold text-xl text-gray-900 mb-2 truncate">{campaign.campaignName}</h5>
                  <p className="text-gray-600 text-sm mb-4 h-10 overflow-hidden text-ellipsis">{campaign.campaignMessage}</p>
                  
                  <div className="space-y-2 text-sm text-gray-800 my-5 border-t pt-4">
                      <div className="flex justify-between">
                          <span className="font-medium text-gray-600">Reward:</span>
                          <span className="font-semibold text-right">{campaign.reward.title}</span>
                      </div>
                      <div className="flex justify-between">
                          <span className="font-medium text-gray-600">Available:</span>
                          <span className="font-semibold text-right">{campaign.rewardsAvailable}</span>
                      </div>
                  </div>

                  <Button className="w-full py-2 text-md font-semibold bg-orange-600 hover:bg-orange-700 transition-colors duration-200">
                    View Campaign
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
