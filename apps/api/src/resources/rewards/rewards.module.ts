import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { Reward } from "./entities/reward.entity";
import { RewardsController } from "./controllers/rewards.controller";
import { RewardsService } from "./services/rewards.service";
import { BusinessReward } from "./entities/business-reward.entity";
import { BusinessCampaign } from "../campaign/entities/business-campaign.entity";
import { PointHistory } from "../participant-campaign-balance/entities/point-history.entity";
import { Business } from "../business/entities/business.entity";
import { PlanSubscription } from "../plans/entities/plan-subscription.entity";
import { Sector } from "../sector/entities/sector.entity";
import { Tier } from "../tier/entities/tier.entity";
import { CapabilityModule } from "../capability/capability.module";
import { forwardRef } from "@nestjs/common";
import { TierProgressionModule } from "../tier-progression/tier-progression.module";
import { LibraryAsset } from "../library-assets/entities/library-asset.entity";
import { Category } from "../category/entities/category.entity";
import { SubCategory } from "../subcategory/entities/subcategory.entity";
import { MallIntegrationModule } from "../mall-integration/mall-integration.module";
import { PartnerIssuanceMetricsModule } from "../partner-rewards/partner-issuance-metrics.module";
import { AccessPassModule } from "../access-passes/access-pass.module";

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Reward,
      BusinessReward,
      Business,
      PlanSubscription,
      Sector,
      Tier,
      BusinessCampaign,
      PointHistory,
      LibraryAsset,
      Category,
      SubCategory,
    ]),
    forwardRef(() => CapabilityModule),
    forwardRef(() => TierProgressionModule),
    MallIntegrationModule,
    PartnerIssuanceMetricsModule,
    AccessPassModule,
  ],
  controllers: [RewardsController],
  providers: [RewardsService],
  exports: [RewardsService],
})
export class RewardsModule {}
