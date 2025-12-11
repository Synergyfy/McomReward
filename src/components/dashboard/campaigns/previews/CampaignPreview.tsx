'use client';

import React from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import Image from "next/image";
import { Trophy, Users, Calendar, Gift, Info } from "lucide-react";
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { useClaimCampaign } from '@/services/campaigns/hook';
import { Badge } from "@/components/ui/badge";
import { CampaignResponse, Reward } from '@/services/campaigns/types';
import TierLimitModal from '../TierLimitModal';
import { AxiosError } from 'axios';

interface CampaignPreviewProps {
  campaign: CampaignResponse;
  isClaimable?: boolean;
}

export default function CampaignPreview({ campaign, isClaimable = false }: CampaignPreviewProps) {
  const router = useRouter();
  const { mutate: claimCampaign, isPending } = useClaimCampaign();
  const [isTierLimitModalOpen, setIsTierLimitModalOpen] = React.useState(false);
  const [tierLimitMessage, setTierLimitMessage] = React.useState('');

  const handleClaim = () => {
    if (!isClaimable) return;

    const payload = {
      business_reward_ids: campaign.business_reward_ids,
    };

    claimCampaign({ campaignId: campaign.id, payload }, {
      onSuccess: () => {
        toast.success(`Campaign "${campaign.name}" has been successfully claimed!`);
        router.push('/dashboard/campaigns/list');
      },
      onError: (error: Error | AxiosError<unknown>) => {
        console.error('Failed to claim campaign:', error);

        // Check for the specific error message regarding active campaigns limit
        const errorMessage = (error as AxiosError<{ message: string }>)?.response?.data?.message || (error as Error)?.message || '';
        if (errorMessage.includes('limit of 1 active campaigns') || errorMessage.includes('Upgrade or level up')) {
          setTierLimitMessage(errorMessage);
          setIsTierLimitModalOpen(true);
          return;
        }

        toast.error('Failed to claim campaign. Please try again.');
      }
    });
  };

  // Helper to get points required from the first reward
  const pointsRequired = campaign.rewards && campaign.rewards.length > 0 ? campaign.rewards[0].points_required : 0;

  return (
    <div className="bg-gray-50 min-h-screen text-gray-900 pb-20">
      {/* Hero Section */}
      <div className="relative h-80 w-full overflow-hidden">
        <Image
          src={campaign.bannerUrl || 'https://via.placeholder.com/1920x700?text=Campaign+Hero'}
          alt={campaign.name || 'Campaign Hero'}
          layout="fill"
          objectFit="cover"
          className="brightness-50"
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent flex flex-col justify-end pb-10 px-6 md:px-12">
          <div className="max-w-5xl mx-auto w-full text-white">
            <div className="flex items-center gap-3 mb-4">
              <Badge className="bg-orange-500 hover:bg-orange-600 text-white px-3 py-1 text-sm uppercase tracking-wide">
                {campaign.campaignType?.replace('_', ' ') || 'Campaign'}
              </Badge>
              {campaign.audienceType && (
                <Badge variant="outline" className="text-white border-white/50 px-3 py-1 text-sm uppercase tracking-wide">
                  {campaign.audienceType} Only
                </Badge>
              )}
            </div>
            <h1 className="text-4xl md:text-5xl font-extrabold leading-tight mb-4 drop-shadow-xl">
              {campaign.name || '[Campaign Name]'}
            </h1>
            <div className="flex items-center gap-6 text-gray-200 text-sm md:text-base font-medium">
              <div className="flex items-center gap-2">
                <Calendar className="w-5 h-5 text-orange-400" />
                <span>
                  {new Date(campaign.startDate).toLocaleDateString()} - {new Date(campaign.endDate).toLocaleDateString()}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-6 -mt-10 relative z-10 space-y-8">

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="bg-white shadow-lg border-none">
            <CardContent className="p-6 flex items-center gap-4">
              <div className="p-3 bg-orange-100 rounded-full text-orange-600">
                <Trophy className="w-6 h-6" />
              </div>
              <div>
                <p className="text-sm text-gray-500 font-medium uppercase">Points Required</p>
                <p className="text-2xl font-bold text-gray-900">{pointsRequired}</p>
              </div>
            </CardContent>
          </Card>
          <Card className="bg-white shadow-lg border-none">
            <CardContent className="p-6 flex items-center gap-4">
              <div className="p-3 bg-blue-100 rounded-full text-blue-600">
                <Gift className="w-6 h-6" />
              </div>
              <div>
                <p className="text-sm text-gray-500 font-medium uppercase">Rewards Available</p>
                <p className="text-2xl font-bold text-gray-900">{campaign.rewards?.length || 0}</p>
              </div>
            </CardContent>
          </Card>
          <Card className="bg-white shadow-lg border-none">
            <CardContent className="p-6 flex items-center gap-4">
              <div className="p-3 bg-purple-100 rounded-full text-purple-600">
                <Users className="w-6 h-6" />
              </div>
              <div>
                <p className="text-sm text-gray-500 font-medium uppercase">Audience</p>
                <p className="text-2xl font-bold text-gray-900 capitalize">{campaign.audienceType}</p>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column: Description & Rewards */}
          <div className="lg:col-span-2 space-y-8">
            {/* About Section */}
            <section className="bg-white p-8 rounded-xl shadow-sm border border-gray-100">
              <div className="flex items-center gap-3 mb-6">
                <Info className="w-6 h-6 text-orange-600" />
                <h2 className="text-2xl font-bold text-gray-800">About This Campaign</h2>
              </div>
              <p className="text-gray-700 leading-loose text-lg">
                {campaign.campaignMessage || 'No description available for this campaign.'}
              </p>
            </section>

            {/* Rewards Section */}
            {campaign.rewards && campaign.rewards.length > 0 && (
              <section>
                <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-3">
                  <Gift className="w-6 h-6 text-orange-600" />
                  Campaign Rewards
                </h2>
                <div className="grid grid-cols-1 gap-6">
                  {campaign.rewards.map((reward: Reward) => ( // Cast to Reward
                    <Card key={reward.id} className="overflow-hidden border-none shadow-md hover:shadow-lg transition-shadow duration-300">
                      <div className="flex flex-col md:flex-row">
                        {reward.image && (
                          <div className="relative w-full md:w-48 h-48 md:h-auto shrink-0">
                            <Image
                              src={reward.image}
                              alt={reward.title}
                              layout="fill"
                              objectFit="cover"
                            />
                          </div>
                        )}
                        <div className="p-6 flex flex-col justify-center flex-1">
                          <div className="flex justify-between items-start mb-2">
                            <h4 className="text-xl font-bold text-gray-900">{reward.title}</h4>
                            <Badge className="bg-orange-100 text-orange-700 hover:bg-orange-200 border-none">
                              {reward.points_required} Points
                            </Badge>
                          </div>
                          <p className="text-gray-600 mb-4 line-clamp-2">{reward.description}</p>
                          <div className="mt-auto flex items-center justify-between text-sm text-gray-500">
                            <span>Qty: {reward.quantity}</span>
                            <span className="font-medium text-orange-600">Value: ${reward.value}</span>
                          </div>
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              </section>
            )}
          </div>

          {/* Right Column: CTA Card (Sticky on Desktop) */}
          <div className="lg:col-span-1">
            <div className="sticky top-8 space-y-6">
              <Card className="border-none shadow-xl bg-white overflow-hidden">
                <div className="bg-orange-600 p-4 text-center">
                  <h3 className="text-white font-bold text-lg">Ready to Launch?</h3>
                </div>
                <CardContent className="p-6 space-y-6">
                  <p className="text-center text-gray-600">
                    Claim this campaign to start engaging with your customers and rewarding their loyalty.
                  </p>
                  <div className="space-y-3">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500">Setup Cost</span>
                      <span className="font-medium text-gray-900">Free</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500">Duration</span>
                      <span className="font-medium text-gray-900">
                        {Math.ceil((new Date(campaign.endDate).getTime() - new Date(campaign.startDate).getTime()) / (1000 * 60 * 60 * 24))} Days
                      </span>
                    </div>
                    {campaign.quantity > 0 && (
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-500">Available Claims</span>
                        <span className="font-medium text-gray-900">{campaign.quantity}</span>
                      </div>
                    )}
                  </div>
                  <Button
                    onClick={handleClaim}
                    disabled={!isClaimable || isPending}
                    className="w-full bg-orange-600 hover:bg-orange-700 text-white text-lg py-6 shadow-lg hover:shadow-xl transition-all transform hover:-translate-y-1"
                    style={{ backgroundColor: campaign.ctaBackgroundColor || undefined, color: campaign.ctaTextColor || undefined }}
                  >
                    {isClaimable ? (isPending ? 'Claiming...' : 'Claim Campaign') : 'Preview Only'}
                  </Button>
                  <p className="text-xs text-center text-gray-400">
                    By claiming, you agree to the campaign terms.
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>

      <TierLimitModal
        isOpen={isTierLimitModalOpen}
        onClose={() => setIsTierLimitModalOpen(false)}
        message={tierLimitMessage}
      />
    </div>
  );
}
