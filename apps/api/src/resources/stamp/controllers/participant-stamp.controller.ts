import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  ParseUUIDPipe,
} from "@nestjs/common";
import { ApiTags, ApiBearerAuth, ApiOperation } from "@nestjs/swagger";
import { StampService } from "../services/stamp.service";
import { StartStampCardDto } from "../dto/start-stamp-card.dto";
import { Roles } from "../../../common/decorators/roles.decorator";
import { Role } from "../../../common/role.enum";
import { CurrentUser } from "../../../common/decorators/current-user.decorator";

@ApiTags("Participant Stamp Rewards")
@ApiBearerAuth()
@Roles(Role.Participant)
@Controller("participant/stamps")
export class ParticipantStampController {
  constructor(private readonly stampService: StampService) {}

  @Get("my-cards")
  @ApiOperation({ summary: "Participant: Get my stamp cards" })
  getMyCards(@CurrentUser() user: any) {
    return this.stampService.getMyStampCards(user.id);
  }

  @Get("card/:id")
  @ApiOperation({ summary: "Participant: Get a single stamp card" })
  getCard(@CurrentUser() user: any, @Param("id", ParseUUIDPipe) id: string) {
    return this.stampService.getStampCardById(user.id, id);
  }

  @Get("card/:id/redemption-qr")
  @ApiOperation({
    summary: "Participant: Get redemption QR for a completed card",
  })
  getRedemptionQR(
    @CurrentUser() user: any,
    @Param("id", ParseUUIDPipe) id: string,
  ) {
    return this.stampService.getRedemptionQR(user.id, id);
  }

  @Get("discover")
  @ApiOperation({ summary: "Participant: Get discoverable stamp rewards" })
  discover(@CurrentUser() user: any) {
    return this.stampService.getDiscoverableStampRewards(user.id);
  }

  @Post("start")
  @ApiOperation({ summary: "Participant: Start a new stamp card" })
  start(@CurrentUser() user: any, @Body() dto: StartStampCardDto) {
    return this.stampService.startStampCard(user.id, dto.businessStampRewardId);
  }

  @Get("stats")
  @ApiOperation({ summary: "Participant: Get stamp stats" })
  getStats(@CurrentUser() user: any) {
    return this.stampService.getConsumerStampStats(user.id);
  }

  @Get("business/:businessId")
  @ApiOperation({ summary: "Participant: Get stamp rewards for a business" })
  getByBusiness(@Param("businessId") businessId: string) {
    return this.stampService.getRewardsByBusiness(businessId);
  }
}
