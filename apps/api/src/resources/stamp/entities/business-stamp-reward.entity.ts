import { Entity, Column, ManyToOne, JoinColumn, OneToMany } from "typeorm";
import { ApiProperty } from "@nestjs/swagger";
import { AbstractBaseEntity } from "../../../database/entities/base.entity";
import { StampRewardTemplate } from "./stamp-reward-template.entity";
import { Business } from "../../business/entities/business.entity";
import { StampCard } from "./stamp-card.entity";

@Entity("business_stamp_rewards")
export class BusinessStampReward extends AbstractBaseEntity {
  @ApiProperty({
    description: "Custom image override for the reward",
    required: false,
  })
  @Column({ nullable: true })
  custom_image: string;

  @ApiProperty({ description: "Operating hours string", required: false })
  @Column({ nullable: true })
  operating_hours: string;

  @ApiProperty({
    description: "Whether this activation is active (not paused)",
  })
  @Column({ default: true })
  is_active: boolean;

  @ApiProperty({ description: "Total participants enrolled in this reward" })
  @Column({ type: "int", default: 0 })
  total_enrolled: number;

  @ApiProperty({ description: "Total completed cards" })
  @Column({ type: "int", default: 0 })
  total_completions: number;

  @ApiProperty({ description: "Total redeemed rewards" })
  @Column({ type: "int", default: 0 })
  total_redemptions: number;

  @ManyToOne(
    () => StampRewardTemplate,
    (template) => template.businessStampRewards,
  )
  @JoinColumn({ name: "templateId" })
  template: StampRewardTemplate;

  @ManyToOne(() => Business)
  @JoinColumn({ name: "businessId" })
  business: Business;

  @OneToMany(() => StampCard, (stampCard) => stampCard.businessStampReward)
  stampCards: StampCard[];
}
