import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import {
  IsArray,
  IsBoolean,
  IsObject,
  IsOptional,
  IsString,
} from "class-validator";

export class TemplateRewardDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  id?: string;

  @ApiProperty()
  @IsString()
  key: string;

  @ApiProperty()
  @IsString()
  name: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  rewardType?: string;

  @ApiPropertyOptional()
  @IsOptional()
  pointsRequired?: number;

  @ApiPropertyOptional()
  @IsOptional()
  stampsRequired?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  image?: string;
}

export class TemplateCampaignDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  id?: string;

  @ApiProperty()
  @IsString()
  key: string;

  @ApiProperty()
  @IsString()
  name: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({ type: [String] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  includedRewardKeys?: string[];
}

export class CreateLoyaltySetupTemplateDto {
  @ApiProperty()
  @IsString()
  name: string;

  @ApiProperty()
  @IsString()
  description: string;

  @ApiProperty()
  @IsString()
  sectorKey: string;

  @ApiPropertyOptional({ type: [String] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  benefits?: string[];

  @ApiProperty({ type: [Object] })
  @IsArray()
  @IsObject({ each: true })
  rewards: Record<string, unknown>[];

  @ApiPropertyOptional({ type: [Object] })
  @IsOptional()
  @IsArray()
  @IsObject({ each: true })
  campaigns?: Record<string, unknown>[];
}

export class UpdateLoyaltySetupTemplateDto extends CreateLoyaltySetupTemplateDto {}

export class CreateLoyaltySetupTemplateInternalDto {
  name: string;
  description: string;
  sectorKey: string;
  benefits?: string[];
  rewards: Record<string, unknown>[];
  campaigns?: Record<string, unknown>[];
  isBuiltIn?: boolean;
}