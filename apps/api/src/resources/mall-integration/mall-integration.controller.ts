import { Controller, Get, UseGuards, Req } from "@nestjs/common";
import { MallIntegrationService } from "./mall-integration.service";
import { JwtAuthGuard } from "../../auth/jwt-auth.guard";
import { Public } from "../../common/decorators/public.decorator";
import { ApiTags, ApiOperation, ApiBearerAuth } from "@nestjs/swagger";

@ApiTags("mall-integration")
@ApiBearerAuth()
@Controller("mall-integration")
export class MallIntegrationController {
  constructor(
    private readonly mallIntegrationService: MallIntegrationService,
  ) {}

  @ApiOperation({ summary: "Get SSO login URL for McomMall" })
  @UseGuards(JwtAuthGuard)
  @Get("sso-url")
  async getSsoUrl(@Req() req: any) {
    const user = req.user;
    return this.mallIntegrationService.generateSsoToken({
      email: user.email,
      name: user.name || user.email,
      role: user.role,
      phoneNumber: user.phoneNumber,
    });
  }

  @Public()
  @Get("plans")
  @ApiOperation({ summary: "Get plans from MCOM Mall" })
  async getMallPlans() {
    return this.mallIntegrationService.getMallPlans();
  }
}
