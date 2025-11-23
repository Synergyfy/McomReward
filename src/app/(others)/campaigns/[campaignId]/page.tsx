'use client';

import { isAxiosError } from 'axios';
import React, { use, useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Image from "next/image";
import { Calendar, Tag, Info, CheckCircle, Users, Trophy } from "lucide-react";
import { useCampaignMembership } from '@/context/CampaignMembershipContext';
import Link from 'next/link';
import { useGetPublicCampaignDetails, useJoinCampaign, useCheckCampaignJoinStatus } from '@/services/customer-campaigns/hook';

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
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <p className="text-lg text-gray-600">Loading campaign details...</p>
      </div>
    );
  }

  if (error || !campaign) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <p className="text-lg text-red-500">Failed to load campaign. Please try again later.</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 text-gray-900">
      <div className="relative">
        {/* Hero Section - Title and Headline */}
        <div className="relative h-[400px] md:h-[500px] w-full overflow-hidden">
          <Image
            src={campaign.banner_url || '/placeholder-image.jpg'}
            alt={campaign.title || 'Campaign Image'}
            layout="fill"
            objectFit="cover"
            className="brightness-75"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/40 to-transparent flex items-end pb-16 px-4 md:px-8 lg:px-16">
            <div className="max-w-4xl mx-auto text-white text-center">
              <h1 className="text-4xl md:text-6xl font-extrabold leading-tight mb-4 drop-shadow-lg">
                {campaign.title}
              </h1>
              <p className="text-lg md:text-xl mb-8 opacity-90 drop-shadow-md">
                {isMember ? `Welcome, ${memberName}!` : campaign.tagline || (campaign.description || campaign.campaignMessage || '').substring(0, 100) + '...'}
              </p>
              {!isMember && (
                <Button
                  onClick={handleJoinClick}
                  className="bg-orange-600 hover:bg-orange-700 text-white text-lg px-8 py-3 rounded-full shadow-lg transition-all duration-300 transform hover:scale-105"
                >
                  Join Campaign & Get Reward
                </Button>
              )}
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="container mx-auto py-12 px-4 md:px-8 lg:px-16 relative z-10">
          <div className="max-w-4xl mx-auto bg-white rounded-3xl shadow-2xl p-8 md:p-12 space-y-10 -mt-20">
            {isMember && (
              <div className="p-4 bg-green-100 border-l-4 border-green-500 rounded-lg">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <CheckCircle className="h-5 w-5 text-green-400" />
                  </div>
                  <div className="ml-3">
                    <p className="text-sm font-medium text-green-800">You have joined this campaign. Welcome, {memberName}!</p>
                  </div>
                </div>
              </div>
            )}
            {!isMember && (
              <>
                {/* Campaign Description */}
                <section>
                  <h2 className="text-3xl font-bold text-gray-800 mb-4">About This Campaign</h2>
                  <p className="text-lg text-gray-700 leading-relaxed">
                    {campaign.description || campaign.campaignMessage}
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
                      <p>{new Date(campaign.startDate).toLocaleDateString()} - {new Date(campaign.endDate).toLocaleDateString()}</p>
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
                      <p>{campaign.category || 'General'}</p>
                    </CardContent>
                  </Card>
                </section>

                {/* Eligibility & Limits */}
                <section>
                  <h2 className="text-3xl font-bold text-gray-800 mb-4">Eligibility & Limits</h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <Card className="p-6 shadow-md border-l-4 border-orange-600">
                      <CardHeader className="!p-0 mb-3">
                        <CardTitle className="text-xl font-semibold flex items-center text-gray-800">
                          <Users className="w-5 h-5 mr-2 text-orange-600" />
                          Target Audience
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="!p-0 text-gray-700 text-lg">
                        <p>
                          <span className="inline-block bg-gray-100 text-gray-800 text-xs font-semibold px-2.5 py-0.5 rounded-full mr-2 mb-1">
                            {campaign.audience_type === 'all' ? 'All Customers' : campaign.audience_type}
                          </span>
                        </p>
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
                        {campaign.rewardsAvailable !== undefined && campaign.rewardsAvailable > 0 && <p>Rewards Available: {campaign.rewardsAvailable}</p>}
                        {campaign.stopAfterClaims !== undefined && campaign.stopAfterClaims > 0 && <p>Stops After: {campaign.stopAfterClaims} Claims</p>}
                        {(campaign.rewardsAvailable === 0 || campaign.rewardsAvailable === undefined) && (campaign.stopAfterClaims === 0 || campaign.stopAfterClaims === undefined) && <p>Unlimited Rewards/Claims</p>}
                      </CardContent>
                    </Card>
                  </div>
                </section>
              </>
            )}

            {/* Multiple Rewards Display */}
            {campaign.rewards && campaign.rewards.length > 0 && (
              <section>
                <h2 className="text-3xl font-bold text-gray-800 mb-6">Rewards in this Campaign</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {campaign.rewards.map((rewardItem, index) => (
                    <Card key={index} className="overflow-hidden shadow-lg hover:shadow-xl transition-shadow duration-300 border border-gray-200">
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
                          <p className="flex items-center"><Trophy className="w-4 h-4 mr-2 text-blue-500" /> {rewardItem.pointsRequired > 0 ? `${rewardItem.pointsRequired} Points` : 'No Points Req.'}</p>
                          {rewardItem.value && <p>{rewardItem.value}</p>}
                        </div>
                        {rewardItem.quantity > 0 && (
                          <p className="text-xs text-gray-500 mt-2">Limited: {rewardItem.quantity} available</p>
                        )}
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </section>
            )}

            {!isMember && (
              <>
                {/* How to Earn */}
                {campaign.howToEarn && campaign.howToEarn.length > 0 && (
                  <section>
                    <h2 className="text-3xl font-bold text-gray-800 mb-4">How to Participate & Earn</h2>
                    <ul className="space-y-3 text-lg text-gray-700">
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
              </>
            )}
          </div>
        </div>

        {/* Sticky Join Button */}
        <div className="sticky bottom-0 left-0 right-0 bg-white border-t border-gray-200 shadow-lg p-4 z-20">
          <div className="max-w-4xl mx-auto flex justify-center">
            {isMember ? (
              <div className="flex flex-col md:flex-row gap-4 w-full justify-center">
                <Link href={`/campaigns/${campaignId}/my-points`} passHref>
                  <Button className="w-full md:w-auto bg-green-600 hover:bg-green-700 text-white text-lg px-12 py-3 rounded-full shadow-lg transition-all duration-300 transform hover:scale-105">
                    View My Points
                  </Button>
                </Link>
                <Link href={`/campaigns/${campaignId}/redeem-points`} passHref>
                  <Button className="w-full md:w-auto bg-orange-600 hover:bg-orange-700 text-white text-lg px-12 py-3 rounded-full shadow-lg transition-all duration-300 transform hover:scale-105">
                    Redeem Rewards
                  </Button>
                </Link>
              </div>
            ) : (
              <Button
                onClick={handleJoinClick}
                className="w-full md:w-auto bg-orange-600 hover:bg-orange-700 text-white text-lg px-12 py-3 rounded-full shadow-lg transition-all duration-300 transform hover:scale-105"
              >
                Join Campaign & Get Reward
              </Button>
            )}
          </div>
          <div className="mt-4 text-center">
            <Link href={`/campaigns/${campaignId}/contact-us`} className="text-gray-500 hover:text-orange-600 text-sm underline">
              Need help? Contact Us
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
