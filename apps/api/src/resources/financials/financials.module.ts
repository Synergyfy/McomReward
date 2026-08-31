import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { Escrow } from "./entities/escrow.entity";
import { PayoutRequest } from "./entities/payout-request.entity";
import { PaymentHistory } from "../payment-history/entities/payment-history.entity";
import { FinancialAdminService } from "./financial-admin.service";
import { AdminFinancialController } from "./financial-admin.controller";

@Module({
  imports: [TypeOrmModule.forFeature([Escrow, PayoutRequest, PaymentHistory])],
  controllers: [AdminFinancialController],
  providers: [FinancialAdminService],
  exports: [FinancialAdminService],
})
export class FinancialsModule {}