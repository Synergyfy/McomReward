'use client';

import React, { useState } from 'react';
import { PaymentElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { useConfirmPurchase } from '@/services/mcom-packages';
import { toast } from 'sonner';
import { Loader2, ShieldCheck } from 'lucide-react';

interface McomStripeCheckoutProps {
  externalPlanId: string;
  billingCycle: string;
  intentType?: 'payment' | 'setup';
  amountText: string;
  onSuccess: () => void;
}

export default function McomStripeCheckout({
  externalPlanId,
  billingCycle,
  intentType = 'payment',
  amountText,
  onSuccess,
}: McomStripeCheckoutProps) {
  const stripe = useStripe();
  const elements = useElements();
  const { mutateAsync: confirmPurchase, isPending: isConfirming } = useConfirmPurchase();

  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    if (!stripe || !elements) {
      return;
    }

    setIsLoading(true);
    setErrorMessage(null);

    try {
      if (intentType === 'setup') {
        const { error, setupIntent } = await stripe.confirmSetup({
          elements,
          redirect: 'if_required',
        });

        if (error) {
          setErrorMessage(error.message || 'Card verification failed');
          setIsLoading(false);
          return;
        }

        if (setupIntent && (setupIntent.status === 'succeeded' || setupIntent.status === 'processing')) {
          await confirmPurchase({
            externalPlanId,
            billingCycle,
            setupIntentId: setupIntent.id,
            provider: 'stripe',
          });

          toast.success('Subscription activated successfully!');
          onSuccess();
        }
      } else {
        const { error, paymentIntent } = await stripe.confirmPayment({
          elements,
          redirect: 'if_required',
        });

        if (error) {
          setErrorMessage(error.message || 'Payment confirmation failed');
          setIsLoading(false);
          return;
        }

        if (paymentIntent && paymentIntent.status === 'succeeded') {
          await confirmPurchase({
            externalPlanId,
            billingCycle,
            paymentIntentId: paymentIntent.id,
            provider: 'stripe',
          });

          toast.success('Payment succeeded! Your plan is now active.');
          onSuccess();
        }
      }
    } catch (err: any) {
      console.error('Checkout confirm error:', err);
      setErrorMessage(err?.response?.data?.message || err?.message || 'Payment processing failed');
    } finally {
      setIsLoading(false);
    }
  };

  const isBusy = isLoading || isConfirming;

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="bg-gray-50 p-3 rounded-lg border border-gray-100 flex items-center justify-between text-sm">
        <span className="text-gray-600 font-medium">Total to pay today:</span>
        <span className="text-gray-900 font-bold text-base">{amountText}</span>
      </div>

      <div className="min-h-[160px] py-1">
        <PaymentElement />
      </div>

      {errorMessage && (
        <div className="p-3 bg-red-50 border border-red-200 text-red-600 text-sm rounded-lg">
          {errorMessage}
        </div>
      )}

      <button
        type="submit"
        disabled={isBusy || !stripe || !elements}
        className="w-full py-3.5 px-4 bg-orange-600 hover:bg-orange-700 active:bg-orange-800 text-white rounded-xl font-bold shadow-md hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
      >
        {isBusy ? (
          <>
            <Loader2 className="h-5 w-5 animate-spin" />
            <span>Processing Securely...</span>
          </>
        ) : (
          <>
            <ShieldCheck className="h-5 w-5" />
            <span>Pay & Activate ({amountText})</span>
          </>
        )}
      </button>

      <p className="text-center text-xs text-gray-400 flex items-center justify-center gap-1">
        <span>🔒 256-bit SSL encrypted • Powered by MCOM Payment Hub & Stripe</span>
      </p>
    </form>
  );
}
