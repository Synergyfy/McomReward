import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { TypeOrmModule } from "@nestjs/typeorm";
import { AccessPassPlan } from "../access-passes/entities/access-pass-plan.entity";
import { Business } from "../business/entities/business.entity";
import { PlansModule } from "../plans/plans.module";
import { SsoModule } from "../sso/sso.module";
import { ProcessedWebhookEvent } from "./entities/processed-webhook-event.entity";
import { MembershipWebhookController } from "./membership-webhook.controller";
import { MembershipSyncService } from "./membership-sync.service";

@Module({
  imports: [
    TypeOrmModule.forFeature([Business, AccessPassPlan, ProcessedWebhookEvent]),
    ConfigModule,
    PlansModule,
    SsoModule,
  ],
  controllers: [MembershipWebhookController],
  providers: [MembershipSyncService],
  exports: [MembershipSyncService],
})
export class MembershipSyncModule {}
