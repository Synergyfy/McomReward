import { ApiProperty } from "@nestjs/swagger";
import { IsString, MaxLength, MinLength } from "class-validator";

export class RevokeAccessPassDto {
  @ApiProperty({
    description: "Reason included in the revocation email",
    example: "Payment was reversed by the bank.",
  })
  @IsString()
  @MinLength(3)
  @MaxLength(1000)
  reason: string;
}
