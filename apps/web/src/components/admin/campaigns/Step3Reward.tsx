'use client';

import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import SelectableRewardCard from './SelectableRewardCard';
import { RewardResponse } from '@/services/rewards/types';
import { useGetRewards } from '@/services/rewards/hook';

interface Step3RewardProps {
  rewardId: string;
  setRewardId: (id: string, reward: RewardResponse) => void;
  error?: string;
}

export default function Step3Reward({ rewardId, setRewardId, error }: Step3RewardProps) {
  const { data: rewardsData, isLoading: isLoadingRewards } = useGetRewards(1, 100);
  const rewards = rewardsData?.data ?? [];

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

      {isLoadingRewards ? (
        <p>Loading rewards...</p>
      ) : rewards.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {rewards.map((reward) => (
            <SelectableRewardCard
              key={reward.id}
              reward={reward}
              isSelected={reward.id === rewardId}
              onSelect={(selectedReward) => setRewardId(selectedReward.id, selectedReward)}
            />
          ))}
        </div>
      ) : (
        <p className="text-center text-muted-foreground">No rewards available. Please create some rewards first.</p>
      )}
      {error && !rewardId && <p className="text-red-500 text-sm mt-4">Reward selection is required.</p>}
    </div>
  );
}