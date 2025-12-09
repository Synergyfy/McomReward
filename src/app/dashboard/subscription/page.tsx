'use client';

import React, { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import PlanComparisonCard from '@/components/dashboard/subscription/PlanComparisonCard';
import BillingHistoryTable from '@/components/dashboard/subscription/BillingHistoryTable';
import DashboardPointPackages from '@/components/dashboard/subscription/DashboardPointPackages';
import { useGetTiers, useGetMySubscription, useGetBillingHistory } from '@/services/tiers/hook';
import { TierResponse } from '@/services/tiers/types';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Plan } from '@/types';

type PlanFrequency = 'monthly' | 'quarterly' | 'annually';

export default function SubscriptionPage() {
  const router = useRouter();
  const [autoRenew, setAutoRenew] = useState(true);
  const [planFrequency, setPlanFrequency] = useState<PlanFrequency>('monthly');


  const { data: tiersData, isLoading: isLoadingTiers, isError: isErrorTiers } = useGetTiers();
  const { data: subscription, isLoading: isLoadingSubscription, isError: isErrorSubscription } = useGetMySubscription();
  const { data: billingHistory, isLoading: isLoadingHistory, isError: isErrorHistory } = useGetBillingHistory();

  const currentSubscriptionTier = useMemo(() => subscription?.tier, [subscription]);

  const plans: Plan[] = useMemo(() => {
    if (!tiersData) return [];
    return tiersData.map(tier => {
      let price;
      switch (planFrequency) {
        case 'monthly':
          price = tier.monthlyPrice ? `£${tier.monthlyPrice}/mo` : 'N/A';
          break;
        case 'quarterly':
          price = tier.quaterlyPrice ? `£${tier.quaterlyPrice}/qu` : 'N/A';
          break;
        case 'annually':
          price = tier.annualPrice ? `£${tier.annualPrice}/yr` : 'N/A';
          break;
        default:
          price = 'N/A';
      }
      return {
        id: tier.id,
        name: tier.name,
        price,
        isCurrent: tier.id === currentSubscriptionTier?.id,
        features: tier.features || [],
      };
    });
  }, [tiersData, currentSubscriptionTier, planFrequency]);

  const handleChoosePlan = (plan: Plan) => {
    if (plan.isCurrent) return;
    const billingCycle = planFrequency === 'annually' ? 'annual' : 'quarterly';
    router.push(`/checkout?plan=${plan.name}&billing=${billingCycle}`);
  };

  const handleFrequencyChange = (value: PlanFrequency) => {
    setPlanFrequency(value);
  };

  if (isLoadingTiers || isLoadingSubscription) {
    return <div className="flex justify-center items-center h-screen"><p>Loading...</p></div>;
  }

  if (isErrorTiers || isErrorSubscription) {
    return <div className="flex justify-center items-center h-screen"><p>Error loading subscription data.</p></div>;
  }

  return (
    <div className="space-y-8">
      <h1 className="text-3xl font-bold text-gray-800">Membership & Billing</h1>

      {/* Current Plan Section */}
      {subscription && currentSubscriptionTier && (
        <Card className="bg-gray-50">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Your Current Plan: {currentSubscriptionTier.name}</CardTitle>
            <div className="flex items-center space-x-2">
              <Switch id="auto-renew" checked={autoRenew} onCheckedChange={setAutoRenew} />
              <Label htmlFor="auto-renew">Auto-renew</Label>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-lg font-semibold">
              {subscription.planType === 'monthly' && currentSubscriptionTier.monthlyPrice && `£${currentSubscriptionTier.monthlyPrice}/mo`}
              {subscription.planType === 'quarterly' && currentSubscriptionTier.quaterlyPrice && `£${currentSubscriptionTier.quaterlyPrice}/qu`}
              {subscription.planType === 'annually' && currentSubscriptionTier.annualPrice && `£${currentSubscriptionTier.annualPrice}/yr`}
            </p>
            <p className="text-sm text-gray-600">Next renewal date: {new Date(subscription.expiresAt).toLocaleDateString()}</p>
          </CardContent>
        </Card>
      )}

      {/* Plan Comparison Section */}
      <div>
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold">Compare Plans</h2>
          <RadioGroup
            defaultValue="monthly"
            onValueChange={handleFrequencyChange}
            className="flex space-x-4"
          >
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="monthly" id="monthly" />
              <Label htmlFor="monthly">Monthly</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="quarterly" id="quarterly" />
              <Label htmlFor="quarterly">Quarterly</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="annually" id="annually" />
              <Label htmlFor="annually">Annually</Label>
            </div>
          </RadioGroup>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {plans.map(plan => (
            <PlanComparisonCard
              key={plan.id}
              plan={plan}
              onChoosePlan={handleChoosePlan}
              billingCycle={planFrequency === 'annually' ? 'annual' : 'quarterly'}
            />
          ))}
        </div>
      </div>

      {/* Point Packages Section */}
      <div className="pt-8 border-t border-border">
        <DashboardPointPackages />
      </div>

      {/* Billing History Section */}
      {isLoadingHistory && <p>Loading billing history...</p>}
      {isErrorHistory && <p>Error loading billing history.</p>}
      {billingHistory && <BillingHistoryTable history={billingHistory} />}

    </div>
  );
}

