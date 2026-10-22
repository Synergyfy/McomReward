import {
  IsUUID,
  IsNumber,
  IsInt,
  IsEnum,
  IsOptional,
  IsString,
} from "class-validator";
import { ApiProperty } from "@nestjs/swagger";
import { PaymentProvider } from "../enums/group-circle.enums";

export class VerifyContributionDto {
  @ApiProperty()
  @IsUUID()
  memberId: string;

  @ApiProperty()
  @IsNumber()
  amount: number;

  @ApiProperty()
  @IsInt()
  round: number;

  @ApiProperty({ enum: PaymentProvider })
  @IsEnum(PaymentProvider)
  provider: PaymentProvider;

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  transactionId?: string;

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  checkoutId?: string;

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  chargeId?: string;
}
