import { Injectable, Logger } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { InjectRepository } from "@nestjs/typeorm";
import { ILike, Repository } from "typeorm";
import { Business } from "../business/entities/business.entity";
import { AccessPassPlan } from "../access-passes/entities/access-pass-plan.entity";
import { PlanVariant } from "../plans/entities/plan-variant.entity";
import { PlanSubscriptionService } from "../plans/services/plan-subscription.service";
import { formatPlanDisplayName } from "../plans/utils/plan-display.util";
import { EntitlementSyncService } from "../sso/entitlement-sync.service";
import { McomCentralService } from "../sso/mcom-central.service";
import { PlatformEntitlement } from "../sso/interfaces/entitlement.interface";
import { ProcessedWebhookEvent } from "./entities/processed-webhook-event.entity";

export interface MembershipUpdatedData {
  eventId?: string;
  occurredAt?: string;
  userId?: string;
  businessId?: string;
  membership?: {
    planId?: string;
    planName?: string;
    tier?: string;
    level?: string;
    status?: string;
    billingCycle?: string;
    amount?: number;
    currency?: string;
    startsAt?: string | null;
    expiresAt?: string | null;
  };
  package?: {
    platform?: string;
    packageName?: string;
    externalPlanId?: string;
    status?: string;
    limits?: Record<string, any>;
    features?: string[];
    expiresAt?: string | null;
  };
}

/**
 * Applies Central's `membership.updated` event to the local catalogue.
 *
 * Central is the source of truth for whether the business has paid, so the
 * event is treated as an instruction:
 *  - `active` → provision the bundled plan/access pass until the membership
 *    expiry.
 *  - `expired` / `cancelled` / `inactive` → revoke only the access Central
 *    provisioned (locally purchased plans/passes are left untouched).
 *
 * Delivery is at-least-once, so event ids are recorded before returning.
 */
@Injectable()
export class MembershipSyncService {
  private readonly logger = new Logger(MembershipSyncService.name);

  constructor(
    @InjectRepository(Business)
    private readonly businessRepository: Repository<Business>,
    @InjectRepository(AccessPassPlan)
    private readonly accessPassPlanRepository: Repository<AccessPassPlan>,
    @InjectRepository(ProcessedWebhookEvent)
    private readonly processedEventRepository: Repository<ProcessedWebhookEvent>,
    private readonly planSubscriptionService: PlanSubscriptionService,
    private readonly entitlementSyncService: EntitlementSyncService,
    private readonly mcomCentralService: McomCentralService,
    private readonly configService: ConfigService,
  ) {}

  async handleMembershipUpdated(
    data: MembershipUpdatedData,
  ): Promise<{ processed: boolean; duplicate: boolean; reason?: string }> {
    const eventId = data?.eventId?.trim();
    if (
      eventId &&
      (await this.processedEventRepository.findOne({ where: { eventId } }))
    ) {
      this.logger.log(`Skipping duplicate membership.updated event ${eventId}`);
      return { processed: false, duplicate: true };
    }

    const status = this.normalizeStatus(
      data?.membership?.status || data?.package?.status,
    );
    const business = await this.findBusiness(data, status);
    if (!business) {
      this.logger.warn(
        `membership.updated: no local business for userId=${data?.userId ?? "none"} businessId=${data?.businessId ?? "none"}; ` +
          "access will be reconciled from Central on next SSO login",
      );
      await this.recordEvent(eventId, data);
      return {
        processed: false,
        duplicate: false,
        reason: "BUSINESS_NOT_FOUND",
      };
    }

    if (!status) {
      this.logger.warn(
        `membership.updated for business ${business.id} has no membership status; ignoring`,
      );
      return {
        processed: false,
        duplicate: false,
        reason: "MISSING_STATUS",
      };
    }

    const isActive = status === "active";
    const expiresAt = this.resolveExpiry(data);

    if (isActive && expiresAt && new Date(expiresAt).getTime() <= Date.now()) {
      this.logger.log(
        `membership.updated for business ${business.id} arrived with an elapsed expiry; revoking`,
      );
      await this.applyRevocation(business, "expired", data);
      await this.recordEvent(eventId, data);
      return { processed: true, duplicate: false, reason: "EXPIRED" };
    }

    if (!isActive) {
      await this.applyRevocation(business, status, data);
      await this.recordEvent(eventId, data);
      return { processed: true, duplicate: false };
    }

    const granted = await this.applyActiveMembership(business, data, expiresAt);

    await this.recordEvent(eventId, data);

    return {
      processed: granted,
      duplicate: false,
      ...(granted ? {} : { reason: "PLAN_NOT_MATCHED" }),
    };
  }

