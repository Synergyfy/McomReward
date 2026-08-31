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
} from 'lucide-react';
import { Elements } from '@stripe/react-stripe-js';
import { stripePromise } from '@/components/stripe-provider';
import McomStripeCheckout from './McomStripeCheckout';
import {
  McomPlan,
  useInitiatePurchase,
  useConfirmPurchase,
  getSsoAuthorizeUrl,
} from '@/services/mcom-packages';
import { toast } from 'sonner';

interface PaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  plan: McomPlan | null;
  initialBillingCycle?: 'monthly' | 'quarterly' | 'annual';
  onConfirm: () => void;
}

export default function PaymentModal({
  isOpen,
  onClose,
  plan,
  initialBillingCycle = 'monthly',
  onConfirm,
}: PaymentModalProps) {
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'quarterly' | 'annual'>(
    initialBillingCycle
  );
  const [selectedProvider, setSelectedProvider] = useState<'stripe' | 'paypal' | 'wallet'>(
    'stripe'
  );

  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [intentType, setIntentType] = useState<'payment' | 'setup'>('payment');
  const [paypalApprovalUrl, setPaypalApprovalUrl] = useState<string | null>(null);
  const [paypalOrderId, setPaypalOrderId] = useState<string | null>(null);

  const [needsMcomConnect, setNeedsMcomConnect] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [isWalletPaying, setIsWalletPaying] = useState(false);

  const { mutateAsync: initiatePurchase, isPending: isInitiating } = useInitiatePurchase();
  const { mutateAsync: confirmPurchase } = useConfirmPurchase();

  // Reset state when opening or plan changes
  useEffect(() => {
    if (isOpen && plan) {
      setClientSecret(null);
      setPaypalApprovalUrl(null);
      setPaypalOrderId(null);
      setNeedsMcomConnect(false);
      setIsSuccess(false);
      setBillingCycle(initialBillingCycle);
      setSelectedProvider('stripe');
    }
  }, [isOpen, plan?.id, initialBillingCycle]);

  // Calculate prices
  const currentPrice = useMemo(() => {
    if (!plan) return 0;
    if (plan.type === 'TRIAL') return 0;
    switch (billingCycle) {
      case 'annual':
        return Number(plan.annualPrice) || 0;
      case 'quarterly':
        return Number(plan.quarterlyPrice) || 0;
      case 'monthly':
      default:
        return Number(plan.monthlyPrice) || 0;
    }
  }, [plan, billingCycle]);

  const priceFormatted = useMemo(() => {
    if (!plan) return '£0';
    if (plan.type === 'TRIAL') return 'Free Trial';
    return `£${currentPrice.toFixed(2)}`;
  }, [plan, currentPrice]);

  // Trigger payment initiation whenever plan, billing cycle, or provider changes
  useEffect(() => {
    if (!isOpen || !plan) return;

    let isMounted = true;
    setClientSecret(null);
    setPaypalApprovalUrl(null);
    setPaypalOrderId(null);
    setNeedsMcomConnect(false);

    const runInitiate = async () => {
      try {
        const res = await initiatePurchase({
          externalPlanId: plan.id,
          billingCycle,
          provider: selectedProvider,
          returnUrl: typeof window !== 'undefined' ? `${window.location.origin}/dashboard?upgrade=success` : undefined,
          cancelUrl: typeof window !== 'undefined' ? window.location.href : undefined,
        });

        if (!isMounted) return;

        if (selectedProvider === 'stripe') {
          if (res.clientSecret) {
            setClientSecret(res.clientSecret);
            setIntentType(res.type === 'setup' ? 'setup' : 'payment');
          }
        } else if (selectedProvider === 'paypal') {
          if (res.approvalUrl) {
            setPaypalApprovalUrl(res.approvalUrl);
            setPaypalOrderId(res.orderId || null);
          }
        }
      } catch (err: any) {
        if (!isMounted) return;
        const errCode = err?.response?.data?.code;
        const errMsg = err?.response?.data?.message || err?.message;

        if (errCode === 'ACCOUNT_NOT_LINKED' || errMsg?.includes('not connected to MCOM')) {
          setNeedsMcomConnect(true);
        } else {
          toast.error(errMsg || 'Failed to prepare checkout');
        }
      }
    };

    runInitiate();

    return () => {
      isMounted = false;
    };
  }, [isOpen, plan?.id, billingCycle, selectedProvider]);

  // Handle MCOM SSO Connect Redirect
  const handleConnectMcom = async () => {
    try {
      const { authorizeUrl } = await getSsoAuthorizeUrl();
      if (authorizeUrl) {
        window.location.href = authorizeUrl;
      }
    } catch (err) {
      toast.error('Failed to start MCOM SSO. Please try again.');
    }
  };

  // Handle Wallet Payment
  const handleWalletPay = async () => {
    if (!plan) return;
    setIsWalletPaying(true);
    try {
      await initiatePurchase({
        externalPlanId: plan.id,
        billingCycle,
        provider: 'wallet',
      });

      await confirmPurchase({
        externalPlanId: plan.id,
        billingCycle,
        provider: 'wallet',
      });

      setIsSuccess(true);
      toast.success('Paid with MCOM Wallet! Plan activated.');
      setTimeout(() => {
        onConfirm();
      }, 1500);
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Wallet payment failed. Please check your balance.');
    } finally {
      setIsWalletPaying(false);
    }
  };

  const handleStripeSuccess = () => {
    setIsSuccess(true);
    setTimeout(() => {
      onConfirm();
    }, 1500);
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
                    {plan.type === 'TRIAL' ? 'Trial' : 'Subscription'}
                  </span>
                </div>
                <h2 className="text-2xl font-black mt-1">Upgrade to {plan.name}</h2>
                <p className="text-white/80 text-sm mt-0.5">
                  Complete checkout to unlock instant capabilities.
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
                      Your business has been successfully upgraded to {plan.name}.
                    </p>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-orange-600 font-semibold">
                    <Sparkles size={16} />
                    <span>Redirecting to your upgraded dashboard...</span>
                  </div>
                </div>
              ) : needsMcomConnect ? (
                /* Unlinked MCOM Account Prompt */
                <div className="py-6 px-4 bg-orange-50 border border-orange-200 rounded-xl text-center space-y-4">
                  <div className="w-12 h-12 bg-orange-500 text-white rounded-full flex items-center justify-center mx-auto shadow-md">
                    <Zap size={24} />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-gray-900">
                      Connect Your MCOM Account
                    </h3>
                    <p className="text-gray-600 text-sm mt-1 max-w-sm mx-auto">
                      Subscriptions and payment processing are powered by MCOM Central Solutions. Connect your account in 1 click to proceed.
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
                  {/* Billing Cycle Switcher */}
                  {plan.type !== 'TRIAL' && (
                    <div>
                      <label className="text-xs font-bold text-gray-500 uppercase tracking-wider block mb-2">
                        Billing Period
                      </label>
                      <div className="grid grid-cols-3 gap-2 bg-gray-100 p-1 rounded-xl">
                        <button
                          type="button"
                          onClick={() => setBillingCycle('monthly')}
                          className={`py-2 px-2 text-xs font-bold rounded-lg transition-all ${
                            billingCycle === 'monthly'
                              ? 'bg-white text-gray-900 shadow-sm'
                              : 'text-gray-600 hover:text-gray-900'
                          }`}
                        >
                          Monthly
                        </button>
                        <button
                          type="button"
                          onClick={() => setBillingCycle('quarterly')}
                          className={`py-2 px-2 text-xs font-bold rounded-lg transition-all relative ${
                            billingCycle === 'quarterly'
                              ? 'bg-white text-gray-900 shadow-sm'
                              : 'text-gray-600 hover:text-gray-900'
                          }`}
                        >
                          Quarterly
                          <span className="ml-1 text-[10px] bg-green-100 text-green-700 px-1 py-0.2 rounded font-semibold">
                            -15%
                          </span>
                        </button>
                        <button
                          type="button"
                          onClick={() => setBillingCycle('annual')}
                          className={`py-2 px-2 text-xs font-bold rounded-lg transition-all relative ${
                            billingCycle === 'annual'
                              ? 'bg-white text-gray-900 shadow-sm'
                              : 'text-gray-600 hover:text-gray-900'
                          }`}
                        >
                          Annual
                          <span className="ml-1 text-[10px] bg-green-100 text-green-700 px-1 py-0.2 rounded font-semibold">
                            -25%
                          </span>
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Payment Method Selector */}
                  <div>
                    <label className="text-xs font-bold text-gray-500 uppercase tracking-wider block mb-2">
                      Select Payment Method
                    </label>
                    <div className="grid grid-cols-3 gap-2">
                      <button
                        type="button"
                        onClick={() => setSelectedProvider('stripe')}
                        className={`p-3 rounded-xl border flex flex-col items-center gap-1.5 transition-all ${
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
                        onClick={() => setSelectedProvider('paypal')}
                        className={`p-3 rounded-xl border flex flex-col items-center gap-1.5 transition-all ${
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
                        onClick={() => setSelectedProvider('wallet')}
                        className={`p-3 rounded-xl border flex flex-col items-center gap-1.5 transition-all ${
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

                  {/* Active Checkout Container */}
                  <div className="pt-2 border-t border-gray-100">
                    {isInitiating ? (
                      <div className="py-12 flex flex-col items-center justify-center text-gray-500 space-y-3">
                        <Loader2 className="h-8 w-8 animate-spin text-orange-500" />
                        <span className="text-sm font-medium">
                          Connecting to MCOM Payment Hub...
                        </span>
                      </div>
                    ) : selectedProvider === 'stripe' ? (
                      clientSecret && stripePromise ? (
                        <Elements stripe={stripePromise} options={{ clientSecret }}>
                          <McomStripeCheckout
                            externalPlanId={plan.id}
                            billingCycle={billingCycle}
                            intentType={intentType}
                            amountText={priceFormatted}
                            onSuccess={handleStripeSuccess}
                          />
                        </Elements>
                      ) : (
                        <div className="text-center py-6 text-gray-500 text-sm">
                          Preparing Card checkout form...
                        </div>
                      )
                    ) : selectedProvider === 'paypal' ? (
                      <div className="space-y-4 py-2">
                        <div className="bg-blue-50 p-4 rounded-xl border border-blue-100 text-sm text-blue-900 space-y-1">
                          <p className="font-semibold">PayPal Checkout</p>
                          <p className="text-xs text-blue-700">
                            You will be redirected to PayPal to complete your payment of{' '}
                            <strong className="font-bold">{priceFormatted}</strong>.
                          </p>
                        </div>
                        {paypalApprovalUrl ? (
                          <a
                            href={paypalApprovalUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="w-full py-3.5 px-4 bg-[#0070BA] hover:bg-[#003087] text-white rounded-xl font-bold shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2"
                          >
                            <span>Pay with PayPal ({priceFormatted})</span>
                            <ExternalLink size={16} />
                          </a>
                        ) : (
                          <div className="text-center py-4 text-gray-400 text-sm">
                            Preparing PayPal order...
                          </div>
                        )}
                      </div>
                    ) : (
                      /* Wallet Checkout */
                      <div className="space-y-4 py-2">
                        <div className="bg-amber-50 p-4 rounded-xl border border-amber-100 text-sm text-amber-900 space-y-1">
                          <p className="font-semibold">Centralized Ecosystem Wallet</p>
                          <p className="text-xs text-amber-700">
                            Instantly charge your Central MCOM Wallet for{' '}
                            <strong className="font-bold">{priceFormatted}</strong> and unlock your subscription now.
                          </p>
                        </div>
                        <button
                          type="button"
                          onClick={handleWalletPay}
                          disabled={isWalletPaying}
                          className="w-full py-3.5 px-4 bg-amber-600 hover:bg-amber-700 active:bg-amber-800 text-white rounded-xl font-bold shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                        >
                          {isWalletPaying ? (
                            <>
                              <Loader2 className="h-5 w-5 animate-spin" />
                              <span>Charging Wallet...</span>
                            </>
                          ) : (
                            <>
                              <ShieldCheck size={18} />
                              <span>Pay with MCOM Wallet ({priceFormatted})</span>
                            </>
                          )}
                        </button>
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