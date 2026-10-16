import { Injectable, NotFoundException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { DataSource, Repository } from "typeorm";
import { Participant } from "../../participant/entities/participant.entity";
import {
  PointHistory,
  PointHistoryType,
} from "../../participant-campaign-balance/entities/point-history.entity";
import { Reward } from "../../rewards/entities/reward.entity";

export interface AwardPointsResult {
  awarded: boolean;
  points: number;
}

/**
 * Credits loyalty points to a participant for partner-issued POINT_OFFER
 * rewards. Idempotent on `actionKey` so replayed issues never double-credit.
 */
@Injectable()
export class PartnerPointsGateway {
  constructor(
    @InjectRepository(PointHistory)
    private readonly pointHistoryRepository: Repository<PointHistory>,
    private readonly dataSource: DataSource,
  ) {}

  async awardPoints(params: {
    participantId: string;
    points: number;
    actionKey: string;
    description?: string;
    reward?: Reward | null;
  }): Promise<AwardPointsResult> {
    const { participantId, points, actionKey, description, reward } = params;

    if (!points || points <= 0) {
      return { awarded: false, points: 0 };
    }

    return this.dataSource.transaction(async (manager) => {
      const existing = await manager.findOne(PointHistory, {
        where: { actionKey },
      });
      if (existing) {
        return { awarded: false, points: Number(existing.points) || 0 };
      }

      const participant = await manager.findOne(Participant, {
        where: { id: participantId },
      });
      if (!participant) {
        throw new NotFoundException(
          `Participant ${participantId} not found for points credit`,
        );
      }

      const history = manager.create(PointHistory, {
        type: PointHistoryType.EARN,
        points,
        participant,
        reward: reward ?? null,
        actionKey,
        description: description || "Partner reward issued",
      } as any);
      await manager.save(history);

      participant.global_total_points =
        (participant.global_total_points || 0) + points;
      await manager.save(participant);

      return { awarded: true, points };
    });
  }

  async findExisting(actionKey: string): Promise<PointHistory | null> {
    return this.pointHistoryRepository.findOne({ where: { actionKey } });
  }
}
