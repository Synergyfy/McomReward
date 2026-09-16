import { Injectable, CanActivate, ExecutionContext } from "@nestjs/common";
import { Reflector, ModuleRef } from "@nestjs/core";
import { Role } from "../role.enum";
import { ROLES_KEY } from "../decorators/roles.decorator";
import { IS_PUBLIC_KEY } from "../decorators/public.decorator";
import { SKIP_MEMBERSHIP_CHECK_KEY } from "../decorators/skip-membership-check.decorator";
import { MembershipService } from "../../resources/membership/membership.service";

@Injectable()
export class RolesGuard implements CanActivate {
  private membershipService?: MembershipService;

  constructor(
    private readonly reflector: Reflector,
    private readonly moduleRef: ModuleRef,
  ) {}

  private getMembershipService(): MembershipService {
    if (!this.membershipService) {
      this.membershipService = this.moduleRef.get(MembershipService, {
        strict: false,
      });
    }
    return this.membershipService;
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

    // Live, cached membership check — no hardcoding, TTL from Config via MembershipService
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
      const hasActive = await this.getMembershipService().hasActiveSubscription(user.id);
      if (!hasActive) {
        return false;
      }
    }

    return requiredRoles.some((role) => user.role === role);
  }
}
