import { ApiProperty } from "@nestjs/swagger";
import { IsString, IsUUID } from "class-validator";

export class OverrideBusinessTierDto {
  @ApiProperty({ example: "business-uuid" })
  @IsString()
  @IsUUID()
  businessId: string;

  @ApiProperty({ example: "tier-uuid" })
  @IsString()
  @IsUUID()
  tierId: string;
}