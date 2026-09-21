import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { Business } from "../business/entities/business.entity";
import { Tier } from "../tier/entities/tier.entity";
import { PlanSubscription } from "../plans/entities/plan-subscription.entity";
import { PlanPayment } from "../plans/entities/plan-payment.entity";
import { SsoModule } from "../sso/sso.module";
import { McomPackagesController } from "./mcom-packages.controller";
import { McomWebhookController } from "./mcom-webhook.controller";
import { McomPackagesService } from "./mcom-packages.service";
import { PlansModule } from "../plans/plans.module";
import { JwtModule } from "@nestjs/jwt";

import { LegacyMembershipController } from "./legacy-membership.controller";

@Module({
  imports: [
    TypeOrmModule.forFeature([Business, Tier, PlanSubscription, PlanPayment]),
    SsoModule,
    PlansModule,
    JwtModule.register({}),
  ],
  controllers: [
    McomPackagesController,
    McomWebhookController,
    LegacyMembershipController,
  ],
  providers: [McomPackagesService],
  exports: [McomPackagesService],
})
export class McomPackagesModule {}
