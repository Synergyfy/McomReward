import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { ConfigModule } from "@nestjs/config";
import { ScheduleModule } from "@nestjs/schedule";
import { Reward } from "../rewards/entities/reward.entity";
import { BusinessReward } from "../rewards/entities/business-reward.entity";
import { Business } from "../business/entities/business.entity";
import { RewardIssuance } from "../partner-rewards/entities/reward-issuance.entity";
import { MallIntegrationModule } from "../mall-integration/mall-integration.module";
import { CentralIntegrationModule } from "../central-integration/central-integration.module";
import { RewardFulfilmentService } from "./reward-fulfilment.service";
import { RewardFulfilmentController } from "./reward-fulfilment.controller";
import { CentralEventsController } from "./central-events.controller";
import { RewardFulfilmentOutbox } from "./entities/reward-fulfilment-outbox.entity";

@Module({
  imports: [
    ConfigModule,
    ScheduleModule.forRoot(),
    TypeOrmModule.forFeature([
      RewardIssuance,
      Reward,
      BusinessReward,
      Business,
      RewardFulfilmentOutbox,
    ]),
    MallIntegrationModule,
    CentralIntegrationModule,
  ],
  controllers: [RewardFulfilmentController, CentralEventsController],
  providers: [RewardFulfilmentService],
  exports: [RewardFulfilmentService],
})
export class RewardFulfilmentModule {}
