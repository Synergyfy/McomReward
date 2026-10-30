import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { ScheduleModule } from "@nestjs/schedule";
import { Business } from "../business/entities/business.entity";
import { Tier } from "../tier/entities/tier.entity";
import { PlanSubscription } from "../plans/entities/plan-subscription.entity";
import { PlanPayment } from "../plans/entities/plan-payment.entity";
import { SubscriptionInvoice } from "../plans/entities/subscription-invoice.entity";
import { SsoModule } from "../sso/sso.module";
import { McomPackagesController } from "./mcom-packages.controller";
import { McomWebhookController } from "./mcom-webhook.controller";
import { McomPackagesService } from "./mcom-packages.service";
import { PlansModule } from "../plans/plans.module";
import { AccessPassModule } from "../access-passes/access-pass.module";
import { RewardFulfilmentModule } from "../reward-fulfilment/reward-fulfilment.module";
import { JwtModule } from "@nestjs/jwt";
import { PaymentModule } from "../payment/payment.module";
import { WalletModule } from "../wallet/wallet.module";
import { SubscriptionBillingService } from "../plans/services/subscription-billing.service";

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Business,
      Tier,
      PlanSubscription,
      PlanPayment,
      SubscriptionInvoice,
    ]),
    SsoModule,
    PlansModule,
    AccessPassModule,
    RewardFulfilmentModule,
    JwtModule.register({}),
    PaymentModule,
    WalletModule,
    ScheduleModule.forRoot(),
  ],
  controllers: [McomPackagesController, McomWebhookController],
  providers: [McomPackagesService, SubscriptionBillingService],
  exports: [McomPackagesService, SubscriptionBillingService],
})
export class McomPackagesModule {}
