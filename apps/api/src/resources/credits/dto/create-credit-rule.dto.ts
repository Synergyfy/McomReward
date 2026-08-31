import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import {
  IsArray,
  IsBoolean,
  IsEnum,
  IsInt,
  IsNumber,
  IsOptional,
  IsString,
} from "class-validator";
import { CreditsPlatform, CreditsRewardType } from "../entities/credits.enums";

export class CreateCreditRuleDto {
  @ApiProperty({ enum: CreditsPlatform })
  @IsEnum(CreditsPlatform)
  platform: CreditsPlatform;

  @ApiProperty({ type: [String] })
  @IsArray()
  @IsString({ each: true })
  eventType: string[];

  @ApiProperty({ enum: CreditsRewardType })
  @IsEnum(CreditsRewardType)
  rewardType: CreditsRewardType;

  @ApiProperty()
  @IsNumber()
  rewardValue: number;

  @ApiPropertyOptional({ default: true })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @ApiPropertyOptional()
  @IsOptional()
  @IsInt()
  level?: number;
}