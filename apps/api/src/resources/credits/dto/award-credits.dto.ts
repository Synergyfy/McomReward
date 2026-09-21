import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { IsEnum, IsNumber, IsOptional, IsString } from "class-validator";
import { CreditsUnit, CreditsUserType } from "../entities/credits.enums";

export class AwardCreditsDto {
  @ApiProperty({ description: "ID of the user to credit" })
  @IsString()
  userId: string;

  @ApiProperty({ enum: CreditsUserType })
  @IsEnum(CreditsUserType)
  userType: CreditsUserType;

  @ApiProperty()
  @IsNumber()
  amount: number;

  @ApiPropertyOptional({ enum: CreditsUnit, default: CreditsUnit.CREDITS })
  @IsOptional()
  @IsEnum(CreditsUnit)
  unit?: CreditsUnit;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  description?: string;
}
