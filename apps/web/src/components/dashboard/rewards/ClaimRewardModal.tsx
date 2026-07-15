'use client';

import React, { useEffect, useState, useMemo } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import Image from 'next/image';
import { useGetUnaddedRewards } from '@/services/business-reward/hooks';
import LoadingSpinner from '@/components/ui/Loading';
import { Input } from '@/components/ui/input';
import { Search, Gift, Stamp, Filter } from 'lucide-react';
import SubscriptionRequiredModal from './SubscriptionRequiredModal';
import { useDebounce } from 'use-debounce';
import { Reward } from '@/services/business-reward/types';
import { cn } from '@/lib/utils';

type RewardFilterType = 'all' | 'point' | 'stamp' | 'hybrid';

interface ClaimRewardModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreateFromScratch: () => void;
  onSelectTemplate: (reward: Reward) => void;
}

export default function ClaimRewardModal({
  isOpen,
  onClose,
  onCreateFromScratch,
  onSelectTemplate,
}: ClaimRewardModalProps) {
  const [activeFilter, setActiveFilter] = useState<RewardFilterType>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedSearchQuery] = useDebounce(searchQuery, 300);
  const page = 1;
  const limit = 50; // Fetch more since we filter client side for now or unified list

  // Unified rewards data
  const { data: unaddedRewards, isLoading, isError } = useGetUnaddedRewards(page, limit, debouncedSearchQuery, { enabled: isOpen });

  const [isSubscriptionModalOpen, setIsSubscriptionModalOpen] = useState(false);

  useEffect(() => {
    if (isError && isOpen) {
      setIsSubscriptionModalOpen(true);
      onClose();
    }
  }, [isError, isOpen, onClose]);

  const filteredRewards = useMemo(() => {
    if (!unaddedRewards?.data) return [];

    return unaddedRewards.data.filter(reward => {
      // Filter by type
      if (activeFilter === 'point') {
        return (reward.isPointsEnabled || (reward.pointsRequired > 0) || reward.rewardType === 'point offer') && !reward.isStampsEnabled;
      }
      if (activeFilter === 'stamp') {
        const stamps = reward.stampsRequired || reward.maxStampsRequired || 0;
        return (reward.isStampsEnabled || stamps > 0) && !reward.isPointsEnabled;
      }
      if (activeFilter === 'hybrid') {
        const stamps = reward.stampsRequired || reward.maxStampsRequired || 0;
        const isStamp = reward.isStampsEnabled || stamps > 0;
        const isPoint = reward.isPointsEnabled || (reward.pointsRequired > 0) || reward.rewardType === 'point offer';
        return isStamp && isPoint;
      }
      return true;
    });
  }, [unaddedRewards, activeFilter]);

  const getRewardBadge = (reward: Reward) => {
    const stamps = reward.stampsRequired || reward.maxStampsRequired || 0;
    const isStamp = reward.isStampsEnabled || stamps > 0;
    const isPoint = reward.isPointsEnabled || (reward.pointsRequired > 0) || reward.rewardType === 'point offer';

    if (isStamp && isPoint) {
      return <Badge className="bg-purple-100 text-purple-600 hover:bg-purple-200 border-purple-200">Hybrid Reward</Badge>;
    }
    if (isStamp) {
      return <Badge className="bg-orange-100 text-orange-600 hover:bg-orange-200 border-orange-200">Stamp Reward</Badge>;
    }
    return <Badge className="bg-blue-100 text-blue-600 hover:bg-blue-200 border-blue-200">Point Reward</Badge>;
  };

  return (
    <>
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="max-w-[calc(100vw-32px)] sm:max-w-4xl max-h-[90vh] flex flex-col" onInteractOutside={(e) => e.preventDefault()}>
          <DialogHeader>
            <DialogTitle className="text-lg md:text-xl">Add a New Reward</DialogTitle>
            <DialogDescription className="text-xs md:text-sm">
              Choose a pre-made template to get started quickly, or create a new reward from scratch.
            </DialogDescription>
          </DialogHeader>

          <div className="flex flex-col gap-3 mb-4">
            {/* Filter Buttons */}
            <div className="flex flex-wrap items-center gap-1.5 p-1 bg-gray-100 dark:bg-gray-800 rounded-lg">
              <button
                onClick={() => setActiveFilter('all')}
                className={cn(
                  "px-2.5 py-1.5 text-xs font-medium rounded-md transition-all flex items-center gap-1.5",
                  activeFilter === 'all'
                    ? "bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 shadow-sm"
                    : "text-gray-500 hover:text-gray-700 dark:text-gray-400"
                )}
              >
                All Rewards
              </button>
              <button
                onClick={() => setActiveFilter('point')}
                className={cn(
                  "px-2.5 py-1.5 text-xs font-medium rounded-md transition-all flex items-center gap-1.5",
                  activeFilter === 'point'
                    ? "bg-white dark:bg-gray-700 text-blue-600 dark:text-blue-400 shadow-sm"
                    : "text-gray-500 hover:text-gray-700 dark:text-gray-400"
                )}
              >
                <Gift className="h-3 w-3" />
                Points
              </button>
              <button
                onClick={() => setActiveFilter('stamp')}
                className={cn(
                  "px-2.5 py-1.5 text-xs font-medium rounded-md transition-all flex items-center gap-1.5",
                  activeFilter === 'stamp'
                    ? "bg-white dark:bg-gray-700 text-orange-600 dark:text-orange-400 shadow-sm"
                    : "text-gray-500 hover:text-gray-700 dark:text-gray-400"
                )}
              >
                <Stamp className="h-3 w-3" />
                Stamps
              </button>
              <button
                onClick={() => setActiveFilter('hybrid')}
                className={cn(
                  "px-2.5 py-1.5 text-xs font-medium rounded-md transition-all flex items-center gap-1.5",
                  activeFilter === 'hybrid'
                    ? "bg-white dark:bg-gray-700 text-purple-600 dark:text-purple-400 shadow-sm"
                    : "text-gray-500 hover:text-gray-700 dark:text-gray-400"
                )}
              >
                <Filter className="h-3 w-3" />
                Hybrid
              </button>
            </div>

            {/* Search */}
            <div className="relative w-full">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Search rewards..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 h-9"
              />
            </div>
          </div>

          <div className="flex-grow overflow-y-auto p-1 min-h-[200px] md:min-h-[300px]">
            {isLoading ? (
              <div className="flex items-center justify-center h-48">
                <LoadingSpinner />
              </div>
            ) : (
              <>
                {unaddedRewards?.data?.length === 0 ? (
                  <div className="text-center py-12">
                    <Gift className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-500">No rewards available to add.</p>
                  </div>
                ) : filteredRewards.length === 0 ? (
                  <div className="text-center py-12">
                    <Filter className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-500">No rewards match your filter.</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {filteredRewards.map((reward) => (
                      <Card key={reward.id} className="flex flex-col hover:shadow-md transition-shadow">
                        <CardHeader className="pb-2">
                          <div className="relative w-full h-32 rounded-t-lg overflow-hidden bg-gray-100 mb-3">
                            {reward.image && (
                              (reward.image.startsWith('http') || reward.image.startsWith('/')) ? (
                                <Image
                                  src={reward.image}
                                  alt={reward.title}
                                  layout="fill"
                                  objectFit="cover"
                                />
                              ) : (
                                <div className="flex items-center justify-center h-full text-4xl">
                                  {reward.image}
                                </div>
                              )
                            )}
                            <div className="absolute top-2 right-2">
                              {getRewardBadge(reward)}
                            </div>
                          </div>
                          <CardTitle className="text-lg leading-tight">{reward.title}</CardTitle>
                        </CardHeader>
                        <CardContent className="flex-grow pb-2">
                          <p className="text-sm text-gray-600 mb-3 h-10 overflow-hidden line-clamp-2">{reward.description}</p>
                          <div className="space-y-1.5 bg-gray-50 dark:bg-gray-800/50 p-2 rounded-md">
                            {(reward.isPointsEnabled || reward.pointsRequired > 0) && (
                              <div className="flex justify-between items-center text-xs">
                                <span className="font-medium text-gray-600 dark:text-gray-400">Points Required:</span>
                                <span className='font-semibold text-blue-600'>{reward.pointsRequired || reward.maxPoints || 0}</span>
                              </div>
                            )}
                            {(reward.isStampsEnabled || ((reward.stampsRequired || reward.maxStampsRequired || 0) > 0)) && (
                              <div className="flex justify-between items-center text-xs">
                                <span className="font-medium text-gray-600 dark:text-gray-400">Stamps Required:</span>
                                <span className='font-semibold text-orange-600'>{reward.stampsRequired || reward.maxStampsRequired || 0}</span>
                              </div>
                            )}
                            <div className="flex justify-between items-center text-xs pt-1 border-t border-dashed border-gray-200">
                              <span className="font-medium text-gray-500">Value:</span>
                              <span className='text-gray-700 font-medium'>£{reward.value}</span>
                            </div>
                          </div>
                        </CardContent>
                        <CardFooter className="pt-2">
                          <Button
                            className="w-full bg-gray-900 hover:bg-gray-800 text-white dark:bg-white dark:text-gray-900 dark:hover:bg-gray-100"
                            onClick={() => onSelectTemplate(reward)}
                          >
                            Add Reward
                          </Button>
                        </CardFooter>
                      </Card>
                    ))}
                  </div>
                )}
              </>
            )}
          </div>

          <div className="mt-2 md:mt-4 pt-3 md:pt-4 border-t text-center">
            <p className="text-xs md:text-sm text-gray-500 mb-1.5 md:mb-2">Want full control?</p>
            <Button variant="outline" onClick={onCreateFromScratch} className="w-full sm:w-auto text-xs md:text-sm h-9 md:h-10">
              Create a Reward from Scratch
            </Button>
          </div>
        </DialogContent>
      </Dialog>
      <SubscriptionRequiredModal
        isOpen={isSubscriptionModalOpen}
        onClose={() => setIsSubscriptionModalOpen(false)}
      />
    </>
  );
}
