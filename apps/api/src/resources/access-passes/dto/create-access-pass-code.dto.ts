import { ApiProperty } from "@nestjs/swagger";
import { Type } from "class-transformer";
import {
  IsBoolean,
  IsDateString,
  IsEmail,
  IsInt,
  IsOptional,
  IsString,
  IsUUID,
  Max,
  MaxLength,
  Min,
} from "class-validator";

export class CreateAccessPassCodeDto {
  @ApiProperty({ description: "Access pass plan id" })
  @IsUUID()
  planId: string;

  @ApiProperty({
    description:
      "Optional email to send the code to. When supplied the code can be locked to this account.",
    required: false,
  })
  @IsOptional()
  @IsEmail()
  email?: string;

  @ApiProperty({
    description:
      "When true only the assigned email can redeem the code. When false the recipient may give it to someone else.",
    required: false,
    default: false,
  })
  @IsOptional()
  @IsBoolean()
  restrictToAssignedUser?: boolean;

  @ApiProperty({
    description: "Optional expiry timestamp for the code itself",
    required: false,
  })
  @IsOptional()
  @IsDateString()
  expiresAt?: string;

  @ApiProperty({
    description: "How many times the code may be redeemed",
    required: false,
    default: 1,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(1000)
  maxUses?: number;

  @ApiProperty({ description: "Internal admin note", required: false })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  note?: string;

  @ApiProperty({
    description: "Queue an email to the assigned address",
    required: false,
    default: true,
  })
  @IsOptional()
  @IsBoolean()
  sendEmail?: boolean;
}
