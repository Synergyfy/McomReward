import { Entity, Column, ManyToOne, OneToOne, JoinColumn } from "typeorm";
import { ApiProperty } from "@nestjs/swagger";
import { AbstractBaseEntity } from "../../../database/entities/base.entity";
import { Business } from "../../business/entities/business.entity";
import { PlanVariant } from "./plan-variant.entity";
import { PlanPrice } from "./plan-price.entity";
import { PlanPayment } from "./plan-payment.entity";
import { PaymentProvider } from "../../payment-history/entities/payment-history.entity";

export enum SubscriptionStatus {
  ACTIVE = "active",
  INACTIVE = "inactive",
  EXPIRED = "expired",
}

export enum SubscriptionPlanType {
  MONTHLY = "monthly",
  ANNUAL = "annual",
  QUARTERLY = "quarterly",
  SEASONAL = "seasonal",
}

export {
  SubscriptionStatus as PlanSubscriptionStatus,
  SubscriptionPlanType as PlanType,
};

@Entity({ name: "plan_subscriptions" })
export class PlanSubscription extends AbstractBaseEntity {
  @ApiProperty({
    description:
      "The business associated with the subscription (1:1 per business)",
    type: () => Business,
  })
  @ManyToOne(() => Business, { onDelete: "CASCADE" })
  @JoinColumn({ name: "business_id" })
  business: Business;

  @ApiProperty({ description: "Foreign key linking to active PlanVariant" })
  @Column({ name: "plan_variant_id", type: "uuid", nullable: true })
  planVariantId?: string;

  @ManyToOne(() => PlanVariant, { nullable: true, eager: true })
  @JoinColumn({ name: "plan_variant_id" })
  planVariant?: PlanVariant;

  @ApiProperty({
    description: "Snapshot Price ID for versioned pricing lock",
    required: false,
  })
  @Column({ name: "price_id", type: "uuid", nullable: true })
  priceId?: string;

  @ManyToOne(() => PlanPrice, { nullable: true, eager: true })
  @JoinColumn({ name: "price_id" })
  price?: PlanPrice;

  @ApiProperty({
    description: "Status of the subscription",
    enum: SubscriptionStatus,
    example: SubscriptionStatus.ACTIVE,
  })
  @Column({
    type: "enum",
    enum: SubscriptionStatus,
    default: SubscriptionStatus.INACTIVE,
  })
  status: SubscriptionStatus;

  @ApiProperty({
    description: "Boolean active flag",
    default: false,
  })
  @Column({ default: false })
  isActive: boolean;

  @ApiProperty({
    description: "Start timestamp of current subscription period",
    required: false,
  })
  @Column({ type: "timestamptz", nullable: true })
  starts_at?: Date;

  @ApiProperty({
    description: "Expiry timestamp of current subscription period",
    required: false,
  })
  @Column({ type: "timestamptz", nullable: true })
  expires_at?: Date;

  @ApiProperty({
    description: "Whether the subscription is in trial mode",
    default: false,
  })
  @Column({ default: false })
  is_trial: boolean;

  @ApiProperty({
    description: "Number of trial days",
    required: false,
  })
  @Column({ type: "int", nullable: true })
  trial_days?: number;

  @ApiProperty({
    description: "Billing cadence / plan type",
    enum: SubscriptionPlanType,
    default: SubscriptionPlanType.MONTHLY,
  })
  @Column({
    type: "enum",
    enum: SubscriptionPlanType,
    default: SubscriptionPlanType.MONTHLY,
  })
  plan_type: SubscriptionPlanType;

  @ApiProperty({
    description: "External payment transaction or order ID",
    required: false,
  })
  @Column({ nullable: true })
  transaction_id?: string;

  @ApiProperty({
    description: "Payment provider used",
    enum: PaymentProvider,
    required: false,
  })
  @Column({
    type: "enum",
    enum: PaymentProvider,
    nullable: true,
  })
  payment_provider?: PaymentProvider;

  @ApiProperty({
    description: "Linked payment record",
    type: () => PlanPayment,
    required: false,
  })
  @OneToOne(() => PlanPayment, { nullable: true, cascade: true })
  @JoinColumn({ name: "payment_id" })
  payment?: PlanPayment;
}
