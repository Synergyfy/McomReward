import { Controller, Get, Post, Body, UseGuards, Req } from "@nestjs/common";
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from "@nestjs/swagger";
import { McomPackagesService } from "./mcom-packages.service";
import { InitiatePlatformPurchaseDto } from "./dto/initiate-purchase.dto";
import { ConfirmPlatformPurchaseDto } from "./dto/confirm-purchase.dto";
import { JwtAuthGuard } from "../../auth/jwt-auth.guard";
import { RolesGuard } from "../../common/guards/roles.guard";
import { Roles } from "../../common/decorators/roles.decorator";
import { Role } from "../../common/role.enum";
import { Public } from "../../common/decorators/public.decorator";
import { CurrentUser } from "../../common/decorators/current-user.decorator";
import { SkipMembershipCheck } from "../../common/decorators/skip-membership-check.decorator";

@ApiTags("MCOM Packages & Billing")
@Controller("mcom/packages")
@UseGuards(JwtAuthGuard, RolesGuard)
@SkipMembershipCheck()
export class McomPackagesController {
  constructor(private readonly mcomPackagesService: McomPackagesService) {}

  @Public()
  @Get("plans")
  @ApiOperation({ summary: "List active purchasable plans from Rewards" })
  @ApiResponse({ status: 200, description: "Return all active plans" })
  async getPurchasablePlans() {
    return this.mcomPackagesService.getPurchasablePlans();
  }

  @Post("purchase/initiate")
  @ApiBearerAuth()
  @Roles(Role.Business)
  @ApiOperation({
    summary:
      "Initiate in-app plan purchase via MCOM Solutions (Stripe/PayPal/Wallet)",
  })
  @ApiResponse({
    status: 200,
    description: "Payment intent / approval URL returned",
  })
  @ApiResponse({
    status: 401,
    description: "Not linked to MCOM or session expired",
  })
  async initiatePurchase(
    @CurrentUser() user: any,
    @Body() dto: InitiatePlatformPurchaseDto,
  ) {
    return this.mcomPackagesService.initiatePurchase(user.id, dto);
  }

  @Post("purchase/confirm")
  @ApiBearerAuth()
  @Roles(Role.Business)
  @ApiOperation({
    summary: "Confirm plan purchase and activate local entitlements",
  })
  @ApiResponse({
    status: 200,
    description: "Subscription activated successfully",
  })
  async confirmPurchase(
    @CurrentUser() user: any,
    @Body() dto: ConfirmPlatformPurchaseDto,
  ) {
    return this.mcomPackagesService.confirmPurchase(user.id, dto);
  }

  @Get("my-package")
  @ApiBearerAuth()
  @Roles(Role.Business)
  @ApiOperation({
    summary: "Get current user subscription package and MCOM connection status",
  })
  async getMyActivePackage(@CurrentUser() user: any) {
    return this.mcomPackagesService.getMyActivePackage(user.id);
  }
}
