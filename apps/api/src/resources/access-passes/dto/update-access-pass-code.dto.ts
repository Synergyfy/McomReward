import { ApiProperty } from "@nestjs/swagger";
import {
  IsBoolean,
  IsDateString,
  IsEnum,
  IsOptional,
  IsString,
  MaxLength,
} from "class-validator";
import { AccessPassCodeStatus } from "../entities/access-pass-code.entity";

export class UpdateAccessPassCodeDto {
  @ApiProperty({
    description: "New code lifecycle status",
    enum: AccessPassCodeStatus,
    required: false,
  })
  @IsOptional()
  @IsEnum(AccessPassCodeStatus)
  status?: AccessPassCodeStatus;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsBoolean()
  restrictToAssignedUser?: boolean;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsDateString()
  expiresAt?: string | null;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  note?: string;
}
