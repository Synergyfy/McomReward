'use client';

import React, { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import {
  Loader2,
  ShieldCheck,
  Zap,
  Rocket,
  Crown,
  Sparkles,
  CheckCircle2,
  Lock,
  ArrowRight,
  HelpCircle,
  Clock,
  Award,
  Layers,
} from 'lucide-react';
import PlanCard from '@/components/business/subscription/PlanCard';
import PaymentModal from '@/components/business/subscription/PaymentModal';
import {
  McomPlan,
  PlanVariantDto,
  useGetPurchasablePlans,
  useGetMyPackage,
} from '@/services/mcom-packages';

export default function BusinessSubscriptionPage() {
  const router = useRouter();
  const [durationTab, setDurationTab] = useState<'STANDARD' | 'PRO' | 'PRO_PLUS'>('STANDARD');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<(McomPlan & { selectedVariantId?: string }) | null>(null);

  const { data: plans, isLoading: isLoadingPlans } = useGetPurchasablePlans();
  const { data: myPackage, isLoading: isLoadingPackage } = useGetMyPackage();

  const handleChoosePlan = (plan: McomPlan, variant?: PlanVariantDto) => {
    setSelectedPlan({
      ...plan,
      selectedVariantId: variant?.id,
    });
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedPlan(null);
  };

  const handlePaymentConfirm = () => {
    handleCloseModal();
    router.push('/dashboard?upgrade=success');
  };

  const currentMembership = myPackage?.membership;
  const currentPlanVariant = currentMembership?.planVariant;
  const isSubscribed = currentMembership?.status === 'active' || (currentMembership?.is_trial && new Date(currentMembership?.expires_at) > new Date());

  const currentPlanName = useMemo(() => {
    if (currentPlanVariant?.plan?.name) {
      const level = currentPlanVariant?.tierLevel?.name || 'STANDARD';
      const label = level === 'PRO_PLUS' ? 'Pro+ (1 Year)' : level === 'PRO' ? 'Pro (180 Days)' : 'Standard (90 Days)';
      return `${currentPlanVariant.plan.name} · ${label}`;
    }
    return myPackage?.membershipTier || 'Starter Free';
  }, [currentPlanVariant, myPackage]);

  const expiryDateFormatted = useMemo(() => {
    if (currentMembership?.expires_at) {
      return new Date(currentMembership.expires_at).toLocaleDateString('en-GB', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
      });
    }
    return 'None';
  }, [currentMembership]);

  return (
    <div className="min-h-screen bg-slate-50/60 py-10 sm:py-16">
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="container mx-auto px-4 max-w-7xl space-y-12"
      >
        {/* 1. ACTIVE MEMBERSHIP HEADER BANNER */}
        <div className="bg-gradient-to-r from-gray-900 via-slate-900 to-gray-950 rounded-3xl p-6 sm:p-8 text-white shadow-xl relative overflow-hidden border border-gray-800">
          <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
            <div className="space-y-2">
              <div className="inline-flex items-center gap-2 bg-white/10 text-white text-xs font-black uppercase tracking-wider px-3.5 py-1.5 rounded-full backdrop-blur-sm">
                <Award size={14} className="text-orange-400" />
                <span>Your Commercial Subscription</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-black tracking-tight">
                {currentPlanName}
              </h2>
              <div className="flex flex-wrap items-center gap-4 text-xs sm:text-sm text-gray-300">
                <span className="flex items-center gap-1.5">
                  <Clock size={15} className="text-orange-400" />
                  <span>
                    {isSubscribed ? `Valid until ${expiryDateFormatted}` : 'No active paid commitment'}
                  </span>
                </span>
                <span>•</span>
                <span>One-off period billing</span>
                <span>•</span>
                <span className={`font-bold px-2 py-0.5 rounded-md text-xs uppercase ${
                  isSubscribed ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' : 'bg-gray-700 text-gray-300'
                }`}>
                  {isSubscribed ? 'Active' : 'Unsubscribed'}
                </span>
              </div>
            </div>

            {!isSubscribed && (
              <a
                href="#plans-grid"
                className="px-6 py-3 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white font-extrabold text-sm rounded-2xl shadow-lg hover:shadow-orange-500/20 transition-all flex items-center gap-2"
              >
                <span>Upgrade to Pro / Pro+</span>
                <ArrowRight size={16} />
              </a>
            )}
          </div>
        </div>

        {/* 2. ACTIVE BENEFITS VS LOCKED PRIVILEGES MATRIX */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Active Benefits */}
          <div className="bg-white rounded-3xl p-6 border border-emerald-100 shadow-sm space-y-4">
            <div className="flex items-center gap-2 text-emerald-800">
              <CheckCircle2 size={20} className="text-emerald-600" />
              <h3 className="text-base font-extrabold">Active Privileges in Current Plan</h3>
            </div>
            <ul className="space-y-2.5 text-xs sm:text-sm text-gray-700">
              <li className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                <span>Loyalty Campaign Creator & Digital Stamp Programs</span>
              </li>
              <li className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                <span>Instant QR-Code & NFC Plaque Generation</span>
              </li>
              <li className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                <span>Multi-location Consumer Activity Logging</span>
              </li>
            </ul>
          </div>

          {/* Locked Features */}
          <div className="bg-amber-50/60 rounded-3xl p-6 border border-amber-200/80 shadow-sm space-y-4">
            <div className="flex items-center justify-between text-amber-900">
              <div className="flex items-center gap-2">
                <Lock size={18} className="text-amber-600" />
                <h3 className="text-base font-extrabold">Locked Capabilities</h3>
              </div>
              <span className="text-[11px] font-bold bg-amber-200/80 text-amber-900 px-2.5 py-0.5 rounded-full uppercase">
                Pro & Pro+ Tiers
              </span>
            </div>
            <ul className="space-y-2.5 text-xs sm:text-sm text-gray-700">
              <li className="flex items-center justify-between">
                <span className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                  <span>Realtime Analytics & ROI Visualizer</span>
                </span>
                <span className="text-[11px] font-bold text-orange-600">Unlock in Pro</span>
              </li>
              <li className="flex items-center justify-between">
                <span className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                  <span>Customer CRM & Direct Marketing Engine</span>
                </span>
                <span className="text-[11px] font-bold text-amber-600">Unlock in Pro+</span>
              </li>
              <li className="flex items-center justify-between">
                <span className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                  <span>Custom White-label Storefront Branding</span>
                </span>
                <span className="text-[11px] font-bold text-amber-600">Unlock in Pro+</span>
              </li>
            </ul>
          </div>
        </div>

        {/* 3. DURATION SELECTOR (VARIANT TABS) */}
        <div id="plans-grid" className="text-center space-y-6 pt-4">
          <div className="space-y-2">
            <h2 className="text-3xl sm:text-4xl font-black text-gray-900 tracking-tight">
              Select Your Commitment Level
            </h2>
            <p className="text-sm sm:text-base text-gray-600 max-w-2xl mx-auto">
              Choose your duration tier. All plans include one-off transparent pricing with instant capability activation.
            </p>
          </div>

          <div className="inline-flex p-1.5 bg-white border border-gray-200 rounded-3xl shadow-sm gap-2">
            <button
              onClick={() => setDurationTab('STANDARD')}
              className={`flex items-center gap-2 px-6 py-3 rounded-2xl text-sm font-extrabold transition-all ${
                durationTab === 'STANDARD'
                  ? 'bg-gray-900 text-white shadow-md'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <Zap size={16} className={durationTab === 'STANDARD' ? 'text-orange-400' : 'text-gray-400'} />
              <span>Standard (90 Days)</span>
            </button>

            <button
              onClick={() => setDurationTab('PRO')}
              className={`flex items-center gap-2 px-6 py-3 rounded-2xl text-sm font-extrabold transition-all relative ${
                durationTab === 'PRO'
                  ? 'bg-blue-600 text-white shadow-md'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <Rocket size={16} className={durationTab === 'PRO' ? 'text-white' : 'text-blue-500'} />
              <span>Pro (180 Days)</span>
              <span className="ml-1 text-[10px] bg-green-100 text-green-800 px-1.5 py-0.5 rounded-md font-black">
                Save 15%
              </span>
            </button>

            <button
              onClick={() => setDurationTab('PRO_PLUS')}
              className={`flex items-center gap-2 px-6 py-3 rounded-2xl text-sm font-extrabold transition-all relative ${
                durationTab === 'PRO_PLUS'
                  ? 'bg-amber-500 text-white shadow-md'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <Crown size={16} className={durationTab === 'PRO_PLUS' ? 'text-white' : 'text-amber-500'} />
              <span>Pro+ (1 Calendar Year)</span>
              <span className="ml-1 text-[10px] bg-orange-100 text-orange-800 px-1.5 py-0.5 rounded-md font-black">
                Save 25%
              </span>
            </button>
          </div>
        </div>

        {/* 4. PLAN CARDS GRID */}
        {isLoadingPlans ? (
          <div className="flex flex-col items-center justify-center py-24 text-gray-500 space-y-4">
            <Loader2 className="h-10 w-10 animate-spin text-orange-500" />
            <span className="font-semibold text-sm">Loading available commercial packages...</span>
          </div>
        ) : !plans || plans.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-3xl border border-gray-200 max-w-xl mx-auto p-8 shadow-sm">
            <Zap className="h-12 w-12 text-orange-500 mx-auto mb-3" />
            <h3 className="text-lg font-bold text-gray-900">No Commercial Plans Available</h3>
            <p className="text-gray-500 text-sm mt-1">
              Please configure commercial plans in the Admin Plans Console.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {plans.map((plan) => {
              const matchedVariant = plan.variants?.find(
                (v) => v.tierLevel?.toUpperCase() === durationTab
              );
              const isCurrent = currentPlanVariant?.id === matchedVariant?.id;

              return (
                <PlanCard
                  key={plan.id}
                  plan={plan}
                  durationTab={durationTab}
                  isCurrent={isCurrent}
                  onChoosePlan={handleChoosePlan}
                />
              );
            })}
          </div>
        )}

        {/* 5. SIDE-BY-SIDE COMPARISON TABLE */}
        {plans && plans.length > 0 && (
          <div className="bg-white rounded-3xl border border-gray-200 shadow-sm p-6 sm:p-8 space-y-6">
            <div className="flex items-center gap-2">
              <Layers size={20} className="text-gray-700" />
              <h3 className="text-xl font-black text-gray-900">
                Detailed Side-by-Side Comparison ({durationTab === 'PRO_PLUS' ? '1 Year' : durationTab === 'PRO' ? '180 Days' : '90 Days'})
              </h3>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm text-gray-700">
                <thead className="bg-slate-50 text-xs font-black uppercase text-gray-500 border-b border-gray-200">
                  <tr>
                    <th className="p-4 rounded-tl-xl">Feature / Quota Allowance</th>
                    {plans.map((p) => (
                      <th key={p.id} className="p-4 text-center">
                        {p.name}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  <tr>
                    <td className="p-4 font-semibold text-gray-900">Commitment Period Price</td>
                    {plans.map((p) => {
                      const v = p.variants?.find((v) => v.tierLevel?.toUpperCase() === durationTab);
                      return (
                        <td key={p.id} className="p-4 text-center font-black text-base text-gray-900">
                          £{Number(v?.price ?? (durationTab === 'PRO_PLUS' ? p.annualPrice : durationTab === 'PRO' ? p.quarterlyPrice : p.monthlyPrice)).toFixed(2)}
                        </td>
                      );
                    })}
                  </tr>
                  <tr>
                    <td className="p-4 font-semibold text-gray-900">Active Campaigns Limit</td>
                    {plans.map((p) => {
                      const v = p.variants?.find((v) => v.tierLevel?.toUpperCase() === durationTab);
                      const max = v?.configuration?.quotas?.maxActiveCampaigns;
                      return (
                        <td key={p.id} className="p-4 text-center">
                          {max === -1 ? 'Unlimited' : max ?? '3'}
                        </td>
                      );
                    })}
                  </tr>
                  <tr>
                    <td className="p-4 font-semibold text-gray-900">Monthly Points Allowance</td>
                    {plans.map((p) => {
                      const v = p.variants?.find((v) => v.tierLevel?.toUpperCase() === durationTab);
                      return (
                        <td key={p.id} className="p-4 text-center">
                          {v?.configuration?.quotas?.monthlyPointsAllowance?.toLocaleString() ?? '1,000'}
                        </td>
                      );
                    })}
                  </tr>
                  <tr>
                    <td className="p-4 font-semibold text-gray-900">Advanced Analytics Dashboard</td>
                    {plans.map((p) => {
                      const v = p.variants?.find((v) => v.tierLevel?.toUpperCase() === durationTab);
                      const has = v?.configuration?.featureFlags?.hasAccessToAdvancedAnalytics;
                      return (
                        <td key={p.id} className="p-4 text-center">
                          {has ? (
                            <CheckCircle2 size={18} className="text-emerald-600 mx-auto" />
                          ) : (
                            <span className="text-gray-300 font-bold">—</span>
                          )}
                        </td>
                      );
                    })}
                  </tr>
                  <tr>
                    <td className="p-4 font-semibold text-gray-900">Customer CRM Access</td>
                    {plans.map((p) => {
                      const v = p.variants?.find((v) => v.tierLevel?.toUpperCase() === durationTab);
                      const has = v?.configuration?.featureFlags?.hasAccessToCRM;
                      return (
                        <td key={p.id} className="p-4 text-center">
                          {has ? (
                            <CheckCircle2 size={18} className="text-emerald-600 mx-auto" />
                          ) : (
                            <span className="text-gray-300 font-bold">—</span>
                          )}
                        </td>
                      );
                    })}
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* 6. GUARANTEE FOOTER */}
        <div className="text-center space-y-4 pt-6">
          <div className="inline-flex items-center gap-6 text-xs text-gray-500 font-medium">
            <span className="flex items-center gap-1.5">
              <ShieldCheck size={16} className="text-emerald-600" />
              <span>Instant Local Entitlement Unlock</span>
            </span>
            <span>•</span>
            <span>All major Credit/Debit Cards, PayPal & MCOM Wallet supported</span>
            <span>•</span>
            <span>Transparent one-off pricing</span>
          </div>
        </div>
      </motion.div>

      {/* In-Place Checkout Modal */}
      <PaymentModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        plan={selectedPlan}
        initialBillingCycle={durationTab}
        onConfirm={handlePaymentConfirm}
      />
    </div>
  );
}