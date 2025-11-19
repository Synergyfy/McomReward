'use client';

import React from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Image from "next/image";
import { Calendar, Tag, Info, Gift, CheckCircle, Users, Trophy, ShoppingBag } from "lucide-react";
import { CampaignFormData } from "@/context/CampaignFormContext";

interface CampaignDetailPagePreviewProps {
  campaignData: CampaignFormData;
}

const mockAllRewards = [
  {
    id: '1',
    title: 'Summer Voucher ($50)',
    description: 'Get a $50 voucher for your summer shopping.',
    points: 50,
    image: 'https://images.unsplash.com/photo-1529592691919-7a6aa481f520?q=80&w=2574&auto=format&fit=crop&ixlib=rb-4.0.3',
  },
  {
    id: '2',
    title: 'Gift Card ($100)',
    description: 'A $100 gift card to use on any purchase.',
    points: 100,
    image: 'https://images.unsplash.com/photo-1579621970795-87f943b9e7a6?q=80&w=2670&auto=format&fit=crop&ixlib=rb-4.0.3',
  },
  {
    id: '3',
    title: 'Discount Coupon (20% off)',
    description: 'Enjoy 20% off your next order.',
    points: 20,
    image: 'https://images.unsplash.com/photo-1508615039623-a25605d2b022?q=80&w=2670&auto=format&fit=crop&ixlib=rb-4.0.3',
  },
];

