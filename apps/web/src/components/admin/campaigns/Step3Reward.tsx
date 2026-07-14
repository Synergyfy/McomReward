'use client';

import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import SelectableRewardCard from './SelectableRewardCard';
import { RewardResponse } from '@/services/rewards/types';

const mockRewards: RewardResponse[] = [
  {
    id: 'reward-1',
    title: 'Free Coffee',
    pointRequired: 100,
    value: 5,
    description: 'Get a free coffee of your choice.',
    image: 'https://res.cloudinary.com/dnejwzsgy/image/upload/v1700000000/coffee.jpg',
    quantity: 50,
    remainingQuantity: 50,
    createdAt: '2023-01-01T00:00:00Z',
    updatedAt: '2023-01-01T00:00:00Z',
    disabled: false,
    rewardType: 'voucher',
    type: 'voucher',
    status: 'active',
    expiry: '2025-12-31T00:00:00Z',
    badgeLevel: [] as string[],
  } as RewardResponse,
  {
    id: 'reward-2',
    title: '10% Off Next Purchase',
    pointRequired: 200,
    value: 10,
    description: 'Enjoy 10% off your entire next purchase.',
    image: 'https://res.cloudinary.com/dnejwzsgy/image/upload/v1700000000/discount.jpg',
    quantity: 100,
    remainingQuantity: 100,
    createdAt: '2023-01-01T00:00:00Z',
    updatedAt: '2023-01-01T00:00:00Z',
    disabled: false,
    rewardType: 'voucher',
    type: 'voucher',
    status: 'active',
    expiry: '2025-12-31T00:00:00Z',
    badgeLevel: [] as string[],
  } as RewardResponse,
  {
    id: 'reward-3',
    title: 'Free Dessert',
    pointRequired: 150,
    value: 7,
    description: 'Indulge in a complimentary dessert with your meal.',
    image: 'https://res.cloudinary.com/dnejwzsgy/image/upload/v1700000000/dessert.jpg',
    quantity: 30,
    remainingQuantity: 30,
    createdAt: '2023-01-01T00:00:00Z',
    updatedAt: '2023-01-01T00:00:00Z',
    disabled: false,
    rewardType: 'voucher',
    type: 'voucher',
    status: 'active',
    expiry: '2025-12-31T00:00:00Z',
    badgeLevel: [] as string[],
  } as RewardResponse,
];

interface Step3RewardProps {
  rewardId: string;
  setRewardId: (id: string, reward: RewardResponse) => void;
  error?: string;
}

export default function Step3Reward({ rewardId, setRewardId, error }: Step3RewardProps) {
  const isLoadingRewards = false; 

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
      ) : mockRewards && mockRewards.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {mockRewards.map((reward) => (
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