import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from '@/components/ui/button';
import { Check } from 'lucide-react';
import { Plan } from '@/lib/mock-data/subscription';

interface PlanComparisonCardProps {
  plan: Plan;
  onChoosePlan: (plan: Plan) => void;
}

export default function PlanComparisonCard({ plan, onChoosePlan }: PlanComparisonCardProps) {
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
      <CardFooter>
        <Button
          className="w-full"
          disabled={plan.isCurrent}
          onClick={() => onChoosePlan(plan)}
        >
          {plan.isCurrent ? 'Current Plan' : 'Choose Plan'}
        </Button>
      </CardFooter>
    </Card>
  );
}
