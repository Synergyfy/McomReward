import {
  IsObject,
  IsOptional,
  IsString,
  MaxLength,
} from "class-validator";
import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";

/**
 * Mall → Rewards reservation request. `orderRef` is
 * `mall-order-<uuid>` (product order) or `booking:<bookingId>:<uuid>`
 * (service booking); `idempotencyKey` is `<orderRef>:<issuanceId>`.
 */
export class ReserveIssuanceDto {
  @ApiProperty({ example: "mall-order-8f2c1e..." })
  @IsString()
  @MaxLength(200)
  orderRef: string;

  @ApiProperty({ example: "mall-order-8f2c1e...:<issuanceId>" })
  @IsString()
  @MaxLength(200)
  idempotencyKey: string;

  @ApiPropertyOptional({
    description: "Checkout metadata echoed back for audit.",
    example: { discountAmount: 20, targetId: "prod-uuid" },
  })
  @IsOptional()
  @IsObject()
  metadata?: Record<string, any>;
}

export class CommitIssuanceDto {
  @ApiPropertyOptional({ example: "mall-order-8f2c1e..." })
  @IsOptional()
  @IsString()
  @MaxLength(200)
  orderRef?: string;

  @ApiPropertyOptional({ example: "Mall order paid" })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  note?: string;
}

export class ReleaseIssuanceDto {
  @ApiProperty({ example: "mall-order-8f2c1e..." })
  @IsString()
  @MaxLength(200)
  orderRef: string;

  @ApiPropertyOptional({
    description: "e.g. payment_failed, stale_checkout_reservation",
  })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  reason?: string;
}
