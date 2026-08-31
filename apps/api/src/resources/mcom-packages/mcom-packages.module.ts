import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { Business } from "../business/entities/business.entity";
import { Tier } from "../tier/entities/tier.entity";
import { Membership } from "../membership/entities/membership.entity";
import { SsoModule } from "../sso/sso.module";
import { McomPackagesController } from "./mcom-packages.controller";
import { McomWebhookController } from "./mcom-webhook.controller";
import { McomPackagesService } from "./mcom-packages.service";

@Module({
  imports: [
    TypeOrmModule.forFeature([Business, Tier, Membership]),
    SsoModule,
  ],
  controllers: [McomPackagesController, McomWebhookController],
  providers: [McomPackagesService],
  exports: [McomPackagesService],
})
export class McomPackagesModule {}
