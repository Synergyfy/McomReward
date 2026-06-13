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

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Sparkles } from 'lucide-react';
import SeasonalPricingCard from '@/components/pricing/seasonal-pricing-card';

type PlanFrequency = 'quarterly' | 'annually';

export default function SubscriptionPage() {
  const router = useRouter();
  const [autoRenew, setAutoRenew] = useState(true);
  const [planFrequency, setPlanFrequency] = useState<PlanFrequency>('quarterly');


  const { data: tiersData, isLoading: isLoadingTiers, isError: isErrorTiers } = useGetTiers();
  const { data: subscription, isLoading: isLoadingSubscription, isError: isErrorSubscription } = useGetMySubscription();
  const { data: billingHistory, isLoading: isLoadingHistory, isError: isErrorHistory } = useGetBillingHistory();

  const currentSubscriptionTier = useMemo(() => subscription?.tier, [subscription]);

  const plans: Plan[] = useMemo(() => {
    if (!tiersData) return [];
    return tiersData.filter(t => {
      const type = (t.type || '').toLowerCase().trim();
      // Only include standard plans here
      return type === 'standard' || type === '';
    }).map(tier => {
      let price;
      switch (planFrequency) {
        case 'quarterly':
          price = tier.quarterlyPrice ? `£${tier.quarterlyPrice}/qu` : 'N/A';
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

  const seasonalPlans = useMemo(() => {
    if (!tiersData) return [];
    return tiersData.filter(t => {
      const type = (t.type || '').toLowerCase().trim();
      const status = (t.status || '').toLowerCase().trim();
      const isVisible = status === 'published' || status === 'draft' || status === '';
      return type === 'seasonal' && isVisible;
    }).map(t => ({
      ...t,
      // Ensure features is always an array
      features: t.features || [],
      // Ensure properties needed for SeasonalPricingCard are present
      startDate: t.startDate,
      endDate: t.endDate,
      fixedPrice: t.fixedPrice,
      colorCode: t.colorCode,
    }));
  }, [tiersData]);

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
              {subscription.planType === 'quarterly' && currentSubscriptionTier.quarterlyPrice && `£${currentSubscriptionTier.quarterlyPrice}/qu`}
              {subscription.planType === 'annually' && currentSubscriptionTier.annualPrice && `£${currentSubscriptionTier.annualPrice}/yr`}
            </p>
            <p className="text-sm text-gray-600">Next renewal date: {new Date(subscription.expiresAt).toLocaleDateString()}</p>
          </CardContent>
        </Card>
      )}

      {/* Plan Comparison Section */}
      <Tabs defaultValue="standard" className="w-full">
        <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
          <TabsList className="grid w-full md:w-[400px] grid-cols-2">
            <TabsTrigger value="standard">Standard Plans</TabsTrigger>
            <TabsTrigger value="seasonal" className="flex items-center gap-2">
              Seasonal Offers <Sparkles className="h-3 w-3 text-amber-500" />
            </TabsTrigger>
          </TabsList>

          <TabsContent value="standard" className="mt-0">
            <RadioGroup
              defaultValue="quarterly"
              onValueChange={handleFrequencyChange}
              className="flex space-x-4"
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="quarterly" id="quarterly" />
                <Label htmlFor="quarterly">Quarterly</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="annually" id="annually" />
                <Label htmlFor="annually">Annually</Label>
              </div>
            </RadioGroup>
          </TabsContent>
        </div>

        <TabsContent value="standard">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {plans.map(plan => (
              <PlanComparisonCard
                key={plan.id}
                plan={plan}
                onChoosePlan={handleChoosePlan}
                billingCycle={planFrequency === 'annually' ? 'annual' : 'quarterly'}
              />
            ))}
            {plans.length === 0 && (
              <div className="col-span-3 text-center py-10 text-gray-500">
                No standard plans available.
              </div>
            )}
          </div>
        </TabsContent>

        <TabsContent value="seasonal">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 justify-center">
            {seasonalPlans.map((tier) => (
              <SeasonalPricingCard
                key={tier.id}
                tier={tier}
              />
            ))}
          </div>
          {seasonalPlans.length === 0 && (
            <div className="text-center py-12 text-gray-500">
              <p>No seasonal offers available at the moment.</p>
            </div>
          )}
        </TabsContent>
      </Tabs>

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

