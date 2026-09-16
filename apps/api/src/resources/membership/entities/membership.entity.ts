import {
  Entity,
  Column,
  ManyToOne,
  OneToOne,
  JoinColumn,
} from "typeorm";
import { ApiProperty } from "@nestjs/swagger";
import { AbstractBaseEntity } from "../../../database/entities/base.entity";
import { Tier } from "../../tier/entities/tier.entity";
import { Business } from "../../business/entities/business.entity";
import { PaymentProvider } from "../../payment-history/entities/payment-history.entity";
import { PlanVariant } from "../../plans/entities/plan-variant.entity";
import { PlanPrice } from "../../plans/entities/plan-price.entity";
import { MembershipPayment } from "./membership-payment.entity";

export enum MembershipStatus {
  ACTIVE = "active",
  INACTIVE = "inactive",
  EXPIRED = "expired",
}

export enum PlanType {
  MONTHLY = "monthly",
  ANNUAL = "annual",
  QUARTERLY = "quarterly",
}

@Entity("membership")
export class Membership extends AbstractBaseEntity {
  @ApiProperty({
    description: "The business associated with the membership (1:1 per business)",
    type: () => Business,
  })
  @ManyToOne(() => Business, { onDelete: "CASCADE" })
  @JoinColumn({ name: "business_id" })
  business: Business;

  @ApiProperty({
    description: "The legacy tier associated with the membership (optional / fallback)",
    type: () => Tier,
    required: false,
  })
  @ManyToOne(() => Tier, { nullable: true })
  @JoinColumn({ name: "tier_id" })
  tier?: Tier;

  @ApiProperty({ description: "Foreign key linking to active PlanVariant", required: false })
  @Column({ name: "plan_variant_id", type: "uuid", nullable: true })
  planVariantId?: string;

  @ManyToOne(() => PlanVariant, { nullable: true })
  @JoinColumn({ name: "plan_variant_id" })
  planVariant?: PlanVariant;

  @ApiProperty({ description: "Snapshot Price ID for versioned pricing lock", required: false })
  @Column({ name: "price_id", type: "uuid", nullable: true })
  priceId?: string;

  @ManyToOne(() => PlanPrice, { nullable: true })
  @JoinColumn({ name: "price_id" })
  price?: PlanPrice;

  @ApiProperty({
    description: "Status of the membership",
    enum: MembershipStatus,
    example: MembershipStatus.ACTIVE,
  })
  @Column({
    type: "enum",
    enum: MembershipStatus,
    default: MembershipStatus.INACTIVE,
  })
  status: MembershipStatus;

  @ApiProperty({
    description: "Boolean active flag",
    default: false,
  })
  @Column({ default: false })
  isActive: boolean;

  @ApiProperty({
    description: "Plan type (monthly, annual, quarterly, or duration level)",
    enum: PlanType,
    example: PlanType.MONTHLY,
    required: false,
  })
  @Column({ type: "enum", enum: PlanType, nullable: true })
  plan_type?: PlanType;

  @ApiProperty({
    description: "Membership start date",
    example: "2026-01-01T00:00:00Z",
  })
  @Column({ type: "timestamptz", default: () => "CURRENT_TIMESTAMP" })
  starts_at: Date;

  @ApiProperty({
    description: "Membership expiration date",
    example: "2026-04-01T00:00:00Z",
  })
  @Column({ type: "timestamptz" })
  expires_at: Date;

  @ApiProperty({
    description: "Alias for starts_at",
    required: false,
  })
  get startDate(): Date {
    return this.starts_at;
  }
  set startDate(val: Date) {
    this.starts_at = val;
  }

  @ApiProperty({
    description: "Alias for expires_at",
    required: false,
  })
  get expiresAt(): Date {
    return this.expires_at;
  }
  set expiresAt(val: Date) {
    this.expires_at = val;
  }

  @ApiProperty({
    description: "Alias for expires_at",
    required: false,
  })
  get endDate(): Date {
    return this.expires_at;
  }
  set endDate(val: Date) {
    this.expires_at = val;
  }

  @ApiProperty({
    description: "Indicates if the membership is a trial",
    example: false,
  })
  @Column({ default: false })
  is_trial: boolean;

  get isTrial(): boolean {
    return this.is_trial;
  }
  set isTrial(val: boolean) {
    this.is_trial = val;
  }

  @ApiProperty({
    description: "Seasonal variant (legacy/unused for new logic)",
    required: false,
  })
  @Column({
    type: "enum",
    enum: ["standard", "winter", "summer", "autumn", "spring"],
    default: "standard",
  })
  variant: "standard" | "winter" | "summer" | "autumn" | "spring";

  @ApiProperty({
    description: "Progression level within the tier",
    enum: ["basic", "pro", "pro_plus"],
    default: "basic",
  })
  @Column({
    type: "enum",
    enum: ["basic", "pro", "pro_plus"],
    default: "basic",
  })
  progression_level: "basic" | "pro" | "pro_plus";

  @ApiProperty({
    description: "Transaction ID associated with the membership",
    required: false,
  })
  @Column({ nullable: true })
  transaction_id: string;

  @ApiProperty({
    description: "Payment provider used",
    enum: PaymentProvider,
    required: false,
  })
  @Column({ type: "enum", enum: PaymentProvider, nullable: true })
  payment_provider: PaymentProvider;

  @ApiProperty({ description: "Foreign key linking to MembershipPayment", required: false })
  @Column({ name: "payment_id", type: "uuid", nullable: true })
  paymentId?: string;

  @ManyToOne(() => MembershipPayment, { nullable: true })
  @JoinColumn({ name: "payment_id" })
  payment?: MembershipPayment;
}
