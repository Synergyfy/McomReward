'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useGetRewards, useDeleteReward } from '@/services/rewards/hook';
import { RewardResponse } from '@/services/rewards/types';
import EditRewardDialog from '@/components/admin/rewards/EditRewardDialog';
import CreateRewardDialog from '@/components/admin/rewards/CreateRewardDialog';
import { Plus } from 'lucide-react';
import RewardCard from '@/components/admin/rewards/RewardCard';

export default function RewardsPage() {
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
    const { data: rewardsData, isLoading: isLoadingRewards } = useGetRewards(page, limit);
    console.log('Rewards Data:', rewardsData);
  
  const { mutate: deleteReward } = useDeleteReward();
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [selectedReward, setSelectedReward] = useState<RewardResponse | null>(null);

  const handleEditClick = (reward: RewardResponse) => {
    setSelectedReward(reward);
    setIsEditDialogOpen(true);
  };

  const handleDeleteClick = (rewardId: string) => {
    deleteReward(rewardId, {
      onSuccess: () => {
        alert('Reward deleted successfully!');
      },
      onError: (error) => {
        alert(`Error deleting reward: ${error.message}`);
      },
    });
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Manage Rewards</h1>
        <p className="text-muted-foreground">Create, edit, and delete rewards for your platform.</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Rewards</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoadingRewards ? (
            <p>Loading rewards...</p>
          ) : (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {rewardsData?.data && rewardsData.data.map((reward) => (
                  <RewardCard
                    key={reward.id}
                    reward={reward}
                    onEditClick={handleEditClick}
                    onDeleteClick={() => handleDeleteClick(reward.id)}
                  />
                ))}
              </div>
              <div className="flex justify-center items-center mt-6 space-x-4 p-4 border-t">
                <Button
                  onClick={() => setPage(page - 1)}
                  disabled={page === 1}
                  variant="outline"
                >
                  Previous
                </Button>
                <span className="text-sm text-muted-foreground">
                  Page {rewardsData?.currentPage} of {rewardsData?.totalPages}
                </span>
                <Button
                  onClick={() => setPage(page + 1)}
                  disabled={!rewardsData || page === rewardsData.totalPages}
                  variant="outline"
                >
                  Next
                </Button>
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {selectedReward && (
        <EditRewardDialog
          reward={selectedReward}
          isOpen={isEditDialogOpen}
          onClose={() => setIsEditDialogOpen(false)}
        />
      )}

      <CreateRewardDialog isOpen={isCreateDialogOpen} onClose={() => setIsCreateDialogOpen(false)} />

      <Button
        onClick={() => setIsCreateDialogOpen(true)}
        className="fixed bottom-8 right-8 h-16 w-16 rounded-full shadow-lg"
      >
        <Plus className="h-8 w-8" />
      </Button>
    </div>
  );
}
