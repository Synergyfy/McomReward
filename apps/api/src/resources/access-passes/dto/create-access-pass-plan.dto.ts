import { ApiProperty } from "@nestjs/swagger";
import { Type } from "class-transformer";
import {
  ArrayMinSize,
  IsArray,
  IsBoolean,
  IsInt,
  IsNotEmpty,
  IsNumber,
  IsObject,
  IsOptional,
  IsString,
  Matches,
  Max,
  MaxLength,
  Min,
  MinLength,
  ValidateNested,
} from "class-validator";

export class AccessPassConfigurationDto {
  @ApiProperty({
    description: "Numeric quotas keyed by capability (use -1 for unlimited)",
    required: false,
    example: { maxActiveCampaigns: 5, monthlyPointsAllowance: 3000 },
  })
  @IsOptional()
  @IsObject()
  quotas?: Record<string, number>;

  @ApiProperty({
    description: "Boolean feature flags",
    required: false,
    example: { hasAccessToAdvancedAnalytics: true },
  })
  @IsOptional()
  @IsObject()
  featureFlags?: Record<string, boolean>;

  @ApiProperty({
    description: "Dashboard navigation items hidden for this pass",
    required: false,
    type: [String],
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  disabledNavIds?: string[];
}

export class CreateAccessPassPlanDto {
  @ApiProperty({ example: "30-Day Growth Pass" })
  @IsString()
  @IsNotEmpty()
  @MinLength(2)
  @MaxLength(80)
  name: string;

  @ApiProperty({ example: "30-day-growth-pass" })
  @IsString()
  @IsNotEmpty()
  @MaxLength(80)
  @Matches(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, {
    message: "slug must use lowercase letters, numbers and single hyphens only",
  })
  slug: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  @MaxLength(1000)
  description?: string;

  @ApiProperty({ example: 30 })
  @IsNumber({}, { message: "price must be a number" })
  @Min(0, { message: "price cannot be negative" })
  @Max(1_000_000, { message: "price must be 1,000,000 or less" })
  price: number;

  @ApiProperty({ default: "GBP", required: false })
  @IsOptional()
  @IsString()
  @MaxLength(3)
  currency?: string;

  @ApiProperty({ example: 30, description: "Days of dashboard access" })
  @IsInt()
  @Min(1)
  @Max(3650)
  durationDays: number;

  @ApiProperty({ type: [String] })
  @IsArray()
  @ArrayMinSize(1)
  @IsString({ each: true })
  @MaxLength(160, { each: true })
  features: string[];

  @ApiProperty({ required: false, type: AccessPassConfigurationDto })
  @IsOptional()
  @ValidateNested()
  @Type(() => AccessPassConfigurationDto)
  configuration?: AccessPassConfigurationDto;

  @ApiProperty({ default: true, required: false })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @ApiProperty({ default: true, required: false })
  @IsOptional()
  @IsBoolean()
  purchaseEnabled?: boolean;

  @ApiProperty({ default: true, required: false })
  @IsOptional()
  @IsBoolean()
  codeRedemptionEnabled?: boolean;
}
