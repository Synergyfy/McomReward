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
import { RewardIssuanceStatus } from "../enums/partner-reward.enums";

export class ListIssuancesDto {
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

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(200)
  externalRef?: string;

  @ApiPropertyOptional({ enum: RewardIssuanceStatus })
  @IsOptional()
  @IsEnum(RewardIssuanceStatus)
  status?: RewardIssuanceStatus;

  @ApiPropertyOptional({
    description: "Filter to a specific recipient email (app-level tokens only)",
  })
  @IsOptional()
  @IsString()
  @MaxLength(200)
  recipientEmail?: string;

  @ApiPropertyOptional({
    description:
      "Filter to a specific recipient MCOM user id (app-level tokens only)",
  })
  @IsOptional()
  @IsString()
  @MaxLength(200)
  recipientMcomUserId?: string;

  @ApiPropertyOptional({
    description:
      "Filter to a specific resolved local user id (app-level tokens only)",
  })
  @IsOptional()
  @IsString()
  @MaxLength(200)
  recipientUserId?: string;
}
