'use client';

import React, { useState, useEffect } from 'react';
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
  onProceed: (selectedRewardIds: string[], selectedRewards: BusinessReward[]) => void;
  initialSelectedIds?: string[];
}

export default function SelectRewardModal({
  isOpen,
  onClose,
  onProceed,
  initialSelectedIds = [],
}: SelectRewardModalProps) {
  const [selectedRewards, setSelectedRewards] = useState<string[]>([]);
  const { data: rewardsData, isLoading, error } = useGetBusinessRewards(1, 100);

  // Initialize selected rewards when modal opens or initialSelectedIds changes
  useEffect(() => {
    if (isOpen) {
      setSelectedRewards(initialSelectedIds);
    }
  }, [isOpen, initialSelectedIds]);

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

    const allRewards = rewardsData?.data || [];
    const selectedRewardObjects = allRewards.filter(r => selectedRewards.includes(r.id));

    onProceed(selectedRewards, selectedRewardObjects);
    onClose();
  };

  /**
   * Safe helper to extract points/stamps regardless of naming convention
   * Handles top-level properties and nested 'reward' object properties
   */
  const getRewardMetrics = (reward: any) => {
    const points = 
      reward.pointRequired ?? 
      reward.pointsRequired ?? 
      reward.points_required ?? 
      reward.reward?.pointRequired ?? 
      reward.reward?.pointsRequired ?? 
      0;

    const stamps = 
      reward.stampsRequired ?? 
      reward.stamps_required ?? 
      reward.reward?.stampsRequired ?? 
      reward.reward?.stamps_required ?? 
      0;

    return { points, stamps };
  };

  const getCostDisplay = (reward: BusinessReward) => {
    const { points, stamps } = getRewardMetrics(reward);
    const costs = [];

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

  // Filter Logic
  const pointsRewards = rewardsData?.data.filter(r => {
    const { points } = getRewardMetrics(r);
    const isEnabled = r.is_points_enabled || (r as any).isPointsEnabled;
    return isEnabled || points > 0;
  }) || [];

  const stampRewards = rewardsData?.data.filter(r => {
    const { stamps } = getRewardMetrics(r);
    const isEnabled = r.is_stamps_enabled || (r as any).isStampsEnabled;
    return isEnabled || stamps > 0;
  }) || [];

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Select Rewards</DialogTitle>
          <DialogDescription>
            Choose the rewards you want to associate with this campaign.
          </DialogDescription>
        </DialogHeader>

        {isLoading && <p className="text-center py-4">Loading rewards...</p>}
        {error && <p className='text-red-500 text-center py-4'>Error fetching rewards.</p>}

        {!isLoading && rewardsData && (
          <Tabs defaultValue="points" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="points">Points ({pointsRewards.length})</TabsTrigger>
              <TabsTrigger value="stamps">Stamps ({stampRewards.length})</TabsTrigger>
            </TabsList>

            <TabsContent value="points">
              <ScrollArea className="h-[300px] mt-2">
                {renderRewardList(pointsRewards, "No points rewards available.")}
              </ScrollArea>
            </TabsContent>

            <TabsContent value="stamps">
              <ScrollArea className="h-[300px] mt-2">
                {renderRewardList(stampRewards, "No stamp rewards available.")}
              </ScrollArea>
            </TabsContent>
          </Tabs>
        )}

        <DialogFooter className="mt-4">
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button onClick={handleProceed} disabled={isLoading}>
            Proceed ({selectedRewards.length})
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}