import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { Type } from "class-transformer";
import {
  IsNumber,
  IsObject,
  IsOptional,
  IsPositive,
  IsString,
  MaxLength,
} from "class-validator";

export class PlaceWalletHoldDto {
  @ApiProperty({ description: "Amount in GBP (major units)", example: 25.5 })
  @Type(() => Number)
  @IsNumber({ maxDecimalPlaces: 2 })
  @IsPositive()
  amount: number;

  @ApiPropertyOptional({ description: "Why the funds are being reserved" })
  @IsOptional()
  @IsString()
  @MaxLength(255)
  description?: string;

  @ApiPropertyOptional({ description: "Your internal reference" })
  @IsOptional()
  @IsString()
  @MaxLength(255)
  reference?: string;

  @ApiPropertyOptional({ description: "Arbitrary metadata" })
  @IsOptional()
  @IsObject()
  metadata?: Record<string, unknown>;

  @ApiPropertyOptional({ description: "Optional idempotency key" })
  @IsOptional()
  @IsString()
  @MaxLength(255)
  idempotencyKey?: string;
}

/**
 * Capture consumes the full held amount — the partner API accepts only
 * `holdId` in the body, so this DTO intentionally exposes no amount.
 */
export class CaptureWalletHoldDto {
  @ApiPropertyOptional({ description: "Optional idempotency key" })
  @IsOptional()
  @IsString()
  @MaxLength(255)
  idempotencyKey?: string;
}

/** Release returns the whole hold; the partner API body is just `{ holdId }`. */
export class ReleaseWalletHoldDto {
  @ApiPropertyOptional({ description: "Optional idempotency key" })
  @IsOptional()
  @IsString()
  @MaxLength(255)
  idempotencyKey?: string;
}
