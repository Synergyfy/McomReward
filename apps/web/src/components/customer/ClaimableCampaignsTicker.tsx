'use client';

import React from 'react';
import { Button } from '@/components/ui/button';
import { Award } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { useGetClaimableCampaigns } from '@/services/campaigns/hook';
import { Card, CardContent } from '@/components/ui/card';

export const ClaimableCampaignsTicker = () => {
  const { data: claimableCampaignsData, isLoading } = useGetClaimableCampaigns(1, 10);

  const availableCampaigns = claimableCampaignsData?.data || [];
  const campaignsToShow = 3;

  if (isLoading) {
    return (
      <div className="my-12 p-8 bg-gray-100 rounded-2xl">
        <h3 className="text-3xl font-extrabold text-gray-900 flex items-center mb-6">
          <Award className="w-10 h-10 text-yellow-400 mr-3 drop-shadow-md" />
          <span className="bg-clip-text text-transparent bg-gradient-to-r from-purple-600 to-pink-600">
            Hot Campaigns to Claim
          </span>
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(campaignsToShow)].map((_, i) => (
            <div key={i} className="bg-white rounded-xl shadow-lg h-80 animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  if (availableCampaigns.length === 0) {
    return null;
  }

  return (
    <div className="my-12 p-8 bg-gradient-to-r from-gray-50 to-blue-50 rounded-2xl shadow-inner-lg border border-gray-100">
      <div className="flex justify-between items-center mb-6">
          <div>
              <h3 className="text-3xl font-extrabold text-gray-900 flex items-center">
              <Award className="w-10 h-10 text-yellow-400 mr-3 drop-shadow-md" />
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-purple-600 to-pink-600">
                  Hot Campaigns to Claim
              </span>
              </h3>
              <p className="text-gray-600 mt-1">These popular campaigns are available for you to join right now!</p>
          </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {availableCampaigns.slice(0, campaignsToShow).map((campaign) => (
          <Card
            key={campaign.id}
            className="bg-white rounded-xl shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1 border-0 overflow-hidden group"
          >
            <CardContent className="p-0">
              <div className="relative h-40 w-full">
                {campaign.banner_url || campaign.bannerUrl ? (
                  <Image
                    src={campaign.banner_url || campaign.bannerUrl || ''}
                    alt={campaign.name}
                    layout="fill"
                    objectFit="cover"
                    className="group-hover:scale-105 transition-transform duration-500"
                  />
                ) : (
                  <div className="h-full w-full bg-gradient-to-br from-gray-200 to-gray-300"/>
                )}
                <div className="absolute inset-0 bg-black/20 group-hover:bg-black/40 transition-colors duration-300"/>
              </div>
              <div className="p-5">
                <h4 className="font-bold text-lg text-gray-800 truncate group-hover:text-purple-600 transition-colors duration-300">
                  {campaign.name}
                </h4>
                <p className="text-sm text-gray-500 mt-1 h-10 overflow-hidden">
                  {campaign.campaign_message}
                </p>
                <Button
                  size="lg"
                  asChild
                  className="w-full mt-4 bg-gradient-to-r from-orange-500 to-pink-500 text-white font-bold rounded-lg shadow-md hover:shadow-lg transition-all duration-300 transform hover:scale-105"
                >
                  <Link href={`/dashboard/campaigns/preview/${campaign.id}`}>
                    Claim Now
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};
