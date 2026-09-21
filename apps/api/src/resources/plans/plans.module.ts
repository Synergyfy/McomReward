import { Module, forwardRef } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { ConfigModule } from "@nestjs/config";
import { Plan } from "./entities/plan.entity";
import { PlanTierLevel } from "./entities/plan-tier-level.entity";
import { PlanVariant } from "./entities/plan-variant.entity";
import { PlanPrice } from "./entities/plan-price.entity";
import { PlanSubscription } from "./entities/plan-subscription.entity";
import { PlanPayment } from "./entities/plan-payment.entity";
import { Business } from "../business/entities/business.entity";
import { PlansService } from "./plans.service";
import { PlansController } from "./plans.controller";
import { PlanExpiryService } from "./services/plan-expiry.service";
import { PlanSubscriptionService } from "./services/plan-subscription.service";
import { SsoModule } from "../sso/sso.module";

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Plan,
      PlanTierLevel,
      PlanVariant,
      PlanPrice,
      PlanSubscription,
      PlanPayment,
      Business,
    ]),
    ConfigModule,
    forwardRef(() => SsoModule),
  ],
  controllers: [PlansController],
  providers: [PlansService, PlanExpiryService, PlanSubscriptionService],
  exports: [PlansService, PlanExpiryService, PlanSubscriptionService],
})
export class PlansModule {}
