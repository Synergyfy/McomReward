import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository, In } from "typeorm";
import { Campaign } from "../campaign/entities/campaign.entity";
import { BusinessCampaign } from "../campaign/entities/business-campaign.entity";
import {
  PointHistory,
  PointHistoryType,
} from "../participant-campaign-balance/entities/point-history.entity";
import { Participant } from "../participant/entities/participant.entity";
import { BusinessReward } from "../rewards/entities/business-reward.entity";
import { GeneralAnalyticsDto } from "./dto/general-analytics.dto";
import { User } from "src/common/interfaces/user.interface";
import { ChartResponseDto, ChartData } from "./dto/chart-analytics.dto";

@Injectable()
export class AnalyticsService {
  constructor(
    @InjectRepository(Campaign)
    private readonly campaignRepository: Repository<Campaign>,
    @InjectRepository(PointHistory)
    private readonly pointHistoryRepository: Repository<PointHistory>,
    @InjectRepository(Participant)
    private readonly participantRepository: Repository<Participant>,
    @InjectRepository(BusinessCampaign)
    private readonly businessCampaignRepository: Repository<BusinessCampaign>,
    @InjectRepository(BusinessReward)
    private readonly businessRewardRepository: Repository<BusinessReward>,
  ) {}

  async getGeneralAnalytics(user: User): Promise<GeneralAnalyticsDto> {
    const businessId = user.id;
    const now = new Date();

    // Fetch BusinessCampaigns directly
    const businessCampaigns = await this.businessCampaignRepository.find({
      where: { business: { id: businessId } },
      relations: [
        "participantCampaignBalances",
        "participantCampaignBalances.participant",
      ],
    });

    const totalCampaigns = businessCampaigns.length;

    const activeCampaigns = businessCampaigns.filter(
      (bc) =>
        !bc.disabled &&
        new Date(bc.start_date) <= now &&
        new Date(bc.end_date) >= now,
    );
    const totalActiveCampaigns = activeCampaigns.length;

    const businessCampaignIds = businessCampaigns.map((bc) => bc.id);

    let totalCustomers = 0;
    if (businessCampaigns.length > 0) {
      const uniqueParticipants = new Set<string>();
      businessCampaigns.forEach((bc) => {
        if (bc.participantCampaignBalances) {
          bc.participantCampaignBalances.forEach((pcb) => {
            if (pcb.participant) {
              uniqueParticipants.add(pcb.participant.id);
            }
          });
        }
      });
      totalCustomers = uniqueParticipants.size;
    }

    // Calculate points from PointHistory using business_campaign_id
    let totalPointsEarned = 0;
    let totalPointsRedeemed = 0;

    if (businessCampaignIds.length > 0) {
      const earnedResult = await this.pointHistoryRepository
        .createQueryBuilder("ph")
        .select("SUM(ph.points)", "total")
        .where("ph.business_campaign_id IN (:...ids)", {
          ids: businessCampaignIds,
        })
        .andWhere("ph.type IN (:...types)", {
          types: [PointHistoryType.EARN],
        })
        .getRawOne();

      totalPointsEarned = parseInt(earnedResult.total, 10) || 0;

      const redeemedResult = await this.pointHistoryRepository
        .createQueryBuilder("ph")
        .select("SUM(ph.points)", "total")
        .where("ph.business_campaign_id IN (:...ids)", {
          ids: businessCampaignIds,
        })
        .andWhere("ph.type = :type", { type: PointHistoryType.REDEEM })
        .getRawOne();

      totalPointsRedeemed = parseInt(redeemedResult.total, 10) || 0;
    }

    const totalRewardsRedeemed =
      businessCampaignIds.length > 0
        ? await this.pointHistoryRepository.count({
            where: {
              businessCampaign: { id: In(businessCampaignIds) },
              type: PointHistoryType.REDEEM,
            },
          })
        : 0;

    const activeCampaignsWithCustomerCounts = activeCampaigns.map((bc) => ({
      name: bc.name,
      customerCount: bc.participantCampaignBalances
        ? bc.participantCampaignBalances.length
        : 0,
    }));

    const lastTenActivities =
      businessCampaignIds.length > 0
        ? await this.pointHistoryRepository.find({
            where: { businessCampaign: { id: In(businessCampaignIds) } },
            order: { created_at: "DESC" },
            take: 10,
            relations: ["participant", "businessCampaign"],
          })
        : [];

    const totalMembers = totalCustomers;
    const totalPointsIssued = totalPointsEarned;

    let giftCardsIssued = 0;
    let giftCardsRedeemed = 0;
    let repeatCustomerRate = 0;
    let redemptionRate = 0;
    let averageSpend = 0;
    let customerLtv = 0;
    let revenueGenerated = 0;

    if (businessCampaignIds.length > 0) {
      const businessRewards = await this.businessRewardRepository.find({
        where: {
          business: { id: businessId },
          mall_reward_type: "GIFT_CARD",
        },
      });
      const businessRewardIds = businessRewards.map((r) => r.id);

      if (businessRewardIds.length > 0) {
        giftCardsIssued = await this.pointHistoryRepository.count({
          where: {
            business: { id: businessId },
            businessReward: { id: In(businessRewardIds) },
            type: PointHistoryType.REDEEM,
          },
        });
        giftCardsRedeemed = await this.pointHistoryRepository.count({
          where: {
            business: { id: businessId },
            businessReward: { id: In(businessRewardIds) },
            type: PointHistoryType.EARN,
          },
        });
      }

      const participantsWithMultipleTx = await this.pointHistoryRepository
        .createQueryBuilder("ph")
        .select("ph.participant_id")
        .where("ph.business_id = :businessId", { businessId })
        .groupBy("ph.participant_id")
        .having("COUNT(ph.id) > 1")
        .getRawMany();

      if (totalCustomers > 0) {
        repeatCustomerRate = Math.round(
          (participantsWithMultipleTx.length / totalCustomers) * 100,
        );
      }
    }

    if (totalPointsEarned > 0) {
      redemptionRate = Math.round(
        (totalPointsRedeemed / totalPointsEarned) * 100 * 10,
      ) / 10;
    }
    if (totalCustomers > 0 && totalPointsEarned > 0) {
      averageSpend = Math.round((totalPointsEarned / totalCustomers) * 100) / 100;
    }
    if (totalCustomers > 0 && totalPointsEarned > 0 && totalRewardsRedeemed > 0) {
      customerLtv = Math.round((totalPointsEarned / totalCustomers) * 100) / 100;
    }

    return {
      totalCustomers,
      totalMembers,
      totalCampaigns,
      totalActiveCampaigns,
      totalRewardsRedeemed,
      totalPointsEarned,
      totalPointsIssued,
      totalPointsRedeemed,
      giftCardsIssued,
      giftCardsRedeemed,
      repeatCustomerRate,
      redemptionRate,
      averageSpend,
      customerLtv,
      revenueGenerated,
      activeCampaigns: activeCampaignsWithCustomerCounts,
      lastTenActivities,
    };
  }

