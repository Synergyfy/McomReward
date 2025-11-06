import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { CheckCircle, XCircle } from 'lucide-react';
import { Tier, TierRequirement } from '@/lib/mock-data/tiers';

interface TierProgressCardProps {
  currentTier: Tier;
  nextTier: Tier;
  progress: number;
}

export default function TierProgressCard({ currentTier, nextTier, progress }: TierProgressCardProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-2xl font-bold">Progress to {nextTier.name} Tier</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <Progress value={progress} className="w-full" />
        <p className="text-center text-lg font-medium">{progress}% Complete</p>
        <div>
          <h4 className="font-semibold mb-2">Requirements:</h4>
          <ul className="space-y-2">
            {nextTier.requirements.map(req => (
              <li key={req.id} className="flex items-center justify-between">
                <div className="flex items-center">
                  {req.current >= req.target ? (
                    <CheckCircle className="h-5 w-5 text-green-500 mr-2" />
                  ) : (
                    <XCircle className="h-5 w-5 text-red-500 mr-2" />
                  )}
                  <span>{req.description}</span>
                </div>
                <span className="font-mono text-sm">{req.current}/{req.target}</span>
              </li>
            ))}
          </ul>
        </div>
      </CardContent>
    </Card>
  );
}
