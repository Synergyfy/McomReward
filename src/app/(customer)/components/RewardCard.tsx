// app/(customer)/components/RewardCard.tsx
"use client";

import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Gift, Star, Shield, CheckCircle2 } from "lucide-react";

interface RewardCardProps {
  reward: {
    id: number;
    title: string;
    type: string;
    requiredPoints: number;
    badgeLevel: string;
    description: string;
  };
  onClaim: (id: number) => void;
  claimed?: boolean;
}

export default function RewardCard({ reward, onClaim, claimed }: RewardCardProps) {
  return (
    <Card className="relative group rounded-2xl border border-gray-100 shadow-md hover:shadow-lg transition-all duration-300 bg-gradient-to-br from-orange-50 to-white">
      <CardHeader className="flex items-center justify-between p-4">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-orange-100 rounded-xl text-orange-600">
            <Gift className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-800">{reward.title}</h3>
            <p className="text-xs text-gray-500">{reward.type}</p>
          </div>
        </div>
        <Badge variant="outline" className="text-xs bg-orange-100 text-orange-600 border-none">
          {reward.badgeLevel}
        </Badge>
      </CardHeader>

      <CardContent className="p-4 space-y-3 text-sm text-gray-700">
        <p>{reward.description}</p>

        <div className="flex justify-between items-center text-gray-600 mt-3">
          <span className="flex items-center gap-1">
            <Star className="w-4 h-4 fill-orange-400 text-orange-400" />{" "}
            {reward.requiredPoints} pts
          </span>
          <span className="flex items-center gap-1">
            <Shield className="w-4 h-4 text-gray-400" /> {reward.badgeLevel}
          </span>
        </div>

        <Button
          onClick={() => onClaim(reward.id)}
          disabled={claimed}
          className={`w-full mt-4 rounded-xl font-medium ${
            claimed
              ? "bg-gray-200 text-gray-600 cursor-not-allowed"
              : "bg-orange-500 hover:bg-orange-600 text-white"
          }`}
        >
          {claimed ? (
            <span className="flex items-center gap-1">
              <CheckCircle2 className="w-4 h-4" /> Claimed
            </span>
          ) : (
            "Claim Reward"
          )}
        </Button>
      </CardContent>
    </Card>
  );
}
