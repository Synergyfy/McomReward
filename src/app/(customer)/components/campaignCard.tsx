"use client";

import React, { useState } from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Gift, Store, Timer, Star } from "lucide-react";
import { toast } from "sonner";
import { Campaign, CampaignCardProps } from "@/app/(customer)/type";
import JoinCampaignModal from "@/app/(customer)/components/model/JoinCampaignModal";

export default function CampaignCard({
  campaign,
  mode = "my",
  onClaim,
  onJoin,
}: CampaignCardProps) {
  const [joinOpen, setJoinOpen] = useState(false);

  const statusColors: Record<Campaign["status"], string> = {
    Active: "bg-green-100 text-green-700",
    Completed: "bg-blue-100 text-blue-700",
    Expired: "bg-gray-100 text-gray-700",
    Available: "bg-orange-100 text-orange-700",
  };

  const handleClaim = () => {
    onClaim?.(campaign.id);
    toast.success(`🎉 Reward claimed for "${campaign.title}"`);
  };

  // 🔹 Called after the modal confirms signup success
  const handleJoinSuccess = () => {
    setJoinOpen(false);
    onJoin?.(campaign.id);
    toast.success(`🎯 You successfully joined "${campaign.title}"!`);
  };

  return (
    <Card className="group relative border border-gray-100 rounded-2xl overflow-hidden shadow-md hover:shadow-lg transition-all duration-300 bg-gradient-to-br from-orange-50 to-white">
      {/* Status Badge */}
      <div className="absolute top-3 right-3">
        <Badge className={`${statusColors[campaign.status]} text-xs`}>
          {campaign.status}
        </Badge>
      </div>

      {/* Header */}
      <CardHeader className="p-4">
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-xl bg-orange-100 text-orange-600">
            <Gift className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-semibold text-gray-800 leading-tight">
              {campaign.title}
            </h3>
            <p className="text-xs text-gray-500 flex items-center gap-1">
              <Store className="w-3 h-3" /> {campaign.business}
            </p>
          </div>
        </div>
      </CardHeader>

      {/* Content */}
      <CardContent className="p-4 space-y-3">
        <div className="flex justify-between text-sm text-gray-600">
          <span>Reward:</span>
          <span className="font-medium text-gray-700">
            {campaign.rewardType}
          </span>
        </div>
        <div className="flex justify-between text-sm text-gray-600">
          <span>Points:</span>
          <span className="font-semibold text-orange-600 flex items-center gap-1">
            <Star className="w-4 h-4 fill-orange-400 text-orange-400" />{" "}
            {campaign.points}
          </span>
        </div>
        <div className="flex justify-between text-sm text-gray-600">
          <span>Expires:</span>
          <span className="flex items-center gap-1 text-gray-700">
            <Timer className="w-4 h-4 text-gray-400" />
            {campaign.expiryDate}
          </span>
        </div>

        {/* Action Buttons */}
        {mode === "my" && campaign.status === "Completed" && (
          <Button
            onClick={handleClaim}
            className="w-full bg-orange-500 hover:bg-orange-600 text-white rounded-xl mt-3 font-medium"
          >
            Claim Reward
          </Button>
        )}

        {mode === "available" && (
          <Button
            onClick={() => setJoinOpen(true)}
            disabled={campaign.joined}
            className={`w-full mt-3 rounded-xl font-medium ${
              campaign.joined
                ? "bg-gray-300 text-gray-600 cursor-not-allowed"
                : "bg-orange-500 hover:bg-orange-600 text-white"
            }`}
          >
            {campaign.joined ? "Already Joined" : "Join Campaign"}
          </Button>
        )}
      </CardContent>

      {/* Decorative bar */}
      <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-orange-400 to-orange-600" />

      {/* 🎯 Join Campaign Modal */}
      <JoinCampaignModal
        open={joinOpen}
        onOpenChange={setJoinOpen}
        campaignTitle={campaign.title}
        onSuccess={handleJoinSuccess} // ✅ add this prop
      />
    </Card>
  );
}
