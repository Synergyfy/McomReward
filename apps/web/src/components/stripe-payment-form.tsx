'use client';

import { FormEvent, useState } from 'react';
import { PaymentElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { Loader2 } from 'lucide-react';

interface StripePaymentFormProps {
  onSuccess: (paymentIntentId: string) => void;
}

/**
 * Stripe Elements form for MCOM Pay charges. The parent owns the charge and
 * calls the confirm endpoint with the returned PaymentIntent id.
 */
const StripePaymentForm = ({ onSuccess }: StripePaymentFormProps) => {
  const stripe = useStripe();
  const elements = useElements();

  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | undefined>(undefined);

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();

    if (!stripe || !elements) return;

    setIsLoading(true);
    setErrorMessage(undefined);

    const { error, paymentIntent } = await stripe.confirmPayment({
      elements,
      redirect: 'if_required',
    });

    if (error) {
      setErrorMessage(error.message);
      setIsLoading(false);
      return;
    }

    if (paymentIntent && paymentIntent.status === 'succeeded') {
      onSuccess(paymentIntent.id);
      return;
    }

    setErrorMessage(
      paymentIntent
        ? `Payment is not complete (status: ${paymentIntent.status}).`
        : 'Payment could not be completed.',
    );
    setIsLoading(false);
  };

  return (
    <form onSubmit={handleSubmit}>
      <PaymentElement />
      <button
        disabled={isLoading || !stripe || !elements}
        className="mt-4 w-full px-8 py-4 bg-primary text-primary-foreground rounded-full font-semibold disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
      >
        {isLoading && <Loader2 className="h-4 w-4 animate-spin" />}
        {isLoading ? 'Processing...' : 'Confirm Purchase'}
      </button>
      {errorMessage && <div className="mt-2 text-destructive">{errorMessage}</div>}
    </form>
  );
};

export default StripePaymentForm;
