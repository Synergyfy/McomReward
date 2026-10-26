import { Injectable, Logger } from "@nestjs/common";
import { AccessPassService } from "../access-passes/access-pass.service";
import { PlanSubscriptionService } from "../plans/services/plan-subscription.service";
import { PlatformEntitlement } from "./interfaces/entitlement.interface";

/**
 * Single entry point for applying a MCOM Central `PlatformEntitlement` to our
 * local records.
 *
 * Central resolves the access priority for us (membership > access pass >
 * trial), so all we have to do is provision the matching local entitlement and
 * revoke anything Central no longer grants. Each side is responsible for
 * cleaning up only records that Central itself created — locally purchased
 * plans and passes are never touched.
 */
@Injectable()
export class EntitlementSyncService {
  private readonly logger = new Logger(EntitlementSyncService.name);

  constructor(
    private readonly planSubscriptionService: PlanSubscriptionService,
    private readonly accessPassService: AccessPassService,
  ) {}

  async apply(
    businessId: string,
    entitlement: PlatformEntitlement,
  ): Promise<void> {
    if (!entitlement) return;

    const access = entitlement.access;
    this.logger.log(
      `Applying entitlement for business ${businessId}: ` +
        `access=${access?.hasAccess === true}, type=${access?.accessType ?? "NONE"}, ` +
        `plan="${entitlement.plan?.planId ?? "none"}" (${entitlement.plan?.source ?? "no source"})`,
    );

    // Membership / trial plans. Direct passes and no-access responses expire
    // any previously central-provisioned plan subscription.
    await this.planSubscriptionService.syncFromEntitlement(
      businessId,
      entitlement,
    );

    // Direct access passes. Membership / trial / no-access responses expire
    // any previously central-provisioned pass.
    await this.accessPassService.syncFromEntitlement(businessId, entitlement);
  }
}
