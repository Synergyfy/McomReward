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
} from '@/services/business-reward/hooks';
import { BusinessReward, Reward, PaginationMeta } from '@/services/business-reward/types';
import LoadingSpinner from '@/components/ui/Loading';
import ClaimRewardModal from '@/components/dashboard/rewards/ClaimRewardModal';
import EditClaimedRewardModal from '@/components/dashboard/rewards/EditClaimedRewardModal';
import UpgradePlanModal from '@/components/dashboard/rewards/UpgradePlanModal';
import CreateRewardWizardModal from '@/components/dashboard/rewards/CreateRewardWizardModal';
import TierLimitModal from '@/components/dashboard/campaigns/TierLimitModal';
import { ChevronLeft, ChevronRight, MoreHorizontal, Edit } from 'lucide-react';
import { toast } from 'sonner';
import { AxiosError } from 'axios';
import { useGuide } from '@/context/GuideContext';

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
  const [isEditClaimedModalOpen, setIsEditClaimedModalOpen] = useState(false);
  const [isUpgradeModalOpen, setIsUpgradeModalOpen] = useState(false);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<Reward | null>(null);
  const [editingReward, setEditingReward] = useState<Reward | null>(null);
  const [isTierLimitModalOpen, setIsTierLimitModalOpen] = useState(false);
  const [tierLimitMessage, setTierLimitMessage] = useState('');

  // Pagination state
  const [businessRewardsPage, setBusinessRewardsPage] = useState(1);
  const [allRewardsPage, setAllRewardsPage] = useState(1);
  const limit = 9; // Grid friendly limit

  const {
    data: businessRewardsData,
    isLoading: isLoadingBusinessRewards,
    isError: isErrorBusinessRewards,
  } = useGetBusinessRewards(businessRewardsPage, limit);

  const {
    data: allRewardsData,
    isLoading: isLoadingAllRewards,
    isError: isErrorAllRewards,
  } = useGetAllRewards(allRewardsPage, limit);

  const { mutate: updateBusinessReward } = useUpdateBusinessReward();
  const [editingBusinessRewardId, setEditingBusinessRewardId] = useState<string | null>(null);
  const { startGuide } = useGuide();

  const handleOpenCreateModal = useCallback((reward: Reward | null = null) => {
    setEditingReward(reward);
    setIsCreateModalOpen(true);
    if (!reward) {
        startGuide('BUSINESS_REWARD');
    }
  }, [startGuide]);

  const handleOpenClaimModal = useCallback(() => {
    setIsClaimModalOpen(true);
  }, []);

  const handleSelectReward = useCallback((reward: Reward) => {
    setSelectedTemplate(reward);
    setIsClaimModalOpen(false);
    setIsEditClaimedModalOpen(true);
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

  const handleSaveReward = useCallback((rewardData: Reward) => {
    if (editingBusinessRewardId) {
      updateBusinessReward({
        rewardId: editingBusinessRewardId,
        payload: {
          title: rewardData.title,
          description: rewardData.description,
          point_required: rewardData.pointsRequired,
          value: rewardData.value,
          image: rewardData.image,
          quantity: rewardData.quantity,
          disabled: rewardData.disabled,
        },
      }, {
        onSuccess: () => {
          toast.success('Reward updated successfully');
          setIsCreateModalOpen(false);
          setEditingBusinessRewardId(null);
        },
        onError: (error: Error) => {
          const axiosError = error as AxiosError<{ message: string }>;
          const errorMessage = axiosError?.response?.data?.message || 'Failed to update reward';
          if (errorMessage === 'Your tier does not allow updating rewards.') {
            setTierLimitMessage(errorMessage);
            setIsTierLimitModalOpen(true);
            setIsCreateModalOpen(false); // Close the edit modal so the user sees the error clearly
          } else {
            toast.error(errorMessage);
          }
        }
      });
    } else {
      // This is a mock implementation for create.
      // In a real application, you would handle the save logic here.
      console.log('Saving reward:', rewardData);
      setIsCreateModalOpen(false);
      setIsEditClaimedModalOpen(false);
    }
  }, [editingBusinessRewardId, updateBusinessReward]);

  const handleEditBusinessReward = useCallback((businessReward: BusinessReward) => {
    setEditingBusinessRewardId(businessReward.id);
    const mergedReward: Reward = {
      ...businessReward.reward,
      title: businessReward.title,
      description: businessReward.description,
      image: businessReward.image,
      value: businessReward.value,
      disabled: businessReward.disabled,
      pointsRequired: businessReward.pointRequired,
      quantity: businessReward.quantity || 0,
    };
    handleOpenCreateModal(mergedReward);
  }, [handleOpenCreateModal]);

  if (isLoadingBusinessRewards || isLoadingAllRewards) {
    return <LoadingSpinner />;
  }

  if (isErrorBusinessRewards || isErrorAllRewards) {
    return <div>Error fetching rewards</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              All Rewards
            </h1>
            <p className="text-gray-600">
              Browse all available rewards and add them to your business.
            </p>
          </div>
          <Button onClick={handleOpenClaimModal}> Add Reward</Button>
        </div>

        {allRewardsData?.data.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500 text-lg">No rewards found.</p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {allRewardsData?.data.map((reward: Reward) => (
                <Card
                  key={reward.id}
                  className="flex flex-col hover:shadow-lg transition-shadow duration-200"
                >
                  <CardHeader className="pb-4">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="relative w-12 h-12 rounded-lg overflow-hidden bg-gray-200">
                          {reward.image && (
                            <Image
                              src={reward.image}
                              alt={reward.title}
                              layout="fill"
                              objectFit="cover"
                            />
                          )}
                        </div>
                        <div>
                          <CardTitle className="text-lg">{reward.title}</CardTitle>
                          <Badge
                            variant={!reward.disabled ? 'default' : 'secondary'}
                          >
                            {!reward.disabled ? 'Active' : 'Expired'}
                          </Badge>
                        </div>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="flex-grow">
                    <p className="text-sm text-gray-600 mb-3">
                      {reward.description}
                    </p>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="font-medium">Value:</span>
                        <span>£{reward.value}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="font-medium">Points:</span>
                        <span>{reward.pointsRequired}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
            {allRewardsData && (
              <Pagination
                currentPage={allRewardsPage}
                totalPages={allRewardsData.totalPages || 1}
                totalItems={allRewardsData.total || 0}
                limit={limit}
                onPageChange={setAllRewardsPage}
              />
            )}
          </>
        )}

        <div className="mt-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            My Added Rewards
          </h2>
          <p className="text-gray-600 mb-8">
            These are the rewards you have added to your business.
          </p>

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
                    className="flex flex-col hover:shadow-lg transition-shadow duration-200"
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

                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleEditBusinessReward(businessReward)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                      </div>
                    </CardHeader>
                    <CardContent className="flex-grow">
                      <p className="text-sm text-gray-600 mb-3">
                        {businessReward.description}
                      </p>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="font-medium">Value:</span>
                          <span>£{businessReward.value}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="font-medium">Points:</span>
                          <span>
                            {businessReward.pointRequired}
                          </span>
                        </div>
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
        />

        <EditClaimedRewardModal
          isOpen={isEditClaimedModalOpen}
          onClose={() => setIsEditClaimedModalOpen(false)}
          rewardTemplate={selectedTemplate}
          onSave={handleSaveReward}
          userPlan={currentUser.plan as 'starter' | 'co-branded' | 'white-label'}
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
      </div>
    </div >
  );
}
