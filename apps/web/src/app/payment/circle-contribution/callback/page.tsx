'use client';

import { Suspense, useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { CheckCircle2, Loader2, XCircle } from 'lucide-react';
import { useVerifyGroupCircleContribution } from '@/services/group-circle/hook';
import api from '@/services/api';

interface PendingContribution {
  circleId: string;
  memberId: string;
  amount: number;
  round: number;
  checkoutId?: string;
  chargeId?: string;
}

function CircleContributionCallbackContent() {
  const router = useRouter();
  const params = useSearchParams();
  const { mutateAsync: verifyContribution } = useVerifyGroupCircleContribution();

  const [status, setStatus] = useState<'pending' | 'success' | 'error'>('pending');
  const [message, setMessage] = useState('Confirming your contribution...');

  useEffect(() => {
    let cancelled = false;

    const token = params.get('token') || params.get('orderId');

    if (!token) {
      setStatus('error');
      setMessage('No payment reference was found in the return URL.');
      return;
    }

    const run = async () => {
      try {
        let pending: PendingContribution;

        const raw = sessionStorage.getItem('mcom-circle-contribution');
        if (raw) {
          pending = JSON.parse(raw) as PendingContribution;
        } else {
          // Recover the contribution context from the server when the browser
          // return page has no session state (new tab / cleared storage).
          const { data } = await api.get('/payment/checkout/resolve', {
            params: { providerRef: token },
          });
          pending = {
            circleId: data.metadata?.groupCircleId,
            memberId: data.metadata?.memberId,
            amount: Number(data.amountMinor) / 100,
            round: Number(data.metadata?.round || 1),
            checkoutId: data.checkoutId,
            chargeId: data.chargeId,
          };
        }

        if (!pending.circleId || !pending.memberId) {
          throw new Error('The contribution details could not be recovered.');
        }

        await verifyContribution({
          id: pending.circleId,
          data: {
            memberId: pending.memberId,
            amount: pending.amount,
            round: pending.round,
            provider: 'PAYPAL',
            transactionId: token,
            checkoutId: pending.checkoutId,
            chargeId: pending.chargeId,
          },
        });

        if (cancelled) return;

        sessionStorage.removeItem('mcom-circle-contribution');
        setStatus('success');
        setMessage('Contribution recorded successfully.');
        setTimeout(
          () => router.replace('/dashboard/my-assets/group-circles'),
          1800,
        );
      } catch (error: any) {
        if (cancelled) return;
        setStatus('error');
        setMessage(
          error?.response?.data?.message ||
            error?.message ||
            'We could not confirm this contribution. Please contact support.',
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
            <h1 className="text-3xl font-bold mb-3">Confirming Contribution</h1>
            <p className="text-muted-foreground">{message}</p>
          </>
        )}

        {status === 'success' && (
          <>
            <CheckCircle2 className="h-14 w-14 text-green-500 mx-auto mb-6" />
            <h1 className="text-3xl font-bold mb-3">Contribution Successful</h1>
            <p className="text-muted-foreground">{message}</p>
          </>
        )}

        {status === 'error' && (
          <>
            <XCircle className="h-14 w-14 text-red-500 mx-auto mb-6" />
            <h1 className="text-3xl font-bold mb-3">Contribution Not Confirmed</h1>
            <p className="text-muted-foreground mb-6">{message}</p>
            <Link
              href="/dashboard/my-assets/group-circles"
              className="px-6 py-3 bg-primary text-primary-foreground rounded-lg"
            >
              Back to circles
            </Link>
          </>
        )}
      </div>
    </main>
  );
}

export default function CircleContributionCallbackPage() {
  return (
    <Suspense
      fallback={
        <main className="min-h-screen flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </main>
      }
    >
      <CircleContributionCallbackContent />
    </Suspense>
  );
}
