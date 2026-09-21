import { Entity, Column, OneToMany } from "typeorm";
import { ApiProperty } from "@nestjs/swagger";
import { AbstractBaseEntity } from "../../../database/entities/base.entity";
import { PlanVariant } from "./plan-variant.entity";

@Entity({ name: "plans" })
export class Plan extends AbstractBaseEntity {
  @ApiProperty({
    description:
      "Display name of the plan family (e.g. Starter, Bronze, Silver, Gold)",
  })
  @Column()
  name: string;

  @ApiProperty({ description: "URL-friendly unique slug for the plan family" })
  @Column({ unique: true })
  slug: string;

  @ApiProperty({
    description: "Commercial description of the plan family",
    required: false,
  })
  @Column({ type: "text", nullable: true })
  description: string;

  @ApiProperty({
    description: "Whether this plan family is active and available",
  })
  @Column({ default: true })
  isActive: boolean;

  @OneToMany(() => PlanVariant, (variant) => variant.plan, {
    cascade: true,
  })
  variants: PlanVariant[];
}
