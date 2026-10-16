import { Type } from "class-transformer";
import {
  IsEmail,
  IsInt,
  IsISO8601,
  IsObject,
  IsOptional,
  IsString,
  MaxLength,
  Min,
  Validate,
  ValidateNested,
  ValidationArguments,
  ValidatorConstraint,
  ValidatorConstraintInterface,
} from "class-validator";
import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";

/** Requires at least one of `mcomUserId` / `email` on the business identity. */
@ValidatorConstraint({ name: "atLeastOneBusinessIdentifier", async: false })
export class AtLeastOneBusinessIdentifierConstraint implements ValidatorConstraintInterface {
  validate(value: any): boolean {
    if (!value || typeof value !== "object") return false;
    return Boolean(
      (typeof value.mcomUserId === "string" && value.mcomUserId.trim()) ||
      (typeof value.email === "string" && value.email.trim()),
    );
  }

  defaultMessage(args: ValidationArguments): string {
    return `${args.property} must include at least one of "mcomUserId" or "email"`;
  }
}

/**
 * The business on whose behalf the reward is issued. Its MCOM entitlement
 * (active subscription, valid trial, or MCOM Rewards included in its MCOM
 * membership package) is verified before issuance.
 */
export class IssuingBusinessDto {
  @ApiPropertyOptional({
    description: "MCOM Central user id of the issuing business (preferred)",
    example: "6f2c…",
  })
  @IsOptional()
  @IsString()
  @MaxLength(200)
  mcomUserId?: string;

  @ApiPropertyOptional({
    description: "Fallback business email when mcomUserId is unknown",
    example: "shop@example.com",
  })
  @IsOptional()
  @IsEmail()
  email?: string;
}

export class IssueRewardRecipientDto {
  @ApiProperty({ example: "donor@example.com" })
  @IsEmail()
  email: string;

  @ApiPropertyOptional({
    description: "MCOM Central user id (preferred identity match)",
  })
  @IsOptional()
  @IsString()
  @MaxLength(200)
  mcomUserId?: string;

  @ApiPropertyOptional({ example: "Jane Doe" })
  @IsOptional()
  @IsString()
  @MaxLength(200)
  name?: string;
}

export class IssueRewardDto {
  @ApiProperty({
    type: IssuingBusinessDto,
    description:
      "The business issuing the reward (must be entitled: subscription, trial, or MCOM Rewards in its membership).",
  })
  @ValidateNested()
  @Type(() => IssuingBusinessDto)
  @Validate(AtLeastOneBusinessIdentifierConstraint)
  business: IssuingBusinessDto;

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
