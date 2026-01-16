'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Loader2, QrCode, Plus, Edit, Trash2, EyeOff, Eye, Calendar, Users, Image as ImageIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { format } from 'date-fns';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useGetCreatedMatchingRewards, useDeleteMatchingReward, useSuspendMatchingReward, useGetRedeemedMatchingRewards } from '@/services/matching-points/hook';
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
import ImagePreviewModal from './ImagePreviewModal';

export default function SuperBusinessView() {
  const queryClient = useQueryClient();

  // Fetch Real Created Rewards
  const { data: rewardsData, isLoading: isRewardsLoading } = useGetCreatedMatchingRewards({ page: 1, limit: 100 });

  // Fetch Real Redemptions
  const { data: redemptionsData, isLoading: isRedemptionsLoading } = useGetRedeemedMatchingRewards({ page: 1, limit: 100 });

  const { mutate: deleteReward } = useDeleteMatchingReward();
  const { mutate: suspendReward } = useSuspendMatchingReward();

  const [isCreateRewardModalOpen, setIsCreateRewardModalOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [rewardToDelete, setRewardToDelete] = useState<string | null>(null);
  const [toggleDialogOpen, setToggleDialogOpen] = useState(false);
  const [rewardToToggle, setRewardToToggle] = useState<{ id: string; isActive: boolean } | null>(null);
  const [previewImage, setPreviewImage] = useState<string | null>(null);

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

  const handleToggleClick = (id: string, isActive: boolean) => {
      setRewardToToggle({ id, isActive });
      setToggleDialogOpen(true);
  };

  const handleConfirmToggle = () => {
     if (!rewardToToggle) return;
     const { id } = rewardToToggle;

     // Optimistic update
     queryClient.setQueryData(['matchingPointRewards', 'created', { page: 1, limit: 100 }], (oldData: PaginatedRewardsResponse | undefined) => {
         if (!oldData) return oldData;
         return {
             ...oldData,
             data: oldData.data.map(r => {
                 if (r.id === id) {
                     const currentStatus = r.is_active ?? (r.isSuspended === undefined ? true : !r.isSuspended);
                     return { ...r, is_active: !currentStatus, isSuspended: !currentStatus };
                 }
                 return r;
             })
         };
     });

     suspendReward(id, {
         onSuccess: () => {
             toast.success("Reward status updated");
             queryClient.invalidateQueries({ queryKey: ['matchingPointRewards'] });
         },
         onError: () => {
             toast.error("Failed to update status");
             queryClient.invalidateQueries({ queryKey: ['matchingPointRewards'] });
         },
         onSettled: () => {
             setToggleDialogOpen(false);
             setRewardToToggle(null);
         }
     });
  };

  const handleImageClick = (e: React.MouseEvent, imgUrl: string) => {
    e.stopPropagation();
    setPreviewImage(imgUrl);
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
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                {rewardsData?.data.map((reward) => {
                    const displayImage = reward.mainImage || reward.main_image || reward.image;
                    const points = reward.requiredPoints ?? reward.required_points ?? reward.pointsRequired ?? 0;
                    const isActive = reward.is_active ?? !reward.isSuspended;
                    const audience = reward.targetAudience ?? reward.target_audience ?? 'Unknown';
                    const gallery = reward.galleryImages ?? reward.gallery_images ?? [];

                    const startDate = reward.startDatetime || reward.start_datetime;
                    const endDate = reward.endDatetime || reward.end_datetime;

                    return (
                        <Card key={reward.id} className="overflow-hidden group flex flex-col h-full border hover:border-indigo-300 transition-colors">
                        <div className="h-56 bg-gray-100 relative shrink-0">
                            {displayImage ? (
                                <img
                                    src={displayImage}
                                    alt={reward.title}
                                    className="w-full h-full object-cover cursor-pointer hover:opacity-90 transition-opacity"
                                    onClick={(e) => handleImageClick(e, displayImage)}
                                    onError={(e) => {
                                        (e.target as HTMLImageElement).src = 'https://via.placeholder.com/400x200?text=No+Image';
                                    }}
                                />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center text-gray-400">No Image</div>
                            )}
                            <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity bg-white/50 p-1 rounded-md backdrop-blur-sm z-10">
                                <Button variant="secondary" size="icon" className="h-8 w-8 hover:bg-white" onClick={() => handleToggleClick(reward.id, isActive)}>
                                    {isActive ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
                                </Button>
                                <Button variant="destructive" size="icon" className="h-8 w-8 hover:bg-red-100 hover:text-red-700" onClick={() => handleDeleteClick(reward.id)}>
                                    <Trash2 className="h-4 w-4" />
                                </Button>
                            </div>
                            <div className="absolute bottom-2 left-2 z-10">
                                <Badge variant={isActive ? 'default' : 'destructive'} className="shadow-sm">
                                    {isActive ? 'Active' : 'Suspended'}
                                </Badge>
                            </div>
                            {gallery.length > 0 && (
                                <div className="absolute bottom-2 right-2 z-10">
                                    <Badge variant="secondary" className="bg-black/50 text-white border-none gap-1 px-1.5 h-5 text-[10px]">
                                        <ImageIcon className="h-3 w-3" /> +{gallery.length}
                                    </Badge>
                                </div>
                            )}
                        </div>
                        <CardContent className="p-5 space-y-4 flex-grow flex flex-col">
                            <div className="flex justify-between items-start gap-2">
                                <h3 className="font-bold text-xl leading-tight">{reward.title}</h3>
                                <span className="bg-indigo-100 text-indigo-700 text-sm px-2.5 py-1 rounded-full font-bold whitespace-nowrap">
                                    {points} Pts
                                </span>
                            </div>

                            <p className="text-sm text-gray-600 line-clamp-3 leading-relaxed mb-auto">
                                {reward.shortDescription || reward.short_description || reward.longDescription || reward.long_description}
                            </p>

                            {/* Gallery Thumbnails */}
                            {gallery.length > 0 && (
                                <div className="flex gap-2 overflow-hidden py-2 h-16 border-t border-gray-100 mt-2">
                                    {gallery.slice(0, 4).map((img, idx) => (
                                        <div
                                          key={idx}
                                          className="h-full aspect-square rounded overflow-hidden border border-gray-200 cursor-zoom-in hover:opacity-80 transition-opacity"
                                          onClick={(e) => handleImageClick(e, img)}
                                        >
                                            <img src={img} alt="gallery" className="h-full w-full object-cover" />
                                        </div>
                                    ))}
                                </div>
                            )}

                            <div className="grid grid-cols-2 gap-y-2 text-xs text-gray-500 pt-2 border-t mt-2">
                                <div className="flex items-center gap-1.5">
                                    <Calendar className="h-3.5 w-3.5" />
                                    <div className="flex flex-col">
                                        <span>Start: {startDate ? format(new Date(startDate), 'MMM d, yyyy') : 'N/A'}</span>
                                        <span>End: {endDate ? format(new Date(endDate), 'MMM d, yyyy') : 'N/A'}</span>
                                    </div>
                                </div>
                                <div className="flex items-center gap-1.5 justify-end text-right">
                                    <Users className="h-3.5 w-3.5" />
                                    <div className="flex flex-col">
                                        <span>Audience</span>
                                        <span className="font-medium text-gray-700">{audience}</span>
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                        <CardFooter className="bg-gray-50 px-5 py-3 text-xs text-gray-500 mt-auto">
                             <span>Qty: {reward.quantity}</span>
                        </CardFooter>
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
                  {isRedemptionsLoading ? (
                      <TableRow>
                          <TableCell colSpan={5} className="text-center py-8">
                              <Loader2 className="animate-spin h-6 w-6 mx-auto text-gray-400" />
                          </TableCell>
                      </TableRow>
                  ) : redemptionsData?.data.length === 0 ? (
                      <TableRow>
                          <TableCell colSpan={5} className="text-center py-8 text-gray-500">
                              No redemptions found.
                          </TableCell>
                      </TableRow>
                  ) : (
                    redemptionsData?.data.map((redemption) => (
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
                    ))
                  )}
                </TableBody>
              </Table>
           </Card>
        </TabsContent>

      </Tabs>

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

      {/* Toggle Status Confirmation Dialog */}
      <AlertDialog open={toggleDialogOpen} onOpenChange={setToggleDialogOpen}>
        <AlertDialogContent>
            <AlertDialogHeader>
            <AlertDialogTitle>
                {rewardToToggle?.isActive ? "Suspend Reward?" : "Activate Reward?"}
            </AlertDialogTitle>
            <AlertDialogDescription>
                {rewardToToggle?.isActive
                    ? "Are you sure you want to suspend this reward? It will be hidden from users."
                    : "Are you sure you want to activate this reward? It will be visible to users."}
            </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirmToggle}>
                Confirm
            </AlertDialogAction>
            </AlertDialogFooter>
        </AlertDialogContent>
        </AlertDialog>

        {/* Image Preview */}
        <ImagePreviewModal
            isOpen={!!previewImage}
            onClose={() => setPreviewImage(null)}
            imageUrl={previewImage || ''}
        />
    </div>
  );
}
