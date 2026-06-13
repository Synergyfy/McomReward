'use client';

import React from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import Image from "next/image";
import { Calendar, Info, Gift, CheckCircle, Users } from "lucide-react";
import { CampaignFormData } from "@/context/CampaignFormContext";
import { Badge } from "@/components/ui/badge";
import DOMPurify from 'dompurify';

interface CampaignDetailPagePreviewProps {
  campaignData: CampaignFormData;
}

// Mock rewards for preview since we only have IDs in formData
const mockAllRewards = [
  {
    id: '1',
    title: 'Summer Voucher ($50)',
    description: 'Get a $50 voucher for your summer shopping.',
    points: 50,
    imageUrl: 'https://images.unsplash.com/photo-1529592691919-7a6aa481f520?q=80&w=2574&auto=format&fit=crop&ixlib=rb-4.0.3',
  },
  {
    id: '2',
    title: 'Gift Card ($100)',
    description: 'A $100 gift card to use on any purchase.',
    points: 100,
    imageUrl: 'https://images.unsplash.com/photo-1579621970795-87f943b9e7a6?q=80&w=2670&auto=format&fit=crop&ixlib=rb-4.0.3',
  },
  {
    id: '3',
    title: 'Discount Coupon (20% off)',
    description: 'Enjoy 20% off your next order.',
    points: 20,
    imageUrl: 'https://images.unsplash.com/photo-1508615039623-a25605d2b022?q=80&w=2670&auto=format&fit=crop&ixlib=rb-4.0.3',
  },
];

