"use client";

import React, { useMemo, useState } from "react";
import Link from "next/link";
import {
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
import { TooltipProvider } from "@/components/ui/tooltip";
import {
  FieldError,
  FieldLabel,
  InfoTip,
} from "@/components/admin/forms/FormPrimitives";

const QUOTA_FIELDS = [
  {
    key: "maxActiveCampaigns",
    label: "Active campaigns",
    tooltip:
      "The maximum number of campaigns a business can have live at the same time. Mark it as unlimited to remove the cap.",
    placeholder: "e.g. 10",
  },
  {
    key: "maxActiveRewards",
    label: "Active rewards",
    tooltip:
      "The maximum number of rewards that can be live at the same time across all campaigns. Mark it as unlimited to remove the cap.",
    placeholder: "e.g. 50",
  },
  {
    key: "maxRewardsPerCampaign",
    label: "Rewards per campaign",
    tooltip:
      "How many rewards can be attached to a single campaign. Mark it as unlimited to allow any number.",
    placeholder: "e.g. 5",
  },
  {
    key: "monthlyPointsAllowance",
    label: "Monthly points",
    tooltip:
      "The number of loyalty points a business can issue each calendar month. Mark it as unlimited to remove the monthly cap.",
    placeholder: "e.g. 10000",
  },
  {
    key: "monthlyStampsAllowance",
    label: "Monthly stamps",
    tooltip:
      "The number of stamps a business can issue each calendar month. Mark it as unlimited to remove the monthly cap.",
    placeholder: "e.g. 1000",
  },
  {
    key: "maxTeamMembers",
    label: "Team members",
    tooltip:
      "How many staff accounts can access the business dashboard. Mark it as unlimited to allow any number of members.",
    placeholder: "e.g. 5",
  },
  {
    key: "maxGiftCardTemplates",
    label: "Gift card templates",
    tooltip:
      "How many gift card designs a business can create. Mark it as unlimited to allow any number of templates.",
    placeholder: "e.g. 10",
  },
  {
    key: "maxCouponTemplates",
    label: "Coupon templates",
    tooltip:
      "How many coupon designs a business can create. Mark it as unlimited to allow any number of templates.",
    placeholder: "e.g. 10",
  },
] as const;

const FLAG_FIELDS = [
  {
    key: "canCreateCampaignFromScratch",
    label: "Create campaigns from scratch",
    description: "Build campaigns without using a centrally managed template.",
  },
  {
    key: "canEditAdminTemplates",
    label: "Edit admin templates",
    description: "Edit templates that are managed by MCOM admin.",
  },
  {
    key: "hasAccessToAdvancedAnalytics",
    label: "Advanced analytics",
    description: "Unlock realtime analytics dashboards and exports.",
  },
  {
    key: "hasAccessToCRM",
    label: "Customer CRM access",
    description: "Unlock the customer CRM module and segments.",
  },
  {
    key: "canUpdateReward",
    label: "Update rewards",
    description: "Edit rewards after a campaign has gone live.",
  },
  {
    key: "priorityInSearch",
    label: "Priority search placement",
    description: "Boost the business in marketplace and search results.",
  },
] as const;

type QuotaKey = (typeof QUOTA_FIELDS)[number]["key"];
type FlagKey = (typeof FLAG_FIELDS)[number]["key"];

const MAX_NAME = 80;
const MAX_SLUG = 80;
const MAX_DESCRIPTION = 1000;
const MAX_FEATURE = 160;
const MAX_PRICE = 1_000_000;
const MAX_DURATION = 3650;
const MAX_QUOTA = 1_000_000;
const SLUG_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

const inputBase =
  "w-full rounded-xl border bg-white px-3.5 py-2.5 text-sm text-gray-900 shadow-sm transition-colors placeholder:text-gray-400 focus:outline-none focus:ring-2 disabled:cursor-not-allowed disabled:bg-gray-50 disabled:text-gray-400 disabled:shadow-none";
const inputNormal =
  "border-gray-300 focus:border-orange-500 focus:ring-orange-500/30";
const inputError =
  "border-red-400 bg-red-50/40 focus:border-red-500 focus:ring-red-500/30";

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
    <section className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
      <div className="flex items-start gap-3 border-b border-gray-100 px-6 py-5">
        <div className="rounded-xl border border-orange-100 bg-orange-50 p-2.5 text-orange-600">
          <Icon className="h-5 w-5" />
        </div>
        <div>
          <h2 className="text-base font-semibold text-gray-900">{title}</h2>
          <p className="mt-0.5 text-xs leading-relaxed text-gray-500">
            {description}
          </p>
        </div>
      </div>
      <div className="p-6 sm:p-8">{children}</div>
    </section>
  );
}

