'use client';

import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { useGetBusinessRewards } from '@/services/business-reward/hooks';
import { BusinessReward } from '@/services/business-reward/types';
import { Checkbox } from '@/components/ui/checkbox';
import { ScrollArea } from '@/components/ui/scroll-area';
import { toast } from 'sonner';


interface SelectRewardModalProps {
  isOpen: boolean;
  onClose: () => void;
  onProceed: (selectedRewardIds: string[]) => void;
}

export default function SelectRewardModal({
  isOpen,
  onClose,
  onProceed,
}: SelectRewardModalProps) {
  const [selectedRewards, setSelectedRewards] = useState<string[]>([]);
  const { data: rewardsData, isLoading, error } = useGetBusinessRewards(1, 100);

  const handleToggleReward = (rewardId: string) => {
    setSelectedRewards(prev =>
      prev.includes(rewardId)
        ? prev.filter(id => id !== rewardId)
        : [...prev, rewardId]
    );
  };

  const handleProceed = () => {
    if (selectedRewards.length === 0) {
      toast.error('Please select at least one reward.');
      return;
    }
    onProceed(selectedRewards);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Select Rewards</DialogTitle>
          <DialogDescription>
            Choose the rewards you want to associate with this campaign.
          </DialogDescription>
        </DialogHeader>

        {isLoading && <p>Loading rewards...</p>}
        {error && <p className='text-red-500'>Error fetching rewards.</p>}

        <ScrollArea className="max-h-60 v-scrollbar-thin">
          <div className="space-y-4 pr-4">
            {rewardsData?.data.map((reward: BusinessReward) => (
              <div key={reward.id} className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg border">
                <Checkbox
                  id={reward.id}
                  checked={selectedRewards.includes(reward.id)}
                  onCheckedChange={() => handleToggleReward(reward.id)}
                />
                <label
                  htmlFor={reward.id}
                  className="flex-grow text-sm font-medium leading-none cursor-pointer"
                >
                  {reward.reward.title}
                </label>
              </div>
            ))}
          </div>
        </ScrollArea>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button onClick={handleProceed}>Proceed</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
