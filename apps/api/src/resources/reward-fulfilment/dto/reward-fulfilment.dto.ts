import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { Type } from "class-transformer";
import {
  IsArray,
  IsEnum,
  IsIn,
  IsInt,
  IsNumber,
  IsObject,
  IsOptional,
  IsString,
  Max,
  Min,
  ValidateNested,
} from "class-validator";
import {
  FulfilmentFundingSource,
  FulfilmentKind,
  FulfilmentProvider,
} from "../reward-fulfilment.enums";

export class RewardFulfilmentScopeDto {
  @ApiPropertyOptional({ enum: ["ALL", "LISTINGS", "ITEMS", "NO_SCOPE"] })
  @IsOptional()
  @IsIn(["ALL", "LISTINGS", "ITEMS", "NO_SCOPE"])
  mode?: "ALL" | "LISTINGS" | "ITEMS" | "NO_SCOPE";

  @ApiPropertyOptional({ type: [String] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  listingIds?: string[];

  @ApiPropertyOptional({ type: [String] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  productIds?: string[];

  @ApiPropertyOptional({ type: [String] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  serviceIds?: string[];

  @ApiPropertyOptional({ type: [String] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  planIds?: string[];

  @ApiPropertyOptional({ type: [String] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  accessPlanIds?: string[];
}

export class RewardFulfilmentValueDto {
  @ApiPropertyOptional({ example: 30 })
  @IsOptional()
  @IsNumber()
  amount?: number;

  @ApiPropertyOptional({ example: "GBP" })
  @IsOptional()
  @IsString()
  currency?: string;

  @ApiPropertyOptional({ enum: ["percentage", "fixed", "PERCENTAGE", "FIXED"] })
  @IsOptional()
  @IsIn(["percentage", "fixed", "PERCENTAGE", "FIXED"])
  discountType?: "percentage" | "fixed" | "PERCENTAGE" | "FIXED";

  @ApiPropertyOptional({ example: 20 })
  @IsOptional()
  @IsNumber()
  discountValue?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  maxDiscount?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  minSpend?: number;
}

export class RewardFulfilmentGrantDto {
  @ApiPropertyOptional({ description: "Central membership/access plan id" })
  @IsOptional()
  @IsString()
  planId?: string;

  @ApiPropertyOptional({ enum: ["Standard", "Pro", "Pro+"] })
  @IsOptional()
  @IsString()
  tier?: string;

  @ApiPropertyOptional({ example: 365 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  durationDays?: number;

  @ApiPropertyOptional({ default: true })
  @IsOptional()
  extendExisting?: boolean;

  @ApiPropertyOptional({ default: false })
  @IsOptional()
  replaceExisting?: boolean;
}

export class RewardFulfilmentConfigDto {
  @ApiProperty({ enum: FulfilmentProvider })
  @IsEnum(FulfilmentProvider)
  provider: FulfilmentProvider;

  @ApiProperty({ enum: FulfilmentKind })
  @IsEnum(FulfilmentKind)
  kind: FulfilmentKind;

  @ApiPropertyOptional({ enum: ["CODE", "DIRECT_GRANT", "CHECKOUT_APPLY"] })
  @IsOptional()
  @IsString()
  delivery?: "CODE" | "DIRECT_GRANT" | "CHECKOUT_APPLY";

  @ApiPropertyOptional()
  @IsOptional()
  @IsObject()
  templateRef?: { system: "MALL" | "CENTRAL"; id: string } | null;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  businessId?: string | null;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  businessMcomUserId?: string | null;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  businessName?: string | null;

  @ApiPropertyOptional({ type: RewardFulfilmentScopeDto })
  @IsOptional()
  @ValidateNested()
  @Type(() => RewardFulfilmentScopeDto)
  scope?: RewardFulfilmentScopeDto | null;

  @ApiPropertyOptional({ type: RewardFulfilmentValueDto })
  @IsOptional()
  @ValidateNested()
  @Type(() => RewardFulfilmentValueDto)
  value?: RewardFulfilmentValueDto | null;

  @ApiPropertyOptional()
  @IsOptional()
  @IsObject()
  validity?: { expiresInDays?: number; expiresAt?: string } | null;

  @ApiPropertyOptional({ type: RewardFulfilmentGrantDto })
  @IsOptional()
  @ValidateNested()
  @Type(() => RewardFulfilmentGrantDto)
  grant?: RewardFulfilmentGrantDto | null;

  @ApiPropertyOptional()
  @IsOptional()
  @IsObject()
  coupon?: Record<string, any> | null;

  @ApiPropertyOptional()
  @IsOptional()
  @IsObject()
  metadata?: Record<string, any> | null;

  @ApiPropertyOptional({ enum: FulfilmentFundingSource })
  @IsOptional()
  @IsEnum(FulfilmentFundingSource)
  fundingSource?: FulfilmentFundingSource;
}

export class ListFulfilmentsQueryDto {
  @ApiPropertyOptional({ default: 1 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number = 1;

  @ApiPropertyOptional({ default: 20 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  limit?: number = 20;
}
