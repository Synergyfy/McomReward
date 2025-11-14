"use client";

import React, { useState } from "react";
import { DEMO_CAMPAIGNS } from "@/app/(customer)/data/customerDemoData";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import CampaignCard from "../components/campaignCard";

export default function MyCampaignsPage() {
  const [filter, setFilter] = useState<"All" | "Active" | "Completed" | "Expired">("All");

  const filteredCampaigns =
    filter === "All"
      ? DEMO_CAMPAIGNS
      : DEMO_CAMPAIGNS.filter((c) => c.status === filter);

  const handleClaimReward = (id: number) => {
    toast.success(`Reward successfully claimed for campaign #${id}`);
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-wrap justify-between items-center gap-4">
        <h2 className="text-2xl font-bold text-gray-800">🎯 My Campaigns</h2>

        <div className="flex gap-2">
          {["All", "Active", "Completed", "Expired"].map((status) => (
            <Button
              key={status}
              size="sm"
              variant={filter === status ? "default" : "outline"}
              onClick={() => setFilter(status as typeof filter)}
              className={
                filter === status
                  ? "bg-orange-500 text-white font-medium"
                  : "border-gray-300 text-gray-700"
              }
            >
              {status}
            </Button>
          ))}
        </div>
      </div>

      {/* Campaign List */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredCampaigns.length === 0 ? (
          <p className="text-gray-500 text-sm">No campaigns found.</p>
        ) : (
          filteredCampaigns.map((campaign) => (
            <CampaignCard
              key={campaign.id}
              campaign={campaign}
              onClaim={handleClaimReward}
            />
          ))
        )}
      </div>
    </div>
  );
}
