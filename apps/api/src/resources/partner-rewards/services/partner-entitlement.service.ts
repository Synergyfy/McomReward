import { ForbiddenException, Injectable, Logger } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { Business } from "../../business/entities/business.entity";
import { PlanSubscriptionService } from "../../plans/services/plan-subscription.service";
import { McomCentralService } from "../../sso/mcom-central.service";

export interface BusinessIdentity {
  mcomUserId?: string;
  email?: string;
}

export type EntitlementSource =
  | "local_subscription"
  | "central_entitlement"
  | "central_trial"
  | "central_trial_profile";

export interface BusinessEntitlementSnapshot {
  source: EntitlementSource;
  accessType: string;
  isTrial: boolean;
  planName: string | null;
  /** True when MCOM Rewards is included in the business's MCOM membership package. */
  membershipIncluded: boolean;
  expiresAt: string | null;
}

interface CacheEntry {
  snapshot: BusinessEntitlementSnapshot | null;
  reason: string;
  expiresAt: number;
}

const ALLOW_TTL_MS = 60_000;
const DENY_TTL_MS = 15_000;

/**
 * Verifies that the business sponsoring a reward is entitled to issue it:
 *  - an active local subscription (paid plan OR valid trial), or
 *  - a live MCOM Central entitlement — including the case where the MCOM
 *    Rewards plan is bundled inside the business's MCOM membership package,
 *    a direct package, or an active trial.
 *
 * Fail-closed: if nothing can be confirmed and Central is unreachable, the
 * request is rejected.
 */
@Injectable()
export class PartnerEntitlementService {
  private readonly logger = new Logger(PartnerEntitlementService.name);
  private readonly cache = new Map<string, CacheEntry>();

  constructor(
    @InjectRepository(Business)
    private readonly businessRepository: Repository<Business>,
    private readonly planSubscriptionService: PlanSubscriptionService,
    private readonly mcomCentralService: McomCentralService,
  ) {}

  async assertBusinessEntitled(
    identity: BusinessIdentity,
  ): Promise<BusinessEntitlementSnapshot> {
    const key = this.cacheKey(identity);
    const cached = this.cache.get(key);
    if (cached && cached.expiresAt > Date.now()) {
      if (cached.snapshot) return cached.snapshot;
      throw this.denied(identity, cached.reason);
    }

    const { snapshot, reason } = await this.evaluate(identity);
    this.cache.set(key, {
      snapshot,
      reason,
      expiresAt: Date.now() + (snapshot ? ALLOW_TTL_MS : DENY_TTL_MS),
    });

    if (snapshot) return snapshot;
    throw this.denied(identity, reason);
  }

  private async evaluate(
    identity: BusinessIdentity,
  ): Promise<{ snapshot: BusinessEntitlementSnapshot | null; reason: string }> {
    const business = await this.resolveBusiness(identity);

    // 1. Local active subscription (paid or trial).
    if (business) {
      const subscription =
        await this.planSubscriptionService.findActiveSubscription(business.id);
      if (subscription) {
        return {
          snapshot: {
            source: "local_subscription",
            accessType: subscription.is_trial
              ? "TRIAL_PROGRAMME"
              : "PAID_MEMBERSHIP",
            isTrial: Boolean(subscription.is_trial),
            planName: subscription.planVariant?.plan?.name ?? null,
            membershipIncluded: false,
            expiresAt: subscription.expires_at
              ? new Date(subscription.expires_at).toISOString()
              : null,
          },
          reason: "",
        };
      }
    }

    // 2. Central entitlement (membership-bundled / direct / trial).
    const lookupId =
      identity.mcomUserId ||
      business?.mcomUserId ||
      identity.email ||
      business?.email;

    if (!lookupId) {
      return { snapshot: null, reason: "NOT_ENTITLED" };
    }

    try {
      const { found, data } =
        await this.mcomCentralService.introspectEntitlementByUserIdStrict(
          lookupId,
        );
      const entitlement = found ? ((data as any)?.entitlement ?? data) : null;
      const profile = (data as any)?.user?.businessProfile;

      if (entitlement) {
        const access = entitlement.access;
        const trial = entitlement.trialContext;
        const now = new Date();

        if (access?.hasAccess === true) {
          return {
            snapshot: {
              source: "central_entitlement",
              accessType: access.accessType ?? "PAID_MEMBERSHIP",
              isTrial: access.accessType === "TRIAL_PROGRAMME",
              planName: entitlement.plan?.planName ?? null,
              membershipIncluded: Boolean(
                entitlement.membershipContext?.isIncludedInMembership,
              ),
              expiresAt:
                entitlement.plan?.expiresAt ?? trial?.trialExpiresAt ?? null,
            },
            reason: "",
          };
        }

        // Active trial even when Central withheld access (e.g. no programme tasks).
        const trialExpiresAt = trial?.trialExpiresAt
          ? new Date(trial.trialExpiresAt)
          : null;
        if (trial?.isInTrial && trialExpiresAt && trialExpiresAt > now) {
          return {
            snapshot: {
              source: "central_trial",
              accessType: "TRIAL_PROGRAMME",
              isTrial: true,
              planName: "Programme Trial Access",
              membershipIncluded: false,
              expiresAt: trial.trialExpiresAt,
            },
            reason: "",
          };
        }

        const profileTrial = profile?.trialAccessExpiresAt
          ? new Date(profile.trialAccessExpiresAt)
          : null;
        if (profileTrial && profileTrial > now) {
          return {
            snapshot: {
              source: "central_trial_profile",
              accessType: "TRIAL_PROGRAMME",
              isTrial: true,
              planName: "Trial",
              membershipIncluded: false,
              expiresAt: profile.trialAccessExpiresAt,
            },
            reason: "",
          };
        }
      }

      return { snapshot: null, reason: "NOT_ENTITLED" };
    } catch (err) {
      this.logger.warn(
        `Central entitlement lookup failed for "${lookupId}": ${(err as Error).message}`,
      );
      return { snapshot: null, reason: "ENTITLEMENT_UNAVAILABLE" };
    }
  }

  private async resolveBusiness(
    identity: BusinessIdentity,
  ): Promise<Business | null> {
    if (identity.mcomUserId) {
      const byMcom = await this.businessRepository.findOne({
        where: { mcomUserId: identity.mcomUserId },
      });
      if (byMcom) return byMcom;
    }
    if (identity.email) {
      const byEmail = await this.businessRepository.findOne({
        where: { email: identity.email.toLowerCase().trim() },
      });
      if (byEmail) return byEmail;
    }
    return null;
  }

  private cacheKey(identity: BusinessIdentity): string {
    return identity.mcomUserId
      ? `mcom:${identity.mcomUserId}`
      : `email:${(identity.email || "").toLowerCase()}`;
  }

  private denied(
    identity: BusinessIdentity,
    reason: string,
  ): ForbiddenException {
    const who = identity.mcomUserId || identity.email || "unknown";
    const unavailable = reason === "ENTITLEMENT_UNAVAILABLE";
    return new ForbiddenException({
      // Distinct, stable codes so callers can branch without parsing messages.
      code: unavailable ? "ENTITLEMENT_UNAVAILABLE" : "BUSINESS_NOT_ENTITLED",
      reason,
      message: unavailable
        ? `Forbidden: unable to verify entitlement for business "${who}" (MCOM Central unavailable)`
        : `Forbidden: business "${who}" has no active subscription, trial, or MCOM Rewards entitlement`,
    });
  }
}
