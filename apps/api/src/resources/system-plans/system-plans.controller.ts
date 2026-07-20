import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
} from "@nestjs/common";
import { SystemPlansService } from "./system-plans.service";
import { CreateSystemPlanDto } from "./dto/create-system-plan.dto";
import { UpdateSystemPlanDto } from "./dto/update-system-plan.dto";
import { SystemApiKeyGuard } from "../../common/guards/system-api-key.guard";
import { Public } from "../../common/decorators/public.decorator";
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiSecurity,
} from "@nestjs/swagger";

@ApiTags("System Plans")
@ApiSecurity("x-mcom-solution-api-key")
@Controller("system/plans")
@Public()
@UseGuards(SystemApiKeyGuard)
export class SystemPlansController {
  constructor(private readonly systemPlansService: SystemPlansService) {}

  @Post()
  @ApiOperation({ summary: "Create a new plan" })
  @ApiResponse({ status: 201, description: "Plan created successfully" })
  @ApiResponse({ status: 401, description: "Unauthorized — invalid API key" })
  @ApiResponse({
    status: 409,
    description: "Conflict — duplicate plan name or trial already exists",
  })
  @ApiResponse({ status: 400, description: "Validation error" })
  create(@Body() createPlanDto: CreateSystemPlanDto) {
    return this.systemPlansService.create(createPlanDto);
  }

  @Get()
  @ApiOperation({ summary: "Get all plans" })
  @ApiResponse({ status: 200, description: "Return all plans" })
  @ApiResponse({ status: 401, description: "Unauthorized — invalid API key" })
  findAll() {
    return this.systemPlansService.findAll();
  }

  @Get(":id")
  @ApiOperation({ summary: "Get a plan by ID" })
  @ApiResponse({ status: 200, description: "Return the plan" })
  @ApiResponse({ status: 401, description: "Unauthorized — invalid API key" })
  @ApiResponse({ status: 404, description: "Plan not found" })
  findOne(@Param("id") id: string) {
    return this.systemPlansService.findOne(id);
  }

  @Patch(":id")
  @ApiOperation({ summary: "Update a plan" })
  @ApiResponse({ status: 200, description: "Plan updated successfully" })
  @ApiResponse({ status: 401, description: "Unauthorized — invalid API key" })
  @ApiResponse({ status: 404, description: "Plan not found" })
  @ApiResponse({
    status: 409,
    description: "Conflict — duplicate plan name",
  })
  update(@Param("id") id: string, @Body() updatePlanDto: UpdateSystemPlanDto) {
    return this.systemPlansService.update(id, updatePlanDto);
  }

  @Delete(":id")
  @ApiOperation({ summary: "Delete a plan" })
  @ApiResponse({ status: 200, description: "Plan deleted successfully" })
  @ApiResponse({ status: 401, description: "Unauthorized — invalid API key" })
  @ApiResponse({ status: 404, description: "Plan not found" })
  remove(@Param("id") id: string) {
    return this.systemPlansService.remove(id);
  }
}
