import { ApiProperty } from "@nestjs/swagger";
import { IsEnum, IsNotEmpty, IsOptional, IsString } from "class-validator";

export enum PaymentProviderType {
  STRIPE = "stripe",
  PAYPAL = "paypal",
  WALLET = "wallet",
}

export enum BillingCycleType {
  MONTHLY = "monthly",
  QUARTERLY = "quarterly",
  ANNUAL = "annual",
  // Tier-level aliases (sent by the frontend when selecting a plan variant)
  STANDARD = "STANDARD",
  PRO = "PRO",
  PRO_PLUS = "PRO_PLUS",
}

export class InitiatePlatformPurchaseDto {
  @ApiProperty({ description: "The plan or tier ID on Rewards platform" })
  @IsString()
  @IsNotEmpty()
  externalPlanId: string;

  @ApiProperty({
    description: "Billing cycle: monthly, quarterly, or annual",
    enum: BillingCycleType,
    default: BillingCycleType.MONTHLY,
  })
  @IsEnum(BillingCycleType)
  billingCycle: BillingCycleType;

  @ApiProperty({
    description: "Payment provider: stripe, paypal, or wallet",
    enum: PaymentProviderType,
    default: PaymentProviderType.STRIPE,
  })
  @IsEnum(PaymentProviderType)
  provider: PaymentProviderType;

  @ApiProperty({
    description: "Return URL after payment completion",
    required: false,
  })
  @IsString()
  @IsOptional()
  returnUrl?: string;

  @ApiProperty({
    description: "Cancel URL if user cancels checkout",
    required: false,
  })
  @IsString()
  @IsOptional()
  cancelUrl?: string;
}
