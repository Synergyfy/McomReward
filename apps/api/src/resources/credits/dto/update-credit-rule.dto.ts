import { PartialType } from "@nestjs/swagger";
import { CreateCreditRuleDto } from "./create-credit-rule.dto";

export class UpdateCreditRuleDto extends PartialType(CreateCreditRuleDto) {}