import { ApiPropertyOptional } from "@nestjs/swagger";
import { IsOptional, IsString, Matches, MaxLength } from "class-validator";

export class RefundPaymentDto {
  @ApiPropertyOptional({
    description:
      "Amount to refund in minor units (pence). Omit for a full refund.",
    example: "10270",
  })
  @IsOptional()
  @IsString()
  @Matches(/^[1-9]\d*$/, {
    message: "amountMinor must be a positive integer string in minor units",
  })
  amountMinor?: string;

  @ApiPropertyOptional({ description: "Why the charge is being refunded" })
  @IsOptional()
  @IsString()
  @MaxLength(255)
  reason?: string;
}
