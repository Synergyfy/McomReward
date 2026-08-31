'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { CheckCircle2, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { McomPlan } from '@/services/mcom-packages';

interface PlanCardProps {
  plan: McomPlan;
  billingCycle: 'monthly' | 'quarterly' | 'annual';
  isCurrent?: boolean;
  onChoosePlan: (plan: McomPlan) => void;
}

export default function PlanCard({
  plan,
  billingCycle,
  isCurrent = false,
  onChoosePlan,
}: PlanCardProps) {
  const isRecommended =
    plan.name.toLowerCase().includes('pro') ||
    plan.name.toLowerCase().includes('silver') ||
    plan.name.toLowerCase().includes('standard');

  const price = React.useMemo(() => {
    if (plan.type === 'TRIAL') return 'Free';
    switch (billingCycle) {
      case 'annual':
        return `£${Number(plan.annualPrice || 0).toFixed(2)}`;
      case 'quarterly':
        return `£${Number(plan.quarterlyPrice || 0).toFixed(2)}`;
      case 'monthly':
      default:
        return `£${Number(plan.monthlyPrice || 0).toFixed(2)}`;
    }
  }, [plan, billingCycle]);

  const cycleText = React.useMemo(() => {
    if (plan.type === 'TRIAL') return `for ${plan.trialDuration || 14} days`;
    switch (billingCycle) {
      case 'annual':
        return '/ year';
      case 'quarterly':
        return '/ quarter';
      case 'monthly':
      default:
        return '/ month';
    }
  }, [plan, billingCycle]);

  return (
    <motion.div
      whileHover={{ y: -5 }}
      transition={{ duration: 0.2 }}
      className={`relative rounded-2xl shadow-lg h-full flex flex-col transition-all ${
        isRecommended
          ? 'border-2 border-orange-500 shadow-orange-500/10'
          : 'border border-gray-200'
      }`}
    >
      {isRecommended && (
        <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-gradient-to-r from-orange-600 to-amber-600 text-white text-xs font-black tracking-wider px-3.5 py-1 rounded-full uppercase shadow-sm flex items-center gap-1">
          <Sparkles size={12} />
          <span>Recommended</span>
        </div>
      )}

      {isCurrent && (
        <div className="absolute -top-3 right-4 bg-green-600 text-white text-xs font-bold px-3 py-1 rounded-full uppercase">
          Current Plan
        </div>
      )}

      <Card className="h-full flex flex-col border-none shadow-none rounded-2xl">
        <CardHeader className="text-center pt-8 pb-4">
          <CardTitle className="text-2xl font-black text-gray-900">{plan.name}</CardTitle>
          {plan.description && (
            <p className="text-gray-500 text-xs mt-1 max-w-[240px] mx-auto line-clamp-2">
              {plan.description}
            </p>
          )}
          <div className="my-4">
            <span className="text-4xl font-black text-gray-900 tracking-tight">{price}</span>
            <span className="text-gray-500 text-sm font-medium ml-1.5">{cycleText}</span>
          </div>
        </CardHeader>

        <CardContent className="flex flex-col flex-1 px-6 pb-6">
          <div className="border-t border-gray-100 pt-4 mb-6 flex-1">
            <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">
              Included Capabilities
            </p>
            <ul className="space-y-3 text-gray-700 text-sm">
              {plan.features?.map((feature, index) => (
                <li key={index} className="flex items-start gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-orange-500 flex-shrink-0 mt-0.5" />
                  <span className="leading-snug">{feature}</span>
                </li>
              ))}
              {(!plan.features || plan.features.length === 0) && (
                <li className="text-gray-400 text-xs italic">All standard platform features</li>
              )}
            </ul>
          </div>

          <Button
            onClick={() => onChoosePlan(plan)}
            disabled={isCurrent}
            className={`w-full mt-auto py-6 rounded-xl font-bold transition-all shadow-md ${
              isCurrent
                ? 'bg-gray-200 text-gray-500 cursor-not-allowed shadow-none'
                : isRecommended
                ? 'bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-700 hover:to-amber-700 text-white shadow-orange-600/25 hover:shadow-lg'
                : 'bg-gray-900 hover:bg-black text-white'
            }`}
          >
            {isCurrent
              ? 'Current Plan'
              : plan.type === 'TRIAL'
              ? 'Start Free Trial'
              : 'Upgrade to ' + plan.name}
          </Button>
        </CardContent>
      </Card>
    </motion.div>
  );
}