function SwitchCard({
  id,
  title,
  description,
  tooltip,
  checked,
  onChange,
}: {
  id: string;
  title: string;
  description: string;
  tooltip: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
}) {
  return (
    <div className="flex items-start justify-between gap-4 rounded-xl border border-gray-200 bg-white p-4">
      <div className="min-w-0">
        <div className="flex items-center gap-1.5">
          <span className="text-sm font-medium text-gray-900">{title}</span>
          <InfoTip text={tooltip} />
        </div>
        <p className="mt-1 text-xs leading-relaxed text-gray-500">
          {description}
        </p>
      </div>
      <label className="relative inline-flex shrink-0 cursor-pointer items-center">
        <input
          id={id}
          type="checkbox"
          checked={checked}
          onChange={(e) => onChange(e.target.checked)}
          className="peer sr-only"
        />
        <div className="h-6 w-11 rounded-full bg-gray-200 after:absolute after:left-[2px] after:top-[2px] after:h-5 after:w-5 after:rounded-full after:border after:border-gray-300 after:bg-white after:transition-all after:content-[''] peer-checked:bg-orange-500 peer-checked:after:translate-x-full peer-checked:after:border-white peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-orange-500/40" />
      </label>
    </div>
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
    else if (Number(price) < 0) next.price = "Price cannot be negative.";
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
          "Enter a limit, or mark this as unlimited.";
      } else if (!/^\d+$/.test(value) || Number(value) < 1) {
        next[`quota.${field.key}`] = "Use a whole number of 1 or more.";
      } else if (Number(value) > MAX_QUOTA) {
        next[`quota.${field.key}`] =
          `Keep the value at ${MAX_QUOTA.toLocaleString()} or below.`;
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

  const fieldClass = (key: string) =>
    `${inputBase} ${show(key) ? inputError : inputNormal}`;

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

  return (
    <TooltipProvider delayDuration={200}>
      <form
        onSubmit={handleSubmit}
        className="mx-auto w-full max-w-7xl space-y-6 px-1 py-2 md:px-2"
      >
        {/* Header */}
        <div className="flex items-start gap-4">
          <Link
            href="/admin/access-passes"
            className="mt-0.5 rounded-xl border border-gray-200 bg-white p-2.5 text-gray-600 shadow-sm transition-colors hover:bg-gray-50"
            aria-label="Back to access passes"
          >
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="text-2xl font-bold tracking-tight text-gray-900">
                {isEdit
                  ? `Edit ${initialPlan?.name || "Access Pass"}`
                  : "Create access pass"}
              </h1>
              <span className="rounded-full bg-gray-100 px-2.5 py-0.5 text-xs font-medium text-gray-600">
                {isEdit ? "Editing" : "New pass"}
              </span>
            </div>
            <p className="mt-1 max-w-3xl text-sm leading-relaxed text-gray-500">
              {isEdit
                ? "Update the price, duration, benefits and limits for this access pass."
                : "Define a single-tier pass with its own price, access duration and dashboard limits."}
            </p>
          </div>
        </div>

        <div className="flex items-start gap-3 rounded-2xl border border-blue-100 bg-blue-50/70 px-4 py-3">
          <Info className="mt-0.5 h-4 w-4 flex-shrink-0 text-blue-600" />
          <p className="text-xs leading-relaxed text-blue-900">
            Access passes have no Standard/Pro/Pro+ tiers. Each pass is sold or
            gifted on its own, and redemption codes snapshot the configuration
            at grant time.
          </p>
        </div>

        <Section
          title="Pass details"
          description="How this access pass appears to admins and businesses."
          icon={Tag}
        >
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            <div>
              <FieldLabel
                htmlFor="pass-name"
                label="Name"
                required
                tooltip="The name admins and businesses see for this access pass."
                hint="A clear, commercial name for the pass."
                trailing={
                  <span className="text-[11px] tabular-nums text-gray-400">
                    {name.length}/{MAX_NAME}
                  </span>
                }
              />
              <input
                id="pass-name"
                value={name}
                onChange={(e) => handleNameChange(e.target.value)}
                onBlur={() => markTouched("name")}
                maxLength={MAX_NAME}
                placeholder="e.g. 30-Day Growth Pass"
                className={`${fieldClass("name")} font-semibold`}
              />
              <FieldError message={show("name") ? errors.name : undefined} />
            </div>

            <div>
              <FieldLabel
                htmlFor="pass-slug"
                label="URL slug"
                required
                tooltip="Used in the pass's public URL. Use lowercase letters, numbers and hyphens only."
                hint="Auto-generated from the name until you edit it."
                trailing={
                  <span className="text-[11px] tabular-nums text-gray-400">
                    {slug.length}/{MAX_SLUG}
                  </span>
                }
              />
              <input
                id="pass-slug"
                value={slug}
                onChange={(e) => {
                  setSlugEdited(true);
                  setSlug(e.target.value.toLowerCase());
                }}
                onBlur={() => markTouched("slug")}
                maxLength={MAX_SLUG}
                placeholder="30-day-growth-pass"
                className={`${fieldClass("slug")} font-mono text-[13px]`}
              />
              <FieldError message={show("slug") ? errors.slug : undefined} />
            </div>

            <div>
              <FieldLabel
                htmlFor="pass-price"
                label="Price"
                required
                tooltip="One-off price for this pass in GBP. Enter 0 if the pass should be free."
                trailing={
                  <span className="text-[11px] font-medium text-gray-400">
                    GBP
                  </span>
                }
              />
              <div className="relative">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-sm font-semibold text-gray-500">
                  £
                </span>
                <input
                  id="pass-price"
                  type="text"
                  inputMode="decimal"
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  onBlur={() => markTouched("price")}
                  placeholder="30.00"
                  className={`${fieldClass("price")} pl-8`}
                />
              </div>
              <FieldError message={show("price") ? errors.price : undefined} />
            </div>

            <div>
              <FieldLabel
                htmlFor="pass-duration"
                label="Access duration"
                required
                tooltip="How many days of access the pass grants from the date it is activated."
                trailing={
                  <span className="text-[11px] font-medium text-gray-400">
                    days
                  </span>
                }
              />
              <div className="relative">
                <CalendarDays className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                <input
                  id="pass-duration"
                  type="text"
                  inputMode="numeric"
                  value={durationDays}
                  onChange={(e) => setDurationDays(e.target.value)}
                  onBlur={() => markTouched("durationDays")}
                  placeholder="30"
                  className={`${fieldClass("durationDays")} pl-10`}
                />
              </div>
              <FieldError
                message={show("durationDays") ? errors.durationDays : undefined}
              />
            </div>

            <div className="md:col-span-2">
              <FieldLabel
                htmlFor="pass-description"
                label="Marketing description"
                required={false}
                tooltip="A short buyer-facing summary shown when businesses choose an access pass."
                hint="Optional. Keep it concise and benefit-led."
                trailing={
                  <span className="text-[11px] tabular-nums text-gray-400">
                    {description.length}/{MAX_DESCRIPTION}
                  </span>
                }
              />
              <textarea
                id="pass-description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                onBlur={() => markTouched("description")}
                rows={3}
                maxLength={MAX_DESCRIPTION}
                placeholder="Who is this pass for and what does it unlock?"
                className={`${fieldClass("description")} resize-y`}
              />
              <FieldError
                message={
                  show("description") ? errors.description : undefined
                }
              />
            </div>
          </div>
        </Section>

        <Section
          title="Features & benefits"
          description="Marketing bullets shown on the pass card and in the grant email."
          icon={Sparkles}
        >
          <FieldLabel
            htmlFor="pass-feature-input"
            label="Marketing bullet points"
            required
            tooltip="Short benefit shown on the pass card and in the grant email. Press Enter or click Add to save each one."
            hint="Add at least one bullet point."
            trailing={
              <span className="text-[11px] font-medium text-gray-400">
                {features.length} added
              </span>
            }
          />
          <div className="flex flex-col gap-2 sm:flex-row">
            <input
              id="pass-feature-input"
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
              className={`${inputBase} flex-1 ${inputNormal}`}
            />
            <button
              type="button"
              onClick={handleAddFeature}
              disabled={!newFeature.trim()}
              className="inline-flex shrink-0 items-center justify-center gap-2 rounded-xl bg-orange-500 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-orange-600 disabled:cursor-not-allowed disabled:opacity-40"
            >
              <Plus className="h-4 w-4" />
              Add
            </button>
          </div>
          <FieldError
            message={show("features") ? errors.features : undefined}
          />

          {features.length > 0 ? (
            <ul className="mt-4 space-y-2">
              {features.map((feature, index) => (
                <li
                  key={`${feature}-${index}`}
                  className="flex items-center justify-between gap-3 rounded-xl border border-gray-200 bg-slate-50 px-4 py-3"
                >
                  <span className="flex min-w-0 items-center gap-2 text-sm text-gray-800">
                    <CheckCircle2 className="h-4 w-4 flex-shrink-0 text-emerald-600" />
                    <span className="break-words">{feature}</span>
                  </span>
                  <button
                    type="button"
                    onClick={() => removeFeature(index)}
                    className="shrink-0 rounded-lg p-1.5 text-gray-400 transition-colors hover:bg-red-50 hover:text-red-600"
                    aria-label={`Remove ${feature}`}
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </li>
              ))}
            </ul>
          ) : (
            <div className="mt-4 rounded-xl border border-dashed border-gray-300 bg-slate-50/60 px-4 py-6 text-center">
              <p className="text-xs font-medium text-gray-500">
                No features or benefits added yet.
              </p>
              <p className="mt-0.5 text-[11px] text-gray-400">
                Add at least one bullet point before saving this pass.
              </p>
            </div>
          )}
        </Section>

        <Section
          title="Limits & feature access"
          description="These are enforced for businesses on this pass. Every limit needs a number or the unlimited option."
          icon={Users}
        >
          <div className="rounded-2xl border border-gray-200 bg-gray-50/70 p-4 sm:p-5">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <h3 className="flex items-center gap-1.5 text-base font-semibold text-gray-900">
                  Usage limits
                  <InfoTip text="Each capability can have a numeric cap, or you can mark it as unlimited. Every limit needs either a number or the unlimited option." />
                </h3>
                <p className="mt-0.5 text-xs leading-relaxed text-gray-500">
                  Enter a whole number for each limit, or mark it as unlimited.
                </p>
              </div>
              <button
                type="button"
                onClick={setAllUnlimited}
                className="self-start whitespace-nowrap rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-xs font-semibold text-orange-600 transition-colors hover:border-orange-200 hover:bg-orange-50"
              >
                Set all to unlimited
              </button>
            </div>

            <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2 2xl:grid-cols-4">
              {QUOTA_FIELDS.map((field) => {
                const key = `quota.${field.key}`;
                const hasError = show(key);
                const isUnlimited = unlimited[field.key];
                const inputId = `quota-${field.key}`;

                return (
                  <div
                    key={field.key}
                    className={`rounded-xl border bg-white p-4 transition-colors ${
                      isUnlimited
                        ? "border-orange-200 ring-1 ring-orange-100"
                        : hasError
                        ? "border-red-300"
                        : "border-gray-200"
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
                        value={isUnlimited ? "" : quotas[field.key]}
                        onChange={(e) => {
                          const digits = e.target.value.replace(/\D/g, "");
                          setQuotas((prev) => ({
                            ...prev,
                            [field.key]: digits,
                          }));
                        }}
                        onBlur={() => markTouched(key)}
                        disabled={isUnlimited}
                        placeholder={
                          isUnlimited ? "No limit" : field.placeholder
                        }
                        className={`h-10 w-full rounded-lg border px-3 text-sm font-medium text-gray-900 shadow-none transition-colors focus:outline-none focus:ring-2 disabled:cursor-not-allowed disabled:bg-gray-50 disabled:text-gray-400 ${
                          hasError
                            ? "border-red-400 bg-red-50/40 focus:border-red-500 focus:ring-red-500/30"
                            : "border-gray-300 focus:border-orange-500 focus:ring-orange-500/30"
                        }`}
                      />

                      <label
                        htmlFor={`${inputId}-unlimited`}
                        className={`inline-flex cursor-pointer items-center gap-2 rounded-lg border px-2.5 py-1.5 text-xs font-medium transition-colors ${
                          isUnlimited
                            ? "border-orange-200 bg-orange-50 text-orange-700"
                            : "border-gray-200 text-gray-600 hover:bg-gray-50"
                        }`}
                      >
                        <input
                          id={`${inputId}-unlimited`}
                          type="checkbox"
                          checked={isUnlimited}
                          onChange={(e) =>
                            setQuotaUnlimited(field.key, e.target.checked)
                          }
                          className="h-3.5 w-3.5 rounded border-gray-300 accent-orange-500"
                        />
                        Unlimited
                      </label>
                    </div>

                    <FieldError
                      message={hasError ? errors[key] : undefined}
                    />
                  </div>
                );
              })}
            </div>
          </div>

          <div className="mt-6 border-t border-gray-100 pt-6">
            <div className="mb-4">
              <h3 className="flex items-center gap-1.5 text-base font-semibold text-gray-900">
                Feature access
                <InfoTip text="Toggle on the capabilities included in this pass. Anything left off is denied for this pass." />
              </h3>
              <p className="mt-0.5 text-xs leading-relaxed text-gray-500">
                Optional toggles. Leave off to deny access, or switch on to
                include the capability.
              </p>
            </div>

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3">
              {FLAG_FIELDS.map((field) => {
                const flagId = `flag-${field.key}`;
                const isEnabled = flags[field.key];

                return (
                  <div
                    key={field.key}
                    className={`flex items-start justify-between gap-4 rounded-xl border p-4 transition-colors ${
                      isEnabled
                        ? "border-orange-200 bg-orange-50/50"
                        : "border-gray-200 bg-white hover:border-gray-300"
                    }`}
                  >
                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5">
                        <label
                          htmlFor={flagId}
                          className="cursor-pointer text-sm font-medium text-gray-900"
                        >
                          {field.label}
                        </label>
                        <InfoTip
                          text={`${field.description} Toggle on to include this capability in the pass.`}
                        />
                      </div>
                      <p className="mt-1 text-xs leading-relaxed text-gray-500">
                        {field.description}
                      </p>
                    </div>
                    <input
                      id={flagId}
                      type="checkbox"
                      checked={isEnabled}
                      onChange={(e) =>
                        setFlags((prev) => ({
                          ...prev,
                          [field.key]: e.target.checked,
                        }))
                      }
                      className="mt-0.5 h-4 w-4 shrink-0 cursor-pointer rounded accent-orange-500"
                    />
                  </div>
                );
              })}
            </div>
          </div>
        </Section>

        <Section
          title="Availability"
          description="Control whether the pass can be purchased, gifted by code, or both."
          icon={KeyRound}
        >
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
            <SwitchCard
              id="pass-active"
              title="Active"
              description="Visible in the catalogue."
              tooltip="When enabled, the pass appears in the catalogue and can be assigned or purchased."
              checked={isActive}
              onChange={setIsActive}
            />
            <SwitchCard
              id="pass-purchasable"
              title="Purchasable"
              description="Businesses can pay for it."
              tooltip="Allow businesses to buy this pass directly from the catalogue."
              checked={purchaseEnabled}
              onChange={setPurchaseEnabled}
            />
            <SwitchCard
              id="pass-code-redemption"
              title="Code redemption"
              description="Admin codes unlock it."
              tooltip="Allow admins to grant the pass with a redemption code."
              checked={codeRedemptionEnabled}
              onChange={setCodeRedemptionEnabled}
            />
          </div>
        </Section>

        {isEdit && (
          <Section
            title="Apply changes to subscribers"
            description="Choose whether this edit affects only future subscribers or your existing ones too."
            icon={Users}
          >
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <button
                type="button"
                onClick={() => setApplyMode("new")}
                className={`rounded-xl border-2 p-4 text-left transition-all ${
                  applyMode === "new"
                    ? "border-orange-500 bg-orange-50/60"
                    : "border-gray-200 hover:border-gray-300"
                }`}
              >
                <span className="block text-sm font-semibold text-gray-900">
                  New subscribers only
                </span>
                <span className="mt-1 block text-xs leading-relaxed text-gray-500">
                  Existing pass holders keep their current features, limits and
                  expiry.
                </span>
              </button>
              <button
                type="button"
                onClick={() => setApplyMode("existing")}
                className={`rounded-xl border-2 p-4 text-left transition-all ${
                  applyMode === "existing"
                    ? "border-orange-500 bg-orange-50/60"
                    : "border-gray-200 hover:border-gray-300"
                }`}
              >
                <span className="block text-sm font-semibold text-gray-900">
                  New & existing subscribers
                </span>
                <span className="mt-1 block text-xs leading-relaxed text-gray-500">
                  Update every existing pass snapshot with the new features,
                  limits and price.
                </span>
              </button>
            </div>
            {applyMode === "existing" && (
              <div className="mt-4 rounded-xl border border-amber-200 bg-amber-50 p-4">
                <div className="flex items-start gap-3">
                  <input
                    id="recalculate-expiry"
                    type="checkbox"
                    checked={recalculateExpiry}
                    onChange={(e) => setRecalculateExpiry(e.target.checked)}
                    className="mt-0.5 h-4 w-4 rounded border-amber-300 accent-amber-500"
                  />
                  <div>
                    <label
                      htmlFor="recalculate-expiry"
                      className="cursor-pointer text-sm font-semibold text-amber-900"
                    >
                      Recalculate expiry using the new duration
                    </label>
                    <div className="mt-0.5 flex items-start gap-1.5">
                      <p className="text-xs leading-relaxed text-amber-800/80">
                        Existing passes will end {durationDays || "—"} days
                        after their original start date.
                      </p>
                      <InfoTip text="Existing passes will be re-dated using the new duration, counted from each pass's original start date." />
                    </div>
                  </div>
                </div>
              </div>
            )}
          </Section>
        )}

        <div className="sticky bottom-4 z-10">
          <div className="flex flex-col items-center justify-between gap-3 rounded-2xl border border-gray-200 bg-white/95 px-4 py-3 shadow-lg backdrop-blur sm:flex-row">
            <p className="text-xs text-gray-500">
              {Object.keys(errors).length > 0
                ? `${Object.keys(errors).length} field(s) need attention`
                : "All required fields are complete"}
            </p>
            <div className="flex w-full items-center gap-2 sm:w-auto">
              <Link
                href="/admin/access-passes"
                className="flex-1 rounded-xl px-4 py-2.5 text-center text-sm font-semibold text-gray-600 hover:bg-gray-100 sm:flex-none"
              >
                Cancel
              </Link>
              <button
                type="submit"
                disabled={isSubmitting}
                className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-orange-500 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-orange-600 disabled:opacity-50 sm:flex-none"
              >
                {isSubmitting ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <CheckCircle2 className="h-4 w-4" />
                )}
                {isEdit ? "Save changes" : "Create access pass"}
              </button>
            </div>
          </div>
        </div>
      </form>
    </TooltipProvider>
  );
}
