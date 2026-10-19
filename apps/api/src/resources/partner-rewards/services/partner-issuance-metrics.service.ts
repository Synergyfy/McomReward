import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { RewardIssuance } from "../entities/reward-issuance.entity";
import { BusinessReward } from "../../rewards/entities/business-reward.entity";
import { RewardIssuanceStatus } from "../enums/partner-reward.enums";

/**
 * Issuance statuses that represent a live grant of a reward to a recipient.
 * A revoked / expired / failed issuance is excluded so it never inflates the
 * business's redemption or customer counts.
 */
export const LIVE_ISSUANCE_STATUSES: RewardIssuanceStatus[] = [
  RewardIssuanceStatus.ISSUED,
  RewardIssuanceStatus.RESERVED,
  RewardIssuanceStatus.REDEEMED,
];

export interface IssuanceScope {
  /** Restrict to issuances of every reward owned by this business. */
  businessId?: string;
  /** Restrict to issuances of these specific business rewards. */
  businessRewardIds?: string[];
  /** Inclusive lower bound on `created_at`. */
  from?: Date;
  /** Inclusive upper bound on `created_at`. */
  to?: Date;
}

export interface IssuanceSummary {
  /** Number of live grants. */
  count: number;
  /** Total points credited by point-offer grants. */
  points: number;
  /** De-duplicated recipient identity keys. */
  recipientKeys: string[];
  /** Per-day breakdown, oldest → newest. */
  byDate: { date: string; count: number; points: number }[];
}

export interface IssuanceCount {
  count: number;
  points: number;
}

/**
 * Single source of truth for "rewards issued to people through an ecosystem
 * partner" (e.g. FundOrDonate).
 *
 * Partner rewards are recorded in `reward_issuance` and — unlike in-app
 * redemptions — never produce a `point_history` row. Every analytics/counting
 * surface that should recognise partner grants goes through this service so
 * the attribution + status rules stay identical everywhere.
 *
 * Attribution: an issuance belongs to a business when its `business_reward_id`
 * points at a reward that business owns.
 */
@Injectable()
export class PartnerIssuanceMetricsService {
  constructor(
    @InjectRepository(RewardIssuance)
    private readonly issuanceRepository: Repository<RewardIssuance>,
    @InjectRepository(BusinessReward)
    private readonly businessRewardRepository: Repository<BusinessReward>,
  ) {}

  /** All business-reward ids owned by a business. */
  async businessRewardIdsFor(businessId: string): Promise<string[]> {
    const rewards = await this.businessRewardRepository.find({
      where: { business: { id: businessId } },
      select: ["id"],
    });
    return rewards.map((r) => r.id);
  }

  /** Aggregate live partner grants within a scope. */
  async getSummary(scope: IssuanceScope): Promise<IssuanceSummary> {
    const businessRewardIds =
      scope.businessRewardIds ??
      (scope.businessId ? await this.businessRewardIdsFor(scope.businessId) : []);

    if (businessRewardIds.length === 0) {
      return { count: 0, points: 0, recipientKeys: [], byDate: [] };
    }

    const qb = this.issuanceRepository
      .createQueryBuilder("issuance")
      .where("issuance.business_reward_id IN (:...ids)", {
        ids: businessRewardIds,
      })
      .andWhere("issuance.status IN (:...statuses)", {
        statuses: LIVE_ISSUANCE_STATUSES,
      });

    if (scope.from) {
      qb.andWhere("issuance.created_at >= :from", { from: scope.from });
    }
    if (scope.to) {
      qb.andWhere("issuance.created_at <= :to", { to: scope.to });
    }

    const rows = await qb.getMany();

    const recipientKeys = new Set<string>();
    const byDate = new Map<
      string,
      { date: string; count: number; points: number }
    >();
    let points = 0;

    for (const row of rows) {
      const rowPoints = Number(row.points_awarded) || 0;
      points += rowPoints;
      recipientKeys.add(this.recipientKey(row));

      const date = new Date(row.created_at).toISOString().split("T")[0];
      const entry = byDate.get(date) ?? { date, count: 0, points: 0 };
      entry.count += 1;
      entry.points += rowPoints;
      byDate.set(date, entry);
    }

    return {
      count: rows.length,
      points,
      recipientKeys: [...recipientKeys],
      byDate: [...byDate.values()].sort((a, b) =>
        a.date < b.date ? -1 : a.date > b.date ? 1 : 0,
      ),
    };
  }

