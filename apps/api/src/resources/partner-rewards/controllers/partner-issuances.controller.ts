import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Query,
  Req,
  UseGuards,
} from "@nestjs/common";
import { ApiTags, ApiOperation, ApiSecurity } from "@nestjs/swagger";
import { Public } from "../../../common/decorators/public.decorator";
import { ServiceAuthGuard } from "../../service-mesh/guards/service-auth.guard";
import { ServiceScopesGuard } from "../../service-mesh/guards/service-scopes.guard";
import { RequireServiceScopes } from "../../service-mesh/decorators/require-service-scopes.decorator";
import {
  SERVICE_SCOPE_REWARDS_ISSUE,
  SERVICE_SCOPE_REWARDS_READ,
} from "../../service-mesh/constants";
import { AuthenticatedServiceRequest } from "../../service-mesh/interfaces/authenticated-service-request.interface";
import { RewardIssuanceService } from "../services/reward-issuance.service";
import { ListIssuancesDto } from "../dto/list-issuances.dto";
import {
  RedeemIssuanceDto,
  RevokeIssuanceDto,
} from "../dto/redeem-issuance.dto";

@ApiTags("Partner Issuances")
@ApiSecurity("mcom-service-token")
@Controller("partner/issuances")
@Public()
@UseGuards(ServiceAuthGuard, ServiceScopesGuard)
export class PartnerIssuancesController {
  constructor(private readonly issuanceService: RewardIssuanceService) {}

  @Get()
  @RequireServiceScopes(SERVICE_SCOPE_REWARDS_READ)
  @ApiOperation({
    summary: "Partner: list issuances for this caller",
    description:
      "Filter by recipientEmail / recipientMcomUserId / recipientUserId to fetch a specific user's earned rewards.",
  })
  list(
    @Query() query: ListIssuancesDto,
    @Req() req: AuthenticatedServiceRequest,
  ) {
    return this.issuanceService.list(
      req.serviceCaller.callerAppId,
      query,
      req.serviceCaller,
    );
  }

  @Get("me")
  @RequireServiceScopes(SERVICE_SCOPE_REWARDS_READ)
  @ApiOperation({
    summary:
      "Partner: list the authenticated user's own reward issuances (delegated token only)",
  })
  listMine(
    @Query() query: ListIssuancesDto,
    @Req() req: AuthenticatedServiceRequest,
  ) {
    return this.issuanceService.listMine(
      req.serviceCaller.callerAppId,
      req.serviceCaller,
      query,
    );
  }

  @Get(":id")
  @RequireServiceScopes(SERVICE_SCOPE_REWARDS_READ)
  @ApiOperation({ summary: "Partner: get issuance status" })
  getOne(@Param("id") id: string, @Req() req: AuthenticatedServiceRequest) {
    return this.issuanceService.findOne(
      req.serviceCaller.callerAppId,
      id,
      req.serviceCaller,
    );
  }

  @Post(":id/redeem")
  @RequireServiceScopes(SERVICE_SCOPE_REWARDS_ISSUE)
  @ApiOperation({ summary: "Partner: mark an issuance redeemed" })
  redeem(
    @Param("id") id: string,
    @Body() dto: RedeemIssuanceDto,
    @Req() req: AuthenticatedServiceRequest,
  ) {
    return this.issuanceService.redeem(
      req.serviceCaller.callerAppId,
      id,
      dto,
      req.serviceCaller,
    );
  }

  @Post(":id/revoke")
  @RequireServiceScopes(SERVICE_SCOPE_REWARDS_ISSUE)
  @ApiOperation({ summary: "Partner: revoke an issuance" })
  revoke(
    @Param("id") id: string,
    @Body() dto: RevokeIssuanceDto,
    @Req() req: AuthenticatedServiceRequest,
  ) {
    return this.issuanceService.revoke(
      req.serviceCaller.callerAppId,
      id,
      dto,
      req.serviceCaller,
    );
  }
}
