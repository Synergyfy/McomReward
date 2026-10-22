import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { ConfigModule } from "@nestjs/config";
import { PaymentService } from "./payment.service";
import { CashbackController } from "./cashback.controller";
import { McomPaymentWebhookController } from "./mcom-payment-webhook.controller";
import { PaymentCheckoutController } from "./payment-checkout.controller";
import { Business } from "../business/entities/business.entity";
import { PaymentCheckout } from "./entities/payment-checkout.entity";
import { CentralIntegrationService } from "./central-integration.service";
import { McomPaymentsService } from "./mcom-payments.service";
import { PaymentCheckoutService } from "./payment-checkout.service";
import { PaymentFulfillmentService } from "./payment-fulfillment.service";
import { McomPaymentWebhookService } from "./mcom-payment-webhook.service";

@Module({
  imports: [
    TypeOrmModule.forFeature([Business, PaymentCheckout]),
    ConfigModule,
  ],
  controllers: [
    CashbackController,
    McomPaymentWebhookController,
    PaymentCheckoutController,
  ],
  providers: [
    PaymentService,
    CentralIntegrationService,
    McomPaymentsService,
    PaymentCheckoutService,
    PaymentFulfillmentService,
    McomPaymentWebhookService,
  ],
  exports: [
    PaymentService,
    CentralIntegrationService,
    McomPaymentsService,
    PaymentCheckoutService,
    PaymentFulfillmentService,
  ],
})
export class PaymentModule {}
