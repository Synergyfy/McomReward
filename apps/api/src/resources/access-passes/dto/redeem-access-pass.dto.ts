import { ApiProperty } from "@nestjs/swagger";
import { IsString, MaxLength, MinLength } from "class-validator";

export class RedeemAccessPassDto {
  @ApiProperty({ example: "MCOM-7K3P-9QDX" })
  @IsString()
  @MinLength(4)
  @MaxLength(64)
  code: string;
}
