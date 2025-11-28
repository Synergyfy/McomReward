'use client';

import React from 'react';
import { useParams } from 'next/navigation';
import { useGetCampaignById } from '@/services/campaigns/hook';
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import Image from "next/image";
import { Calendar, Info, Users, Gift } from "lucide-react";
import LoadingSpinner from '@/components/ui/Loading';
import PublicRewardCard from '@/components/rewards/PublicRewardCard';
import { Badge } from "@/components/ui/badge";
import Link from 'next/link';

export default function CampaignOverviewPage() {
  const params = useParams();
  const { campaignId } = params;

  const { data: campaign, isLoading, isError } = useGetCampaignById(campaignId as string);

  if (isLoading) {
    return <LoadingSpinner />;
  }

  if (isError || !campaign) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center p-8 bg-white rounded-xl shadow-lg max-w-md mx-4">
          <div className="text-red-500 text-5xl mb-4">⚠️</div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Campaign Not Found</h2>
          <p className="text-gray-600 mb-6">We couldn't load the campaign details. It might have ended or been removed.</p>
          <Link href="/admin/campaigns">
            <Button variant="outline">Return to Campaigns</Button>
          </Link>
        </div>
      </div>
    );
  }

  // Fallback image if bannerUrl is missing or fails
  const bannerImage = campaign.bannerUrl || 'https://placehold.co/1920x600?text=Campaign+Banner';

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900 pb-24">
      {/* Hero Section */}
      <div className="relative h-[450px] md:h-[550px] w-full overflow-hidden group">
        <Image
          src={bannerImage}
          alt={campaign.name || 'Campaign Banner'}
          layout="fill"
          objectFit="cover"
          className="brightness-50 transition-transform duration-700 group-hover:scale-105"
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/50 to-transparent flex flex-col justify-end pb-16 px-6 md:px-16">
          <div className="max-w-7xl mx-auto w-full flex flex-col md:flex-row items-end md:items-center gap-8">
            {/* Logo Overlay */}
            <div className="relative w-32 h-32 md:w-40 md:h-40 rounded-2xl overflow-hidden border-4 border-white shadow-2xl shrink-0 bg-white">
              {campaign.logoUrl ? (
                <Image
                  src={campaign.logoUrl}
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
              <div className="flex flex-wrap items-center gap-3 mb-3">
                <Badge className="bg-orange-500 hover:bg-orange-600 text-white border-none px-3 py-1 text-sm uppercase tracking-wide">
                  {campaign.campaignType?.replace('_', ' ') || 'Campaign'}
                </Badge>
                {campaign.audienceType && (
                  <Badge variant="secondary" className="px-3 py-1 text-sm uppercase tracking-wide bg-white/20 text-white hover:bg-white/30 border-none backdrop-blur-sm">
                    {campaign.audienceType}
                  </Badge>
                )}
                {campaign.disabled && (
                  <Badge variant="destructive" className="px-3 py-1 text-sm uppercase tracking-wide">
                    Disabled
                  </Badge>
                )}
              </div>
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold leading-tight mb-4 drop-shadow-xl">
                {campaign.name}
              </h1>
              <p className="text-lg md:text-xl text-gray-200 max-w-2xl line-clamp-2 drop-shadow-md">
                {campaign.campaignMessage || 'Join this exclusive campaign to earn rewards!'}
              </p>
            </div>

            {/* Admin Controls Placeholder (Optional) */}
            <div className="hidden md:block shrink-0">
              <Link href={`/admin/campaigns/${campaignId}/edit`}>
                <Button
                  variant="secondary"
                  className="bg-white/10 hover:bg-white/20 text-white border border-white/20 backdrop-blur-md"
                >
                  Edit Campaign
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 -mt-8 relative z-10 space-y-12">

        {/* Quick Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="bg-white shadow-lg border-none hover:shadow-xl transition-shadow duration-300">
            <CardContent className="p-6 flex items-center gap-4">
              <div className="p-3 bg-blue-100 rounded-full text-blue-600">
                <Calendar className="w-6 h-6" />
              </div>
              <div>
                <p className="text-xs text-gray-500 font-bold uppercase tracking-wider">Start Date</p>
                <p className="text-sm font-semibold text-gray-900">{new Date(campaign.startDate).toLocaleDateString()}</p>
              </div>
            </CardContent>
          </Card>
          <Card className="bg-white shadow-lg border-none hover:shadow-xl transition-shadow duration-300">
            <CardContent className="p-6 flex items-center gap-4">
              <div className="p-3 bg-blue-100 rounded-full text-blue-600">
                <Calendar className="w-6 h-6" />
              </div>
              <div>
                <p className="text-xs text-gray-500 font-bold uppercase tracking-wider">End Date</p>
                <p className="text-sm font-semibold text-gray-900">{new Date(campaign.endDate).toLocaleDateString()}</p>
              </div>
            </CardContent>
          </Card>
          <Card className="bg-white shadow-lg border-none hover:shadow-xl transition-shadow duration-300">
            <CardContent className="p-6 flex items-center gap-4">
              <div className="p-3 bg-purple-100 rounded-full text-purple-600">
                <Users className="w-6 h-6" />
              </div>
              <div>
                <p className="text-xs text-gray-500 font-bold uppercase tracking-wider">Audience</p>
                <p className="text-sm font-semibold text-gray-900 capitalize">{campaign.audienceType}</p>
              </div>
            </CardContent>
          </Card>
          <Card className="bg-white shadow-lg border-none hover:shadow-xl transition-shadow duration-300">
            <CardContent className="p-6 flex items-center gap-4">
              <div className="p-3 bg-green-100 rounded-full text-green-600">
                <Gift className="w-6 h-6" />
              </div>
              <div>
                <p className="text-xs text-gray-500 font-bold uppercase tracking-wider">Availability</p>
                <p className="text-sm font-semibold text-gray-900">
                  {campaign.quantity > 0 ? `${campaign.quantity} Spots` : 'Unlimited'}
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          {/* Main Content Column */}
          <div className="lg:col-span-2 space-y-12">

            {/* About Section */}
            <section>
              <h2 className="text-3xl font-bold text-gray-900 mb-6 flex items-center gap-3">
                <Info className="w-8 h-8 text-orange-600" />
                About This Campaign
              </h2>
              <div className="prose prose-lg text-gray-600 max-w-none leading-relaxed">
                {/* Render HTML if it looks like HTML, otherwise just text */}
                {/<[a-z][\s\S]*>/i.test(campaign.campaignMessage) ? (
                  <div dangerouslySetInnerHTML={{ __html: campaign.campaignMessage }} />
                ) : (
                  <p>{campaign.campaignMessage}</p>
                )}
              </div>
            </section>

          </div>

          {/* Sidebar Column: Rewards */}
          <div className="lg:col-span-1 space-y-8">
            <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden sticky top-24">
              <div className="p-6 bg-gray-50 border-b border-gray-100">
                <h3 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                  <Gift className="w-5 h-5 text-orange-600" />
                  Rewards ({campaign.rewards?.length || 0})
                </h3>
              </div>
              <div className="p-6 space-y-6 max-h-[800px] overflow-y-auto custom-scrollbar">
                {campaign.rewards && campaign.rewards.length > 0 ? (
                  campaign.rewards.map((reward, index) => (
                    <PublicRewardCard
                      key={index}
                      reward={reward}
                    // Admin view doesn't need member logic or redemption
                    />
                  ))
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    <Gift className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                    <p>No rewards listed yet.</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div >
    </div >
  );
}
