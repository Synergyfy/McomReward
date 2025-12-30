'use client';

import React, { useEffect, useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import Image from 'next/image';
import { useGetUnaddedRewards, useAddBusinessReward } from '@/services/business-reward/hooks';
import { useGetAvailableTemplates } from '@/services/business-stamp-rewards/hook';
import { StampRewardResponse } from '@/services/stamp-rewards/types';
import LoadingSpinner from '@/components/ui/Loading';
import { toast } from 'sonner';
import { Input } from '@/components/ui/input';
import { ChevronLeft, ChevronRight, MoreHorizontal, Search, Gift, Stamp } from 'lucide-react';
import TierLimitModal from '@/components/dashboard/campaigns/TierLimitModal';
import SubscriptionRequiredModal from './SubscriptionRequiredModal';
import { AxiosError } from 'axios';
import { useDebounce } from 'use-debounce';

type RewardFilterType = 'point' | 'stamp';

interface ClaimRewardModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreateFromScratch: () => void;
  onActivateStampReward?: (template: StampRewardResponse) => void;
}

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  limit: number;
  onPageChange: (page: number) => void;
}

const Pagination = ({
  currentPage,
  totalPages,
  totalItems,
  limit,
  onPageChange,
}: PaginationProps) => {
  const renderPaginationItems = () => {
    const items = [];
    const maxVisiblePages = 3; // Reduced for modal space
    const ellipsis = <MoreHorizontal className="h-4 w-4" />;

    if (totalPages <= maxVisiblePages + 2) {
      for (let i = 1; i <= totalPages; i++) {
        items.push(
          <Button
            key={i}
            variant={currentPage === i ? 'default' : 'outline'}
            size="icon"
            className="w-8 h-8"
            onClick={() => onPageChange(i)}
          >
            {i}
          </Button>
        );
      }
    } else {
      items.push(
        <Button
          key={1}
          variant={currentPage === 1 ? 'default' : 'outline'}
          size="icon"
          className="w-8 h-8"
          onClick={() => onPageChange(1)}
        >
          1
        </Button>
      );

      if (currentPage > 2) {
        items.push(
          <div
            key="start-ellipsis"
            className="flex items-center justify-center w-8 h-8 text-muted-foreground"
          >
            {ellipsis}
          </div>
        );
      }

      const startPage = Math.max(2, currentPage - 1);
      const endPage = Math.min(totalPages - 1, currentPage + 1);

      for (let i = startPage; i <= endPage; i++) {
        items.push(
          <Button
            key={i}
            variant={currentPage === i ? 'default' : 'outline'}
            size="icon"
            className="w-8 h-8"
            onClick={() => onPageChange(i)}
          >
            {i}
          </Button>
        );
      }

      if (currentPage < totalPages - 1) {
        items.push(
          <div
            key="end-ellipsis"
            className="flex items-center justify-center w-8 h-8 text-muted-foreground"
          >
            {ellipsis}
          </div>
        );
      }

      items.push(
        <Button
          key={totalPages}
          variant={currentPage === totalPages ? 'default' : 'outline'}
          size="icon"
          className="w-8 h-8"
          onClick={() => onPageChange(totalPages)}
        >
          {totalPages}
        </Button>
      );
    }

    return items;
  };

  return (
    <div className="flex items-center justify-between mt-4 border-t pt-4">
      <div className="text-sm text-gray-500 hidden sm:block">
        {(currentPage - 1) * limit + 1}-{Math.min(currentPage * limit, totalItems)} of {totalItems}
      </div>
      <div className="flex items-center space-x-2 mx-auto sm:mx-0">
        <Button
          variant="outline"
          size="icon"
          className="w-8 h-8"
          onClick={() => onPageChange(Math.max(1, currentPage - 1))}
          disabled={currentPage === 1}
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>

        <div className="flex items-center space-x-1">
          {renderPaginationItems()}
        </div>

        <Button
          variant="outline"
          size="icon"
          className="w-8 h-8"
          onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}
          disabled={currentPage === totalPages}
        >
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
};

