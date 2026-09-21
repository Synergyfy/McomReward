import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { LoyaltySetupTemplate } from "./entities/loyalty-setup-template.entity";
import { LoyaltySetupService } from "./loyalty-setup.service";
import { LoyaltySetupTemplatesController } from "./loyalty-setup.controller";

@Module({
  imports: [TypeOrmModule.forFeature([LoyaltySetupTemplate])],
  controllers: [LoyaltySetupTemplatesController],
  providers: [LoyaltySetupService],
  exports: [LoyaltySetupService],
})
export class LoyaltySetupModule {}
