import { Type } from "class-transformer";
import {
  IsISO8601,
  IsInt,
  IsObject,
  IsOptional,
  IsString,
  MaxLength,
  Min,
  ValidateNested,
} from "class-validator";
import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { IssueRewardRecipientDto } from "./issue-reward.dto";

/**
 * Issue a reward that a business owns (`BusinessReward`) to a recipient.
 * The owning business is derived from the business reward, so it is not part of
 * the body.
 */
export class IssueBusinessRewardDto {
  @ApiProperty({ type: IssueRewardRecipientDto })
  @ValidateNested()
  @Type(() => IssueRewardRecipientDto)
  recipient: IssueRewardRecipientDto;

  @ApiPropertyOptional({ default: 1, minimum: 1 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  quantity?: number;

  @ApiPropertyOptional({
    description:
      "Caller-supplied idempotency key. Repeated calls with the same key return the original issuance.",
  })
  @IsOptional()
  @IsString()
  @MaxLength(200)
  idempotencyKey?: string;

  @ApiPropertyOptional({
    description: "Caller-side reference (campaign id, reward config id, …)",
  })
  @IsOptional()
  @IsString()
  @MaxLength(200)
  externalRef?: string;

  @ApiPropertyOptional({ description: "ISO-8601 expiry for this issuance" })
  @IsOptional()
  @IsISO8601()
  expiresAt?: string;

  @ApiPropertyOptional({ description: "Free-form metadata echoed back" })
  @IsOptional()
  @IsObject()
  metadata?: Record<string, any>;
}
