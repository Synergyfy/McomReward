'use client';

import React, { useMemo, useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  AlertCircle,
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

/* ------------------------------------------------------------------ */
/* Backend contract (mirrors GET /plans/schema and CreatePlanDto)      */
/* ------------------------------------------------------------------ */

const TIER_ORDER = ['STANDARD', 'PRO', 'PRO_PLUS'] as const;
type TierKey = (typeof TIER_ORDER)[number];

const CORE_QUOTA_FIELDS = [
  { key: 'maxActiveCampaigns', label: 'Max active campaigns' },
  { key: 'maxActiveRewards', label: 'Max active rewards' },
  { key: 'maxRewardsPerCampaign', label: 'Max rewards per campaign' },
  { key: 'monthlyPointsAllowance', label: 'Monthly points allowance' },
  { key: 'monthlyStampsAllowance', label: 'Monthly stamps allowance' },
  { key: 'maxTeamMembers', label: 'Max team members' },
  { key: 'maxGiftCardTemplates', label: 'Max gift card templates' },
  { key: 'maxCouponTemplates', label: 'Max coupon templates' },
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
  {
    key: 'allowCustomBranding',
    label: 'Custom storefront branding',
    description: 'Apply custom branding and colours to their storefront.',
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
  featureFlags: Record<FlagKey, boolean>;
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
  for (const field of CORE_QUOTA_FIELDS) {
    const value = variant?.configuration?.quotas?.[field.key];
    quotas[field.key] = typeof value === 'number' ? String(value) : '';
  }

  const featureFlags = emptyFlags();
  for (const flag of FEATURE_FLAGS) {
    featureFlags[flag.key] = Boolean(variant?.configuration?.featureFlags?.[flag.key]);
  }

  return {
    price: activePrice ? String(activePrice.amount) : '',
    features: variant?.features ? [...variant.features] : [],
    newFeatureInput: '',
    quotas,
    featureFlags,
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
  if (!value) return 'Required. Use -1 for unlimited.';
  if (!/^-?\d+$/.test(value)) return 'Use a whole number (or -1 for unlimited).';
  const number = Number(value);
  if (!Number.isFinite(number)) return 'Enter a valid number.';
  if (number < -1) return 'Use -1 for unlimited or a value of 0 or more.';
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

function RequirementBadge({ required }: { required: boolean }) {
  return (
    <span
      className={`text-[10px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded border ${
        required
          ? 'text-red-600 bg-red-50 border-red-200'
          : 'text-gray-500 bg-gray-50 border-gray-200'
      }`}
    >
      {required ? 'Required' : 'Optional'}
    </span>
  );
}

function FieldLabel({
  htmlFor,
  label,
  required,
  hint,
  children,
}: {
  htmlFor?: string;
  label: string;
  required: boolean;
  hint?: string;
  children?: React.ReactNode;
}) {
  return (
    <div className="mb-1.5">
      <div className="flex items-center justify-between gap-2">
        <label
          htmlFor={htmlFor}
          className="block text-xs font-bold text-gray-700 uppercase tracking-wider"
        >
          {label}
          {required && <span className="text-red-500 ml-0.5">*</span>}
        </label>
        <div className="flex items-center gap-2">
          {children}
          <RequirementBadge required={required} />
        </div>
      </div>
      {hint && <p className="text-xs text-gray-500 mt-1">{hint}</p>}
    </div>
  );
}

function FieldError({ message }: { message?: string }) {
  if (!message) return null;
  return (
    <p className="mt-1 text-xs font-medium text-red-600 flex items-center gap-1" role="alert">
      <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" />
      {message}
    </p>
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
    updateVariant(tier, (state) => ({
      ...state,
      quotas: { ...state.quotas, [key]: value },
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
      quotas: CORE_QUOTA_FIELDS.reduce(
        (acc, field) => ({ ...acc, [field.key]: '-1' }),
        {} as Record<QuotaKey, string>
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
      acc[field.key] = Number(state.quotas[field.key]);
      return acc;
    }, {} as Record<string, number>);

    return {
      tier,
      price: Number(state.price),
      features: state.features.map((feature) => feature.trim()).filter(Boolean),
      configuration: {
        quotas,
        featureFlags: { ...state.featureFlags },
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
    <div className="p-6 md:p-8 space-y-8 max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link
          href="/admin/plans"
          className="p-2.5 rounded-xl border border-gray-200 bg-white hover:bg-gray-50 text-gray-600 transition-colors shadow-sm"
          aria-label="Back to plans"
        >
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div>
          <h1 className="text-2xl font-black text-gray-900">
            {isEdit ? `Edit ${initialPlan?.name || 'Plan'}` : 'Create Commercial Plan'}
          </h1>
          <p className="text-sm text-gray-500">
            {isEdit
              ? 'Update the plan family and all three variant configurations.'
              : 'Define one commercial plan family with Standard (90d), Pro (180d) and Pro+ (1yr) variants.'}
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

      {/* Required / optional legend */}
      <div className="flex items-start gap-3 rounded-2xl border border-blue-100 bg-blue-50/70 px-4 py-3 max-w-4xl mx-auto">
        <Info className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
        <p className="text-xs text-blue-900 leading-relaxed">
          Fields marked <span className="font-bold text-red-600">Required</span> must be completed.
          Every variant needs its price, at least one marketing feature and all quotas before the plan
          can be {isEdit ? 'saved' : 'published'}.{' '}
          <span className="font-semibold">Optional</span> fields can be left as-is.
        </p>
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

          <div className="space-y-5">
            <div>
              <FieldLabel
                htmlFor="plan-name"
                label="Plan Family Name"
                required
                hint="The name buyers will see at checkout."
              >
                <span className="text-[11px] text-gray-400 tabular-nums">
                  {name.length}/{MAX_NAME}
                </span>
              </FieldLabel>
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
                className={`w-full px-4 py-3 rounded-xl border font-bold text-gray-900 transition-colors focus:outline-none focus:ring-2 ${
                  showError('name', stepOneErrors.name, attemptedNext)
                    ? 'border-red-400 bg-red-50/30 focus:ring-red-500'
                    : 'border-gray-300 focus:ring-blue-500'
                }`}
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
                label="URL Safe Slug"
                required
                hint="Lowercase letters, numbers and hyphens only. Auto-generated from the name until you edit it."
              >
                <span className="text-[11px] text-gray-400 tabular-nums">
                  {slug.length}/{MAX_SLUG}
                </span>
              </FieldLabel>
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
                  className={`flex-1 px-4 py-3 rounded-xl border font-mono text-sm text-gray-800 transition-colors focus:outline-none focus:ring-2 ${
                    showError('slug', stepOneErrors.slug, attemptedNext)
                      ? 'border-red-400 bg-red-50/30 focus:ring-red-500'
                      : 'border-gray-300 focus:ring-blue-500'
                  }`}
                />
                <button
                  type="button"
                  onClick={handleRegenerateSlug}
                  disabled={!name.trim()}
                  className="px-3 py-2 rounded-xl border border-gray-200 text-xs font-bold text-gray-600 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
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

            <div>
              <FieldLabel
                htmlFor="plan-description"
                label="Marketing Description"
                required={false}
                hint="A short summary shown to buyers on the plan selection screen."
              >
                <span className="text-[11px] text-gray-400 tabular-nums">
                  {description.length}/{MAX_DESCRIPTION}
                </span>
              </FieldLabel>
              <textarea
                id="plan-description"
                rows={3}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                onBlur={() => markTouched('description')}
                placeholder="Brief summary of who this plan is tailored for..."
                maxLength={MAX_DESCRIPTION}
                aria-invalid={showError('description', stepOneErrors.description, attemptedNext)}
                className={`w-full px-4 py-3 rounded-xl border text-sm text-gray-800 transition-colors focus:outline-none focus:ring-2 ${
                  showError('description', stepOneErrors.description, attemptedNext)
                    ? 'border-red-400 bg-red-50/30 focus:ring-red-500'
                    : 'border-gray-300 focus:ring-blue-500'
                }`}
              />
              <FieldError
                message={
                  showError('description', stepOneErrors.description, attemptedNext)
                    ? stepOneErrors.description
                    : undefined
                }
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
                  aria-label="Plan visibility"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600" />
              </label>
            </div>
          </div>

          <div className="pt-4 flex justify-end">
            <button
              type="button"
              onClick={handleNext}
              className="px-6 py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm shadow-md transition-all flex items-center gap-2"
            >
              <span>Next: Configure 3 Variants</span>
              <Sparkles className="w-4 h-4" />
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
          <div className="flex justify-center">
            <div className="inline-flex p-1.5 bg-white border border-gray-200 rounded-2xl shadow-sm gap-2 flex-wrap justify-center">
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
                    className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold transition-all ${
                      isActive ? meta.activeClass : 'text-gray-600 hover:text-gray-900'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    <span>{meta.fullLabel}</span>
                    <span
                      className={`ml-1 inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wide px-1.5 py-0.5 rounded-full ${
                        complete
                          ? 'bg-emerald-100 text-emerald-700'
                          : isActive
                          ? 'bg-white/25 text-white'
                          : 'bg-amber-50 text-amber-700'
                      }`}
                    >
                      {complete ? (
                        <>
                          <Check className="w-3 h-3" /> Ready
                        </>
                      ) : (
                        `${remaining} left`
                      )}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Active Variant Configuration Card */}
          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 sm:p-8 space-y-8 max-w-4xl mx-auto">
            {/* Variant header */}
            <div className="border-b border-gray-100 pb-4 space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                <div className="flex items-start gap-3">
                  <div className={`p-2 rounded-xl border ${activeMeta.softClass}`}>
                    <ActiveIcon className="w-5 h-5" />
                  </div>
                  <div>
                    <h2 className="text-xl font-black text-gray-900">
                      Configure {activeMeta.fullLabel}
                    </h2>
                    <p className="text-xs text-gray-500 mt-0.5">
                      Duration: {activeMeta.duration}. Set pricing, buyer-facing features, quota limits
                      and feature access for this variant.
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 sm:pl-4">
                  <FieldLabel htmlFor={`price-${activeTab}`} label="One-off Price" required>
                    <span className="text-[11px] text-gray-400">GBP</span>
                  </FieldLabel>
                </div>
              </div>

              <div>
                <div className="relative w-full sm:w-48">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 font-bold text-gray-500">
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
                    className={`w-full pl-7 pr-3 py-2.5 rounded-xl border font-extrabold text-gray-900 text-lg transition-colors focus:outline-none focus:ring-2 ${
                      showError(`${activeTab}.price`, activeErrors.price, attemptedSave)
                        ? 'border-red-400 bg-red-50/30 focus:ring-red-500'
                        : 'border-gray-300 focus:ring-blue-500'
                    }`}
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

              {/* Progress */}
              <div className="pt-1">
                <div className="flex items-center justify-between text-[11px] font-semibold text-gray-500 mb-1.5">
                  <span>Required fields for this variant</span>
                  <span
                    className={
                      activeProgress.remaining === 0 ? 'text-emerald-600' : 'text-amber-600'
                    }
                  >
                    {activeProgress.done}/{activeProgress.total}
                  </span>
                </div>
                <div className="h-1.5 w-full rounded-full bg-gray-100 overflow-hidden">
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

            {/* Features List Section */}
            <div className="space-y-3">
              <FieldLabel
                htmlFor={`feature-input-${activeTab}`}
                label="Marketing Bullet Points"
                required
                hint="Shown to buyers on the plan card. Add at least one."
              >
                <span className="text-[11px] text-gray-400">
                  {activeState.features.length} added
                </span>
              </FieldLabel>

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
                  placeholder="e.g. 5 Active Campaigns, Digital Stamp Multiplier..."
                  maxLength={MAX_FEATURE}
                  className="flex-1 px-4 py-2.5 rounded-xl border border-gray-300 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <button
                  type="button"
                  onClick={() => handleAddFeature(activeTab)}
                  disabled={!activeState.newFeatureInput.trim()}
                  className="px-4 py-2.5 bg-gray-900 hover:bg-black text-white text-xs font-bold rounded-xl flex items-center gap-1.5 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                >
                  <Plus className="w-4 h-4" />
                  <span>Add</span>
                </button>
              </div>

              {activeState.features.length > 0 ? (
                <div className="space-y-2 mt-2">
                  {activeState.features.map((feature, idx) => (
                    <div
                      key={`${feature}-${idx}`}
                      className="flex justify-between items-center p-3 bg-slate-50 border border-gray-200 rounded-xl text-sm text-gray-800"
                    >
                      <span className="flex items-center gap-2">
                        <Check className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                        {feature}
                      </span>
                      <button
                        type="button"
                        onClick={() => handleRemoveFeature(activeTab, idx)}
                        className="text-gray-400 hover:text-red-600 transition-colors p-1"
                        aria-label={`Remove feature ${feature}`}
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="mt-2 rounded-xl border border-dashed border-gray-300 bg-slate-50/60 px-4 py-6 text-center">
                  <p className="text-xs font-semibold text-gray-500">
                    No marketing features added yet.
                  </p>
                  <p className="text-[11px] text-gray-400 mt-0.5">
                    Add at least one bullet point before {isEdit ? 'saving' : 'publishing'} this variant.
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

            {/* Quotas Grid */}
            <div className="space-y-4 pt-4 border-t border-gray-100">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                <div className="flex items-start gap-2">
                  <Sliders className="w-4 h-4 text-gray-400 mt-0.5" />
                  <div>
                    <h3 className="text-sm font-bold text-gray-900">Enforced Quota Limits</h3>
                    <p className="text-xs text-gray-500">
                      Whole numbers only. Use <span className="font-semibold">-1</span> for unlimited.
                      All quota fields are required.
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => handleSetAllQuotasUnlimited(activeTab)}
                  className="text-xs font-bold text-blue-600 hover:text-blue-700 underline underline-offset-2 self-start sm:self-auto"
                >
                  Set all to unlimited (-1)
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {CORE_QUOTA_FIELDS.map((field) => {
                  const path = `${activeTab}.quotas.${field.key}`;
                  const error = activeErrors.quotas[field.key];
                  const hasError = showError(path, error, attemptedSave);

                  return (
                    <div key={field.key}>
                      <FieldLabel htmlFor={`${path}`} label={field.label} required>
                        <span className="text-[11px] text-gray-400">-1 = ∞</span>
                      </FieldLabel>
                      <input
                        id={path}
                        type="number"
                        inputMode="numeric"
                        step="1"
                        min="-1"
                        value={activeState.quotas[field.key]}
                        onChange={(e) => handleQuotaChange(activeTab, field.key, e.target.value)}
                        onBlur={() => markTouched(path)}
                        placeholder="Required"
                        aria-invalid={hasError}
                        aria-describedby={hasError ? `${path}-error` : undefined}
                        className={`w-full px-3 py-2.5 rounded-lg border text-sm font-bold text-gray-900 transition-colors focus:outline-none focus:ring-2 ${
                          hasError
                            ? 'border-red-400 bg-red-50/30 focus:ring-red-500'
                            : 'border-gray-300 focus:ring-blue-500'
                        }`}
                      />
                      <div id={`${path}-error`}>
                        <FieldError message={hasError ? error : undefined} />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Feature Switches */}
            <div className="space-y-4 pt-4 border-t border-gray-100">
              <div className="flex items-start gap-2">
                <ShieldCheck className="w-4 h-4 text-gray-400 mt-0.5" />
                <div>
                  <h3 className="text-sm font-bold text-gray-900">Feature Access</h3>
                  <p className="text-xs text-gray-500">
                    Optional toggles. Leave off to deny access; switch on to include the capability in
                    this variant.
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {FEATURE_FLAGS.map((flag) => (
                  <label
                    key={flag.key}
                    className="flex items-start justify-between gap-4 p-3.5 bg-slate-50 border border-gray-200 rounded-xl cursor-pointer hover:border-gray-300 transition-colors"
                  >
                    <span>
                      <span className="block text-xs font-semibold text-gray-800">
                        {flag.label}
                      </span>
                      <span className="block text-[11px] text-gray-500 mt-0.5 leading-relaxed">
                        {flag.description}
                      </span>
                    </span>
                    <input
                      type="checkbox"
                      checked={activeState.featureFlags[flag.key]}
                      onChange={(e) => handleFlagChange(activeTab, flag.key, e.target.checked)}
                      className="mt-0.5 h-4 w-4 flex-shrink-0 accent-blue-600"
                    />
                  </label>
                ))}
              </div>
            </div>

            {/* Card actions */}
            <div className="pt-6 border-t border-gray-100 flex justify-between items-center gap-3">
              <button
                type="button"
                onClick={() => setStep(1)}
                className="px-5 py-2.5 rounded-xl border border-gray-200 text-sm font-semibold text-gray-600 hover:bg-gray-50 transition-colors"
              >
                Back to Step 1
              </button>

              {activeTab !== TIER_ORDER[TIER_ORDER.length - 1] && (
                <button
                  type="button"
                  onClick={() => {
                    const currentIndex = TIER_ORDER.indexOf(activeTab);
                    setActiveTab(TIER_ORDER[currentIndex + 1]);
                  }}
                  className="px-5 py-2.5 rounded-xl bg-gray-900 hover:bg-black text-white text-sm font-bold transition-colors"
                >
                  Next variant
                </button>
              )}
            </div>
          </div>

          {/* Publishing checklist */}
          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5 max-w-4xl mx-auto space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-gray-900">
                {isEdit ? 'Save checklist' : 'Publishing checklist'}
              </h3>
              <span
                className={`text-xs font-bold ${
                  completedVariants === TIER_ORDER.length ? 'text-emerald-600' : 'text-amber-600'
                }`}
              >
                {completedVariants} of {TIER_ORDER.length} variants ready
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
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
                    className={`flex items-center justify-between gap-3 p-3 rounded-xl border text-left transition-colors ${
                      complete
                        ? 'border-emerald-200 bg-emerald-50/60 hover:bg-emerald-50'
                        : 'border-amber-200 bg-amber-50/60 hover:bg-amber-50'
                    }`}
                  >
                    <span className="flex items-center gap-2 min-w-0">
                      <Icon className={`w-4 h-4 flex-shrink-0 ${meta.accentClass}`} />
                      <span className="text-xs font-bold text-gray-900 truncate">
                        {meta.label}
                      </span>
                    </span>
                    <span
                      className={`flex items-center gap-1 text-[10px] font-bold flex-shrink-0 ${
                        complete ? 'text-emerald-700' : 'text-amber-700'
                      }`}
                    >
                      {complete ? (
                        <>
                          <CheckCircle2 className="w-3.5 h-3.5" /> Ready
                        </>
                      ) : (
                        <>
                          <Circle className="w-3 h-3" /> {remaining} left
                        </>
                      )}
                    </span>
                  </button>
                );
              })}
            </div>

            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pt-2">
              <p className="text-[11px] text-gray-500">
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
                className="px-6 py-3 rounded-xl bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white font-bold text-sm shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <CheckCircle2 className="w-4 h-4" />
                )}
                <span>
                  {isSubmitting
                    ? isEdit
                      ? 'Saving...'
                      : 'Publishing...'
                    : isEdit
                    ? 'Save Changes'
                    : 'Publish Plan & 3 Variants'}
                </span>
              </button>
            </div>
          </div>
        </motion.div>
      )}
    </div>
  );
}
