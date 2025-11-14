'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Award, ChevronLeft, ChevronRight } from 'lucide-react';
import { mockClaimableCampaigns } from '@/app/mock-data';
import Link from 'next/link';

export const ClaimableCampaignsTicker = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [claimedCampaigns, setClaimedCampaigns] = useState<string[]>([]);

  const handleNext = () => {
    setCurrentIndex((prevIndex) => (prevIndex + 1) % mockClaimableCampaigns.length);
  };

  const handlePrev = () => {
    setCurrentIndex((prevIndex) => (prevIndex - 1 + mockClaimableCampaigns.length) % mockClaimableCampaigns.length);
  };

  const visibleCampaigns = [
    mockClaimableCampaigns[currentIndex],
    mockClaimableCampaigns[(currentIndex + 1) % mockClaimableCampaigns.length]
  ];

  return (
    <>
      <div className="my-8">
        <div className="bg-gradient-to-r from-purple-500 via-pink-500 to-red-500 p-1 rounded-2xl shadow-2xl">
            <div className="bg-white/90 backdrop-blur-sm rounded-xl">
                <div className="p-6">
                    <div className="flex items-center mb-4">
                        <Award className="w-8 h-8 text-yellow-500 mr-3" />
                        <h3 className="text-2xl font-bold text-gray-800">Campaigns Ready to Claim!</h3>
                    </div>
                    <div className="relative">
                        <div className="overflow-hidden">
                            <div className="flex -mx-2">
                                {visibleCampaigns.map((campaign) => (
                                    <div key={campaign.id} className="flex-shrink-0 w-full md:w-1/2 px-2">
                                        <div className="flex items-center justify-between bg-white p-4 rounded-lg shadow-md border">
                                            <div className="flex flex-col overflow-hidden">
                                                <p className="font-bold text-gray-800 truncate">{campaign.title}</p>
                                                <p className="text-sm text-gray-500">{campaign.business}</p>
                                            </div>
                                            <Button
                                                size="sm"
                                                asChild
                                                disabled={claimedCampaigns.includes(campaign.id)}
                                                className="bg-orange-600 hover:bg-orange-700 text-white ml-4 flex-shrink-0"
                                            >
                                                <Link href={`/dashboard/campaigns/preview/${campaign.id}`}>
                                                    {claimedCampaigns.includes(campaign.id) ? 'Claimed' : 'Claim'}
                                                </Link>
                                            </Button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                        <Button
                            variant="outline"
                            size="icon"
                            onClick={handlePrev}
                            className="absolute top-1/2 -translate-y-1/2 left-[-1rem] bg-white/80 backdrop-blur-sm rounded-full shadow-md"
                        >
                            <ChevronLeft className="h-4 w-4" />
                        </Button>
                        <Button
                            variant="outline"
                            size="icon"
                            onClick={handleNext}
                            className="absolute top-1/2 -translate-y-1/2 right-[-1rem] bg-white/80 backdrop-blur-sm rounded-full shadow-md"
                        >
                            <ChevronRight className="h-4 w-4" />
                        </Button>
                    </div>
                </div>
            </div>
        </div>
      </div>
    </>
  );
};
