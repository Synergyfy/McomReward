import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { Plan } from "./entities/plan.entity";
import { PlanTierLevel } from "./entities/plan-tier-level.entity";
import { PlanVariant } from "./entities/plan-variant.entity";
import { PlanPrice } from "./entities/plan-price.entity";
import { PlansService } from "./plans.service";
import { PlansController } from "./plans.controller";
import { PlanExpiryService } from "./services/plan-expiry.service";

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Plan,
      PlanTierLevel,
      PlanVariant,
      PlanPrice,
    ]),
  ],
  controllers: [PlansController],
  providers: [PlansService, PlanExpiryService],
  exports: [PlansService, PlanExpiryService],
})
export class PlansModule {}
