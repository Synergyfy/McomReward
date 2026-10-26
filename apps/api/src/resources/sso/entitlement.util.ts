import { PlatformEntitlement } from "./interfaces/entitlement.interface";

/**
 * Central returns the entitlement either directly (token exchange) or wrapped
 * in an envelope (`{ success, entitlement, appPlan, membership, user }`) from
 * the userinfo/introspection endpoints. Normalise both shapes here so callers
 * never have to care.
 */
export function unwrapPlatformEntitlement(
  payload: unknown,
): PlatformEntitlement | null {
  if (!payload || typeof payload !== "object") return null;

  const candidate = (payload as any).entitlement ?? payload;
  if (!candidate || typeof candidate !== "object" || !candidate.access) {
    return null;
  }

  return candidate as PlatformEntitlement;
}
