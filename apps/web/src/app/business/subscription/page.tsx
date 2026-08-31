'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { Loader2, ShieldCheck, Zap, Sparkles } from 'lucide-react';
import PlanCard from '@/components/business/subscription/PlanCard';
import PaymentModal from '@/components/business/subscription/PaymentModal';
import {
  McomPlan,
  useGetPurchasablePlans,
  useGetMyPackage,
} from '@/services/mcom-packages';

export default function SubscriptionOnboardingPage() {
  const router = useRouter();
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'quarterly' | 'annual'>('monthly');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<McomPlan | null>(null);

  const { data: plans, isLoading: isLoadingPlans } = useGetPurchasablePlans();
  const { data: myPackage } = useGetMyPackage();

  const handleChoosePlan = (plan: McomPlan) => {
    setSelectedPlan(plan);
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

  return (
    <div className="min-h-screen bg-slate-50 py-12 sm:py-20">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="container mx-auto px-4 max-w-7xl"
      >
        {/* Header */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-2 bg-orange-100 text-orange-800 text-xs font-black uppercase tracking-wider px-3.5 py-1.5 rounded-full mb-4 shadow-sm">
            <Sparkles size={14} className="text-orange-600" />
            <span>MCOM Ecosystem Plans & Billing</span>
          </div>
          <h1 className="text-4xl sm:text-5xl font-black text-gray-900 tracking-tight">
            Supercharge Your Loyalty Growth
          </h1>
          <p className="mt-4 text-base sm:text-lg text-gray-600 max-w-2xl mx-auto">
            Choose the ideal subscription to unlock campaigns, digital stamp cards, customer rewards, and multi-location analytics.
          </p>

          {/* Billing Cycle Switcher */}
          <div className="mt-8 inline-flex items-center bg-white p-1.5 rounded-2xl shadow-sm border border-gray-200">
            <button
              onClick={() => setBillingCycle('monthly')}
              className={`px-5 py-2.5 rounded-xl text-sm font-bold transition-all ${
                billingCycle === 'monthly'
                  ? 'bg-gray-900 text-white shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Monthly Billing
            </button>
            <button
              onClick={() => setBillingCycle('quarterly')}
              className={`px-5 py-2.5 rounded-xl text-sm font-bold transition-all relative ${
                billingCycle === 'quarterly'
                  ? 'bg-gray-900 text-white shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Quarterly
              <span className="ml-1.5 text-[11px] bg-green-100 text-green-700 font-extrabold px-1.5 py-0.5 rounded-md">
                Save 15%
              </span>
            </button>
            <button
              onClick={() => setBillingCycle('annual')}
              className={`px-5 py-2.5 rounded-xl text-sm font-bold transition-all relative ${
                billingCycle === 'annual'
                  ? 'bg-gray-900 text-white shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Annual
              <span className="ml-1.5 text-[11px] bg-orange-100 text-orange-700 font-extrabold px-1.5 py-0.5 rounded-md">
                Save 25%
              </span>
            </button>
          </div>
        </div>

        {/* Plan Cards Grid */}
        {isLoadingPlans ? (
          <div className="flex flex-col items-center justify-center py-24 text-gray-500 space-y-4">
            <Loader2 className="h-10 w-10 animate-spin text-orange-500" />
            <span className="font-semibold text-sm">Loading available plans...</span>
          </div>
        ) : !plans || plans.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-2xl border border-gray-200 max-w-xl mx-auto p-8 shadow-sm">
            <Zap className="h-12 w-12 text-orange-500 mx-auto mb-3" />
            <h3 className="text-lg font-bold text-gray-900">No Plans Configured Yet</h3>
            <p className="text-gray-500 text-sm mt-1">
              Plans are being configured in the MCOM Solutions Console. Check back soon.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
            {plans.map((plan) => (
              <PlanCard
                key={plan.id}
                plan={plan}
                billingCycle={billingCycle}
                isCurrent={myPackage?.membership?.tier?.id === plan.id}
                onChoosePlan={handleChoosePlan}
              />
            ))}
          </div>
        )}

        {/* Bottom Guarantee Banner */}
        <div className="mt-16 text-center space-y-4">
          <div className="inline-flex items-center gap-6 text-xs text-gray-500 font-medium">
            <span className="flex items-center gap-1.5">
              <ShieldCheck size={16} className="text-green-600" />
              <span>Cancel Anytime with 1-Click</span>
            </span>
            <span>•</span>
            <span>All major payment cards, PayPal & MCOM Wallet supported</span>
            <span>•</span>
            <span>Instant entitlement unlock</span>
          </div>

          <div>
            <button
              onClick={() => router.push('/dashboard')}
              className="text-sm font-semibold text-gray-500 hover:text-gray-800 underline underline-offset-4"
            >
              Skip to dashboard
            </button>
          </div>
        </div>
      </motion.div>

      {/* In-App Checkout Modal */}
      <PaymentModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        plan={selectedPlan}
        initialBillingCycle={billingCycle}
        onConfirm={handlePaymentConfirm}
      />
    </div>
  );
}