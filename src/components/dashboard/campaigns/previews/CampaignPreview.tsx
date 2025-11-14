
'use client';

import React from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Image from "next/image";
import { Calendar, Tag, Info, Gift, CheckCircle, Users, Trophy } from "lucide-react";
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';

export interface Campaign {
    id: string;
    title: string;
    business: string;
    pointsCost: number;
    description?: string;
    heroImageUrl?: string;
    startDate?: string;
    endDate?: string;
    category?: string;
    rewards?: {
        id: string;
        title: string;
        description: string;
        points_required: number;
        image: string;
    }[];
    howToEarn?: string[];
    termsAndConditions?: string[];
}

interface CampaignPreviewProps {
  campaign: Campaign;
}

export default function CampaignPreview({ campaign }: CampaignPreviewProps) {
  const router = useRouter();

  const handleClaim = () => {
    const newCampaign = {
        id: campaign.id,
        campaignName: campaign.title,
        campaignMessage: campaign.description || '',
        reward: { id: 'claimed-reward', title: `${campaign.pointsCost} points` },
        rewardsAvailable: 0,
        ctaButtonText: 'View Campaign',
        imageUrl: campaign.heroImageUrl || '',
        logoUrl: '',
        status: 'active' as const,
    };
    localStorage.setItem('newlyClaimedCampaign', JSON.stringify(newCampaign));
    toast.success(`Campaign "${campaign.title}" has been successfully claimed!`);
    router.push('/dashboard/campaigns/list');
  };

  return (
    <div className="bg-gray-100 text-gray-900">
      <div className="relative h-64 w-full overflow-hidden">
        <Image
          src={campaign.heroImageUrl || 'https://via.placeholder.com/1920x700?text=Campaign+Hero'}
          alt={campaign.title || 'Campaign Hero'}
          layout="fill"
          objectFit="cover"
          className="brightness-75"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/40 to-transparent flex items-end pb-8 px-8">
          <div className="max-w-4xl mx-auto text-white text-center">
            <h1 className="text-3xl font-extrabold leading-tight mb-2 drop-shadow-lg">
              {campaign.title || '[Campaign Name]'}
            </h1>
          </div>
        </div>
      </div>

      <div className="p-8 space-y-6">
        <section>
          <h2 className="text-2xl font-bold text-gray-800 mb-4">About This Campaign</h2>
          <p className="text-gray-700 leading-relaxed">
            {campaign.description || 'No description available.'}
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
                <p>{campaign.pointsCost} points</p>
                </CardContent>
            </Card>
            <Card className="p-4 shadow-md border-l-4 border-orange-600">
                <CardHeader className="!p-0 mb-2">
                <CardTitle className="text-lg font-semibold flex items-center text-gray-800">
                    <Tag className="w-5 h-5 mr-2 text-orange-600" />
                    Business
                </CardTitle>
                </CardHeader>
                <CardContent className="!p-0 text-gray-700 text-lg">
                <p>{campaign.business}</p>
                </CardContent>
            </Card>
        </section>

        {campaign.termsAndConditions && campaign.termsAndConditions.length > 0 && (
            <section>
              <h2 className="text-2xl font-bold text-gray-800 mb-4">Terms & Conditions</h2>
              <ul className="space-y-2 text-sm text-gray-600 list-disc pl-5">
                {campaign.termsAndConditions.map((item, index) => (
                  <li key={index}>{item}</li>
                ))}
              </ul>
            </section>
        )}
      </div>

      <div className="sticky bottom-0 bg-white border-t border-gray-200 p-4">
        <div className="max-w-4xl mx-auto flex justify-center">
          <Button
            onClick={handleClaim}
            className="w-full md:w-auto bg-orange-600 hover:bg-orange-700 text-white text-lg px-12 py-3 rounded-full shadow-lg"
          >
            Claim Campaign
          </Button>
        </div>
      </div>
    </div>
  );
}