  /**
   * `externalPlanId` is the identifier this app published to Central when the
   * membership was bundled. It can be a plan variant id, a plan family id or
   * slug, or a plan name. Access-pass bundles use the access-pass catalogue.
   */
  private async applyActiveMembership(
    business: Business,
    data: MembershipUpdatedData,
    expiresAt: string | null,
  ): Promise<boolean> {
    const externalPlanId = data?.package?.externalPlanId?.trim();
    const packageName =
      data?.package?.packageName?.trim() || data?.membership?.planName?.trim();

    const variant =
      await this.planSubscriptionService.resolveEntitlementVariant(
        externalPlanId,
        packageName,
      );
    if (variant) {
      const entitlement = this.buildPlanEntitlement(
        business,
        data,
        variant,
        expiresAt,
      );
      await this.entitlementSyncService.apply(business.id, entitlement);
      await this.updateBusinessMembership(business, data, entitlement);
      this.logger.log(
        `Activated membership plan "${variant.plan?.name}" (${variant.tierLevel?.name}) for business ${business.id} until ${expiresAt}`,
      );
      return true;
    }

    const accessPassPlan = await this.resolveAccessPassPlan(
      externalPlanId,
      packageName,
    );
    if (accessPassPlan) {
      const entitlement = this.buildAccessPassEntitlement(
        business,
        data,
        accessPassPlan,
        expiresAt,
      );
      await this.entitlementSyncService.apply(business.id, entitlement);
      await this.updateBusinessMembership(business, data, entitlement);
      this.logger.log(
        `Activated membership access pass "${accessPassPlan.name}" for business ${business.id} until ${expiresAt}`,
      );
      return true;
    }

    // The event only names the Central plan, and our catalogue could not match
    // it. Re-introspect Central, which resolves the app-scoped entitlement for
    // us, instead of granting an arbitrary local plan.
    const introspected =
      await this.mcomCentralService.getIntrospectionEntitlementByUserId(
        data.userId || business.mcomUserId,
      );
    if (introspected) {
      await this.entitlementSyncService.apply(business.id, introspected);
      await this.updateBusinessMembership(business, data, introspected);
      this.logger.log(
        `Applied membership for business ${business.id} via Central entitlement introspection`,
      );
      return true;
    }

    this.logger.error(
      `membership.updated cannot be matched to a local plan: externalPlanId="${externalPlanId ?? ""}", packageName="${packageName ?? ""}", business=${business.id}. ` +
        "Check the plan id published to Central in MCOM Console → Configuration.",
    );
    return false;
  }

  private async applyRevocation(
    business: Business,
    status: string,
    data: MembershipUpdatedData,
  ): Promise<void> {
    // Reuse the normal entitlement pipeline so only CENTRAL-owned plan
    // subscriptions/passes are expired. Locally purchased access survives.
    const entitlement = this.buildNoAccessEntitlement(business, data, status);
    await this.entitlementSyncService.apply(business.id, entitlement);
    await this.updateBusinessMembership(business, data, entitlement);
    this.logger.log(
      `Revoked membership access for business ${business.id} (status: ${status})`,
    );
  }

