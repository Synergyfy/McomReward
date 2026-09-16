'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  Plus,
  Layers,
  Zap,
  Rocket,
  Crown,
  CheckCircle2,
  XCircle,
  Tag,
  Loader2,
  Calendar,
  AlertCircle,
  ChevronRight,
  TrendingUp,
  Sliders,
} from 'lucide-react';
import {
  useGetAdminPlans,
  useAddVariantPrice,
  AdminPlan,
  AdminPlanVariant,
} from '@/services/admin/plans';
import { toast } from 'sonner';

export default function AdminPlansListPage() {
  const { data: plans, isLoading, error } = useGetAdminPlans();
  const { mutateAsync: addPrice, isPending: isAddingPrice } = useAddVariantPrice();

  const [selectedVariant, setSelectedVariant] = useState<AdminPlanVariant | null>(null);
  const [newPriceAmount, setNewPriceAmount] = useState<string>('');
  const [isPriceModalOpen, setIsPriceModalOpen] = useState(false);

  const handleOpenPriceModal = (variant: AdminPlanVariant) => {
    setSelectedVariant(variant);
    const activePrice = variant.prices?.find((p) => p.isActive) || variant.prices?.[0];
    setNewPriceAmount(activePrice ? String(activePrice.amount) : '');
    setIsPriceModalOpen(true);
  };

  const handleSavePrice = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedVariant || !newPriceAmount) return;

    const amountNum = parseFloat(newPriceAmount);
    if (isNaN(amountNum) || amountNum < 0) {
      toast.error('Please enter a valid positive price amount');
      return;
    }

    try {
      await addPrice({
        variantId: selectedVariant.id,
        amount: amountNum,
        currency: 'GBP',
      });
      toast.success('Versioned price updated successfully! Previous price archived.');
      setIsPriceModalOpen(false);
      setSelectedVariant(null);
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Failed to update price');
    }
  };

  const getTierIcon = (name?: string) => {
    switch (name) {
      case 'PRO_PLUS':
      case 'PRO+':
        return <Crown className="w-4 h-4 text-amber-500" />;
      case 'PRO':
        return <Rocket className="w-4 h-4 text-blue-500" />;
      default:
        return <Zap className="w-4 h-4 text-orange-500" />;
    }
  };

  const getTierBadge = (name?: string) => {
    switch (name) {
      case 'PRO_PLUS':
      case 'PRO+':
        return 'bg-amber-100 text-amber-800 border-amber-300';
      case 'PRO':
        return 'bg-blue-100 text-blue-800 border-blue-300';
      default:
        return 'bg-orange-100 text-orange-800 border-orange-300';
    }
  };

  return (
    <div className="p-6 md:p-8 space-y-8 max-w-7xl mx-auto">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-6 rounded-2xl border border-gray-200 shadow-sm">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 bg-blue-50 text-blue-600 rounded-xl">
              <Layers className="w-5 h-5" />
            </span>
            <h1 className="text-2xl font-black text-gray-900">Plans & Tiers Management</h1>
          </div>
          <p className="text-sm text-gray-500 mt-1">
            Manage unified commercial plan families. Each plan contains atomic 90d, 180d, and 1-year variants with versioned immutable pricing.
          </p>
        </div>

        <Link
          href="/admin/plans/new"
          className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white text-sm font-bold px-5 py-3 rounded-xl shadow-sm hover:shadow transition-all"
        >
          <Plus className="w-4 h-4" />
          <span>Create New Plan</span>
        </Link>
      </div>

      {/* Plans List */}
      {isLoading ? (
        <div className="py-24 flex flex-col items-center justify-center text-gray-500 space-y-3">
          <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
          <span className="text-sm font-medium">Loading commercial plans...</span>
        </div>
      ) : error ? (
        <div className="p-6 bg-red-50 border border-red-200 rounded-2xl text-red-700 text-sm">
          Failed to load plans. Please verify database connectivity.
        </div>
      ) : !plans || plans.length === 0 ? (
        <div className="p-12 text-center bg-white rounded-2xl border border-gray-200 shadow-sm space-y-4 max-w-lg mx-auto">
          <Layers className="w-12 h-12 text-gray-400 mx-auto" />
          <div>
            <h3 className="text-lg font-bold text-gray-900">No Plans Configured Yet</h3>
            <p className="text-sm text-gray-500 mt-1">
              Create your first plan family to allow businesses to subscribe across Standard, Pro, and Pro+ commitment levels.
            </p>
          </div>
          <Link
            href="/admin/plans/new"
            className="inline-flex items-center gap-2 bg-blue-600 text-white text-sm font-bold px-4 py-2.5 rounded-xl shadow-sm"
          >
            <Plus className="w-4 h-4" />
            <span>Create Plan</span>
          </Link>
        </div>
      ) : (
        <div className="space-y-8">
          {plans.map((plan: AdminPlan) => (
            <motion.div
              key={plan.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden"
            >
              {/* Plan Family Header */}
              <div className="p-6 bg-slate-50/80 border-b border-gray-200 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                  <div className="flex items-center gap-3">
                    <h2 className="text-xl font-extrabold text-gray-900">{plan.name}</h2>
                    <span className="text-xs bg-slate-200 text-slate-700 font-mono px-2 py-0.5 rounded-md">
                      {plan.slug}
                    </span>
                    {plan.isActive ? (
                      <span className="inline-flex items-center gap-1 text-xs font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2.5 py-0.5 rounded-full">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        Active
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-xs font-bold text-gray-600 bg-gray-100 border border-gray-300 px-2.5 py-0.5 rounded-full">
                        <XCircle className="w-3.5 h-3.5" />
                        Inactive
                      </span>
                    )}
                  </div>
                  {plan.description && (
                    <p className="text-sm text-gray-600 mt-1">{plan.description}</p>
                  )}
                </div>

                <div className="text-xs text-gray-500 font-medium">
                  Created {new Date(plan.created_at).toLocaleDateString()}
                </div>
              </div>

              {/* 3 Side-by-Side Variants Grid */}
              <div className="p-6 grid grid-cols-1 md:grid-cols-3 gap-6 bg-white">
                {plan.variants?.map((variant: AdminPlanVariant) => {
                  const activePrice = variant.prices?.find((p) => p.isActive) || variant.prices?.[0];
                  const tierName = variant.tierLevel?.name || 'STANDARD';
                  const label =
                    tierName === 'PRO_PLUS'
                      ? 'Pro+ (1 Year)'
                      : tierName === 'PRO'
                      ? 'Pro (180 Days)'
                      : 'Standard (90 Days)';

                  return (
                    <div
                      key={variant.id}
                      className="border border-gray-200 rounded-xl p-5 flex flex-col justify-between bg-slate-50/30 hover:border-blue-300 transition-all space-y-4"
                    >
                      <div>
                        {/* Variant Header */}
                        <div className="flex justify-between items-center mb-3">
                          <span
                            className={`inline-flex items-center gap-1.5 text-xs font-extrabold uppercase tracking-wider px-2.5 py-1 rounded-lg border ${getTierBadge(
                              tierName
                            )}`}
                          >
                            {getTierIcon(tierName)}
                            <span>{label}</span>
                          </span>

                          <button
                            onClick={() => handleOpenPriceModal(variant)}
                            className="inline-flex items-center gap-1 text-xs text-blue-600 hover:text-blue-800 font-bold bg-blue-50 hover:bg-blue-100 px-2 py-1 rounded-md transition-colors"
                          >
                            <TrendingUp className="w-3.5 h-3.5" />
                            <span>Reprice</span>
                          </button>
                        </div>

                        {/* Price */}
                        <div className="my-2">
                          <span className="text-3xl font-black text-gray-900">
                            £{Number(activePrice?.amount || 0).toFixed(2)}
                          </span>
                          <span className="text-xs text-gray-500 ml-1.5 font-medium">
                            / {variant.tierLevel?.isCalendarYear ? '1 year' : `${variant.tierLevel?.durationDays || 90} days`}
                          </span>
                        </div>

                        {/* Features List */}
                        <div className="mt-4 space-y-2">
                          <div className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">
                            Features & Benefits
                          </div>
                          {variant.features && variant.features.length > 0 ? (
                            <ul className="space-y-1.5 text-xs text-gray-600">
                              {variant.features.slice(0, 4).map((f, idx) => (
                                <li key={idx} className="flex items-start gap-1.5">
                                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                                  <span>{f}</span>
                                </li>
                              ))}
                              {variant.features.length > 4 && (
                                <li className="text-[11px] text-gray-400 italic">
                                  +{variant.features.length - 4} more benefits
                                </li>
                              )}
                            </ul>
                          ) : (
                            <div className="text-xs text-gray-400 italic">No features listed</div>
                          )}
                        </div>

                        {/* Quotas & Flags Summary */}
                        <div className="mt-4 pt-3 border-t border-gray-200/60 text-xs text-gray-600 space-y-1">
                          <div className="flex justify-between">
                            <span className="text-gray-500">Max Campaigns:</span>
                            <span className="font-bold">
                              {variant.configuration?.quotas?.maxActiveCampaigns === -1
                                ? 'Unlimited'
                                : variant.configuration?.quotas?.maxActiveCampaigns ?? 'N/A'}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-500">Monthly Points:</span>
                            <span className="font-bold">
                              {variant.configuration?.quotas?.monthlyPointsAllowance ?? 'N/A'}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-500">Advanced Analytics:</span>
                            <span className="font-bold">
                              {variant.configuration?.featureFlags?.hasAccessToAdvancedAnalytics
                                ? 'Yes'
                                : 'No'}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Price History Tag */}
                      <div className="pt-2 border-t border-gray-100 flex justify-between items-center text-[11px] text-gray-400">
                        <span>Price ID: {activePrice?.id?.slice(0, 8)}...</span>
                        <span>{variant.prices?.length || 1} price revision(s)</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* Versioned Repricing Modal */}
      {isPriceModalOpen && selectedVariant && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-white rounded-2xl shadow-xl max-w-md w-full p-6 border border-gray-100 space-y-5"
          >
            <div>
              <h3 className="text-lg font-black text-gray-900">
                Update Variant Price (Immutable)
              </h3>
              <p className="text-xs text-gray-500 mt-1">
                Creating a new price retires the existing active price row for future subscribers, while preserving historical snapshots for current members.
              </p>
            </div>

            <form onSubmit={handleSavePrice} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                  New Price (£ GBP)
                </label>
                <div className="relative">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 font-bold text-gray-500">
                    £
                  </span>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    required
                    value={newPriceAmount}
                    onChange={(e) => setNewPriceAmount(e.target.value)}
                    placeholder="49.99"
                    className="w-full pl-8 pr-4 py-2.5 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 font-bold text-gray-900"
                  />
                </div>
              </div>

              <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 text-xs text-amber-800 flex items-start gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-amber-600" />
                <span>
                  This change is effective immediately for new checkouts. Existing subscribed businesses will remain on their current price snapshot until renewal.
                </span>
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIsPriceModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl text-sm font-semibold text-gray-600 hover:bg-gray-100 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isAddingPrice}
                  className="px-5 py-2.5 rounded-xl text-sm font-bold text-white bg-blue-600 hover:bg-blue-700 active:bg-blue-800 transition-all flex items-center gap-2 disabled:opacity-50"
                >
                  {isAddingPrice && <Loader2 className="w-4 h-4 animate-spin" />}
                  <span>Save New Price</span>
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </div>
  );
}