export default function CampaignDetailPagePreview({ campaignData }: CampaignDetailPagePreviewProps) {
  const campaign = campaignData;

  const handleJoin = () => {
    alert('This is a preview. Join functionality is not active here.');
  };

  const selectedRewards = mockAllRewards.filter(r => campaign.rewardIds.includes(r.id));

  return (
    <div className="min-h-screen bg-gray-100 text-gray-900">
      {/* Hero Section - Title and Headline */}
      <div className="relative h-[400px] md:h-[500px] w-full overflow-hidden">
        <Image
          src={campaign.imageUrl || 'https://via.placeholder.com/1920x700?text=Campaign+Hero'}
          alt={campaign.campaignName || 'Campaign Hero'}
          layout="fill"
          objectFit="cover"
          className="brightness-75"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/40 to-transparent flex items-end pb-16 px-4 md:px-8 lg:px-16"
             style={{ backgroundColor: campaign.bgColor, color: campaign.bgColorTextColor }}>
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-4xl md:text-6xl font-extrabold leading-tight mb-4 drop-shadow-lg">
              {campaign.campaignName || '[Campaign Name]'}
            </h1>
            <p className="text-lg md:text-xl mb-8 opacity-90 drop-shadow-md">
              {campaign.campaignMessage || '[Campaign Tagline/Message]'}
            </p>
            <Button
              onClick={handleJoin}
              className="w-full md:w-auto text-lg px-12 py-3 rounded-full shadow-lg transition-all duration-300 transform hover:scale-105"
              style={{ backgroundColor: campaign.ctaBgColor, color: campaign.ctaTextColor }}
            >
              {campaign.ctaButtonText || 'Join Campaign & Get Reward'}
            </Button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto py-12 px-4 md:px-8 lg:px-16 relative z-10">
        <div className="max-w-4xl mx-auto bg-white rounded-3xl shadow-2xl p-8 md:p-12 space-y-10 -mt-20">
          {/* Campaign Description */}
          <section>
            <h2 className="text-3xl font-bold text-gray-800 mb-4">About This Campaign</h2>
            <p className="text-lg text-gray-700 leading-relaxed">
              {campaign.campaignMessage || '[Campaign Description]'}
            </p>
          </section>

          {/* Key Information */}
          <section className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card className="p-6 shadow-md border-l-4 border-orange-600">
              <CardHeader className="!p-0 mb-3">
                <CardTitle className="text-xl font-semibold flex items-center text-gray-800">
                  <Calendar className="w-5 h-5 mr-2 text-orange-600" />
                  Campaign Period
                </CardTitle>
              </CardHeader>
              <CardContent className="!p-0 text-gray-700 text-lg">
                <p>{campaign.startDate ? new Date(campaign.startDate).toLocaleDateString() : '[Start Date]'} - {campaign.endDate ? new Date(campaign.endDate).toLocaleDateString() : '[End Date]'}</p>
              </CardContent>
            </Card>
            <Card className="p-6 shadow-md border-l-4 border-orange-600">
              <CardHeader className="!p-0 mb-3">
                <CardTitle className="text-xl font-semibold flex items-center text-gray-800">
                  <Tag className="w-5 h-5 mr-2 text-orange-600" />
                  Category
                </CardTitle>
              </CardHeader>
              <CardContent className="!p-0 text-gray-700 text-lg">
                <p>{campaign.campaignType || '[Category]'}</p>
              </CardContent>
            </Card>
          </section>

          {/* Eligibility & Limits */}
          <section className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card className="p-6 shadow-md border-l-4 border-orange-600">
              <CardHeader className="!p-0 mb-3">
                <CardTitle className="text-xl font-semibold flex items-center text-gray-800">
                  <Users className="w-5 h-5 mr-2 text-orange-600" />
                  Target Audience
                </CardTitle>
              </CardHeader>
              <CardContent className="!p-0 text-gray-700 text-lg">
                  {campaign.audienceType.length > 0 ? (
                    <p>
                      {campaign.audienceType.map((type, index) => {
                        let audienceText = '';
                        if (type === 'members') audienceText = 'All Members';
                        if (type === 'badge_level') audienceText = `Members with ${campaign.badgeLevels?.join(', ') || '[Level]'} Badge`;
                        if (type === 'wishlist_target') audienceText = `Wishlist for "${campaign.wishlistItemIds?.join(', ') || '[Item]'}"`;
                        return (
                          <span key={index} className="inline-block bg-gray-100 text-gray-800 text-xs font-semibold px-2.5 py-0.5 rounded-full mr-2 mb-1">
                            {audienceText}
                          </span>
                        );
                      }).join(', ')}
                    </p>
                  ) : (
                    <p>All Customers</p>
                  )}
                </CardContent>
              </Card>
              <Card className="p-6 shadow-md border-l-4 border-orange-600">
                <CardHeader className="!p-0 mb-3">
                  <CardTitle className="text-xl font-semibold flex items-center text-gray-800">
                    <Info className="w-5 h-5 mr-2 text-orange-600" />
                    Campaign Limits
                  </CardTitle>
                </CardHeader>
                <CardContent className="!p-0 text-gray-700 text-lg">
                  {Number(campaign.rewardsAvailable) > 0 && <p>Rewards Available: {campaign.rewardsAvailable}</p>}
                  {Number(campaign.schedulingRules?.stopAfterClaims) > 0 && <p>Stops After: {campaign.schedulingRules.stopAfterClaims} Claims</p>}
                  {(Number(campaign.rewardsAvailable) === 0 && Number(campaign.schedulingRules?.stopAfterClaims) === 0) && <p>Unlimited Rewards/Claims</p>}
                </CardContent>
              </Card>
            </div>
          </section>

          {/* Multiple Rewards Display */}
          {campaign.rewardIds && campaign.rewardIds.length > 0 && (
            <section>
              <h2 className="text-3xl font-bold text-gray-800 mb-6">Rewards in this Campaign</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {campaign.rewardIds.map((rewardId) => {
                  const rewardItem = mockAllRewards.find(r => r.id === rewardId);
                  if (!rewardItem) return null; // Handle case where rewardId is not found in mock
                  return (
                    <Card key={rewardItem.id} className="overflow-hidden shadow-lg hover:shadow-xl transition-shadow duration-300 border border-gray-200">
                      <div className="relative h-48 w-full">
                        <Image
                          src={rewardItem.image}
                          alt={rewardItem.title}
                          layout="fill"
                          objectFit="cover"
                        />
                      </div>
                      <CardContent className="p-4">
                        <h3 className="text-xl font-bold text-gray-800 mb-2">{rewardItem.title}</h3>
                        <p className="text-gray-600 text-sm mb-3 line-clamp-3">{rewardItem.description}</p>
                        <div className="flex justify-between items-center text-md font-semibold text-gray-700">
                          <p className="flex items-center"><Trophy className="w-4 h-4 mr-2 text-blue-500" /> {rewardItem.points > 0 ? `${rewardItem.points} Points` : 'No Points Req.'}</p>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </section>
          )}

          {/* How to Earn */}
          {campaign.howToEarn && campaign.howToEarn.length > 0 && (
            <section>
              <h2 className="text-3xl font-bold text-gray-800 mb-4">How to Participate & Earn</h2>
              <ul className="space-y-3 text-lg text-gray-700 list-disc pl-5">
                {campaign.howToEarn.map((item, index) => (
                  <li key={index} className="flex items-start">
                    <CheckCircle className="w-6 h-6 mr-3 text-green-500 flex-shrink-0 mt-1" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </section>
          )}

          {/* Terms and Conditions */}
          {campaign.termsAndConditions && campaign.termsAndConditions.length > 0 && (
            <section>
              <h2 className="text-3xl font-bold text-gray-800 mb-4">Terms & Conditions</h2>
              <ul className="space-y-3 text-base text-gray-600 list-disc pl-5">
                {campaign.termsAndConditions.map((item, index) => (
                  <li key={index}>{item}</li>
                ))}
              </ul>
            </section>
          )}
        </div>
      </div>

      {/* Sticky Join Button */}
      <div className="sticky bottom-0 left-0 right-0 bg-white border-t border-gray-200 shadow-lg p-4 z-20">
        <div className="max-w-4xl mx-auto flex justify-center">
          <Button
            onClick={handleJoin}
            className="w-full md:w-auto text-lg px-12 py-3 rounded-full shadow-lg transition-all duration-300 transform hover:scale-105"
            style={{ backgroundColor: campaign.ctaBgColor, color: campaign.ctaTextColor }}
          >
            {campaign.ctaButtonText || 'Join Campaign & Get Reward'}
          </Button>
        </div>
      </div>
    </div>
  );
}