  private buildPlanEntitlement(
    business: Business,
    data: MembershipUpdatedData,
    variant: PlanVariant,
    expiresAt: string | null,
  ): PlatformEntitlement {
    const limits = this.numericLimits(data?.package?.limits);
    const features = data?.package?.features?.length
      ? data.package.features
      : variant.features || [];

    return {
      version: "2026-10-01",
      targetPlatform: this.targetPlatform(),
      access: {
        hasAccess: true,
        accessType: "PAID_MEMBERSHIP",
        upgradeUrl: this.upgradeUrl(),
      },
      plan: {
        planId: variant.id,
        planName:
          formatPlanDisplayName(variant.plan?.name, variant.tierLevel?.name) ||
          data?.membership?.planName ||
          data?.package?.packageName ||
          "Membership",
        source: "membership",
        status: "active",
        billingCycle: data?.membership?.billingCycle ?? null,
        expiresAt,
        quotas: limits,
        limits,
        features,
      },
      membershipContext: this.membershipContext(data, "active"),
      trialContext: this.trialContext(business),
    };
  }

  private buildAccessPassEntitlement(
    business: Business,
    data: MembershipUpdatedData,
    accessPassPlan: AccessPassPlan,
    expiresAt: string | null,
  ): PlatformEntitlement {
    const limits = this.numericLimits(data?.package?.limits);

    return {
      version: "2026-10-01",
      targetPlatform: this.targetPlatform(),
      access: {
        hasAccess: true,
        accessType: "DIRECT_PACKAGE",
        upgradeUrl: this.upgradeUrl(),
      },
      plan: {
        planId: accessPassPlan.slug || accessPassPlan.id,
        planName: accessPassPlan.name,
        source: "direct",
        status: "active",
        billingCycle: data?.membership?.billingCycle ?? null,
        expiresAt,
        quotas: limits,
        limits,
        features: data?.package?.features?.length
          ? data.package.features
          : accessPassPlan.features || [],
      },
      membershipContext: this.membershipContext(data, "active"),
      trialContext: this.trialContext(business),
    };
  }

  private buildNoAccessEntitlement(
    business: Business,
    data: MembershipUpdatedData,
    status: string,
  ): PlatformEntitlement {
    return {
      version: "2026-10-01",
      targetPlatform: this.targetPlatform(),
      access: {
        hasAccess: false,
        accessType: "NONE",
        reason:
          status === "expired" ? "MEMBERSHIP_EXPIRED" : "NO_ACTIVE_ENTITLEMENT",
        upgradeUrl: this.upgradeUrl(),
      },
      plan: null,
      membershipContext: this.membershipContext(data, status),
      trialContext: this.trialContext(business),
    };
  }

  private membershipContext(
    data: MembershipUpdatedData,
    status: string,
  ): PlatformEntitlement["membershipContext"] {
    return {
      membershipPlanName:
        data?.membership?.planName || data?.package?.packageName || null,
      membershipLevel:
        data?.membership?.level || data?.membership?.tier || "STANDARD",
      membershipStatus: status,
      isIncludedInMembership: status === "active",
    };
  }

  private trialContext(
    business: Business,
  ): PlatformEntitlement["trialContext"] {
    return {
      isInTrial: false,
      hasPaidVerificationFee: business.hasPaidVerificationFee === true,
      trialExpiresAt: null,
      daysRemaining: 0,
      programmeTasks: business.trialTasks || [],
    };
  }

  private targetPlatform(): PlatformEntitlement["targetPlatform"] {
    const clientId =
      this.configService.get<string>("MCOM_CLIENT_ID") || "mcom-rewards";
    const platformSlug =
      this.configService.get<string>("MCOM_PLATFORM_SLUG") || "mcom-rewards";
    return {
      clientId,
      platformSlug,
      name: "MCOM Rewards",
    };
  }

  private upgradeUrl(): string {
    const centralWeb =
      this.configService.get<string>("MCOM_CENTRAL_WEB_URL") ||
      this.configService.get<string>("MCOM_SOLUTIONS_URL") ||
      "http://localhost:3010";
    return `${centralWeb.replace(/\/+$/, "")}/dashboard/memberships`;
  }

  private numericLimits(limits?: Record<string, any>): Record<string, unknown> {
    if (!limits || typeof limits !== "object") return {};
    return Object.fromEntries(
      Object.entries(limits).filter(([, value]) => value !== undefined),
    );
  }

