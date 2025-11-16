'use client';

import React, { useState, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import Image from 'next/image';
import {
  useGetBusinessRewards,
  useGetAllRewards,
} from '@/services/business-reward/hooks';
import { BusinessReward, Reward } from '@/services/business-reward/types';
import LoadingSpinner from '@/components/ui/Loading';
import ClaimRewardModal from '@/components/dashboard/rewards/ClaimRewardModal';
import EditClaimedRewardModal from '@/components/dashboard/rewards/EditClaimedRewardModal';
import UpgradePlanModal from '@/components/dashboard/rewards/UpgradePlanModal';
import CreateRewardWizardModal from '@/components/dashboard/rewards/CreateRewardWizardModal';

const currentUser = {
  plan: 'starter', // 'starter', 'co-branded', 'white-label'
};

export default function BusinessRewardsPage() {
  const [isClaimModalOpen, setIsClaimModalOpen] = useState(false);
  const [isEditClaimedModalOpen, setIsEditClaimedModalOpen] = useState(false);
  const [isUpgradeModalOpen, setIsUpgradeModalOpen] = useState(false);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<Reward | null>(null);
  const [editingReward, setEditingReward] = useState<Reward | null>(null);

  const {
    data: businessRewardsData,
    isLoading: isLoadingBusinessRewards,
    isError: isErrorBusinessRewards,
  } = useGetBusinessRewards(1, 10);

  const {
    data: allRewardsData,
    isLoading: isLoadingAllRewards,
    isError: isErrorAllRewards,
  } = useGetAllRewards(1, 10);

  const handleOpenCreateModal = useCallback((reward: Reward | null = null) => {
    setEditingReward(reward);
    setIsCreateModalOpen(true);
  }, []);

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
      handleOpenCreateModal();
    } else {
      setIsUpgradeModalOpen(true);
    }
  }, [handleOpenCreateModal]);

  const handleSaveReward = useCallback((rewardData: Reward) => {
    // This is a mock implementation.
    // In a real application, you would handle the save logic here.
    console.log('Saving reward:', rewardData);
    setIsCreateModalOpen(false);
    setIsEditClaimedModalOpen(false);
  }, []);

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
                          {businessReward.reward.image && (
                            <Image
                              src={businessReward.reward.image}
                              alt={businessReward.reward.title}
                              layout="fill"
                              objectFit="cover"
                            />
                          )}
                        </div>
                        <div>
                          <CardTitle className="text-lg">
                            {businessReward.reward.title}
                          </CardTitle>
                          <Badge
                            variant={
                              !businessReward.reward.disabled
                                ? 'default'
                                : 'secondary'
                            }
                          >
                            {!businessReward.reward.disabled
                              ? 'Active'
                              : 'Expired'}
                          </Badge>
                        </div>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="flex-grow">
                    <p className="text-sm text-gray-600 mb-3">
                      {businessReward.reward.description}
                    </p>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="font-medium">Value:</span>
                        <span>£{businessReward.reward.value}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="font-medium">Points:</span>
                        <span>{businessReward.pointRequired || businessReward.reward.pointsRequired}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
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
      </div>
    </div>
  );
}
