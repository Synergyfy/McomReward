'use client';

import { Suspense, useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { CheckCircle2, Loader2, XCircle } from 'lucide-react';
import { useQueryClient } from '@tanstack/react-query';
import { useConfirmPointPackagePurchase } from '@/services/payment/hook';

function PointPackageCallbackContent() {
  const router = useRouter();
  const params = useSearchParams();
  const queryClient = useQueryClient();
  const { mutateAsync: confirmPurchase } = useConfirmPointPackagePurchase();

  const [status, setStatus] = useState<'pending' | 'success' | 'error'>('pending');
  const [message, setMessage] = useState('Confirming your package purchase...');

  useEffect(() => {
    let cancelled = false;

    const paymentIntentId =
      params.get('payment_intent') || params.get('paymentIntentId') || undefined;
    const orderId =
      params.get('token') || params.get('orderId') || params.get('orderID') || undefined;
    const checkoutId = params.get('checkoutId') || undefined;
    const chargeId = params.get('chargeId') || undefined;
    const provider = orderId ? 'paypal' : 'stripe';
    const transactionId = paymentIntentId || orderId;

    if (!transactionId && !checkoutId && !chargeId) {
      setStatus('error');
      setMessage('No payment reference was found in the return URL.');
      return;
    }

    const run = async () => {
      try {
        await confirmPurchase({
          transactionId,
          provider,
          checkoutId,
          chargeId,
        });

        if (cancelled) return;

        queryClient.invalidateQueries({ queryKey: ['payment'] });
        queryClient.invalidateQueries({ queryKey: ['pointPackages'] });
        queryClient.invalidateQueries({ queryKey: ['myPackages'] });
        queryClient.invalidateQueries({ queryKey: ['wallet'] });

        setStatus('success');
        setMessage('Package purchase confirmed. Your points are ready.');
        setTimeout(() => router.replace('/dashboard/subscription'), 1800);
      } catch (error: any) {
        if (cancelled) return;
        setStatus('error');
        setMessage(
          error?.response?.data?.message ||
            error?.message ||
            'We could not confirm this purchase. Please contact support.',
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
            <h1 className="text-3xl font-bold mb-3">Confirming Purchase</h1>
            <p className="text-muted-foreground">{message}</p>
          </>
        )}

        {status === 'success' && (
          <>
            <CheckCircle2 className="h-14 w-14 text-green-500 mx-auto mb-6" />
            <h1 className="text-3xl font-bold mb-3">Purchase Successful</h1>
            <p className="text-muted-foreground">{message}</p>
          </>
        )}

        {status === 'error' && (
          <>
            <XCircle className="h-14 w-14 text-red-500 mx-auto mb-6" />
            <h1 className="text-3xl font-bold mb-3">Purchase Not Confirmed</h1>
            <p className="text-muted-foreground mb-6">{message}</p>
            <Link
              href="/dashboard/subscription"
              className="px-6 py-3 bg-primary text-primary-foreground rounded-lg"
            >
              Back to subscription
            </Link>
          </>
        )}
      </div>
    </main>
  );
}

export default function PointPackageCallbackPage() {
  return (
    <Suspense
      fallback={
        <main className="min-h-screen flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </main>
      }
    >
      <PointPackageCallbackContent />
    </Suspense>
  );
}
