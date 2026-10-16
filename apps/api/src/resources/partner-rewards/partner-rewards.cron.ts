import { Injectable, Logger } from "@nestjs/common";
import { Cron, CronExpression } from "@nestjs/schedule";
import { RewardIssuanceService } from "./services/reward-issuance.service";

/**
 * Scheduled maintenance for the partner rewards lifecycle: expire due issuances
 * and notify their issuing partner over the service mesh.
 */
@Injectable()
export class PartnerRewardsCron {
  private readonly logger = new Logger(PartnerRewardsCron.name);

  constructor(private readonly issuanceService: RewardIssuanceService) {}

  @Cron(CronExpression.EVERY_MINUTE)
  async handle(): Promise<void> {
    try {
      const expired = await this.issuanceService.expireDue();
      if (expired > 0) {
        this.logger.log(`Marked ${expired} partner issuance(s) as expired`);
      }
    } catch (err) {
      this.logger.error(
        `Issuance expiry sweep failed: ${(err as Error).message}`,
      );
    }
  }
}
