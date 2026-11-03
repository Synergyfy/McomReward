import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { LoyaltySetupTemplate } from "./entities/loyalty-setup-template.entity";
import { LoyaltySetupProgress } from "./entities/loyalty-setup-progress.entity";
import { LoyaltySetupService } from "./loyalty-setup.service";
import {
  LoyaltySetupProgressController,
  LoyaltySetupTemplatesController,
} from "./loyalty-setup.controller";
import { BusinessReward } from "../rewards/entities/business-reward.entity";
import { BusinessCampaign } from "../campaign/entities/business-campaign.entity";
import { Campaign } from "../campaign/entities/campaign.entity";

@Module({
  imports: [
    TypeOrmModule.forFeature([
      LoyaltySetupTemplate,
      LoyaltySetupProgress,
      BusinessReward,
      BusinessCampaign,
      Campaign,
    ]),
  ],
  controllers: [
    LoyaltySetupTemplatesController,
    LoyaltySetupProgressController,
  ],
  providers: [LoyaltySetupService],
  exports: [LoyaltySetupService],
})
export class LoyaltySetupModule {}
