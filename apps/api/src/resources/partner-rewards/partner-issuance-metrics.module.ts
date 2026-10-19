import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { RewardIssuance } from "./entities/reward-issuance.entity";
import { BusinessReward } from "../rewards/entities/business-reward.entity";
import { PartnerIssuanceMetricsService } from "./services/partner-issuance-metrics.service";

/**
 * Standalone module for {@link PartnerIssuanceMetricsService} so any resource
 * (analytics, rewards, campaigns, admin) can count partner-issued rewards
 * without importing the whole partner-rewards module (and its cron).
 */
@Module({
  imports: [TypeOrmModule.forFeature([RewardIssuance, BusinessReward])],
  providers: [PartnerIssuanceMetricsService],
  exports: [PartnerIssuanceMetricsService],
})
export class PartnerIssuanceMetricsModule {}
