'use client';

import React, { useState, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import Image from 'next/image';
import {
  useGetBusinessRewards,
  useGetAllRewards,
  useUpdateBusinessReward,
  useCreateBusinessReward,
  useAddBusinessReward,
  useRemoveBusinessReward,
} from '@/services/business-reward/hooks';
import { useGetBusinessTierUsage } from '@/services/business/hook';
import { BusinessReward, Reward, PaginationMeta, CreateBusinessRewardDto, RewardStatus } from '@/services/business-reward/types';
import LoadingSpinner from '@/components/ui/Loading';
import UsageCard from '@/components/dashboard/shared/UsageCard';
import ClaimRewardModal from '@/components/dashboard/rewards/ClaimRewardModal';
import UpgradePlanModal from '@/components/dashboard/rewards/UpgradePlanModal';
import CreateRewardWizardModal from '@/components/dashboard/rewards/CreateRewardWizardModal';
import TierLimitModal from '@/components/dashboard/campaigns/TierLimitModal';
import { ChevronLeft, ChevronRight, MoreHorizontal, Edit, Trash2, MoreVertical } from 'lucide-react';
import { toast } from 'sonner';
import { AxiosError } from 'axios';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
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

const currentUser = {
  plan: 'white-label', // 'starter', 'co-branded', 'white-label'
};

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  limit: number;
  onPageChange: (page: number) => void;
}

const Pagination = ({
  currentPage,
  totalPages,
  totalItems,
  limit,
  onPageChange,
}: PaginationProps) => {
  const renderPaginationItems = () => {
    const items = [];
    const maxVisiblePages = 5;
    const ellipsis = <MoreHorizontal className="h-4 w-4" />;

    if (totalPages <= maxVisiblePages + 2) {
      for (let i = 1; i <= totalPages; i++) {
        items.push(
          <Button
            key={i}
            variant={currentPage === i ? 'default' : 'outline'}
            size="icon"
            className="w-8 h-8"
            onClick={() => onPageChange(i)}
          >
            {i}
          </Button>
        );
      }
    } else {
      items.push(
        <Button
          key={1}
          variant={currentPage === 1 ? 'default' : 'outline'}
          size="icon"
          className="w-8 h-8"
          onClick={() => onPageChange(1)}
        >
          1
        </Button>
      );

      if (currentPage > 3) {
        items.push(
          <div
            key="start-ellipsis"
            className="flex items-center justify-center w-8 h-8 text-muted-foreground"
          >
            {ellipsis}
          </div>
        );
      }

      const startPage = Math.max(2, currentPage - 1);
      const endPage = Math.min(totalPages - 1, currentPage + 1);

      for (let i = startPage; i <= endPage; i++) {
        items.push(
          <Button
            key={i}
            variant={currentPage === i ? 'default' : 'outline'}
            size="icon"
            className="w-8 h-8"
            onClick={() => onPageChange(i)}
          >
            {i}
          </Button>
        );
      }

      if (currentPage < totalPages - 2) {
        items.push(
          <div
            key="end-ellipsis"
            className="flex items-center justify-center w-8 h-8 text-muted-foreground"
          >
            {ellipsis}
          </div>
        );
      }

      items.push(
        <Button
          key={totalPages}
          variant={currentPage === totalPages ? 'default' : 'outline'}
          size="icon"
          className="w-8 h-8"
          onClick={() => onPageChange(totalPages)}
        >
          {totalPages}
        </Button>
      );
    }

    return items;
  };

  return (
    <div className="flex items-center justify-between mt-4 border-t pt-4">
      <div className="text-sm text-gray-500">
        Showing {(currentPage - 1) * limit + 1} to{' '}
        {Math.min(currentPage * limit, totalItems)} of {totalItems} entries
      </div>
      <div className="flex items-center space-x-2">
        <Button
          variant="outline"
          size="icon"
          className="w-8 h-8"
          onClick={() => onPageChange(Math.max(1, currentPage - 1))}
          disabled={currentPage === 1}
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>

        <div className="flex items-center space-x-1">
          {renderPaginationItems()}
        </div>

        <Button
          variant="outline"
          size="icon"
          className="w-8 h-8"
          onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}
          disabled={currentPage === totalPages}
        >
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
};

