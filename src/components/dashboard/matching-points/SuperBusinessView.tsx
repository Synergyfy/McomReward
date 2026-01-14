'use client';

import React, { useState } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Loader2, QrCode, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { useGetMyCreatedCampaigns } from '@/services/campaigns/hook';
import { CampaignResponse, CampaignType, PublicCampaignResponse } from '@/services/campaigns/types';
import AwardPointsModal from '@/components/dashboard/matching-points/AwardPointsModal';
import { format } from 'date-fns';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { mockMatchingPointRewards, mockGlobalRedemptions } from '@/lib/mock-data/matchingPointsRewards';
import CreateMatchingRewardModal from './CreateMatchingRewardModal';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';

export default function SuperBusinessView() {
  const { data: campaignsData, isLoading: isCampaignsLoading } = useGetMyCreatedCampaigns();
  const [isAwardModalOpen, setIsAwardModalOpen] = useState(false);
  const [isCreateRewardModalOpen, setIsCreateRewardModalOpen] = useState(false);

  if (isCampaignsLoading) {
    return (
      <div className="flex justify-center items-center h-96">
        <Loader2 className="h-8 w-8 animate-spin text-gray-500" />
      </div>
    );
  }

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
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-800">Matching Points Dashboard</h1>
      </div>

      <Tabs defaultValue="campaigns" className="w-full">
        <TabsList className="grid w-full grid-cols-3 lg:w-[400px]">
          <TabsTrigger value="campaigns">Campaigns</TabsTrigger>
          <TabsTrigger value="rewards">Rewards</TabsTrigger>
          <TabsTrigger value="redemptions">Redemptions</TabsTrigger>
        </TabsList>

        {/* CAMPAIGNS TAB */}
        <TabsContent value="campaigns" className="space-y-6 mt-6">
          <div className="flex justify-between items-center">
             <h2 className="text-xl font-semibold">Active Campaigns</h2>
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
        </TabsContent>

        {/* REWARDS TAB */}
        <TabsContent value="rewards" className="space-y-6 mt-6">
           <div className="flex justify-between items-center">
             <h2 className="text-xl font-semibold">Matching Point Rewards</h2>
             <Button onClick={() => setIsCreateRewardModalOpen(true)} className="gap-2">
               <Plus className="h-4 w-4" />
               Create Reward
             </Button>
           </div>

           <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {mockMatchingPointRewards.map((reward) => (
                <Card key={reward.id} className="overflow-hidden">
                   <div className="h-48 bg-gray-100 relative">
                     {reward.image ? (
                        <img src={reward.image} alt={reward.title} className="w-full h-full object-cover" />
                     ) : (
                        <div className="w-full h-full flex items-center justify-center text-gray-400">No Image</div>
                     )}
                   </div>
                   <CardContent className="p-4 space-y-2">
                      <div className="flex justify-between items-start">
                         <h3 className="font-bold text-lg">{reward.title}</h3>
                         <span className="bg-indigo-100 text-indigo-700 text-xs px-2 py-1 rounded-full font-bold">
                            {reward.pointsRequired} Pts
                         </span>
                      </div>
                      <p className="text-sm text-gray-600 line-clamp-2">{reward.description}</p>
                      <div className="pt-2 flex justify-between items-center text-sm text-gray-500">
                         <span>Qty: {reward.quantity}</span>
                         <span>{format(new Date(reward.createdAt), 'MMM d, yyyy')}</span>
                      </div>
                   </CardContent>
                </Card>
              ))}
           </div>
        </TabsContent>

        {/* REDEMPTIONS TAB */}
        <TabsContent value="redemptions" className="mt-6 space-y-6">
          <div className="flex justify-between items-center">
             <h2 className="text-xl font-semibold">Redemption History</h2>
           </div>

           <Card>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Business</TableHead>
                    <TableHead>Reward</TableHead>
                    <TableHead>Points</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {mockGlobalRedemptions.map((redemption) => (
                    <TableRow key={redemption.id}>
                      <TableCell>{format(new Date(redemption.redeemedAt), 'MMM d, yyyy HH:mm')}</TableCell>
                      <TableCell className="font-medium">{redemption.businessName}</TableCell>
                      <TableCell>{redemption.rewardTitle}</TableCell>
                      <TableCell>{redemption.pointsRedeemed}</TableCell>
                      <TableCell>
                        <Badge variant={redemption.status === 'completed' ? 'default' : 'secondary'}>
                          {redemption.status}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
           </Card>
        </TabsContent>

      </Tabs>

      {/* Award Points Modal */}
      <AwardPointsModal
        isOpen={isAwardModalOpen}
        onClose={() => setIsAwardModalOpen(false)}
        campaigns={matchingCampaigns}
      />

      {/* Create Reward Modal */}
      <CreateMatchingRewardModal
        isOpen={isCreateRewardModalOpen}
        onClose={() => setIsCreateRewardModalOpen(false)}
        onSuccess={() => {}}
      />
    </div>
  );
}
