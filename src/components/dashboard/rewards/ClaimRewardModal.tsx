'use client';

import React, { useEffect, useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import Image from 'next/image';
import { useGetUnaddedRewards, useAddBusinessReward } from '@/services/business-reward/hooks';
import LoadingSpinner from '@/components/ui/Loading';
import { toast } from 'sonner';
import { Input } from '@/components/ui/input';
import { ChevronLeft, ChevronRight, MoreHorizontal } from 'lucide-react';
import TierLimitModal from '@/components/dashboard/campaigns/TierLimitModal';
import { AxiosError } from 'axios';

interface ClaimRewardModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreateFromScratch: () => void;
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
}: ClaimRewardModalProps) {
  const [page, setPage] = useState(1);
  const limit = 6;
  const { data: unaddedRewards, isLoading, isError, refetch } = useGetUnaddedRewards(page, limit, { enabled: isOpen });
  const addRewardMutation = useAddBusinessReward();
  const [points, setPoints] = useState<{ [key: string]: number }>({});
  const [isErrorModalOpen, setIsErrorModalOpen] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [addingRewardId, setAddingRewardId] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      refetch();
    }
  }, [isOpen, refetch, page]);

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

  const handlePointsChange = (rewardId: string, value: string) => {
    setPoints((prev) => ({ ...prev, [rewardId]: Number(value) }));
  };

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

          <div className="flex-grow overflow-y-auto p-1">
            {isLoading && <LoadingSpinner />}
            {isError && <p className="text-red-500">Error fetching rewards.</p>}
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
            {unaddedRewards && (
               <Pagination
                  currentPage={page}
                  totalPages={unaddedRewards.totalPages || 1}
                  totalItems={unaddedRewards.total || 0}
                  limit={limit}
                  onPageChange={setPage}
               />
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
    </>
  );
}
