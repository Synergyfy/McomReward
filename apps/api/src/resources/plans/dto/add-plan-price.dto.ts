import { ApiProperty } from "@nestjs/swagger";
import { IsNumber, IsOptional, IsString, Min } from "class-validator";

export class AddPlanPriceDto {
  @ApiProperty({ description: "New price amount in GBP", example: 59.99 })
  @IsNumber()
  @Min(0)
  amount: number;

  @ApiProperty({ description: "Currency code", default: "GBP", required: false })
  @IsString()
  @IsOptional()
  currency?: string;

  @ApiProperty({ description: "Optional Stripe price ID", required: false })
  @IsString()
  @IsOptional()
  stripePriceId?: string;

  @ApiProperty({ description: "Optional PayPal plan ID", required: false })
  @IsString()
  @IsOptional()
  paypalPlanId?: string;
}
