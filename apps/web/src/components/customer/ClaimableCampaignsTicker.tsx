'use client';

import React from 'react';
import { Button } from '@/components/ui/button';
import { Award, Sparkles } from 'lucide-react';
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
      <div className="my-4 sm:my-8 p-3 sm:p-6 bg-gray-100/80 rounded-2xl animate-pulse">
        <div className="h-6 w-48 bg-gray-200 rounded-lg mb-4" />
        <div className="grid grid-cols-2 lg:grid-cols-3 gap-2.5 sm:gap-4">
          {[...Array(campaignsToShow)].map((_, i) => (
            <div key={i} className="bg-white rounded-xl h-48 sm:h-64" />
          ))}
        </div>
      </div>
    );
  }

  if (availableCampaigns.length === 0) {
    return null;
  }

  return (
    <div className="my-4 sm:my-8 p-3.5 sm:p-6 bg-gradient-to-r from-orange-50/70 via-rose-50/50 to-purple-50/70 rounded-2xl border border-orange-100/80 shadow-sm">
      <div className="flex justify-between items-center mb-3 sm:mb-5">
        <div>
          <h3 className="text-base sm:text-2xl font-black text-gray-900 flex items-center gap-1.5 sm:gap-2">
            <Award className="w-5 h-5 sm:w-7 sm:h-7 text-orange-500 shrink-0" />
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-orange-600 via-pink-600 to-purple-600">
              Hot Campaigns to Claim
            </span>
            <Sparkles className="w-4 h-4 text-amber-500 shrink-0 hidden sm:inline-block" />
          </h3>
          <p className="text-gray-500 text-[11px] sm:text-xs mt-0.5 line-clamp-1">
            Popular community campaigns ready for your business to join instantly.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-3 gap-2.5 sm:gap-4">
        {availableCampaigns.slice(0, campaignsToShow).map((campaign) => (
          <Card
            key={campaign.id}
            className="p-0 py-0 gap-0 bg-white rounded-xl shadow-sm hover:shadow-md transition-all duration-300 border border-gray-100 overflow-hidden flex flex-col justify-between"
          >
            <CardContent className="p-0 flex flex-col h-full justify-between">
              <div>
                <div className="relative h-24 sm:h-36 w-full bg-gray-100 overflow-hidden">
                  {campaign.banner_url || campaign.bannerUrl ? (
                    <Image
                      src={campaign.banner_url || campaign.bannerUrl || ''}
                      alt={campaign.name}
                      layout="fill"
                      objectFit="cover"
                      className="hover:scale-105 transition-transform duration-500"
                    />
                  ) : (
                    <div className="h-full w-full bg-gradient-to-br from-orange-100 to-pink-100 flex items-center justify-center text-orange-400 font-bold text-xs">
                      MCOM
                    </div>
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />
                </div>
                <div className="p-2.5 sm:p-4">
                  <h4 className="font-bold text-xs sm:text-base text-gray-900 truncate">
                    {campaign.name}
                  </h4>
                  <p className="text-[11px] sm:text-xs text-gray-500 mt-0.5 line-clamp-1 sm:line-clamp-2 h-4 sm:h-8">
                    {campaign.campaign_message || 'Available to claim now.'}
                  </p>
                </div>
              </div>
              <div className="p-2.5 sm:p-4 pt-0">
                <Button
                  size="sm"
                  asChild
                  className="w-full h-7 sm:h-9 text-xs sm:text-sm bg-gradient-to-r from-orange-500 to-pink-500 hover:from-orange-600 hover:to-pink-600 text-white font-bold rounded-lg shadow-sm"
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
