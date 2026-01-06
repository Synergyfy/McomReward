'use client';

import React, { useMemo } from 'react';
import Image from "next/image";
import DOMPurify from 'dompurify';
import { Calendar, Info, Users, Gift } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import PublicRewardCard from '@/components/rewards/PublicRewardCard';
import { CampaignFormData } from "@/context/CampaignFormContext";
import { useGetBusinessRewards } from '@/services/business-reward/hooks';

interface FullCampaignPreviewProps {
  formData: CampaignFormData;
  isMobile?: boolean;
}

export default function FullCampaignPreview({ formData, isMobile = false }: FullCampaignPreviewProps) {
  // Mock member status for preview
  const isMember = false;

  const isValidSrc = (src: string) => {
    return src && (src.startsWith('http') || src.startsWith('https') || src.startsWith('/'));
  };

  // Fetch rewards to display real data if possible
  const { data: rewardsData } = useGetBusinessRewards(1, 100);
  
  const campaignRewards = useMemo(() => {
    if (!rewardsData?.data) return [];
    return rewardsData.data.filter((r: any) => formData.rewardIds.includes(r.id));
  }, [rewardsData, formData.rewardIds]);

  // Fallback image
  const rawBannerImage = formData.imageUrl || 'https://placehold.co/1920x600?text=Campaign+Banner';
  const bannerImage = isValidSrc(rawBannerImage) ? rawBannerImage : 'https://placehold.co/1920x600?text=Campaign+Banner';

  // Format dates
  const startDate = formData.startDate ? new Date(formData.startDate).toLocaleDateString() : 'TBD';
  const endDate = formData.endDate ? new Date(formData.endDate).toLocaleDateString() : 'TBD';

  return (
    <div className={`bg-gray-50 text-gray-900 pb-24 ${isMobile ? 'max-w-[375px] mx-auto' : 'min-h-screen'}`}>
      {/* Hero Section */}
      <div className={`relative ${isMobile ? 'h-[400px]' : 'h-[450px] md:h-[550px]'} w-full overflow-hidden group`}>
        <Image
          src={bannerImage}
          alt={formData.campaignName || 'Campaign Banner'}
          layout="fill"
          objectFit="cover"
          className="brightness-50 transition-transform duration-700 group-hover:scale-105"
          priority
        />
        <div className={`absolute inset-0 bg-gradient-to-t from-black/90 via-black/50 to-transparent flex flex-col justify-end ${isMobile ? 'pb-10 px-4' : 'pb-16 px-6 md:px-16'}`}>
          <div className={`max-w-7xl mx-auto w-full flex flex-col ${isMobile ? 'items-start' : 'md:flex-row items-end md:items-center'} gap-6 md:gap-8`}>
            {/* Logo Overlay */}
            <div className={`relative ${isMobile ? 'w-24 h-24' : 'w-32 h-32 md:w-40 md:h-40'} rounded-2xl overflow-hidden border-4 border-white shadow-2xl shrink-0 bg-white`}>
              {isValidSrc(formData.logoUrl) ? (
                <Image
                  src={formData.logoUrl}
                  alt="Campaign Logo"
                  layout="fill"
                  objectFit="cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-gray-100 text-gray-400">
                  <span className="text-xs font-bold uppercase">No Logo</span>
                </div>
              )}
            </div>

            <div className="flex-1 text-white">
              <div className="flex flex-wrap items-center gap-2 md:gap-3 mb-2 md:mb-3">
                {formData.campaignType && (
                  <Badge className="bg-orange-500 hover:bg-orange-600 text-white border-none px-2 md:px-3 py-0.5 md:py-1 text-[10px] md:text-sm uppercase tracking-wide">
                    {formData.campaignType.replace('_', ' ')}
                  </Badge>
                )}
                {formData.audienceType && formData.audienceType.length > 0 && (
                  <Badge variant="secondary" className="px-2 md:px-3 py-0.5 md:py-1 text-[10px] md:text-sm uppercase tracking-wide bg-white/20 text-white hover:bg-white/30 border-none backdrop-blur-sm">
                    {formData.audienceType.join(', ')}
                  </Badge>
                )}
              </div>
              <h1 className={`${isMobile ? 'text-2xl' : 'text-3xl md:text-5xl lg:text-6xl'} font-extrabold leading-tight mb-2 md:mb-4 drop-shadow-xl`}>
                {formData.campaignName || 'Campaign Name'}
              </h1>
              <div
                className={`${isMobile ? 'text-sm' : 'text-lg md:text-xl'} text-gray-200 max-w-2xl line-clamp-2 drop-shadow-md`}
                dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(formData.campaignMessage || 'Join this exclusive campaign to earn rewards!') }}
              />
            </div>

            {/* Desktop Action Button (Hero) */}
            {!isMember && !isMobile && (
              <div className="hidden md:block shrink-0">
                <Button
                  disabled={true}
                  className="bg-orange-600 hover:bg-orange-700 text-white text-lg px-8 py-6 rounded-full shadow-xl transition-all duration-300 transform hover:scale-105 hover:shadow-2xl border-2 border-white/20"
                >
                  Join Campaign
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className={`max-w-7xl mx-auto ${isMobile ? 'px-4' : 'px-6'} -mt-8 relative z-10 space-y-8 md:space-y-12`}>
        {/* Quick Stats Grid */}
        <div className={`grid ${isMobile ? 'grid-cols-2' : 'grid-cols-1 md:grid-cols-2 lg:grid-cols-4'} gap-3 md:gap-4`}>
          <Card className="bg-white shadow-lg border-none hover:shadow-xl transition-shadow duration-300">
            <CardContent className={`${isMobile ? 'p-3' : 'p-6'} flex items-center gap-3 md:gap-4`}>
              <div className={`${isMobile ? 'p-2' : 'p-3'} bg-blue-100 rounded-full text-blue-600`}>
                <Calendar className={`${isMobile ? 'w-4 h-4' : 'w-6 h-6'}`} />
              </div>
              <div>
                <p className={`${isMobile ? 'text-[10px]' : 'text-xs'} text-gray-500 font-bold uppercase tracking-wider`}>Start</p>
                <p className={`${isMobile ? 'text-xs' : 'text-sm'} font-semibold text-gray-900`}>{startDate}</p>
              </div>
            </CardContent>
          </Card>
          <Card className="bg-white shadow-lg border-none hover:shadow-xl transition-shadow duration-300">
            <CardContent className={`${isMobile ? 'p-3' : 'p-6'} flex items-center gap-3 md:gap-4`}>
              <div className={`${isMobile ? 'p-2' : 'p-3'} bg-blue-100 rounded-full text-blue-600`}>
                <Calendar className={`${isMobile ? 'w-4 h-4' : 'w-6 h-6'}`} />
              </div>
              <div>
                <p className={`${isMobile ? 'text-[10px]' : 'text-xs'} text-gray-500 font-bold uppercase tracking-wider`}>End</p>
                <p className={`${isMobile ? 'text-xs' : 'text-sm'} font-semibold text-gray-900`}>{endDate}</p>
              </div>
            </CardContent>
          </Card>
          <Card className="bg-white shadow-lg border-none hover:shadow-xl transition-shadow duration-300">
            <CardContent className={`${isMobile ? 'p-3' : 'p-6'} flex items-center gap-3 md:gap-4`}>
              <div className={`${isMobile ? 'p-2' : 'p-3'} bg-purple-100 rounded-full text-purple-600`}>
                <Users className={`${isMobile ? 'w-4 h-4' : 'w-6 h-6'}`} />
              </div>
              <div>
                <p className={`${isMobile ? 'text-[10px]' : 'text-xs'} text-gray-500 font-bold uppercase tracking-wider`}>Audience</p>
                <p className={`${isMobile ? 'text-xs' : 'text-sm'} font-semibold text-gray-900 capitalize truncate`}>{formData.audienceType.join(', ') || 'All'}</p>
              </div>
            </CardContent>
          </Card>
          <Card className="bg-white shadow-lg border-none hover:shadow-xl transition-shadow duration-300">
            <CardContent className={`${isMobile ? 'p-3' : 'p-6'} flex items-center gap-3 md:gap-4`}>
              <div className={`${isMobile ? 'p-2' : 'p-3'} bg-green-100 rounded-full text-green-600`}>
                <Gift className={`${isMobile ? 'w-4 h-4' : 'w-6 h-6'}`} />
              </div>
              <div>
                <p className={`${isMobile ? 'text-[10px]' : 'text-xs'} text-gray-500 font-bold uppercase tracking-wider`}>Spots</p>
                <p className={`${isMobile ? 'text-xs' : 'text-sm'} font-semibold text-gray-900`}>
                  {Number(formData.rewardsAvailable) > 0 ? `${formData.rewardsAvailable}` : '∞'}
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="flex flex-col gap-10 md:gap-16">
          {/* Main Content Column - Text Sections */}
          <div className="max-w-4xl space-y-8 md:space-y-12">
            {/* About Section */}
            <section>
              <h2 className={`${isMobile ? 'text-xl' : 'text-3xl'} font-bold text-gray-900 mb-4 md:mb-6 flex items-center gap-2 md:gap-3`}>
                <Info className={`${isMobile ? 'w-5 h-5' : 'w-8 h-8'} text-orange-600`} />
                About This Campaign
              </h2>
              <div className={`prose ${isMobile ? 'prose-sm' : 'prose-lg'} text-gray-600 max-w-none leading-relaxed`}>
                {/<[a-z][\s\S]*>/i.test(formData.campaignMessage) ? (
                  <div dangerouslySetInnerHTML={{ __html: formData.campaignMessage }} />
                ) : (
                  <p>{formData.campaignMessage}</p>
                )}
              </div>
            </section>
          </div>

          {/* Rewards Grid Section */}
          <div id="rewards" className="scroll-mt-24">
            <div className={`flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6 md:mb-8`}>
              <div>
                <h2 className={`${isMobile ? 'text-xl' : 'text-3xl'} font-bold text-gray-900 flex items-center gap-2 md:gap-3`}>
                  <Gift className={`${isMobile ? 'w-5 h-5' : 'w-8 h-8'} text-orange-600`} />
                  Rewards
                </h2>
                {!isMobile && (
                  <p className="text-gray-500 mt-2">
                    Complete tasks to earn points and redeem these exclusive rewards.
                  </p>
                )}
              </div>
              <Badge variant="outline" className="w-fit px-3 md:px-4 py-1 md:py-2 text-xs md:text-base font-medium">
                {campaignRewards.length} Available
              </Badge>
            </div>

            {campaignRewards.length > 0 ? (
              <div className={`grid ${isMobile ? 'grid-cols-1' : 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3'} gap-6`}>
                {campaignRewards.map((reward: any, index: number) => (
                  <PublicRewardCard
                    key={index}
                    reward={reward}
                    isMember={isMember}
                  />
                ))}
              </div>
            ) : (
              <div className="text-center py-10 md:py-16 bg-white rounded-2xl border-2 border-dashed border-gray-200">
                <Gift className="w-10 h-10 md:w-16 md:h-16 mx-auto mb-4 text-gray-300" />
                <h3 className="text-base md:text-lg font-medium text-gray-900">
                  {formData.rewardIds.length > 0 ? 'Loading rewards...' : 'No rewards listed yet'}
                </h3>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Sticky Mobile/Bottom Action Bar */}
      <div className={`fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.1)] p-4 z-50 ${isMobile ? 'block' : 'md:hidden'}`}>
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
          <Button
            disabled={true}
            className="w-full bg-orange-600 hover:bg-orange-700 text-white text-lg py-6 rounded-xl shadow-lg"
          >
            Join Campaign
          </Button>
        </div>
      </div>
    </div>
  );
}