'use client';

import React from 'react';
import { useParams } from 'next/navigation';
import { useGetCampaignById } from '@/services/campaigns/hook';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Image from "next/image";
import { Calendar, Tag, Info, Gift, CheckCircle, Users, Trophy } from "lucide-react";
import LoadingSpinner from '@/components/ui/Loading';

export default function CampaignOverviewPage() {
  const params = useParams();
  const { campaignId } = params;

  const { data: campaign, isLoading, isError } = useGetCampaignById(campaignId as string);

  if (isLoading) {
    return <LoadingSpinner />;
  }

  if (isError || !campaign) {
    return <p className="text-center text-lg text-red-500 py-20">Campaign not found.</p>;
  }

  return (
    <div className="min-h-screen bg-gray-100 text-gray-900">
        <div className="relative">
          {/* Hero Section - Title and Headline */}
          <div className="relative h-[400px] md:h-[500px] w-full overflow-hidden">
            <Image
              src={campaign.bannerUrl}
              alt={campaign.name}
              layout="fill"
              objectFit="cover"
              className="brightness-75"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/40 to-transparent flex items-end pb-16 px-4 md:px-8 lg:px-16">
              <div className="max-w-4xl mx-auto text-white text-center">
                <h1 className="text-4xl md:text-6xl font-extrabold leading-tight mb-4 drop-shadow-lg">
                  {campaign.name}
                </h1>
                <p className="text-lg md:text-xl mb-8 opacity-90 drop-shadow-md">
                  {campaign.campaignMessage}
                </p>
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="container mx-auto py-12 px-4 md:px-8 lg:px-16 relative z-10">
            <div className="max-w-4xl mx-auto bg-white rounded-3xl shadow-2xl p-8 md:p-12 space-y-10 -mt-20">
                <section>
                    <h2 className="text-3xl font-bold text-gray-800 mb-4">About This Campaign</h2>
                    <p className="text-lg text-gray-700 leading-relaxed">
                      {campaign.campaignMessage}
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
                          Type
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="!p-0 text-gray-700 text-lg">
                        <p>{campaign.campaignType}</p>
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
                          <p>{campaign.audienceType}</p>
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
                          {campaign.quantity > 0 && <p>Rewards Available: {campaign.quantity}</p>}
                          {campaign.quantity === 0 && <p>Unlimited Rewards/Claims</p>}
                        </CardContent>
                      </Card>
                    </div>
                  </section>

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
                            <p className="flex items-center"><Trophy className="w-4 h-4 mr-2 text-blue-500" /> {rewardItem.points_required > 0 ? `${rewardItem.points_required} Points` : 'No Points Req.'}</p>
                            {rewardItem.value && <p>£{rewardItem.value}</p>}
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
            </div>
          </div>
        </div>
    </div>
  );
}
