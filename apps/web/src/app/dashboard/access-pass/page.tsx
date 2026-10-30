"use client";

import React, { useMemo, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  AlertCircle,
  CalendarDays,
  CheckCircle2,
  Clock,
  ChevronDown,
  CreditCard,
  Gift,
  KeyRound,
  Loader2,
  ShieldCheck,
  Sparkles,
  Ticket,
} from "lucide-react";
import { toast } from "sonner";
import {
  AccessPassPlan,
  useGetAccessPassPlans,
  useGetMyAccessPass,
  useRedeemAccessPassCode,
} from "@/services/admin/access-passes";
import { AccessPassPaymentModal } from "@/components/dashboard/access-pass/AccessPassPaymentModal";
import { useGetMyPackage } from "@/services/mcom-packages";

const formatDate = (value?: string | null) => {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "—";
  return date.toLocaleDateString("en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
};

export default function BusinessAccessPassPage() {
  const [code, setCode] = useState("");
  const [codeError, setCodeError] = useState<string | undefined>();
  const [selectedPlan, setSelectedPlan] = useState<AccessPassPlan | null>(null);
  const [expandedPlanId, setExpandedPlanId] = useState<string | null>(null);

  const {
    data: myPass,
    isLoading: myPassLoading,
    refetch: refetchMyPass,
  } = useGetMyAccessPass();
  const { data: plans, isLoading: plansLoading } = useGetAccessPassPlans();
  const { data: myPackage } = useGetMyPackage();
  const { mutateAsync: redeem, isPending: redeeming } =
    useRedeemAccessPassCode();

  const purchasablePlans = useMemo(
    () => (plans || []).filter((plan) => plan.purchaseEnabled),
    [plans],
  );

  const handleRedeem = async (event: React.FormEvent) => {
    event.preventDefault();
    const value = code.trim().toUpperCase();
    if (value.length < 4) {
      setCodeError("Enter a valid access pass code.");
      return;
    }
    setCodeError(undefined);
    try {
      await redeem(value);
      toast.success("Access pass redeemed successfully. Welcome back!");
      setCode("");
      await refetchMyPass();
    } catch (err: any) {
      const raw = err?.response?.data?.message;
      const message = Array.isArray(raw) ? raw.join(", ") : raw;
      setCodeError(message || "This code could not be redeemed.");
      toast.error(message || "This code could not be redeemed.");
    }
  };

  return (
    <div className="min-h-screen bg-slate-50/50 p-3 sm:p-6 lg:p-8">
      <div className="max-w-6xl mx-auto space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h1 className="text-2xl sm:text-3xl font-black text-gray-900 tracking-tight">
              Access Pass
            </h1>
            <p className="text-sm text-gray-500 mt-1">
              Buy a pass, redeem a gift code, or check the time left on your
              current access.
            </p>
          </div>
          <div className="flex flex-col sm:items-end gap-2">
            <div className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-white border border-gray-200 text-xs font-semibold text-gray-600 shadow-sm">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              One pass = full dashboard access for its duration
            </div>
            <Link
              href="/dashboard/subscription"
              className="text-xs font-bold text-orange-600 hover:text-orange-700 underline underline-offset-2"
            >
              Prefer a recurring plan? View subscription plans
            </Link>
            {myPackage?.upgradeUrl && (
              <a
                href={myPackage.upgradeUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs font-semibold text-gray-500 hover:text-gray-700 underline underline-offset-2"
              >
                View MCOM memberships on Central
              </a>
            )}
          </div>
        </div>

        {/* Current pass */}
        {myPassLoading ? (
          <div className="bg-white rounded-2xl border border-gray-200 p-10 flex justify-center">
            <Loader2 className="w-7 h-7 animate-spin text-orange-500" />
          </div>
        ) : myPass?.hasAccess && myPass.subscription ? (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className="rounded-2xl overflow-hidden border border-emerald-200 bg-white shadow-sm"
          >
            <div className="bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-700 p-6 text-white">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-5">
                <div>
                  <div className="inline-flex items-center gap-1.5 bg-white/20 px-2.5 py-0.5 rounded-full text-[11px] font-bold uppercase tracking-wider">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    Active access pass
                  </div>
                  <h2 className="text-2xl sm:text-3xl font-black mt-2">
                    {myPass.planName}
                  </h2>
                  <p className="text-emerald-50/90 text-sm mt-1">
                    Your business dashboard is unlocked for this pass.
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <div className="bg-white/10 backdrop-blur rounded-xl px-4 py-3 text-center">
                    <p className="text-2xl font-black">
                      {myPass.daysRemaining}
                    </p>
                    <p className="text-[10px] uppercase tracking-wider text-emerald-50/80">
                      Days left
                    </p>
                  </div>
                  <div className="bg-white/10 backdrop-blur rounded-xl px-4 py-3">
                    <p className="text-[10px] uppercase tracking-wider text-emerald-50/80">
                      Expires
                    </p>
                    <p className="text-sm font-bold">
                      {formatDate(myPass.expiresAt)}
                    </p>
                  </div>
                </div>
              </div>
            </div>
            <div className="p-5 grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-2">
                  Included in this pass
                </p>
                <ul className="space-y-1.5">
                  {(myPass.features || []).map((feature, index) => (
                    <li
                      key={`${feature}-${index}`}
                      className="flex items-start gap-2 text-sm text-gray-700"
                    >
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                      {feature}
                    </li>
                  ))}
                  {!myPass.features?.length && (
                    <li className="text-xs text-gray-400 italic">
                      No features listed.
                    </li>
                  )}
                </ul>
              </div>
              <div className="rounded-xl bg-slate-50 border border-gray-200 p-4 text-xs text-gray-600 space-y-2">
                <div className="flex justify-between gap-3">
                  <span className="text-gray-500">Access source</span>
                  <span className="font-bold capitalize text-gray-800">
                    {myPass.source}
                  </span>
                </div>
                <div className="flex justify-between gap-3">
                  <span className="text-gray-500">Started</span>
                  <span className="font-semibold text-gray-800">
                    {formatDate(
                      myPass.startsAt || myPass.subscription.startsAt,
                    )}
                  </span>
                </div>
                <div className="flex justify-between gap-3">
                  <span className="text-gray-500">Status</span>
                  <span className="font-semibold text-emerald-700 capitalize">
                    {myPass.status}
                  </span>
                </div>
              </div>
            </div>
          </motion.div>
        ) : (
          <div className="rounded-2xl border border-orange-200 bg-orange-50/60 p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-start gap-3">
              <div className="p-2.5 rounded-xl bg-white text-orange-600 border border-orange-100">
                <Ticket className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-base font-black text-gray-900">
                  No active access pass
                </h2>
                <p className="text-xs text-gray-600 mt-0.5">
                  Redeem a code below or purchase a pass to unlock the dashboard
                  immediately.
                </p>
              </div>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
          {/* Redeem code */}
          <div className="lg:col-span-1 bg-white rounded-2xl border border-gray-200 shadow-sm p-5">
            <div className="flex items-center gap-2 mb-1">
              <KeyRound className="w-5 h-5 text-orange-600" />
              <h2 className="text-lg font-black text-gray-900">
                Redeem a code
              </h2>
            </div>
            <p className="text-xs text-gray-500 mb-4">
              Got a gift or compensation code? Enter it exactly as received.
            </p>
            <form onSubmit={handleRedeem} className="space-y-3">
              <input
                value={code}
                onChange={(e) => {
                  setCode(e.target.value.toUpperCase());
                  setCodeError(undefined);
                }}
                placeholder="MCOM-XXXX-XXXX"
                maxLength={32}
                className={`w-full px-4 py-3 rounded-xl border font-mono font-bold tracking-widest text-center text-lg uppercase focus:outline-none focus:ring-2 ${
                  codeError
                    ? "border-red-400 bg-red-50/40 focus:ring-red-500"
                    : "border-gray-300 focus:ring-orange-500"
                }`}
              />
              {codeError && (
                <p className="text-xs text-red-600 flex items-start gap-1">
                  <AlertCircle className="w-3.5 h-3.5 shrink-0 mt-0.5" />
                  {codeError}
                </p>
              )}
              <button
                type="submit"
                disabled={redeeming || code.trim().length < 4}
                className="w-full inline-flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-orange-500 hover:bg-orange-600 text-white text-sm font-bold disabled:opacity-50"
              >
                {redeeming ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Gift className="w-4 h-4" />
                )}
                Redeem code
              </button>
            </form>
            <div className="mt-4 rounded-xl bg-blue-50 border border-blue-100 p-3 text-[11px] text-blue-800 leading-relaxed">
              Codes may be locked to one account or transferable. If a code was
              sent to a different email and is locked, it cannot be redeemed
              here.
            </div>
          </div>

          {/* Plans */}
          <div className="lg:col-span-2 space-y-4">
            <div>
              <h2 className="text-lg font-black text-gray-900">
                Available access passes
              </h2>
              <p className="text-xs text-gray-500">
                One-off payments. No recurring billing — access simply ends
                after the pass duration.
              </p>
            </div>

            {plansLoading ? (
              <div className="bg-white rounded-2xl border border-gray-200 p-10 flex justify-center">
                <Loader2 className="w-7 h-7 animate-spin text-orange-500" />
              </div>
            ) : !purchasablePlans.length ? (
              <div className="bg-white rounded-2xl border border-gray-200 p-10 text-center">
                <Sparkles className="w-10 h-10 text-gray-300 mx-auto mb-2" />
                <p className="text-sm font-bold text-gray-700">
                  No passes available right now
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  Check back later or ask an admin for an access code.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {purchasablePlans.map((plan) => (
                  <motion.div
                    key={plan.id}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5 flex flex-col justify-between hover:border-orange-300 transition-colors"
                  >
                    <button
                      type="button"
                      aria-expanded={expandedPlanId === plan.id}
                      aria-controls={`access-pass-details-${plan.id}`}
                      onClick={() => setExpandedPlanId((current) => current === plan.id ? null : plan.id)}
                      className="flex w-full items-center justify-between gap-3 text-left sm:hidden"
                    >
                      <span className="min-w-0 truncate text-sm font-black text-gray-900">{plan.name}</span>
                      <span className="flex shrink-0 items-center gap-2">
                        <span className="inline-flex items-center gap-1 rounded-full border border-orange-200 bg-orange-50 px-2 py-0.5 text-[10px] font-bold text-orange-700">
                          <Clock className="h-3 w-3" />{plan.durationDays}d
                        </span>
                        <ChevronDown className={`h-4 w-4 text-gray-500 transition-transform ${expandedPlanId === plan.id ? "rotate-180" : ""}`} />
                      </span>
                    </button>

                    <div id={`access-pass-details-${plan.id}`} className={`${expandedPlanId === plan.id ? "block" : "hidden"} sm:block`}>
                      <div className="hidden items-start justify-between gap-2 sm:flex">
                        <h3 className="text-base font-black text-gray-900">{plan.name}</h3>
                        <span className="inline-flex items-center gap-1 whitespace-nowrap rounded-full border border-orange-200 bg-orange-50 px-2 py-0.5 text-[10px] font-bold text-orange-700">
                          <Clock className="h-3 w-3" />{plan.durationDays}d
                        </span>
                      </div>
                      <p className="mt-1 line-clamp-2 text-xs text-gray-500 sm:min-h-[32px]">
                        {plan.description || "Dashboard access pass"}
                      </p>

                      <ul className="mt-3 space-y-1.5">
                        {(plan.features || []).map((feature, index) => (
                          <li key={`${feature}-${index}`} className={`flex items-start gap-1.5 text-xs text-gray-600 ${index >= 4 ? "sm:hidden" : ""}`}>
                            <CheckCircle2 className="mt-0.5 h-3.5 w-3.5 shrink-0 text-emerald-600" />
                            {feature}
                          </li>
                        ))}
                      </ul>

                      <div className="mt-4 flex items-center justify-between gap-3 border-t border-gray-100 pt-4">
                        <div>
                          <p className="text-2xl font-black text-gray-900">£{Number(plan.price).toFixed(2)}</p>
                          <p className="text-[10px] text-gray-500">one-off</p>
                        </div>
                        <button
                          onClick={() => setSelectedPlan(plan)}
                          className="inline-flex items-center gap-2 rounded-xl bg-orange-500 px-4 py-2.5 text-sm font-bold text-white hover:bg-orange-600"
                        >
                          <CreditCard className="h-4 w-4" />Buy pass
                        </button>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="rounded-2xl bg-white border border-gray-200 p-4 flex flex-wrap items-center justify-center gap-4 text-[11px] text-gray-500 font-medium">
          <span className="flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            Instant activation
          </span>
          <span>•</span>
          <span>Card, PayPal and MCOM Wallet</span>
          <span>•</span>
          <span>No auto-renewal</span>
        </div>
      </div>

      <AccessPassPaymentModal
        isOpen={Boolean(selectedPlan)}
        plan={selectedPlan}
        onClose={() => setSelectedPlan(null)}
        onSuccess={() => {
          setSelectedPlan(null);
          refetchMyPass();
        }}
      />
    </div>
  );
}
