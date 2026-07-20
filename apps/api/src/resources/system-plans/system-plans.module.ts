import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { SystemPlansService } from "./system-plans.service";
import { SystemPlansController } from "./system-plans.controller";
import { Tier } from "../tier/entities/tier.entity";
import { TierHistory } from "../tier/entities/tier-history.entity";
import { Season } from "../season/entities/season.entity";

@Module({
  imports: [TypeOrmModule.forFeature([Tier, TierHistory, Season])],
  controllers: [SystemPlansController],
  providers: [SystemPlansService],
})
export class SystemPlansModule {}
