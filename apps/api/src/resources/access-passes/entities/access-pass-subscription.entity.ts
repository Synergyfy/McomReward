import { Entity, Column, ManyToOne, JoinColumn } from "typeorm";
import { ApiProperty } from "@nestjs/swagger";
import { AbstractBaseEntity } from "../../../database/entities/base.entity";
import { Business } from "../../business/entities/business.entity";
import { PaymentProvider } from "../../payment-history/entities/payment-history.entity";
import {
  AccessPassPlan,
  AccessPassConfiguration,
} from "./access-pass-plan.entity";
import { AccessPassCode } from "./access-pass-code.entity";

export enum AccessPassSource {
  PURCHASE = "purchase",
  CODE = "code",
  ADMIN = "admin",
}

export enum AccessPassSubscriptionStatus {
  ACTIVE = "active",
  EXPIRED = "expired",
  REVOKED = "revoked",
}

/**
 * A business's granted access pass. Plan name, duration, price and capability
 * configuration are snapshotted so later admin edits can deliberately target
 * only new subscribers or also update existing ones.
 */
@Entity({ name: "access_pass_subscriptions" })
export class AccessPassSubscription extends AbstractBaseEntity {
  @ApiProperty({ description: "Business that owns this access pass" })
  @Column({ name: "business_id", type: "uuid" })
  businessId: string;

  @ManyToOne(() => Business, { onDelete: "CASCADE" })
  @JoinColumn({ name: "business_id" })
  business: Business;

  @ApiProperty({ description: "Access pass plan" })
  @Column({ name: "plan_id", type: "uuid" })
  planId: string;

  @ManyToOne(() => AccessPassPlan, (plan) => plan.subscriptions, {
    onDelete: "RESTRICT",
  })
  @JoinColumn({ name: "plan_id" })
  plan: AccessPassPlan;

  @ApiProperty({ description: "Redemption code used, if any", required: false })
  @Column({ name: "code_id", type: "uuid", nullable: true })
  codeId: string | null;

  @ManyToOne(() => AccessPassCode, { nullable: true, onDelete: "SET NULL" })
  @JoinColumn({ name: "code_id" })
  code: AccessPassCode | null;

  @ApiProperty({
    description: "How the pass was granted",
    enum: AccessPassSource,
  })
  @Column({ type: "enum", enum: AccessPassSource })
  source: AccessPassSource;

  @ApiProperty({
    description: "Current lifecycle status",
    enum: AccessPassSubscriptionStatus,
  })
  @Column({
    type: "enum",
    enum: AccessPassSubscriptionStatus,
    default: AccessPassSubscriptionStatus.ACTIVE,
  })
  status: AccessPassSubscriptionStatus;

  @ApiProperty({ description: "Access starts at" })
  @Column({ name: "starts_at", type: "timestamptz" })
  startsAt: Date;

  @ApiProperty({ description: "Access ends at" })
  @Column({ name: "expires_at", type: "timestamptz" })
  expiresAt: Date;

  @ApiProperty({ description: "Snapshotted plan name" })
  @Column({ name: "plan_name" })
  planName: string;

  @ApiProperty({ description: "Snapshotted duration in days" })
  @Column({ name: "duration_days", type: "int" })
  durationDays: number;

  @ApiProperty({
    description: "Snapshotted marketing features",
    type: [String],
  })
  @Column({ type: "jsonb", default: () => "'[]'" })
  features: string[];

  @ApiProperty({ description: "Snapshotted capability configuration" })
  @Column({ type: "jsonb", default: () => "'{}'" })
  configuration: AccessPassConfiguration;

  @ApiProperty({ description: "Snapshotted price paid" })
  @Column({ type: "decimal", precision: 10, scale: 2, default: 0 })
  price: number;

  @ApiProperty({ description: "Snapshotted currency" })
  @Column({ default: "GBP" })
  currency: string;

  @ApiProperty({ description: "Payment/checkout reference", required: false })
  @Column({ name: "transaction_id", nullable: true })
  transactionId: string | null;

  @ApiProperty({
    description: "Payment provider used for a purchase",
    enum: PaymentProvider,
    required: false,
  })
  @Column({
    name: "payment_provider",
    type: "enum",
    enum: PaymentProvider,
    nullable: true,
  })
  paymentProvider: PaymentProvider | null;

  @ApiProperty({
    description: "Admin who granted/revoked the pass",
    required: false,
  })
  @Column({ name: "granted_by_admin_id", type: "uuid", nullable: true })
  grantedByAdminId: string | null;

  @ApiProperty({ description: "Revocation timestamp", required: false })
  @Column({ name: "revoked_at", type: "timestamptz", nullable: true })
  revokedAt: Date | null;

  @ApiProperty({ description: "Reason shown to the business", required: false })
  @Column({ name: "revoked_reason", type: "text", nullable: true })
  revokedReason: string | null;

  @ApiProperty({ description: "Admin who revoked the pass", required: false })
  @Column({ name: "revoked_by_admin_id", type: "uuid", nullable: true })
  revokedByAdminId: string | null;
}
