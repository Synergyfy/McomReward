import { Module, forwardRef } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { ScheduleModule } from "@nestjs/schedule";

import { Reward } from "../rewards/entities/reward.entity";
import { BusinessReward } from "../rewards/entities/business-reward.entity";
import { Business } from "../business/entities/business.entity";
import { Participant } from "../participant/entities/participant.entity";
import { PointHistory } from "../participant-campaign-balance/entities/point-history.entity";
import { MallIntegrationModule } from "../mall-integration/mall-integration.module";
import { PlansModule } from "../plans/plans.module";
import { SsoModule } from "../sso/sso.module";

import { RewardIssuance } from "./entities/reward-issuance.entity";
import { PartnerRewardsController } from "./controllers/partner-rewards.controller";
import { PartnerIssuancesController } from "./controllers/partner-issuances.controller";
import { PartnerBusinessRewardsController } from "./controllers/partner-business-rewards.controller";
import { MePartnerRewardsController } from "./controllers/me-partner-rewards.controller";
import { PartnerRewardsService } from "./services/partner-rewards.service";
import { RewardIssuanceService } from "./services/reward-issuance.service";
import { RecipientResolverService } from "./services/recipient-resolver.service";
import { PartnerPointsGateway } from "./services/partner-points-gateway.service";
import { PartnerEventNotifier } from "./services/partner-event-notifier.service";
import { PartnerEntitlementService } from "./services/partner-entitlement.service";
import { PartnerRewardsCron } from "./partner-rewards.cron";

/**
 * Partner-facing rewards provider. Exposes the MCOM reward catalogue and the
 * full issuance lifecycle to authorised ecosystem peers over the service mesh.
 */
@Module({
  imports: [
    TypeOrmModule.forFeature([
      Reward,
      BusinessReward,
      RewardIssuance,
      Business,
      Participant,
      PointHistory,
    ]),
    ScheduleModule.forRoot(),
    MallIntegrationModule,
    forwardRef(() => PlansModule),
    forwardRef(() => SsoModule),
  ],
  controllers: [
    PartnerRewardsController,
    PartnerBusinessRewardsController,
    PartnerIssuancesController,
    MePartnerRewardsController,
  ],
  providers: [
    PartnerRewardsService,
    RewardIssuanceService,
    RecipientResolverService,
    PartnerPointsGateway,
    PartnerEventNotifier,
    PartnerEntitlementService,
    PartnerRewardsCron,
  ],
  exports: [
    PartnerRewardsService,
    RewardIssuanceService,
    PartnerEventNotifier,
    PartnerEntitlementService,
  ],
})
export class PartnerRewardsModule {}
