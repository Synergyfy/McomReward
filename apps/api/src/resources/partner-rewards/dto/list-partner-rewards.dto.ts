import { Type } from "class-transformer";
import {
  IsEnum,
  IsInt,
  IsOptional,
  IsString,
  Max,
  MaxLength,
  Min,
} from "class-validator";
import { ApiPropertyOptional } from "@nestjs/swagger";
import { RewardType } from "../../rewards/enums/reward-type.enum";
import { RewardAudience } from "../../rewards/enums/reward-audience.enum";
import { RewardSource } from "../../rewards/enums/reward-source.enum";

export class ListPartnerRewardsDto {
  @ApiPropertyOptional({ default: 1 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page: number = 1;

  @ApiPropertyOptional({ default: 20, maximum: 100 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  limit: number = 20;

  @ApiPropertyOptional({ description: "Free-text search on title/description" })
  @IsOptional()
  @IsString()
  @MaxLength(200)
  search?: string;

  @ApiPropertyOptional({ enum: RewardType })
  @IsOptional()
  @IsEnum(RewardType)
  rewardType?: RewardType;

  @ApiPropertyOptional({ enum: RewardAudience })
  @IsOptional()
  @IsEnum(RewardAudience)
  audience?: RewardAudience;

  @ApiPropertyOptional({
    enum: RewardSource,
    description:
      "Filter by reward source. Use `mcom vault` to list only rewards created by the MCOM admin.",
  })
  @IsOptional()
  @IsEnum(RewardSource)
  source?: RewardSource;
}
