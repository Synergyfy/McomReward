'use client';

import React from 'react';
import { useParams } from 'next/navigation';
import { useGetCampaignById } from '@/services/campaigns/hook';
import LoadingSpinner from '@/components/ui/Loading';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Gift } from "lucide-react";

export default function RedeemPointsPage() {
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
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        <Card className="shadow-lg border-none overflow-hidden">
          <CardHeader className="bg-pink-50 border-b border-pink-100 p-8 text-center">
            <div className="mx-auto bg-pink-100 w-16 h-16 rounded-full flex items-center justify-center mb-4">
              <Gift className="w-8 h-8 text-pink-600" />
            </div>
            <CardTitle className="text-3xl font-bold text-gray-900">
              {campaign.redeemRewardPageTitle || 'Redeem Rewards'}
            </CardTitle>
          </CardHeader>
          <CardContent className="p-8">
            <div
              className="prose prose-lg max-w-none text-gray-600"
              dangerouslySetInnerHTML={{ __html: campaign.redeemRewardPageDescription || '<p>No description available.</p>' }}
            />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
