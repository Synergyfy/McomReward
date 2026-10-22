import { IsString, IsNotEmpty, IsOptional } from "class-validator";
import { ApiProperty } from "@nestjs/swagger";

export class ConfirmPointPurchaseDto {
  @ApiProperty({
    description: "Transaction ID (PaymentIntent ID or Order ID)",
    example: "pi_1234567890",
    required: false,
  })
  @IsString()
  @IsOptional()
  transactionId?: string;

  @ApiProperty({
    description: "Payment provider",
    example: "stripe",
    enum: ["stripe", "paypal", "wallet"],
  })
  @IsString()
  @IsNotEmpty()
  provider: string;

  @ApiProperty({
    description: "Local checkout id returned by the buy/initiate call",
    required: false,
  })
  @IsString()
  @IsOptional()
  checkoutId?: string;

  @ApiProperty({
    description: "MCOM Pay charge id returned by the buy/initiate call",
    required: false,
  })
  @IsString()
  @IsOptional()
  chargeId?: string;
}
