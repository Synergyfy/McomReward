import { Controller, Post, Body, UseGuards, Req, Get } from "@nestjs/common";
import {
  ApiTags,
  ApiOperation,
  ApiBearerAuth,
  ApiResponse,
} from "@nestjs/swagger";
import { ReferralService } from "./referral.service";
import { InviteFriendDto } from "./dto/invite-friend.dto";
import { JwtAuthGuard } from "../../auth/jwt-auth.guard";
import { RolesGuard } from "../../common/guards/roles.guard";
import { Roles } from "../../common/decorators/roles.decorator";
import { Role } from "../../common/role.enum";
import { Referral } from "./entities/referral.entity";
import { ReferralAnalyticsDto } from "./dto/referral-analytics.dto";

@ApiTags("Referrals")
@Controller("referrals")
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class ReferralController {
  constructor(private readonly referralService: ReferralService) {}

  @Post("invite")
  @Roles(Role.Participant)
  @ApiOperation({ summary: "Invite a friend to join" })
  async inviteFriend(@Req() req, @Body() dto: InviteFriendDto) {
    return this.referralService.inviteFriend(req.user.id, dto);
  }

  @Get("my-referrals")
  @Roles(Role.Participant)
  @ApiOperation({ summary: "Get list of my referrals and their status" })
  @ApiResponse({ type: [Referral] })
  async getMyReferrals(@Req() req) {
    return this.referralService.getMyReferrals(req.user.id);
  }

  @Get("analytics")
  @Roles(Role.Participant)
  @ApiOperation({ summary: "Get referral analytics for the current participant" })
  @ApiResponse({ type: ReferralAnalyticsDto })
  async getAnalytics(@Req() req) {
    return this.referralService.getReferralAnalytics(req.user.id);
  }
}
