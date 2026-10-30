'use client';

import React, { useMemo, useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  ArrowLeft,
  Check,
  CheckCircle2,
  Circle,
  Crown,
  Info,
  Loader2,
  Plus,
  Rocket,
  ShieldCheck,
  Sliders,
  Sparkles,
  Trash2,
  Zap,
} from 'lucide-react';
import { AdminPlan, CreatePlanPayload } from '@/services/admin/plans';
import { toast } from 'sonner';
import { TooltipProvider } from '@/components/ui/tooltip';
import {
  FieldError,
  FieldLabel,
  InfoTip,
  inputBase,
  inputError,
  inputNormal,
} from '@/components/admin/forms/FormPrimitives';

/* ------------------------------------------------------------------ */
/* Backend contract (mirrors GET /plans/schema and CreatePlanDto)      */
/* ------------------------------------------------------------------ */

const TIER_ORDER = ['STANDARD', 'PRO', 'PRO_PLUS'] as const;
type TierKey = (typeof TIER_ORDER)[number];

const CORE_QUOTA_FIELDS = [
  {
    key: 'maxActiveCampaigns',
    label: 'Active campaigns',
    tooltip:
      'The maximum number of campaigns a business can have live at the same time. Mark it as unlimited to remove the cap.',
    placeholder: 'e.g. 10',
  },
  {
    key: 'maxActiveRewards',
    label: 'Active rewards',
    tooltip:
      'The maximum number of rewards that can be live at the same time across all campaigns. Mark it as unlimited to remove the cap.',
    placeholder: 'e.g. 50',
  },
  {
    key: 'maxRewardsPerCampaign',
    label: 'Rewards per campaign',
    tooltip:
      'How many rewards can be attached to a single campaign. Mark it as unlimited to allow any number.',
    placeholder: 'e.g. 5',
  },
  {
    key: 'monthlyPointsAllowance',
    label: 'Monthly points',
    tooltip:
      'The number of loyalty points a business can issue each calendar month. Mark it as unlimited to remove the monthly cap.',
    placeholder: 'e.g. 10000',
  },
  {
    key: 'monthlyStampsAllowance',
    label: 'Monthly stamps',
    tooltip:
      'The number of stamps a business can issue each calendar month. Mark it as unlimited to remove the monthly cap.',
    placeholder: 'e.g. 1000',
  },
  {
    key: 'maxTeamMembers',
    label: 'Team members',
    tooltip:
      'How many staff accounts can access the business dashboard. Mark it as unlimited to allow any number of members.',
    placeholder: 'e.g. 5',
  },
  {
    key: 'maxGiftCardTemplates',
    label: 'Gift card templates',
    tooltip:
      'How many gift card designs a business can create. Mark it as unlimited to allow any number of templates.',
    placeholder: 'e.g. 10',
  },
  {
    key: 'maxCouponTemplates',
    label: 'Coupon templates',
    tooltip:
      'How many coupon designs a business can create. Mark it as unlimited to allow any number of templates.',
    placeholder: 'e.g. 10',
  },
] as const;

const FEATURE_FLAGS = [
  {
    key: 'canCreateCampaignFromScratch',
    label: 'Create campaigns from scratch',
    description: 'Build campaigns without using a centrally managed template.',
  },
  {
    key: 'canEditAdminTemplates',
    label: 'Edit admin templates',
    description: 'Edit templates that are managed by MCOM admin.',
  },
  {
    key: 'hasAccessToAdvancedAnalytics',
    label: 'Advanced analytics',
    description: 'Unlock realtime analytics dashboards and exports.',
  },
  {
    key: 'hasAccessToCRM',
    label: 'Customer CRM access',
    description: 'Unlock the customer CRM module and segments.',
  },
  {
    key: 'canUpdateReward',
    label: 'Update rewards',
    description: 'Edit rewards after a campaign has gone live.',
  },
  {
    key: 'priorityInSearch',
    label: 'Priority placement in search',
    description: 'Boost the business in marketplace and search results.',
  },
] as const;

type QuotaKey = (typeof CORE_QUOTA_FIELDS)[number]['key'];
type FlagKey = (typeof FEATURE_FLAGS)[number]['key'];

const TIER_META: Record<
  TierKey,
  {
    label: string;
    fullLabel: string;
    duration: string;
    icon: React.ComponentType<{ className?: string }>;
    activeClass: string;
    accentClass: string;
    softClass: string;
  }
> = {
  STANDARD: {
    label: 'Standard',
    fullLabel: 'Standard (90 days)',
    duration: '90 days',
    icon: Zap,
    activeClass: 'bg-orange-500 text-white shadow-sm',
    accentClass: 'text-orange-600',
    softClass: 'bg-orange-50 text-orange-700 border-orange-200',
  },
  PRO: {
    label: 'Pro',
    fullLabel: 'Pro (180 days)',
    duration: '180 days',
    icon: Rocket,
    activeClass: 'bg-blue-600 text-white shadow-sm',
    accentClass: 'text-blue-600',
    softClass: 'bg-blue-50 text-blue-700 border-blue-200',
  },
  PRO_PLUS: {
    label: 'Pro+',
    fullLabel: 'Pro+ (1 year)',
    duration: '1 calendar year',
    icon: Crown,
    activeClass: 'bg-amber-500 text-white shadow-sm',
    accentClass: 'text-amber-600',
    softClass: 'bg-amber-50 text-amber-700 border-amber-200',
  },
};

const MAX_NAME = 80;
const MAX_SLUG = 80;
const MAX_DESCRIPTION = 500;
const MAX_FEATURE = 120;
const MAX_PRICE = 1_000_000;
const MAX_QUOTA = 1_000_000;
const SLUG_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

/* ------------------------------------------------------------------ */
/* Types & helpers                                                     */
/* ------------------------------------------------------------------ */

