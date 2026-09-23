import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Between, In, Repository } from "typeorm";
import moment from "moment";

import { Business } from "../../business/entities/business.entity";
import { Campaign } from "../../campaign/entities/campaign.entity";
import { Participant } from "../../participant/entities/participant.entity";
import {
  PointHistory,
  PointHistoryType,
} from "../../participant-campaign-balance/entities/point-history.entity";
import { Reward } from "../../rewards/entities/reward.entity";
import {
  SystemOverviewDto,
  TopBusinessDto,
  TopRewardDto,
} from "../dto/admin_analytics.dto";
import { BusinessCampaign } from "../../campaign/entities/business-campaign.entity";
import { ParticipantCampaignBalance } from "../../participant-campaign-balance/entities/participant-campaign-balance.entity";
import {
  GrowthActivityChartDto,
  GrowthActivityResponseDto,
} from "../dto/growth-activity-chart.dto";
import { PointLogResponseDto, PointLogItemDto } from "../dto/point-log.dto";
import { PointLogFilterDto } from "../dto/point-log-filter.dto";
import { PaginationDto } from "../../../common/dto/pagination.dto";

@Injectable()
export class AdminAnalyticsService {
  // Lightweight in-memory cache (avoids adding @nestjs/cache-manager dep).
  // Dashboard + reporting pages hit these aggregations on every visit.
  private readonly cache = new Map<string, { expires: number; value: any }>();
  private readonly TTL_SYSTEM_OVERVIEW = 5 * 60 * 1000;
  private readonly TTL_TOP = 10 * 60 * 1000;
  private readonly TTL_GROWTH = 5 * 60 * 1000;

  private getCached<T>(key: string): T | undefined {
    const entry = this.cache.get(key);
    if (!entry) return undefined;
    if (Date.now() > entry.expires) {
      this.cache.delete(key);
      return undefined;
    }
    return entry.value as T;
  }

  private setCached(key: string, value: any, ttl: number) {
    this.cache.set(key, { expires: Date.now() + ttl, value });
  }
  constructor(
    @InjectRepository(Campaign)
    private readonly campaignRepository: Repository<Campaign>,
    @InjectRepository(Participant)
    private readonly participantRepository: Repository<Participant>,
    @InjectRepository(PointHistory)
    private readonly pointHistoryRepository: Repository<PointHistory>,
    @InjectRepository(Business)
    private readonly businessRepository: Repository<Business>,
    @InjectRepository(Reward)
    private readonly rewardRepository: Repository<Reward>,
    @InjectRepository(BusinessCampaign)
    private readonly businessCampaignRepository: Repository<BusinessCampaign>,
    @InjectRepository(ParticipantCampaignBalance)
    private readonly participantCampaignBalanceRepository: Repository<ParticipantCampaignBalance>,
  ) {}

  /**
   * Retrieves a high-level overview of the entire system.
   * @returns A promise that resolves to an object containing total campaigns, participants, and redemptions.
   */
  async getSystemOverview(): Promise<SystemOverviewDto> {
    const cacheKey = "system-overview";
    const cached = this.getCached<SystemOverviewDto>(cacheKey);
    if (cached) return cached;

    // Parallelise the 6 independent aggregate queries (was sequential)
    const [
      totalCampaigns,
      totalParticipants,
      totalRedemptions,
      totalBusiness,
      bizPoints,
      partPoints,
    ] = await Promise.all([
      this.campaignRepository.count(),
      this.participantRepository.count(),
      this.pointHistoryRepository.count({
        where: { type: PointHistoryType.REDEEM },
      }),
      this.businessRepository.count(),
      this.businessRepository
        .createQueryBuilder("business")
        .select("SUM(business.matching_points)", "totalBusinessMatchingPoints")
        .getRawOne(),
      this.participantRepository
        .createQueryBuilder("participant")
        .select(
          "SUM(participant.matching_points)",
          "totalParticipantMatchingPoints",
        )
        .getRawOne(),
    ]);

    const totalMatchingPoints =
      (parseInt(bizPoints?.totalBusinessMatchingPoints, 10) || 0) +
      (parseInt(partPoints?.totalParticipantMatchingPoints, 10) || 0);

    const result = {
      totalCampaigns,
      totalParticipants,
      totalRedemptions,
      totalBusiness,
      totalMatchingPoints,
    };
    this.setCached(cacheKey, result, this.TTL_SYSTEM_OVERVIEW);
    return result;
  }

