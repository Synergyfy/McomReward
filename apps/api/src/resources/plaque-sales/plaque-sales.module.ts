import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { PlaqueSale } from "./entities/plaque-sale.entity";
import { QrPlaque } from "../qr-plaques/entities/qr-plaque.entity";
import { PlaqueSalesService } from "./plaque-sales.service";
import { PlaqueSalesController } from "./plaque-sales.controller";

@Module({
  imports: [TypeOrmModule.forFeature([PlaqueSale, QrPlaque])],
  controllers: [PlaqueSalesController],
  providers: [PlaqueSalesService],
  exports: [PlaqueSalesService],
})
export class PlaqueSalesModule {}