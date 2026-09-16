import { ApiProperty } from "@nestjs/swagger";
import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsBoolean,
  IsArray,
  ValidateNested,
  IsEnum,
  IsNumber,
  Min,
} from "class-validator";
import { Type } from "class-transformer";
import { PlanTierLevelEnum } from "../entities/plan-tier-level.entity";
import { PlanVariantConfiguration } from "../entities/plan-variant.entity";

export class CreatePlanVariantDto {
  @ApiProperty({
    description: "Tier level name for this variant",
    enum: PlanTierLevelEnum,
    example: PlanTierLevelEnum.STANDARD,
  })
  @IsEnum(PlanTierLevelEnum)
  @IsNotEmpty()
  tier: PlanTierLevelEnum;

  @ApiProperty({ description: "One-off price amount in GBP for this variant duration", example: 49.99 })
  @IsNumber()
  @Min(0)
  price: number;

  @ApiProperty({ description: "Marketing bullet points", type: [String] })
  @IsArray()
  @IsString({ each: true })
  features: string[];

  @ApiProperty({ description: "Enforced capabilities quotas and feature flags" })
  @IsOptional()
  configuration?: PlanVariantConfiguration;
}

export class CreatePlanDto {
  @ApiProperty({ description: "Plan family name (e.g. Starter, Gold)", example: "Gold Plan" })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({ description: "URL safe slug", example: "gold-plan" })
  @IsString()
  @IsNotEmpty()
  slug: string;

  @ApiProperty({ description: "Plan description", required: false })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiProperty({ description: "Active status", default: true })
  @IsBoolean()
  @IsOptional()
  isActive?: boolean;

  @ApiProperty({
    description: "Exactly 3 variants corresponding to STANDARD, PRO, PRO_PLUS",
    type: [CreatePlanVariantDto],
  })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreatePlanVariantDto)
  variants: CreatePlanVariantDto[];
}
