import {
  Entity,
  Column,
  OneToMany,
} from "typeorm";
import { ApiProperty } from "@nestjs/swagger";
import { AbstractBaseEntity } from "../../../database/entities/base.entity";
import { PlanVariant } from "./plan-variant.entity";

export enum PlanTierLevelEnum {
  STANDARD = "STANDARD",
  PRO = "PRO",
  PRO_PLUS = "PRO_PLUS",
}

@Entity({ name: "plan_tier_levels" })
export class PlanTierLevel extends AbstractBaseEntity {
  @ApiProperty({
    description: "Standardized platform tier level duration name",
    enum: PlanTierLevelEnum,
    example: PlanTierLevelEnum.STANDARD,
  })
  @Column({
    type: "enum",
    enum: PlanTierLevelEnum,
    unique: true,
  })
  name: PlanTierLevelEnum;

  @ApiProperty({ description: "Display sort order (1 for STANDARD, 2 for PRO, 3 for PRO_PLUS)" })
  @Column({ type: "int", default: 1 })
  sortOrder: number;

  @ApiProperty({ description: "Fixed duration in days (90 for STANDARD, 180 for PRO, null for 1 calendar year)", nullable: true })
  @Column({ type: "int", nullable: true })
  durationDays: number | null;

  @ApiProperty({ description: "Flag indicating duration is exactly 1 calendar year (leap-safe)" })
  @Column({ type: "boolean", default: false })
  isCalendarYear: boolean;

  @OneToMany(() => PlanVariant, (variant) => variant.tierLevel)
  variants: PlanVariant[];
}