  private resolveExpiry(data: MembershipUpdatedData): string | null {
    const raw = data?.membership?.expiresAt || data?.package?.expiresAt || null;
    if (raw) {
      const parsed = new Date(raw);
      if (!Number.isNaN(parsed.getTime())) return parsed.toISOString();
    }

    // A membership without a per-plan expiry still needs a local horizon.
    // Central re-sends `membership.updated` on renewal/expiry, so one year is
    // the safe rolling window used for bundled plans elsewhere in this app.
    return new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString();
  }

  private normalizeStatus(raw?: string): string | null {
    const status = (raw || "").trim().toLowerCase();
    if (!status) return null;
    if (status === "active" || status === "trial") return "active";
    if (status === "expired") return "expired";
    if (status === "cancelled" || status === "canceled") return "cancelled";
    if (status === "inactive") return "inactive";
    return status;
  }

  private async resolveAccessPassPlan(
    externalPlanId?: string,
    packageName?: string,
  ): Promise<AccessPassPlan | null> {
    if (externalPlanId) {
      const isUuid =
        /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(
          externalPlanId,
        );
      const byIdentifier = await this.accessPassPlanRepository.findOne({
        where: isUuid
          ? [{ id: externalPlanId }, { slug: externalPlanId }]
          : { slug: externalPlanId },
      });
      if (byIdentifier) return byIdentifier;
    }

    if (packageName) {
      const byName = await this.accessPassPlanRepository.findOne({
        where: { name: ILike(packageName) },
      });
      if (byName) return byName;
    }

    return null;
  }

  private async findBusiness(
    data: MembershipUpdatedData,
    status: string | null,
  ): Promise<Business | null> {
    const userId = data?.userId?.trim();
    const centralBusinessId = data?.businessId?.trim();
    const isUuid = (value: string) =>
      /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(
        value,
      );

    const where: Array<Record<string, any>> = [];
    if (userId) where.push({ mcomUserId: userId });
    if (centralBusinessId) {
      where.push({ mcomUserId: centralBusinessId });
      if (isUuid(centralBusinessId)) where.push({ id: centralBusinessId });
    }

    if (where.length === 0) return null;

    const business = await this.businessRepository.findOne({ where });
    if (business) return business;

    // A future-dated cancellation can arrive before the business has finished
    // local signup. That is not an error: the next SSO login reconciles it.
    if (status && status !== "active") {
      this.logger.log(
        `membership.updated revocation received for unknown business ${userId || centralBusinessId}`,
      );
    }

    return null;
  }

  private async updateBusinessMembership(
    business: Business,
    data: MembershipUpdatedData,
    entitlement: PlatformEntitlement,
  ): Promise<void> {
    const membership = data?.membership || {};

    if (membership.level) business.membershipLevel = membership.level;
    else if (membership.tier) business.membershipLevel = membership.tier;

    if (membership.planName) business.membershipTier = membership.planName;
    else if (membership.tier) business.membershipTier = membership.tier;

    business.membershipStatus =
      membership.status?.toLowerCase() ||
      (entitlement.access.hasAccess ? "active" : "inactive");
    business.entitlementSource = "membership";
    business.entitlementData = entitlement as unknown as Record<string, any>;

    await this.businessRepository.save(business);
  }

  private async recordEvent(
    eventId: string | undefined,
    data: MembershipUpdatedData,
  ): Promise<void> {
    if (!eventId) {
      this.logger.warn(
        "membership.updated has no data.eventId; skipping idempotency record",
      );
      return;
    }

    try {
      await this.processedEventRepository.insert({
        eventId,
        eventType: "membership.updated",
        payload: data as Record<string, any>,
        processedAt: new Date(),
      });
    } catch (error: any) {
      // A concurrent delivery won the race; the unique index is the guard.
      if (error?.code === "23505") {
        this.logger.log(
          `membership.updated event ${eventId} was recorded concurrently`,
        );
        return;
      }
      throw error;
    }
  }
}
