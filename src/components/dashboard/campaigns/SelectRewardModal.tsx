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
import { DatePickerWithRange } from '@/components/ui/date-range-picker';
import { DateRange } from 'react-day-picker';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { useGetMySubscription } from '@/services/tiers/hook';
import TierLimitModal from './TierLimitModal';

interface SelectRewardModalProps {
  isOpen: boolean;
  onClose: () => void;
  onProceed: (selectedRewardIds: string[], selectedRewards: BusinessReward[], startDate?: string, endDate?: string, totalSlots?: number) => void;
  initialSelectedIds?: string[];
  showDates?: boolean;
}

const DEFAULT_SELECTED_IDS: string[] = [];

export default function SelectRewardModal({
  isOpen,
  onClose,
  onProceed,
  initialSelectedIds = DEFAULT_SELECTED_IDS,
  showDates = false,
}: SelectRewardModalProps) {
  const [step, setStep] = useState<'rewards' | 'dates'>('rewards');
  const [selectedRewards, setSelectedRewards] = useState<string[]>([]);
  const [dateRange, setDateRange] = useState<DateRange | undefined>(() => {
    const from = new Date();
    const to = new Date();
    to.setDate(to.getDate() + 30);
    return { from, to };
  });
  const [totalSlots, setTotalSlots] = useState<number | undefined>(undefined);
  const [isTierLimitModalOpen, setIsTierLimitModalOpen] = useState(false);
  const [tierLimitMessage, setTierLimitMessage] = useState('');

  const { data: rewardsData, isLoading, error } = useGetBusinessRewards(1, 100);
  const { data: subscriptionData } = useGetMySubscription();

  // Initialize selected rewards when modal opens or initialSelectedIds changes
  useEffect(() => {
    if (isOpen) {
      setSelectedRewards(initialSelectedIds);
      setStep('rewards');
    }
  }, [isOpen, initialSelectedIds]);

  const handleToggleReward = (rewardId: string) => {
    const isSelecting = !selectedRewards.includes(rewardId);

    if (isSelecting) {
      const maxRewards = subscriptionData?.tier?.configuration?.quotas?.maxRewardsPerCampaign || 0;
      // If maxRewards is -1, it means unlimited
      if (maxRewards !== -1 && selectedRewards.length >= maxRewards) {
        setTierLimitMessage('Upgrade to a higher tier to get more limits');
        setIsTierLimitModalOpen(true);
        return;
      }
    }

    setSelectedRewards(prev =>
      prev.includes(rewardId)
        ? prev.filter(id => id !== rewardId)
        : [...prev, rewardId]
    );
  };

  const handleNext = () => {
    if (selectedRewards.length === 0) {
      toast.error('Please select at least one reward.');
      return;
    }
    setStep('dates');
  };

  const handleBack = () => {
    setStep('rewards');
  };

  const handleProceed = () => {
    if (selectedRewards.length === 0) {
      toast.error('Please select at least one reward.');
      return;
    }

    if (showDates) {
      if (!dateRange?.from || !dateRange?.to) {
        toast.error('Please select a valid date range.');
        return;
      }
      if (totalSlots === undefined || totalSlots === null) {
        toast.error('Total slots is required.');
        return;
      }
    }

    const allRewards = rewardsData?.data || [];
    const selectedRewardObjects = allRewards.filter(r => selectedRewards.includes(r.id));

    onProceed(
      selectedRewards, 
      selectedRewardObjects, 
      dateRange?.from?.toISOString(), 
      dateRange?.to?.toISOString(),
      totalSlots
    );
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
          <DialogTitle>
            {step === 'rewards' ? 'Select Rewards' : 'Set Campaign Dates'}
          </DialogTitle>
          <DialogDescription>
            {step === 'rewards' 
              ? 'Choose the rewards you want to associate with this campaign.'
              : 'Specify when this campaign should start and end.'}
          </DialogDescription>
        </DialogHeader>

        {step === 'rewards' ? (
          <>
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
          </>
        ) : (
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Campaign Date Range</Label>
              <DatePickerWithRange 
                date={dateRange} 
                setDate={setDateRange}
                className="w-full"
              />
              <p className="text-xs text-gray-500">
                Choose the start and end dates for your claimed campaign.
              </p>
            </div>
            <div className="space-y-2">
              <Label>Total Slots</Label>
              <Input
                type="number"
                placeholder="e.g. 100"
                value={totalSlots !== undefined ? totalSlots : ''}
                onChange={(e) => setTotalSlots(e.target.value === '' ? undefined : Number(e.target.value))}
              />
              <p className="text-xs text-gray-500">
                Limit the total number of participants who can join this campaign.
              </p>
            </div>
          </div>
        )}

        <DialogFooter className="mt-4">
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          
          {step === 'rewards' ? (
            showDates ? (
              <Button onClick={handleNext} disabled={isLoading || selectedRewards.length === 0}>
                Next
              </Button>
            ) : (
              <Button onClick={handleProceed} disabled={isLoading}>
                Proceed ({selectedRewards.length})
              </Button>
            )
          ) : (
            <>
              <Button variant="outline" onClick={handleBack}>Back</Button>
              <Button onClick={handleProceed}>
                Claim Campaign
              </Button>
            </>
          )}
        </DialogFooter>
      </DialogContent>
      <TierLimitModal
        isOpen={isTierLimitModalOpen}
        onClose={() => setIsTierLimitModalOpen(false)}
        message={tierLimitMessage}
      />
    </Dialog>
  );
}