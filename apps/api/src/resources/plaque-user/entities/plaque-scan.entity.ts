import { Entity, Column, Index } from "typeorm";
import { AbstractBaseEntity } from "../../../database/entities/base.entity";
import { ApiProperty } from "@nestjs/swagger";

export enum PlaqueActivityType {
  SCAN = "scan",
  REDEMPTION = "redemption",
  COMMISSION = "commission",
}

@Entity("plaque_scans")
@Index(["plaqueId"])
export class PlaqueScan extends AbstractBaseEntity {
  @ApiProperty()
  @Column({ name: "plaque_id", type: "uuid" })
  plaqueId: string;

  @ApiProperty()
  @Column({ name: "plaque_name" })
  plaqueName: string;

  @ApiProperty({ enum: PlaqueActivityType })
  @Column({ type: "enum", enum: PlaqueActivityType, default: PlaqueActivityType.SCAN })
  type: PlaqueActivityType;

  @ApiProperty()
  @Column("text")
  description: string;

  @ApiProperty()
  @Column({ default: "QR Code" })
  source: string;

  @ApiProperty()
  @Column({ name: "scanned_at", type: "timestamptz", default: () => "now()" })
  scannedAt: Date;
}