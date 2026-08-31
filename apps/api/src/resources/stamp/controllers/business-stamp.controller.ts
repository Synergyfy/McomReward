import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  ParseUUIDPipe,
} from "@nestjs/common";
import { ApiTags, ApiBearerAuth, ApiOperation } from "@nestjs/swagger";
import { StampService } from "../services/stamp.service";
import { ActivateStampRewardDto } from "../dto/activate-stamp-reward.dto";
import { RedeemStampCardDto } from "../dto/redeem-stamp-card.dto";
import { Roles } from "../../../common/decorators/roles.decorator";
import { Role } from "../../../common/role.enum";
import { CurrentUser } from "../../../common/decorators/current-user.decorator";

@ApiTags("Business Stamp Rewards")
@ApiBearerAuth()
@Roles(Role.Business)
@Controller("business/stamps")
export class BusinessStampController {
  constructor(private readonly stampService: StampService) {}

  @Get("templates")
  @ApiOperation({ summary: "Business: Get available stamp reward templates" })
  getAvailableTemplates(@CurrentUser() user: any) {
    return this.stampService.getAvailableTemplates(user.id);
  }

  @Get("active")
  @ApiOperation({ summary: "Business: Get activated stamp rewards" })
  getActive(@CurrentUser() user: any) {
    return this.stampService.getBusinessStampRewards(user.id);
  }

  @Post("activate")
  @ApiOperation({ summary: "Business: Activate a stamp reward template" })
  activate(@CurrentUser() user: any, @Body() dto: ActivateStampRewardDto) {
    return this.stampService.activateStampReward(user.id, dto);
  }

  @Get("stats")
  @ApiOperation({ summary: "Business: Get stamp reward stats" })
  getStats(@CurrentUser() user: any) {
    return this.stampService.getStampRewardStats(user.id);
  }

  @Post("active/:id/pause")
  @ApiOperation({ summary: "Business: Pause an active stamp reward" })
  pause(@CurrentUser() user: any, @Param("id", ParseUUIDPipe) id: string) {
    return this.stampService.pauseStampReward(user.id, id);
  }

  @Post("active/:id/resume")
  @ApiOperation({ summary: "Business: Resume a paused stamp reward" })
  resume(@CurrentUser() user: any, @Param("id", ParseUUIDPipe) id: string) {
    return this.stampService.resumeStampReward(user.id, id);
  }

  @Delete("active/:id")
  @ApiOperation({ summary: "Business: Deactivate a stamp reward" })
  deactivate(@CurrentUser() user: any, @Param("id", ParseUUIDPipe) id: string) {
    return this.stampService.deactivateStampReward(user.id, id);
  }

  @Get("active/:id/customers")
  @ApiOperation({ summary: "Business: Get customer stamp cards for a reward" })
  getCustomers(
    @CurrentUser() user: any,
    @Param("id", ParseUUIDPipe) id: string,
  ) {
    return this.stampService.getCustomerStampCards(user.id, id);
  }

  @Post("redeem")
  @ApiOperation({ summary: "Business: Redeem a completed stamp card" })
  redeem(@CurrentUser() user: any, @Body() dto: RedeemStampCardDto) {
    return this.stampService.redeemStampCard(
      user.id,
      dto.stampCardId,
      dto.participantUniqueCode,
    );
  }
}
