
'use client';

import React from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Image from "next/image";
import { Tag, Trophy } from "lucide-react";
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { PublicCampaignResponse } from '@/services/campaigns/types';
import { useClaimCampaign } from '@/services/campaigns/hook';

interface CampaignPreviewProps {
  campaign: PublicCampaignResponse;
}

export default function CampaignPreview({ campaign }: CampaignPreviewProps) {
  const router = useRouter();
  const { mutate: claimCampaign, isPending } = useClaimCampaign();

  const handleClaim = () => {
    claimCampaign(campaign.id, {
      onSuccess: () => {
        toast.success(`Campaign "${campaign.name}" has been successfully claimed!`);
        router.push('/dashboard/campaigns/list');
      },
      onError: (error) => {
        console.error('Failed to claim campaign:', error);
        toast.error('Failed to claim campaign. Please try again.');
      }
    });
  };

  // Helper to get points required from the first reward (assuming one main reward for now)
  const pointsRequired = campaign.rewards && campaign.rewards.length > 0 ? campaign.rewards[0].points_required : 0;

  return (
    <div className="bg-gray-100 text-gray-900">
      <div className="relative h-64 w-full overflow-hidden">
        <Image
          src={campaign.banner_url || 'https://via.placeholder.com/1920x700?text=Campaign+Hero'}
          alt={campaign.name || 'Campaign Hero'}
          layout="fill"
          objectFit="cover"
          className="brightness-75"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/40 to-transparent flex items-end pb-8 px-8">
          <div className="max-w-4xl mx-auto text-white text-center">
            <h1 className="text-3xl font-extrabold leading-tight mb-2 drop-shadow-lg">
              {campaign.name || '[Campaign Name]'}
            </h1>
          </div>
        </div>
      </div>

      <div className="p-8 space-y-6">
        <section>
          <h2 className="text-2xl font-bold text-gray-800 mb-4">About This Campaign</h2>
          <p className="text-gray-700 leading-relaxed">
            {campaign.campaign_message || 'No description available.'}
          </p>
        </section>

        <section className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card className="p-4 shadow-md border-l-4 border-orange-600">
            <CardHeader className="!p-0 mb-2">
              <CardTitle className="text-lg font-semibold flex items-center text-gray-800">
                <Trophy className="w-5 h-5 mr-2 text-orange-600" />
                Points to Claim
              </CardTitle>
            </CardHeader>
            <CardContent className="!p-0 text-gray-700 text-lg">
              <p>{pointsRequired} points</p>
            </CardContent>
          </Card>
          <Card className="p-4 shadow-md border-l-4 border-orange-600">
            <CardHeader className="!p-0 mb-2">
              <CardTitle className="text-lg font-semibold flex items-center text-gray-800">
                <Tag className="w-5 h-5 mr-2 text-orange-600" />
                Audience
              </CardTitle>
            </CardHeader>
            <CardContent className="!p-0 text-gray-700 text-lg">
              <p className="capitalize">{campaign.audience_type}</p>
            </CardContent>
          </Card>
        </section>

        {/* Rewards Section if multiple or detailed view needed */}
        {campaign.rewards && campaign.rewards.length > 0 && (
          <section>
            <h2 className="text-2xl font-bold text-gray-800 mb-4">Rewards</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {campaign.rewards.map((reward) => (
                <Card key={reward.id} className="p-4">
                  <div className="flex items-center space-x-4">
                    {reward.image && (
                      <div className="relative w-16 h-16 rounded-md overflow-hidden">
                        <Image src={reward.image} alt={reward.title} layout="fill" objectFit="cover" />
                      </div>
                    )}
                    <div>
                      <h4 className="font-bold">{reward.title}</h4>
                      <p className="text-sm text-gray-600">{reward.description}</p>
                      <p className="text-sm font-semibold text-orange-600 mt-1">{reward.points_required} Points</p>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </section>
        )}
      </div>

      <div className="sticky bottom-0 bg-white border-t border-gray-200 p-4">
        <div className="max-w-4xl mx-auto flex justify-center">
          <Button
            onClick={handleClaim}
            disabled={isPending}
            className="w-full md:w-auto bg-orange-600 hover:bg-orange-700 text-white text-lg px-12 py-3 rounded-full shadow-lg"
          >
            {isPending ? 'Claiming...' : 'Claim Campaign'}
          </Button>
        </div>
      </div>
    </div>
  );
}
