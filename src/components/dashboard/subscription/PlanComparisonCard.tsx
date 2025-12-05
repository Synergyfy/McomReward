'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from '@/components/ui/button';
import { Check, Loader2 } from 'lucide-react';
import { Plan } from '@/lib/mock-data/subscription';
import { useJoinTrial } from '@/services/payment/hook';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';

interface PlanComparisonCardProps {
  plan: Plan;
  onChoosePlan: (plan: Plan) => void;
}

export default function PlanComparisonCard({ plan, onChoosePlan }: PlanComparisonCardProps) {
  const router = useRouter();
  const [isStartingTrial, setIsStartingTrial] = useState(false);
  const { mutate: joinTrial } = useJoinTrial();

  const handleStartTrial = () => {
    setIsStartingTrial(true);

    joinTrial(
      { tier_id: plan.id },
      {
        onSuccess: (data) => {
          toast.success(`Trial started successfully! Your trial expires on ${new Date(data.expiresAt).toLocaleDateString()}`);
          // Refresh the page to show updated subscription
          router.refresh();
        },
        onError: (error) => {
          console.error("Trial join failed:", error);
          toast.error("Failed to start trial. Please try again or contact support.");
          setIsStartingTrial(false);
        }
      }
    );
  };

  return (
    <Card className={plan.isCurrent ? 'border-2 border-orange-500' : ''}>
      <CardHeader>
        <CardTitle className="text-2xl font-bold">{plan.name}</CardTitle>
        <p className="text-3xl font-extrabold">{plan.price}</p>
      </CardHeader>
      <CardContent className="space-y-4">
        <ul className="space-y-2">
          {plan.features.map((feature, index) => (
            <li key={index} className="flex items-center">
              <Check className="h-5 w-5 text-green-500 mr-2" />
              <span>{feature}</span>
            </li>
          ))}
        </ul>
      </CardContent>
      <CardFooter className="flex flex-col gap-2">
        <Button
          className="w-full"
          disabled={plan.isCurrent}
          onClick={() => onChoosePlan(plan)}
        >
          {plan.isCurrent ? 'Current Plan' : 'Choose Plan'}
        </Button>

        {!plan.isCurrent && (
          <Button
            variant="outline"
            className="w-full"
            disabled={isStartingTrial}
            onClick={handleStartTrial}
          >
            {isStartingTrial && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {isStartingTrial ? 'Starting Trial...' : 'Start Trial'}
          </Button>
        )}
      </CardFooter>
    </Card>
  );
}
