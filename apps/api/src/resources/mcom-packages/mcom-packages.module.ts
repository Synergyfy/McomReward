import { Module, forwardRef } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { Business } from "../business/entities/business.entity";
import { Tier } from "../tier/entities/tier.entity";
import { Membership } from "../membership/entities/membership.entity";
import { SsoModule } from "../sso/sso.module";
import { McomPackagesController } from "./mcom-packages.controller";
import { McomWebhookController } from "./mcom-webhook.controller";
import { McomPackagesService } from "./mcom-packages.service";

import { MembershipPayment } from "../membership/entities/membership-payment.entity";
import { PlansModule } from "../plans/plans.module";
import { JwtModule } from "@nestjs/jwt";
import { MembershipModule } from "../membership/membership.module";

@Module({
  imports: [
    TypeOrmModule.forFeature([Business, Tier, Membership, MembershipPayment]),
    SsoModule,
    PlansModule,
    forwardRef(() => MembershipModule),
    JwtModule.register({}),
  ],
  controllers: [McomPackagesController, McomWebhookController],
  providers: [McomPackagesService],
  exports: [McomPackagesService],
})
export class McomPackagesModule {}
