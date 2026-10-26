'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X,
  Loader2,
  CheckCircle2,
  CreditCard,
  Wallet,
  Sparkles,
  ExternalLink,
  ShieldCheck,
  Zap,
  AlertCircle,
} from 'lucide-react';
import { Elements } from '@stripe/react-stripe-js';
import { stripePromise } from '@/components/stripe-provider';
import McomStripeCheckout from './McomStripeCheckout';
import {
  McomPlan,
  PlanVariantDto,
  useInitiatePurchase,
  useConfirmPurchase,
  getSsoAuthorizeUrl,
} from '@/services/mcom-packages';
import { useGetWallet } from '@/services/wallet/hook';
import { toast } from 'sonner';

interface PaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  plan: (McomPlan & { selectedVariantId?: string }) | null;
  initialBillingCycle?: 'STANDARD' | 'PRO' | 'PRO_PLUS' | 'monthly' | 'quarterly' | 'annual' | string;
  onConfirm: () => void;
}

type PaymentProvider = 'stripe' | 'paypal' | 'wallet';

function createCheckoutId(): string {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID();
  }
  return `chk-${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

export default function PaymentModal({
  isOpen,
  onClose,
  plan,
  initialBillingCycle = 'STANDARD',
  onConfirm,
}: PaymentModalProps) {
  const [selectedDuration, setSelectedDuration] = useState<string>(initialBillingCycle);
  const [selectedProvider, setSelectedProvider] = useState<PaymentProvider>('stripe');

  const [checkoutId, setCheckoutId] = useState<string | null>(null);
  const [chargeId, setChargeId] = useState<string | null>(null);
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [approvalUrl, setApprovalUrl] = useState<string | null>(null);
  const [paymentError, setPaymentError] = useState<string | null>(null);
  const [topUpUrl, setTopUpUrl] = useState<string | null>(null);

  const [needsMcomConnect, setNeedsMcomConnect] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const { mutateAsync: initiatePurchase, isPending: isInitiating } = useInitiatePurchase();
  const { mutateAsync: confirmPurchase, isPending: isConfirming } = useConfirmPurchase();
  const { data: wallet } = useGetWallet();

  // Reset state when the modal opens or the selected plan/variant changes.
  useEffect(() => {
    if (isOpen && plan) {
      setClientSecret(null);
      setApprovalUrl(null);
      setChargeId(null);
      setPaymentError(null);
      setTopUpUrl(null);
      setNeedsMcomConnect(false);
      setIsSuccess(false);
      setSelectedDuration(initialBillingCycle);
      setSelectedProvider('stripe');
      setCheckoutId(createCheckoutId());
    }
  }, [isOpen, plan?.id, initialBillingCycle]);

  // Resolve matching variant
  const activeVariant: PlanVariantDto | undefined = useMemo(() => {
    if (!plan?.variants || plan.variants.length === 0) return undefined;
    if (plan.selectedVariantId) {
      const found = plan.variants.find((v) => v.id === plan.selectedVariantId);
      if (found) return found;
    }
    const target = selectedDuration.toUpperCase();
    return (
      plan.variants.find((v) => v.tierLevel?.toUpperCase() === target) ||
      plan.variants.find((v) => v.tierLevel?.toUpperCase().includes(target)) ||
      plan.variants[0]
    );
  }, [plan, selectedDuration]);

  // Calculate current price
  const currentPrice = useMemo(() => {
    if (activeVariant) return Number(activeVariant.price) || 0;
    if (!plan) return 0;
    switch (selectedDuration.toLowerCase()) {
      case 'pro_plus':
      case 'pro+':
      case 'annual':
        return Number(plan.annualPrice) || 0;
      case 'pro':
      case 'quarterly':
        return Number(plan.quarterlyPrice) || 0;
      case 'standard':
      case 'monthly':
      default:
        return Number(plan.monthlyPrice) || 0;
    }
  }, [plan, activeVariant, selectedDuration]);

  const priceFormatted = useMemo(() => `£${currentPrice.toFixed(2)}`, [currentPrice]);

  const durationLabel = useMemo(() => {
    if (activeVariant?.isCalendarYear || selectedDuration.toUpperCase().includes('PLUS')) {
      return '1 Calendar Year (365 Days)';
    }
    if (activeVariant?.durationDays === 180 || selectedDuration.toUpperCase() === 'PRO') {
      return '180 Days Access';
    }
    return '90 Days Access';
  }, [activeVariant, selectedDuration]);

  const externalPlanId = activeVariant?.id || plan?.selectedVariantId || plan?.id;
  const availableBalance =
    wallet?.centralAvailableBalance ?? wallet?.centralBalance ?? wallet?.topupBalance;
  const centralTopUpUrl =
    topUpUrl ||
    wallet?.topUpUrl ||
    `${(process.env.NEXT_PUBLIC_MCOM_SOLUTIONS_URL || 'http://localhost:3000').replace(/\/$/, '')}/dashboard/wallet`;

  const isBusy = isInitiating || isConfirming;
  const renewalLabel =
    selectedProvider === 'wallet'
      ? 'Auto-renews from MCOM Wallet'
      : 'Renews at period end';

  const handleConnectMcom = async () => {
    try {
      const { authorizeUrl } = await getSsoAuthorizeUrl();
      if (authorizeUrl) {
        window.location.href = authorizeUrl;
      }
    } catch {
      toast.error('Failed to start MCOM SSO. Please try again.');
    }
  };

  const handlePaymentError = (err: any) => {
    const code = err?.response?.data?.error || err?.response?.data?.code;
    const message =
      err?.response?.data?.message || err?.message || 'Payment could not be started.';

    if (code === 'ACCOUNT_NOT_LINKED' || message?.toLowerCase().includes('not linked')) {
      setNeedsMcomConnect(true);
      return;
    }

    setPaymentError(message);
    if (err?.response?.data?.topUpUrl) {
      setTopUpUrl(err.response.data.topUpUrl);
    }
    // A failed wallet charge (e.g. insufficient balance) must not be retried
    // with the same MCOM idempotency key after the user tops up.
    if (err?.response?.status === 402) {
      setCheckoutId(createCheckoutId());
    }
    toast.error(message);
  };

  const handleStartPayment = async () => {
    if (!externalPlanId) return;

    setPaymentError(null);
    setNeedsMcomConnect(false);

    try {
      const res = await initiatePurchase({
        externalPlanId,
        billingCycle: selectedDuration,
        provider: selectedProvider,
        checkoutId: checkoutId || undefined,
      });

      if (res.checkoutId) setCheckoutId(res.checkoutId);
      if (res.chargeId) setChargeId(res.chargeId);
      if (res.topUpUrl) setTopUpUrl(res.topUpUrl);

      if (selectedProvider === 'stripe') {
        if (!res.clientSecret) {
          throw new Error('Stripe did not return a payment intent. Please try again.');
        }
        setClientSecret(res.clientSecret);
        return;
      }

      if (selectedProvider === 'paypal') {
        if (!res.approvalUrl) {
          throw new Error('PayPal did not return an approval link. Please try again.');
        }
        setApprovalUrl(res.approvalUrl);
        return;
      }

      // Wallet charges settle immediately. Confirming grants the entitlement.
      await confirmPurchase({
        externalPlanId,
        billingCycle: selectedDuration,
        provider: 'wallet',
        checkoutId: res.checkoutId || checkoutId || undefined,
        chargeId: res.chargeId,
      });

      setIsSuccess(true);
      toast.success('Paid with MCOM Wallet! Subscription activated.');
      setTimeout(() => onConfirm(), 1500);
    } catch (err) {
      handlePaymentError(err);
    }
  };

  const handleStripeSuccess = () => {
    setIsSuccess(true);
    setTimeout(() => onConfirm(), 1500);
  };

  return (
    <AnimatePresence>
      {isOpen && plan && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 overflow-y-auto"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.95, y: 16 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.95, y: 16 }}
            className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden border border-gray-100"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="bg-gradient-to-r from-orange-600 to-amber-600 p-6 text-white flex justify-between items-start relative">
              <div>
                <div className="flex items-center gap-2">
                  <span className="bg-white/20 text-white text-xs font-bold px-2.5 py-0.5 rounded-full uppercase tracking-wider">
                    {durationLabel}
                  </span>
                </div>
                <h2 className="text-2xl font-black mt-1">Upgrade to {plan.name}</h2>
                <p className="text-white/80 text-sm mt-0.5">
                  Secure checkout · Instant entitlement activation.
                </p>
              </div>
              <button
                onClick={onClose}
                className="p-1.5 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            {/* Content Body */}
            <div className="p-6 space-y-6">
              {isSuccess ? (
                <div className="py-12 flex flex-col items-center justify-center text-center space-y-4">
                  <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center text-green-600">
                    <CheckCircle2 size={36} />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-gray-900">Plan Activated!</h3>
                    <p className="text-gray-500 text-sm mt-1">
                      Your business subscription to {plan.name} ({durationLabel}) is now active.
                    </p>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-orange-600 font-semibold">
                    <Sparkles size={16} />
                    <span>Updating your dashboard privileges...</span>
                  </div>
                </div>
              ) : needsMcomConnect ? (
                <div className="py-6 px-4 bg-orange-50 border border-orange-200 rounded-xl text-center space-y-4">
                  <div className="w-12 h-12 bg-orange-500 text-white rounded-full flex items-center justify-center mx-auto shadow-md">
                    <Zap size={24} />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-gray-900">Connect Your MCOM Account</h3>
                    <p className="text-gray-600 text-sm mt-1 max-w-sm mx-auto">
                      Subscriptions and payment processing are powered centrally by MCOM
                      Solutions. Connect your account to continue.
                    </p>
                  </div>
                  <button
                    onClick={handleConnectMcom}
                    className="w-full py-3 px-4 bg-orange-600 hover:bg-orange-700 active:bg-orange-800 text-white rounded-xl font-bold shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2"
                  >
                    <span>Connect with MCOM Central</span>
                    <ExternalLink size={16} />
                  </button>
                </div>
              ) : (
                <>
                  {/* Plan & Pricing Summary Box */}
                  <div className="p-4 bg-slate-50 border border-gray-200 rounded-xl flex justify-between items-center">
                    <div>
                      <span className="text-xs font-bold text-gray-500 uppercase tracking-wider block">
                        Selected Commitment
                      </span>
                      <span className="text-sm font-extrabold text-gray-900 block">
                        {plan.name} · {durationLabel}
                      </span>
                    </div>
                    <div className="text-right">
                      <span className="text-2xl font-black text-gray-900">{priceFormatted}</span>
                      <span className="text-[11px] text-gray-500 block font-medium">{renewalLabel}</span>
                    </div>
                  </div>

                  {/* Payment Method Selector */}
                  <div>
                    <label className="text-xs font-bold text-gray-500 uppercase tracking-wider block mb-2">
                      Select Payment Rail
                    </label>
                    <div className="grid grid-cols-3 gap-2">
                      <button
                        type="button"
                        disabled={isBusy}
                        onClick={() => {
                          setSelectedProvider('stripe');
                          setClientSecret(null);
                          setApprovalUrl(null);
                          setPaymentError(null);
                        }}
                        className={`p-3 rounded-xl border flex flex-col items-center gap-1.5 transition-all disabled:opacity-60 ${
                          selectedProvider === 'stripe'
                            ? 'border-orange-500 bg-orange-50/50 ring-2 ring-orange-500/20 text-orange-700 font-bold'
                            : 'border-gray-200 hover:border-gray-300 text-gray-600'
                        }`}
                      >
                        <CreditCard size={20} />
                        <span className="text-xs">Credit Card</span>
                      </button>

                      <button
                        type="button"
                        disabled={isBusy}
                        onClick={() => {
                          setSelectedProvider('paypal');
                          setClientSecret(null);
                          setApprovalUrl(null);
                          setPaymentError(null);
                        }}
                        className={`p-3 rounded-xl border flex flex-col items-center gap-1.5 transition-all disabled:opacity-60 ${
                          selectedProvider === 'paypal'
                            ? 'border-blue-500 bg-blue-50/50 ring-2 ring-blue-500/20 text-blue-700 font-bold'
                            : 'border-gray-200 hover:border-gray-300 text-gray-600'
                        }`}
                      >
                        <div className="text-sm font-black italic">PayPal</div>
                        <span className="text-xs">PayPal</span>
                      </button>

                      <button
                        type="button"
                        disabled={isBusy}
                        onClick={() => {
                          setSelectedProvider('wallet');
                          setClientSecret(null);
                          setApprovalUrl(null);
                          setPaymentError(null);
                        }}
                        className={`p-3 rounded-xl border flex flex-col items-center gap-1.5 transition-all disabled:opacity-60 ${
                          selectedProvider === 'wallet'
                            ? 'border-amber-500 bg-amber-50/50 ring-2 ring-amber-500/20 text-amber-700 font-bold'
                            : 'border-gray-200 hover:border-gray-300 text-gray-600'
                        }`}
                      >
                        <Wallet size={20} />
                        <span className="text-xs">MCOM Wallet</span>
                      </button>
                    </div>
                  </div>

                  {paymentError && (
                    <div className="bg-red-50 border border-red-200 rounded-xl p-3 text-sm text-red-700 flex gap-2">
                      <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
                      <div>
                        <p className="font-semibold">Payment could not be completed</p>
                        <p className="text-xs mt-0.5">{paymentError}</p>
                        {selectedProvider === 'wallet' && (
                          <a
                            href={centralTopUpUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-xs mt-1 underline font-semibold inline-block"
                          >
                            Top up your MCOM Wallet
                          </a>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Payment Form Container */}
                  <div className="pt-2 border-t border-gray-100">
                    {isBusy ? (
                      <div className="py-12 flex flex-col items-center justify-center text-gray-500 space-y-3">
                        <Loader2 className="h-8 w-8 animate-spin text-orange-500" />
                        <span className="text-sm font-medium">
                          {isConfirming ? 'Confirming payment...' : 'Connecting to MCOM Payments Hub...'}
                        </span>
                      </div>
                    ) : selectedProvider === 'stripe' ? (
                      !stripePromise ? (
                        <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-center text-sm text-amber-900">
                          Card checkout is unavailable: this environment has no Stripe publishable key configured.
                        </div>
                      ) : clientSecret ? (
                        <Elements stripe={stripePromise} options={{ clientSecret }}>
                          <McomStripeCheckout
                            externalPlanId={externalPlanId || ''}
                            billingCycle={selectedDuration}
                            checkoutId={checkoutId || ''}
                            amountText={priceFormatted}
                            onSuccess={handleStripeSuccess}
                          />
                        </Elements>
                      ) : (
                        <button
                          type="button"
                          onClick={handleStartPayment}
                          className="w-full py-3.5 px-4 bg-orange-600 hover:bg-orange-700 text-white rounded-xl font-bold shadow-md transition-all flex items-center justify-center gap-2"
                        >
                          <CreditCard size={18} />
                          Continue to card payment ({priceFormatted})
                        </button>
                      )
                    ) : selectedProvider === 'paypal' ? (
                      <div className="space-y-4 py-2">
                        <div className="bg-blue-50 p-4 rounded-xl border border-blue-100 text-sm text-blue-900 space-y-1">
                          <p className="font-semibold">PayPal Checkout</p>
                          <p className="text-xs text-blue-700">
                            You will be redirected to PayPal to authorize payment of{' '}
                            <strong className="font-bold">{priceFormatted}</strong>.
                          </p>
                        </div>
                        {approvalUrl ? (
                          <a
                            href={approvalUrl}
                            className="w-full py-3.5 px-4 bg-[#0070BA] hover:bg-[#003087] text-white rounded-xl font-bold shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2"
                          >
                            <span>Continue to PayPal ({priceFormatted})</span>
                            <ExternalLink size={16} />
                          </a>
                        ) : (
                          <button
                            type="button"
                            onClick={handleStartPayment}
                            className="w-full py-3.5 px-4 bg-[#0070BA] hover:bg-[#003087] text-white rounded-xl font-bold shadow-md transition-all flex items-center justify-center gap-2"
                          >
                            <span>Continue with PayPal ({priceFormatted})</span>
                            <ExternalLink size={16} />
                          </button>
                        )}
                      </div>
                    ) : (
                      /* Wallet Checkout */
                      <div className="space-y-4 py-2">
                        <div className="bg-amber-50 p-4 rounded-xl border border-amber-100 text-sm text-amber-900 space-y-1">
                          <p className="font-semibold">Centralised Ecosystem Wallet</p>
                          <p className="text-xs text-amber-700">
                            Pay <strong className="font-bold">{priceFormatted}</strong> instantly from
                            your Central MCOM Wallet.
                          </p>
                          {availableBalance !== undefined && availableBalance !== null && (
                            <p className="text-xs text-amber-800 font-medium">
                              Available balance: {Number(availableBalance).toFixed(2)} MCOM
                            </p>
                          )}
                        </div>

                        <button
                          type="button"
                          onClick={handleStartPayment}
                          disabled={isBusy}
                          className="w-full py-3.5 px-4 bg-amber-600 hover:bg-amber-700 active:bg-amber-800 text-white rounded-xl font-bold shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          <ShieldCheck size={18} />
                          <span>Pay with MCOM Wallet ({priceFormatted})</span>
                        </button>

                        <a
                          href={centralTopUpUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-xs text-center text-amber-700 underline font-semibold block"
                        >
                          Top up your MCOM Wallet
                        </a>
                      </div>
                    )}
                  </div>
                </>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
