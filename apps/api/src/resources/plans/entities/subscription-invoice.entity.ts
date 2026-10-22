import { Column, Entity, Index, JoinColumn, ManyToOne, Unique } from "typeorm";
import { ApiProperty } from "@nestjs/swagger";
import { AbstractBaseEntity } from "../../../database/entities/base.entity";
import {
  PlanSubscription,
  SubscriptionBillingMethod,
} from "./plan-subscription.entity";

export enum SubscriptionInvoiceStatus {
  PENDING = "pending",
  PAID = "paid",
  FAILED = "failed",
  CANCELED = "canceled",
  REFUNDED = "refunded",
}

/**
 * One row per subscription billing period. The unique (subscription, period)
 * constraint is the hard guarantee that a renewal period can never be charged
 * twice, even when the cron overlaps or a webhook retries.
 */
@Entity({ name: "subscription_invoices" })
@Unique("UQ_subscription_invoices_period", ["subscriptionId", "periodStart"])
export class SubscriptionInvoice extends AbstractBaseEntity {
  @ApiProperty({ description: "Subscription this invoice belongs to" })
  @Index()
  @Column({ name: "subscription_id", type: "uuid" })
  subscriptionId: string;

  @ManyToOne(() => PlanSubscription, { onDelete: "CASCADE" })
  @JoinColumn({ name: "subscription_id" })
  subscription?: PlanSubscription;

  @ApiProperty({ description: "Start of the billed period" })
  @Column({ name: "period_start", type: "timestamptz" })
  periodStart: Date;

  @ApiProperty({ description: "End of the billed period" })
  @Column({ name: "period_end", type: "timestamptz" })
  periodEnd: Date;

  @ApiProperty({ description: "Exact amount in minor units (pence)" })
  @Column({ name: "amount_minor" })
  amountMinor: string;

  @ApiProperty({ description: "ISO currency code", default: "GBP" })
  @Column({ default: "GBP" })
  currency: string;

  @ApiProperty({ enum: SubscriptionBillingMethod })
  @Column({
    name: "billing_method",
    type: "enum",
    enum: SubscriptionBillingMethod,
  })
  billingMethod: SubscriptionBillingMethod;

  @ApiProperty({
    description: "MCOM Pay charge id or wallet transaction id",
    required: false,
  })
  @Index()
  @Column({ name: "charge_id", nullable: true })
  chargeId?: string;

  @ApiProperty({ enum: SubscriptionInvoiceStatus })
  @Index()
  @Column({
    type: "enum",
    enum: SubscriptionInvoiceStatus,
    default: SubscriptionInvoiceStatus.PENDING,
  })
  status: SubscriptionInvoiceStatus;

  @ApiProperty({
    description: "Number of attempts for this period",
    default: 0,
  })
  @Column({ type: "int", default: 0 })
  attempts: number;

  @ApiProperty({ description: "When the invoice was paid", required: false })
  @Column({ name: "paid_at", type: "timestamptz", nullable: true })
  paidAt?: Date;

  @ApiProperty({ description: "Last failure reason", required: false })
  @Column({ name: "failure_reason", type: "text", nullable: true })
  failureReason?: string;

  @ApiProperty({ description: "Invoice metadata", required: false })
  @Column({ type: "jsonb", nullable: true })
  metadata?: Record<string, unknown>;
}
