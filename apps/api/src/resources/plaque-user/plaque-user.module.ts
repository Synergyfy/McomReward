import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { QrPlaque } from "../qr-plaques/entities/qr-plaque.entity";
import { PlaqueScan } from "./entities/plaque-scan.entity";
import { PlaqueUserService } from "./plaque-user.service";
import { PlaqueUserController, PlaqueScanController } from "./plaque-user.controller";

@Module({
  imports: [TypeOrmModule.forFeature([QrPlaque, PlaqueScan])],
  controllers: [PlaqueUserController, PlaqueScanController],
  providers: [PlaqueUserService],
  exports: [PlaqueUserService],
})
export class PlaqueUserModule {}