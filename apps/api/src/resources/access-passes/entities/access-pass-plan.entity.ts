import { Entity, Column, OneToMany } from "typeorm";
import { ApiProperty } from "@nestjs/swagger";
import { AbstractBaseEntity } from "../../../database/entities/base.entity";
import { AccessPassCode } from "./access-pass-code.entity";
import { AccessPassSubscription } from "./access-pass-subscription.entity";

export interface AccessPassConfiguration {
  quotas?: Record<string, number>;
  featureFlags?: Record<string, boolean>;
  disabledNavIds?: string[];
}

/**
 * A standalone access pass product. Unlike subscription plans it has no
 * Standard/Pro/Pro+ variants — admins define one price, one duration and one
 * feature/limit configuration per product.
 */
@Entity({ name: "access_pass_plans" })
export class AccessPassPlan extends AbstractBaseEntity {
  @ApiProperty({ description: "Display name of the access pass" })
  @Column()
  name: string;

  @ApiProperty({ description: "URL-friendly unique slug" })
  @Column({ unique: true })
  slug: string;

  @ApiProperty({ description: "Commercial description", required: false })
  @Column({ type: "text", nullable: true })
  description: string | null;

  @ApiProperty({ description: "One-off price for this access pass" })
  @Column({ type: "decimal", precision: 10, scale: 2, default: 0 })
  price: number;

  @ApiProperty({ description: "ISO currency code", default: "GBP" })
  @Column({ default: "GBP" })
  currency: string;

  @ApiProperty({ description: "Number of days of dashboard access" })
  @Column({ name: "duration_days", type: "int" })
  durationDays: number;

  @ApiProperty({ description: "Marketing bullet points", type: [String] })
  @Column({ type: "jsonb", default: () => "'[]'" })
  features: string[];

  @ApiProperty({
    description: "Enforced capability quotas and feature flags",
  })
  @Column({ type: "jsonb", default: () => "'{}'" })
  configuration: AccessPassConfiguration;

  @ApiProperty({ description: "Whether the pass is available", default: true })
  @Column({ name: "is_active", default: true })
  isActive: boolean;

  @ApiProperty({
    description: "Whether businesses can buy this pass with money",
    default: true,
  })
  @Column({ name: "purchase_enabled", default: true })
  purchaseEnabled: boolean;

  @ApiProperty({
    description: "Whether access codes can be redeemed for this pass",
    default: true,
  })
  @Column({ name: "code_redemption_enabled", default: true })
  codeRedemptionEnabled: boolean;

  @OneToMany(() => AccessPassCode, (code) => code.plan)
  codes: AccessPassCode[];

  @OneToMany(() => AccessPassSubscription, (subscription) => subscription.plan)
  subscriptions: AccessPassSubscription[];
}
