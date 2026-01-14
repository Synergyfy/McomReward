'use client';

import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { MatchingPointReward } from '@/services/matching-points/types';
import { Loader2, Lock, Unlock, CheckCircle } from 'lucide-react';
import { toast } from 'sonner';
import { Progress } from "@/components/ui/progress";
import { useRedeemMatchingReward } from '@/services/matching-points/hook';

interface RewardDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  reward: MatchingPointReward | null;
  currentBalance: number;
}

export default function RewardDetailsModal({ isOpen, onClose, reward, currentBalance }: RewardDetailsModalProps) {
  const { mutate: redeemReward, isPending: loading } = useRedeemMatchingReward();
  const [redeemed, setRedeemed] = useState(false);

  if (!reward) return null;

  // Handle both naming conventions (backend vs frontend alias)
  const pointsRequired = reward.required_points || reward.pointsRequired || 0;
  const image = reward.main_image || reward.image || '';

  const canRedeem = currentBalance >= pointsRequired;
  const progress = Math.min((currentBalance / pointsRequired) * 100, 100);

  const handleRedeem = () => {
    redeemReward(reward.id, {
        onSuccess: () => {
            setRedeemed(true);
            toast.success(`Successfully redeemed ${reward.title}!`);
        },
        onError: (error: any) => {
            const msg = error?.response?.data?.message || 'Redemption failed';
            toast.error(msg);
        }
    });
  };

  const handleClose = () => {
    setRedeemed(false); // Reset state
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[600px]">
        {redeemed ? (
           <div className="flex flex-col items-center justify-center py-10 text-center space-y-4">
              <div className="h-16 w-16 bg-green-100 rounded-full flex items-center justify-center text-green-600">
                  <CheckCircle className="h-10 w-10" />
              </div>
              <h2 className="text-2xl font-bold text-gray-800">Redemption Successful!</h2>
              <p className="text-gray-600 max-w-md">
                You have successfully redeemed <strong>{reward.title}</strong>. Check your email for further instructions.
              </p>
              <Button onClick={handleClose} className="mt-4">
                Close
              </Button>
           </div>
        ) : (
          <>
            <DialogHeader>
              <DialogTitle className="text-xl">Redeem Reward</DialogTitle>
            </DialogHeader>

            <div className="space-y-6">
              {/* Image */}
              <div className="h-56 w-full rounded-lg overflow-hidden bg-gray-100">
                {image ? (
                   <img src={image} alt={reward.title} className="w-full h-full object-cover" />
                ) : (
                   <div className="w-full h-full flex items-center justify-center text-gray-400">No Image</div>
                )}
              </div>

              {/* Title & Desc */}
              <div className="space-y-2">
                 <h2 className="text-2xl font-bold">{reward.title}</h2>
                 <p className="text-gray-600">{reward.long_description || reward.short_description}</p>
              </div>

              {/* Progress/Requirements */}
              <div className="bg-gray-50 p-4 rounded-lg space-y-3">
                 <div className="flex justify-between items-center text-sm font-medium">
                    <span className="text-gray-500">Requirements</span>
                    <span className={canRedeem ? "text-green-600" : "text-gray-600"}>
                        {currentBalance} / {pointsRequired} Points
                    </span>
                 </div>
                 <Progress
                    value={progress}
                    className={`h-3 ${canRedeem ? 'bg-green-100' : 'bg-gray-200'}`}
                    indicatorClassName={canRedeem ? 'bg-green-500' : 'bg-indigo-500'}
                 />
                 {!canRedeem && (
                    <p className="text-xs text-red-500 flex items-center gap-1">
                        <Lock className="h-3 w-3" />
                        You need {pointsRequired - currentBalance} more points to redeem this reward.
                    </p>
                 )}
                 {canRedeem && (
                    <p className="text-xs text-green-600 flex items-center gap-1">
                        <Unlock className="h-3 w-3" />
                        You are eligible to redeem this reward!
                    </p>
                 )}
              </div>
            </div>

            <DialogFooter className="mt-6">
              <Button variant="outline" onClick={handleClose} disabled={loading}>
                Cancel
              </Button>
              <Button onClick={handleRedeem} disabled={!canRedeem || loading} className={canRedeem ? "bg-green-600 hover:bg-green-700" : ""}>
                {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {loading ? 'Redeeming...' : 'Redeem Reward'}
              </Button>
            </DialogFooter>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
