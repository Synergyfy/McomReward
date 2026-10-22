import { Column, Entity, Index } from "typeorm";
import { ApiProperty } from "@nestjs/swagger";
import { AbstractBaseEntity } from "../../../database/entities/base.entity";

export enum PaymentCheckoutPurpose {
  PLAN = "PLAN",
  PLAN_RENEWAL = "PLAN_RENEWAL",
  POINT_PACKAGE = "POINT_PACKAGE",
  STAMP_PACKAGE = "STAMP_PACKAGE",
  EXTRA_POINTS = "EXTRA_POINTS",
  CIRCLE_CONTRIBUTION = "CIRCLE_CONTRIBUTION",
}

export enum PaymentCheckoutStatus {
  PENDING = "pending",
  PAID = "paid",
  FAILED = "failed",
  REFUNDED = "refunded",
  CANCELED = "canceled",
}

export enum PaymentCheckoutMethod {
  STRIPE = "stripe",
  PAYPAL = "paypal",
  WALLET = "wallet",
}

/**
 * Local mirror of one MCOM Pay checkout attempt.
 *
 * The browser only ever sees an opaque checkout id plus a provider handle.
 * This row is the deterministic idempotency anchor and lets the confirm step
 * and the `payment.succeeded` webhook reconcile without trusting the client.
 */
@Entity({ name: "payment_checkouts" })
export class PaymentCheckout extends AbstractBaseEntity {
  @ApiProperty({
    description: "Business that owns this checkout",
    required: false,
  })
  @Index()
  @Column({ name: "business_id", type: "uuid", nullable: true })
  businessId?: string;

  @ApiProperty({
    description: "What this checkout is paying for",
    enum: PaymentCheckoutPurpose,
  })
  @Index()
  @Column({ type: "enum", enum: PaymentCheckoutPurpose })
  purpose: PaymentCheckoutPurpose;

  @ApiProperty({
    description:
      "Local record this checkout belongs to (plan variant, package, etc.)",
    required: false,
  })
  @Index()
  @Column({ name: "purpose_ref", nullable: true })
  purposeRef?: string;

  @ApiProperty({ enum: PaymentCheckoutStatus })
  @Index()
  @Column({
    type: "enum",
    enum: PaymentCheckoutStatus,
    default: PaymentCheckoutStatus.PENDING,
  })
  status: PaymentCheckoutStatus;

  @ApiProperty({ description: "Exact amount in minor units (pence)" })
  @Column({ name: "amount_minor" })
  amountMinor: string;

  @ApiProperty({ description: "ISO currency code", default: "GBP" })
  @Column({ default: "GBP" })
  currency: string;

  @ApiProperty({ enum: PaymentCheckoutMethod })
  @Column({ type: "enum", enum: PaymentCheckoutMethod })
  method: PaymentCheckoutMethod;

  @ApiProperty({ description: "MCOM Pay charge id", required: false })
  @Index({ unique: true })
  @Column({ name: "charge_id", nullable: true })
  chargeId?: string;

  @ApiProperty({
    description: "Provider reference (PaymentIntent / PayPal order)",
    required: false,
  })
  @Column({ name: "provider_ref", nullable: true })
  providerRef?: string;

  @ApiProperty({
    description: "MCOM Pay idempotency key used for this checkout",
  })
  @Index({ unique: true })
  @Column({ name: "idempotency_key" })
  idempotencyKey: string;

  @ApiProperty({
    description: "Our order/invoice reference sent to MCOM Pay",
    required: false,
  })
  @Column({ nullable: true })
  reference?: string;

  @ApiProperty({ description: "MCOM fee in minor units", required: false })
  @Column({ name: "fee_minor", nullable: true })
  feeMinor?: string;

  @ApiProperty({
    description: "MCOM net amount in minor units",
    required: false,
  })
  @Column({ name: "net_minor", nullable: true })
  netMinor?: string;

  @ApiProperty({ description: "Arbitrary checkout metadata", required: false })
  @Column({ type: "jsonb", nullable: true })
  metadata?: Record<string, unknown>;

  @ApiProperty({ description: "When the charge was paid", required: false })
  @Column({ name: "paid_at", type: "timestamptz", nullable: true })
  paidAt?: Date;

  @ApiProperty({ description: "When the charge was refunded", required: false })
  @Column({ name: "refunded_at", type: "timestamptz", nullable: true })
  refundedAt?: Date;

  @ApiProperty({
    description: "When local entitlement was granted",
    required: false,
  })
  @Column({ name: "fulfilled_at", type: "timestamptz", nullable: true })
  fulfilledAt?: Date;
}
