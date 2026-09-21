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
import { PlansService } from "./plans.service";
import { CreatePlanDto } from "./dto/create-plan.dto";
import { UpdatePlanDto } from "./dto/update-plan.dto";
import { AddPlanPriceDto } from "./dto/add-plan-price.dto";
import { Roles } from "../../common/decorators/roles.decorator";
import { Role } from "../../common/role.enum";
import { Public } from "../../common/decorators/public.decorator";
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from "@nestjs/swagger";

@ApiTags("Plans")
@Controller("plans")
export class PlansController {
  constructor(private readonly plansService: PlansService) {}

  @Post()
  @Roles(Role.Admin)
  @ApiBearerAuth()
  @ApiOperation({
    summary: "Create a new plan with 3 atomic variants (Admin only)",
  })
  @ApiResponse({ status: 201, description: "Plan and 3 variants created" })
  create(@Body() createPlanDto: CreatePlanDto) {
    return this.plansService.create(createPlanDto);
  }

  @Get()
  @Public()
  @ApiOperation({ summary: "Get all active plans with 3 duration variants" })
  @ApiResponse({ status: 200, description: "Return active plans" })
  findAll() {
    return this.plansService.findAll();
  }

  @Get("admin")
  @Roles(Role.Admin)
  @ApiBearerAuth()
  @ApiOperation({ summary: "Get all plans for admin dashboard" })
  @ApiResponse({
    status: 200,
    description: "Return all plans including inactive",
  })
  findAllAdmin() {
    return this.plansService.findAllAdmin();
  }

  @Get("schema")
  @Public()
  @ApiOperation({ summary: "Get capabilities & quotas schema" })
  @ApiResponse({ status: 200, description: "Return schema" })
  getSchema() {
    return this.plansService.getPlanSchema();
  }

  @Get(":id")
  @Public()
  @ApiOperation({ summary: "Get plan by ID" })
  @ApiResponse({ status: 200, description: "Return plan" })
  findOne(@Param("id") id: string) {
    return this.plansService.findOne(id);
  }

  @Patch(":id")
  @Roles(Role.Admin)
  @ApiBearerAuth()
  @ApiOperation({ summary: "Update plan (Admin only)" })
  @ApiResponse({ status: 200, description: "Plan updated" })
  update(@Param("id") id: string, @Body() updatePlanDto: UpdatePlanDto) {
    return this.plansService.update(id, updatePlanDto);
  }

  @Delete(":id")
  @Roles(Role.Admin)
  @ApiBearerAuth()
  @ApiOperation({ summary: "Deactivate plan (Admin only)" })
  @ApiResponse({ status: 200, description: "Plan deactivated" })
  remove(@Param("id") id: string) {
    return this.plansService.remove(id);
  }

  @Post("variants/:variantId/prices")
  @Roles(Role.Admin)
  @ApiBearerAuth()
  @ApiOperation({ summary: "Add versioned price to a variant (Admin only)" })
  @ApiResponse({
    status: 201,
    description: "New price active, previous price archived",
  })
  addPrice(
    @Param("variantId") variantId: string,
    @Body() addPriceDto: AddPlanPriceDto,
  ) {
    return this.plansService.addVariantPrice(variantId, addPriceDto);
  }
}
