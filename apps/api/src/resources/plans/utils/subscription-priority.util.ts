import {
  PlanSubscription,
  PlanSubscriptionSource,
  SubscriptionStatus,
} from "../entities/plan-subscription.entity";

/**
 * Access priority for plan subscriptions. A business may hold a locally
 * purchased plan and a Central membership plan at the same time; the highest
 * priority source is the one that grants access.
 */
export const PLAN_SUBSCRIPTION_SOURCE_PRIORITY: Record<
  PlanSubscriptionSource,
  number
> = {
  [PlanSubscriptionSource.LOCAL]: 0,
  [PlanSubscriptionSource.CENTRAL]: 1,
  [PlanSubscriptionSource.MEMBERSHIP]: 2,
  [PlanSubscriptionSource.TRIAL]: 3,
};

/**
 * Older rows (and hand-written fixtures) may not have `source`. Infer it from
 * the transaction id / trial flag so precedence still works before a backfill
 * has run.
 */
export function getSubscriptionSource(
  subscription: Pick<
    PlanSubscription,
    "source" | "transaction_id" | "is_trial"
  >,
): PlanSubscriptionSource {
  if (subscription.source) return subscription.source;

  const transactionId = subscription.transaction_id || "";
  if (
    subscription.is_trial ||
    transactionId.startsWith("CENTRAL-ENTITLEMENT-TRIAL_PROGRAMME")
  ) {
    return PlanSubscriptionSource.TRIAL;
  }
  if (transactionId.startsWith("CENTRAL-APPPLAN-")) {
    return PlanSubscriptionSource.CENTRAL;
  }
  if (transactionId.startsWith("CENTRAL-")) {
    return PlanSubscriptionSource.MEMBERSHIP;
  }
  return PlanSubscriptionSource.LOCAL;
}

export function isCentralSubscription(
  subscription: Pick<
    PlanSubscription,
    "source" | "transaction_id" | "is_trial"
  >,
): boolean {
  if (subscription.source) {
    return subscription.source !== PlanSubscriptionSource.LOCAL;
  }
  if (subscription.transaction_id?.startsWith("CENTRAL-")) return true;
  return getSubscriptionSource(subscription) !== PlanSubscriptionSource.LOCAL;
}

export function isSubscriptionActive(
  subscription: Pick<PlanSubscription, "status" | "expires_at">,
  now: Date = new Date(),
): boolean {
  if (subscription.status !== SubscriptionStatus.ACTIVE) return false;
  if (!subscription.expires_at) return true;
  return new Date(subscription.expires_at).getTime() > now.getTime();
}

function compareWithinSource(a: PlanSubscription, b: PlanSubscription): number {
  const aExpiry = a.expires_at ? new Date(a.expires_at).getTime() : Infinity;
  const bExpiry = b.expires_at ? new Date(b.expires_at).getTime() : Infinity;
  if (aExpiry !== bExpiry) return bExpiry - aExpiry;

  const aCreated = a.created_at ? new Date(a.created_at).getTime() : 0;
  const bCreated = b.created_at ? new Date(b.created_at).getTime() : 0;
  return bCreated - aCreated;
}

/**
 * Return only the active subscriptions belonging to the highest-priority
 * source that currently has access. Local plans therefore shadow a Central
 * membership plan until they expire, at which point the membership plan is
 * returned instead.
 *
 * Multiple rows of the same source are kept (for example seasonal plans) and
 * sorted so the longest-running/highest-priority row is first.
 */
export function resolveEffectiveSubscriptions(
  subscriptions: PlanSubscription[],
  now: Date = new Date(),
): PlanSubscription[] {
  const active = subscriptions
    .filter((subscription) => isSubscriptionActive(subscription, now))
    .sort((a, b) => {
      const bySource =
        PLAN_SUBSCRIPTION_SOURCE_PRIORITY[getSubscriptionSource(a)] -
        PLAN_SUBSCRIPTION_SOURCE_PRIORITY[getSubscriptionSource(b)];
      if (bySource !== 0) return bySource;
      return compareWithinSource(a, b);
    });

  if (active.length === 0) return [];

  const bestPriority =
    PLAN_SUBSCRIPTION_SOURCE_PRIORITY[getSubscriptionSource(active[0])];
  return active.filter(
    (subscription) =>
      PLAN_SUBSCRIPTION_SOURCE_PRIORITY[getSubscriptionSource(subscription)] ===
      bestPriority,
  );
}

/**
 * Pick the effective subscription. Falls back to the newest record when
 * nothing is active so callers can still report an expired plan/trial.
 */
export function resolveEffectiveSubscription(
  subscriptions: PlanSubscription[],
  now: Date = new Date(),
): PlanSubscription | null {
  const effective = resolveEffectiveSubscriptions(subscriptions, now);
  if (effective.length > 0) return effective[0];

  return (
    [...subscriptions].sort((a, b) => {
      const aCreated = a.created_at ? new Date(a.created_at).getTime() : 0;
      const bCreated = b.created_at ? new Date(b.created_at).getTime() : 0;
      return bCreated - aCreated;
    })[0] ?? null
  );
}