interface VariantFormState {
  price: string;
  features: string[];
  newFeatureInput: string;
  quotas: Record<QuotaKey, string>;
  unlimitedQuotas: Record<QuotaKey, boolean>;
  featureFlags: Record<FlagKey, boolean>;
  preservedFlags: Record<string, boolean>;
}

interface VariantErrors {
  price?: string;
  features?: string;
  quotas: Partial<Record<QuotaKey, string>>;
}

interface StepOneErrors {
  name?: string;
  slug?: string;
  description?: string;
}

const emptyQuotas = (): Record<QuotaKey, string> =>
  CORE_QUOTA_FIELDS.reduce(
    (acc, field) => ({ ...acc, [field.key]: '' }),
    {} as Record<QuotaKey, string>
  );

const emptyUnlimitedQuotas = (): Record<QuotaKey, boolean> =>
  CORE_QUOTA_FIELDS.reduce(
    (acc, field) => ({ ...acc, [field.key]: false }),
    {} as Record<QuotaKey, boolean>
  );

const emptyFlags = (): Record<FlagKey, boolean> =>
  FEATURE_FLAGS.reduce(
    (acc, flag) => ({ ...acc, [flag.key]: false }),
    {} as Record<FlagKey, boolean>
  );

const getVariantInitialState = (
  plan: AdminPlan | undefined,
  tier: TierKey
): VariantFormState => {
  const variant = plan?.variants?.find((item) => item.tierLevel?.name === tier);
  const activePrice =
    variant?.prices?.find((price) => price.isActive) || variant?.prices?.[0];

  const quotas = emptyQuotas();
  const unlimitedQuotas = emptyUnlimitedQuotas();
  for (const field of CORE_QUOTA_FIELDS) {
    const value = variant?.configuration?.quotas?.[field.key];
    unlimitedQuotas[field.key] = value === -1;
    quotas[field.key] =
      typeof value === 'number' && value > 0 ? String(value) : '';
  }

  const featureFlags = emptyFlags();
  for (const flag of FEATURE_FLAGS) {
    featureFlags[flag.key] = Boolean(variant?.configuration?.featureFlags?.[flag.key]);
  }

  // Keep flags not shown in this form so editing a plan cannot silently drop them.
  const editableFlags = new Set<string>(FEATURE_FLAGS.map((flag) => flag.key));
  const preservedFlags: Record<string, boolean> = {};
  for (const [key, value] of Object.entries(variant?.configuration?.featureFlags ?? {})) {
    if (!editableFlags.has(key)) preservedFlags[key] = Boolean(value);
  }

  return {
    price: activePrice ? String(activePrice.amount) : '',
    features: variant?.features ? [...variant.features] : [],
    newFeatureInput: '',
    quotas,
    unlimitedQuotas,
    featureFlags,
    preservedFlags,
  };
};

const slugify = (value: string) =>
  value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');

const validatePrice = (raw: string): string | undefined => {
  const value = raw.trim();
  if (!value) return 'Enter a price for this variant.';
  if (!/^\d+(\.\d{1,2})?$/.test(value)) {
    return 'Use a valid amount with up to 2 decimal places.';
  }
  const amount = Number(value);
  if (!Number.isFinite(amount)) return 'Enter a valid amount.';
  if (amount < 0) return 'Price cannot be negative.';
  if (amount > MAX_PRICE) return `Keep the price under £${MAX_PRICE.toLocaleString()}.`;
  return undefined;
};

const validateQuota = (raw: string): string | undefined => {
  const value = raw.trim();
  if (!value) return 'Enter a limit, or mark this as unlimited.';
  if (!/^\d+$/.test(value)) return 'Use a whole number of 1 or more.';
  const number = Number(value);
  if (!Number.isFinite(number) || number < 1) {
    return 'Use a whole number of 1 or more.';
  }
  if (number > MAX_QUOTA) return `Keep the value at ${MAX_QUOTA.toLocaleString()} or below.`;
  return undefined;
};

const countRequiredIssues = (errors: VariantErrors) =>
  (errors.price ? 1 : 0) +
  (errors.features ? 1 : 0) +
  CORE_QUOTA_FIELDS.filter((field) => errors.quotas[field.key]).length;

const REQUIRED_FIELDS_PER_VARIANT = 2 + CORE_QUOTA_FIELDS.length;

/* ------------------------------------------------------------------ */
/* Small UI primitives                                                 */
/* ------------------------------------------------------------------ */

