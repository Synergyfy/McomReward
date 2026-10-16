import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { Business } from "../business/entities/business.entity";
import { LibraryAsset } from "../library-assets/entities/library-asset.entity";
import { QrPlaque } from "../qr-plaques/entities/qr-plaque.entity";
import { PointHistory } from "../participant-campaign-balance/entities/point-history.entity";
import { GroupCircle } from "../group-circle/entities/group-circle.entity";
import { GroupCircleMember } from "../group-circle/entities/group-circle-member.entity";
import { PlaqueSale } from "../plaque-sales/entities/plaque-sale.entity";
import { PayoutRequest } from "../financials/entities/payout-request.entity";
import { NfcCard } from "./entities/nfc-card.entity";
import { BusinessAssetsService } from "./business-assets.service";
import { BusinessAssetsController } from "./business-assets.controller";
import { RevenueAnalyticsController } from "./revenue-analytics.controller";

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Business,
      LibraryAsset,
      QrPlaque,
      NfcCard,
      PointHistory,
      GroupCircle,
      GroupCircleMember,
      PlaqueSale,
      PayoutRequest,
    ]),
  ],
  controllers: [BusinessAssetsController, RevenueAnalyticsController],
  providers: [BusinessAssetsService],
  exports: [BusinessAssetsService],
})
export class BusinessAssetsModule {}
