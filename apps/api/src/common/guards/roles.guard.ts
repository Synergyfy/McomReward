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
import { AccessPassService } from "../../resources/access-passes/access-pass.service";

@Injectable()
export class RolesGuard implements CanActivate {
  private subscriptionService?: PlanSubscriptionService;
  private accessPassService?: AccessPassService;

  constructor(
    private readonly reflector: Reflector,
    private readonly moduleRef: ModuleRef,
  ) { }

  private getSubscriptionService(): PlanSubscriptionService {
    if (!this.subscriptionService) {
      this.subscriptionService = this.moduleRef.get(PlanSubscriptionService, {
        strict: false,
      });
    }
    return this.subscriptionService;
  }

  private getAccessPassService(): AccessPassService {
    if (!this.accessPassService) {
      this.accessPassService = this.moduleRef.get(AccessPassService, {
        strict: false,
      });
    }
    return this.accessPassService;
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

    if (
      user.role === Role.Business &&
      !user.isEmailVerified &&
      requiredRoles.includes(Role.Business)
    ) {
      return false;
    }

    const skipSubscriptionCheck = this.reflector.getAllAndOverride<boolean>(
      SKIP_MEMBERSHIP_CHECK_KEY,
      [context.getHandler(), context.getClass()],
    );

    // Live, cached subscription check — no hardcoding, TTL from Config via PlanSubscriptionService
    // hasActiveSubscription in JWT is stale after purchase; use DB-backed cache instead.
    if (
      user.role === Role.Business &&
      requiredRoles.includes(Role.Business) &&
      !skipSubscriptionCheck
    ) {
      // Super business bypass (from JWT, config-driven role)
      if (user.isSuperBusiness) {
        return requiredRoles.some((role) => user.role === role);
      }
      const hasActive =
        await this.getSubscriptionService().hasActiveSubscription(user.id);
      if (!hasActive) {
        const accessPass =
          await this.getAccessPassService().findActiveForBusiness(user.id);
        if (!accessPass) {
          return false;
        }
      }
    }

    return requiredRoles.some((role) => user.role === role);
  }
}
