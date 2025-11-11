"use client";

import React, { useState, useMemo } from "react";
import CampaignCard from "../components/campaignCard";
import { DEMO_AVAILABLE_CAMPAIGNS, DEMO_WISHLIST_PREFERENCES } from "@/app/(customer)/data/customerDemoData";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";
import { Filter } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function AvailableCampaignsPage() {
  const [campaigns, setCampaigns] = useState(DEMO_AVAILABLE_CAMPAIGNS);
  const [filter, setFilter] = useState("All");

  const handleJoinCampaign = (id: number) => {
    setCampaigns((prev) =>
      prev.map((c) =>
        c.id === id ? { ...c, joined: true, status: "Active" } : c
      )
    );
    toast.success("Campaign joined successfully!");
  };

  // Filter campaigns based on selected reward type
  const filteredCampaigns = useMemo(() => {
    if (filter === "All") return campaigns;
    return campaigns.filter((c) => c.rewardType === filter);
  }, [filter, campaigns]);

  // Recommended campaigns (based on wishlist)
  const recommended = useMemo(() => {
    return campaigns.filter((c) =>
      DEMO_WISHLIST_PREFERENCES.rewardPreferences.includes(c.rewardType)
    );
  }, [campaigns]);

  return (
    <div className="p-6 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">
            🌟 Available Campaigns
          </h2>
          <p className="text-gray-500 text-sm">
            Discover campaigns you can join and start earning rewards!
          </p>
        </div>

        {/* Filter Dropdown */}
        <div className="flex items-center gap-2">
          <Filter className="text-gray-500 w-4 h-4" />
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="border border-gray-300 rounded-md p-2 text-sm focus:ring-2 focus:ring-orange-500"
          >
            <option value="All">All</option>
            <option value="Discount">Discounts</option>
            <option value="Gift Voucher">Gift Vouchers</option>
            <option value="Free Drink">Free Drinks</option>
            <option value="Bonus Points">Bonus Points</option>
            <option value="Free Session">Free Sessions</option>
          </select>
        </div>
      </div>

      {/* Recommended Section */}
      {recommended.length > 0 && (
        <div>
          <h3 className="text-lg font-semibold text-gray-800 mb-3 flex items-center gap-2">
            💡 Recommended for You
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {recommended.map((campaign) => (
              <motion.div
                key={campaign.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
              >
                <CampaignCard
                  campaign={campaign}
                  mode="available"
                  onJoin={handleJoinCampaign}
                />
              </motion.div>
            ))}
          </div>
        </div>
      )}

      {/* All Campaigns Section */}
      <div className="flex justify-between items-center mt-8">
        <h3 className="text-lg font-semibold text-gray-800">
          🎯 All Campaigns
        </h3>
        {filter !== "All" && (
          <Button
            variant="outline"
            size="sm"
            onClick={() => setFilter("All")}
          >
            Clear Filter
          </Button>
        )}
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={filter}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3 }}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mt-4"
        >
          {filteredCampaigns.length === 0 ? (
            <p className="text-gray-500 text-sm">No campaigns found.</p>
          ) : (
            filteredCampaigns.map((campaign) => (
              <CampaignCard
                key={campaign.id}
                campaign={campaign}
                mode="available"
                onJoin={handleJoinCampaign}
              />
            ))
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
