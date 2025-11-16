
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

interface ClaimRewardModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreateFromScratch: () => void;
}

export default function ClaimRewardModal({
  isOpen,
  onClose,
  onCreateFromScratch,
}: ClaimRewardModalProps) {
  const { data: unaddedRewards, isLoading, isError, refetch } = useGetUnaddedRewards(1, 100);
  const addRewardMutation = useAddBusinessReward();
  const [points, setPoints] = useState<{ [key: string]: number }>({});

  useEffect(() => {
    if (isOpen) {
      refetch();
    }
  }, [isOpen, refetch]);

  useEffect(() => {
    if (unaddedRewards) {
      const initialPoints = unaddedRewards.data.reduce((acc, reward) => {
        acc[reward.id] = reward.points_required;
        return acc;
      }, {} as { [key: string]: number });
      setPoints(initialPoints);
    }
  }, [unaddedRewards]);

  const handleAddReward = (rewardId: string) => {
    const point_required = points[rewardId];
    addRewardMutation.mutate(
      { rewardId, point_required },
      {
        onSuccess: () => {
          toast.success('Reward added successfully!');
          onClose();
        },
        onError: () => {
          toast.error('Failed to add reward.');
        },
      }
    );
  };

  const handlePointsChange = (rewardId: string, value: string) => {
    setPoints((prev) => ({ ...prev, [rewardId]: Number(value) }));
  };

  return (
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
                      <span className="font-medium text-xs">Recommended Points:</span>
                      <span className='text-xs'>{reward.points_required}</span>
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
                    {addRewardMutation.isPending ? 'Adding...' : 'Add Reward'}
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        </div>

        <div className="mt-6 text-center">
          <p className="text-sm text-gray-500 mb-2">Want full control?</p>
          <Button variant="secondary" onClick={onCreateFromScratch}>
            Create a Reward from Scratch
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
