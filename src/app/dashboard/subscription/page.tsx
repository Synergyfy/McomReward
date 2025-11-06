'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import PlanComparisonCard from '@/components/dashboard/subscription/PlanComparisonCard';
import BillingHistoryTable from '@/components/dashboard/subscription/BillingHistoryTable';
import SubscriptionChangeModal from '@/components/dashboard/subscription/SubscriptionChangeModal';
import { subscriptionPlans as initialPlans, billingHistory, Plan } from '@/lib/mock-data/subscription';

export default function SubscriptionPage() {
  const [autoRenew, setAutoRenew] = useState(true);
  const [plans, setPlans] = useState(initialPlans);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [targetPlan, setTargetPlan] = useState<Plan | null>(null);

  const currentPlan = plans.find(plan => plan.isCurrent);

  const handleChoosePlan = (plan: Plan) => {
    setTargetPlan(plan);
    setIsModalOpen(true);
  };

  const handleConfirmChange = () => {
    if (targetPlan) {
      // Simulate plan change
      setPlans(plans.map(p => ({ ...p, isCurrent: p.id === targetPlan.id })))
    }
    setIsModalOpen(false);
    setTargetPlan(null);
    // In a real app, you would show a toast notification here
  };

  return (
    <div className="space-y-8">
      <h1 className="text-3xl font-bold text-gray-800">Membership & Billing</h1>

      {/* Current Plan Section */}
      {currentPlan && (
        <Card className="bg-gray-50">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Your Current Plan: {currentPlan.name}</CardTitle>
            <div className="flex items-center space-x-2">
              <Switch id="auto-renew" checked={autoRenew} onCheckedChange={setAutoRenew} />
              <Label htmlFor="auto-renew">Auto-renew</Label>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-lg font-semibold">{currentPlan.price}</p>
            <p className="text-sm text-gray-600">Next renewal date: 2025-12-01</p>
          </CardContent>
        </Card>
      )}

      {/* Plan Comparison Section */}
      <div>
        <h2 className="text-2xl font-bold mb-4">Compare Plans</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {plans.map(plan => (
            <PlanComparisonCard key={plan.id} plan={plan} onChoosePlan={handleChoosePlan} />
          ))}
        </div>
      </div>

      {/* Billing History Section */}
      <BillingHistoryTable history={billingHistory} />

      <SubscriptionChangeModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onConfirm={handleConfirmChange}
        currentPlan={currentPlan}
        targetPlan={targetPlan}
      />
    </div>
  );
}
