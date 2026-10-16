import { Controller, Get, Query, Req } from "@nestjs/common";
import { ApiTags, ApiBearerAuth, ApiOperation } from "@nestjs/swagger";
import { Roles } from "../../common/decorators/roles.decorator";
import { Role } from "../../common/role.enum";
import { BusinessAssetsService } from "./business-assets.service";

@ApiTags("Revenue")
@ApiBearerAuth()
@Roles(Role.Business, Role.Staff, Role.Admin)
@Controller("revenue")
export class RevenueAnalyticsController {
  constructor(private readonly businessAssetsService: BusinessAssetsService) {}

  @Get("analytics")
  @ApiOperation({ summary: "Get revenue analytics for the current business" })
  getAnalytics(@Req() req, @Query("businessId") businessId?: string) {
    const tenantId = businessId ?? req.user?.businessId ?? req.user?.id;
    return this.businessAssetsService.getRevenueAnalytics(tenantId);
  }
}
