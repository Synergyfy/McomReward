
'use client';

import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import Image from 'next/image';
import { templateRewards } from '@/lib/mock-data/template-rewards';
import { Reward } from '@/app/dashboard/rewards/page';

interface ClaimRewardModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectReward: (reward: Reward) => void;
  onCreateFromScratch: () => void;
}

export default function ClaimRewardModal({
  isOpen,
  onClose,
  onSelectReward,
  onCreateFromScratch,
}: ClaimRewardModalProps) {
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
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {templateRewards.map((reward) => (
              <Card key={reward.id} className="flex flex-col">
                <CardHeader>
                  <div className="relative w-full h-32 rounded-t-lg overflow-hidden bg-gray-200 mb-4">
                    {reward.image && (
                      <Image
                        src={reward.image}
                        alt={reward.name}
                        layout="fill"
                        objectFit="cover"
                      />
                    )}
                  </div>
                  <CardTitle className="text-lg">{reward.name}</CardTitle>
                </CardHeader>
                <CardContent className="flex-grow">
                  <p className="text-sm text-gray-600 mb-3 h-20 overflow-hidden">{reward.description}</p>
                  <div className="space-y-1 text-xs">
                    <div className="flex justify-between">
                      <span className="font-medium">Type:</span>
                      <span>{reward.type}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="font-medium">Value:</span>
                      <span>£{reward.value}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="font-medium">Points:</span>
                      <span>{reward.pointsRequired}</span>
                    </div>
                  </div>
                </CardContent>
                <CardFooter>
                  <Button
                    className="w-full"
                    onClick={() => onSelectReward(reward)}
                  >
                    Select & Edit
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
