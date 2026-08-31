import { Controller, Get, Param, Query } from "@nestjs/common";
import { ApiTags, ApiBearerAuth, ApiOperation } from "@nestjs/swagger";
import { StampService } from "../services/stamp.service";
import { Roles } from "../../../common/decorators/roles.decorator";
import { Role } from "../../../common/role.enum";

@ApiTags("Admin")
@ApiBearerAuth()
@Roles(Role.Admin)
@Controller("admin/participants")
export class AdminParticipantStampController {
  constructor(private readonly stampService: StampService) {}

  @Get(":id/stamp-cards")
  @ApiOperation({ summary: "Admin: Get a participant's stamp cards" })
  async getStampCards(
    @Param("id") id: string,
    @Query("status") status?: string,
    @Query("page") page = 1,
    @Query("limit") limit = 10,
  ) {
    const cards = await this.stampService.getParticipantStampCards(id, status);
    const startIndex = (Number(page) - 1) * Number(limit);
    const endIndex = startIndex + Number(limit);
    return {
      data: cards.slice(startIndex, endIndex),
      total: cards.length,
      page: Number(page),
      limit: Number(limit),
      totalPages: Math.ceil(cards.length / Number(limit)),
    };
  }

  @Get(":id/stamp-stats")
  @ApiOperation({ summary: "Admin: Get a participant's stamp stats" })
  getStampStats(@Param("id") id: string) {
    return this.stampService.getParticipantStampStats(id);
  }

  @Get(":id/discoverable-stamp-rewards")
  @ApiOperation({
    summary: "Admin: Get discoverable stamp rewards for a participant",
  })
  getDiscoverable(@Param("id") id: string) {
    return this.stampService.getParticipantDiscoverableStampRewards(id);
  }
}
