import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { Type } from "class-transformer";
import {
  IsString,
  IsOptional,
  IsNumber,
  IsInt,
  Min,
  IsUUID,
} from "class-validator";

export class CreateEscrowDto {
  @ApiProperty()
  @IsUUID()
  campaignId: string;

  @ApiProperty()
  @IsString()
  campaignName: string;

  @ApiProperty()
  @IsUUID()
  businessId: string;

  @ApiProperty()
  @IsString()
  businessName: string;

  @ApiProperty()
  @IsNumber()
  @Min(0)
  amount: number;
}

export class CreatePayoutRequestDto {
  @ApiProperty()
  @IsUUID()
  businessId: string;

  @ApiProperty()
  @IsString()
  businessName: string;

  @ApiProperty()
  @IsNumber()
  @Min(0)
  amount: number;
}

export class FilterEscrowDto {
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

export class FilterPayoutRequestDto {
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
