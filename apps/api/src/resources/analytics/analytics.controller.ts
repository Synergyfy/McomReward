import { Controller, Get, Query, UseGuards } from "@nestjs/common";
import { AnalyticsService } from "./analytics.service";
import { ChartQueryDto, ChartResponseDto } from "./dto/chart-analytics.dto";
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from "@nestjs/swagger";
import { Roles } from "../../common/decorators/roles.decorator";
import { Role } from "../../common/role.enum";
import { CurrentUser } from "../../common/decorators/current-user.decorator";
import { User } from "../../common/interfaces/user.interface";
import { GeneralAnalyticsDto } from "./dto/general-analytics.dto";
import { AuthGuard } from "@nestjs/passport";
import { RolesGuard } from "../../common/guards/roles.guard";

@ApiTags("Analytics")
@Controller("analytics")
export class AnalyticsController {
  constructor(private readonly analyticsService: AnalyticsService) {}

  @Get()
  @Roles(Role.Business)
  @ApiBearerAuth()
  @ApiOperation({
    summary: "Get general analytics for a business",
    description: "Accessible by business users.",
  })
  @ApiResponse({
    status: 200,
    description: "General analytics data.",
    type: GeneralAnalyticsDto,
  })
  getGeneralAnalytics(@CurrentUser() user: User): Promise<GeneralAnalyticsDto> {
    return this.analyticsService.getGeneralAnalytics(user);
  }

  @Get("chart")
  @Roles(Role.Business)
  @ApiBearerAuth()
  @ApiOperation({
    summary: "Get chart analytics for a business",
    description: "Accessible by business users.",
  })
  @ApiResponse({
    status: 200,
    description: "Chart analytics data.",
    type: ChartResponseDto,
  })
  getChartAnalytics(
    @CurrentUser() user: User,
    @Query() query: ChartQueryDto,
  ): Promise<ChartResponseDto> {
    return this.analyticsService.getChartAnalytics(user, query.period);
  }
}
