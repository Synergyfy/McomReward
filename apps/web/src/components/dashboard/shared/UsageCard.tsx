import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { TierUsageFeature } from '@/services/business/types';

interface UsageCardProps {
  title: string;
  usage: TierUsageFeature;
}

const UsageCard: React.FC<UsageCardProps> = ({ title, usage }) => {
  const isUnlimited = usage.limit === -1;
  const percentage = usage.limit > 0 ? Math.min((usage.used / usage.limit) * 100, 100) : 0;

  // Determine color based on usage percentage
  let progressColorClass = "bg-green-500";
  if (!isUnlimited) {
    if (percentage >= 90) {
      progressColorClass = "bg-red-500";
    } else if (percentage >= 70) {
      progressColorClass = "bg-yellow-500";
    }
  }

  return (
    <Card className="mb-4 shadow-sm border-l-4 border-l-orange-500">
      <CardContent className="p-4">
        <div className="flex flex-col space-y-1.5">
          <div className="flex justify-between items-center mb-0.5">
            <h3 className="font-semibold text-sm text-gray-800">{title}</h3>
            <span className="text-xs font-medium text-gray-500">
              {isUnlimited ? `${usage.used} / Unlimited` : `${usage.used} / ${usage.limit} Used`}
            </span>
          </div>

          <div className="w-full bg-gray-200 rounded-full h-1.5 overflow-hidden">
             <div
               className={`h-1.5 rounded-full ${progressColorClass}`}
               style={{ width: `${percentage}%` }}
             ></div>
          </div>

          <div className="flex justify-between items-center text-xs pt-0.5">
             <span className="text-gray-400">
                {isUnlimited ? 'Unlimited' : `${percentage.toFixed(0)}% used`}
             </span>
             <span className="font-bold text-orange-600">
                {isUnlimited ? 'Unlimited' : `${usage.remaining} Left`}
             </span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default UsageCard;
