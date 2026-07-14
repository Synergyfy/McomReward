// Centralized content accessors for pricing and coupons.
import pricing from "@/content/pricing.json";

export type BillingCycle = "quarterly" | "annual";

export interface Tier {
  name: string;
  description: string;
  quarterlyPrice: number;
  annualPrice: number | null; // null means compute as 4 * quarterly
  includesNfc: boolean;
  features: string[];
}

export interface Coupon {
  code: string;
  discountPercent: number; // 0-100
  expiresAt: string; // ISO date
}

interface PricingData {
  tiers: Tier[];
  featuresForComparison: string[];
  comparisonMatrix: Record<string, (string | boolean)[]>; // keys match tier names (columns)
  trial: { durationDays: number; creditCardRequired: boolean };
  coupons: Coupon[];
}

const data = pricing as unknown as PricingData;

export function getTiers(): Tier[] {
  return data.tiers;
}

export function getTierByName(name: string): Tier | undefined {
  return getTiers().find((t) => t.name.toLowerCase() === name.toLowerCase());
}

export function getPrice(tier: Tier, cycle: BillingCycle): number {
  if (cycle === "quarterly") return tier.quarterlyPrice;
  const specified = tier.annualPrice;
  return specified != null ? specified : tier.quarterlyPrice * 4;
}

export function listFeatureRows(): string[] {
  return pricing.featuresForComparison as string[];
}

export function getComparisonMatrix(): Record<string, (string | boolean)[]> {
  return data.comparisonMatrix;
}

export function getTrialInfo(): { durationDays: number; creditCardRequired: boolean } {
  return data.trial;
}

export function findCoupon(code?: string | null): Coupon | undefined {
  if (!code) return undefined;
  const normalized = code.trim().toUpperCase();
  const coupon = data.coupons.find((c) => c.code.toUpperCase() === normalized);
  if (!coupon) return undefined;
  const now = new Date();
  const exp = new Date(coupon.expiresAt);
  if (isNaN(exp.getTime()) || exp < now) return undefined;
  return coupon;
}

export function applyCoupon(amount: number, coupon?: Coupon): { final: number; discount: number } {
  if (!coupon) return { final: amount, discount: 0 };
  const discount = Math.round((amount * coupon.discountPercent) / 100);
  return { final: Math.max(0, amount - discount), discount };
}


