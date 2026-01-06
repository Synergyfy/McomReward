'use client';

import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { useGetBusinessRewards } from '@/services/business-reward/hooks';
import { BusinessReward } from '@/services/business-reward/types';
import { Checkbox } from '@/components/ui/checkbox';
import { ScrollArea } from '@/components/ui/scroll-area';
import { toast } from 'sonner';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";

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

  // Helper to determine cost display
  const getCostDisplay = (reward: BusinessReward) => {
    const costs = [];
    // Prioritize business-level override, fallback to nested reward definition
    const points = reward.pointRequired ?? reward.pointsRequired ?? reward.points_required ?? reward.reward?.pointRequired ?? reward.reward?.pointsRequired ?? 0;
    const stamps = reward.stampsRequired ?? reward.stamps_required ?? reward.reward?.stampsRequired ?? 0;

    // We can also check explicit flags if available, but value > 0 is usually safe
    if (points > 0) costs.push(`${points} Pts`);
    if (stamps > 0) costs.push(`${stamps} Stamps`);

    return costs.length > 0 ? costs.join(' + ') : 'Free';
  };

  const renderRewardList = (rewards: BusinessReward[], emptyMessage: string) => {
    if (rewards.length === 0) {
      return <p className="text-sm text-gray-500 py-4 text-center">{emptyMessage}</p>;
    }
    return (
      <div className="space-y-4 pr-4">
        {rewards.map((reward: BusinessReward) => (
          <div key={reward.id} className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg border hover:bg-gray-100 transition-colors">
            <Checkbox
              id={reward.id}
              checked={selectedRewards.includes(reward.id)}
              onCheckedChange={() => handleToggleReward(reward.id)}
            />
            <div className="flex-grow flex justify-between items-center cursor-pointer" onClick={() => handleToggleReward(reward.id)}>
              <label
                htmlFor={reward.id}
                className="text-sm font-medium leading-none cursor-pointer"
              >
                {reward.title || reward.reward?.title || 'Untitled Reward'}
              </label>
              <Badge variant="secondary" className="text-xs ml-2">
                {getCostDisplay(reward)}
              </Badge>
            </div>
          </div>
        ))}
      </div>
    );
  };

  const pointsRewards = rewardsData?.data.filter(r => {
    // Check if points are enabled OR if points cost > 0
    const points = r.pointRequired ?? r.pointsRequired ?? r.points_required ?? r.reward?.pointRequired ?? 0;
    return (r.is_points_enabled || r.isPointsEnabled) || (points > 0);
  }) || [];

  const stampRewards = rewardsData?.data.filter(r => {
    // Check if stamps are enabled OR if stamps cost > 0
    const stamps = r.stampsRequired ?? r.stamps_required ?? r.reward?.stampsRequired ?? 0;
    return (r.is_stamps_enabled || r.isStampsEnabled) || (stamps > 0);
  }) || [];

  // If a reward has both, it appears in both lists. This is usually acceptable as it's a "Points Reward" AND a "Stamp Reward".
  // If we want strict separation, we'd need to prioritize, but "Select any of them or both" implies flexibility.

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

        {!isLoading && rewardsData && (
          <Tabs defaultValue="points" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="points">Points Rewards ({pointsRewards.length})</TabsTrigger>
              <TabsTrigger value="stamps">Stamp Rewards ({stampRewards.length})</TabsTrigger>
            </TabsList>

            <TabsContent value="points">
              <ScrollArea className="max-h-60 v-scrollbar-thin mt-2">
                {renderRewardList(pointsRewards, "No points rewards available.")}
              </ScrollArea>
            </TabsContent>

            <TabsContent value="stamps">
              <ScrollArea className="max-h-60 v-scrollbar-thin mt-2">
                {renderRewardList(stampRewards, "No stamp rewards available.")}
              </ScrollArea>
            </TabsContent>
          </Tabs>
        )}

        <DialogFooter className="mt-4">
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button onClick={handleProceed}>Proceed ({selectedRewards.length})</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