  /**
   * Retrieves the top 10 performing businesses based on the sum of points earned and redeemed in their campaigns.
   * @returns A promise that resolves to a list of the top 10 businesses.
   */
  async getTopBusinesses(): Promise<TopBusinessDto[]> {
    const cacheKey = "top-businesses";
    const cached = this.getCached<TopBusinessDto[]>(cacheKey);
    if (cached) return cached;

    const topBusinesses = await this.businessRepository
      .createQueryBuilder("business")
      .select("business.id", "id")
      .addSelect("business.name", "name")
      .addSelect("business.total_points_earned", "totalPointsEarned")
      .addSelect("business.total_points_redeemed", "totalPointsRedeemed")
      .orderBy(
        "business.total_points_earned + business.total_points_redeemed",
        "DESC",
      )
      .limit(10)
      .getRawMany();

    const result = topBusinesses.map((b) => ({
      ...b,
      totalPointsEarned: parseInt(b.totalPointsEarned, 10) || 0,
      totalPointsRedeemed: parseInt(b.totalPointsRedeemed, 10) || 0,
    }));
    this.setCached(cacheKey, result, this.TTL_TOP);
    return result;
  }

  /**
   * Retrieves the top 10 most popular rewards based on the number of times they have been redeemed.
   * This includes rewards from both admin-created and business-created campaigns.
   * @returns A promise that resolves to a list of the top 10 rewards.
   */
  async getTopRewards(): Promise<TopRewardDto[]> {
    const cacheKey = "top-rewards";
    const cached = this.getCached<TopRewardDto[]>(cacheKey);
    if (cached) return cached;

    const topRewards = await this.pointHistoryRepository
      .createQueryBuilder("ph")
      .select("reward.id", "id")
      .addSelect("reward.title", "name")
      .addSelect("COUNT(ph.id)", "totalRedemptions")
      .innerJoin("ph.reward", "reward")
      .where("ph.type = :type", { type: PointHistoryType.REDEEM })
      .groupBy("reward.id, reward.title")
      .orderBy('"totalRedemptions"', "DESC")
      .limit(10)
      .getRawMany();

    const result = topRewards.map((r) => ({
      ...r,
      totalRedemptions: parseInt(r.totalRedemptions, 10) || 0,
    }));
    this.setCached(cacheKey, result, this.TTL_TOP);
    return result;
  }

  /**
   * Retrieves growth and activity chart data for the admin dashboard.
   * @param dto The filtering options (startDate, endDate).
   * @returns Chart data with labels and datasets.
   */
  async getGrowthActivityChart(
    dto: GrowthActivityChartDto,
  ): Promise<GrowthActivityResponseDto> {
    const cacheKey = `growth:${dto.startDate ?? "def"}:${dto.endDate ?? "def"}`;
    const cached = this.getCached<GrowthActivityResponseDto>(cacheKey);
    if (cached) return cached;

    const startDate = dto.startDate
      ? moment(dto.startDate).startOf("day")
      : moment().subtract(30, "days").startOf("day");
    const endDate = dto.endDate
      ? moment(dto.endDate).endOf("day")
      : moment().endOf("day");

    const days = endDate.diff(startDate, "days") + 1;
    const labels: string[] = [];
    const registrations: number[] = [];
    const activities: number[] = [];

    // Initialize map for aggregation
    const dataMap = new Map<
      string,
      { registrations: number; activities: number }
    >();

    for (let i = 0; i < days; i++) {
      const date = startDate.clone().add(i, "days").format("YYYY-MM-DD");
      labels.push(date);
      dataMap.set(date, { registrations: 0, activities: 0 });
    }

    // Run the 6 independent GROUP BY queries in parallel (was 6 sequential awaits)
    const start = startDate.toDate();
    const end = endDate.toDate();
    const [
      newBusinesses,
      newParticipants,
      pointActivities,
      joinActivities,
      businessCampaignActivities,
      directCampaignActivities,
    ] = await Promise.all([
      this.businessRepository
        .createQueryBuilder("business")
        .select("TO_CHAR(business.created_at, 'YYYY-MM-DD')", "date")
        .addSelect("COUNT(business.id)", "count")
        .where("business.created_at BETWEEN :start AND :end", { start, end })
        .groupBy("TO_CHAR(business.created_at, 'YYYY-MM-DD')")
        .getRawMany(),
      this.participantRepository
        .createQueryBuilder("participant")
        .select("TO_CHAR(participant.created_at, 'YYYY-MM-DD')", "date")
        .addSelect("COUNT(participant.id)", "count")
        .where("participant.created_at BETWEEN :start AND :end", { start, end })
        .groupBy("TO_CHAR(participant.created_at, 'YYYY-MM-DD')")
        .getRawMany(),
      this.pointHistoryRepository
        .createQueryBuilder("ph")
        .select("TO_CHAR(ph.created_at, 'YYYY-MM-DD')", "date")
        .addSelect("COUNT(ph.id)", "count")
        .where("ph.created_at BETWEEN :start AND :end", { start, end })
        .andWhere("ph.type IN (:...types)", {
          types: [PointHistoryType.EARN, PointHistoryType.REDEEM],
        })
        .groupBy("TO_CHAR(ph.created_at, 'YYYY-MM-DD')")
        .getRawMany(),
      this.participantCampaignBalanceRepository
        .createQueryBuilder("pcb")
        .select("TO_CHAR(pcb.created_at, 'YYYY-MM-DD')", "date")
        .addSelect("COUNT(pcb.id)", "count")
        .where("pcb.created_at BETWEEN :start AND :end", { start, end })
        .groupBy("TO_CHAR(pcb.created_at, 'YYYY-MM-DD')")
        .getRawMany(),
      this.businessCampaignRepository
        .createQueryBuilder("bc")
        .select("TO_CHAR(bc.created_at, 'YYYY-MM-DD')", "date")
        .addSelect("COUNT(bc.id)", "count")
        .where("bc.created_at BETWEEN :start AND :end", { start, end })
        .groupBy("TO_CHAR(bc.created_at, 'YYYY-MM-DD')")
        .getRawMany(),
      this.campaignRepository
        .createQueryBuilder("c")
        .select("TO_CHAR(c.created_at, 'YYYY-MM-DD')", "date")
        .addSelect("COUNT(c.id)", "count")
        .where("c.created_at BETWEEN :start AND :end", { start, end })
        .andWhere("c.business_id IS NOT NULL")
        .groupBy("TO_CHAR(c.created_at, 'YYYY-MM-DD')")
        .getRawMany(),
    ]);

    const bump = (item: any, field: "registrations" | "activities") => {
      if (dataMap.has(item.date)) {
        dataMap.get(item.date)![field] += parseInt(item.count, 10);
      }
    };
    newBusinesses.forEach((i) => bump(i, "registrations"));
    newParticipants.forEach((i) => bump(i, "registrations"));
    pointActivities.forEach((i) => bump(i, "activities"));
    joinActivities.forEach((i) => bump(i, "activities"));
    businessCampaignActivities.forEach((i) => bump(i, "activities"));
    directCampaignActivities.forEach((i) => bump(i, "activities"));

    // Prepare final arrays
    labels.forEach((date) => {
      const data = dataMap.get(date);
      registrations.push(data!.registrations);
      activities.push(data!.activities);
    });

    const result = {
      labels,
      registrations,
      activities,
    };
    this.setCached(cacheKey, result, this.TTL_GROWTH);
    return result;
  }

