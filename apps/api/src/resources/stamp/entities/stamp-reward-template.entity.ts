import { Entity, Column, OneToMany } from "typeorm";
import { ApiProperty } from "@nestjs/swagger";
import { AbstractBaseEntity } from "../../../database/entities/base.entity";
import { StampRewardType } from "../enums/stamp-reward-type.enum";
import { StampTriggerMethod } from "../enums/stamp-trigger-method.enum";
import { BusinessStampReward } from "./business-stamp-reward.entity";

@Entity("stamp_reward_templates")
export class StampRewardTemplate extends AbstractBaseEntity {
  @ApiProperty({ description: "Title of the stamp reward template" })
  @Column()
  title: string;

  @ApiProperty({ description: "Description of the stamp reward template" })
  @Column()
  description: string;

  @ApiProperty({
    description: "Number of stamps required to unlock the reward",
  })
  @Column({ type: "int" })
  required_stamps: number;

  @ApiProperty({ enum: StampRewardType })
  @Column({ type: "enum", enum: StampRewardType })
  reward_benefit: StampRewardType;

  @ApiProperty({
    description: "Value text of the reward benefit",
    required: false,
  })
  @Column({ nullable: true })
  reward_benefit_value: string;

  @ApiProperty({ enum: StampTriggerMethod })
  @Column({ type: "enum", enum: StampTriggerMethod })
  trigger_method: StampTriggerMethod;

  @ApiProperty({ description: "Days valid after start", required: false })
  @Column({ type: "int", nullable: true })
  stamp_validity_days: number;

  @ApiProperty({
    description: "Days to redeem after completion",
    required: false,
  })
  @Column({ type: "int", nullable: true })
  reward_claim_deadline_days: number;

  @ApiProperty({
    description: "Whether the reward is hybrid (stamps + points)",
  })
  @Column({ default: false })
  is_hybrid: boolean;

  @ApiProperty({ description: "Hybrid points earned per stamp" })
  @Column({ type: "int", default: 0 })
  hybrid_points_per_stamp: number;

  @ApiProperty({ description: "Hybrid bonus points on card completion" })
  @Column({ type: "int", default: 0 })
  hybrid_completion_bonus_points: number;

  @ApiProperty({
    description: "Whether the template is published (available to businesses)",
  })
  @Column({ default: false })
  is_published: boolean;

  @ApiProperty({ description: "Whether the template is archived" })
  @Column({ default: false })
  is_archived: boolean;

  @ApiProperty({
    description: "Default image for the template",
    required: false,
  })
  @Column({ nullable: true })
  default_image: string;

  @OneToMany(
    () => BusinessStampReward,
    (businessStampReward) => businessStampReward.template,
  )
  businessStampRewards: BusinessStampReward[];
}
