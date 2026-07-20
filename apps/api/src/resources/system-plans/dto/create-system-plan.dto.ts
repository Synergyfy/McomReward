import {
  IsNotEmpty,
  IsString,
  IsNumber,
  IsArray,
  IsOptional,
  IsEnum,
  IsObject,
  IsBoolean,
  ValidateIf,
} from "class-validator";
import { ApiProperty } from "@nestjs/swagger";

export class CreateSystemPlanDto {
  @ApiProperty({
    description: "The name of the plan",
    example: "Gold Plan",
  })
  @IsNotEmpty()
  @IsString()
  name: string;

  @ApiProperty({
    description: "Description of the plan",
    example: "Premium tier for established businesses",
    required: false,
  })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({
    description: "Monthly price",
    example: 29.99,
  })
  @IsNotEmpty()
  @IsNumber()
  monthlyPrice: number;

  @ApiProperty({
    description: "Quarterly price",
    example: 79.99,
  })
  @IsNotEmpty()
  @IsNumber()
  quarterlyPrice: number;

  @ApiProperty({
    description: "Annual price",
    example: 299.99,
  })
  @IsNotEmpty()
  @IsNumber()
  annualPrice: number;

  @ApiProperty({
    description: "List of features included in the plan",
    example: ["Priority support", "Increased listing limit"],
  })
  @IsNotEmpty()
  @IsArray()
  features: string[];

  @ApiProperty({
    description: "Configuration for the plan (quotas, featureFlags, etc.)",
    required: false,
  })
  @IsOptional()
  @IsObject()
  configuration?: Record<string, any>;

  @ApiProperty({
    description: "Whether the plan is active",
    default: true,
  })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @ApiProperty({
    description: "Whether this is the default plan",
    default: false,
  })
  @IsOptional()
  @IsBoolean()
  isDefault?: boolean;

  @ApiProperty({
    description: "Plan type",
    enum: ["STANDARD", "TRIAL", "SEASONAL"],
    default: "STANDARD",
  })
  @IsOptional()
  @IsEnum(["STANDARD", "TRIAL", "SEASONAL"])
  type?: "STANDARD" | "TRIAL" | "SEASONAL";

  @ApiProperty({
    description: "Trial duration in days (required if type is TRIAL)",
    required: false,
    example: 14,
  })
  @ValidateIf((o) => o.type === "TRIAL")
  @IsNotEmpty()
  @IsNumber()
  trialDuration?: number;

  @ApiProperty({
    description: "Season ID (required if type is SEASONAL)",
    required: false,
  })
  @ValidateIf((o) => o.type === "SEASONAL")
  @IsNotEmpty()
  @IsString()
  seasonId?: string;

  @ApiProperty({
    description: "Stripe monthly price ID",
    required: false,
  })
  @IsOptional()
  @IsString()
  stripeMonthlyPriceId?: string;

  @ApiProperty({
    description: "Stripe quarterly price ID",
    required: false,
  })
  @IsOptional()
  @IsString()
  stripeQuarterlyPriceId?: string;

  @ApiProperty({
    description: "Stripe annual price ID",
    required: false,
  })
  @IsOptional()
  @IsString()
  stripeAnnualPriceId?: string;

  @ApiProperty({
    description: "PayPal monthly plan ID",
    required: false,
  })
  @IsOptional()
  @IsString()
  paypalMonthlyPlanId?: string;

  @ApiProperty({
    description: "PayPal quarterly plan ID",
    required: false,
  })
  @IsOptional()
  @IsString()
  paypalQuarterlyPlanId?: string;

  @ApiProperty({
    description: "PayPal annual plan ID",
    required: false,
  })
  @IsOptional()
  @IsString()
  paypalAnnualPlanId?: string;
}
