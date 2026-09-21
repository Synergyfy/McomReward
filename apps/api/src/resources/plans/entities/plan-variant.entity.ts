import { Entity, Column, ManyToOne, OneToMany, JoinColumn } from "typeorm";
import { ApiProperty } from "@nestjs/swagger";
import { AbstractBaseEntity } from "../../../database/entities/base.entity";
import { Plan } from "./plan.entity";
import { PlanTierLevel } from "./plan-tier-level.entity";
import { PlanPrice } from "./plan-price.entity";

export interface PlanVariantConfiguration {
  quotas: {
    maxActiveCampaigns?: number;
    maxActiveRewards?: number;
    maxRewardsPerCampaign?: number;
    monthlyPointsAllowance?: number;
    monthlyStampsAllowance?: number;
    maxTeamMembers?: number;
    maxGiftCardTemplates?: number;
    maxCouponTemplates?: number;
    maxLoyaltyPrograms?: number;
    maxImagesPerListing?: number;
    featuredListingAllowance?: number;
    [key: string]: any;
  };
  featureFlags: {
    canCreateCampaignFromScratch?: boolean;
    canEditAdminTemplates?: boolean;
    hasAccessToAdvancedAnalytics?: boolean;
    hasAccessToCRM?: boolean;
    canUpdateReward?: boolean;
    priorityInSearch?: boolean;
    allowCustomBranding?: boolean;
    allowGroupCreation?: boolean;
    [key: string]: any;
  };
  disabledNavIds?: string[];
}

@Entity({ name: "plan_variants" })
export class PlanVariant extends AbstractBaseEntity {
  @ApiProperty({ description: "Foreign key linking to parent Plan family" })
  @Column({ name: "plan_id", type: "uuid" })
  planId: string;

  @ManyToOne(() => Plan, (plan) => plan.variants, { onDelete: "CASCADE" })
  @JoinColumn({ name: "plan_id" })
  plan: Plan;

  @ApiProperty({ description: "Foreign key linking to PlanTierLevel" })
  @Column({ name: "tier_level_id", type: "uuid" })
  tierLevelId: string;

  @ManyToOne(() => PlanTierLevel, (level) => level.variants, { eager: true })
  @JoinColumn({ name: "tier_level_id" })
  tierLevel: PlanTierLevel;

  @ApiProperty({ description: "Whether this variant is active and sellable" })
  @Column({ default: true })
  isActive: boolean;

  @ApiProperty({
    description: "Marketing bullet points for buyers",
    type: [String],
  })
  @Column({ type: "jsonb", default: [] })
  features: string[];

  @ApiProperty({
    description: "Enforced capability limits (quotas) and feature flags",
  })
  @Column({ type: "jsonb", default: {} })
  configuration: PlanVariantConfiguration;

  @OneToMany(() => PlanPrice, (price) => price.planVariant, {
    cascade: true,
  })
  prices: PlanPrice[];
}