  async getChartAnalytics(
    user: User,
    period: string,
  ): Promise<ChartResponseDto> {
    const businessId = user.id;
    const now = new Date();
    let startDate: Date;

    switch (period) {
      case "7d":
        startDate = new Date(now.setDate(now.getDate() - 7));
        break;
      case "30d":
        startDate = new Date(now.setMonth(now.getMonth() - 1));
        break;
      case "3m":
        startDate = new Date(now.setMonth(now.getMonth() - 3));
        break;
      case "6m":
        startDate = new Date(now.setMonth(now.getMonth() - 6));
        break;
      case "1y":
        startDate = new Date(now.setFullYear(now.getFullYear() - 1));
        break;
      default:
        startDate = new Date(now.setMonth(now.getMonth() - 1));
    }

    const campaigns = await this.campaignRepository.find({
      where: { business: { id: businessId } },
    });
    const campaignIds = campaigns.map((c) => c.id);

    if (campaignIds.length === 0) {
      return { data: [] };
    }

    const earnedPoints = await this.pointHistoryRepository
      .createQueryBuilder("ph")
      .select("DATE(ph.created_at) as date, SUM(ph.points) as points")
      .where("ph.campaign_id IN (:...campaignIds)", { campaignIds })
      .andWhere("ph.type = :type", { type: PointHistoryType.EARN })
      .andWhere("ph.created_at >= :startDate", { startDate })
      .groupBy("DATE(ph.created_at)")
      .orderBy("DATE(ph.created_at)", "ASC")
      .getRawMany();

    const redeemedPoints = await this.pointHistoryRepository
      .createQueryBuilder("ph")
      .select("DATE(ph.created_at) as date, SUM(ph.points) as points")
      .where("ph.campaign_id IN (:...campaignIds)", { campaignIds })
      .andWhere("ph.type = :type", { type: PointHistoryType.REDEEM })
      .andWhere("ph.created_at >= :startDate", { startDate })
      .groupBy("DATE(ph.created_at)")
      .orderBy("DATE(ph.created_at)", "ASC")
      .getRawMany();

    const data: { [key: string]: ChartData } = {};

    earnedPoints.forEach((row) => {
      const date = new Date(row.date).toISOString().split("T")[0];
      if (!data[date]) {
        data[date] = { date, pointsEarned: 0, pointsRedeemed: 0 };
      }
      data[date].pointsEarned = parseInt(row.points, 10);
    });

    redeemedPoints.forEach((row) => {
      const date = new Date(row.date).toISOString().split("T")[0];
      if (!data[date]) {
        data[date] = { date, pointsEarned: 0, pointsRedeemed: 0 };
      }
      data[date].pointsRedeemed = parseInt(row.points, 10);
    });

    return { data: Object.values(data) };
  }
}
