import { ApiProperty } from "@nestjs/swagger";
import { IsInt, Min } from "class-validator";

export class UnlockCreditLevelDto {
  @ApiProperty({ description: "The credit level number to unlock" })
  @IsInt()
  @Min(1)
  level: number;
}