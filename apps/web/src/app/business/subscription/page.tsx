'use client';

import React, { useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { Loader2 } from 'lucide-react';
import PlanCard from '@/components/business/subscription/PlanCard';
import PaymentModal from '@/components/business/subscription/PaymentModal';
import { Plan } from '@/types';
import { useGetTiers } from '@/services/payment/hook';
import { useGetMySubscription } from '@/services/tiers/hook';

export default function SubscriptionOnboardingPage() {
  const router = useRouter();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<Plan | null>(null);

  const { data: tiers, isLoading: isLoadingTiers } = useGetTiers();
  const { data: subscription } = useGetMySubscription();

  const plans = useMemo<Plan[]>(() => {
    if (!tiers) return [];
    return tiers.map((tier) => ({
      id: tier.id,
      name: tier.name,
      price: tier.monthlyPrice ? `£${tier.monthlyPrice}/month` : 'Custom',
      features: tier.features ?? [],
      isCurrent: subscription?.tier?.id === tier.id,
      isRecommended: tier.name.toLowerCase() === 'silver',
    }));
  }, [tiers, subscription]);

  const handleChoosePlan = (plan: Plan) => {
    if (plan.price === 'Custom') {
      return;
    }
    setSelectedPlan(plan);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedPlan(null);
  };

  const handlePaymentConfirm = () => {
    handleCloseModal();
    router.push('/dashboard');
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12 sm:py-20">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="container mx-auto px-4"
      >
        <div className="text-center mb-12">
          <h1 className="text-4xl sm:text-5xl font-extrabold text-gray-900 tracking-tight">
            Choose Your Plan
          </h1>
          <p className="mt-4 text-lg text-gray-600 max-w-2xl mx-auto">
            You're almost there! Select a plan to unlock the full potential of Loyalty CardX for your business.
          </p>
        </div>

        {isLoadingTiers ? (
          <div className="flex justify-center py-20">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 max-w-7xl mx-auto">
            {plans.map((plan) => (
              <PlanCard key={plan.id} plan={plan} onChoosePlan={handleChoosePlan} />
            ))}
          </div>
        )}

        <div className="text-center mt-12">
          <button
            onClick={() => router.push('/dashboard')}
            className="text-gray-500 hover:text-gray-700 underline"
          >
            Skip for now
          </button>
        </div>
      </motion.div>

      <PaymentModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        plan={selectedPlan}
        onConfirm={handlePaymentConfirm}
      />
    </div>
  );
}