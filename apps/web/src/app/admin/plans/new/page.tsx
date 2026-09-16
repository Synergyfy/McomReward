'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  ArrowLeft,
  Check,
  Zap,
  Rocket,
  Crown,
  Plus,
  Trash2,
  Loader2,
  Sparkles,
  Sliders,
  ShieldCheck,
  HelpCircle,
} from 'lucide-react';
import { useCreatePlan, CreatePlanPayload } from '@/services/admin/plans';
import { toast } from 'sonner';

export default function CreatePlanWizardPage() {
  const router = useRouter();
  const { mutateAsync: createPlan, isPending } = useCreatePlan();

  const [step, setStep] = useState<1 | 2>(1);

  // Step 1: General Info
  const [name, setName] = useState('');
  const [slug, setSlug] = useState('');
  const [description, setDescription] = useState('');
  const [isActive, setIsActive] = useState(true);

  // Auto-slug generator
  const handleNameChange = (val: string) => {
    setName(val);
    const generatedSlug = val
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-');
    setSlug(generatedSlug);
  };

  // Step 2: 3 Variants (STANDARD, PRO, PRO_PLUS)
  const [variantsState, setVariantsState] = useState({
    STANDARD: {
      price: 29.99,
      features: [
        'Up to 3 Active Campaigns',
        'Standard Digital Stamp Cards',
        'Basic Analytics',
        'Email Support',
      ],
      newFeatureInput: '',
      quotas: {
        maxActiveCampaigns: 3,
        maxActiveRewards: 5,
        maxRewardsPerCampaign: 2,
        monthlyPointsAllowance: 1000,
        monthlyStampsAllowance: 500,
        maxTeamMembers: 2,
        maxGiftCardTemplates: 2,
        maxCouponTemplates: 3,
      },
      featureFlags: {
        canCreateCampaignFromScratch: true,
        canEditAdminTemplates: false,
        hasAccessToAdvancedAnalytics: false,
        hasAccessToCRM: false,
        canUpdateReward: true,
        priorityInSearch: false,
        allowCustomBranding: false,
      },
    },
    PRO: {
      price: 59.99,
      features: [
        'Up to 10 Active Campaigns',
        'Custom Stamp Cards & Coupons',
        'Advanced Analytics Dashboard',
        'Priority Search Placement',
      ],
      newFeatureInput: '',
      quotas: {
        maxActiveCampaigns: 10,
        maxActiveRewards: 20,
        maxRewardsPerCampaign: 5,
        monthlyPointsAllowance: 5000,
        monthlyStampsAllowance: 2500,
        maxTeamMembers: 5,
        maxGiftCardTemplates: 5,
        maxCouponTemplates: 10,
      },
      featureFlags: {
        canCreateCampaignFromScratch: true,
        canEditAdminTemplates: true,
        hasAccessToAdvancedAnalytics: true,
        hasAccessToCRM: false,
        canUpdateReward: true,
        priorityInSearch: true,
        allowCustomBranding: true,
      },
    },
    PRO_PLUS: {
      price: 99.99,
      features: [
        'Unlimited Active Campaigns',
        '1 Calendar Year Full Access',
        'Omni-channel Customer CRM',
        'Dedicated VIP Account Manager',
      ],
      newFeatureInput: '',
      quotas: {
        maxActiveCampaigns: -1,
        maxActiveRewards: -1,
        maxRewardsPerCampaign: -1,
        monthlyPointsAllowance: 25000,
        monthlyStampsAllowance: 12000,
        maxTeamMembers: 15,
        maxGiftCardTemplates: 25,
        maxCouponTemplates: 50,
      },
      featureFlags: {
        canCreateCampaignFromScratch: true,
        canEditAdminTemplates: true,
        hasAccessToAdvancedAnalytics: true,
        hasAccessToCRM: true,
        canUpdateReward: true,
        priorityInSearch: true,
        allowCustomBranding: true,
      },
    },
  });

  const [activeTab, setActiveTab] = useState<'STANDARD' | 'PRO' | 'PRO_PLUS'>('STANDARD');

  const handleAddFeature = (tier: 'STANDARD' | 'PRO' | 'PRO_PLUS') => {
    const text = variantsState[tier].newFeatureInput.trim();
    if (!text) return;
    setVariantsState((prev) => ({
      ...prev,
      [tier]: {
        ...prev[tier],
        features: [...prev[tier].features, text],
        newFeatureInput: '',
      },
    }));
  };

  const handleRemoveFeature = (tier: 'STANDARD' | 'PRO' | 'PRO_PLUS', idx: number) => {
    setVariantsState((prev) => ({
      ...prev,
      [tier]: {
        ...prev[tier],
        features: prev[tier].features.filter((_, i) => i !== idx),
      },
    }));
  };

  const handlePriceChange = (tier: 'STANDARD' | 'PRO' | 'PRO_PLUS', val: number) => {
    setVariantsState((prev) => ({
      ...prev,
      [tier]: {
        ...prev[tier],
        price: val,
      },
    }));
  };

  const handleQuotaChange = (
    tier: 'STANDARD' | 'PRO' | 'PRO_PLUS',
    key: string,
    val: number
  ) => {
    setVariantsState((prev) => ({
      ...prev,
      [tier]: {
        ...prev[tier],
        quotas: {
          ...prev[tier].quotas,
          [key]: val,
        },
      },
    }));
  };

  const handleFlagChange = (
    tier: 'STANDARD' | 'PRO' | 'PRO_PLUS',
    key: string,
    val: boolean
  ) => {
    setVariantsState((prev) => ({
      ...prev,
      [tier]: {
        ...prev[tier],
        featureFlags: {
          ...prev[tier].featureFlags,
          [key]: val,
        },
      },
    }));
  };

  const handleSubmit = async () => {
    if (!name.trim() || !slug.trim()) {
      toast.error('Please complete Plan Name and Slug');
      setStep(1);
      return;
    }

    const payload: CreatePlanPayload = {
      name,
      slug,
      description,
      isActive,
      variants: [
        {
          tier: 'STANDARD',
          price: Number(variantsState.STANDARD.price) || 0,
          features: variantsState.STANDARD.features,
          configuration: {
            quotas: variantsState.STANDARD.quotas,
            featureFlags: variantsState.STANDARD.featureFlags,
          },
        },
        {
          tier: 'PRO',
          price: Number(variantsState.PRO.price) || 0,
          features: variantsState.PRO.features,
          configuration: {
            quotas: variantsState.PRO.quotas,
            featureFlags: variantsState.PRO.featureFlags,
          },
        },
        {
          tier: 'PRO_PLUS',
          price: Number(variantsState.PRO_PLUS.price) || 0,
          features: variantsState.PRO_PLUS.features,
          configuration: {
            quotas: variantsState.PRO_PLUS.quotas,
            featureFlags: variantsState.PRO_PLUS.featureFlags,
          },
        },
      ],
    };

    try {
      await createPlan(payload);
      toast.success(`Plan "${name}" and 3 variants created successfully!`);
      router.push('/admin/plans');
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Failed to create plan');
    }
  };

  return (
    <div className="p-6 md:p-8 space-y-8 max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link
          href="/admin/plans"
          className="p-2.5 rounded-xl border border-gray-200 bg-white hover:bg-gray-50 text-gray-600 transition-colors shadow-sm"
        >
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div>
          <h1 className="text-2xl font-black text-gray-900">Create Commercial Plan</h1>
          <p className="text-sm text-gray-500">
            Define 1 commercial package family with atomic Standard (90d), Pro (180d), and Pro+ (1yr) variants.
          </p>
        </div>
      </div>

      {/* Step Indicator */}
      <div className="flex items-center justify-center max-w-xl mx-auto">
        <div className="flex items-center w-full">
          <div
            className={`flex items-center justify-center w-10 h-10 rounded-full font-bold text-sm transition-all ${
              step >= 1 ? 'bg-blue-600 text-white shadow-md' : 'bg-gray-200 text-gray-500'
            }`}
          >
            1
          </div>
          <div
            className={`flex-1 h-1 mx-3 rounded transition-all ${
              step >= 2 ? 'bg-blue-600' : 'bg-gray-200'
            }`}
          />
          <div
            className={`flex items-center justify-center w-10 h-10 rounded-full font-bold text-sm transition-all ${
              step >= 2 ? 'bg-blue-600 text-white shadow-md' : 'bg-gray-200 text-gray-500'
            }`}
          >
            2
          </div>
        </div>
      </div>

      {/* Step 1: General Info */}
      {step === 1 && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 sm:p-8 max-w-2xl mx-auto space-y-6"
        >
          <div className="border-b border-gray-100 pb-4">
            <h2 className="text-lg font-black text-gray-900">Step 1: General Plan Family Information</h2>
            <p className="text-xs text-gray-500 mt-0.5">
              Set the commercial brand name and visibility of this plan offering.
            </p>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                Plan Family Name *
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => handleNameChange(e.target.value)}
                placeholder="e.g. Starter Plan, Gold VIP"
                className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 font-bold text-gray-900"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                URL Safe Slug *
              </label>
              <input
                type="text"
                required
                value={slug}
                onChange={(e) => setSlug(e.target.value)}
                placeholder="e.g. starter-plan"
                className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono text-sm text-gray-800"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                Marketing Description
              </label>
              <textarea
                rows={3}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Brief summary of who this plan is tailored for..."
                className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm text-gray-800"
              />
            </div>

            <div className="flex items-center justify-between p-4 bg-slate-50 rounded-xl border border-gray-200">
              <div>
                <span className="text-sm font-bold text-gray-900 block">Plan Visibility</span>
                <span className="text-xs text-gray-500">
                  Enable or disable this plan for commercial checkout across storefronts.
                </span>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={isActive}
                  onChange={(e) => setIsActive(e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600" />
              </label>
            </div>
          </div>

          <div className="pt-4 flex justify-end">
            <button
              type="button"
              onClick={() => {
                if (!name.trim() || !slug.trim()) {
                  toast.error('Please specify both plan name and slug');
                  return;
                }
                setStep(2);
              }}
              className="px-6 py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm shadow-md transition-all flex items-center gap-2"
            >
              <span>Next: Configure 3 Variants</span>
              <Sparkles className="w-4 h-4" />
            </button>
          </div>
        </motion.div>
      )}

      {/* Step 2: 3 Side-by-Side Variant Columns */}
      {step === 2 && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-6"
        >
          {/* Variant Selector Tabs */}
          <div className="flex justify-center">
            <div className="inline-flex p-1.5 bg-white border border-gray-200 rounded-2xl shadow-sm gap-2">
              <button
                type="button"
                onClick={() => setActiveTab('STANDARD')}
                className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold transition-all ${
                  activeTab === 'STANDARD'
                    ? 'bg-orange-500 text-white shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                <Zap className="w-4 h-4" />
                <span>Standard (90 Days)</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('PRO')}
                className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold transition-all ${
                  activeTab === 'PRO'
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                <Rocket className="w-4 h-4" />
                <span>Pro (180 Days)</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('PRO_PLUS')}
                className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold transition-all ${
                  activeTab === 'PRO_PLUS'
                    ? 'bg-amber-500 text-white shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                <Crown className="w-4 h-4" />
                <span>Pro+ (1 Year)</span>
              </button>
            </div>
          </div>

          {/* Active Variant Configuration Card */}
          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 sm:p-8 space-y-8 max-w-4xl mx-auto">
            <div className="flex justify-between items-center border-b border-gray-100 pb-4">
              <div>
                <h2 className="text-xl font-black text-gray-900">
                  Configure{' '}
                  {activeTab === 'PRO_PLUS'
                    ? 'Pro+ (1 Calendar Year)'
                    : activeTab === 'PRO'
                    ? 'Pro (180 Days)'
                    : 'Standard (90 Days)'}{' '}
                  Variant
                </h2>
                <p className="text-xs text-gray-500 mt-0.5">
                  Set the pricing, bullet points, quota allowances, and feature switches for this variant.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">
                  One-Off Price:
                </span>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 font-bold text-gray-500">
                    £
                  </span>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={variantsState[activeTab].price}
                    onChange={(e) =>
                      handlePriceChange(activeTab, parseFloat(e.target.value) || 0)
                    }
                    className="w-32 pl-7 pr-3 py-1.5 rounded-xl border border-gray-300 font-extrabold text-gray-900 text-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
            </div>

            {/* Features List Section */}
            <div className="space-y-3">
              <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider">
                Marketing Bullet Points (Displayed to Buyers)
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={variantsState[activeTab].newFeatureInput}
                  onChange={(e) =>
                    setVariantsState((prev) => ({
                      ...prev,
                      [activeTab]: {
                        ...prev[activeTab],
                        newFeatureInput: e.target.value,
                      },
                    }))
                  }
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleAddFeature(activeTab);
                    }
                  }}
                  placeholder="e.g. 5 Active Campaigns, Digital Stamp Multiplier..."
                  className="flex-1 px-4 py-2.5 rounded-xl border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <button
                  type="button"
                  onClick={() => handleAddFeature(activeTab)}
                  className="px-4 py-2.5 bg-gray-900 hover:bg-black text-white text-xs font-bold rounded-xl flex items-center gap-1.5"
                >
                  <Plus className="w-4 h-4" />
                  <span>Add</span>
                </button>
              </div>

              <div className="space-y-2 mt-2">
                {variantsState[activeTab].features.map((feature, idx) => (
                  <div
                    key={idx}
                    className="flex justify-between items-center p-3 bg-slate-50 border border-gray-200 rounded-xl text-sm text-gray-800"
                  >
                    <span className="flex items-center gap-2">
                      <Check className="w-4 h-4 text-emerald-600" />
                      {feature}
                    </span>
                    <button
                      type="button"
                      onClick={() => handleRemoveFeature(activeTab, idx)}
                      className="text-gray-400 hover:text-red-600 transition-colors p-1"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Quotas Grid */}
            <div className="space-y-4 pt-4 border-t border-gray-100">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold text-gray-900">Enforced Quota Limits</h3>
                  <p className="text-xs text-gray-500">Numeric ceilings enforced on business accounts (-1 = unlimited)</p>
                </div>
                <Sliders className="w-4 h-4 text-gray-400" />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                <div>
                  <label className="text-xs font-semibold text-gray-600 block mb-1">
                    Max Active Campaigns
                  </label>
                  <input
                    type="number"
                    value={variantsState[activeTab].quotas.maxActiveCampaigns}
                    onChange={(e) =>
                      handleQuotaChange(activeTab, 'maxActiveCampaigns', parseInt(e.target.value) || 0)
                    }
                    className="w-full px-3 py-2 rounded-lg border border-gray-300 text-sm font-bold"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-gray-600 block mb-1">
                    Max Active Rewards
                  </label>
                  <input
                    type="number"
                    value={variantsState[activeTab].quotas.maxActiveRewards}
                    onChange={(e) =>
                      handleQuotaChange(activeTab, 'maxActiveRewards', parseInt(e.target.value) || 0)
                    }
                    className="w-full px-3 py-2 rounded-lg border border-gray-300 text-sm font-bold"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-gray-600 block mb-1">
                    Monthly Points Allowance
                  </label>
                  <input
                    type="number"
                    value={variantsState[activeTab].quotas.monthlyPointsAllowance}
                    onChange={(e) =>
                      handleQuotaChange(activeTab, 'monthlyPointsAllowance', parseInt(e.target.value) || 0)
                    }
                    className="w-full px-3 py-2 rounded-lg border border-gray-300 text-sm font-bold"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-gray-600 block mb-1">
                    Monthly Stamps Allowance
                  </label>
                  <input
                    type="number"
                    value={variantsState[activeTab].quotas.monthlyStampsAllowance}
                    onChange={(e) =>
                      handleQuotaChange(activeTab, 'monthlyStampsAllowance', parseInt(e.target.value) || 0)
                    }
                    className="w-full px-3 py-2 rounded-lg border border-gray-300 text-sm font-bold"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-gray-600 block mb-1">
                    Max Team Members
                  </label>
                  <input
                    type="number"
                    value={variantsState[activeTab].quotas.maxTeamMembers}
                    onChange={(e) =>
                      handleQuotaChange(activeTab, 'maxTeamMembers', parseInt(e.target.value) || 0)
                    }
                    className="w-full px-3 py-2 rounded-lg border border-gray-300 text-sm font-bold"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-gray-600 block mb-1">
                    Max Coupon Templates
                  </label>
                  <input
                    type="number"
                    value={variantsState[activeTab].quotas.maxCouponTemplates}
                    onChange={(e) =>
                      handleQuotaChange(activeTab, 'maxCouponTemplates', parseInt(e.target.value) || 0)
                    }
                    className="w-full px-3 py-2 rounded-lg border border-gray-300 text-sm font-bold"
                  />
                </div>
              </div>
            </div>

            {/* Feature Switches */}
            <div className="space-y-4 pt-4 border-t border-gray-100">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold text-gray-900">Feature Switches</h3>
                  <p className="text-xs text-gray-500">Enable advanced modules and entitlement gates</p>
                </div>
                <ShieldCheck className="w-4 h-4 text-gray-400" />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <label className="flex items-center justify-between p-3.5 bg-slate-50 border border-gray-200 rounded-xl cursor-pointer">
                  <span className="text-xs font-semibold text-gray-800">Advanced Realtime Analytics</span>
                  <input
                    type="checkbox"
                    checked={variantsState[activeTab].featureFlags.hasAccessToAdvancedAnalytics}
                    onChange={(e) =>
                      handleFlagChange(activeTab, 'hasAccessToAdvancedAnalytics', e.target.checked)
                    }
                    className="h-4 w-4 text-blue-600 rounded"
                  />
                </label>

                <label className="flex items-center justify-between p-3.5 bg-slate-50 border border-gray-200 rounded-xl cursor-pointer">
                  <span className="text-xs font-semibold text-gray-800">Customer CRM Access</span>
                  <input
                    type="checkbox"
                    checked={variantsState[activeTab].featureFlags.hasAccessToCRM}
                    onChange={(e) =>
                      handleFlagChange(activeTab, 'hasAccessToCRM', e.target.checked)
                    }
                    className="h-4 w-4 text-blue-600 rounded"
                  />
                </label>

                <label className="flex items-center justify-between p-3.5 bg-slate-50 border border-gray-200 rounded-xl cursor-pointer">
                  <span className="text-xs font-semibold text-gray-800">Priority Placement in Search</span>
                  <input
                    type="checkbox"
                    checked={variantsState[activeTab].featureFlags.priorityInSearch}
                    onChange={(e) =>
                      handleFlagChange(activeTab, 'priorityInSearch', e.target.checked)
                    }
                    className="h-4 w-4 text-blue-600 rounded"
                  />
                </label>

                <label className="flex items-center justify-between p-3.5 bg-slate-50 border border-gray-200 rounded-xl cursor-pointer">
                  <span className="text-xs font-semibold text-gray-800">Custom Storefront Branding</span>
                  <input
                    type="checkbox"
                    checked={variantsState[activeTab].featureFlags.allowCustomBranding}
                    onChange={(e) =>
                      handleFlagChange(activeTab, 'allowCustomBranding', e.target.checked)
                    }
                    className="h-4 w-4 text-blue-600 rounded"
                  />
                </label>
              </div>
            </div>

            {/* Bottom Actions */}
            <div className="pt-6 border-t border-gray-100 flex justify-between items-center">
              <button
                type="button"
                onClick={() => setStep(1)}
                className="px-5 py-2.5 rounded-xl border border-gray-200 text-sm font-semibold text-gray-600 hover:bg-gray-50"
              >
                Back to Step 1
              </button>

              <button
                type="button"
                onClick={handleSubmit}
                disabled={isPending}
                className="px-6 py-3 rounded-xl bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white font-bold text-sm shadow-md hover:shadow-lg transition-all flex items-center gap-2 disabled:opacity-50"
              >
                {isPending && <Loader2 className="w-4 h-4 animate-spin" />}
                <span>Publish Plan & 3 Variants</span>
              </button>
            </div>
          </div>
        </motion.div>
      )}
    </div>
  );
}
