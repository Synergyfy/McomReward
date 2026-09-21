import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
} from "@nestjs/common";
import { ApiTags, ApiBearerAuth, ApiOperation } from "@nestjs/swagger";
import { LoyaltySetupService } from "./loyalty-setup.service";
import {
  CreateLoyaltySetupTemplateDto,
  UpdateLoyaltySetupTemplateDto,
} from "./dto/loyalty-setup-template.dto";
import { Roles } from "../../common/decorators/roles.decorator";
import { Role } from "../../common/role.enum";

@ApiTags("Loyalty Setup Templates")
@ApiBearerAuth()
@Controller("loyalty-setup/templates")
export class LoyaltySetupTemplatesController {
  constructor(private readonly loyaltySetupService: LoyaltySetupService) {}

  @Get()
  @Roles(Role.Admin, Role.Business)
  @ApiOperation({ summary: "Get all reward templates" })
  getTemplates() {
    return this.loyaltySetupService.getTemplates();
  }

  @Post()
  @Roles(Role.Admin)
  @ApiOperation({ summary: "Create a reward template (Admin only)" })
  create(@Body() dto: CreateLoyaltySetupTemplateDto) {
    return this.loyaltySetupService.createTemplate(dto);
  }

  @Patch(":id")
  @Roles(Role.Admin)
  @ApiOperation({ summary: "Update a reward template (Admin only)" })
  update(@Param("id") id: string, @Body() dto: UpdateLoyaltySetupTemplateDto) {
    return this.loyaltySetupService.updateTemplate(id, dto);
  }

  @Delete(":id")
  @Roles(Role.Admin)
  @ApiOperation({ summary: "Delete a reward template (Admin only)" })
  remove(@Param("id") id: string) {
    return this.loyaltySetupService.deleteTemplate(id);
  }
}
