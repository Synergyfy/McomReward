import { ApiProperty } from "@nestjs/swagger";
import { IsIn, IsOptional, IsString, IsUUID, MaxLength } from "class-validator";

export const ACCESS_PASS_PAYMENT_PROVIDERS = [
  "stripe",
  "paypal",
  "wallet",
  "mcom_wallet",
] as const;

export class InitiateAccessPassPurchaseDto {
  @ApiProperty({ description: "Access pass plan id" })
  @IsUUID()
  planId: string;

  @ApiProperty({ enum: ACCESS_PASS_PAYMENT_PROVIDERS })
  @IsIn(ACCESS_PASS_PAYMENT_PROVIDERS as unknown as string[])
  provider: string;

  @ApiProperty({
    description: "Client-generated idempotent checkout id",
    required: false,
  })
  @IsOptional()
  @IsString()
  @MaxLength(120)
  checkoutId?: string;
}
