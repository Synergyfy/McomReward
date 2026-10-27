"use client";

import React, { useMemo, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  AlertCircle,
  ArrowLeft,
  CalendarDays,
  CheckCircle2,
  Info,
  KeyRound,
  Loader2,
  Plus,
  Sparkles,
  Tag,
  Trash2,
  Users,
} from "lucide-react";
import { toast } from "sonner";
import {
  AccessPassConfiguration,
  AccessPassPlan,
  CreateAccessPassPlanPayload,
  UpdateAccessPassPlanPayload,
} from "@/services/admin/access-passes";

const QUOTA_FIELDS = [
  { key: "maxActiveCampaigns", label: "Max active campaigns" },
  { key: "maxActiveRewards", label: "Max active rewards" },
  { key: "maxRewardsPerCampaign", label: "Max rewards per campaign" },
  { key: "monthlyPointsAllowance", label: "Monthly points allowance" },
  { key: "monthlyStampsAllowance", label: "Monthly stamps allowance" },
  { key: "maxTeamMembers", label: "Max team members" },
  { key: "maxGiftCardTemplates", label: "Max gift card templates" },
  { key: "maxCouponTemplates", label: "Max coupon templates" },
] as const;

const FLAG_FIELDS = [
  {
    key: "canCreateCampaignFromScratch",
    label: "Create campaigns from scratch",
  },
  { key: "canEditAdminTemplates", label: "Edit admin templates" },
  { key: "hasAccessToAdvancedAnalytics", label: "Advanced analytics" },
  { key: "hasAccessToCRM", label: "Customer CRM access" },
  { key: "canUpdateReward", label: "Update rewards" },
  { key: "priorityInSearch", label: "Priority search placement" },
] as const;

type QuotaKey = (typeof QUOTA_FIELDS)[number]["key"];
type FlagKey = (typeof FLAG_FIELDS)[number]["key"];

const MAX_NAME = 80;
const MAX_SLUG = 80;
const MAX_DESCRIPTION = 1000;
const MAX_FEATURE = 160;
const MAX_PRICE = 1_000_000;
const MAX_DURATION = 3650;
const SLUG_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

const slugify = (value: string) =>
  value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");

const emptyQuotas = (): Record<QuotaKey, string> =>
  QUOTA_FIELDS.reduce(
    (acc, field) => ({ ...acc, [field.key]: "" }),
    {} as Record<QuotaKey, string>,
  );

const emptyFlags = (): Record<FlagKey, boolean> =>
  FLAG_FIELDS.reduce(
    (acc, field) => ({ ...acc, [field.key]: false }),
    {} as Record<FlagKey, boolean>,
  );

function FieldError({ message }: { message?: string }) {
  if (!message) return null;
  return (
    <p
      className="mt-1 text-xs font-medium text-red-600 flex items-center gap-1"
      role="alert"
    >
      <AlertCircle className="w-3.5 h-3.5 shrink-0" />
      {message}
    </p>
  );
}

function Section({
  title,
  description,
  icon: Icon,
  children,
}: {
  title: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  children: React.ReactNode;
}) {
  return (
    <section className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
      <div className="px-6 py-5 border-b border-gray-100 flex items-start gap-3">
        <div className="p-2.5 rounded-xl bg-orange-50 text-orange-600 border border-orange-100">
          <Icon className="w-5 h-5" />
        </div>
        <div>
          <h2 className="text-base font-black text-gray-900">{title}</h2>
          <p className="text-xs text-gray-500 mt-0.5">{description}</p>
        </div>
      </div>
      <div className="p-6">{children}</div>
    </section>
  );
}

export interface AccessPassPlanFormProps {
  mode: "create" | "edit";
  initialPlan?: AccessPassPlan;
  isSubmitting: boolean;
  onSubmit: (
    payload: CreateAccessPassPlanPayload | UpdateAccessPassPlanPayload,
  ) => Promise<void>;
}