export default function ClaimRewardModal({
  isOpen,
  onClose,
  onCreateFromScratch,
  onActivateStampReward,
}: ClaimRewardModalProps) {
  const [activeFilter, setActiveFilter] = useState<RewardFilterType>('point');
  const [page, setPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedSearchQuery] = useDebounce(searchQuery, 300);
  const limit = 6;

  // Point rewards data
  const { data: unaddedRewards, isLoading: isLoadingPointRewards, isError: isErrorPointRewards, refetch: refetchPointRewards } = useGetUnaddedRewards(page, limit, debouncedSearchQuery, { enabled: isOpen && activeFilter === 'point' });

  // Stamp rewards data
  const { data: stampTemplates = [], isLoading: isLoadingStampRewards, refetch: refetchStampRewards } = useGetAvailableTemplates();

  const addRewardMutation = useAddBusinessReward();
  const [points, setPoints] = useState<{ [key: string]: number }>({});
  const [isErrorModalOpen, setIsErrorModalOpen] = useState(false);
  const [isSubscriptionModalOpen, setIsSubscriptionModalOpen] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [addingRewardId, setAddingRewardId] = useState<string | null>(null);

  // Filter stamp templates based on search
  const filteredStampTemplates = stampTemplates.filter((template) =>
    template.title.toLowerCase().includes(debouncedSearchQuery.toLowerCase()) ||
    template.description.toLowerCase().includes(debouncedSearchQuery.toLowerCase())
  );

  useEffect(() => {
    setPage(1);
  }, [debouncedSearchQuery, activeFilter]);

  useEffect(() => {
    if (isOpen) {
      if (activeFilter === 'point') {
        refetchPointRewards();
      } else {
        refetchStampRewards();
      }
    }
  }, [isOpen, refetchPointRewards, refetchStampRewards, page, debouncedSearchQuery, activeFilter]);

  useEffect(() => {
    if (isErrorPointRewards && isOpen && activeFilter === 'point') {
      setIsSubscriptionModalOpen(true);
      onClose();
    }
  }, [isErrorPointRewards, isOpen, onClose, activeFilter]);

  useEffect(() => {
    if (unaddedRewards) {
      const initialPoints = unaddedRewards.data.reduce((acc, reward) => {
        acc[reward.id] = reward.maxPoints;
        return acc;
      }, {} as { [key: string]: number });
      setPoints((prev) => ({ ...prev, ...initialPoints }));
    }
  }, [unaddedRewards]);

  const handleAddReward = (rewardId: string) => {
    setAddingRewardId(rewardId);
    const pointRequired = points[rewardId];
    addRewardMutation.mutate(
      { rewardId, pointRequired },
      {
        onSuccess: () => {
          toast.success('Reward added successfully!');
          setAddingRewardId(null);
          onClose();
        },
        onError: (error) => {
          setAddingRewardId(null);
          const axiosError = error as AxiosError<{ message: string }>;
          const message = axiosError.response?.data?.message || 'Failed to add reward.';

          if (message.includes('Points required cannot exceed') || message.includes('You have reached your limit of')) {
            setErrorMessage(message);
            setIsErrorModalOpen(true);
          } else {
            toast.error('Failed to add reward.');
          }
        },
      }
    );
  };

  const handleActivateStamp = (template: StampRewardResponse) => {
    if (onActivateStampReward) {
      onClose();
      onActivateStampReward(template);
    }
  };

  const handlePointsChange = (rewardId: string, value: string) => {
    setPoints((prev) => ({ ...prev, [rewardId]: Number(value) }));
  };

  const isLoading = activeFilter === 'point' ? isLoadingPointRewards : isLoadingStampRewards;

  return (
    <>
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="sm:max-w-4xl max-h-[90vh] flex flex-col">
          <DialogHeader>
            <DialogTitle>Add a New Reward</DialogTitle>
            <DialogDescription>
              Choose a pre-made template to get started quickly, or create a new reward from scratch.
            </DialogDescription>
          </DialogHeader>

          {/* Filter Tabs */}
          <Tabs value={activeFilter} onValueChange={(v) => setActiveFilter(v as RewardFilterType)} className="w-full">
            <TabsList className="grid w-full grid-cols-2 mb-4">
              <TabsTrigger value="point" className="gap-2 data-[state=active]:bg-blue-500 data-[state=active]:text-white">
                <Gift className="h-4 w-4" />
                Point Rewards
                {unaddedRewards && unaddedRewards.total > 0 && (
                  <Badge variant="secondary" className="ml-1 text-xs">
                    {unaddedRewards.total}
                  </Badge>
                )}
              </TabsTrigger>
              <TabsTrigger value="stamp" className="gap-2 data-[state=active]:bg-orange-500 data-[state=active]:text-white">
                <Stamp className="h-4 w-4" />
                Stamp Rewards
                {stampTemplates.length > 0 && (
                  <Badge variant="secondary" className="ml-1 text-xs">
                    {stampTemplates.length}
                  </Badge>
                )}
              </TabsTrigger>
            </TabsList>
          </Tabs>

          <div className="relative my-2 px-1">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder={activeFilter === 'point' ? "Search point rewards..." : "Search stamp rewards..."}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
            />
          </div>

          <div className="flex-grow overflow-y-auto p-1">
            {isLoading && <LoadingSpinner />}

            {/* Point Rewards Content */}
            {activeFilter === 'point' && !isLoading && (
              <>
                {isErrorPointRewards && !isSubscriptionModalOpen && <p className="text-red-500">Error fetching rewards.</p>}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {unaddedRewards?.data.map((reward) => (
                    <Card key={reward.id} className="flex flex-col">
                      <CardHeader>
                        <div className="relative w-full h-32 rounded-t-lg overflow-hidden bg-gray-200 mb-4">
                          {reward.image && (
                            <Image
                              src={reward.image}
                              alt={reward.title}
                              layout="fill"
                              objectFit="cover"
                            />
                          )}
                        </div>
                        <CardTitle className="text-lg">{reward.title}</CardTitle>
                      </CardHeader>
                      <CardContent className="flex-grow">
                        <p className="text-sm text-gray-600 mb-3 h-20 overflow-hidden">{reward.description}</p>
                        <div className="space-y-2">
                          <div className="flex justify-between items-center">
                            <span className="font-medium text-xs">Value:</span>
                            <span className='text-xs'>£{reward.value}</span>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="font-medium text-xs">Maximum Points:</span>
                            <span className='text-xs'>{reward.maxPoints}</span>
                          </div>
                          <div>
                            <label htmlFor={`points-${reward.id}`} className="font-medium text-xs">
                              Set Your Points
                            </label>
                            <Input
                              id={`points-${reward.id}`}
                              type="number"
                              value={points[reward.id] || ''}
                              onChange={(e) => handlePointsChange(reward.id, e.target.value)}
                              className="mt-1"
                            />
                          </div>
                        </div>
                      </CardContent>
                      <CardFooter>
                        <Button
                          className="w-full"
                          onClick={() => handleAddReward(reward.id)}
                          disabled={addRewardMutation.isPending}
                        >
                          {addingRewardId === reward.id ? 'Adding...' : 'Add Reward'}
                        </Button>
                      </CardFooter>
                    </Card>
                  ))}
                </div>
                {unaddedRewards && unaddedRewards.data.length > 0 && (
                  <Pagination
                    currentPage={page}
                    totalPages={unaddedRewards.totalPages || 1}
                    totalItems={unaddedRewards.total || 0}
                    limit={limit}
                    onPageChange={setPage}
                  />
                )}
                {unaddedRewards && unaddedRewards.data.length === 0 && (
                  <div className="text-center py-12">
                    <Gift className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-500">No point rewards available to add.</p>
                  </div>
                )}
              </>
            )}

            {/* Stamp Rewards Content */}
            {activeFilter === 'stamp' && !isLoading && (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {filteredStampTemplates.map((template) => (
                    <Card key={template.id} className="flex flex-col border-orange-100 dark:border-orange-900/30 hover:border-orange-300 transition-colors">
                      <CardHeader>
                        <div className="relative w-full h-32 rounded-t-lg overflow-hidden bg-gradient-to-br from-orange-100 to-amber-100 dark:from-orange-900/30 dark:to-amber-900/30 mb-4">
                          {template.image ? (
                            <Image
                              src={template.image}
                              alt={template.title}
                              layout="fill"
                              objectFit="cover"
                            />
                          ) : (
                            <div className="flex items-center justify-center h-full">
                              <Stamp className="h-12 w-12 text-orange-400" />
                            </div>
                          )}
                        </div>
                        <div className="flex items-center gap-2">
                          <CardTitle className="text-lg flex-1">{template.title}</CardTitle>
                          <Badge variant="outline" className="text-orange-600 border-orange-300">
                            {template.stampsRequired} stamps
                          </Badge>
                        </div>
                      </CardHeader>
                      <CardContent className="flex-grow">
                        <p className="text-sm text-gray-600 dark:text-gray-400 mb-3 h-16 overflow-hidden">
                          {template.description}
                        </p>
                        <div className="space-y-1 text-xs">
                          <div className="flex justify-between">
                            <span className="text-gray-500">Reward:</span>
                            <span className="font-medium text-orange-600">{template.rewardBenefitValue}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-500">Trigger:</span>
                            <span className="capitalize">{template.triggerMethod.replace('_', ' ')}</span>
                          </div>
                        </div>
                      </CardContent>
                      <CardFooter>
                        <Button
                          className="w-full bg-orange-500 hover:bg-orange-600"
                          onClick={() => handleActivateStamp(template)}
                        >
                          Activate
                        </Button>
                      </CardFooter>
                    </Card>
                  ))}
                </div>
                {filteredStampTemplates.length === 0 && (
                  <div className="text-center py-12">
                    <Stamp className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-500">
                      {searchQuery ? 'No stamp rewards match your search.' : 'No stamp reward templates available.'}
                    </p>
                  </div>
                )}
              </>
            )}
          </div>

          <div className="mt-6 text-center">
            <p className="text-sm text-gray-500 mb-2">Want full control?</p>
            <Button variant="secondary" onClick={onCreateFromScratch}>
              Create a Reward from Scratch
            </Button>
          </div>
        </DialogContent>
      </Dialog>
      <TierLimitModal
        isOpen={isErrorModalOpen}
        onClose={() => setIsErrorModalOpen(false)}
        message={errorMessage}
      />
      <SubscriptionRequiredModal
        isOpen={isSubscriptionModalOpen}
        onClose={() => setIsSubscriptionModalOpen(false)}
      />
    </>
  );
}
