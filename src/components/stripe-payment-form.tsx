'use client';

import { FormEvent, useState } from 'react';
import { PaymentElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { useStripeVerify } from '@/services/payment/hook';
import { toast } from 'sonner';
import { Loader2 } from 'lucide-react';

interface StripePaymentFormProps {
  onSuccess: (transactionId: string) => void;
}

const StripePaymentForm = ({ onSuccess }: StripePaymentFormProps) => {
  const stripe = useStripe();
  const elements = useElements();
  const { mutate: verifyStripe, isPending: isVerifying } = useStripeVerify();

  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | undefined>(undefined);

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();

    if (!stripe || !elements) {
      return;
    }

    setIsLoading(true);

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
      verifyStripe(
        { transaction_id: paymentIntent.id },
        {
          onSuccess: () => {
            onSuccess(paymentIntent.id);
          },
          onError: (error) => {
            console.error('Stripe verification failed:', error);
            toast.error('Failed to verify Stripe payment. Please contact support.');
          },
          onSettled: () => {
            setIsLoading(false);
          },
        }
      );
    } else {
      setIsLoading(false);
    }
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
