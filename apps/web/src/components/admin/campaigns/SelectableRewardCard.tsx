'use client';

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { RewardResponse } from "@/services/rewards/types";
import Image from "next/image";
import { CheckCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

interface SelectableRewardCardProps {
  reward: RewardResponse;
  isSelected: boolean;
  onSelect: (reward: RewardResponse) => void; // Changed to pass full reward object
}

export default function SelectableRewardCard({ reward, isSelected, onSelect }: SelectableRewardCardProps) {
  return (
    <Card
      className={cn(
        "relative overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300 rounded-2xl cursor-pointer",
        isSelected ? "border-2 border-orange-600 shadow-orange-300" : "border border-gray-200"
      )}
      onClick={() => onSelect(reward)} // Pass full reward object
    >
      {isSelected && (
        <div className="absolute top-2 right-2 z-10 text-orange-600">
          <CheckCircle className="h-6 w-6 fill-orange-600 text-white" />
        </div>
      )}
      <CardHeader className="p-0 relative h-32">
        <Image
          src={reward.image}
          alt={reward.title}
          layout="fill"
          objectFit="cover"
        />
      </CardHeader>
      <CardContent className="p-4 flex-grow">
        <CardTitle className="text-lg font-bold mb-1 truncate">{reward.title}</CardTitle>
        <p className="text-sm text-muted-foreground">Points: {reward.pointRequired}</p>
        <p className="text-sm text-muted-foreground">Value: ${reward.value}</p>
      </CardContent>
    </Card>
  );
}
