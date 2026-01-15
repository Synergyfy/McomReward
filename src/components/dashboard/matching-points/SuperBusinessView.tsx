'use client';

import React, { useState } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Loader2, QrCode, Plus, Edit, Trash2, EyeOff, Eye } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { useGetMyCreatedCampaigns } from '@/services/campaigns/hook';
import { CampaignResponse, CampaignType, PublicCampaignResponse } from '@/services/campaigns/types';
import AwardPointsModal from '@/components/dashboard/matching-points/AwardPointsModal';
import { format } from 'date-fns';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useGetCreatedMatchingRewards, useDeleteMatchingReward, useSuspendMatchingReward } from '@/services/matching-points/hook';
import { mockGlobalRedemptions } from '@/lib/mock-data/matchingPointsRewards';
import CreateMatchingRewardModal from './CreateMatchingRewardModal';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { useQueryClient } from '@tanstack/react-query';
import { PaginatedRewardsResponse } from '@/services/matching-points/types';

export default function SuperBusinessView() {
  const queryClient = useQueryClient();
  const { data: campaignsData, isLoading: isCampaignsLoading } = useGetMyCreatedCampaigns();
  // Fetch Real Created Rewards
  const { data: rewardsData, isLoading: isRewardsLoading } = useGetCreatedMatchingRewards({ page: 1, limit: 100 });
  const { mutate: deleteReward } = useDeleteMatchingReward();
  const { mutate: suspendReward } = useSuspendMatchingReward();

  const [isAwardModalOpen, setIsAwardModalOpen] = useState(false);
  const [isCreateRewardModalOpen, setIsCreateRewardModalOpen] = useState(false);

  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [rewardToDelete, setRewardToDelete] = useState<string | null>(null);

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

  const handleDeleteClick = (id: string) => {
    setRewardToDelete(id);
    setDeleteDialogOpen(true);
  };

  const handleConfirmDelete = () => {
    if (rewardToDelete) {
        deleteReward(rewardToDelete, {
            onSuccess: () => {
                toast.success("Reward deleted successfully");
                setDeleteDialogOpen(false);
                setRewardToDelete(null);
            },
            onError: () => toast.error("Failed to delete reward")
        });
    }
  };

  const handleToggleStatus = (id: string) => {
     // Optimistic update for immediate feedback
     // We toggle the state in the cache immediately.
     queryClient.setQueryData(['matchingPointRewards', 'created', { page: 1, limit: 100 }], (oldData: PaginatedRewardsResponse | undefined) => {
         if (!oldData) return oldData;
         return {
             ...oldData,
             data: oldData.data.map(r => {
                 if (r.id === id) {
                     // Check both field names
                     const currentStatus = r.is_active ?? !r.isSuspended ?? true;
                     // Logic: if is_active is present use it, else use inverse of isSuspended.
                     // But we need to return consistent structure.
                     // Let's assume we flip 'is_active' if it exists, or 'isSuspended' if it exists.
                     return { ...r, is_active: !currentStatus, isSuspended: currentStatus };
                 }
                 return r;
             })
         };
     });

     suspendReward(id, {
         onSuccess: (data) => {
             toast.success("Reward status updated");
             // NOTE: We do NOT use the returned 'data' here to update the cache.
             queryClient.invalidateQueries({ queryKey: ['matchingPointRewards'] });
         },
         onError: () => {
             toast.error("Failed to update status");
             queryClient.invalidateQueries({ queryKey: ['matchingPointRewards'] });
         }
     });
  };

  // Helper to validate image URL
  const isValidImageUrl = (url: string) => {
    if (!url) return false;
    return url.match(/\.(jpeg|jpg|gif|png|webp)$/) != null || url.includes('images.unsplash.com') || url.includes('cloudinary.com');
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-800">Matching Points Dashboard</h1>
      </div>

      <Tabs defaultValue="rewards" className="w-full">
        <TabsList className="grid w-full grid-cols-2 lg:w-[400px]">
          <TabsTrigger value="rewards">Rewards</TabsTrigger>
          <TabsTrigger value="redemptions">Redemptions</TabsTrigger>
        </TabsList>

        {/* REWARDS TAB */}
        <TabsContent value="rewards" className="space-y-6 mt-6">
           <div className="flex justify-between items-center">
             <h2 className="text-xl font-semibold">Matching Point Rewards</h2>
             <Button onClick={() => setIsCreateRewardModalOpen(true)} className="gap-2">
               <Plus className="h-4 w-4" />
               Create Reward
             </Button>
           </div>

           {isRewardsLoading ? (
               <div className="flex justify-center py-12"><Loader2 className="animate-spin text-gray-400" /></div>
           ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {rewardsData?.data.map((reward) => {
                    // Robust mapping for display
                    const displayImage = reward.mainImage || reward.main_image || reward.image;
                    const points = reward.requiredPoints ?? reward.required_points ?? reward.pointsRequired ?? 0;
                    const isActive = reward.is_active ?? !reward.isSuspended ?? true;

                    return (
                        <Card key={reward.id} className="overflow-hidden group">
                        <div className="h-48 bg-gray-100 relative">
                            {displayImage ? (
                                <img
                                    src={displayImage}
                                    alt={reward.title}
                                    className="w-full h-full object-cover"
                                    onError={(e) => {
                                        (e.target as HTMLImageElement).src = 'https://via.placeholder.com/400x200?text=No+Image';
                                    }}
                                />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center text-gray-400">No Image</div>
                            )}
                            <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                <Button variant="secondary" size="icon" className="h-8 w-8" onClick={() => handleToggleStatus(reward.id)}>
                                    {isActive ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
                                </Button>
                                <Button variant="destructive" size="icon" className="h-8 w-8" onClick={() => handleDeleteClick(reward.id)}>
                                    <Trash2 className="h-4 w-4" />
                                </Button>
                            </div>
                        </div>
                        <CardContent className="p-4 space-y-2">
                            <div className="flex justify-between items-start">
                                <h3 className="font-bold text-lg">{reward.title}</h3>
                                <span className="bg-indigo-100 text-indigo-700 text-xs px-2 py-1 rounded-full font-bold">
                                    {points} Pts
                                </span>
                            </div>
                            <p className="text-sm text-gray-600 line-clamp-2">{reward.shortDescription || reward.short_description}</p>
                            <div className="pt-2 flex justify-between items-center text-sm text-gray-500">
                                <span>Qty: {reward.quantity}</span>
                                <Badge variant={isActive ? 'default' : 'secondary'}>
                                    {isActive ? 'Active' : 'Suspended'}
                                </Badge>
                            </div>
                        </CardContent>
                        </Card>
                    );
                })}
                {rewardsData?.data.length === 0 && (
                    <div className="col-span-full text-center py-12 bg-gray-50 rounded-lg">
                        <p className="text-gray-500">No rewards created yet.</p>
                    </div>
                )}
            </div>
           )}
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
      />

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
            <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
                This action cannot be undone. This will permanently delete the reward.
            </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction className="bg-red-600 hover:bg-red-700" onClick={handleConfirmDelete}>
                Delete
            </AlertDialogAction>
            </AlertDialogFooter>
        </AlertDialogContent>
        </AlertDialog>
    </div>
  );
}
