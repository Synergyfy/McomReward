import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty, IsOptional, IsString } from "class-validator";

export class ConfirmPlatformPurchaseDto {
  @ApiProperty({ description: "The plan or tier ID on Rewards platform" })
  @IsString()
  @IsNotEmpty()
  externalPlanId: string;

  @ApiProperty({
    description: "Billing cycle (monthly, quarterly, annual)",
    default: "monthly",
  })
  @IsString()
  @IsNotEmpty()
  billingCycle: string;

  @ApiProperty({
    description: "Stripe PaymentIntent ID (pi_...)",
    required: false,
  })
  @IsString()
  @IsOptional()
  paymentIntentId?: string;

  @ApiProperty({
    description: "Stripe SetupIntent ID (seti_...)",
    required: false,
  })
  @IsString()
  @IsOptional()
  setupIntentId?: string;

  @ApiProperty({ description: "PayPal Order ID for capture", required: false })
  @IsString()
  @IsOptional()
  orderId?: string;

  @ApiProperty({
    description: "Payment provider (stripe, paypal, wallet)",
    default: "stripe",
    required: false,
  })
  @IsString()
  @IsOptional()
  provider?: string;

  @ApiProperty({
    description: "Wallet hold ID from initiate step (wallet rail)",
    required: false,
  })
  @IsString()
  @IsOptional()
  holdId?: string;
}