  /**
   * Retrieves a paginated log of point transactions (earnings and redemptions).
   * @param paginationDto The pagination options.
   * @returns A promise that resolves to a paginated list of point logs.
   */
  async getPointLogs(
    filterDto: PointLogFilterDto,
  ): Promise<PointLogResponseDto> {
    const {
      page,
      limit,
      businessId,
      campaignId,
      participantId,
      transactionType,
      startDate,
      endDate,
    } = filterDto;
    const skip = (page - 1) * limit;

    const queryBuilder = this.pointHistoryRepository
      .createQueryBuilder("ph")
      .leftJoin("ph.participant", "participant")
      .select([
        "ph.id",
        "ph.points",
        "ph.type",
        "ph.created_at",
        "participant.name",
        "participant.email",
      ])
      .orderBy("ph.created_at", "DESC")
      .skip(skip)
      .take(limit);

    if (businessId) {
      queryBuilder.andWhere("ph.business_id = :businessId", { businessId });
    }

    if (campaignId) {
      queryBuilder.andWhere("ph.campaign_id = :campaignId", { campaignId });
    }

    if (participantId) {
      queryBuilder.andWhere("ph.participant_id = :participantId", {
        participantId,
      });
    }

    if (transactionType) {
      queryBuilder.andWhere("ph.type = :transactionType", { transactionType });
    }

    if (startDate) {
      queryBuilder.andWhere("ph.created_at >= :startDate", {
        startDate: moment(startDate).startOf("day").toDate(),
      });
    }

    if (endDate) {
      queryBuilder.andWhere("ph.created_at <= :endDate", {
        endDate: moment(endDate).endOf("day").toDate(),
      });
    }

    const [results, total] = await queryBuilder.getManyAndCount();

    const data: PointLogItemDto[] = results.map((log) => {
      const description = log.type.toString();
      const type = String(log.type);

      return {
        name: log.participant ? log.participant.name : "Unknown",
        email: log.participant ? log.participant.email : "Unknown",
        points: log.points,
        description: description,
        type: type,
        date: log.created_at,
      };
    });

    return {
      data,
      total,
      page,
      limit,
    };
  }
}
