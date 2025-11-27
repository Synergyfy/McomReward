'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import SelectableRewardCard from './SelectableRewardCard';
import { RewardResponse } from '@/services/rewards/types';
import { useGetBusinessRewards } from '@/services/business-reward/hooks';
import { useInView } from 'react-intersection-observer';
import { Loader2 } from 'lucide-react';

interface Step3RewardProps {
  rewardId: string;
  setRewardId: (id: string, reward: RewardResponse) => void;
  error?: string;
}

export default function Step3Reward({ rewardId, setRewardId, error }: Step3RewardProps) {
  const [page, setPage] = useState(1);
  const [allRewards, setAllRewards] = useState<RewardResponse[]>([]);
  const { ref, inView } = useInView();
  
  const { data: rewardsData, isLoading: isLoadingRewards, isFetching } = useGetBusinessRewards(page, 10);

  // Append new rewards when data is fetched
  useEffect(() => {
    if (rewardsData?.data) {
      // Map BusinessReward to RewardResponse
      const newRewards: RewardResponse[] = rewardsData.data.map((businessReward) => ({
        ...businessReward.reward,
        // Override with business specific data if needed, or keep original reward data
        // For now using the nested reward object which matches RewardResponse structure mostly
        // Adjust properties if needed based on BusinessReward structure vs RewardResponse
        quantity: businessReward.quantity ?? businessReward.reward.quantity,
        pointsRequired: businessReward.pointRequired,
      }));

      setAllRewards((prev) => {
        // Filter out duplicates just in case
        const existingIds = new Set(prev.map(r => r.id));
        const uniqueNewRewards = newRewards.filter(r => !existingIds.has(r.id));
        return [...prev, ...uniqueNewRewards];
      });
    }
  }, [rewardsData]);

  // Load more when scrolling to bottom
  useEffect(() => {
    if (inView && rewardsData && page < (rewardsData.totalPages || 1) && !isFetching) {
      setPage((prev) => prev + 1);
    }
  }, [inView, rewardsData, isFetching, page]);


  return (
    <div>
      <h2 className="text-xl font-bold mb-5">Select Reward</h2>
      <TooltipProvider>
        <Tooltip delayDuration={0}>
          <TooltipTrigger asChild>
            <p className="text-sm text-muted-foreground mb-4">Choose a reward to associate with this campaign.</p>
          </TooltipTrigger>
          <TooltipContent>
            <p>Choose a reward to associate with this campaign.</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>

      {isLoadingRewards && page === 1 ? (
        <div className="flex justify-center items-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-gray-500" />
        </div>
      ) : allRewards && allRewards.length > 0 ? (
        <div className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {allRewards.map((reward) => (
              <SelectableRewardCard
                key={reward.id}
                reward={reward}
                isSelected={reward.id === rewardId}
                onSelect={(selectedReward) => setRewardId(selectedReward.id, selectedReward)}
              />
            ))}
          </div>
          
          {/* Intersection observer target for infinite scroll */}
          {rewardsData && page < (rewardsData.totalPages || 1) && (
             <div ref={ref} className="flex justify-center py-4">
               {isFetching && <Loader2 className="h-6 w-6 animate-spin text-gray-400" />}
             </div>
          )}
        </div>
      ) : (
        <div className="text-center py-12 border-2 border-dashed border-gray-200 rounded-lg">
          <p className="text-muted-foreground">No rewards available.</p>
          <p className="text-sm text-gray-400 mt-1">Add rewards in the Rewards Dashboard first.</p>
        </div>
      )}
      
      {error && !rewardId && <p className="text-red-500 text-sm mt-4">Reward selection is required.</p>}
    </div>
  );
}
