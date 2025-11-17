'use client';

import React, { useState, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Award, ChevronLeft, ChevronRight, PlusCircle } from 'lucide-react';
import Link from 'next/link';
import { useGetUnaddedAdminCampaigns, useAddAdminCampaign } from '@/services/campaigns/hook';
import { Campaign } from '@/services/campaigns/types';
import toast from 'react-hot-toast';

export const UnaddedCampaignsTicker = () => {
  const { data: unaddedCampaignsData, isLoading } = useGetUnaddedAdminCampaigns();
  const addCampaignMutation = useAddAdminCampaign();
  const [currentIndex, setCurrentIndex] = useState(0);

  const availableCampaigns = useMemo(() => {
    return unaddedCampaignsData?.data || [];
  }, [unaddedCampaignsData]);

  const handleNext = () => {
    setCurrentIndex((prevIndex) => (prevIndex + 1) % availableCampaigns.length);
  };

  const handlePrev = () => {
    setCurrentIndex(
      (prevIndex) => (prevIndex - 1 + availableCampaigns.length) % availableCampaigns.length
    );
  };

  const handleAddCampaign = (campaignId: string) => {
    addCampaignMutation.mutate(campaignId, {
      onSuccess: () => {
        toast.success('Campaign added successfully!');
      },
      onError: () => {
        toast.error('Failed to add campaign.');
      },
    });
  };

  if (isLoading) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500 text-lg">Loading claimable campaigns...</p>
      </div>
    );
  }

  if (availableCampaigns.length === 0) {
    return null;
  }

  const visibleCampaigns = [
    availableCampaigns[currentIndex],
    availableCampaigns[(currentIndex + 1) % availableCampaigns.length],
  ].filter(Boolean);

  return (
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
                  {visibleCampaigns.map((campaign: Campaign) => (
                    <div key={campaign.id} className="flex-shrink-0 w-full md:w-1/2 px-2">
                      <div className="flex items-center justify-between bg-white p-4 rounded-lg shadow-md border">
                        <div className="flex flex-col overflow-hidden">
                          <p className="font-bold text-gray-800 truncate">{campaign.name}</p>
                          <p className="text-sm text-gray-500">{campaign.campaign_message}</p>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Button
                            size="sm"
                            asChild
                            variant="outline"
                            className="border-orange-600 text-orange-600 hover:bg-orange-50 transition-colors duration-200"
                          >
                            <Link href={`/dashboard/campaigns/preview/${campaign.id}`}>View</Link>
                          </Button>
                          <Button
                            size="sm"
                            className="bg-orange-600 hover:bg-orange-700 text-white ml-4 flex-shrink-0"
                            onClick={() => handleAddCampaign(campaign.id)}
                            disabled={addCampaignMutation.isPending}
                          >
                            <PlusCircle className="mr-2 h-4 w-4" />
                            Add
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              {availableCampaigns.length > 2 && (
                <>
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
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
