import { Module } from "@nestjs/common";
import { TierService } from "./tier.service";
import { TierController } from "./tier.controller";
import { TypeOrmModule } from "@nestjs/typeorm";
import { Tier } from "./entities/tier.entity";
import { TierHistory } from "./entities/tier-history.entity";
import { Season } from "../season/entities/season.entity";
import { PlanSubscription } from "../plans/entities/plan-subscription.entity";

@Module({
  imports: [
    TypeOrmModule.forFeature([Tier, TierHistory, PlanSubscription, Season]),
  ],
  controllers: [TierController],
  providers: [TierService],
})
export class TierModule {}
