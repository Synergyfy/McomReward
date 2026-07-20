import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Trophy } from 'lucide-react';

interface RewardTier {
  level: number;
  referralsNeeded: number;
  description: string;
  reward: string;
}

interface RewardsLadderProps {
  tiers: RewardTier[];
}

export default function RewardsLadder({ tiers }: RewardsLadderProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Rewards Ladder</CardTitle>
      </CardHeader>
      <CardContent>
        <ul className="space-y-4">
          {tiers.map((tier) => (
            <li key={tier.level} className="flex items-start">
                <div className="flex-shrink-0">
                    <Trophy className="h-5 w-5 text-yellow-500 mr-3" />
                </div>
                <div>
                    <p className="font-semibold">{tier.reward}</p>
                    <p className="text-sm text-gray-600">{tier.description}</p>
                </div>
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  );
}
