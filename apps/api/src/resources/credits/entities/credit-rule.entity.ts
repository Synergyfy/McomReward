import { Entity, Column, Index } from "typeorm";
import { ApiProperty } from "@nestjs/swagger";
import { AbstractBaseEntity } from "../../../database/entities/base.entity";
import { CreditsPlatform, CreditsRewardType } from "./credits.enums";

@Entity("credit_rules")
export class CreditRule extends AbstractBaseEntity {
  @ApiProperty({ description: "Platform the rule applies to" })
  @Column({ type: "enum", enum: CreditsPlatform })
  platform: CreditsPlatform;

  @ApiProperty({ description: "Event type that earns credits" })
  @Index()
  @Column({ name: "event_type" })
  eventType: string;

  @ApiProperty({ enum: CreditsRewardType })
  @Column({ type: "enum", enum: CreditsRewardType, name: "reward_type" })
  rewardType: CreditsRewardType;

  @ApiProperty({ description: "Reward value (percentage or fixed credits)" })
  @Column({ type: "float", name: "reward_value" })
  rewardValue: number;

  @ApiProperty({ description: "Optional credit level this rule maps to" })
  @Column({ type: "int", nullable: true })
  level: number;

  @ApiProperty({ description: "Whether the rule is active" })
  @Column({ default: true, name: "is_active" })
  isActive: boolean;
}