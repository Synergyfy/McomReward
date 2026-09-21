import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { CreditLevel } from "./entities/credit-level.entity";
import { CreditRule } from "./entities/credit-rule.entity";
import { CreditTransaction } from "./entities/credit-transaction.entity";
import { Participant } from "../participant/entities/participant.entity";
import { Business } from "../business/entities/business.entity";
import { CreditsService } from "./credits.service";
import {
  CreditsController,
  AdminCreditsController,
} from "./credits.controller";

@Module({
  imports: [
    TypeOrmModule.forFeature([
      CreditLevel,
      CreditRule,
      CreditTransaction,
      Participant,
      Business,
    ]),
  ],
  controllers: [CreditsController, AdminCreditsController],
  providers: [CreditsService],
  exports: [CreditsService],
})
export class CreditsModule {}
