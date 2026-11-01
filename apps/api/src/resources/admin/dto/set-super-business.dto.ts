import { ApiProperty } from "@nestjs/swagger";
import { IsBoolean } from "class-validator";

/**
 * Admin toggle for the Super Business privilege.
 *
 * Super Business is a privilege on an existing Business account, not an
 * account type, so it is granted/revoked rather than provisioned.
 */
export class SetSuperBusinessDto {
  @ApiProperty({
    description: "Whether the business should have Super Business access.",
    example: true,
  })
  @IsBoolean()
  isSuperBusiness: boolean;
}
