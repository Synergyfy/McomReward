import { Entity, Column, Index } from "typeorm";
import { AbstractBaseEntity } from "../../../database/entities/base.entity";
import { ApiProperty } from "@nestjs/swagger";

export enum PayoutStatus {
  PENDING = "pending",
  APPROVED = "approved",
  REJECTED = "rejected",
}

@Entity("payout_requests")
@Index(["businessId"])
export class PayoutRequest extends AbstractBaseEntity {
  @ApiProperty()
  @Column({ name: "business_id", type: "uuid" })
  businessId: string;

  @ApiProperty()
  @Column({ name: "business_name" })
  businessName: string;

  @ApiProperty()
  @Column({ type: "decimal", precision: 12, scale: 2 })
  amount: number;

  @ApiProperty({ enum: PayoutStatus })
  @Column({ type: "enum", enum: PayoutStatus, default: PayoutStatus.PENDING })
  status: PayoutStatus;

  @ApiProperty()
  @Column({ name: "requested_at", type: "timestamptz", default: () => "now()" })
  requestedAt: Date;

  @ApiProperty()
  @Column({ name: "processed_at", type: "timestamptz", nullable: true })
  processedAt: Date;
}