function StepMarker({
  index,
  label,
  active,
  current,
}: {
  index: number;
  label: string;
  active: boolean;
  current: boolean;
}) {
  return (
    <div className="flex items-center gap-2.5">
      <div
        className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-sm font-semibold transition-colors ${
          active ? 'bg-blue-600 text-white shadow-sm' : 'bg-gray-100 text-gray-500'
        }`}
      >
        {index}
      </div>
      <span
        className={`hidden text-sm font-medium sm:block ${
          current ? 'text-gray-900' : 'text-gray-500'
        }`}
      >
        {label}
      </span>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Page                                                                */
/* ------------------------------------------------------------------ */

export interface PlanFormProps {
  mode: 'create' | 'edit';
  initialPlan?: AdminPlan;
  isSubmitting: boolean;
  onSubmit: (payload: CreatePlanPayload) => Promise<void>;
}

export function PlanForm({ mode, initialPlan, isSubmitting, onSubmit }: PlanFormProps) {
  const isEdit = mode === 'edit';

  const [step, setStep] = useState<1 | 2>(1);

  // Step 1: General Info
  const [name, setName] = useState(initialPlan?.name ?? '');
  const [slug, setSlug] = useState(initialPlan?.slug ?? '');
  const [description, setDescription] = useState(initialPlan?.description ?? '');
  const [isActive, setIsActive] = useState(initialPlan?.isActive ?? true);
  const [slugEdited, setSlugEdited] = useState(Boolean(initialPlan));
  const [serverErrors, setServerErrors] = useState<{ slug?: string }>({});

  // Step 2: 3 Variants (STANDARD, PRO, PRO_PLUS)
  const [variants, setVariants] = useState<Record<TierKey, VariantFormState>>(() => ({
    STANDARD: getVariantInitialState(initialPlan, 'STANDARD'),
    PRO: getVariantInitialState(initialPlan, 'PRO'),
    PRO_PLUS: getVariantInitialState(initialPlan, 'PRO_PLUS'),
  }));
  const [activeTab, setActiveTab] = useState<TierKey>('STANDARD');

  // Validation UX
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [attemptedNext, setAttemptedNext] = useState(false);
  const [attemptedSave, setAttemptedSave] = useState(false);

  const markTouched = (path: string) => {
    setTouched((prev) => (prev[path] ? prev : { ...prev, [path]: true }));
  };

  const showError = (path: string, error: string | undefined, attempted: boolean) =>
    Boolean(error) && (attempted || touched[path]);

  /* ---------------------------- Validation ---------------------------- */

  const stepOneErrors = useMemo<StepOneErrors>(() => {
    const errors: StepOneErrors = {};
    const trimmedName = name.trim();
    const trimmedSlug = slug.trim();
    const trimmedDescription = description.trim();

    if (!trimmedName) errors.name = 'Plan family name is required.';
    else if (trimmedName.length < 2) errors.name = 'Use at least 2 characters.';
    else if (trimmedName.length > MAX_NAME) errors.name = `Keep it under ${MAX_NAME} characters.`;

    if (!trimmedSlug) errors.slug = 'URL slug is required.';
    else if (trimmedSlug.length < 2) errors.slug = 'Use at least 2 characters.';
    else if (trimmedSlug.length > MAX_SLUG) errors.slug = `Keep it under ${MAX_SLUG} characters.`;
    else if (!SLUG_PATTERN.test(trimmedSlug))
      errors.slug = 'Use lowercase letters, numbers and single hyphens only (e.g. gold-plan).';

    if (trimmedDescription.length > MAX_DESCRIPTION)
      errors.description = `Keep the description under ${MAX_DESCRIPTION} characters.`;

    if (!errors.slug && serverErrors.slug) errors.slug = serverErrors.slug;

    return errors;
  }, [name, slug, description, serverErrors]);

  const variantErrors = useMemo<Record<TierKey, VariantErrors>>(() => {
    const result = {} as Record<TierKey, VariantErrors>;

    for (const tier of TIER_ORDER) {
      const state = variants[tier];
      const quotas: Partial<Record<QuotaKey, string>> = {};

      for (const field of CORE_QUOTA_FIELDS) {
        if (state.unlimitedQuotas[field.key]) continue;
        const error = validateQuota(state.quotas[field.key]);
        if (error) quotas[field.key] = error;
      }

      result[tier] = {
        price: validatePrice(state.price),
        features:
          state.features.length === 0
            ? 'Add at least one marketing feature for this variant.'
            : undefined,
        quotas,
      };
    }

    return result;
  }, [variants]);

  const isStepOneValid = Object.keys(stepOneErrors).length === 0;
  const isVariantComplete = (tier: TierKey) => countRequiredIssues(variantErrors[tier]) === 0;
  const completedVariants = TIER_ORDER.filter((tier) => isVariantComplete(tier)).length;
  const allVariantsComplete = TIER_ORDER.every((tier) => isVariantComplete(tier));

  const variantProgress = (tier: TierKey) => {
    const remaining = countRequiredIssues(variantErrors[tier]);
    return {
      done: Math.max(0, REQUIRED_FIELDS_PER_VARIANT - remaining),
      total: REQUIRED_FIELDS_PER_VARIANT,
      remaining,
    };
  };

  /* ---------------------------- Handlers ---------------------------- */

  const handleNameChange = (value: string) => {
    setName(value);
    if (!slugEdited) setSlug(slugify(value));
  };

  const handleSlugChange = (value: string) => {
    setSlugEdited(true);
    setServerErrors({});
    setSlug(value.toLowerCase());
  };

  const handleRegenerateSlug = () => {
    setSlugEdited(false);
    setServerErrors({});
    setSlug(slugify(name));
  };

  const updateVariant = (tier: TierKey, updater: (state: VariantFormState) => VariantFormState) => {
    setVariants((prev) => ({ ...prev, [tier]: updater(prev[tier]) }));
  };

  const handlePriceChange = (tier: TierKey, value: string) => {
    updateVariant(tier, (state) => ({ ...state, price: value }));
  };

  const handleQuotaChange = (tier: TierKey, key: QuotaKey, value: string) => {
    const digits = value.replace(/\D/g, '');
    updateVariant(tier, (state) => ({
      ...state,
      quotas: { ...state.quotas, [key]: digits },
    }));
  };

  const handleQuotaUnlimitedChange = (tier: TierKey, key: QuotaKey, checked: boolean) => {
    updateVariant(tier, (state) => ({
      ...state,
      unlimitedQuotas: { ...state.unlimitedQuotas, [key]: checked },
    }));
  };

  const handleFlagChange = (tier: TierKey, key: FlagKey, value: boolean) => {
    updateVariant(tier, (state) => ({
      ...state,
      featureFlags: { ...state.featureFlags, [key]: value },
    }));
  };

  const handleSetAllQuotasUnlimited = (tier: TierKey) => {
    updateVariant(tier, (state) => ({
      ...state,
      quotas: emptyQuotas(),
      unlimitedQuotas: CORE_QUOTA_FIELDS.reduce(
        (acc, field) => ({ ...acc, [field.key]: true }),
        {} as Record<QuotaKey, boolean>
      ),
    }));
    CORE_QUOTA_FIELDS.forEach((field) => markTouched(`${tier}.quotas.${field.key}`));
  };

  const handleAddFeature = (tier: TierKey) => {
    const text = variants[tier].newFeatureInput.trim();

    if (!text) return;
    if (text.length > MAX_FEATURE) {
      toast.error(`Keep each feature under ${MAX_FEATURE} characters.`);
      return;
    }
    if (variants[tier].features.some((feature) => feature.toLowerCase() === text.toLowerCase())) {
      toast.error('That feature has already been added to this variant.');
      return;
    }

    updateVariant(tier, (state) => ({
      ...state,
      features: [...state.features, text],
      newFeatureInput: '',
    }));
  };

  const handleRemoveFeature = (tier: TierKey, index: number) => {
    updateVariant(tier, (state) => ({
      ...state,
      features: state.features.filter((_, i) => i !== index),
    }));
  };

  const handleNext = () => {
    setAttemptedNext(true);
    setTouched((prev) => ({ ...prev, name: true, slug: true, description: true }));

    if (!isStepOneValid) {
      toast.error('Please complete the required plan details before continuing.');
      return;
    }

    setStep(2);
  };

  const buildVariantPayload = (tier: TierKey) => {
    const state = variants[tier];
    const quotas = CORE_QUOTA_FIELDS.reduce((acc, field) => {
      acc[field.key] = state.unlimitedQuotas[field.key]
        ? -1
        : Number(state.quotas[field.key]);
      return acc;
    }, {} as Record<string, number>);

    return {
      tier,
      price: Number(state.price),
      features: state.features.map((feature) => feature.trim()).filter(Boolean),
      configuration: {
        quotas,
        featureFlags: { ...state.preservedFlags, ...state.featureFlags },
      },
    };
  };

  const handleSubmit = async () => {
    setAttemptedSave(true);

    if (!isStepOneValid) {
      setStep(1);
      setAttemptedNext(true);
      setTouched((prev) => ({ ...prev, name: true, slug: true, description: true }));
      toast.error('Plan details are incomplete. Fix the highlighted fields first.');
      return;
    }

    if (!allVariantsComplete) {
      const firstIncomplete = TIER_ORDER.find((tier) => !isVariantComplete(tier));
      if (firstIncomplete) setActiveTab(firstIncomplete);

      if (completedVariants < TIER_ORDER.length) {
        toast.error(
          `Complete the required fields for Standard, Pro and Pro+ before ${
            isEdit ? 'saving' : 'publishing'
          }.`
        );
      } else {
        toast.error(`Please fix the highlighted fields before ${isEdit ? 'saving' : 'publishing'}.`);
      }
      return;
    }

    const payload: CreatePlanPayload = {
      name: name.trim(),
      slug: slug.trim(),
      description: description.trim(),
      isActive,
      variants: TIER_ORDER.map((tier) => buildVariantPayload(tier)),
    };

    try {
      await onSubmit(payload);
    } catch (err: unknown) {
      const response = err as {
        response?: { data?: { message?: string | string[] } };
      };
      const rawMessage = response?.response?.data?.message;
      const message = Array.isArray(rawMessage) ? rawMessage.join(', ') : rawMessage;

      if (message && message.toLowerCase().includes('slug')) {
        setStep(1);
        setServerErrors({ slug: message });
        setTouched((prev) => ({ ...prev, slug: true }));
        toast.error(message);
        return;
      }

      toast.error(message || (isEdit ? 'Failed to update plan. Please try again.' : 'Failed to create plan. Please try again.'));
    }
  };

  const activeMeta = TIER_META[activeTab];
  const activeState = variants[activeTab];
  const activeErrors = variantErrors[activeTab];
  const activeProgress = variantProgress(activeTab);
  const ActiveIcon = activeMeta.icon;

  /* ---------------------------- Render ---------------------------- */

  return (
    <TooltipProvider delayDuration={200}>
      <div className="mx-auto w-full max-w-7xl space-y-6 px-1 py-2 md:px-2">
        {/* Header */}
        <div className="flex items-start gap-4">
          <Link
            href="/admin/plans"
            className="mt-0.5 rounded-xl border border-gray-200 bg-white p-2.5 text-gray-600 shadow-sm transition-colors hover:bg-gray-50"
            aria-label="Back to plans"
          >
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="text-2xl font-bold tracking-tight text-gray-900">
                {isEdit ? `Edit ${initialPlan?.name || 'Plan'}` : 'Create commercial plan'}
              </h1>
              <span className="rounded-full bg-gray-100 px-2.5 py-0.5 text-xs font-medium text-gray-600">
                {isEdit ? 'Editing' : 'New plan'}
              </span>
            </div>
            <p className="mt-1 max-w-3xl text-sm leading-relaxed text-gray-500">
              {isEdit
                ? 'Update the plan family and all three variant configurations.'
                : 'Define one plan family with Standard (90 days), Pro (180 days) and Pro+ (1 year) variants.'}
            </p>
          </div>
        </div>

        {/* Step Indicator */}
        <div className="mx-auto flex max-w-lg items-center">
          <StepMarker index={1} label="Plan details" active={step >= 1} current={step === 1} />
          <div
            className={`mx-3 h-0.5 flex-1 rounded transition-colors ${
              step >= 2 ? 'bg-blue-600' : 'bg-gray-200'
            }`}
          />
          <StepMarker index={2} label="Variant configuration" active={step >= 2} current={step === 2} />
        </div>

        {/* Required / optional legend */}
        <div className="mx-auto flex max-w-4xl items-start gap-3 rounded-2xl border border-blue-100 bg-blue-50/70 px-4 py-3">
          <Info className="mt-0.5 h-4 w-4 flex-shrink-0 text-blue-600" />
          <p className="text-xs leading-relaxed text-blue-900">
            Fields marked <span className="font-semibold text-red-600">*</span> are required. Each
            variant needs a price, at least one marketing bullet point and a value for every usage
            limit before the plan can be {isEdit ? 'saved' : 'published'}.
          </p>
        </div>

        {/* Step 1: General Info */}
        {step === 1 && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mx-auto max-w-4xl space-y-7 rounded-2xl border border-gray-200 bg-white p-6 shadow-sm sm:p-8"
          >
            <div className="border-b border-gray-100 pb-4">
              <h2 className="text-lg font-semibold text-gray-900">Plan details</h2>
              <p className="mt-1 text-sm text-gray-500">
                Set the commercial brand name and visibility of this plan offering.
              </p>
            </div>

            <div className="space-y-6">
              <div className="grid gap-6 md:grid-cols-2">
                <div>
                  <FieldLabel
                    htmlFor="plan-name"
                    label="Plan family name"
                    required
                    tooltip="The name buyers see at checkout and on plan comparison pages."
                    hint="A clear, commercial name for this plan family."
                    trailing={
                      <span className="text-[11px] tabular-nums text-gray-400">
                        {name.length}/{MAX_NAME}
                      </span>
                    }
                  />
                  <input
                    id="plan-name"
                    type="text"
                    value={name}
                    onChange={(e) => handleNameChange(e.target.value)}
                    onBlur={() => markTouched('name')}
                    placeholder="e.g. Starter Plan, Gold VIP"
                    maxLength={MAX_NAME}
                    aria-invalid={showError('name', stepOneErrors.name, attemptedNext)}
                    aria-describedby={stepOneErrors.name ? 'plan-name-error' : undefined}
                    className={`${inputBase} font-semibold ${showError('name', stepOneErrors.name, attemptedNext) ? inputError : inputNormal}`}
                  />
                  <div id="plan-name-error">
                    <FieldError
                      message={
                        showError('name', stepOneErrors.name, attemptedNext)
                          ? stepOneErrors.name
                          : undefined
                      }
                    />
                  </div>
                </div>

                <div>
                  <FieldLabel
                    htmlFor="plan-slug"
                    label="URL slug"
                    required
                    tooltip="Used in the plan's public URL. Use lowercase letters, numbers and hyphens only."
                    hint="Auto-generated from the name until you edit it."
                    trailing={
                      <span className="text-[11px] tabular-nums text-gray-400">
                        {slug.length}/{MAX_SLUG}
                      </span>
                    }
                  />
                  <div className="flex gap-2">
                    <input
                      id="plan-slug"
                      type="text"
                      value={slug}
                      onChange={(e) => handleSlugChange(e.target.value)}
                      onBlur={() => markTouched('slug')}
                      placeholder="e.g. starter-plan"
                      maxLength={MAX_SLUG}
                      aria-invalid={showError('slug', stepOneErrors.slug, attemptedNext)}
                      aria-describedby={stepOneErrors.slug ? 'plan-slug-error' : undefined}
                      className={`${inputBase} flex-1 font-mono text-[13px] ${showError('slug', stepOneErrors.slug, attemptedNext) ? inputError : inputNormal}`}
                    />
                    <button
                      type="button"
                      onClick={handleRegenerateSlug}
                      disabled={!name.trim()}
                      className="whitespace-nowrap rounded-xl border border-gray-200 px-3 py-2 text-xs font-semibold text-gray-600 transition-colors hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-40"
                    >
                      Regenerate
                    </button>
                  </div>
                  <div id="plan-slug-error">
                    <FieldError
                      message={
                        showError('slug', stepOneErrors.slug, attemptedNext)
                          ? stepOneErrors.slug
                          : undefined
                      }
                    />
                  </div>
                </div>
              </div>

              <div>
                <FieldLabel
                  htmlFor="plan-description"
                  label="Marketing description"
                  required={false}
                  tooltip="A short buyer-facing summary shown when choosing between plans."
                  hint="Optional. Keep it concise and benefit-led."
                  trailing={
                    <span className="text-[11px] tabular-nums text-gray-400">
                      {description.length}/{MAX_DESCRIPTION}
                    </span>
                  }
                />
                <textarea
                  id="plan-description"
                  rows={3}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  onBlur={() => markTouched('description')}
                  placeholder="Brief summary of who this plan is tailored for..."
                  maxLength={MAX_DESCRIPTION}
                  aria-invalid={showError('description', stepOneErrors.description, attemptedNext)}
                  className={`${inputBase} resize-y ${showError('description', stepOneErrors.description, attemptedNext) ? inputError : inputNormal}`}
                />
                <FieldError
                  message={
                    showError('description', stepOneErrors.description, attemptedNext)
                      ? stepOneErrors.description
                      : undefined
                  }
                />
              </div>

              <div className="flex items-center justify-between gap-4 rounded-xl border border-gray-200 bg-slate-50 p-4">
                <div className="flex items-start gap-2">
                  <div>
                    <span className="flex items-center gap-1.5 text-sm font-medium text-gray-900">
                      Plan visibility
                      <InfoTip text="When enabled, the plan is available at checkout. When disabled, it stays hidden from buyers." />
                    </span>
                    <span className="mt-0.5 block text-xs text-gray-500">
                      Enable or disable this plan for commercial checkout across storefronts.
                    </span>
                  </div>
                </div>
                <label className="relative inline-flex cursor-pointer items-center">
                  <input
                    type="checkbox"
                    checked={isActive}
                    onChange={(e) => setIsActive(e.target.checked)}
                    className="peer sr-only"
                    aria-label="Plan visibility"
                  />
                  <div className="h-6 w-11 rounded-full bg-gray-200 after:absolute after:left-[2px] after:top-[2px] after:h-5 after:w-5 after:rounded-full after:border after:border-gray-300 after:bg-white after:transition-all after:content-[''] peer-checked:bg-blue-600 peer-checked:after:translate-x-full peer-checked:after:border-white peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-blue-500/40" />
                </label>
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <button
                type="button"
                onClick={handleNext}
                className="flex items-center gap-2 rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-blue-700"
              >
                <span>Continue to variants</span>
                <Sparkles className="h-4 w-4" />
              </button>
            </div>
          </motion.div>
        )}

        {/* Step 2: Variant Configuration */}
        {step === 2 && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            {/* Variant Selector Tabs */}
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
              {TIER_ORDER.map((tier) => {
                const meta = TIER_META[tier];
                const Icon = meta.icon;
                const complete = isVariantComplete(tier);
                const remaining = variantProgress(tier).remaining;
                const isActive = activeTab === tier;

                return (
                  <button
                    key={tier}
                    type="button"
                    onClick={() => setActiveTab(tier)}
                    aria-current={isActive ? 'true' : undefined}
                    className={`flex items-center gap-3 rounded-2xl border p-4 text-left transition-all ${
                      isActive
                        ? 'border-blue-500 bg-blue-50/60 shadow-sm ring-1 ring-blue-500/20'
                        : 'border-gray-200 bg-white hover:border-gray-300 hover:bg-gray-50/60'
                    }`}
                  >
                    <span
                      className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border ${meta.softClass}`}
                    >
                      <Icon className="h-5 w-5" />
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-sm font-semibold text-gray-900">
                        {meta.fullLabel}
                      </span>
                      <span className="mt-0.5 flex items-center gap-1 text-xs font-medium">
                        {complete ? (
                          <span className="flex items-center gap-1 text-emerald-600">
                            <Check className="h-3.5 w-3.5" /> Ready
                          </span>
                        ) : (
                          <span className="text-amber-600">{remaining} required left</span>
                        )}
                      </span>
                    </span>
                    {isActive && (
                      <span className="rounded-full bg-blue-600 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-white">
                        Editing
                      </span>
                    )}
                  </button>
                );
              })}
            </div>

            {/* Active Variant Configuration Card */}
            <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
              {/* Variant header */}
              <div className="border-b border-gray-100 p-6 sm:p-8">
                <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
                  <div className="flex min-w-0 items-start gap-3">
                    <div className={`shrink-0 rounded-xl border p-2 ${activeMeta.softClass}`}>
                      <ActiveIcon className="h-5 w-5" />
                    </div>
                    <div className="min-w-0">
                      <h2 className="text-xl font-semibold tracking-tight text-gray-900">
                        Configure {activeMeta.fullLabel}
                      </h2>
                      <p className="mt-1 max-w-2xl text-sm leading-relaxed text-gray-500">
                        {activeMeta.duration} access. Set the price, buyer-facing highlights, usage
                        limits and feature access for this variant.
                      </p>
                    </div>
                  </div>

                  <div className="w-full shrink-0 lg:w-56">
                    <FieldLabel
                      htmlFor={`price-${activeTab}`}
                      label="One-off price"
                      required
                      tooltip={`The one-off amount charged for the ${activeMeta.fullLabel} variant, in GBP.`}
                      trailing={<span className="text-[11px] font-medium text-gray-400">GBP</span>}
                    />
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm font-semibold text-gray-500">
                        £
                      </span>
                      <input
                        id={`price-${activeTab}`}
                        type="number"
                        inputMode="decimal"
                        step="0.01"
                        min="0"
                        value={activeState.price}
                        onChange={(e) => handlePriceChange(activeTab, e.target.value)}
                        onBlur={() => markTouched(`${activeTab}.price`)}
                        placeholder="0.00"
                        aria-invalid={showError(`${activeTab}.price`, activeErrors.price, attemptedSave)}
                        className={`${inputBase} pl-7 text-base font-semibold [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none ${showError(`${activeTab}.price`, activeErrors.price, attemptedSave) ? inputError : inputNormal}`}
                      />
                    </div>
                    <FieldError
                      message={
                        showError(`${activeTab}.price`, activeErrors.price, attemptedSave)
                          ? activeErrors.price
                          : undefined
                      }
                    />
                  </div>
                </div>

                {/* Progress */}
                <div className="mt-6">
                  <div className="mb-1.5 flex items-center justify-between text-xs font-medium text-gray-500">
                    <span>Required fields for this variant</span>
                    <span className={activeProgress.remaining === 0 ? 'text-emerald-600' : 'text-amber-600'}>
                      {activeProgress.done}/{activeProgress.total}
                    </span>
                  </div>
                  <div className="h-1.5 w-full overflow-hidden rounded-full bg-gray-100">
                    <div
                      className={`h-full rounded-full transition-all ${
                        activeProgress.remaining === 0 ? 'bg-emerald-500' : 'bg-amber-500'
                      }`}
                      style={{
                        width: `${Math.round((activeProgress.done / activeProgress.total) * 100)}%`,
                      }}
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-8 p-6 sm:p-8">
                {/* Features List Section */}
                <div className="space-y-3">
                  <FieldLabel
                    htmlFor={`feature-input-${activeTab}`}
                    label="Marketing bullet points"
                    required
                    tooltip="Short, buyer-facing highlights shown as bullet points on the plan card. Press Enter or click Add to save each one."
                    hint="Shown to buyers on the plan card. Add at least one."
                    trailing={
                      <span className="text-[11px] font-medium text-gray-400">
                        {activeState.features.length} added
                      </span>
                    }
                  />

                  <div className="flex gap-2">
                    <input
                      id={`feature-input-${activeTab}`}
                      type="text"
                      value={activeState.newFeatureInput}
                      onChange={(e) =>
                        updateVariant(activeTab, (state) => ({
                          ...state,
                          newFeatureInput: e.target.value,
                        }))
                      }
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          handleAddFeature(activeTab);
                        }
                      }}
                      onBlur={() => markTouched(`${activeTab}.features`)}
                      placeholder="e.g. 5 active campaigns, digital stamp multiplier..."
                      maxLength={MAX_FEATURE}
                      className={`${inputBase} flex-1 ${inputNormal}`}
                    />
                    <button
                      type="button"
                      onClick={() => handleAddFeature(activeTab)}
                      disabled={!activeState.newFeatureInput.trim()}
                      className="flex shrink-0 items-center gap-1.5 rounded-xl bg-gray-900 px-4 py-2.5 text-xs font-semibold text-white transition-colors hover:bg-black disabled:cursor-not-allowed disabled:opacity-40"
                    >
                      <Plus className="h-4 w-4" />
                      <span>Add</span>
                    </button>
                  </div>

                  {activeState.features.length > 0 ? (
                    <div className="mt-2 space-y-2">
                      {activeState.features.map((feature, idx) => (
                        <div
                          key={`${feature}-${idx}`}
                          className="flex items-center justify-between gap-3 rounded-xl border border-gray-200 bg-slate-50 p-3 text-sm text-gray-800"
                        >
                          <span className="flex min-w-0 items-center gap-2">
                            <Check className="h-4 w-4 flex-shrink-0 text-emerald-600" />
                            <span className="break-words">{feature}</span>
                          </span>
                          <button
                            type="button"
                            onClick={() => handleRemoveFeature(activeTab, idx)}
                            className="shrink-0 p-1 text-gray-400 transition-colors hover:text-red-600"
                            aria-label={`Remove feature ${feature}`}
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="mt-2 rounded-xl border border-dashed border-gray-300 bg-slate-50/60 px-4 py-6 text-center">
                      <p className="text-xs font-medium text-gray-500">
                        No marketing bullet points added yet.
                      </p>
                      <p className="mt-0.5 text-[11px] text-gray-400">
                        Add at least one bullet point before {isEdit ? 'saving' : 'publishing'} this
                        variant.
                      </p>
                    </div>
                  )}

                  <FieldError
                    message={
                      showError(`${activeTab}.features`, activeErrors.features, attemptedSave)
                        ? activeErrors.features
                        : undefined
                    }
                  />
                </div>

                {/* Usage Limits */}
                <div className="rounded-2xl border border-gray-200 bg-gray-50/70 p-4 sm:p-5">
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                    <div className="flex items-start gap-3">
                      <div className="rounded-lg border border-gray-200 bg-white p-1.5 text-gray-500">
                        <Sliders className="h-4 w-4" />
                      </div>
                      <div>
                        <h3 className="flex items-center gap-1.5 text-base font-semibold text-gray-900">
                          Usage limits
                          <InfoTip text="Each capability can have a numeric cap, or you can mark it as unlimited. Every limit needs either a number or the unlimited option." />
                        </h3>
                        <p className="mt-0.5 text-xs leading-relaxed text-gray-500">
                          Enter a whole number for each limit, or mark it as unlimited.
                        </p>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleSetAllQuotasUnlimited(activeTab)}
                      className="self-start whitespace-nowrap rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-xs font-semibold text-blue-600 transition-colors hover:border-blue-200 hover:bg-blue-50"
                    >
                      Set all to unlimited
                    </button>
                  </div>

                  <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2 2xl:grid-cols-4">
                    {CORE_QUOTA_FIELDS.map((field) => {
                      const path = `${activeTab}.quotas.${field.key}`;
                      const error = activeErrors.quotas[field.key];
                      const hasError = showError(path, error, attemptedSave);
                      const isUnlimited = activeState.unlimitedQuotas[field.key];
                      const inputId = `${activeTab}-${field.key}`;

                      return (
                        <div
                          key={field.key}
                          className={`rounded-xl border bg-white p-4 transition-colors ${
                            isUnlimited
                              ? 'border-blue-200 ring-1 ring-blue-100'
                              : hasError
                              ? 'border-red-300'
                              : 'border-gray-200'
                          }`}
                        >
                          <div className="flex min-h-10 items-start justify-between gap-2">
                            <label
                              htmlFor={inputId}
                              className="text-sm font-medium leading-snug text-gray-900"
                            >
                              {field.label}
                              <span className="ml-0.5 text-red-500">*</span>
                            </label>
                            <InfoTip text={field.tooltip} />
                          </div>

                          <div className="mt-3 space-y-2">
                            <input
                              id={inputId}
                              type="text"
                              inputMode="numeric"
                              value={isUnlimited ? '' : activeState.quotas[field.key]}
                              onChange={(e) => handleQuotaChange(activeTab, field.key, e.target.value)}
                              onBlur={() => markTouched(path)}
                              disabled={isUnlimited}
                              placeholder={isUnlimited ? 'No limit' : field.placeholder}
                              aria-invalid={hasError}
                              aria-describedby={hasError ? `${path}-error` : undefined}
                              className={`h-10 w-full rounded-lg border px-3 text-sm font-medium text-gray-900 shadow-none transition-colors focus:outline-none focus:ring-2 disabled:cursor-not-allowed disabled:bg-gray-50 disabled:text-gray-400 ${
                                hasError
                                  ? 'border-red-400 bg-red-50/40 focus:border-red-500 focus:ring-red-500/30'
                                  : 'border-gray-300 focus:border-blue-500 focus:ring-blue-500/30'
                              }`}
                            />

                            <label
                              htmlFor={`${inputId}-unlimited`}
                              className={`inline-flex cursor-pointer items-center gap-2 rounded-lg border px-2.5 py-1.5 text-xs font-medium transition-colors ${
                                isUnlimited
                                  ? 'border-blue-200 bg-blue-50 text-blue-700'
                                  : 'border-gray-200 text-gray-600 hover:bg-gray-50'
                              }`}
                            >
                              <input
                                id={`${inputId}-unlimited`}
                                type="checkbox"
                                checked={isUnlimited}
                                onChange={(e) =>
                                  handleQuotaUnlimitedChange(activeTab, field.key, e.target.checked)
                                }
                                className="h-3.5 w-3.5 rounded border-gray-300 accent-blue-600"
                              />
                              Unlimited
                            </label>
                          </div>

                          <div id={`${path}-error`}>
                            <FieldError message={hasError ? error : undefined} />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Feature Switches */}
                <div className="space-y-4">
                  <div className="flex items-start gap-3">
                    <div className="rounded-lg border border-gray-200 bg-white p-1.5 text-gray-500">
                      <ShieldCheck className="h-4 w-4" />
                    </div>
                    <div>
                      <h3 className="flex items-center gap-1.5 text-base font-semibold text-gray-900">
                        Feature access
                        <InfoTip text="Toggle on the capabilities included in this variant. Anything left off is denied for this plan." />
                      </h3>
                      <p className="mt-0.5 text-xs leading-relaxed text-gray-500">
                        Optional toggles. Leave off to deny access, or switch on to include the
                        capability in this variant.
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3">
                    {FEATURE_FLAGS.map((flag) => {
                      const flagId = `${activeTab}-${flag.key}`;
                      const isEnabled = activeState.featureFlags[flag.key];

                      return (
                        <div
                          key={flag.key}
                          className={`flex items-start justify-between gap-4 rounded-xl border p-4 transition-colors ${
                            isEnabled
                              ? 'border-blue-200 bg-blue-50/50'
                              : 'border-gray-200 bg-white hover:border-gray-300'
                          }`}
                        >
                          <div className="min-w-0">
                            <div className="flex items-center gap-1.5">
                              <label
                                htmlFor={flagId}
                                className="cursor-pointer text-sm font-medium text-gray-900"
                              >
                                {flag.label}
                              </label>
                              <InfoTip text={`${flag.description} Toggle on to include this capability in the variant.`} />
                            </div>
                            <p className="mt-1 text-xs leading-relaxed text-gray-500">
                              {flag.description}
                            </p>
                          </div>
                          <input
                            id={flagId}
                            type="checkbox"
                            checked={isEnabled}
                            onChange={(e) => handleFlagChange(activeTab, flag.key, e.target.checked)}
                            className="mt-0.5 h-4 w-4 shrink-0 cursor-pointer rounded accent-blue-600"
                          />
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Card actions */}
                <div className="flex items-center justify-between gap-3 border-t border-gray-100 pt-6">
                  <button
                    type="button"
                    onClick={() => setStep(1)}
                    className="rounded-xl border border-gray-200 px-4 py-2.5 text-sm font-semibold text-gray-600 transition-colors hover:bg-gray-50"
                  >
                    Back to plan details
                  </button>

                  {activeTab !== TIER_ORDER[TIER_ORDER.length - 1] && (
                    <button
                      type="button"
                      onClick={() => {
                        const currentIndex = TIER_ORDER.indexOf(activeTab);
                        setActiveTab(TIER_ORDER[currentIndex + 1]);
                      }}
                      className="rounded-xl bg-gray-900 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-black"
                    >
                      Next variant
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* Publishing checklist */}
            <div className="space-y-4 rounded-2xl border border-gray-200 bg-white p-5 shadow-sm sm:p-6">
              <div className="flex items-center justify-between gap-3">
                <h3 className="text-sm font-semibold text-gray-900">
                  {isEdit ? 'Save checklist' : 'Publishing checklist'}
                </h3>
                <span
                  className={`text-xs font-semibold ${
                    completedVariants === TIER_ORDER.length ? 'text-emerald-600' : 'text-amber-600'
                  }`}
                >
                  {completedVariants} of {TIER_ORDER.length} variants ready
                </span>
              </div>

              <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                {TIER_ORDER.map((tier) => {
                  const meta = TIER_META[tier];
                  const Icon = meta.icon;
                  const complete = isVariantComplete(tier);
                  const remaining = variantProgress(tier).remaining;

                  return (
                    <button
                      key={tier}
                      type="button"
                      onClick={() => setActiveTab(tier)}
                      className={`flex items-center justify-between gap-3 rounded-xl border p-3 text-left transition-colors ${
                        complete
                          ? 'border-emerald-200 bg-emerald-50/60 hover:bg-emerald-50'
                          : 'border-amber-200 bg-amber-50/60 hover:bg-amber-50'
                      }`}
                    >
                      <span className="flex min-w-0 items-center gap-2">
                        <Icon className={`h-4 w-4 flex-shrink-0 ${meta.accentClass}`} />
                        <span className="truncate text-xs font-semibold text-gray-900">
                          {meta.label}
                        </span>
                      </span>
                      <span
                        className={`flex flex-shrink-0 items-center gap-1 text-[10px] font-semibold ${
                          complete ? 'text-emerald-700' : 'text-amber-700'
                        }`}
                      >
                        {complete ? (
                          <>
                            <CheckCircle2 className="h-3.5 w-3.5" /> Ready
                          </>
                        ) : (
                          <>
                            <Circle className="h-3 w-3" /> {remaining} left
                          </>
                        )}
                      </span>
                    </button>
                  );
                })}
              </div>

              <div className="flex flex-col gap-3 border-t border-gray-100 pt-4 sm:flex-row sm:items-center sm:justify-between">
                <p className="text-[11px] leading-relaxed text-gray-500">
                  {allVariantsComplete
                    ? isEdit
                      ? 'All variants are complete. You can save your changes.'
                      : 'All variants are complete. You can publish this plan.'
                    : 'Complete every variant before saving. Click a variant above to jump to it.'}
                </p>

                <button
                  type="button"
                  onClick={handleSubmit}
                  disabled={isSubmitting}
                  className="flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition-all hover:bg-blue-700 hover:shadow active:bg-blue-800 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {isSubmitting ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <CheckCircle2 className="h-4 w-4" />
                  )}
                  <span>
                    {isSubmitting
                      ? isEdit
                        ? 'Saving...'
                        : 'Publishing...'
                      : isEdit
                      ? 'Save changes'
                      : 'Publish plan & 3 variants'}
                  </span>
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </div>
    </TooltipProvider>
  );
}
