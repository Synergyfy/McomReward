import { Module, forwardRef } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { Business } from "../business/entities/business.entity";
import { PlansModule } from "../plans/plans.module";
import { CampaignModule } from "../campaign/campaign.module";
import { RewardsModule } from "../rewards/rewards.module";
import { ParticipantCampaignBalanceModule } from "../participant-campaign-balance/participant-campaign-balance.module";
import { CapabilityModule } from "../capability/capability.module";

import { AnalyticsModule } from "../analytics/analytics.module";
import { TierProgressionService } from "./tier-progression.service";
import { TierProgressionController } from "./tier-progression.controller";

@Module({
  imports: [
    PlansModule,
    forwardRef(() => CampaignModule),
    forwardRef(() => RewardsModule),
    forwardRef(() => ParticipantCampaignBalanceModule),
    forwardRef(() => CapabilityModule),
    AnalyticsModule,
    TypeOrmModule.forFeature([Business]),
  ],
  controllers: [TierProgressionController],
  providers: [TierProgressionService],
  exports: [TierProgressionService],
})
export class TierProgressionModule {}
