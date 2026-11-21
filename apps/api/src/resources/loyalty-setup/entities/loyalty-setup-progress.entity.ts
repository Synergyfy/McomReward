import { Entity, Column, Index, ManyToOne, JoinColumn } from "typeorm";
import { ApiProperty } from "@nestjs/swagger";
import { AbstractBaseEntity } from "../../../database/entities/base.entity";
import { Business } from "../../business/entities/business.entity";

@Entity("loyalty_setup_progress")
export class LoyaltySetupProgress extends AbstractBaseEntity {
  @ApiProperty({ description: "The business this setup belongs to" })
  @Index({ unique: true })
  @Column({ name: "business_id", type: "uuid" })
  businessId: string;

  @ManyToOne(() => Business, { onDelete: "CASCADE" })
  @JoinColumn({ name: "business_id" })
  business: Business;

  @ApiProperty({ description: "Whether the welcome screen has been seen" })
  @Column({ name: "has_seen_welcome", default: false })
  hasSeenWelcome: boolean;

  @ApiProperty({
    description: "Whether the business profile intro has been seen",
  })
  @Column({ name: "has_seen_ecosystem_intro", default: false })
  hasSeenEcosystemIntro: boolean;

  @ApiProperty({ description: "Selected rewards template", required: false })
  @Column({ name: "selected_template_id", type: "uuid", nullable: true })
  selectedTemplateId: string | null;

  @ApiProperty({
    description: "Campaigns selected during setup",
    type: [Object],
  })
  @Column({ name: "selected_campaigns", type: "jsonb", default: () => "'[]'" })
  selectedCampaigns: Record<string, unknown>[];

  @ApiProperty({
    description: "Reward customisations keyed by template reward key",
  })
  @Column({
    name: "reward_customizations",
    type: "jsonb",
    default: () => "'{}'",
  })
  rewardCustomizations: Record<string, unknown>;

  @ApiProperty({ description: "Campaign descriptions keyed by campaign key" })
  @Column({
    name: "campaign_descriptions",
    type: "jsonb",
    default: () => "'{}'",
  })
  campaignDescriptions: Record<string, string>;

  @ApiProperty({ description: "Reward engine configuration", required: false })
  @Column({ name: "enabled_engines", type: "jsonb", nullable: true })
  enabledEngines: Record<string, unknown> | null;

  @ApiProperty({ description: "Customer tier configuration", required: false })
  @Column({ name: "tier_config", type: "jsonb", nullable: true })
  tierConfig: Record<string, unknown> | null;

  @ApiProperty({ description: "Whether setup has been completed" })
  @Column({ name: "has_completed_setup", default: false })
  hasCompletedSetup: boolean;

  @ApiProperty({ description: "Whether onboarding was skipped" })
  @Column({ name: "has_skipped_onboarding", default: false })
  hasSkippedOnboarding: boolean;

  @ApiProperty({ description: "When setup was completed", required: false })
  @Column({ name: "completed_at", type: "timestamp", nullable: true })
  completedAt: Date | null;
}
