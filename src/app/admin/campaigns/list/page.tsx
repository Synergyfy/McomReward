'use client';

import React, { useState, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import Image from 'next/image';
import Link from 'next/link';
import { useGetAllPublicCampaigns } from '@/services/campaigns/hook';
import { PublicCampaignResponse } from '@/services/campaigns/types';
import LoadingSpinner from '@/components/ui/Loading';

export default function AdminCampaignsPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10); // You can adjust the limit as needed

  const { data, isLoading, isError } = useGetAllPublicCampaigns(page, limit);
  const campaigns = data?.data || [];

  const filteredCampaigns = useMemo(() => {
    return campaigns.filter((campaign: PublicCampaignResponse) => {
      const matchesSearch = campaign.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            (campaign.campaign_message && campaign.campaign_message.toLowerCase().includes(searchTerm.toLowerCase()));
      return matchesSearch;
    });
  }, [searchTerm, campaigns]);

  if (isLoading) {
    return <LoadingSpinner />;
  }

  if (isError) {
    return <div>Error fetching campaigns.</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Manage Campaigns</h1>
            <p className="text-gray-600">Manage and create loyalty campaigns for the platform.</p>
          </div>
          <Link href="/admin/campaigns/create">
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
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredCampaigns.map((campaign: PublicCampaignResponse) => (
              <Card key={campaign.id} className="bg-white rounded-lg shadow-lg overflow-hidden border border-gray-200 transform hover:-translate-y-1 transition-transform duration-300">
                <div className="relative h-48 w-full overflow-hidden bg-gray-200">
                    {campaign.banner_url && (
                        <Image src={campaign.banner_url} alt={campaign.name} layout="fill" objectFit="cover" />
                    )}
                    <Badge variant={!campaign.disabled ? 'default' : 'secondary'} className="absolute top-3 right-3 text-sm px-3 py-1">
                        {!campaign.disabled ? 'Active' : 'Disabled'}
                    </Badge>
                </div>
                <div className="relative px-5">
                    <div className="absolute -top-12 left-1/2 -translate-x-1/2">
                        <div className="relative h-24 w-24 rounded-full overflow-hidden border-4 border-white bg-gray-300 shadow-md">
                            {campaign.logo_url ? (
                                <Image src={campaign.logo_url} alt={`${campaign.name} Logo`} layout="fill" objectFit="cover" />
                            ) : (
                                <div className="h-full w-full flex items-center justify-center text-gray-500">
                                    <span className="text-xs">Logo</span>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
                <CardContent className="pt-16 p-5 text-center">
                  <h5 className="font-extrabold text-xl text-gray-900 mb-2 truncate">{campaign.name}</h5>
                  <p className="text-gray-600 text-sm mb-4 h-10 overflow-hidden text-ellipsis">{campaign.campaign_message}</p>
                  
                  <div className="space-y-2 text-sm text-gray-800 my-5 border-t pt-4">
                      <div className="flex justify-between">
                          <span className="font-medium text-gray-600">Reward:</span>
                          <span className="font-semibold text-right">
                            {campaign.rewards && campaign.rewards.length > 0
                              ? campaign.rewards[0].title
                              : 'N/A'}
                          </span>
                      </div>
                      <div className="flex justify-between">
                          <span className="font-medium text-gray-600">Type:</span>
                          <span className="font-semibold text-right">{campaign.campaign_type}</span>
                      </div>
                      <div className="flex justify-between">
                          <span className="font-medium text-gray-600">Audience:</span>
                          <span className="font-semibold text-right">{campaign.audience_type}</span>
                      </div>
                      <div className="flex justify-between">
                          <span className="font-medium text-gray-600">Quantity:</span>
                          <span className="font-semibold text-right">{campaign.quantity}</span>
                      </div>
                      <div className="flex justify-between">
                          <span className="font-medium text-gray-600">Start Date:</span>
                          <span className="font-semibold text-right">{new Date(campaign.start_date).toLocaleDateString()}</span>
                      </div>
                      <div className="flex justify-between">
                          <span className="font-medium text-gray-600">End Date:</span>
                          <span className="font-semibold text-right">{new Date(campaign.end_date).toLocaleDateString()}</span>
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
