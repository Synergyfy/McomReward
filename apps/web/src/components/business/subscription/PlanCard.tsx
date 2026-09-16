'use client';

import React, { useMemo } from 'react';
import { motion } from 'framer-motion';
import { CheckCircle2, Sparkles, Zap, Rocket, Crown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { McomPlan, PlanVariantDto } from '@/services/mcom-packages';

interface PlanCardProps {
  plan: McomPlan;
  durationTab: 'STANDARD' | 'PRO' | 'PRO_PLUS';
  isCurrent?: boolean;
  onChoosePlan: (plan: McomPlan, variant?: PlanVariantDto) => void;
}

export default function PlanCard({
  plan,
  durationTab,
  isCurrent = false,
  onChoosePlan,
}: PlanCardProps) {
  // Resolve variant matching active duration tab
  const variant: PlanVariantDto | undefined = useMemo(() => {
    if (!plan.variants || plan.variants.length === 0) return undefined;
    return (
      plan.variants.find((v) => v.tierLevel?.toUpperCase() === durationTab) ||
      plan.variants[0]
    );
  }, [plan, durationTab]);

  const priceFormatted = useMemo(() => {
    if (variant) {
      return `£${Number(variant.price || 0).toFixed(2)}`;
    }
    switch (durationTab) {
      case 'PRO_PLUS':
        return `£${Number(plan.annualPrice || 0).toFixed(2)}`;
      case 'PRO':
        return `£${Number(plan.quarterlyPrice || 0).toFixed(2)}`;
      case 'STANDARD':
      default:
        return `£${Number(plan.monthlyPrice || 0).toFixed(2)}`;
    }
  }, [plan, variant, durationTab]);

  const durationSubtitle = useMemo(() => {
    if (durationTab === 'PRO_PLUS' || variant?.isCalendarYear) {
      return '1 calendar year access · billed once';
    }
    if (durationTab === 'PRO' || variant?.durationDays === 180) {
      return '180 days access · billed once';
    }
    return '90 days access · billed once';
  }, [durationTab, variant]);

  const tierBadgeLabel = useMemo(() => {
    if (durationTab === 'PRO_PLUS') return 'Pro+ (1yr)';
    if (durationTab === 'PRO') return 'Pro (180d)';
    return 'Standard (90d)';
  }, [durationTab]);

  const getTierIcon = () => {
    if (durationTab === 'PRO_PLUS') return <Crown size={12} className="text-amber-500" />;
    if (durationTab === 'PRO') return <Rocket size={12} className="text-blue-500" />;
    return <Zap size={12} className="text-orange-500" />;
  };

  const isRecommended =
    plan.name.toLowerCase().includes('growth') ||
    plan.name.toLowerCase().includes('gold') ||
    plan.name.toLowerCase().includes('pro');

  const featuresToDisplay = variant?.features && variant.features.length > 0
    ? variant.features
    : plan.features && plan.features.length > 0
    ? plan.features
    : ['Full loyalty campaign access', 'Customer rewards & points management'];

  return (
    <motion.div
      whileHover={{ y: -6 }}
      transition={{ duration: 0.2 }}
      className={`relative rounded-3xl shadow-lg h-full flex flex-col transition-all bg-white overflow-hidden ${
        isRecommended
          ? 'border-2 border-orange-500 shadow-orange-500/10 ring-4 ring-orange-500/5'
          : 'border border-gray-200 hover:border-gray-300'
      }`}
    >
      {/* Recommended Tag */}
      {isRecommended && (
        <div className="absolute top-0 right-0 bg-gradient-to-l from-orange-600 to-amber-600 text-white text-[11px] font-black tracking-wider px-4 py-1.5 rounded-bl-2xl uppercase shadow-sm flex items-center gap-1">
          <Sparkles size={12} />
          <span>Most Popular</span>
        </div>
      )}

      {/* Active Current Plan Tag */}
      {isCurrent && (
        <div className="absolute top-0 left-0 bg-emerald-600 text-white text-[11px] font-black px-4 py-1.5 rounded-br-2xl uppercase tracking-wider">
          Active Plan
        </div>
      )}

      <Card className="h-full flex flex-col border-none shadow-none rounded-3xl bg-transparent">
        <CardHeader className="pt-9 pb-4 px-6">
          <div className="flex items-center gap-2 mb-2">
            <span className="inline-flex items-center gap-1 text-[11px] font-extrabold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700 border border-slate-200">
              {getTierIcon()}
              <span>{tierBadgeLabel}</span>
            </span>
          </div>

          <CardTitle className="text-2xl font-black text-gray-900 tracking-tight">
            {plan.name}
          </CardTitle>

          {plan.description && (
            <p className="text-gray-500 text-xs mt-1 line-clamp-2 leading-relaxed">
              {plan.description}
            </p>
          )}

          <div className="my-5 pb-4 border-b border-gray-100">
            <div className="flex items-baseline gap-1">
              <span className="text-4xl font-black text-gray-900 tracking-tight">
                {priceFormatted}
              </span>
            </div>
            <span className="text-xs text-gray-500 font-medium block mt-1">
              {durationSubtitle}
            </span>
          </div>
        </CardHeader>

        <CardContent className="flex flex-col flex-1 px-6 pb-6 pt-0">
          <div className="mb-6 flex-1">
            <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-3">
              Included Privileges
            </p>
            <ul className="space-y-3 text-gray-700 text-xs sm:text-sm">
              {featuresToDisplay.map((feature, index) => (
                <li key={index} className="flex items-start gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                  <span className="leading-snug text-gray-700">{feature}</span>
                </li>
              ))}
            </ul>
          </div>

          <Button
            onClick={() => onChoosePlan(plan, variant)}
            disabled={isCurrent}
            className={`w-full py-6 rounded-2xl font-black text-sm transition-all shadow-md ${
              isCurrent
                ? 'bg-emerald-50 text-emerald-700 border border-emerald-200 cursor-not-allowed shadow-none'
                : isRecommended
                ? 'bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-700 hover:to-amber-700 text-white shadow-orange-600/20 hover:shadow-lg'
                : 'bg-gray-900 hover:bg-black text-white'
            }`}
          >
            {isCurrent
              ? 'Current Subscription'
              : `Select ${plan.name} · ${priceFormatted}`}
          </Button>
        </CardContent>
      </Card>
    </motion.div>
  );
}
