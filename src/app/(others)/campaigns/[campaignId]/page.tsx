'use client';

import DOMPurify from 'dompurify';
import { isAxiosError } from 'axios';
import React, { use } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Image from "next/image";
import { Calendar, Tag, Info, CheckCircle, Users, Trophy, Gift, ArrowRight } from "lucide-react";
import { useCampaignMembership } from '@/context/CampaignMembershipContext';
import Link from 'next/link';
import { useGetPublicCampaignDetails, useJoinCampaign, useCheckCampaignJoinStatus } from '@/services/customer-campaigns/hook';
import { Badge } from "@/components/ui/badge";
import LoadingSpinner from '@/components/ui/Loading';
import PublicRewardCard from '@/components/rewards/PublicRewardCard';

interface PageProps {
  params: Promise<{ campaignId: string }>;
  searchParams?: { [key: string]: string | string[] | undefined };
}

export default function CampaignDetailPage({ params }: PageProps) {
  const { campaignId } = use(params);
  const { memberName, joinCampaign, isCampaignJoined } = useCampaignMembership();

  const { data: campaign, isLoading, error } = useGetPublicCampaignDetails(campaignId);
  const { data: joinStatus } = useCheckCampaignJoinStatus(campaignId);
  const { mutate: joinCampaignMutation, isPending: isJoining } = useJoinCampaign();

  const isMember = joinStatus?.isJoined || isCampaignJoined(campaignId);

  const handleJoinClick = () => {
    joinCampaignMutation(campaignId, {
      onSuccess: () => {
        joinCampaign(campaignId);
      },
      onError: (error: Error) => {
        console.error('Failed to join campaign:', error);
        if (isAxiosError(error) && error.response?.status === 401) {
          // Redirect to signup with campaignId and type=customer to skip selection
          window.location.href = `/signup?campaignId=${campaignId}&type=customer`;
        } else {
          alert('Failed to join campaign. Please try again.');
        }
      }
    });
  };

  if (isLoading) {
    return <LoadingSpinner />;
  }

  if (error || !campaign) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center p-8 bg-white rounded-xl shadow-lg max-w-md mx-4">
          <div className="text-red-500 text-5xl mb-4">⚠️</div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Campaign Not Found</h2>
          <p className="text-gray-600 mb-6">We couldn't load the campaign details. It might have ended or been removed.</p>
          <Link href="/">
            <Button variant="outline">Return Home</Button>
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
                {campaign.campaignType !== 'QR_CODE' && (
                  <Badge className="bg-orange-500 hover:bg-orange-600 text-white border-none px-3 py-1 text-sm uppercase tracking-wide">
                    {campaign.campaignType?.replace('_', ' ') || 'Campaign'}
                  </Badge>
                )}
                {campaign.audienceType && (
                  <Badge variant="secondary" className="px-3 py-1 text-sm uppercase tracking-wide bg-white/20 text-white hover:bg-white/30 border-none backdrop-blur-sm">
                    {campaign.audienceType}
                  </Badge>
                )}
              </div>
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold leading-tight mb-4 drop-shadow-xl">
                {campaign.name}
              </h1>
              <div
                className="text-lg md:text-xl text-gray-200 max-w-2xl line-clamp-2 drop-shadow-md"
                dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(campaign.campaignMessage || campaign.tagline || 'Join this exclusive campaign to earn rewards!') }}
              />
            </div>

            {/* Desktop Action Button (Hero) */}
            {!isMember ? (
              <div className="hidden md:block shrink-0">
                <Button
                  onClick={handleJoinClick}
                  disabled={isJoining}
                  className="bg-orange-600 hover:bg-orange-700 text-white text-lg px-8 py-6 rounded-full shadow-xl transition-all duration-300 transform hover:scale-105 hover:shadow-2xl border-2 border-white/20"
                >
                  {isJoining ? 'Joining...' : 'Join Campaign'}
                </Button>
              </div>
            ) : (
              <div className="hidden md:block shrink-0">
                <Link href="#rewards">
                  <Button
                    className="bg-green-600 hover:bg-green-700 text-white text-lg px-8 py-6 rounded-full shadow-xl transition-all duration-300 transform hover:scale-105 hover:shadow-2xl border-2 border-white/20"
                  >
                    Claim Reward
                  </Button>
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 -mt-8 relative z-10 space-y-12">

        {/* Member Status Banner */}
        {isMember && (
          <div className="bg-green-50 border border-green-200 rounded-xl p-6 shadow-lg flex items-center gap-4 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <div className="p-3 bg-green-100 rounded-full text-green-600 shrink-0">
              <CheckCircle className="w-8 h-8" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-green-800">You are a member!</h3>
              <p className="text-green-700">Welcome back, {memberName}. You can now earn points and redeem rewards.</p>
            </div>
          </div>
        )}

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

            {/* How to Earn Section (if data exists) */}
            {campaign.howToEarn && campaign.howToEarn.length > 0 && (
              <section className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">How to Participate</h2>
                <ul className="space-y-4">
                  {campaign.howToEarn.map((step, index) => (
                    <li key={index} className="flex items-start gap-4">
                      <div className="flex-shrink-0 w-8 h-8 rounded-full bg-orange-100 text-orange-600 flex items-center justify-center font-bold text-sm">
                        {index + 1}
                      </div>
                      <p className="text-gray-700 pt-1">{step}</p>
                    </li>
                  ))}
                </ul>
              </section>
            )}

            {/* Terms Section (if data exists) */}
            {campaign.termsAndConditions && campaign.termsAndConditions.length > 0 && (
              <section className="bg-gray-50 rounded-2xl p-8 border border-gray-200">
                <h2 className="text-xl font-bold text-gray-900 mb-4">Terms & Conditions</h2>
                <ul className="space-y-2 list-disc pl-5 text-gray-600 text-sm">
                  {campaign.termsAndConditions.map((term, index) => (
                    <li key={index}>{term}</li>
                  ))}
                </ul>
              </section>
            )}
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
                      isMember={isMember}
                    // We don't have userPoints readily available in this context without fetching balance
                    // But we can pass 0 or fetch it if needed. For now, let's keep it simple.
                    // Actually, we should fetch balance if member to show progress.
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

      {/* Sticky Mobile/Bottom Action Bar */}
      < div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.1)] p-4 z-50 md:hidden" >
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
          {isMember ? (
            <div className="flex gap-2 w-full">
              <Link href={`/campaigns/${campaignId}/my-points`} className="flex-1">
                <Button variant="outline" className="w-full border-orange-200 text-orange-700 hover:bg-orange-50">
                  My Points
                </Button>
              </Link>
              <Link href="#rewards" className="flex-1">
                <Button className="w-full bg-green-600 hover:bg-green-700 text-white shadow-lg">
                  Claim Reward
                </Button>
              </Link>
            </div>
          ) : (
            <Button
              onClick={handleJoinClick}
              disabled={isJoining}
              className="w-full bg-orange-600 hover:bg-orange-700 text-white text-lg py-6 rounded-xl shadow-lg"
            >
              {isJoining ? 'Joining...' : 'Join Campaign'}
            </Button>
          )}
        </div>
      </div >
    </div >
  );
}
