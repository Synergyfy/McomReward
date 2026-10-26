"use client";

import React, { useMemo, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  AlertCircle,
  Ban,
  CheckCircle2,
  Copy,
  Gift,
  KeyRound,
  Layers,
  Loader2,
  Mail,
  Pencil,
  Plus,
  Search,
  Trash2,
  Users,
  XCircle,
} from "lucide-react";
import { toast } from "sonner";
import {
  AccessPassCode,
  AccessPassPlan,
  AccessPassSubscription,
  useDeleteAccessPassPlan,
  useGetAccessPassCodes,
  useGetAccessPassPlans,
  useGetAccessPassSubscriptions,
  useGetAdminAccessPassPlans,
  useResendAccessPassCode,
  useRevokeAccessPassCode,
  useRevokeAccessPassSubscription,
} from "@/services/admin/access-passes";
import { GenerateCodeModal } from "@/components/admin/access-passes/GenerateCodeModal";

type Tab = "plans" | "codes" | "subscribers";

const formatDate = (value?: string | null) => {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "—";
  return date.toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
};

const statusStyles: Record<string, string> = {
  active: "bg-emerald-50 text-emerald-700 border-emerald-200",
  expired: "bg-gray-100 text-gray-600 border-gray-200",
  revoked: "bg-red-50 text-red-700 border-red-200",
  exhausted: "bg-amber-50 text-amber-700 border-amber-200",
};

function StatusBadge({ status }: { status: string }) {
  return (
    <span
      className={`inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-full border capitalize ${
        statusStyles[status] || "bg-gray-100 text-gray-600 border-gray-200"
      }`}
    >
      {status === "active" ? <CheckCircle2 className="w-3 h-3" /> : null}
      {status}
    </span>
  );
}

