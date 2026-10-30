/**
 * Reward fulfilment taxonomy.
 *
 * A reward's cosmetic `reward_type` (Voucher, gift card, coupon, …) is kept
 * for display. Fulfilment is described separately so one provider can deliver
 * a reward without changing the catalogue semantics.
 */

export enum FulfilmentProvider {
  NONE = "NONE",
  MALL = "MALL",
  CENTRAL = "CENTRAL",
}

export enum FulfilmentKind {
  MALL_DISCOUNT = "MALL_DISCOUNT",
  MALL_GIFT_CARD = "MALL_GIFT_CARD",
  MALL_VOUCHER = "MALL_VOUCHER",
  MALL_COUPON = "MALL_COUPON",
  CENTRAL_MEMBERSHIP = "CENTRAL_MEMBERSHIP",
  CENTRAL_ACCESS_PASS = "CENTRAL_ACCESS_PASS",
  CENTRAL_COUPON = "CENTRAL_COUPON",
}

export enum FulfilmentStatus {
  PENDING = "PENDING",
  DELIVERED = "DELIVERED",
  FAILED = "FAILED",
  REVOKED = "REVOKED",
  NOT_REQUIRED = "NOT_REQUIRED",
  PENDING_IDENTITY = "PENDING_IDENTITY",
  PENDING_CONFLICT = "PENDING_CONFLICT",
}

export enum FulfilmentFundingSource {
  BUSINESS_WALLET = "BUSINESS_WALLET",
  PLATFORM = "PLATFORM",
}

export enum FulfilmentOperation {
  FULFIL = "FULFIL",
  RETRY = "RETRY",
  REVOKE = "REVOKE",
}

export enum FulfilmentOutboxStatus {
  PENDING = "PENDING",
  PROCESSING = "PROCESSING",
  SENT = "SENT",
  FAILED = "FAILED",
  DEAD = "DEAD",
}

/** Stable error codes surfaced to admins and the reconciliation view. */
export enum FulfilmentErrorCode {
  RECIPIENT_IDENTITY_UNRESOLVED = "RECIPIENT_IDENTITY_UNRESOLVED",
  RECIPIENT_NOT_A_BUSINESS = "RECIPIENT_NOT_A_BUSINESS",
  MEMBERSHIP_CONFLICT = "MEMBERSHIP_CONFLICT",
  PLAN_NOT_AVAILABLE = "PLAN_NOT_AVAILABLE",
  TEMPLATE_NOT_FOUND = "TEMPLATE_NOT_FOUND",
  TEMPLATE_NOT_OWNED = "TEMPLATE_NOT_OWNED",
  SCOPE_EMPTY = "SCOPE_EMPTY",
  SCOPE_NO_ELIGIBLE_LINES = "SCOPE_NO_ELIGIBLE_LINES",
  CROSS_TENANT_SCOPE = "CROSS_TENANT_SCOPE",
  CODE_ALREADY_USED = "CODE_ALREADY_USED",
  PROVIDER_UNAVAILABLE = "PROVIDER_UNAVAILABLE",
  FEATURE_DISABLED = "FEATURE_DISABLED",
  UNKNOWN_PROVIDER_ERROR = "UNKNOWN_PROVIDER_ERROR",
}

export interface RewardFulfilmentConfig {
  provider?: FulfilmentProvider;
  kind?: FulfilmentKind;
  delivery?: "CODE" | "DIRECT_GRANT" | "CHECKOUT_APPLY";
  templateRef?: { system: "MALL" | "CENTRAL"; id: string } | null;
  businessId?: string | null;
  businessMcomUserId?: string | null;
  businessName?: string | null;
  scope?: {
    mode?: "ALL" | "LISTINGS" | "ITEMS" | "NO_SCOPE";
    listingIds?: string[];
    productIds?: string[];
    serviceIds?: string[];
    planIds?: string[];
    accessPlanIds?: string[];
  } | null;
  value?: {
    amount?: number;
    currency?: string;
    discountType?: "percentage" | "fixed" | "PERCENTAGE" | "FIXED";
    discountValue?: number;
    maxDiscount?: number;
    minSpend?: number;
  } | null;
  validity?: {
    expiresInDays?: number;
    expiresAt?: string;
  } | null;
  grant?: {
    planId?: string;
    tier?: string;
    durationDays?: number;
    extendExisting?: boolean;
    replaceExisting?: boolean;
  } | null;
  coupon?: Record<string, any> | null;
  metadata?: Record<string, any> | null;
}