export default function CampaignDetailPagePreview({ campaignData }: CampaignDetailPagePreviewProps) {
  const campaign = campaignData;
  const isMember = false; // Preview always shows non-member view initially or we could toggle?
  const isJoining = false;

  // Fallback image if bannerUrl is missing
  const bannerImage = campaign.imageUrl || 'https://placehold.co/1920x600?text=Campaign+Banner';

  // Mock rewards logic
  const selectedRewards = mockAllRewards.filter(r => campaign.rewardIds.includes(r.id));
  // If no rewards match (e.g. real IDs vs mock IDs), just show some mocks for preview effect if IDs exist
  const displayRewards = selectedRewards.length > 0 ? selectedRewards : (campaign.rewardIds.length > 0 ? mockAllRewards.slice(0, campaign.rewardIds.length) : []);

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900 pb-24">
      {/* Hero Section */}
      <div className="relative h-[450px] md:h-[550px] w-full overflow-hidden group">
        <Image
          src={bannerImage}
          alt={campaign.campaignName || 'Campaign Banner'}
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
                {campaign.campaignType && (
                  <Badge className="bg-orange-500 hover:bg-orange-600 text-white border-none px-3 py-1 text-sm uppercase tracking-wide">
                    {campaign.campaignType.replace('_', ' ')}
                  </Badge>
                )}
                {campaign.audienceType && campaign.audienceType.length > 0 && (
                  <Badge variant="secondary" className="px-3 py-1 text-sm uppercase tracking-wide bg-white/20 text-white hover:bg-white/30 border-none backdrop-blur-sm">
                    {campaign.audienceType.join(', ')}
                  </Badge>
                )}
              </div>
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold leading-tight mb-4 drop-shadow-xl">
                {campaign.campaignName || 'Campaign Name'}
              </h1>
              <div
                className="text-lg md:text-xl text-gray-200 max-w-2xl line-clamp-2 drop-shadow-md"
                dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(campaign.campaignMessage || 'Join this exclusive campaign to earn rewards!') }}
              />
            </div>

            {/* Desktop Action Button (Hero) */}
            <div className="hidden md:block shrink-0">
              <Button
                disabled={true} // Disabled in preview
                className="bg-orange-600 hover:bg-orange-700 text-white text-lg px-8 py-6 rounded-full shadow-xl transition-all duration-300 transform hover:scale-105 hover:shadow-2xl border-2 border-white/20"
              >
                Join Campaign
              </Button>
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
                <p className="text-sm font-semibold text-gray-900">{campaign.startDate ? new Date(campaign.startDate).toLocaleDateString() : 'TBD'}</p>
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
                <p className="text-sm font-semibold text-gray-900">{campaign.endDate ? new Date(campaign.endDate).toLocaleDateString() : 'TBD'}</p>
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
                <p className="text-sm font-semibold text-gray-900 capitalize">{campaign.audienceType.join(', ') || 'All'}</p>
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
                  {Number(campaign.rewardsAvailable) > 0 ? `${campaign.rewardsAvailable} Spots` : 'Unlimited'}
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="flex flex-col gap-16">
          {/* Main Content Column - Text Sections */}
          <div className="max-w-4xl space-y-12">

            {/* About Section */}
            <section>
              <h2 className="text-3xl font-bold text-gray-900 mb-6 flex items-center gap-3">
                <Info className="w-8 h-8 text-orange-600" />
                About This Campaign
              </h2>
              <div className="prose prose-lg text-gray-600 max-w-none leading-relaxed">
                 {/<[a-z][\s\S]*>/i.test(campaign.campaignMessage) ? (
                  <div dangerouslySetInnerHTML={{ __html: campaign.campaignMessage }} />
                ) : (
                  <p>{campaign.campaignMessage}</p>
                )}
              </div>
            </section>

            {/* How to Earn Section */}
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

            {/* Terms Section */}
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

          {/* Rewards Grid Section */}
          <div id="rewards" className="scroll-mt-24">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
              <div>
                <h2 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
                  <Gift className="w-8 h-8 text-orange-600" />
                  Rewards
                </h2>
                <p className="text-gray-500 mt-2">
                  Complete tasks to earn points and redeem these exclusive rewards.
                </p>
              </div>
              <Badge variant="outline" className="w-fit px-4 py-2 text-base font-medium">
                {displayRewards.length} Available
              </Badge>
            </div>

            {displayRewards.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {displayRewards.map((reward, index) => (
                  <div key={index} className="group flex flex-col bg-white rounded-2xl overflow-hidden shadow-md hover:shadow-xl transition-all duration-300 border border-gray-100">
                    <div className="relative h-48 w-full overflow-hidden">
                      <Image
                        src={reward.imageUrl || 'https://via.placeholder.com/400x300'}
                        alt={reward.title}
                        layout="fill"
                        objectFit="cover"
                        className="group-hover:scale-105 transition-transform duration-500"
                      />
                      <div className="absolute top-3 right-3 bg-black/70 backdrop-blur-md text-white text-xs font-bold px-3 py-1 rounded-full">
                        {reward.points} Points
                      </div>
                    </div>
                    <div className="p-5 flex flex-col flex-grow">
                        <h3 className="text-lg font-bold text-gray-900 mb-2 group-hover:text-orange-600 transition-colors">{reward.title}</h3>
                        <p className="text-gray-500 text-sm line-clamp-2 mb-4 flex-grow">{reward.description}</p>
                        <Button className="w-full bg-gray-900 text-white hover:bg-orange-600 transition-colors rounded-xl">
                            View Details
                        </Button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-16 bg-white rounded-2xl border-2 border-dashed border-gray-200">
                <Gift className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                <h3 className="text-lg font-medium text-gray-900">No rewards listed yet</h3>
                <p className="text-gray-500">Check back later for exciting rewards!</p>
              </div>
            )}
          </div>
        </div>
      </div >

      {/* Sticky Mobile/Bottom Action Bar */}
      < div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.1)] p-4 z-50 md:hidden" >
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
            <Button
              disabled={true}
              className="w-full bg-orange-600 hover:bg-orange-700 text-white text-lg py-6 rounded-xl shadow-lg"
            >
              Join Campaign
            </Button>
        </div>
      </div >
    </div >
  );
}