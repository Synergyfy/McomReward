import { ApiProperty, PartialType } from "@nestjs/swagger";
import { CreatePlanDto } from "./create-plan.dto";
import { IsOptional, IsString, IsBoolean } from "class-validator";

export class UpdatePlanDto extends PartialType(CreatePlanDto) {
  @ApiProperty({ description: "Plan name", required: false })
  @IsString()
  @IsOptional()
  name?: string;

  @ApiProperty({ description: "Plan slug", required: false })
  @IsString()
  @IsOptional()
  slug?: string;

  @ApiProperty({ description: "Plan description", required: false })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiProperty({ description: "Plan status", required: false })
  @IsBoolean()
  @IsOptional()
  isActive?: boolean;
}
