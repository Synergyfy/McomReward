"use client";

import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  AlertCircle,
  CheckCircle2,
  CreditCard,
  ExternalLink,
  Loader2,
  ShieldCheck,
  Wallet,
  X,
  Zap,
} from "lucide-react";
import {
  Elements,
  PaymentElement,
  useElements,
  useStripe,
} from "@stripe/react-stripe-js";
import { stripePromise } from "@/components/stripe-provider";
import { toast } from "sonner";
import {
  AccessPassPlan,
  useConfirmAccessPassPurchase,
  useInitiateAccessPassPurchase,
} from "@/services/admin/access-passes";
import { useGetWallet } from "@/services/wallet/hook";

type Provider = "stripe" | "paypal" | "wallet";

function createCheckoutId() {
  if (
    typeof crypto !== "undefined" &&
    typeof crypto.randomUUID === "function"
  ) {
    return crypto.randomUUID();
  }
  return `ap-${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

function StripeAccessPassForm({
  plan,
  checkoutId,
  amountText,
  onSuccess,
}: {
  plan: AccessPassPlan;
  checkoutId: string;
  amountText: string;
  onSuccess: () => void;
}) {
  const stripe = useStripe();
  const elements = useElements();
  const { mutateAsync: confirm, isPending } = useConfirmAccessPassPurchase();
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!stripe || !elements) return;
    setSubmitting(true);
    setError(null);
    try {
      const { error: stripeError, paymentIntent } = await stripe.confirmPayment(
        {
          elements,
          redirect: "if_required",
        },
      );
      if (stripeError) {
        setError(stripeError.message || "Card payment failed.");
        return;
      }
      if (paymentIntent?.status === "succeeded") {
        await confirm({
          planId: plan.id,
          checkoutId,
          paymentIntentId: paymentIntent.id,
        });
        toast.success("Access pass activated!");
        onSuccess();
      } else {
        setError(
          `Payment is not complete (${paymentIntent?.status || "unknown"}).`,
        );
      }
    } catch (err: any) {
      setError(
        err?.response?.data?.message || err?.message || "Payment failed.",
      );
    } finally {
      setSubmitting(false);
    }
  };

  const busy = submitting || isPending;

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="bg-gray-50 p-3 rounded-lg border border-gray-100 flex items-center justify-between text-sm">
        <span className="text-gray-600 font-medium">Total to pay today:</span>
        <span className="text-gray-900 font-bold text-base">{amountText}</span>
      </div>
      <div className="min-h-[160px] py-1">
        <PaymentElement />
      </div>
      {error && (
        <div className="p-3 bg-red-50 border border-red-200 text-red-600 text-xs rounded-lg flex gap-2">
          <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
          <span>{error}</span>
        </div>
      )}
      <button
        type="submit"
        disabled={busy || !stripe || !elements}
        className="w-full py-3.5 px-4 bg-orange-600 hover:bg-orange-700 text-white rounded-xl font-bold shadow-md disabled:opacity-50 flex items-center justify-center gap-2"
      >
        {busy ? (
          <Loader2 className="w-5 h-5 animate-spin" />
        ) : (
          <ShieldCheck className="w-5 h-5" />
        )}
        Pay & activate ({amountText})
      </button>
      <p className="text-center text-[11px] text-gray-400">
        🔒 Secured by MCOM Payment Hub & Stripe
      </p>
    </form>
  );
}

export function AccessPassPaymentModal({
  isOpen,
  plan,
  onClose,
  onSuccess,
}: {
  isOpen: boolean;
  plan: AccessPassPlan | null;
  onClose: () => void;
  onSuccess: () => void;
}) {
  const [provider, setProvider] = useState<Provider>("stripe");
  const [checkoutId, setCheckoutId] = useState(createCheckoutId());
  const [chargeId, setChargeId] = useState<string | null>(null);
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [approvalUrl, setApprovalUrl] = useState<string | null>(null);
  const [topUpUrl, setTopUpUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [needsConnect, setNeedsConnect] = useState(false);
  const [success, setSuccess] = useState(false);

  const { mutateAsync: initiate, isPending: initiating } =
    useInitiateAccessPassPurchase();
  const { mutateAsync: confirm, isPending: confirming } =
    useConfirmAccessPassPurchase();
  const { data: wallet } = useGetWallet();

  useEffect(() => {
    if (isOpen && plan) {
      setProvider("stripe");
      setCheckoutId(createCheckoutId());
      setChargeId(null);
      setClientSecret(null);
      setApprovalUrl(null);
      setTopUpUrl(null);
      setError(null);
      setNeedsConnect(false);
      setSuccess(false);
    }
  }, [isOpen, plan?.id]);

  if (!isOpen || !plan) return null;

  const amountText = `£${Number(plan.price).toFixed(2)}`;
  const isFreePass =
    Number.isFinite(Number(plan.price)) && Number(plan.price) <= 0;
  const centralTopUpUrl =
    topUpUrl ||
    wallet?.topUpUrl ||
    `${(process.env.NEXT_PUBLIC_MCOM_SOLUTIONS_URL || "http://localhost:3000").replace(/\/$/, "")}/dashboard/wallet`;

  const handleError = (err: any) => {
    const code = err?.response?.data?.error || err?.response?.data?.code;
    const message =
      err?.response?.data?.message ||
      err?.message ||
      "Payment could not be started.";
    if (
      code === "ACCOUNT_NOT_LINKED" ||
      String(message).toLowerCase().includes("not linked")
    ) {
      setNeedsConnect(true);
      return;
    }
    if (err?.response?.data?.topUpUrl) setTopUpUrl(err.response.data.topUpUrl);
    setError(message);
    if (err?.response?.status === 402) setCheckoutId(createCheckoutId());
    toast.error(message);
  };

  const startPayment = async () => {
    setError(null);
    setNeedsConnect(false);
    try {
      const response = await initiate({
        planId: plan.id,
        provider,
        checkoutId,
      });
      if (response.checkoutId) setCheckoutId(response.checkoutId);
      if (response.chargeId) setChargeId(response.chargeId);
      if (response.topUpUrl) setTopUpUrl(response.topUpUrl);

      if (response.free) {
        setSuccess(true);
        toast.success("Access pass activated!");
        setTimeout(onSuccess, 1400);
        return;
      }

      if (provider === "stripe") {
        if (!response.clientSecret) {
          throw new Error("Stripe did not return a payment intent.");
        }
        setClientSecret(response.clientSecret);
        return;
      }

      if (provider === "paypal") {
        if (!response.approvalUrl) {
          throw new Error("PayPal did not return an approval link.");
        }
        setApprovalUrl(response.approvalUrl);
        return;
      }

      await confirm({
        planId: plan.id,
        checkoutId: response.checkoutId || checkoutId,
        chargeId: response.chargeId || chargeId || undefined,
      });
      setSuccess(true);
      toast.success("Access pass activated with MCOM Wallet!");
      setTimeout(onSuccess, 1400);
    } catch (err) {
      handleError(err);
    }
  };

  const isBusy = initiating || confirming;
  const providerButton = (
    value: Provider,
    label: string,
    icon: React.ReactNode,
  ) => (
    <button
      type="button"
      disabled={isBusy}
      onClick={() => {
        setProvider(value);
        setClientSecret(null);
        setApprovalUrl(null);
        setError(null);
      }}
      className={`p-3 rounded-xl border flex flex-col items-center gap-1.5 transition-all disabled:opacity-60 ${
        provider === value
          ? "border-orange-500 bg-orange-50/50 ring-2 ring-orange-500/20 text-orange-700 font-bold"
          : "border-gray-200 hover:border-gray-300 text-gray-600"
      }`}
    >
      {icon}
      <span className="text-xs">{label}</span>
    </button>
  );

  return (
    <AnimatePresence>
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
          className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden border border-gray-100"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="bg-gradient-to-r from-orange-600 to-amber-600 p-6 text-white flex justify-between items-start">
            <div>
              <span className="bg-white/20 text-xs font-bold px-2.5 py-0.5 rounded-full uppercase tracking-wider">
                {plan.durationDays} days access
              </span>
              <h2 className="text-2xl font-black mt-2">{plan.name}</h2>
              <p className="text-white/80 text-sm mt-0.5">
                One-off payment · Instant activation
              </p>
            </div>
            <button
              onClick={onClose}
              className="p-1.5 rounded-full bg-white/10 hover:bg-white/20"
            >
              <X size={20} />
            </button>
          </div>

          <div className="p-6 space-y-5">
            {success ? (
              <div className="py-12 flex flex-col items-center text-center space-y-3">
                <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center text-emerald-600">
                  <CheckCircle2 size={34} />
                </div>
                <h3 className="text-xl font-bold text-gray-900">
                  Access pass activated
                </h3>
                <p className="text-sm text-gray-500">
                  Your dashboard access is now active for {plan.durationDays}{" "}
                  days.
                </p>
              </div>
            ) : needsConnect ? (
              <div className="py-6 px-4 bg-orange-50 border border-orange-200 rounded-xl text-center space-y-3">
                <div className="w-12 h-12 bg-orange-500 text-white rounded-full flex items-center justify-center mx-auto">
                  <Zap size={22} />
                </div>
                <h3 className="text-lg font-bold text-gray-900">
                  Connect your MCOM account
                </h3>
                <p className="text-sm text-gray-600">
                  Wallet payments require your business to be linked to MCOM
                  Central.
                </p>
                <a
                  href="/sso-login"
                  className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-orange-600 text-white text-sm font-bold"
                >
                  Connect MCOM account <ExternalLink size={14} />
                </a>
              </div>
            ) : (
              <>
                <div className="p-4 bg-slate-50 border border-gray-200 rounded-xl flex justify-between items-center">
                  <div>
                    <span className="text-[11px] font-bold text-gray-500 uppercase tracking-wider block">
                      Access pass
                    </span>
                    <span className="text-sm font-extrabold text-gray-900">
                      {plan.name} · {plan.durationDays} days
                    </span>
                  </div>
                  <span className="text-2xl font-black text-gray-900">
                    {amountText}
                  </span>
                </div>

                {isFreePass ? (
                  <div className="bg-emerald-50 p-4 rounded-xl border border-emerald-100 text-sm text-emerald-900">
                    <p className="font-semibold">Free access pass</p>
                    <p className="text-xs text-emerald-700 mt-0.5">
                      No payment is required — activate it instantly.
                    </p>
                  </div>
                ) : (
                  <div>
                    <label className="text-xs font-bold text-gray-500 uppercase tracking-wider block mb-2">
                      Payment method
                    </label>
                    <div className="grid grid-cols-3 gap-2">
                      {providerButton(
                        "stripe",
                        "Card",
                        <CreditCard size={20} />,
                      )}
                      {providerButton(
                        "paypal",
                        "PayPal",
                        <span className="text-sm font-black italic">
                          PayPal
                        </span>,
                      )}
                      {providerButton(
                        "wallet",
                        "MCOM Wallet",
                        <Wallet size={20} />,
                      )}
                    </div>
                  </div>
                )}

                {error && (
                  <div className="bg-red-50 border border-red-200 rounded-xl p-3 text-sm text-red-700 flex gap-2">
                    <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
                    <div>
                      <p className="font-semibold">
                        Payment could not be completed
                      </p>
                      <p className="text-xs mt-0.5">{error}</p>
                      {provider === "wallet" && (
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

                <div className="pt-2 border-t border-gray-100">
                  {isBusy ? (
                    <div className="py-10 flex flex-col items-center text-gray-500 gap-2">
                      <Loader2 className="w-8 h-8 animate-spin text-orange-500" />
                      <span className="text-sm">
                        {confirming
                          ? "Confirming payment…"
                          : isFreePass
                            ? "Activating your pass…"
                            : "Connecting to MCOM Payments…"}
                      </span>
                    </div>
                  ) : isFreePass ? (
                    <button
                      onClick={startPayment}
                      className="w-full py-3.5 px-4 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold flex items-center justify-center gap-2"
                    >
                      <Zap size={18} /> Activate free pass
                    </button>
                  ) : provider === "stripe" ? (
                    clientSecret && stripePromise ? (
                      <Elements
                        stripe={stripePromise}
                        options={{ clientSecret }}
                      >
                        <StripeAccessPassForm
                          plan={plan}
                          checkoutId={checkoutId}
                          amountText={amountText}
                          onSuccess={() => {
                            setSuccess(true);
                            setTimeout(onSuccess, 1400);
                          }}
                        />
                      </Elements>
                    ) : (
                      <button
                        onClick={startPayment}
                        className="w-full py-3.5 px-4 bg-orange-600 hover:bg-orange-700 text-white rounded-xl font-bold flex items-center justify-center gap-2"
                      >
                        <CreditCard size={18} /> Continue to card payment (
                        {amountText})
                      </button>
                    )
                  ) : provider === "paypal" ? (
                    <div className="space-y-3">
                      <div className="bg-blue-50 p-4 rounded-xl border border-blue-100 text-sm text-blue-900">
                        <p className="font-semibold">PayPal checkout</p>
                        <p className="text-xs text-blue-700 mt-0.5">
                          You will be redirected to approve {amountText}.
                        </p>
                      </div>
                      {approvalUrl ? (
                        <a
                          href={approvalUrl}
                          className="w-full py-3.5 px-4 bg-[#0070BA] hover:bg-[#003087] text-white rounded-xl font-bold flex items-center justify-center gap-2"
                        >
                          Continue to PayPal ({amountText}){" "}
                          <ExternalLink size={16} />
                        </a>
                      ) : (
                        <button
                          onClick={startPayment}
                          className="w-full py-3.5 px-4 bg-[#0070BA] hover:bg-[#003087] text-white rounded-xl font-bold flex items-center justify-center gap-2"
                        >
                          Continue with PayPal ({amountText}){" "}
                          <ExternalLink size={16} />
                        </button>
                      )}
                    </div>
                  ) : (
                    <div className="space-y-3">
                      <div className="bg-amber-50 p-4 rounded-xl border border-amber-100 text-sm text-amber-900">
                        <p className="font-semibold">MCOM Wallet</p>
                        <p className="text-xs text-amber-700 mt-0.5">
                          Pay {amountText} instantly from your central wallet.
                        </p>
                      </div>
                      <button
                        onClick={startPayment}
                        className="w-full py-3.5 px-4 bg-amber-600 hover:bg-amber-700 text-white rounded-xl font-bold flex items-center justify-center gap-2"
                      >
                        <ShieldCheck size={18} /> Pay with MCOM Wallet (
                        {amountText})
                      </button>
                    </div>
                  )}
                </div>
              </>
            )}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
