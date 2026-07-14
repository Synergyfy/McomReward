'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import Image from 'next/image';
import { PublicCampaignResponse } from '@/services/campaigns/types';

interface ClaimCampaignModalProps {
  isOpen: boolean;
  onClose: () => void;
  claimableCampaigns: PublicCampaignResponse[];
  onCreateFromScratch: () => void;
}

export default function ClaimCampaignModal({
  isOpen,
  onClose,
  claimableCampaigns,
  onCreateFromScratch,
}: ClaimCampaignModalProps) {
  const router = useRouter();

  const handleCampaignSelect = (campaignId: string) => {
    // Close the modal and redirect to preview
    onClose();
    router.push(`/dashboard/campaigns/preview/${campaignId}/overview`);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-4xl max-h-[90vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>Create a New Campaign</DialogTitle>
          <DialogDescription>
            Select a ready-to-use campaign or build one from scratch to engage your customers.
          </DialogDescription>
        </DialogHeader>

        <div className="flex-grow overflow-y-auto p-1 space-y-6">
          <div>
            <h3 className="text-lg font-semibold mb-4 text-gray-800">Available Campaigns</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {claimableCampaigns.map((campaign) => (
                <Card key={campaign.id} className="flex flex-col hover:shadow-md transition-shadow">
                  <CardHeader className="p-0">
                    <div className="relative w-full h-32 bg-gray-200">
                      {(campaign.banner_url || campaign.bannerUrl) ? (
                        <Image
                          src={campaign.banner_url || campaign.bannerUrl || ''}
                          alt={campaign.name}
                          layout="fill"
                          objectFit="cover"
                          className="rounded-t-lg"
                        />
                      ) : (
                        <div className="flex items-center justify-center h-full text-gray-400">
                          No Image
                        </div>
                      )}
                    </div>
                  </CardHeader>
                  <CardContent className="p-4 flex-grow">
                    <h4 className="font-bold">{campaign.name}</h4>
                    <p className="text-xs text-gray-600 mt-1 h-12 overflow-hidden">{campaign.campaign_message}</p>
                  </CardContent>
                  <CardFooter className="p-4">
                    <Button
                      onClick={() => handleCampaignSelect(campaign.id)}
                      variant="outline"
                      className="w-full"
                    >
                      View Campaign
                    </Button>
                  </CardFooter>
                </Card>
              ))}
            </div>
          </div>
        </div>

        <div className="text-center border-t pt-6">
          <h3 className="text-lg font-semibold text-gray-800">Or Start Fresh</h3>
          <p className="text-sm text-gray-500 my-2">
            Have a specific idea? Upgrade to our White-Label plan for full creative control.
          </p>
          <Button onClick={onCreateFromScratch}>
            Create a Campaign from Scratch
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}