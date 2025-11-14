// app/(customer)/dashboard/rewards/claimed/page.tsx
"use client";

import ClaimedRewardCard from "@/app/(customer)/components/ClaimedRewardCard";
import { DEMO_CLAIMED_REWARDS } from "@/app/(customer)/data/customerDemoData";

export default function MyClaimedRewardsPage() {
  return (
    <div className="p-6 bg-white min-h-screen space-y-6">
      <h2 className="text-2xl font-bold text-gray-800">
        My Claimed Rewards
      </h2>
      <p className="text-gray-500 text-sm">
        View all rewards you’ve successfully redeemed. You can scan the QR code or save the voucher.
      </p>

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 mt-4">
        {DEMO_CLAIMED_REWARDS.map((reward) => (
          <ClaimedRewardCard key={reward.id} reward={reward} />
        ))}
      </div>
    </div>
  );
}
