'use client';

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from '@/components/ui/button';
import { Check } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface Plan {
  id: string;
  name: string;
  price: string;
  features: string[];
  isCurrent: boolean;
}

interface PlanComparisonCardProps {
  plan: Plan;
  onChoosePlan: (plan: Plan) => void;
  billingCycle: 'annual' | 'quarterly';
}

export default function PlanComparisonCard({ plan, onChoosePlan, billingCycle }: PlanComparisonCardProps) {
  const router = useRouter();

  const handleStartTrial = () => {
    // Redirect to checkout with trial flag and selected billing cycle
    router.push(`/checkout?plan=${encodeURIComponent(plan.id)}&billing=${billingCycle}&isTrial=true`);
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
            onClick={handleStartTrial}
          >
            Start Trial
          </Button>
        )}
      </CardFooter>
    </Card>
  );
}
