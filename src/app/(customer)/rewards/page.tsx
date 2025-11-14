// app/(customer)/dashboard/rewards/page.tsx
"use client";

import { useState } from "react";
import RewardCard from "@/app/(customer)/components/RewardCard";
import { DEMO_REWARDS } from "@/app/(customer)/data/customerDemoData";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { DemoReward } from "../type";

export default function RewardRedemptionPage() {
  const [filter, setFilter] = useState<string>("All");
  const [claimedRewards, setClaimedRewards] = useState<number[]>([]);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [selectedReward, setSelectedReward] = useState<DemoReward | null>(null);

  const filteredRewards =
    filter === "All"
      ? DEMO_REWARDS
      : DEMO_REWARDS.filter((r) => r.type === filter);

  const handleClaimClick = (id: number) => {
    const reward = DEMO_REWARDS.find((r) => r.id === id);
    if (!reward) {
     setSelectedReward(null);
      return;
    }
    setSelectedReward(reward);
    setConfirmOpen(true);
  };

  const confirmClaim = () => {
    if (!selectedReward) return;

    setClaimedRewards((prev) => [...prev, selectedReward.id]);
    toast.success(
      `🎉 ${selectedReward.title} redeemed! Check your email for your voucher code.`
    );
    setConfirmOpen(false);
    setSelectedReward(null);
  };

  return (
    <div className="p-6 space-y-6 bg-white min-h-screen">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-800">
          Reward Redemption
        </h2>
        <Badge className="bg-orange-100 text-orange-600 border-none text-sm">
          {claimedRewards.length} Claimed
        </Badge>
      </div>

      {/* Filter Buttons */}
      <div className="flex flex-wrap gap-3">
        {["All", "Gift Card", "Voucher", "Discount", "Product"].map((type) => (
          <Button
            key={type}
            variant={filter === type ? "default" : "outline"}
            onClick={() => setFilter(type)}
            className={`${
              filter === type
                ? "bg-orange-500 text-white hover:bg-orange-600"
                : "text-gray-700 border-gray-200 hover:bg-gray-100"
            } rounded-full`}
          >
            {type}
          </Button>
        ))}
      </div>

      {/* Rewards Grid */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredRewards.map((reward) => (
          <RewardCard
            key={reward.id}
            reward={reward}
            onClaim={handleClaimClick}
            claimed={claimedRewards.includes(reward.id)}
          />
        ))}
      </div>

      {/* Claim Confirmation Modal */}
      <Dialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <DialogContent className="max-w-md rounded-2xl">
          <DialogHeader>
            <DialogTitle className="text-lg font-semibold">
              Confirm Redemption
            </DialogTitle>
            <DialogDescription>
              Are you sure you want to claim{" "}
              <span className="font-semibold text-orange-600">
                {selectedReward?.title}
              </span>
              ? This will deduct{" "}
              <strong>{selectedReward?.requiredPoints}</strong> points from your
              balance.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="flex justify-end gap-3 mt-4">
            <Button
              variant="outline"
              onClick={() => setConfirmOpen(false)}
              className="rounded-full"
            >
              Cancel
            </Button>
            <Button
              onClick={confirmClaim}
              className="bg-orange-500 hover:bg-orange-600 text-white rounded-full"
            >
              Confirm
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
