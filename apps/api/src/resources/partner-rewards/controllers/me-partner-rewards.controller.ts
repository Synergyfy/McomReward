import { Body, Controller, Get, Param, Post, Query } from "@nestjs/common";
import { ApiTags, ApiOperation, ApiBearerAuth } from "@nestjs/swagger";
import { Roles } from "../../../common/decorators/roles.decorator";
import { SkipMembershipCheck } from "../../../common/decorators/skip-membership-check.decorator";
import { CurrentUser } from "../../../common/decorators/current-user.decorator";
import { Role } from "../../../common/role.enum";
import { RewardIssuanceService } from "../services/reward-issuance.service";
import { ListIssuancesDto } from "../dto/list-issuances.dto";
import { RedeemIssuanceDto } from "../dto/redeem-issuance.dto";

interface AuthenticatedUser {
  id: string;
  email?: string;
  role?: Role;
}

/**
 * First-party surface for partner-issued rewards.
 *
 * Lets a logged-in MCOM Rewards user (participant or business) see and claim
 * rewards that ecosystem partners such as FundOrDonate have issued to them —
 * the "claim via MCOM Rewards" path. The same human may be registered as a
 * Participant on one app and a Business here; identity is matched across the
 * local user id, the central MCOM user id, and the email so the reward is
 * always reachable from whichever account logs in.
 *
 * Identity comes from the JWT; the server never trusts a caller-supplied
 * recipient id.
 */
@ApiTags("My Partner Rewards")
@ApiBearerAuth()
@Controller("me/partner-rewards")
@Roles(Role.Participant, Role.Business)
@SkipMembershipCheck()
export class MePartnerRewardsController {
  constructor(private readonly issuanceService: RewardIssuanceService) {}

  @Get()
  @ApiOperation({ summary: "List my partner-issued rewards" })
  list(
    @CurrentUser() user: AuthenticatedUser,
    @Query() query: ListIssuancesDto,
  ) {
    return this.issuanceService.listForUser(
      { id: user.id, email: user.email },
      query,
    );
  }

  @Get(":id/mall-targets")
  @ApiOperation({
    summary: "Get the Mall products/services a partner reward applies to",
  })
  mallTargets(
    @CurrentUser() user: AuthenticatedUser,
    @Param("id") id: string,
  ) {
    return this.issuanceService.getMallTargetDetailsForUser(
      { id: user.id, email: user.email },
      id,
    );
  }

  @Post(":id/claim")
  @ApiOperation({ summary: "Claim one of my partner-issued rewards" })
  claim(
    @CurrentUser() user: AuthenticatedUser,
    @Param("id") id: string,
    @Body() dto: RedeemIssuanceDto,
  ) {
    return this.issuanceService.claimForUser(
      { id: user.id, email: user.email },
      id,
      dto,
    );
  }
}
