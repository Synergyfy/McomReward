import { Entity, Column, ManyToOne, JoinColumn } from "typeorm";
import { ApiProperty } from "@nestjs/swagger";
import { AbstractBaseEntity } from "../../../database/entities/base.entity";
import { PlanVariant } from "./plan-variant.entity";

@Entity({ name: "plan_prices" })
export class PlanPrice extends AbstractBaseEntity {
  @ApiProperty({ description: "Foreign key linking to PlanVariant" })
  @Column({ name: "plan_variant_id", type: "uuid" })
  planVariantId: string;

  @ManyToOne(() => PlanVariant, (variant) => variant.prices, {
    onDelete: "CASCADE",
  })
  @JoinColumn({ name: "plan_variant_id" })
  planVariant: PlanVariant;

  @ApiProperty({ description: "Currency code (e.g. GBP)", default: "GBP" })
  @Column({ default: "GBP" })
  currency: string;

  @ApiProperty({
    description: "Price amount for the entire duration",
    example: 49.99,
  })
  @Column({ type: "decimal", precision: 10, scale: 2 })
  amount: number;

  @ApiProperty({ description: "Optional Stripe Price ID", required: false })
  @Column({ nullable: true })
  stripePriceId: string;

  @ApiProperty({ description: "Optional PayPal Plan ID", required: false })
  @Column({ nullable: true })
  paypalPlanId: string;

  @ApiProperty({
    description:
      "Whether this is the currently active price record for the variant",
  })
  @Column({ default: true })
  isActive: boolean;

  @ApiProperty({ description: "Timestamp from which this price is effective" })
  @Column({ type: "timestamptz", default: () => "CURRENT_TIMESTAMP" })
  effectiveFrom: Date;

  @ApiProperty({
    description:
      "Timestamp until which this price was effective (null if currently active)",
    required: false,
  })
  @Column({ type: "timestamptz", nullable: true })
  effectiveTo: Date | null;
}