  /** Live grant counts (and points) keyed by business-reward id. */
  async getCountsByBusinessReward(
    businessRewardIds: string[],
  ): Promise<Map<string, IssuanceCount>> {
    const result = new Map<string, IssuanceCount>();
    if (businessRewardIds.length === 0) return result;

    const rows = await this.issuanceRepository
      .createQueryBuilder("issuance")
      .select("issuance.business_reward_id", "businessRewardId")
      .addSelect("COUNT(issuance.id)", "count")
      .addSelect("COALESCE(SUM(issuance.points_awarded), 0)", "points")
      .where("issuance.business_reward_id IN (:...ids)", {
        ids: businessRewardIds,
      })
      .andWhere("issuance.status IN (:...statuses)", {
        statuses: LIVE_ISSUANCE_STATUSES,
      })
      .groupBy("issuance.business_reward_id")
      .getRawMany<{ businessRewardId: string; count: string; points: string }>();

    for (const row of rows) {
      result.set(row.businessRewardId, {
        count: parseInt(row.count, 10) || 0,
        points: parseInt(row.points, 10) || 0,
      });
    }
    return result;
  }

  /**
   * Live grants for the given business rewards, with their total reward value.
   * Used by the mall reward stats, which report value as well as counts.
   */
  async getValueByBusinessReward(
    businessRewardIds: string[],
  ): Promise<Map<string, { count: number; value: number }>> {
    const result = new Map<string, { count: number; value: number }>();
    if (businessRewardIds.length === 0) return result;

    const rows = await this.issuanceRepository
      .createQueryBuilder("issuance")
      .select("issuance.business_reward_id", "businessRewardId")
      .addSelect("COUNT(issuance.id)", "count")
      .addSelect("COALESCE(SUM(issuance.value), 0)", "value")
      .where("issuance.business_reward_id IN (:...ids)", {
        ids: businessRewardIds,
      })
      .andWhere("issuance.status IN (:...statuses)", {
        statuses: LIVE_ISSUANCE_STATUSES,
      })
      .groupBy("issuance.business_reward_id")
      .getRawMany<{ businessRewardId: string; count: string; value: string }>();

    for (const row of rows) {
      result.set(row.businessRewardId, {
        count: parseInt(row.count, 10) || 0,
        value: Number(row.value) || 0,
      });
    }
    return result;
  }

  /** Platform-wide totals across every business (admin/global stats). */
  async getGlobalSummary(): Promise<IssuanceCount> {
    const row = await this.issuanceRepository
      .createQueryBuilder("issuance")
      .select("COUNT(issuance.id)", "count")
      .addSelect("COALESCE(SUM(issuance.points_awarded), 0)", "points")
      .where("issuance.status IN (:...statuses)", {
        statuses: LIVE_ISSUANCE_STATUSES,
      })
      .getRawOne<{ count: string; points: string }>();

    return {
      count: parseInt(row?.count ?? "0", 10) || 0,
      points: parseInt(row?.points ?? "0", 10) || 0,
    };
  }

  /**
   * Stable key identifying a grant's recipient, used to de-duplicate people
   * across partner grants and in-app redemptions.
   */
  private recipientKey(issuance: RewardIssuance): string {
    return (
      issuance.recipient_user_id ||
      issuance.recipient_mcom_user_id ||
      issuance.recipient_email?.toLowerCase() ||
      issuance.id
    );
  }
}