export default function BusinessRewardsPage() {
  const [isClaimModalOpen, setIsClaimModalOpen] = useState(false);
  const [isUpgradeModalOpen, setIsUpgradeModalOpen] = useState(false);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<Reward | null>(null);
  const [editingReward, setEditingReward] = useState<Reward | null>(null);
  const [isTierLimitModalOpen, setIsTierLimitModalOpen] = useState(false);
  const [tierLimitMessage, setTierLimitMessage] = useState('');
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [rewardToDelete, setRewardToDelete] = useState<BusinessReward | null>(null);

  // Pagination state
  const [businessRewardsPage, setBusinessRewardsPage] = useState(1);
  const limit = 9; // Grid friendly limit

  const {
    data: businessRewardsData,
    isLoading: isLoadingBusinessRewards,
    isError: isErrorBusinessRewards,
  } = useGetBusinessRewards(businessRewardsPage, limit);

  const { data: tierUsageData } = useGetBusinessTierUsage();

  const { mutate: updateBusinessReward } = useUpdateBusinessReward();
  const { mutateAsync: createBusinessReward } = useCreateBusinessReward();
  const { mutateAsync: addBusinessReward } = useAddBusinessReward();
  const { mutate: removeBusinessReward, isPending: isDeletingReward } = useRemoveBusinessReward();
  const [editingBusinessRewardId, setEditingBusinessRewardId] = useState<string | null>(null);

  const handleOpenCreateModal = useCallback((reward: Reward | null = null) => {
    setEditingReward(reward);
    setIsCreateModalOpen(true);
  }, []);

  const handleOpenClaimModal = useCallback(() => {
    setIsClaimModalOpen(true);
  }, []);

  const handleSelectReward = useCallback((reward: Reward) => {
    setSelectedTemplate(reward);
    setEditingReward(reward);
    setEditingBusinessRewardId(null);
    setIsClaimModalOpen(false);
    setIsCreateModalOpen(true);
  }, []);

  const handleCreateFromScratch = useCallback(() => {
    setIsClaimModalOpen(false);
    if (currentUser.plan === 'white-label') {
      setEditingBusinessRewardId(null);
      handleOpenCreateModal();
    } else {
      setIsUpgradeModalOpen(true);
    }
  }, [handleOpenCreateModal]);

  const handleSaveReward = useCallback(async (rewardData: Reward): Promise<void> => {
    return new Promise((resolve, reject) => {
      if (editingBusinessRewardId) {
        updateBusinessReward({
          rewardId: editingBusinessRewardId,
          payload: {
            title: rewardData.title,
            description: rewardData.description,
            points_required: rewardData.pointsRequired,
            image: rewardData.image,
            gallery: rewardData.gallery,
            quantity: rewardData.quantity,
            reward_type: rewardData.rewardType,
            stamps_required: rewardData.stampsRequired,
            disabled: rewardData.disabled,
            is_mall_integrated: rewardData.is_mall_integrated,
            mall_reward_type: rewardData.mall_reward_type,
            mall_reward_value: rewardData.mall_reward_value,
          },
        }, {
          onSuccess: () => {
            toast.success('Reward updated successfully');
            setIsCreateModalOpen(false);
            setEditingBusinessRewardId(null);
            resolve();
          },
          onError: (error: Error) => {
            const axiosError = error as AxiosError<{ message: string }>;
            const errorMessage = axiosError?.response?.data?.message || 'Failed to update reward';

            if (errorMessage === 'Your tier does not allow updating rewards.') {
              setTierLimitMessage(errorMessage);
              setIsTierLimitModalOpen(true);
              setIsCreateModalOpen(false);
              resolve(); // Resolve because we handled it by closing the modal and showing another one
            } else if (errorMessage.includes("Points required cannot exceed the maximum points set by admin")) {
              setTierLimitMessage(errorMessage);
              setIsTierLimitModalOpen(true);
              // Do NOT close the edit modal here, so the user can fix it.
              // TierLimitModal needs a high Z-Index to show above the edit modal.
              reject(error); // Reject so the edit modal stops loading but stays open
            } else {
              toast.error(errorMessage);
              reject(error);
            }
          }
        });
      } else if (selectedTemplate && !editingBusinessRewardId) {
        // Add template flow
        const payload: CreateBusinessRewardDto = {
          title: rewardData.title,
          description: rewardData.description,
          points_required: rewardData.pointsRequired,
          image: rewardData.image,
          gallery: rewardData.gallery,
          quantity: rewardData.quantity,
          disabled: rewardData.disabled,
          reward_type: rewardData.rewardType || 'Voucher',
          stamps_required: rewardData.stampsRequired,
          status: RewardStatus.ACTIVE,
          is_mall_integrated: rewardData.is_mall_integrated,
          mall_reward_type: rewardData.mall_reward_type,
          mall_reward_value: rewardData.mall_reward_value,
        };

        addBusinessReward({ rewardId: selectedTemplate.id, payload }).then(() => {
          toast.success('Reward added successfully');
          setIsCreateModalOpen(false);
          setSelectedTemplate(null);
          resolve();
        }).catch((error) => {
          console.error("Error adding reward:", error);
          const axiosError = error as AxiosError<{ message: string }>;
          const errorMessage = axiosError?.response?.data?.message || 'Failed to add reward';

          if (errorMessage.includes("Points required cannot exceed the maximum points set by admin")) {
            setTierLimitMessage(errorMessage);
            setIsTierLimitModalOpen(true);
            // Do NOT close the edit modal
          } else {
            toast.error(errorMessage);
          }
          reject(error);
        });

      } else {
        // Create new reward flow
        const payload: CreateBusinessRewardDto = {
          title: rewardData.title,
          description: rewardData.description,
          points_required: rewardData.pointsRequired,
          image: rewardData.image,
          gallery: rewardData.gallery,
          quantity: rewardData.quantity,
          disabled: rewardData.disabled,
          reward_type: rewardData.rewardType || 'Voucher',
          stamps_required: rewardData.stampsRequired,
          status: RewardStatus.ACTIVE,
          is_mall_integrated: rewardData.is_mall_integrated,
          mall_reward_type: rewardData.mall_reward_type,
          mall_reward_value: rewardData.mall_reward_value,
        };

        createBusinessReward(payload).then(() => {
          toast.success('Reward created successfully');
          setIsCreateModalOpen(false);
          resolve();
        }).catch((error) => {
          console.error("Error creating reward:", error);
          const axiosError = error as AxiosError<{ message: string }>;
          const errorMessage = axiosError?.response?.data?.message || 'Failed to create reward';

          if (errorMessage.includes("Points required cannot exceed the maximum points set by admin")) {
            setTierLimitMessage(errorMessage);
            setIsTierLimitModalOpen(true);
            // Do NOT close the edit modal
          } else {
            toast.error(errorMessage);
          }
          reject(error);
        });
      }
    });
  }, [editingBusinessRewardId, updateBusinessReward, createBusinessReward, addBusinessReward, selectedTemplate]);

  const handleEditBusinessReward = useCallback((businessReward: BusinessReward) => {
    setEditingBusinessRewardId(businessReward.id);
    const mergedReward: Reward = {
      ...businessReward.reward,
      title: businessReward.title,
      description: businessReward.description,
      image: businessReward.image,
      gallery: businessReward.gallery,
      value: businessReward.value,
      disabled: businessReward.disabled,
      pointsRequired: businessReward.points_required ?? (businessReward as any).pointsRequired ?? businessReward.pointRequired,
      stampsRequired: businessReward.stamps_required ?? businessReward.stampsRequired,
      rewardType: businessReward.rewardType,
      quantity: businessReward.quantity || 0,
    };
    handleOpenCreateModal(mergedReward);
  }, [handleOpenCreateModal]);

  const handleDeleteClick = useCallback((businessReward: BusinessReward) => {
    setRewardToDelete(businessReward);
    setDeleteDialogOpen(true);
  }, []);

  const handleConfirmDelete = useCallback(() => {
    if (!rewardToDelete) return;

    removeBusinessReward(rewardToDelete.id, {
      onSuccess: () => {
        toast.success('Reward deleted successfully');
        setDeleteDialogOpen(false);
        setRewardToDelete(null);
      },
      onError: (error: Error) => {
        const axiosError = error as AxiosError<{ message: string }>;
        const errorMessage = axiosError?.response?.data?.message || 'Failed to delete reward';
        toast.error(errorMessage);
      },
    });
  }, [rewardToDelete, removeBusinessReward]);

  if (isLoadingBusinessRewards) {
    return <LoadingSpinner />;
  }

  if (isErrorBusinessRewards) {
    return <div>Error fetching rewards</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mt-12">
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-3xl font-bold text-gray-900 mb-2">
              My Added Rewards
            </h2>
            <Button onClick={handleOpenClaimModal}> Add Reward</Button>
          </div>
          <p className="text-gray-600 mb-8">
            These are the rewards you have added to your business.
          </p>

          {tierUsageData && (
            <div className="mb-8 max-w-md">
              <UsageCard
                title="Rewards Usage"
                usage={tierUsageData.features.rewards}
              />
            </div>
          )}

          {businessRewardsData?.data.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-500 text-lg">
                No rewards found. Add a reward to get started.
              </p>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {businessRewardsData?.data.map((businessReward: BusinessReward) => (
                  <Card
                    key={businessReward.id}
                    className="flex flex-col hover:shadow-lg transition-shadow duration-200 cursor-pointer"
                    onClick={() => handleEditBusinessReward(businessReward)}
                  >
                    <CardHeader className="pb-4">
                      <div className="flex items-start justify-between">
                        <div className="flex items-center space-x-3">
                          <div className="relative w-12 h-12 rounded-lg overflow-hidden bg-gray-200">
                            {businessReward.image && (
                              <Image
                                src={businessReward.image}
                                alt={businessReward.title}
                                layout="fill"
                                objectFit="cover"
                              />
                            )}
                          </div>
                          <div>
                            <CardTitle className="text-lg">
                              {businessReward.title}
                            </CardTitle>
                            <Badge
                              variant={
                                !businessReward.disabled
                                  ? 'default'
                                  : 'secondary'
                              }
                            >
                              {!businessReward.disabled
                                ? 'Active'
                                : 'Expired'}
                            </Badge>
                          </div>
                        </div>

                        <DropdownMenu>
                          <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8"
                            >
                              <MoreVertical className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem
                              onClick={() => handleEditBusinessReward(businessReward)}
                            >
                              <Edit className="h-4 w-4 mr-2" />
                              Edit
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => handleDeleteClick(businessReward)}
                              className="text-red-600 focus:text-red-600"
                            >
                              <Trash2 className="h-4 w-4 mr-2" />
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </CardHeader>
                    <CardContent className="flex-grow">
                      {businessReward.gallery && businessReward.gallery.length > 0 && (
                        <div className="mb-4">
                          <p className="text-xs text-gray-500 mb-2">Gallery:</p>
                          <div className="flex gap-2 overflow-x-auto pb-2">
                            {businessReward.gallery.map((img, index) => (
                              <div key={index} className="relative w-10 h-10 flex-shrink-0 rounded-md overflow-hidden bg-gray-100 border border-gray-200">
                                <Image
                                  src={img}
                                  alt={`Gallery ${index + 1}`}
                                  layout="fill"
                                  objectFit="cover"
                                />
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                      <p className="text-sm text-gray-600 mb-3">
                        {businessReward.description}
                      </p>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="font-medium">Points:</span>
                          <span>
                            {businessReward.points_required ?? (businessReward as any).pointsRequired ?? businessReward.pointRequired ?? 0}
                          </span>
                        </div>
                        {(businessReward.stamps_required || businessReward.stampsRequired) && (
                          <div className="flex justify-between">
                            <span className="font-medium">Stamps:</span>
                            <span>
                              {businessReward.stamps_required ?? businessReward.stampsRequired}
                            </span>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
              {businessRewardsData && (
                <Pagination
                  currentPage={businessRewardsPage}
                  totalPages={businessRewardsData.totalPages || 1}
                  totalItems={businessRewardsData.total || 0}
                  limit={limit}
                  onPageChange={setBusinessRewardsPage}
                />
              )}
            </>
          )}
        </div>

        {/* Modals */}
        <ClaimRewardModal
          isOpen={isClaimModalOpen}
          onClose={() => setIsClaimModalOpen(false)}
          onCreateFromScratch={handleCreateFromScratch}
          onSelectTemplate={handleSelectReward}
        />

        <UpgradePlanModal
          isOpen={isUpgradeModalOpen}
          onClose={() => setIsUpgradeModalOpen(false)}
        />

        <CreateRewardWizardModal
          isOpen={isCreateModalOpen}
          onClose={() => setIsCreateModalOpen(false)}
          reward={editingReward}
          onSave={handleSaveReward}
        />

        <TierLimitModal
          isOpen={isTierLimitModalOpen}
          onClose={() => setIsTierLimitModalOpen(false)}
          message={tierLimitMessage}
        />

        <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Delete Reward</AlertDialogTitle>
              <AlertDialogDescription>
                Are you sure you want to delete &quot;{rewardToDelete?.title}&quot;? This action cannot be undone.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel disabled={isDeletingReward}>Cancel</AlertDialogCancel>
              <AlertDialogAction
                onClick={handleConfirmDelete}
                disabled={isDeletingReward}
                className="bg-red-600 hover:bg-red-700"
              >
                {isDeletingReward ? 'Deleting...' : 'Delete'}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </div >
  );
}
