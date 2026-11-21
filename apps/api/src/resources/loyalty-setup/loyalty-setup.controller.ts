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
import { UpdateLoyaltySetupProgressDto } from "./dto/loyalty-setup-progress.dto";
import { Roles } from "../../common/decorators/roles.decorator";
import { Role } from "../../common/role.enum";
import { CurrentUser } from "../../common/decorators/current-user.decorator";
import { SkipMembershipCheck } from "../../common/decorators/skip-membership-check.decorator";

@ApiTags("Loyalty Setup Templates")
@ApiBearerAuth()
@Controller("loyalty-setup/templates")
export class LoyaltySetupTemplatesController {
  constructor(private readonly loyaltySetupService: LoyaltySetupService) {}

  @Get()
  @Roles(Role.Admin)
  @ApiOperation({ summary: "Get all reward templates for administration" })
  getTemplates() {
    return this.loyaltySetupService.getTemplates();
  }

  @Get("available")
  @Roles(Role.Business)
  @SkipMembershipCheck()
  @ApiOperation({
    summary: "Get admin-created templates available to businesses",
  })
  getAvailableTemplates() {
    return this.loyaltySetupService.getAvailableTemplates();
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

@ApiTags("Loyalty Setup")
@ApiBearerAuth()
@SkipMembershipCheck()
@Controller("loyalty-setup")
export class LoyaltySetupProgressController {
  constructor(private readonly loyaltySetupService: LoyaltySetupService) {}

  @Get("progress")
  @Roles(Role.Business)
  @ApiOperation({ summary: "Get the current business loyalty setup progress" })
  getProgress(@CurrentUser() user: any) {
    return this.loyaltySetupService.getProgress(user.id);
  }

  @Patch("progress")
  @Roles(Role.Business)
  @ApiOperation({
    summary: "Update the current business loyalty setup progress",
  })
  updateProgress(
    @CurrentUser() user: any,
    @Body() dto: UpdateLoyaltySetupProgressDto,
  ) {
    return this.loyaltySetupService.updateProgress(user.id, dto);
  }

  @Post("progress/skip")
  @Roles(Role.Business)
  @ApiOperation({ summary: "Skip loyalty setup onboarding" })
  skipProgress(@CurrentUser() user: any) {
    return this.loyaltySetupService.skipProgress(user.id);
  }

  @Post("progress/complete")
  @Roles(Role.Business)
  @ApiOperation({
    summary:
      "Complete loyalty setup and create the business's rewards and campaigns",
  })
  completeProgress(
    @CurrentUser() user: any,
    @Body() dto: UpdateLoyaltySetupProgressDto,
  ) {
    return this.loyaltySetupService.completeProgress(user.id, dto);
  }
}
