import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
} from "@nestjs/common";
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from "@nestjs/swagger";
import { AccessPassService } from "./access-pass.service";
import { Roles } from "../../common/decorators/roles.decorator";
import { Role } from "../../common/role.enum";
import { Public } from "../../common/decorators/public.decorator";
import { CurrentUser } from "../../common/decorators/current-user.decorator";
import { SkipMembershipCheck } from "../../common/decorators/skip-membership-check.decorator";
import { CreateAccessPassPlanDto } from "./dto/create-access-pass-plan.dto";
import { UpdateAccessPassPlanDto } from "./dto/update-access-pass-plan.dto";
import { CreateAccessPassCodeDto } from "./dto/create-access-pass-code.dto";
import { UpdateAccessPassCodeDto } from "./dto/update-access-pass-code.dto";
import { RedeemAccessPassDto } from "./dto/redeem-access-pass.dto";
import { RevokeAccessPassDto } from "./dto/revoke-access-pass.dto";
import { InitiateAccessPassPurchaseDto } from "./dto/initiate-access-pass-purchase.dto";
import { ConfirmAccessPassPurchaseDto } from "./dto/confirm-access-pass-purchase.dto";
import {
  ListAccessPassCodesDto,
  ListAccessPassSubscriptionsDto,
} from "./dto/list-access-passes.dto";

@ApiTags("Access Passes")
@ApiBearerAuth()
@Controller("access-passes")
@SkipMembershipCheck()
export class AccessPassController {
  constructor(private readonly accessPassService: AccessPassService) {}

  /* -------------------------- Public catalogue ------------------------- */

  @Public()
  @Get("schema")
  @ApiOperation({ summary: "Get access pass quota & feature schema" })
  getSchema() {
    return this.accessPassService.getSchema();
  }

  @Public()
  @Get("plans")
  @ApiOperation({ summary: "List active purchasable access pass plans" })
  listPublicPlans() {
    return this.accessPassService.listPublicPlans();
  }

  /* --------------------------- Business access ------------------------- */

  @Get("me")
  @Roles(Role.Business)
  @ApiOperation({ summary: "Get the current business access pass" })
  getMyAccessPass(@CurrentUser() user: any) {
    return this.accessPassService.getMyAccessPass(user.id);
  }

  @Post("redeem")
  @Roles(Role.Business)
  @ApiOperation({ summary: "Redeem an access pass code" })
  redeem(@CurrentUser() user: any, @Body() dto: RedeemAccessPassDto) {
    return this.accessPassService.redeemCode(user.id, dto.code);
  }

  @Post("purchase/initiate")
  @Roles(Role.Business)
  @ApiOperation({ summary: "Start an access pass purchase" })
  initiatePurchase(
    @CurrentUser() user: any,
    @Body() dto: InitiateAccessPassPurchaseDto,
  ) {
    return this.accessPassService.initiatePurchase(user.id, dto);
  }

  @Post("purchase/confirm")
  @Roles(Role.Business)
  @ApiOperation({ summary: "Confirm an access pass purchase" })
  confirmPurchase(
    @CurrentUser() user: any,
    @Body() dto: ConfirmAccessPassPurchaseDto,
  ) {
    return this.accessPassService.confirmPurchase(user.id, dto);
  }

  /* ------------------------------- Admin ------------------------------- */

  @Get("admin/plans")
  @Roles(Role.Admin)
  @ApiOperation({ summary: "Admin: list access pass plans" })
  listAdminPlans() {
    return this.accessPassService.listAdminPlans();
  }

  @Post("admin/plans")
  @Roles(Role.Admin)
  @ApiOperation({ summary: "Admin: create an access pass plan" })
  createPlan(@Body() dto: CreateAccessPassPlanDto) {
    return this.accessPassService.createPlan(dto);
  }

  @Get("admin/plans/:id")
  @Roles(Role.Admin)
  @ApiOperation({ summary: "Admin: get an access pass plan" })
  getPlan(@Param("id") id: string) {
    return this.accessPassService.findPlan(id);
  }

  @Patch("admin/plans/:id")
  @Roles(Role.Admin)
  @ApiOperation({
    summary:
      "Admin: update an access pass plan (optionally propagating to existing subscribers)",
  })
  updatePlan(@Param("id") id: string, @Body() dto: UpdateAccessPassPlanDto) {
    return this.accessPassService.updatePlan(id, dto);
  }

  @Delete("admin/plans/:id")
  @Roles(Role.Admin)
  @ApiOperation({ summary: "Admin: deactivate an access pass plan" })
  removePlan(@Param("id") id: string) {
    return this.accessPassService.removePlan(id);
  }

  @Get("admin/codes")
  @Roles(Role.Admin)
  @ApiOperation({ summary: "Admin: list access pass codes" })
  listCodes(@Query() dto: ListAccessPassCodesDto) {
    return this.accessPassService.listCodes(dto);
  }

  @Post("admin/codes")
  @Roles(Role.Admin)
  @ApiOperation({ summary: "Admin: generate an access pass code" })
  @ApiResponse({
    status: 201,
    description: "Code created and emailed when an address was supplied",
  })
  createCode(@CurrentUser() user: any, @Body() dto: CreateAccessPassCodeDto) {
    return this.accessPassService.generateCode(user.id, dto);
  }

  @Patch("admin/codes/:id")
  @Roles(Role.Admin)
  @ApiOperation({ summary: "Admin: update an access pass code" })
  updateCode(@Param("id") id: string, @Body() dto: UpdateAccessPassCodeDto) {
    return this.accessPassService.updateCode(id, dto);
  }

  @Delete("admin/codes/:id")
  @Roles(Role.Admin)
  @ApiOperation({ summary: "Admin: revoke an access pass code" })
  revokeCode(@Param("id") id: string) {
    return this.accessPassService.revokeCode(id);
  }

  @Post("admin/codes/:id/resend")
  @Roles(Role.Admin)
  @ApiOperation({ summary: "Admin: re-email an access pass code" })
  resendCode(@Param("id") id: string) {
    return this.accessPassService.resendCodeEmail(id);
  }

  @Get("admin/subscriptions")
  @Roles(Role.Admin)
  @ApiOperation({ summary: "Admin: list access pass subscribers" })
  listSubscriptions(@Query() dto: ListAccessPassSubscriptionsDto) {
    return this.accessPassService.listSubscriptions(dto);
  }

  @Post("admin/subscriptions/:id/revoke")
  @Roles(Role.Admin)
  @ApiOperation({
    summary: "Admin: revoke a business access pass and email the reason",
  })
  revokeSubscription(
    @Param("id") id: string,
    @Body() dto: RevokeAccessPassDto,
    @CurrentUser() user: any,
  ) {
    return this.accessPassService.revokeSubscription(id, dto.reason, user.id);
  }
}
