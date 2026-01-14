'use client';

import React from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { MatchingPointReward } from '@/services/matching-points/types';
import { Lock, Unlock } from 'lucide-react';

interface MatchingRewardCardProps {
  reward: MatchingPointReward;
  currentBalance: number;
  onClick: () => void;
}

export default function MatchingRewardCard({ reward, currentBalance, onClick }: MatchingRewardCardProps) {
  // Map fields (backend snake_case vs possible frontend aliases)
  const pointsRequired = reward.required_points || reward.pointsRequired || 0;
  const image = reward.main_image || reward.image || '';

  const progress = pointsRequired > 0 ? Math.min((currentBalance / pointsRequired) * 100, 100) : 100;
  const isRedeemable = currentBalance >= pointsRequired;

  return (
    <Card
      className={`overflow-hidden cursor-pointer transition-all hover:shadow-lg ${isRedeemable ? 'border-green-200' : 'opacity-90'}`}
      onClick={onClick}
    >
      <div className="h-40 bg-gray-100 relative">
        {image ? (
          <img src={image} alt={reward.title} className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-gray-400">No Image</div>
        )}
        <div className="absolute top-2 right-2">
            {isRedeemable ? (
                <Badge className="bg-green-500 hover:bg-green-600 gap-1">
                    <Unlock className="h-3 w-3" /> Redeemable
                </Badge>
            ) : (
                <Badge variant="secondary" className="bg-gray-200/90 gap-1 text-gray-700">
                    <Lock className="h-3 w-3" /> {pointsRequired - currentBalance} pts needed
                </Badge>
            )}
        </div>
      </div>
      <CardContent className="p-4 space-y-3">
        <div className="space-y-1">
            <h3 className="font-bold text-lg leading-tight">{reward.title}</h3>
            <p className="text-sm text-gray-500 line-clamp-2">{reward.short_description || reward.long_description || ''}</p>
        </div>

        <div className="space-y-1">
            <div className="flex justify-between text-xs font-medium">
                <span className={isRedeemable ? 'text-green-600' : 'text-gray-500'}>
                    {isRedeemable ? 'Goal Reached!' : 'Progress'}
                </span>
                <span>{Math.floor(progress)}%</span>
            </div>
            <Progress value={progress} className={`h-2 ${isRedeemable ? 'bg-green-100' : 'bg-gray-100'}`} indicatorClassName={isRedeemable ? 'bg-green-500' : 'bg-indigo-500'} />
            <div className="flex justify-between text-xs text-gray-400 mt-1">
                <span>{currentBalance} pts</span>
                <span>{pointsRequired} pts</span>
            </div>
        </div>
      </CardContent>
    </Card>
  );
}
