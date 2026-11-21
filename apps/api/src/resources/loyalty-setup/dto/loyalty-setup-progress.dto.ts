import { ApiPropertyOptional } from "@nestjs/swagger";
import {
  IsArray,
  IsBoolean,
  IsObject,
  IsOptional,
  IsString,
} from "class-validator";

export class UpdateLoyaltySetupProgressDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  hasSeenWelcome?: boolean;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  hasSeenEcosystemIntro?: boolean;

  @ApiPropertyOptional({ nullable: true })
  @IsOptional()
  @IsString()
  selectedTemplateId?: string | null;

  @ApiPropertyOptional({ type: [Object] })
  @IsOptional()
  @IsArray()
  selectedCampaigns?: Record<string, unknown>[];

  @ApiPropertyOptional({ type: Object })
  @IsOptional()
  @IsObject()
  rewardCustomizations?: Record<string, unknown>;

  @ApiPropertyOptional({ type: Object })
  @IsOptional()
  @IsObject()
  campaignDescriptions?: Record<string, string>;

  @ApiPropertyOptional({ type: Object, nullable: true })
  @IsOptional()
  @IsObject()
  enabledEngines?: Record<string, unknown> | null;

  @ApiPropertyOptional({ type: Object, nullable: true })
  @IsOptional()
  @IsObject()
  tierConfig?: Record<string, unknown> | null;
}

export class CompleteLoyaltySetupDto extends UpdateLoyaltySetupProgressDto {}
