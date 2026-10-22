import { ApiProperty } from "@nestjs/swagger";
import { IsOptional, IsString } from "class-validator";

export class ConfirmPlatformPurchaseDto {
  @ApiProperty({
    description: "The plan or tier ID on Rewards platform",
    required: false,
  })
  @IsString()
  @IsOptional()
  externalPlanId?: string;

  @ApiProperty({
    description: "Billing cycle (monthly, quarterly, annual)",
    default: "monthly",
    required: false,
  })
  @IsString()
  @IsOptional()
  billingCycle?: string;

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

  @ApiProperty({
    description: "Local checkout id returned by purchase/initiate",
    required: false,
  })
  @IsString()
  @IsOptional()
  checkoutId?: string;

  @ApiProperty({
    description: "MCOM Pay charge id returned by purchase/initiate",
    required: false,
  })
  @IsString()
  @IsOptional()
  chargeId?: string;
}
