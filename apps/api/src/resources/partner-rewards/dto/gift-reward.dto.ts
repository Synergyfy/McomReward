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
 * Platform-sponsored gift.
 *
 * An ecosystem **admin** (e.g. FundOrDonate's back office) grants an MCOM
 * admin-created catalogue reward directly to an MCOM user. Unlike
 * `IssueRewardDto` there is no sponsoring `business` — the reward is issued on
 * the platform's behalf, so no business entitlement is checked. The recipient
 * must resolve to a local MCOM account.
 */
export class GiftRewardDto {
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
