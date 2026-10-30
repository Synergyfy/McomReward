import { IsOptional, IsString, MaxLength } from "class-validator";
import { ApiPropertyOptional } from "@nestjs/swagger";

export class RedeemIssuanceDto {
  @ApiPropertyOptional({
    description:
      "Optional redemption code to validate against the issuance before redeeming.",
  })
  @IsOptional()
  @IsString()
  @MaxLength(200)
  code?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(500)
  note?: string;

  /**
   * Instrument kind (GIFT_CARD | VOUCHER | COUPON) sent by the redeeming peer
   * for audit. It is recorded on the issuance metadata and never used to make
   * behavioural decisions.
   *
   * Optional because the contract predates it; the global validation pipe
   * rejects unknown properties, so peers that do send it must be tolerated.
   */
  @ApiPropertyOptional({ example: 'VOUCHER' })
  @IsOptional()
  @IsString()
  @MaxLength(32)
  instrumentType?: string;
}

export class RevokeIssuanceDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(500)
  reason?: string;
}
