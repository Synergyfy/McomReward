import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Check } from 'lucide-react';
import { Tier } from '@/lib/mock-data/tiers';

interface TierBenefitsProps {
  tiers: Tier[];
  currentTierName: string;
}

export default function TierBenefits({ tiers, currentTierName }: TierBenefitsProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>All Tier Benefits</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {tiers.map(tier => (
            <div key={tier.name} className={`p-4 rounded-lg ${tier.name === currentTierName ? 'bg-orange-100 border border-orange-300' : 'bg-gray-50'}`}>
              <h3 className="font-bold text-lg mb-2">{tier.name}</h3>
              <ul className="space-y-2">
                {tier.benefits.map((benefit, index) => (
                  <li key={index} className="flex items-center text-sm">
                    <Check className="h-4 w-4 text-green-500 mr-2 flex-shrink-0" />
                    <span>{benefit}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
