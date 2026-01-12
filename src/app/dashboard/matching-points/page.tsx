'use client';

import React, { useState } from 'react';
import { useGetBusinessProfile } from '@/services/business/hook';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import MatchingPointsOverview from '@/components/dashboard/matching-points/MatchingPointsOverview';
import MatchingPointsHistoryTable from '@/components/dashboard/matching-points/MatchingPointsHistoryTable';
import { matchingPointsOverview as mockOverview } from '@/lib/mock-data/matchingPoints';
import { useGetMatchingPointBalance, useGetMatchingPointsHistory } from '@/services/matching-points/hook';
import { Loader2, QrCode, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { useGetMyCreatedCampaigns } from '@/services/campaigns/hook';
import { CampaignResponse, CampaignType, PublicCampaignResponse } from '@/services/campaigns/types';
import AwardPointsModal from '@/components/dashboard/matching-points/AwardPointsModal';
import { format } from 'date-fns';

export default function MatchingPointsPage() {
  const { data: profile, isLoading: isProfileLoading } = useGetBusinessProfile();
  const { data: balanceData, isLoading: isBalanceLoading } = useGetMatchingPointBalance();
  const { data: historyData, isLoading: isHistoryLoading } = useGetMatchingPointsHistory({ page: 1, limit: 10 });

  // Super Business Data
  const { data: campaignsData, isLoading: isCampaignsLoading } = useGetMyCreatedCampaigns();

  const [isAwardModalOpen, setIsAwardModalOpen] = useState(false);

  if (isProfileLoading || isBalanceLoading || isHistoryLoading) {
    return (
      <div className="flex justify-center items-center h-96">
        <Loader2 className="h-8 w-8 animate-spin text-gray-500" />
      </div>
    );
  }

  // Super Business View
  if (profile?.isSuperBusiness) {
    // Filter matching point campaigns and map to CampaignResponse to ensure compatibility
    const matchingCampaigns: CampaignResponse[] = (campaignsData?.data || [])
      .filter((c: PublicCampaignResponse) => c.campaign_type === CampaignType.MATCHING_POINT)
      .map((c: PublicCampaignResponse) => ({
        ...c,
        campaignType: c.campaign_type,
        campaignMessage: c.campaign_message,
        bannerUrl: c.banner_url || c.bannerUrl || '',
        startDate: c.start_date,
        endDate: c.end_date,
        logoUrl: c.logo_url || c.logoUrl || '',
        // Cast to 'any' to access the snake_case property that exists on the runtime object but is missing from the type definition
        totalMatchingPointsEarned: (c as any).total_matching_points_earned || 0,
        totalPointsEarned: 0,
        totalPointsRedeemed: 0,
        matchingPointsDisabledByAdmin: false,
        createdAt: new Date().toISOString(), // Fallback if missing
        updatedAt: new Date().toISOString(),
        deletedAt: null,
        // Map other required fields with defaults
        audienceType: c.audience_type,
        ctaText: c.cta_text,
        ctaBackgroundColor: c.cta_background_color,
        ctaTextColor: c.cta_text_color,
        textColor: c.text_color,
        backgroundColor: c.background_color,
        signUpPoint: 0,
        rewardType: 'regular',
        regularPointsThreshold: 0,
        matchingPointsThreshold: 0,
        earnPointPageTitle: '',
        earnPointPageDescription: '',
        redeemRewardPageTitle: '',
        redeemRewardPageDescription: '',
        contactUsPageTitle: '',
        contactUsPageDescription: '',
        contactEmail: '',
        contactPhoneNumber: '',
        footerText: '',
      } as unknown as CampaignResponse)); // Casting as partial mapping is sufficient for UI

    return (
      <div className="space-y-8">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold text-gray-800">Matching Point Campaigns</h1>
          <div className="flex gap-4">
             <Button onClick={() => setIsAwardModalOpen(true)} className="gap-2 bg-indigo-600 hover:bg-indigo-700">
                <QrCode className="h-4 w-4" />
                Award Points
             </Button>
             <Link href="/dashboard/campaigns/create">
                <Button className="gap-2">
                  <Plus className="h-4 w-4" />
                  Create Campaign
                </Button>
             </Link>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {matchingCampaigns.map((campaign: CampaignResponse) => (
             <Card key={campaign.id} className="overflow-hidden hover:shadow-lg transition-shadow">
               <div className="h-32 bg-gray-100 relative">
                  {campaign.bannerUrl ? (
                    <img src={campaign.bannerUrl} alt={campaign.name} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-400">No Banner</div>
                  )}
                  <div className={`absolute top-2 right-2 px-2 py-1 rounded text-xs font-bold ${campaign.disabled ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}>
                    {campaign.disabled ? 'Disabled' : 'Active'}
                  </div>
               </div>
               <CardContent className="p-4">
                  <h3 className="font-bold text-lg mb-1">{campaign.name}</h3>
                  <p className="text-sm text-gray-500 mb-3 line-clamp-2">{campaign.campaignMessage}</p>

                  <div className="grid grid-cols-2 gap-4 text-sm mb-4">
                    <div>
                      <p className="text-gray-500 text-xs">Total Earned</p>
                      <p className="font-semibold">{campaign.totalMatchingPointsEarned || 0}</p>
                    </div>
                    <div>
                       <p className="text-gray-500 text-xs">Participants</p>
                       <p className="font-semibold">N/A</p>
                    </div>
                  </div>

                  <div className="text-xs text-gray-400">
                    Created: {campaign.createdAt ? format(new Date(campaign.createdAt), 'MMM d, yyyy') : 'N/A'}
                  </div>
               </CardContent>
             </Card>
          ))}

          {matchingCampaigns.length === 0 && (
             <div className="col-span-full text-center py-12 bg-gray-50 rounded-lg border border-dashed border-gray-300">
                <p className="text-gray-500 mb-2">No Matching Point Campaigns found.</p>
                <Link href="/dashboard/campaigns/create">
                  <Button variant="outline">Create your first one</Button>
                </Link>
             </div>
          )}
        </div>

        {/* Award Points Modal */}
        <AwardPointsModal
          isOpen={isAwardModalOpen}
          onClose={() => setIsAwardModalOpen(false)}
          campaigns={matchingCampaigns}
        />
      </div>
    );
  }

  // Regular Business View
  const overview = {
    ...mockOverview,
    totalMatchingPoints: balanceData?.matching_points ?? 0,
  };

  return (
    <div className="space-y-8">
      <h1 className="text-3xl font-bold text-gray-800">Matching Points</h1>

      {/* Overview, Earning, and Redemption Rules */}
      <MatchingPointsOverview overview={overview} />

      {/* Admin Notices or Restrictions */}
      <Card>
        <CardHeader>
          <CardTitle>Admin Notices & Restrictions</CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="list-disc list-inside text-sm text-gray-700 space-y-1">
            {mockOverview.adminNotices.map((notice, index) => (
              <li key={index}>{notice}</li>
            ))}
          </ul>
        </CardContent>
      </Card>

      {/* Matching Points Activity Log */}
      <MatchingPointsHistoryTable history={historyData?.data || []} />
    </div>
  );
}