export function AccessPassPlanForm({
  mode,
  initialPlan,
  isSubmitting,
  onSubmit,
}: AccessPassPlanFormProps) {
  const isEdit = mode === "edit";

  const [name, setName] = useState(initialPlan?.name ?? "");
  const [slug, setSlug] = useState(initialPlan?.slug ?? "");
  const [slugEdited, setSlugEdited] = useState(Boolean(initialPlan));
  const [description, setDescription] = useState(
    initialPlan?.description ?? "",
  );
  const [price, setPrice] = useState(
    initialPlan?.price !== undefined ? String(initialPlan.price) : "",
  );
  const [durationDays, setDurationDays] = useState(
    initialPlan?.durationDays !== undefined
      ? String(initialPlan.durationDays)
      : "",
  );
  const [features, setFeatures] = useState<string[]>(
    initialPlan?.features ?? [],
  );
  const [newFeature, setNewFeature] = useState("");
  const [quotas, setQuotas] = useState<Record<QuotaKey, string>>(() => {
    const next = emptyQuotas();
    for (const field of QUOTA_FIELDS) {
      const value = initialPlan?.configuration?.quotas?.[field.key];
      next[field.key] =
        typeof value === "number" && value > 0 ? String(value) : "";
    }
    return next;
  });
  const [unlimited, setUnlimited] = useState<Record<QuotaKey, boolean>>(() => {
    const next = {} as Record<QuotaKey, boolean>;
    for (const field of QUOTA_FIELDS) {
      next[field.key] = initialPlan?.configuration?.quotas?.[field.key] === -1;
    }
    return next;
  });
  const [flags, setFlags] = useState<Record<FlagKey, boolean>>(() => {
    const next = emptyFlags();
    for (const field of FLAG_FIELDS) {
      next[field.key] = Boolean(
        initialPlan?.configuration?.featureFlags?.[field.key],
      );
    }
    return next;
  });
  const preservedFlags = useMemo(() => {
    const editable = new Set<string>(FLAG_FIELDS.map((field) => field.key));
    const next: Record<string, boolean> = {};
    for (const [key, value] of Object.entries(
      initialPlan?.configuration?.featureFlags ?? {},
    )) {
      if (!editable.has(key)) next[key] = Boolean(value);
    }
    return next;
  }, [initialPlan]);

  const [isActive, setIsActive] = useState(initialPlan?.isActive ?? true);
  const [purchaseEnabled, setPurchaseEnabled] = useState(
    initialPlan?.purchaseEnabled ?? true,
  );
  const [codeRedemptionEnabled, setCodeRedemptionEnabled] = useState(
    initialPlan?.codeRedemptionEnabled ?? true,
  );
  const [applyMode, setApplyMode] = useState<"new" | "existing">("new");
  const [recalculateExpiry, setRecalculateExpiry] = useState(false);
  const [attempted, setAttempted] = useState(false);
  const [touched, setTouched] = useState<Record<string, boolean>>({});

  const markTouched = (key: string) =>
    setTouched((prev) => (prev[key] ? prev : { ...prev, [key]: true }));

  const errors = useMemo(() => {
    const next: Record<string, string | undefined> = {};
    const trimmedName = name.trim();
    const trimmedSlug = slug.trim();

    if (!trimmedName) next.name = "Access pass name is required.";
    else if (trimmedName.length < 2) next.name = "Use at least 2 characters.";
    else if (trimmedName.length > MAX_NAME)
      next.name = `Keep under ${MAX_NAME} characters.`;

    if (!trimmedSlug) next.slug = "Slug is required.";
    else if (!SLUG_PATTERN.test(trimmedSlug))
      next.slug = "Use lowercase letters, numbers and single hyphens.";

    if (description.trim().length > MAX_DESCRIPTION)
      next.description = `Keep under ${MAX_DESCRIPTION} characters.`;

    if (!price.trim()) next.price = "Enter a price (use 0 for free).";
    else if (!/^\d+(\.\d{1,2})?$/.test(price.trim()))
      next.price = "Use a valid amount with up to 2 decimals.";
    else if (Number(price) > MAX_PRICE)
      next.price = `Keep the price under £${MAX_PRICE.toLocaleString()}.`;

    if (!durationDays.trim()) next.durationDays = "Enter the access duration.";
    else if (!/^\d+$/.test(durationDays.trim()))
      next.durationDays = "Use a whole number of days.";
    else if (Number(durationDays) < 1 || Number(durationDays) > MAX_DURATION)
      next.durationDays = `Use 1–${MAX_DURATION} days.`;

    if (features.length === 0)
      next.features = "Add at least one feature or benefit.";

    for (const field of QUOTA_FIELDS) {
      if (unlimited[field.key]) continue;
      const value = quotas[field.key].trim();
      if (!value) {
        next[`quota.${field.key}`] =
          "Enter a positive limit or tick Unlimited.";
      } else if (!/^\d+$/.test(value) || Number(value) < 1) {
        next[`quota.${field.key}`] =
          "Use a whole number of 1 or more, or tick Unlimited.";
      }
    }

    return next;
  }, [
    name,
    slug,
    description,
    price,
    durationDays,
    features,
    quotas,
    unlimited,
  ]);

  const show = (key: string) =>
    Boolean(errors[key]) && (attempted || touched[key]);

  const handleNameChange = (value: string) => {
    setName(value);
    if (!slugEdited) setSlug(slugify(value));
  };

  const handleAddFeature = () => {
    const text = newFeature.trim();
    if (!text) return;
    if (text.length > MAX_FEATURE) {
      toast.error(`Keep each feature under ${MAX_FEATURE} characters.`);
      return;
    }
    if (features.some((f) => f.toLowerCase() === text.toLowerCase())) {
      toast.error("That feature has already been added.");
      return;
    }
    setFeatures((prev) => [...prev, text]);
    setNewFeature("");
  };

  const removeFeature = (index: number) =>
    setFeatures((prev) => prev.filter((_, i) => i !== index));

  const setAllUnlimited = () => {
    setQuotas(emptyQuotas());
    setUnlimited(
      QUOTA_FIELDS.reduce(
        (acc, field) => ({ ...acc, [field.key]: true }),
        {} as Record<QuotaKey, boolean>,
      ),
    );
  };

  const setQuotaUnlimited = (key: QuotaKey, checked: boolean) =>
    setUnlimited((prev) => ({ ...prev, [key]: checked }));

  const buildConfiguration = (): AccessPassConfiguration => ({
    quotas: QUOTA_FIELDS.reduce(
      (acc, field) => {
        acc[field.key] = unlimited[field.key] ? -1 : Number(quotas[field.key]);
        return acc;
      },
      {} as Record<string, number>,
    ),
    featureFlags: { ...preservedFlags, ...flags },
  });

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setAttempted(true);

    if (Object.keys(errors).length > 0) {
      toast.error("Please fix the highlighted fields before saving.");
      return;
    }

    const payload: CreateAccessPassPlanPayload = {
      name: name.trim(),
      slug: slug.trim(),
      description: description.trim() || undefined,
      price: Number(price),
      currency: "GBP",
      durationDays: Number(durationDays),
      features: features.map((f) => f.trim()).filter(Boolean),
      configuration: buildConfiguration(),
      isActive,
      purchaseEnabled,
      codeRedemptionEnabled,
    };

    try {
      await onSubmit(
        isEdit
          ? {
              ...payload,
              updateExistingSubscribers: applyMode === "existing",
              recalculateExpiry:
                applyMode === "existing" ? recalculateExpiry : false,
            }
          : payload,
      );
    } catch (err: any) {
      const raw = err?.response?.data?.message;
      const message = Array.isArray(raw) ? raw.join(", ") : raw;
      toast.error(
        message || `Failed to ${isEdit ? "update" : "create"} access pass.`,
      );
    }
  };

  const inputClass = (key: string) =>
    `w-full px-4 py-2.5 rounded-xl border font-medium text-gray-900 transition-colors focus:outline-none focus:ring-2 ${
      show(key)
        ? "border-red-400 bg-red-50/30 focus:ring-red-500"
        : "border-gray-300 focus:ring-orange-500"
    }`;

  return (
    <form
      onSubmit={handleSubmit}
      className="p-6 md:p-8 space-y-6 max-w-5xl mx-auto"
    >
      <div className="flex items-center gap-4">
        <Link
          href="/admin/access-passes"
          className="p-2.5 rounded-xl border border-gray-200 bg-white hover:bg-gray-50 text-gray-600 transition-colors shadow-sm"
          aria-label="Back to access passes"
        >
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div>
          <h1 className="text-2xl font-black text-gray-900">
            {isEdit
              ? `Edit ${initialPlan?.name || "Access Pass"}`
              : "Create Access Pass"}
          </h1>
          <p className="text-sm text-gray-500">
            {isEdit
              ? "Update price, duration, features and limits for this access pass."
              : "Define a single-tier pass with its own price, access duration and dashboard limits."}
          </p>
        </div>
      </div>

      <div className="flex items-start gap-3 rounded-2xl border border-blue-100 bg-blue-50/70 px-4 py-3">
        <Info className="w-4 h-4 text-blue-600 mt-0.5 shrink-0" />
        <p className="text-xs text-blue-900 leading-relaxed">
          Access passes have no Standard/Pro/Pro+ tiers. Each pass is sold or
          gifted on its own. Redemption codes snapshot the configuration at
          grant time.
        </p>
      </div>

      <Section
        title="Pass details"
        description="How this access pass appears to admins and businesses."
        icon={Tag}
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div>
            <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
              Name <span className="text-red-500">*</span>
            </label>
            <input
              value={name}
              onChange={(e) => handleNameChange(e.target.value)}
              onBlur={() => markTouched("name")}
              maxLength={MAX_NAME}
              placeholder="e.g. 30-Day Growth Pass"
              className={inputClass("name")}
            />
            <FieldError message={show("name") ? errors.name : undefined} />
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
              Slug <span className="text-red-500">*</span>
            </label>
            <input
              value={slug}
              onChange={(e) => {
                setSlugEdited(true);
                setSlug(e.target.value.toLowerCase());
              }}
              onBlur={() => markTouched("slug")}
              maxLength={MAX_SLUG}
              placeholder="30-day-growth-pass"
              className={inputClass("slug")}
            />
            <FieldError message={show("slug") ? errors.slug : undefined} />
          </div>

          <div className="md:col-span-2">
            <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
              Description
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              onBlur={() => markTouched("description")}
              rows={3}
              maxLength={MAX_DESCRIPTION}
              placeholder="Who is this pass for and what does it unlock?"
              className={inputClass("description")}
            />
            <div className="flex justify-between mt-1">
              <FieldError
                message={show("description") ? errors.description : undefined}
              />
              <span className="text-[11px] text-gray-400 tabular-nums ml-auto">
                {description.length}/{MAX_DESCRIPTION}
              </span>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
              Price (GBP) <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 font-bold">
                £
              </span>
              <input
                type="text"
                inputMode="decimal"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                onBlur={() => markTouched("price")}
                placeholder="30.00"
                className={`${inputClass("price")} pl-8`}
              />
            </div>
            <FieldError message={show("price") ? errors.price : undefined} />
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
              Access duration (days) <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <CalendarDays className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                inputMode="numeric"
                value={durationDays}
                onChange={(e) => setDurationDays(e.target.value)}
                onBlur={() => markTouched("durationDays")}
                placeholder="30"
                className={`${inputClass("durationDays")} pl-10`}
              />
            </div>
            <FieldError
              message={show("durationDays") ? errors.durationDays : undefined}
            />
          </div>
        </div>
      </Section>

      <Section
        title="Features & benefits"
        description="Marketing bullets shown on the pass card and in the grant email."
        icon={Sparkles}
      >
        <div className="flex flex-col sm:flex-row gap-2">
          <input
            value={newFeature}
            onChange={(e) => setNewFeature(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                handleAddFeature();
              }
            }}
            maxLength={MAX_FEATURE}
            placeholder="e.g. Up to 5 active campaigns"
            className="flex-1 px-4 py-2.5 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-orange-500"
          />
          <button
            type="button"
            onClick={handleAddFeature}
            className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-orange-500 hover:bg-orange-600 text-white text-sm font-bold"
          >
            <Plus className="w-4 h-4" />
            Add
          </button>
        </div>
        <FieldError message={show("features") ? errors.features : undefined} />
        <ul className="mt-4 space-y-2">
          {features.map((feature, index) => (
            <li
              key={`${feature}-${index}`}
              className="flex items-center justify-between gap-3 rounded-xl border border-gray-200 bg-gray-50/60 px-3.5 py-2.5"
            >
              <span className="flex items-center gap-2 text-sm text-gray-700">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                {feature}
              </span>
              <button
                type="button"
                onClick={() => removeFeature(index)}
                className="p-1.5 rounded-lg text-gray-400 hover:text-red-600 hover:bg-red-50"
                aria-label={`Remove ${feature}`}
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </li>
          ))}
          {features.length === 0 && (
            <li className="text-xs text-gray-400 italic">
              No features added yet.
            </li>
          )}
        </ul>
      </Section>

      <Section
        title="Limits & feature flags"
        description="These are enforced for businesses on this pass. Tick Unlimited for no cap, or enter a positive limit."
        icon={Users}
      >
        <div className="flex justify-end mb-3">
          <button
            type="button"
            onClick={setAllUnlimited}
            className="text-xs font-bold text-orange-600 hover:text-orange-700"
          >
            Set all quotas unlimited
          </button>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {QUOTA_FIELDS.map((field) => (
            <div key={field.key}>
              <div className="flex items-center justify-between gap-2 mb-1.5">
                <label
                  htmlFor={`quota-${field.key}`}
                  className="block text-[11px] font-bold text-gray-600 uppercase tracking-wider"
                >
                  {field.label}
                </label>
                <label className="inline-flex items-center gap-1.5 cursor-pointer shrink-0">
                  <input
                    type="checkbox"
                    checked={unlimited[field.key]}
                    onChange={(e) =>
                      setQuotaUnlimited(field.key, e.target.checked)
                    }
                    className="h-3.5 w-3.5 rounded border-gray-300 text-orange-600 focus:ring-orange-500"
                  />
                  <span className="text-[11px] font-semibold text-gray-500">
                    Unlimited
                  </span>
                </label>
              </div>
              <input
                id={`quota-${field.key}`}
                type="text"
                inputMode="numeric"
                value={unlimited[field.key] ? "" : quotas[field.key]}
                onChange={(e) => {
                  const digits = e.target.value.replace(/\D/g, "");
                  setQuotas((prev) => ({ ...prev, [field.key]: digits }));
                }}
                onBlur={() => markTouched(`quota.${field.key}`)}
                disabled={unlimited[field.key]}
                placeholder={
                  unlimited[field.key] ? "Unlimited" : "Enter a limit"
                }
                className={`w-full px-3 py-2 rounded-lg border text-sm font-medium focus:outline-none focus:ring-2 disabled:bg-gray-100 disabled:text-gray-400 disabled:cursor-not-allowed ${
                  show(`quota.${field.key}`)
                    ? "border-red-400 bg-red-50/30 focus:ring-red-500"
                    : "border-gray-300 focus:ring-orange-500"
                }`}
              />
              <FieldError
                message={
                  show(`quota.${field.key}`)
                    ? errors[`quota.${field.key}`]
                    : undefined
                }
              />
            </div>
          ))}
        </div>

        <div className="mt-6 pt-5 border-t border-gray-100">
          <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-3">
            Dashboard feature access
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {FLAG_FIELDS.map((field) => (
              <label
                key={field.key}
                className="flex items-center gap-3 px-3 py-2.5 rounded-xl border border-gray-200 hover:bg-gray-50 cursor-pointer"
              >
                <input
                  type="checkbox"
                  checked={flags[field.key]}
                  onChange={(e) =>
                    setFlags((prev) => ({
                      ...prev,
                      [field.key]: e.target.checked,
                    }))
                  }
                  className="h-4 w-4 rounded border-gray-300 text-orange-600 focus:ring-orange-500"
                />
                <span className="text-sm text-gray-700">{field.label}</span>
              </label>
            ))}
          </div>
        </div>
      </Section>

      <Section
        title="Availability"
        description="Control whether the pass can be purchased, gifted by code, or both."
        icon={KeyRound}
      >
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <label className="flex items-start gap-3 p-3.5 rounded-xl border border-gray-200 hover:bg-gray-50 cursor-pointer">
            <input
              type="checkbox"
              checked={isActive}
              onChange={(e) => setIsActive(e.target.checked)}
              className="mt-0.5 h-4 w-4 rounded border-gray-300 text-orange-600"
            />
            <span>
              <span className="block text-sm font-bold text-gray-800">
                Active
              </span>
              <span className="block text-xs text-gray-500 mt-0.5">
                Visible in the catalogue
              </span>
            </span>
          </label>
          <label className="flex items-start gap-3 p-3.5 rounded-xl border border-gray-200 hover:bg-gray-50 cursor-pointer">
            <input
              type="checkbox"
              checked={purchaseEnabled}
              onChange={(e) => setPurchaseEnabled(e.target.checked)}
              className="mt-0.5 h-4 w-4 rounded border-gray-300 text-orange-600"
            />
            <span>
              <span className="block text-sm font-bold text-gray-800">
                Purchasable
              </span>
              <span className="block text-xs text-gray-500 mt-0.5">
                Businesses can pay for it
              </span>
            </span>
          </label>
          <label className="flex items-start gap-3 p-3.5 rounded-xl border border-gray-200 hover:bg-gray-50 cursor-pointer">
            <input
              type="checkbox"
              checked={codeRedemptionEnabled}
              onChange={(e) => setCodeRedemptionEnabled(e.target.checked)}
              className="mt-0.5 h-4 w-4 rounded border-gray-300 text-orange-600"
            />
            <span>
              <span className="block text-sm font-bold text-gray-800">
                Code redemption
              </span>
              <span className="block text-xs text-gray-500 mt-0.5">
                Admin codes unlock it
              </span>
            </span>
          </label>
        </div>
      </Section>

      {isEdit && (
        <Section
          title="Apply changes to subscribers"
          description="Choose whether this edit affects only future subscribers or your existing ones too."
          icon={Users}
        >
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => setApplyMode("new")}
              className={`text-left p-4 rounded-xl border-2 transition-all ${
                applyMode === "new"
                  ? "border-orange-500 bg-orange-50/60"
                  : "border-gray-200 hover:border-gray-300"
              }`}
            >
              <span className="block text-sm font-bold text-gray-900">
                New subscribers only
              </span>
              <span className="block text-xs text-gray-500 mt-1">
                Existing pass holders keep their current features, limits and
                expiry.
              </span>
            </button>
            <button
              type="button"
              onClick={() => setApplyMode("existing")}
              className={`text-left p-4 rounded-xl border-2 transition-all ${
                applyMode === "existing"
                  ? "border-orange-500 bg-orange-50/60"
                  : "border-gray-200 hover:border-gray-300"
              }`}
            >
              <span className="block text-sm font-bold text-gray-900">
                New & existing subscribers
              </span>
              <span className="block text-xs text-gray-500 mt-1">
                Update every existing pass snapshot with the new features,
                limits and price.
              </span>
            </button>
          </div>
          {applyMode === "existing" && (
            <label className="mt-4 flex items-start gap-3 p-3.5 rounded-xl border border-amber-200 bg-amber-50 cursor-pointer">
              <input
                type="checkbox"
                checked={recalculateExpiry}
                onChange={(e) => setRecalculateExpiry(e.target.checked)}
                className="mt-0.5 h-4 w-4 rounded border-amber-300 text-amber-600"
              />
              <span>
                <span className="block text-sm font-bold text-amber-900">
                  Recalculate expiry using the new duration
                </span>
                <span className="block text-xs text-amber-800/80 mt-0.5">
                  Existing passes will end {durationDays || "—"} days after
                  their original start date.
                </span>
              </span>
            </label>
          )}
        </Section>
      )}

      <div className="sticky bottom-4 z-10">
        <div className="bg-white/95 backdrop-blur border border-gray-200 rounded-2xl shadow-lg px-4 py-3 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-xs text-gray-500">
            {Object.keys(errors).length > 0
              ? `${Object.keys(errors).length} field(s) need attention`
              : "All required fields are complete"}
          </p>
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <Link
              href="/admin/access-passes"
              className="flex-1 sm:flex-none px-4 py-2.5 rounded-xl text-sm font-semibold text-gray-600 hover:bg-gray-100 text-center"
            >
              Cancel
            </Link>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 sm:flex-none inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold text-white bg-orange-500 hover:bg-orange-600 disabled:opacity-50"
            >
              {isSubmitting ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <CheckCircle2 className="w-4 h-4" />
              )}
              {isEdit ? "Save changes" : "Create access pass"}
            </button>
          </div>
        </div>
      </div>
    </form>
  );
}
