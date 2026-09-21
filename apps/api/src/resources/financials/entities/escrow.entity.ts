import { Entity, Column, Index } from "typeorm";
import { AbstractBaseEntity } from "../../../database/entities/base.entity";
import { ApiProperty } from "@nestjs/swagger";

export enum EscrowStatus {
  HELD = "held",
  RELEASED = "released",
  REFUNDED = "refunded",
}

@Entity("escrows")
@Index(["campaignId"])
export class Escrow extends AbstractBaseEntity {
  @ApiProperty()
  @Column({ name: "campaign_id", type: "uuid" })
  campaignId: string;

  @ApiProperty()
  @Column({ name: "campaign_name" })
  campaignName: string;

  @ApiProperty()
  @Column({ name: "business_id", type: "uuid" })
  businessId: string;

  @ApiProperty()
  @Column({ name: "business_name" })
  businessName: string;

  @ApiProperty()
  @Column({ type: "decimal", precision: 12, scale: 2 })
  amount: number;

  @ApiProperty({ enum: EscrowStatus })
  @Column({ type: "enum", enum: EscrowStatus, default: EscrowStatus.HELD })
  status: EscrowStatus;

  @ApiProperty()
  @Column({ name: "released_at", type: "timestamptz", nullable: true })
  releasedAt: Date;
}
