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
import { PartnerRewardsService } from "../services/partner-rewards.service";
import { RewardIssuanceService } from "../services/reward-issuance.service";
import { ListBusinessRewardsDto } from "../dto/list-business-rewards.dto";
import { IssueBusinessRewardDto } from "../dto/issue-business-reward.dto";

@ApiTags("Partner Rewards")
@ApiSecurity("mcom-service-token")
@Controller("partner/business-rewards")
@Public()
@UseGuards(ServiceAuthGuard, ServiceScopesGuard)
export class PartnerBusinessRewardsController {
  constructor(
    private readonly partnerRewardsService: PartnerRewardsService,
    private readonly issuanceService: RewardIssuanceService,
  ) {}

  @Get()
  @RequireServiceScopes(SERVICE_SCOPE_REWARDS_READ)
  @ApiOperation({
    summary: "Partner: list the rewards owned by a specific business",
    description:
      "Identify the business with mcomUserId (preferred) or email. Returns the rewards the business owns.",
  })
  list(@Query() query: ListBusinessRewardsDto) {
    return this.partnerRewardsService.listBusinessRewards(query);
  }

  @Post(":id/issue")
  @RequireServiceScopes(SERVICE_SCOPE_REWARDS_ISSUE)
  @ApiOperation({
    summary: "Partner: issue one of a business's own rewards to a recipient",
    description:
      "Grants a reward the business owns (BusinessReward) to a recipient. The owning business is derived from the reward; its entitlement and stock are enforced.",
  })
  issue(
    @Param("id") id: string,
    @Body() dto: IssueBusinessRewardDto,
    @Req() req: AuthenticatedServiceRequest,
  ) {
    return this.issuanceService.issueBusinessReward(
      req.serviceCaller.callerAppId,
      id,
      dto,
      req.serviceCaller,
    );
  }
}
