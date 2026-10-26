'use client';

import { Suspense, useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { CheckCircle2, Loader2, XCircle } from 'lucide-react';
import { useQueryClient } from '@tanstack/react-query';
import { useConfirmPurchase } from '@/services/mcom-packages';

function PaymentCallbackContent() {
  const router = useRouter();
  const params = useSearchParams();
  const queryClient = useQueryClient();
  const { mutateAsync: confirmPurchase } = useConfirmPurchase();

  const [status, setStatus] = useState<'pending' | 'success' | 'error'>('pending');
  const [message, setMessage] = useState('Confirming your payment...');

  useEffect(() => {
    let cancelled = false;

    const paymentIntentId =
      params.get('payment_intent') || params.get('paymentIntentId') || undefined;
    const orderId =
      params.get('token') || params.get('orderId') || params.get('orderID') || undefined;
    const checkoutId = params.get('checkoutId') || undefined;
    const provider = orderId ? 'paypal' : 'stripe';

    if (!paymentIntentId && !orderId && !checkoutId) {
      setStatus('error');
      setMessage('No payment reference was found in the return URL.');
      return;
    }

    const run = async () => {
      try {
        const result = await confirmPurchase({
          externalPlanId: '',
          billingCycle: 'monthly',
          provider,
          ...(paymentIntentId ? { paymentIntentId } : {}),
          ...(orderId ? { orderId } : {}),
          ...(checkoutId ? { checkoutId } : {}),
        });
        const isAccessPass = Boolean((result as any)?.accessPass);

        if (cancelled) return;

        queryClient.invalidateQueries({ queryKey: ['mcom-packages'] });
        queryClient.invalidateQueries({ queryKey: ['subscription'] });
        queryClient.invalidateQueries({ queryKey: ['businessSubscription'] });
        queryClient.invalidateQueries({ queryKey: ['businessProfile'] });
        queryClient.invalidateQueries({ queryKey: ['access-passes'] });

        setStatus('success');
        setMessage(
          isAccessPass
            ? 'Payment confirmed. Your access pass is now active.'
            : 'Payment confirmed. Your plan is now active.',
        );
        setTimeout(
          () =>
            router.replace(
              isAccessPass
                ? '/dashboard/access-pass?purchase=success'
                : '/dashboard/subscription?upgrade=success',
            ),
          1800,
        );
      } catch (error: any) {
        if (cancelled) return;
        setStatus('error');
        setMessage(
          error?.response?.data?.message ||
            error?.message ||
            'We could not confirm this payment. Please contact support.',
        );
      }
    };

    run();

    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <main className="min-h-screen flex items-center justify-center px-4">
      <div className="text-center max-w-lg">
        {status === 'pending' && (
          <>
            <Loader2 className="h-14 w-14 animate-spin text-primary mx-auto mb-6" />
            <h1 className="text-3xl font-bold mb-3">Confirming Payment</h1>
            <p className="text-muted-foreground">{message}</p>
          </>
        )}

        {status === 'success' && (
          <>
            <CheckCircle2 className="h-14 w-14 text-green-500 mx-auto mb-6" />
            <h1 className="text-3xl font-bold mb-3">Payment Successful</h1>
            <p className="text-muted-foreground">{message}</p>
          </>
        )}

        {status === 'error' && (
          <>
            <XCircle className="h-14 w-14 text-red-500 mx-auto mb-6" />
            <h1 className="text-3xl font-bold mb-3">Payment Not Confirmed</h1>
            <p className="text-muted-foreground mb-6">{message}</p>
            <div className="flex gap-3 justify-center">
              <Link
                href="/dashboard/subscription"
                className="px-6 py-3 bg-primary text-primary-foreground rounded-lg"
              >
                Back to subscription
              </Link>
              <Link href="/contact" className="px-6 py-3 bg-muted rounded-lg">
                Contact support
              </Link>
            </div>
          </>
        )}
      </div>
    </main>
  );
}

export default function PaymentCallbackPage() {
  return (
    <Suspense
      fallback={
        <main className="min-h-screen flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </main>
      }
    >
      <PaymentCallbackContent />
    </Suspense>
  );
}
