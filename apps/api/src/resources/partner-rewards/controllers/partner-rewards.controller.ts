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
  SERVICE_SCOPE_REWARDS_GIFT,
  SERVICE_SCOPE_REWARDS_ISSUE,
  SERVICE_SCOPE_REWARDS_READ,
} from "../../service-mesh/constants";
import { AuthenticatedServiceRequest } from "../../service-mesh/interfaces/authenticated-service-request.interface";
import { PartnerRewardsService } from "../services/partner-rewards.service";
import { RewardIssuanceService } from "../services/reward-issuance.service";
import { ListPartnerRewardsDto } from "../dto/list-partner-rewards.dto";
import { IssueRewardDto } from "../dto/issue-reward.dto";
import { GiftRewardDto } from "../dto/gift-reward.dto";

@ApiTags("Partner Rewards")
@ApiSecurity("mcom-service-token")
@Controller("partner/rewards")
@Public()
@UseGuards(ServiceAuthGuard, ServiceScopesGuard)
export class PartnerRewardsController {
  constructor(
    private readonly partnerRewardsService: PartnerRewardsService,
    private readonly issuanceService: RewardIssuanceService,
  ) {}

  @Get()
  @RequireServiceScopes(SERVICE_SCOPE_REWARDS_READ)
  @ApiOperation({ summary: "Partner: list the MCOM reward catalogue" })
  list(@Query() query: ListPartnerRewardsDto) {
    return this.partnerRewardsService.listCatalog(query);
  }

  @Get(":id")
  @RequireServiceScopes(SERVICE_SCOPE_REWARDS_READ)
  @ApiOperation({ summary: "Partner: get a single reward" })
  getOne(@Param("id") id: string) {
    return this.partnerRewardsService.getCatalogReward(id);
  }

  @Post(":id/issue")
  @RequireServiceScopes(SERVICE_SCOPE_REWARDS_ISSUE)
  @ApiOperation({ summary: "Partner: issue a reward to a recipient" })
  issue(
    @Param("id") id: string,
    @Body() dto: IssueRewardDto,
    @Req() req: AuthenticatedServiceRequest,
  ) {
    return this.issuanceService.issue(
      req.serviceCaller.callerAppId,
      id,
      dto,
      req.serviceCaller,
    );
  }

  @Post(":id/gift")
  @RequireServiceScopes(SERVICE_SCOPE_REWARDS_GIFT)
  @ApiOperation({
    summary: "Partner admin: gift an MCOM catalogue reward to an MCOM user",
    description:
      "Platform-sponsored: grants an admin-created (MCOM) catalogue reward to an MCOM user without a business sponsor. Requires the dedicated `rewards:gift` scope. The recipient must resolve to an MCOM participant account.",
  })
  gift(
    @Param("id") id: string,
    @Body() dto: GiftRewardDto,
    @Req() req: AuthenticatedServiceRequest,
  ) {
    return this.issuanceService.gift(
      req.serviceCaller.callerAppId,
      id,
      dto,
      req.serviceCaller,
    );
  }
}
