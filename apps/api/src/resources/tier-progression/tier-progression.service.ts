import {
  Injectable,
  Logger,
  Inject,
  forwardRef,
} from "@nestjs/common";
import { PlanSubscriptionService } from "../plans/services/plan-subscription.service";
import { CampaignService } from "../campaign/campaign.service";
import { RewardsService } from "../rewards/services/rewards.service";
import { PointHistoryService } from "../analytics/services/point-history.service";
import { PlanSubscriptionStatus } from "../plans/entities/plan-subscription.entity";
import { InjectRepository } from "@nestjs/typeorm";
import { Business } from "../business/entities/business.entity";
import { Repository } from "typeorm";

@Injectable()
export class TierProgressionService {
  private readonly logger = new Logger(TierProgressionService.name);

  constructor(
    private readonly planSubscriptionService: PlanSubscriptionService,
    @Inject(forwardRef(() => CampaignService))
    private readonly campaignService: CampaignService,
    @Inject(forwardRef(() => RewardsService))
    private readonly rewardsService: RewardsService,
    private readonly pointHistoryService: PointHistoryService,
    @InjectRepository(Business)
    private readonly businessRepository: Repository<Business>,
  ) {}

  async checkAndPromote(userId: string): Promise<void> {
    const subscription =
      await this.planSubscriptionService.findActiveSubscription(userId);
    if (
      !subscription ||
      subscription.status !== PlanSubscriptionStatus.ACTIVE
    ) {
      return;
    }
  }

  async getDetailedProgression(userId: string) {
    const subscription =
      await this.planSubscriptionService.findActiveSubscription(userId);
    const currentLevel =
      subscription?.planVariant?.tierLevel?.name || "Standard";

    return {
      tierName: subscription?.planVariant?.plan?.name || "Free",
      currentLevel,
      metrics: {
        campaignsCreated: 0,
        rewardsCreated: 0,
        pointsUsed: 0,
        customerScans: 0,
        participants: 0,
        purchases: 0,
        tasksCompleted: 0,
        daysActive: 0,
        profileCompleted: true,
        kycVerified: false,
        customerInteractions: 0,
        reviews: 0,
        redeemedRewards: 0,
        revenue: 0,
      },
      nextLevels: [],
    };
  }
}
