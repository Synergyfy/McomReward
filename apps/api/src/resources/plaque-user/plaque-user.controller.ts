import { Controller, Get, Post, Param, UseGuards } from "@nestjs/common";
import { ApiTags, ApiBearerAuth, ApiOperation } from "@nestjs/swagger";
import { PlaqueUserService } from "./plaque-user.service";
import { JwtAuthGuard } from "../../auth/jwt-auth.guard";
import { RolesGuard } from "../../common/guards/roles.guard";
import { Roles } from "../../common/decorators/roles.decorator";
import { Role } from "../../common/role.enum";
import { Public } from "../../common/decorators/public.decorator";
import { CurrentUser } from "../../common/decorators/current-user.decorator";
import { User } from "../../common/interfaces/user.interface";

@ApiTags("Plaque User")
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller("plaque-user")
export class PlaqueUserController {
  constructor(private readonly plaqueUserService: PlaqueUserService) {}

  @Get("summary")
  @Roles(Role.Business, Role.Network, Role.Partner)
  @ApiOperation({ summary: "Get plaque-user dashboard summary" })
  getSummary(@CurrentUser() user: User) {
    return this.plaqueUserService.getSummary(user.id);
  }

  @Get("plaques")
  @Roles(Role.Business, Role.Network, Role.Partner)
  @ApiOperation({ summary: "Get plaques owned by the current user" })
  getPlaques(@CurrentUser() user: User) {
    return this.plaqueUserService.getPlaques(user.id);
  }

  @Get("activities")
  @Roles(Role.Business, Role.Network, Role.Partner)
  @ApiOperation({ summary: "Get recent plaque activity for the current user" })
  getActivities(@CurrentUser() user: User) {
    return this.plaqueUserService.getActivities(user.id);
  }
}

@ApiTags("Plaque Scan")
@Controller("qr-plaques")
export class PlaqueScanController {
  constructor(private readonly plaqueUserService: PlaqueUserService) {}

  @Public()
  @Post(":code/scan")
  @ApiOperation({ summary: "Record a public plaque scan by code" })
  recordScan(@Param("code") code: string) {
    return this.plaqueUserService.recordScan(code);
  }
}
