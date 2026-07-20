import { PartialType } from "@nestjs/swagger";
import { CreateSystemPlanDto } from "./create-system-plan.dto";

export class UpdateSystemPlanDto extends PartialType(CreateSystemPlanDto) {}
