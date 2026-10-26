"use client";

import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
  AlertCircle,
  CheckCircle2,
  Copy,
  Gift,
  KeyRound,
  Loader2,
  Mail,
  X,
} from "lucide-react";
import { toast } from "sonner";
import {
  AccessPassPlan,
  useCreateAccessPassCode,
} from "@/services/admin/access-passes";

interface GenerateCodeModalProps {
  isOpen: boolean;
  onClose: () => void;
  plans: AccessPassPlan[];
  defaultPlanId?: string;
}

export function GenerateCodeModal({
  isOpen,
  onClose,
  plans,
  defaultPlanId,
}: GenerateCodeModalProps) {
  const [planId, setPlanId] = useState(defaultPlanId || "");
  const [email, setEmail] = useState("");
  const [restrictToAssignedUser, setRestrictToAssignedUser] = useState(true);
  const [expiresAt, setExpiresAt] = useState("");
  const [maxUses, setMaxUses] = useState("1");
  const [note, setNote] = useState("");
  const [sendEmail, setSendEmail] = useState(true);
  const [attempted, setAttempted] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string | undefined>();

  const { mutateAsync, isPending } = useCreateAccessPassCode();
  const firstPlanId = plans[0]?.id;

  useEffect(() => {
    if (isOpen) {
      setPlanId(defaultPlanId || firstPlanId || "");
      setEmail("");
      setRestrictToAssignedUser(true);
      setExpiresAt("");
      setMaxUses("1");
      setNote("");
      setSendEmail(true);
      setAttempted(false);
      setResult(null);
      setError(undefined);
    }
    // Intentionally keyed on the selected plan id, not the full plans array:
    // invalidating the query after generating a code refetches plans and must
    // not wipe the freshly generated code result.
  }, [isOpen, defaultPlanId, firstPlanId]);

  if (!isOpen) return null;

  const validate = () => {
    if (!planId) return "Select an access pass plan.";
    if (email.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      return "Enter a valid email address.";
    }
    if (
      !/^\d+$/.test(maxUses) ||
      Number(maxUses) < 1 ||
      Number(maxUses) > 1000
    ) {
      return "Max uses must be a whole number between 1 and 1000.";
    }
    if (expiresAt && new Date(expiresAt) <= new Date()) {
      return "Code expiry must be in the future.";
    }
    return undefined;
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setAttempted(true);
    const validationError = validate();
    setError(validationError);
    if (validationError) return;

    try {
      const created = await mutateAsync({
        planId,
        email: email.trim() || undefined,
        restrictToAssignedUser: email.trim() ? restrictToAssignedUser : false,
        expiresAt: expiresAt ? new Date(expiresAt).toISOString() : undefined,
        maxUses: Number(maxUses),
        note: note.trim() || undefined,
        sendEmail: email.trim() ? sendEmail : false,
      });
      setResult(created);
      toast.success("Access pass code generated successfully.");
    } catch (err: any) {
      const raw = err?.response?.data?.message;
      const message = Array.isArray(raw) ? raw.join(", ") : raw;
      setError(message || "Could not generate the code.");
    }
  };

  const copyCode = async () => {
    if (!result?.code) return;
    try {
      await navigator.clipboard.writeText(result.code);
      toast.success("Code copied to clipboard.");
    } catch {
      toast.error("Could not copy. Select the code manually.");
    }
  };

  const selectedPlan = plans.find((plan) => plan.id === planId);

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto border border-gray-100"
      >
        <div className="p-6 border-b border-gray-100 flex items-start justify-between gap-4">
          <div className="flex items-start gap-3">
            <div className="p-2.5 rounded-xl bg-orange-50 text-orange-600 border border-orange-100">
              <KeyRound className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-black text-gray-900">
                Generate access code
              </h3>
              <p className="text-xs text-gray-500 mt-0.5">
                Gift a pass or send it to a specific business.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-gray-400 hover:bg-gray-100 hover:text-gray-600"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {result ? (
          <div className="p-6 space-y-5">
            <div className="text-center space-y-3">
              <div className="w-14 h-14 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-7 h-7" />
              </div>
              <div>
                <h4 className="text-lg font-black text-gray-900">Code ready</h4>
                <p className="text-xs text-gray-500 mt-1">
                  {result.emailQueued
                    ? `A copy has been queued for ${result.assignedEmail}.`
                    : "Share this code with the recipient."}
                </p>
              </div>
            </div>

            <div className="rounded-2xl border border-dashed border-orange-300 bg-orange-50 px-4 py-5 text-center">
              <p className="text-[11px] font-bold text-orange-700 uppercase tracking-wider mb-1">
                Redemption code
              </p>
              <p className="text-2xl font-black tracking-[0.2em] text-orange-700 font-mono">
                {result.code}
              </p>
            </div>

            <div className="text-xs text-gray-600 space-y-1">
              <p>
                <span className="font-semibold text-gray-800">Plan:</span>{" "}
                {selectedPlan?.name || result.plan?.name}
              </p>
              <p>
                <span className="font-semibold text-gray-800">Duration:</span>{" "}
                {selectedPlan?.durationDays || result.plan?.durationDays} days
              </p>
              <p>
                <span className="font-semibold text-gray-800">Uses:</span>{" "}
                {result.maxUses}
              </p>
              <p>
                <span className="font-semibold text-gray-800">
                  Restriction:
                </span>{" "}
                {result.assignedEmail
                  ? result.restrictToAssignedUser
                    ? `Only ${result.assignedEmail}`
                    : "Transferable"
                  : "Anyone with the code"}
              </p>
            </div>

            <div className="flex gap-2">
              <button
                type="button"
                onClick={copyCode}
                className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border border-gray-300 text-sm font-bold text-gray-700 hover:bg-gray-50"
              >
                <Copy className="w-4 h-4" />
                Copy code
              </button>
              <button
                type="button"
                onClick={onClose}
                className="flex-1 px-4 py-2.5 rounded-xl bg-orange-500 hover:bg-orange-600 text-white text-sm font-bold"
              >
                Done
              </button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="p-6 space-y-4">
            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                Access pass plan <span className="text-red-500">*</span>
              </label>
              <select
                value={planId}
                onChange={(e) => setPlanId(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-gray-300 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-orange-500"
              >
                <option value="">Select a plan</option>
                {plans.map((plan) => (
                  <option key={plan.id} value={plan.id}>
                    {plan.name} · {plan.durationDays} days · £
                    {Number(plan.price).toFixed(2)}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                Assign to email
              </label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="business@example.com (optional)"
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
                />
              </div>
              <p className="text-[11px] text-gray-500 mt-1">
                Leave blank for a generic gift code that anyone can redeem. Add
                an email to send it to a specific person and choose whether they
                can share it.
              </p>
            </div>

            <div className="rounded-xl border border-gray-200 p-3 space-y-2">
              <p className="text-[11px] font-bold text-gray-500 uppercase tracking-wider">
                Who can redeem it?
              </p>

              {!email.trim() ? (
                <div className="flex items-start gap-2.5 rounded-lg bg-emerald-50 border border-emerald-100 p-2.5">
                  <Gift className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <span className="text-xs text-emerald-900">
                    <span className="block font-semibold">
                      Anyone with the code
                    </span>
                    No email attached, so this is a generic gift code. Whoever
                    redeems it first gets the access pass.
                  </span>
                </div>
              ) : (
                <>
                  <label className="flex items-start gap-2.5 cursor-pointer">
                    <input
                      type="radio"
                      checked={restrictToAssignedUser}
                      onChange={() => setRestrictToAssignedUser(true)}
                      className="mt-0.5 h-4 w-4 text-orange-600"
                    />
                    <span className="text-xs text-gray-700">
                      <span className="block font-semibold text-gray-900">
                        Only {email.trim()}
                      </span>
                      Locked to this account. The email explains it cannot be
                      shared.
                    </span>
                  </label>
                  <label className="flex items-start gap-2.5 cursor-pointer">
                    <input
                      type="radio"
                      checked={!restrictToAssignedUser}
                      onChange={() => setRestrictToAssignedUser(false)}
                      className="mt-0.5 h-4 w-4 text-orange-600"
                    />
                    <span className="text-xs text-gray-700">
                      <span className="block font-semibold text-gray-900">
                        Transferable gift
                      </span>
                      Sent to this email, but they may give the code to someone
                      else.
                    </span>
                  </label>
                </>
              )}
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                  Code expires
                </label>
                <input
                  type="date"
                  value={expiresAt}
                  onChange={(e) => setExpiresAt(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                  Max uses
                </label>
                <input
                  type="text"
                  inputMode="numeric"
                  value={maxUses}
                  onChange={(e) => setMaxUses(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                Internal note
              </label>
              <textarea
                value={note}
                onChange={(e) => setNote(e.target.value)}
                rows={2}
                maxLength={500}
                placeholder="e.g. Compensation for delayed onboarding"
                className="w-full px-3.5 py-2.5 rounded-xl border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
              />
            </div>

            {email.trim() && (
              <label className="flex items-start gap-2.5 p-3 rounded-xl border border-blue-200 bg-blue-50 cursor-pointer">
                <input
                  type="checkbox"
                  checked={sendEmail}
                  onChange={(e) => setSendEmail(e.target.checked)}
                  className="mt-0.5 h-4 w-4 text-blue-600 rounded"
                />
                <span className="text-xs text-blue-900">
                  <span className="block font-semibold">
                    Email the code now
                  </span>
                  Queued securely; includes the plan, duration, expiry and
                  sharing rules.
                </span>
              </label>
            )}

            {(attempted && error) || error ? (
              <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-xs text-red-700 flex items-start gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                <span>{error}</span>
              </div>
            ) : null}

            <div className="flex justify-end gap-2 pt-1">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2.5 rounded-xl text-sm font-semibold text-gray-600 hover:bg-gray-100"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isPending || plans.length === 0}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold text-white bg-orange-500 hover:bg-orange-600 disabled:opacity-50"
              >
                {isPending ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Gift className="w-4 h-4" />
                )}
                Generate code
              </button>
            </div>
          </form>
        )}
      </motion.div>
    </div>
  );
}
