import { Controller, Get, UseGuards } from "@nestjs/common";
import { ApiTags, ApiOperation, ApiBearerAuth } from "@nestjs/swagger";
import { McomPackagesService } from "./mcom-packages.service";
import { JwtAuthGuard } from "../../auth/jwt-auth.guard";
import { RolesGuard } from "../../common/guards/roles.guard";
import { Roles } from "../../common/decorators/roles.decorator";
import { Role } from "../../common/role.enum";
import { CurrentUser } from "../../common/decorators/current-user.decorator";
import { SkipMembershipCheck } from "../../common/decorators/skip-membership-check.decorator";

@ApiTags("Legacy Membership Compatibility")
@Controller("membership")
@UseGuards(JwtAuthGuard, RolesGuard)
@SkipMembershipCheck()
export class LegacyMembershipController {
  constructor(private readonly mcomPackagesService: McomPackagesService) {}

  @Get("my-membership")
  @ApiBearerAuth()
  @Roles(Role.Business)
  @ApiOperation({
    summary: "Backward compatibility endpoint for my-membership",
  })
  async getMyMembership(@CurrentUser() user: any) {
    const data = await this.mcomPackagesService.getMyActivePackage(user.id);
    return data.membership || data;
  }
}
