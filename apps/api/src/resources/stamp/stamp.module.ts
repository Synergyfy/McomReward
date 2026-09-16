import { Module, forwardRef } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { StampPackage } from "./entities/stamp-package.entity";
import { BusinessStampPackage } from "./entities/business-stamp-package.entity";
import { StampRewardTemplate } from "./entities/stamp-reward-template.entity";
import { BusinessStampReward } from "./entities/business-stamp-reward.entity";
import { StampCard } from "./entities/stamp-card.entity";
import { StampEvent } from "./entities/stamp-event.entity";
import { Participant } from "../participant/entities/participant.entity";
import { Business } from "../business/entities/business.entity";
import { ParticipantCampaignBalanceModule } from "../participant-campaign-balance/participant-campaign-balance.module";
import { Staff } from "../staff/entities/staff.entity";
import { Tier } from "../tier/entities/tier.entity";
import { PaymentModule } from "../payment/payment.module";
import { StampPackageService } from "./services/stamp-package.service";
import { StampPackageController } from "./controllers/stamp-package.controller";
import { AdminStampController } from "./controllers/admin-stamp.controller";
import { BusinessStampController } from "./controllers/business-stamp.controller";
import { ParticipantStampController } from "./controllers/participant-stamp.controller";
import { AdminParticipantStampController } from "./controllers/admin-participant-stamp.controller";
import { StampService } from "./services/stamp.service";
import { PointHistory } from "../participant-campaign-balance/entities/point-history.entity";

@Module({
  imports: [
    TypeOrmModule.forFeature([
      StampPackage,
      BusinessStampPackage,
      StampRewardTemplate,
      BusinessStampReward,
      StampCard,
      StampEvent,
      Participant,
      Business,
      Staff,
      Tier,
      PointHistory,
    ]),
    forwardRef(() => ParticipantCampaignBalanceModule),
    PaymentModule,
  ],
  controllers: [
    StampPackageController,
    AdminStampController,
    BusinessStampController,
    ParticipantStampController,
    AdminParticipantStampController,
  ],
  providers: [StampPackageService, StampService],
  exports: [StampPackageService, StampService],
})
export class StampModule {}
