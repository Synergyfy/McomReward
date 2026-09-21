import { Injectable, CanActivate, ExecutionContext } from "@nestjs/common";
import { Reflector, ModuleRef } from "@nestjs/core";
import { Role } from "../role.enum";
import { ROLES_KEY } from "../decorators/roles.decorator";
import { IS_PUBLIC_KEY } from "../decorators/public.decorator";
import {
  SKIP_MEMBERSHIP_CHECK_KEY,
  SKIP_SUBSCRIPTION_CHECK_KEY,
} from "../decorators/skip-membership-check.decorator";
import { PlanSubscriptionService } from "../../resources/plans/services/plan-subscription.service";

@Injectable()
export class RolesGuard implements CanActivate {
  private subscriptionService?: PlanSubscriptionService;

  constructor(
    private readonly reflector: Reflector,
    private readonly moduleRef: ModuleRef,
  ) {}

  private getSubscriptionService(): PlanSubscriptionService {
    if (!this.subscriptionService) {
      this.subscriptionService = this.moduleRef.get(PlanSubscriptionService, {
        strict: false,
      });
    }
    return this.subscriptionService;
  }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (isPublic) {
      return true;
    }

    const requiredRoles = this.reflector.getAllAndOverride<Role[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (!requiredRoles) {
      return true;
    }
    const { user } = context.switchToHttp().getRequest();
    if (!user) {
      return false;
    }

    const userRole = (user.role || "").toString().trim().toUpperCase();
    const isRoleAllowed = requiredRoles.some((reqRole) => {
      const reqUpper = reqRole.toUpperCase();
      if (reqUpper === userRole) return true;
      if (reqUpper === "BUSINESS" && (userRole === "BUSINESS" || userRole === "OWNER")) return true;
      if (
        reqUpper === "PARTICIPANT" &&
        (userRole === "PARTICIPANT" || userRole === "CUSTOMER" || userRole === "USER")
      )
        return true;
      return false;
    });

    if (!isRoleAllowed) {
      return false;
    }

    const skipSubscriptionCheck = this.reflector.getAllAndOverride<boolean>(
      SKIP_MEMBERSHIP_CHECK_KEY,
      [context.getHandler(), context.getClass()],
    );

    // Live, cached subscription check — no hardcoding, TTL from Config via PlanSubscriptionService
    // hasActiveSubscription in JWT is stale after purchase; use DB-backed cache instead.
    const isBusiness = userRole === "BUSINESS" || userRole === "OWNER";
    const requiresBusiness = requiredRoles.some((r) => r.toUpperCase() === "BUSINESS");

    if (
      isBusiness &&
      requiresBusiness &&
      !skipSubscriptionCheck
    ) {
      // Super business bypass (from JWT, config-driven role)
      if (user.isSuperBusiness) {
        return true;
      }
      const hasActive =
        await this.getSubscriptionService().hasActiveSubscription(user.id);
      if (!hasActive) {
        return false;
      }
    }

    return true;
  }
}
