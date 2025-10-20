'use client';

import { useGetAllBusinessRewards } from '@/services/rewards/hook';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface Step3RewardProps {
  rewardId: string;
  setRewardId: (rewardId: string) => void;
}

export default function Step3Reward({ rewardId, setRewardId }: Step3RewardProps) {
  const { data: rewardsData, isLoading: isLoadingRewards } = useGetAllBusinessRewards();

  return (
    <div>
      <h2 className="text-xl font-bold mb-5">Select Reward</h2>
      {isLoadingRewards ? (
        <p>Loading rewards...</p>
      ) : (
        <Select onValueChange={setRewardId} value={rewardId}>
          <SelectTrigger className="w-[280px]">
            <SelectValue placeholder="Select a reward" />
          </SelectTrigger>
          <SelectContent>
            {rewardsData?.rewards && rewardsData.rewards.map((reward) => (
              <SelectItem key={reward.id} value={reward.id}>
                {reward.title}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      )}
    </div>
  );
}
