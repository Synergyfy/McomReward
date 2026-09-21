import { Entity, Column, Index } from "typeorm";
import { AbstractBaseEntity } from "../../../database/entities/base.entity";
import { ApiProperty } from "@nestjs/swagger";

export enum PayoutStatus {
  PENDING = "Pending",
  PAID = "Paid",
  CANCELLED = "Cancelled",
}

export enum SaleStatus {
  COMPLETED = "Completed",
  CANCELED = "Canceled",
}

@Entity("plaque_sales")
@Index(["plaqueName"])
export class PlaqueSale extends AbstractBaseEntity {
  @ApiProperty()
  @Column({ name: "plaque_id", type: "uuid" })
  plaqueId: string;

  @ApiProperty()
  @Column({ name: "plaque_name" })
  plaqueName: string;

  @ApiProperty()
  @Column({ name: "seller_id", type: "uuid" })
  sellerId: string;

  @ApiProperty()
  @Column({ name: "seller_name" })
  sellerName: string;

  @ApiProperty()
  @Column({ name: "buyer_id", type: "uuid" })
  buyerId: string;

  @ApiProperty()
  @Column({ name: "buyer_name" })
  buyerName: string;

  @ApiProperty()
  @Column({ name: "sale_date", type: "timestamptz", default: () => "now()" })
  saleDate: Date;

  @ApiProperty()
  @Column({ name: "sale_price", type: "decimal", precision: 12, scale: 2 })
  salePrice: number;

  @ApiProperty()
  @Column({
    name: "commission_percentage",
    type: "decimal",
    precision: 5,
    scale: 2,
    default: 0,
  })
  commissionPercentage: number;

  @ApiProperty()
  @Column({
    name: "commission_amount",
    type: "decimal",
    precision: 12,
    scale: 2,
  })
  commissionAmount: number;

  @ApiProperty({ enum: PayoutStatus })
  @Column({
    type: "enum",
    enum: PayoutStatus,
    default: PayoutStatus.PENDING,
  })
  payoutStatus: PayoutStatus;

  @ApiProperty({ enum: SaleStatus })
  @Column({
    type: "enum",
    enum: SaleStatus,
    default: SaleStatus.COMPLETED,
  })
  status: SaleStatus;
}
