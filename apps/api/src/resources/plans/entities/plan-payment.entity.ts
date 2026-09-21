import { Entity, Column, ManyToOne, JoinColumn } from "typeorm";
import { ApiProperty } from "@nestjs/swagger";
import { AbstractBaseEntity } from "../../../database/entities/base.entity";
import { Business } from "../../business/entities/business.entity";

export enum PlanPaymentMethod {
  MCOM_WALLET = "mcom_wallet",
  STRIPE = "stripe",
  PAYPAL = "paypal",
}

@Entity({ name: "plan_payments" })
export class PlanPayment extends AbstractBaseEntity {
  @ApiProperty({
    description: "Business associated with the payment",
    type: () => Business,
  })
  @ManyToOne(() => Business, { onDelete: "CASCADE" })
  @JoinColumn({ name: "business_id" })
  business: Business;

  @ApiProperty({ description: "Payment amount", example: 49.99 })
  @Column({ type: "decimal", precision: 10, scale: 2 })
  amount: number;

  @ApiProperty({ description: "Currency", example: "GBP" })
  @Column({ default: "GBP" })
  currency: string;

  @ApiProperty({
    description: "Payment method used",
    enum: PlanPaymentMethod,
    example: PlanPaymentMethod.STRIPE,
  })
  @Column({
    type: "enum",
    enum: PlanPaymentMethod,
  })
  paymentMethod: PlanPaymentMethod;

  @ApiProperty({ description: "Transaction ID / Idempotency key" })
  @Column({ unique: true })
  transactionId: string;

  @ApiProperty({ description: "Optional metadata payload", required: false })
  @Column({ type: "jsonb", nullable: true })
  metadata: Record<string, any>;
}
