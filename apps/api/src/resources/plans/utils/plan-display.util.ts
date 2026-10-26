const TIER_SUFFIX: Record<string, string> = {
  PRO: " Pro",
  PRO_PLUS: " Pro+",
};

/**
 * Build the display name for a plan from our own catalogue: the plan family
 * name plus its tier variant, e.g. plan "Gold" + variant "PRO" → "Gold Pro".
 */
export function formatPlanDisplayName(
  planName?: string | null,
  tierName?: string | null,
): string | null {
  if (!planName) return null;

  const tier = (tierName || "").toUpperCase();
  const suffix = TIER_SUFFIX[tier];
  if (!suffix) return planName;

  const normalized = planName.trim().toLowerCase();
  if (normalized.endsWith(suffix.trim().toLowerCase())) return planName;

  return `${planName}${suffix}`;
}

/**
 * Extract a tier from a plan name received from Central, e.g. "Gold Pro" →
 * "PRO", "Gold Pro+" → "PRO_PLUS".
 */
export function extractTierFromPlanName(
  planName?: string | null,
): string | null {
  if (!planName) return null;

  const normalized = planName.trim().toLowerCase();
  if (/pro\s*\+$/.test(normalized) || /pro_plus$/.test(normalized)) {
    return "PRO_PLUS";
  }
  if (/\bpro$/.test(normalized)) return "PRO";
  if (/\bstandard$/.test(normalized)) return "STANDARD";
  return null;
}

/** Remove a trailing tier token from a plan name, e.g. "Gold Pro" → "Gold". */
export function stripTierSuffix(planName?: string | null): string | null {
  if (!planName) return null;

  const stripped = planName
    .replace(/\s+(pro\s*\+|pro_plus|pro|standard)$/i, "")
    .trim();

  return stripped || planName.trim();
}
