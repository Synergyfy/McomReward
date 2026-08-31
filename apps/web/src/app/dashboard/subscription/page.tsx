'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  CreditCard,
  CheckCircle2,
  AlertTriangle,
  Sparkles,
  Calendar,
  ShieldCheck,
  Zap,
  Loader2,
  RefreshCw,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import PlanCard from '@/components/business/subscription/PlanCard';
import PaymentModal from '@/components/business/subscription/PaymentModal';
import {
  McomPlan,
  useGetPurchasablePlans,
  useGetMyPackage,
} from '@/services/mcom-packages';
import { useGetBusinessSubscription } from '@/services/tiers/hook';
import { toast } from 'sonner';

export default function SubscriptionDashboardPage() {
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'quarterly' | 'annual'>('monthly');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<McomPlan | null>(null);

  const { data: plans, isLoading: isLoadingPlans, refetch: refetchPlans } = useGetPurchasablePlans();
  const { data: myPackage, isLoading: isLoadingMyPackage, refetch: refetchMyPackage } = useGetMyPackage();
  const { data: subDetails, refetch: refetchSub } = useGetBusinessSubscription();

  const handleChoosePlan = (plan: McomPlan) => {
    setSelectedPlan(plan);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedPlan(null);
  };

  const handlePaymentSuccess = () => {
    handleCloseModal();
    refetchPlans();
    refetchMyPackage();
    refetchSub();
    toast.success('Subscription updated successfully!');
  };

  const currentTierName =
    myPackage?.membership?.tier?.name ||
    subDetails?.tier ||
    'Free';

  const isExpired =
    myPackage?.membership?.status === 'expired' ||
    subDetails?.status === 'expired';

  const isTrial = myPackage?.membership?.isTrial || subDetails?.isTrial;

  const expiresAtFormatted = React.useMemo(() => {
    const rawDate = myPackage?.membership?.expiresAt || subDetails?.expiresAt;
    if (!rawDate) return null;
    try {
      return new Date(rawDate).toLocaleDateString('en-GB', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
      });
    } catch {
      return null;
    }
  }, [myPackage, subDetails]);

  return (
    <div className="min-h-screen bg-slate-50/50 p-4 sm:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header Title */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-black text-gray-900 tracking-tight">
              Subscription & Plan Management
            </h1>
            <p className="text-gray-500 text-sm mt-1">
              Manage your active plan, upgrade quotas, and process billing seamlessly in-app.
            </p>
          </div>

          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              refetchPlans();
              refetchMyPackage();
              refetchSub();
              toast.info('Refreshed subscription status');
            }}
            className="gap-2 self-start sm:self-auto"
          >
            <RefreshCw size={14} />
            <span>Refresh Status</span>
          </Button>
        </div>

        {/* Current Subscription Status Card */}
        <Card className="border-0 shadow-sm rounded-2xl overflow-hidden bg-white">
          <div className="bg-gradient-to-r from-gray-900 via-slate-900 to-gray-800 p-6 text-white">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
              <div className="space-y-2">
                <div className="flex items-center gap-2.5">
                  <span className="text-xs font-bold uppercase tracking-wider text-orange-400">
                    Current Plan
                  </span>
                  {isExpired ? (
                    <span className="bg-red-500/20 text-red-300 border border-red-500/30 text-xs font-bold px-2.5 py-0.5 rounded-full flex items-center gap-1">
                      <AlertTriangle size={12} />
                      <span>Expired</span>
                    </span>
                  ) : currentTierName === 'Free' ? (
                    <span className="bg-gray-700 text-gray-300 text-xs font-bold px-2.5 py-0.5 rounded-full">
                      Free Plan
                    </span>
                  ) : (
                    <span className="bg-green-500/20 text-green-300 border border-green-500/30 text-xs font-bold px-2.5 py-0.5 rounded-full flex items-center gap-1">
                      <CheckCircle2 size={12} />
                      <span>{isTrial ? 'Active Trial' : 'Active Subscription'}</span>
                    </span>
                  )}
                </div>
                <h2 className="text-3xl font-black">{currentTierName} Tier</h2>
                <p className="text-gray-300 text-xs max-w-xl">
                  {isExpired
                    ? 'Your subscription period has ended. Upgrade or renew to restore campaign creation, digital stamps, and customer analytics.'
                    : currentTierName === 'Free'
                    ? 'You are on the free tier. Upgrade to unlock multiple campaigns, CRM tools, and point allowances.'
                    : 'Your business is fully unlocked with active ecosystem quotas and features.'}
                </p>
              </div>

              {expiresAtFormatted && (
                <div className="bg-white/10 backdrop-blur-sm border border-white/10 rounded-xl p-4 flex items-center gap-3">
                  <div className="p-2.5 bg-white/10 rounded-lg text-orange-400">
                    <Calendar size={20} />
                  </div>
                  <div>
                    <p className="text-xs text-gray-400 font-medium">
                      {isExpired ? 'Expired On' : 'Next Renewal'}
                    </p>
                    <p className="text-sm font-bold text-white">{expiresAtFormatted}</p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {isExpired && (
            <div className="bg-red-50 border-b border-red-100 px-6 py-3.5 flex items-center gap-3 text-red-800 text-sm">
              <AlertTriangle className="text-red-600 flex-shrink-0" size={18} />
              <span>
                <strong>Action Required:</strong> Choose a plan below to renew your access immediately with Card, PayPal, or MCOM Wallet.
              </span>
            </div>
          )}
        </Card>

        {/* Plan Upgrade Selector Section */}
        <div className="space-y-6">
          <div className="text-center space-y-3">
            <h2 className="text-2xl font-black text-gray-900 tracking-tight">
              Available Subscription Plans
            </h2>
            <p className="text-gray-500 text-sm max-w-xl mx-auto">
              Select the plan that fits your business scale. Change or cancel anytime.
            </p>

            {/* Billing Cycle Switcher */}
            <div className="mt-4 inline-flex items-center bg-white p-1.5 rounded-2xl shadow-sm border border-gray-200">
              <button
                onClick={() => setBillingCycle('monthly')}
                className={`px-5 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all ${
                  billingCycle === 'monthly'
                    ? 'bg-gray-900 text-white shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                Monthly
              </button>
              <button
                onClick={() => setBillingCycle('quarterly')}
                className={`px-5 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all relative ${
                  billingCycle === 'quarterly'
                    ? 'bg-gray-900 text-white shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                Quarterly
                <span className="ml-1.5 text-[10px] bg-green-100 text-green-700 font-extrabold px-1.5 py-0.5 rounded-md">
                  Save 15%
                </span>
              </button>
              <button
                onClick={() => setBillingCycle('annual')}
                className={`px-5 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all relative ${
                  billingCycle === 'annual'
                    ? 'bg-gray-900 text-white shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                Annual
                <span className="ml-1.5 text-[10px] bg-orange-100 text-orange-700 font-extrabold px-1.5 py-0.5 rounded-md">
                  Save 25%
                </span>
              </button>
            </div>
          </div>

          {/* Plans Grid */}
          {isLoadingPlans ? (
            <div className="flex flex-col items-center justify-center py-20 text-gray-500 space-y-3">
              <Loader2 className="h-8 w-8 animate-spin text-orange-500" />
              <span className="text-sm font-medium">Loading ecosystem plans...</span>
            </div>
          ) : !plans || plans.length === 0 ? (
            <div className="text-center py-12 bg-white rounded-2xl border border-gray-200 max-w-md mx-auto p-6">
              <Zap className="h-10 w-10 text-orange-500 mx-auto mb-2" />
              <p className="font-bold text-gray-800">No Plans Configured</p>
              <p className="text-xs text-gray-500 mt-1">
                Please check back in a few minutes or contact support.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {plans.map((plan) => (
                <PlanCard
                  key={plan.id}
                  plan={plan}
                  billingCycle={billingCycle}
                  isCurrent={!isExpired && currentTierName.toLowerCase() === plan.name.toLowerCase()}
                  onChoosePlan={handleChoosePlan}
                />
              ))}
            </div>
          )}
        </div>

        {/* Security & Payment Methods Guarantee Footer */}
        <div className="pt-8 border-t border-gray-200 text-center space-y-3">
          <div className="inline-flex flex-wrap items-center justify-center gap-4 text-xs text-gray-500 font-medium">
            <span className="flex items-center gap-1.5">
              <ShieldCheck size={16} className="text-green-600" />
              <span>Instant Entitlement Activation</span>
            </span>
            <span>•</span>
            <span>Supports Stripe Card, PayPal, and MCOM Centralized Wallet</span>
            <span>•</span>
            <span>Cancel or Switch Tiers Anytime</span>
          </div>
        </div>
      </div>

      {/* In-App Payment Checkout Modal */}
      <PaymentModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        plan={selectedPlan}
        initialBillingCycle={billingCycle}
        onConfirm={handlePaymentSuccess}
      />
    </div>
  );
}
