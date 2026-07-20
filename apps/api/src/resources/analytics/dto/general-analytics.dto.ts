import { ApiProperty } from "@nestjs/swagger";
import { PointHistory } from "../../participant-campaign-balance/entities/point-history.entity";

class ActiveCampaign {
  @ApiProperty({ example: "Summer Sale Campaign" })
  name: string;

  @ApiProperty({ example: 120 })
  customerCount: number;
}

export class GeneralAnalyticsDto {
  @ApiProperty({ example: 500 })
  totalCustomers: number;

  @ApiProperty({ example: 500 })
  totalMembers: number;

  @ApiProperty({ example: 10 })
  totalCampaigns: number;

  @ApiProperty({ example: 5 })
  totalActiveCampaigns: number;

  @ApiProperty({ example: 150 })
  totalRewardsRedeemed: number;

  @ApiProperty({ example: 10000 })
  totalPointsEarned: number;

  @ApiProperty({ example: 10000 })
  totalPointsIssued: number;

  @ApiProperty({ example: 5000 })
  totalPointsRedeemed: number;

  @ApiProperty({ example: 42 })
  giftCardsIssued: number;

  @ApiProperty({ example: 18 })
  giftCardsRedeemed: number;

  @ApiProperty({ example: 68 })
  repeatCustomerRate: number;

  @ApiProperty({ example: 28500 })
  revenueGenerated: number;

  @ApiProperty({ example: 42.3 })
  redemptionRate: number;

  @ApiProperty({ example: 36.75 })
  averageSpend: number;

  @ApiProperty({ example: 284.5 })
  customerLtv: number;

  @ApiProperty({ type: [ActiveCampaign] })
  activeCampaigns: ActiveCampaign[];

  @ApiProperty({ type: [PointHistory] })
  lastTenActivities: PointHistory[];
}