export default function AdminAccessPassesPage() {
  const [tab, setTab] = useState<Tab>("plans");
  const [codeModalOpen, setCodeModalOpen] = useState(false);
  const [codePlanId, setCodePlanId] = useState<string | undefined>();
  const [planToDelete, setPlanToDelete] = useState<AccessPassPlan | null>(null);
  const [subscriptionToRevoke, setSubscriptionToRevoke] =
    useState<AccessPassSubscription | null>(null);
  const [revokeReason, setRevokeReason] = useState("");
  const [revokeAttempted, setRevokeAttempted] = useState(false);
  const [copied, setCopied] = useState<string | null>(null);

  const [codeSearch, setCodeSearch] = useState("");
  const [codeStatus, setCodeStatus] = useState("");
  const [codePage, setCodePage] = useState(1);

  const [subSearch, setSubSearch] = useState("");
  const [subStatus, setSubStatus] = useState("");
  const [subPage, setSubPage] = useState(1);

  const { data: plans, isLoading: plansLoading } = useGetAdminAccessPassPlans();
  const { data: publicPlans } = useGetAccessPassPlans();
  const { data: codes, isLoading: codesLoading } = useGetAccessPassCodes({
    page: codePage,
    limit: 20,
    search: codeSearch || undefined,
    status: codeStatus || undefined,
  });
  const { data: subscriptions, isLoading: subsLoading } =
    useGetAccessPassSubscriptions({
      page: subPage,
      limit: 20,
      search: subSearch || undefined,
      status: subStatus || undefined,
    });

  const { mutateAsync: deletePlan, isPending: deletingPlan } =
    useDeleteAccessPassPlan();
  const { mutateAsync: revokeCode, isPending: revokingCode } =
    useRevokeAccessPassCode();
  const { mutateAsync: resendCode, isPending: resendingCode } =
    useResendAccessPassCode();
  const { mutateAsync: revokeSubscription, isPending: revokingSubscription } =
    useRevokeAccessPassSubscription();

  const activePlansForCodes = useMemo(
    () => (plans || []).filter((plan) => plan.isActive),
    [plans],
  );

  const stats = useMemo(() => {
    const list = plans || [];
    return {
      plans: list.length,
      activePlans: list.filter((plan) => plan.isActive).length,
      codes: list.reduce((sum, plan) => sum + (plan.codeCount || 0), 0),
      activeSubscribers: list.reduce(
        (sum, plan) => sum + (plan.activeSubscriberCount || 0),
        0,
      ),
    };
  }, [plans]);

  const copyCode = async (code: string) => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(code);
      setTimeout(() => setCopied(null), 1800);
      toast.success("Code copied.");
    } catch {
      toast.error("Could not copy code.");
    }
  };

  const handleDeletePlan = async () => {
    if (!planToDelete) return;
    try {
      await deletePlan(planToDelete.id);
      toast.success(`"${planToDelete.name}" deactivated.`);
      setPlanToDelete(null);
    } catch (err: any) {
      const raw = err?.response?.data?.message;
      toast.error(
        Array.isArray(raw) ? raw.join(", ") : raw || "Delete failed.",
      );
    }
  };

  const handleRevokeCode = async (code: AccessPassCode) => {
    try {
      await revokeCode(code.id);
      toast.success("Code revoked.");
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Could not revoke code.");
    }
  };

  const handleResendCode = async (code: AccessPassCode) => {
    try {
      await resendCode(code.id);
      toast.success(`Code queued for ${code.assignedEmail}.`);
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Could not resend code.");
    }
  };

  const handleRevokeSubscription = async () => {
    if (!subscriptionToRevoke) return;
    setRevokeAttempted(true);
    if (revokeReason.trim().length < 3) return;

    try {
      await revokeSubscription({
        id: subscriptionToRevoke.id,
        reason: revokeReason.trim(),
      });
      toast.success("Access revoked and the business notified by email.");
      setSubscriptionToRevoke(null);
      setRevokeReason("");
      setRevokeAttempted(false);
    } catch (err: any) {
      const raw = err?.response?.data?.message;
      toast.error(
        Array.isArray(raw) ? raw.join(", ") : raw || "Revoke failed.",
      );
    }
  };

  return (
    <div className="p-6 md:p-8 space-y-6 max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-gray-200 shadow-sm">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 bg-orange-50 text-orange-600 rounded-xl">
              <KeyRound className="w-5 h-5" />
            </span>
            <h1 className="text-2xl font-black text-gray-900">Access Passes</h1>
          </div>
          <p className="text-sm text-gray-500 mt-1">
            Create single-tier passes, gift access codes, manage subscribers and
            revoke access.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => {
              setCodePlanId(undefined);
              setCodeModalOpen(true);
            }}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-orange-200 bg-orange-50 text-orange-700 text-sm font-bold hover:bg-orange-100"
          >
            <Gift className="w-4 h-4" />
            Generate code
          </button>
          <Link
            href="/admin/access-passes/new"
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-orange-500 hover:bg-orange-600 text-white text-sm font-bold shadow-sm"
          >
            <Plus className="w-4 h-4" />
            New access pass
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {[
          {
            label: "Total passes",
            value: stats.plans,
            icon: Layers,
            tone: "bg-blue-50 text-blue-600",
          },
          {
            label: "Active passes",
            value: stats.activePlans,
            icon: CheckCircle2,
            tone: "bg-emerald-50 text-emerald-600",
          },
          {
            label: "Codes generated",
            value: stats.codes,
            icon: KeyRound,
            tone: "bg-orange-50 text-orange-600",
          },
          {
            label: "Active subscribers",
            value: stats.activeSubscribers,
            icon: Users,
            tone: "bg-purple-50 text-purple-600",
          },
        ].map((stat) => (
          <div
            key={stat.label}
            className="bg-white rounded-2xl border border-gray-200 shadow-sm p-4 flex items-center gap-3"
          >
            <div className={`p-2.5 rounded-xl ${stat.tone}`}>
              <stat.icon className="w-5 h-5" />
            </div>
            <div>
              <p className="text-2xl font-black text-gray-900">{stat.value}</p>
              <p className="text-[11px] font-medium text-gray-500">
                {stat.label}
              </p>
            </div>
          </div>
        ))}
      </div>

      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="flex border-b border-gray-200">
          {[
            { key: "plans" as Tab, label: "Plans", icon: Layers },
            { key: "codes" as Tab, label: "Codes", icon: KeyRound },
            { key: "subscribers" as Tab, label: "Subscribers", icon: Users },
          ].map((item) => (
            <button
              key={item.key}
              onClick={() => setTab(item.key)}
              className={`flex-1 sm:flex-none inline-flex items-center justify-center gap-2 px-5 py-3.5 text-sm font-bold border-b-2 transition-colors ${
                tab === item.key
                  ? "text-orange-600 border-orange-500 bg-orange-50/40"
                  : "text-gray-500 border-transparent hover:text-gray-700 hover:bg-gray-50"
              }`}
            >
              <item.icon className="w-4 h-4" />
              {item.label}
            </button>
          ))}
        </div>

        {tab === "plans" && (
          <div className="p-5">
            {plansLoading ? (
              <div className="py-20 flex flex-col items-center text-gray-500 gap-2">
                <Loader2 className="w-7 h-7 animate-spin text-orange-500" />
                <span className="text-sm">Loading access passes…</span>
              </div>
            ) : !plans || plans.length === 0 ? (
              <div className="py-16 text-center space-y-3">
                <KeyRound className="w-12 h-12 text-gray-300 mx-auto" />
                <h3 className="text-lg font-bold text-gray-900">
                  No access passes yet
                </h3>
                <p className="text-sm text-gray-500">
                  Create a single-tier pass with its own price, duration and
                  limits.
                </p>
                <Link
                  href="/admin/access-passes/new"
                  className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-orange-500 text-white text-sm font-bold"
                >
                  <Plus className="w-4 h-4" />
                  Create access pass
                </Link>
              </div>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {plans.map((plan) => (
                  <motion.div
                    key={plan.id}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="rounded-2xl border border-gray-200 p-5 bg-slate-50/30 hover:border-orange-200 transition-colors"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <div className="flex flex-wrap items-center gap-2">
                          <h3 className="text-base font-black text-gray-900">
                            {plan.name}
                          </h3>
                          <StatusBadge
                            status={plan.isActive ? "active" : "expired"}
                          />
                          {!plan.purchaseEnabled && (
                            <span className="text-[10px] font-bold text-gray-500 bg-gray-100 px-2 py-0.5 rounded-full">
                              NOT SELLABLE
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-gray-500 mt-1 line-clamp-2">
                          {plan.description || "No description"}
                        </p>
                      </div>
                      <div className="text-right shrink-0">
                        <p className="text-xl font-black text-gray-900">
                          £{Number(plan.price).toFixed(2)}
                        </p>
                        <p className="text-[11px] text-gray-500">
                          {plan.durationDays} days
                        </p>
                      </div>
                    </div>

                    <div className="grid grid-cols-3 gap-2 mt-4">
                      <div className="rounded-xl bg-white border border-gray-200 p-2.5 text-center">
                        <p className="text-lg font-black text-gray-900">
                          {plan.activeSubscriberCount || 0}
                        </p>
                        <p className="text-[10px] text-gray-500">
                          Active users
                        </p>
                      </div>
                      <div className="rounded-xl bg-white border border-gray-200 p-2.5 text-center">
                        <p className="text-lg font-black text-gray-900">
                          {plan.codeCount || 0}
                        </p>
                        <p className="text-[10px] text-gray-500">Codes</p>
                      </div>
                      <div className="rounded-xl bg-white border border-gray-200 p-2.5 text-center">
                        <p className="text-lg font-black text-gray-900">
                          {plan.features?.length || 0}
                        </p>
                        <p className="text-[10px] text-gray-500">Features</p>
                      </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-2 mt-4 pt-3 border-t border-gray-200/70">
                      <Link
                        href={`/admin/access-passes/${plan.id}/edit`}
                        className="inline-flex items-center gap-1.5 text-xs font-bold text-blue-700 bg-blue-50 hover:bg-blue-100 border border-blue-200 px-3 py-1.5 rounded-lg"
                      >
                        <Pencil className="w-3.5 h-3.5" />
                        Edit
                      </Link>
                      <button
                        onClick={() => {
                          setCodePlanId(plan.id);
                          setCodeModalOpen(true);
                        }}
                        className="inline-flex items-center gap-1.5 text-xs font-bold text-orange-700 bg-orange-50 hover:bg-orange-100 border border-orange-200 px-3 py-1.5 rounded-lg"
                      >
                        <Gift className="w-3.5 h-3.5" />
                        Generate code
                      </button>
                      <button
                        onClick={() => setPlanToDelete(plan)}
                        className="inline-flex items-center gap-1.5 text-xs font-bold text-red-700 bg-red-50 hover:bg-red-100 border border-red-200 px-3 py-1.5 rounded-lg"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        Deactivate
                      </button>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </div>
        )}

        {tab === "codes" && (
          <div className="p-5 space-y-4">
            <div className="flex flex-col sm:flex-row gap-2">
              <div className="relative flex-1">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  value={codeSearch}
                  onChange={(e) => {
                    setCodeSearch(e.target.value);
                    setCodePage(1);
                  }}
                  placeholder="Search code, email or business"
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
                />
              </div>
              <select
                value={codeStatus}
                onChange={(e) => {
                  setCodeStatus(e.target.value);
                  setCodePage(1);
                }}
                className="px-3 py-2.5 rounded-xl border border-gray-300 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-orange-500"
              >
                <option value="">All statuses</option>
                <option value="active">Active</option>
                <option value="exhausted">Used</option>
                <option value="revoked">Revoked</option>
                <option value="expired">Expired</option>
              </select>
            </div>

            {codesLoading ? (
              <div className="py-16 flex justify-center">
                <Loader2 className="w-7 h-7 animate-spin text-orange-500" />
              </div>
            ) : !codes?.data?.length ? (
              <div className="py-16 text-center space-y-2">
                <KeyRound className="w-12 h-12 text-gray-300 mx-auto" />
                <p className="text-sm font-bold text-gray-700">
                  No codes found
                </p>
                <p className="text-xs text-gray-500">
                  Generate a code to gift access to a business.
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto rounded-xl border border-gray-200">
                <table className="w-full text-sm">
                  <thead className="bg-gray-50 text-left">
                    <tr className="text-[11px] uppercase tracking-wider text-gray-500">
                      <th className="px-4 py-3 font-bold">Code</th>
                      <th className="px-4 py-3 font-bold">Plan</th>
                      <th className="px-4 py-3 font-bold">Assigned to</th>
                      <th className="px-4 py-3 font-bold">Usage</th>
                      <th className="px-4 py-3 font-bold">Expiry</th>
                      <th className="px-4 py-3 font-bold">Status</th>
                      <th className="px-4 py-3 font-bold text-right">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {codes.data.map((code) => (
                      <tr key={code.id} className="hover:bg-gray-50/60">
                        <td className="px-4 py-3">
                          <button
                            onClick={() => copyCode(code.code)}
                            className="inline-flex items-center gap-1.5 font-mono font-bold text-gray-900 hover:text-orange-600"
                          >
                            {copied === code.code ? (
                              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                            ) : (
                              <Copy className="w-3.5 h-3.5 text-gray-400" />
                            )}
                            {code.code}
                          </button>
                          {code.restrictToAssignedUser && (
                            <p className="text-[10px] text-amber-700 font-semibold mt-0.5">
                              Locked to account
                            </p>
                          )}
                        </td>
                        <td className="px-4 py-3 text-gray-700 whitespace-nowrap">
                          {code.plan?.name || "—"}
                        </td>
                        <td className="px-4 py-3">
                          <p className="text-gray-800 font-medium">
                            {code.assignedBusiness?.name || "—"}
                          </p>
                          <p className="text-[11px] text-gray-500">
                            {code.assignedEmail || "Generic / transferable"}
                          </p>
                        </td>
                        <td className="px-4 py-3 text-gray-700 whitespace-nowrap">
                          {code.timesUsed} / {code.maxUses}
                        </td>
                        <td className="px-4 py-3 text-gray-600 whitespace-nowrap">
                          {formatDate(code.expiresAt)}
                        </td>
                        <td className="px-4 py-3">
                          <StatusBadge status={code.status} />
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center justify-end gap-1.5">
                            {code.assignedEmail && (
                              <button
                                onClick={() => handleResendCode(code)}
                                disabled={resendingCode}
                                className="p-1.5 rounded-lg text-blue-600 hover:bg-blue-50 disabled:opacity-50"
                                title="Re-send email"
                              >
                                <Mail className="w-4 h-4" />
                              </button>
                            )}
                            {code.status === "active" && (
                              <button
                                onClick={() => handleRevokeCode(code)}
                                disabled={revokingCode}
                                className="p-1.5 rounded-lg text-red-600 hover:bg-red-50 disabled:opacity-50"
                                title="Revoke code"
                              >
                                <Ban className="w-4 h-4" />
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            <Pagination
              page={codes?.page || codePage}
              totalPages={codes?.totalPages || 1}
              total={codes?.total || 0}
              onPage={setCodePage}
            />
          </div>
        )}

        {tab === "subscribers" && (
          <div className="p-5 space-y-4">
            <div className="flex flex-col sm:flex-row gap-2">
              <div className="relative flex-1">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  value={subSearch}
                  onChange={(e) => {
                    setSubSearch(e.target.value);
                    setSubPage(1);
                  }}
                  placeholder="Search business name or email"
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
                />
              </div>
              <select
                value={subStatus}
                onChange={(e) => {
                  setSubStatus(e.target.value);
                  setSubPage(1);
                }}
                className="px-3 py-2.5 rounded-xl border border-gray-300 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-orange-500"
              >
                <option value="">All statuses</option>
                <option value="active">Active</option>
                <option value="expired">Expired</option>
                <option value="revoked">Revoked</option>
              </select>
            </div>

            {subsLoading ? (
              <div className="py-16 flex justify-center">
                <Loader2 className="w-7 h-7 animate-spin text-orange-500" />
              </div>
            ) : !subscriptions?.data?.length ? (
              <div className="py-16 text-center space-y-2">
                <Users className="w-12 h-12 text-gray-300 mx-auto" />
                <p className="text-sm font-bold text-gray-700">
                  No subscribers yet
                </p>
                <p className="text-xs text-gray-500">
                  Buyers and code redemptions will appear here.
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto rounded-xl border border-gray-200">
                <table className="w-full text-sm">
                  <thead className="bg-gray-50 text-left">
                    <tr className="text-[11px] uppercase tracking-wider text-gray-500">
                      <th className="px-4 py-3 font-bold">Business</th>
                      <th className="px-4 py-3 font-bold">Pass</th>
                      <th className="px-4 py-3 font-bold">Source</th>
                      <th className="px-4 py-3 font-bold">Period</th>
                      <th className="px-4 py-3 font-bold">Status</th>
                      <th className="px-4 py-3 font-bold text-right">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {subscriptions.data.map((sub) => (
                      <tr key={sub.id} className="hover:bg-gray-50/60">
                        <td className="px-4 py-3">
                          <p className="font-semibold text-gray-900">
                            {sub.business?.name || "Unknown business"}
                          </p>
                          <p className="text-[11px] text-gray-500">
                            {sub.business?.email}
                          </p>
                        </td>
                        <td className="px-4 py-3">
                          <p className="text-gray-800 font-medium">
                            {sub.planName}
                          </p>
                          <p className="text-[11px] text-gray-500">
                            {sub.durationDays} days
                          </p>
                        </td>
                        <td className="px-4 py-3">
                          <span className="capitalize text-gray-700">
                            {sub.source}
                          </span>
                          {sub.code?.code && (
                            <p className="text-[10px] font-mono text-gray-500 mt-0.5">
                              {sub.code.code}
                            </p>
                          )}
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap">
                          <p className="text-gray-700">
                            {formatDate(sub.startsAt)}
                          </p>
                          <p className="text-[11px] text-gray-500">
                            to {formatDate(sub.expiresAt)}
                          </p>
                        </td>
                        <td className="px-4 py-3">
                          <StatusBadge status={sub.status} />
                          {sub.revokedReason && (
                            <p
                              className="text-[10px] text-red-600 max-w-[180px] truncate mt-1"
                              title={sub.revokedReason}
                            >
                              {sub.revokedReason}
                            </p>
                          )}
                        </td>
                        <td className="px-4 py-3 text-right">
                          {sub.status !== "revoked" ? (
                            <button
                              onClick={() => {
                                setSubscriptionToRevoke(sub);
                                setRevokeReason("");
                                setRevokeAttempted(false);
                              }}
                              className="inline-flex items-center gap-1 text-xs font-bold text-red-700 bg-red-50 hover:bg-red-100 border border-red-200 px-3 py-1.5 rounded-lg"
                            >
                              <XCircle className="w-3.5 h-3.5" />
                              Revoke
                            </button>
                          ) : (
                            <span className="text-xs text-gray-400">
                              Revoked
                            </span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            <Pagination
              page={subscriptions?.page || subPage}
              totalPages={subscriptions?.totalPages || 1}
              total={subscriptions?.total || 0}
              onPage={setSubPage}
            />
          </div>
        )}
      </div>

      <GenerateCodeModal
        isOpen={codeModalOpen}
        onClose={() => setCodeModalOpen(false)}
        plans={
          activePlansForCodes.length ? activePlansForCodes : publicPlans || []
        }
        defaultPlanId={codePlanId}
      />

      {planToDelete && (
        <Modal
          onClose={() => setPlanToDelete(null)}
          title={`Deactivate “${planToDelete.name}”?`}
        >
          <div className="space-y-4">
            <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-800 flex items-start gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>
                New purchases and code redemptions will stop immediately.
                Existing pass holders keep access until their expiry.
              </span>
            </div>
            <div className="flex justify-end gap-2">
              <button
                onClick={() => setPlanToDelete(null)}
                className="px-4 py-2.5 rounded-xl text-sm font-semibold text-gray-600 hover:bg-gray-100"
              >
                Cancel
              </button>
              <button
                onClick={handleDeletePlan}
                disabled={deletingPlan}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white text-sm font-bold disabled:opacity-50"
              >
                {deletingPlan ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Trash2 className="w-4 h-4" />
                )}
                Deactivate pass
              </button>
            </div>
          </div>
        </Modal>
      )}

      {subscriptionToRevoke && (
        <Modal
          onClose={() => setSubscriptionToRevoke(null)}
          title={`Revoke access for ${subscriptionToRevoke.business?.name || "this business"}?`}
        >
          <div className="space-y-4">
            <p className="text-xs text-gray-500">
              They will lose dashboard access immediately and receive an email
              with your reason.
            </p>
            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                Reason <span className="text-red-500">*</span>
              </label>
              <textarea
                value={revokeReason}
                onChange={(e) => setRevokeReason(e.target.value)}
                rows={4}
                maxLength={1000}
                placeholder="Explain why access is being revoked. This exact reason is emailed to the business."
                className={`w-full px-3.5 py-2.5 rounded-xl border text-sm focus:outline-none focus:ring-2 ${
                  revokeAttempted && revokeReason.trim().length < 3
                    ? "border-red-400 focus:ring-red-500"
                    : "border-gray-300 focus:ring-orange-500"
                }`}
              />
              {revokeAttempted && revokeReason.trim().length < 3 && (
                <p className="mt-1 text-xs text-red-600 flex items-center gap-1">
                  <AlertCircle className="w-3.5 h-3.5" />
                  Enter at least 3 characters.
                </p>
              )}
              <div className="flex justify-between mt-1">
                <span className="text-[11px] text-gray-400">
                  The email is queued automatically.
                </span>
                <span className="text-[11px] text-gray-400">
                  {revokeReason.length}/1000
                </span>
              </div>
            </div>
            <div className="flex justify-end gap-2">
              <button
                onClick={() => setSubscriptionToRevoke(null)}
                className="px-4 py-2.5 rounded-xl text-sm font-semibold text-gray-600 hover:bg-gray-100"
              >
                Cancel
              </button>
              <button
                onClick={handleRevokeSubscription}
                disabled={revokingSubscription}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white text-sm font-bold disabled:opacity-50"
              >
                {revokingSubscription ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <XCircle className="w-4 h-4" />
                )}
                Revoke access
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}

function Pagination({
  page,
  totalPages,
  total,
  onPage,
}: {
  page: number;
  totalPages: number;
  total: number;
  onPage: (page: number) => void;
}) {
  if (total === 0) return null;
  return (
    <div className="flex items-center justify-between text-xs text-gray-500">
      <span>{total} result(s)</span>
      <div className="flex items-center gap-2">
        <button
          onClick={() => onPage(Math.max(1, page - 1))}
          disabled={page <= 1}
          className="px-3 py-1.5 rounded-lg border border-gray-300 font-semibold disabled:opacity-40"
        >
          Previous
        </button>
        <span className="font-semibold text-gray-700">
          Page {page} of {Math.max(1, totalPages)}
        </span>
        <button
          onClick={() => onPage(Math.min(totalPages, page + 1))}
          disabled={page >= totalPages}
          className="px-3 py-1.5 rounded-lg border border-gray-300 font-semibold disabled:opacity-40"
        >
          Next
        </button>
      </div>
    </div>
  );
}

function Modal({
  title,
  onClose,
  children,
}: {
  title: string;
  onClose: () => void;
  children: React.ReactNode;
}) {
  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <motion.div
        initial={{ scale: 0.96, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="bg-white rounded-2xl shadow-xl max-w-md w-full p-6 border border-gray-100 space-y-4"
      >
        <div className="flex items-start justify-between gap-3">
          <h3 className="text-lg font-black text-gray-900">{title}</h3>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-gray-400 hover:bg-gray-100"
            aria-label="Close"
          >
            <XCircle className="w-5 h-5" />
          </button>
        </div>
        {children}
      </motion.div>
    </div>
  );
}
