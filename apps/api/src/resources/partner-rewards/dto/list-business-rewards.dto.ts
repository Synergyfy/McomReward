import { Type } from "class-transformer";
import {
  IsEmail,
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
import { RewardStatus } from "../../rewards/enums/reward-status.enum";

/**
 * Query for listing the rewards a specific business owns. Identify the business
 * by its MCOM user id (preferred) or email.
 */
export class ListBusinessRewardsDto {
  @ApiPropertyOptional({ description: "MCOM Central user id of the business" })
  @IsOptional()
  @IsString()
  @MaxLength(200)
  mcomUserId?: string;

  @ApiPropertyOptional({ description: "Fallback business email" })
  @IsOptional()
  @IsEmail()
  email?: string;

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

  @ApiPropertyOptional({ enum: RewardStatus })
  @IsOptional()
  @IsEnum(RewardStatus)
  status?: RewardStatus;

  @ApiPropertyOptional({ enum: RewardType })
  @IsOptional()
  @IsEnum(RewardType)
  rewardType?: RewardType;
}
