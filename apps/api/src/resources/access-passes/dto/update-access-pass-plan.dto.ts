import { ApiProperty, PartialType } from "@nestjs/swagger";
import { IsBoolean, IsOptional } from "class-validator";
import { CreateAccessPassPlanDto } from "./create-access-pass-plan.dto";

export class UpdateAccessPassPlanDto extends PartialType(
  CreateAccessPassPlanDto,
) {
  @ApiProperty({
    description:
      "When true, active subscribers have their feature/limit snapshot updated too. When false the change only applies to future subscribers.",
    required: false,
    default: false,
  })
  @IsOptional()
  @IsBoolean()
  updateExistingSubscribers?: boolean;

  @ApiProperty({
    description:
      "When updating existing subscribers, also recalculate their expiry from their original start date using the new duration.",
    required: false,
    default: false,
  })
  @IsOptional()
  @IsBoolean()
  recalculateExpiry?: boolean;
}
