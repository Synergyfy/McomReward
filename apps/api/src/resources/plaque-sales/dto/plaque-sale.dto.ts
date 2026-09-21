import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { Type } from "class-transformer";
import {
  IsString,
  IsOptional,
  IsEnum,
  IsInt,
  IsNumber,
  IsUUID,
  Min,
} from "class-validator";
import { PayoutStatus, SaleStatus } from "../entities/plaque-sale.entity";

export class CreatePlaqueSaleDto {
  @ApiProperty()
  @IsUUID()
  plaqueId: string;

  @ApiProperty()
  @IsUUID()
  sellerId: string;

  @ApiProperty()
  @IsString()
  sellerName: string;

  @ApiProperty()
  @IsUUID()
  buyerId: string;

  @ApiProperty()
  @IsString()
  buyerName: string;

  @ApiProperty()
  @IsNumber()
  @Min(0)
  salePrice: number;

  @ApiProperty()
  @IsNumber()
  @Min(0)
  commissionPercentage: number;
}

export class UpdatePayoutStatusDto {
  @ApiProperty({ enum: PayoutStatus })
  @IsEnum(PayoutStatus)
  payoutStatus: PayoutStatus;
}

export class FilterPlaqueSaleDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  search?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsUUID()
  sellerId?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsUUID()
  buyerId?: string;

  @ApiPropertyOptional({ enum: PayoutStatus })
  @IsOptional()
  @IsEnum(PayoutStatus)
  payoutStatus?: PayoutStatus;

  @ApiPropertyOptional({ enum: SaleStatus })
  @IsOptional()
  @IsEnum(SaleStatus)
  status?: SaleStatus;

  @ApiPropertyOptional({ default: 1 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number;

  @ApiPropertyOptional({ default: 10 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  limit?: number;
}
