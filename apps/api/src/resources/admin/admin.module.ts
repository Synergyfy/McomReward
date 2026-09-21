import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { Admin } from "./entities/admin.entity";
import { AdminService } from "./services/admin.service";
import { AdminController } from "./controllers/admin.controller";
import { BusinessModule } from "../business/business.module";
import { StaffModule } from "../staff/staff.module";
import { HashModule } from "../../common/hash/hash.module";
import { Participant } from "../participant/entities/participant.entity";
import { PointHistory } from "../participant-campaign-balance/entities/point-history.entity";
import { Campaign } from "../campaign/entities/campaign.entity";
import { Business } from "../business/entities/business.entity";
import { Staff } from "../staff/entities/staff.entity";
import { Reward } from "../rewards/entities/reward.entity";
import { PlanSubscription } from "../plans/entities/plan-subscription.entity";
import { CampaignModule } from "../campaign/campaign.module";
import { ParticipantModule } from "../participant/participant.module";
import { AdminBusinessController } from "../business/controllers/admin.business.controller";

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Admin,
      Participant,
      PointHistory,
      Campaign,
      Business,
      Staff,
      Reward,
      PlanSubscription,
    ]),
    BusinessModule,
    StaffModule,
    HashModule,
    CampaignModule,
    ParticipantModule,
  ],
  providers: [AdminService],
  controllers: [AdminController, AdminBusinessController],
  exports: [AdminService],
})
export class AdminModule {}
