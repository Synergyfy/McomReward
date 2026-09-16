import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { Partner } from "./entities/partner.entity";
import { BrandingPartner } from "./entities/branding-partner.entity";
import { PartnerService } from "./partner.service";
import { BrandingPartnerService } from "./services/branding-partner.service";
import { PartnerController } from "./partner.controller";
import { AdminPartnerController } from "./controllers/admin-partner.controller";

@Module({
  imports: [TypeOrmModule.forFeature([Partner, BrandingPartner])],
  controllers: [PartnerController, AdminPartnerController],
  providers: [PartnerService, BrandingPartnerService],
  exports: [PartnerService, BrandingPartnerService],
})
export class PartnerModule {}
