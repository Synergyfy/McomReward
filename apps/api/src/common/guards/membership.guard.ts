import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
} from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import { PlanSubscriptionService } from "../../resources/plans/services/plan-subscription.service";
import { SKIP_MEMBERSHIP_CHECK_KEY } from "../decorators/skip-membership-check.decorator";
import { Role } from "../role.enum";

@Injectable()
export class MembershipGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    private readonly planSubscriptionService: PlanSubscriptionService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const skipCheck = this.reflector.getAllAndOverride<boolean>(
      SKIP_MEMBERSHIP_CHECK_KEY,
      [context.getHandler(), context.getClass()],
    );

    if (skipCheck) {
      return true;
    }

    const request = context.switchToHttp().getRequest();
    const user = request.user;

    if (!user || user.role !== Role.Business) {
      return true; // Only restrict businesses
    }

    const subscription = await this.planSubscriptionService.findOneByBusinessId(
      user.id,
    );

    if (!subscription) {
      return true;
    }

    if (
      subscription.is_trial &&
      subscription.expires_at &&
      new Date(subscription.expires_at) < new Date()
    ) {
      throw new ForbiddenException(
        "Trial expired. Please subscribe to continue.",
      );
    }

    return true;
  }
}
