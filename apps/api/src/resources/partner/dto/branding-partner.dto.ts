import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { Type } from "class-transformer";
import {
  IsString,
  IsOptional,
  IsBoolean,
  IsInt,
  IsEnum,
  IsNumber,
  Min,
} from "class-validator";
import {
  BrandingPartnerType,
  BrandingPartnerStatus,
} from "../entities/branding-partner.entity";

export class BrandingPermissionsDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  logo?: boolean;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  colors?: boolean;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  textLock?: boolean;
}

export class PerformanceMetricsDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsInt()
  totalUsers?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsInt()
  totalRewardsClaimed?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  revenueGenerated?: number;
}

export class CreateBrandingPartnerDto {
  @ApiProperty({ example: "GlobalBrands" })
  @IsString()
  name: string;

  @ApiProperty({ enum: BrandingPartnerType })
  @IsEnum(BrandingPartnerType)
  type: BrandingPartnerType;

  @ApiPropertyOptional({ enum: BrandingPartnerStatus })
  @IsOptional()
  @IsEnum(BrandingPartnerStatus)
  status?: BrandingPartnerStatus;

  @ApiPropertyOptional({ type: BrandingPermissionsDto })
  @IsOptional()
  brandingPermissions?: BrandingPermissionsDto;

  @ApiProperty({ example: "globalbrands" })
  @IsString()
  subdomain: string;

  @ApiPropertyOptional({ example: "https://globalbrands.example.com" })
  @IsOptional()
  @IsString()
  domainRouting?: string;

  @ApiProperty({ example: "10% Commission" })
  @IsString()
  revenueSharing: string;

  @ApiPropertyOptional({ type: PerformanceMetricsDto })
  @IsOptional()
  performanceMetrics?: PerformanceMetricsDto;
}

export class UpdateBrandingPartnerDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  name?: string;

  @ApiPropertyOptional({ enum: BrandingPartnerType })
  @IsOptional()
  @IsEnum(BrandingPartnerType)
  type?: BrandingPartnerType;

  @ApiPropertyOptional({ enum: BrandingPartnerStatus })
  @IsOptional()
  @IsEnum(BrandingPartnerStatus)
  status?: BrandingPartnerStatus;

  @ApiPropertyOptional({ type: BrandingPermissionsDto })
  @IsOptional()
  brandingPermissions?: BrandingPermissionsDto;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  subdomain?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  domainRouting?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  revenueSharing?: string;

  @ApiPropertyOptional({ type: PerformanceMetricsDto })
  @IsOptional()
  performanceMetrics?: PerformanceMetricsDto;
}

export class FilterBrandingPartnerDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  search?: string;

  @ApiPropertyOptional({ enum: BrandingPartnerType })
  @IsOptional()
  @IsEnum(BrandingPartnerType)
  type?: BrandingPartnerType;

  @ApiPropertyOptional({ enum: BrandingPartnerStatus })
  @IsOptional()
  @IsEnum(BrandingPartnerStatus)
  status?: BrandingPartnerStatus;

  @ApiPropertyOptional({ default: 1 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number;

  @ApiPropertyOptional({ default: 10 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  limit?: number;
}

export class UpdateBrandingPartnerStatusDto {
  @ApiProperty({ enum: BrandingPartnerStatus })
  @IsEnum(BrandingPartnerStatus)
  status: BrandingPartnerStatus;
}
