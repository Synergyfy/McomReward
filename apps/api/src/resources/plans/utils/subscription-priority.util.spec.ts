import {
  PlanSubscriptionSource,
  SubscriptionStatus,
} from "../entities/plan-subscription.entity";
import {
  getSubscriptionSource,
  isCentralSubscription,
  resolveEffectiveSubscription,
  resolveEffectiveSubscriptions,
} from "./subscription-priority.util";

function subscription(
  values: Partial<{
    id: string;
    source: PlanSubscriptionSource;
    status: SubscriptionStatus;
    expires_at: Date | null;
    is_trial: boolean;
    transaction_id: string;
  }> = {},
): any {
  return {
    id: values.id ?? "sub-1",
    source: values.source,
    status: values.status ?? SubscriptionStatus.ACTIVE,
    expires_at:
      values.expires_at === undefined
        ? new Date(Date.now() + 86400000)
        : values.expires_at,
    is_trial: values.is_trial ?? false,
    transaction_id: values.transaction_id ?? null,
  };
}

describe("subscription priority", () => {
  it("prefers a locally purchased plan over a Central membership", () => {
    const local = subscription({
      id: "local",
      source: PlanSubscriptionSource.LOCAL,
    });
    const membership = subscription({
      id: "membership",
      source: PlanSubscriptionSource.MEMBERSHIP,
    });

    const effective = resolveEffectiveSubscriptions([membership, local]);

    expect(effective.map((s) => s.id)).toEqual(["local"]);
  });

  it("falls back to the membership plan when the local plan expires", () => {
    const local = subscription({
      id: "local",
      source: PlanSubscriptionSource.LOCAL,
      expires_at: new Date(Date.now() - 1000),
    });
    const membership = subscription({
      id: "membership",
      source: PlanSubscriptionSource.MEMBERSHIP,
    });

    const effective = resolveEffectiveSubscriptions([local, membership]);

    expect(effective.map((s) => s.id)).toEqual(["membership"]);
  });

  it("falls back to an active trial when there is no plan", () => {
    const trial = subscription({
      id: "trial",
      source: PlanSubscriptionSource.TRIAL,
      is_trial: true,
    });

    expect(resolveEffectiveSubscription([trial])?.id).toBe("trial");
  });

  it("returns the newest record when nothing is active", () => {
    const older = subscription({
      id: "older",
      source: PlanSubscriptionSource.LOCAL,
      status: SubscriptionStatus.EXPIRED,
      expires_at: new Date(Date.now() - 86400000),
    });
    const newer = subscription({
      id: "newer",
      source: PlanSubscriptionSource.MEMBERSHIP,
      status: SubscriptionStatus.EXPIRED,
      expires_at: new Date(Date.now() - 1000),
    });
    older.created_at = new Date("2026-01-01");
    newer.created_at = new Date("2026-02-01");

    expect(resolveEffectiveSubscription([older, newer])?.id).toBe("newer");
  });

  it("infers the source from legacy transaction ids", () => {
    expect(
      getSubscriptionSource({
        is_trial: true,
        transaction_id: null,
      } as any),
    ).toBe(PlanSubscriptionSource.TRIAL);
    expect(
      getSubscriptionSource({
        is_trial: false,
        transaction_id: "CENTRAL-ENTITLEMENT-PAID_MEMBERSHIP-gold",
      } as any),
    ).toBe(PlanSubscriptionSource.MEMBERSHIP);
    expect(
      getSubscriptionSource({
        is_trial: false,
        transaction_id: "ch_123",
      } as any),
    ).toBe(PlanSubscriptionSource.LOCAL);
  });

  it("recognises Central-owned rows", () => {
    expect(
      isCentralSubscription({
        source: PlanSubscriptionSource.MEMBERSHIP,
        is_trial: false,
        transaction_id: null,
      } as any),
    ).toBe(true);
    expect(
      isCentralSubscription({
        source: PlanSubscriptionSource.LOCAL,
        is_trial: false,
        transaction_id: "ch_123",
      } as any),
    ).toBe(false);
  });
});
