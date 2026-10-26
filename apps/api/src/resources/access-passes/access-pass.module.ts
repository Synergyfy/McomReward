import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { ConfigModule } from "@nestjs/config";
import { ScheduleModule } from "@nestjs/schedule";
import { AccessPassPlan } from "./entities/access-pass-plan.entity";
import { AccessPassCode } from "./entities/access-pass-code.entity";
import { AccessPassSubscription } from "./entities/access-pass-subscription.entity";
import { Business } from "../business/entities/business.entity";
import { AccessPassService } from "./access-pass.service";
import { AccessPassController } from "./access-pass.controller";
import { PaymentModule } from "../payment/payment.module";
import { WalletModule } from "../wallet/wallet.module";
import { MailModule } from "../../mail/mail.module";

@Module({
  imports: [
    TypeOrmModule.forFeature([
      AccessPassPlan,
      AccessPassCode,
      AccessPassSubscription,
      Business,
    ]),
    ConfigModule,
    ScheduleModule.forRoot(),
    PaymentModule,
    WalletModule,
    MailModule,
  ],
  controllers: [AccessPassController],
  providers: [AccessPassService],
  exports: [AccessPassService],
})
export class AccessPassModule {}
