import { ApiProperty } from "@nestjs/swagger";
import { Type } from "class-transformer";
import {
  IsNumber,
  IsOptional,
  IsString,
  IsBoolean,
  IsEnum,
  IsArray,
  IsIn,
  ValidateNested,
  IsDateString,
} from "class-validator";
import { RewardStatus } from "../enums/reward-status.enum";
import { RewardType } from "../enums/reward-type.enum";
import { RewardSource } from "../enums/reward-source.enum";
import { RewardAudience } from "../enums/reward-audience.enum";
import { ImageSourceType } from "../enums/image-source-type.enum";
import { RewardFulfilmentConfigDto } from "../../reward-fulfilment/dto/reward-fulfilment.dto";

export class AddRewardToBusinessDto {
  @ApiProperty({
    description: "The ID of the base reward to add",
    example: "uuid",
    required: false,
  })
  @IsString()
  @IsOptional()
  rewardId?: string;

  @ApiProperty({
    description: "The quantity of the reward available for the business",
    example: 100,
  })
  @IsNumber()
  @IsOptional()
  quantity?: number;

  @ApiProperty({
    description: "The points required to redeem the reward",
    example: 1000,
    required: false,
  })
  @IsNumber()
  @IsOptional()
  points_required?: number;

  @ApiProperty({
    description: "The stamps required to redeem the reward",
    example: 10,
    required: false,
  })
  @IsNumber()
  @IsOptional()
  stamps_required?: number;

  @ApiProperty({
    description: "The value of the mall reward",
    example: 10.0,
  })
  @IsNumber()
  @IsOptional()
  mall_reward_value?: number;

  @ApiProperty({
    description: "The type of the mall reward",
    enum: ["VOUCHER", "GIFT_CARD", "COUPON"],
    example: "VOUCHER",
    required: false,
  })
  @IsIn(["VOUCHER", "GIFT_CARD", "COUPON"])
  @IsOptional()
  mall_reward_type?: "VOUCHER" | "GIFT_CARD" | "COUPON";

  @ApiProperty({
    description: "Whether points are enabled for this reward",
    example: true,
    required: false,
  })
  @IsBoolean()
  @IsOptional()
  is_points_enabled?: boolean;

  @ApiProperty({
    description: "Whether stamps are enabled for this reward",
    example: false,
    required: false,
  })
  @IsBoolean()
  @IsOptional()
  is_stamps_enabled?: boolean;

  @ApiProperty({
    description: "The emoji to use for stamps",
    example: "☕",
    required: false,
  })
  @IsString()
  @IsOptional()
  stamp_emoji?: string;

  @ApiProperty({ enum: RewardStatus, required: false })
  @IsEnum(RewardStatus)
  @IsOptional()
  status?: RewardStatus;

  @ApiProperty({ enum: RewardType, required: false })
  @IsEnum(RewardType)
  @IsOptional()
  reward_type?: RewardType;

  @ApiProperty({ enum: RewardSource, required: false })
  @IsEnum(RewardSource)
  @IsOptional()
  reward_source?: RewardSource;

  @ApiProperty({ enum: RewardAudience, required: false })
  @IsEnum(RewardAudience)
  @IsOptional()
  audience?: RewardAudience;

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  image?: string;

  @ApiProperty({ type: [String], required: false })
  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  gallery?: string[];

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  title?: string;

  @ApiProperty({ required: false })
  @IsDateString()
  @IsOptional()
  expiry_datetime?: Date;

  @ApiProperty({ required: false })
  @IsBoolean()
  @IsOptional()
  disabled?: boolean;

  @ApiProperty({ required: false })
  @IsBoolean()
  @IsOptional()
  is_mall_integrated?: boolean;

  @ApiProperty({ enum: ["SPECIFIC", "ALL"], required: false })
  @IsIn(["SPECIFIC", "ALL"])
  @IsOptional()
  mall_target_scope?: "SPECIFIC" | "ALL";

  @ApiProperty({ type: [String], required: false })
  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  mall_target_product_ids?: string[];

  @ApiProperty({ type: [String], required: false })
  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  mall_target_service_ids?: string[];

  @ApiProperty({ enum: ["percentage", "fixed"], required: false })
  @IsIn(["percentage", "fixed"])
  @IsOptional()
  mall_discount_type?: "percentage" | "fixed";

  @ApiProperty({ required: false })
  @IsNumber()
  @IsOptional()
  mall_discount_value?: number;

  @ApiProperty({ required: false })
  @IsNumber()
  @IsOptional()
  mall_max_discount?: number;

  @ApiProperty({ required: false })
  @IsNumber()
  @IsOptional()
  mall_min_spend?: number;

  @ApiProperty({ enum: ImageSourceType, required: false })
  @IsEnum(ImageSourceType)
  @IsOptional()
  image_source_type?: ImageSourceType;

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  emoji?: string;

  @ApiProperty({
    description:
      "Ecosystem fulfilment attachment (Mall instrument or Central entitlement)",
    type: () => RewardFulfilmentConfigDto,
    required: false,
  })
  @IsOptional()
  @ValidateNested()
  @Type(() => RewardFulfilmentConfigDto)
  fulfilment?: RewardFulfilmentConfigDto;
}
