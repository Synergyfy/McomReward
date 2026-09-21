import { Entity, Column, Index } from "typeorm";
import { ApiProperty } from "@nestjs/swagger";
import { AbstractBaseEntity } from "../../../database/entities/base.entity";

@Entity("loyalty_setup_templates")
export class LoyaltySetupTemplate extends AbstractBaseEntity {
  @ApiProperty({ description: "Template name" })
  @Column()
  name: string;

  @ApiProperty({ description: "Template description" })
  @Column()
  description: string;

  @ApiProperty({ description: "Sector key this template belongs to" })
  @Index()
  @Column({ name: "sector_key" })
  sectorKey: string;

  @ApiProperty({ description: "Marketing benefit bullets" })
  @Column({ type: "json", nullable: true })
  benefits: string[];

  @ApiProperty({ description: "Rewards included in the template" })
  @Column({ type: "json" })
  rewards: Record<string, unknown>[];

  @ApiProperty({ description: "Suggested campaigns" })
  @Column({ type: "json", nullable: true })
  campaigns: Record<string, unknown>[];

  @ApiProperty({ description: "Whether this is a seeded built-in template" })
  @Column({ default: false, name: "is_built_in" })
  isBuiltIn: boolean;
}
