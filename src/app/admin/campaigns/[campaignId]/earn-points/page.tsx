'use client';

import React from 'react';
import { useParams } from 'next/navigation';
import { useGetCampaignById } from '@/services/campaigns/hook';
import LoadingSpinner from '@/components/ui/Loading';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Trophy } from "lucide-react";

export default function EarnPointsPage() {
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
          <CardHeader className="bg-yellow-50 border-b border-yellow-100 p-8 text-center">
            <div className="mx-auto bg-yellow-100 w-16 h-16 rounded-full flex items-center justify-center mb-4">
              <Trophy className="w-8 h-8 text-yellow-600" />
            </div>
            <CardTitle className="text-3xl font-bold text-gray-900">
              {campaign.earnPointPageTitle || 'Earn Points'}
            </CardTitle>
          </CardHeader>
          <CardContent className="p-8">
            <div
              className="prose prose-lg max-w-none text-gray-600"
              dangerouslySetInnerHTML={{ __html: campaign.earnPointPageDescription || '<p>No description available.</p>' }}
            />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
