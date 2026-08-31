'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Loader2, CheckCircle2 } from 'lucide-react';
import { Elements } from '@stripe/react-stripe-js';
import { stripePromise } from '@/components/stripe-provider';
import StripePaymentForm from '@/components/stripe-payment-form';
import { useStripeInitiate } from '@/services/payment/hook';
import { Plan } from '@/types';

interface PaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  plan: Plan | null;
  onConfirm: () => void;
}

export default function PaymentModal({ isOpen, onClose, plan, onConfirm }: PaymentModalProps) {
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const { mutate: initiateStripe, isPending } = useStripeInitiate();

  React.useEffect(() => {
    if (isOpen && plan) {
      setClientSecret(null);
      initiateStripe(
        { tier_id: plan.id, plan_type: 'monthly' },
        {
          onSuccess: (data) => setClientSecret(data.clientSecret),
          onError: () => setClientSecret(null),
        }
      );
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, plan?.id]);

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.9, y: 20 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.9, y: 20 }}
            className="bg-white rounded-2xl shadow-2xl w-full max-w-md"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-6 border-b border-gray-200 flex justify-between items-center">
              <div>
                <h2 className="text-xl font-bold text-gray-800">Upgrade to {plan?.name}</h2>
                <p className="text-gray-500 text-sm">Complete your payment to get started.</p>
              </div>
              <button onClick={onClose} className="p-2 rounded-full hover:bg-gray-100">
                <X size={20} />
              </button>
            </div>
            <div className="p-6 space-y-6">
              {!stripePromise ? (
                <div className="text-center py-8 text-red-500">
                  Stripe is not configured. Please check the NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY environment variable.
                </div>
              ) : isPending ? (
                <div className="flex flex-col items-center justify-center py-10 text-gray-500">
                  <Loader2 className="h-8 w-8 animate-spin mb-3" />
                  <span>Preparing secure checkout...</span>
                </div>
              ) : clientSecret ? (
                <>
                  <div className="flex items-center gap-2 text-sm text-gray-500">
                    <CheckCircle2 className="h-4 w-4 text-green-500" />
                    <span>{plan?.name}: {plan?.price}</span>
                  </div>
                  <Elements stripe={stripePromise} options={{ clientSecret }}>
                    <StripePaymentForm onSuccess={onConfirm} />
                  </Elements>
                </>
              ) : (
                <div className="text-center py-8 text-red-500">
                  Failed to prepare payment. Please try again.
                </div>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}