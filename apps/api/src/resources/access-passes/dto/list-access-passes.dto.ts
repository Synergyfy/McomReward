import { ApiProperty } from "@nestjs/swagger";
import { Type } from "class-transformer";
import {
  IsEnum,
  IsInt,
  IsOptional,
  IsString,
  IsUUID,
  Max,
  Min,
} from "class-validator";
import { AccessPassSubscriptionStatus } from "../entities/access-pass-subscription.entity";
import { AccessPassCodeStatus } from "../entities/access-pass-code.entity";

export class ListAccessPassSubscriptionsDto {
  @ApiProperty({ default: 1, required: false })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number = 1;

  @ApiProperty({ default: 20, required: false })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  limit?: number = 20;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsUUID()
  planId?: string;

  @ApiProperty({
    enum: AccessPassSubscriptionStatus,
    required: false,
  })
  @IsOptional()
  @IsEnum(AccessPassSubscriptionStatus)
  status?: AccessPassSubscriptionStatus;

  @ApiProperty({
    description: "Search business name or email",
    required: false,
  })
  @IsOptional()
  @IsString()
  search?: string;
}

export class ListAccessPassCodesDto {
  @ApiProperty({ default: 1, required: false })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number = 1;

  @ApiProperty({ default: 20, required: false })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  limit?: number = 20;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsUUID()
  planId?: string;

  @ApiProperty({ enum: AccessPassCodeStatus, required: false })
  @IsOptional()
  @IsEnum(AccessPassCodeStatus)
  status?: AccessPassCodeStatus;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  search?: string;
}
