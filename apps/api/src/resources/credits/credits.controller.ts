import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  Query,
} from "@nestjs/common";
import {
  ApiTags,
  ApiBearerAuth,
  ApiOperation,
} from "@nestjs/swagger";
import { CreditsService } from "./credits.service";
import { CurrentUser } from "../../common/decorators/current-user.decorator";
import { User } from "../../common/interfaces/user.interface";
import { Roles } from "../../common/decorators/roles.decorator";
import { Role } from "../../common/role.enum";
import { CreateCreditRuleDto } from "./dto/create-credit-rule.dto";
import { UpdateCreditRuleDto } from "./dto/update-credit-rule.dto";
import { UnlockCreditLevelDto } from "./dto/unlock-credit-level.dto";
import { AwardCreditsDto } from "./dto/award-credits.dto";
import { CreditsUnit, CreditsUserType } from "./entities/credits.enums";

const userTypeFor = (user: User): CreditsUserType =>
  user.role === Role.Business
    ? CreditsUserType.BUSINESS
    : CreditsUserType.PARTICIPANT;

@ApiTags("Credits")
@ApiBearerAuth()
@Controller("credits")
export class CreditsController {
  constructor(private readonly creditsService: CreditsService) {}

  @Get("balance")
  @Roles(Role.Participant, Role.Business)
  @ApiOperation({ summary: "Get the current user's credits balance" })
  getBalance(@CurrentUser() user: User) {
    return this.creditsService.getBalance(user.id, userTypeFor(user));
  }

  @Get("history")
  @Roles(Role.Participant, Role.Business)
  @ApiOperation({ summary: "Get the current user's credits history" })
  getHistory(
    @CurrentUser() user: User,
    @Query("page") page = 1,
    @Query("limit") limit = 10,
  ) {
    return this.creditsService.getHistory(
      user.id,
      userTypeFor(user),
      Number(page),
      Number(limit),
    );
  }

  @Post("unlock")
  @Roles(Role.Participant, Role.Business)
  @ApiOperation({
    summary: "Unlock a credit level using a matching contribution",
  })
  unlock(
    @CurrentUser() user: User,
    @Body() dto: UnlockCreditLevelDto,
  ) {
    return this.creditsService.unlock(
      user.id,
      userTypeFor(user),
      dto.level,
    );
  }

  @Get("rules")
  @ApiOperation({ summary: "List credit earning rules" })
  getRules() {
    return this.creditsService.getRules();
  }

  @Post("rules")
  @Roles(Role.Admin)
  @ApiOperation({ summary: "Create credit rules (Admin only)" })
  createRule(@Body() dto: CreateCreditRuleDto) {
    return this.creditsService.createRule(dto);
  }

  @Patch("rules/:id")
  @Roles(Role.Admin)
  @ApiOperation({ summary: "Update a credit rule (Admin only)" })
  updateRule(@Param("id") id: string, @Body() dto: UpdateCreditRuleDto) {
    return this.creditsService.updateRule(id, dto);
  }

  @Delete("rules/:id")
  @Roles(Role.Admin)
  @ApiOperation({ summary: "Delete a credit rule (Admin only)" })
  deleteRule(@Param("id") id: string) {
    return this.creditsService.deleteRule(id);
  }

  @Get("events")
  @Roles(Role.Admin)
  @ApiOperation({ summary: "List valid credit event types (Admin only)" })
  getEvents() {
    return this.creditsService.getEvents();
  }

  @Post("admin/award")
  @Roles(Role.Admin)
  @ApiOperation({ summary: "Manually award credits to a user (Admin only)" })
  award(@Body() dto: AwardCreditsDto) {
    return this.creditsService.award(
      dto.userId,
      dto.userType,
      dto.amount,
      dto.unit || CreditsUnit.CREDITS,
      dto.description,
    );
  }
}

@ApiTags("Credits")
@ApiBearerAuth()
@Controller("admin/credits")
export class AdminCreditsController {
  constructor(private readonly creditsService: CreditsService) {}

  @Get("history")
  @Roles(Role.Admin)
  @ApiOperation({ summary: "Get platform credits history (Admin only)" })
  getAdminHistory(
    @Query("page") page = 1,
    @Query("limit") limit = 10,
    @Query("email") email?: string,
  ) {
    return this.creditsService.getAdminHistory(
      Number(page),
      Number(limit),
      email,
    );
  }
}